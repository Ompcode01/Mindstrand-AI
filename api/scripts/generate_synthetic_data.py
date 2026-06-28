"""
MindShield AI — Scalable Synthetic Database Generator

Synthesizes thousands to lakhs (10,000 to 1,00,000+) of realistic user profiles,
multimodal behavioral time series (gaming sessions, wearables, journal signals,
DSM-5 IGD and BDDQ assessments), and ground-truth composite risk scores.

Usage:
    python generate_synthetic_data.py --users 10000 --days 14 --output-dir dataset
"""

import os
import sys
import uuid
import random
import math
import argparse
import sqlite3
import json
from datetime import datetime, timedelta, timezone
import pandas as pd
from tqdm import tqdm

# Ensure backend modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.services.risk_engine import (
    RiskScoringEngine, AssessmentInput, GamingInput, WearableInput, JournalInput, MoodInput
)

# Names for synthetic generation
FIRST_NAMES = [
    "Alex", "Sam", "Jordan", "Taylor", "Morgan", "Chris", "Pat", "Riley", "Casey", "Quinn",
    "Jamie", "Avery", "Logan", "Devon", "Dakota", "Reese", "Skyler", "Jesse", "Cameron", "Finley",
    "Noah", "Liam", "Oliver", "Emma", "Sophia", "Ava", "Mia", "Lucas", "Ethan", "Harper",
    "Aiden", "Jackson", "Evelyn", "Abigail", "Emily", "Ella", "Daniel", "Michael", "Alexander", "Henry"
]
LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"
]

SAMPLE_JOURNALS = {
    "healthy": [
        "Had a productive day at work/school. Played 45 minutes of games to unwind.",
        "Went for a run this morning and felt great. Met up with friends for dinner.",
        "Slightly tired today but managed to get 8 hours of sleep. Looking forward to the weekend.",
        "Balanced day overall. Kept my gaming to under an hour."
    ],
    "igd_dominant": [
        "Lost track of time again... played ranked matches until 4 AM. Skipped breakfast.",
        "Told my family I was studying but spent 8 hours grinding levels. Feeling exhausted.",
        "Got irritated when the internet dropped. Gaming is the only way I can escape my stress.",
        "Skipped dinner to finish the tournament raid. My head aches and eyes are burning."
    ],
    "bdd_dominant": [
        "Spent an hour in front of the mirror checking my skin. Couldn't bring myself to leave the house.",
        "Compared my selfies to people online for hours. Feeling extremely distressed about how I look.",
        "Wore baggy clothes today to hide my body. Canceled plans because my anxiety was at a 9.",
        "Keep touching and checking my jawline. I hate how warped my reflection feels."
    ],
    "comorbid_critical": [
        "Played games for 10 hours straight so I didn't have to look in the mirror or think about tomorrow.",
        "Haven't slept more than 3 hours. My body dysmorphia is suffocating and gaming numbs the panic.",
        "Complete isolation today. Checked mirror 20 times, felt sick, then gamed until sunrise.",
        "Skipped all meals and classes. Feeling completely disconnected from reality."
    ]
}


def generate_cohort():
    """Select user cohort based on clinical distribution."""
    r = random.random()
    if r < 0.40:
        return "healthy"
    elif r < 0.65:
        return "igd_dominant"
    elif r < 0.85:
        return "bdd_dominant"
    else:
        return "comorbid_critical"


def synthesize_user(start_date: datetime, days: int, cohort: str):
    """Generate a full N-day trajectory for a single synthetic user."""
    user_id = str(uuid.uuid4())
    first_name = random.choice(FIRST_NAMES)
    last_name = random.choice(LAST_NAMES)
    full_name = f"{first_name} {last_name}"
    email = f"{first_name.lower()}.{last_name.lower()}.{random.randint(10,999)}@example.com"
    age = random.randint(15, 36)
    gender = random.choice(["Male", "Female", "Non-binary"])
    
    profile = {
        "id": user_id,
        "email": email,
        "full_name": full_name,
        "age": age,
        "gender": gender,
        "cohort": cohort,
        "onboarding_completed": True,
        "created_at": start_date.isoformat()
    }

    # Generate Baseline Assessments
    igd_assessment = None
    bdd_assessment = None
    assessment_records = []

    # IGD Assessment
    if cohort in ["igd_dominant", "comorbid_critical"] or (cohort == "healthy" and random.random() < 0.2):
        responses = {}
        for idx in range(1, 10):
            if cohort in ["igd_dominant", "comorbid_critical"]:
                responses[f"q{idx}"] = random.choice([3, 4, 5, 5])
            else:
                responses[f"q{idx}"] = random.choice([1, 1, 2, 3])
        
        raw_score = sum(responses.values())
        criteria_met = sum(1 for v in responses.values() if v >= 3)
        risk_lvl = "high" if criteria_met >= 5 else "low"
        
        igd_assessment = AssessmentInput(type="IGD", responses=responses, raw_score=raw_score)
        assessment_records.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": "IGD",
            "raw_score": raw_score,
            "risk_level": risk_lvl,
            "created_at": start_date.isoformat()
        })

    # BDD Assessment
    if cohort in ["bdd_dominant", "comorbid_critical"] or (cohort == "healthy" and random.random() < 0.2):
        responses = {}
        for idx in range(1, 8):
            if cohort in ["bdd_dominant", "comorbid_critical"]:
                responses[f"q{idx}"] = random.choice([2, 3, 4, 4])
            else:
                responses[f"q{idx}"] = random.choice([0, 0, 1, 2])
        
        raw_score = sum(responses.values())
        risk_lvl = "high" if raw_score >= 14 else "low"
        
        bdd_assessment = AssessmentInput(type="BDD", responses=responses, raw_score=raw_score)
        assessment_records.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": "BDD",
            "raw_score": raw_score,
            "risk_level": risk_lvl,
            "created_at": start_date.isoformat()
        })

    engine = RiskScoringEngine()
    daily_records = []
    gaming_records = []
    journal_records = []

    # Simulate Day-by-Day Progression
    for day_idx in range(days):
        current_date = start_date + timedelta(days=day_idx)
        
        # Worsening factor over time for high-risk cohorts
        trend = day_idx / max(1, days - 1)
        
        # 1. Gaming
        if cohort == "healthy":
            dur_mins = random.randint(20, 90)
            skip_meals = False
            skip_sleep = False
            mood_delta = random.uniform(-0.5, 0.5)
        elif cohort == "igd_dominant":
            dur_mins = int(random.randint(240, 500) + trend * 150)
            skip_meals = random.random() < (0.4 + trend * 0.3)
            skip_sleep = random.random() < (0.5 + trend * 0.3)
            mood_delta = random.uniform(-2.5, -1.0)
        elif cohort == "bdd_dominant":
            dur_mins = random.randint(45, 180)
            skip_meals = random.random() < 0.2
            skip_sleep = random.random() < 0.2
            mood_delta = random.uniform(-1.0, 0.0)
        else: # comorbid_critical
            dur_mins = int(random.randint(360, 600) + trend * 180)
            skip_meals = random.random() < 0.7
            skip_sleep = random.random() < 0.8
            mood_delta = random.uniform(-3.5, -1.5)

        gaming_input = GamingInput(
            avg_daily_hours=dur_mins / 60.0,
            skipped_meals_count=1 if skip_meals else 0,
            skipped_sleep_count=1 if skip_sleep else 0,
            avg_mood_delta=mood_delta
        )
        
        gaming_records.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "game_name": random.choice(["League of Legends", "Valorant", "Genshin Impact", "Apex Legends", "WoW"]),
            "duration_mins": dur_mins,
            "skipped_meals": skip_meals,
            "skipped_sleep": skip_sleep,
            "started_at": current_date.isoformat()
        })

        # 2. Wearables
        if cohort == "healthy":
            sleep_h = random.uniform(7.2, 8.8)
            bpm = random.uniform(58, 70)
            hrv = random.uniform(48, 68)
            stress_idx = random.uniform(15, 30)
        elif cohort == "igd_dominant":
            sleep_h = max(3.0, random.uniform(5.5, 6.8) - trend * 1.5)
            bpm = random.uniform(70, 82)
            hrv = random.uniform(32, 45)
            stress_idx = random.uniform(45, 68)
        elif cohort == "bdd_dominant":
            sleep_h = random.uniform(5.8, 7.2)
            bpm = random.uniform(76, 90)
            hrv = random.uniform(28, 42)
            stress_idx = random.uniform(60, 85)
        else: # comorbid
            sleep_h = max(2.5, random.uniform(4.0, 5.5) - trend * 1.8)
            bpm = random.uniform(82, 98)
            hrv = max(12.0, random.uniform(18, 30) - trend * 5)
            stress_idx = min(100.0, random.uniform(75, 92) + trend * 8)

        wearable_input = WearableInput(
            avg_sleep_hours=sleep_h,
            avg_hrv=hrv,
            avg_stress_index=stress_idx,
            avg_bpm=bpm
        )

        # 3. Journal & Mood Signals
        content = random.choice(SAMPLE_JOURNALS[cohort])
        igd_sig = 2 if cohort in ["igd_dominant", "comorbid_critical"] else 0
        bdd_sig = 3 if cohort in ["bdd_dominant", "comorbid_critical"] else 0
        sentiment = random.uniform(0.3, 0.8) if cohort == "healthy" else random.uniform(-0.7, -0.1)
        
        journal_input = JournalInput(
            igd_signal_count=igd_sig,
            bdd_signal_count=bdd_sig,
            negative_entries=1 if sentiment < 0 else 0,
            total_entries=1
        )
        
        journal_records.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "content": content,
            "sentiment_score": round(sentiment, 3),
            "created_at": current_date.isoformat()
        })

        anx = random.randint(1, 3) if cohort == "healthy" else random.randint(6, 10)
        soc = random.randint(7, 10) if cohort == "healthy" else random.randint(1, 4)
        mood_input = MoodInput(avg_anxiety=anx, avg_social_urge=soc, consecutive_negative=day_idx if cohort != "healthy" else 0)

        # 4. Compute Ground Truth Risk Scores
        risk_res = engine.compute(
            igd_assessment=igd_assessment,
            bdd_assessment=bdd_assessment,
            gaming=gaming_input,
            wearable=wearable_input,
            journal=journal_input,
            mood=mood_input
        )

        daily_records.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "date": current_date.strftime("%Y-%m-%d"),
            "day_index": day_idx,
            "gaming_hours": round(dur_mins / 60.0, 2),
            "skipped_meals": int(skip_meals),
            "skipped_sleep": int(skip_sleep),
            "mood_delta": round(mood_delta, 2),
            "sleep_hours": round(sleep_h, 2),
            "resting_bpm": round(bpm, 1),
            "hrv_ms": round(hrv, 1),
            "stress_index": round(stress_idx, 1),
            "sentiment_score": round(sentiment, 3),
            "anxiety_score": anx,
            "social_urge": soc,
            "igd_score": risk_res.igd_score,
            "bdd_score": risk_res.bdd_score,
            "sleep_score": risk_res.sleep_score,
            "stress_score": risk_res.stress_score,
            "composite_score": risk_res.composite_score,
            "risk_tier": risk_res.risk_tier
        })

    # Assign final profile risk tier
    profile["risk_tier"] = daily_records[-1]["risk_tier"]

    return profile, assessment_records, gaming_records, journal_records, daily_records


def main():
    parser = argparse.ArgumentParser(description="Scalable Synthetic Database Generator")
    parser.add_argument("--users", type=int, default=10000, help="Number of user profiles to generate")
    parser.add_argument("--days", type=int, default=14, help="Days of behavioral history per user")
    parser.add_argument("--output-dir", type=str, default="dataset", help="Directory to save datasets")
    parser.add_argument("--batch-size", type=int, default=1000, help="Batch size for writing records")
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)
    db_path = os.path.join(args.output_dir, "synthetic_mindshield.db")
    
    print(f"================================================================================")
    print(f"MindShield AI — Synthesizing {args.users:,} Profiles × {args.days} Days ({args.users * args.days:,} Total Days)")
    print(f"================================================================================")

    # Remove existing db if present to ensure clean build
    if os.path.exists(db_path):
        os.remove(db_path)
    
    conn = sqlite3.connect(db_path)

    start_date = datetime.now(timezone.utc) - timedelta(days=args.days)

    all_profiles = []
    all_assessments = []
    all_gaming = []
    all_journals = []
    all_daily = []

    for idx in tqdm(range(args.users), desc="Generating Patients"):
        cohort = generate_cohort()
        prof, assess, game, journ, daily = synthesize_user(start_date, args.days, cohort)
        
        all_profiles.append(prof)
        all_assessments.extend(assess)
        all_gaming.extend(game)
        all_journals.extend(journ)
        all_daily.extend(daily)

        # Flush in batches to keep RAM usage low
        if len(all_profiles) >= args.batch_size or idx == args.users - 1:
            df_prof = pd.DataFrame(all_profiles)
            df_assess = pd.DataFrame(all_assessments)
            df_game = pd.DataFrame(all_gaming)
            df_journ = pd.DataFrame(all_journals)
            df_daily = pd.DataFrame(all_daily)

            # Write to SQLite
            df_prof.to_sql("profiles", conn, if_exists="append", index=False)
            if not df_assess.empty:
                df_assess.to_sql("assessments", conn, if_exists="append", index=False)
            df_game.to_sql("gaming_sessions", conn, if_exists="append", index=False)
            df_journ.to_sql("journal_entries", conn, if_exists="append", index=False)
            df_daily.to_sql("daily_metrics", conn, if_exists="append", index=False)

            # Clear memory
            all_profiles.clear()
            all_assessments.clear()
            all_gaming.clear()
            all_journals.clear()
            all_daily.clear()

    print("\nExtracting CSV datasets from SQLite DB...")
    
    for table_name in ["profiles", "assessments", "gaming_sessions", "journal_entries", "daily_metrics"]:
        df = pd.read_sql_query(f"SELECT * FROM {table_name}", conn)
        csv_file = os.path.join(args.output_dir, f"{table_name}.csv")
        df.to_csv(csv_file, index=False)
        print(f" -> Exported {len(df):,} rows to {csv_file}")

    conn.close()
    print(f"\n[SUCCESS] Synthetic database generated at: {os.path.abspath(args.output_dir)}")


if __name__ == "__main__":
    main()
