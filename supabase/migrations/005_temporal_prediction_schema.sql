-- Migration 005: Temporal Prediction Engine Schema
-- Stores 14-day forecasted trajectory curves and velocity slopes

CREATE TABLE IF NOT EXISTS temporal_risk_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    current_risk NUMERIC(5,2) NOT NULL,
    predicted_risk_14d NUMERIC(5,2) NOT NULL,
    velocity_slope NUMERIC(5,2) NOT NULL,
    trajectory_series JSONB NOT NULL,
    primary_drivers JSONB NOT NULL
);

ALTER TABLE temporal_risk_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own prediction records" 
    ON temporal_risk_predictions FOR ALL USING (auth.uid() = user_id);
