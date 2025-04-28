/**
 * Mocks fetching product data for a given SKU.
 * In a real scenario, this would call an API.
 * @param {string} sku The product SKU.
 * @returns {object|null} Product data or null if not found.
 */
async function fetchProductData(sku) {
  // Simulate API call delay
  // await new Promise((resolve) => setTimeout(resolve, 50));

  const mockData = {
    'SKU-123': {
      title: 'PAC 2010 SH',
      description: 'Lokales Klimagerät mit Heizfunktion und Luftfilter',
      // Use a real placeholder service or a local placeholder image
      imageUrl: 'https://via.placeholder.com/300x300.png/f8f8f8/cccccc?text=Product+Image',
      pdpUrl: `/products/${sku}`,
      energyLabel: {
        class: 'A',
        range: 'A+++ < D',
        datasheetUrl: `/datasheets/${sku}.pdf`,
      },
      availability: true,
      price: 84.00,
      currency: '€',
      strikethroughPrice: 119.00,
      discountPercentage: 30,
      priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
      actionBannerText: '-25% Code: SUMMER',
      rating: { score: 4, count: 31345 }, // Example rating
      compareText: 'Produkt vergleichen',
    },
    'SKU-124': {
      title: 'PAC 2010 SH',
      description: 'Lokales Klimagerät mit Heizfunktion und Luftfilter',
      imageUrl: 'https://via.placeholder.com/300x300.png/f8f8f8/cccccc?text=Product+Image',
      pdpUrl: `/products/${sku}`,
       energyLabel: {
        class: 'A',
        range: 'A+++ < D',
        datasheetUrl: `/datasheets/${sku}.pdf`,
      },
      availability: true,
      price: 84.00,
      currency: '€',
      strikethroughPrice: 119.00,
      discountPercentage: 30,
      priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
      actionBannerText: '-25% Code: SUMMER',
      rating: { score: 4, count: 31345 },
      compareText: 'Produkt vergleichen',
    },
    'SKU-218': {
      title: 'PAC 2010 SH',
      description: 'Lokales Klimagerät mit Heizfunktion und Luftfilter',
      imageUrl: 'https://via.placeholder.com/300x300.png/f8f8f8/cccccc?text=Product+Image',
      pdpUrl: `/products/${sku}`,
      // No energy label for this one
      availability: true,
      price: 84.00,
      currency: '€',
      // No discount
      priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
      // No action banner
      rating: { score: 4, count: 31345 },
      compareText: 'Produkt vergleichen',
    },
    'SKU-14894': {
        title: 'PAC 2010 SH',
        description: 'Lokales Klimagerät mit Heizfunktion und Luftfilter',
        imageUrl: 'https://via.placeholder.com/300x300.png/f8f8f8/cccccc?text=Product+Image',
        pdpUrl: `/products/${sku}`,
        // No energy label
        availability: false, // Not available
        price: 84.00,
        currency: '€',
        priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
        rating: { score: 4, count: 31345 },
        compareText: 'Produkt vergleichen',
      },
    // Add more mock data as needed
  };

  // Simulate not finding a product
  if (sku === 'SKU-134') return null;

  // Default data if SKU not explicitly mocked
  return mockData[sku] || {
      title: `Product ${sku}`,
      description: 'Standard product description goes here.',
      imageUrl: 'https://via.placeholder.com/300x300.png/f8f8f8/cccccc?text=Product+Image',
      pdpUrl: `/products/${sku}`,
      availability: Math.random() > 0.3, // Random availability
      price: (Math.random() * 100 + 50).toFixed(2),
      currency: '€',
      priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
      rating: { score: Math.floor(Math.random() * 3) + 3, count: Math.floor(Math.random() * 50000) },
      compareText: 'Produkt vergleichen',
    };
}

/**
 * Creates the HTML structure for a single product teaser card.
 * @param {object} productData The product data.
 * @param {number} descriptionMaxLength Max characters for description.
 * @returns {HTMLElement} The teaser card element.
 */
function createTeaserCard(productData, descriptionMaxLength = 80) {
  if (!productData) return null;

  const card = document.createElement('div');
  card.className = 'teaser-card';

  // PDP Link - wraps image and text content later
  const pdpLink = document.createElement('a');
  pdpLink.href = productData.pdpUrl;
  pdpLink.ariaLabel = `View details for ${productData.title}`;
  pdpLink.className = 'pdp-link';

  // Image Wrapper
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'image-wrapper';

  // Optional Action Banner
  if (productData.actionBannerText) {
    const banner = document.createElement('div');
    banner.className = 'action-banner';
    banner.textContent = productData.actionBannerText;
    card.appendChild(banner); // Banner is outside the link, above image
  }

  // Product Image
  const img = document.createElement('img');
  img.src = productData.imageUrl;
  img.alt = productData.title; // Alt text for accessibility
  img.loading = 'lazy'; // Lazy load images
  imageWrapper.appendChild(img);

  // Hover Button (Desktop Only)
  const hoverButton = document.createElement('span'); // Use span, style as button
  hoverButton.className = 'to-product-button';
  hoverButton.textContent = 'To Product';
  hoverButton.setAttribute('role', 'button');
  hoverButton.setAttribute('aria-hidden', 'true'); // Hide from screen readers initially, handled by CSS/hover
  imageWrapper.appendChild(hoverButton);

  // --- Icons (Top Right - simplified example) ---
  const iconsWrapper = document.createElement('div');
  iconsWrapper.className = 'icons-wrapper';
  // Wishlist Icon (example)
  const wishlistButton = document.createElement('button');
  wishlistButton.className = 'icon-button wishlist';
  wishlistButton.ariaLabel = 'Add to wishlist';
  wishlistButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
  // Prevent link navigation when clicking icon buttons
  wishlistButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Add wishlist logic here
      alert('Wishlist clicked!');
  });
  iconsWrapper.appendChild(wishlistButton);
  // Share Icon (example)
   const shareButton = document.createElement('button');
   shareButton.className = 'icon-button share';
   shareButton.ariaLabel = 'Share product';
   shareButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>';
   shareButton.addEventListener('click', (e) => {
       e.preventDefault();
       e.stopPropagation();
       // Add share logic here
       alert('Share clicked!');
   });
  iconsWrapper.appendChild(shareButton);
  card.appendChild(iconsWrapper); // Icons are outside the link, above image

  // Content Wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'content-wrapper';

  // Product Title
  const title = document.createElement('h3');
  title.className = 'product-title';
  title.textContent = productData.title;
  contentWrapper.appendChild(title);

  // Product Description
  const description = document.createElement('p');
  description.className = 'product-description';
  description.textContent = productData.description.length > descriptionMaxLength
    ? `${productData.description.substring(0, descriptionMaxLength)}...`
    : productData.description;
  contentWrapper.appendChild(description);

  // Rating (Example using stars)
  if (productData.rating) {
    const ratingWrapper = document.createElement('div');
    ratingWrapper.className = 'rating-wrapper';
    ratingWrapper.ariaLabel = `Rated ${productData.rating.score} out of 5 stars by ${productData.rating.count} users`;
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      star.innerHTML = i <= productData.rating.score ? '&#9733;' : '&#9734;'; // Filled or empty star
      star.setAttribute('aria-hidden', 'true');
      ratingWrapper.appendChild(star);
    }
    const ratingCount = document.createElement('span');
    ratingCount.className = 'rating-count';
    ratingCount.textContent = ` (${productData.rating.count})`;
    ratingCount.setAttribute('aria-hidden', 'true');
    ratingWrapper.appendChild(ratingCount);
    contentWrapper.appendChild(ratingWrapper);
  }

  // Energy Label (if applicable)
  if (productData.energyLabel) {
    const energyWrapper = document.createElement('div');
    energyWrapper.className = 'energy-label-wrapper';

    const energyLabel = document.createElement('span');
    energyLabel.className = `energy-label energy-label-${productData.energyLabel.class.toLowerCase()}`;
    energyLabel.textContent = productData.energyLabel.class;

    const energyRange = document.createElement('span');
    energyRange.className = 'energy-range';
    energyRange.textContent = productData.energyLabel.range;
    energyLabel.appendChild(energyRange);

    energyWrapper.appendChild(energyLabel);

    const datasheetLink = document.createElement('a');
    datasheetLink.href = productData.energyLabel.datasheetUrl;
    datasheetLink.className = 'datasheet-link';
    datasheetLink.textContent = 'Produktdatenblatt';
    datasheetLink.target = '_blank'; // Open in new tab
    datasheetLink.rel = 'noopener noreferrer';
    datasheetLink.addEventListener('click', (e) => e.stopPropagation()); // Prevent card link navigation
    energyWrapper.appendChild(datasheetLink);

    contentWrapper.appendChild(energyWrapper);
  }

  // Availability Badge
  const availability = document.createElement('div');
  availability.className = `availability ${productData.availability ? 'in-stock' : 'out-of-stock'}`;
  const checkIcon = productData.availability ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  availability.innerHTML = `${checkIcon} ${productData.availability ? 'Verfügbar' : 'Nicht verfügbar'}`;
  contentWrapper.appendChild(availability);


  // --- Price Section ---
  const priceSection = document.createElement('div');
  priceSection.className = 'price-section';

  // Price Wrapper
  const priceWrapper = document.createElement('div');
  priceWrapper.className = 'price-wrapper';

  const price = document.createElement('span');
  price.className = 'price';
  // Format price properly
  price.textContent = `${productData.price.toFixed(2).replace('.', ',')} ${productData.currency}`;
  priceWrapper.appendChild(price);

  // Optional Discount Badge
  if (productData.discountPercentage) {
    const discountBadge = document.createElement('span');
    discountBadge.className = 'discount-badge';
    discountBadge.textContent = `-${productData.discountPercentage}%`;
    priceWrapper.appendChild(discountBadge);
  }
  priceSection.appendChild(priceWrapper);

  // Optional Strikethrough Price
  if (productData.strikethroughPrice) {
    const strikethrough = document.createElement('div'); // Use div for potential block layout
    strikethrough.className = 'strikethrough-price';
    strikethrough.textContent = `UVP ${productData.strikethroughPrice.toFixed(2).replace('.', ',')} ${productData.currency}`;
    priceSection.appendChild(strikethrough);
  }

  // Price Composition
  const priceComposition = document.createElement('p');
  priceComposition.className = 'price-composition';
  priceComposition.textContent = productData.priceComposition;
  priceSection.appendChild(priceComposition);

  contentWrapper.appendChild(priceSection);

  // -- Clickable Area Setup --
  pdpLink.appendChild(imageWrapper);
  pdpLink.appendChild(contentWrapper);
  card.appendChild(pdpLink);

  // --- Comparison Section (Below clickable area) ---
  const compareWrapper = document.createElement('div');
  compareWrapper.className = 'compare-wrapper';

  const compareLabel = document.createElement('label');
  compareLabel.className = 'compare-label';

  const compareCheckbox = document.createElement('input');
  compareCheckbox.type = 'checkbox';
  compareCheckbox.id = `compare-${productData.pdpUrl.split('/').pop()}`; // Unique ID
  compareCheckbox.className = 'compare-checkbox';
  compareCheckbox.setAttribute('aria-label', `Compare ${productData.title}`);

  const compareText = document.createElement('span');
  compareText.textContent = productData.compareText || 'Produkt vergleichen';

  compareLabel.appendChild(compareCheckbox);
  compareLabel.appendChild(compareText);
  compareWrapper.appendChild(compareLabel);

  card.appendChild(compareWrapper);

  return card;
}

/**
 * Decorates the product teaser block.
 * @param {HTMLElement} block The product teaser block element.
 */
export default async function decorate(block) {
  const skuText = block.textContent.trim();
  const skus = skuText.split(',').map(sku => sku.trim()).filter(sku => sku);

  // Clear the initial content (the SKU list)
  block.innerHTML = '';

  if (skus.length === 0) {
    block.textContent = 'No product SKUs provided.';
    return;
  }

  block.classList.add('product-teaser-grid'); // Add class for grid layout

  // Fetch data and create cards concurrently
  const cardPromises = skus.map(async (sku) => {
    const productData = await fetchProductData(sku);
    if (productData) {
      return createTeaserCard(productData);
    }
    console.warn(`Could not fetch data for SKU: ${sku}`);
    return null; // Return null for SKUs with no data
  });

  const cards = (await Promise.all(cardPromises)).filter(card => card !== null);

  if (cards.length === 0) {
      block.textContent = 'No valid product data found for the provided SKUs.';
      return;
  }

  cards.forEach(card => {
    block.appendChild(card);
  });
}
