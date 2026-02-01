/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        surface: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
        },
        accent: {
          gold: '#f59e0b',
          teal: '#14b8a6',
        },
      },
      animation: {
        'path-draw': 'path-draw 2s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'fade-in-up-fast': 'fade-in-up 0.25s ease-out forwards',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'slide-right': 'slide-right 1.5s ease-in-out infinite',
        'slide-left': 'slide-left 1.5s ease-in-out infinite',
      },
      keyframes: {
        'path-draw': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'slide-right': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(4px)' },
        },
        'slide-left': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-4px)' },
        },
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(at 40% 20%, rgba(14, 165, 233, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(245, 158, 11, 0.08) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(20, 184, 166, 0.06) 0px, transparent 50%)',
      },
    },
  },
  plugins: [],
};
