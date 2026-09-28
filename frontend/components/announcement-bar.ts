import { swup } from "@/entrypoints/swup";
import { animate } from "motion";
import { expoInOut } from "@/easing";

export default (speed = 20) => {
  // Check sessionStorage immediately before Alpine initializes
  const isDismissed = sessionStorage.getItem('announcement-bar-dismissed') === 'true';

  return {
    // The marquee always scrolls (that's what the triple-span loop markup
    // is built for) - it's not conditional on whether the text overflows.
    isScrolling: true,
    hasStartedScrolling: false,
    isPaused: false,
    isVisible: !isDismissed,
    isClosing: false,
    isMenuOpen: false,
    isPageScrolling: false,
    hasForcedHeaderColor: false,
    speed: speed,
    contentReplace: null,
    resizeObserver: null as ResizeObserver | null,

    init() {
      // Set initial height based on visibility
      if (this.isVisible === false) {
        document.documentElement.style.setProperty('--announcement-bar-height', '0px');
        return;
      }

    this.setAnnouncementBarHeight();

    // Slight delay before showing the edge fade mask so it doesn't appear
    // before the scroll animation has visually started.
    setTimeout(() => {
      this.hasStartedScrolling = true;
    }, 100);

    // Wait a tick so child x-ref elements (e.g. $refs.trackContainer) are
    // bound before we read them - refs aren't registered yet while init() runs.
    this.$nextTick(() => {
      if (!this.$refs.trackContainer) return;

      this.resizeObserver = new ResizeObserver(() => {
        this.setAnnouncementBarHeight();
      });
      this.resizeObserver.observe(this.$refs.trackContainer);
    });

    // Setup swup hook for page transitions
    this.contentReplace = () => {
      this.setAnnouncementBarHeight();
    };

    swup.hooks.on('content:replace', this.contentReplace);
  },

  destroy() {
    if (this.contentReplace) {
      swup.hooks.off('content:replace', this.contentReplace);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
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

  async close() {
    if (this.isClosing || !this.isVisible) return;

    this.isClosing = true;
    sessionStorage.setItem('announcement-bar-dismissed', 'true');

    const bar = this.$refs.announcementBar as HTMLElement | undefined;
    if (!bar) {
      this.isVisible = false;
      this.isClosing = false;
      document.documentElement.style.setProperty('--announcement-bar-height', '0px');
      return;
    }

    const startHeight = bar.offsetHeight;
    bar.style.height = `${startHeight}px`;

    await animate((progress) => {
      const height = startHeight * (1 - progress);
      bar.style.height = `${height}px`;
      document.documentElement.style.setProperty('--announcement-bar-height', `${height}px`);
    }, { duration: 1.2, easing: expoInOut }).finished;

    bar.style.removeProperty('height');
    document.documentElement.style.setProperty('--announcement-bar-height', '0px');
    this.isVisible = false;
    this.isClosing = false;
  },
};
};
