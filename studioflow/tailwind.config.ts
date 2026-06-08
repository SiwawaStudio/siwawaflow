import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#5C0029',
          light: '#f9eef3',
          mid: '#8a1040',
        },
        orange: {
          DEFAULT: '#E77728',
          light: '#fef3e8',
        },
        cream: {
          DEFAULT: '#F4EEE1',
          dark: '#e8deca',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
