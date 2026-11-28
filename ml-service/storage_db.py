"""
Persistent SQLite & Local File Storage for Smart Campus Lost & Found.
Implements:
- NFR-23: EXIF/XMP/ICC image metadata stripping before saving uploads to disk
- NFR-24: Persistent similarity threshold configuration (`system_settings`)
- NFR-26: Notification deduplication (`sent_notifications`)
- NFR-28: Automatic retention cleanup (`cleanup_expired_records`)
- NFR-29: Privacy masking for non-owners & unauthenticated callers
- NFR-30: Immutable operator & user activity audit trail (`audit_logs`)
"""

import io
import os
import re
import time
import hmac
import hashlib
import sqlite3
from typing import Optional, Dict, Any, List, Tuple

try:
    from PIL import Image, ImageOps
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
DATABASE_DIR = os.path.join(PROJECT_ROOT, "database")
DB_PATH = os.path.join(DATABASE_DIR, "smart_campus.db")
UPLOADS_DIR = os.path.join(DATABASE_DIR, "uploads")

ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

DEFAULT_SIMILARITY_PERCENT = 65
DEFAULT_RETENTION_DAYS = 90

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
        "createdAt": 1795000700.0,
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
        "createdAt": 1795000600.0,
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
        "createdAt": 1795000500.0,
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
        "createdAt": 1795000400.0,
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
        "createdAt": 1795000300.0,
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
        "createdAt": 1795000200.0,
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
        "createdAt": 1795000100.0,
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


def strip_image_metadata(
    image_bytes: bytes,
    original_filename: Optional[str] = None,
    content_type: Optional[str] = None,
) -> Tuple[bytes, str, bool]:
    """
    NFR-23: Strips EXIF, GPS, camera model, XMP, and ICC metadata from uploaded
    images by transposing orientation and re-encoding raw pixel data without info/EXIF.
    Returns (cleaned_bytes, chosen_extension, was_stripped).
    """
    ext = _pick_image_ext(original_filename, content_type)
    if not HAS_PIL:
        return image_bytes, ext, False

    try:
        with Image.open(io.BytesIO(image_bytes)) as src:
            # Apply EXIF orientation so rotated smartphone shots remain upright
            transposed = ImageOps.exif_transpose(src)
            fmt = (src.format or "").upper()

            if ext == ".png" or fmt == "PNG":
                target_mode = "RGBA" if transposed.mode in ("RGBA", "LA", "P") else "RGB"
                converted = transposed.convert(target_mode)
                clean_img = Image.frombytes(converted.mode, converted.size, converted.tobytes())
                out = io.BytesIO()
                clean_img.save(out, format="PNG", optimize=True)
                return out.getvalue(), ".png", True

            if ext == ".webp" or fmt == "WEBP":
                target_mode = "RGBA" if transposed.mode in ("RGBA", "LA") else "RGB"
                converted = transposed.convert(target_mode)
                clean_img = Image.frombytes(converted.mode, converted.size, converted.tobytes())
                out = io.BytesIO()
                clean_img.save(out, format="WEBP", quality=90)
                return out.getvalue(), ".webp", True

            # Default safe re-encoding as JPEG without EXIF/APP markers
            converted = transposed.convert("RGB")
            clean_img = Image.frombytes("RGB", converted.size, converted.tobytes())
            out = io.BytesIO()
            clean_img.save(out, format="JPEG", quality=90)
            return out.getvalue(), ".jpg", True
    except Exception:
        return image_bytes, ext, False


def mask_email(email: Optional[str]) -> str:
    """NFR-29: Masks user email addresses for non-owners / unauthorized callers."""
    if not email or "@" not in email:
        return "verified***@gla.ac.in"
    local, domain = email.split("@", 1)
    prefix = local[:2] if len(local) >= 2 else local[:1]
    return f"{prefix}***@{domain}"


def sanitize_item_for_viewer(
    item: Dict[str, Any],
    viewer_email: Optional[str] = None,
    viewer_role: Optional[str] = None,
) -> Dict[str, Any]:
    """
    NFR-29: Protects personal contact details from unauthorized viewers.
    Full contact fields are visible only to the reporting owner or Proctor Office Operator.
    """
    clean_viewer = (viewer_email or "").strip().lower()
    owner_email = (item.get("reportedBy") or "").strip().lower()
    is_operator = (viewer_role or "").strip().lower() in ("proctor office operator", "operator", "admin")
    is_owner = bool(clean_viewer) and clean_viewer == owner_email
    is_desk_account = owner_email == "proctor.office@gla.ac.in"

    sanitized = dict(item)
    if is_owner or is_operator or is_desk_account:
        sanitized["isContactMasked"] = False
        return sanitized

    sanitized["reportedBy"] = mask_email(owner_email)
    sanitized["reporterName"] = "Verified Campus Member"
    sanitized["isContactMasked"] = True
    return sanitized


def log_audit_event(
    action: str,
    actor_email: str = "system@gla.ac.in",
    actor_role: str = "System",
    target_id: Optional[str] = None,
    details: Optional[str] = None,
) -> Dict[str, Any]:
    """NFR-30: Appends a traceable activity log entry in SQLite."""
    now = time.time()
    clean_actor = (actor_email or "system@gla.ac.in").strip().lower()
    with _get_conn() as conn:
        cur = conn.execute(
            """
            INSERT INTO audit_logs (timestamp, actor_email, actor_role, action, target_id, details)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (now, clean_actor, actor_role or "User", action, target_id, details),
        )
        log_id = cur.lastrowid
        conn.commit()
    return {
        "logId": log_id,
        "timestamp": now,
        "actorEmail": clean_actor,
        "actorRole": actor_role or "User",
        "action": action,
        "targetId": target_id,
        "details": details,
    }


def list_audit_logs(limit: int = 50) -> List[Dict[str, Any]]:
    """NFR-30: Returns recent operator & user activity logs ordered newest first."""
    safe_limit = max(1, min(200, int(limit)))
    with _get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM audit_logs ORDER BY timestamp DESC, log_id DESC LIMIT ?",
            (safe_limit,),
        ).fetchall()
    return [
        {
            "logId": r["log_id"],
            "timestamp": r["timestamp"],
            "actorEmail": r["actor_email"],
            "actorRole": r["actor_role"],
            "action": r["action"],
            "targetId": r["target_id"],
            "details": r["details"],
        }
        for r in rows
    ]


def init_db() -> None:
    """Initializes SQLite tables, default settings, uploads directory, and seed items."""
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

        # NFR-24 & NFR-28: Persistent system settings
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS system_settings (
                setting_key TEXT PRIMARY KEY,
                setting_value TEXT NOT NULL,
                updated_at REAL NOT NULL
            )
            """
        )

        # NFR-26: Notification deduplication registry
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sent_notifications (
                notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
                match_pair_key TEXT UNIQUE NOT NULL,
                recipient_email TEXT NOT NULL,
                lost_id TEXT NOT NULL,
                found_id TEXT NOT NULL,
                score INTEGER DEFAULT 0,
                notified_at REAL NOT NULL
            )
            """
        )

        # NFR-30: Activity & operator audit trail
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS audit_logs (
                log_id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp REAL NOT NULL,
                actor_email TEXT NOT NULL,
                actor_role TEXT NOT NULL,
                action TEXT NOT NULL,
                target_id TEXT,
                details TEXT
            )
            """
        )

        now = time.time()
        conn.execute(
            """
            INSERT OR IGNORE INTO system_settings (setting_key, setting_value, updated_at)
            VALUES ('min_similarity_percent', ?, ?)
            """,
            (str(DEFAULT_SIMILARITY_PERCENT), now),
        )
        conn.execute(
            """
            INSERT OR IGNORE INTO system_settings (setting_key, setting_value, updated_at)
            VALUES ('retention_days', ?, ?)
            """,
            (str(DEFAULT_RETENTION_DAYS), now),
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


def get_settings() -> Dict[str, Any]:
    """NFR-24 & NFR-28: Reads active similarity threshold & data retention configuration."""
    with _get_conn() as conn:
        rows = conn.execute("SELECT setting_key, setting_value, updated_at FROM system_settings").fetchall()
    mapping = {r["setting_key"]: r["setting_value"] for r in rows}
    sim_pct = int(float(mapping.get("min_similarity_percent", DEFAULT_SIMILARITY_PERCENT)))
    ret_days = int(float(mapping.get("retention_days", DEFAULT_RETENTION_DAYS)))
    return {
        "minSimilarityPercent": max(30, min(95, sim_pct)),
        "minSimilarityCosine": round(max(0.20, min(0.95, sim_pct / 100.0)), 2),
        "retentionDays": max(1, min(365, ret_days)),
    }


def update_settings(
    min_similarity_percent: Optional[int] = None,
    retention_days: Optional[int] = None,
    actor_email: str = "operator@gla.ac.in",
    actor_role: str = "Proctor Office Operator",
) -> Dict[str, Any]:
    """NFR-24 & NFR-28 & NFR-30: Updates similarity threshold / retention days and records audit log."""
    now = time.time()
    changes = []
    with _get_conn() as conn:
        if min_similarity_percent is not None:
            clamped_sim = max(30, min(95, int(min_similarity_percent)))
            conn.execute(
                """
                INSERT INTO system_settings (setting_key, setting_value, updated_at)
                VALUES ('min_similarity_percent', ?, ?)
                ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = excluded.updated_at
                """,
                (str(clamped_sim), now),
            )
            changes.append(f"minSimilarityPercent={clamped_sim}%")

        if retention_days is not None:
            clamped_days = max(1, min(365, int(retention_days)))
            conn.execute(
                """
                INSERT INTO system_settings (setting_key, setting_value, updated_at)
                VALUES ('retention_days', ?, ?)
                ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = excluded.updated_at
                """,
                (str(clamped_days), now),
            )
            changes.append(f"retentionDays={clamped_days}d")
        conn.commit()

    if changes:
        log_audit_event(
            action="THRESHOLD_UPDATED" if min_similarity_percent is not None else "SETTINGS_UPDATED",
            actor_email=actor_email,
            actor_role=actor_role,
            target_id="system_settings",
            details=", ".join(changes),
        )
    return get_settings()


def cleanup_expired_records(
    retention_days: Optional[int] = None,
    actor_email: str = "system@gla.ac.in",
    actor_role: str = "System Retention Scheduler",
) -> Dict[str, Any]:
    """
    NFR-28: Removes expired records older than `retention_days` along with
    their stored upload images on disk, and logs the cleanup in `audit_logs`.
    """
    active_days = retention_days if retention_days is not None else get_settings()["retentionDays"]
    active_days = max(1, int(active_days))
    cutoff_ts = time.time() - (active_days * 86400.0)

    removed_ids: List[str] = []
    removed_images: int = 0

    with _get_conn() as conn:
        expired_rows = conn.execute(
            "SELECT id, image_filename FROM items WHERE created_at < ?",
            (cutoff_ts,),
        ).fetchall()

        for row in expired_rows:
            removed_ids.append(row["id"])
            img_fn = row["image_filename"]
            if img_fn:
                img_path = get_upload_path(img_fn)
                if img_path and os.path.exists(img_path):
                    try:
                        os.remove(img_path)
                        removed_images += 1
                    except OSError:
                        pass

        if removed_ids:
            placeholders = ",".join(["?"] * len(removed_ids))
            conn.execute(f"DELETE FROM items WHERE id IN ({placeholders})", removed_ids)
            conn.commit()

    if removed_ids or actor_email != "system@gla.ac.in":
        log_audit_event(
            action="RETENTION_CLEANUP",
            actor_email=actor_email,
            actor_role=actor_role,
            target_id="items",
            details=f"Removed {len(removed_ids)} expired record(s) and {removed_images} image(s) older than {active_days} days.",
        )

    return {
        "retentionDays": active_days,
        "removedCount": len(removed_ids),
        "removedImages": removed_images,
        "removedIds": removed_ids,
    }


def record_notifications(
    recipient_email: str,
    matches: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    NFR-26: Deduplicates match alert notifications per `(recipient_email, lostId, foundId)`.
    Returns only match pairs that have NOT yet been notified.
    """
    clean_email = (recipient_email or "campus_user@gla.ac.in").strip().lower()
    now = time.time()
    newly_notified: List[Dict[str, Any]] = []
    skipped_duplicates: int = 0

    with _get_conn() as conn:
        for m in matches:
            lost_id = str(m.get("lostId") or "")
            found_id = str(m.get("foundId") or "")
            if not lost_id or not found_id:
                continue
            pair_key = f"{clean_email}::{lost_id}::{found_id}"
            score = int(m.get("score") or 0)
            cur = conn.execute(
                """
                INSERT OR IGNORE INTO sent_notifications (
                    match_pair_key, recipient_email, lost_id, found_id, score, notified_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (pair_key, clean_email, lost_id, found_id, score, now),
            )
            if cur.rowcount > 0:
                newly_notified.append(m)
            else:
                skipped_duplicates += 1
        conn.commit()

    return {
        "newNotifications": newly_notified,
        "skippedDuplicates": skipped_duplicates,
    }


def list_sent_notifications(recipient_email: Optional[str] = None) -> List[Dict[str, Any]]:
    with _get_conn() as conn:
        if recipient_email:
            rows = conn.execute(
                "SELECT * FROM sent_notifications WHERE recipient_email = ? ORDER BY notified_at DESC LIMIT 100",
                (recipient_email.strip().lower(),),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM sent_notifications ORDER BY notified_at DESC LIMIT 100"
            ).fetchall()
    return [
        {
            "notificationId": r["notification_id"],
            "matchPairKey": r["match_pair_key"],
            "recipientEmail": r["recipient_email"],
            "lostId": r["lost_id"],
            "foundId": r["found_id"],
            "score": r["score"],
            "notifiedAt": r["notified_at"],
        }
        for r in rows
    ]


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


def list_items(
    base_url: str = "",
    viewer_email: Optional[str] = None,
    viewer_role: Optional[str] = None,
) -> List[Dict[str, Any]]:
    with _get_conn() as conn:
        rows = conn.execute("SELECT * FROM items ORDER BY created_at DESC").fetchall()
    return [
        sanitize_item_for_viewer(_row_to_item(r, base_url=base_url), viewer_email=viewer_email, viewer_role=viewer_role)
        for r in rows
    ]


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
) -> Tuple[Dict[str, Any], bool]:
    raw_id = str(item_data.get("id") or f"LF-{int(time.time()) % 10000}")
    safe_id = re.sub(r"[^A-Za-z0-9_-]", "", raw_id) or f"LF-{int(time.time())}"

    with _get_conn() as conn:
        existing = conn.execute("SELECT 1 FROM items WHERE id = ?", (safe_id,)).fetchone()
        if existing:
            safe_id = f"{safe_id}-{int(time.time() * 1000) % 10000}"

    image_filename = None
    metadata_stripped = False
    if image_bytes:
        if len(image_bytes) > MAX_UPLOAD_BYTES:
            raise ValueError("Uploaded image exceeds 10 MB limit.")
        cleaned_bytes, clean_ext, metadata_stripped = strip_image_metadata(
            image_bytes=image_bytes,
            original_filename=original_filename,
            content_type=content_type,
        )
        image_filename = f"{safe_id}_{int(time.time() * 1000)}{clean_ext}"
        dest_path = os.path.join(UPLOADS_DIR, image_filename)
        with open(dest_path, "wb") as f:
            f.write(cleaned_bytes)

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

    reported_by = str(item_data.get("reportedBy") or "campus_user@gla.ac.in")
    reporter_name = str(item_data.get("reporterName") or "GLA Student")

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
                reported_by,
                reporter_name,
                now,
            ),
        )
        row = conn.execute("SELECT * FROM items WHERE id = ?", (safe_id,)).fetchone()
        conn.commit()

    log_audit_event(
        action="ITEM_REPORTED",
        actor_email=reported_by,
        actor_role="Student",
        target_id=safe_id,
        details=f"Logged {row['report_type']} item '{row['title']}' at {row['location']}"
        + (" (EXIF stripped)" if metadata_stripped else ""),
    )

    return _row_to_item(row, base_url=base_url), metadata_stripped


def update_item_status(
    item_id: str,
    recovery_status: str,
    base_url: str = "",
    actor_email: str = "operator@gla.ac.in",
    actor_role: str = "Proctor Office Operator",
) -> Optional[Dict[str, Any]]:
    with _get_conn() as conn:
        cur = conn.execute(
            "UPDATE items SET recovery_status = ? WHERE id = ?",
            (recovery_status, item_id),
        )
        if cur.rowcount == 0:
            return None
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        conn.commit()

    log_audit_event(
        action="STATUS_UPDATED",
        actor_email=actor_email,
        actor_role=actor_role,
        target_id=item_id,
        details=f"Updated recoveryStatus to '{recovery_status}'",
    )
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

    log_audit_event(
        action="USER_REGISTERED",
        actor_email=clean_email,
        actor_role=role,
        target_id=clean_email,
        details=f"Registered account ({dept}, Roll: {roll_no.strip()})",
    )

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
            log_audit_event(
                action="FAILED_LOGIN",
                actor_email=clean_email,
                actor_role=row["role"],
                target_id=clean_email,
                details="Incorrect password attempt blocked",
            )
            raise PermissionError("Authentication failed: Incorrect password for this institutional account.")
        log_audit_event(
            action="USER_LOGIN",
            actor_email=clean_email,
            actor_role=row["role"],
            target_id=clean_email,
            details="Verified institutional session sign-in",
        )
        return {
            "name": row["name"],
            "email": row["email"],
            "role": row["role"],
            "rollNo": row["roll_no"] or "GLA-STU-8821",
            "dept": row["dept"] or "BTech CSE (AI & ML)",
        }

    prefix = clean_email.split("@")[0]
    if "." in prefix:
        display_name = " ".join(p.capitalize() for p in prefix.split(".") if p)
    else:
        display_name = prefix.upper()
    if "gopichand" in clean_email:
        display_name = "Vemula Gopi Chand"

    role = "Proctor Office Operator" if "proctor" in clean_email else "Student"
    log_audit_event(
        action="USER_LOGIN",
        actor_email=clean_email,
        actor_role=role,
        target_id=clean_email,
        details="Institutional @gla.ac.in session sign-in",
    )

    return {
        "name": display_name,
        "email": clean_email,
        "role": role,
        "rollNo": "2215001234" if "cs21" in clean_email else "GLA-STU-8821",
        "dept": "BTech CSE (AI & ML)",
    }
