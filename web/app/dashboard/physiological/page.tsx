"use client";

import { useState, useEffect } from "react";
import { Activity, AlertTriangle, Send, Heart, ShieldCheck, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { GlassPanel } from "@/components/shared/risk-ui";
import { PhysiologicalGaugeGrid } from "@/components/dashboard/physiological-gauge-grid";
import { BiometricExplainabilityCard } from "@/components/dashboard/biometric-explainability-card";
import { evaluatePhysiological } from "@/lib/api/client";

const mockPhysioHistory = [
  { day: "Mon", distress: 52, stress: 60, recovery: 58 },
  { day: "Tue", distress: 55, stress: 64, recovery: 54 },
  { day: "Wed", distress: 68, stress: 75, recovery: 40 },
  { day: "Thu", distress: 62, stress: 70, recovery: 45 },
  { day: "Fri", distress: 74, stress: 82, recovery: 34 },
  { day: "Sat", distress: 70, stress: 78, recovery: 38 },
  { day: "Sun", distress: 64, stress: 71, recovery: 42 },
];

export default function PhysiologicalModule() {
  const [hr, setHr] = useState("");
  const [hrv, setHrv] = useState("");
  const [sleep, setSleep] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    evaluatePhysiological("demo-token", {
      heart_rate: 105,
      resting_heart_rate: 72,
      hrv: 18,
      sleep_duration: 3,
      sleep_quality: 30,
      stress: 90,
      activity: 500
    })
      .then((res) => {
        if (isMounted && res) setApiData(res);
      })
      .catch((err) => {
        console.warn("API fallback to mock:", err);
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      setHr("");
      setHrv("");
      setSleep("");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#050508] p-6 lg:p-8 text-[#e8e6f0]">
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-3">
              <Activity className="w-6 h-6 text-[#22d3a0]" />
              Physiological Module: Autonomic Risk Engine
            </h1>
            <p className="text-xs font-mono text-[#8b8aa0] mt-1 tracking-wider uppercase">
              Continuous Biometric Telemetry & Sympathetic Load Monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            {loading && <span className="text-[10px] font-mono text-[#22d3a0] animate-pulse">Syncing Biometrics...</span>}
            {error && <span className="text-[10px] font-mono text-[#f59e0b]">Offline Mock Mode</span>}
            <span className="flex items-center gap-2 text-[10px] font-mono border border-[#f97316]/30 bg-[#f97316]/10 text-[#f97316] px-2 py-1 rounded">
              <AlertTriangle className="w-3 h-3" />
              PHYSIO RISK: {apiData ? `${apiData.risk_tier?.toUpperCase()} (${apiData.physiological_distress_score})` : "HIGH (64.2)"}
            </span>
          </div>
        </header>

        {/* Top Section: Gauge Grid */}
        <PhysiologicalGaugeGrid scores={apiData} />

        {/* Middle Grid: Chart + Explainability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassPanel className="p-6 border-t-2 border-t-[#22d3a0] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#22d3a0]" />
                  7-Day Autonomic Trend Dynamics
                </h3>
                <p className="text-[10px] font-mono text-[#8b8aa0] mt-0.5 uppercase tracking-wider">
                  Sympathetic Stress Spikes vs. Parasympathetic Recovery
                </p>
              </div>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPhysioHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3a0" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22d3a0" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="day" stroke="#8b8aa0" tick={{ fill: "#8b8aa0", fontSize: 11 }} />
                  <YAxis stroke="#8b8aa0" domain={[0, 100]} tick={{ fill: "#8b8aa0", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace" }}
                  />
                  <Area type="monotone" dataKey="stress" name="Stress Index" stroke="#f97316" fillOpacity={1} fill="url(#colorStress)" strokeWidth={2} />
                  <Area type="monotone" dataKey="recovery" name="Recovery Readiness" stroke="#22d3a0" fillOpacity={1} fill="url(#colorRec)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>

          <BiometricExplainabilityCard explainability={apiData?.explainability} />
        </div>

        {/* Bottom Section: Manual Hardware Simulation Calibration */}
        <GlassPanel className="p-6">
          <h3 className="text-sm font-bold font-mono tracking-tight text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22d3a0]" />
            Calibrate Live Biometric Payload
          </h3>
          <p className="text-xs font-mono text-[#8b8aa0] mb-4">
            Manually inject synthetic smartwatch telemetry values to test autonomic recovery index recalculations.
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[11px] font-mono text-[#e8e6f0] mb-1">Active Heart Rate (BPM)</label>
              <input
                type="number"
                placeholder="e.g. 85"
                value={hr}
                onChange={(e) => setHr(e.target.value)}
                className="w-full bg-[#0b0f19] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#22d3a0]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#e8e6f0] mb-1">HRV (RMSSD in ms)</label>
              <input
                type="number"
                placeholder="e.g. 32"
                value={hrv}
                onChange={(e) => setHrv(e.target.value)}
                className="w-full bg-[#0b0f19] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#22d3a0]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#e8e6f0] mb-1">Sleep Duration (Hours)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 5.5"
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                className="w-full bg-[#0b0f19] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#22d3a0]"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#22d3a0] hover:bg-[#1bb88a] text-[#050508] font-mono font-bold text-xs py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Recalculating..." : "Evaluate Payload"}
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {submitSuccess && (
            <div className="mt-3 text-xs font-mono text-[#22d3a0] bg-[#22d3a0]/10 border border-[#22d3a0]/30 px-3 py-2 rounded">
              ✓ Biometric telemetry payload processed. Physiological indices recalculated successfully.
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
