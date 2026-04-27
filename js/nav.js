(function () {
  'use strict';

  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('[data-mobile-link]');

  /* ─── Navbar entrance animation ─────────────────────────────── */
  const navTl = gsap.timeline({ delay: 0.2 });
  navTl
    .from(navbar, { y: -90, opacity: 0, duration: 0.7, ease: 'power3.out' })
    .from('.nav-logo', { opacity: 0, x: -20, duration: 0.5 }, '-=0.4')
    .from('.nav-link', { opacity: 0, y: -8, stagger: 0.08, duration: 0.4, ease: 'power2.out' }, '-=0.3');

  /* ─── Navbar scroll behaviour ────────────────────────────────── */
  const SCROLL_THRESHOLD = 80;

  function onScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* ─── Mobile menu toggle ─────────────────────────────────────── */
  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Stagger-animate each mobile link
    gsap.fromTo(mobileLinks,
      { x: 60, opacity: 0 },
      { x: 0, opacity: 1, stagger: 0.07, duration: 0.4, ease: 'power2.out', delay: 0.1 }
    );
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close menu when a mobile link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
  });

  /* ─── Smooth-scroll for hash links ──────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });

  /* ─── Page exit fade for cross-page links ────────────────────── */
  // Fade body in on load
  gsap.from('body', { opacity: 0, duration: 0.5, ease: 'power1.out' });

  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = link.getAttribute('href');
      gsap.to('body', {
        opacity: 0,
        duration: 0.3,
        ease: 'power1.in',
        onComplete: () => { window.location.href = href; }
      });
    });
  });

}());
