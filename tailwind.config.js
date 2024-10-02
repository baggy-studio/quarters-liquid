import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,vue,svelte}", "./**/*.liquid"],
  future: {
    hoverOnlyWhenSupported: true
  },
  theme: {
    extend: {
      screens: {
        'xs': '425px',
        'sm': '640px',
        touch: { raw: '(pointer: coarse)' },
      },
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
        mahogany: {
          DEFAULT: '#643600',
          hover: '#462600'
        },
        citrus: '#DFFF00',
        bone: {
          DEFAULT: '#F4EED0',
          hover: '#F9F7E7',
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
        'span-18': 'span 18 / span 18',
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
