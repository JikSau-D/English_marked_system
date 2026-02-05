from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

import httpx
from pydantic import ValidationError
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.schemas.evaluation import EvaluationResult


# /backend/prompts/evaluation_prompt.txt
PROMPT_PATH = Path(__file__).resolve().parents[2] / "prompts" / "evaluation_prompt.txt"


def _load_prompt() -> tuple[str, str]:
    """
    Load (system_prompt, user_template) from the prompt file.

    The file uses delimiters:
      ---SYSTEM---
      ...system...
      ---USER_TEMPLATE---
      ...template...
    """

    raw = PROMPT_PATH.read_text(encoding="utf-8")
    if "---SYSTEM---" not in raw or "---USER_TEMPLATE---" not in raw:
        raise RuntimeError("Prompt file missing required delimiters.")
    system_part = raw.split("---SYSTEM---", 1)[1].split("---USER_TEMPLATE---", 1)[0].strip()
    user_part = raw.split("---USER_TEMPLATE---", 1)[1].strip()
    return system_part, user_part


def _extract_json(text: str) -> dict[str, Any]:
    """
    Robustly extract a JSON object from model output.
    """

    text = text.strip()
    if text.startswith("{") and text.endswith("}"):
        return json.loads(text)

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in model output")
    return json.loads(text[start : end + 1])


@retry(stop=stop_after_attempt(2), wait=wait_exponential(min=1, max=4))
async def _call_deepseek(messages: list[dict[str, str]]) -> str:
    if not settings.DEEPSEEK_API_KEY:
        raise RuntimeError("DeepSeek API key missing. Set DEEPSEEK_API_KEY.")

    url = f"{settings.DEEPSEEK_BASE_URL.rstrip('/')}/chat/completions"
    headers = {"Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}"}
    payload = {
        "model": settings.DEEPSEEK_MODEL,
        "messages": messages,
        "temperature": settings.DEEPSEEK_TEMPERATURE,
    }

    async with httpx.AsyncClient(timeout=settings.DEEPSEEK_TIMEOUT_SECONDS) as client:
        resp = await client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()

    # OpenAI-compatible response shape:
    # { "choices": [ { "message": { "content": "..." } } ] }
    try:
        return data["choices"][0]["message"]["content"]
    except Exception as exc:  # noqa: BLE001
        raise RuntimeError(f"Unexpected DeepSeek response: {data}") from exc


async def evaluate_essay(
    *,
    exam_type: str,
    question_prompt: Optional[str],
    ocr_text: str,
) -> dict[str, Any]:
    system_prompt, user_template = _load_prompt()
    user_prompt = user_template.format(
        exam_type=exam_type,
        question_prompt=question_prompt or "",
        essay_text=ocr_text,
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    content = await _call_deepseek(messages)

    # 1) Parse JSON, 2) validate schema, 3) on failure, attempt one repair call.
    try:
        parsed = _extract_json(content)
        validated = EvaluationResult.model_validate(parsed).model_dump()
        return validated
    except (ValueError, json.JSONDecodeError, ValidationError):
        repair_messages = [
            {"role": "system", "content": "You are a strict JSON formatter. Output ONLY valid JSON."},
            {
                "role": "user",
                "content": (
                    "Fix the following into a single valid JSON object matching the required schema. "
                    "Do not add extra commentary.\n\nMODEL_OUTPUT:\n" + content
                ),
            },
        ]
        repaired = await _call_deepseek(repair_messages)
        parsed2 = _extract_json(repaired)
        validated2 = EvaluationResult.model_validate(parsed2).model_dump()
        return validated2
