"""
Persistent SQLite & Local File Storage for Smart Campus Lost & Found.
Stores reported items, uploaded image files on disk, and registered user accounts
so all users across different browsers/devices see the shared campus feed and photos.
"""

import os
import re
import time
import hmac
import hashlib
import sqlite3
from typing import Optional, Dict, Any, List

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
DATABASE_DIR = os.path.join(PROJECT_ROOT, "database")
DB_PATH = os.path.join(DATABASE_DIR, "smart_campus.db")
UPLOADS_DIR = os.path.join(DATABASE_DIR, "uploads")

ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

DEFAULT_SEED_ITEMS = [
    {
        "id": "LF-0412",
        "title": "Green backpack",
        "reportType": "Found",
        "recoveryStatus": "Pending",
        "category": "Bags",
        "brand": "Aer / Daypack",
        "color": "Sage Green",
        "location": "Library, Block 3",
        "specificArea": "3rd Floor Study Wing Desk #12",
        "dateText": "Today",
        "date": "2026-11-20",
        "description": "Padded laptop sleeve with braided cord keychain on front zipper.",
        "distinguishingFeatures": "Slight scuff on lower left pocket; 15-inch laptop sleeve.",
        "confidence": 84,
        "thumbBg": "#D5E8DB",
        "iconType": "backpack",
        "reportedBy": "proctor.office@gla.ac.in",
        "reporterName": "Library Desk",
        "createdAt": 1700000700.0,
    },
    {
        "id": "LF-0411",
        "title": "Black smartphone",
        "reportType": "Lost",
        "recoveryStatus": "Pending",
        "category": "Electronics",
        "brand": "Apple iPhone",
        "color": "Matte Black",
        "location": "Cafeteria",
        "specificArea": "West Patio Dining Area",
        "dateText": "Yesterday",
        "date": "2026-11-19",
        "description": "Black phone inside transparent silicone case with slight scratch on top corner.",
        "distinguishingFeatures": "Lock screen shows campus botanical garden wallpaper.",
        "confidence": 72,
        "thumbBg": "#FCE3D2",
        "iconType": "phone-black",
        "reportedBy": "campus_user@gla.ac.in",
        "reporterName": "GLA Student",
        "createdAt": 1700000600.0,
    },
    {
        "id": "LF-0409",
        "title": "Maroon notebook",
        "reportType": "Found",
        "recoveryStatus": "Pending",
        "category": "Books",
        "brand": "Classmate Hardbound",
        "color": "Deep Maroon",
        "location": "Lecture hall 2",
        "specificArea": "Row 4 Center Seat",
        "dateText": "Today",
        "date": "2026-11-20",
        "description": "Hardcover spiral notebook containing engineering mechanics lecture notes.",
        "distinguishingFeatures": 'Initials "R.S." written with gold marker on the inside flyleaf.',
        "confidence": 65,
        "thumbBg": "#FAD4D8",
        "iconType": "notebook",
        "reportedBy": "proctor.office@gla.ac.in",
        "reporterName": "Lecture Hall Support",
        "createdAt": 1700000500.0,
    },
    {
        "id": "LF-0406",
        "title": "Wireless earbuds case",
        "reportType": "Lost",
        "recoveryStatus": "Pending",
        "category": "Electronics",
        "brand": "boAt / Airdopes",
        "color": "Charcoal Grey",
        "location": "Main gate",
        "specificArea": "Turnstile Exit Gate 1",
        "dateText": "2 days ago",
        "date": "2026-11-18",
        "description": "Matte charging case with type-C cable, no earbuds inside.",
        "distinguishingFeatures": "Small reflective silver sticker on bottom charging port.",
        "confidence": 58,
        "thumbBg": "#E5E8DF",
        "iconType": "earbuds",
        "reportedBy": "campus_user@gla.ac.in",
        "reporterName": "GLA Student",
        "createdAt": 1700000400.0,
    },
    {
        "id": "LF-0403",
        "title": "Student ID card",
        "reportType": "Found",
        "recoveryStatus": "Pending",
        "category": "Cards and IDs",
        "brand": "GLA University ID",
        "color": "White & Green",
        "location": "Sports complex",
        "specificArea": "Badminton Court Bleachers",
        "dateText": "3 days ago",
        "date": "2026-11-17",
        "description": "B.Tech CSE student identity card in green branded neck lanyard.",
        "distinguishingFeatures": "Roll number begins with 221500; contains library barcode.",
        "confidence": 91,
        "thumbBg": "#D8ECE0",
        "iconType": "idcard",
        "reportedBy": "proctor.office@gla.ac.in",
        "reporterName": "Sports Desk",
        "createdAt": 1700000300.0,
    },
    {
        "id": "LF-0398",
        "title": "Stainless steel water bottle",
        "reportType": "Lost",
        "recoveryStatus": "Pending",
        "category": "Bottles",
        "brand": "Hydro Flask / Milton",
        "color": "Brushed Silver",
        "location": "Library, Block 3",
        "specificArea": "Ground Floor Water Cooler",
        "dateText": "4 days ago",
        "date": "2026-11-16",
        "description": "750ml vacuum insulated steel flask with black screw lid and handle loop.",
        "distinguishingFeatures": "Minor dent on base rim; plain silver without stickers.",
        "confidence": 76,
        "thumbBg": "#E1EFE6",
        "iconType": "bottle",
        "reportedBy": "campus_user@gla.ac.in",
        "reporterName": "GLA Student",
        "createdAt": 1700000200.0,
    },
    {
        "id": "LF-0395",
        "title": "Fast 65W USB-C Charger",
        "reportType": "Found",
        "recoveryStatus": "Pending",
        "category": "Electronics",
        "brand": "Apple / Anker",
        "color": "Glossy White",
        "location": "Engineering Block",
        "specificArea": "Classroom AB-1 202",
        "dateText": "Today",
        "date": "2026-11-25",
        "description": "Fast charging USB-C adapter with braided white cable.",
        "distinguishingFeatures": "Small green marker dot near the plug pins.",
        "confidence": 94,
        "thumbBg": "#E5E8DF",
        "iconType": "charger",
        "reportedBy": "proctor.office@gla.ac.in",
        "reporterName": "Academic Block Desk",
        "createdAt": 1700000100.0,
    },
]


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    return conn


def _hash_password(password: str, salt: Optional[bytes] = None) -> str:
    if salt is None:
        salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return f"{salt.hex()}:{dk.hex()}"


def _verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_hex, dk_hex = stored_hash.split(":", 1)
        salt = bytes.fromhex(salt_hex)
        expected = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000).hex()
        return hmac.compare_digest(expected, dk_hex)
    except Exception:
        return False


def init_db() -> None:
    """Initializes SQLite tables, uploads directory, and default seed items."""
    os.makedirs(DATABASE_DIR, exist_ok=True)
    os.makedirs(UPLOADS_DIR, exist_ok=True)

    with _get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS items (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                report_type TEXT NOT NULL,
                recovery_status TEXT NOT NULL DEFAULT 'Pending',
                category TEXT NOT NULL,
                brand TEXT,
                color TEXT,
                location TEXT NOT NULL,
                specific_area TEXT,
                date_text TEXT,
                date TEXT,
                description TEXT,
                distinguishing_features TEXT,
                confidence INTEGER DEFAULT 84,
                predicted_turnaround TEXT,
                avg_found_days REAL,
                target_date TEXT,
                historical_benchmark TEXT,
                thumb_bg TEXT,
                icon_type TEXT,
                image_filename TEXT,
                reported_by TEXT,
                reporter_name TEXT,
                created_at REAL NOT NULL
            )
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'Student',
                roll_no TEXT,
                dept TEXT,
                created_at REAL NOT NULL
            )
            """
        )

        count = conn.execute("SELECT COUNT(*) FROM items").fetchone()[0]
        if count == 0:
            for item in DEFAULT_SEED_ITEMS:
                conn.execute(
                    """
                    INSERT INTO items (
                        id, title, report_type, recovery_status, category, brand, color,
                        location, specific_area, date_text, date, description,
                        distinguishing_features, confidence, thumb_bg, icon_type,
                        reported_by, reporter_name, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        item["id"],
                        item["title"],
                        item["reportType"],
                        item["recoveryStatus"],
                        item["category"],
                        item["brand"],
                        item["color"],
                        item["location"],
                        item["specificArea"],
                        item["dateText"],
                        item["date"],
                        item["description"],
                        item["distinguishingFeatures"],
                        item["confidence"],
                        item["thumbBg"],
                        item["iconType"],
                        item["reportedBy"],
                        item["reporterName"],
                        item["createdAt"],
                    ),
                )
        conn.commit()


def _row_to_item(row: sqlite3.Row, base_url: str = "") -> Dict[str, Any]:
    image_fn = row["image_filename"]
    photo_url = None
    if image_fn:
        clean_base = base_url.rstrip("/") if base_url else ""
        photo_url = f"{clean_base}/api/uploads/{image_fn}" if clean_base else f"/api/uploads/{image_fn}"

    return {
        "id": row["id"],
        "title": row["title"],
        "reportType": row["report_type"],
        "recoveryStatus": row["recovery_status"],
        "category": row["category"],
        "brand": row["brand"] or "Unknown",
        "color": row["color"] or "Unspecified",
        "location": row["location"],
        "specificArea": row["specific_area"] or row["location"],
        "dateText": row["date_text"] or "Today",
        "date": row["date"] or "",
        "description": row["description"] or "",
        "distinguishingFeatures": row["distinguishing_features"] or "",
        "confidence": row["confidence"] if row["confidence"] is not None else 84,
        "predictedTurnaround": row["predicted_turnaround"],
        "avgFoundDays": row["avg_found_days"],
        "targetDate": row["target_date"],
        "historicalBenchmark": row["historical_benchmark"],
        "thumbBg": row["thumb_bg"] or "#D5E8DB",
        "iconType": row["icon_type"] or "backpack",
        "userUploadedPhoto": photo_url,
        "reportedBy": row["reported_by"] or "campus_user@gla.ac.in",
        "reporterName": row["reporter_name"] or "GLA Student",
    }


def list_items(base_url: str = "") -> List[Dict[str, Any]]:
    with _get_conn() as conn:
        rows = conn.execute("SELECT * FROM items ORDER BY created_at DESC").fetchall()
    return [_row_to_item(r, base_url=base_url) for r in rows]


def _pick_image_ext(original_filename: Optional[str], content_type: Optional[str]) -> str:
    if original_filename:
        _, ext = os.path.splitext(original_filename.lower())
        if ext in ALLOWED_IMAGE_EXTS:
            return ext
    if content_type:
        ct = content_type.lower()
        if "png" in ct:
            return ".png"
        if "webp" in ct:
            return ".webp"
        if "gif" in ct:
            return ".gif"
    return ".jpg"


def create_item(
    item_data: Dict[str, Any],
    image_bytes: Optional[bytes] = None,
    original_filename: Optional[str] = None,
    content_type: Optional[str] = None,
    base_url: str = "",
) -> Dict[str, Any]:
    raw_id = str(item_data.get("id") or f"LF-{int(time.time()) % 10000}")
    safe_id = re.sub(r"[^A-Za-z0-9_-]", "", raw_id) or f"LF-{int(time.time())}"

    # Guarantee primary key uniqueness
    with _get_conn() as conn:
        existing = conn.execute("SELECT 1 FROM items WHERE id = ?", (safe_id,)).fetchone()
        if existing:
            safe_id = f"{safe_id}-{int(time.time() * 1000) % 10000}"

    image_filename = None
    if image_bytes:
        if len(image_bytes) > MAX_UPLOAD_BYTES:
            raise ValueError("Uploaded image exceeds 10 MB limit.")
        ext = _pick_image_ext(original_filename, content_type)
        image_filename = f"{safe_id}_{int(time.time() * 1000)}{ext}"
        dest_path = os.path.join(UPLOADS_DIR, image_filename)
        with open(dest_path, "wb") as f:
            f.write(image_bytes)

    now = time.time()
    conf_val = item_data.get("confidence", 84)
    try:
        conf_int = int(float(conf_val))
    except Exception:
        conf_int = 84

    avg_days_val = item_data.get("avgFoundDays")
    try:
        avg_days_float = float(avg_days_val) if avg_days_val not in (None, "") else None
    except Exception:
        avg_days_float = None

    with _get_conn() as conn:
        conn.execute(
            """
            INSERT INTO items (
                id, title, report_type, recovery_status, category, brand, color,
                location, specific_area, date_text, date, description,
                distinguishing_features, confidence, predicted_turnaround, avg_found_days,
                target_date, historical_benchmark, thumb_bg, icon_type,
                image_filename, reported_by, reporter_name, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                safe_id,
                str(item_data.get("title") or "Campus Item").strip(),
                str(item_data.get("reportType") or "Lost"),
                str(item_data.get("recoveryStatus") or "Pending"),
                str(item_data.get("category") or "Other"),
                str(item_data.get("brand") or "Unknown"),
                str(item_data.get("color") or "Unspecified"),
                str(item_data.get("location") or "Campus"),
                str(item_data.get("specificArea") or item_data.get("location") or "Campus"),
                str(item_data.get("dateText") or "Today"),
                str(item_data.get("date") or ""),
                str(item_data.get("description") or "Reported on campus."),
                str(item_data.get("distinguishingFeatures") or item_data.get("description") or ""),
                conf_int,
                item_data.get("predictedTurnaround"),
                avg_days_float,
                item_data.get("targetDate"),
                item_data.get("historicalBenchmark"),
                str(item_data.get("thumbBg") or "#D5E8DB"),
                str(item_data.get("iconType") or "backpack"),
                image_filename,
                str(item_data.get("reportedBy") or "campus_user@gla.ac.in"),
                str(item_data.get("reporterName") or "GLA Student"),
                now,
            ),
        )
        row = conn.execute("SELECT * FROM items WHERE id = ?", (safe_id,)).fetchone()
        conn.commit()

    return _row_to_item(row, base_url=base_url)


def update_item_status(item_id: str, recovery_status: str, base_url: str = "") -> Optional[Dict[str, Any]]:
    with _get_conn() as conn:
        cur = conn.execute(
            "UPDATE items SET recovery_status = ? WHERE id = ?",
            (recovery_status, item_id),
        )
        if cur.rowcount == 0:
            return None
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        conn.commit()
    return _row_to_item(row, base_url=base_url)


def get_upload_path(filename: str) -> Optional[str]:
    safe_name = os.path.basename(filename)
    if not safe_name or safe_name != filename:
        return None
    full_path = os.path.join(UPLOADS_DIR, safe_name)
    return full_path if os.path.isfile(full_path) else None


def register_user(name: str, email: str, password: str, roll_no: str, dept: str) -> Dict[str, Any]:
    clean_email = email.strip().lower()
    role = "Proctor Office Operator" if "proctor" in clean_email else "Student"
    pw_hash = _hash_password(password)
    now = time.time()

    with _get_conn() as conn:
        conn.execute(
            """
            INSERT INTO users (email, name, password_hash, role, roll_no, dept, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET
                name = excluded.name,
                password_hash = excluded.password_hash,
                role = excluded.role,
                roll_no = excluded.roll_no,
                dept = excluded.dept
            """,
            (clean_email, name.strip(), pw_hash, role, roll_no.strip(), dept, now),
        )
        conn.commit()

    return {
        "name": name.strip(),
        "email": clean_email,
        "role": role,
        "rollNo": roll_no.strip(),
        "dept": dept,
    }


def authenticate_user(email: str, password: str) -> Dict[str, Any]:
    clean_email = email.strip().lower()
    with _get_conn() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (clean_email,)).fetchone()

    if row is not None:
        if not _verify_password(password, row["password_hash"]):
            raise PermissionError("Authentication failed: Incorrect password for this institutional account.")
        return {
            "name": row["name"],
            "email": row["email"],
            "role": row["role"],
            "rollNo": row["roll_no"] or "GLA-STU-8821",
            "dept": row["dept"] or "BTech CSE (AI & ML)",
        }

    # Preserve convenience institutional sign-in for unregistered @gla.ac.in users
    prefix = clean_email.split("@")[0]
    if "." in prefix:
        display_name = " ".join(p.capitalize() for p in prefix.split(".") if p)
    else:
        display_name = prefix.upper()
    if "gopichand" in clean_email:
        display_name = "Vemula Gopi Chand"

    return {
        "name": display_name,
        "email": clean_email,
        "role": "Proctor Office Operator" if "proctor" in clean_email else "Student",
        "rollNo": "2215001234" if "cs21" in clean_email else "GLA-STU-8821",
        "dept": "BTech CSE (AI & ML)",
    }
