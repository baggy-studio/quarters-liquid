import { animate } from "motion";
import { expoInOut } from "@/easing";
import { range } from "@/utils";

export default () => ({
    siteCredits: false,
    height: 0,
    animating: false,
    abortController: new AbortController(),
    heights: {
        desktop: 392,
        mobile: window.innerHeight
    },
    init() {
        this.resize()
        window.addEventListener('resize', this.resize.bind(this), { signal: this.abortController.signal })
    },
    destroy() {
        this.abortController.abort()
    },
    resize() {
        this.heights.mobile = window.innerHeight

        if (window.innerWidth < 1024) {
            this.height = !this.siteCredits ? this.heights.mobile : this.heights.mobile + 108
        } else {
            this.height = !this.siteCredits ? this.heights.desktop : this.heights.desktop + 40
        }
    },
    toggleCredits() {
        if (this.siteCredits) {
            this.closeCredits()
        } else {
            this.openCredits()
        }
    },
    getFooterHeight() {
        if (window.innerWidth < 1024) {
            return this.heights.mobile
        } else {
            return this.heights.desktop
        }
    },
    getCreditsHeight() {
        if (window.innerWidth < 1024) {
            return 108
        } else {
            return 40
        }
    },
    async openCredits() {
        if (this.animating) return
        this.siteCredits = true
        this.animating = true

        const scrollY = window.scrollY
        const scrollLeft = document.documentElement.scrollHeight - window.scrollY

        await animate((progress) => {
            this.height = range(0, 1, this.getFooterHeight(), this.getFooterHeight() + this.getCreditsHeight(), progress)

            const y = range(0, 1, scrollY, scrollY + this.getCreditsHeight() + scrollLeft, progress)

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
            this.height = range(0, 1, this.getFooterHeight() + this.getCreditsHeight(), this.getFooterHeight(), progress)
        }, { duration: 1.2, easing: expoInOut }).finished

        this.animating = false
    }
});
