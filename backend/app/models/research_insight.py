import uuid
import enum
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, Enum, Float, ForeignKey, String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from .research_project import ResearchProject

class InsightType(str, enum.Enum):
    similarity = "similarity"
    difference = "difference"
    trend = "trend"
    gap = "gap"
    innovation = "innovation"
    contradiction = "contradiction"
    opportunity = "opportunity"
    future_scope = "future_scope"

class ResearchInsight(Base):
    __tablename__ = "research_insights"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[InsightType] = mapped_column(Enum(InsightType), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    evidence: Mapped[str | None] = mapped_column(Text, nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationship back to ResearchProject
    project: Mapped["ResearchProject"] = relationship(
        "ResearchProject", back_populates="insights"
    )
