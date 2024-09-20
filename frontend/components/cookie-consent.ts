export default () => ({
  visible: false,
  init() {
    let i = this;

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

        console.log('hasConsent', hasConsent)
        if (!hasConsent) {
          i.visible = true
        }
      },
    );
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
