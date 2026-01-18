/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#0b0d17',
          800: '#151932',
          700: '#1f2544',
          600: '#2a3158',
          500: '#3e497a',
          400: '#55629b',
          300: '#717ebd',
          200: '#919bcf',
          100: '#b4bce0',
          50: '#dbe0f2',
        },
        brand: {
          yellow: '#FFD700',
          orange: '#FF8C00',
          teal: '#00CED1',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'], // We'll add this font later
      },
      backgroundImage: {
        'stars': "url('/stars-bg.svg')", // We'll need to create or find this
      }
    },
  },
  plugins: [],
}
