import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0A0A0A',
          dark: '#171717',
          orange: '#F97316',
        },
      },
    },
  },
  plugins: [],
}

export default config
