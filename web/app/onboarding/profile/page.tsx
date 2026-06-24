"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { createClient } from "@/lib/supabase/client";
import { submitAssessment, syncProfile, recalculateRisk } from "@/lib/api/client";

// ─── Step configs ───
const steps = [
  { id: 1, title: "Profile", description: "Tell us about yourself" },
  { id: 2, title: "IGD Assessment", description: "Gaming behavior evaluation" },
  { id: 3, title: "BDD Assessment", description: "Body image & self-perception" },
  { id: 4, title: "Gaming Habits", description: "Your gaming patterns" },
  { id: 5, title: "Wellness Baseline", description: "Sleep & stress levels" },
  { id: 6, title: "Device Connect", description: "Link your health tracker" },
  { id: 7, title: "Analysis", description: "AI processing your data" },
];

// ─── IGD Questions (DSM-5 aligned) ───
const igdQuestions = [
  { id: "igd_preoccupation", text: "How often do you think about gaming when you're doing other activities?" },
  { id: "igd_withdrawal", text: "Do you feel restless, irritable, or anxious when you can't play?" },
  { id: "igd_tolerance", text: "Do you need to play for longer to feel satisfied?" },
  { id: "igd_unsuccessful_reduction", text: "Have you tried to cut back on gaming but couldn't?" },
  { id: "igd_loss_of_interest", text: "Have you lost interest in hobbies you used to enjoy due to gaming?" },
  { id: "igd_continued_despite_problems", text: "Do you keep gaming even though it causes problems in your life?" },
  { id: "igd_deception", text: "Have you hidden how much time you spend gaming from others?" },
  { id: "igd_escape_negative_mood", text: "Do you game to escape bad feelings, stress, or anxiety?" },
  { id: "igd_jeopardized_relationship", text: "Have you risked or lost a relationship or job opportunity because of gaming?" },
];

// ─── BDD Questions (BDDQ-adapted) ───
const bddQuestions = [
  { id: "bdd_preoccupation_hours", text: "How many hours per day do you spend thinking about a perceived flaw in your appearance?" },
  { id: "bdd_distress_level", text: "How much distress does your concern about your appearance cause you?" },
  { id: "bdd_avoidance_behavior", text: "How often do you avoid situations because of how you look?" },
  { id: "bdd_repetitive_checking", text: "How often do you check your appearance in mirrors or other reflective surfaces?" },
  { id: "bdd_comparison_behavior", text: "How often do you compare your appearance to others?" },
  { id: "bdd_camouflage_behavior", text: "How much time do you spend camouflaging perceived flaws?" },
  { id: "bdd_daily_impairment", text: "How much does your appearance concern interfere with daily activities?" },
];

const likertLabels = ["Never", "Rarely", "Sometimes", "Often", "Always"];

function LikertQuestion({
  question,
  value,
  onChange,
}: {
  question: string;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-4">
      <p className="text-white font-medium leading-relaxed">{question}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
              value === v
                ? "border-[#7c54ff] bg-[#7c54ff]/20 text-[#a78bff]"
                : "border-white/[0.08] bg-white/[0.02] text-[#4a4860] hover:border-white/20 hover:text-[#8b8aa0]"
            }`}
          >
            <div className="text-xs mb-0.5 font-mono">{v}</div>
            <div className="text-[9px] leading-tight">{likertLabels[v - 1]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingLayout() {
  const router = useRouter();
  const store = useOnboardingStore();
  const { step, data, nextStep, prevStep, setData, setIGDResponse, setBDDResponse } = store;
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [deviceScanning, setDeviceScanning] = useState(false);
  const [deviceConnected, setDeviceConnected] = useState(false);

  const currentStep = steps[step - 1];
  const progress = ((step - 1) / (steps.length - 1)) * 100;

  const handleNext = async () => {
    if (step === steps.length) return;
    if (step === 2) {
      // Submit IGD assessment
      const supabase = createClient();
      const session = await supabase.auth.getSession();
      if (session.data.session) {
        try {
          await submitAssessment(session.data.session.access_token, {
            type: "IGD",
            responses: data.igdResponses,
          });
        } catch (e) { /* continue */ }
      }
    }
    if (step === 3) {
      // Submit BDD assessment
      const supabase = createClient();
      const session = await supabase.auth.getSession();
      if (session.data.session) {
        try {
          await submitAssessment(session.data.session.access_token, {
            type: "BDD",
            responses: data.bddResponses,
          });
        } catch (e) { /* continue */ }
      }
    }
    if (step === 6) {
      // Final step before analysis — recalculate risk
      setAnalyzing(true);
      const supabase = createClient();
      const session = await supabase.auth.getSession();
      if (session.data.session) {
        try {
          await recalculateRisk(session.data.session.access_token);
        } catch (e) { /* continue */ }
      }
      setTimeout(() => {
        setAnalyzing(false);
        router.push("/dashboard");
      }, 5000);
      return;
    }
    nextStep();
  };

  const handleDeviceConnect = () => {
    setDeviceScanning(true);
    setTimeout(() => {
      setDeviceScanning(false);
      setDeviceConnected(true);
      setData({ deviceConnected: true });
    }, 3000);
  };

  const igdAnswered = Object.keys(data.igdResponses).length;
  const bddAnswered = Object.keys(data.bddResponses).length;

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col">
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div
        className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7c54ff] to-[#5a2de0] transition-all duration-700"
        style={{ width: `${progress}%` }}
      />

      {/* Header */}
      <div className="glass-strong border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#7c54ff] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">MindShield AI</span>
        </div>
        <div className="flex items-center gap-2">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`transition-all duration-300 rounded-full ${
                s.id < step
                  ? "w-5 h-5 bg-[#7c54ff] flex items-center justify-center"
                  : s.id === step
                  ? "w-2 h-2 bg-[#7c54ff]"
                  : "w-2 h-2 bg-white/10"
              }`}
            >
              {s.id < step && <Check className="w-3 h-3 text-white" />}
            </div>
          ))}
        </div>
        <div className="text-sm text-[#4a4860] font-mono">
          {step}/{steps.length}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-8"
            >
              {/* Step header */}
              <div>
                <p className="text-xs font-mono text-[#7c54ff] tracking-wider mb-2">
                  STEP {step} OF {steps.length}
                </p>
                <h2 className="text-3xl font-bold text-white">{currentStep.title}</h2>
                <p className="text-[#8b8aa0] mt-1">{currentStep.description}</p>
              </div>

              {/* Step 1: Profile */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-[#8b8aa0] mb-2 tracking-wider">FULL NAME</label>
                    <input
                      value={data.fullName}
                      onChange={(e) => setData({ fullName: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-[#4a4860] focus:outline-none focus:border-[#7c54ff]/60 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-[#8b8aa0] mb-2 tracking-wider">AGE</label>
                      <input
                        type="number"
                        value={data.age || ""}
                        onChange={(e) => setData({ age: parseInt(e.target.value) })}
                        placeholder="e.g. 24"
                        min={13}
                        max={100}
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-[#4a4860] focus:outline-none focus:border-[#7c54ff]/60 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#8b8aa0] mb-2 tracking-wider">GENDER</label>
                      <select
                        value={data.gender}
                        onChange={(e) => setData({ gender: e.target.value })}
                        className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white focus:outline-none focus:border-[#7c54ff]/60 transition-all"
                      >
                        <option value="" className="bg-[#0f0f18]">Select</option>
                        <option value="male" className="bg-[#0f0f18]">Male</option>
                        <option value="female" className="bg-[#0f0f18]">Female</option>
                        <option value="non-binary" className="bg-[#0f0f18]">Non-binary</option>
                        <option value="prefer-not" className="bg-[#0f0f18]">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: IGD */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="glass rounded-xl p-4 border border-[#7c54ff]/20">
                    <p className="text-xs font-mono text-[#7c54ff] mb-1">DSM-5 ALIGNED</p>
                    <p className="text-sm text-[#8b8aa0]">Rate each on a scale from 1 (Never) to 5 (Always) based on the past 12 months.</p>
                  </div>
                  <div className="space-y-6">
                    {igdQuestions.map((q) => (
                      <LikertQuestion
                        key={q.id}
                        question={q.text}
                        value={data.igdResponses[q.id]}
                        onChange={(v) => setIGDResponse(q.id, v)}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-[#4a4860] text-center font-mono">
                    {igdAnswered}/{igdQuestions.length} answered
                  </div>
                </div>
              )}

              {/* Step 3: BDD */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="glass rounded-xl p-4 border border-[#a78bff]/20">
                    <p className="text-xs font-mono text-[#a78bff] mb-1">BDDQ-ADAPTED</p>
                    <p className="text-sm text-[#8b8aa0]">These questions are about concerns regarding your physical appearance.</p>
                  </div>
                  <div className="space-y-6">
                    {bddQuestions.map((q) => (
                      <LikertQuestion
                        key={q.id}
                        question={q.text}
                        value={data.bddResponses[q.id]}
                        onChange={(v) => setBDDResponse(q.id, v)}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-[#4a4860] text-center font-mono">
                    {bddAnswered}/{bddQuestions.length} answered
                  </div>
                </div>
              )}

              {/* Step 4: Gaming Habits */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono text-[#8b8aa0] mb-2 tracking-wider">
                      AVERAGE GAMING HOURS PER DAY — {data.avgGamingHoursPerDay}h
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={16}
                      step={0.5}
                      value={data.avgGamingHoursPerDay}
                      onChange={(e) => setData({ avgGamingHoursPerDay: parseFloat(e.target.value) })}
                      className="w-full accent-[#7c54ff]"
                    />
                    <div className="flex justify-between text-xs text-[#4a4860] font-mono mt-1">
                      <span>0h</span><span>8h</span><span>16h</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#8b8aa0] mb-2 tracking-wider">PRIMARY GAMES / GENRES</label>
                    <input
                      value={data.primaryGames}
                      onChange={(e) => setData({ primaryGames: e.target.value })}
                      placeholder="e.g. League of Legends, FPS shooters, MMORPGs"
                      className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-[#4a4860] focus:outline-none focus:border-[#7c54ff]/60 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Wellness */}
              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-mono text-[#8b8aa0] mb-2 tracking-wider">
                      AVERAGE SLEEP PER NIGHT — {data.sleepHoursPerNight}h
                    </label>
                    <input
                      type="range"
                      min={2}
                      max={12}
                      step={0.5}
                      value={data.sleepHoursPerNight}
                      onChange={(e) => setData({ sleepHoursPerNight: parseFloat(e.target.value) })}
                      className="w-full accent-[#7c54ff]"
                    />
                    <div className="flex justify-between text-xs text-[#4a4860] font-mono mt-1">
                      <span>2h</span><span>7h</span><span>12h</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-[#8b8aa0] mb-2 tracking-wider">
                      CURRENT STRESS LEVEL — {data.stressLevel}/10
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={data.stressLevel}
                      onChange={(e) => setData({ stressLevel: parseInt(e.target.value) })}
                      className="w-full accent-[#7c54ff]"
                    />
                    <div className="flex justify-between text-xs text-[#4a4860] font-mono mt-1">
                      <span>1 — None</span><span>10 — Extreme</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Device Connect */}
              {step === 6 && (
                <div className="space-y-6 text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <div
                      className={`w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                        deviceConnected
                          ? "border-[#22d3a0] bg-[#22d3a0]/10"
                          : deviceScanning
                          ? "border-[#7c54ff] bg-[#7c54ff]/10 animate-pulse"
                          : "border-white/10 bg-white/[0.02]"
                      }`}
                    >
                      <div className="text-4xl">{deviceConnected ? "⌚" : "📡"}</div>
                    </div>
                    {deviceScanning && (
                      <>
                        <div className="absolute inset-0 rounded-full border-2 border-[#7c54ff]/30 animate-ping" />
                        <div className="absolute inset-[-16px] rounded-full border border-[#7c54ff]/20 animate-ping" style={{ animationDelay: "0.5s" }} />
                      </>
                    )}
                  </div>

                  {!deviceConnected && !deviceScanning && (
                    <>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Connect MindBand Pro</h3>
                        <p className="text-[#8b8aa0] text-sm">Sync your biometric data for richer behavioral analysis. HRV, sleep quality, and stress indices power our AI engine.</p>
                      </div>
                      <button
                        onClick={handleDeviceConnect}
                        className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                        style={{ background: "linear-gradient(135deg, #7c54ff, #5a2de0)", boxShadow: "0 0 30px rgba(124, 84, 255, 0.3)" }}
                      >
                        Scan for Devices
                      </button>
                      <button onClick={handleNext} className="block w-full text-center text-sm text-[#4a4860] hover:text-[#8b8aa0] transition-colors">
                        Skip — use simulated data
                      </button>
                    </>
                  )}

                  {deviceScanning && (
                    <div>
                      <p className="text-[#7c54ff] font-mono text-sm animate-pulse">Scanning for nearby devices...</p>
                    </div>
                  )}

                  {deviceConnected && (
                    <div>
                      <h3 className="text-xl font-bold text-[#22d3a0] mb-2">✓ MindBand Pro Connected</h3>
                      <p className="text-[#8b8aa0] text-sm">Biometric sync active. Live HRV, heart rate, and sleep data will be analyzed.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Analyzing overlay */}
          {analyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-[#050508] flex flex-col items-center justify-center z-50"
            >
              <div className="fixed inset-0 grid-bg" />
              <div className="relative space-y-8 text-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-2 border-[#7c54ff]/30 flex items-center justify-center mx-auto">
                    <div className="w-16 h-16 rounded-full border-2 border-[#7c54ff] border-t-transparent animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-[#7c54ff]/20 animate-ping mx-auto" style={{ width: 96, height: 96 }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Gemini AI is analyzing your data</h2>
                  <p className="text-[#8b8aa0]">Building your behavioral health profile...</p>
                </div>
                <div className="space-y-2 text-sm font-mono text-[#4a4860]">
                  {["Processing IGD assessment...", "Analyzing BDD questionnaire...", "Correlating biometric data...", "Computing risk scores...", "Generating insights..."].map((msg, i) => (
                    <motion.div
                      key={msg}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.8 }}
                      className="flex items-center gap-2 justify-center"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7c54ff]" />
                      {msg}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          {!analyzing && (
            <div className="flex items-center justify-between mt-10">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] text-[#8b8aa0] hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #7c54ff, #5a2de0)",
                  boxShadow: "0 0 20px rgba(124, 84, 255, 0.25)",
                }}
              >
                {step === 6 ? "Begin Analysis" : "Continue"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
