"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/risk-ui";
import { AIInsightBlock, ExplainabilityReport } from "@/lib/types/mhoc";

function FeatureImportanceBar({ 
  feature, 
  maxContrib 
}: { 
  feature: any; 
  maxContrib: number 
}) {
  const widthPct = Math.abs(feature.contribution_pct) / maxContrib * 100;
  
  return (
    <div className="mb-3 group relative cursor-pointer">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-[#e8e6f0]">{feature.feature_name}</span>
        <span className="font-mono text-[#8b8aa0]">
          {feature.direction === 'positive' ? '↑' : '↓'} {Math.abs(feature.contribution_pct)}%
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden flex">
        <motion.div 
          className="h-full rounded-full"
          style={{ backgroundColor: feature.color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${widthPct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-end text-[9px] font-mono mt-0.5 text-[#4a4860]">
        {feature.value}
      </div>
    </div>
  );
}

export function ExplainabilityEngine({
  report
}: {
  report: ExplainabilityReport | null;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!report) return null;

  const maxContrib = Math.max(...report.feature_contributions.map(f => Math.abs(f.contribution_pct)));

  return (
    <div className="mt-4 border-t border-white/[0.06] pt-2">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2 text-[10px] font-mono tracking-widest text-[#a78bff] hover:text-[#e8e6f0] transition-colors uppercase"
      >
        <div className="flex items-center gap-2">
          <span>{expanded ? '▼' : '▶'}</span> Explainability Engine
        </div>
        <span className="text-[#4a4860]">Confidence: {report.overall_confidence.toFixed(2)}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="py-4 space-y-4">
              <div className="p-3 rounded bg-white/[0.02] border border-white/[0.04] text-xs text-[#e8e6f0] leading-relaxed">
                <span className="text-[#7c54ff] font-medium mr-2">Why is this score?</span>
                {report.headline}
              </div>

              <div>
                <h4 className="text-[9px] font-mono text-[#8b8aa0] tracking-wider uppercase mb-3">Contributing Factors</h4>
                <div className="space-y-1">
                  {report.feature_contributions.map((f, i) => (
                    <FeatureImportanceBar key={i} feature={f} maxContrib={maxContrib} />
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/[0.04]">
                <h4 className="text-[9px] font-mono text-[#8b8aa0] tracking-wider uppercase mb-2">Data Coverage</h4>
                <div className="flex items-center gap-4 text-[10px]">
                  <div className="flex items-center gap-1.5"><span className="text-[#22d3a0]">●</span> Assessment (100%)</div>
                  <div className="flex items-center gap-1.5"><span className="text-[#f59e0b]">●</span> Gaming (80%)</div>
                  <div className="flex items-center gap-1.5"><span className="text-[#ef4444]">○</span> Journal (40%)</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
