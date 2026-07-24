/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ['"Outfit"', "system-ui", "sans-serif"],
        sans: ['"Manrope"', "system-ui", "sans-serif"],
      },
      colors: {
        bg: {
          base: "#0a0a0c",
          surface: "#141417",
          elevated: "#1c1c21",
        },
        line: "#27272a",
        ink: {
          primary: "#f3f4f6",
          secondary: "#a1a1aa",
          muted: "#71717a",
        },
        brand: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          soft: "rgba(99,102,241,0.12)",
        },
        restaurant: "#f97316",
        salon: "#f59e0b",
        success: "#10b981",
        danger: "#ef4444",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
      },
      boxShadow: {
        glow: "0 8px 40px -12px rgba(99,102,241,0.35)",
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
