/** @type {import('tailwindcss').Config} */
const baseConfig = require("../../tailwind.base.config.js");

export default {
  ...baseConfig,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme.extend,
      // Configuraciones específicas de mobile
    },
  },
  plugins: [],
};
