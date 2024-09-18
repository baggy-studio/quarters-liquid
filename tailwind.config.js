import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,vue,svelte}", "./**/*.{liquid,json}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["ABC Marist", ...fontFamily.serif],
        sans: ["ABC Monument Grotesk", ...fontFamily.sans],
        corfe: ["Corfe", ...fontFamily.serif],
        droulers: ["Droulers", ...fontFamily.serif],
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
      },
      gridTemplateColumns: {
        '20': 'repeat(20, minmax(0, 1fr))',
        '18': 'repeat(18, minmax(0, 1fr))'
      },
      gridColumn: {
        'span-13': 'span 13 / span 13',
        'span-16': 'span 16 / span 16',
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
