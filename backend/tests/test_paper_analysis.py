import json
import uuid
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.ai_service import ai_service


client = TestClient(app)


@pytest.fixture(autouse=True)
def mock_ai_service_chat():
    def mock_chat(system_prompt: str, user_prompt: str, model=None) -> str:
        if "waste sorting" in user_prompt.lower():
            summary = "This paper studies computer vision for waste sorting."
            problem = "Manual waste classification is slow."
        else:
            summary = "Test summary"
            problem = "Test problem"

        return json.dumps({
            "summary": summary,
            "research_problem": problem,
            "methodology": "Deep learning image classification.",
            "dataset": "Industrial waste image dataset.",
            "results": "Improved classification accuracy.",
            "limitations": "Limited dataset diversity.",
            "contribution": "A lightweight classification approach.",
            "future_work": "Expand the dataset and test on edge devices.",
            "research_area": "Computer Vision",
            "keywords": ["waste", "sorting"],
            "research_gap": "Lacks real-world validation",
            "confidence": 0.90,
        })
    with patch.object(ai_service, "_chat", side_effect=mock_chat):
        yield


def create_test_paper(abstract="A test paper for paper intelligence."):
    response = client.post(
        "/api/papers",
        json={
            "title": f"Paper Analysis Test {uuid.uuid4()}",
            "abstract": abstract,
            "publication_year": 2025,
        },
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_create_paper_analysis():
    paper_id = create_test_paper(abstract="This paper studies computer vision for waste sorting.")

    response = client.post(
        f"/api/papers/{paper_id}/analysis",
        json={
            "summary": "This paper studies computer vision for waste sorting.",
            "problem": "Manual waste classification is slow.",
            "methodology": "Deep learning image classification.",
            "dataset": "Industrial waste image dataset.",
            "results": "Improved classification accuracy.",
            "limitations": "Limited dataset diversity.",
            "contribution": "A lightweight classification approach.",
            "future_work": "Expand the dataset and test on edge devices.",
            "ai_model": "manual-mvp",
            "confidence": 0.90,
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert data["paper_id"] == paper_id
    assert data["summary"].startswith("This paper studies")
    assert data["methodology"] == "Deep learning image classification."
    assert data["confidence"] == 0.90
    assert "id" in data
    assert "analyzed_at" in data


def test_get_paper_analysis():
    paper_id = create_test_paper()

    create_response = client.post(
        f"/api/papers/{paper_id}/analysis",
        json={
            "summary": "Test summary",
            "problem": "Test problem",
        },
    )

    assert create_response.status_code == 201

    response = client.get(f"/api/papers/{paper_id}/analysis")

    assert response.status_code == 200

    data = response.json()

    assert data["paper_id"] == paper_id
    assert data["summary"] == "Test summary"
    assert data["problem"] == "Test problem"


def test_update_paper_analysis():
    paper_id = create_test_paper()

    create_response = client.post(
        f"/api/papers/{paper_id}/analysis",
        json={
            "summary": "Original summary",
            "results": "Original results",
        },
    )

    assert create_response.status_code == 201

    response = client.put(
        f"/api/papers/{paper_id}/analysis",
        json={
            "summary": "Updated summary",
            "results": "Updated results",
            "confidence": 0.95,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["summary"] == "Updated summary"
    assert data["results"] == "Updated results"
    assert data["confidence"] == 0.95


def test_duplicate_paper_analysis_returns_409():
    paper_id = create_test_paper()

    payload = {
        "summary": "First analysis",
    }

    first = client.post(
        f"/api/papers/{paper_id}/analysis",
        json=payload,
    )

    assert first.status_code == 201

    second = client.post(
        f"/api/papers/{paper_id}/analysis",
        json=payload,
    )

    assert second.status_code == 409


def test_missing_paper_analysis_returns_404():
    fake_paper_id = str(uuid.uuid4())

    response = client.post(
        f"/api/papers/{fake_paper_id}/analysis",
        json={
            "summary": "This should fail",
        },
    )

    assert response.status_code == 404


def test_get_missing_analysis_returns_404():
    paper_id = create_test_paper()

    response = client.get(
        f"/api/papers/{paper_id}/analysis"
    )

    assert response.status_code == 404


def test_confidence_must_be_between_zero_and_one():
    paper_id = create_test_paper()

    response = client.post(
        f"/api/papers/{paper_id}/analysis",
        json={
            "summary": "Invalid confidence test",
            "confidence": 1.5,
        },
    )

    assert response.status_code == 422
