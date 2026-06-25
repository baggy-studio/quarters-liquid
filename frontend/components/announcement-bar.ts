import { swup } from "@/entrypoints/swup";
import { animate } from "motion";
import { expoInOut } from "@/easing";

export default (speed = 20) => {
  // Check sessionStorage immediately before Alpine initializes
  const isDismissed = sessionStorage.getItem('announcement-bar-dismissed') === 'true';

  return {
    isScrolling: false,
    hasStartedScrolling: false,
    isPaused: false,
    isVisible: !isDismissed,
    isClosing: false,
    isMenuOpen: false,
    isPageScrolling: false,
    hasForcedHeaderColor: false,
    speed: speed,
    contentReplace: null,

    init() {
      // Set initial height based on visibility
      if (this.isVisible === false) {
        document.documentElement.style.setProperty('--announcement-bar-height', '0px');
        return;
      }

    // Check if scrolling is needed on mount - add delay for proper rendering
    this.$nextTick(() => {
      setTimeout(() => {
        this.checkScrollNeeded();
        this.setAnnouncementBarHeight();
      }, 50);
    });

    // Setup swup hook for page transitions
    this.contentReplace = () => {
      this.checkScrollNeeded();
      this.setAnnouncementBarHeight();
    };

    swup.hooks.on('content:replace', this.contentReplace);

    // Listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.checkScrollNeeded(), 100);
    });
  },

  destroy() {
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

    // Get the first text span to measure single instance width
    const firstText = this.$refs.track.querySelector('.announcement-text');
    if (!firstText) return;

    const containerWidth = this.$refs.container.offsetWidth;
    const contentWidth = firstText.scrollWidth;

    // Enable scrolling if content is wider than container
    const shouldScroll = contentWidth > containerWidth;

    if (shouldScroll && !this.isScrolling) {
      this.isScrolling = true;
      // Force animation restart by removing and re-adding class
      this.$nextTick(() => {
        if (this.$refs.content) {
          this.$refs.content.classList.remove('is-scrolling');
          // Use requestAnimationFrame to ensure the class removal is processed
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (this.$refs.content) {
                this.$refs.content.classList.add('is-scrolling');
              }
            });
          });
        }
      });
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
