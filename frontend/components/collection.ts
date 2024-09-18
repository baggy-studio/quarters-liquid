import { swup } from "@/entrypoints/swup";
import { updateHistoryRecord } from "swup";

const scrollId = "collection-scroll-position"

function getFilters(pathname: string) {
  const url = new URL(pathname, window.location.origin);
  return url.searchParams.getAll("filter.p.t.category") || [];
}

export default (collectionPathname) => ({
  activeUrl: collectionPathname,
  filters: getFilters(collectionPathname + window.location.search),
  shouldLoad: false,
  scrollPosition: localStorage.getItem(scrollId) || 0,
  init() {

    if (this.scrollPosition) {
      setTimeout(() => {
        window.scroll(0, parseInt(this.scrollPosition))
        localStorage.removeItem(scrollId)
      })
    }

    swup.hooks.on("visit:start", (visit) => {
      if (!visit.to.url.includes("/collections/")) {
        localStorage.setItem(scrollId, window.scrollY.toString())
      } else {
        this.activeUrl = visit.to.url;
        this.filters = getFilters(this.activeUrl);
      }
    });
  },
  async loadProducts() {
    const nextPage = document.getElementById("next-page") as HTMLAnchorElement | null;

    if (!nextPage) return;

    try {
      const response = await fetch(nextPage.href);
      const page = await response.text();
      
      this.appendProducts(page);
    } catch (error) {
      console.log("error", error)
      console.error(error);
    }
  },
  appendProducts(page) {
    const html = new DOMParser().parseFromString(page.html, 'text/html')

    const newProductGrid = html.querySelector('[data-product-grid]');
    const nextLink = html.querySelector("#next-page");

    const productGrid = document.querySelector('[data-product-grid]');

    if (!productGrid || !newProductGrid) return;

    if (nextLink) {
      document.getElementById("next-page")?.replaceWith(nextLink.cloneNode(true));
    } else {
      document.getElementById("next-page")?.remove();
    }

    productGrid.append(...newProductGrid.children);

    try {
      this.updateCache(page.url);
      updateHistoryRecord(page.url);
    } catch (error) {
      console.error('Failed to replace state', error);
    }
  },
  updateCache(url) {
    const cachedPage = swup.cache.get(url);
    if (!cachedPage) return;

    // Save the modified html as a string in the cache entry
   
    cachedPage.html = document.documentElement.outerHTML;
    console.log("cachedPage", cachedPage)
    swup.cache.update(url, cachedPage);
  }
});