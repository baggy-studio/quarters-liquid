import { money as shopifyMoney } from "@/utils";

export default () => ({
  async remove(lineId) {

    const updates = {
      [lineId]: 0,
    };
    await this.$store.cart.updateLines(updates);

  },
  async decreaseQty(lineId, lineQty) {
    let quantity = lineQty - 1;
    const updates = {
      [lineId]: quantity,
    }; await this.$store.cart.updateLines(updates);


  },
  async increaseQty(lineId, lineQty) {
    let quantity = lineQty + 1;

    const updates = {
      [lineId]: quantity,
    };
    await this.$store.cart.updateLines(updates);

  },
  get variantLine() {
    return this.line.variant_title?.replace(" /", ", ");
  },
  money(price) {
    return shopifyMoney(price);
  },
});
