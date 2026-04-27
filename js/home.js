(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  /* ─── AOS init ───────────────────────────────────────────────── */
  AOS.init({
    once:     true,
    duration: 750,
    easing:   'ease-out-cubic',
    offset:   80,
  });

  /* ─── Gold Particles ─────────────────────────────────────────── */
  const particleContainer = document.getElementById('heroParticles');
  const scrollIndicator   = document.getElementById('scrollIndicator');

  (function createParticles() {
    for (let i = 0; i < 28; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');
      p.style.setProperty('--x',        (Math.random() * 100) + '%');
      p.style.setProperty('--size',     (4 + Math.random() * 8) + 'px');
      p.style.setProperty('--duration', (4 + Math.random() * 5) + 's');
      p.style.setProperty('--delay',    -(Math.random() * 7)    + 's');
      p.style.setProperty('--distance', (180 + Math.random() * 220) + 'px');
      particleContainer.appendChild(p);
    }
    particleContainer.classList.add('active');
  })();

  /* ─────────────────────────────────────────────────────────────
     Hero loop:
       Act 1  — dark screen, brand name glows in
                background: still hidden (empty room not yet shown)
       Act 2  — background fades in DESATURATED (grayscale) →
                visually: a bare, empty room
       Act 3  — background cross-fades to FULL COLOR →
                visually: the designed, finished interior
     On reset: color stripped back out, opacity zeroed, repeat.
     ───────────────────────────────────────────────────────────── */
  const heroTl = gsap.timeline({ delay: 0.2, repeat: -1 });

  /* --- Act 1: brand name focuses in (room still dark) ----------- */
  heroTl
    .to('#act1 .act-eyebrow', {
      opacity:  1,
      duration: 0.8,
      ease:     'power2.out',
    })
    .to('#act1 .act1-title', {
      opacity:       1,
      letterSpacing: '0.05em',
      filter:        'blur(0px)',
      duration:      1.2,
      ease:          'power3.out',
    }, '-=0.3')
    .to({}, { duration: 1.2 })

  /* --- Transition act 1 → act 2: empty room fades in (grey) ----- */
    .to('#act1', { opacity: 0, y: -40, duration: 0.6, ease: 'power2.in' })
    /* Room appears desaturated — looks like a bare, empty space */
    .to('#heroBg', {
      opacity:  0.5,
      filter:   'grayscale(1) brightness(0.55) contrast(0.9)',
      duration: 1.2,
      ease:     'power2.out',
    }, '<')
    .set('#act2', { opacity: 1, pointerEvents: 'auto' })
    .to('#act2 .act-eyebrow', { opacity: 1, duration: 0.5 })
    .fromTo('#act2 .act2-title',
      { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
      { clipPath: 'inset(0 0% 0 0)',   duration: 1, ease: 'power2.inOut' },
      '-=0.2'
    )
    .to({}, { duration: 1.2 })

  /* --- Transition act 2 → act 3: room bursts into full color ---- */
    .to('#act2', { opacity: 0, y: -40, duration: 0.6, ease: 'power2.in' })
    /* Colour floods in — the interior design is "revealed" */
    .to('#heroBg', {
      opacity:  0.75,
      filter:   'grayscale(0) brightness(1) contrast(1)',
      duration: 1.8,
      ease:     'power2.inOut',
    }, '-=0.3')
    .set('#act3', { opacity: 1, pointerEvents: 'auto' })
    .to(scrollIndicator, { opacity: 0, duration: 0.3 })
    .to('.act3-content', {
      opacity:  1,
      y:        0,
      duration: 0.9,
      ease:     'power3.out',
    })
    /* Hold at full-colour act 3 */
    .to({}, { duration: 2 })

  /* --- Loop reset: strip colour, fade out, restore initial state - */
    .to('.act3-content', {
      opacity:  0,
      y:        30,
      duration: 0.7,
      ease:     'power2.in',
    })
    /* Simultaneously pull room back to grey then to invisible */
    .to('#heroBg', {
      filter:   'grayscale(1) brightness(0.55) contrast(0.9)',
      duration: 0.6,
    }, '<')
    .to('#heroBg', { opacity: 0, duration: 0.7 }, '-=0.2')
    .set('#act3',              { opacity: 0, pointerEvents: 'none' })
    .set('.act3-content',      { opacity: 0, y: 60 })
    .set('#heroBg',            { filter: 'grayscale(1) brightness(0.55) contrast(0.9)' })
    .set('#act2',              { opacity: 0, pointerEvents: 'none', y: 0 })
    .set('#act2 .act-eyebrow', { opacity: 0 })
    .set('#act2 .act2-title',  { clipPath: 'inset(0 100% 0 0)' })
    .set('#act1',              { opacity: 1, y: 0 })
    .set('#act1 .act-eyebrow', { opacity: 0 })
    .set('#act1 .act1-title',  { opacity: 0.3, letterSpacing: '0.5em', filter: 'blur(8px)' })
    .to(scrollIndicator, { opacity: 1, duration: 0.5 })
    .to({}, { duration: 0.8 });

  /* ─── Stats counter animation ────────────────────────────────── */
  document.querySelectorAll('.stat-number').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';

    ScrollTrigger.create({
      trigger:    el,
      start:      'top 85%',
      once:       true,
      onEnter() {
        const obj = { val: 0 };
        gsap.to(obj, {
          val:      target,
          duration: 2,
          ease:     'power1.out',
          onUpdate() {
            el.textContent = Math.ceil(obj.val) + suffix;
          },
          onComplete() {
            el.textContent = target + suffix;
          },
        });
      },
    });
  });

}());
