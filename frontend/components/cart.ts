import Alpine from "alpinejs";
import { swup } from "../entrypoints/swup";
import { animate } from "motion";
import { expoInOut } from "@/easing";

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


export default () => ({
    visible: false,
    loading: false,
    cart: JSON.parse(document.getElementById("cart-data")?.innerHTML || "{}"),
    init() {
        Shopify.designMode && this.customizer();

        swup.hooks.on(
            "link:click",
            () => {
                this.close();
            },
            { before: true }
        );

        swup.hooks.on("visit:start", () => {
            this.close();
        });

        // Create a URL object
        const { searchParams } = new URL(window.location.href);
        const cartParam = searchParams.get("cart");

        if (cartParam) {
            this.open();
        }

        Alpine.effect(() => {
            if (!this.loading) {
                this.$dispatch("cart:complete");

            }
        });

        Alpine.effect(() => {
            if (typeof this.count == "number") {
                this.$dispatch("cart:count", this.count);
            }
        });
    },
    async close() {
        this.visible = false;

        await animate(this.$refs.container, {
            transform: "translateX(100%)",
        }, { duration: 1.2, easing: expoInOut }).finished

    },
    toggle() {
        if (this.visible) {
            this.close();
        } else {
            this.open();
        }
    },
    async open() {
        this.visible = true;

        await animate(this.$refs.container, {
            transform: "translateX(0)",
        }, { duration: 1.2, easing: expoInOut }).finished

    },
    async load(fromAdd) {
        this.loading = true;

        try {
            this.cart = await cartFetch("/cart.js", "get");
        } catch (error) {
            console.error(error);
        } finally {
            if (fromAdd) {
                this.open();

                if (window.innerWidth < 1024) { 
                    this.$dispatch("fullscreen:close");
                }
            }
            this.loading = false;
        }
    },
    async updateLines({ detail: lineItems }) {
        if (this.loading) return;
        this.loading = true;

        try {
            this.cart = await cartFetch("/cart/update.js", "post", {
                updates: lineItems,
            });
        } catch (error) {
            throw Error(error);
        } finally {
            this.loading = false;
        }
    },
    async addLines({ detail: lineItems }) {
        if (this.loading) return;
        this.loading = true;
        try {
            await cartFetch("/cart/add.js", "post", {
                items: lineItems,
            });
        } catch (error) {
            throw Error(error);
        } finally {
            this.load(true);
        }
    },
    get count() {
        return this.cart?.item_count || 0;
    },
    get hasItems() {
        return this.cart?.item_count > 0 || false;
    },
    get totalPrice() {
        return this.cart?.original_total_price;
    },
    get subtotalPrice() {
        return this.cart?.items_subtotal_price;
    },
    get cartLines() {
        return this.cart?.items || [];
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
});