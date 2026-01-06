// script.js — Polished interactions (hamburger animation, mobile overlay, reveal, progress, improved form, accessibility)
document.addEventListener('DOMContentLoaded', () => {
  /* ======= Elements ======= */
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const mobileLinks = Array.from(document.querySelectorAll('.mobile-link'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const themeToggle = document.getElementById('theme-toggle');
  const yearEl = document.getElementById('year');
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  /* ======= Helper ======= */
  const safe = fn => (...args) => { try { return fn(...args); } catch (e) { /* noop */ } };

  /* ======= Mobile nav open/close (overlay) ======= */
  function openMobile() {
    if (!mobileNav) return;
    mobileNav.classList.add('open');
    hamburger && hamburger.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    hamburger && hamburger.setAttribute('aria-expanded', 'true');
    // trap focus to first link
    const first = mobileNav.querySelector('a');
    if (first) first.focus();
    // prevent background scroll
    document.documentElement.style.overflow = 'hidden';
  }
  function closeMobile() {
    if (!mobileNav) return;
    mobileNav.classList.remove('open');
    hamburger && hamburger.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    hamburger && hamburger.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    // return focus to hamburger
    if (hamburger) hamburger.focus();
  }
  function toggleMobile() {
    const open = mobileNav && mobileNav.classList.contains('open');
    if (open) closeMobile(); else openMobile();
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMobile);
    // close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobile();
    });
    // click outside panel to close (overlay)
    if (mobileNav) {
      mobileNav.addEventListener('click', (e) => {
        if (e.target === mobileNav) closeMobile();
      });
    }
  }

  // close mobile when a mobile link is clicked
  mobileLinks.forEach(a => a.addEventListener('click', closeMobile));

  // smooth scroll for nav links (desktop)
  navLinks.forEach(a => a.addEventListener('click', (e) => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // update active state optimistically
      navLinks.forEach(n => n.classList.remove('active'));
      a.classList.add('active');
      closeMobile();
    }
  }));

  /* ======= Reveal on scroll & progress bars ======= */
  const reveals = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('visible');

      // if element contains progress bars animate them with slight staggering
      const progressBars = el.querySelectorAll && el.querySelectorAll('.progress');
      if (progressBars && progressBars.length) {
        progressBars.forEach((p, i) => {
          const span = p.querySelector('span');
          const value = Math.min(100, parseInt(p.dataset.progress || 0, 10));
          if (span) {
            setTimeout(() => { span.style.width = `${value}%`; }, 120 + (i * 80));
          }
        });
      }
      obs.unobserve(el);
    });
  }, { threshold: 0.12 });

  reveals.forEach(r => revealObserver.observe(r));

  // ensure skills animate if whole section is already visible quickly
  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    const skillsObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.progress').forEach(p => {
          const span = p.querySelector('span');
          const v = Math.min(100, parseInt(p.dataset.progress || 0, 10));
          if (span) span.style.width = `${v}%`;
        });
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.18 });
    skillsObserver.observe(skillsSection);
  }

  /* ======= Active nav highlighting while scrolling ======= */
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = document.querySelector(`.main-nav a[href="#${id}"]`);
      if (entry.isIntersecting) {
        navLinks.forEach(n => n.classList.remove('active'));
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-35% 0px -45% 0px', threshold: 0 });

  sections.forEach(s => sectionObserver.observe(s));

  /* ======= Contact form — frontend handling with validation & graceful mailto fallback ======= */
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (form.name.value || '').trim();
      const email = (form.email.value || '').trim();
      const message = (form.message.value || '').trim();

      if (!name || !email || !message) {
        status.textContent = 'Mohon lengkapi semua bidang.';
        status.style.color = 'crimson';
        status.setAttribute('role', 'status');
        return;
      }

      // basic email pattern check
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
      if (!emailPattern.test(email)) {
        status.textContent = 'Format email tidak valid.';
        status.style.color = 'crimson';
        return;
      }

      status.textContent = 'Mengirim...';
      status.style.color = getComputedStyle(document.documentElement).getPropertyValue('--muted') || '#6b7280';
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      // simulate request then open mail client fallback (user-friendly)
      setTimeout(() => {
        const subject = encodeURIComponent(`Pesan dari ${name}`);
        const body = encodeURIComponent(`Nama: ${name}\nEmail: ${email}\n\n${message}`);
        // try to open mail client; if blocked, show a polite message
        try {
          window.location.href = `mailto:malikzainsz@gmail.com?subject=${subject}&body=${body}`;
        } catch (err) {
          // do nothing — continue to success UI
        }

        form.reset();
        status.textContent = 'Pesan berhasil dikirim! Terima kasih.';
        status.style.color = 'green';
        if (submitBtn) submitBtn.disabled = false;
      }, 900);
    });
  }

  /* ======= Theme toggle (light / dark) with persistence ======= */
  function applyTheme(t) {
    if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('site-theme', t); } catch (e) {}
    updateThemeIcon();
  }
  function updateThemeIcon() {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    if (icon) {
      icon.className = current === 'dark' ? 'fa-solid fa-sun' : 'fa-regular fa-moon';
    }
    themeToggle.setAttribute('aria-pressed', current === 'dark' ? 'true' : 'false');
  }

  if (themeToggle) {
    const stored = (() => { try { return localStorage.getItem('site-theme'); } catch { return null; } })();
    if (stored) applyTheme(stored);
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
    else applyTheme('light');

    themeToggle.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
  }

  /* ======= Footer year ======= */
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ======= Accessibility & performance tweaks ======= */
  // Close mobile nav if viewport becomes large (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 980) closeMobile();
    }, 120);
  }, { passive: true });

  // Respect reduced motion preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(r => r.classList.add('visible'));
    document.querySelectorAll('.progress span').forEach(span => {
      const p = span.closest('.progress');
      if (p) span.style.width = `${p.dataset.progress || 0}%`;
    });
  }

  // small improvement: keyboard navigation for mobile overlay (trap)
  document.addEventListener('keydown', (e) => {
    if (!mobileNav || !mobileNav.classList.contains('open')) return;
    // keep focus inside overlay: if tab at last, cycle to first
    if (e.key === 'Tab') {
      const focusables = mobileNav.querySelectorAll('a, button, input, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });

});
