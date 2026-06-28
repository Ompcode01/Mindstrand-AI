"use client";

import { GlassPanel } from "@/components/shared/risk-ui";
import { Clock, Gamepad2, AlertCircle, Moon } from "lucide-react";

export function SOCBehavioralTimeline() {
  const events = [
    { time: "23:45 PM", title: "Continuous Gaming Surge", desc: "Uninterrupted 4.5h MMO raid session logged via Discord overlay.", tier: "critical", icon: Gamepad2, color: "#ef4444" },
    { time: "20:15 PM", title: "Skipped Evening Meal", desc: "No nutritional activity recorded during peak gaming window.", tier: "warning", icon: AlertCircle, color: "#f97316" },
    { time: "14:30 PM", title: "BDD Comparison Check", desc: "45 mins social media selfie comparison detected on Instagram.", tier: "warning", icon: AlertCircle, color: "#f59e0b" },
    { time: "08:00 AM", title: "Restorative Sleep Deficit", desc: "Only 4.8h sleep recorded; resting heart rate elevated at 82 BPM.", tier: "critical", icon: Moon, color: "#ef4444" },
  ];

  return (
    <GlassPanel className="p-5 flex flex-col justify-between border-t-2 border-t-[#f97316] h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f97316]" />
              SOC Behavioral Event Timeline
            </h3>
            <p className="text-[10px] font-mono text-[#8b8aa0] mt-0.5 uppercase tracking-wider">
              24-Hour Granular Telemetry Ingestion
            </p>
          </div>
        </div>

        <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10 my-2">
          {events.map((e, idx) => {
            const Icon = e.icon;
            return (
              <div key={idx} className="flex items-start gap-3 relative z-10 pl-1">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-black/50"
                  style={{ backgroundColor: e.color }}
                >
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-grow bg-white/[0.03] p-2.5 rounded border border-white/[0.05]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold font-mono text-white">{e.title}</span>
                    <span className="text-[10px] font-mono text-[#8b8aa0]">{e.time}</span>
                  </div>
                  <p className="text-[11px] font-mono text-[#e8e6f0] leading-snug">{e.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}
