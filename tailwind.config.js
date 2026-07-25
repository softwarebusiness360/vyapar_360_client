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
        // Themeable via CSS variables — swap at :root vs [data-theme="light"]
        bg: {
          base: "hsl(var(--bg-base) / <alpha-value>)",
          surface: "hsl(var(--bg-surface) / <alpha-value>)",
          elevated: "hsl(var(--bg-elevated) / <alpha-value>)",
        },
        line: "hsl(var(--line) / <alpha-value>)",
        ink: {
          primary: "hsl(var(--ink-primary) / <alpha-value>)",
          secondary: "hsl(var(--ink-secondary) / <alpha-value>)",
          muted: "hsl(var(--ink-muted) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "hsl(var(--brand) / <alpha-value>)",
          hover: "hsl(var(--brand-hover) / <alpha-value>)",
          soft: "hsl(var(--brand) / 0.12)",
        },
        // Static accent colors — same across both themes
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
        glow: "0 8px 40px -12px hsl(var(--brand) / 0.35)",
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
