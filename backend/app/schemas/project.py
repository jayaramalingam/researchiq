from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=1, description="Title of the research project")
    research_question: Optional[str] = Field(None, description="Primary research question")
    description: Optional[str] = Field(None, description="Detailed description")


class ProjectResponse(BaseModel):
    id: UUID
    title: str
    research_question: Optional[str] = None
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
