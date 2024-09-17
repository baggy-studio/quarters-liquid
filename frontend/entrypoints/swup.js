import SwupPreloadPlugin from "@swup/preload-plugin";
import SwupA11yPlugin from "@swup/a11y-plugin";
import Swup from "swup";
import SwupFragmentPlugin from "@swup/fragment-plugin";
import SwupScrollPlugin from "@swup/scroll-plugin";
import SwupJsPlugin from '@swup/js-plugin'; 
import { cubicInOut } from '@/easing.ts';

import { animate } from "motion"

let sail = document.getElementById('sail');



export const swup = new Swup({
  animateHistoryBrowsing: true,
  containers: ["#main"],
  plugins: [
    new SwupJsPlugin({
      animations: [
        {
          from: '(.*)',
          to: '(.*)',
          out: async () => {
            await animate(sail, { opacity: 1 }, { duration: 0.6, easing: cubicInOut }).finished
          },
          in: async () => {
            await animate(sail, { opacity: 0 }, { duration: 0.2, easing: 'linear' }).finished;
          }
        }
      ]
    }),
    new SwupFragmentPlugin({
      rules: [
        {
          from: "/collections/:handle?",
          to: "/collections/:handle?",
          containers: ["#collection"],
        },
      ],
    }),
    new SwupPreloadPlugin({
      preloadVisibleLinks: true,
    }),
    new SwupA11yPlugin(),
    new SwupScrollPlugin({
      doScrollingRightAway: false,
      animateScroll: {
        betweenPages: false,
        samePageWithHash: true,
        samePage: true,
      },
    }),
  ],
});
