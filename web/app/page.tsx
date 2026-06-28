"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
  Shield,
  Activity,
  Brain,
  Zap,
  Eye,
  TrendingUp,
  ChevronRight,
  Wifi,
  Lock,
  BarChart3,
} from "lucide-react";

// ─── Animation Variants ───
const fadeUp: any = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Stats ───
const stats = [
  { value: "2.3B+", label: "Gamers Worldwide" },
  { value: "8-15%", label: "Gaming Disorder Prevalence" },
  { value: "1 in 50", label: "Affected by BDD" },
  { value: "97%", label: "Cases Undetected" },
];

// ─── Features ───
const features = [
  {
    icon: Brain,
    title: "IGD Risk Intelligence",
    description:
      "DSM-5 aligned assessment engine analyzes gaming patterns, mood trajectories, and behavioral signals to compute real-time Internet Gaming Disorder risk scores.",
    color: "#7c54ff",
    tag: "AI-Powered",
  },
  {
    icon: Eye,
    title: "BDD Pattern Recognition",
    description:
      "Multi-dimensional behavioral analysis detects Body Dysmorphic Disorder signals from journal entries, mood patterns, and validated clinical questionnaires.",
    color: "#a78bff",
    tag: "Clinical-Grade",
  },
  {
    icon: Activity,
    title: "Biometric Correlation",
    description:
      "Smartwatch integration streams HRV, sleep quality, and stress indices — correlating physiological data with behavioral risk patterns in real time.",
    color: "#22d3a0",
    tag: "Live Telemetry",
  },
  {
    icon: Zap,
    title: "Instant Intervention",
    description:
      "When risk thresholds are crossed, Gemini AI generates personalized, evidence-based intervention plans with step-by-step CBT-informed action items.",
    color: "#f59e0b",
    tag: "Evidence-Based",
  },
  {
    icon: TrendingUp,
    title: "Behavioral Timeline",
    description:
      "SOC-style event timeline visualizes the full behavioral history — gaming sessions, mood entries, risk spikes — with explainable AI annotations.",
    color: "#f97316",
    tag: "Explainable AI",
  },
  {
    icon: BarChart3,
    title: "Clinical Reports",
    description:
      "Generate structured behavioral health reports suitable for sharing with mental health professionals, with full audit trail and confidence metrics.",
    color: "#ef4444",
    tag: "Share-Ready",
  },
];

// ─── Dashboard Preview Stats ───
const dashboardMetrics = [
  { label: "IGD RISK", value: "81", tier: "critical", color: "#ef4444" },
  { label: "BDD RISK", value: "67", tier: "high", color: "#f97316" },
  { label: "SLEEP", value: "72", tier: "high", color: "#f97316" },
  { label: "STRESS", value: "68", tier: "high", color: "#f97316" },
];

// ─── Event Feed Preview ───
const demoEvents = [
  { time: "14:32", type: "ALERT", msg: "Gaming session exceeded 6 hours", color: "#ef4444" },
  { time: "14:18", type: "WARN", msg: "Journal: body image concerns detected", color: "#f97316" },
  { time: "13:55", type: "INFO", msg: "Sleep deficit: 4.8h recorded last night", color: "#f59e0b" },
  { time: "13:12", type: "ALERT", msg: "HRV dropped 22% — elevated stress", color: "#ef4444" },
  { time: "12:40", type: "WARN", msg: "Consecutive negative mood check-ins: 3", color: "#f97316" },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div className="min-h-screen bg-[#050508] overflow-hidden">
      {/* ─── Background Grid ─── */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* ─── Ambient Orbs ─── */}
      <div
        className="fixed top-[-20vh] left-[-10vw] w-[60vw] h-[60vh] rounded-full opacity-[0.07] blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #7c54ff, transparent)" }}
      />
      <div
        className="fixed bottom-[-20vh] right-[-10vw] w-[50vw] h-[50vh] rounded-full opacity-[0.05] blur-[100px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #5a2de0, transparent)" }}
      />

      {/* ─── Navbar ─── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-lavender-600 flex items-center justify-center glow-lavender">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">MindShield</span>
            <span className="text-[#7c54ff] font-semibold text-lg">AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-[#8b8aa0]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#dashboard" className="hover:text-white transition-colors">Dashboard</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-[#8b8aa0] hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-all duration-300 hover:opacity-90 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c54ff, #5a2de0)" }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero Section ─── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Copy */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#7c54ff]/30 bg-[#7c54ff]/10">
                <div className="w-2 h-2 rounded-full bg-[#22d3a0] pulse-ring-low" />
                <span className="text-xs font-mono text-[#a78bff] tracking-wider">LIVE BEHAVIORAL MONITORING</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight">
                <span className="text-white">Your mind's</span>
                <br />
                <span className="gradient-text">security center</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-[#8b8aa0] leading-relaxed max-w-xl">
                MindShield AI is a Mental Health Operations Center that detects Internet
                Gaming Disorder and Body Dysmorphic Disorder before they escalate — using
                behavioral AI, biometric correlation, and explainable insights.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signup"
                  className="group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{
                    background: "linear-gradient(135deg, #7c54ff, #5a2de0)",
                    boxShadow: "0 0 30px rgba(124, 84, 255, 0.3)",
                  }}
                >
                  Start Free Assessment
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#dashboard"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold border border-white/10 text-[#8b8aa0] hover:text-white hover:border-[#7c54ff]/40 transition-all duration-300"
                >
                  <Eye className="w-4 h-4" />
                  View Demo
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div variants={fadeUp} className="flex items-center gap-6 pt-2">
                {[
                  { icon: Lock, text: "HIPAA-Aware Design" },
                  { icon: Wifi, text: "Real-time AI" },
                  { icon: Shield, text: "DSM-5 Aligned" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs text-[#4a4860]">
                    <Icon className="w-3 h-3 text-[#7c54ff]" />
                    {text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ y: parallaxY }}
              className="relative"
            >
              {/* MHOC Preview Card */}
              <div className="glass-strong rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl"
                style={{ boxShadow: "0 0 80px rgba(124, 84, 255, 0.15)" }}>
                {/* Top bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                    <div className="w-3 h-3 rounded-full bg-[#22d3a0]" />
                  </div>
                  <div className="text-xs font-mono text-[#4a4860]">MHOC DASHBOARD — THREAT LEVEL: HIGH</div>
                  <div className="w-2 h-2 rounded-full bg-[#ef4444] pulse-ring-critical" />
                </div>

                {/* Risk gauges row */}
                <div className="grid grid-cols-4 gap-px bg-white/[0.04] p-px">
                  {dashboardMetrics.map((m) => (
                    <div key={m.label} className="bg-[#0a0a0f] p-3 text-center">
                      <div className="text-[9px] font-mono text-[#4a4860] mb-1">{m.label}</div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: "spring" }}
                        className="text-2xl font-bold font-mono"
                        style={{ color: m.color }}
                      >
                        {m.value}
                      </motion.div>
                      <div className="text-[8px] font-mono mt-0.5" style={{ color: m.color }}>
                        ▲ {m.tier.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Event feed */}
                <div className="p-4 space-y-2">
                  <div className="text-[9px] font-mono text-[#4a4860] mb-3">◉ LIVE BEHAVIORAL EVENTS</div>
                  {demoEvents.map((evt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="flex items-center gap-3 text-[10px] font-mono py-1.5 border-b border-white/[0.04] last:border-0"
                    >
                      <span className="text-[#4a4860]">{evt.time}</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[8px] font-bold"
                        style={{ color: evt.color, background: evt.color + "20" }}
                      >
                        {evt.type}
                      </span>
                      <span className="text-[#8b8aa0] flex-1 truncate">{evt.msg}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom biometrics bar */}
                <div className="flex items-center gap-4 px-4 py-3 bg-white/[0.02] border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-[#22d3a0]" />
                    <span className="text-[9px] font-mono text-[#22d3a0]">89 BPM</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-[#f59e0b]">HRV: 28ms</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-[#f97316]">Sleep: 4.8h</span>
                  </div>
                  <div className="flex-1" />
                  <div className="text-[9px] font-mono text-[#4a4860]">● AI ANALYZING</div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 }}
                className="absolute -bottom-4 -left-4 glass rounded-xl px-3 py-2 border border-[#ef4444]/30"
                style={{ boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)" }}
              >
                <div className="text-[9px] font-mono text-[#4a4860] mb-1">COMPOSITE RISK</div>
                <div className="text-2xl font-bold font-mono text-[#ef4444]">73</div>
                <div className="text-[9px] text-[#ef4444] font-mono">↑ +8.2 pts today</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="border-y border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="text-center">
                <div className="text-3xl font-bold gradient-text mb-1">{s.value}</div>
                <div className="text-sm text-[#4a4860]">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="space-y-4 mb-16 text-center"
        >
          <motion.p variants={fadeUp} className="text-xs font-mono text-[#7c54ff] tracking-[0.3em] uppercase">
            Intelligence Platform
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl font-bold text-white">
            Every signal. Analyzed.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#8b8aa0] max-w-2xl mx-auto">
            MindShield aggregates behavioral signals across 7 data dimensions and feeds them
            into a multi-modal AI engine that thinks like a clinical psychologist.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                className="glass rounded-xl p-6 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: f.color + "20", boxShadow: `0 0 20px ${f.color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white">{f.title}</h3>
                  <span
                    className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                    style={{ color: f.color, background: f.color + "15" }}
                  >
                    {f.tag}
                  </span>
                </div>
                <p className="text-sm text-[#8b8aa0] leading-relaxed">{f.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-12 text-center relative overflow-hidden border border-[#7c54ff]/20"
          style={{ boxShadow: "0 0 80px rgba(124, 84, 255, 0.1)" }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              background: "radial-gradient(ellipse at center, #7c54ff, transparent 70%)",
            }}
          />
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#7c54ff] tracking-widest">
              <div className="w-2 h-2 rounded-full bg-[#22d3a0] pulse-ring-low" />
              FREE TO START — NO CREDIT CARD
            </div>
            <h2 className="text-4xl font-bold text-white">
              Take control of your
              <br />
              <span className="gradient-text">behavioral health</span>
            </h2>
            <p className="text-[#8b8aa0] max-w-lg mx-auto">
              Complete your 6-minute assessment and see your behavioral health risk profile.
              Powered by the same AI used in clinical research.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #7c54ff, #5a2de0)",
                boxShadow: "0 0 40px rgba(124, 84, 255, 0.35)",
              }}
            >
              Begin Free Assessment
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/[0.05] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#4a4860] text-sm">
            <Shield className="w-4 h-4 text-[#7c54ff]" />
            <span>MindShield AI — Not a medical device. For awareness and educational purposes.</span>
          </div>
          <div className="text-xs text-[#4a4860] font-mono">
            Built with Gemini AI · Supabase · Next.js 15
          </div>
        </div>
      </footer>
    </div>
  );
}
