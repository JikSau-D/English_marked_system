from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.models.essay import Essay
from app.models.user import User
from app.schemas.essay import EssayCreateResult
from app.services.ai_evaluation_service import evaluate_essay
from app.services.ocr_service import recognize_handwriting_english
from app.services.storage_service import save_upload_bytes


router = APIRouter(prefix="/evaluate", tags=["evaluate"])


@router.post("/", response_model=EssayCreateResult)
async def evaluate(
    exam_type: str = Form(...),
    question_prompt: Optional[str] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EssayCreateResult:
    if exam_type not in {"CET-4", "CET-6"}:
        raise HTTPException(status_code=400, detail="exam_type must be CET-4 or CET-6")

    if image.content_type and not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported")

    content = await image.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty upload")
    if len(content) > settings.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large (max {settings.MAX_UPLOAD_MB}MB)")

    try:
        saved_path = await run_in_threadpool(save_upload_bytes, content, image.filename)
        ocr_text = await recognize_handwriting_english(content)
        evaluation_result = await evaluate_essay(
            exam_type=exam_type,
            question_prompt=question_prompt,
            ocr_text=ocr_text,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    essay = Essay(
        user_id=current_user.id,
        original_image_path=saved_path,
        exam_type=exam_type,
        question_prompt=question_prompt,
        ocr_text=ocr_text,
        evaluation_result=evaluation_result,
    )

    def _save() -> None:
        db.add(essay)
        db.commit()
        db.refresh(essay)

    await run_in_threadpool(_save)
    return essay
