

export default () => ({
  init() {
    this.hydrateProductVariants()
  },
  hydrateProductVariants() {
    const productGrid = document.querySelector('[data-product-grid]');
    const productVariants = productGrid?.querySelectorAll('[data-product-variant]');

    if (!productVariants?.length || !productGrid) return;

    const productVariantsArray = Array.from(productVariants);

    productVariantsArray.forEach(variant => variant.classList.remove('!hidden'));

    // Fisher-Yates (Knuth) shuffle algorithm
    for (let i = productVariantsArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [productVariantsArray[i], productVariantsArray[j]] = [productVariantsArray[j], productVariantsArray[i]];
    }

    const productVariantContainer = document.querySelector('[data-shuffled-variants]');

    if (!productVariantContainer) return;

    productVariantContainer.append(...productVariantsArray);
  },
});