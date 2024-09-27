import EmblaCarousel from "embla-carousel";

export default (
  options = {
    loop: true,
  }
) => ({
  carousels: {
    large: null,
    small: null,
  },

  largeCarousel: null,
  smallCarousel: null,


  carousel: null,
  canScrollNext: true,
  canScrollPrev: false,
  currentIndex: 0,
  init() {
    if (!this.$refs.large) return;
    this.carousels.large = EmblaCarousel(this.$refs.large, options);

    if (this.$refs.small) {
      this.carousels.small = EmblaCarousel(this.$refs.small, {
        loop: true,
        watchDrag: false,
      });
    }

    this.carousels.large.on("init", (carousel) => {
      this.update(carousel);
    });


    this.carousels.large.on("select", (carousel) => {
      this.update(carousel);
      if (this.carousels.small) {
        this.carousels.small.scrollTo(this.index);
      }
      this.$dispatch('onselect', this.index)
    });

    this.carousels.large.on("resize", (carousel) => {
      this.update(carousel);
    });
  },
  next() {
    this.carousels.large.scrollNext();
  },
  prev() {
    this.carousels.large.scrollPrev();
  },
  scrollTo(t) {
    this.carousels.large.scrollTo(t);
  },
  update(carousel) {
    if (!carousel) return;

    this.currentIndex = carousel.selectedScrollSnap();
    this.canScrollNext = carousel.canScrollNext();
  },
  destroy() {
    if (this.carousels.large) {
      this.carousels.large.destroy();
    }

    if (this.carousels.small) {
      this.carousels.small.destroy();
    }
  },
  get index() {
    const index = this.currentIndex + 1
    return index < 10 ? `0${index}` : index;
  },
});
