"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/risk-ui";
import { Sparkles, ShieldAlert, HeartPulse } from "lucide-react";

export function BiometricExplainabilityCard({ explainability }: { explainability?: any }) {
  const drivers = explainability?.top_drivers || [
    { biometric: "Sympathetic Stress Index", contribution_pct: 50.1, value: "71.5 pts", status: "warning", color: "#f97316" },
    { biometric: "Autonomic Recovery Deficit", contribution_pct: 31.6, value: "42.0/100 readiness", status: "warning", color: "#ef4444" },
    { biometric: "Restorative Sleep Deficit", contribution_pct: 18.3, value: "5.8h (65% qual)", status: "normal", color: "#a78bff" }
  ];

  const summary = explainability?.summary || "Physiological Distress reached 64.2 (HIGH). Elevated Sympathetic Stress Index and suppressed Autonomic Recovery drive the overload condition.";

  return (
    <GlassPanel className="p-6 h-full flex flex-col justify-between border-t-2 border-t-[#22d3a0]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#22d3a0]" />
            Biometric Attribution & AI Explainability
          </h3>
          <span className="text-[10px] font-mono text-[#8b8aa0] uppercase tracking-wider">
            Continuous Hardware Stream
          </span>
        </div>

        <p className="text-xs font-mono text-[#e8e6f0] bg-white/[0.03] p-3 rounded border border-white/[0.06] leading-relaxed mb-5">
          {summary}
        </p>

        <div className="space-y-4">
          {drivers.map((d: any, idx: number) => (
            <div key={idx} className="group">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#e8e6f0]">{d.biometric}</span>
                <span className="text-[#8b8aa0]">Metric: <strong className="text-white">{d.value}</strong> ({d.contribution_pct}% weight)</span>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: d.color || "#22d3a0" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${d.contribution_pct * 1.8}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-3 rounded bg-[#22d3a0]/10 border border-[#22d3a0]/20 flex items-start gap-3">
        <HeartPulse className="w-4 h-4 text-[#22d3a0] flex-shrink-0 mt-0.5" />
        <div className="text-[11px] font-mono text-[#e8e6f0] leading-normal">
          <strong className="text-white">Autonomic Grounding Protocol:</strong> Engage 4-7-8 resonance breathing for 5 minutes to stimulate vagal nerve tone and restore HRV baseline.
        </div>
      </div>
    </GlassPanel>
  );
}
