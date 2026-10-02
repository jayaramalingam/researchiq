from datetime import datetime
from typing import Optional, Any, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class PaperCreate(BaseModel):
    title: str = Field(..., min_length=1, description="Title of the paper")
    abstract: Optional[str] = None
    authors: Optional[Any] = None
    publication_year: Optional[int] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    pdf_url: Optional[str] = None
    source: Optional[str] = None
    citation_count: int = 0
    venue: Optional[str] = None
    is_open_access: Optional[bool] = None


class PaperResponse(BaseModel):
    id: UUID
    title: str
    abstract: Optional[str] = None
    authors: Optional[Any] = None
    publication_year: Optional[int] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    pdf_url: Optional[str] = None
    source: Optional[str] = None
    citation_count: int = 0
    venue: Optional[str] = None
    is_open_access: Optional[bool] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectPaperAttach(BaseModel):
    relevance_score: Optional[float] = None
    rank: Optional[int] = None
    selected: bool = True


class ProjectPaperResponse(BaseModel):
    id: UUID
    project_id: UUID
    paper_id: UUID
    relevance_score: Optional[float] = None
    rank: Optional[int] = None
    selected: bool = True
    added_at: datetime
    paper: Optional[PaperResponse] = None

    model_config = ConfigDict(from_attributes=True)
