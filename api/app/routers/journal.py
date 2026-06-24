"""Journal router with Gemini NLP analysis."""
from fastapi import APIRouter, HTTPException, Header
from app.database import get_supabase
from app.models.schemas import JournalCreate
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


@router.post("/journal/create")
async def create_journal(
    data: JournalCreate,
    authorization: str = Header(...),
):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    # Get user risk context
    risk_res = sb.table("risk_scores").select("igd_score,bdd_score").eq("user_id", user_id).order("computed_at", desc=True).limit(1).execute()
    user_context = risk_res.data[0] if risk_res.data else {}

    # Run AI analysis
    analysis = await ai_service.analyze_journal(data.content, user_context)

    result = sb.table("journal_entries").insert({
        "user_id": user_id,
        "content": data.content,
        "mood_tag": analysis.get("mood_tag", "neutral"),
        "ai_tags": analysis.get("ai_tags", []),
        "risk_signals": {
            "signals": analysis.get("risk_signals", []),
            "igd_signal_count": analysis.get("igd_signal_count", 0),
            "bdd_signal_count": analysis.get("bdd_signal_count", 0),
        },
        "ai_analysis": analysis.get("ai_analysis", ""),
        "sentiment_score": analysis.get("sentiment_score", 0.0),
    }).execute()

    entry = result.data[0]

    # Trigger risk recalculation if significant signals detected
    igd_signals = analysis.get("igd_signal_count", 0)
    bdd_signals = analysis.get("bdd_signal_count", 0)
    if igd_signals >= 2 or bdd_signals >= 2:
        try:
            # Log behavioral event
            sb.table("behavioral_events").insert({
                "user_id": user_id,
                "event_type": "journal_risk_signal_detected",
                "severity": "warning" if (igd_signals + bdd_signals) >= 4 else "advisory",
                "source": "journal",
                "payload": {
                    "igd_signals": igd_signals,
                    "bdd_signals": bdd_signals,
                    "mood_tag": analysis.get("mood_tag"),
                },
            }).execute()
        except Exception as e:
            logger.warning(f"Behavioral event logging failed: {e}")

    return entry


@router.get("/journal/entries")
async def get_journal_entries(
    authorization: str = Header(...),
    page: int = 1,
    limit: int = 10,
):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    offset = (page - 1) * limit
    result = (
        sb.table("journal_entries")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return result.data or []


@router.get("/journal/{entry_id}/analysis")
async def get_journal_analysis(
    entry_id: str,
    authorization: str = Header(...),
):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    result = (
        sb.table("journal_entries")
        .select("*")
        .eq("id", entry_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Entry not found")
    return result.data
