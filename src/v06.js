/* Vídeo 06 — «Mari Carmen y los bolsos». Piezas nuevas sobre lib.js + series.js + rosa.js + v04.js + v05.js:
   Mari Carmen (referencia SVG exacta, suelo en y=208), bolsos, peanas, cartel «%», fachada de «DETALLE»,
   interior de la tienda (estantes, pañuelos, collares, reloj, lámpara, mostrador), mano que pega el cartel,
   tarjeta de oferta del móvil, móviles de la gente con el bolso rosa, clienta y «¡cha-ching!». */
'use strict';

const MC = { hair: '#6B4A3A', frame: '#8E1B1B', shoe: '#5A4137' };
const BAGC = [
  { c: '#F48FB1', s: '#D9739A' }, // rosa
  { c: '#3F7CC4', s: '#2B5A99' }, // azul
  { c: '#F2C12E', s: '#C99A1E' }, // amarillo
  { c: '#3C9D5D', s: '#2A7344' }  // verde
];

/* ===================== MARI CARMEN ===================== */
// expr: 'happy' (referencia) | 'expect' | 'focus' | 'proud' | 'smile'
function mcFace(o, w) {
  const e = o.expr || 'happy', lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const L = (d, sw = 1.6, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  let s = `<circle cx="196" cy="81" r="4" fill="#FFFFFF" fill-opacity="0.5"/><circle cx="204" cy="81" r="4" fill="#FFFFFF" fill-opacity="0.5"/>`;
  // ojos
  if (o.blink) s += L('M193.4 81.4 H198.6 M201.4 81.4 H206.6', 1.4);
  else if (e === 'proud') s += `<circle cx="${f(196 + lx)}" cy="${f(81 + ly)}" r="2.3" fill="${INK}"/><circle cx="${f(204 + lx)}" cy="${f(81 + ly)}" r="2.3" fill="${INK}"/>
      <circle cx="${f(196.9 + lx)}" cy="${f(80.1 + ly)}" r="0.9" fill="#FFFFFF"/><circle cx="${f(204.9 + lx)}" cy="${f(80.1 + ly)}" r="0.9" fill="#FFFFFF"/>`;
  else if (e === 'expect') s += `<circle cx="${f(196 + lx)}" cy="${f(81 + ly)}" r="1.8" fill="${INK}"/><circle cx="${f(204 + lx)}" cy="${f(81 + ly)}" r="1.8" fill="${INK}"/>`;
  else s += `<circle cx="${f(196 + lx)}" cy="${f(81 + ly)}" r="1.5" fill="${INK}"/><circle cx="${f(204 + lx)}" cy="${f(81 + ly)}" r="1.5" fill="${INK}"/>`;
  // montura roja (referencia)
  s += `<circle cx="196" cy="81" r="4" fill="none" stroke="${MC.frame}" stroke-width="${w(2)}"/><circle cx="204" cy="81" r="4" fill="none" stroke="${MC.frame}" stroke-width="${w(2)}"/>`;
  s += `<line x1="192" y1="81" x2="179" y2="80" stroke="${MC.frame}" stroke-width="${w(2)}"/>`;
  if (e === 'proud') s += L('M193.6 78.6 Q194.4 77.5 195.6 77.2 M201.6 78.6 Q202.4 77.5 203.6 77.2', 0.9, '#FFFFFF');
  // cejas
  if (e === 'expect') s += L('M192.6 73.2 Q195.6 70.6 198.6 72.6 M201.4 72.6 Q204.4 70.6 207.4 73.2', 1.5);
  else if (e === 'focus') s += L('M193 75.2 L198.4 76.2 M201.6 76.2 L207 75.2', 1.5);
  else if (e === 'proud' || e === 'smile') s += L('M193 74.4 Q195.8 72.6 198.6 74 M201.4 74 Q204.2 72.6 207 74.4', 1.4);
  // mejillas
  s += `<circle cx="200" cy="89" r="3" fill="${C.pink}" opacity="${e === 'proud' ? 0.85 : 0.6}"/>`;
  if (e === 'proud') s += `<circle cx="207.6" cy="87.6" r="2.2" fill="${C.pink}" opacity="0.7"/>`;
  // boca
  if (e === 'expect') s += L('M197.4 90.2 Q200.6 91.8 203.8 90', 2);
  else if (e === 'focus') s += L('M196.6 89.8 Q200.4 90.8 204.2 89.6', 2) +
    `<path d="M201.4 90.3 Q201.8 94 204 93.4 Q205.6 92.6 204.4 89.8Z" fill="${C.pink}" stroke="${INK}" stroke-width="${w(1.3)}" stroke-linejoin="round"/>`;
  else if (e === 'proud') s += `<path d="M195 87.4 Q200.4 97 206 87.2 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.7)}" stroke-linejoin="round"/><path d="M196.2 88 H204.8 L204 89.4 H197Z" fill="#FFFFFF"/>`;
  else if (e === 'smile') s += `<path d="M195.8 87.8 Q200.4 94.6 205.2 87.6 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
  else s += L('M196 89 Q200 93 205 89', 2); // referencia
  return s;
}
// Mari Carmen en coordenadas locales (suelo y=208, mira a la derecha).
// o: expr, look, blink, armF, armB, bob, head, handF(w), handB(w), front(w), noLegs
function maricarmen(o) {
  const k = o.k || 1, w = v => f(v * k);
  const st = (v = 3) => `stroke="${INK}" stroke-width="${w(v)}"`, lj = 'stroke-linejoin="round"';
  let g = '';
  if (!o.noLegs) g += `<rect x="181" y="150" width="9" height="52" rx="4" fill="${C.navy}" ${st()}/>
    <path d="M178 202 h17 a5 5 0 0 1 0 6 h-17z" fill="${MC.shoe}" ${st()} ${lj}/>
    <rect x="192" y="150" width="9" height="52" rx="4" fill="${C.navy}" ${st()}/>
    <path d="M189 202 h17 a5 5 0 0 1 0 6 h-17z" fill="${MC.shoe}" ${st()} ${lj}/>`;
  const armB = o.armB || 0, armF = o.armF || 0;
  let b = '';
  b += `<g transform="rotate(${f(armB)} 176 110)"><rect x="172" y="108" width="7" height="36" rx="3.5" fill="${C.skinS}" ${st()}/><rect x="170" y="104" width="11" height="18" rx="4" fill="${C.cream}" ${st()}/>` +
    (o.handB ? `<g transform="rotate(${f(-armB)} 175.5 143)">${o.handB(w)}</g>` : '') + `</g>`;
  b += `<rect x="172" y="100" width="36" height="54" rx="12" fill="${C.cream}" ${st()}/>
    <path d="M178 104 L202 104 L207 154 L173 154Z" fill="${C.red}"/>
    <path d="M178 104 L184 104 L184 154 L173 154Z" fill="${C.redS}"/>
    <path d="M178 104 L202 104 L207 154 L173 154Z" fill="none" ${st()} ${lj}/>`;
  if (!o.noPocket) b += `<rect x="186" y="130" width="14" height="12" rx="3" fill="${C.red}" ${st(2.5)}/>`;
  if (o.pocketItem) b += o.pocketItem(w);
  b += `<path d="M180 104 Q190 94 200 104" stroke="${INK}" stroke-width="${w(2.5)}" fill="none" stroke-linecap="round"/>`;
  if (o.front0) b += o.front0(w);
  b += `<g transform="rotate(${f(armF)} 204 110)"><rect x="201" y="108" width="7" height="36" rx="3.5" fill="${C.skin}" ${st()}/><rect x="199" y="104" width="11" height="18" rx="4" fill="${C.cream}" ${st()}/>` +
    (o.handF ? `<g transform="rotate(${f(-armF)} 204.5 143)">${o.handF(w)}</g>` : '') + `</g>`;
  let hd = `<circle cx="176" cy="84" r="6" fill="${MC.hair}" ${st()}/>
    <circle cx="190" cy="80" r="15" fill="${C.skin}" ${st()}/>
    <circle cx="177" cy="72" r="6" fill="${MC.hair}" ${st()}/><circle cx="184" cy="65" r="6" fill="${MC.hair}" ${st()}/><circle cx="192" cy="63" r="6" fill="${MC.hair}" ${st()}/><circle cx="200" cy="65" r="6" fill="${MC.hair}" ${st()}/><circle cx="206" cy="72" r="5.5" fill="${MC.hair}" ${st()}/>`;
  hd += mcFace(o, w);
  b += `<g transform="rotate(${f(o.head || 0)} 190 96)">${hd}</g>`;
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  return g;
}
// (px,py) = punto del suelo bajo Mari Carmen (local 190,208); sc = escala; flip = mira a la izquierda
function placeMC(px, py, sc, o) {
  o.k = SW / (3 * sc);
  const sx = o.flip ? -sc : sc;
  return `<g transform="translate(${f(px - 190 * sx)} ${f(py - 208 * sc)}) scale(${f(sx)} ${f(sc)})">${maricarmen(o)}</g>`;
}
const mcPt = (px, py, sc, lx, ly, flip) => [px + (lx - 190) * sc * (flip ? -1 : 1), py + (ly - 208) * sc];
// mano local (pivote, ángulo) -> punto local de la mano
const mcHand = (pv, ang) => { const r = rotV([0.5, 33], ang); return [pv[0] + r[0], pv[1] + r[1]]; };
const MCF = [204, 110], MCB = [176, 110];

/* ---------- objetos en las manos de Mari Carmen (marco local de la mano 204.5,143 / 175.5,143) ---------- */
const mHand = (w, x = 204.5, y = 143, fill = C.skin) => `<circle cx="${x}" cy="${y}" r="4.2" fill="${fill}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
// dedos que golpetean el mostrador (ph = fase)
function tapHand(ph, x = 204.5, y = 143) {
  return w => {
    let g = `<ellipse cx="${x}" cy="${y + 0.6}" rx="5.4" ry="3.6" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
    for (let i = 0; i < 3; i++) {
      const lift = Math.max(0, Math.sin(ph - i * 1.1)) * 2.4;
      g += `<rect x="${f(x + 2.2 + i * 2.3)}" y="${f(y - 0.6 - lift)}" width="2.6" height="${f(4.6)}" rx="1.3" fill="${C.skin}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
    }
    return g;
  };
}
// móvil en la mano (pantalla: 'off' | 'app' | 'ok')
function mcPhoneSmall(w, x, y, rot, screen = 'app') {
  let g = `<g transform="rotate(${f(rot)} ${x} ${y})"><rect x="${f(x - 7.5)}" y="${f(y - 12.5)}" width="15" height="25" rx="3" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/>`;
  if (screen === 'off') g += `<rect x="${f(x - 5.5)}" y="${f(y - 10)}" width="11" height="19.5" rx="1.5" fill="${C.glass}"/>`;
  else {
    g += `<rect x="${f(x - 5.5)}" y="${f(y - 10)}" width="11" height="19.5" rx="1.5" fill="#FFFFFF"/><rect x="${f(x - 5.5)}" y="${f(y - 10)}" width="11" height="4.6" fill="${C.red}"/>`;
    if (screen === 'ok') g += `<circle cx="${x}" cy="${f(y + 1.6)}" r="3.6" fill="${C.green}" stroke="${INK}" stroke-width="${w(0.9)}"/><path d="M${f(x - 1.7)} ${f(y + 1.6)} l1.2 1.3 l2.3 -2.6" stroke="#FFFFFF" stroke-width="${w(1)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    else g += `<rect x="${f(x - 4)}" y="${f(y - 3.6)}" width="8" height="6.4" rx="1" fill="${C.pink}" stroke="${INK}" stroke-width="${w(0.7)}"/><rect x="${f(x - 4)}" y="${f(y + 4.4)}" width="6" height="1.5" rx="0.7" fill="${INK}" opacity="0.5"/>`;
  }
  return g + `</g>`;
}
function phoneHandMC(rot = -10, screen = 'app') { return w => mcPhoneSmall(w, 205.5, 134, rot, screen) + mHand(w); }
// mano haciendo señas para que pase (dedos que se doblan)
function beckonHand(ph) {
  return w => {
    const c = 0.5 + 0.5 * Math.sin(ph);
    let g = mHand(w, 204.5, 143);
    g += `<g transform="rotate(${f(-40 * c)} 204.5 139.5)"><rect x="203" y="131" width="3.2" height="9" rx="1.6" fill="${C.skin}" stroke="${INK}" stroke-width="${w(1.6)}"/></g>`;
    g += `<g transform="rotate(${f(-30 * c)} 206.5 140.5)"><rect x="205.6" y="132.6" width="3" height="8.4" rx="1.5" fill="${C.skin}" stroke="${INK}" stroke-width="${w(1.6)}"/></g>`;
    return g;
  };
}

/* ===================== BOLSOS, PEANAS Y CARTEL «%» ===================== */
// bolso con el centro inferior en (x,y); s = escala (el bolso mide ~100 de ancho); style 0..3 = rosa, azul, amarillo, verde
function bag(x, y, s, style, o = {}) {
  const col = BAGC[style % 4], sw = (o.sw || SW) / s, id = 'bg' + (uid++);
  const lj = 'stroke-linejoin="round"';
  let body, handle, extra = '', shade;
  if (style === 0) { // bolso tipo «tote»
    body = 'M-43 0 Q-48 0 -47 -5 L-39 -62 Q-38 -66 -34 -66 H34 Q38 -66 39 -62 L47 -5 Q48 0 43 0 Z';
    handle = 'M-24 -64 Q-24 -110 0 -110 Q24 -110 24 -64';
    shade = 'M-50 4 L-40 -70 H-28 L-34 4Z';
    extra = `<path d="M-38 -48 H38" stroke="${INK}" stroke-width="${f(sw * 0.7)}"/><rect x="-9" y="-55" width="18" height="15" rx="3" fill="${C.yel}" stroke="${INK}" stroke-width="${f(sw * 0.8)}"/><rect x="-3" y="-51" width="6" height="7" rx="1.5" fill="${C.cream}" stroke="${INK}" stroke-width="${f(sw * 0.5)}"/>`;
  } else if (style === 1) { // cartera con solapa
    body = 'M-48 -8 V-56 Q-48 -64 -40 -64 H40 Q48 -64 48 -56 V-8 Q48 0 40 0 H-40 Q-48 0 -48 -8Z';
    handle = 'M-20 -63 Q-20 -96 0 -96 Q20 -96 20 -63';
    shade = 'M-52 4 V-68 H-36 V4Z';
    extra = `<path d="M-48 -52 V-57 Q-48 -64 -40 -64 H40 Q48 -64 48 -57 V-52 Q48 -26 0 -22 Q-48 -26 -48 -52Z" fill="${col.s}" stroke="${INK}" stroke-width="${f(sw)}" ${lj}/>
      <rect x="-9" y="-30" width="18" height="15" rx="3" fill="${C.yel}" stroke="${INK}" stroke-width="${f(sw * 0.8)}"/><path d="M0 -26 V-19" stroke="${INK}" stroke-width="${f(sw * 0.7)}" stroke-linecap="round"/>`;
  } else if (style === 2) { // bolso redondeado (bolera)
    body = 'M-48 -8 V-28 Q-48 -72 0 -72 Q48 -72 48 -28 V-8 Q48 0 40 0 H-40 Q-48 0 -48 -8Z';
    handle = 'M-22 -68 Q-22 -100 0 -100 Q22 -100 22 -68';
    shade = 'M-52 4 V-60 Q-44 -72 -34 -74 V4Z';
    extra = `<path d="M-40 -42 Q0 -70 40 -42" stroke="${INK}" stroke-width="${f(sw * 0.7)}" fill="none" stroke-dasharray="${f(sw * 1.4)} ${f(sw * 1)}"/>
      <rect x="-12" y="-28" width="24" height="16" rx="4" fill="${C.cream}" stroke="${INK}" stroke-width="${f(sw * 0.8)}"/><circle cx="0" cy="-20" r="3" fill="${C.red}" stroke="${INK}" stroke-width="${f(sw * 0.5)}"/>`;
  } else { // bolso saco con bandolera
    body = 'M-38 0 Q-45 0 -44 -8 L-39 -70 H39 L44 -8 Q45 0 38 0 Z';
    handle = 'M-33 -68 Q-28 -128 0 -128 Q28 -128 33 -68';
    shade = 'M-50 4 L-42 -74 H-28 L-32 4Z';
    extra = `<path d="M-41 -70 H41 V-58 H-41Z" fill="${col.s}" stroke="${INK}" stroke-width="${f(sw)}" ${lj}/>
      <rect x="-8" y="-72" width="16" height="16" rx="3" fill="${C.yel}" stroke="${INK}" stroke-width="${f(sw * 0.8)}"/><rect x="-2.6" y="-67" width="5.2" height="6" rx="1.2" fill="${C.cream}" stroke="${INK}" stroke-width="${f(sw * 0.5)}"/>`;
  }
  let g = `<path d="${handle}" fill="none" stroke="${INK}" stroke-width="${f(sw * 3.4)}" stroke-linecap="round"/><path d="${handle}" fill="none" stroke="${col.c}" stroke-width="${f(sw * 1.3)}" stroke-linecap="round"/>`;
  g += `<clipPath id="${id}"><path d="${body}"/></clipPath><path d="${body}" fill="${col.c}"/><g clip-path="url(#${id})"><path d="${shade}" fill="${col.s}"/></g>`;
  g += `<path d="${body}" fill="none" stroke="${INK}" stroke-width="${f(sw)}" ${lj}/>` + extra;
  g += `<path d="M30 -56 Q36 -40 34 -22" stroke="#FFFFFF" stroke-width="${f(sw * 0.9)}" fill="none" stroke-linecap="round" opacity="0.6"/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(o.rot || 0)}) scale(${f(s)})">${g}</g>`;
}
// peana (centro inferior x,y; ancho, alto)
function plinth(x, y, wd, ht, col = C.cream) {
  const st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  return `<rect x="${f(x - wd / 2)}" y="${f(y - ht)}" width="${f(wd)}" height="${f(ht)}" rx="6" fill="${col}"/>
    <rect x="${f(x + wd * 0.22)}" y="${f(y - ht)}" width="${f(wd * 0.28)}" height="${f(ht)}" fill="${INK}" opacity="0.14"/>
    <rect x="${f(x - wd / 2)}" y="${f(y - ht)}" width="${f(wd)}" height="${f(ht)}" rx="6" fill="none" ${st}/>
    <rect x="${f(x - wd / 2 - 10)}" y="${f(y - ht - 18)}" width="${f(wd + 20)}" height="22" rx="6" fill="${C.wood}" ${st}/>`;
}
// expositor del escaparate: 4 peanas de distinta altura con los 4 bolsos. ks[i] = escala de aparición de cada bolso
const PL_H = [0.16, 0.34, 0.24, 0.42], PL_X = [0.14, 0.38, 0.62, 0.86], BAG_S = [1.0, 0.92, 1.0, 0.86];
function bagDisplay(X, Y, Wd, Hd, ks = [1, 1, 1, 1], t = 0) {
  let s = '';
  const base = Y + Hd - 4, pw = Wd * 0.19;
  for (let i = 0; i < 4; i++) {
    const cx = X + Wd * PL_X[i], ph = Hd * PL_H[i];
    s += plinth(cx, base, pw, ph, i % 2 ? '#FFFFFF' : C.cream);
    const k = ks[i];
    if (k > 0.01) {
      const bs = pw * 0.86 / 100 * BAG_S[i];
      const sway = 2 * Math.sin(t * 2.2 + i * 1.7);
      s += `<g transform="translate(${f(cx)} ${f(base - ph - 18)}) scale(${f(k)}) translate(${f(-cx)} ${f(-(base - ph - 18))})">${bag(cx, base - ph - 18, bs, i, { rot: sway })}</g>`;
    }
  }
  return s;
}
// cartel de descuento: círculo rojo con «%» blanco y un pequeño brillo
function pctSign(x, y, r, k = 1, rot = 0) {
  if (k <= 0.01) return '';
  const g = `<circle cx="${f(r * 0.08)}" cy="${f(r * 0.08)}" r="${f(r)}" fill="${INK}"/>
    <circle r="${f(r)}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>` +
    text('%', 0, r * 0.1, { size: r * 1.42, font: 'G', sw: Math.max(SW * 1.6, r * 0.11), sd: r * 0.05 }) +
    `<path d="M${f(-r * 0.7)} ${f(-r * 0.2)} A${f(r * 0.74)} ${f(r * 0.74)} 0 0 1 ${f(-r * 0.28)} ${f(-r * 0.66)}" stroke="#FFFFFF" stroke-width="${f(Math.max(SW * 0.9, r * 0.07))}" fill="none" stroke-linecap="round"/>
    <circle cx="${f(-r * 0.12)} " cy="${f(-r * 0.76)}" r="${f(r * 0.05)}" fill="#FFFFFF"/>`;
  return at(x, y, k, g, rot);
}

/* ===================== FACHADA «DETALLE» ===================== */
function detGeo(x, base, w, h) {
  const top = base - h, ay = top + 0.2 * h, ah = 0.13 * h, fest = (w * 1.06 / 8) / 2;
  const wy = ay + ah + fest + 0.04 * h;
  const win = { x: x + 0.05 * w, y: wy, w: 0.58 * w, h: base - 0.08 * h - wy };
  const door = { x: x + 0.69 * w, y: wy - 0.01 * h, w: 0.25 * w };
  door.h = base - door.y;
  return { x, base, w, h, top, ay, ah, win, door };
}
// o: ks (bolsos), pct (escala del cartel), bell (giro de la campanilla)
function detalleShop(x, base, w, h, o = {}) {
  const g = detGeo(x, base, w, h), { top, ay, ah, win, door } = g;
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}"`;
  let s = `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="${C.cream}"/>`;
  s += `<rect x="${f(x + w * 0.9)}" y="${f(top + w * 0.02)}" width="${f(w * 0.1)}" height="${f(h + 30)}" fill="${INK}" opacity="0.16"/>`;
  s += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="none" ${st()}/>`;
  // rótulo grande «DETALLE»: letras crema sobre rojo oscuro
  const py = top + h * 0.035, ph = h * 0.135, pw = w * 0.86;
  s += `<rect x="${f(x + (w - pw) / 2 + 9)}" y="${f(py + 9)}" width="${f(pw)}" height="${f(ph)}" rx="${f(ph * 0.25)}" fill="${INK}"/>`;
  s += `<rect x="${f(x + (w - pw) / 2)}" y="${f(py)}" width="${f(pw)}" height="${f(ph)}" rx="${f(ph * 0.25)}" fill="${C.dred}" ${st()}/>`;
  s += text('DETALLE', x + w / 2, py + ph * 0.56, { size: fit('DETALLE', ph * 0.78, pw * 0.84), fill: C.cream, sw: SW * 1.5, sd: 5, ls: 6 });
  s += awning(x + w * 0.04, x + w * 0.96, x - w * 0.03, x + w * 1.03, ay, ah, 8);
  // escaparate con el expositor de bolsos
  s += glassWindow(win.x, win.y, win.w, win.h, (X, Y, Wd, Hd) => bagDisplay(X, Y, Wd, Hd, o.ks, o.t || 0));
  if (o.pct) s += pctSign(win.x + win.w * 0.78, win.y + win.h * 0.2, win.w * 0.14, o.pct, -8);
  s += `<rect x="${f(win.x - w * 0.02)}" y="${f(win.y + win.h)}" width="${f(win.w + w * 0.04)}" height="${f(h * 0.03)}" rx="4" fill="#FFFFFF" ${st()}/>`;
  // puerta con cristal y campanilla
  s += `<rect x="${f(door.x)}" y="${f(door.y)}" width="${f(door.w)}" height="${f(door.h + 10)}" rx="${f(door.w * 0.07)}" fill="${C.navy}" ${st()}/>`;
  s += `<rect x="${f(door.x + door.w * 0.16)}" y="${f(door.y + door.w * 0.16)}" width="${f(door.w * 0.68)}" height="${f(door.h * 0.44)}" rx="${f(door.w * 0.05)}" fill="${C.glass}" ${st(0.8)}/>`;
  s += `<path d="M${f(door.x + door.w * 0.5)} ${f(door.y + door.w * 0.16 + SW)} l${f(door.w * 0.18)} 0 l${f(-door.w * 0.3)} ${f(door.h * 0.44 - 2 * SW)} l${f(-door.w * 0.18)} 0Z" fill="#FFFFFF" opacity="0.5"/>`;
  s += `<circle cx="${f(door.x + door.w * 0.82)}" cy="${f(door.y + door.h * 0.6)}" r="${f(door.w * 0.06)}" fill="${C.yel}" ${st(0.7)}/>`;
  const bx = door.x + door.w * 0.84, by = door.y - 4, br = w * 0.032;
  s += `<path d="M${f(bx - 30)} ${f(by - 14)} H${f(bx)} V${f(by)}" fill="none" ${st(0.9)} stroke-linecap="round"/>`;
  s += `<g transform="translate(${f(bx)} ${f(by)}) rotate(${f(o.bell || 0)})"><circle cx="0" cy="${f(br * 1.55)}" r="${f(br * 0.32)}" fill="${C.dred}" ${st(0.6)}/><path d="M${f(-br)} ${f(br * 1.35)} Q${f(-br)} 0 0 0 Q${f(br)} 0 ${f(br)} ${f(br * 1.35)} Z" fill="${C.yel}" ${st(0.8)} stroke-linejoin="round"/></g>`;
  // maceta junto a la puerta
  const mx = x + w * 0.985, my = base;
  s += `<path d="M${f(mx - 34)} ${f(my - 70)} H${f(mx + 34)} L${f(mx + 26)} ${f(my)} H${f(mx - 26)}Z" fill="${C.red}" ${st()} stroke-linejoin="round"/>`;
  s += `<circle cx="${f(mx - 18)}" cy="${f(my - 96)}" r="24" fill="${C.green}" ${st()}/><circle cx="${f(mx + 16)}" cy="${f(my - 104)}" r="28" fill="${C.green}" ${st()}/><circle cx="${f(mx)}" cy="${f(my - 126)}" r="22" fill="${C.green}" ${st()}/>`;
  s += `<path d="M${f(mx - 34)} ${f(my - 70)} H${f(mx + 34)} V${f(my - 58)} H${f(mx - 34)}Z" fill="${C.dred}" ${st()}/>`;
  return s;
}

/* ===================== MANO QUE PEGA EL CARTEL ===================== */
// (x,y) = centro del cartel; la mano entra por la derecha y lo sujeta por su borde derecho
function stickHand(x, y, r) {
  const st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  const hx = x + r * 0.97;
  let s = '';
  // manga crema con puño
  s += `<path d="M${f(hx + 150)} ${f(y - 88)} H${f(hx + 1400)} V${f(y + 112)} H${f(hx + 150)} Z" fill="${INK}" transform="translate(0 14)"/>`;
  s += `<path d="M${f(hx + 150)} ${f(y - 88)} H${f(hx + 1400)} V${f(y + 112)} H${f(hx + 150)} Z" fill="${C.cream}" ${st}/>`;
  s += `<path d="M${f(hx + 150)} ${f(y - 88)} H${f(hx + 1400)} V${f(y - 48)} H${f(hx + 150)} Z" fill="#E2D6D3"/>`;
  s += `<path d="M${f(hx + 150)} ${f(y - 88)} H${f(hx + 1400)} V${f(y + 112)} H${f(hx + 150)} Z" fill="none" ${st}/>`;
  s += `<rect x="${f(hx + 130)}" y="${f(y - 98)}" width="54" height="220" rx="18" fill="${C.cream}" ${st}/>`;
  // palma
  s += `<path d="M${f(hx + 140)} ${f(y - 74)} Q${f(hx + 40)} ${f(y - 92)} ${f(hx + 10)} ${f(y - 54)} L${f(hx + 6)} ${f(y + 60)} Q${f(hx + 40)} ${f(y + 104)} ${f(hx + 140)} ${f(y + 88)} Z" fill="${C.skin}" ${st}/>`;
  // dedos apoyados sobre el borde del cartel
  [[-62, 16], [-22, 24], [18, 22], [56, 14]].forEach(([dy, len]) => {
    s += `<rect x="${f(hx - len)}" y="${f(y + dy - 15)}" width="${f(len + 40)}" height="30" rx="15" fill="${C.skin}" ${st}/>`;
  });
  // pulgar por delante
  s += `<path d="M${f(hx + 70)} ${f(y + 80)} Q${f(hx + 10)} ${f(y + 120)} ${f(hx - 26)} ${f(y + 96)} Q${f(hx - 40)} ${f(y + 80)} ${f(hx - 18)} ${f(y + 70)} Q${f(hx + 20)} ${f(y + 64)} ${f(hx + 60)} ${f(y + 50)}Z" fill="${C.skin}" ${st}/>`;
  s += `<path d="M${f(hx + 60)} ${f(y - 40)} Q${f(hx + 74)} ${f(y)} ${f(hx + 62)} ${f(y + 30)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linecap="round"/>`;
  return s;
}
// destello amarillo de estrella (pegado, publicación)
function flashBurst(x, y, r, k, rot = 0) {
  if (k <= 0.01) return '';
  const d = starPath(r, r * 0.62, 12);
  return at(x, y, k, `<path d="${d}" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/><path d="${starPath(r * 0.6, r * 0.4, 12)}" fill="#FFFFFF"/>`, rot);
}

/* ===================== INTERIOR DE «DETALLE» ===================== */
// pañuelo colgado del estante (x = centro, y = borde del estante)
function scarf(x, y, wd, ht, col, stripe) {
  const st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  let s = `<path d="M${f(x - wd / 2)} ${f(y)} H${f(x + wd / 2)} L${f(x + wd * 0.44)} ${f(y + ht)} H${f(x - wd * 0.44)}Z" fill="${col}" ${st}/>`;
  s += `<rect x="${f(x - wd * 0.46)}" y="${f(y + ht * 0.55)}" width="${f(wd * 0.92)}" height="${f(ht * 0.12)}" fill="${stripe}"/>`;
  s += `<rect x="${f(x - wd * 0.46)}" y="${f(y + ht * 0.75)}" width="${f(wd * 0.92)}" height="${f(ht * 0.07)}" fill="${stripe}"/>`;
  s += `<path d="M${f(x - wd / 2)} ${f(y)} H${f(x + wd / 2)} L${f(x + wd * 0.44)} ${f(y + ht)} H${f(x - wd * 0.44)}Z" fill="none" ${st}/>`;
  for (let i = 0; i < 5; i++) s += `<line x1="${f(x - wd * 0.36 + i * wd * 0.18)}" y1="${f(y + ht)}" x2="${f(x - wd * 0.36 + i * wd * 0.18)}" y2="${f(y + ht + 16)}" stroke="${INK}" stroke-width="${f(SW * 0.7)}" stroke-linecap="round"/>`;
  return s;
}
// collar sobre un busto
function necklace(x, base, sc, bead) {
  const st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  let s = `<path d="M${f(x - 50 * sc)} ${f(base)} Q${f(x - 50 * sc)} ${f(base - 60 * sc)} ${f(x - 22 * sc)} ${f(base - 70 * sc)} V${f(base - 110 * sc)} H${f(x + 22 * sc)} V${f(base - 70 * sc)} Q${f(x + 50 * sc)} ${f(base - 60 * sc)} ${f(x + 50 * sc)} ${f(base)}Z" fill="${C.navy}" ${st}/>`;
  s += `<ellipse cx="${f(x)}" cy="${f(base - 110 * sc)}" rx="${f(22 * sc)}" ry="${f(7 * sc)}" fill="#22394F" ${st}/>`;
  for (let i = 0; i <= 8; i++) {
    const a = PI * (0.12 + 0.76 * i / 8);
    s += `<circle cx="${f(x + Math.cos(a) * 30 * sc)}" cy="${f(base - 74 * sc + Math.sin(a) * 30 * sc)}" r="${f(6 * sc)}" fill="${bead}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
  }
  return s;
}
function woodShelf(x0, x1, y) {
  return `<rect x="${f(x0 + 8)}" y="${f(y + 8)}" width="${f(x1 - x0)}" height="24" rx="6" fill="${INK}"/><rect x="${f(x0)}" y="${f(y)}" width="${f(x1 - x0)}" height="24" rx="6" fill="${C.wood}" stroke="${INK}" stroke-width="${f(SW)}"/>
    <path d="M${f(x0 + 40)} ${f(y + 24)} l20 34 M${f(x1 - 40)} ${f(y + 24)} l-20 34" stroke="${INK}" stroke-width="${f(SW * 1.2)}" stroke-linecap="round"/>`;
}
// pared con trama de puntos (círculos #F2B5AD, r 1,4 en cuadrícula de 10 px de la escena base de 380 px)
function dotWall() {
  const id = 'dots' + (uid++), cell = 10 * W / 380;
  return `<defs><pattern id="${id}" width="${f(cell)}" height="${f(cell)}" patternUnits="userSpaceOnUse"><circle cx="${f(cell / 2)}" cy="${f(cell / 2)}" r="${f(1.4 * W / 380)}" fill="${DOT}"/></pattern></defs>
    <rect width="${W}" height="${H}" fill="${C.cream}"/><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
}
const DI = { door: { x: 46, y: 820, w: 238, h: 660 }, floor: 1470, counter: 1080, clock: [170, 560, 92] };
// puerta interior con campanilla. open 0..1; inside(x,y,w,h) dibuja lo que entra por la puerta
function interiorDoor(o = {}) {
  const { x, y, w, h } = DI.door, st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = `<rect x="${x - 16}" y="${y - 16}" width="${w + 32}" height="${h + 16}" rx="12" fill="${C.wood}" ${st()}/>`;
  const open = clamp(o.open || 0);
  // hueco: la calle (cielo, fachadas, acera)
  const id = 'dh' + (uid++);
  s += `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.sky}"/><rect x="${x}" y="${y + 200}" width="${w}" height="${h}" fill="${C.skyHz}"/>`;
  s += `<rect x="${x - 30}" y="${y + 230}" width="${w * 0.7}" height="300" fill="${C.pink}" ${st()}/><rect x="${x + w * 0.55}" y="${y + 260}" width="${w * 0.8}" height="300" fill="${C.cream}" ${st()}/>`;
  s += `<rect x="${x}" y="${y + 520}" width="${w}" height="${h}" fill="${C.ground}"/><line x1="${x}" y1="${y + 520}" x2="${x + w}" y2="${y + 520}" ${st()}/>`;
  if (o.inside) s += o.inside(x, y, w, h);
  s += `</g>`;
  // hoja de la puerta (bisagra a la izquierda)
  const lw = w * (1 - 0.84 * open);
  s += `<path d="M${x} ${y} L${f(x + lw)} ${f(y - 22 * open)} L${f(x + lw)} ${f(y + h + 22 * open)} L${x} ${y + h}Z" fill="${C.navy}" ${st()}/>`;
  if (open < 0.6) {
    const gx = x + lw * 0.13, gw = lw * 0.74;
    s += `<path d="M${f(gx)} ${f(y + 30 - 4 * open)} L${f(gx + gw)} ${f(y + 30 - 18 * open)} L${f(gx + gw)} ${f(y + 300 + 4 * open)} L${f(gx)} ${f(y + 300)}Z" fill="${C.glass}" ${st(0.8)}/>`;
    s += `<path d="M${f(gx + gw * 0.55)} ${f(y + 40)} l${f(gw * 0.2)} 0 l${f(-gw * 0.5)} 250 l${f(-gw * 0.2)} 0Z" fill="#FFFFFF" opacity="0.5"/>`;
  }
  s += `<circle cx="${f(x + lw - 36 * (1 - open))}" cy="${y + 360}" r="11" fill="${C.yel}" ${st(0.7)}/>`;
  const bx = x + w - 30, by = y - 16;
  s += `<path d="M${bx} ${by - 30} V${by}" ${st(0.8)}/>`;
  s += `<g transform="translate(${bx} ${by}) rotate(${f(o.bell || 0)})"><circle cx="0" cy="48" r="9" fill="${C.dred}" ${st(0.6)}/><path d="M-30 42 Q-30 0 0 0 Q30 0 30 42 Z" fill="${C.yel}" ${st(0.8)}/></g>`;
  return s;
}
// fondo del interior: pared con puntos, suelo, puerta, reloj, estantes con bolsos, pañuelos y collares, lámpara
function detalleBack(T, o = {}) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}"`;
  let s = dotWall();
  s += `<rect x="-20" y="${DI.floor}" width="${W + 40}" height="${H - DI.floor + 20}" fill="${C.wood}"/>`;
  for (let i = 0; i < 7; i++) s += `<line x1="${-40 + i * 200}" y1="${DI.floor}" x2="${-180 + i * 200}" y2="${H}" ${st(0.5)}/>`;
  s += `<line x1="-20" y1="${DI.floor}" x2="${W + 20}" y2="${DI.floor}" ${st()}/>`;
  s += interiorDoor(o);
  // reloj de pared
  const [cx, cy, cr] = DI.clock;
  s += at(cx, cy, o.clockK || 1, clockFace(cr, o.tm === undefined ? 600 : o.tm), o.clockWob || 0);
  // estantes: bolsos arriba, pañuelos y collares abajo
  s += woodShelf(730, 1080, 640);
  [[785, 0, 0.82], [880, 2, 0.72], [968, 1, 0.74], [1042, 3, 0.58]].forEach(([x, st_, sc]) => { s += bag(x, 640, sc, st_); });
  s += woodShelf(730, 1080, 870);
  s += scarf(790, 894, 84, 140, C.pink, C.cream) + scarf(880, 894, 72, 120, C.navy, C.yel);
  s += necklace(975, 870, 0.85, C.yel) + necklace(1045, 870, 0.62, C.red);
  // lámpara colgante
  s += lamp(905, 440, 1.2 * Math.sin(T * 1.6));
  return s;
}
// mostrador de madera con un cartel «%» pequeño en el frente
function shopCounter(top = DI.counter, x0 = 380) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = `<rect x="${x0 + 10}" y="${top + 28}" width="${W - x0 + 40}" height="${H - top}" fill="${INK}"/>`;
  s += `<rect x="${x0}" y="${top + 20}" width="${W - x0 + 40}" height="${H - top}" fill="${C.wood}" ${st()}/>`;
  for (let x = x0 + 80; x < W; x += 150) s += `<rect x="${x}" y="${top + 22}" width="44" height="${H - top}" fill="${C.woodS}" opacity="0.5"/>`;
  s += `<rect x="${x0 + 40}" y="${top + 70}" width="${W - x0}" height="${f(DI.floor - top - 110)}" rx="14" fill="none" ${st(0.7)}/>`;
  s += `<rect x="${x0 - 20}" y="${top - 6}" width="${W - x0 + 60}" height="34" rx="10" fill="#C98A4B" ${st()}/>`;
  s += `<path d="M${x0 + 10} ${top + 4} H${x0 + 300}" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" opacity="0.45" stroke-linecap="round"/>`;
  s += pctSign(x0 + 150, top + 175, 62, 1, -6);
  return s;
}

/* ===================== TARJETA DE OFERTA (móvil) ===================== */
function pill(cx, cy, wd, ht, fill, label, o = {}) {
  const st = `stroke="${INK}" stroke-width="${f(SW * (o.swk || 1))}"`;
  let g = `<rect x="${f(cx - wd / 2 + 6)}" y="${f(cy - ht / 2 + 6)}" width="${f(wd)}" height="${f(ht)}" rx="${f(ht / 2)}" fill="${INK}"/>`;
  g += `<rect x="${f(cx - wd / 2)}" y="${f(cy - ht / 2)}" width="${f(wd)}" height="${f(ht)}" rx="${f(ht / 2)}" fill="${fill}" ${st}/>`;
  if (label) g += text(label, cx + (o.dx || 0), cy + 2, { size: fit(label, o.size || ht * 0.56, wd - (o.pad || 30)), fill: o.col || '#FFFFFF', sw: o.tsw || SW * 1.2, sd: 3, stroke: o.col === INK ? null : INK, shadow: o.col !== INK });
  return g;
}
const iconPhone = (x, y, r) => `<path d="M${f(x - r * 0.62)} ${f(y - r * 0.72)} Q${f(x - r * 0.95)} ${f(y - r * 0.1)} ${f(x - r * 0.2)} ${f(y + r * 0.6)} Q${f(x + r * 0.4)} ${f(y + r * 1.0)} ${f(x + r * 0.78)} ${f(y + r * 0.6)} L${f(x + r * 0.4)} ${f(y + r * 0.2)} L${f(x + r * 0.12)} ${f(y + r * 0.4)} Q${f(x - r * 0.4)} ${f(y)} ${f(x - r * 0.3)} ${f(y - r * 0.32)} L${f(x - r * 0.1)} ${f(y - r * 0.56)}Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linejoin="round"/>`;
const iconChat = (x, y, r) => `<path d="M${f(x - r * 0.8)} ${f(y - r * 0.6)} H${f(x + r * 0.8)} Q${f(x + r)} ${f(y - r * 0.6)} ${f(x + r)} ${f(y - r * 0.4)} V${f(y + r * 0.3)} Q${f(x + r)} ${f(y + r * 0.5)} ${f(x + r * 0.8)} ${f(y + r * 0.5)} H${f(x - r * 0.2)} L${f(x - r * 0.6)} ${f(y + r * 0.9)} V${f(y + r * 0.5)} Q${f(x - r)} ${f(y + r * 0.5)} ${f(x - r)} ${f(y + r * 0.3)} V${f(y - r * 0.4)} Q${f(x - r)} ${f(y - r * 0.6)} ${f(x - r * 0.8)} ${f(y - r * 0.6)}Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linejoin="round"/>
  <circle cx="${f(x - r * 0.4)}" cy="${f(y - r * 0.05)}" r="${f(r * 0.1)}" fill="${INK}"/><circle cx="${x}" cy="${f(y - r * 0.05)}" r="${f(r * 0.1)}" fill="${INK}"/><circle cx="${f(x + r * 0.4)}" cy="${f(y - r * 0.05)}" r="${f(r * 0.1)}" fill="${INK}"/>`;
// tarjeta completa (x,y = esquina; wd x ht ≈ 636 x 640). o: kSeal, kBtn
function offerCard(x, y, wd, ht, o = {}, t = 0) {
  let g = panel(x, y, wd, ht, 34, '#FFFFFF', 12);
  const ih = ht * 0.44;
  g += `<rect x="${f(x + 20)}" y="${f(y + 20)}" width="${f(wd - 40)}" height="${f(ih)}" rx="24" fill="#FDE3EC" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  // rayitas de brillo detrás del bolso
  g += `<circle cx="${f(x + wd / 2)}" cy="${f(y + 20 + ih * 0.55)}" r="${f(ih * 0.36)}" fill="#FFFFFF" opacity="0.8"/>`;
  g += bag(x + wd / 2, y + 20 + ih - 24, (ih - 56) / 112, 0, { rot: 3 * Math.sin(t * 2.4) });
  g += sealPct(x + wd - 100, y + 92, 64, o.kSeal === undefined ? 1 : o.kSeal);
  const ty = y + 20 + ih + 70;
  g += text('DETALLE', x + 34, ty, { size: 82, font: 'G', anchor: 'start', fill: C.red, sw: SW * 1.5, sd: 4, ls: 2 });
  g += pill(x + wd - 128, ty - 2, 190, 74, C.red, 'Oferta', { size: 46 });
  g += text('Bolsos con descuento', x + 34, ty + 88, { size: fit('Bolsos con descuento', 54, wd - 68), anchor: 'start', fill: INK, stroke: null });
  const by = ty + 196, kb = o.kBtn === undefined ? 1 : o.kBtn;
  const bw = (wd - 90) / 2;
  if (kb > 0.01) {
    g += at(x + 30 + bw / 2, by, kb, pill(0, 0, bw, 92, C.navy, 'Llamar', { size: 46, dx: 26 }) + iconPhone(-bw / 2 + 52, 0, 26));
    g += at(x + wd - 30 - bw / 2, by, kb, pill(0, 0, bw, 92, C.green, 'WhatsApp', { size: 44, dx: 28, pad: 100 }) + iconChat(-bw / 2 + 50, 0, 26));
  }
  return g;
}
// tarjeta compacta de la notificación (centrada en 0,0; 860 x 330)
function offerMiniLocal(t = 0) {
  const Wd = 860, Hd = 330, x0 = -Wd / 2, y0 = -Hd / 2, hh = 104, id = 'om' + (uid++);
  let g = panel(x0, y0, Wd, Hd, 40, '#FFFFFF', 14);
  g += `<clipPath id="${id}"><rect x="${x0}" y="${y0}" width="${Wd}" height="${Hd}" rx="40"/></clipPath>`;
  g += `<g clip-path="url(#${id})"><rect x="${x0}" y="${y0}" width="${Wd}" height="${hh}" fill="${C.red}"/></g>`;
  g += `<line x1="${x0}" y1="${y0 + hh}" x2="${x0 + Wd}" y2="${y0 + hh}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  g += `<rect x="${x0}" y="${y0}" width="${Wd}" height="${Hd}" rx="40" fill="none" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  const ir = hh * 0.36, icx = x0 + 28 + ir, icy = y0 + hh / 2;
  g += `<rect x="${f(icx - ir)}" y="${f(icy - ir)}" width="${f(ir * 2)}" height="${f(ir * 2)}" rx="${f(ir * 0.42)}" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>` + logoIcon(icx, icy + ir * 0.05, ir * 1.85);
  g += text('Escaparate de Tudela', icx + ir + 22, icy + 2, { size: 46, anchor: 'start', sw: SW * 1.4, sd: 4 });
  const bx = x0 + 28, by = y0 + hh + 22, bh = Hd - hh - 44;
  g += `<rect x="${bx}" y="${by}" width="210" height="${bh}" rx="22" fill="#FDE3EC" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  g += bag(bx + 105, by + bh - 16, 1.45, 0, { rot: 3 * Math.sin(t * 2.6) });
  const tx = bx + 240;
  g += text('DETALLE', tx, by + 48, { size: 74, font: 'G', anchor: 'start', fill: C.red, sw: SW * 1.4, sd: 4, ls: 2 });
  g += pill(tx + 380, by + 46, 170, 64, C.red, 'Oferta', { size: 40 });
  g += text('Bolsos con descuento', tx, by + 140, { size: fit('Bolsos con descuento', 52, Wd - (tx - x0) - 40), anchor: 'start', fill: INK, stroke: null });
  g += sealPct(x0 + Wd - 40, y0 + 10, 60, 1);
  return g;
}

/* ===================== MÓVILES DE LA GENTE (pantalla con el bolso rosa) ===================== */
function bagPhoneHand(hx, hy, o = {}) {
  return w => {
    const rot = o.rot === undefined ? -12 : o.rot, sh = o.shake || 0, ps = o.ps || 1;
    let g = `<g transform="translate(${f(hx + 3 + sh)} ${f(hy - 13 * ps)}) rotate(${f(rot)}) scale(${f(ps)})">`;
    g += `<rect x="-10.5" y="-18" width="21" height="36" rx="3.6" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/>`;
    if (o.lit) {
      g += `<rect x="-8.3" y="-15.4" width="16.6" height="31" rx="2" fill="${C.cream}"/>`;
      g += `<rect x="-8.3" y="-15.4" width="16.6" height="6" fill="${C.red}"/><circle cx="-4.6" cy="-12.4" r="1.9" fill="#FFFFFF"/>`;
      g += `<rect x="-6.8" y="-6.4" width="13.6" height="17" rx="1.6" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(0.9)}"/>`;
      g += `<rect x="-5.4" y="-5" width="10.8" height="8" rx="1" fill="#FDE3EC" stroke="${INK}" stroke-width="${w(0.6)}"/>`;
      g += `<path d="M-3.2 2 L-2.4 -2.4 H2.4 L3.2 2Z" fill="${C.pink}" stroke="${INK}" stroke-width="${w(0.6)}" stroke-linejoin="round"/><path d="M-1.4 -2.4 Q0 -4.6 1.4 -2.4" fill="none" stroke="${INK}" stroke-width="${w(0.7)}"/>`;
      g += `<circle cx="4" cy="-3.6" r="2.1" fill="${C.red}" stroke="${INK}" stroke-width="${w(0.5)}"/>`;
      g += `<rect x="-5.4" y="5" width="10.8" height="1.8" rx="0.9" fill="${INK}" opacity="0.6"/><rect x="-5.4" y="8" width="7" height="1.6" rx="0.8" fill="${INK}" opacity="0.6"/>`;
    } else g += `<rect x="-8.3" y="-15.4" width="16.6" height="31" rx="2" fill="${C.glass}"/>`;
    g += `</g>`;
    g += `<circle cx="${hx}" cy="${hy}" r="4.3" fill="${o.skin || C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
    return g;
  };
}
// persona de la calle (folk i) con el móvil; devuelve {svg, phone, head}
function streetPerson(i, x, foot, sc, o) {
  const p = FOLK[i], s = sc * (p.scale || 1), armF = o.armF || 0;
  const svg = placeFolk(i, x, foot, sc, Object.assign({}, o, { handF: bagPhoneHand(202.5, 139.5, Object.assign({}, o, { skin: p.skin })) }));
  const a = armF * PI / 180, hx = 202 - 31.5 * Math.sin(a), hy = 108 + 31.5 * Math.cos(a);
  return { svg: shadowEll(x, foot, 26 * s) + svg, phone: toWorld(x, foot, 190, 204, s, hx + 3, hy - 13, o.flip), head: toWorld(x, foot, 190, 204, s, 192, 60, o.flip) };
}

/* ===================== CLIENTA Y «¡CHA-CHING!» ===================== */
const F_CLIENTA = FOLK.push({ id: 'clienta', skin: '#F6C9A0', skinS: '#E9B88F', hair: 'long', hairC: '#3B2A24', top: 'coat', topC: '#3F7CC4', topS: '#2B5A99', pants: '#2D4A6B', shoe: '#FFFFFF', scale: 0.98 }) - 1;
function waveHand(ph) {
  return w => `<g transform="rotate(${f(18 * Math.sin(ph))} 202.5 142)"><rect x="199.6" y="129" width="5.6" height="11" rx="2.8" fill="${C.skin}" stroke="${INK}" stroke-width="${w(1.8)}"/><circle cx="202.5" cy="140" r="4.6" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/></g>`;
}
function chaChing(x, y, k, t) {
  if (k <= 0.01) return '';
  let g = '';
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * 2 * PI + 0.2, r1 = 175, r2 = 225 + 18 * (i % 2);
    g += `<line x1="${f(Math.cos(a) * r1)}" y1="${f(Math.sin(a) * r1 * 0.7)}" x2="${f(Math.cos(a) * r2)}" y2="${f(Math.sin(a) * r2 * 0.7)}" stroke="${INK}" stroke-width="${f(SW * 1.3)}" stroke-linecap="round"/>`;
  }
  const d = starPath(170, 118, 14);
  g += `<g transform="scale(1 0.66)"><path d="${d}" transform="translate(9 12)" fill="${INK}"/><path d="${d}" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW * 1.4)}" stroke-linejoin="round"/></g>`;
  g += text('¡CHA-CHING!', 0, 4, { size: 78, font: 'G', fill: '#FFFFFF', sw: SW * 1.8, sd: 5, ls: 1 });
  return at(x, y, k, g, -6 + 3 * Math.sin(t * 18));
}

/* ===================== WEB DE ESCAPARATE (carrusel) ===================== */
const WEBC = [
  { label: 'OFERTA', shop: 'DETALLE', l1: 'Bolsos con', l2: 'descuento', icon: 'bag', bg: '#FDE3EC', col: C.red },
  { label: 'NOVEDAD', shop: 'PANADERÍA', l1: 'Pastel', l2: 'nuevo', icon: 'cupcake', bg: '#FFF1C9', col: C.navy },
  { label: 'OFERTA', shop: 'ZAPATERÍA', l1: 'Zapatos', l2: 'en oferta', icon: 'shoe', bg: C.glass, col: C.red },
  { label: 'NOVEDAD', shop: 'FLORISTERÍA', l1: 'Flores de', l2: 'temporada', icon: 'bouquet', bg: '#DDF0E3', col: C.navy }
];
// tarjeta vertical del carrusel (centrada en cx; y = arriba; 290 x 400)
function webCard(cx, y, c, t = 0) {
  const wd = 290, ht = 400, x = cx - wd / 2;
  let g = panel(x, y, wd, ht, 26, '#FFFFFF', 9);
  g += `<rect x="${x + 14}" y="${y + 14}" width="${wd - 28}" height="190" rx="18" fill="${c.bg}" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
  if (c.icon === 'bag') g += bag(cx, y + 190, 1.3, 0, { rot: 2 * Math.sin(t * 2.4) });
  else g += unitBox(x + 40, y + 20, wd - 80, 180, ICONS[c.icon], 0.95);
  g += c.label === 'OFERTA' ? sealPct(x + wd - 40, y + 40, 34, 1) : yelStar(x + wd - 40, y + 40, 34);
  g += pill(x + 22 + 80, y + 240, 160, 54, c.col, c.label, { size: 32, tsw: SW, swk: 0.8 });
  g += text(c.shop, x + 22, y + 296, { size: fit(c.shop, 40, wd - 44, 'G'), font: 'G', anchor: 'start', fill: C.red, sw: SW * 1.1, sd: 3, ls: 1 });
  g += text(c.l1, x + 22, y + 340, { size: fit(c.l1, 36, wd - 44), anchor: 'start', fill: INK, stroke: null });
  g += text(c.l2, x + 22, y + 376, { size: fit(c.l2, 36, wd - 44), anchor: 'start', fill: INK, stroke: null });
  return g;
}
