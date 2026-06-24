"use client";

import { motion } from "framer-motion";
import { GlassPanel, WidgetHeader, AnimatedScore, RiskBadge } from "@/components/shared/risk-ui";
import { WearableSnapshot } from "@/lib/types/mhoc";

export function StressIndex({
  score,
  liveBpm,
  hrv,
  onClick,
}: {
  score: number;
  liveBpm?: number;
  hrv?: number;
  onClick?: () => void;
}) {
  const isHigh = score >= 60;
  
  return (
    <GlassPanel hover onClick={onClick} className="p-4 flex flex-col justify-between h-full relative">
      <WidgetHeader title="Stress Index" />

      <div className="flex items-center gap-4 flex-grow">
        {/* Vertical Gauge Bar */}
        <div className="h-full w-4 bg-white/[0.05] rounded-full overflow-hidden relative flex-shrink-0">
          {/* Gradient track */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#22d3a0] via-[#f59e0b] to-[#ef4444] opacity-80" />
          {/* Masking element that uncovers the gradient from bottom up */}
          <motion.div 
            className="absolute top-0 left-0 right-0 bg-[#0a0a0f] border-b border-white/10"
            initial={{ height: "100%" }}
            animate={{ height: `${100 - score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        <div className="flex flex-col flex-grow">
          <div className="flex items-end gap-1 mb-2">
            <AnimatedScore value={score} size="lg" />
            <span className="text-[10px] text-[#8b8aa0] mb-1 font-mono">/100</span>
          </div>

          <div className="space-y-2 mt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#8b8aa0]">BPM:</span>
              <div className="flex items-center gap-1.5">
                {liveBpm && liveBpm > 85 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
                )}
                <span className={liveBpm && liveBpm > 85 ? "text-[#ef4444]" : "text-[#e8e6f0]"}>
                  {liveBpm || "--"} <span className="text-[9px] text-[#4a4860]">live</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#8b8aa0]">HRV:</span>
              <span className="text-[#e8e6f0]">{hrv ? `${hrv.toFixed(1)}ms` : "--"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <RiskBadge tier={isHigh ? 'high' : 'low'} showPulse={isHigh} />
      </div>
    </GlassPanel>
  );
}
