/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // NASA Space Apps Brand Colors 
      colors: {
        nasa: {
          'electric-blue': '#0099FF',
          'deep-blue': '#003366',
          'light-blue': '#4DB8FF',
          'bright-blue': '#66CCFF',
          'rocket-red': '#FF4444',
          'neon-yellow': '#FFFF33',
          'bright-yellow': '#FFFF66',
          'dark-gray': '#1E1E1E',
          'medium-gray': '#6B7280',
          'light-gray': '#D1D5DB',
          'bright-white': '#FFFFFF',
        },
        flood: {
          low: '#22c55e',      // green
          medium: '#eab308',   // yellow
          high: '#ef4444',     // red
          critical: '#991b1b', // dark red
        },
      },
      // NASA Fonts
      fontFamily: {
        'nasa-heading': ['Fira Sans', 'Arial', 'sans-serif'],
        'nasa-body': ['Overpass', 'Arial', 'sans-serif'],
      },
      // NASA Gradients
      backgroundImage: {
        'nasa-gradient': 'linear-gradient(135deg, #0099FF 0%, #003366 100%)',
        'nasa-gradient-subtle': 'linear-gradient(135deg, rgba(0, 153, 255, 0.1) 0%, rgba(0, 51, 102, 0.05) 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
    },
  },
  plugins: [],
}
