"""
MindShield AI — Gemini AI Service

Handles all Gemini API interactions with structured prompting,
error handling, and OpenAI-compatible adapter pattern.
"""

from __future__ import annotations
import json
import logging
from typing import AsyncGenerator, Optional

import google.generativeai as genai
from app.config import get_settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are MindShield AI's behavioral health analysis engine.
You assist clinical psychologists by analyzing digital behavioral data to identify
risk patterns for Internet Gaming Disorder (IGD) and Body Dysmorphic Disorder (BDD).

Core guidelines:
- Maintain clinical objectivity and empathy at all times
- Never diagnose — assess risk levels and behavioral patterns only
- Express appropriate uncertainty when data is limited
- Prioritize user safety and intervention appropriateness
- Reference DSM-5 criteria for IGD and BDD when clinically relevant
- Output valid JSON when requested, prose otherwise
- Be concise but thorough in explanations
"""


class AIService:
    def __init__(self):
        settings = get_settings()
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=SYSTEM_PROMPT,
        )
        self.generation_config = genai.types.GenerationConfig(
            temperature=0.3,
            max_output_tokens=1024,
        )

    # ─────────────────────────────────────────
    # Journal NLP Analysis
    # ─────────────────────────────────────────

    async def analyze_journal(
        self, content: str, user_context: Optional[dict] = None
    ) -> dict:
        """Analyze a journal entry for behavioral signals."""
        context_str = ""
        if user_context:
            context_str = f"\nUser context: IGD risk {user_context.get('igd_score', 'unknown')}, BDD risk {user_context.get('bdd_score', 'unknown')}."

        prompt = f"""Analyze this journal entry for behavioral health signals.{context_str}

Journal entry:
"{content}"

Return ONLY valid JSON in this exact format:
{{
  "mood_tag": "positive|neutral|negative|distressed",
  "sentiment_score": <float -1.0 to 1.0>,
  "ai_tags": ["tag1", "tag2"],
  "risk_signals": [
    {{"type": "IGD|BDD|SLEEP|STRESS|SOCIAL", "description": "brief explanation", "severity": "low|moderate|high"}}
  ],
  "ai_analysis": "2-3 sentence clinical observation about the entry",
  "igd_signal_count": <int>,
  "bdd_signal_count": <int>
}}

IGD tags to detect: gaming_craving, social_withdrawal, mood_dependent_gaming, loss_of_control, preoccupation
BDD tags to detect: body_dissatisfaction, mirror_checking, appearance_avoidance, comparison_behavior, grooming_ritual"""

        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config=self.generation_config,
            )
            text = response.text.strip()
            # Strip markdown code fences if present
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except Exception as e:
            logger.error(f"Journal analysis failed: {e}")
            return self._fallback_journal_analysis(content)

    # ─────────────────────────────────────────
    # Assessment Interpretation
    # ─────────────────────────────────────────

    async def analyze_assessment(
        self, assessment_type: str, responses: dict, raw_score: float, risk_level: str
    ) -> str:
        """Generate clinical narrative for assessment results."""
        prompt = f"""Interpret this {assessment_type} assessment result for a patient report.

Assessment type: {assessment_type}
Raw score: {raw_score}
Risk level determined: {risk_level}
Responses: {json.dumps(responses)}

Write a 3-4 sentence clinical interpretation. Be empathetic, non-alarmist, and focus on:
1. What the score indicates
2. Key patterns in the responses
3. Suggested next steps

Do NOT diagnose. Use language like "suggests", "indicates risk of", "warrants attention"."""

        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config=self.generation_config,
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Assessment analysis failed: {e}")
            return f"Assessment analysis indicates a {risk_level} risk level for {assessment_type}. Further monitoring is recommended."

    # ─────────────────────────────────────────
    # Risk Explainability
    # ─────────────────────────────────────────

    async def explain_risk(
        self,
        igd_score: float,
        bdd_score: float,
        sleep_score: float,
        stress_score: float,
        composite_score: float,
        triggers: list[dict],
        delta_24h: Optional[float] = None,
    ) -> str:
        """Generate plain-language explanation of risk scores."""
        delta_str = ""
        if delta_24h is not None:
            direction = "increased" if delta_24h > 0 else "decreased"
            delta_str = f"The composite risk score has {direction} by {abs(delta_24h):.1f} points in the last 24 hours."

        trigger_text = "\n".join(
            f"- {t['description']} (weight: {t['weight']})" for t in triggers[:5]
        )

        prompt = f"""Explain these behavioral health risk scores in plain, compassionate language.

Scores (0-100 scale, higher = more concerning):
- Internet Gaming Disorder risk: {igd_score}
- Body Dysmorphic Disorder risk: {bdd_score}
- Sleep disruption risk: {sleep_score}
- Stress level: {stress_score}
- Composite risk: {composite_score}

{delta_str}

Key contributing factors:
{trigger_text}

Write 2-3 paragraphs explaining:
1. What the overall risk picture looks like
2. The most important contributing factors
3. What this means for the user in practical terms

Be empathetic, clear, and avoid clinical jargon. Never catastrophize."""

        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config=self.generation_config,
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Risk explanation failed: {e}")
            return f"Your current composite risk score is {composite_score:.0f}/100, indicating a {self._tier_label(composite_score)} level of behavioral health concern."

    # ─────────────────────────────────────────
    # Intervention Generation
    # ─────────────────────────────────────────

    async def generate_intervention(
        self,
        trigger_type: str,
        severity: str,
        risk_context: dict,
        history: Optional[list] = None,
    ) -> dict:
        """Generate a structured intervention plan."""
        prompt = f"""Generate a behavioral health intervention plan.

Trigger: {trigger_type}
Severity: {severity}
Risk context: {json.dumps(risk_context)}

Return ONLY valid JSON:
{{
  "title": "Short intervention title (max 8 words)",
  "description": "1-2 sentence description of this intervention",
  "ai_rationale": "Clinical rationale: why this intervention is recommended now",
  "action_steps": [
    {{"step": "Specific actionable instruction", "resource_url": null}},
    {{"step": "Another step", "resource_url": null}},
    {{"step": "Third step", "resource_url": null}}
  ]
}}

Interventions should be:
- Evidence-based (CBT, behavioral activation, sleep hygiene, etc.)
- Specific and immediately actionable
- Non-judgmental and empowering
- Appropriate for self-help (not clinical-level treatment)"""

        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config=self.generation_config,
            )
            text = response.text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except Exception as e:
            logger.error(f"Intervention generation failed: {e}")
            return self._fallback_intervention(trigger_type, severity)

    # ─────────────────────────────────────────
    # Weekly Insights (Streaming)
    # ─────────────────────────────────────────

    async def stream_weekly_insights(
        self, summary_data: dict
    ) -> AsyncGenerator[str, None]:
        """Stream weekly behavioral insights narrative."""
        prompt = f"""Write a weekly behavioral health summary for this user.

Data summary:
{json.dumps(summary_data, indent=2)}

Write 3-4 paragraphs covering:
1. Overall behavioral health trajectory this week
2. Gaming patterns and their impact
3. Sleep and stress observations
4. Positive behaviors and progress to highlight
5. One key recommendation for the coming week

Tone: Warm, supportive, evidence-informed. Like a caring health coach."""

        try:
            response = await self.model.generate_content_async(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.4,
                    max_output_tokens=1500,
                ),
                stream=True,
            )
            async for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error(f"Streaming insights failed: {e}")
            yield "Unable to generate insights at this time. Please try again later."

    # ─────────────────────────────────────────
    # Helpers
    # ─────────────────────────────────────────

    def _tier_label(self, score: float) -> str:
        if score < 25:
            return "low"
        elif score < 50:
            return "moderate"
        elif score < 75:
            return "high"
        return "critical"

    def _fallback_journal_analysis(self, content: str) -> dict:
        return {
            "mood_tag": "neutral",
            "sentiment_score": 0.0,
            "ai_tags": [],
            "risk_signals": [],
            "ai_analysis": "Journal entry recorded. AI analysis temporarily unavailable.",
            "igd_signal_count": 0,
            "bdd_signal_count": 0,
        }

    def _fallback_intervention(self, trigger_type: str, severity: str) -> dict:
        return {
            "title": "Behavioral Health Check-In",
            "description": "A general wellness check-in is recommended based on recent behavioral patterns.",
            "ai_rationale": "Elevated risk indicators have been detected.",
            "action_steps": [
                {"step": "Take 5 deep breaths and ground yourself in the present moment.", "resource_url": None},
                {"step": "Reach out to a trusted friend or family member today.", "resource_url": None},
                {"step": "Consider reducing screen time by 30 minutes this evening.", "resource_url": None},
            ],
        }


# Singleton instance
ai_service = AIService()
