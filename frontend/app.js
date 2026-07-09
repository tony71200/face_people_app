const API = "/api";

// ---------------- i18n ----------------
const translations = {
  vi: {
    library: "Thư viện ảnh",
    nav_photos: "Ảnh",
    nav_people: "Con người",
    nav_people_list: "Danh sách con người",
    scope_all: "Toàn bộ",
    scope_new: "Dữ liệu mới",
    scope_new_disabled_msg: "Chưa có dữ liệu mới nào — hãy quét hoặc \"Thêm data mới\" trước.",
    feedback_btn: "Kiểm tra lại nhóm",
    organize_btn: "Tạo thư mục theo tên",
    recluster_btn: "Gộp lại (Reclustering)",
    settings_btn: "Cài đặt",
    scan_button: "+ Quét thư mục",
    all_photos: "Tất cả ảnh",
    people_title: "Con người",
    people_stats: (total, named, unnamed) => `Tổng: ${total} · Đã đặt tên: ${named} · Chưa đặt tên: ${unnamed}`,
    empty_photos: "Chưa có ảnh nào.",
    empty_photos_sub: 'Nhấn "Quét thư mục" ở góc trái để bắt đầu.',
    empty_people: "Chưa nhận diện được ai.",
    empty_people_sub: "Quét một thư mục ảnh để bắt đầu nhóm khuôn mặt.",
    back_to_people: "‹ Con người",
    placeholder_name: "Thêm tên...",
    merge_btn: "Gộp với người khác...",
    delete_person_btn: "Xoá người này",
    lock_person_btn: "🔒 Khóa",
    lock_person_tooltip: "Xoá vĩnh viễn dữ liệu nhận diện (embedding) và toàn bộ thumbnail khuôn mặt của người này khỏi database. Không thể hoàn tác.",
    scan_modal_title: "Quét thư mục ảnh",
    scan_modal_sub: "Nhập đường dẫn thư mục chứa ảnh trên máy bạn (hỗ trợ JPG, PNG, WEBP, HEIC).",
    folder_placeholder: "Ví dụ: C:\\Users\\Tony\\Pictures hoặc /home/tony/photos",
    recursive_label: "Bao gồm thư mục con",
    gpu_label: "Ưu tiên dùng GPU (CUDA)",
    close_btn: "Đóng",
    start_scan_btn: "Bắt đầu quét",
    browse_title: "Chọn thư mục",
    choose_folder_btn: "Chọn thư mục này",
    cancel_btn: "Huỷ",
    merge_modal_title: "Gộp vào người nào?",
    merge_modal_sub: "Chọn người mà bạn muốn gộp vào (mọi ảnh sẽ được chuyển sang người đó).",
    multi_select_label: "Chọn nhiều",
    multi_merge_btn: "Gộp vào người khác...",
    multi_select_count: (n) => `Đã chọn ${n} nhóm`,
    multi_select_hint: "Bật Chọn nhiều rồi bấm các avatar để chọn ít nhất 2 nhóm cần gộp.",
    confirm_merge_people: (sources, target) => `Bạn có chắc chắn muốn gộp ${sources} vào "${target}" không?`,
    photos_suffix: "ảnh",
    unnamed: "Chưa đặt tên",
    unnamed_count: (n) => `${n} ảnh (chưa đặt tên)`,
    feedback_title: "Đây có phải cùng một người không?",
    feedback_sub: (pct) => `Độ giống nhau ước tính: ${pct}%`,
    feedback_yes: "Đúng, gộp lại",
    feedback_no: "Không phải",
    feedback_done: "Đã kiểm tra hết! Không còn cặp nào cần xác nhận.",
    feedback_loading: "Đang tìm cặp tiếp theo...",
    organize_title: "Tạo thư mục theo tên",
    organize_sub: 'Ảnh của mỗi người đã đặt tên sẽ được sắp xếp vào thư mục "<Tên>" ngay trong đúng thư mục con chứa ảnh gốc (giữ nguyên cấu trúc thư mục con, không tạo thư mục bao nào khác). Ảnh có nhiều người sẽ chỉ vào thư mục của người có khuôn mặt lớn nhất.',
    organize_confirm: "Bạn có chắc chắn muốn thực hiện thao tác này không?",
    organize_confirm_btn: "Thực hiện",
    organize_no_data: "Chưa có người nào được đặt tên để tổ chức ảnh.",
    organize_summary_total: (n) => `Tổng cộng ${n} ảnh sẽ được xử lý:`,
    mode_copy: "Copy (giữ ảnh gốc, an toàn)",
    mode_move: "Move (cắt hẳn ảnh gốc)",
    organize_running: "Đang xử lý...",
    organize_result_ok: (p, s) => `Hoàn tất: ${p} ảnh đã xử lý, ${s} ảnh bỏ qua (đã tồn tại hoặc không tìm thấy).`,
    organize_result_errors: (n) => ` Có ${n} lỗi xảy ra.`,
    confirm_delete_person: "Xoá người này? (Ảnh vẫn được giữ lại, chỉ bỏ gán tên người)",
    confirm_lock_person: (name) => `Khóa và XÓA VĨNH VIỄN dữ liệu nhận diện của "${name}" khỏi database? Bao gồm toàn bộ embedding khuôn mặt + thumbnail. Ảnh gốc trên máy KHÔNG bị xóa. Hành động này KHÔNG THỂ hoàn tác. Tiếp tục?`,
    lock_person_result: (n) => `Đã khóa: xóa vĩnh viễn dữ liệu và ${n} thumbnail khuôn mặt của người này.`,
    error_lock_person: "Không khóa được người này.",
    alert_enter_folder: "Vui lòng nhập đường dẫn thư mục.",
    alert_scan_error: (msg) => `Lỗi khi bắt đầu quét: ${msg}`,
    alert_scan_failed: (msg) => `Lỗi khi quét: ${msg}`,
    settings_title: "Cài đặt gom nhóm khuôn mặt",
    settings_sub: 'Chỉnh các ngưỡng dùng để gom nhóm khuôn mặt theo người. Thay đổi có hiệu lực ngay từ lần quét/gộp tiếp theo, không ảnh hưởng tới dữ liệu đã có cho tới khi bạn quét lại hoặc bấm "Gộp lại".',
    setting_sim_threshold: "Ngưỡng khớp người đã biết",
    setting_sim_threshold_desc: "Càng cao càng \"khó tính\" (ít nhận nhầm 2 người khác nhau là 1 người, nhưng dễ tách 1 người thành nhiều nhóm).",
    setting_dbscan_eps: "Ngưỡng tự tạo nhóm mới (DBSCAN)",
    setting_dbscan_eps_desc: "Áp dụng cho các khuôn mặt \"lạ\" (không khớp ai) khi tự gom thành người mới lúc quét.",
    setting_min_samples: "Số mặt tối thiểu để tự tạo nhóm",
    setting_min_samples_desc: "Nếu chỉ có 1 mặt lạ duy nhất, mặt đó luôn thành người riêng dù đặt số này bao nhiêu.",
    setting_feedback_min_sim: "Ngưỡng gợi ý Feedback Loop",
    setting_feedback_min_sim_desc: "Càng thấp càng gợi ý nhiều cặp hơn (kể cả những cặp chỉ hơi giống nhau).",
    settings_reset: "Khôi phục mặc định",
    settings_save: "Lưu thay đổi",
    settings_saved: "Đã lưu cài đặt.",
    settings_reset_confirm: "Khôi phục tất cả thông số về mặc định?",
    recluster_title: "Gộp lại theo thông số hiện tại?",
    recluster_sub: 'App sẽ tự gộp các nhóm người có độ giống nhau cao (theo ngưỡng "khớp người đã biết" trong Cài đặt). Nếu 2 người ĐỀU đã được đặt tên, app sẽ KHÔNG tự gộp để tránh ảnh hưởng nhóm bạn đã xác nhận — những trường hợp đó vẫn cần xác nhận tay qua "Kiểm tra lại nhóm".',
    recluster_confirm_btn: "Bắt đầu gộp",
    recluster_stop_btn: "Yêu cầu dừng",
    recluster_running: "Đang gộp...",
    recluster_result: (merged, skipped) => `Đã gộp ${merged} cặp người. Bỏ qua ${skipped} cặp vì cả 2 đều đã có tên khác nhau (cần xác nhận tay).`,
    scan_errors_count: (n) => `${n} ảnh lỗi`,
    error_generic: "Đã xảy ra lỗi. Vui lòng thử lại.",
    error_load_photos: "Không tải được danh sách ảnh.",
    error_load_people: "Không tải được danh sách người.",
    people_list_title: "Danh sách con người",
    people_list_sub: "Xem nhanh dạng danh sách. Chọn 1 người để xem toàn bộ đường dẫn ảnh gốc trên máy.",
    person_paths_sub: "Đường dẫn ảnh gốc trên máy. Xanh = ảnh còn tồn tại. Xám gạch ngang = ảnh đã bị xoá/di chuyển khỏi vị trí này.",
    person_paths_count: (exists, total) => `${exists}/${total} ảnh còn tồn tại trên máy.`,
    error_load_person_paths: "Không tải được danh sách đường dẫn ảnh của người này.",
    error_person_detail: "Không tải được chi tiết người này.",
    error_save_name: "Không lưu được tên người.",
    error_delete_person: "Không xoá được người này.",
    error_merge_people: "Không gộp được người.",
    error_feedback: "Không gửi được phản hồi.",
    error_organize_preview: "Không tải được bản xem trước tổ chức ảnh.",
    error_organize_execute: "Không tổ chức ảnh được.",
    error_settings_load: "Không tải được cài đặt.",
    error_settings_save: "Không lưu được cài đặt.",
    error_settings_reset: "Không khôi phục được cài đặt mặc định.",
    error_recluster: "Không gộp lại được.",
    error_scan_status: "Không cập nhật được trạng thái quét.",
    error_browse_folder: "Không duyệt được thư mục này.",
    import_data_btn: "+ Thêm data mới",
    import_hint: "Sau khi quét xong, ảnh của người đã đặt tên trong folder này sẽ được tự động sắp xếp vào thư mục theo tên (vẫn nhận diện đúng người đã có từ trước, dù ở folder khác).",
    import_organize_confirm: (n) => `Đã quét xong. Có ${n} ảnh của người đã đặt tên trong folder này sẽ được tổ chức vào thư mục theo tên người (ngay trong đúng thư mục con chứa ảnh gốc). Tiếp tục?`,
    import_no_named_data: "Đã quét xong, nhưng chưa có ảnh nào của người đã đặt tên trong folder này để tổ chức.",
    error_import_organize: "Quét xong nhưng không tổ chức được ảnh tự động.",
    cleanup_title: "Dọn dẹp dữ liệu thumbnail",
    cleanup_desc: "Xoá các thumbnail không cần thiết trong thư mục data (ảnh toàn cảnh, khuôn mặt của người chưa đặt tên, cache HEIC), chỉ giữ lại ảnh đại diện của người đã đặt tên. Ảnh/khuôn mặt vẫn hiển thị lại bình thường sau đó (tự tạo lại từ ảnh gốc khi cần), chỉ chậm hơn một chút ở lần xem đầu tiên.",
    cleanup_btn: "Dọn dẹp ngay",
    cleanup_confirm: "Xoá thumbnail thừa, chỉ giữ ảnh đại diện của người đã đặt tên? Ảnh vẫn sẽ tự hiển thị lại bình thường khi cần (chỉ chậm hơn lần xem đầu).",
    cleanup_running: "Đang dọn dẹp...",
    cleanup_result: (count, mb) => `Đã xoá ${count} file, giải phóng ${mb} MB. Giữ lại ảnh đại diện của người đã đặt tên.`,
    error_cleanup: "Không dọn dẹp được dữ liệu.",
  },
  en: {
    library: "Photo Library",
    nav_photos: "Photos",
    nav_people: "People",
    nav_people_list: "People list",
    scope_all: "All",
    scope_new: "New data",
    scope_new_disabled_msg: "No new data yet — scan or use \"Import new data\" first.",
    feedback_btn: "Review groupings",
    organize_btn: "Organize into folders",
    recluster_btn: "Recluster",
    settings_btn: "Settings",
    scan_button: "+ Scan folder",
    all_photos: "All Photos",
    people_title: "People",
    people_stats: (total, named, unnamed) => `Total: ${total} · Named: ${named} · Unnamed: ${unnamed}`,
    empty_photos: "No photos yet.",
    empty_photos_sub: 'Click "Scan folder" on the left to get started.',
    empty_people: "No one recognized yet.",
    empty_people_sub: "Scan a photo folder to start grouping faces.",
    back_to_people: "‹ People",
    placeholder_name: "Add name...",
    merge_btn: "Merge with another person...",
    delete_person_btn: "Delete this person",
    lock_person_btn: "🔒 Lock",
    lock_person_tooltip: "Permanently delete this person's face recognition data (embeddings) and all face thumbnails from the database. Cannot be undone.",
    scan_modal_title: "Scan Photo Folder",
    scan_modal_sub: "Enter the path to a folder of photos on your computer (JPG, PNG, WEBP, HEIC supported).",
    folder_placeholder: "e.g. C:\\Users\\Tony\\Pictures or /home/tony/photos",
    recursive_label: "Include subfolders",
    gpu_label: "Prefer GPU (CUDA)",
    close_btn: "Close",
    start_scan_btn: "Start scan",
    browse_title: "Choose a folder",
    choose_folder_btn: "Choose this folder",
    cancel_btn: "Cancel",
    merge_modal_title: "Merge into which person?",
    merge_modal_sub: "Pick the person to merge into (all photos will move to that person).",
    multi_select_label: "Multi-Select",
    multi_merge_btn: "Merge into another person...",
    multi_select_count: (n) => `${n} group${n === 1 ? "" : "s"} selected`,
    multi_select_hint: "Turn on Multi-Select, then click avatars to select at least 2 groups to merge.",
    confirm_merge_people: (sources, target) => `Are you sure you want to merge ${sources} into "${target}"?`,
    photos_suffix: "photos",
    unnamed: "Unnamed",
    unnamed_count: (n) => `${n} photos (unnamed)`,
    feedback_title: "Is this the same person?",
    feedback_sub: (pct) => `Estimated similarity: ${pct}%`,
    feedback_yes: "Yes, merge",
    feedback_no: "Not the same",
    feedback_done: "All checked! No more pairs to confirm.",
    feedback_loading: "Looking for the next pair...",
    organize_title: "Organize into Name Folders",
    organize_sub: 'Photos of each named person will be sorted into a "<Name>" folder right inside the same subfolder as the original photo (keeping the original subfolder structure, no extra wrapper folder). Photos with multiple people will only go into the folder of the person with the largest face.',
    organize_confirm: "Are you sure you want to do this?",
    organize_confirm_btn: "Proceed",
    organize_no_data: "No named people yet to organize photos for.",
    organize_summary_total: (n) => `${n} photos in total will be processed:`,
    mode_copy: "Copy (keep originals, safe)",
    mode_move: "Move (removes originals)",
    organize_running: "Processing...",
    organize_result_ok: (p, s) => `Done: ${p} photos processed, ${s} skipped (already existed or missing).`,
    organize_result_errors: (n) => ` ${n} errors occurred.`,
    confirm_delete_person: "Delete this person? (Photos are kept, only the name assignment is removed)",
    confirm_lock_person: (name) => `Lock and PERMANENTLY DELETE recognition data for "${name}" from the database? This includes all face embeddings + thumbnails. Original photos on disk are NOT deleted. This action CANNOT be undone. Continue?`,
    lock_person_result: (n) => `Locked: permanently deleted data and ${n} face thumbnail(s) for this person.`,
    error_lock_person: "Could not lock this person.",
    alert_enter_folder: "Please enter a folder path.",
    alert_scan_error: (msg) => `Error starting scan: ${msg}`,
    alert_scan_failed: (msg) => `Scan failed: ${msg}`,
    settings_title: "Face Grouping Settings",
    settings_sub: 'Adjust the thresholds used to group faces into people. Changes take effect from the next scan/recluster, and do not affect existing data until you rescan or click "Recluster".',
    setting_sim_threshold: "Known-person match threshold",
    setting_sim_threshold_desc: "Higher = stricter (less likely to confuse two different people as one, but more likely to split one person into multiple groups).",
    setting_dbscan_eps: "New-group threshold (DBSCAN)",
    setting_dbscan_eps_desc: "Applies to \"unknown\" faces (matching no one) when auto-forming new people during a scan.",
    setting_min_samples: "Minimum faces to auto-form a group",
    setting_min_samples_desc: "A single unmatched face always becomes its own person regardless of this value.",
    setting_feedback_min_sim: "Feedback Loop suggestion threshold",
    setting_feedback_min_sim_desc: "Lower = more suggestions (including pairs that are only somewhat similar).",
    settings_reset: "Reset to defaults",
    settings_save: "Save changes",
    settings_saved: "Settings saved.",
    settings_reset_confirm: "Reset all parameters to their defaults?",
    recluster_title: "Recluster using current settings?",
    recluster_sub: 'The app will automatically merge groups of people with high similarity (based on the "known-person match" threshold in Settings). If BOTH people already have names, they will NOT be auto-merged to avoid disrupting groups you already confirmed — those still need manual confirmation via "Review groupings".',
    recluster_confirm_btn: "Start merging",
    recluster_stop_btn: "Request stop",
    recluster_running: "Merging...",
    recluster_result: (merged, skipped) => `Merged ${merged} pairs. Skipped ${skipped} pairs because both already had different names (needs manual confirmation).`,
    scan_errors_count: (n) => `${n} failed image${n === 1 ? "" : "s"}`,
    error_generic: "Something went wrong. Please try again.",
    error_load_photos: "Could not load photos.",
    error_load_people: "Could not load people.",
    people_list_title: "People list",
    people_list_sub: "Quick list view. Select a person to see all original photo paths on disk.",
    person_paths_sub: "Original photo paths on disk. Green = photo still exists. Gray strikethrough = photo has been deleted/moved from this location.",
    person_paths_count: (exists, total) => `${exists}/${total} photo(s) still exist on disk.`,
    error_load_person_paths: "Could not load photo paths for this person.",
    error_person_detail: "Could not load this person's details.",
    error_save_name: "Could not save this person's name.",
    error_delete_person: "Could not delete this person.",
    error_merge_people: "Could not merge people.",
    error_feedback: "Could not submit feedback.",
    error_organize_preview: "Could not load the organize preview.",
    error_organize_execute: "Could not organize photos.",
    error_settings_load: "Could not load settings.",
    error_settings_save: "Could not save settings.",
    error_settings_reset: "Could not reset settings.",
    error_recluster: "Could not recluster people.",
    error_scan_status: "Could not update scan status.",
    error_browse_folder: "Could not browse this folder.",
    import_data_btn: "+ Import new data",
    import_hint: "After scanning, photos of already-named people in this folder will be automatically sorted into named folders (still correctly recognizing people already known, even from a different folder).",
    import_organize_confirm: (n) => `Scan complete. ${n} photo(s) of already-named people in this folder will be organized into per-person folders (right inside the original subfolder). Continue?`,
    import_no_named_data: "Scan complete, but there are no photos of named people in this folder to organize yet.",
    error_import_organize: "Scan finished but automatic organizing failed.",
    cleanup_title: "Clean up thumbnail data",
    cleanup_desc: "Delete unnecessary thumbnails in the data folder (full-image thumbnails, face thumbnails of unnamed people, HEIC cache), keeping only the representative photo of each named person. Photos/faces still display normally afterward (regenerated on demand from the original), just slightly slower the first time.",
    cleanup_btn: "Clean up now",
    cleanup_confirm: "Delete extra thumbnails, keeping only representative photos of named people? Photos will still display normally when needed (just slower the first time).",
    cleanup_running: "Cleaning up...",
    cleanup_result: (count, mb) => `Deleted ${count} file(s), freed ${mb} MB. Kept representative photos of named people.`,
    error_cleanup: "Could not clean up data.",
  },
};

let currentLang = localStorage.getItem("fpa_lang") || "vi";

function t(key, ...args) {
  const dict = translations[currentLang] || translations.vi;
  const val = dict[key] ?? translations.vi[key] ?? key;
  return typeof val === "function" ? val(...args) : val;
}

function applyLanguage() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll("[data-i18n]").forEach((elm) => {
    elm.textContent = t(elm.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((elm) => {
    elm.placeholder = t(elm.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((elm) => {
    elm.title = t(elm.dataset.i18nTitle);
  });
  document.getElementById("langToggle").checked = currentLang === "en";
  if (currentView === "photos") document.getElementById("viewTitle").textContent = t("all_photos");
  else if (currentView === "people-list") document.getElementById("viewTitle").textContent = t("nav_people_list");
  else document.getElementById("viewTitle").textContent = t("people_title");
  if (currentView === "people") loadPeopleStats();
  else hidePeopleStats();
}

document.getElementById("langToggle").addEventListener("change", (e) => {
  currentLang = e.target.checked ? "en" : "vi";
  localStorage.setItem("fpa_lang", currentLang);
  applyLanguage();
  showView(currentView, true);
});

// ---------------- State ----------------
let currentView = "photos";
let currentPersonId = null;
let peopleMultiSelect = false;
const selectedPeople = new Map();

// ---------------- Data scope (Toàn bộ / Dữ liệu mới) ----------------
// dataScopeMode áp dụng chung cho cả 3 view (Ảnh, Con người, Danh sách con
// người) — khi = "new", mọi API call kèm scan_root = lastScanRoot để chỉ
// lấy dữ liệu của lần quét gần nhất (bất kể "Quét thư mục" hay "Thêm data
// mới"). lastScanRoot được lấy 1 lần từ backend lúc khởi động app.
let dataScopeMode = "all"; // "all" | "new"
let lastScanRoot = null;

async function fetchLastScanRoot() {
  try {
    const data = await apiGet("/scan/last-root");
    lastScanRoot = data.scan_root || null;
  } catch (e) {
    lastScanRoot = null;
  }
}

function scopeQuery() {
  if (dataScopeMode === "new" && lastScanRoot) {
    return `?scan_root=${encodeURIComponent(lastScanRoot)}`;
  }
  return "";
}

function setDataScopeMode(mode) {
  if (mode === "new" && !lastScanRoot) {
    alert(t("scope_new_disabled_msg"));
    return;
  }
  dataScopeMode = mode;
  document.querySelectorAll(".data-scope-toggle .scope-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.scope === mode);
  });
  if (currentView === "photos") loadPhotos();
  else if (currentView === "people") { loadPeopleStats(); loadPeople(); }
  else if (currentView === "people-list") loadPeopleListView();
}

document.querySelectorAll(".data-scope-toggle .scope-btn").forEach((btn) => {
  btn.addEventListener("click", () => setDataScopeMode(btn.dataset.scope));
});
let scanPollTimer = null;

// ---------------- Helpers ----------------
async function apiGet(path) {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
async function apiJson(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function showError(message, error) {
  const text = message || t("error_generic");
  if (error) console.error(text, error);
  alert(error && error.message ? `${text} ${error.message}` : text);
}

async function safeRun(asyncFn, fallbackMessage) {
  try {
    return await asyncFn();
  } catch (error) {
    showError(fallbackMessage, error);
    return null;
  }
}

function el(tag, className, html) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function hidePeopleStats() {
  const stats = document.getElementById("peopleStats");
  stats.style.display = "none";
  stats.textContent = "";
}

async function loadPeopleStats() {
  if (currentView !== "people") {
    hidePeopleStats();
    return;
  }

  const stats = document.getElementById("peopleStats");
  const data = await safeRun(() => apiGet(`/persons/stats${scopeQuery()}`), t("error_load_people"));
  if (!data || currentView !== "people") {
    hidePeopleStats();
    return;
  }

  stats.textContent = t("people_stats", data.total, data.named, data.unnamed);
  stats.style.display = "inline";
}

// ---------------- Navigation ----------------
document.querySelectorAll(".nav-item[data-view]").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.view));
});

function showView(view, forceReload) {
  const changed = view !== currentView || forceReload;
  currentView = view;
  document.querySelectorAll(".nav-item[data-view]").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === view)
  );
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));

  if (view === "photos") {
    document.getElementById("view-photos").classList.add("active");
    document.getElementById("viewTitle").textContent = t("all_photos");
    hidePeopleStats();
    if (changed) loadPhotos();
  } else if (view === "people") {
    document.getElementById("view-people").classList.add("active");
    document.getElementById("viewTitle").textContent = t("people_title");
    loadPeopleStats();
    if (changed) loadPeople();
  } else if (view === "people-list") {
    document.getElementById("view-people-list").classList.add("active");
    document.getElementById("viewTitle").textContent = t("nav_people_list");
    hidePeopleStats();
    if (changed) loadPeopleListView();
  } else if (view === "person-detail") {
    document.getElementById("view-person-detail").classList.add("active");
    document.getElementById("viewTitle").textContent = t("people_title");
    hidePeopleStats();
  }
}

document.getElementById("backToPeople").addEventListener("click", () => showView("people"));

// ---------------- Photos view ----------------
async function loadPhotos() {
  await safeRun(async () => {
    const grid = document.getElementById("photosGrid");
    const empty = document.getElementById("photosEmpty");
    grid.innerHTML = "";
    const images = await apiGet(`/images${scopeQuery()}`);
    empty.style.display = images.length === 0 ? "block" : "none";
    for (const img of images) {
      const tile = el("div", "photo-tile");
      const im = el("img");
      im.src = `${API}/images/${img.id}/thumb`;
      im.loading = "lazy";
      im.alt = img.filename;
      tile.appendChild(im);
      tile.addEventListener("click", () => openLightbox(img.id));
      grid.appendChild(tile);
    }
  }, t("error_load_photos"));
}

function openLightbox(imageId) {
  document.getElementById("lightboxImg").src = `${API}/images/${imageId}/file`;
  document.getElementById("lightbox").style.display = "flex";
}
document.getElementById("lightboxClose").addEventListener("click", () => {
  document.getElementById("lightbox").style.display = "none";
});
document.getElementById("lightbox").addEventListener("click", (e) => {
  if (e.target.id === "lightbox") document.getElementById("lightbox").style.display = "none";
});

// ---------------- People view (grid) ----------------
function personLabel(person) {
  return person.name || t("unnamed_count", person.face_count);
}

function updateMultiSelectControls() {
  const checkbox = document.getElementById("peopleMultiSelectCheck");
  const mergeBtn = document.getElementById("multiMergeBtn");
  const count = document.getElementById("multiSelectCount");
  if (!checkbox || !mergeBtn || !count) return;
  checkbox.checked = peopleMultiSelect;
  mergeBtn.disabled = selectedPeople.size < 2;
  count.textContent = peopleMultiSelect && selectedPeople.size > 0 ? t("multi_select_count", selectedPeople.size) : "";
}

function setPeopleMultiSelect(enabled) {
  peopleMultiSelect = enabled;
  selectedPeople.clear();
  document.querySelectorAll(".person-card.selected").forEach((card) => card.classList.remove("selected"));
  updateMultiSelectControls();
}

function togglePersonSelection(person, card) {
  if (selectedPeople.has(person.id)) {
    selectedPeople.delete(person.id);
    card.classList.remove("selected");
  } else {
    selectedPeople.set(person.id, person);
    card.classList.add("selected");
  }
  updateMultiSelectControls();
}

async function loadPeople() {
  loadPeopleStats();
  await safeRun(async () => {
    const grid = document.getElementById("peopleGrid");
    const empty = document.getElementById("peopleEmpty");
    grid.innerHTML = "";
    const persons = await apiGet(`/persons${scopeQuery()}`);
    empty.style.display = persons.length === 0 ? "block" : "none";
    selectedPeople.forEach((_, id) => {
      if (!persons.some((p) => p.id === id)) selectedPeople.delete(id);
    });
    for (const p of persons) {
      const card = el("div", "person-card");
      if (selectedPeople.has(p.id)) card.classList.add("selected");
      const avatar = el("img", "person-avatar");
      avatar.src = `${API}/faces/${p.representative_face_id}/thumb`;
      const checkmark = el("div", "person-select-check", "✓");
      const name = el("div", "person-card-name", p.name ? escapeHtml(p.name) : t("unnamed"));
      const count = el("div", "person-card-count", `${p.photo_count} ${t("photos_suffix")}`);
      card.appendChild(avatar);
      card.appendChild(checkmark);
      card.appendChild(name);
      card.appendChild(count);
      card.addEventListener("click", () => {
        if (peopleMultiSelect) togglePersonSelection(p, card);
        else openPersonDetail(p.id);
      });
      grid.appendChild(card);
    }
    updateMultiSelectControls();
  }, t("error_load_people"));
}

// ---------------- People List view (danh sách + đường dẫn ảnh) ----------------
// View riêng, độc lập với lưới "Con người" — mỗi hàng chỉ có avatar nhỏ +
// tên + số ảnh (không thumbnail nào khác). Chọn 1 người sẽ mở modal hiển
// thị đường dẫn ảnh dạng TEXT THUẦN, không tốn thêm dung lượng data/thumbs.
async function loadPeopleListView() {
  await safeRun(async () => {
    const container = document.getElementById("peopleListContainer");
    const empty = document.getElementById("peopleListEmpty");
    container.innerHTML = "";
    const persons = await apiGet(`/persons${scopeQuery()}`);
    empty.style.display = persons.length === 0 ? "block" : "none";
    for (const p of persons) {
      const row = el("div", "people-list-row");
      const avatar = el("img", "people-list-avatar");
      avatar.src = `${API}/faces/${p.representative_face_id}/thumb`;
      avatar.loading = "lazy";
      const name = el("div", "people-list-name", p.name ? escapeHtml(p.name) : t("unnamed"));
      const count = el("div", "people-list-count", `${p.photo_count} ${t("photos_suffix")}`);
      row.appendChild(avatar);
      row.appendChild(name);
      row.appendChild(count);
      row.addEventListener("click", () => openPersonPaths(p));
      container.appendChild(row);
    }
  }, t("error_load_people"));
}

const personPathsModal = document.getElementById("personPathsModal");
async function openPersonPaths(person) {
  await safeRun(async () => {
    document.getElementById("personPathsTitle").textContent = person.name || t("unnamed");
    personPathsModal.style.display = "flex";
    const listEl = document.getElementById("personPathsList");
    const countEl = document.getElementById("personPathsCount");
    listEl.innerHTML = "";
    countEl.textContent = "...";

    const paths = await apiGet(`/persons/${person.id}/paths`);
    const existsCount = paths.filter((row) => row.exists).length;
    countEl.textContent = t("person_paths_count", existsCount, paths.length);

    for (const row of paths) {
      const line = el(
        "div",
        `path-line ${row.exists ? "path-exists" : "path-missing"}`,
        escapeHtml(row.path || "")
      );
      listEl.appendChild(line);
    }
  }, t("error_load_person_paths"));
}
document.getElementById("closePersonPaths").addEventListener("click", () => {
  personPathsModal.style.display = "none";
});
personPathsModal.addEventListener("click", (e) => {
  if (e.target.id === "personPathsModal") personPathsModal.style.display = "none";
});

async function openPersonDetail(personId) {
  await safeRun(async () => {
    currentPersonId = personId;
    showView("person-detail");

    const persons = await apiGet("/persons");
    const person = persons.find((p) => p.id === personId);
    if (!person) return;

    document.getElementById("personHeaderThumb").src = `${API}/faces/${person.representative_face_id}/thumb`;
    document.getElementById("personNameInput").value = person.name || "";
    document.getElementById("personCount").textContent = `${person.photo_count} ${t("photos_suffix")}`;

    const photos = await apiGet(`/persons/${personId}/photos`);
    const grid = document.getElementById("personPhotosGrid");
    grid.innerHTML = "";
    for (const img of photos) {
      const tile = el("div", "photo-tile");
      const im = el("img");
      im.src = `${API}/images/${img.id}/thumb`;
      im.loading = "lazy";
      tile.appendChild(im);
      tile.addEventListener("click", () => openLightbox(img.id));
      grid.appendChild(tile);
    }
  }, t("error_person_detail"));
}

let nameSaveTimer = null;
document.getElementById("personNameInput").addEventListener("input", (e) => {
  clearTimeout(nameSaveTimer);
  const value = e.target.value;
  const personId = currentPersonId;
  nameSaveTimer = setTimeout(async () => {
    try {
      await apiJson("PUT", `/persons/${personId}`, { name: value });
      loadPeopleStats();
    } catch (error) {
      showError(t("error_save_name"), error);
    }
  }, 500);
});

document.getElementById("deletePersonBtn").addEventListener("click", async () => {
  if (!confirm(t("confirm_delete_person"))) return;
  const deleted = await safeRun(
    () => apiJson("DELETE", `/persons/${currentPersonId}`),
    t("error_delete_person")
  );
  if (deleted !== null) {
    showView("people");
    loadPeopleStats();
  }
});

// "Khóa" (lock): xoá VĨNH VIỄN embedding + thumbnail khuôn mặt của người
// này khỏi database (khác với "Xoá người này" ở trên, vốn chỉ bỏ gán tên
// và vẫn giữ lại dữ liệu khuôn mặt để có thể gán lại sau này).
document.getElementById("lockPersonBtn").addEventListener("click", async () => {
  const nameInput = document.getElementById("personNameInput").value.trim();
  const personLabel = nameInput || t("unnamed");
  if (!confirm(t("confirm_lock_person", personLabel))) return;

  const result = await safeRun(
    () => apiJson("DELETE", `/persons/${currentPersonId}?delete_faces=true`),
    t("error_lock_person")
  );
  if (result !== null) {
    alert(t("lock_person_result", result.deleted_thumbnails || 0));
    showView("people");
    loadPeopleStats();
  }
});

// ---------------- Merge ----------------
async function openMergePicker(sourcePeople, afterMerge) {
  await safeRun(async () => {
    if (!sourcePeople.length) return;
    const sourceIds = new Set(sourcePeople.map((p) => p.id));
    const persons = await apiGet("/persons");
    const list = document.getElementById("mergeList");
    list.innerHTML = "";
    for (const p of persons) {
      if (sourceIds.has(p.id)) continue;
      const item = el("div", "merge-list-item");
      const img = el("img");
      img.src = `${API}/faces/${p.representative_face_id}/thumb`;
      const label = el("span", null, escapeHtml(personLabel(p)));
      item.appendChild(img);
      item.appendChild(label);
      item.addEventListener("click", async () => {
        const sourceNames = sourcePeople.map(personLabel).join(", ");
        if (!confirm(t("confirm_merge_people", sourceNames, personLabel(p)))) return;

        for (const source of sourcePeople) {
          const merged = await safeRun(
            () => apiJson("POST", "/persons/merge", { source_id: source.id, target_id: p.id }),
            t("error_merge_people")
          );
          if (merged === null) return;
        }
        document.getElementById("mergeModal").style.display = "none";
        loadPeopleStats();
        if (afterMerge) afterMerge(p);
      });
      list.appendChild(item);
    }
    document.getElementById("mergeModal").style.display = "flex";
  }, t("error_merge_people"));
}

document.getElementById("mergeBtn").addEventListener("click", async () => {
  const persons = await apiGet("/persons");
  const current = persons.find((p) => p.id === currentPersonId);
  if (!current) return;
  openMergePicker([current], (target) => openPersonDetail(target.id));
});

document.getElementById("peopleMultiSelectCheck").addEventListener("change", (e) => {
  setPeopleMultiSelect(e.target.checked);
});

document.getElementById("multiMergeBtn").addEventListener("click", async () => {
  if (selectedPeople.size < 2) {
    alert(t("multi_select_hint"));
    return;
  }
  openMergePicker(Array.from(selectedPeople.values()), () => {
    setPeopleMultiSelect(false);
    loadPeople();
  });
});

document.getElementById("cancelMerge").addEventListener("click", () => {
  document.getElementById("mergeModal").style.display = "none";
});

// ---------------- Scan modal ----------------
const scanModal = document.getElementById("scanModal");
let isImportFlow = false; // true khi mở modal quét từ nút "Thêm data mới"

function openScanModal(importMode) {
  isImportFlow = importMode;
  document.getElementById("importHint").style.display = importMode ? "block" : "none";
  document.getElementById("scanModalTitle").textContent = importMode
    ? t("import_data_btn").replace(/^\+\s*/, "")
    : t("scan_modal_title");
  scanModal.style.display = "flex";
  document.getElementById("scanProgress").style.display = "none";
  document.getElementById("startScan").disabled = false;
}

document.getElementById("scanBtn").addEventListener("click", () => openScanModal(false));
document.getElementById("importDataBtn").addEventListener("click", () => openScanModal(true));

document.getElementById("cancelScan").addEventListener("click", () => {
  scanModal.style.display = "none";
});

document.getElementById("startScan").addEventListener("click", async () => {
  const folder = document.getElementById("folderInput").value.trim();
  if (!folder) {
    alert(t("alert_enter_folder"));
    return;
  }
  const recursive = document.getElementById("recursiveCheck").checked;
  const use_gpu = document.getElementById("gpuCheck").checked;

  document.getElementById("startScan").disabled = true;
  document.getElementById("scanProgress").style.display = "block";
  document.getElementById("scanMessage").textContent = "...";

  try {
    await apiJson("POST", "/scan", { folder, recursive, use_gpu });
  } catch (e) {
    alert(t("alert_scan_error", e.message));
    document.getElementById("startScan").disabled = false;
    return;
  }
  pollScanStatus();
});

// Sau khi "Thêm data mới" quét xong: tự tổ chức (organize) CHỈ ảnh trong
// folder vừa quét vào thư mục theo tên — nhưng vẫn nhận diện người dựa trên
// TOÀN BỘ database (nên vẫn khớp đúng người đã đặt tên từ trước, dù ở
// folder khác). Xem backend: organize.build_plan(scan_root=...).
async function organizeAfterImport(scanRoot) {
  if (!scanRoot) return;
  const preview = await safeRun(
    () => apiGet(`/organize/preview?scan_root=${encodeURIComponent(scanRoot)}`),
    t("error_import_organize")
  );
  if (!preview) return;
  if (preview.total_photos === 0) {
    alert(t("import_no_named_data"));
    return;
  }
  if (!confirm(t("import_organize_confirm", preview.total_photos))) return;

  const result = await safeRun(
    () => apiJson("POST", "/organize/execute", { mode: "copy", scan_root: scanRoot }),
    t("error_import_organize")
  );
  if (!result) return;
  let msg = t("organize_result_ok", result.processed, result.skipped);
  if (result.errors && result.errors.length > 0) {
    msg += t("organize_result_errors", result.errors.length);
  }
  alert(msg);
  if (currentView === "photos") loadPhotos();
}

// Sau khi "Thêm data mới" (quét + tổ chức xong), hỏi xác nhận có muốn dọn
// dẹp thumbnail thừa ngay không (chỉ giữ ảnh đại diện người đã đặt tên) để
// giảm dung lượng data/thumbs sau khi thêm nhiều ảnh mới.
async function maybeCleanupAfterImport() {
  if (!confirm(t("cleanup_confirm"))) return;
  const result = await safeRun(
    () => apiJson("POST", "/cleanup/thumbs", {}),
    t("error_cleanup")
  );
  if (!result) return;
  const mb = (result.freed_bytes / (1024 * 1024)).toFixed(1);
  alert(t("cleanup_result", result.deleted_count, mb));
  showView(currentView, true);
  loadPeopleStats();
}

function pollScanStatus() {
  clearInterval(scanPollTimer);
  scanPollTimer = setInterval(async () => {
    const status = await safeRun(() => apiGet("/scan/status"), t("error_scan_status"));
    if (!status) {
      clearInterval(scanPollTimer);
      document.getElementById("startScan").disabled = false;
      return;
    }
    const pct = status.total > 0 ? Math.round((status.processed / status.total) * 100) : 0;
    document.getElementById("progressFill").style.width = pct + "%";
    const scanMessage = status.message || status.status;
    const failedCount = status.failed || 0;
    document.getElementById("scanMessage").textContent = failedCount
      ? `${scanMessage} — ${t("scan_errors_count", failedCount)}`
      : scanMessage;

    if (status.gpu_active !== null && status.gpu_active !== undefined) {
      const badge = document.getElementById("gpuBadge");
      badge.style.display = "inline-block";
      badge.textContent = status.gpu_active ? "GPU" : "CPU";
      badge.className = "gpu-badge" + (status.gpu_active ? "" : " cpu");
    }

    if (status.status === "done" || status.status === "error") {
      clearInterval(scanPollTimer);
      document.getElementById("startScan").disabled = false;
      if (status.status === "error") {
        alert(t("alert_scan_failed", status.message));
      } else {
        const wasImportFlow = isImportFlow;
        const scanRoot = status.scan_root;
        lastScanRoot = scanRoot || lastScanRoot;
        setTimeout(async () => {
          scanModal.style.display = "none";
          showView(currentView, true);
          loadPeopleStats();
          isImportFlow = false;
          if (wasImportFlow) {
            await organizeAfterImport(scanRoot);
            await maybeCleanupAfterImport();
          }
        }, 800);
      }
    }
  }, 700);
}

// ---------------- Folder Browser ----------------
const folderBrowserModal = document.getElementById("folderBrowserModal");
let browserCurrentPath = "";
let browserParentPath = null;

document.getElementById("browseFolderBtn").addEventListener("click", () => {
  const startPath = document.getElementById("folderInput").value.trim();
  folderBrowserModal.style.display = "flex";
  loadBrowser(startPath || "");
});
document.getElementById("cancelBrowse").addEventListener("click", () => {
  folderBrowserModal.style.display = "none";
});
document.getElementById("browserUpBtn").addEventListener("click", () => {
  if (browserParentPath !== null) loadBrowser(browserParentPath);
});
document.getElementById("browserHomeBtn").addEventListener("click", () => {
  loadBrowser("");
});
document.getElementById("chooseFolderBtn").addEventListener("click", () => {
  if (browserCurrentPath) {
    document.getElementById("folderInput").value = browserCurrentPath;
  }
  folderBrowserModal.style.display = "none";
});

async function loadBrowser(path) {
  let data;
  try {
    data = await apiGet(`/browse?path=${encodeURIComponent(path)}`);
  } catch (e) {
    showError(t("error_browse_folder"), e);
    return;
  }
  browserCurrentPath = data.current_path;
  browserParentPath = data.parent_path;
  document.getElementById("browserCurrentPath").value = data.current_path || "/";
  document.getElementById("browserUpBtn").disabled = data.parent_path === null;

  const list = document.getElementById("browserList");
  list.innerHTML = "";
  if (data.directories.length === 0) {
    list.appendChild(el("div", "browser-empty", "—"));
    return;
  }
  for (const dir of data.directories) {
    const item = el("div", "browser-item");
    item.innerHTML = `<svg class="folder-icon" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg> <span></span>`;
    item.querySelector("span").textContent = dir.name;
    item.addEventListener("click", () => loadBrowser(dir.path));
    list.appendChild(item);
  }
}

// ---------------- Feedback Loop ----------------
const feedbackModal = document.getElementById("feedbackModal");
let feedbackCurrent = null;

document.getElementById("feedbackBtn").addEventListener("click", () => {
  feedbackModal.style.display = "flex";
  loadNextFeedback();
});
document.getElementById("feedbackClose").addEventListener("click", () => {
  feedbackModal.style.display = "none";
  if (currentView === "people") loadPeople();
  if (currentView === "people-list") loadPeopleListView();
  if (currentView === "person-detail" && currentPersonId) openPersonDetail(currentPersonId);
});

async function loadNextFeedback() {
  await safeRun(async () => {
    document.getElementById("feedbackContent").style.display = "none";
    document.getElementById("feedbackDone").style.display = "none";
    document.querySelector(".feedback-buttons").style.display = "none";
    document.getElementById("feedbackSub").textContent = t("feedback_loading");

    const res = await apiGet("/feedback/next");
    if (res.done) {
      feedbackCurrent = null;
      document.getElementById("feedbackDone").style.display = "block";
      document.getElementById("feedbackSub").textContent = "";
      return;
    }
    feedbackCurrent = res;
    document.getElementById("feedbackContent").style.display = "flex";
    document.querySelector(".feedback-buttons").style.display = "flex";
    document.getElementById("feedbackSub").textContent = t("feedback_sub", Math.round(res.similarity * 100));

    document.getElementById("feedbackImgA").src = `${API}/faces/${res.person_a.representative_face_id}/thumb`;
    document.getElementById("feedbackNameA").textContent = res.person_a.name || t("unnamed");
    document.getElementById("feedbackImgB").src = `${API}/faces/${res.person_b.representative_face_id}/thumb`;
    document.getElementById("feedbackNameB").textContent = res.person_b.name || t("unnamed");
  }, t("error_feedback"));
}

document.getElementById("feedbackYes").addEventListener("click", async () => {
  if (!feedbackCurrent) return;
  const saved = await safeRun(
    () => apiJson("POST", "/feedback/decide", {
      person_a_id: feedbackCurrent.person_a.id,
      person_b_id: feedbackCurrent.person_b.id,
      decision: "merge",
    }),
    t("error_feedback")
  );
  if (saved !== null) {
    loadPeopleStats();
    loadNextFeedback();
  }
});
document.getElementById("feedbackNo").addEventListener("click", async () => {
  if (!feedbackCurrent) return;
  const saved = await safeRun(
    () => apiJson("POST", "/feedback/decide", {
      person_a_id: feedbackCurrent.person_a.id,
      person_b_id: feedbackCurrent.person_b.id,
      decision: "reject",
    }),
    t("error_feedback")
  );
  if (saved !== null) loadNextFeedback();
});

// ---------------- Organize ----------------
const organizeModal = document.getElementById("organizeModal");
document.getElementById("organizeBtn").addEventListener("click", async () => {
  organizeModal.style.display = "flex";
  document.getElementById("organizeResult").style.display = "none";
  document.getElementById("confirmOrganize").disabled = false;
  const summaryBox = document.getElementById("organizeSummary");
  summaryBox.innerHTML = "...";
  const preview = await safeRun(() => apiGet("/organize/preview"), t("error_organize_preview"));
  if (!preview) {
    summaryBox.textContent = t("error_organize_preview");
    document.getElementById("confirmOrganize").disabled = true;
    return;
  }
  summaryBox.innerHTML = "";
  if (preview.total_photos === 0) {
    summaryBox.textContent = t("organize_no_data");
    document.getElementById("confirmOrganize").disabled = true;
    return;
  }
  summaryBox.appendChild(el("div", null, `<strong>${t("organize_summary_total", preview.total_photos)}</strong>`));
  for (const item of preview.by_person) {
    const row = el("div", "organize-summary-row");
    row.innerHTML = `<span>${escapeHtml(item.name)}</span><span>${item.count} ${t("photos_suffix")}</span>`;
    summaryBox.appendChild(row);
  }
});
document.getElementById("cancelOrganize").addEventListener("click", () => {
  organizeModal.style.display = "none";
});

document.getElementById("confirmOrganize").addEventListener("click", async () => {
  const mode = document.querySelector('input[name="organizeMode"]:checked').value;
  if (!confirm(t("organize_confirm"))) return;

  const btn = document.getElementById("confirmOrganize");
  btn.disabled = true;
  const resultBox = document.getElementById("organizeResult");
  resultBox.style.display = "block";
  resultBox.className = "organize-result";
  resultBox.textContent = t("organize_running");

  try {
    const result = await apiJson("POST", "/organize/execute", { mode });
    let msg = t("organize_result_ok", result.processed, result.skipped);
    if (result.errors && result.errors.length > 0) {
      msg += t("organize_result_errors", result.errors.length);
      resultBox.classList.add("has-errors");
    }
    resultBox.textContent = msg;
    if (currentView === "photos") loadPhotos();
  } catch (e) {
    resultBox.classList.add("has-errors");
    resultBox.textContent = `${t("error_organize_execute")} ${e.message}`;
  } finally {
    btn.disabled = false;
  }
});

// ---------------- Settings ----------------
const settingsModal = document.getElementById("settingsModal");
const settingInputs = {
  sim_threshold: document.getElementById("simThresholdInput"),
  dbscan_eps: document.getElementById("dbscanEpsInput"),
  dbscan_min_samples: document.getElementById("minSamplesInput"),
  feedback_min_sim: document.getElementById("feedbackMinSimInput"),
};
const settingValueLabels = {
  sim_threshold: document.getElementById("simThresholdValue"),
  dbscan_eps: document.getElementById("dbscanEpsValue"),
  dbscan_min_samples: document.getElementById("minSamplesValue"),
  feedback_min_sim: document.getElementById("feedbackMinSimValue"),
};

function formatSettingValue(key, val) {
  return key === "dbscan_min_samples" ? String(val) : Number(val).toFixed(2);
}

function fillSettingsForm(values) {
  for (const key of Object.keys(settingInputs)) {
    settingInputs[key].value = values[key];
    settingValueLabels[key].textContent = formatSettingValue(key, values[key]);
  }
}

Object.keys(settingInputs).forEach((key) => {
  settingInputs[key].addEventListener("input", () => {
    settingValueLabels[key].textContent = formatSettingValue(key, settingInputs[key].value);
  });
});

document.getElementById("settingsBtn").addEventListener("click", async () => {
  const data = await safeRun(() => apiGet("/settings"), t("error_settings_load"));
  if (!data) return;
  fillSettingsForm(data.values);
  settingsModal.style.display = "flex";
});
document.getElementById("cancelSettings").addEventListener("click", () => {
  settingsModal.style.display = "none";
});
document.getElementById("saveSettings").addEventListener("click", async () => {
  const payload = {
    sim_threshold: parseFloat(settingInputs.sim_threshold.value),
    dbscan_eps: parseFloat(settingInputs.dbscan_eps.value),
    dbscan_min_samples: parseInt(settingInputs.dbscan_min_samples.value, 10),
    feedback_min_sim: parseFloat(settingInputs.feedback_min_sim.value),
  };
  const data = await safeRun(() => apiJson("PUT", "/settings", payload), t("error_settings_save"));
  if (!data) return;
  fillSettingsForm(data.values);
  alert(t("settings_saved"));
  settingsModal.style.display = "none";
});
document.getElementById("resetSettings").addEventListener("click", async () => {
  if (!confirm(t("settings_reset_confirm"))) return;
  const data = await safeRun(() => apiJson("DELETE", "/settings"), t("error_settings_reset"));
  if (!data) return;
  fillSettingsForm(data.values);
});

// ---------------- Cleanup thumbnail thừa ----------------
document.getElementById("cleanupThumbsBtn").addEventListener("click", async () => {
  if (!confirm(t("cleanup_confirm"))) return;
  const btn = document.getElementById("cleanupThumbsBtn");
  const resultBox = document.getElementById("cleanupResult");
  btn.disabled = true;
  resultBox.style.display = "block";
  resultBox.className = "organize-result";
  resultBox.textContent = t("cleanup_running");

  try {
    const result = await apiJson("POST", "/cleanup/thumbs", {});
    const mb = (result.freed_bytes / (1024 * 1024)).toFixed(1);
    resultBox.textContent = t("cleanup_result", result.deleted_count, mb);
    if (result.errors && result.errors.length > 0) {
      resultBox.classList.add("has-errors");
    }
    // Ảnh/khuôn mặt đang hiển thị có thể đã bị xoá thumbnail -> tải lại view
    // hiện tại để backend tự sinh lại từ ảnh gốc khi cần.
    showView(currentView, true);
    loadPeopleStats();
  } catch (e) {
    resultBox.classList.add("has-errors");
    resultBox.textContent = `${t("error_cleanup")} ${e.message}`;
  } finally {
    btn.disabled = false;
  }
});

// ---------------- Recluster ----------------
const reclusterModal = document.getElementById("reclusterModal");
let reclusterPollTimer = null;

function setReclusterRunning(isRunning) {
  document.getElementById("confirmRecluster").disabled = isRunning;
  document.getElementById("requestStopRecluster").disabled = !isRunning;
}

function renderReclusterStatus(status) {
  document.getElementById("reclusterStatus").textContent = status.status || "idle";
  document.getElementById("reclusterMessage").textContent = status.message || "—";
  document.getElementById("reclusterMergedCount").textContent = status.merged_count || 0;
  document.getElementById("reclusterSkippedConflicts").textContent = status.skipped_named_conflicts || 0;
  const logText = (status.logs || [])
    .map((entry) => `[${entry.at || ""}] ${entry.message || ""}`)
    .join("\n");
  const logsBox = document.getElementById("reclusterLogs");
  logsBox.value = logText;
  logsBox.scrollTop = logsBox.scrollHeight;

  const resultBox = document.getElementById("reclusterResult");
  if (status.status && status.status !== "idle") {
    resultBox.style.display = "block";
    resultBox.className = "organize-result";
    if (status.status === "error") resultBox.classList.add("has-errors");
    if (["done", "cancelled", "error"].includes(status.status)) {
      resultBox.textContent = status.message || t("recluster_result", status.merged_count || 0, status.skipped_named_conflicts || 0);
    } else {
      resultBox.textContent = status.message || t("recluster_running");
    }
  }
}

function stopReclusterPolling() {
  if (reclusterPollTimer) clearInterval(reclusterPollTimer);
  reclusterPollTimer = null;
}

async function pollReclusterStatus() {
  try {
    const status = await apiGet("/recluster/status");
    renderReclusterStatus(status);
    const running = status.status === "running" || status.status === "cancelling";
    setReclusterRunning(running);
    if (["done", "error", "cancelled"].includes(status.status)) {
      stopReclusterPolling();
      loadPeopleStats();
      if (currentView === "people") loadPeople();
      if (currentView === "people-list") loadPeopleListView();
    }
  } catch (e) {
    stopReclusterPolling();
    setReclusterRunning(false);
    const resultBox = document.getElementById("reclusterResult");
    resultBox.style.display = "block";
    resultBox.className = "organize-result has-errors";
    resultBox.textContent = `${t("error_recluster")} ${e.message}`;
  }
}

function startReclusterPolling() {
  stopReclusterPolling();
  pollReclusterStatus();
  reclusterPollTimer = setInterval(pollReclusterStatus, 800);
}

document.getElementById("reclusterBtn").addEventListener("click", () => {
  document.getElementById("reclusterResult").style.display = "none";
  setReclusterRunning(false);
  reclusterModal.style.display = "flex";
  pollReclusterStatus();
});
document.getElementById("cancelRecluster").addEventListener("click", () => {
  reclusterModal.style.display = "none";
});
document.getElementById("requestStopRecluster").addEventListener("click", async () => {
  document.getElementById("requestStopRecluster").disabled = true;
  await safeRun(() => apiJson("POST", "/recluster/cancel", {}), t("error_recluster"));
  startReclusterPolling();
});
document.getElementById("confirmRecluster").addEventListener("click", async () => {
  const resultBox = document.getElementById("reclusterResult");
  resultBox.style.display = "block";
  resultBox.className = "organize-result";
  resultBox.textContent = t("recluster_running");
  setReclusterRunning(true);

  try {
    const started = await apiJson("POST", "/recluster/start", {});
    if (started.started) startReclusterPolling();
  } catch (e) {
    stopReclusterPolling();
    setReclusterRunning(false);
    resultBox.classList.add("has-errors");
    resultBox.textContent = `${t("error_recluster")} ${e.message}`;
  }
});

// ---------------- Init ----------------
applyLanguage();
fetchLastScanRoot();
showView("photos");
