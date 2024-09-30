import SwupPreloadPlugin from "@swup/preload-plugin";
import SwupA11yPlugin from "@swup/a11y-plugin";
import Swup from "swup";
import SwupFragmentPlugin from "@swup/fragment-plugin";
import SwupScrollPlugin from "@swup/scroll-plugin";
import SwupHeadPlugin from "@swup/head-plugin";

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
      containers: ["#product-price"]
    },
    {
      from: '/pages/:utilityPage',
      to: '/pages/:utilityPage',
      containers: ['#utility-content'],
      name: 'utility-pages',
      if: (visit) => isUtilityPage(visit.to.url)
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
  // hooks: {
  //   'visit:start': (visit) => {
  //     console.log('Visit started:', visit);
  //     const currentPage = visit.to.url.split('/').pop()?.split('?')[0] || '';
  //     const isUtilityPage = utilityPages.includes(currentPage);
  //     if (isUtilityPage) {
  //       console.log('Utility page detected, updating only #utility-content');
  //     } else {
  //       console.log('Non-utility page, updating #main');
  //     }
  //   },
  //   'content:replace': (visit) => {
  //     console.log('Will replace content:', visit);
  //   },
  //   'animation:out:start': () => {
  //     console.log('Animation out started');
  //     document.body.classList.add('is-animating');
  //   },
  //   'animation:out:end': () => {
  //     console.log('Animation out ended');
  //   },
  //   'animation:in:start': () => {
  //     console.log('Animation in started');
  //   },
  //   'animation:in:end': () => {
  //     console.log('Animation in ended');
  //     document.body.classList.remove('is-animating');
  //   },
  //   'page:view': () => {
  //     console.log('New page view');
  //   }
  // }
});

swup.hooks.on('visit:start', (visit) => {
  console.log('Visit started:', visit);
  const currentPage = visit.to.url.split('/').pop()?.split('?')[0] || '';
  const isUtilityPage = utilityPages.includes(currentPage);
  if (isUtilityPage) {
    visit.containers = ['#utility-content'];
    console.log('Utility page detected, updating only #utility-content');
  } else {
    visit.containers = ['#main'];
    console.log('Non-utility page, updating #main');
  }
});



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

  if (main instanceof HTMLElement) {
    main.style.maxHeight = `100%`;
  }

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

document.addEventListener('DOMContentLoaded', () => {
  updatePageColors(new Event('DOMContentLoaded'));
  // console.log('Initial page structure:', document.body.innerHTML);
});