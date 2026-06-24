"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Check, X, ChevronDown, ChevronUp, Brain, AlertTriangle, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getInterventions, updateIntervention, generateIntervention } from "@/lib/api/client";
import { GlassPanel } from "@/components/shared/risk-ui";
import { formatRelativeTime } from "@/lib/utils";

const severityConfig: Record<string, { color: string; label: string; bg: string; icon: any }> = {
  advisory: { color: "#a78bff", label: "ADVISORY", bg: "#a78bff20", icon: Shield },
  warning:  { color: "#f59e0b", label: "WARNING", bg: "#f59e0b20", icon: AlertTriangle },
  alert:    { color: "#f97316", label: "ALERT", bg: "#f9731620", icon: AlertTriangle },
  critical: { color: "#ef4444", label: "CRITICAL", bg: "#ef444420", icon: Zap },
};

function InterventionCard({ iv, onUpdate }: { iv: any; onUpdate: (id: string, status: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = severityConfig[iv.severity] || severityConfig.advisory;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="glass rounded-xl border overflow-hidden"
      style={{ borderColor: cfg.color + "40" }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cfg.bg }}>
              <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
            </div>
            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded" style={{ color: cfg.color, background: cfg.bg }}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#4a4860]">{formatRelativeTime(iv.created_at)}</span>
            <button onClick={() => setExpanded(!expanded)} className="text-[#4a4860] hover:text-white transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <h3 className="font-semibold text-white mb-1">{iv.title}</h3>
        <p className="text-sm text-[#8b8aa0]">{iv.description}</p>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4">
                {iv.ai_rationale && (
                  <div className="p-3 rounded-lg bg-[#7c54ff]/10 border border-[#7c54ff]/20">
                    <p className="text-[9px] font-mono text-[#7c54ff] mb-1 flex items-center gap-1">
                      <Brain className="w-3 h-3" /> GEMINI RATIONALE
                    </p>
                    <p className="text-xs text-[#8b8aa0]">{iv.ai_rationale}</p>
                  </div>
                )}
                {iv.action_steps?.length > 0 && (
                  <div>
                    <p className="text-[9px] font-mono text-[#4a4860] mb-2 tracking-wider">ACTION STEPS</p>
                    <div className="space-y-2">
                      {iv.action_steps.map((step: any, i: number) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full border border-[#7c54ff]/40 flex items-center justify-center flex-shrink-0 text-[9px] font-mono text-[#7c54ff] mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-sm text-[#8b8aa0]">{step.step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {iv.status === "active" && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onUpdate(iv.id, "acknowledged")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/[0.08] text-[#8b8aa0] hover:text-white hover:border-white/20 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Acknowledge
            </button>
            <button
              onClick={() => onUpdate(iv.id, "resolved")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#22d3a0] border border-[#22d3a0]/30 hover:bg-[#22d3a0]/10 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Mark Resolved
            </button>
          </div>
        )}

        {iv.status !== "active" && (
          <div className="mt-3 text-[9px] font-mono text-[#4a4860] uppercase">{iv.status}</div>
        )}
      </div>
    </motion.div>
  );
}

export default function InterventionsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [filter, setFilter] = useState("active");
  const qc = useQueryClient();

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      if (data.session) setToken(data.session.access_token);
    });
  }, []);

  const { data: interventions = [], isLoading } = useQuery({
    queryKey: ["interventions", token, filter],
    queryFn: () => getInterventions(token!, filter),
    enabled: !!token,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateIntervention(token!, id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["interventions"] }),
  });

  const generateMutation = useMutation({
    mutationFn: () => generateIntervention(token!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["interventions"] }),
  });

  return (
    <div className="min-h-screen bg-[#050508] ml-56 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Intervention Center</h1>
            <p className="text-[#8b8aa0] text-sm">AI-generated evidence-based action plans based on your risk profile.</p>
          </div>
          <motion.button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white disabled:opacity-60 transition-all"
            style={{ background: "linear-gradient(135deg, #7c54ff, #5a2de0)" }}
          >
            {generateMutation.isPending ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="15" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Generate New
              </>
            )}
          </motion.button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {["active", "acknowledged", "resolved", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filter === f
                  ? "bg-[#7c54ff]/20 text-[#a78bff] border border-[#7c54ff]/40"
                  : "text-[#4a4860] hover:text-[#8b8aa0]"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="text-center py-12 text-[#4a4860] text-sm">Loading interventions...</div>
        ) : (interventions as any[]).length === 0 ? (
          <div className="glass rounded-xl p-12 text-center border border-white/[0.06]">
            <div className="text-4xl mb-3">🌿</div>
            <p className="text-white font-medium mb-1">No {filter} interventions</p>
            <p className="text-[#4a4860] text-sm">Click "Generate New" to create an AI-powered intervention plan.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {(interventions as any[]).map((iv: any) => (
                <InterventionCard
                  key={iv.id}
                  iv={iv}
                  onUpdate={(id, status) => updateMutation.mutate({ id, status })}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
