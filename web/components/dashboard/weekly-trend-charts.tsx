"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/shared/risk-ui";
import { DailyTrendPoint } from "@/lib/types/mhoc";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ReferenceLine, CartesianGrid 
} from "recharts";

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong p-3 rounded-lg border border-white/10 shadow-2xl">
        <p className="text-[10px] font-mono text-[#8b8aa0] mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4 text-xs">
              <span style={{ color: entry.color }} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}
              </span>
              <span className="font-mono text-[#e8e6f0]">{entry.value.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export function WeeklyTrendCharts({
  data
}: {
  data: DailyTrendPoint[];
}) {
  const [timeRange, setTimeRange] = useState<'7D'|'14D'|'30D'>('14D');
  const [activeTab, setActiveTab] = useState<'RISK'|'BIOMETRICS'|'MOOD'>('RISK');

  const sliceIndex = timeRange === '7D' ? -7 : timeRange === '14D' ? -14 : 0;
  const chartData = data.slice(sliceIndex);

  return (
    <GlassPanel className="h-full flex flex-col overflow-hidden relative">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#0a0a0f]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="flex gap-4 border-r border-white/10 pr-4">
            {['RISK', 'BIOMETRICS', 'MOOD'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-[10px] font-mono tracking-widest uppercase transition-colors ${activeTab === tab ? 'text-[#e8e6f0]' : 'text-[#4a4860] hover:text-[#8b8aa0]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <h3 className="text-[10px] font-mono text-[#4a4860]">TREND TRAJECTORY</h3>
        </div>

        <div className="flex gap-1 bg-white/[0.03] p-0.5 rounded border border-white/[0.05]">
          {['7D', '14D', '30D'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-2 py-0.5 text-[9px] font-mono rounded transition-colors ${timeRange === range ? 'bg-[#7c54ff] text-white' : 'text-[#8b8aa0] hover:text-white'}`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow p-4 min-h-[300px]">
        {activeTab === 'RISK' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIGD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c54ff" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#7c54ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day_label" axisLine={false} tickLine={false} tickMargin={10} minTickGap={20} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip content={<CustomTooltip />} />
              
              <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'CRITICAL', position: 'insideTopLeft', fill: '#ef4444', fontSize: 9, fontFamily: 'monospace' }} />
              <ReferenceLine y={50} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'HIGH', position: 'insideTopLeft', fill: '#f97316', fontSize: 9, fontFamily: 'monospace' }} />
              
              <Area type="monotone" dataKey="igd_score" name="IGD Risk" stroke="#7c54ff" fillOpacity={1} fill="url(#colorIGD)" strokeWidth={2} isAnimationActive={true} animationDuration={1200} />
              <Area type="monotone" dataKey="composite_score" name="Composite" stroke="#ef4444" fillOpacity={1} fill="url(#colorComp)" strokeWidth={2} isAnimationActive={true} animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'BIOMETRICS' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3a0" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#22d3a0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day_label" axisLine={false} tickLine={false} tickMargin={10} />
              <YAxis domain={[0, 12]} axisLine={false} tickLine={false} tickMargin={10} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={8} stroke="#22d3a0" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'OPTIMAL SLEEP', position: 'insideTopLeft', fill: '#22d3a0', fontSize: 9, fontFamily: 'monospace' }} />
              <Area type="monotone" dataKey="sleep_hours" name="Sleep (h)" stroke="#22d3a0" fillOpacity={1} fill="url(#colorSleep)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'MOOD' && (
          <div className="flex items-center justify-center h-full text-[10px] font-mono text-[#4a4860]">
            [Mood Chart Visualization Placeholder]
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
