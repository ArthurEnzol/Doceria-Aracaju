/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          primary: '#FF1493',
          light: '#FF69B4',
          dark: '#C71585',
          pale: '#FFB6C1',
        },
        gold: {
          primary: '#D4AF37',
          light: '#F4E4BC',
          dark: '#B8860B',
        },
        rose: {
          bg: '#FFF0F5',
          soft: '#FFE4E1',
        },
        gourmet: {
          text: '#2D1B2E',
          muted: 'rgba(45, 27, 46, 0.65)',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'gourmet': '20px',
        'pill': '50px',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(255, 20, 147, 0.3), 0 0 24px rgba(255, 20, 147, 0.15)',
        'glow-md': '0 0 20px rgba(255, 20, 147, 0.4), 0 0 40px rgba(255, 20, 147, 0.2), 0 0 60px rgba(212, 175, 55, 0.15)',
        'glow-lg': '0 4px 60px rgba(255, 20, 147, 0.25), 0 0 100px rgba(212, 175, 55, 0.15)',
        'gold': '0 0 20px rgba(212, 175, 55, 0.4), 0 0 40px rgba(212, 175, 55, 0.2)',
      },
      backdropBlur: {
        'gourmet': '20px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 20, 147, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 20, 147, 0.5), 0 0 60px rgba(212, 175, 55, 0.2)' },
        },
      },
    },
  },
  plugins: [],
}
