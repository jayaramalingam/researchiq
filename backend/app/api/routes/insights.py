from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.database.session import get_db
from app.models.research_project import ResearchProject
from app.models.research_insight import ResearchInsight, InsightType as ModelInsightType
from app.schemas.insight import InsightCreate, InsightResponse

router = APIRouter(prefix="", tags=["insights"])


@router.post(
    "/projects/{project_id}/insights",
    response_model=InsightResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project_insight(
    project_id: UUID,
    insight_in: InsightCreate,
    db: Session = Depends(get_db),
):
    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    model_type = ModelInsightType(insight_in.type.value)

    insight = ResearchInsight(
        project_id=project_id,
        type=model_type,
        title=insight_in.title,
        description=insight_in.description,
        evidence=insight_in.evidence,
        confidence=insight_in.confidence,
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)
    return insight


@router.get(
    "/projects/{project_id}/insights",
    response_model=List[InsightResponse],
)
def list_project_insights(
    project_id: UUID,
    type: Optional[str] = Query(
        None,
        description="Filter by insight type: gap, innovation, contradiction, opportunity, trend, future_scope"
    ),
    db: Session = Depends(get_db),
):
    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    stmt = select(ResearchInsight).where(ResearchInsight.project_id == project_id)

    if type:
        try:
            insight_type_enum = ModelInsightType(type)
            stmt = stmt.where(ResearchInsight.type == insight_type_enum)
        except ValueError:
            pass  # Unknown type string: return all insights

    stmt = stmt.order_by(desc(ResearchInsight.created_at))
    insights = db.scalars(stmt).all()
    return insights
