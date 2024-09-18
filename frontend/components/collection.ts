import { swup } from "@/entrypoints/swup";

const nextLinkSelector = '[data-next-page]';
const listSelector = '[data-product-grid]';
const listItemSelector = '.product-grid-item';
const buttonSelector = '.load-more';

function getFilters(pathname: string) {
  const url = new URL(pathname, window.location.origin);
  return url.searchParams.getAll("filter.p.t.category") || [];
}

export default (collectionPathname) => ({
  activeUrl: collectionPathname,
  filters: getFilters(collectionPathname + window.location.search),
  init() {
    swup.hooks.on("visit:start", (visit) => {
      this.activeUrl = visit.to.url;
      this.filters = getFilters(this.activeUrl);
    });

    this.initInfiniteScroll();

    swup.hooks.on("page:view", this.initInfiniteScroll);
  },
  initInfiniteScroll() {
    const el = document.querySelector(listSelector);

    if (!el) return;

    const nextLink = document.querySelector(nextLinkSelector);

    if (!nextLink) return;

    const infScroll = new InfiniteScroll(el, {
      path: nextLinkSelector,
      append: listItemSelector,
      history: false,
      prefill: false,
      button: buttonSelector,
      loadOnScroll: true,
      scrollThreshold: window.innerHeight,
    });

    infScroll.on("append", (doc, _path, items) => {
      window.history.replaceState(null, '', _path);

      // Get the next link. If there is no more available, replace it with an empty <span>
      const nextLink = doc.querySelector(nextLinkSelector) ?? doc.createElement('span');
      document.querySelector(nextLinkSelector)?.replaceWith(nextLink);
      // Update the cache
      this.updateCache(listSelector, items, nextLink);
    });
  },
  updateCache(containerSelector, items, nextLink) {
    const url = swup.getCurrentUrl();
    const cachedPage = swup.cache.get(url);
    if (!cachedPage) return;

    const cachedDocument = new DOMParser().parseFromString(cachedPage.html, 'text/html')
    const container = cachedDocument.querySelector(containerSelector);
    if (!container) return;

    // Update the items
    const clonedItems = [...items].map(item => item.cloneNode(true));
    container.append(...clonedItems);

    // Update the next link
    if (nextLink) {
      cachedDocument.querySelector(nextLinkSelector)?.replaceWith(nextLink.cloneNode(true));
    }

    // Save the modified html as a string in the cache entry
    cachedPage.html = cachedDocument.documentElement.outerHTML;
    swup.cache.update(url, cachedPage);
  }
});