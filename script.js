const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
  document.body.classList.remove('menu-open');
}));

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const setText = (selector, value) => {
  const element = document.querySelector(selector);
  if (element && value !== undefined) element.textContent = value;
};

const setHref = (selector, value) => {
  if (!value) return;
  document.querySelectorAll(selector).forEach((element) => { element.href = value; });
};

function applySiteContent(content) {
  const { meta, hotel, hero, intro, rooms, gallery, amenities, location, faq, cta } = content;
  const absoluteUrl = (value) => new URL(value, meta.canonicalUrl).href;

  document.title = meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', meta.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', meta.description);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', meta.canonicalUrl);
  document.querySelector('meta[property="og:image"]')?.setAttribute('content', absoluteUrl(meta.socialImage));
  document.querySelector('meta[property="og:image:alt"]')?.setAttribute('content', meta.socialImageAlt);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', meta.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', meta.description);
  document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', absoluteUrl(meta.socialImage));
  document.querySelector('meta[name="twitter:image:alt"]')?.setAttribute('content', meta.socialImageAlt);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', meta.canonicalUrl);
  document.querySelectorAll('link[rel="alternate"]').forEach((link) => link.setAttribute('href', meta.canonicalUrl));
  document.querySelectorAll('.brand strong').forEach((element) => { element.textContent = hotel.name; });
  document.querySelectorAll('.brand small').forEach((element) => { element.textContent = hotel.subtitle; });

  setHref('a[href*="bookings.mrsresidency.com"]', hotel.bookingUrl);
  setHref('a[href^="https://wa.me"]', hotel.whatsappUrl);
  setHref('a[href^="tel:"]', `tel:${hotel.phoneLink}`);
  setHref('a[href^="mailto:"]', `mailto:${hotel.email}`);

  const heroImage = document.querySelector('.hero-image');
  heroImage.src = hero.image;
  heroImage.alt = hero.imageAlt;
  heroImage.removeAttribute('fetchpriority');
  setText('.hero .eyebrow', hero.eyebrow);
  setText('.hero h1', hero.title);
  setText('.hero-copy', hero.description);
  const heroCall = document.querySelector('.hero-actions .text-link');
  if (heroCall) heroCall.innerHTML = `Call ${escapeHtml(hotel.phone)} <span aria-hidden="true">↗</span>`;
  document.querySelector('.quick-facts').innerHTML = hero.facts.map((fact) =>
    `<div role="listitem"><strong>${escapeHtml(fact.value)}</strong><span>${escapeHtml(fact.label)}</span></div>`
  ).join('');

  setText('.intro .section-kicker', intro.kicker);
  setText('.intro h2', intro.title);
  setText('.intro .lead', intro.description);
  document.querySelector('.mini-amenities').innerHTML = intro.highlights.map((item) => `<span role="listitem">${escapeHtml(item)}</span>`).join('');

  setText('.rooms .section-kicker', rooms.kicker);
  setText('.rooms .section-heading h2', rooms.title);
  setText('.rooms .section-heading > p', rooms.description);
  const featuredRoom = rooms.items.find((room) => room.featured) || rooms.items[0];
  const roomLayout = document.querySelector('.room-layout');
  if (featuredRoom) {
    roomLayout.hidden = false;
    const roomImage = document.querySelector('.room-feature img');
    roomImage.src = featuredRoom.image;
    roomImage.alt = featuredRoom.imageAlt;
    setText('.room-feature h3', featuredRoom.name);
    setText('.room-price strong', featuredRoom.price);
    const otherRooms = rooms.items.filter((room) => room !== featuredRoom);
    document.querySelector('.room-list').innerHTML = `${otherRooms.map((room) => `<article>
      <div><h3>${escapeHtml(room.name)}</h3><p>${escapeHtml(room.description)}</p></div>
      <strong>${escapeHtml(room.price)}</strong>
    </article>`).join('')}
    <a class="button button-dark" href="${escapeHtml(hotel.bookingUrl)}" target="_blank" rel="noopener">View availability</a>
    <p class="rate-note">${escapeHtml(rooms.rateNote)}</p>`;
  } else {
    roomLayout.hidden = true;
  }

  setText('.gallery .section-kicker', gallery.kicker);
  setText('.gallery h2', gallery.title);
  setText('.gallery .section-heading > p', gallery.description);
  const gallerySection = document.querySelector('.gallery');
  gallerySection.hidden = !gallery.images.length;
  document.querySelector('.carousel-track').innerHTML = gallery.images.map((image) => `<figure class="carousel-slide" data-carousel-slide>
    <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy">
    <figcaption><span>${escapeHtml(image.label)}</span><strong>${escapeHtml(image.caption)}</strong></figcaption>
  </figure>`).join('');

  setText('.amenities-grid .section-kicker', amenities.kicker);
  setText('.amenities-grid h2', amenities.title);
  setText('.amenities-grid .lead', amenities.description);
  document.querySelector('.amenity-list').innerHTML = amenities.items.map((item, index) => `<div>
    <span>${String(index + 1).padStart(2, '0')}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>
  </div>`).join('');

  const locationImage = document.querySelector('.location-photo img');
  locationImage.src = location.image;
  locationImage.alt = location.imageAlt;
  setText('.location-photo span', location.badge);
  setText('.location-copy .section-kicker', location.kicker);
  setText('.location-copy h2', location.title);
  setText('.location-copy > p:not(.section-kicker)', hotel.address);
  document.querySelector('.distance-list').innerHTML = location.distances.map((item) =>
    `<div><span>${escapeHtml(item.place)}</span><strong>${escapeHtml(item.distance)}</strong></div>`
  ).join('');
  const mapsLink = document.querySelector('.location-copy .text-link');
  mapsLink.href = hotel.mapsUrl;

  setText('.faq .section-kicker', faq.kicker);
  setText('.faq h2', faq.title);
  setText('.faq .lead', faq.description);
  document.querySelector('.faq-list').innerHTML = faq.items.map((item) => `<details>
    <summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p>
  </details>`).join('');

  setText('.cta .section-kicker', cta.kicker);
  setText('.cta h2', cta.title);
  setText('.cta p:not(.section-kicker)', cta.description);

  const footerContact = document.querySelector('.footer-grid > div:nth-child(2)');
  footerContact.innerHTML = `<h2>Contact</h2><a href="tel:${escapeHtml(hotel.phoneLink)}">${escapeHtml(hotel.phone)}</a><a href="mailto:${escapeHtml(hotel.email)}">${escapeHtml(hotel.email)}</a>`;
  document.querySelector('.footer-grid > div:nth-child(3) p').textContent = hotel.address;

  const numericRoomPrices = rooms.items
    .map((room) => Number(room.price.replace(/[^0-9]/g, '')))
    .filter((price) => Number.isFinite(price) && price > 0);
  const hotelSchema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    '@id': `${meta.canonicalUrl}#hotel`,
    name: hotel.fullName || `${hotel.name} Residency`,
    url: meta.canonicalUrl,
    description: meta.description,
    telephone: hotel.phoneLink,
    email: hotel.email,
    image: gallery.images.slice(0, 8).map((image) => absoluteUrl(image.src)),
    priceRange: numericRoomPrices.length
      ? `₹${Math.min(...numericRoomPrices).toLocaleString('en-IN')}–₹${Math.max(...numericRoomPrices).toLocaleString('en-IN')}`
      : undefined,
    hasMap: hotel.mapsUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No. 57, Mela Perumal Maistry Street',
      addressLocality: 'Madurai',
      addressRegion: 'Tamil Nadu',
      postalCode: '625001',
      addressCountry: 'IN'
    },
    amenityFeature: amenities.items.map((item) => ({
      '@type': 'LocationFeatureSpecification', name: item.title, value: true
    })),
    checkinTime: '12:15',
    checkoutTime: '12:00',
    makesOffer: rooms.items.map((room) => ({
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: room.price.replace(/[^0-9]/g, ''),
      url: hotel.bookingUrl,
      itemOffered: { '@type': 'HotelRoom', name: room.name, description: room.description }
    }))
  };
  document.querySelector('#hotel-schema').textContent = JSON.stringify(hotelSchema);
  document.querySelector('#website-schema').textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${meta.canonicalUrl}#website`,
    url: meta.canonicalUrl,
    name: `${hotel.fullName || hotel.name} Madurai`,
    inLanguage: 'en-IN',
    publisher: { '@id': `${meta.canonicalUrl}#hotel` }
  });
  document.querySelector('#faq-schema').textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  });
}

function initializeCarousels() {
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const viewport = carousel.querySelector('[data-carousel-viewport]');
    const slides = [...carousel.querySelectorAll('[data-carousel-slide]')];
    const previousButton = carousel.querySelector('[data-carousel-prev]');
    const nextButton = carousel.querySelector('[data-carousel-next]');
    const currentLabel = carousel.querySelector('[data-carousel-current]');
    const totalLabel = carousel.querySelector('[data-carousel-total]');
    const dotsContainer = carousel.querySelector('[data-carousel-dots]');
    let activeIndex = 0;
    let scrollTimer;

    if (!slides.length) return;
    dotsContainer.replaceChildren();
    totalLabel.textContent = String(slides.length).padStart(2, '0');

    const dots = slides.map((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Show photo ${index + 1}`);
      dot.addEventListener('click', () => showSlide(index));
      dotsContainer.appendChild(dot);
      return dot;
    });

    const updateCarousel = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      currentLabel.textContent = String(activeIndex + 1).padStart(2, '0');
      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
    };

    function showSlide(index) {
      const nextIndex = (index + slides.length) % slides.length;
      viewport.scrollTo({ left: slides[nextIndex].offsetLeft, behavior: reducedMotion ? 'auto' : 'smooth' });
      updateCarousel(nextIndex);
    }

    previousButton.addEventListener('click', () => showSlide(activeIndex - 1));
    nextButton.addEventListener('click', () => showSlide(activeIndex + 1));
    viewport.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        showSlide(activeIndex + (event.key === 'ArrowLeft' ? -1 : 1));
      }
    });
    viewport.addEventListener('scroll', () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        const closestIndex = slides.reduce((closest, slide, index) => {
          const distance = Math.abs(slide.offsetLeft - viewport.scrollLeft);
          return distance < closest.distance ? { index, distance } : closest;
        }, { index: 0, distance: Infinity }).index;
        updateCarousel(closestIndex);
      }, 80);
    }, { passive: true });
    updateCarousel(0);
  });
}

if (reducedMotion || !('IntersectionObserver' in window)) {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

if (window.location.hash) {
  document.getElementById(window.location.hash.slice(1))?.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
}

fetch('/content/site.json')
  .then((response) => {
    if (!response.ok) throw new Error('Content request failed');
    return response.json();
  })
  .then(applySiteContent)
  .catch((error) => console.warn('Using embedded website content:', error))
  .finally(initializeCarousels);

document.querySelector('[data-year]').textContent = new Date().getFullYear();
