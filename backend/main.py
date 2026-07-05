"""
FaceBook (tên nội bộ: Face People App) - Backend FastAPI.

Pipeline:
  1. Detection   -> face_engine.py (RetinaFace qua InsightFace)
  2. Alignment   -> tự động bên trong InsightFace
  3. Embedding   -> face_engine.py (ArcFace, vector 512 chiều)
  4. Clustering  -> clustering.py (incremental centroid-match + DBSCAN)
  5. Feedback    -> API merge / split / rename / feedback-loop bên dưới
"""
import os
import platform
import string
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

import db
import utils
import clustering
import organize
from face_engine import get_engine

BASE_DIR = Path(__file__).parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"
THUMBS_DIR = db.THUMBS_DIR

app = FastAPI(title="Face People App")

# ---------------------------------------------------------------------------
# Trạng thái quét (để frontend poll tiến độ)
# ---------------------------------------------------------------------------
SCAN_STATE = {
    "status": "idle",       # idle | scanning | clustering | done | error
    "processed": 0,
    "total": 0,
    "message": "",
    "gpu_active": None,
    "failed": 0,
    "errors": [],
}
SCAN_LOCK = threading.Lock()


# ---------------------------------------------------------------------------
# Trạng thái recluster (auto-merge chạy nền, frontend poll tiến độ)
# ---------------------------------------------------------------------------
RECLUSTER_STATE = {
    "status": "idle",  # idle | running | done | error | cancelling | cancelled
    "message": "",
    "merged_count": 0,
    "skipped_named_conflicts": 0,
    "logs": [],
    "cancel_requested": False,
    "started_at": None,
    "finished_at": None,
}
RECLUSTER_LOCK = threading.Lock()


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def _append_recluster_log(message: str):
    RECLUSTER_STATE["logs"].append({"at": _now_iso(), "message": message})
    RECLUSTER_STATE["logs"] = RECLUSTER_STATE["logs"][-100:]


class ScanRequest(BaseModel):
    folder: str
    recursive: bool = True
    use_gpu: bool = True


def _do_scan(folder: str, recursive: bool, use_gpu: bool):
    conn = db.get_conn()
    try:
        scan_root = str(Path(folder).resolve())
        paths = utils.list_images(folder, recursive=recursive)
        total = len(paths)
        with SCAN_LOCK:
            SCAN_STATE.update(total=total, message="Đang tải model nhận diện khuôn mặt...")

        engine = get_engine(prefer_gpu=use_gpu)
        with SCAN_LOCK:
            SCAN_STATE["gpu_active"] = engine.gpu_active

        for i, path in enumerate(paths):
            try:
                bgr, pil_img = utils.load_image_bgr(path)
                w, h = pil_img.size
                mtime = os.path.getmtime(path)
                try:
                    rel_path = os.path.relpath(path, scan_root)
                    if rel_path.startswith(".."):
                        rel_path = os.path.basename(path)
                except ValueError:
                    rel_path = os.path.basename(path)
                image_id, changed = db.upsert_image(
                    conn, path, Path(path).name, w, h, mtime,
                    scan_root=scan_root, rel_path=rel_path,
                )

                if changed:
                    faces = engine.detect_and_embed(bgr)
                    for f in faces:
                        db.add_face(conn, image_id, f["bbox"], f["det_score"], f["embedding"])

                    thumb_path = THUMBS_DIR / f"img_{image_id}.jpg"
                    if not thumb_path.exists() or changed:
                        thumb = utils.make_thumbnail(pil_img)
                        utils.save_jpeg(thumb, str(thumb_path))

                    for f_row in db.get_faces_for_image(conn, image_id):
                        face_thumb_path = THUMBS_DIR / f"face_{f_row['id']}.jpg"
                        if not face_thumb_path.exists():
                            bbox = [f_row["bbox_x1"], f_row["bbox_y1"], f_row["bbox_x2"], f_row["bbox_y2"]]
                            crop = utils.crop_face(pil_img, bbox)
                            utils.save_jpeg(crop, str(face_thumb_path))
            except Exception as e:
                error_message = str(e)
                print(f"[scan] Lỗi ở ảnh {path}: {error_message}")
                with SCAN_LOCK:
                    SCAN_STATE["failed"] += 1
                    SCAN_STATE["errors"].append({"path": path, "error": error_message})
                    SCAN_STATE["errors"] = SCAN_STATE["errors"][-20:]

            with SCAN_LOCK:
                SCAN_STATE["processed"] = i + 1
                SCAN_STATE["message"] = f"Đang xử lý ảnh {i + 1}/{total}"

        with SCAN_LOCK:
            SCAN_STATE.update(status="clustering", message="Đang gom nhóm theo người...")

        def _progress(done, tot, msg):
            with SCAN_LOCK:
                SCAN_STATE["message"] = f"{msg} ({done}/{tot})"

        result = clustering.run_incremental_clustering(conn, progress_cb=_progress)

        with SCAN_LOCK:
            failed = SCAN_STATE["failed"]
            done_prefix = f"Hoàn tất với {failed} ảnh lỗi" if failed else "Hoàn tất"
            SCAN_STATE.update(
                status="done",
                message=f"{done_prefix}. {result['new_persons']} người mới, "
                         f"{result['assigned_existing']} khuôn mặt khớp người đã biết.",
            )
    except Exception as e:
        with SCAN_LOCK:
            SCAN_STATE.update(status="error", message=str(e))
        print(f"[scan] Lỗi tổng quát: {e}")
    finally:
        conn.close()


@app.post("/api/scan")
def start_scan(req: ScanRequest):
    with SCAN_LOCK:
        if SCAN_STATE["status"] in ("scanning", "clustering"):
            raise HTTPException(400, "Đang có một tiến trình quét khác chạy.")
        SCAN_STATE.update(
            status="scanning", processed=0, total=0,
            message="Đang tìm ảnh...", gpu_active=None,
            failed=0, errors=[],
        )
    t = threading.Thread(target=_do_scan, args=(req.folder, req.recursive, req.use_gpu), daemon=True)
    t.start()
    return {"started": True}


@app.get("/api/scan/status")
def scan_status():
    with SCAN_LOCK:
        return dict(SCAN_STATE)


# ---------------------------------------------------------------------------
# Folder browser (chọn thư mục qua dialog web, vì input[type=file] của trình
# duyệt không cho lấy đường dẫn tuyệt đối trên máy -> backend tự liệt kê thư
# mục ngay trên máy đang chạy server, vì đây là app local).
# ---------------------------------------------------------------------------

@app.get("/api/browse")
def api_browse(path: str = ""):
    is_windows = platform.system() == "Windows"

    if not path:
        if is_windows:
            drives = [f"{d}:\\" for d in string.ascii_uppercase if os.path.exists(f"{d}:\\")]
            return {
                "current_path": "",
                "parent_path": None,
                "directories": [{"name": d, "path": d} for d in drives],
            }
        path = os.path.expanduser("~")

    path = os.path.abspath(path)
    if not os.path.isdir(path):
        raise HTTPException(400, "Đường dẫn không hợp lệ hoặc không tồn tại")

    entries = []
    try:
        for entry in sorted(os.scandir(path), key=lambda e: e.name.lower()):
            try:
                if entry.is_dir(follow_symlinks=False) and not entry.name.startswith("."):
                    entries.append({"name": entry.name, "path": os.path.join(path, entry.name)})
            except (PermissionError, OSError):
                continue
    except (PermissionError, OSError):
        pass

    stripped = path.rstrip("/\\")
    parent = os.path.dirname(stripped)
    is_root = parent == stripped or (is_windows and len(stripped) <= 2)

    return {
        "current_path": path,
        "parent_path": None if is_root else (parent or "/"),
        "directories": entries,
    }


# ---------------------------------------------------------------------------
# Persons (People view)
# ---------------------------------------------------------------------------

@app.get("/api/persons")
def api_list_persons():
    conn = db.get_conn()
    try:
        persons = db.list_persons(conn)
        return [
            {
                "id": p["id"],
                "name": p["name"],
                "face_count": p["face_count"],
                "photo_count": p["photo_count"],
                "representative_face_id": p["representative_face_id"],
            }
            for p in persons
        ]
    finally:
        conn.close()


@app.get("/api/persons/stats")
def api_person_stats():
    conn = db.get_conn()
    try:
        return db.get_person_stats(conn)
    finally:
        conn.close()


@app.get("/api/persons/{person_id}/photos")
def api_person_photos(person_id: int):
    conn = db.get_conn()
    try:
        person = db.get_person(conn, person_id)
        if not person:
            raise HTTPException(404, "Không tìm thấy người này")
        images = db.get_images_for_person(conn, person_id)
        return [
            {"id": img["id"], "filename": img["filename"], "width": img["width"], "height": img["height"]}
            for img in images
        ]
    finally:
        conn.close()


@app.get("/api/persons/{person_id}/faces")
def api_person_faces(person_id: int):
    conn = db.get_conn()
    try:
        faces = db.get_faces_for_person(conn, person_id)
        return [
            {"id": f["id"], "image_id": f["image_id"], "det_score": f["det_score"]}
            for f in faces
        ]
    finally:
        conn.close()


class RenameRequest(BaseModel):
    name: str


@app.put("/api/persons/{person_id}")
def api_rename_person(person_id: int, req: RenameRequest):
    conn = db.get_conn()
    try:
        if not db.get_person(conn, person_id):
            raise HTTPException(404, "Không tìm thấy người này")
        db.update_person_name(conn, person_id, req.name.strip())
        return {"ok": True}
    finally:
        conn.close()


class MergeRequest(BaseModel):
    source_id: int
    target_id: int


@app.post("/api/persons/merge")
def api_merge_persons(req: MergeRequest):
    conn = db.get_conn()
    try:
        if not db.get_person(conn, req.source_id) or not db.get_person(conn, req.target_id):
            raise HTTPException(404, "Không tìm thấy người cần gộp")
        clustering.merge_persons(conn, req.source_id, req.target_id)
        db.clear_rejected_pairs_for(conn, req.source_id)
        return {"ok": True}
    finally:
        conn.close()


@app.delete("/api/persons/{person_id}")
def api_delete_person(person_id: int, delete_faces: bool = False):
    conn = db.get_conn()
    try:
        if not db.get_person(conn, person_id):
            raise HTTPException(404, "Không tìm thấy người này")
        db.delete_person(conn, person_id, delete_faces=delete_faces)
        db.clear_rejected_pairs_for(conn, person_id)
        return {"ok": True}
    finally:
        conn.close()


class ReassignRequest(BaseModel):
    person_id: Optional[int] = None  # None = tách thành người mới


@app.post("/api/faces/{face_id}/reassign")
def api_reassign_face(face_id: int, req: ReassignRequest):
    conn = db.get_conn()
    try:
        face = db.get_face(conn, face_id)
        if not face:
            raise HTTPException(404, "Không tìm thấy khuôn mặt này")
        if req.person_id is None:
            new_pid = clustering.split_face_to_new_person(conn, face_id)
            return {"ok": True, "new_person_id": new_pid}
        else:
            if not db.get_person(conn, req.person_id):
                raise HTTPException(404, "Người đích không tồn tại")
            db.set_face_person(conn, face_id, req.person_id)
            db.cleanup_empty_persons(conn)
            return {"ok": True}
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Feedback Loop: gợi ý gộp người, hỏi từng cặp một
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Settings (thông số clustering có thể chỉnh qua UI) + Reclustering
# ---------------------------------------------------------------------------

@app.get("/api/settings")
def api_get_settings():
    conn = db.get_conn()
    try:
        return {
            "values": clustering.get_settings(conn),
            "ranges": clustering.SETTINGS_RANGES,
            "defaults": clustering.DEFAULT_SETTINGS,
        }
    finally:
        conn.close()


class SettingsUpdateRequest(BaseModel):
    sim_threshold: Optional[float] = None
    dbscan_eps: Optional[float] = None
    dbscan_min_samples: Optional[int] = None
    feedback_min_sim: Optional[float] = None


@app.put("/api/settings")
def api_update_settings(req: SettingsUpdateRequest):
    conn = db.get_conn()
    try:
        updates = {k: v for k, v in req.dict().items() if v is not None}
        new_settings = clustering.update_settings(conn, updates)
        return {"values": new_settings}
    finally:
        conn.close()


@app.delete("/api/settings")
def api_reset_settings():
    conn = db.get_conn()
    try:
        db.reset_settings(conn)
        return {"values": clustering.get_settings(conn)}
    finally:
        conn.close()


def _do_recluster():
    conn = db.get_conn()

    def _progress(event, message, **payload):
        with RECLUSTER_LOCK:
            RECLUSTER_STATE["message"] = message
            if "merged_count" in payload:
                RECLUSTER_STATE["merged_count"] = payload["merged_count"]
            if "skipped_named_conflicts" in payload:
                RECLUSTER_STATE["skipped_named_conflicts"] = payload["skipped_named_conflicts"]
            _append_recluster_log(message)

    def _should_cancel():
        with RECLUSTER_LOCK:
            requested = RECLUSTER_STATE["cancel_requested"]
            if requested and RECLUSTER_STATE["status"] == "running":
                RECLUSTER_STATE["status"] = "cancelling"
                RECLUSTER_STATE["message"] = "Đang dừng recluster ở checkpoint an toàn..."
                _append_recluster_log(RECLUSTER_STATE["message"])
            return requested

    try:
        result = clustering.auto_merge_confident_pairs(
            conn, progress_cb=_progress, should_cancel=_should_cancel
        )
        with RECLUSTER_LOCK:
            RECLUSTER_STATE["merged_count"] = result["merged_count"]
            RECLUSTER_STATE["skipped_named_conflicts"] = result["skipped_named_conflicts"]
            RECLUSTER_STATE["finished_at"] = _now_iso()
            if result.get("cancelled") or RECLUSTER_STATE["cancel_requested"]:
                RECLUSTER_STATE["status"] = "cancelled"
                RECLUSTER_STATE["message"] = "Đã huỷ recluster."
            else:
                RECLUSTER_STATE["status"] = "done"
                RECLUSTER_STATE["message"] = (
                    f"Hoàn tất recluster: đã gộp {result['merged_count']} cặp, "
                    f"bỏ qua {result['skipped_named_conflicts']} xung đột tên."
                )
            _append_recluster_log(RECLUSTER_STATE["message"])
    except Exception as e:
        with RECLUSTER_LOCK:
            RECLUSTER_STATE.update(status="error", message=str(e), finished_at=_now_iso())
            _append_recluster_log(f"Lỗi recluster: {e}")
        print(f"[recluster] Lỗi: {e}")
    finally:
        conn.close()


@app.post("/api/recluster/start")
def api_recluster_start():
    with RECLUSTER_LOCK:
        if RECLUSTER_STATE["status"] in ("running", "cancelling"):
            raise HTTPException(400, "Đang có một tiến trình recluster khác chạy.")
        RECLUSTER_STATE.update(
            status="running",
            message="Đang khởi động recluster...",
            merged_count=0,
            skipped_named_conflicts=0,
            logs=[],
            cancel_requested=False,
            started_at=_now_iso(),
            finished_at=None,
        )
        _append_recluster_log(RECLUSTER_STATE["message"])
    t = threading.Thread(target=_do_recluster, daemon=True)
    t.start()
    return {"started": True}


@app.get("/api/recluster/status")
def api_recluster_status():
    with RECLUSTER_LOCK:
        state = dict(RECLUSTER_STATE)
        state["logs"] = RECLUSTER_STATE["logs"][-100:]
        return state


@app.post("/api/recluster/cancel")
def api_recluster_cancel():
    with RECLUSTER_LOCK:
        if RECLUSTER_STATE["status"] in ("running", "cancelling"):
            RECLUSTER_STATE["cancel_requested"] = True
            if RECLUSTER_STATE["status"] == "running":
                RECLUSTER_STATE["status"] = "cancelling"
            RECLUSTER_STATE["message"] = "Đã yêu cầu huỷ recluster; sẽ dừng ở checkpoint an toàn."
            _append_recluster_log(RECLUSTER_STATE["message"])
        return dict(RECLUSTER_STATE)


@app.post("/api/recluster")
def api_recluster():
    return api_recluster_start()


@app.get("/api/feedback/next")
def api_feedback_next():
    conn = db.get_conn()
    try:
        suggestion = clustering.find_next_merge_suggestion(conn)
        if not suggestion:
            return {"done": True}

        def _fmt(p):
            return {
                "id": p["id"],
                "name": p["name"],
                "face_count": p["face_count"],
                "representative_face_id": p["representative_face_id"],
            }

        return {
            "done": False,
            "person_a": _fmt(suggestion["person_a"]),
            "person_b": _fmt(suggestion["person_b"]),
            "similarity": suggestion["similarity"],
        }
    finally:
        conn.close()


class FeedbackDecision(BaseModel):
    person_a_id: int
    person_b_id: int
    decision: str  # "merge" | "reject"


@app.post("/api/feedback/decide")
def api_feedback_decide(req: FeedbackDecision):
    conn = db.get_conn()
    try:
        if req.decision == "merge":
            if not db.get_person(conn, req.person_a_id) or not db.get_person(conn, req.person_b_id):
                raise HTTPException(404, "Người không tồn tại")
            # Gộp person nhỏ hơn vào person lớn hơn (giữ tên nếu có 1 bên đã đặt)
            a = db.get_person(conn, req.person_a_id)
            b = db.get_person(conn, req.person_b_id)
            # Ưu tiên giữ lại person đã có TÊN làm đích gộp; nếu cả 2 đều có
            # tên hoặc đều chưa có tên thì mặc định giữ person A.
            if b["name"] and not a["name"]:
                target, source = b, a
            else:
                target, source = a, b
            clustering.merge_persons(conn, source["id"], target["id"])
            db.clear_rejected_pairs_for(conn, source["id"])
        elif req.decision == "reject":
            db.add_rejected_pair(conn, req.person_a_id, req.person_b_id)
        else:
            raise HTTPException(400, "decision phải là 'merge' hoặc 'reject'")
        return {"ok": True}
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Organize: tạo thư mục theo tên và copy/move ảnh vào
# ---------------------------------------------------------------------------

@app.get("/api/organize/preview")
def api_organize_preview():
    conn = db.get_conn()
    try:
        plan = organize.build_plan(conn)
        return {
            "total_photos": len(plan),
            "by_person": organize.summarize_plan(plan),
        }
    finally:
        conn.close()


class OrganizeRequest(BaseModel):
    mode: str  # "copy" | "move"


@app.post("/api/organize/execute")
def api_organize_execute(req: OrganizeRequest):
    if req.mode not in ("copy", "move"):
        raise HTTPException(400, "mode phải là 'copy' hoặc 'move'")
    conn = db.get_conn()
    try:
        plan = organize.build_plan(conn)
        result = organize.execute_plan(conn, plan, mode=req.mode)
        return result
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Images (Photos view)
# ---------------------------------------------------------------------------

@app.get("/api/images")
def api_list_images():
    conn = db.get_conn()
    try:
        images = db.list_all_images(conn)
        return [
            {"id": img["id"], "filename": img["filename"], "width": img["width"], "height": img["height"]}
            for img in images
        ]
    finally:
        conn.close()


@app.get("/api/images/{image_id}/faces")
def api_image_faces(image_id: int):
    conn = db.get_conn()
    try:
        faces = db.get_faces_for_image(conn, image_id)
        return [
            {
                "id": f["id"],
                "person_id": f["person_id"],
                "bbox": [f["bbox_x1"], f["bbox_y1"], f["bbox_x2"], f["bbox_y2"]],
            }
            for f in faces
        ]
    finally:
        conn.close()


@app.get("/api/images/{image_id}/thumb")
def api_image_thumb(image_id: int):
    p = THUMBS_DIR / f"img_{image_id}.jpg"
    if not p.exists():
        raise HTTPException(404, "Chưa có thumbnail")
    return FileResponse(p)


@app.get("/api/images/{image_id}/file")
def api_image_file(image_id: int):
    conn = db.get_conn()
    try:
        img = db.get_image(conn, image_id)
        if not img:
            raise HTTPException(404, "Không tìm thấy ảnh")
        path = Path(img["path"])
        if not path.exists():
            raise HTTPException(404, "File ảnh đã bị di chuyển hoặc xoá")
        # Với HEIC, trình duyệt không hiển thị được trực tiếp -> convert nhanh sang JPEG tạm
        if path.suffix.lower() in (".heic", ".heif"):
            tmp_path = THUMBS_DIR / f"full_{image_id}.jpg"
            if not tmp_path.exists():
                _, pil_img = utils.load_image_bgr(str(path))
                utils.save_jpeg(pil_img, str(tmp_path), quality=92)
            return FileResponse(tmp_path)
        return FileResponse(path)
    finally:
        conn.close()


@app.get("/api/faces/{face_id}/thumb")
def api_face_thumb(face_id: int):
    p = THUMBS_DIR / f"face_{face_id}.jpg"
    if not p.exists():
        raise HTTPException(404, "Chưa có thumbnail khuôn mặt")
    return FileResponse(p)


# ---------------------------------------------------------------------------
# Static frontend
# ---------------------------------------------------------------------------
app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")


@app.on_event("startup")
def _startup():
    db.init_db()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
