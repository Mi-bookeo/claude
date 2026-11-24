/* Vídeo 15 — «Se lanza Escaparate de Tudela». Escenas sobre lib.js + series.js + rosa.js + v04…v15.js + maria.js.
   Todo se calcula a partir de (t local de la escena, T global). Duraciones, planos (shots), tramos «habla» (talk) y
   momentos (cues) se leen de config.json. Franja inferior (y > 1400) libre de textos y elementos importantes; margen
   superior hasta y=192. Cortes secos entre escenas y entre planos; textos con rebote; zoom rápido tipo cómic al
   empezar cada plano. Sin audio ni subtítulos. */
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
const seg = (t, a, b) => clamp((t - a) / (b - a));
const talkOf = (sc, who) => (sc.talk && sc.talk[who]) || [];
const inRanges = (t, r) => r.some(([a, b]) => t >= a && t < b);
const rot2 = (p, deg) => { const a = deg * PI / 180; return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)]; };
const DAY = (o = {}) => T => sky13(T, 'day', Object.assign({ band: 1000, sx: 900, sy: 330, sr: 58 }, o));

/* ---------- 1) GANCHO: cartel a pantalla completa -> dolly out -> María lo sostiene ---------- */
const M1 = { x: 540, foot: 1392, sc: 6.6, bw: 46 };
S[1] = (t, T, sc) => {
  const c = cues(sc, { dollyStart: 0.9, dollyEnd: 2.05, title: 2.0, lower: 3.45, smile: 3.85 });
  const base = mBase(T, M1.sc);
  const talk = talk15(t, talkOf(sc, 'maria'));
  // cartel en las manos; al final lo baja hacia un lado (la mano derecha de la imagen lo sigue sujetando)
  const kl = easeInOut(seg(t, c.lower, c.lower + 0.55));
  const HF = lerp2([213, 150], [216, 151], kl);
  const att = lerp2([M1.bw / 2, -3], [-20, -36], kl), rot = 12 * kl, bs = lerp(1, 0.72, kl);
  const ra = rot2([att[0] * bs, att[1] * bs], rot);
  const bc = [HF[0] - ra[0], HF[1] - ra[1]];
  const onB = rot2([-M1.bw / 2 * bs, -3 * bs], rot);
  const kb = easeOut(seg(t, c.lower, c.lower + 0.4));
  const HB = lerp2([bc[0] + onB[0], bc[1] + onB[1]], [161, 131 + 3 * Math.sin(t * 3)], kb);
  const after = t >= c.smile;
  const eD = easeInOut(seg(t, c.dollyStart, c.dollyEnd));
  const o = Object.assign({}, base, {
    expr: t < c.smile ? 'surprise' : (t < c.smile + 0.5 ? 'joy' : 'sparkle'), talk,
    head: after ? 4 * Math.sin(T * 2) : 1.5 * Math.sin(T * 2.6),
    armF: mArm(true, HF), armB: mArm(false, HB, kb > 0.6 ? 'open' : 'fist', { hrot: -12 }),
    // el tablero va por delante (tapa las manos: a pantalla completa no hay nada encima del cartel);
    // al alejarse la cámara asoman los pulgares en el borde rojo, y al bajarlo la mano lo coge por la esquina
    front: w => cartelBoard(bc[0], bc[1], M1.bw * bs, rot, w) +
      (eD > 0.15 && kl < 0.2 ? thumbOnEdge(bc, M1.bw * bs, rot, 1, w) + thumbOnEdge(bc, M1.bw * bs, rot, -1, w) : '') +
      (kl >= 0.2 ? hand11('fist', HF, w, { fill: MG.skin, hs: 1.25 }) : '') +
      (kb > 0.25 ? hand11(kb > 0.6 ? 'open' : 'fist', HB, w, { fill: MG.skin, hs: 1.25, hrot: -12 }) : '')
  });
  let w = DAY({ sx: 930, sy: 590, sr: 54 })(T);
  w += ground(1330, 0, { sp: 230 });
  w += shadowEll(M1.x, M1.foot + 4, 92);
  w += placeMaria(M1.x, M1.foot, M1.sc, o);
  if (after) w += sparkle(M1.x + 250, 560, 30, pop(t, c.smile, 0.4) * (1 + 0.2 * Math.sin(t * 14))) + sparkle(M1.x - 260, 640, 24, pop(t, c.smile + 0.1, 0.4) * (1 + 0.2 * Math.sin(t * 12 + 1)));
  // cámara: al principio el tablero del cartel ocupa toda la pantalla; dolly out rápido y fluido
  const bw = [M1.x + (bc[0] - 190) * M1.sc, M1.foot + (bc[1] - 204 + base.bob) * M1.sc];
  const z0 = W / (M1.bw * M1.sc);
  const e = easeInOut(seg(t, c.dollyStart, c.dollyEnd));
  const zb = t < c.dollyStart ? 1 + 0.04 * Math.max(0, damp(t, 11, 4.5)) : 1;
  const z = Math.exp(lerp(Math.log(z0), 0, e)) * zb * bumpZ(t, [c.title], 0.025);
  const cc = lerp2(bw, [540, 960], e);
  let s = `<g transform="translate(540 960) scale(${f(z)}) translate(${f(-cc[0])} ${f(-cc[1])})">${w}</g>`;
  if (e > 0.05 && e < 0.95) s += speedLinesRadial(540, 960, Math.sin(PI * e));
  s += bigT('Se acabó', 540, 290, 160, pop(t, c.title, 0.5), -4, { fill: C.yel });
  return s;
};

/* ---------- 2) María explica; tres tarjetas vuelan al móvil ---------- */
const M2 = { x: 290, sc: 11.5, waist: 1560 };
const PH2 = { X: 690, Y: 600, PW: 350, PH: 680, hh: 110 };
const slot2 = (i, bob) => [PH2.X + PH2.PW / 2, PH2.Y + 22 + PH2.hh + 18 + 75 + i * 166 + bob];
const KINDS2 = ['oferta', 'novedad', 'evento'];
S[2] = (t, T, sc) => {
  const c = cues(sc, { title: 0.25, title2: 0.5, sub: 1.0, launch: [1.7, 3.3, 4.9], flight: 0.75, point: 6.4, thumb: 8.2 });
  const py = mWaist(M2.waist, M2.sc), base = mBase(T, M2.sc, 0.7);
  const tr = talkOf(sc, 'maria'), talking = inRanges(t, tr);
  const L = c.launch, FL = c.flight;
  // brazo de la imagen derecha: lanza cada tarjeta; luego señala el móvil y pulgar arriba
  let armF;
  const kL = Math.max(...L.map(l => clamp(1 - Math.abs(t - (l + 0.02)) / 0.42)));
  if (t >= c.thumb) { const k = easeOut(seg(t, c.thumb, c.thumb + 0.3)); armF = mArm(true, lerp2([220, 134], [222, 98 - 3 * Math.max(0, damp(t - c.thumb - 0.3, 12, 5))], k), k > 0.4 ? 'thumb' : 'fist', { hs: 1.5 }); }
  else if (t >= c.point - 0.25 && t < c.thumb - 0.3) { const k = easeOut(seg(t, c.point - 0.25, c.point)); armF = mArm(true, lerp2([220, 134], [234, 112 + 2 * Math.sin(t * 6)], k), 'point', { dir: -12, hs: 1.5 }); }
  else { const g = mGestF(t, talking ? 1 : 0); armF = kL > 0 ? mArm(true, lerp2(g.h, [232, 108], easeInOut(kL)), 'open', { hs: 1.4, hrot: lerp(0, 30, kL) }) : g; }
  const armB = mGestB(t + 0.6, talking ? 1 : 0);
  const expr = t >= c.thumb ? 'joy' : (t > c.point ? 'happy' : 'sparkle');
  let w = DAY({ sx: 940, sy: 700, sr: 52 })(T);
  w += placeMaria(M2.x, py, M2.sc, Object.assign({}, base, { expr, talk: talk15(t, tr), armF, armB, head: 3 * Math.sin(T * 1.9) }));
  // móvil flotante con las tarjetas que ya han llegado
  const bob = 10 * Math.sin(T * 1.8);
  const land = L.map(l => l + FL);
  const pz = bumpZ(t, land, 0.04);
  let ph = portalPhone(PH2.X, PH2.Y + bob, PH2.PW, PH2.PH, (sx, sy, sw_) => {
    let g = '';
    for (let i = 0; i < 3; i++) {
      const [x, y] = slot2(i, bob);
      if (t < land[i]) { g += `<rect x="${f(x - 145)}" y="${f(y - 75)}" width="290" height="150" rx="22" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.5)}" stroke-dasharray="14 12" opacity="0.3"/>`; continue; }
      const sq = 1 + 0.12 * Math.max(0, damp(t - land[i], 16, 6));
      g += `<g transform="translate(${f(x)} ${f(y)}) scale(${f(2 - sq)} ${f(sq)})">${card15Local(KINDS2[i], t)}</g>`;
    }
    return g;
  }, { hh: PH2.hh });
  const pc = [PH2.X + PH2.PW / 2, PH2.Y + PH2.PH / 2 + bob];
  w += `<g transform="translate(${f(pc[0])} ${f(pc[1])}) scale(${f(pz)}) translate(${f(-pc[0])} ${f(-pc[1])})">${ph}</g>`;
  land.forEach(lt => { w += waves15(pc[0], pc[1], t, lt, 260, 520, 0.8, 3); });
  const kz = Math.max(...land.map(lt => (t >= lt && t < lt + 0.5) ? 1 - (t - lt) / 0.5 : 0));
  w += buzz15(PH2.X, PH2.X + PH2.PW, PH2.Y + 160 + bob, kz);
  // tarjetas en vuelo (salen de la mano de María)
  L.forEach((l, i) => {
    const u = (t - l) / FL;
    if (u <= 0 || u >= 1) return;
    const from = mgPt(M2.x, py, M2.sc, 236, 104, base.bob), to = slot2(i, bob);
    const fn = arcPath(from, to, 220), ue = easeInOut(u), [x, y] = fn(ue);
    w += trail(fn, ue, 0.35, 46);
    const k = u < 0.25 ? lerp(0.4, 1.25, easeOut(u / 0.25)) : lerp(1.25, 1, easeInOut((u - 0.25) / 0.75));
    w += at(x, y, k, card15Local(KINDS2[i], t), lerp(-18, 0, ue));
  });
  let s = cam(comicZoom(t), 540, 900, w);
  s += bigT('Acaba de nacer', 540, 248, 108, pop(t, c.title, 0.5), -3);
  s += bigT('Escaparate de Tudela', 540, 372, 112, pop(t, c.title2, 0.5), 2, { fill: C.yel });
  s += bigT('Ofertas, novedades y eventos de tu ciudad', 540, 492, 54, pop(t, c.sub, 0.5), -1, { sw: SW * 1.5, sd: 5, maxW: 980 });
  return s;
};

/* ---------- 3) Mini gancho: María señala; «Y ahora, lo mejor para los comercios» ---------- */
const M3 = { x: 370, sc: 11.5, waist: 1560 };
S[3] = (t, T, sc) => {
  const c = cues(sc, { point: 0.2, t1: 0.3, t2: 0.55, t3: 0.85 });
  const py = mWaist(M3.waist, M3.sc), base = mBase(T, M3.sc, 1.3);
  const tr = talkOf(sc, 'maria'), talking = inRanges(t, tr);
  const kp = easeOut(seg(t, c.point - 0.2, c.point + 0.1));
  const armF = mArm(true, lerp2([210.5, 152], [238, 114 + 1.5 * Math.sin(t * 7)], kp), kp > 0.5 ? 'point' : 'fist', { dir: 0, hs: 1.5 });
  const armB = mGestB(t, talking ? 1 : 0);
  const expr = t > 0.6 && t < 1.5 ? 'wink' : 'sparkle';
  let w = DAY({ sx: 975, sy: 640, sr: 46 })(T);
  const hand = mgPt(M3.x, py, M3.sc, 246, 114, base.bob);
  w += speedLinesH(W + 40, hand[1] - 140, 260, 5, 70, SW * 0.9);
  w += placeMaria(M3.x, py, M3.sc, Object.assign({}, base, { expr, talk: talk15(t, tr), armF, armB, head: -4 + 2 * Math.sin(T * 2) }));
  w += bigArrow(860 + 14 * Math.sin(t * 7), 900, 0.8, pop(t, c.point + 0.2, 0.5), 0);
  let s = cam(comicZoom(t, 1.16) * bumpZ(t, [c.t3], 0.03), 540, 900, w);
  s += bigT('Y ahora,', 540, 248, 118, pop(t, c.t1, 0.5), -4);
  s += bigT('lo mejor para', 540, 362, 118, pop(t, c.t2, 0.5), 2);
  s += bigT('los comercios', 540, 486, 136, pop(t, c.t3, 0.5), -3, { fill: C.yel });
  return s;
};

/* ---------- 4) Tienda de Mari Carmen; móvil de los 3 toques; tarjeta publicada ---------- */
const MC4A = { x: 600, sc: 8.5, ct: 1240 };
const PH4 = { X: 200, Y: 430, PW: 680, PH: 960, hh: 130 };
const SL4 = [{ y: 604, h: 270 }, { y: 898, h: 226 }, { y: 1148, h: 196 }];
const mcBase = (T, sc) => ({ bob: breathA(T, sc), blink: blinkA(T, 0.4) });
const openHandB = w => hand11('open', [175.5, 143], w, { fill: C.skinS, hs: 0.95 });
const openHandF = w => hand11('open', [204.5, 143], w, { fill: C.skin, hs: 0.95 });
function counterFront() {
  let s = `<rect x="-20" y="1236" width="${W + 40}" height="${H}" fill="${C.wood}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<rect x="-20" y="1214" width="${W + 40}" height="36" rx="10" fill="#C98A4B" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  for (let x = 60; x < W; x += 150) s += `<rect x="${x}" y="1252" width="44" height="${H}" fill="${C.woodS}" opacity="0.5"/>`;
  return s;
}
S[4] = (t, T, sc) => {
  const c = cues(sc, { title: 0.35, title2: 0.6, taps: [0.9, 2.3, 4.0], typeDur: 1.1, card: 4.45 });
  const [shot, a] = shotAt(t, sc);
  const u = t - a;
  if (shot === 'A') {
    const tr = talkOf(sc, 'maricarmen'), talking = inRanges(t, tr);
    let w = detalleBack(T, { tm: 10 * 60 + 12 + t * 2 });
    const py = MC4A.ct + 68 * MC4A.sc;
    const g = talking ? 1 : 0;
    w += placeMC(MC4A.x, py, MC4A.sc, Object.assign(mcBase(T, MC4A.sc), {
      expr: 'smile', talk: talk15(t, tr, 11), look: [0.3, 0], head: 2 * Math.sin(T * 2.2),
      armF: -52 + 4 * Math.sin(t * 2.2), handF: phoneHandMC(-8, 'app'),
      armB: lerp(-4, 34 + 18 * Math.sin(t * 2.7), g), handB: g ? openHandB : (w2 => mHand(w2, 175.5, 143, C.skinS))
    }));
    w += shopCounter(MC4A.ct, 300);
    w += register(1000, MC4A.ct);
    let s = cam(comicZoom(u), 540, 950, w);
    s += bigT('Publicar es', 470, 252, 124, pop(t, c.title, 0.5), -3);
    s += bigT('muy fácil', 470, 382, 140, pop(t, c.title2, 0.5), 2, { fill: C.yel });
    return s;
  }
  if (shot === 'B') {
    const TP = c.taps, tEnd = TP[1] + 0.15 + c.typeDur;
    let w = `<rect width="${W}" height="${H}" fill="#FBE0DC"/>` + rays(540, 900, 18, u * 6, C.cream);
    const showCard = u >= c.card;
    w += portalPhone(PH4.X, PH4.Y, PH4.PW, PH4.PH, (sx, sy, sw_) => {
      let g = '';
      if (!showCard) {
        const st = { photo: u > TP[0] + 0.1 ? clamp(pop(u, TP[0] + 0.1, 0.45)) * 1 + 0 : 0 };
        const nChars = Math.floor(clamp((u - TP[1] - 0.15) / c.typeDur) * (POST15.lines[0].length + POST15.lines[1].length));
        const o2 = { chars: nChars, caret: u > TP[1] && u < tEnd + 0.4 };
        const o3 = { press: u > TP[2] - 0.05 && u < TP[2] + 0.1, done: u >= TP[2] + 0.1, doneT: u - TP[2] - 0.1 };
        [st, o2, o3].forEach((o, i) => { g += step15(sx + 24, SL4[i].y, sw_ - 48, SL4[i].h, i, o, u); });
      } else {
        const k = pop(u, c.card, 0.5), cx = 540, cy = 980;
        g += `<g transform="translate(${cx} ${cy}) scale(${f(k)}) translate(${-cx} ${-cy})">` + publishedCard(sx + 34, 610, sw_ - 68, 720, u, pop(u, c.card + 0.35, 0.45)) + `</g>`;
      }
      return g;
    }, { hh: PH4.hh });
    // ondas de cada toque
    const tgt = [[600, SL4[0].y + 150], [600, SL4[1].y + 136], [640, SL4[2].y + 98]];
    TP.forEach((tp, i) => {
      const v0 = (u - tp) / 0.45;
      if (v0 < 0 || v0 > 1) return;
      for (let j = 0; j < 2; j++) { const v = clamp(v0 - j * 0.25); if (v > 0) w += `<circle cx="${tgt[i][0]}" cy="${tgt[i][1]}" r="${f(20 + v * 120)}" fill="none" stroke="${INK}" stroke-width="${f(SW * (1.2 - v))}"/>`; }
    });
    // destellos al publicar
    if (showCard) [[150, 600, 36, 0.1], [940, 560, 30, 0.18], [130, 1180, 28, 0.26], [960, 1230, 32, 0.34]].forEach(([x, y, r, d], i) => {
      w += sparkle(x, y, r, pop(u, c.card + d, 0.35) * (1 + 0.2 * Math.sin(u * 14 + i)));
    });
    // dedo que toca (llega desde la derecha)
    const rest = [1000, 1160];
    let fx = rest[0], fy = rest[1];
    TP.forEach((tp, i) => {
      const tg = tgt[i];
      if (u > tp - 0.35 && u <= tp) { const k = easeOut((u - (tp - 0.35)) / 0.35); fx = lerp(rest[0], tg[0], k); fy = lerp(rest[1], tg[1], k); }
      else if (u > tp && u < tp + 0.4) { const k = easeInOut((u - tp - 0.1) / 0.3), end = i === 2 ? [1320, 1100] : rest; fx = lerp(tg[0], end[0], k); fy = lerp(tg[1], end[1], k); }
    });
    if (u < TP[0] - 0.35) { const k = easeOut(u / 0.4); fx = lerp(1320, rest[0], k); fy = rest[1]; }
    if (u > TP[2] + 0.4) { fx = 1320; fy = 1100; }
    const press = TP.some(tp => u > tp && u < tp + 0.1) ? 1 : 0;
    if (fx < 1300) w += at(fx, fy + press * 6, 1, finger(0, 0, -10), 0);
    // números 1, 2, 3 con rebote
    TP.forEach((tp, i) => { w += numCircle(112, SL4[i].y + SL4[i].h / 2, 80, i + 1, pop(u, tp - 0.05, 0.45), (i - 1) * 6); });
    let s = cam(comicZoom(u, 1.12) * bumpZ(u, TP.concat([c.card]), 0.03), 540, 900, w);
    s += bigT('Con solo 3 toques', 540, 278, 120, pop(u, 0.15, 0.5), -3);
    return s;
  }
  // C: Mari Carmen satisfecha con el móvil (pantalla con el tic verde)
  let w = closeBack(T);
  w += placeMC(450, 1700, 8.4, Object.assign(mcBase(T, 8.4), {
    expr: 'proud', look: [0.4, -0.2], head: -5, armF: -34 + 3 * Math.sin(u * 3), armB: 4,
    handF: w2 => mcPhoneSmall(w2, 206, 133, -16, 'ok') + mHand(w2)
  }));
  w += counterFront();
  const [hx, hy] = mcPt(450, 1700, 8.4, 196, 64);
  w += sparkle(hx + 230, hy - 80, 36, pop(u, 0.15, 0.4) * (1 + 0.2 * Math.sin(u * 14)));
  w += sparkle(hx - 210, hy - 130, 28, pop(u, 0.25, 0.4) * (1 + 0.2 * Math.sin(u * 12 + 1)));
  w += sparkle(hx + 300, hy + 140, 22, pop(u, 0.35, 0.4) * (1 + 0.2 * Math.sin(u * 16 + 2)));
  return cam(comicZoom(u, 1.12), 540, 900, w);
};

/* ---------- 5) Todo en un solo lugar / Y te llega al WhatsApp / Apoyas al comercio ---------- */
const M5 = { x: 250, sc: 11.5, waist: 1560 };
const PH5 = { X: 575, Y: 540, PW: 450, PH: 850, hh: 130 };
const WEBC15 = [
  { label: 'OFERTA', shop: 'COMPLEMENTOS', l1: 'Bolsos con', l2: 'descuento', icon: 'bag', bg: '#FDE3EC', col: C.red },
  { label: 'NOVEDAD', shop: 'PANADERÍA', l1: 'Pastel', l2: 'nuevo', icon: 'cupcake', bg: '#FFF1C9', col: C.navy },
  { label: 'EVENTO', shop: 'BAR', l1: 'Tarde de', l2: 'música', icon: 'drink', bg: '#DDF0E3', col: C.green },
  { label: 'OFERTA', shop: 'ZAPATERÍA', l1: 'Zapatos', l2: 'en oferta', icon: 'shoe', bg: C.glass, col: C.red },
  { label: 'NOVEDAD', shop: 'FLORISTERÍA', l1: 'Flores de', l2: 'temporada', icon: 'bouquet', bg: '#DDF0E3', col: C.navy }
];
const WALK5 = [
  { i: 3, foot: 1262, sc: 1.95, v: 70, x0: -60, bag: C.red }, { i: 6, foot: 1268, sc: 1.95, v: -62, x0: 880, phone: true },
  { i: 9, foot: 1272, sc: 1.95, v: 58, x0: 420, bag: C.green }, { i: 10, foot: 1266, sc: 1.95, v: -76, x0: 640, phone: true },
  { i: 12, foot: 1340, sc: 2.15, v: 84, x0: 120, bag: C.pink, phone: true }, { i: 7, foot: 1352, sc: 2.15, v: -80, x0: 1000, bag: C.yel },
  { i: 1, foot: 1346, sc: 2.15, v: 66, x0: 610, phone: true }, { i: 13, foot: 1356, sc: 2.15, v: -70, x0: 330, bag: C.blue },
  { i: 4, foot: 1388, sc: 2.25, v: 60, x0: 860, bag: C.red, phone: true }
];
S[5] = (t, T, sc) => {
  const c = cues(sc, { titleA: 0.25, titleB: 0.3, msgs: [0.5, 1.3, 2.1], titleC: 0.3, heart: 0.15 });
  const [shot, a] = shotAt(t, sc);
  const u = t - a;
  if (shot === 'C') {
    let w = avenueBack(T, { sunX: 975, sunY: 560 });
    const list = WALK5.map((wk_, n) => ({ wk_, n, x: wrapX(wk_.x0 + wk_.v * u) })).sort((p, q) => p.wk_.foot - q.wk_.foot);
    list.forEach(({ wk_, n, x }) => {
      const o = walkerPose(wk_, x, u + n * 0.2, n, -9999);
      o.expr = ['smile', 'happy', 'smile', 'happy'][n % 4];
      o.look = [0.5, 0.6];
      o.head = 4 * Math.sin(T * 3 + n);
      if (wk_.phone) o.phone = { lit: true, card: n };
      w += walkerSvg(wk_, x, o).svg;
    });
    // corazón gigante que late sobre la calle y corazones pequeños que suben
    w += bigHeart(540, 690, 190, pop(u, c.heart, 0.6), u);
    [[200, 0.6], [880, 1.0], [360, 1.6], [760, 2.2], [130, 2.6]].forEach(([x, t0], i) => {
      const v = (u - t0) / 1.4;
      if (v > 0 && v < 1) w += riseHeart(x + 20 * Math.sin(v * 6 + i), lerp(1120, 760, v), 34, pop(u, t0, 0.35) * (1 - 0.6 * clamp((v - 0.7) / 0.3)), 8 * Math.sin(v * 5 + i));
    });
    let s = cam(comicZoom(u, 1.14), 540, 900, w);
    s += bigT('Apoyas al comercio', 540, 252, 112, pop(u, c.titleC, 0.5), -3);
    s += bigT('de tu ciudad', 540, 378, 132, pop(u, c.titleC + 0.25, 0.5), 2, { fill: C.yel });
    return s;
  }
  const py = mWaist(M5.waist, M5.sc), base = mBase(T, M5.sc, 2.1);
  const tr = talkOf(sc, 'maria'), talking = inRanges(t, tr);
  let w = DAY({ sx: 150, sy: 760, sr: 44 })(T);
  let armF, expr = 'sparkle';
  if (shot === 'A') armF = mArm(true, [228 + 2 * Math.sin(t * 3), 120 + 3 * Math.sin(t * 2.4)], 'open', { hs: 1.4, hrot: 30 });
  else {
    const kt = easeOut(seg(u, 2.4, 2.7));
    armF = u < 2.4 ? mArm(true, [230, 112 + 2 * Math.sin(t * 5)], 'point', { dir: -10, hs: 1.5 }) : mArm(true, lerp2([226, 124], [222, 98], kt), kt > 0.4 ? 'thumb' : 'fist', { hs: 1.5 });
    expr = u > 1.0 && u < 1.6 ? 'wink' : (u > 2.4 ? 'joy' : 'happy');
  }
  w += placeMaria(M5.x, py, M5.sc, Object.assign({}, base, { expr, talk: talk15(t, tr), armF, armB: mGestB(t, talking ? 1 : 0), head: 3 * Math.sin(T * 1.7) }));
  let ph;
  if (shot === 'A') {
    ph = portalPhone(PH5.X, PH5.Y, PH5.PW, PH5.PH, (sx, sy, sw_) => {
      let g = '';
      const tabs = ['Ofertas', 'Novedades', 'Eventos'], sel = Math.floor(clamp((u - 0.6) / 2.4) * 3) % 3, tw = (sw_ - 40) / 3;
      tabs.forEach((lb, i) => { g += pill(sx + 20 + tw * (i + 0.5), sy + 50, tw - 10, 58, sel === i ? C.red : '#FFFFFF', lb, { size: 28, col: sel === i ? '#FFFFFF' : INK, swk: 0.7, pad: 20 }); });
      const step = 314, cx0 = sx + sw_ / 2;
      let pos = 0;
      for (let i = 0; i < 5; i++) { const t0 = 0.6 + i * 0.7; if (u > t0) pos += Math.min(1, easeOut((u - t0) / 0.32)); }
      for (let j = -1; j < 8; j++) {
        const x = cx0 + (j - pos) * step;
        if (x < sx - 200 || x > sx + sw_ + 200) continue;
        g += webCard(x, sy + 116, WEBC15[((j % 5) + 5) % 5], u);
      }
      for (let i = 0; i < 5; i++) {
        const on = (Math.round(pos) % 5) === i;
        g += `<circle cx="${f(cx0 + (i - 2) * 34)}" cy="${f(sy + 570)}" r="${on ? 11 : 8}" fill="${on ? C.red : '#FFFFFF'}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
      }
      g += text('escaparatetudela.es', cx0, sy + 640, { size: 34, fill: '#8A8180', stroke: null, shadow: false });
      return g;
    }, { hh: PH5.hh });
  } else {
    const ks = c.msgs.map(m => pop(u, m, 0.5));
    ph = portalPhone(PH5.X, PH5.Y, PH5.PW, PH5.PH, chatScreen15(ks, u, PH5.hh), { hh: PH5.hh });
    const n = c.msgs.filter(m => u >= m).length;
    ph += badge15(PH5.X + PH5.PW - 10, PH5.Y + 20, n, n ? pop(u, c.msgs[n - 1], 0.4) : 0);
  }
  const pc = [PH5.X + PH5.PW / 2, PH5.Y + PH5.PH / 2];
  const pz = shot === 'B' ? bumpZ(u, c.msgs, 0.035) : 1;
  w += `<g transform="translate(${f(pc[0])} ${f(pc[1])}) scale(${f(pz)}) translate(${f(-pc[0])} ${f(-pc[1])})">${ph}</g>`;
  if (shot === 'B') {
    c.msgs.forEach(m => { w += waves15(pc[0], pc[1] - 100, u, m, 300, 560, 0.8, 3); });
    const kz = Math.max(...c.msgs.map(m => (u >= m && u < m + 0.5) ? 1 - (u - m) / 0.5 : 0));
    w += buzz15(PH5.X, PH5.X + PH5.PW, PH5.Y + 220, kz);
  } else {
    w += sparkle(PH5.X - 20, PH5.Y + 120, 26, pop(u, 0.5, 0.4) * (1 + 0.2 * Math.sin(u * 13)));
  }
  let s = cam(comicZoom(u), 540, 900, w);
  if (shot === 'A') {
    s += bigT('Todo en', 540, 258, 120, pop(u, c.titleA, 0.5), -3);
    s += bigT('un solo lugar', 540, 390, 140, pop(u, c.titleA + 0.25, 0.5), 2, { fill: C.yel });
  } else {
    s += bigT('Y te llega', 540, 258, 120, pop(u, c.titleB, 0.5), -3);
    s += bigT('al WhatsApp', 540, 390, 140, pop(u, c.titleB + 0.25, 0.5), 2, { fill: C.green });
  }
  return s;
};

/* ---------- 6) CIERRE: clientes / comercios / las dos / tarjeta final ---------- */
const BIRDS15 = [{ t0: 0.1, d: 3.6, dir: 1, y: 640, a: 30 }, { t0: 1.4, d: 3.8, dir: -1, y: 1180, a: 26 }, { t0: 2.4, d: 3.4, dir: 1, y: 880, a: 28 }];
S[6] = (t, T, sc) => {
  const c = cues(sc, { A_link: 0.3, A_strip: 1.3, A_who: 2.1, B_strip: 0.25, B_sub: 0.8, B_form: 1.5, B_who: 2.2, C_t1: 0.2, C_t2: 0.45, C_sub: 1.0 });
  const [shot, a] = shotAt(t, sc);
  const u = t - a;
  if (shot === 'FIN') {
    let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 720, 16, u * 8, C.dred);
    const kl = pop(u, 0, 0.45), bob = 6 * Math.sin(u * 3);
    // logo_blanco.png (icono + «ESCAPARATE DE TUDELA» en blanco) y la web
    s += logoBadge(540, 720 + bob, 820, lerp(-10, 0, kl), kl, 'logoW');
    const url = 'escaparatetudela.es', us = fit(url, 78, 720);
    s += at(540, 1250, pop(u, 0.25, 0.45), `<rect x="-400" y="-58" width="800" height="116" rx="58" transform="translate(10 10)" fill="${INK}"/><rect x="-400" y="-58" width="800" height="116" rx="58" fill="${C.dred}" stroke="${INK}" stroke-width="${f(SW)}"/>` + text(url, 0, 2, { size: us, sw: SW * 1.8, sd: 5 }));
    return s;
  }
  const trM = talkOf(sc, 'maria'), trC = talkOf(sc, 'maricarmen');
  let w = DAY({ sx: 960, sy: 760, sr: 50 })(T);
  let s;
  if (shot === 'A') {
    const py = mWaist(1600, 11.5), base = mBase(T, 11.5, 0.3);
    const kp = easeOut(seg(u, c.A_link - 0.2, c.A_link + 0.1)), kt = easeOut(seg(u, c.A_strip + 0.6, c.A_strip + 0.9));
    const armF = u < c.A_strip + 0.6 ? mArm(true, lerp2([210.5, 152], [226, 140 + 2 * Math.sin(u * 6)], kp), kp > 0.5 ? 'point' : 'fist', { dir: 70, hs: 1.5 })
      : mArm(true, lerp2([222, 132], [222, 98 - 3 * Math.max(0, damp(u - c.A_strip - 0.9, 12, 5))], kt), kt > 0.4 ? 'thumb' : 'fist', { hs: 1.5 });
    const expr = u > c.A_strip && u < c.A_strip + 0.6 ? 'wink' : 'sparkle';
    w += placeMaria(540, py, 11.5, Object.assign({}, base, { expr, talk: talk15(t, trM), armF, armB: mGestB(t, inRanges(t, trM) ? 1 : 0), head: 3 * Math.sin(T * 1.8) }));
    s = cam(comicZoom(u), 540, 900, w);
    s += strip15('Comenta CANAL', 540, 290, pop(u, c.A_strip, 0.5), -2);
    s += bigT('Enlace al canal de WhatsApp', 540, 414, 62, pop(u, c.A_link, 0.5), 0, { sw: SW * 1.6, sd: 5 });
    s += bigT('en la descripción', 540, 480, 62, pop(u, c.A_link + 0.12, 0.5), 0, { sw: SW * 1.6, sd: 5 });
    s += whoPill('Para clientes', 540, 562, pop(u, c.A_who, 0.5), { size: 46 });
    return s;
  }
  if (shot === 'B') {
    const sc_ = 9.5, py = mcWaist(1560, sc_), g = inRanges(t, trC) ? 1 : 0;
    w += placeMC(540, py, sc_, Object.assign(mcBase(T, sc_), {
      expr: 'smile', talk: talk15(t, trC, 11), look: [0.2, 0], head: 2 * Math.sin(T * 2.1),
      armF: -58 + 10 * Math.sin(u * 2.4), handF: openHandF,
      armB: lerp(-4, 30 + 16 * Math.sin(u * 2.9), g), handB: g ? openHandB : (w2 => mHand(w2, 175.5, 143, C.skinS))
    }));
    s = cam(comicZoom(u), 540, 900, w);
    s += strip15('¿Tienes un comercio?', 540, 292, pop(u, c.B_strip, 0.5), -2);
    s += bigT('Escríbenos y te informamos', 540, 420, 70, pop(u, c.B_sub, 0.5), 1, { sw: SW * 1.7, sd: 6, fill: C.yel });
    s += bigT('Formulario en la descripción · Comenta ALTA', 540, 508, 46, pop(u, c.B_form, 0.5), 0, { sw: SW * 1.3, sd: 4, maxW: 980 });
    s += whoPill('Para comercios', 540, 590, pop(u, c.B_who, 0.5), { size: 46 });
    return s;
  }
  // C: las dos juntas saludando
  w = DAY({ sx: 1000, sy: 610, sr: 44 })(T);
  w += flocks(u, BIRDS15);
  // las dos a la misma altura de cabeza; cada una saluda con el brazo de fuera
  const HT = 700, sM = 9, sC = 8.6;
  const pyM = HT + 147.2 * sM, baseM = mBase(T, sM, 0.9);
  const wave = Math.sin(u * 9);
  w += placeMaria(350, pyM, sM, Object.assign({}, baseM, { expr: u < 0.5 ? 'sparkle' : 'joy', talk: talk15(t, trM), head: -3 + 2 * Math.sin(T * 2),
    armB: mArm(false, [161 - 2 * wave, 90], 'open', { hs: 1.45, hrot: -18 * wave }), armF: M_REST_F() }));
  const pyC = HT + 151 * sC;
  w += placeMC(770, pyC, sC, Object.assign(mcBase(T, sC), { flip: true, expr: 'proud', talk: talk15(t, trC, 11), head: -3,
    armB: 166 + 9 * Math.sin(u * 9 + 1), handB: w2 => hand11('open', [175.5, 143], w2, { fill: C.skinS, hs: 0.95 }), armF: -6 }));
  s = cam(comicZoom(u), 540, 900, w);
  s += bigT('Entra en', 540, 256, 116, pop(u, c.C_t1, 0.5), -3);
  s += bigT('escaparatetudela.es', 540, 380, 124, pop(u, c.C_t2, 0.5), 2, { fill: C.yel, maxW: 1000 });
  s += bigT('y empieza a beneficiarte', 540, 500, 72, pop(u, c.C_sub, 0.5), -1, { sw: SW * 1.7, sd: 6 });
  return s;
};

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
  for (const [id, url, iw, ih] of logos) {
    const img = new Image(); img.src = url; await img.decode();
    const el = document.createElementNS(ns, 'image');
    // los logos se dibujan en un cuadro de 500 (coordenadas de recorte de la serie); el cartel, a su tamaño real
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
