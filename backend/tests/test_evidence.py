"""
Tests for Evidence & Provenance API endpoints.

Tests:
  - 404 for missing project evidence request
  - empty project evidence baseline
  - populated project evidence with source provenance items
  - 404 for missing paper sources request
  - paper source retrieval
  - paper source creation & deduplication
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


# ─── Missing project / paper 404s ─────────────────────────────────────────────

def test_get_project_evidence_404():
    bad_id = uuid.uuid4()
    res = client.get(f"/api/projects/{bad_id}/evidence")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_get_paper_sources_404():
    bad_id = uuid.uuid4()
    res = client.get(f"/api/papers/{bad_id}/sources")
    assert res.status_code == 404


def test_create_paper_source_paper_not_found():
    bad_id = uuid.uuid4()
    res = client.post(
        f"/api/papers/{bad_id}/sources",
        json={
            "source_name": "arXiv",
            "source_identifier": "2401.12345",
            "source_url": "https://arxiv.org/abs/2401.12345",
        },
    )
    assert res.status_code == 404


# ─── Project Evidence Baseline & Populated ───────────────────────────────────

def test_get_project_evidence_empty():
    proj_id = _create_project("Empty Evidence Project")
    res = client.get(f"/api/projects/{proj_id}/evidence")
    assert res.status_code == 200
    data = res.json()

    assert data["project_id"] == proj_id
    assert data["total_evidence_items"] == 0
    assert data["items"] == []


def test_get_project_evidence_populated():
    proj_id = _create_project("Populated Evidence Project")
    _seed_demo(proj_id)

    res = client.get(f"/api/projects/{proj_id}/evidence")
    assert res.status_code == 200
    data = res.json()

    assert data["project_id"] == proj_id
    assert data["total_evidence_items"] >= 5  # contains analyses + insights
    assert isinstance(data["items"], list)

    item = data["items"][0]
    assert "id" in item
    assert "type" in item
    assert "quote_or_text" in item
    assert "confidence" in item
    assert "sources" in item
    assert len(item["sources"]) >= 1  # seeded PaperSource is attached!


# ─── Paper Sources CRUD ───────────────────────────────────────────────────────

def test_paper_sources_get_and_create():
    proj_id = _create_project("Paper Sources Test Project")
    _seed_demo(proj_id)

    # Fetch papers for the project
    papers_res = client.get(f"/api/projects/{proj_id}/papers")
    assert papers_res.status_code == 200
    papers = papers_res.json()
    assert len(papers) > 0

    paper_id = papers[0]["paper_id"]

    # 1. Get initial sources
    get_res = client.get(f"/api/papers/{paper_id}/sources")
    assert get_res.status_code == 200
    sources = get_res.json()
    initial_count = len(sources)

    # 2. Add a new source record (e.g. Crossref)
    new_source = {
        "source_name": "Crossref",
        "source_identifier": f"10.1016/j.resconrec.2024.{uuid.uuid4().hex[:6]}",
        "source_url": "https://doi.org/10.1016/j.resconrec.2024.100",
    }
    create_res = client.post(f"/api/papers/{paper_id}/sources", json=new_source)
    assert create_res.status_code == 201
    created_data = create_res.json()

    assert created_data["paper_id"] == paper_id
    assert created_data["source_name"] == "Crossref"
    assert created_data["source_identifier"] == new_source["source_identifier"]

    # 3. Verify it appears in get_paper_sources
    verify_res = client.get(f"/api/papers/{paper_id}/sources")
    assert verify_res.status_code == 200
    updated_sources = verify_res.json()
    assert len(updated_sources) == initial_count + 1


def test_create_paper_source_deduplicates():
    proj_id = _create_project("Source Dedup Project")
    _seed_demo(proj_id)

    papers_res = client.get(f"/api/projects/{proj_id}/papers")
    paper_id = papers_res.json()[0]["paper_id"]

    source_payload = {
        "source_name": "arXiv",
        "source_identifier": "2401.99999",
        "source_url": "https://arxiv.org/abs/2401.99999",
    }

    # First add
    res1 = client.post(f"/api/papers/{paper_id}/sources", json=source_payload)
    assert res1.status_code == 201
    id1 = res1.json()["id"]

    # Duplicate add — should return existing source
    res2 = client.post(f"/api/papers/{paper_id}/sources", json=source_payload)
    assert res2.status_code == 200 or res2.status_code == 201
    id2 = res2.json()["id"]

    assert id1 == id2
