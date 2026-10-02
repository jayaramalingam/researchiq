from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class MapNode(BaseModel):
    id: str
    label: str
    year: Optional[int] = None
    paper_id: str
    type: str = "paper"

    model_config = ConfigDict(from_attributes=True)


class MapEdge(BaseModel):
    id: str
    source: str
    target: str
    relationship_type: str
    strength: float
    explanation: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MapStats(BaseModel):
    papers: int
    relationships: int


class ResearchMapResponse(BaseModel):
    project_id: str
    nodes: List[MapNode]
    edges: List[MapEdge]
    stats: MapStats

    model_config = ConfigDict(from_attributes=True)
