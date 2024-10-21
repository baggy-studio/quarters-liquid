import Alpine from 'alpinejs'

export default () => ({
    menu: 'drinks',
    menus: [],
    lastText: null,
    lastBg: null,
    text: null,
    bg: null,
    theme: null,
    isSticky: false,
    isOverImage: false,
    controller: new AbortController(),
    init() {
        this.$dispatch('set-menu', this.menu)

        setTimeout(() => {
            this.hydrateMenus()
        }, 50)

        Alpine.effect(() => {
            if (this.isSticky) {
                this.dispatchMenuData()
            } else {
                this.resetMenuData()
            }

            if (window.innerWidth <= 1024) {
                if (this.isOverImage) {
                    this.$dispatch('set-theme', 'light')
                }
            }
        })
    },
    hydrateMenus() {
        const menu = document.querySelectorAll('[data-bar-menu]')

        this.menus = Array.from(menu).map((menu) => {
            return {
                title: menu.getAttribute('data-bar-title'),
                id: menu.getAttribute('data-bar-menu'),
                bg: menu.getAttribute('data-bar-bg'),
                theme: menu.getAttribute('data-bar-theme')
            }
        })

        window.addEventListener('scroll', this.scroll.bind(this), { signal: this.controller.signal })


        this.bg = this.menus[0].bg

    },
    destroy() {
        this.controller.abort()
    },
    scroll() {
        const section = document.getElementById('menu')
        const image = document.getElementById('menu-image-mobile')

        if (!section) return

        const rect = section.getBoundingClientRect()
        const isInView = rect.top <= 0 && rect.bottom - window.innerHeight > 0

        if (this.isSticky !== isInView) {
            this.isSticky = isInView
        }

        if (!image) return

        const imageRect = image.getBoundingClientRect()
        const isImageInView = imageRect.top <= 0 && imageRect.bottom > 0

        if (this.isOverImage !== isImageInView) {
            this.isOverImage = isImageInView
        }
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
