import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { rubik: ['Rubik', 'sans-serif'] },
      colors: {
        bg: '#FAFAF7',
        surface: '#FFFFFF',
        ink: '#1F2A37',
        'ink-soft': '#6B7480',
        border: '#E7E2D7',
        green: { DEFAULT: '#2F9E58', soft: '#DCF0E2' },
        teal: { DEFAULT: '#2F8F82', soft: '#DCEFEA' },
        indigo: { DEFAULT: '#5A5FCB', soft: '#E4E4F8' },
        red: { DEFAULT: '#D14343', soft: '#F8DCDC' },
        'gray-chip': '#C9CDD3',
      },
      borderRadius: { card: '14px' },
    },
  },
  plugins: [],
}
export default config
