import EmblaCarousel from "embla-carousel";

export default (
  options = {
    loop: true,
  }
) => ({
  carousel: null,
  canScrollNext: true,
  canScrollPrev: true,
  canLoop: true,
  scrollSnaps: 0,
  index: 0,
  init() {

    if (this.$refs.container) {
      this.carousel = EmblaCarousel(this.$refs.container, {
        ...options,
        container: this.$refs.container,
      });
    } else {
      this.carousel = EmblaCarousel(this.$root, options);
    }

    this.update(this.carousel);

    this.carousel.on("init", (carousel) => {
      this.update(carousel);
    });

    this.carousel.on('slidesInView', (carousel) => {
      this.update(carousel);
    })

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

    if (carousel.slideNodes().length < 5) {
      this.canLoop = false;
    }

  },
  destroy() {
    if (this.carousel) {
      this.carousel.destroy();
    }
  },
});
