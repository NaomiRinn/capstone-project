import { useState, useEffect } from 'react';
import { Search, Filter, Clock, ChevronRight, AlertCircle, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listScans } from '@/services/scanService';
import type { ScanListItem } from '@/types/api.types';

const STATUS_PILLS: Record<string, { label: string; className: string }> = {
  completed: { label: 'Selesai',   className: 'bg-tertiary/10 text-tertiary border border-tertiary/20' },
  processing: { label: 'Diproses', className: 'bg-secondary/10 text-secondary border border-secondary/20' },
  pending:    { label: 'Menunggu', className: 'bg-outline-variant/30 text-on-surface-variant border border-outline-variant' },
  failed:     { label: 'Gagal',    className: 'bg-error-container text-on-error-container border border-error-container/30' },
};

const SEVERITY_DOT: Record<string, string> = {
  mild:     'bg-tertiary',
  moderate: 'bg-secondary',
  severe:   'bg-error',
};

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl glass p-4 shadow-card">
          <div className="skeleton h-16 w-16 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/3 rounded-full" />
            <div className="skeleton h-3 w-1/2 rounded-full" />
          </div>
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function HistoryList() {
  const [scans, setScans] = useState<ScanListItem[]>([]);
  const [loading, setLoading] = useState(true);   // true by default — avoids setState-in-effect
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const controller = new AbortController();

    listScans(controller.signal)
      .then(setScans)
      .catch((err) => {
        if (err.name !== 'AbortError') setError('Gagal memuat riwayat analisis.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const filtered = scans.filter((s) => {
    const matchSearch = search
      ? s.id.toLowerCase().includes(search.toLowerCase()) ||
        (s.severity ?? '').toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            placeholder="Cari riwayat analisis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-outline-variant/60 glass py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-outline-variant/60 glass py-2.5 pl-9 pr-4 text-sm text-on-surface outline-none transition focus:border-primary appearance-none cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Selesai</option>
            <option value="processing">Diproses</option>
            <option value="pending">Menunggu</option>
            <option value="failed">Gagal</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <HistorySkeleton />
      ) : error ? (
        <div className="flex items-center gap-3 rounded-2xl glass border border-error/20 p-4">
          <AlertCircle className="h-5 w-5 text-error shrink-0" />
          <p className="text-sm text-on-error-container">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl glass shadow-glass">
            <BarChart2 className="h-10 w-10 text-outline" />
          </div>
          <p className="font-headline text-xl font-bold text-on-surface mb-2">Belum Ada Riwayat</p>
          <p className="text-sm text-on-surface-variant max-w-xs">Mulai analisis kulit pertama Anda sekarang.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((scan) => {
            const pill = STATUS_PILLS[scan.status] ?? STATUS_PILLS.pending;
            const dot  = SEVERITY_DOT[scan.severity ?? ''];
            return (
              <Link
                key={scan.id}
                to={`/results/${scan.id}`}
                className="flex items-center gap-4 rounded-2xl glass p-4 shadow-card card-hover group"
              >
                {/* Thumbnail */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                  {scan.thumbnailUrl ? (
                    <img
                      src={scan.thumbnailUrl}
                      alt="Thumbnail analisis"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BarChart2 className="h-7 w-7 text-outline-variant" />
                    </div>
                  )}
                  {dot && (
                    <div className={`absolute bottom-1 right-1 h-3 w-3 rounded-full ${dot} border-2 border-white`} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">Analisis #{scan.id.slice(-6)}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3 w-3 text-on-surface-variant" />
                    <p className="text-xs text-on-surface-variant">
                      {new Date(scan.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {scan.overallScore !== undefined && (
                    <p className="text-xs text-primary mt-0.5 font-semibold">Skor: {scan.overallScore}/100</p>
                  )}
                </div>

                {/* Status + Arrow */}
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pill.className}`}>
                    {pill.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-outline transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
