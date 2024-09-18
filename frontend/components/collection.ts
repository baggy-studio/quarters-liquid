import { swup } from "@/entrypoints/swup";

function getFilters(pathname: string) {
  const url = new URL(pathname, window.location.origin);
  return url.searchParams.getAll("filter.p.t.category") || [];
}

export default (collectionPathname) => ({
  activeUrl: collectionPathname,
  filters: getFilters(collectionPathname + window.location.search),
  init() {
    swup.hooks.on("visit:start", (visit) => {
      this.activeUrl = visit.to.url;

      this.filters = getFilters(this.activeUrl);
    });
  }
});
