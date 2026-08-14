/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rathinam: {
          navy: '#0A2540',
          dark: '#061727',
          card: '#0F2D4A',
          border: '#1E3A5F',
          gold: '#D4AF37',
          goldLight: '#F3E5AB',
          teal: '#008080',
          tealDark: '#005C5C',
          accent: '#38BDF8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Hanken Grotesk', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
