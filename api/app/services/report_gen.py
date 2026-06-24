"""
MindShield AI — Report Generation Service

Compiles historical data, AI explainability, and event logs into structured
SOC-style clinical reports.
"""

from datetime import datetime, timedelta
import logging

from app.services.ai_service import AIService
from app.services.risk_engine import RiskEngine

logger = logging.getLogger(__name__)

class ReportGenerationService:
    def __init__(self, ai_service: AIService, risk_engine: RiskEngine):
        self.ai = ai_service
        self.risk = risk_engine

    async def generate_soc_report(self, user_id: str, days: int = 14) -> dict:
        """Generate a complete SOC-style report for the user over X days."""
        logger.info(f"Generating SOC report for {user_id} over {days} days")
        
        # 1. Fetch data
        # In a real app, this would fetch from Supabase.
        # We will use the risk engine's calculation for current snapshot.
        snapshot = await self.risk.calculate_current_risk(user_id)
        
        # 2. Get explainability summary from AI
        explainability = await self.ai.explain_risk(
            igd_score=snapshot.igd_score,
            bdd_score=snapshot.bdd_score,
            sleep_score=snapshot.sleep_score,
            stress_score=snapshot.stress_score,
            composite_score=snapshot.composite_score,
            triggers=snapshot.triggers,
            delta_24h=snapshot.delta_24h
        )

        # 3. Assemble report
        report_data = {
            "metadata": {
                "user_id": user_id,
                "generated_at": datetime.utcnow().isoformat(),
                "period_days": days,
                "type": "SOC_CLINICAL_SUMMARY"
            },
            "executive_summary": {
                "overall_risk_tier": snapshot.risk_tier,
                "composite_score": snapshot.composite_score,
                "ai_narrative": explainability,
                "top_concern": snapshot.top_concern
            },
            "metrics": {
                "igd": snapshot.igd_score,
                "bdd": snapshot.bdd_score,
                "sleep": snapshot.sleep_score,
                "stress": snapshot.stress_score
            },
            "critical_triggers": snapshot.triggers[:5]
        }

        return report_data
