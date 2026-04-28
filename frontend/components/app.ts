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
  searchOpen: false,
  searchClosing: false,
  searchQuery: '',
  searchPopularMinChars: 2,
  predictiveEmpty: false,
  predictiveLoading: false,
  /** True when the suggest mount has markup; with x-show avoids flex gap when idle */
  predictiveHasSurface: false,
  predictiveAbort: null as AbortController | null,
  get showSearchPopular() {
    const q = (this.searchQuery ?? '').trim();
    return q.length < this.searchPopularMinChars;
  },
  get searchEnterOpacityClass() {
    const q = (this.searchQuery ?? '').trim();
    if (q.length < this.searchPopularMinChars) return 'opacity-50';
    if (this.predictiveLoading) return 'opacity-50';
    return this.predictiveEmpty ? 'opacity-50' : 'opacity-100';
  },
  init() {
    this.trackMenuHeight();

    // Watch for forced theme changes and update CSS variable on document root
    (this as any).$watch('isForcedTheme', (theme: 'light' | 'dark' | null) => {
      if (theme) {
        const color = theme === 'light' ? '#F4EED0' : '#643600';
        document.documentElement.style.setProperty('--header-theme', color);
      } else {
        document.documentElement.style.setProperty('--header-theme', this.headerColor);
      }
    });

    swup.hooks.before('content:replace', (visit) => {
      this.activeUrl = visit.to.url;
      this.isForcedTheme = null
      this.getTheme(visit.to.url);
    });

    swup.hooks.on('animation:out:start', (visit) => {
      if (this.menu) {
        this.closeMenu();
      }

      if (this.searchOpen) {
        this.closeSearch();
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
  clearPredictiveSearchResults() {
    const mount = document.getElementById('predictive-search-results');
    if (mount) mount.innerHTML = '';
    this.predictiveEmpty = false;
    this.predictiveHasSurface = false;
  },
  onPredictiveInput() {
    const q = (this.searchQuery ?? '').trim();
    if (q.length < this.searchPopularMinChars) {
      this.clearPredictiveSearchResults();
      return;
    }
    this.fetchPredictiveSearch(q);
  },
  selectPopularSearchTerm(term: string | undefined) {
    const raw = term ?? '';
    this.searchQuery = raw;
    const q = raw.trim();
    if (q.length < this.searchPopularMinChars) {
      this.clearPredictiveSearchResults();
    } else {
      this.fetchPredictiveSearch(q);
    }
    void (this as any).$nextTick(() => {
      document.getElementById('search-input')?.focus();
    });
  },
  async fetchPredictiveSearch(q: string) {
    if (this.predictiveAbort) this.predictiveAbort.abort();
    this.predictiveAbort = new AbortController();
    const root = (window as any).Shopify?.routes?.root ?? '/';
    const params = new URLSearchParams({
      q,
      section_id: 'predictive-search',
      'resources[type]': 'product,collection,page,article',
      'resources[limit]': '10',
      'resources[limit_scope]': 'each',
    });
    const url = `${root}search/suggest?${params.toString()}`;
    this.predictiveLoading = true;
    try {
      const res = await fetch(url, {
        signal: this.predictiveAbort.signal,
        headers: { Accept: 'text/html' },
      });
      if (!res.ok) {
        if (res.status !== 429) {
          const mountErr = document.getElementById('predictive-search-results');
          if (mountErr) mountErr.innerHTML = '';
        }
        return;
      }
      const text = await res.text();
      const parsed = new DOMParser().parseFromString(text, 'text/html');
      const sectionEl = parsed.querySelector('[id^="shopify-section-"]');
      const mount = document.getElementById('predictive-search-results');
      if (!mount) return;
      mount.innerHTML = sectionEl ? sectionEl.innerHTML : '';
      const rootEl = mount.querySelector('#predictive-search');
      this.predictiveEmpty = rootEl?.getAttribute('data-predictive-state') === 'empty';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      const mountFail = document.getElementById('predictive-search-results');
      if (mountFail) mountFail.innerHTML = '';
    } finally {
      this.predictiveLoading = false;
      const m = document.getElementById('predictive-search-results');
      this.predictiveHasSurface = !!(m && m.innerHTML.trim().length > 0);
    }
  },
  async openSearch() {
    if (this.searchOpen || this.searchClosing) return;
    if (this.menu) this.closeMenu();
    this.searchOpen = true;
    this.lockScroll();
    await (this as any).$nextTick();
    const clipHost = (this as any).$refs.searchClipHost as HTMLElement | undefined;
    if (!clipHost) return;
    clipHost.classList.remove('search-overlay-clip-host--open');
    clipHost.classList.add('search-overlay-clip-host--clip-driven');
    clipHost.style.setProperty('--search-clip-progress', '0');
    await animate((progress) => {
      clipHost.style.setProperty('--search-clip-progress', String(progress));
    }, { duration: 1.2, easing: expoInOut }).finished;
    clipHost.style.removeProperty('--search-clip-progress');
    clipHost.classList.remove('search-overlay-clip-host--clip-driven');
    clipHost.classList.add('search-overlay-clip-host--open');
    const input = document.getElementById('search-input') as HTMLInputElement | null;
    if (input) input.focus();
  },
  async closeSearch() {
    if (this.searchClosing) return;
    if (!this.searchOpen) return;
    const clipHost = (this as any).$refs.searchClipHost as HTMLElement | undefined;
    this.searchOpen = false;
    this.searchClosing = true;
    if (clipHost) {
      clipHost.classList.remove('search-overlay-clip-host--open');
      clipHost.classList.add('search-overlay-clip-host--clip-driven');
      clipHost.style.setProperty('--search-clip-progress', '1');
      await animate((progress) => {
        clipHost.style.setProperty('--search-clip-progress', String(1 - progress));
      }, { duration: 1.2, easing: expoInOut }).finished;
      clipHost.style.removeProperty('--search-clip-progress');
      clipHost.classList.remove('search-overlay-clip-host--clip-driven');
    }
    this.searchClosing = false;
    this.unlockScroll();
  },
  toggleSearch() {
    if (this.searchOpen) {
      this.closeSearch();
    } else {
      this.openSearch();
    }
  },
  getTransformYValues(progress01: number, extentPx: number, url: string) {
    const progress = range(0, 1, 0, extentPx, progress01);
    const announcementBarHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--announcement-bar-height') || '0');
    const scaledAnnouncementHeight = announcementBarHeight * progress01;
    const totalHeight = progress + scaledAnnouncementHeight;

    if ((url.includes('/collections/') || url.includes('/products/') || url.includes('/pages/frequently-asked-questions') || url.includes('/pages/shipping-returns') || url.includes('/pages/terms-and-conditions') || url.includes('/pages/privacy-policy')) && window.innerWidth >= 1024) {
      const baseOffset = extentPx - 161 + announcementBarHeight;
      const transformValue = range(0, 1, 0, baseOffset, progress01);
      const finalTransform = progress01 === 0 ? transformValue + announcementBarHeight : transformValue;
      return { totalHeight, menuHeightProgress: progress, transformY: finalTransform };
    }

    return { totalHeight, menuHeightProgress: progress, transformY: totalHeight };
  },
  updateMenuHeight(height = 0, url = this.activeUrl, _isClosing = false) {
    const { totalHeight, menuHeightProgress, transformY } = this.getTransformYValues(height, this.menuHeight, url);
    this.$root.style.setProperty('--transform-y', `${transformY}px`);
    this.$root.style.setProperty('--menu-background-height', `${totalHeight}px`);
    this.$root.style.setProperty('--menu-height', `${menuHeightProgress}px`);
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