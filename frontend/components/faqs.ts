export default () => ({
    openSection: null,
    faqSections: [],
    
    toggle(id) {
      this.openSection = this.openSection === id ? null : id;
    },
    
    init() {
      setTimeout(() => {
        this.hydrateFAQData();
      }, 50)
  
    },
  
    hydrateFAQData() {
      const faqContainers = document.querySelectorAll('[data-faq-container]');
      faqContainers.forEach((container, index) => {
        const faqData = {
          heading: container.dataset.heading,
          faqItems: JSON.parse(container.dataset.faqItems || '[]')
        };
        this.faqSections.push(faqData);
        this.$dispatch('faq-data-ready', { index, data: faqData });
      });
    }
  });