"""
MindShield AI — Machine Learning Inference Service

Provides real-time predictive risk tier classification and 48-hour acute relapse
crisis probabilities using trained Scikit-Learn models.
"""

from __future__ import annotations
import os
import joblib
import numpy as np
from typing import Optional, Dict, Any


class MLRiskService:
    """Service layer for loading trained ML models and executing inference."""

    def __init__(self, model_path: Optional[str] = None):
        if model_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.model_path = os.path.join(base_dir, "ml_models", "risk_classifier.pkl")
        else:
            self.model_path = model_path
            
        self.artifact: Optional[Dict[str, Any]] = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.artifact = joblib.load(self.model_path)
            except Exception as e:
                print(f"[WARNING] Failed to load ML model artifact at {self.model_path}: {e}")
                self.artifact = None

    def is_available(self) -> bool:
        """Returns True if trained ML models are successfully loaded in memory."""
        return self.artifact is not None

    def predict(self, input_metrics: Dict[str, float]) -> Dict[str, Any]:
        """
        Execute inference on a user's current behavioral snapshot.
        
        Expected keys in input_metrics:
            gaming_hours, skipped_meals, skipped_sleep, mood_delta,
            sleep_hours, resting_bpm, hrv_ms, stress_index,
            sentiment_score, anxiety_score, social_urge
        """
        if not self.is_available():
            return {
                "available": False,
                "error": "ML models not trained or loaded. Run train_ml_model.py."
            }

        feature_names = self.artifact["feature_names"]
        scaler = self.artifact["scaler"]
        tier_model = self.artifact["tier_model"]
        relapse_model = self.artifact["relapse_model"]

        # Vectorize input in exact training order
        features = np.array([[float(input_metrics.get(k, 0.0)) for k in feature_names]])
        features_scaled = scaler.transform(features)

        # Tier Classifier Predictions
        pred_tier = tier_model.predict(features_scaled)[0]
        tier_probs = tier_model.predict_proba(features_scaled)[0]
        tier_classes = tier_model.classes_
        tier_prob_map = {cls: round(float(prob), 4) for cls, prob in zip(tier_classes, tier_probs)}

        # Relapse / Crisis Predictions
        relapse_prob = float(relapse_model.predict_proba(features_scaled)[0][1])
        is_crisis_predicted = bool(relapse_model.predict(features_scaled)[0])

        return {
            "available": True,
            "predicted_risk_tier": pred_tier,
            "tier_probabilities": tier_prob_map,
            "relapse_risk_48h_probability": round(relapse_prob, 4),
            "crisis_alert": is_crisis_predicted,
            "model_confidence": round(float(max(tier_probs)), 3)
        }


# Singleton instance
ml_risk_service = MLRiskService()
