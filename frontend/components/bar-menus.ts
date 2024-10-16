import { inView, scroll } from 'motion';

export default () => ({
    menu: 'drinks',
    menus: [],
    lastText: null,
    lastBg: null,
    text: null,
    bg: null,
    theme: null,
    inView: false,
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

        this.bg = this.menus[0].bg

       

        // Observer for the top of the viewport
        inView('#menu',
            () => {
                this.inView = true
                this.dispatchMenuData()

                return () => {
                    this.inView = false
                    this.resetMenuData()
                }
            }, {
            margin: '0px 0px -100% 0px'
        })
    },
    get activeMenu() {
        return this.menus.find((menu) => menu.id === this.menu)
    },
    dispatchMenuData() {
        this.bg = this.activeMenu?.bg
        this.text = this.activeMenu?.theme == 'light' ? '#F4EED0' : '#643600'
        this.lastBg = this.bg
        this.lastText = this.text
        this.$dispatch('set-colors', { bg: this.activeMenu?.bg, text: this.text })
        this.$dispatch('set-theme', this.activeMenu?.theme)
    },
    setMenu(menu: string) {
        this.menu = menu
        this.$dispatch('set-menu', menu)
        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })
        this.dispatchMenuData()
    },
    resetMenuData() {
        this.bg = null
        this.text = null
        this.$dispatch('set-theme', null)
        this.$dispatch('set-colors', { bg: null, text: null })
    },
});
