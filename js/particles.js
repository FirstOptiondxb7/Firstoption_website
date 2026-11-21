/* =========================================================================
   PARTICLE WORDMARK – "FIRST OPTION" assembles from drifting specks
   at the top of the hero. Specks scatter away from the mouse and drift back.
   ========================================================================= */
(function(){
'use strict';
const box = document.getElementById('heroMark');
if (!box) return;
const canvas = box.querySelector('canvas');
const ctx = canvas.getContext('2d');
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const WORD1 = 'FIRST', WORD2 = 'OPTION';
const lerp = (a, b, t) => a + (b - a) * t;
let W = 0, H = 0, dpr = 1, parts = [], dust = [], started = false, t0 = 0, visible = true, raf = 0;
const mouse = {x: -9999, y: -9999};

// colour for OPTION: indigo -> violet -> pink across the word
function grad(u){
  const s = [[91,91,255],[164,107,255],[255,111,181]];
  const i = u < .5 ? 0 : 1, f = u < .5 ? u * 2 : (u - .5) * 2;
  return s[i].map((c, k) => Math.round(lerp(c, s[i + 1][k], f)));
}

function layout(){
  const r = box.getBoundingClientRect();
  dpr = Math.min(2, window.devicePixelRatio || 1);
  W = Math.max(200, Math.round(r.width)); H = Math.round(W * .2);
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  box.style.height = H + 'px';
  // draw the word offscreen and sample its pixels
  const off = document.createElement('canvas'); off.width = W; off.height = H;
  const o = off.getContext('2d');
  let size = 100;
  const font = s => `800 ${s}px Montserrat, "Segoe UI", system-ui, sans-serif`;
  o.font = font(size);
  const gap = .32;  // space between words, in em
  const w1 = o.measureText(WORD1).width, w2 = o.measureText(WORD2).width;
  const total = w1 + w2 + size * gap;
  size = Math.min(size * (W * .9) / total, H * .82);
  o.font = font(size); o.textBaseline = 'middle';
  const a1 = o.measureText(WORD1).width, a2 = o.measureText(WORD2).width, g = size * gap;
  const x0 = (W - (a1 + a2 + g)) / 2, y = H * .54;
  o.fillStyle = '#fff';
  o.fillText(WORD1, x0, y); o.fillText(WORD2, x0 + a1 + g, y);
  const data = o.getImageData(0, 0, W, H).data;
  const splitX = x0 + a1 + g / 2;
  let filled = 0;
  for (let i = 3; i < data.length; i += 16) if (data[i] > 128) filled++;
  filled *= 4;
  const step = Math.max(2, Math.sqrt(filled / (W < 600 ? 2200 : 4200)));
  const targets = [];
  for (let yy = 0; yy < H; yy += step) for (let xx = 0; xx < W; xx += step){
    const jx = xx + (Math.random() - .5) * step * .8, jy = yy + (Math.random() - .5) * step * .8;
    const ix = Math.round(jx), iy = Math.round(jy);
    if (ix < 0 || iy < 0 || ix >= W || iy >= H) continue;
    if (data[(iy * W + ix) * 4 + 3] > 128) targets.push([jx, jy]);
  }
  const optL = x0 + a1 + g, optR = optL + a2;
  const prev = parts;
  parts = targets.map((t, i) => {
    const second = t[0] > splitX;
    const col = second ? grad(Math.min(1, Math.max(0, (t[0] - optL) / (optR - optL)))) : [236, 238, 255];
    const old = prev[i];
    // start: scattered across and beyond the box, like dust in the air
    const sx = old ? old.x : Math.random() * W * 1.4 - W * .2;
    const sy = old ? old.y : Math.random() * H * 3 - H;
    return {tx: t[0], ty: t[1], x: sx, y: sy, vx: (Math.random() - .5) * .6, vy: (Math.random() - .5) * .6,
            delay: Math.random() * 1600 + (t[0] / W) * 1400, r: Math.random() * .7 + .8,
            c: col, tw: Math.random() * Math.PI * 2};
  });
  // a few strays that never land, and corner specks like the reference
  dust = Array.from({length: Math.round(W / 9)}, () => ({x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .18, r: Math.random() * .9 + .4, a: Math.random() * .5 + .15}));
  if (reduce || (started && prev.length)) parts.forEach(p => { if (reduce){ p.x = p.tx; p.y = p.ty; } });
}

function frame(now){
  raf = 0;
  if (!visible) return;
  const t = started ? now - t0 : -1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  // strays
  for (const d of dust){
    if (!reduce){ d.x += d.vx; d.y += d.vy; if (d.x < 0) d.x += W; if (d.x > W) d.x -= W; if (d.y < 0) d.y += H; if (d.y > H) d.y -= H; }
    ctx.fillStyle = `rgba(210,214,255,${d.a})`;
    ctx.fillRect(d.x, d.y, d.r, d.r);
  }
  // word specks
  for (const p of parts){
    let k = 0;
    if (reduce) k = 1;
    else if (t >= 0){ const e = t - p.delay; k = e <= 0 ? 0 : Math.min(1, e / 2200); }
    if (!reduce){
      if (k > 0){
        const s = .004 + .032 * k * k;
        p.vx += (p.tx - p.x) * s; p.vy += (p.ty - p.y) * s;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy, R = 70;
        if (d2 < R * R && k >= 1){ const d = Math.sqrt(d2) || 1, f = (R - d) / R * 3.2; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx *= .86; p.vy *= .86;
      } else { p.vx = p.vx * .97 + (Math.random() - .5) * .05; p.vy = p.vy * .97 + (Math.random() - .5) * .05; }
      p.x += p.vx; p.y += p.vy;
    }
    const dist = Math.abs(p.x - p.tx) + Math.abs(p.y - p.ty);
    const tw = reduce ? 1 : .82 + .18 * Math.sin(now * .003 + p.tw);
    const a = (k === 0 ? .28 : Math.max(.3, 1 - dist / 120)) * tw;
    ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${a})`;
    ctx.fillRect(p.x - p.r / 2, p.y - p.r / 2, p.r * 1.6, p.r * 1.6);
  }
  if (!reduce) raf = requestAnimationFrame(frame);
}
function kick(){ if (!raf) raf = requestAnimationFrame(frame); }

function start(){
  started = true; t0 = performance.now();
  box.classList.add('formed');
  kick();
}

let rt;
window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); kick(); }, 150); });
box.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
box.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible) kick(); })).observe(box);

const fontsReady = (document.fonts && document.fonts.load) ? document.fonts.load('800 100px Montserrat').catch(() => {}) : Promise.resolve();
Promise.race([fontsReady, new Promise(r => setTimeout(r, 1500))]).then(() => {
  layout(); kick();
  if (reduce){ box.classList.add('formed'); return; }
  (window.FO_INTRO || Promise.resolve()).then(() => setTimeout(start, 250));
});
})();
