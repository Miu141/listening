/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED",
        secondary: "#F3F4F6",
        "primary-light": "#8B5CF6",
        "primary-dark": "#6D28D9",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#333",
            a: {
              color: "#7C3AED",
              "&:hover": {
                color: "#6D28D9",
              },
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
