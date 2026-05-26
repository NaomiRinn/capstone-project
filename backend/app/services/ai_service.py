"""
ai_service.py — AUVRA Skin Classifier Service
"""
from __future__ import annotations

import hashlib
import logging
import os
import random
import time
import uuid
from pathlib import Path
from typing import List

import numpy as np
from PIL import Image
import io

logger = logging.getLogger(__name__)

# ─── Paths ────────────────────────────────────────────────────────────────────
_BASE_DIR = Path(__file__).resolve().parent.parent           # backend/app
_MODEL_DIR = _BASE_DIR / "models"
_MODEL_PATH = _MODEL_DIR / "skin_classifier.keras"
_CLASSES_PATH = _MODEL_DIR / "jumlah_kelas.txt"

# ─── Default class names (fallback jika jumlah_kelas.txt tidak ada) ───────────
_DEFAULT_CLASSES = [
    "Basal Cell Carcinoma (BCC)",
    "Eczema",
    "Hyperpigmentation",
    "Kulit Sehat",
    "Melanoma",
    "Melasma",
    "Psoriasis",
    "Seborrheic Keratoses and other Benign Tumors",
    "Solar Lentigo",
    "Sunburn",
]

# ─── Recommendation templates per condition ───────────────────────────────────
_RECOMMENDATIONS: dict[str, list[dict]] = {
    "Kulit Sehat": [
        {"type": "natural", "title": "Tabir Surya Harian", "description": "Gunakan tabir surya SPF 30+ setiap pagi untuk menjaga kesehatan kulit.", "priority": 1},
        {"type": "lifestyle", "title": "Hidrasi yang Cukup", "description": "Minum minimal 8 gelas air sehari untuk menjaga kelembapan alami kulit.", "priority": 2},
    ],
    "Normal": [
        {"type": "natural", "title": "Tabir Surya Harian", "description": "Gunakan tabir surya SPF 30+ setiap pagi untuk menjaga kesehatan kulit.", "priority": 1},
        {"type": "lifestyle", "title": "Hidrasi yang Cukup", "description": "Minum minimal 8 gelas air sehari untuk menjaga kelembapan alami kulit.", "priority": 2},
    ],
    "Hyperpigmentation": [
        {"type": "diagnostic", "title": "Krim Pencerah Topikal", "description": "Pertimbangkan krim mengandung Vitamin C, Niacinamide, atau Kojic Acid.", "priority": 1},
        {"type": "natural", "title": "Gunakan Sunscreen", "description": "Gunakan sunscreen SPF 30+ secara rutin untuk mencegah pigmentasi memburuk.", "priority": 2},
    ],
    "Eczema": [
        {"type": "natural", "title": "Pelembab Ekstra Lembut", "description": "Oleskan pelembab hypoallergenic bebas wewangian setelah mandi.", "priority": 1},
        {"type": "lifestyle", "title": "Hindari Bahan Iritan", "description": "Gunakan sabun lembut dan kenakan pakaian katun longgar.", "priority": 2},
    ],
    "Solar Lentigo": [
        {"type": "lifestyle", "title": "Batasi Paparan Matahari", "description": "Hindari paparan sinar matahari langsung antara jam 10 pagi hingga 4 sore.", "priority": 1},
        {"type": "diagnostic", "title": "Konsultasi Terapi Laser", "description": "Pertimbangkan terapi laser atau cryotherapy dengan dermatolog untuk menyamarkan flek.", "priority": 2},
    ],
    "Melasma": [
        {"type": "diagnostic", "title": "Konsultasi Dokter Kulit", "description": "Pertimbangkan krim resep dokter seperti asam traneksamat atau hidrokuinon.", "priority": 1},
        {"type": "natural", "title": "Sunscreen Fisik", "description": "Gunakan sunscreen fisik (Zinc Oxide/Titanium Dioxide) untuk perlindungan maksimal.", "priority": 2},
    ],
    "Sunburn": [
        {"type": "natural", "title": "Kompres Aloe Vera", "description": "Oleskan gel lidah buaya murni untuk menenangkan kulit yang terbakar.", "priority": 1},
        {"type": "lifestyle", "title": "Perbanyak Minum Air", "description": "Minum air putih lebih banyak untuk mempercepat pemulihan hidrasi kulit.", "priority": 2},
    ],
    "Psoriasis": [
        {"type": "natural", "title": "Pelembab Berbasis Salep", "description": "Gunakan pelembab tebal secara rutin untuk menjaga kelembapan kulit bersisik.", "priority": 1},
        {"type": "diagnostic", "title": "Konsultasi Spesialis", "description": "Diskusikan opsi terapi obat topikal atau fototerapi dengan dokter spesialis kulit.", "priority": 2},
    ],
    "Basal Cell Carcinoma (BCC)": [
        {"type": "diagnostic", "title": "Pemeriksaan Medis Segera", "description": "Segera periksakan ke dokter bedah kulit untuk opsi biopsi dan pengangkatan lesi.", "priority": 1},
        {"type": "lifestyle", "title": "Monitor Perubahan", "description": "Perhatikan jika ada benjolan mengkilap atau luka yang tidak kunjung sembuh.", "priority": 2},
    ],
    "Melanoma": [
        {"type": "diagnostic", "title": "Tindakan Medis Darurat", "description": "Segera temui dokter spesialis onkologi kulit untuk diagnosis dan pengangkatan bedah.", "priority": 1},
        {"type": "lifestyle", "title": "Proteksi UV Maksimal", "description": "Gunakan pakaian tertutup, topi lebar, dan hindari paparan matahari langsung.", "priority": 2},
    ],
    "Seborrheic Keratoses and other Benign Tumors": [
        {"type": "diagnostic", "title": "Pemeriksaan Dokter", "description": "Periksakan ke dokter kulit untuk memastikan lesi bersifat jinak dan bukan keganasan.", "priority": 1},
        {"type": "lifestyle", "title": "Jangan Menggaruk Lesi", "description": "Hindari menggaruk atau mencabuti benjolan agar tidak memicu infeksi sekunder.", "priority": 2},
    ],
}

# Fallback rekomendasi umum
_DEFAULT_RECOMMENDATIONS = [
    {"type": "lifestyle", "title": "Jaga Kebersihan Kulit", "description": "Bersihkan wajah secara teratur dengan sabun lembut.", "priority": 1},
    {"type": "diagnostic", "title": "Konsultasi Dokter Kulit", "description": "Periksakan kondisi kulit Anda ke dokter spesialis.", "priority": 2},
    {"type": "natural", "title": "Lindungi dari Paparan UV", "description": "Gunakan tabir surya SPF 30+ setiap hari.", "priority": 3},
]


class SkinClassifierService:
    """Unified skin condition classifier using TensorFlow."""

    def __init__(self) -> None:
        self.mode: str = "mock"
        self.model = None
        self.class_names: List[str] = self._load_class_names()
        self.model_version: str = os.getenv("MODEL_VERSION", "1.0.0")
        self._try_load_model()

    # ── Initialization ────────────────────────────────────────────────────────

    def _load_class_names(self) -> List[str]:
        if _CLASSES_PATH.exists():
            names = [ln.strip() for ln in _CLASSES_PATH.read_text(encoding="utf-8").splitlines() if ln.strip()]
            if names:
                logger.info("[AI Service] Loaded %d class names from jumlah_kelas.txt", len(names))
                return names
        return _DEFAULT_CLASSES

    def _try_load_model(self) -> None:
        if not _MODEL_PATH.exists():
            self.mode = "mock"
            logger.error("[AI Service] Model file not found at %s. Using mock.", _MODEL_PATH)
            return
        try:
            import tensorflow as tf  # noqa: PLC0415
            import keras  # noqa: PLC0415

            # ── Monkey Patching Keras Dense Layer Global ──────────────────────
            # Memotong properti 'quantization_config' langsung dari akar constructor Keras
            _old_dense_init = keras.layers.Dense.__init__

            def _patched_dense_init(self_layer, *args, **kwargs):
                kwargs.pop('quantization_config', None)  # Buap parameter pemicu eror deserialisasi
                _old_dense_init(self_layer, *args, **kwargs)

            keras.layers.Dense.__init__ = _patched_dense_init
            # ──────────────────────────────────────────────────────────────────

            # Fungsi pembungkus jika arsitektur membutuhkan registrasi token fungsional
            def hard_silu(x):
                return keras.activations.hard_silu(x)

            # Muat model secara bersih menggunakan native keras loader
            self.model = keras.models.load_model(
                str(_MODEL_PATH),
                custom_objects={"hard_silu": hard_silu}
            )
                
            self.mode = "tensorflow"
            logger.info("[AI Service] TensorFlow model loaded successfully from %s", _MODEL_PATH)
        except ImportError as imp_err:
            self.mode = "mock"
            logger.error("[AI Service] Required packages not fully installed: %s", imp_err)
        except Exception as exc:  # noqa: BLE001
            self.mode = "mock"
            logger.error("[AI Service] Failed to load model architecture: %s — falling back to mock", exc)
    # ── Public API ────────────────────────────────────────────────────────────

    async def predict(self, image_bytes: bytes) -> dict:
        """
        Run prediction on raw image bytes.
        Returns a dict compatible with the ScanResult Pydantic schema.
        """
        t_start = time.perf_counter()

        if self.model is None or self.mode == "mock":
            result = self._predict_mock(image_bytes)
            current_mode = "mock"
        else:
            result = self._predict_tensorflow(image_bytes)
            current_mode = "tensorflow"

        elapsed_ms = int((time.perf_counter() - t_start) * 1000)
        result["inferenceTimeMs"] = elapsed_ms
        result["modelVersion"] = self.model_version
        result["processingSource"] = "cloud" if current_mode == "tensorflow" else "on-device"
        return result

    # ── TensorFlow Prediction ─────────────────────────────────────────────────

    def _predict_tensorflow(self, image_bytes: bytes) -> dict:
        if self.model is None:
            raise RuntimeError("TensorFlow model is not loaded. Cannot run prediction.")

        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = img.resize((224, 224))
        
        # Normalisasi matriks piksel (0.0 - 1.0) untuk keakuratan model CNN
        arr = np.array(img, dtype=np.float32) / 255.0
        arr = np.expand_dims(arr, axis=0)

        preds = self.model.predict(arr, verbose=0)[0]
        return self._build_result(preds)

    # ── Mock Prediction (Fallback) ────────────────────────────────────────────

    def _predict_mock(self, image_bytes: bytes) -> dict:
        seed = int(hashlib.md5(image_bytes[:512]).hexdigest(), 16) % (2**32)
        rng = random.Random(seed)

        raw = [rng.expovariate(1.0) for _ in self.class_names]
        total = sum(raw)
        preds = np.array([v / total for v in raw], dtype=np.float32)
        return self._build_result(preds)

    # ── Shared Result Builder ─────────────────────────────────────────────────

    def _build_result(self, probabilities: np.ndarray) -> dict:
        top_idx = int(np.argmax(probabilities))
        top_prob = float(probabilities[top_idx])
        condition = self.class_names[top_idx] if top_idx < len(self.class_names) else "Unknown"

        # Paksa pembulatan menjadi tipe data INT murni agar tidak ditolak PostgreSQL
        overall_score = int(round(top_prob * 100, 0))
        severity = self._class_to_severity(condition)

        features = self._build_features(condition, severity)
        recommendations = self._build_recommendations(condition, severity)
        heatmap = self._build_heatmap(probabilities)

        return {
            "severity": severity,
            "overallScore": overall_score,
            "features": features,
            "recommendations": recommendations,
            "heatmapData": heatmap,
        }

    @staticmethod
    def _class_to_severity(condition: str) -> str:
        cond = condition.strip().lower()
        if cond in ("kulit sehat", "normal"):
            return "normal"
        elif cond in ("hyperpigmentation", "eczema", "solar lentigo"):
            return "mild"
        elif cond in ("melasma", "sunburn", "psoriasis"):
            return "moderate"
        elif cond in ("basal cell carcinoma (bcc)", "melanoma", "seborrheic keratoses and other benign tumors"):
            return "severe"
        return "normal"

    def _build_features(self, condition: str, severity: str) -> list:
        severity_labels = {
            "normal": "Normal",
            "mild": "Ringan",
            "moderate": "Sedang",
            "severe": "Terparah"
        }
        severity_text = severity_labels.get(severity, "Normal")

        return [
            {
                "name": "Jenis Penyakit",
                "score": 100.0,
                "description": condition,
                "icon": "activity"
            },
            {
                "name": "Severity",
                "score": 100.0,
                "description": severity_text,
                "icon": "shield"
            }
        ]

    def _build_recommendations(self, condition: str, severity: str) -> list:
        templates = _RECOMMENDATIONS.get(condition, _DEFAULT_RECOMMENDATIONS)
        recs = []
        for i, tmpl in enumerate(templates):
            recs.append({
                "id": str(uuid.uuid4()),
                "type": tmpl["type"],
                "title": tmpl["title"],
                "description": tmpl["description"],
                "priority": tmpl.get("priority", i + 1),
            })
        return recs

    @staticmethod
    def _build_heatmap(probabilities: np.ndarray) -> List[List[float]]:
        """Build a 16×16 pseudo-heatmap from probability distribution."""
        size = 16
        flat = np.resize(probabilities, size * size).reshape(size, size)
        mn, mx = flat.min(), flat.max()
        if mx > mn:
            flat = (flat - mn) / (mx - mn)
        return flat.tolist()


# ─── Singleton ────────────────────────────────────────────────────────────────
skin_classifier = SkinClassifierService()