"use client";

import { motion } from "framer-motion";
import { GlassPanel, WidgetHeader, AnimatedScore, RiskBadge } from "@/components/shared/risk-ui";

export function SleepIndex({
  score,
  avgHours,
  optimalHours = 8.0,
  quality,
  onClick,
}: {
  score: number;
  avgHours: number;
  optimalHours?: number;
  quality?: number;
  onClick?: () => void;
}) {
  const deficit = Math.max(0, optimalHours - avgHours);
  const isCritical = avgHours < 5.0;

  return (
    <GlassPanel 
      hover 
      onClick={onClick} 
      className={`p-4 flex flex-col justify-between h-full relative ${isCritical ? 'border-[#ef4444]/40' : ''}`}
      glow={isCritical ? 'rgba(239,68,68,0.15)' : undefined}
    >
      <WidgetHeader title="Sleep Index" />

      <div className="flex flex-col flex-grow">
        {/* Primary metric is Hours, not score */}
        <div className="flex items-end gap-1">
          <motion.span 
            className="font-mono text-3xl font-bold"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {avgHours.toFixed(1)}
          </motion.span>
          <span className="text-xs text-[#8b8aa0] mb-1">h avg</span>
        </div>

        <div className={`text-[10px] font-mono mt-0.5 ${deficit > 2 ? 'text-[#f97316]' : 'text-[#8b8aa0]'}`}>
          ↓ -{deficit.toFixed(1)}h vs optimal
        </div>

        {/* Deficit score bar */}
        <div className="mt-4 mb-3">
          <div className="flex justify-between text-[9px] font-mono text-[#8b8aa0] mb-1">
            <span>Deficit Score</span>
            <span>{Math.round(score)}</span>
          </div>
          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden flex">
            <motion.div 
              className="h-full rounded-full"
              style={{ backgroundColor: isCritical ? '#ef4444' : '#f97316' }}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono mt-auto pt-2 border-t border-white/[0.04]">
          <span className="text-[#8b8aa0]">Quality: <span className="text-[#e8e6f0]">{quality ? `${quality}/10` : '--'}</span></span>
          <RiskBadge tier={isCritical ? 'critical' : deficit > 1 ? 'moderate' : 'low'} showPulse={isCritical} />
        </div>
      </div>
    </GlassPanel>
  );
}
