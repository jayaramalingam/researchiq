"""
Search & Paper Discovery route.

GET  /api/projects/{project_id}/search?q=<query>
    - PRIMARY: Calls Semantic Scholar for live online scholarly paper discovery.
    - FALLBACK: If Semantic Scholar is unavailable or query is empty, falls back
      to the local PostgreSQL papers table.
    - Returns papers enriched with `is_attached` flag for the given project.
    - Logs each search run to the search_runs table.

POST /api/projects/{project_id}/search/add
    - Accepts a PaperCreateFromSearch payload (title required).
    - Deduplicates by DOI or Semantic Scholar external ID.
    - Creates the Paper record if it doesn't already exist.
    - Creates PaperSource provenance record (source_name = "Semantic Scholar").
    - Attaches the paper to the project (409 if already attached).

POST /api/projects/{project_id}/search/attach/{paper_id}
    - Attaches an existing paper (already in the database) to the project.
    - Returns 409 if already attached.
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.paper import Paper
from app.models.paper_source import PaperSource
from app.models.project_paper import ProjectPaper
from app.models.research_project import ResearchProject
from app.models.search_run import SearchRun, SearchStatus
from app.schemas.paper import ProjectPaperResponse, PaperResponse
from app.schemas.search import (
    PaperCreateFromSearch,
    SearchResponse,
    SearchResultPaper,
)
from app.services.scholarly_search_service import (
    ScholarlySearchError,
    scholarly_search_service,
)

router = APIRouter(prefix="/projects", tags=["search"])

MAX_RESULTS = 50


# ---------------------------------------------------------------------------
# Helper: convert DB paper → SearchResultPaper
# ---------------------------------------------------------------------------

def _paper_to_result(paper: Paper, pp: Optional[ProjectPaper]) -> SearchResultPaper:
    return SearchResultPaper(
        id=paper.id,
        title=paper.title,
        abstract=paper.abstract,
        authors=paper.authors,
        publication_year=paper.publication_year,
        doi=paper.doi,
        url=paper.url,
        pdf_url=paper.pdf_url,
        source=paper.source,
        citation_count=paper.citation_count,
        venue=paper.venue,
        is_open_access=paper.is_open_access,
        created_at=paper.created_at,
        is_attached=pp is not None,
        relevance_score=pp.relevance_score if pp else None,
        rank=pp.rank if pp else None,
    )


# ---------------------------------------------------------------------------
# Helper: build attached_map for a project
# ---------------------------------------------------------------------------

def _get_attached_map(project_id: UUID, db: Session) -> dict[UUID, ProjectPaper]:
    pp_rows = db.scalars(
        select(ProjectPaper).where(ProjectPaper.project_id == project_id)
    ).all()
    return {pp.paper_id: pp for pp in pp_rows}


# ---------------------------------------------------------------------------
# GET /projects/{project_id}/search
# ---------------------------------------------------------------------------

@router.get("/{project_id}/search", response_model=SearchResponse)
def search_papers_for_project(
    project_id: UUID,
    q: Optional[str] = Query(
        default=None,
        description="Research topic or question to search for scholarly papers.",
    ),
    limit: int = Query(default=10, ge=1, le=MAX_RESULTS),
    year_from: Optional[int] = Query(default=None, ge=1900, le=2100),
    year_to: Optional[int] = Query(default=None, ge=1900, le=2100),
    open_access: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    """
    Search for scholarly papers.

    With a query term:
      1. Calls Semantic Scholar for live external discovery.
      2. Falls back to local PostgreSQL if Semantic Scholar is unavailable.

    Without a query term:
      Returns all papers in the local database for this project.

    Results include `is_attached` flag and (when found in DB) a stable UUID.
    Semantic Scholar results that don't yet exist in the DB are returned as
    transient objects — they become persistent when the user clicks "Add to Project".
    """
    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    query_text = (q or "").strip()

    # Validate minimum length only when something was typed
    if query_text and len(query_text) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Search query must be at least 2 characters.",
        )

    attached_map = _get_attached_map(project_id, db)

    # -----------------------------------------------------------------------
    # BRANCH A: Online Semantic Scholar search
    # -----------------------------------------------------------------------
    if query_text:
        scholar_results: List[SearchResultPaper] = []
        source_label = "database"
        note: Optional[str] = None
        scholar_error: Optional[str] = None

        try:
            papers = scholarly_search_service.search(
                query_text,
                limit=limit,
                year_from=year_from,
                year_to=year_to,
                open_access=open_access,
            )
            source_label = "Semantic Scholar"

            # Build results — check if each paper is already in the local DB
            # by matching on Semantic Scholar external ID (stored in PaperSource)
            # or by DOI.
            for rank_idx, sp in enumerate(papers, start=1):
                # Try to find an existing Paper record
                existing: Optional[Paper] = None

                # Match by DOI (most reliable)
                if sp.doi:
                    existing = db.scalars(
                        select(Paper).where(Paper.doi == sp.doi)
                    ).first()

                # Match by Semantic Scholar ID in PaperSource table
                if existing is None:
                    src_row = db.scalars(
                        select(PaperSource).where(
                            PaperSource.source_name == "Semantic Scholar",
                            PaperSource.source_identifier == sp.semantic_scholar_id,
                        )
                    ).first()
                    if src_row:
                        existing = db.get(Paper, src_row.paper_id)

                if existing:
                    pp = attached_map.get(existing.id)
                    scholar_results.append(_paper_to_result(existing, pp))
                else:
                    # Paper not yet in DB — return as transient result with no UUID
                    # Use a synthetic representation; the client will POST /search/add
                    # with all metadata to actually create the record.
                    scholar_results.append(
                        SearchResultPaper(
                            id=None,  # no DB record yet
                            title=sp.title,
                            abstract=sp.abstract,
                            authors=sp.authors,
                            publication_year=sp.publication_year,
                            doi=sp.doi,
                            url=sp.url,
                            pdf_url=sp.pdf_url,
                            source=sp.source,
                            citation_count=sp.citation_count,
                            venue=sp.venue,
                            is_open_access=sp.is_open_access,
                            created_at=None,
                            is_attached=False,
                            relevance_score=None,
                            rank=rank_idx,
                            # Pass the SS ID so the frontend can include it in /add payload
                            semantic_scholar_id=sp.semantic_scholar_id,
                            fields_of_study=sp.fields_of_study,
                        )
                    )

            if not scholar_results:
                note = (
                    f"No scholarly papers found for '{query_text}' on Semantic Scholar. "
                    "Try different keywords."
                )

        except ScholarlySearchError as exc:
            # Graceful degradation: fall back to local DB
            scholar_error = str(exc)
            note = (
                f"Semantic Scholar is temporarily unavailable ({exc}). "
                "Showing local database results instead."
            )

        # If Semantic Scholar returned results, merge any local DB matching papers and return
        if scholar_results:
            db_matching = _local_db_search(project_id, query_text, limit, attached_map, db)
            scholar_ids = {r.id for r in scholar_results if r.id}
            for dbr in db_matching:
                if dbr.id and dbr.id not in scholar_ids:
                    scholar_results.append(dbr)
                    scholar_ids.add(dbr.id)

            _log_search_run(project_id, query_text, len(scholar_results), "Semantic Scholar + database", db)
            return SearchResponse(
                project_id=project_id,
                query=query_text,
                total_results=len(scholar_results),
                results=scholar_results,
                source="Semantic Scholar",
                note=note,
            )

        # Fall back to local DB
        db_results = _local_db_search(project_id, query_text, limit, attached_map, db)
        final_note = note or (
            f"No local papers matching '{query_text}'. "
            "Try the Semantic Scholar search or add papers manually."
            if not db_results else None
        )
        _log_search_run(project_id, query_text, len(db_results), "database (fallback)", db)
        return SearchResponse(
            project_id=project_id,
            query=query_text,
            total_results=len(db_results),
            results=db_results,
            source="database (fallback)",
            note=final_note,
        )

    # -----------------------------------------------------------------------
    # BRANCH B: No query — return all local DB papers
    # -----------------------------------------------------------------------
    db_results = _local_db_search(project_id, "", limit, attached_map, db)
    _log_search_run(project_id, "(all papers)", len(db_results), "database", db)
    return SearchResponse(
        project_id=project_id,
        query="",
        total_results=len(db_results),
        results=db_results,
        source="database",
        note="Enter a research topic to search Semantic Scholar for scholarly papers.",
    )


def _local_db_search(
    project_id: UUID,
    query_text: str,
    limit: int,
    attached_map: dict,
    db: Session,
) -> List[SearchResultPaper]:
    """Search the local papers table and return results."""
    stmt = select(Paper)
    if query_text:
        pattern = f"%{query_text}%"
        stmt = stmt.where(
            or_(
                Paper.title.ilike(pattern),
                Paper.abstract.ilike(pattern),
                Paper.venue.ilike(pattern),
                Paper.source.ilike(pattern),
            )
        )
    stmt = stmt.order_by(Paper.citation_count.desc()).limit(limit)
    papers = db.scalars(stmt).all()
    return [_paper_to_result(p, attached_map.get(p.id)) for p in papers]


def _log_search_run(
    project_id: UUID, query: str, count: int, provider: str, db: Session
) -> None:
    try:
        run = SearchRun(
            project_id=project_id,
            query=query,
            papers_discovered=count,
            papers_deduplicated=count,
            papers_selected=0,
            status=SearchStatus.COMPLETED,
        )
        db.add(run)
        db.commit()
    except Exception:
        db.rollback()


# ---------------------------------------------------------------------------
# POST /projects/{project_id}/search/add
# ---------------------------------------------------------------------------

@router.post(
    "/{project_id}/search/add",
    response_model=ProjectPaperResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_paper_from_search(
    project_id: UUID,
    payload: PaperCreateFromSearch,
    db: Session = Depends(get_db),
):
    """
    Create a paper (if not already existing) and attach it to the project.

    Deduplication priority:
      1. By DOI (most reliable).
      2. By Semantic Scholar ID stored in PaperSource.

    Provenance: a PaperSource record is always created/updated with:
      source_name = "Semantic Scholar" (or the payload source)
      source_identifier = semantic_scholar_id
    """
    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    # ---- Deduplication ----
    paper: Optional[Paper] = None

    if payload.doi:
        paper = db.scalars(select(Paper).where(Paper.doi == payload.doi)).first()

    if paper is None and payload.semantic_scholar_id:
        src_row = db.scalars(
            select(PaperSource).where(
                PaperSource.source_name == "Semantic Scholar",
                PaperSource.source_identifier == payload.semantic_scholar_id,
            )
        ).first()
        if src_row:
            paper = db.get(Paper, src_row.paper_id)

    # ---- Create if new ----
    if paper is None:
        paper = Paper(
            title=payload.title,
            abstract=payload.abstract,
            authors=payload.authors,
            publication_year=payload.publication_year,
            doi=payload.doi,
            url=payload.url,
            pdf_url=payload.pdf_url,
            source=payload.source or "Semantic Scholar",
            citation_count=payload.citation_count or 0,
            venue=payload.venue,
            is_open_access=payload.is_open_access or False,
        )
        db.add(paper)
        db.flush()  # generate paper.id

        # ---- Provenance: PaperSource ----
        if payload.semantic_scholar_id:
            try:
                src = PaperSource(
                    paper_id=paper.id,
                    source_name="Semantic Scholar",
                    source_identifier=payload.semantic_scholar_id,
                    source_url=(
                        payload.url
                        or f"https://www.semanticscholar.org/paper/{payload.semantic_scholar_id}"
                    ),
                )
                db.add(src)
                db.flush()
            except Exception:
                db.rollback()
                # Re-fetch in case of unique constraint violation
                paper = db.scalars(select(Paper).where(Paper.doi == payload.doi)).first()
                if paper is None:
                    raise

    # ---- Check if already attached ----
    existing_pp = db.scalars(
        select(ProjectPaper).where(
            ProjectPaper.project_id == project_id,
            ProjectPaper.paper_id == paper.id,
        )
    ).first()
    if existing_pp:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This paper is already attached to the project.",
        )

    pp = ProjectPaper(
        project_id=project_id,
        paper_id=paper.id,
        relevance_score=payload.relevance_score,
        rank=payload.rank,
        selected=True,
    )
    db.add(pp)
    db.commit()
    db.refresh(pp)
    db.refresh(paper)

    return ProjectPaperResponse(
        id=pp.id,
        project_id=pp.project_id,
        paper_id=pp.paper_id,
        relevance_score=pp.relevance_score,
        rank=pp.rank,
        selected=pp.selected,
        added_at=pp.added_at,
        paper=PaperResponse.model_validate(paper),
    )


# ---------------------------------------------------------------------------
# POST /projects/{project_id}/search/attach/{paper_id}
# ---------------------------------------------------------------------------

@router.post(
    "/{project_id}/search/attach/{paper_id}",
    response_model=ProjectPaperResponse,
    status_code=status.HTTP_201_CREATED,
)
def attach_existing_paper_to_project(
    project_id: UUID,
    paper_id: UUID,
    db: Session = Depends(get_db),
):
    """Attach an existing paper (already in the database) to a project."""
    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    paper = db.get(Paper, paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail=f"Paper {paper_id} not found")

    existing_pp = db.scalars(
        select(ProjectPaper).where(
            ProjectPaper.project_id == project_id,
            ProjectPaper.paper_id == paper_id,
        )
    ).first()
    if existing_pp:
        raise HTTPException(status_code=409, detail="Paper already attached to this project.")

    pp = ProjectPaper(
        project_id=project_id,
        paper_id=paper_id,
        selected=True,
    )
    db.add(pp)
    db.commit()
    db.refresh(pp)

    return ProjectPaperResponse(
        id=pp.id,
        project_id=pp.project_id,
        paper_id=pp.paper_id,
        relevance_score=pp.relevance_score,
        rank=pp.rank,
        selected=pp.selected,
        added_at=pp.added_at,
        paper=PaperResponse.model_validate(paper),
    )
