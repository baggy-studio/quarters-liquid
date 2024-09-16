export default (id, url) => ({
  hidden: false,
  init() {
    this.fetchProducts();
  },
  async fetchProducts() {
    await fetch(url)
      .then((response) => response.text())
      .then((text) => {
        const html = document.createElement("div");
        html.innerHTML = text;
        const recommendations = html.querySelector("." + id);

        const productRecommendationsSection = this.$root.querySelector(
          "." + id
        ); 

        if (recommendations && recommendations.innerHTML.trim().length) {
          productRecommendationsSection.innerHTML = recommendations.innerHTML;
        } else {
          // No products returned from Shopify
          this.hidden = true;
        }
      })
      .catch((e) => {
        console.error(e);
      });
  },
});
