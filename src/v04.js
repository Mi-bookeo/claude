/* Vídeo 04 — «¿Qué es Escaparate de Tudela?». Piezas nuevas sobre lib.js + series.js + rosa.js:
   fondo común (cielo de dos bandas, sol, nubes, pájaros), las cuatro tiendas, tarjetas de publicación con
   etiqueta roja colgando, móvil del portal, gente con móvil, fachada ancha, números 1-2-3, sobre y burbujas. */
'use strict';

/* ---------- las cuatro tiendas genéricas de la calle ---------- */
ITEMS.drinks = sw => `<path d="M14 94 H86" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M20 46 H44 L41 92 H23 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>
  <path d="M21.5 60 H42.5 L41 92 H23 Z" fill="${C.yel}" stroke="${INK}" stroke-width="${sw * 0.7}" stroke-linejoin="round"/>
  <circle cx="28" cy="72" r="2.5" fill="#FFFFFF"/><circle cx="35" cy="82" r="2" fill="#FFFFFF"/>
  <path d="M20 46 Q24 38 32 42 Q38 36 44 46 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${sw * 0.8}" stroke-linejoin="round"/>
  <path d="M56 60 H82 Q82 92 69 92 Q56 92 56 60 Z" fill="${C.glass}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>
  <path d="M57 68 H81 Q79 90 69 90 Q59 90 57 68 Z" fill="${C.red}" stroke="${INK}" stroke-width="${sw * 0.6}"/>
  <path d="M74 60 L84 36" stroke="${INK}" stroke-width="${sw * 1.4}" stroke-linecap="round"/><path d="M74 60 L84 36" stroke="${C.green}" stroke-width="${sw * 0.6}" stroke-linecap="round"/>`;
const SHOPS4 = [
  { facade: C.cream, sign: 'ZAPATERÍA', item: 'shoes' },
  { facade: C.pink, sign: 'PANADERÍA', item: 'bread' },
  { facade: C.navy, sign: 'FLORISTERÍA', item: 'flowers' },
  { facade: C.cream, sign: 'BAR', item: 'drinks' }
];
for (let i = 0; i < 4; i++) SHOP_TYPES[i] = SHOPS4[i];

/* ---------- fondo común: cielo (dos bandas), sol, 5 nubes, pájaros ---------- */
function bg(T, o = {}) {
  let s = skyClear(T, { band: o.band || 900, tm: 720, sx: o.sx || 920, sy: o.sy || 250, sr: o.sr || 58, clouds: o.clouds });
  s += birds(T + (o.birdOff || 0), o.lanes || [330, 520, 700]);
  return s;
}
// isla de acera bajo una tienda flotante (escena 2)
function slab(x, y, w) {
  return `<rect x="${f(x + 10)}" y="${f(y + 10)}" width="${f(w)}" height="44" rx="16" fill="${INK}"/>
    <rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="44" rx="16" fill="${C.ground}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
}
// puerta de shop() (misma geometría que lib.js)
function shopDoor(x, base, w, h) {
  const top = base - h, ay = top + h * 0.2, ah = h * 0.15;
  const wy = ay + ah + w * 1.06 / 14 + h * 0.05;
  return { x: x + w * 0.67, y: wy, w: w * 0.23, h: base - wy };
}

/* ---------- símbolos de las etiquetas ---------- */
function yelStar(x, y, r, sc = 1) {
  const d = starPath(r, r * 0.48, 5);
  return at(x, y, sc, `<path d="${d}" transform="translate(4 4)" fill="${INK}"/><path d="${d}" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>
    <circle cx="${f(-r * 0.18)}" cy="${f(-r * 0.14)}" r="${f(r * 0.09)}" fill="#FFFFFF"/>`, 0);
}
function tagSymbol(type, r) {
  if (type === 'oferta') return sealPct(0, 0, r, 1);
  if (type === 'novedad') return yelStar(0, 0, r * 1.08);
  return calendarBadge(0, 0, r * 0.95, 1);
}
// etiqueta roja colgando de un clavo (px,py); s = escala; swing = giro en grados
function hangTag(px, py, s, type, swing = 0) {
  const sw = SW / s;
  const body = 'M-38 22 L0 0 L38 22 V104 Q38 114 28 114 H-28 Q-38 114 -38 104 Z';
  let g = `<path d="M0 -26 L0 12" stroke="${INK}" stroke-width="${f(sw * 0.8)}" stroke-linecap="round"/>`;
  g += `<circle cx="0" cy="-26" r="6" fill="${INK}"/>`;
  g += `<path d="${body}" transform="translate(6 6)" fill="${INK}"/>`;
  g += `<path d="${body}" fill="${C.red}" stroke="${INK}" stroke-width="${f(sw)}" stroke-linejoin="round"/>`;
  g += `<circle cx="0" cy="16" r="6" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(sw * 0.7)}"/>`;
  g += `<circle cx="0" cy="66" r="32" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(sw * 0.8)}"/>`;
  g += `<g transform="translate(0 66) scale(${f(1 / s)})">${tagSymbol(type, 25 * s)}</g>`;
  return `<g transform="translate(${f(px)} ${f(py)}) scale(${f(s)}) rotate(${f(swing)})">${g}</g>`;
}

/* ---------- tarjetas de publicación ---------- */
ICONS.drink = sw => `<path d="M26 22 H74 L66 92 H34 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>
  <path d="M28.5 40 H71.5 L66 92 H34 Z" fill="${C.yel}" stroke="${INK}" stroke-width="${sw * 0.8}" stroke-linejoin="round"/>
  <circle cx="42" cy="60" r="4" fill="#FFFFFF"/><circle cx="56" cy="74" r="3" fill="#FFFFFF"/><circle cx="48" cy="82" r="2.4" fill="#FFFFFF"/>
  <path d="M24 26 Q28 10 42 16 Q50 6 62 14 Q76 10 76 26 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
const CARDS = [
  { type: 'oferta', label: 'OFERTA', icon: 'shoe', l1: 'Zapatos', l2: 'en oferta', shop: 0 },
  { type: 'novedad', label: 'NOVEDAD', icon: 'cupcake', l1: 'Pastel', l2: 'nuevo', shop: 1 },
  { type: 'novedad', label: 'NOVEDAD', icon: 'bouquet', l1: 'Flores de', l2: 'temporada', shop: 2 },
  { type: 'evento', label: 'EVENTO', icon: 'drink', l1: 'Tarde de', l2: 'música', shop: 3 }
];
const CARD_W = 440, CARD_H = 185;
const ICON_BG = { shoe: C.glass, cupcake: '#FDE3EC', bouquet: '#DDF0E3', drink: '#FFF1C9' };
// tarjeta centrada en (0,0), tamaño 440x185; swing = vaivén de la etiqueta
function pubCardLocal(c, swing = 0) {
  const x0 = -CARD_W / 2, y0 = -CARD_H / 2, st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}"`;
  let g = panel(x0, y0, CARD_W, CARD_H, 26, '#FFFFFF', 9);
  g += `<rect x="${x0 + 14}" y="${y0 + 14}" width="152" height="${CARD_H - 28}" rx="20" fill="${ICON_BG[c.icon]}" ${st(0.8)}/>`;
  g += unitBox(x0 + 18, y0 + 16, 144, CARD_H - 32, ICONS[c.icon], 0.95);
  const tx = x0 + 182, tw = 160;
  g += text(c.label, tx, y0 + 44, { size: fit(c.label, 44, tw, 'G'), font: 'G', anchor: 'start', fill: C.red, sw: SW * 1.2, sd: 3 });
  g += text(c.l1, tx, y0 + 98, { size: fit(c.l1, 40, tw), anchor: 'start', fill: INK, stroke: null });
  g += text(c.l2, tx, y0 + 142, { size: fit(c.l2, 40, tw), anchor: 'start', fill: INK, stroke: null });
  g += hangTag(x0 + CARD_W - 48, y0 + 26, 0.8, c.type, swing);
  return g;
}
function pubCard(cx, cy, k, rot, c, swing = 0) { return at(cx, cy, k, pubCardLocal(c, swing), rot); }
// estela: tres trazos que siguen la trayectoria pasada (fn(u) -> [x,y])
function trail(fn, u, len = 0.3, wdt = 46) {
  if (u <= 0) return '';
  let s = '';
  const N = 10, u0 = Math.max(0, u - len);
  const pts = [];
  for (let i = 0; i <= N; i++) pts.push(fn(lerp(u0, u, i / N)));
  [-1, 0, 1].forEach((o, j) => {
    let d = '';
    pts.forEach((p, i) => {
      const q = pts[Math.min(N, i + 1)], r = pts[Math.max(0, i - 1)];
      let nx = -(q[1] - r[1]), ny = q[0] - r[0];
      const L = Math.hypot(nx, ny) || 1; nx /= L; ny /= L;
      const k = (i / N) * wdt * o;
      d += (i ? 'L' : 'M') + f(p[0] + nx * k) + ' ' + f(p[1] + ny * k);
    });
    s += `<path d="${d}" fill="none" stroke="${o ? INK : '#FFFFFF'}" stroke-width="${f(o ? SW * 0.9 : SW * 2.2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (!o) s = `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${f(SW * 3.8)}" stroke-linecap="round" stroke-linejoin="round"/>` + s;
  });
  // puntitos de velocidad
  for (let i = 0; i < 3; i++) {
    const p = fn(Math.max(0, u - len * (0.3 + i * 0.25)));
    s += `<circle cx="${f(p[0] + (i - 1) * 18)}" cy="${f(p[1] + (i % 2 ? 20 : -20))}" r="${f(9 - i * 2)}" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
  }
  return s;
}
// trayectoria en arco de a hacia b
const arcPath = (a, b, hgt) => u => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - hgt * 4 * u * (1 - u)];

/* ---------- móvil del portal ---------- */
// body(sx, sy, sw, sh, top) devuelve el contenido bajo la franja roja
function portalPhone(X, Y, PW, PH, body, o = {}) {
  const R = 70, b = 22, sx = X + b, sy = Y + b, sw_ = PW - 2 * b, sh = PH - 2 * b, hh = o.hh || 170;
  const id = 'pp' + (uid++), st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let g = `<rect x="${X + 18}" y="${Y + 18}" width="${PW}" height="${PH}" rx="${R}" fill="${INK}"/>`;
  g += `<rect x="${X}" y="${Y}" width="${PW}" height="${PH}" rx="${R}" fill="${INK}" ${st()}/>`;
  g += `<clipPath id="${id}"><rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="${R - b}"/></clipPath>`;
  let sc = `<rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" fill="${C.cream}"/>`;
  for (let yy = sy + hh + 30; yy < sy + sh; yy += 44) for (let xx = sx + 22; xx < sx + sw_; xx += 44) sc += `<circle cx="${xx}" cy="${yy}" r="3.5" fill="${DOT}" opacity="0.6"/>`;
  sc += `<rect x="${sx}" y="${sy}" width="${sw_}" height="${hh}" fill="${C.red}"/><line x1="${sx}" y1="${sy + hh}" x2="${sx + sw_}" y2="${sy + hh}" ${st()}/>`;
  const lr = hh * 0.36;
  sc += `<circle cx="${f(sx + 26 + lr)}" cy="${f(sy + hh / 2 + 6)}" r="${f(lr)}" fill="#FFFFFF" ${st(0.8)}/>` + logoIcon(sx + 26 + lr, sy + hh / 2 + 8, lr * 1.8);
  const tx = sx + 26 + lr * 2 + 18, tw = sw_ - (tx - sx) - 20, ts = fit('Escaparate', hh * 0.32, tw);
  sc += text('Escaparate', tx, sy + hh / 2 - ts * 0.42, { size: ts, anchor: 'start', sw: SW * 1.4, sd: 4 });
  sc += text('de Tudela', tx, sy + hh / 2 + ts * 0.62, { size: ts, anchor: 'start', sw: SW * 1.4, sd: 4 });
  if (body) sc += body(sx, sy + hh, sw_, sh - hh);
  g += `<g clip-path="url(#${id})">${sc}</g>`;
  g += `<rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="${R - b}" fill="none" ${st(0.8)}/>`;
  g += `<rect x="${X + PW / 2 - 60}" y="${Y + 7}" width="120" height="10" rx="5" fill="#3A3434"/>`;
  return g;
}

/* ---------- gente con móvil ---------- */
// móvil grande en la mano (local, centrado en la mano hx,hy); lit = pantalla encendida con una tarjeta
function phoneHand(hx, hy, o = {}) {
  return w => {
    const rot = o.rot === undefined ? -12 : o.rot, sh = o.shake || 0;
    const ps = o.ps || 1;
    let g = `<g transform="translate(${f(hx + 3 + sh)} ${f(hy - 13 * ps)}) rotate(${f(rot)}) scale(${f(ps)})">`;
    g += `<rect x="-10.5" y="-18" width="21" height="36" rx="3.6" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/>`;
    if (o.lit) {
      const c = CARDS[(o.card || 0) % 4];
      g += `<rect x="-8.3" y="-15.4" width="16.6" height="31" rx="2" fill="${C.cream}"/>`;
      g += `<rect x="-8.3" y="-15.4" width="16.6" height="6" fill="${C.red}"/><circle cx="-4.6" cy="-12.4" r="1.9" fill="#FFFFFF"/>`;
      g += `<rect x="-6.8" y="-6.4" width="13.6" height="17" rx="1.6" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(0.9)}"/>`;
      g += `<rect x="-5.4" y="-5" width="6.4" height="7" rx="1" fill="${ICON_BG[c.icon]}" stroke="${INK}" stroke-width="${w(0.6)}"/>`;
      g += `<path d="M2.3 -5.2 L4.4 -6.6 L6.5 -5.2 V0.4 H2.3Z" fill="${C.red}" stroke="${INK}" stroke-width="${w(0.6)}" stroke-linejoin="round"/>`;
      g += `<rect x="-5.4" y="4" width="10.8" height="1.8" rx="0.9" fill="${INK}" opacity="0.6"/><rect x="-5.4" y="7.2" width="7" height="1.8" rx="0.9" fill="${INK}" opacity="0.6"/>`;
    } else g += `<rect x="-8.3" y="-15.4" width="16.6" height="31" rx="2" fill="${C.glass}"/>`;
    g += `</g>`;
    g += `<circle cx="${hx}" cy="${hy}" r="4.3" fill="${o.skin || C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
    return g;
  };
}
// persona de la multitud. spec: {kind:'folk', i} | {kind:'marta'|'lucia'|'rosa'}
// o: flip, expr, look, head, armF, bob, lit, card, shake. Devuelve {svg, phone:[x,y]} (posición del móvil en el mundo)
function crowdPerson(spec, x, foot, sc, o) {
  const armF = o.armF || 0;
  let svg, pivot, len, ay = 204, s = sc;
  if (spec.kind === 'rosa') {
    pivot = [204, 110]; ay = 208;
    const hand = [204.5, 142];
    svg = placeRosa(x, foot, 190, 208, sc, Object.assign({}, o, { handF: phoneHand(hand[0], hand[1], o), armB: -12 }));
    len = 32;
  } else if (spec.kind === 'folk') {
    const p = FOLK[spec.i];
    s = sc * (p.scale || 1);
    pivot = [202, 108];
    svg = placeFolk(spec.i, x, foot, sc, Object.assign({}, o, { handF: phoneHand(202.5, 139.5, Object.assign({}, o, { skin: p.skin })) }));
    len = 31.5;
  } else {
    pivot = [202, 108];
    svg = place(x, foot, 190, 204, sc, Object.assign({ who: spec.kind }, o, { handF: phoneHand(202.5, 140, o) }));
    len = 32;
  }
  const a = armF * PI / 180;
  const hx = pivot[0] - len * Math.sin(a), hy = pivot[1] + len * Math.cos(a);
  const ph = toWorld(x, foot, 190, ay, s, hx + 3, hy - 13, o.flip);
  const head = toWorld(x, foot, 190, ay, s, 192, 60, o.flip);
  return { svg: shadowEll(x, foot, 26 * s) + svg, phone: ph, head };
}

/* ---------- fachada ancha (para el móvil de la escena 4) ---------- */
function wideShop(x, y, w, h, type) {
  const t = SHOPS4[type], st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = `<rect x="${f(x + 8)}" y="${f(y + 8)}" width="${f(w)}" height="${f(h)}" rx="14" fill="${INK}"/>`;
  s += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="14" fill="${t.facade}" ${st()}/>`;
  const ph = h * 0.22;
  s += `<rect x="${f(x + w * 0.1)}" y="${f(y + h * 0.05)}" width="${f(w * 0.8)}" height="${f(ph)}" rx="${f(ph * 0.3)}" fill="${C.red}" ${st()}/>`;
  s += text(t.sign, x + w / 2, y + h * 0.05 + ph * 0.54, { size: fit(t.sign, ph * 0.8, w * 0.7, 'G'), font: 'G', sw: SW * 1.3, sd: 3, ls: 1 });
  const ay = y + h * 0.32, ah = h * 0.16;
  s += awning(x + w * 0.05, x + w * 0.95, x + w * 0.01, x + w * 0.99, ay, ah, 8);
  const wy = ay + ah + (w * 0.98 / 8) / 2 + h * 0.04, wh = y + h - h * 0.06 - wy;
  s += glassWindow(x + w * 0.07, wy, w * 0.56, wh, itemFn(t.item));
  const dx = x + w * 0.7, dw = w * 0.22;
  s += `<rect x="${f(dx)}" y="${f(wy)}" width="${f(dw)}" height="${f(y + h - wy)}" rx="8" fill="${t.facade === C.navy ? C.blueS : C.navy}" ${st()}/>`;
  s += `<rect x="${f(dx + dw * 0.22)}" y="${f(wy + dw * 0.18)}" width="${f(dw * 0.56)}" height="${f((y + h - wy) * 0.42)}" rx="5" fill="${C.glass}" ${st(0.7)}/>`;
  s += `<circle cx="${f(dx + dw * 0.8)}" cy="${f(wy + (y + h - wy) * 0.62)}" r="${f(dw * 0.07)}" fill="${C.yel}" ${st(0.6)}/>`;
  return s;
}

/* ---------- números 1, 2, 3 ---------- */
function numCircle(x, y, r, n, k, rot = 0) {
  return at(x, y, k, `<circle cx="10" cy="10" r="${r}" fill="${INK}"/><circle r="${r}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW * 1.1)}"/>
    <circle r="${f(r * 0.8)}" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="14 10" stroke-linecap="round" opacity="0.9"/>` +
    text(String(n), 0, r * 0.08, { size: r * 1.25, sw: SW * 2, sd: 6 }), rot);
}

/* ---------- sobre ---------- */
function envelope(x, y, wd, k, open = 0, rot = 0) {
  const hw = wd / 2, hh = wd * 0.33, st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let g = `<rect x="${f(-hw + 14)}" y="${f(-hh + 14)}" width="${f(wd)}" height="${f(hh * 2)}" rx="26" fill="${INK}"/>`;
  const fy = lerp(hh * 0.25, -hh * 2.0, clamp(open));
  const flap = `<path d="M${f(-hw + 6)} ${f(-hh + 6)} L0 ${f(fy)} L${f(hw - 6)} ${f(-hh + 6)} Z" fill="${open > 0.5 ? C.dred : C.red}" ${st()}/>`;
  if (open > 0.5) g += flap;
  // carta asomando cuando se abre
  if (open > 0) {
    const ly = -hh - open * hh * 0.9;
    g += `<rect x="${f(-hw * 0.78)}" y="${f(ly)}" width="${f(hw * 1.56)}" height="${f(hh * 1.5)}" rx="14" fill="#FFFFFF" ${st()}/>`;
    for (let i = 0; i < 3; i++) g += `<rect x="${f(-hw * 0.6)}" y="${f(ly + 34 + i * 34)}" width="${f(hw * (i === 2 ? 0.7 : 1.2))}" height="12" rx="6" fill="${i ? '#E2D6D3' : C.red}"/>`;
  }
  g += `<rect x="${f(-hw)}" y="${f(-hh)}" width="${f(wd)}" height="${f(hh * 2)}" rx="26" fill="${C.cream}" ${st()}/>`;
  g += `<path d="M${f(-hw + 12)} ${f(hh - 10)} L${f(-hw * 0.2)} ${f(-hh * 0.05)} M${f(hw - 12)} ${f(hh - 10)} L${f(hw * 0.2)} ${f(-hh * 0.05)}" fill="none" ${st(0.8)} stroke-linecap="round"/>`;
  // solapa (abierta = hacia arriba, detrás de la carta)
  if (open <= 0.5) g += flap;
  if (open < 0.5) g += `<circle cx="0" cy="${f(fy - 6)}" r="${f(wd * 0.06)}" fill="${C.yel}" ${st(0.8)}/>`;
  return at(x, y, k, g, rot);
}

/* ---------- burbuja flotante ---------- */
function bubble(x, y, k, label, type, tail = 'left', rot = 0) {
  const tw = Math.max(330, measure(label, 78) + 170), th = 140, st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  const tx = tail === 'left' ? tw * 0.5 - 40 : -tw * 0.5 + 40;
  const td = tail === 'left' ? `M${f(tx - 46)} ${th / 2 - 4} L${f(tx + 30)} ${th / 2 + 52} L${f(tx - 2)} ${th / 2 - 4}Z` : `M${f(tx + 46)} ${th / 2 - 4} L${f(tx - 30)} ${th / 2 + 52} L${f(tx + 2)} ${th / 2 - 4}Z`;
  let g = `<g transform="translate(12 12)"><rect x="${f(-tw / 2)}" y="${-th / 2}" width="${f(tw)}" height="${th}" rx="${th / 2}" fill="${INK}"/><path d="${td}" fill="${INK}"/></g>`;
  g += `<path d="${td}" fill="#FFFFFF" ${st}/>`;
  g += `<rect x="${f(-tw / 2)}" y="${-th / 2}" width="${f(tw)}" height="${th}" rx="${th / 2}" fill="#FFFFFF" ${st}/>`;
  g += `<path d="${td}" fill="#FFFFFF" transform="translate(0 -8)"/>`;
  g += `<g transform="translate(${f(-tw / 2 + 78)} 2)">${tagSymbol(type, 40)}</g>`;
  g += text(label, -tw / 2 + 140, 4, { size: 78, anchor: 'start', fill: C.red, sw: SW * 1.6, stroke: INK, sd: 4 });
  return at(x, y, k, g, rot);
}

/* ---------- dedo índice (del vídeo 03) ---------- */
function finger(x, y, rot = -8) { // dedo índice que llega desde la derecha y pulsa
  const st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  return at(x, y, 1, `<path d="M0 -26 Q-34 -26 -34 0 Q-34 26 0 26 H120 Q150 26 170 50 L420 60 V-90 L170 -60 Q150 -26 120 -26Z" fill="${C.skin}" ${st}/>
    <path d="M-20 -14 Q-28 0 -20 14 L-4 14 Q2 0 -4 -14Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>
    <path d="M70 -26 Q76 0 70 26 M150 -40 Q140 0 156 40" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linecap="round"/>
    <path d="M170 50 L420 60 V-90 L170 -60" fill="${C.red}" ${st}/>`, rot);
}
