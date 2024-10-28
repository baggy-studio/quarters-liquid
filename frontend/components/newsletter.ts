import { subscribeToList } from "@/utils";
import cookie from "js-cookie";

interface Response {
  success: boolean;
  errors?: string[];
}

export default (listId: string) => ({
  visible: false,
  email: "",
  success: false,
  error: null,
  loading: false,
  init() {
    window.Shopify.designMode && this.customizer();
  },
  customizer() {
    document.addEventListener("shopify:section:select", (event) => {
      const { sectionId } = event.detail;
      if (sectionId.includes("newsletter")) {
        this.visible = true;
      }
    });

    document.addEventListener("shopify:section:deselect", () => {
      this.visible = false;
    });
  },
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  async submit() {
    if (!this.email) {
      return;
    }

    if (!this.validateEmail(this.email)) {
      this.error = "Invalid email address";
      return;
    }

    if (!listId) {
      this.error = "Missing List ID";
      return;
    }

    this.loading = true;

    let close = this.close.bind(this)
    try {
      const response: Response = await subscribeToList(listId, this.email);

      if (response.status == 202 || response.status == 200) {
        this.success = true;
      } else {
        this.error = response.errors ? response.errors[0] : "Unknown error";
      }
    } catch (error) {
      this.error = "Something went wrong";
      throw error;
    } finally {
      this.loading = false;

      setTimeout(() => {
        close()
      }, 1500)
    }
  },
  close() {
    this.visible = false;

    // Alpine is broken
    document.querySelector('[data-newsletter]')?.classList.remove('opacity-100')
    document.querySelector('[data-newsletter]')?.classList.add('opacity-0')
    document.querySelector('[data-newsletter-content]')?.classList.remove('pointer-events-auto')

    cookie.set("newsletter", "true", {
      path: "/",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // Set to 3 days
    });
  },
  shouldOpen() {
    setTimeout(() => {
      this.visible = !cookie.get("newsletter");
    }, 5000)
  }
});
