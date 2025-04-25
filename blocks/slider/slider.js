export default function decorate(block) {
  const slides = [...block.children];
  block.innerHTML = ''; // Clear existing content before restructuring

  const slideContainer = document.createElement('div');
  slideContainer.classList.add('slides-container');
  slideContainer.setAttribute('role', 'group');
  slideContainer.setAttribute('aria-roledescription', 'slide');

  slides.forEach((slide, index) => {
    slide.classList.add('slide');
    slide.setAttribute('role', 'group'); // Slide itself can be a group
    slide.setAttribute('aria-label', `Slide ${index + 1} of ${slides.length}`);
    slide.setAttribute('aria-hidden', index !== 0 ? 'true' : 'false');
    if (index !== 0) {
      slide.style.display = 'none';
    }

    // Ensure the picture element is directly styled if needed or its parent
    const picture = slide.querySelector('picture');
    if (picture) {
      picture.parentNode.classList.add('slide-image-wrapper');
    }
    // If there's text content alongside the image, wrap it
    const contentDivs = slide.querySelectorAll(':scope > div:not(.slide-image-wrapper)');
    if (contentDivs.length > 0) {
      const textWrapper = document.createElement('div');
      textWrapper.classList.add('slide-content-wrapper');
      contentDivs.forEach(div => textWrapper.appendChild(div));
      slide.appendChild(textWrapper);
    }


    slideContainer.appendChild(slide);
  });

  block.appendChild(slideContainer);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');

  let currentIndex = 0;

  const showSlide = (index) => {
    slides.forEach((slide, i) => {
      const isActive = i === index;
      slide.style.display = isActive ? '' : 'none';
      slide.setAttribute('aria-hidden', !isActive ? 'true' : 'false');
      // Eager load the first image, lazy load others
      const img = slide.querySelector('img');
      if (img) {
        if (isActive && img.getAttribute('loading') === 'lazy') {
             // Check if image is already loaded or loading initiated
            if (!img.complete && img.getAttribute('data-src')) {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            }
            img.loading = 'eager'; // Load current slide eagerly
        }
        // Consider preloading next/prev on interaction
      }
    });
    currentIndex = index;
  };

  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  };

  // Create Controls
  const controlsContainer = document.createElement('div');
  controlsContainer.classList.add('slider-controls');

  const prevButton = document.createElement('button');
  prevButton.classList.add('slider-button', 'slider-button-prev');
  prevButton.setAttribute('aria-label', 'Previous Slide');
  prevButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>'; // Simple arrow
  prevButton.addEventListener('click', prevSlide);

  const nextButton = document.createElement('button');
  nextButton.classList.add('slider-button', 'slider-button-next');
  nextButton.setAttribute('aria-label', 'Next Slide');
  nextButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>'; // Simple arrow
  nextButton.addEventListener('click', nextSlide);

  controlsContainer.appendChild(prevButton);
  controlsContainer.appendChild(nextButton);
  block.appendChild(controlsContainer);

  // Initial setup
  showSlide(currentIndex);

  // Optional: Add keyboard navigation
  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    }
    if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });
  // Make the block focusable for keyboard nav
  block.setAttribute('tabindex', '0');
}