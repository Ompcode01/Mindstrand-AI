from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from enum import Enum


# ─────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────

class RiskTier(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"
    UNKNOWN = "unknown"


class AssessmentType(str, Enum):
    IGD = "IGD"
    BDD = "BDD"
    SLEEP = "SLEEP"
    STRESS = "STRESS"


class EventSeverity(str, Enum):
    ADVISORY = "advisory"
    WARNING = "warning"
    ALERT = "alert"
    CRITICAL = "critical"


class InterventionStatus(str, Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"


# ─────────────────────────────────────────────
# Profile
# ─────────────────────────────────────────────

class ProfileCreate(BaseModel):
    full_name: str
    age: int = Field(ge=13, le=100)
    gender: str


class ProfileResponse(BaseModel):
    id: str
    email: Optional[str]
    full_name: Optional[str]
    age: Optional[int]
    gender: Optional[str]
    risk_tier: RiskTier = RiskTier.UNKNOWN
    onboarding_completed: bool = False
    created_at: datetime


# ─────────────────────────────────────────────
# Assessments
# ─────────────────────────────────────────────

class AssessmentSubmit(BaseModel):
    type: AssessmentType
    responses: dict[str, int]   # { question_id: Likert value }


class AssessmentResponse(BaseModel):
    id: str
    type: AssessmentType
    raw_score: float
    risk_level: str
    ai_summary: Optional[str]
    created_at: datetime


# ─────────────────────────────────────────────
# Risk Scores
# ─────────────────────────────────────────────

class RiskTrigger(BaseModel):
    type: str
    weight: float
    description: str


class RiskScoreResponse(BaseModel):
    id: str
    computed_at: datetime
    igd_score: float
    bdd_score: float
    sleep_score: float
    stress_score: float
    composite_score: float
    risk_tier: RiskTier
    delta_24h: Optional[float]
    triggers: list[RiskTrigger] = []
    ai_explanation: Optional[str]
    confidence: float


# ─────────────────────────────────────────────
# Journal
# ─────────────────────────────────────────────

class JournalCreate(BaseModel):
    content: str = Field(min_length=10, max_length=5000)


class JournalEntryResponse(BaseModel):
    id: str
    content: str
    mood_tag: Optional[str]
    ai_tags: list[str] = []
    risk_signals: list[dict] = []
    ai_analysis: Optional[str]
    sentiment_score: Optional[float]
    created_at: datetime


# ─────────────────────────────────────────────
# Gaming Sessions
# ─────────────────────────────────────────────

class GamingSessionCreate(BaseModel):
    game_name: str
    started_at: datetime
    ended_at: datetime
    mood_before: int = Field(ge=1, le=10)
    mood_after: int = Field(ge=1, le=10)
    skipped_meals: bool = False
    skipped_sleep: bool = False
    notes: Optional[str] = None


class GamingSessionResponse(BaseModel):
    id: str
    game_name: str
    duration_mins: int
    mood_before: int
    mood_after: int
    skipped_meals: bool
    skipped_sleep: bool
    risk_contribution: float
    started_at: datetime


# ─────────────────────────────────────────────
# Wearable
# ─────────────────────────────────────────────

class WearableSnapshot(BaseModel):
    heart_rate_bpm: int
    hrv_ms: float
    sleep_hours: float
    sleep_quality: int    # 1-10
    steps: int
    stress_index: float   # 0-100
    skin_temp_c: float
    source: str = "simulated"
    recorded_at: Optional[datetime] = None


# ─────────────────────────────────────────────
# Mood Check-in
# ─────────────────────────────────────────────

class MoodCheckinCreate(BaseModel):
    mood_score: int = Field(ge=1, le=10)
    energy: int = Field(ge=1, le=10)
    anxiety: int = Field(ge=1, le=10)
    social_urge: int = Field(ge=1, le=10)
    notes: Optional[str] = None


# ─────────────────────────────────────────────
# Interventions
# ─────────────────────────────────────────────

class ActionStep(BaseModel):
    step: str
    resource_url: Optional[str] = None


class InterventionResponse(BaseModel):
    id: str
    trigger_type: str
    severity: EventSeverity
    title: str
    description: str
    ai_rationale: Optional[str]
    action_steps: list[ActionStep] = []
    status: InterventionStatus
    created_at: datetime


class InterventionUpdate(BaseModel):
    status: InterventionStatus


# ─────────────────────────────────────────────
# Behavioral Events
# ─────────────────────────────────────────────

class BehavioralEvent(BaseModel):
    id: str
    event_type: str
    severity: EventSeverity
    source: str
    payload: dict[str, Any] = {}
    created_at: datetime


# ─────────────────────────────────────────────
# AI Responses
# ─────────────────────────────────────────────

class AIAnalysisResult(BaseModel):
    summary: str
    tags: list[str] = []
    risk_signals: list[dict] = []
    confidence: float = 0.85
    recommendations: list[str] = []
