from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Essay(Base):
    __tablename__ = "essays"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)

    original_image_path: Mapped[str] = mapped_column(String(500), nullable=False)
    exam_type: Mapped[str] = mapped_column(String(20), nullable=False)  # CET-4 / CET-6
    question_prompt: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    ocr_text: Mapped[str] = mapped_column(Text, nullable=False)
    evaluation_result: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    user = relationship("User", back_populates="essays")

