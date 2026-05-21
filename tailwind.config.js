/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ph: {
          blue: '#0038A8',
          red: '#CE1126',
          yellow: '#FCD116',
          white: '#FFFFFF',
        },
        ink: '#0A0A0F',
        paper: '#F5F3EE',
        muted: '#6B6B78',
        border: '#E2DDD5',
      },
      fontFamily: {
        headline: ['var(--font-headline)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'count-up': 'countUp 0.3s ease-out forwards',
        'bar-grow': 'barGrow 0.8s ease-out forwards',
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        barGrow: { from: { width: '0%' }, to: { width: 'var(--bar-width)' } },
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(206,17,38,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(206,17,38,0)' },
        },
      },
    },
  },
  plugins: [],
}
