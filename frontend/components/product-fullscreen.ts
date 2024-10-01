

import { lerp } from "@/utils";

export default () => ({
  activeMedia: null,
  visible: false,
  pointer: {
    x: 0,
    y: 0,
    last: {
      x: 0,
      y: 0,
    }
  },
  abortController: new AbortController(),
  raf: null,
  init() {
    window.addEventListener('pointermove', this.move.bind(this), {
      signal: this.abortController.signal
    })

    this.draw()
  },
  move(e: MouseEvent) {
    this.pointer.x = e.clientX
    this.pointer.y = e.clientY
  },
  draw() {

    const x = this.pointer.x
    const y = this.pointer.y

    this.pointer.last.x = lerp(this.pointer.last.x, x, 0.1)
    this.pointer.last.y = lerp(this.pointer.last.y, y, 0.1)

    this.raf = requestAnimationFrame(this.draw.bind(this))
  },
  destroy() {
    this.abortController.abort()

    if (this.raf) {
      cancelAnimationFrame(this.raf)
    }
  },
  openFullscreen(media: string) {
    this.activeMedia = media
    this.visible = true
  },
  closeFullscreen() {
    this.visible = false
  },
});
