"""run.py — convenience script to start the AUVRA backend server."""
import os
import uvicorn

if __name__ == "__main__":
    # NOTE: reload=True menyebabkan TensorFlow model gagal dimuat di subprocess uvicorn.
    #       Gunakan UVICORN_RELOAD=true hanya jika tidak membutuhkan TF model (mock mode).
    use_reload = os.getenv("UVICORN_RELOAD", "false").lower() == "true"
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=use_reload,
        log_level="info",
    )
