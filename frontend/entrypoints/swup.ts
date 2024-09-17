import SwupPreloadPlugin from "@swup/preload-plugin";
import SwupA11yPlugin from "@swup/a11y-plugin";
import Swup from "swup";
import SwupFragmentPlugin, { Rule as FragmentRule } from "@swup/fragment-plugin";
import SwupScrollPlugin from "@swup/scroll-plugin"; 

const rules: Array<FragmentRule> = [
  // Rule 0: Navigating from All Items to a Collection
  {
    from: "/collections/all",
    to: "/collections/:handle?",
    containers: ["#collection"],
  },
  // Rule 1: Navigating from a Collection to All Items
  {
    from: "/collections/:handle?",
    to: "/collections/all",
    containers: ["#collection"],
  },

  // Rule 2: Navigating from a Collection to a Collection or Filtering within a Collection
  {
    from: "/collections/:handle?",
    to: "/collections/:handle?",
    containers: ["#product-grid"],
  },
];

export const swup = new Swup({
  animateHistoryBrowsing: true,
  containers: ["#main"],
  plugins: [
    new SwupFragmentPlugin({
      rules
    }),
    new SwupPreloadPlugin({
      preloadHoveredLinks: true,
      preloadVisibleLinks: true,
    }),
    new SwupA11yPlugin(),
    new SwupScrollPlugin({
      doScrollingRightAway: false,
      animateScroll: {
        betweenPages: false,
        samePageWithHash: false,
        samePage: false,
      },
    }),
  ],
});
