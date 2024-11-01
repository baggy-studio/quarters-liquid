import { range } from "@/utils";
import { animate } from "motion";
import { expoInOut } from "@/easing";
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
  closing: false,
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
        this.mediaCount = document.querySelector('[data-fullscreen]')?.dataset.count
        this.media = Array.from(document.querySelectorAll('[data-fullscreen-image]'))?.map((el) => {
          const width = parseFloat(el.dataset.width);
          const height = parseFloat(el.dataset.height);
          const aspectRatio = parseFloat(el.dataset.aspectRatio);
          return {
            width,
            height,
            aspectRatio
          }
        })
      }, 100)
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
  async openFullscreen(e: MouseEvent, {
    large = true,
    index = 0
  }) {
    if (this.animating) return

    this.closing = false

    const container = document.querySelector('[data-fullscreen-fixed]')
    const element = document.querySelector('[data-fullscreen]')

    this.lockScroll()

    this.fromLarge = large
    this.selectedIndex = index

    this.visible = true

    this.pointer.x = e.clientX
    this.pointer.y = e.clientY
 
    if (e.target instanceof HTMLElement) {
      this.fromPosition = e.target.getBoundingClientRect()
    } else if (this.fromLarge) {
      this.fromPosition = this.getLargeImageDimensions()
    } else {
      this.fromPosition = this.getSmallImageDimensions()
    }

    this.aspectRatio = this.fromPosition.width / this.fromPosition.height

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


    this.animating = false

  },
  async closeFullscreen() {
    if (this.animating) return

    this.closing = true

    const container = document.querySelector('[data-fullscreen-fixed]')
    const element = document.querySelector('[data-fullscreen]')

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
  nextImage() {
    
    this.selectedIndex = (this.selectedIndex + 1) % this.mediaCount;
  },
  previousImage() {
    this.selectedIndex = this.selectedIndex <= 0 
      ? this.mediaCount - 1 
      : this.selectedIndex - 1;
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
  get activeMedia() {
    return this.media[this.selectedIndex]
  }
});
