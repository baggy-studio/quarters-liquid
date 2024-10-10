export default () => ({
    textColor: null,
    backgroundColor: null,
    headerTheme: null,
    footerTextColor: null,
    footerBackgroundColor: null,
    lastTextColor: null,
    lastBackgroundColor: null,
    inView: false,

    init() {
        this.hydrateColors();
    },

    hydrateColors() {
        const colorSettings = document.querySelector('[data-color-settings]');
        if (colorSettings) {
            this.textColor = colorSettings.getAttribute('data-text-color');
            this.backgroundColor = colorSettings.getAttribute('data-background-color');
            this.headerTheme = colorSettings.getAttribute('data-header-theme');
            this.footerTextColor = colorSettings.getAttribute('data-footer-text-color');
            this.footerBackgroundColor = colorSettings.getAttribute('data-footer-background-color');
            console.log('Color settings loaded:', {
                textColor: this.textColor,
                backgroundColor: this.backgroundColor,
                headerTheme: this.headerTheme,
                footerTextColor: this.footerTextColor,
                footerBackgroundColor: this.footerBackgroundColor
            });
        } else {
            console.warn('Color settings element not found');
        }
    },

    dispatchColorData() {
        console.log('Dispatching color data');
        this.lastTextColor = this.textColor;
        this.lastBackgroundColor = this.backgroundColor;
        this.$dispatch('set-colors', { 
            text: this.textColor, 
            bg: this.backgroundColor 
        });
        this.$dispatch('set-theme', this.getThemeFromColor(this.headerTheme));
        this.$dispatch('set-footer-colors', { 
            text: this.footerTextColor, 
            bg: this.footerBackgroundColor 
        });
        console.log('Color data dispatched', {
            textColor: this.textColor,
            backgroundColor: this.backgroundColor,
            headerTheme: this.headerTheme,
            footerTextColor: this.footerTextColor,
            footerBackgroundColor: this.footerBackgroundColor
        });
    },

    resetColors() {
        console.log('Resetting colors');
        this.$dispatch('set-colors', { text: null, bg: null });
        this.$dispatch('set-theme', null);
        this.$dispatch('set-footer-colors', { text: null, bg: null });
        console.log('Colors reset');
    },

    getThemeFromColor(color) {
        return color === '#F4EED0' ? 'light' : 'dark';
    }
});