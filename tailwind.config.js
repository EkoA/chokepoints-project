/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        paper: '#f4f0e8',
        paper2: '#ece7dc',
        paper3: '#e2dbd0',
        ink: '#1e1a14',
        ink2: '#4a4030',
        ink3: '#8a7a65',
        rule: '#d8d0c0',
      },
    },
  },
  plugins: [],
}

