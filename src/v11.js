/* Vídeo 11 — «4 motivos para estar en el canal». Piezas nuevas sobre lib.js + series.js + rosa.js + v04…v10.js:
   Marta (la del vídeo 01, mismo cuerpo de person()) a cámara: cara con boca que habla, brazos con codo y manos
   (saludo, contar 1-2-3, señalar, corazón, pulgar, móvil); cabecera fija; números gigantes; rótulos;
   imágenes insertadas (trastienda «Novedades», fachada 2x1, bar con música y cata, calle festiva). */
'use strict';

const V11 = { foot: 1370, sc: 7 };
const st11 = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
// respiración: 2 px de la escena base de 380 px (≈ 6 px a 1080) cada 1,6 s; parpadeo cada 3 s
const breath11 = (T, sc) => -6 / sc * (0.5 - 0.5 * Math.cos(2 * PI * T / 1.6));
const blink11 = T => ((T + 0.4) % 3) < 0.12;
// apertura de la boca (0..1) a ~6 ciclos/s dentro de los tramos «habla»; cerrada fuera
function talkAmt(t, ranges) {
  for (const [a, b] of ranges || []) {
    if (t >= a && t <= b) {
      const env = clamp((t - a) / 0.07) * clamp((b - t) / 0.07);
      const v = 0.62 + 0.38 * Math.sin(2 * PI * 1.7 * (t - a) + a * 3);
      return env * (0.5 - 0.5 * Math.cos(2 * PI * 6 * (t - a))) * v;
    }
  }
  return 0;
}
const talking = (t, ranges) => (ranges || []).some(([a, b]) => t >= a && t <= b);

/* ===================== MARTA A CÁMARA ===================== */
// cara girada hacia cámara (rasgos 3 unidades más al centro que en el perfil del vídeo 01)
function martaFace11(o, w) {
  const e = o.expr || 'happy', m = clamp(o.talk || 0);
  const L = (d, sw = 1.6, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const E1 = 193, E2 = 200, EY = 80.8, MX = 196.6, MY = 87.4;
  let s = `<circle cx="202.2" cy="86.2" r="2.7" fill="${C.pink}" opacity="0.65"/><circle cx="189.4" cy="86.2" r="2.3" fill="${C.pink}" opacity="0.5"/>`;
  // cejas
  if (e === 'surprise' || e === 'sparkle') s += L(`M190.4 73.4 Q193 71 195.6 73 M197.6 73 Q200.2 71 202.8 73.4`, 1.6);
  else if (e === 'wink') s += L('M190.6 75.8 L195 74.4 M198 74.2 Q200.4 72.4 202.8 74.4', 1.6);
  else s += L('M190.8 75.6 L195 74.7 M198.2 74.7 L202.4 75.6', 1.6);
  // ojos
  const dot = (x, r = 2.15) => `<circle cx="${x}" cy="${EY}" r="${r}" fill="${INK}"/><circle cx="${f(x + 0.75)}" cy="${f(EY - 0.8)}" r="0.62" fill="#FFFFFF"/>`;
  const arc = x => L(`M${f(x - 2.5)} ${f(EY + 0.7)} Q${x} ${f(EY - 2.3)} ${f(x + 2.5)} ${f(EY + 0.7)}`, 1.8);
  if (o.blink && e !== 'wink' && e !== 'joy') s += L(`M${E1 - 2.4} ${EY} Q${E1} ${EY + 1.3} ${E1 + 2.4} ${EY} M${E2 - 2.4} ${EY} Q${E2} ${EY + 1.3} ${E2 + 2.4} ${EY}`, 1.6);
  else if (e === 'sparkle') {
    [E1, E2].forEach(x => {
      s += `<circle cx="${x}" cy="${EY}" r="3.3" fill="${INK}"/><circle cx="${f(x + 1.1)}" cy="${f(EY - 1.2)}" r="1.25" fill="#FFFFFF"/><circle cx="${f(x - 1)}" cy="${f(EY + 1.2)}" r="0.55" fill="#FFFFFF"/>`;
      s += `<path d="M${f(x - 1.8)} ${f(EY - 0.2)} l0.5 -0.5 0.5 0.5 -0.5 0.5z" fill="#FFFFFF"/>`;
    });
  } else if (e === 'surprise') {
    [E1, E2].forEach(x => { s += `<circle cx="${x}" cy="${EY}" r="3.1" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.5)}"/><circle cx="${f(x + 0.4)}" cy="${f(EY + 0.2)}" r="1.25" fill="${INK}"/>`; });
  } else if (e === 'wink') s += arc(E1) + dot(E2);
  else if (e === 'joy') s += arc(E1) + arc(E2);
  else s += dot(E1) + dot(E2);
  // boca
  const grin = e === 'sparkle' || e === 'wink' || e === 'joy' || e === 'grin';
  if (m > 0.05) {
    const hw = grin ? 4 : 3.3, op = (grin ? 1.8 : 0.8) + 5.4 * m;
    s += `<path d="M${f(MX - hw)} ${MY} Q${MX} ${f(MY + 0.9)} ${f(MX + hw)} ${MY} Q${MX} ${f(MY + op)} ${f(MX - hw)} ${MY}Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
    if (m > 0.4) s += `<ellipse cx="${MX}" cy="${f(MY + op * 0.62)}" rx="${f(hw * 0.42)}" ry="${f(op * 0.16)}" fill="${C.pink}"/>`;
  } else if (grin) {
    s += `<path d="M${f(MX - 4.3)} ${f(MY - 0.9)} Q${MX} ${f(MY + 7)} ${f(MX + 4.3)} ${f(MY - 0.9)}Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
    s += `<path d="M${f(MX - 3.3)} ${f(MY - 0.35)} H${f(MX + 3.3)} L${f(MX + 2.7)} ${f(MY + 1)} H${f(MX - 2.7)}Z" fill="#FFFFFF"/>`;
  } else if (e === 'surprise') s += `<ellipse cx="${MX}" cy="${f(MY + 1.4)}" rx="1.9" ry="2.6" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
  else s += L(`M${f(MX - 3.3)} ${MY} Q${MX} ${f(MY + 3.3)} ${f(MX + 3.3)} ${MY}`, 2);
  return s;
}
// brazo con codo (dos segmentos de 17) hasta la mano H; side = lado del codo
const SH_F = [202.5, 108], SH_B = [177.5, 108];
function ik2(S, H, side, L = 17) {
  let dx = H[0] - S[0], dy = H[1] - S[1], d = Math.hypot(dx, dy) || 0.01;
  const max = 2 * L - 0.01;
  if (d > max) { H = [S[0] + dx / d * max, S[1] + dy / d * max]; dx = H[0] - S[0]; dy = H[1] - S[1]; d = max; }
  const mx = (S[0] + H[0]) / 2, my = (S[1] + H[1]) / 2, hg = Math.sqrt(Math.max(0, L * L - d * d / 4));
  return { E: [mx - dy / d * hg * side, my + dx / d * hg * side], H };
}
function capsule(pts, wd, fill, w) {
  const d = pts.map((p, i) => (i ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1])).join(' ');
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${f(wd + +w(3))}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${f(wd - +w(3))}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
// manos (local, centro 0,0, derechas). kind: fist | open | count | point | thumb | heart | phone
function hand11(kind, H, w, o = {}) {
  const hs = o.hs || 1.3, fill = o.fill || C.skin;
  const sw = v => f(+w(v) / hs);
  const sk = (v = 2.2) => `stroke="${INK}" stroke-width="${sw(v)}" stroke-linejoin="round"`;
  const fing = (x1, y1, x2, y2, wd = 2.6) => `<path d="M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)}" stroke="${INK}" stroke-width="${f(wd + +sw(2))}" stroke-linecap="round"/><path d="M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)}" stroke="${fill}" stroke-width="${f(wd - +sw(2))}" stroke-linecap="round"/>`;
  let g = '';
  if (kind === 'open') {
    [-32, -11, 10, 30].forEach((a, i) => { const r = a * PI / 180, l = i === 1 || i === 2 ? 8.4 : 7.4; g += fing(Math.sin(r) * 2, -1.5, Math.sin(r) * l, -Math.cos(r) * l); });
    g += fing(-2.5, 0.8, -7.4, -2.6);
    g += `<circle r="4.5" fill="${fill}" ${sk()}/>`;
  } else if (kind === 'count') {
    const n = o.n || 1, X = n === 1 ? [[0.4, 0]] : n === 2 ? [[-1.3, -12], [2, 12]] : [[-2.6, -14], [0.3, 0], [3, 14]];
    X.forEach(([x, a]) => { const r = a * PI / 180; g += fing(x, -1.5, x + Math.sin(r) * 9.5, -1.5 - Math.cos(r) * 9.5, 2.7); });
    g += `<rect x="-4.6" y="-3.8" width="9.2" height="8.6" rx="3.4" fill="${fill}" ${sk()}/>`;
    g += fing(-4.2, 1.6, 0.8, 1.2, 2.4);
  } else if (kind === 'point') {
    const r = (o.dir === undefined ? -20 : o.dir) * PI / 180;
    g += fing(0, 0, Math.cos(r) * 9.5, Math.sin(r) * 9.5, 2.7);
    g += `<circle r="4.2" fill="${fill}" ${sk()}/>`;
    g += `<path d="M${f(Math.cos(r + 1.6) * 2.4)} ${f(Math.sin(r + 1.6) * 2.4)} L${f(Math.cos(r) * 2.6)} ${f(Math.sin(r) * 2.6)}" stroke="${INK}" stroke-width="${sw(1.2)}" stroke-linecap="round"/>`;
  } else if (kind === 'thumb') {
    g += fing(-1.6, -2, -1.6, -10.5, 3.3);
    g += `<rect x="-5.4" y="-3.6" width="10.8" height="9.6" rx="3.6" fill="${fill}" ${sk()}/>`;
    g += `<path d="M-3.2 -0.4 H3.6 M-3.2 2.6 H3.6" stroke="${INK}" stroke-width="${sw(1.2)}" stroke-linecap="round"/>`;
  } else if (kind === 'heart') {
    g += `<g transform="rotate(-24)"><rect x="-6.4" y="-4.2" width="12.8" height="8.4" rx="4" fill="${fill}" ${sk()}/>` +
      `<path d="M-1 -2 H5 M-1 0.6 H5.4 M-1 3 H4.6" stroke="${INK}" stroke-width="${sw(1)}" stroke-linecap="round"/></g>`;
  } else if (kind === 'phone') {
    const lit = o.screen || 'app';
    g += `<g transform="rotate(${f(o.rot || 0)})">`;
    g += `<rect x="-7.6" y="-24" width="15.2" height="26" rx="2.8" fill="${INK}" stroke="${INK}" stroke-width="${sw(2)}"/>`;
    g += `<rect x="-6" y="-22.2" width="12" height="22.4" rx="1.6" fill="${C.cream}"/>`;
    g += `<rect x="-6" y="-22.2" width="12" height="4.4" fill="${C.red}"/><circle cx="-3.4" cy="-20" r="1.3" fill="#FFFFFF"/>`;
    if (lit === 'chat') {
      g += `<rect x="-4.8" y="-15.6" width="8" height="3.6" rx="1.4" fill="#CFEFD9" stroke="${INK}" stroke-width="${sw(0.6)}"/><rect x="-2.6" y="-10.6" width="7.4" height="3.6" rx="1.4" fill="#CFEFD9" stroke="${INK}" stroke-width="${sw(0.6)}"/><rect x="-4.8" y="-5.6" width="6.6" height="3.6" rx="1.4" fill="#CFEFD9" stroke="${INK}" stroke-width="${sw(0.6)}"/>`;
    } else {
      g += `<rect x="-4.8" y="-16" width="9.6" height="7.8" rx="1.2" fill="#FFFFFF" stroke="${INK}" stroke-width="${sw(0.6)}"/><rect x="-4.8" y="-6.8" width="9.6" height="2.4" rx="1.2" fill="${C.red}"/><rect x="-4.8" y="-3.2" width="6" height="1.6" rx="0.8" fill="${INK}" opacity="0.4"/>`;
    }
    g += `</g><circle r="4.3" fill="${fill}" ${sk()}/><path d="M-1.4 -3.8 Q1.6 -5 3.6 -2.2" stroke="${INK}" stroke-width="${sw(1.2)}" fill="none" stroke-linecap="round"/>`;
  } else g += `<circle r="4.1" fill="${fill}" ${sk()}/>`;
  return `<g transform="translate(${f(H[0])} ${f(H[1])}) rotate(${f(o.hrot || 0)}) scale(${f(hs)})">${g}</g>`;
}
function arm11(S, A, w, fill) {
  const { E, H } = ik2(S, A.h, A.side || 1);
  return capsule([S, E, H], 7, fill, w) + hand11(A.hand || 'fist', H, w, Object.assign({ fill: C.skin }, A));
}
// poses de brazo (mano local); el codo sale hacia fuera
const POSE = {
  restF: { h: [207, 140], side: -1, hand: 'fist', hs: 1.15 },
  restB: { h: [173, 140], side: 1, hand: 'fist', hs: 1.15 },
  wave: ph => ({ h: [219 + 2 * Math.sin(ph), 77], side: -1, hand: 'open', hrot: 14 * Math.sin(ph) }),
  count: n => ({ h: [217, 78], side: -1, hand: 'count', n, hs: 1.45 }),
  pointUp: { h: [231, 97], side: -1, hand: 'point', dir: -28, hs: 1.35 },
  heart: { h: [193, 113], side: -1, hand: 'heart', hs: 1.25 },
  thumb: { h: [219, 104], side: 1, hand: 'thumb', hs: 1.45 },
  pointDown: { h: [221, 138], side: -1, hand: 'point', dir: 68, hs: 1.4 },
  phoneB: { h: [161, 120], side: 1, hand: 'phone', hs: 1.35, rot: -6 },
  phoneF: { h: [216, 116], side: 1, hand: 'phone', hs: 1.45, rot: 8 }
};
// Marta en el mundo: pies en (px, foot), escala sc. o: expr, talk, blink, armF, armB, head, pony, bob
function marta11(px, foot, sc, o = {}) {
  const F = o.armF || POSE.restF, B = o.armB || POSE.restB;
  const opts = Object.assign({ pony: 0 }, o, {
    who: 'marta', noArmF: true, noArmB: true, faceFn: martaFace11, sw: SW,
    behind: w => arm11(SH_B, B, w, C.skinS),
    front0: w => arm11(SH_F, F, w, C.skin)
  });
  delete opts.armF; delete opts.armB;
  return placeMarta(px, foot, 190, 204, sc, opts);
}
const mPt = (px, foot, sc, lx, ly) => [px + (lx - 190) * sc, foot + (ly - 204) * sc];
// estado común (respiración, parpadeo, coleta, boca, cabeceo al hablar)
function mState(t, T, sc, ranges, extra = {}) {
  const tk = talking(t, ranges);
  return Object.assign({
    bob: breath11(T, sc), blink: blink11(T), pony: 6 * Math.sin(2 * PI * T / 1.9),
    talk: talkAmt(t, ranges), head: (tk ? 2.4 * Math.sin(2 * PI * 1.25 * t) : 0) + (extra.nod || 0)
  }, extra);
}

/* ===================== FONDO EXTERIOR DE MARTA ===================== */
function bg11(T, o = {}) {
  let s = `<rect width="${W}" height="${H}" fill="${C.sky}"/><rect y="1080" width="${W}" height="${V11.foot - 1080}" fill="${C.skyL}"/>`;
  s += sun(o.sunX || 150, o.sunY || 450, 62, T * 12);
  s += clouds(T);
  if (o.birds) s += vBirds(T, o.birds);
  s += `<rect y="${V11.foot}" width="${W}" height="${H - V11.foot}" fill="${C.ground}"/>`;
  for (let x = 80; x < W + 300; x += 240) s += `<line x1="${x}" y1="${V11.foot}" x2="${x - 130}" y2="${H}" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linecap="round"/>`;
  s += `<line x1="0" y1="${V11.foot}" x2="${W}" y2="${V11.foot}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  return s;
}
// bandada en «V» de 3 pájaros que cruza de derecha a izquierda (u = 0..1)
function vBirds(T, o) {
  const u = clamp(((o.time === undefined ? T : o.time) - o.t0) / o.d);
  if (u <= 0 || u >= 1) return '';
  const x = lerp(W + 120, -200, u), y = o.y - 60 * u;
  const fl = ph => 0.35 + 0.65 * Math.sin(T * 2 * PI / 0.36 + ph);
  return bird(x, y, 30, fl(0)) + bird(x + 70, y - 34, 24, fl(1.3)) + bird(x + 64, y + 38, 24, fl(2.2));
}

/* ===================== CABECERA FIJA ===================== */
function header11(t) {
  const k = 1 + 0.05 * Math.sin(PI * clamp(t / 0.32));
  const ts = 44, tw = measure('Escaparate Tudela', ts), pw = 28 + 72 + 16 + tw + 32, ph = 90;
  const x0 = -pw / 2;
  let g = `<rect x="${f(x0 + 8)}" y="${f(-ph / 2 + 8)}" width="${f(pw)}" height="${ph}" rx="45" fill="${INK}"/>`;
  g += `<rect x="${f(x0)}" y="${f(-ph / 2)}" width="${f(pw)}" height="${ph}" rx="45" fill="${C.cream}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  g += logoBadge(x0 + 28 + 36, 0, 72, 0, 1, 'logoR');
  g += text('Escaparate Tudela', x0 + 28 + 72 + 16, 3, { size: ts, anchor: 'start', fill: C.red, stroke: null });
  return at(540, 245, k, g);
}

/* ===================== NÚMEROS, RÓTULOS, TEXTOS ===================== */
function bigNumber(x, y, r, n, k, rot = 0, t = 0, glow = 0) {
  if (k <= 0.01) return '';
  let g = '';
  if (glow) g += `<g opacity="${f(0.55 * glow)}">${rays(0, 0, 14, t * 30, C.yel, r * 1.75)}</g>`;
  g += `<circle cx="12" cy="12" r="${r}" fill="${INK}"/><circle r="${r}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW * 1.3)}"/>`;
  g += `<circle r="${f(r * 0.84)}" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-dasharray="18 13" stroke-linecap="round" opacity="0.85"/>`;
  g += `<path d="M${f(-r * 0.62)} ${f(-r * 0.3)} A${f(r * 0.7)} ${f(r * 0.7)} 0 0 1 ${f(-r * 0.25)} ${f(-r * 0.66)}" stroke="#FFFFFF" stroke-width="${f(SW * 1.4)}" fill="none" stroke-linecap="round"/>`;
  g += text(String(n), 0, r * 0.1, { size: r * 1.5, font: 'G', sw: SW * 2.6, sd: 9 });
  return at(x, y, k, g, rot);
}
function label11(str, x, y, k, rot = 0, o = {}) {
  if (k <= 0.01) return '';
  const size = o.size || 74, tw = measure(str, size), pw = tw + 70, ph = size * 1.35;
  let g = `<rect x="${f(-pw / 2 + 10)}" y="${f(-ph / 2 + 10)}" width="${f(pw)}" height="${f(ph)}" rx="${f(ph * 0.3)}" fill="${INK}"/>`;
  g += `<rect x="${f(-pw / 2)}" y="${f(-ph / 2)}" width="${f(pw)}" height="${f(ph)}" rx="${f(ph * 0.3)}" fill="${o.fill || '#FFFFFF'}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  g += text(str, 0, size * 0.05, { size, fill: o.color || INK, stroke: o.stroke || null, shadow: !!o.stroke, sw: SW * 1.8, sd: 5 });
  return at(x, y, k, g, rot);
}
// cartela roja con texto blanco (texto con rebote de los planos B)
function banner11(str, x, y, k, rot = 0, o = {}) {
  if (k <= 0.01) return '';
  const size = fit(str, o.size || 68, o.maxW || 760), tw = measure(str, size), pw = tw + 80, ph = size * 1.5;
  let g = `<rect x="${f(-pw / 2 + 10)}" y="${f(-ph / 2 + 10)}" width="${f(pw)}" height="${f(ph)}" rx="${f(ph * 0.32)}" fill="${INK}"/>`;
  g += `<rect x="${f(-pw / 2)}" y="${f(-ph / 2)}" width="${f(pw)}" height="${f(ph)}" rx="${f(ph * 0.32)}" fill="${o.fill || C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  g += text(str, 0, size * 0.06, { size, sw: SW * 1.9, sd: 5 });
  return at(x, y, k, g, rot);
}
const bigT = (str, x, y, size, k, rot = 0, o = {}) => at(x, y, k, text(str, 0, 0, Object.assign({ size: fit(str, size, o.maxW || 960), sw: SW * 2.3, sd: 9 }, o)), rot);

/* ===================== MARTA EN EL CÍRCULO (planos B) ===================== */
function martaCircle(cx, cy, r, t, T, ranges, o = {}) {
  const sc = r / 22, id = 'mc' + (uid++);
  const px = cx - 2 * sc, foot = cy + (204 - 90) * sc;
  let g = `<circle cx="${f(cx + 10)}" cy="${f(cy + 10)}" r="${r}" fill="${INK}"/>`;
  g += `<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><g clip-path="url(#${id})">`;
  g += `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="${C.sky}"/>`;
  g += cloud(cx - r * 0.9 - ((T * 14) % 60), cy - r * 0.55, 0.42);
  g += marta11(px, foot, sc, mState(t, T, sc, ranges, { expr: o.expr || 'happy' }));
  g += `</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.3)}"/>`;
  return g;
}

/* ===================== MARCO DE LA IMAGEN INSERTADA ===================== */
// inner se dibuja en coordenadas locales 0..wd x 0..ht; z = zoom lento centrado
function insetFrame(x, y, wd, ht, z, inner) {
  const id = 'in' + (uid++), r = 34;
  let s = `<rect x="${x + 16}" y="${y + 16}" width="${wd}" height="${ht}" rx="${r}" fill="${INK}"/>`;
  s += `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${wd}" height="${ht}" rx="${r}"/></clipPath>`;
  s += `<g clip-path="url(#${id})"><g transform="translate(${f(x + wd / 2)} ${f(y + ht / 2)}) scale(${f(z)}) translate(${f(-wd / 2)} ${f(-ht / 2)})">${inner}</g></g>`;
  s += `<rect x="${x}" y="${y}" width="${wd}" height="${ht}" rx="${r}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.8)}"/>`;
  return s;
}
function dotBg(col = C.cream) {
  let s = `<rect width="${W}" height="${H}" fill="${col}"/>`;
  for (let y = 20; y < H; y += 44) for (let x = 20 + (Math.round(y / 44) % 2) * 22; x < W; x += 44) s += `<circle cx="${x}" cy="${y}" r="4" fill="${DOT}" opacity="0.7"/>`;
  return s;
}

/* ===================== PIEZAS DE LAS IMÁGENES ===================== */
// zapato rojo de tacón (centro inferior x,y; s = escala; unos 110 x 60)
function heelShoe(x, y, s, rot = 0) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})">
    <path d="M-52 0 L-46 -40 Q-44 -50 -36 -44 Q-10 -16 30 -14 Q52 -12 54 0 Z" fill="${C.red}" ${st11(1 / s)}/>
    <path d="M-50 0 L-50 22 L-40 22 L-38 0" fill="${C.dred}" ${st11(1 / s)}/>
    <path d="M-36 -36 Q-10 -10 30 -8" stroke="#FFFFFF" stroke-width="${f(SW * 0.8 / s)}" fill="none" stroke-linecap="round" opacity="0.6"/>
    <path d="M-30 -4 Q0 4 44 -2" stroke="${C.dred}" stroke-width="${f(SW * 0.8 / s)}" fill="none"/></g>`;
}
// etiqueta amarilla colgante
function yelTag(x, y, str, k = 1, rot = 0, size = 54) {
  if (k <= 0.01) return '';
  const tw = measure(str, size), pw = tw + 70, ph = size * 1.5;
  let g = `<path d="M0 ${f(-ph / 2 - 50)} L${f(-pw * 0.18)} ${f(-ph / 2)} M0 ${f(-ph / 2 - 50)} L${f(pw * 0.18)} ${f(-ph / 2)}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
  g += `<path d="M${f(-pw / 2 + 24)} ${f(-ph / 2)} H${f(pw / 2)} V${f(ph / 2)} H${f(-pw / 2 + 24)} L${f(-pw / 2)} 0Z" transform="translate(8 8)" fill="${INK}"/>`;
  g += `<path d="M${f(-pw / 2 + 24)} ${f(-ph / 2)} H${f(pw / 2)} V${f(ph / 2)} H${f(-pw / 2 + 24)} L${f(-pw / 2)} 0Z" fill="${C.yel}" ${st11()}/>`;
  g += `<circle cx="${f(-pw / 2 + 22)}" cy="0" r="8" fill="${C.cream}" ${st11(0.7)}/>`;
  g += text(str, 16, size * 0.06, { size, fill: INK, stroke: null, shadow: false });
  return at(x, y, k, g, rot);
}
// móvil grande flotante con la notificación (x,y = centro)
function notifPhone(x, y, k, rot, t, kind = 'novedad') {
  if (k <= 0.01) return '';
  const PW = 230, PH = 420;
  let g = `<rect x="${-PW / 2 + 14}" y="${-PH / 2 + 14}" width="${PW}" height="${PH}" rx="36" fill="${INK}"/>`;
  g += `<rect x="${-PW / 2}" y="${-PH / 2}" width="${PW}" height="${PH}" rx="36" fill="${INK}" ${st11()}/>`;
  g += `<rect x="${-PW / 2 + 14}" y="${-PH / 2 + 14}" width="${PW - 28}" height="${PH - 28}" rx="24" fill="${C.cream}"/>`;
  g += `<rect x="-34" y="${-PH / 2 + 4}" width="68" height="8" rx="4" fill="#3A3434"/>`;
  // tarjeta de notificación
  const ny = -PH / 2 + 34, nk = pop(t, 0.15, 0.45);
  let n = `<rect x="-98" y="0" width="196" height="96" rx="18" fill="#FFFFFF" ${st11(0.8)}/>`;
  n += `<circle cx="-66" cy="48" r="23" fill="#FFFFFF" ${st11(0.6)}/>` + logoIcon(-66, 50, 42);
  n += text('¡Novedad!', -36, 32, { size: fit('¡Novedad!', 32, 124), anchor: 'start', fill: C.red, stroke: null, shadow: false });
  n += `<rect x="-36" y="56" width="110" height="10" rx="5" fill="${INK}" opacity="0.3"/><rect x="-36" y="72" width="76" height="10" rx="5" fill="${INK}" opacity="0.3"/>`;
  g += at(0, ny, nk, `<g transform="translate(0 0)">${n}</g>`);
  // imagen: vestido nuevo
  g += `<rect x="-90" y="${f(ny + 112)}" width="180" height="200" rx="16" fill="${C.glass}" ${st11(0.7)}/>`;
  g += dressIcon(0, ny + 222, 1.25, t);
  g += sparkle(62, ny + 140, 16, 0.6 + 0.4 * Math.sin(t * 8));
  return at(x, y, k, g, rot);
}
// caja de cartón abierta sobre el mostrador (x = centro, base = fondo de la caja)
function cardboardBox(x, base, wd, ht) {
  const x0 = x - wd / 2, top = base - ht, BR = '#C98A4B', BRS = '#A9743F';
  let s = '';
  // solapas traseras
  s += `<path d="M${f(x0 + 10)} ${f(top)} L${f(x0 + 40)} ${f(top - 70)} L${f(x0 + wd - 40)} ${f(top - 70)} L${f(x0 + wd - 10)} ${f(top)}Z" fill="${BRS}" ${st11()}/>`;
  return { back: s, front: () => {
    let f_ = `<rect x="${f(x0 + 12)}" y="${f(top + 12)}" width="${wd}" height="${ht}" rx="8" fill="${INK}"/>`;
    f_ += `<rect x="${f(x0)}" y="${f(top)}" width="${wd}" height="${ht}" rx="8" fill="${BR}" ${st11()}/>`;
    f_ += `<rect x="${f(x0 + wd * 0.72)}" y="${f(top)}" width="${f(wd * 0.28)}" height="${ht}" rx="8" fill="${BRS}" opacity="0.6"/>`;
    f_ += `<path d="M${f(x0)} ${f(top)} L${f(x0 - 70)} ${f(top + 50)} L${f(x0 - 40)} ${f(top + 78)} L${f(x0 + 10)} ${f(top + 26)}Z" fill="${BR}" ${st11()}/>`;
    f_ += `<path d="M${f(x0 + wd)} ${f(top)} L${f(x0 + wd + 70)} ${f(top + 50)} L${f(x0 + wd + 40)} ${f(top + 78)} L${f(x0 + wd - 10)} ${f(top + 26)}Z" fill="${BRS}" ${st11()}/>`;
    f_ += `<rect x="${f(x - 40)}" y="${f(top)}" width="80" height="${f(ht * 0.32)}" fill="${C.cream}" opacity="0.55"/>`;
    f_ += `<path d="M${f(x0 + 30)} ${f(base - 34)} H${f(x0 + 120)}" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linecap="round" opacity="0.5"/>`;
    return f_;
  } };
}
// maniquí sin ropa (escaparate aún vacío)
function bareMannequin(x, base, s) { return mannequin(x, base, s, '#F4E9E4', '#E0D3CD'); }

/* ---------- 1) NOVEDADES: trastienda (local 880x880) ---------- */
function insetNovedades(u, T) {
  let s = `<rect width="880" height="880" fill="#F7E1CF"/>`;
  for (let x = 30; x < 880; x += 120) s += `<rect x="${x}" y="0" width="46" height="880" fill="#FBEBDD"/>`;
  // escaparate visto desde dentro (vacío): marco de madera, cristal, calle desenfocada en plano
  const wx = 70, wy = 60, ww = 740, wh = 380;
  s += `<rect x="${wx - 22 + 12}" y="${wy - 22 + 12}" width="${ww + 44}" height="${wh + 44}" rx="20" fill="${INK}"/>`;
  s += `<rect x="${wx - 22}" y="${wy - 22}" width="${ww + 44}" height="${wh + 44}" rx="20" fill="${C.wood}" ${st11()}/>`;
  s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="10" fill="${C.sky}"/>`;
  // al otro lado del cristal: fachadas de enfrente y acera
  s += `<rect x="${wx}" y="${wy + 150}" width="240" height="${wh - 150}" fill="${C.pink}"/><rect x="${wx + 250}" y="${wy + 120}" width="260" height="${wh - 120}" fill="#FFF1C9"/><rect x="${wx + 520}" y="${wy + 170}" width="220" height="${wh - 170}" fill="${C.navy}"/>`;
  s += awningC(wx + 260, wx + 500, wx + 250, wx + 510, wy + 150, 46, 6, C.green);
  s += `<rect x="${wx}" y="${wy + wh - 70}" width="${ww}" height="70" fill="${C.ground}"/>`;
  s += cloud(wx + 120 - ((T * 10) % 80), wy + 60, 0.45);
  s += `<path d="M${wx + ww * 0.55} ${wy} L${wx + ww * 0.68} ${wy} L${wx + ww * 0.42} ${wy + wh} L${wx + ww * 0.29} ${wy + wh}Z" fill="#FFFFFF" opacity="0.45"/>`;
  s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" rx="10" fill="none" ${st11()}/>`;
  // tarima del escaparate con peanas y un maniquí sin vestir (todavía vacío)
  s += `<rect x="${wx - 22}" y="${wy + wh - 6}" width="${ww + 44}" height="40" rx="8" fill="${C.cream}" ${st11()}/>`;
  s += plinth(wx + 150, wy + wh - 6, 110, 70) + plinth(wx + 590, wy + wh - 6, 110, 100);
  s += bareMannequin(wx + 370, wy + wh - 6, 2.4);
  // mostrador
  const ct = 640;
  s += `<rect x="-20" y="${ct}" width="920" height="300" fill="${C.wood}"/>`;
  for (let x = 40; x < 880; x += 150) s += `<rect x="${x}" y="${ct + 30}" width="50" height="300" fill="${C.woodS}" opacity="0.5"/>`;
  s += `<line x1="-20" y1="${ct + 30}" x2="900" y2="${ct + 30}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<rect x="-20" y="${ct - 16}" width="920" height="46" rx="12" fill="#C98A4B" ${st11()}/>`;
  // caja con el vestido nuevo y el zapato asomando
  const box = cardboardBox(300, ct + 4, 360, 200);
  s += box.back;
  const kd = pop(u, 0.15, 0.6), rise = (1 - easeOut((u - 0.15) / 0.5)) * 90;
  s += `<g transform="translate(0 ${f(rise)})">` + dressIcon(250, ct - 230, 2.3 * Math.max(0.01, kd), u) + `</g>`;
  const ks = pop(u, 0.45, 0.5);
  if (ks > 0.01) s += heelShoe(405, ct - 215 + (1 - ks) * 60, 1.3, -22);
  s += box.front();
  s += sparkle(160, ct - 290, 22, 0.5 + 0.5 * Math.sin(T * 7));
  s += yelTag(320, ct - 40, '¡Novedad!', pop(u, 0.7, 0.5), -6 + 4 * Math.sin(T * 2.4), 50);
  // móvil flotando delante con la notificación
  const kp = pop(u, 0.9, 0.55), fy = 10 * Math.sin(T * 2.2);
  if (kp > 0.01) {
    s += vibeRings(660, 380 + fy, u, 130, 3);
    s += notifPhone(660, 400 + fy, kp, 7 + 2 * Math.sin(T * 3), u - 0.9);
  }
  return s;
}

/* ---------- 2) DESCUENTOS: fachada con toldo y cartel 2x1 ---------- */
function sign2x1(k, t) {
  if (k <= 0.01) return '';
  let g = `<rect x="-160" y="-110" width="320" height="220" rx="26" transform="translate(12 12)" fill="${INK}"/>`;
  g += `<rect x="-160" y="-110" width="320" height="220" rx="26" fill="${C.red}" ${st11(1.1)}/>`;
  g += `<rect x="-138" y="-88" width="276" height="176" rx="16" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="16 11" opacity="0.8"/>`;
  g += text('2x1', 0, 8, { size: 170, font: 'G', sw: SW * 2.4, sd: 8 });
  // brillo
  const gl = ((t * 0.6) % 1.4) - 0.2;
  g += `<path d="M${f(-160 + gl * 400)} -110 l40 0 l-90 220 l-40 0z" fill="#FFFFFF" opacity="0.35"/>`;
  g += `<path d="M-120 -72 Q-110 -92 -84 -96" stroke="#FFFFFF" stroke-width="${f(SW * 1.2)}" fill="none" stroke-linecap="round"/>`;
  return at(0, 0, k, g);
}
function insetDescuentos(u, T) {
  let s = `<rect width="880" height="880" fill="${C.sky}"/><rect y="0" width="880" height="80" fill="${C.skyL}"/>`;
  s += cloud(760 - ((T * 12) % 300), 40, 0.4);
  // fachada
  const fx = 40, fw = 800, ftop = 70;
  s += `<rect x="${fx}" y="${ftop}" width="${fw}" height="900" rx="14" fill="#FFF1C9" ${st11()}/>`;
  s += `<rect x="${fx + fw * 0.9}" y="${ftop + 6}" width="${fw * 0.1 - 4}" height="900" fill="${INK}" opacity="0.14"/>`;
  // rótulo sin nombre (icono de percha)
  s += `<rect x="${290 + 10}" y="${ftop + 26 + 10}" width="300" height="90" rx="22" fill="${INK}"/><rect x="290" y="${ftop + 26}" width="300" height="90" rx="22" fill="${C.red}" ${st11()}/>`;
  s += `<path d="M408 ${ftop + 96} L440 ${ftop + 58} L472 ${ftop + 96}Z M440 ${ftop + 58} q0 -14 10 -14 q8 0 8 -8" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 1.1)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<circle cx="345" cy="${ftop + 71}" r="9" fill="${C.yel}" ${st11(0.6)}/><circle cx="535" cy="${ftop + 71}" r="9" fill="${C.yel}" ${st11(0.6)}/>`;
  // toldo de rayas rojas y crema
  s += awning(fx + 30, fx + fw - 30, fx - 20, fx + fw + 20, ftop + 150, 120, 8);
  // escaparate
  const wx = 80, wy = 370, ww = 520, wh = 420;
  s += glassWindow(wx, wy, ww, wh, () => {
    let g = mannequin(wx + 90, wy + wh - 14, 2.1, C.pink, '#D96C93') + mannequin(wx + ww - 90, wy + wh - 14, 2.1, C.blue, '#2F5F9E');
    g += `<line x1="${wx + 10}" y1="${wy + wh - 14}" x2="${wx + ww - 10}" y2="${wy + wh - 14}" ${st11(0.7)}/>`;
    return g;
  });
  s += `<rect x="${wx - 12}" y="${wy + wh}" width="${ww + 24}" height="26" rx="6" fill="#FFFFFF" ${st11()}/>`;
  // puerta
  s += `<rect x="640" y="${wy}" width="170" height="520" rx="12" fill="${C.navy}" ${st11()}/><rect x="668" y="${wy + 30}" width="114" height="200" rx="10" fill="${C.glass}" ${st11(0.8)}/><circle cx="785" cy="${wy + 290}" r="10" fill="${C.yel}" ${st11(0.7)}/>`;
  // acera
  s += `<rect x="-10" y="815" width="900" height="80" fill="${C.ground}"/><line x1="-10" y1="815" x2="890" y2="815" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  // el cartel entra con la mano y rebota
  const cx = 340, cy = 560;
  const kIn = easeOut((u - 0.2) / 0.45), land = 0.65;
  const sx = lerp(cx + 380, cx, kIn), sy = lerp(cy - 260, cy, kIn);
  const bounce = u > land ? 1 + 0.12 * Math.max(0, damp(u - land, 16, 6)) : 1;
  const rot = -6 + (u > land ? 5 * damp(u - land, 14, 5) : 18 * (1 - kIn));
  if (u > 0.2) {
    s += `<g transform="translate(${f(sx)} ${f(sy)}) rotate(${f(rot)}) scale(${f(bounce)})">` + sign2x1(1, T) + `</g>`;
    s += sealPct(sx + 150, sy - 95, 62, pop(u, land + 0.1, 0.45));
    // mano que lo coloca (entra y se va)
    const away = easeInOut((u - 1.25) / 0.5);
    if (away < 1) {
      const hx = sx + 158 + away * 400, hy = sy + 10 - away * 200;
      s += `<path d="M${f(hx)} ${f(hy)} L${f(hx + 360)} ${f(hy - 150)}" stroke="${INK}" stroke-width="${f(54 + SW)}" stroke-linecap="round"/>`;
      s += `<path d="M${f(hx)} ${f(hy)} L${f(hx + 360)} ${f(hy - 150)}" stroke="${C.skin}" stroke-width="${f(54 - SW)}" stroke-linecap="round"/>`;
      s += `<path d="M${f(hx + 120)} ${f(hy - 50)} L${f(hx + 360)} ${f(hy - 150)}" stroke="${INK}" stroke-width="${f(66 + SW)}" stroke-linecap="round"/><path d="M${f(hx + 120)} ${f(hy - 50)} L${f(hx + 360)} ${f(hy - 150)}" stroke="${C.blue}" stroke-width="${f(66 - SW)}" stroke-linecap="round"/>`;
      s += `<rect x="${f(hx - 36)}" y="${f(hy - 30)}" width="62" height="62" rx="24" fill="${C.skin}" ${st11()}/>`;
      s += `<path d="M${f(hx - 30)} ${f(hy - 10)} H${f(hx - 4)} M${f(hx - 30)} ${f(hy + 10)} H${f(hx - 4)}" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linecap="round"/>`;
    }
    // destello al aterrizar
    const kd = clamp((u - land) / 0.35);
    if (kd > 0 && kd < 1) s += at(cx, cy, 0.6 + kd * 0.8, starBurst11(220, kd));
    s += sparkle(cx - 190, cy - 140, 26, 0.5 + 0.5 * Math.sin(T * 8 + 1)) + sparkle(cx + 200, cy + 120, 20, 0.5 + 0.5 * Math.sin(T * 7));
  }
  return s;
}
function starBurst11(r, u) {
  let s = '';
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * 2 * PI, r1 = r * (0.7 + 0.4 * u), r2 = r1 + 60 * (1 - u) + 20;
    s += `<line x1="${f(Math.cos(a) * r1)}" y1="${f(Math.sin(a) * r1)}" x2="${f(Math.cos(a) * r2)}" y2="${f(Math.sin(a) * r2)}" stroke="${C.yel}" stroke-width="${f(SW * 2.4)}" stroke-linecap="round"/>`;
    s += `<line x1="${f(Math.cos(a) * r1)}" y1="${f(Math.sin(a) * r1)}" x2="${f(Math.cos(a) * r2)}" y2="${f(Math.sin(a) * r2)}" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linecap="round" opacity="0.7"/>`;
  }
  return s;
}

/* ---------- 3) EVENTOS: bar con escenario, músico y cata de vinos (mundo 1080x1080) ---------- */
function note11(x, y, k, rot, dbl) {
  if (k <= 0.01) return '';
  let g = `<ellipse cx="-14" cy="22" rx="17" ry="12" transform="rotate(-20 -14 22)" fill="${INK}"/><rect x="-2" y="-40" width="8" height="64" fill="${INK}"/>`;
  if (dbl) g += `<ellipse cx="36" cy="12" rx="17" ry="12" transform="rotate(-20 36 12)" fill="${INK}"/><rect x="48" y="-48" width="8" height="62" fill="${INK}"/><path d="M-2 -40 L56 -48 L56 -32 L-2 -24Z" fill="${INK}"/>`;
  else g += `<path d="M6 -40 Q30 -30 26 -6 Q22 -22 6 -24Z" fill="${INK}"/>`;
  return at(x, y, k, g, rot);
}
function wineGlass(x, base, s, fill = C.dred, tilt = 0, m = 1) {
  const st11 = v => `stroke="${INK}" stroke-width="${f(SW * v * m)}" stroke-linejoin="round"`;
  return `<g transform="translate(${f(x)} ${f(base)}) rotate(${f(tilt)}) scale(${f(s)})">
    <path d="M-16 0 H16 M0 0 V-30" stroke="${INK}" stroke-width="${f(SW * 0.9 * m / s)}" stroke-linecap="round"/>
    <path d="M-20 -78 H20 Q24 -44 0 -32 Q-24 -44 -20 -78Z" fill="${C.glass}" ${st11(0.8 / s)}/>
    <path d="M-21 -58 H21 Q18 -40 0 -34 Q-18 -40 -21 -58Z" fill="${fill}"/>
    <path d="M-20 -78 H20 Q24 -44 0 -32 Q-24 -44 -20 -78Z" fill="none" ${st11(0.8 / s)}/>
    <path d="M-11 -70 Q-13 -58 -8 -50" stroke="#FFFFFF" stroke-width="${f(SW * 0.6 * m / s)}" fill="none" stroke-linecap="round"/></g>`;
}
const wineItem = tilt => (w) => `<g transform="translate(202.5 140)">${wineGlass(0, 4, 0.3, C.dred, tilt, 1 / 2.25)}</g>`;
function chalkCata(x, y, wd, ht) {
  let s = `<rect x="${f(x - 16 + 12)}" y="${f(y - 16 + 12)}" width="${f(wd + 32)}" height="${f(ht + 32)}" rx="18" fill="${INK}"/>`;
  s += `<rect x="${f(x - 16)}" y="${f(y - 16)}" width="${f(wd + 32)}" height="${f(ht + 32)}" rx="18" fill="${C.wood}" ${st11()}/>`;
  s += `<rect x="${x}" y="${y}" width="${wd}" height="${ht}" rx="8" fill="#26302C" ${st11()}/>`;
  s += text('Cata de vinos', x + wd / 2, y + ht * 0.34, { size: fit('Cata de vinos', 64, wd - 60), fill: '#FFFFFF', stroke: null, shadow: false });
  s += `<path d="M${x + 40} ${y + ht * 0.58} H${x + wd - 40}" stroke="#FFFFFF" stroke-width="3" opacity="0.35" stroke-dasharray="14 10"/>`;
  [0.3, 0.5, 0.7].forEach((u, i) => { s += wineGlass(x + wd * u, y + ht - 20, 0.75, [C.dred, '#F2D27A', C.pink][i]); });
  return s;
}
function guitarItem(ph) {
  return w => `<g transform="rotate(${f(-28 + 2 * Math.sin(ph))} 196 126)">
    <rect x="196" y="122.5" width="34" height="4.2" rx="1.6" fill="#7E5328" stroke="${INK}" stroke-width="${w(1.6)}"/>
    <rect x="228" y="121" width="7" height="7" rx="1.6" fill="#7E5328" stroke="${INK}" stroke-width="${w(1.6)}"/>
    <path d="M178 124.6 Q178 114 188 116 Q194 117 198 119 Q204 116 207 121 Q210 126 207 131 Q204 136 198 133 Q194 136 188 135 Q178 136 178 124.6Z" fill="${C.yel}" stroke="${INK}" stroke-width="${w(2.2)}" stroke-linejoin="round"/>
    <circle cx="196" cy="125" r="3" fill="${INK}"/><path d="M200 124.6 H230" stroke="#FFFFFF" stroke-width="${w(0.6)}"/></g>`;
}
function insetEventos(u, T) {
  let s = `<rect width="1080" height="1080" fill="#FFE8C8"/>`;
  for (let x = 40; x < 1080; x += 150) s += `<rect x="${x}" y="0" width="56" height="1080" fill="#FFD2A8" opacity="0.7"/>`;
  s += `<rect width="1080" height="70" fill="${C.woodS}"/><line x1="0" y1="70" x2="1080" y2="70" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  // escenario con telón
  s += `<rect x="-20" y="110" width="520" height="560" fill="${C.dred}" ${st11()}/>`;
  for (let x = 20; x < 500; x += 70) s += `<path d="M${x} 110 Q${x + 18} 390 ${x} 670" stroke="#6E1414" stroke-width="${f(SW * 1.4)}" fill="none"/>`;
  s += `<path d="M-20 110 H500 V170 Q240 210 -20 170Z" fill="${C.red}" ${st11()}/>`;
  s += `<rect x="-20" y="660" width="540" height="110" rx="10" fill="${C.wood}" ${st11()}/><rect x="-20" y="660" width="540" height="26" fill="#C98A4B" ${st11()}/>`;
  // foco sobre el músico
  s += `<path d="M200 80 L60 660 H380Z" fill="#FFF5C2" opacity="0.35"/>`;
  // pizarra y estante con botellas tras la barra
  s += chalkCata(590, 200, 400, 240);
  s += shelf(560, 1060, 520);
  [[620, 110, 0], [700, 128, 1], [780, 100, 2], [860, 124, 3], [940, 112, 1], [1010, 96, 4]].forEach(([x, h, c]) => { s += bottle(x, 520, h, BOTTLE_C[c]); });
  // luces de colores
  s += garland(-40, 96, 560, 120, 70, T) + garland(520, 84, 1120, 78, 36, T);
  // músico (rizos) en el escenario tocando la guitarra
  const ph = 2 * PI * T * 2.4;
  s += placeFolk(4, 230, 672, 2.35, { expr: 'smile', head: 4 * Math.sin(2 * PI * T * 1.2), bob: -1.2 * Math.abs(Math.sin(2 * PI * T * 1.2)),
    armF: -22 + 9 * Math.sin(ph), armB: -62, front: guitarItem(ph), blink: blink11(T + 1) });
  // notas flotando
  for (let i = 0; i < 4; i++) {
    const p = ((T * 0.55 + i / 4) % 1);
    s += note11(330 + i * 26 + 40 * Math.sin(p * 6 + i), 440 - p * 300, (p < 0.15 ? p / 0.15 : p > 0.85 ? (1 - p) / 0.15 : 1) * 0.9, 12 * Math.sin(T * 3 + i), i % 2);
  }
  // barra con copas de vino y una botella
  s += barCounter(800);
  s += bottle(930, 790, 150, C.dred);
  [[640, C.dred], [720, '#F2D27A'], [800, C.dred], [1010, C.pink]].forEach(([x, c], i) => { s += wineGlass(x, 790, 1.05, c, 3 * Math.sin(T * 2 + i)); });
  // gente disfrutando
  const sway = i => 4 * Math.sin(2 * PI * T * 1.2 + i);
  s += placeFolk(6, 640, 1110, 2.25, { expr: 'smile', head: sway(0), armF: -95, handF: wineItem(95), blink: blink11(T + 2) });
  s += placeFolk(3, 860, 1120, 2.25, { flip: true, expr: 'wow', head: sway(1), armF: -90, handF: wineItem(90), blink: blink11(T + 0.6) });
  s += placeFolk(2, 330, 1120, 2.25, { expr: 'smile', head: sway(2), armF: -150 + 20 * Math.sin(2 * PI * T * 2), armB: 150 - 20 * Math.sin(2 * PI * T * 2), look: [-1, -1] });
  // lámparas cálidas
  s += lamp(770, 640, 1.2 * Math.sin(T * 1.6)) + lamp(1000, 640, 1.2 * Math.sin(T * 1.4 + 1));
  return s;
}

/* ---------- 4) EL MEJOR: calle de Tudela festiva (mundo de la avenida del vídeo 10) ---------- */
const FEST_WALK = [
  { i: 3, foot: 1290, sc: 1.95, v: 70, x0: -100, bag: C.red }, { i: 6, foot: 1295, sc: 1.95, v: -60, x0: 900, bag: C.yel },
  { i: 9, foot: 1300, sc: 1.95, v: 55, x0: 420, bag: C.green }, { i: 10, foot: 1292, sc: 1.95, v: -75, x0: 230, bag: C.blue },
  { i: 12, foot: 1360, sc: 2.1, v: 85, x0: 120, bag: C.pink }, { i: 7, foot: 1370, sc: 2.1, v: -80, x0: 1000, bag: C.red },
  { i: 1, foot: 1365, sc: 2.1, v: 65, x0: 650, bag: C.yel }, { i: 13, foot: 1362, sc: 2.1, v: -70, x0: 520, bag: C.green }
];
const FEST_KIDS = [{ i: 4, x0: 330, v: 60, foot: 1395, sc: 1.35, bal: C.red }, { i: 8, x0: 820, v: -55, foot: 1392, sc: 1.3, bal: C.yel }];
function balloon(hx, hy, col, t) {
  const bx = hx + 8 * Math.sin(t * 2), by = hy - 170;
  return `<path d="M${f(hx)} ${f(hy)} Q${f(hx + 16)} ${f(hy - 80)} ${f(bx)} ${f(by + 46)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/>
    <ellipse cx="${f(bx + 7)}" cy="${f(by + 7)}" rx="38" ry="46" fill="${INK}"/><ellipse cx="${f(bx)}" cy="${f(by)}" rx="38" ry="46" fill="${col}" ${st11()}/>
    <path d="M${f(bx - 6)} ${f(by + 46)} l6 10 l6 -10z" fill="${col}" ${st11(0.6)}/><ellipse cx="${f(bx - 14)}" cy="${f(by - 16)}" rx="7" ry="12" fill="#FFFFFF" opacity="0.6"/>`;
}
function bigHeart(x, y, r, k, t) {
  if (k <= 0.01) return '';
  const beat = 1 + 0.08 * Math.max(0, Math.sin(t * 2 * PI * 1.3)) ** 4;
  const d = heartPath(r);
  return at(x, y, k * beat, `<path d="${d}" transform="translate(14 14)" fill="${INK}"/><path d="${d}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW * 1.4)}" stroke-linejoin="round"/>
    <path d="M${f(-r * 0.62)} ${f(-r * 0.48)} Q${f(-r * 0.5)} ${f(-r * 0.86)} ${f(-r * 0.14)} ${f(-r * 0.62)}" stroke="#FFFFFF" stroke-width="${f(SW * 1.6)}" fill="none" stroke-linecap="round"/>
    <circle cx="${f(r * 0.5)}" cy="${f(-r * 0.5)}" r="${f(r * 0.07)}" fill="#FFFFFF"/>`);
}
function festStreet(u, T) {
  let s = avenueBack(T, { sunX: 960, sunY: 300 });
  // puertas abiertas: interior cálido y hoja girada
  AV_SHOPS.forEach(sh => {
    if (sh.x < -300 || sh.x > 1100) return;
    const d = fashionGeo(sh.x, AV.base, sh.w, AV.h).door;
    s += `<rect x="${f(d.x)}" y="${f(d.y)}" width="${f(d.w)}" height="${f(d.h + 10)}" rx="${f(d.w * 0.07)}" fill="#FFE9A8" ${st11()}/>`;
    s += `<rect x="${f(d.x + d.w * 0.15)}" y="${f(d.y + d.h * 0.25)}" width="${f(d.w * 0.7)}" height="${f(d.h * 0.12)}" fill="#F2C12E" opacity="0.6"/>`;
    s += `<path d="M${f(d.x)} ${f(d.y)} L${f(d.x + d.w * 0.22)} ${f(d.y - 14)} L${f(d.x + d.w * 0.22)} ${f(d.y + d.h + 24)} L${f(d.x)} ${f(d.y + d.h + 10)}Z" fill="${C.navy}" ${st11()}/>`;
  });
  // banderines extra cruzando la calle
  s += pennants(-40, 470, 1120, 470, 90, T, 14);
  // gente con bolsas (por profundidad)
  const list = FEST_WALK.map((wk_, n) => ({ wk_, n, x: wrapX(wk_.x0 + wk_.v * u) })).sort((a, b) => a.wk_.foot - b.wk_.foot);
  list.forEach(({ wk_, n, x }) => {
    const o = walkerPose(wk_, x, u + n * 0.2, n, -9999);
    o.expr = ['smile', 'happy', 'wow', 'smile'][n % 4];
    o.look = [0.5, -0.4];
    o.head = 5 * Math.sin(T * 3 + n);
    s += walkerSvg(wk_, x, o).svg;
  });
  // niños con globo
  FEST_KIDS.forEach((kd, n) => {
    const x = wrapX(kd.x0 + kd.v * u), wp = walkPose(2 * PI * u / 0.5 + n, 0.9);
    const flip = kd.v < 0, s_ = kd.sc * (FOLK[kd.i].scale || 1);
    const [hx, hy] = toWorld(x, kd.foot, 190, 204, s_, 177.5, 140, flip);
    s += balloon(hx, hy, kd.bal, T + n);
    s += shadowEll(x, kd.foot, 26 * s_) + placeFolk(kd.i, x, kd.foot, kd.sc, { flip, expr: 'smile', legF: wp.legF, legB: wp.legB, armF: wp.armF, armB: 150, bob: wp.bob - 3 * Math.abs(Math.sin(2 * PI * u * 2)) });
  });
  return s;
}
// sello dorado «EL MEJOR» con corona
function sealMejor(x, y, r, k, rot, t = 0) {
  if (k <= 0.01) return '';
  const d = starPath(r, r * 0.88, 18);
  let g = `<path d="${d}" transform="translate(9 9)" fill="${INK}"/><path d="${d}" fill="${C.yel}" ${st11(1.1)}/>`;
  g += `<circle r="${f(r * 0.74)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-dasharray="10 8"/>`;
  // corona
  g += `<path d="M${f(-r * 0.36)} ${f(-r * 0.2)} L${f(-r * 0.42)} ${f(-r * 0.56)} L${f(-r * 0.18)} ${f(-r * 0.38)} L0 ${f(-r * 0.64)} L${f(r * 0.18)} ${f(-r * 0.38)} L${f(r * 0.42)} ${f(-r * 0.56)} L${f(r * 0.36)} ${f(-r * 0.2)}Z" fill="${C.red}" ${st11(0.8)}/>`;
  g += `<circle cx="0" cy="${f(-r * 0.7)}" r="${f(r * 0.07)}" fill="${C.cream}" ${st11(0.5)}/>`;
  g += text('EL MEJOR', 0, r * 0.18, { size: r * 0.42, font: 'G', fill: '#FFFFFF', sw: SW * 1.6, sd: 4 });
  return at(x, y, k, g, rot + 3 * Math.sin(t * 3));
}
// corazón pequeño que sube
function riseHeart(x, y, r, k, rot = 0) {
  if (k <= 0.01) return '';
  const d = heartPath(r);
  return at(x, y, k, `<path d="${d}" transform="translate(6 6)" fill="${INK}"/><path d="${d}" fill="${C.red}" ${st11(0.9)}/><circle cx="${f(-r * 0.4)}" cy="${f(-r * 0.4)}" r="${f(r * 0.15)}" fill="#FFFFFF"/>`, rot);
}
function confettiRain(T, x0, y0, wd, ht, n = 36) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const sp = 120 + 90 * hash(i * 2.3), p = (((T * sp + hash(i) * ht) % ht) + ht) % ht;
    const x = x0 + hash(i * 5.1) * wd + 30 * Math.sin(T * 2 + i);
    s += confetti(x, y0 + p, i, T);
  }
  return s;
}

/* ===================== COMENTARIOS Y GRUPOS ===================== */
// globo de comentario con «CANAL»
function commentBubble(x, y, k, rot, t) {
  if (k <= 0.01) return '';
  const wd = 420, ht = 150;
  const tl = `M-120 ${ht / 2 - 6} L-150 ${ht / 2 + 56} L-60 ${ht / 2 - 6}Z`;
  let g = `<g transform="translate(12 12)" fill="${INK}"><rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="40"/><path d="${tl}"/></g>`;
  g += `<path d="${tl}" fill="#FFFFFF" ${st11()}/>`;
  g += `<rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="40" fill="#FFFFFF" ${st11()}/>`;
  g += `<path d="M-116 ${ht / 2 - 4} H-64" stroke="#FFFFFF" stroke-width="${f(SW * 1.8)}"/>`;
  g += avatarG(-wd / 2 + 66, 0, 40, 0);
  g += text('CANAL', 40, 6, { size: 96, font: 'G', fill: C.red, sw: SW * 2, sd: 6 });
  return at(x, y, k, g, rot);
}
// avatar genérico de amigo (sin logos)
const AVS = [
  { bg: '#FFF1C9', hair: '#5A3A2A', top: C.green, skin: C.skin, long: true },
  { bg: '#DDF0E3', hair: '#1E1A1A', top: C.blue, skin: '#D9A27A', long: false },
  { bg: '#FDE3EC', hair: '#C58B3B', top: C.red, skin: C.skin, long: true },
  { bg: '#E4F4FA', hair: '#3A2A20', top: C.yel, skin: '#B97F5A', long: false }
];
function avatarG(cx, cy, r, i) {
  const a = AVS[i % 4], id = 'ag' + (uid++), k = r / 50;
  let g = `<clipPath id="${id}"><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/></clipPath><g clip-path="url(#${id})">`;
  g += `<rect x="${f(cx - r)}" y="${f(cy - r)}" width="${f(2 * r)}" height="${f(2 * r)}" fill="${a.bg}"/>`;
  if (a.long) g += `<path d="M${f(cx - 30 * k)} ${f(cy + 22 * k)} Q${f(cx - 34 * k)} ${f(cy - 40 * k)} ${f(cx)} ${f(cy - 38 * k)} Q${f(cx + 34 * k)} ${f(cy - 40 * k)} ${f(cx + 30 * k)} ${f(cy + 22 * k)}Z" fill="${a.hair}"/>`;
  g += `<path d="M${f(cx - 46 * k)} ${f(cy + 60 * k)} Q${f(cx - 44 * k)} ${f(cy + 26 * k)} ${f(cx)} ${f(cy + 24 * k)} Q${f(cx + 44 * k)} ${f(cy + 26 * k)} ${f(cx + 46 * k)} ${f(cy + 60 * k)}Z" fill="${a.top}" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/>`;
  g += `<circle cx="${f(cx)}" cy="${f(cy - 6 * k)}" r="${f(22 * k)}" fill="${a.skin}" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/>`;
  g += `<path d="M${f(cx - 23 * k)} ${f(cy - 8 * k)} Q${f(cx - 20 * k)} ${f(cy - 32 * k)} ${f(cx + 4 * k)} ${f(cy - 30 * k)} Q${f(cx + 22 * k)} ${f(cy - 28 * k)} ${f(cx + 23 * k)} ${f(cy - 10 * k)} Q${f(cx + 6 * k)} ${f(cy - 22 * k)} ${f(cx - 23 * k)} ${f(cy - 8 * k)}Z" fill="${a.hair}" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/>`;
  g += `<circle cx="${f(cx - 8 * k)}" cy="${f(cy - 4 * k)}" r="${f(2.8 * k + 0.6)}" fill="${INK}"/><circle cx="${f(cx + 8 * k)}" cy="${f(cy - 4 * k)}" r="${f(2.8 * k + 0.6)}" fill="${INK}"/>`;
  g += `<path d="M${f(cx - 7 * k)} ${f(cy + 5 * k)} Q${f(cx)} ${f(cy + 12 * k)} ${f(cx + 7 * k)} ${f(cy + 5 * k)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.55)}" stroke-linecap="round"/>`;
  g += `</g><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  return g;
}
// pulgar arriba (icono de reacción) y corazón
function reactThumb(x, y, r, k) {
  if (k <= 0.01) return '';
  return at(x, y, k, `<circle cx="5" cy="5" r="${r}" fill="${INK}"/><circle r="${r}" fill="${C.yel}" ${st11(0.8)}/>
    <path d="M${f(-r * 0.12)} ${f(-r * 0.05)} L${f(-r * 0.02)} ${f(-r * 0.55)} Q${f(r * 0.16)} ${f(-r * 0.62)} ${f(r * 0.18)} ${f(-r * 0.36)} L${f(r * 0.12)} ${f(-r * 0.12)} H${f(r * 0.42)} Q${f(r * 0.56)} ${f(-r * 0.08)} ${f(r * 0.48)} ${f(r * 0.08)} L${f(r * 0.38)} ${f(r * 0.44)} Q${f(r * 0.32)} ${f(r * 0.52)} ${f(r * 0.2)} ${f(r * 0.52)} H${f(-r * 0.12)}Z" fill="#FFFFFF" ${st11(0.55)}/>
    <rect x="${f(-r * 0.46)}" y="${f(-r * 0.08)}" width="${f(r * 0.3)}" height="${f(r * 0.62)}" rx="3" fill="${C.blue}" ${st11(0.55)}/>`);
}
function reactHeart(x, y, r, k) {
  if (k <= 0.01) return '';
  return at(x, y, k, `<circle cx="5" cy="5" r="${r}" fill="${INK}"/><circle r="${r}" fill="#FFFFFF" ${st11(0.8)}/>` +
    `<path d="${heartPath(r * 0.5)}" transform="translate(0 ${f(r * 0.02)})" fill="${C.red}" ${st11(0.55)}/>`);
}
// burbuja de chat verde genérica con avatar; recibe el enlace (logo + líneas) y reacciona
function chatBubble(x, y, k, i, t, react) {
  if (k <= 0.01) return '';
  const wd = 400, ht = 128;
  let g = avatarG(-wd / 2 - 70, 0, 52, i);
  g += `<path d="M${-wd / 2} -20 L${-wd / 2 - 24} 6 L${-wd / 2 + 6} 14Z" fill="#CFEFD9" ${st11(0.8)}/>`;
  g += `<rect x="${-wd / 2 + 10}" y="${-ht / 2 + 10}" width="${wd}" height="${ht}" rx="28" fill="${INK}"/>`;
  g += `<rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="28" fill="#CFEFD9" ${st11(0.8)}/>`;
  g += `<path d="M${-wd / 2 + 2} -14 L${-wd / 2 + 2} 10" stroke="#CFEFD9" stroke-width="${f(SW * 1.4)}"/>`;
  // enlace recibido
  g += `<rect x="${-wd / 2 + 18}" y="${-ht / 2 + 16}" width="96" height="96" rx="16" fill="#FFFFFF" ${st11(0.6)}/>` + logoIcon(-wd / 2 + 66, 2, 84);
  g += `<rect x="-60" y="-34" width="200" height="16" rx="8" fill="${C.green}" opacity="0.8"/><rect x="-60" y="-6" width="230" height="14" rx="7" fill="${INK}" opacity="0.3"/><rect x="-60" y="18" width="150" height="14" rx="7" fill="${INK}" opacity="0.3"/>`;
  // dobles marcas de recibido
  g += `<path d="M120 40 l8 8 l14 -16 M134 40 l8 8 l14 -16" stroke="${C.blue}" stroke-width="${f(SW * 0.6)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (react) g += (i % 2 ? reactHeart(wd / 2 - 6, ht / 2 - 2, 34, react) : reactThumb(wd / 2 - 6, ht / 2 - 2, 34, react));
  return at(x, y, k, g);
}
// avioncito de papel (compartir genérico)
function paperPlane(x, y, s, rot = 0) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})">
    <path d="M-50 -6 L54 -40 L-6 50 L-14 14Z" transform="translate(6 6)" fill="${INK}"/>
    <path d="M-50 -6 L54 -40 L-14 14Z" fill="#FFFFFF" ${st11(0.8 / s)}/><path d="M54 -40 L-6 50 L-14 14Z" fill="${C.glass}" ${st11(0.8 / s)}/>
    <path d="M54 -40 L-14 14 L-8 30" fill="none" ${st11(0.8 / s)}/></g>`;
}
function shareIcon(x, y, r, k) {
  if (k <= 0.01) return '';
  return at(x, y, k, `<circle cx="7" cy="7" r="${r}" fill="${INK}"/><circle r="${r}" fill="${C.green}" ${st11()}/>` + paperPlane(-2, 2, r / 80, -8));
}
// flecha curva hacia abajo
function arrowDown(x, y, len, k, t) {
  if (k <= 0.01) return '';
  const dy = 12 * Math.sin(t * 7);
  const d = `M0 0 Q40 ${f(len * 0.45)} 0 ${f(len)}`;
  return at(x, y + dy, k, `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${f(SW * 4)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 1.8)}" stroke-linecap="round"/>
    <path d="M-44 ${f(len - 40)} L0 ${f(len + 22)} L44 ${f(len - 40)}Z" fill="#FFFFFF" ${st11(1.1)}/>`);
}
// pastilla «Canal de WhatsApp» con icono genérico de chat (sin logos)
function channelPill(x, y, k) {
  if (k <= 0.01) return '';
  const str = 'Canal de WhatsApp', size = 46, tw = measure(str, size), pw = tw + 130, ph = 84;
  let g = `<rect x="${f(-pw / 2 + 8)}" y="${f(-ph / 2 + 8)}" width="${f(pw)}" height="${ph}" rx="42" fill="${INK}"/>`;
  g += `<rect x="${f(-pw / 2)}" y="${f(-ph / 2)}" width="${f(pw)}" height="${ph}" rx="42" fill="${C.green}" ${st11()}/>`;
  const ix = -pw / 2 + 50;
  g += `<path d="M${ix - 22} -18 H${ix + 22} Q${ix + 28} -18 ${ix + 28} -12 V8 Q${ix + 28} 14 ${ix + 22} 14 H${ix - 4} L${ix - 16} 26 L${ix - 14} 14 H${ix - 22} Q${ix - 28} 14 ${ix - 28} 8 V-12 Q${ix - 28} -18 ${ix - 22} -18Z" fill="#FFFFFF" ${st11(0.6)}/>`;
  g += `<circle cx="${ix - 11}" cy="-2" r="3.5" fill="${INK}"/><circle cx="${ix}" cy="-2" r="3.5" fill="${INK}"/><circle cx="${ix + 11}" cy="-2" r="3.5" fill="${INK}"/>`;
  g += text(str, ix + 44, 3, { size, anchor: 'start', fill: '#FFFFFF', sw: SW * 1.4, sd: 4 });
  return at(x, y, k, g);
}
