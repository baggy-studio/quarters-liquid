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
        'midnight-green': "#022B26",
        olive: '#828C1A',
        chartreuse: '#D0D12C',
        vanilla: '#F0D8AE',
        mahogany: '#684C0D',
        citrus: '#DFFF00',
        bone: {
          DEFAULT: '#E9E2C3',
          tint: '#FAF8EC'
        },
        charcoal: '#000000',
        error: '#FF0000'
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
