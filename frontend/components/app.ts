import { swup } from "../entrypoints/swup";
import { animate } from "motion";
import { expoInOut } from "@/easing";
import { range } from "@/utils";

export default () => ({
  menu: false,
  menuHeight: 0,

  visible: true,
  init() {
    this.trackMenuHeight();

    swup.hooks.on('animation:out:start', () => {
      if (this.menu) {
        this.closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      this.trackMenuHeight();
    });

    return () => {
      window.removeEventListener('resize', this.trackMenuHeight);
    }
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
  closeMenu() {
    if (!this.menu) {
      return
    };
    this.menu = false;  

    animate((progress) => {
      this.updateMenuHeight(1 - progress)
    }, { duration: 1.2, easing: expoInOut })
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
});