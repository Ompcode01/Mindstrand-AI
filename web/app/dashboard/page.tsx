"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Shield, Bell, User, Activity, Database, Users } from "lucide-react";
import Link from "next/link";

// Import all MHOC widgets
import { RiskGauge } from "@/components/dashboard/risk-gauge";
import { CompositeMeter } from "@/components/dashboard/composite-meter";
import { WellnessScore } from "@/components/dashboard/wellness-score";
import { StressIndex } from "@/components/dashboard/stress-index";
import { SleepIndex } from "@/components/dashboard/sleep-index";
import { WeeklyTrendCharts } from "@/components/dashboard/weekly-trend-charts";
import { LiveRiskFeed } from "@/components/dashboard/live-risk-feed";
import { AIInsightsPanel } from "@/components/dashboard/ai-insights-panel";
import { EventFeed } from "@/components/dashboard/event-feed";
import { AlertTimeline } from "@/components/dashboard/alert-timeline";
import { UserRiskTable } from "@/components/dashboard/user-risk-table";

// Import types & mocks
import { 
  getMockRiskSnapshot, getMockEvents, getMockTrendData, getMockInsights, getMockExplainability 
} from "@/lib/types/mhoc";

function CommandStrip({ alertCount }: { alertCount: number }) {
  return (
    <div className="h-12 glass-strong rounded-lg border border-white/[0.06] flex items-center justify-between px-4 w-full">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[#7c54ff] flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white leading-none">MindShield MHOC</span>
          <span className="text-[9px] font-mono tracking-widest text-[#a78bff]">MENTAL HEALTH OPERATIONS CENTER</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/dashboard/gaming" className="text-[10px] font-mono text-[#8b8aa0] hover:text-[#a78bff] transition-colors">
          [IGD MODULE]
        </Link>
        <Link href="/dashboard/insights" className="text-[10px] font-mono text-[#8b8aa0] hover:text-[#a78bff] transition-colors">
          [AI THERAPIST]
        </Link>
        
        <div className="w-px h-6 bg-white/10 mx-2" />
        
        <button className="flex items-center gap-2 bg-[#7c54ff]/10 text-[#a78bff] hover:text-white px-3 py-1.5 rounded border border-[#7c54ff]/30 text-[10px] font-mono transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22d3a0] animate-pulse" />
          SYSTEM LIVE
        </button>
        
        <button className="relative text-[#8b8aa0] hover:text-white transition-colors ml-2">
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#ef4444] text-[8px] font-bold text-white flex items-center justify-center border border-[#0a0a0f]">
              {alertCount}
            </span>
          )}
        </button>
        
        <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors ml-2">
          <User className="w-4 h-4 text-[#e8e6f0]" />
        </button>
      </div>
    </div>
  );
}

export default function MHOCDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'INTELLIGENCE' | 'STREAMS' | 'ROSTER'>('INTELLIGENCE');
  
  // Simulated Data Fetching
  const snapshot = getMockRiskSnapshot();
  const events = getMockEvents();
  const trends = getMockTrendData();
  const insights = getMockInsights();
  const explainability = getMockExplainability();
  
  const alertCount = events.filter(e => !e.acknowledged).length;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; // Avoid hydration mismatch

  return (
    <div className="h-screen w-screen bg-[#050508] flex flex-col overflow-hidden text-[#e8e6f0]">
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* Row 1: Command Strip */}
      <div className="px-4 py-3 flex-shrink-0 z-10">
        <CommandStrip alertCount={alertCount} />
      </div>

      <main className="flex-1 flex flex-col px-4 pb-4 min-h-0 z-10 gap-4">
        
        {/* Row 2: Fixed Top KPIs (180px height to leave room for content below) */}
        <div className="grid grid-cols-12 gap-4 h-[200px] lg:h-[220px] shrink-0">
          <div className="col-span-2 h-full">
            <WellnessScore compositeScore={snapshot.composite_score} delta24h={snapshot.delta_24h} />
          </div>
          <div className="col-span-2 h-full">
            <RiskGauge 
              dimension="GAMING" score={snapshot.igd_score} tier="high" delta={1.2}
              components={[{ name: "DSM-5", weight: 0.4, value: "7/9" }, { name: "Duration", weight: 0.35, value: "6.4h" }]}
            />
          </div>
          <div className="col-span-2 h-full">
            <RiskGauge 
              dimension="BDD" score={snapshot.bdd_score} tier="moderate" delta={0}
              components={[{ name: "Clinical", weight: 0.5, value: "67.9%" }, { name: "Signals", weight: 0.25, value: "2/wk" }]}
            />
          </div>
          <div className="col-span-2 h-full">
            <StressIndex score={snapshot.stress_score} liveBpm={89} hrv={27.5} />
          </div>
          <div className="col-span-2 h-full">
            <SleepIndex score={snapshot.sleep_score} avgHours={4.8} quality={2} />
          </div>
          <div className="col-span-2 h-full">
            <CompositeMeter score={snapshot.composite_score} tier={snapshot.risk_tier} delta24h={snapshot.delta_24h} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 border-b border-white/[0.06] pb-2 shrink-0 px-2 relative z-20">
          <button 
            onClick={() => setActiveTab('INTELLIGENCE')}
            className={`flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase pb-2 -mb-[9px] border-b-2 transition-all ${activeTab === 'INTELLIGENCE' ? 'text-[#a78bff] border-[#a78bff]' : 'text-[#4a4860] border-transparent hover:text-[#8b8aa0]'}`}
          >
            <Activity className="w-3.5 h-3.5" /> Intelligence Center
          </button>
          <button 
            onClick={() => setActiveTab('STREAMS')}
            className={`flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase pb-2 -mb-[9px] border-b-2 transition-all ${activeTab === 'STREAMS' ? 'text-[#22d3a0] border-[#22d3a0]' : 'text-[#4a4860] border-transparent hover:text-[#8b8aa0]'}`}
          >
            <Database className="w-3.5 h-3.5" /> Live Operations
          </button>
          <button 
            onClick={() => setActiveTab('ROSTER')}
            className={`flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase pb-2 -mb-[9px] border-b-2 transition-all ${activeTab === 'ROSTER' ? 'text-[#f59e0b] border-[#f59e0b]' : 'text-[#4a4860] border-transparent hover:text-[#8b8aa0]'}`}
          >
            <Users className="w-3.5 h-3.5" /> User Roster
          </button>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            
            {activeTab === 'INTELLIGENCE' && (
              <motion.div 
                key="intelligence"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                className="absolute inset-0 grid grid-cols-12 gap-4 h-full"
              >
                <div className="col-span-7 h-full min-h-0">
                  <WeeklyTrendCharts data={trends} />
                </div>
                <div className="col-span-5 h-full min-h-0">
                  <AIInsightsPanel insights={insights} report={explainability} />
                </div>
              </motion.div>
            )}

            {activeTab === 'STREAMS' && (
              <motion.div 
                key="streams"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                className="absolute inset-0 grid grid-cols-12 gap-4 h-full"
              >
                <div className="col-span-3 h-full min-h-0">
                  <LiveRiskFeed snapshot={snapshot} />
                </div>
                <div className="col-span-5 h-full min-h-0">
                  <EventFeed events={events} />
                </div>
                <div className="col-span-4 h-full min-h-0">
                  <AlertTimeline items={[
                    { id: "t1", timestamp: new Date().toISOString(), type: "risk_score", severity: "critical", label: "Risk Tier Escalation", description: "Composite risk increased to CRITICAL based on sleep deficit + gaming.", metadata: {} },
                    { id: "t2", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "journal", severity: "alert", label: "Journal Distress Signal", description: "3 IGD + 2 BDD signals found in latest entry.", metadata: {} },
                    { id: "t3", timestamp: new Date(Date.now() - 7200000).toISOString(), type: "sleep", severity: "warning", label: "Sleep Deficit Alert", description: "Average sleep fell below 5h over 3-day trend.", metadata: {} },
                    { id: "t4", timestamp: new Date(Date.now() - 10800000).toISOString(), type: "checkin", severity: "info", label: "Daily Check-in", description: "Mood: 3/10, Anxiety: 8/10", metadata: {} }
                  ]} />
                </div>
              </motion.div>
            )}

            {activeTab === 'ROSTER' && (
              <motion.div 
                key="roster"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                className="absolute inset-0 h-full min-h-0"
              >
                <UserRiskTable users={[
                  {
                    user_id: "demo", display_name: "Alex C", avatar_initials: "AC",
                    composite_score: snapshot.composite_score, risk_tier: snapshot.risk_tier,
                    delta_24h: snapshot.delta_24h || 0, top_dimension: "IGD", top_score: snapshot.igd_score,
                    last_active: new Date().toISOString(), active_interventions: 3, unacknowledged_alerts: alertCount,
                    trend_7d: trends.slice(-7).map(d => d.composite_score), trend_direction: "worsening"
                  }
                ]} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
