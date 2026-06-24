"""Gaming sessions router."""
from fastapi import APIRouter, HTTPException, Header
from app.database import get_supabase
from app.models.schemas import GamingSessionCreate
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def _get_user_id(token: str) -> str:
    sb = get_supabase()
    try:
        return sb.auth.get_user(token).user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def _compute_risk_contribution(session: dict) -> float:
    """Estimate how much a single session contributes to IGD risk (0-100)."""
    score = 0.0
    duration = session.get("duration_mins", 0)

    # Duration contribution
    if duration >= 360:
        score += 40
    elif duration >= 240:
        score += 25
    elif duration >= 120:
        score += 10
    else:
        score += max(0, duration / 12)

    if session.get("skipped_meals"):
        score += 20
    if session.get("skipped_sleep"):
        score += 30

    mood_delta = session.get("mood_after", 5) - session.get("mood_before", 5)
    if mood_delta < -2:
        score += 10

    return min(100.0, round(score, 2))


@router.post("/gaming/session")
async def log_gaming_session(
    data: GamingSessionCreate,
    authorization: str = Header(...),
):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    duration_mins = int((data.ended_at - data.started_at).total_seconds() / 60)
    session_dict = data.model_dump()
    risk_contribution = _compute_risk_contribution({
        "duration_mins": duration_mins,
        "skipped_meals": data.skipped_meals,
        "skipped_sleep": data.skipped_sleep,
        "mood_before": data.mood_before,
        "mood_after": data.mood_after,
    })

    result = sb.table("gaming_sessions").insert({
        "user_id": user_id,
        "game_name": data.game_name,
        "started_at": data.started_at.isoformat(),
        "ended_at": data.ended_at.isoformat(),
        "duration_mins": duration_mins,
        "mood_before": data.mood_before,
        "mood_after": data.mood_after,
        "skipped_meals": data.skipped_meals,
        "skipped_sleep": data.skipped_sleep,
        "notes": data.notes,
        "risk_contribution": risk_contribution,
    }).execute()

    # Log behavioral event if high risk session
    if risk_contribution >= 40 or data.skipped_sleep:
        severity = "alert" if data.skipped_sleep else "warning"
        sb.table("behavioral_events").insert({
            "user_id": user_id,
            "event_type": "high_risk_gaming_session",
            "severity": severity,
            "source": "gaming",
            "payload": {
                "game": data.game_name,
                "duration_mins": duration_mins,
                "risk_contribution": risk_contribution,
            },
        }).execute()

    return result.data[0]


@router.get("/gaming/sessions")
async def get_sessions(
    authorization: str = Header(...),
    limit: int = 20,
):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    result = (
        sb.table("gaming_sessions")
        .select("*")
        .eq("user_id", user_id)
        .order("started_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data or []


@router.get("/gaming/stats")
async def get_gaming_stats(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    sessions = (
        sb.table("gaming_sessions")
        .select("*")
        .eq("user_id", user_id)
        .order("started_at", desc=True)
        .limit(30)
        .execute()
    ).data or []

    if not sessions:
        return {"total_sessions": 0, "avg_daily_hours": 0, "total_hours": 0}

    total_mins = sum(s.get("duration_mins", 0) for s in sessions)
    unique_days = len(set(s["started_at"][:10] for s in sessions))
    avg_mood_delta = (
        sum((s.get("mood_after", 5) - s.get("mood_before", 5)) for s in sessions) / len(sessions)
    )

    return {
        "total_sessions": len(sessions),
        "total_hours": round(total_mins / 60, 1),
        "avg_daily_hours": round(total_mins / max(unique_days, 1) / 60, 1),
        "skipped_meals_total": sum(1 for s in sessions if s.get("skipped_meals")),
        "skipped_sleep_total": sum(1 for s in sessions if s.get("skipped_sleep")),
        "avg_mood_delta": round(avg_mood_delta, 2),
        "avg_risk_contribution": round(sum(s.get("risk_contribution", 0) for s in sessions) / len(sessions), 2),
        "sessions_by_day": sessions,
    }
