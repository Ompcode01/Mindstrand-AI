"""Interventions router with AI generation."""
from fastapi import APIRouter, HTTPException, Header
from app.database import get_supabase
from app.models.schemas import InterventionUpdate
from app.services.ai_service import ai_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


DEMO_UUID = "00000000-0000-4000-a000-000000000001"
MOCK_INTERVENTIONS = [
    {
        "id": "22222222-2222-4222-a222-222222222222",
        "user_id": DEMO_UUID,
        "title": "Evening Blue-Light & Screen Cutoff",
        "description": "Engage wind-down protocol at 10:30 PM to prevent circadian misalignment and sleep recovery drag.",
        "category": "sleep",
        "urgency": "immediate",
        "status": "active",
        "created_at": "2026-06-29T00:00:00Z"
    },
    {
        "id": "33333333-3333-4333-a333-333333333333",
        "user_id": DEMO_UUID,
        "title": "Autonomic Coherence Breathing",
        "description": "Perform 5 minutes of resonant breathing (5.5s inhale / 5.5s exhale) to restore HRV autonomic balance.",
        "category": "physiological",
        "urgency": "scheduled",
        "status": "active",
        "created_at": "2026-06-29T00:00:00Z"
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


@router.get("/interventions/active")
async def get_interventions(
    authorization: str = Header(...),
    status: str = "active",
):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    if user_id == DEMO_UUID:
        if status != "all":
            return [i for i in MOCK_INTERVENTIONS if i["status"] == status]
        return MOCK_INTERVENTIONS
    sb = get_supabase()

    query = sb.table("interventions").select("*").eq("user_id", user_id).order("created_at", desc=True)
    if status != "all":
        query = query.eq("status", status)

    result = query.limit(20).execute()
    return result.data or []


@router.put("/interventions/{intervention_id}")
async def update_intervention(
    intervention_id: str,
    data: InterventionUpdate,
    authorization: str = Header(...),
):
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    result = (
        sb.table("interventions")
        .update({"status": data.status.value})
        .eq("id", intervention_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Intervention not found")
    return result.data[0]


@router.post("/interventions/generate")
async def generate_intervention(
    authorization: str = Header(...),
):
    """Generate a new AI intervention based on current risk profile."""
    token = authorization.replace("Bearer ", "")
    user_id = _get_user_id(token)
    sb = get_supabase()

    # Get risk context
    risk_res = (
        sb.table("risk_scores")
        .select("*")
        .eq("user_id", user_id)
        .order("computed_at", desc=True)
        .limit(1)
        .execute()
    )

    if not risk_res.data:
        raise HTTPException(status_code=400, detail="No risk data available")

    risk = risk_res.data[0]
    tier = risk.get("risk_tier", "moderate")

    # Determine trigger
    scores = {
        "IGD": risk.get("igd_score", 0),
        "BDD": risk.get("bdd_score", 0),
        "SLEEP": risk.get("sleep_score", 0),
        "STRESS": risk.get("stress_score", 0),
    }
    top_trigger = max(scores, key=scores.get)
    severity_map = {"low": "advisory", "moderate": "warning", "high": "alert", "critical": "critical"}
    severity = severity_map.get(tier, "warning")

    # Generate
    intervention = await ai_service.generate_intervention(
        trigger_type=f"high_{top_trigger.lower()}",
        severity=severity,
        risk_context=risk,
    )

    # Store
    result = sb.table("interventions").insert({
        "user_id": user_id,
        "trigger_type": f"high_{top_trigger.lower()}",
        "severity": severity,
        "title": intervention.get("title", "Behavioral Intervention"),
        "description": intervention.get("description", ""),
        "ai_rationale": intervention.get("ai_rationale", ""),
        "action_steps": intervention.get("action_steps", []),
        "status": "active",
    }).execute()

    return result.data[0]
