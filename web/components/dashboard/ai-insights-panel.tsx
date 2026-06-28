"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassPanel } from "@/components/shared/risk-ui";
import { AIInsightBlock, ExplainabilityReport } from "@/lib/types/mhoc";
import { ExplainabilityEngine } from "./explainability-engine";

function StreamingText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(text);
      return;
    }

    let i = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 15); // streaming speed

    return () => clearInterval(interval);
  }, [text, isStreaming]);

  return (
    <div className={`text-xs text-[#e8e6f0] leading-relaxed ${isStreaming ? 'cursor-blink' : ''}`}>
      {displayedText}
    </div>
  );
}

function InsightCard({ insight, index, isStreaming }: { insight: AIInsightBlock; index: number; isStreaming: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04] relative group"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono tracking-widest text-[#a78bff] uppercase border border-[#a78bff]/30 px-1.5 py-0.5 rounded">
            [{insight.type.replace('_', ' ')}]
          </span>
          <span className="text-[10px] font-mono text-[#8b8aa0]">P{insight.priority}</span>
        </div>
        <div className="flex gap-1">
          {insight.tags.map(tag => (
            <span key={tag} className="text-[9px] text-[#4a4860] font-mono bg-white/[0.03] px-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>
      
      <h4 className="text-sm font-semibold text-white mb-2">{insight.title}</h4>
      
      <StreamingText text={insight.content} isStreaming={isStreaming} />

      {insight.action_hint && (
        <div className="mt-3 text-[11px] text-[#22d3a0] flex items-start gap-1.5 bg-[#22d3a0]/5 p-2 rounded border border-[#22d3a0]/10">
          <span className="shrink-0 mt-0.5">→</span>
          <span>{insight.action_hint}</span>
        </div>
      )}
    </motion.div>
  );
}

export function AIInsightsPanel({
  insights: initialInsights,
  report
}: {
  insights: AIInsightBlock[];
  report: ExplainabilityReport | null;
}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveInsights, setLiveInsights] = useState<AIInsightBlock[]>(initialInsights);

  const fetchLiveGemini = async () => {
    setIsStreaming(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/insights/explain_scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer demo-token"
        },
        body: JSON.stringify({
          igd_score: 81.0,
          bdd_score: 67.0,
          physiological_score: 68.0,
          fusion_score: 72.0,
          prediction_score: 75.0
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLiveInsights(data);
        }
      }
    } catch (e) {
      console.error("Failed fetching live Gemini explanations", e);
    } finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    fetchLiveGemini();
  }, []);

  const handleRegenerate = () => {
    fetchLiveGemini();
  };

  return (
    <GlassPanel className="h-full flex flex-col relative overflow-hidden">
      {/* Subtle brain glow background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c54ff]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between z-10 bg-[#0a0a0f]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a8 8 0 0 0-8 8c0 1.62.5 3.12 1.35 4.35L4 22l4-1.5 2 1.5 2-1.5 2 1.5 4-1.5-1.35-7.65A7.95 7.95 0 0 0 20 10a8 8 0 0 0-8-8z"/>
          </svg>
          <h3 className="text-[10px] font-mono tracking-[0.15em] text-[#e8e6f0] uppercase">
            AI Insights
          </h3>
        </div>
        <button 
          onClick={handleRegenerate}
          disabled={isStreaming}
          className="text-[9px] font-mono tracking-widest text-[#8b8aa0] hover:text-[#e8e6f0] transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {isStreaming ? 'GENERATING...' : 'REGENERATE ↺'}
        </button>
      </div>

      <div className="p-4 overflow-y-auto scrollbar-hide flex-grow space-y-4">
        {liveInsights.map((insight, i) => (
          <InsightCard 
            key={insight.id} 
            insight={insight} 
            index={i} 
            isStreaming={isStreaming} 
          />
        ))}

        <ExplainabilityEngine report={report} />
      </div>
    </GlassPanel>
  );
}
