import { swup } from "../entrypoints/swup";
import { animate } from "motion";
import { expoInOut } from "@/easing";
export const store = {
    data: JSON.parse(document.getElementById("cart-data")?.innerHTML ?? '{}'),
    visible: false,
    loading: false,
    el: document.getElementById("cart"),
    container: document.getElementById("cart-container"),
    init() {
        window.Shopify.designMode && this.customizer();

        swup.hooks.on('animation:out:end', () => {
            this.close();
        });

        swup.hooks.on('link:self', () => {
            if (this.visible) {
                this.close();
            }
        });

        let searchParams = new URLSearchParams(window.location.search);

        if (searchParams.get("cart")) {
            this.forceOpen();
        }


    },
    async open() {
        this.visible = true;

        this.lockScroll();

        await animate(this.container, {
            transform: "translateX(0%)",
        }, { duration: 1.2, easing: expoInOut }).finished
    },
    async close() {
        this.visible = false;

        await animate(this.container, {
            transform: "translateX(100%)",
        }, { duration: 1.2, easing: expoInOut }).finished

        this.unlockScroll();

    },
    lockScroll() {
        document.body.style.overflow = 'hidden';
    },
    unlockScroll() {
        document.body.style.overflow = 'auto';
    },
    toggle() {
        if (this.visible) {
            this.close();
        } else {
            this.open();
        }
    },
    customizer() {
        document.addEventListener("shopify:section:select", (event) => {
            const { sectionId } = event.detail;
            if (sectionId.includes("cart")) {
                this.open();
            }
        });

        document.addEventListener("shopify:section:deselect", () => {
            this.close();
        });
    },
    async request(url, method = "GET", body) {
        return await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
        }).then((r) => r.json());
    },
    async load() {
        return await this.request("/cart.js", "GET");
    },
    async updateLines(lineItems = {}) {
        if (this.loading) return;
        try {
            this.loading = true;
            this.data = await this.request("/cart/update.js", "POST", {
                updates: lineItems,
            });
        } finally {
            this.loading = false;
        }
    },
    async addLines(lineItems = []) {
        if (this.loading) return;
        try {
            this.loading = true;
            await this.request("/cart/add.js", "POST", {
                items: lineItems,
            });
        } catch (error) {
            throw Error(error);
        } finally {
            this.data = await this.load();
            this.loading = false;

            if (!this.visible) {
                this.open();
            }
        }
    },
    get count() {
        if (!this.data) return 0;
        return this.data.item_count;
    },
    get hasItems() {
        if (!this.data) return false;
        return this.data.item_count > 0;
    },
    get totalPrice() {
        if (!this.data) return 0;
        return this.data.original_total_price;
    },
    get subtotalPrice() {
        if (!this.data) return 0;
        return this.data.items_subtotal_price;
    },
    get items() {
        if (!this.data) return [];
        return this.data.items || [];
    }

};