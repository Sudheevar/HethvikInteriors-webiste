(function () {
  'use strict';

  /* ─── GSAP plugin + AOS Init ────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);
  AOS.init({ once: true, duration: 750, easing: 'ease-out-cubic', offset: 80 });

  /* ═══════════════════════════════════════════════════════════════
     PROJECT DATA  (placeholder — swap in real photos + details)
     ═══════════════════════════════════════════════════════════════ */
  const HARDCODED_PROJECTS = [
    {
      id: 1,
      title: 'Jubilee Hills Villa',
      category: 'Residential',
      client: 'Mr. & Mrs. Sharma',
      year: '2024',
      location: 'Jubilee Hills, Hyderabad',
      area: '2,800 sq ft',
      budget: '₹40–60 Lakhs',
      style: 'Contemporary Luxury',
      rooms: ['Living Room', 'Dining Area', 'Master Bedroom', '2 Kids\' Bedrooms', 'Modular Kitchen'],
      materials: ['Italian Marble', 'Walnut Wood Panels', 'Brass Fixtures', 'Velvet Upholstery', 'Smart Lighting'],
      thumb:  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
      photos: [
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=80',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80',
        'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1400&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&q=80',
      ],
      reviews: [
        { name: 'Anil Sharma', rating: 5, date: 'March 2024', quote: 'Hethvik transformed our home beyond our expectations. Every detail was thoughtfully crafted — from the marble inlays to the lighting design. Truly world-class.' },
        { name: 'Sunita Sharma', rating: 5, date: 'March 2024', quote: 'The team listened to every request and delivered a space that feels like us. We get compliments from every guest who visits.' },
        { name: 'Rohan Mehta', rating: 5, date: 'April 2024', quote: 'Impeccable quality, flawless execution, and delivered on time. Worth every rupee spent.' },
      ],
    },
    {
      id: 2,
      title: 'Banjara Hills Office',
      category: 'Commercial',
      client: 'TechVerse Solutions Pvt. Ltd.',
      year: '2023',
      location: 'Banjara Hills, Hyderabad',
      area: '4,200 sq ft',
      budget: '₹60–80 Lakhs',
      style: 'Modern Corporate',
      rooms: ['Open Workspace', 'Conference Rooms', 'Director\'s Cabin', 'Reception Lounge', 'Break Room'],
      materials: ['Acoustic Panels', 'Glass Partitions', 'Powder-coated Steel', 'Engineered Wood', 'LED Cove Lighting'],
      thumb:  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
      photos: [
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80',
        'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1400&q=80',
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1400&q=80',
      ],
      reviews: [
        { name: 'Vikram Nanda', rating: 5, date: 'Nov 2023', quote: 'Our office now feels like a premium workspace that genuinely impresses clients. The reception area alone has changed how people perceive our brand.' },
        { name: 'Deepa Rao', rating: 5, date: 'Nov 2023', quote: 'The team handled the entire project with minimal disruption to our operations. Professional, on-budget, and stunning results.' },
        { name: 'Sanjay Kapoor', rating: 4, date: 'Dec 2023', quote: 'Excellent sense of space planning. The open-floor layout they designed has boosted team collaboration enormously.' },
      ],
    },
    {
      id: 3,
      title: 'Gachibowli Apartment',
      category: 'Residential',
      client: 'Mr. Ravi Kumar',
      year: '2024',
      location: 'Gachibowli, Hyderabad',
      area: '1,650 sq ft',
      budget: '₹18–25 Lakhs',
      style: 'Scandinavian Minimal',
      rooms: ['Living & Dining', 'Master Bedroom', 'Study Room', 'Kids\' Room', 'Kitchen'],
      materials: ['Oak Veneer', 'Matte White Laminate', 'Concrete Finish', 'Linen Fabrics', 'Pendant Lights'],
      thumb:  'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80',
      photos: [
        'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=1400&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&q=80',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1400&q=80',
        'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1400&q=80',
      ],
      reviews: [
        { name: 'Ravi Kumar', rating: 5, date: 'Jan 2024', quote: 'They turned my modest 1650 sq ft apartment into something I am proud to show off. Minimalist, clean, and incredibly functional.' },
        { name: 'Preethi Kumar', rating: 5, date: 'Feb 2024', quote: 'The study room design is perfect for work-from-home. Smart use of every corner without making it feel cramped.' },
        { name: 'Karthik Iyer', rating: 4, date: 'Feb 2024', quote: 'Great communication throughout the project. They stuck to the timeline which I really appreciated.' },
      ],
    },
    {
      id: 4,
      title: 'Film Nagar Residence',
      category: 'Residential',
      client: 'Ms. Priya Reddy',
      year: '2023',
      location: 'Film Nagar, Hyderabad',
      area: '3,100 sq ft',
      budget: '₹50–70 Lakhs',
      style: 'Art Deco Revival',
      rooms: ['Grand Living Room', 'Formal Dining', 'Master Suite', '2 Guest Rooms', 'Home Theatre'],
      materials: ['Chevron Parquet', 'Fluted Glass', 'Gold Leaf Details', 'Emerald Velvet', 'Marble Mosaic'],
      thumb:  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
      photos: [
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1400&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=80',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=80',
      ],
      reviews: [
        { name: 'Priya Reddy', rating: 5, date: 'Aug 2023', quote: 'The Art Deco revival theme was executed flawlessly. The gold leaf details in the dining room are simply breathtaking.' },
        { name: 'Arjun Reddy', rating: 5, date: 'Aug 2023', quote: 'The home theatre room exceeded every expectation. Outstanding craftsmanship and a team that genuinely cares.' },
        { name: 'Meena Pillai', rating: 5, date: 'Sept 2023', quote: 'A timeless design that honours the classic while feeling completely modern. Hethvik has an exceptional eye for detail.' },
      ],
    },
    {
      id: 5,
      title: 'Kondapur Penthouse',
      category: 'Residential',
      client: 'Mr. Aditya Nair',
      year: '2024',
      location: 'Kondapur, Hyderabad',
      area: '4,800 sq ft',
      budget: '₹85–110 Lakhs',
      style: 'Ultra-Luxury Modern',
      rooms: ['Sky Lounge', 'Formal Dining', 'Master Suite with Walk-in', '3 Bedrooms', 'Terrace Deck'],
      materials: ['Calacatta Marble', 'Brushed Bronze', 'Smoked Oak', 'Bespoke Carpentry', 'Chandelier Lighting'],
      thumb:  'https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800&q=80',
      photos: [
        'https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=1400&q=80',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&q=80',
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80',
      ],
      reviews: [
        { name: 'Aditya Nair', rating: 5, date: 'Feb 2024', quote: 'The penthouse feels like a five-star hotel now. The sky lounge with its panoramic lighting setup is the crown jewel.' },
        { name: 'Kavya Nair', rating: 5, date: 'Feb 2024', quote: 'Calacatta marble throughout, seamless carpentry, and smart lighting that adapts to mood — this is luxury living redefined.' },
        { name: 'Rahul Menon', rating: 5, date: 'March 2024', quote: 'Hethvik delivered a space that speaks volumes about class and sophistication. The attention to detail is unmatched.' },
      ],
    },
    {
      id: 6,
      title: 'HITEC City Showroom',
      category: 'Commercial',
      client: 'Vertex Automobiles',
      year: '2022',
      location: 'HITEC City, Hyderabad',
      area: '5,500 sq ft',
      budget: '₹70–90 Lakhs',
      style: 'Industrial Luxury',
      rooms: ['Display Floor', 'VIP Lounge', 'Consultation Pods', 'Manager\'s Office', 'Customer Lounge'],
      materials: ['Polished Concrete', 'Blackened Steel', 'Leather Panels', 'Backlit Onyx', 'Linear LED Tracks'],
      thumb:  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
      photos: [
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80',
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&q=80',
        'https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1400&q=80',
        'https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=1400&q=80',
      ],
      reviews: [
        { name: 'Suresh Verma', rating: 5, date: 'Oct 2022', quote: 'The showroom design has dramatically increased footfall. Clients now linger longer and our conversion rate has improved.' },
        { name: 'Anita Verma', rating: 4, date: 'Oct 2022', quote: 'The VIP lounge sets exactly the right tone for premium customers. Polished concrete with leather accents is a bold but brilliant choice.' },
        { name: 'Prakash Joshi', rating: 5, date: 'Nov 2022', quote: 'Every visiting brand representative has commented on the showroom design. It truly elevates our positioning in the market.' },
      ],
    },
  ];
  const projects = JSON.parse(localStorage.getItem('hethvik_projects') || 'null') || HARDCODED_PROJECTS;

  /* ═══════════════════════════════════════════════════════════════
     DOM REFERENCES
     ═══════════════════════════════════════════════════════════════ */
  const arcStage     = document.getElementById('arcStage');
  const prevBtn      = document.getElementById('arcPrev');
  const nextBtn      = document.getElementById('arcNext');
  const arcCounter   = document.getElementById('arcCounter');

  // Inline details panel
  const detailsInfoCol  = document.getElementById('detailsInfoCol');
  const detailsCategory = document.getElementById('detailsCategory');
  const detailsTitle    = document.getElementById('detailsTitle');
  const detailsClient   = document.getElementById('detailsClient');
  const detailsYear     = document.getElementById('detailsYear');
  const detailsLocation = document.getElementById('detailsLocation');
  const detailsSpecs    = document.getElementById('detailsSpecs');
  const detailsRooms    = document.getElementById('detailsRooms');
  const detailsMaterials= document.getElementById('detailsMaterials');

  // Reviews
  const reviewsTrack  = document.getElementById('reviewsTrack');

  // Slider
  const detailsSlider = document.getElementById('detailsSlider');
  const sliderDotsEl  = document.getElementById('sliderDots');
  const progressEl    = document.getElementById('sliderProgress');

  /* ═══════════════════════════════════════════════════════════════
     ARC SCROLLER
     ═══════════════════════════════════════════════════════════════ */
  const CARD_STEP = 185;
  const ARC_R     = 680;
  let   activeIndex = 0;
  let   arcCards    = [];

  /* Parabolic y-dip: y = R - sqrt(R² - x²) */
  function arcDip(absOffset) {
    const x = absOffset * CARD_STEP;
    if (x >= ARC_R) return 250;
    return ARC_R - Math.sqrt(ARC_R * ARC_R - x * x);
  }

  function buildArcCards() {
    projects.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'arc-card';
      card.dataset.index = i;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View ${p.title}`);
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <img class="arc-card-img" src="${p.thumb}" alt="${p.title}" loading="lazy">
        <div class="arc-card-overlay">
          <span class="arc-card-cat">${p.category}</span>
          <span class="arc-card-name">${p.title}</span>
        </div>
      `;
      card.addEventListener('click',   () => renderArc(i));
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') renderArc(i); });
      arcStage.appendChild(card);
      arcCards.push(card);
    });
  }

  function renderArc(newIndex, animate = true) {
    activeIndex = Math.max(0, Math.min(newIndex, projects.length - 1));

    arcCards.forEach((card, i) => {
      const offset   = i - activeIndex;
      const absOff   = Math.abs(offset);
      const x        = offset * CARD_STEP;
      const y        = Math.min(arcDip(absOff), 235);
      const scale    = Math.max(0.7, 1 - absOff * 0.065);
      const rotation = offset * 5.5;
      const opacity  = absOff > 2.85 ? 0 : Math.max(0.25, 1 - absOff * 0.18);

      gsap.to(card, {
        x, y, scale, rotation, opacity,
        duration: animate ? 0.72 : 0,
        ease: 'power3.inOut',
        overwrite: true,
      });

      card.classList.toggle('active', i === activeIndex);
    });

    arcCounter.textContent = `${activeIndex + 1} / ${projects.length}`;
    prevBtn.disabled = activeIndex === 0;
    nextBtn.disabled = activeIndex === projects.length - 1;

    updateDetails(activeIndex, animate);
  }

  /* ─── Arrow buttons & keyboard ──────────────────────────────── */
  prevBtn.addEventListener('click', () => { if (activeIndex > 0) renderArc(activeIndex - 1); });
  nextBtn.addEventListener('click', () => { if (activeIndex < projects.length - 1) renderArc(activeIndex + 1); });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });

  /* ═══════════════════════════════════════════════════════════════
     INLINE DETAILS PANEL
     ═══════════════════════════════════════════════════════════════ */
  function updateDetails(index, animate) {
    const p   = projects[index];
    const dur = animate ? 0.28 : 0;

    // Animate info column out, populate, animate in
    const infoTargets = [
      detailsCategory, detailsTitle,
      detailsClient, detailsYear, detailsLocation,
      detailsSpecs, detailsRooms, detailsMaterials,
    ];

    gsap.to(infoTargets, {
      opacity: 0, y: -10, duration: dur, stagger: 0,
      onComplete() {
        // Populate text
        detailsCategory.textContent = p.category;
        detailsTitle.textContent    = p.title;
        detailsClient.textContent   = p.client;
        detailsYear.textContent     = p.year;
        detailsLocation.textContent = p.location;

        // Specs grid
        const specs = [
          { label: 'Style',  value: p.style  },
          { label: 'Area',   value: p.area   },
          { label: 'Budget', value: p.budget },
          { label: 'Year',   value: p.year   },
        ];
        detailsSpecs.innerHTML = specs.map(s => `
          <div class="spec-item">
            <p class="spec-label">${s.label}</p>
            <p class="spec-value">${s.value}</p>
          </div>
        `).join('');

        // Room tags
        detailsRooms.innerHTML = p.rooms.map(r =>
          `<span class="room-tag"><i class="fa-solid fa-door-open"></i>${r}</span>`
        ).join('');

        // Material tags
        detailsMaterials.innerHTML = p.materials.map(m =>
          `<span class="material-tag"><i class="fa-solid fa-gem"></i>${m}</span>`
        ).join('');

        // Animate back in with stagger
        gsap.fromTo(infoTargets,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: dur + 0.35, stagger: 0.04, ease: 'power2.out' }
        );
      },
    });

    // Restart photo slider with new project's photos
    startSlider(p.photos);

    // Update reviews
    renderReviews(p.reviews, animate);
  }

  /* Build star HTML for a given rating (1-5) */
  function starsHTML(rating) {
    return Array.from({ length: 5 }, (_, i) =>
      `<i class="fa-solid fa-star${i < rating ? '' : ' empty'}"></i>`
    ).join('');
  }

  function renderReviews(reviews, animate) {
    const dur = animate ? 0.28 : 0;

    gsap.to(reviewsTrack, {
      opacity: 0, y: -8, duration: dur,
      onComplete() {
        reviewsTrack.innerHTML = reviews.map(r => `
          <div class="review-card">
            <div class="review-stars">${starsHTML(r.rating)}</div>
            <p class="review-quote">${r.quote}</p>
            <div class="review-author">
              <div class="review-avatar">${r.name.charAt(0)}</div>
              <div>
                <p class="review-name">${r.name}</p>
                <p class="review-date">${r.date}</p>
              </div>
            </div>
          </div>
        `).join('');

        gsap.fromTo(reviewsTrack,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: dur + 0.4, ease: 'power2.out' }
        );
      },
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     PHOTO SLIDER (inline, inside .details-slider)
     ═══════════════════════════════════════════════════════════════ */
  const SLIDE_DUR  = 4;
  let   sliderTimer  = null;
  let   sliderIdx    = 0;
  let   sliderSlides = [];
  let   sliderDots   = [];

  function buildSlider(photos) {
    detailsSlider.querySelectorAll('.details-slide').forEach(s => s.remove());
    sliderDotsEl.innerHTML = '';
    sliderSlides = [];
    sliderDots   = [];

    photos.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'details-slide';
      slide.innerHTML = `<img src="${src}" alt="Project photo ${i + 1}" loading="${i === 0 ? 'eager' : 'lazy'}">`;
      detailsSlider.insertBefore(slide, progressEl);
      sliderSlides.push(slide);

      const dot = document.createElement('button');
      dot.className = 'slider-dot';
      dot.setAttribute('aria-label', `Photo ${i + 1}`);
      sliderDotsEl.appendChild(dot);
      sliderDots.push(dot);
    });
  }

  function goToSlide(next) {
    const prev = sliderIdx;
    sliderIdx = ((next % sliderSlides.length) + sliderSlides.length) % sliderSlides.length;

    gsap.to(sliderSlides[prev],  { opacity: 0, duration: 0.75, ease: 'power2.inOut' });
    gsap.fromTo(sliderSlides[sliderIdx],
      { opacity: 0 },
      { opacity: 1, duration: 0.75, ease: 'power2.inOut' }
    );

    sliderDots.forEach((d, i) => d.classList.toggle('active', i === sliderIdx));
    resetProgress();
  }

  function resetProgress() {
    gsap.killTweensOf(progressEl);
    gsap.fromTo(progressEl, { width: '0%' }, { width: '100%', duration: SLIDE_DUR, ease: 'none' });
  }

  function startSlider(photos) {
    stopSlider();
    buildSlider(photos);

    sliderIdx = 0;
    gsap.set(sliderSlides, { opacity: 0 });
    if (sliderSlides[0]) gsap.set(sliderSlides[0], { opacity: 1 });
    if (sliderDots[0])   sliderDots[0].classList.add('active');

    resetProgress();
    sliderTimer = setInterval(() => goToSlide(sliderIdx + 1), SLIDE_DUR * 1000);

    detailsSlider.addEventListener('mouseenter', pauseSlider,  { passive: true });
    detailsSlider.addEventListener('mouseleave', resumeSlider, { passive: true });

    sliderDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        clearInterval(sliderTimer);
        goToSlide(i);
        sliderTimer = setInterval(() => goToSlide(sliderIdx + 1), SLIDE_DUR * 1000);
      });
    });
  }

  function pauseSlider() {
    clearInterval(sliderTimer);
    gsap.killTweensOf(progressEl);
  }

  function resumeSlider() {
    resetProgress();
    sliderTimer = setInterval(() => goToSlide(sliderIdx + 1), SLIDE_DUR * 1000);
  }

  function stopSlider() {
    clearInterval(sliderTimer);
    sliderTimer = null;
    gsap.killTweensOf(progressEl);
    detailsSlider.removeEventListener('mouseenter', pauseSlider);
    detailsSlider.removeEventListener('mouseleave', resumeSlider);
  }

  /* ═══════════════════════════════════════════════════════════════
     INITIALISE
     ═══════════════════════════════════════════════════════════════ */
  buildArcCards();
  renderArc(0, false);

}());
