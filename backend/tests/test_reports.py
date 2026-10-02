"""
Tests for Research Report Generation API.

Tests:
  - 404 for missing project report requests
  - empty project report generation
  - populated project report generation
  - report retrieval list
  - get report by ID
  - report content contains papers, analyses, relationships, insights, and evidence
"""
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def _create_project(title: str) -> str:
    res = client.post("/api/projects", json={"title": title})
    assert res.status_code == 201
    return res.json()["id"]


def _seed_demo(project_id: str):
    res = client.post(f"/api/projects/{project_id}/demo-data")
    assert res.status_code == 201
    return res.json()


# ─── Missing Project 404s ─────────────────────────────────────────────────────

def test_generate_report_project_not_found():
    bad_id = uuid.uuid4()
    res = client.post(f"/api/projects/{bad_id}/reports")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_list_reports_project_not_found():
    bad_id = uuid.uuid4()
    res = client.get(f"/api/projects/{bad_id}/reports")
    assert res.status_code == 404


def test_get_report_not_found():
    bad_id = uuid.uuid4()
    res = client.get(f"/api/reports/{bad_id}")
    assert res.status_code == 404


# ─── Empty Project Report ─────────────────────────────────────────────────────

def test_generate_report_empty_project():
    proj_id = _create_project("Empty Project for Report")

    res = client.post(
        f"/api/projects/{proj_id}/reports",
        json={"title": "Empty Project Test Dossier"},
    )
    assert res.status_code == 201
    data = res.json()

    assert data["project_id"] == proj_id
    assert data["title"] == "Empty Project Test Dossier"
    assert "content" in data
    assert "No papers attached" in data["content"] or "0" in data["content"]


# ─── Populated Project Report ─────────────────────────────────────────────────

def test_generate_report_populated_project():
    proj_id = _create_project("Populated Report Project")
    _seed_demo(proj_id)

    res = client.post(
        f"/api/projects/{proj_id}/reports",
        json={
            "title": "Comprehensive Waste Sorting Synthesis",
            "citation_style": "IEEE",
            "format": "markdown",
        },
    )
    assert res.status_code == 201
    report_data = res.json()

    report_id = report_data["id"]
    assert report_data["project_id"] == proj_id
    assert report_data["title"] == "Comprehensive Waste Sorting Synthesis"
    content = report_data["content"]

    # Verify structured sections exist in report content
    assert "1. Executive Research Overview" in content
    assert "2. Literature Corpus Overview" in content
    assert "3. Paper Analysis & Technical Extraction" in content
    assert "4. Citation Graph & Cross-Paper Relationships" in content
    assert "5. Identified Research Gaps & Strategic Signals" in content
    assert "6. Provenance & Source Verification Index" in content
    assert "7. Factual Conclusion & Synthesis" in content

    # Verify real content elements are present
    assert "Computer Vision for Waste Classification" in content
    assert "IEEE Transactions" in content
    assert "Semantic Scholar" in content

    # Test listing project reports
    list_res = client.get(f"/api/projects/{proj_id}/reports")
    assert list_res.status_code == 200
    reports_list = list_res.json()
    assert len(reports_list) >= 1
    assert any(r["id"] == report_id for r in reports_list)

    # Test getting report by ID
    get_res = client.get(f"/api/reports/{report_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == report_id
    assert get_res.json()["title"] == "Comprehensive Waste Sorting Synthesis"
