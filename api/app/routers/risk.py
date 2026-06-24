"""Risk scoring router."""
from fastapi import APIRouter, HTTPException, Header
from app.database import get_supabase
from app.services.risk_engine import (
    RiskScoringEngine, AssessmentInput, GamingInput,
    WearableInput, JournalInput, MoodInput
)
from app.services.ai_service import ai_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
engine = RiskScoringEngine()


def _get_user_id(token: str) -> str:
    sb = get_supabase()
    try:
        return sb.auth.get_user(token).user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/risk/current")
async def get_current_risk(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    result = (
        sb.table("risk_scores")
        .select("*")
        .eq("user_id", user_id)
        .order("computed_at", desc=True)
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="No risk scores yet. Complete onboarding.")
    return result.data[0]


@router.get("/risk/history")
async def get_risk_history(
    authorization: str = Header(...),
    days: int = 14,
):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    result = (
        sb.table("risk_scores")
        .select("computed_at,igd_score,bdd_score,sleep_score,stress_score,composite_score,risk_tier")
        .eq("user_id", user_id)
        .order("computed_at", desc=True)
        .limit(days)
        .execute()
    )

    return list(reversed(result.data or []))


@router.post("/risk/recalculate")
async def recalculate_risk(authorization: str = Header(...)):
    """Trigger full risk recalculation from all data sources."""
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    # Gather all data sources
    igd_assessment = None
    bdd_assessment = None
    gaming_input = None
    wearable_input = None
    journal_input = None
    mood_input = None

    # Latest IGD assessment
    igd_res = sb.table("assessments").select("*").eq("user_id", user_id).eq("type", "IGD").order("created_at", desc=True).limit(1).execute()
    if igd_res.data:
        igd_assessment = AssessmentInput(type="IGD", responses=igd_res.data[0]["responses"], raw_score=igd_res.data[0]["raw_score"])

    # Latest BDD assessment
    bdd_res = sb.table("assessments").select("*").eq("user_id", user_id).eq("type", "BDD").order("created_at", desc=True).limit(1).execute()
    if bdd_res.data:
        bdd_assessment = AssessmentInput(type="BDD", responses=bdd_res.data[0]["responses"], raw_score=bdd_res.data[0]["raw_score"])

    # Gaming sessions (last 7 days)
    gaming_res = sb.table("gaming_sessions").select("*").eq("user_id", user_id).order("started_at", desc=True).limit(20).execute()
    if gaming_res.data:
        sessions = gaming_res.data
        total_mins = sum(s.get("duration_mins", 0) for s in sessions)
        days = max(len(set(s["started_at"][:10] for s in sessions)), 1)
        gaming_input = GamingInput(
            sessions_last_7d=sessions,
            avg_daily_hours=total_mins / days / 60,
            skipped_meals_count=sum(1 for s in sessions if s.get("skipped_meals")),
            skipped_sleep_count=sum(1 for s in sessions if s.get("skipped_sleep")),
            avg_mood_delta=sum((s.get("mood_after", 5) - s.get("mood_before", 5)) for s in sessions) / len(sessions),
        )

    # Latest wearable data
    wear_res = sb.table("wearable_data").select("*").eq("user_id", user_id).order("recorded_at", desc=True).limit(7).execute()
    if wear_res.data:
        w = wear_res.data
        wearable_input = WearableInput(
            avg_sleep_hours=sum(x.get("sleep_hours", 7) for x in w) / len(w),
            avg_hrv=sum(x.get("hrv_ms", 45) for x in w) / len(w),
            avg_stress_index=sum(x.get("stress_index", 25) for x in w) / len(w),
            avg_bpm=sum(x.get("heart_rate_bpm", 66) for x in w) / len(w),
        )

    # Journal signals
    j_res = sb.table("journal_entries").select("igd_signal_count,bdd_signal_count,mood_tag").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
    if j_res.data:
        j = j_res.data
        journal_input = JournalInput(
            igd_signal_count=sum(x.get("risk_signals", {}).get("igd_signal_count", 0) if isinstance(x.get("risk_signals"), dict) else 0 for x in j),
            bdd_signal_count=sum(x.get("risk_signals", {}).get("bdd_signal_count", 0) if isinstance(x.get("risk_signals"), dict) else 0 for x in j),
            negative_entries=sum(1 for x in j if x.get("mood_tag") in ["negative", "distressed"]),
            total_entries=len(j),
        )

    # Mood check-ins
    m_res = sb.table("mood_checkins").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(7).execute()
    if m_res.data:
        m = m_res.data
        mood_input = MoodInput(
            avg_mood=sum(x.get("mood_score", 5) for x in m) / len(m),
            avg_anxiety=sum(x.get("anxiety", 3) for x in m) / len(m),
            avg_social_urge=sum(x.get("social_urge", 5) for x in m) / len(m),
            consecutive_negative=0,
        )

    # Compute
    components = engine.compute(
        igd_assessment=igd_assessment,
        bdd_assessment=bdd_assessment,
        gaming=gaming_input,
        wearable=wearable_input,
        journal=journal_input,
        mood=mood_input,
    )

    # Get previous score for delta
    prev_res = sb.table("risk_scores").select("composite_score").eq("user_id", user_id).order("computed_at", desc=True).limit(1).execute()
    delta_24h = None
    if prev_res.data:
        delta_24h = round(components.composite_score - prev_res.data[0]["composite_score"], 2)

    # Generate AI explanation
    ai_explanation = await ai_service.explain_risk(
        components.igd_score, components.bdd_score,
        components.sleep_score, components.stress_score,
        components.composite_score, components.triggers, delta_24h
    )

    # Store
    insert_data = {
        "user_id": user_id,
        "igd_score": components.igd_score,
        "bdd_score": components.bdd_score,
        "sleep_score": components.sleep_score,
        "stress_score": components.stress_score,
        "composite_score": components.composite_score,
        "risk_tier": components.risk_tier,
        "delta_24h": delta_24h,
        "triggers": components.triggers,
        "ai_explanation": ai_explanation,
        "confidence": components.confidence,
    }
    result = sb.table("risk_scores").insert(insert_data).execute()

    # Update profile risk tier
    sb.table("profiles").update({"risk_tier": components.risk_tier}).eq("id", user_id).execute()

    return result.data[0]
