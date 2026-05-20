import { useEffect, useState } from 'react';
import { Cpu, Eye, BarChart2, FileText, CheckCircle, Loader2 } from 'lucide-react';

interface AnalysisLoaderProps {
  currentStage: string;
  progress: number;
}

const STAGES = [
  { icon: Eye, label: 'Menginisialisasi model AI', threshold: 0 },
  { icon: Cpu, label: 'Memproses gambar', threshold: 15 },
  { icon: Eye, label: 'Mendeteksi area kulit', threshold: 30 },
  { icon: BarChart2, label: 'Mengekstrak fitur kulit', threshold: 55 },
  { icon: BarChart2, label: 'Mengklasifikasikan kondisi', threshold: 80 },
  { icon: FileText, label: 'Menyusun laporan analisis', threshold: 95 },
];

export function AnalysisLoader({ currentStage, progress }: AnalysisLoaderProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    const target = progress;
    let frame: number;
    const step = () => {
      setDisplayProgress((prev) => {
        if (prev >= target) return prev;
        const next = Math.min(prev + 1.5, target);
        if (next < target) frame = requestAnimationFrame(step);
        return next;
      });
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [progress]);

  const activeIdx = STAGES.reduce(
    (last, s, i) => (displayProgress >= s.threshold ? i : last),
    0,
  );


  return (
    <div className="flex flex-col items-center py-12 px-6 animate-fade-in">
      {/* Animated scan circle */}
      <div className="relative mb-10">
        {/* Outer ring */}
        <div className="h-40 w-40 rounded-full border-2 border-primary/20 flex items-center justify-center animate-scan-pulse">
          {/* Middle ring */}
          <div className="h-28 w-28 rounded-full border-2 border-secondary/30 flex items-center justify-center">
            {/* Inner core */}
            <div className="h-20 w-20 rounded-full bg-gradient-ai flex items-center justify-center shadow-secondary">
              <Cpu className="h-9 w-9 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* SVG Progress Ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          width="160"
          height="160"
          viewBox="0 0 160 160"
        >
          <circle cx="80" cy="80" r="76" fill="none" stroke="#e0e3e5" strokeWidth="4" />
          <circle
            cx="80"
            cy="80"
            r="76"
            fill="none"
            stroke="url(#aiGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 76}`}
            strokeDashoffset={`${2 * Math.PI * 76 * (1 - displayProgress / 100)}`}
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0060ac" />
              <stop offset="100%" stopColor="#0f5238" />
            </linearGradient>
          </defs>
        </svg>

        {/* Percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-headline text-headline-md text-on-surface">
            {Math.round(displayProgress)}%
          </span>
        </div>
      </div>

      {/* Current stage text */}
      <h3 className="font-headline text-headline-md text-on-surface mb-1 text-center">
        Menganalisis Kulit Anda
      </h3>
      <p className="text-body-md text-on-surface-variant mb-8 text-center animate-pulse">
        {currentStage}
      </p>

      {/* Stage step tracker */}
      <div className="w-full max-w-sm space-y-2">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const done = i < activeIdx;
          const active = i === activeIdx;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-300 ${
                active ? 'bg-secondary/10 text-secondary' : done ? 'text-primary/70' : 'text-on-surface-variant/40'
              }`}
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                done ? 'bg-primary text-on-primary' : active ? 'bg-secondary/20' : 'bg-surface-container'
              }`}>
                {done
                  ? <CheckCircle className="h-4 w-4" />
                  : active
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Icon className="h-3.5 w-3.5" />
                }
              </div>
              <span className={`text-label-md font-medium ${active ? 'font-semibold' : ''}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="mt-8 max-w-xs text-center text-label-sm text-on-surface-variant">
        Analisis berjalan sepenuhnya di perangkat Anda. Gambar tidak dikirim ke server.
      </p>
    </div>
  );
}
