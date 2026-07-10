# Face People App

Face People App là ứng dụng web chạy local để quản lý thư viện ảnh cá nhân theo khuôn mặt. App quét ảnh trên máy, nhận diện khuôn mặt, gom các khuôn mặt thành từng nhóm người, cho phép đặt tên, gộp/tách/chỉnh nhóm, xem đường dẫn ảnh gốc, và tổ chức ảnh vào thư mục theo tên người.

Ứng dụng được thiết kế cho trường hợp dùng riêng trên máy cá nhân: backend FastAPI đọc trực tiếp thư mục ảnh local, frontend là giao diện web kiểu Apple Photos, dữ liệu nằm trong SQLite và thư mục thumbnail local.

## Tính năng chính

- **Ảnh**: xem toàn bộ ảnh đã quét ở dạng lưới thumbnail.
- **Con người**: xem các nhóm người bằng avatar tròn, đặt tên từng người, xem toàn bộ ảnh của một người.
- **Chọn nhiều nhóm người**: trong tab **Con người**, bật **Chọn nhiều / Multi-Select**, chọn nhiều avatar rồi **Gộp vào người khác...** để gộp nhiều nhóm vào một người đích. App luôn hỏi xác nhận trước khi gộp.
- **Danh sách con người**: xem dạng danh sách nhẹ hơn và mở danh sách đường dẫn ảnh gốc trên máy.
- **Toàn bộ / Dữ liệu mới**: lọc ảnh/người theo toàn bộ database hoặc chỉ lần quét gần nhất.
- **Kiểm tra lại nhóm**: feedback loop gợi ý các cặp người có thể là cùng một người để bạn xác nhận gộp hoặc từ chối.
- **Gộp lại (Reclustering)**: tự động gộp các cặp đủ giống theo ngưỡng hiện tại, có trạng thái chạy nền, log, nút yêu cầu dừng, và cơ chế bỏ qua xung đột khi cả hai người đều đã có tên khác nhau.
- **Cài đặt gom nhóm**: chỉnh ngưỡng nhận diện/gom nhóm ngay trong UI.
- **Tạo thư mục theo tên**: copy hoặc move ảnh của người đã đặt tên vào thư mục tên người ngay trong cấu trúc thư mục gốc.
- **Thêm data mới**: quét thư mục mới, tự tổ chức ảnh của người đã biết trong thư mục đó, rồi có thể dọn thumbnail thừa.
- **Dọn dẹp thumbnail**: xoá thumbnail không cần thiết, giữ lại ảnh đại diện của người đã đặt tên; thumbnail khác sẽ tự tạo lại khi cần.
- **Khóa người**: xoá vĩnh viễn dữ liệu nhận diện và thumbnail khuôn mặt của một người khỏi database, không xoá ảnh gốc.
- **VI / EN**: chuyển đổi giao diện tiếng Việt và tiếng Anh.

## Pipeline nhận diện khuôn mặt

| Bước | Nội dung | Thành phần |
|---|---|---|
| 1 | Phát hiện khuôn mặt | InsightFace RetinaFace (`buffalo_l`) |
| 2 | Căn chỉnh khuôn mặt | InsightFace |
| 3 | Tạo embedding | ArcFace 512 chiều (`buffalo_l`) |
| 4 | Gom nhóm | So khớp centroid + DBSCAN cosine |
| 5 | Hiệu chỉnh bằng người dùng | Rename, merge, feedback, recluster, reassign |

## Yêu cầu hệ thống

- Python 3.10 trở lên.
- Trình duyệt hiện đại trên cùng máy đang chạy backend.
- Khuyến nghị GPU NVIDIA + CUDA nếu muốn xử lý nhanh với `onnxruntime-gpu`.
- Nếu không có GPU/CUDA phù hợp, có thể dùng CPU bằng `onnxruntime`.
- Lần chạy đầu cần mạng để InsightFace tải model `buffalo_l` về `~/.insightface/models/`.

## Cài đặt

```bash
cd face_people_app/backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Nếu `onnxruntime-gpu` không tương thích CUDA/cuDNN trên máy của bạn, chuyển sang bản CPU:

```bash
pip uninstall onnxruntime-gpu
pip install onnxruntime
```

## Chạy ứng dụng

```bash
cd face_people_app/backend
python main.py
```

Mở trình duyệt tại:

```text
http://127.0.0.1:8000
```

Không expose app ra internet nếu chưa thêm xác thực người dùng.

## Hướng dẫn sử dụng nhanh

1. Bấm **+ Quét thư mục**.
2. Nhập đường dẫn thư mục ảnh hoặc dùng nút chọn thư mục trong modal.
3. Chọn có quét thư mục con hay không, chọn ưu tiên GPU nếu máy hỗ trợ.
4. Bấm **Bắt đầu quét** và chờ thanh tiến độ hoàn tất.
5. Vào **Con người** để xem các nhóm khuôn mặt.
6. Click một avatar để mở chi tiết, đặt tên, xem ảnh, gộp với người khác, xoá hoặc khóa người đó.
7. Nếu cần gộp nhiều nhóm, bật **Chọn nhiều**, chọn các avatar cần gộp, bấm **Gộp vào người khác...**, chọn người đích, rồi xác nhận.

## Các màn hình trong ứng dụng

### Ảnh

Tab **Ảnh** hiển thị toàn bộ ảnh đã quét. Có toggle:

- **Toàn bộ**: xem toàn bộ ảnh trong database.
- **Dữ liệu mới**: chỉ xem ảnh thuộc lần quét gần nhất.

### Con người

Tab **Con người** hiển thị mỗi nhóm người bằng avatar, tên và số ảnh. Thanh công cụ ở đầu tab được giữ cố định khi cuộn để bạn có thể đổi phạm vi dữ liệu hoặc bật multi-select nhanh hơn.

Trong chế độ bình thường, click avatar sẽ mở chi tiết người. Trong chế độ **Chọn nhiều**, click avatar sẽ chọn/bỏ chọn nhóm đó. Nút **Gộp vào người khác...** chỉ bật khi đã chọn ít nhất 2 nhóm.

### Chi tiết một người

Màn hình chi tiết cho phép:

- Đặt hoặc sửa tên; app tự lưu sau khi ngừng gõ.
- Xem ảnh của người đó.
- Gộp người hiện tại vào người khác; app luôn hỏi xác nhận trước khi gộp.
- Xoá người này khỏi nhóm hiện tại nhưng vẫn giữ dữ liệu khuôn mặt để có thể gán lại.
- Khóa người này, xoá vĩnh viễn face embedding và thumbnail khuôn mặt khỏi database.

### Danh sách con người

Tab này phù hợp khi muốn xem nhanh dạng danh sách hoặc kiểm tra đường dẫn file gốc. Chọn một hàng để mở modal danh sách đường dẫn ảnh:

- Màu xanh: file gốc còn tồn tại.
- Màu xám gạch ngang: file đã bị xoá hoặc di chuyển khỏi đường dẫn cũ.

## Quét thêm dữ liệu

### + Quét thư mục

Dùng khi muốn thêm hoặc cập nhật một thư mục ảnh. App bỏ qua ảnh đã biết, tạo thumbnail còn thiếu, phát hiện khuôn mặt mới và gán vào người đã có nếu đủ giống.

### + Thêm data mới

Dùng khi import một thư mục mới vào workflow hiện có. Sau khi quét xong, nếu trong thư mục mới có ảnh của người đã đặt tên, app có thể tự tổ chức ảnh đó vào thư mục theo tên người. Sau đó app hỏi có muốn dọn thumbnail thừa hay không.

## Tạo thư mục theo tên

Bấm **Tạo thư mục theo tên** để tạo bản copy hoặc move ảnh vào thư mục theo tên người. Cấu trúc đích hiện tại là:

```text
<scan_root>/
└── <thư mục con gốc>/
    └── <Tên người>/
        └── <file ảnh>
```

Ví dụ ảnh gốc là:

```text
D:/Photos/2025/trip/IMG_001.jpg
```

Nếu người được đặt tên là `Mai`, ảnh copy/move sẽ nằm ở:

```text
D:/Photos/2025/trip/Mai/IMG_001.jpg
```

Lưu ý:

- Chỉ người đã đặt tên mới được tổ chức.
- Một ảnh có nhiều người đã đặt tên chỉ được gán cho người có khuôn mặt lớn nhất trong ảnh.
- **Copy** giữ ảnh gốc và ghi nhớ đường dẫn copy để lần quét sau không nhận nhầm là ảnh mới.
- **Move** di chuyển ảnh gốc và cập nhật lại đường dẫn trong database.
- App luôn hiển thị tóm tắt và hỏi xác nhận trước khi thực hiện.
- Các bản cũ từng dùng thư mục `Organized/`; bản hiện tại không tạo thư mục bao `Organized` nữa.

## Feedback loop và reclustering

### Kiểm tra lại nhóm

Bấm **Kiểm tra lại nhóm** để app gợi ý từng cặp người có khả năng là cùng một người:

- **Đúng, gộp lại**: gộp hai nhóm.
- **Không phải**: ghi nhớ cặp này là khác người để không hỏi lại.

### Gộp lại (Reclustering)

Bấm **Gộp lại (Reclustering)** để app tự duyệt các cặp đủ giống theo ngưỡng hiện tại:

- Chạy nền và hiển thị trạng thái/log trong modal.
- Có nút **Yêu cầu dừng** để dừng ở checkpoint an toàn.
- Nếu cả hai người đều đã có tên khác nhau, app bỏ qua để tránh gộp nhầm dữ liệu đã xác nhận.

## Cài đặt gom nhóm

Trong **Cài đặt**, có thể chỉnh:

- **Ngưỡng khớp người đã biết** (`sim_threshold`): cao hơn thì khó gộp hơn, giảm nhận nhầm nhưng dễ tách một người thành nhiều nhóm.
- **Ngưỡng tự tạo nhóm mới** (`dbscan_eps`): dùng khi gom các mặt lạ thành người mới.
- **Số mặt tối thiểu để tự tạo nhóm** (`dbscan_min_samples`).
- **Ngưỡng gợi ý Feedback Loop** (`feedback_min_sim`): thấp hơn thì có nhiều gợi ý hơn.

Có nút khôi phục mặc định. Thay đổi cài đặt ảnh hưởng các lần quét/gộp tiếp theo; dữ liệu cũ chỉ thay đổi khi bạn quét lại, feedback, gộp thủ công hoặc chạy reclustering.

## Dọn dẹp thumbnail

Trong **Cài đặt**, mục **Dọn dẹp dữ liệu thumbnail** xoá thumbnail toàn cảnh, thumbnail khuôn mặt chưa đặt tên và cache HEIC không cần thiết. App giữ lại ảnh đại diện của người đã đặt tên. Ảnh/khuôn mặt vẫn có thể hiển thị lại vì thumbnail sẽ được tạo lại từ ảnh gốc khi cần.

## Dữ liệu lưu ở đâu?

Dữ liệu runtime nằm trong `backend/data/`:

- `app.db`: SQLite database.
- `thumbs/`: thumbnail ảnh và khuôn mặt.
- Các file/cache khác do quá trình đọc ảnh tạo ra nếu có.

Ảnh gốc của bạn không bị xoá khi quét. Các thao tác có thể ảnh hưởng file gốc gồm:

- **Move** trong **Tạo thư mục theo tên**.
- Xoá/di chuyển file thủ công bên ngoài app.

Nút **Khóa** chỉ xoá dữ liệu nhận diện và thumbnail khuôn mặt trong app, không xoá ảnh gốc.

## Cấu trúc project

```text
face_people_app/
├── backend/
│   ├── main.py              # FastAPI app và API endpoints
│   ├── face_engine.py       # InsightFace detection + embedding
│   ├── clustering.py        # Matching, DBSCAN, merge/recluster logic
│   ├── db.py                # SQLite schema và truy vấn
│   ├── organize.py          # Copy/move ảnh vào thư mục theo tên
│   ├── cleanup.py           # Dọn thumbnail/cache
│   ├── utils.py             # Đọc ảnh, HEIC, thumbnail, liệt kê ảnh
│   ├── requirements.txt
│   └── data/                # Tự tạo khi chạy
├── frontend/
│   ├── index.html           # Markup UI
│   ├── style.css            # Styling giao diện
│   └── app.js               # Logic frontend + i18n
├── run.bat                  # Script chạy trên Windows nếu dùng
└── README.md
```

## Định dạng ảnh hỗ trợ

App hỗ trợ các định dạng phổ biến gồm JPG/JPEG, PNG, WEBP, BMP và HEIC/HEIF. Ảnh RAW như CR2/NEF hiện chưa được hỗ trợ.

## Quyền riêng tư và bảo mật

- Ảnh, embedding, database và thumbnail đều nằm trên máy chạy app.
- App không upload ảnh lên dịch vụ bên ngoài.
- InsightFace có thể tải model ở lần chạy đầu; sau đó có thể chạy offline nếu model đã có sẵn.
- Chưa có đăng nhập/phân quyền, nên chỉ chạy trên `127.0.0.1` hoặc mạng tin cậy.

## Ghi chú nâng cấp từ bản cũ

- Nếu database cũ chưa có `scan_root`/`rel_path`, app vẫn cố gắng suy ra đường dẫn tương đối từ đường dẫn hiện tại. Để tổ chức thư mục chính xác nhất, nên quét lại thư mục ảnh một lần sau khi nâng cấp.
- Bản hiện tại không còn tạo thư mục bao `Organized`; nếu trước đó đã có ảnh trong cấu trúc cũ, logic tổ chức sẽ cố tránh lồng lại `Organized/Organized/...`.
