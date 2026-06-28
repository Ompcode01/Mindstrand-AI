"""Insights router with streaming Gemini weekly summary."""
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from app.database import get_supabase
from app.services.ai_service import ai_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


DEMO_UUID = "00000000-0000-4000-a000-000000000001"
MOCK_EVENTS = [
    {
        "id": "55555555-5555-4555-a555-555555555555",
        "user_id": DEMO_UUID,
        "event_type": "gaming_surge",
        "severity": "critical",
        "description": "Continuous gaming duration exceeded 3.5 hours past midnight.",
        "created_at": "2026-06-29T01:30:00Z"
    },
    {
        "id": "66666666-6666-4666-a666-666666666666",
        "user_id": DEMO_UUID,
        "event_type": "hrv_drop",
        "severity": "warning",
        "description": "Autonomic HRV suppressed by >15% below baseline during sleep.",
        "created_at": "2026-06-29T04:15:00Z"
    }
]


def _get_user_id(token: str) -> str:
    if token in ["demo-token", "test-token", "mock"]:
        return DEMO_UUID
    sb = get_supabase()
    try:
        return sb.auth.get_user(token).user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/insights/summary")
async def stream_insights_summary(authorization: str = Header(...)):
    """Stream weekly behavioral insights from Gemini."""
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    if user_id == DEMO_UUID:
        async def mock_stream():
            yield "MINDSHIELD AI WEEKLY TELEMETRY BRIEF:\n\n1. Gaming Acceleration: Observed 2.5h daily increase in late-night gaming sessions.\n2. Autonomic Recovery: HRV suppressed by 12% below 30-day baseline.\n3. Intervention Recommendation: Engage 10:30 PM screen cutoff to restore circadian stability."
        return StreamingResponse(mock_stream(), media_type="text/plain")
    sb = get_supabase()

    # Gather summary data
    risk_res = sb.table("risk_scores").select("*").eq("user_id", user_id).order("computed_at", desc=True).limit(7).execute()
    mood_res = sb.table("mood_checkins").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(7).execute()
    gaming_res = sb.table("gaming_sessions").select("game_name,duration_mins,mood_before,mood_after").eq("user_id", user_id).order("started_at", desc=True).limit(10).execute()
    journal_res = sb.table("journal_entries").select("mood_tag,ai_tags,sentiment_score").eq("user_id", user_id).order("created_at", desc=True).limit(7).execute()

    risk_data = risk_res.data or []
    mood_data = mood_res.data or []
    gaming_data = gaming_res.data or []
    journal_data = journal_res.data or []

    summary_data = {
        "risk_trend": [{"composite": r.get("composite_score"), "date": r.get("computed_at")} for r in risk_data],
        "avg_composite_score": round(sum(r.get("composite_score", 0) for r in risk_data) / max(len(risk_data), 1), 1),
        "mood_trend": [{"score": m.get("mood_score"), "anxiety": m.get("anxiety")} for m in mood_data],
        "gaming_sessions": len(gaming_data),
        "total_gaming_hours": round(sum(g.get("duration_mins", 0) for g in gaming_data) / 60, 1),
        "journal_sentiment": round(sum(j.get("sentiment_score", 0) or 0 for j in journal_data) / max(len(journal_data), 1), 3),
        "journal_mood_tags": [j.get("mood_tag") for j in journal_data],
        "ai_tags_all": [tag for j in journal_data for tag in (j.get("ai_tags") or [])],
    }

    async def event_stream():
        async for chunk in ai_service.stream_weekly_insights(summary_data):
            yield chunk

    return StreamingResponse(event_stream(), media_type="text/plain")


@router.get("/insights/trends")
async def get_trends(authorization: str = Header(...)):
    """Multi-dimensional trend data for charts."""
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    if user_id == DEMO_UUID:
        return {
            "risk_history": [{"computed_at": f"2026-06-{23+i}T00:00:00Z", "composite_score": 63 + i*1.2} for i in range(7)],
            "mood_history": [{"created_at": f"2026-06-{23+i}T00:00:00Z", "mood_score": 6 - i*0.3} for i in range(7)]
        }
    sb = get_supabase()

    risk_history = (
        sb.table("risk_scores")
        .select("computed_at,igd_score,bdd_score,sleep_score,stress_score,composite_score")
        .eq("user_id", user_id)
        .order("computed_at", desc=True)
        .limit(14)
        .execute()
    ).data or []

    mood_history = (
        sb.table("mood_checkins")
        .select("created_at,mood_score,anxiety,energy")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(14)
        .execute()
    ).data or []

    return {
        "risk_history": list(reversed(risk_history)),
        "mood_history": list(reversed(mood_history)),
    }


@router.get("/insights/events")
async def get_behavioral_events(
    authorization: str = Header(...),
    limit: int = 20,
):
    """SOC-style behavioral event feed."""
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    if user_id == DEMO_UUID:
        return MOCK_EVENTS[:limit]
    sb = get_supabase()

    result = (
        sb.table("behavioral_events")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data or []
