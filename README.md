# Face People App — Local Photo App (giống People trong Google/Apple Photos)

Ứng dụng web chạy **hoàn toàn local trên máy bạn**, quét một thư mục ảnh,
nhận diện khuôn mặt, tự động gom nhóm ảnh theo từng người, và cho bạn xem/đặt
tên/gộp/sửa giống tính năng "People" của Google Photos hay Apple Photos.

## Pipeline (theo đúng 5 phần đã trao đổi)

| Bước | Chức năng | Công nghệ dùng |
|---|---|---|
| 1. Detection | Tìm khuôn mặt trong ảnh | RetinaFace (qua InsightFace `buffalo_l`) |
| 2. Alignment | Chuẩn hoá góc mặt | Tự động bên trong InsightFace |
| 3. Embedding | Vector đặc trưng 512-d | ArcFace (qua InsightFace `buffalo_l`) |
| 4. Clustering | Gom mặt thành người | Centroid-matching (incremental) + DBSCAN (cosine) |
| 5. Feedback loop | Sửa sai, học theo người dùng | API rename / merge / split |

## Yêu cầu hệ thống

- **Python 3.10 trở lên** (dùng cú pháp `int | None`)
- GPU NVIDIA + CUDA đã cài driver, nếu muốn chạy nhanh bằng `onnxruntime-gpu`
  (nếu không có, app tự động rơi về CPU, vẫn chạy được, chỉ chậm hơn)
- Khoảng vài trăm MB dung lượng cho model InsightFace (tự tải lần đầu)

## Cài đặt

```bash
cd face_people_app/backend
python -m venv .venv

# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### Lưu ý về `onnxruntime-gpu`

`onnxruntime-gpu` cần đúng phiên bản CUDA Toolkit / cuDNN tương thích. Nếu khi
chạy bạn thấy log `"Không dùng được GPU"`, hoặc cài `onnxruntime-gpu` bị lỗi:

```bash
pip uninstall onnxruntime-gpu
pip install onnxruntime
```

App vẫn hoạt động bình thường trên CPU, chỉ xử lý ảnh chậm hơn (vài trăm ảnh
đầu tiên có thể mất vài phút do phải tải model buffalo_l lần đầu tiên).

### Model InsightFace (buffalo_l)

Lần chạy đầu tiên, `insightface` sẽ **tự động tải model** `buffalo_l`
(~300MB) về `~/.insightface/models/`. Máy bạn cần có kết nối mạng ở lần chạy
đầu tiên đó. Sau đó có thể chạy hoàn toàn offline.

## Chạy ứng dụng

```bash
cd face_people_app/backend
python main.py
```

Sau đó mở trình duyệt tại:

```
http://127.0.0.1:8000
```

## Cách dùng

1. Nhấn **"+ Quét thư mục"** ở sidebar. Bạn có thể tự gõ đường dẫn, hoặc
   bấm nút icon thư mục bên cạnh ô nhập để mở **dialog chọn thư mục** ngay
   trên máy bạn (vì đây là app local, backend liệt kê thư mục trực tiếp
   trên máy đang chạy server — không dùng `<input type=file>` của trình
   duyệt vì cách đó không lấy được đường dẫn thật).
2. App sẽ quét từng ảnh, phát hiện khuôn mặt, tính embedding, và tự động
   gom nhóm theo người. Có thanh tiến độ hiển thị trực tiếp.
3. Vào tab **"Con người"** để xem các cụm người được tạo ra.
4. Click vào 1 người để:
   - Đặt tên (tự lưu khi bạn gõ xong, không cần bấm nút)
   - Xem tất cả ảnh của người đó
   - **Gộp** với một người khác nếu 2 cụm thực ra là cùng 1 người
   - **Xoá** người này (ảnh vẫn giữ nguyên, chỉ bỏ gán tên)
5. Quét thêm ảnh mới bất cứ lúc nào — app sẽ tự so khớp ảnh mới với những
   người đã có (không tạo trùng người), giống cách Google/Apple Photos xử
   lý khi bạn thêm ảnh vào thư viện.

### Chuyển ngôn ngữ Việt / English

Có công tắc **VI / EN** ở cuối sidebar. Lựa chọn được lưu lại trong trình
duyệt (`localStorage`), lần sau mở app vẫn giữ nguyên ngôn ngữ đã chọn.

### Kiểm tra lại nhóm (Feedback Loop)

Bấm **"Kiểm tra lại nhóm"** ở sidebar. App sẽ tìm 2 cụm người có khả năng
là CÙNG MỘT NGƯỜI cao nhất (nhưng thuật toán chưa đủ tự tin để tự gộp), và
hỏi bạn từng cặp một:

- **"Đúng, gộp lại"** → gộp ngay 2 cụm thành 1 người, rồi tự chuyển sang
  hỏi cặp tiếp theo.
- **"Không phải"** → ghi nhớ là 2 cụm này khác người (sẽ không hỏi lại cặp
  này nữa), chuyển sang cặp tiếp theo.
- Nút **×** ở góc để đóng bất cứ lúc nào, không bắt buộc phải đi hết toàn
  bộ danh sách.

### Tạo thư mục theo tên

Bấm **"Tạo thư mục theo tên"** ở sidebar để copy/move ảnh vào các thư mục
theo tên người, ví dụ:

```
<thư mục đã quét>/
└── Organized/
    ├── Tony/
    │   ├── 2024/summer/IMG_001.jpg   ← giữ nguyên thư mục con gốc
    │   └── IMG_010.jpg
    └── Mai/
        └── 2025/IMG_020.jpg
```

- Chỉ những **người đã đặt tên** mới được tổ chức (người chưa đặt tên bị bỏ
  qua).
- Ảnh có **nhiều người đã đặt tên** chỉ được đưa vào thư mục của người có
  khuôn mặt **lớn nhất** trong ảnh đó (tránh nhân bản ảnh vào nhiều nơi).
- App sẽ hiện **bảng tóm tắt** số ảnh theo từng người và **luôn hỏi xác
  nhận** trước khi thực hiện, cho bạn chọn:
  - **Copy**: giữ nguyên ảnh gốc, tạo bản sao (an toàn, khuyên dùng).
  - **Move**: cắt hẳn ảnh gốc sang thư mục tên (ảnh gốc sẽ không còn ở vị
    trí cũ — app tự cập nhật lại đường dẫn trong thư viện nên vẫn xem được
    bình thường trong tab "Ảnh", nhưng nếu bạn có công cụ khác trỏ tới
    đường dẫn cũ thì sẽ bị mất).

## Cấu trúc project

```
face_people_app/
├── backend/
│   ├── main.py           # FastAPI app + toàn bộ API endpoints
│   ├── face_engine.py     # Detection + Embedding (InsightFace)
│   ├── clustering.py      # Gom nhóm khuôn mặt theo người
│   ├── db.py               # SQLite (images, faces, persons)
│   ├── utils.py            # Đọc ảnh (kể cả HEIC), tạo thumbnail
│   ├── requirements.txt
│   └── data/                # Tự tạo khi chạy: SQLite DB + thumbnails
├── frontend/
│   ├── index.html
│   ├── style.css           # Giao diện phong cách Apple Photos
│   └── app.js
└── README.md
```

## Tinh chỉnh độ chính xác clustering

Trong `backend/clustering.py`:

- `SIM_THRESHOLD` (mặc định `0.42`): ngưỡng để coi 1 khuôn mặt mới là
  "đã biết". **Tăng lên** (vd `0.5`) nếu app đang gộp nhầm 2 người khác nhau
  vào 1 cụm. **Giảm xuống** (vd `0.35`) nếu app đang tách 1 người thành
  nhiều cụm khác nhau.
- `DBSCAN_EPS` / `DBSCAN_MIN_SAMPLES`: điều chỉnh cách các khuôn mặt "lạ"
  (không khớp ai) tự gom thành người mới.

Sau khi đổi giá trị, xoá file `backend/data/app.db` và quét lại để áp dụng
từ đầu, hoặc chỉ cần quét ảnh mới để áp dụng cho những ảnh sau này.

## Quyền riêng tư

Toàn bộ xử lý — detection, embedding, clustering — chạy **hoàn toàn local**
trên máy bạn. Không có ảnh hay embedding nào được gửi lên server bên ngoài.
Database (`backend/data/app.db`) và thumbnail đều lưu tại máy bạn.

### Chạy lại "Tạo thư mục theo tên" nhiều lần có an toàn không?

**Có.** App ghi nhớ vị trí gốc tương đối (`rel_path`) của mỗi ảnh ngay từ
lúc quét, không tính lại từ đường dẫn hiện tại — nên dù bạn đã Copy/Move
rồi chạy lại nhiều lần, hoặc đổi từ Copy sang Move, app đều:

- **Bỏ qua (skip)** các ảnh đã có sẵn ở đúng vị trí đích (không tạo bản
  trùng, không lồng `Organized/Organized/...`).
- Chỉ xử lý các ảnh **chưa được tổ chức** hoặc ảnh mới quét thêm vào.

Nếu bạn đã từng dùng bản trước bị lỗi lồng thư mục, lần chạy tới trên bản
cập nhật này app sẽ tự nhận diện và bỏ qua phần tiền tố `Organized/<Tên>/`
bị lồng sai đó khi tính lại đường dẫn đích.

### Cài đặt & Gộp lại (Reclustering)

Bấm **"Cài đặt"** ở sidebar để chỉnh 4 thông số bằng thanh trượt, có hiệu
lực ngay không cần khởi động lại server:

- **Ngưỡng khớp người đã biết** (`sim_threshold`, mặc định `0.42`): dùng
  lúc quét để so mặt mới với người đã có.
- **Ngưỡng tự tạo nhóm mới** (`dbscan_eps`, mặc định `0.40`): dùng cho mặt
  "lạ" khi tự gom thành người mới.
- **Số mặt tối thiểu để tự tạo nhóm** (`dbscan_min_samples`, mặc định `2`).
- **Ngưỡng gợi ý Feedback Loop** (`feedback_min_sim`, mặc định `0.20`).

Có nút **"Khôi phục mặc định"** nếu chỉnh lỡ tay.

Đổi thông số **không tự động áp dụng lại cho dữ liệu đã có** — bạn cần:

- **Quét lại thư mục** để áp dụng cho ảnh mới, hoặc
- Bấm **"Gộp lại (Reclustering)"** để app tự gộp ngay các cặp người hiện
  có đang có độ giống nhau ≥ ngưỡng "khớp người đã biết" mới.

**An toàn dữ liệu đã đặt tên:** nếu 2 người trong 1 cặp **đều đã có tên**
(ví dụ bạn đã xác nhận đây là "Tony" và đây là "Mai"), Reclustering sẽ
**không tự gộp** dù độ giống có cao đến đâu — tránh việc chỉnh ngưỡng lỡ
tay làm gộp nhầm 2 người thật khác nhau. Trường hợp đó bạn vẫn cần xác
nhận tay qua "Kiểm tra lại nhóm" hoặc nút "Gộp" thủ công trong trang chi
tiết từng người.

**Lưu ý:** refresh trang trình duyệt **không** kích hoạt lại bất kỳ tính
toán gom nhóm nào — mọi việc gom nhóm chỉ chạy khi bạn **Quét thư mục**
hoặc bấm **Gộp lại**.

### Nếu bạn đang nâng cấp từ bản trước (đã có `data/app.db` cũ)

Bản cũ chưa lưu "thư mục gốc đã quét" cho từng ảnh, nên tính năng "Tạo thư
mục theo tên" sẽ chỉ giữ được đúng cấu trúc thư mục con cho những ảnh được
**quét lại** sau khi cập nhật. Với ảnh cũ chưa quét lại, app sẽ tự lấy
thư mục cha trực tiếp của ảnh làm gốc (vẫn hoạt động, chỉ là cấu trúc
thư mục con phía trên có thể không được giữ nguyên 100%). Khuyên bạn nên
quét lại thư mục ảnh 1 lần sau khi cập nhật để chuẩn nhất — ảnh không đổi
sẽ không bị chạy lại nhận diện khuôn mặt, chỉ cập nhật thông tin thư mục
gốc nên rất nhanh.

## Giới hạn hiện tại (biết trước để không bất ngờ)

- **Tên thư mục "Organized" là tên dành riêng cho app** (nơi lưu ảnh đã tổ
  chức theo tên). Khi quét, app tự động **bỏ qua mọi thư mục con tên đúng
  "Organized"** để tránh quét lại ảnh đã tổ chức như thể là ảnh mới. Nếu
  bạn có sẵn 1 thư mục ảnh gốc tên trùng là "Organized", ảnh trong đó sẽ
  không được quét — hãy đổi tên thư mục đó trước khi quét.

- UI đang tối ưu cho vài trăm–vài nghìn ảnh (SQLite + xử lý tuần tự). Nếu
  scale lên hàng chục nghìn ảnh, nên chuyển sang xử lý song song
  (multiprocessing) và có thể cần vector DB (FAISS) thay vì so khớp centroid
  tuần tự trong Python — mình có thể nâng cấp phần này nếu bạn cần.
- Ảnh RAW (.CR2, .NEF...) chưa được hỗ trợ, chỉ JPG/PNG/WEBP/BMP/HEIC.
- Chưa có xác thực người dùng — chỉ nên chạy trên `127.0.0.1`, không expose
  ra internet.
