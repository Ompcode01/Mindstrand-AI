"use client";

import { motion } from "framer-motion";
import { WearableSnapshot } from "@/lib/types/mhoc";

export function WearableStrip({
  data,
  isLive = true
}: {
  data: WearableSnapshot | null;
  isLive?: boolean;
}) {
  if (!data) return null;

  const metrics = [
    { label: "BPM", value: data.heart_rate_bpm, unit: "", warn: data.heart_rate_bpm > 85 },
    { label: "HRV", value: data.hrv_ms.toFixed(1), unit: "ms", warn: data.hrv_ms < 30 },
    { label: "SLEEP", value: data.sleep_hours.toFixed(1), unit: "h", warn: data.sleep_hours < 5 },
    { label: "STRESS", value: data.stress_index.toFixed(0), unit: "", warn: data.stress_index > 70 },
    { label: "STEPS", value: data.steps.toLocaleString(), unit: "", warn: false }
  ];

  return (
    <div className="flex items-center justify-between glass rounded-lg border border-white/[0.04] px-4 py-2 mt-2 text-xs font-mono">
      <div className="flex items-center gap-2 mr-6 shrink-0">
        <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-[#22d3a0] animate-pulse' : 'bg-[#4a4860]'}`} />
        <span className="text-[#8b8aa0] tracking-widest text-[9px] uppercase">
          {data.source === 'simulated' ? 'SIM-BAND' : 'MINDBAND'}
        </span>
      </div>

      <div className="flex items-center gap-8 flex-grow justify-around">
        {metrics.map((m, i) => (
          <div key={i} className="flex items-baseline gap-1.5">
            <span className="text-[#4a4860] text-[9px]">{m.label}</span>
            <span className={`font-bold ${m.warn ? 'text-[#ef4444]' : 'text-[#e8e6f0]'}`}>
              {m.value}
            </span>
            {m.unit && <span className="text-[#8b8aa0] text-[9px]">{m.unit}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
