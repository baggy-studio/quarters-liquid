import "vite/modulepreload-polyfill";

import { swup } from "./swup";

import Alpine from "alpinejs";
import collapse from "@/plugins/collapse";
import focus from "@alpinejs/focus";
import intersect from "@alpinejs/intersect";

import { money } from "@/utils";

import cart from "@/stores/cart";
import collection from "@/components/collection";
import marquee from "@/components/marquee";
import cartForm from "@/components/cart-form";
import cartLine from "@/components/cart-line";
import carousel from "@/components/carousel";
import productRecommendations from "@/components/product-recommendations";
import newsletter from "@/components/newsletter";
import cookieConsent from "@/components/cookie-consent";
import app from "@/components/app";

Alpine.directive("money", (el, { expression }, { evaluateLater, effect }) => {
  let setMoney = evaluateLater(expression);

  effect(() => {
    setMoney((price) => {
      const currency = el.dataset.currency;
      el.innerHTML = `${currency ? `<sup class="text-[65%] mr-[1px]">${currency}</sup>` : ""
        }${money(price)}`;
    });
  });
});

Alpine.plugin(intersect);
Alpine.plugin(focus);
Alpine.plugin(collapse);

Alpine.store("cart", cart);

Alpine.data("app", app);
Alpine.data("cookieConsent", cookieConsent);
Alpine.data("cartLine", cartLine);
Alpine.data("carousel", carousel);
Alpine.data("cartForm", cartForm);
Alpine.data("newsletter", newsletter);
Alpine.data("marquee", marquee);
Alpine.data("collection", collection);
Alpine.data("productRecommendations", productRecommendations);
Alpine.start();
