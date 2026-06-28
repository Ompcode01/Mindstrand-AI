"use client";

import { GlassPanel } from "@/components/shared/risk-ui";
import { Grid } from "lucide-react";

export function SOCRiskHeatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeks = ["Wk 1", "Wk 2", "Wk 3", "Wk 4"];

  // 4x7 risk intensity grid (0 to 100)
  const heatmapData = [
    [32, 45, 50, 68, 74, 82, 70],
    [28, 40, 48, 55, 62, 75, 65],
    [35, 42, 58, 64, 78, 88, 72],
    [40, 50, 62, 70, 72, 89, 74]
  ];

  const getColor = (val: number) => {
    if (val >= 80) return "bg-[#ef4444] shadow-[0_0_10px_#ef444480]";
    if (val >= 65) return "bg-[#f97316] shadow-[0_0_8px_#f9731660]";
    if (val >= 50) return "bg-[#f59e0b]";
    if (val >= 35) return "bg-[#7c54ff]";
    return "bg-[#22d3a0]/40";
  };

  return (
    <GlassPanel className="p-5 flex flex-col justify-between border-t-2 border-t-[#ef4444]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Grid className="w-4 h-4 text-[#ef4444]" />
            SOC 28-Day Risk Intensity Heatmap
          </h3>
          <p className="text-[10px] font-mono text-[#8b8aa0] mt-0.5 uppercase tracking-wider">
            Temporal Threat Density Matrix
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]">
          CRITICAL PEAKS: WEEKENDS
        </span>
      </div>

      <div className="space-y-2 my-2">
        <div className="grid grid-cols-8 gap-1.5 text-center text-[10px] font-mono text-[#8b8aa0]">
          <div />
          {days.map((d, i) => <div key={i}>{d}</div>)}
        </div>
        {heatmapData.map((row, wIdx) => (
          <div key={wIdx} className="grid grid-cols-8 gap-1.5 items-center">
            <span className="text-[10px] font-mono text-[#8b8aa0] text-left">{weeks[wIdx]}</span>
            {row.map((val, dIdx) => (
              <div
                key={dIdx}
                className={`h-7 rounded flex items-center justify-center text-[10px] font-mono font-bold text-white transition-all hover:scale-110 cursor-pointer ${getColor(val)}`}
                title={`Risk Score: ${val}/100`}
              >
                {val}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#8b8aa0] mt-3 pt-2 border-t border-white/[0.06]">
        <span>Low Risk (&lt;35)</span>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded bg-[#22d3a0]/40" />
          <span className="w-2.5 h-2.5 rounded bg-[#7c54ff]" />
          <span className="w-2.5 h-2.5 rounded bg-[#f59e0b]" />
          <span className="w-2.5 h-2.5 rounded bg-[#f97316]" />
          <span className="w-2.5 h-2.5 rounded bg-[#ef4444]" />
        </div>
        <span>Critical (&ge;80)</span>
      </div>
    </GlassPanel>
  );
}
