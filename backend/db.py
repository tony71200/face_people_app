"""
Lớp lưu trữ dữ liệu bằng SQLite: images, faces, persons, rejected_pairs.
"""
import sqlite3
import json
import threading
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "app.db"
THUMBS_DIR = DATA_DIR / "thumbs"
THUMBS_DIR.mkdir(parents=True, exist_ok=True)

_lock = threading.Lock()


def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_conn()
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT UNIQUE NOT NULL,
            filename TEXT NOT NULL,
            width INTEGER,
            height INTEGER,
            mtime REAL,
            scan_root TEXT,
            rel_path TEXT,
            scanned_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS persons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            representative_face_id INTEGER,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS faces (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_id INTEGER NOT NULL,
            bbox_x1 REAL, bbox_y1 REAL, bbox_x2 REAL, bbox_y2 REAL,
            det_score REAL,
            embedding TEXT NOT NULL,
            person_id INTEGER,
            FOREIGN KEY(image_id) REFERENCES images(id) ON DELETE CASCADE,
            FOREIGN KEY(person_id) REFERENCES persons(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS rejected_pairs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            person_a INTEGER NOT NULL,
            person_b INTEGER NOT NULL,
            created_at TEXT DEFAULT (datetime('now')),
            UNIQUE(person_a, person_b)
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_faces_person ON faces(person_id);
        CREATE INDEX IF NOT EXISTS idx_faces_image ON faces(image_id);
        """
    )
    # Migration cho DB cũ (trước khi có cột scan_root / rel_path)
    cols = [r["name"] for r in conn.execute("PRAGMA table_info(images)").fetchall()]
    if "scan_root" not in cols:
        conn.execute("ALTER TABLE images ADD COLUMN scan_root TEXT")
    if "rel_path" not in cols:
        conn.execute("ALTER TABLE images ADD COLUMN rel_path TEXT")
    conn.commit()
    conn.close()


# ---------- Images ----------

def get_image_by_path(conn, path: str):
    return conn.execute("SELECT * FROM images WHERE path = ?", (path,)).fetchone()


def upsert_image(conn, path, filename, width, height, mtime, scan_root=None, rel_path=None):
    """
    rel_path là đường dẫn TƯƠNG ĐỐI GỐC (tính lúc mới quét, trước khi có bất
    kỳ thao tác move nào) so với scan_root. Một khi đã có rel_path, hàm này
    KHÔNG BAO GIỜ ghi đè lại nó nữa — kể cả khi ảnh sau đó bị move sang vị
    trí khác (path đổi) — để tránh lỗi tính rel_path chồng lấn lên thư mục
    "Organized" đã tạo trước đó (gây lồng Organized/Organized/...).
    """
    existing = get_image_by_path(conn, path)
    if existing and existing["mtime"] == mtime:
        updates = {}
        if scan_root and not existing["scan_root"]:
            updates["scan_root"] = scan_root
        if rel_path and not existing["rel_path"]:
            updates["rel_path"] = rel_path
        if updates:
            set_clause = ", ".join(f"{k}=?" for k in updates)
            conn.execute(
                f"UPDATE images SET {set_clause} WHERE id=?",
                (*updates.values(), existing["id"]),
            )
            conn.commit()
        return existing["id"], False  # không đổi -> không cần quét lại
    if existing:
        kept_rel_path = existing["rel_path"] or rel_path
        old_face_ids = [
            row["id"]
            for row in conn.execute(
                "SELECT id FROM faces WHERE image_id=?", (existing["id"],)
            ).fetchall()
        ]
        conn.execute(
            """UPDATE images SET width=?, height=?, mtime=?, scan_root=?, rel_path=?,
               scanned_at=datetime('now') WHERE id=?""",
            (width, height, mtime, scan_root, kept_rel_path, existing["id"]),
        )
        conn.execute("DELETE FROM faces WHERE image_id=?", (existing["id"],))
        for face_id in old_face_ids:
            face_thumb_path = THUMBS_DIR / f"face_{face_id}.jpg"
            if face_thumb_path.exists():
                face_thumb_path.unlink()
        conn.commit()
        return existing["id"], True
    cur = conn.execute(
        """INSERT INTO images (path, filename, width, height, mtime, scan_root, rel_path)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (path, filename, width, height, mtime, scan_root, rel_path),
    )
    conn.commit()
    return cur.lastrowid, True


def get_image(conn, image_id):
    return conn.execute("SELECT * FROM images WHERE id=?", (image_id,)).fetchone()


def update_image_path(conn, image_id, new_path):
    conn.execute("UPDATE images SET path=? WHERE id=?", (new_path, image_id))
    conn.commit()


def list_all_images(conn):
    return conn.execute("SELECT * FROM images ORDER BY mtime DESC").fetchall()


def count_images(conn):
    return conn.execute("SELECT COUNT(*) c FROM images").fetchone()["c"]


# ---------- Faces ----------

def add_face(conn, image_id, bbox, det_score, embedding, person_id=None):
    cur = conn.execute(
        """INSERT INTO faces (image_id, bbox_x1, bbox_y1, bbox_x2, bbox_y2, det_score, embedding, person_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (image_id, bbox[0], bbox[1], bbox[2], bbox[3], det_score, json.dumps(embedding), person_id),
    )
    conn.commit()
    return cur.lastrowid


def get_face(conn, face_id):
    return conn.execute("SELECT * FROM faces WHERE id=?", (face_id,)).fetchone()


def get_faces_without_person(conn):
    return conn.execute("SELECT * FROM faces WHERE person_id IS NULL").fetchall()


def get_all_faces(conn):
    return conn.execute("SELECT * FROM faces").fetchall()


def get_faces_for_person(conn, person_id):
    return conn.execute(
        "SELECT * FROM faces WHERE person_id=? ORDER BY det_score DESC", (person_id,)
    ).fetchall()


def get_faces_for_image(conn, image_id):
    return conn.execute("SELECT * FROM faces WHERE image_id=?", (image_id,)).fetchall()


def set_face_person(conn, face_id, person_id):
    conn.execute("UPDATE faces SET person_id=? WHERE id=?", (person_id, face_id))
    conn.commit()


def reassign_faces_person(conn, from_person_id, to_person_id):
    conn.execute(
        "UPDATE faces SET person_id=? WHERE person_id=?", (to_person_id, from_person_id)
    )
    conn.commit()


def count_faces_for_person(conn, person_id):
    return conn.execute(
        "SELECT COUNT(*) c FROM faces WHERE person_id=?", (person_id,)
    ).fetchone()["c"]


# ---------- Persons ----------

def create_person(conn, name=None, representative_face_id=None):
    cur = conn.execute(
        "INSERT INTO persons (name, representative_face_id) VALUES (?, ?)",
        (name, representative_face_id),
    )
    conn.commit()
    return cur.lastrowid


def get_person(conn, person_id):
    return conn.execute("SELECT * FROM persons WHERE id=?", (person_id,)).fetchone()


def list_persons(conn):
    rows = conn.execute(
        """
        SELECT p.*, COUNT(f.id) AS face_count, COUNT(DISTINCT f.image_id) AS photo_count
        FROM persons p
        LEFT JOIN faces f ON f.person_id = p.id
        GROUP BY p.id
        HAVING face_count > 0
        ORDER BY photo_count DESC, face_count DESC
        """
    ).fetchall()
    return rows


def list_named_persons(conn):
    return conn.execute(
        "SELECT * FROM persons WHERE name IS NOT NULL AND TRIM(name) != ''"
    ).fetchall()


def update_person_name(conn, person_id, name):
    conn.execute("UPDATE persons SET name=? WHERE id=?", (name, person_id))
    conn.commit()


def set_person_representative(conn, person_id, face_id):
    conn.execute(
        "UPDATE persons SET representative_face_id=? WHERE id=?", (face_id, person_id)
    )
    conn.commit()


def delete_person(conn, person_id, delete_faces=False):
    if delete_faces:
        conn.execute("DELETE FROM faces WHERE person_id=?", (person_id,))
    else:
        conn.execute("UPDATE faces SET person_id=NULL WHERE person_id=?", (person_id,))
    conn.execute("DELETE FROM persons WHERE id=?", (person_id,))
    conn.commit()


def get_images_for_person(conn, person_id):
    return conn.execute(
        """
        SELECT DISTINCT i.* FROM images i
        JOIN faces f ON f.image_id = i.id
        WHERE f.person_id = ?
        ORDER BY i.mtime DESC
        """,
        (person_id,),
    ).fetchall()


def cleanup_empty_persons(conn):
    """Xoá các person không còn face nào (sau khi merge/split/reassign)."""
    conn.execute(
        """
        DELETE FROM persons WHERE id NOT IN (
            SELECT DISTINCT person_id FROM faces WHERE person_id IS NOT NULL
        )
        """
    )
    conn.commit()


# ---------- Rejected pairs (Feedback Loop) ----------

def add_rejected_pair(conn, a: int, b: int):
    lo, hi = sorted((a, b))
    conn.execute(
        "INSERT OR IGNORE INTO rejected_pairs (person_a, person_b) VALUES (?, ?)", (lo, hi)
    )
    conn.commit()


def is_pair_rejected(conn, a: int, b: int) -> bool:
    lo, hi = sorted((a, b))
    row = conn.execute(
        "SELECT 1 FROM rejected_pairs WHERE person_a=? AND person_b=?", (lo, hi)
    ).fetchone()
    return row is not None


def clear_rejected_pairs_for(conn, person_id: int):
    """Xoá các cặp bị từ chối liên quan đến 1 person (gọi khi person đó bị xoá/gộp)."""
    conn.execute(
        "DELETE FROM rejected_pairs WHERE person_a=? OR person_b=?", (person_id, person_id)
    )
    conn.commit()


# ---------- Named-face lookup (dùng cho tính năng Tạo thư mục Tên) ----------

def get_named_faces_with_area(conn):
    """
    Trả về mọi face có gán person đã đặt tên, kèm diện tích bbox,
    dùng để chọn 'người chính' (khuôn mặt lớn nhất) trong ảnh có nhiều người.
    """
    return conn.execute(
        """
        SELECT f.image_id as image_id, f.person_id as person_id, p.name as person_name,
               (f.bbox_x2 - f.bbox_x1) * (f.bbox_y2 - f.bbox_y1) as area
        FROM faces f
        JOIN persons p ON f.person_id = p.id
        WHERE p.name IS NOT NULL AND TRIM(p.name) != ''
        """
    ).fetchall()


# ---------- Settings (thông số clustering có thể chỉnh qua UI) ----------

def get_all_settings(conn):
    rows = conn.execute("SELECT key, value FROM settings").fetchall()
    return {r["key"]: r["value"] for r in rows}


def set_setting(conn, key: str, value):
    conn.execute(
        """
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value
        """,
        (key, str(value)),
    )
    conn.commit()


def reset_settings(conn):
    conn.execute("DELETE FROM settings")
    conn.commit()
