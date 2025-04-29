/**
 * Extracts the YouTube video ID from a given URL.
 * @param {string} url The YouTube URL.
 * @returns {string|null} The video ID or null if not found.
 */
function getYoutubeId(url) {
  const urlObj = new URL(url);
  let id = urlObj.searchParams.get('v');
  if (urlObj.hostname === 'youtu.be') {
    id = urlObj.pathname.substring(1);
  }
  return id;
}

/**
 * Creates the thumbnail structure with a play button.
 * @param {string} videoId The YouTube video ID.
 * @param {HTMLElement|null} picture The existing picture element or null.
 * @param {string} videoTitle The title for accessibility.
 * @returns {HTMLElement} The thumbnail container element.
 */
function createThumbnail(videoId, picture, videoTitle) {
  const thumbnailContainer = document.createElement('div');
  thumbnailContainer.classList.add('youtube-video-thumbnail');

  const playButton = document.createElement('button');
  playButton.classList.add('youtube-video-play');
  playButton.type = 'button';
  playButton.setAttribute('aria-label', `Play video: ${videoTitle || 'YouTube Video'}`);
  // Simple SVG Play Button
  playButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
      <path d="M0 0h24v24H0z" fill="none"/>
    </svg>`;

  if (picture) {
    thumbnailContainer.append(picture);
  } else {
    // Fetch default YouTube thumbnail if no picture provided
    const img = document.createElement('img');
    img.loading = 'lazy';
    // Use hqdefault for better quality than default
    img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    img.alt = videoTitle || 'YouTube Video Thumbnail';
    thumbnailContainer.append(img);
  }

  thumbnailContainer.append(playButton);
  return thumbnailContainer;
}

/**
 * Creates the YouTube iframe element.
 * @param {string} videoId The YouTube video ID.
 * @param {string} videoTitle The title for accessibility.
 * @returns {HTMLElement} The iframe element.
 */
function createIframe(videoId, videoTitle) {
  const iframe = document.createElement('iframe');
  iframe.classList.add('youtube-video-iframe');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
  iframe.setAttribute('title', `YouTube video player: ${videoTitle || 'YouTube Video'}`);
  return iframe;
}

export default function decorate(block) {
  const rows = Array.from(block.children);
  let picture;
  let url;

  if (rows.length === 1) {
    // Case: Only URL provided
    const urlDiv = rows[0].querySelector('div > div');
    if (urlDiv) {
      url = urlDiv.textContent.trim();
    }
  } else if (rows.length >= 2) {
    // Case: Picture and URL provided
    const pictureDiv = rows[0].querySelector('div > div');
    picture = pictureDiv?.querySelector('picture');
    const urlDiv = rows[1].querySelector('div > div');
    if (urlDiv) {
      url = urlDiv.textContent.trim();
    }
  }

  if (!url) {
    // eslint-disable-next-line no-console
    console.warn('YouTube Video block requires a valid YouTube URL.');
    block.innerHTML = ''; // Clear the block if no URL
    return;
  }

  const videoId = getYoutubeId(url);
  if (!videoId) {
    // eslint-disable-next-line no-console
    console.warn(`Invalid YouTube URL: ${url}`);
    block.innerHTML = ''; // Clear the block if ID extraction fails
    return;
  }

  // Try to get a title from the image alt text or fallback
  const videoTitle = picture?.querySelector('img')?.getAttribute('alt')?.trim() || '';

  // Clear existing block content before adding new structure
  block.innerHTML = '';

  const thumbnail = createThumbnail(videoId, picture, videoTitle);
  block.append(thumbnail);

  thumbnail.addEventListener('click', () => {
    const iframe = createIframe(videoId, videoTitle);
    block.innerHTML = ''; // Clear thumbnail
    block.append(iframe);
  }, { once: true }); // Ensure the click listener runs only once
}