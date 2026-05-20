import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoImage from '@/assets/logo.png';
import { Sparkles, Shield, Cpu, Leaf, ChevronRight, Activity, Star, Lock, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: Cpu,
    title: 'AI On-Device',
    description: 'Model analisis berjalan sepenuhnya di browser Anda. Tidak ada gambar yang meninggalkan perangkat Anda.',
    accent: 'bg-secondary/10 text-secondary',
    glow: 'rgba(0,96,172,0.15)',
  },
  {
    icon: Shield,
    title: 'Privasi Mutlak',
    description: 'Web Crypto API mengenkripsi semua data lokal. Privasi kulit Anda adalah hak yang tidak dapat dikompromikan.',
    accent: 'bg-primary/10 text-primary',
    glow: 'rgba(15,82,56,0.15)',
  },
  {
    icon: Leaf,
    title: 'Rekomendasi Herbal',
    description: 'Saran berbasis bahan alami yang dipersonalisasi berdasarkan kondisi kulit unik Anda.',
    accent: 'bg-tertiary/10 text-tertiary',
    glow: 'rgba(58,78,0,0.15)',
  },
];

const STATS = [
  { value: '5+',   label: 'Parameter Kulit Dianalisis', icon: Activity },
  { value: '<2s',  label: 'Waktu Analisis On-Device',   icon: Zap },
  { value: '100%', label: 'Privasi Terjamin',           icon: Lock },
  { value: '0',    label: 'Data Dikirim ke Server',     icon: Shield },
];

const TESTIMONIALS = [
  { name: 'Ratna D.', role: 'Pengguna Aktif',       rating: 5, text: 'AUVRA sangat membantu. Hasil analisisnya detail dan rekomendasinya masuk akal secara medis.' },
  { name: 'Budi S.', role: 'Konsultan Kesehatan',   rating: 5, text: 'Impressive technology. Fakta bahwa semua proses terjadi di browser tanpa upload data adalah nilai jual yang luar biasa.' },
  { name: 'Sari A.', role: 'Beauty Enthusiast',     rating: 5, text: 'Fitur kamera langsung dan heatmap hasilnya sangat visual dan mudah dipahami!' },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ═══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute -top-16 right-1/4 h-[400px] w-[400px] rounded-full bg-secondary/8 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-primary/5 blur-[80px]" />
        </div>

        <div className="container-page relative">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 inline-flex items-center gap-2 rounded-full glass px-5 py-2 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary tracking-wider uppercase">AI On-Device · Privasi Terjamin</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-headline text-[clamp(38px,5.5vw,60px)] font-bold leading-[1.15] text-on-surface mb-6"
            >
              Analisis Kulit Presisi{' '}
              <span className="gradient-text-ai">Berbasis AI</span>{' '}
              di Browser Anda
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-on-surface-variant mb-10 max-w-xl leading-relaxed"
            >
              AUVRA menggunakan model kecerdasan buatan canggih yang berjalan sepenuhnya di perangkat Anda —
              tanpa upload, tanpa cloud, tanpa risiko privasi.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/analyze"
                className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-on-primary shadow-primary transition-all hover:shadow-lg hover:translate-y-[-2px] active:scale-95"
              >
                <Sparkles className="h-5 w-5" />
                Mulai Analisis Gratis
              </Link>
              <Link
                to="/history"
                className="flex items-center justify-center gap-2 rounded-2xl glass px-8 py-4 text-sm font-semibold text-primary transition-all hover:shadow-md hover:translate-y-[-2px]"
              >
                Lihat Demo Hasil
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Trust pills */}
            <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-in delay-300">
              {['🔒 Tanpa Upload', '⚡ Analisis < 2 Detik', '🌿 Rekomendasi Herbal', '📱 Mobile-Friendly'].map((tag) => (
                <span key={tag} className="rounded-full glass px-4 py-1.5 text-xs font-medium text-on-surface-variant shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Hero mock card */}
          <div className="mt-16 relative max-w-2xl mx-auto animate-slide-up delay-300">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-ai p-[2px] shadow-secondary">
              <div className="rounded-[22px] glass p-6 scan-overlay">
                <div className="flex gap-5">
                  <div className="w-36 h-36 shrink-0 rounded-2xl bg-linear-to-br from-surface-container to-surface-container-high flex items-center justify-center">
                    <Activity className="h-14 w-14 text-primary/25" />
                  </div>
                  <div className="flex-1 space-y-3 pt-1">
                    <div className="h-3.5 rounded-full bg-gradient-ai opacity-60 w-3/4" />
                    <div className="space-y-2.5">
                      {[70, 85, 45, 90].map((w, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-surface-container flex-1">
                            <div
                              className={`h-full rounded-full transition-all ${i === 2 ? 'bg-secondary' : 'bg-primary'}`}
                              style={{ width: `${w}%` }}
                            />
                          </div>
                          <span className="text-xs text-on-surface-variant w-7 text-right">{w}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <span className="severity-mild">Ringan</span>
                      <span className="rounded-full glass-primary px-3 py-0.5 text-xs font-semibold text-primary">Skor: 82</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating glass badges */}
            <div className="absolute -left-6 top-6 glass rounded-2xl px-4 py-2.5 shadow-glass animate-float">
              <p className="text-xs font-bold text-primary">🤖 AI On-Device</p>
              <p className="text-xs text-on-surface-variant">TensorFlow.js</p>
            </div>
            <div className="absolute -right-6 bottom-6 glass rounded-2xl px-4 py-2.5 shadow-glass animate-float delay-200">
              <p className="text-xs font-bold text-tertiary">🔒 Enkripsi AES-GCM</p>
              <p className="text-xs text-on-surface-variant">Web Crypto API</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═════════════════════════════════════════════════════════ */}
      <section className="py-14 bg-gradient-primary">
        <div className="container-page">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center group">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 group-hover:bg-white/20 transition-colors">
                  <Icon className="h-6 w-6 text-on-primary/80" />
                </div>
                <p className="font-headline text-[clamp(26px,3.5vw,38px)] font-bold text-on-primary">{value}</p>
                <p className="text-sm text-on-primary/70 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ══════════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="container-page">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Teknologi</p>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface mb-4">Teknologi di Balik AUVRA</h2>
            <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
              Menggabungkan kecanggihan AI modern dengan standar privasi medis tertinggi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, accent, glow }) => (
              <div
                key={title}
                className="relative rounded-3xl glass p-7 shadow-card card-hover overflow-hidden"
              >
                {/* Glow bg */}
                <div
                  className="absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl opacity-60 pointer-events-none"
                  style={{ background: glow }}
                />
                <div className={`relative mb-5 flex h-13 w-13 items-center justify-center rounded-2xl ${accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="relative font-headline text-xl font-bold text-on-surface mb-2">{title}</h3>
                <p className="relative text-sm text-on-surface-variant leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-surface">
        <div className="container-page">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Alur Kerja</p>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface">Cara Kerja AUVRA</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '📸', title: 'Upload / Foto', desc: 'Ambil foto kulit Anda langsung dengan kamera atau unggah dari galeri' },
              { step: '02', icon: '🤖', title: 'Analisis AI', desc: 'Model AI menganalisis 5+ parameter kulit secara on-device dalam hitungan detik' },
              { step: '03', icon: '📊', title: 'Lihat Hasil', desc: 'Dashboard visual lengkap dengan heatmap, skor detail, dan rekomendasi personal' },
            ].map(({ step, icon, title, desc }, i) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+40px)] right-[-50%] h-px bg-linear-to-r from-primary/30 to-transparent" />
                )}
                <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl glass shadow-glass text-4xl">
                  {icon}
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
                    {step}
                  </span>
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-2">{title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section className="py-24">
        <div className="container-page">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Testimoni</p>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface">Apa Kata Pengguna</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-3xl glass p-7 shadow-card card-hover">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-tertiary text-tertiary" />
                  ))}
                </div>
                <p className="text-base text-on-surface-variant mb-5 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-on-primary">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{t.name}</p>
                    <p className="text-xs text-on-surface-variant">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ════════════════════════════════════════════════════ */}
      <section className="py-20 px-4">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-primary px-8 py-16 text-center shadow-primary">
            {/* Decorative orbs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/8 blur-2xl" />
              <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-white/8 blur-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-96 rounded-full bg-secondary/15 blur-3xl" />
            </div>

            <div className="relative">
              <p className="text-sm font-semibold text-on-primary/60 uppercase tracking-widest mb-4">Gratis Selamanya</p>
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-primary mb-5">
                Mulai Analisis Kulit Anda Sekarang
              </h2>
              <p className="text-lg text-on-primary/80 mb-10 max-w-lg mx-auto leading-relaxed">
                Aman, privat, dan sepenuhnya berjalan di perangkat Anda. Tidak diperlukan akun atau koneksi internet.
              </p>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 text-sm font-bold text-primary shadow-xl transition-all hover:shadow-2xl hover:translate-y-[-2px] active:scale-95"
              >
                <Sparkles className="h-5 w-5" />
                Coba AUVRA Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer className="border-t border-outline-variant/50 py-10 glass">
        <div className="container-page flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="AUVRA Logo" 
              className="h-14 md:h-18 w-auto object-contain" 
            />
          </div>
          <p className="text-xs text-on-surface-variant text-center">
            © {new Date().getFullYear()} AUVRA. Bukan pengganti konsultasi medis profesional.
          </p>
          <div className="flex gap-5 text-xs text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors">Privasi</a>
            <a href="#" className="hover:text-primary transition-colors">Syarat Layanan</a>
            <a href="mailto:support@auvra.io" className="hover:text-primary transition-colors">Kontak</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
