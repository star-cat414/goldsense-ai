import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8ecdff",
          400: "#59b0ff",
          500: "#3390ff",
          600: "#1d6ef4",
          700: "#1658e0",
          800: "#1948b5",
          900: "#1a3f8e",
        },
        accent: {
          50: "#f5f1ff",
          100: "#ede5ff",
          200: "#ddcfff",
          300: "#c4a8ff",
          400: "#a478fb",
          500: "#8b4df4",
          600: "#7a2ee9",
          700: "#6a20ce",
          800: "#591caa",
          900: "#4a198b",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.03), 0 8px 24px -8px rgb(15 23 42 / 0.06)",
        cardHover: "0 2px 4px 0 rgb(15 23 42 / 0.04), 0 16px 32px -12px rgb(15 23 42 / 0.12)",
        glow: "0 0 0 1px rgb(51 144 255 / 0.10), 0 12px 40px -12px rgb(51 144 255 / 0.35)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #3390ff 0%, #8b4df4 100%)",
        "gradient-soft": "linear-gradient(180deg, #fbfdff 0%, #f6f9ff 100%)",
        "gradient-hero": "radial-gradient(1200px 600px at 15% -10%, rgb(51 144 255 / 0.12), transparent 60%), radial-gradient(1000px 500px at 100% 0%, rgb(139 77 244 / 0.10), transparent 60%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out both",
        "slide-up": "slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
    },
  },
  plugins: [],
};

export default config;