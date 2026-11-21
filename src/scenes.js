/* Vídeo 04 — «¿Qué es Escaparate de Tudela?». Escenas sobre lib.js + series.js + rosa.js + v04.js.
   Todo se calcula a partir de (t local de la escena, T global). Zona de subtítulos (y > 1500) libre. */
'use strict';

const S = {};
const big = (str, x, y, size, k, rot = 0, o = {}) => at(x, y, k, text(str, 0, 0, Object.assign({ size: fit(str, size, o.maxW || 980, o.font || 'B'), sw: SW * 2.3, sd: 9 }, o)), rot);
const bump = (t, times, a = 0.03) => 1 + times.reduce((m, t0) => m + (t >= t0 ? a * Math.max(0, damp(t - t0, 14, 6)) : 0), 0);

/* ---------- 1) Calle soleada con 4 tiendas; logo y «¿Qué es Escaparate de Tudela?» ---------- */
const XS1 = [15, 275, 535, 795];
S[1] = (t, T) => {
  let w = bg(T, { band: 800, sx: 950, sy: 230, sr: 52, lanes: [620, 330, 700] });
  XS1.forEach((x, i) => { w += shop(x, 1460, 250, 520, SHOPS4[i]); });
  w += ground(1460, 0, { sp: 230 });
  // dos paseantes con su móvil
  const p1 = lerp(1150, 640, t / 4), p2 = lerp(-80, 380, t / 4);
  w += placeFolk(7, p1, 1495, 2.25, Object.assign(walkPose(2 * PI * t / 0.8, 0.8), { flip: true, expr: 'happy', handF: phoneHand(202.5, 139.5, { lit: true, card: 0 }) }));
  w += placeFolk(5, p2, 1495, 2.25, Object.assign(walkPose(2 * PI * t / 0.75 + 1, 0.8), { expr: 'smile', handF: phoneHand(202.5, 139.5, { lit: true, card: 1 }) }));
  let s = cam(zoomIn(t, 0, 1.12, 0.22) * lerp(1, 1.07, easeInOut(t / 4)), 540, 1050, w);
  const kl = pop(t, 0.3, 0.6), bob = t > 1 ? 6 * Math.sin((t - 1) * 3) : 0;
  s += at(540, 420 + bob, kl, `<rect x="-232" y="-232" width="464" height="464" rx="64" transform="translate(12 12)" fill="${INK}"/><rect x="-232" y="-232" width="464" height="464" rx="64" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>`, lerp(-14, 0, kl)) + logoBadge(540, 420 + bob, 400, lerp(-14, 0, kl), kl, 'logoR');
  const k1 = pop(t, 1.0, 0.5), k2 = pop(t, 1.2, 0.5);
  s += big('¿Qué es Escaparate', 540, 735, 118, k1, lerp(-7, -2, k1));
  s += big('de Tudela?', 540, 862, 150, k2, lerp(7, 2, k2), { fill: C.yel });
  return s;
};

/* ---------- 2) Móvil del portal; los 4 comercios lanzan sus tarjetas ---------- */
const PH2 = { X: 280, Y: 330, PW: 520, PH: 1110 };
const SLOT2 = i => [540, 522 + 22 + CARD_H / 2 + i * (CARD_H + 18)];
const SH2 = [{ x: 14, base: 860 }, { x: 814, base: 860 }, { x: 14, base: 1400 }, { x: 814, base: 1400 }];
const OWN2 = [{ i: 3, flip: false }, { i: 8, flip: true }, { i: 10, flip: false }, { i: 1, flip: true }];
const L2 = [0.45, 2.15, 3.05, 4.75], FL2 = 0.55;
const flight2 = i => {
  const sh = SH2[i], d = shopDoor(sh.x, sh.base, 252, 440);
  return arcPath([d.x + d.w / 2, d.y + d.h * 0.25], SLOT2(i), 260);
};
function cardsInPhone(t, landT) {
  return (sx, sy) => {
    let g = '';
    CARDS.forEach((c, i) => {
      const lt = landT ? landT[i] : -1;
      if (lt !== -1 && t < lt) return;
      const [cx, cy] = SLOT2(i);
      const k = lt === -1 ? 1 : 1 + 0.14 * Math.max(0, damp(t - lt, 16, 6));
      const sw = lt === -1 ? 0 : 22 * damp(t - lt, 7, 1.6);
      g += pubCard(cx, cy, k, 0, c, sw);
    });
    return g;
  };
}
S[2] = (t, T) => {
  let w = bg(T, { band: 980, sx: 82, sy: 132, sr: 40, lanes: [300, 720, 1180] });
  const land = L2.map(l => l + FL2);
  // tiendas flotantes con su dueño asomando por la puerta
  SH2.forEach((sh, i) => {
    w += slab(sh.x - 14, sh.base, 252 + 28);
    w += shop(sh.x, sh.base, 252, 440, SHOPS4[i]);
    const d = shopDoor(sh.x, sh.base, 252, 440), id = 'door' + (uid++);
    const kIn = easeOut((t - (L2[i] - 0.45)) / 0.25);
    if (kIn > 0) {
      w += `<rect x="${f(d.x)}" y="${f(d.y)}" width="${f(d.w)}" height="${f(d.h + 10)}" rx="6" fill="${C.warm}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
      const lt = t - L2[i];
      let arm = -18;
      if (lt > -0.25 && lt < 0) arm = lerp(-18, 45, easeOut((lt + 0.25) / 0.25));
      else if (lt >= 0 && lt < 0.15) arm = lerp(45, -105, easeOut(lt / 0.15));
      else if (lt >= 0.15) arm = lerp(-105, -62, easeInOut((lt - 0.15) / 0.5)) + 14 * Math.sin((lt - 0.15) * 10) * Math.exp(-(lt - 0.15) * 0.8);
      const own = OWN2[i], px = d.x + d.w / 2 + (own.flip ? 1 : -1) * lerp(30, 0, kIn);
      w += `<clipPath id="${id}"><rect x="${f(d.x)}" y="${f(d.y)}" width="${f(d.w)}" height="${f(d.h)}"/></clipPath>`;
      w += `<g clip-path="url(#${id})">` + placeFolk(own.i, px, sh.base, 1.5, { flip: own.flip, expr: lt > 0 ? 'wink' : 'smile', armF: arm, armB: -10 }) + `</g>`;
      w += `<rect x="${f(d.x)}" y="${f(d.y)}" width="${f(d.w)}" height="${f(d.h + 10)}" rx="6" fill="none" stroke="${INK}" stroke-width="${f(SW)}"/>`;
    }
  });
  w += portalPhone(PH2.X, PH2.Y, PH2.PW, PH2.PH, cardsInPhone(t, land));
  // tarjetas en vuelo con estela
  CARDS.forEach((c, i) => {
    const u = (t - L2[i]) / FL2;
    if (u <= 0 || u >= 1) return;
    const fn = flight2(i), ue = easeInOut(u), [x, y] = fn(ue);
    w += trail(fn, ue, 0.35, 40);
    w += pubCard(x, y, lerp(0.3, 1, ue), lerp(i % 2 ? 25 : -25, 0, ue), c, 18 * Math.sin(t * 20));
  });
  let s = cam(zoomIn(t, 0, 1.12, 0.22) * bump(t, land, 0.035), 540, 900, w);
  // un texto por tarjeta (cada uno sustituye al anterior)
  const TX = [['Ofertas', land[0], -4], ['Novedades', land[1], 3], ['Eventos', land[3], -3]];
  let cur = null;
  TX.forEach(x => { if (t >= x[1]) cur = x; });
  if (cur) { const k = pop(t, cur[1], 0.5); s += big(cur[0], 540, 245, 150, k, lerp(cur[2] * 2.5, cur[2], k)); }
  return s;
};

/* ---------- 3) Calle llena de gente: las tarjetas vuelan a todos los móviles ---------- */
const CROWD3 = [
  { spec: { kind: 'folk', i: 3 }, x: 95, foot: 1285, sc: 2.75 },
  { spec: { kind: 'marta' }, x: 275, foot: 1285, sc: 2.75 },
  { spec: { kind: 'folk', i: 6 }, x: 455, foot: 1285, sc: 2.75 },
  { spec: { kind: 'folk', i: 0 }, x: 635, foot: 1285, sc: 2.75 },
  { spec: { kind: 'folk', i: 9 }, x: 815, foot: 1285, sc: 2.75 },
  { spec: { kind: 'folk', i: 7 }, x: 990, foot: 1285, sc: 2.75 },
  { spec: { kind: 'folk', i: 1 }, x: 170, foot: 1478, sc: 3.45 },
  { spec: { kind: 'rosa' }, x: 415, foot: 1478, sc: 3.3 },
  { spec: { kind: 'folk', i: 4 }, x: 665, foot: 1478, sc: 3.45 },
  { spec: { kind: 'lucia' }, x: 905, foot: 1478, sc: 3.45 }
];
const SKYPH3 = { cx: 540, cy: 560, sc: 0.42 };
const skyPt3 = p => [SKYPH3.cx + (p[0] - 540) * SKYPH3.sc, SKYPH3.cy + (p[1] - (PH2.Y + PH2.PH / 2)) * SKYPH3.sc];
const ARR3 = i => 0.55 + i * 0.07 + 0.55;
S[3] = (t, T) => {
  let w = bg(T, { band: 860, sx: 940, sy: 240, sr: 50, lanes: [250, 420, 380] });
  w += street(120, { w: 420, h: 620, g: 40, base: 1180 });
  w += ground(1180, 120, { sp: 220 });
  const fly = [];
  CROWD3.forEach((c, i) => {
    const arr = ARR3(i), lt = t - arr, flip = c.x > 540;
    const vib = lt > 0 && lt < 0.7, up = easeOut((lt - 0.7) / 0.25);
    const shake = vib ? 1.4 * Math.sin(t * 90 + i) : 0;
    const armF = lerp(-22, -58, up) + (vib ? 4 * Math.sin(t * 70 + i) : 0);
    const isR = c.spec.kind === 'rosa';
    const expr = up > 0.4 ? (i % 3 === 1 ? 'smile' : 'sparkle') : (vib ? 'surprise' : 'happy');
    const o = { flip, expr: isR && expr === 'happy' ? 'smile' : expr, look: up > 0.4 ? [1, 1.6] : [0.4, 0], head: lerp(0, 13, up), armF, shake, lit: lt > 0, card: i, rot: lerp(-12, -6, up),
      bob: up > 0 ? -3 * Math.max(0, damp(lt - 0.7, 14, 5)) : 0, blink: false };
    const r = crowdPerson(c.spec, c.x, c.foot, c.sc, o);
    w += r.svg;
    if (vib) {
      w += vibeRings(r.phone[0], r.phone[1], t, 30);
      if (Math.floor(t * 14) % 2) w += `<path d="M${f(r.phone[0] - 62)} ${f(r.phone[1] - 22)} l-14 -14 M${f(r.phone[0] + 62)} ${f(r.phone[1] - 22)} l14 -14" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round"/>`;
    }
    if (up > 0.4) w += sparkle(r.head[0] + (flip ? -1 : 1) * 70, r.head[1] - 40, 20, pop(t, arr + 0.9, 0.35) * (1 + 0.2 * Math.sin(t * 16 + i)));
    // destino de la tarjeta = móvil en reposo
    const r0 = crowdPerson(c.spec, c.x, c.foot, c.sc, { flip, armF: -22 });
    fly.push({ i, to: r0.phone, from: skyPt3(SLOT2(i % 4)), t0: arr - 0.55 });
  });
  // móvil del portal en el cielo
  const kp = pop(t, 0, 0.35) * (1 - easeOut((t - 1.45) / 0.22));
  if (kp > 0.01) {
    const left = t < 0.55 ? null : CARDS.map((c, j) => (t < 0.55 + j * 0.07 ? -1 : 99));
    w += at(SKYPH3.cx, SKYPH3.cy, kp * SKYPH3.sc, `<g transform="translate(-540 ${-(PH2.Y + PH2.PH / 2)})">` + portalPhone(PH2.X, PH2.Y, PH2.PW, PH2.PH, cardsInPhone(t, left)) + `</g>`);
  }
  fly.forEach(fc => {
    const u = (t - fc.t0) / 0.55;
    if (u <= 0 || u >= 1) return;
    const fn = arcPath(fc.from, fc.to, 160), ue = easeInOut(u), [x, y] = fn(ue);
    w += trail(fn, ue, 0.32, 24);
    w += pubCard(x, y, lerp(0.42, 0.16, ue), lerp(0, fc.i % 2 ? 30 : -30, ue), CARDS[fc.i % 4]);
  });
  let s = cam(zoomIn(t, 0, 1.12, 0.22) * bump(t, [1.85], 0.04), 540, 1000, w);
  const k = pop(t, 1.85, 0.5);
  s += big('Directo a tu móvil', 540, 320, 140, k, lerp(-8, -3, k));
  return s;
};

/* ---------- 4) Primer plano de un móvil: 3 toques, 3 fachadas que entran volando ---------- */
const PH4 = { X: 300, Y: 400, PW: 480, PH: 1020 };
const SLOT4 = i => 592 + 24 + i * 262;
const TP4 = [1.0, 2.1, 3.2];
const NUM4 = [700, 930, 1160];
function hand4() {
  const st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  const back = `<path d="M-60 1300 Q120 1270 250 1290 L270 1440 Q120 1450 -60 1470 Z" fill="${C.blue}" ${st}/>
    <path d="M-60 1300 Q120 1270 250 1290 L254 1330 Q120 1314 -60 1342 Z" fill="${C.blueS}"/>
    <path d="M-60 1300 Q120 1270 250 1290 L270 1440 Q120 1450 -60 1470 Z" fill="none" ${st}/>
    <path d="M240 1280 Q330 1250 370 1300 L380 1420 Q300 1460 250 1440 Z" fill="${C.skin}" ${st}/>`;
  const front = `<path d="M300 1330 Q340 1240 395 1225 Q420 1222 418 1246 Q392 1272 372 1336 Z" fill="${C.skin}" ${st}/>
    <path d="M388 1236 Q405 1234 410 1244" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linecap="round"/>
    <path d="M760 1230 q40 -4 40 24 q0 26 -40 26 Z M770 1290 q36 -2 36 24 q0 24 -36 24 Z M772 1350 q30 -2 30 22 q0 22 -30 22 Z" fill="${C.skin}" ${st}/>`;
  return { back, front };
}
S[4] = (t, T) => {
  let w = bg(T, { band: 1000, sx: 935, sy: 470, sr: 46, lanes: [380, 560, 520] });
  w += ground(1460, 0, { sp: 230 });
  const hd = hand4();
  w += hd.back;
  const land = TP4.map(x => x + 0.45);
  w += portalPhone(PH4.X, PH4.Y, PH4.PW, PH4.PH, (sx, sy, sw_) => {
    let g = '';
    for (let i = 0; i < 3; i++) {
      const y = SLOT4(i);
      g += `<rect x="${sx + 20}" y="${y}" width="${sw_ - 40}" height="240" rx="20" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-dasharray="18 14" opacity="0.35"/>`;
      if (t >= land[i]) {
        const sq = 1 + 0.12 * Math.max(0, damp(t - land[i], 16, 6));
        g += at(540, y + 120, 1, `<g transform="scale(${f(2 - sq)} ${f(sq)}) translate(-540 ${-(y + 120)})">${wideShop(sx + 20, y, sw_ - 40, 240, i)}</g>`);
      }
    }
    return g;
  });
  w += hd.front;
  // fachadas en vuelo
  for (let i = 0; i < 3; i++) {
    const u = (t - TP4[i] - 0.03) / 0.42;
    if (u <= 0 || u >= 1) continue;
    const from = i % 2 ? [1300, 200] : [-260, 260], to = [540, SLOT4(i) + 120];
    const fn = arcPath(from, to, 180), ue = easeInOut(u), [x, y] = fn(ue);
    w += trail(fn, ue, 0.35, 50);
    w += at(x, y, lerp(0.45, 1, ue), `<g transform="translate(-198 -120)">${wideShop(0, 0, 396, 240, i)}</g>`, lerp(i % 2 ? 30 : -30, 0, ue));
  }
  // ondas de cada toque
  TP4.forEach((tp, i) => {
    const u = (t - tp) / 0.45;
    if (u < 0 || u > 1) return;
    for (let j = 0; j < 2; j++) {
      const v = clamp(u - j * 0.25);
      if (v <= 0) continue;
      w += `<circle cx="600" cy="${SLOT4(i) + 120}" r="${f(20 + v * 110)}" fill="none" stroke="${INK}" stroke-width="${f(SW * (1.2 - v))}"/>`;
    }
  });
  // dedo que toca
  const rest = [1000, 1080];
  let fx = rest[0], fy = rest[1];
  TP4.forEach((tp, i) => {
    const tg = [600, SLOT4(i) + 120];
    if (t > tp - 0.35 && t <= tp) { const u = easeOut((t - (tp - 0.35)) / 0.35); fx = lerp(rest[0], tg[0], u); fy = lerp(rest[1], tg[1], u); }
    else if (t > tp && t < tp + 0.4) {
      const u = easeInOut((t - tp - 0.1) / 0.3), end = i === 2 ? [1300, 1000] : rest;
      fx = lerp(tg[0], end[0], u); fy = lerp(tg[1], end[1], u);
    }
  });
  if (t > TP4[2] + 0.4) { fx = 1300; fy = 1000; }
  const press = TP4.some(tp => t > tp && t < tp + 0.1) ? 1 : 0;
  if (fx < 1290) w += at(fx, fy + press * 6, 1, finger(0, 0, -8), 0);
  // números 1, 2, 3
  TP4.forEach((tp, i) => { w += numCircle(150, NUM4[i], 92, i + 1, pop(t, tp, 0.45), (i - 1) * 6); });
  let s = cam(zoomIn(t, 0, 1.12, 0.22) * bump(t, TP4, 0.03), 540, 900, w);
  const k = pop(t, 0.2, 0.5);
  s += big('Con solo 3 toques', 540, 255, 140, k, lerp(-8, -3, k));
  return s;
};

/* ---------- 5) Persona sonriente con el móvil; burbujas «Ofertas», «Novedades», «Eventos» ---------- */
S[5] = (t, T) => {
  let w = bg(T, { band: 860, sx: 945, sy: 560, sr: 44, lanes: [600, 560, 760] });
  w += street(380, { w: 420, h: 560, g: 40, base: 1240 });
  w += ground(1240, 380, { sp: 220 });
  const r = crowdPerson({ kind: 'folk', i: 11 }, 500, 1478, 5.0, { expr: 'sparkle', look: [1, 1.2], head: 6, armF: -55, lit: true, card: 2, rot: -4, ps: 1.7, bob: 2 * Math.sin(t * 4) });
  w += r.svg;
  w += sparkle(r.head[0] + 150, r.head[1] - 90, 30, pop(t, 0.3, 0.4) * (1 + 0.2 * Math.sin(t * 14)));
  w += sparkle(r.head[0] - 150, r.head[1] - 40, 22, pop(t, 0.4, 0.4) * (1 + 0.2 * Math.sin(t * 12 + 1)));
  const B = [['Ofertas', 'oferta', 240, 720, 'left', 0.25], ['Novedades', 'novedad', 830, 760, 'right', 0.4], ['Eventos', 'evento', 240, 1180, 'left', 0.55]];
  B.forEach(([l, ty, x, y, tail, t0], i) => {
    const fy = 14 * Math.sin(t * 2.6 + i * 2);
    w += bubble(x, y + fy, pop(t, t0, 0.5) * 0.82, l, ty, tail, (i % 2 ? 4 : -4) + 2 * Math.sin(t * 2 + i));
  });
  let s = cam(zoomIn(t, 0, 1.12, 0.22), 540, 1000, w);
  const k1 = pop(t, 0.15, 0.5), k2 = pop(t, 0.35, 0.5);
  s += big('Los escaparates de Tudela,', 540, 300, 100, k1, lerp(-6, -2, k1));
  s += big('en tu mano', 540, 445, 150, k2, lerp(6, 2, k2), { fill: C.yel });
  return s;
};

/* ---------- 6) Llamada a la acción con cielo y pájaros + tarjeta final ---------- */
const BIRDS6 = [{ t0: 0.3, d: 3.8, dir: 1, y: 300, a: 34 }, { t0: 1.6, d: 4.2, dir: -1, y: 1400, a: 30 }, { t0: 3.4, d: 3.4, dir: 1, y: 980, a: 26 }, { t0: 5.2, d: 3.6, dir: -1, y: 260, a: 32 }];
S[6] = (t, T, sc) => {
  const cut = (sc && sc.cut) || 8, sw2 = (sc && sc.swap) || 4;
  if (t < cut) {
    let s = skyClear(T, { band: 1180, tm: 720, sx: 930, sy: 250, sr: 58, clouds: [
      { x0: 60, y: 240, s: 0.75, v: 16 }, { x0: 700, y: 1060, s: 0.85, v: 24 }, { x0: 300, y: 1380, s: 0.6, v: 11 },
      { x0: 1250, y: 560, s: 0.9, v: 19 }, { x0: 1650, y: 1240, s: 0.7, v: 14 }] });
    BIRDS6.forEach((b, i) => {
      const u = (t - b.t0) / b.d;
      if (u < 0 || u > 1) return;
      const x = b.dir > 0 ? lerp(-90, W + 90, u) : lerp(W + 90, -90, u);
      s += bird(x, Math.min(1450, b.y + Math.sin(u * 7 + i) * 12), b.a, 0.35 + 0.65 * Math.sin(t * 2 * PI / 0.34 + i * 2));
    });
    let g = '';
    if (t < sw2) {
      const out = 1 - easeOut((t - (sw2 - 0.12)) / 0.12);
      const k1 = pop(t, 0.15, 0.5) * out, k2 = pop(t, 0.35, 0.5) * out;
      g += big('Entra a', 540, 470, 190, k1, lerp(-8, -3, k1));
      g += big('conocernos', 540, 650, 190, k2, lerp(8, 2, k2), { fill: C.yel });
      const ks = pop(t, 0.9, 0.6), url = 'escaparatetudela.es';
      const pulse = t > 1.8 ? 1 + 0.03 * Math.sin((t - 1.8) * 2 * PI / 1.1) : 1;
      let st = `<rect x="-640" y="-95" width="1280" height="190" transform="translate(0 14)" fill="${INK}"/><rect x="-640" y="-95" width="1280" height="190" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
      st += at(0, 0, pulse, text(url, 0, 2, { size: fit(url, 112, 940), sw: SW * 2, sd: 6 }));
      g += `<g transform="translate(${f(540 + (1 - ks) * -1500)} ${f(900 + (1 - out) * 0)}) rotate(-3) scale(1 ${f(out)})">${st}</g>`;
      // cursor que pulsa la web
      const kc = pop(t, 1.7, 0.4) * out, press = t > 2.3 && t < 2.45 ? 0.88 : 1;
      if (kc > 0.01) {
        const cur = `<path d="M0 0 L0 110 L28 84 L48 128 L70 118 L50 76 L88 74 Z" transform="translate(8 8)" fill="${INK}"/><path d="M0 0 L0 110 L28 84 L48 128 L70 118 L50 76 L88 74 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
        g += at(lerp(980, 800, easeOut((t - 1.7) / 0.5)), lerp(1300, 950, easeOut((t - 1.7) / 0.5)), kc * press, cur, -10);
        if (t > 2.3 && t < 2.8) { const v = (t - 2.3) / 0.5; g += `<circle cx="800" cy="950" r="${f(20 + v * 100)}" fill="none" stroke="${INK}" stroke-width="${f(SW * (1.2 - v))}"/>`; }
      }
      g += sparkle(150, 760, 34, pop(t, 0.6, 0.4) * out * (1 + 0.2 * Math.sin(t * 15)));
      g += sparkle(950, 380, 28, pop(t, 0.7, 0.4) * out * (1 + 0.2 * Math.sin(t * 13 + 1)));
    } else {
      const u = t - sw2;
      const k1 = pop(u, 0.05, 0.5);
      g += big('¿Eres comercio?', 540, 420, 150, k1, lerp(-8, -3, k1));
      const ke = pop(u, 0.3, 0.55), open = easeOut((u - 0.9) / 0.4);
      g += envelope(540, 760 + 8 * Math.sin(u * 3), 380, ke, open, lerp(-14, -4, ke) + 2 * Math.sin(u * 2.4));
      if (u > 1.0) { g += sparkle(320, 640, 30, pop(u, 1.0, 0.4) * (1 + 0.2 * Math.sin(u * 15))); g += sparkle(770, 600, 24, pop(u, 1.1, 0.4)); }
      const k2 = pop(u, 0.6, 0.5), k3 = pop(u, 0.8, 0.5);
      g += big('Escríbenos y', 540, 1030, 125, k2, lerp(6, 2, k2));
      g += big('te informamos', 540, 1160, 125, k3, lerp(-6, -2, k3));
      const k4 = pop(u, 1.2, 0.5), mail = 'info@escaparatetudela.es', ms = fit(mail, 74, 880);
      const pulse = u > 2 ? 1 + 0.025 * Math.sin((u - 2) * 2 * PI / 1.1) : 1;
      g += at(540, 1330, k4 * pulse, `<rect x="-480" y="-70" width="960" height="140" rx="70" transform="translate(12 12)" fill="${INK}"/><rect x="-480" y="-70" width="960" height="140" rx="70" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>` +
        text(mail, 0, 2, { size: ms, sw: SW * 1.8, sd: 5 }));
    }
    s += g;
    const z = t < sw2 ? zoomIn(t, 0, 1.1, 0.2) : zoomIn(t, sw2, 1.08, 0.2);
    return cam(z, 540, 850, s);
  }
  const u = t - cut;
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 680, 16, t * 8, C.dred);
  // logo solo icono (logo.png) grande sobre rojo
  const kl = pop(u, 0, 0.45), bob = 6 * Math.sin(u * 3);
  s += at(540, 680 + bob, kl, `<svg x="-380" y="-380" width="760" height="760" viewBox="20 20 460 460"><use href="#logoI"/></svg>`);
  s += at(540, 1140, pop(u, 0.12, 0.45), text('Escaparate', 0, 0, { size: 145, sw: SW * 2.4, sd: 9 }));
  s += at(540, 1280, pop(u, 0.2, 0.45), text('de Tudela', 0, 0, { size: 145, sw: SW * 2.4, sd: 9 }));
  const url = 'escaparatetudela.es', us = fit(url, 70, 680);
  s += at(540, 1418, pop(u, 0.3, 0.45), `<rect x="-370" y="-52" width="760" height="104" rx="52" transform="translate(10 10)" fill="${INK}"/><rect x="-380" y="-52" width="760" height="104" rx="52" fill="${C.dred}" stroke="${INK}" stroke-width="${f(SW)}"/>` + text(url, 0, 2, { size: us, sw: SW * 1.8, sd: 5 }));
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
