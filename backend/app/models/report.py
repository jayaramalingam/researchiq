import uuid
import enum
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, Enum, String, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from .research_project import ResearchProject

class ReportFormat(str, enum.Enum):
    pdf = "pdf"
    markdown = "markdown"
    html = "html"

class Report(Base):
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("research_projects.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    citation_style: Mapped[str | None] = mapped_column(String(100), nullable=True)
    format: Mapped[ReportFormat] = mapped_column(Enum(ReportFormat), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    # Relationship back to ResearchProject
    project: Mapped["ResearchProject"] = relationship(
        "ResearchProject", back_populates="reports"
    )
