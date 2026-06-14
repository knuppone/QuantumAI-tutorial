/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        q: {
          bg:      '#060b18',
          panel:   '#0d1424',
          card:    '#101929',
          border:  '#1a2744',
          border2: '#243557',
          muted:   '#374151',
          dim:     '#1e2d45',
          indigo:  '#6366f1',
          violet:  '#7c3aed',
          cyan:    '#22d3ee',
          emerald: '#10b981',
          amber:   '#f59e0b',
          rose:    '#f43f5e',
          text:    '#e2e8f0',
          sub:     '#94a3b8',
          faint:   '#475569',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.15), transparent)',
      },
      boxShadow: {
        'glow-sm':  '0 0 12px rgba(99,102,241,0.4)',
        'glow-md':  '0 0 24px rgba(99,102,241,0.35), 0 0 60px rgba(99,102,241,0.1)',
        'glow-lg':  '0 0 40px rgba(99,102,241,0.4), 0 0 100px rgba(99,102,241,0.15)',
        'card':     '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}
