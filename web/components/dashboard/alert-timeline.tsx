"use client";

import { GlassPanel } from "@/components/shared/risk-ui";
import { AlertTimelineItem, SEVERITY_CONFIG } from "@/lib/types/mhoc";

export function AlertTimeline({
  items
}: {
  items: AlertTimelineItem[];
}) {
  return (
    <GlassPanel className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <h3 className="text-[10px] font-mono tracking-[0.15em] text-[#e8e6f0] uppercase">
          Alert Timeline
        </h3>
        <button className="text-[9px] font-mono text-[#8b8aa0] hover:text-white transition-colors">
          [FILTER ▾]
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto scrollbar-hide">
        <div className="text-[9px] font-mono text-[#4a4860] mb-4">TODAY</div>
        
        <div className="flex flex-col">
          {items.map((item, idx) => {
            const sev = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.info;
            const isLast = idx === items.length - 1;

            return (
              <div key={item.id} className="flex gap-4 group">
                {/* Timeline Axis */}
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-2.5 h-2.5 rounded-full border-2 bg-[#0a0a0f] z-10 mt-1 transition-colors`}
                    style={{ borderColor: sev.color, boxShadow: `0 0 8px ${sev.color}40` }}
                  />
                  {!isLast && <div className="timeline-line flex-grow my-1 min-h-[40px]" />}
                </div>

                {/* Content */}
                <div className="pb-6 flex-grow">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-mono text-[#8b8aa0]">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span 
                      className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider"
                      style={{ color: sev.color, background: sev.bg }}
                    >
                      {sev.label}
                    </span>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] group-hover:border-white/[0.1] transition-colors cursor-pointer">
                    <div className="text-xs font-medium text-[#e8e6f0] mb-1">{item.label}</div>
                    <div className="text-[11px] text-[#8b8aa0]">{item.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}
