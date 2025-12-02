import { swup } from "@/entrypoints/swup";

export default (speed = 20) => ({
  isScrolling: false,
  hasStartedScrolling: false,
  isPaused: false,
  isVisible: true,
  speed: speed,
  resizeObserver: null,
  contentReplace: null,

  init() {
    // Check if announcement bar was previously dismissed
    const isDismissed = sessionStorage.getItem('announcement-bar-dismissed') === 'true';
    if (isDismissed) {
      this.isVisible = false;
      document.documentElement.style.setProperty('--announcement-bar-height', '0px');
      return;
    }

    // Check if scrolling is needed on mount
    this.$nextTick(() => {
      this.checkScrollNeeded();
      this.setAnnouncementBarHeight();
    });

    // Setup resize observer to check when viewport changes
    this.resizeObserver = new ResizeObserver(() => {
      this.checkScrollNeeded();
      this.setAnnouncementBarHeight();
    });

    if (this.$refs.container) {
      this.resizeObserver.observe(this.$refs.container);
    }

    // Setup swup hook for page transitions
    this.contentReplace = () => {
      this.checkScrollNeeded();
    };

    swup.hooks.on('content:replace', this.contentReplace);

    // Listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.checkScrollNeeded(), 100);
    });
  },

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.contentReplace) {
      swup.hooks.off('content:replace', this.contentReplace);
    }
    // Reset the CSS variable when component is destroyed
    document.documentElement.style.removeProperty('--announcement-bar-height');
  },

  setAnnouncementBarHeight() {
    if (this.$refs.announcementBar) {
      const height = this.$refs.announcementBar.offsetHeight;
      document.documentElement.style.setProperty('--announcement-bar-height', `${height}px`);
    }
  },

  checkScrollNeeded() {
    if (!this.$refs.content || !this.$refs.track) return;

    const containerWidth = this.$refs.container.offsetWidth;
    const contentWidth = this.$refs.track.scrollWidth / 3; // Divide by 3 since we duplicate text

    // Enable scrolling if content is wider than container
    const shouldScroll = contentWidth > containerWidth;

    if (shouldScroll && !this.isScrolling) {
      this.isScrolling = true;
      // Slight delay before showing left fade to let animation start
      setTimeout(() => {
        this.hasStartedScrolling = true;
      }, 100);
    } else if (!shouldScroll && this.isScrolling) {
      this.isScrolling = false;
      this.hasStartedScrolling = false;
    }
  },

  pauseAnimation() {
    if (this.isScrolling && this.$refs.content) {
      this.$refs.content.classList.add('paused');
      this.isPaused = true;
    }
  },

  resumeAnimation() {
    if (this.isScrolling && this.$refs.content) {
      this.$refs.content.classList.remove('paused');
      this.isPaused = false;
    }
  },

  close() {
    this.isVisible = false;
    sessionStorage.setItem('announcement-bar-dismissed', 'true');
    
    // Animate height to 0 and update CSS variable
    setTimeout(() => {
      document.documentElement.style.setProperty('--announcement-bar-height', '0px');
    }, 300); // Match transition duration
  }
});
