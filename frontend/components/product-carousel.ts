import EmblaCarousel from "embla-carousel";

export default (
  options = {
    loop: true,
  }
) => ({
  carousel: null,
  syncCarousel: null,
  canScrollNext: true,
  canScrollPrev: false,
  scrollSnaps: 0,
  index: 0,
  init() {
    this.carousel = EmblaCarousel(this.$root, options);

    this.carousel.on("init", (carousel) => {
      this.update(carousel);
    });

    this.carousel.on("select", (carousel) => {
      this.update(carousel);
      this.$dispatch('onselect', this.index)
    });

    this.carousel.on("resize", (carousel) => {
      this.update(carousel);
    });

  
  },
  next() {
    this.carousel.scrollNext();
  },
  prev() {
    this.carousel.scrollPrev();
  },
  scrollTo(t) {
    this.carousel.scrollTo(t);
  },
  update(carousel) {
    if (!carousel) return;

    this.index = carousel.selectedScrollSnap();
    this.canScrollNext = carousel.canScrollNext();
    this.canScrollPrev = carousel.canScrollPrev();
    this.scrollSnaps = carousel.scrollSnapList();
  },
  destroy() {
    if (this.carousel) {
      this.carousel.destroy();
    }
  },
});
