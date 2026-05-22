'use strict';

/* ── helpers ── */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ─── Sanitizar texto (seguridad XSS) ─── */
function sanitize(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/* ════════════════════════════════
   1. LOADER
════════════════════════════════ */
window.addEventListener('load', () => {
  $('#loader')?.classList.add('out');
  $$('.ha').forEach((el, i) => {
    setTimeout(() => el.classList.add('go'), 450 + i * 130);
  });
});

/* ════════════════════════════════
   2. NAVBAR — scroll hide/show
════════════════════════════════ */
const nav   = $('#nav');
let lastY   = 0;
let rafPend = false;

window.addEventListener('scroll', () => {
  if (rafPend) return;
  rafPend = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    nav?.classList.toggle('scrolled', y > 60);
    nav?.classList.toggle('hidden',   y > lastY && y > 200);
    lastY  = Math.max(0, y);
    rafPend = false;
  });
}, { passive: true });

/* ════════════════════════════════
   3. BURGER MOBILE
════════════════════════════════ */
const burger   = $('#burger');
const navLinks = $('#nav-links');

burger?.addEventListener('click', () => {
  const open = navLinks?.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
});

$$('.nl').forEach(a => {
  a.addEventListener('click', () => {
    navLinks?.classList.remove('open');
    burger?.classList.remove('open');
    burger?.setAttribute('aria-expanded', 'false');
  });
});

/* ════════════════════════════════
   4. ACTIVE NAV LINK
════════════════════════════════ */
$$('section[id]').forEach(sec => {
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    $$('.nl').forEach(a =>
      a.classList.toggle('active', a.getAttribute('href') === '#' + sec.id)
    );
  }, { rootMargin: '-40% 0px -55% 0px' }).observe(sec);
});

/* ════════════════════════════════
   5. SMOOTH SCROLL (offset navbar)
════════════════════════════════ */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = $(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  const offset = (nav?.offsetHeight || 70) + 10;
  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY - offset,
    behavior: 'smooth'
  });
});

/* ════════════════════════════════
   6. REVEAL ON SCROLL
════════════════════════════════ */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('on');
    revObs.unobserve(e.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

$$('.rv, .rv-left, .rv-right').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.07 + 's';
  revObs.observe(el);
});

/* ════════════════════════════════
   7. MARQUEE INFINITO
════════════════════════════════ */
const marqueeTrack = $('.marquee-track');
if (marqueeTrack) {
  marqueeTrack.addEventListener('mouseenter', () => {
    $$('.marquee-inner').forEach(m => m.style.animationPlayState = 'paused');
  });
  marqueeTrack.addEventListener('mouseleave', () => {
    $$('.marquee-inner').forEach(m => m.style.animationPlayState = '');
  });
}

/* ════════════════════════════════
   8. FORZAR MUTE en todos los videos
════════════════════════════════ */
$$('video').forEach(v => {
  v.muted  = true;
  v.volume = 0;
  v.addEventListener('canplay', () => { v.play().catch(() => {}); }, { once: true });
});

/* ════════════════════════════════
   9. GALERÍA MASONRY DINÁMICA
════════════════════════════════ */
const masonry = $('#masonry');
const IMG_COUNT = 20;

const imgList = Array.from({ length: IMG_COUNT }, (_, i) => ({
  webp: `assets/images/torta${i + 1}.webp`,
  jpg:  `assets/images/torta${i + 1}.jpg`,
  alt:  `Torta artesanal ${i + 1} — Tortas Sol Rosario`
}));

imgList.forEach((img, idx) => {
  const item = document.createElement('div');
  item.className = 'masonry-item';
  item.dataset.index = idx;
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `Ver torta ${idx + 1} en detalle`);
  item.style.cursor = 'pointer';

  item.innerHTML = `
    <picture>
      <source data-srcset="${img.webp}" type="image/webp" />
      <img
        data-src="${img.jpg}"
        src=""
        alt="${img.alt}"
        draggable="false"
        width="400"
        height="500"
      />
    </picture>
    <div class="masonry-overlay" aria-hidden="true">
      <i class="fa-solid fa-magnifying-glass"></i>
    </div>
  `;
  masonry?.appendChild(item);
  revObs.observe(item);
});

/* ════════════════════════════════
   10. LAZY LOAD (IntersectionObserver)
════════════════════════════════ */
const lazyObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const item    = e.target;
    const source  = item.querySelector('source[data-srcset]');
    const img     = item.querySelector('img[data-src]');
    if (source) { source.srcset = source.dataset.srcset; source.removeAttribute('data-srcset'); }
    if (img) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      img.addEventListener('load',  () => img.classList.add('on'), { once: true });
      img.addEventListener('error', () => img.classList.add('on'), { once: true });
    }
    lazyObs.unobserve(item);
  });
}, { rootMargin: '400px' });

$$('.masonry-item').forEach(item => lazyObs.observe(item));

/* ════════════════════════════════
   11. TABS galería (fotos / videos)
════════════════════════════════ */
$$('.gtab').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.gtab').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    const tab = btn.dataset.tab;
    $$('.gal-panel').forEach(p => { p.classList.remove('active'); p.hidden = true; });
    const panel = $(`#panel-${tab}`);
    if (panel) { panel.classList.add('active'); panel.hidden = false; }
  });
});

/* ════════════════════════════════
   12. LIGHTBOX PROFESIONAL
   Con ✖ para cerrar y flechas para navegar
════════════════════════════════ */
const lb      = $('#lb');
const lbBg    = $('#lb-bg');
const lbClose = $('#lb-close');
const lbPrev  = $('#lb-prev');
const lbNext  = $('#lb-next');
const lbImg   = $('#lb-img');
const lbVid   = $('#lb-vid');
const lbCount = $('#lb-count');

let lbIsOpen = false;
let lbData   = [];
let lbIdx    = 0;

function openLB(data, idx = 0) {
  lbData   = data;
  lbIdx    = idx;
  lbIsOpen = true;
  lb?.classList.add('open');
  lb?.setAttribute('aria-hidden', 'false');
  renderLB();
  setTimeout(() => lbClose?.focus(), 60);
}

function closeLB() {
  if (!lbIsOpen) return;
  lbIsOpen = false;
  lb?.classList.remove('open');
  lb?.setAttribute('aria-hidden', 'true');
  if (lbVid) { lbVid.pause(); lbVid.removeAttribute('src'); lbVid.style.display = 'none'; }
  if (lbImg) { lbImg.src = ''; lbImg.style.display = 'block'; }
}

function renderLB() {
  if (!lbData.length) return;
  const cur = lbData[lbIdx];

  if (cur.type === 'vid') {
    if (lbImg) lbImg.style.display = 'none';
    if (lbVid) { lbVid.style.display = 'block'; lbVid.src = cur.src; lbVid.load(); }
    // Siempre mostrar flechas en videos (si hay más de uno)
    const hasMultiple = lbData.length > 1;
    if (lbPrev) lbPrev.style.display = hasMultiple ? '' : 'none';
    if (lbNext) lbNext.style.display = hasMultiple ? '' : 'none';
  } else {
    if (lbVid) { lbVid.pause(); lbVid.style.display = 'none'; }
    if (lbImg) { lbImg.style.display = 'block'; lbImg.src = cur.src; lbImg.alt = cur.alt || ''; }
    const hasMultiple = lbData.length > 1;
    if (lbPrev) lbPrev.style.display = hasMultiple ? '' : 'none';
    if (lbNext) lbNext.style.display = hasMultiple ? '' : 'none';
  }

  if (lbCount) {
    lbCount.textContent = lbData.length > 1 ? `${lbIdx + 1} / ${lbData.length}` : '';
  }
}

function lbGo(dir) {
  lbIdx = (lbIdx + dir + lbData.length) % lbData.length;
  renderLB();
}

lbClose?.addEventListener('click', closeLB);
lbBg?.addEventListener('click', closeLB);
lbPrev?.addEventListener('click', () => lbGo(-1));
lbNext?.addEventListener('click', () => lbGo(+1));

document.addEventListener('keydown', e => {
  if (!lbIsOpen) return;
  if (e.key === 'Escape')     closeLB();
  if (e.key === 'ArrowRight') lbGo(+1);
  if (e.key === 'ArrowLeft')  lbGo(-1);
});

let swX = 0;
lb?.addEventListener('touchstart', e => { swX = e.changedTouches[0].clientX; }, { passive: true });
lb?.addEventListener('touchend',   e => {
  const dx = e.changedTouches[0].clientX - swX;
  if (Math.abs(dx) > 60) lbGo(dx < 0 ? +1 : -1);
}, { passive: true });

/* ── Click/enter en galería → lightbox ── */
const lbImgData = imgList.map(img => ({ src: img.webp, type: 'img', alt: img.alt }));

document.addEventListener('click', e => {
  const item = e.target.closest('.masonry-item');
  if (!item) return;
  openLB(lbImgData, parseInt(item.dataset.index, 10));
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const item = e.target.closest?.('.masonry-item');
  if (!item) return;
  e.preventDefault();
  openLB(lbImgData, parseInt(item.dataset.index, 10));
});

/* ── Videos → lightbox (con posibilidad de varios videos) ── */
const videoSources = [
  { src: 'assets/videos/Tortazoeconmarisol.mp4', type: 'vid' },
  { src: 'assets/videos/Tortade3cumple.mp4', type: 'vid' },
  { src: 'assets/videos/Tortazoe.mp4', type: 'vid' }
];

$$('.vid-play').forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    openLB(videoSources, idx);
  });
});

/* ════════════════════════════════
   13. FORMULARIO — Validación + Seguridad XSS
════════════════════════════════ */
function toast(msg, type = '') {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast on ' + type;
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.className = 'toast'; }, 4500);
}

$('#cform')?.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;

  const nombre  = sanitize($('#fn', form)?.value || '');
  const email   = sanitize($('#fe', form)?.value || '');
  const ocasion = sanitize($('#fo', form)?.value || '');
  const mensaje = sanitize($('#fm', form)?.value || '');

  if (!nombre) { toast('Ingresá tu nombre.', 'err'); $('#fn', form)?.focus(); return; }
  if (nombre.length > 80) { toast('El nombre es demasiado largo.', 'err'); return; }
  if (!email) { toast('Ingresá tu email.', 'err'); $('#fe', form)?.focus(); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    toast('El email no es válido.', 'err'); $('#fe', form)?.focus(); return;
  }
  if (!mensaje) { toast('Escribí tu mensaje.', 'err'); $('#fm', form)?.focus(); return; }
  if (mensaje.length > 800) { toast('El mensaje es demasiado largo (máx 800 caracteres).', 'err'); return; }

  const waText = encodeURIComponent(
    `¡Hola Marisol! Soy ${nombre} (${email}).\n` +
    (ocasion ? `Ocasión: ${ocasion}\n` : '') +
    `\n${mensaje}`
  );

  window.open(`https://wa.me/5493413559372?text=${waText}`, '_blank', 'noopener,noreferrer');
  toast('¡Abriendo WhatsApp! 🎂', 'ok');
  form.reset();
});