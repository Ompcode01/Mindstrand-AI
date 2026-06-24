"""Assessments router."""
from fastapi import APIRouter, HTTPException, Header
from app.database import get_supabase
from app.models.schemas import AssessmentSubmit, AssessmentResponse
from app.services.ai_service import ai_service
from app.services.risk_engine import RiskScoringEngine, AssessmentInput
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
engine = RiskScoringEngine()


def _score_igd(responses: dict) -> tuple[float, str]:
    criteria_met = sum(1 for v in responses.values() if v >= 3)
    raw = criteria_met / 9 * 100
    if criteria_met < 2:
        level = "minimal"
    elif criteria_met < 4:
        level = "mild"
    elif criteria_met < 6:
        level = "moderate"
    else:
        level = "severe"
    return round(raw, 2), level


def _score_bdd(responses: dict) -> tuple[float, str]:
    total = sum(responses.values())
    raw = total / 28 * 100
    if raw < 25:
        level = "minimal"
    elif raw < 50:
        level = "mild"
    elif raw < 75:
        level = "moderate"
    else:
        level = "severe"
    return round(raw, 2), level


def _get_user_id(token: str) -> str:
    sb = get_supabase()
    try:
        user = sb.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/assessments/submit")
async def submit_assessment(
    data: AssessmentSubmit,
    authorization: str = Header(...),
):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    if data.type.value == "IGD":
        raw_score, risk_level = _score_igd(data.responses)
    elif data.type.value == "BDD":
        raw_score, risk_level = _score_bdd(data.responses)
    else:
        raw_score, risk_level = 0.0, "minimal"

    # Generate AI summary
    ai_summary = await ai_service.analyze_assessment(
        data.type.value, data.responses, raw_score, risk_level
    )

    result = sb.table("assessments").insert({
        "user_id": user_id,
        "type": data.type.value,
        "responses": data.responses,
        "raw_score": raw_score,
        "risk_level": risk_level,
        "ai_summary": ai_summary,
    }).execute()

    return result.data[0]


@router.get("/assessments/{assessment_type}")
async def get_assessment(
    assessment_type: str,
    authorization: str = Header(...),
):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    result = (
        sb.table("assessments")
        .select("*")
        .eq("user_id", user_id)
        .eq("type", assessment_type.upper())
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return result.data[0]
