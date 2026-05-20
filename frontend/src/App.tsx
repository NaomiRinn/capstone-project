import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { NavBar } from '@/components/NavBar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Loader2 } from 'lucide-react';

// ─── Lazy-loaded routes (code splitting) ──────────────────────────────────
const HomePage    = lazy(() => import('@/pages/HomePage').then((m)    => ({ default: m.HomePage })));
const AnalyzePage = lazy(() => import('@/pages/AnalyzePage').then((m) => ({ default: m.AnalyzePage })));
const HistoryPage = lazy(() => import('@/pages/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const ResultsPage = lazy(() => import('@/pages/ResultsPage').then((m) => ({ default: m.ResultsPage })));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-on-surface-variant">Memuat halaman...</p>
      </div>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="flex min-h-screen flex-col bg-surface">
          <NavBar />
          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"           element={<HomePage />} />
                <Route path="/analyze"    element={<AnalyzePage />} />
                <Route path="/history"    element={<HistoryPage />} />
                <Route path="/results/:id" element={<ResultsPage />} />
                <Route path="*" element={
                  <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
                    <p className="font-headline text-6xl font-bold text-on-surface mb-3">404</p>
                    <p className="text-lg text-on-surface-variant mb-6">Halaman tidak ditemukan.</p>
                    <a href="/" className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-on-primary">
                      Kembali ke Beranda
                    </a>
                  </div>
                } />
              </Routes>
            </Suspense>
          </main>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              background: '#fff',
              color: '#191c1e',
              boxShadow: '0 8px 24px rgba(0,96,172,0.12)',
            },
            success: { iconTheme: { primary: '#3a4e00', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ba1a1a', secondary: '#fff' } },
          }}
        />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
