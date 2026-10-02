"""
Semantic Scholar Academic Graph API service.

Provides online scholarly paper discovery via:
    GET https://api.semanticscholar.org/graph/v1/paper/search

Public endpoints require no API key but requests are rate-limited (~100 req/5 min).
An optional SEMANTIC_SCHOLAR_API_KEY can be set in .env to raise the limit.

The service normalises Semantic Scholar paper objects into a local `ScholarlyPaper`
dataclass that can be persisted into the existing Paper model.

Reference:
    https://api.semanticscholar.org/api-docs/graph#tag/Paper-Data/operation/get_graph_paper_search
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# Fields requested from Semantic Scholar — keep to a minimum to stay under limits
_FIELDS = (
    "paperId,title,abstract,year,authors,venue,externalIds,"
    "url,citationCount,referenceCount,openAccessPdf,fieldsOfStudy,publicationDate"
)


@dataclass
class ScholarlyAuthor:
    name: str
    author_id: Optional[str] = None


@dataclass
class ScholarlyPaper:
    """Normalised representation of a Semantic Scholar paper."""

    semantic_scholar_id: str
    title: str
    abstract: Optional[str] = None
    publication_year: Optional[int] = None
    authors: List[str] = field(default_factory=list)
    venue: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    pdf_url: Optional[str] = None
    citation_count: int = 0
    reference_count: int = 0
    is_open_access: bool = False
    fields_of_study: List[str] = field(default_factory=list)
    source: str = "Semantic Scholar"

    def to_paper_kwargs(self) -> Dict[str, Any]:
        """Convert to kwargs suitable for creating a Paper model instance."""
        return {
            "title": self.title,
            "abstract": self.abstract,
            "authors": self.authors,
            "publication_year": self.publication_year,
            "doi": self.doi,
            "url": self.url,
            "pdf_url": self.pdf_url,
            "source": self.source,
            "citation_count": self.citation_count,
            "venue": self.venue,
            "is_open_access": self.is_open_access,
        }


class ScholarlySearchError(Exception):
    """Raised when Semantic Scholar search fails."""

    pass


class ScholarlySearchService:
    """
    Wraps the Semantic Scholar Graph API paper search endpoint.

    Usage:
        service = ScholarlySearchService()
        papers = await service.search("computer vision waste sorting", limit=10)
    """

    def __init__(self) -> None:
        self._base_url = settings.semantic_scholar_base_url
        self._timeout = settings.semantic_scholar_timeout_seconds
        self._headers = settings.semantic_scholar_headers

    def search(
        self,
        query: str,
        *,
        limit: int = 10,
        year_from: Optional[int] = None,
        year_to: Optional[int] = None,
        open_access: bool = False,
    ) -> List[ScholarlyPaper]:
        """
        Perform a synchronous search against Semantic Scholar.

        Args:
            query: Research topic or question string.
            limit: Maximum number of results (1–50).
            year_from: Only return papers from this year onwards.
            year_to: Only return papers up to this year.
            open_access: If True, restrict to open-access papers.

        Returns:
            List of ScholarlyPaper instances.

        Raises:
            ScholarlySearchError: If the API call fails.
        """
        if not query or not query.strip():
            raise ValueError("Search query must not be empty.")

        params: Dict[str, Any] = {
            "query": query.strip(),
            "limit": min(max(1, limit), 50),
            "fields": _FIELDS,
        }

        # Year filter (Semantic Scholar supports "year:" in query but not as a param;
        # use publicationDateOrYear param instead — actually we filter post-fetch)
        # We'll filter after fetching since SS doesn't have a direct year filter param.

        if open_access:
            params["openAccessPdf"] = ""  # filter hint (non-standard; we post-filter)

        try:
            with httpx.Client(timeout=self._timeout) as client:
                response = client.get(
                    f"{self._base_url}/paper/search",
                    params=params,
                    headers=self._headers,
                )
        except httpx.TimeoutException as exc:
            raise ScholarlySearchError(
                "Semantic Scholar request timed out. Please try again."
            ) from exc
        except httpx.RequestError as exc:
            raise ScholarlySearchError(
                f"Unable to reach Semantic Scholar: {exc}"
            ) from exc

        if response.status_code == 429:
            raise ScholarlySearchError(
                "Semantic Scholar rate limit reached. Please wait a moment and try again."
            )
        if response.status_code == 400:
            raise ScholarlySearchError(
                f"Invalid search request sent to Semantic Scholar: {response.text[:200]}"
            )
        if not response.is_success:
            raise ScholarlySearchError(
                f"Semantic Scholar returned HTTP {response.status_code}: {response.text[:200]}"
            )

        try:
            data = response.json()
        except Exception as exc:
            raise ScholarlySearchError(
                "Semantic Scholar returned an invalid JSON response."
            ) from exc

        raw_papers = data.get("data", [])
        if not isinstance(raw_papers, list):
            raise ScholarlySearchError(
                "Unexpected response format from Semantic Scholar."
            )

        papers: List[ScholarlyPaper] = []
        for raw in raw_papers:
            paper = _normalise_paper(raw)
            if paper is None:
                continue

            # Post-fetch year filters
            if year_from and paper.publication_year and paper.publication_year < year_from:
                continue
            if year_to and paper.publication_year and paper.publication_year > year_to:
                continue
            if open_access and not paper.is_open_access:
                continue

            papers.append(paper)

        logger.info(
            "Semantic Scholar search '%s' returned %d results (limit=%d)",
            query,
            len(papers),
            limit,
        )
        return papers


def _normalise_paper(raw: Dict[str, Any]) -> Optional[ScholarlyPaper]:
    """Convert a raw Semantic Scholar paper dict into ScholarlyPaper."""
    paper_id = raw.get("paperId", "")
    title = (raw.get("title") or "").strip()

    if not paper_id or not title:
        return None  # Skip incomplete entries

    # Authors
    authors: List[str] = []
    for a in raw.get("authors") or []:
        name = (a.get("name") or "").strip()
        if name:
            authors.append(name)

    # DOI
    external_ids = raw.get("externalIds") or {}
    doi: Optional[str] = external_ids.get("DOI") or None

    # Open-access PDF
    oa_pdf = raw.get("openAccessPdf") or {}
    pdf_url: Optional[str] = oa_pdf.get("url") if isinstance(oa_pdf, dict) else None

    # Open-access status
    is_oa = bool(pdf_url)

    # Fields of study
    fields_of_study: List[str] = []
    for f in raw.get("fieldsOfStudy") or []:
        if isinstance(f, str) and f:
            fields_of_study.append(f)

    # Publication year (prefer explicit year field)
    year: Optional[int] = raw.get("year") or None
    if year is None:
        pub_date = raw.get("publicationDate") or ""
        if pub_date and len(pub_date) >= 4:
            try:
                year = int(pub_date[:4])
            except ValueError:
                pass

    return ScholarlyPaper(
        semantic_scholar_id=paper_id,
        title=title,
        abstract=(raw.get("abstract") or "").strip() or None,
        publication_year=year,
        authors=authors,
        venue=(raw.get("venue") or "").strip() or None,
        doi=doi,
        url=raw.get("url") or f"https://www.semanticscholar.org/paper/{paper_id}",
        pdf_url=pdf_url,
        citation_count=int(raw.get("citationCount") or 0),
        reference_count=int(raw.get("referenceCount") or 0),
        is_open_access=is_oa,
        fields_of_study=fields_of_study,
        source="Semantic Scholar",
    )


# Module-level singleton — routes import this
scholarly_search_service = ScholarlySearchService()
