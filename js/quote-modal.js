(function () {
  'use strict';

  const modal = document.getElementById('quoteModal');
  if (!modal) return;

  const panel = modal.querySelector('.quote-panel');
  const steps = modal.querySelectorAll('.quote-step');
  const dots  = modal.querySelectorAll('.quote-step-dot');

  /* ─── Package definitions (Bangalore market) ─────────────── */
  const PACKAGES = {
    essential: {
      name: 'Essential',
      rate: 1800,
      tagline: 'Move-in ready basics',
      features: [
        'Pre-laminated finishes',
        'Basic modular kitchen with hob & chimney',
        'Standard handles & hinges',
        'Mid-range modular wardrobes',
        'Designer ceiling lighting',
      ],
    },
    premium: {
      name: 'Premium',
      rate: 2800,
      tagline: 'Most popular — balance of finish & price',
      popular: true,
      features: [
        'Veneer + acrylic finishes',
        'Soft-close hinges (Hettich / Häfele)',
        'Premium chimney, hob & built-in appliances',
        'Custom carpentry highlights',
        'Layered designer lighting',
      ],
    },
    luxe: {
      name: 'Luxe',
      rate: 4500,
      tagline: 'Bespoke craftsmanship & imported finishes',
      features: [
        'Solid wood + imported veneers',
        'Italian / German premium hardware',
        'Designer island kitchen with Miele / Bosch',
        'Custom joinery, fluted panels, brass detailing',
        'Smart-home & automation integration',
      ],
    },
  };

  /* ─── Sqft ranges (Bangalore typical) ────────────────────── */
  const SQFT_RANGES = {
    'Full Home': {
      '1BHK':       { min: 350,  max: 750,  default: 550  },
      '2BHK':       { min: 600,  max: 1200, default: 950  },
      '3BHK':       { min: 1000, max: 1900, default: 1450 },
      '4BHK+':      { min: 1700, max: 3500, default: 2200 },
      'Villa':      { min: 2000, max: 6000, default: 3500 },
      'Commercial': { min: 500,  max: 8000, default: 1500 },
    },
    'Kitchen Only': {
      '1BHK':       { min: 50,  max: 150, default: 80  },
      '2BHK':       { min: 60,  max: 180, default: 100 },
      '3BHK':       { min: 80,  max: 220, default: 140 },
      '4BHK+':      { min: 100, max: 280, default: 180 },
      'Villa':      { min: 120, max: 400, default: 220 },
      'Commercial': { min: 80,  max: 500, default: 150 },
    },
    'Living + Dining': {
      '1BHK':       { min: 100, max: 250,  default: 180 },
      '2BHK':       { min: 180, max: 400,  default: 280 },
      '3BHK':       { min: 250, max: 550,  default: 380 },
      '4BHK+':      { min: 350, max: 800,  default: 500 },
      'Villa':      { min: 450, max: 1200, default: 700 },
      'Commercial': { min: 200, max: 1000, default: 350 },
    },
    'Bedroom Only': {
      '1BHK':       { min: 80,  max: 180, default: 110 },
      '2BHK':       { min: 90,  max: 220, default: 130 },
      '3BHK':       { min: 100, max: 250, default: 150 },
      '4BHK+':      { min: 120, max: 300, default: 180 },
      'Villa':      { min: 150, max: 400, default: 220 },
      'Commercial': { min: 90,  max: 220, default: 130 },
    },
  };

  const SCOPE_LABEL = {
    'Full Home':       'Total Carpet Area',
    'Kitchen Only':    'Kitchen Area',
    'Living + Dining': 'Living + Dining Area',
    'Bedroom Only':    'Bedroom Area',
  };

  // Hethvik's WhatsApp number (country code + number, no +)
  const WHATSAPP_NUMBER = '919704520901';

  const state = {
    property: null,
    scope:    null,
    sqft:     null,
    package:  null,
    name:     '',
    phone:    '',
    city:     'Bangalore',
    timeline: '1-3 months',
  };

  /* ─── Open / close ───────────────────────────────────────── */
  function openModal() {
    resetState();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    goStep(1);
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('[data-quote-open]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      openModal();
    });
  });

  modal.querySelectorAll('[data-quote-close]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  /* ─── Step navigation ────────────────────────────────────── */
  function goStep(n) {
    steps.forEach(s => {
      const num = parseInt(s.dataset.step, 10);
      s.classList.toggle('active', num === n);
      if (num === n) s.removeAttribute('hidden');
      else s.setAttribute('hidden', '');
    });
    dots.forEach(d => {
      const num = parseInt(d.dataset.step, 10);
      d.classList.toggle('active', num === n);
      d.classList.toggle('done', num < n);
    });
    if (n === 2) initStep2();
    if (n === 4) renderQuote();
    panel.scrollTop = 0;
  }

  modal.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const target = parseInt(btn.dataset.go, 10);
      if (target === 2 && !(state.property && state.scope)) return;
      if (target === 3 && !(state.sqft && state.package)) return;
      if (target === 4 && !validateContact()) return;
      goStep(target);
    });
  });

  /* ─── Step 1: property + scope ───────────────────────────── */
  modal.querySelectorAll('.quote-options').forEach(group => {
    const field = group.dataset.field;
    group.querySelectorAll('.quote-option').forEach(opt => {
      opt.addEventListener('click', () => {
        group.querySelectorAll('.quote-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        state[field] = opt.dataset.value;
        checkStep1Complete();
      });
    });
  });

  function checkStep1Complete() {
    const next = modal.querySelector('.quote-step[data-step="1"] .quote-next');
    next.disabled = !(state.property && state.scope);
  }

  /* ─── Step 2: sqft + package ─────────────────────────────── */
  const sqftSlider     = document.getElementById('qSqft');
  const sqftValueEl    = document.getElementById('qSqftValue');
  const sqftMinEl      = document.getElementById('qSqftMin');
  const sqftMaxEl      = document.getElementById('qSqftMax');
  const sqftLabelEl    = document.getElementById('qSqftLabel');
  const packageButtons = modal.querySelectorAll('.quote-package');

  function initStep2() {
    const cfg = SQFT_RANGES[state.scope] && SQFT_RANGES[state.scope][state.property];
    if (!cfg) return;

    sqftSlider.min   = cfg.min;
    sqftSlider.max   = cfg.max;
    sqftSlider.step  = cfg.max > 1000 ? 25 : 10;
    sqftSlider.value = cfg.default;
    state.sqft       = cfg.default;

    sqftValueEl.textContent = cfg.default.toLocaleString('en-IN');
    sqftMinEl.textContent   = cfg.min.toLocaleString('en-IN');
    sqftMaxEl.textContent   = cfg.max.toLocaleString('en-IN') + ' sqft';
    sqftLabelEl.textContent = SCOPE_LABEL[state.scope] || 'Carpet Area';

    checkStep2Complete();
  }

  sqftSlider.addEventListener('input', () => {
    state.sqft = parseInt(sqftSlider.value, 10);
    sqftValueEl.textContent = state.sqft.toLocaleString('en-IN');
    checkStep2Complete();
  });

  packageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      packageButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.package = btn.dataset.package;
      checkStep2Complete();
    });
  });

  function checkStep2Complete() {
    const next = modal.querySelector('.quote-step[data-step="2"] .quote-next');
    next.disabled = !(state.sqft && state.package);
  }

  /* ─── Step 3: contact ────────────────────────────────────── */
  const nameInput     = document.getElementById('qName');
  const phoneInput    = document.getElementById('qPhone');
  const cityInput     = document.getElementById('qCity');
  const timelineInput = document.getElementById('qTimeline');

  function validateContact() {
    state.name     = nameInput.value.trim();
    state.phone    = phoneInput.value.trim().replace(/\D/g, '');
    state.city     = cityInput.value.trim();
    state.timeline = timelineInput.value;

    if (!state.name) { nameInput.focus(); return false; }
    if (!/^[6-9]\d{9}$/.test(state.phone)) { phoneInput.focus(); return false; }
    if (!state.city) { cityInput.focus(); return false; }
    return true;
  }

  function liveCheckStep3() {
    const ok = nameInput.value.trim()
            && /^[6-9]\d{9}$/.test(phoneInput.value.trim().replace(/\D/g, ''))
            && cityInput.value.trim();
    modal.querySelector('.quote-step[data-step="3"] .quote-next').disabled = !ok;
  }

  [nameInput, phoneInput, cityInput].forEach(input => {
    input.addEventListener('input', liveCheckStep3);
  });

  /* ─── Step 4: render quote ───────────────────────────────── */
  function renderQuote() {
    const pkg     = PACKAGES[state.package];
    const total   = state.sqft * pkg.rate;
    const lakhs   = (total / 100000).toFixed(1);

    const titleEl       = modal.querySelector('.quote-result-title');
    const tagEl         = document.getElementById('qPackageTag');
    const rangeEl       = document.getElementById('qRange');
    const breakdownEl   = document.getElementById('qBreakdown');
    const highlightsEl  = document.getElementById('qHighlights');
    const summaryEl     = document.getElementById('qSummary');
    const waEl          = document.getElementById('qWhatsapp');

    titleEl.innerHTML = `${escapeHtml(state.property)} &middot; <em>${escapeHtml(state.scope)}</em>`;
    tagEl.textContent = `${pkg.name} Package`;
    rangeEl.textContent = `₹${lakhs} L`;
    breakdownEl.innerHTML = `${state.sqft.toLocaleString('en-IN')} sqft &times; ₹${pkg.rate.toLocaleString('en-IN')}/sqft`;

    highlightsEl.innerHTML = pkg.features
      .slice(0, 4)
      .map(f => `<li><i class="fa-solid fa-check"></i> ${escapeHtml(f)}</li>`)
      .join('');

    summaryEl.innerHTML = `
      <div><strong>Name</strong> <span>${escapeHtml(state.name)}</span></div>
      <div><strong>Phone</strong> <span>+91 ${escapeHtml(state.phone)}</span></div>
      <div><strong>City</strong> <span>${escapeHtml(state.city)}</span></div>
      <div><strong>Move-in</strong> <span>${escapeHtml(state.timeline)}</span></div>
    `;

    const lines = [
      `Hi Hethvik Interiors! I'd like a free quote.`,
      ``,
      `Property: ${state.property}`,
      `Scope: ${state.scope}`,
      `Area: ${state.sqft.toLocaleString('en-IN')} sqft`,
      `Package: ${pkg.name} (₹${pkg.rate.toLocaleString('en-IN')}/sqft)`,
      `Estimated: ₹${lakhs} L`,
      ``,
      `Name: ${state.name}`,
      `Phone: +91 ${state.phone}`,
      `City: ${state.city}`,
      `Move-in: ${state.timeline}`,
    ];
    waEl.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
    ));
  }

  /* ─── Reset ──────────────────────────────────────────────── */
  function resetState() {
    state.property = null;
    state.scope    = null;
    state.sqft     = null;
    state.package  = null;
    modal.querySelectorAll('.quote-option').forEach(o => o.classList.remove('selected'));
    modal.querySelectorAll('.quote-package').forEach(o => o.classList.remove('selected'));
    checkStep1Complete();
    if (nameInput)  nameInput.value  = '';
    if (phoneInput) phoneInput.value = '';
    if (cityInput)  cityInput.value  = 'Bangalore';
    if (timelineInput) timelineInput.value = '1-3 months';
    liveCheckStep3();
  }

  modal.querySelector('.quote-restart').addEventListener('click', () => {
    resetState();
    goStep(1);
  });

  /* ─── Auto-open when user reaches Contact section ─────────── */
  const contactSection = document.getElementById('contact');
  if (contactSection && 'IntersectionObserver' in window) {
    let autoTriggered = false;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !autoTriggered) {
          autoTriggered = true;
          obs.disconnect();
          setTimeout(() => {
            if (!modal.classList.contains('open')) openModal();
          }, 1500);
        }
      });
    }, { threshold: 0.35 });
    obs.observe(contactSection);
  }

}());
