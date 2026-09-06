/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg0: '#070611',
        bg1: '#0b0a12',
        ink: 'rgba(255, 255, 255, 0.92)',
        muted: 'rgba(255, 255, 255, 0.68)',
        faint: 'rgba(255, 255, 255, 0.10)',
        stroke: 'rgba(255, 255, 255, 0.14)',
        accent1: '#b56cff',
        accent2: '#4c7dff',
        accent3: '#0ea5e9',
        warn: '#f59e0b',
        danger: '#ef4444',
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
      },
      boxShadow: {
        'glass-lg': '0 26px 80px rgba(0,0,0,0.45)',
        'glass-md': '0 14px 40px rgba(0,0,0,0.35)',
        'glass-sm': '0 10px 26px rgba(0,0,0,0.24)',
      },
      borderRadius: {
        'glass-lg': '22px',
        'glass-md': '16px',
        'glass-sm': '12px',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
