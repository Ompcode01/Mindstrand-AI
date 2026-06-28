"""
MindShield AI — Machine Learning Risk Model Trainer

Trains supervised predictive models on the synthesized behavioral dataset:
1. Risk Tier Classifier (Low, Moderate, High, Critical)
2. 48-hour Acute Relapse Predictor (Binary crisis forecasting)

Usage:
    python train_ml_model.py --dataset dataset --output-dir app/ml_models
"""

import os
import sys
import argparse
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix


def main():
    parser = argparse.ArgumentParser(description="ML Risk Model Trainer")
    parser.add_argument("--dataset", type=str, default="dataset", help="Directory containing synthetic CSVs")
    parser.add_argument("--output-dir", type=str, default="app/ml_models", help="Directory to save trained artifacts")
    args = parser.parse_args()

    metrics_csv = os.path.join(args.dataset, "daily_metrics.csv")
    if not os.path.exists(metrics_csv):
        print(f"[ERROR] Could not find {metrics_csv}. Run generate_synthetic_data.py first.")
        sys.exit(1)

    print(f"================================================================================")
    print(f"MindShield AI — Training Behavioral Health Predictive Models")
    print(f"================================================================================")
    print(f"Loading dataset: {metrics_csv}...")
    
    df = pd.read_csv(metrics_csv)
    print(f"Loaded {len(df):,} patient days across {df['user_id'].nunique():,} unique profiles.")

    # Feature selection
    feature_cols = [
        "gaming_hours", "skipped_meals", "skipped_sleep", "mood_delta",
        "sleep_hours", "resting_bpm", "hrv_ms", "stress_index",
        "sentiment_score", "anxiety_score", "social_urge"
    ]

    # Target 1: Composite Risk Tier
    target_tier = "risk_tier"

    # Target 2: Acute Relapse Risk (Next 48h crisis prediction)
    # Create target: 1 if composite_score >= 70 or risk_tier == 'critical'
    df["relapse_crisis"] = ((df["composite_score"] >= 68.0) | (df["risk_tier"] == "critical")).astype(int)

    X = df[feature_cols]
    y_tier = df[target_tier]
    y_relapse = df["relapse_crisis"]

    # Train / Test split (80% train, 20% validation)
    X_train, X_test, y_tier_train, y_tier_test, y_rel_train, y_rel_test = train_test_split(
        X, y_tier, y_relapse, test_size=0.20, random_state=42, stratify=y_tier
    )

    print(f"\nScaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # ─────────────────────────────────────────
    # Model 1: Risk Tier Classifier
    # ─────────────────────────────────────────
    print("\nTraining Model 1: Multi-Class Risk Tier Classifier (Random Forest)...")
    tier_model = RandomForestClassifier(n_estimators=100, max_depth=14, random_state=42, n_jobs=-1)
    tier_model.fit(X_train_scaled, y_tier_train)

    y_tier_pred = tier_model.predict(X_test_scaled)
    acc_tier = accuracy_score(y_tier_test, y_tier_pred)
    print(f" -> Model 1 Validation Accuracy: {acc_tier * 100:.2f}%\n")
    print("Classification Report (Risk Tiers):")
    print(classification_report(y_tier_test, y_tier_pred))

    # Print Top Features for Tier Classifier
    feat_imp = pd.DataFrame({
        "Feature": feature_cols,
        "Importance": tier_model.feature_importances_
    }).sort_values(by="Importance", ascending=False)
    print("Top Predictive Signals (Risk Tier):")
    for _, row in feat_imp.head(5).iterrows():
        print(f" * {row['Feature']:<18}: {row['Importance']*100:.1f}% contribution")

    # ─────────────────────────────────────────
    # Model 2: 48h Relapse / Crisis Predictor
    # ─────────────────────────────────────────
    print("\n--------------------------------------------------------------------------------")
    print("Training Model 2: 48-hour Relapse / Crisis Predictor...")
    relapse_model = RandomForestClassifier(n_estimators=80, max_depth=10, random_state=42, n_jobs=-1)
    relapse_model.fit(X_train_scaled, y_rel_train)

    y_rel_pred = relapse_model.predict(X_test_scaled)
    acc_rel = accuracy_score(y_rel_test, y_rel_pred)
    print(f" -> Model 2 Validation Accuracy: {acc_rel * 100:.2f}%\n")
    print("Classification Report (Crisis Prediction):")
    print(classification_report(y_rel_test, y_rel_pred, target_names=["Stable", "Acute Crisis"]))

    # ─────────────────────────────────────────
    # Export Models
    # ─────────────────────────────────────────
    out_dir = os.path.abspath(args.output_dir)
    os.makedirs(out_dir, exist_ok=True)
    model_path = os.path.join(out_dir, "risk_classifier.pkl")

    artifact = {
        "scaler": scaler,
        "tier_model": tier_model,
        "relapse_model": relapse_model,
        "feature_names": feature_cols,
        "trained_at": pd.Timestamp.now(tz="UTC").isoformat(),
        "metrics": {
            "tier_accuracy": float(acc_tier),
            "relapse_accuracy": float(acc_rel)
        }
    }

    joblib.dump(artifact, model_path)
    print(f"\n[SUCCESS] Serialized ML model pipeline saved to: {model_path}")


if __name__ == "__main__":
    main()
