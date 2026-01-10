/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{html,js,svelte,md,svx}'],
  plugins: [require('@tailwindcss/typography')],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      backgroundImage: {
        'custom-background': "url('/background.jpg')"
        // Add other custom wallpapers here
      },
      colors: {
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
          DEFAULT: 'var(--primary-500)'
        },
        secondary: 'var(--secondary-color)',
        accent: 'var(--accent-color)',
        foreground: 'var(--text-color)',
        background: 'var(--bg-color)',
        border: 'var(--border-color)'
      }
    }
  }
}

module.exports = config
