import EmblaCarousel from "embla-carousel";
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';

export default (
  options = {
    loop: true,
    skipSnaps: true,
    containScroll: 'trimSnaps',
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
        skipSnaps: true,
        container: this.$refs.container,
      }, [WheelGesturesPlugin()]);
    } else {
      this.carousel = EmblaCarousel(this.$root, {
        ...options,
        skipSnaps: true,
      }, [WheelGesturesPlugin()]);
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
    this.totalSlides = carousel.slideNodes().filter(node => node.childElementCount > 0).length;
    // console.log('Slide nodes:', carousel.slideNodes());
    // console.log('Non-empty slide nodes:', carousel.slideNodes().filter(node => node.childElementCount > 0));
    // console.log('Total slides:', this.totalSlides);
  },
  destroy() {
    if (this.carousel) {
      this.carousel.destroy();
    }
  },
});
