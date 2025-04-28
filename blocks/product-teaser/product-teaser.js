import { fetchPlaceholders } from '/scripts/aem.js';
import { getProductData } from '/scripts/commerce.js'; // Assuming a helper script exists

// Function to safely create elements and add classes
function createElement(tag, classNames, attributes = {}, textContent = '') {
  const el = document.createElement(tag);
  if (classNames) {
    const classes = Array.isArray(classNames) ? classNames : [classNames];
    el.classList.add(...classes);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
  if (textContent) {
    el.textContent = textContent;
  }
  return el;
}

// Function to truncate text
function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return `${text.substr(0, text.lastIndexOf(' ', maxLength))}...`;
}

export default async function decorate(block) {
  // Get SKU from the initial simple structure
  const skuElement = block.querySelector(':scope > div > div');
  if (!skuElement) {
    // eslint-disable-next-line no-console
    console.warn('Product Teaser block: SKU element not found. Block:', block);
    block.innerHTML = ''; // Clear block if SKU is missing
    return;
  }
  const skus = skuElement.textContent.split(',').map((s) => s.trim()).filter(Boolean);
  if (skus.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('Product Teaser block: No valid SKUs found. Block:', block);
    block.innerHTML = ''; // Clear block if SKU is missing
    return;
  }

  // For simplicity, we use the first SKU. Adapt if multiple SKUs need specific handling.
  const sku = skus[0];

  // Fetch product data (replace with actual implementation)
  const product = await getProductData(sku);

  // Fetch placeholders for labels, etc.
  const placeholders = await fetchPlaceholders();

  if (!product) {
    // eslint-disable-next-line no-console
    console.warn(`Product Teaser block: Product data not found for SKU: ${sku}. Block:`, block);
    block.innerHTML = ''; // Clear block if product data fails
    return;
  }

  // Define description character limit
  const descriptionMaxLength = parseInt(placeholders.productTeaserDescriptionMaxLength || '80', 10);

  // Clear existing block content before rebuilding
  block.innerHTML = '';
  block.classList.add('product-teaser-item'); // Add a class for the item wrapper

  // --- Create Structure ---

  // Optional Action Banner
  if (product.actionBanner) {
    const banner = createElement('div', 'product-teaser-action-banner', {}, product.actionBanner);
    block.appendChild(banner);
  }

  // Image Wrapper (will contain image and hover button)
  const imageWrapper = createElement('div', 'product-teaser-image-wrapper');
  block.appendChild(imageWrapper);

  // Main Product Link (wraps image and content)
  const productLink = createElement('a', 'product-teaser-link', { href: product.pdpUrl || '#', 'aria-label': `View product ${product.title}` });
  imageWrapper.appendChild(productLink);

  // Product Image
  // Check if product.image is a <picture> tag string or an object/URL
  if (product.image) {
    if (typeof product.image === 'string' && product.image.startsWith('<picture>')) {
      // If it's a picture tag string, parse it
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = product.image;
      const picture = tempDiv.querySelector('picture');
      if (picture) {
        picture.classList.add('product-teaser-image');
        // Ensure img has alt text
        const img = picture.querySelector('img');
        if (img && !img.getAttribute('alt')) {
          img.setAttribute('alt', product.title || 'Product Image');
        }
        productLink.appendChild(picture);
      }
    } else {
      // Assume it's a URL or needs simple img tag creation
      const img = createElement('img', 'product-teaser-image', { src: product.image, alt: product.title || 'Product Image' });
      productLink.appendChild(img);
    }
  } else {
    // Placeholder if no image
    const placeholder = createElement('div', ['product-teaser-image', 'product-teaser-image-placeholder']);
    placeholder.textContent = placeholders.productTeaserImagePlaceholder || 'No Image';
    productLink.appendChild(placeholder);
  }

  // Wishlist & Share Buttons (Example - adapt as needed)
  const topButtons = createElement('div', 'product-teaser-top-buttons');
  const wishlistButton = createElement('button', ['product-teaser-button', 'product-teaser-wishlist-button'], { type: 'button', 'aria-label': 'Add to wishlist' });
  wishlistButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'; // Simple heart icon
  const shareButton = createElement('button', ['product-teaser-button', 'product-teaser-share-button'], { type: 'button', 'aria-label': 'Share product' });
  shareButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>'; // Simple share icon
  topButtons.appendChild(wishlistButton);
  topButtons.appendChild(shareButton);
  imageWrapper.appendChild(topButtons);

  // Hover Button ("To Product") - Desktop Only
  const hoverButton = createElement('a', ['product-teaser-button', 'product-teaser-hover-button'], { href: product.pdpUrl || '#', 'aria-label': `View product ${product.title}` }, placeholders.productTeaserToProduct || 'To Product');
  imageWrapper.appendChild(hoverButton);

  // Content Area
  const contentWrapper = createElement('div', 'product-teaser-content');
  block.appendChild(contentWrapper);

  // Product Title
  const title = createElement('h3', 'product-teaser-title');
  const titleLink = createElement('a', 'product-teaser-title-link', { href: product.pdpUrl || '#' });
  titleLink.textContent = product.title || 'Product Title';
  title.appendChild(titleLink);
  contentWrapper.appendChild(title);

  // Product Description
  if (product.description) {
    const description = createElement('p', 'product-teaser-description');
    description.textContent = truncateText(product.description, descriptionMaxLength);
    // Link wrapper for description
    const descriptionLink = createElement('a', 'product-teaser-link', { href: product.pdpUrl || '#', 'aria-hidden': 'true', tabIndex: '-1' });
    descriptionLink.appendChild(description);
    contentWrapper.appendChild(descriptionLink);
  }

  // Rating (Example - adapt if rating data exists)
  if (product.rating && product.rating.value) {
    const ratingWrapper = createElement('div', 'product-teaser-rating');
    // Simple star display (replace with actual rating component if available)
    const stars = '★'.repeat(Math.round(product.rating.value)) + '☆'.repeat(5 - Math.round(product.rating.value));
    const ratingValue = createElement('span', 'rating-stars', { 'aria-label': `Rating: ${product.rating.value} out of 5 stars` }, stars);
    const ratingCount = createElement('span', 'rating-count', {}, ` (${product.rating.count || 0})`);
    ratingWrapper.appendChild(ratingValue);
    ratingWrapper.appendChild(ratingCount);
    contentWrapper.appendChild(ratingWrapper);
  }

  // Energy Label (Optional)
  if (product.energyLabel && product.energyLabel.class && product.energyLabel.datasheetUrl) {
    const energyWrapper = createElement('div', 'product-teaser-energy');
    const energyLabel = createElement('span', ['energy-label', `energy-label-${product.energyLabel.class.toLowerCase()}`], {}, product.energyLabel.class);
    const energyLink = createElement('a', 'energy-datasheet-link', { href: product.energyLabel.datasheetUrl, target: '_blank', rel: 'noopener noreferrer' }, placeholders.productTeaserEnergyLink || 'Product data sheet');
    energyWrapper.appendChild(energyLabel);
    energyWrapper.appendChild(energyLink);
    contentWrapper.appendChild(energyWrapper);
  }

  // Availability Badge
  if (product.availability) {
    const availability = createElement('div', ['product-teaser-availability', `product-teaser-availability-${product.availability.status || 'unknown'}`]);
    // Simple check icon (replace with SVG if needed)
    if (product.availability.status === 'in-stock') {
       availability.innerHTML = `<span class="icon icon-checkmark"></span> ${product.availability.text || placeholders.productTeaserAvailable || 'Available'}`;
    } else {
       availability.innerHTML = `<span class="icon icon-unavailable"></span> ${product.availability.text || placeholders.productTeaserUnavailable || 'Unavailable'}`;
    }
    contentWrapper.appendChild(availability);
  }

  // Pricing Area
  const pricingWrapper = createElement('div', 'product-teaser-pricing');
  block.appendChild(pricingWrapper);

  const priceLine = createElement('div', 'product-teaser-price-line');
  pricingWrapper.appendChild(priceLine);

  // Gross Product Price
  if (product.price && product.price.gross) {
    const price = createElement('span', 'product-teaser-price-gross', {}, product.price.gross);
    priceLine.appendChild(price);
  }

  // Discount Badge (Optional)
  if (product.price && product.price.discountBadge) {
    const discountBadge = createElement('span', 'product-teaser-discount-badge', {}, product.price.discountBadge);
    priceLine.appendChild(discountBadge);
  }

  // Strikethrough Price (Optional)
  if (product.price && product.price.strikethrough) {
    const strikethroughPrice = createElement('span', 'product-teaser-price-strikethrough', {}, product.price.strikethrough);
    pricingWrapper.appendChild(strikethroughPrice);
  }

  // Price Composition Description
  if (product.price && product.price.composition) {
    const composition = createElement('p', 'product-teaser-price-composition', {}, product.price.composition);
    pricingWrapper.appendChild(composition);
  }

  // Actions Area (Compare Button)
  const actionsWrapper = createElement('div', 'product-teaser-actions');
  block.appendChild(actionsWrapper);

  // Product Comparison Button
  const compareId = `compare-${sku}-${Math.random().toString(36).substr(2, 9)}`; // Unique ID
  const compareWrapper = createElement('div', 'product-teaser-compare');
  const compareCheckbox = createElement('input', 'product-teaser-compare-checkbox', { type: 'checkbox', id: compareId, value: sku });
  const compareLabel = createElement('label', 'product-teaser-compare-label', { for: compareId }, placeholders.productTeaserCompare || 'Compare Product');
  compareWrapper.appendChild(compareCheckbox);
  compareWrapper.appendChild(compareLabel);
  actionsWrapper.appendChild(compareWrapper);

  // Add event listeners if needed (e.g., for compare checkbox)
  compareCheckbox.addEventListener('change', (event) => {
    // Handle compare logic - potentially emit an event or call a global function
    // eslint-disable-next-line no-console
    console.log(`Compare checkbox for ${sku} changed:`, event.target.checked);
    // Example: dispatchEvent(new CustomEvent('compare:change', { detail: { sku: sku, checked: event.target.checked }}));
  });

  // Add wishlist/share listeners if needed
  wishlistButton.addEventListener('click', () => {
    // eslint-disable-next-line no-console
    console.log(`Wishlist clicked for ${sku}`);
    // Add wishlist logic here
  });
  shareButton.addEventListener('click', () => {
    // eslint-disable-next-line no-console
    console.log(`Share clicked for ${sku}`);
    // Add share logic here (e.g., navigator.share)
  });
}
