/**
 * ALDERSONVOID — PREMIUM PERSONAL IDENTITY
 * Interaction & Motion Controller (Zero Forced Reflow)
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------------------
   * 1. Below-the-Fold Scroll Reveal (Intersection Observer Only — No Reflow)
   * ------------------------------------------------------------------------ */
  function initScrollReveal() {
    const fadeElements = document.querySelectorAll('.fade-in');
    if (!fadeElements.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      fadeElements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            const delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
            if (delay > 0) {
              setTimeout(() => entry.target.classList.add('is-visible'), Math.min(delay, 240));
            } else {
              entry.target.classList.add('is-visible');
            }
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.01,
        rootMargin: '90px 0px 90px 0px',
      }
    );

    fadeElements.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------------
   * 2. Unified Pointer Tracking (Ambient Glow + Minimal Cursor Ring)
   * ------------------------------------------------------------------------ */
  function initPointerEffects() {
    if (prefersReducedMotion || !hasFinePointer) return;

    const glow = document.getElementById('mouse-glow');
    const ring = document.getElementById('cursor-ring');
    if (!glow && !ring) return;

    let targetX = 0;
    let targetY = 0;
    let glowX = 0;
    let glowY = 0;
    let ringX = 0;
    let ringY = 0;
    let visible = false;
    let rafId = null;

    function tick() {
      let needsNextFrame = false;

      if (glow) {
        const dx = targetX - glowX;
        const dy = targetY - glowY;
        glowX += dx * 0.12;
        glowY += dy * 0.12;
        glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
        if (Math.abs(dx) > 0.25 || Math.abs(dy) > 0.25) needsNextFrame = true;
      }

      if (ring) {
        const dx = targetX - ringX;
        const dy = targetY - ringY;
        ringX += dx * 0.2;
        ringY += dy * 0.2;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        if (Math.abs(dx) > 0.25 || Math.abs(dy) > 0.25) needsNextFrame = true;
      }

      if (needsNextFrame && visible) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }

    window.addEventListener(
      'mousemove',
      (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!visible) {
          visible = true;
          glowX = ringX = targetX;
          glowY = ringY = targetY;
          if (glow) glow.style.opacity = '1';
          if (ring) ring.style.opacity = '1';
        }
        if (!rafId) {
          rafId = requestAnimationFrame(tick);
        }
      },
      { passive: true }
    );

    document.addEventListener('mouseleave', () => {
      visible = false;
      if (glow) glow.style.opacity = '0';
      if (ring) ring.style.opacity = '0';
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });

    if (ring) {
      const interactiveSelector = 'a, button, .list-entry';
      document.addEventListener('mouseover', (e) => {
        ring.classList.toggle('is-active', Boolean(e.target.closest(interactiveSelector)));
      });
    }
  }

  /* ------------------------------------------------------------------------
   * 3. Scroll Effects (Deferred to Scroll Interaction — Zero Load Reflow)
   * ------------------------------------------------------------------------ */
  function initScrollEffects() {
    const bar = document.getElementById('scroll-progress');
    const header = document.querySelector('.site-header');
    const rings = document.querySelector('.void-rings');
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

      if (bar) {
        bar.style.transform = `scaleX(${ratio})`;
      }
      if (header) {
        header.classList.toggle('is-scrolled', y > 36);
      }
      if (rings && !prefersReducedMotion) {
        rings.style.setProperty('--py', `${Math.min(y * 0.1, 140)}px`);
      }

      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------------
   * 4. Live UTC Telemetry Clock
   * ------------------------------------------------------------------------ */
  function initUtcClock() {
    const clockEl = document.getElementById('utc-clock');
    if (!clockEl) return;

    function updateTime() {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      clockEl.textContent = `${hours}:${minutes}`;
    }

    updateTime();
    setInterval(updateTime, 1000 * 30);
  }

  /* ------------------------------------------------------------------------
   * 5. Back to Top Smooth Interaction
   * ------------------------------------------------------------------------ */
  function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;

    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    });
  }

  /* ------------------------------------------------------------------------
   * 6. Console Digital Signature
   * ------------------------------------------------------------------------ */
  function printIdentitySignature() {
    const signature = `
%c  AldersonVoid  %c  Beyond the Interface.  
%c  Somewhere between code and the unknown.  
%c  Identity: aldersonvoid.github.io
`;
    console.log(
      signature,
      'background: #E63946; color: #FFFFFF; font-weight: bold; padding: 4px 8px; border-radius: 2px; font-family: monospace;',
      'background: #0D0E12; color: #F0F0F0; padding: 4px 8px; font-family: monospace;',
      'color: #8A8F98; font-family: monospace; font-size: 11px;',
      'color: #808590; font-family: monospace; font-size: 10px;'
    );
  }

  /* ------------------------------------------------------------------------
   * Initialization
   * ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initScrollEffects();
    initPointerEffects();
    initUtcClock();
    initBackToTop();
    printIdentitySignature();
  });
})();
