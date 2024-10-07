/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryGreen: "#04CE78",
        lightGreen: "#D4FEEC",
        navy: "#000D44",
        brightBlue: "#1F5FFF",
        lightBlue: "#dff1fd",
        lightGrey: "#f6f7fb",
      },
    },
  },
  plugins: [],
};