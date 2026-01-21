/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: 'var(--space-950)',
          900: 'var(--space-900)',
          800: 'var(--space-800)',
          700: 'var(--space-700)',
          600: 'var(--space-600)',
        },
        nebula: {
          500: 'var(--nebula-500)',
          400: 'var(--nebula-400)',
          glow: 'var(--nebula-glow)',
        },
        starlight: {
          100: 'var(--starlight-100)',
          200: 'var(--starlight-200)',
          400: 'var(--starlight-400)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        // Gradient might be tricky with vars, disabling for now or making it dynamic?
        // Let's replace fixed gradient with a utility-friendly one or just remove specific hardcoded gradient usage if not critical,
        // or rely on bg-space-950/900 classes.
        // I will map it to use variables too.
        'space-gradient': 'radial-gradient(circle at center, var(--space-800) 0%, var(--space-900) 100%)',
      }
    },
  },
  plugins: [],
}
