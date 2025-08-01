import { updateHistoryRecord } from "swup";

function debounce(func, delay = 300) {
    let timer;

    return (...args) => {
        clearTimeout(timer);

        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    }
}

class InfiniteScrollManager {
    /**
     * Creates a new Infinite scroll manager. Configuration options:
     * 
     * @param {Configuration} [config] Optional configuration object
     * @returns {InfiniteScrollManager} InfiniteScrollManager object that manages infinite scrolling
     */
    constructor(config) {
        const settings = config || {};
        const defaults = {
            container: '#scrollContainer',
            paginationPrevious: '#scrollPaginationPrevious',
            paginationNext: '#scrollPaginationNext',
            threshold: 0,
            enableHtml5History: true,
            pageQueryParamName: 'page',
            margin: 0.3,
            debug: false,
            pageTitle: 'Page {pageNum}'
        };

        // Merge custom configs with defaults
        this.settings = Object.assign(defaults, settings);
        this.currentPage = 1;
        this.minPageLoaded = Number.MAX_VALUE;

        this.containerElement = document.querySelector(this.settings.container);
        this.paginationNextElement = document.querySelector(this.settings.paginationNext);
        this.paginationPreviousElement = document.querySelector(this.settings.paginationPrevious);

        this.initialize();
    }

    /**
     * Initializes both IntersectionObservers: Pagination observer and Page observer.
     * Pagination Observer: Observes both previous and next pagination elements to trigger the page load.
     * Page Observer: Observes PageDivision elements to change current page and/or push history state
     */
    initialize() {
        if (!this.containerElement) { return; }

        const searchParams = new URL(window.location).searchParams;
        this.currentPage = searchParams.has(this.settings.pageQueryParamName) ? searchParams.get(this.settings.pageQueryParamName) : this.currentPage;

        this.initializePageLoadObserver();
        this.initializePageChangeObserver();

        this.currentPage = searchParams.has(this.settings.pageQueryParamName) ? searchParams.get(this.settings.pageQueryParamName) : this.currentPage;
        if (this.currentPage != 1) this.containerElement.scrollIntoView();
    }

    /**
     * Initializes Pagination Observer: Observes both previous and next pagination elements to trigger the page load.
     */
    initializePageLoadObserver() {
        const marginInPx = this.containerElement.clientHeight * this.settings.margin;

        this.intersectionObserver = new IntersectionObserver(debounce(this.onIntersection.bind(this)), {
            threshold: this.settings.threshold,
            rootMargin: `${marginInPx}px 0px ${marginInPx}px 0px`,
        });

        if (this.paginationPreviousElement) this.intersectionObserver.observe(this.paginationPreviousElement);
        if (this.paginationNextElement) this.intersectionObserver.observe(this.paginationNextElement);
    }

    /**
     * Initializes PageChange Observer: Observes PageDivision elements to change current page and/or push history state
     */
    initializePageChangeObserver() {
        this.pageChangeObserver = new IntersectionObserver(debounce(this.onPageChange.bind(this), 1000));

        this.containerElement.prepend(this.createPageDivision(this.currentPage));
        this.pageChangeObserver.observe(document.querySelector(`[data-page="${this.currentPage}"]`));
    }

    /**
     * Dispatches 'infinitescroll:end' event over the pagination element and removes the innerHTML of that element.
     * @param {HTMLElement} target Pagination element that is no longer required because we reached the first or last page.
     */
    destroy(target, force = false) {
        target.innerHTML = '';

        if (force) {
            target.dispatchEvent(new CustomEvent('infinitescroll:end'));
            this.intersectionObserver.disconnect();
            this.pageChangeObserver.disconnect();
        }
    }

    /**
     * Callback when a PageDivision element is intersected.
     * @param {IntersectionObserverEntry[]} entries Intersection observer entries
     */
    onPageChange(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                this.currentPage = parseInt(entry.target.dataset.page);
                this.pushHtml5History();
            }
        });
    }

    /**
     * Callback when a Pagination element is intersected.
     * @param {IntersectionObserverEntry[]} entries Intersection observer entries
     */
    onIntersection(entries) {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                this.loadMore(entry.target);
                return;
            }
        });
    }

    /**
     * Load a page based on the Pagination element information.
     * @param {HTMLElement} loadSrc Pagination element that triggered the function
     */
    loadMore(loadSrc) {
        const nextPageLinkElement = loadSrc.querySelector('a');

        if (!nextPageLinkElement) {
            this.destroy(loadSrc, true);
            return;
        }

        this.debug(`Loading page: ${nextPageLinkElement.href}`);

        const request = new XMLHttpRequest();
        request.open('GET', nextPageLinkElement.href, false);
        request.send();

        const parser = new DOMParser();
        const response = parser.parseFromString(request.responseText, 'text/html');

        if (loadSrc == this.paginationPreviousElement) {
            this.onHttpRequestLoadPrevious(request, response);
        } else {
            this.onHttpRequestLoadNext(request, response);
        }
    }

    /**
     * Load page at the beginning of the container and handle scrolling as best as possible.
     * @param {XMLHttpRequest} request Http request
     * @param {Document} response Response as an HTML document
     */
    onHttpRequestLoadPrevious(request, response) {
        const currentScrollY = window.scrollY;

        if (!request.responseText) { return; }
        if (!request.readyState === 4 || !request.status === 200) { return; }

        const newContainer = response.querySelector(this.settings.container).firstElementChild;
        const newPagination = response.querySelector(this.settings.paginationPrevious);

        this.currentPage--;
        this.debug(`onHttpRequestLoadPrevious. Loading page: ${this.currentPage}`);

        this.minPageLoaded = Math.min(this.currentPage, this.minPageLoaded - 1);
        this.containerElement.prepend(newContainer);

        setTimeout(() => {
            const newVPosition = newContainer.scrollHeight + (window.innerHeight / 2);
            if (window.scrollY < newVPosition) {
                window.scrollTo(0, currentScrollY + newContainer.scrollHeight);
            }
        }, 100);

        this.containerElement.prepend(this.createPageDivision(this.minPageLoaded));
        this.pageChangeObserver.observe(document.querySelector(`[data-page="${this.minPageLoaded}"]`));

        if (!newPagination) {
            this.destroy(this.paginationPreviousElement);
        } else {
            this.paginationPreviousElement.innerHTML = newPagination.innerHTML;
            this.triggerLoadEvent(newContainer);
        }
    }

    /**
     * Load page at the end of the container.
     * @param {XMLHttpRequest} request Http request
     * @param {Document} response Response as an HTML document
     */
    onHttpRequestLoadNext(request, response) {
        if (!request.responseText) { return; }
        if (!request.readyState === 4 || !request.status === 200) { return; }

        this.currentPage++;
        this.debug(`onHttpRequestLoadNext. Loading page: ${this.currentPage}`);

        const newContainer = response.querySelector(this.settings.container);
        const newPagination = response.querySelector(this.settings.paginationNext);

        newContainer.prepend(this.createPageDivision(this.currentPage));
        this.containerElement.insertAdjacentHTML('beforeend', newContainer.innerHTML);
        this.pageChangeObserver.observe(document.querySelector(`[data-page="${this.currentPage}"]`));

        if (!newPagination) {
            this.destroy(this.paginationNextElement);
        } else {
            this.paginationNextElement.innerHTML = newPagination.innerHTML;
            this.triggerLoadEvent(newContainer);
        }
    }

    /**
     * Push HTML5 History state for current page
     */
    pushHtml5History() {
        if (window.history.state?.page && window.history.state.page == this.currentPage) return;

        if (this.settings.enableHtml5History) {
            this.debug(`pushHtml5History. Page: ${this.currentPage}`);
            const url = new URL(window.location);
            url.searchParams.set(this.settings.pageQueryParamName, this.currentPage);

            //   updateHistoryRecord(url.toString(), {
            //        page: this.currentPage,
            //    })
        }
    }

    /**
     * Creates a DIV element for tracking pages using the PageChange observer
     * @param {number} page Page number
     * @returns {HTMLElement} DIV with page number
     */
    createPageDivision(page) {
        this.debug(`createPageDivision. Page: ${this.currentPage}`);

        const divider = document.createElement('div');
        divider.dataset.page = page;
        divider.innerText = this.settings.pageTitle.replace('{pageNum}', page);
        divider.classList.add('page-divider');
        divider.style.visibility = 'hidden';
        return divider;
    }

    /**
     * Trigger a 'infinitescroll:load' event when a new page is loaded.
     * @param {Element} newContainer New HTML content added to the container
     */
    triggerLoadEvent(newContainer) {
        document.dispatchEvent(new CustomEvent('infinitescroll:load', {
            detail: {
                content: newContainer,
            },
        }));
    }

    /**
     * Shotcut to add an event listener for listening when a page load.
     * @param {EventListener|EventListenerObject} listener Event listener
     */
    addLoadEventListener(listener) {
        document.addEventListener('infinitescroll:load', listener);
    }

    /**
     * Shotcut to add an event listener for listening when there are no more previous pages to load.
     * @param {EventListener|EventListenerObject} listener Event listener
     */
    addPreviousPageScrollEndEventListener(listener) {
        this.paginationPreviousElement.addEventListener('infinitescroll:end', listener);
    }

    /**
     * Shotcut to add an event listener for listening when there are no more subsequent pages to load.
     * @param {EventListener|EventListenerObject} listener Event listener
     */
    addNextPageScrollEndEventListener(listener) {
        this.paginationNextElement.addEventListener('infinitescroll:end', listener);
    }

    /**
     * Print a message into the console if debug is true
     * ```
     * if(this.settings.debug) {
            console.log(message);
        }
     * ```
     * @param {string} message Message to show in the console
     */
    debug(message) {
        if (this.settings.debug) {
            console.log(`[InfiniteScroll] ${message}`);
        }
    }
}

export { InfiniteScrollManager, InfiniteScrollManager as default };