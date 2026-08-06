import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a5f3f",
          light: "#2d8a5e",
          dark: "#0d3d28",
        },
        gold: {
          DEFAULT: "#c9a84c",
          light: "#e8d48b",
        },
      },
      fontFamily: {
        tajawal: ["Tajawal", "sans-serif"],
      },
    },
  },
  plugins: [],
}
export default config