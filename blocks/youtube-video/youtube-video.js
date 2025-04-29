/**
 * Extracts the YouTube video ID from a URL.
 * Handles various YouTube URL formats.
 * @param {string} url The YouTube URL.
 * @returns {string|null} The video ID or null if not found.
 */
function getYouTubeVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/, // Standard, short, embed, v
    /^([a-zA-Z0-9_-]{11})$/ // Direct ID
  ];
  for (let i = 0; i < patterns.length; i += 1) {
    const match = url.match(patterns[i]);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Creates the YouTube thumbnail element if no custom thumbnail is provided.
 * @param {string} videoId The YouTube video ID.
 * @param {string} [altText='YouTube Video Thumbnail'] Alt text for the image.
 * @returns {HTMLImageElement} The thumbnail image element.
 */
function createYouTubeThumbnail(videoId, altText = 'YouTube Video Thumbnail') {
  const img = document.createElement('img');
  // Try high-resolution first, fallback to high-quality
  img.src = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  img.alt = altText;
  img.loading = 'lazy';

  // Check if maxresdefault exists by trying to load it
  const tester = new Image();
  tester.src = img.src;
  tester.onerror = () => {
    // Fallback to hqdefault if maxresdefault fails
    img.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  };

  // Handle potential errors loading the final thumbnail source
  img.onerror = () => {
    console.error('Failed to load YouTube thumbnail for video ID:', videoId);
    // Optional: Display a generic placeholder or hide the image
    img.style.display = 'none';
    // Or set a placeholder background on the wrapper
    img.parentElement?.classList.add('youtube-thumbnail-error');
  };
  return img;
}

/**
 * Creates the play button element.
 * @returns {HTMLButtonElement} The play button element.
 */
function createPlayButton() {
  const button = document.createElement('button');
  button.classList.add('youtube-video-play-button');
  button.setAttribute('type', 'button');
  button.setAttribute('aria-label', 'Play Video');
  // SVG play icon for better scaling and styling
  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>`;
  return button;
}

/**
 * Creates the YouTube iframe element.
 * @param {string} videoId The YouTube video ID.
 * @returns {HTMLIFrameElement} The iframe element.
 */
function createYouTubeIframe(videoId) {
  const iframe = document.createElement('iframe');
  iframe.classList.add('youtube-video-iframe');
  // Ensure autoplay, disable related videos
  iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`);
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.setAttribute('title', 'YouTube video player'); // Accessibility
  return iframe;
}

/**
 * Decorates the YouTube video block.
 * @param {HTMLElement} block The block element provided by AEM's decorateBlock.
 */
export default function decorate(block) {
  // Extract rows. AEM structure is div > div > content
  const rows = Array.from(block.children);

  // Find the URL row. It's usually the last row without a picture.
  let urlRow = rows.find(row =>
    !(row.querySelector('picture')) &&
    (row.querySelector('div')?.textContent?.includes('youtube.com') || row.querySelector('div')?.textContent?.includes('youtu.be'))
  );
  if (!urlRow && rows.length > 0) {
    // Fallback: Assume the last row contains the URL if no specific pattern matched
    urlRow = rows[rows.length - 1];
  }

  const urlElement = urlRow?.querySelector('div');
  const url = urlElement?.textContent?.trim();
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    console.error('YouTube Video block: Invalid or missing YouTube URL.', block);
    block.innerHTML = '<p>Error: Invalid YouTube URL provided.</p>';
    block.style.display = 'block'; // Make block visible for error message
    block.classList.add('youtube-video-error');
    return;
  }

  // Find the thumbnail row (optional)
  const thumbnailRow = rows.find(row => row.querySelector('picture'));
  const pictureElement = thumbnailRow?.querySelector('picture');

  // Create the main container that will hold thumbnail/video
  const videoContainer = document.createElement('div');
  videoContainer.classList.add('youtube-video-container');

  // Add thumbnail (either provided <picture> or fetched from YouTube)
  let thumbnailElement;
  if (pictureElement) {
    // Reuse the existing picture tag
    thumbnailElement = pictureElement;
    const img = thumbnailElement.querySelector('img');
    if (img && !img.getAttribute('alt')?.trim()) {
       // Add a default alt text if missing or empty, enhance accessibility
       img.setAttribute('alt', 'Video thumbnail');
    }
  } else {
    // Create YouTube thumbnail if no picture tag is present
    thumbnailElement = createYouTubeThumbnail(videoId, 'Video thumbnail');
  }
  videoContainer.appendChild(thumbnailElement);

  // Create and add the play button overlay
  const playButton = createPlayButton();
  videoContainer.appendChild(playButton);

  // Add click listener to the container to load the video
  videoContainer.addEventListener('click', (e) => {
    // Don't trigger if the click was on an interactive element inside (if any added later)
    if (e.target !== videoContainer && e.target !== playButton && e.target.closest('button, a')) {
        return;
    }
    e.preventDefault();
    const iframe = createYouTubeIframe(videoId);
    videoContainer.innerHTML = ''; // Clear thumbnail and button
    videoContainer.appendChild(iframe);
    videoContainer.classList.add('video-loaded'); // Add class for potential style changes
  }, { passive: false }); // Need passive: false if preventDefault is used

  // Keyboard accessibility for the container (acting as a button)
  videoContainer.setAttribute('role', 'button');
  videoContainer.setAttribute('tabindex', '0'); // Make it focusable
  videoContainer.setAttribute('aria-label', 'Play video');
  videoContainer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      videoContainer.click(); // Trigger the click handler
    }
  });

  // Replace the original block content with the new video container structure
  block.innerHTML = '';
  block.appendChild(videoContainer);
}
