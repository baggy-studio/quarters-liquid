import { swup } from "@/entrypoints/swup";

export default () => ({
  quantity: 1,
  contentReplace: () => { },
  init() {

    this.contentReplace = () => {
      this.quantity = 1;
    }

    swup.hooks.on('content:replace', this.contentReplace)
  },
  destroy() {
    swup.hooks.off('content:replace', this.contentReplace)
  },
  decreaseQuantity() {
    this.quantity--;
  },
  increaseQuantity() {
    this.quantity++;
  },
  async submit(e) {
    e.preventDefault();
    const formData = new FormData(this.$root);

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
