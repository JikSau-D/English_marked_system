from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class EssayCreateResult(BaseModel):
    id: int
    created_at: datetime
    exam_type: str
    question_prompt: Optional[str] = None
    ocr_text: str
    evaluation_result: dict[str, Any]

    class Config:
        from_attributes = True


class EssayListItem(BaseModel):
    id: int
    created_at: datetime
    exam_type: str
    question_prompt: Optional[str] = None
    final_score: float = Field(description="0-15")

    class Config:
        from_attributes = True


class EssayDetail(BaseModel):
    id: int
    created_at: datetime
    exam_type: str
    question_prompt: Optional[str] = None
    ocr_text: str
    evaluation_result: dict[str, Any]

    class Config:
        from_attributes = True

