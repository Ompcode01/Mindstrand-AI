"""
MindShield AI — Wellness Fusion Engine (MINDSTRAND SCORE)

Fuses behavioral, psychological, and physiological risk streams into a single
positive holistic vitality metric: the MINDSTRAND SCORE (0-100).
"""

from pydantic import BaseModel
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class FusionInputPayload(BaseModel):
    igd_score: float = 30.0               # Gaming risk (0-100)
    bdd_score: float = 25.0               # Dysmorphia risk (0-100)
    physiological_score: float = 35.0     # Physio distress risk (0-100)
    mood_score: float = 7.5               # Check-in vitality (1-10)
    sleep_score: float = 78.0             # Restorative sleep index (0-100)


class FusionOutput(BaseModel):
    mindstrand_score: float
    igd_vitality: float
    bdd_vitality: float
    physio_vitality: float
    mood_vitality: float
    sleep_vitality: float
    bottleneck_drag: float
    tier: str
    explainability: Dict[str, Any]


class WellnessFusionEngine:
    @classmethod
    def evaluate(cls, inputs: FusionInputPayload) -> FusionOutput:
        # 1. Map all inputs to 0-100 Positive Vitality Scale
        v_igd = min(max(100.0 - inputs.igd_score, 0.0), 100.0)
        v_bdd = min(max(100.0 - inputs.bdd_score, 0.0), 100.0)
        v_physio = min(max(100.0 - inputs.physiological_score, 0.0), 100.0)
        v_mood = min(max(inputs.mood_score * 10.0 if inputs.mood_score <= 10.0 else inputs.mood_score, 0.0), 100.0)
        v_sleep = min(max(inputs.sleep_score, 0.0), 100.0)

        vitalities = {
            "IGD Gaming Vitality": v_igd,
            "BDD Body Image Vitality": v_bdd,
            "Physiological Recovery": v_physio,
            "Psychological Mood": v_mood,
            "Restorative Sleep": v_sleep
        }

        # 2. Weighted Harmonic Combination
        # Weights: IGD (25%), BDD (20%), Physio (25%), Mood (15%), Sleep (15%)
        base_fusion = (
            0.25 * v_igd +
            0.20 * v_bdd +
            0.25 * v_physio +
            0.15 * v_mood +
            0.15 * v_sleep
        )

        # 3. Systemic Bottleneck Penalty (Drag calculation)
        # If any single domain drops below 40 vitality, apply systemic drag
        drag = 0.0
        bottlenecks = []
        for name, val in vitalities.items():
            if val < 40.0:
                deficit = (40.0 - val) * 0.45
                drag += deficit
                bottlenecks.append({"domain": name, "vitality": round(val, 1), "drag": round(deficit, 1)})

        mindstrand_score = min(max(base_fusion - drag, 0.0), 100.0)

        # Assign Tier
        if mindstrand_score >= 80.0:
            tier = "thriving"
        elif mindstrand_score >= 65.0:
            tier = "stable"
        elif mindstrand_score >= 50.0:
            tier = "monitoring"
        else:
            tier = "systemic_drag"

        # Explainability & SHAP Waterfall Drivers
        drivers = [
            {"vector": "Physiological Recovery", "vitality": round(v_physio, 1), "weight_impact": round(0.25 * v_physio, 1), "status": "positive" if v_physio >= 60 else "negative"},
            {"vector": "IGD Gaming Vitality", "vitality": round(v_igd, 1), "weight_impact": round(0.25 * v_igd, 1), "status": "positive" if v_igd >= 60 else "negative"},
            {"vector": "BDD Body Image Vitality", "vitality": round(v_bdd, 1), "weight_impact": round(0.20 * v_bdd, 1), "status": "positive" if v_bdd >= 60 else "negative"},
            {"vector": "Restorative Sleep", "vitality": round(v_sleep, 1), "weight_impact": round(0.15 * v_sleep, 1), "status": "positive" if v_sleep >= 60 else "negative"},
            {"vector": "Psychological Mood", "vitality": round(v_mood, 1), "weight_impact": round(0.15 * v_mood, 1), "status": "positive" if v_mood >= 60 else "negative"},
        ]

        if drag > 0:
            drivers.append({"vector": "Systemic Bottleneck Drag", "vitality": round(-drag, 1), "weight_impact": round(-drag, 1), "status": "critical_drag"})

        summary = f"MINDSTRAND SCORE evaluated at {round(mindstrand_score, 1)} ({tier.upper()}). Fused vitality baseline indicates balanced physiological and behavioral resilience."
        if bottlenecks:
            b_names = ", ".join(b["domain"] for b in bottlenecks)
            summary = f"MINDSTRAND SCORE evaluated at {round(mindstrand_score, 1)} ({tier.upper()}). Systemic drag exerted by acute bottlenecks in: {b_names}."

        explainability = {
            "summary": summary,
            "drivers": drivers,
            "bottlenecks": bottlenecks,
            "coaching_advice": "Maintain structured device off-times at 11:00 PM to protect sleep vitality and eliminate nocturnal BDD comparison checking."
        }

        return FusionOutput(
            mindstrand_score=round(mindstrand_score, 2),
            igd_vitality=round(v_igd, 2),
            bdd_vitality=round(v_bdd, 2),
            physio_vitality=round(v_physio, 2),
            mood_vitality=round(v_mood, 2),
            sleep_vitality=round(v_sleep, 2),
            bottleneck_drag=round(drag, 2),
            tier=tier,
            explainability=explainability
        )
