/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        surface:      { DEFAULT: '#faf8ff', dark: '#0b0b11' },
        card:         { DEFAULT: '#ffffff', dark: '#111118' },
        brand: {
          purple: '#a855f7',
          violet: '#7c3aed',
          indigo: '#6366f1',
          pink:   '#ec4899',
        },
        whatsapp: {
          light: '#DCF8C6',
          dark:  '#075E54',
          teal:  '#128C7E',
          blue:  '#34B7F1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.05), 0 20px 48px rgba(0,0,0,0.1)',
        'purple':     '0 8px 32px rgba(168,85,247,0.2)',
        'purple-lg':  '0 16px 48px rgba(168,85,247,0.3)',
        'soft':       '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'glow':       '0 0 40px rgba(168,85,247,0.15)',
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'float-delay':  'float 6s ease-in-out 2s infinite',
        'float-slow':   'float 8s ease-in-out infinite',
        'pulse-slow':   'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'gradient':     'gradient 8s linear infinite',
        'shimmer':      'shimmer 2.5s linear infinite',
        'slide-up':     'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':      'fadeIn 0.5s ease forwards',
        'scale-in':     'scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'spin-slow':    'spin 8s linear infinite',
        'bounce-slow':  'bounce 3s infinite',
        'marquee':      'marquee 25s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        gradient: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
}