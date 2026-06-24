import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""

    # Gemini
    GEMINI_API_KEY: str = ""

    # App
    APP_NAME: str = "MindShield AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "https://mindshield.ai"]

    # WebSocket
    WS_HEARTBEAT_INTERVAL: int = 30

    # Wearable Simulator
    WEARABLE_PUSH_INTERVAL: int = 30  # seconds

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
