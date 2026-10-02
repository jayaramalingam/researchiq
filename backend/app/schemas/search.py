from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SearchResultPaper(BaseModel):
    """
    A paper result returned by the search endpoint.

    `id` is None when the paper came from Semantic Scholar and has not yet
    been imported into the local database. Once the user clicks "Add to Project"
    and the /search/add endpoint runs, the paper receives a stable UUID.
    """

    id: Optional[UUID] = None
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
    created_at: Optional[datetime] = None

    # Project-specific fields
    is_attached: bool = False
    relevance_score: Optional[float] = None
    rank: Optional[int] = None

    # Semantic Scholar provenance (present for live results only)
    semantic_scholar_id: Optional[str] = None
    fields_of_study: Optional[List[str]] = None

    model_config = ConfigDict(from_attributes=True)


class SearchResponse(BaseModel):
    """Response returned by the project search endpoint."""

    project_id: UUID
    query: str
    total_results: int
    results: List[SearchResultPaper]
    source: str = "Semantic Scholar"
    note: Optional[str] = None


class PaperCreateFromSearch(BaseModel):
    """
    Payload for POST /api/projects/{project_id}/search/add.

    Includes Semantic Scholar provenance fields so the backend can
    create a correct PaperSource record on import.
    """

    title: str = Field(..., min_length=1)
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
    relevance_score: Optional[float] = None
    rank: Optional[int] = None

    # Semantic Scholar provenance
    semantic_scholar_id: Optional[str] = None
    fields_of_study: Optional[List[str]] = None
