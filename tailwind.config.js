/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        day: {
          DEFAULT: "#f6f8fa",
        },
        night: {
          DEFAULT: "#212936",
        },
      },
    },
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
