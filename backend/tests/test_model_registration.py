from app.database.base import Base
import app.models

def test_model_registration():
    expected_tables = {
        "research_projects",
        "research_queries",
        "search_runs",
        "papers",
        "paper_sources",
        "project_papers",
        "paper_analyses",
        "paper_relationships",
        "research_insights",
        "reports"
    }
    assert set(Base.metadata.tables.keys()) == expected_tables
