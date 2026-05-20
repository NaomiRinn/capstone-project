import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // Brotli + Gzip compression for production builds
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),

    // PWA for offline capability
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'AUVRA - AI Skin Analysis',
        short_name: 'AUVRA',
        description: 'AI-powered skin analysis platform running entirely in your browser',
        theme_color: '#0f5238',
        background_color: '#f7f9fb',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /\/api\/v1\/scans\/.+/,
            handler: 'CacheFirst',
            options: { cacheName: 'scan-results-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 } },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        // ManualChunks must be a function in Rollup v4
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@tanstack')) return 'vendor-query';
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/lucide-react')) return 'vendor-ui';
          if (id.includes('node_modules/axios') || id.includes('node_modules/zod')) return 'vendor-network';
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },

  worker: { format: 'es' },

  server: { port: 5173 },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});


