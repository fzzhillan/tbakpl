/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: { container: false },
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        skranji: ["Skranji", "cursive"],
        tw: ["Tw Cen MT Std", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animated")],
  corePlugins: { container: false },
};
