import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lobster: {
          50: '#fef2f2',
          100: '#fde6e6',
          200: '#fbd0d0',
          300: '#f7a9a9',
          400: '#f17878',
          500: '#e64d4d',
          600: '#d32f2f',
          700: '#b22222',
          800: '#941f1f',
          900: '#7a1f1f',
          950: '#420c0c',
        },
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        sand: {
          50: '#fdfcf9',
          100: '#faf8f2',
          200: '#f5f0e5',
          300: '#ede4d3',
          400: '#e3d5bb',
          500: '#d4bc9a',
          600: '#c4a47a',
          700: '#a8855f',
          800: '#8b6f4e',
          900: '#735b42',
          950: '#3d2f22',
        },
      },
    },
  },
  plugins: [],
};

export default config;
