import { lerp, range } from "@/utils";
import { animate } from "motion";
import { expoInOut, easeOutQuad } from "@/easing";
import Alpine from "alpinejs";
import { swup } from "../entrypoints/swup";

export default () => ({
  abortController: new AbortController(),
  abortControllerResize: new AbortController(),
  aspectRatio: window.innerWidth / window.innerHeight,

  transformX: 0,
  transformY: 0,
  transformScale: 1,
  transformWidth: window.innerWidth,
  transformHeight: window.innerWidth * (window.innerWidth / window.innerHeight),
 
  selectedIndex: 0,
  transitionProgress: 0,
  transitioning: false,
  transitionTarget: null,

  visible: false,
  animating: false,
  pointer: {
    x: 0,
    y: 0
  },
  fromPosition: {},
  fromLarge: false,
  mediaCount: 0,
  media: [],
  timeOut: null,
  offsetY: 0,
  contentReplace: () => { },
  init() {
    window.addEventListener('pointermove', this.move.bind(this), {
      signal: this.abortController.signal
    })

    window.addEventListener('resize', this.resize.bind(this), {
      signal: this.abortControllerResize.signal
    })

    this.contentReplace = () => {
      this.timeOut = setTimeout(() => {
        const fullscreenElement = document.querySelector('[data-fullscreen]');
        if (!fullscreenElement) {
          console.error('Fullscreen element not found');
          return;
        }
        this.mediaCount = document.querySelector('[data-fullscreen]')?.dataset.count
        this.media = Array.from(document.querySelectorAll('[data-fullscreen-image]'))?.map((el) => {
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
          this.selectedIndex = Math.min(this.selectedIndex, this.media.length - 1);
          this.resize();
        } else {
          console.error('No media items found');
        }
      }, 100);
    }

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
  destroy() {
    this.abortController.abort()
    this.abortControllerResize.abort()
    swup.hooks.off('content:replace', this.contentReplace)

    clearTimeout(this.timeOut)
  },
  async openFullscreen(e: MouseEvent, { large = true, index = 0, clickedElement }) {
    if (this.animating) return

    const container = document.querySelector('[data-fullscreen-fixed]')
    const element = document.querySelector('[data-fullscreen]')

    this.lockScroll()

    this.fromLarge = large
    this.selectedIndex = index

    this.visible = true

    this.pointer.x = e.clientX
    this.pointer.y = e.clientY
    
    this.fromPosition = this.getClickedImageDimensions(clickedElement);

    this.aspectRatio = this.fromPosition.width / this.fromPosition.height

   // Calculate offsetY
   const targetWidth = window.innerWidth;
   const heightBasedOnAspectRatio = targetWidth / this.activeMedia.aspectRatio;
   const targetHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight) - window.innerHeight;
   this.offsetY = targetHeight / 2

    element.style.position = 'fixed';
    element.style.top = -this.offsetY + 'px';


    await this.onAnimateOpen(this.offsetY)


    if (container) {
      element.style.position = 'relative';
      element.style.top = 'auto';
      container.scrollTop = this.offsetY
      this.offsetY = 0
    }

    this.originalImage = {
      element: clickedElement,
      rect: this.fromPosition,
      scrollY: window.scrollY
    };
 
    this.animating = false;
  },
  async closeFullscreen() {
    if (this.animating) return

    const container = document.querySelector('[data-fullscreen-fixed]')
    const element = document.querySelector('[data-fullscreen]')


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
      if (this.fromLarge) {
        this.fromPosition = this.getLargeImageDimensions()
      } else {
        this.fromPosition = this.getSmallImageDimensions()
      }
    }

    this.offsetY = container?.scrollTop ?? 0

    element.style.position = 'fixed';
    element.style.top = -this.offsetY + 'px';

    await this.onAnimateClose(this.offsetY)

    this.offsetY = 0
    this.animating = false
    this.visible = false

    this.unlockScroll()

    container?.scrollTo({ top: 0 })
  },
  // nextImage() {
  //   if (this.mediaCount === 0) {
  //     console.warn('No media items available');
  //     return;
  //   }

  //   this.selectedIndex = (this.selectedIndex + 1) % this.mediaCount;
    
  //   this.$nextTick(() => {
  //     this.resize();
  //     this.$dispatch('fullscreen:index', this.selectedIndex);
  //     document.querySelector('[data-fullscreen-fixed]')?.scrollTo({ top: 0 });
  //   });
  // },

  async nextImage() {
    console.log('nextImage called', { 
      mediaCount: this.mediaCount, 
      transitioning: this.transitioning, 
      currentIndex: this.selectedIndex 
    });

    if (this.mediaCount === 0 || this.transitioning) {
      console.warn('No media items available or transition in progress');
      return;
    }

    console.log('Transitioning to next image', { nextIndex: this.nextIndex });
    await this.transitionTo(this.nextIndex);
  },
  async transitionTo(index) {
    console.log('transitionTo started', { targetIndex: index });
    this.transitioning = true;
    this.transitionTarget = index;
    this.transitionProgress = 0;

    try {
      console.log('Starting transition animation');
      // Animate transition
      await animate((progress) => {
        this.transitionProgress = progress;
        console.log('Transition progress:', progress);
      }, { duration: 0.5, easing: easeOutQuad }).finished;

      console.log('Transition animation completed');

      // Update selected index
      this.selectedIndex = this.transitionTarget;
      console.log('Updated selectedIndex', { newSelectedIndex: this.selectedIndex });

      // Perform other necessary actions
      this.resize();
      this.$dispatch('fullscreen:index', this.selectedIndex);
      console.log('Dispatched fullscreen:index event', { index: this.selectedIndex });

      const container = document.querySelector('[data-fullscreen-fixed]');
      const targetWidth = window.innerWidth;
      const heightBasedOnAspectRatio = targetWidth / this.activeMedia.aspectRatio;
      const targetHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight) - window.innerHeight;

      container?.scrollTo({ top: targetHeight / 2 });
      console.log('Scrolled container', { targetHeight });
    } catch (error) {
      console.error('Error during image transition:', error);
    } finally {
      this.transitioning = false;
      this.transitionTarget = null;
      this.transitionProgress = 0;
      console.log('Transition completed, transitioning set to false');
    }
  },

  advanceImage(index: number) {
    this.selectedIndex = index
    this.resize()

    const container = document.querySelector('[data-fullscreen-fixed]')
    const targetWidth = window.innerWidth;
    const heightBasedOnAspectRatio = targetWidth / this.activeMedia.aspectRatio;
    const targetHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight) - window.innerHeight;

    container?.scrollTo({ top: targetHeight / 2 })

  },
  resize() {
    this.transformWidth = window.innerWidth;
    const heightBasedOnAspectRatio = this.transformWidth / this.activeMedia.aspectRatio;
    this.transformHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight);
  },
  getClickedImageDimensions(clickedElement) {
    if (!clickedElement) return null;
    return clickedElement.getBoundingClientRect();
  },
  getLargeImageDimensions() {
    const largeImage = document.querySelector('[data-large-image]')
    if (!largeImage) return
    const dimensions = largeImage.getBoundingClientRect()
    return dimensions
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
  async onAnimateOpen(offsetY: number = 0) {
    this.animating = true;

    const targetWidth = window.innerWidth;
    const heightBasedOnAspectRatio = targetWidth / this.activeMedia.aspectRatio;
    const targetHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight);

    return await animate((progress) => {
      this.transformX = range(0, 1, this.fromPosition.left, 0, progress);
      this.transformY = range(0, 1, this.fromPosition.top + offsetY, 0, progress);
      this.transformWidth = range(0, 1, this.fromPosition.width, targetWidth, progress);
      this.transformHeight = range(0, 1, this.fromPosition.height, targetHeight, progress);
    }, { duration: 1.2, easing: expoInOut }).finished;
  },
  async onAnimateClose(offsetY: number = 0) {
    this.animating = true
    const fromTop = this.fromPosition.top - (document.querySelector('[data-fullscreen-fixed]')?.getBoundingClientRect().top ?? 0);
    const startWidth = window.innerWidth;
    const heightBasedOnAspectRatio = startWidth / this.activeMedia.aspectRatio;
    const startHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight);
  
    return await animate((progress) => {
    this.transformX = range(0, 1, 0, this.fromPosition.left, progress)
    this.transformY = range(0, 1, 0, fromTop + offsetY, progress)
    this.transformWidth = range(0, 1, startWidth, this.fromPosition.width, progress)
    this.transformHeight = range(0, 1, startHeight, this.fromPosition.height, progress)

  }, { duration: 1.4, easing: expoInOut }).finished
  },
  get clipPath() {
    if (!this.visible) return 'none';

    const left = this.transformX;
    const top = this.transformY - this.offsetY;
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
