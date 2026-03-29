/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Inkflow brand
        ink: {
          bg:       "#07050F",
          surface:  "#0E0B1C",
          elevated: "#150F28",
          border:   "rgba(123,95,255,0.18)",
          purple:   "#7B5FFF",
          violet:   "#B46EFF",
          text:     "#EDE9FF",
          muted:    "rgba(237,233,255,0.45)",
        },
      },
      fontFamily: {
        head: ["Cabinet Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
