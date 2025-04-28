const MAX_DESC_LENGTH = 80;

// Mock product data - replace with actual API call in a real scenario
const mockProductData = {
  'SKU-123': {
    pdpUrl: '/product/sku-123',
    imageUrl: '/media/media_1d6cf041a10b45a50110e6f7179e0da3237b07c8c.png',
    title: 'PAC 2010 SH',
    description: 'Lokales Klimagerät mit Heizfunktion und Luftfilter für angenehmes Raumklima.',
    rating: { score: 4, count: 31345 },
    energyLabel: { class: 'A', range: 'A+++ < D', dataSheetUrl: '/datasheet/sku-123.pdf' },
    availability: true,
    price: { current: 84.00, currency: '€', strikethrough: 119.00, discountPercentage: 30 },
    priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
    promotion: '-25% Code: SUMMER',
    compareEnabled: true,
  },
  'SKU-124': {
    pdpUrl: '/product/sku-124',
    imageUrl: '/media/media_1d6cf041a10b45a50110e6f7179e0da3237b07c8c.png',
    title: 'PAC 2010 SH (Variant)',
    description: 'Effizientes lokales Klimagerät mit Heizfunktion und verbessertem Luftfilter.',
    rating: { score: 4, count: 31345 },
    energyLabel: { class: 'A', range: 'A+++ < D', dataSheetUrl: '/datasheet/sku-124.pdf' },
    availability: true,
    price: { current: 84.00, currency: '€', strikethrough: 119.00, discountPercentage: 30 },
    priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
    promotion: '-25% Code: SUMMER',
    compareEnabled: true,
  },
  'SKU-218': {
    pdpUrl: '/product/sku-218',
    imageUrl: '/media/media_1d6cf041a10b45a50110e6f7179e0da3237b07c8c.png',
    title: 'PAC 3000 X', // Different title
    description: 'Leistungsstarkes Klimagerät für größere Räume, kühlt und entfeuchtet.',
    rating: { score: 4, count: 31345 }, // Same rating for demo
    energyLabel: null, // No energy label
    availability: true,
    price: { current: 84.00, currency: '€' }, // No discount
    priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
    promotion: null, // No promotion
    compareEnabled: true,
  },
  'SKU-14894': {
    pdpUrl: '/product/sku-14894',
    imageUrl: '/media/media_1d6cf041a10b45a50110e6f7179e0da3237b07c8c.png',
    title: 'PAC 4000 Pro',
    description: 'Professionelles Klimagerät mit hoher Kühlleistung und Smart-Funktionen.',
    rating: { score: 4, count: 31345 }, // Same rating for demo
    energyLabel: { class: 'B', range: 'A+++ < D', dataSheetUrl: '/datasheet/sku-14894.pdf' },
    availability: false, // Not available
    price: { current: 84.00, currency: '€', strikethrough: 119.00 }, // No discount %
    priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
    promotion: null,
    compareEnabled: true,
  },
  // Add default data for SKUs not explicitly defined
  default: {
    pdpUrl: '/product/default',
    imageUrl: 'https://via.placeholder.com/250x250.png?text=Placeholder',
    title: 'Default Product Title',
    description: 'This is a default description for products not found in the mock data.',
    rating: null,
    energyLabel: null,
    availability: true,
    price: { current: 99.99, currency: '€' },
    priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
    promotion: null,
    compareEnabled: false,
  },
};

/**
 * Fetches product data (mock implementation).
 * @param {string} sku - The product SKU.
 * @returns {object} Product data object.
 */
function fetchProductData(sku) {
  // In a real scenario, this would involve an asynchronous fetch call
  // For example: return await fetch(`/api/products/${sku}`).then(res => res.json());
  return mockProductData[sku] || { ...mockProductData.default, title: `Product ${sku}`, pdpUrl: `/product/${sku}` };
}

/**
 * Creates the HTML structure for a single product teaser item.
 * @param {object} product - The product data object.
 * @returns {HTMLElement} The product teaser item element.
 */
function createProductTeaserElement(product) {
  const item = document.createElement('div');
  item.className = 'product-teaser-item';

  // --- Promotion Banner (Optional) ---
  if (product.promotion) {
    const promotionBanner = document.createElement('div');
    promotionBanner.className = 'promotion-banner';
    promotionBanner.textContent = product.promotion;
    item.append(promotionBanner);
  }

  // --- Clickable Area (Image + Title + Description) ---
  const clickableLink = document.createElement('a');
  clickableLink.href = product.pdpUrl;
  clickableLink.ariaLabel = `View details for ${product.title}`;
  clickableLink.className = 'clickable-area';

  // --- Image Wrapper ---
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'image-wrapper';
  // Note: We create a simple img tag here. If Picture tags are needed,
  // the fetchProductData should provide picture sources and this part needs adjustment.
  const img = document.createElement('img');
  img.src = product.imageUrl;
  img.alt = product.title; // Alt text for accessibility
  img.loading = 'lazy'; // Lazy load images
  imageWrapper.append(img);
  clickableLink.append(imageWrapper);

  // --- Content Wrapper (within clickable area) ---
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'content-wrapper';

  const title = document.createElement('h3');
  title.className = 'title';
  title.textContent = product.title;
  contentWrapper.append(title);

  const description = document.createElement('p');
  description.className = 'description';
  // Truncate description if it exceeds the maximum length
  description.textContent = product.description.length > MAX_DESC_LENGTH
    ? `${product.description.substring(0, MAX_DESC_LENGTH)}…`
    : product.description;
  contentWrapper.append(description);

  clickableLink.append(contentWrapper);
  item.append(clickableLink); // Append the main clickable link

  // --- Ratings (Optional) ---
  if (product.rating) {
    const ratingWrapper = document.createElement('div');
    ratingWrapper.className = 'rating-wrapper';
    // Basic star display (could be enhanced with icons/SVGs)
    const stars = '★'.repeat(product.rating.score) + '☆'.repeat(5 - product.rating.score);
    ratingWrapper.innerHTML = `<span class="stars">${stars}</span> <span class="count">(${product.rating.count})</span>`;
    contentWrapper.append(ratingWrapper); // Append ratings to content under description
  }

  // --- Energy Label (Optional) ---
  if (product.energyLabel) {
    const energyWrapper = document.createElement('div');
    energyWrapper.className = 'energy-label-wrapper';

    const energyLabel = document.createElement('span');
    energyLabel.className = `energy-label energy-label-${product.energyLabel.class.toLowerCase()}`;
    energyLabel.textContent = product.energyLabel.class;
    // Add tooltip or title for the range if needed
    energyLabel.title = `Energy Efficiency: ${product.energyLabel.class} (Range: ${product.energyLabel.range})`;

    const dataSheetLink = document.createElement('a');
    dataSheetLink.href = product.energyLabel.dataSheetUrl;
    dataSheetLink.textContent = 'Produktdatenblatt';
    dataSheetLink.className = 'datasheet-link';
    dataSheetLink.target = '_blank'; // Open in new tab
    dataSheetLink.rel = 'noopener noreferrer';

    energyWrapper.append(energyLabel, dataSheetLink);
    contentWrapper.append(energyWrapper); // Append energy info to content
  }

  // --- Availability ---
  const availabilityWrapper = document.createElement('div');
  availabilityWrapper.className = `availability-wrapper ${product.availability ? 'available' : 'unavailable'}`;
  availabilityWrapper.innerHTML = `<span class="icon"></span> <span class="text">${product.availability ? 'Verfügbar' : 'Nicht verfügbar'}</span>`;
  contentWrapper.append(availabilityWrapper); // Append availability to content

  // --- Price Section ---
  const priceSection = document.createElement('div');
  priceSection.className = 'price-section';

  const priceWrapper = document.createElement('div');
  priceWrapper.className = 'price-wrapper';

  const currentPrice = document.createElement('span');
  currentPrice.className = 'price-current';
  currentPrice.textContent = `${product.price.current.toFixed(2).replace('.', ',')} ${product.price.currency}`;
  priceWrapper.append(currentPrice);

  // Discount Badge (Optional)
  if (product.price.discountPercentage) {
    const discountBadge = document.createElement('span');
    discountBadge.className = 'price-discount-badge';
    discountBadge.textContent = `-${product.price.discountPercentage}%`;
    priceWrapper.append(discountBadge);
  }
  priceSection.append(priceWrapper);

  // Strikethrough Price (Optional)
  if (product.price.strikethrough) {
    const strikethroughWrapper = document.createElement('div');
    strikethroughWrapper.className = 'price-strikethrough-wrapper';
    const strikethroughLabel = document.createElement('span');
    strikethroughLabel.className = 'price-strikethrough-label';
    strikethroughLabel.textContent = 'UVP'; // Or other label if needed
    const strikethroughPrice = document.createElement('span');
    strikethroughPrice.className = 'price-strikethrough';
    strikethroughPrice.textContent = `${product.price.strikethrough.toFixed(2).replace('.', ',')} ${product.price.currency}`;
    strikethroughWrapper.append(strikethroughLabel, ' ', strikethroughPrice);
    priceSection.append(strikethroughWrapper);
  }

  // Price Composition
  const priceComposition = document.createElement('p');
  priceComposition.className = 'price-composition';
  priceComposition.textContent = product.priceComposition;
  priceSection.append(priceComposition);

  item.append(priceSection); // Append price section below clickable area/content

  // --- Actions Wrapper ---
  const actionsWrapper = document.createElement('div');
  actionsWrapper.className = 'actions-wrapper';

  // Compare Action (Optional)
  if (product.compareEnabled) {
    const compareAction = document.createElement('div');
    compareAction.className = 'compare-action';
    const compareId = `compare-${product.pdpUrl.split('/').pop()}-${Date.now()}`; // Unique ID
    compareAction.innerHTML = `
      <input type="checkbox" id="${compareId}" class="compare-checkbox" aria-label="Compare ${product.title}">
      <label for="${compareId}" class="compare-label">Produkt vergleichen</label>
    `;
    actionsWrapper.append(compareAction);
  }

  item.append(actionsWrapper);

  // --- "To Product" Button (Hidden by default, shown on hover via CSS) ---
  const toProductButton = document.createElement('a');
  toProductButton.href = product.pdpUrl;
  toProductButton.className = 'button to-product';
  toProductButton.textContent = 'To Product'; // Replace with icon/arrow if needed
  toProductButton.ariaLabel = `Go to product page for ${product.title}`; 
  item.append(toProductButton);

  return item;
}

/**
 * Decorates the product teaser block.
 * @param {HTMLElement} block - The block element
 */
export default function decorate(block) {
  const firstDiv = block.querySelector(':scope > div');
  const secondDiv = firstDiv ? firstDiv.querySelector(':scope > div') : null;

  if (!secondDiv) {
    console.error('Product Teaser block expects a div containing a comma-separated list of SKUs.');
    return;
  }

  const skuText = secondDiv.textContent?.trim() || '';
  const skus = skuText.split(',').map((s) => s.trim()).filter((s) => s);

  // Clear the initial content
  block.innerHTML = '';
  block.classList.add('product-teaser-grid'); // Add class for grid layout styling

  if (skus.length === 0) {
    block.textContent = 'No SKUs provided for Product Teaser block.';
    return;
  }

  // Create and append teasers for each SKU
  skus.forEach((sku) => {
    const productData = fetchProductData(sku); // Use the mock fetch function
    if (productData) {
      const teaserElement = createProductTeaserElement(productData);
      block.append(teaserElement);
    } else {
      console.warn(`No data found for SKU: ${sku}`);
      // Optionally display a placeholder or error message for this SKU
    }
  });
}
