const MOBILE_NAV_MQ = window.matchMedia('(max-width: 768px)');

function getNavAnimMs() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 340;
}

// FAQ accordion
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-icon').textContent = '+';
  });
  if (!isOpen) {
    item.classList.add('open');
    btn.querySelector('.faq-icon').textContent = '−';
  }
}

// Mobile nav
const navToggle = document.getElementById('navToggle');
const nav = document.querySelector('nav');
const navLinks = document.getElementById('navLinks');
let menuAnimTimer = null;

function openMenu() {
  clearTimeout(menuAnimTimer);
  navLinks.classList.add('open');
  navToggle.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
  navToggle.setAttribute('aria-label', 'Cerrar menú');
  document.body.classList.add('nav-open');
}

function closeMenu() {
  return new Promise(resolve => {
    if (!navLinks.classList.contains('open')) {
      resolve();
      return;
    }

    clearTimeout(menuAnimTimer);
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');

    menuAnimTimer = setTimeout(() => {
      document.body.classList.remove('nav-open');
      resolve();
    }, getNavAnimMs());
  });
}

function toggleMenu() {
  if (navLinks.classList.contains('open')) {
    closeMenu();
  } else {
    openMenu();
  }
}

function scrollToHashTarget(hash) {
  const target = document.querySelector(hash);
  if (!target) return;

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

navToggle.addEventListener('click', toggleMenu);

document.addEventListener('click', (event) => {
  if (!navLinks.classList.contains('open')) return;
  if (nav.contains(event.target)) return;
  closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', async (event) => {
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();

    if (MOBILE_NAV_MQ.matches && navLinks.classList.contains('open')) {
      await closeMenu();
    }

    scrollToHashTarget(hash);
  });
});