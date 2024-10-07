import { money as shopifyMoney } from "@/utils";

export default () => ({
  async remove(lineId) {

    const updates = {
      [lineId]: 0,
    };

    this.$dispatch("cart:update", updates);
  },
  async decreaseQty(lineId, lineQty) {
    let quantity = lineQty - 1;
    const updates = {
      [lineId]: quantity,
    };
    this.$dispatch("cart:update", updates);

  },
  async increaseQty(lineId, lineQty) {
    let quantity = lineQty + 1;

    const updates = {
      [lineId]: quantity,
    };

    this.$dispatch("cart:update", updates);
  },
  get qty() {
    return this.line.quantity < 10 ? `0${this.line.quantity}` : this.line.quantity;
  },
  get variantLine() {
    return this.line.variant_title?.replace(" /", ", ");
  },
  money(price) {
    return shopifyMoney(price);
  },
});
