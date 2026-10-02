from datetime import datetime
from typing import Optional
from uuid import UUID
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field


class InsightType(str, Enum):
    similarity = "similarity"
    difference = "difference"
    trend = "trend"
    gap = "gap"
    innovation = "innovation"
    contradiction = "contradiction"
    opportunity = "opportunity"
    future_scope = "future_scope"


class InsightCreate(BaseModel):
    type: InsightType = Field(default=InsightType.gap, description="Type of research insight or gap")
    title: str = Field(..., min_length=1, description="Title of the insight or gap")
    description: Optional[str] = Field(None, description="Detailed description of the insight")
    evidence: Optional[str] = Field(None, description="Supporting evidence or paper context")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Confidence score between 0.0 and 1.0")


class InsightResponse(BaseModel):
    id: UUID
    project_id: UUID
    type: InsightType
    title: str
    description: Optional[str] = None
    evidence: Optional[str] = None
    confidence: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
