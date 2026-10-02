from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from app.database.session import get_db
from app.models.research_project import ResearchProject
from app.models.project_paper import ProjectPaper
from app.models.paper import Paper
from app.models.paper_relationship import PaperRelationship
from app.schemas.research_map import ResearchMapResponse, MapNode, MapEdge, MapStats

router = APIRouter(prefix="", tags=["research-map"])


@router.get(
    "/projects/{project_id}/research-map",
    response_model=ResearchMapResponse,
)
def get_research_map(project_id: UUID, db: Session = Depends(get_db)):
    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    # 1. Get project papers
    stmt_pp = select(ProjectPaper).where(ProjectPaper.project_id == project_id)
    project_papers = db.scalars(stmt_pp).all()

    paper_ids = [pp.paper_id for pp in project_papers]

    if not paper_ids:
        return ResearchMapResponse(
            project_id=str(project_id),
            nodes=[],
            edges=[],
            stats=MapStats(papers=0, relationships=0),
        )

    # 2. Fetch Paper details for nodes
    stmt_papers = select(Paper).where(Paper.id.in_(paper_ids))
    papers = db.scalars(stmt_papers).all()

    nodes = []
    for paper in papers:
        nodes.append(
            MapNode(
                id=str(paper.id),
                label=paper.title,
                year=paper.publication_year,
                paper_id=str(paper.id),
                type="paper",
            )
        )

    # 3. Query relationships where BOTH source and target papers belong to THIS project
    stmt_rel = select(PaperRelationship).where(
        and_(
            PaperRelationship.source_paper_id.in_(paper_ids),
            PaperRelationship.target_paper_id.in_(paper_ids),
        )
    )
    relationships = db.scalars(stmt_rel).all()

    edges = []
    for rel in relationships:
        rel_type_str = (
            rel.relationship_type.value
            if hasattr(rel.relationship_type, "value")
            else str(rel.relationship_type)
        )
        edges.append(
            MapEdge(
                id=str(rel.id),
                source=str(rel.source_paper_id),
                target=str(rel.target_paper_id),
                relationship_type=rel_type_str,
                strength=float(rel.strength),
                explanation=rel.explanation,
            )
        )

    return ResearchMapResponse(
        project_id=str(project_id),
        nodes=nodes,
        edges=edges,
        stats=MapStats(papers=len(nodes), relationships=len(edges)),
    )
