import { useState } from 'react';
import { Shield, Cpu, Lock } from 'lucide-react';

interface ConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function ConsentModal({ onAccept, onDecline }: ConsentModalProps) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-on-surface/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md glass rounded-2xl shadow-glass animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-headline text-headline-md text-on-surface">Persetujuan Analisis AI</h2>
              <p className="text-label-sm text-on-surface-variant">Privasi Anda adalah prioritas kami</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Privacy points */}
          {[
            { icon: Lock, title: 'Privasi Terjamin', desc: 'Gambar kulit Anda diproses sepenuhnya di perangkat ini. Tidak ada data yang dikirim ke server kami.' },
            { icon: Cpu, title: 'AI On-Device', desc: 'Model AI berjalan langsung di browser Anda menggunakan TensorFlow.js. Koneksi internet tidak diperlukan saat analisis.' },
            { icon: Shield, title: 'Bukan Diagnosis Medis', desc: 'Hasil analisis bersifat indikatif. Kami sangat menyarankan konsultasi dengan dokter kulit untuk diagnosis akurat.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3 rounded-xl bg-surface-container p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-label-md font-semibold text-on-surface">{title}</p>
                <p className="text-label-sm text-on-surface-variant mt-0.5">{desc}</p>
              </div>
            </div>
          ))}

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${checked ? 'bg-primary border-primary' : 'border-outline-variant group-hover:border-primary'}`}>
              {checked && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="sr-only" />
            <p className="text-label-md text-on-surface-variant">
              Saya memahami bahwa ini bukan pengganti diagnosis medis profesional dan menyetujui{' '}
              <a href="#" className="text-primary underline">Kebijakan Privasi</a> AUVRA.
            </p>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onDecline}
              className="flex-1 rounded-xl border border-outline py-3 text-label-md font-medium text-on-surface transition hover:bg-surface-container"
            >
              Batalkan
            </button>
            <button
              onClick={onAccept}
              disabled={!checked}
              className="flex-1 rounded-xl bg-primary py-3 text-label-md font-semibold text-on-primary shadow-primary transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Setuju & Mulai
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
