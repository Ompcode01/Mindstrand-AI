"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/risk-ui";
import { Sparkles, ShieldCheck, TrendingUp } from "lucide-react";

export function FusionExplainabilityCard({ explainability }: { explainability?: any }) {
  const drivers = explainability?.drivers || [
    { vector: "Physiological Recovery", vitality: 78.0, weight_impact: 19.5, status: "positive", color: "#22d3a0" },
    { vector: "IGD Gaming Vitality", vitality: 72.0, weight_impact: 18.0, status: "positive", color: "#7c54ff" },
    { vector: "BDD Body Image Vitality", vitality: 68.5, weight_impact: 13.7, status: "positive", color: "#f59e0b" },
    { vector: "Restorative Sleep", vitality: 82.0, weight_impact: 12.3, status: "positive", color: "#a78bff" },
    { vector: "Psychological Mood", vitality: 75.0, weight_impact: 11.2, status: "positive", color: "#f97316" },
  ];

  const summary = explainability?.summary || "MINDSTRAND SCORE evaluated at 74.8 (STABLE). Balanced multi-signal vitality anchored by strong physiological recovery and restorative sleep patterns.";
  const advice = explainability?.coaching_advice || "Maintaining under 2.5 hours of recreational screen time daily aligns directly with your highest vitality peaks (>78 points).";

  return (
    <GlassPanel className="p-6 h-full flex flex-col justify-between border-t-2 border-t-[#7c54ff]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#7c54ff]" />
            Harmonic Weight Attribution (SHAP)
          </h3>
          <span className="text-[10px] font-mono text-[#8b8aa0] uppercase tracking-wider">
            Positive Vitality Uplift
          </span>
        </div>

        <p className="text-xs font-mono text-[#e8e6f0] bg-white/[0.03] p-3 rounded border border-white/[0.06] leading-relaxed mb-5">
          {summary}
        </p>

        <div className="space-y-3.5">
          {drivers.map((d: any, idx: number) => (
            <div key={idx} className="group">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#e8e6f0]">{d.vector}</span>
                <span className="text-[#8b8aa0]">Vitality: <strong className="text-white">{d.vitality}</strong> ({d.weight_impact > 0 ? `+${d.weight_impact}` : d.weight_impact} pts)</span>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: d.color || (d.status === "positive" ? "#22d3a0" : "#ef4444") }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.abs(d.vitality)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-3 rounded bg-[#7c54ff]/10 border border-[#7c54ff]/20 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-[#7c54ff] flex-shrink-0 mt-0.5" />
        <div className="text-[11px] font-mono text-[#e8e6f0] leading-normal">
          <strong className="text-white">AI Vitality Prescription:</strong> {advice}
        </div>
      </div>
    </GlassPanel>
  );
}
