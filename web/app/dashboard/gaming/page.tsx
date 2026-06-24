"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Clock, Zap, Target, AlertTriangle, Shield, Send } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { GlassPanel } from "@/components/shared/risk-ui";

const mockGamingData = [
  { day: "Mon", duration: 2.5, sleep: 7.5, hrv: 45 },
  { day: "Tue", duration: 3.0, sleep: 7.0, hrv: 42 },
  { day: "Wed", duration: 5.5, sleep: 5.5, hrv: 35 },
  { day: "Thu", duration: 4.0, sleep: 6.5, hrv: 38 },
  { day: "Fri", duration: 7.5, sleep: 4.5, hrv: 28 },
  { day: "Sat", duration: 9.0, sleep: 4.0, hrv: 25 },
  { day: "Sun", duration: 6.0, sleep: 5.0, hrv: 32 },
];

export default function GamingModule() {
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("casual");
  const [sleepSacrifice, setSleepSacrifice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call to backend
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      setDuration("");
      setSleepSacrifice(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050508] p-6 lg:p-8 text-[#e8e6f0]">
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div>
            <h1 className="text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-3">
              <Gamepad2 className="w-6 h-6 text-[#7c54ff]" />
              IGD Module: Gaming Analytics
            </h1>
            <p className="text-xs font-mono text-[#8b8aa0] mt-1 tracking-wider uppercase">
              Internet Gaming Disorder Threat Vector Monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-[10px] font-mono border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] px-2 py-1 rounded">
              <AlertTriangle className="w-3 h-3" />
              IGD RISK: HIGH
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Col: Logging Form */}
          <GlassPanel className="p-6 col-span-1 border-t-2 border-t-[#7c54ff]">
            <h2 className="text-sm font-mono tracking-widest text-[#a78bff] uppercase mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Log Session
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-mono text-[#8b8aa0] mb-2 uppercase">Session Duration (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#7c54ff] focus:ring-1 focus:ring-[#7c54ff] transition-all font-mono"
                  placeholder="e.g. 3.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-[#8b8aa0] mb-2 uppercase">Intensity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['casual', 'competitive', 'grinding'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setIntensity(level)}
                      className={`py-2 text-[10px] font-mono rounded border transition-colors uppercase ${
                        intensity === level 
                          ? 'bg-[#7c54ff]/20 border-[#7c54ff] text-[#e8e6f0]' 
                          : 'bg-white/[0.02] border-white/10 text-[#8b8aa0] hover:border-white/20'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors" onClick={() => setSleepSacrifice(!sleepSacrifice)}>
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-[#8b8aa0]" />
                  <span className="text-xs font-mono text-[#e8e6f0]">Sacrificed Sleep?</span>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative ${sleepSacrifice ? 'bg-[#ef4444]' : 'bg-[#4a4860]'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${sleepSacrifice ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg text-xs font-mono font-bold tracking-widest transition-all flex items-center justify-center gap-2 ${
                  submitSuccess 
                    ? 'bg-[#22d3a0] text-black'
                    : 'bg-[#7c54ff] hover:bg-[#6b44e0] text-white'
                }`}
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : submitSuccess ? (
                  <>LOGGED SUCCESSFULLY ✓</>
                ) : (
                  <>
                    <Send className="w-3 h-3" /> RECORD SESSION
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3 text-[#f59e0b]">
                <Target className="w-4 h-4" />
                <h3 className="text-[10px] font-mono tracking-wider uppercase">Intervention Goal</h3>
              </div>
              <p className="text-xs text-[#8b8aa0] leading-relaxed">
                Your current clinical goal is to keep total daily gaming time under <strong>3.0 hours</strong> and ensure zero instances of sleep sacrifice.
              </p>
            </div>
          </GlassPanel>

          {/* Right Col: Charts & Insights */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            
            <GlassPanel className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-mono tracking-widest text-[#e8e6f0] uppercase">Biometric Impact Correlation</h2>
                <div className="flex items-center gap-4 text-[10px] font-mono text-[#8b8aa0]">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#7c54ff]" /> Duration (h)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]" /> HRV (ms)</span>
                </div>
              </div>

              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockGamingData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDur" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c54ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7c54ff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHRV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} tick={{ fontSize: 10, fill: '#8b8aa0' }} />
                    <YAxis yAxisId="left" domain={[0, 12]} axisLine={false} tickLine={false} tickMargin={10} tick={{ fontSize: 10, fill: '#8b8aa0' }} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 60]} axisLine={false} tickLine={false} tickMargin={10} tick={{ fontSize: 10, fill: '#8b8aa0' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0f', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ fontFamily: 'monospace', fontSize: '11px' }}
                      labelStyle={{ color: '#8b8aa0', fontFamily: 'monospace', fontSize: '10px', marginBottom: '4px' }}
                    />
                    
                    <ReferenceLine yAxisId="left" y={3.0} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: 'GOAL', position: 'insideTopLeft', fill: '#f59e0b', fontSize: 9, fontFamily: 'monospace' }} />
                    
                    <Area yAxisId="left" type="monotone" dataKey="duration" name="Gaming (h)" stroke="#7c54ff" fillOpacity={1} fill="url(#colorDur)" strokeWidth={2} />
                    <Area yAxisId="right" type="monotone" dataKey="hrv" name="HRV (ms)" stroke="#ef4444" fillOpacity={1} fill="url(#colorHRV)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassPanel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassPanel className="p-5 flex flex-col justify-center border-l-2 border-l-[#ef4444]">
                <div className="flex items-center gap-2 text-[#ef4444] mb-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-[10px] font-mono tracking-widest uppercase">Clinical Insight</span>
                </div>
                <p className="text-sm text-[#e8e6f0] leading-relaxed">
                  Data shows a strong inverse correlation <span className="text-[#ef4444] font-mono">(-0.84)</span> between your gaming session duration and overnight HRV recovery.
                </p>
                <div className="mt-3 text-xs text-[#8b8aa0]">
                  Generated by MindShield Explainability Engine
                </div>
              </GlassPanel>

              <GlassPanel className="p-5 flex flex-col justify-center border-l-2 border-l-[#f97316]">
                <div className="flex items-center gap-2 text-[#f97316] mb-2">
                  <Moon className="w-4 h-4" />
                  <span className="text-[10px] font-mono tracking-widest uppercase">Sleep Deficit Warning</span>
                </div>
                <p className="text-sm text-[#e8e6f0] leading-relaxed">
                  You have sacrificed sleep for gaming on <span className="text-[#f97316] font-mono">3 of the last 7 nights</span>. This acts as a severe risk multiplier.
                </p>
                <div className="mt-3 text-[10px] text-[#4a4860] uppercase tracking-widest font-mono">
                  ACTION REQUIRED
                </div>
              </GlassPanel>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
