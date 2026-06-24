"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel, ThreatPulse, RiskBadge, DeltaIndicator } from "@/components/shared/risk-ui";
import { RiskSnapshot, TIER_CONFIG } from "@/lib/types/mhoc";

export function LiveRiskFeed({
  snapshot
}: {
  snapshot: RiskSnapshot | null;
}) {
  if (!snapshot) return null;

  // Derive recent triggers from the snapshot
  const triggers = snapshot.triggers.slice(0, 5); // take top 5

  return (
    <GlassPanel className="h-full flex flex-col overflow-hidden relative">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#0a0a0f]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <ThreatPulse tier={snapshot.risk_tier} size="xs" />
          <h3 className="text-[10px] font-mono tracking-[0.15em] text-[#e8e6f0] uppercase">
            Live Risk Feed
          </h3>
        </div>
        <button className="text-[9px] font-mono tracking-widest text-[#8b8aa0] hover:text-white transition-colors border border-white/10 px-2 py-0.5 rounded">
          PAUSE
        </button>
      </div>

      <div className="flex-grow overflow-y-auto scrollbar-hide p-2">
        <div className="flex flex-col gap-2">
          
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-3 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/5"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <ThreatPulse tier="critical" size="sm" />
                <span className="text-[10px] font-mono text-[#8b8aa0]">{new Date(snapshot.computed_at).toLocaleTimeString()}</span>
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#e8e6f0]">COMPOSITE</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold">{Math.round(snapshot.composite_score)}</span>
                <DeltaIndicator delta={snapshot.delta_1h} />
              </div>
            </div>
            <div className="text-[11px] text-[#e8e6f0] pl-6 border-l-2 border-[#ef4444]/40 ml-[3px]">
              {snapshot.top_concern ? `Driven by ${snapshot.top_concern.toUpperCase()} escalation and sleep deficit.` : 'Score updated.'}
            </div>
          </motion.div>

          {triggers.map((trigger, i) => {
            const tier = trigger.severity === 'critical' ? 'critical' : trigger.severity === 'alert' ? 'high' : trigger.severity === 'warning' ? 'moderate' : 'low';
            const cfg = TIER_CONFIG[tier];
            
            return (
              <motion.div 
                key={trigger.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.1 }}
                className="p-3 rounded-lg border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    {/* Open circle for older items, filled for very new items */}
                    <div className="w-2 h-2 rounded-full border border-white/40 group-hover:border-white/80 transition-colors" />
                    <span className="text-[10px] font-mono text-[#8b8aa0]">
                      {new Date(trigger.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#8b8aa0] group-hover:text-[#e8e6f0] transition-colors">
                      {trigger.type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <RiskBadge tier={tier} showPulse={false} />
                </div>
                <div className="text-[11px] text-[#a78bff] pl-4 ml-1">
                  {trigger.description}
                </div>
              </motion.div>
            );
          })}

        </div>
      </div>
      
      {/* Bottom fade out */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
    </GlassPanel>
  );
}
