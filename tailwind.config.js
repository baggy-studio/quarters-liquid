import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,vue,svelte}", "./**/*.{liquid,json}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Build", ...fontFamily.sans],
        serif: ["Signifier", ...fontFamily.serif],
      },
      colors: {
        background: "#efeeea",
        grey: "#a7a9ac",
        pacific: "#47c3ca",
        crema: "#fadb95",
        green: '#1acc5d',
        cherry: '#ff492b',
        orange: '#ff8c42',
        pink: "#ffa5a7",
        clay: '#8db09f',
        rust: '#a43d01',
        lemon: '#e8ec3a'
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
