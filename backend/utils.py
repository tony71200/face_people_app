"""
Tiện ích xử lý ảnh: đọc ảnh (bao gồm HEIC của iPhone), tạo thumbnail, crop khuôn mặt.
"""
from pathlib import Path
import os
import numpy as np
import cv2
from PIL import Image

# Đăng ký hỗ trợ đọc file HEIC/HEIF (ảnh gốc của iPhone) nếu có cài pillow-heif
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HEIC_SUPPORTED = True
except ImportError:
    HEIC_SUPPORTED = False

SUPPORTED_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".heic", ".heif"}


def list_images(folder: str, recursive: bool = True):
    """
    Duyệt thư mục, trả về danh sách đường dẫn ảnh hợp lệ.

    Lưu ý: vẫn bỏ qua thư mục con tên đúng "Organized" nếu gặp — đây là lớp
    bảo vệ dự phòng cho những setup cũ (trước khi tính năng "Tạo thư mục
    theo tên" bỏ hẳn thư mục bao "Organized"). Với cấu trúc MỚI (không còn
    thư mục "Organized"), cơ chế chống quét trùng chính nằm ở main.py:
    _do_scan() sẽ tự loại trừ các đường dẫn đã có trong bảng
    organized_paths (xem db.get_organized_paths_set) trước khi xử lý.
    """
    base = Path(folder)
    if not base.exists():
        raise FileNotFoundError(f"Thư mục không tồn tại: {folder}")

    paths = []
    if recursive:
        for root, dirnames, filenames in os.walk(base):
            dirnames[:] = [d for d in dirnames if d != "Organized"]
            for fname in filenames:
                p = Path(root) / fname
                if p.suffix.lower() in SUPPORTED_EXT:
                    if p.suffix.lower() in (".heic", ".heif") and not HEIC_SUPPORTED:
                        continue
                    paths.append(str(p.resolve()))
    else:
        for p in base.iterdir():
            if p.is_file() and p.suffix.lower() in SUPPORTED_EXT:
                if p.suffix.lower() in (".heic", ".heif") and not HEIC_SUPPORTED:
                    continue
                paths.append(str(p.resolve()))
    return sorted(paths)


def load_image_bgr(path: str):
    """Đọc ảnh (kể cả HEIC), trả về (ảnh BGR numpy cho OpenCV/InsightFace, PIL.Image gốc)."""
    pil_img = Image.open(path)
    pil_img = pil_img.convert("RGB")
    # Sửa xoay ảnh theo EXIF (rất quan trọng với ảnh chụp từ điện thoại)
    try:
        from PIL import ImageOps
        pil_img = ImageOps.exif_transpose(pil_img)
    except Exception:
        pass
    arr = np.array(pil_img)
    bgr = cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
    return bgr, pil_img


def make_thumbnail(pil_img: Image.Image, max_size: int = 480) -> Image.Image:
    img = pil_img.copy()
    img.thumbnail((max_size, max_size), Image.LANCZOS)
    return img


def crop_face(pil_img: Image.Image, bbox, padding: float = 0.35, out_size: int = 320) -> Image.Image:
    """Cắt vùng khuôn mặt với padding, resize thành thumbnail vuông."""
    w, h = pil_img.size
    x1, y1, x2, y2 = bbox
    bw, bh = x2 - x1, y2 - y1
    pad_x, pad_y = bw * padding, bh * padding
    x1 = max(0, x1 - pad_x)
    y1 = max(0, y1 - pad_y)
    x2 = min(w, x2 + pad_x)
    y2 = min(h, y2 + pad_y)
    crop = pil_img.crop((int(x1), int(y1), int(x2), int(y2)))
    crop.thumbnail((out_size, out_size), Image.LANCZOS)
    return crop


def save_jpeg(pil_img: Image.Image, path: str, quality: int = 88):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    pil_img.save(path, "JPEG", quality=quality)
