import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import scans
from app.schemas import HealthResponse
from app.services.ai_service import skin_classifier

load_dotenv()

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AUVRA Backend API",
    description="Backend REST API untuk klasifikasi kondisi kulit menggunakan TensorFlow/Keras.",
    version=os.getenv("MODEL_VERSION", "1.0.0"),
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:4173",   # Vite preview
        "http://127.0.0.1:5173",
        "https://auvra.io",        # production (opsional)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(scans.router, prefix="/api/v1/scans", tags=["Scans"])

# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/", response_model=HealthResponse, tags=["Health"])
async def health_check():
    return HealthResponse(
        status="ok",
        version=os.getenv("MODEL_VERSION", "1.0.0"),
        ai_mode=skin_classifier.mode,
    )
