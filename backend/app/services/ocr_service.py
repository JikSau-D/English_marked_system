from __future__ import annotations

import base64
import time
from dataclasses import dataclass
from typing import Optional

import httpx

from app.core.config import settings


@dataclass
class _TokenCache:
    access_token: str
    expires_at: float  # epoch seconds


_token_cache: Optional[_TokenCache] = None


async def _get_baidu_access_token(client: httpx.AsyncClient) -> str:
    global _token_cache

    now = time.time()
    if _token_cache and _token_cache.expires_at - 60 > now:
        return _token_cache.access_token

    if not settings.BAIDU_OCR_API_KEY or not settings.BAIDU_OCR_SECRET_KEY:
        raise RuntimeError("Baidu OCR credentials missing. Set BAIDU_OCR_API_KEY/BAIDU_OCR_SECRET_KEY.")

    url = f"{settings.BAIDU_OCR_BASE_URL}/oauth/2.0/token"
    params = {
        "grant_type": "client_credentials",
        "client_id": settings.BAIDU_OCR_API_KEY,
        "client_secret": settings.BAIDU_OCR_SECRET_KEY,
    }
    resp = await client.post(url, params=params, timeout=20)
    resp.raise_for_status()
    data = resp.json()
    token = data.get("access_token")
    expires_in = data.get("expires_in", 0)
    if not token:
        raise RuntimeError(f"Failed to obtain Baidu OCR access token: {data}")

    _token_cache = _TokenCache(access_token=token, expires_at=now + float(expires_in or 0))
    return token


async def recognize_handwriting_english(image_bytes: bytes) -> str:
    """
    Call Baidu handwriting OCR and return the recognized text.

    Implemented based on Baidu OCR public API shape. If the user's provided
    doc differs, adjust parameters / parsing here.
    """

    b64 = base64.b64encode(image_bytes).decode("ascii")

    async with httpx.AsyncClient() as client:
        token = await _get_baidu_access_token(client)
        url = f"{settings.BAIDU_OCR_BASE_URL}/rest/2.0/ocr/v1/handwriting"

        # Baidu expects x-www-form-urlencoded
        data = {
            "image": b64,
            "language_type": "ENG",
            # Improve granularity for handwriting in some cases.
            "recognize_granularity": "small",
        }

        resp = await client.post(url, params={"access_token": token}, data=data, timeout=60)
        resp.raise_for_status()
        payload = resp.json()

    if "error_code" in payload:
        raise RuntimeError(f"Baidu OCR error: {payload.get('error_msg')} (code={payload.get('error_code')})")

    words = payload.get("words_result") or []
    lines = []
    for item in words:
        w = (item or {}).get("words")
        if w:
            lines.append(str(w).strip())

    text = "\n".join([ln for ln in lines if ln])
    if not text.strip():
        raise RuntimeError("OCR returned empty text. Please upload a clearer image.")
    return text

