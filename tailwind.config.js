/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: {
            50:  '#f0f7f0',
            100: '#d9ecd9',
            200: '#b3d9b3',
            300: '#7ec07e',
            400: '#4da54d',
            500: '#2d7d2d',
            600: '#1e5c1e',
            700: '#164516',
            800: '#0f300f',
            900: '#081a08',
          },
          gold: {
            50:  '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#d4a017',
            600: '#b7860e',
            700: '#926b09',
            800: '#6b4e06',
            900: '#433103',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'grain-fall': 'grainFall 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        grainFall: {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
