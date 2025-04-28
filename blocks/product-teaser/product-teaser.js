/**
 * Creates an element with the given tag name and classes.
 * @param {string} tagName The tag name for the element.
 * @param {string|string[]} [classes] The classes to add.
 * @param {object} [attributes] Key-value pairs of attributes.
 * @param {string|Node} [innerHTML] The content to set.
 * @returns {HTMLElement} The created element.
 */
function createElement(tagName, classes, attributes, innerHTML) {
  const el = document.createElement(tagName);
  if (classes) {
    const classArray = Array.isArray(classes) ? classes : [classes];
    el.classList.add(...classArray.filter(Boolean));
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        el.setAttribute(key, val);
      }
    });
  }
  if (innerHTML) {
    if (innerHTML instanceof Node) {
      el.append(innerHTML);
    } else {
      el.innerHTML = innerHTML;
    }
  }
  return el;
}

/**
 * Truncates text to a specified length.
 * @param {string} text The text to truncate.
 * @param {number} limit The character limit.
 * @returns {string} The truncated text.
 */
function truncateText(text, limit = 60) {
  if (!text || text.length <= limit) {
    return text;
  }
  return `${text.substring(0, limit).trim()}...`;
}

/**
 * Decorates the product teaser block.
 * @param {Element} block The product teaser block element
 */
export default function decorate(block) {
  const productItems = block.querySelectorAll(':scope > div');
  block.innerHTML = ''; // Clear the initial content

  productItems.forEach((productData) => {
    const data = Array.from(productData.querySelectorAll(':scope > div')).map((div) => div.innerHTML.trim());
    // Order based mapping (adjust indices if HTML structure differs):
    const pictureContent = productData.querySelector('div:nth-child(1)'); // Keep <picture> tag
    const title = data[1];
    const description = data[2];
    const actionBannerText = data[3];
    const energyLabelClass = data[4];
    const energyLabelLink = data[5];
    const availabilityText = data[6];
    const grossPrice = data[7];
    const discountText = data[8];
    const strikethroughPrice = data[9];
    const priceComposition = data[10];
    const pdpLink = data[11];

    const item = createElement('div', 'product-teaser-item');
    item.dataset.pdpLink = pdpLink; // Store link for potential later use

    // --- Action Banner (Optional) ---
    if (actionBannerText) {
      const actionBanner = createElement('div', 'action-banner', null, actionBannerText);
      item.appendChild(actionBanner);
    }

    // --- Image Section ---
    const imageWrapper = createElement('div', 'product-image-wrapper');
    const pdpLinkElement = createElement('a', 'product-pdp-link', { href: pdpLink, 'aria-label': `View details for ${title}` });

    if (pictureContent) {
      const picture = pictureContent.querySelector('picture');
      if (picture) {
        picture.querySelector('img')?.setAttribute('alt', title || 'Product Image');
        pdpLinkElement.appendChild(picture);
      }
    }
    imageWrapper.appendChild(pdpLinkElement);

    // Wishlist/Share Icons (Placeholder - add actual icons/buttons as needed)
    const actions = createElement('div', 'product-actions');
    actions.innerHTML = `
      <button class="action-wishlist" aria-label="Add to wishlist">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      </button>
      <button class="action-share" aria-label="Share product">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
      </button>
    `;
    imageWrapper.appendChild(actions);

    // "To Product" Button (Desktop Hover)
    const toProductButton = createElement('a', ['button', 'to-product-button'], { href: pdpLink }, 'To Product');
    imageWrapper.appendChild(toProductButton);

    item.appendChild(imageWrapper);

    // --- Details Section ---
    const detailsWrapper = createElement('div', 'product-details');

    const titleEl = createElement('h3', 'product-title');
    const titleLink = createElement('a', null, { href: pdpLink }, title);
    titleEl.appendChild(titleLink);
    detailsWrapper.appendChild(titleEl);

    if (description) {
        const descEl = createElement('p', 'product-description');
        const descLink = createElement('a', null, { href: pdpLink });
        // Apply character limit (e.g., 60 chars)
        descLink.textContent = truncateText(description, 60);
        descEl.appendChild(descLink);
        detailsWrapper.appendChild(descEl);
    }

    // --- Ratings (Placeholder) ---
    // Add actual rating logic/component if available
    const ratingPlaceholder = createElement('div', 'product-rating', null, '★★★★☆ (31.345)'); // Example
    detailsWrapper.appendChild(ratingPlaceholder);

    // --- Energy Label (Optional) ---
    if (energyLabelClass && energyLabelLink) {
      const energyLabelWrapper = createElement('div', 'energy-label-wrapper');
      const energyLabel = createElement('span', ['energy-label', `energy-label-${energyLabelClass.toLowerCase()}`], null, energyLabelClass);
      const energyLink = createElement('a', 'energy-datasheet-link', { href: energyLabelLink, target: '_blank', rel: 'noopener noreferrer' }, 'Produktdatenblatt');
      energyLabelWrapper.appendChild(energyLabel);
      energyLabelWrapper.appendChild(energyLink);
      detailsWrapper.appendChild(energyLabelWrapper);
    }

    // --- Availability ---
    if (availabilityText) {
      const availabilityEl = createElement('div', 'availability');
      const isAvailable = availabilityText.toLowerCase().includes('verfügbar'); // Basic check
      availabilityEl.classList.add(isAvailable ? 'is-available' : 'is-unavailable');
      // Simple checkmark SVG
      const checkSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>';
      availabilityEl.innerHTML = `${isAvailable ? checkSvg : ''} ${availabilityText}`;
      detailsWrapper.appendChild(availabilityEl);
    }

    // --- Price Section ---
    const priceWrapper = createElement('div', 'price-info');
    const priceMainLine = createElement('div', 'price-main');

    if (grossPrice) {
      const grossPriceEl = createElement('span', 'price-gross', null, grossPrice);
      priceMainLine.appendChild(grossPriceEl);
    }

    if (discountText) {
      const discountBadge = createElement('span', 'discount-badge', null, discountText);
      priceMainLine.appendChild(discountBadge);
    }
    priceWrapper.appendChild(priceMainLine);

    if (strikethroughPrice) {
      const strikethroughPriceEl = createElement('span', 'price-strikethrough', null, strikethroughPrice);
      priceWrapper.appendChild(strikethroughPriceEl);
    }

    if (priceComposition) {
      const priceCompositionEl = createElement('p', 'price-composition', null, priceComposition);
      priceWrapper.appendChild(priceCompositionEl);
    }

    detailsWrapper.appendChild(priceWrapper);
    item.appendChild(detailsWrapper);

    // --- Compare Section ---
    const compareWrapper = createElement('div', 'compare-section');
    const compareId = `compare-${Math.random().toString(36).substring(2, 9)}`;
    const compareCheckbox = createElement('input', 'compare-checkbox', { type: 'checkbox', id: compareId });
    const compareLabel = createElement('label', 'compare-label', { for: compareId }, ' Produkt vergleichen');
    compareWrapper.appendChild(compareCheckbox);
    compareWrapper.appendChild(compareLabel);
    item.appendChild(compareWrapper);

    // Append the fully constructed item to the block
    block.appendChild(item);
  });

  // Add class to block for grid styling
  block.classList.add('product-teaser-grid');
}
