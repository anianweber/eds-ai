/**
 * Extracts the YouTube video ID from various URL formats.
 * @param {string} url - The YouTube video URL.
 * @returns {string|null} The video ID or null if not found.
 */
function getYoutubeVideoId(url) {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url);
    const { hostname, pathname, searchParams } = urlObj;

    if (hostname === 'youtu.be') {
      videoId = pathname.slice(1);
    } else if (hostname.includes('youtube.com')) {
      if (pathname.startsWith('/embed/')) {
        videoId = pathname.split('/')[2];
      } else if (pathname.startsWith('/v/')) {
        videoId = pathname.split('/')[2];
      } else if (pathname.startsWith('/watch')) {
        videoId = searchParams.get('v');
      } else if (pathname.startsWith('/shorts/')) {
        videoId = pathname.split('/')[2];
      }
    }

    // Validate the potential ID format (11 chars, alphanumeric, -, _)
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return videoId;
    }

    // Fallback regex for cases where URL constructor might miss variations
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/; // eslint-disable-line max-len
    const match = url.match(regex);
    if (match && match[1] && /^[a-zA-Z0-9_-]{11}$/.test(match[1])) {
      return match[1];
    }
  } catch (e) {
    console.warn(`Error parsing YouTube URL: ${url}`, e);
    // Try regex as a last resort if URL parsing failed
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/; // eslint-disable-line max-len
    const match = url.match(regex);
    if (match && match[1] && /^[a-zA-Z0-9_-]{11}$/.test(match[1])) {
      return match[1];
    }
    return null;
  }
  return null;
}

/**
 * Creates the YouTube iframe element.
 * @param {string} videoId - The YouTube video ID.
 * @param {string} [title='YouTube video player'] - The title for the iframe (accessibility).
 * @returns {HTMLIFrameElement} The configured iframe element.
 */
function createIframe(videoId, title = 'YouTube video player') {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
  iframe.setAttribute('title', title);
  iframe.classList.add('youtube-video-iframe');
  return iframe;
}

// SVG for the play button icon
const PLAY_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
<circle cx="32" cy="32" r="30" fill="rgba(0,0,0,0.6)" stroke="#fff" stroke-width="2"/>
<path d="M26 20 L44 32 L26 44 Z" fill="#fff"/>
</svg>`;

/**
 * Decorates the youtube-video block.
 * @param {HTMLElement} block - The block element.
 */
export default function decorate(block) {
  // Select the direct child divs of the block
  const childDivs = block.querySelectorAll(':scope > div');
  if (childDivs.length === 0) {
    console.warn('YouTube block is empty:', block);
    return;
  }

  let thumbnailPicture = null;
  let urlElement = null;

  // Check structure: Can be [thumbnail], [URL] or just [URL]
  if (childDivs.length === 1) {
    // Assume [URL] structure
    urlElement = childDivs[0].querySelector(':scope > div');
  } else if (childDivs.length >= 2) {
    // Assume [thumbnail], [URL] structure
    // Look for picture in the first div
    thumbnailPicture = childDivs[0].querySelector(':scope > div > picture');
    if (thumbnailPicture) {
      urlElement = childDivs[1].querySelector(':scope > div');
    } else {
      // If no picture in the first div, maybe it's [URL], [Optional Caption/Text]?
      // Treat the first div as the URL source.
      urlElement = childDivs[0].querySelector(':scope > div');
    }
  }

  const url = urlElement?.textContent?.trim() || urlElement?.querySelector('a')?.href;

  if (!url) {
    console.warn('YouTube URL missing or invalid structure in block:', block);
    block.innerHTML = ''; // Clear block if URL is missing
    return;
  }

  const videoId = getYoutubeVideoId(url);
  if (!videoId) {
    console.warn('Invalid YouTube URL or could not extract ID:', url, 'in block:', block);
    block.innerHTML = ''; // Clear block if URL is invalid
    return;
  }

  // Clear original block content and prepare the container
  block.innerHTML = '';
  const container = document.createElement('div');
  container.classList.add('youtube-video-container');

  const videoTitle = `YouTube video: ${videoId}`; // Basic title

  // Create play button
  const playButton = document.createElement('button');
  playButton.classList.add('youtube-video-play-button');
  playButton.setAttribute('type', 'button'); // Explicitly set type
  playButton.setAttribute('aria-label', 'Play video');
  playButton.innerHTML = PLAY_ICON_SVG;

  // Create thumbnail element (reuse picture or create img)
  let thumbnailElement;
  if (thumbnailPicture) {
    thumbnailElement = thumbnailPicture;
    thumbnailElement.classList.add('youtube-video-thumbnail');
    // Ensure lazy loading is handled or removed if needed for LCP
    thumbnailElement.querySelector('img')?.removeAttribute('loading');
  } else {
    thumbnailElement = document.createElement('img');
    thumbnailElement.classList.add('youtube-video-thumbnail', 'youtube-default-thumbnail');
    // Use hqdefault as it's reliable; maxresdefault might not exist
    thumbnailElement.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    thumbnailElement.alt = 'Play video'; // Alt text acts as label if image fails
    // Add error handling to fall back to lower resolution thumbnails
    thumbnailElement.onerror = () => {
      thumbnailElement.src = `https://img.youtube.com/vi/${videoId}/sddefault.jpg`;
      thumbnailElement.onerror = () => {
        thumbnailElement.src = `https://img.youtube.com/vi/${videoId}/default.jpg`;
        thumbnailElement.onerror = null; // Prevent infinite loop
      };
    };
  }

  container.appendChild(thumbnailElement);
  container.appendChild(playButton);
  block.appendChild(container);

  // Add click listener to load the iframe
  const loadVideo = () => {
    const iframe = createIframe(videoId, videoTitle);
    container.innerHTML = ''; // Clear thumbnail and button
    container.appendChild(iframe);
    container.classList.add('video-loaded'); // Add class to change styles (e.g., cursor)
  };

  // Add listener to container for easier clicking, but triggered by button too
  container.addEventListener('click', (e) => {
     // Check if the click specifically hit the button or its SVG content
    if (e.target === playButton || playButton.contains(e.target)) {
        loadVideo();
    } else {
        // Also allow clicking anywhere on the container (thumbnail area) to play
        loadVideo();
    }
  }, { once: true });
}
