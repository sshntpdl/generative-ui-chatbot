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
        sans:    ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        mono:    ["Geist Mono", "monospace"],
      },
      colors: {
        "bg-base":      "var(--bg-base)",
        "bg-surface":   "var(--bg-surface)",
        "bg-elevated":  "var(--bg-elevated)",
        "bg-hover":     "var(--bg-hover)",
        "text-primary":   "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted":     "var(--text-muted)",
        "accent":         "var(--accent-1)",
        "accent-2":       "var(--accent-2)",
        "border-subtle":  "var(--border-subtle)",
        "border-base":    "var(--border-base)",
      },
      animation: {
        "slide-up":  "slide-up .28s cubic-bezier(.16,1,.3,1) both",
        "scale-in":  "scale-in .24s cubic-bezier(.16,1,.3,1) both",
        "fade-in":   "fade-in .3s ease both",
        "float":     "float-up 3s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
