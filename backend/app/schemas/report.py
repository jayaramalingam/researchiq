from datetime import datetime
from typing import Optional, Any, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from app.models.report import ReportFormat


class ReportCreate(BaseModel):
    title: Optional[str] = None
    citation_style: Optional[str] = "IEEE"
    format: ReportFormat = ReportFormat.markdown


class ReportResponse(BaseModel):
    id: UUID
    project_id: UUID
    title: str
    content: str
    citation_style: Optional[str] = None
    format: ReportFormat
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
