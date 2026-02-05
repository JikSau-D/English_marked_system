from __future__ import annotations

import os
import re
import uuid
from pathlib import Path

from app.core.config import settings


_FILENAME_SAFE_RE = re.compile(r"[^A-Za-z0-9._-]+")


def _safe_filename(name: str) -> str:
    name = (name or "upload").strip()
    name = os.path.basename(name)
    name = _FILENAME_SAFE_RE.sub("_", name)
    return name[:120] or "upload"


def save_upload_bytes(content: bytes, original_filename: str) -> str:
    """
    Persist an uploaded image to disk and return the relative path stored in DB.
    """

    uploads_root = Path(settings.UPLOAD_DIR)
    uploads_root.mkdir(parents=True, exist_ok=True)

    safe = _safe_filename(original_filename)
    suffix = Path(safe).suffix.lower()
    if suffix not in {".png", ".jpg", ".jpeg", ".webp", ".bmp"}:
        # Default to .png to keep things predictable.
        suffix = ".png"

    filename = f"{uuid.uuid4().hex}{suffix}"
    path = uploads_root / filename
    path.write_bytes(content)

    # Store relative path (container-local). Consumers should use the API to fetch.
    return str(path.as_posix())

