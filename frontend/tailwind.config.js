/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#effefa',
          100: '#c8fff2',
          200: '#91fee6',
          300: '#53f0d6',
          400: '#20d9c1',
          500: '#08bea8',
          600: '#039a8a',
          700: '#077b6f',
          800: '#0b615a',
          900: '#0e504b',
          950: '#013130',
        },
        accent: {
          50:  '#fff9eb',
          100: '#ffefc6',
          200: '#ffdc88',
          300: '#ffc44a',
          400: '#ffad20',
          500: '#f98c07',
          600: '#dd6602',
          700: '#b74506',
          800: '#94350c',
          900: '#7a2c0d',
        },
        surface: {
          50:  '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          850: '#1a2f45',
          900: '#102a43',
          950: '#0a1929',
        },
        verdict: {
          ac:      '#34d399',
          wa:      '#f87171',
          tle:     '#fbbf24',
          re:      '#fb923c',
          ce:      '#9ca3af',
          pending: '#60a5fa',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        sans:    ['Source Sans 3', 'system-ui', 'sans-serif'],
        mono:    ['Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'page-title': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700', letterSpacing: '-0.02em' }],
        'section':    ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600', letterSpacing: '-0.01em' }],
      },
      animation: {
        'fade-in':        'fadeIn 0.35s ease-out',
        'slide-up':       'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-right': 'slideInRight 0.35s ease-out',
        'pulse-soft':     'pulseSoft 2s ease-in-out infinite',
        'shimmer':        'shimmer 2s linear infinite',
        'scale-in':       'scaleIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'grid-pattern': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 40L40 0' stroke='%23ffffff' stroke-opacity='0.03' stroke-width='1'/%3E%3C/svg%3E")`,
        'dot-pattern': `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23ffffff' fill-opacity='0.04'/%3E%3C/svg%3E")`,
      },
      boxShadow: {
        'glow-primary': '0 0 20px -5px rgba(8, 190, 168, 0.3)',
        'glow-accent':  '0 0 20px -5px rgba(249, 140, 7, 0.3)',
        'card':         '0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.15)',
        'card-hover':   '0 4px 12px rgba(0,0,0,0.3), 0 16px 40px rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
}
