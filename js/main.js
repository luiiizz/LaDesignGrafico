// =========================================================
// La Design Gráfico — interações do site
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initNavbar();
  initMobileMenu();
  initReveal();
  initLightbox();
  initHeroParallax();
});

/* Ano do rodapé */
function initYear(){
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* Navbar muda de aparência ao rolar + destaca link ativo */
function initNavbar(){
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const toggleScrolled = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  toggleScrolled();
  window.addEventListener('scroll', toggleScrolled, { passive: true });

  // fecha o menu mobile ao clicar em um link
  document.querySelectorAll('#nav-links a, #mobile-menu a').forEach(a => {
    a.addEventListener('click', () => {
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) mobileMenu.classList.add('hidden');
      document.getElementById('menu-open')?.classList.remove('hidden');
      document.getElementById('menu-close')?.classList.add('hidden');
    });
  });
}

/* Menu hambúrguer mobile */
function initMobileMenu(){
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-open');
  const iconClose = document.getElementById('menu-close');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isHidden = menu.classList.toggle('hidden');
    iconOpen.classList.toggle('hidden', !isHidden);
    iconClose.classList.toggle('hidden', isHidden);
  });
}

/* Revelação suave de elementos ao rolar a página */
function initReveal(){
  const items = document.querySelectorAll('.reveal, .reveal-scale');
  if (!('IntersectionObserver' in window)) {
    items.forEach(i => i.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach(i => io.observe(i));
}

/* Leve efeito parallax nos elementos decorativos do Hero */
function initHeroParallax(){
  const shapes = document.querySelectorAll('.parallax-shape');
  if (!shapes.length) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    shapes.forEach(shape => {
      const speed = parseFloat(shape.dataset.speed || 0.15);
      shape.style.transform = `translateY(${y * speed}px)`;
    });
  }, { passive: true });
}

/* =========================================================
   Lightbox com zoom e navegação entre imagens da mesma galeria
   ========================================================= */
function initLightbox(){
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const lbImg = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const lbCounter = document.getElementById('lb-counter');
  const btnPrev = document.getElementById('lb-prev');
  const btnNext = document.getElementById('lb-next');
  const btnClose = document.getElementById('lb-close');

  let currentGroup = [];
  let currentIndex = 0;

  function collectGroup(galleryName){
    return Array.from(document.querySelectorAll(`[data-gallery="${galleryName}"]`));
  }

  function openLightbox(el){
    const galleryName = el.dataset.gallery;
    currentGroup = collectGroup(galleryName);
    currentIndex = currentGroup.indexOf(el);
    renderSlide();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    lbImg.classList.remove('zoomed');
    document.body.style.overflow = '';
  }

  function renderSlide(){
    const el = currentGroup[currentIndex];
    if (!el) return;
    const fullSrc = el.dataset.full || el.querySelector('img')?.src;
    const caption = el.dataset.caption || el.querySelector('img')?.alt || '';
    lbImg.src = fullSrc;
    lbImg.alt = caption;
    lbImg.classList.remove('zoomed');
    lbCaption.textContent = caption;
    lbCounter.textContent = `${currentIndex + 1} / ${currentGroup.length}`;
    const multi = currentGroup.length > 1;
    btnPrev.style.display = multi ? 'flex' : 'none';
    btnNext.style.display = multi ? 'flex' : 'none';
  }

  function showNext(){ currentIndex = (currentIndex + 1) % currentGroup.length; renderSlide(); }
  function showPrev(){ currentIndex = (currentIndex - 1 + currentGroup.length) % currentGroup.length; renderSlide(); }

  document.querySelectorAll('[data-gallery]').forEach(el => {
    el.addEventListener('click', () => openLightbox(el));
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.addEventListener('keypress', (e) => { if (e.key === 'Enter') openLightbox(el); });
  });

  btnNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
  btnClose.addEventListener('click', closeLightbox);

  lbImg.addEventListener('click', () => lbImg.classList.toggle('zoomed'));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  // swipe touch (mobile)
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) > 50) delta > 0 ? showPrev() : showNext();
  }, { passive: true });
}
