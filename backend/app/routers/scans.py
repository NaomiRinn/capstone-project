"""
routers/scans.py — API endpoints for skin scan operations.

Endpoints (prefix /api/v1/scans):
  POST   /upload        → upload image, start background analysis
  GET    /{scan_id}     → fetch single scan result
  GET    /              → list all scans
  DELETE /{scan_id}     → delete scan record + storage file
"""
from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, BackgroundTasks, HTTPException, UploadFile, File
from fastapi.responses import Response

from app.database import get_supabase
from app.schemas import ScanListItem, ScanResult, UploadResponse
from app.services.ai_service import skin_classifier
from storage3.types import FileOptions

logger = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
STORAGE_BUCKET = os.getenv("STORAGE_BUCKET", "scans")


# ─── Mapping Helpers (camelCase API to snake_case DB) ─────────────────────────

_CAMEL_TO_SNAKE = {
    "userId": "user_id",
    "createdAt": "created_at",
    "updatedAt": "updated_at",
    "imageUrl": "image_url",
    "thumbnailUrl": "thumbnail_url",
    "overallScore": "overall_score",
    "heatmapData": "heatmap_data",
    "inferenceTimeMs": "inference_time_ms",
    "modelVersion": "model_version",
    "processingSource": "processing_source",
}

_SNAKE_TO_CAMEL = {v: k for k, v in _CAMEL_TO_SNAKE.items()}


def _to_snake_case(data: dict) -> dict:
    return {
        _CAMEL_TO_SNAKE.get(k, k): v
        for k, v in data.items()
    }


def _to_camel_case(data: dict) -> dict:
    return {
        _SNAKE_TO_CAMEL.get(k, k): v
        for k, v in data.items()
    }


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _ext_from_content_type(ct: str) -> str:
    return {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}.get(ct, "jpg")


async def _run_analysis(scan_id: str, image_bytes: bytes) -> None:
    """Background task: run AI prediction and persist result to Supabase."""
    db = get_supabase()
    try:
        ai_result = await skin_classifier.predict(image_bytes)
        now = _now_iso()

        db.table("scans").update(_to_snake_case({
            "status": "completed",
            "updatedAt": now,
            "severity": ai_result.get("severity"),
            "overallScore": ai_result.get("overallScore"),
            "features": ai_result.get("features"),
            "recommendations": ai_result.get("recommendations"),
            "heatmapData": ai_result.get("heatmapData"),
            "inferenceTimeMs": ai_result.get("inferenceTimeMs"),
            "modelVersion": ai_result.get("modelVersion"),
            "processingSource": ai_result.get("processingSource"),
        })).eq("id", scan_id).execute()

        logger.info("[Scan %s] Analysis completed — severity=%s score=%.1f",
                    scan_id, ai_result.get("severity"), ai_result.get("overallScore", 0))

    except Exception as exc:  # noqa: BLE001
        logger.error("[Scan %s] Analysis failed: %s", scan_id, exc)
        db.table("scans").update(_to_snake_case({
            "status": "failed",
            "updatedAt": _now_iso(),
        })).eq("id", scan_id).execute()


# ─── POST /upload ─────────────────────────────────────────────────────────────

@router.post("/upload", response_model=UploadResponse, status_code=202)
async def upload_scan(
    background_tasks: BackgroundTasks,
    image: UploadFile = File(...),
):
    # 1. Validate content type
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{image.content_type}'. Use JPEG, PNG, or WebP.",
        )

    # 2. Read & validate size
    image_bytes = await image.read()
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(image_bytes) / 1024 / 1024:.1f} MB). Maximum is 10 MB.",
        )

    # 3. Generate scan ID & timestamps
    scan_id = str(uuid.uuid4())
    now = _now_iso()

    # 4. Insert initial record
    db = get_supabase()
    db.table("scans").insert(_to_snake_case({
        "id": scan_id,
        "status": "processing",
        "createdAt": now,
        "updatedAt": now,
    })).execute()

    # 5. Upload to Supabase Storage (best-effort)
    image_url: str | None = None
    try:
        ext = _ext_from_content_type(image.content_type or "")
        storage_path = f"{scan_id}/original.{ext}"
        
        # Pindahkan ke sini agar objek 'options' siap sebelum digunakan
        from storage3.types import FileOptions # Pastikan di-import (bisa di top-level file)
        options = FileOptions()
        options.content_type = image.content_type or "image/jpeg"

        db.storage.from_("scans").upload(
            path=storage_path,
            file=image_bytes,
            file_options=options # Sekarang aman digunakan!
        )
        
        public_url = db.storage.from_(STORAGE_BUCKET).get_public_url(storage_path)
        image_url = public_url
        db.table("scans").update(_to_snake_case({
            "imageUrl": image_url,
            "thumbnailUrl": image_url
        })).eq("id", scan_id).execute()
        logger.info("[Scan %s] Image uploaded → %s", scan_id, storage_path)
    except Exception as exc:  # noqa: BLE001
        logger.warning("[Scan %s] Storage upload skipped: %s", scan_id, exc)

    # 6. Queue background analysis
    background_tasks.add_task(_run_analysis, scan_id, image_bytes)

    return UploadResponse(
        scanId=scan_id,
        status="processing",
        message="Gambar berhasil diterima. Analisis sedang berjalan di background.",
    )


# ─── GET /{scan_id} ───────────────────────────────────────────────────────────

@router.get("/{scan_id}", response_model=ScanResult)
async def get_scan(scan_id: str):
    db = get_supabase()
    response = db.table("scans").select("*").eq("id", scan_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail=f"Scan '{scan_id}' not found.")
    return ScanResult(**_to_camel_case(response.data))


# ─── GET / ────────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[ScanListItem])
async def list_scans():
    db = get_supabase()
    response = (
        db.table("scans")
        .select("id,status,created_at,thumbnail_url,severity,overall_score")
        .order("created_at", desc=True)
        .execute()
    )
    camel_list = [_to_camel_case(row) for row in (response.data or [])]
    return [ScanListItem(**row) for row in camel_list]


# ─── DELETE /{scan_id} ────────────────────────────────────────────────────────

@router.delete("/{scan_id}", status_code=204)
async def delete_scan(scan_id: str):
    db = get_supabase()

    # Verify exists first
    check = db.table("scans").select("id").eq("id", scan_id).single().execute()
    if not check.data:
        raise HTTPException(status_code=404, detail=f"Scan '{scan_id}' not found.")

    # Remove from storage (best-effort)
    for ext in ("jpg", "png", "webp"):
        try:
            db.storage.from_(STORAGE_BUCKET).remove([f"{scan_id}/original.{ext}"])
        except Exception:  # noqa: BLE001
            pass

    # Delete DB record
    db.table("scans").delete().eq("id", scan_id).execute()
    logger.info("[Scan %s] Deleted.", scan_id)
    return Response(status_code=204)
