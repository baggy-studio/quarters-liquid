import InfiniteScrollManager from "../infinte-scroll";
import { swup } from "@/entrypoints/swup";
import { updateHistoryRecord } from "swup";

const selectors = {
  product: '[data-product]',
  productVariant: '[data-product-variant]',
  productGrid: '[data-product-grid]',
  loadPrevious: '[data-load-previous]',
  loadNext: '[data-load-next]',
}

export default () => ({
  hasLoadedVariants: false,
  init() {
    if (!document.querySelector(selectors.loadNext)) {
      this.loadVariants()
    } else {
      this.initInfiniteScroll()
    }
  },
  initInfiniteScroll() {
    const infiniteScroll = new InfiniteScrollManager({
      container: selectors.productGrid,
      paginationNext: selectors.loadNext,
      enableHtml5History: true
    });

    infiniteScroll.addLoadEventListener(() => {
      this.updateCache()
    });

    infiniteScroll.addNextPageScrollEndEventListener(() => {
      this.loadVariants()
      this.updateCache()
    });
  },
  updateCache() {
    const url = swup.getCurrentUrl();
    const cachedPage = swup.cache.get(url);

    if (!cachedPage) {
      swup.cache.set(url, { url, html: document.documentElement.outerHTML });
      return
    };

    cachedPage.html = document.documentElement.outerHTML;
    swup.cache.update(url, cachedPage);
  },
  loadVariants() {

    const productGrid = document.querySelector(selectors.productGrid);

    if (!productGrid) return;

    function getVariants() {

      const shuffledVariants = document.querySelector('[data-shuffled-variants]');

      if (shuffledVariants) return []
      if (!productGrid) return [];

      const variants = Array.from(productGrid.querySelectorAll(selectors.productVariant));

      if (variants.length === 0) {
        return []
      };

      variants.forEach(variant => {
        variant.remove();
        variant.classList.remove('!hidden');
      });

      for (let i = variants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [variants[i], variants[j]] = [variants[j], variants[i]];
      }

      return variants || []
    }

    const variants = getVariants()

    if (!variants.length) {
      console.log('no variants found, skipping')
      return
    }

    const ul = document.createElement('ul');
    ul.classList.add('contents');
    ul.dataset.shuffledVariants = '';
    ul.append(...variants);
    productGrid.append(ul); 
  }
});

