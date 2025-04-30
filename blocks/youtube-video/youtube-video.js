/**
 * Extracts the YouTube video ID from a given URL or string.
 * @param {string} url The YouTube URL or video ID.
 * @returns {string|null} The YouTube video ID or null if not found.
 */
function extractYoutubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/, // Standard links, embed links, short links, shorts links
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([\w-]{11})/, // Live stream links
    /^[\w-]{11}$/, // Just the ID
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  // eslint-disable-next-line no-console
  console.warn(`Could not extract YouTube ID from URL: ${url}`);
  return null;
}

/**
 * Creates the YouTube iframe element.
 * @param {string} videoId The YouTube video ID.
 * @returns {HTMLIFrameElement} The iframe element.
 */
function createYoutubeIframe(videoId) {
  const iframe = document.createElement('iframe');
  // Use youtube-nocookie.com for privacy
  iframe.setAttribute('src', `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`);
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('title', 'YouTube video player'); // Accessibility
  iframe.classList.add('youtube-video-iframe');
  return iframe;
}

/**
 * Decorates the YouTube video block.
 * @param {Element} block The block element.
 */
export default function decorate(block) {
  const rows = Array.from(block.children);
  let pictureDiv = null;
  let urlDiv = null;

  // Find the picture and URL divs by inspecting the content of the cells
  rows.forEach((row) => {
    const cell = row.firstElementChild;
    if (cell) {
      if (cell.querySelector('picture')) {
        pictureDiv = cell;
      } else {
        const link = cell.querySelector('a');
        const cellText = cell.textContent.trim();
        // Check for YouTube link either in an <a> tag or as plain text
        if ((link && (link.href.includes('youtube.com') || link.href.includes('youtu.be'))) ||
            (!link && cellText.startsWith('http') && (cellText.includes('youtube.com') || cellText.includes('youtu.be')))) {
          urlDiv = cell;
        }
      }
    }
  });

  const url = urlDiv ? (urlDiv.querySelector('a')?.href || urlDiv.textContent.trim()) : null;
  const videoId = extractYoutubeId(url);

  if (!videoId) {
    // eslint-disable-next-line no-console
    console.warn('YouTube block: Invalid or missing YouTube URL.', block);
    block.innerHTML = ''; // Clear block if invalid
    block.style.display = 'none';
    return;
  }

  // Clear the original content and prepare the container
  block.innerHTML = '';
  const videoContainer = document.createElement('div');
  videoContainer.classList.add('youtube-video-container');

  // Get or create the thumbnail
  let thumbnail;
  if (pictureDiv) {
    thumbnail = pictureDiv.querySelector('picture');
    const img = thumbnail.querySelector('img');
    if (img && !img.getAttribute('alt')) {
      img.setAttribute('alt', 'YouTube video thumbnail'); // Set default alt text if missing
    }
  } else {
    // Create a default thumbnail if none is provided in the authored content
    thumbnail = document.createElement('picture');
    const img = document.createElement('img');
    // Try loading high-resolution thumbnail first
    img.setAttribute('src', `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
    img.setAttribute('alt', 'YouTube video thumbnail');
    img.setAttribute('loading', 'lazy');

    // Fallback to standard quality if maxresdefault fails
    img.onerror = () => {
      img.setAttribute('src', `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
      img.onerror = null; // Prevent infinite loop if hqdefault also fails
    };
    thumbnail.append(img);
  }
  videoContainer.append(thumbnail);

  // Create and add the play button
  const playButton = document.createElement('button');
  playButton.classList.add('youtube-video-play-button');
  playButton.setAttribute('type', 'button');
  playButton.setAttribute('aria-label', 'Play video');
  playButton.innerHTML = `
    <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="36" cy="36" r="34" fill="currentColor"></circle>
      <path d="M52.5 36 L27 51 L27 21 Z" fill="#FFF"></path>
    </svg>`;
  videoContainer.append(playButton);

  // Add event listener to load the iframe on click
  videoContainer.addEventListener('click', () => {
    const iframe = createYoutubeIframe(videoId);
    videoContainer.innerHTML = ''; // Clear thumbnail and button
    videoContainer.classList.add('video-loaded'); // Add class to manage styles after load
    videoContainer.append(iframe);
  }, { once: true }); // Ensure the listener runs only once

  block.append(videoContainer);
}
