import { range } from "@/utils";
import { animate } from "motion";
import { expoInOut } from "@/easing";
import Alpine from "alpinejs";
import { swup } from "../entrypoints/swup";

export default () => ({
  abortController: new AbortController(),
  abortControllerResize: new AbortController(),
  aspectRatio: window.innerWidth / window.innerHeight,

  transformX: 0,
  transformY: 0,
  transformScale: 1,
  transformWidth: window.innerWidth,
  transformHeight: window.innerWidth * (window.innerWidth / window.innerHeight),
  selectedIndex: 0,

  previousIndex: null,
  fadeOutStarted: false,
  initialAnimating: false,

  visible: false,
  animating: false,
  pointer: {
    x: 0,
    y: 0
  },
  fromPosition: {},
  fromLarge: false,
  mediaCount: 0,
  media: [],
  timeOut: null,
  offsetY: 0,
  contentReplace: () => { },
  init() {
    window.addEventListener('pointermove', this.move.bind(this), {
      signal: this.abortController.signal
    })

    window.addEventListener('resize', this.resize.bind(this), {
      signal: this.abortControllerResize.signal
    })

  // const fullscreenFixed = document.querySelector('[data-fullscreen-fixed]');
  // if (fullscreenFixed) {
  //   let startX = 0;
  //   let currentX = 0;
  //   let hasMoved = false;
    
  //   fullscreenFixed.addEventListener('touchstart', (e) => {
  //     if (!this.visible || this.animating) return;
  //     startX = e.touches[0].pageX;
  //     currentX = startX;
  //     hasMoved = false;
  //   }, { signal: this.abortController.signal });

  //   fullscreenFixed.addEventListener('touchmove', (e) => {
  //     if (!this.visible || this.animating) return;
  //     currentX = e.touches[0].pageX;
  //     if (Math.abs(currentX - startX) > 5) { // Small threshold to detect movement
  //       hasMoved = true;
  //       e.preventDefault();
  //     }
  //   }, { signal: this.abortController.signal, passive: false });

  //   fullscreenFixed.addEventListener('touchend', (e) => {
  //     if (!this.visible || this.animating || !hasMoved) return;
      
  //     const diff = currentX - startX;
  //     if (Math.abs(diff) > 50) { // Minimum swipe distance
  //       if (diff > 0) {
  //         const prevIndex = this.selectedIndex <= 0 
  //           ? this.mediaCount - 1 
  //           : this.selectedIndex - 1;
  //         this.advanceImage(prevIndex);
  //       } else {
  //         const nextIndex = (this.selectedIndex + 1) % this.mediaCount;
  //         this.advanceImage(nextIndex);
  //       }
  //     }
  //   }, { signal: this.abortController.signal });
  // }


      // Touch handling for mobile swipe
      const fullscreenFixed = document.querySelector('[data-fullscreen-fixed]');
      if (fullscreenFixed) {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        let hasMoved = false;
        let isScrolling = false;
        
        fullscreenFixed.addEventListener('touchstart', (e) => {
          if (!this.visible || this.animating) return;
          startX = e.touches[0].pageX;
          startY = e.touches[0].pageY;
          currentX = startX;
          currentY = startY;
          hasMoved = false;
          isScrolling = false;
        }, { signal: this.abortController.signal });
  
        fullscreenFixed.addEventListener('touchmove', (e) => {
          if (!this.visible || this.animating) return;
          
          currentX = e.touches[0].pageX;
          currentY = e.touches[0].pageY;
          
          // Calculate horizontal and vertical movement
          const deltaX = Math.abs(currentX - startX);
          const deltaY = Math.abs(currentY - startY);
          
          // Determine if this is a horizontal swipe or vertical scroll
          if (!isScrolling && !hasMoved) {
            isScrolling = deltaY > deltaX;
            if (!isScrolling && deltaX > 5) {
              hasMoved = true;
              e.preventDefault();
            }
          }
          
          // If it's a horizontal swipe, prevent scrolling
          if (hasMoved && !isScrolling) {
            e.preventDefault();
          }
        }, { signal: this.abortController.signal, passive: false });
  
        fullscreenFixed.addEventListener('touchend', (e) => {
          if (!this.visible || this.animating || !hasMoved || isScrolling) return;
          
          const diff = currentX - startX;
          const swipeThreshold = window.innerWidth * 0.15; // 15% of screen width
          
          if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && this.selectedIndex > 0) {
              // Swipe right - go to previous image
              this.advanceImage(this.selectedIndex - 1);
            } else if (diff < 0 && this.selectedIndex < this.mediaCount - 1) {
              // Swipe left - go to next image
              this.advanceImage(this.selectedIndex + 1);
            } else {
              // Bounce animation when at the end
              this.animateBounce(diff);
            }
          }
        }, { signal: this.abortController.signal });
      }

    this.contentReplace = () => {
      this.timeOut = setTimeout(() => {
        const fullscreenElement = document.querySelector('[data-fullscreen]');
        if (!fullscreenElement) {
          console.error('Fullscreen element not found');
          return;
        }
        this.mediaCount = document.querySelector('[data-fullscreen]')?.dataset.count
        this.media = Array.from(document.querySelectorAll('[data-fullscreen-image]'))?.map((el) => {
          const width = parseFloat(el.dataset.width);
          const height = parseFloat(el.dataset.height);
          const aspectRatio = parseFloat(el.dataset.aspectRatio);
          const src = el.dataset.src || el.querySelector('img')?.src;
          const alt = el.dataset.alt || el.querySelector('img')?.alt;
          const caption = el.dataset.caption;
          
          return {
            width,
            height,
            aspectRatio,
            src,
            alt,
            caption
          };
        });
  
        this.mediaCount = this.media.length;
        fullscreenElement.dataset.count = this.mediaCount.toString();
        if (this.media.length > 0) {
          this.selectedIndex = Math.min(this.selectedIndex, this.media.length - 1);
          this.resize();
        } else {
          console.error('No media items found');
        }
      }, 100);
    }

    this.contentReplace()

    swup.hooks.on('content:replace', this.contentReplace)

    Alpine.effect(() => {
      if (typeof this.selectedIndex === 'number' && this.visible && !this.animating) {
        if (this.fromLarge) {

          this.$dispatch('fullscreen:index', this.selectedIndex)
        } else {

          this.$dispatch('fullscreen:index', this.selectedIndex - 1)
        }
      }
    })
  },
  move(e: MouseEvent) {
    this.pointer.x = e.clientX
    this.pointer.y = e.clientY
  },
  destroy() {
    this.abortController.abort()
    this.abortControllerResize.abort()
    swup.hooks.off('content:replace', this.contentReplace)

    clearTimeout(this.timeOut)
  },
  async openFullscreen(e: MouseEvent, { large = true, index = 0, clickedElement }) {
    if (this.animating) return

    const container = document.querySelector('[data-fullscreen-fixed]')
    const element = document.querySelector('[data-fullscreen]')

    this.lockScroll()

    this.fromLarge = large
    this.selectedIndex = index

    this.visible = true
    this.initialAnimating = true

    this.pointer.x = e.clientX
    this.pointer.y = e.clientY
    
    this.fromPosition = this.getClickedImageDimensions(clickedElement);

    this.aspectRatio = this.fromPosition.width / this.fromPosition.height

   // Calculate offsetY
   const targetWidth = window.innerWidth;
   const heightBasedOnAspectRatio = targetWidth / this.activeMedia.aspectRatio;
   const targetHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight) - window.innerHeight;
   this.offsetY = targetHeight / 2

    element.style.position = 'fixed';
    element.style.top = -this.offsetY + 'px';


    await this.onAnimateOpen(this.offsetY)


    if (container) {
      element.style.position = 'relative';
      element.style.top = 'auto';
      container.scrollTop = this.offsetY
      this.offsetY = 0
    }

    this.originalImage = {
      element: clickedElement,
      rect: this.fromPosition,
      scrollY: window.scrollY
    };
 
    this.animating = false;
    this.initialAnimating = false; 
  },
  async closeFullscreen() {
    if (this.animating) return
    this.initialAnimating = true; 
    
    const container = document.querySelector('[data-fullscreen-fixed]')
    const element = document.querySelector('[data-fullscreen]')


    if (this.originalImage && this.originalImage.element) {
      const currentRect = this.originalImage.element.getBoundingClientRect();
      const scrollDiff = window.scrollY - this.originalImage.scrollY;
  
      this.fromPosition = {
        left: currentRect.left,
        top: currentRect.top - scrollDiff,
        width: currentRect.width,
        height: currentRect.height
      };
    } else {
      if (this.fromLarge) {
        this.fromPosition = this.getLargeImageDimensions()
      } else {
        this.fromPosition = this.getSmallImageDimensions()
      }
    }

    this.offsetY = container?.scrollTop ?? 0

    element.style.position = 'fixed';
    element.style.top = -this.offsetY + 'px';

    await this.onAnimateClose(this.offsetY)

    this.offsetY = 0
    this.animating = false
    this.visible = false

    this.unlockScroll()

    container?.scrollTo({ top: 0 })
  },
  // async nextImage() {
  //   if (this.mediaCount === 0 || this.animating) {
  //     console.warn('No media items available or animation in progress');
  //     return;
  //   }

  //   this.animating = true;
  //   this.fadeOutStarted = false;
  //   this.previousIndex = this.selectedIndex;
    
  //   // Update to next index
  //   this.selectedIndex = (this.selectedIndex + 1) % this.mediaCount;
    
  //   // Wait for the next image to fully load before starting any transition
  //   try {
  //     await new Promise((resolve, reject) => {
  //       const nextImage = new Image();
  //       nextImage.onload = resolve;
  //       nextImage.onerror = reject;
  //       nextImage.src = this.media[this.selectedIndex].src;
  //     });
      
  //     // Only start fade out after new image is loaded
  //     this.fadeOutStarted = true;
      
  //     // Complete the transition after fade out
  //     await new Promise(resolve => setTimeout(resolve, 500));
      
  //     this.animating = false;
  //     this.fadeOutStarted = false;
  //     this.previousIndex = null;
  //     this.resize();
  //     this.$dispatch('fullscreen:index', this.selectedIndex);
  //     document.querySelector('[data-fullscreen-fixed]')?.scrollTo({ top: 0 });
  //   } catch (error) {
  //     console.error('Failed to load next image:', error);
  //     // Reset state on error
  //     this.animating = false;
  //     this.fadeOutStarted = false;
  //     this.selectedIndex = this.previousIndex;
  //     this.previousIndex = null;
  //   }
  // },
  async nextImage() {
    if (this.mediaCount === 0 || this.animating) {
      console.warn('No media items available or animation in progress');
      return;
    }
  
    this.animating = true;
    this.fadeOutStarted = false;
    this.previousIndex = this.selectedIndex;
    
    // Calculate next index but don't update selectedIndex yet
    const nextIndex = (this.selectedIndex + 1) % this.mediaCount;
    
    try {
      // Create and load next image while keeping previous image visible
      const nextImage = new Image();
      nextImage.src = this.media[nextIndex].src;
      
      // Wait for the image to be fully loaded
      await new Promise((resolve, reject) => {
        nextImage.onload = () => {
          // Decode the image to ensure it's fully ready
          if (nextImage.decode) {
            nextImage.decode().then(resolve).catch(resolve);
          } else {
            resolve();
          }
        };
        nextImage.onerror = reject;
      });
  
      // Only update selectedIndex after the new image is ready
      this.selectedIndex = nextIndex;
      
      // Force a reflow to ensure proper transition
      void document.querySelector('[data-fullscreen]')?.offsetHeight;
      
      // Start fade transition
      requestAnimationFrame(() => {
        this.fadeOutStarted = true;
        
        setTimeout(() => {
          this.animating = false;
          this.fadeOutStarted = false;
          this.previousIndex = null;
          this.resize();
          
          const container = document.querySelector('[data-fullscreen-fixed]');
          if (container) {
            container.scrollTo({ top: 0 });
          }
          
          this.$dispatch('fullscreen:index', this.selectedIndex);
        }, 300); // Match your CSS transition duration
      });
    } catch (error) {
      console.error('Failed to load next image:', error);
      // Reset state on error but keep previous image visible
      this.animating = false;
      this.fadeOutStarted = false;
      this.selectedIndex = this.previousIndex;
      this.previousIndex = null;
    }
  },  
  // advanceImage(index) {
  //   if (this.animating || index === this.selectedIndex) {
  //     return;
  //   }

  //   this.animating = true;
  //   this.fadeOutStarted = false;
  //   this.previousIndex = this.selectedIndex;
  //   this.selectedIndex = index;
    
  //   const nextImage = new Image();
  //   nextImage.src = this.media[this.selectedIndex].src;
    
  //   nextImage.onload = () => {
  //     requestAnimationFrame(() => {
  //       this.fadeOutStarted = true;
        
  //       setTimeout(() => {
  //         this.animating = false;
  //         this.fadeOutStarted = false;
  //         this.previousIndex = null;
  //         this.resize();
          
  //         const container = document.querySelector('[data-fullscreen-fixed]');
  //         const targetWidth = window.innerWidth;
  //         const heightBasedOnAspectRatio = targetWidth / this.activeMedia.aspectRatio;
  //         const targetHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight) - window.innerHeight;

  //         container?.scrollTo({ 
  //           top: targetHeight / 2,
  //           behavior: 'smooth'
  //         });

  //         this.$dispatch('fullscreen:index', this.selectedIndex);
  //       }, 500);
  //     });
  //   };

  //   nextImage.onerror = () => {
  //     this.animating = false;
  //     this.fadeOutStarted = false;
  //     this.selectedIndex = this.previousIndex;
  //     this.previousIndex = null;
  //     console.error('Failed to load image at index:', index);
  //   };
  // },
  advanceImage(index) {
    if (this.animating || index === this.selectedIndex) {
      return;
    }
  
    this.animating = true;
    this.fadeOutStarted = false;
    this.previousIndex = this.selectedIndex;
    
    // Don't update selectedIndex yet
    const targetIndex = index;
    
    const nextImage = new Image();
    nextImage.src = this.media[targetIndex].src;
    
    // Use Promise to handle image loading
    new Promise((resolve, reject) => {
      if (nextImage.complete) {
        // If image is already cached, decode it
        if (nextImage.decode) {
          nextImage.decode().then(resolve).catch(resolve);
        } else {
          resolve();
        }
      } else {
        nextImage.onload = () => {
          // Decode after load for new images
          if (nextImage.decode) {
            nextImage.decode().then(resolve).catch(resolve);
          } else {
            resolve();
          }
        };
        nextImage.onerror = reject;
      }
    })
    .then(() => {
      // Only update selectedIndex after image is ready
      this.selectedIndex = targetIndex;
      
      // Force reflow
      void document.querySelector('[data-fullscreen]')?.offsetHeight;
      
      requestAnimationFrame(() => {
        this.fadeOutStarted = true;
        
        setTimeout(() => {
          this.animating = false;
          this.fadeOutStarted = false;
          this.previousIndex = null;
          this.resize();
          
          const container = document.querySelector('[data-fullscreen-fixed]');
          if (container) {
            const targetWidth = window.innerWidth;
            const heightBasedOnAspectRatio = targetWidth / this.activeMedia.aspectRatio;
            const targetHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight) - window.innerHeight;
            
            container.scrollTo({
              top: targetHeight / 2
            });
          }
          
          this.$dispatch('fullscreen:index', this.selectedIndex);
        }, 300);
      });
    })
    .catch(() => {
      console.error('Failed to load image at index:', index);
      this.animating = false;
      this.fadeOutStarted = false;
      this.selectedIndex = this.previousIndex;
      this.previousIndex = null;
    });
  },
  resize() {
    this.transformWidth = window.innerWidth;
    const heightBasedOnAspectRatio = this.transformWidth / this.activeMedia.aspectRatio;
    this.transformHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight);
  },
  getClickedImageDimensions(clickedElement) {
    if (!clickedElement) return null;
    return clickedElement.getBoundingClientRect();
  },
  getLargeImageDimensions() {
    const largeImage = document.querySelector('[data-large-image]')
    if (!largeImage) return
    const dimensions = largeImage.getBoundingClientRect()
    return dimensions
  },
  getSmallImageDimensions() {
    const smallImage = document.querySelector('[data-small-image]')
    if (!smallImage) return
    const dimensions = smallImage.getBoundingClientRect()
    return dimensions
  },
  getFullscreenDimensions() {
    const fullscreen = document.querySelector('[data-fullscreen]')
    if (!fullscreen) return
    const dimensions = fullscreen.getBoundingClientRect()
    return dimensions
  },
  async onAnimateOpen(offsetY: number = 0) {
    this.animating = true;

    const targetWidth = window.innerWidth;
    const heightBasedOnAspectRatio = targetWidth / this.activeMedia.aspectRatio;
    const targetHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight);

    return await animate((progress) => {
      this.transformX = range(0, 1, this.fromPosition.left, 0, progress);
      this.transformY = range(0, 1, this.fromPosition.top + offsetY, 0, progress);
      this.transformWidth = range(0, 1, this.fromPosition.width, targetWidth, progress);
      this.transformHeight = range(0, 1, this.fromPosition.height, targetHeight, progress);
    }, { duration: 1.2, easing: expoInOut }).finished;
  },
  async onAnimateClose(offsetY: number = 0) {
    this.animating = true
    const fromTop = this.fromPosition.top - (document.querySelector('[data-fullscreen-fixed]')?.getBoundingClientRect().top ?? 0);
    const startWidth = window.innerWidth;
    const heightBasedOnAspectRatio = startWidth / this.activeMedia.aspectRatio;
    const startHeight = Math.max(heightBasedOnAspectRatio, window.innerHeight);
  
    return await animate((progress) => {
    this.transformX = range(0, 1, 0, this.fromPosition.left, progress)
    this.transformY = range(0, 1, 0, fromTop + offsetY, progress)
    this.transformWidth = range(0, 1, startWidth, this.fromPosition.width, progress)
    this.transformHeight = range(0, 1, startHeight, this.fromPosition.height, progress)

  }, { duration: 1.4, easing: expoInOut }).finished
  },
  get clipPath() {
    if (!this.visible) return 'none';

    const left = this.transformX;
    const top = this.transformY - this.offsetY;
    const right = window.innerWidth - (this.transformX + this.transformWidth);
    const bottom = window.innerHeight - (this.transformY + this.transformHeight);

    return `inset(${top}px ${right}px ${bottom}px ${left}px)`;
  },
  get nextIndex() {
    return (this.selectedIndex + 1) % this.mediaCount;
  },
  get index() {
    const index = this.selectedIndex + 1
    return index < 10 ? `0${index}` : index;
  },
  get activeMedia() {
    if (!this.media || this.media.length === 0) {
      console.warn('No media items available');
      return null;
    }
    return this.media[this.selectedIndex] || null;
  }
});
