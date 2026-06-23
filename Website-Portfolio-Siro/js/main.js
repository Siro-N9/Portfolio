/* ============================================================
   SIRO PORTFOLIO — main.js
   Requires: GSAP 3 + ScrollTrigger (loaded before this file)
   ============================================================ */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  /* ----------------------------------------------------------
     CUSTOM CURSOR
     ---------------------------------------------------------- */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (dot && ring && window.matchMedia('(pointer: fine)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      gsap.to(dot, { x: mx, y: my, duration: 0.06, ease: 'none' });
    });

    (function lerpRing() {
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(lerpRing);
    })();

    // Hover states
    const hoverEls = document.querySelectorAll('a, button, .work-item, .hobby-photo, .work-item-cta, .work-item-sound');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });

    const textEls = document.querySelectorAll('h1, h2, h3, p');
    textEls.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-text'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-text'));
    });

    // Hide cursor when leaving viewport
    document.addEventListener('mouseleave', () => {
      gsap.to([dot, ring], { opacity: 0, duration: 0.25 });
    });
    document.addEventListener('mouseenter', () => {
      gsap.to([dot, ring], { opacity: 1, duration: 0.25 });
    });
  }

  /* ----------------------------------------------------------
     LOADER  →  HERO animation chain
     ---------------------------------------------------------- */
  function runLoader() {
    const loader = document.getElementById('loader');
    const chars  = loader.querySelectorAll('.char');
    const line   = loader.querySelector('.loader-line');

    const tl = gsap.timeline({
      onComplete: revealNav,
    });

    // Characters stagger in
    tl.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.09,
      ease: 'power3.out',
    });

    // Line draws in
    tl.to(line, {
      scaleX: 1,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.2');

    // Brief hold
    tl.to({}, { duration: 0.55 });

    // Slide loader up — reveal page beneath
    tl.to(loader, {
      yPercent: -100,
      duration: 0.85,
      ease: 'power4.inOut',
      onComplete: () => {
        loader.style.display = 'none';
        document.body.classList.remove('is-loading');
      },
    });
  }

  /* ----------------------------------------------------------
     NAV REVEAL (fires when loader is gone)
     ---------------------------------------------------------- */
  function revealNav() {
    const logo  = document.querySelector('.nav-logo');
    const links = document.querySelector('.nav-links');

    gsap.fromTo([logo, links],
      { opacity: 0, y: -16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        onComplete: revealHero,
      }
    );
  }

  /* ----------------------------------------------------------
     HERO ANIMATION
     ---------------------------------------------------------- */
  function revealHero() {
    const chars   = document.querySelectorAll('.hero-title .char');
    const eyebrow = document.querySelector('.hero-eyebrow');
    const footer  = document.querySelector('.hero-footer');
    const scroll  = document.querySelector('.hero-scroll');

    // Set initial y positions so fromTo gives proper slide+fade
    gsap.set([eyebrow, footer, scroll], { y: 28 });

    const tl = gsap.timeline();

    tl.fromTo(eyebrow,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
    );

    tl.to(chars, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      stagger: 0.08,
      ease: 'power4.out',
    }, '-=0.35');

    tl.fromTo([footer, scroll],
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: 'power3.out' },
    '-=0.4');

    // Subtle parallax on hero video as user scrolls
    gsap.to('.hero-bg', {
      y: '18%',
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  /* ----------------------------------------------------------
     NAV — scroll state
     ---------------------------------------------------------- */
  const nav = document.getElementById('nav');

  ScrollTrigger.create({
    start: 'top -90',
    onUpdate: () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 90);
    },
  });

  /* ----------------------------------------------------------
     SMOOTH SCROLL for nav links (respects prefers-reduced-motion)
     ---------------------------------------------------------- */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (prefersReduced ? 0 : 0);
      window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });

  /* ----------------------------------------------------------
     SECTION REVEAL ANIMATIONS (ScrollTrigger)
     ---------------------------------------------------------- */

  // Generic fade-up utility
  function fadeUp(selector, opts = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    els.forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: opts.y ?? 50 },
        {
          opacity: 1,
          y: 0,
          duration: opts.duration ?? 1,
          ease: opts.ease ?? 'power3.out',
          delay: opts.delay ?? 0,
          scrollTrigger: {
            trigger: opts.trigger ?? el,
            start: opts.start ?? 'top 82%',
          },
        }
      );
    });
  }

  // Section headers
  document.querySelectorAll('.section-header').forEach(header => {
    gsap.fromTo(header.querySelector('.section-num'),
      { opacity: 0, x: -24 },
      { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: header, start: 'top 85%' } }
    );
    gsap.fromTo(header.querySelector('.section-title'),
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: header, start: 'top 85%' } }
    );
  });

  // About
  gsap.fromTo('.about-left',
    { opacity: 0, x: -56 },
    { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.about', start: 'top 78%' } }
  );
  gsap.fromTo('.about-right',
    { opacity: 0, x: 56 },
    { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.about', start: 'top 78%' } }
  );

  document.querySelectorAll('.stat-block').forEach((block, i) => {
    gsap.fromTo(block,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.7, delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about-stats', start: 'top 85%' } }
    );
  });

  // Work items — staggered reveal per item
  document.querySelectorAll('.work-item').forEach((item, idx) => {
    const isEven = idx % 2 === 1;

    gsap.fromTo(item.querySelector('.work-item-media'),
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 82%' } }
    );

    gsap.fromTo(item.querySelector('.work-item-info'),
      { opacity: 0, x: isEven ? -50 : 50 },
      { opacity: 1, x: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 82%' } }
    );
  });

  // Hobby grid — staggered reveal
  gsap.fromTo('.hobby-photo',
    { opacity: 0, scale: 0.94, y: 20 },
    {
      opacity: 1, scale: 1, y: 0,
      duration: 0.85,
      stagger: { amount: 0.9, from: 'start' },
      ease: 'power3.out',
      scrollTrigger: { trigger: '.hobby-grid', start: 'top 82%' },
    }
  );

  // Contact
  gsap.fromTo('.contact-eyebrow',
    { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact', start: 'top 80%' } }
  );

  gsap.fromTo('.contact-heading',
    { opacity: 0, y: 64 },
    { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out',
      scrollTrigger: { trigger: '.contact', start: 'top 78%' } }
  );

  gsap.fromTo('.contact-bottom',
    { opacity: 0, y: 32 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-bottom', start: 'top 88%' } }
  );

  /* ----------------------------------------------------------
     SOUND TOGGLE on work-item videos
     ---------------------------------------------------------- */
  document.querySelectorAll('.work-item-sound').forEach(btn => {
    const video = btn.closest('.work-item-media').querySelector('video');
    if (!video) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willUnmute = video.muted;
      if (willUnmute) {
        document.querySelectorAll('.work-item-sound').forEach(other => {
          const otherVideo = other.closest('.work-item-media').querySelector('video');
          if (otherVideo && otherVideo !== video) {
            otherVideo.muted = true;
            other.classList.add('is-muted');
            other.setAttribute('aria-pressed', 'true');
          }
        });
      }
      video.muted = !video.muted;
      btn.classList.toggle('is-muted', video.muted);
      btn.setAttribute('aria-pressed', String(video.muted));
    });
  });

  /* ----------------------------------------------------------
     MARQUEE — pause on hover (accessibility)
     ---------------------------------------------------------- */
  document.querySelectorAll('.marquee-wrap').forEach(wrap => {
    const track = wrap.querySelector('.marquee-track');
    wrap.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    wrap.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  });

  /* ----------------------------------------------------------
     INIT — kick off loader when DOM is ready
     ---------------------------------------------------------- */
  runLoader();

})();
