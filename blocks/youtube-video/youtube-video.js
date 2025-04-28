/**
 * Extracts the YouTube video ID from various URL formats.
 * @param {string} url The YouTube URL.
 * @returns {string|null} The video ID or null if not found.
 */
function getYoutubeVideoId(url) {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url);
    const { hostname, pathname, searchParams } = urlObj;

    if (hostname.includes('youtube.com')) {
      if (pathname.includes('/watch')) {
        videoId = searchParams.get('v');
      } else if (pathname.includes('/embed/')) {
        videoId = pathname.split('/embed/')[1].split('/')[0];
      } else if (pathname.includes('/shorts/')) {
        videoId = pathname.split('/shorts/')[1].split('/')[0];
      }
    } else if (hostname.includes('youtu.be')) {
      videoId = pathname.substring(1).split('/')[0];
    }

    // Basic check for valid ID format (optional)
    if (videoId && !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      // console.warn('Invalid YouTube video ID format:', videoId);
      return null;
    }
  } catch (e) {
    // console.error('Error parsing YouTube URL:', e);
    return null;
  }
  return videoId;
}

/**
 * Creates the play button SVG element.
 * @returns {SVGSVGElement} The SVG element for the play button.
 */
function createPlayButtonSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('aria-hidden', 'true'); // Hide decorative SVG from screen readers

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M8 5v14l11-7z'); // Simple play triangle
  svg.appendChild(path);

  return svg;
}

/**
 * Creates the YouTube iframe element.
 * @param {string} videoId The YouTube video ID.
 * @returns {HTMLIFrameElement} The iframe element.
 */
function createIframe(videoId) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'YouTube video player');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  iframe.setAttribute('allowfullscreen', '');
  // Use privacy-enhanced mode and autoplay
  iframe.setAttribute('src', `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`);
  iframe.setAttribute('loading', 'lazy'); // Lazy load the iframe itself
  return iframe;
}

/**
 * Decorates the youtube-video block.
 * @param {HTMLElement} block The block element.
 */
export default function decorate(block) {
  const pictureContainer = block.querySelector(':scope > div:first-child > div');
  const urlContainer = block.querySelector(':scope > div:nth-child(2) > div');

  if (!pictureContainer || !urlContainer) {
    // console.error('YouTube block: Missing picture or URL container.');
    block.innerHTML = ''; // Clear malformed block
    return;
  }

  const picture = pictureContainer.querySelector('picture');
  const url = urlContainer.textContent?.trim();
  const videoId = getYoutubeVideoId(url);

  if (!picture || !videoId) {
    // console.error('YouTube block: Missing picture or invalid/missing YouTube URL.');
    block.innerHTML = ''; // Clear malformed block
    return;
  }

  // Remove the URL container div
  urlContainer.parentElement.remove();

  // Create a wrapper for the thumbnail and play button
  const thumbnailWrapper = document.createElement('div');
  thumbnailWrapper.classList.add('youtube-video-thumbnail-wrapper');

  // Move the picture element into the wrapper
  thumbnailWrapper.appendChild(picture);

  // Create and add the play button
  const playButton = document.createElement('button');
  playButton.classList.add('youtube-video-play-button');
  playButton.setAttribute('type', 'button');
  playButton.setAttribute('aria-label', 'Play YouTube Video'); // Accessibility
  playButton.appendChild(createPlayButtonSvg());
  thumbnailWrapper.appendChild(playButton);

  // Replace the original picture container with the new wrapper
  pictureContainer.replaceWith(thumbnailWrapper);

  // Add click listener to load the iframe
  thumbnailWrapper.addEventListener('click', () => {
    const iframe = createIframe(videoId);
    thumbnailWrapper.replaceWith(iframe);
  }, { once: true }); // Ensure the listener runs only once

  // Add a class to the parent div for aspect ratio styling
  const container = block.querySelector(':scope > div:first-child');
  if (container) {
      container.classList.add('youtube-video-container');
  }
}
