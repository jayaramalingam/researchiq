from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class PaperAnalysisBase(BaseModel):
    summary: str | None = None
    problem: str | None = None
    methodology: str | None = None
    dataset: str | None = None
    results: str | None = None
    limitations: str | None = None
    contribution: str | None = None
    future_work: str | None = None
    ai_model: str | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)


class PaperAnalysisCreate(PaperAnalysisBase):
    pass


class PaperAnalysisUpdate(PaperAnalysisBase):
    pass


class PaperAnalysisResponse(PaperAnalysisBase):
    id: UUID
    paper_id: UUID
    analyzed_at: datetime

    model_config = {"from_attributes": True}
