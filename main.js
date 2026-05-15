/* DENYA SONATA PORTFOLIO — main.js */

// ── SITE INIT ──────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initTypewriter();
  initFilter();
  initSteamViewer();
  initLightbox();
  initLoadingIndicators();
  initProtection();
  initScrollReveal();
  initDecoCycler();
});


// ── LIGHTBOX ───────────────────────────────────────────────

const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');
const lbLabel  = document.getElementById('lb-label');
const lbClose  = document.getElementById('lb-close');
const lbBg     = document.getElementById('lb-bg');
let prevOverflow = '';

function initLightbox() {
  if (!lightbox || !lbImg) return;

  document.querySelectorAll('.gallery-item, .collab-card').forEach(card => {
    const img = card.querySelector('img');
    const title = card.querySelector('.meta-title')?.textContent?.trim() || img?.alt || '';
    const target = card.querySelector('.gallery-img-wrap') || card;
    if (!img || !target) return;
    target.addEventListener('click', () => openLightbox(img.src, title), { passive: true });
  });

  lbClose?.addEventListener('click', closeLightbox, { passive: true });
  lbBg?.addEventListener('click', closeLightbox, { passive: true });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) closeLightbox();
  }, { passive: true });
}

function openLightbox(src, label) {
  if (!lightbox || !lbImg) return;
  prevOverflow = document.body.style.overflow || '';
  lbImg.src = src;
  lbImg.alt = label || '';
  if (lbLabel) lbLabel.textContent = label;
  lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.add('hidden');
  document.body.style.overflow = prevOverflow;
}


// ── PROTECTION ─────────────────────────────────────────────

function initProtection() {
  document.body.addEventListener('contextmenu', e => e.preventDefault(), { passive: false });
  document.body.addEventListener('copy',        e => e.preventDefault(), { passive: false });
  document.body.addEventListener('cut',         e => e.preventDefault(), { passive: false });
  document.body.addEventListener('dragstart', e => {
    if (/^(IMG|VIDEO)$/.test(e.target.tagName)) e.preventDefault();
  }, { passive: false });
  document.querySelectorAll('img, video').forEach(m => { m.draggable = false; });
}


// ── LOADING INDICATORS ─────────────────────────────────────

function initLoadingIndicators() {
  document.querySelectorAll('.gallery-img-wrap img').forEach(img => {
    const wrap = img.closest('.gallery-img-wrap');
    if (!wrap) return;
    const done = () => wrap.classList.remove('loading');
    if (img.complete && img.naturalWidth) { done(); return; }
    wrap.classList.add('loading');
    img.addEventListener('load', done, { once: true, passive: true });
    img.addEventListener('error', () => {
      wrap.classList.remove('loading');
      wrap.classList.add('img-error');
    }, { once: true, passive: true });
  });

  document.querySelectorAll('.anim-preview video').forEach(video => {
    const wrap = video.closest('.anim-preview');
    if (!wrap) return;
    const done = () => wrap.classList.remove('loading');
    wrap.classList.add('loading');
    video.addEventListener('loadeddata', done, { once: true, passive: true });
    video.addEventListener('error',      done, { once: true, passive: true });
    if (video.readyState >= 3) done();
  });
}


// ── TYPEWRITER ─────────────────────────────────────────────

const phrases = [
  'Drawing worlds into existence.',
  'One frame at a time.',
  'Characters with stories to tell.',
  'Art is the language I speak best.',
];
let phraseIndex = 0, charIndex = 0, isDeleting = false;
const twEl = document.getElementById('hero-typewriter');

function typewriter() {
  if (!twEl) return;
  const current = phrases[phraseIndex];
  if (!isDeleting) {
    twEl.textContent = current.slice(0, ++charIndex);
    if (charIndex === current.length) {
      isDeleting = true;
      setTimeout(typewriter, 1800);
      return;
    }
  } else {
    twEl.textContent = current.slice(0, --charIndex);
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }
  setTimeout(typewriter, isDeleting ? 40 : 70);
}

function initTypewriter() { typewriter(); }


// ── GALLERY FILTER ─────────────────────────────────────────

function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      items.forEach(item => {
        item.classList.toggle('hidden', filter !== 'all' && item.dataset.cat !== filter);
      });
      requestAnimationFrame(populateImageViewer);
    });
  });
}


// ── STEAM VIEWER ───────────────────────────────────────────

function initSteamViewer() {
  buildImageViewer();
  buildVideoViewer();
}


// ── IMAGE VIEWER ───────────────────────────────────────────

let imgItems = [], imgIndex = 0;
let svBigImg, svImgLabel, svStripImg, svPreviewWrap;

function buildImageViewer() {
  const gallerySection = document.getElementById('works');
  if (!gallerySection) return;

  const viewer = document.createElement('div');
  viewer.className = 'steam-viewer';
  viewer.tabIndex = 0;
  viewer.setAttribute('aria-label', 'image viewer');
  viewer.innerHTML = `
    <div class="sv-main">
      <button class="sv-arrow" id="sv-prev-img" aria-label="Previous image">&#10094;</button>
      <div class="sv-preview-wrap">
        <img class="sv-big-img" id="sv-big-img" src="" alt="" decoding="async" fetchpriority="low">
        <div class="sv-img-label" id="sv-img-label"></div>
      </div>
      <button class="sv-arrow" id="sv-next-img" aria-label="Next image">&#10095;</button>
    </div>
    <div class="sv-strip-wrap">
      <div class="sv-strip" id="sv-strip-img"></div>
    </div>`;

  gallerySection.querySelector('.filter-bar').after(viewer);
  const grid = gallerySection.querySelector('.gallery-grid');
  if (grid) grid.style.display = 'none';

  svBigImg      = document.getElementById('sv-big-img');
  svImgLabel    = document.getElementById('sv-img-label');
  svStripImg    = document.getElementById('sv-strip-img');
  svPreviewWrap = viewer.querySelector('.sv-preview-wrap');

  document.getElementById('sv-prev-img').addEventListener('click', () => {
    setImgIndex((imgIndex - 1 + imgItems.length) % imgItems.length, true);
  }, { passive: true });
  document.getElementById('sv-next-img').addEventListener('click', () => {
    setImgIndex((imgIndex + 1) % imgItems.length, true);
  }, { passive: true });

  viewer.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  setImgIndex((imgIndex - 1 + imgItems.length) % imgItems.length, true);
    if (e.key === 'ArrowRight') setImgIndex((imgIndex + 1) % imgItems.length, true);
  });

  populateImageViewer();
}

function populateImageViewer() {
  if (!svStripImg || !svBigImg) return;

  const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  imgItems = Array.from(document.querySelectorAll('.gallery-item, .collab-card'))
    .filter(item => filter === 'all' || item.dataset.cat === filter)
    .map(item => ({
      src:   item.querySelector('img')?.src || '',
      label: item.querySelector('.meta-title')?.textContent?.trim() || '',
    }))
    .filter(i => i.src);

  const frag = document.createDocumentFragment();
  imgItems.forEach((item, i) => {
    const thumb = document.createElement('div');
    thumb.className = 'sv-thumb' + (i === 0 ? ' active' : '');
    const img = document.createElement('img');
    img.src = item.src;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.alt = item.label;
    thumb.appendChild(img);
    thumb.addEventListener('click', () => setImgIndex(i, true), { passive: true });
    frag.appendChild(thumb);
  });

  svStripImg.replaceChildren(frag);
  imgIndex = 0;
  if (imgItems.length) setImgIndex(0, false);
}

function setImgIndex(i, thumbScroll) {
  if (!imgItems.length || !svBigImg || !svStripImg) return;
  imgIndex = i;

  svPreviewWrap?.classList.add('loading');
  svBigImg.style.opacity = '0';

  requestAnimationFrame(() => {
    svBigImg.src = imgItems[i].src;
    svBigImg.alt = imgItems[i].label;
    svImgLabel.textContent = imgItems[i].label;

    const reveal = () => {
      svPreviewWrap?.classList.remove('loading');
      svBigImg.style.opacity = '1';
    };
    svBigImg.onload  = reveal;
    svBigImg.onerror = reveal;
    if (svBigImg.complete) reveal();
  });

  Array.from(svStripImg.children).forEach((t, t_i) => t.classList.toggle('active', t_i === i));
  if (thumbScroll) svStripImg.children[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}


// ── VIDEO VIEWER ───────────────────────────────────────────

const allVids = [
  { src: 'assets/works/self/animations/basics/Turn Around.mov',         label: 'TURN AROUND' },
  { src: 'assets/works/self/animations/basics/Walk Cycle.mp4',          label: 'WALK CYCLE' },
  { src: 'assets/works/self/animations/basics/Angkat.mp4',              label: 'LIFT' },
  { src: 'assets/works/self/animations/basics/Dorong.mp4',              label: 'PUSH' },
  { src: 'assets/works/self/animations/basics/Lempar.mp4',              label: 'THROW' },
  { src: 'assets/works/self/animations/basics/Tarik.mp4',               label: 'PULL' },
  { src: 'assets/works/self/animations/oc/3nya - nasty song trend.mp4', label: '3NYA — NASTY SONG TREND' },
  { src: 'assets/works/self/animations/oc/First Look vs Last Look.mp4', label: 'FIRST LOOK VS LAST LOOK' },
];
let vidIndex = 0, vidLoopCount = 0, vidSectionVisible = false;
let svBigVideo, svVidLabel, svVidLoops, svVidHint, svStripVid, svVideoPreviewWrap;

function buildVideoViewer() {
  const animSection = document.getElementById('animations');
  if (!animSection) return;

  const viewer = document.createElement('div');
  viewer.className = 'steam-viewer';
  viewer.tabIndex = 0;
  viewer.setAttribute('aria-label', 'video viewer');
  viewer.innerHTML = `
    <div class="sv-main">
      <button class="sv-arrow" id="sv-prev-vid" aria-label="Previous video">&#10094;</button>
      <div class="sv-preview-wrap">
        <video class="sv-big-video" id="sv-big-video" playsinline muted preload="none"></video>
        <div class="sv-img-label"   id="sv-vid-label"></div>
        <div class="sv-vid-loops"   id="sv-vid-loops">LOOP 1/2</div>
        <div class="sv-unmute-hint" id="sv-unmute-hint">[ CLICK FOR SOUND ]</div>
      </div>
      <button class="sv-arrow" id="sv-next-vid" aria-label="Next video">&#10095;</button>
    </div>
    <div class="sv-strip-wrap">
      <div class="sv-strip" id="sv-strip-vid"></div>
    </div>`;

  const animTabs = animSection.querySelector('.anim-tabs');
  animTabs.after(viewer);
  document.getElementById('anim-basics').style.display = 'none';
  document.getElementById('anim-oc').style.display     = 'none';
  animTabs.style.display = 'none';

  svBigVideo         = document.getElementById('sv-big-video');
  svVidLabel         = document.getElementById('sv-vid-label');
  svVidLoops         = document.getElementById('sv-vid-loops');
  svVidHint          = document.getElementById('sv-unmute-hint');
  svStripVid         = document.getElementById('sv-strip-vid');
  svVideoPreviewWrap = viewer.querySelector('.sv-preview-wrap');

  const frag = document.createDocumentFragment();
  allVids.forEach((v, i) => {
    const thumb = document.createElement('div');
    thumb.className = 'sv-thumb sv-thumb-vid' + (i === 0 ? ' active' : '');
    thumb.innerHTML = `<div class="sv-thumb-vid-inner"><span class="sv-play-icon">▶</span><span class="sv-thumb-title">${v.label}</span></div>`;
    thumb.addEventListener('click', () => setVidIndex(i, true), { passive: true });
    frag.appendChild(thumb);
  });
  svStripVid.appendChild(frag);

  document.getElementById('sv-prev-vid').addEventListener('click', () => {
    setVidIndex((vidIndex - 1 + allVids.length) % allVids.length, true);
  }, { passive: true });
  document.getElementById('sv-next-vid').addEventListener('click', () => {
    setVidIndex((vidIndex + 1) % allVids.length, true);
  }, { passive: true });

  svBigVideo.addEventListener('ended', () => {
    vidLoopCount++;
    if (vidLoopCount < 2) {
      svVidLoops.textContent = `LOOP ${vidLoopCount + 1}/2`;
      svBigVideo.play().catch(() => {});
    } else {
      setVidIndex((vidIndex + 1) % allVids.length, false);
    }
  });

  svVideoPreviewWrap?.classList.add('loading');
  svBigVideo.addEventListener('loadstart',  () => svVideoPreviewWrap?.classList.add('loading'),    { passive: true });
  svBigVideo.addEventListener('loadeddata', () => svVideoPreviewWrap?.classList.remove('loading'), { passive: true });
  svBigVideo.addEventListener('error',      () => svVideoPreviewWrap?.classList.remove('loading'), { passive: true });

  svBigVideo.addEventListener('click', () => {
    svBigVideo.muted = !svBigVideo.muted;
    svVidHint.textContent = svBigVideo.muted ? '[ CLICK FOR SOUND ]' : '[ CLICK TO MUTE ]';
  }, { passive: true });

  new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      vidSectionVisible = entry.isIntersecting;
      if (entry.isIntersecting) {
        if (!svBigVideo.src || svBigVideo.src === window.location.href) {
          svBigVideo.src = allVids[0].src;
          svBigVideo.load();
        }
        svBigVideo.play().catch(() => {});
      } else {
        if (!svBigVideo.paused) svBigVideo.pause();
      }
    });
  }, { threshold: 0.25 }).observe(animSection);

  setVidIndex(0, false, true);
}

function setVidIndex(i, thumbScroll, metaOnly) {
  if (!svBigVideo) return;
  vidIndex = i;
  vidLoopCount = 0;

  if (!metaOnly) {
    const wasMuted = svBigVideo.muted;
    svVideoPreviewWrap?.classList.add('loading');
    svBigVideo.src   = allVids[i].src;
    svBigVideo.muted = wasMuted;
    svBigVideo.load();
    if (vidSectionVisible) svBigVideo.play().catch(() => {});
  }

  svVidLabel.textContent = allVids[i].label;
  svVidLoops.textContent = 'LOOP 1/2';

  Array.from(svStripVid.children).forEach((t, t_i) => t.classList.toggle('active', t_i === i));
  if (thumbScroll) svStripVid.children[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}


// ── HERO DECO CYCLER ───────────────────────────────────────

function initDecoCycler() {
  const img = document.getElementById('deco-img');
  const lbl = document.getElementById('deco-label');
  const hint = document.getElementById('deco-hint');
  if (!img) return;
  img.src = 'assets/hero/big-icon.png';
  if (lbl)  lbl.textContent   = 'PROFILE.PNG';
  if (hint) hint.style.display = 'none';
}


// ── SCROLL REVEAL ──────────────────────────────────────────

function initScrollReveal() {
  const targets = document.querySelectorAll('.stat-card, .section-header, .terminal-box, .steam-viewer');
  const observer = new IntersectionObserver((entries) => {
    requestAnimationFrame(() => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    });
  }, { threshold: 0.08 });
  targets.forEach(el => observer.observe(el));
}
