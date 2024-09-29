import { updateCache } from "../entrypoints/swup";

export default (id, url) => ({
  hidden: false, 
  init() {
    this.fetchProducts();
  },
  async fetchProducts() {
    const sectionId = "." + id;
    const data = await fetch(url).then((response) => response.text());

    const html = document.createElement("div");
    html.innerHTML = data;

    const recommendations = html.querySelector(sectionId);
    const productRecommendationsSection = this.$root.querySelector(sectionId);

    if (recommendations && recommendations.innerHTML.trim().length) {
      productRecommendationsSection.innerHTML = recommendations.innerHTML;
    } else {
      this.hidden = true;
    }

    updateCache()
  }
});
