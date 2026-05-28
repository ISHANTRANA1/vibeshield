/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: '#0a0a0f',
        surface: '#111118',
        border: '#1e1e2e',
        accent: '#00ff88',
        warn: '#ffaa00',
        danger: '#ff3366',
        muted: '#3a3a5c',
        text: '#e2e2f0',
        dim: '#888899',
      },
      animation: {
        'scan-line': 'scanLine 2s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s ease forwards',
        'shimmer': 'shimmer 1.5s infinite',
        'tick': 'tick 0.3s ease forwards',
      },
      keyframes: {
        scanLine: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,255,136,0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0,255,136,0.7)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        tick: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
