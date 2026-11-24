/* Vídeo 15 — «Se lanza Escaparate de Tudela». Piezas nuevas sobre lib.js + series.js + rosa.js + v04…v14.js + maria.js:
   cartel.png sostenido por María (sin redibujar: se usa la imagen tal cual sobre un tablero 9:16 del color dominante),
   tarjetas «Oferta» / «Novedad» / «Evento» con franja roja y logo, móvil flotante con ondas, pasos de publicación
   (foto, texto, publicar) para la escena del móvil del vídeo 04, chat del canal con tarjetas de oferta, franjas del
   cierre, y la boca de Mari Carmen (abre y cierra en los tramos «habla»; el resto de su cara queda igual). */
'use strict';

const st15 = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
const CARTEL_BG = '#C71F1E';               // color dominante de cartel.png
const CARTEL_AR = 1414 / 2000;             // proporción del cartel (ancho / alto)

/* Mari Carmen (de frente, con boca que habla): ver maricarmen.js */
const talk15 = (t, ranges, rate = 10) => talkA(t, ranges || [], rate);

/* ===================== MARÍA: brazos y colocación ===================== */
// brazo con el codo hacia fuera (elige el lado del codo según la mano esté arriba o abajo)
function mArm(front, h, hand = 'fist', extra = {}) {
  const S = front ? MG.shF : MG.shB, up = h[1] < S[1] + 6;
  return Object.assign({ h, side: front ? (up ? 1 : -1) : (up ? -1 : 1), hand, hs: 1.25 }, extra);
}
const M_REST_F = () => mArm(true, [210.5, 152]);
const M_REST_B = () => mArm(false, [169.5, 152]);
// mano que gesticula al hablar (frente al pecho)
function mGestB(t, on = 1) {
  const a = on ? 1 : 0;
  return mArm(false, [lerp(169.5, 161 + 3 * Math.sin(t * 2.3), a), lerp(152, 124 + 5 * Math.sin(t * 3.4 + 1), a)], a > 0.5 ? 'open' : 'fist', { hrot: -10 + 8 * Math.sin(t * 2.9) });
}
function mGestF(t, on = 1) {
  const a = on ? 1 : 0;
  return mArm(true, [lerp(210.5, 219 - 3 * Math.sin(t * 2.1 + 2), a), lerp(152, 124 + 5 * Math.sin(t * 3.1), a)], a > 0.5 ? 'open' : 'fist', { hrot: 10 - 8 * Math.sin(t * 2.6) });
}
// estado común: respiración y parpadeo
const mBase = (T, sc, off = 0) => ({ bob: breathA(T, sc), blink: blinkA(T, off), curl: 2.2 * Math.sin(T * 2.4) });
// punto local de María -> mundo (respeta la respiración)
const mgPt = (px, py, sc, lx, ly, bob = 0) => [px + (lx - 190) * sc, py + (ly - 204 + bob) * sc];
// María en plano medio: (px, cintura y) — la cintura (local 142) queda en waistY
const mWaist = (waistY, sc) => waistY + (204 - 142) * sc;
const mcWaist = (waistY, sc) => waistY + (208 - 150) * sc;

/* ===================== EL CARTEL (cartel.png tal cual) ===================== */
// tablero 9:16 del color dominante con cartel.png centrado (ancho completo: no se corta el QR ni se deforma)
// (cx, cy) centro; wd = ancho del tablero; k = factor de grosor de trazo (unidades locales)
function cartelBoard(cx, cy, wd, rot, w) {
  const ht = wd * 16 / 9, ch = wd / CARTEL_AR;
  // contorno y sombra por FUERA del tablero: a pantalla completa no se ve ningún borde
  const bo = +w(1.6);
  let g = `<rect x="${f(-wd / 2 + bo)}" y="${f(-ht / 2 + bo)}" width="${f(wd + bo)}" height="${f(ht + bo)}" fill="${INK}"/>`;
  g += `<rect x="${f(-wd / 2)}" y="${f(-ht / 2)}" width="${f(wd)}" height="${f(ht)}" fill="${CARTEL_BG}"/>`;
  g += `<svg x="${f(-wd / 2)}" y="${f(-ch / 2)}" width="${f(wd)}" height="${f(ch)}" viewBox="0 0 1414 2000" preserveAspectRatio="xMidYMid meet"><use href="#cartel"/></svg>`;
  g += `<rect x="${f(-wd / 2 - bo / 2)}" y="${f(-ht / 2 - bo / 2)}" width="${f(wd + bo)}" height="${f(ht + bo)}" fill="none" stroke="${INK}" stroke-width="${f(bo)}"/>`;
  return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(rot)})">${g}</g>`;
}
// pulgar sobre el borde del tablero (side = 1 derecha, -1 izquierda), solo dentro del margen rojo del cartel
function thumbOnEdge(bc, wd, rot, side, w) {
  const x = side * (wd / 2 - 0.6), y = 0;
  const g = `<rect x="${f(side > 0 ? x - 1.6 : x - 2.4)}" y="${f(y - 4.6)}" width="4" height="7.6" rx="2" fill="${MG.skin}" stroke="${INK}" stroke-width="${w(1.8)}"/>`;
  return `<g transform="translate(${f(bc[0])} ${f(bc[1] - 3)}) rotate(${f(rot)})">${g}</g>`;
}
// cartel a pantalla completa (fondo del color dominante, cartel centrado sin cortar)
function cartelFull() {
  const ch = W / CARTEL_AR;
  return `<rect width="${W}" height="${H}" fill="${CARTEL_BG}"/><svg x="0" y="${f((H - ch) / 2)}" width="${W}" height="${f(ch)}" viewBox="0 0 1414 2000"><use href="#cartel"/></svg>`;
}

/* ===================== TARJETAS «Oferta» / «Novedad» / «Evento» ===================== */
function ticketIcon(x, y, s, t = 0) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v / s)}" stroke-linejoin="round"`;
  const d = 'M-54 -32 H54 V-12 Q42 -12 42 0 Q42 12 54 12 V32 H-54 V12 Q-42 12 -42 0 Q-42 -12 -54 -12Z';
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)}) rotate(${f(-8 + 3 * Math.sin(t * 2.2))})">
    <path d="${d}" transform="translate(5 5)" fill="${INK}"/><path d="${d}" fill="${C.yel}" ${sk()}/>
    <path d="M22 -30 V30" stroke="${INK}" stroke-width="${f(SW * 0.6 / s)}" stroke-dasharray="6 6"/>
    <path d="${starPath(17, 8, 5)}" transform="translate(-10 0)" fill="${C.red}" ${sk(0.8)}/>
    <circle cx="36" cy="-14" r="3" fill="#FFFFFF"/></g>`;
}
const KIND15 = {
  oferta: { label: 'Oferta', bg: '#FDE3EC', icon: (x, y, t) => offerSign(x, y + 8, 0.58, t) },
  novedad: { label: 'Novedad', bg: C.glass, icon: (x, y, t) => dressIcon(x, y + 6, 0.62, t) },
  evento: { label: 'Evento', bg: '#FFF1C9', icon: (x, y, t) => ticketIcon(x, y, 0.72, t) }
};
// tarjeta centrada en (0,0) de 290 x 150, franja roja con el logo (icono, sin letras) arriba
function card15Local(kind, t = 0) {
  const K = KIND15[kind], x0 = -145, y0 = -75, wd = 290, ht = 150, sh = 40;
  let g = `<rect x="${x0 + 8}" y="${y0 + 8}" width="${wd}" height="${ht}" rx="22" fill="${INK}"/>`;
  g += `<rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="22" fill="#FFFFFF"/>`;
  g += `<path d="M${x0} ${y0 + sh} V${y0 + 22} Q${x0} ${y0} ${x0 + 22} ${y0} H${x0 + wd - 22} Q${x0 + wd} ${y0} ${x0 + wd} ${y0 + 22} V${y0 + sh}Z" fill="${C.red}"/>`;
  g += `<line x1="${x0}" y1="${y0 + sh}" x2="${x0 + wd}" y2="${y0 + sh}" ${st15(0.7)}/>`;
  g += `<circle cx="${x0 + 26}" cy="${y0 + 20}" r="15" fill="#FFFFFF" ${st15(0.5)}/>` + logoI13(x0 + 26, y0 + 20, 30);
  for (let i = 0; i < 3; i++) g += `<circle cx="${x0 + wd - 26 - i * 18}" cy="${y0 + 20}" r="4.5" fill="#FFFFFF" opacity="0.85"/>`;
  g += `<rect x="${x0 + 12}" y="${y0 + sh + 10}" width="92" height="${ht - sh - 22}" rx="14" fill="${K.bg}" ${st15(0.6)}/>`;
  const cid = 'cc' + (uid++);
  g += `<clipPath id="${cid}"><rect x="${x0 + 12}" y="${y0 + sh + 10}" width="92" height="${ht - sh - 22}" rx="14"/></clipPath><g clip-path="url(#${cid})">${K.icon(x0 + 58, y0 + sh + 10 + (ht - sh - 22) / 2, t)}</g>`;
  g += text(K.label, x0 + 118, y0 + sh + 34, { size: fit(K.label, 50, 160, 'G'), font: 'G', anchor: 'start', fill: C.red, sw: SW * 1.1, sd: 3, ls: 1 });
  g += `<rect x="${x0 + 120}" y="${y0 + sh + 62}" width="140" height="11" rx="5.5" fill="${INK}" opacity="0.22"/><rect x="${x0 + 120}" y="${y0 + sh + 82}" width="96" height="11" rx="5.5" fill="${INK}" opacity="0.22"/>`;
  g += `<rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="22" fill="none" ${st15()}/>`;
  return g;
}
// ondas concéntricas (notificación) alrededor de (x,y) desde t0
function waves15(x, y, t, t0, r0 = 60, r1 = 330, dur = 0.7, n = 3) {
  let s = '';
  const u = (t - t0) / dur;
  if (u < 0 || u > 1.6) return s;
  for (let j = 0; j < n; j++) {
    const v = clamp(u - j * 0.22);
    if (v <= 0 || v >= 1) continue;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(lerp(r0, r1, easeOut(v)))}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.1 * (1 - v))}"/>`;
  }
  return s;
}
// arcos de vibración a los lados de un móvil (x0,x1 bordes; y centro)
function buzz15(x0, x1, y, k) {
  if (k <= 0.01) return '';
  let s = '';
  [0, 1].forEach(j => {
    const r = 40 + j * 34;
    s += `<path d="M${f(x0 - 18 - j * 30)} ${f(y - r)} Q${f(x0 - 46 - j * 34)} ${y} ${f(x0 - 18 - j * 30)} ${f(y + r)}" fill="none" stroke="${INK}" stroke-width="${f(SW * k)}" stroke-linecap="round"/>`;
    s += `<path d="M${f(x1 + 18 + j * 30)} ${f(y - r)} Q${f(x1 + 46 + j * 34)} ${y} ${f(x1 + 18 + j * 30)} ${f(y + r)}" fill="none" stroke="${INK}" stroke-width="${f(SW * k)}" stroke-linecap="round"/>`;
  });
  return s;
}

/* ===================== PASOS DE LA PUBLICACIÓN (móvil del vídeo 04) ===================== */
function uploadIcon(x, y, r) {
  return `<path d="M${f(x - r)} ${f(y + r * 0.2)} V${f(y + r * 0.8)} H${f(x + r)} V${f(y + r * 0.2)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.1)}" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>
    <path d="M${x} ${f(y + r * 0.45)} V${f(y - r * 0.85)} M${f(x - r * 0.5)} ${f(y - r * 0.35)} L${x} ${f(y - r * 0.85)} L${f(x + r * 0.5)} ${f(y - r * 0.35)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.1)}" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>`;
}
const POST15 = { lines: ['Bolsos nuevos', 'de temporada'] };
// foto del bolso (marco x,y,w,h)
function bagPhoto(x, y, wd, ht, t = 0) {
  let g = `<rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="${f(ht)}" rx="16" fill="#FDE3EC" ${st15(0.8)}/>`;
  g += `<circle cx="${f(x + wd / 2)}" cy="${f(y + ht * 0.55)}" r="${f(ht * 0.4)}" fill="#FFFFFF" opacity="0.8"/>`;
  g += `<rect x="${f(x)}" y="${f(y + ht - 26)}" width="${f(wd)}" height="26" fill="${C.cream}" ${st15(0.6)}/>`;
  g += bag(x + wd / 2, y + ht - 22, (ht - 50) / 112, 0, { rot: 2 * Math.sin(t * 2.4) });
  g += sparkle(x + wd - 46, y + 38, 18) + sparkle(x + 48, y + 46, 12);
  return g;
}
// panel de un paso: i = 0 foto, 1 texto, 2 publicar; o = { photo (0..1), chars (nº letras), caret, done, press }
function step15(x, y, wd, ht, i, o, t) {
  let g = `<rect x="${f(x + 8)}" y="${f(y + 8)}" width="${f(wd)}" height="${f(ht)}" rx="22" fill="${INK}"/>`;
  g += `<rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="${f(ht)}" rx="22" fill="#FFFFFF" ${st15()}/>`;
  if (i === 0) {
    g += text('Sube la foto', x + 26, y + 38, { size: 40, anchor: 'start', fill: '#6B6262', stroke: null, shadow: false });
    const px = x + 24, py = y + 66, pw = wd - 48, ph = ht - 86;
    if ((o.photo || 0) < 0.02) {
      g += `<rect x="${f(px)}" y="${f(py)}" width="${f(pw)}" height="${f(ph)}" rx="16" fill="#F6EFED" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-dasharray="16 12" opacity="0.8"/>`;
      g += uploadIcon(px + pw / 2, py + ph / 2, 38);
    } else {
      const k = o.photo, cx = px + pw / 2, cy = py + ph / 2;
      g += `<g transform="translate(${f(cx)} ${f(cy)}) scale(${f(k)}) translate(${f(-cx)} ${f(-cy)})">${bagPhoto(px, py, pw, ph, t)}</g>`;
    }
  } else if (i === 1) {
    g += text('Escribe lo que quieres publicar', x + 26, y + 38, { size: fit('Escribe lo que quieres publicar', 40, wd - 52), anchor: 'start', fill: '#6B6262', stroke: null, shadow: false });
    const fx = x + 24, fy = y + 66, fw = wd - 48, fh = ht - 86;
    g += `<rect x="${f(fx)}" y="${f(fy)}" width="${f(fw)}" height="${f(fh)}" rx="16" fill="#F6EFED" ${st15(0.6)}/>`;
    let n = o.chars || 0;
    const L = POST15.lines;
    const shown = [L[0].slice(0, Math.min(n, L[0].length)), n > L[0].length ? L[1].slice(0, n - L[0].length) : ''];
    shown.forEach((s_, j) => { if (s_) g += text(s_, fx + 24, fy + 40 + j * 54, { size: 46, anchor: 'start', fill: INK, stroke: null, shadow: false }); });
    if (o.caret && Math.floor(t * 3) % 2 === 0) {
      const j = shown[1] ? 1 : 0, lx = fx + 24 + measure(shown[j], 46) + 4;
      g += `<rect x="${f(lx)}" y="${f(fy + 16 + j * 54)}" width="5" height="48" rx="2" fill="${C.blue}"/>`;
    }
    if (!n && !o.caret) g += text('Ej.: novedades, ofertas…', fx + 24, fy + fh / 2, { size: 38, anchor: 'start', fill: '#B3A9A6', stroke: null, shadow: false });
  } else {
    const bw = wd - 120, bh = ht - 60, cx = x + wd / 2, cy = y + ht / 2, sq = o.press ? 0.92 : 1 + (o.done ? 0.06 * Math.max(0, damp(o.doneT || 0, 16, 6)) : 0);
    let b = `<rect x="${f(-bw / 2 + 9)}" y="${f(-bh / 2 + 9)}" width="${f(bw)}" height="${f(bh)}" rx="${f(bh / 2)}" fill="${INK}"/>`;
    b += `<rect x="${f(-bw / 2)}" y="${f(-bh / 2)}" width="${f(bw)}" height="${f(bh)}" rx="${f(bh / 2)}" fill="${o.done ? C.green : C.red}" ${st15()}/>`;
    if (!o.done) b += text('Publicar', 0, 4, { size: 74, sw: SW * 1.8, sd: 5 });
    else b += checkCircle(-150, 0, 46, pop(o.doneT || 0, 0.03, 0.4)) + text('Publicada', 46, 4, { size: 68, sw: SW * 1.8, sd: 5 });
    g += at(cx, cy, sq, b);
  }
  return g;
}
// tarjeta publicada (en la pantalla del móvil)
function publishedCard(x, y, wd, ht, t, kTick) {
  let g = panel(x, y, wd, ht, 30, '#FFFFFF', 12);
  const ph = ht * 0.5;
  g += bagPhoto(x + 22, y + 22, wd - 44, ph, t);
  const ty = y + 22 + ph + 66;
  g += pill(x + 120, ty, 190, 70, C.navy, 'Novedad', { size: 44 });
  g += text(POST15.lines[0], x + 30, ty + 84, { size: 52, anchor: 'start', fill: INK, stroke: null, shadow: false });
  g += text(POST15.lines[1], x + 30, ty + 142, { size: 52, anchor: 'start', fill: INK, stroke: null, shadow: false });
  g += checkCircle(x + wd - 70, y + 70, 74, kTick);
  return g;
}

/* ===================== CHAT DEL CANAL ===================== */
const CHAT15 = [
  { kind: 'Oferta', col: C.red, icon: 'bag', bg: '#FDE3EC', l: ['Bolsos con', 'descuento'] },
  { kind: 'Oferta', col: C.red, icon: 'shoe', bg: C.glass, l: ['Zapatos', 'en oferta'] },
  { kind: 'Oferta', col: C.red, icon: 'cupcake', bg: '#FFF1C9', l: ['Pasteles', '2 × 1'] }
];
function chatMsg(x, y, wd, ht, m, t, hhmm) {
  let g = `<path d="M${f(x + 22)} ${f(y)} H${f(x + wd - 22)} Q${f(x + wd)} ${f(y)} ${f(x + wd)} ${f(y + 22)} V${f(y + ht - 22)} Q${f(x + wd)} ${f(y + ht)} ${f(x + wd - 22)} ${f(y + ht)} H${f(x + 22)} Q${f(x)} ${f(y + ht)} ${f(x)} ${f(y + ht - 22)} V${f(y + 26)} L${f(x - 22)} ${f(y)}Z" transform="translate(6 6)" fill="${INK}"/>`;
  g += `<path d="M${f(x + 22)} ${f(y)} H${f(x + wd - 22)} Q${f(x + wd)} ${f(y)} ${f(x + wd)} ${f(y + 22)} V${f(y + ht - 22)} Q${f(x + wd)} ${f(y + ht)} ${f(x + wd - 22)} ${f(y + ht)} H${f(x + 22)} Q${f(x)} ${f(y + ht)} ${f(x)} ${f(y + ht - 22)} V${f(y + 26)} L${f(x - 22)} ${f(y)}Z" fill="#FFFFFF" ${st15(0.8)}/>`;
  const iw = ht - 36;
  g += `<rect x="${f(x + 16)}" y="${f(y + 18)}" width="${f(iw)}" height="${f(iw)}" rx="16" fill="${m.bg}" ${st15(0.6)}/>`;
  if (m.icon === 'bag') g += bag(x + 16 + iw / 2, y + 18 + iw - 12, (iw - 40) / 112, 0, { rot: 2 * Math.sin(t * 2.4) });
  else g += unitBox(x + 22, y + 24, iw - 12, iw - 12, ICONS[m.icon], 0.92);
  g += sealPct(x + 16 + iw - 6, y + 26, 22, 1);
  const tx = x + iw + 34;
  g += pill(tx + 66, y + 42, 132, 48, m.col, m.kind, { size: 30, tsw: SW * 0.9, swk: 0.7 });
  g += text(m.l[0], tx, y + 98, { size: fit(m.l[0], 36, wd - iw - 54), anchor: 'start', fill: INK, stroke: null, shadow: false });
  g += text(m.l[1], tx, y + 138, { size: fit(m.l[1], 36, wd - iw - 54), anchor: 'start', fill: INK, stroke: null, shadow: false });
  g += text(hhmm, x + wd - 16, y + ht - 20, { size: 24, anchor: 'end', fill: '#8A8180', stroke: null, shadow: false });
  return g;
}
// pantalla del chat (cuerpo de portalPhone): cabecera del canal + mensajes que llegan (ks: escala de aparición de cada uno)
function chatScreen15(ks, t, hh) {
  return (sx, sy, sw_, sh_) => {
    const top = sy - hh;
    let g = `<rect x="${sx}" y="${sy}" width="${sw_}" height="${sh_}" fill="#F3E7DF"/>`;
    for (let yy = sy + 24; yy < sy + sh_; yy += 50) for (let xx = sx + 24 + (Math.round(yy / 50) % 2) * 25; xx < sx + sw_; xx += 50) g += `<circle cx="${xx}" cy="${yy}" r="3" fill="#E2D2C8"/>`;
    // cabecera del canal (tapa la del portal)
    g += `<rect x="${sx}" y="${top}" width="${sw_}" height="${hh}" fill="${C.navy}"/><line x1="${sx}" y1="${sy}" x2="${sx + sw_}" y2="${sy}" ${st15()}/>`;
    g += `<path d="M${sx + 40} ${top + hh / 2 - 22} L${sx + 22} ${top + hh / 2 + 4} L${sx + 40} ${top + hh / 2 + 30}" stroke="#FFFFFF" stroke-width="${f(SW)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    g += `<circle cx="${sx + 96}" cy="${top + hh / 2 + 4}" r="40" fill="#FFFFFF" ${st15(0.7)}/>` + logoI13(sx + 96, top + hh / 2 + 4, 76);
    const tw = sw_ - 170, ts = fit('Escaparate de Tudela', 40, tw);
    g += text('Escaparate de Tudela', sx + 150, top + hh / 2 - 12, { size: ts, anchor: 'start', sw: SW * 1.1, sd: 3 });
    g += text('Canal · ofertas y novedades', sx + 152, top + hh / 2 + 32, { size: fit('Canal · ofertas y novedades', 28, tw), anchor: 'start', fill: '#CFE3F2', stroke: null, shadow: false });
    // mensajes: el último abajo; los anteriores suben
    const mh = 190, gap = 26, bot = sy + sh_ - 30;
    let y = bot;
    let mg = '';
    for (let i = ks.length - 1; i >= 0; i--) {
      const k = ks[i];
      if (k <= 0.001) continue;
      const grow = easeOut(clamp(k * 1.5));
      y -= (mh + gap) * grow;
      const x = sx + 44, wd = sw_ - 74;
      const ox = x, oy = y + mh;
      mg += `<g transform="translate(${f(ox)} ${f(oy)}) scale(${f(Math.min(1.15, k))}) translate(${f(-ox)} ${f(-oy)})">${chatMsg(x, y, wd, mh, CHAT15[i % CHAT15.length], t, '10:0' + (i + 2))}</g>`;
    }
    g += mg;
    return g;
  };
}
// globo rojo de notificaciones con número
function badge15(x, y, n, k) {
  if (k <= 0.01 || n <= 0) return '';
  return at(x, y, k, `<circle cx="5" cy="5" r="44" fill="${INK}"/><circle r="44" fill="${C.red}" ${st15()}/>` + text(String(n), 0, 3, { size: 58, sw: SW * 1.4, sd: 3 }));
}

/* ===================== TEXTOS DEL CIERRE ===================== */
function strip15(str, x, y, k, rot = 0, o = {}) {
  const wd = o.w || 960, ht = o.h || 132, size = fit(str, o.size || 96, wd - 70);
  return at(x, y, k, `<rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="28" transform="translate(11 11)" fill="${INK}"/><rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="28" fill="${C.red}" ${st15(1.1)}/>` +
    text(str, 0, 5, { size, sw: SW * 2, sd: 6, fill: o.fill || '#FFFFFF' }), rot);
}
function whoPill(str, x, y, k, o = {}) {
  const size = o.size || 40, wd = measure(str, size) + 80, ht = size * 1.7;
  return at(x, y, k, `<rect x="${f(-wd / 2)}" y="${f(-ht / 2)}" width="${f(wd)}" height="${f(ht)}" rx="${f(ht / 2)}" transform="translate(6 6)" fill="${INK}"/><rect x="${f(-wd / 2)}" y="${f(-ht / 2)}" width="${f(wd)}" height="${f(ht)}" rx="${f(ht / 2)}" fill="${o.fill || '#FFFFFF'}" ${st15(0.8)}/>` +
    text(str, 0, 2, { size, fill: o.col || INK, stroke: null, shadow: false }));
}

/* ===================== PÁJAROS EN «V» ===================== */
function vFlock(x, y, a, t, i) {
  let s = '';
  [[0, 0], [-1, 1], [1, 1]].forEach(([dx, dy], j) => {
    s += bird(x + dx * a * 1.5, y + dy * a * 0.9, a * (j ? 0.8 : 1), 0.35 + 0.65 * Math.sin(t * 2 * PI / 0.34 + i * 2 + j));
  });
  return s;
}
function flocks(t, list) {
  let s = '';
  list.forEach((b, i) => {
    const u = (t - b.t0) / b.d;
    if (u < 0 || u > 1) return;
    const x = b.dir > 0 ? lerp(-160, W + 160, u) : lerp(W + 160, -160, u);
    s += vFlock(x, Math.min(1340, b.y + Math.sin(u * 7 + i) * 16), b.a, t, i);
  });
  return s;
}

/* ===================== FLECHA DE CÓMIC ===================== */
function bigArrow(x, y, s, k, rot = 0) {
  const d = 'M-150 -46 H40 V-110 L160 0 L40 110 V46 H-150Z';
  return at(x, y, k * s, `<path d="${d}" transform="translate(12 12)" fill="${INK}"/><path d="${d}" fill="${C.yel}" ${st15(1.2)}/>
    <path d="M-120 -22 H30" stroke="#FFFFFF" stroke-width="${f(SW * 1.3)}" stroke-linecap="round" opacity="0.7"/>`, rot);
}

/* ===================== FONDO CERCANO DE LA TIENDA (copiado de la escena 4 del vídeo 06) ===================== */
function closeBack(T, o = {}) {
  let s = dotWall();
  s += at(140, 330, 1, clockFace(78, 10 * 60 + 5 + T * 0.5));
  s += woodShelf(760, 1100, 1010);
  s += bag(830, 1010, 0.85, 3) + bag(960, 1010, 0.95, 2) + bag(1065, 1010, 0.75, 1);
  if (o.lamp !== false) s += lamp(900, 190, 1.2 * Math.sin(T * 1.6));
  return s;
}
