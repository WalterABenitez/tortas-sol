/* =========================
   GALERÍA DINÁMICA con LAZY-LOAD
========================= */
const imagePaths = [];
for (let i = 1; i <= 20; i++) {
  imagePaths.push(`assets/images/torta${i}.jpg`);
}

const container = document.querySelector('#galeria .row');

imagePaths.forEach(src => {
  const div = document.createElement('div');
  div.className = 'col-md-4 col-sm-6';
  div.innerHTML = `
    <div class="galeria-item reveal">
      <img src="${src}" class="galeria-img" loading="lazy" alt="Torta artesanal">
    </div>`;
  container.appendChild(div);
});


/* =========================
   LIGHTBOX IMAGEN + VIDEO
========================= */

let currentIndex = 0;
let isVideoMode = false;

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxVideo = document.getElementById('lightbox-video');

const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const closeBtn = document.getElementById('closeBtn');

// Abre Lightbox
function openLightbox(src, video = false) {
  isVideoMode = video;
  lightbox.style.display = "flex";

  if (video) {
    lightboxImg.style.display = "none";
    lightboxVideo.style.display = "block";
    lightboxVideo.src = src;
    lightboxVideo.muted = true;     // siempre mudo
    lightboxVideo.volume = 0;       // evita sonido residual
    lightboxVideo.play();
    return;
  }

  lightboxVideo.pause();
  lightboxVideo.style.display = "none";
  lightboxImg.style.display = "block";
  lightboxImg.src = src;
}

// Cierra Lightbox
function closeLightbox() {
  lightbox.style.display = "none";
  lightboxVideo.pause();
  lightboxVideo.currentTime = 0;
}

// CAPTURA CLICK EN IMÁGENES
document.addEventListener('click', e => {
  if (e.target.classList.contains('galeria-img')) {
    const src = e.target.getAttribute('src');
    currentIndex = imagePaths.indexOf(src);
    openLightbox(src);
  }
});

// SIGUIENTE
nextBtn.addEventListener('click', () => {
  if (isVideoMode) return;
  currentIndex = (currentIndex + 1) % imagePaths.length;
  openLightbox(imagePaths[currentIndex]);
});

// ANTERIOR
prevBtn.addEventListener('click', () => {
  if (isVideoMode) return;
  currentIndex = (currentIndex - 1 + imagePaths.length) % imagePaths.length;
  openLightbox(imagePaths[currentIndex]);
});

// CERRAR CON TECLADO
document.addEventListener('keydown', e => {
  if (e.key === "Escape") closeLightbox();
  if (!isVideoMode) {
    if (e.key === "ArrowRight") nextBtn.click();
    if (e.key === "ArrowLeft") prevBtn.click();
  }
});

// CERRAR CON CLICK EN FONDO
lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

// CERRAR CON X
closeBtn.addEventListener('click', closeLightbox);


/* ===== LAZY LOAD + SCROLL REVEAL ===== */
const lazyOptions = {
  root: null,
  threshold: 0.25
};

const lazyObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('lazy-loaded');
      entry.target.classList.add('visible');
      lazyObserver.unobserve(entry.target);
    }
  });
}, lazyOptions);

document.querySelectorAll('.galeria-img, .galeria-item video, .reveal')
  .forEach(el => lazyObserver.observe(el));

