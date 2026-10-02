"""
Evidence & Provenance routes.

GET  /api/projects/{project_id}/evidence
    - Collects all evidence & provenance across the project, including supporting paper metadata,
      paper sources, paper analyses, and research insights.

GET  /api/papers/{paper_id}/sources
    - Retrieves paper sources for a given paper.

POST /api/papers/{paper_id}/sources
    - Adds a new paper source record (e.g. arXiv ID, Crossref DOI, IEEE Xplore URL) for a paper.
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.paper import Paper
from app.models.paper_analysis import PaperAnalysis
from app.models.paper_source import PaperSource
from app.models.project_paper import ProjectPaper
from app.models.research_insight import ResearchInsight
from app.models.research_project import ResearchProject
from app.schemas.evidence import (
    EvidenceItem,
    PaperSourceCreate,
    PaperSourceResponse,
    ProjectEvidenceResponse,
)

router = APIRouter(tags=["evidence"])


@router.get(
    "/projects/{project_id}/evidence",
    response_model=ProjectEvidenceResponse,
)
def get_project_evidence(project_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieve project-level evidence and provenance items linking insights,
    paper analyses, paper sources, and original paper metadata.
    """
    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    # Fetch all project papers
    pp_stmt = select(ProjectPaper).where(ProjectPaper.project_id == project_id)
    project_papers = db.scalars(pp_stmt).all()

    evidence_items: List[EvidenceItem] = []

    # Map paper_id to Paper object and PaperSource objects
    for pp in project_papers:
        paper = pp.paper
        if not paper:
            continue

        # Get paper sources
        sources = db.scalars(
            select(PaperSource).where(PaperSource.paper_id == paper.id)
        ).all()
        source_responses = [PaperSourceResponse.model_validate(s) for s in sources]

        # 1. Add Analysis Evidence Item if analysis exists
        analysis = db.scalars(
            select(PaperAnalysis).where(PaperAnalysis.paper_id == paper.id)
        ).first()

        if analysis and analysis.summary:
            evidence_items.append(
                EvidenceItem(
                    id=analysis.id,
                    type="analysis",
                    paper_id=paper.id,
                    paper_title=paper.title,
                    authors=paper.authors,
                    publication_year=paper.publication_year,
                    doi=paper.doi,
                    source_venue=paper.venue or paper.source,
                    url=paper.url,
                    quote_or_text=f"Analysis Summary: {analysis.summary}"
                    + (f" | Problem: {analysis.problem}" if analysis.problem else ""),
                    related_insight_title=f"Paper Analysis: {paper.title}",
                    insight_type="analysis",
                    confidence=analysis.confidence or 0.90,
                    sources=source_responses,
                )
            )

    # 2. Add Research Insight Evidence Items
    insights = db.scalars(
        select(ResearchInsight).where(ResearchInsight.project_id == project_id)
    ).all()

    for ins in insights:
        # Try to find a matching paper by title snippet or assign to first paper as fallback provenance
        matching_paper = None
        matching_sources: List[PaperSourceResponse] = []

        for pp in project_papers:
            if pp.paper and (
                ins.evidence and pp.paper.title.lower() in ins.evidence.lower()
            ):
                matching_paper = pp.paper
                break

        if not matching_paper and project_papers and project_papers[0].paper:
            matching_paper = project_papers[0].paper

        if matching_paper:
            sources = db.scalars(
                select(PaperSource).where(PaperSource.paper_id == matching_paper.id)
            ).all()
            matching_sources = [PaperSourceResponse.model_validate(s) for s in sources]

        evidence_items.append(
            EvidenceItem(
                id=ins.id,
                type="insight",
                paper_id=matching_paper.id if matching_paper else None,
                paper_title=matching_paper.title if matching_paper else "Project Insight",
                authors=matching_paper.authors if matching_paper else None,
                publication_year=matching_paper.publication_year if matching_paper else None,
                doi=matching_paper.doi if matching_paper else None,
                source_venue=matching_paper.venue if matching_paper else "ResearchIQ Analysis Engine",
                url=matching_paper.url if matching_paper else None,
                quote_or_text=ins.evidence or ins.description or ins.title,
                related_insight_title=ins.title,
                insight_type=ins.type.value if hasattr(ins.type, "value") else str(ins.type),
                confidence=ins.confidence or 0.88,
                sources=matching_sources,
            )
        )

    return ProjectEvidenceResponse(
        project_id=project_id,
        total_evidence_items=len(evidence_items),
        items=evidence_items,
    )


@router.get(
    "/papers/{paper_id}/sources",
    response_model=List[PaperSourceResponse],
)
def get_paper_sources(paper_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieve all source entries for a given paper.
    """
    paper = db.get(Paper, paper_id)
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Paper {paper_id} not found",
        )

    sources = db.scalars(
        select(PaperSource).where(PaperSource.paper_id == paper_id)
    ).all()
    return sources


@router.post(
    "/papers/{paper_id}/sources",
    response_model=PaperSourceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_paper_source(
    paper_id: UUID,
    payload: PaperSourceCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new source record for a paper (e.g. arXiv identifier, DOI reference, Crossref link).
    """
    paper = db.get(Paper, paper_id)
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Paper {paper_id} not found",
        )

    # Check for existing source with same source_name & source_identifier
    existing = db.scalars(
        select(PaperSource).where(
            PaperSource.paper_id == paper_id,
            PaperSource.source_name == payload.source_name,
            PaperSource.source_identifier == payload.source_identifier,
        )
    ).first()

    if existing:
        return existing

    source = PaperSource(
        paper_id=paper_id,
        source_name=payload.source_name,
        source_identifier=payload.source_identifier,
        source_url=payload.source_url,
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return source
