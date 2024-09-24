import { swup } from "@/entrypoints/swup";

export const cartFetch = async function (endpoint, type = "POST", data) {
  try {
    return await fetch(endpoint, {
      method: type,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json());
  } catch (error) {
    throw error;
  }
};

const initialData = JSON.parse(document.getElementById("cart-data").innerHTML);

export default {
  data: initialData,
  visible: false,
  threshold: 0,
  loading: false,
  init() {
    Shopify.designMode && this.customizer();

    swup.hooks.on(
      "visit:start",
      () => {
        this.close();
      },
      { before: true }
    );

    // Create a URL object
    const { searchParams } = new URL(window.location.href);
    const cartParam = searchParams.get("cart");

    if (cartParam) {
      this.open();
    }
  },
  open() {
   
    this.visible = true;

    console.log(this.visible,"open");
  },
  close() {
    this.visible = false;
  },
  setShopify(cart) {
    this.data = cart;
  },
  async load(fromAdd) {
    this.loading = true;

    try {
      const data = await cartFetch("/cart.js", "get");
      this.setShopify(data);
    } catch (error) {
      console.error(error);
    } finally {
      if (fromAdd) {
        this.visible = true;
      }

      this.loading = false;
    }
  },
  async updateLines(lineItems = {}) {
    if (this.loading) return;
    this.loading = true;

    try {
      const cart = await cartFetch("/cart/update.js", "post", {
        updates: lineItems,
      });

      this.setShopify(cart);
    } catch (error) {
      throw Error(error);
    } finally {
      this.loading = false;
    }
  },
  async addLines(lineItems = []) {
    if (this.loading) return;
    this.loading = true;
    try {
      await cartFetch("/cart/add.js", "post", {
        items: lineItems,
      });
    } catch (error) {
      throw Error(error);
    } finally {
      this.containerReset();
      this.load(true);
    }
  },
  containerReset() {
    this.$refs.container.scroll({ top: 0, behavior: "smooth" });
  },
  get count() {
    return this.data?.item_count || 0;
  },
  get hasItems() {
    return this.data?.item_count > 0 || false;
  },
  get totalPrice() {
    return this.data?.original_total_price;
  },
  get subtotalPrice() {
    return this.data?.items_subtotal_price;
  },
  get cartLines() {
    return this.data?.items || [];
  },
  customizer() {
    document.addEventListener("shopify:section:select", ({ detail }) => {
      const { sectionId } = detail;
      if (sectionId == "cart") {
        this.visible = true;
      }
    });

    document.addEventListener("shopify:section:deselect", () => {
      this.visible = false;
    });
  },
};
