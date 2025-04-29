/**
 * Extracts the YouTube video ID from a URL.
 * @param {string} url - The YouTube URL.
 * @returns {string|null} - The video ID or null if not found.
 */
function getYouTubeVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|)([-\w]{11})/, // youtube.com/watch?v=..., youtube.com/embed/..., youtube.com/v/...
    /(?:https?:\/\/)?youtu\.be\/([-\w]{11})/, // youtu.be/...
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Check if the input is just the ID
  if (url.match(/^[-\w]{11}$/)) {
    return url;
  }

  return null;
}

/**
 * Creates the YouTube iframe element.
 * @param {string} videoId - The YouTube video ID.
 * @param {string} videoTitle - The title for the iframe.
 * @returns {HTMLIFrameElement} - The iframe element.
 */
function createYouTubeIframe(videoId, videoTitle) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('title', videoTitle || 'YouTube video player');
  iframe.classList.add('youtube-video-iframe');
  return iframe;
}

/**
 * Creates the play button SVG element.
 * @returns {SVGSVGElement} - The SVG element.
 */
function createPlayButtonSVG() {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 78 78');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('youtube-video-play-icon');

  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', '39');
  circle.setAttribute('cy', '39');
  circle.setAttribute('r', '38');
  circle.setAttribute('stroke', 'white');
  circle.setAttribute('stroke-width', '2');
  circle.setAttribute('fill', 'rgba(0, 0, 0, 0.5)');
  svg.appendChild(circle);

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', 'M30 28 L52 39 L30 50 Z'); // Adjusted path for a slightly larger triangle
  path.setAttribute('fill', 'white');
  svg.appendChild(path);

  return svg;
}

/**
 * Decorates the YouTube video block.
 * @param {HTMLElement} block - The block element.
 */
export default function decorate(block) {
  const rows = Array.from(block.children);
  let pictureElement = null;
  let url = null;
  let videoTitle = 'YouTube Video'; // Default title

  // Find picture and URL within the block's direct children
  rows.forEach((row) => {
    const picture = row.querySelector('picture');
    if (picture) {
      pictureElement = picture;
    } else {
      // Assume the remaining div contains the URL
      const divContent = row.querySelector('div');
      if (divContent) {
        const potentialUrl = divContent.textContent.trim();
        if (potentialUrl.includes('youtube.com') || potentialUrl.includes('youtu.be')) {
            url = potentialUrl;
            // Try to get a title from the link text if it's an anchor
            const anchor = divContent.querySelector('a');
            if (anchor && anchor.textContent.trim() !== potentialUrl) {
              videoTitle = anchor.textContent.trim();
            }
        }
      }
    }
  });

  if (!url) {
    // eslint-disable-next-line no-console
    console.warn('YouTube block: URL not found.', block);
    block.innerHTML = ''; // Clear block if no URL
    return;
  }

  const videoId = getYouTubeVideoId(url);
  if (!videoId) {
    // eslint-disable-next-line no-console
    console.warn('YouTube block: Invalid YouTube URL or Video ID not found.', url, block);
    block.innerHTML = ''; // Clear block if invalid URL
    return;
  }

  // Clear original block content
  block.innerHTML = '';

  const videoContainer = document.createElement('div');
  videoContainer.classList.add('youtube-video-container');

  const thumbnailContainer = document.createElement('div');
  thumbnailContainer.classList.add('youtube-video-thumbnail-container');
  thumbnailContainer.setAttribute('role', 'button');
  thumbnailContainer.setAttribute('tabindex', '0');
  thumbnailContainer.setAttribute('aria-label', `Play video: ${videoTitle}`);

  if (pictureElement) {
    // Reuse existing picture tag
    thumbnailContainer.appendChild(pictureElement);
  } else {
    // Create YouTube default thumbnail
    const thumbnail = document.createElement('img');
    // Try high quality first, fallback to standard
    thumbnail.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    thumbnail.alt = `Thumbnail for ${videoTitle}`;
    thumbnail.onerror = () => {
      thumbnail.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    };
    thumbnail.classList.add('youtube-video-thumbnail');
    thumbnailContainer.appendChild(thumbnail);
  }

  // Add play button
  const playButton = createPlayButtonSVG();
  thumbnailContainer.appendChild(playButton);

  videoContainer.appendChild(thumbnailContainer);
  block.appendChild(videoContainer);

  // Function to load the iframe
  const loadVideo = () => {
    if (videoContainer.querySelector('iframe')) return; // Already loaded
    const iframe = createYouTubeIframe(videoId, videoTitle);
    videoContainer.innerHTML = ''; // Clear thumbnail and button
    videoContainer.appendChild(iframe);
    videoContainer.classList.add('video-loaded');
  };

  // Add event listeners
  thumbnailContainer.addEventListener('click', loadVideo);
  thumbnailContainer.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      loadVideo();
    }
  });
}