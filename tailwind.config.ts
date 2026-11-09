import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        saffron: {
          50: "#fff9eb",
          100: "#feefc7",
          200: "#fddc8a",
          300: "#fcc44d",
          400: "#f9aa1d",
          500: "#f08d08",
          600: "#d46b04",
          700: "#a94a06",
          800: "#893a0d",
          900: "#71300e",
        },
        charcoal: {
          800: "#1f2227",
          850: "#181a1e",
          900: "#121316",
          950: "#0b0c0e",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
