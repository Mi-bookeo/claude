/* Vídeo 19 — «El precio de antes» (efecto ancla). SIN personajes: carteles, objetos, textos y un cerebro icono (sin cara).
   Escenas sobre lib.js + series.js + v04…v18.js (piezas de la serie: portalPhone, redSign17, strip15, window17…).
   Todo se calcula a partir de (t local de la escena, T global). Duraciones, momentos (cues), planos (shots) y textos
   se leen de config19.json. Franja de subtítulos (y ≥ 1400) libre; margen superior hasta y=192 (10 %).
   Cortes secos entre escenas y entre planos; textos con rebote. */
'use strict';

const S = {};
const comicZoom = (u, from = 1.12) => lerp(from, 1, easeOut(u / 0.22));
const cues = (sc, def) => Object.assign({}, def, sc.cues || {});
const bumpZ = (t, times, a = 0.03) => 1 + times.reduce((m, t0) => m + (t >= t0 ? a * Math.max(0, damp(t - t0, 14, 6)) : 0), 0);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const TX = (key, def) => (CFG && CFG.textos && CFG.textos[key] !== undefined) ? CFG.textos[key] : def;
const shakeAt = (t, t0, amp = 24) => t >= t0 ? amp * damp(t - t0, 50, 7) : 0;
const st19 = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
// plano activo de una escena: [nombre, t local del plano]
function shotOf(sc, t) {
  const e = Object.entries(sc.shots || {});
  for (let i = e.length - 1; i >= 0; i--) if (t >= e[i][1][0]) return [e[i][0], t - e[i][1][0]];
  return [e.length ? e[0][0] : '', t];
}
// caída con rebote: y de llegada y1 desde «from»; devuelve null antes de t0
function dropY(t, t0, y1, from = -500, dur = 0.38, amp = 70) {
  if (t < t0) return null;
  const u = (t - t0) / dur;
  if (u < 1) return lerp(from, y1, u * u);
  const b = t - t0 - dur;
  return y1 - amp * Math.abs(Math.sin(b * 8.5)) * Math.exp(-5.5 * b);
}
const squashAt = (t, t0) => t >= t0 ? 1 - 0.14 * Math.max(0, damp(t - t0, 22, 7)) : 1;

const K19 = {
  cheese: '#FFE3A1', cheeseS: '#F2C66B', crust: '#C98A4B', crustS: '#A9743F', berry: '#D32F2F', berryD: '#8E1B1B',
  old: '#4E4646', muted: '#ECE6E4', mutedDot: '#D3CBC9', water: '#BFE3F2', waterL: '#E4F4FA', waterD: '#8FC7E0',
  sand: '#F3D9A4', anchor: '#4F5D6B', anchorL: '#7D8C9A', chain: '#8D949C', drop: '#7EC8E3', ok: '#2E9E4F'
};

/* ===================== FONDOS ===================== */
function dots19(x0, y0, x1, y1, col = DOT, gap = 46, r = 5, op = 0.55) {
  let s = '';
  for (let y = y0 + gap / 2, j = 0; y < y1; y += gap, j++) for (let x = x0 + (j % 2 ? gap / 2 : 0); x < x1 + gap; x += gap) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${col}" opacity="${op}"/>`;
  return s;
}
// pared crema con semitono; o.win = [x, y, w, h] ventana con cielo; o.counter = y del mostrador
function wall19(T, o = {}) {
  let s = `<rect x="-400" y="-400" width="${W + 800}" height="${H + 800}" fill="${o.fill || C.cream}"/>` + dots19(-200, -200, W + 200, H + 200, o.dot || DOT);
  if (o.win) s += window17(o.win[0], o.win[1], o.win[2], o.win[3], T);
  if (o.counter) {
    const y = o.counter;
    s += `<rect x="-400" y="${y}" width="${W + 800}" height="${H}" fill="${C.wood}" ${st19()}/><rect x="-400" y="${y}" width="${W + 800}" height="34" fill="${C.woodS}" ${st19(0.8)}/>`;
  }
  return s;
}
// pantalla dividida en dos mitades verticales
function split19(left, right, o = {}) {
  const a = 'sl' + (uid++), b = 'sr' + (uid++);
  let s = `<clipPath id="${a}"><rect x="0" y="0" width="540" height="${H}"/></clipPath><clipPath id="${b}"><rect x="540" y="0" width="540" height="${H}"/></clipPath>`;
  s += `<g clip-path="url(#${a})">${left}</g><g clip-path="url(#${b})">${right}</g>`;
  s += `<rect x="531" y="-10" width="18" height="${H + 20}" fill="#FFFFFF" ${st19(1)}/>`;
  return s;
}

/* ===================== TARTA DE QUESO ===================== */
// (x,y) centro; ~300 x 190
function cheesecake19(x, y, s = 1) {
  const r = 125, ry = 36, top = -50, h = 104, sw = SW / s;
  const L = `stroke="${INK}" stroke-width="${f(sw)}" stroke-linejoin="round"`;
  let g = `<ellipse cx="0" cy="${top + h + 14}" rx="165" ry="34" fill="#FFFFFF" ${L}/>`;
  g += `<path d="M${-r} ${top} V${top + h} A${r} ${ry} 0 0 0 ${r} ${top + h} V${top} Z" fill="${K19.cheese}" ${L}/>`;
  g += `<path d="M${-r} ${top + h - 26} A${r} ${ry} 0 0 0 ${r} ${top + h - 26} V${top + h} A${r} ${ry} 0 0 1 ${-r} ${top + h} Z" fill="${K19.crust}" ${L}/>`;
  g += `<path d="M${r - 34} ${top + 18} V${top + h - 30}" stroke="${K19.cheeseS}" stroke-width="${f(sw * 1.6)}" stroke-linecap="round"/>`;
  // cobertura roja con chorretones
  g += `<path d="M${-r} ${top} A${r} ${ry} 0 0 0 ${r} ${top} L${r} ${top + 12} Q${r - 10} ${top + 30} ${r - 22} ${top + 22} Q${r - 40} ${top + 34} ${r - 56} ${top + 30} Q${r - 66} ${top + 62} ${r - 80} ${top + 34} Q${r - 110} ${top + 44} ${r - 140} ${top + 38} Q${r - 152} ${top + 72} ${r - 168} ${top + 36} Q${-r + 50} ${top + 40} ${-r + 30} ${top + 26} Q${-r + 16} ${top + 52} ${-r + 4} ${top + 20} Z" fill="${K19.berry}" ${L}/>`;
  g += `<ellipse cx="0" cy="${top}" rx="${r}" ry="${ry}" fill="${K19.berry}" ${L}/>`;
  g += `<ellipse cx="-54" cy="${top - 10}" rx="30" ry="9" fill="#FFFFFF" opacity="0.55"/>`;
  // fresa
  g += `<path d="M0 ${top - 70} C34 ${top - 70} 30 ${top - 30} 0 ${top - 4} C-30 ${top - 30} -34 ${top - 70} 0 ${top - 70}Z" fill="${C.red}" ${L}/>`;
  g += `<path d="M-22 ${top - 72} L-6 ${top - 62} L0 ${top - 80} L6 ${top - 62} L22 ${top - 72} L12 ${top - 56} H-12Z" fill="${C.green}" ${L}/>`;
  [[-8, top - 46], [8, top - 40], [0, top - 26], [-12, top - 30], [12, top - 54]].forEach(([a, b]) => { g += `<circle cx="${a}" cy="${b}" r="2.6" fill="#FFF3B8"/>`; });
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">${g}</g>`;
}

/* ===================== CARTEL DE PRECIO ===================== */
// línea roja de tachado que se dibuja con k (0..1)
function strike19(x1, y1, x2, y2, k, wd = 16) {
  if (k <= 0) return '';
  const xe = lerp(x1, x2, clamp(k)), ye = lerp(y1, y2, clamp(k));
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(xe)}" y2="${f(ye)}" stroke="${INK}" stroke-width="${f(wd + SW * 1.6)}" stroke-linecap="round"/>` +
    `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(xe)}" y2="${f(ye)}" stroke="${C.red}" stroke-width="${f(wd)}" stroke-linecap="round"/>`;
}
function downArrow19(x, y, len, k, col = C.yel) {
  if (k <= 0.01) return '';
  const d = `M-14 ${-len / 2} H14 V${len / 2 - 30} H36 L0 ${len / 2 + 8} L-36 ${len / 2 - 30} H-14Z`;
  return at(x, y, k, `<path d="${d}" transform="translate(6 6)" fill="${INK}"/><path d="${d}" fill="${col}" ${st19(0.9)}/>`);
}
// cartel 440 x 620 centrado en (0,0).
// o.old: precio de antes (si falta, solo el precio) · o.strike: tachado 0..1 · o.newK: rebote del precio nuevo
// o.arrow: flecha entre precios 0..1 · o.newStr: texto del precio nuevo · o.glint: barrido de brillo 0..1 · o.dim: apagado
function priceSign19(o = {}) {
  const wd = 440, ht = 620, x0 = -220, y0 = -310, hh = 112, id = 'ps' + (uid++);
  const title = TX('producto', 'TARTA DE QUESO'), newStr = o.newStr || TX('precio', '7,20 €');
  let g = `<rect x="${x0 + 16}" y="${y0 + 16}" width="${wd}" height="${ht}" rx="30" fill="${INK}"/>`;
  g += `<rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="30" fill="#FFFFFF"/>`;
  g += `<path d="M${x0} ${y0 + hh} V${y0 + 30} Q${x0} ${y0} ${x0 + 30} ${y0} H${x0 + wd - 30} Q${x0 + wd} ${y0} ${x0 + wd} ${y0 + 30} V${y0 + hh}Z" fill="${o.dim ? '#B85A5A' : C.red}"/>`;
  g += `<line x1="${x0}" y1="${y0 + hh}" x2="${x0 + wd}" y2="${y0 + hh}" ${st19(0.9)}/>`;
  g += `<rect x="${x0 + 14}" y="${y0 + 14}" width="${wd - 28}" height="${hh - 28}" rx="14" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 0.5)}" stroke-dasharray="18 12" opacity="0.7"/>`;
  g += text(title, 0, y0 + hh / 2 + 4, { size: fit(title, 60, wd - 70), sw: SW * 1.5, sd: 4 });
  g += cheesecake19(0, -112, 0.92);
  const priceO = { fill: C.red, sw: SW * 1.7, sd: 6 };
  if (!o.old) {
    g += at(0, 150, o.newK === undefined ? 1 : o.newK, text(newStr, 0, 0, Object.assign({ size: fit(newStr, 150, wd - 50) }, priceO)));
  } else {
    const os = fit(o.old, 96, wd - 60), ow = measure(o.old, os);
    g += text(o.old, 0, 44, { size: os, fill: K19.old, stroke: null, shadow: false });
    g += strike19(-ow / 2 - 14, 62, ow / 2 + 14, 30, o.strike === undefined ? 1 : o.strike, 9);
    const ax = o.arrow !== undefined ? -40 : 0;
    g += at(ax, 210, o.newK === undefined ? 1 : o.newK, text(newStr, 0, 0, Object.assign({ size: fit(newStr, 132, wd - (ax ? 120 : 50)) }, priceO)));
    if (o.arrow) g += downArrow19(186, 130, 130, o.arrow);
  }
  if (o.glint !== undefined && o.glint > 0 && o.glint < 1) {
    const bx = lerp(-360, 360, o.glint);
    g += `<clipPath id="${id}"><rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="30"/></clipPath><g clip-path="url(#${id})"><path d="M${f(bx - 40)} ${y0 - 20} L${f(bx + 30)} ${y0 - 20} L${f(bx - 60)} ${y0 + ht + 20} L${f(bx - 130)} ${y0 + ht + 20}Z" fill="#FFFFFF" opacity="0.7"/></g>`;
  }
  if (o.extra) g += o.extra;
  g += `<rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="30" fill="none" ${st19(1.1)}/>`;
  // cinta adhesiva arriba
  [-1, 1].forEach(sd => { g += `<rect x="-50" y="-16" width="100" height="32" fill="#FFF3B8" opacity="0.9" ${st19(0.5)} transform="translate(${sd * 170} ${y0 + 2}) rotate(${sd * 26})"/>`; });
  if (o.dim) g += `<rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="30" fill="#FFFFFF" opacity="0.22"/>`;
  return g;
}
const signA = (x, y, s, k = 1, rot = 0, o = {}) => at(x, y, s * k, priceSign19(o), rot);
const signB = (x, y, s, k = 1, rot = 0, o = {}) => at(x, y, s * k, priceSign19(Object.assign({ old: TX('antes', '12 €') }, o)), rot);

/* ===================== CEREBRO (icono, sin cara) ===================== */
const BRAIN_LOBES = [[-100, -38, 62], [-46, -78, 64], [46, -78, 64], [100, -38, 62], [-118, 26, 56], [118, 26, 56], [-62, 64, 58], [62, 64, 58], [0, 74, 50], [0, -10, 96]];
const BRAIN_GYRI = ['M-32 -112 q-26 12 -18 38 q6 20 -20 32', 'M-132 -18 q22 -8 32 14 q10 22 36 12', 'M-104 70 q16 -28 44 -14', 'M-64 -46 q-22 26 0 46 q16 16 -2 42', 'M-150 40 q14 6 10 24', 'M-30 98 q-6 -22 12 -34'];
function brain19(x, y, s, o = {}) {
  if (s <= 0.001) return '';
  const sw = SW / s;
  let a = '', b = '';
  BRAIN_LOBES.forEach(([cx, cy, r]) => { a += `<circle cx="${cx}" cy="${cy}" r="${r}"/>`; b += `<circle cx="${cx}" cy="${cy}" r="${r}"/>`; });
  let g = `<g transform="translate(12 12)" fill="${INK}">${a}</g>`;
  g += `<g fill="${INK}" stroke="${INK}" stroke-width="${f(sw * 2)}">${a}</g><g fill="${C.pink}">${b}</g>`;
  g += `<path d="M-60 112 Q0 126 60 112" fill="none" stroke="#E57399" stroke-width="${f(sw * 2.2)}" stroke-linecap="round" opacity="0.7"/>`;
  const gy = BRAIN_GYRI.map(d => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${f(sw * 0.8)}" stroke-linecap="round"/>`).join('');
  g += gy + `<g transform="scale(-1 1)">${gy}</g>`;
  g += `<path d="M0 -136 Q-12 -80 6 -30 Q-10 20 4 60 Q-6 90 0 112" fill="none" stroke="${INK}" stroke-width="${f(sw * 1.1)}" stroke-linecap="round"/>`;
  g += `<ellipse cx="-84" cy="-92" rx="24" ry="12" transform="rotate(-30 -84 -92)" fill="#FFFFFF" opacity="0.7"/>`;
  return at(x, y, s, g, o.rot || 0);
}
// gota de duda (azul) que salta del cerebro
function doubtDrops19(x, y, s, t) {
  let g = '';
  [[-1, -0.6], [1, -0.8], [-1.15, 0.1], [1.1, 0]].forEach(([dx, dy], i) => {
    const q = ((t * 1.3 + i * 0.27) % 1);
    const px = x + dx * (150 + 90 * q) * s, py = y + dy * 110 * s + 120 * q * q * s - 40 * s;
    const r = 26 * s * (1 - 0.3 * q);
    const d = `M0 ${-r * 1.7} Q${r * 0.9} ${-r * 0.2} ${r} ${r * 0.25} A${r} ${r} 0 0 1 ${-r} ${r * 0.25} Q${-r * 0.9} ${-r * 0.2} 0 ${-r * 1.7}Z`;
    g += `<g transform="translate(${f(px)} ${f(py)}) rotate(${f(dx * 30)})" opacity="${f(1 - q * q)}"><path d="${d}" fill="${K19.drop}" ${st19(0.7)}/><circle cx="${f(-r * 0.35)}" cy="${f(-r * 0.1)}" r="${f(r * 0.22)}" fill="#FFFFFF"/></g>`;
  });
  return g;
}

/* ===================== ETIQUETA DE PRECIO ===================== */
function tag19(wd, ht, str, o = {}) {
  const x0 = -wd / 2, n = ht * 0.42;
  const d = `M${x0 + n} ${-ht / 2} H${wd / 2 - 18} Q${wd / 2} ${-ht / 2} ${wd / 2} ${-ht / 2 + 18} V${ht / 2 - 18} Q${wd / 2} ${ht / 2} ${wd / 2 - 18} ${ht / 2} H${x0 + n} L${x0} 0Z`;
  let g = `<path d="${d}" transform="translate(${f(ht * 0.08)} ${f(ht * 0.08)})" fill="${INK}"/><path d="${d}" fill="${o.fill || '#FFFFFF'}" ${st19(1)}/>`;
  g += `<circle cx="${f(x0 + n * 0.7)}" cy="0" r="${f(ht * 0.09)}" fill="${o.hole || C.cream}" ${st19(0.7)}/>`;
  const sz = fit(str, ht * 0.62, wd - n - 40);
  g += text(str, n / 2 + 4, 4, { size: sz, fill: o.col || C.red, sw: SW * 1.4, sd: 4 });
  if (o.strike) { const tw = measure(str, sz); g += strike19(n / 2 - tw / 2 - 10, ht * 0.2, n / 2 + tw / 2 + 18, -ht * 0.22, o.strike, ht * 0.09); }
  return g;
}

/* ===================== BALANZA ===================== */
// pivote en (x,y); tilt en grados (positivo: baja el plato derecho)
function balance19(x, y, s, tilt, k, o = {}) {
  if (k <= 0.01) return '';
  const L = 250, drop = 150, a = tilt * PI / 180;
  let g = '';
  g += `<path d="M-120 330 L-80 290 H80 L120 330Z" fill="${C.wood}" ${st19(1)}/><rect x="-16" y="0" width="32" height="296" fill="${C.woodS}" ${st19(1)}/>`;
  const ends = [-1, 1].map(sd => [Math.cos(a) * L * sd, Math.sin(a) * L * sd]);
  g += `<g transform="rotate(${f(tilt)})"><rect x="${-L - 10}" y="-14" width="${2 * L + 20}" height="28" rx="14" fill="${C.yel}" ${st19(1)}/></g>`;
  g += `<circle r="30" fill="${C.red}" ${st19(1)}/><circle r="10" fill="#FFFFFF"/>`;
  ends.forEach(([ex, ey], i) => {
    const py = ey + drop;
    g += `<path d="M${f(ex)} ${f(ey)} L${f(ex - 92)} ${f(py)} M${f(ex)} ${f(ey)} L${f(ex + 92)} ${f(py)}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
    g += `<circle cx="${f(ex)}" cy="${f(ey)}" r="12" fill="${C.yel}" ${st19(0.8)}/>`;
    const cont = (i ? o.right : o.left);
    if (cont) g += `<g transform="translate(${f(ex)} ${f(py - 2)})">${cont}</g>`;
    g += `<path d="M${f(ex - 118)} ${f(py)} H${f(ex + 118)} Q${f(ex + 100)} ${f(py + 64)} ${f(ex)} ${f(py + 64)} Q${f(ex - 100)} ${f(py + 64)} ${f(ex - 118)} ${f(py)}Z" fill="${C.blue}" ${st19(1)}/>`;
  });
  return at(x, y, s * k, g);
}

/* ===================== ANCLA, CADENA Y AGUA ===================== */
// (0,0) = centro del ancla; arandela arriba en (0,-200); brazos abajo (y≈190)
const ANC = { ring: [0, -205], stock: -132, bottom: 196 };
function anchor19(x, y, s, rot = 0, sq = 1) {
  const thick = (d, wd, col) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${f(wd + SW * 2)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${wd}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const arms = 'M-158 52 Q-150 180 0 192 Q150 180 158 52';
  let g = `<g transform="translate(14 14)" opacity="0.25">${thick('M0 -165 V180', 40, INK)}${thick(arms, 40, INK)}</g>`;
  g += `<circle cx="0" cy="-205" r="40" fill="none" stroke="${INK}" stroke-width="${f(26 + SW * 2)}"/><circle cx="0" cy="-205" r="40" fill="none" stroke="${K19.anchor}" stroke-width="26"/>`;
  g += thick('M0 -165 V178', 42, K19.anchor);
  g += thick(arms, 40, K19.anchor);
  // puntas
  [-1, 1].forEach(sd => {
    g += `<path d="M${sd * 158} 6 L${sd * 196} 86 L${sd * 120} 76Z" fill="${K19.anchor}" ${st19(1)}/>`;
  });
  g += `<rect x="-118" y="${ANC.stock - 18}" width="236" height="36" rx="18" fill="${K19.anchor}" ${st19(1)}/>`;
  g += `<circle cx="-118" cy="${ANC.stock}" r="24" fill="${K19.anchor}" ${st19(1)}/><circle cx="118" cy="${ANC.stock}" r="24" fill="${K19.anchor}" ${st19(1)}/>`;
  g += `<path d="M-8 -150 V150" stroke="${K19.anchorL}" stroke-width="9" stroke-linecap="round"/><path d="M-120 100 Q-90 168 -30 180" fill="none" stroke="${K19.anchorL}" stroke-width="8" stroke-linecap="round"/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s * (2 - sq))} ${f(s * sq)})">${g}</g>`;
}
// cadena por una curva cuadrática (p0 -> p2 con control p1); k = parte dibujada
function chain19(p0, p1, p2, k) {
  if (k <= 0) return '';
  const P = u => [lerp(lerp(p0[0], p1[0], u), lerp(p1[0], p2[0], u), u), lerp(lerp(p0[1], p1[1], u), lerp(p1[1], p2[1], u), u)];
  let len = 0, prev = P(0);
  for (let i = 1; i <= 40; i++) { const q = P(i / 40); len += Math.hypot(q[0] - prev[0], q[1] - prev[1]); prev = q; }
  const n = Math.max(2, Math.round(len / 44)), m = Math.floor(n * clamp(k));
  let g = '';
  for (let i = 0; i <= m; i++) {
    const u = i / n, a = P(u), b = P(Math.min(1, u + 0.01)), ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / PI;
    const flat = i % 2;
    g += `<g transform="translate(${f(a[0])} ${f(a[1])}) rotate(${f(ang)})"><ellipse rx="30" ry="${flat ? 7 : 17}" fill="none" stroke="${INK}" stroke-width="${f(SW * 2.2)}"/><ellipse rx="30" ry="${flat ? 7 : 17}" fill="none" stroke="${K19.chain}" stroke-width="${f(SW * 0.9)}"/></g>`;
  }
  return g;
}
function water19(t, surf = 540) {
  let s = `<rect x="-400" y="-400" width="${W + 800}" height="${H + 800}" fill="${K19.waterL}"/>`;
  let d = `M-60 ${surf}`;
  for (let x = -60; x <= W + 60; x += 20) d += ` L${x} ${f(surf + 16 * Math.sin(x / 70 + t * 2.4) + 7 * Math.sin(x / 31 - t * 3.1))}`;
  s += `<path d="${d} V${H + 400} H-60Z" fill="${K19.water}"/><path d="${d}" fill="none" ${st19(1)}/>`;
  // ondas sueltas (rayitas) bajo la superficie
  for (let i = 0; i < 9; i++) {
    const x = ((i * 233 + t * (30 + i * 7)) % (W + 300)) - 150, y = surf + 120 + (i * 137) % 640;
    s += `<path d="M${f(x)} ${y} q30 -16 60 0 q30 16 60 0" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" stroke-linecap="round" opacity="0.8"/>`;
  }
  // burbujas
  for (let i = 0; i < 14; i++) {
    const q = ((t * (0.18 + 0.05 * (i % 4)) + hash(i) ) % 1), x = 60 + hash(i + 9) * 960 + 18 * Math.sin(t * 2 + i), y = lerp(1360, surf + 30, q);
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(8 + 10 * hash(i + 3))}" fill="#FFFFFF" opacity="0.65" ${st19(0.35)}/>`;
  }
  // fondo de arena
  s += `<path d="M-60 1330 Q270 1300 540 1330 T1140 1325 V${H + 400} H-60Z" fill="${K19.sand}" ${st19(1)}/>`;
  return s;
}

/* ===================== GRIETAS, SELLO «NO», CARTEL «REAL ✔» ===================== */
const CRACKS = ['M200 -310 L130 -200 L160 -130 L70 -40 L140 -8 L220 -20', 'M-220 -150 L-150 -120 L-120 -40 L-60 -70 L-20 -10', 'M-220 250 L-160 230 L-120 280 L-60 310', 'M130 -200 L60 -250 L20 -310', 'M220 160 L170 190 L190 250'];
function cracks19(k) {
  if (k <= 0) return '';
  return CRACKS.map((d, i) => {
    const kk = clamp(k * 1.6 - i * 0.2);
    return kk > 0 ? `<path d="${d}" pathLength="1" stroke-dasharray="${f(kk)} 1" fill="none" stroke="${INK}" stroke-width="${f(SW * (i ? 1.2 : 1.7))}" stroke-linecap="round" stroke-linejoin="round"/>` : '';
  }).join('');
}
function stampNo19(x, y, k, rot = -14) {
  if (k <= 0.01) return '';
  const wd = 380, ht = 220, str = TX('no', 'NO');
  let g = `<rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="34" fill="none" stroke="${C.red}" stroke-width="22"/>`;
  g += `<rect x="${-wd / 2 + 24}" y="${-ht / 2 + 24}" width="${wd - 48}" height="${ht - 48}" rx="20" fill="none" stroke="${C.red}" stroke-width="7"/>`;
  g += text(str, 0, 10, { size: 190, font: 'G', fill: C.red, stroke: C.dred, sw: SW * 0.8, shadow: false, ls: 6 });
  return at(x, y, k, g, rot);
}
function checkMark19(x, y, r, col = '#FFFFFF') {
  const d = `M${f(x - r * 0.55)} ${f(y)} L${f(x - r * 0.15)} ${f(y + r * 0.42)} L${f(x + r * 0.6)} ${f(y - r * 0.45)}`;
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${f(r * 0.42)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${f(r * 0.2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function realSign19(wd = 400, ht = 150) {
  const str = TX('real', 'REAL');
  let g = `<rect x="${-wd / 2 + 12}" y="${-ht / 2 + 12}" width="${wd}" height="${ht}" rx="26" fill="${INK}"/>`;
  g += `<rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="26" fill="${K19.ok}" ${st19(1.1)}/>`;
  g += `<rect x="${-wd / 2 + 14}" y="${-ht / 2 + 14}" width="${wd - 28}" height="${ht - 28}" rx="16" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 0.5)}" stroke-dasharray="18 12" opacity="0.7"/>`;
  g += text(str, -48, 6, { size: 108, sw: SW * 1.8, sd: 6 });
  g += checkMark19(112, 2, 70);
  return g;
}

/* ===================== MÓVIL: FORMULARIO Y TARJETA DE OFERTA ===================== */
const typed = (str, t, a, b) => str.slice(0, Math.round(str.length * seg(t, a, b)));
function field19(x, y, wd, ht, label, value, o = {}) {
  let g = text(label, x + 6, y - 32, { size: 40, anchor: 'start', fill: INK, stroke: null, shadow: false });
  if (o.halo > 0) {
    const p = 10 + 8 * o.halo;
    g += `<rect x="${f(x - p)}" y="${f(y - p)}" width="${f(wd + 2 * p)}" height="${f(ht + 2 * p)}" rx="${f(22 + p)}" fill="none" stroke="${C.red}" stroke-width="${f(10 + 6 * o.halo)}" opacity="${f(0.35 + 0.25 * o.halo)}"/>`;
    g += `<rect x="${x - 8}" y="${y - 8}" width="${wd + 16}" height="${ht + 16}" rx="26" fill="none" stroke="${C.red}" stroke-width="9"/>`;
  }
  g += `<rect x="${x}" y="${y}" width="${wd}" height="${ht}" rx="18" fill="#FFFFFF" ${st19(0.8)}/>`;
  g += text(value, x + 26, y + ht / 2 + 2, { size: 50, anchor: 'start', fill: o.col || INK, stroke: null, shadow: false });
  if (o.cursor) g += `<rect x="${f(x + 32 + measure(value, 50))}" y="${y + 20}" width="5" height="${ht - 40}" fill="${INK}"/>`;
  return g;
}
function formBody19(t, c) {
  return (sx, sy, sw_, sh_) => {
    const x = sx + 34, wd = sw_ - 68;
    let g = text(TX('nueva', 'Nueva oferta'), sx + sw_ / 2, sy + 58, { size: 58, fill: INK, stroke: null, shadow: false });
    // foto
    g += `<rect x="${x}" y="${sy + 100}" width="${wd}" height="180" rx="22" fill="#FFF1C9" ${st19(0.8)}/>` + cheesecake19(sx + sw_ / 2, sy + 202, 0.62);
    g += field19(x, sy + 345, wd, 84, TX('fTitulo', 'Título'), TX('vTitulo', 'Tarta de queso'));
    const hp = t >= c.halo1 ? pop(t, c.halo1, 0.4) * (0.75 + 0.25 * Math.sin((t - c.halo1) * 8)) : 0;
    const ha = t >= c.halo2 ? pop(t, c.halo2, 0.4) * (0.75 + 0.25 * Math.sin((t - c.halo2) * 8 + 1)) : 0;
    const vP = typed(TX('precio', '7,20 €'), t, c.type1[0], c.type1[1]), vA = typed(TX('antes', '12 €'), t, c.type2[0], c.type2[1]);
    const blinkOn = Math.floor(t * 3) % 2 === 0;
    g += field19(x, sy + 505, wd, 84, TX('fPrecio', 'Precio'), vP, { halo: hp, col: C.red, cursor: t >= c.type1[0] && t < c.type2[0] && blinkOn });
    g += field19(x, sy + 665, wd, 84, TX('fAntes', 'Precio antes'), vA, { halo: ha, col: K19.old, cursor: t >= c.type2[0] && t < c.press && blinkOn });
    // botón «Publicar»
    const pr = t >= c.press ? 1 - 0.08 * Math.max(0, damp(t - c.press, 18, 7)) : 1;
    const bw = wd, by = sy + 820, lbl = TX('publicar', 'Publicar');
    g += at(sx + sw_ / 2, by + 50, pr, `<rect x="${-bw / 2 + 8}" y="-42" width="${bw}" height="100" rx="50" fill="${INK}"/><rect x="${-bw / 2}" y="-50" width="${bw}" height="100" rx="50" fill="${t >= c.press ? C.dred : C.red}" ${st19(0.9)}/>` + text(lbl, 0, 2, { size: 56, sw: SW * 1.4, sd: 4 }));
    return g;
  };
}
// tarjeta de oferta publicada: 300 x 360 centrada en (0,0)
function offerCard19(t = 0) {
  const x0 = -150, y0 = -180, wd = 300, ht = 360, hh = 46;
  let g = `<rect x="${x0 + 8}" y="${y0 + 8}" width="${wd}" height="${ht}" rx="22" fill="${INK}"/>`;
  g += `<rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="22" fill="#FFFFFF"/>`;
  g += `<path d="M${x0} ${y0 + hh} V${y0 + 22} Q${x0} ${y0} ${x0 + 22} ${y0} H${x0 + wd - 22} Q${x0 + wd} ${y0} ${x0 + wd} ${y0 + 22} V${y0 + hh}Z" fill="${C.red}"/>`;
  g += `<line x1="${x0}" y1="${y0 + hh}" x2="${x0 + wd}" y2="${y0 + hh}" ${st19(0.6)}/>`;
  g += `<circle cx="${x0 + 26}" cy="${y0 + 23}" r="16" fill="#FFFFFF" ${st19(0.45)}/>` + logoI13(x0 + 26, y0 + 23, 32);
  g += text(TX('oferta', 'Oferta'), x0 + 52, y0 + 24, { size: 28, font: 'G', anchor: 'start', sw: SW * 0.7, sd: 2, ls: 1 });
  g += `<rect x="${x0 + 14}" y="${y0 + hh + 12}" width="${wd - 28}" height="140" rx="14" fill="#FFF1C9" ${st19(0.5)}/>` + cheesecake19(0, y0 + hh + 88, 0.5);
  g += text(TX('vTitulo', 'Tarta de queso'), 0, y0 + hh + 184, { size: 34, fill: INK, stroke: null, shadow: false });
  const ps = TX('precio', '7,20 €'), as = TX('antes', '12 €');
  g += text(ps, -44, y0 + hh + 250, { size: 60, fill: C.red, sw: SW * 1.1, sd: 3 });
  const aw = measure(as, 42);
  g += text(as, 96, y0 + hh + 252, { size: 42, fill: K19.old, stroke: null, shadow: false });
  g += strike19(96 - aw / 2 - 6, y0 + hh + 260, 96 + aw / 2 + 6, y0 + hh + 244, 1, 5);
  g += `<rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="22" fill="none" ${st19(0.8)}/>`;
  return g;
}
function bell19(x, y, r) {
  return `<g transform="translate(${f(x)} ${f(y)})"><circle cx="0" cy="${f(r * 0.78)}" r="${f(r * 0.22)}" fill="${C.dred}" ${st19(0.6)}/>
    <path d="M${f(-r * 0.8)} ${f(r * 0.62)} Q${f(-r * 0.7)} ${f(r * 0.3)} ${f(-r * 0.62)} ${f(-r * 0.2)} Q${f(-r * 0.5)} ${f(-r * 0.78)} 0 ${f(-r * 0.8)} Q${f(r * 0.5)} ${f(-r * 0.78)} ${f(r * 0.62)} ${f(-r * 0.2)} Q${f(r * 0.7)} ${f(r * 0.3)} ${f(r * 0.8)} ${f(r * 0.62)}Z" fill="${C.yel}" ${st19(0.8)}/>
    <circle cx="0" cy="${f(-r * 0.86)}" r="${f(r * 0.12)}" fill="${C.yel}" ${st19(0.5)}/></g>`;
}
// icono que vuela: 0 chat (verde), 1 campana, 2 corazón
function flyIcon19(kind, x, y, s, rot = 0) {
  let g = '';
  if (kind === 0) g = `<circle cx="7" cy="7" r="54" fill="${INK}"/><circle r="54" fill="${WA_GREEN}" ${st19(0.9)}/>` + chatIcon17(0, -4, 30);
  else if (kind === 1) g = `<circle cx="7" cy="7" r="54" fill="${INK}"/><circle r="54" fill="#FFFFFF" ${st19(0.9)}/>` + bell19(0, 0, 34);
  else g = heart17(0, 4, 40, 1, C.red);
  return at(x, y, s, g, rot);
}
// móvil genérico de cliente (sin persona): 130 x 220 centrado; lit 0..1 = pantalla encendida con el icono recibido
function clientPhone19(x, y, k, lit, kind, t) {
  if (k <= 0.01) return '';
  const wd = 130, ht = 220;
  let g = `<rect x="${-wd / 2 + 9}" y="${-ht / 2 + 9}" width="${wd}" height="${ht}" rx="24" fill="${INK}"/><rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="24" fill="${INK}" ${st19(0.8)}/>`;
  g += `<rect x="${-wd / 2 + 10}" y="${-ht / 2 + 14}" width="${wd - 20}" height="${ht - 28}" rx="14" fill="${lit > 0 ? '#FFFFFF' : C.glass}"/>`;
  g += `<rect x="-18" y="${-ht / 2 + 4}" width="36" height="6" rx="3" fill="#3A3434"/>`;
  if (lit > 0) {
    g += flyIcon19(kind, 0, -14, 0.62 * pop(lit, 0, 0.4));
    g += `<rect x="-38" y="56" width="76" height="12" rx="6" fill="#E3DCDA"/><rect x="-28" y="76" width="56" height="10" rx="5" fill="#E3DCDA"/>`;
    g += at(wd / 2 - 6, -ht / 2 + 6, pop(lit, 0.1, 0.4), `<circle r="24" fill="${C.red}" ${st19(0.7)}/>` + text('1', 0, 2, { size: 32, sw: SW * 0.8, sd: 2 }));
  }
  const wob = lit > 0 ? 6 * Math.max(0, damp(lit, 20, 5)) * Math.sin(lit * 40) : 0;
  return at(x, y, k, g, wob);
}

/* ===================== ESCENAS ===================== */

/* ---------- 0) HOOK: dos mitades, dos carteles; caja roja «DOS CARTELES, MISMO PRODUCTO / ¿CUÁL VENDE MÁS?» ---------- */
S[0] = (t, T, sc) => {
  const c = cues(sc, { a: 0, b: 0.12, box: 0.4, vs: 0.75 });
  const z = comicZoom(t, 1.08);
  const L = cam(z, 270, 900, wall19(T) + signA(270, 905, 0.96, pop(t, c.a, 0.45), -2));
  const R = cam(z, 810, 900, wall19(T) + signB(810, 905, 0.96, pop(t, c.b, 0.45), 2));
  let s = split19(L, R);
  s += burst(540, 1260, 70, t * 30, C.yel) + text(TX('vs', 'VS'), 540, 1262, { size: 66, font: 'G', sw: SW * 1.4, sd: 4 });
  const k = pop(t, c.box, 0.5);
  s += at(540, 340, k, redSign17(1000, 270, [[TX('h1', 'DOS CARTELES, MISMO PRODUCTO'), 70, -56], [TX('h2', '¿CUÁL VENDE MÁS?'), 104, 52]]), lerp(-6, -2, clamp(k)));
  return s;
};

/* ---------- 1) LOS DOS CARTELES: cada uno a pantalla completa (A izq., B der., C izq.) y luego juntos con flecha ---------- */
const INT19 = { win: [80, 230, 380, 300], counter: 1360 };
S[1] = (t, T, sc) => {
  const [shot, u] = shotOf(sc, t);
  if (shot === 'D') {
    const c = cues(sc, { arrow: 0.35 });
    let w = wall19(T, INT19);
    w += signA(275, 880, 0.94, 1, -2) + signB(805, 880, 0.94, 1, 2, { glint: seg(u, c.arrow + 0.3, c.arrow + 1.0) });
    let s = cam(comicZoom(u, 1.1), 540, 900, w);
    const ka = pop(u, c.arrow, 0.45), pulse = 1 + 0.1 * Math.max(0, Math.sin((u - c.arrow) * 2 * PI * 1.6));
    s += bigArrow(805, 400 + 18 * Math.sin((u - c.arrow) * 2 * PI * 1.6), 0.82 * pulse, ka, 90);
    if (u > c.arrow + 0.3) {
      const kk = pop(u, c.arrow + 0.3, 0.4) * (0.8 + 0.2 * Math.sin(u * 9));
      s += sparkle(1010, 620, 36, kk) + sparkle(600, 1180, 28, kk, C.yel) + sparkle(1015, 1180, 24, kk);
    }
    return s;
  }
  const right = shot === 'B';
  let w = wall19(T, INT19);
  const o = right ? { strike: seg(u, 0.25, 0.6) } : {};
  w += (right ? signB : signA)(540, 840, 1.72, 1, right ? 1.5 : -1.5, o);
  return cam(comicZoom(u, 1.12) * lerp(1, 1.04, seg(u, 0, 1.5)), 540, 840, w);
};

/* ---------- 2) EL CEREBRO: «NO CALCULA. COMPARA.»; + − = que se desvanecen; balanza que se inclina ---------- */
S[2] = (t, T, sc) => {
  const c = cues(sc, { brain: 0.15, txt: 0.85, sym: 1.5, bal: 3.1, tilt: 3.7 });
  let w = wall19(T, { fill: '#FFF5F3' }) + `<g opacity="0.35">${rays(540, 560, 16, t * 6, '#FFFFFF')}</g>`;
  let s = cam(comicZoom(t, 1.1), 540, 800, w);
  const kb = pop(t, c.brain, 0.55), think = 1 + 0.025 * Math.sin(t * 2 * PI * 0.9);
  s += brain19(540, 560 + 8 * Math.sin(t * 2.2), 1.55 * kb * think, { rot: 3 * Math.sin(t * 1.3) });
  // símbolos de cálculo que aparecen y se desvanecen
  [['+', 170, 330, -12], ['−', 920, 360, 10], ['=', 150, 760, 8], ['+', 930, 780, -8], ['−', 540, 250, 0]].forEach(([ch, x, y, r], i) => {
    const t0 = c.sym + i * 0.22, fade = 1 - seg(t, t0 + 0.7, t0 + 1.3);
    if (t < t0 || fade <= 0) return;
    s += `<g opacity="${f(fade)}">${at(x, y - 40 * seg(t, t0, t0 + 1.3), pop(t, t0, 0.4), text(ch, 0, 0, { size: 170, font: 'G', fill: C.yel, sw: SW * 1.8, sd: 6 }), r)}</g>`;
  });
  // balanza: el plato del «12 €» baja
  const tilt = t < c.tilt ? 0 : 13 * (1 - Math.max(0, damp(t - c.tilt, 9, 3.2)) * 1);
  s += balance19(540, 920, 0.92, tilt, pop(t, c.bal, 0.5), {
    left: at(0, -66, 1.0, tag19(230, 100, TX('precio', '7,20 €'))),
    right: at(0, -66, 1.0, tag19(200, 100, TX('antes', '12 €'), { fill: C.yel, col: INK }))
  });
  s += strip15(TX('s2', 'NO CALCULA. COMPARA.'), 540, 1300, pop(t, c.txt, 0.5), -2, { size: 92, h: 140, w: 980 });
  return s;
};

/* ---------- 3) SIN REFERENCIA: izq. «?» + cerebro con gotas de duda · der. 12 € → 7,20 € con check y brillo; «AHORRAS» ---------- */
S[3] = (t, T, sc) => {
  const c = cues(sc, { q: 0.5, brain: 1.1, strike: 1.8, arrow: 2.5, newp: 3.0, check: 3.5, glint: 3.7, save: 4.6 });
  const z = comicZoom(t, 1.08);
  // izquierda: apagada, sin referencia
  let L = wall19(T, { fill: K19.muted, dot: K19.mutedDot }) + signA(270, 780, 0.82, 1, -2, { dim: true });
  L = cam(z, 270, 900, L);
  const kq = pop(t, c.q, 0.5), qp = 1 + 0.1 * Math.sin((t - c.q) * 2 * PI * 1.3);
  L += at(270, 400, kq * qp, text('?', 0, 0, { size: 380, font: 'G', fill: C.yel, sw: SW * 2.4, sd: 10 }), 8 * Math.sin(t * 2.4));
  const kbr = pop(t, c.brain, 0.5);
  L += brain19(270, 1220, 0.5 * kbr, { rot: 6 * Math.sin(t * 5) });
  if (t > c.brain + 0.3) L += doubtDrops19(270, 1220, 0.9, t - c.brain);
  // derecha: con referencia
  let R = wall19(T) + `<g opacity="0.45">${rays(810, 780, 14, t * 10, '#FFFFFF')}</g>`;
  R += signB(810, 780, 0.82, 1, 2, { strike: seg(t, c.strike, c.strike + 0.35), arrow: pop(t, c.arrow, 0.45), newK: t < c.newp ? 0.75 : 1 + 0.18 * Math.max(0, damp(t - c.newp, 12, 5)), glint: seg(t, c.glint, c.glint + 0.7) });
  R = cam(z, 810, 900, R);
  if (t >= c.check) {
    R += checkCircle(990, 480, 66, pop(t, c.check, 0.45));
    const kk = pop(t, c.check + 0.15, 0.4) * (0.8 + 0.2 * Math.sin(t * 9));
    R += sparkle(640, 940, 34, kk) + sparkle(1000, 1010, 28, kk, C.yel) + sparkle(600, 560, 24, kk, C.yel);
  }
  // contador «AHORRAS» (sin cifra)
  const ks = pop(t, c.save, 0.5);
  if (ks > 0.01) {
    let g = `<rect x="-210" y="-60" width="420" height="190" rx="28" transform="translate(12 12)" fill="${INK}"/><rect x="-210" y="-60" width="420" height="190" rx="28" fill="#FFFFFF" ${st19(1.1)}/>`;
    g += `<path d="M-210 30 V-32 Q-210 -60 -182 -60 H182 Q210 -60 210 -32 V30Z" fill="${C.red}"/><line x1="-210" y1="30" x2="210" y2="30" ${st19(0.8)}/>`;
    g += text(TX('ahorras', 'AHORRAS'), 0, -12, { size: 76, sw: SW * 1.6, sd: 5 });
    [-110, 0, 110].forEach((x, i) => {
      const r = (t * 14 + i * 3) % 1;
      g += `<rect x="${x - 44}" y="46" width="88" height="68" rx="12" fill="${C.cream}" ${st19(0.7)}/><rect x="${x - 26}" y="${f(76 + 8 * Math.sin(r * 2 * PI))}" width="52" height="9" rx="4" fill="${K19.old}"/>`;
    });
    R += at(810, 1230, ks, g, 2);
  }
  return split19(L, R);
};

/* ---------- 4) EL EFECTO ANCLA: el ancla cae sobre el «12 €» y lo ata con una cadena; el «7,20 €» flota al lado ---------- */
S[4] = (t, T, sc) => {
  const c = cues(sc, { tag: 0.1, fall: 0.5, hit: 0.95, chain: 1.4, txt: 2.4, sub: 3.0, first: 3.6, float: 4.4 });
  let w = water19(T);
  // etiqueta «12 €» en el fondo
  const TAG = [350, 1205], sq = squashAt(t, c.hit);
  w += at(TAG[0], TAG[1], pop(t, c.tag, 0.45), `<g transform="scale(${f(2 - sq)} ${f(sq)})">${tag19(400, 180, TX('antes', '12 €'), { fill: C.yel, col: INK, hole: K19.water })}</g>`, -5);
  // ancla
  const AY = 860, ay = dropY(t, c.fall, AY, -500, c.hit - c.fall, 45);
  if (ay !== null) w += anchor19(TAG[0] + 10, ay, 1, -4, squashAt(t, c.hit) * 0.5 + 0.5);
  // cadena del agujero de la etiqueta al ancla
  const hole = [TAG[0] - 200 + 180 * 0.42 * 0.7, TAG[1] - 10];
  w += chain19(hole, [90, 1000], [TAG[0] - 4, AY - 150], easeOut(seg(t, c.chain, c.chain + 0.8)));
  // badge «1º»
  w += at(560, 1110, pop(t, c.first, 0.45), `<circle cx="7" cy="7" r="62" fill="${INK}"/><circle r="62" fill="${C.red}" ${st19(1)}/>` + text(TX('primero', '1º'), 0, 4, { size: 70, sw: SW * 1.4, sd: 4 }), -8);
  // «7,20 €» flotando
  if (t >= c.float) {
    const u = t - c.float, fy = lerp(1300, 820, easeOut(u / 0.9)) + 26 * Math.sin(u * 2.2);
    w += at(800, fy, pop(t, c.float, 0.5), tag19(340, 150, TX('precio', '7,20 €')), 6 * Math.sin(u * 1.7));
    for (let i = 0; i < 4; i++) { const q = (u * 0.9 + i / 4) % 1; w += `<circle cx="${f(800 + 120 * Math.sin(i * 2.1 + u))}" cy="${f(fy - 90 - 200 * q)}" r="${f(10 + 6 * (i % 2))}" fill="#FFFFFF" opacity="${f(0.8 * (1 - q))}" ${st19(0.4)}/>`; }
  }
  const shk = shakeAt(t, c.hit, 22), jx = shk * Math.sin(t * 90), jy = shk * 0.6 * Math.cos(t * 77);
  let s = `<g transform="translate(${f(jx)} ${f(jy)})">` + cam(comicZoom(t, 1.08) * bumpZ(t, [c.hit], 0.04), 540, 960, w);
  if (t >= c.hit && t < c.hit + 0.6) { const kp = pop(t, c.hit, 0.25) * (1 - seg(t, c.hit + 0.3, c.hit + 0.6)); s += puff(160, 1150, 52, kp) + puff(560, 1160, 46, kp); }
  s += `</g>`;
  s += strip15(TX('s4', 'EFECTO ANCLA'), 540, 290, pop(t, c.txt, 0.5), -3, { size: 118, h: 158, w: 820 });
  s += bigT(TX('s4b', 'el primer número manda'), 540, 432, 66, pop(t, c.sub, 0.5), -2, { sw: SW * 1.8, sd: 6 });
  return s;
};

/* ---------- 5) OJO: TIENE QUE SER REAL ---------- */
S[5] = (t, T, sc) => {
  const c = cues(sc, { crack: 0.4, stamp: 1.6, real: 2.6, txt: 3.4 });
  let w = wall19(T, { counter: 1360 });
  // cartel falso «ANTES 99 € / AHORA 7,20 €» que se agrieta
  const ck = seg(t, c.crack, c.crack + 1.0), tremble = t >= c.crack && t < c.crack + 1.1 ? 5 * Math.sin(t * 70) : 0;
  w += at(285 + tremble, 830, 0.86, priceSign19({ old: TX('falsoAntes', 'ANTES 99 €'), newStr: TX('falsoAhora', 'AHORA 7,20 €'), extra: cracks19(ck) }), -3 + ck * 4 + tremble * 0.2);
  // cartel normal
  w += signB(800, 780, 0.72, 1, 2);
  // cartel verde «REAL ✔» que cae al lado
  const ry = dropY(t, c.real, 1180, -400, 0.4, 60);
  if (ry !== null) w += at(800, ry, 0.9, realSign19(), 3);
  const shk = shakeAt(t, c.stamp, 20) + shakeAt(t, c.real + 0.4, 10), jx = shk * Math.sin(t * 90), jy = shk * 0.6 * Math.cos(t * 77);
  let s = `<g transform="translate(${f(jx)} ${f(jy)})">` + cam(comicZoom(t, 1.08) * bumpZ(t, [c.stamp, c.real + 0.4], 0.025), 540, 900, w);
  // sello rojo «NO» que cae sobre el cartel falso
  if (t >= c.stamp - 0.25) {
    const u = t - c.stamp, k = u < 0 ? lerp(2.6, 1, Math.pow(1 + u / 0.25, 2)) : 1 + 0.08 * Math.max(0, damp(u, 18, 6));
    s += `<g opacity="${f(u < 0 ? 0.5 + 0.5 * (1 + u / 0.25) : 1)}">${stampNo19(285, 640, k, -14)}</g>`;
    if (u >= 0 && u < 0.3) s += `<g opacity="${f(1 - u / 0.3)}">${impactLines(285, 640, t, 26, 300)}</g>`;
  }
  if (t >= c.real + 0.4) {
    const kk = pop(t, c.real + 0.45, 0.4) * (0.8 + 0.2 * Math.sin(t * 9));
    s += sparkle(600, 1100, 32, kk, C.yel) + sparkle(1020, 1090, 28, kk) + sparkle(1000, 1290, 22, kk, C.yel);
  }
  s += `</g>`;
  s += at(540, 330, pop(t, c.txt, 0.5), redSign17(1000, 250, [[TX('s5a', 'EL PRECIO DE ANTES'), 88, -50], [TX('s5b', 'TIENE QUE SER REAL'), 88, 54]]), -2);
  return s;
};

/* ---------- 6) EN ESCAPARATE: formulario «Precio» / «Precio antes» con halo (A); oferta publicada y avisos a clientes (B) ---------- */
S[6] = (t, T, sc) => {
  const [shot, u] = shotOf(sc, t);
  if (shot === 'A') {
    const c = cues(sc, { phone: 0, type1: [0.35, 0.85], halo1: 0.55, type2: [1.05, 1.45], halo2: 1.25, press: 2.25 });
    let w = wall19(T, { fill: '#FCE4E1' });
    let s = cam(comicZoom(u, 1.08), 540, 900, w);
    const P = { X: 150, Y: 222, PW: 780, PH: 1160 };
    s += portalPhone(P.X, P.Y + 4 * Math.sin(T * 1.8), P.PW, P.PH, formBody19(u, c), { hh: 150 });
    if (u >= c.press) {
      const kk = pop(u, c.press, 0.35);
      s += sparkle(170, 1240, 34, kk) + sparkle(910, 1240, 30, kk, C.yel);
    }
    return s;
  }
  const c = cues(sc, { toast: 0.15, fly: 0.7 });
  let w = wall19(T) + `<g opacity="0.4">${rays(540, 740, 16, u * 10, '#FFFFFF')}</g>`;
  let s = cam(comicZoom(u, 1.1), 540, 800, w);
  const P = { X: 300, Y: 320, PW: 480, PH: 840 }, bob = 5 * Math.sin(T * 1.8);
  const kc = 1 + 0.12 * Math.max(0, damp(u - 0.05, 12, 5));
  s += portalPhone(P.X, P.Y + bob, P.PW, P.PH, (sx, sy, sw_, sh_) => at(sx + sw_ / 2, sy + sh_ / 2 - 10, 1.38 * kc, offerCard19(u)), { hh: 130 });
  s += whoPill(TX('publicada', '¡Publicada!'), 540, 250, pop(u, c.toast, 0.45), { size: 50, fill: K19.ok, col: '#FFFFFF' });
  // avisos que vuelan desde el móvil hacia los móviles de clientes
  const CL = [[120, 470], [960, 470], [120, 860], [960, 860], [120, 1250], [960, 1250]];
  const from = [540, 900 + bob];
  CL.forEach(([x, y], i) => {
    const kind = i % 3, t0 = c.fly + i * 0.28, d = 0.6;
    const lit = u - t0 - d;
    s += clientPhone19(x, y, pop(u, 0.2 + i * 0.06, 0.4), lit > 0 ? lit : 0, kind, u);
    if (u >= t0 && u < t0 + d) {
      const q = easeInOut((u - t0) / d), mx = (from[0] + x) / 2, my = Math.min(from[1], y) - 260;
      const px = lerp(lerp(from[0], mx, q), lerp(mx, x, q), q), py = lerp(lerp(from[1], my, q), lerp(my, y, q), q);
      s += flyIcon19(kind, px, py, 0.9 * (0.6 + 0.4 * Math.sin(q * PI)), (x < 540 ? -1 : 1) * 20 * q);
    }
  });
  // corazones que siguen saliendo
  for (let i = 0; i < 5; i++) {
    const q = ((u - 1.2) * 0.7 + i / 5) % 1;
    if (u < 1.2 + i * 0.25) continue;
    const sd = i % 2 ? 1 : -1;
    s += `<g opacity="${f(1 - q)}">${heart17(540 + sd * (250 + 40 * (i % 3) + 50 * q), 520 - 220 * q, 26 + 4 * (i % 3), 1, i % 2 ? C.pink : C.red, 12 * sd)}</g>`;
  }
  return s;
};

/* ---------- 7) CTA: «¿TIENES UN COMERCIO?», botón «COMENTA: ALTA», «Enlace al formulario en la descripción» ---------- */
S[7] = (t, T, sc) => {
  const c = cues(sc, { board: 0.1, btn: 0.5, link: 0.95, flash: 0.5 });
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 700, 18, t * 7, C.dred);
  const pulse = 1 + 0.025 * Math.sin(t * 2 * PI * 1.1);
  // cartel blanco
  const kb = pop(t, c.board, 0.5);
  let g = `<rect x="-460" y="-170" width="920" height="340" rx="36" transform="translate(16 16)" fill="${INK}"/><rect x="-460" y="-170" width="920" height="340" rx="36" fill="#FFFFFF" ${st19(1.2)}/>`;
  g += `<rect x="-440" y="-150" width="880" height="300" rx="24" fill="none" stroke="${C.red}" stroke-width="${f(SW * 0.6)}" stroke-dasharray="22 14" opacity="0.7"/>`;
  g += text(TX('s7a', '¿TIENES UN'), 0, -62, { size: 118, fill: C.red, sw: SW * 2, sd: 7 }) + text(TX('s7b', 'COMERCIO?'), 0, 70, { size: 132, fill: C.red, sw: SW * 2, sd: 7 });
  s += at(540, 470, kb * pulse, g, lerp(-6, -2, clamp(kb)));
  // botón blanco «COMENTA: ALTA»
  const kbt = pop(t, c.btn, 0.5), press = t > c.btn + 1.2 ? 1 - 0.05 * Math.max(0, Math.sin((t - c.btn - 1.2) * 2 * PI * 0.8)) : 1;
  const bs = TX('s7c', 'COMENTA: ALTA');
  let b = `<rect x="-420" y="-88" width="840" height="176" rx="88" transform="translate(12 12)" fill="${INK}"/><rect x="-420" y="-88" width="840" height="176" rx="88" fill="#FFFFFF" ${st19(1.2)}/>`;
  b += text(bs, 0, 6, { size: fit(bs, 112, 740), fill: C.red, sw: SW * 2, sd: 6 });
  s += at(540, 820, kbt * press, b, 1.5);
  // enlace
  const kl = pop(t, c.link, 0.5);
  s += bigT(TX('s7d', 'Enlace al formulario'), 540, 1040, 80, kl, -1, { sw: SW * 2, sd: 7 });
  s += bigT(TX('s7e', 'en la descripción'), 540, 1140, 80, pop(t, c.link + 0.12, 0.5), -1, { sw: SW * 2, sd: 7 });
  s += arrowDown17(540, 1215, 80, pop(t, c.link + 0.3, 0.45), t);
  // destello
  if (t >= c.flash) {
    const u = t - c.flash;
    if (u < 0.3) s += `<rect width="${W}" height="${H}" fill="#FFFFFF" opacity="${f(0.6 * (1 - u / 0.3))}"/>`;
    [[110, 300, 48], [970, 340, 40], [90, 700, 30], [990, 980, 36], [140, 1180, 28]].forEach(([x, y, r], i) => {
      s += sparkle(x, y, r, pop(t, c.flash + 0.05 * i, 0.4) * (0.75 + 0.25 * Math.sin(u * 8 + i * 1.7)), i % 2 ? C.yel : '#FFFFFF');
    });
  }
  return s;
};

/* ---------- 8) CIERRE: pantalla roja, logo blanco con rebote, «Escaparate de Tudela», web ---------- */
S[8] = (t, T, sc) => {
  const c = cues(sc, { logo: 0, sub: 0.4, url: 0.65 });
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 680, 16, t * 8, C.dred);
  const pulse = 1 + 0.03 * Math.sin(t * 2 * PI * 1.1);
  const kl = pop(t, c.logo, 0.5);
  // logo_blanco.png (1000x1000 de la raíz, fondo quitado en assets/logo_blanco_t.png)
  s += at(540, 660, pulse, logoBadge(0, 6 * Math.sin(t * 3), 800, lerp(-10, 0, clamp(kl)), kl, 'logoW'));
  s += bigT(TX('marca', 'Escaparate de Tudela'), 540, 1150, 96, pop(t, c.sub, 0.5) * pulse, -2, { maxW: 960 });
  s += whoPill(TX('web', 'escaparatetudela.es'), 540, 1290, pop(t, c.url, 0.5), { size: 56, col: INK });
  return s;
};

/* ---------- STORY (encuesta): «¿SABES QUÉ ES EL EFECTO ANCLA?» (vertical 9:16, ~8 s). Zonas seguras de las stories:
   nada importante por encima de y=250 ni por debajo de y=1560. Hueco libre y=1080..1480 para la encuesta de Instagram. ---------- */
S[20] = (t, T, sc) => {
  const c = cues(sc, { box: 0.2, q2: 0.4, fall: 1.0, hit: 1.45, tags: 1.9, vote: 2.6 });
  let w = water19(T, 640);
  const ay = dropY(t, c.fall, 830, -300, c.hit - c.fall, 40);
  if (ay !== null) w += anchor19(540, ay, 0.52, -4, squashAt(t, c.hit) * 0.5 + 0.5);
  w += at(225, 850 + 14 * Math.sin(t * 2), pop(t, c.tags, 0.45), tag19(250, 112, TX('antes', '12 €'), { fill: C.yel, col: INK, hole: K19.water }), -8);
  w += at(860, 830 + 14 * Math.sin(t * 2 + 1.5), pop(t, c.tags + 0.15, 0.45), tag19(270, 112, TX('precio', '7,20 €')), 7);
  const shk = shakeAt(t, c.hit, 14), jx = shk * Math.sin(t * 90), jy = shk * 0.6 * Math.cos(t * 77);
  let s = `<g transform="translate(${f(jx)} ${f(jy)})">` + cam(comicZoom(t, 1.08) * bumpZ(t, [c.hit], 0.03), 540, 960, w);
  if (t >= c.hit && t < c.hit + 0.6) { const kp = pop(t, c.hit, 0.25) * (1 - seg(t, c.hit + 0.3, c.hit + 0.6)); s += puff(400, 960, 36, kp) + puff(690, 960, 32, kp); }
  s += `</g>`;
  const k = pop(t, c.box, 0.5);
  s += at(540, 430, k, redSign17(980, 320, [[TX('story1', '¿SABES QUÉ ES'), 104, -66], [TX('story2', 'EL EFECTO ANCLA?'), 118, 62, C.yel]]), lerp(-6, -2, clamp(k)));
  const kv = pop(t, c.vote, 0.5) * (1 + 0.03 * Math.sin(t * 6));
  s += whoPill(TX('story3', 'Vota en la encuesta'), 540, 1010, kv, { size: 52, col: INK });
  s += arrowDown17(540, 1062, 46, pop(t, c.vote + 0.2, 0.45), t);
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
  for (const [id, url, iw, ih] of logos) {
    const img = new Image(); img.src = url; await img.decode();
    const el = document.createElementNS(ns, 'image');
    el.setAttribute('id', id); el.setAttribute('width', String(iw || 500)); el.setAttribute('height', String(ih || 500));
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
