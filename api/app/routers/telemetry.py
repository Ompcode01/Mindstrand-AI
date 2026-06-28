"""Telemetry REST endpoints — snapshot, history, settings."""
from fastapi import APIRouter, Header
from app.services.telemetry_engine import (
    snapshot, settings, history_buffer, last_ai_analysis,
    TelemetrySettings
)
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/telemetry/snapshot")
async def get_snapshot():
    """Current full telemetry snapshot."""
    s = snapshot
    return {
        "timestamp": s.timestamp,
        "session": {
            "active": s.is_gaming,
            "active_game": s.active_game_name,
            "active_title": s.active_title[:80],
            "active_exe": s.active_exe,
            "duration_sec": s.session_duration_sec,
            "daily_play_sec": s.daily_play_sec,
            "continuous_streak_sec": s.continuous_streak_sec,
        },
        "input": {
            "keypresses": s.total_keypresses,
            "keypress_rate": s.keypress_rate,
            "clicks": s.total_clicks,
            "click_rate": s.click_rate,
            "alt_tabs": s.alt_tab_count,
            "window_switches": s.window_switches,
            "idle_sec": s.idle_duration_sec,
        },
        "biometrics": {
            "heart_rate": s.heart_rate,
            "hrv": s.hrv,
            "stress_index": s.stress_index,
            "recovery_score": s.recovery_score,
            "sleep_score": s.sleep_score,
            "fatigue_score": s.fatigue_score,
            "cortisol_proxy": s.cortisol_proxy,
            "autonomic_load": s.autonomic_load,
        },
        "behavioral_scores": {
            "attention_fragmentation": s.attention_fragmentation_score,
            "compulsive_engagement": s.compulsive_engagement_score,
            "reward_seeking": s.reward_seeking_score,
            "cognitive_fatigue": s.cognitive_fatigue_score,
            "emotional_dependency": s.emotional_dependency_score,
            "self_regulation": s.self_regulation_score,
            "impulsivity": s.impulsivity_score,
            "gaming_escalation": s.gaming_escalation_score,
            "burnout_probability": s.burnout_probability,
            "behavioral_velocity": s.behavioral_velocity,
        },
        "risk": {
            "composite": s.composite_risk,
            "igd_contribution": s.igd_contribution,
        }
    }


@router.get("/telemetry/session")
async def get_session():
    """Current gaming session info."""
    s = snapshot
    return {
        "is_gaming": s.is_gaming,
        "active_game": s.active_game_name,
        "session_start": s.session_start,
        "session_duration_sec": s.session_duration_sec,
        "daily_play_sec": s.daily_play_sec,
        "continuous_streak_sec": s.continuous_streak_sec,
        "pause_count": s.pause_count,
    }


@router.get("/telemetry/biometrics")
async def get_biometrics():
    """Current simulated biometric readings."""
    s = snapshot
    return {
        "heart_rate": s.heart_rate,
        "hrv": s.hrv,
        "stress_index": s.stress_index,
        "recovery_score": s.recovery_score,
        "sleep_score": s.sleep_score,
        "fatigue_score": s.fatigue_score,
        "cortisol_proxy": s.cortisol_proxy,
        "autonomic_load": s.autonomic_load,
        "source": "simulated_realtime",
    }


@router.get("/telemetry/behavioral_scores")
async def get_behavioral_scores():
    """10 inferred behavioral/psychological signals."""
    s = snapshot
    return {
        "attention_fragmentation_score": s.attention_fragmentation_score,
        "compulsive_engagement_score": s.compulsive_engagement_score,
        "reward_seeking_score": s.reward_seeking_score,
        "cognitive_fatigue_score": s.cognitive_fatigue_score,
        "emotional_dependency_score": s.emotional_dependency_score,
        "self_regulation_score": s.self_regulation_score,
        "impulsivity_score": s.impulsivity_score,
        "gaming_escalation_score": s.gaming_escalation_score,
        "burnout_probability": s.burnout_probability,
        "behavioral_velocity": s.behavioral_velocity,
    }


@router.get("/telemetry/history")
async def get_history():
    """Rolling 60-point telemetry history buffer."""
    return {"points": history_buffer, "count": len(history_buffer)}


@router.get("/telemetry/ai_analysis")
async def get_ai_analysis():
    """Latest Gemini AI analysis."""
    if last_ai_analysis:
        return last_ai_analysis
    return {
        "status": "pending",
        "message": "AI analysis generates every 2 minutes. Check back shortly."
    }


@router.get("/settings")
async def get_settings():
    """Get current telemetry and system settings."""
    return settings.__dict__


@router.post("/settings")
async def update_settings(new_settings: dict):
    """Update telemetry settings at runtime."""
    for key, val in new_settings.items():
        if hasattr(settings, key):
            setattr(settings, key, val)
    logger.info(f"Settings updated: {list(new_settings.keys())}")
    return {"status": "ok", "updated": list(new_settings.keys())}
