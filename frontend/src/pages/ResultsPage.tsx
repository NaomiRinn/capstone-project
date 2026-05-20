import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScan } from '@/services/scanService';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import type { ScanResult } from '@/types/api.types';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);   // true by default — avoids setState-in-effect
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { navigate('/history'); return; }
    const controller = new AbortController();

    getScan(id, controller.signal)
      .then(setScan)
      .catch((err) => {
        if (err.name !== 'AbortError') setError('Tidak dapat memuat hasil analisis.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [id, navigate]);

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container-page max-w-2xl">
        <div className="mb-6 pt-8 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </button>
          <span className="text-outline-variant">·</span>
          <h1 className="font-headline text-xl font-bold text-on-surface">Hasil Analisis</h1>
        </div>

        {loading && (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-base text-on-surface-variant">Memuat hasil analisis...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center py-20 gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-error" />
            <p className="text-base text-on-surface-variant">{error}</p>
            <button onClick={() => navigate('/history')} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary">
              Kembali ke Riwayat
            </button>
          </div>
        )}

        {scan && <ResultsDashboard result={scan} imagePreview={scan.thumbnailUrl} />}
      </div>
    </div>
  );
}
