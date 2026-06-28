"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/risk-ui";
import { Sparkles, Activity } from "lucide-react";

export function SOCExplainabilityPanel({ data }: { data?: any }) {
  const drivers = data?.primary_drivers ? data.primary_drivers.map((d: any) => ({
    factor: d.factor,
    velocity: d.velocity,
    impact: d.projected_14d_impact,
    pct: d.severity === "critical" ? 60 : 45,
    color: d.severity === "critical" ? "#ef4444" : "#f97316"
  })) : [
    { factor: "Recreational Gaming Acceleration", velocity: "+0.35h / day", impact: "+14.7 pts", pct: 60, color: "#ef4444" },
    { factor: "Restorative Sleep Degradation", velocity: "-0.20h / night", impact: "+11.2 pts", pct: 45, color: "#f97316" },
    { factor: "Autonomic HRV Suppression", velocity: "-1.2ms / day", impact: "+13.4 pts", pct: 50, color: "#f59e0b" },
    { factor: "BDD Appearance Checking", velocity: "+15m / day", impact: "+6.8 pts", pct: 30, color: "#a78bff" },
  ];

  const summary = data?.explainability_summary ?? "Temporal risk surge projected to reach 89/100 driven by compounding late-night gaming velocity coupled with autonomic sleep debt.";

  return (
    <GlassPanel className="p-5 flex flex-col justify-between border-t-2 border-t-[#a78bff] h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#a78bff]" />
            SOC AI Explainability & SHAP Attribution
          </h3>
          <span className="text-[10px] font-mono text-[#8b8aa0] uppercase tracking-wider">
            Compounding Velocity Drivers
          </span>
        </div>

        <p className="text-xs font-mono text-[#e8e6f0] bg-white/[0.03] p-3 rounded border border-white/[0.06] leading-relaxed mb-4">
          {summary}
        </p>

        <div className="space-y-3.5">
          {drivers.map((d: any, idx: number) => (
            <div key={idx} className="group">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-[#e8e6f0]">{d.factor} ({d.velocity})</span>
                <span className="text-[#8b8aa0]">14d Surge: <strong className="text-white">{d.impact}</strong></span>
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: d.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${d.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
