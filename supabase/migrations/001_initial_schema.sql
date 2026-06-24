-- MindShield AI — Supabase Database Schema
-- Run this in Supabase SQL Editor or as a migration

-- ─────────────────────────────────────────────
-- Enable UUID extension
-- ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT,
  full_name             TEXT,
  age                   INT,
  gender                TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  onboarding_completed  BOOLEAN DEFAULT FALSE,
  risk_tier             TEXT DEFAULT 'unknown'
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access profiles" ON profiles FOR ALL USING (true);

-- ─────────────────────────────────────────────
-- ASSESSMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  version     TEXT DEFAULT 'v1',
  responses   JSONB NOT NULL DEFAULT '{}',
  raw_score   NUMERIC,
  risk_level  TEXT,
  ai_summary  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own assessments" ON assessments FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- RISK SCORES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  computed_at     TIMESTAMPTZ DEFAULT NOW(),
  igd_score       NUMERIC(5,2) DEFAULT 0,
  bdd_score       NUMERIC(5,2) DEFAULT 0,
  sleep_score     NUMERIC(5,2) DEFAULT 0,
  stress_score    NUMERIC(5,2) DEFAULT 0,
  composite_score NUMERIC(5,2) DEFAULT 0,
  risk_tier       TEXT DEFAULT 'unknown',
  delta_24h       NUMERIC(5,2),
  triggers        JSONB DEFAULT '[]',
  ai_explanation  TEXT,
  confidence      NUMERIC(3,2) DEFAULT 0.85
);

ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own risk scores" ON risk_scores FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for live dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE risk_scores;

-- ─────────────────────────────────────────────
-- JOURNAL ENTRIES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS journal_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  mood_tag        TEXT,
  ai_tags         JSONB DEFAULT '[]',
  risk_signals    JSONB DEFAULT '{}',
  ai_analysis     TEXT,
  sentiment_score NUMERIC(4,3)
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own journals" ON journal_entries FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- GAMING SESSIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gaming_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES profiles(id) ON DELETE CASCADE,
  game_name           TEXT,
  started_at          TIMESTAMPTZ,
  ended_at            TIMESTAMPTZ,
  duration_mins       INT,
  mood_before         INT,
  mood_after          INT,
  skipped_meals       BOOLEAN DEFAULT FALSE,
  skipped_sleep       BOOLEAN DEFAULT FALSE,
  notes               TEXT,
  risk_contribution   NUMERIC(4,2) DEFAULT 0
);

ALTER TABLE gaming_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own gaming sessions" ON gaming_sessions FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- WEARABLE DATA
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wearable_data (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recorded_at     TIMESTAMPTZ DEFAULT NOW(),
  source          TEXT DEFAULT 'simulated',
  heart_rate_bpm  INT,
  hrv_ms          NUMERIC(6,2),
  sleep_hours     NUMERIC(4,2),
  sleep_quality   INT,
  steps           INT,
  stress_index    NUMERIC(4,2),
  skin_temp_c     NUMERIC(4,2)
);

ALTER TABLE wearable_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own wearable data" ON wearable_data FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- MOOD CHECK-INS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mood_checkins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mood_score  INT,
  energy      INT,
  anxiety     INT,
  social_urge INT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mood_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own mood checkins" ON mood_checkins FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- INTERVENTIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interventions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  trigger_type    TEXT,
  severity        TEXT DEFAULT 'advisory',
  title           TEXT,
  description     TEXT,
  ai_rationale    TEXT,
  action_steps    JSONB DEFAULT '[]',
  status          TEXT DEFAULT 'active'
);

ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own interventions" ON interventions FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- BEHAVIORAL EVENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS behavioral_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type  TEXT,
  severity    TEXT DEFAULT 'advisory',
  source      TEXT,
  payload     JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE behavioral_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own behavioral events" ON behavioral_events FOR ALL USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE behavioral_events;
