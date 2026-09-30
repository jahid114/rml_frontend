/** @type {import('tailwindcss').Config} */
const brandPrimary = '#1B2A4A';
const brandAccent = '#C1622B';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          50: '#f0f6f5',
          100: '#dcebe9',
          200: '#bdd6d3',
          300: '#97bab7',
          400: '#6c9894',
          500: '#477974',
          600: '#2b5e5b',
          700: '#123F3F',
          800: '#0f3433',
          900: '#0b2928',
          950: '#071d1c',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          50: '#fdf4ee',
          100: '#fae1d2',
          200: '#f4bf9f',
          300: '#ed9870',
          400: '#e27445',
          500: '#C55A2A',
          600: '#aa4820',
          700: '#88381b',
          800: '#6b2e1a',
          900: '#522618',
        },
        gold: 'var(--color-gold, #EDB95E)',
        canvas: 'var(--color-canvas, #FAF7F2)',
        surface: 'var(--color-surface, #FFFFFF)',
        ink: {
          DEFAULT: 'var(--color-ink, #1F2328)',
          soft: 'var(--color-ink-soft, #3a3f47)',
          muted: 'var(--color-ink-muted, #6b7280)',
        },
        line: 'var(--color-line, #e6dfd4)',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // modular scale 1.25, base 16/18
        xs: ['0.8rem', { lineHeight: '1.6' }],
        sm: ['0.9rem', { lineHeight: '1.6' }],
        base: ['1.125rem', { lineHeight: '1.7' }],
        lg: ['1.375rem', { lineHeight: '1.5' }],
        xl: ['1.75rem', { lineHeight: '1.3' }],
        '2xl': ['2.25rem', { lineHeight: '1.2' }],
        '3xl': ['2.75rem', { lineHeight: '1.15' }],
        '4xl': ['3.5rem', { lineHeight: '1.1' }],
      },
      maxWidth: {
        content: '1280px',
        prose: '720px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.06)',
        cardhover: '0 4px 8px rgba(27,42,74,0.08), 0 12px 32px rgba(27,42,74,0.12)',
      },
      borderRadius: {
        card: '0.75rem',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'rise-in': 'rise-in 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};
