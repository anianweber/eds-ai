export default function decorate(block) {
  // Find key elements based on structure
  const pictureDiv = block.querySelector(':scope > div:first-child');
  const contentDiv = block.querySelector(':scope > div:nth-child(2)');
  const picture = pictureDiv?.querySelector('picture');
  const heading = contentDiv?.querySelector('h2, h3, h4, h5, h6'); // Allow different heading levels

  // Find the link paragraph (assuming it's the last paragraph containing a link)
  const allParagraphs = Array.from(contentDiv?.querySelectorAll('p') || []);
  const linkParagraph = allParagraphs.findLast(p => p.querySelector('a'));
  const link = linkParagraph?.querySelector('a');

  // Identify body paragraphs: those between heading and link paragraph
  const bodyElements = [];
  if (heading) {
    let currentElement = heading.nextElementSibling;
    while (currentElement && currentElement !== linkParagraph) {
      // Include paragraph elements as body text
      if (currentElement.tagName === 'P') {
          bodyElements.push(currentElement);
      }
      // Stop if we encounter another heading or unexpected element before the link paragraph
      // else if (currentElement.tagName.match(/^H[2-6]$/)) {
      //    break;
      // }
      currentElement = currentElement.nextElementSibling;
    }
  }

  // Basic validation: Ensure essential elements are present
  if (!picture || !heading || !link) {
    // eslint-disable-next-line no-console
    console.warn('Teaser block is missing required elements (picture, heading, or link paragraph with link). Structure: [pic_div] > [content_div > (h*, p*, p>a)]', block);
    block.innerHTML = ''; // Clear block if essential parts are missing
    block.classList.add('teaser-invalid'); // Add class to indicate failure
    return;
  }

  // Create the main wrapper link element
  const wrapperLink = document.createElement('a');
  wrapperLink.href = link.href;
  wrapperLink.classList.add('teaser-link');
  // Use heading text for accessibility label
  wrapperLink.setAttribute('aria-label', heading.textContent?.trim() || 'Teaser link');

  // Create container for the image
  const imageContainer = document.createElement('div');
  imageContainer.classList.add('teaser-image');
  imageContainer.append(picture); // Append the existing picture element

  // Create container for the text content
  const textContentContainer = document.createElement('div');
  textContentContainer.classList.add('teaser-content');

  // Add class to heading and append it
  heading.classList.add('teaser-headline');
  textContentContainer.append(heading);

  // Create container for body text if paragraphs exist
  if (bodyElements.length > 0) {
    const bodyContainer = document.createElement('div');
    bodyContainer.classList.add('teaser-body');
    bodyElements.forEach((p) => bodyContainer.append(p)); // Append existing p elements
    textContentContainer.append(bodyContainer);
  }

  // Create the CTA element
  const ctaElement = document.createElement('div'); // Use div for styling flexibility
  ctaElement.classList.add('teaser-cta');
  ctaElement.textContent = 'Mehr erfahren'; // Set fixed CTA text as requested
  textContentContainer.append(ctaElement);

  // Assemble the final structure within the wrapper link
  wrapperLink.append(imageContainer);
  wrapperLink.append(textContentContainer);

  // Clear the original block content
  block.innerHTML = '';
  // Append the new structured content
  block.append(wrapperLink);
}
