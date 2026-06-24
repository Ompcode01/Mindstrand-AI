"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Brain, Send, Tag, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { createJournalEntry, getJournalEntries } from "@/lib/api/client";
import { GlassPanel, RiskBadge } from "@/components/shared/risk-ui";
import { formatRelativeTime } from "@/lib/utils";

const moodColors: Record<string, string> = {
  positive: "#22d3a0",
  neutral: "#8b8aa0",
  negative: "#f59e0b",
  distressed: "#ef4444",
};

const moodEmoji: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😔",
  distressed: "😰",
};

export default function JournalPage() {
  const [token, setToken] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const qc = useQueryClient();

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      if (data.session) setToken(data.session.access_token);
    });
  }, []);

  const { data: entries = [] } = useQuery({
    queryKey: ["journal", token],
    queryFn: () => getJournalEntries(token!),
    enabled: !!token,
  });

  const submit = useMutation({
    mutationFn: async () => {
      setAnalyzing(true);
      const result = await createJournalEntry(token!, content);
      return result;
    },
    onSuccess: (data) => {
      setLastResult(data);
      setContent("");
      setAnalyzing(false);
      qc.invalidateQueries({ queryKey: ["journal"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => setAnalyzing(false),
  });

  return (
    <div className="min-h-screen bg-[#050508] ml-56 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Behavioral Journal</h1>
          <p className="text-[#8b8aa0] text-sm">Write freely. Gemini AI analyzes your entries for behavioral patterns.</p>
        </div>

        {/* Editor */}
        <GlassPanel className="border border-[#7c54ff]/20">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-[#7c54ff]" />
            <span className="text-xs font-mono text-[#7c54ff] tracking-wider">AI-ANALYZED ENTRY</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write about your day, how you're feeling, your thoughts about gaming or your appearance... Gemini AI will analyze patterns without judgment."
            rows={8}
            className="w-full bg-transparent text-white placeholder-[#4a4860] focus:outline-none resize-none text-sm leading-relaxed"
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.05]">
            <span className="text-xs text-[#4a4860] font-mono">{content.length} chars</span>
            <motion.button
              onClick={() => submit.mutate()}
              disabled={content.length < 10 || analyzing}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white disabled:opacity-40 transition-all"
              style={{ background: "linear-gradient(135deg, #7c54ff, #5a2de0)" }}
            >
              {analyzing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15" />
                  </svg>
                  Gemini analyzing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Analyze Entry
                </>
              )}
            </motion.button>
          </div>
        </GlassPanel>

        {/* AI Result */}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="glass rounded-xl p-5 border border-[#22d3a0]/30"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#22d3a0]" />
                <span className="text-xs font-mono text-[#22d3a0] tracking-wider">GEMINI ANALYSIS COMPLETE</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-[9px] font-mono text-[#4a4860] mb-1">MOOD TAG</p>
                  <p className="text-sm font-medium" style={{ color: moodColors[lastResult.mood_tag] }}>
                    {moodEmoji[lastResult.mood_tag]} {lastResult.mood_tag?.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-mono text-[#4a4860] mb-1">SENTIMENT</p>
                  <p className="text-sm font-mono" style={{ color: lastResult.sentiment_score > 0 ? "#22d3a0" : "#ef4444" }}>
                    {lastResult.sentiment_score > 0 ? "+" : ""}{lastResult.sentiment_score?.toFixed(3)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-mono text-[#4a4860] mb-1">AI TAGS</p>
                  <div className="flex flex-wrap gap-1">
                    {(lastResult.ai_tags || []).slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-[#7c54ff]/20 text-[#a78bff] font-mono">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#8b8aa0] leading-relaxed">{lastResult.ai_analysis}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Entry History */}
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Journal History</h2>
          <div className="space-y-3">
            {(entries as any[]).map((entry: any) => (
              <GlassPanel key={entry.id} className="hover:border-white/10 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{moodEmoji[entry.mood_tag] || "📝"}</span>
                    <div>
                      <p className="text-[10px] font-mono text-[#4a4860]">{formatRelativeTime(entry.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end max-w-[50%]">
                    {(entry.ai_tags || []).slice(0, 2).map((tag: string) => (
                      <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded bg-[#7c54ff]/15 text-[#a78bff] font-mono">{tag}</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[#8b8aa0] line-clamp-2">{entry.content}</p>
                {entry.ai_analysis && (
                  <p className="text-xs text-[#4a4860] mt-2 pt-2 border-t border-white/[0.04] italic">{entry.ai_analysis}</p>
                )}
              </GlassPanel>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
