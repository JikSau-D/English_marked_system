from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.essay import Essay
from app.models.user import User
from app.schemas.essay import EssayDetail, EssayListItem


router = APIRouter(prefix="/essays", tags=["essays"])


@router.get("", response_model=list[EssayListItem])
@router.get("/", response_model=list[EssayListItem])
def list_essays(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[EssayListItem]:
    rows = db.execute(
        select(Essay).where(Essay.user_id == current_user.id).order_by(desc(Essay.created_at))
    ).scalars()

    items: list[EssayListItem] = []
    for essay in rows:
        score = None
        if isinstance(essay.evaluation_result, dict):
            score = essay.evaluation_result.get("score")
        try:
            final_score = float(score)
        except Exception:  # noqa: BLE001
            final_score = 0.0
        items.append(
            EssayListItem(
                id=essay.id,
                created_at=essay.created_at,
                exam_type=essay.exam_type,
                question_prompt=essay.question_prompt,
                final_score=final_score,
            )
        )
    return items


@router.get("/{essay_id}", response_model=EssayDetail)
def get_essay_detail(
    essay_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EssayDetail:
    essay = db.get(Essay, essay_id)
    if not essay or essay.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Essay not found")
    return essay


@router.get("/{essay_id}/image")
def get_essay_image(
    essay_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FileResponse:
    essay = db.get(Essay, essay_id)
    if not essay or essay.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Essay not found")
    path = Path(essay.original_image_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Image file missing on server")
    return FileResponse(path=str(path))
