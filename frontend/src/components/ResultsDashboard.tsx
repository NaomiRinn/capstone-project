import { useRef, useEffect, useState } from 'react';
import { AlertTriangle, Leaf, Cpu, Heart, Download, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ScanResult } from '@/types/api.types';
import { useNavigate } from 'react-router-dom';

interface ResultsDashboardProps {
  result: ScanResult;
  imagePreview?: string;
}

const SEVERITY_CONFIG = {
  mild:     { label: 'Ringan', colorClass: 'severity-mild',     icon: Leaf },
  moderate: { label: 'Sedang', colorClass: 'severity-moderate', icon: Heart },
  severe:   { label: 'Parah',  colorClass: 'severity-severe',   icon: AlertTriangle },
};

const RECOMMENDATION_ICONS  = { natural: Leaf, diagnostic: Cpu, lifestyle: Heart };
const RECOMMENDATION_ACCENT = { natural: 'border-l-tertiary', diagnostic: 'border-l-secondary', lifestyle: 'border-l-primary' };

export function ResultsDashboard({ result, imagePreview }: ResultsDashboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate  = useNavigate();
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.5);

  const severity    = result.severity ?? 'mild';
  const cfg         = SEVERITY_CONFIG[severity];
  const SeverityIcon = cfg.icon;

  // ─── Heatmap overlay ────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || !result.heatmapData || !imagePreview) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = result.heatmapData.length;
    const cols = result.heatmapData[0]?.length ?? 0;
    if (!rows || !cols) return;

    const img = new Image();
    img.onload = () => {
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const cellW = img.naturalWidth  / cols;
      const cellH = img.naturalHeight / rows;

      result.heatmapData!.forEach((row, r) => {
        row.forEach((val, c) => {
          if (val < 0.2) return;
          const R = Math.round(val > 0.7 ? 186 : 0);
          const G = Math.round(val > 0.7 ? 26  : val > 0.4 ? 96 : 58);
          const B = Math.round(val > 0.7 ? 26  : val > 0.4 ? 172 : 0);
          ctx.fillStyle = `rgba(${R},${G},${B},${val * heatmapOpacity})`;
          ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
        });
      });
    };
    img.src = imagePreview;
  }, [result.heatmapData, imagePreview, heatmapOpacity]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Medical Disclaimer */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="medical-disclaimer rounded-xl p-4"
      >
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-error mt-0.5" />
          <p className="text-sm text-on-error-container">
            <strong>Disclaimer Medis:</strong> Hasil ini hanya bersifat indikatif dan{' '}
            <strong>bukan diagnosis medis</strong>. Konsultasikan dengan dokter kulit bersertifikat.
          </p>
        </div>
      </motion.div>

      {/* Score + Severity */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >

        {/* Score ring */}
        <div className="glass rounded-2xl p-6 text-center card-hover">
          <p className="text-sm text-on-surface-variant mb-3">Skor Kesehatan Kulit</p>
          <div className="relative inline-flex">
            <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e0e3e5" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={severity === 'mild' ? '#3a4e00' : severity === 'moderate' ? '#0060ac' : '#ba1a1a'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={String(2 * Math.PI * 52)}
                strokeDashoffset={String(2 * Math.PI * 52 * (1 - (result.overallScore ?? 0) / 100))}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-headline text-3xl font-bold text-on-surface">
                {result.overallScore ?? '–'}
              </span>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mt-2">dari 100 poin</p>
        </div>

        {/* Severity card */}
        <div className={`rounded-2xl p-6 card-hover ${cfg.colorClass}`} style={{ border: 'none' }}>
          <div className="flex flex-col gap-3 h-full justify-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/60 flex items-center justify-center">
                <SeverityIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs opacity-70 uppercase tracking-wider">Tingkat Keparahan</p>
                <p className="font-headline text-2xl font-bold capitalize">{cfg.label}</p>
              </div>
            </div>
            <p className="text-sm opacity-70">
              {severity === 'mild'     && 'Kulit dalam kondisi baik dengan sedikit perhatian.'}
              {severity === 'moderate' && 'Beberapa area memerlukan perhatian dan perawatan.'}
              {severity === 'severe'   && 'Kondisi memerlukan perhatian medis segera.'}
            </p>
            <p className="text-xs opacity-50">
              {result.modelVersion} · {result.inferenceTimeMs}ms ·{' '}
              {result.processingSource === 'on-device' ? '🔒 On-Device' : '☁️ Cloud'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Heatmap */}
      {imagePreview && result.heatmapData && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden shadow-card"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-surface-container-highest">
            <p className="text-sm font-semibold text-on-surface">Peta Perhatian AI</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant">Intensitas</span>
              <input
                type="range" min="0" max="100" value={heatmapOpacity * 100}
                onChange={(e) => setHeatmapOpacity(Number(e.target.value) / 100)}
                className="w-20 accent-primary"
              />
            </div>
          </div>
          <canvas ref={canvasRef} className="w-full max-h-64 object-contain bg-on-surface" />
        </motion.div>
      )}

      {/* Feature scores */}
      {result.features && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-surface-container-lowest p-6 shadow-card"
        >
          <h3 className="font-headline text-xl font-semibold text-on-surface mb-4">Analisis Fitur Kulit</h3>
          <div className="space-y-4">
            {result.features.map((feat) => (
              <div key={feat.name}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-on-surface">{feat.name}</span>
                  <span className="text-xs font-semibold text-on-surface-variant">{feat.score}/100</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-container overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      feat.score >= 70 ? 'bg-tertiary' : feat.score >= 45 ? 'bg-secondary' : 'bg-error'
                    }`}
                    style={{ width: `${feat.score}%` }}
                  />
                </div>
                <p className="text-xs text-on-surface-variant mt-1">{feat.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      {result.recommendations && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <h3 className="font-headline text-xl font-semibold text-on-surface">Rekomendasi</h3>
          {result.recommendations.map((rec) => {
            const Icon = RECOMMENDATION_ICONS[rec.type];
            return (
              <div
                key={rec.id}
                className={`rounded-xl bg-surface-container-lowest p-4 border-l-4 shadow-card card-hover ${RECOMMENDATION_ACCENT[rec.type]}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container">
                    <Icon className="h-4 w-4 text-on-surface-variant" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{rec.title}</p>
                    <p className="text-sm text-on-surface-variant mt-0.5">{rec.description}</p>
                    <span className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs bg-surface-container text-on-surface-variant">
                      {rec.type === 'natural' ? '🌿 Herbal' : rec.type === 'diagnostic' ? '🤖 AI Diagnostik' : '💡 Gaya Hidup'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3 pt-2"
      >
        <button
          onClick={() => navigate('/analyze')}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary shadow-primary transition-all hover:opacity-90 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Analisis Ulang
        </button>
        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-outline px-6 py-3.5 text-sm font-medium text-on-surface transition-all hover:bg-surface-container">
          <Download className="h-4 w-4" />
          Unduh Laporan
        </button>
      </motion.div>
    </motion.div>
  );
}
