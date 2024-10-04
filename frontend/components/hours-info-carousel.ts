import EmblaCarousel from "embla-carousel";
import { animate } from "motion";
import { expoInOut } from "@/easing";
import { lerp, range } from "@/utils";
import Alpine from "alpinejs";

export default () => ({
  carousel: null,
  abortController: new AbortController(),
  abortControllerResize: new AbortController(),
  raf: null,
  visible: false,
  aspectRatio: window.innerWidth / window.innerHeight,
  transformX: 0,
  transformY: 0,
  transformScale: 1,
  transformWidth: window.innerWidth,
  transformHeight: window.innerWidth * (window.innerWidth / window.innerHeight),
  selectedIndex: 0,
  showCursor: true, // Show cursor on desktop
  animating: false,
  pointer: {
    x: 0,
    y: 0,
    last: {
      x: 0,
      y: 0,
    }
  },
  fromPosition: {},
  fromLarge: false,
  mediaCount: 0,
  media: [],

  init() {
    this.carousel = EmblaCarousel(this.$refs.viewport, {
      loop: false,
      dragFree: true,
      containScroll: 'trimSnaps',
      slidesToScroll: 1
    });

    window.addEventListener('pointermove', this.move.bind(this), {
      signal: this.abortController.signal
    });

    window.addEventListener('resize', this.resize.bind(this), {
      signal: this.abortControllerResize.signal
    });

    this.draw();

    this.mediaCount = this.$refs.viewport.querySelectorAll('[data-fullscreen-image]').length;
    this.media = Array.from(this.$refs.viewport.querySelectorAll('[data-fullscreen-image]')).map((el) => {
      const width = parseFloat(el.dataset.width);
      const height = parseFloat(el.dataset.height);
      const aspectRatio = parseFloat(el.dataset.aspectRatio);
      const src = el.dataset.src;
      const caption = el.dataset.caption;
      return {
        width,
        height,
        aspectRatio,
        src,
        caption,
        alt: el.alt
      };
    });

    Alpine.effect(() => {
      if (typeof this.selectedIndex === 'number' && this.visible && !this.animating) {
        this.$dispatch('fullscreen:index', this.selectedIndex);
      }
    });
  },

  move(e) {
    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
  },

  draw() {
    const x = this.pointer.x;
    const y = this.pointer.y;

    this.pointer.last.x = lerp(this.pointer.last.x, x, 0.05);
    this.pointer.last.y = lerp(this.pointer.last.y, y, 0.05);

    this.raf = requestAnimationFrame(this.draw.bind(this));
  },

  destroy() {
    this.abortController.abort();
    this.abortControllerResize.abort();
    if (this.carousel) {
      this.carousel.destroy();
    }
    if (this.raf) {
      cancelAnimationFrame(this.raf);
    }
  },

  async openFullscreen(e, { index = 0 }) {
    if (this.animating) return;

    if (index < 0 || index >= this.media.length) {
      console.error(`Invalid index: ${index}. Media length: ${this.media.length}`);
      return;
    }
  

    this.lockScroll();
    this.draw();

    this.selectedIndex = index;
    this.visible = true;

    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
    this.pointer.last.x = e.clientX;
    this.pointer.last.y = e.clientY;

    this.fromPosition = e.target.getBoundingClientRect();
    this.aspectRatio = this.fromPosition.width / this.fromPosition.height;

    if (window.innerWidth >= 1024) {
      await this.onAnimateOpen();
    }

    this.animating = false;
  },

  async closeFullscreen() {
    if (this.animating) return;
  
    const fullscreenElement = this.$refs.fullscreenFixed;
    if (fullscreenElement) {
      const rect = fullscreenElement.getBoundingClientRect();
      // console.log('Fullscreen element rect:', rect);
    } else {
      // console.error('Fullscreen element not found.');
    }
  
    if (this.$refs.fullscreenImage) {
      this.fromPosition = this.$refs.fullscreenImage.getBoundingClientRect();
    } else {
      // console.error('Fullscreen image element not found.');
    }
  
    if (window.innerWidth >= 1024) {
      await this.onAnimateClose();
    }
  
    this.animating = false;
    this.visible = false;
  
    if (this.raf) {
      cancelAnimationFrame(this.raf);
    }
  
    this.unlockScroll();
  },
  

  nextImage() {
    this.selectedIndex = (this.selectedIndex + 1) % this.mediaCount;
  },

  prevImage() {
    this.selectedIndex = (this.selectedIndex - 1 + this.mediaCount) % this.mediaCount;
  },

  resize() {
    this.transformWidth = window.innerWidth;
    const heightBasedOnAspectRatio = this.transformWidth / this.activeMedia.aspectRatio;
    this.transformHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight);
  },

  async onAnimateOpen() {
    this.animating = true;

    if (!this.activeMedia) {
      console.error('No active media found');
      this.animating = false;
      return;
    }
  

    const targetWidth = window.innerWidth;
    const heightBasedOnAspectRatio = targetWidth / this.activeMedia.aspectRatio;
    const targetHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight);

    return await animate((progress) => {
      this.transformX = range(0, 1, this.fromPosition.left, 0, progress);
      this.transformY = range(0, 1, this.fromPosition.top, 0, progress);
      this.transformWidth = range(0, 1, this.fromPosition.width, targetWidth, progress);
      this.transformHeight = range(0, 1, this.fromPosition.height, targetHeight, progress);
    }, { duration: 1.2, easing: expoInOut }).finished;
  },

  async onAnimateClose() {
    this.animating = true;

    const fromTop = this.fromPosition.top - (this.$refs.fullscreenFixed?.getBoundingClientRect().top ?? 0);
    const startWidth = window.innerWidth;
    const heightBasedOnAspectRatio = startWidth / this.activeMedia.aspectRatio;
    const startHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight);

    return await animate((progress) => {
      this.transformX = range(0, 1, 0, this.fromPosition.left, progress);
      this.transformY = range(0, 1, 0, fromTop, progress);
      this.transformWidth = range(0, 1, startWidth, this.fromPosition.width, progress);
      this.transformHeight = range(0, 1, startHeight, this.fromPosition.height, progress);
    }, { duration: 1.4, easing: expoInOut }).finished;
  },

  get clipPath() {
    if (!this.visible) return 'none';

    const left = this.transformX;
    const top = this.transformY;
    const right = window.innerWidth - (this.transformX + this.transformWidth);
    const bottom = window.innerHeight - (this.transformY + this.transformHeight);

    return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
  },

  get nextIndex() {
    return (this.selectedIndex + 1) % this.mediaCount;
  },

  get index() {
    const index = this.selectedIndex + 1;
    return index < 10 ? `0${index}` : index;
  },

  get activeMedia() {
    if (this.selectedIndex < 0 || this.selectedIndex >= this.media.length) {
      console.warn(`Invalid selectedIndex: ${this.selectedIndex}. Media length: ${this.media.length}`);
      return null;
    }
    return this.media[this.selectedIndex];
  },

  lockScroll() {
    document.body.style.overflow = 'hidden';
  },

  unlockScroll() {
    document.body.style.overflow = '';
  },
  
  handleMouseEnter() {
    this.showCursor = false;
  },

  handleMouseLeave() {
    this.showCursor = true;
  },
});