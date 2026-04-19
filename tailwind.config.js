/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter:   ['Inter', 'sans-serif'],
      },
      colors: {
        admin: { DEFAULT: '#8B5CF6', light: '#EDE9FE', dark: '#6D28D9' },
        teacher: { DEFAULT: '#3B82F6', light: '#DBEAFE', dark: '#1D4ED8' },
        parent: { DEFAULT: '#10B981', light: '#D1FAE5', dark: '#047857' },
        student: { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#B45309' },
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'counter': 'counter 1s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
