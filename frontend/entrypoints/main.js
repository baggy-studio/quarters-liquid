import "vite/modulepreload-polyfill";

import { swup } from "./swup";

import Alpine from "alpinejs";
import collapse from "@/plugins/collapse";
import swipePlugin from "alpinejs-swipe";

import focus from "@alpinejs/focus";
import intersect from "@alpinejs/intersect"; 
import collection from "@/components/collection";
import marquee from "@/components/marquee";
import cartForm from "@/components/cart-form";
import cartLine from "@/components/cart-line";
import carousel from "@/components/carousel";
import productCarousel from "@/components/product-carousel";
import hoursfullScreen from "@/components/hours-info-fullscreen";
import faqs from "@/components/faqs";
import productRecommendations from "@/components/product-recommendations";
import newsletter from "@/components/newsletter";
import cookieConsent from "@/components/cookie-consent";
import app from "@/components/app";
import collectionNav from "@/components/collection-nav";
import productVariantSelector from "@/components/product-variant-selector";
import productFullscreen from "@/components/product-fullscreen";
import footer from "@/components/footer";
import barMenu from "@/components/sticky-bar-menu";
import barMenus from "@/components/bar-menus";
import video from "@/components/video";
import { store as cartStore } from "@/stores/cart";
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

Alpine.directive("number", (el, { expression }, { evaluateLater, effect }) => {
    let setNumber = evaluateLater(expression);

    effect(() => {
        setNumber((no) => {
            el.innerHTML = no < 10 && no > 0 ? `0${no}` : no;
        });
    });
});

Alpine.plugin(intersect);
Alpine.plugin(focus);
Alpine.plugin(collapse);
Alpine.plugin(swipePlugin);
Alpine.store('cart', cartStore)
Alpine.data("footer", footer); 
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
Alpine.data("hoursfullScreen", hoursfullScreen);
Alpine.data("faqs", faqs);
Alpine.data("barMenu", barMenu); 
Alpine.data('video', video)
// Ensure DOM is ready before starting AlpineJS
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Alpine.start();
    });
} else {
    Alpine.start();
}
