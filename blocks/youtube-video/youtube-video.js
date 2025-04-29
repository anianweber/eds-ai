/**
 * Extracts the YouTube video ID from a given URL.
 * @param {string} url The YouTube URL.
 * @returns {string|null} The video ID or null if not found.
 */
function extractVideoId(url) {
  if (!url) return null;
  let videoId = null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v');
      if (!videoId && urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1]?.split(/[?#]/)[0];
      }
      if (!videoId && urlObj.pathname.startsWith('/v/')) {
        videoId = urlObj.pathname.split('/v/')[1]?.split(/[?#]/)[0];
      }
      // Add more specific checks if needed
    }

    // Validate ID format (11 characters, alphanumeric plus -_)
    if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return videoId;
    } else {
      videoId = null; // Reset if validation failed
    }

  } catch (e) {
    // Fallback for cases where URL parsing fails or for non-standard URLs
    console.warn(`Could not parse URL ${url}, attempting regex fallback.`, e);
  }

  // Regex Fallback
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
        // Validate ID format again
        if (/^[a-zA-Z0-9_-]{11}$/.test(match[1])) {
            return match[1];
        }
    }
  }

  console.warn(`YouTube Video ID not found or invalid in URL: ${url}`);
  return null;
}

/**
 * Creates a default thumbnail structure using YouTube's preview images.
 * @param {string} videoId The YouTube video ID.
 * @returns {HTMLElement} The picture element containing the thumbnail.
 */
function createDefaultThumbnail(videoId) {
  const picture = document.createElement('picture');
  const webpSrc = `https://i.ytimg.com/vi_webp/${videoId}/hqdefault.webp`;
  const jpgSrc = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  picture.innerHTML = `
    <source type="image/webp" srcset="${webpSrc}">
    <source type="image/jpeg" srcset="${jpgSrc}">
    <img loading="lazy" alt="Video Thumbnail" src="${jpgSrc}" width="480" height="360">
  `;
  return picture;
}

/**
 * Loads the YouTube iframe player.
 * @param {HTMLElement} block The block element.
 * @param {string} videoId The YouTube video ID.
 */
function loadVideo(block, videoId) {
  const videoContainer = block.querySelector('.youtube-video-container');
  if (!videoContainer || videoContainer.querySelector('iframe')) {
    // Video already loaded or container not found
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
  iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`);
  iframe.setAttribute('title', 'YouTube video player'); // Accessibility
  iframe.classList.add('youtube-video-iframe');

  // Remove thumbnail and play button, add iframe
  videoContainer.innerHTML = '';
  videoContainer.appendChild(iframe);
}

/**
 * Decorates the YouTube video block.
 * @param {HTMLElement} block The block element to decorate.
 */
export default function decorate(block) {
  let pictureElement = null;
  let videoUrl = '';

  // Extract picture and URL from the block content
  block.querySelectorAll(':scope > div').forEach((div) => {
    const picture = div.querySelector('picture');
    const link = div.querySelector('a[href*="youtube.com"], a[href*="youtu.be"]');
    const textContent = div.textContent.trim();

    if (picture) {
      pictureElement = picture;
    } else if (link && (link.href.includes('youtube.com') || link.href.includes('youtu.be'))) {
       // Prefer link href if it exists
       videoUrl = link.href;
    } else if (textContent.includes('youtube.com') || textContent.includes('youtu.be')) {
      // Fallback to text content if it looks like a YouTube URL
      videoUrl = textContent;
    }
  });

  const videoId = extractVideoId(videoUrl);

  if (!videoId) {
    console.warn('YouTube block: Missing valid YouTube URL or Video ID.', block);
    block.innerHTML = ''; // Clear block if no valid video can be loaded
    block.style.display = 'none';
    return;
  }

  // Prepare thumbnail
  if (!pictureElement) {
    pictureElement = createDefaultThumbnail(videoId);
  }

  // Clear original block content and build new structure
  block.innerHTML = '';

  const videoContainer = document.createElement('div');
  videoContainer.classList.add('youtube-video-container');

  // Add thumbnail (picture element)
  videoContainer.append(pictureElement);

  // Add play button
  const playButton = document.createElement('button');
  playButton.classList.add('youtube-video-play-button');
  playButton.setAttribute('type', 'button'); // Explicitly set type for accessibility
  playButton.setAttribute('aria-label', 'Play video');
  playButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false" role="img" aria-hidden="true">
      <path d="M8 5v14l11-7z"/>
      <path d="M0 0h24v24H0z" fill="none"/>
    </svg>`;
  videoContainer.append(playButton);

  block.append(videoContainer);

  // Add click listener to load the video
  playButton.addEventListener('click', () => loadVideo(block, videoId));
  // Optional: Allow clicking anywhere on the thumbnail to play
  // pictureElement.addEventListener('click', () => loadVideo(block, videoId));
}
