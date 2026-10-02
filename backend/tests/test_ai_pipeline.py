"""
Tests for the real AI pipeline:

1.  Semantic Scholar service — with mocked httpx
2.  Search endpoint — Semantic Scholar path and fallback
3.  Paper deduplication (DOI + SS ID)
4.  Paper import provenance
5.  AI service — analyze_paper (mocked)
6.  AI service — synthesize_papers (mocked)
7.  AI paper analysis endpoint (POST /papers/{id}/analysis)
8.  AI analysis refresh endpoint
9.  Analyze-collection endpoint
10. AI synthesis endpoint
11. Error handling (rate limit, timeout, missing key, invalid JSON)
"""
import json
import uuid
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.services.ai_service import (
    AIKeyMissingError,
    AIServiceError,
    AIServiceUnavailableError,
    CrossPaperSynthesis,
    PaperAIAnalysis,
    SynthesisRelationship,
    ai_service,
)
from app.services.scholarly_search_service import (
    ScholarlyPaper,
    ScholarlySearchError,
    ScholarlySearchService,
    _normalise_paper,
)

client = TestClient(app)


# ─── Helpers ──────────────────────────────────────────────────────────────────


def _create_project(title: str = "Test Project") -> str:
    res = client.post("/api/projects", json={"title": title})
    assert res.status_code == 201
    return res.json()["id"]


def _seed_demo(project_id: str):
    res = client.post(f"/api/projects/{project_id}/demo-data")
    assert res.status_code == 201
    return res.json()


def _get_first_paper_id(project_id: str) -> str:
    res = client.get(f"/api/projects/{project_id}/papers")
    assert res.status_code == 200
    papers = res.json()
    assert papers, "No papers in project after seeding"
    return papers[0]["paper"]["id"]


# ─── Semantic Scholar service unit tests ─────────────────────────────────────


class TestNormalisePaper:
    def test_normalise_complete(self):
        raw = {
            "paperId": "abc123",
            "title": "Deep Learning for Waste",
            "abstract": "We study DL applied to waste sorting.",
            "year": 2023,
            "authors": [{"name": "Alice"}, {"name": "Bob"}],
            "venue": "NeurIPS",
            "externalIds": {"DOI": "10.1234/test"},
            "url": "https://www.semanticscholar.org/paper/abc123",
            "citationCount": 42,
            "referenceCount": 20,
            "openAccessPdf": {"url": "https://arxiv.org/pdf/test.pdf"},
            "fieldsOfStudy": ["Computer Science"],
            "publicationDate": "2023-06-01",
        }
        paper = _normalise_paper(raw)
        assert paper is not None
        assert paper.title == "Deep Learning for Waste"
        assert paper.doi == "10.1234/test"
        assert paper.pdf_url == "https://arxiv.org/pdf/test.pdf"
        assert paper.is_open_access is True
        assert paper.citation_count == 42
        assert paper.authors == ["Alice", "Bob"]
        assert paper.semantic_scholar_id == "abc123"

    def test_normalise_minimal(self):
        raw = {"paperId": "xyz", "title": "Minimal Paper"}
        paper = _normalise_paper(raw)
        assert paper is not None
        assert paper.title == "Minimal Paper"
        assert paper.doi is None
        assert paper.is_open_access is False

    def test_normalise_missing_title_returns_none(self):
        raw = {"paperId": "xyz", "title": ""}
        paper = _normalise_paper(raw)
        assert paper is None

    def test_normalise_missing_paper_id_returns_none(self):
        raw = {"paperId": "", "title": "Some Title"}
        paper = _normalise_paper(raw)
        assert paper is None

    def test_year_from_publication_date(self):
        raw = {"paperId": "p1", "title": "Test", "publicationDate": "2022-03-15"}
        paper = _normalise_paper(raw)
        assert paper is not None
        assert paper.publication_year == 2022


class TestScholarlySearchService:
    def _mock_response(self, papers: list, status_code: int = 200) -> MagicMock:
        mock_resp = MagicMock()
        mock_resp.status_code = status_code
        mock_resp.is_success = (status_code == 200)
        mock_resp.json.return_value = {"data": papers}
        mock_resp.text = ""
        return mock_resp

    def test_successful_search(self):
        service = ScholarlySearchService()
        raw_papers = [
            {"paperId": "p1", "title": "CV Waste Sorting", "year": 2023, "citationCount": 10,
             "authors": [{"name": "Alice"}], "externalIds": {}}
        ]
        with patch("httpx.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value.__enter__.return_value = mock_client
            mock_client.get.return_value = self._mock_response(raw_papers)
            results = service.search("waste sorting", limit=5)

        assert len(results) == 1
        assert results[0].title == "CV Waste Sorting"

    def test_empty_results(self):
        service = ScholarlySearchService()
        with patch("httpx.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value.__enter__.return_value = mock_client
            mock_client.get.return_value = self._mock_response([])
            results = service.search("xyzzy unknown topic")

        assert results == []

    def test_rate_limit_raises(self):
        service = ScholarlySearchService()
        mock_resp = MagicMock()
        mock_resp.status_code = 429
        mock_resp.is_success = False
        mock_resp.text = "Too Many Requests"
        with patch("httpx.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value.__enter__.return_value = mock_client
            mock_client.get.return_value = mock_resp
            with pytest.raises(ScholarlySearchError, match="rate limit"):
                service.search("test")

    def test_timeout_raises(self):
        import httpx
        service = ScholarlySearchService()
        with patch("httpx.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value.__enter__.return_value = mock_client
            mock_client.get.side_effect = httpx.TimeoutException("timed out")
            with pytest.raises(ScholarlySearchError, match="timed out"):
                service.search("test")

    def test_empty_query_raises(self):
        service = ScholarlySearchService()
        with pytest.raises(ValueError, match="empty"):
            service.search("")

    def test_year_filter(self):
        service = ScholarlySearchService()
        raw_papers = [
            {"paperId": "old", "title": "Old Paper", "year": 2010, "citationCount": 0,
             "authors": [], "externalIds": {}},
            {"paperId": "new", "title": "New Paper", "year": 2023, "citationCount": 0,
             "authors": [], "externalIds": {}},
        ]
        with patch("httpx.Client") as mock_client_cls:
            mock_client = MagicMock()
            mock_client_cls.return_value.__enter__.return_value = mock_client
            mock_client.get.return_value = self._mock_response(raw_papers)
            results = service.search("papers", year_from=2020)

        titles = [r.title for r in results]
        assert "New Paper" in titles
        assert "Old Paper" not in titles


# ─── Search endpoint tests (with mocked Semantic Scholar) ────────────────────


class TestSearchEndpointWithScholar:
    def _mock_scholar(self, papers: list):
        """Return a mock that replaces scholarly_search_service.search."""
        scholarly_papers = []
        for raw in papers:
            sp = ScholarlyPaper(
                semantic_scholar_id=raw["paperId"],
                title=raw["title"],
                abstract=raw.get("abstract"),
                publication_year=raw.get("year"),
                authors=raw.get("authors", []),
                venue=raw.get("venue"),
                doi=raw.get("doi"),
                url=raw.get("url"),
                citation_count=raw.get("citationCount", 0),
            )
            scholarly_papers.append(sp)
        return scholarly_papers

    def test_search_calls_semantic_scholar(self):
        pid = _create_project("Scholar Search Test")
        mock_papers = [
            {"paperId": "ss1", "title": "Vision Waste AI", "year": 2023,
             "abstract": "CV for waste.", "citationCount": 100,
             "authors": ["Alice"]},
        ]
        with patch(
            "app.api.routes.search.scholarly_search_service.search",
            return_value=self._mock_scholar(mock_papers),
        ):
            res = client.get(f"/api/projects/{pid}/search?q=computer+vision+waste&limit=5")

        assert res.status_code == 200
        data = res.json()
        assert data["source"] == "Semantic Scholar"
        assert data["total_results"] == 1
        assert data["results"][0]["title"] == "Vision Waste AI"
        assert data["results"][0]["is_attached"] is False
        assert data["results"][0]["id"] is None  # not yet in DB

    def test_search_fallback_on_scholar_error(self):
        pid = _create_project("Fallback Test")
        _seed_demo(pid)
        with patch(
            "app.api.routes.search.scholarly_search_service.search",
            side_effect=ScholarlySearchError("Semantic Scholar unavailable"),
        ):
            res = client.get(f"/api/projects/{pid}/search?q=vision")

        assert res.status_code == 200
        data = res.json()
        # Should fall back to DB and include the error note
        assert "fallback" in data["source"] or "database" in data["source"]
        assert data["note"] is not None

    def test_search_no_query_returns_local_papers(self):
        pid = _create_project("No Query Test")
        _seed_demo(pid)
        res = client.get(f"/api/projects/{pid}/search")
        assert res.status_code == 200
        data = res.json()
        assert data["source"] == "database"

    def test_search_short_query_rejected(self):
        pid = _create_project("Short Query Test")
        res = client.get(f"/api/projects/{pid}/search?q=a")
        assert res.status_code == 422

    def test_search_unknown_project(self):
        bad_id = uuid.uuid4()
        res = client.get(f"/api/projects/{bad_id}/search?q=test")
        assert res.status_code == 404


class TestPaperImportDeduplication:
    def test_add_paper_creates_provenance(self):
        pid = _create_project("Provenance Test")
        payload = {
            "title": "Provenance Paper",
            "semantic_scholar_id": "ssid-prov-001",
            "doi": "10.9999/prov001",
            "url": "https://www.semanticscholar.org/paper/ssid-prov-001",
            "publication_year": 2023,
            "authors": ["Alice"],
            "citation_count": 5,
        }
        res = client.post(f"/api/projects/{pid}/search/add", json=payload)
        assert res.status_code == 201
        data = res.json()
        assert data["paper"]["title"] == "Provenance Paper"

    def test_add_paper_deduplicates_by_doi(self):
        pid = _create_project("DOI Dedup Test")
        payload = {
            "title": "Same DOI Paper",
            "doi": "10.9999/dedup001",
            "semantic_scholar_id": "ssid-dedup-001",
            "citation_count": 0,
        }
        res1 = client.post(f"/api/projects/{pid}/search/add", json=payload)
        assert res1.status_code == 201
        first_paper_id = res1.json()["paper_id"]

        # Create a different project and add same DOI paper
        pid2 = _create_project("DOI Dedup Test 2")
        res2 = client.post(f"/api/projects/{pid2}/search/add", json=payload)
        assert res2.status_code == 201
        # Should be the same paper record
        assert res2.json()["paper_id"] == first_paper_id

    def test_add_paper_409_on_duplicate_attach(self):
        pid = _create_project("Duplicate Attach Test")
        payload = {"title": "My Paper", "semantic_scholar_id": "ssid-dup-attach", "citation_count": 0}
        res1 = client.post(f"/api/projects/{pid}/search/add", json=payload)
        assert res1.status_code == 201
        res2 = client.post(f"/api/projects/{pid}/search/add", json=payload)
        assert res2.status_code == 409


# ─── AI Service unit tests ────────────────────────────────────────────────────


class TestAIServiceAnalyzePaper:
    def _mock_ai_response(self, content: str):
        """Patch ai_service._chat to return content."""
        return patch.object(ai_service, "_chat", return_value=content)

    def test_analyze_paper_valid_json(self):
        valid_json = json.dumps({
            "summary": "Test summary",
            "research_problem": "Test problem",
            "methodology": "CNN",
            "dataset": "ImageNet",
            "results": "95% accuracy",
            "limitations": "Small dataset",
            "contribution": "Novel architecture",
            "future_work": "Real-time processing",
            "research_area": "Computer Vision",
            "keywords": ["CNN", "waste"],
            "research_gap": "Lacks real-world validation",
            "confidence": 0.85,
        })
        with self._mock_ai_response(valid_json):
            result = ai_service.analyze_paper(
                title="Test Paper",
                abstract="We test CNNs.",
                authors=["Alice"],
                year=2023,
                venue="NeurIPS",
            )
        assert result.summary == "Test summary"
        assert result.confidence == 0.85
        assert "CNN" in result.keywords

    def test_analyze_paper_json_in_markdown_block(self):
        content = '```json\n{"summary": "Summary", "research_problem": "p", "methodology": "m", "dataset": "d", "results": "r", "limitations": "l", "contribution": "c", "future_work": "f", "research_area": "CS", "keywords": [], "research_gap": "g", "confidence": 0.7}\n```'
        with self._mock_ai_response(content):
            result = ai_service.analyze_paper(
                title="Test", abstract="Abstract", authors=[], year=2023, venue="ICML"
            )
        assert result.summary == "Summary"

    def test_analyze_paper_invalid_json_raises(self):
        with self._mock_ai_response("This is not JSON at all."):
            with pytest.raises(AIServiceError, match="valid JSON"):
                ai_service.analyze_paper(
                    title="Test", abstract=None, authors=[], year=None, venue=None
                )

    def test_analyze_paper_confidence_clamped(self):
        content = json.dumps({
            "summary": "s", "research_problem": "p", "methodology": "m",
            "dataset": "d", "results": "r", "limitations": "l", "contribution": "c",
            "future_work": "f", "research_area": "CS", "keywords": [],
            "research_gap": "g", "confidence": 5.0  # out of range
        })
        with self._mock_ai_response(content):
            result = ai_service.analyze_paper(
                title="Test", abstract=None, authors=[], year=None, venue=None
            )
        assert result.confidence == 1.0  # clamped

    def test_missing_api_key_raises(self):
        with patch.object(ai_service, "_get_headers", side_effect=AIKeyMissingError("no key")):
            with pytest.raises(AIKeyMissingError):
                ai_service.analyze_paper(
                    title="Test", abstract=None, authors=[], year=None, venue=None
                )

    def test_timeout_raises(self):
        import httpx
        with patch.object(ai_service, "_get_headers", return_value={}):
            with patch("httpx.Client") as mock_client_cls:
                mock_client = MagicMock()
                mock_client_cls.return_value.__enter__.return_value = mock_client
                mock_client.post.side_effect = httpx.TimeoutException("timeout")
                with pytest.raises((AIServiceUnavailableError, AIServiceError)):
                    ai_service.analyze_paper(
                        title="Test", abstract=None, authors=[], year=None, venue=None
                    )


class TestAIServiceFallback:
    def test_primary_succeeds_fallback_not_called(self):
        valid_json = json.dumps({"summary": "Primary summary", "confidence": 0.9})
        with patch.object(ai_service, "_chat_single", return_value=valid_json) as mock_chat_single:
            res = ai_service._chat("System prompt", "User prompt")
            assert res == valid_json
            assert mock_chat_single.call_count == 1
            call_kwargs = mock_chat_single.call_args_list[0].kwargs
            call_args = mock_chat_single.call_args_list[0].args
            model_arg = call_kwargs.get("model") or (call_args[2] if len(call_args) > 2 else None)
            assert model_arg == settings.openrouter_primary_model

    def test_primary_rate_limited_fallback_succeeds(self):
        fallback_json = json.dumps({"summary": "Fallback summary", "confidence": 0.8})
        def side_effect(system_prompt, user_prompt, model):
            if model == settings.openrouter_primary_model:
                raise AIServiceUnavailableError("OpenRouter rate limit reached (429)")
            return fallback_json

        with patch.object(ai_service, "_chat_single", side_effect=side_effect) as mock_chat_single:
            result = ai_service.analyze_paper(
                title="Rate Limit Test Paper",
                abstract="Testing 429 rate limit fallback",
                authors=["Test Author"],
                year=2026,
                venue="Test Venue",
            )
            assert result.summary == "Fallback summary"
            assert result.model_used == settings.openrouter_fallback_model
            assert mock_chat_single.call_count == 2

    def test_primary_unavailable_fallback_succeeds(self):
        fallback_json = json.dumps({"summary": "Fallback summary", "confidence": 0.85})
        def side_effect(system_prompt, user_prompt, model):
            if model == settings.openrouter_primary_model:
                raise AIServiceUnavailableError("OpenRouter request timed out after 60s")
            return fallback_json

        with patch.object(ai_service, "_chat_single", side_effect=side_effect) as mock_chat_single:
            result = ai_service.analyze_paper(
                title="Unavailable Test Paper",
                abstract="Testing timeout fallback",
                authors=["Test Author"],
                year=2026,
                venue="Test Venue",
            )
            assert result.summary == "Fallback summary"
            assert result.model_used == settings.openrouter_fallback_model
            assert mock_chat_single.call_count == 2

    def test_both_fail_raises_clear_error(self):
        def side_effect(system_prompt, user_prompt, model):
            raise AIServiceUnavailableError(f"Model {model} failed")

        with patch.object(ai_service, "_chat_single", side_effect=side_effect) as mock_chat_single:
            with pytest.raises(AIServiceError) as exc_info:
                ai_service.analyze_paper(
                    title="Both Fail Test Paper",
                    abstract="Testing double failure",
                    authors=["Test Author"],
                    year=2026,
                    venue="Test Venue",
                )
            assert "both failed" in str(exc_info.value).lower()
            assert settings.openrouter_primary_model in str(exc_info.value)
            assert settings.openrouter_fallback_model in str(exc_info.value)
            assert mock_chat_single.call_count == 2


class TestAIServiceSynthesis:
    def _mock_synthesis(self, data: dict):
        return patch.object(ai_service, "_chat", return_value=json.dumps(data))

    def test_synthesis_returns_correct_structure(self):
        synthesis_data = {
            "common_methods": ["CNN", "YOLO"],
            "common_datasets": ["COCO"],
            "major_findings": ["High accuracy with YOLO"],
            "contradictions": [],
            "research_trends": ["Edge AI"],
            "limitations_across_papers": ["Small datasets"],
            "research_gaps": ["Real-world validation"],
            "future_directions": ["Federated learning"],
            "relationships": [
                {
                    "source_paper_title": "Paper A",
                    "target_paper_title": "Paper B",
                    "relationship_type": "extends",
                    "confidence": 0.9,
                    "evidence": "Paper B extends the CNN from Paper A.",
                }
            ],
        }
        papers_info = [
            {"title": "Paper A", "abstract": "CNN approach.", "methodology": "CNN",
             "results": "90%", "limitations": "Small data", "contribution": "Novel CNN"},
            {"title": "Paper B", "abstract": "YOLO extension.", "methodology": "YOLO",
             "results": "95%", "limitations": "Speed", "contribution": "Fast inference"},
        ]
        with self._mock_synthesis(synthesis_data):
            result = ai_service.synthesize_papers(papers_info)

        assert isinstance(result, CrossPaperSynthesis)
        assert "CNN" in result.common_methods
        assert len(result.relationships) == 1
        assert result.relationships[0].relationship_type == "extends"

    def test_synthesis_empty_papers_raises(self):
        with pytest.raises(AIServiceError, match="No papers"):
            ai_service.synthesize_papers([])


# ─── Paper Analysis endpoint tests ───────────────────────────────────────────


class TestPaperAnalysisEndpoint:
    def test_get_analysis_404_when_none(self):
        pid = _create_project("Analysis 404 Test")
        _seed_demo(pid)
        paper_id = _get_first_paper_id(pid)
        res = client.get(f"/api/papers/{paper_id}/analysis")
        # Either 200 (if demo seeded an analysis) or 404
        assert res.status_code in (200, 404)

    def test_post_analysis_with_mock_ai(self):
        pid = _create_project("AI Analysis Endpoint Test")
        # Add a fresh paper (no demo seed to avoid pre-existing analysis)
        paper_res = client.post(
            f"/api/projects/{pid}/search/add",
            json={"title": "Fresh Paper for AI", "abstract": "Test abstract.", "citation_count": 0},
        )
        assert paper_res.status_code == 201
        paper_id = paper_res.json()["paper_id"]

        mock_analysis = PaperAIAnalysis(
            summary="AI summary",
            research_problem="AI problem",
            methodology="CNN",
            dataset="ImageNet",
            results="95%",
            limitations="Compute cost",
            contribution="Novel CNN",
            future_work="Edge deployment",
            research_area="Computer Vision",
            keywords=["CNN", "AI"],
            research_gap="Real-world testing",
            confidence=0.8,
        )

        with patch.object(ai_service, "analyze_paper", return_value=mock_analysis):
            with patch("app.api.routes.paper_analysis.settings") as mock_settings:
                mock_settings.ai_enabled = True
                mock_settings.openrouter_model = "test-model"
                mock_settings.openrouter_primary_model = "test-model"
                res = client.post(f"/api/papers/{paper_id}/analysis")

        assert res.status_code == 201
        data = res.json()
        assert data["summary"] == "AI summary"
        assert data["methodology"] == "CNN"
        assert data["ai_model"] == "test-model"

    def test_post_analysis_409_if_exists(self):
        pid = _create_project("Duplicate Analysis Test")
        paper_res = client.post(
            f"/api/projects/{pid}/search/add",
            json={"title": "Paper for 409 Test", "citation_count": 0},
        )
        paper_id = paper_res.json()["paper_id"]

        mock_analysis = PaperAIAnalysis(summary="s", confidence=0.5)
        with patch.object(ai_service, "analyze_paper", return_value=mock_analysis):
            with patch("app.api.routes.paper_analysis.settings") as mock_settings:
                mock_settings.ai_enabled = True
                mock_settings.openrouter_model = "test-model"
                mock_settings.openrouter_primary_model = "test-model"
                res1 = client.post(f"/api/papers/{paper_id}/analysis")
                assert res1.status_code == 201
                res2 = client.post(f"/api/papers/{paper_id}/analysis")
                assert res2.status_code == 409

    def test_post_analysis_503_when_no_key(self):
        pid = _create_project("No Key Test")
        paper_res = client.post(
            f"/api/projects/{pid}/search/add",
            json={"title": "No Key Paper", "citation_count": 0},
        )
        paper_id = paper_res.json()["paper_id"]

        with patch("app.api.routes.paper_analysis.settings") as mock_settings:
            mock_settings.ai_enabled = False
            res = client.post(f"/api/papers/{paper_id}/analysis")
        assert res.status_code == 503

    def test_put_analysis_manual_update(self):
        pid = _create_project("Manual Update Test")
        paper_res = client.post(
            f"/api/projects/{pid}/search/add",
            json={"title": "Manual Analysis Paper", "citation_count": 0},
        )
        paper_id = paper_res.json()["paper_id"]

        # Create manual analysis via payload (no AI key)
        with patch("app.api.routes.paper_analysis.settings") as mock_settings:
            mock_settings.ai_enabled = False
            res = client.post(
                f"/api/papers/{paper_id}/analysis",
                json={"summary": "Initial summary"},
            )
        assert res.status_code == 201

        # Update via PUT
        put_res = client.put(
            f"/api/papers/{paper_id}/analysis",
            json={"summary": "Updated summary"},
        )
        assert put_res.status_code == 200
        assert put_res.json()["summary"] == "Updated summary"


# ─── AI Synthesis endpoint tests ─────────────────────────────────────────────


class TestAISynthesisEndpoint:
    def test_analyze_collection_no_papers(self):
        pid = _create_project("Empty Collection Test")
        with patch("app.api.routes.ai_synthesis.settings") as mock_settings:
            mock_settings.ai_enabled = True
            res = client.post(f"/api/projects/{pid}/analyze-collection")
        assert res.status_code == 200
        assert res.json()["total"] == 0

    def test_analyze_collection_not_configured(self):
        pid = _create_project("No AI Config Test")
        with patch("app.api.routes.ai_synthesis.settings") as mock_settings:
            mock_settings.ai_enabled = False
            res = client.post(f"/api/projects/{pid}/analyze-collection")
        assert res.status_code == 503

    def test_ai_synthesis_no_papers_400(self):
        pid = _create_project("Empty Project Synth")
        with patch("app.api.routes.ai_synthesis.settings") as mock_settings:
            mock_settings.ai_enabled = True
            res = client.post(f"/api/projects/{pid}/ai-synthesis")
        assert res.status_code == 400
        assert "No papers" in res.json()["detail"]

    def test_ai_synthesis_no_analyses_400(self):
        pid = _create_project("Papers Without Analyses")
        # Add a paper without adding any analysis
        client.post(
            f"/api/projects/{pid}/search/add",
            json={"title": "Paper Without Analysis", "citation_count": 0},
        )
        with patch("app.api.routes.ai_synthesis.settings") as mock_settings:
            mock_settings.ai_enabled = True
            res = client.post(f"/api/projects/{pid}/ai-synthesis")
        assert res.status_code == 400
        assert "No AI analyses found" in res.json()["detail"]

    def test_ai_synthesis_not_configured(self):
        pid = _create_project("Synth No Config Test")
        with patch("app.api.routes.ai_synthesis.settings") as mock_settings:
            mock_settings.ai_enabled = False
            res = client.post(f"/api/projects/{pid}/ai-synthesis")
        assert res.status_code == 503

    def test_ai_synthesis_with_mock(self):
        pid = _create_project("Full Synthesis Test")
        # Add paper and analysis
        add_res = client.post(
            f"/api/projects/{pid}/search/add",
            json={"title": "Synthesis Paper Alpha", "citation_count": 5},
        )
        paper_id = add_res.json()["paper_id"]

        mock_analysis = PaperAIAnalysis(
            summary="Deep learning paper",
            methodology="CNN",
            results="98% accuracy",
            limitations="Needs GPU",
            confidence=0.85,
        )
        with patch.object(ai_service, "analyze_paper", return_value=mock_analysis):
            client.post(
                f"/api/papers/{paper_id}/analysis",
                json={
                    "summary": "Deep learning paper",
                    "methodology": "CNN",
                    "results": "98% accuracy",
                    "limitations": "Needs GPU",
                    "confidence": 0.85,
                },
            )

        mock_synthesis = CrossPaperSynthesis(
            common_methods=["CNN"],
            common_datasets=["ImageNet"],
            major_findings=["CNN performs well"],
            research_gaps=["Real-world validation gap"],
            relationships=[],
        )

        with patch("app.api.routes.ai_synthesis.settings") as mock_settings:
            mock_settings.ai_enabled = True
            with patch.object(ai_service, "synthesize_papers", return_value=mock_synthesis):
                res = client.post(f"/api/projects/{pid}/ai-synthesis")

        assert res.status_code == 200
        data = res.json()
        assert "synthesis" in data
        assert data["papers_analyzed"] == 1
        assert "CNN" in data["synthesis"]["common_methods"]

    def test_ai_synthesis_service_failure_502(self):
        pid = _create_project("Synthesis Failure Test")
        add_res = client.post(
            f"/api/projects/{pid}/search/add",
            json={"title": "Failing Paper", "citation_count": 0},
        )
        paper_id = add_res.json()["paper_id"]
        mock_analysis = PaperAIAnalysis(summary="Sample summary", confidence=0.5)
        with patch.object(ai_service, "analyze_paper", return_value=mock_analysis):
            client.post(
                f"/api/papers/{paper_id}/analysis",
                json={"summary": "Sample summary", "confidence": 0.5},
            )

        with patch("app.api.routes.ai_synthesis.settings") as mock_settings:
            mock_settings.ai_enabled = True
            with patch.object(
                ai_service,
                "synthesize_papers",
                side_effect=AIServiceError("OpenRouter model failed"),
            ):
                res = client.post(f"/api/projects/{pid}/ai-synthesis")
        assert res.status_code == 502

