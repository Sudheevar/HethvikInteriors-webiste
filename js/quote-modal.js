(function () {
  'use strict';

  const modal = document.getElementById('quoteModal');
  if (!modal) return;

  const panel = modal.querySelector('.quote-panel');
  const steps = modal.querySelectorAll('.quote-step');
  const dots  = modal.querySelectorAll('.quote-step-dot');

  // Hyderabad market price bands in ₹ lakhs — adjust to match Hethvik's actual rates
  const PRICES = {
    '1BHK':       { 'Full Home': [3, 5],   'Kitchen Only': [1.5, 3], 'Living + Dining': [1.5, 2.5], 'Bedroom Only': [1, 2] },
    '2BHK':       { 'Full Home': [5, 8],   'Kitchen Only': [2, 4],   'Living + Dining': [2, 3.5],   'Bedroom Only': [1.2, 2.5] },
    '3BHK':       { 'Full Home': [8, 12],  'Kitchen Only': [2.5, 5], 'Living + Dining': [2.5, 4],   'Bedroom Only': [1.5, 3] },
    '4BHK+':      { 'Full Home': [12, 20], 'Kitchen Only': [3, 6],   'Living + Dining': [3, 5],     'Bedroom Only': [1.8, 3.5] },
    'Villa':      { 'Full Home': [20, 40], 'Kitchen Only': [4, 8],   'Living + Dining': [4, 7],     'Bedroom Only': [2, 4] },
    'Commercial': null,
  };

  // Replace with Hethvik's actual WhatsApp number (country code + number, no +)
  const WHATSAPP_NUMBER = '919876543210';

  const state = {
    property: null,
    scope:    null,
    name:     '',
    phone:    '',
    city:     'Hyderabad',
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
    if (n === 3) renderQuote();
    panel.scrollTop = 0;
  }

  modal.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const target = parseInt(btn.dataset.go, 10);
      if (target === 2 && !(state.property && state.scope)) return;
      if (target === 3 && !validateContact()) return;
      goStep(target);
    });
  });

  /* ─── Option selection (step 1) ──────────────────────────── */
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

  /* ─── Contact validation (step 2) ────────────────────────── */
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

  function liveCheckStep2() {
    const ok = nameInput.value.trim()
            && /^[6-9]\d{9}$/.test(phoneInput.value.trim().replace(/\D/g, ''))
            && cityInput.value.trim();
    modal.querySelector('.quote-step[data-step="2"] .quote-next').disabled = !ok;
  }

  [nameInput, phoneInput, cityInput].forEach(input => {
    input.addEventListener('input', liveCheckStep2);
  });

  /* ─── Render quote (step 3) ──────────────────────────────── */
  function renderQuote() {
    const titleEl   = modal.querySelector('.quote-result-title');
    const rangeEl   = document.getElementById('qRange');
    const summaryEl = document.getElementById('qSummary');
    const waEl      = document.getElementById('qWhatsapp');

    titleEl.innerHTML = `${escapeHtml(state.property)} &middot; <em>${escapeHtml(state.scope)}</em>`;

    const band = PRICES[state.property] && PRICES[state.property][state.scope];
    rangeEl.textContent = band ? `₹${band[0]}–${band[1]} L` : 'Custom Quote';

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

  /* ─── Restart ────────────────────────────────────────────── */
  function resetState() {
    state.property = null;
    state.scope    = null;
    modal.querySelectorAll('.quote-option').forEach(o => o.classList.remove('selected'));
    checkStep1Complete();
    if (nameInput)  nameInput.value  = '';
    if (phoneInput) phoneInput.value = '';
    if (cityInput)  cityInput.value  = 'Hyderabad';
    liveCheckStep2();
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
