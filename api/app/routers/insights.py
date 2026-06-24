"""Insights router with streaming Gemini weekly summary."""
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from app.database import get_supabase
from app.services.ai_service import ai_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def _get_user_id(token: str) -> str:
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
