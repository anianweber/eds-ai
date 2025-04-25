/**
 * Extracts the YouTube video ID from a given URL.
 * @param {string} url The YouTube URL.
 * @returns {string|null} The video ID or null if not found.
 */
function getYouTubeVideoId(url) {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url);
    const { hostname, pathname, searchParams } = urlObj;

    if (hostname.includes('youtube.com')) {
      if (pathname.includes('/watch')) {
        videoId = searchParams.get('v');
      } else if (pathname.includes('/embed/')) {
        videoId = pathname.split('/embed/')[1].split(/[?#]/)[0];
      } else if (pathname.includes('/live/')) {
        videoId = pathname.split('/live/')[1].split(/[?#]/)[0];
      }
    } else if (hostname.includes('youtu.be')) {
      videoId = pathname.substring(1).split(/[?#]/)[0];
    }
  } catch (e) {
    console.error('Error parsing YouTube URL:', e);
    // Fallback for simple cases or invalid URLs that might be just the ID
    if (url.length === 11 && !url.includes('.')) {
      videoId = url; // Assume it might be just the ID
    }
  }
  return videoId;
}

/**
 * Creates the YouTube iframe element.
 * @param {string} videoId The YouTube video ID.
 * @returns {HTMLIFrameElement} The iframe element.
 */
function createYouTubeIframe(videoId) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`);
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('title', 'YouTube video player'); // Accessibility
  iframe.classList.add('youtube-video-iframe');
  return iframe;
}

/**
 * Decorates the YouTube video block.
 * @param {HTMLElement} block The block element.
 */
export default function decorate(block) {
  const rows = Array.from(block.children);
  if (rows.length < 2) {
    console.warn('YouTube Video block requires at least two rows: thumbnail picture and URL.');
    block.innerHTML = ''; // Clear invalid block
    return;
  }

  const thumbnailDiv = rows[0]?.firstElementChild;
  const urlDiv = rows[1]?.firstElementChild;

  const picture = thumbnailDiv?.querySelector('picture');
  const url = urlDiv?.textContent.trim();
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    console.warn(`Invalid or missing YouTube URL: ${url}`);
    block.innerHTML = ''; // Clear invalid block
    return;
  }

  if (!picture) {
    console.warn('Missing thumbnail picture for YouTube Video block.');
    // Optionally, proceed without a thumbnail using YouTube's default?
    // For now, require a thumbnail as per requirements.
    block.innerHTML = ''; // Clear invalid block
    return;
  }

  // Keep existing picture tag but wrap it for styling and interaction
  const wrapper = document.createElement('div');
  wrapper.classList.add('youtube-video-wrapper');
  // Maintain aspect ratio 16:9 by default, can be overridden by CSS if needed
  wrapper.style.paddingBottom = '56.25%';

  // Keep the original picture element
  picture.classList.add('youtube-video-thumbnail');
  wrapper.append(picture);

  // Create and add play button overlay
  const playButton = document.createElement('button');
  playButton.classList.add('youtube-video-play-button');
  playButton.setAttribute('type', 'button');
  playButton.setAttribute('aria-label', 'Play video');
  wrapper.append(playButton);

  // Event listener to replace thumbnail with iframe on click
  const loadVideo = () => {
    const iframe = createYouTubeIframe(videoId);
    wrapper.innerHTML = ''; // Clear picture and button
    wrapper.append(iframe);
    wrapper.classList.add('youtube-video-loaded');
    wrapper.style.paddingBottom = ''; // Remove padding aspect ratio hack for iframe
  };

  wrapper.addEventListener('click', loadVideo, { once: true });
  // Also allow activation via Enter/Space for accessibility on the button
  playButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      loadVideo();
    }
  });

  // Clear the original block content and append the new structure
  block.innerHTML = '';
  block.append(wrapper);
}