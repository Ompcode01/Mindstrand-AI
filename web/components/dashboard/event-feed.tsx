"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/shared/risk-ui";
import { BehavioralEvent } from "@/lib/types/mhoc";
import { EventFeedItem } from "./event-feed-item";

export function EventFeed({
  events,
  onAcknowledge,
}: {
  events: BehavioralEvent[];
  onAcknowledge?: (id: string) => void;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [filterSev, setFilterSev] = useState<string | null>(null);

  // If paused, we technically would freeze the events array here in a real implementation.
  // For UI purposes, we just show the pause state.
  
  const filteredEvents = events.filter(e => filterSev ? e.severity === filterSev : true);

  return (
    <GlassPanel className="h-full flex flex-col overflow-hidden relative">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#0a0a0f]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-[#4a4860]' : 'bg-[#22d3a0] animate-pulse'}`} />
          <h3 className="text-[10px] font-mono tracking-[0.15em] text-[#e8e6f0] uppercase">
            Behavioral Events Stream
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            className="bg-transparent border border-white/10 rounded text-[9px] font-mono text-[#8b8aa0] px-2 py-0.5 outline-none focus:border-[#7c54ff]"
            value={filterSev || ""}
            onChange={e => setFilterSev(e.target.value || null)}
          >
            <option value="">ALL SEV</option>
            <option value="critical">CRITICAL</option>
            <option value="alert">ALERT</option>
            <option value="warning">WARNING</option>
          </select>
          
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${
              isPaused 
                ? 'border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/10' 
                : 'border-white/10 text-[#8b8aa0] hover:text-white hover:border-white/30'
            }`}
          >
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto scrollbar-hide p-1">
        <div className="flex flex-col">
          <AnimatePresence initial={false}>
            {filteredEvents.map(event => (
              <EventFeedItem 
                key={event.id} 
                event={event} 
                onClick={() => onAcknowledge && onAcknowledge(event.id)}
              />
            ))}
            {filteredEvents.length === 0 && (
              <div className="p-8 text-center text-xs text-[#4a4860] font-mono">
                No events matching filter criteria.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Bottom fade out */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
    </GlassPanel>
  );
}
