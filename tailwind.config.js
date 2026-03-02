/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1F3A2E",
        "primary-hover": "#162d23",
        teal: "#2F5F6B",
        "teal-hover": "#265059",
        stone: "#F4F2EE",
        charcoal: "#1E1E1E",
        wine: "#6B2F3A",
        secondary: "#6b7280",
      },
      fontFamily: {
        heading: ["Playfair Display", "Georgia", "serif"],
      },
      spacing: {
        section: "2rem",
        container: "1rem",
      },
      borderRadius: {
        container: "0.5rem",
      },
    },
  },
  plugins: [],
}
