"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Monitor, Cpu, Heart, Zap, Brain, AlertTriangle, ChevronRight, Radio } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TelemetryData {
  session: {
    active: boolean;
    active_game: string;
    active_title: string;
    active_exe: string;
    duration_sec: number;
    daily_play_sec: number;
  };
  input: {
    keypresses: number;
    keypress_rate: number;
    clicks: number;
    click_rate: number;
    alt_tabs: number;
    window_switches: number;
    idle_sec: number;
  };
  biometrics: {
    heart_rate: number;
    hrv: number;
    stress_index: number;
    recovery_score: number;
    sleep_score: number;
    fatigue_score: number;
  };
  behavioral_scores: {
    attention_fragmentation: number;
    compulsive_engagement: number;
    reward_seeking: number;
    cognitive_fatigue: number;
    emotional_dependency: number;
    self_regulation: number;
    impulsivity: number;
    gaming_escalation: number;
    burnout_probability: number;
    behavioral_velocity: number;
  };
  risk: { composite: number; igd_contribution: number };
}

interface AIAnalysis {
  timestamp: string;
  active_game: string;
  session_duration: string;
  session_summary: string;
  behavioral_findings: string[];
  psychological_analysis: string;
  physiological_analysis: string;
  addiction_analysis: string;
  risk_escalation: string;
  risk_contribution: { igd: number; bdd: number; physiological: number; prediction: number };
  overall_risk: number;
  primary_intervention: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-mono text-[#6b6882] w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${Math.round(value * 100)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <span className="text-[9px] font-mono w-7 text-right" style={{ color }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function BiometricGauge({ label, value, unit, color, danger }: { label: string; value: number; unit: string; color: string; danger?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-[60px]">
      <div className="text-[9px] font-mono text-[#6b6882] tracking-wider uppercase">{label}</div>
      <motion.div
        className="text-lg font-bold font-mono"
        style={{ color: danger ? "#ef4444" : color }}
        key={value}
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {value}
      </motion.div>
      <div className="text-[8px] text-[#4a4860] font-mono">{unit}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function LiveTelemetryPanel() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // HTTP poll for initial data + fallback
  const fetchSnapshot = async () => {
    try {
      const [snapRes, aiRes] = await Promise.all([
        fetch("http://localhost:8000/api/v1/telemetry/snapshot"),
        fetch("http://localhost:8000/api/v1/telemetry/ai_analysis"),
      ]);
      if (snapRes.ok) {
        const data = await snapRes.json();
        setTelemetry(data as TelemetryData);
        setLastUpdate(new Date());
      }
      if (aiRes.ok) {
        const ai = await aiRes.json();
        if (!ai.status) setAIAnalysis(ai as AIAnalysis);
      }
    } catch { /* backend may be starting */ }
  };

  // WebSocket for live push
  useEffect(() => {
    fetchSnapshot();
    pollRef.current = setInterval(fetchSnapshot, 5000); // HTTP fallback every 5s

    const connectWS = () => {
      try {
        const ws = new WebSocket("ws://localhost:8000/api/v1/ws/demo-user");
        wsRef.current = ws;
        ws.onopen = () => setWsConnected(true);
        ws.onclose = () => { setWsConnected(false); setTimeout(connectWS, 3000); };
        ws.onerror = () => setWsConnected(false);
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === "telemetry_update") {
              setTelemetry(msg.data as TelemetryData);
              setLastUpdate(new Date());
            } else if (msg.type === "ai_analysis") {
              setAIAnalysis(msg.data as AIAnalysis);
            }
          } catch { }
        };
      } catch { }
    };
    connectWS();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      wsRef.current?.close();
    };
  }, []);

  const t = telemetry;

  return (
    <div className="h-full flex flex-col gap-3 overflow-y-auto scrollbar-hide pr-1">
      {/* Header: Game Detection Banner */}
      <div className={`rounded-lg border px-4 py-2.5 flex items-center justify-between shrink-0 transition-all duration-700 ${
        t?.session?.active
          ? "bg-[#ef4444]/10 border-[#ef4444]/30"
          : "bg-white/[0.02] border-white/[0.06]"
      }`}>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: t?.session?.active ? "#ef4444" : "#22d3a0" }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: t?.session?.active ? 0.8 : 2 }}
          />
          <span className="text-[10px] font-mono font-bold text-white">
            {t?.session?.active ? `🎮 ${t.session.active_game || "Gaming Session"}` : "NO ACTIVE GAMING SESSION"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {t?.session?.active && (
            <span className="text-[10px] font-mono text-[#ef4444]">
              ⏱ {formatDuration(t.session.duration_sec)}
            </span>
          )}
          <div className={`flex items-center gap-1 text-[9px] font-mono ${wsConnected ? "text-[#22d3a0]" : "text-[#6b6882]"}`}>
            <Radio className="w-2.5 h-2.5" />
            {wsConnected ? "LIVE" : "POLLING"}
          </div>
        </div>
      </div>

      {/* Biometrics Row */}
      <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 shrink-0">
        <div className="text-[9px] font-mono text-[#6b6882] tracking-widest mb-2.5">BIOMETRICS</div>
        <div className="flex justify-between">
          <BiometricGauge label="HR" value={Math.round(t?.biometrics?.heart_rate ?? 72)} unit="BPM" color="#f97316" danger={(t?.biometrics?.heart_rate ?? 0) > 100} />
          <BiometricGauge label="HRV" value={Math.round(t?.biometrics?.hrv ?? 45)} unit="ms" color="#22d3a0" danger={(t?.biometrics?.hrv ?? 100) < 20} />
          <BiometricGauge label="STRESS" value={Math.round(t?.biometrics?.stress_index ?? 25)} unit="/100" color="#ef4444" />
          <BiometricGauge label="RECOVERY" value={Math.round(t?.biometrics?.recovery_score ?? 80)} unit="%" color="#7c54ff" />
          <BiometricGauge label="FATIGUE" value={Math.round(t?.biometrics?.fatigue_score ?? 20)} unit="%" color="#f59e0b" />
        </div>
      </div>

      {/* Input Telemetry Row */}
      <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 shrink-0">
        <div className="text-[9px] font-mono text-[#6b6882] tracking-widest mb-2">INPUT TELEMETRY (REAL)</div>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1">
          {[
            ["Keypresses", t?.input?.keypresses ?? 0],
            ["Clicks", t?.input?.clicks ?? 0],
            ["Alt-Tabs", t?.input?.alt_tabs ?? 0],
            ["Keys/sec", t?.input?.keypress_rate?.toFixed(1) ?? "0.0"],
            ["Window Switches", t?.input?.window_switches ?? 0],
            ["Idle", `${t?.input?.idle_sec ?? 0}s`],
          ].map(([k, v]) => (
            <div key={String(k)} className="flex justify-between items-center">
              <span className="text-[9px] font-mono text-[#6b6882]">{k}</span>
              <span className="text-[9px] font-mono text-[#a78bff] font-bold">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Score Bars */}
      <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 shrink-0">
        <div className="text-[9px] font-mono text-[#6b6882] tracking-widest mb-2">BEHAVIORAL SIGNALS (INFERRED)</div>
        <div className="space-y-1.5">
          {t?.behavioral_scores && [
            { label: "Compulsive Engagement", key: "compulsive_engagement", color: "#ef4444" },
            { label: "Gaming Escalation", key: "gaming_escalation", color: "#f97316" },
            { label: "Attention Fragmentation", key: "attention_fragmentation", color: "#f59e0b" },
            { label: "Emotional Dependency", key: "emotional_dependency", color: "#a78bff" },
            { label: "Reward Seeking", key: "reward_seeking", color: "#7c54ff" },
            { label: "Impulsivity", key: "impulsivity", color: "#f97316" },
            { label: "Cognitive Fatigue", key: "cognitive_fatigue", color: "#22d3a0" },
            { label: "Burnout Probability", key: "burnout_probability", color: "#6b6882" },
            { label: "Self-Regulation", key: "self_regulation", color: "#22d3a0" },
            { label: "Behavioral Velocity", key: "behavioral_velocity", color: "#a78bff" },
          ].map(({ label, key, color }) => (
            <ScoreBar
              key={key}
              label={label}
              value={(t.behavioral_scores as Record<string, number>)[key] ?? 0}
              color={color}
            />
          ))}
        </div>
      </div>

      {/* Composite Risk */}
      <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-[#a78bff]" />
          <span className="text-[10px] font-mono text-[#e8e6f0]">COMPOSITE RISK</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: (t?.risk?.composite ?? 0) > 70 ? "#ef4444" : (t?.risk?.composite ?? 0) > 50 ? "#f97316" : "#22d3a0" }}
              animate={{ width: `${t?.risk?.composite ?? 30}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <span className="text-sm font-bold font-mono" style={{
            color: (t?.risk?.composite ?? 0) > 70 ? "#ef4444" : (t?.risk?.composite ?? 0) > 50 ? "#f97316" : "#22d3a0"
          }}>
            {Math.round(t?.risk?.composite ?? 30)}/100
          </span>
        </div>
      </div>

      {/* AI Analysis Block */}
      <AnimatePresence>
        {aiAnalysis && (
          <motion.div
            key="ai-analysis"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-[#7c54ff]/5 border border-[#7c54ff]/20 p-3 shrink-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#a78bff]" />
                <span className="text-[9px] font-mono text-[#a78bff] tracking-widest">LIVE GEMINI ANALYSIS</span>
              </div>
              <span className="text-[8px] font-mono text-[#4a4860]">
                {new Date(aiAnalysis.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-[10px] text-[#c4c2d4] leading-relaxed mb-2">{aiAnalysis.session_summary}</p>
            {aiAnalysis.behavioral_findings?.length > 0 && (
              <div className="space-y-1 mb-2">
                {aiAnalysis.behavioral_findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <ChevronRight className="w-2.5 h-2.5 text-[#f97316] shrink-0 mt-0.5" />
                    <span className="text-[9px] text-[#a09ab8]">{f}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 p-2 bg-[#22d3a0]/5 border border-[#22d3a0]/15 rounded text-[9px] text-[#22d3a0] font-mono">
              → {aiAnalysis.primary_intervention}
            </div>
            {/* Risk contribution */}
            <div className="mt-2 flex gap-2">
              {Object.entries(aiAnalysis.risk_contribution || {}).map(([k, v]) => (
                <div key={k} className="text-center">
                  <div className="text-[8px] text-[#4a4860] uppercase font-mono">{k}</div>
                  <div className="text-[9px] font-bold font-mono text-[#f97316]">+{Number(v).toFixed(1)}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!aiAnalysis && (
        <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3 text-center shrink-0">
          <Zap className="w-4 h-4 text-[#4a4860] mx-auto mb-1" />
          <p className="text-[9px] font-mono text-[#4a4860]">Gemini AI analysis generates every 2 minutes...</p>
        </div>
      )}

      {lastUpdate && (
        <div className="text-[8px] font-mono text-[#2e2c3e] text-center shrink-0">
          LAST UPDATE: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
