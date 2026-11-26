import { inject } from '@vercel/analytics';

// Initialize Vercel Web Analytics
inject();

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const navLinks = [...document.querySelectorAll('.nav-link')];
menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});
navLinks.forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const sections = document.querySelectorAll('main section[id]');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach(section => sectionObserver.observe(section));

const storyCards = document.querySelectorAll('.project-card');
const storyObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      storyObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
storyCards.forEach(card => storyObserver.observe(card));

const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.setAttribute('aria-hidden', 'true');
lightbox.innerHTML = '<div class="lightbox-panel" role="dialog" aria-modal="true" aria-label="Image preview"><button class="lightbox-close" type="button" aria-label="Close full-screen image">×</button><div class="lightbox-stage"></div><div class="lightbox-caption"><span class="lightbox-title"></span><a class="lightbox-project-link" target="_blank" rel="noopener noreferrer">Open project ↗</a></div></div>';
document.body.append(lightbox);
const lightboxStage = lightbox.querySelector('.lightbox-stage');
const lightboxTitle = lightbox.querySelector('.lightbox-title');
const lightboxProjectLink = lightbox.querySelector('.lightbox-project-link');
const lightboxClose = lightbox.querySelector('.lightbox-close');
let lastFocused = null;
function openLightbox(source) {
  lastFocused = source;
  const card = source.closest('.project-card');
  const isGraphicImage = source.matches('.graphic-image');
  let copied;
  if (isGraphicImage) {
    copied = source.querySelector('img').cloneNode(true);
    copied.classList.add('lightbox-image');
  } else {
    copied = source.cloneNode(true);
    copied.removeAttribute('href');
    copied.removeAttribute('target');
    copied.removeAttribute('role');
    copied.removeAttribute('tabindex');
    copied.querySelector('.visual-open')?.remove();
  }
  lightboxStage.replaceChildren(copied);
  const title = (isGraphicImage ? source.dataset.title : null) || card?.querySelector('.project-info h3')?.textContent?.trim() || source.querySelector('img')?.alt || 'Portfolio image';
  lightboxTitle.textContent = title;
  const projectLink = card?.querySelector('.project-arrow')?.href || source.closest('a')?.href;
  if (projectLink) {
    lightboxProjectLink.href = projectLink;
    lightboxProjectLink.hidden = false;
  } else {
    lightboxProjectLink.hidden = true;
  }
  lightbox.querySelector('[role="dialog"]').setAttribute('aria-label', `${title} full-screen preview`);
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overlay-open');
  lightboxClose.focus();
}
function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  if (!secretLayer.classList.contains('is-open')) document.body.classList.remove('overlay-open');
  lightboxStage.replaceChildren();
  lastFocused?.focus?.();
}
document.addEventListener('click', event => {
  const graphicPreview = event.target.closest('.project-card .graphic-preview-trigger');
  if (graphicPreview) {
    event.preventDefault();
    const firstImage = graphicPreview.closest('.project-graphic')?.querySelector('.graphic-image');
    if (firstImage) openLightbox(firstImage);
    return;
  }
  const graphicImage = event.target.closest('.project-card .graphic-image');
  if (graphicImage) {
    event.preventDefault();
    openLightbox(graphicImage);
    return;
  }
  const visual = event.target.closest('.project-card .project-visual:not(.visual-graphic), .skills-image');
  if (visual) {
    event.preventDefault();
    openLightbox(visual);
  }
});
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });

const secretLayer = document.createElement('div');
secretLayer.className = 'secret-layer';
secretLayer.setAttribute('aria-hidden', 'true');
secretLayer.innerHTML = '<div class="secret-window" role="dialog" aria-modal="true" aria-label="Hidden easter egg"><div class="secret-window-top"><span>KUACH@PORTFOLIO:~</span><button class="secret-close" type="button">[ CLOSE ]</button></div><p class="secret-command">$ ./look-closer.sh</p><h2 class="secret-message">You found the hidden route.</h2><p class="secret-sub">Thanks for exploring. — end of transmission_</p></div>';
document.body.append(secretLayer);
const secretClose = secretLayer.querySelector('.secret-close');
let nameClickCount = 0;
let nameClickTimer;
let nameFocusReturn = null;
function showSecret(source) {
  nameFocusReturn = source;
  secretLayer.classList.add('is-open');
  secretLayer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overlay-open');
  secretClose.focus();
}
function hideSecret() {
  secretLayer.classList.remove('is-open');
  secretLayer.setAttribute('aria-hidden', 'true');
  if (!lightbox.classList.contains('is-open')) document.body.classList.remove('overlay-open');
  nameFocusReturn?.focus?.();
}
document.querySelectorAll('.brand-name').forEach(name => name.addEventListener('click', event => {
  nameClickCount += 1;
  clearTimeout(nameClickTimer);
  if (nameClickCount >= 3) {
    event.preventDefault();
    nameClickCount = 0;
    showSecret(name.closest('.brand'));
  } else {
    nameClickTimer = setTimeout(() => { nameClickCount = 0; }, 1100);
  }
}));
secretClose.addEventListener('click', hideSecret);
secretLayer.addEventListener('click', event => { if (event.target === secretLayer) hideSecret(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (secretLayer.classList.contains('is-open')) hideSecret();
    else if (lightbox.classList.contains('is-open')) closeLightbox();
  }
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.project-visual[role="button"], .skills-image[role="button"]')) {
    event.preventDefault();
    openLightbox(event.target);
  }
});
