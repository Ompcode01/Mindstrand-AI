"use client";

import { motion } from "framer-motion";
import { GlassPanel, AnimatedScore, RiskBadge } from "@/components/shared/risk-ui";
import { TIER_CONFIG, RiskTier } from "@/lib/types/mhoc";

export function RiskGauge({
  dimension,
  score,
  tier,
  delta,
  components = [],
  onClick,
}: {
  dimension: string;
  score: number;
  tier: RiskTier;
  delta: number | null;
  components?: { name: string; weight: number; value: string }[];
  onClick?: () => void;
}) {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.unknown;
  
  // SVG Arc Math (180 degree semicircle)
  const radius = 64;
  const strokeWidth = 12;
  const cx = 80;
  const cy = 80;
  const circumference = Math.PI * radius;
  // Offset mapping: score 0 -> circumference, score 100 -> 0
  const offset = circumference - (score / 100) * circumference;

  return (
    <GlassPanel 
      hover 
      onClick={onClick}
      className="p-4 flex flex-col items-center relative group"
    >
      <div className="absolute top-3 left-4 text-[10px] font-mono tracking-widest text-[#4a4860] uppercase">
        {dimension}
      </div>
      
      {delta !== null && (
        <div className="absolute top-3 right-4">
          <span className={`text-[10px] font-mono ${delta > 0 ? 'text-[#ef4444]' : 'text-[#22d3a0]'}`}>
            {delta > 0 ? '↑' : delta < 0 ? '↓' : '—'} {Math.abs(delta).toFixed(1)}
          </span>
        </div>
      )}

      <div className="relative w-[160px] h-[90px] mt-4 overflow-hidden flex justify-center">
        <svg width="160" height="90" viewBox="0 0 160 90" className="overflow-visible">
          {/* Background track */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Foreground fill arc */}
          <motion.path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={cfg.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
            className={`gauge-ring-${tier}`}
          />
        </svg>
        
        {/* Score in the center */}
        <div className="absolute bottom-1 left-0 right-0 flex flex-col items-center">
          <AnimatedScore value={score} size="lg" />
        </div>
      </div>

      <div className="mt-2 text-center">
        <RiskBadge tier={tier} />
      </div>

      {/* Hover reveal - Sub components */}
      {components.length > 0 && (
        <div className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-md rounded-xl p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center pointer-events-none">
          <div className="text-[9px] font-mono tracking-wider text-[#8b8aa0] mb-2 uppercase">Score Drivers</div>
          <div className="space-y-2">
            {components.map((comp, i) => (
              <div key={i} className="text-xs flex justify-between items-center">
                <span className="text-[#e8e6f0] flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#7c54ff]" />
                  {comp.name}
                </span>
                <span className="font-mono text-[#8b8aa0]">{comp.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[10px] text-center text-[#7c54ff] font-medium">Click for full analysis →</div>
        </div>
      )}
    </GlassPanel>
  );
}
