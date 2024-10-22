import { animate } from "motion";
import { expoInOut } from "@/easing";
import { range } from "@/utils";

export default () => ({
    siteCredits: false, 
    animating: false, 
    creditsDesktop: 0,
    creditsMobile: 0,
    init() {
    },
    toggleCredits() {
        if (this.siteCredits) {
            this.closeCredits()
        } else {
            this.openCredits()
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

            this.creditsDesktop = range(0, 1, 0, 40, progress)
            this.creditsMobile = range(0, 1, 0, 108, progress)
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
            this.creditsDesktop = range(0, 1, 40, 0, progress)
            this.creditsMobile = range(0, 1, 108, 0, progress)

        }, { duration: 1.2, easing: expoInOut }).finished

        this.animating = false
    }
});
