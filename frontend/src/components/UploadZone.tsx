import { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, ImageIcon, X, AlertCircle } from 'lucide-react';
import { env } from '@/config/env';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

type Tab = 'upload' | 'camera';

export function UploadZone({ onFileSelected, disabled }: UploadZoneProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [preview, setPreview] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const MAX_SIZE = env.VITE_MAX_FILE_SIZE_MB * 1024 * 1024;
  const ACCEPTED = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] };

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (file.size > MAX_SIZE) {
      setError(`Ukuran file terlalu besar. Maksimal ${env.VITE_MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    // Revoke previous
    if (preview) URL.revokeObjectURL(preview);
    setPreview(url);
    setPreviewFile(file);
  }, [preview, MAX_SIZE]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) {
        setError('Format tidak didukung. Gunakan JPG, PNG, atau WebP.');
        return;
      }
      if (accepted.length > 0) handleFile(accepted[0]);
    },
    accept: ACCEPTED,
    maxFiles: 1,
    disabled,
    noClick: !!preview,
  });

  // Camera methods
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      setCameraError('Akses kamera ditolak. Izinkan akses kamera di pengaturan browser Anda.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      handleFile(file);
      stopCamera();
      setActiveTab('upload');
    }, 'image/jpeg', 0.92);
  };

  const clearPreview = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setPreviewFile(null);
    setError(null);
  };

  const handleAnalyze = () => {
    if (previewFile) onFileSelected(previewFile);
  };

  return (
    <div className="w-full space-y-4">
      {/* Tab switcher */}
      <div className="flex rounded-xl bg-surface-container p-1">
        {(['upload', 'camera'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); if (tab === 'camera') startCamera(); else stopCamera(); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-label-md font-medium transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white shadow-card text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab === 'upload' ? <Upload className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            {tab === 'upload' ? 'Unggah Gambar' : 'Gunakan Kamera'}
          </button>
        ))}
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <>
          {!preview ? (
            <div
              {...getRootProps()}
              className={`relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 ${
                isDragActive
                  ? 'dropzone-active border-primary'
                  : 'border-outline-variant hover:border-primary/50 hover:bg-primary/2'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <input {...getInputProps()} />

              {/* Animated upload icon */}
              <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${isDragActive ? 'bg-primary scale-110' : 'bg-surface-container'}`}>
                {isDragActive
                  ? <Upload className="h-8 w-8 text-white animate-bounce" />
                  : <ImageIcon className="h-8 w-8 text-on-surface-variant" />
                }
              </div>

              <p className="font-headline text-headline-md text-on-surface mb-1">
                {isDragActive ? 'Lepaskan di sini!' : 'Seret & Lepas Gambar'}
              </p>
              <p className="text-body-md text-on-surface-variant mb-4">
                atau <span className="text-primary font-medium">pilih file</span> dari perangkat Anda
              </p>
              <p className="text-label-sm text-on-surface-variant rounded-full bg-surface-container px-3 py-1">
                JPG, PNG, WebP · Maks. {env.VITE_MAX_FILE_SIZE_MB}MB
              </p>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-card">
              {/* Preview Image */}
              <img
                src={preview}
                alt="Preview analisis"
                className="w-full max-h-72 object-contain bg-surface-container"
              />

              {/* Overlay controls */}
              <div className="absolute inset-0 flex items-start justify-end p-3 pointer-events-none">
                <button
                  onClick={clearPreview}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-on-surface/70 text-white backdrop-blur-sm transition hover:bg-on-surface pointer-events-auto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Bottom CTA */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-label-md font-semibold text-on-surface">{previewFile?.name}</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {previewFile ? (previewFile.size / 1024).toFixed(1) + ' KB' : ''}
                  </p>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={disabled}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-label-md font-semibold text-on-primary shadow-primary transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                >
                  Analisis Sekarang
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Camera Tab */}
      {activeTab === 'camera' && (
        <div className="relative overflow-hidden rounded-2xl bg-on-surface min-h-[280px] flex items-center justify-center">
          {cameraError ? (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <AlertCircle className="h-12 w-12 text-error-container" />
              <p className="text-body-md text-white">{cameraError}</p>
              <button onClick={startCamera} className="rounded-xl bg-primary px-5 py-2 text-label-md font-medium text-on-primary">
                Coba Lagi
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {cameraActive && (
                <>
                  {/* Camera guide overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 rounded-full border-2 border-white/50 border-dashed animate-scan-pulse" />
                  </div>

                  {/* Capture button */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <button
                      onClick={capturePhoto}
                      className="h-16 w-16 rounded-full bg-white shadow-xl border-4 border-primary transition-transform active:scale-90 flex items-center justify-center"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary" />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-error-container/50 bg-error-container/10 px-4 py-3 text-label-md text-on-error-container animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0 text-error" />
          {error}
        </div>
      )}
    </div>
  );
}
