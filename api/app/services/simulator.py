"""
MindShield AI — Wearable Data Simulator

Generates realistic biometric time series correlated with user risk state.
Higher risk users see worse biometric profiles (lower HRV, higher BPM, less sleep).
"""

from __future__ import annotations
import random
import math
from datetime import datetime, timezone
from dataclasses import dataclass


@dataclass
class RiskContext:
    igd_score: float = 30.0
    bdd_score: float = 20.0
    sleep_score: float = 30.0
    stress_score: float = 25.0
    composite_score: float = 26.0


class WearableSimulator:
    """
    Generates realistic biometric snapshots and 7-day time series.
    Values are modulated by the user's current risk profile.
    """

    # Healthy baseline ranges
    BASE_BPM = 66
    BASE_HRV = 48.0       # ms — higher is healthier
    BASE_SLEEP = 7.5      # hours
    BASE_STRESS = 22.0    # 0-100
    BASE_SKIN_TEMP = 36.6 # Celsius

    def generate_snapshot(self, risk: RiskContext) -> dict:
        """Generate a single biometric snapshot."""
        stress_factor = risk.stress_score / 100
        igd_factor = risk.igd_score / 100

        # Heart rate: elevated by stress
        bpm = self.BASE_BPM + (stress_factor * 24) + random.gauss(0, 3)

        # HRV: reduced by stress (inverse relationship)
        hrv = self.BASE_HRV - (stress_factor * 22) + random.gauss(0, 1.5)
        hrv = max(hrv, 15.0)

        # Sleep: reduced by IGD (gaming late) and stress
        sleep = self.BASE_SLEEP - (igd_factor * 2.8) - (stress_factor * 0.8)
        sleep = max(sleep, 2.5) + random.gauss(0, 0.3)

        # Sleep quality: correlated with hours and stress
        sleep_quality = self._sleep_quality(sleep, stress_factor)

        # Steps: reduced by high gaming (sedentary)
        base_steps = 7500 - int(igd_factor * 4000)
        steps = max(1000, base_steps + random.randint(-1500, 2000))

        # Stress index: direct from stress + BPM contribution
        stress_idx = self.BASE_STRESS + (stress_factor * 55) + random.gauss(0, 3)

        # Skin temp: slightly elevated with high stress
        skin_temp = self.BASE_SKIN_TEMP + (stress_factor * 0.4) + random.gauss(0, 0.1)

        return {
            "heart_rate_bpm": round(bpm),
            "hrv_ms": round(hrv, 1),
            "sleep_hours": round(max(2.5, sleep), 1),
            "sleep_quality": sleep_quality,
            "steps": steps,
            "stress_index": round(min(100, max(0, stress_idx)), 1),
            "skin_temp_c": round(skin_temp, 2),
            "source": "simulated",
            "recorded_at": datetime.now(timezone.utc).isoformat(),
        }

    def generate_7day_series(self, risk: RiskContext) -> list[dict]:
        """
        Generate 7 days of historical wearable data with realistic variation.
        Data shows a worsening trend consistent with rising risk scores.
        """
        series = []
        from datetime import timedelta

        today = datetime.now(timezone.utc)

        for days_ago in range(6, -1, -1):
            # Earlier days have slightly better numbers (trend worsening)
            trend_factor = (6 - days_ago) / 6  # 0.0 → 1.0 as we approach today

            # Modify risk context to show degradation
            day_risk = RiskContext(
                igd_score=risk.igd_score * (0.70 + trend_factor * 0.30),
                bdd_score=risk.bdd_score * (0.75 + trend_factor * 0.25),
                sleep_score=risk.sleep_score * (0.65 + trend_factor * 0.35),
                stress_score=risk.stress_score * (0.70 + trend_factor * 0.30),
                composite_score=risk.composite_score * (0.70 + trend_factor * 0.30),
            )

            snapshot = self.generate_snapshot(day_risk)
            snapshot["recorded_at"] = (today - timedelta(days=days_ago)).isoformat()
            snapshot["day_label"] = (today - timedelta(days=days_ago)).strftime("%a")
            series.append(snapshot)

        return series

    def generate_spike_event(self, risk: RiskContext) -> dict:
        """Simulate a stress spike event for WebSocket demo."""
        snapshot = self.generate_snapshot(risk)
        # Add artificial spike
        snapshot["heart_rate_bpm"] += random.randint(15, 30)
        snapshot["stress_index"] = min(100, snapshot["stress_index"] + random.uniform(15, 25))
        snapshot["hrv_ms"] = max(15, snapshot["hrv_ms"] - random.uniform(8, 15))
        snapshot["is_spike"] = True
        return snapshot

    # ─────────────────────────────────────────
    # Helpers
    # ─────────────────────────────────────────

    def _sleep_quality(self, sleep_hours: float, stress_factor: float) -> int:
        """Compute sleep quality score 1-10."""
        if sleep_hours >= 8:
            base = 9
        elif sleep_hours >= 7:
            base = 7
        elif sleep_hours >= 6:
            base = 5
        elif sleep_hours >= 5:
            base = 3
        else:
            base = 2

        penalty = int(stress_factor * 3)
        return max(1, min(10, base - penalty + random.randint(-1, 1)))


# Singleton
wearable_simulator = WearableSimulator()
