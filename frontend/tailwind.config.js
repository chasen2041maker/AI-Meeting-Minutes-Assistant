/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bone: '#F0EBE5',
        dark: '#121212',
        slate: {
          900: '#0f172a',
        },
        white: '#f8f9fa',
      },
      fontFamily: {
        heading: ['"Noto Sans SC"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        body: ['"Noto Serif SC"', 'Georgia', '"Times New Roman"', 'serif'],
      },
      fontSize: {
        'xs': ['0.875rem', { lineHeight: '1.25rem' }],
        'sm': ['1rem', { lineHeight: '1.5rem' }],
        'base': ['1.125rem', { lineHeight: '1.75rem' }],
        'lg': ['1.25rem', { lineHeight: '1.75rem' }],
        'xl': ['1.5rem', { lineHeight: '2rem' }],
        '2xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '3xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '4xl': ['3rem', { lineHeight: '1' }],
        '5xl': ['3.75rem', { lineHeight: '1' }],
      },
      container: {
        center: true,
        padding: '1.5rem',
        screens: {
          '2xl': '1400px',
        },
      },
    },
  },
  plugins: [],
}
