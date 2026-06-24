-- MindShield AI — Demo Seed Data
-- Run AFTER creating the schema. Creates a demo user dataset for hackathon presentations.
-- NOTE: Replace 'DEMO_USER_ID' with the actual UUID of your demo Supabase user.

-- ─────────────────────────────────────────────
-- Demo user profile (update user_id after creating account)
-- ─────────────────────────────────────────────
-- INSERT INTO profiles (id, email, full_name, age, gender, onboarding_completed, risk_tier)
-- VALUES ('DEMO_USER_ID', 'demo@mindshield.ai', 'Alex Chen', 24, 'male', true, 'high');

-- ─────────────────────────────────────────────
-- Assessments
-- ─────────────────────────────────────────────

-- IGD Assessment — High Risk (7/9 criteria met)
-- INSERT INTO assessments (user_id, type, responses, raw_score, risk_level, ai_summary) VALUES
-- ('DEMO_USER_ID', 'IGD',
-- '{"igd_preoccupation":5,"igd_withdrawal":4,"igd_tolerance":5,"igd_unsuccessful_reduction":4,"igd_loss_of_interest":3,"igd_continued_despite_problems":5,"igd_deception":3,"igd_escape_negative_mood":5,"igd_jeopardized_relationship":3}',
-- 77.8, 'severe',
-- 'The assessment indicates a high level of Internet Gaming Disorder risk. Seven out of nine DSM-5 criteria are significantly endorsed, particularly preoccupation, withdrawal, tolerance, and using gaming to escape negative mood. This pattern warrants structured intervention and behavioral monitoring.');

-- BDD Assessment — Moderate-High Risk
-- INSERT INTO assessments (user_id, type, responses, raw_score, risk_level, ai_summary) VALUES
-- ('DEMO_USER_ID', 'BDD',
-- '{"bdd_preoccupation_hours":3,"bdd_distress_level":4,"bdd_avoidance_behavior":3,"bdd_repetitive_checking":4,"bdd_comparison_behavior":4,"bdd_camouflage_behavior":2,"bdd_daily_impairment":3}',
-- 67.9, 'moderate',
-- 'Moderate BDD risk indicators are present. Significant time spent on appearance concerns, elevated distress levels, and frequent comparison behaviors are noted. Repetitive mirror-checking is particularly elevated. These patterns suggest BDD symptomatology warranting closer monitoring.');

-- ─────────────────────────────────────────────
-- Gaming Sessions (14 days, escalating pattern)
-- ─────────────────────────────────────────────

-- INSERT INTO gaming_sessions (user_id, game_name, started_at, ended_at, duration_mins, mood_before, mood_after, skipped_meals, skipped_sleep, risk_contribution) VALUES
-- ('DEMO_USER_ID', 'League of Legends', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days' + INTERVAL '3 hours', 180, 6, 5, false, false, 30.0),
-- ('DEMO_USER_ID', 'League of Legends', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days' + INTERVAL '4 hours', 240, 5, 4, false, false, 35.0),
-- ('DEMO_USER_ID', 'Valorant', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '5 hours', 300, 5, 3, true, false, 52.0),
-- ('DEMO_USER_ID', 'League of Legends', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days' + INTERVAL '4 hours 30 mins', 270, 6, 4, false, false, 40.0),
-- ('DEMO_USER_ID', 'Valorant', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '6 hours', 360, 5, 3, true, false, 65.0),
-- ('DEMO_USER_ID', 'League of Legends', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days' + INTERVAL '5 hours', 300, 4, 3, true, false, 55.0),
-- ('DEMO_USER_ID', 'League of Legends', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days' + INTERVAL '7 hours', 420, 4, 2, true, true, 82.0),
-- ('DEMO_USER_ID', 'Valorant', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days' + INTERVAL '6 hours 30 mins', 390, 5, 2, false, true, 78.0),
-- ('DEMO_USER_ID', 'League of Legends', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days' + INTERVAL '5 hours', 300, 4, 3, true, false, 60.0),
-- ('DEMO_USER_ID', 'League of Legends', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '8 hours', 480, 5, 2, true, true, 92.0),
-- ('DEMO_USER_ID', 'Valorant', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '6 hours', 360, 4, 2, true, false, 70.0),
-- ('DEMO_USER_ID', 'League of Legends', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '7 hours 30 mins', 450, 4, 1, true, true, 88.0),
-- ('DEMO_USER_ID', 'Valorant', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '5 hours', 300, 3, 2, false, false, 55.0),
-- ('DEMO_USER_ID', 'League of Legends', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '9 hours', 540, 3, 1, true, true, 98.0);

-- ─────────────────────────────────────────────
-- Risk Scores (14-day escalating trajectory)
-- ─────────────────────────────────────────────

-- INSERT INTO risk_scores (user_id, computed_at, igd_score, bdd_score, sleep_score, stress_score, composite_score, risk_tier, delta_24h, confidence) VALUES
-- ('DEMO_USER_ID', NOW() - INTERVAL '14 days', 48.0, 42.0, 35.0, 38.0, 41.6, 'moderate', 0.0, 0.78),
-- ('DEMO_USER_ID', NOW() - INTERVAL '13 days', 51.0, 43.5, 38.0, 40.0, 43.75, 'moderate', 2.15, 0.80),
-- ('DEMO_USER_ID', NOW() - INTERVAL '12 days', 56.0, 46.0, 44.0, 45.0, 48.5, 'moderate', 4.75, 0.82),
-- ('DEMO_USER_ID', NOW() - INTERVAL '11 days', 58.5, 48.0, 46.0, 47.0, 50.5, 'high', 2.0, 0.83),
-- ('DEMO_USER_ID', NOW() - INTERVAL '10 days', 62.0, 50.5, 50.0, 51.0, 53.75, 'high', 3.25, 0.84),
-- ('DEMO_USER_ID', NOW() - INTERVAL '9 days', 65.0, 53.0, 54.0, 54.0, 56.75, 'high', 3.0, 0.85),
-- ('DEMO_USER_ID', NOW() - INTERVAL '8 days', 69.0, 57.0, 62.0, 58.0, 62.0, 'high', 5.25, 0.86),
-- ('DEMO_USER_ID', NOW() - INTERVAL '7 days', 72.5, 60.0, 65.0, 62.0, 65.5, 'high', 3.5, 0.87),
-- ('DEMO_USER_ID', NOW() - INTERVAL '6 days', 74.0, 62.5, 67.0, 65.0, 67.75, 'high', 2.25, 0.87),
-- ('DEMO_USER_ID', NOW() - INTERVAL '5 days', 78.0, 64.0, 71.0, 66.5, 70.6, 'high', 2.85, 0.88),
-- ('DEMO_USER_ID', NOW() - INTERVAL '4 days', 80.5, 65.5, 73.0, 67.5, 72.5, 'high', 1.9, 0.89),
-- ('DEMO_USER_ID', NOW() - INTERVAL '3 days', 81.0, 67.0, 75.0, 68.0, 73.8, 'high', 1.3, 0.89),
-- ('DEMO_USER_ID', NOW() - INTERVAL '2 days', 82.5, 67.5, 76.0, 68.5, 74.8, 'high', 1.0, 0.90),
-- ('DEMO_USER_ID', NOW() - INTERVAL '1 day', 81.2, 67.0, 72.0, 68.0, 73.0, 'high', -1.8, 0.90);

-- ─────────────────────────────────────────────
-- Journal Entries (showing escalating distress)
-- ─────────────────────────────────────────────

-- INSERT INTO journal_entries (user_id, content, mood_tag, ai_tags, ai_analysis, sentiment_score, created_at) VALUES
-- ('DEMO_USER_ID', 
--  'Been gaming a lot this week. Just feels easier than dealing with stuff. Mom called and I told her I was busy studying. I feel a bit guilty about that.',
--  'negative', '["gaming_craving","social_withdrawal","deception"]',
--  'The entry reveals social withdrawal patterns and deception around gaming habits, which are consistent with IGD behavioral markers. The guilt response suggests awareness of problematic patterns.',
--  -0.320, NOW() - INTERVAL '12 days'),

-- ('DEMO_USER_ID',
--  'Stayed up until 4am playing. Worth it for the rank push. My skin looks so bad lately, probably from the screen exposure and not sleeping. I hate how I look on camera.',
--  'negative', '["body_dissatisfaction","loss_of_sleep","gaming_preoccupation"]',
--  'This entry combines IGD signals (extended late-night gaming, rank obsession) with body image concerns (appearance dissatisfaction). The combination suggests dual-disorder risk elevation.',
--  -0.520, NOW() - INTERVAL '9 days'),

-- ('DEMO_USER_ID',
--  'Skipped the gym again. What''s the point? I''m not going to look good no matter what I do. At least in League I can actually get better at something. Spent 9 hours playing today.',
--  'distressed', '["body_dissatisfaction","appearance_avoidance","gaming_escape","mood_dependent_gaming"]',
--  'Significant distress signals detected. The entry shows appearance-based hopelessness combined with gaming as an avoidance mechanism — a high-risk behavioral pattern for both BDD and IGD.',
--  -0.710, NOW() - INTERVAL '6 days'),

-- ('DEMO_USER_ID',
--  'My friends want to hang out this weekend but I already know I''ll cancel. I told myself just one more game but it''s been 6 hours. I keep checking my face in the camera when I''m in-game.',
--  'distressed', '["social_withdrawal","loss_of_control","mirror_checking","gaming_craving"]',
--  'Multiple high-severity behavioral signals detected: social avoidance, loss of gaming control, and repetitive mirror-checking behavior during gaming sessions. Risk recalculation is advised.',
--  -0.680, NOW() - INTERVAL '3 days'),

-- ('DEMO_USER_ID',
--  'Rough day. Didn''t eat until 8pm because I was in a ranked game. I keep telling myself tomorrow will be different but it''s been two weeks of this. My face looks different, more puffy. I hate it.',
--  'distressed', '["skipped_meals","loss_of_control","body_dissatisfaction","distorted_perception"]',
--  'Critical entry: food restriction due to gaming combined with body image distortion signals. This combination is clinically significant and warrants immediate intervention generation.',
--  -0.820, NOW() - INTERVAL '1 day');

-- ─────────────────────────────────────────────
-- Active Interventions (for demo)
-- ─────────────────────────────────────────────

-- INSERT INTO interventions (user_id, trigger_type, severity, title, description, ai_rationale, action_steps, status) VALUES
-- ('DEMO_USER_ID', 'high_igd', 'critical',
--  'Gaming Pattern Interruption Protocol',
--  'Your gaming sessions have consistently exceeded 6 hours with meal-skipping behavior. This pattern meets DSM-5 criteria for Internet Gaming Disorder.',
--  'The 14-day gaming data shows a clear escalation pattern with 4 instances of sleep sacrifice and 8 instances of meal-skipping. This is a high-priority behavioral health concern.',
--  '[{"step":"Set a hard session limit of 90 minutes using a visible timer before starting any gaming session.","resource_url":null},{"step":"Eat a full meal before starting any gaming session. Keep a protein bar next to your setup as a backup.","resource_url":null},{"step":"Schedule 3 non-gaming activities this week (gym, walk, social event) and put them in your calendar.","resource_url":null},{"step":"Tell one trusted person about your gaming hour goals for accountability.","resource_url":null},{"step":"Use the mood check-in feature before and after each session to track the emotional impact.","resource_url":null}]',
--  'active'),

-- ('DEMO_USER_ID', 'high_bdd', 'warning',
--  'Body Image Cognitive Reframing',
--  'Repeated journal entries show body dissatisfaction and mirror-checking behavior that is interfering with your daily activities and social life.',
--  'BDD-related signals have appeared in 3 of your last 5 journal entries, combined with social avoidance and appearance-related hopelessness statements.',
--  '[{"step":"Practice the 5-4-3-2-1 grounding technique when you notice appearance preoccupation starting.","resource_url":null},{"step":"Limit mirror-checking to 2 designated times per day (morning routine only).","resource_url":null},{"step":"Write one thing you appreciate about your body''s function (not appearance) each morning.","resource_url":null}]',
--  'active'),

-- ('DEMO_USER_ID', 'sleep_deficit', 'alert',
--  'Sleep Recovery Plan',
--  'Your average sleep duration has dropped to 4.8 hours, significantly below healthy thresholds. This is amplifying all other risk scores.',
--  'Sleep deficit is a risk multiplier: it reduces self-control, increases emotional reactivity, and makes gaming urges harder to resist. Addressing sleep is the highest-leverage intervention.',
--  '[{"step":"Set a non-negotiable device-off time of 11:30pm for the next 7 days.","resource_url":null},{"step":"Keep your phone charger outside the bedroom to reduce late-night gaming temptation.","resource_url":null},{"step":"Use a sleep tracking app to visualize your recovery progress.","resource_url":null}]',
--  'active');

-- ─────────────────────────────────────────────
-- Wearable Data (14 days, worsening trend)
-- ─────────────────────────────────────────────

-- INSERT INTO wearable_data (user_id, recorded_at, source, heart_rate_bpm, hrv_ms, sleep_hours, sleep_quality, steps, stress_index, skin_temp_c) VALUES
-- ('DEMO_USER_ID', NOW() - INTERVAL '14 days', 'simulated', 68, 44.2, 7.1, 7, 8200, 28.5, 36.6),
-- ('DEMO_USER_ID', NOW() - INTERVAL '13 days', 'simulated', 70, 42.8, 6.8, 6, 7500, 31.0, 36.7),
-- ('DEMO_USER_ID', NOW() - INTERVAL '12 days', 'simulated', 72, 40.5, 6.2, 5, 6800, 34.5, 36.7),
-- ('DEMO_USER_ID', NOW() - INTERVAL '11 days', 'simulated', 74, 38.2, 6.0, 5, 6200, 38.0, 36.8),
-- ('DEMO_USER_ID', NOW() - INTERVAL '10 days', 'simulated', 76, 36.5, 5.5, 4, 5500, 42.0, 36.8),
-- ('DEMO_USER_ID', NOW() - INTERVAL '9 days', 'simulated', 78, 34.8, 5.2, 4, 5000, 46.5, 36.9),
-- ('DEMO_USER_ID', NOW() - INTERVAL '8 days', 'simulated', 80, 32.4, 4.8, 3, 4200, 51.0, 36.9),
-- ('DEMO_USER_ID', NOW() - INTERVAL '7 days', 'simulated', 82, 31.2, 4.6, 3, 3800, 55.0, 37.0),
-- ('DEMO_USER_ID', NOW() - INTERVAL '6 days', 'simulated', 83, 30.8, 5.0, 3, 4000, 57.5, 37.0),
-- ('DEMO_USER_ID', NOW() - INTERVAL '5 days', 'simulated', 85, 29.5, 4.2, 2, 3200, 62.0, 37.1),
-- ('DEMO_USER_ID', NOW() - INTERVAL '4 days', 'simulated', 87, 28.8, 4.5, 2, 3500, 64.5, 37.1),
-- ('DEMO_USER_ID', NOW() - INTERVAL '3 days', 'simulated', 88, 28.2, 4.1, 2, 3000, 67.0, 37.2),
-- ('DEMO_USER_ID', NOW() - INTERVAL '2 days', 'simulated', 89, 27.8, 4.8, 3, 3800, 65.0, 37.1),
-- ('DEMO_USER_ID', NOW() - INTERVAL '1 day', 'simulated', 89, 27.5, 4.8, 2, 3200, 67.5, 37.2);

-- ─────────────────────────────────────────────
-- Behavioral Events
-- ─────────────────────────────────────────────

-- INSERT INTO behavioral_events (user_id, event_type, severity, source, payload, created_at) VALUES
-- ('DEMO_USER_ID', 'high_risk_gaming_session', 'critical', 'gaming', '{"duration_mins":540,"game":"League of Legends","risk_contribution":98}', NOW() - INTERVAL '1 day'),
-- ('DEMO_USER_ID', 'journal_risk_signal_detected', 'alert', 'journal', '{"igd_signals":3,"bdd_signals":2,"mood_tag":"distressed"}', NOW() - INTERVAL '1 day' + INTERVAL '2 hours'),
-- ('DEMO_USER_ID', 'high_risk_gaming_session', 'alert', 'gaming', '{"duration_mins":450,"game":"League of Legends","risk_contribution":88}', NOW() - INTERVAL '3 days'),
-- ('DEMO_USER_ID', 'consecutive_low_mood', 'warning', 'checkin', '{"consecutive_count":3,"latest_mood":2}', NOW() - INTERVAL '4 days'),
-- ('DEMO_USER_ID', 'journal_risk_signal_detected', 'warning', 'journal', '{"igd_signals":2,"bdd_signals":2}', NOW() - INTERVAL '6 days'),
-- ('DEMO_USER_ID', 'severe_sleep_deficit', 'alert', 'wearable', '{"avg_sleep":4.2}', NOW() - INTERVAL '5 days'),
-- ('DEMO_USER_ID', 'elevated_resting_hr', 'advisory', 'wearable', '{"bpm":89}', NOW() - INTERVAL '2 days'),
-- ('DEMO_USER_ID', 'igd_dsm5_threshold', 'critical', 'assessment', '{"criteria_met":7}', NOW() - INTERVAL '14 days');

-- ─────────────────────────────────────────────
-- Mood Check-ins (14 days, declining)
-- ─────────────────────────────────────────────

-- INSERT INTO mood_checkins (user_id, mood_score, energy, anxiety, social_urge, created_at) VALUES
-- ('DEMO_USER_ID', 7, 7, 3, 7, NOW() - INTERVAL '14 days'),
-- ('DEMO_USER_ID', 6, 6, 4, 6, NOW() - INTERVAL '13 days'),
-- ('DEMO_USER_ID', 6, 5, 4, 5, NOW() - INTERVAL '12 days'),
-- ('DEMO_USER_ID', 5, 5, 5, 4, NOW() - INTERVAL '11 days'),
-- ('DEMO_USER_ID', 5, 4, 5, 4, NOW() - INTERVAL '10 days'),
-- ('DEMO_USER_ID', 4, 4, 6, 3, NOW() - INTERVAL '9 days'),
-- ('DEMO_USER_ID', 4, 3, 7, 3, NOW() - INTERVAL '8 days'),
-- ('DEMO_USER_ID', 3, 3, 7, 2, NOW() - INTERVAL '7 days'),
-- ('DEMO_USER_ID', 4, 4, 6, 3, NOW() - INTERVAL '6 days'),
-- ('DEMO_USER_ID', 3, 3, 8, 2, NOW() - INTERVAL '5 days'),
-- ('DEMO_USER_ID', 3, 2, 8, 2, NOW() - INTERVAL '4 days'),
-- ('DEMO_USER_ID', 2, 2, 9, 1, NOW() - INTERVAL '3 days'),
-- ('DEMO_USER_ID', 3, 3, 7, 2, NOW() - INTERVAL '2 days'),
-- ('DEMO_USER_ID', 2, 2, 8, 1, NOW() - INTERVAL '1 day');
