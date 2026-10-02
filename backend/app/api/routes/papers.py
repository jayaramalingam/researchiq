from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.database.session import get_db
from app.models.paper import Paper
from app.schemas.paper import PaperCreate, PaperResponse

router = APIRouter(prefix="/papers", tags=["papers"])


@router.post("", response_model=PaperResponse, status_code=status.HTTP_201_CREATED)
def create_paper(paper_in: PaperCreate, db: Session = Depends(get_db)):
    paper = Paper(
        title=paper_in.title,
        abstract=paper_in.abstract,
        authors=paper_in.authors,
        publication_year=paper_in.publication_year,
        doi=paper_in.doi,
        url=paper_in.url,
        pdf_url=paper_in.pdf_url,
        source=paper_in.source,
        citation_count=paper_in.citation_count,
        venue=paper_in.venue,
        is_open_access=paper_in.is_open_access,
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return paper


@router.get("", response_model=List[PaperResponse])
def list_papers(db: Session = Depends(get_db)):
    stmt = select(Paper).order_by(desc(Paper.created_at))
    papers = db.scalars(stmt).all()
    return papers


@router.get("/{paper_id}", response_model=PaperResponse)
def get_paper(paper_id: UUID, db: Session = Depends(get_db)):
    paper = db.get(Paper, paper_id)
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Paper {paper_id} not found",
        )
    return paper
