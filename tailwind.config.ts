import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* theme-aware semantic aliases */
        theme: {
          bg:      "var(--color-bg)",
          surface: "var(--color-surface)",
          surface2:"var(--color-surface-2)",
          border:  "var(--color-border)",
          accent:  "var(--color-accent)",
          accent2: "var(--color-accent-2)",
          deep:    "var(--color-accent-deep)",
          text:    "var(--color-text)",
          muted:   "var(--color-text-muted)",
          tag:     "var(--color-tag)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body:    ["var(--font-body)"],
        sans:    ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        theme:    "var(--radius-md)",
        "theme-sm":"var(--radius-sm)",
        "theme-lg":"var(--radius-lg)",
        chip:     "var(--radius-chip)",
        btn:      "var(--radius-btn)",
        fab:      "var(--radius-fab)",
      },
      boxShadow: {
        card:  "var(--shadow-card)",
        fab:   "var(--shadow-fab)",
      },
    },
  },
  plugins: [],
};

export default config;
