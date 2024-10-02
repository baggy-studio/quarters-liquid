import { lerp, range } from "@/utils";
import { animate } from "motion";
import { expoInOut } from "@/easing";
import Alpine from "alpinejs";
import { swup } from "../entrypoints/swup";

export default () => ({
  abortController: new AbortController(),
  raf: null,
  aspectRatio: window.innerWidth / window.innerHeight,
  transformX: 0,
  transformY: 0,
  transformScale: 1,
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
  contentReplace: () => { },
  init() {
    window.addEventListener('pointermove', this.move.bind(this), {
      signal: this.abortController.signal
    })

    this.draw()

    this.contentReplace = () => {
      setTimeout(() => {
        this.mediaCount = document.querySelector('[data-fullscreen]').dataset.count
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
  draw() {
    const x = this.pointer.x
    const y = this.pointer.y

    this.pointer.last.x = lerp(this.pointer.last.x, x, 0.05)
    this.pointer.last.y = lerp(this.pointer.last.y, y, 0.05)

    this.raf = requestAnimationFrame(this.draw.bind(this))
  },
  destroy() {
    this.abortController.abort()
    swup.hooks.off('content:replace', this.contentReplace)

    if (this.raf) {
      cancelAnimationFrame(this.raf)
    }
  },
  async openFullscreen(e: MouseEvent, {
    large = true,
    index = 0
  }) {
    if (this.animating) return

    this.lockScroll()
    this.draw()

    this.fromLarge = large
    this.selectedIndex = index

    this.visible = true

    this.pointer.x = e.clientX
    this.pointer.y = e.clientY
    this.pointer.last.x = e.clientX
    this.pointer.last.y = e.clientY

    if (this.fromLarge) {
      this.fromPosition = this.getLargeImageDimensions()
    } else {
      this.fromPosition = this.getSmallImageDimensions()
    }

    this.aspectRatio = this.fromPosition.width / this.fromPosition.height

    if (window.innerWidth >= 1024) {

      await this.onAnimateOpen()
    }

    this.animating = false
  },
  async closeFullscreen() {
    if (this.animating) return

    if (this.fromLarge) {
      this.fromPosition = this.getLargeImageDimensions()
    } else {
      this.fromPosition = this.getSmallImageDimensions()
    }

    if (window.innerWidth >= 1024) {
      await this.onAnimateClose()
    }

    this.animating = false
    this.visible = false


    if (this.raf) {
      cancelAnimationFrame(this.raf)
    }

    this.unlockScroll()

    document.querySelector('[data-fullscreen-fixed]')?.scrollTo({ top: 0 })
  },
  nextImage() {
    this.selectedIndex = (this.selectedIndex + 1) % this.mediaCount;
  },
  advanceImage(index: number) {
    this.selectedIndex = index
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
  async onAnimateOpen() {
    this.animating = true

    const fromScale = (this.fromPosition.width / window.innerWidth);

    return await animate((progress) => {
      this.transformX = range(0, 1, this.fromPosition.left, 0, progress)
      this.transformY = range(0, 1, this.fromPosition.top, 0, progress)
      this.transformScale = range(0, 1, fromScale, 1, progress)
    }, { duration: 1.2, easing: expoInOut }).finished
  },
  async onAnimateClose() {
    this.animating = true

    const fromTop = this.fromPosition.top - (document.querySelector('[data-fullscreen]')?.getBoundingClientRect().top ?? 0);
    const fromScale = (this.fromPosition.width / window.innerWidth);

    return await animate((progress) => {
      this.transformX = range(0, 1, 0, this.fromPosition.left, progress)
      this.transformY = range(0, 1, 0, fromTop, progress)
      this.transformScale = range(0, 1, 1, fromScale, progress)
    }, { duration: 1.4, easing: expoInOut }).finished

  },
  get clipPath() {
    if (!this.visible) return 'none';

    const fullscreenDimensions = this.getFullscreenDimensions();
    if (!fullscreenDimensions) return 'none';

    const left = this.transformX;
    const top = this.transformY;
    const width = fullscreenDimensions.width * this.transformScale;
    const height = fullscreenDimensions.height * this.transformScale;

    const right = fullscreenDimensions.width - (left + width);
    const bottom = fullscreenDimensions.height - (top + height);

    return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
  },
  get nextIndex() {
    return (this.selectedIndex + 1) % this.mediaCount;
  },
  get index() {
    const index = this.selectedIndex + 1
    return index < 10 ? `0${index}` : index;
  },
});
