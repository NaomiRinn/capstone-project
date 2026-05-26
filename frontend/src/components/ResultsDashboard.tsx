import { useRef, useEffect } from 'react';
import { AlertTriangle, Leaf, Cpu, Heart, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ScanResult } from '@/types/api.types';

interface ResultsDashboardProps {
  result: ScanResult;
  imagePreview?: string;
  onReset?: () => void;
}

const SEVERITY_CONFIG = {
  normal:   { label: 'Normal (Kulit Sehat)', colorClass: 'severity-mild',     icon: Leaf },
  mild:     { label: 'Ringan', colorClass: 'severity-mild',     icon: Leaf },
  moderate: { label: 'Sedang', colorClass: 'severity-moderate', icon: Heart },
  severe:   { label: 'Terparah',  colorClass: 'severity-severe',   icon: AlertTriangle },
};

const RECOMMENDATION_ICONS  = { natural: Leaf, diagnostic: Cpu, lifestyle: Heart };
const RECOMMENDATION_ACCENT = { natural: 'border-l-tertiary', diagnostic: 'border-l-secondary', lifestyle: 'border-l-primary' };

export function ResultsDashboard({ result, imagePreview, onReset }: ResultsDashboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heatmapOpacity = 0.5;

  const severity    = result.severity ?? 'normal';
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
      {/* Severity */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4"
      >
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
              {severity === 'normal'   && 'Kulit dalam kondisi sangat baik dan sehat.'}
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
          <h3 className="font-headline text-xl font-semibold text-on-surface mb-4">Analisis Kondisi Kulit</h3>
          <div className="divide-y divide-surface-container">
            {result.features.map((feat) => (
              <div key={feat.name} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                <span className="text-sm font-medium text-on-surface-variant">{feat.name}</span>
                <span className="text-sm font-bold text-on-surface">{feat.description}</span>
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
        className="pt-2"
      >
        <button
          onClick={onReset}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary shadow-primary transition-all hover:opacity-90 active:scale-95 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Analisis Ulang
        </button>
      </motion.div>
    </motion.div>
  );
}
