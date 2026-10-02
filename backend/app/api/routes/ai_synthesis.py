"""
AI Synthesis routes.

POST /api/projects/{project_id}/analyze-collection
    - Runs AI analysis sequentially on all analysed project papers.
    - Returns progress as a summary of what succeeded/failed.

POST /api/projects/{project_id}/ai-synthesis
    - Gathers existing PaperAnalysis records for the project.
    - Sends them to OpenRouter for cross-paper synthesis.
    - Stores the resulting relationships in paper_relationships table.
    - Stores identified research gaps in research_insights table.
    - Returns the full CrossPaperSynthesis result.
"""
import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.models.paper import Paper
from app.models.paper_analysis import PaperAnalysis
from app.models.paper_relationship import PaperRelationship, RelationshipType
from app.models.project_paper import ProjectPaper
from app.models.research_insight import InsightType, ResearchInsight
from app.models.research_project import ResearchProject
from app.services.ai_service import (
    AIKeyMissingError,
    AIServiceError,
    AIServiceUnavailableError,
    CrossPaperSynthesis,
    ai_service,
)
from app.api.routes.paper_analysis import _run_ai_analysis

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["ai-synthesis"])


# ---------------------------------------------------------------------------
# POST /projects/{project_id}/analyze-collection
# ---------------------------------------------------------------------------

@router.post("/{project_id}/analyze-collection", status_code=status.HTTP_200_OK)
def analyze_collection(
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Run AI analysis on all project papers that do not yet have an analysis.

    Processes papers sequentially (safe rate limiting).
    Returns a summary: how many succeeded, how many failed, and any errors.
    """
    if not settings.ai_enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI analysis is not configured. "
                "Add OPENROUTER_API_KEY to backend/.env to enable this feature."
            ),
        )

    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    # Get project papers
    pp_rows = db.scalars(
        select(ProjectPaper).where(ProjectPaper.project_id == project_id)
    ).all()

    if not pp_rows:
        return {
            "project_id": str(project_id),
            "total": 0,
            "analyzed": 0,
            "skipped": 0,
            "failed": 0,
            "errors": [],
            "message": "No papers found in this project.",
        }

    paper_ids = [pp.paper_id for pp in pp_rows]

    # Get existing analyses
    existing_analyses = db.scalars(
        select(PaperAnalysis).where(PaperAnalysis.paper_id.in_(paper_ids))
    ).all()
    already_analyzed = {a.paper_id for a in existing_analyses}

    # Papers needing analysis
    papers_to_analyze = db.scalars(
        select(Paper).where(
            Paper.id.in_(paper_ids),
            Paper.id.notin_(already_analyzed),
        )
    ).all()

    # Limit for safety
    MAX_BATCH = 10
    papers_to_analyze = list(papers_to_analyze)[:MAX_BATCH]

    results = {
        "project_id": str(project_id),
        "total": len(pp_rows),
        "skipped_already_analyzed": len(already_analyzed),
        "to_analyze": len(papers_to_analyze),
        "analyzed": 0,
        "failed": 0,
        "errors": [],
        "papers": [],
    }

    for paper in papers_to_analyze:
        paper_result = {"paper_id": str(paper.id), "title": paper.title, "status": ""}
        try:
            analysis = _run_ai_analysis(paper, db)
            # Double-check not created in the meantime
            existing = db.scalar(
                select(PaperAnalysis).where(PaperAnalysis.paper_id == paper.id)
            )
            if existing:
                paper_result["status"] = "skipped (already exists)"
                results["skipped_already_analyzed"] = results.get("skipped_already_analyzed", 0) + 1
            else:
                db.add(analysis)
                db.commit()
                results["analyzed"] += 1
                paper_result["status"] = "analyzed"
        except HTTPException as exc:
            db.rollback()
            results["failed"] += 1
            paper_result["status"] = f"failed: {exc.detail}"
            results["errors"].append({"paper": paper.title, "error": exc.detail})
        except Exception as exc:
            db.rollback()
            results["failed"] += 1
            paper_result["status"] = f"failed: {exc}"
            results["errors"].append({"paper": paper.title, "error": str(exc)})

        results["papers"].append(paper_result)

    return results


# ---------------------------------------------------------------------------
# POST /projects/{project_id}/ai-synthesis
# ---------------------------------------------------------------------------

@router.post("/{project_id}/ai-synthesis", status_code=status.HTTP_200_OK)
def run_ai_synthesis(
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Run cross-paper AI synthesis for the project.

    Gathers all existing PaperAnalysis records, sends them to OpenRouter,
    and stores:
    - Identified paper-to-paper relationships in paper_relationships.
    - Identified research gaps/trends/insights in research_insights.

    Returns the full CrossPaperSynthesis JSON.
    """
    if not settings.ai_enabled:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "AI synthesis requires OPENROUTER_API_KEY in backend/.env."
            ),
        )

    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")

    # Get analyses for project papers
    pp_rows = db.scalars(
        select(ProjectPaper).where(ProjectPaper.project_id == project_id)
    ).all()
    paper_ids = [pp.paper_id for pp in pp_rows]

    if not paper_ids:
        raise HTTPException(status_code=400, detail="No papers in this project to synthesize.")

    analyses = db.scalars(
        select(PaperAnalysis).where(PaperAnalysis.paper_id.in_(paper_ids))
    ).all()

    if not analyses:
        raise HTTPException(
            status_code=400,
            detail=(
                "No AI analyses found for this project's papers. "
                "Run 'Analyze Research Collection' first."
            ),
        )

    # Build paper map for lookup
    papers = db.scalars(select(Paper).where(Paper.id.in_(paper_ids))).all()
    paper_map = {p.id: p for p in papers}
    analysis_paper_map = {a.paper_id: paper_map.get(a.paper_id) for a in analyses}

    # Build synthesis input
    papers_info: List[Dict[str, Any]] = []
    for analysis in analyses:
        p = analysis_paper_map.get(analysis.paper_id)
        papers_info.append({
            "title": p.title if p else f"Paper {analysis.paper_id}",
            "abstract": p.abstract if p else None,
            "methodology": analysis.methodology,
            "results": analysis.results,
            "limitations": analysis.limitations,
            "contribution": analysis.contribution,
        })

    # Call AI
    try:
        synthesis: CrossPaperSynthesis = ai_service.synthesize_papers(papers_info)
    except AIKeyMissingError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except AIServiceUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    # ------------------------------------------------------------------
    # Persist: Research Insights from synthesis
    # ------------------------------------------------------------------
    insights_created = 0

    def _add_insight(itype: InsightType, title: str, description: str = ""):
        nonlocal insights_created
        insight = ResearchInsight(
            project_id=project_id,
            type=itype,
            title=title[:255],
            description=description or None,
            evidence="AI-generated synthesis via OpenRouter",
            confidence=0.7,
        )
        db.add(insight)
        insights_created += 1

    for gap in synthesis.research_gaps:
        _add_insight(InsightType.gap, gap[:255], gap)

    for trend in synthesis.research_trends:
        _add_insight(InsightType.trend, trend[:255], trend)

    for contra in synthesis.contradictions:
        _add_insight(InsightType.contradiction, contra[:255], contra)

    for future in synthesis.future_directions:
        _add_insight(InsightType.future_scope, future[:255], future)

    # ------------------------------------------------------------------
    # Persist: Paper Relationships from synthesis
    # ------------------------------------------------------------------
    relationships_created = 0

    # Build title → paper_id map
    title_to_paper: Dict[str, UUID] = {}
    for p in papers:
        title_to_paper[p.title.lower().strip()] = p.id

    VALID_REL_TYPES = {rt.value for rt in RelationshipType}

    for rel in synthesis.relationships:
        src_title = (rel.source_paper_title or "").lower().strip()
        tgt_title = (rel.target_paper_title or "").lower().strip()
        rel_type_str = (rel.relationship_type or "related").lower().strip()

        if rel_type_str not in VALID_REL_TYPES:
            rel_type_str = "similar"

        src_id = _fuzzy_title_match(src_title, title_to_paper)
        tgt_id = _fuzzy_title_match(tgt_title, title_to_paper)

        if src_id is None or tgt_id is None or src_id == tgt_id:
            continue

        # Check if relationship already exists
        existing_rel = db.scalar(
            select(PaperRelationship).where(
                PaperRelationship.source_paper_id == src_id,
                PaperRelationship.target_paper_id == tgt_id,
                PaperRelationship.relationship_type == rel_type_str,
            )
        )
        if existing_rel:
            continue

        paper_rel = PaperRelationship(
            source_paper_id=src_id,
            target_paper_id=tgt_id,
            relationship_type=RelationshipType(rel_type_str),
            strength=float(rel.confidence),
            explanation=(rel.evidence or "")[:500] or None,
        )
        db.add(paper_rel)
        relationships_created += 1

    try:
        db.commit()
    except Exception as exc:
        db.rollback()
        logger.warning("Failed to persist some synthesis results: %s", exc)

    return {
        "project_id": str(project_id),
        "papers_analyzed": len(analyses),
        "synthesis": synthesis.model_dump(),
        "insights_created": insights_created,
        "relationships_created": relationships_created,
    }


def _fuzzy_title_match(search_title: str, title_map: Dict[str, UUID]) -> Optional[UUID]:
    """Find the closest matching paper ID by title (exact or prefix match)."""
    if not search_title:
        return None

    # Exact match
    if search_title in title_map:
        return title_map[search_title]

    # Partial match (title contains the search term or vice versa)
    for stored_title, paper_id in title_map.items():
        if search_title in stored_title or stored_title in search_title:
            return paper_id

    return None
