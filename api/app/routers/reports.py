"""
MindShield AI — Reports Router
"""

from fastapi import APIRouter, Depends, HTTPException, status
import logging

from app.services.report_gen import ReportGenerationService
from app.services.ai_service import AIService
from app.services.risk_engine import RiskEngine

# Assuming standard auth dependency is in app.routers.auth or similar.
# For simplicity, if deps.py doesn't exist, we will mock user_id.
# In a real setup: from app.api.deps import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

# Singletons for services
ai_service = AIService()
risk_engine = RiskEngine()
report_service = ReportGenerationService(ai_service=ai_service, risk_engine=risk_engine)

@router.post("/generate", response_model=dict)
async def generate_report(
    user_id: str = "demo", # Hardcoded for demo if no auth dep
    days: int = 14
):
    """Generate a comprehensive clinical/SOC report."""
    try:
        report = await report_service.generate_soc_report(user_id=user_id, days=days)
        return {"status": "success", "data": report}
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate report"
        )
