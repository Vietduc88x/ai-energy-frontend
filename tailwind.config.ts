import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ed',
          100: '#d5ecd2',
          200: '#a8d9a2',
          300: '#6fbf66',
          400: '#3da833',
          500: '#1a8a1a',
          600: '#136e14',
          700: '#0f5310',
          800: '#0a390b',
          900: '#052005',
        },
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
};

export default config;
