import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Craigslist-inspired colors with lobster theme
        claw: {
          purple: "#800080", // CL purple
          blue: "#0000ff",   // CL link blue
          red: "#cc0000",    // Lobster red
          orange: "#ff6b35", // Lobster accent
          cream: "#faf8f5",  // Background
          dark: "#1a1a1a",
        },
      },
      fontFamily: {
        mono: ["Courier New", "Courier", "monospace"],
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
