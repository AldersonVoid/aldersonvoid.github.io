/**
 * ALDERSONVOID — PREMIUM PERSONAL IDENTITY
 * Interaction & Motion Controller
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------------------
   * 1. Hero Title Letter Reveal
   * ------------------------------------------------------------------------ */
  function initTitleReveal() {
    const title = document.getElementById('hero-title');
    if (!title) return;

    let index = 0;
    const wrapNode = (node, isAccent) => {
      const fragment = document.createDocumentFragment();
      const text = node.textContent.trim();
      for (const ch of text) {
        const span = document.createElement('span');
        span.className = 'char' + (isAccent ? ' crimson-accent' : '');
        span.style.setProperty('--i', index++);
        span.setAttribute('aria-hidden', 'true');
        span.textContent = ch;
        fragment.appendChild(span);
      }
      return fragment;
    };

    const nodes = Array.from(title.childNodes);
    title.textContent = '';
    nodes.forEach((node) => {
      if (!node.textContent.trim()) return;
      const isAccent = node.nodeType === 1 && node.classList.contains('crimson-accent');
      title.appendChild(wrapNode(node, isAccent));
    });

    if (prefersReducedMotion) {
      title.classList.add('is-ready');
      return;
    }

    // Double rAF guarantees initial hidden state is painted before transition triggers
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        title.classList.add('is-ready');
      });
    });
  }

  /* ------------------------------------------------------------------------
   * 2. Scroll Reveal Animations (Intersection Observer + Viewport Sweep)
   * ------------------------------------------------------------------------ */
  function initScrollReveal() {
    const fadeElements = Array.from(document.querySelectorAll('.fade-in'));
    if (!fadeElements.length) return;

    const showElement = (el) => {
      if (el.classList.contains('is-visible')) return;
      const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
      const reveal = () => {
        el.classList.add('is-visible');
        el.addEventListener(
          'transitionend',
          () => {
            el.style.willChange = 'auto';
          },
          { once: true }
        );
      };

      if (delay > 0 && !prefersReducedMotion) {
        setTimeout(reveal, Math.min(delay, 320));
      } else {
        reveal();
      }
    };

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      fadeElements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    // Immediately reveal elements already in or above the current viewport
    const sweepVisible = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      fadeElements.forEach((el) => {
        if (el.classList.contains('is-visible')) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= vh + 40) {
          showElement(el);
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            showElement(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.01,
        rootMargin: '80px 0px 80px 0px',
      }
    );

    fadeElements.forEach((el) => observer.observe(el));
    sweepVisible();
    window.addEventListener('scroll', sweepVisible, { passive: true });
    window.addEventListener('hashchange', sweepVisible, { passive: true });
  }

  /* ------------------------------------------------------------------------
   * 3. Unified Pointer Tracking (Ambient Glow + Minimal Cursor Ring)
   * ------------------------------------------------------------------------ */
  function initPointerEffects() {
    if (prefersReducedMotion || !hasFinePointer) return;

    const glow = document.getElementById('mouse-glow');
    const ring = document.getElementById('cursor-ring');
    if (!glow && !ring) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let glowX = targetX;
    let glowY = targetY;
    let ringX = targetX;
    let ringY = targetY;
    let visible = false;
    let rafId = null;

    function tick() {
      let needsNextFrame = false;

      if (glow) {
        const dx = targetX - glowX;
        const dy = targetY - glowY;
        glowX += dx * 0.11;
        glowY += dy * 0.11;
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
   * 4. Scroll Effects (Progress Bar, Header State, Orbital Parallax)
   * ------------------------------------------------------------------------ */
  function initScrollEffects() {
    const bar = document.getElementById('scroll-progress');
    const header = document.querySelector('.site-header');
    const rings = document.querySelector('.void-rings');
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      if (bar) {
        const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
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

    window.addEventListener('resize', update, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------------
   * 5. Live UTC Telemetry Clock
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
   * 6. Back to Top Smooth Interaction
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
   * 7. Console Digital Signature
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
      'color: #565B64; font-family: monospace; font-size: 10px;'
    );
  }

  /* ------------------------------------------------------------------------
   * Initialization
   * ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    initTitleReveal();
    initScrollReveal();
    initScrollEffects();
    initPointerEffects();
    initUtcClock();
    initBackToTop();
    printIdentitySignature();
  });
})();
