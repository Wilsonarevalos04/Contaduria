/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        navy: {
          50: '#f0f2fb',
          100: '#e1e5f8',
          200: '#c5cef2',
          300: '#99a8e9',
          400: '#687bde',
          500: '#4353d2',
          600: '#2d3abf',
          700: '#232673',
          800: '#171954',
          900: '#0E0F3D', // Azul Marino Oficial extraído del logo
          950: '#070822', // Fondo oscuro medianoche oficial
        },
        brand: {
          navy: '#0E0F3D',
          dark: '#070822',
          blue: '#1e40af',
          emerald: '#10b981',
          crimson: '#ef4444',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
