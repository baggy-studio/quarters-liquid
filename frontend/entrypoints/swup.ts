import SwupPreloadPlugin from "@swup/preload-plugin";
import SwupA11yPlugin from "@swup/a11y-plugin";
import Swup from "swup";
import SwupFragmentPlugin from "../plugins/fragmentPlugin";
import SwupScrollPlugin from "@swup/scroll-plugin";

const utilityPages = ['frequently-asked-questions', 'shipping-returns', 'terms-and-conditions', 'privacy-policy', 'affiliate-program'];

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
      containers: ['#utility', '#page-settings', "#utility-nav", "#faqs", "#secondary-text"],
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
        const href = link.getAttribute('href') || '';
        return !link.matches('.no-scroll') && !isUtilityPage(href);
      },
      doScrollingRightAway: false,
      animateScroll: {
        betweenPages: false,
        samePageWithHash: false,
        samePage: true,
      },
    }),
  ],
});

// scroll to top for utility pages
const scrollToTopForUtilityPages = () => {
  if (isUtilityPage(swup.getCurrentUrl())) {
    window.scrollTo({ top: 0 });
  }
};

swup.hooks.on('content:scroll', scrollToTopForUtilityPages);

export const removeScrollHook = () => {
  swup.hooks.off('content:scroll', scrollToTopForUtilityPages);
};



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
