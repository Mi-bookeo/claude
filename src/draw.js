/* Marta y los zapatos — dibujo determinista fotograma a fotograma.
   Cada fotograma se calcula SOLO a partir de (escena, t local, T global). */
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
function cloud(x, y, s) {
  const circ = [[-60, 10, 45], [0, -15, 62], [70, -30, 70], [140, -5, 55], [188, 15, 38]];
  const sw = 2 * SW / s;
  let a = '', b = '';
  circ.forEach(([cx, cy, r]) => { a += `<circle cx="${cx}" cy="${cy}" r="${r}"/>`; b += `<circle cx="${cx}" cy="${cy}" r="${r}"/>`; });
  a += `<rect x="-100" y="0" width="320" height="56" rx="28"/>`;
  b += `<rect x="-100" y="0" width="320" height="56" rx="28"/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><g fill="${INK}" stroke="${INK}" stroke-width="${f(sw)}">${a}</g><g fill="${C.white}">${b}</g></g>`;
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

/* ---------- Marta ---------- */
function marta(o) {
  const k = o.k || 1, w = v => f(v * k);
  const leg = (ang, skin, shoe) => `<g transform="rotate(${f(ang)} 190 146)"><rect x="186" y="144" width="7" height="52" rx="3.5" fill="${skin}" stroke="${INK}" stroke-width="${w(3)}"/><path d="M183 196 h15 a5 5 0 0 1 0 8 h-15z" fill="${shoe}" stroke="${INK}" stroke-width="${w(3)}" stroke-linejoin="round"/></g>`;
  const expr = o.expr || 'happy';
  let face = '';
  if (expr === 'surprise') {
    face = `<circle cx="195" cy="80" r="3.1" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.5)}"/><circle cx="195.6" cy="80.3" r="1.05" fill="${INK}"/>
      <circle cx="202" cy="80" r="3.1" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.5)}"/><circle cx="202.6" cy="80.3" r="1.05" fill="${INK}"/>
      <path d="M191.8 74.6 Q194.6 71.8 197.4 74 M199.6 73.8 Q202.2 71.6 204.8 74.2" stroke="${INK}" stroke-width="${w(1.7)}" stroke-linecap="round" fill="none"/>
      <circle cx="196" cy="86.6" r="2.6" fill="${C.pink}" opacity="0.6"/>
      <ellipse cx="197.8" cy="88.6" rx="2.1" ry="2.9" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
  } else if (expr === 'wink') {
    face = `<path d="M193.3 81.6 Q196 78.6 198.7 81.6" stroke="${INK}" stroke-width="${w(1.9)}" stroke-linecap="round" fill="none"/>
      <circle cx="203" cy="81" r="2" fill="${INK}"/>
      <path d="M193.6 76 L198 74.6 M201 75 L205 76" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linecap="round" fill="none"/>
      <circle cx="198.5" cy="86.6" r="3" fill="${C.pink}" opacity="0.6"/>
      <path d="M194.6 85.4 Q200 94 205.4 85.4 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
  } else if (expr === 'eh') {
    face = `<circle cx="196" cy="81" r="2" fill="${INK}"/><circle cx="203" cy="81" r="2" fill="${INK}"/>
      <path d="M194 74.5 L198 73.8 M201 73.8 L205 74.8" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linecap="round" fill="none"/>
      <circle cx="199" cy="87" r="3" fill="${C.pink}" opacity="0.6"/>
      <path d="M197.5 88.2 Q200 87.4 202.5 88.4" stroke="${INK}" stroke-width="${w(2)}" fill="none" stroke-linecap="round"/>`;
  } else {
    face = `<circle cx="196" cy="81" r="2" fill="${INK}"/><circle cx="203" cy="81" r="2" fill="${INK}"/>
      <path d="M194 76 L198 75 M201 75 L205 76" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linecap="round" fill="none"/>
      <circle cx="199" cy="87" r="3" fill="${C.pink}" opacity="0.6"/>
      <path d="M196 87 Q200 91 204 87" stroke="${INK}" stroke-width="${w(2)}" fill="none" stroke-linecap="round"/>`;
  }
  let armF = `<rect x="199" y="106" width="7" height="34" rx="3.5" fill="${C.skin}" stroke="${INK}" stroke-width="${w(3)}"/>`;
  if (o.point) {
    armF += `<rect x="201.3" y="140" width="2.8" height="10" rx="1.4" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2)}"/>
      <circle cx="202.5" cy="140.5" r="4.3" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>
      <path d="M200 138 Q202.5 141 205 138" stroke="${INK}" stroke-width="${w(1.3)}" fill="none" stroke-linecap="round"/>`;
  }
  let g = '';
  if (!o.noLegs) g += leg(o.legB || 0, C.skinS, C.dred) + leg(o.legF || 0, C.skin, C.red);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">`;
  g += `<g transform="rotate(${f(o.armB || 0)} 178 108)"><rect x="174" y="106" width="7" height="34" rx="3.5" fill="${C.skinS}" stroke="${INK}" stroke-width="${w(3)}"/></g>`;
  g += `<g transform="rotate(${f(o.pony || 0)} 178 70)"><path d="M180 66 Q154 66 158 94 Q160 104 166 108 Q170 90 182 78Z" fill="${C.hair}" stroke="${INK}" stroke-width="${w(3)}" stroke-linejoin="round"/></g>`;
  g += `<rect x="186.5" y="86" width="7" height="14" rx="2" fill="${C.skinS}" stroke="${INK}" stroke-width="${w(3)}"/>`;
  g += `<path d="M178 98 Q190 94 202 98 L211 156 Q190 161 169 156Z" fill="${C.blue}"/>
    <path d="M178 98 L186 97 L186 158 Q176 158 169 156Z" fill="${C.blueS}"/>
    <path d="M178 98 Q190 94 202 98 L211 156 Q190 161 169 156Z" fill="none" stroke="${INK}" stroke-width="${w(3)}" stroke-linejoin="round"/>
    <path d="M176 118 Q190 122 204 118" stroke="${INK}" stroke-width="${w(2.5)}" fill="none" stroke-linecap="round"/>`;
  g += `<g transform="rotate(${f(o.armF || 0)} 202 108)">${armF}</g>`;
  g += `<circle cx="190" cy="78" r="14" fill="${C.skin}" stroke="${INK}" stroke-width="${w(3)}"/>
    <path d="M175 76 Q175 58 192 60 Q206 61 205 74 Q197 66 175 76Z" fill="${C.hair}" stroke="${INK}" stroke-width="${w(3)}" stroke-linejoin="round"/>
    <circle cx="178" cy="69" r="3.2" fill="${C.red}" stroke="${INK}" stroke-width="${w(2)}"/>` + face;
  if (o.phone) {
    g += `<g transform="rotate(-14 229 89)"><rect x="223" y="78" width="12" height="21" rx="2.6" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/><rect x="224.8" y="80.5" width="8.4" height="15.5" rx="1.3" fill="${C.glass}"/></g>
      <circle cx="227.4" cy="93" r="3.8" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
  }
  g += `</g>`;
  if (o.lean) g = `<g transform="rotate(${f(o.lean)} 190 204)">${g}</g>`;
  return g;
}
// coloca el punto local (ax,ay) de Marta en (px,py) con escala sc
function placeMarta(px, py, ax, ay, sc, o) {
  o.k = (o.sw || SW) / (3 * sc);
  return `<g transform="translate(${f(px - ax * sc)} ${f(py - ay * sc)}) scale(${f(sc)})">${marta(o)}</g>`;
}
function walkPose(phase) {
  const s = Math.sin(phase);
  return { legF: -30 * s, legB: 30 * s, armF: 24 * s, armB: -24 * s, bob: -3 * (0.5 + 0.5 * Math.cos(2 * phase)), pony: 9 * Math.sin(phase - 0.9) };
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

/* =================== ESCENAS =================== */
const S = {};

// 1) Marta camina feliz por la calle + "Pedido confirmado"
S[1] = (t, T) => {
  const v = 300, off = 150 + v * t;
  let s = sky(T, { horizon: 1300, lanes: [488, 215, 470] });
  s += street(off, { w: 440, h: 780, g: 50, base: 1300 });
  s += ground(1300, off, { sp: 220, curb: 1600 });
  const p = walkPose(2 * PI * t / STEP);
  s += `<ellipse cx="430" cy="1446" rx="120" ry="16" fill="${INK}" opacity="0.18"/>`;
  s += placeMarta(430, 1446, 190, 204, 5.2, Object.assign({ expr: 'happy' }, p));
  return s;
};

// 2) Plano medio mirando el móvil
S[2] = (t, T) => {
  const v = 420, off = 300 + v * t;
  let s = sky(T, { horizon: 1560, lanes: [980, 900, 1000] });
  s += street(off, { w: 640, h: 1100, g: 70, base: 1560 });
  s += ground(1560, off, { sp: 300 });
  const p = walkPose(2 * PI * t / STEP);
  const sc = 9, hx = 380, hy = 1090;
  s += placeMarta(hx, hy, 190, 78, sc, { expr: 'happy', phone: true, armF: -125 + p.armF * 0.1, armB: p.armB, bob: p.bob * 0.7, pony: p.pony, legF: p.legF, legB: p.legB });
  // globo-zoom con la pantalla del móvil
  const ph = { x: hx + (228 - 190) * sc, y: hy + (88 + p.bob * 0.7 - 78) * sc };
  const k = pop(t, 0.12, 0.55);
  const cx = 540, cy = 545;
  const tail = `M${f(470 - cx)} ${f(860 - cy)} L${f(ph.x - 30 - cx)} ${f(ph.y - 90 - cy)} L${f(640 - cx)} ${f(860 - cy)}Z`;
  let inner = `<path d="${tail}" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
  inner += panel(-430, -330, 860, 650, 60);
  inner += `<path d="${tail}" fill="#FFFFFF"/>`;
  inner += `<rect x="-60" y="-305" width="120" height="14" rx="7" fill="${INK}"/>`;
  inner += sneakerPair(-10, 95, 3.9);
  inner += checkCircle(290, -150, 66, pop(t, 0.8, 0.45));
  const lab = 'Pedido confirmado';
  inner += at(0, 215, pop(t, 1.05, 0.5), text(lab, 0, 0, { size: fit(lab, 84, 760), fill: INK, stroke: null }));
  s += at(cx, cy, k, inner, lerp(4, 0, k));
  return s;
};

// 3) Pasa por la zapatería y frena en seco
S[3] = (t, T) => {
  const v0 = 300, tb = 1.15, d = 0.35, ts = tb + d;
  const pos = tt => tt < tb ? v0 * tt : (tt < ts ? v0 * tb + v0 * ((tt - tb) - (tt - tb) * (tt - tb) / (2 * d)) : v0 * tb + v0 * d / 2);
  const w = 440, g = 50, pitch = w + g, j = 4, target = 560;
  const off0 = j * pitch - target - pos(10);
  const off = off0 + pos(t);
  let s = sky(T, { horizon: 1300, lanes: [300, 420, 250] });
  s += street(off, { w, h: 780, g, base: 1300, special: { [j]: SHOE_SHOP } });
  s += ground(1300, off, { sp: 220, curb: 1600 });
  const ph = 2 * PI * pos(t) / (v0 * STEP);
  const wp = walkPose(ph);
  const u = clamp((t - tb) / d);
  const after = t - ts;
  let o;
  if (t < ts) {
    o = { legF: lerp(wp.legF, -26, u), legB: lerp(wp.legB, 18, u), armF: lerp(wp.armF, -38, u), armB: lerp(wp.armB, -30, u), bob: wp.bob * (1 - u), pony: lerp(wp.pony, -26, u), lean: -11 * u };
  } else {
    const dm = damp(after, 10, 4.5);
    o = { legF: -26 * dm, legB: 18 * dm, armF: -38 * dm, armB: -30 * dm, bob: 0, pony: -26 * damp(after, 8, 3), lean: -11 * dm };
  }
  o.expr = t < 1.9 ? 'happy' : 'eh';
  const mx = 330, my = 1446;
  s += `<ellipse cx="${mx}" cy="${my}" rx="120" ry="16" fill="${INK}" opacity="0.18"/>`;
  // marcas de frenada y polvo
  if (t > tb) {
    const len = clamp((t - tb) / d) * 170;
    const fade = clamp(1 - (t - ts - 0.5) / 0.3);
    if (fade > 0) for (let i = 0; i < 2; i++) s += `<line x1="${f(mx + 40 - len * fade)}" y1="${my - 6 + i * 16}" x2="${mx + 40}" y2="${my - 6 + i * 16}" stroke="${INK}" stroke-width="${f(SW * 0.7)}" stroke-linecap="round"/>`;
    for (let i = 0; i < 3; i++) {
      const st = ts - 0.1 + i * 0.07, k = pop(t, st, 0.35) * clamp(1 - (t - st - 0.45) / 0.35);
      s += at(mx - 70 - i * 70, my - 22 - i * 8, k, `<circle r="${30 - i * 5}" fill="${C.cream}" stroke="${INK}" stroke-width="${f(SW)}"/>`);
    }
  }
  // líneas de movimiento durante la frenada
  if (t > tb - 0.1 && t < ts + 0.25) {
    const a = clamp(1 - Math.abs(t - ts) / 0.35);
    for (let i = 0; i < 3; i++) s += `<line x1="${f(mx - 170 - 120 * a)}" y1="${900 + i * 110}" x2="${mx - 170}" y2="${900 + i * 110}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linecap="round"/>`;
  }
  s += placeMarta(mx, my, 190, 204, 5.2, o);
  s += at(520, 700, pop(t, 1.95, 0.45), text('?', 0, 0, { size: 170, font: 'G' }), 12);
  return s;
};

// 4) Zoom rápido al escaparate: -30% y ¡DING!
S[4] = (t, T) => {
  const z = lerp(0.5, 1, pop(t, 0, 0.42));
  const px = 540, py = 900;
  let w = '';
  w += `<rect x="-200" y="80" width="1480" height="2200" fill="${C.cream}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  w += `<rect x="1060" y="80" width="220" height="2200" fill="${INK}" opacity="0.16"/>`;
  // rótulo
  w += `<rect x="${170 + 10}" y="${120 + 10}" width="740" height="150" rx="36" fill="${INK}"/><rect x="170" y="120" width="740" height="150" rx="36" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  w += text('TUS PIES', 540, 200, { size: 128, font: 'G', sw: SW * 1.8 });
  w += awning(-60, 1140, -160, 1240, 300, 190, 9);
  w += glassWindow(70, 600, 940, 830, null);
  // pedestal
  w += `<rect x="232" y="1252" width="640" height="190" fill="${INK}"/><rect x="220" y="1240" width="640" height="200" rx="8" fill="${C.pink}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  w += `<rect x="190" y="1200" width="700" height="50" rx="12" fill="${C.cream}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  w += sneakerPair(515, 1204, 4.4);
  // brillos
  [[180, 1080, 34, 0.55], [880, 1130, 26, 0.7], [760, 980, 20, 0.85]].forEach(([x, y, r, st]) => {
    const k = pop(t, st, 0.4); w += sparkle(x, y, r, k * (1 + 0.15 * Math.sin(t * 12 + x)));
  });
  w += `<rect x="70" y="600" width="940" height="830" rx="33" fill="none" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  w += `<rect x="40" y="1430" width="1000" height="34" rx="8" fill="${C.cream}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  // cartel -30 %
  const ks = 1 + 0.18 * Math.max(0, damp(t - 0.45, 14, 5)) * (t > 0.45 ? 1 : 0);
  w += at(805, 790, ks, sticker(0, 0, 150, -12));
  w += `<rect x="-200" y="1700" width="1480" height="600" fill="${C.ground}"/><line x1="-200" y1="1700" x2="1280" y2="1700" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  let s = `<rect width="${W}" height="${H}" fill="${C.sky}"/><rect y="1020" width="${W}" height="${H}" fill="${C.skyL}"/>` + clouds(T) + birds(T, [230, 250, 210]);
  s += `<g transform="translate(${px} ${py}) scale(${f(z)}) translate(${-px} ${-py})">${w}</g>`;
  s += speedLinesRadial(540, 900, clamp(1 - t / 0.35));
  // ¡DING!
  const kd = pop(t, 0.45, 0.5);
  s += at(320, 745, kd, burst(0, 0, 215, 8) + text('¡DING!', 0, 8, { size: 128, font: 'G', sw: SW * 2 }), -10 + 4 * Math.sin(t * 9));
  return s;
};

// 5) Sorpresa total con "?!" y líneas de impacto
S[5] = (t, T) => {
  const amp = 16 * Math.exp(-3 * t) + 3;
  const dx = amp * Math.sin(t * 71), dy = amp * Math.cos(t * 53);
  const z = lerp(1.18, 1, easeOut(t / 0.22));
  let s = sky(T, { horizon: 1500, lanes: [1250, 1300, 1200] });
  let g = impactLines(520, 820, t);
  const tr = 3 * Math.sin(t * 95);
  g += placeMarta(520 + tr, 820, 190, 78, 10.5, { sw: 11, expr: 'surprise', armF: -150 + 6 * Math.sin(t * 40), armB: 150 - 6 * Math.sin(t * 40), pony: -18 + 6 * Math.sin(t * 30), noLegs: true });
  // gotas
  g += at(330, 600, pop(t, 0.3, 0.4), `<path d="M0 -40 Q26 0 20 18 Q0 40 -20 18 Q-26 0 0 -40Z" fill="${C.glass}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`, -20);
  g += at(780, 1180, pop(t, 0.4, 0.4), `<path d="M0 -30 Q20 0 15 14 Q0 30 -15 14 Q-20 0 0 -30Z" fill="${C.glass}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`, 20);
  // ?!
  const kq = pop(t, 0.12, 0.5);
  g += at(815, 430, kq, text('?!', 0, 0, { size: 330, font: 'G', fill: C.red, sw: SW * 2.4, sd: 12 }), 10 + 3 * Math.sin(t * 20));
  g += at(215, 560, pop(t, 0.3, 0.5), text('!', 0, 0, { size: 200, font: 'G', fill: C.red, sw: SW * 2.2, sd: 9 }), -16);
  g += at(180, 1010, pop(t, 0.45, 0.5), text('?', 0, 0, { size: 150, font: 'G', fill: '#FFFFFF', sw: SW * 2, sd: 8 }), -20);
  s += `<g transform="translate(${f(dx)} ${f(dy)}) translate(540 900) scale(${f(z)}) translate(-540 -900)">${g}</g>`;
  return s;
};

// 6) Pantalla roja, logo y "Ya no se te escapan"
S[6] = (t, T) => {
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 680, 16, t * 8, C.dred);
  const k = pop(t, 0.12, 0.6);
  const y = lerp(-700, 680, k) + (t > 1 ? 6 * Math.sin((t - 1) * 3) : 0);
  // whoosh
  if (t > 0.1 && t < 0.55) {
    const a = clamp(1 - (t - 0.1) / 0.45);
    [[-200, 0.9], [0, 1.2], [200, 0.8]].forEach(([dx, l]) => {
      s += `<line x1="${540 + dx}" y1="${f(y - 330)}" x2="${540 + dx}" y2="${f(y - 330 - 380 * l * a)}" stroke="#FFFFFF" stroke-width="${f(SW * 1.6)}" stroke-linecap="round"/>`;
    });
  }
  const sq = 1 + 0.08 * (t > 0.3 ? damp(t - 0.3, 18, 6) : 0);
  s += `<g transform="translate(540 ${f(y)}) scale(${f(1 / sq)} ${f(sq)})">${logoBadge(0, 0, 680)}</g>`;
  const l1 = 'Ya no se', l2 = 'te escapan';
  s += at(540, 1145, pop(t, 0.85, 0.5), text(l1, 0, 0, { size: 150, sw: SW * 2.4, sd: 9 }), -3);
  s += at(540, 1315, pop(t, 1.15, 0.5), text(l2, 0, 0, { size: fit(l2, 170, 960), sw: SW * 2.4, sd: 9 }), -3);
  return s;
};

// 7) Móvil grande con la web y tarjetas
S[7] = (t, T) => {
  let s = sky(T, { horizon: 1500, lanes: [300, 650, 1050] });
  const kp = pop(t, 0, 0.45);
  const X = 150, Y = 200, PW = 780, PH = 1280, R = 92, in_ = 26;
  const sx = X + in_, sy = Y + in_, sw_ = PW - in_ * 2, sh = PH - in_ * 2;
  const id = 'scr' + (uid++);
  let g = '';
  g += `<rect x="${X + 22}" y="${Y + 22}" width="${PW}" height="${PH}" rx="${R}" fill="${C.blueS}"/>`;
  g += `<rect x="${X}" y="${Y}" width="${PW}" height="${PH}" rx="${R}" fill="${INK}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  g += `<clipPath id="${id}"><rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="${R - in_}"/></clipPath>`;
  let sc = `<rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" fill="${C.cream}"/>`;
  // franja roja superior con el logo
  sc += `<rect x="${sx}" y="${sy}" width="${sw_}" height="220" fill="${C.red}"/><line x1="${sx}" y1="${sy + 220}" x2="${sx + sw_}" y2="${sy + 220}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  sc += logoBadge(sx + 118, sy + 112, 190, 0, pop(t, 0.3, 0.45));
  sc += at(sx + 230, sy + 118, pop(t, 0.4, 0.45), text('Ofertas, novedades', 0, -34, { size: fit('Ofertas, novedades', 50, 440), anchor: 'start', sw: SW * 1.5, sd: 4 }) + text('y eventos', 0, 34, { size: 50, anchor: 'start', sw: SW * 1.5, sd: 4 }));
  const cards = [
    { title: 'Zapatería', sub: 'zapatos -30%', icon: 'shoe', badge: 'pct' },
    { title: 'Panadería', sub: '2x1 en pasteles', icon: 'cupcake', badge: 'pct' },
    { title: 'Floristería', sub: 'ramos de otoño', icon: 'bouquet', badge: 'star' },
    { title: 'Bar', sub: 'día de la tortilla', icon: 'tortilla', badge: 'cal' }
  ];
  const cx0 = 202, cw = 676, chh = 216, gap = 24, cy0 = sy + 250;
  cards.forEach((c, i) => {
    const st = 0.75 + i * 1.2;
    const k = pop(t, st, 0.55);
    if (k <= 0) return;
    const yy = cy0 + i * (chh + gap) + (1 - k) * 900;
    let cd = panel(cx0, yy, cw, chh, 34, '#FFFFFF', 10);
    cd += `<rect x="${cx0 + 22}" y="${yy + 28}" width="160" height="160" rx="26" fill="${C.glass}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
    const is = 1.45;
    cd += `<g transform="translate(${cx0 + 22 + 80 - 50 * is} ${yy + 28 + 80 - 52 * is}) scale(${is})">${ICONS[c.icon](SW / is)}</g>`;
    cd += text(c.title, cx0 + 206, yy + 72, { size: 58, anchor: 'start', fill: INK, stroke: null });
    cd += text(c.sub, cx0 + 206, yy + 148, { size: fit(c.sub, 50, 440), anchor: 'start', fill: c.badge === 'pct' ? C.red : C.navy, stroke: null });
    const kb = pop(t, st + 0.25, 0.45), bx = cx0 + cw - 40, by = yy + 26;
    if (c.badge === 'pct') cd += sealPct(bx, by, 50, kb);
    if (c.badge === 'star') cd += starBadge(bx, by, 54, kb);
    if (c.badge === 'cal') cd += calendarBadge(bx, by, 50, kb);
    sc += cd;
  });
  g += `<g clip-path="url(#${id})">${sc}</g>`;
  g += `<rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="${R - in_}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  s += at(540, 840, kp, `<g transform="translate(-540 -840)">${g}</g>`);
  return s;
};

// 8) Comenta INSTANTE + web + botón canal
S[8] = (t, T) => {
  let s = `<rect width="${W}" height="${H}" fill="${C.cream}"/>`;
  const sp = 76, ox = (t * 18) % sp, oy = (t * 12) % sp;
  let dots = '';
  for (let j = -1; j < H / sp + 1; j++) for (let i = -1; i < W / sp + 1; i++) {
    const x = i * sp + (j % 2 ? sp / 2 : 0) - ox, y = j * sp - oy;
    dots += `<circle cx="${f(x)}" cy="${f(y)}" r="9"/>`;
  }
  s += `<g fill="${C.pink}" opacity="0.55">${dots}</g>`;
  // globo de comentario
  const kb = pop(t, 0.25, 0.55);
  let b = `<path d="M-300 290 L-380 420 L-180 300Z" transform="translate(14 14)" fill="${INK}"/>`;
  b += `<path d="M-300 290 L-380 420 L-180 300Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
  b += panel(-450, -315, 900, 630, 90);
  b += `<path d="M-296 298 L-366 405 L-190 304Z" fill="#FFFFFF"/>`;
  b += at(0, -150, pop(t, 0.5, 0.5), text('Comenta', 0, 0, { size: 140, fill: INK, stroke: null }));
  const word = (CFG.keyword || 'INSTANTE'), size = fit(word, 200, 800);
  const total = measure(word, size);
  let xx = -total / 2;
  for (let i = 0; i < word.length; i++) {
    const ch = word[i], cwid = measure(ch, size);
    const k = pop(t, 0.8 + i * 0.07, 0.45);
    b += at(xx + cwid / 2, 95, k, text(ch, 0, 0, { size, fill: C.red, sw: SW * 2.2, sd: 9 }), (i % 2 ? 4 : -4) * (1 - k));
    xx += cwid;
  }
  s += at(540, 560, kb, b, lerp(-6, 0, kb));
  // franja roja con la web
  const ks = pop(t, 1.8, 0.6);
  const url = 'escaparatetudela.es';
  let st = `<rect x="-640" y="-80" width="1280" height="170" transform="translate(0 12)" fill="${INK}"/><rect x="-640" y="-85" width="1280" height="170" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  st += text(url, 0, 2, { size: fit(url, 100, 940), sw: SW * 2, sd: 6 });
  s += `<g transform="translate(${f(540 + (1 - ks) * -1500)} 1105) rotate(-3)">${st}</g>`;
  // botón verde
  const kbtn = pop(t, 2.9, 0.55);
  const pulse = t > 3.5 ? 1 + 0.03 * Math.sin((t - 3.5) * 2 * PI / 1.2) : 1;
  let bt = '';
  if (t > 3.5) {
    const ph = ((t - 3.5) % 1.2) / 1.2;
    const rs = 1 + 0.18 * ph;
    bt += `<rect x="${f(-400 * rs)}" y="${f(-82 * rs - 10 * ph)}" width="${f(800 * rs)}" height="${f(164 * rs + 20 * ph)}" rx="${f(82 * rs + 10 * ph)}" fill="none" stroke="${C.green}" stroke-width="${f(SW * 1.2 * (1 - ph))}"/>`;
  }
  bt += `<rect x="-388" y="-70" width="800" height="164" rx="82" fill="${INK}"/>`;
  bt += `<rect x="-400" y="-82" width="800" height="164" rx="82" fill="${C.green}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  const lab = 'Canal de WhatsApp';
  bt += text(lab, 0, 2, { size: fit(lab, 88, 660), sw: SW * 2, sd: 5 });
  s += at(540, 1340, kbtn * pulse, bt);
  return s;
};

// 9) Guiño a cámara señalando abajo + tarjeta final
S[9] = (t, T, sc) => {
  const cut = (sc && sc.cut) || 1.6;
  if (t < cut) {
    let s = sky(T, { horizon: 1400, lanes: [330, 260, 380] });
    s += ground(1400, 0, { sp: 260 });
    const z = lerp(1.12, 1, easeOut(t / 0.2));
    const pa = easeOut(t / 0.22);
    const breathe = -1.2 * (0.5 + 0.5 * Math.sin(t * 6));
    let g = `<ellipse cx="470" cy="1610" rx="150" ry="20" fill="${INK}" opacity="0.18"/>`;
    g += placeMarta(470, 700, 190, 78, 7.2, { expr: t < 0.38 ? 'happy' : 'wink', point: true, armF: lerp(0, -38, pa), armB: 6, bob: breathe, pony: 5 * Math.sin(t * 5) });
    // destello del guiño
    g += sparkle(585, 625, 46, pop(t, 0.4, 0.4) * (1 + 0.12 * Math.sin(t * 14)));
    g += sparkle(640, 720, 24, pop(t, 0.5, 0.4));
    // flecha hacia abajo
    const ka = pop(t, 0.3, 0.45), bob = 18 * Math.abs(Math.sin(t * 7));
    g += at(780, 1300 + bob, ka, `<path d="M-38 -90 H38 V0 H80 L0 90 L-80 0 H-38Z" transform="translate(9 9)" fill="${INK}"/><path d="M-38 -90 H38 V0 H80 L0 90 L-80 0 H-38Z" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`);
    s += `<g transform="translate(540 900) scale(${f(z)}) translate(-540 -900)">${g}</g>`;
    return s;
  }
  const u = t - cut;
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 640, 16, t * 8, C.dred);
  // solo el icono (logo.png), grande; el nombre va debajo como texto
  s += at(540, 625, pop(u, 0, 0.45), `<svg x="-340" y="-340" width="680" height="680" viewBox="30 23 440 440"><use href="#logoI"/></svg>`);
  s += at(540, 1065, pop(u, 0.1, 0.45), text('Escaparate', 0, 0, { size: 150, sw: SW * 2.4, sd: 9 }));
  s += at(540, 1215, pop(u, 0.18, 0.45), text('de Tudela', 0, 0, { size: 150, sw: SW * 2.4, sd: 9 }));
  const url = 'escaparatetudela.es', us = fit(url, 76, 700);
  s += at(540, 1385, pop(u, 0.28, 0.45), `<rect x="-380" y="-62" width="780" height="124" rx="62" transform="translate(10 10)" fill="${INK}"/><rect x="-390" y="-62" width="780" height="124" rx="62" fill="${C.dred}" stroke="${INK}" stroke-width="${f(SW)}"/>` + text(url, 0, 2, { size: us, sw: SW * 1.8, sd: 5 }));
  return s;
};

/* ---------- API para el renderizador ---------- */
window.init = async function (cfg, fonts, logos) {
  CFG = cfg;
  const b64ToBuf = b => Uint8Array.from(atob(b), c => c.charCodeAt(0)).buffer;
  for (const [fam, wt, b64] of fonts) {
    const ff = new FontFace(fam, b64ToBuf(b64), { weight: String(wt) });
    await ff.load(); document.fonts.add(ff);
  }
  await document.fonts.ready;
  const defs = document.getElementById('defs');
  const ns = 'http://www.w3.org/2000/svg';
  for (const [id, url] of logos) {
    const img = new Image(); img.src = url; await img.decode();
    const el = document.createElementNS(ns, 'image');
    el.setAttribute('id', id); el.setAttribute('width', '500'); el.setAttribute('height', '500');
    el.setAttribute('href', url);
    defs.appendChild(el);
  }
  return true;
};
window.renderFrame = function (sceneId, t, T) {
  uid = 0;
  const sc = CFG.scenes.find(s => s.id === sceneId);
  document.getElementById('dyn').innerHTML = S[sceneId](t, T, sc);
};
