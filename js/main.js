(function(){
'use strict';
const D = window.FO_DATA;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const NS = 'http://www.w3.org/2000/svg';
const $ = s => document.querySelector(s);
function el(tag, attrs, parent){ const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function h(tag, cls, parent){ const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
function watch(node){
  const st = {v:false};
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => st.v = e.isIntersecting), {threshold:.2}).observe(node);
  else st.v = true;
  return st;
}
async function until(st){ while(!st.v) await sleep(250); }

/* ---------------- NAV ---------------- */
const nav = $('#nav'), menuBtn = $('#menuBtn');
const onScroll = () => nav.classList.toggle('solid', window.scrollY > 40);
window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
menuBtn.addEventListener('click', () => { const o = nav.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', o); nav.classList.add('solid'); });
document.querySelectorAll('#menu a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); }));

/* ---------------- HERO SLIDESHOW ---------------- */
const heroBg = $('#heroBg');
const heroShots = ['stand-12-1','stand-07-1','stand-17-1','stand-22-1','stand-21-1','stand-11-1'].map(n => 'assets/stands/' + n + '.jpg');
const heroImgs = heroShots.map((src, i) => { const im = h('img', i === 0 ? 'on' : '', heroBg); im.alt = ''; im.src = src; if (i) im.loading = 'lazy'; return im; });
if (!reduce){
  let hi = 0;
  setInterval(() => { heroImgs[hi].classList.remove('on'); hi = (hi + 1) % heroImgs.length; heroImgs[hi].classList.add('on'); }, 5500);
}

/* ---------------- HERO TYPING ---------------- */
const t1 = $('#t1'), t2 = $('#t2'), underline = $('#underline');
const caret = h('span', 'caret'); caret.setAttribute('aria-hidden','true');
const rows = [...document.querySelectorAll('#profile dd')];
async function type(node, text, speed){ node.after(caret); for (const ch of text){ node.textContent += ch; await sleep(speed + Math.random()*speed*.6); } }
(async function hero(){
  if (reduce){ t1.textContent = 'Your Story.'; t2.textContent = 'Our Stand.'; underline.classList.add('on'); rows.forEach(d => d.textContent = d.dataset.v); return; }
  await (window.FO_INTRO || sleep(400));
  await sleep(3000);  // let the particle wordmark form first
  await type(t1, 'Your Story.', 70);
  underline.classList.add('on');
  await sleep(250);
  await type(t2, 'Our Stand.', 70);
  const rc = h('span', 'caret sm');
  for (const d of rows){ d.appendChild(rc); for (const ch of d.dataset.v){ rc.before(document.createTextNode(ch)); await sleep(14); } }
  rc.remove(); t2.after(caret);
})();

/* ---------------- COUNTERS ---------------- */
document.querySelectorAll('[data-count]').forEach(n => {
  if (reduce || !('IntersectionObserver' in window)) return;
  const end = +n.dataset.count; let done = false;
  new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting || done) return; done = true;
    const t0 = performance.now(), dur = 1300;
    (function f(t){ const p = Math.min(1,(t-t0)/dur); n.textContent = Math.round(end*(1-Math.pow(1-p,3))); if (p<1) requestAnimationFrame(f); })(t0);
  }), {threshold:.6}).observe(n);
});

/* ---------------- LIGHTBOX ---------------- */
const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCount = $('#lbCount');
let lbList = [], lbIdx = 0, lbReturn = null;
function lbShow(){ lbImg.src = lbList[lbIdx].src; lbCount.textContent = (lbIdx + 1) + ' / ' + lbList.length; }
function openLB(list, i, from){ lbList = list; lbIdx = i; lbReturn = from; lbShow(); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('#lbClose').focus(); }
function closeLB(){ lb.classList.remove('open'); document.body.style.overflow = ''; if (lbReturn) lbReturn.focus(); }
function step(d){ lbIdx = (lbIdx + d + lbList.length) % lbList.length; lbShow(); }
$('#lbClose').addEventListener('click', closeLB);
$('#lbPrev').addEventListener('click', () => step(-1));
$('#lbNext').addEventListener('click', () => step(1));
lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
document.addEventListener('keydown', e => { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') closeLB(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
let tx = null;
lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, {passive:true});
lb.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); tx = null; });

/* ---------------- STAND GALLERY ---------------- */
const gal = $('#gallery'), moreBtn = $('#moreBtn');
D.stands.forEach((p, i) => {
  const b = h('button', i >= D.mainCount ? 'more' : '', gal); b.type = 'button';
  b.setAttribute('aria-label', 'View stand photo ' + (i + 1) + ' of ' + D.stands.length);
  const im = h('img', '', b); im.src = p.src; im.alt = 'Exhibition stand by FirstOption'; im.width = p.w; im.height = p.h; im.loading = 'lazy'; im.decoding = 'async';
  const z = h('span', 'zoom', b); z.innerHTML = '<svg width="20" height="20"><use href="#i-zoom"/></svg>';
  b.addEventListener('click', () => openLB(D.stands, i, b));
});
moreBtn.textContent = 'Show all ' + D.stands.length + ' photos';
moreBtn.addEventListener('click', () => {
  const all = gal.classList.toggle('all');
  moreBtn.textContent = all ? 'Show fewer photos' : 'Show all ' + D.stands.length + ' photos';
  if (!all) gal.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'});
});

/* ---------------- EVENTS ---------------- */
const eg = $('#eventsGrid');
D.events.forEach(ev => {
  const card = h('article', 'event', eg);
  const shots = h('div', 'shots' + (ev.photos.length === 1 ? ' one' : ''), card);
  ev.photos.slice(0, 3).forEach((p, i) => {
    const b = h('button', '', shots); b.type = 'button'; b.setAttribute('aria-label', 'View ' + ev.tag + ' photo ' + (i + 1));
    const im = h('img', '', b); im.src = p.src; im.alt = ev.tag + ' event by FirstOption'; im.loading = 'lazy';
    if (i === 2 && ev.photos.length > 3){ const c = h('span', 'count', b); c.textContent = '+' + (ev.photos.length - 3) + ' photos'; }
    b.addEventListener('click', () => openLB(ev.photos, i, b));
  });
  if (ev.photos.length === 2) shots.style.gridTemplateRows = '1fr';
  const body = h('div', 'body', card);
  h('div', 'tag', body).textContent = ev.tag;
  h('h3', '', body).textContent = ev.title;
  h('p', '', body).textContent = ev.text;
  const chips = h('div', 'chips', body);
  ev.chips.forEach(c => h('span', 'chip', chips).textContent = c);
});

/* ---------------- CLIENTS ---------------- */
const mq = $('#clientsMarquee');
const per = Math.ceil(D.clients.length / 3);
['', 'rev', 'slow'].forEach((cls, r) => {
  const tr = h('div', 'track ' + cls, mq);
  const list = D.clients.slice(r * per, (r + 1) * per);
  for (let k = 0; k < 2; k++) list.forEach(src => {
    const t = h('div', 'client', tr); if (k) t.setAttribute('aria-hidden', 'true');
    const im = h('img', '', t); im.src = src; im.alt = k ? '' : 'Client logo'; im.loading = 'lazy';
  });
});

/* ---------------- WORLD MAP ---------------- */
(function map(){
  const M = D.map, svg = $('#mapSvg');
  svg.setAttribute('viewBox', `0 0 ${M.W} ${M.H}`);
  const defs = el('defs', {}, svg);
  const lg = el('linearGradient', {id:'arcGrad', x1:'0', y1:'0', x2:'1', y2:'0'}, defs);
  el('stop', {offset:'0', 'stop-color':'#2fe0b0'}, lg); el('stop', {offset:'1', 'stop-color':'#ff8a1f'}, lg);
  let d = '';
  M.rows.forEach((row, ri) => { for (let ci = 0; ci < row.length; ci++) if (row[ci] === '1') d += `M${ci*M.step} ${M.y0 + ri*M.step}h0`; });
  el('path', {d, class:'dot', stroke:'#6a70e6', 'stroke-width':'7', 'stroke-linecap':'round', fill:'none'}, svg);
  const hq = {name:'Dubai, UAE', x:884, y:366};
  const pins = [
    {name:'Canada', x:382, y:213, dx:18, dy:8}, {name:'USA', x:391, y:329, dx:18, dy:8}, {name:'Brazil', x:542, y:518, dx:18, dy:8},
    {name:'Europe', x:788, y:223, dx:-16, dy:-16, a:'end'}, {name:'Türkiye', x:815, y:311, dx:-16, dy:-10, a:'end'}, {name:'Russia', x:991, y:194, dx:18, dy:8},
    {name:'China', x:1026, y:326, dx:18, dy:8}, {name:'Africa', x:767, y:418, dx:-16, dy:8, a:'end'},
    {name:'Indonesia', x:1129, y:439, dx:18, dy:8}, {name:'Singapore', x:1081, y:492, dx:-16, dy:14, a:'end'}
  ];
  const arcs = el('g', {}, svg);
  pins.forEach(p => {
    const mx = (hq.x + p.x)/2, my = (hq.y + p.y)/2, dist = Math.hypot(p.x - hq.x, p.y - hq.y);
    el('path', {class:'arc', d:`M${hq.x} ${hq.y} Q${mx} ${my - dist*.35} ${p.x} ${p.y}`}, arcs);
  });
  [...pins, hq].forEach((p, i) => {
    const g = el('g', {}, svg);
    const pulse = el('circle', {cx:p.x, cy:p.y, r: p === hq ? 14 : 10, class:'pin-pulse'}, g); pulse.style.animationDelay = (i * .22) + 's';
    if (p === hq) pulse.style.fill = '#2fe0b0';
    el('circle', {cx:p.x, cy:p.y, r: p === hq ? 13 : 9, class: 'pin' + (p === hq ? ' hq' : '')}, g);
    const t = el('text', {x: p.x + (p.dx || 22), y: p.y + (p.dy || 8), class:'pin-label', 'text-anchor': p.a || 'start'}, g);
    t.textContent = p.name;
    if (p === hq){ t.setAttribute('font-size', '26'); t.setAttribute('x', p.x + 22); t.setAttribute('y', p.y + 34); }
  });
})();

/* ---------------- ISOMETRIC STAND (shared by Design + Build scenes) ---------------- */
const C = 0.8660254;
function P(o, s, x, y, z){ return [o[0] + (x - y) * C * s, o[1] + (x + y) * 0.5 * s - z * s]; }
function facesOf(b){
  const {x,y,z,w,d,h} = b;
  return { top:[[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]], left:[[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]], right:[[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]] };
}
const ptsStr = (o,s,arr) => arr.map(p => P(o,s,...p).map(n => n.toFixed(1)).join(',')).join(' ');
const pathStr = (o,s,arr) => 'M' + arr.map(p => P(o,s,...p).map(n => n.toFixed(1)).join(' ')).join(' L') + ' Z';
function drawBox(g, o, s, b, col){
  const f = facesOf(b);
  el('polygon', {points: ptsStr(o,s,f.left), fill: col[1]}, g);
  el('polygon', {points: ptsStr(o,s,f.right), fill: col[2]}, g);
  el('polygon', {points: ptsStr(o,s,f.top), fill: col[0]}, g);
}
const MAT = {
  W: ['#f6f5fb','#d8d8ea','#bdbdd6'],
  F: ['#d9d9e6','#a5a6c2','#8586a6'],
  R: ['#6d6dff','#4c4cdc','#3b3bb8'],
  D: ['#262a78','#191c55','#11143f'],
  B: ['#8fd3ff','#4aa7e6','#3a86c0'],
  O: ['#ffa043','#e67812','#bd600c'],
  Wd:['#d8b48b','#b08b63','#8f6f4e']
};
const GRAY = { W:['#d6d6e0','#a9a9b8','#8e8e9e'], F:['#bdbdc8','#8f8f9c','#757582'], R:['#a4a4b2','#7c7c8a','#666674'], D:['#5a5a68','#454552','#3a3a46'], B:['#9a9aa8','#7a7a88','#6a6a78'], O:['#b8b8c4','#93939f','#7d7d89'], Wd:['#b8b8c2','#93939d','#7d7d87'] };
const STAND = [
  { name:'Floor & carpet', pieces:[ [{x:0,y:0,z:0,w:10,d:8,h:.45,m:'F'}], [{x:.4,y:.4,z:.45,w:9.6,d:7.6,h:.06,m:'R'}] ]},
  { name:'Walls', pieces:[ [{x:0,y:0,z:.45,w:.4,d:8,h:5.6,m:'W'}], [{x:.4,y:0,z:.45,w:9.6,d:.4,h:5.6,m:'W'}] ]},
  { name:'Graphics & screen', pieces:[
    [{x:.4,y:2,z:1.8,w:.1,d:3.8,h:2.5,m:'D'},{x:.5,y:2.25,z:2.05,w:.01,d:3.3,h:2,m:'B'}],
    [{x:1.6,y:.4,z:1.4,w:5.8,d:.1,h:3.5,m:'D'}, 'panelBrand'] ]},
  { name:'Furniture', pieces:[
    [{x:.9,y:6.3,z:.51,w:.9,d:.9,h:.9,m:'D'}, 'plant'],
    [{x:3.4,y:4.9,z:.51,w:.22,d:.22,h:1.0,m:'D'},{x:2.6,y:4.1,z:1.51,w:1.8,d:1.8,h:.12,m:'Wd'}],
    [{x:2.0,y:5.7,z:.51,w:.6,d:.6,h:.75,m:'D'}],
    [{x:4.9,y:4.2,z:.51,w:.6,d:.6,h:.75,m:'D'}],
    [{x:6.6,y:5.4,z:.51,w:2.6,d:1.2,h:1.5,m:'W'},{x:6.5,y:5.3,z:2.01,w:2.8,d:1.4,h:.12,m:'O'}, 'counterText'] ]},
  { name:'Header & lights', pieces:[
    [{x:0,y:0,z:6.05,w:1.2,d:8,h:1.1,m:'D'}, 'leftFascia'],
    [{x:0,y:0,z:6.05,w:10,d:1.2,h:1.1,m:'D'}, 'rightFascia'],
    ['lights'] ]}
];
function isoText(g, o, s, p, str, size, fill, plane, weight){
  const [px,py] = P(o,s,...p);
  const m = plane === 'y' ? `matrix(${C},0.5,0,1,${px.toFixed(1)},${py.toFixed(1)})` : `matrix(${C},-0.5,0,1,${px.toFixed(1)},${py.toFixed(1)})`;
  const t = el('text', {transform:m, 'font-family':'Montserrat, Segoe UI, sans-serif', 'font-weight': weight || '800', 'font-size':size, fill}, g);
  t.textContent = str; return t;
}
function isoImage(g, o, s, p, href, wU, hU){
  const [px,py] = P(o,s,...p);
  el('image', {href, width:(wU*s).toFixed(1), height:(hU*s).toFixed(1), transform:`matrix(${C},0.5,0,1,${px.toFixed(1)},${py.toFixed(1)})`, preserveAspectRatio:'xMidYMid meet'}, g);
}
function extras(g, o, s, key){
  if (key === 'panelBrand'){
    isoImage(g,o,s,[2.0,.5,4.55],'assets/brand/mark-white.png',1.95,2.6);
    isoText(g,o,s,[4.35,.5,3.45],'FIRST',s*.72,'#ffffff','y');
    isoText(g,o,s,[4.35,.5,2.55],'OPTION',s*.72,'#ffffff','y');
    isoText(g,o,s,[4.37,.5,2.0],'EXHIBITION & EVENTS',s*.24,'#ffa043','y','700');
  }
  if (key === 'counterText') isoText(g,o,s,[7.1,6.6,1.0],'WELCOME',s*.42,'#4c4cdc','y');
  if (key === 'rightFascia') isoText(g,o,s,[2.6,1.2,6.3],'FIRST OPTION',s*.78,'#ffffff','y');
  if (key === 'leftFascia') isoText(g,o,s,[1.2,7.3,6.32],'EXHIBITIONS',s*.62,'#ffa043','x');
  if (key === 'plant'){
    const c = P(o,s,1.35,6.75,1.8);
    [[0,-.2,.85,'#1f8a5b'],[-.55,.15,.6,'#2fb37a'],[.55,.2,.65,'#2fb37a'],[.1,-.85,.55,'#45d494']].forEach(([dx,dy,r,f]) => el('circle',{cx:(c[0]+dx*s).toFixed(1), cy:(c[1]+dy*s).toFixed(1), r:(r*s).toFixed(1), fill:f}, g));
  }
  if (key === 'lights'){
    [2.6, 5.2, 7.8].forEach(x => {
      const a = P(o,s,x-.12,1.2,6.05), b = P(o,s,x+.12,1.2,6.05), c = P(o,s,x+1.1,4.8,.5), d = P(o,s,x-1.1,4.8,.5);
      el('polygon',{points:[a,b,c,d].map(p=>p.map(n=>n.toFixed(1)).join(',')).join(' '), fill:'url(#cone)', class:'light'}, g);
      const f = P(o,s,x,1.2,6.05);
      el('circle',{cx:f[0].toFixed(1), cy:(f[1]+1).toFixed(1), r:(s*.18).toFixed(1), fill:'#fff3d6'}, g);
    });
  }
}

/* ---------------- BUILD SCENE (pieces placed one by one on an empty plot) ---------------- */
(function build(){
  const scene = $('#buildScene'); if (!scene) return;
  // Cut-out pieces of the finished stand photo: position/size in % of the photo, build step, animation
  const PIECES = [{"n": "carpet", "s": 0, "a": "unroll", "l": 2.75, "t": 67.891, "w": 87.0, "h": 28.908}, {"n": "wallL", "s": 1, "a": "drop", "l": 6.438, "t": 20.433, "w": 33.812, "h": 54.708}, {"n": "wallB", "s": 1, "a": "drop", "l": 39.938, "t": 20.433, "w": 40.438, "h": 52.26}, {"n": "pillar", "s": 1, "a": "drop", "l": 80.062, "t": 22.599, "w": 8.438, "h": 50.659}, {"n": "screen", "s": 2, "a": "power", "l": 13.625, "t": 31.168, "w": 22.0, "h": 25.706}, {"n": "letters", "s": 2, "a": "mount", "l": 50.75, "t": 36.629, "w": 25.688, "h": 9.981}, {"n": "plant", "s": 3, "a": "pop", "l": 37.438, "t": 37.665, "w": 9.188, "h": 31.262}, {"n": "chairL", "s": 3, "a": "pop", "l": 20.0, "t": 58.945, "w": 8.812, "h": 16.855}, {"n": "chairR", "s": 3, "a": "pop", "l": 33.875, "t": 57.815, "w": 7.312, "h": 15.066}, {"n": "table", "s": 3, "a": "pop", "l": 24.75, "t": 56.403, "w": 12.687, "h": 17.985}, {"n": "counter", "s": 3, "a": "drop", "l": 46.438, "t": 56.968, "w": 31.062, "h": 30.603}, {"n": "flowers", "s": 3, "a": "pop", "l": 66.875, "t": 50.753, "w": 5.75, "h": 8.286}, {"n": "header", "s": 4, "a": "crane", "l": 6.438, "t": 6.121, "w": 79.812, "h": 27.024}];
  const wrap = $('#buildPieces'), clock = $('#buildClock'), replay = $('#buildReplay');
  const names = ['Floor & carpet', 'Walls', 'Graphics & screen', 'Furniture', 'Header & lights'];
  const times = ['DAY 1 · 07:00', 'DAY 1 · 15:00', 'DAY 2 · 10:00', 'DAY 2 · 17:30', 'DAY 3 · 09:00'];
  const chips = $('#buildChips');
  names.forEach(n => { const c = h('span', 'chip done', chips); c.textContent = n; });
  const bar = $('#buildBar'), pct = $('#buildPct');
  const els = PIECES.map(p => {
    const d = h('div', 'pc ' + p.a, wrap);
    d.style.cssText = `left:${p.l}%;top:${p.t}%;width:${p.w}%;height:${p.h}%;background-image:url(assets/scenes/pieces/${p.n}.webp)`;
    return d;
  });
  const total = PIECES.length;
  const SHOW = 'SHOW DAY · 10:00';
  els.forEach(e => e.classList.add('landed')); scene.classList.add('lit', 'done');
  bar.style.width = '100%'; pct.textContent = '100%'; clock.textContent = SHOW;
  const st = watch(scene);
  if (reduce){ replay.hidden = true; return; }
  function puff(p){
    const d = h('span', 'dust', wrap);
    d.style.left = (p.l + p.w / 2) + '%'; d.style.top = (p.t + p.h) + '%'; d.style.width = Math.max(8, p.w * .9) + '%';
    setTimeout(() => d.remove(), 900);
  }
  function bump(){ scene.classList.remove('bump'); void scene.offsetWidth; scene.classList.add('bump'); }
  let run = 0, placed = 0;
  function setProgress(){ const v = Math.round(placed / (total + 1) * 100); bar.style.width = v + '%'; pct.textContent = v + '%'; }
  async function place(i, my){
    const p = PIECES[i], e = els[i];
    e.classList.remove('wait');
    await sleep({unroll:1300, drop:620, pop:520, power:300, mount:650, crane:1900}[p.a] || 600);
    if (my !== run) return;
    e.classList.add('landed'); placed++; setProgress();
    if (p.a === 'drop' || p.a === 'crane'){ puff(p); bump(); }
    if (p.a === 'pop') puff(p);
    if (p.a === 'power') await sleep(800);
  }
  async function play(my){
    scene.classList.add('fading'); await sleep(500); if (my !== run) return;
    scene.classList.add('notrans'); scene.classList.remove('lit', 'done');
    els.forEach(e => { e.classList.add('wait'); e.classList.remove('landed'); });
    placed = 0; setProgress(); clock.textContent = times[0];
    [...chips.children].forEach(c => c.className = 'chip');
    void scene.offsetWidth; scene.classList.remove('notrans', 'fading');
    await sleep(900);
    for (let s = 0; s < names.length; s++){
      if (my !== run) return;
      chips.children[s].className = 'chip on'; clock.textContent = times[s];
      const idx = PIECES.map((p, i) => p.s === s ? i : -1).filter(i => i >= 0);
      for (let k = 0; k < idx.length; k++){
        const pr = place(idx[k], my);
        if (k === idx.length - 1) await pr; else await sleep(s === 3 ? 330 : 520);
      }
      if (my !== run) return;
      if (s === 4){
        await sleep(300); scene.classList.add('lit'); placed = total + 1; setProgress();
        await sleep(900);
      } else await sleep(500);
      chips.children[s].className = 'chip done';
    }
    // Finishing touch: the stand is handed over, ready for the show
    await sleep(350); if (my !== run) return;
    scene.classList.add('done'); clock.textContent = SHOW;
  }
  (async function loop(){
    await sleep(800);
    while (true){
      await until(st);
      const my = ++run; await play(my);
      if (my !== run){ await sleep(300); continue; }
      await sleep(4500);
    }
  })();
  replay.addEventListener('click', () => { run++; play(run); });
})();

/* ---------------- DESIGN SCENE (live render on the designer's screen) ---------------- */
(function design(){
  const svg = $('#designSvg'); if (!svg) return;
  const VW = 572, VH = 352, mo = [276, 178], ms = 15;
  const defs = el('defs', {}, svg);
  const bg = el('linearGradient', {id:'vpBg', x1:'0', y1:'0', x2:'0', y2:'1'}, defs);
  el('stop', {offset:'0', 'stop-color':'#10152a'}, bg); el('stop', {offset:'1', 'stop-color':'#22253f'}, bg);
  const cone = el('linearGradient', {id:'cone', x1:'0', y1:'0', x2:'0', y2:'1'}, defs);
  el('stop', {offset:'0', 'stop-color':'#fff3d6', 'stop-opacity':'.55'}, cone); el('stop', {offset:'1', 'stop-color':'#fff3d6', 'stop-opacity':'0'}, cone);
  const grid = el('pattern', {id:'vpGrid', width:'24', height:'24', patternUnits:'userSpaceOnUse'}, defs);
  el('path', {d:'M24 0H0V24', fill:'none', stroke:'#2b3060', 'stroke-width':'1'}, grid);
  el('rect', {width:VW, height:VH, fill:'url(#vpBg)'}, svg);
  el('rect', {width:VW, height:VH, fill:'url(#vpGrid)', opacity:'.55'}, svg);
  el('rect', {x:12, y:10, width:118, height:26, rx:6, fill:'#1d2142'}, svg);
  el('text', {x:24, y:28, fill:'#d6d8f5', 'font-family':'DM Sans, sans-serif', 'font-size':'13', 'font-weight':'600'}, svg).textContent = 'Isometric View  ▾';
  el('ellipse', {cx:mo[0] + 14, cy:mo[1] + 138, rx:170, ry:26, fill:'#000', opacity:'.35'}, svg);
  const boxes = [], keys = [];
  STAND.forEach(ph => ph.pieces.forEach(items => items.forEach(it => typeof it === 'string' ? keys.push(it) : boxes.push(it))));
  const gGray = el('g', {class:'fade off'}, svg), gColor = el('g', {class:'fade off'}, svg), gWire = el('g', {class:'wire'}, svg);
  const wires = [];
  boxes.forEach(b => {
    drawBox(gGray, mo, ms, b, GRAY[b.m]); drawBox(gColor, mo, ms, b, MAT[b.m]);
    const f = facesOf(b);
    ['top','left','right'].forEach(k => wires.push([el('path', {d: pathStr(mo,ms,f[k]), pathLength:'1'}, gWire), P(mo,ms,...f[k][0])]));
  });
  keys.forEach(k => extras(gColor, mo, ms, k));
  // status line + render bar
  const status = el('text', {x:16, y:VH - 16, fill:'#a9adf0', 'font-family':'JetBrains Mono, monospace', 'font-size':'15', 'font-weight':'600'}, svg);
  el('rect', {x:VW - 176, y:VH - 28, width:160, height:8, rx:4, fill:'#2b3060'}, svg);
  const rbar = el('rect', {x:VW - 176, y:VH - 28, width:160, height:8, rx:4, fill:'#ff8a1f'}, svg);
  const badge = el('g', {class:'badge off'}, svg);
  el('rect', {x:VW - 150, y:10, width:136, height:34, rx:17, fill:'#0d3b30', stroke:'#2fe0b0', 'stroke-width':'2'}, badge);
  el('text', {x:VW - 82, y:33, 'text-anchor':'middle', fill:'#2fe0b0', 'font-family':'DM Sans, sans-serif', 'font-weight':'800', 'font-size':'17'}, badge).textContent = '✓ APPROVED';
  const pen = el('g', {class:'pen'}, svg);
  el('path', {d:'M0 0 L0 22 L6 16.6 L10.5 26 L14.2 24.4 L9.8 15.2 L17.8 14.6 Z', fill:'#fff', stroke:'#111', 'stroke-width':'1.3'}, pen);
  const movePen = (x,y) => pen.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  const setBar = v => rbar.setAttribute('width', (160 * v).toFixed(1));
  const chips = [...$('#designChips').children];
  const stepTo = i => chips.forEach((c,j) => c.className = 'chip' + (j < i ? ' done' : j === i ? ' on' : ''));
  // finished state
  gColor.classList.remove('off'); gWire.style.opacity = '0'; badge.classList.remove('off'); movePen(VW - 60, 70);
  status.textContent = 'Render complete'; setBar(1); chips.forEach(c => c.className = 'chip done');
  const st = watch(svg);
  if (reduce) return;
  (async function loop(){
    await sleep(800);
    while (true){
      await until(st);
      gColor.classList.add('off'); gGray.classList.add('off'); badge.classList.add('off');
      await sleep(600);
      gWire.style.opacity = '1';
      wires.forEach(([p]) => { p.style.transition = 'none'; p.style.strokeDashoffset = '1'; });
      void gWire.getBBox();
      stepTo(0); status.textContent = 'Sketching concept…'; setBar(0);
      for (let i = 0; i < wires.length; i++){
        const [p, s0] = wires[i];
        movePen(s0[0], s0[1]); p.style.transition = ''; p.style.strokeDashoffset = '0';
        setBar((i + 1) / wires.length * .35);
        await sleep(130);
      }
      await sleep(500);
      stepTo(1); status.textContent = 'Building 3D model…'; gGray.classList.remove('off');
      for (let v = .35; v <= .6; v += .05){ setBar(v); await sleep(260); }
      stepTo(2); status.textContent = 'Rendering materials & light…';
      for (let v = .6; v <= 1.001; v += .04){ setBar(v); movePen(VW - 120 + Math.random() * 40, VH - 60 + Math.random() * 20); await sleep(120); }
      gColor.classList.remove('off'); gWire.style.opacity = '0'; await sleep(700); gGray.classList.add('off');
      status.textContent = 'Render complete';
      await sleep(900);
      stepTo(3); movePen(VW - 60, 52); status.textContent = 'Sent to client…';
      await sleep(900); badge.classList.remove('off'); status.textContent = 'Approved by client';
      await sleep(700); chips[3].className = 'chip done';
      await sleep(3200);
    }
  })();
})();

/* ---------------- CLIENT CARE SCENE (photo + live chat) ---------------- */
(function care(){
  const scene = $('#careScene'); if (!scene) return;
  const alt = scene.querySelector('.ps-alt');
  const bubL = $('#bubL'), bubR = $('#bubR'), hearts = $('#hearts');
  const chips = [...$('#careChips').children], stars = [...document.querySelectorAll('#stars i')];
  chips.forEach(c => c.className = 'chip done'); stars.forEach(s => s.classList.add('on'));
  async function say(b, text, hold){
    b.querySelector('.msg').textContent = ''; b.classList.add('show','typing'); await sleep(900);
    b.querySelector('.msg').textContent = text; b.classList.remove('typing'); await sleep(hold);
  }
  const script = [
    ['L','We need a double-decker stand for our next event.', null],
    ['R','Here is your 3D concept, budget and timeline.', 0],
    ['L','Can we add a meeting room upstairs?', 1],
    ['R','Done. Updated design sent today.', 2],
    ['L','Approved. Let’s build it!', null]
  ];
  const st = watch(scene);
  if (reduce){ bubL.classList.add('show'); bubL.querySelector('.msg').textContent = script[4][1]; bubR.classList.add('show'); bubR.querySelector('.msg').textContent = script[3][1]; return; }
  (async function loop(){
    await sleep(600);
    while (true){
      await until(st);
      alt.classList.remove('on'); bubL.classList.remove('show'); bubR.classList.remove('show');
      chips.forEach(c => c.className = 'chip'); stars.forEach(s => s.classList.remove('on')); hearts.classList.remove('go');
      await sleep(900);
      chips[0].className = 'chip on';
      for (const [side, text, chip] of script){
        const b = side === 'L' ? bubL : bubR;
        (side === 'L' ? bubR : bubL).classList.remove('show');
        await say(b, text, 1700);
        if (chip !== null){ chips[chip].className = 'chip done'; if (chips[chip+1]) chips[chip+1].className = 'chip on'; }
      }
      chips[3].className = 'chip done';
      bubL.classList.remove('show'); bubR.classList.remove('show');
      await sleep(300);
      alt.classList.add('on');
      await sleep(1100);
      void hearts.offsetWidth; hearts.classList.add('go');
      for (const s of stars){ s.classList.add('on'); await sleep(180); }
      await sleep(3600);
    }
  })();
})();

/* ---------------- QUOTE FORM (opens WhatsApp or email) ---------------- */
const form = $('#quoteForm'), hint = $('#formHint');
form.addEventListener('submit', e => {
  e.preventDefault();
  const via = (e.submitter && e.submitter.dataset.via) || 'wa';
  const f = Object.fromEntries(new FormData(form).entries());
  if (!f.name.trim()){ hint.textContent = 'Please add your name so we know who to reply to.'; hint.style.color = '#ffb36b'; $('#f-name').focus(); return; }
  const lines = [
    'Hello FirstOption, I would like a quote.',
    'Name: ' + f.name,
    f.company && 'Company: ' + f.company,
    f.show && 'Show / event: ' + f.show,
    f.size && 'Stand size: ' + f.size,
    'Project type: ' + f.type,
    f.message && 'Message: ' + f.message
  ].filter(Boolean).join('\n');
  const url = via === 'wa'
    ? 'https://wa.me/971558319935?text=' + encodeURIComponent(lines)
    : 'mailto:info@firstoptiondxb.com?subject=' + encodeURIComponent('Quote request – ' + (f.show || f.type)) + '&body=' + encodeURIComponent(lines);
  hint.style.color = ''; hint.textContent = via === 'wa' ? 'Opening WhatsApp…' : 'Opening your email app…';
  if (via === 'wa'){ const w = window.open(url, '_blank', 'noopener'); if (!w) location.href = url; }
  else location.href = url;
});
})();
