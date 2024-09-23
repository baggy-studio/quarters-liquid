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
  async submit() {
    if (!listId) {
      this.error = "Missing List ID";
      return;
    }

    this.loading = true;
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
        this.close()
      }, 1500)
    }
  },
  close() {
    console.log('close')
    this.visible = false;
    cookie.set("newsletter", "true", {
      path: "/",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // Set to 3 days
    });
  },
  shouldOpen() {
    this.visible = !cookie.get("newsletter");
  }
});
