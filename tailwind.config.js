/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'flash-green': 'flash-green 0.6s ease-out',
        'flash-red': 'flash-red 0.6s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'flash-green': {
          '0%': { backgroundColor: '#10b981', transform: 'scale(1)' },
          '50%': { backgroundColor: '#34d399', transform: 'scale(1.02)' },
          '100%': { backgroundColor: 'transparent', transform: 'scale(1)' },
        },
        'flash-red': {
          '0%': { backgroundColor: '#ef4444', transform: 'scale(1)' },
          '50%': { backgroundColor: '#f87171', transform: 'scale(1.02)' },
          '100%': { backgroundColor: 'transparent', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark'],
  },
};