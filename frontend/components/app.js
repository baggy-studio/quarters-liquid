import { cubicInOut, swup } from "../entrypoints/swup";
import { animate } from "motion";

export default () => ({
  visible: true,
  menu: false,
  subMenu: null,
  init() {
    swup.hooks.on('animation:out:end', () => {
      this.closeMenu({force: true});
      this.closeSubMenu();
    });
  },
  hide() {
    this.visible = false;
  },
  show() {
    this.visible = true;
  },
  openMenu() {
    this.menu = true;

    animate(this.$refs.menu, { opacity: 1 }, { duration: 0.4, easing: cubicInOut });  
  },
  closeMenu({force = false}) {
    this.menu = false;
    this.subMenu = null;

    if (force) {    
      animate(this.$refs.menu, { opacity: 0 }, { duration: 0 });  
    } else {
      animate(this.$refs.menu, { opacity: 0 }, { duration:  0.2, easing: 'linear' });  
    }
  },
  toggleMenu() {
    if (this.menu) {
      this.closeMenu({force: false});
    } else {
      this.openMenu();
    }
  },
  openSubMenu(subMenu) {
    this.subMenu = subMenu;
  },
  closeSubMenu() {
    this.subMenu = null;
  },
});