"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/risk-ui";
import { Sparkles, Activity, ShieldAlert } from "lucide-react";

export function BDDExplainabilityPanel({ explainability }: { explainability?: any }) {
  const drivers = explainability?.top_drivers || [
    { dimension: "Social Peer Comparison", contribution_pct: 34.0, score: 82.0, color: "#ef4444" },
    { dimension: "Appearance Anxiety", contribution_pct: 28.5, score: 74.2, color: "#f97316" },
    { dimension: "Obsession & Checking", contribution_pct: 22.0, score: 71.0, color: "#f59e0b" },
    { dimension: "Self-Esteem Deficit", contribution_pct: 15.5, score: 38.5, color: "#a78bff" }
  ];

  const summary = explainability?.summary || "BDD Risk evaluated at 67.4 (HIGH). Primary drivers identified across social media peer comparison and appearance anxiety.";

  return (
    <GlassPanel className="p-6 h-full flex flex-col justify-between border-t-2 border-t-[#ef4444]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ef4444]" />
            BDD AI Explainability Engine
          </h3>
          <span className="text-[10px] font-mono text-[#8b8aa0] uppercase tracking-wider">
            SHAP Signal Weighting
          </span>
        </div>

        <p className="text-xs font-mono text-[#e8e6f0] bg-white/[0.03] p-3 rounded border border-white/[0.06] leading-relaxed mb-5">
          {summary}
        </p>

        <div className="space-y-4">
          {drivers.map((d: any, idx: number) => (
            <div key={idx} className="group">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#e8e6f0]">{d.dimension}</span>
                <span className="text-[#8b8aa0]">Score: <strong className="text-white">{d.score}</strong> ({d.contribution_pct}% impact)</span>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: d.color || "#a78bff" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${d.contribution_pct * 2.5}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-3 rounded bg-[#a78bff]/10 border border-[#a78bff]/20 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-[#a78bff] flex-shrink-0 mt-0.5" />
        <div className="text-[11px] font-mono text-[#e8e6f0] leading-normal">
          <strong className="text-white">Recommended Socratic ERP:</strong> Prompt patient to delay mirror checking rituals by 15 minutes during peak morning distress windows.
        </div>
      </div>
    </GlassPanel>
  );
}
