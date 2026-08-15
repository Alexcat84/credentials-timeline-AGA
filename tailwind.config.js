/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Dark-only palette ported from accounting-pipeline (github.com/Alexcat84/accounting-pipeline).
        bg0: '#06080f',
        bg1: '#0b1220',
        bg2: '#101a2d',
        surface: {
          DEFAULT: 'rgba(13, 21, 35, 0.76)',
          elevated: 'rgba(19, 30, 50, 0.88)',
        },
        stroke: {
          DEFAULT: 'rgba(118, 157, 219, 0.24)',
          strong: 'rgba(107, 225, 255, 0.45)',
        },
        ink: {
          DEFAULT: '#eef3ff',
          secondary: '#aab8d4',
          muted: '#7e8ca8',
        },
        accent: {
          cyan: '#65ddff',
          teal: '#2dd4bf',
          gold: '#d6a348',
        },
        success: '#5be39f',
        danger: '#ff7f8a',
        warning: '#ffcc77',
      },
      boxShadow: {
        soft: '0 16px 50px rgba(1, 5, 18, 0.55)',
        glow: '0 0 0 1px rgba(101, 221, 255, 0.12), 0 0 30px rgba(34, 211, 238, 0.12)',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
