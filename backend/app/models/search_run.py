import uuid
import enum
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Text, Integer, Enum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from .research_project import ResearchProject

class SearchStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class SearchRun(Base):
    __tablename__ = "search_runs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("research_projects.id", ondelete="CASCADE"), 
        nullable=False
    )
    query: Mapped[str] = mapped_column(Text, nullable=False)
    papers_discovered: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    papers_deduplicated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    papers_selected: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[SearchStatus] = mapped_column(
        Enum(SearchStatus, native_enum=False), 
        default=SearchStatus.PENDING,
        nullable=False
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), 
        nullable=True
    )

    # Relationships
    project: Mapped["ResearchProject"] = relationship(back_populates="search_runs")
