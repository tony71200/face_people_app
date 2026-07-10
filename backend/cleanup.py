"""
Dọn dẹp dữ liệu thumbnail không cần thiết trong data/thumbs/.

Chiến lược: chỉ GIỮ LẠI thumbnail khuôn mặt đại diện (representative_face_id)
của những NGƯỜI ĐÃ ĐẶT TÊN — đây là ảnh nhỏ cần hiển thị ngay ở màn hình
"Con người" (People). Mọi thumbnail khác đều bị xoá:
  - img_{id}.jpg   : thumbnail ảnh toàn cảnh (dùng cho lưới "Ảnh")
  - face_{id}.jpg  : thumbnail khuôn mặt KHÔNG phải đại diện của người đã đặt tên
  - full_{id}.jpg  : cache JPEG convert tạm từ HEIC

An toàn khi xoá: các thumbnail này đều có thể TỰ SINH LẠI on-demand từ ảnh
gốc (xem main.py: _ensure_image_thumb / _ensure_face_thumb / api_image_file)
ngay khi người dùng mở lại ảnh/khuôn mặt đó — vì mọi thông tin cần thiết
(đường dẫn ảnh gốc, bbox khuôn mặt) vẫn còn nguyên trong database. Cái mất
đi chỉ là tốc độ hiển thị lần đầu sau khi dọn dẹp (phải render lại), KHÔNG
mất khả năng nhận diện hay dữ liệu người dùng đã đặt tên/gộp/tách.
"""
from pathlib import Path

import db


def cleanup_thumbs(conn, dry_run: bool = False) -> dict:
    """
    Xoá thumbnail không cần thiết, chỉ giữ lại ảnh đại diện của người đã đặt
    tên. Trả về {deleted_count, freed_bytes, kept_representatives, errors}.
    """
    named_persons = db.list_named_persons(conn)
    keep_face_ids = {
        p["representative_face_id"]
        for p in named_persons
        if p["representative_face_id"] is not None
    }
    keep_filenames = {f"face_{fid}.jpg" for fid in keep_face_ids}

    thumbs_dir: Path = db.THUMBS_DIR
    deleted_count = 0
    freed_bytes = 0
    errors = []

    if not thumbs_dir.exists():
        return {
            "deleted_count": 0,
            "freed_bytes": 0,
            "kept_representatives": len(keep_filenames),
            "errors": [],
        }

    for entry in thumbs_dir.iterdir():
        if not entry.is_file():
            continue
        name = entry.name

        if name.startswith("face_") and name in keep_filenames:
            continue  # đại diện người đã đặt tên -> giữ lại

        if not (name.startswith("img_") or name.startswith("face_") or name.startswith("full_")):
            continue  # file lạ không do app tạo ra -> không đụng vào

        try:
            size = entry.stat().st_size
            if not dry_run:
                entry.unlink()
            deleted_count += 1
            freed_bytes += size
        except OSError as e:
            errors.append({"file": name, "error": str(e)})

    return {
        "deleted_count": deleted_count,
        "freed_bytes": freed_bytes,
        "kept_representatives": len(keep_filenames),
        "errors": errors,
    }
