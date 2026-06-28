"use client";

import { GlassPanel } from "@/components/shared/risk-ui";
import { Heart, CheckCircle2, ShieldCheck } from "lucide-react";

export function SOCWellnessTimeline() {
  const recoveryEvents = [
    { time: "09:30 AM", title: "Autonomic Rebound Peak", desc: "HRV rose to 54ms following 5 mins morning resonance breathing.", tier: "thriving", color: "#22d3a0" },
    { time: "13:00 PM", title: "Digital Sundown Adherence", desc: "Successfully completed 45-min screen-free lunchtime walk.", tier: "thriving", color: "#22d3a0" },
    { time: "18:00 PM", title: "Social Urge Stabilization", desc: "Mood check-in reports reduced gaming urge (down to 3/10).", tier: "stable", color: "#7c54ff" },
    { time: "22:00 PM", title: "Early Lockout Triggered", desc: "Smart screenblocker activated smoothly without bypass attempt.", tier: "stable", color: "#7c54ff" },
  ];

  return (
    <GlassPanel className="p-5 flex flex-col justify-between border-t-2 border-t-[#22d3a0] h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#22d3a0]" />
              SOC Wellness Recovery Timeline
            </h3>
            <p className="text-[10px] font-mono text-[#8b8aa0] mt-0.5 uppercase tracking-wider">
              Positive Vitality & Resilience Rebound Events
            </p>
          </div>
        </div>

        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#22d3a0]/20 my-2">
          {recoveryEvents.map((e, idx) => (
            <div key={idx} className="flex items-start gap-3 relative z-10 pl-1">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-black/50"
                style={{ backgroundColor: e.color }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-grow bg-[#22d3a0]/[0.03] p-2.5 rounded border border-[#22d3a0]/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold font-mono text-white">{e.title}</span>
                  <span className="text-[10px] font-mono text-[#8b8aa0]">{e.time}</span>
                </div>
                <p className="text-[11px] font-mono text-[#e8e6f0] leading-snug">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
