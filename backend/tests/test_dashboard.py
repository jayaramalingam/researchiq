import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_dashboard_404_not_found():
    random_id = uuid.uuid4()
    response = client.get(f"/api/projects/{random_id}/dashboard")
    assert response.status_code == 404
    assert f"Project {random_id} not found" in response.json()["detail"]


def test_dashboard_empty_project():
    p_res = client.post("/api/projects", json={"title": "Empty Dashboard Test Project"})
    assert p_res.status_code == 201
    project_id = p_res.json()["id"]

    response = client.get(f"/api/projects/{project_id}/dashboard")
    assert response.status_code == 200
    data = response.json()

    assert data["project_id"] == project_id
    assert data["project_summary"]["title"] == "Empty Dashboard Test Project"
    assert data["project_summary"]["papers_count"] == 0
    assert data["project_summary"]["insights_count"] == 0
    assert data["project_summary"]["relationships_count"] == 0

    assert data["paper_analysis"]["total_papers"] == 0
    assert data["paper_analysis"]["analyzed_papers"] == 0
    assert data["paper_analysis"]["unanalyzed_papers"] == 0
    assert data["paper_analysis"]["coverage_percentage"] == 0.0

    assert data["insights"]["total_insights"] == 0
    assert data["insights"]["gaps_count"] == 0
    assert data["insights"]["innovations_count"] == 0

    assert data["relationships"]["total_relationships"] == 0
    assert data["relationships"]["average_strength"] == 0.0

    assert data["global_overview"]["total_projects"] >= 1


def test_dashboard_populated_project_via_demo_seed():
    p_res = client.post("/api/projects", json={"title": "Demo Seeding Dashboard Project"})
    assert p_res.status_code == 201
    project_id = p_res.json()["id"]

    # Seed demo data (seeds papers, relationships, insights, analyses)
    seed_res = client.post(f"/api/projects/{project_id}/demo-data")
    assert seed_res.status_code == 201

    # Query dashboard
    response = client.get(f"/api/projects/{project_id}/dashboard")
    assert response.status_code == 200
    data = response.json()

    assert data["project_id"] == project_id
    assert data["project_summary"]["papers_count"] == 5
    assert data["project_summary"]["insights_count"] == 5
    assert data["project_summary"]["relationships_count"] == 5

    # Check paper analysis stats
    assert data["paper_analysis"]["total_papers"] == 5
    assert data["paper_analysis"]["analyzed_papers"] == 5
    assert data["paper_analysis"]["unanalyzed_papers"] == 0
    assert data["paper_analysis"]["coverage_percentage"] == 100.0

    # Check insights stats
    assert data["insights"]["total_insights"] == 5
    assert data["insights"]["gaps_count"] == 2
    assert data["insights"]["innovations_count"] == 1
    assert data["insights"]["contradictions_count"] == 1
    assert data["insights"]["opportunities_count"] == 1
    assert data["insights"]["by_type"]["gap"] == 2

    # Check relationships stats
    assert data["relationships"]["total_relationships"] == 5
    assert data["relationships"]["average_strength"] > 0
    assert "extends" in data["relationships"]["by_type"]
    assert "similar" in data["relationships"]["by_type"]
