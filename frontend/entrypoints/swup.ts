import SwupPreloadPlugin from "@swup/preload-plugin";
import SwupA11yPlugin from "@swup/a11y-plugin";
import Swup from "swup";
import SwupFragmentPlugin from "../plugins/fragmentPlugin";
import SwupScrollPlugin from "@swup/scroll-plugin";


export const fragmentPlugin = new SwupFragmentPlugin({
  rules: [
    {
      from: "/products/:handle?",
      to: "/products/:handle?",
      containers: ["#product-price", "#product-variant-media", "#product-variant-media-mobile", "#product-form", "#product-variant-selector-data", "#product-quantity"]
    },
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
  ]
});

document.querySelectorAll('a[href]').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    const fragmentVisit = fragmentPlugin.getFragmentVisit({
      from: window.location.href, // the current URL
      to: (el as HTMLAnchorElement).href // the URL of the link
    });
    console.log(`will replace ${fragmentVisit?.containers || swup.options.containers}`);
  });
});

export const swup = new Swup({
  animateHistoryBrowsing: true,
  containers: ["#main"],
  plugins: [
    fragmentPlugin,
    new SwupPreloadPlugin(),
    new SwupA11yPlugin(),
    new SwupScrollPlugin({
      shouldResetScrollPosition: (link: Element) => {
        return !link.matches('.no-scroll')
      },
      doScrollingRightAway: false,
      animateScroll: {
        betweenPages: false,
        samePageWithHash: false,
        samePage: false,
      },
    }),
  ],
});

export function updateCache(propUrl?: string) {
  const url = propUrl || swup.getCurrentUrl();
  const cachedPage = swup.cache.get(url);

  if (!cachedPage) {
    swup.cache.set(url, { url, html: document.documentElement.outerHTML });
    return
  };

  cachedPage.html = document.documentElement.outerHTML;
  swup.cache.update(url, cachedPage);
}
