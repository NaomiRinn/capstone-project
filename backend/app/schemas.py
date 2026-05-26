from __future__ import annotations
from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


# ─── Enums ────────────────────────────────────────────────────────────────────
SeverityLiteral = Literal["normal", "mild", "moderate", "severe"]
ScanStatusLiteral = Literal["pending", "processing", "completed", "failed"]
ProcessingSourceLiteral = Literal["on-device", "cloud"]
RecommendationTypeLiteral = Literal["natural", "diagnostic", "lifestyle"]


# ─── Sub-models ───────────────────────────────────────────────────────────────
class AnalysisFeature(BaseModel):
    name: str
    score: float = Field(ge=0, le=100)
    description: str
    icon: Optional[str] = None


class Recommendation(BaseModel):
    id: str
    type: RecommendationTypeLiteral
    title: str
    description: str
    priority: int


# ─── Core Scan Result ─────────────────────────────────────────────────────────
class ScanResult(BaseModel):
    id: str
    userId: Optional[str] = None
    status: ScanStatusLiteral
    createdAt: str          # ISO 8601 datetime string — matches frontend z.string().datetime()
    updatedAt: str
    imageUrl: Optional[str] = None
    thumbnailUrl: Optional[str] = None
    severity: Optional[SeverityLiteral] = None
    overallScore: Optional[float] = Field(default=None, ge=0, le=100)
    features: Optional[List[AnalysisFeature]] = None
    recommendations: Optional[List[Recommendation]] = None
    heatmapData: Optional[List[List[float]]] = None
    inferenceTimeMs: Optional[int] = None
    modelVersion: Optional[str] = None
    processingSource: Optional[ProcessingSourceLiteral] = None


# ─── List Item (subset of ScanResult) ─────────────────────────────────────────
class ScanListItem(BaseModel):
    id: str
    status: ScanStatusLiteral
    createdAt: str
    thumbnailUrl: Optional[str] = None
    severity: Optional[SeverityLiteral] = None
    overallScore: Optional[float] = Field(default=None, ge=0, le=100)
    imagePreview: Optional[str] = None   # base64 preview, opsional


# ─── Upload Response ──────────────────────────────────────────────────────────
class UploadResponse(BaseModel):
    scanId: str
    status: ScanStatusLiteral
    message: str


# ─── Health Check Response ────────────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str
    version: str
    ai_mode: str
