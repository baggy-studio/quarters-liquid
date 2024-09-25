import SwupPreloadPlugin from "@swup/preload-plugin";
import SwupA11yPlugin from "@swup/a11y-plugin";
import Swup from "swup";
import SwupFragmentPlugin, { Rule as FragmentRule } from "@swup/fragment-plugin";
import SwupScrollPlugin from "@swup/scroll-plugin";

const rules: Array<FragmentRule> = [
  {
    from: "/collections/all",
    to: "/collections/:handle?",
    containers: ["#collection-nav", '#product-grid']
  }, 
  {
    from: "/collections/:handle?",
    to: "/collections/all",
    containers: ["#collection-nav", '#product-grid']
  },
  {
    from: "/collections/:handle?",
    to: "/collections/:handle?",
    containers: ["#collection-nav", '#product-grid']
  }
];

export const fragmentPlugin = new SwupFragmentPlugin({ rules });

export const swup = new Swup({
  animateHistoryBrowsing: true,
  containers: ["#main"],
  plugins: [
    fragmentPlugin,
    new SwupPreloadPlugin({
    preloadInitialPage: true,
    preloadHoveredLinks: false,
    // preloadVisibleLinks: true,
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
