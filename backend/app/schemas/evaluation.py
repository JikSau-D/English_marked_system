from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field


class ScoreBreakdown(BaseModel):
    # 0-100 percentage scores
    content_relevance: int = Field(ge=0, le=100)
    language_accuracy: int = Field(ge=0, le=100)
    structural_coherence: int = Field(ge=0, le=100)


class GrammarErrorItem(BaseModel):
    sentence: str = Field(min_length=1)
    error: str = Field(min_length=1)
    correction: str = Field(min_length=1)
    explanation: str = Field(min_length=1)


class VocabularySuggestionItem(BaseModel):
    original: str = Field(min_length=1)
    suggestion: str = Field(min_length=1)
    context: str = Field(min_length=1)


class EvaluationResult(BaseModel):
    # Final score: CET writing is scored out of 15.
    score: float = Field(ge=0, le=15)
    score_breakdown: ScoreBreakdown

    excellent_sentences: List[str] = Field(default_factory=list)
    grammar_errors: List[GrammarErrorItem] = Field(default_factory=list)
    vocabulary_suggestions: List[VocabularySuggestionItem] = Field(default_factory=list)

    improvement_suggestions: str = Field(min_length=1)
    model_essay: str = Field(min_length=1)

