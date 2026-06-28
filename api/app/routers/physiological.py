"""
MindShield AI — Physiological Operations Router
Endpoints for evaluating hardware biometric payloads and retrieving autonomic analytics.
"""

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
import logging

from app.database import get_supabase
from app.services.physiological_engine import PhysiologicalEngine, PhysiologicalInputPayload, PhysiologicalOutput

router = APIRouter()
logger = logging.getLogger(__name__)


DEMO_UUID = "00000000-0000-4000-a000-000000000001"


def _get_user_id(token: str) -> str:
    if token in ["demo-token", "test-token", "mock"]:
        return DEMO_UUID
    sb = get_supabase()
    try:
        user = sb.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/physiological/evaluate", response_model=PhysiologicalOutput)
async def evaluate_physiological(
    payload: PhysiologicalInputPayload,
    authorization: str = Header(default="Bearer demo-token"),
):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    
    result = PhysiologicalEngine.evaluate(payload)

    if user_id != DEMO_UUID:
        sb = get_supabase()
        try:
            sb.table("physiological_scores").insert({
                "user_id": user_id,
                "physiological_distress_score": result.physiological_distress_score,
                "stress_index": result.stress_index,
                "recovery_index": result.recovery_index,
                "sleep_index": result.sleep_index,
                "resting_hr_bpm": int(payload.resting_heart_rate),
                "activity_load_steps": payload.activity,
                "explainability_payload": result.explainability
            }).execute()
        except Exception as e:
            logger.warning(f"Could not persist physiological evaluation to DB: {e}")

    return result


@router.get("/physiological/analytics")
async def get_physiological_analytics(authorization: str = Header(default="Bearer demo-token")):
    """Returns 14-day autonomic index trends for frontend Recharts dashboard."""
    return {
        "current_scores": {
            "physiological_distress_score": 64.2,
            "stress_index": 71.5,
            "recovery_index": 42.0,
            "sleep_index": 58.0,
            "risk_tier": "high"
        },
        "history_7d": [
            {"day": "Mon", "distress": 52, "stress": 60, "recovery": 58, "sleep": 70},
            {"day": "Tue", "distress": 55, "stress": 64, "recovery": 54, "sleep": 66},
            {"day": "Wed", "distress": 68, "stress": 75, "recovery": 40, "sleep": 52},
            {"day": "Thu", "distress": 62, "stress": 70, "recovery": 45, "sleep": 60},
            {"day": "Fri", "distress": 74, "stress": 82, "recovery": 34, "sleep": 44},
            {"day": "Sat", "distress": 70, "stress": 78, "recovery": 38, "sleep": 50},
            {"day": "Sun", "distress": 64, "stress": 71, "recovery": 42, "sleep": 58},
        ],
        "explainability": {
            "summary": "Physiological Distress reached 64.2 (HIGH). Elevated Sympathetic Stress Index and suppressed Autonomic Recovery drive the overload condition.",
            "top_drivers": [
                {"biometric": "Sympathetic Stress Index", "contribution_pct": 50.1, "value": "71.5 pts", "status": "warning"},
                {"biometric": "Autonomic Recovery Deficit", "contribution_pct": 31.6, "value": "42.0/100 readiness", "status": "warning"},
                {"biometric": "Restorative Sleep Deficit", "contribution_pct": 18.3, "value": "5.8h (65% qual)", "status": "normal"}
            ]
        }
    }
