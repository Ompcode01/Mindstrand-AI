"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { GlassPanel } from "@/components/shared/risk-ui";
import { TrendingUp, AlertTriangle } from "lucide-react";

export function SOCPredictiveTimeline({ data }: { data?: any }) {
  const forecastData = data?.trajectory_series ? data.trajectory_series.map((t: any) => ({
    day: t.day,
    risk: t.predicted_risk,
    upper: t.confidence_upper,
    lower: t.confidence_lower
  })) : [
    { day: "Now", risk: 72, upper: 72, lower: 72 },
    { day: "+2d", risk: 74.4, upper: 76.0, lower: 72.8 },
    { day: "+4d", risk: 76.8, upper: 80.0, lower: 73.6 },
    { day: "+6d", risk: 79.2, upper: 84.0, lower: 74.4 },
    { day: "+8d", risk: 81.7, upper: 88.1, lower: 75.3 },
    { day: "+10d", risk: 84.1, upper: 92.1, lower: 76.1 },
    { day: "+12d", risk: 86.5, upper: 96.1, lower: 76.9 },
    { day: "+14d", risk: 89.0, upper: 100.0, lower: 77.8 },
  ];

  const currentRisk = data?.current_risk ?? 72.0;
  const predRisk = data?.predicted_risk_14d ?? 89.0;
  const slope = data?.velocity_slope ?? 1.21;

  return (
    <GlassPanel className="p-5 flex flex-col justify-between border-t-2 border-t-[#ef4444] h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold font-mono tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#ef4444]" />
            SOC Predictive Risk Horizon
          </h3>
          <p className="text-[10px] font-mono text-[#8b8aa0] mt-0.5 uppercase tracking-wider">
            14-Day Trajectory Velocity Forecasting
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#ef4444]/10 border border-[#ef4444]/30 px-3 py-1 rounded">
          <AlertTriangle className="w-3.5 h-3.5 text-[#ef4444] animate-pulse" />
          <span className="text-xs font-mono font-bold text-[#ef4444]">{currentRisk} &rarr; {predRisk} (14 DAYS)</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 bg-white/[0.03] p-3 rounded border border-white/[0.05] text-center font-mono">
        <div>
          <div className="text-[10px] text-[#8b8aa0] uppercase">Current Risk</div>
          <div className="text-xl font-bold text-white">{currentRisk}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#8b8aa0] uppercase">Predicted Risk</div>
          <div className="text-xl font-bold text-[#ef4444]">{predRisk}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#8b8aa0] uppercase">Velocity Slope</div>
          <div className="text-xl font-bold text-[#f97316]">+{slope} / day</div>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis dataKey="day" stroke="#8b8aa0" tick={{ fill: "#8b8aa0", fontSize: 11 }} />
            <YAxis stroke="#8b8aa0" domain={[60, 100]} tick={{ fill: "#8b8aa0", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px", fontFamily: "monospace" }}
            />
            <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Critical Threshold (80)", fill: "#ef4444", fontSize: 9 }} />
            <Area type="monotone" dataKey="upper" stroke="#ef444430" fillOpacity={0.1} fill="#ef4444" />
            <Area type="monotone" dataKey="lower" stroke="#ef444430" fillOpacity={0.1} fill="#ef4444" />
            <Area type="monotone" dataKey="risk" name="Projected Risk" stroke="#ef4444" fillOpacity={1} fill="url(#colorPred)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassPanel>
  );
}
