import { create } from "zustand";

export type RiskTier = "low" | "moderate" | "high" | "critical" | "unknown";

export interface RiskScore {
  id: string;
  computed_at: string;
  igd_score: number;
  bdd_score: number;
  sleep_score: number;
  stress_score: number;
  composite_score: number;
  risk_tier: RiskTier;
  delta_24h?: number;
  triggers: Array<{ type: string; weight: number; description: string }>;
  ai_explanation?: string;
  confidence: number;
}

export interface BehavioralEvent {
  id: string;
  event_type: string;
  severity: "advisory" | "warning" | "alert" | "critical";
  source: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface WearableSnapshot {
  heart_rate_bpm: number;
  hrv_ms: number;
  sleep_hours: number;
  sleep_quality: number;
  steps: number;
  stress_index: number;
  skin_temp_c: number;
  source: string;
  recorded_at?: string;
  is_spike?: boolean;
}

interface RiskStore {
  current: RiskScore | null;
  history: RiskScore[];
  liveAlerts: BehavioralEvent[];
  wearable: WearableSnapshot | null;
  loading: boolean;
  lastUpdated: Date | null;

  setCurrent: (score: RiskScore) => void;
  setHistory: (history: RiskScore[]) => void;
  pushAlert: (event: BehavioralEvent) => void;
  setWearable: (data: WearableSnapshot) => void;
  setLoading: (v: boolean) => void;
  nudgeComposite: (delta: number) => void;
  reset: () => void;
}

export const useRiskStore = create<RiskStore>((set) => ({
  current: null,
  history: [],
  liveAlerts: [],
  wearable: null,
  loading: false,
  lastUpdated: null,

  setCurrent: (score) =>
    set({ current: score, lastUpdated: new Date() }),

  setHistory: (history) =>
    set({ history }),

  pushAlert: (event) =>
    set((state) => ({
      liveAlerts: [event, ...state.liveAlerts].slice(0, 50),
    })),

  setWearable: (data) =>
    set({ wearable: data }),

  setLoading: (v) =>
    set({ loading: v }),

  nudgeComposite: (delta) =>
    set((state) => {
      if (!state.current) return {};
      const newComposite = Math.min(100, Math.max(0, state.current.composite_score + delta));
      return {
        current: {
          ...state.current,
          composite_score: Math.round(newComposite * 10) / 10,
        },
      };
    }),

  reset: () =>
    set({ current: null, history: [], liveAlerts: [], wearable: null }),
}));
