import { swup } from "@/entrypoints/swup";

export default (speed = 20) => {
  // Check sessionStorage immediately before Alpine initializes
  const isDismissed = sessionStorage.getItem('announcement-bar-dismissed') === 'true';

  return {
    isScrolling: false,
    hasStartedScrolling: false,
    isPaused: false,
    isVisible: !isDismissed,
    isMenuOpen: false,
    isPageScrolling: false,
    hasForcedHeaderColor: false,
    forcedTheme: null as 'light' | 'dark' | null,
    speed: speed,
    resizeObserver: null,
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
      this.setAnnouncementBarHeight();
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

    // Get the first text span to measure single instance width
    const firstText = this.$refs.track.querySelector('.announcement-text');
    if (!firstText) return;

    const containerWidth = this.$refs.container.offsetWidth;
    const contentWidth = firstText.scrollWidth;

    // Enable scrolling if content is wider than container
    const shouldScroll = contentWidth > containerWidth;

    console.log('Container width:', containerWidth, 'Content width:', contentWidth, 'Should scroll:', shouldScroll);

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

  close() {
    this.isVisible = false;
    sessionStorage.setItem('announcement-bar-dismissed', 'true');

    // Animate height to 0 and update CSS variable
    setTimeout(() => {
      document.documentElement.style.setProperty('--announcement-bar-height', '0px');
    }, 300); // Match transition duration
  },

  get forcedColor() {
    if (!this.forcedTheme) return null;
    return this.forcedTheme === 'light' ? '#F4EED0' : '#643600';
  }
};
};
