/* Vídeo 09 — «De puerta en puerta». Escenas sobre lib.js + series.js + rosa.js + v04…v09.js.
   Todo se calcula a partir de (t local de la escena, T global). Franja de subtítulos (y > 1400) y margen
   superior (y < 192) libres de textos y elementos importantes. Cortes secos entre escenas.
   Escenas 1-3 y primera mitad de la 4: 1945 (sepia, 15 fps efectivos, temblor, arañazos). Resto: estilo de la serie. */
'use strict';

const S = {};
const big = (str, x, y, size, k, rot = 0, o = {}) => at(x, y, k, text(str, 0, 0, Object.assign({ size: fit(str, size, o.maxW || 980, o.font || 'B'), sw: SW * 2.3, sd: 9 }, o)), rot);
const bump = (t, times, a = 0.03) => 1 + times.reduce((m, t0) => m + (t >= t0 ? a * Math.max(0, damp(t - t0, 14, 6)) : 0), 0);
const breathe = T => -1.6 * (0.5 - 0.5 * Math.cos(2 * PI * T / 1.6));
const day = (T, o = {}) => skyClear(T, Object.assign({ band: 1000, tm: 720, sx: 930, sy: 300, sr: 54 }, o));
const MCB_ = T => ({ bob: breath(T), blink: blinkAt(T) });
const GROUND_OLD = 1380;

/* ---------- 1) 1945 · Cartón de título: «1945» con rebote; «Después de la guerra» ---------- */
S[1] = (t, T) => {
  let w = paperBg();
  // cartón con doble filete
  w += `<rect x="96" y="430" width="888" height="860" fill="none" stroke="${O.ink}" stroke-width="6"/><rect x="118" y="452" width="844" height="816" fill="none" stroke="${O.brown}" stroke-width="2.5"/>`;
  [[96, 430], [984, 430], [96, 1290], [984, 1290]].forEach(([x, y]) => { w += `<rect x="${x - 16}" y="${y - 16}" width="32" height="32" fill="${O.paper}" stroke="${O.ink}" stroke-width="4" transform="rotate(45 ${x} ${y})"/>`; });
  const kr = easeOut((t - 0.15) / 0.35);
  w += ornRule(540, 560, 640, kr);
  const k = pop(t, 0.3, 0.6);
  w += bigOld('1945', 540, 800, 380, k, lerp(-10, 0, k), { sd: 12 });
  w += ornRule(540, 1030, 640, easeOut((t - 0.7) / 0.35));
  const k2 = pop(t, 1.0, 0.5);
  w += bigOld('Después de la guerra', 540, 1135, 78, k2, lerp(6, 0, k2), { font: 'A', maxW: 760, sd: 4 });
  return oldFilm(cam(zoomIn(t, 0, 1.12, 0.2) * lerp(1, 1.04, easeInOut(t / 4)), 540, 860, w), T);
};

/* ---------- 2) 1945 · Calle antigua: el vendedor entra con la cestilla de tornillos; «Puerta a puerta» ---------- */
const V2 = { sc: 3.35, stop: 470, tStop: 3.3 };
S[2] = (t, T) => {
  let w = oldSky(T, { band: 860, sx: 880, sy: 450, sr: 64 });
  w += stoneHouse(-60, GROUND_OLD, 430, 720, { door: { col: O.olive, at: 0.55 }, win: 2, roof: O.rust });
  w += stoneHouse(370, GROUND_OLD, 390, 820, { wall: O.creamS, shut: O.olive, door: { col: O.brown, at: 0.5 }, win: 2, roof: O.brownS });
  w += stoneHouse(760, GROUND_OLD, 400, 640, { shut: O.rust, door: { col: O.grey, at: 0.42 }, win: 2, roof: O.rust });
  w += gasLamp(985, GROUND_OLD, 600);
  w += cobbles(GROUND_OLD);
  // vendedor
  let x, o;
  if (t < V2.tStop) { x = lerp(-180, V2.stop, t / V2.tStop); o = Object.assign(oldWalk(t), { expr: 'smile' }); }
  else {
    x = V2.stop;
    const u = t - V2.tStop, up = easeOut(u / 0.3);
    o = { legF: 0, legB: 0, armB: -4, bendB: 6, armF: lerp(-10, 58, up), bendF: lerp(10, 58, up), expr: u > 0.3 ? 'talk' : 'smile', bob: breathe(T), bb: 2 * Math.max(0, damp(u, 12, 5)) };
    if (up > 0.5) o.holdF = holdScrew(2.4);
  }
  w += shadowOld(x, GROUND_OLD + 4, 26 * V2.sc) + placeOld(VENDOR, x, GROUND_OLD, V2.sc, o);
  if (t > V2.tStop + 0.35) {
    const [hx, hy] = oldPt(x, GROUND_OLD, V2.sc, ...oldHandPt(OL.shF, 58, 58), false);
    w += glintOld(hx + 20, hy - 70 + o.bob * V2.sc, 30, pop(t, V2.tStop + 0.35, 0.3) * (1 + 0.2 * Math.sin(t * 15)));
  }
  let s = cam(zoomIn(t, 0, 1.12, 0.22), 540, 950, w);
  const k = pop(t, 0.5, 0.6);
  s += bigOld('Puerta a puerta', 540, 320, 150, k, lerp(-8, -3, k), { stroke: O.cream, sw: SW * 2.2, sd: 10, shadow: O.ink });
  return oldFilm(s, T);
};

/* ---------- 3) 1945 · Montaje de 3 puertas: ¡toc, toc!, abre un vecino, tornillo, monedas, saluda con la gorra ---------- */
const V3 = { x: 395, sc: 3.4, nx: 770, nsc: 3.3 };
const DOORS3 = [{ col: O.olive, num: 3, wall: O.dbeige }, { col: O.rust, num: 7, wall: O.creamS }, { col: O.grey, num: 12, wall: O.paper }];
S[3] = (t, T, sc) => {
  const D = (sc && sc.duration) || 5, d = D / 3, shot = Math.min(2, Math.floor(t / d)), u = t - shot * d;
  const DR = DOORS3[shot], NB = OLDFOLK[shot];
  const open = easeOut((u - 0.38) / 0.16);
  let w = doorWall({ col: DR.col, num: DR.num, wall: DR.wall, open });
  w += cobbles(GROUND_OLD);
  // vecino en la puerta (mira a la izquierda)
  const KN = 0.42, SHOW = 0.55, GIVE = 0.95, COINS = 1.05, CAP = 1.27;
  const ng = { flip: true, expr: 'smile', armF: -4, bendF: 8, armB: 4, bendB: 6, bob: breathe(T + shot), head: 2 };
  if (u < SHOW + 0.15) ng.expr = 'surprise';
  if (u > GIVE - 0.1 && u < CAP) { const e = easeOut((u - GIVE + 0.1) / 0.15); ng.armF = lerp(-4, 62, e); ng.bendF = lerp(8, 30, e); ng.expr = 'talk'; }
  if (u > CAP) { const e = easeOut((u - CAP) / 0.15); ng.armF = lerp(62, 150, e) + 10 * Math.sin((u - CAP) * 22); ng.bendF = 30; ng.expr = 'happy'; }
  if (u > GIVE - 0.1 && u < COINS) ng.holdF = holdCoins(3);
  if (u > GIVE + 0.16 && u < CAP + 0.05) ng.holdF = holdScrew(2.2);
  if (open > 0.3) w += shadowOld(V3.nx, GROUND_OLD - 10, 24 * V3.nsc) + placeOld(NB, V3.nx, GROUND_OLD - 14, V3.nsc, ng);
  // vendedor
  const vo = { expr: 'smile', armB: -4, bendB: 8, legF: 0, legB: 0, bob: breathe(T), bb: 0 };
  if (u < KN) {
    const knock = Math.max(0, Math.sin(2 * PI * u / 0.2));
    Object.assign(vo, { armF: 78, bendF: 42 - 30 * knock, expr: 'talk' });
  } else if (u < GIVE) {
    const e = easeOut((u - SHOW) / 0.15);
    Object.assign(vo, { armF: lerp(20, 58, e), bendF: lerp(10, 58, e), expr: u > SHOW ? 'talk' : 'smile' });
    if (u > SHOW) vo.holdF = holdScrew(2.4);
  } else if (u < CAP) {
    Object.assign(vo, { armF: 52, bendF: 18, expr: 'happy' });
    if (u > COINS + 0.18) vo.holdF = holdCoins(3);
  } else {
    const e = easeOut((u - CAP) / 0.14);
    Object.assign(vo, { armF: lerp(52, 165, e), bendF: lerp(18, 20, e), capOff: e > 0.6, expr: 'happy', head: -4 * e, bob: breathe(T) - 2 * e });
    if (e > 0.6) vo.holdF = holdCap(VENDOR);
  }
  w += shadowOld(V3.x, GROUND_OLD + 4, 26 * V3.sc) + placeOld(VENDOR, V3.x, GROUND_OLD, V3.sc, vo);
  // marcas del golpe en la puerta
  if (u < KN && Math.sin(2 * PI * u / 0.2) > 0.4) w += `<path d="M615 880 l40 -30 M625 925 l52 0 M615 970 l40 30" stroke="${O.ink}" stroke-width="${f(SW)}" stroke-linecap="round"/>`;
  // tornillo que pasa al vecino y monedas que pasan al vendedor
  const vH = oldPt(V3.x, GROUND_OLD, V3.sc, ...oldHandPt(OL.shF, 58, 58), false);
  const nH = oldPt(V3.nx, GROUND_OLD - 14, V3.nsc, ...oldHandPt(OL.shF, 62, 30), true);
  if (u > GIVE && u < GIVE + 0.16) {
    const e = easeInOut((u - GIVE) / 0.16), p = arcPath(vH, nH, 120)(e);
    w += at(p[0], p[1] - 30, V3.sc, screwL(v => f(v * SW / (3 * V3.sc)), 0, 0, 2.4, -20 + 200 * e));
  }
  if (u > COINS && u < COINS + 0.2) {
    const vC = oldPt(V3.x, GROUND_OLD, V3.sc, ...oldHandPt(OL.shF, 52, 18), false);
    for (let i = 0; i < 3; i++) { const e = easeInOut(clamp((u - COINS - i * 0.03) / 0.15)), p = arcPath(nH, vC, 160)(e); w += oldCoin(p[0], p[1] - 20, 16, u * 30 + i); }
  }
  if (u > SHOW && u < GIVE) w += glintOld(vH[0] + 24, vH[1] - 80, 30, pop(u, SHOW + 0.05, 0.25) * (1 + 0.2 * Math.sin(u * 15)));
  if (u > COINS + 0.18 && u < CAP) w += onoOld('¡clinc!', vH[0] - 20, vH[1] - 200, pop(u, COINS + 0.18, 0.2), -8, 80);
  const cx = [540, 560, 520][shot];
  let s = cam(zoomIn(u, 0, 1.14, 0.18) * [1, 1.03, 1.0][shot], cx, 950, w);
  // ¡toc, toc! (letras de cómic) y ¡Tornillos! en la primera puerta
  const kt = pop(u, 0.04, 0.25) * (1 - easeOut((u - SHOW) / 0.1));
  s += onoOld('¡toc, toc!', 720, 640, kt, -8 + 3 * Math.sin(u * 20), 118);
  if (shot === 0) {
    const kb = pop(u, 0.5, 0.35) * (1 - easeOut((u - 1.25) / 0.1));
    const hd = oldPt(V3.x, GROUND_OLD, V3.sc, 101, 28, false);
    s += bubbleOld(400, 450, kb, '¡Tornillos!', hd[0] - 400 + 10, hd[1] - 450 - 40, 92);
  }
  return oldFilm(s, T);
};

/* ---------- 4) Salto de época: contador 1945 -> 2026; destello y paso a colores vivos ---------- */
const YEARS4 = [[1945, 0], [1960, 0.42], [1990, 0.84], [2010, 1.26], [2026, 1.98]];
S[4] = (t, T, sc) => {
  const FL = (sc && sc.flash) || 1.8;
  const old = t < FL;
  const tt = old ? q15(t) : t, TT = T - t + tt;
  let idx = 0;
  YEARS4.forEach(([, t0], i) => { if (tt >= t0) idx = i; });
  const [year, t0] = YEARS4[idx];
  const k = pop(tt, t0, 0.32);
  let s;
  if (old) {
    s = paperBg();
    s += filmLeader(540, 860, 360, (tt * 900) % 360);
    s += bigOld(String(year), 540, 870, 300, 0.7 + 0.3 * k, lerp(-8, 0, k), { sd: 10, maxW: 640 });
    s += speedLinesV(tt);
    s = oldFilm(cam(bump(tt, YEARS4.slice(1, 4).map(y => y[1]), 0.05), 540, 860, s), TT);
  } else {
    const u = t - FL;
    s = `<rect width="${W}" height="${H}" fill="${C.sky}"/>` + rays(540, 860, 18, t * 14, C.skyL);
    s += whiteClouds(T, [{ x0: 40, y: 360, s: 0.8, v: 30 }, { x0: 700, y: 1250, s: 0.9, v: 40 }, { x0: 1200, y: 600, s: 0.7, v: 22 }]);
    const slam = idx === 4;
    if (slam && tt < t0 + 0.35) s += impactLines(540, 860, t, 34, 520);
    s += burst(540, 860, 360 * (0.85 + 0.15 * k), t * 10, slam ? C.yel : C.pink);
    s += big(String(year), 540, 875, 300, 0.75 + 0.25 * k, lerp(-10, -3, k), { fill: '#FFFFFF', maxW: 640 });
    if (slam) [[210, 520, 40, 0.1], [880, 560, 34, 0.18], [220, 1220, 30, 0.26], [870, 1190, 38, 0.34]].forEach(([x, y, r, d], i) => { s += sparkle(x, y, r, pop(t, t0 + d, 0.35) * (1 + 0.2 * Math.sin(t * 14 + i))); });
    s = cam(bump(t, [t0], 0.06) * (u < 0.2 ? lerp(1.15, 1, easeOut(u / 0.2)) : 1), 540, 860, s, slam && tt < t0 + 0.3 ? 6 * Math.sin(t * 90) : 0);
    // destello blanco
    if (u < 0.28) s += `<rect width="${W}" height="${H}" fill="#FFFFFF" opacity="${f(1 - easeOut(u / 0.28))}"/>`;
  }
  return s;
};
// líneas de velocidad (sepia) mientras corren los años
function speedLinesV(t) {
  let s = '';
  for (let i = 0; i < 10; i++) {
    const y = ((hash(i * 3.3) * 1400 + t * 2600) % 1400) + 200, x = i < 5 ? 80 + i * 18 : 1000 - (i - 5) * 18;
    s += `<line x1="${x}" y1="${f(y)}" x2="${x}" y2="${f(y + 120)}" stroke="${O.brown}" stroke-width="5" stroke-linecap="round" opacity="0.6"/>`;
  }
  return s;
}

/* ---------- 5) 2026 · Calle moderna; «2026», «Ya no hace falta ir puerta a puerta»; móvil flotando con ondas ---------- */
const SHOPS5 = [{ facade: C.cream, item: 'dress' }, { facade: C.pink, item: 'bread' }, { facade: C.navy, item: 'flowers' }, { facade: C.cream, item: 'gift' }];
S[5] = (t, T) => {
  let w = day(T, { band: 1000, sx: 930, sy: 300, sr: 54 });
  for (let i = -1; i < 3; i++) w += shop(i * 460 + 60, 1330, 420, 520, Object.assign({ sign: 'TIENDA' }, SHOPS5[(i + 1) % 4]));
  w += ground(1330, 0, { sp: 230 });
  // móvil flotando con ondas
  const kp = pop(t, 0.7, 0.55), fy = 10 * Math.sin(t * 2.6);
  if (kp > 0.01) {
    w += vibeRings(540, 1070 + fy, t, 230, 3);
    const X = 385, Y = 800, PW = 310, PH = 540;
    const ph = portalPhone(X, Y, PW, PH, (sx, sy, sw_) => {
      let g = '';
      CARD9.forEach((c, i) => { g += at(sx + sw_ / 2, sy + 70 + i * 110, pop(t, 1.1 + i * 0.15, 0.4), pill(0, 0, sw_ - 50, 80, c.col, c.label, { size: 44 })); });
      return g;
    }, { hh: 120 });
    w += at(540, 1070 + fy, kp, `<g transform="translate(-540 -1070)">${ph}</g>`, lerp(-12, -4, kp) + 2 * Math.sin(t * 2));
    // ondas tipo señal a los lados
    for (let j = 0; j < 3; j++) {
      const a = 0.4 + 0.6 * ((Math.sin(t * 6 - j) + 1) / 2);
      w += `<path d="M${f(330 - j * 40)} ${f(980 + fy)} q-36 90 0 180 M${f(750 + j * 40)} ${f(980 + fy)} q36 90 0 180" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.1)}" stroke-linecap="round" opacity="${f(a * kp)}"/>`;
    }
    if (t > 1.0) { w += sparkle(270, 860, 28, pop(t, 1.0, 0.35) * (1 + 0.2 * Math.sin(t * 15))); w += sparkle(820, 1300, 24, pop(t, 1.1, 0.35)); }
  }
  let s = cam(zoomIn(t, 0, 1.16, 0.22) * bump(t, [0.15], 0.04), 540, 900, w);
  const k1 = pop(t, 0.1, 0.5);
  s += big('2026', 540, 330, 260, k1, lerp(-10, -3, k1), { fill: C.yel, sd: 12, sw: SW * 2.6 });
  const k2 = pop(t, 0.45, 0.5), k3 = pop(t, 0.62, 0.5);
  s += big('Ya no hace falta', 540, 540, 108, k2, lerp(7, 2, k2));
  s += big('ir puerta a puerta', 540, 665, 108, k3, lerp(-6, -2, k3));
  return s;
};

/* ---------- 6) Interior de la tienda: Mari Carmen publica; salen «Novedad», «Oferta» y «Evento»; «Publicar» -> tic verde ---------- */
const MC6 = { x: 300, y: 1560, sc: 6.6 };
const SLOT6 = [[790, 420], [790, 650], [790, 880]], FLY6 = [1.45, 1.95, 2.45], CARD6K = 0.9;
const BTN6 = { x: 790, y: 1090, w: 440, h: 116 }, PRESS6 = 3.75;
S[6] = (t, T) => {
  let w = dotWall();
  w += shopSign9(300, 320, 420, 128, 'TIENDA');
  w += at(110, 560, 1, clockFace(62, 10 * 60 + 5 + T * 0.5));
  w += lamp(560, 190, 1.2 * Math.sin(T * 1.6));
  // Mari Carmen: bolsillo -> saca el móvil -> teclea -> satisfecha
  const toPocket = easeInOut(clamp((t - 0.1) / 0.35)), up = easeOut(clamp((t - 0.5) / 0.35)), upB = easeOut(clamp((t - 0.7) / 0.3));
  const armF = t < 0.5 ? lerp(-4, 24, toPocket) : lerp(24, -55, up);
  const armB = lerp(-2, -80, upB);
  const both = t >= 1.0 || upB >= 0.95, typing = t > 1.0 && t < PRESS6;
  const done = t >= PRESS6 + 0.1;
  const expr = done ? 'proud' : (t < 0.95 ? 'happy' : 'focus');
  const lookDown = done ? lerp(1, 0.2, easeOut((t - PRESS6 - 0.1) / 0.3)) : easeOut(clamp((t - 0.6) / 0.4));
  const fh = mcHand(MCF, armF), bh = mcHand(MCB, armB);
  const holdPhone = t > 0.5 && !both;
  w += placeMC(MC6.x, MC6.y, MC6.sc, Object.assign(MCB_(T), {
    expr, look: done ? [0.8, -0.4] : [0.8 * lookDown, 1.6 * lookDown], head: done ? -4 : 7 * lookDown,
    armF, armB,
    handF: holdPhone ? (w2 => mcPhoneSmall(w2, 205.5, 134, -10 - 50 * up, 'app') + mHand(w2)) : (both ? null : (w2 => mHand(w2))),
    handB: both ? null : (w2 => mHand(w2, 175.5, 143, C.skinS)),
    front: both ? (w2 => phone9(w2, t * 3.2, typing, fh[0], fh[1], bh[0] + 2, bh[1] + 2, done ? 'ok' : 'app')) : null,
    pocketItem: t < 0.5 ? (w2 => `<rect x="189" y="125" width="8" height="8" rx="1.5" fill="${INK}"/>`) : null
  }));
  // mostrador en primer plano
  w += `<rect x="-20" y="1236" width="${W + 40}" height="${H}" fill="${C.wood}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  w += `<rect x="-20" y="1214" width="${W + 40}" height="36" rx="10" fill="#C98A4B" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  for (let x = 60; x < W; x += 150) w += `<rect x="${x}" y="1252" width="44" height="${H}" fill="${C.woodS}" opacity="0.5"/>`;
  const [px, py] = mcPt(MC6.x, MC6.y, MC6.sc, (fh[0] + bh[0]) / 2, (fh[1] + bh[1]) / 2 - 10);
  if (typing && t < 1.45) for (let i = 0; i < 3; i++) { const tt = (t * 3.2 + i / 3) % 1; w += sparkle(px + (i - 1) * 100, py - 120 - tt * 80, 16 + 6 * (1 - tt), 1 - tt * 0.6); }
  let s = cam(zoomIn(t, 0, 1.14, 0.22) * bump(t, [PRESS6], 0.03), 540, 900, w);
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
    s += card9(i, cx, cy + fl, k, lerp(-25 + i * 10, [-3, 2, -2][i], e), t, { done: t > PRESS6 + 0.15 + i * 0.1 ? pop(t, PRESS6 + 0.15 + i * 0.1, 0.35) : 0 });
  });
  // botón «Publicar» -> tic verde «Publicado»
  const kb = pop(t, 3.0, 0.45), pressed = t >= PRESS6;
  const sq = t >= PRESS6 - 0.05 && t < PRESS6 + 0.1 ? 0.92 : 1 + (pressed ? 0.06 * Math.max(0, damp(t - PRESS6 - 0.1, 16, 6)) : 0);
  if (kb > 0.01) {
    let b = `<rect x="${-BTN6.w / 2 + 9}" y="${-BTN6.h / 2 + 9}" width="${BTN6.w}" height="${BTN6.h}" rx="${BTN6.h / 2}" fill="${INK}"/>`;
    b += `<rect x="${-BTN6.w / 2}" y="${-BTN6.h / 2}" width="${BTN6.w}" height="${BTN6.h}" rx="${BTN6.h / 2}" fill="${pressed ? C.green : C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
    if (!pressed) b += text('Publicar', 0, 4, { size: 70, sw: SW * 1.8, sd: 5 });
    else { b += checkCircle(-128, 0, 44, pop(t, PRESS6 + 0.05, 0.4)); b += text('Publicado', 44, 4, { size: fit('Publicado', 64, 270), sw: SW * 1.8, sd: 5 }); }
    s += at(BTN6.x, BTN6.y, kb * sq, b);
  }
  if (t > PRESS6 && t < PRESS6 + 0.6) {
    const v = (t - PRESS6) / 0.6;
    for (let j = 0; j < 2; j++) { const u = clamp(v - j * 0.25); if (u > 0) s += `<circle cx="${BTN6.x + 110}" cy="${BTN6.y}" r="${f(30 + u * 190)}" fill="none" stroke="${INK}" stroke-width="${f(SW * (1.2 - u))}"/>`; }
  }
  if (t > PRESS6 + 0.1) [[560, 1020, 30, 0.1], [1020, 1180, 28, 0.18], [120, 760, 30, 0.26], [560, 300, 26, 0.34]].forEach(([x, y, r, d], i) => { s += sparkle(x, y, r, pop(t, PRESS6 + d, 0.35) * (1 + 0.2 * Math.sin(t * 14 + i))); });
  // dedo que pulsa
  const fin = easeOut(clamp((t - 3.2) / 0.45)), out = easeInOut(clamp((t - PRESS6 - 0.3) / 0.4));
  const fx = lerp(1350, BTN6.x + 110, fin) + out * 900, fy = lerp(1300, BTN6.y + 10, fin) + (t > PRESS6 - 0.05 && t < PRESS6 + 0.1 ? 8 : 0);
  if (t > 3.2 && fx < 1340) s += finger(fx, fy, -14);
  return s;
};

/* ---------- 7) Calle llena de gente: vibran los móviles y ven Novedad, Oferta y Evento ---------- */
const CROWD7 = [
  { i: 3, x: 95, foot: 1250, sc: 2.6 }, { i: 6, x: 275, foot: 1250, sc: 2.6 }, { i: 0, x: 455, foot: 1250, sc: 2.6 },
  { i: 9, x: 635, foot: 1250, sc: 2.6 }, { i: 7, x: 815, foot: 1250, sc: 2.6 }, { i: 8, x: 990, foot: 1250, sc: 2.6 },
  { i: 1, x: 170, foot: 1392, sc: 3.1 }, { i: F_ROSA, x: 415, foot: 1392, sc: 3.0 }, { i: 4, x: 665, foot: 1392, sc: 3.1 }, { i: F_CUADROS, x: 905, foot: 1392, sc: 3.05 }
];
const FACADES7 = [C.cream, C.pink, C.navy, C.cream];
const VIB7 = 0.7, UP7 = 1.3;
S[7] = (t, T) => {
  let w = day(T, { sx: 940, sy: 560, sr: 50, band: 880, clouds: [{ x0: 80, y: 560, s: 0.7, v: 14 }, { x0: 560, y: 700, s: 0.8, v: 24 }, { x0: 980, y: 600, s: 0.6, v: 9 }, { x0: 1350, y: 760, s: 0.75, v: 18 }, { x0: 1700, y: 520, s: 0.6, v: 12 }] });
  for (let i = -1; i < 3; i++) w += shop(i * 460 + 60, 1170, 420, 560, { facade: FACADES7[(i + 1) % 4], sign: 'TIENDA', item: 'gift' });
  w += ground(1170, 160, { sp: 220 });
  CROWD7.forEach((c, n) => {
    const flip = c.x > 540, dir = flip ? -1 : 1, walking = t < VIB7;
    const wp = walking ? walkPose(2 * PI * t / 0.8 + n * 1.3, 0.75) : { legF: 0, legB: 0, armB: 0, bob: 0 };
    const x = c.x + dir * 36 * (Math.min(t, VIB7) - VIB7);
    const lt = t - VIB7, vib = lt > 0 && lt < 0.6, up = easeOut((t - UP7) / 0.25);
    const shake = vib ? 1.4 * Math.sin(t * 90 + n) : 0;
    const armF = lerp(-22, -58, up) + (vib ? 4 * Math.sin(t * 70 + n) : 0) + (walking ? 6 * Math.sin(2 * PI * t / 0.8 + n) : 0);
    const expr = up > 0.4 ? (n % 3 === 1 ? 'smile' : 'sparkle') : (vib ? 'surprise' : 'happy');
    const o = { flip, expr, look: up > 0.4 ? [1, 1.6] : [0.4, 0], head: lerp(0, 13, up), armF, armB: wp.armB, legF: wp.legF, legB: wp.legB,
      bob: (wp.bob || 0) + (up > 0 ? -3 * Math.max(0, damp(t - UP7, 14, 5)) : 0), shake, lit: t > VIB7, rot: lerp(-12, -6, up), card: n % 3 };
    delete wp.pony;
    const r = streetPerson9(c.i, x, c.foot, c.sc, o);
    w += r.svg;
    if (vib) {
      w += vibeRings(r.phone[0], r.phone[1], t, 30);
      if (Math.floor(t * 14) % 2) w += `<path d="M${f(r.phone[0] - 62)} ${f(r.phone[1] - 22)} l-14 -14 M${f(r.phone[0] + 62)} ${f(r.phone[1] - 22)} l14 -14" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round"/>`;
    }
    if (up > 0.4) w += sparkle(r.head[0] + (flip ? -1 : 1) * 70, r.head[1] - 40, 20, pop(t, UP7 + 0.3, 0.35) * (1 + 0.2 * Math.sin(t * 16 + n)));
  });
  let s = cam(zoomIn(t, 0, 1.12, 0.22) * bump(t, [VIB7, UP7 + 0.4], 0.035), 540, 1000, w);
  // abanico con las tres tarjetas
  [[230, 700, -8], [540, 672, 0], [850, 700, 8]].forEach(([x, y, r], i) => {
    const k = pop(t, UP7 + 0.3 + i * 0.12, 0.5);
    s += card9(i, x, y + 6 * Math.sin(t * 2.4 + i), k * 0.62, lerp(r * 2.5, r, k), t);
  });
  const k1 = pop(t, 0.2, 0.5), k2 = pop(t, 0.4, 0.5);
  s += big('A la mano de', 540, 270, 130, k1, lerp(-8, -3, k1));
  s += big('tus futuros clientes', 540, 410, 118, k2, lerp(7, 2, k2), { fill: C.yel });
  return s;
};

/* ---------- 8) ¿Eres comercio? Comenta ALTA y te enviamos la solicitud; tarjeta final roja con el logo ---------- */
const BIRDS8 = [{ t0: 0.2, d: 4.0, dir: 1, y: 1010, a: 36 }, { t0: 1.4, d: 4.4, dir: -1, y: 1340, a: 30 }, { t0: 2.6, d: 3.6, dir: 1, y: 960, a: 32 }];
S[8] = (t, T, sc) => {
  const cut = (sc && sc.cut) || 6;
  if (t < cut) {
    let s = day(T, { band: 1180, sx: 150, sy: 1000, sr: 52, clouds: [
      { x0: 60, y: 240, s: 0.75, v: 16 }, { x0: 700, y: 1390, s: 0.85, v: 24 }, { x0: 300, y: 1470, s: 0.6, v: 11 },
      { x0: 1250, y: 1030, s: 0.9, v: 19 }, { x0: 1650, y: 430, s: 0.7, v: 14 }] });
    BIRDS8.forEach((b, i) => {
      const u = (t - b.t0) / b.d;
      if (u < 0 || u > 1) return;
      const x = b.dir > 0 ? lerp(-90, W + 90, u) : lerp(W + 90, -90, u);
      s += bird(x, Math.min(1370, b.y + Math.sin(u * 7 + i) * 14), b.a, 0.35 + 0.65 * Math.sin(t * 2 * PI / 0.34 + i * 2));
    });
    const k1 = pop(t, 0.15, 0.5);
    s += big('¿Eres comercio?', 540, 330, 150, k1, lerp(-8, -3, k1));
    const ks = pop(t, 0.6, 0.6);
    let st = `<rect x="-640" y="-90" width="1280" height="180" transform="translate(0 14)" fill="${INK}"/><rect x="-640" y="-90" width="1280" height="180" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
    st += text('Comenta', -120, 2, { size: 100, sw: SW * 2, sd: 6 });
    st += at(250, 0, 1 + 0.05 * Math.sin(Math.max(0, t - 1.2) * 2 * PI / 1.1), `<rect x="-150" y="-66" width="300" height="132" rx="24" transform="translate(9 9)" fill="${INK}"/><rect x="-150" y="-66" width="300" height="132" rx="24" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW)}"/>` + text('ALTA', 0, 6, { size: 110, font: 'G', fill: C.red, sw: SW * 2, sd: 6, ls: 4 }), 4);
    s += `<g transform="translate(${f(540 + (1 - ks) * -1500)} 560) rotate(-3)">${st}</g>`;
    const k3 = pop(t, 1.1, 0.5);
    s += big('y te enviamos la solicitud', 540, 760, 92, k3, lerp(6, 2, k3));
    const k4 = pop(t, 1.4, 0.5);
    s += at(540, 875, k4, text('escaparatetudela.es', 0, 0, { size: 60, fill: INK, stroke: null }));
    const ke = pop(t, 1.7, 0.55), open = easeOut((t - 2.4) / 0.4);
    s += envelope(540, 1150 + 8 * Math.sin(t * 3), 400, ke, open, lerp(-14, -4, ke) + 2 * Math.sin(t * 2.4));
    if (t > 2.5) { s += sparkle(290, 1060, 30, pop(t, 2.5, 0.4) * (1 + 0.2 * Math.sin(t * 15))); s += sparkle(800, 1010, 24, pop(t, 2.6, 0.4)); }
    return cam(zoomIn(t, 0, 1.1, 0.2), 540, 850, s);
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
  // parte antigua: 15 fps efectivos (cada fotograma se repite 2 veces)
  if (sc.old) { const tq = q15(t); T = T - t + tq; t = tq; }
  document.getElementById('dyn').innerHTML = S[sceneId](t, T, sc);
};
