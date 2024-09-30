import SwupPreloadPlugin from "@swup/preload-plugin";
import SwupA11yPlugin from "@swup/a11y-plugin";
import Swup from "swup";
import SwupFragmentPlugin from "@swup/fragment-plugin";
import SwupScrollPlugin from "@swup/scroll-plugin";
import SwupHeadPlugin from '@swup/head-plugin';

export const fragmentPlugin = new SwupFragmentPlugin({
  rules: [
    {
      from: "/products/:handle?",
      to: "/products/:handle?",
      containers: ["#product-price"]
    }
  ],
  debug: true
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
    new SwupHeadPlugin({
      persistAssets: true,
      awaitAssets: true
    }),
  ],
});

// Add event listeners after Swup initialization
document.addEventListener('swup:page:view', updatePageColors);

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

function updatePageColors(event: Event) {
  const body = document.body;
  const header = document.querySelector('header');
  const headerLogo = header?.querySelector('h1 a svg');
  const headerNav = header?.querySelector('nav');
  const main = document.querySelector('main');

  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();
  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color').trim();

  // Apply colors based on CSS variables
  body.style.backgroundColor = bgColor;
  body.style.color = textColor;
  
  if (headerLogo instanceof SVGElement) {
    headerLogo.style.fill = textColor;
  }
  
  if (headerNav instanceof HTMLElement) {
    headerNav.style.color = textColor;
  }


  // Update gradient
  let gradientElement = document.getElementById('top-gradient');
  if (!gradientElement) {
    gradientElement = document.createElement('div');
    gradientElement.id = 'top-gradient';
    document.body.prepend(gradientElement);
  }
  gradientElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 120px;
    background: linear-gradient(to bottom, ${bgColor} 0%, transparent 100%);
    pointer-events: none;
    z-index: 1;
  `;

  console.log('Page colors updated', { textColor, bgColor });
}

// Optionally, update colors on initial page load
document.addEventListener('DOMContentLoaded', updatePageColors);