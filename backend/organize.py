"""
Tính năng "Tạo thư mục Tên": với mỗi người đã đặt tên, tạo thư mục
<scan_root>/<đường dẫn con giữ nguyên>/<Tên>/ảnh.jpg
và copy (hoặc move) các ảnh của người đó vào — KHÔNG còn thư mục bao "Organized"
như trước, output nằm ngay trong cấu trúc subfolder gốc.

Quy tắc khi 1 ảnh có nhiều người đã đặt tên: chỉ đưa vào thư mục của
người có khuôn mặt LỚN NHẤT (diện tích bbox lớn nhất) trong ảnh đó,
để tránh nhân bản ảnh vào nhiều nơi.

LƯU Ý QUAN TRỌNG về chống trùng lặp khi quét lại: vì không còn thư mục
"Organized" cố định để loại trừ khỏi lần quét sau, các ảnh COPY ra (giữ
nguyên ảnh gốc) sẽ được ghi vào bảng organized_paths (db.add_organized_path)
ngay sau khi copy — main.py sẽ dùng danh sách này để bỏ qua chúng ở những
lần quét sau, tránh bị nhận nhầm là ảnh mới. Với mode "move", không cần cơ
chế này vì ảnh gốc đã bị di chuyển hẳn, DB chỉ update lại path của chính
ảnh đó (không có file nào mới sinh ra để bị quét trùng).
"""
import os
import re
import shutil
from pathlib import Path

import db

INVALID_CHARS = re.compile(r'[\\/:*?"<>|]')


def sanitize_name(name: str) -> str:
    name = (name or "").strip()
    name = INVALID_CHARS.sub("_", name)
    name = name.strip(" .")
    return name or "Unnamed"


def _strip_legacy_nested_organized(rel: str) -> str:
    """
    Chỉ áp dụng cho ảnh cũ (quét từ trước khi có rel_path lưu sẵn) mà path
    hiện tại vô tình đã nằm bên trong 1 thư mục "Organized" tạo ra bởi
    PHIÊN BẢN CŨ của tính năng này (trước khi bỏ hẳn thư mục bao Organized).
    Không cố đoán lại chính xác subfolder gốc trong trường hợp này — an
    toàn nhất là chỉ giữ lại TÊN FILE.
    """
    parts = rel.split(os.sep)
    if "Organized" in parts:
        return os.path.basename(rel)
    return rel


def build_plan(conn, scan_root: str = None):
    """
    Trả về danh sách các thao tác cần thực hiện:
    [{ image_id, src, dst, person_name }, ...]
    Mỗi ảnh chỉ xuất hiện 1 lần (gán cho người có khuôn mặt lớn nhất).

    Dùng rel_path đã lưu ổn định từ lúc quét (không tính lại từ path hiện
    tại), vì path hiện tại có thể đã đổi do lần move trước đó.

    scan_root (tuỳ chọn): nếu truyền vào, CHỈ tổ chức những ảnh có
    scan_root khớp (VD chỉ ảnh vừa quét từ 1 folder mới) — nhưng tên người
    dùng để gán vẫn lấy từ TOÀN BỘ database (nên vẫn nhận diện đúng người
    đã đặt tên trước đó, dù người đó lần đầu xuất hiện ở folder khác).
    """
    rows = db.get_named_faces_with_area(conn)

    best_per_image = {}
    for r in rows:
        cur = best_per_image.get(r["image_id"])
        if cur is None or r["area"] > cur["area"]:
            best_per_image[r["image_id"]] = r

    norm_scan_root = os.path.abspath(scan_root) if scan_root else None

    plan = []
    for image_id, row in best_per_image.items():
        img = db.get_image(conn, image_id)
        if not img or not img["path"]:
            continue
        src = img["path"]
        if not os.path.exists(src):
            continue

        img_scan_root = img["scan_root"] or os.path.dirname(src)

        if norm_scan_root and os.path.abspath(img_scan_root) != norm_scan_root:
            continue  # chỉ tổ chức ảnh thuộc scan_root được yêu cầu

        rel = img["rel_path"]
        if not rel:
            # Ảnh cũ (quét trước khi có rel_path) -> tự tính
            try:
                rel = os.path.relpath(src, img_scan_root)
                if rel.startswith(".."):
                    rel = os.path.basename(src)
            except ValueError:
                rel = os.path.basename(src)
        rel = _strip_legacy_nested_organized(rel)

        # <scan_root>/<subfolder gốc>/<Tên người>/<file> — không còn "Organized"
        rel_dir = os.path.dirname(rel)
        filename = os.path.basename(rel)

        person_folder = sanitize_name(row["person_name"])
        dest_path = os.path.join(img_scan_root, rel_dir, person_folder, filename)

        plan.append({
            "image_id": image_id,
            "src": src,
            "dst": dest_path,
            "person_name": row["person_name"],
        })
    return plan


def summarize_plan(plan):
    """Tóm tắt số ảnh theo từng người, để hiển thị xác nhận trước khi thực hiện."""
    summary = {}
    for item in plan:
        summary.setdefault(item["person_name"], 0)
        summary[item["person_name"]] += 1
    return [{"name": name, "count": count} for name, count in sorted(summary.items())]


def execute_plan(conn, plan, mode="copy"):
    """
    mode: "copy" (giữ ảnh gốc) hoặc "move" (cắt hẳn ảnh gốc).
    Nếu move thành công, cập nhật lại path trong DB để thumbnail/lightbox
    vẫn hoạt động đúng sau khi ảnh đã bị di chuyển.

    Nếu copy thành công, ghi lại đường dẫn đích vào bảng organized_paths để
    lần quét sau tự động bỏ qua (không có thư mục "Organized" cố định để
    loại trừ theo tên nữa, nên phải theo dõi từng đường dẫn cụ thể).
    """
    processed, skipped = 0, 0
    errors = []

    for item in plan:
        src, dst = item["src"], item["dst"]
        try:
            if not os.path.exists(src):
                skipped += 1
                continue
            if os.path.abspath(src) == os.path.abspath(dst):
                skipped += 1
                continue
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            if os.path.exists(dst):
                skipped += 1
                continue

            if mode == "move":
                shutil.move(src, dst)
                db.update_image_path(conn, item["image_id"], dst)
            else:
                shutil.copy2(src, dst)
                # resolve() để khớp chính xác với cách utils.list_images()
                # chuẩn hoá đường dẫn khi quét (p.resolve()) -> đảm bảo lần
                # quét sau nhận diện đúng và loại trừ được.
                db.add_organized_path(conn, str(Path(dst).resolve()), commit=False)

            processed += 1
        except Exception as e:
            errors.append({"src": src, "error": str(e)})

    conn.commit()
    return {"processed": processed, "skipped": skipped, "errors": errors}
