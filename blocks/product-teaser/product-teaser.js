const MOCK_PRODUCT_DATA = {
  'SKU-123': {
    pdpUrl: '/products/pac-2010-sh',
    imageUrl: 'https://placehold.co/400x400/f8f8f8/ccc?text=PAC+2010+SH',
    title: 'PAC 2010 SH',
    description: 'Lokales Klimagerät mit Heizfunktion und Luftfilter',
    energyLabel: 'A',
    energyRange: 'A+++ < D',
    datasheetUrl: '/datasheets/pac-2010-sh.pdf',
    availability: 'Verfügbar',
    price: '84,00 €',
    originalPrice: '119,00 €',
    discountPercent: '30%',
    priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
    promoBanner: '-25% Code: SUMMER',
    rating: 4,
    ratingCount: 31345,
  },
  'SKU-124': {
    pdpUrl: '/products/pac-2010-sh-alt',
    imageUrl: 'https://placehold.co/400x400/f8f8f8/ccc?text=PAC+2010+SH',
    title: 'PAC 2010 SH',
    description: 'Lokales Klimagerät mit Heizfunktion und Luftfilter',
    energyLabel: 'A',
    energyRange: 'A+++ < D',
    datasheetUrl: '/datasheets/pac-2010-sh-alt.pdf',
    availability: 'Verfügbar',
    price: '84,00 €',
    originalPrice: '119,00 €',
    discountPercent: '30%',
    priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
    promoBanner: '-25% Code: SUMMER',
    rating: 4,
    ratingCount: 31345,
  },
  'SKU-218': {
    pdpUrl: '/products/pac-3500-pro',
    imageUrl: 'https://placehold.co/400x400/f8f8f8/ccc?text=PAC+3500+PRO',
    title: 'PAC 3500 PRO',
    description: 'Mobiles Klimagerät für Profis und große Räume',
    // No energy label for this one
    availability: 'Verfügbar',
    price: '399,95 €',
    priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
    rating: 5,
    ratingCount: 876,
  },
  'SKU-14894': {
    pdpUrl: '/products/pac-2100-x',
    imageUrl: 'https://placehold.co/400x400/f8f8f8/ccc?text=PAC+2100+X',
    title: 'PAC 2100 X',
    description: 'Kompaktes Klimagerät ideal für kleine Büros oder Schlafzimmer',
    energyLabel: 'B',
    energyRange: 'A+++ < D',
    datasheetUrl: '/datasheets/pac-2100-x.pdf',
    availability: 'Verfügbar',
    price: '199,00 €',
    priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
    rating: 3,
    ratingCount: 10234,
  },
  'SKU-134': {
    pdpUrl: '/products/some-other-product',
    imageUrl: 'https://placehold.co/400x400/f8f8f8/ccc?text=Placeholder',
    title: 'Another Product Title',
    description: 'This is a description for another product, demonstrating variability.',
    availability: 'Nicht verfügbar',
    price: '49,50 €',
    priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
    rating: 4,
    ratingCount: 500,
  },
  'SKU-183': {
    pdpUrl: '/products/special-offer',
    imageUrl: 'https://placehold.co/400x400/f8f8f8/ccc?text=Special+Offer',
    title: 'Special Offer Item',
    description: 'Limited time offer with great features included.',
    availability: 'Verfügbar',
    price: '99,00 €',
    originalPrice: '149,00 €',
    discountPercent: '33%',
    priceComposition: 'inkl. MwSt. zzgl. Versandkosten',
    promoBanner: 'Angebot!',
    rating: 5,
    ratingCount: 120,
  },
};

function fetchProductData(sku) {
  // In a real scenario, this would be an API call
  // await fetch(`/api/products/${sku}`)
  return MOCK_PRODUCT_DATA[sku] || null;
}

function truncateText(text, limit) {
  if (!text) return '';
  if (text.length <= limit) {
    return text;
  }
  return `${text.substring(0, limit).trim()}...`;
}

function renderRating(rating, count) {
  if (typeof rating !== 'number' || rating < 0 || rating > 5) return '';

  const starsContainer = document.createElement('div');
  starsContainer.classList.add('product-rating');
  starsContainer.setAttribute('aria-label', `Bewertung: ${rating} von 5 Sternen`);

  for (let i = 1; i <= 5; i += 1) {
    const star = document.createElement('span');
    star.classList.add('star');
    star.setAttribute('aria-hidden', 'true');
    if (i <= rating) {
      star.classList.add('filled');
      star.textContent = '★'; // Filled star
    } else {
      star.textContent = '☆'; // Empty star
    }
    starsContainer.appendChild(star);
  }

  if (typeof count === 'number') {
    const countSpan = document.createElement('span');
    countSpan.classList.add('rating-count');
    countSpan.textContent = `(${count.toLocaleString()})`;
    starsContainer.appendChild(countSpan);
  }

  return starsContainer;
}

export default function decorate(block) {
  const skuListContainer = block.querySelector(':scope > div > div');
  if (!skuListContainer) return;

  const skus = skuListContainer.textContent.split(',').map((sku) => sku.trim()).filter(Boolean);

  // Clear the initial content
  block.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.classList.add('product-teaser-items');

  skus.forEach((sku) => {
    const product = fetchProductData(sku);
    if (!product) return; // Skip if no data found for SKU

    const item = document.createElement('div');
    item.classList.add('product-teaser-item');

    // --- PDP Link Area --- (Image + Title/Description)
    const pdpLink = document.createElement('a');
    pdpLink.href = product.pdpUrl;
    pdpLink.classList.add('product-pdp-link');
    pdpLink.setAttribute('aria-label', `Details zu ${product.title}`);

    // --- Image Wrapper --- 
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('product-image-wrapper');

    if (product.promoBanner) {
      const banner = document.createElement('div');
      banner.classList.add('promo-banner');
      banner.textContent = product.promoBanner;
      item.appendChild(banner); // Banner sits above the image wrapper visually but outside the link
    }

    // Create Picture element (reusable approach)
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = product.imageUrl;
    img.alt = product.title;
    img.setAttribute('loading', 'lazy');
    img.setAttribute('width', '250'); 
    img.setAttribute('height', '250');
    picture.appendChild(img);
    imageWrapper.appendChild(picture);

    const toProductButton = document.createElement('div');
    toProductButton.classList.add('to-product-button');
    toProductButton.textContent = 'zum Produkt';
    toProductButton.setAttribute('aria-hidden', 'true'); // Hide from screen readers, link covers it
    imageWrapper.appendChild(toProductButton);

    pdpLink.appendChild(imageWrapper);

    // --- Content Area --- 
    const content = document.createElement('div');
    content.classList.add('product-content');

    const title = document.createElement('h3');
    title.classList.add('product-title');
    title.textContent = product.title;
    content.appendChild(title);

    const description = document.createElement('p');
    description.classList.add('product-description');
    description.textContent = truncateText(product.description, 60); // Apply character limit
    content.appendChild(description);

    // Append title and description to the link
    pdpLink.appendChild(content);

    // Elements below Title/Description are outside the main PDP Link
    const infoBelowDescription = document.createElement('div');
    infoBelowDescription.classList.add('product-info-below');

    // Rating
    const ratingElement = renderRating(product.rating, product.ratingCount);
    if (ratingElement) {
      infoBelowDescription.appendChild(ratingElement);
    }

    // Energy Label
    if (product.energyLabel && product.datasheetUrl) {
      const energyWrapper = document.createElement('div');
      energyWrapper.classList.add('energy-label-wrapper');

      const energyLabel = document.createElement('span');
      energyLabel.classList.add('energy-label', `energy-label-${product.energyLabel.toLowerCase()}`);
      energyLabel.textContent = product.energyLabel;
      energyWrapper.appendChild(energyLabel);

      if (product.energyRange) {
        const energyRange = document.createElement('span');
        energyRange.classList.add('energy-range');
        energyRange.textContent = product.energyRange;
        energyWrapper.appendChild(energyRange);
      }

      const datasheetLink = document.createElement('a');
      datasheetLink.href = product.datasheetUrl;
      datasheetLink.classList.add('datasheet-link');
      datasheetLink.textContent = 'Produktdatenblatt';
      datasheetLink.setAttribute('target', '_blank');
      datasheetLink.setAttribute('rel', 'noopener noreferrer');
      datasheetLink.setAttribute('aria-label', `Produktdatenblatt für ${product.title}`);
      energyWrapper.appendChild(datasheetLink);

      infoBelowDescription.appendChild(energyWrapper);
    }

    // Availability
    const availability = document.createElement('div');
    availability.classList.add('availability');
    availability.classList.toggle('available', product.availability?.toLowerCase() === 'verfügbar');
    availability.classList.toggle('unavailable', product.availability?.toLowerCase() !== 'verfügbar');
    availability.textContent = product.availability;
    infoBelowDescription.appendChild(availability);

    // Price Info
    const priceInfo = document.createElement('div');
    priceInfo.classList.add('price-info');

    const priceGross = document.createElement('span');
    priceGross.classList.add('price-gross');
    priceGross.textContent = product.price;
    priceInfo.appendChild(priceGross);

    if (product.discountPercent) {
      const discountBadge = document.createElement('span');
      discountBadge.classList.add('discount-badge');
      discountBadge.textContent = `-${product.discountPercent}`; // Assuming format is '30%'
      priceInfo.appendChild(discountBadge);
    }

    if (product.originalPrice) {
      const priceOriginal = document.createElement('span');
      priceOriginal.classList.add('price-original');
      priceOriginal.textContent = `UVP ${product.originalPrice}`; // UVP assumed, adjust if needed
      // Insert original price below the main price section
      infoBelowDescription.appendChild(priceOriginal);
    }

    const priceComposition = document.createElement('span');
    priceComposition.classList.add('price-composition');
    priceComposition.textContent = product.priceComposition;
    // Insert composition below original price (or main price if no original)
    infoBelowDescription.appendChild(priceComposition);

    // Append main price container after availability
    infoBelowDescription.insertBefore(priceInfo, priceOriginal || priceComposition);


    // --- Comparison --- 
    const compareWrapper = document.createElement('div');
    compareWrapper.classList.add('product-compare');

    const compareId = `compare-${sku}-${Math.random().toString(36).substring(2, 7)}`;
    const compareCheckbox = document.createElement('input');
    compareCheckbox.type = 'checkbox';
    compareCheckbox.id = compareId;
    compareCheckbox.classList.add('compare-checkbox');
    compareCheckbox.setAttribute('aria-label', `Produkt ${product.title} vergleichen`);

    const compareLabel = document.createElement('label');
    compareLabel.htmlFor = compareId;
    compareLabel.classList.add('compare-label');
    compareLabel.textContent = 'Produkt vergleichen';

    compareWrapper.appendChild(compareCheckbox);
    compareWrapper.appendChild(compareLabel);

    // --- Assemble Teaser Item --- 
    item.appendChild(pdpLink); // Appends image + title/description link
    item.appendChild(infoBelowDescription); // Appends rating, energy, availability, prices
    item.appendChild(compareWrapper);

    wrapper.appendChild(item);
  });

  block.appendChild(wrapper);
}
