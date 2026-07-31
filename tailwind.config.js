/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#161B33',
          50: '#EEEFF5',
          100: '#D6D8E6',
          200: '#ADB1CD',
          300: '#7D82AC',
          400: '#4C5182',
          500: '#2A2F5C',
          600: '#1F2447',
          700: '#161B33',
          800: '#101425',
          900: '#0A0D18',
        },
        marigold: {
          DEFAULT: '#F6A93C',
          50: '#FFF6E7',
          100: '#FEEACB',
          200: '#FCD494',
          300: '#FABE5D',
          400: '#F8AC48',
          500: '#F6A93C',
          600: '#E08C1B',
          700: '#B06C14',
        },
        vermillion: {
          DEFAULT: '#E1512E',
          50: '#FDECE7',
          100: '#FAD3C7',
          200: '#F3A188',
          300: '#EC7057',
          400: '#E66540',
          500: '#E1512E',
          600: '#BD3D1F',
          700: '#8F2E17',
        },
        teal: {
          DEFAULT: '#1C9C88',
          50: '#E5F7F4',
          100: '#C0EBE3',
          400: '#2AB39D',
          500: '#1C9C88',
          600: '#157A6A',
          700: '#0F5B4F',
        },
        cream: {
          DEFAULT: '#FDF8F0',
          100: '#FFFFFF',
          200: '#FDF8F0',
          300: '#F7EEDD',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Manrope"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        tamil: ['"Noto Sans Tamil"', '"Manrope"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'kolam-dots': 'radial-gradient(currentColor 1.5px, transparent 1.5px)',
      },
      boxShadow: {
        soft: '0 2px 10px -2px rgba(22, 27, 51, 0.08), 0 1px 3px -1px rgba(22, 27, 51, 0.06)',
        card: '0 8px 30px -8px rgba(22, 27, 51, 0.14)',
        glow: '0 0 0 1px rgba(246, 169, 60, 0.35), 0 8px 24px -6px rgba(246, 169, 60, 0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
