import { swup } from "@/entrypoints/swup";
import { clamp } from "@/utils";

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
  active: false,
  threshold: 0,
  loading: false,
  container: null,
  init() {
    this.threshold =
      document.querySelectorAll("[data-threshold]")[0].dataset?.threshold || 0;
    this.container = document.getElementById("cart-container");

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

    // Get the value of the 'cart' parameter
    const cartParam = searchParams.get("cart");

    if (cartParam) {
      this.open();
    }
  },
  open() {
   // this.container.scroll({ top: 0 });
    this.active = true;
  },
  close() {
    this.active = false;
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
        this.active = true;
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
    this.container.scroll({ top: 0, behavior: "smooth" });
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
  get freeShippingProgress() {
    let progress = (this.data?.total_price / (this.threshold * 100)) * 100;
    let t = -100 + progress;

    return clamp(t, -100, 0) + "%";
  },
  get hasFreeShipping() {
    const left = this.threshold * 100 - this.data?.total_price;
    return left <= 0;
  },
  get freeShippingLeft() {
    const left = this.threshold * 100 - this.data?.total_price;
    let money = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    let totalLeft = money.format(Number(left / 100));

    let firstPart = totalLeft.split(".")[0];

    return totalLeft?.startsWith("$0.") ? totalLeft : firstPart;
  },
  customizer() {
    document.addEventListener("shopify:section:select", ({ detail }) => {
      const { sectionId } = detail;
      if (sectionId == "cart") {
        this.active = true;
      }
    });

    document.addEventListener("shopify:section:deselect", () => {
      this.active = false;
    });
  },
};
