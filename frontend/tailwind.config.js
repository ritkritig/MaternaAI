/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#174C3C',
          light: '#236551',
          dark: '#0F3429',
          50: '#F2F7F5',
          100: '#E1EDE8',
        },
        sage: {
          DEFAULT: '#A9C7B3',
          light: '#CBE0D3',
          dark: '#85A992',
          muted: '#E6EFE9',
        },
        warmIvory: {
          DEFAULT: '#F8F7F2',
          card: '#FBFBF8',
          subtle: '#F1EFE8',
        },
        coral: {
          DEFAULT: '#E88D7D',
          light: '#F4B5AA',
          dark: '#D06E5C',
        },
        lavender: {
          DEFAULT: '#B8AED8',
          light: '#D7D1EC',
          dark: '#978AC2',
        },
        charcoal: {
          DEFAULT: '#202B29',
          light: '#364542',
          muted: '#77827D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(23, 76, 60, 0.05), 0 1px 2px 0 rgba(23, 76, 60, 0.03)',
        card: '0 4px 12px 0 rgba(23, 76, 60, 0.04), 0 1px 3px 0 rgba(23, 76, 60, 0.02)',
        float: '0 10px 25px -5px rgba(23, 76, 60, 0.08), 0 8px 10px -6px rgba(23, 76, 60, 0.03)',
      },
    },
  },
  plugins: [],
}
