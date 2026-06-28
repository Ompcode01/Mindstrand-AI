"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Monitor, Cpu, Heart, Brain, BarChart3, Save, RotateCcw, CheckCircle } from "lucide-react";

type SettingValue = boolean | number | string;
type SettingsMap = Record<string, SettingValue>;

interface Section {
  title: string;
  icon: React.ReactNode;
  color: string;
  fields: FieldDef[];
}

interface FieldDef {
  key: string;
  label: string;
  description: string;
  type: "toggle" | "range" | "number";
  min?: number;
  max?: number;
  unit?: string;
}

const SECTIONS: Section[] = [
  {
    title: "General",
    icon: <Shield className="w-4 h-4" />,
    color: "#7c54ff",
    fields: [
      { key: "demo_mode", label: "Demo Mode", description: "Use demo-token authentication and mock persistence bypass", type: "toggle" },
      { key: "live_telemetry", label: "Live Telemetry", description: "Enable real-time Windows behavioral telemetry collection", type: "toggle" },
      { key: "ai_explainability", label: "AI Explainability", description: "Attach SHAP-style attribution explanations to all AI outputs", type: "toggle" },
      { key: "enable_simulation", label: "Enable Simulation", description: "Use simulated biometrics when wearable is not connected", type: "toggle" },
    ],
  },
  {
    title: "Game Detection",
    icon: <Monitor className="w-4 h-4" />,
    color: "#ef4444",
    fields: [
      { key: "session_trigger_duration_sec", label: "Session Trigger Duration", description: "Seconds in a detected game window before session begins", type: "range", min: 10, max: 300, unit: "s" },
      { key: "session_timeout_sec", label: "Session Timeout", description: "Idle seconds before session is ended", type: "range", min: 30, max: 600, unit: "s" },
      { key: "block_duration_sec", label: "Block Duration", description: "Mandatory cooldown lockout duration after threshold exceeded", type: "range", min: 10, max: 120, unit: "s" },
      { key: "break_reminder_interval_sec", label: "Break Reminder Interval", description: "Seconds between break nudge notifications", type: "range", min: 300, max: 3600, unit: "s" },
    ],
  },
  {
    title: "Monitoring",
    icon: <Cpu className="w-4 h-4" />,
    color: "#22d3a0",
    fields: [
      { key: "enable_keyboard_tracking", label: "Keyboard Tracking", description: "Count keypresses per session (no key content recorded)", type: "toggle" },
      { key: "enable_mouse_tracking", label: "Mouse Tracking", description: "Count clicks and movement intensity", type: "toggle" },
      { key: "enable_alt_tab_tracking", label: "Alt+Tab Tracking", description: "Track application switching behavior and frequency", type: "toggle" },
      { key: "enable_window_tracking", label: "Window Tracking", description: "Monitor active window title and process name", type: "toggle" },
      { key: "enable_idle_tracking", label: "Idle Detection", description: "Detect and measure idle periods between input bursts", type: "toggle" },
    ],
  },
  {
    title: "Wearables",
    icon: <Heart className="w-4 h-4" />,
    color: "#f97316",
    fields: [
      { key: "enable_simulated_wearables", label: "Simulated Wearables", description: "Dynamically generate HR/HRV/stress correlated to real telemetry", type: "toggle" },
    ],
  },
  {
    title: "AI",
    icon: <Brain className="w-4 h-4" />,
    color: "#a78bff",
    fields: [
      { key: "enable_gemini_analysis", label: "Gemini Analysis", description: "Run live Gemini AI clinical analysis every 2 minutes", type: "toggle" },
      { key: "enable_intervention_engine", label: "Intervention Engine", description: "Automatically generate clinical intervention recommendations", type: "toggle" },
      { key: "enable_prediction_engine", label: "Prediction Engine", description: "Run temporal risk trajectory predictions", type: "toggle" },
      { key: "gemini_analysis_interval_sec", label: "Analysis Interval", description: "How often Gemini AI analysis runs (seconds)", type: "range", min: 60, max: 600, unit: "s" },
    ],
  },
  {
    title: "Dashboard",
    icon: <BarChart3 className="w-4 h-4" />,
    color: "#f59e0b",
    fields: [
      { key: "live_refresh_rate_sec", label: "Live Refresh Rate", description: "How often the dashboard polls for updates (seconds)", type: "range", min: 1, max: 60, unit: "s" },
      { key: "risk_threshold", label: "Risk Alert Threshold", description: "Composite risk score that triggers a critical alert", type: "range", min: 50, max: 95, unit: "%" },
    ],
  },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none ${value ? "bg-[#7c54ff]" : "bg-white/[0.08]"}`}
    >
      <motion.div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ left: value ? "calc(100% - 20px)" : "4px" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

function RangeField({ def, value, onChange }: { def: FieldDef; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={def.min}
        max={def.max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1 accent-[#7c54ff] bg-white/[0.06] rounded-full"
      />
      <div className="flex items-center gap-1 min-w-[56px]">
        <span className="text-sm font-mono text-[#a78bff] font-bold">{value}</span>
        <span className="text-[9px] font-mono text-[#4a4860]">{def.unit}</span>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settingsState, setSettingsState] = useState<SettingsMap>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/settings")
      .then((r) => r.json())
      .then((d) => { setSettingsState(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const update = (key: string, value: SettingValue) => {
    setSettingsState((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch("http://localhost:8000/api/v1/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsState),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* offline */ }
    setSaving(false);
  };

  const reset = () => {
    fetch("http://localhost:8000/api/v1/settings")
      .then((r) => r.json())
      .then(setSettingsState)
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[#050508] text-[#e8e6f0]">
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#050508]/80 border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">System Settings</h1>
            <p className="text-[10px] font-mono text-[#6b6882] tracking-widest">
              MINDSHIELD MHOC — CONFIGURATION
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-[10px] font-mono text-[#6b6882] hover:text-white transition-colors px-3 py-1.5 rounded border border-white/[0.06] hover:border-white/20"
            >
              <RotateCcw className="w-3 h-3" /> RESET
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 text-[10px] font-mono bg-[#7c54ff] hover:bg-[#6b43ee] text-white px-4 py-1.5 rounded transition-colors disabled:opacity-60"
            >
              {saved ? (
                <><CheckCircle className="w-3 h-3" /> SAVED</>
              ) : (
                <><Save className="w-3 h-3" /> {saving ? "SAVING..." : "SAVE SETTINGS"}</>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6 relative z-10">
        {loading ? (
          <div className="text-center py-16 font-mono text-[#4a4860] text-sm">Loading settings...</div>
        ) : (
          SECTIONS.map((section, si) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.07 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.015] overflow-hidden"
            >
              {/* Section header */}
              <div
                className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2.5"
                style={{ backgroundColor: `${section.color}08` }}
              >
                <span style={{ color: section.color }}>{section.icon}</span>
                <h2 className="text-xs font-mono tracking-[0.15em] uppercase font-bold text-[#e8e6f0]">
                  {section.title}
                </h2>
              </div>

              {/* Fields */}
              <div className="divide-y divide-white/[0.04]">
                {section.fields.map((field) => (
                  <div key={field.key} className="px-5 py-4 flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#e8e6f0] mb-0.5">{field.label}</div>
                      <div className="text-[11px] text-[#6b6882] leading-relaxed">{field.description}</div>
                      {(field.type === "range" || field.type === "number") && (
                        <div className="mt-3 max-w-xs">
                          <RangeField
                            def={field}
                            value={Number(settingsState[field.key] ?? field.min)}
                            onChange={(v) => update(field.key, v)}
                          />
                        </div>
                      )}
                    </div>
                    {field.type === "toggle" && (
                      <div className="shrink-0 mt-0.5">
                        <Toggle
                          value={Boolean(settingsState[field.key] ?? true)}
                          onChange={(v) => update(field.key, v)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          ))
        )}

        {/* Status footer */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] px-5 py-4">
          <div className="text-[9px] font-mono text-[#4a4860] tracking-widest mb-3">ENGINE STATUS</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Window Collector", status: "ACTIVE", color: "#22d3a0" },
              { label: "Input Hooks", status: "ACTIVE", color: "#22d3a0" },
              { label: "Session Tracker", status: "ACTIVE", color: "#22d3a0" },
              { label: "Biometric Sim", status: "ACTIVE", color: "#22d3a0" },
              { label: "Behavioral Analyzer", status: "ACTIVE", color: "#22d3a0" },
              { label: "Gemini AI", status: settingsState.enable_gemini_analysis ? "ACTIVE" : "PAUSED", color: settingsState.enable_gemini_analysis ? "#22d3a0" : "#f59e0b" },
            ].map(({ label, status, color }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <div>
                  <div className="text-[9px] font-mono text-[#6b6882]">{label}</div>
                  <div className="text-[9px] font-mono font-bold" style={{ color }}>{status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
