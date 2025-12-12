import { swup } from "../entrypoints/swup";
import { animate } from "motion";
import { expoInOut } from "@/easing";
import { range } from "@/utils";

function getHeaderColor(dom = document) {
  const styleId = 'page-settings';
  const styleElement = dom.getElementById(styleId);
  if (!styleElement) {
    return '#643600';
  }

  const cssText = styleElement.textContent;
  const cssVariables = {};

  // Regular expression to match CSS variables
  const regex = /--([\w-]+):\s*([^;]+);/g;
  let match;
  while ((match = regex.exec(cssText)) !== null) {
    cssVariables[match[1]] = match[2].trim();
  }
  return cssVariables['header-theme'];
}

const lightRoutes = ['/', '/pages/the-bar', '/pages/hours-info', '/pages/events', '/pages/shipping-returns', '/pages/terms-and-conditions', '/pages/affiliate-program'];
const hideHeaderRoutes = ['/', '/pages/the-bar'];
const darkHeaderOnScrollRoutes = ['/pages/the-bar'];

export default (activeUrl: string = window.location.pathname) => ({
  menu: false,
  animating: false,
  subMenu: null,
  menuHeight: 0,
  headerColor: getHeaderColor(),
  activeUrl: activeUrl,
  activeCollection: 0,
  activeParent: 1,
  hoverCollection: null,
  aboveTheFold: true,
  isScrolling: false,
  scrollTimeout: null,
  scrollY: 0,
  isForcedTheme: null,
  init() {
    this.trackMenuHeight();

    swup.hooks.before('content:replace', (visit) => {
      this.activeUrl = visit.to.url;
      this.isForcedTheme = null
      this.getTheme(visit.to.url);
    });

    swup.hooks.on('animation:out:start', (visit) => {
      if (this.menu) {
        this.closeMenu();
      }

      const fromTheme = this.getThemeForUrl(visit.from.url);
      const toTheme = this.getThemeForUrl(visit.to.url);

      if (fromTheme !== toTheme) {
        this.startColorTransition(fromTheme, toTheme);
      }
    });

    swup.hooks.on('link:self', (visit) => {
      if (this.menu) {
        this.closeMenu().then(() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        });
      }
    });

    window.addEventListener('resize', () => {
      this.trackMenuHeight();
    });

    window.addEventListener('scroll', this.onScroll.bind(this));
  },
  getThemeForUrl(url: string): 'light' | 'dark' {
    return lightRoutes.includes(url) ? 'light' : 'dark';
  },
  startColorTransition(fromTheme: 'light' | 'dark', toTheme: 'light' | 'dark') {
    const fromColor = fromTheme === 'light' ? '#F4EED0' : '#643600';
    const toColor = toTheme === 'light' ? '#F4EED0' : '#643600';

    animate(
      (progress) => {
        const currentColor = this.interpolateColor(fromColor, toColor, progress);
        this.updatePageColors(currentColor);
      },
      { duration: 0.3, easing: expoInOut }
    );
  },
  interpolateColor(fromColor: string, toColor: string, progress: number): string {
    const from = this.hexToRgb(fromColor);
    const to = this.hexToRgb(toColor);

    const r = Math.round(from.r + (to.r - from.r) * progress);
    const g = Math.round(from.g + (to.g - from.g) * progress);
    const b = Math.round(from.b + (to.b - from.b) * progress);

    return `rgb(${r}, ${g}, ${b})`;
  },

  hexToRgb(hex: string): { r: number, g: number, b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  },
  updatePageColors(color: string) {
    this.headerColor = color;
    document.documentElement.style.setProperty('--header-theme', color);
    // You may need to update other color-related properties here
  },

  getTheme(toUrl: string) {
    if (lightRoutes.includes(toUrl)) {
      return this.setTheme('light');
    }

    return this.setTheme('dark');
  },
  setTheme(theme: 'light' | 'dark') {
    this.headerColor = theme === 'light' ? '#F4EED0' : '#643600';
  },

  hide() {
    this.visible = false;
  },
  show() {
    this.visible = true;
  },
  async openMenu() {
    if (this.menu || this.animating) return;
    this.lockScroll();
    this.menu = true;

    const url = this.activeUrl;
    this.animating = true;
    await animate((progress) => {
      this.updateMenuHeight(progress, url, false)
    }, { duration: 1.2, easing: expoInOut }).finished
    this.animating = false;
  },
  async closeMenu() {
    if (!this.menu || this.animating) return

    this.menu = false;

    const url = this.activeUrl;
    this.animating = true;

    await animate((progress) => {
      this.updateMenuHeight(1 - progress, url, true)
    }, { duration: 1.2, easing: expoInOut }).finished
    this.animating = false;

    this.unlockScroll();
    this.activeCollection = 0;
    this.subMenu = null;
  },
  toggleMenu() {
    if (this.menu) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  },
  updateMenuHeight(height = 0, url = this.activeUrl, isClosing = false) {

    let progress = range(0, 1, 0, this.menuHeight, height);
    const announcementBarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--announcement-bar-height') || '0');
    
    // Scale announcement bar height with the animation progress
    const scaledAnnouncementHeight = announcementBarHeight * height;
    const totalHeight = progress + scaledAnnouncementHeight;

    console.log('DEBUG updateMenuHeight:', {
      height,
      progress,
      announcementBarHeight,
      scaledAnnouncementHeight,
      totalHeight,
      menuHeight: this.menuHeight
    });

    if ((url.includes('/collections/') || url.includes('/products/') || url.includes('/pages/frequently-asked-questions') || url.includes('/pages/shipping-returns') || url.includes('/pages/terms-and-conditions') || url.includes('/pages/privacy-policy')) && window.innerWidth >= 1024) {
      this.$root.style.setProperty('--transform-y', `${range(0, 1, 0, this.menuHeight - 161 + announcementBarHeight, height)}px`);
    } else {

      if (isClosing) {
        this.$root.style.setProperty('--transform-y', `${totalHeight}px`);
      } else {
        this.$root.style.setProperty('--transform-y', `${totalHeight - 1}px`);
      }

    }

    // Set menu-background-height to total (menu + scaled announcement bar)
    this.$root.style.setProperty('--menu-background-height', `${totalHeight}px`);
    
    if (window.innerWidth >= 1024 && window.scrollY > 0 && (url.includes('/products/') || url.includes('/collections/'))) {
      this.$root.style.setProperty('--menu-height', `${progress}px`);
    } else {
      this.$root.style.setProperty('--menu-height', `${progress - 1}px`);
    }
  },
  trackMenuHeight() {
    this.menuHeight = this.$refs.menu.getBoundingClientRect().height;

    if (this.menu) {
      this.updateMenuHeight(1);
    }
  },
  lockScroll() {
    document.body.style.overflow = 'hidden';

    if (window.innerWidth >= 1024) {
      window.addEventListener('mousewheel', () => {
        this.closeMenu();
      }, { passive: false });
    }
  },
  unlockScroll() {
    document.body.style.overflow = 'auto';
    window.removeEventListener('mousewheel', () => {
      this.closeMenu();
    });
  },
  onWheel(e: WheelEvent) {
    e.preventDefault();
    this.closeMenu();
  },
  onScroll() {
    this.scrollY = window.scrollY;
    this.isScrolling = true;
    this.aboveTheFold = this.scrollY < (window.innerHeight - (window.innerHeight - document.documentElement.clientHeight));
    const watchScroll = darkHeaderOnScrollRoutes.includes(this.activeUrl);

    if (!this.aboveTheFold && watchScroll) {
      this.setTheme('dark');
    } else if (this.aboveTheFold && watchScroll) {
      this.setTheme('light');
    }

    // Clear the existing timeout (if any)
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Set a new timeout
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 150); // Adjust this value to change how quickly "not scrolling" is detected
  },
  get hasHeader() {
    const watchScroll = darkHeaderOnScrollRoutes.includes(this.activeUrl);

    if (!this.aboveTheFold && watchScroll) {
      return true
    }

    return !hideHeaderRoutes.includes(this.activeUrl);
  },
  get forcedHeaderColor() {
    if (!this.isForcedTheme) return null;
    return this.isForcedTheme === 'light' ? '#F4EED0' : '#643600';
  }
});