export default () => ({
  visible: false,
  init() {
    let i = this;

    if (window.Shopify.designMode) {
      this.customizer();
      return 
    }

    window.Shopify.loadFeatures(
      [
        {
          name: 'consent-tracking-api',
          version: '0.1',
        },
      ],
      error => {
        if (error) {
          console.error("Failed to load the consent tracking API:", error);
          return;
        }

        const hasConsent = checkVisitorConsent(window.Shopify.customerPrivacy.currentVisitorConsent());


        if (!hasConsent) {
          i.visible = true
        } else {
          i.$dispatch('set-consent', true)
        }
      },
    );
  },
  customizer() {
    document.addEventListener("shopify:section:select", (event) => {
      const { sectionId } = event.detail;
      if (sectionId.includes("cookie_consent")) {
        this.visible = true;
      }
    });

    document.addEventListener("shopify:section:deselect", () => {
      this.visible = false;
    });
  },
  accept() {
    this.visible = false;
    window.Shopify.customerPrivacy.setTrackingConsent(
      {
        "analytics": true,
        "marketing": true,
        "preferences": true
      }
    );
    this.$dispatch('set-consent', true)
  }
});

function checkVisitorConsent(consents) {
  let payload = consents;

  delete payload.sale_of_data

  for (let key in payload) {
    if (consents.hasOwnProperty(key)) {
      if (consents[key] !== "yes") {
        return false;
      }
    }
  }
  return true;
}
