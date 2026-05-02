(function () {
  'use strict';

  /* ─── GSAP plugin + AOS Init ────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);
  AOS.init({ once: true, duration: 750, easing: 'ease-out-cubic', offset: 80 });

  /* ═══════════════════════════════════════════════════════════════
     PROJECT DATA  (placeholder — swap in real photos + details)
     ═══════════════════════════════════════════════════════════════ */
  const projects = [
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
    },
  ];

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
