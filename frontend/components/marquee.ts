import EmblaCarousel from "embla-carousel";
import AutoScroll from "embla-carousel-auto-scroll";

export default ({ speed }) => ({
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
          speed,
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
