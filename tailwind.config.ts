import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 80px rgba(0, 0, 0, 0.45)',
      },
      colors: {
        ink: '#090b10',
        mist: '#cfd6e4',
        aurora: '#8ee7d7',
        glacier: '#91b7ff',
      },
    },
  },
  plugins: [],
} satisfies Config;
