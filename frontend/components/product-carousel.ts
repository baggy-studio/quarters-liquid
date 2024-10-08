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
  canScrollNext: true,
  canScrollPrev: false,
  currentIndex: 0,
  init() {
    if (!this.$refs.large) return;
    this.carousels.large = EmblaCarousel(this.$refs.large, {
      ...options,
      active: false,
      breakpoints: {
        '(min-width: 1024px)': {
          active: true,
        }
      }
    });

    if (this.$refs.small) {
      this.carousels.small = EmblaCarousel(this.$refs.small, {
        loop: true,
        watchDrag: false,
        active: false,
        breakpoints: {
          '(min-width: 1024px)': {
            active: true,
          }
        }
      });
    }

    this.carousels.large.on("init", (carousel) => {
      this.update(carousel);
    });


    this.carousels.large.on("select", (carousel) => {
      this.update(carousel);
      if (this.carousels.small) {
        this.carousels.small.scrollTo(this.currentIndex);
      }
      this.$dispatch('onselect', this.currentIndex)
    });

    this.carousels.large.on("resize", (carousel) => {
      this.update(carousel);
    });
  },
  next() {
    if (this.carousels.large) {
      this.carousels.large.scrollNext();
    }
  },
  prev() {
    if (this.carousels.large) {
      this.carousels.large.scrollPrev();
    }
  },
  scrollTo(t) {
    if (this.carousels.large) {
      this.carousels.large.scrollTo(t);
    }
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
  }
});
