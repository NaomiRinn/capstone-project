/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ─── Clinical-Organic Harmony Design Tokens ───────────────────────
      colors: {
        // Surface Tokens
        surface: '#f7f9fb',
        'surface-dim': '#d8dadc',
        'surface-bright': '#f7f9fb',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f2f4f6',
        'surface-container': '#eceef0',
        'surface-container-high': '#e6e8ea',
        'surface-container-highest': '#e0e3e5',
        'on-surface': '#191c1e',
        'on-surface-variant': '#404943',
        'inverse-surface': '#2d3133',
        'inverse-on-surface': '#eff1f3',
        outline: '#707973',
        'outline-variant': '#bfc9c1',
        'surface-tint': '#2c694e',

        // Primary (Medicinal Green)
        primary: {
          DEFAULT: '#0f5238',
          container: '#2d6a4f',
          fixed: '#b1f0ce',
          'fixed-dim': '#95d4b3',
        },
        'on-primary': '#ffffff',
        'on-primary-container': '#a8e7c5',
        'inverse-primary': '#95d4b3',
        'on-primary-fixed': '#002114',
        'on-primary-fixed-variant': '#0e5138',

        // Secondary (Trust Blue)
        secondary: {
          DEFAULT: '#0060ac',
          container: '#68abff',
          fixed: '#d4e3ff',
          'fixed-dim': '#a4c9ff',
        },
        'on-secondary': '#ffffff',
        'on-secondary-container': '#003e73',
        'on-secondary-fixed': '#001c39',
        'on-secondary-fixed-variant': '#004883',

        // Tertiary (Soft Sage)
        tertiary: {
          DEFAULT: '#3a4e00',
          container: '#4e6800',
          fixed: '#ccf078',
          'fixed-dim': '#b0d360',
        },
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#c4e771',
        'on-tertiary-fixed': '#151f00',
        'on-tertiary-fixed-variant': '#394d00',

        // Error
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': '#ffffff',
        'on-error-container': '#93000a',

        // Background
        background: '#f7f9fb',
        'on-background': '#191c1e',
        'surface-variant': '#e0e3e5',
      },

      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },

      fontSize: {
        'headline-xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
      },

      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },

      spacing: {
        unit: '8px',
        gutter: '24px',
        'margin-mobile': '16px',
        'margin-desktop': '64px',
      },

      maxWidth: {
        container: '1280px',
      },

      boxShadow: {
        // Level 1: Cards - soft tinted with secondary blue
        card: '0 2px 8px 0 rgba(0,96,172,0.08), 0 1px 2px 0 rgba(0,96,172,0.04)',
        'card-hover': '0 8px 24px 0 rgba(0,96,172,0.12), 0 2px 6px 0 rgba(0,96,172,0.06)',
        // Level 2: Modals/AI glassmorphism
        glass: '0 8px 32px 0 rgba(15,82,56,0.12)',
        // Primary tinted
        primary: '0 4px 16px 0 rgba(15,82,56,0.24)',
        secondary: '0 4px 16px 0 rgba(0,96,172,0.24)',
      },

      backdropBlur: {
        glass: '12px',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'scan-pulse': 'scanPulse 2s ease-in-out infinite',
        'scan-line': 'scanLine 2.5s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
        'progress-gradient': 'progressGradient 2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scanPulse: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
        },
        scanLine: {
          '0%': { top: '0%', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        progressGradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },

      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0f5238 0%, #2d6a4f 100%)',
        'gradient-ai': 'linear-gradient(135deg, #0060ac 0%, #0f5238 100%)',
        'gradient-hero': 'linear-gradient(135deg, #f7f9fb 0%, #e8f5ef 50%, #f0f4ff 100%)',
        shimmer: 'linear-gradient(90deg, #e0e3e5 25%, #f2f4f6 50%, #e0e3e5 75%)',
      },
    },
  },
  plugins: [],
};
