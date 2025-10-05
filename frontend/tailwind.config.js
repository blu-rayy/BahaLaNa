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
      },
    },
  },
  plugins: [],
}
