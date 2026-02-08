/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary casino blue
        primary: {
          DEFAULT: '#0057ff',
          hover: '#0045cc',
        },

        // Dark backgrounds
        bg: {
          DEFAULT: '#191919',
          surface: '#242424',
          hover: '#2e2e2e',
        },

        // Borders
        border: '#474747',

        // Keep YES/NO but align with casino theme
        yes: '#02cb00',
        no: '#d00d00',

        // Status colors
        success: '#02cb00',
        error: '#d00d00',
        warning: '#f97c00',

        // Light accents
        light: {
          DEFAULT: '#ffffff',
          grey: '#f9f9f9',
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
