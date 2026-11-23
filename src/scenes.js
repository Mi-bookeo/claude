/* Vídeo 13 — «José y las tortillas». Escenas sobre lib.js + series.js + rosa.js + v04…v13.js.
   Todo se calcula a partir de (t local de la escena, T global). Duraciones, planos (shots) y momentos (cues) se
   leen de config.json. Franja inferior (y > 1400) libre de textos y elementos importantes; margen superior hasta
   y=192. Cortes secos entre escenas y entre planos; textos con rebote; zoom rápido tipo cómic al empezar cada plano. */
'use strict';

const S = {};
let SUBS = null;
function shotAt(t, sc) {
  const e = Object.entries(sc.shots || { A: [0, sc.duration] });
  for (const [k, [a, b]] of e) if (t >= a && t < b) return [k, a, b];
  const [k, [a, b]] = e[e.length - 1];
  return [k, a, b];
}
const comicZoom = (u, from = 1.14) => lerp(from, 1, easeOut(u / 0.22));
const cues = (sc, def) => Object.assign({}, def, sc.cues || {});
const bumpZ = (t, times, a = 0.03) => 1 + times.reduce((m, t0) => m + (t >= t0 ? a * Math.max(0, damp(t - t0, 14, 6)) : 0), 0);
const life = (t, t0, t1, d = 0.45) => pop(t, t0, d) * (t1 === undefined ? 1 : 1 - easeOut((t - t1) / 0.18));

/* ---------- plano medio del bar (José detrás de la barra, a la izquierda) ---------- */
const MED = { top: 1110, jx: 330, jsc: 6, bar1: 760, floor: 1170 };
MED.jy = MED.top + (208 - 138) * MED.jsc;
const MED_ROOM = { clock: [130, 600, 78], posters: [[440, 470, 220, 220, 0]], shelf: [700, 1060, 560, 740] };
const MED_SLOTS = TORT_SLOTS(92, 672, MED.top - 34, 5);
// mesa alta del fondo (a la derecha de la barra) con el cliente del café
function backCorner(T, withClient) {
  let s = `<rect x="${MED.bar1 - 10}" y="${MED.floor}" width="${W - MED.bar1 + 20}" height="${H - MED.floor}" fill="#E9D3C5"/>`;
  for (let x = MED.bar1 + 40; x < W + 200; x += 120) s += `<line x1="${x}" y1="${MED.floor}" x2="${x - 160}" y2="${H}" stroke="${INK}" stroke-width="${f(SW * 0.5)}" opacity="0.5"/>`;
  s += `<line x1="${MED.bar1 - 10}" y1="${MED.floor}" x2="${W}" y2="${MED.floor}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  // mesa alta
  const tx = 870, tt = 1130;
  s += `<rect x="${tx - 9 + 6}" y="${tt}" width="18" height="${1330 - tt}" fill="${INK}"/><rect x="${tx - 9}" y="${tt}" width="18" height="${1330 - tt}" rx="6" fill="${P5.woodS}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<ellipse cx="${tx}" cy="1334" rx="70" ry="14" fill="${P5.woodS}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  if (withClient) {
    const sip = (T % 4.2) > 3.0 && (T % 4.2) < 3.8;
    s += placeFolk(7, 975, 1330, 3.1, { flip: true, expr: sip ? 'bored' : 'happy', armF: sip ? -120 : -40, armB: 6, bob: breath(T) * 0.5,
      handF: sip ? (wk => `<g transform="translate(202.5 140) scale(${f(1 / 3.1)})">${coffeeCup(0, 20, 0.8)}</g>` + hand(202.5, 139.5, wk, FOLK[7].skin)) : null });
  }
  s += `<rect x="${tx - 90 + 7}" y="${tt - 14 + 7}" width="180" height="26" rx="12" fill="${INK}"/><rect x="${tx - 90}" y="${tt - 14}" width="180" height="26" rx="12" fill="#C98A4B" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  if (withClient && !((T % 4.2) > 3.0 && (T % 4.2) < 3.8)) s += coffeeCup(tx - 30, tt - 14, 0.8);
  return s;
}
// escena completa del plano medio. o: tm, clockK, client, left (tortillas que quedan), jose (opciones de pose)
function medBar(t, T, o = {}) {
  let s = barRoom(T, Object.assign({}, MED_ROOM, { tm: o.tm || 960, clockK: o.clockK, clockWob: o.clockWob }));
  s += backCorner(T, o.client);
  s += placeJose(MED.jx, MED.jy, MED.jsc, Object.assign({ bob: breathJ(T, MED.jsc), blink: blinkJ(T) }, o.jose || {}));
  s += barFront(MED.top, MED.bar1);
  s += counterFood(MED_SLOTS, o.left === undefined ? 5 : o.left, 56);
  for (let i = 0; i < 4; i++) s += pinchoPlate(165 + i * 145, MED.top + 34, 0.74);
  return s;
}
const jHead = () => jPt(MED.jx, MED.jy, MED.jsc, 190, 76);

/* ---------- plano general del bar (barra a lo ancho, José al centro, clientes delante) ---------- */
const WIDE = { top: 980, jx: 540, jsc: 4.3, back: 1440, front: 1610, bsc: 3.6, fsc: 4.2 };
WIDE.jy = WIDE.top + (208 - 138) * WIDE.jsc;
const WIDE_ROOM = { clock: [150, 560, 70], posters: [[290, 400, 170, 200, 0]], shelf: [600, 1060, 600, 760], lampR: 0.9 };
const WIDE_SLOTS = TORT_SLOTS(70, 1010, WIDE.top - 18, 7);
// clientes: [fila, x, folk (o 'pedro'), mira a la izquierda, objeto]
const CROWD = [
  ['b', 70, 0, false, 'glass'], ['b', 210, 9, false, 'pincho'], ['b', 355, 4, false, 'phone'], ['b', 725, 8, true, 'pincho'], ['b', 870, 1, true, 'glass'], ['b', 1015, 3, true, 'glass'],
  ['f', 110, 10, false, 'glass'], ['f', 275, 11, false, 'pincho'], ['f', 440, F_ROSA, false, 'glass'], ['f', 600, 'pedro', false, 'both'], ['f', 760, 6, true, 'glass'], ['f', 915, F_CUADROS, true, 'pincho'], ['f', 1065, 5, true, 'none']
];
function crowdMember(m, idx, t, T, o = {}) {
  const [row, x, who, flip, item] = m;
  const foot = row === 'b' ? WIDE.back : WIDE.front, sc = row === 'b' ? WIDE.bsc : WIDE.fsc;
  const ph = T * 2.1 + idx * 1.7;
  const lift = Math.max(0, Math.sin(ph)) ** 3;
  const bob = -1.5 * (0.5 - 0.5 * Math.cos(T * 3 + idx));
  const exprs = o.exprs || ['happy', 'smile', 'sparkle', 'smile', 'happy', 'wink'];
  const expr = exprs[(idx + Math.floor(T / 1.3)) % exprs.length];
  if (who === 'pedro') {
    const pa = -52 - 26 * lift;
    return shadowEll(x, foot + 4, 26 * sc) + placePedro(x, foot + 6, sc * 1.02, { armF: pa, armB: -58, bob, head: -2, expr: o.pedroExpr || 'grin', blink: blinkJ(T, 1.1),
      itemF: (wk, hx, hy) => glassItem(wk, hx, hy, { tilt: 8 * lift }), itemB: (wk, hx, hy) => pintxoItem(wk, hx, hy) });
  }
  let handF = null, armF = 10, armB = 6;
  if (item === 'glass') { armF = -48 - 40 * lift; handF = wk => glassItem(wk, 202.5, 139.5, { skin: FOLK[who].skin, tilt: 10 * lift }); }
  if (item === 'pincho') { armF = -60 - 30 * lift; handF = wk => pintxoItem(wk, 202.5, 139.5, FOLK[who].skin); }
  if (item === 'phone') { armF = -70; handF = phoneHand(202.5, 139.5, { lit: true, card: 3, skin: FOLK[who].skin }); }
  return shadowEll(x, foot + 4, 24 * sc) + placeFolk(who, x, foot, sc, { flip, expr, armF, armB, bob, head: flip ? 3 : -3, handF });
}
function wideBar(t, T, o = {}) {
  let s = barRoom(T, Object.assign({}, WIDE_ROOM, { tm: o.tm || 18 * 60 }));
  s += beerTap(770, WIDE.top);
  s += placeJose(WIDE.jx, WIDE.jy, WIDE.jsc, Object.assign({ bob: breathJ(T, WIDE.jsc), blink: blinkJ(T) }, o.jose || {}));
  s += barFront(WIDE.top);
  s += counterFood(WIDE_SLOTS, o.left === undefined ? 7 : o.left, 44);
  if (o.canas) o.canas.forEach(x => { s += canaJ(x, WIDE.top + 4, 64); });
  const show = o.show || CROWD.map((_, i) => i);
  CROWD.forEach((m, i) => { if (m[0] === 'b' && show.includes(i)) s += crowdMember(m, i, t, T, o); });
  CROWD.forEach((m, i) => { if (m[0] === 'f' && show.includes(i)) s += crowdMember(m, i, t, T, o); });
  return s;
}
// José sirviendo cañas (brazo delantero con la caña, el trasero apoyado)
const servePose = (T, extra = {}) => {
  const u = 0.5 - 0.5 * Math.cos(T * 2 * PI / 1.4);
  return Object.assign({ expr: 'happy', armB: JP.counterB, armF: { h: [lerp(222, 232, u), lerp(112, 126, u)], side: 1, hand: 'glass', tilt: lerp(-6, 4, u) }, look: [0.6, 0.8] }, extra);
};

/* ---------- 1) Bar La Tortilla, 16:00 ---------- */
const G1 = 1330, FEET1 = 1392;
S[1] = (t, T, sc) => {
  const c = cues(sc, { title: 0.2, hour: 0.5 });
  let w = sky13(T, 'day', { band: 900, sx: 900, sy: 560, sr: 60 });
  w += shop(-290, G1, 440, 560, SHOP_TYPES[1]) + shop(890, G1, 440, 560, SHOP_TYPES[2]);
  w += barFacade13(230, G1, 620, 720);
  w += ground(G1, 0, { sp: 230 });
  w += lampPost13(110, FEET1 + 4, 860, false);
  w += sandwichBoard(170, FEET1 + 2, 1.05);
  // calle tranquila: una vecina pasea despacio
  const x = lerp(1180, 820, t / 4.2), ph = 2 * PI * t / 1.1;
  w += shadowEll(x, FEET1 + 4, 70) + placeFolk(8, x, FEET1, 3.6, Object.assign(walkPose(ph, 0.6), { flip: true, expr: 'happy', blink: blinkJ(T) }));
  let s = cam(comicZoom(t), 540, 900, w);
  s += bigT('Bar La Tortilla', 540, 270, 140, pop(t, c.title, 0.5), -3, { font: 'G', ls: 2 });
  s += hourBox(540, 440, 16 * 60, pop(t, c.hour, 0.5), 3 * damp(t - c.hour, 10, 3));
  return s;
};

/* ---------- 2) Poca gente: José con los brazos cruzados ante la barra llena ---------- */
S[2] = (t, T, sc) => {
  const c = cues(sc, { title: 0.25, sigh: 1.6 });
  const sigh = t > c.sigh && t < c.sigh + 1.2 ? Math.sin((t - c.sigh) / 1.2 * PI) : 0;
  let w = medBar(t, T, { tm: 16 * 60, client: true, jose: { arms: 'crossed', expr: 'tired', look: [1.2, 1.4], head: 3 + 3 * sigh, bob: breathJ(T, MED.jsc) + 1.2 * sigh } });
  const [hx, hy] = jHead();
  if (sigh > 0) w += sighPuff(hx + 130, hy + 80, clamp((t - c.sigh) / 1.2));
  let s = cam(comicZoom(t), 540, 900, w);
  s += bigT('Poca gente', 540, 262, 128, pop(t, c.title, 0.5), -3);
  s += bigT('esta mañana', 540, 384, 128, pop(t, c.title + 0.2, 0.5), 2, { fill: C.yel });
  return s;
};

/* ---------- 3) ¿Tirarlas? Mano a la cabeza; nube con las tortillas al cubo ---------- */
function thoughtBin(cx, cy, k, t, T) {
  if (k <= 0.01) return '';
  let g = '';
  const bx = cx + 120, bb = cy + 150;
  const per = 0.9, n = Math.floor(t / per), u = (t % per) / per;
  const open = 0.5 + 0.5 * Math.sin(Math.min(1, u * 1.4) * PI);
  g += trashBin(bx, bb, 0.95, t > 0.2 ? open : 0);
  // tortillas que caen una tras otra (desde la izquierda, en arco)
  if (t > 0.2) {
    const x = lerp(cx - 210, bx, u), y = lerp(cy - 120, bb - 170, u) - 170 * Math.sin(u * PI);
    if (u < 0.92) g += tortilla(x, y, 46, u * 340);
  }
  // montón de tortillas esperando
  const left = Math.max(1, 4 - (t > 0.2 ? n : 0));
  for (let i = 0; i < left; i++) g += tortilla(cx - 200 + (i % 2) * 40, cy + 110 - i * 36, 44, -8 + i * 5);
  g += sparkle(cx - 60, cy - 150, 18, 0.7 + 0.3 * Math.sin(t * 9));
  return at(cx, cy, k, `<g transform="translate(${-cx} ${-cy})">${g}</g>`);
}
function thinkDots(fromX, fromY, toX, toY, t, t0) {
  let s = '';
  [0.2, 0.45, 0.72].forEach((u, i) => { s += thinkDot(lerp(fromX, toX, u), lerp(fromY, toY, u), 16 + i * 10, pop(t, t0 + i * 0.08, 0.4)); });
  return s;
}
const CLOUD_M = [760, 650, 600, 480];
S[3] = (t, T, sc) => {
  const c = cues(sc, { title: 0.3, hand: 0.1, cloud: 0.45 });
  const kh = easeOut((t - c.hand) / 0.3);
  const shake = 1.5 * Math.sin(t * 9) * (t > 0.4 ? 1 : 0);
  const headPose = { h: [lerp(214, 205, kh), lerp(140, 64, kh)], side: -1, hand: kh > 0.6 ? 'open' : 'fist', hs: 1.45, hrot: -40 };
  let w = medBar(t, T, { tm: 16 * 60 + 5, client: true, jose: { expr: 'sad', armF: headPose, armB: JP.counterB, head: 4 + shake, look: [1.4, -1] } });
  const [hx, hy] = jHead();
  let s = cam(comicZoom(t), 540, 900, w);
  const [cx, cy, cw, ch] = CLOUD_M;
  s += thinkDots(hx + 110, hy - 70, cx - cw * 0.42, cy + ch * 0.32, t, c.cloud - 0.15);
  const kc = pop(t, c.cloud, 0.55), fl = 6 * Math.sin(t * 2.2);
  s += thinkCloud(cx, cy + fl, cw, ch, kc);
  s += thoughtBin(cx, cy + fl, kc, t - c.cloud, T);
  s += bigT('¿Tirarlas?', 540, 290, 170, pop(t, c.title, 0.5), -4, { font: 'G', ls: 2 });
  // gotita de pena
  s += at(hx - 120, hy - 50, pop(t, 0.6, 0.4), `<path d="M0 -26 Q16 0 0 12 Q-16 0 0 -26Z" fill="${C.glass}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`);
  return s;
};

/* ---------- 4) ¡Idea! Chasquido, bombilla y logo en la nube ---------- */
S[4] = (t, T, sc) => {
  const c = cues(sc, { eyes: 0.15, snap: 0.45, bulb: 0.5, title: 0.35, cloud: 0.8, logo: 1.0, flash: 1.3 });
  const snapK = t > c.snap ? Math.max(0, 1 - (t - c.snap) / 0.5) : 0;
  const ku = easeOut((t - (c.snap - 0.3)) / 0.25);
  const snapPose = { h: [lerp(214, 222, ku), lerp(138, 92, ku)], side: 1, hand: ku > 0.5 ? 'snap' : 'fist', snapK, hs: 1.45 };
  const e = t < c.eyes ? 'sad' : 'idea';
  const jolt = t > c.eyes ? -6 * Math.max(0, damp(t - c.eyes, 16, 6)) : 0;
  let w = medBar(t, T, { tm: 16 * 60 + 10, client: true, jose: { expr: e, armF: snapPose, armB: JP.counterB, head: -3, look: [0, -1], bob: breathJ(T, MED.jsc) + jolt } });
  const [hx, hy] = jHead();
  if (t > c.eyes && t < c.eyes + 0.6) w += impactLines(hx, hy, t, 26, 260);
  let s = cam(comicZoom(t) * bumpZ(t, [c.snap], 0.04), 540, 900, w);
  s += bulb(hx, hy - 210, 52, pop(t, c.bulb, 0.5), t);
  const [cx, cy, cw, ch] = CLOUD_M;
  s += thinkDots(hx + 120, hy - 60, cx - cw * 0.42, cy + ch * 0.32, t, c.cloud - 0.15);
  const kc = pop(t, c.cloud, 0.55), fl = 6 * Math.sin(t * 2.2);
  s += thinkCloud(cx, cy + fl, cw, ch, kc);
  const kl = pop(t, c.logo, 0.55);
  if (t > c.flash) s += at(cx, cy + fl, kc, rays(0, 0, 14, t * 30, '#FFF1C9', 230 * pop(t, c.flash, 0.4)));
  s += logoBadge(cx, cy + fl + 6, 360, lerp(-10, 0, kl) + 2 * Math.sin(t * 3), kl * kc, 'logoR');
  if (t > c.flash) {
    s += sparkle(cx - 220, cy - 140 + fl, 30, pop(t, c.flash, 0.4) * (0.9 + 0.2 * Math.sin(t * 13)));
    s += sparkle(cx + 230, cy - 120 + fl, 26, pop(t, c.flash + 0.08, 0.4) * (0.9 + 0.2 * Math.sin(t * 11 + 1)), C.yel);
    s += sparkle(cx + 200, cy + 160 + fl, 22, pop(t, c.flash + 0.14, 0.4));
  }
  s += bigT('¡Idea!', 300, 290, 190, pop(t, c.title, 0.5), -6, { font: 'G', fill: C.yel, ls: 2 });
  return s;
};

/* ---------- 5) Publica la oferta flash (17:00) ---------- */
// nube con el bar lleno y el cartel «20:00»
function thoughtFull(cx, cy, k, t) {
  if (k <= 0.01) return '';
  let g = '';
  g += `<rect x="-230" y="40" width="460" height="40" rx="12" fill="#C98A4B" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  const ppl = [[-190, 9], [-120, 1], [-55, 11], [10, 3], [75, 6], [140, 10], [200, 4]];
  ppl.forEach(([x, i], j) => { g += placeFolk(i, x, 175, 1.7, { flip: j > 3, expr: j % 2 ? 'smile' : 'happy', armF: -60 - 20 * Math.max(0, Math.sin(t * 5 + j)), handF: wk => glassItem(wk, 202.5, 139.5, { skin: FOLK[i].skin }) }); });
  g += `<rect x="-245" y="160" width="490" height="30" fill="#FFFFFF"/>`;
  g += hourBox(0, -110, 20 * 60, 1, -4, 0.62);
  return at(cx, cy, k, g);
}
S[5] = (t, T, sc) => {
  const c = cues(sc, { title: 0.3, hour: 0.15, seal: 0.25, finger: 2.2, press: 2.8, release: 3.05, cloud: 0.4, titleC: 0.25 });
  const [shot, a] = shotAt(t, sc);
  const u = t - a;
  if (shot === 'A') { // primer plano: José teclea en el móvil
    const sc2 = 11, px = 540, py = 760 + 132 * sc2;
    let w = barRoom(T, { shelf: [560, 1100, 520, 700], posters: [], lamps: [[160, 205], [920, 205]] });
    w += placeJose(px, py, sc2, { arms: 'phone', typePh: u * 5.5, expr: 'happy', look: [0, 2], head: 4, bob: breathJ(T, sc2), blink: blinkJ(T) });
    w += barFront(1500);
    let s = cam(comicZoom(u, 1.12), 540, 900, w);
    s += hourBox(220, 440, 17 * 60, pop(u, c.hour, 0.5), 3 * damp(u - c.hour, 10, 3));
    s += bigT('A las 6, flash', 600, 270, 130, pop(u, c.title, 0.5), -3, { fill: C.yel });
    return s;
  }
  if (shot === 'B') { // pantalla del móvil: tarjeta y botón Publicar
    let s = dotWall();
    const done = u >= c.release, press = clamp((u - c.press) / 0.12) * (1 - clamp((u - c.release) / 0.08));
    const { X, Y, PW, PH } = PHN;
    const shake = u > c.release && u < c.release + 0.3 ? 6 * Math.sin(u * 60) : 0;
    let p = phoneFrame(X, Y, PW, PH, flashScreen({ kSeal: pop(u, c.seal, 0.5), press, done, kDone: pop(u, c.release, 0.35) }, u));
    s += cam(comicZoom(u, 1.08) * bumpZ(u, [c.release], 0.03), 540, 800, p, shake);
    // dedo que pulsa el botón
    const bx = 540, by = 214 + 22 + 160 + 28 + 730 - 92;
    if (u > c.finger && u < c.release + 0.55) {
      const kin = easeOut((u - c.finger) / 0.4), kout = easeInOut((u - c.release - 0.15) / 0.4);
      const dy = lerp(700, 0, kin) + 600 * kout + (press > 0 ? 10 : 0);
      s += bigFinger(bx + 120, by + 10 + dy, 1);
    }
    if (done) {
      const kd = pop(u, c.release, 0.4);
      s += sparkle(250, by - 60, 34, kd * (0.9 + 0.2 * Math.sin(u * 13))) + sparkle(840, by - 80, 28, kd * (0.9 + 0.2 * Math.sin(u * 11 + 1)), C.yel) + sparkle(780, by + 70, 22, kd);
    }
    return s;
  }
  // C: José sonríe mirando el reloj de pared; nube con el bar lleno a las 20:00
  let w = medBar(u, T, { tm: 17 * 60, client: false, jose: { expr: u > 0.5 ? 'grin' : 'happy', armF: JP.thumbF, armB: JP.counterB, look: [-1.6, -1.2], head: -5 } });
  const [hx, hy] = jHead();
  let s = cam(comicZoom(u, 1.12), 540, 900, w);
  const [cx, cy, cw, ch] = CLOUD_M;
  s += thinkDots(hx + 110, hy - 70, cx - cw * 0.42, cy + ch * 0.32, u, c.cloud - 0.15);
  const kc = pop(u, c.cloud, 0.55), fl = 6 * Math.sin(u * 2.2);
  s += thinkCloud(cx, cy + 20 + fl, cw, ch, kc);
  s += thoughtFull(cx, cy + 20 + fl, kc, u);
  s += hourBox(220, 440, 17 * 60, pop(u, 0.05, 0.4));
  s += bigT('A las 6, flash', 600, 270, 130, pop(u, c.titleC, 0.5), -3, { fill: C.yel });
  return s;
};

/* ---------- 6) Calle a las 17:00: a todos les vibra el móvil; Pedro va al bar ---------- */
const G6 = 1330, FEET6 = 1392;
const WALK6 = [[100, 0, false], [270, 11, false], [660, 3, true], [820, 9, true]];
S[6] = (t, T, sc) => {
  const c = cues(sc, { title: 0.25, buzz: 0.35, take: 0.85, card: 1.15, smile: 2.0, go: 2.6 });
  let w = sky13(T, 'eve', { band: 880, sx: 860, sy: 700, sr: 58 });
  w += shop(-160, G6, 440, 560, SHOP_TYPES[0]) + shop(330, G6, 440, 560, SHOP_TYPES[3]);
  w += barFacade13(820, G6, 460, 600);
  w += ground(G6, 0, { sp: 230 });
  const buzz = t > c.buzz && t < c.take + 0.3;
  const take = easeOut((t - c.take) / 0.3);
  WALK6.forEach(([x, i, flip], j) => {
    const sh = buzz ? 2.4 * Math.sin(t * 70 + j) : 0;
    const r = crowdPerson({ kind: 'folk', i }, x, FEET6, 3.9, { flip, expr: t > c.card + 0.3 ? (j % 2 ? 'wow' : 'smile') : (buzz ? 'surprise' : 'happy'), armF: lerp(4, -78, take), lit: take > 0.5, card: 3, shake: sh, look: t > c.take ? [0.4, 1] : [0, 0], blink: blinkJ(T, j) });
    w += r.svg;
    if (buzz) { const [vx, vy] = t < c.take ? toWorld(x, FEET6, 190, 204, 3.9 * (FOLK[i].scale || 1), 203, 140, flip) : r.phone; w += vibeRings(vx, vy, t, 26, 3); }
  });
  // Pedro
  const PSC6 = 4.25, go = c.go;
  let px = 500, pose;
  const sh = buzz ? 2.4 * Math.sin(t * 70) : 0;
  if (t < go) {
    pose = { armF: lerp(0, -86, take), armB: 6, expr: t > c.smile ? 'grin' : (buzz ? 'surprise' : 'normal'), smile: 0.4, look: t > c.take ? [0.6, 1] : [0, 0], head: t > c.take ? 6 : 0, blink: blinkJ(T, 0.5),
      itemF: phoneItem({ lit: take > 0.5, card: 3, shake: sh }) };
  } else {
    px = lerp(500, 1010, easeInOut((t - go) / 2.3));
    pose = Object.assign(decidedWalk(t - go), { itemF: phoneItem({ lit: true, card: 3 }) });
  }
  w += shadowEll(px + 10, FEET6 + 4, 100);
  if (t > go + 0.2 && t < go + 2.1) w += speedLinesH(px - 150, 900, 180, 4, 70, SW * 1.1);
  w += placePedro(px, FEET6, PSC6, pose);
  if (buzz) { const [vx, vy] = t < c.take ? pedroPt(px, FEET6, PSC6, 210, 150) : pedroPt(px, FEET6, PSC6, 222, 112); w += vibeRings(vx, vy, t, 30, 3); }
  if (t > c.smile && t < go + 0.3) { const [tx, ty] = pedroPt(px, FEET6, PSC6, 210, 60); w += sparkle(tx + 60, ty - 40, 28, pop(t, c.smile, 0.4)) + sparkle(tx + 100, ty + 40, 18, pop(t, c.smile + 0.1, 0.4)); }
  let s = cam(comicZoom(t), 540, 900, w);
  s += notif(540, 590, 0.86 * pop(t, c.card, 0.5), lerp(-6, -2, pop(t, c.card, 0.5)), false);
  s += bigT('Oferta flash', 540, 270, 150, pop(t, c.title, 0.5), -3, { font: 'G', fill: C.yel, ls: 2 });
  s += flashSeal(950, 420, 80, pop(t, c.title + 0.25, 0.5), 10);
  return s;
};

/* ---------- 7) 18:00: el bar se llena (cortes secos: 3, 8, lleno) ---------- */
S[7] = (t, T, sc) => {
  const c = cues(sc, { hour: 0.1, title: 0.25 });
  const [shot, a] = shotAt(t, sc);
  const u = t - a;
  const SHOW = { A: [0, 4, 11], B: [0, 2, 3, 4, 7, 9, 10, 11], C: CROWD.map((_, i) => i) };
  const LEFT = { A: 7, B: 4, C: 2 };
  let w = wideBar(u, T, { tm: 18 * 60 + (shot === 'A' ? 0 : shot === 'B' ? 20 : 45), show: SHOW[shot], left: LEFT[shot], jose: servePose(T), canas: shot === 'A' ? [] : [680, 860] });
  let s = cam(comicZoom(u, 1.12), 540, 950, w);
  s += hourBox(800, 410, 18 * 60, shot === 'A' ? pop(u, c.hour, 0.5) : 1, shot === 'A' ? 3 * damp(u - c.hour, 10, 3) : 0);
  const txt = { A: 'Llegan los primeros', B: '¡Y más!', C: '¡Bar lleno!' }[shot];
  s += bigT(txt, 540, 268, shot === 'C' ? 160 : 120, pop(u, c.title, 0.5), shot === 'B' ? 3 : -3, { font: 'G', fill: shot === 'C' ? C.yel : '#FFFFFF', ls: 2 });
  if (shot === 'C') { s += sparkle(150, 230, 30, pop(u, 0.5, 0.4)); s += sparkle(960, 300, 24, pop(u, 0.6, 0.4), C.yel); }
  return s;
};

/* ---------- 8) 20:00: barra vacía, ¡todo vendido! ---------- */
S[8] = (t, T, sc) => {
  const c = cues(sc, { hour: 0.1, title: 0.35, thumb: 1.4, chin: 3.2 });
  const kt = easeOut((t - c.thumb) / 0.3);
  const jose = t < c.thumb ? servePose(T, { expr: 'grin' }) : { expr: 'proud', armB: JP.counterB, armF: { h: [lerp(222, 221, kt), lerp(120, 96, kt)], side: 1, hand: 'thumb', hs: 1.5 }, head: -4 };
  let w = wideBar(t, T, { tm: 20 * 60, left: 0, jose, show: [0, 1, 3, 4, 6, 7, 8, 9, 10, 11], canas: [300, 680, 860], exprs: ['sparkle', 'happy', 'smile', 'wink'], pedroExpr: 'laugh' });
  if (t > c.chin && t < c.chin + 1.4) w += chin(380, 1010, pop(t, c.chin, 0.4) * (1 - easeOut((t - c.chin - 1.1) / 0.25)), t);
  let s = cam(comicZoom(t, 1.12) * bumpZ(t, [c.thumb, c.chin], 0.03), 540, 950, w);
  s += hourBox(800, 410, 20 * 60, pop(t, c.hour, 0.5), 3 * damp(t - c.hour, 10, 3));
  s += bigT('¡Todo vendido!', 540, 268, 150, pop(t, c.title, 0.5), -3, { font: 'G', fill: C.yel, ls: 2 });
  if (t > c.thumb) { const [tx, ty] = jPt(WIDE.jx, WIDE.jy, WIDE.jsc, 221, 84); s += sparkle(tx + 50, ty - 30, 26, pop(t, c.thumb + 0.1, 0.4)) + sparkle(tx + 80, ty + 40, 18, pop(t, c.thumb + 0.2, 0.4), C.yel); }
  return s;
};

/* ---------- 9) José orgulloso ante la barra vacía: mensaje a los comercios ---------- */
const PROUD = { top: 1180, jx: 540, jsc: 6.4 };
PROUD.jy = PROUD.top + (208 - 138) * PROUD.jsc;
function banner13(str, x, y, k, rot = 0, size = 66, wd = 900) {
  if (k <= 0.01) return '';
  const ht = size * 1.7;
  let g = `<rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="${ht * 0.3}" transform="translate(10 10)" fill="${INK}"/><rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="${ht * 0.3}" fill="${C.red}" ${st12()}/>`;
  const lr = ht * 0.36;
  g += `<circle cx="${f(-wd / 2 + 26 + lr)}" cy="0" r="${f(lr)}" fill="#FFFFFF" ${st12(0.8)}/>` + logoI13(-wd / 2 + 26 + lr, 0, lr * 1.75);
  const tx = -wd / 2 + 26 + lr * 2 + 20, tw = wd / 2 - 30 - tx;
  g += text(str, tx + tw / 2, 3, { size: fit(str, size, tw), sw: SW * 1.6, sd: 5 });
  return at(x, y, k, g, rot);
}
S[9] = (t, T, sc) => {
  const c = cues(sc, { t1: 0.3, t2: 1.7, banner: 3.2, thumb: 4.6 });
  const kt = easeOut((t - c.thumb) / 0.3);
  const armF = t < c.thumb ? JP.hipF : { h: [lerp(212, 221, kt), lerp(132, 96, kt)], side: lerp(-1, 1, kt) > 0 ? 1 : -1, hand: kt > 0.4 ? 'thumb' : 'fist', hs: 1.5 };
  let w = barRoom(T, { clock: [130, 780, 76], tm: 20 * 60 + 10, posters: [[820, 760, 200, 210, 1]], shelf: [700, 1060, 600, 760] });
  w += placeJose(PROUD.jx, PROUD.jy, PROUD.jsc, { expr: t < c.thumb ? 'proud' : 'grin', armF, armB: JP.hipB, head: -4 + 1.5 * Math.sin(T * 2), bob: breathJ(T, PROUD.jsc) - 1.2, blink: blinkJ(T) });
  w += barFront(PROUD.top);
  const slots = TORT_SLOTS(90, 990, PROUD.top - 20, 6);
  w += counterFood(slots, 0, 52);
  w += canaJ(300, PROUD.top + 4, 70) + canaJ(790, PROUD.top + 4, 70);
  const [hx, hy] = jPt(PROUD.jx, PROUD.jy, PROUD.jsc, 190, 76);
  [[hx - 260, hy - 60, 30, 0.6], [hx + 260, hy - 90, 26, 0.75], [hx + 300, hy + 120, 20, 0.9], [hx - 300, hy + 140, 22, 1.0]].forEach(([x, y, r, t0], i) => {
    w += sparkle(x, y, r, pop(t, t0, 0.4) * (0.85 + 0.25 * Math.sin(t * 11 + i * 2)), i % 2 ? C.yel : '#FFFFFF');
  });
  let s = cam(comicZoom(t), 540, 900, w);
  s += bigT('¿Te sobra género?', 540, 262, 130, pop(t, c.t1, 0.5), -3);
  s += bigT('¡Lánzalo en oferta flash!', 540, 384, 110, pop(t, c.t2, 0.5), 2, { fill: C.yel });
  s += banner13('Escaparate de Tudela', 540, 520, pop(t, c.banner, 0.5), -2, 62, 860);
  return s;
};

/* ---------- 10) Atardecer: José en primer plano, comercios y público; tarjeta final ---------- */
const BIRDS13 = [{ t0: 0.2, d: 4.0, dir: 1, y: 640, a: 34 }, { t0: 1.4, d: 4.6, dir: -1, y: 520, a: 28 }, { t0: 3.0, d: 4.2, dir: 1, y: 760, a: 30 }];
function vFlock(x, y, a, t, i) {
  let s = '';
  [[0, 0], [-1, 1], [1, 1]].forEach(([dx, dy], j) => {
    s += bird(x + dx * a * 1.5, y + dy * a * 0.9, a * (j ? 0.8 : 1), 0.35 + 0.65 * Math.sin(t * 2 * PI / 0.34 + i * 2 + j));
  });
  return s;
}
S[10] = (t, T, sc) => {
  const c = cues(sc, { a1: 0.25, strip: 1.9, sub: 2.6, b1: 4.6, b2: 4.9, b3: 5.3, wink: 4.5 });
  const [shot, a] = shotAt(t, sc);
  if (shot === 'FIN') {
    const u = t - a;
    let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 720, 16, t * 8, C.dred);
    const kl = pop(u, 0, 0.45), bob = 6 * Math.sin(u * 3);
    s += logoBadge(540, 720 + bob, 820, lerp(-10, 0, kl), kl, 'logoW');
    const url = 'escaparatetudela.es', us = fit(url, 78, 720);
    s += at(540, 1250, pop(u, 0.25, 0.45), `<rect x="-400" y="-58" width="800" height="116" rx="58" transform="translate(10 10)" fill="${INK}"/><rect x="-400" y="-58" width="800" height="116" rx="58" fill="${C.dred}" stroke="${INK}" stroke-width="${f(SW)}"/>` + text(url, 0, 2, { size: us, sw: SW * 1.8, sd: 5 }));
    return s;
  }
  let w = sky13(T, 'dusk', { band: 1000, sx: 240, sy: 1130, sr: 84, clouds: [
    { x0: 40, y: 230, s: 0.7, v: 12 }, { x0: 760, y: 980, s: 0.75, v: 18 }, { x0: 1250, y: 560, s: 0.85, v: 14 }, { x0: 1650, y: 300, s: 0.6, v: 9 }] });
  BIRDS13.forEach((b, i) => {
    const u = (t - b.t0) / b.d;
    if (u < 0 || u > 1) return;
    const x = b.dir > 0 ? lerp(-140, W + 140, u) : lerp(W + 140, -140, u);
    w += vFlock(x, Math.min(1300, b.y + Math.sin(u * 7 + i) * 14), b.a, t, i);
  });
  w += barFacade13(-60, 1460, 560, 660, { night: true });
  w += shop(560, 1460, 520, 600, SHOP_TYPES[3]);
  w += ground(1460, 0, { sp: 230 });
  w += lampPost13(520, 1470, 820, true) + lampPost13(1010, 1470, 860, true);
  // José en primer plano (cabeza y hombros)
  const jsc = 12.5, jx = 570, jy = 990 + 132 * jsc;
  const inB = t >= c.wink;
  const kt = easeOut((t - 0.2) / 0.3), kp = easeOut((t - c.wink) / 0.25);
  const armF = !inB ? { h: [lerp(214, 222, kt), lerp(140, 100, kt)], side: 1, hand: kt > 0.4 ? 'thumb' : 'fist', hs: 1.45 }
    : { h: [221, 100 - 3 * Math.max(0, damp(t - c.wink, 12, 5))], side: 1, hand: 'thumb', hs: 1.45 };
  w += placeJose(jx, jy, jsc, { expr: inB ? (t > c.wink + 0.15 && t < c.wink + 0.9 ? 'wink' : 'grin') : 'proud', armF, head: -3 + 1.5 * Math.sin(T * 2), bob: breathJ(T, jsc), blink: blinkJ(T) });
  let s = cam(comicZoom(t, 1.1) * bumpZ(t, [c.wink], 0.03), 540, 900, w);
  if (!inB) {
    // para comercios: franja roja «Comenta ALTA» (como «Comenta CANAL» de la serie), sincronizada con la voz de José
    s += bigT('¿Tienes un negocio?', 540, 262, 116, pop(t, c.a1, 0.5), -3, { fill: C.yel });
    const ks = pop(t, c.strip, 0.5), pulse = t > c.strip + 0.6 ? 1 + 0.03 * Math.sin((t - c.strip) * 2 * PI / 1.1) : 1;
    s += at(540, 400, ks * pulse, `<rect x="-470" y="-62" width="940" height="124" rx="26" transform="translate(10 10)" fill="${INK}"/><rect x="-470" y="-62" width="940" height="124" rx="26" fill="${C.red}" ${st12()}/>` +
      text('Comenta ALTA', 0, 4, { size: 96, sw: SW * 2, sd: 6 }), -2);
    s += bigT('y te enviamos el formulario', 540, 528, 66, pop(t, c.sub, 0.5), 1, { fill: '#FFFFFF', maxW: 960 });
  } else {
    s += bigT('Y tú, apúntate al canal', 540, 262, 104, pop(t, c.b1, 0.5), -3);
    s += at(540, 392, pop(t, c.b2, 0.5), pill(0, 0, 720, 112, C.green, 'Canal de WhatsApp', { size: 60, dx: 40, pad: 120 }) + iconChat(-290, 0, 34), -2);
    s += at(540, 528, pop(t, c.b3, 0.5), `<rect x="-300" y="-40" width="600" height="80" rx="40" transform="translate(7 7)" fill="${INK}"/><rect x="-300" y="-40" width="600" height="80" rx="40" fill="#FFFFFF" ${st12(0.8)}/>` +
      text('escaparatetudela.es', 0, 2, { size: 50, fill: INK, stroke: null, shadow: false }));
  }
  return s;
};

/* ---------- subtítulos (solo en una versión subtitulada: node render.js subs) ---------- */
function subtitle(T) {
  const c = SUBS.find(q => T >= q.start - 1e-6 && T < q.end);
  if (!c) return '';
  let size = 74, lines = wrapText(c.text, size, 960);
  while (lines.length > 2 && size > 48) { size -= 4; lines = wrapText(c.text, size, 960); }
  const lh = size * 1.2, wMax = Math.max(...lines.map(l => measure(l, size)));
  const bw = Math.min(1050, wMax + 80), bh = lines.length * lh + 44, cy = 1630;
  let s = `<rect x="${f(540 - bw / 2)}" y="${f(cy - bh / 2)}" width="${f(bw)}" height="${f(bh)}" rx="30" fill="${INK}" fill-opacity="0.86"/>`;
  const col = c.who === 'jose' ? C.yel : '#FFFFFF';
  lines.forEach((l, i) => { s += text(l, 540, cy - (lines.length - 1) * lh / 2 + i * lh + size * 0.04, { size, fill: col, sw: size * 0.14, shadow: false }); });
  return s;
}

/* ---------- API para el renderizador ---------- */
window.init = async function (cfg, fonts, logos, subs) {
  CFG = cfg; SUBS = subs || null;
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
    // los PNG se dibujan en un cuadro de 500 para mantener las coordenadas de recorte de la serie
    el.setAttribute('id', id); el.setAttribute('width', '500'); el.setAttribute('height', '500');
    el.setAttribute('href', url);
    defs.appendChild(el);
  }
  return true;
};
window.renderFrame = function (sceneId, t, T) {
  uid = 0;
  const sc = CFG.scenes.find(s => s.id === sceneId);
  let s = S[sceneId](t, T, sc);
  if (SUBS) s += subtitle(T);
  document.getElementById('dyn').innerHTML = s;
};
