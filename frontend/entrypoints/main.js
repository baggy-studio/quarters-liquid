import "vite/modulepreload-polyfill";

import { swup } from "./swup";

import Alpine from "alpinejs";
import collapse from "@/plugins/collapse";
import focus from "@alpinejs/focus";
import intersect from "@alpinejs/intersect";
import cart from "@/components/cart";
import collection from "@/components/collection";
import marquee from "@/components/marquee";
import cartForm from "@/components/cart-form";
import cartLine from "@/components/cart-line";
import carousel from "@/components/carousel";
import productCarousel from "@/components/product-carousel";
import productRecommendations from "@/components/product-recommendations";
import newsletter from "@/components/newsletter";
import cookieConsent from "@/components/cookie-consent";
import app from "@/components/app";
import collectionNav from "@/components/collection-nav";
import productVariantSelector from "@/components/product-variant-selector";
import productFullscreen from "@/components/product-fullscreen";
import footer from "@/components/footer";

import { getQuantity, money } from "@/utils";

Alpine.directive("quantity", (el, { expression }, { evaluateLater, effect }) => {
    let setQuantity = evaluateLater(expression);

    effect(() => {
        setQuantity((qty) => {
            el.innerHTML = getQuantity(qty);
        });
    });
});

Alpine.directive("money", (el, { expression }, { evaluateLater, effect }) => {
    let setMoney = evaluateLater(expression);

    effect(() => {
        setMoney((price) => {
            el.innerHTML = money(price)
        });
    });
});



Alpine.plugin(intersect);
Alpine.plugin(focus);
Alpine.plugin(collapse);
Alpine.data("footer", footer);
Alpine.data("cart", cart);
Alpine.data("app", app);
Alpine.data("cookieConsent", cookieConsent);
Alpine.data("cartLine", cartLine);
Alpine.data("carousel", carousel);
Alpine.data("productCarousel", productCarousel);
Alpine.data("cartForm", cartForm);
Alpine.data("newsletter", newsletter);
Alpine.data("marquee", marquee);
Alpine.data("collection", collection);
Alpine.data("collectionNav", collectionNav);
Alpine.data("productRecommendations", productRecommendations);
Alpine.data("productVariantSelector", productVariantSelector);
Alpine.data("productFullscreen", productFullscreen);
Alpine.start();
