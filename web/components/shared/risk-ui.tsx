"use client";

import { motion } from "framer-motion";
import { TIER_CONFIG, SEVERITY_CONFIG, RiskTier, EventSeverity } from "@/lib/types/mhoc";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// ThreatPulse — animated risk dot
// ─────────────────────────────────────────────
export function ThreatPulse({
  tier, size = "md", className,
}: { tier: string; size?: "xs" | "sm" | "md" | "lg"; className?: string }) {
  const cfg = TIER_CONFIG[tier] ?? TIER_CONFIG.unknown;
  const px = { xs: 6, sm: 8, md: 10, lg: 14 }[size];
  return (
    <span
      className={cn("rounded-full flex-shrink-0 inline-block", cfg.pulse, className)}
      style={{ width: px, height: px, backgroundColor: cfg.color }}
      aria-hidden="true"
    />
  );
}

// ─────────────────────────────────────────────
// RiskBadge — tier pill label
// ─────────────────────────────────────────────
export function RiskBadge({
  tier, showPulse = true, className,
}: { tier: string; showPulse?: boolean; className?: string }) {
  const cfg = TIER_CONFIG[tier] ?? TIER_CONFIG.unknown;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold tracking-widest uppercase", className)}
      style={{ background: cfg.bg, borderColor: cfg.color + "50", color: cfg.color }}
      aria-label={`Risk tier: ${cfg.label}`}
    >
      {showPulse && <ThreatPulse tier={tier} size="xs" />}
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// SeverityBadge — event severity chip
// ─────────────────────────────────────────────
export function SeverityBadge({ severity, className }: { severity: string; className?: string }) {
  const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.info;
  return (
    <span
      className={cn("px-1.5 py-0.5 rounded text-[8px] font-mono font-bold tracking-wider flex-shrink-0", className)}
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// AnimatedScore — spring-animated numeric counter
// ─────────────────────────────────────────────
export function AnimatedScore({
  value, className, size = "md",
}: { value: number; className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizeMap = { sm: "text-xl", md: "text-3xl", lg: "text-5xl", xl: "text-7xl" };
  return (
    <motion.span
      key={Math.round(value)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className={cn("font-mono tabular-nums font-bold", sizeMap[size], className)}
    >
      {Math.round(value)}
    </motion.span>
  );
}

// ─────────────────────────────────────────────
// GlassPanel — glassmorphism widget container
// ─────────────────────────────────────────────
export function GlassPanel({
  children, className, glow, hover = false, onClick, id, style,
}: {
  children: React.ReactNode; className?: string; glow?: string;
  hover?: boolean; onClick?: () => void; id?: string; style?: React.CSSProperties;
}) {
  return (
    <motion.div
      id={id}
      className={cn("glass rounded-xl border border-white/[0.06] transition-all duration-300", hover && "cursor-pointer hover:border-white/[0.12]", className)}
      style={glow ? { boxShadow: `0 0 24px ${glow}`, ...style } : style}
      onClick={onClick}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// WidgetHeader — consistent section header
// ─────────────────────────────────────────────
export function WidgetHeader({
  title, subtitle, live = false, children,
}: { title: string; subtitle?: string; live?: boolean; children?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <div className="flex items-center gap-2">
          {live && <ThreatPulse tier="low" size="xs" />}
          <h3 className="text-[9px] font-mono text-[#4a4860] tracking-[0.15em] uppercase">{title}</h3>
        </div>
        {subtitle && <p className="text-[10px] text-[#4a4860] mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-1.5">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// SkeletonWidget — loading placeholder
// ─────────────────────────────────────────────
export function SkeletonWidget({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("glass rounded-xl border border-white/[0.06] p-4 space-y-3", className)}>
      <div className="skeleton h-3 w-20 rounded" />
      <div className="skeleton h-10 w-16 rounded" />
      {Array.from({ length: lines - 2 }).map((_, i) => (
        <div key={i} className="skeleton h-3 w-full rounded" />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// DeltaIndicator — trend arrow + value
// ─────────────────────────────────────────────
export function DeltaIndicator({ delta, className }: { delta: number | null; className?: string }) {
  if (delta === null) return null;
  const up = delta > 0.3;
  const down = delta < -0.3;
  const color = up ? "#ef4444" : down ? "#22d3a0" : "#8b8aa0";
  const symbol = up ? "↑" : down ? "↓" : "—";
  return (
    <span className={cn("text-[10px] font-mono flex items-center gap-0.5", className)} style={{ color }}>
      {symbol} {Math.abs(delta).toFixed(1)} pts
    </span>
  );
}

// ─────────────────────────────────────────────
// MiniSparkline — 7-point inline chart
// ─────────────────────────────────────────────
export function MiniSparkline({
  data, color = "#7c54ff", width = 60, height = 20,
}: { data: number[]; color?: string; width?: number; height?: number }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.8 }}
      />
    </svg>
  );
}
