import uuid
import enum
from datetime import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Text, Enum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from .research_query import ResearchQuery
    from .search_run import SearchRun
    from .project_paper import ProjectPaper
    from .research_insight import ResearchInsight
    from .report import Report

class ProjectStatus(str, enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    COMPLETED = "completed"

class ResearchProject(Base):
    __tablename__ = "research_projects"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    research_question: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ProjectStatus] = mapped_column(
        Enum(ProjectStatus, native_enum=False), 
        default=ProjectStatus.ACTIVE,
        nullable=False
    )
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
    queries: Mapped[List["ResearchQuery"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    search_runs: Mapped[List["SearchRun"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    project_papers: Mapped[List["ProjectPaper"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    insights: Mapped[List["ResearchInsight"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    reports: Mapped[List["Report"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
