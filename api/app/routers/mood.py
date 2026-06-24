"""Mood check-in router."""
from fastapi import APIRouter, HTTPException, Header
from app.database import get_supabase
from app.models.schemas import MoodCheckinCreate
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def _get_user_id(token: str) -> str:
    sb = get_supabase()
    try:
        return sb.auth.get_user(token).user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/mood/checkin")
async def submit_checkin(
    data: MoodCheckinCreate,
    authorization: str = Header(...),
):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    result = sb.table("mood_checkins").insert({
        "user_id": user_id,
        "mood_score": data.mood_score,
        "energy": data.energy,
        "anxiety": data.anxiety,
        "social_urge": data.social_urge,
        "notes": data.notes,
    }).execute()

    # Check for consecutive negative check-ins
    recent = (
        sb.table("mood_checkins")
        .select("mood_score")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(3)
        .execute()
    )
    if recent.data and all(m["mood_score"] <= 3 for m in recent.data):
        sb.table("behavioral_events").insert({
            "user_id": user_id,
            "event_type": "consecutive_low_mood",
            "severity": "warning",
            "source": "checkin",
            "payload": {"consecutive_count": 3, "latest_mood": data.mood_score},
        }).execute()

    return result.data[0]


@router.get("/mood/history")
async def get_mood_history(
    authorization: str = Header(...),
    days: int = 14,
):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    result = (
        sb.table("mood_checkins")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(days)
        .execute()
    )
    return list(reversed(result.data or []))
