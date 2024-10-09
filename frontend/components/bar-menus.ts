import { inView } from 'motion';

export default () => ({
    menu: 'drinks',
    menus: [],
    bg: null,
    init() {
        this.$dispatch('set-menu', this.menu)

        setTimeout(() => {
            this.hydrateMenus()
        }, 50)
    },
    hydrateMenus() {
        const menu = document.querySelectorAll('[data-bar-menu]')
        this.menus = Array.from(menu).map((menu) => {
            return {
                id: menu.getAttribute('data-bar-menu'),
                bg: menu.getAttribute('data-bar-bg'),
                theme: menu.getAttribute('data-bar-theme')
            }
        })

        inView('#menu',
            () => {
                this.dispatchMenuData()

                return () => {
                    this.bg = null
                    this.$dispatch('set-theme', null)
                    this.$dispatch('set-colors', { bg: null, text: null })
                }
            }, {
            margin: '-45% 0% -45% 0%'
        }
        )

    },
    get activeMenu() {
        return this.menus.find((menu) => menu.id === this.menu)
    },
    dispatchMenuData() {
        this.bg = this.activeMenu?.bg
        this.$dispatch('set-colors', { bg: this.activeMenu?.bg, text: this.activeMenu?.theme == 'light' ? '#F4EED0' : '#643600' })
        this.$dispatch('set-theme', this.activeMenu?.theme)
    },
    setMenu(menu: string) {
        this.menu = menu
        this.$dispatch('set-menu', menu)
        this.$root.scrollIntoView({ behavior: 'smooth' })

        this.dispatchMenuData()
    },
   
});
