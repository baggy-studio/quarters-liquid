import { animate } from "motion";

import { expoInOut } from "@/easing";
import { range } from "@/utils";
export default () => ({
    abortController: new AbortController(),
    scrollAbortController: new AbortController(),
    menuHeight: 0,
    infoHeight: 0,
    scrollY: 0,
    windowHeight: window.innerHeight,
    scrolling: false,
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
    },
    async jumpTo(id: string) {
        if (this.scrolling) return
        this.scrolling = true

        const element = document.getElementById(id)
        if (!element) {
            this.scrolling = false
            return
        }

        const elementTop = element.getBoundingClientRect().top
        const start = window.scrollY
        const target = start + elementTop

        await animate((progress) => {
            window.scrollTo(0, range(0, 1, start, target, progress))
        }, { duration: 1.8, easing: expoInOut }).finished

        this.scrolling = false
    }
});
