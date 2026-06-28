"use client";

import { useState, useEffect } from "react";
import { Sparkles, AlertTriangle, Send, Activity, ShieldCheck, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { GlassPanel } from "@/components/shared/risk-ui";
import { MindstrandFusionMeter } from "@/components/dashboard/mindstrand-fusion-meter";
import { FusionExplainabilityCard } from "@/components/dashboard/fusion-explainability-card";
import { evaluateFusion } from "@/lib/api/client";

const mockFusionHistory = [
  { day: "Day 1", score: 68 },
  { day: "Day 2", score: 70 },
  { day: "Day 3", score: 65 },
  { day: "Day 4", score: 72 },
  { day: "Day 5", score: 74 },
  { day: "Day 6", score: 71 },
  { day: "Day 7", score: 75 },
  { day: "Day 8", score: 78 },
  { day: "Day 9", score: 76 },
  { day: "Day 10", score: 80 },
  { day: "Day 11", score: 77 },
  { day: "Day 12", score: 73 },
  { day: "Day 13", score: 75 },
  { day: "Day 14", score: 74.8 },
];

export default function FusionModule() {
  const [igd, setIgd] = useState("");
  const [bdd, setBdd] = useState("");
  const [physio, setPhysio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    evaluateFusion("demo-token", {
      igd_score: 80,
      bdd_score: 70,
      physiological_score: 85,
      mood_score: 4,
      sleep_score: 35
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
      setIgd("");
      setBdd("");
      setPhysio("");
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
              <Sparkles className="w-6 h-6 text-[#7c54ff]" />
              Wellness Fusion Engine: MINDSTRAND SCORE™
            </h1>
            <p className="text-xs font-mono text-[#8b8aa0] mt-1 tracking-wider uppercase">
              Global Positive Vitality & Harmonic Multi-Signal Alignment
            </p>
          </div>
          <div className="flex items-center gap-3">
            {loading && <span className="text-[10px] font-mono text-[#7c54ff] animate-pulse">Computing Vitality Vectors...</span>}
            {error && <span className="text-[10px] font-mono text-[#f59e0b]">Offline Mock Mode</span>}
            <span className="flex items-center gap-2 text-[10px] font-mono border border-[#7c54ff]/30 bg-[#7c54ff]/10 text-[#7c54ff] px-2.5 py-1 rounded font-bold">
              ⚡ VITALITY TIER: {apiData ? `${apiData.tier?.toUpperCase()} (${apiData.mindstrand_score})` : "STABLE (74.8)"}
            </span>
          </div>
        </header>

        {/* Top Grid: Hero Orb + Explainability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MindstrandFusionMeter data={apiData} />
          <FusionExplainabilityCard explainability={apiData?.explainability} />
        </div>

        {/* Middle Section: Longitudinal Chart */}
        <GlassPanel className="p-6 border-t-2 border-t-[#22d3a0]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#22d3a0]" />
                14-Day MINDSTRAND SCORE™ Longitudinal Trajectory
              </h3>
              <p className="text-[10px] font-mono text-[#8b8aa0] mt-0.5 uppercase tracking-wider">
                Holistic Vitality Progression vs. Digital Recovery Protocols
              </p>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockFusionHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c54ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c54ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="day" stroke="#8b8aa0" tick={{ fill: "#8b8aa0", fontSize: 11 }} />
                <YAxis stroke="#8b8aa0" domain={[0, 100]} tick={{ fill: "#8b8aa0", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace" }}
                />
                <Area type="monotone" dataKey="score" name="MINDSTRAND SCORE™" stroke="#7c54ff" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* Bottom Section: Real-time Vitality Simulation Calibration */}
        <GlassPanel className="p-6">
          <h3 className="text-sm font-bold font-mono tracking-tight text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7c54ff]" />
            Simulate Vitality Vector Adjustments
          </h3>
          <p className="text-xs font-mono text-[#8b8aa0] mb-4">
            Test how mitigating acute gaming or dysmorphia triggers recalculates your global MINDSTRAND SCORE™.
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[11px] font-mono text-[#e8e6f0] mb-1">Simulated IGD Risk Score (0-100)</label>
              <input
                type="number"
                placeholder="e.g. 25"
                value={igd}
                onChange={(e) => setIgd(e.target.value)}
                className="w-full bg-[#0b0f19] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#7c54ff]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#e8e6f0] mb-1">Simulated BDD Risk Score (0-100)</label>
              <input
                type="number"
                placeholder="e.g. 20"
                value={bdd}
                onChange={(e) => setBdd(e.target.value)}
                className="w-full bg-[#0b0f19] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#7c54ff]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#e8e6f0] mb-1">Simulated Physio Distress (0-100)</label>
              <input
                type="number"
                placeholder="e.g. 30"
                value={physio}
                onChange={(e) => setPhysio(e.target.value)}
                className="w-full bg-[#0b0f19] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#7c54ff]"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#7c54ff] hover:bg-[#6842e5] text-white font-mono font-bold text-xs py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Synthesizing..." : "Recalculate Vitality"}
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {submitSuccess && (
            <div className="mt-3 text-xs font-mono text-[#22d3a0] bg-[#22d3a0]/10 border border-[#22d3a0]/30 px-3 py-2 rounded">
              ✓ Multi-stream inputs synthesized. MINDSTRAND SCORE™ updated successfully.
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
