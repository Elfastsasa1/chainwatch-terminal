/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08090d',
        panel: '#10131a',
        panel2: '#161a23',
        border: '#252a35',
        text: '#e8eaef',
        muted: '#6b7280',
        accent: '#7dd3fc',
        green: '#4ade80',
        red: '#f87171',
        amber: '#fbbf24',
        purple: '#c4b5fd',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
