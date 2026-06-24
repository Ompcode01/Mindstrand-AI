"use client";

import { motion } from "framer-motion";
import { GlassPanel, AnimatedScore, RiskBadge, WidgetHeader, DeltaIndicator } from "@/components/shared/risk-ui";
import { TIER_CONFIG, RiskTier } from "@/lib/types/mhoc";

export function CompositeMeter({
  score,
  tier,
  delta24h,
  onClick,
}: {
  score: number;
  tier: RiskTier;
  delta24h: number | null;
  onClick?: () => void;
}) {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.unknown;

  return (
    <GlassPanel 
      hover 
      onClick={onClick}
      className={`p-5 flex flex-col justify-between h-full relative overflow-hidden tier-border-${tier}`}
      glow={cfg.glow}
    >
      {/* Background glow orb */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
        style={{ backgroundColor: cfg.color }}
      />

      <WidgetHeader title="Composite Risk" live>
        <DeltaIndicator delta={delta24h} />
      </WidgetHeader>

      <div className="flex flex-col items-center justify-center flex-grow py-4">
        <AnimatedScore value={score} size="xl" className={`mb-2 ${cfg.textClass}`} />
        <RiskBadge tier={tier} className="scale-110 origin-top" />
      </div>

      <div className="flex justify-between items-end mt-2">
        <div className="text-[10px] text-[#8b8aa0] max-w-[120px] leading-tight">
          Weighted aggregate of all threat vectors
        </div>
        <div className="text-[10px] text-[#4a4860] font-mono">
          UPDATED NOW
        </div>
      </div>
    </GlassPanel>
  );
}
