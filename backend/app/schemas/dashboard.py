from typing import Dict, List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ProjectSummary(BaseModel):
    id: UUID
    title: str
    research_question: Optional[str] = None
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    papers_count: int
    insights_count: int
    relationships_count: int


class PaperAnalysisOverview(BaseModel):
    total_papers: int
    analyzed_papers: int
    unanalyzed_papers: int
    coverage_percentage: float


class InsightsOverview(BaseModel):
    total_insights: int
    gaps_count: int
    innovations_count: int
    contradictions_count: int
    opportunities_count: int
    by_type: Dict[str, int]


class RelationshipOverview(BaseModel):
    total_relationships: int
    by_type: Dict[str, int]
    average_strength: float


class GlobalOverview(BaseModel):
    total_projects: int
    total_papers: int
    total_analyses: int
    total_insights: int
    total_relationships: int


class DashboardResponse(BaseModel):
    project_id: UUID
    project_summary: ProjectSummary
    global_overview: GlobalOverview
    paper_analysis: PaperAnalysisOverview
    insights: InsightsOverview
    relationships: RelationshipOverview

    model_config = ConfigDict(from_attributes=True)
