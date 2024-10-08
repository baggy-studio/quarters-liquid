

export default () => ({
    abortController: new AbortController(),
    scrollAbortController: new AbortController(),
    menuHeight: 0,
    infoHeight: 0,
    scrollY: 0,
    windowHeight: window.innerHeight,
    theme: 'dark',
    init() { 
        this.resize()
        setTimeout(() => {
            this.resize()
        }, 100)

        window.addEventListener('resize', this.resize.bind(this), { signal: this.abortController.signal })

        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY
        }, { signal: this.scrollAbortController.signal })
    },
    resize() {
        const hours = document.getElementById('hours')
        const menu = document.getElementById('menu')

        if (hours) {
            this.infoHeight = hours.offsetHeight + hours.offsetTop
        }
        if (menu) {
            this.menuHeight = menu.offsetHeight + menu.offsetTop
        }

        this.windowHeight = window.innerHeight
    },
    destroy() {
        this.abortController.abort()
        this.scrollAbortController.abort()
    }
});
