from datetime import datetime
from typing import Optional, Any, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class PaperSourceCreate(BaseModel):
    source_name: str = Field(..., min_length=1, description="Name of the source (e.g. arXiv, Semantic Scholar, Crossref)")
    source_identifier: str = Field(..., min_length=1, description="Unique identifier within the source (e.g. DOI, arXiv ID)")
    source_url: Optional[str] = None


class PaperSourceResponse(BaseModel):
    id: UUID
    paper_id: UUID
    source_name: str
    source_identifier: str
    source_url: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvidenceItem(BaseModel):
    id: UUID
    type: str  # "insight" | "analysis" | "source"
    paper_id: Optional[UUID] = None
    paper_title: Optional[str] = None
    authors: Optional[Any] = None
    publication_year: Optional[int] = None
    doi: Optional[str] = None
    source_venue: Optional[str] = None
    url: Optional[str] = None
    quote_or_text: str
    related_insight_title: Optional[str] = None
    insight_type: Optional[str] = None
    confidence: Optional[float] = None
    sources: List[PaperSourceResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class ProjectEvidenceResponse(BaseModel):
    project_id: UUID
    total_evidence_items: int
    items: List[EvidenceItem]
