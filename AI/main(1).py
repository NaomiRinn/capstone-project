import io
import json
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from typing import Dict

app = FastAPI(
    title="AUVRA API",
    description="AI Diagnosis Kondisi Kulit — Model MobileNetV3Large",
    version="1.0.0"
)

# CORS — izinkan semua origin (sesuaikan di production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model & class names saat server start
model       = tf.keras.models.load_model("model_auvra_final.keras")
class_names = json.load(open("class_names.json"))
print(f"[INFO] Model loaded. Kelas: {class_names}")

# Schema respons
class PredictResponse(BaseModel):
    label: str
    confidence: str
    all_scores: Dict[str, str]

@app.get("/", summary="Status API")
def index():
    return {"status": "AUVRA API aktif", "kelas": class_names, "total_kelas": len(class_names)}

@app.post("/predict", response_model=PredictResponse, summary="Prediksi kondisi kulit")
async def predict(image: UploadFile = File(..., description="File gambar kulit (jpg/png)")):
    # Validasi tipe file
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File harus berupa gambar (jpg/png)")

    contents = await image.read()
    img  = Image.open(io.BytesIO(contents)).convert("RGB").resize((224, 224))
    arr  = np.expand_dims(np.array(img, dtype=np.float32), axis=0)

    # Model sudah include preprocess_input — kirim raw pixel (0-255)
    preds = model.predict(arr, verbose=0)[0]

    return PredictResponse(
        label       = class_names[int(np.argmax(preds))],
        confidence  = f"{float(np.max(preds)) * 100:.2f}%",
        all_scores  = {class_names[i]: f"{float(preds[i])*100:.2f}%" for i in range(len(class_names))}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
