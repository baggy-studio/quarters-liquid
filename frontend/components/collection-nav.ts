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
  isSticky: false,
  scrollDirection: null,
  originalVisible: true,
  abortController: new AbortController(),
  scrollHandler: () => { },
  visitStart: (visit: Visit) => { },
  init() {
    this.loadTransitionRules(this.navigation)

    this.visitStart = (visit: Visit) => {
      if (visit.to.url.includes('/collections/')) {
        this.activeUrl = visit.to.url
      }
    }

    swup.hooks.on('visit:start', this.visitStart)

    this.scrollHandler = () => this.scroll();

    window.addEventListener('scroll', this.scrollHandler, {
      signal: this.abortController.signal
    });
  },
  destroy() {
    swup.hooks.off('visit:start', this.visitStart)
    fragmentPlugin.setRules(fragmentPlugin.getRules().filter((rule) => !rule.name?.includes('collections')));
    this.abortController.abort();
  },
  loadTransitionRules(navigation) {
    const rules: Array<FragmentRule> = []
    navigation.forEach((filter) => {
      Object.entries(filter).forEach(([collectionUrl, filters]) => {
        const filterUrls = []
        if (Array.isArray(filters)) {
          filters.forEach((filter) => {
            if (filter?.url) filterUrls.push(filter.url)
          })
        }
        const fromRules = [collectionUrl, ...filterUrls]
        const toRules = [...filterUrls, collectionUrl]
        rules.push({
          from: fromRules,
          to: toRules,
          containers: ["#product-grid"],
          name: collectionUrl
        })
      });
    })
    rules.forEach((rule) => fragmentPlugin.prependRule(rule))
  },
  scroll() {
    const currentScrollY = window.scrollY;

    // Determine scroll direction by comparing current scroll position to the last one
    if (currentScrollY > this.lastScrollY) {
      this.scrollDirection = 'down';
    } else if (currentScrollY < this.lastScrollY) {
      this.scrollDirection = 'up';
    }

    if (currentScrollY > 96 && this.scrollDirection == 'up') {
      this.isSticky = true
    } else {
      this.isSticky = false
    }

    this.lastScrollY = currentScrollY;
  },
  getCollectionLink(url: string) {
    return this.isSticky ? url + "#shop" : url
  }
});