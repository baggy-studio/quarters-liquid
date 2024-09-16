
export default (listId) => ({
  email: "",
  success: false,
  error: null,
  loading: false, 
  async submit() {
    if (!listId) return (this.error = "Missing List ID");

    this.loading = true;
    try {
      const response = null;

      if (response.success) {
        this.success = true;
      } else {
        this.error = response.errors[0];
      }
    } catch (error) {
      this.error = "Something went wrong";
      throw error;
    } finally {
      this.loading = false;
    }
  },
});
