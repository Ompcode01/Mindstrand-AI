-- Migration 003: Dedicated Physiological Risk Engine Schema
-- Creates table for physiological distress, recovery, stress, and sleep index scores

CREATE TABLE IF NOT EXISTS physiological_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    physiological_distress_score NUMERIC(5,2) NOT NULL,
    stress_index NUMERIC(5,2) NOT NULL,
    recovery_index NUMERIC(5,2) NOT NULL,
    sleep_index NUMERIC(5,2) NOT NULL,
    resting_hr_bpm INT NOT NULL,
    activity_load_steps INT NOT NULL,
    explainability_payload JSONB NOT NULL
);

ALTER TABLE physiological_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own physiological scores" 
    ON physiological_scores FOR ALL USING (auth.uid() = user_id);
