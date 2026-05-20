import { Clock } from 'lucide-react';
import { HistoryList } from '@/components/HistoryList';

export function HistoryPage() {
  return (
    <div className="min-h-screen bg-white pt-20 pb-16">
      {/* Ambient blob */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-1/3 h-[400px] w-[400px] rounded-full bg-primary/6 blur-[100px]" />
        <div className="absolute top-20 right-1/4 h-[300px] w-[300px] rounded-full bg-secondary/6 blur-[80px]" />
      </div>

      <div className="container-page max-w-2xl">
        <div className="mb-8 pt-8">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 shadow-sm mb-4">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Riwayat</span>
          </div>
          <h1 className="font-headline text-3xl font-bold text-on-surface">Riwayat Analisis</h1>
          <p className="text-base text-on-surface-variant mt-2 leading-relaxed">
            Semua hasil analisis kulit Anda tersimpan dengan aman di perangkat ini.
          </p>
        </div>
        <HistoryList />
      </div>
    </div>
  );
}
