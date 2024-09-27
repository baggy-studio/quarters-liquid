import { fragmentPlugin } from "@/entrypoints/swup";
import { Rule as FragmentRule } from "@swup/fragment-plugin";
import { swup } from "../entrypoints/swup";
import { Visit } from "swup";

function fetchCollectionNavigation() {
  const script = document.querySelector('[data-collection-navigation]');
  if (!script) return [];
  const data = JSON.parse(script.innerHTML)
  return data;
}

export default (collectionUrl) => ({
  navigation: fetchCollectionNavigation(),
  activeUrl: collectionUrl,
  visitStart: (visit: Visit) => { },
  init() {
    this.loadTransitionRules(this.navigation)

    this.visitStart = (visit: Visit) => {
      if (visit.to.url.includes('collections/')) {
        this.activeUrl = visit.to.url
      }
    }

    swup.hooks.on('visit:start', this.visitStart)
  },
  destroy() {
    swup.hooks.off('visit:start', this.visitStart)
  },
  loadTransitionRules(navigation) {
    const rules: Array<FragmentRule> = []
    navigation.forEach((filter) => {
      Object.entries(filter).forEach(([collectionUrl, filters]) => {
        if (Array.isArray(filters) && filters?.length) {
          filters.forEach((filter) => {
            rules.push({
              from: [collectionUrl, filter.url],
              to: [filter.url, collectionUrl],
              containers: ["#product-grid"],
              name: collectionUrl
            })
          })
        }
      });
    })
    rules.forEach((rule) => fragmentPlugin.prependRule(rule))
  }
});