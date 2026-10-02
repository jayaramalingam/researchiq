import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_insights_empty_project():
    p_res = client.post("/api/projects", json={"title": "Empty Insights Project"})
    assert p_res.status_code == 201
    project_id = p_res.json()["id"]

    res = client.get(f"/api/projects/{project_id}/insights")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_create_and_get_project_insight():
    p_res = client.post("/api/projects", json={"title": "Create Insight Project"})
    assert p_res.status_code == 201
    project_id = p_res.json()["id"]

    insight_payload = {
        "type": "gap",
        "title": "Severe Optical Occlusion in Conveyor Belts",
        "description": "Materials overlapping at high speeds reduce classification confidence by 30%.",
        "evidence": "Extracted from paper limitation sections.",
        "confidence": 0.94,
    }

    create_res = client.post(
        f"/api/projects/{project_id}/insights",
        json=insight_payload,
    )
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert "id" in created_data
    assert created_data["project_id"] == project_id
    assert created_data["title"] == insight_payload["title"]
    assert created_data["type"] == "gap"
    assert created_data["confidence"] == 0.94

    # List insights
    list_res = client.get(f"/api/projects/{project_id}/insights")
    assert list_res.status_code == 200
    insights_list = list_res.json()
    assert len(insights_list) == 1
    assert insights_list[0]["title"] == insight_payload["title"]


def test_insights_missing_project_returns_404():
    dummy_uuid = "00000000-0000-0000-0000-000000000000"
    res_get = client.get(f"/api/projects/{dummy_uuid}/insights")
    assert res_get.status_code == 404

    res_post = client.post(
        f"/api/projects/{dummy_uuid}/insights",
        json={"title": "Test Insight", "type": "gap"},
    )
    assert res_post.status_code == 404


def test_demo_data_seeds_insights_and_is_idempotent():
    p_res = client.post("/api/projects", json={"title": "Demo Insights Project"})
    assert p_res.status_code == 201
    project_id = p_res.json()["id"]

    # Seed demo data 1st time
    demo_res1 = client.post(f"/api/projects/{project_id}/demo-data")
    assert demo_res1.status_code == 201

    insights_res1 = client.get(f"/api/projects/{project_id}/insights")
    assert insights_res1.status_code == 200
    insights1 = insights_res1.json()
    assert len(insights1) >= 5

    titles1 = [i["title"] for i in insights1]
    assert any("Limited Fine-Grained Material Distinctions" in t for t in titles1)

    # Seed demo data 2nd time (should not duplicate)
    demo_res2 = client.post(f"/api/projects/{project_id}/demo-data")
    assert demo_res2.status_code == 201

    insights_res2 = client.get(f"/api/projects/{project_id}/insights")
    assert insights_res2.status_code == 200
    insights2 = insights_res2.json()
    assert len(insights2) == len(insights1)
