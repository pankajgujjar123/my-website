/* ============================================================
   AURUM HOUSE — JavaScript
   Handles: Nav scroll, mobile menu, reveal animations,
   testimonials carousel, booking form, date constraints
   ============================================================ */

(function () {
  'use strict';

  /* ── NAV SCROLL BEHAVIOUR ──────────────────────────────── */
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  /* ── MOBILE MENU ───────────────────────────────────────── */
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  let menuOpen = false;

  function toggleMenu(force) {
    menuOpen = (force !== undefined) ? force : !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';

    const spans = hamburger.querySelectorAll('span');
    if (menuOpen) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  }

  hamburger.addEventListener('click', () => toggleMenu());

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  /* Close on Escape key */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) toggleMenu(false);
  });

  /* ── REVEAL ON SCROLL (IntersectionObserver) ───────────── */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: reveal all immediately
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  /* ── TESTIMONIALS CAROUSEL ─────────────────────────────── */
  const slides = document.querySelectorAll('.testimonial__slide');
  const dots   = document.querySelectorAll('.dot');
  let currentSlide = 0;
  let autoplayTimer;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function startAutoplay() {
    autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.index, 10));
      resetAutoplay();
    });
  });

  startAutoplay();

  // Swipe support for testimonials
  const track = document.getElementById('testimonialsTrack');
  if (track) {
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        goToSlide(diff > 0 ? currentSlide + 1 : currentSlide - 1);
        resetAutoplay();
      }
    }, { passive: true });
  }

  /* ── BOOKING FORM ──────────────────────────────────────── */
  const bookingForm    = document.getElementById('bookingForm');
  const bookingSuccess = document.getElementById('bookingSuccess');

  // Set minimum dates
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const checkinInput  = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');

  if (checkinInput)  checkinInput.min  = todayStr;
  if (checkoutInput) checkoutInput.min = todayStr;

  // When check-in changes, update checkout minimum
  if (checkinInput && checkoutInput) {
    checkinInput.addEventListener('change', () => {
      const checkinDate = new Date(checkinInput.value);
      checkinDate.setDate(checkinDate.getDate() + 1);
      const minCheckout = checkinDate.toISOString().split('T')[0];
      checkoutInput.min = minCheckout;

      // Reset checkout if it's before new minimum
      if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
        checkoutInput.value = minCheckout;
      }
    });
  }

  // Show booking form once DOM is ready (hidden by default for progressive reveal)
  if (bookingForm) {
    bookingForm.classList.add('visible');
  }

  // Form submission
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect values for basic validation feedback
      const name     = document.getElementById('name').value.trim();
      const email    = document.getElementById('email').value.trim();
      const checkin  = checkinInput?.value;
      const checkout = checkoutInput?.value;

      if (!name || !email || !checkin || !checkout) {
        shakeForm(bookingForm);
        return;
      }

      // Simulate submission — in production, POST to your server here
      const submitBtn = bookingForm.querySelector('[type="submit"]');
      submitBtn.textContent = 'Confirming…';
      submitBtn.disabled = true;

      setTimeout(() => {
        bookingForm.classList.remove('visible');
        bookingSuccess.classList.add('visible');
        // Smooth scroll to success message
        bookingSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1200);
    });
  }

  function shakeForm(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => { el.style.animation = ''; }, 500);
  }

  // Inject shake animation into the stylesheet
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-8px); }
      40%      { transform: translateX(8px); }
      60%      { transform: translateX(-5px); }
      80%      { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(shakeStyle);

  /* ── SMOOTH ANCHOR SCROLL (override for nav links) ─────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = nav.offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 12;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  /* ── GALLERY LIGHTBOX (simple) ─────────────────────────── */
  const galleryItems = document.querySelectorAll('.gallery__item');
  const bgMap = {
    1: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=90',
    2: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=90',
    3: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1400&q=90',
    4: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=90',
    5: 'https://images.unsplash.com/photo-1458720000580-5d62de68b7ca?auto=format&fit=crop&w=1400&q=90',
    6: 'https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?auto=format&fit=crop&w=1400&q=90',
  };

  // Build lightbox DOM
  const lightbox = document.createElement('div');
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image viewer');
  lightbox.style.cssText = `
    position: fixed; inset: 0; z-index: 200;
    background: rgba(10,15,20,0.96);
    display: none; align-items: center; justify-content: center;
    cursor: zoom-out;
  `;

  const lightboxImg = document.createElement('img');
  lightboxImg.style.cssText = `
    max-width: 92vw; max-height: 88vh;
    object-fit: contain;
    border-radius: 3px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.5);
    cursor: default;
  `;
  lightboxImg.addEventListener('click', e => e.stopPropagation());

  const lightboxClose = document.createElement('button');
  lightboxClose.textContent = '×';
  lightboxClose.setAttribute('aria-label', 'Close');
  lightboxClose.style.cssText = `
    position: absolute; top: 1.5rem; right: 1.5rem;
    background: none; border: 1px solid rgba(255,255,255,0.2);
    color: #fff; font-size: 1.8rem; line-height: 1;
    width: 44px; height: 44px; border-radius: 50%;
    cursor: pointer; display: flex; align-items: center;
    justify-content: center; transition: background 0.2s;
  `;
  lightboxClose.addEventListener('mouseover', () => { lightboxClose.style.background = 'rgba(255,255,255,0.1)'; });
  lightboxClose.addEventListener('mouseout',  () => { lightboxClose.style.background = 'none'; });

  lightbox.appendChild(lightboxImg);
  lightbox.appendChild(lightboxClose);
  document.body.appendChild(lightbox);

  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    lightboxImg.focus();
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  lightbox.addEventListener('click', closeLightbox);
  lightboxClose.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.style.display === 'flex') closeLightbox();
  });

  galleryItems.forEach(item => {
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', () => {
      const bg = parseInt(item.style.getPropertyValue('--bg'), 10);
      if (bgMap[bg]) openLightbox(bgMap[bg]);
    });
  });

  /* ── PARALLAX HINT ON HERO (subtle) ───────────────────── */
  const heroBg = document.querySelector('.hero__bg');
  if (heroBg && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.25}px)`;
      }
    }, { passive: true });
  }

  console.log('%cAurum House © 1924', 'font-family: serif; font-size: 1.2rem; color: #c9a84c;');

})();