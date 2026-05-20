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
          50: '#f7f5fb',
          100: '#ede8f5',
          200: '#ddd2ef',
          300: '#c4b5e3',
          400: '#9b7fd4',
          500: '#7b52c9',
          600: '#582BB6',
          700: '#4a2499',
          800: '#3d1d7f',
          900: '#311766',
        },
        accent: {
          50: '#f7f5fb',
          100: '#ede8f5',
          200: '#ddd2ef',
          300: '#c4b5e3',
          400: '#9b7fd4',
          500: '#7b52c9',
          600: '#582BB6',
          700: '#4a2499',
          800: '#3d1d7f',
          900: '#311766',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(135deg, #582BB6 0%, #7B52C9 100%)',
        'femigrants-gradient': 'linear-gradient(135deg, #582BB6 0%, #7B52C9 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideUp': 'slideUp 0.4s ease-out',
        'slideDown': 'slideDown 0.4s ease-out',
        'scaleIn': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(88, 43, 182, 0.3)',
        'glow-lg': '0 0 30px rgba(88, 43, 182, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(88, 43, 182, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

