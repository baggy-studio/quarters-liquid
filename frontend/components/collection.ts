import { swup } from "@/entrypoints/swup";
import { updateHistoryRecord } from "swup";

const scrollId = "collection-scroll-position"

function fetchCollectionData() {
  if (window.location.pathname.includes("/collections/all")) return

  const script = document.querySelector('[data-collection-filters]');

  if (!script) return {
    filters: [],
    collectionUrl: null,
  };

  const data = JSON.parse(script?.innerHTML);

  return {
    filters: data.filters || [],
    collectionUrl: data.collection_url || "",
  };
}

export default (collectionPathname) => ({
  ...fetchCollectionData(),
  activeUrl: collectionPathname,
  scrollPosition: localStorage.getItem(scrollId) || 0,
  init() {
    console.log("filters", this.filters, this.collectionUrl)
    if (window.history.state && window.history.state.productGrid) {
      this.hydrateProducts()
    }

    if (this.scrollPosition) {
      setTimeout(() => {
        this.restoreScroll()
      })
    }

    swup.hooks.on("visit:start", (visit) => {
      if (!visit.to.url.includes("/collections/")) {
        this.saveScroll()
      } else {
        this.activeUrl = visit.to.url;
      }
    });

    window.addEventListener("unload", this.saveScroll);
  },

  destroy() {
    window.removeEventListener("unload", this.saveScroll);
  },
  saveScroll() {
    localStorage.setItem(scrollId, window.scrollY.toString())
  },
  restoreScroll() {
    window.scroll(0, parseInt(this.scrollPosition))
  },
  async loadProducts() {
    const nextPage = document.getElementById("load-more") as HTMLAnchorElement | null;

    if (!nextPage) return;

    try {
      const response = await fetch(nextPage.href);
      const data = await response.text();

      let html = document.createElement("html");
      html.innerHTML = data;

      this.appendProducts({ html, url: nextPage.href });
    } catch (error) {
      console.log("error", error)
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

    if (nextLink) {
      document.getElementById("load-more")?.replaceWith(nextLink.cloneNode(true));
    } else {
      document.getElementById("load-more")?.remove();
    }

    productGrid.append(...newProductGrid.children);

    try {
      updateHistoryRecord(url, {
        productGrid: JSON.stringify(productGrid.innerHTML)
      });
    } catch (error) {
      console.error('Failed to replace state', error);
    }
  }
});