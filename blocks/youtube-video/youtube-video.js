/**
 * Extracts the YouTube video ID from various URL formats.
 * @param {string} url - The YouTube URL.
 * @returns {string|null} The video ID or null if not found.
 */
function extractVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Creates the YouTube iframe element.
 * @param {string} videoId - The YouTube video ID.
 * @returns {HTMLIFrameElement} The configured iframe element.
 */
function createIframe(videoId) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'YouTube video player');
  iframe.setAttribute('width', '560'); // Default, overridden by CSS
  iframe.setAttribute('height', '315'); // Default, overridden by CSS
  // Use youtube-nocookie.com for enhanced privacy
  // rel=0 prevents related videos from showing at the end from different channels
  iframe.setAttribute('src', `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`);
  iframe.setAttribute('frameborder', '0');
  // Recommended allow attributes for YouTube embeds
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  iframe.setAttribute('allowfullscreen', '');
  iframe.classList.add('youtube-iframe');
  return iframe;
}

/**
 * Decorates the YouTube video block.
 * @param {HTMLElement} block - The block element.
 */
export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  let thumbnailDiv = null;
  let urlDiv = null;

  // Detect structure: first row picture (optional), second row URL
  // Or: first row URL only
  if (rows.length === 2) {
    const potentialThumbnailRow = rows[0];
    const potentialUrlRow = rows[1];
    // Check if the first row contains a picture element
    if (potentialThumbnailRow.querySelector(':scope > div > picture')) {
      thumbnailDiv = potentialThumbnailRow.querySelector(':scope > div');
    }
    // Assume the second row contains the URL
    urlDiv = potentialUrlRow.querySelector(':scope > div');
  } else if (rows.length === 1) {
    // Assume the single row contains the URL
    urlDiv = rows[0].querySelector(':scope > div');
  }

  if (!urlDiv) {
    console.error('YouTube Video block: URL div not found.', block);
    block.innerHTML = ''; // Clear block content
    block.textContent = 'Error: YouTube URL configuration missing.';
    block.classList.add('youtube-video-error');
    return;
  }

  const url = urlDiv.textContent?.trim();
  const videoId = extractVideoId(url);

  if (!videoId) {
    console.error('YouTube Video block: Invalid or missing YouTube URL.', url, block);
    block.innerHTML = ''; // Clear block content
    block.textContent = 'Error: Invalid YouTube URL provided.';
    block.classList.add('youtube-video-error');
    return;
  }

  // Clear the original authored content (picture/URL divs)
  block.innerHTML = '';

  // Create the main container for video elements
  const videoContainer = document.createElement('div');
  videoContainer.classList.add('youtube-video-container');
  block.append(videoContainer);

  // Create the play button
  const playButton = document.createElement('button');
  playButton.classList.add('youtube-play-button');
  playButton.setAttribute('type', 'button');
  playButton.setAttribute('aria-label', 'Play YouTube video'); // Accessibility

  // Function to load and play the video
  const playVideo = () => {
    const iframe = createIframe(videoId);
    videoContainer.innerHTML = ''; // Remove thumbnail and button
    videoContainer.appendChild(iframe);
  };

  if (thumbnailDiv) {
    // Use the provided thumbnail
    thumbnailDiv.classList.add('youtube-thumbnail');
    videoContainer.append(thumbnailDiv);
    videoContainer.append(playButton);

    // Add click listener to the container (acts on thumbnail and button area)
    videoContainer.addEventListener('click', playVideo, { once: true });

    // Ensure button click also triggers play (and stops propagation if needed)
    playButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent container listener firing unnecessarily
      playVideo();
    }, { once: true });

  } else {
    // No thumbnail provided - show a placeholder background with play button
    videoContainer.classList.add('youtube-no-thumbnail');
    videoContainer.append(playButton);

    // Add click listener to the container or button
    videoContainer.addEventListener('click', playVideo, { once: true });
    playButton.addEventListener('click', (e) => {
        e.stopPropagation();
        playVideo();
    }, { once: true });
  }
}