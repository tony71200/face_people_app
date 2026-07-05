const API = "/api";

// ---------------- i18n ----------------
const translations = {
  vi: {
    library: "Thư viện ảnh",
    nav_photos: "Ảnh",
    nav_people: "Con người",
    feedback_btn: "Kiểm tra lại nhóm",
    organize_btn: "Tạo thư mục theo tên",
    recluster_btn: "Gộp lại (Reclustering)",
    settings_btn: "Cài đặt",
    scan_button: "+ Quét thư mục",
    all_photos: "Tất cả ảnh",
    people_title: "Con người",
    empty_photos: "Chưa có ảnh nào.",
    empty_photos_sub: 'Nhấn "Quét thư mục" ở góc trái để bắt đầu.',
    empty_people: "Chưa nhận diện được ai.",
    empty_people_sub: "Quét một thư mục ảnh để bắt đầu nhóm khuôn mặt.",
    back_to_people: "‹ Con người",
    placeholder_name: "Thêm tên...",
    merge_btn: "Gộp với người khác...",
    delete_person_btn: "Xoá người này",
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
    organize_sub: 'Ảnh của mỗi người đã đặt tên sẽ được sắp xếp vào thư mục "Organized/&lt;Tên&gt;" ngay trong thư mục gốc đã quét, giữ nguyên cấu trúc thư mục con. Ảnh có nhiều người sẽ chỉ vào thư mục của người có khuôn mặt lớn nhất.',
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
    recluster_running: "Đang gộp...",
    recluster_result: (merged, skipped) => `Đã gộp ${merged} cặp người. Bỏ qua ${skipped} cặp vì cả 2 đều đã có tên khác nhau (cần xác nhận tay).`,
    scan_errors_count: (n) => `${n} ảnh lỗi`,
  },
  en: {
    library: "Photo Library",
    nav_photos: "Photos",
    nav_people: "People",
    feedback_btn: "Review groupings",
    organize_btn: "Organize into folders",
    recluster_btn: "Recluster",
    settings_btn: "Settings",
    scan_button: "+ Scan folder",
    all_photos: "All Photos",
    people_title: "People",
    empty_photos: "No photos yet.",
    empty_photos_sub: 'Click "Scan folder" on the left to get started.',
    empty_people: "No one recognized yet.",
    empty_people_sub: "Scan a photo folder to start grouping faces.",
    back_to_people: "‹ People",
    placeholder_name: "Add name...",
    merge_btn: "Merge with another person...",
    delete_person_btn: "Delete this person",
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
    organize_sub: 'Photos of each named person will be sorted into an "Organized/&lt;Name&gt;" folder right inside the original scanned folder, keeping the original subfolder structure. Photos with multiple people will only go into the folder of the person with the largest face.',
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
    recluster_running: "Merging...",
    recluster_result: (merged, skipped) => `Merged ${merged} pairs. Skipped ${skipped} pairs because both already had different names (needs manual confirmation).`,
    scan_errors_count: (n) => `${n} failed image${n === 1 ? "" : "s"}`,
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
  else document.getElementById("viewTitle").textContent = t("people_title");
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
    if (changed) loadPhotos();
  } else if (view === "people") {
    document.getElementById("view-people").classList.add("active");
    document.getElementById("viewTitle").textContent = t("people_title");
    if (changed) loadPeople();
  } else if (view === "person-detail") {
    document.getElementById("view-person-detail").classList.add("active");
    document.getElementById("viewTitle").textContent = t("people_title");
  }
}

document.getElementById("backToPeople").addEventListener("click", () => showView("people"));

// ---------------- Photos view ----------------
async function loadPhotos() {
  const grid = document.getElementById("photosGrid");
  const empty = document.getElementById("photosEmpty");
  grid.innerHTML = "";
  const images = await apiGet("/images");
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

// ---------------- People view ----------------
async function loadPeople() {
  const grid = document.getElementById("peopleGrid");
  const empty = document.getElementById("peopleEmpty");
  grid.innerHTML = "";
  const persons = await apiGet("/persons");
  empty.style.display = persons.length === 0 ? "block" : "none";
  for (const p of persons) {
    const card = el("div", "person-card");
    const avatar = el("img", "person-avatar");
    avatar.src = `${API}/faces/${p.representative_face_id}/thumb`;
    const name = el("div", "person-card-name", p.name ? escapeHtml(p.name) : t("unnamed"));
    const count = el("div", "person-card-count", `${p.face_count} ${t("photos_suffix")}`);
    card.appendChild(avatar);
    card.appendChild(name);
    card.appendChild(count);
    card.addEventListener("click", () => openPersonDetail(p.id));
    grid.appendChild(card);
  }
}

async function openPersonDetail(personId) {
  currentPersonId = personId;
  showView("person-detail");

  const persons = await apiGet("/persons");
  const person = persons.find((p) => p.id === personId);
  if (!person) return;

  document.getElementById("personHeaderThumb").src = `${API}/faces/${person.representative_face_id}/thumb`;
  document.getElementById("personNameInput").value = person.name || "";
  document.getElementById("personCount").textContent = `${person.face_count} ${t("photos_suffix")}`;

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
}

let nameSaveTimer = null;
document.getElementById("personNameInput").addEventListener("input", (e) => {
  clearTimeout(nameSaveTimer);
  const value = e.target.value;
  nameSaveTimer = setTimeout(async () => {
    await apiJson("PUT", `/persons/${currentPersonId}`, { name: value });
  }, 500);
});

document.getElementById("deletePersonBtn").addEventListener("click", async () => {
  if (!confirm(t("confirm_delete_person"))) return;
  await fetch(`${API}/persons/${currentPersonId}`, { method: "DELETE" });
  showView("people");
});

// ---------------- Merge ----------------
document.getElementById("mergeBtn").addEventListener("click", async () => {
  const persons = await apiGet("/persons");
  const list = document.getElementById("mergeList");
  list.innerHTML = "";
  for (const p of persons) {
    if (p.id === currentPersonId) continue;
    const item = el("div", "merge-list-item");
    const img = el("img");
    img.src = `${API}/faces/${p.representative_face_id}/thumb`;
    const label = el("span", null, p.name ? escapeHtml(p.name) : t("unnamed_count", p.face_count));
    item.appendChild(img);
    item.appendChild(label);
    item.addEventListener("click", async () => {
      await apiJson("POST", "/persons/merge", { source_id: currentPersonId, target_id: p.id });
      document.getElementById("mergeModal").style.display = "none";
      openPersonDetail(p.id);
    });
    list.appendChild(item);
  }
  document.getElementById("mergeModal").style.display = "flex";
});
document.getElementById("cancelMerge").addEventListener("click", () => {
  document.getElementById("mergeModal").style.display = "none";
});

// ---------------- Scan modal ----------------
const scanModal = document.getElementById("scanModal");
document.getElementById("scanBtn").addEventListener("click", () => {
  scanModal.style.display = "flex";
  document.getElementById("scanProgress").style.display = "none";
  document.getElementById("startScan").disabled = false;
});
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

function pollScanStatus() {
  clearInterval(scanPollTimer);
  scanPollTimer = setInterval(async () => {
    const status = await apiGet("/scan/status");
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
        setTimeout(() => {
          scanModal.style.display = "none";
          showView(currentView, true);
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
  if (currentView === "person-detail" && currentPersonId) openPersonDetail(currentPersonId);
});

async function loadNextFeedback() {
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
}

document.getElementById("feedbackYes").addEventListener("click", async () => {
  if (!feedbackCurrent) return;
  await apiJson("POST", "/feedback/decide", {
    person_a_id: feedbackCurrent.person_a.id,
    person_b_id: feedbackCurrent.person_b.id,
    decision: "merge",
  });
  loadNextFeedback();
});
document.getElementById("feedbackNo").addEventListener("click", async () => {
  if (!feedbackCurrent) return;
  await apiJson("POST", "/feedback/decide", {
    person_a_id: feedbackCurrent.person_a.id,
    person_b_id: feedbackCurrent.person_b.id,
    decision: "reject",
  });
  loadNextFeedback();
});

// ---------------- Organize ----------------
const organizeModal = document.getElementById("organizeModal");
document.getElementById("organizeBtn").addEventListener("click", async () => {
  organizeModal.style.display = "flex";
  document.getElementById("organizeResult").style.display = "none";
  document.getElementById("confirmOrganize").disabled = false;
  const summaryBox = document.getElementById("organizeSummary");
  summaryBox.innerHTML = "...";
  const preview = await apiGet("/organize/preview");
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
    resultBox.textContent = e.message;
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
  const data = await apiGet("/settings");
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
  const data = await apiJson("PUT", "/settings", payload);
  fillSettingsForm(data.values);
  alert(t("settings_saved"));
  settingsModal.style.display = "none";
});
document.getElementById("resetSettings").addEventListener("click", async () => {
  if (!confirm(t("settings_reset_confirm"))) return;
  const res = await fetch(`${API}/settings`, { method: "DELETE" });
  const data = await res.json();
  fillSettingsForm(data.values);
});

// ---------------- Recluster ----------------
const reclusterModal = document.getElementById("reclusterModal");
document.getElementById("reclusterBtn").addEventListener("click", () => {
  document.getElementById("reclusterResult").style.display = "none";
  document.getElementById("confirmRecluster").disabled = false;
  reclusterModal.style.display = "flex";
});
document.getElementById("cancelRecluster").addEventListener("click", () => {
  reclusterModal.style.display = "none";
});
document.getElementById("confirmRecluster").addEventListener("click", async () => {
  const btn = document.getElementById("confirmRecluster");
  btn.disabled = true;
  const resultBox = document.getElementById("reclusterResult");
  resultBox.style.display = "block";
  resultBox.className = "organize-result";
  resultBox.textContent = t("recluster_running");

  try {
    const result = await apiJson("POST", "/recluster", {});
    resultBox.textContent = t("recluster_result", result.merged_count, result.skipped_named_conflicts);
    if (currentView === "people") loadPeople();
  } catch (e) {
    resultBox.classList.add("has-errors");
    resultBox.textContent = e.message;
  } finally {
    btn.disabled = false;
  }
});

// ---------------- Init ----------------
applyLanguage();
showView("photos");
