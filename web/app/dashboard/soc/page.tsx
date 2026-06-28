"use client";

import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Activity } from "lucide-react";
import { SOCRiskHeatmap } from "@/components/dashboard/soc-risk-heatmap";
import { SOCBehavioralTimeline } from "@/components/dashboard/soc-behavioral-timeline";
import { SOCWellnessTimeline } from "@/components/dashboard/soc-wellness-timeline";
import { SOCPredictiveTimeline } from "@/components/dashboard/soc-predictive-timeline";
import { SOCExplainabilityPanel } from "@/components/dashboard/soc-explainability-panel";
import { SOCInterventionFeed } from "@/components/dashboard/soc-intervention-feed";
import { evaluatePrediction } from "@/lib/api/client";

export default function SOCMasterDashboard() {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    evaluatePrediction("demo-token", {
      current_risk: 72,
      gaming_daily_slope_hrs: 0.35,
      sleep_daily_slope_hrs: -0.2,
      hrv_daily_slope_ms: -1.2
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
  return (
    <div className="min-h-screen bg-[#050508] p-6 lg:p-8 text-[#e8e6f0]">
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-3">
              <Shield className="w-6 h-6 text-[#ef4444] animate-pulse" />
              Mental Health SOC™ — Master Operations Center
            </h1>
            <p className="text-xs font-mono text-[#8b8aa0] mt-1 tracking-wider uppercase">
              Predictive Telemetry Ingestion, Risk Heatmaps & Automated Intervention Pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            {loading && <span className="text-xs font-mono text-[#ef4444] animate-pulse">Projecting Trajectory...</span>}
            {error && <span className="text-xs font-mono text-[#f59e0b]">Offline Mock Mode</span>}
            <span className="flex items-center gap-2 text-xs font-mono border border-[#ef4444]/40 bg-[#ef4444]/15 text-[#ef4444] px-3 py-1.5 rounded font-bold shadow-[0_0_15px_#ef444440]">
              <AlertTriangle className="w-4 h-4" />
              SOC STATUS: PREDICTIVE SURGE ({apiData ? `${apiData.current_risk} \u2192 ${apiData.predicted_risk_14d}` : "72 \u2192 89"})
            </span>
          </div>
        </header>

        {/* Top Section: Risk Heatmap + Predictive Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SOCRiskHeatmap />
          <SOCPredictiveTimeline data={apiData} />
        </div>

        {/* Middle Section: Explainability + Intervention Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SOCExplainabilityPanel data={apiData} />
          <SOCInterventionFeed />
        </div>

        {/* Bottom Section: Twin Timelines (Behavioral vs Wellness) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SOCBehavioralTimeline />
          <SOCWellnessTimeline />
        </div>
      </div>
    </div>
  );
}
