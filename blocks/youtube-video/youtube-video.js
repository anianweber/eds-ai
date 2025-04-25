export default function decorate(block) {
  const placeholder = block.querySelector('picture');
  const linkDiv = block.querySelector('div:last-of-type > div');
  const link = linkDiv?.textContent?.trim();

  if (!link) {
    // eslint-disable-next-line no-console
    console.warn('YouTube URL is missing or invalid for youtube-video block.');
    block.innerHTML = ''; // Clear block if no URL
    block.classList.add('invalid');
    return;
  }

  let videoId = '';
  try {
    const url = new URL(link);
    if (url.hostname === 'youtu.be') {
      videoId = url.pathname.substring(1);
    } else if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
      if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v');
      } else if (url.pathname.startsWith('/embed/')) {
        videoId = url.pathname.substring('/embed/'.length);
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Invalid URL format: ${link}`, e);
  }

  if (!videoId) {
    // eslint-disable-next-line no-console
    console.warn(`Could not extract YouTube Video ID from URL: ${link}`);
    block.innerHTML = ''; // Clear block if ID extraction failed
    block.classList.add('invalid');
    return;
  }

  const loadVideo = () => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`);
    iframe.setAttribute('title', 'Embedded YouTube video'); // Accessibility
    iframe.classList.add('youtube-iframe');

    const currentPlaceholder = block.querySelector('.video-placeholder');
    if (currentPlaceholder) {
      currentPlaceholder.replaceWith(iframe);
    } else {
      // Fallback if placeholder was not created or already removed
      block.innerHTML = '';
      block.appendChild(iframe);
    }
  };

  // Clear existing block content initially before rebuilding
  block.innerHTML = '';

  if (placeholder) {
    const placeholderContainer = document.createElement('div');
    placeholderContainer.classList.add('video-placeholder');
    placeholderContainer.style.cursor = 'pointer'; // Indicate clickable area

    // Move the original picture tag into the new container
    placeholderContainer.appendChild(placeholder);

    const playButton = document.createElement('button');
    playButton.classList.add('play-button');
    playButton.setAttribute('type', 'button');
    playButton.setAttribute('aria-label', 'Play video');
    // Simple inline SVG play icon for reduced dependencies
    playButton.innerHTML = `
      <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
        <circle cx="36" cy="36" r="34" fill="#000" fill-opacity="0.6"></circle>
        <path d="M52.356 34.471L30.117 21.435A2 2 0 0027 23.165v25.67a2 2 0 003.117 1.73l22.239-13.036a2 2 0 000-3.46z" fill="#fff"></path>
      </svg>
    `;
    placeholderContainer.appendChild(playButton);

    block.appendChild(placeholderContainer);

    // Add listener to the container for broader click area
    placeholderContainer.addEventListener('click', loadVideo);

  } else {
    // If no placeholder image is provided, load the video iframe directly
    loadVideo();
  }
}
