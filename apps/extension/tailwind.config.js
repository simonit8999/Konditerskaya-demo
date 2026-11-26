/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Базовые пастельные тона
        cream: {
          DEFAULT: '#FFF8E1',
          50: '#FFFDF6',
          100: '#FFF8E1',
          200: '#F7EBCF',
          300: '#F0DFBA',
        },
        blush: {
          DEFAULT: '#FFD1DC',
          soft: '#FFEAF0',
          deep: '#F6A9BC',
        },
        mint: {
          DEFAULT: '#E0F2F1',
          soft: '#F2FAF9',
          deep: '#A9D6D2',
        },
        // Акценты
        gold: {
          DEFAULT: '#DAA520',
          light: '#E8BE55',
          dark: '#C68E17',
        },
        caramel: {
          DEFAULT: '#C68E17',
          dark: '#A9741A',
        },
        berry: {
          DEFAULT: '#DC143C',
          dark: '#B3123A',
        },
        // Текст
        ink: {
          DEFAULT: '#333333',
          soft: '#5C544E',
        },
        cocoa: {
          DEFAULT: '#5A3A3A',
          dark: '#3E2723',
        },
        line: {
          DEFAULT: '#EADCC3',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Open Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 40px -24px rgba(90, 58, 58, 0.45)',
        card: '0 10px 30px -18px rgba(90, 58, 58, 0.35)',
        gold: '0 12px 28px -14px rgba(218, 165, 32, 0.55)',
        innerLine: 'inset 0 0 0 1px #EADCC3',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        'hero-glow':
          'radial-gradient(circle at 18% 18%, rgba(255, 209, 220, 0.6), transparent 55%), radial-gradient(circle at 82% 4%, rgba(224, 242, 241, 0.7), transparent 52%), radial-gradient(circle at 60% 90%, rgba(218, 165, 32, 0.16), transparent 55%)',
        'gold-gradient': 'linear-gradient(135deg, #DAA520 0%, #C68E17 100%)',
        'gold-gradient-soft': 'linear-gradient(135deg, #E8BE55 0%, #DAA520 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-6px) rotate(2deg)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float-slow 11s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
