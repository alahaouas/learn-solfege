import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Note colors (Boomwhackers / Montessori international)
        note: {
          do: '#FF2121',    // C - Red
          re: '#FF8C00',    // D - Orange
          mi: '#FFD700',    // E - Yellow
          fa: '#00B050',    // F - Green
          sol: '#00B0F0',   // G - Light Blue
          la: '#7030A0',    // A - Purple
          si: '#FF69B4',    // B - Pink
        },
        // App theme
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        music: ['Bravura', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
