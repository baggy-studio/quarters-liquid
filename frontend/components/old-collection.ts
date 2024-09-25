import { swup, fragmentPlugin } from "@/entrypoints/swup";
import { updateHistoryRecord, Visit } from "swup";
import { Rule as FragmentRule } from "@swup/fragment-plugin";

function fetchCollectionNavigation() {
  const script = document.querySelector('[data-collection-navigation]');
  if (!script) return [];
  const data = JSON.parse(script.innerHTML)
  return data;
}

export default () => ({
  // State
  navigation: fetchCollectionNavigation(),
  activeUrl: swup.getCurrentUrl(),
  scrollPosition: localStorage.getItem(swup.getCurrentUrl()) || 0,
  scrollDirection: 'down',
  inTopZone: true,
  visitStart: () => { },
  contentReplace: () => { },
  // Hooks
  init() {
    this.onScroll()
    this.loadTransitionRules(this.navigation)

    if (window.history.state && window.history.state.productGrid) {
      this.hydrateProducts()
    }

    if (this.scrollPosition) {
      setTimeout(() => {
        this.restoreScroll()
      })
    }

    this.loadVariants()

    this.visitStart = (visit: Visit) => {
      if (visit.from.url.includes('/collections/')) {
        this.saveScroll()
      }
      if (visit.to.url.includes('/collections/') && !visit.to.url.includes('/collections/all')) {
        this.activeUrl = visit.to.url;
      }
    }

    this.contentReplace = (visit: Visit) => {
      if (visit.to.url.includes('/collections/')) {
        this.loadVariants()
      }
    }

    swup.hooks.on("visit:start", this.visitStart);
    swup.hooks.on("content:replace", this.contentReplace);

    window.addEventListener("unload", this.saveScroll);
    window.addEventListener("scroll", this.onScroll.bind(this));
  },
  destroy() {
    window.removeEventListener("unload", this.saveScroll);
    window.removeEventListener("scroll", this.onScroll.bind(this));

    if (this.visitStart) {
      swup.hooks.off("visit:start", this.visitStart);
    }

    if (this.contentReplace) {
      swup.hooks.off("content:replace", this.contentReplace);
    }
  },
  // Helpers
  loadTransitionRules(navigation) {
    const rules: Array<FragmentRule> = []

    navigation.forEach((filter) => {
      Object.entries(filter).forEach(([collectionUrl, filters]) => {
        if (Array.isArray(filters) && filters?.length) {
          filters.forEach((filter) => {
            rules.push({
              from: [collectionUrl, filter.url],
              to: [filter.url, collectionUrl],
              containers: ["#product-grid"],
              name: collectionUrl
            })
          })
        }
      });
    })

    rules.forEach((rule) => fragmentPlugin.prependRule(rule))
  },
  loadVariants() {
    const nextPage = document.getElementById("load-more")

    if (nextPage) return;

    const productGrid = document.querySelector('[data-product-grid]');
    if (!productGrid) return;

    const variants = Array.from(productGrid.querySelectorAll('[data-product-variant]'));
    variants.forEach(variant => {
      variant.classList.remove('!hidden');
      variant.remove();
    });

    for (let i = variants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [variants[i], variants[j]] = [variants[j], variants[i]];
    }

    productGrid.append(...variants);
  },
  saveScroll() {
    const url = swup.getCurrentUrl()
    localStorage.setItem(url, window.scrollY.toString())
  },
  restoreScroll() {
    console.log('restore scroll', this.activeUrl, this.scrollPosition)
    window.scroll(0, parseInt(this.scrollPosition))
  },
  async loadProducts() {
    const nextPage = document.getElementById("load-more") as HTMLAnchorElement | null;

    try {
      const data = await fetch(nextPage.href).then(r => r.text());
      let html = document.createElement("html");
      html.innerHTML = data;

      this.appendProducts({ html, url: nextPage.href });
    } catch (error) {
      console.error(error);
    }
  },
  hydrateProducts() {
    const productGrid = document.querySelector('[data-product-grid]');
    const cachedProductGrid = JSON.parse(window.history.state.productGrid);

    if (!productGrid || !cachedProductGrid) return;

    productGrid.innerHTML = cachedProductGrid;
  },
  appendProducts({ html, url }) {
    const newProductGrid = html.querySelector('[data-product-grid]');
    const nextLink = html.querySelector("#load-more");

    const productGrid = document.querySelector('[data-product-grid]');

    if (!productGrid || !newProductGrid) return;


    productGrid?.append(...newProductGrid.children);

    if (nextLink) {
      document.getElementById("load-more")?.replaceWith(nextLink.cloneNode(true));
    } else {
      document.getElementById("load-more")?.remove();
      this.loadVariants()
    }

    try {
      updateHistoryRecord(url, {
        productGrid: JSON.stringify(productGrid.innerHTML)
      });
    } catch (error) {
      console.error('Failed to replace state', error);
    }
  },
  onScroll() {
    if (window.scrollY <= 300) {
      this.inTopZone = true;
    } else {
      this.inTopZone = false;
    }


    if (window.scrollY > this.scrollPosition) {
      this.scrollDirection = 'down';
    } else {
      this.scrollDirection = 'up';
    }
    this.scrollPosition = window.scrollY;
  }
});