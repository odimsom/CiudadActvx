/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "pulse-slow": "pulse 4s ease-in-out infinite",
        "bounce-slow": "bounce 3s ease-in-out infinite",
        sonar: "sonar 2s ease-out infinite",
      },
      keyframes: {
        sonar: {
          "0%": {
            transform: "scale(1)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(2)",
            opacity: "0",
          },
        },
      },
    },
  },
  plugins: [],
};
