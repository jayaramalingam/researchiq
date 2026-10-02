"""
Paper Analysis routes — now powered by real OpenRouter AI.

GET  /api/papers/{paper_id}/analysis
    - Returns an existing PaperAnalysis record.
    - 404 if no analysis has been run yet.

POST /api/papers/{paper_id}/analysis
    - Triggers real AI analysis of the paper via OpenRouter.
    - Sends title/abstract/authors/year/venue/fields to the AI.
    - Validates AI JSON response with Pydantic.
    - Saves and returns a PaperAnalysis record.
    - Returns 409 if analysis already exists (use PUT to update).

POST /api/papers/{paper_id}/analysis/refresh
    - Re-runs AI analysis and overwrites the existing record (or creates one).
    - Useful when the model or paper metadata has been updated.

PUT  /api/papers/{paper_id}/analysis
    - Manually update analysis fields (preserves original behaviour).
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.paper import Paper
from app.models.paper_analysis import PaperAnalysis
from app.models.paper_source import PaperSource
from app.schemas.paper_analysis import (
    PaperAnalysisCreate,
    PaperAnalysisResponse,
    PaperAnalysisUpdate,
)
from app.services.ai_service import (
    AIKeyMissingError,
    AIServiceError,
    AIServiceUnavailableError,
    ai_service,
)
from app.core.config import settings

router = APIRouter(prefix="/papers", tags=["paper-analysis"])


# ---------------------------------------------------------------------------
# Helper: gather paper context
# ---------------------------------------------------------------------------

def _get_paper_context(paper: Paper, db: Session) -> dict:
    """Collect all available metadata for the paper to feed to AI."""
    authors: List[str] = []
    if isinstance(paper.authors, list):
        for a in paper.authors:
            if isinstance(a, str):
                authors.append(a)
            elif isinstance(a, dict):
                authors.append(a.get("name") or a.get("author") or "")
    elif isinstance(paper.authors, str):
        authors = [paper.authors]

    # Try to get fields_of_study from PaperSource metadata (if available)
    fields_of_study: List[str] = []

    return {
        "title": paper.title,
        "abstract": paper.abstract,
        "authors": authors,
        "year": paper.publication_year,
        "venue": paper.venue,
        "fields_of_study": fields_of_study,
    }


# ---------------------------------------------------------------------------
# Helper: run AI analysis and return a PaperAnalysis ORM object
# ---------------------------------------------------------------------------

def _run_ai_analysis(paper: Paper, db: Session) -> PaperAnalysis:
    ctx = _get_paper_context(paper, db)

    try:
        ai_result = ai_service.analyze_paper(**ctx)
    except AIKeyMissingError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except AIServiceUnavailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service temporarily unavailable: {exc}",
        ) from exc
    except AIServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI analysis failed: {exc}",
        ) from exc

    return PaperAnalysis(
        paper_id=paper.id,
        summary=ai_result.summary or None,
        problem=ai_result.research_problem or None,
        methodology=ai_result.methodology or None,
        dataset=ai_result.dataset or None,
        results=ai_result.results or None,
        limitations=ai_result.limitations or None,
        contribution=ai_result.contribution or None,
        future_work=ai_result.future_work or None,
        ai_model=ai_result.model_used or settings.openrouter_primary_model,
        confidence=ai_result.confidence,
    )


# ---------------------------------------------------------------------------
# GET /papers/{paper_id}/analysis
# ---------------------------------------------------------------------------

@router.get(
    "/{paper_id}/analysis",
    response_model=PaperAnalysisResponse,
)
def get_paper_analysis(
    paper_id: UUID,
    db: Session = Depends(get_db),
):
    """Return the stored analysis for a paper, or 404 if not yet analysed."""
    paper = db.get(Paper, paper_id)
    if paper is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")

    analysis = db.scalar(select(PaperAnalysis).where(PaperAnalysis.paper_id == paper_id))
    if analysis is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paper analysis not found. Use POST to trigger AI analysis.",
        )
    return analysis


# ---------------------------------------------------------------------------
# POST /papers/{paper_id}/analysis  — trigger real AI analysis
# ---------------------------------------------------------------------------

@router.post(
    "/{paper_id}/analysis",
    response_model=PaperAnalysisResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_paper_analysis(
    paper_id: UUID,
    payload: Optional[PaperAnalysisCreate] = None,
    db: Session = Depends(get_db),
):
    """
    Trigger AI analysis of a paper using OpenRouter.

    If OPENROUTER_API_KEY is set, the AI is called with the paper's title,
    abstract, authors, year, and venue.

    If a manual payload is provided AND the AI key is not set, the payload
    is stored directly (backward compatibility for tests).

    Returns 409 if analysis already exists — use PUT to update or
    POST .../analysis/refresh to re-run.
    """
    paper = db.get(Paper, paper_id)
    if paper is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")

    existing = db.scalar(select(PaperAnalysis).where(PaperAnalysis.paper_id == paper_id))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Paper analysis already exists. Use POST .../refresh to re-run or PUT to update.",
        )

    # Use AI if key is configured; fall back to manual payload
    if settings.ai_enabled:
        analysis = _run_ai_analysis(paper, db)
    elif payload is not None:
        analysis = PaperAnalysis(paper_id=paper_id, **payload.model_dump())
    else:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI analysis is not configured. "
                "Set OPENROUTER_API_KEY in backend/.env to enable AI features. "
                "Alternatively, provide a manual analysis payload."
            ),
        )

    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


# ---------------------------------------------------------------------------
# POST /papers/{paper_id}/analysis/refresh  — re-run AI, overwrite existing
# ---------------------------------------------------------------------------

@router.post(
    "/{paper_id}/analysis/refresh",
    response_model=PaperAnalysisResponse,
    status_code=status.HTTP_200_OK,
)
def refresh_paper_analysis(
    paper_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Re-run AI analysis and overwrite any existing analysis record.
    Requires OPENROUTER_API_KEY to be set.
    """
    paper = db.get(Paper, paper_id)
    if paper is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")

    analysis = _run_ai_analysis(paper, db)

    existing = db.scalar(select(PaperAnalysis).where(PaperAnalysis.paper_id == paper_id))
    if existing:
        for field in ("summary", "problem", "methodology", "dataset", "results",
                      "limitations", "contribution", "future_work", "ai_model", "confidence"):
            setattr(existing, field, getattr(analysis, field))
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return analysis


# ---------------------------------------------------------------------------
# PUT /papers/{paper_id}/analysis  — manual update
# ---------------------------------------------------------------------------

@router.put(
    "/{paper_id}/analysis",
    response_model=PaperAnalysisResponse,
)
def update_paper_analysis(
    paper_id: UUID,
    payload: PaperAnalysisUpdate,
    db: Session = Depends(get_db),
):
    """Manually update analysis fields. Preserves original backward compatibility."""
    paper = db.get(Paper, paper_id)
    if paper is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")

    analysis = db.scalar(select(PaperAnalysis).where(PaperAnalysis.paper_id == paper_id))
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper analysis not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(analysis, field, value)

    db.commit()
    db.refresh(analysis)
    return analysis
