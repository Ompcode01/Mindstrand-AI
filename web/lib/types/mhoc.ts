// ─── Shared type definitions for MHOC ───
export type RiskTier = 'low' | 'moderate' | 'high' | 'critical' | 'unknown'
export type EventSeverity = 'info' | 'advisory' | 'warning' | 'alert' | 'critical'
export type EventCategory =
  | 'GAMING_BEHAVIOR' | 'BODY_IMAGE' | 'SLEEP_DISRUPTION'
  | 'STRESS_ELEVATION' | 'MOOD_DECLINE' | 'SOCIAL_WITHDRAWAL' | 'BIOMETRIC_ANOMALY'
export type DataSource = 'assessment' | 'gaming' | 'wearable' | 'journal' | 'checkin'

export interface RiskTrigger {
  id: string
  type: string
  weight: number
  description: string
  source: DataSource
  severity: string
  detected_at: string
}

export interface RiskSnapshot {
  id: string
  user_id: string
  computed_at: string
  igd_score: number
  bdd_score: number
  stress_score: number
  sleep_score: number
  composite_score: number
  risk_tier: RiskTier
  delta_1h: number | null
  delta_24h: number | null
  delta_7d: number | null
  trend_direction: 'improving' | 'stable' | 'worsening'
  triggers: RiskTrigger[]
  signal_count: number
  confidence: number
  ai_explanation: string | null
  top_concern: 'igd' | 'bdd' | 'stress' | 'sleep' | null
  intervention_priority: 'immediate' | 'soon' | 'monitor' | 'none'
}

export interface BehavioralEvent {
  id: string
  user_id: string
  created_at: string
  event_type: string
  severity: EventSeverity
  source: DataSource
  category: EventCategory
  title?: string
  description?: string
  payload: Record<string, unknown>
  acknowledged: boolean
  linked_intervention_id: string | null
}

export interface AlertTimelineItem {
  id: string
  timestamp: string
  type: string
  severity: EventSeverity
  label: string
  description: string
  linked_event_id?: string
  linked_intervention_id?: string
  metadata: Record<string, unknown>
}

export interface DailyTrendPoint {
  date: string
  day_label: string
  igd_score: number
  bdd_score: number
  stress_score: number
  sleep_score: number
  composite_score: number
  sleep_hours: number
  gaming_hours: number
  mood_avg: number
  hrv_avg: number
  event_count: number
}

export interface WeeklyTrendData {
  period: '7d' | '14d' | '30d'
  generated_at: string
  daily: DailyTrendPoint[]
}

export interface AIInsightBlock {
  id: string
  generated_at: string
  type: string
  priority: 1 | 2 | 3
  title: string
  content: string
  tags: string[]
  source_dimensions: string[]
  action_hint: string | null
  confidence: number
}

export interface FeatureContribution {
  feature_name: string
  dimension: string
  contribution_pct: number
  direction: 'positive' | 'negative'
  value: string
  color: string
}

export interface ExplainabilityReport {
  generated_at: string
  headline: string
  paragraphs: string[]
  feature_contributions: FeatureContribution[]
  overall_confidence: number
}

export interface WearableSnapshot {
  heart_rate_bpm: number
  hrv_ms: number
  sleep_hours: number
  sleep_quality: number
  steps: number
  stress_index: number
  skin_temp_c: number
  source: string
  recorded_at?: string
  is_spike?: boolean
}

export interface UserRiskRow {
  user_id: string
  display_name: string
  avatar_initials: string
  composite_score: number
  risk_tier: RiskTier
  delta_24h: number
  top_dimension: string
  top_score: number
  last_active: string
  active_interventions: number
  unacknowledged_alerts: number
  trend_7d: number[]
  trend_direction: 'improving' | 'stable' | 'worsening'
}

// ─── Tier config helper ───
export const TIER_CONFIG: Record<string, {
  color: string; glow: string; pulse: string; bg: string; label: string; textClass: string
}> = {
  low:      { color: '#22d3a0', glow: 'rgba(34,211,160,0.5)',  pulse: 'pulse-ring-low',      bg: 'rgba(34,211,160,0.10)',  label: 'LOW',      textClass: 'text-[#22d3a0]' },
  moderate: { color: '#f59e0b', glow: 'rgba(245,158,11,0.5)',  pulse: 'pulse-ring-moderate', bg: 'rgba(245,158,11,0.10)', label: 'MODERATE', textClass: 'text-[#f59e0b]' },
  high:     { color: '#f97316', glow: 'rgba(249,115,22,0.5)',  pulse: 'pulse-ring-high',     bg: 'rgba(249,115,22,0.10)', label: 'HIGH',     textClass: 'text-[#f97316]' },
  critical: { color: '#ef4444', glow: 'rgba(239,68,68,0.6)',   pulse: 'pulse-ring-critical', bg: 'rgba(239,68,68,0.10)',  label: 'CRITICAL', textClass: 'text-[#ef4444]' },
  unknown:  { color: '#4a4860', glow: 'rgba(74,72,96,0.3)',    pulse: '',                     bg: 'rgba(74,72,96,0.10)',   label: 'UNKNOWN',  textClass: 'text-[#4a4860]' },
}

export const SEVERITY_CONFIG: Record<string, { color: string; bg: string; label: string; borderClass: string }> = {
  info:     { color: '#7c54ff', bg: '#7c54ff20', label: 'INFO', borderClass: 'event-info' },
  advisory: { color: '#a78bff', bg: '#a78bff20', label: 'ADVS', borderClass: 'event-advisory' },
  warning:  { color: '#f59e0b', bg: '#f59e0b20', label: 'WARN', borderClass: 'event-warning' },
  alert:    { color: '#f97316', bg: '#f9731620', label: 'ALRT', borderClass: 'event-alert' },
  critical: { color: '#ef4444', bg: '#ef444420', label: 'CRIT', borderClass: 'event-critical' },
}

export function getTierFromScore(score: number): RiskTier {
  if (score < 25) return 'low'
  if (score < 50) return 'moderate'
  if (score < 75) return 'high'
  return 'critical'
}

// ─── Mock data for demo when backend unavailable ───
export function getMockRiskSnapshot(): RiskSnapshot {
  return {
    id: 'demo-1', user_id: 'demo', computed_at: new Date().toISOString(),
    igd_score: 81.2, bdd_score: 67.0, stress_score: 68.0, sleep_score: 72.0,
    composite_score: 73.0, risk_tier: 'high',
    delta_1h: 0.8, delta_24h: 8.2, delta_7d: 15.5,
    trend_direction: 'worsening',
    triggers: [
      { id: 't1', type: 'gaming_session_duration', weight: 0.35, description: 'Gaming session exceeded 9 hours', source: 'gaming', severity: 'critical', detected_at: new Date().toISOString() },
      { id: 't2', type: 'sleep_deficit_critical', weight: 0.20, description: 'Average sleep: 4.8h (deficit: 3.2h)', source: 'wearable', severity: 'alert', detected_at: new Date().toISOString() },
      { id: 't3', type: 'bdd_journal_signal', weight: 0.15, description: 'Body image concerns in 3 journal entries', source: 'journal', severity: 'warning', detected_at: new Date().toISOString() },
    ],
    signal_count: 8, confidence: 0.89,
    ai_explanation: 'Your composite risk is HIGH (73) primarily driven by an escalating gaming pattern over 14 days. Sessions averaging 6.4 hours with 4 instances of sleep sacrifice directly correlate with declining HRV and mood. The sleep deficit is acting as a risk multiplier across all dimensions.',
    top_concern: 'igd', intervention_priority: 'immediate',
  }
}

export function getMockTrendData(): DailyTrendPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const base = [41, 44, 48, 50, 54, 57, 62, 65, 68, 70, 72, 74, 73, 73]
  return days.map((d, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
    day_label: d,
    igd_score: base[i] * 1.1,
    bdd_score: base[i] * 0.9,
    stress_score: base[i] * 0.93,
    sleep_score: base[i] * 0.98,
    composite_score: base[i],
    sleep_hours: Math.max(3.5, 7.5 - i * 0.2),
    gaming_hours: 2.5 + i * 0.45,
    mood_avg: Math.max(1, 7 - i * 0.4),
    hrv_avg: Math.max(27, 44 - i * 1.2),
    event_count: Math.floor(i * 0.8),
  }))
}

export function getMockEvents(): BehavioralEvent[] {
  const now = Date.now()
  return [
    { id: 'e1', user_id: 'demo', created_at: new Date(now - 3 * 60000).toISOString(), event_type: 'HIGH_RISK_GAMING_SESSION', severity: 'critical', source: 'gaming', category: 'GAMING_BEHAVIOR', payload: { duration_mins: 540, game_name: 'League of Legends', risk_contribution: 98 }, acknowledged: false, linked_intervention_id: null },
    { id: 'e2', user_id: 'demo', created_at: new Date(now - 17 * 60000).toISOString(), event_type: 'BDD_JOURNAL_SIGNAL', severity: 'alert', source: 'journal', category: 'BODY_IMAGE', payload: { bdd_signal_count: 3 }, acknowledged: false, linked_intervention_id: null },
    { id: 'e3', user_id: 'demo', created_at: new Date(now - 38 * 60000).toISOString(), event_type: 'HRV_DROP', severity: 'warning', source: 'wearable', category: 'BIOMETRIC_ANOMALY', payload: { hrv_ms: 27.5, baseline_hrv: 44 }, acknowledged: false, linked_intervention_id: null },
    { id: 'e4', user_id: 'demo', created_at: new Date(now - 83 * 60000).toISOString(), event_type: 'CONSECUTIVE_LOW_MOOD', severity: 'warning', source: 'checkin', category: 'MOOD_DECLINE', payload: { consecutive_count: 3, mood_score: 2 }, acknowledged: true, linked_intervention_id: null },
    { id: 'e5', user_id: 'demo', created_at: new Date(now - 140 * 60000).toISOString(), event_type: 'SLEEP_DEFICIT_CRITICAL', severity: 'alert', source: 'wearable', category: 'SLEEP_DISRUPTION', payload: { sleep_hours: 4.1 }, acknowledged: true, linked_intervention_id: null },
    { id: 'e6', user_id: 'demo', created_at: new Date(now - 210 * 60000).toISOString(), event_type: 'GAMING_MEAL_SKIP', severity: 'warning', source: 'gaming', category: 'GAMING_BEHAVIOR', payload: { game_name: 'Valorant' }, acknowledged: true, linked_intervention_id: null },
    { id: 'e7', user_id: 'demo', created_at: new Date(now - 360 * 60000).toISOString(), event_type: 'HR_SPIKE', severity: 'advisory', source: 'wearable', category: 'BIOMETRIC_ANOMALY', payload: { heart_rate_bpm: 92 }, acknowledged: true, linked_intervention_id: null },
  ]
}

export function getMockWearable(): WearableSnapshot {
  return {
    heart_rate_bpm: 89, hrv_ms: 27.5, sleep_hours: 4.8, sleep_quality: 2,
    steps: 3200, stress_index: 67.5, skin_temp_c: 37.2,
    source: 'simulated', recorded_at: new Date().toISOString(),
  }
}

export function getMockInsights(): AIInsightBlock[] {
  return [
    {
      id: 'i1', generated_at: new Date().toISOString(), type: 'pattern_detected', priority: 1,
      title: 'Gaming-Mood Feedback Loop Detected',
      content: 'Your data reveals a consistent pattern: extended gaming sessions (>5h) are followed by significant mood crashes averaging -2.8 points. This occurred in 8 of the last 10 sessions. The correlation suggests gaming is being used as an emotional regulation strategy, which tends to worsen the underlying mood over time.',
      tags: ['gaming', 'mood', 'pattern'], source_dimensions: ['igd', 'bdd'],
      action_hint: 'Consider setting a session break timer at 90 minutes tonight.',
      confidence: 0.91,
    },
    {
      id: 'i2', generated_at: new Date().toISOString(), type: 'correlation_found', priority: 2,
      title: 'Sleep Deficit Amplifying All Risk Scores',
      content: "Your average sleep has dropped to 4.8 hours over the past 14 days. Statistical analysis shows that on days with <5h sleep, your IGD score is 23% higher and your mood check-in anxiety is elevated by 2.1 points. Sleep deficit is acting as a universal risk multiplier in your profile.",
      tags: ['sleep', 'risk-amplifier'], source_dimensions: ['sleep', 'stress'],
      action_hint: 'Addressing sleep is the single highest-leverage change you can make right now.',
      confidence: 0.94,
    },
    {
      id: 'i3', generated_at: new Date().toISOString(), type: 'risk_explanation', priority: 3,
      title: 'Body Image Concerns — Stable But Monitoring',
      content: 'Your BDD indicators have plateaued at 67.0 over the past 4 days, which is a positive sign compared to the upward trend the prior week. Three journal entries this week contained body image language, but the severity and frequency have not escalated. Continued monitoring is advised.',
      tags: ['bdd', 'stable', 'monitoring'], source_dimensions: ['bdd'],
      action_hint: 'Continue journaling — the data is helping us track this accurately.',
      confidence: 0.82,
    },
  ]
}

export function getMockExplainability(): ExplainabilityReport {
  return {
    generated_at: new Date().toISOString(),
    headline: 'Your composite risk of 73 is primarily driven by IGD-related gaming patterns and a severe sleep deficit.',
    paragraphs: [
      'The dominant factor (35%) is your IGD assessment, where 7 of 9 DSM-5 criteria were endorsed with high frequency. This forms the baseline risk foundation.',
      'Gaming behavioral patterns (28%) amplify this further — averaging 6.4 hours per day with 4 instances of sacrificing sleep for gaming sessions.',
      'Your sleep deficit (18%) acts as a universal multiplier, reducing self-regulation capacity and making all other risk behaviors harder to resist.',
    ],
    feature_contributions: [
      { feature_name: 'IGD Assessment', dimension: 'igd', contribution_pct: 35, direction: 'positive', value: '81.2 / HIGH', color: '#7c54ff' },
      { feature_name: 'Gaming Patterns', dimension: 'igd', contribution_pct: 28, direction: 'positive', value: '6.4h avg/day', color: '#9b7dff' },
      { feature_name: 'Sleep Deficit', dimension: 'sleep', contribution_pct: 18, direction: 'positive', value: '4.8h avg (-3.2h)', color: '#22d3a0' },
      { feature_name: 'Journal Signals', dimension: 'bdd', contribution_pct: 11, direction: 'positive', value: '3 entries flagged', color: '#a78bff' },
      { feature_name: 'BDD Assessment', dimension: 'bdd', contribution_pct: 8, direction: 'positive', value: '67.9 / HIGH', color: '#c4b0ff' },
      { feature_name: 'Mood Check-ins', dimension: 'stress', contribution_pct: -5, direction: 'negative', value: 'Avg: 2.8/10', color: '#22d3a0' },
    ],
    overall_confidence: 0.89,
  }
}
