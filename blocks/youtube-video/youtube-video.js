/**
 * Extracts the YouTube video ID from various YouTube URL formats.
 * @param {string} url - The YouTube URL.
 * @returns {string|null} The video ID or null if not found.
 */
function extractVideoId(url) {
  if (!url) return null;
  let videoId = null;
  // Regular expression to cover various YouTube URL formats
  const patterns = [
    /(?:https?://)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/, // Standard watch, short youtu.be, embed, /v/
  ];

  patterns.some((pattern) => {
    const match = url.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      return true; // Stop iterating if found
    }
    return false;
  });

  return videoId;
}

/**
 * Creates the video player iframe.
 * @param {string} videoId - The YouTube video ID.
 * @returns {HTMLIFrameElement} The iframe element.
 */
function createIframe(videoId) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  // Add rel=0 to minimize related videos, modestbranding=1 for less YT branding
  iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`);
  iframe.setAttribute('title', 'YouTube video player'); // Accessibility
  iframe.classList.add('youtube-video-iframe');
  return iframe;
}

/**
 * Decorates the YouTube video block.
 * @param {HTMLElement} block - The block element.
 */
export default function decorate(block) {
  // Find the picture element (optional thumbnail)
  const picture = block.querySelector(':scope > div:first-child > div > picture');
  // Find the div containing the URL. It's the second div if a picture exists, otherwise the first.
  const urlElement = picture
    ? block.querySelector(':scope > div:nth-child(2) > div')
    : block.querySelector(':scope > div:first-child > div');

  const url = urlElement?.textContent?.trim();

  if (!url) {
    // eslint-disable-next-line no-console
    console.error('YouTube URL not found or invalid structure.', block);
    block.textContent = ''; // Clear block if URL is missing
    return;
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    // eslint-disable-next-line no-console
    console.error('Invalid YouTube URL:', url);
    block.textContent = ''; // Clear block if ID extraction fails
    return;
  }

  // Clear the original content
  block.textContent = '';

  const videoContainer = document.createElement('div');
  videoContainer.classList.add('youtube-video-container');

  // --- Create Thumbnail Placeholder --- 
  const thumbnailContainer = document.createElement('div');
  thumbnailContainer.classList.add('youtube-video-thumbnail');
  thumbnailContainer.setAttribute('role', 'button');
  thumbnailContainer.tabIndex = 0;

  let thumbnailImage;
  if (picture) {
    thumbnailImage = picture; // Reuse existing picture element
    thumbnailContainer.setAttribute('aria-label', picture.querySelector('img')?.alt || 'Play video');
  } else {
    // Create default thumbnail using YouTube's preview images
    thumbnailImage = document.createElement('picture');
    const defaultThumb = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const fallbackThumb = `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`; // Use sd as fallback

    // Provide WEBP and JPG sources
    thumbnailImage.innerHTML = `
      <source type="image/webp" srcset="https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp"/>
      <source type="image/jpeg" srcset="${defaultThumb}"/>
      <img loading="lazy" alt="Play video" src="${fallbackThumb}" width="1280" height="720"/>
    `;
    thumbnailContainer.setAttribute('aria-label', 'Play video');

    // Check if high-res thumbnail exists, otherwise use standard def
    const imgTest = new Image();
    imgTest.src = defaultThumb;
    imgTest.onerror = () => {
        const img = thumbnailImage.querySelector('img');
        if (img) img.src = fallbackThumb; // Fallback if maxres fails
        const jpgSource = thumbnailImage.querySelector('source[type="image/jpeg"]');
        if(jpgSource) jpgSource.srcset = fallbackThumb;
        const webpSource = thumbnailImage.querySelector('source[type="image/webp"]');
        if(webpSource) webpSource.srcset = `https://i.ytimg.com/vi_webp/${videoId}/sddefault.webp`;
    };

  }
  thumbnailContainer.appendChild(thumbnailImage);

  // --- Create Play Button --- 
  const playButton = document.createElement('div');
  playButton.classList.add('youtube-video-play-button');
  // Inline SVG for the play icon
  playButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;
  playButton.setAttribute('aria-hidden', 'true'); // Hide decorative SVG from screen readers
  thumbnailContainer.appendChild(playButton);

  videoContainer.appendChild(thumbnailContainer);
  block.appendChild(videoContainer);

  // --- Add Interaction to Load Video --- 
  const playVideoHandler = () => {
    // Remove placeholder content (thumbnail and button)
    thumbnailContainer.remove();
    // Create and append the iframe
    const iframe = createIframe(videoId);
    videoContainer.appendChild(iframe);
    iframe.focus(); // Focus the iframe once loaded
  };

  thumbnailContainer.addEventListener('click', playVideoHandler);
  thumbnailContainer.addEventListener('keydown', (e) => {
    // Play video on Enter or Space key press
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      playVideoHandler();
    }
  });
}