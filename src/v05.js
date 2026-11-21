/* Vídeo 05 — «Pedro y el plan de viernes». Piezas nuevas sobre lib.js + series.js + rosa.js + v04.js:
   Pedro (referencia SVG exacta, suelo en y=214), cielo de atardecer de dos bandas con nubes de sombra rosa,
   sol naranja, edificio de oficinas, notificación de la oferta flash con sello de rayo, nube de pensamiento,
   fachada del bar «LA TORTILLA», interior del bar, globos de diálogo y destello «¡CHIN!». */
'use strict';

const P5 = {
  green: '#3C9D5D', greenS: '#2A7344', pants: '#222222', hair: '#3B2A24', skin: '#F6C9A0', skinS: '#E9B88F',
  wood: '#A9743F', woodS: '#7E5328', tort: '#F2C12E', tortS: '#C99A1E', orange: '#F29B4B', peach: '#FFD2A8',
  warmCream: '#FFE8C8', cloudSh: '#F7B5A8', gray: '#B9B0AD'
};
const rotV = (v, deg) => { const a = deg * PI / 180; return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)]; };

/* ===================== PEDRO ===================== */
const PF = [206, 108], PB = [174, 108];               // pivotes de los hombros
const handLocal = (pv, ang, dy = 0) => { const r = rotV([0.5, 38], ang); return [pv[0] + r[0], pv[1] + r[1] + dy]; };

function pedroFace(o, w) {
  const e = o.expr || 'normal', sm = clamp(o.smile || 0);
  const L = (d, sw = 1.7, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  let s = '';
  // cristales (relleno) y patilla
  s += `<circle cx="196" cy="80" r="4" fill="#FFFFFF" fill-opacity="0.5"/><circle cx="204" cy="80" r="4" fill="#FFFFFF" fill-opacity="0.5"/>`;
  // ojos
  const pup = (r = 1.5, dy = 0) => `<circle cx="${f(196 + lx)}" cy="${f(80 + ly + dy)}" r="${r}" fill="${INK}"/><circle cx="${f(204 + lx)}" cy="${f(80 + ly + dy)}" r="${r}" fill="${INK}"/>`;
  if (o.blink && e !== 'laugh') s += L('M193.2 80.3 H198.8 M201.2 80.3 H206.8', 1.6);
  else if (e === 'tired') {
    s += pup(1.4, 1);
    s += `<path d="M192.1 80.6 A3.9 3.9 0 0 1 199.9 80.6 Z M200.1 80.6 A3.9 3.9 0 0 1 207.9 80.6 Z" fill="${P5.skin}"/>` + L('M192.4 80.6 H199.6 M200.4 80.6 H207.6', 1.4);
  } else if (e === 'grin' || e === 'talk' || e === 'sparkle') {
    s += `<circle cx="${f(196 + lx)}" cy="${f(80 + ly)}" r="2.2" fill="${INK}"/><circle cx="${f(204 + lx)}" cy="${f(80 + ly)}" r="2.2" fill="${INK}"/>
      <circle cx="${f(196.8 + lx)}" cy="${f(79.1 + ly)}" r="0.85" fill="#FFFFFF"/><circle cx="${f(204.8 + lx)}" cy="${f(79.1 + ly)}" r="0.85" fill="#FFFFFF"/>`;
  } else if (e === 'laugh') {
    s += L('M193.6 81.2 Q196 78 198.4 81.2 M201.6 81.2 Q204 78 206.4 81.2', 1.6);
  } else s += pup(1.5);
  // montura (encima)
  s += `<circle cx="196" cy="80" r="4" fill="none" stroke="${INK}" stroke-width="${w(1.8)}"/><circle cx="204" cy="80" r="4" fill="none" stroke="${INK}" stroke-width="${w(1.8)}"/>`;
  s += `<line x1="192" y1="80" x2="178" y2="79" stroke="${INK}" stroke-width="${w(1.8)}"/>`;
  if (e === 'grin' || e === 'sparkle' || e === 'laugh' || e === 'talk') s += L('M193.4 77.9 Q194.3 76.7 195.7 76.4 M201.4 77.9 Q202.3 76.7 203.7 76.4', 1, '#FFFFFF');
  // cejas
  if (e === 'tired') s += L('M193 74.6 L198.4 73.4 M201.6 73.4 L206.8 74.6', 1.6);
  else if (e === 'surprise') s += L('M193 71.6 Q195.8 69.4 198.6 71.2 M201.4 71.2 Q204.2 69.4 207 71.6', 1.6);
  else if (e === 'grin' || e === 'laugh' || e === 'talk' || e === 'sparkle') s += L('M193 72.2 Q195.8 70.2 198.6 72 M201.4 72 Q204.2 70.2 207 72.2', 1.6);
  else if (sm > 0.05) { const up = sm * 1.4; s += L(`M193.2 ${f(74 - up)} Q195.8 ${f(72.6 - up)} 198.4 ${f(73.8 - up)} M201.6 ${f(73.8 - up)} Q204.2 ${f(72.6 - up)} 206.8 ${f(74 - up)}`, 1.5); }
  // mejillas
  if (e !== 'normal' && e !== 'tired' && e !== 'surprise' || sm > 0.4) s += `<circle cx="193.4" cy="87.2" r="2.6" fill="${C.pink}" opacity="${f(e === 'normal' ? 0.5 * sm : 0.55)}"/>`;
  // boca
  if (e === 'tired') s += L('M197 90.2 Q200 88.4 203 90.2', 2);
  else if (e === 'grin') s += `<path d="M195.8 86.6 Q200.2 95.4 204.8 86.4 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.7)}" stroke-linejoin="round"/><path d="M196.8 87.2 H203.9 L203.3 88.5 H197.4Z" fill="#FFFFFF"/>`;
  else if (e === 'laugh') s += `<path d="M195.2 85.8 Q200.2 97.6 205.4 85.6 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.7)}" stroke-linejoin="round"/><path d="M197.6 92.4 Q200.4 90.4 203 92.2 Q200.6 94.6 197.6 92.4Z" fill="${C.pink}"/>`;
  else if (e === 'talk') { const op = clamp(o.talk || 0); s += `<path d="M196 87 Q200.2 ${f(88.4 + op * 5)} 204.6 86.8 Q200.2 ${f(88.8 - op * 0.4)} 196 87Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.7)}" stroke-linejoin="round"/>`; }
  else if (e === 'surprise') s += `<ellipse cx="200.4" cy="89.4" rx="2" ry="2.6" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}"/>`;
  else if (sm > 0.02) s += L(`M${f(196.8 - sm * 0.8)} ${f(89 - sm * 1.4)} Q200.2 ${f(89 + sm * 3.6)} ${f(203.4 + sm * 0.8)} ${f(89 - sm * 1.8)}`, 2);
  else s += L('M197 89 L203 89', 2); // referencia
  return s;
}
// Pedro en coordenadas locales (suelo y=214, mira a la derecha).
// o: legF, legB, armF, armB, bob, head, slump(0..1), lean, expr, smile, talk, blink, look, itemF(w,x,y), itemB(w,x,y)
function pedro(o) {
  const k = o.k || 1, w = v => f(v * k);
  const st = (v = 3) => `stroke="${INK}" stroke-width="${w(v)}"`, lj = 'stroke-linejoin="round"';
  const leg = (ang, shoe) => `<g transform="rotate(${f(ang)} 190 150)"><rect x="185" y="148" width="8" height="58" rx="4" fill="${P5.pants}" ${st()}/><path d="M182 206 h17 a5 5 0 0 1 0 8 h-17z" fill="${shoe}" ${st()} ${lj}/></g>`;
  let g = leg(o.legB || 0, '#E8E8E8') + leg(o.legF || 0, '#FFFFFF');
  const sl = o.slump || 0, dy = sl * 2.6, armB = (o.armB || 0) - sl * 3, armF = (o.armF || 0) + sl * 3;
  let b = '';
  b += `<g transform="translate(0 ${f(dy)}) rotate(${f(armB)} 174 108)"><rect x="170" y="106" width="7" height="40" rx="3.5" fill="${P5.skinS}" ${st()}/><rect x="168" y="102" width="11" height="14" rx="4" fill="${P5.greenS}" ${st()}/></g>`;
  b += `<rect x="174" y="98" width="32" height="56" rx="10" fill="${P5.green}"/><rect x="174" y="98" width="9" height="56" rx="5" fill="${P5.greenS}"/><rect x="174" y="98" width="32" height="56" rx="10" fill="none" ${st()}/>`;
  b += `<path d="M184.5 98.6 Q190 103.4 195.5 98.6" stroke="${INK}" stroke-width="${w(1.6)}" fill="none" stroke-linecap="round"/>`;
  if (o.itemB) { const [hx, hy] = handLocal(PB, armB, dy); b += o.itemB(w, hx, hy); }
  b += `<g transform="translate(0 ${f(dy)}) rotate(${f(armF)} 206 108)"><rect x="203" y="106" width="7" height="40" rx="3.5" fill="${P5.skin}" ${st()}/><rect x="201" y="102" width="11" height="14" rx="4" fill="${P5.green}" ${st()}/></g>`;
  if (o.itemF) { const [hx, hy] = handLocal(PF, armF, dy); b += o.itemF(w, hx, hy); }
  let hd = `<circle cx="190" cy="78" r="14" fill="${P5.skin}" ${st()}/>`;
  hd += `<path d="M176 74 Q178 60 192 61 Q205 62 205 74 Q198 68 188 70 Q181 70 176 74Z" fill="${P5.hair}" ${st()} ${lj}/>`;
  hd += pedroFace(o, w);
  b += `<g transform="translate(0 ${f(dy * 0.7)}) rotate(${f((o.head || 0) + sl * 9)} 190 94)">${hd}</g>`;
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  if (o.lean) g = `<g transform="rotate(${f(o.lean)} 190 214)">${g}</g>`;
  return g;
}
// (px,py) = punto del suelo bajo Pedro (local 190,214); sc = escala
function placePedro(px, py, sc, o) {
  o.k = SW / (3 * sc);
  const sx = o.flip ? -sc : sc;
  return `<g transform="translate(${f(px - 190 * sx)} ${f(py - 214 * sc)}) scale(${f(sx)} ${f(sc)})">${pedro(o)}</g>`;
}
const pedroPt = (px, py, sc, lx, ly, flip) => [px + (lx - 190) * sc * (flip ? -1 : 1), py + (ly - 214) * sc];
// ciclo de andar: cansado (periodo 0,9 s, hombros caídos, cabeza baja) o decidido (0,6 s, cabeza alta)
function pedroWalk(t, period = 0.75, amp = 1) {
  const ph = 2 * PI * t / period, s = Math.sin(ph);
  return { legF: 28 * s * amp, legB: -28 * s * amp, armF: -22 * s * amp, armB: 22 * s * amp, bob: -3 * (0.5 + 0.5 * Math.cos(2 * ph)) };
}
const tiredWalk = t => Object.assign(pedroWalk(t, 0.9, 0.72), { slump: 1, head: 4, expr: 'tired' });
const decidedWalk = t => Object.assign(pedroWalk(t, 0.6, 1.05), { slump: 0, head: -4, expr: 'grin', lean: 4 });

/* ---------- objetos en las manos (coordenadas locales del personaje) ---------- */
const handC = (w, x, y, fill = P5.skin, r = 4) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
function thumbItem(w, x, y) {
  return `<rect x="${f(x - 1.9)}" y="${f(y - 12.5)}" width="5" height="11" rx="2.5" fill="${P5.skin}" stroke="${INK}" stroke-width="${w(2)}"/>
    <rect x="${f(x - 5.5)}" y="${f(y - 4.5)}" width="11" height="10" rx="3.6" fill="${P5.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>
    <path d="M${f(x - 3.6)} ${f(y - 1.1)} H${f(x + 3.6)} M${f(x - 3.6)} ${f(y + 2)} H${f(x + 3.6)}" stroke="${INK}" stroke-width="${w(1.1)}" stroke-linecap="round"/>`;
}
// vaso genérico (caña) sujeto por la mano; tilt = inclinación
function glassItem(w, x, y, o = {}) {
  const tilt = o.tilt || 0;
  const g = `<path d="M${f(x - 5.4)} ${f(y - 19)} H${f(x + 5.4)} L${f(x + 4.4)} ${f(y + 4)} H${f(x - 4.4)}Z" fill="${C.glass}"/>
    <path d="M${f(x - 4.9)} ${f(y - 13.5)} H${f(x + 4.9)} L${f(x + 4.4)} ${f(y + 4)} H${f(x - 4.4)}Z" fill="${P5.tort}"/>
    <path d="M${f(x - 5.6)} ${f(y - 13.5)} Q${f(x - 3)} ${f(y - 17)} ${f(x)} ${f(y - 14.6)} Q${f(x + 3)} ${f(y - 17.2)} ${f(x + 5.6)} ${f(y - 13.5)} V${f(y - 12)} H${f(x - 5.6)}Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.2)}" stroke-linejoin="round"/>
    <circle cx="${f(x - 1.6)}" cy="${f(y - 6)}" r="0.9" fill="#FFFFFF"/><circle cx="${f(x + 1.4)}" cy="${f(y - 1)}" r="0.7" fill="#FFFFFF"/>
    <path d="M${f(x - 5.4)} ${f(y - 19)} H${f(x + 5.4)} L${f(x + 4.4)} ${f(y + 4)} H${f(x - 4.4)}Z" fill="none" stroke="${INK}" stroke-width="${w(2)}" stroke-linejoin="round"/>
    <path d="M${f(x - 3.6)} ${f(y - 9)} L${f(x - 3)} ${f(y + 1)}" stroke="#FFFFFF" stroke-width="${w(1.2)}" stroke-linecap="round"/>`;
  return `<g transform="rotate(${f(tilt)} ${f(x)} ${f(y)})">${g}</g>` + handC(w, x - 0.6, y - 2, o.skin || P5.skin);
}
// pintxo de tortilla sobre pan con palillo
function pintxoItem(w, x, y, skin = P5.skin) {
  return `<path d="M${f(x)} ${f(y - 24)} V${f(y - 6)}" stroke="${INK}" stroke-width="${w(2.6)}" stroke-linecap="round"/><path d="M${f(x)} ${f(y - 24)} V${f(y - 6)}" stroke="${P5.wood}" stroke-width="${w(1)}" stroke-linecap="round"/>
    <rect x="${f(x - 8)}" y="${f(y - 9)}" width="16" height="6" rx="2.6" fill="${P5.peach}" stroke="${INK}" stroke-width="${w(1.8)}"/>
    <path d="M${f(x - 7)} ${f(y - 9)} V${f(y - 15)} Q${f(x - 7)} ${f(y - 18)} ${f(x - 4)} ${f(y - 18)} H${f(x + 4)} Q${f(x + 7)} ${f(y - 18)} ${f(x + 7)} ${f(y - 15)} V${f(y - 9)}Z" fill="${P5.tort}" stroke="${INK}" stroke-width="${w(1.8)}" stroke-linejoin="round"/>
    <path d="M${f(x - 7)} ${f(y - 15.6)} H${f(x + 7)}" stroke="${P5.tortS}" stroke-width="${w(1.3)}"/>
    <circle cx="${f(x - 3)}" cy="${f(y - 12)}" r="0.9" fill="${P5.tortS}"/><circle cx="${f(x + 2.6)}" cy="${f(y - 11.4)}" r="0.8" fill="${P5.tortS}"/>` + handC(w, x, y - 1, skin);
}
// móvil en la mano de Pedro (reutiliza phoneHand del vídeo 04; card 3 = tarjeta del bar)
const phoneItem = o => (w, x, y) => phoneHand(x, y, o)(w);

/* ===================== CIELO DE ATARDECER ===================== */
const SKY5 = { top: P5.peach, hz: P5.warmCream, topW: '#FFC3B2', hzW: '#FFDCC6' };
const PCLOUDS = [
  { x0: 60, y: 300, s: 0.78, v: 13 }, { x0: 620, y: 470, s: 1.0, v: 22 }, { x0: 1050, y: 230, s: 0.62, v: 9 },
  { x0: 1380, y: 620, s: 0.85, v: 17 }, { x0: 1720, y: 380, s: 0.7, v: 11 }
];
function pinkCloud(x, y, s) {
  const circ = [[-60, 10, 45], [0, -15, 62], [70, -30, 70], [140, -5, 55], [188, 15, 38]];
  const sw = 2 * SW / s;
  let a = '';
  circ.forEach(([cx, cy, r]) => { a += `<circle cx="${cx}" cy="${cy}" r="${r}"/>`; });
  a += `<rect x="-100" y="0" width="320" height="56" rx="28"/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">
    <g transform="translate(10 20)"><g fill="${INK}" stroke="${INK}" stroke-width="${f(sw)}">${a}</g><g fill="${P5.cloudSh}">${a}</g></g>
    <g fill="${INK}" stroke="${INK}" stroke-width="${f(sw)}">${a}</g><g fill="${C.cream}">${a}</g>
    <path d="M-20 -30 A40 40 0 0 1 20 -58" stroke="#FFFFFF" stroke-width="${f(SW * 1.4 / s)}" fill="none" stroke-linecap="round"/></g>`;
}
function pinkClouds(T, list = PCLOUDS) {
  let s = '';
  const span = W + 900;
  list.forEach(c => { const x = (((c.x0 - c.v * T) % span) + span) % span - 420; s += pinkCloud(x, c.y, c.s); });
  return s;
}
function sunsetSun(x, y, r, rot, k = 1) {
  let ry = '';
  for (let i = 0; i < 12; i++) {
    const a = (rot + i * 30) * PI / 180, a1 = a - 0.1, a2 = a + 0.1, r1 = r * 1.16, r2 = r * (i % 2 ? 1.36 : 1.5);
    ry += `<path d="M${f(Math.cos(a1) * r1)} ${f(Math.sin(a1) * r1)} L${f(Math.cos(a) * r2)} ${f(Math.sin(a) * r2)} L${f(Math.cos(a2) * r1)} ${f(Math.sin(a2) * r1)}Z"/>`;
  }
  return at(x, y, k, `<g fill="${P5.orange}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round">${ry}</g>
    <circle cx="8" cy="8" r="${r}" fill="${INK}"/><circle r="${r}" fill="${P5.orange}" stroke="${INK}" stroke-width="${f(SW)}"/>
    <path d="M${f(-r * 0.55)} ${f(-r * 0.2)} A${f(r * 0.6)} ${f(r * 0.6)} 0 0 1 ${f(-r * 0.15)} ${f(-r * 0.58)}" stroke="#FFF5F3" stroke-width="${f(SW * 1.1)}" fill="none" stroke-linecap="round"/>`);
}
// warm: 0 = atardecer suave, 1 = más cálido y rosado (desde la escena 6)
function sunsetSky(T, o = {}) {
  const wm = clamp(o.warm || 0), band = o.band || 900;
  let s = `<rect width="${W}" height="${H}" fill="${hexMix(SKY5.top, SKY5.topW, wm)}"/><rect y="${band}" width="${W}" height="${H}" fill="${hexMix(SKY5.hz, SKY5.hzW, wm)}"/>`;
  if (o.sun !== false) s += sunsetSun(o.sx || 880, o.sy || 640, o.sr || 66, T * 8);
  s += pinkClouds(T + (o.cloudOff || 0), o.clouds);
  return s;
}

/* ===================== EDIFICIO DE OFICINAS (escena 1) ===================== */
// devuelve {svg, door:{x,y,w,h}}; open 0..1 = puerta abierta
function office(x, base, w, h, open) {
  const top = base - h, st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}"`;
  let s = `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 40)}" rx="10" fill="${C.cream}"/>`;
  s += `<rect x="${f(x + w * 0.86)}" y="${f(top + 8)}" width="${f(w * 0.14)}" height="${f(h + 40)}" fill="${INK}" opacity="0.14"/>`;
  s += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 40)}" rx="10" fill="none" ${st()}/>`;
  s += `<rect x="${f(x - 14)}" y="${f(top - 26)}" width="${f(w + 28)}" height="40" rx="10" fill="${C.navy}" ${st()}/>`;
  // ventanas
  const cols = 3, ww = w * 0.2, gap = (w - cols * ww) / (cols + 1);
  for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) {
    const wx = x + gap + c * (ww + gap), wy = top + 50 + r * 120;
    s += glassWindow(wx, wy, ww, 92, null);
    s += `<line x1="${f(wx + ww / 2)}" y1="${f(wy)}" x2="${f(wx + ww / 2)}" y2="${f(wy + 92)}" ${st(0.6)}/>`;
  }
  // rótulo
  const sy = top + 300, sw_ = w * 0.62;
  s += panel(x + (w - sw_) / 2, sy, sw_, 70, 16, C.navy, 7);
  s += text('OFICINAS', x + w / 2, sy + 37, { size: fit('OFICINAS', 54, sw_ - 40, 'G'), font: 'G', fill: C.cream, sw: SW * 1.2, sd: 3 });
  // marquesina y puerta
  const dw = w * 0.62, dx = x + (w - dw) / 2, dyy = sy + 110, dh = base - dyy;
  s += `<rect x="${f(dx - 20)}" y="${f(dyy - 26)}" width="${f(dw + 40)}" height="28" rx="8" fill="${C.navy}" ${st()}/>`;
  s += `<rect x="${f(dx)}" y="${f(dyy)}" width="${f(dw)}" height="${f(dh + 10)}" fill="#22394F" ${st()}/>`;
  s += `<rect x="${f(dx + SW)}" y="${f(base - 36)}" width="${f(dw - 2 * SW)}" height="36" fill="#1B2C3D"/>`;
  // hoja izquierda (se abre hacia fuera: se estrecha)
  const half = dw / 2, lw = half * lerp(1, 0.28, open), rw = half;
  s += `<path d="M${f(dx)} ${f(dyy)} L${f(dx + lw)} ${f(dyy - 18 * open)} L${f(dx + lw)} ${f(base + 18 * open)} L${f(dx)} ${f(base)}Z" fill="${C.glass}" ${st()} stroke-linejoin="round"/>`;
  s += `<path d="M${f(dx + lw * 0.2)} ${f(dyy + 30)} L${f(dx + lw * 0.55)} ${f(dyy + 30)} L${f(dx + lw * 0.25)} ${f(dyy + 220)}Z" fill="#FFFFFF" opacity="0.55"/>`;
  // hoja derecha (abre más tarde, poco)
  const op2 = open * 0.15;
  s += `<path d="M${f(dx + dw)} ${f(dyy)} L${f(dx + dw - rw * (1 - op2))} ${f(dyy - 4 * op2)} L${f(dx + dw - rw * (1 - op2))} ${f(base + 4 * op2)} L${f(dx + dw)} ${f(base)}Z" fill="${C.glass}" ${st()} stroke-linejoin="round"/>`;
  s += `<rect x="${f(dx + dw - rw * (1 - op2) + 18)}" y="${f(dyy + dh * 0.45)}" width="12" height="70" rx="6" fill="${C.cream}" ${st(0.7)}/>`;
  return { svg: s, door: { x: dx, y: dyy, w: dw, h: dh } };
}

/* ===================== NOTIFICACIÓN Y SELLO FLASH ===================== */
const NOTIF = { title: 'Escaparate de Tudela', shop: 'BAR LA TORTILLA ·', l1: '¡Oferta flash de 18h a 20h!', l2: 'Pintxo de tortilla + bebida', l3: 'por 3,50 €' };
// tarjeta genérica centrada en (0,0). full=true: 900x660 con el texto completo; full=false: versión compacta 780x330
function notifLocal(full = true) {
  const Wd = full ? 900 : 780, Hd = full ? 600 : 330, x0 = -Wd / 2, y0 = -Hd / 2, hh = full ? 140 : 112;
  const id = 'nt' + (uid++);
  let g = panel(x0, y0, Wd, Hd, 44, '#FFFFFF', 14);
  g += `<clipPath id="${id}"><rect x="${x0}" y="${y0}" width="${Wd}" height="${Hd}" rx="44"/></clipPath>`;
  g += `<g clip-path="url(#${id})"><rect x="${x0}" y="${y0}" width="${Wd}" height="${hh}" fill="${C.red}"/></g>`;
  g += `<line x1="${x0}" y1="${y0 + hh}" x2="${x0 + Wd}" y2="${y0 + hh}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  g += `<rect x="${x0}" y="${y0}" width="${Wd}" height="${Hd}" rx="44" fill="none" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  const ir = hh * 0.36, icx = x0 + 30 + ir, icy = y0 + hh / 2;
  g += `<rect x="${f(icx - ir)}" y="${f(icy - ir)}" width="${f(ir * 2)}" height="${f(ir * 2)}" rx="${f(ir * 0.42)}" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>` + logoIcon(icx, icy + ir * 0.05, ir * 1.85);
  const tx = icx + ir + 24, tw = x0 + Wd - 40 - tx;
  g += text(NOTIF.title, tx, icy + 2, { size: fit(NOTIF.title, hh * 0.4, tw), anchor: 'start', sw: SW * 1.5, sd: 4 });
  const bx = x0 + 44, bw = Wd - 88;
  if (full) {
    g += text(NOTIF.shop, bx, y0 + hh + 78, { size: fit(NOTIF.shop, 78, bw - 150, 'G'), font: 'G', anchor: 'start', fill: C.red, sw: SW * 1.5, sd: 4, ls: 1 });
    g += text(NOTIF.l1, bx, y0 + hh + 168, { size: fit(NOTIF.l1, 60, bw), anchor: 'start', fill: INK, stroke: null });
    g += text(NOTIF.l2, bx, y0 + hh + 246, { size: fit(NOTIF.l2, 60, bw), anchor: 'start', fill: INK, stroke: null });
    g += text(NOTIF.l3, bx, y0 + hh + 350, { size: 96, anchor: 'start', fill: C.yel, sw: SW * 2, sd: 6 });
    // pintxo y caña dibujados junto al precio
    const ws = 4.4, k = SW / (3 * ws), wl = v => f(v * k);
    g += `<g transform="translate(${f(x0 + Wd - 340)} ${f(y0 + hh + 330)}) scale(${ws})">${pintxoItem(wl, 0, 14, P5.skin).replace(/<circle[^>]*\/>$/, '')}</g>`;
    g += `<g transform="translate(${f(x0 + Wd - 250)} ${f(y0 + hh + 330)}) scale(${ws})">${glassItem(wl, 0, 8).replace(/<circle[^>]*\/>$/, '')}</g>`;
  } else {
    g += text(NOTIF.shop.replace(' ·', ''), bx, y0 + hh + 66, { size: fit('BAR LA TORTILLA', 70, bw, 'G'), font: 'G', anchor: 'start', fill: C.red, sw: SW * 1.4, sd: 4, ls: 1 });
    g += text(NOTIF.l1, bx, y0 + hh + 150, { size: fit(NOTIF.l1, 56, bw), anchor: 'start', fill: INK, stroke: null });
  }
  return g;
}
const notif = (x, y, k, rot, full) => at(x, y, k, notifLocal(full), rot);
const BOLT = 'M0.18 -1 L-0.5 0.12 L-0.06 0.12 L-0.24 1 L0.5 -0.16 L0.06 -0.16 Z';
function boltPath(r) { return BOLT.replace(/-?\d+(\.\d+)?/g, v => f(Number(v) * r)); }
// sello de rayo rojo «Flash 18-20 h»
function flashSeal(x, y, r, k, rot, glow = 0) {
  if (k <= 0.01) return '';
  const d = starPath(r, r * 0.8, 16);
  let g = `<path d="${d}" transform="translate(${f(r * 0.07)} ${f(r * 0.07)})" fill="${INK}"/><path d="${d}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
  g += `<circle r="${f(r * 0.66)}" fill="none" stroke="#FFFFFF" stroke-width="${f(Math.max(3, r * 0.035))}" stroke-dasharray="${f(r * 0.12)} ${f(r * 0.09)}" stroke-linecap="round"/>`;
  g += `<path d="${boltPath(r * 0.62)}" transform="translate(${f(r * 0.04)} ${f(r * 0.04)})" fill="${INK}"/><path d="${boltPath(r * 0.62)}" fill="${glow > 0.5 ? '#FFFFFF' : C.yel}" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linejoin="round"/>`;
  g += text('Flash', 0, -r * 0.2, { size: r * 0.42, font: 'G', sw: SW * 1.5, sd: 4, ls: 1 });
  g += text('18-20 h', 0, r * 0.26, { size: fit('18-20 h', r * 0.36, r * 1.3), sw: SW * 1.4, sd: 4 });
  return at(x, y, k, g, rot);
}

/* ===================== NUBE DE PENSAMIENTO Y FACHADA DEL BAR ===================== */
function thinkCloud(cx, cy, wd, ht, k = 1) {
  if (k <= 0.01) return '';
  const rx = wd / 2, ry = ht / 2;
  let a = `<ellipse cx="0" cy="0" rx="${f(rx * 0.86)}" ry="${f(ry * 0.8)}"/>`;
  const n = 11;
  for (let i = 0; i < n; i++) {
    const ang = i / n * 2 * PI, r = Math.min(rx, ry) * (i % 2 ? 0.34 : 0.4);
    a += `<circle cx="${f(Math.cos(ang) * rx * 0.8)}" cy="${f(Math.sin(ang) * ry * 0.74)}" r="${f(r)}"/>`;
  }
  return at(cx, cy, k, `<g transform="translate(14 16)" fill="${INK}" stroke="${INK}" stroke-width="${f(SW * 2)}">${a}</g><g fill="${INK}" stroke="${INK}" stroke-width="${f(SW * 2)}">${a}</g><g fill="#FFFFFF">${a}</g>`);
}
function thinkDot(x, y, r, k) {
  return at(x, y, k, `<circle cx="6" cy="6" r="${r}" fill="${INK}"/><circle r="${r}" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>`);
}
// tortilla dibujada (círculo amarillo con contorno y sombra dura)
function tortilla(x, y, r, rot = 0) {
  return at(x, y, 1, `<circle cx="${f(r * 0.12)}" cy="${f(r * 0.12)}" r="${f(r)}" fill="${INK}"/>
    <circle r="${f(r)}" fill="${P5.tort}" stroke="${INK}" stroke-width="${f(SW)}"/>
    <path d="M${f(-r * 0.5)} ${f(r * 0.55)} A${f(r * 0.78)} ${f(r * 0.78)} 0 0 0 ${f(r * 0.72)} ${f(r * 0.2)}" stroke="${P5.tortS}" stroke-width="${f(SW * 0.9)}" fill="none" stroke-linecap="round"/>
    <circle cx="${f(-r * 0.3)}" cy="${f(-r * 0.2)}" r="${f(r * 0.1)}" fill="${P5.tortS}"/><circle cx="${f(r * 0.28)}" cy="${f(-r * 0.32)}" r="${f(r * 0.08)}" fill="${P5.tortS}"/><circle cx="${f(r * 0.1)}" cy="${f(r * 0.12)}" r="${f(r * 0.09)}" fill="${P5.tortS}"/>
    <path d="M${f(-r * 0.62)} ${f(-r * 0.28)} A${f(r * 0.66)} ${f(r * 0.66)} 0 0 1 ${f(-r * 0.22)} ${f(-r * 0.62)}" stroke="#FFF5F3" stroke-width="${f(SW * 0.9)}" fill="none" stroke-linecap="round"/>`, rot);
}
const BAR_TORTILLA = { facade: P5.warmCream, sign: '', item: 'drinks' };
// fachada del bar «LA TORTILLA» (reutiliza shop() y le pone el rótulo con la tortilla)
function barFacade(x, base, w, h) {
  let s = shop(x, base, w, h, BAR_TORTILLA);
  const top = base - h, py = top + h * 0.045, ph = h * 0.115, sx = x + w * 0.12, sw_ = w * 0.76;
  const tr = ph * 0.62;
  s += tortilla(sx + tr * 0.6, py + ph * 0.5, tr, -10);
  const tx = sx + tr * 1.5 + 6, tw = sx + sw_ - tx - 10;
  s += text('LA TORTILLA', tx + tw / 2, py + ph * 0.55, { size: fit('LA TORTILLA', ph * 0.74, tw, 'G'), font: 'G', sw: SW * 1.5, sd: 3, ls: 1 });
  return s;
}

/* ===================== INTERIOR DEL BAR ===================== */
const BOTTLE_C = [C.green, C.dred, P5.wood, C.navy, P5.greenS, P5.orange];
function bottle(x, base, h, col) {
  const bw = h * 0.3, nw = bw * 0.38, sh = h * 0.42;
  const d = `M${f(x - bw / 2)} ${f(base)} V${f(base - sh)} Q${f(x - bw / 2)} ${f(base - sh - bw * 0.5)} ${f(x - nw / 2)} ${f(base - sh - bw * 0.6)} V${f(base - h)} H${f(x + nw / 2)} V${f(base - sh - bw * 0.6)} Q${f(x + bw / 2)} ${f(base - sh - bw * 0.5)} ${f(x + bw / 2)} ${f(base - sh)} V${f(base)}Z`;
  return `<path d="${d}" fill="${col}" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linejoin="round"/>
    <rect x="${f(x - bw * 0.32)}" y="${f(base - sh * 0.85)}" width="${f(bw * 0.18)}" height="${f(sh * 0.6)}" rx="3" fill="#FFFFFF" opacity="0.45"/>
    <rect x="${f(x - nw / 2 - 2)}" y="${f(base - h - 4)}" width="${f(nw + 4)}" height="12" rx="3" fill="${C.cream}" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
}
function tumbler(x, base, h) {
  const tw = h * 0.62;
  return `<path d="M${f(x - tw / 2)} ${f(base - h)} H${f(x + tw / 2)} L${f(x + tw * 0.4)} ${f(base)} H${f(x - tw * 0.4)}Z" fill="${C.glass}" stroke="${INK}" stroke-width="${f(SW * 0.8)}" stroke-linejoin="round"/>
    <path d="M${f(x - tw * 0.25)} ${f(base - h * 0.8)} L${f(x - tw * 0.2)} ${f(base - h * 0.2)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.7)}" stroke-linecap="round"/>`;
}
function shelf(x0, x1, y) {
  return `<rect x="${f(x0 + 8)}" y="${f(y + 8)}" width="${f(x1 - x0)}" height="24" rx="6" fill="${INK}"/><rect x="${f(x0)}" y="${f(y)}" width="${f(x1 - x0)}" height="24" rx="6" fill="${P5.wood}" stroke="${INK}" stroke-width="${f(SW)}"/>
    <path d="M${f(x0 + 40)} ${f(y + 24)} l20 34 M${f(x1 - 40)} ${f(y + 24)} l-20 34" stroke="${INK}" stroke-width="${f(SW * 1.2)}" stroke-linecap="round"/>`;
}
function lamp(x, yb, sway = 0) {
  const g = `<line x1="0" y1="${f(-yb - 20)}" x2="0" y2="-46" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>
    <path d="M-120 60 L-46 -4 H46 L120 60Z" fill="#FFF5F3" opacity="0.28"/>
    <path d="M-70 0 Q-70 -56 0 -56 Q70 -56 70 0Z" transform="translate(7 7)" fill="${INK}"/>
    <path d="M-70 0 Q-70 -56 0 -56 Q70 -56 70 0Z" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>
    <path d="M-46 -30 Q-36 -44 -18 -48" stroke="#FFFFFF" stroke-width="${f(SW * 0.9)}" fill="none" stroke-linecap="round" opacity="0.7"/>
    <circle cy="6" r="20" fill="${P5.tort}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  return `<g transform="translate(${f(x)} ${f(yb)}) rotate(${f(sway)} 0 ${f(-yb)})">${g}</g>`;
}
function chalkboard(x, y, wd, ht) {
  let s = `<rect x="${f(x - 16 + 12)}" y="${f(y - 16 + 12)}" width="${f(wd + 32)}" height="${f(ht + 32)}" rx="18" fill="${INK}"/>`;
  s += `<rect x="${f(x - 16)}" y="${f(y - 16)}" width="${f(wd + 32)}" height="${f(ht + 32)}" rx="18" fill="${P5.wood}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="${f(ht)}" rx="8" fill="#26302C" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<path d="M${f(x + 26)} ${f(y + 22)} H${f(x + wd - 26)}" stroke="#FFFFFF" stroke-width="3" opacity="0.25" stroke-dasharray="14 10"/>`;
  s += text('Pintxo + bebida', x + wd / 2, y + ht * 0.3, { size: fit('Pintxo + bebida', 60, wd - 50), fill: '#FFFFFF', stroke: null });
  s += text('3,50 €', x + wd / 2 + 40, y + ht * 0.7, { size: 104, fill: P5.tort, stroke: null });
  s += tortilla(x + 74, y + ht * 0.7, 38, -8);
  s += `<path d="M${f(x + 30)} ${f(y + ht - 22)} H${f(x + wd - 30)}" stroke="#FFFFFF" stroke-width="3" opacity="0.25" stroke-dasharray="14 10"/>`;
  return s;
}
function stool(x, seatY, floorY) {
  const st = `stroke="${INK}" stroke-width="${f(SW)}"`;
  return `<path d="M${f(x - 50)} ${f(seatY)} L${f(x - 74)} ${f(floorY)} M${f(x + 50)} ${f(seatY)} L${f(x + 74)} ${f(floorY)}" stroke="${INK}" stroke-width="${f(SW * 2.6)}" stroke-linecap="round"/>
    <path d="M${f(x - 50)} ${f(seatY)} L${f(x - 74)} ${f(floorY)} M${f(x + 50)} ${f(seatY)} L${f(x + 74)} ${f(floorY)}" stroke="${P5.woodS}" stroke-width="${f(SW * 1.1)}" stroke-linecap="round"/>
    <rect x="${f(x - 66)}" y="${f(seatY + (floorY - seatY) * 0.55)}" width="132" height="16" rx="8" fill="${P5.woodS}" ${st}/>
    <rect x="${f(x - 84 + 8)}" y="${f(seatY - 26 + 8)}" width="168" height="36" rx="18" fill="${INK}"/>
    <rect x="${f(x - 84)}" y="${f(seatY - 26)}" width="168" height="36" rx="18" fill="${C.red}" ${st}/>`;
}
// fondo del bar: pared cálida, estantes con botellas y vasos, pizarra, lámparas
function barBack(T) {
  let s = `<rect width="${W}" height="${H}" fill="${P5.warmCream}"/>`;
  for (let x = 60; x < W; x += 150) s += `<rect x="${x}" y="0" width="56" height="${H}" fill="${P5.peach}" opacity="0.7"/>`;
  s += `<rect x="0" y="0" width="${W}" height="80" fill="${P5.woodS}"/><line x1="0" y1="80" x2="${W}" y2="80" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  // estantes a la derecha (tras la barra)
  s += shelf(560, 1060, 530) + shelf(560, 1060, 720);
  [[610, 104, 0], [680, 124, 1], [748, 96, 2], [812, 128, 3], [880, 110, 4], [948, 120, 1], [1012, 98, 5]].forEach(([x, h, c]) => { s += bottle(x, 530, h, BOTTLE_C[c]); });
  for (let i = 0; i < 7; i++) s += tumbler(600 + i * 68, 720, 62 + (i % 2) * 8);
  // pizarra a la izquierda
  s += chalkboard(56, 420, 420, 270);
  // lámparas colgantes
  s += lamp(150, 330, 1.2 * Math.sin(T * 1.7)) + lamp(940, 350, 1.2 * Math.sin(T * 1.5 + 1));
  return s;
}
function barCounter(top) {
  let s = `<rect x="-20" y="${top + 30}" width="${W + 40}" height="${H - top}" fill="${P5.wood}"/>`;
  for (let x = 40; x < W; x += 130) s += `<rect x="${x}" y="${top + 30}" width="44" height="${H - top}" fill="${P5.woodS}" opacity="0.55"/>`;
  s += `<line x1="-20" y1="${top + 30}" x2="${W + 20}" y2="${top + 30}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<rect x="-20" y="${top + 8}" width="${W + 40}" height="22" fill="${INK}"/>`;
  s += `<rect x="-20" y="${top - 12}" width="${W + 40}" height="40" rx="10" fill="#C98A4B" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<path d="M30 ${top - 2} H420" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" opacity="0.45" stroke-linecap="round"/>`;
  return s;
}

/* ===================== GLOBOS DE DIÁLOGO, CORAZÓN, «¡CHIN!» ===================== */
function heartPath(r) {
  return `M0 ${f(r * 0.9)} C${f(-r * 1.6)} ${f(-r * 0.1)} ${f(-r * 0.9)} ${f(-r * 1.3)} 0 ${f(-r * 0.45)} C${f(r * 0.9)} ${f(-r * 1.3)} ${f(r * 1.6)} ${f(-r * 0.1)} 0 ${f(r * 0.9)}Z`;
}
// globo de diálogo (x,y centro); kind: 'dots' | 'star' | 'heart'; tail: 'left' | 'right'
function speech(x, y, k, kind, tail = 'left', t = 0) {
  if (k <= 0.01) return '';
  const wd = 200, ht = 130, tx = tail === 'left' ? -40 : 40;
  const tl = `M${tx - 22} ${ht / 2 - 10} L${tx - (tail === 'left' ? 46 : -46)} ${ht / 2 + 46} L${tx + 22} ${ht / 2 - 10}Z`;
  let g = `<g transform="translate(10 10)" fill="${INK}"><rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="60"/><path d="${tl}"/></g>`;
  g += `<path d="${tl}" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
  g += `<rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="60" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  g += `<path d="M${tx - 18} ${ht / 2 - 6} H${tx + 18}" stroke="#FFFFFF" stroke-width="${f(SW * 1.6)}"/>`;
  if (kind === 'dots') for (let i = 0; i < 3; i++) g += `<circle cx="${(i - 1) * 46}" cy="${f(-6 * Math.max(0, Math.sin(t * 9 - i * 0.9)))}" r="14" fill="${INK}"/>`;
  if (kind === 'star') g += yelStar(0, 0, 46, 1 + 0.08 * Math.sin(t * 10));
  if (kind === 'heart') { const hs = 1 + 0.12 * Math.max(0, Math.sin(t * 9)); g += at(0, 4, hs, `<path d="${heartPath(36)}" transform="translate(5 5)" fill="${INK}"/><path d="${heartPath(36)}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/><circle cx="-16" cy="-12" r="6" fill="#FFFFFF"/>`); }
  return at(x, y, k, g, tail === 'left' ? -4 : 4);
}
function chin(x, y, k, t) {
  if (k <= 0.01) return '';
  let g = '';
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * 2 * PI + 0.3, r1 = 120, r2 = 175 + 15 * (i % 2);
    g += `<line x1="${f(Math.cos(a) * r1)}" y1="${f(Math.sin(a) * r1)}" x2="${f(Math.cos(a) * r2)}" y2="${f(Math.sin(a) * r2)}" stroke="${INK}" stroke-width="${f(SW * 1.3)}" stroke-linecap="round"/>`;
  }
  const d = starPath(118, 80, 12);
  g += `<path d="${d}" transform="translate(8 8)" fill="${INK}"/><path d="${d}" fill="${P5.tort}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
  g += text('¡CHIN!', 0, 4, { size: 74, font: 'G', sw: SW * 1.8, sd: 5, ls: 1 });
  return at(x, y, k, g, -8 + 4 * Math.sin(t * 20));
}

/* ===================== SECUNDARIOS DEL BAR (sobre folk() del vídeo 03) ===================== */
const F_ROSA = FOLK.push({ id: 'jersey', skin: '#F6C9A0', skinS: '#E9B88F', hair: 'long', hairC: '#5A3A2A', top: 'jersey', topC: '#F48FB1', topS: '#D9739A', pants: '#2D4A6B', shoe: '#8E1B1B' }) - 1;
const F_CUADROS = FOLK.push({ id: 'cuadros', skin: '#E9B88F', skinS: '#D39F76', hair: 'short', hairC: '#1E1A1A', top: 'shirt', topC: '#D32F2F', topS: '#A32323', plaid: '#FFF5F3', pants: '#2D4A6B', shoe: '#5A4137', beard: '#1E1A1A', scale: 1.04 }) - 1;
const F_CAMARERO = FOLK.push({ id: 'camarero', skin: '#F6C9A0', skinS: '#E9B88F', hair: 'short', hairC: '#8A8580', top: 'shirt', topC: '#FFFFFF', topS: '#E2D6D3', apron: '#222222', pants: '#222222', shoe: '#1E1A1A', glasses: false }) - 1;
// posición en el mundo de la mano delantera de un folk (pivote 202,108; mano 202.5,139.5)
function folkHand(i, px, py, sc, ang, flip) {
  const s = sc * (FOLK[i].scale || 1), r = rotV([0.5, 31.5], ang);
  return [px + (202 + r[0] - 190) * s * (flip ? -1 : 1), py + (108 + r[1] - 204) * s];
}
// paño de cocina en la mano
function towelItem(w, x, y) {
  return `<path d="M${f(x - 6)} ${f(y - 4)} Q${f(x)} ${f(y - 8)} ${f(x + 6)} ${f(y - 4)} L${f(x + 5)} ${f(y + 12)} Q${f(x)} ${f(y + 9)} ${f(x - 5)} ${f(y + 12)}Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.8)}" stroke-linejoin="round"/>
    <path d="M${f(x - 5)} ${f(y + 2)} H${f(x + 5)} M${f(x - 5)} ${f(y + 6)} H${f(x + 5)}" stroke="${C.red}" stroke-width="${w(1.4)}"/>` + handC(w, x, y - 3, '#F6C9A0', 3.8);
}
// vaso vacío (camarero lo seca)
function emptyGlassItem(w, x, y) {
  return `<path d="M${f(x - 5)} ${f(y - 17)} H${f(x + 5)} L${f(x + 4)} ${f(y + 3)} H${f(x - 4)}Z" fill="${C.glass}" stroke="${INK}" stroke-width="${w(2)}" stroke-linejoin="round"/>
    <path d="M${f(x - 2.6)} ${f(y - 13)} L${f(x - 2)} ${f(y - 2)}" stroke="#FFFFFF" stroke-width="${w(1.3)}" stroke-linecap="round"/>` + handC(w, x - 0.4, y - 1, '#F6C9A0', 3.8);
}
