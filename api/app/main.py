"""
MindShield AI — FastAPI Main Application

MHOC (Mental Health Operations Center) Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.config import get_settings
from app.routers import (
    auth,
    assessments,
    risk,
    journal,
    gaming,
    wearable,
    mood,
    interventions,
    insights,
    websocket,
    reports,
    bdd,
    physiological,
    fusion,
    prediction,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🛡️  MindShield AI backend starting...")
    yield
    logger.info("🛡️  MindShield AI backend shutting down...")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="MindShield AI API",
        description="AI-Powered Behavioral Health Intelligence Platform",
        version=settings.APP_VERSION,
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    prefix = "/api/v1"
    app.include_router(auth.router, prefix=prefix, tags=["Auth"])
    app.include_router(assessments.router, prefix=prefix, tags=["Assessments"])
    app.include_router(risk.router, prefix=prefix, tags=["Risk"])
    app.include_router(journal.router, prefix=prefix, tags=["Journal"])
    app.include_router(gaming.router, prefix=prefix, tags=["Gaming"])
    app.include_router(wearable.router, prefix=prefix, tags=["Wearable"])
    app.include_router(mood.router, prefix=prefix, tags=["Mood"])
    app.include_router(interventions.router, prefix=prefix, tags=["Interventions"])
    app.include_router(insights.router, prefix=prefix, tags=["Insights"])
    app.include_router(websocket.router, prefix=prefix, tags=["WebSocket"])
    app.include_router(reports.router, prefix=prefix, tags=["Reports"])
    app.include_router(bdd.router, prefix=prefix, tags=["BDD"])
    app.include_router(physiological.router, prefix=prefix, tags=["Physiological"])
    app.include_router(fusion.router, prefix=prefix, tags=["Fusion"])
    app.include_router(prediction.router, prefix=prefix, tags=["Prediction"])

    @app.get("/")
    async def root():
        return {
            "name": "MindShield AI Backend",
            "version": "1.0.0",
            "status": "operational",
            "docs_url": "/docs",
            "health_url": "/health",
            "api_prefix": "/api/v1"
        }

    @app.get("/health")
    async def health_check():
        return {"status": "operational", "service": "MindShield AI"}

    return app


app = create_app()
