/* Vídeo 10 — «Carmen y María». Escenas sobre lib.js + series.js + rosa.js + v04…v10.js.
   Todo se calcula a partir de (t local de la escena, T global). Franja de subtítulos (y > 1400) y margen
   superior (y < 192) libres de textos y elementos importantes. Cortes secos entre escenas. */
'use strict';

const S = {};
const big = (str, x, y, size, k, rot = 0, o = {}) => at(x, y, k, text(str, 0, 0, Object.assign({ size: fit(str, size, o.maxW || 980, o.font || 'B'), sw: SW * 2.3, sd: 9 }, o)), rot);
const bump = (t, times, a = 0.03) => 1 + times.reduce((m, t0) => m + (t >= t0 ? a * Math.max(0, damp(t - t0, 14, 6)) : 0), 0);
// cámara: el punto de mundo (wx,wy) queda en (sx,sy) con zoom z
const view = (z, wx, wy, inner, sx = 540, sy = 960) => `<g transform="translate(${f(sx)} ${f(sy)}) scale(${f(z)}) translate(${f(-wx)} ${f(-wy)})">${inner}</g>`;
const clipRect = (x, y, w, h, inner) => { const id = 'cr' + (uid++); return `<clipPath id="${id}"><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`; };
const qz = (t, t0, d) => easeInOut(clamp((t - t0) / d)); // acercamiento fluido con aceleración y frenada

/* ---------- piezas de escena ---------- */
const CAR = { x: 648, foot: 1162, sc: 2.0 };
const MAR = { x: 702, foot: 1312, sc: 1.85 };
// gente de la avenida que pasa de largo (t = tiempo local de la escena)
function avenueWalkers(t, o = {}) {
  let back = '', list = [];
  WALKERS.forEach((wk_, n) => {
    if (o.only && !o.only.includes(n)) return;
    const x = walkerX(wk_, t + (o.dt || 0));
    list.push({ wk_, n, x });
  });
  list.sort((a, b) => a.wk_.foot - b.wk_.foot);
  list.forEach(({ wk_, n, x }) => { back += walkerSvg(wk_, x, walkerPose(wk_, x, t, n)).svg; });
  return back;
}
// Carmen en su puerta. mode: 'hope' | 'sad' | 'surprise'; u = tiempo dentro del gesto
function carmenAt(T, o = {}) {
  return placeT(CARMEN, CAR.x, CAR.foot, CAR.sc, Object.assign({ bob: tBreath(T), blink: tBlink(T), expr: 'hope',
    armF: { ik: [199, 134], side: 1 }, armB: { ik: [188, 135], side: 1 } }, o));
}
function mariaAt(T, o = {}) {
  return placeT(MARIA, MAR.x, MAR.foot, MAR.sc, Object.assign({ bob: tBreath(T + 0.5), blink: tBlink(T, 1.3), expr: 'calm',
    armF: { ang: 6, bend: -10 }, armB: { ang: -4, bend: 8 } }, o));
}
const catAt = T => cat(800, 1322, 1.05, T, true);

/* ---------- 1) Pantalla partida: avenida de Carmen arriba, callejuela de María abajo ---------- */
const SPLIT = { top: [190, 600], bot: [810, 590], line: 800 };
S[1] = (t, T) => {
  let s = `<rect width="${W}" height="${H}" fill="${C.cream}"/>`;
  const kA = pop(t, 0.0, 0.55), kB = pop(t, 0.15, 0.55);
  // arriba: avenida (entra desde la izquierda)
  const [ay, ah] = SPLIT.top;
  let a = avenueBack(T, { sunX: 1250, sunY: 330 }) + carmenAt(T, { look: [0.8 * Math.sin(T * 2.4), 0] }) + avenueWalkers(t + 0.8);
  a = view(0.55 * bump(t, [0.55], 0.03), 560, 850, a, 540, ay + ah / 2);
  s += `<g transform="translate(${f((1 - kA) * -1150)} 0)">${clipRect(0, ay, W, ah, `<rect y="${ay}" width="${W}" height="${ah}" fill="${C.sky}"/>` + a)}<rect x="0" y="${ay}" width="${W}" height="${ah}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.4)}"/></g>`;
  // abajo: callejuela (entra desde la derecha)
  const [by, bh] = SPLIT.bot;
  let b = alleyBack(T) + mariaAt(T) + catAt(T);
  b = view(0.47 * bump(t, [0.7], 0.03), 560, 760, b, 540, by + bh / 2);
  s += `<g transform="translate(${f((1 - kB) * 1150)} 0)">${clipRect(0, by, W, bh, b)}<rect x="0" y="${by}" width="${W}" height="${bh}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.4)}"/></g>`;
  // línea negra gruesa en medio
  s += `<rect x="-10" y="${SPLIT.line - 11}" width="${W + 20}" height="22" fill="${INK}"/>`;
  // texto con rebote en el centro de la línea
  const k1 = pop(t, 0.6, 0.5), k2 = pop(t, 0.9, 0.5);
  const box = (k, y, rot, fill) => at(540, y, k, `<rect x="-430" y="-50" width="860" height="100" rx="24" transform="translate(9 9)" fill="${INK}"/><rect x="-430" y="-50" width="860" height="100" rx="24" fill="${fill}" stroke="${INK}" stroke-width="${f(SW)}"/>`, rot);
  s += box(k1, 748, -2, C.red) + big('Dos tiendas de moda.', 540, 748, 76, k1, -2, { maxW: 800 });
  s += box(k2, 852, 1.5, C.yel) + big('Dos calles muy distintas.', 540, 852, 72, k2, 1.5, { maxW: 800 });
  return s;
};

/* ---------- 2) Avenida de Carmen: mucha gente pasa… pero nadie entra ---------- */
const Z2 = { t0: 1.15, d: 0.5, z0: 0.92, z1: 1.5 };
S[2] = (t, T) => {
  // Carmen: esperanzada (mira a ambos lados) -> decaída -> suspiro -> mano en la mejilla
  const co = {};
  if (t < 2.9) {
    const lk = t < 0.9 ? 1.2 : (t < 1.7 ? -1.2 : 1.0 * Math.sin(t * 3));
    Object.assign(co, { expr: 'hope', look: [lk, -0.2], head: lk * 3 });
  } else if (t < 3.35) Object.assign(co, { expr: 'sad', look: [0, 0.6], head: 3 });
  else if (t < 3.8) Object.assign(co, { expr: 'sigh', slump: 2.5 * Math.sin(PI * clamp((t - 3.35) / 0.45)), head: 4 });
  else {
    const e = easeOut((t - 3.8) / 0.3);
    Object.assign(co, { expr: 'sad', look: [0.4, 0.8], head: 9 * e, armF: { ik: [lerp(199, 206, e), lerp(134, 92, e)], side: -1 }, itemF: e > 0.9 ? cheekItem : null, armB: { ang: 4, bend: -8 } });
  }
  let w = avenueBack(T) + carmenAt(T, co);
  if (t > 3.35 && t < 3.8) { const [mx, my] = tPt(CAR.x, CAR.foot, CAR.sc, 204, 90); w += sighPuff(mx + 10, my, (t - 3.35) / 0.45); }
  w += avenueWalkers(t) + AV_FG(T);
  const u = qz(t, Z2.t0, Z2.d), z = lerp(Z2.z0, Z2.z1, u) * bump(t, [Z2.t0 + Z2.d], 0.035) * zoomIn(t, 0, 1.1, 0.2);
  let s = view(z, lerp(540, 640, u), lerp(930, 1070, u), w);
  const k1 = pop(t, 0.25, 0.5), k2 = pop(t, 2.7, 0.5);
  s += big('Mucha gente pasa…', 540, 300, 118, k1, lerp(-8, -3, k1));
  s += big('…pero nadie entra', 540, 440, 118, k2, lerp(7, 2, k2), { fill: C.yel });
  return s;
};

/* ---------- 3) Callejuela de María: aquí casi no pasa nadie ---------- */
const PASS3 = { t0: 1.0, d: 2.6, i: 7 };
S[3] = (t, T) => {
  const passage = pg => {
    const u = (t - PASS3.t0) / PASS3.d;
    if (u < 0 || u > 1) return '';
    const x = lerp(pg.x - 40, pg.x + pg.w + 40, u), wp = walkPose(2 * PI * t / 0.8, 0.7);
    return placeFolk(PASS3.i, x, AL.base - 40, 0.95, { expr: 'meh', armF: wp.armF, armB: wp.armB, legF: wp.legF, legB: wp.legB, bob: wp.bob });
  };
  const look = t > 2.4 && t < 3.6 ? [1.2, 0.8] : [0.3, 0];
  let w = alleyBack(T, { passage }) + mariaAt(T, { look, head: t > 2.4 && t < 3.6 ? 4 : 0, expr: t > 2.6 && t < 3.6 ? 'happy' : 'calm' }) + catAt(T);
  let s = view(zoomIn(t, 0, 1.12, 0.22) * lerp(1.16, 1.22, easeInOut(t / 5)), 575, 1000, w, 540, 1000);
  const k1 = pop(t, 0.3, 0.5), k2 = pop(t, 0.5, 0.5);
  s += big('Aquí casi no', 540, 300, 130, k1, lerp(-8, -3, k1));
  s += big('pasa nadie', 540, 440, 130, k2, lerp(7, 2, k2), { fill: C.glass });
  return s;
};

/* ---------- 4) Interior de la tienda de María: pero siempre llena ---------- */
const CUST4 = [
  { i: 15, x: 170, foot: 1470, sc: 2.9, flip: false, bag: C.blue, expr: 'smile', armF: -8 },
  { i: 6, x: 360, foot: 1450, sc: 2.85, flip: true, dress: true, expr: 'sparkle' },
  { i: 12, x: 860, foot: 1480, sc: 2.95, flip: true, bag: C.navy, expr: 'happy' },
  { i: 4, x: 1000, foot: 1450, sc: 2.8, flip: true, expr: 'smile', bag: C.blue },
  { i: 9, x: 690, foot: 1500, sc: 2.95, flip: false, mirror: true, expr: 'sparkle' }
];
S[4] = (t, T) => {
  let w = mariaInterior(T, { sign: false, lampX: 930 });
  w += shopSignMODA(470, 540, 330, 104);
  w += mirror10(720, 640, 180, 600);
  w += rack(300, 640, 760, MI.floor, [[C.blue, K10.blueS, 1], [C.pink, K10.pinkS], [C.yel, '#C99A1E', 1], [C.glass, '#93C3D8'], [C.navy, '#22394F', 1], [C.red, '#A32323']]);
  w += fittingRoom(910, 640, 170, 760, T, true);
  // María atiende: entrega una bolsa
  const ph = T * 2.2;
  w += placeT(MARIA, 560, 1470, 2.75, { bob: tBreath(T), blink: tBlink(T, 1.3), expr: t > 1.4 ? 'proud' : 'happy', look: [0.6, 0.3],
    armF: { ang: lerp(10, -62, easeOut((t - 0.5) / 0.35)), bend: -14 }, itemF: t > 0.5 ? bagHang(C.blue, 1.15) : null, armB: { ang: -4, bend: 10 } });
  CUST4.forEach((c, n) => {
    const o = { flip: c.flip, expr: c.expr, look: [0.6, 0], bob: tBreath(T + n * 0.7) * 0.8, armF: c.armF || 0, armB: 0, head: 2 * Math.sin(T * 1.5 + n) };
    if (c.bag) o.handB = w2 => bagHang(c.bag, 1)(w2, 177.5, 139.5);
    if (c.dress) { o.armF = -70 + 4 * Math.sin(T * 3); o.handF = w2 => `<g transform="translate(202.5 139.5) rotate(70) scale(0.32) translate(0 -14)">${hanger(0, -10, C.blue, K10.blueS, 1, 1).replace(/stroke-width="[\d.]+"/g, 'stroke-width="7"')}</g><circle cx="202.5" cy="139.5" r="4.3" fill="${FOLK[c.i].skin}" stroke="${INK}" stroke-width="${w2(2.2)}"/>`; }
    if (c.mirror) { o.armF = -20; o.expr = 'sparkle'; o.look = [0.8, 0]; }
    w += shadowEll(c.x, c.foot, 70) + placeFolk(c.i, c.x, c.foot, c.sc, o);
  });
  w += sparkle(780, 760, 30, pop(t, 0.6, 0.35) * (1 + 0.2 * Math.sin(t * 14))) + sparkle(250, 900, 26, pop(t, 0.8, 0.35) * (1 + 0.2 * Math.sin(t * 12 + 1)));
  let s = view(zoomIn(t, 0, 1.14, 0.2) * bump(t, [0.1], 0.04), 540, 960, w);
  const k1 = pop(t, 0.25, 0.5);
  s += big('Pero siempre llena', 540, 330, 128, k1, lerp(-9, -3, k1), { fill: C.yel });
  return s;
};

/* ---------- 5) Viñetas: Carmen y María; «No basta con que te vean» / «Tienen que saber que existes» ---------- */
const P5L = { x: 50, y: 210, w: 455, h: 560 }, P5R = { x: 575, y: 210, w: 455, h: 560 };
S[5] = (t, T) => {
  let s = dotWall();
  const panelBox = (p, k, rot, inner) => at(p.x + p.w / 2, p.y + p.h / 2, k,
    `<rect x="${-p.w / 2 + 12}" y="${-p.h / 2 + 12}" width="${p.w}" height="${p.h}" fill="${INK}"/>` +
    clipRect(-p.w / 2, -p.h / 2, p.w, p.h, inner) + `<rect x="${-p.w / 2}" y="${-p.h / 2}" width="${p.w}" height="${p.h}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.3)}"/>`, rot);
  // viñeta de Carmen: gente pasando de largo
  const kL = pop(t, 0.05, 0.5), kR = pop(t, 0.2, 0.5);
  let a = avenueBack(T) + carmenAt(T, { expr: 'sad', look: [0.6, 0.3], head: 5 }) + avenueWalkers(t * 0.9 + 3, { only: [2, 3, 4, 5, 8, 11] });
  s += panelBox(P5L, kL, -2, view(0.9, 640, 1020, a, 0, 0));
  // burbujas de la gente: «¿Qué venden?»
  s += thought(250, 330, 330, 140, pop(t, 0.7, 0.45) * kL, '¿Qué venden?', 170, 470, 52);
  s += thought(420, 470, 130, 100, pop(t, 1.0, 0.45) * kL, '¿?', 380, 560, 60);
  // viñeta de María: callejuela vacía
  let b = alleyBack(T) + mariaAt(T, { expr: 'calm' }) + catAt(T);
  s += panelBox(P5R, kR, 2, view(0.78, 650, 1080, b, 0, 0));
  // signos de interrogación entre las viñetas
  s += mark('?', 540, 340, pop(t, 0.45, 0.4) * (1 + 0.06 * Math.sin(t * 6)), -10 + 6 * Math.sin(t * 3), 170, C.red);
  s += mark('?', 540, 640, pop(t, 0.6, 0.4) * (1 + 0.06 * Math.sin(t * 6 + 1)), 12 - 6 * Math.sin(t * 3), 140, C.yel);
  // textos grandes
  const k1 = pop(t, 1.5, 0.5), k2 = pop(t, 1.65, 0.5), k3 = pop(t, 2.8, 0.5), k4 = pop(t, 2.95, 0.5);
  s += big('No basta con', 540, 905, 128, k1, lerp(-8, -3, k1));
  s += big('que te vean', 540, 1030, 128, k2, lerp(6, 2, k2));
  s += big('Tienen que saber', 540, 1190, 120, k3, lerp(-6, -2, k3), { fill: C.yel });
  s += big('que existes', 540, 1315, 130, k4, lerp(6, 2, k4), { fill: C.yel });
  return cam(bump(t, [1.5, 2.8], 0.025), 540, 900, s);
};

/* ---------- 6) Interior: María publica; salen «Novedad» y «Oferta»; «Publicar» -> tic verde ---------- */
const M6 = { x: 430, y: 1590, sc: 4.7 };
const SLOT6 = [[812, 480], [812, 830]], FLY6 = [1.4, 1.9], CARD6K = 0.84;
const BTN6 = { x: 812, y: 1150, w: 420, h: 116 }, PRESS6 = 3.5;
S[6] = (t, T) => {
  let w = mariaInterior(T, { sign: false, lampX: 600 });
  w += shopSignMODA(200, 520, 300, 96);
  // María: bolsillo -> saca el móvil -> teclea -> satisfecha
  const pk = easeInOut(clamp((t - 0.05) / 0.3)), up = easeOut(clamp((t - 0.4) / 0.35));
  const typing = t > 0.85 && t < PRESS6, done = t >= PRESS6 + 0.1;
  let armF, armB;
  if (t < 0.4) armF = { ik: [lerp(206, 203, pk), lerp(146, 128, pk)], side: 1 };
  else armF = { ik: [lerp(203, PHONE_IK.F.ik[0], up), lerp(128, PHONE_IK.F.ik[1], up)], side: 1 };
  armB = { ik: [lerp(178, PHONE_IK.B.ik[0], up), lerp(145, PHONE_IK.B.ik[1], up)], side: 1 };
  const expr = done ? 'proud' : (t < 0.75 ? 'happy' : 'focus');
  const lookDown = done ? lerp(1, 0, easeOut((t - PRESS6 - 0.1) / 0.3)) : easeOut(clamp((t - 0.5) / 0.4));
  w += placeT(MARIA, M6.x, M6.y, M6.sc, { bob: tBreath(T), blink: tBlink(T, 1.3) && !typing, expr, look: done ? [0.8, -0.3] : [0.6 * lookDown, 1.4 * lookDown], head: done ? -3 : 6 * lookDown,
    armF, armB, front: t > 0.45 ? holdPhone10(t * 3.4, typing, done ? 'ok' : 'app') : null,
    pocketItem: t < 0.3 ? (w2 => `<rect x="200" y="122" width="6" height="8" rx="1.5" fill="${INK}"/>`) : null });
  // mostrador en primer plano
  w += `<rect x="-20" y="1258" width="${W + 40}" height="${H}" fill="${C.wood}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  w += `<rect x="-20" y="1236" width="${W + 40}" height="36" rx="10" fill="#C98A4B" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  for (let x = 60; x < W; x += 150) w += `<rect x="${x}" y="1274" width="44" height="${H}" fill="${C.woodS}" opacity="0.5"/>`;
  const [px, py] = tPt(M6.x, M6.y, M6.sc, 203, 121);
  if (typing && t < 1.4) for (let i = 0; i < 3; i++) { const tt = (t * 3.2 + i / 3) % 1; w += sparkle(px + (i - 1) * 90, py - 110 - tt * 80, 16 + 6 * (1 - tt), 1 - tt * 0.6); }
  let s = view(zoomIn(t, 0, 1.14, 0.22) * bump(t, [PRESS6], 0.03), 540, 960, w);
  // tarjetas que salen volando del móvil con estela
  FLY6.forEach((t0, i) => {
    if (t < t0) return;
    const e = easeOut(clamp((t - t0) / 0.42)), [tx, ty] = SLOT6[i];
    const path = arcPath([px, py - 20], [tx, ty], 260);
    if (e < 1) s += trail(path, e, 0.35, 40);
    const [cx, cy] = path(e);
    const land = pop(t, t0 + 0.38, 0.35);
    const k = e < 1 ? lerp(0.15, CARD6K, e) : CARD6K * (0.92 + 0.08 * land);
    const fl = t > t0 + 0.6 ? 6 * Math.sin((t - t0) * 2.4 + i) : 0;
    s += card10(i, cx, cy + fl, k, lerp(-25 + i * 10, [-3, 2][i], e), t, { done: t > PRESS6 + 0.15 + i * 0.1 ? pop(t, PRESS6 + 0.15 + i * 0.1, 0.35) : 0 });
  });
  // botón «Publicar» -> tic verde «Publicado»
  const kb = pop(t, 2.6, 0.45), pressed = t >= PRESS6;
  const sq = t >= PRESS6 - 0.05 && t < PRESS6 + 0.1 ? 0.92 : 1 + (pressed ? 0.06 * Math.max(0, damp(t - PRESS6 - 0.1, 16, 6)) : 0);
  if (kb > 0.01) {
    let b = `<rect x="${-BTN6.w / 2 + 9}" y="${-BTN6.h / 2 + 9}" width="${BTN6.w}" height="${BTN6.h}" rx="${BTN6.h / 2}" fill="${INK}"/>`;
    b += `<rect x="${-BTN6.w / 2}" y="${-BTN6.h / 2}" width="${BTN6.w}" height="${BTN6.h}" rx="${BTN6.h / 2}" fill="${pressed ? C.green : C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
    if (!pressed) b += text('Publicar', 0, 4, { size: 70, sw: SW * 1.8, sd: 5 });
    else { b += checkCircle(-124, 0, 44, pop(t, PRESS6 + 0.05, 0.4)); b += text('Publicado', 44, 4, { size: fit('Publicado', 64, 260), sw: SW * 1.8, sd: 5 }); }
    s += at(BTN6.x, BTN6.y, kb * sq, b);
  }
  if (t > PRESS6 && t < PRESS6 + 0.6) {
    const v = (t - PRESS6) / 0.6;
    for (let j = 0; j < 2; j++) { const u = clamp(v - j * 0.25); if (u > 0) s += `<circle cx="${BTN6.x + 110}" cy="${BTN6.y}" r="${f(30 + u * 190)}" fill="none" stroke="${INK}" stroke-width="${f(SW * (1.2 - u))}"/>`; }
  }
  if (t > PRESS6 + 0.1) [[600, 1040, 30, 0.1], [1030, 1250, 28, 0.18], [600, 330, 26, 0.26], [1030, 300, 30, 0.34]].forEach(([x, y, r, d], i) => { s += sparkle(x, y, r, pop(t, PRESS6 + d, 0.35) * (1 + 0.2 * Math.sin(t * 14 + i))); });
  // dedo que pulsa
  const fin = easeOut(clamp((t - 3.0) / 0.42)), out = easeInOut(clamp((t - PRESS6 - 0.3) / 0.4));
  const fx = lerp(1350, BTN6.x + 110, fin) + out * 900, fy = lerp(1320, BTN6.y + 10, fin) + (t > PRESS6 - 0.05 && t < PRESS6 + 0.1 ? 8 : 0);
  if (t > 3.0 && fx < 1340) s += finger(fx, fy, -14);
  return s;
};

/* ---------- 7) Avenida: vibran los móviles, ven las tarjetas de la tienda azul y echan a andar juntos ---------- */
const VIB7 = 0.6, UP7 = 1.0, GO7 = 2.2, ZC7 = 3.5;
function crowd7(t) {
  const list = WALKERS.map((wk_, n) => ({ wk_, n })).sort((a, b) => a.wk_.foot - b.wk_.foot);
  let s = '';
  list.forEach(({ wk_, n }) => {
    const tStop = Math.min(t, VIB7);
    const xStop = walkerX(wk_, tStop);
    let x = xStop, o;
    const lt = t - VIB7, vib = lt > 0 && lt < 0.55, up = easeOut((t - UP7 - n * 0.02) / 0.25);
    if (t < VIB7) o = walkerPose(wk_, x, t, n);
    else if (t < GO7 + n * 0.04) {
      o = { flip: wk_.v < 0, expr: up > 0.4 ? (n % 3 === 1 ? 'smile' : 'sparkle') : (vib ? 'surprise' : 'happy'), look: up > 0.4 ? [1, 1.6] : [0.4, 0], head: lerp(0, 12, up),
        armF: lerp(-22, -58, up) + (vib ? 4 * Math.sin(t * 70 + n) : 0), armB: 0, legF: 0, legB: 0, bob: up > 0 ? -3 * Math.max(0, damp(t - UP7, 14, 5)) : 0 };
      if (wk_.bag) o.bag = wk_.bag;
    } else {
      const g = t - GO7 - n * 0.04, wp = walkPose(2 * PI * g / 0.5, 1.1);
      x = xStop + 420 * g + 60 * easeOut(g / 0.3);
      o = { flip: false, expr: 'sparkle', look: [1, 0.4], head: 4, armF: -50, armB: wp.armB, legF: wp.legF, legB: wp.legB, bob: wp.bob, lean: 6 };
      if (wk_.bag) o.bag = wk_.bag;
    }
    o.phone = { lit: t > VIB7, card: n % 2, shake: vib ? 1.4 * Math.sin(t * 90 + n) : 0, rot: -10 };
    if (t < VIB7 && !wk_.phone) { o.phone = { lit: false }; o.armF = -16; }
    if (x > 1900) return;
    const r = walkerSvg(wk_, x, o);
    s += r.svg;
    if (vib) {
      s += vibeRings(r.phone[0], r.phone[1], t, 26);
      if (Math.floor(t * 14) % 2) s += `<path d="M${f(r.phone[0] - 58)} ${f(r.phone[1] - 20)} l-14 -14 M${f(r.phone[0] + 58)} ${f(r.phone[1] - 20)} l14 -14" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round"/>`;
    }
    if (t > GO7 + 0.1) s += speedLinesH(r.head[0] - 60, r.head[1] + 60, 90, 3, 34, SW * 0.8);
  });
  return s;
}
S[7] = (t, T) => {
  // Carmen: atenta -> sorpresa: abre mucho los ojos y mira alrededor
  const sur = t > 1.2;
  const lk = sur ? (t < GO7 ? 1.2 * Math.sin((t - 1.2) * 5) : (t < ZC7 ? 1.3 : 1.3 * Math.sin((t - ZC7) * 4.5))) : 0.6;
  const jump = sur ? -6 * Math.max(0, damp(t - 1.2, 12, 5)) : 0;
  let w = avenueBack(T) + carmenAt(T, { expr: sur ? 'surprise' : 'hope', look: [lk, -0.2], head: lk * 4, bob: tBreath(T) + jump,
    armF: sur ? { ang: -30, bend: -40 } : { ik: [199, 134], side: 1 }, armB: sur ? { ang: 30, bend: 40 } : { ik: [188, 135], side: 1 } });
  w += crowd7(t) + AV_FG(T);
  const [hx, hy] = tPt(CAR.x, CAR.foot, CAR.sc, 192, 60);
  if (t > ZC7 + 0.2) w += mark('!', hx + 60, hy - 30, pop(t, ZC7 + 0.2, 0.35), 10, 110, C.yel);
  const u = qz(t, ZC7, 0.45);
  const z = lerp(0.78, 1.9, u) * bump(t, [VIB7, UP7 + 0.3, ZC7 + 0.45], 0.03) * zoomIn(t, 0, 1.1, 0.2);
  let s = view(z, lerp(540, CAR.x, u), lerp(900, 1000, u), w);
  // abanico con las dos tarjetas de la tienda azul
  if (t < ZC7) [[330, 640, -7], [750, 640, 7]].forEach(([x, y, r], i) => {
    const k = pop(t, UP7 + 0.3 + i * 0.12, 0.5);
    s += card10(i, x, y + 6 * Math.sin(t * 2.4 + i), k * 0.62, lerp(r * 2.5, r, k), t);
  });
  const k1 = pop(t, 0.15, 0.5), k2 = pop(t, 0.35, 0.5);
  s += big('A la mano de', 540, 280, 130, k1, lerp(-8, -3, k1));
  s += big('tus clientes', 540, 420, 140, k2, lerp(7, 2, k2), { fill: C.yel });
  return s;
};

/* ---------- 8) Cierre: «Escaparate de Tudela hace que existas»; ¿Tienes un comercio?; Comenta ALTA ---------- */
const BIRDS8 = [{ t0: 0.2, d: 4.0, dir: 1, y: 1300, a: 36 }, { t0: 1.4, d: 4.4, dir: -1, y: 1360, a: 30 }, { t0: 3.0, d: 3.6, dir: 1, y: 1250, a: 32 }];
S[8] = (t, T) => {
  let s = skyClear(T, { band: 1150, tm: 720, sx: 930, sy: 1250, sr: 60, clouds: [
    { x0: 60, y: 250, s: 0.75, v: 16 }, { x0: 700, y: 1330, s: 0.85, v: 24 }, { x0: 300, y: 1450, s: 0.6, v: 11 },
    { x0: 1250, y: 1060, s: 0.9, v: 19 }, { x0: 1650, y: 520, s: 0.7, v: 14 }] });
  BIRDS8.forEach((b, i) => {
    const u = (t - b.t0) / b.d;
    if (u < 0 || u > 1) return;
    const x = b.dir > 0 ? lerp(-90, W + 90, u) : lerp(W + 90, -90, u);
    s += bird(x, Math.min(1380, b.y + Math.sin(u * 7 + i) * 14), b.a, 0.35 + 0.65 * Math.sin(t * 2 * PI / 0.34 + i * 2));
  });
  const k1 = pop(t, 0.15, 0.5), k2 = pop(t, 0.35, 0.55);
  s += big('Escaparate de Tudela', 540, 300, 112, k1, lerp(-8, -3, k1));
  s += big('hace que existas', 540, 440, 140, k2, lerp(7, 2, k2), { fill: C.yel, sd: 11 });
  if (t > 0.8) [[110, 430, 30, 0.8], [980, 300, 26, 0.9]].forEach(([x, y, r, d], i) => { s += sparkle(x, y, r, pop(t, d, 0.35) * (1 + 0.2 * Math.sin(t * 12 + i))); });
  // franja roja «¿Tienes un comercio?»
  const ks = pop(t, 1.3, 0.6);
  let st = `<rect x="-640" y="-82" width="1280" height="164" transform="translate(0 14)" fill="${INK}"/><rect x="-640" y="-82" width="1280" height="164" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  st += text('¿Tienes un comercio?', 0, 4, { size: fit('¿Tienes un comercio?', 96, 940), sw: SW * 2, sd: 6 });
  s += `<g transform="translate(${f(540 + (1 - ks) * -1500)} 650) rotate(-3)">${st}</g>`;
  // Comenta ALTA y te enviamos la solicitud
  const k3 = pop(t, 2.0, 0.5);
  let c = text('Comenta', -150, 2, { size: 100, sw: SW * 2, sd: 6 });
  c += at(240, 0, 1 + 0.05 * Math.sin(Math.max(0, t - 2.5) * 2 * PI / 1.1), `<rect x="-150" y="-66" width="300" height="132" rx="24" transform="translate(9 9)" fill="${INK}"/><rect x="-150" y="-66" width="300" height="132" rx="24" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW)}"/>` + text('ALTA', 0, 6, { size: 110, font: 'G', fill: C.red, sw: SW * 2, sd: 6, ls: 4 }), 4);
  s += at(540, 880, k3, c, lerp(-6, -2, k3));
  const k4 = pop(t, 2.3, 0.5);
  s += big('y te enviamos la solicitud', 540, 1030, 92, k4, lerp(6, 2, k4));
  const k5 = pop(t, 2.7, 0.5);
  s += at(540, 1150, k5, `<rect x="-330" y="-46" width="660" height="92" rx="46" transform="translate(8 8)" fill="${INK}"/><rect x="-330" y="-46" width="660" height="92" rx="46" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>` +
    text('escaparatetudela.es', 0, 2, { size: fit('escaparatetudela.es', 56, 580), fill: INK, stroke: null }));
  return cam(zoomIn(t, 0, 1.1, 0.2), 540, 800, s);
};

/* ---------- 9) El susurro: María se acerca, «Gratis hasta el 31 de enero»; tarjeta final ---------- */
const Z9 = { t0: 0.3, d: 1.0, s0: 1.32, s1: 3.3, y0: 760, y1: 860 };
S[9] = (t, T, sc) => {
  const cut = (sc && sc.cut) || 5;
  if (t < cut) {
    let s = skyClear(T, { band: 1250, tm: 720, sx: 105, sy: 600, sr: 52, clouds: [
      { x0: 40, y: 330, s: 0.8, v: 18 }, { x0: 620, y: 520, s: 0.7, v: 12 }, { x0: 1100, y: 1000, s: 0.9, v: 22 }, { x0: 1500, y: 700, s: 0.6, v: 9 }] });
    s += rays(540, 900, 18, t * 10, C.skyL);
    const u = qz(t, Z9.t0, Z9.d);
    const sc_ = lerp(Z9.s0, Z9.s1, u), cy = lerp(Z9.y0, Z9.y1, u);
    // gestos: mano a la boca -> mira a un lado y al otro -> vuelve a cámara con un guiño
    const hand = easeOut(clamp((t - 1.5) / 0.3));
    let look = [0, 0], head = 0, wink = 0, smile = 'calm', brow = 0;
    if (t > 1.0) smile = 'sly';
    if (t > 1.9 && t < 2.35) { const e = easeInOut((t - 1.9) / 0.15); look = [-1 * e, 0.1]; head = -3 * e; }
    else if (t >= 2.35 && t < 2.85) { const e = easeInOut((t - 2.35) / 0.15); look = [lerp(-1, 1, e), 0.1]; head = lerp(-3, 3, e); }
    else if (t >= 2.85 && t < 3.05) { const e = easeInOut((t - 2.85) / 0.2); look = [lerp(1, 0, e), 0]; head = lerp(3, 0, e); }
    if (t > 3.15 && t < 4.0) { wink = 1; smile = 'grin'; brow = 6; }
    if (t >= 4.0) smile = 'grin';
    const blink = !wink && ((t > 0.9 && t < 1.0) || (t > 4.5 && t < 4.6));
    const lean = u * 2;
    s += at(540, cy, sc_, mariaBust({ look, head: head + lean, wink, hand, smile, blink, brow }), 0);
    s += speedLinesRadial(540, cy, t > Z9.t0 && t < Z9.t0 + Z9.d ? Math.sin(PI * (t - Z9.t0) / Z9.d) : 0);
    // estrellita del guiño
    if (t > 3.15 && t < 4.3) s += sparkle(540 - 38 * sc_ - 40, cy - 10 * sc_ - 40, 34, pop(t, 3.15, 0.3) * (1 + 0.2 * Math.sin(t * 16)));
    // texto encima
    const k1 = pop(t, 1.25, 0.5), k2 = pop(t, 1.45, 0.5);
    s += big('Gratis hasta el', 540, 250, 116, k1, lerp(-8, -3, k1));
    s += big('31 de enero', 540, 385, 150, k2, lerp(7, 2, k2), { fill: C.yel, sd: 11 });
    return cam(bump(t, [Z9.t0 + Z9.d, 3.15], 0.03), 540, 900, s);
  }
  // tarjeta final: fondo rojo, logo blanco (logo_blanco.png, con «Escaparate de Tudela») y la web
  const u = t - cut;
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 700, 16, t * 8, '#C62828');
  const kl = pop(u, 0, 0.45), bob = 6 * Math.sin(u * 3);
  s += logoBadge(540, 700 + bob, 820, lerp(-10, 0, kl), kl, 'logoW');
  const url = 'escaparatetudela.es', us = fit(url, 78, 720);
  s += at(540, 1250, pop(u, 0.25, 0.45), `<rect x="-400" y="-58" width="800" height="116" rx="58" transform="translate(10 10)" fill="${INK}"/><rect x="-400" y="-58" width="800" height="116" rx="58" fill="${C.dred}" stroke="${INK}" stroke-width="${f(SW)}"/>` + text(url, 0, 2, { size: us, sw: SW * 1.8, sd: 5 }));
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
    // los PNG (1000x1000) se dibujan en un cuadro de 500 para mantener las coordenadas de recorte de la serie
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
