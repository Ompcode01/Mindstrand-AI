"""
MindShield AI — Temporal Prediction Engine

Forecasts 14-day continuous composite risk trajectories using linear/exponential
velocity momentum across gaming acceleration, sleep deficits, and HRV decay.
"""

from pydantic import BaseModel
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class PredictionInputPayload(BaseModel):
    current_risk: float = 72.0
    gaming_daily_slope_hrs: float = 0.35      # Acceleration: +0.35h per day
    sleep_daily_slope_hrs: float = -0.20      # Decay: -0.20h sleep per day
    hrv_daily_slope_ms: float = -1.2          # Autonomic decay: -1.2ms per day


class PredictionOutput(BaseModel):
    current_risk: float
    predicted_risk_14d: float
    velocity_slope: float
    horizon: str
    trajectory_series: List[Dict[str, Any]]
    primary_drivers: List[Dict[str, Any]]
    explainability_summary: str


class TemporalPredictionEngine:
    @classmethod
    def evaluate(cls, inputs: PredictionInputPayload) -> PredictionOutput:
        trajectory = []
        curr = inputs.current_risk
        
        # Calculate compound daily velocity impact
        # Gaming slope (+1h/day adds +3 pts/day risk)
        # Sleep slope (-1h/day adds +4 pts/day risk)
        # HRV slope (-1ms/day adds +0.8 pts/day risk)
        daily_velocity = (
            inputs.gaming_daily_slope_hrs * 3.0 +
            abs(min(inputs.sleep_daily_slope_hrs, 0.0)) * 4.0 +
            abs(min(inputs.hrv_daily_slope_ms, 0.0)) * 0.8
        )

        for day in range(1, 15):
            curr = min(max(curr + daily_velocity, 0.0), 100.0)
            trajectory.append({
                "day": f"Day +{day}",
                "predicted_risk": round(curr, 1),
                "confidence_upper": round(min(curr + day * 0.8, 100.0), 1),
                "confidence_lower": round(max(curr - day * 0.8, 0.0), 1)
            })

        predicted_14d = round(curr, 1)

        drivers = [
            {"factor": "Recreational Gaming Acceleration", "velocity": f"{'+' if inputs.gaming_daily_slope_hrs > 0 else ''}{inputs.gaming_daily_slope_hrs}h / day", "projected_14d_impact": f"+{round(inputs.gaming_daily_slope_hrs * 3.0 * 14, 1)} pts", "severity": "critical" if inputs.gaming_daily_slope_hrs > 0.2 else "moderate"},
            {"factor": "Restorative Sleep Degradation", "velocity": f"{inputs.sleep_daily_slope_hrs}h / night", "projected_14d_impact": f"+{round(abs(min(inputs.sleep_daily_slope_hrs, 0.0)) * 4.0 * 14, 1)} pts", "severity": "critical" if inputs.sleep_daily_slope_hrs < -0.1 else "normal"},
            {"factor": "Autonomic HRV Suppression", "velocity": f"{inputs.hrv_daily_slope_ms}ms / day", "projected_14d_impact": f"+{round(abs(min(inputs.hrv_daily_slope_ms, 0.0)) * 0.8 * 14, 1)} pts", "severity": "warning" if inputs.hrv_daily_slope_ms < -0.5 else "normal"}
        ]

        summary = f"Current Risk ({inputs.current_risk}) is projected to reach {predicted_14d} within 14 days due to compounding behavioral momentum (+{round(daily_velocity, 2)} pts/day velocity)."

        return PredictionOutput(
            current_risk=inputs.current_risk,
            predicted_risk_14d=predicted_14d,
            velocity_slope=round(daily_velocity, 2),
            horizon="within 14 days",
            trajectory_series=trajectory,
            primary_drivers=drivers,
            explainability_summary=summary
        )
