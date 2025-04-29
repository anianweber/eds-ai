/**
 * Extracts the YouTube video ID from a URL.
 * @param {string} url The YouTube URL.
 * @returns {string|null} The video ID or null if not found.
 */
function getYoutubeVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|)([-\w]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([-\w]+)/,
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
 * Creates the YouTube iframe element.
 * @param {string} videoId The YouTube video ID.
 * @returns {HTMLIFrameElement} The iframe element.
 */
function createIframe(videoId) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('title', 'YouTube video player'); // Accessibility
  iframe.classList.add('youtube-iframe');
  return iframe;
}

/**
 * Creates the play button element.
 * @returns {HTMLButtonElement} The play button element.
 */
function createPlayButton() {
  const button = document.createElement('button');
  button.classList.add('youtube-play-button');
  button.setAttribute('type', 'button');
  button.setAttribute('aria-label', 'Play video'); // Accessibility
  // SVG Play Icon
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M8 5v14l11-7z"/>
    </svg>
  `;
  return button;
}

/**
 * Decorates the YouTube video block.
 * @param {HTMLElement} block The block element.
 */
export default function decorate(block) {
  const rows = Array.from(block.children);
  let pictureDiv = null;
  let urlDiv = null;

  // Identify URL and Picture divs
  if (rows.length === 1) {
    // Assume the single div contains the URL
    urlDiv = rows[0].firstElementChild;
  } else {
    rows.forEach((row) => {
      const rowContent = row.firstElementChild;
      if (rowContent) {
        if (rowContent.querySelector('picture')) {
          pictureDiv = rowContent;
        } else if (rowContent.textContent.includes('youtube.com') || rowContent.textContent.includes('youtu.be')) {
          urlDiv = rowContent;
        }
      }
    });
    // Fallback if specific checks failed but we have 2 divs
    if (!urlDiv && rows.length > 1 && !pictureDiv) {
        urlDiv = rows[rows.length - 1].firstElementChild; // Assume last is URL
    }
    if (!pictureDiv && rows.length > 1 && urlDiv && urlDiv !== rows[0].firstElementChild) {
        pictureDiv = rows[0].firstElementChild; // Assume first is potential picture (even if empty)
    }
  }

  const url = urlDiv?.textContent.trim();
  const videoId = getYoutubeVideoId(url);

  if (!videoId) {
    // eslint-disable-next-line no-console
    console.warn('Invalid YouTube URL or ID not found for block:', block);
    block.innerHTML = ''; // Clear block if invalid
    block.style.display = 'none';
    return;
  }

  // Clear original content
  block.innerHTML = '';

  const videoContainer = document.createElement('div');
  videoContainer.classList.add('youtube-video-container');

  let picture = pictureDiv?.querySelector('picture');

  // If no custom picture provided, create one with YouTube's default thumbnail
  if (!picture) {
    picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    // Fallback HQ thumbnail if maxresdefault is not available (YouTube might return 404)
    img.onerror = () => { img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; };
    img.alt = 'YouTube video thumbnail';
    img.loading = 'lazy';
    picture.append(img);
  }

  videoContainer.append(picture);

  const playButton = createPlayButton();
  videoContainer.append(playButton);

  block.append(videoContainer);

  // Add click listener to load the iframe
  videoContainer.addEventListener('click', (e) => {
    e.preventDefault();
    const iframe = createIframe(videoId);
    videoContainer.innerHTML = ''; // Clear thumbnail and button
    videoContainer.append(iframe);
    videoContainer.classList.add('video-loaded');
    videoContainer.style.cursor = 'default'; // Remove pointer cursor after load
  }, { once: true }); // Ensure the listener is removed after the first click
}
