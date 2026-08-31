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
        background: '#0B0F19',
        surface: '#121826',
        'surface-elevated': '#1F2937',
        'surface-highlight': '#2A3649',
        'border-industrial': '#374151',
        'primary-coal': '#F59E0B',
        'primary-emerald': '#10B981',
        'primary-cyan': '#06B6D4',
        'status-critical': '#EF4444',
        'status-high': '#F97316',
        'status-medium': '#EAB308',
        'status-low': '#10B981',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
