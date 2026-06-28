"""
MindShield AI — Dedicated BDD Detection & Explainability Engine

Computes granular Body Dysmorphic Disorder sub-scores:
1. BDD Risk Score (Composite severity)
2. Appearance Anxiety
3. Self-Esteem
4. Social Comparison
5. Obsession Score
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class BDDInputPayload(BaseModel):
    preoccupation_hours: float = 0.0
    distress_level: float = 0.0          # 0 to 4 Likert
    avoidance_score: float = 0.0         # 0 to 4 Likert
    checking_frequency: float = 0.0      # 0 to 4 Likert
    comparison_frequency: float = 0.0    # 0 to 4 Likert
    impairment_score: float = 0.0        # 0 to 4 Likert
    journal_bdd_signals: int = 0
    mood_anxiety: float = 1.0            # 1 to 10
    wearable_stress: float = 20.0        # 0 to 100 HRV index
    social_comparison_mins: int = 0
    mirror_check_bouts: int = 0


class BDDSubscoreOutput(BaseModel):
    bdd_risk_score: float
    appearance_anxiety: float
    self_esteem: float
    social_comparison: float
    obsession_score: float
    risk_tier: str
    explainability: Dict[str, Any]


class BDDEngine:
    @classmethod
    def evaluate(cls, inputs: BDDInputPayload) -> BDDSubscoreOutput:
        # Normalize Likert scores (0-4) to 0-100 scale
        distress_100 = (min(inputs.distress_level, 4.0) / 4.0) * 100.0
        checking_100 = (min(inputs.checking_frequency, 4.0) / 4.0) * 100.0
        comp_q_100 = (min(inputs.comparison_frequency, 4.0) / 4.0) * 100.0
        impair_100 = (min(inputs.impairment_score, 4.0) / 4.0) * 100.0
        anxiety_100 = (min(inputs.mood_anxiety, 10.0) / 10.0) * 100.0

        # 1. Appearance Anxiety
        appearance_anxiety = (
            0.40 * distress_100 +
            0.30 * min(inputs.wearable_stress, 100.0) +
            0.30 * anxiety_100
        )

        # 2. Social Comparison Index
        social_mins_100 = min((inputs.social_comparison_mins / 120.0) * 100.0, 100.0)
        journal_tag_100 = min(inputs.journal_bdd_signals * 25.0, 100.0)
        social_comparison = (
            0.50 * social_mins_100 +
            0.30 * comp_q_100 +
            0.20 * journal_tag_100
        )

        # 3. Obsession Score
        preocc_100 = min((inputs.preoccupation_hours / 8.0) * 100.0, 100.0)
        mirror_100 = min((inputs.mirror_check_bouts / 10.0) * 100.0, 100.0)
        obsession_score = (
            0.50 * preocc_100 +
            0.30 * checking_100 +
            0.20 * mirror_100
        )

        # 4. Self-Esteem Score (Inverted relationship)
        negative_load = (0.40 * appearance_anxiety + 0.40 * social_comparison + 0.20 * impair_100)
        self_esteem = max(0.0, 100.0 - negative_load)

        # 5. Composite BDD Risk Score
        bdd_risk_score = (
            0.30 * obsession_score +
            0.25 * appearance_anxiety +
            0.25 * social_comparison +
            0.20 * (100.0 - self_esteem)
        )

        # Risk Tier
        if bdd_risk_score < 30.0:
            tier = "low"
        elif bdd_risk_score < 55.0:
            tier = "moderate"
        elif bdd_risk_score < 75.0:
            tier = "high"
        else:
            tier = "critical"

        # Explainability Breakdown
        explainability = {
            "summary": f"BDD Risk evaluated at {round(bdd_risk_score, 1)} ({tier.upper()}). Primary drivers identified across cognitive preoccupation and social comparison.",
            "top_drivers": [
                {"dimension": "Obsession & Checking", "contribution_pct": round(obsession_score * 0.30 / max(bdd_risk_score, 1) * 100, 1), "score": round(obsession_score, 1)},
                {"dimension": "Appearance Anxiety", "contribution_pct": round(appearance_anxiety * 0.25 / max(bdd_risk_score, 1) * 100, 1), "score": round(appearance_anxiety, 1)},
                {"dimension": "Social Peer Comparison", "contribution_pct": round(social_comparison * 0.25 / max(bdd_risk_score, 1) * 100, 1), "score": round(social_comparison, 1)},
                {"dimension": "Self-Esteem Deficit", "contribution_pct": round((100.0 - self_esteem) * 0.20 / max(bdd_risk_score, 1) * 100, 1), "score": round(self_esteem, 1)}
            ],
            "metrics_analyzed": {
                "preoccupation_hours": inputs.preoccupation_hours,
                "social_comparison_mins": inputs.social_comparison_mins,
                "mirror_check_bouts": inputs.mirror_check_bouts,
                "wearable_stress": inputs.wearable_stress
            }
        }

        return BDDSubscoreOutput(
            bdd_risk_score=round(bdd_risk_score, 2),
            appearance_anxiety=round(appearance_anxiety, 2),
            self_esteem=round(self_esteem, 2),
            social_comparison=round(social_comparison, 2),
            obsession_score=round(obsession_score, 2),
            risk_tier=tier,
            explainability=explainability
        )
