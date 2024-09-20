import { swup, fragmentPlugin } from "@/entrypoints/swup";
import { updateHistoryRecord } from "swup";
import { Rule as FragmentRule } from "@swup/fragment-plugin";

function fetchCollectionNavigation() {
  const script = document.querySelector('[data-collection-navigation]');

  if (!script) return [];

  const data = JSON.parse(script.innerHTML)
  return data;
}

export default (collectionPathname) => ({
  navigation: fetchCollectionNavigation(),
  activeUrl: collectionPathname,
  scrollPosition: localStorage.getItem(collectionPathname) || 0,
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
  init() {
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

    swup.hooks.on("visit:start", (visit) => {
      this.saveScroll()
      this.activeUrl = visit.to.url;
    });

    swup.hooks.on("content:replace", (visit) => {
      if (visit.to.url.includes('/collections/')) {
        this.loadVariants()
      }
    })

    window.addEventListener("unload", this.saveScroll);
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

    // Fisher-Yates shuffle algorithm
    for (let i = variants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [variants[i], variants[j]] = [variants[j], variants[i]];
    }

    productGrid.append(...variants);
  },
  destroy() {
    window.removeEventListener("unload", this.saveScroll);
  },
  saveScroll() {
    localStorage.setItem(this.activeUrl, window.scrollY.toString())
  },
  restoreScroll() {
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
  }
});