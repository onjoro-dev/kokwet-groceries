import type { Config } from "tailwindcss";

// KOKWET Groceries brand palette: green for trust & freshness, white for a clean
// grocery-store feel, orange used sparingly for prices, offers, and calls to action.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F1FAF3",
          100: "#DFF3E4",
          200: "#B8E4C4",
          300: "#8CD3A0",
          400: "#57B975",
          500: "#2F9C52",
          600: "#1F7F3F",
          700: "#186633",
          800: "#144F29",
          900: "#0F3A1E",
        },
        accent: {
          50: "#FFF4EA",
          100: "#FFE3C7",
          400: "#FF9F40",
          500: "#F5821F",
          600: "#DA6A0C",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 58, 30, 0.08), 0 1px 2px rgba(15, 58, 30, 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
