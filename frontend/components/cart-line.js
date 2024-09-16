import { money as shopifyMoney } from "@/utils";

export default () => ({
  async remove(lineId) {
    const cart = this.$store.cart;

    const updates = {
      [lineId]: 0,
    };

    await cart.updateLines(updates);
  },
  async decreaseQty(lineId, lineQty) {
    let qty = lineQty - 1;

    const cart = this.$store.cart;

    const updates = {
      [lineId]: qty,
    };
    await cart.updateLines(updates);
  },
  async increaseQty(lineId, lineQty) {
    let qty = lineQty + 1;

    const cart = this.$store.cart;

    const updates = {
      [lineId]: qty,
    };

    await cart.updateLines(updates);
  },
  money(price) {
    return shopifyMoney(price);
  },
});
