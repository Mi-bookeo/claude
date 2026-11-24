/* Vídeo 14 — «Ana y el cuentacuentos». Escenas sobre lib.js + series.js + rosa.js + v04…v14.js.
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
const seg = (t, a, b) => clamp((t - a) / (b - a));
const qm = (x, y, k, rot, size = 150) => at(x, y, k, text('¿?', 0, 0, { size, font: 'G', fill: C.yel, sw: SW * 2, sd: 7, ls: 4 }), rot);
const G = 1330, FEET = 1392;

/* ---------- plano medio de la librería (Ana tras el mostrador, a la izquierda) ---------- */
const MED = { top: 1110, ax: 330, asc: 6, c1: 720 };
MED.ay = MED.top + (208 - 138) * MED.asc;
function medRoom(t, T, ana_, o = {}) {
  let s = libRoom(T, { layout: 'med' });
  s += kidsCorner(T);
  s += placeAna(MED.ax, MED.ay, MED.asc, Object.assign({ bob: breathA(T, MED.asc), blink: blinkA(T) }, ana_));
  s += libCounter(-40, MED.c1, MED.top);
  s += register(560, MED.top - 4, 0, false);
  s += bookPile(130, MED.top - 4, 3, 0.9, 1);
  if (o.extra) s += o.extra;
  return s;
}
const aHead = () => aPt(MED.ax, MED.ay, MED.asc, 190, 74);
// dedo grande que pulsa (manga verde de Ana): punta del índice en (x,y)
function anaFinger(x, y, s = 1) {
  const w = v => f(v * SW / 3 * 2.2);
  const E = [x + 330 * s, y + 520 * s], Hh = [x + 62 * s, y + 92 * s];
  let g = capsule([E, Hh], 92 * s, AN.skin, w) + capsule([[E[0] + 40 * s, E[1] + 60 * s], lerp2(E, Hh, 0.3)], 124 * s, AN.jer, w);
  g += hand11('point', Hh, w, { hs: 10 * s, dir: -122, fill: AN.skin });
  return g;
}

/* ---------- 1) Exterior de la librería: Ana coloca un libro en el caballete ---------- */
const LIB1 = { x: 110, w: 820, h: 860 };
S[1] = (t, T, sc) => {
  const c = cues(sc, { title: 0.2, reach: 0.35, place: 1.45, thumb: 2.5 });
  let w = sky13(T, 'day', { band: 980, sx: 930, sy: 380, sr: 54 });
  w += shop(-330, G, 420, 600, SHOP_TYPES[1]) + shop(960, G, 420, 600, SHOP_TYPES[0]);
  w += libreria(LIB1.x, G, LIB1.w, LIB1.h, {});
  w += ground(G, 0, { sp: 230 });
  // vecino que pasea despacio al fondo de la calle (poca gente)
  const vx = lerp(1180, 900, t / 4.2);
  w += shadowEll(vx, FEET + 2, 64) + placeFolk(7, vx, FEET - 2, 3.0, Object.assign(walkPose(2 * PI * t / 1.2, 0.6), { flip: true, expr: 'smile', blink: blinkA(T, 1) }));
  // Ana coloca el libro rojo en la repisa del caballete
  const ax = 660, asc = 3.15, ex = 430;
  const placed = t >= c.place;
  const kr = easeInOut(seg(t, c.reach, c.place)), kb = easeOut(seg(t, c.place + 0.1, c.place + 0.6));
  const ledge = [ex + 8, 1130];
  const [lx, ly] = [190 + (ledge[0] - ax) / asc, 208 + (ledge[1] - 14 - FEET) / asc];
  const hold = [172, 124];
  const hB = placed ? lerp2([lx, ly], [168, 140], kb) : lerp2(hold, [lx, ly], kr);
  const armB = { h: hB, side: 1, hand: 'fist', hs: 1.25, item: placed ? null : heldBook(C.red, -6, 1.15) };
  const kt = easeOut(seg(t, c.thumb, c.thumb + 0.3));
  const armF = t < c.thumb ? AP.restF : { h: lerp2([212, 140], [221, 98], kt), side: 1, hand: kt > 0.4 ? 'thumb' : 'fist', hs: 1.45 };
  w += easel(ex, FEET + 2, 0.92, { book: placed ? C.red : null, bookWob: placed ? 6 * damp(t - c.place, 14, 5) : 0 });
  w += shadowEll(ax, FEET + 4, 80) + placeAna(ax, FEET, asc, { expr: t < c.place ? 'think' : (t < c.thumb ? 'happy' : 'proud'), look: t < c.place + 0.5 ? [-1.6, 1] : [0, 0], head: t < c.place + 0.5 ? -5 : 0, armB, armF, bob: breathA(T, asc), blink: blinkA(T) });
  if (placed) w += sparkle(ex - 70, 1040, 24, pop(t, c.place, 0.4) * (1 - seg(t, c.place + 0.8, c.place + 1.1))) + sparkle(ex + 80, 1010, 18, pop(t, c.place + 0.08, 0.4) * (1 - seg(t, c.place + 0.8, c.place + 1.1)), C.yel);
  let s = cam(comicZoom(t), 540, 900, w);
  s += bigT('Librería · Tudela', 540, 270, 132, pop(t, c.title, 0.5), -3);
  return s;
};

/* ---------- 2) Interior: Ana con la cartulina en blanco, dudando; «¿?» ---------- */
S[2] = (t, T, sc) => {
  const c = cues(sc, { title: 0.25, title2: 0.55, q: 1.0, scratch: 1.2 });
  const scr = t > c.scratch ? Math.sin(t * 16) : 0;
  const kc = easeOut(seg(t, c.scratch - 0.3, c.scratch));
  const armF = { h: lerp2([212, 140], [197 + 1.1 * scr, 98], kc), side: 1, hand: kc > 0.6 ? 'point' : 'fist', dir: -128, hs: 1.3 };
  const armB = { h: [181, 117], side: 1, hand: 'fist', hs: 1.25 };
  const sway = 1.5 * Math.sin(T * 1.3);
  let w = medRoom(t, T, { expr: t < c.scratch ? 'think' : 'doubt', look: [-1.6, 0.9], head: -5 + sway * 0.4, armF, armB,
    under: wl => blankSign(wl, 160, 112, 46, 34, -6 + sway) });
  const [hx, hy] = aHead();
  let s = cam(comicZoom(t) * bumpZ(t, [c.q], 0.02), 540, 900, w);
  s += qm(hx + 10, hy - 180, pop(t, c.q, 0.5), 8 * Math.sin(t * 3), 170);
  s += bigT('¿Y si organizo', 540, 262, 120, pop(t, c.title, 0.5), -3);
  s += bigT('un cuentacuentos?', 540, 384, 120, pop(t, c.title2, 0.5), 2, { fill: C.yel });
  return s;
};

/* ---------- 3) Nube: «El año pasado», la librería vacía; Ana suspira ---------- */
const A3 = { ax: 850, asc: 5.2, top: 1260 };
A3.ay = A3.top + 70 * A3.asc;
const CL3 = [440, 640, 820, 500];
function thoughtEmpty(cx, cy, k, t) {
  if (k <= 0.01) return '';
  const vw = 620, vh = 360;
  let g = `<rect x="${-vw / 2 + 12}" y="${-vh / 2 + 52}" width="${vw}" height="${vh}" rx="24" fill="${INK}"/>`;
  g += emptyRoom(-vw / 2, -vh / 2 + 40, vw, vh, t, { muted: true, r: 24 });
  g += `<rect x="${-vw / 2}" y="${-vh / 2 + 40}" width="${vw}" height="${vh}" rx="24" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.4)}"/>`;
  g += cartela('El año pasado', -40, -vh / 2 + 18, 1, -4, C.yel, INK, 56);
  return at(cx, cy, k, g);
}
S[3] = (t, T, sc) => {
  const c = cues(sc, { title: 0.3, nadie: 1.5, cloud: 0.4, sigh: 1.7 });
  const sg = seg(t, c.sigh, c.sigh + 1.4), sigh = Math.sin(sg * PI);
  let w = libRoom(T, { layout: 'med' });
  w += rug(200, 1330, 240, 60) + cushion(110, 1318, 1.0, C.yel, -8) + pufW(260, 1325, 3.0);
  w += placeAna(A3.ax, A3.ay, A3.asc, { expr: sg > 0 && sg < 1 ? 'sigh' : 'sad', look: [-0.6, 1.2], head: 4 + 3 * sigh, bob: breathA(T, A3.asc) + 2.4 * sigh, armF: AP.counterF, armB: AP.counterB, blink: blinkA(T) });
  w += libCounter(470, W + 60, A3.top);
  w += bookPile(600, A3.top - 4, 2, 0.9, 4);
  const [hx, hy] = aPt(A3.ax, A3.ay, A3.asc, 190, 74);
  if (sg > 0 && sg < 1) w += sighPuff(hx - 20, hy + 110, sg);
  let s = cam(comicZoom(t), 540, 900, w);
  const [cx, cy, cw, ch] = CL3;
  s += thinkDots(hx - 80, hy - 110, cx + cw * 0.3, cy + ch * 0.36, t, c.cloud - 0.15);
  const kc = pop(t, c.cloud, 0.55), fl = 6 * Math.sin(t * 2.2);
  s += thinkCloud(cx, cy + fl, cw, ch, kc);
  s += thoughtEmpty(cx, cy + fl, kc, t);
  s += bigT('El año pasado…', 540, 262, 120, pop(t, c.title, 0.5), -3);
  s += bigT('nadie', 860, 384, 120, pop(t, c.nadie, 0.5), 4, { fill: C.glass });
  // gotita de pena
  s += at(hx + 120, hy - 40, pop(t, c.sigh, 0.4), `<path d="M0 -26 Q16 0 0 12 Q-16 0 0 -26Z" fill="${C.glass}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`);
  return s;
};
function thinkDots(fromX, fromY, toX, toY, t, t0) {
  let s = '';
  [0.2, 0.45, 0.72].forEach((u, i) => { s += thinkDot(lerp(fromX, toX, u), lerp(fromY, toY, u), 16 + i * 10, pop(t, t0 + i * 0.08, 0.4)); });
  return s;
}

/* ---------- 4) Dos viñetas: puerta vacía / puerta con gente que atrae a más ---------- */
const P4 = { y: 480, w: 476, h: 700, xl: 42, xr: 562 };
function panelStreet(T, kind) {
  let s = `<rect x="-20" y="-20" width="${P4.w + 40}" height="${P4.h + 40}" fill="${C.sky}"/><rect x="-20" y="380" width="${P4.w + 40}" height="400" fill="${C.skyL}"/>`;
  s += sun(400, 90, 34, T * 10);
  s += cloud(((60 - 10 * T) % 700 + 700) % 700 - 120, 130, 0.42) + cloud(((380 - 14 * T) % 700 + 700) % 700 - 120, 230, 0.32);
  s += shop(60, 560, 360, 400, kind === 'R' ? SHOP_TYPES[3] : SHOP_TYPES[0]);
  s += `<rect x="-20" y="560" width="${P4.w + 40}" height="200" fill="${C.ground}"/><line x1="-20" y1="560" x2="${P4.w + 20}" y2="560" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  for (let x = -40; x < P4.w + 100; x += 150) s += `<line x1="${x}" y1="560" x2="${x - 80}" y2="720" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
  return s;
}
// gente que pasa de largo (izquierda) — periodos y carriles
const PASS_L = [{ i: 3, v: 120, o: 0.0 }, { i: 6, v: 95, o: 2.2 }, { i: 10, v: 130, o: 3.9 }];
// fila de la viñeta derecha: [folk, x final, momento de llegada, desde (−1 izq, 1 der)]
const QUEUE_R = [[F_MADRE, 330, -1, 0, 0], [11, 268, -1, 0, 0], [4, 206, -1, 0, 0], [1, 144, 1.0, 1, 0], [8, 82, 2.0, -1, 0], [F_PADRE, 20, 3.0, 1, 0]];
S[4] = (t, T, sc) => {
  const c = cues(sc, { title: 0.2, title2: 0.45, pl: 0.1, pr: 0.35, seal: 3.6 });
  let s = dotWall();
  // viñeta izquierda: nadie en la puerta; la gente pasa de largo
  let L = panelStreet(T, 'L');
  PASS_L.forEach((p, j) => {
    const per = (P4.w + 260) / p.v, u = (((t + p.o) % per) + per) % per, x = -120 + u * p.v;
    L += shadowEll(x, 650, 40) + placeFolk(p.i, x, 648, 1.55, Object.assign(walkPose(2 * PI * t / 0.7 + j, 0.9), { expr: j === 1 ? 'meh' : 'bored', look: [1, 0], blink: blinkA(T, j) }));
  });
  L += at(390, 470, 1, `<circle r="40" fill="${C.cream}" stroke="${INK}" stroke-width="${f(SW)}"/>` + `<path d="M-14 -12 L14 12 M14 -12 L-14 12" stroke="${C.red}" stroke-width="${f(SW * 1.6)}" stroke-linecap="round"/>`);
  // viñeta derecha: 3 personas en la puerta y la fila crece
  let R = panelStreet(T, 'R');
  QUEUE_R.slice().reverse().forEach(([i, xq, ta, from], j) => {
    let x = xq, walking = false;
    if (ta > 0) {
      const u = seg(t, ta - 1.1, ta);
      if (u <= 0) return;
      x = from > 0 ? lerp(P4.w + 100, xq, easeOut(u)) : lerp(-110, xq, easeOut(u));
      walking = u < 1;
    }
    const wp = walking ? walkPose(2 * PI * t / 0.6 + j, 0.9) : { bob: -1.4 * (0.5 - 0.5 * Math.cos(T * 3 + j)) };
    const glad = t > ta + 0.15;
    R += shadowEll(x, 650, 40) + placeFolk(i, x, 648, 1.55, Object.assign(wp, { flip: walking && from > 0 ? true : false, expr: walking ? 'curious' : (glad ? ['happy', 'smile', 'wow'][j % 3] : 'happy'), head: -2, blink: blinkA(T, j * 0.7) }));
    if (ta > 0) R += mark('!', x + 10, 360, pop(t, ta - 0.25, 0.4) * (1 - seg(t, ta + 0.5, ta + 0.7)), 8, 90, C.red);
  });
  R += at(400, 470, 1, `<circle r="40" fill="${C.cream}" stroke="${INK}" stroke-width="${f(SW)}"/>` + checkCircle(0, 0, 30, 1));
  const kl = pop(t, c.pl, 0.55), kr = pop(t, c.pr, 0.55);
  s += `<g transform="translate(${f(lerp(-560, 0, kl))} 0)">${insetFrame(P4.xl, P4.y, P4.w, P4.h, 1, L)}</g>`;
  s += `<g transform="translate(${f(lerp(560, 0, kr))} 0)">${insetFrame(P4.xr, P4.y, P4.w, P4.h, 1, R)}</g>`;
  s += bigT('La gente atrae', 540, 262, 128, pop(t, c.title, 0.5), -3);
  s += bigT('a la gente', 540, 384, 128, pop(t, c.title2, 0.5), 2, { fill: C.yel });
  s += rubberStamp('PRUEBA SOCIAL', 540, 1290, pop(t, c.seal, 0.45) * (1 + 0.25 * Math.max(0, damp(t - c.seal, 12, 8)) - 0.25 * Math.max(0, damp(t - c.seal, 12, 8))), -6);
  return s;
};

/* ---------- 5) ¡Chasquido! Ana publica el cuentacuentos en Escaparate ---------- */
const PH5 = { X: 170, Y: 470, PW: 740, PH: 920 };
S[5] = (t, T, sc) => {
  const c = cues(sc, { title: 0.3, title2: 0.55, snap: 0.4, bulb: 0.5, phone: 1.25, seal: 0.25, finger: 1.2, press: 1.8, release: 2.05 });
  const [shot, a] = shotAt(t, sc);
  const u = t - a;
  if (shot === 'A') {
    const snapK = u > c.snap ? Math.max(0, 1 - (u - c.snap) / 0.5) : 0;
    const ku = easeOut(seg(u, c.snap - 0.3, c.snap - 0.05));
    const snapPose = { h: lerp2([212, 140], [222, 92], ku), side: 1, hand: ku > 0.5 ? 'snap' : 'fist', snapK, hs: 1.45 };
    const phone = u >= c.phone;
    const jolt = u > c.snap ? -6 * Math.max(0, damp(u - c.snap, 16, 6)) : 0;
    const ana_ = phone ? { arms: 'phone', typePh: (u - c.phone) * 5.5, expr: 'determined', look: [0, 2], head: 4 }
      : { expr: u < c.snap ? 'think' : 'idea', armF: snapPose, armB: AP.counterB, head: -3, look: [0, -1], bob: breathA(T, MED.asc) + jolt };
    let w = medRoom(u, T, ana_);
    const [hx, hy] = aHead();
    if (u > c.snap && u < c.snap + 0.6) w += impactLines(hx, hy, u, 26, 260);
    let s = cam(comicZoom(u) * bumpZ(u, [c.snap], 0.04), 540, 900, w);
    if (!phone) s += bulb(hx, hy - 220, 52, pop(u, c.bulb, 0.5), u);
    else s += sparkle(hx - 170, hy - 120, 26, pop(u, c.phone, 0.4)) + sparkle(hx + 180, hy - 90, 20, pop(u, c.phone + 0.1, 0.4), C.yel);
    s += bigT('Esta vez,', 540, 262, 130, pop(u, c.title, 0.5), -3);
    s += bigT('en Escaparate', 540, 384, 130, pop(u, c.title2, 0.5), 2, { fill: C.yel });
    return s;
  }
  // B: pantalla del móvil a gran tamaño con la tarjeta de evento y el botón Publicar
  let s = dotWall();
  const done = u >= c.release, press = clamp((u - c.press) / 0.12) * (1 - clamp((u - c.release) / 0.08));
  const { X, Y, PW, PH } = PH5;
  const shake = u > c.release && u < c.release + 0.3 ? 6 * Math.sin(u * 60) : 0;
  const p = phoneFrame(X, Y, PW, PH, eventScreen({ kSeal: pop(u, c.seal, 0.5), press, done, kDone: pop(u, c.release, 0.35) }, u));
  s += cam(comicZoom(u, 1.08) * bumpZ(u, [c.release], 0.03), 540, 930, p, shake);
  const by = Y + 22 + 150 + 26 + (PH - 44 - 150 - 52) - 74;
  if (u > c.finger && u < c.release + 0.6) {
    const kin = easeOut((u - c.finger) / 0.4), kout = easeInOut((u - c.release - 0.15) / 0.4);
    s += anaFinger(660, by + 10 + lerp(700, 0, kin) + 700 * kout + (press > 0 ? 10 : 0), 1);
  }
  if (done) {
    const kd = pop(u, c.release, 0.4);
    s += sparkle(230, by - 70, 34, kd * (0.9 + 0.2 * Math.sin(u * 13))) + sparkle(860, by - 90, 28, kd * (0.9 + 0.2 * Math.sin(u * 11 + 1)), C.yel) + sparkle(820, by + 80, 22, kd);
  }
  s += bigT('Esta vez,', 540, 262, 130, 1, -3);
  s += bigT('en Escaparate', 540, 384, 130, 1, 2, { fill: C.yel });
  return s;
};

// vecino con el móvil en la mano (tarjeta del evento en la pantalla). Devuelve {svg, phone, head}
function evPerson(i, x, foot, sc, o) {
  const p = FOLK[i], s = sc * (p.scale || 1), a = (o.armF || 0) * PI / 180;
  const svg = placeFolk(i, x, foot, sc, Object.assign({}, o, { handF: evtPhoneHand(202.5, 139.5, { lit: o.lit, shake: o.shake, skin: p.skin }) }));
  const hx = 202 - 31.5 * Math.sin(a), hy = 108 + 31.5 * Math.cos(a);
  return { svg: shadowEll(x, foot, 26 * s) + svg, phone: toWorld(x, foot, 190, 204, s, hx + 3, hy - 13, o.flip), head: toWorld(x, foot, 190, 204, s, 192, 60, o.flip) };
}

/* ---------- 6) Calle: a los vecinos les vibra el móvil; la niña salta de alegría ---------- */
S[6] = (t, T, sc) => {
  const c = cues(sc, { title: 0.25, buzz: 0.35, take: 0.85, card: 1.15, smile: 1.9, jump: 2.4, tug: 3.2 });
  let w = sky13(T, 'day', { band: 980, sx: 900, sy: 760, sr: 54 });
  w += shop(-160, G, 440, 580, SHOP_TYPES[2]) + shop(330, G, 440, 580, SHOP_TYPES[1]) + shop(820, G, 440, 580, SHOP_TYPES[3]);
  w += ground(G, 0, { sp: 230 });
  const buzz = t > c.buzz && t < c.take + 0.3;
  const take = easeOut(seg(t, c.take, c.take + 0.3));
  const read = t > c.take + 0.3, glad = t > c.smile;
  const sh = j => buzz ? 2.4 * Math.sin(t * 70 + j) : 0;
  const ASC = 3.5;
  // madre (chaqueta amarilla) y su hija, que le coge la mano
  const mx = 270, tug = easeOut(seg(t, c.tug, c.tug + 0.4)) * (0.7 + 0.3 * Math.sin(t * 9));
  const mArmB = lerp(4, 30, tug);
  const [mhx, mhy] = folkHand(F_MADRE, mx, FEET, ASC, mArmB, false, false);
  const jumping = t > c.jump;
  const jmp = jumping ? 15 * Math.abs(Math.sin(PI * (t - c.jump) * 2.2)) : 0;
  const gx = 130 - 30 * tug, gsc = 3.5;
  const hb = kidLocal(gx, FEET, gsc, mhx, mhy, false);
  hb[1] += jmp;
  const girl = { who: 'nina', expr: jumping ? 'laugh' : (read ? 'wow' : 'happy'), look: [1.4, -1], jump: jmp, lean: -8 * tug, pigSw: 14 * Math.sin(t * 9) * (jumping ? 1 : 0.2),
    armF: { h: hb, side: 1, hand: 'ball' }, armB: jumping ? { h: [170 + 3 * Math.sin(t * 12), 120 - jmp * 0], side: 1, hand: 'open', hs: 0.95 } : null, blink: blinkA(T, 0.4) };
  w += shadowEll(gx, FEET + 4, 44 * (1 - jmp / 60)) + placeKid(gx, FEET, gsc, girl);
  const mom = evPerson(F_MADRE, mx, FEET, ASC, { expr: glad ? (tug > 0.2 ? 'wink' : 'wow') : (buzz ? 'surprise' : 'happy'), armF: lerp(4, -78, take), lit: take > 0.5, shake: sh(0), look: read && tug < 0.2 ? [0.4, 1] : [-0.6, 0.4], armB: mArmB, lean: -4 * tug, blink: blinkA(T) });
  w += mom.svg;
  // abuelo con boina y su nieto
  const gpx = 730;
  const gp = evPerson(F_ABUELO, gpx, FEET, ASC, { flip: true, expr: glad ? 'smile' : (buzz ? 'surprise' : 'happy'), armF: lerp(4, -80, take), lit: take > 0.5, shake: sh(1), look: read ? [0.4, 1] : [0, 0], blink: blinkA(T, 1.2) });
  const nx = 560, nj = jumping ? 8 * Math.abs(Math.sin(PI * (t - c.jump - 0.3) * 2.4)) : 0;
  w += shadowEll(nx, FEET + 4, 44) + placeKid(nx, FEET, 3.4, { who: 'nieto', expr: glad ? 'wow' : 'happy', look: [1.6, -1.6], head: 6, jump: nj,
    armF: glad ? { h: [214, 112], side: 1, hand: 'point', dir: -60, hs: 0.95 } : null, armB: null, blink: blinkA(T, 2) });
  w += gp.svg;
  // joven con auriculares
  const jx = 960;
  const jv = evPerson(F_JOVEN, jx, FEET, ASC, { flip: true, expr: glad ? 'sparkle' : (buzz ? 'surprise' : 'happy'), armF: lerp(4, -82, take), lit: take > 0.5, shake: sh(2), look: read ? [0.4, 1] : [0, 0], bob: glad ? -2 * Math.abs(Math.sin(T * 5)) : 0, blink: blinkA(T, 2.2) });
  w += jv.svg;
  // ondas concéntricas de vibración
  if (buzz) [mom, gp, jv].forEach((r, j) => { w += vibeRings(r.phone[0], r.phone[1], t + j * 0.13, 26, 3); });
  if (glad) [mom, gp, jv].forEach((r, j) => { w += sparkle(r.head[0] + (j === 0 ? 70 : -70), r.head[1] - 40, 22, pop(t, c.smile + j * 0.1, 0.4) * (0.9 + 0.2 * Math.sin(t * 10 + j)), j % 2 ? C.yel : '#FFFFFF'); });
  let s = cam(comicZoom(t), 540, 900, w);
  s += eventCardFloat(540, 600, 0.92 * pop(t, c.card, 0.5), lerp(-6, -2, pop(t, c.card, 0.5)), t);
  s += bigT('Directo a su móvil', 540, 270, 130, pop(t, c.title, 0.5), -3, { font: 'G', fill: C.yel, ls: 2 });
  return s;
};

/* ---------- 7) Llegan los primeros y atraen a los demás ---------- */
const LIB7 = { x: 40, w: 840, h: 860 };
const G7 = libGeo(LIB7.x, G, LIB7.w, LIB7.h), DOOR7 = G7.door, DC7 = DOOR7.x + DOOR7.w / 2;
// dibuja a alguien que entra por la puerta (recortado al hueco); u 0..1
function entering(svgFn, u) {
  if (u >= 1) return '';
  const id = 'en' + (uid++), d = DOOR7;
  const foot = lerp(FEET, d.y + d.h - 6, easeOut(u)), k = lerp(1, 0.86, u);
  return `<clipPath id="${id}"><rect x="${f(d.x)}" y="${f(d.y)}" width="${f(d.w)}" height="${f(d.h + 4)}"/></clipPath><g clip-path="url(#${id})">${svgFn(DC7, foot, k)}</g>`;
}
S[7] = (t, T, sc) => {
  const c = cues(sc, { title: 0.2, title2: 0.5 });
  const ASC = 3.05, KSC = 3.05;
  // aperturas de puerta: [abre, cierra]
  const OPEN = [[1.35, 2.25], [2.25, 3.35], [5.15, 6.2], [6.05, 6.9]];
  const op = OPEN.reduce((m, [a, b]) => Math.max(m, easeOut(seg(t, a, a + 0.25)) * (1 - easeInOut(seg(t, b - 0.25, b)))), 0);
  const ringT = OPEN.map(r => r[0]).filter(a => t >= a).pop();
  const ring = ringT !== undefined ? Math.max(0, damp(t - ringT, 18, 4)) : 0;
  let w = sky13(T, 'day', { band: 980, sx: 960, sy: 400, sr: 50 });
  w += shop(900, G, 420, 600, SHOP_TYPES[1]);
  w += libreria(LIB7.x, G, LIB7.w, LIB7.h, { open: op, bell: 26 * ring * Math.sin(t * 30), ring: clamp(ring * 2) });
  w += ground(G, 0, { sp: 230 });
  w += easel(380, FEET + 2, 0.92, { book: C.red });
  let back = '', front = '', inside = '';
  // --- gente del fondo que se para, mira y se suma (fila a la derecha de la puerta) ---
  const JOIN = [[4, 1300, 960, 3.9, 5.0], [6, 1400, 1060, 4.5, 5.6], [3, -200, 230, 4.2, 5.4]];
  JOIN.forEach(([i, x0, x1, a, b], j) => {
    if (t < a) return;
    const u = seg(t, a, b), x = lerp(x0, x1, easeOut(u)), walking = u < 1;
    const flip = x1 < x0;
    const wp = walking ? walkPose(2 * PI * t / 0.62 + j, 0.9) : { bob: -1.2 * (0.5 - 0.5 * Math.cos(T * 3 + j)) };
    back += shadowEll(x, FEET - 6, 70) + placeFolk(i, x, FEET - 10, 2.85, Object.assign(wp, { flip: walking ? flip : (x > DC7), expr: walking ? 'curious' : (t > b + 0.5 ? 'smile' : 'wow'), look: [1, -0.5], blink: blinkA(T, j) }));
    if (!walking) back += mark('!', x + (x > DC7 ? -20 : 20), 880, pop(t, b, 0.4) * (1 - seg(t, b + 0.6, b + 0.8)), 8, 80, C.red);
  });
  // --- madre y niña: llegan desde la izquierda; la niña entra; la madre se queda en la puerta y hace señas ---
  const mStop = 520, mWalk = seg(t, 0, 1.6), mx = t < 6.0 ? lerp(-180, mStop, easeOut(mWalk)) : mStop;
  const girlIn = seg(t, 1.6, 2.1);
  const wave = t > 3.0 && t < 4.8;
  const momIn = seg(t, 6.05, 6.8);
  const momPose = Object.assign(mWalk < 1 ? walkPose(2 * PI * t / 0.6, 0.9) : {}, { expr: wave ? 'wink' : 'happy', look: wave ? [1, -0.4] : [0.6, 0], blink: blinkA(T),
    armF: wave ? -150 + 22 * Math.sin(t * 11) : (mWalk < 1 ? 12 : 4), handF: wave ? waveHand(t * 11) : null });
  if (momIn <= 0) front += shadowEll(mx, FEET + 4, 72) + placeFolk(F_MADRE, mx, FEET, ASC, momPose);
  else if (momIn < 1) inside += entering((x, foot, k) => placeFolk(F_MADRE, x, foot, ASC * k, Object.assign(walkPose(2 * PI * t / 0.6, 0.6), { expr: 'happy' })), momIn);
  // niña: de la mano de la madre mientras andan
  if (t < 1.6) {
    const [hx, hy] = folkHand(F_MADRE, mx, FEET, ASC, momPose.armF, false, true);
    const gx = mx + 120;
    const hb = kidLocal(gx, FEET, KSC, hx, hy, true);
    front += shadowEll(gx, FEET + 4, 42) + placeKid(gx, FEET, KSC, { who: 'nina', flip: true, expr: 'laugh', legPh: 2 * PI * t / 0.42, bob: -2 * Math.abs(Math.sin(2 * PI * t / 0.42)), armF: { h: hb, side: 1, hand: 'ball' }, look: [-1, 0], pigSw: 10 * Math.sin(t * 12), blink: blinkA(T, 0.5) });
  } else if (girlIn < 1) inside += entering((x, foot, k) => placeKid(x, foot, KSC * k, { who: 'nina', expr: 'laugh', legPh: 2 * PI * t / 0.42, pigSw: 10 * Math.sin(t * 12) }), girlIn);
  // --- abuelo con boina y su nieto: detrás de la madre, entran ---
  const gWalk = seg(t, 0.7, 2.6), gx = lerp(-260, DC7 - 40, easeOut(gWalk)), gIn = seg(t, 2.55, 3.25);
  if (gIn <= 0) {
    const nx = gx + 110;
    if (t > 0.7) {
      front += shadowEll(gx, FEET + 4, 70) + placeFolk(F_ABUELO, gx, FEET, ASC, Object.assign(walkPose(2 * PI * t / 0.7, 0.8), { expr: 'smile', blink: blinkA(T, 1.4) }));
      const [hx, hy] = folkHand(F_ABUELO, gx, FEET, ASC, 10, false, true);
      front += shadowEll(nx, FEET + 4, 40) + placeKid(nx, FEET, KSC * 0.96, { who: 'nieto', flip: true, expr: 'wow', look: [-1, -0.6], legPh: 2 * PI * t / 0.44, armF: { h: kidLocal(nx, FEET, KSC * 0.96, hx, hy, true), side: 1, hand: 'ball' }, blink: blinkA(T, 1.8) });
    }
  } else if (gIn < 1) inside += entering((x, foot, k) => placeFolk(F_ABUELO, x, foot, ASC * k, Object.assign(walkPose(2 * PI * t / 0.7, 0.6), { expr: 'smile' })) + placeKid(x + 60, foot, KSC * 0.96 * k, { who: 'nieto', expr: 'wow' }), gIn);
  // --- padre (chaqueta gris y mochila) con su hijo: pasan, se paran, el niño tira hacia la puerta, entran ---
  const dA = seg(t, 1.0, 2.8), dB = seg(t, 4.6, 5.5), dIn = seg(t, 5.4, 6.1);
  const pull = t > 2.9 && t < 4.6 ? easeOut(seg(t, 2.9, 3.3)) * (0.8 + 0.2 * Math.sin(t * 10)) : 0;
  let dx = dA < 1 ? lerp(1320, 900, dA) : lerp(lerp(900, 860, easeOut(seg(t, 3.6, 4.3))), DC7 + 60, easeInOut(dB));
  const dWalking = dA < 1 || (dB > 0 && dB < 1) || (t > 3.6 && t < 4.3);
  if (dIn <= 0) {
    const dPose = Object.assign(dWalking ? walkPose(2 * PI * t / 0.68, 0.8) : {}, { flip: true, expr: t < 2.9 ? 'happy' : (t < 4.6 ? 'curious' : 'smile'), look: t > 2.9 ? [-1, 0] : [0, 0], head: t > 2.9 && t < 4.6 ? 4 : 0,
      lean: -pull * 5, armF: dWalking ? 10 : lerp(8, 34, pull), blink: blinkA(T, 0.9) });
    const [hx, hy] = folkHand(F_PADRE, dx, FEET, ASC, dPose.armF, true, true);
    const sx = dx - 118 - 22 * pull;
    const son = { who: 'hijo', expr: t > 2.8 ? 'wow' : 'happy', look: [-1.6, -0.4], head: -4 * pull, lean: -10 * pull, legPh: dWalking ? 2 * PI * t / 0.44 : undefined,
      armF: { h: kidLocal(sx, FEET, KSC, hx, hy, false), side: -1, hand: 'ball' }, armB: pull > 0.2 ? { h: [164, 140], side: 1, hand: 'point', dir: 180, hs: 0.95 } : null, blink: blinkA(T, 0.2) };
    front += shadowEll(dx, FEET + 4, 74) + placeFolk(F_PADRE, dx, FEET, ASC, dPose);
    front += shadowEll(sx, FEET + 4, 42) + placeKid(sx, FEET, KSC, son);
    if (pull > 0) { const [sx2, sy2] = [sx - 20, FEET - 330]; front += sparkle(sx2 - 40, sy2, 20, pop(t, 3.0, 0.4)) + sparkle(sx2 + 40, sy2 - 30, 16, pop(t, 3.1, 0.4), C.yel); }
  } else if (dIn < 1) inside += entering((x, foot, k) => placeFolk(F_PADRE, x + 30, foot, ASC * k, Object.assign(walkPose(2 * PI * t / 0.68, 0.6), { flip: true, expr: 'smile' })) + placeKid(x - 60, foot, KSC * k, { who: 'hijo', expr: 'wow' }), dIn);
  w += back;
  // quien entra se dibuja dentro del hueco de la puerta (por encima de la puerta, por debajo de los de delante)
  w += inside + front;
  let s = cam(comicZoom(t), 540, 940, w);
  s += bigT('Los primeros', 540, 262, 128, pop(t, c.title, 0.5), -3);
  s += bigT('atraen a los demás', 540, 384, 120, pop(t, c.title2, 0.5), 2, { fill: C.yel });
  return s;
};

/* ---------- 8) ¡Librería llena! La cuentacuentos y los niños en la alfombra ---------- */
const KIDS8 = [ // [quién, x, suelo, escala]
  ['rizos', 200, 1300, 3.0], ['hijo', 720, 1300, 3.0],
  ['nina', 120, 1398, 3.3], ['nieto', 340, 1398, 3.3], ['melena', 560, 1398, 3.3], ['coleta', 790, 1398, 3.3], ['gafitas', 990, 1398, 3.2]
];
const ST8 = { x: 450, base: 1235, sc: 4.2 };
const PARENTS8 = [[F_MADRE, 70, 1230, 3.3, false], [F_ABUELO, 270, 1215, 3.2, false], [F_PADRE, 770, 1225, 3.3, true], [10, 640, 1200, 3.1, true]];
function fullRoom(t, T, o = {}) {
  let s = libRoom(T, { layout: 'wide' });
  s += rug(470, 1335, 470, 86);
  s += cushion(930, 1300, 1.1, C.yel, 8);
  // padres de pie detrás, sonriendo
  PARENTS8.forEach(([i, x, foot, sc_, flip], j) => {
    s += shadowEll(x, foot + 4, 70) + placeFolk(i, x, foot, sc_, { flip, expr: ['smile', 'happy', 'sparkle', 'smile'][j], look: [flip ? 1 : 1, 0.3], bob: -1.4 * (0.5 - 0.5 * Math.cos(T * 2.6 + j)), blink: blinkA(T, j * 0.8), armF: 6, armB: 4 });
  });
  // Ana tras el mostrador (derecha): sorprendida y muy contenta, manos en las mejillas
  const ax = 960, asc = 3.7, atop = 1010;
  s += placeAna(ax, atop + 70 * asc, asc, { arms: 'cheeks', expr: 'amazed', look: [-1.6, 0.6], head: -4 + 2 * Math.sin(T * 3), jig: 0.8 * Math.sin(T * 8), bob: breathA(T, asc), blink: blinkA(T) });
  s += libCounter(840, W + 80, atop);
  s += bookPile(900, atop - 4, 2, 0.75, 6);
  // cuentacuentos en el puf
  const gst = 0.5 + 0.5 * Math.sin(T * 2.4);
  s += placeStory(ST8.x, ST8.base, ST8.sc, { gest: gst, gAng: T * 6, talk: talkA(T, [[-1, 999]], 10), look: [Math.sin(T * 0.9) * 1.2, 0.4], head: 3 * Math.sin(T * 1.7), blink: blinkA(T, 0.3) });
  // niños en la alfombra, con los ojos como platos
  KIDS8.forEach(([who, x, foot, sc_], j) => {
    const lk = x < ST8.x ? [1.4, -1] : [-1.4, -1];
    const lift = Math.max(0, Math.sin(T * 2.2 + j * 1.3)) ** 6;
    s += placeKid(x, foot, sc_, { who, pose: 'sit', expr: (j + Math.floor(T / 1.8)) % 3 === 0 ? 'laugh' : 'wow', look: lk, head: x < ST8.x ? 5 : -5, blink: blinkA(T, j * 0.6),
      armF: { h: [205 + 6 * lift, 196 - 30 * lift], side: 1, hand: lift > 0.4 ? 'open' : 'ball', hs: 0.9 }, armB: { h: [175, 196], side: -1, hand: 'ball' } });
  });
  // burbuja del cuento con el dragón
  const bub = o.split ? [700, 690, 460, 260] : [620, 480, 620, 330];
  const [tx, ty] = [ST8.x + 40, ST8.base - 150 * ST8.sc + 20];
  s += storyBubble(bub[0], bub[1], bub[2], bub[3], o.kb === undefined ? 1 : o.kb, t, tx + 80, ty + 40);
  return s;
}
S[8] = (t, T, sc) => {
  const c = cues(sc, { title: 0.3, bubble: 0.6 });
  let w = fullRoom(t, T, { kb: pop(t, c.bubble, 0.55) });
  let s = cam(comicZoom(t, 1.12), 540, 950, w);
  s += bigT('¡Librería llena!', 540, 262, 150, pop(t, c.title, 0.5), -3, { font: 'G', fill: C.yel, ls: 2 });
  s += sparkle(130, 240, 30, pop(t, 0.7, 0.4) * (0.9 + 0.2 * Math.sin(t * 9))) + sparkle(960, 300, 24, pop(t, 0.8, 0.4) * (0.9 + 0.2 * Math.sin(t * 11)), C.yel);
  return s;
};

/* ---------- 9) Pantalla partida: el año pasado (vacía) / este año (llena) ---------- */
const SP9 = { y0: 190, mid: 795, y1: 1400 };
S[9] = (t, T, sc) => {
  const c = cues(sc, { top: 0.05, bot: 0.45, l1: 0.35, l2: 0.8, flash: 2.9 });
  let s = dotWall();
  const ht = SP9.mid - SP9.y0 - 8, hb = SP9.y1 - SP9.mid - 8;
  // arriba: la librería vacía de la escena 3, apagada
  const kt = pop(t, c.top, 0.55), kb = pop(t, c.bot, 0.55);
  let top = emptyRoom(0, SP9.y0, W, ht, t, { muted: true });
  top += cartela('El año pasado', 270, SP9.y0 + 70, pop(t, c.l1, 0.45), -4, C.yel, INK, 62);
  s += `<g transform="translate(${f(lerp(-W, 0, kt))} 0)">${top}</g>`;
  // abajo: la librería llena de la escena 8, colores vivos
  const id = 'sp' + (uid++), zs = 0.72, y0 = SP9.mid + 8;
  let inner = `<clipPath id="${id}"><rect x="0" y="${y0}" width="${W}" height="${hb}"/></clipPath><g clip-path="url(#${id})">`;
  inner += `<g transform="translate(540 ${f(y0 + hb / 2)}) scale(${zs}) translate(-500 -1000)">${fullRoom(t, T, { split: true })}</g>`;
  if (t > c.flash) {
    const u = seg(t, c.flash, c.flash + 0.7);
    inner += `<g opacity="${f(0.85 * (1 - u))}">${rays(540, y0 + hb / 2, 18, t * 40, '#FFFFFF', 900)}</g>`;
    inner += `<rect x="0" y="${y0}" width="${W}" height="${hb}" fill="#FFFFFF" opacity="${f(0.7 * (1 - seg(t, c.flash, c.flash + 0.25)))}"/>`;
  }
  inner += `</g>`;
  inner += cartela('Este año', 220, y0 + 64, pop(t, c.l2, 0.45), 4, C.green, '#FFFFFF', 62);
  if (t > c.flash) {
    const kf = pop(t, c.flash, 0.4);
    inner += sparkle(120, y0 + 160, 40, kf * (0.9 + 0.2 * Math.sin(t * 13))) + sparkle(960, y0 + 120, 34, kf * (0.9 + 0.2 * Math.sin(t * 11 + 1)), C.yel) + sparkle(900, y0 + 480, 28, kf) + sparkle(200, y0 + 500, 24, kf, C.yel);
  }
  s += `<g transform="translate(${f(lerp(W, 0, kb))} 0)">${inner}</g>`;
  // marcos y línea negra gruesa en medio
  s += `<rect x="-20" y="${SP9.y0}" width="${W + 40}" height="${ht}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.6)}"/>`;
  s += `<rect x="-20" y="${y0}" width="${W + 40}" height="${hb}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.6)}"/>`;
  s += `<rect x="-20" y="${SP9.mid - 10}" width="${W + 40}" height="26" fill="${INK}"/>`;
  return s;
};

/* ---------- 10) Ana sale y se acerca a cámara: mensaje a los comercios; tarjeta final ---------- */
const BIRDS14 = [{ t0: 0.3, d: 4.4, dir: 1, y: 620, a: 30 }, { t0: 3.6, d: 5.0, dir: -1, y: 520, a: 26 }, { t0: 6.4, d: 4.6, dir: 1, y: 700, a: 28 }];
function vFlock(x, y, a, t, i) {
  let s = '';
  [[0, 0], [-1, 1], [1, 1]].forEach(([dx, dy], j) => {
    s += bird(x + dx * a * 1.5, y + dy * a * 0.9, a * (j ? 0.8 : 1), 0.35 + 0.65 * Math.sin(t * 2 * PI / 0.34 + i * 2 + j));
  });
  return s;
}
const LIB10 = { x: -30, w: 860, h: 860 };
S[10] = (t, T, sc) => {
  const c = cues(sc, { out: 0.2, walk: 0.8, near: 3.2, a1: 3.4, strip: 4.3, sub: 5.1, wa: 6.4, url: 7.1, thumb: 5.6 });
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
  const g = libGeo(LIB10.x, G, LIB10.w, LIB10.h), d = g.door, dc = d.x + d.w / 2;
  const op = easeOut(seg(t, c.out - 0.2, c.out + 0.1)) * (1 - easeInOut(seg(t, c.walk + 0.6, c.walk + 1.0)));
  const ring = t > c.out - 0.2 ? Math.max(0, damp(t - c.out + 0.2, 18, 4)) : 0;
  let w = sky13(T, 'day', { band: 980, sx: 900, sy: 420, sr: 56 });
  BIRDS14.forEach((b, i) => {
    const u = (t - b.t0) / b.d;
    if (u < 0 || u > 1) return;
    const x = b.dir > 0 ? lerp(-140, W + 140, u) : lerp(W + 140, -140, u);
    w += vFlock(x, Math.min(1300, b.y + Math.sin(u * 7 + i) * 14), b.a, t, i);
  });
  w += shop(830, G, 440, 600, SHOP_TYPES[3]);
  w += libreria(LIB10.x, G, LIB10.w, LIB10.h, { open: op, bell: 26 * ring * Math.sin(t * 30), ring: clamp(ring * 2) });
  w += ground(G, 0, { sp: 230 });
  w += easel(200, FEET + 2, 0.92, { book: C.red });
  // Ana: sale por la puerta (recortada al hueco) y se acerca hasta el primer plano
  const kw = easeInOut(seg(t, c.walk, c.near));
  const asc = lerp(3.0, 13, kw * kw * 0.35 + kw * 0.65);
  const headY = lerp(FEET - 132 * 3.0, 1060, kw);
  const foot = headY + 132 * asc, ax = lerp(dc, 540, kw);
  const walking = t > c.walk && t < c.near;
  const talking = t > c.a1 - 0.1;
  const kt = easeOut(seg(t, c.thumb, c.thumb + 0.3));
  const armF = t < c.thumb ? (walking ? { h: [213, 140 + 3 * Math.sin(t * 9)], side: -1, hand: 'fist', hs: 1.2 } : AP.restF)
    : { h: lerp2([212, 140], [221, 100 - 3 * Math.max(0, damp(t - c.thumb - 0.3, 12, 5))], kt), side: 1, hand: kt > 0.4 ? 'thumb' : 'fist', hs: 1.45 };
  const anaO = { expr: t < c.near ? 'happy' : 'happy', talk: talking ? talkA(t, [[c.a1 - 0.1, 9.6]], 11) : 0, walk: walking ? 2 * PI * t / 0.7 : undefined,
    armF, armB: walking ? { h: [167, 140 - 3 * Math.sin(t * 9)], side: 1, hand: 'fist', hs: 1.2 } : AP.restB, head: talking ? 2 * Math.sin(T * 2.1) : 0, look: [0, 0.3],
    bob: breathA(T, asc) + (walking ? -1.6 * Math.abs(Math.sin(2 * PI * t / 0.7)) : 0), blink: blinkA(T) };
  if (t < c.walk) {
    const id = 'ad' + (uid++), u = seg(t, c.out, c.walk);
    w += `<clipPath id="${id}"><rect x="${f(d.x)}" y="${f(d.y)}" width="${f(d.w)}" height="${f(d.h + 4 + 80 * u)}"/></clipPath><g clip-path="url(#${id})">${placeAna(dc, lerp(d.y + d.h - 10, FEET, u), 3.0 * lerp(0.9, 1, u), Object.assign({}, anaO, { walk: 2 * PI * t / 0.7 }))}</g>`;
  } else {
    w += shadowEll(ax, Math.min(foot, FEET + 4) + 4, 80 * asc / 3);
    w += placeAna(ax, foot, asc, anaO);
  }
  let s = cam(comicZoom(t, 1.1) * bumpZ(t, [c.thumb + 0.3], 0.02), 540, 900, w);
  s += bigT('¿Tienes un negocio?', 540, 262, 118, pop(t, c.a1, 0.5), -3, { fill: C.yel });
  const ks = pop(t, c.strip, 0.5), pulse = t > c.strip + 0.6 ? 1 + 0.03 * Math.sin((t - c.strip) * 2 * PI / 1.1) : 1;
  s += at(540, 400, ks * pulse, `<rect x="-470" y="-62" width="940" height="124" rx="26" transform="translate(10 10)" fill="${INK}"/><rect x="-470" y="-62" width="940" height="124" rx="26" fill="${C.red}" ${st12()}/>` +
    text('Comenta ALTA', 0, 4, { size: 96, sw: SW * 2, sd: 6 }), -2);
  s += bigT('y te enviamos el formulario', 540, 526, 68, pop(t, c.sub, 0.5), 1, { fill: '#FFFFFF', maxW: 960 });
  s += at(540, 626, pop(t, c.wa, 0.5), pill(0, 0, 820, 84, C.green, 'Canal de WhatsApp en la descripción', { size: 42, dx: 30, pad: 110 }) + iconChat(-350, 0, 26), -1);
  s += at(540, 718, pop(t, c.url, 0.5), `<rect x="-230" y="-32" width="460" height="64" rx="32" transform="translate(6 6)" fill="${INK}"/><rect x="-230" y="-32" width="460" height="64" rx="32" fill="#FFFFFF" ${st12(0.8)}/>` +
    text('escaparatetudela.es', 0, 2, { size: 38, fill: INK, stroke: null, shadow: false }));
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
  const col = c.who === 'ana' ? C.yel : '#FFFFFF';
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
