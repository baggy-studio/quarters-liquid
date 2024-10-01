import EmblaCarousel from "embla-carousel";

export default (
  options = {
    loop: false,
    dragFree: true,
    containScroll: 'trimSnaps',
    slidesToScroll: 1
  }
) => ({
  carousel: null,
  canScrollNext: true,
  canScrollPrev: false,
  currentIndex: 0,
  scrollSnaps: 0,

  init() {
    if (!this.$refs.viewport) return;
    this.carousel = EmblaCarousel(this.$refs.viewport, options);

    this.carousel.on("init", (carousel) => {
      this.update(carousel);
    });

    this.carousel.on("select", (carousel) => {
      this.update(carousel);
      this.$dispatch('onselect', this.currentIndex)
    });

    this.carousel.on("resize", (carousel) => {
      this.update(carousel);
    });
  },

  scrollTo(t) {
    this.carousel.scrollTo(t);
  },

  update(carousel) {
    if (!carousel) return;

    this.currentIndex = carousel.selectedScrollSnap();
    this.canScrollNext = carousel.canScrollNext();
    this.canScrollPrev = carousel.canScrollPrev();
    this.scrollSnaps = carousel.scrollSnapList();
  },

  destroy() {
    if (this.carousel) {
      this.carousel.destroy();
    }
  },

  get index() {
    const index = this.currentIndex + 1
    return index < 10 ? `0${index}` : index;
  },
});