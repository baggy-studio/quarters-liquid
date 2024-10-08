import { lerp, range } from "@/utils";
import { animate } from "motion";
import { expoInOut } from "@/easing";
import Alpine from "alpinejs";
import { swup } from "../entrypoints/swup";

export default () => ({
  abortController: new AbortController(),
  abortControllerResize: new AbortController(),
  raf: null,
  aspectRatio: window.innerWidth / window.innerHeight,
  transformX: 0,
  transformY: 0,
  transformScale: 1,
  transformWidth: window.innerWidth,
  transformHeight: window.innerWidth * (window.innerWidth / window.innerHeight),
  selectedIndex: 0,
  visible: false,
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
  contentReplace: () => { },
  init() {
    window.addEventListener('pointermove', this.move.bind(this), {
      signal: this.abortController.signal
    })

    window.addEventListener('resize', this.resize.bind(this), {
      signal: this.abortControllerResize.signal
    })

    window.addEventListener('fullscreen:close', this.closeFullscreen.bind(this), {
      signal: this.abortController.signal
    });

    this.draw()

    this.contentReplace = () => {
      setTimeout(() => {
        const fullscreenElement = document.querySelector('[data-fullscreen]');
        if (!fullscreenElement) {
          console.error('Fullscreen element not found');
          return;
        }
        
        const fullscreenImages = document.querySelectorAll('[data-fullscreen-image]');
  
        this.media = Array.from(fullscreenImages).map((el) => {
          const width = parseFloat(el.dataset.width);
          const height = parseFloat(el.dataset.height);
          const aspectRatio = parseFloat(el.dataset.aspectRatio);
          const src = el.dataset.src || el.querySelector('img')?.src;
          const alt = el.dataset.alt || el.querySelector('img')?.alt;
          const caption = el.dataset.caption;
          
          return {
            width,
            height,
            aspectRatio,
            src,
            alt,
            caption
          };
        });
  
        this.mediaCount = this.media.length;
        fullscreenElement.dataset.count = this.mediaCount.toString();
  
        if (this.media.length > 0) {
          this.selectedIndex = 0;
          this.resize();
        } else {
          console.error('No media items found');
        }
      }, 100);
    };

    this.contentReplace()

    swup.hooks.on('content:replace', this.contentReplace)

    Alpine.effect(() => {
      if (typeof this.selectedIndex === 'number' && this.visible && !this.animating) {
        if (this.fromLarge) {
          this.$dispatch('fullscreen:index', this.selectedIndex)
        } else {
          this.$dispatch('fullscreen:index', this.selectedIndex - 1)
        }
      }
    })
  },
  move(e: MouseEvent) {
    this.pointer.x = e.clientX
    this.pointer.y = e.clientY
  },
  draw() {
    const x = this.pointer.x
    const y = this.pointer.y

    this.pointer.last.x = lerp(this.pointer.last.x, x, 0.05)
    this.pointer.last.y = lerp(this.pointer.last.y, y, 0.05)

    this.raf = requestAnimationFrame(this.draw.bind(this))
  },
  destroy() {
    this.abortController.abort()
    this.abortControllerResize.abort()
    swup.hooks.off('content:replace', this.contentReplace)

    if (this.raf) {
      cancelAnimationFrame(this.raf)
    }
  },
  async openFullscreen(e, { large = false, index = 0, clickedElement }) {
    if (this.animating || this.media.length === 0) {
      return;
    }

    this.lockScroll();
    this.draw();

    this.fromLarge = large;
    this.selectedIndex = Math.min(index, this.media.length - 1);

    this.visible = true;

    this.pointer.x = e.clientX;
    this.pointer.y = e.clientY;
    this.pointer.last.x = e.clientX;
    this.pointer.last.y = e.clientY;

    
    this.fromPosition = this.getClickedImageDimensions(clickedElement);

    if (!this.fromPosition) {
      return;
    }

    this.originalImage = {
      element: clickedElement,
      rect: this.fromPosition,
      scrollY: window.scrollY
    };

    this.aspectRatio = this.fromPosition.width / this.fromPosition.height;

    // if (window.innerWidth >= 1024) {
    //   await this.onAnimateOpen();
    // }
    this.onAnimateOpen();

    this.animating = false;
  },
  async closeFullscreen() {
    if (this.animating) {
      return;
    }

    this.animating = true;

    if (this.originalImage && this.originalImage.element) {
      const currentRect = this.originalImage.element.getBoundingClientRect();
      const scrollDiff = window.scrollY - this.originalImage.scrollY;
  
      this.fromPosition = {
        left: currentRect.left,
        top: currentRect.top - scrollDiff,
        width: currentRect.width,
        height: currentRect.height
      };
    } else {
      // Fallback to previous behavior if no original element is stored
      if (this.fromLarge) {
        this.fromPosition = this.getLargeImageDimensions()
      } else {
        this.fromPosition = this.getSmallImageDimensions()
      }
    }

    if (window.innerWidth >= 1024) {
      await this.onAnimateClose()
    } else {
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    this.animating = false
    this.visible = false

    if (this.raf) {
      cancelAnimationFrame(this.raf)
    }

    this.unlockScroll()

    if (this.$refs.fullscreenFixed) {
      this.$refs.fullscreenFixed.scrollTop = 0;
    }
  },
  nextImage() {
    this.selectedIndex = (this.selectedIndex + 1) % this.mediaCount;
    
    this.$nextTick(() => {
      this.resize();
      this.$dispatch('fullscreen:index', this.selectedIndex);
      if (this.$refs.fullscreenFixed) {
        this.$refs.fullscreenFixed.scrollTop = 0;
      }
    });
  },
  advanceImage(index: number) {
    this.selectedIndex = index
    document.querySelector('[data-fullscreen-fixed]')?.scrollTo({ top: 0 })

    this.resize()
  },
  resize() {
    this.transformWidth = window.innerWidth;
    if (this.activeMedia && this.activeMedia.aspectRatio) {
      const heightBasedOnAspectRatio = this.transformWidth / this.activeMedia.aspectRatio;
      this.transformHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight);
    } else {
      this.transformHeight = window.innerHeight;
    }
  },
  getLargeImageDimensions() {
    const largeImage = document.querySelector('[data-large-image]')
    if (!largeImage) return
    const dimensions = largeImage.getBoundingClientRect()
    return dimensions
  },
  getClickedImageDimensions(clickedElement) {
    if (!clickedElement) return null;
    return clickedElement.getBoundingClientRect();
  },
  getSmallImageDimensions() {
    const smallImage = document.querySelector('[data-small-image]')
    if (!smallImage) return
    const dimensions = smallImage.getBoundingClientRect()
    return dimensions
  },
  getFullscreenDimensions() {
    const fullscreen = document.querySelector('[data-fullscreen]')
    if (!fullscreen) return
    const dimensions = fullscreen.getBoundingClientRect()
    return dimensions
  },
  async onAnimateOpen() {
    if (!this.activeMedia) {
      return;
    }

    this.animating = true;

    const targetWidth = window.innerWidth;
    const heightBasedOnAspectRatio = targetWidth / (this.activeMedia.aspectRatio || this.aspectRatio);
    const targetHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight);

    return await animate((progress) => {
      this.transformX = range(0, 1, this.fromPosition.left, 0, progress);
      this.transformY = range(0, 1, this.fromPosition.top, 0, progress);
      this.transformWidth = range(0, 1, this.fromPosition.width, targetWidth, progress);
      this.transformHeight = range(0, 1, this.fromPosition.height, targetHeight, progress);
    }, { duration: 1.2, easing: expoInOut }).finished;
  },
  async onAnimateClose() {
    this.animating = true
  
    const fullscreenFixed = document.querySelector('[data-fullscreen-fixed]');
    const fullscreenFixedRect = fullscreenFixed?.getBoundingClientRect();
    const fromTop = this.fromPosition.top - (fullscreenFixedRect?.top ?? 0);
  
    const startX = this.transformX;  // Use current transform X
    const startY = this.transformY;  // Use current transform Y
    const startWidth = this.transformWidth;
    const startHeight = this.transformHeight;
  
    return await animate((progress) => {
      this.transformX = range(0, 1, startX, this.fromPosition.left, progress)
      this.transformY = range(0, 1, startY, fromTop, progress)
      this.transformWidth = range(0, 1, startWidth, this.fromPosition.width, progress)
      this.transformHeight = range(0, 1, startHeight, this.fromPosition.height, progress)
    }, { duration: 1.4, easing: expoInOut }).finished
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
    const index = this.selectedIndex + 1
    return index < 10 ? `0${index}` : index;
  },
  get activeMedia() {
    if (!this.media || this.media.length === 0) {
      console.warn('No media items available');
      return null;
    }
    return this.media[this.selectedIndex] || null;
  }
});