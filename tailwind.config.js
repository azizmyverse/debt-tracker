/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#bdd0ff',
          300: '#90b0ff',
          400: '#5f87ff',
          500: '#3b62ff',
          600: '#2745f0',
          700: '#1f37cf',
          800: '#1d31a4',
          900: '#1d2f82',
          950: '#161e4d',
        },
        ink: {
          50: '#f7f8fa',
          100: '#eef0f4',
          200: '#dde2ea',
          300: '#bcc5d3',
          400: '#8b97aa',
          500: '#5d6b80',
          600: '#42506a',
          700: '#2f3b52',
          800: '#1c2438',
          900: '#101729',
          950: '#080d1c',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,23,41,0.04), 0 8px 24px rgba(16,23,41,0.06)',
        'soft-lg':
          '0 4px 12px rgba(16,23,41,0.06), 0 24px 48px -12px rgba(16,23,41,0.18)',
        glow: '0 0 0 1px rgba(59,98,255,0.2), 0 12px 32px -8px rgba(59,98,255,0.35)',
      },
      backgroundImage: {
        'grid-light':
          'radial-gradient(circle at 1px 1px, rgba(16,23,41,0.06) 1px, transparent 0)',
        'grid-dark':
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.96)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: 0, transform: 'translateX(16px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'scale-in': 'scale-in 0.18s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        shimmer: 'shimmer 1.5s linear infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
