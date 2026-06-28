"use client";

import { GlassPanel } from "@/components/shared/risk-ui";
import { Activity, Heart, Moon, Zap } from "lucide-react";

export function PhysiologicalGaugeGrid({ scores }: { scores?: any }) {
  const data = scores || {
    physiological_distress_score: 64.2,
    stress_index: 71.5,
    recovery_index: 42.0,
    sleep_index: 58.0,
  };

  const gauges = [
    { label: "Physiological Distress", value: data.physiological_distress_score, unit: "/100", color: "#ef4444", icon: Activity, desc: "Composite Autonomic Overload" },
    { label: "Sympathetic Stress", value: data.stress_index, unit: "/100", color: "#f97316", icon: Zap, desc: "Fight-or-Flight Dominance" },
    { label: "Autonomic Recovery", value: data.recovery_index, unit: "/100", color: "#22d3a0", icon: Heart, desc: "Parasympathetic Rebound" },
    { label: "Restorative Sleep", value: data.sleep_index, unit: "/100", color: "#a78bff", icon: Moon, desc: "Duration & Efficiency Efficiency" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {gauges.map((g, idx) => {
        const Icon = g.icon;
        return (
          <GlassPanel key={idx} className="p-5 flex flex-col justify-between border-t-2" style={{ borderTopColor: g.color }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-white tracking-tight">{g.label}</span>
              <Icon className="w-4 h-4" style={{ color: g.color }} />
            </div>
            
            <div className="my-2">
              <div className="text-2xl font-bold font-mono tracking-tighter text-white">
                {g.value} <span className="text-xs text-[#8b8aa0] font-normal">{g.unit}</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${g.value}%`, backgroundColor: g.color }}
                />
              </div>
            </div>

            <div className="text-[10px] font-mono text-[#8b8aa0] mt-2 uppercase tracking-wider">
              {g.desc}
            </div>
          </GlassPanel>
        );
      })}
    </div>
  );
}
