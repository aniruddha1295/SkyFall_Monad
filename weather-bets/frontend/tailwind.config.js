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
      fontSize: {
        'display': ['4rem', { lineHeight: '1.1', fontWeight: '700' }],      // 64px
        'headline': ['2.75rem', { lineHeight: '1.2', fontWeight: '700' }],  // 44px
        'subheading': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }], // 20px
        'body': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],          // 16px
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],    // 12px
      },
      fontWeight: {
        normal: '400',
        semibold: '600',
        bold: '700',
        black: '900',
      },
    },
  },
  plugins: [],
};
