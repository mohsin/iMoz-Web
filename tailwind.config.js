/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./assets/**/*.css",
    "./components/*.{vue,js}",
    "./components/**/*.{vue,js}",
    "./pages/*.vue",
    "./pages/**/*.vue",
    "./layouts/*.vue",
    "./layouts/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./*.{vue,js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'whitesmoke': 'whitesmoke',
        'blacksmoke': '#1D1E20'
      },
      keyframes: {
        fadeInAnimation: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      },
      animation: {
        'fadein': 'fadeInAnimation 2s ease',
      }
    }
  },
  plugins: [],
}
