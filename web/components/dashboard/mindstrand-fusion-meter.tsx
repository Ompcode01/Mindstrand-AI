"use client";

import { GlassPanel } from "@/components/shared/risk-ui";
import { Sparkles, Shield, Heart, Zap, Gamepad2, Moon } from "lucide-react";

export function MindstrandFusionMeter({ data }: { data?: any }) {
  const score = data?.mindstrand_score ?? 74.8;
  const tier = data?.tier ?? "stable";

  const getTierDetails = (t: string) => {
    switch (t) {
      case "thriving": return { label: "✨ THRIVING VITALITY", color: "#22d3a0", border: "#22d3a0" };
      case "stable": return { label: "⚡ STABLE RESILIENCE", color: "#7c54ff", border: "#7c54ff" };
      case "monitoring": return { label: "🛡️ MONITORING REQUIRED", color: "#f59e0b", border: "#f59e0b" };
      default: return { label: "🚨 SYSTEMIC DRAG", color: "#ef4444", border: "#ef4444" };
    }
  };

  const td = getTierDetails(tier);

  const vectors = [
    { label: "Physiological Recovery", value: data?.physio_vitality ?? 78.0, icon: Heart, color: "#22d3a0" },
    { label: "Restorative Sleep", value: data?.sleep_vitality ?? 82.0, icon: Moon, color: "#a78bff" },
    { label: "IGD Gaming Vitality", value: data?.igd_vitality ?? 72.0, icon: Gamepad2, color: "#7c54ff" },
    { label: "Psychological Mood", value: data?.mood_vitality ?? 75.0, icon: Zap, color: "#f97316" },
    { label: "BDD Body Vitality", value: data?.bdd_vitality ?? 68.5, icon: Shield, color: "#f59e0b" },
  ];

  return (
    <GlassPanel className="p-6 h-full flex flex-col justify-between border-t-2" style={{ borderTopColor: td.color }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: td.color }} />
            MINDSTRAND SCORE™ — Global Vitality Index
          </h3>
          <p className="text-[10px] font-mono text-[#8b8aa0] mt-0.5 uppercase tracking-wider">
            Holistic 5-Stream Behavioral & Biometric Fusion
          </p>
        </div>
        <span 
          className="text-[10px] font-mono px-2.5 py-1 rounded border font-bold"
          style={{ borderColor: `${td.color}40`, backgroundColor: `${td.color}15`, color: td.color }}
        >
          {td.label}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center my-6 py-4 relative">
        <div 
          className="w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 relative z-10 shadow-2xl transition-all duration-700"
          style={{ borderColor: td.color, backgroundColor: "#0b0f1990", boxShadow: `0 0 30px ${td.color}30` }}
        >
          <span className="text-4xl font-black font-mono tracking-tighter text-white">
            {score}
          </span>
          <span className="text-[10px] font-mono text-[#8b8aa0] uppercase tracking-widest mt-1">
            / 100 VITALITY
          </span>
        </div>
        
        {/* Ambient background glow ring */}
        <div 
          className="absolute w-44 h-44 rounded-full blur-xl opacity-20 pointer-events-none -z-0"
          style={{ backgroundColor: td.color }}
        />
      </div>

      <div className="space-y-2.5 pt-4 border-t border-white/[0.06]">
        {vectors.map((v, idx) => {
          const Icon = v.icon;
          return (
            <div key={idx} className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-[#e8e6f0]">
                <Icon className="w-3.5 h-3.5" style={{ color: v.color }} />
                {v.label}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${v.value}%`, backgroundColor: v.color }} />
                </div>
                <span className="w-8 text-right font-bold text-white">{v.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
}
