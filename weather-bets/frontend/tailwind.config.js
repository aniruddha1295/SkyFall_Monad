/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: "#0a0a0f", surface: "#14141f", hover: "#1e1e2e" },
        border: { DEFAULT: "#2a2a3a" },
        brand: { DEFAULT: "#8b5cf6", hover: "#a78bfa" },
        yes: "#22c55e",
        no: "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
