import { Visit } from "swup";
import { swup, fragmentPlugin } from "../entrypoints/swup";

function fetchVariantSelectorData() {
  const script = document.querySelector('#product-variant-selector-data');
  if (!script) return [];
  const data = JSON.parse(script.innerHTML)
  return data;
}

export default (selectedVariantId: number) => ({
  productOptions: fetchVariantSelectorData(),
  selectedVariantId,
  contentReplace(visit: Visit) {
    this.productOptions = fetchVariantSelectorData()
  },
  init() {
    swup.hooks.on('content:replace', this.contentReplace)
  },
  destroy() {
    swup.hooks.off('content:replace', this.contentReplace)
  }
});
