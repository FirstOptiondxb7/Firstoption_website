/* =========================================================================
   CREATIVE LAYER – extra motion on top of main.js
   Loader, scroll reveals, split headings, kinetic ribbons, parallax,
   tilt cards, magnetic buttons, custom cursor, scroll progress.
   ========================================================================= */
(function(){
'use strict';
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- Intro loader (main.js waits on FO_INTRO before typing the headline) ---------- */
const pre = $('#preloader');
let introDone;
window.FO_INTRO = new Promise(r => introDone = r);
(async function intro(){
  if (!pre){ introDone(); return; }
  if (reduce){ pre.remove(); introDone(); return; }
  const loaded = new Promise(r => document.readyState === 'complete' ? r() : window.addEventListener('load', r, {once:true}));
  await Promise.race([Promise.all([loaded, sleep(1150)]), sleep(2600)]);
  pre.classList.add('out');
  await sleep(520);
  introDone();
  await sleep(600);
  pre.remove();
})();

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Scroll progress + active nav link ---------- */
  const bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
  const links = $$('#menu a');
  const targets = links.map(a => $(a.getAttribute('href'))).filter(Boolean);

  /* ---------- Giant outlined background words ---------- */
  const words = {about:'Values', services:'Services', process:'Process', stands:'Stands', events:'Events', clients:'Clients', network:'Global'};
  const bgWords = [];
  Object.entries(words).forEach(([id, w]) => {
    const sec = document.getElementById(id); if (!sec) return;
    const d = document.createElement('div'); d.className = 'bg-word'; d.setAttribute('aria-hidden', 'true');
    d.textContent = (w + ' · ').repeat(3);
    sec.prepend(d); bgWords.push([d, sec]);
  });

  /* ---------- Kinetic ribbons: fill the track twice for a seamless loop ---------- */
  const ribbons = $$('.ribbon:not([hidden])').map((r, i) => {
    const t = r.querySelector('.ribbon-track');
    const html = t.innerHTML; t.innerHTML = html + html + html + html;
    const o = {t, x: 0, dir: i % 2 ? 1 : -1, w: 0, paused: false};
    return o;
  });
  const measure = () => ribbons.forEach(r => r.w = r.t.scrollWidth / 2);
  measure(); window.addEventListener('resize', measure);

  /* ---------- One rAF loop for everything scroll-driven ---------- */
  const hero = $('.hero'), heroWrap = $('.hero .wrap'), heroBg = $('#heroBg'), shapes = $('.shapes');
  let lastY = window.scrollY, vel = 0, mx = 0, my = 0;
  function frame(){
    const y = window.scrollY, vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    vel += ((y - lastY) - vel) * .12; lastY = y;

    if (!reduce){
      // Hero parallax
      if (y < vh * 1.2){
        heroWrap.style.transform = 'translate3d(0,' + (y * .22) + 'px,0)';
        heroWrap.style.opacity = Math.max(0, 1 - y / (vh * .85));
        heroBg.style.transform = 'translate3d(0,' + (y * .35) + 'px,0)';
        if (shapes) shapes.style.transform = 'translate3d(' + (mx * -18) + 'px,' + (y * -.15 + my * -18) + 'px,0)';
      }
      // Ribbons speed up with scroll
      const boost = 1 + Math.min(10, Math.abs(vel) * .35);
      ribbons.forEach(r => {
        if (!r.paused) r.x += r.dir * .6 * boost;
        if (r.w){ if (r.x <= -r.w) r.x += r.w; if (r.x > 0) r.x -= r.w; }
        r.t.style.transform = 'translate3d(' + r.x + 'px,0,0)';
      });
      // Background words drift sideways as you scroll
      bgWords.forEach(([d, sec], i) => {
        const r = sec.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (vh - r.top) / (vh + r.height);
        d.style.transform = 'translate3d(' + ((i % 2 ? -1 : 1) * (p * 260) - 120) + 'px,0,0)';
      });
    }

    // Active nav link
    let cur = null;
    targets.forEach(t => { if (t.getBoundingClientRect().top < vh * .4) cur = t; });
    links.forEach(a => a.classList.toggle('active', !!cur && a.getAttribute('href') === '#' + cur.id));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  if (reduce) return; // Everything below is pure motion

  /* ---------- Hero: aurora follows the mouse a little ---------- */
  const aurora = $('.aurora');
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5;
    if (aurora) aurora.style.transform = 'translate3d(' + (mx * 40) + 'px,' + (my * 40) + 'px,0)';
  });

  /* ---------- Split headings into words ---------- */
  function split(node){
    let n = 0;
    const walk = parent => {
      [...parent.childNodes].forEach(ch => {
        if (ch.nodeType === 3){
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const wi = document.createElement('span'); wi.className = 'wi'; wi.style.setProperty('--wi', n++);
            wi.textContent = part; w.appendChild(wi); frag.appendChild(w);
          });
          parent.replaceChild(frag, ch);
        } else if (ch.nodeType === 1){
          // Keep styled spans (gradient text) whole so their effects survive
          const w = document.createElement('span'); w.className = 'w';
          const wi = document.createElement('span'); wi.className = 'wi'; wi.style.setProperty('--wi', n++);
          parent.replaceChild(w, ch); wi.appendChild(ch); w.appendChild(wi);
        }
      });
    };
    if (!node.getAttribute('aria-label')) node.setAttribute('aria-label', node.textContent.trim());
    walk(node);
    node.classList.add('split');
  }
  $$('.sec-head h2, .cta-band h2, .service h3').forEach(split);

  /* ---------- Mark elements for scroll reveal ---------- */
  const mark = (sel, cls, step) => $$(sel).forEach((e, i, all) => {
    e.classList.add('rv'); if (cls) e.classList.add(cls);
    const sib = e.parentElement ? [...e.parentElement.children].indexOf(e) : i;
    e.style.setProperty('--d', ((step == null ? .08 : step) * Math.min(sib, 8)) + 's');
  });
  mark('.sec-head > :not(h2)');
  mark('.about .mission, .about .quote', 'left');
  mark('.value', 'zoom', .1);
  mark('.division', null, .15);
  mark('.service .copy > :not(h3)', null, .06);
  mark('.service .stage', 'zoom');
  mark('.care > div', null, .1);
  mark('.event', null, .12);
  mark('.places > div', 'right', .12);
  mark('.map-card', 'zoom');
  mark('.contact-list > *', 'left', .07);
  mark('.form', 'right');
  mark('.cta-band .eyebrow, .cta-band .lede');
  mark('footer .wrap > :not(.footer-mega)', null, .1);
  $$('.gallery button').forEach((b, i) => { b.classList.add('rv'); b.style.setProperty('--d', (i % 3) * .12 + 's'); });

  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.classList.contains('eyebrow')) scramble(e.target);
    io.unobserve(e.target);
  }), {threshold: .15, rootMargin: '0px 0px -6% 0px'});
  $$('.rv, .split, .footer-mega, .sec-head .eyebrow').forEach(e => io.observe(e));
  // Gallery items revealed later by "Show all" also need watching
  const moreBtn = $('#moreBtn');
  if (moreBtn) moreBtn.addEventListener('click', () => setTimeout(() => $$('.gallery button.rv:not(.in)').forEach(b => io.observe(b)), 50));

  /* ---------- Text scramble on section eyebrows ---------- */
  const glyphs = '!<>-_/[]{}=+*^?#ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  function scramble(node){
    if (node.dataset.scrambled) return; node.dataset.scrambled = 1;
    const final = node.textContent; let f = 0; const total = 22;
    node.setAttribute('aria-label', final);
    (function tick(){
      const out = [...final].map((c, i) => c === ' ' ? ' ' : (i < (f / total) * final.length ? c : glyphs[Math.random() * glyphs.length | 0])).join('');
      node.textContent = out;
      if (++f <= total) setTimeout(tick, 38); else node.textContent = final;
    })();
  }
  window.FO_INTRO.then(() => { const he = $('.hero .eyebrow'); if (he) scramble(he); });

  /* ---------- Map pins pop in one after another ---------- */
  $$('#mapSvg .pin').forEach((p, i) => p.style.transitionDelay = (.25 + i * .09) + 's');
  $$('#mapSvg .pin-label').forEach((p, i) => p.style.transitionDelay = (.45 + i * .09) + 's');

  if (!finePointer) return; // Mouse-only effects below

  /* ---------- 3D tilt + glare ---------- */
  $$('.value, .event, .profile, .division, .care > div, .stat').forEach(card => {
    card.classList.add('tilt');
    const g = document.createElement('span'); g.className = 'glare'; card.appendChild(g);
    const amt = card.classList.contains('division') ? 4 : card.classList.contains('profile') ? 6 : 9;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.classList.add('hovering');
      card.style.transform = 'perspective(900px) rotateX(' + ((.5 - py) * amt) + 'deg) rotateY(' + ((px - .5) * amt) + 'deg) translateY(-4px)';
      card.style.setProperty('--gx', px * 100 + '%'); card.style.setProperty('--gy', py * 100 + '%');
    });
    card.addEventListener('mouseleave', () => { card.classList.remove('hovering'); card.style.transform = ''; });
  });

  /* ---------- Magnetic buttons ---------- */
  $$('.btn, .wa').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      b.style.translate = (dx * .25) + 'px ' + (dy * .35) + 'px';
    });
    b.addEventListener('mouseleave', () => b.style.translate = '');
  });

  /* ---------- Custom cursor ---------- */
  const ring = document.createElement('div'); ring.className = 'cursor'; ring.innerHTML = '<b>VIEW</b>';
  const dot = document.createElement('div'); dot.className = 'cursor-dot';
  document.body.append(ring, dot);
  let cx = innerWidth / 2, cy = innerHeight / 2, rx = cx, ry = cy;
  window.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    document.body.classList.add('has-cursor');
    const t = e.target.closest ? e.target : null;
    const view = t && t.closest('.gallery button, .event .shots button');
    const link = !view && t && t.closest('a, button, input, select, textarea, label, .tags span');
    ring.classList.toggle('view', !!view);
    ring.classList.toggle('link', !!link);
  }, {passive:true});
  document.addEventListener('mouseleave', () => document.body.classList.remove('has-cursor'));
  window.addEventListener('mousedown', () => ring.classList.add('down'));
  window.addEventListener('mouseup', () => ring.classList.remove('down'));
  (function follow(){
    rx += (cx - rx) * .18; ry += (cy - ry) * .18;
    ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
    dot.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
    requestAnimationFrame(follow);
  })();
});
})();
