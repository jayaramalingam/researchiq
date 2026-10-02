import uuid
import enum
from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import Column, Enum, Float, ForeignKey, String, Text, DateTime, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from .paper import Paper

class RelationshipType(str, enum.Enum):
    similar = "similar"
    extends = "extends"
    contradicts = "contradicts"
    uses = "uses"
    improves = "improves"
    related = "related"

class PaperRelationship(Base):
    __tablename__ = "paper_relationships"
    __table_args__ = (
        UniqueConstraint("source_paper_id", "target_paper_id", "relationship_type", name="uq_paper_relationship"),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    source_paper_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("papers.id", ondelete="CASCADE"), nullable=False
    )
    target_paper_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("papers.id", ondelete="CASCADE"), nullable=False
    )
    relationship_type: Mapped[RelationshipType] = mapped_column(Enum(RelationshipType), nullable=False)
    strength: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships back to Paper
    source_paper: Mapped["Paper"] = relationship(
        "Paper",
        foreign_keys=[source_paper_id],
        back_populates="relationships_as_source",
    )
    target_paper: Mapped["Paper"] = relationship(
        "Paper",
        foreign_keys=[target_paper_id],
        back_populates="relationships_as_target",
    )
