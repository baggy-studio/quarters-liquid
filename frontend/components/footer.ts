import { animate, inView } from "motion";
import { expoInOut } from "@/easing";
import { range } from "@/utils";

export default () => ({
    siteCredits: false,
    animating: false,
    creditsDesktop: 0,
    creditsMobile: 0,
    abortController: new AbortController(),
    init() {
        const excludedPages = [
            '/pages/hours-info',
            '/pages/shipping-returns',
            '/pages/terms-and-conditions',
        ];

        const isAffiliatePage = window.location.pathname === '/pages/affiliate-program';
        const element = this.$refs.footer


        function onScroll() {
            if (window.scrollY > 200) {
                element.classList.remove('opacity-0')
            } else {
                element.classList.add('opacity-0')
            }
        }

        onScroll()

        window.addEventListener('scroll', onScroll, {
            signal: this.abortController.signal
        })

        inView('footer', (entry) => {
            if (isAffiliatePage) {
                this.$dispatch('set-theme', 'light');
            } 
            else if (!excludedPages.includes(window.location.pathname)) {
                if (window.innerWidth < 1024) {
                    this.$dispatch('set-theme', 'light')
                }
            } else {
                if (window.innerWidth < 1024) {
                    if (!window.location.pathname.includes('/events')) {
                        this.$dispatch('set-theme', 'dark')
                    }
                }
            }


            return () => {
                if (isAffiliatePage) {
                    this.$dispatch('set-theme', 'light');
                } else if (!excludedPages.includes(window.location.pathname)) {
                    if (this.siteCredits) {

                    } else if (!window.location.pathname.includes('/events')) {
                        this.$dispatch('set-theme', 'dark')
                    }
                } else {
                    if (this.siteCredits) {

                    } else {
                        this.$dispatch('set-theme', 'light')
                    }
                }

            }
        }, {
            amount: 0.75
        })
    },
    destroy() {
        this.abortController.abort()
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
            return 124
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
            this.creditsMobile = range(0, 1, 0, 124, progress)
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
            this.creditsMobile = range(0, 1, 124, 0, progress)

        }, { duration: 1.2, easing: expoInOut }).finished

        this.animating = false
    }
});
