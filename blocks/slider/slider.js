export default function decorate(block) {
  const slides = Array.from(block.children);
  let currentSlide = 0;
  const numSlides = slides.length;

  // Basic styling and setup
  block.style.position = 'relative';
  block.style.overflow = 'hidden';
  block.style.maxWidth = '100%';
  slides.forEach(slide => {
    slide.style.position = 'absolute';
    slide.style.top = '0';
    slide.style.left = '0';
    slide.style.width = '100%';
    slide.style.height = '100%';
    slide.style.opacity = '0';
    slide.style.transition = 'opacity 0.5s ease-in-out';
    slide.style.display = 'flex'; // Use flex to center content
    slide.style.alignItems = 'center'; // Vertically center
    slide.style.justifyContent = 'center'; // Horizontally center
    slide.setAttribute('aria-hidden', 'true'); // Hide from screen readers
  });

  // Ensure the first slide is visible initially
  slides[currentSlide].style.opacity = '1';
  slides[currentSlide].setAttribute('aria-hidden', 'false');

  // Navigation buttons
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.classList.add('slider-button', 'slider-button-prev');
  prevButton.setAttribute('aria-label', 'Previous Slide');
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.classList.add('slider-button', 'slider-button-next');
  nextButton.setAttribute('aria-label', 'Next Slide');

  block.parentNode.appendChild(prevButton);
  block.parentNode.appendChild(nextButton);

  // Button Styling
  Object.assign(prevButton.style, {
    position: 'absolute',
    top: '50%',
    left: '10px',
    transform: 'translateY(-50%)',
    zIndex: '10',
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    cursor: 'pointer',
    borderRadius: '5px'
  });

  Object.assign(nextButton.style, {
    position: 'absolute',
    top: '50%',
    right: '10px',
    transform: 'translateY(-50%)',
    zIndex: '10',
    background: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    border: 'none',
    padding: '10px 15px',
    cursor: 'pointer',
    borderRadius: '5px'
  });

  // Navigation functions
  function showSlide(index) {
    slides[currentSlide].style.opacity = '0';
    slides[currentSlide].setAttribute('aria-hidden', 'true');
    currentSlide = (index + numSlides) % numSlides; // Ensure index is within bounds
    slides[currentSlide].style.opacity = '1';
    slides[currentSlide].setAttribute('aria-hidden', 'false');
  }

  prevButton.addEventListener('click', () => {
    showSlide(currentSlide - 1);
  });

  nextButton.addEventListener('click', () => {
    showSlide(currentSlide + 1);
  });
}