"""
Face Engine: Face Detection (RetinaFace) + Face Embedding (ArcFace) qua InsightFace.
Đây là phần 1 (Detection) + phần 2 (Alignment - tự động trong InsightFace)
+ phần 3 (Embedding) trong pipeline nhận diện khuôn mặt.
"""
import cv2
import numpy as np

# Số khuôn mặt tối đa giữ lại cho MỖI ẢNH (ưu tiên mặt lớn nhất + rõ nét
# nhất). Giúp bỏ bớt mặt nhỏ/mờ ở nền (VD ảnh đám đông) để clustering và
# dữ liệu lưu trữ không bị "nhiễu" bởi những mặt khó nhận diện chính xác.
MAX_FACES_PER_IMAGE = 3

# Ngưỡng độ nét (variance of Laplacian, đo trên ảnh mặt đã resize về kích
# thước cố định để so sánh công bằng giữa mặt to/nhỏ). Càng thấp càng "dễ
# tính" (chấp nhận mặt hơi mờ). Giá trị này chỉ mang tính tương đối, có thể
# cần điều chỉnh tuỳ chất lượng ảnh gốc.
BLUR_THRESHOLD = 30.0
SCORE_THRESHOLD = 0.6  # Ngưỡng confidence score của face detection (RetinaFace)

_SHARPNESS_CHECK_SIZE = 160


def _face_sharpness(img_bgr: np.ndarray, bbox) -> float:
    """
    Đo độ nét của vùng khuôn mặt bằng variance of Laplacian: ảnh càng nét,
    biên độ đạo hàm bậc 2 (Laplacian) càng lớn -> variance càng cao. Ảnh mờ
    (out-of-focus, motion blur) sẽ có variance thấp.
    """
    h_img, w_img = img_bgr.shape[:2]
    x1, y1, x2, y2 = [int(round(v)) for v in bbox]
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w_img, x2), min(h_img, y2)
    if x2 <= x1 or y2 <= y1:
        return 0.0
    crop = img_bgr[y1:y2, x1:x2]
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, (_SHARPNESS_CHECK_SIZE, _SHARPNESS_CHECK_SIZE), interpolation=cv2.INTER_AREA)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


class FaceEngine:
    _instance = None

    def __init__(self, prefer_gpu: bool = True, det_size=(640, 640)):
        from insightface.app import FaceAnalysis

        providers = []
        if prefer_gpu:
            providers.append("CUDAExecutionProvider")
        providers.append("CPUExecutionProvider")

        self.gpu_active = False
        last_err = None

        # Thử GPU trước, nếu lỗi (thiếu CUDA/driver) thì tự rơi về CPU
        try:
            self.app = FaceAnalysis(name="buffalo_l", providers=providers)
            ctx_id = 0 if prefer_gpu else -1
            self.app.prepare(ctx_id=ctx_id, det_size=det_size)
            # Kiểm tra provider thực sự được dùng
            active_providers = self.app.models["detection"].session.get_providers()
            self.gpu_active = "CUDAExecutionProvider" in active_providers
        except Exception as e:
            last_err = e
            # fallback cứng về CPU
            self.app = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
            self.app.prepare(ctx_id=-1, det_size=det_size)
            self.gpu_active = False
            print(f"[FaceEngine] Không dùng được GPU ({last_err}), đã chuyển sang CPU.")

    def detect_and_embed(
        self,
        img_bgr: np.ndarray,
        max_faces: int = MAX_FACES_PER_IMAGE,
        score_threshold: float = SCORE_THRESHOLD,
        blur_threshold: float = BLUR_THRESHOLD,

    ):
        """
        Trả về danh sách face dict:
        { bbox: [x1,y1,x2,y2], det_score: float, embedding: list[float] (512-d, đã chuẩn hoá) }

        Chỉ giữ lại tối đa `max_faces` khuôn mặt LỚN NHẤT và KHÔNG MỜ trong
        mỗi ảnh (ưu tiên mặt chính, loại bớt mặt nhỏ/mờ ở nền, VD ảnh đám
        đông) — giúp dữ liệu clustering & dung lượng lưu trữ (thumbnail,
        embedding) không bị "nhiễu" bởi những mặt khó nhận diện chính xác.

        Nếu TẤT CẢ mặt trong ảnh đều bị coi là mờ (VD cả ảnh bị mất nét),
        vẫn giữ lại theo diện tích để không bỏ sót toàn bộ ảnh đó.
        """
        faces = self.app.get(img_bgr)
        candidates = []
        for f in faces:
            bbox = [float(v) for v in f.bbox.tolist()]
            area = max(0.0, bbox[2] - bbox[0]) * max(0.0, bbox[3] - bbox[1])
            sharpness = _face_sharpness(img_bgr, bbox)
            if f.det_score < score_threshold:
                continue
            candidates.append({
                "bbox": bbox,
                "det_score": float(f.det_score),
                "embedding": f.normed_embedding.astype(np.float32).tolist(),
                "_area": area,
                "_sharpness": sharpness,
            })

        sharp_enough = [c for c in candidates if c["_sharpness"] >= blur_threshold]
        pool = sharp_enough if sharp_enough else candidates
        pool.sort(key=lambda c: c["_area"], reverse=True)
        selected = pool[:max_faces]

        for c in selected:
            c.pop("_area", None)
            c.pop("_sharpness", None)
        return selected


_engines = {}


def get_engine(prefer_gpu: bool = True) -> FaceEngine:
    if prefer_gpu not in _engines:
        _engines[prefer_gpu] = FaceEngine(prefer_gpu=prefer_gpu)
    return _engines[prefer_gpu]
