import { Visit } from "swup";
import { swup } from "../entrypoints/swup";
import Alpine from "alpinejs";

function fetchProductData() {
  const script = document.querySelector('[data-product-data]');
  if (!script) return [];
  const data = JSON.parse(script.innerHTML)
  return data;
}

export default (selectedVariantId: number) => ({
  ...fetchProductData(),
  selectedVariantId,
  quantity: 1, 
  init() {
    console.log(this.product)
    Alpine.effect(() => {
      console.log(this.selectedVariant)
    })
  },
  destroy() {
   
  },
  loadTransitionRules() {

  },
  increaseQuantity() {
    if (this.quantity <= 20) {
      this.quantity++;
    }
  },
  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  },
  setVariant(variantId: number) {
    this.selectedVariantId = variantId;
  },
  get selectedOptions() {
    return this.selectedVariant?.options
  },
  get selectedVariant() {
    return this.variants.find((variant) => variant.id === this.selectedVariantId)
  },
  get transitionRules() {
    return []
  }
});
