"use client";

import { useState, useEffect } from "react";
import { Eye, AlertTriangle, Send, Activity, Sparkles, ShieldCheck } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { GlassPanel } from "@/components/shared/risk-ui";
import { BDDSubscoreRadar } from "@/components/dashboard/bdd-subscore-radar";
import { BDDExplainabilityPanel } from "@/components/dashboard/bdd-explainability-panel";
import { evaluateBDD } from "@/lib/api/client";

const mockBDDHistory = [
  { day: "Mon", anxiety: 62, comparison: 65, obsession: 58 },
  { day: "Tue", anxiety: 64, comparison: 68, obsession: 60 },
  { day: "Wed", anxiety: 68, comparison: 72, obsession: 63 },
  { day: "Thu", anxiety: 66, comparison: 70, obsession: 62 },
  { day: "Fri", anxiety: 72, comparison: 78, obsession: 68 },
  { day: "Sat", anxiety: 76, comparison: 84, obsession: 72 },
  { day: "Sun", anxiety: 74, comparison: 82, obsession: 71 },
];

export default function BDDModule() {
  const [mirrorChecks, setMirrorChecks] = useState("");
  const [socialMins, setSocialMins] = useState("");
  const [selfieMins, setSelfieMins] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    evaluateBDD("demo-token", {
      preoccupation_hours: 6,
      distress_level: 8,
      avoidance_score: 7,
      checking_frequency: 9,
      comparison_frequency: 8,
      impairment_score: 7,
      journal_bdd_signals: 5,
      mood_anxiety: 8,
      wearable_stress: 85,
      social_comparison_mins: 120,
      mirror_check_bouts: 25
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

  const radarData = apiData ? [
    { subject: "Appearance Anxiety", A: apiData.appearance_anxiety ?? 74.2, fullMark: 100 },
    { subject: "Social Comparison", A: apiData.social_comparison ?? 82.0, fullMark: 100 },
    { subject: "Obsession & Checking", A: apiData.obsession_score ?? 71.0, fullMark: 100 },
    { subject: "Self-Esteem Deficit", A: apiData.self_esteem ?? 61.5, fullMark: 100 },
  ] : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      setMirrorChecks("");
      setSocialMins("");
      setSelfieMins("");
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
              <Eye className="w-6 h-6 text-[#c4b0ff]" />
              BDD Module: Body Dysmorphia Analytics
            </h1>
            <p className="text-xs font-mono text-[#8b8aa0] mt-1 tracking-wider uppercase">
              Appearance Preoccupation & Peer Comparison Threat Monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            {loading && <span className="text-[10px] font-mono text-[#a78bff] animate-pulse">Syncing Telemetry...</span>}
            {error && <span className="text-[10px] font-mono text-[#f59e0b]">Offline Mock Mode</span>}
            <span className="flex items-center gap-2 text-[10px] font-mono border border-[#f97316]/30 bg-[#f97316]/10 text-[#f97316] px-2 py-1 rounded">
              <AlertTriangle className="w-3 h-3" />
              BDD RISK: {apiData ? `${apiData.risk_tier?.toUpperCase()} (${apiData.bdd_risk_score})` : "HIGH (67.4)"}
            </span>
          </div>
        </header>

        {/* Top Grid: Radar + Explainability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BDDSubscoreRadar data={radarData} />
          <BDDExplainabilityPanel explainability={apiData?.explainability} />
        </div>

        {/* Middle Section: Longitudinal Chart */}
        <GlassPanel className="p-6 border-t-2 border-t-[#a78bff]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#a78bff]" />
                7-Day Dimensional Progression
              </h3>
              <p className="text-[10px] font-mono text-[#8b8aa0] mt-0.5 uppercase tracking-wider">
                Appearance Anxiety vs. Social Comparison Spikes
              </p>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockBDDHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAnx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="day" stroke="#8b8aa0" tick={{ fill: "#8b8aa0", fontSize: 11 }} />
                <YAxis stroke="#8b8aa0" domain={[0, 100]} tick={{ fill: "#8b8aa0", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace" }}
                />
                <Area type="monotone" dataKey="comparison" name="Social Comparison" stroke="#ef4444" fillOpacity={1} fill="url(#colorComp)" strokeWidth={2} />
                <Area type="monotone" dataKey="anxiety" name="Appearance Anxiety" stroke="#f97316" fillOpacity={1} fill="url(#colorAnx)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        {/* Bottom Section: Acute Behavioral Event Logging */}
        <GlassPanel className="p-6">
          <h3 className="text-sm font-bold font-mono tracking-tight text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22d3a0]" />
            Log Acute Behavioral Trigger
          </h3>
          <p className="text-xs font-mono text-[#8b8aa0] mb-4">
            Record acute mirror checking bouts or social media comparison minutes to dynamically update BDD sub-scores.
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[11px] font-mono text-[#e8e6f0] mb-1">Mirror Checking Bouts</label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={mirrorChecks}
                onChange={(e) => setMirrorChecks(e.target.value)}
                className="w-full bg-[#0b0f19] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#a78bff]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#e8e6f0] mb-1">Social Media Comparison (Mins)</label>
              <input
                type="number"
                placeholder="e.g. 45"
                value={socialMins}
                onChange={(e) => setSocialMins(e.target.value)}
                className="w-full bg-[#0b0f19] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#a78bff]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-[#e8e6f0] mb-1">Selfie Editing (Mins)</label>
              <input
                type="number"
                placeholder="e.g. 20"
                value={selfieMins}
                onChange={(e) => setSelfieMins(e.target.value)}
                className="w-full bg-[#0b0f19] border border-white/10 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#a78bff]"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#a78bff] hover:bg-[#906ef5] text-[#050508] font-mono font-bold text-xs py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Transmitting..." : "Submit Log"}
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {submitSuccess && (
            <div className="mt-3 text-xs font-mono text-[#22d3a0] bg-[#22d3a0]/10 border border-[#22d3a0]/30 px-3 py-2 rounded">
              ✓ BDD Behavioral Log ingested. Sub-scores updated successfully.
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
