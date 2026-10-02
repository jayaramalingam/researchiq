import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_1_create_project():
    response = client.post(
        "/api/projects",
        json={
            "title": "Vision-Based Industrial Waste Sorting",
            "research_question": "How effectively can computer vision classify recyclable waste?",
            "description": "MVP study on CV waste sorting.",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["title"] == "Vision-Based Industrial Waste Sorting"
    assert data["status"] == "active"


def test_2_get_projects():
    response = client.get("/api/projects")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_3_get_project_by_id():
    # Create project first
    create_res = client.post(
        "/api/projects",
        json={"title": "Get By ID Test Project"},
    )
    project_id = create_res.json()["id"]

    response = client.get(f"/api/projects/{project_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == project_id
    assert data["title"] == "Get By ID Test Project"


def test_4_create_paper():
    import uuid
    unique_doi = f"10.1000/pytest.paper.{uuid.uuid4()}"
    response = client.post(
        "/api/papers",
        json={
            "title": "Novel Edge AI Architecture for Sorting",
            "abstract": "An edge AI framework for recycling.",
            "publication_year": 2025,
            "doi": unique_doi,
            "citation_count": 5,
            "venue": "IEEE AI",
            "is_open_access": True,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["title"] == "Novel Edge AI Architecture for Sorting"
    assert data["publication_year"] == 2025


def test_5_attach_paper_to_project():
    p_res = client.post("/api/projects", json={"title": "Attach Paper Project"})
    project_id = p_res.json()["id"]

    paper_res = client.post(
        "/api/papers", json={"title": "Paper to attach to project"}
    )
    paper_id = paper_res.json()["id"]

    attach_res = client.post(
        f"/api/projects/{project_id}/papers/{paper_id}",
        json={"relevance_score": 88.0, "rank": 1, "selected": True},
    )
    assert attach_res.status_code == 201
    data = attach_res.json()
    assert data["project_id"] == project_id
    assert data["paper_id"] == paper_id
    assert data["relevance_score"] == 88.0
    assert data["selected"] is True
    assert data["paper"]["title"] == "Paper to attach to project"


def test_6_get_project_papers():
    p_res = client.post("/api/projects", json={"title": "List Papers Project"})
    project_id = p_res.json()["id"]

    paper1_res = client.post("/api/papers", json={"title": "Project Paper One"})
    paper1_id = paper1_res.json()["id"]

    paper2_res = client.post("/api/papers", json={"title": "Project Paper Two"})
    paper2_id = paper2_res.json()["id"]

    client.post(f"/api/projects/{project_id}/papers/{paper1_id}")
    client.post(f"/api/projects/{project_id}/papers/{paper2_id}")

    res = client.get(f"/api/projects/{project_id}/papers")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 2
    titles = [item["paper"]["title"] for item in data]
    assert "Project Paper One" in titles
    assert "Project Paper Two" in titles


def test_7_duplicate_project_paper_returns_409():
    p_res = client.post("/api/projects", json={"title": "Duplicate Check Project"})
    project_id = p_res.json()["id"]

    paper_res = client.post("/api/papers", json={"title": "Unique Paper"})
    paper_id = paper_res.json()["id"]

    res1 = client.post(f"/api/projects/{project_id}/papers/{paper_id}")
    assert res1.status_code == 201

    res2 = client.post(f"/api/projects/{project_id}/papers/{paper_id}")
    assert res2.status_code == 409


def test_8_research_map_endpoint():
    p_res = client.post("/api/projects", json={"title": "Research Map Project"})
    project_id = p_res.json()["id"]

    demo_res = client.post(f"/api/projects/{project_id}/demo-data")
    assert demo_res.status_code == 201

    map_res = client.get(f"/api/projects/{project_id}/research-map")
    assert map_res.status_code == 200
    data = map_res.json()
    assert data["project_id"] == project_id
    assert len(data["nodes"]) == 5
    assert len(data["edges"]) == 5
    assert data["stats"]["papers"] == 5
    assert data["stats"]["relationships"] == 5


def test_9_research_map_excludes_outside_relationships():
    # Project A
    pA_res = client.post("/api/projects", json={"title": "Project A"})
    projectA_id = pA_res.json()["id"]

    # Project B
    pB_res = client.post("/api/projects", json={"title": "Project B"})
    projectB_id = pB_res.json()["id"]

    # Papers in Project A
    paperA1_res = client.post("/api/papers", json={"title": "Paper A1"})
    paperA1_id = paperA1_res.json()["id"]

    paperA2_res = client.post("/api/papers", json={"title": "Paper A2"})
    paperA2_id = paperA2_res.json()["id"]

    # Paper in Project B only
    paperB1_res = client.post("/api/papers", json={"title": "Paper B1"})
    paperB1_id = paperB1_res.json()["id"]

    # Attach A1, A2 to Project A
    client.post(f"/api/projects/{projectA_id}/papers/{paperA1_id}")
    client.post(f"/api/projects/{projectA_id}/papers/{paperA2_id}")

    # Attach B1 to Project B
    client.post(f"/api/projects/{projectB_id}/papers/{paperB1_id}")

    # Seed relationships: A1 -> A2 (inside Project A), A1 -> B1 (across Project A & B)
    # Using demo-data or manual relationship addition via DB session if needed.
    from app.database.session import SessionLocal
    from app.models.paper_relationship import PaperRelationship, RelationshipType
    from uuid import UUID

    db = SessionLocal()
    try:
        rel_inside = PaperRelationship(
            source_paper_id=UUID(paperA1_id),
            target_paper_id=UUID(paperA2_id),
            relationship_type=RelationshipType.extends,
            strength=0.9,
            explanation="Inside Project A",
        )
        rel_outside = PaperRelationship(
            source_paper_id=UUID(paperA1_id),
            target_paper_id=UUID(paperB1_id),
            relationship_type=RelationshipType.similar,
            strength=0.5,
            explanation="Across projects",
        )
        db.add_all([rel_inside, rel_outside])
        db.commit()
    finally:
        db.close()

    map_res = client.get(f"/api/projects/{projectA_id}/research-map")
    assert map_res.status_code == 200
    data = map_res.json()

    node_paper_ids = [n["paper_id"] for n in data["nodes"]]
    assert paperA1_id in node_paper_ids
    assert paperA2_id in node_paper_ids
    assert paperB1_id not in node_paper_ids

    # Edges should only contain rel_inside (between A1 and A2)
    edge_sources_targets = [(e["source"], e["target"]) for e in data["edges"]]
    assert (paperA1_id, paperA2_id) in edge_sources_targets
    assert (paperA1_id, paperB1_id) not in edge_sources_targets


def test_10_missing_project_returns_404():
    dummy_uuid = "00000000-0000-0000-0000-000000000000"
    res = client.get(f"/api/projects/{dummy_uuid}")
    assert res.status_code == 404

    res_map = client.get(f"/api/projects/{dummy_uuid}/research-map")
    assert res_map.status_code == 404

    res_demo = client.post(f"/api/projects/{dummy_uuid}/demo-data")
    assert res_demo.status_code == 404


def test_11_demo_data_creates_deterministic_graph_data():
    p_res = client.post("/api/projects", json={"title": "Deterministic Demo Project"})
    project_id = p_res.json()["id"]

    demo_res = client.post(f"/api/projects/{project_id}/demo-data")
    assert demo_res.status_code == 201

    map_res = client.get(f"/api/projects/{project_id}/research-map")
    assert map_res.status_code == 200
    data = map_res.json()

    labels = [n["label"] for n in data["nodes"]]
    assert "Computer Vision for Waste Classification" in labels
    assert "Transformer-Based Waste Sorting" in labels
    assert "Edge AI for Industrial Waste Detection" in labels
    assert "Lightweight Object Detection for Recycling" in labels
    assert "Self-Supervised Learning for Waste Recognition" in labels


def test_12_demo_data_called_twice_does_not_duplicate_records():
    p_res = client.post("/api/projects", json={"title": "Idempotent Demo Project"})
    project_id = p_res.json()["id"]

    res1 = client.post(f"/api/projects/{project_id}/demo-data")
    assert res1.status_code == 201

    res2 = client.post(f"/api/projects/{project_id}/demo-data")
    assert res2.status_code == 201

    map_res = client.get(f"/api/projects/{project_id}/research-map")
    assert map_res.status_code == 200
    data = map_res.json()

    assert len(data["nodes"]) == 5
    assert len(data["edges"]) == 5
