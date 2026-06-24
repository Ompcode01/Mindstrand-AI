"""
MindShield AI — Risk Scoring Engine

Multi-signal behavioral risk assessment for IGD, BDD, Sleep, and Stress.
Computes normalized 0-100 scores and composite risk tier.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Optional
import math


# ─────────────────────────────────────────────
# Data containers
# ─────────────────────────────────────────────

@dataclass
class AssessmentInput:
    type: str           # 'IGD' | 'BDD'
    responses: dict[str, int]
    raw_score: float = 0.0


@dataclass
class GamingInput:
    sessions_last_7d: list[dict] = field(default_factory=list)
    avg_daily_hours: float = 0.0
    skipped_meals_count: int = 0
    skipped_sleep_count: int = 0
    avg_mood_delta: float = 0.0  # mood_after - mood_before avg


@dataclass
class WearableInput:
    avg_sleep_hours: float = 7.5
    avg_hrv: float = 45.0
    avg_stress_index: float = 25.0
    avg_bpm: float = 68.0


@dataclass
class JournalInput:
    igd_signal_count: int = 0
    bdd_signal_count: int = 0
    negative_entries: int = 0
    total_entries: int = 0


@dataclass
class MoodInput:
    avg_mood: float = 7.0
    avg_anxiety: float = 3.0
    avg_social_urge: float = 7.0
    consecutive_negative: int = 0


@dataclass
class RiskComponents:
    igd_score: float = 0.0
    bdd_score: float = 0.0
    sleep_score: float = 0.0
    stress_score: float = 0.0
    composite_score: float = 0.0
    risk_tier: str = "unknown"
    triggers: list[dict] = field(default_factory=list)
    confidence: float = 0.85


# ─────────────────────────────────────────────
# DSM-5 IGD Criteria questions (9 criteria)
# ─────────────────────────────────────────────

IGD_QUESTION_IDS = [
    "igd_preoccupation",
    "igd_withdrawal",
    "igd_tolerance",
    "igd_unsuccessful_reduction",
    "igd_loss_of_interest",
    "igd_continued_despite_problems",
    "igd_deception",
    "igd_escape_negative_mood",
    "igd_jeopardized_relationship",
]

# BDDQ-style questions (mapped to severity 0-4)
BDD_QUESTION_IDS = [
    "bdd_preoccupation_hours",
    "bdd_distress_level",
    "bdd_avoidance_behavior",
    "bdd_repetitive_checking",
    "bdd_comparison_behavior",
    "bdd_camouflage_behavior",
    "bdd_daily_impairment",
]


def _clamp(value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    return max(min_val, min(max_val, value))


class RiskScoringEngine:
    """
    Weighted multi-signal risk scoring engine.

    Score semantics (all 0–100):
      0-24  → low
      25-49 → moderate
      50-74 → high
      75-100 → critical
    """

    # Composite weights
    COMPOSITE_WEIGHTS = {
        "igd": 0.30,
        "bdd": 0.30,
        "sleep": 0.20,
        "stress": 0.20,
    }

    # IGD sub-weights
    IGD_WEIGHTS = {
        "assessment": 0.40,
        "gaming_pattern": 0.35,
        "journal_signals": 0.15,
        "mood": 0.10,
    }

    # BDD sub-weights
    BDD_WEIGHTS = {
        "assessment": 0.50,
        "journal_signals": 0.25,
        "mood_anxiety": 0.15,
        "wearable_stress": 0.10,
    }

    def compute(
        self,
        igd_assessment: Optional[AssessmentInput] = None,
        bdd_assessment: Optional[AssessmentInput] = None,
        gaming: Optional[GamingInput] = None,
        wearable: Optional[WearableInput] = None,
        journal: Optional[JournalInput] = None,
        mood: Optional[MoodInput] = None,
    ) -> RiskComponents:
        triggers: list[dict] = []

        igd_score = self._compute_igd(igd_assessment, gaming, journal, mood, triggers)
        bdd_score = self._compute_bdd(bdd_assessment, journal, mood, wearable, triggers)
        sleep_score = self._compute_sleep(wearable, triggers)
        stress_score = self._compute_stress(wearable, mood, triggers)

        composite = (
            igd_score * self.COMPOSITE_WEIGHTS["igd"]
            + bdd_score * self.COMPOSITE_WEIGHTS["bdd"]
            + sleep_score * self.COMPOSITE_WEIGHTS["sleep"]
            + stress_score * self.COMPOSITE_WEIGHTS["stress"]
        )

        confidence = self._compute_confidence(
            igd_assessment, bdd_assessment, gaming, wearable, journal, mood
        )

        return RiskComponents(
            igd_score=round(igd_score, 2),
            bdd_score=round(bdd_score, 2),
            sleep_score=round(sleep_score, 2),
            stress_score=round(stress_score, 2),
            composite_score=round(composite, 2),
            risk_tier=self._tier(composite),
            triggers=triggers,
            confidence=round(confidence, 2),
        )

    # ─────────────────────────────────────────
    # IGD Score
    # ─────────────────────────────────────────

    def _compute_igd(
        self,
        assessment: Optional[AssessmentInput],
        gaming: Optional[GamingInput],
        journal: Optional[JournalInput],
        mood: Optional[MoodInput],
        triggers: list[dict],
    ) -> float:
        parts: dict[str, float] = {}

        # 1. Assessment component (DSM-5, 9 binary criteria)
        if assessment and assessment.type == "IGD":
            criteria_met = sum(
                1 for v in assessment.responses.values() if v >= 3  # 3+ on 5-pt scale
            )
            # DSM-5: 5+ criteria = disorder, normalize
            parts["assessment"] = _clamp((criteria_met / 9) * 100)
            if criteria_met >= 5:
                triggers.append({
                    "type": "igd_dsm5_threshold",
                    "weight": 0.40,
                    "description": f"DSM-5 IGD criteria met: {criteria_met}/9",
                })
        else:
            parts["assessment"] = 30.0  # no assessment → assume moderate baseline

        # 2. Gaming pattern component
        gaming_score = 0.0
        if gaming:
            # Hours per day (>5h = 100 pts scaled)
            daily_h = _clamp(gaming.avg_daily_hours, 0, 12)
            gaming_score += _clamp((daily_h / 6) * 60)

            if gaming.skipped_meals_count > 0:
                gaming_score += min(gaming.skipped_meals_count * 5, 20)
                triggers.append({
                    "type": "skipped_meals_gaming",
                    "weight": 0.15,
                    "description": f"Skipped meals {gaming.skipped_meals_count}x for gaming",
                })

            if gaming.skipped_sleep_count > 0:
                gaming_score += min(gaming.skipped_sleep_count * 8, 30)
                triggers.append({
                    "type": "skipped_sleep_gaming",
                    "weight": 0.20,
                    "description": f"Skipped sleep {gaming.skipped_sleep_count}x for gaming",
                })

            if gaming.avg_mood_delta < -1.5:
                gaming_score += 15
                triggers.append({
                    "type": "mood_worsens_after_gaming",
                    "weight": 0.10,
                    "description": "Mood consistently worsens after gaming sessions",
                })

        parts["gaming_pattern"] = _clamp(gaming_score)

        # 3. Journal signals
        journal_score = 0.0
        if journal and journal.total_entries > 0:
            signal_rate = journal.igd_signal_count / max(journal.total_entries, 1)
            journal_score = _clamp(signal_rate * 100)
        parts["journal_signals"] = journal_score

        # 4. Mood component
        mood_score = 0.0
        if mood:
            mood_score = _clamp((10 - mood.avg_social_urge) * 10)
            if mood.consecutive_negative >= 3:
                mood_score += 15
        parts["mood"] = _clamp(mood_score)

        return _clamp(
            parts["assessment"] * self.IGD_WEIGHTS["assessment"]
            + parts["gaming_pattern"] * self.IGD_WEIGHTS["gaming_pattern"]
            + parts["journal_signals"] * self.IGD_WEIGHTS["journal_signals"]
            + parts["mood"] * self.IGD_WEIGHTS["mood"]
        )

    # ─────────────────────────────────────────
    # BDD Score
    # ─────────────────────────────────────────

    def _compute_bdd(
        self,
        assessment: Optional[AssessmentInput],
        journal: Optional[JournalInput],
        mood: Optional[MoodInput],
        wearable: Optional[WearableInput],
        triggers: list[dict],
    ) -> float:
        parts: dict[str, float] = {}

        if assessment and assessment.type == "BDD":
            # Max possible score: 7 questions × 4 = 28
            total = sum(assessment.responses.values())
            parts["assessment"] = _clamp((total / 28) * 100)
            if total >= 14:
                triggers.append({
                    "type": "bdd_clinical_threshold",
                    "weight": 0.45,
                    "description": "BDD questionnaire score exceeds clinical threshold",
                })
        else:
            parts["assessment"] = 20.0

        journal_score = 0.0
        if journal and journal.total_entries > 0:
            signal_rate = journal.bdd_signal_count / max(journal.total_entries, 1)
            journal_score = _clamp(signal_rate * 100)
            if journal.bdd_signal_count >= 3:
                triggers.append({
                    "type": "bdd_journal_signals",
                    "weight": 0.20,
                    "description": "Repeated body-image concerns detected in journals",
                })
        parts["journal_signals"] = journal_score

        mood_score = 0.0
        if mood:
            mood_score = _clamp(mood.avg_anxiety * 10)
        parts["mood_anxiety"] = mood_score

        wearable_score = 0.0
        if wearable:
            # Elevated stress as BDD proxy
            wearable_score = _clamp(wearable.avg_stress_index)
        parts["wearable_stress"] = wearable_score

        return _clamp(
            parts["assessment"] * self.BDD_WEIGHTS["assessment"]
            + parts["journal_signals"] * self.BDD_WEIGHTS["journal_signals"]
            + parts["mood_anxiety"] * self.BDD_WEIGHTS["mood_anxiety"]
            + parts["wearable_stress"] * self.BDD_WEIGHTS["wearable_stress"]
        )

    # ─────────────────────────────────────────
    # Sleep Score (higher = worse)
    # ─────────────────────────────────────────

    def _compute_sleep(
        self,
        wearable: Optional[WearableInput],
        triggers: list[dict],
    ) -> float:
        if not wearable:
            return 30.0
        hours = wearable.avg_sleep_hours
        # Optimal: 7-9h → score near 0; <5h → score near 90
        if hours >= 8:
            base = 5.0
        elif hours >= 7:
            base = 15.0
        elif hours >= 6:
            base = 35.0
        elif hours >= 5:
            base = 60.0
        else:
            base = 85.0
            triggers.append({
                "type": "severe_sleep_deficit",
                "weight": 0.20,
                "description": f"Critical sleep deficit: avg {hours:.1f}h/night",
            })

        # HRV penalty: low HRV indicates poor sleep quality
        hrv_penalty = _clamp((45 - wearable.avg_hrv) * 1.5, 0, 20)
        return _clamp(base + hrv_penalty)

    # ─────────────────────────────────────────
    # Stress Score
    # ─────────────────────────────────────────

    def _compute_stress(
        self,
        wearable: Optional[WearableInput],
        mood: Optional[MoodInput],
        triggers: list[dict],
    ) -> float:
        parts = []

        if wearable:
            parts.append(wearable.avg_stress_index)
            # Resting HR > 80 = elevated stress
            if wearable.avg_bpm > 80:
                parts.append(min((wearable.avg_bpm - 80) * 3, 30))
                triggers.append({
                    "type": "elevated_resting_hr",
                    "weight": 0.10,
                    "description": f"Elevated resting heart rate: {wearable.avg_bpm:.0f} bpm",
                })

        if mood:
            mood_stress = _clamp(mood.avg_anxiety * 10)
            parts.append(mood_stress)

        if not parts:
            return 25.0

        return _clamp(sum(parts) / len(parts))

    # ─────────────────────────────────────────
    # Helpers
    # ─────────────────────────────────────────

    def _tier(self, score: float) -> str:
        if score < 25:
            return "low"
        elif score < 50:
            return "moderate"
        elif score < 75:
            return "high"
        return "critical"

    def _compute_confidence(self, *sources) -> float:
        """More data sources → higher confidence."""
        present = sum(1 for s in sources if s is not None)
        total = len(sources)
        base = 0.60
        return _clamp(base + (present / total) * 0.40, 0.60, 0.98)
