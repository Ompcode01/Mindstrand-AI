"""Background behavioral monitoring service that polls active window titles and broadcasts live alerts over WebSocket."""
import asyncio
import ctypes
import logging
from datetime import datetime, timezone
from app.routers.websocket import active_connections

logger = logging.getLogger(__name__)

class BehavioralMonitorService:
    def __init__(self):
        self.is_running = False
        self.gaming_duration_sec = 0
        self.last_alert_sec = 0
        self.target_keywords = ["poki", "game", "roblox", "steam", "fortnite", "discord", "minecraft"]

    def _get_active_window_title(self) -> str:
        try:
            hwnd = ctypes.windll.user32.GetForegroundWindow()
            if not hwnd:
                return ""
            length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
            buf = ctypes.create_unicode_buffer(length + 1)
            ctypes.windll.user32.GetWindowTextW(hwnd, buf, length + 1)
            return buf.value if buf.value else ""
        except Exception:
            return ""

    async def _broadcast_alert(self, message: str, severity: str = "warning"):
        if not active_connections:
            return
        payload = {
            "type": "behavioral_alert",
            "severity": severity,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "data": {
                "active_window": "Poki / Gaming Session",
                "duration_sec": self.gaming_duration_sec
            }
        }
        # Broadcast to all active dashboard connections
        for user_id, ws in list(active_connections.items()):
            try:
                await ws.send_json(payload)
            except Exception as e:
                logger.error(f"Failed broadcasting behavioral alert to {user_id}: {e}")

    async def start(self):
        self.is_running = True
        logger.info("🟢 Background Behavioral Monitor auto-started inside FastAPI lifespan.")
        while self.is_running:
            try:
                title = self._get_active_window_title().lower()
                is_gaming = any(kw in title for kw in self.target_keywords)

                if is_gaming:
                    self.gaming_duration_sec += 1
                    if self.gaming_duration_sec % 15 == 0 and self.gaming_duration_sec != self.last_alert_sec:
                        self.last_alert_sec = self.gaming_duration_sec
                        logger.warning(f"⚠️ Continuous gaming detected ({self.gaming_duration_sec}s). Broadcasting WS alert.")
                        await self._broadcast_alert(f"Live telemetry: Continuous gaming detected ({self.gaming_duration_sec}s active)", "warning")
                else:
                    # Decay gaming counter when not actively gaming
                    if self.gaming_duration_sec > 0:
                        self.gaming_duration_sec = max(0, self.gaming_duration_sec - 1)

                await asyncio.sleep(1)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.debug(f"Behavioral monitor loop error: {e}")
                await asyncio.sleep(2)

    def stop(self):
        self.is_running = False
        logger.info("🔴 Background Behavioral Monitor stopped.")

behavioral_monitor = BehavioralMonitorService()
