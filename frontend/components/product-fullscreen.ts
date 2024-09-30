


export default () => ({
  activeMedia: null,
  visible: false,
  init() {
  },
  setActiveMedia(media: string) {
    this.activeMedia = media
    this.open()
  },
  openFullscreen() {
    this.visible = true
  },
  closeFullscreen() {
    this.visible = false
  }
});
