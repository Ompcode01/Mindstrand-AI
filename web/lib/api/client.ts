/**
 * API client for MindShield FastAPI backend.
 * All functions use Bearer token from Supabase session.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Auth ───
export const syncProfile = (token: string, data: { full_name: string; age: number; gender: string }) =>
  request("/api/v1/auth/sync-profile", { method: "POST", body: JSON.stringify(data), token });

export const getMe = (token: string) =>
  request("/api/v1/users/me", { token });

// ─── Assessments ───
export const submitAssessment = (token: string, data: { type: string; responses: Record<string, number> }) =>
  request("/api/v1/assessments/submit", { method: "POST", body: JSON.stringify(data), token });

export const getAssessment = (token: string, type: string) =>
  request(`/api/v1/assessments/${type}`, { token });

// ─── Risk ───
export const getCurrentRisk = (token: string) =>
  request("/api/v1/risk/current", { token });

export const getRiskHistory = (token: string, days = 14) =>
  request(`/api/v1/risk/history?days=${days}`, { token });

export const recalculateRisk = (token: string) =>
  request("/api/v1/risk/recalculate", { method: "POST", token });

// ─── Journal ───
export const createJournalEntry = (token: string, content: string) =>
  request("/api/v1/journal/create", { method: "POST", body: JSON.stringify({ content }), token });

export const getJournalEntries = (token: string, page = 1, limit = 10) =>
  request(`/api/v1/journal/entries?page=${page}&limit=${limit}`, { token });

// ─── Gaming ───
export const logGamingSession = (token: string, data: object) =>
  request("/api/v1/gaming/session", { method: "POST", body: JSON.stringify(data), token });

export const getGamingSessions = (token: string) =>
  request("/api/v1/gaming/sessions", { token });

export const getGamingStats = (token: string) =>
  request("/api/v1/gaming/stats", { token });

// ─── Wearable ───
export const getLatestWearable = (token: string) =>
  request("/api/v1/wearable/latest", { token });

export const getWearableTrends = (token: string) =>
  request("/api/v1/wearable/trends", { token });

// ─── Mood ───
export const submitMoodCheckin = (token: string, data: object) =>
  request("/api/v1/mood/checkin", { method: "POST", body: JSON.stringify(data), token });

export const getMoodHistory = (token: string, days = 14) =>
  request(`/api/v1/mood/history?days=${days}`, { token });

// ─── Interventions ───
export const getInterventions = (token: string, status = "active") =>
  request(`/api/v1/interventions?status=${status}`, { token });

export const updateIntervention = (token: string, id: string, status: string) =>
  request(`/api/v1/interventions/${id}`, { method: "PUT", body: JSON.stringify({ status }), token });

export const generateIntervention = (token: string) =>
  request("/api/v1/interventions/generate", { method: "POST", token });

// ─── Insights ───
export const getInsightsTrends = (token: string) =>
  request("/api/v1/insights/trends", { token });

export const getBehavioralEvents = (token: string, limit = 20) =>
  request(`/api/v1/insights/events?limit=${limit}`, { token });

// ─── Streaming Insights ───
export async function streamInsights(token: string, onChunk: (text: string) => void): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/insights/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.body) return;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}
