"""
MindShield AI — Dedicated Physiological Risk & Autonomic Recovery Engine

Computes hardware biometric sub-scores:
1. Physiological Distress Score (Composite autonomic overload)
2. Stress Index (Sympathetic dominance)
3. Recovery Index (Parasympathetic readiness)
4. Sleep Index (Restorative sleep architecture)
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class PhysiologicalInputPayload(BaseModel):
    heart_rate: float = 75.0             # Active BPM
    resting_heart_rate: float = 65.0     # Baseline RHR
    hrv: float = 45.0                    # RMSSD in ms
    sleep_duration: float = 7.5          # Hours
    sleep_quality: float = 75.0          # 0 to 100 efficiency
    stress: float = 35.0                 # Wearable galvanic stress index
    activity: int = 5000                 # Daily steps accumulation


class PhysiologicalOutput(BaseModel):
    physiological_distress_score: float
    stress_index: float
    recovery_index: float
    sleep_index: float
    risk_tier: str
    explainability: Dict[str, Any]


class PhysiologicalEngine:
    @classmethod
    def evaluate(cls, inputs: PhysiologicalInputPayload) -> PhysiologicalOutput:
        # 1. Sleep Index (0-100)
        dur_100 = min((inputs.sleep_duration / 8.0) * 100.0, 100.0)
        qual_100 = min(max(inputs.sleep_quality, 0.0), 100.0)
        sleep_index = 0.60 * dur_100 + 0.40 * qual_100

        # 2. Stress Index (0-100)
        wearable_str = min(max(inputs.stress, 0.0), 100.0)
        active_hr_pen = min(max((inputs.heart_rate - 80.0) * 2.5, 0.0), 100.0)
        rhr_pen = min(max((inputs.resting_heart_rate - 65.0) * 4.0, 0.0), 100.0)
        stress_index = min(0.50 * wearable_str + 0.30 * active_hr_pen + 0.20 * rhr_pen, 100.0)

        # 3. Recovery Index (0-100)
        hrv_score = min((inputs.hrv / 60.0) * 100.0, 100.0)
        rhr_efficiency = max(0.0, 100.0 - (max(inputs.resting_heart_rate - 55.0, 0.0) / 30.0) * 100.0)
        recovery_index = min(max(0.40 * hrv_score + 0.40 * sleep_index + 0.20 * rhr_efficiency, 0.0), 100.0)

        # 4. Physiological Distress Score (0-100)
        # Higher distress = high stress + low recovery + low sleep
        distress_score = min(max(
            0.45 * stress_index +
            0.35 * (100.0 - recovery_index) +
            0.20 * (100.0 - sleep_index),
            0.0
        ), 100.0)

        # Assign Risk Tier
        if distress_score < 30.0:
            tier = "low"
        elif distress_score < 55.0:
            tier = "moderate"
        elif distress_score < 75.0:
            tier = "high"
        else:
            tier = "critical"

        # Explainability Breakdown
        explainability = {
            "summary": f"Physiological Distress evaluated at {round(distress_score, 1)} ({tier.upper()}). Autonomic balance reflects sympathetic load against parasympathetic recovery.",
            "top_drivers": [
                {"biometric": "Sympathetic Stress Index", "contribution_pct": round(stress_index * 0.45 / max(distress_score, 1) * 100, 1), "value": f"{round(stress_index, 1)} pts", "status": "warning" if stress_index > 65 else "normal"},
                {"biometric": "Autonomic Recovery Deficit", "contribution_pct": round((100.0 - recovery_index) * 0.35 / max(distress_score, 1) * 100, 1), "value": f"{round(recovery_index, 1)}/100 readiness", "status": "warning" if recovery_index < 45 else "normal"},
                {"biometric": "Restorative Sleep Deficit", "contribution_pct": round((100.0 - sleep_index) * 0.20 / max(distress_score, 1) * 100, 1), "value": f"{round(inputs.sleep_duration, 1)}h ({round(inputs.sleep_quality, 0)}% qual)", "status": "warning" if sleep_index < 50 else "normal"}
            ],
            "raw_metrics": {
                "heart_rate": inputs.heart_rate,
                "resting_heart_rate": inputs.resting_heart_rate,
                "hrv": inputs.hrv,
                "activity_steps": inputs.activity
            }
        }

        return PhysiologicalOutput(
            physiological_distress_score=round(distress_score, 2),
            stress_index=round(stress_index, 2),
            recovery_index=round(recovery_index, 2),
            sleep_index=round(sleep_index, 2),
            risk_tier=tier,
            explainability=explainability
        )
