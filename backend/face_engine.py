"""
Face Engine: Face Detection (RetinaFace) + Face Embedding (ArcFace) qua InsightFace.
Đây là phần 1 (Detection) + phần 2 (Alignment - tự động trong InsightFace)
+ phần 3 (Embedding) trong pipeline nhận diện khuôn mặt.
"""
import numpy as np


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

    def detect_and_embed(self, img_bgr: np.ndarray):
        """
        Trả về danh sách face dict:
        { bbox: [x1,y1,x2,y2], det_score: float, embedding: list[float] (512-d, đã chuẩn hoá) }
        """
        faces = self.app.get(img_bgr)
        results = []
        for f in faces:
            results.append({
                "bbox": [float(v) for v in f.bbox.tolist()],
                "det_score": float(f.det_score),
                "embedding": f.normed_embedding.astype(np.float32).tolist(),
            })
        return results


_engines = {}


def get_engine(prefer_gpu: bool = True) -> FaceEngine:
    if prefer_gpu not in _engines:
        _engines[prefer_gpu] = FaceEngine(prefer_gpu=prefer_gpu)
    return _engines[prefer_gpu]
