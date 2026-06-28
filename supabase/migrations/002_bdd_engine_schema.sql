-- Migration 002: Dedicated BDD Detection Engine Schema
-- Creates behavioral logs and granular sub-score tracking tables

CREATE TABLE IF NOT EXISTS bdd_behavioral_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    mirror_check_count INT DEFAULT 0,
    social_comparison_mins INT DEFAULT 0,
    selfie_editing_mins INT DEFAULT 0,
    avoidance_triggered BOOLEAN DEFAULT FALSE,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bdd_subscores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bdd_risk_score FLOAT NOT NULL,
    appearance_anxiety FLOAT NOT NULL,
    self_esteem FLOAT NOT NULL,
    social_comparison FLOAT NOT NULL,
    obsession_score FLOAT NOT NULL,
    explainability_payload JSONB NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE bdd_behavioral_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bdd_subscores ENABLE ROW LEVEL SECURITY;

-- Policies for bdd_behavioral_logs
CREATE POLICY "Users can view own bdd logs"
    ON bdd_behavioral_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bdd logs"
    ON bdd_behavioral_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for bdd_subscores
CREATE POLICY "Users can view own bdd subscores"
    ON bdd_subscores FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bdd subscores"
    ON bdd_subscores FOR INSERT
    WITH CHECK (auth.uid() = user_id);
