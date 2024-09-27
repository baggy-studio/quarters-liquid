export default () => ({
  quantity: 1,
  maxQty: 20,
  init() {
    this.maxQty = this.$root.dataset.max;
  },
  decreaseQuantity() {
    if (this.quantity == 1) return;
    this.quantity--;
  },
  increaseQuantity() {
    if (this.maxQty <= this.quantity) {
      return;
    } else {
      this.quantity++;
    }
  },
  async submit() {
    const formData = new FormData(this.ref.form);

    const variant = formData.get("id");

    const payload = [
      {
        id: Number(variant),
        quantity: Number(this.quantity) || 1
      },
    ];

    console.log(payload);

    //  await this.$store.cart.addLines(payload);
  },
});
