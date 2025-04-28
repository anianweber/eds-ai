export default function decorate(block) {
  const wrapper = document.createElement('a');
  wrapper.classList.add('teaser-link');

  // Find essential elements
  const picture = block.querySelector('picture');
  const h2 = block.querySelector('h2');
  const paragraphs = block.querySelectorAll('div:last-of-type > div > p'); // Get all paragraphs in the second div
  const linkElement = block.querySelector('a');

  if (!picture || !h2 || paragraphs.length === 0 || !linkElement) {
    // eslint-disable-next-line no-console
    console.warn('Teaser block is missing essential elements:', block);
    return; // Exit if structure is not as expected
  }

  const linkHref = linkElement.href;
  const linkParentParagraph = linkElement.closest('p');

  // Set link properties
  wrapper.href = linkHref;
  // Use headline text for accessibility label, strip potential IDs if present
  wrapper.setAttribute('aria-label', h2.textContent.trim());

  // Create content structure inside the link
  const imageDiv = document.createElement('div');
  imageDiv.classList.add('teaser-image');
  imageDiv.append(picture);

  const contentDiv = document.createElement('div');
  contentDiv.classList.add('teaser-content');

  // Headline
  const headlineDiv = document.createElement('div');
  headlineDiv.classList.add('teaser-headline');
  headlineDiv.append(h2);
  contentDiv.append(headlineDiv);

  // Body Text
  const bodyDiv = document.createElement('div');
  bodyDiv.classList.add('teaser-body');
  paragraphs.forEach((p) => {
    if (p !== linkParentParagraph) { // Append only non-link paragraphs
      bodyDiv.append(p);
    }
  });
  contentDiv.append(bodyDiv);

  // CTA
  const ctaDiv = document.createElement('div');
  ctaDiv.classList.add('teaser-cta');
  ctaDiv.textContent = 'Mehr erfahren'; // Set CTA text
  contentDiv.append(ctaDiv);

  // Assemble the wrapper link
  wrapper.append(imageDiv);
  wrapper.append(contentDiv);

  // Replace block content with the new structure
  block.innerHTML = '';
  block.append(wrapper);
}