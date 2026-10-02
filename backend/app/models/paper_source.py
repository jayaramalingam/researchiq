import uuid
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, String, DateTime, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from .paper import Paper

class PaperSource(Base):
    __tablename__ = "paper_sources"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    paper_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("papers.id", ondelete="CASCADE"), 
        nullable=False
    )
    source_name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_identifier: Mapped[str] = mapped_column(String(255), nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )

    # Relationships
    paper: Mapped["Paper"] = relationship(back_populates="sources")

    # Constraints
    __table_args__ = (
        UniqueConstraint("source_name", "source_identifier", name="uq_paper_source_name_identifier"),
    )
