"use client";

import { GlassPanel } from "@/components/shared/risk-ui";
import { Zap, ShieldAlert, CheckCircle, ArrowRight } from "lucide-react";

export function SOCInterventionFeed() {
  const interventions = [
    { time: "Just Now", title: "Automated Screen Lockout Scheduled", action: "Locking gaming overlay at 23:30 PM to arrest +0.35h daily gaming acceleration slope.", status: "PENDING EXECUTION", color: "#ef4444" },
    { time: "2 Hours Ago", title: "Socratic ERP Mirror Check Prompt", action: "Sent cognitive restructuring exercise following 45m Instagram comparison bout.", status: "DELIVERED", color: "#f97316" },
    { time: "Yesterday", title: "Vagal Autonomic Reset Protocol", action: "Triggered 4-7-8 breathing alert when resting heart rate spiked to 84 BPM.", status: "COMPLETED BY USER", color: "#22d3a0" },
  ];

  return (
    <GlassPanel className="p-5 flex flex-col justify-between border-t-2 border-t-[#22d3a0] h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#22d3a0]" />
              SOC Live Intervention Feed
            </h3>
            <p className="text-[10px] font-mono text-[#8b8aa0] mt-0.5 uppercase tracking-wider">
              Automated Clinical Mitigation & Lockout Actions
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#22d3a0] bg-[#22d3a0]/10 border border-[#22d3a0]/30 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22d3a0] animate-pulse" />
            AUTO-MITIGATION ACTIVE
          </span>
        </div>

        <div className="space-y-3">
          {interventions.map((item, idx) => (
            <div key={idx} className="bg-white/[0.03] p-3 rounded border border-white/[0.06] flex items-start gap-3">
              <div 
                className="w-2 h-full rounded-full self-stretch shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-grow">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#8b8aa0]">{item.time}</span>
                </div>
                <p className="text-[11px] font-mono text-[#e8e6f0] mb-2">{item.action}</p>
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase"
                    style={{ color: item.color, backgroundColor: `${item.color}15`, border: `1px solid ${item.color}30` }}
                  >
                    [{item.status}]
                  </span>
                  <button className="text-[10px] font-mono text-[#a78bff] hover:text-white flex items-center gap-1 transition-colors">
                    View Protocol &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
