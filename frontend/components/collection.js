import { swup } from "@/entrypoints/swup";

export default (collectionUrl) => ({
  expanded: false,
  activeUrl: collectionUrl,
  collections: {},
  init() {
    const collectionLinks = document.querySelectorAll(".collection-link");

    if (collectionLinks?.length) {
      collectionLinks.forEach((element) => {
        const { pathname } = new URL(element.href);
        this.collections[pathname] = element.ariaLabel;
      });
    }

    swup.hooks.on("content:replace", (visit) => {
      if (visit.to.url in this.collections) {
        this.activeUrl = visit.to.url;
      }
    });
  },
  async setCollection(e) {
    this.expanded = false;

    const element = e.currentTarget;

    const { pathname } = new URL(element.href);

    this.activeUrl = pathname;
  },
  get activeTitle() {
    return this.collections[this.activeUrl];
  },
});
