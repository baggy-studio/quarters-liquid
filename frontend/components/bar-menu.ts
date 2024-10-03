

export default () => ({
    abortController: new AbortController(),
    menuHeight: 0,
    infoHeight: 0,
    init() {
        this.resize() 
        setTimeout(() => {
            this.resize()
        }, 100)
        window.addEventListener('resize', this.resize.bind(this), { signal: this.abortController.signal })
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
    },
    destroy() {
        this.abortController.abort()
    }
});
