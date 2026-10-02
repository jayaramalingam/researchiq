"""
OpenRouter AI service for paper analysis and cross-paper synthesis.

OpenRouter provides access to a range of language models via a single API
compatible with the OpenAI format.

Configuration (environment variables in backend/.env):
    OPENROUTER_API_KEY  — Required for AI features
    OPENROUTER_MODEL    — Model ID (default: meta-llama/llama-3.1-8b-instruct:free)

The service makes REAL requests to the OpenRouter API.
It NEVER invents facts — the prompt explicitly instructs the model to use ONLY
supplied information and return structured JSON.

References:
    https://openrouter.ai/docs
    https://openrouter.ai/models (filter "free" for zero-cost options)
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

import httpx
from pydantic import BaseModel, Field, ValidationError, field_validator

from app.core.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Pydantic models for structured AI output
# ---------------------------------------------------------------------------


class PaperAIAnalysis(BaseModel):
    """Validated structured output from the AI paper analysis prompt."""

    summary: str = ""
    research_problem: str = ""
    methodology: str = ""
    dataset: str = ""
    results: str = ""
    limitations: str = ""
    contribution: str = ""
    future_work: str = ""
    research_area: str = ""
    keywords: List[str] = Field(default_factory=list)
    research_gap: str = ""
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    model_used: str = ""

    @field_validator("confidence", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        try:
            f = float(v)
            return max(0.0, min(1.0, f))
        except (TypeError, ValueError):
            return 0.5

    @field_validator("keywords", mode="before")
    @classmethod
    def ensure_list(cls, v: Any) -> List[str]:
        if isinstance(v, list):
            return [str(x) for x in v if x]
        if isinstance(v, str) and v:
            return [k.strip() for k in v.split(",") if k.strip()]
        return []


class SynthesisRelationship(BaseModel):
    """A single AI-identified relationship between two papers."""

    source_paper_title: str
    target_paper_title: str
    relationship_type: str  # similar / extends / improves / uses / contradicts
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    evidence: str = ""


class CrossPaperSynthesis(BaseModel):
    """Validated structured output from the cross-paper synthesis prompt."""

    common_methods: List[str] = Field(default_factory=list)
    common_datasets: List[str] = Field(default_factory=list)
    major_findings: List[str] = Field(default_factory=list)
    contradictions: List[str] = Field(default_factory=list)
    research_trends: List[str] = Field(default_factory=list)
    limitations_across_papers: List[str] = Field(default_factory=list)
    research_gaps: List[str] = Field(default_factory=list)
    future_directions: List[str] = Field(default_factory=list)
    relationships: List[SynthesisRelationship] = Field(default_factory=list)
    model_used: str = ""


# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------


class AIServiceError(Exception):
    """Raised when the AI API call fails in a non-recoverable way."""

    pass


class AIServiceUnavailableError(AIServiceError):
    """Raised when OpenRouter is unreachable or returns a server error."""

    pass


class AIKeyMissingError(AIServiceError):
    """Raised when no OPENROUTER_API_KEY is configured."""

    pass


# ---------------------------------------------------------------------------
# AI Service
# ---------------------------------------------------------------------------


class AIService:
    """
    Provides real AI-powered paper analysis via OpenRouter.

    The service:
    1. Validates that an API key is present.
    2. Builds a structured prompt with the paper metadata.
    3. Sends the request to OpenRouter.
    4. Parses and validates the JSON response.
    5. Returns a validated Pydantic model.
    """

    def __init__(self) -> None:
        self._base_url = settings.openrouter_base_url
        self._timeout = settings.openrouter_timeout_seconds
        self.last_model_used: Optional[str] = None

    def _get_headers(self) -> Dict[str, str]:
        if not settings.openrouter_api_key:
            raise AIKeyMissingError(
                "OPENROUTER_API_KEY is not configured. "
                "Add it to backend/.env to enable AI analysis."
            )
        return {
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://researchiq.app",
            "X-Title": "ResearchIQ",
        }

    def _chat_single(self, system_prompt: str, user_prompt: str, model: str) -> str:
        """
        Call OpenRouter chat completions endpoint for a specific model attempt.

        Returns raw content string.
        Raises AIKeyMissingError on 401 or missing key.
        Raises AIServiceUnavailableError or AIServiceError on recoverable failure.
        """
        headers = self._get_headers()  # may raise AIKeyMissingError

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,  # low temperature for deterministic structured output
            "max_tokens": 1500,
        }

        try:
            with httpx.Client(timeout=self._timeout) as client:
                response = client.post(
                    f"{self._base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
        except httpx.TimeoutException as exc:
            raise AIServiceUnavailableError(
                f"OpenRouter request to model '{model}' timed out after {self._timeout}s."
            ) from exc
        except httpx.RequestError as exc:
            raise AIServiceUnavailableError(
                f"Unable to reach OpenRouter for model '{model}': {exc}"
            ) from exc

        if response.status_code == 401:
            raise AIKeyMissingError(
                "OpenRouter returned 401 Unauthorized. "
                "Check that OPENROUTER_API_KEY is correct."
            )
        if response.status_code == 429:
            raise AIServiceUnavailableError(
                f"OpenRouter rate limit reached (429) for model '{model}'."
            )
        if response.status_code == 400:
            detail = response.text[:300]
            raise AIServiceError(
                f"OpenRouter rejected request (400) for model '{model}': {detail}"
            )
        if not response.is_success:
            raise AIServiceUnavailableError(
                f"OpenRouter returned HTTP {response.status_code} for model '{model}': {response.text[:200]}"
            )

        try:
            data = response.json()
        except Exception as exc:
            raise AIServiceError(
                f"OpenRouter model '{model}' returned invalid JSON response."
            ) from exc

        choices = data.get("choices") or []
        if not choices:
            raise AIServiceError(f"OpenRouter model '{model}' returned no completion choices.")

        content = (choices[0].get("message") or {}).get("content") or ""
        if not content:
            raise AIServiceError(f"OpenRouter model '{model}' returned an empty completion.")

        return content.strip()

    def _chat(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
    ) -> str:
        """
        Call OpenRouter chat completions endpoint with PRIMARY -> FALLBACK handling.

        If model is specified, calls that specific model.
        Otherwise, attempts primary model first and falls back to fallback model on recoverable errors.
        """
        if model is not None:
            res = self._chat_single(system_prompt, user_prompt, model=model)
            self.last_model_used = model
            return res

        primary_model = settings.openrouter_primary_model
        fallback_model = settings.openrouter_fallback_model

        # 1. Primary Model Attempt
        try:
            res = self._chat_single(system_prompt, user_prompt, model=primary_model)
            self.last_model_used = primary_model
            return res
        except AIKeyMissingError:
            raise
        except (AIServiceError, AIServiceUnavailableError, httpx.RequestError, httpx.TimeoutException) as exc:
            logger.warning(
                "Primary AI model '%s' failed: %s. Attempting fallback model '%s'...",
                primary_model,
                exc,
                fallback_model,
            )

        # 2. Fallback Model Attempt
        try:
            res = self._chat_single(system_prompt, user_prompt, model=fallback_model)
            self.last_model_used = fallback_model
            return res
        except AIKeyMissingError:
            raise
        except (AIServiceError, AIServiceUnavailableError, httpx.RequestError, httpx.TimeoutException) as exc:
            logger.error(
                "Fallback AI model '%s' also failed: %s",
                fallback_model,
                exc,
            )
            raise AIServiceError(
                f"AI service unavailable. Primary model ({primary_model}) and "
                f"fallback model ({fallback_model}) both failed."
            ) from exc

    def _extract_json(self, raw_content: str) -> Dict[str, Any]:
        """
        Extract a JSON object from the AI response.

        The model may wrap the JSON in a markdown code block.
        Try to parse the raw string first; if that fails, look for ```json...``` or ```...```.
        """
        # Try direct parse
        try:
            return json.loads(raw_content)
        except json.JSONDecodeError:
            pass

        # Look for ```json block
        import re

        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw_content, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        # Look for any { } block
        match = re.search(r"\{.*\}", raw_content, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass

        raise AIServiceError(
            f"AI response did not contain valid JSON. Raw response (truncated): "
            f"{raw_content[:300]}"
        )

    # -----------------------------------------------------------------------
    # Public API
    # -----------------------------------------------------------------------

    def analyze_paper(
        self,
        *,
        title: str,
        abstract: Optional[str],
        authors: Optional[List[str]],
        year: Optional[int],
        venue: Optional[str],
        fields_of_study: Optional[List[str]] = None,
    ) -> PaperAIAnalysis:
        """
        Perform AI analysis on a single paper using only the available metadata.

        Returns a validated PaperAIAnalysis instance.
        Raises AIServiceError if the AI call or response parsing fails.
        """
        authors_str = ", ".join(authors) if authors else "Not specified"
        fos_str = ", ".join(fields_of_study) if fields_of_study else "Not specified"

        system_prompt = (
            "You are a research analyst. You will be given metadata for a single academic paper. "
            "Analyze ONLY the information supplied in this request. "
            "Do not invent facts, statistics, or claims not present in the input. "
            "If information is not available, use the exact phrase: "
            "'Not specified in the available paper content'. "
            "Return ONLY a valid JSON object with no additional text."
        )

        user_prompt = f"""Analyze the following academic paper and return a JSON object:

Title: {title}
Authors: {authors_str}
Year: {year or 'Not specified'}
Venue: {venue or 'Not specified'}
Fields of Study: {fos_str}
Abstract:
{abstract or 'Not available'}

Return exactly this JSON structure (fill each field from the abstract/metadata only):
{{
  "summary": "Concise 2–3 sentence summary of the paper",
  "research_problem": "The main problem or challenge the paper addresses",
  "methodology": "The research method, approach, or technique used",
  "dataset": "Datasets, benchmarks, or data sources mentioned",
  "results": "Key findings, metrics, or outcomes reported",
  "limitations": "Stated or implied limitations of the study",
  "contribution": "Primary contribution or novelty of the paper",
  "future_work": "Directions for future research mentioned",
  "research_area": "The broad research area (e.g. Computer Vision)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "research_gap": "A research gap this paper addresses or leaves open",
  "confidence": 0.75
}}

Important: Set confidence between 0.0 and 1.0 based on how much information was available."""

        models_to_try = [
            settings.openrouter_primary_model,
            settings.openrouter_fallback_model,
        ]

        last_error: Optional[Exception] = None
        for idx, model in enumerate(models_to_try):
            try:
                raw = self._chat(system_prompt, user_prompt, model=model)
                data = self._extract_json(raw)
                try:
                    result = PaperAIAnalysis.model_validate(data)
                except ValidationError as exc:
                    logger.warning("AI analysis response failed Pydantic validation: %s", exc)
                    result = PaperAIAnalysis()
                    for field_name in PaperAIAnalysis.model_fields:
                        if field_name in data:
                            try:
                                setattr(result, field_name, data[field_name])
                            except Exception:
                                pass
                result.model_used = model
                self.last_model_used = model
                return result
            except AIKeyMissingError:
                raise
            except (AIServiceError, AIServiceUnavailableError, httpx.RequestError, httpx.TimeoutException, Exception) as exc:
                last_error = exc
                if idx == 0:
                    logger.warning(
                        "Primary AI model '%s' failed during analysis: %s. Trying fallback model '%s'...",
                        model,
                        exc,
                        models_to_try[1],
                    )

        raise AIServiceError(
            f"AI service unavailable. Primary model ({models_to_try[0]}) and "
            f"fallback model ({models_to_try[1]}) both failed. Error: {last_error}"
        )

    def synthesize_papers(
        self,
        papers_info: List[Dict[str, Any]],
    ) -> CrossPaperSynthesis:
        """
        Perform cross-paper AI synthesis.

        Args:
            papers_info: List of dicts, each with keys:
                title, abstract, methodology, results, limitations, contribution

        Returns a validated CrossPaperSynthesis instance.
        """
        if not papers_info:
            raise AIServiceError("No papers provided for synthesis.")

        papers_text = ""
        for i, p in enumerate(papers_info, start=1):
            papers_text += f"\n---\nPaper {i}: {p.get('title', 'Untitled')}\n"
            if p.get("abstract"):
                papers_text += f"Abstract: {p['abstract'][:500]}\n"
            if p.get("methodology"):
                papers_text += f"Methodology: {p['methodology']}\n"
            if p.get("results"):
                papers_text += f"Results: {p['results']}\n"
            if p.get("limitations"):
                papers_text += f"Limitations: {p['limitations']}\n"
            if p.get("contribution"):
                papers_text += f"Contribution: {p['contribution']}\n"

        system_prompt = (
            "You are a research synthesis analyst. You will be given analysis summaries "
            "for a set of academic papers. Synthesize ONLY the information provided. "
            "Do not invent facts or citations. Reference paper titles where relevant. "
            "Return ONLY valid JSON. If a section has nothing to report, return an empty list []."
        )

        user_prompt = f"""Synthesize the following {len(papers_info)} research papers and identify cross-paper patterns.

{papers_text}

Return exactly this JSON structure:
{{
  "common_methods": ["Method shared across multiple papers, with paper titles noted"],
  "common_datasets": ["Dataset used in multiple papers"],
  "major_findings": ["Key finding from the collection, with paper title noted"],
  "contradictions": ["Conflicting findings or claims between papers, with titles noted"],
  "research_trends": ["Overall research trend visible across the papers"],
  "limitations_across_papers": ["Repeated limitation appearing in multiple papers"],
  "research_gaps": ["Gap that appears across the collection or is left unaddressed"],
  "future_directions": ["Future research direction mentioned or implied"],
  "relationships": [
    {{
      "source_paper_title": "Title of first paper",
      "target_paper_title": "Title of second paper",
      "relationship_type": "extends",
      "confidence": 0.8,
      "evidence": "Short textual reason for the relationship"
    }}
  ]
}}

Relationship types must be one of: similar, extends, improves, uses, contradicts.
Only include relationships with clear textual evidence from the summaries above."""

        models_to_try = [
            settings.openrouter_primary_model,
            settings.openrouter_fallback_model,
        ]

        last_error: Optional[Exception] = None
        for idx, model in enumerate(models_to_try):
            try:
                raw = self._chat(system_prompt, user_prompt, model=model)
                data = self._extract_json(raw)
                try:
                    result = CrossPaperSynthesis.model_validate(data)
                except ValidationError as exc:
                    logger.warning("Synthesis response failed Pydantic validation: %s", exc)
                    result = CrossPaperSynthesis()
                result.model_used = model
                self.last_model_used = model
                return result
            except AIKeyMissingError:
                raise
            except (AIServiceError, AIServiceUnavailableError, httpx.RequestError, httpx.TimeoutException, Exception) as exc:
                last_error = exc
                if idx == 0:
                    logger.warning(
                        "Primary AI model '%s' failed during synthesis: %s. Trying fallback model '%s'...",
                        model,
                        exc,
                        models_to_try[1],
                    )

        raise AIServiceError(
            f"AI service unavailable. Primary model ({models_to_try[0]}) and "
            f"fallback model ({models_to_try[1]}) both failed. Error: {last_error}"
        )


# Module-level singleton
ai_service = AIService()
