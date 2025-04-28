export default function decorate(block) {
  const picture = block.querySelector('picture');
  // Select the second direct child div's first child div for content
  const contentWrapper = block.querySelector(':scope > div:nth-of-type(2) > div');

  if (!contentWrapper) {
    // eslint-disable-next-line no-console
    console.error('Teaser block expects a second child div for content.', block);
    block.style.display = 'none'; // Hide improperly structured block
    return;
  }

  const headline = contentWrapper.querySelector('h2');
  const paragraphs = Array.from(contentWrapper.querySelectorAll('p'));

  // Find the paragraph containing the link
  const linkPara = paragraphs.find((p) => p.querySelector('a'));
  // Assume the first paragraph without a link is the body text
  const bodyPara = paragraphs.find((p) => !p.querySelector('a'));
  const link = linkPara ? linkPara.querySelector('a') : null;

  if (!picture) {
    // eslint-disable-next-line no-console
    console.warn('Teaser block is missing a picture element.', block);
    // Allow rendering without image, but structure might need adjustment
  }

  if (!headline || !bodyPara || !link) {
    // eslint-disable-next-line no-console
    console.error('Teaser block is missing headline, body text, or link.', block);
    block.style.display = 'none'; // Hide improperly structured block
    return;
  }

  const linkUrl = link.href;
  const headlineText = headline.textContent?.trim() || 'Teaser link';

  // Create the main wrapper anchor
  const teaserLinkWrapper = document.createElement('a');
  teaserLinkWrapper.href = linkUrl;
  teaserLinkWrapper.classList.add('teaser-link-wrapper');
  teaserLinkWrapper.setAttribute('aria-label', headlineText); // Accessibility

  // Create image container
  const imageDiv = document.createElement('div');
  imageDiv.classList.add('teaser-image');
  if (picture) {
    imageDiv.append(picture); // Move existing picture tag
  }

  // Create content container
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('teaser-content');

  // Add classes and move headline and body
  headline.classList.add('teaser-headline');
  bodyPara.classList.add('teaser-body');
  contentDiv.append(headline);
  contentDiv.append(bodyPara);

  // Create CTA
  const cta = document.createElement('div');
  cta.classList.add('teaser-cta');
  cta.textContent = 'Mehr erfahren'; // Set CTA text
  contentDiv.append(cta);

  // Assemble the teaser link wrapper
  teaserLinkWrapper.append(imageDiv);
  teaserLinkWrapper.append(contentDiv);

  // Replace block content with the new structure
  block.innerHTML = '';
  block.append(teaserLinkWrapper);
}