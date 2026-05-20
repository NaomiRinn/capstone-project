import { useState, useCallback, useRef } from 'react';
import { UploadZone } from '@/components/UploadZone';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { ConsentModal } from '@/components/ConsentModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { saveScan } from '@/services/scanService';
import { apiClient } from '@/lib/apiClient';
import type { ScanResult } from '@/types/api.types';
import { AlertCircle, Wifi, Cpu } from 'lucide-react';

type Phase = 'idle' | 'consent' | 'analyzing' | 'results' | 'error';

export function AnalyzePage() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [stage, setStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleFileSelected = useCallback((file: File) => {
    setPendingFile(file);
    // Create preview URL
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setPhase('consent');
  }, []);

  const handleConsentAccept = useCallback(async () => {
    if (!pendingFile) return;
    setPhase('analyzing');
    setProgress(10);
    setStage('Mengunggah gambar ke server...');

    abortRef.current = new AbortController();

    try {
      // 1. Prepare Multipart Form Data for upload
      const formData = new FormData();
      formData.append('image', pendingFile);

      // 2. Upload image to backend
      const uploadResponse = await apiClient.post<{ scanId: string; status: string; message: string }>(
        '/api/v1/scans/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: abortRef.current.signal,
        }
      );

      const { scanId } = uploadResponse.data;
      
      setProgress(40);
      setStage('Gambar berhasil diunggah, memproses analisis...');

      // 3. Poll for the scan result
      let pollStatus = 'processing';
      let scanResult: ScanResult | null = null;
      let attempts = 0;
      const maxAttempts = 20; // prevent infinite loops (approx 30s)

      while ((pollStatus === 'processing' || pollStatus === 'pending') && attempts < maxAttempts) {
        if (abortRef.current.signal.aborted) {
          throw new DOMException('Aborted', 'AbortError');
        }

        // Wait 1.5 seconds between requests
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(resolve, 1500);
          abortRef.current?.signal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });

        attempts++;
        // Simulate visual progress update during polling
        const simulatedProgress = Math.min(40 + attempts * 5, 95);
        setProgress(simulatedProgress);
        setStage('Mengekstrak fitur dan menghitung skor...');

        const getResponse = await apiClient.get<ScanResult>(`/api/v1/scans/${scanId}`, {
          signal: abortRef.current.signal,
        });

        scanResult = getResponse.data;
        pollStatus = scanResult.status;
      }

      if (pollStatus === 'failed' || !scanResult) {
        throw new Error('Analisis gambar gagal diproses oleh server.');
      }

      if (attempts >= maxAttempts) {
        throw new Error('Proses analisis melebihi batas waktu (timeout). Silakan coba lagi.');
      }

      setProgress(100);
      setStage('Selesai!');

      // Save locally (no-op now)
      try {
        await saveScan(scanResult);
      } catch (err) {
        console.error('Failed to save scan result:', err);
      }

      setResult(scanResult);
      setPhase('results');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analisis gagal';
      if (err instanceof DOMException && err.name === 'AbortError') {
        setPhase('idle');
        return;
      } else {
        setErrorMsg(msg);
      }
      setPhase('error');
    }
  }, [pendingFile]);

  const handleConsentDecline = useCallback(() => {
    setPhase('idle');
    setPendingFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(undefined);
  }, [imagePreview]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setPhase('idle');
  }, []);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setResult(null);
    setPendingFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(undefined);
    setErrorMsg('');
  }, [imagePreview]);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container-page max-w-2xl">
        {/* Page header */}
        <div className="mb-8 pt-8">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-5 w-5 text-primary" />
            <span className="text-label-sm font-semibold text-primary uppercase tracking-wider">On-Device AI</span>
          </div>
          <h1 className="font-headline text-headline-lg text-on-surface">Analisis Kulit</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Upload atau ambil foto kulit Anda untuk analisis AI mendalam.
          </p>
        </div>

        <ErrorBoundary>
          {phase === 'idle' && (
            <div className="animate-fade-in">
              <UploadZone onFileSelected={handleFileSelected} />

              {/* Privacy note */}
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-container px-4 py-3">
                <Wifi className="h-4 w-4 text-on-surface-variant shrink-0" />
                <p className="text-label-sm text-on-surface-variant">
                  Analisis berjalan sepenuhnya di perangkat Anda. Gambar tidak pernah dikirim ke server.
                </p>
              </div>
            </div>
          )}

          {phase === 'analyzing' && (
            <div className="animate-fade-in">
              <AnalysisLoader currentStage={stage} progress={progress} />
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleCancel}
                  className="rounded-xl border border-outline px-6 py-2.5 text-label-md font-medium text-on-surface-variant hover:bg-surface-container transition-all"
                >
                  Batalkan
                </button>
              </div>
            </div>
          )}

          {phase === 'results' && result && (
            <div className="animate-fade-in">
              <ResultsDashboard result={result} imagePreview={imagePreview} />
              <div className="mt-6 flex justify-center">
                <button onClick={handleReset} className="text-label-md text-primary hover:underline transition-colors">
                  ← Analisis Gambar Lain
                </button>
              </div>
            </div>
          )}

          {phase === 'error' && (
            <div className="flex flex-col items-center py-12 text-center animate-fade-in">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-container mb-4">
                <AlertCircle className="h-8 w-8 text-error" />
              </div>
              <h3 className="font-headline text-headline-md text-on-surface mb-2">Analisis Gagal</h3>
              <p className="text-body-md text-on-surface-variant mb-6 max-w-sm">{errorMsg}</p>
              <button
                onClick={handleReset}
                className="rounded-xl bg-primary px-8 py-3 text-label-md font-semibold text-on-primary shadow-primary transition-all hover:opacity-90"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </ErrorBoundary>
      </div>

      {/* Consent Modal */}
      {phase === 'consent' && (
        <ConsentModal onAccept={handleConsentAccept} onDecline={handleConsentDecline} />
      )}
    </div>
  );
}
