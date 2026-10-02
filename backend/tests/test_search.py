"""
Tests for Search & Paper Discovery API.

Tests:
  - search returns all papers when no query
  - search filters by title keyword
  - search marks is_attached correctly
  - empty/short query validation
  - 404 for unknown project
  - add new paper via /search/add
  - duplicate detection by DOI in /search/add
  - 409 when re-attaching an already-attached paper via /search/attach
  - attach existing paper via /search/attach/{paper_id}
"""
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _create_project(title: str) -> str:
    res = client.post("/api/projects", json={"title": title})
    assert res.status_code == 201
    return res.json()["id"]


def _seed_demo(project_id: str):
    res = client.post(f"/api/projects/{project_id}/demo-data")
    assert res.status_code == 201
    return res.json()


# ─── 404 for missing project ──────────────────────────────────────────────────

def test_search_project_not_found():
    bad_id = uuid.uuid4()
    res = client.get(f"/api/projects/{bad_id}/search?q=waste")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_search_add_project_not_found():
    bad_id = uuid.uuid4()
    res = client.post(
        f"/api/projects/{bad_id}/search/add",
        json={"title": "Test Paper"},
    )
    assert res.status_code == 404


def test_search_attach_project_not_found():
    bad_id = uuid.uuid4()
    paper_id = uuid.uuid4()
    res = client.post(f"/api/projects/{bad_id}/search/attach/{paper_id}")
    assert res.status_code == 404


# ─── Query validation ─────────────────────────────────────────────────────────

def test_search_query_too_short_rejected():
    proj_id = _create_project("Short Query Test")
    res = client.get(f"/api/projects/{proj_id}/search?q=a")
    assert res.status_code == 422
    assert "2 characters" in res.json()["detail"]


# ─── Search returning all papers (empty query) ────────────────────────────────

def test_search_empty_query_returns_all_papers():
    proj_id = _create_project("Empty Query Search Project")
    _seed_demo(proj_id)

    res = client.get(f"/api/projects/{proj_id}/search")
    assert res.status_code == 200
    data = res.json()

    assert data["project_id"] == proj_id
    assert data["query"] == ""
    assert data["source"] == "database"
    assert data["total_results"] >= 5  # seeded 5 papers
    assert "note" in data
    assert isinstance(data["results"], list)


# ─── Search by keyword ────────────────────────────────────────────────────────

def test_search_keyword_filters_results():
    proj_id = _create_project("Keyword Search Project")
    _seed_demo(proj_id)

    # "Computer Vision" is in one paper title
    res = client.get(f"/api/projects/{proj_id}/search?q=Computer+Vision")
    assert res.status_code == 200
    data = res.json()
    assert data["total_results"] >= 1
    titles = [r["title"].lower() for r in data["results"]]
    assert any("computer vision" in t or "waste" in t for t in titles)


def test_search_no_match_returns_empty():
    proj_id = _create_project("No Match Search Project")

    res = client.get(f"/api/projects/{proj_id}/search?q=ZZZNONEXISTENTQUERY999")
    assert res.status_code == 200
    data = res.json()
    assert data["total_results"] == 0
    assert data["results"] == []
    assert data["note"] is not None  # should have a helpful message


# ─── Attachment detection ─────────────────────────────────────────────────────

def test_search_marks_attached_papers():
    proj_id = _create_project("Attach Detection Project")
    _seed_demo(proj_id)

    res = client.get(f"/api/projects/{proj_id}/search")
    assert res.status_code == 200
    results = res.json()["results"]

    attached = [r for r in results if r["is_attached"]]
    unattached = [r for r in results if not r["is_attached"]]

    # Seeded 5 papers should be attached
    assert len(attached) >= 5


# ─── Add new paper ────────────────────────────────────────────────────────────

def test_search_add_creates_and_attaches_paper():
    proj_id = _create_project("Add Paper Test Project")
    unique_doi = f"10.9999/search-test-{uuid.uuid4()}"

    payload = {
        "title": "A Novel Approach to Automated Waste Detection",
        "abstract": "This study explores automated waste detection using transformer models.",
        "authors": ["Alice Smith", "Bob Jones"],
        "publication_year": 2024,
        "doi": unique_doi,
        "source": "ResearchIQ Manual",
        "citation_count": 5,
        "venue": "IEEE Transactions",
        "is_open_access": True,
        "relevance_score": 88.5,
    }

    res = client.post(f"/api/projects/{proj_id}/search/add", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["project_id"] == proj_id
    assert data["paper"]["title"] == payload["title"]
    assert data["paper"]["doi"] == unique_doi

    # Now search for it
    search_res = client.get(f"/api/projects/{proj_id}/search?q=Novel+Approach")
    assert search_res.status_code == 200
    found = [r for r in search_res.json()["results"] if r["doi"] == unique_doi]
    assert len(found) == 1
    assert found[0]["is_attached"] is True


def test_search_add_deduplicates_by_doi():
    """
    Adding the same paper (same DOI) to the same project twice
    should succeed on first call, then return 409.
    """
    proj_id = _create_project("DOI Dedup Project")
    unique_doi = f"10.8888/dedup-{uuid.uuid4()}"

    payload = {
        "title": "Dedup Paper",
        "doi": unique_doi,
        "source": "Test",
        "citation_count": 0,
    }

    # First add — should succeed
    res1 = client.post(f"/api/projects/{proj_id}/search/add", json=payload)
    assert res1.status_code == 201

    # Second add — same DOI, same project → 409
    res2 = client.post(f"/api/projects/{proj_id}/search/add", json=payload)
    assert res2.status_code == 409
    assert "already attached" in res2.json()["detail"].lower()


# ─── Attach existing paper ────────────────────────────────────────────────────

def test_search_attach_existing_paper():
    proj_id = _create_project("Attach Existing Paper Project")
    _seed_demo(proj_id)

    # Get a paper that already exists (from global papers list)
    papers_res = client.get("/api/papers")
    assert papers_res.status_code == 200
    all_papers = papers_res.json()
    assert len(all_papers) > 0

    # Find one NOT already in our project
    search_res = client.get(f"/api/projects/{proj_id}/search")
    attached_ids = {r["id"] for r in search_res.json()["results"] if r["is_attached"]}

    unattached = [p for p in all_papers if p["id"] not in attached_ids]
    if not unattached:
        pytest.skip("No unattached papers available to test with")

    paper_id = unattached[0]["id"]
    attach_res = client.post(f"/api/projects/{proj_id}/search/attach/{paper_id}")
    assert attach_res.status_code == 201
    assert attach_res.json()["paper_id"] == paper_id


def test_search_attach_duplicate_returns_409():
    proj_id = _create_project("Duplicate Attach Test Project")
    _seed_demo(proj_id)

    # Get one of the seeded papers
    search_res = client.get(f"/api/projects/{proj_id}/search")
    attached = [r for r in search_res.json()["results"] if r["is_attached"]]
    assert len(attached) > 0

    paper_id = attached[0]["id"]

    # Try to attach it again → 409
    res = client.post(f"/api/projects/{proj_id}/search/attach/{paper_id}")
    assert res.status_code == 409
    assert "already attached" in res.json()["detail"].lower()


def test_search_attach_nonexistent_paper_returns_404():
    proj_id = _create_project("Ghost Paper Project")
    ghost_paper_id = uuid.uuid4()
    res = client.post(f"/api/projects/{proj_id}/search/attach/{ghost_paper_id}")
    assert res.status_code == 404
