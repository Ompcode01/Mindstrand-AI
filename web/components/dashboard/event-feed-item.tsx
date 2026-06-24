"use client";

import { motion } from "framer-motion";
import { formatRelativeTime } from "@/lib/utils";
import { BehavioralEvent, SEVERITY_CONFIG } from "@/lib/types/mhoc";

export function EventFeedItem({ 
  event, 
  onClick 
}: { 
  event: BehavioralEvent;
  onClick?: () => void;
}) {
  const sev = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.info;
  const timeStr = formatRelativeTime(event.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      onClick={onClick}
      className={`group relative flex items-start gap-3 p-3 border-b border-white/[0.04] hover:bg-white/[0.02] cursor-pointer transition-colors ${sev.borderClass}`}
    >
      <div className="w-[48px] flex-shrink-0 text-[10px] font-mono text-[#8b8aa0] pt-0.5">
        {timeStr}
      </div>

      <div className="flex-shrink-0 w-[42px]">
        <span 
          className="px-1.5 py-0.5 rounded flex items-center justify-center text-[9px] font-mono font-bold tracking-wider"
          style={{ color: sev.color, background: sev.bg }}
        >
          {sev.label}
        </span>
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-mono tracking-wider uppercase text-[#a78bff]">
            {event.category.replace('_', ' ')}
          </span>
          {event.acknowledged && (
            <span className="text-[9px] text-[#4a4860] border border-[#4a4860] rounded px-1">ACK</span>
          )}
        </div>
        <div className="text-xs text-[#e8e6f0] truncate group-hover:whitespace-normal group-hover:break-words transition-all">
          {event.description || event.title || 'Behavioral anomaly detected'}
        </div>
        
        {/* Detail payload preview on hover */}
        <div className="text-[10px] text-[#8b8aa0] mt-1 h-0 overflow-hidden opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all font-mono">
          {Object.entries(event.payload || {}).map(([k, v]) => (
            <span key={k} className="mr-3">
              <span className="text-[#4a4860]">{k}:</span> {String(v)}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
