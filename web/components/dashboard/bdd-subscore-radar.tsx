"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import { GlassPanel } from "@/components/shared/risk-ui";
import { Eye } from "lucide-react";

export function BDDSubscoreRadar({ data }: { data?: any[] }) {
  const chartData = data || [
    { subject: "Appearance Anxiety", A: 74.2, fullMark: 100 },
    { subject: "Social Comparison", A: 82.0, fullMark: 100 },
    { subject: "Obsession & Checking", A: 71.0, fullMark: 100 },
    { subject: "Self-Esteem Deficit", A: 61.5, fullMark: 100 },
  ];

  return (
    <GlassPanel className="p-6 h-full flex flex-col justify-between border-t-2 border-t-[#c4b0ff]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#c4b0ff]" />
            BDD Dimensional Sub-Scores
          </h3>
          <p className="text-[10px] font-mono text-[#8b8aa0] mt-0.5 uppercase tracking-wider">
            Multi-Signal Dysmorphia Profile
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#f97316]/30 bg-[#f97316]/10 text-[#f97316]">
          TIER: HIGH
        </span>
      </div>

      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="#ffffff15" />
            <PolarAngleAxis dataKey="subject" stroke="#a78bff" tick={{ fill: "#e8e6f0", fontSize: 10, fontFamily: "monospace" }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#ffffff20" tick={{ fill: "#8b8aa0", fontSize: 9 }} />
            <Radar
              name="Patient Score"
              dataKey="A"
              stroke="#c4b0ff"
              fill="#c4b0ff"
              fillOpacity={0.35}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-center font-mono text-[10px] text-[#8b8aa0] border-t border-white/[0.06] pt-3">
        <div>Dominant Vector: <span className="text-[#ef4444] font-bold">Social Comparison</span></div>
        <div>Secondary Vector: <span className="text-[#f97316] font-bold">Appearance Anxiety</span></div>
      </div>
    </GlassPanel>
  );
}
