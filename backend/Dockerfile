# Menggunakan base image Python 3.11 versi ringan (slim)
FROM python:3.11-slim

# Mencegah Python menulis file .pyc ke disk
ENV PYTHONDONTWRITEBYTECODE 1
# Memastikan output console langsung tampil (tidak di-buffer)
ENV PYTHONUNBUFFERED 1

# Menentukan direktori kerja di dalam container
WORKDIR /app

# Menginstal dependensi sistem yang mungkin dibutuhkan oleh OpenCV/TensorFlow (jika ada)
RUN apt-get update && apt-get install -y \
    build-essential \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Menyalin file requirements.txt ke dalam container
COPY requirements.txt .

# Menginstal dependensi Python
# Menggunakan --no-cache-dir agar image Docker tidak membengkak
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Menyalin seluruh kode backend ke dalam container
COPY . .

# Mengekspos port 7860 (Port standar yang diwajibkan oleh Hugging Face)
EXPOSE 7860

# Perintah untuk menjalankan FastAPI menggunakan Uvicorn di port 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
