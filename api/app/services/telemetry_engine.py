"""
MindShield AI — Hybrid Behavioral Telemetry Engine

Architecture:
  TelemetryEngine (orchestrator)
    ├── WindowCollector     — Real Windows API: active window, exe, focus, switches
    ├── InputCollector      — Real Windows hooks: keypress count, click count (no content)
    ├── SessionTracker      — Derives session start/end/duration/daily cumulative
    ├── BiometricSimulator  — Dynamically modulated by real telemetry
    ├── BehavioralAnalyzer  — 10 inferred psychological signals
    ├── GeminiAnalyzer      — Live Gemini every 120s
    └── TelemetryBroadcaster— Pushes to WebSocket active_connections every 5s

All sub-engines run as async tasks started from the single TelemetryEngine.start()
which is called once from main.py lifespan.
"""

from __future__ import annotations
import asyncio
import ctypes
import ctypes.wintypes
import threading
import time
import math
import random
import logging
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger(__name__)

# ─── Known gaming executables / title keywords ───────────────────────────────
GAME_EXE_KEYWORDS = [
    "valorant", "roblox", "minecraft", "fortnite", "steam", "epicgames",
    "leagueoflegends", "dota2", "csgo", "cs2", "overwatch", "apex",
    "genshin", "poki", "itch", "unity", "unreal", "chrome", "firefox",
    "opera", "brave", "msedge",  # browser gaming
]
GAME_TITLE_KEYWORDS = [
    "poki", "roblox", "valorant", "minecraft", "fortnite", "league",
    "dota", "csgo", "overwatch", "apex legends", "genshin",
    "free fire", "pubg", "call of duty", "warzone", "game", "gaming",
]

# ─── Shared in-memory state ──────────────────────────────────────────────────
@dataclass
class TelemetrySnapshot:
    timestamp: str = ""
    # Window
    active_title: str = ""
    active_exe: str = ""
    is_gaming: bool = False
    active_game_name: str = ""
    window_switches: int = 0
    app_switches: int = 0
    focus_duration_sec: int = 0
    # Session
    session_start: Optional[str] = None
    session_duration_sec: int = 0
    daily_play_sec: int = 0
    continuous_streak_sec: int = 0
    # Input (real counts, no content)
    total_keypresses: int = 0
    keypress_rate: float = 0.0
    total_clicks: int = 0
    click_rate: float = 0.0
    mouse_movement_units: int = 0
    idle_duration_sec: int = 0
    alt_tab_count: int = 0
    pause_count: int = 0
    # Biometrics (simulated, dynamically modulated)
    heart_rate: float = 72.0
    hrv: float = 45.0
    stress_index: float = 25.0
    recovery_score: float = 80.0
    sleep_score: float = 75.0
    fatigue_score: float = 20.0
    cortisol_proxy: float = 12.0
    autonomic_load: float = 0.3
    # Behavioral scores (0-1)
    attention_fragmentation_score: float = 0.0
    compulsive_engagement_score: float = 0.0
    reward_seeking_score: float = 0.0
    cognitive_fatigue_score: float = 0.0
    emotional_dependency_score: float = 0.0
    self_regulation_score: float = 1.0
    impulsivity_score: float = 0.0
    gaming_escalation_score: float = 0.0
    burnout_probability: float = 0.0
    behavioral_velocity: float = 0.0
    # Risk
    igd_contribution: float = 0.0
    composite_risk: float = 30.0

@dataclass
class TelemetrySettings:
    demo_mode: bool = True
    live_telemetry: bool = True
    ai_explainability: bool = True
    enable_simulation: bool = True
    enable_keyboard_tracking: bool = True
    enable_mouse_tracking: bool = True
    enable_alt_tab_tracking: bool = True
    enable_window_tracking: bool = True
    enable_idle_tracking: bool = True
    enable_simulated_wearables: bool = True
    enable_gemini_analysis: bool = True
    enable_intervention_engine: bool = True
    enable_prediction_engine: bool = True
    session_trigger_duration_sec: int = 60
    session_timeout_sec: int = 300
    block_duration_sec: int = 30
    break_reminder_interval_sec: int = 1200
    live_refresh_rate_sec: int = 5
    risk_threshold: int = 70
    gemini_analysis_interval_sec: int = 120

# Global singletons
snapshot = TelemetrySnapshot()
settings = TelemetrySettings()
history_buffer: list[dict] = []  # rolling 60-point buffer
last_ai_analysis: Optional[dict] = None


# ─── 1. WINDOW COLLECTOR ─────────────────────────────────────────────────────
class WindowCollector:
    """Polls real active window via ctypes every 1 second."""
    def __init__(self):
        self._prev_hwnd = 0
        self._prev_exe = ""
        self._focus_start = time.time()

    def _get_foreground_window_info(self) -> tuple[str, str]:
        """Returns (window_title, exe_name)."""
        try:
            hwnd = ctypes.windll.user32.GetForegroundWindow()
            if not hwnd:
                return "", ""
            # Title
            length = ctypes.windll.user32.GetWindowTextLengthW(hwnd)
            buf = ctypes.create_unicode_buffer(length + 1)
            ctypes.windll.user32.GetWindowTextW(hwnd, buf, length + 1)
            title = buf.value or ""
            # Executable
            pid = ctypes.wintypes.DWORD()
            ctypes.windll.user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
            PROCESS_QUERY_LIMITED = 0x1000
            h_proc = ctypes.windll.kernel32.OpenProcess(PROCESS_QUERY_LIMITED, False, pid.value)
            exe = ""
            if h_proc:
                exe_buf = ctypes.create_unicode_buffer(512)
                ctypes.windll.psapi.GetModuleFileNameExW(h_proc, None, exe_buf, 512)
                exe = exe_buf.value.split("\\")[-1].lower() if exe_buf.value else ""
                ctypes.windll.kernel32.CloseHandle(h_proc)
            return title, exe, hwnd
        except Exception:
            return "", "", 0

    def _detect_game(self, title: str, exe: str) -> tuple[bool, str]:
        title_l = title.lower()
        exe_l = exe.lower()
        for kw in GAME_TITLE_KEYWORDS:
            if kw in title_l:
                return True, title.split(" - ")[0][:40]
        for kw in GAME_EXE_KEYWORDS:
            if kw in exe_l:
                return True, exe.replace(".exe", "").replace("-win64-shipping", "").replace("_", " ").title()
        return False, ""

    async def poll(self):
        global snapshot
        while True:
            try:
                result = self._get_foreground_window_info()
                title, exe, hwnd = result if len(result) == 3 else (result[0], result[1], 0)
                is_gaming, game_name = self._detect_game(title, exe)

                # Window switch detection
                if hwnd and hwnd != self._prev_hwnd:
                    snapshot.window_switches += 1
                    if exe and exe != self._prev_exe:
                        snapshot.app_switches += 1
                        # Alt-tab heuristic: rapid switch to a different app
                        snapshot.alt_tab_count += 1
                    self._prev_hwnd = hwnd
                    self._prev_exe = exe
                    self._focus_start = time.time()

                snapshot.active_title = title
                snapshot.active_exe = exe
                snapshot.is_gaming = is_gaming
                snapshot.active_game_name = game_name if is_gaming else ""
                snapshot.focus_duration_sec = int(time.time() - self._focus_start)

            except Exception as e:
                logger.debug(f"WindowCollector poll error: {e}")
            await asyncio.sleep(1)


# ─── 2. INPUT COLLECTOR ──────────────────────────────────────────────────────
class InputCollector:
    """
    Low-level keyboard/mouse hooks via ctypes.
    Counts keypresses and clicks only — no key content captured (privacy-safe).
    Runs a Windows message pump on a daemon thread to service the hooks.
    """
    WH_KEYBOARD_LL = 13
    WH_MOUSE_LL = 14
    WM_KEYDOWN = 0x0100
    WM_LBUTTONDOWN = 0x0201
    WM_RBUTTONDOWN = 0x0204
    WM_MOUSEMOVE = 0x0200

    def __init__(self):
        self._keypress_count = 0
        self._click_count = 0
        self._mouse_movement = 0
        self._last_input_time = time.time()
        self._last_mouse_pos = (0, 0)
        self._kb_hook = None
        self._mouse_hook = None
        self._thread: Optional[threading.Thread] = None
        self._running = False
        self._rate_window_start = time.time()
        self._rate_window_keys = 0
        self._rate_window_clicks = 0

    def _keyboard_callback(self, nCode, wParam, lParam):
        if nCode >= 0 and wParam == self.WM_KEYDOWN:
            self._keypress_count += 1
            self._rate_window_keys += 1
            self._last_input_time = time.time()
        return ctypes.windll.user32.CallNextHookEx(self._kb_hook, nCode, wParam, lParam)

    def _mouse_callback(self, nCode, wParam, lParam):
        if nCode >= 0:
            if wParam in (self.WM_LBUTTONDOWN, self.WM_RBUTTONDOWN):
                self._click_count += 1
                self._rate_window_clicks += 1
                self._last_input_time = time.time()
            elif wParam == self.WM_MOUSEMOVE:
                # Cast lParam to MSLLHOOKSTRUCT to get position
                try:
                    class POINT(ctypes.Structure):
                        _fields_ = [("x", ctypes.c_long), ("y", ctypes.c_long)]
                    class MSLLHOOKSTRUCT(ctypes.Structure):
                        _fields_ = [("pt", POINT), ("mouseData", ctypes.wintypes.DWORD),
                                     ("flags", ctypes.wintypes.DWORD), ("time", ctypes.wintypes.DWORD),
                                     ("dwExtraInfo", ctypes.POINTER(ctypes.c_ulong))]
                    msg = ctypes.cast(lParam, ctypes.POINTER(MSLLHOOKSTRUCT)).contents
                    x, y = msg.pt.x, msg.pt.y
                    px, py = self._last_mouse_pos
                    delta = abs(x - px) + abs(y - py)
                    self._mouse_movement += delta
                    self._last_mouse_pos = (x, y)
                except Exception:
                    pass
        return ctypes.windll.user32.CallNextHookEx(self._mouse_hook, nCode, wParam, lParam)

    def _pump_thread(self):
        """Windows message pump — must run on same thread as hooks."""
        HOOKPROC_KB = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.POINTER(ctypes.c_void_p))
        HOOKPROC_MS = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.POINTER(ctypes.c_void_p))
        kb_proc = HOOKPROC_KB(self._keyboard_callback)
        ms_proc = HOOKPROC_MS(self._mouse_callback)
        module = ctypes.windll.kernel32.GetModuleHandleW(None)
        self._kb_hook = ctypes.windll.user32.SetWindowsHookExW(self.WH_KEYBOARD_LL, kb_proc, module, 0)
        self._mouse_hook = ctypes.windll.user32.SetWindowsHookExW(self.WH_MOUSE_LL, ms_proc, module, 0)
        msg = ctypes.wintypes.MSG()
        while self._running:
            if ctypes.windll.user32.PeekMessageW(ctypes.byref(msg), None, 0, 0, 1):
                ctypes.windll.user32.TranslateMessage(ctypes.byref(msg))
                ctypes.windll.user32.DispatchMessageW(ctypes.byref(msg))
            time.sleep(0.01)
        if self._kb_hook:
            ctypes.windll.user32.UnhookWindowsHookEx(self._kb_hook)
        if self._mouse_hook:
            ctypes.windll.user32.UnhookWindowsHookEx(self._mouse_hook)

    def start(self):
        self._running = True
        self._thread = threading.Thread(target=self._pump_thread, daemon=True)
        self._thread.start()
        logger.info("🖱️  Input hooks active (keyboard + mouse)")

    def stop(self):
        self._running = False

    def get_rates(self) -> tuple[float, float]:
        """Returns (keys/sec, clicks/sec) over last 10s window."""
        now = time.time()
        elapsed = now - self._rate_window_start
        if elapsed >= 10.0:
            krate = self._rate_window_keys / elapsed
            crate = self._rate_window_clicks / elapsed
            self._rate_window_keys = 0
            self._rate_window_clicks = 0
            self._rate_window_start = now
            return round(krate, 2), round(crate, 2)
        return snapshot.keypress_rate, snapshot.click_rate

    async def sync_loop(self):
        """Sync collected counts to snapshot every second."""
        global snapshot
        while True:
            snapshot.total_keypresses = self._keypress_count
            snapshot.total_clicks = self._click_count
            snapshot.mouse_movement_units = self._mouse_movement
            krate, crate = self.get_rates()
            snapshot.keypress_rate = krate
            snapshot.click_rate = crate
            idle = time.time() - self._last_input_time
            snapshot.idle_duration_sec = int(idle)
            await asyncio.sleep(1)


# ─── 3. SESSION TRACKER ───────────────────────────────────────────────────────
class SessionTracker:
    """Tracks gaming session lifecycle based on WindowCollector state."""
    def __init__(self):
        self._session_active = False
        self._session_start: Optional[float] = None
        self._last_gaming_time: Optional[float] = None
        self._daily_start = datetime.now(timezone.utc).date()
        self._daily_total_sec = 0
        self._streak_start: Optional[float] = None

    async def track_loop(self):
        global snapshot, settings
        while True:
            now = time.time()
            if snapshot.is_gaming:
                if not self._session_active:
                    self._session_active = True
                    self._session_start = now
                    self._streak_start = now
                    snapshot.session_start = datetime.now(timezone.utc).isoformat()
                    logger.info(f"🎮 Gaming session started: {snapshot.active_game_name}")
                snapshot.session_duration_sec = int(now - self._session_start)
                snapshot.continuous_streak_sec = int(now - self._streak_start)
                self._last_gaming_time = now
                # Daily cumulative
                today = datetime.now(timezone.utc).date()
                if today != self._daily_start:
                    self._daily_total_sec = 0
                    self._daily_start = today
                self._daily_total_sec += 1
                snapshot.daily_play_sec = self._daily_total_sec
            else:
                if self._session_active:
                    # Check timeout
                    idle_since = now - (self._last_gaming_time or now)
                    if idle_since > settings.session_timeout_sec:
                        self._session_active = False
                        self._session_start = None
                        self._streak_start = None
                        snapshot.session_duration_sec = 0
                        snapshot.continuous_streak_sec = 0
                        logger.info("🎮 Gaming session ended (timeout)")
            await asyncio.sleep(1)


# ─── 4. BIOMETRIC SIMULATOR ───────────────────────────────────────────────────
class BiometricSimulator:
    """
    Generates realistic simulated biometrics dynamically modulated by real telemetry.
    Not static — values evolve with session duration, input intensity, and fatigue.
    """
    BASE_HR = 68.0
    BASE_HRV = 46.0
    BASE_STRESS = 22.0

    async def simulation_loop(self):
        global snapshot
        while True:
            try:
                session_hr = snapshot.session_duration_sec / 3600  # hours
                input_intensity = min(1.0, (snapshot.keypress_rate + snapshot.click_rate * 2) / 10.0)
                gaming_pressure = min(1.0, session_hr / 4.0)
                noise = lambda s: random.gauss(0, s)

                # Heart rate: rises with session duration + input activity
                hr = self.BASE_HR + (gaming_pressure * 28) + (input_intensity * 8) + noise(2.5)
                hr = max(58, min(145, hr))

                # HRV: drops as stress rises, worse with long sessions
                hrv = self.BASE_HRV - (gaming_pressure * 22) - (input_intensity * 5) + noise(1.5)
                hrv = max(10.0, min(80.0, hrv))

                # Stress index
                stress = self.BASE_STRESS + (gaming_pressure * 55) + (input_intensity * 15) + noise(3)
                stress = max(0, min(100, stress))

                # Recovery: inverse of stress + gaming pressure
                recovery = max(10, 100 - stress * 0.65 - gaming_pressure * 20 + noise(3))

                # Sleep score: degrades with late-night gaming (daily_play_sec proxy)
                sleep_penalty = min(30, snapshot.daily_play_sec / 720)  # 12 min play = 1 pt penalty
                sleep_sc = max(20, 85 - sleep_penalty - gaming_pressure * 15 + noise(2))

                # Fatigue: accumulates over session
                fatigue = min(95, gaming_pressure * 60 + input_intensity * 20 + noise(3))

                # Cortisol proxy (normalized 0-30 scale)
                cortisol = max(5, 8 + gaming_pressure * 18 + stress * 0.05 + noise(1))

                # Autonomic load (0-1)
                auto_load = min(0.98, 0.2 + gaming_pressure * 0.55 + input_intensity * 0.2 + noise(0.03))

                snapshot.heart_rate = round(hr, 1)
                snapshot.hrv = round(hrv, 1)
                snapshot.stress_index = round(stress, 1)
                snapshot.recovery_score = round(recovery, 1)
                snapshot.sleep_score = round(sleep_sc, 1)
                snapshot.fatigue_score = round(fatigue, 1)
                snapshot.cortisol_proxy = round(cortisol, 2)
                snapshot.autonomic_load = round(auto_load, 3)

            except Exception as e:
                logger.debug(f"BiometricSimulator error: {e}")
            await asyncio.sleep(10)


# ─── 5. BEHAVIORAL ANALYZER ──────────────────────────────────────────────────
class BehavioralAnalyzer:
    """Derives 10 inferred psychological signals from real telemetry."""

    def _clamp(self, v: float) -> float:
        return max(0.0, min(1.0, v))

    async def compute_loop(self):
        global snapshot
        prev_risk = snapshot.composite_risk
        while True:
            try:
                s = snapshot
                session_hr = s.session_duration_sec / 3600
                daily_hr = s.daily_play_sec / 3600

                # Attention fragmentation: high alt-tabs + short focus durations
                afs = self._clamp((s.alt_tab_count / max(1, session_hr * 60)) * 0.6
                                  + (1 - min(1, s.focus_duration_sec / 120)) * 0.4)

                # Compulsive engagement: long session + few pauses + high input
                ces = self._clamp(session_hr / 4 * 0.5
                                  + (1 - min(1, s.pause_count / max(1, session_hr * 2))) * 0.3
                                  + (s.keypress_rate / 10) * 0.2)

                # Reward seeking: game launches per hour + rapid re-engagement
                rss = self._clamp(daily_hr / 6 * 0.6
                                  + min(1, s.app_switches / max(1, session_hr * 20)) * 0.4)

                # Cognitive fatigue: declining keypress rate + long session
                cfs = self._clamp(session_hr / 5 * 0.5
                                  + s.autonomic_load * 0.3
                                  + s.fatigue_score / 100 * 0.2)

                # Emotional dependency: gaming after idle + late hours
                hour = datetime.now(timezone.utc).hour
                late_night_factor = 1.0 if (22 <= hour or hour < 3) else 0.3
                eds = self._clamp(ces * 0.5 + late_night_factor * 0.3 + (1 - s.recovery_score / 100) * 0.2)

                # Self-regulation (inverse): adequate breaks lower this score
                srs = self._clamp(1.0 - (s.pause_count / max(1, session_hr * 3)) * 0.5
                                  - (1 - ces) * 0.5)

                # Impulsivity: rapid bursts + high alt-tab rate
                imp = self._clamp(s.click_rate / 3 * 0.5 + afs * 0.5)

                # Gaming escalation: daily hours growing vs. normal
                ges = self._clamp(daily_hr / 8 * 0.7 + ces * 0.3)

                # Burnout probability: fatigue + long session + input decline
                bp = self._clamp(cfs * 0.5 + eds * 0.3 + s.fatigue_score / 100 * 0.2)

                # Behavioral velocity: rate of change in risk
                new_risk = min(100, 30 + ges * 20 + ces * 15 + afs * 10 + eds * 10 + s.stress_index * 0.15)
                bv = self._clamp(abs(new_risk - prev_risk) / 10)
                prev_risk = new_risk

                snapshot.attention_fragmentation_score = round(afs, 3)
                snapshot.compulsive_engagement_score = round(ces, 3)
                snapshot.reward_seeking_score = round(rss, 3)
                snapshot.cognitive_fatigue_score = round(cfs, 3)
                snapshot.emotional_dependency_score = round(eds, 3)
                snapshot.self_regulation_score = round(srs, 3)
                snapshot.impulsivity_score = round(imp, 3)
                snapshot.gaming_escalation_score = round(ges, 3)
                snapshot.burnout_probability = round(bp, 3)
                snapshot.behavioral_velocity = round(bv, 3)
                snapshot.composite_risk = round(new_risk, 1)
                snapshot.igd_contribution = round(ges * 20 + ces * 15, 1)

            except Exception as e:
                logger.debug(f"BehavioralAnalyzer error: {e}")
            await asyncio.sleep(30)


# ─── 6. GEMINI ANALYZER ──────────────────────────────────────────────────────
class GeminiAnalyzer:
    """Generates live Gemini AI analysis every 120s and broadcasts to WebSocket."""

    def _build_prompt(self) -> str:
        s = snapshot
        session_str = f"{s.session_duration_sec // 3600}h {(s.session_duration_sec % 3600) // 60}m"
        daily_str = f"{s.daily_play_sec // 3600}h {(s.daily_play_sec % 3600) // 60}m"
        return f"""You are MindShield AI's real-time behavioral health intelligence system.
Analyze this LIVE telemetry snapshot and generate a structured clinical analysis.

=== LIVE SESSION TELEMETRY ===
Active Game: {s.active_game_name or 'Not Gaming'}
Session Duration: {session_str}
Daily Cumulative Play: {daily_str}
Window Switches: {s.window_switches}
Alt-Tab Count: {s.alt_tab_count}
App Switches: {s.app_switches}
Focus Duration (current window): {s.focus_duration_sec}s
Pause Count: {s.pause_count}

=== INPUT TELEMETRY (REAL) ===
Total Keypresses: {s.total_keypresses}
Keypress Rate: {s.keypress_rate}/s
Total Clicks: {s.total_clicks}
Click Rate: {s.click_rate}/s
Mouse Movement: {s.mouse_movement_units} units
Idle Duration: {s.idle_duration_sec}s

=== BIOMETRICS (SIMULATED) ===
Heart Rate: {s.heart_rate} BPM
HRV: {s.hrv} ms
Stress Index: {s.stress_index}/100
Recovery Score: {s.recovery_score}/100
Fatigue: {s.fatigue_score}/100
Cortisol Proxy: {s.cortisol_proxy}
Autonomic Load: {s.autonomic_load}

=== BEHAVIORAL SCORES (INFERRED) ===
Compulsive Engagement: {s.compulsive_engagement_score:.2f}
Attention Fragmentation: {s.attention_fragmentation_score:.2f}
Reward Seeking: {s.reward_seeking_score:.2f}
Cognitive Fatigue: {s.cognitive_fatigue_score:.2f}
Emotional Dependency: {s.emotional_dependency_score:.2f}
Self-Regulation: {s.self_regulation_score:.2f}
Impulsivity: {s.impulsivity_score:.2f}
Gaming Escalation: {s.gaming_escalation_score:.2f}
Burnout Probability: {s.burnout_probability:.2f}
Behavioral Velocity: {s.behavioral_velocity:.2f}

Return ONLY valid JSON in this exact format:
{{
  "session_summary": "One concise sentence summarizing the session.",
  "behavioral_findings": ["finding 1", "finding 2", "finding 3"],
  "psychological_analysis": "2 sentences about psychological state.",
  "physiological_analysis": "1-2 sentences about biometric indicators.",
  "addiction_analysis": "1-2 sentences about addiction risk patterns.",
  "risk_escalation": "1 sentence about short-term risk trajectory.",
  "risk_contribution": {{"igd": <float>, "bdd": <float>, "physiological": <float>, "prediction": <float>}},
  "overall_risk": <int 0-100>,
  "primary_intervention": "One specific, immediately actionable recommendation."
}}"""

    async def analysis_loop(self):
        global last_ai_analysis, settings
        from app.services.ai_service import ai_service
        from app.routers.websocket import active_connections
        import json

        while True:
            try:
                await asyncio.sleep(settings.gemini_analysis_interval_sec)
                if not settings.enable_gemini_analysis:
                    continue

                prompt = self._build_prompt()
                res = await ai_service.model.generate_content_async(
                    prompt,
                    generation_config=ai_service.generation_config
                )
                text = res.text.strip()
                if text.startswith("```"):
                    text = text.split("```")[1]
                    if text.startswith("json"):
                        text = text[4:]
                analysis = json.loads(text)
                analysis["timestamp"] = datetime.now(timezone.utc).isoformat()
                analysis["active_game"] = snapshot.active_game_name or "No Active Game"
                analysis["session_duration"] = f"{snapshot.session_duration_sec // 3600}h {(snapshot.session_duration_sec % 3600) // 60}m"
                last_ai_analysis = analysis
                logger.info("🤖 Gemini AI analysis generated and ready for broadcast.")

                # Broadcast to all connected dashboards
                for uid, ws in list(active_connections.items()):
                    try:
                        await ws.send_json({"type": "ai_analysis", "data": analysis,
                                            "timestamp": analysis["timestamp"]})
                    except Exception:
                        pass

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.warning(f"GeminiAnalyzer error (fallback): {e}")
                last_ai_analysis = {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "active_game": snapshot.active_game_name or "No Active Game",
                    "session_duration": f"{snapshot.session_duration_sec // 3600}h {(snapshot.session_duration_sec % 3600) // 60}m",
                    "session_summary": f"Gaming session active ({snapshot.session_duration_sec//60}m). Elevated compulsive engagement detected.",
                    "behavioral_findings": [
                        f"Compulsive engagement at {snapshot.compulsive_engagement_score:.0%}",
                        f"Attention fragmentation: {snapshot.attention_fragmentation_score:.0%}",
                        f"Gaming escalation trend: {snapshot.gaming_escalation_score:.0%}"
                    ],
                    "psychological_analysis": f"User demonstrates elevated IGD risk indicators. Emotional dependency score of {snapshot.emotional_dependency_score:.2f} suggests gaming as primary mood regulator.",
                    "physiological_analysis": f"Simulated HR at {snapshot.heart_rate:.0f} BPM with HRV suppressed to {snapshot.hrv:.1f}ms — consistent with sustained arousal.",
                    "addiction_analysis": f"Compulsive engagement ({snapshot.compulsive_engagement_score:.2f}) with impulsivity ({snapshot.impulsivity_score:.2f}) indicates developing IGD pattern.",
                    "risk_escalation": "Short-term risk trajectory is worsening if current session continues uninterrupted.",
                    "risk_contribution": {
                        "igd": round(snapshot.igd_contribution, 1),
                        "bdd": round(snapshot.emotional_dependency_score * 5, 1),
                        "physiological": round(snapshot.stress_index * 0.15, 1),
                        "prediction": round(snapshot.gaming_escalation_score * 20, 1)
                    },
                    "overall_risk": int(snapshot.composite_risk),
                    "primary_intervention": "Activate a mandatory 15-minute break with guided breathing before continuing."
                }


# ─── 7. TELEMETRY BROADCASTER ────────────────────────────────────────────────
class TelemetryBroadcaster:
    """Pushes snapshot to all WebSocket connections every N seconds."""

    def _snapshot_to_dict(self) -> dict:
        s = snapshot
        return {
            "session": {
                "active": s.is_gaming,
                "active_game": s.active_game_name,
                "active_title": s.active_title[:60],
                "active_exe": s.active_exe,
                "duration_sec": s.session_duration_sec,
                "daily_play_sec": s.daily_play_sec,
                "continuous_streak_sec": s.continuous_streak_sec,
                "session_start": s.session_start,
            },
            "input": {
                "keypresses": s.total_keypresses,
                "keypress_rate": s.keypress_rate,
                "clicks": s.total_clicks,
                "click_rate": s.click_rate,
                "mouse_movement": s.mouse_movement_units,
                "alt_tabs": s.alt_tab_count,
                "window_switches": s.window_switches,
                "app_switches": s.app_switches,
                "idle_sec": s.idle_duration_sec,
            },
            "biometrics": {
                "heart_rate": s.heart_rate,
                "hrv": s.hrv,
                "stress_index": s.stress_index,
                "recovery_score": s.recovery_score,
                "sleep_score": s.sleep_score,
                "fatigue_score": s.fatigue_score,
                "cortisol_proxy": s.cortisol_proxy,
                "autonomic_load": s.autonomic_load,
            },
            "behavioral_scores": {
                "attention_fragmentation": s.attention_fragmentation_score,
                "compulsive_engagement": s.compulsive_engagement_score,
                "reward_seeking": s.reward_seeking_score,
                "cognitive_fatigue": s.cognitive_fatigue_score,
                "emotional_dependency": s.emotional_dependency_score,
                "self_regulation": s.self_regulation_score,
                "impulsivity": s.impulsivity_score,
                "gaming_escalation": s.gaming_escalation_score,
                "burnout_probability": s.burnout_probability,
                "behavioral_velocity": s.behavioral_velocity,
            },
            "risk": {
                "composite": s.composite_risk,
                "igd_contribution": s.igd_contribution,
            }
        }

    async def broadcast_loop(self):
        from app.routers.websocket import active_connections
        global settings

        while True:
            try:
                await asyncio.sleep(settings.live_refresh_rate_sec)
                if not active_connections:
                    continue
                payload = {
                    "type": "telemetry_update",
                    "data": self._snapshot_to_dict(),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                # Push to all connected dashboards
                dead = []
                for uid, ws in list(active_connections.items()):
                    try:
                        await ws.send_json(payload)
                    except Exception:
                        dead.append(uid)
                for uid in dead:
                    active_connections.pop(uid, None)

                # Buffer history (rolling 60 points)
                history_buffer.append({
                    "t": datetime.now(timezone.utc).isoformat(),
                    "composite_risk": snapshot.composite_risk,
                    "hr": snapshot.heart_rate,
                    "hrv": snapshot.hrv,
                    "stress": snapshot.stress_index,
                    "gaming": snapshot.is_gaming,
                    "session_sec": snapshot.session_duration_sec,
                })
                if len(history_buffer) > 60:
                    history_buffer.pop(0)

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.debug(f"TelemetryBroadcaster error: {e}")


# ─── ORCHESTRATOR ────────────────────────────────────────────────────────────
class TelemetryEngine:
    """
    Master orchestrator — started once from FastAPI lifespan.
    Spawns all sub-engines as concurrent async tasks.
    """
    def __init__(self):
        self.window_collector = WindowCollector()
        self.input_collector = InputCollector()
        self.session_tracker = SessionTracker()
        self.biometric_sim = BiometricSimulator()
        self.behavioral_analyzer = BehavioralAnalyzer()
        self.gemini_analyzer = GeminiAnalyzer()
        self.broadcaster = TelemetryBroadcaster()
        self._tasks: list[asyncio.Task] = []
        self.is_running = False

    async def start(self):
        self.is_running = True
        snapshot.timestamp = datetime.now(timezone.utc).isoformat()
        logger.info("🚀 MindShield Telemetry Engine starting all sub-engines...")

        # Start input hooks on daemon thread
        try:
            self.input_collector.start()
        except Exception as e:
            logger.warning(f"Input hooks unavailable (non-fatal): {e}")

        # Spawn all async loops
        self._tasks = [
            asyncio.create_task(self.window_collector.poll(),         name="window_collector"),
            asyncio.create_task(self.input_collector.sync_loop(),     name="input_sync"),
            asyncio.create_task(self.session_tracker.track_loop(),    name="session_tracker"),
            asyncio.create_task(self.biometric_sim.simulation_loop(), name="biometric_sim"),
            asyncio.create_task(self.behavioral_analyzer.compute_loop(), name="behavioral_analyzer"),
            asyncio.create_task(self.gemini_analyzer.analysis_loop(), name="gemini_analyzer"),
            asyncio.create_task(self.broadcaster.broadcast_loop(),    name="broadcaster"),
        ]
        logger.info("✅ All telemetry sub-engines active.")

        # Keep alive
        try:
            await asyncio.gather(*self._tasks)
        except asyncio.CancelledError:
            pass

    def stop(self):
        self.is_running = False
        self.input_collector.stop()
        for task in self._tasks:
            task.cancel()
        logger.info("🔴 TelemetryEngine stopped.")


# Singleton
telemetry_engine = TelemetryEngine()
