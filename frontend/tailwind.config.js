/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space': {
          'dark': '#0B1426',
          'blue': '#1e3a8a',
          'purple': '#6366F1',
          'orange': '#F59E0B',
          'green': '#10B981',
          'yellow': '#EAB308',
          'red': '#EF4444',
        },
        'cosmic': {
          'purple': '#6366F1',
          'dark': '#0B1426',
        },
        'solar': {
          'orange': '#F59E0B',
        },
        'aurora': {
          'green': '#10B981',
        },
        'stellar': {
          'yellow': '#EAB308',
        },
        'mars': {
          'red': '#EF4444',
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'source': ['Source Sans Pro', 'sans-serif'],
        'fira': ['Fira Code', 'monospace'],
      },
      backgroundImage: {
        'space-gradient': 'linear-gradient(135deg, #0B1426 0%, #1e3a8a 50%, #6366F1 100%)',
        'cosmic-gradient': 'radial-gradient(ellipse at center, #6366F1 0%, #0B1426 70%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        twinkle: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}