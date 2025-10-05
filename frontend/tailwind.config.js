/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        flood: {
          low: '#22c55e',      // green
          medium: '#eab308',   // yellow
          high: '#ef4444',     // red
          critical: '#991b1b', // dark red
        },
        // NASA Space Apps Challenge Brand Colors
        nasa: {
          'electric-blue': '#0099FF',
          'deep-blue': '#003366',
          'neon-yellow': '#FFFF00',
          'neon-yellow-bright': '#FFFF33',
          'neon-yellow-dark': '#CCCC00',
        },
      },
      fontFamily: {
        'nasa-heading': ['Fira Sans', 'system-ui', 'sans-serif'],
        'nasa-body': ['Overpass', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'nasa-gradient': 'linear-gradient(135deg, #003366 0%, #0099FF 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(0, 51, 102, 0.8) 0%, rgba(0, 153, 255, 0.2) 100%)',
        'orbital-gradient': 'radial-gradient(circle at center, rgba(0, 153, 255, 0.1) 0%, transparent 70%)',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'spin-slower': 'spin 30s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
