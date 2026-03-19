/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-display)", "serif"],
      },
      colors: {
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
          sunken: "hsl(var(--surface-sunken))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          dim: "hsl(var(--brand-dim))",
          subtle: "hsl(var(--brand-subtle))",
        },
        ink: {
          DEFAULT: "hsl(var(--ink))",
          muted: "hsl(var(--ink-muted))",
          faint: "hsl(var(--ink-faint))",
        },
        border: "hsl(var(--border))",
        accent: "hsl(var(--accent))",
      },
      keyframes: {
        "slide-up": {
          from: { opacity: 0, transform: "translateY(12px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse_ring: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.5, transform: "scale(1.05)" },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        typewriter: {
          from: { width: 0 },
          to: { width: "100%" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
        shimmer: "shimmer 2s linear infinite",
        pulse_ring: "pulse_ring 2s ease-in-out infinite",
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
