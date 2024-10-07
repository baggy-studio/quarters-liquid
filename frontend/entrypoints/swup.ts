import SwupPreloadPlugin from "@swup/preload-plugin";
import SwupA11yPlugin from "@swup/a11y-plugin";
import Swup from "swup";
import SwupFragmentPlugin from "../plugins/fragmentPlugin";
import SwupScrollPlugin from "@swup/scroll-plugin";

const utilityPages = ['frequently-asked-questions', 'shipping-returns', 'terms-and-conditions', 'privacy-policy'];

const isUtilityPage = (url) => {
  const currentPage = url.split('/').pop()?.split('?')[0] || '';
  return utilityPages.includes(currentPage);
};

export const fragmentPlugin = new SwupFragmentPlugin({
  rules: [
    {
      from: "/products/:handle?",
      to: "/products/:handle?",
      containers: ["#product-information", "#product-price", "#product-variant-media", "#product-variant-media-mobile", "#product-form", "#product-variant-selector-data", "#product-quantity", "#product-fullscreen"]
    },
    {
      from: "/collections/all",
      to: "/collections/:handle?",
      containers: ["#collection-nav", "#collection-nav-clone", '#product-grid']
    },
    {
      from: "/collections/:handle?",
      to: "/collections/all",
      containers: ["#collection-nav", "#collection-nav-clone", '#product-grid']
    },
    {
      from: "/collections/:handle?",
      to: "/collections/:handle?",
      containers: ["#collection-nav", "#collection-nav-clone", '#product-grid']
    },
    {
      from: ['/pages/frequently-asked-questions', '/pages/shipping-returns', '/pages/terms-and-conditions', '/pages/privacy-policy'],
      to: ['/pages/frequently-asked-questions', '/pages/shipping-returns', '/pages/terms-and-conditions', '/pages/privacy-policy'],
      containers: ['#utility', '#page-settings', "#utility-nav"],
    }
  ]
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

document.querySelectorAll('a[href]').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    const fragmentVisit = fragmentPlugin.getFragmentVisit({
      from: window.location.href, // the current URL
      to: el.href // the URL of the link
    });
    console.log(`will replace ${fragmentVisit?.containers || swup.options.containers}`);
  });
});


export function updateCache(propUrl?: string) {
  const url = propUrl || swup.getCurrentUrl();
  const cachedPage = swup.cache.get(url);

  if (!cachedPage) {
    swup.cache.set(url, { url, html: document.documentElement.outerHTML });
    return;
  }

  cachedPage.html = document.documentElement.outerHTML;
  swup.cache.update(url, cachedPage);
}
