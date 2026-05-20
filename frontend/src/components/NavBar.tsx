import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, Activity, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '@/assets/logo.png';

const NAV_ITEMS = [
  { path: '/',        label: 'Beranda',  icon: Sparkles },
  { path: '/analyze', label: 'Analisis', icon: Activity },
  { path: '/history', label: 'Riwayat',  icon: Clock    },
];

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass shadow-glass border-b border-white/50'
            : 'glass border-b border-white/30'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="container-page">
          <div className="flex h-16 md:h-20 items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img 
                src={logoImage} 
                alt="AUVRA Logo" 
                className="h-14 md:h-18 w-auto object-contain transition-transform group-hover:scale-[1.02]" 
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* CTA + Hamburger */}
            <div className="flex items-center gap-2">
              <Link
                to="/analyze"
                className="hidden sm:flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                Mulai Analisis
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex h-11 w-11 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container md:hidden transition-colors"
                aria-label="Toggle navigation"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobile}
            className="fixed inset-0 z-60 bg-on-surface/20 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-70 w-72 bg-white/95 backdrop-blur-md shadow-2xl p-6 md:hidden"
          >
            <div className="flex justify-end mb-6">
              <button onClick={closeMobile} className="p-2 text-on-surface-variant">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={closeMobile}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                );
              })}

              <div className="mt-4 pt-4 border-t border-outline-variant">
                <Link
                  to="/analyze"
                  onClick={closeMobile}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition-all hover:opacity-90"
                >
                  <Sparkles className="h-4 w-4" />
                  Mulai Analisis Sekarang
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
