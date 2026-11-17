/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#0B0E1E',
          900: '#10152B',
          800: '#181F3E',
          700: '#242D54',
          600: '#323E70',
        },
        brand: {
          50: '#F0EFFF',
          100: '#E2E0FF',
          200: '#C7C2FE',
          300: '#A49CFD',
          400: '#7F72FA',
          500: '#5546E8', // Electric purple
          600: '#4736D9',
          700: '#3928BD',
          800: '#2E2099',
          900: '#24197D',
        },
        cyan: {
          50: '#E6FAF9',
          100: '#CCF5F4',
          400: '#24D1DE',
          500: '#12B8C9', // Requested Cyan
          600: '#0E9AA9',
          700: '#0B7A87',
        },
        canvas: '#F5F6FC', // Soft background
      },
      boxShadow: {
        'soft-sm': '0 1px 3px rgba(16, 21, 43, 0.05)',
        'soft': '0 4px 20px -2px rgba(16, 21, 43, 0.06)',
        'soft-lg': '0 10px 30px -4px rgba(16, 21, 43, 0.08), 0 4px 12px -2px rgba(16, 21, 43, 0.03)',
        'brand': '0 8px 25px -4px rgba(85, 70, 232, 0.35)',
        'cyan': '0 8px 25px -4px rgba(18, 184, 201, 0.35)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at 50% 0%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.75))',
      }
    },
  },
  plugins: [],
}
