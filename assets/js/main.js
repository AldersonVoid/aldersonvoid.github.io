/**
 * ALDERSONVOID — PREMIUM PERSONAL IDENTITY
 * Interaction & Motion Controller
 */

(function () {
  'use strict';

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
   * 1. Scroll Reveal Animations (Intersection Observer)
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
          if (entry.isIntersecting) {
            const delay = entry.target.getAttribute('data-delay') || 0;
            if (delay > 0) {
              setTimeout(() => {
                entry.target.classList.add('is-visible');
              }, parseInt(delay, 10));
            } else {
              entry.target.classList.add('is-visible');
            }
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    fadeElements.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------------
   * 2. Subtle Ambient Mouse Tracking
   * ------------------------------------------------------------------------ */
  function initMouseGlow() {
    if (prefersReducedMotion) return;
    const glow = document.getElementById('mouse-glow');
    if (!glow) return;

    // Check if device supports hover / fine pointer
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let hasMoved = false;
    let animationFrameId = null;

    function onMouseMove(e) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        glow.style.opacity = '1';
      }
    }

    function render() {
      // Smooth interpolation (damping)
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      animationFrameId = requestAnimationFrame(render);
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(render);

    document.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
      hasMoved = false;
    });
  }

  /* ------------------------------------------------------------------------
   * 3. Live UTC Telemetry Clock
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
   * 4. Back to Top Smooth Interaction
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
   * 5. Header Border Dynamics on Scroll
   * ------------------------------------------------------------------------ */
  function initHeaderScrollState() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            if (window.scrollY > 40) {
              header.style.borderBottomColor = 'rgba(255, 255, 255, 0.12)';
            } else {
              header.style.borderBottomColor = 'var(--border-subtle)';
            }
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
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
      'color: #858990; font-family: monospace; font-size: 11px;',
      'color: #52565E; font-family: monospace; font-size: 10px;'
    );
  }

  /* ------------------------------------------------------------------------
   * Initialization
   * ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initMouseGlow();
    initUtcClock();
    initBackToTop();
    initHeaderScrollState();
    printIdentitySignature();
  });
})();
