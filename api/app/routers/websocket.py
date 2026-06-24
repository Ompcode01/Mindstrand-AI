"""WebSocket router for live risk updates and wearable telemetry."""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.database import get_supabase
from app.services.simulator import wearable_simulator, RiskContext
import asyncio
import json
import logging
import random
from datetime import datetime, timezone

router = APIRouter()
logger = logging.getLogger(__name__)

# Active connections pool
active_connections: dict[str, WebSocket] = {}


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    active_connections[user_id] = websocket
    logger.info(f"WS connected: {user_id}")

    try:
        sb = get_supabase()

        # Get user risk context
        risk_res = (
            sb.table("risk_scores")
            .select("igd_score,bdd_score,sleep_score,stress_score,composite_score,risk_tier")
            .eq("user_id", user_id)
            .order("computed_at", desc=True)
            .limit(1)
            .execute()
        )

        risk_ctx = RiskContext()
        if risk_res.data:
            d = risk_res.data[0]
            risk_ctx = RiskContext(
                igd_score=d.get("igd_score", 30),
                bdd_score=d.get("bdd_score", 20),
                sleep_score=d.get("sleep_score", 30),
                stress_score=d.get("stress_score", 25),
                composite_score=d.get("composite_score", 26),
            )

        tick = 0
        while True:
            tick += 1

            # Send wearable snapshot every 30s (simulate live BPM)
            snapshot = wearable_simulator.generate_snapshot(risk_ctx)

            # Occasionally send a spike event for demo drama
            is_spike = (tick % 8 == 0) and risk_ctx.composite_score > 50
            if is_spike:
                snapshot = wearable_simulator.generate_spike_event(risk_ctx)
                await websocket.send_json({
                    "type": "behavioral_alert",
                    "severity": "warning",
                    "message": "Elevated stress detected — heart rate spike",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "data": snapshot,
                })

            await websocket.send_json({
                "type": "wearable_update",
                "data": snapshot,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

            # Send periodic risk score nudge
            if tick % 4 == 0:
                nudge = random.gauss(0, 0.5)
                await websocket.send_json({
                    "type": "risk_nudge",
                    "composite_delta": round(nudge, 2),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })

            await asyncio.sleep(30)

    except WebSocketDisconnect:
        logger.info(f"WS disconnected: {user_id}")
    except Exception as e:
        logger.error(f"WS error for {user_id}: {e}")
    finally:
        active_connections.pop(user_id, None)


async def broadcast_to_user(user_id: str, message: dict):
    """Broadcast a message to a specific connected user."""
    ws = active_connections.get(user_id)
    if ws:
        try:
            await ws.send_json(message)
        except Exception as e:
            logger.error(f"Broadcast failed to {user_id}: {e}")
            active_connections.pop(user_id, None)
