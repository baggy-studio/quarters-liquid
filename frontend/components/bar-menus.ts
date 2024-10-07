

export default () => ({
    menu: 'drinks',
    init() {
        this.$dispatch('set-menu', this.menu)
    },
    setMenu(menu: string) {
        this.menu = menu
        this.$dispatch('set-menu', menu)
        this.$root.scrollIntoView({ behavior: 'smooth' })
    }
});
