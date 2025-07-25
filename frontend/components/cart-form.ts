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
    const formData = new FormData(this.$refs.form);

    const variant = formData.get("id");
    const quantity = formData.get("quantity");
    const compareAtPrice = formData.get("properties[_compareAtPrice]");
    const ooak = formData.get("properties[_ooak]");

    const payload = [
      {
        id: Number(variant),
        quantity: Number(quantity) || 1,
        properties: {
          ...(ooak && { _ooak: ooak }),
          ...(compareAtPrice && { _compareAtPrice: compareAtPrice })
        }
      },
    ];

    console.log(payload);

    await this.$store.cart.addLines(payload);
  },
});
