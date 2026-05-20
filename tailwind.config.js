/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#0a1628',
          800: '#0f2040',
          700: '#1a3a6b',
          600: '#1e4d8c',
          500: '#2563eb',
          400: '#3b82f6',
          300: '#93c5fd',
        },
        surface: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
      },
    },
  },
  plugins: [],
};

