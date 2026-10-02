import uuid
from datetime import datetime
from typing import List, Any, TYPE_CHECKING
from sqlalchemy import String, Text, Integer, Boolean, DateTime, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base
# Import PaperRelationship for explicit foreign_keys
from .paper_relationship import PaperRelationship

if TYPE_CHECKING:
    from .project_paper import ProjectPaper
    from .paper_source import PaperSource
    from .paper_analysis import PaperAnalysis

class Paper(Base):
    __tablename__ = "papers"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    abstract: Mapped[str | None] = mapped_column(Text, nullable=True)
    authors: Mapped[Any | None] = mapped_column(JSON, nullable=True) # supports structured list of authors
    publication_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    doi: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    pdf_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    citation_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    venue: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_open_access: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )

    # Relationships
    project_papers: Mapped[List["ProjectPaper"]] = relationship(
        back_populates="paper", cascade="all, delete-orphan"
    )
    sources: Mapped[List["PaperSource"]] = relationship(
        back_populates="paper", cascade="all, delete-orphan"
    )
    analyses: Mapped[List["PaperAnalysis"]] = relationship(
        back_populates="paper", cascade="all, delete-orphan"
    )
    relationships_as_source: Mapped[List["PaperRelationship"]] = relationship(
        foreign_keys=[PaperRelationship.source_paper_id],
        back_populates="source_paper",
        cascade="all, delete-orphan",
    )
    relationships_as_target: Mapped[List["PaperRelationship"]] = relationship(
        foreign_keys=[PaperRelationship.target_paper_id],
        back_populates="target_paper",
        cascade="all, delete-orphan",
    )
