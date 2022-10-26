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
      animation: {
        'reveal': 'revealAnim 3s',
        'conceal': 'concealAnim 3s'
      }
    },
  },
  plugins: [],
}
