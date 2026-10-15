/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        bench: {
          950: '#07090c',
          900: '#0d1117',
          850: '#121820',
          800: '#161d27',
          700: '#222b38',
          600: '#334052',
        },
        pcb: {
          DEFAULT: '#0f5132',
          dark: '#0a3a24',
          trace: '#c99a2e',
        },
      },
    },
  },
  plugins: [],
};
