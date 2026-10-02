from fastapi import APIRouter
from app.api.routes import (
    paper_analysis,
    projects,
    papers,
    research_map,
    insights,
    dashboard,
    search,
    evidence,
    reports,
    ai_synthesis,
)

api_router = APIRouter()

api_router.include_router(projects.router)
api_router.include_router(papers.router)
api_router.include_router(paper_analysis.router)
api_router.include_router(research_map.router)
api_router.include_router(insights.router)
api_router.include_router(dashboard.router)
api_router.include_router(search.router)
api_router.include_router(evidence.router)
api_router.include_router(reports.router)
api_router.include_router(ai_synthesis.router)
