import { animate } from "motion";
import { expoInOut } from "@/easing";
import { range } from "@/utils";

export default () => ({
    siteCredits: false,
    footerHeight: 0,
    height: 0,
    animating: false,
    abortController: new AbortController(),
    init() {
        this.resize()
        window.addEventListener('resize', this.resize, { signal: this.abortController.signal })
    },
    destroy() {
        this.abortController.abort()
    },
    resize() {
        if (window.innerWidth < 1024) {
            // mobile
        } else {
            this.height = !this.siteCredits ? 392 : 392 + 40
            console.log(this.height)
        }
    },
    toggleCredits() {
        if (this.siteCredits) {
            this.closeCredits()
        } else {
            this.openCredits()
        }
    },
    async openCredits() {
        if (this.animating) return
        this.siteCredits = true
        this.animating = true

        const scrollY = window.scrollY
        const scrollLeft = document.documentElement.scrollHeight - window.scrollY

        await animate((progress) => {
            this.height = range(0, 1, 392, 392 + 40, progress)

            const y = range(0, 1, scrollY, scrollY + 40 + scrollLeft, progress)

            window.scrollTo({
                top: y
            })

        }, { duration: 1.2, easing: expoInOut }).finished



        this.animating = false
    },
    async closeCredits() {
        if (this.animating) return
        this.siteCredits = false
        this.animating = true

        await animate((progress) => {
            this.height = range(0, 1, 392 + 40, 392, progress)
        }, { duration: 1.2, easing: expoInOut }).finished

        this.animating = false
    }
});
