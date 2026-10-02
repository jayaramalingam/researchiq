from uuid import UUID
from collections import Counter
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.research_project import ResearchProject
from app.models.paper import Paper
from app.models.project_paper import ProjectPaper
from app.models.paper_analysis import PaperAnalysis
from app.models.paper_relationship import PaperRelationship
from app.models.research_insight import ResearchInsight
from app.schemas.dashboard import (
    DashboardResponse,
    ProjectSummary,
    GlobalOverview,
    PaperAnalysisOverview,
    InsightsOverview,
    RelationshipOverview,
)

router = APIRouter(prefix="/projects", tags=["dashboard"])


@router.get("/{project_id}/dashboard", response_model=DashboardResponse)
def get_project_dashboard(project_id: UUID, db: Session = Depends(get_db)):
    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    # 1. Project Papers & Analysis
    project_papers = db.scalars(
        select(ProjectPaper).where(ProjectPaper.project_id == project_id)
    ).all()
    paper_ids = [pp.paper_id for pp in project_papers]
    total_project_papers = len(paper_ids)

    if total_project_papers > 0:
        analyzed_count = db.scalar(
            select(func.count(func.distinct(PaperAnalysis.paper_id))).where(
                PaperAnalysis.paper_id.in_(paper_ids)
            )
        ) or 0
    else:
        analyzed_count = 0

    unanalyzed_count = max(0, total_project_papers - analyzed_count)
    coverage_percentage = (
        round((analyzed_count / total_project_papers) * 100.0, 1)
        if total_project_papers > 0
        else 0.0
    )

    paper_analysis_overview = PaperAnalysisOverview(
        total_papers=total_project_papers,
        analyzed_papers=analyzed_count,
        unanalyzed_papers=unanalyzed_count,
        coverage_percentage=coverage_percentage,
    )

    # 2. Insights Overview
    insights = db.scalars(
        select(ResearchInsight).where(ResearchInsight.project_id == project_id)
    ).all()
    total_insights = len(insights)

    type_counter = Counter()
    for insight in insights:
        t_val = insight.type.value if hasattr(insight.type, "value") else str(insight.type)
        type_counter[t_val] += 1

    insights_overview = InsightsOverview(
        total_insights=total_insights,
        gaps_count=type_counter.get("gap", 0),
        innovations_count=type_counter.get("innovation", 0),
        contradictions_count=type_counter.get("contradiction", 0),
        opportunities_count=type_counter.get("opportunity", 0),
        by_type=dict(type_counter),
    )

    # 3. Relationships Overview
    if total_project_papers > 0:
        relationships = db.scalars(
            select(PaperRelationship).where(
                PaperRelationship.source_paper_id.in_(paper_ids),
                PaperRelationship.target_paper_id.in_(paper_ids),
            )
        ).all()
    else:
        relationships = []

    total_relationships = len(relationships)
    rel_type_counter = Counter()
    total_strength = 0.0
    for rel in relationships:
        r_val = rel.relationship_type.value if hasattr(rel.relationship_type, "value") else str(rel.relationship_type)
        rel_type_counter[r_val] += 1
        total_strength += float(rel.strength or 0.0)

    avg_strength = (
        round(total_strength / total_relationships, 2)
        if total_relationships > 0
        else 0.0
    )

    relationship_overview = RelationshipOverview(
        total_relationships=total_relationships,
        by_type=dict(rel_type_counter),
        average_strength=avg_strength,
    )

    # 4. Project Summary
    status_str = project.status.value if hasattr(project.status, "value") else str(project.status)
    project_summary = ProjectSummary(
        id=project.id,
        title=project.title,
        research_question=project.research_question,
        description=project.description,
        status=status_str,
        created_at=project.created_at,
        updated_at=project.updated_at,
        papers_count=total_project_papers,
        insights_count=total_insights,
        relationships_count=total_relationships,
    )

    # 5. Global Overview across all projects
    total_projects = db.scalar(select(func.count(ResearchProject.id))) or 0
    total_global_papers = db.scalar(select(func.count(Paper.id))) or 0
    total_global_analyses = db.scalar(select(func.count(PaperAnalysis.id))) or 0
    total_global_insights = db.scalar(select(func.count(ResearchInsight.id))) or 0
    total_global_relationships = db.scalar(select(func.count(PaperRelationship.id))) or 0

    global_overview = GlobalOverview(
        total_projects=total_projects,
        total_papers=total_global_papers,
        total_analyses=total_global_analyses,
        total_insights=total_global_insights,
        total_relationships=total_global_relationships,
    )

    return DashboardResponse(
        project_id=project.id,
        project_summary=project_summary,
        global_overview=global_overview,
        paper_analysis=paper_analysis_overview,
        insights=insights_overview,
        relationships=relationship_overview,
    )
