import EmblaCarousel from "embla-carousel";
import AutoScroll from "embla-carousel-auto-scroll";

export default () => ({
  carousel: null,
  init() {
    this.carousel = EmblaCarousel(
      this.$root,
      {
        loop: true,
        watchDrag: false,
      },
      [
        AutoScroll({
          startDelay: 0,
          speed: 0.65,
          playOnInit: true,
          stopOnInteraction: false,
          stopOnFocusIn: false,
          stopOnMouseEnter: false,
        }),
      ]
    );
  },
  destroy() {
    this.carousel.destroy();
  },
});
