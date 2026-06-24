"use client";

import { motion } from "framer-motion";
import { GlassPanel, AnimatedScore, WidgetHeader, DeltaIndicator } from "@/components/shared/risk-ui";

export function WellnessScore({
  compositeScore,
  delta24h,
  onClick,
}: {
  compositeScore: number;
  delta24h: number | null;
  onClick?: () => void;
}) {
  const score = Math.max(0, 100 - compositeScore);
  
  // Inverse logic for Wellness
  const getWellnessLevel = (s: number) => {
    if (s >= 80) return { label: 'THRIVING', color: '#22d3a0' };
    if (s >= 60) return { label: 'STABLE', color: '#7c54ff' };
    if (s >= 40) return { label: 'MONITORING', color: '#f59e0b' };
    if (s >= 20) return { label: 'STRUGGLING', color: '#f97316' };
    return { label: 'CRISIS', color: '#ef4444' };
  };

  const level = getWellnessLevel(score);

  return (
    <GlassPanel hover onClick={onClick} className="p-4 flex flex-col justify-between h-full relative">
      <WidgetHeader title="Wellness Score" />

      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="relative">
          <AnimatedScore value={score} size="lg" className="mb-1" />
          {/* Subtle pulse ring behind the score */}
          <div 
            className="absolute inset-0 rounded-full scale-150 opacity-20 blur-md -z-10"
            style={{ backgroundColor: level.color }}
          />
        </div>
        
        <div 
          className="text-[10px] font-mono tracking-widest uppercase font-bold"
          style={{ color: level.color }}
        >
          {level.label}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-1.5">
          <DeltaIndicator delta={delta24h ? -delta24h : null} />
          <span className="text-[9px] font-mono text-[#8b8aa0]">{Math.round(score)}%</span>
        </div>
        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full"
            style={{ backgroundColor: level.color }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </GlassPanel>
  );
}
