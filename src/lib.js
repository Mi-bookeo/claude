/* Biblioteca común de la serie (reutilizada del vídeo 01 «Marta y los zapatos» y ampliada).
   Dibujo determinista: cada fotograma se calcula SOLO a partir de (escena, t local, T global). */
'use strict';

const W = 1080, H = 1920;
const C = {
  red: '#D32F2F', dred: '#8E1B1B', cream: '#FFF5F3', blue: '#3F7CC4', blueS: '#2B5A99',
  navy: '#2D4A6B', glass: '#BFE3F2', skin: '#F6C9A0', skinS: '#E9B88F', hair: '#5A3A2A',
  ink: '#1E1A1A', pink: '#F48FB1', green: '#2E9E5B', sky: '#BFE3F2', skyL: '#E4F4FA',
  ground: '#F2B5AD', white: '#FFFFFF'
};
const INK = C.ink;
// Contorno: 3 px en una escena base de 380 px de ancho -> 3 * 1080/380
const SW = 3 * W / 380; // ≈ 8.5 px
const PI = Math.PI;

let CFG = null;
let uid = 0;

/* ---------- utilidades ---------- */
const f = n => (Math.round(n * 100) / 100);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const easeOut = u => 1 - Math.pow(1 - clamp(u), 3);
const easeInOut = u => { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
// rebote tipo cómic: 0 -> 1 con sobreimpulso (~13 %) y asentamiento
function pop(t, start, dur = 0.5) {
  const u = (t - start) / dur;
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return 1 - Math.exp(-6.5 * u) * Math.cos(3.2 * PI * u);
}
function damp(t, freq = 9, dec = 4) { if (t < 0) return 1; return Math.exp(-dec * t) * Math.cos(freq * t); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function at(cx, cy, s, inner, rot = 0) {
  if (s <= 0.001) return '';
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(rot)}) scale(${f(s)})">${inner}</g>`;
}

/* ---------- texto ---------- */
const FONTS = { B: { fam: 'Baloo2', wt: 800 }, G: { fam: 'Bangers', wt: 400 } };
const mctx = document.createElement('canvas').getContext('2d');
function measure(str, size, font = 'B') {
  const F = FONTS[font];
  mctx.font = `${F.wt} ${size}px ${F.fam}`;
  return mctx.measureText(str).width;
}
function fit(str, size, maxW, font = 'B') { const w = measure(str, size, font); return w > maxW ? size * maxW / w : size; }
function text(str, x, y, o = {}) {
  const size = o.size || 100, font = o.font || 'B', fill = o.fill || '#FFFFFF';
  const stroke = o.stroke === undefined ? INK : o.stroke;
  const sw = o.sw || Math.max(SW * 1.6, size * 0.16);
  const F = FONTS[font];
  const base = `x="${f(x)}" y="${f(y)}" font-family="${F.fam}" font-weight="${F.wt}" font-size="${f(size)}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="central"${o.ls ? ` letter-spacing="${o.ls}"` : ''}`;
  let s = '';
  if (o.shadow !== false && stroke) {
    const d = o.sd || Math.max(5, size * 0.06);
    s += `<text ${base} transform="translate(${f(d)} ${f(d)})" fill="${INK}" stroke="${INK}" stroke-width="${f(sw)}" stroke-linejoin="round">${esc(str)}</text>`;
  }
  s += `<text ${base} fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${f(sw)}" stroke-linejoin="round" paint-order="stroke"` : ''}>${esc(str)}</text>`;
  return s;
}

/* ---------- cielo, nubes, pájaros, suelo ---------- */
const CLOUDS = [
  { x0: 140, y: 280, s: 0.85, v: 16 },
  { x0: 760, y: 430, s: 1.10, v: 27 },
  { x0: 420, y: 610, s: 0.60, v: 10 },
  { x0: 1000, y: 780, s: 0.75, v: 14 },
  { x0: 260, y: 960, s: 0.50, v: 7 }
];
function cloud(x, y, s, fill = C.white) {
  const circ = [[-60, 10, 45], [0, -15, 62], [70, -30, 70], [140, -5, 55], [188, 15, 38]];
  const sw = 2 * SW / s;
  let a = '', b = '';
  circ.forEach(([cx, cy, r]) => { a += `<circle cx="${cx}" cy="${cy}" r="${r}"/>`; b += `<circle cx="${cx}" cy="${cy}" r="${r}"/>`; });
  a += `<rect x="-100" y="0" width="320" height="56" rx="28"/>`;
  b += `<rect x="-100" y="0" width="320" height="56" rx="28"/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><g fill="${INK}" stroke="${INK}" stroke-width="${f(sw)}">${a}</g><g fill="${fill}">${b}</g></g>`;
}
function clouds(T, yShift = 0) {
  let s = '';
  const span = W + 700;
  CLOUDS.forEach(c => {
    const x = (((c.x0 - c.v * T) % span) + span) % span - 320;
    s += cloud(x, c.y + yShift, c.s);
  });
  return s;
}
const BIRDS = [
  { p: 7.0, o: 0.6, d: 3.6, dir: 1, lane: 0, size: 34 },
  { p: 8.6, o: 3.7, d: 4.2, dir: -1, lane: 1, size: 28 },
  { p: 9.6, o: 6.1, d: 3.3, dir: 1, lane: 2, size: 40 }
];
function bird(x, y, a, fl) {
  const lift = -a * 0.6 * fl;
  return `<path d="M${f(x - a)} ${f(y + lift)} Q${f(x - a * 0.45)} ${f(y + lift * 0.25 - a * 0.38)} ${f(x)} ${f(y + a * 0.14)} Q${f(x + a * 0.45)} ${f(y + lift * 0.25 - a * 0.38)} ${f(x + a)} ${f(y + lift)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.05)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function birds(T, lanes) {
  let s = '';
  BIRDS.forEach((b, i) => {
    const u = ((((T - b.o) % b.p) + b.p) % b.p) / b.d;
    if (u > 1) return;
    const x = b.dir > 0 ? lerp(-90, W + 90, u) : lerp(W + 90, -90, u);
    let y = lanes[b.lane % lanes.length] + Math.sin(u * 7 + i) * 14;
    y = Math.min(y, 1440);
    const fl = 0.35 + 0.65 * Math.sin(T * 2 * PI / 0.34 + i * 2);
    s += bird(x, y, b.size, fl);
  });
  return s;
}
function sky(T, o = {}) {
  const hz = o.horizon || 1300;
  let s = `<rect width="${W}" height="${H}" fill="${C.sky}"/><rect y="${hz - (o.band || 280)}" width="${W}" height="${H}" fill="${C.skyL}"/>`;
  s += clouds(T, o.cloudShift || 0);
  s += birds(T, o.lanes || [300, 470, 560]);
  return s;
}
function ground(y0, off, o = {}) {
  let s = `<rect x="-20" y="${y0}" width="${W + 40}" height="${H - y0 + 20}" fill="${C.ground}"/>`;
  const sp = o.sp || 220, sl = o.slant || 140;
  const start = -(((off % sp) + sp) % sp);
  for (let x = start - sp; x < W + sp * 2; x += sp) {
    s += `<line x1="${f(x)}" y1="${y0}" x2="${f(x - sl)}" y2="${H + 10}" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linecap="round"/>`;
  }
  if (o.curb) s += `<line x1="-20" y1="${o.curb}" x2="${W + 20}" y2="${o.curb}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
  s += `<line x1="-20" y1="${y0}" x2="${W + 20}" y2="${y0}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  return s;
}

/* ---------- logo (PNG del repositorio) ---------- */
// Logos PNG transparentes del repositorio: logo_blanco.png (fondos rojos), logo_rojo.png (fondos claros).
// size = lado del cuadro que ocupa el contenido del logo.
function logoBadge(cx, cy, size, rot = 0, sc = 1, which = 'logoW') {
  const h = size / 2;
  return at(cx, cy, sc, `<svg x="${f(-h)}" y="${f(-h)}" width="${f(size)}" height="${f(size)}" viewBox="72 74 356 356"><use href="#${which}"/></svg>`, rot);
}

/* ---------- zapatillas (idénticas en móvil, escaparate y tarjetas) ---------- */
const SNK_UP = 'M10 40 L9 20 Q9 11 18 11 L34 11 Q40 11 43 17 L47 23 Q72 23 88 30 Q97 34 97 40 Z';
// (x,y) = centro inferior de la suela; s = escala (la zapatilla mide ~100 x 40)
function sneaker(x, y, s, o = {}) {
  const sw = (o.sw || SW) / s, id = 'sk' + (uid++);
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)}) translate(-52 -50)">
    <clipPath id="${id}"><path d="${SNK_UP}"/></clipPath>
    <path d="${SNK_UP}" fill="#FFFFFF"/>
    <g clip-path="url(#${id})">
      <rect x="0" y="26" width="110" height="7" fill="${C.red}"/>
      <rect x="0" y="0" width="16" height="26" fill="${C.red}"/>
      <path d="M0 26 H110 M0 33 H110 M16 0 V26" stroke="${INK}" stroke-width="${f(sw * 0.65)}" fill="none"/>
    </g>
    <path d="${SNK_UP}" fill="none" stroke="${INK}" stroke-width="${f(sw)}" stroke-linejoin="round"/>
    <path d="M19 15.5 Q30 19 41 15.5" stroke="${INK}" stroke-width="${f(sw * 0.65)}" fill="none" stroke-linecap="round"/>
    <path d="M46.5 20 l4 -4.5 M53 22.5 l3.5 -5 M59.5 23.5 l3 -5" stroke="${INK}" stroke-width="${f(sw * 0.7)}" fill="none" stroke-linecap="round"/>
    <path d="M80 26 Q87 27.5 91 31.5" stroke="${INK}" stroke-width="${f(sw * 0.6)}" fill="none" stroke-linecap="round"/>
    <path d="M4 38 H96 Q101 38 101 44 Q101 50 95 50 H9 Q3 50 3 44 Z" fill="${C.cream}" stroke="${INK}" stroke-width="${f(sw)}" stroke-linejoin="round"/>
    <path d="M9 44 H95" stroke="${INK}" stroke-width="${f(sw * 0.5)}" fill="none" stroke-linecap="round"/>
  </g>`;
}
function sneakerPair(x, y, s, o = {}) {
  return sneaker(x + 20 * s, y - 9 * s, s, o) + sneaker(x - 8 * s, y, s, o);
}
function sticker(x, y, r, rot, label = '-30%') {
  const inner = `<circle cx="${f(r * 0.06)}" cy="${f(r * 0.06)}" r="${f(r)}" fill="${INK}"/>
    <circle r="${f(r)}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>
    <circle r="${f(r * 0.8)}" fill="none" stroke="#FFFFFF" stroke-width="${f(Math.max(3, r * 0.04))}" stroke-dasharray="${f(r * 0.14)} ${f(r * 0.1)}" stroke-linecap="round"/>` +
    text(label, 0, r * 0.06, { size: r * 0.6, font: 'G', sw: Math.max(SW * 1.4, r * 0.12), sd: r * 0.04 });
  return at(x, y, 1, inner, rot);
}
function checkCircle(x, y, r, sc = 1) {
  const inner = `<circle cx="${f(r * 0.08)}" cy="${f(r * 0.08)}" r="${f(r)}" fill="${INK}"/>
    <circle r="${f(r)}" fill="${C.green}" stroke="${INK}" stroke-width="${f(SW)}"/>
    <path d="M${f(-r * 0.45)} ${f(r * 0.02)} L${f(-r * 0.12)} ${f(r * 0.34)} L${f(r * 0.48)} ${f(-r * 0.32)}" fill="none" stroke="${INK}" stroke-width="${f(r * 0.34)}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M${f(-r * 0.45)} ${f(r * 0.02)} L${f(-r * 0.12)} ${f(r * 0.34)} L${f(r * 0.48)} ${f(-r * 0.32)}" fill="none" stroke="#FFFFFF" stroke-width="${f(r * 0.17)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return at(x, y, sc, inner);
}
function starPath(r1, r2, n, rot = -90) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? r2 : r1, a = (rot + i * 180 / n) * PI / 180;
    d += (i ? 'L' : 'M') + f(Math.cos(a) * r) + ' ' + f(Math.sin(a) * r);
  }
  return d + 'Z';
}
function burst(x, y, r, rot, fill = C.red) {
  const d = starPath(r, r * 0.72, 14);
  return at(x, y, 1, `<path d="${d}" transform="translate(${f(r * 0.05)} ${f(r * 0.05)})" fill="${INK}"/><path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`, rot);
}
function sparkle(x, y, r, sc = 1, fill = '#FFFFFF') {
  const d = `M0 ${-r} Q${r * 0.18} ${-r * 0.18} ${r} 0 Q${r * 0.18} ${r * 0.18} 0 ${r} Q${-r * 0.18} ${r * 0.18} ${-r} 0 Q${-r * 0.18} ${-r * 0.18} 0 ${-r}Z`;
  return at(x, y, sc, `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${f(SW * 0.8)}" stroke-linejoin="round"/>`);
}

/* ---------- tiendas ---------- */
function awning(tl, tr, bl, br, y, h, N) {
  let s = '';
  const yb = y + h, bw = (br - bl) / N, r = bw / 2;
  for (let i = 0; i < N; i++) {
    const x0 = bl + i * bw, col = i % 2 ? C.cream : C.red;
    s += `<path d="M${f(x0)} ${f(yb)} A${f(r)} ${f(r)} 0 0 0 ${f(x0 + bw)} ${f(yb)} Z" fill="${col}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
  }
  for (let i = 0; i < N; i++) {
    const col = i % 2 ? C.cream : C.red;
    s += `<path d="M${f(lerp(tl, tr, i / N))} ${f(y)} L${f(lerp(tl, tr, (i + 1) / N))} ${f(y)} L${f(bl + (i + 1) * bw)} ${f(yb)} L${f(bl + i * bw)} ${f(yb)}Z" fill="${col}"/>`;
  }
  s += `<path d="M${f(tl)} ${f(y)} L${f(tr)} ${f(y)} L${f(br)} ${f(yb)} L${f(bl)} ${f(yb)}Z" fill="none" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
  return s;
}
function glassWindow(x, y, w, h, item) {
  let s = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(Math.min(w, h) * 0.04)}" fill="${C.glass}"/>`;
  const m = SW;
  s += `<path d="M${f(x + w * 0.55)} ${f(y + m)} L${f(x + w * 0.72)} ${f(y + m)} L${f(x + w * 0.30)} ${f(y + h - m)} L${f(x + w * 0.13)} ${f(y + h - m)}Z" fill="#FFFFFF" opacity="0.55"/>`;
  s += `<path d="M${f(x + w * 0.80)} ${f(y + m)} L${f(x + w * 0.86)} ${f(y + m)} L${f(x + w * 0.44)} ${f(y + h - m)} L${f(x + w * 0.38)} ${f(y + h - m)}Z" fill="#FFFFFF" opacity="0.55"/>`;
  if (item) s += item(x, y, w, h);
  s += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(Math.min(w, h) * 0.04)}" fill="none" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  return s;
}
// objetos genéricos de escaparate, dibujados en caja local 100x100
function unitBox(x, y, w, h, inner, fill = 0.9) {
  const s = Math.min(w, h) * fill / 100;
  return `<g transform="translate(${f(x + w / 2 - 50 * s)} ${f(y + h - 100 * s - h * 0.04)}) scale(${f(s)})">${inner(SW / s)}</g>`;
}
const ITEMS = {
  dress: sw => `<path d="M50 6 Q56 6 55 11 Q54 14 50 15" fill="none" stroke="${INK}" stroke-width="${sw * 0.7}" stroke-linecap="round"/>
    <path d="M30 24 L50 14 L70 24" fill="none" stroke="${INK}" stroke-width="${sw * 0.8}" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M40 22 Q50 28 60 22 L66 34 L60 38 L72 90 Q50 96 28 90 L40 38 L34 34 Z" fill="${C.pink}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M40 46 Q50 50 60 46" stroke="${INK}" stroke-width="${sw * 0.7}" fill="none"/>`,
  bread: sw => `<ellipse cx="34" cy="78" rx="25" ry="14" fill="${C.skin}" stroke="${INK}" stroke-width="${sw}"/>
    <path d="M24 74 l6 -6 M34 76 l6 -6 M44 74 l5 -5" stroke="${INK}" stroke-width="${sw * 0.7}" stroke-linecap="round"/>
    <ellipse cx="68" cy="72" rx="26" ry="18" fill="${C.skinS}" stroke="${INK}" stroke-width="${sw}"/>
    <path d="M56 70 Q68 62 80 70" stroke="${INK}" stroke-width="${sw * 0.7}" fill="none" stroke-linecap="round"/>
    <path d="M6 94 H94" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>`,
  flowers: sw => `<path d="M50 62 L34 34 M50 62 L50 24 M50 62 L66 36" stroke="${C.green}" stroke-width="${sw * 1.2}" stroke-linecap="round"/>
    <circle cx="34" cy="32" r="11" fill="${C.pink}" stroke="${INK}" stroke-width="${sw}"/><circle cx="34" cy="32" r="4" fill="${C.cream}"/>
    <circle cx="50" cy="22" r="12" fill="${C.red}" stroke="${INK}" stroke-width="${sw}"/><circle cx="50" cy="22" r="4" fill="${C.cream}"/>
    <circle cx="66" cy="34" r="10" fill="${C.pink}" stroke="${INK}" stroke-width="${sw}"/><circle cx="66" cy="34" r="3.5" fill="${C.cream}"/>
    <path d="M32 60 H68 L63 94 H37 Z" fill="${C.red}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M30 58 H70 V66 H30Z" fill="${C.dred}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`,
  gift: sw => `<rect x="26" y="50" width="48" height="44" fill="${C.pink}" stroke="${INK}" stroke-width="${sw}"/>
    <rect x="45" y="50" width="10" height="44" fill="${C.red}" stroke="${INK}" stroke-width="${sw * 0.7}"/>
    <rect x="22" y="40" width="56" height="13" fill="${C.pink}" stroke="${INK}" stroke-width="${sw}"/>
    <ellipse cx="40" cy="33" rx="11" ry="7" fill="${C.red}" stroke="${INK}" stroke-width="${sw}"/>
    <ellipse cx="60" cy="33" rx="11" ry="7" fill="${C.red}" stroke="${INK}" stroke-width="${sw}"/>
    <circle cx="50" cy="38" r="5" fill="${C.dred}" stroke="${INK}" stroke-width="${sw * 0.8}"/>`
};
function itemFn(name) {
  if (name === 'shoes') return (x, y, w, h) => {
    const s = w * 0.62 / 128;
    return `<path d="M${f(x + w * 0.1)} ${f(y + h * 0.86)} H${f(x + w * 0.9)}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linecap="round"/>` +
      sneakerPair(x + w * 0.48, y + h * 0.86, s, {}) + sticker(x + w * 0.74, y + h * 0.30, w * 0.17, -12);
  };
  return (x, y, w, h) => unitBox(x, y, w, h, ITEMS[name]);
}
const SHOP_TYPES = [
  { facade: C.cream, sign: 'MODA', item: 'dress' },
  { facade: C.pink, sign: 'PAN', item: 'bread' },
  { facade: C.navy, sign: 'FLORES', item: 'flowers' },
  { facade: C.cream, sign: 'REGALOS', item: 'gift' }
];
const SHOE_SHOP = { facade: C.cream, sign: 'TUS PIES', item: 'shoes' };
function shop(x, base, w, h, o) {
  const top = base - h;
  let s = '';
  s += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="${o.facade}"/>`;
  s += `<rect x="${f(x + w * 0.88)}" y="${f(top + w * 0.02)}" width="${f(w * 0.12)}" height="${f(h + 30)}" fill="${INK}" opacity="0.16"/>`;
  s += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="none" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  // rótulo
  const py = top + h * 0.045, ph = h * 0.115;
  s += `<rect x="${f(x + w * 0.12 + SW)}" y="${f(py + SW)}" width="${f(w * 0.76)}" height="${f(ph)}" rx="${f(ph * 0.25)}" fill="${INK}"/>`;
  s += `<rect x="${f(x + w * 0.12)}" y="${f(py)}" width="${f(w * 0.76)}" height="${f(ph)}" rx="${f(ph * 0.25)}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += text(o.sign, x + w * 0.5, py + ph * 0.54, { size: fit(o.sign, ph * 0.78, w * 0.66, 'G'), font: 'G', sw: SW * 1.5, sd: 3 });
  // toldo
  const ay = top + h * 0.2, ah = h * 0.15;
  s += awning(x + w * 0.04, x + w * 0.96, x - w * 0.03, x + w * 1.03, ay, ah, 7);
  // escaparate y puerta
  const wy = ay + ah + w * 1.06 / 14 + h * 0.05;
  const wx = x + w * 0.08, ww = w * 0.52, wh = base - h * 0.1 - wy;
  s += glassWindow(wx, wy, ww, wh, itemFn(o.item));
  s += `<rect x="${f(wx - w * 0.02)}" y="${f(wy + wh)}" width="${f(ww + w * 0.04)}" height="${f(h * 0.03)}" rx="4" fill="${C.cream}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  const dx = x + w * 0.67, dw = w * 0.23;
  s += `<rect x="${f(dx)}" y="${f(wy)}" width="${f(dw)}" height="${f(base - wy + 10)}" rx="${f(dw * 0.08)}" fill="${o.facade === C.navy ? C.blueS : C.navy}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<rect x="${f(dx + dw * 0.2)}" y="${f(wy + dw * 0.2)}" width="${f(dw * 0.6)}" height="${f(dw * 0.9)}" rx="${f(dw * 0.06)}" fill="${C.glass}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  s += `<circle cx="${f(dx + dw * 0.8)}" cy="${f(wy + (base - wy) * 0.58)}" r="${f(dw * 0.06)}" fill="${C.cream}" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
  return s;
}
function street(off, o) {
  const pitch = o.w + o.g;
  let s = '';
  const i0 = Math.floor((off - o.w) / pitch) - 1, i1 = Math.ceil((off + W) / pitch) + 1;
  for (let i = i0; i <= i1; i++) {
    const x = i * pitch - off;
    if (x > W + 50 || x + o.w < -80) continue;
    const ty = (o.special && o.special[i]) || SHOP_TYPES[((i % 4) + 4) % 4];
    s += shop(x, o.base, o.w, o.h, ty);
  }
  return s;
}

/* ---------- Personajes (Marta del vídeo 01 ampliada + Lucía + panadera) ----------
   Sistema local de Marta: suelo en y=204, mira a la derecha. Todos comparten cuerpo y proporciones. */
const YEL = '#F2C12E', YEL_S = '#C99A1E', LHAIR = '#C58B3B', NAVY_S = '#22394F', SHOE_BR = '#5A3A2A';
function face(o, w) {
  const e = o.expr || 'happy';
  const lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const P = (cx, cy, r = 2) => `<circle cx="${f(cx + lx)}" cy="${f(cy + ly)}" r="${r}" fill="${INK}"/>`;
  const L = (d, sw = 1.6) => `<path d="${d}" stroke="${INK}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const blush = (op = 0.6) => `<circle cx="199" cy="87" r="3" fill="${C.pink}" opacity="${op}"/>`;
  const bigEye = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="3.2" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.5)}"/><circle cx="${f(cx + 0.5 + lx * 0.5)}" cy="${f(cy + 0.3 + ly * 0.5)}" r="1.15" fill="${INK}"/>`;
  switch (e) {
    case 'bored': // boca recta, cejas caídas, párpados a media asta
      return `<path d="M194 81 A2 2 0 0 0 198 81Z M201 81 A2 2 0 0 0 205 81Z" fill="${INK}" transform="translate(${f(lx)} ${f(ly * 0.5)})"/>` +
        L('M193.8 80.8 H198.2 M200.8 80.8 H205.2', 1.5) + L('M194 77.4 L197.8 76.2 M201.2 76.2 L205 77.4') +
        blush(0.35) + L('M197 88.4 H203.2', 2);
    case 'sparkle': // ojos grandes con brillo
      return `<circle cx="196" cy="80.6" r="3.5" fill="${INK}"/><circle cx="203" cy="80.6" r="3.5" fill="${INK}"/>
        <circle cx="197.2" cy="79.3" r="1.3" fill="#FFFFFF"/><circle cx="204.2" cy="79.3" r="1.3" fill="#FFFFFF"/>
        <circle cx="195.1" cy="81.9" r="0.6" fill="#FFFFFF"/><circle cx="202.1" cy="81.9" r="0.6" fill="#FFFFFF"/>` +
        L('M193.4 74.6 Q195.7 72.6 198 74.2 M200.6 74 Q202.9 72.4 205.2 74.4') + blush() +
        `<path d="M195.8 86.4 Q200.2 93.6 204.8 86.4 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
    case 'cheeky': // una ceja alta, media sonrisa
      return P(196, 81.3) + P(203, 80.6) + L('M194 76.4 L198 76') + L('M200.6 73.4 Q203 70.8 205.6 73.6', 1.7) + blush() +
        L('M197 88.4 Q201.4 89.8 204.8 85.6', 2);
    case 'surprise':
      return bigEye(195, 80) + bigEye(202, 80) + L('M191.8 74.6 Q194.6 71.8 197.4 74 M199.6 73.8 Q202.2 71.6 204.8 74.2', 1.7) +
        `<circle cx="196" cy="86.6" r="2.6" fill="${C.pink}" opacity="0.6"/><ellipse cx="197.8" cy="88.6" rx="2.1" ry="2.9" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
    case 'wow': // ojos muy abiertos y sonrisa
      return bigEye(195, 80) + bigEye(202, 80) + L('M191.8 74.2 Q194.6 71.4 197.4 73.6 M199.6 73.4 Q202.2 71.2 204.8 73.8', 1.7) + blush() +
        `<path d="M196 86.6 Q200 92 204 86.6 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}" stroke-linejoin="round"/>`;
    case 'wink':
      return L('M193.3 81.6 Q196 78.6 198.7 81.6', 1.9) + P(203, 81) + L('M193.6 76 L198 74.6 M201 75 L205 76') +
        `<circle cx="198.5" cy="86.6" r="3" fill="${C.pink}" opacity="0.6"/><path d="M194.6 85.4 Q200 94 205.4 85.4 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
    case 'sad': // cejas en pena, boca hacia abajo
      return P(196, 81.6) + P(203, 81.6) + L('M194 76.4 L197.8 74.4 M201.2 74.4 L205 76.4') + blush(0.4) +
        L('M197.2 89.4 Q200.2 86.4 203.2 89.4', 2);
    case 'doubt':
      return P(196, 81) + P(203, 80.6) + L('M194 76 L198 75.6') + L('M200.8 73.6 Q203 71.6 205.4 73.8', 1.7) + blush(0.45) +
        L('M197.2 88.4 Q198.8 87 200.4 88.4 Q202 89.8 203.6 88.4', 1.9);
    case 'smile':
      return P(196, 81) + P(203, 81) + L('M194 76 L198 75 M201 75 L205 76') + blush() +
        `<path d="M195.6 86 Q200 93 204.4 86 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
    default: // feliz (referencia)
      return P(196, 81) + P(203, 81) + L('M194 76 L198 75 M201 75 L205 76') + blush() + L('M196 87 Q200 91 204 87', 2);
  }
}
// móvil pequeño en coordenadas locales (centro cx,cy)
function miniPhone(cx, cy, w, rot = -14) {
  return `<g transform="rotate(${rot} ${cx} ${cy})"><rect x="${cx - 6}" y="${cy - 10.5}" width="12" height="21" rx="2.6" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/><rect x="${cx - 4.2}" y="${cy - 8}" width="8.4" height="15.5" rx="1.3" fill="${C.glass}"/></g>`;
}
function hand(cx, cy, w, fill = C.skin) { return `<circle cx="${cx}" cy="${cy}" r="3.8" fill="${fill}" stroke="${INK}" stroke-width="${w(2.2)}"/>`; }
// caja de pasteles (local; centro inferior cx, cy; s = escala de la caja de 40x24)
function cakeBoxL(cx, cy, s, w, o = {}) {
  const k = s, W2 = 20 * k, Hh = 24 * k, top = cy - Hh;
  const sw = v => w(v);
  let g = '';
  // pasteles asomando
  const cakes = [[-12, C.pink], [-4, C.cream], [4, C.red], [12, C.pink]];
  cakes.forEach(([dx, col], i) => {
    const x = cx + dx * k, y = top - (i % 2 ? 3.2 : 2.4) * k;
    g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(4.4 * k)}" fill="${col}" stroke="${INK}" stroke-width="${sw(2)}"/>`;
    g += `<circle cx="${f(x)}" cy="${f(y - 3.8 * k)}" r="${f(1.5 * k)}" fill="${i % 2 ? C.red : C.cream}" stroke="${INK}" stroke-width="${sw(1.3)}"/>`;
  });
  g += `<rect x="${f(cx - W2 + 2 * k)}" y="${f(top + 2 * k)}" width="${f(W2 * 2)}" height="${f(Hh)}" rx="${f(2.5 * k)}" fill="${INK}"/>`;
  g += `<rect x="${f(cx - W2)}" y="${f(top)}" width="${f(W2 * 2)}" height="${f(Hh)}" rx="${f(2.5 * k)}" fill="${C.cream}" stroke="${INK}" stroke-width="${sw(2.6)}"/>`;
  g += `<rect x="${f(cx - W2)}" y="${f(top + Hh * 0.62)}" width="${f(W2 * 2)}" height="${f(Hh * 0.38)}" rx="${f(2 * k)}" fill="#F2B5AD" stroke="${INK}" stroke-width="${sw(1.6)}"/>`;
  g += `<rect x="${f(cx - 2.4 * k)}" y="${f(top)}" width="${f(4.8 * k)}" height="${f(Hh)}" fill="${C.red}" stroke="${INK}" stroke-width="${sw(1.6)}"/>`;
  g += `<path d="M${f(cx)} ${f(top + 1)} q${f(-9 * k)} ${f(-7 * k)} ${f(-9 * k)} ${f(-1 * k)} q${f(1 * k)} ${f(5 * k)} ${f(9 * k)} ${f(1 * k)} z M${f(cx)} ${f(top + 1)} q${f(9 * k)} ${f(-7 * k)} ${f(9 * k)} ${f(-1 * k)} q${f(-1 * k)} ${f(5 * k)} ${f(-9 * k)} ${f(1 * k)} z" fill="${C.red}" stroke="${INK}" stroke-width="${sw(1.8)}" stroke-linejoin="round"/>`;
  g += `<circle cx="${f(cx)}" cy="${f(top + 0.5)}" r="${f(2.2 * k)}" fill="${C.dred}" stroke="${INK}" stroke-width="${sw(1.5)}"/>`;
  return g;
}
// pastelito suelto (local)
function cupcakeL(cx, cy, s, w) {
  const k = s;
  return `<path d="M${f(cx - 6 * k)} ${f(cy - 7 * k)} H${f(cx + 6 * k)} L${f(cx + 4.4 * k)} ${f(cy)} H${f(cx - 4.4 * k)}Z" fill="${C.red}" stroke="${INK}" stroke-width="${w(1.8)}" stroke-linejoin="round"/>
    <path d="M${f(cx - 2 * k)} ${f(cy - 6.5 * k)} V${f(cy - 0.5)} M${f(cx + 2 * k)} ${f(cy - 6.5 * k)} V${f(cy - 0.5)}" stroke="${C.cream}" stroke-width="${w(1.2)}"/>
    <path d="M${f(cx - 7 * k)} ${f(cy - 7 * k)} Q${f(cx - 7.5 * k)} ${f(cy - 13 * k)} ${f(cx)} ${f(cy - 14 * k)} Q${f(cx + 7.5 * k)} ${f(cy - 13 * k)} ${f(cx + 7 * k)} ${f(cy - 7 * k)} Z" fill="${C.pink}" stroke="${INK}" stroke-width="${w(1.8)}" stroke-linejoin="round"/>
    <circle cx="${f(cx)}" cy="${f(cy - 15 * k)}" r="${f(2 * k)}" fill="${C.red}" stroke="${INK}" stroke-width="${w(1.4)}"/>`;
}
const ARM_F = [202, 108], ARM_B = [178, 108];
// posición local de la mano para un ángulo de brazo
function handAt(pivot, ang) {
  const a = ang * PI / 180, vx = 0.5, vy = 32;
  return [pivot[0] + vx * Math.cos(a) - vy * Math.sin(a), pivot[1] + vx * Math.sin(a) + vy * Math.cos(a)];
}
function person(o) {
  const who = o.who || 'marta', k = o.k || 1, w = v => f(v * k);
  const st = (v = 3) => `stroke="${INK}" stroke-width="${w(v)}" stroke-linejoin="round"`;
  const isM = who === 'marta', isL = who === 'lucia', isB = who === 'baker';
  // --- piernas ---
  const leg = (ang, back) => {
    let g;
    if (isM) {
      g = `<rect x="186" y="144" width="7" height="52" rx="3.5" fill="${back ? C.skinS : C.skin}" ${st()}/><path d="M183 196 h15 a5 5 0 0 1 0 8 h-15z" fill="${back ? C.dred : C.red}" ${st()}/>`;
    } else {
      const shoe = isL ? (back ? '#E8DCD8' : '#FFFFFF') : (back ? '#3E281D' : SHOE_BR);
      g = isB ? `<rect x="183" y="142" width="13" height="55" rx="5" fill="${back ? NAVY_S : C.navy}" ${st()}/>` : `<rect x="185" y="142" width="9" height="55" rx="4" fill="${back ? NAVY_S : C.navy}" ${st()}/>`;
      g += `<path d="M182.5 195.5 h16 a4.5 4.5 0 0 1 0 8.5 h-16z" fill="${shoe}" ${st()}/>` +
        (isL ? `<path d="M183 201 H202" stroke="${INK}" stroke-width="${w(1.4)}"/>` : '');
    }
    return `<g transform="rotate(${f(ang)} 190 146)">${g}</g>`;
  };
  const sitLeg = back => {
    const dx = back ? -5 : 0;
    return `<g transform="translate(${dx} ${back ? -1 : 0})"><rect x="184" y="141" width="38" height="8" rx="4" fill="${back ? C.skinS : C.skin}" ${st()}/>
      <rect x="214" y="144" width="8" height="49" rx="4" fill="${back ? C.skinS : C.skin}" ${st()}/>
      <path d="M212 192 h15 a5 5 0 0 1 0 8 h-15z" fill="${back ? C.dred : C.red}" ${st()}/></g>`;
  };
  // --- brazos ---
  const arm = (pv, ang, back, extra = '') => {
    let g;
    const x = back ? 174 : 199;
    if (isM) g = `<rect x="${x}" y="106" width="7" height="34" rx="3.5" fill="${back ? C.skinS : C.skin}" ${st()}/>`;
    else if (isL) g = `<rect x="${x - 0.5}" y="105" width="8" height="32" rx="4" fill="${back ? YEL_S : YEL}" ${st()}/>` + hand(x + 3.5, 139, w, back ? C.skinS : C.skin);
    else g = `<rect x="${x - 1}" y="110" width="9" height="30" rx="4.5" fill="${back ? C.skinS : C.skin}" ${st()}/><rect x="${x - 2.5}" y="105" width="12" height="14" rx="5" fill="${back ? '#A32323' : C.red}" ${st()}/>`;
    if (!back && o.point) g += `<rect x="201.3" y="140" width="2.8" height="10" rx="1.4" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2)}"/>
      <circle cx="202.5" cy="140.5" r="4.3" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>
      <path d="M200 138 Q202.5 141 205 138" stroke="${INK}" stroke-width="${w(1.3)}" fill="none" stroke-linecap="round"/>`;
    if (extra) g += `<g transform="rotate(${f(-ang - (o.lean || 0))} ${back ? 177.5 : 202.5} 140)">${extra}</g>`;
    const g2 = `<g transform="rotate(${f(ang)} ${pv[0]} ${pv[1]})">${g}</g>`;
    return isB ? `<g transform="translate(${back ? -6 : 6} 0)">${g2}</g>` : g2;
  };
  let g = '';
  if (o.sit) g += sitLeg(true) + sitLeg(false);
  else if (!o.noLegs) g += leg(o.legB || 0, true) + leg(o.legF || 0, false);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">`;
  if (o.behind) g += o.behind(w); // objetos detrás del cuerpo (caja bajo el brazo)
  g += arm(ARM_B, o.armB || 0, true, o.handB ? o.handB(w) : '');
  // pelo trasero
  const head = [];
  if (isM) head.push(`<g transform="rotate(${f(o.pony || 0)} 178 70)"><path d="M180 66 Q154 66 158 94 Q160 104 166 108 Q170 90 182 78Z" fill="${C.hair}" ${st()}/></g>`);
  if (isL) head.push(`<path d="M191 61 Q171 61 171 82 Q170 99 173 107 Q181 110 189 105 L191 88Z" fill="${LHAIR}" ${st()}/>`);
  if (isB) head.push(`<circle cx="174" cy="66" r="8" fill="${C.red}" ${st()}/><circle cx="172" cy="63" r="1.4" fill="#FFFFFF"/><circle cx="176" cy="69" r="1.2" fill="#FFFFFF"/>`);
  // cuello y torso
  let torso = `<rect x="186.5" y="86" width="7" height="14" rx="2" fill="${C.skinS}" ${st()}/>`;
  if (isM) {
    torso += `<path d="M178 98 Q190 94 202 98 L211 156 Q190 161 169 156Z" fill="${C.blue}"/>
    <path d="M178 98 L186 97 L186 158 Q176 158 169 156Z" fill="${C.blueS}"/>
    <path d="M178 98 Q190 94 202 98 L211 156 Q190 161 169 156Z" fill="none" ${st()}/>
    <path d="M176 118 Q190 122 204 118" stroke="${INK}" stroke-width="${w(2.5)}" fill="none" stroke-linecap="round"/>`;
    if (o.sit) torso += `<path d="M185 136 L213 137 Q219 138 219 143 L218 151 Q200 155 184 154Z" fill="${C.blue}" ${st()}/>`;
  } else if (isL) {
    torso += `<rect x="176" y="126" width="28" height="24" rx="5" fill="${C.navy}" ${st()}/>
    <path d="M178 98 Q190 94 202 98 L206 133 Q190 137 174 133Z" fill="${YEL}"/>
    <path d="M178 98 L186 97 L186 136 Q179 135 174 133Z" fill="${YEL_S}"/>
    <path d="M178 98 Q190 94 202 98 L206 133 Q190 137 174 133Z" fill="none" ${st()}/>
    <path d="M175.5 127 Q190 131 205 127" stroke="${INK}" stroke-width="${w(2)}" fill="none" stroke-linecap="round"/>
    <path d="M183 97 Q190 101 197 97" stroke="${INK}" stroke-width="${w(2)}" fill="none" stroke-linecap="round"/>`;
  } else {
    torso += `<rect x="168" y="128" width="44" height="24" rx="8" fill="${C.navy}" ${st()}/>
    <path d="M173 98 Q190 91 207 98 Q216 118 214 140 Q190 147 166 140 Q164 118 173 98Z" fill="${C.red}"/>
    <path d="M173 98 L182 96 L182 145 Q172 143 166 140 Q164 118 173 98Z" fill="#A32323"/>
    <path d="M173 98 Q190 91 207 98 Q216 118 214 140 Q190 147 166 140 Q164 118 173 98Z" fill="none" ${st()}/>
    <path d="M179 104 H201 Q208 128 210 160 Q190 165 170 160 Q172 128 179 104Z" fill="#FFFFFF" ${st()}/>
    <path d="M180 104 L183 96 M200 104 L197 96" stroke="${INK}" stroke-width="${w(2.2)}" stroke-linecap="round"/>
    <rect x="183" y="132" width="14" height="10" rx="2.5" fill="#FFFFFF" ${st(2)}/>
    <path d="M177 118 Q168 121 165 127" stroke="${INK}" stroke-width="${w(1.8)}" fill="none" stroke-linecap="round"/>`;
  }
  // cabeza
  let hd = `<circle cx="190" cy="78" r="14" fill="${C.skin}" ${st()}/>`;
  if (isM) hd += `<path d="M175 76 Q175 58 192 60 Q206 61 205 74 Q197 66 175 76Z" fill="${C.hair}" ${st()}/>
    <circle cx="178" cy="69" r="3.2" fill="${C.red}" stroke="${INK}" stroke-width="${w(2)}"/>`;
  if (isL) hd += `<path d="M175 82 Q173 59 192 60 Q207 61 206 76 Q199 67 189 68 Q181 72 175 82Z" fill="${LHAIR}" ${st()}/>`;
  if (isB) hd += `<path d="M176.5 80 Q174 86 178 90 L181 80Z" fill="${C.hair}" ${st(2.4)}/>
    <path d="M175 77 Q174 57 191 58.5 Q207 59.5 205.5 73 Q191 66 175 77Z" fill="${C.red}" ${st()}/>
    <circle cx="183" cy="64" r="1.6" fill="#FFFFFF"/><circle cx="191.5" cy="62" r="1.6" fill="#FFFFFF"/><circle cx="199.5" cy="64.5" r="1.5" fill="#FFFFFF"/><circle cx="179" cy="71" r="1.4" fill="#FFFFFF"/><circle cx="188" cy="68.5" r="1.3" fill="#FFFFFF"/>`;
  hd += face(o, w);
  if (o.phone) hd += miniPhone(229, 88.5, w) + hand(227.4, 93, w);
  g += head[0] ? `<g transform="rotate(${f(o.head || 0)} 190 94)">${head[0]}</g>` : '';
  g += torso;
  if (o.front0) g += o.front0(w);
  g += arm(ARM_F, o.armF || 0, false, o.handF ? o.handF(w) : '');
  g += `<g transform="rotate(${f(o.head || 0)} 190 94)">${hd}</g>`;
  if (o.front) g += o.front(w);
  g += `</g>`;
  if (o.lean) g = `<g transform="rotate(${f(o.lean)} 190 204)">${g}</g>`;
  if (o.squash) g = `<g transform="translate(190 204) scale(${f(o.squash[0])} ${f(o.squash[1])}) translate(-190 -204)">${g}</g>`;
  return g;
}
// coloca el punto local (ax,ay) en (px,py) con escala sc; flip = mirando a la izquierda
function place(px, py, ax, ay, sc, o) {
  o.k = (o.sw || SW) / (3 * sc);
  const sx = o.flip ? -sc : sc;
  return `<g transform="translate(${f(px - ax * sx)} ${f(py - ay * sc)}) scale(${f(sx)} ${f(sc)})">${person(o)}</g>`;
}
const placeMarta = (px, py, ax, ay, sc, o) => place(px, py, ax, ay, sc, Object.assign({ who: 'marta' }, o));
// punto local -> mundo
function toWorld(px, py, ax, ay, sc, lx, ly, flip) { return [px + (lx - ax) * sc * (flip ? -1 : 1), py + (ly - ay) * sc]; }
function walkPose(phase, amp = 1) {
  const s = Math.sin(phase);
  return { legF: -30 * s * amp, legB: 30 * s * amp, armF: 24 * s * amp, armB: -24 * s * amp, bob: -3 * (0.5 + 0.5 * Math.cos(2 * phase)) * amp, pony: 9 * Math.sin(phase - 0.9) };
}
function runPose(t) {
  const ph = 2 * PI * t / 0.4, s = Math.sin(ph);
  return { legF: -50 * s, legB: 50 * s, armF: 45 * s, armB: -45 * s, bob: -5 * (0.5 + 0.5 * Math.cos(2 * ph)), pony: 74 + 7 * Math.sin(ph * 2), lean: 10 };
}
const STEP = 0.7;

/* ---------- piezas de interfaz ---------- */
function panel(x, y, w, h, r, fill = '#FFFFFF', sd = 14) {
  return `<rect x="${f(x + sd)}" y="${f(y + sd)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${INK}"/>
    <rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${fill}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
}
function rays(cx, cy, n, rot, col, r = 2200) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a0 = (rot + i * 360 / n) * PI / 180, a1 = a0 + (360 / n / 2) * PI / 180;
    s += `<path d="M${cx} ${cy} L${f(cx + Math.cos(a0) * r)} ${f(cy + Math.sin(a0) * r)} L${f(cx + Math.cos(a1) * r)} ${f(cy + Math.sin(a1) * r)}Z" fill="${col}"/>`;
  }
  return s;
}
function impactLines(cx, cy, t, n = 34, rin = 560) {
  let s = '';
  const seed = Math.floor(t * 12);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * PI + hash(i * 7.3) * 0.12;
    const r1 = rin + hash(i * 3.1 + seed) * 220, r2 = 1600;
    const wd = 0.012 + hash(i * 9.7) * 0.02;
    s += `<path d="M${f(cx + Math.cos(a) * r1)} ${f(cy + Math.sin(a) * r1)} L${f(cx + Math.cos(a - wd) * r2)} ${f(cy + Math.sin(a - wd) * r2)} L${f(cx + Math.cos(a + wd) * r2)} ${f(cy + Math.sin(a + wd) * r2)}Z" fill="${INK}"/>`;
  }
  return s;
}
function speedLinesRadial(cx, cy, amt) {
  if (amt <= 0) return '';
  let s = '';
  for (let i = 0; i < 28; i++) {
    const a = i / 28 * 2 * PI + hash(i) * 0.1;
    const r1 = lerp(1300, 520, amt) + hash(i * 5) * 120, r2 = 1700;
    s += `<line x1="${f(cx + Math.cos(a) * r1)}" y1="${f(cy + Math.sin(a) * r1)}" x2="${f(cx + Math.cos(a) * r2)}" y2="${f(cy + Math.sin(a) * r2)}" stroke="#FFFFFF" stroke-width="${f(SW * 1.4)}" stroke-linecap="round"/>`;
  }
  return s;
}

/* ---------- iconos de tarjetas (caja local 100x100) ---------- */
const ICONS = {
  shoe: (sw) => sneaker(50, 70, 0.95, { sw: sw * 0.95 }),
  cupcake: sw => {
    let a = '', b = '';
    [[36, 52, 13], [50, 44, 16], [64, 52, 13]].forEach(([x, y, r]) => { a += `<circle cx="${x}" cy="${y}" r="${r}"/>`; b += `<circle cx="${x}" cy="${y}" r="${r}"/>`; });
    return `<path d="M28 56 H72 L65 90 H35 Z" fill="${C.red}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>
      <path d="M40 58 L42 89 M50 58 V89 M60 58 L58 89" stroke="${C.cream}" stroke-width="${sw * 0.9}"/>
      <path d="M28 56 H72 L65 90 H35 Z" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>
      <g fill="${INK}" stroke="${INK}" stroke-width="${sw * 2}">${a}</g><g fill="${C.pink}">${b}</g>
      <circle cx="50" cy="27" r="6" fill="${C.red}" stroke="${INK}" stroke-width="${sw}"/>`;
  },
  bouquet: sw => `<ellipse cx="34" cy="56" rx="8" ry="4" transform="rotate(-30 34 56)" fill="${C.green}" stroke="${INK}" stroke-width="${sw * 0.8}"/>
    <ellipse cx="66" cy="56" rx="8" ry="4" transform="rotate(30 66 56)" fill="${C.green}" stroke="${INK}" stroke-width="${sw * 0.8}"/>
    <path d="M34 52 L66 52 L50 94 Z" fill="${C.cream}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M40 66 L60 66" stroke="${C.red}" stroke-width="${sw * 1.3}"/>
    <circle cx="36" cy="40" r="12" fill="${C.pink}" stroke="${INK}" stroke-width="${sw}"/><circle cx="36" cy="40" r="4" fill="${C.cream}"/>
    <circle cx="64" cy="40" r="12" fill="${C.pink}" stroke="${INK}" stroke-width="${sw}"/><circle cx="64" cy="40" r="4" fill="${C.cream}"/>
    <circle cx="50" cy="29" r="13" fill="${C.red}" stroke="${INK}" stroke-width="${sw}"/><circle cx="50" cy="29" r="4.5" fill="${C.cream}"/>`,
  tortilla: sw => `<ellipse cx="50" cy="66" rx="44" ry="22" fill="#FFFFFF" stroke="${INK}" stroke-width="${sw}"/>
    <ellipse cx="50" cy="60" rx="32" ry="15" fill="${C.skinS}" stroke="${INK}" stroke-width="${sw}"/>
    <ellipse cx="50" cy="56" rx="32" ry="13" fill="${C.skin}" stroke="${INK}" stroke-width="${sw}"/>
    <path d="M50 56 L82 56 M50 56 L66 44" stroke="${INK}" stroke-width="${sw * 0.8}" stroke-linecap="round"/>
    <circle cx="36" cy="54" r="2.4" fill="${C.skinS}"/><circle cx="44" cy="62" r="2" fill="${C.skinS}"/>`
};
function sealPct(x, y, r, sc) {
  const d = starPath(r, r * 0.86, 16);
  return at(x, y, sc, `<path d="${d}" transform="translate(5 5)" fill="${INK}"/><path d="${d}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>` + text('%', 0, r * 0.06, { size: r * 1.05, font: 'G', sw: SW * 1.5, sd: 3 }), -10);
}
function starBadge(x, y, r, sc) {
  const d = starPath(r, r * 0.5, 5);
  return at(x, y, sc, `<path d="${d}" transform="translate(5 5)" fill="${INK}"/><path d="${d}" fill="${C.pink}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>
    <circle cx="${f(-r * 0.18)}" cy="${f(-r * 0.12)}" r="${f(r * 0.08)}" fill="#FFFFFF"/>`, 8);
}
function calendarBadge(x, y, r, sc) {
  const w2 = r * 0.9, h2 = r * 0.85;
  let dots = '';
  for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) {
    const cx = -w2 * 0.55 + i * w2 * 0.55, cy = h2 * 0.05 + j * h2 * 0.42;
    dots += (i === 2 && j === 1)
      ? `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * 0.14)}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`
      : `<rect x="${f(cx - r * 0.09)}" y="${f(cy - r * 0.09)}" width="${f(r * 0.18)}" height="${f(r * 0.18)}" rx="3" fill="${INK}"/>`;
  }
  return at(x, y, sc, `<rect x="${f(-w2 + 5)}" y="${f(-h2 + 5)}" width="${f(w2 * 2)}" height="${f(h2 * 2)}" rx="${f(r * 0.2)}" fill="${INK}"/>
    <rect x="${f(-w2)}" y="${f(-h2)}" width="${f(w2 * 2)}" height="${f(h2 * 2)}" rx="${f(r * 0.2)}" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>
    <path d="M${f(-w2)} ${f(-h2 * 0.38)} V${f(-h2 + r * 0.2)} Q${f(-w2)} ${f(-h2)} ${f(-w2 + r * 0.2)} ${f(-h2)} H${f(w2 - r * 0.2)} Q${f(w2)} ${f(-h2)} ${f(w2)} ${f(-h2 + r * 0.2)} V${f(-h2 * 0.38)}Z" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>
    <rect x="${f(-w2 * 0.55 - 4)}" y="${f(-h2 - r * 0.2)}" width="8" height="${f(r * 0.4)}" rx="4" fill="${INK}"/>
    <rect x="${f(w2 * 0.55 - 4)}" y="${f(-h2 - r * 0.2)}" width="8" height="${f(r * 0.4)}" rx="4" fill="${INK}"/>` + dots, 8);
}

