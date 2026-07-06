"""
Clustering: gom các khuôn mặt thành từng người (phần 4 trong pipeline).

Chiến lược "incremental clustering" - giống cách Google/Apple Photos xử lý
khi bạn thêm ảnh mới vào thư viện:

  1. Với mỗi khuôn mặt CHƯA có person_id:
     - Tính cosine similarity với "centroid" (vector trung bình) của từng
       person đã tồn tại.
     - Nếu similarity cao nhất >= ngưỡng sim_threshold -> gán vào person đó.
  2. Các khuôn mặt còn lại (không khớp ai) được đưa vào DBSCAN (cosine
     distance) để tự gom thành các person MỚI.
  3. Sau khi gán xong, mỗi person được chọn lại "representative_face"
     (khuôn mặt có det_score cao nhất) để hiển thị làm ảnh đại diện.

Toàn bộ thông số (sim_threshold, dbscan_eps, dbscan_min_samples,
feedback_min_sim) được lưu trong bảng `settings` và có thể chỉnh qua UI
(nút "Cài đặt") — không cần sửa code hay khởi động lại server.
"""
import json
import numpy as np
from sklearn.cluster import DBSCAN

import db

# Giá trị mặc định (dùng khi chưa có gì trong bảng settings)
DEFAULT_SETTINGS = {
    "sim_threshold": 0.42,       # ngưỡng cosine similarity để coi là "cùng người đã biết"
    "dbscan_eps": 0.40,          # cosine distance = 1 - similarity
    "dbscan_min_samples": 2,     # cần >=2 mặt giống nhau mới tự tạo cụm
    "feedback_min_sim": 0.20,    # dưới ngưỡng này Feedback Loop không đáng hỏi
}

SETTINGS_RANGES = {
    "sim_threshold": (0.05, 0.95),
    "dbscan_eps": (0.05, 0.95),
    "dbscan_min_samples": (1, 10),
    "feedback_min_sim": (0.05, 0.95),
}


def get_settings(conn) -> dict:
    raw = db.get_all_settings(conn)
    settings = dict(DEFAULT_SETTINGS)
    for key, default_val in DEFAULT_SETTINGS.items():
        if key in raw:
            try:
                settings[key] = type(default_val)(raw[key])
            except (TypeError, ValueError):
                pass
    return settings


def update_settings(conn, updates: dict) -> dict:
    """Validate & lưu 1 phần hoặc toàn bộ thông số. Trả về settings mới."""
    for key, value in updates.items():
        if key not in DEFAULT_SETTINGS:
            continue
        lo, hi = SETTINGS_RANGES[key]
        try:
            value = type(DEFAULT_SETTINGS[key])(value)
        except (TypeError, ValueError):
            continue
        value = max(lo, min(hi, value))
        db.set_setting(conn, key, value)
    return get_settings(conn)


def _to_vec(embedding_json: str) -> np.ndarray:
    v = np.array(json.loads(embedding_json), dtype=np.float32)
    n = np.linalg.norm(v)
    return v / n if n > 0 else v


def _person_centroid(conn, person_id) -> np.ndarray:
    faces = db.get_faces_for_person(conn, person_id)
    vecs = [_to_vec(f["embedding"]) for f in faces]
    centroid = np.mean(vecs, axis=0)
    n = np.linalg.norm(centroid)
    return centroid / n if n > 0 else centroid


def run_incremental_clustering(conn, progress_cb=None):
    """
    Chạy clustering cho toàn bộ face chưa gán person (dùng lúc quét ảnh mới).
    progress_cb(done, total, message) optional để báo tiến độ.
    """
    settings = get_settings(conn)
    sim_threshold = settings["sim_threshold"]
    dbscan_eps = settings["dbscan_eps"]
    dbscan_min_samples = int(settings["dbscan_min_samples"])

    new_faces = db.get_faces_without_person(conn)
    if not new_faces:
        return {"assigned_existing": 0, "new_persons": 0}

    existing_persons = db.list_persons(conn)
    centroids = {}
    for p in existing_persons:
        centroids[p["id"]] = _person_centroid(conn, p["id"])

    unmatched = []
    assigned_existing = 0
    total = len(new_faces)

    for idx, face in enumerate(new_faces):
        vec = _to_vec(face["embedding"])
        best_pid, best_sim = None, -1.0
        for pid, centroid in centroids.items():
            sim = float(np.dot(vec, centroid))
            if sim > best_sim:
                best_sim, best_pid = sim, pid

        if best_pid is not None and best_sim >= sim_threshold:
            db.set_face_person(conn, face["id"], best_pid, commit=False)
            assigned_existing += 1
            centroids[best_pid] = (centroids[best_pid] + vec)
            centroids[best_pid] /= np.linalg.norm(centroids[best_pid])
        else:
            unmatched.append(face)

        if progress_cb and idx % 10 == 0:
            progress_cb(idx, total, "Đang so khớp với người đã biết...")

    new_persons = 0
    if unmatched:
        vecs = np.stack([_to_vec(f["embedding"]) for f in unmatched])
        clustering_model = DBSCAN(eps=dbscan_eps, min_samples=dbscan_min_samples, metric="cosine")
        labels = clustering_model.fit_predict(vecs)

        label_to_person = {}
        for face, label in zip(unmatched, labels):
            if label == -1:
                pid = db.create_person(conn, commit=False)
                db.set_face_person(conn, face["id"], pid, commit=False)
                new_persons += 1
            else:
                if label not in label_to_person:
                    pid = db.create_person(conn, commit=False)
                    label_to_person[label] = pid
                    new_persons += 1
                db.set_face_person(conn, face["id"], label_to_person[label], commit=False)

    try:
        conn.commit()
    except Exception:
        conn.rollback()
        raise

    _refresh_representatives(conn)
    db.cleanup_empty_persons(conn)

    if progress_cb:
        progress_cb(total, total, "Hoàn tất gom nhóm")

    return {"assigned_existing": assigned_existing, "new_persons": new_persons}


def _refresh_representatives(conn):
    for p in db.list_persons(conn):
        faces = db.get_faces_for_person(conn, p["id"])
        if not faces:
            continue
        best = max(faces, key=lambda f: f["det_score"])
        db.set_person_representative(conn, p["id"], best["id"])


def merge_persons(conn, source_id, target_id):
    """Gộp source vào target: chuyển hết face, xoá source, cập nhật đại diện."""
    if source_id == target_id:
        return
    db.reassign_faces_person(conn, source_id, target_id)
    db.delete_person(conn, source_id, delete_faces=False)
    _refresh_representatives(conn)


def split_face_to_new_person(conn, face_id):
    """Tách 1 khuôn mặt bị gán sai ra thành 1 person mới (hoặc unknown)."""
    new_pid = db.create_person(conn, commit=False)
    db.set_face_person(conn, face_id, new_pid)
    _refresh_representatives(conn)
    db.cleanup_empty_persons(conn)
    return new_pid


def find_next_merge_suggestion(conn):
    """
    Feedback Loop: tìm cặp person có khả năng là CÙNG MỘT NGƯỜI cao nhất
    (dựa trên cosine similarity giữa centroid) mà:
      - chưa từng bị người dùng từ chối gộp (rejected_pairs)
      - similarity >= feedback_min_sim (đọc từ settings)

    Trả về dict {person_a, person_b, similarity} (person_a/b là sqlite Row)
    hoặc None nếu không còn cặp nào đáng hỏi.
    """
    settings = get_settings(conn)
    feedback_min_sim = settings["feedback_min_sim"]

    persons = db.list_persons(conn)
    if len(persons) < 2:
        return None

    centroids = {p["id"]: _person_centroid(conn, p["id"]) for p in persons}

    best = None
    for i in range(len(persons)):
        for j in range(i + 1, len(persons)):
            pa, pb = persons[i], persons[j]
            if db.is_pair_rejected(conn, pa["id"], pb["id"]):
                continue
            sim = float(np.dot(centroids[pa["id"]], centroids[pb["id"]]))
            if sim < feedback_min_sim:
                continue
            if best is None or sim > best["similarity"]:
                best = {"person_a": pa, "person_b": pb, "similarity": sim}

    return best


def auto_merge_confident_pairs(conn, progress_cb=None, should_cancel=None):
    """
    "Reclustering": tự động gộp các cặp person có độ giống >= sim_threshold
    hiện tại (đọc từ settings, sau khi bạn chỉnh trong UI).

    AN TOÀN: nếu CẢ HAI person trong 1 cặp đều đã được đặt tên, sẽ KHÔNG tự
    gộp (để không phá nhóm bạn đã xác nhận tên trước đó) — trường hợp này
    vẫn phải xác nhận tay qua Feedback Loop hoặc nút "Gộp" thủ công.

    progress_cb(event, message, **payload) optional để báo tiến độ.
    should_cancel() optional để dừng mềm ở checkpoint an toàn giữa các vòng lặp.
    """

    def _progress(event, message, **payload):
        if progress_cb:
            progress_cb(event, message, **payload)

    def _cancel_requested():
        return bool(should_cancel and should_cancel())

    settings = get_settings(conn)
    threshold = settings["sim_threshold"]

    merged_count = 0
    skipped_named_conflicts = 0
    session_skip = set()  # các cặp (named vs named) bỏ qua CHỈ trong lần chạy này

    try:
        while True:
            if _cancel_requested():
                _progress(
                    "cancelled",
                    "Đã nhận yêu cầu huỷ recluster; dừng ở checkpoint an toàn.",
                    merged_count=merged_count,
                    skipped_named_conflicts=skipped_named_conflicts,
                )
                return {
                    "merged_count": merged_count,
                    "skipped_named_conflicts": skipped_named_conflicts,
                    "cancelled": True,
                }

            _progress(
                "computing_centroids",
                "Đang tính danh sách persons và centroids...",
                merged_count=merged_count,
                skipped_named_conflicts=skipped_named_conflicts,
            )
            persons = db.list_persons(conn)
            if len(persons) < 2:
                break

            centroids = {p["id"]: _person_centroid(conn, p["id"]) for p in persons}

            best = None
            for i in range(len(persons)):
                for j in range(i + 1, len(persons)):
                    pa, pb = persons[i], persons[j]
                    pair_key = frozenset((pa["id"], pb["id"]))
                    if pair_key in session_skip:
                        continue
                    if db.is_pair_rejected(conn, pa["id"], pb["id"]):
                        continue
                    sim = float(np.dot(centroids[pa["id"]], centroids[pb["id"]]))
                    if sim < threshold:
                        continue
                    if best is None or sim > best["similarity"]:
                        best = {"pa": pa, "pb": pb, "similarity": sim}

            if best is None:
                break

            pa, pb = best["pa"], best["pb"]
            _progress(
                "best_pair_found",
                f"Tìm thấy cặp tốt nhất: person {pa['id']} và {pb['id']} (similarity {best['similarity']:.4f}).",
                person_a_id=pa["id"],
                person_b_id=pb["id"],
                similarity=best["similarity"],
                merged_count=merged_count,
                skipped_named_conflicts=skipped_named_conflicts,
            )

            both_named = bool(pa["name"]) and bool(pb["name"])
            if both_named:
                # Không tự gộp 2 người đã có tên khác nhau -> chỉ bỏ qua trong
                # phiên chạy này (KHÔNG lưu vĩnh viễn), Feedback Loop vẫn có thể
                # hỏi lại cặp này sau nếu bạn muốn xác nhận tay.
                session_skip.add(frozenset((pa["id"], pb["id"])))
                skipped_named_conflicts += 1
                _progress(
                    "named_conflict_skipped",
                    f"Bỏ qua xung đột tên giữa person {pa['id']} và {pb['id']}.",
                    person_a_id=pa["id"],
                    person_b_id=pb["id"],
                    similarity=best["similarity"],
                    merged_count=merged_count,
                    skipped_named_conflicts=skipped_named_conflicts,
                )
                continue

            if pb["name"] and not pa["name"]:
                target, source = pb, pa
            else:
                target, source = pa, pb

            merge_persons(conn, source["id"], target["id"])
            db.clear_rejected_pairs_for(conn, source["id"])
            merged_count += 1

            _progress(
                "pair_merged",
                f"Đã gộp person {source['id']} vào person {target['id']} (similarity {best['similarity']:.4f}).",
                source_id=source["id"],
                target_id=target["id"],
                similarity=best["similarity"],
                merged_count=merged_count,
                skipped_named_conflicts=skipped_named_conflicts,
            )

        _progress(
            "completed",
            f"Hoàn tất recluster: đã gộp {merged_count} cặp, bỏ qua {skipped_named_conflicts} xung đột tên.",
            merged_count=merged_count,
            skipped_named_conflicts=skipped_named_conflicts,
        )
        return {"merged_count": merged_count, "skipped_named_conflicts": skipped_named_conflicts}
    except Exception as e:
        _progress(
            "error",
            f"Lỗi recluster: {e}",
            merged_count=merged_count,
            skipped_named_conflicts=skipped_named_conflicts,
        )
        raise
