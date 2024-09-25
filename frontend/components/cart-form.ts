export default () => ({
  quantity: 1,
  maxQty: null,
  init() {
    this.maxQty = this.$root.dataset.max;
  },
  decreaseQty() {
    if (this.quantity == 1) return;
    this.quantity--;
  },
  increaseQty() {
    if (this.maxQty <= this.quantity) {
      return;
    } else {
      this.quantity++;
    }
  },
  async add() {
    const formData = new FormData(this.$root);

    const variant = formData.get("id");

    const hazmat = formData.get("properties[hazmat]");
    const cartImage = formData.get("properties[_image]");

    const payload = [
      {
        id: Number(variant),
        quantity: Number(this.quantity) || 1,
        properties: {
          ...(hazmat && {
            Hazmat: hazmat,
          }),
          ...(cartImage && {
            _image: cartImage,
          }),
        },
      },
    ];

    await this.$store.cart.addLines(payload);
  },
});
