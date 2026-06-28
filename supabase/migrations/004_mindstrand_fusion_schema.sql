-- Migration 004: Wellness Fusion Engine Schema
-- Stores the holistic MINDSTRAND SCORE and component vector vitalities

CREATE TABLE IF NOT EXISTS wellness_fusion_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    mindstrand_score NUMERIC(5,2) NOT NULL,
    igd_vitality NUMERIC(5,2) NOT NULL,
    bdd_vitality NUMERIC(5,2) NOT NULL,
    physio_vitality NUMERIC(5,2) NOT NULL,
    mood_vitality NUMERIC(5,2) NOT NULL,
    sleep_vitality NUMERIC(5,2) NOT NULL,
    bottleneck_drag NUMERIC(5,2) NOT NULL,
    tier TEXT NOT NULL,
    explainability_payload JSONB NOT NULL
);

ALTER TABLE wellness_fusion_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own wellness fusion scores" 
    ON wellness_fusion_scores FOR ALL USING (auth.uid() = user_id);
