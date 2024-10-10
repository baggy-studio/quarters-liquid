import InfiniteScrollManager from "../infinte-scroll";
import { updateCache } from "@/entrypoints/swup";

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
    if (document.querySelector(selectors.loadNext)) {
      this.initInfiniteScroll()
    }
  },
  initInfiniteScroll() {
    const infiniteScroll = new InfiniteScrollManager({
      container: selectors.productGrid,
      paginationNext: selectors.loadNext,
      enableHtml5History: false
    });

    infiniteScroll.addLoadEventListener(() => {
      updateCache()
    });

    infiniteScroll.addNextPageScrollEndEventListener(() => {
      this.loadVariants()
      console.log('load end')
      updateCache()
    });
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

      const inStockVariants = variants.filter(variant => variant?.dataset?.available === 'true') || [];
      const outOfStockVariants = variants.filter(variant => variant?.dataset?.available === 'false') || [];

      function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }

        return array
      }

      shuffle(inStockVariants);
      shuffle(outOfStockVariants);

      return [...inStockVariants, ...outOfStockVariants] || []
    }

    const variants = getVariants()

    console.log(variants)

    if (!variants.length) {
      return
    }

    const ul = document.createElement('ul');
    ul.classList.add('contents');
    ul.dataset.shuffledVariants = '';
    ul.append(...variants);
    productGrid.append(ul);
  }
});

