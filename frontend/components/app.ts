import { swup } from "../entrypoints/swup";
import { animate } from "motion";
import { expoInOut } from "@/easing";
import { range } from "@/utils";

function getHeaderColor(dom = document) {
  const styleId = 'page-settings';
  const styleElement = dom.getElementById(styleId);
  if (!styleElement) {
    return '#684C0D';
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

export default () => ({
  menu: false,
  menuHeight: 0,
  headerColor: getHeaderColor(),
  init() {
    this.trackMenuHeight();

    swup.hooks.before('content:replace', (visit) => {
      if (visit.to.html) {
        this.parseIncomingHTML(visit.to.html);
      }
    });

    swup.hooks.on('animation:out:start', () => {
      if (this.menu) {
        this.closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      this.trackMenuHeight();
    });
  },
  parseIncomingHTML(html: string) {
    const document = new DOMParser().parseFromString(html, 'text/html');
    this.headerColor = getHeaderColor(document);
  },
  hide() {
    this.visible = false;
  },
  show() {
    this.visible = true;
  },
  openMenu() {
    if (this.menu) return;
    this.menu = true;

    animate((progress) => {
      this.updateMenuHeight(progress)
    }, { duration: 1.2, easing: expoInOut })
  },
  async closeMenu() {
    if (!this.menu) {
      return
    };
    
    await animate((progress) => {
      this.updateMenuHeight(1 - progress)
    }, { duration: 1.2, easing: expoInOut })

    this.menu = false;
  },
  toggleMenu() {
    if (this.menu) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  },
  updateMenuHeight(height = 0) {

    const url = swup.getCurrentUrl();

    let progress = range(0, 1, 0, this.menuHeight, height);;

    if (url.includes('collections/') && window.innerWidth >= 1024) {
      this.$root.style.setProperty('--transform-y', `${range(0, 1, 0, this.menuHeight - 161, height)}px`);
    } else {
      this.$root.style.setProperty('--transform-y', `${progress}px`);
    }

    this.$root.style.setProperty('--menu-height', `${progress}px`);
  },
  trackMenuHeight() {
    this.menuHeight = this.$refs.menu.getBoundingClientRect().height;

    if (this.menu) {
      this.updateMenuHeight(1);
    }
  },
  lockScroll() {
    document.body.style.overflow = 'hidden';
  },
  unlockScroll() {
    document.body.style.overflow = 'auto';
  }
});