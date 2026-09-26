/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        terracota: {
          DEFAULT: '#B5623B',
          dark: '#8E4A2C',
          light: '#C97A52',
        },
        creme: '#F7F1E6',
        bege: '#EFE1CC',
        marrom: {
          DEFAULT: '#4A2F22',
          escuro: '#2E1D14',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
