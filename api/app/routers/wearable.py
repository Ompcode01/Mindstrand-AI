"""Wearable data router with simulator integration."""
from fastapi import APIRouter, HTTPException, Header
from app.database import get_supabase
from app.models.schemas import WearableSnapshot
from app.services.simulator import wearable_simulator, RiskContext
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


DEMO_UUID = "00000000-0000-4000-a000-000000000001"
MOCK_WEARABLE = {
    "id": "44444444-4444-4444-a444-444444444444",
    "user_id": DEMO_UUID,
    "recorded_at": "2026-06-29T00:00:00Z",
    "heart_rate_bpm": 84,
    "hrv_ms": 22.5,
    "sleep_hours": 5.8,
    "sleep_quality": 65,
    "steps": 6420,
    "stress_index": 71.5,
    "skin_temp_c": 36.8,
    "source": "Mindstrand Simulator"
}


def _get_user_id(token: str) -> str:
    if token in ["demo-token", "test-token", "mock"]:
        return DEMO_UUID
    sb = get_supabase()
    try:
        return sb.auth.get_user(token).user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


def _get_risk_context(user_id: str) -> RiskContext:
    if user_id == DEMO_UUID:
        return RiskContext(igd_score=78.5, bdd_score=67.4, sleep_score=58.0, stress_score=71.5, composite_score=72.0)
    sb = get_supabase()
    res = (
        sb.table("risk_scores")
        .select("igd_score,bdd_score,sleep_score,stress_score,composite_score")
        .eq("user_id", user_id)
        .order("computed_at", desc=True)
        .limit(1)
        .execute()
    )
    if res.data:
        d = res.data[0]
        return RiskContext(
            igd_score=d.get("igd_score", 30),
            bdd_score=d.get("bdd_score", 20),
            sleep_score=d.get("sleep_score", 30),
            stress_score=d.get("stress_score", 25),
            composite_score=d.get("composite_score", 26),
        )
    return RiskContext()


@router.post("/wearable/ingest")
async def ingest_wearable(
    data: WearableSnapshot,
    authorization: str = Header(...),
):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    if user_id == DEMO_UUID:
        return MOCK_WEARABLE
    sb = get_supabase()

    result = sb.table("wearable_data").insert({
        "user_id": user_id,
        "heart_rate_bpm": data.heart_rate_bpm,
        "hrv_ms": data.hrv_ms,
        "sleep_hours": data.sleep_hours,
        "sleep_quality": data.sleep_quality,
        "steps": data.steps,
        "stress_index": data.stress_index,
        "skin_temp_c": data.skin_temp_c,
        "source": data.source,
    }).execute()
    return result.data[0]


@router.get("/wearable/latest")
async def get_latest_wearable(authorization: str = Header(...)):
    """Return latest wearable data, or generate simulated if none exists."""
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    if user_id == DEMO_UUID:
        return MOCK_WEARABLE
    sb = get_supabase()

    result = (
        sb.table("wearable_data")
        .select("*")
        .eq("user_id", user_id)
        .order("recorded_at", desc=True)
        .limit(1)
        .execute()
    )

    if result.data:
        return result.data[0]

    # Generate simulated data
    risk_ctx = _get_risk_context(user_id)
    simulated = wearable_simulator.generate_snapshot(risk_ctx)
    simulated["user_id"] = user_id
    insert = sb.table("wearable_data").insert(simulated).execute()
    return insert.data[0]


@router.get("/wearable/trends")
async def get_wearable_trends(authorization: str = Header(...)):
    """Return 7-day wearable trend data."""
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    result = (
        sb.table("wearable_data")
        .select("*")
        .eq("user_id", user_id)
        .order("recorded_at", desc=True)
        .limit(7)
        .execute()
    )

    if result.data and len(result.data) >= 3:
        return list(reversed(result.data))

    # Generate simulated 7-day series
    risk_ctx = _get_risk_context(user_id)
    series = wearable_simulator.generate_7day_series(risk_ctx)
    return series
