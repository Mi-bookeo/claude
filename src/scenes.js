/* Vídeo 06 — «Mari Carmen y los bolsos». Escenas sobre lib.js + series.js + rosa.js + v04.js + v05.js + v06.js.
   Todo se calcula a partir de (t local de la escena, T global). Franja de subtítulos (y > 1400) y margen
   superior (y < 192) libres de textos y elementos importantes. Cortes secos entre escenas. */
'use strict';

const S = {};
const big = (str, x, y, size, k, rot = 0, o = {}) => at(x, y, k, text(str, 0, 0, Object.assign({ size: fit(str, size, o.maxW || 980, o.font || 'B'), sw: SW * 2.3, sd: 9 }, o)), rot);
const bump = (t, times, a = 0.03) => 1 + times.reduce((m, t0) => m + (t >= t0 ? a * Math.max(0, damp(t - t0, 14, 6)) : 0), 0);
// cielo de mañana luminosa: dos bandas (#BFE3F2 / #E4F4FA), sol con rayos y 5 nubes que van a la izquierda
const morning = (T, o = {}) => skyClear(T, Object.assign({ band: 860, tm: 720, sx: 905, sy: 300, sr: 60 }, o));
const MCB_ = T => ({ bob: breath(T), blink: blinkAt(T) });       // respiración (2 px / 1,6 s) y parpadeo (cada 3 s)
const GROUND = 1330;
const DET1 = { x: 190, base: GROUND, w: 700, h: 880 };

/* ---------- 1) Fachada de DETALLE, calle tranquila; «DETALLE · Complementos» ---------- */
S[1] = (t, T) => {
  let w = morning(T, { sx: 150, sy: 540, sr: 54 });
  w += shop(-330, GROUND, 470, 700, SHOPS4[1]) + shop(940, GROUND, 470, 700, SHOPS4[2]);
  w += detalleShop(DET1.x, DET1.base, DET1.w, DET1.h, { t: T, bell: 4 * Math.sin(T * 2) * 0.3 });
  w += ground(GROUND, 0, { sp: 230 });
  // un pájaro lejano para dar vida a la calle tranquila
  const u = (t - 0.4) / 3.4;
  if (u > 0 && u < 1) w += bird(lerp(-80, W + 80, u), 560 + Math.sin(u * 8) * 12, 26, 0.35 + 0.65 * Math.sin(t * 2 * PI / 0.34));
  let s = cam(zoomIn(t, 0, 1.14, 0.24) * lerp(1, 1.04, easeInOut(t / 4)), 540, 900, w);
  const k1 = pop(t, 0.35, 0.55), k2 = pop(t, 0.6, 0.55);
  s += big('DETALLE ·', 540, 270, 150, k1, lerp(-9, -3, k1), { font: 'G', ls: 4 });
  s += big('Complementos', 540, 400, 120, k2, lerp(8, 2, k2), { fill: C.yel });
  return s;
};

/* ---------- 2) Zoom al escaparate: los 4 bolsos y la mano que pega el cartel «%» ---------- */
const WIN2 = { x: 70, y: 420, w: 940, h: 880 };
const PCT2 = { x: 770, y: 640, r: 135, stick: 2.05 };
S[2] = (t, T) => {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}"`;
  // fachada de cerca: pared crema, toldo con festón arriba, escaparate grande
  let w = `<rect width="${W}" height="${H}" fill="${C.cream}"/>`;
  w += `<rect x="${W - 110}" y="0" width="110" height="${H}" fill="${INK}" opacity="0.12"/>`;
  w += awning(-60, W + 60, -90, W + 90, 0, 230, 8);
  const ks = [0, 1, 2, 3].map(i => pop(t, 0.35 + i * 0.22, 0.5));
  w += glassWindow(WIN2.x, WIN2.y, WIN2.w, WIN2.h, (X, Y, Wd, Hd) => bagDisplay(X, Y, Wd, Hd, ks, T));
  w += `<rect x="${WIN2.x - 26}" y="${WIN2.y + WIN2.h}" width="${WIN2.w + 52}" height="40" rx="8" fill="#FFFFFF" ${st()}/>`;
  w += `<rect x="-20" y="${WIN2.y + WIN2.h + 40}" width="${W + 40}" height="${H}" fill="${C.cream}" ${st()}/>`;
  w += ground(1500, 0, { sp: 230 });
  // destellos de los bolsos al aparecer
  ks.forEach((k, i) => {
    const t0 = 0.35 + i * 0.22;
    if (t > t0 && t < t0 + 0.6) w += sparkle(WIN2.x + WIN2.w * PL_X[i] + 70, WIN2.y + WIN2.h * (1 - PL_H[i]) - 230, 26, pop(t, t0 + 0.05, 0.3) * (1 - easeOut((t - t0 - 0.4) / 0.2)));
  });
  // la mano entra por la derecha con el cartel y lo pega en el cristal
  const P = PCT2, ts = P.stick;
  let hx, sk = 1, hand = true;
  if (t < ts) hx = lerp(W + 520, P.x, easeOut(clamp((t - 1.3) / (ts - 1.3))));
  else { hx = P.x + lerp(0, 1300, easeInOut(clamp((t - ts - 0.45) / 0.45))); hand = t < ts + 0.95; }
  const press = t >= ts ? 1 + 0.12 * Math.max(0, damp(t - ts, 20, 7)) : 1;
  const sx = t < ts ? hx : P.x, rot = t < ts ? lerp(14, -8, easeOut(clamp((t - 1.3) / (ts - 1.3)))) : -8 + 5 * damp(t - ts, 16, 5);
  if (t > 1.3) {
    if (t >= ts) {
      w += flashBurst(P.x, P.y, 230, pop(t, ts, 0.3) * (1 - easeOut((t - ts - 0.5) / 0.25)), t * 30);
      if (t < ts + 0.7) w += impactLinesSmall(P.x, P.y, t);
    }
    w += `<g transform="translate(${f(sx)} ${f(P.y)}) scale(${f(press)} ${f(2 - press)}) translate(${f(-sx)} ${f(-P.y)})">` + pctSign(sx, P.y, P.r, 1, rot) + `</g>`;
    if (hand) w += stickHand(hx + (t >= ts && t < ts + 0.12 ? -10 : 0), P.y, P.r);
  }
  let s = cam(zoomIn(t, 0, 1.35, 0.3) * bump(t, [ts], 0.04), 540, 860, w);
  if (t < 0.3) s += speedLinesRadial(540, 860, 1 - t / 0.3);
  // «¡clac!»
  const kc = pop(t, ts + 0.02, 0.4);
  s += at(P.x - 250, P.y - 200, kc, text('¡clac!', 0, 0, { size: 140, font: 'G', fill: C.yel, sw: SW * 2.2, sd: 8, ls: 2 }), -14 + 3 * Math.sin(t * 16));
  if (t > ts + 0.15) {
    s += sparkle(P.x + 190, P.y - 160, 34, pop(t, ts + 0.15, 0.35) * (1 + 0.2 * Math.sin(t * 15)));
    s += sparkle(P.x - 120, P.y + 190, 26, pop(t, ts + 0.25, 0.35) * (1 + 0.2 * Math.sin(t * 13 + 1)));
  }
  return s;
};
function impactLinesSmall(cx, cy, t) {
  let s = '';
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * 2 * PI + 0.25, r1 = 190 + 15 * Math.sin(t * 40 + i), r2 = r1 + 70 + 20 * (i % 2);
    s += `<line x1="${f(cx + Math.cos(a) * r1)}" y1="${f(cy + Math.sin(a) * r1)}" x2="${f(cx + Math.cos(a) * r2)}" y2="${f(cy + Math.sin(a) * r2)}" stroke="${INK}" stroke-width="${f(SW * 1.3)}" stroke-linecap="round"/>`;
  }
  return s;
}

/* ---------- 3) Interior vacío: Mari Carmen expectante tras el mostrador, golpetea con los dedos ---------- */
const MC3 = { x: 620, y: DI.counter + 64 * 5.2, sc: 5.2 };
S[3] = (t, T) => {
  let w = detalleBack(T, { tm: 10 * 60 + 2 + t * 4, bell: 0 });
  // Mari Carmen mira hacia la puerta (izquierda)
  const ph = t * 14;
  const lookDoor = 0.6 + 0.4 * easeInOut(t / 0.8);
  w += placeMC(MC3.x, MC3.y, MC3.sc, Object.assign(MCB_(T), {
    flip: true, expr: 'expect', look: [1.2 * lookDoor, -0.2], head: -3 + 1.5 * Math.sin(t * 1.4),
    armF: -24, armB: -10, handF: tapHand(ph), handB: w2 => mHand(w2, 175.5, 143, C.skinS)
  }));
  w += shopCounter();
  w += register(950, DI.counter);
  // marcas de golpeteo junto a los dedos
  const [fx, fy] = mcPt(MC3.x, MC3.y, MC3.sc, ...mcHand(MCF, -24), true);
  if (Math.sin(ph) > 0.2) w += `<path d="M${f(fx - 70)} ${f(fy - 50)} l-22 -22 M${f(fx - 40)} ${f(fy - 66)} l-6 -30 M${f(fx - 92)} ${f(fy - 18)} l-30 -6" stroke="${INK}" stroke-width="${f(SW)}" stroke-linecap="round"/>`;
  let s = cam(zoomIn(t, 0, 1.14, 0.22), 540, 950, w);
  const k = pop(t, 0.4, 0.55);
  s += big('Y ahora… a esperar', 540, 255, 96, k, lerp(-8, -3, k));
  return s;
};

/* ---------- 4) Saca el móvil del bolsillo y teclea con los dos pulgares; sale el logo ---------- */
const MC4 = { x: 400, y: 1560, sc: 7.2 };
function phone4(w, ph, typing, fx, fy, bx, by) {
  // móvil sujeto con las dos manos; pulgares que teclean alternando
  const cx = (fx + bx) / 2, cy = (fy + by) / 2 - 7, rot = -14;
  let g = `<g transform="rotate(${rot} ${f(cx)} ${f(cy)})">`;
  g += `<rect x="${f(cx - 9)}" y="${f(cy - 15)}" width="18" height="30" rx="3.4" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/>`;
  g += `<rect x="${f(cx - 7)}" y="${f(cy - 12.6)}" width="14" height="25" rx="1.8" fill="#FFFFFF"/><rect x="${f(cx - 7)}" y="${f(cy - 12.6)}" width="14" height="5" fill="${C.red}"/>`;
  g += `<rect x="${f(cx - 5.4)}" y="${f(cy - 5.6)}" width="10.8" height="7.6" rx="1.2" fill="#FDE3EC" stroke="${INK}" stroke-width="${w(0.7)}"/>`;
  const n = typing ? Math.floor(ph * 2) % 5 + 1 : 0;
  for (let i = 0; i < 3; i++) g += `<rect x="${f(cx - 5.4)}" y="${f(cy + 3.6 + i * 2.6)}" width="${f(i === 2 ? Math.min(10.8, n * 1.6) : 10.8)}" height="1.4" rx="0.7" fill="${INK}" opacity="0.5"/>`;
  g += `</g>`;
  const tf = typing ? Math.max(0, Math.sin(ph * PI)) : 0, tb = typing ? Math.max(0, -Math.sin(ph * PI)) : 0;
  g += `<circle cx="${f(bx)}" cy="${f(by)}" r="4.2" fill="${C.skinS}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
  g += `<rect x="${f(bx + 1)}" y="${f(by - 6 + tb * 1.6)}" width="6" height="3.4" rx="1.7" transform="rotate(-20 ${f(bx)} ${f(by)})" fill="${C.skinS}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
  g += `<circle cx="${f(fx)}" cy="${f(fy)}" r="4.2" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
  g += `<rect x="${f(fx - 7)}" y="${f(fy - 6.6 + tf * 1.6)}" width="6" height="3.4" rx="1.7" transform="rotate(20 ${f(fx)} ${f(fy)})" fill="${C.skin}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
  return g;
}
function closeBack(T, o = {}) {
  let s = dotWall();
  s += at(140, 330, 1, clockFace(78, 10 * 60 + 5 + T * 0.5));
  s += woodShelf(760, 1100, 1010);
  s += bag(830, 1010, 0.85, 3) + bag(960, 1010, 0.95, 2) + bag(1065, 1010, 0.75, 1);
  if (o.lamp !== false) s += lamp(900, 190, 1.2 * Math.sin(T * 1.6));
  return s;
}
S[4] = (t, T) => {
  let w = closeBack(T, { lamp: false });
  // poses: brazo al bolsillo (0,15-0,55), saca el móvil (0,55-1,0), sube la otra mano (0,8-1,15), teclea (1,15-)
  const toPocket = easeInOut(clamp((t - 0.15) / 0.4)), up = easeOut(clamp((t - 0.6) / 0.4)), upB = easeOut(clamp((t - 0.8) / 0.35));
  const armF = t < 0.6 ? lerp(-4, 24, toPocket) : lerp(24, -55, up);
  const armB = lerp(-2, -80, upB);
  const typing = t > 1.15;
  const expr = t < 1.05 ? 'happy' : 'focus';
  const lookDown = easeOut(clamp((t - 0.7) / 0.4));
  const fh = mcHand(MCF, armF), bh = mcHand(MCB, armB);
  const holdPhone = t > 0.55 && t < 1.15 && upB < 0.95;
  w += placeMC(MC4.x, MC4.y, MC4.sc, Object.assign(MCB_(T), {
    expr, look: [0.8 * lookDown, 1.6 * lookDown], head: 7 * lookDown,
    armF, armB, noPocket: false,
    handF: holdPhone ? (w2 => mcPhoneSmall(w2, 205.5, 134, -10 - 50 * up, 'app') + mHand(w2)) : (t >= 1.15 || upB >= 0.95 ? null : (w2 => mHand(w2))),
    handB: (t >= 1.15 || upB >= 0.95) ? null : (w2 => mHand(w2, 175.5, 143, C.skinS)),
    front: (t >= 1.15 || upB >= 0.95) ? (w2 => phone4(w2, t * 3.2, typing, fh[0], fh[1], bh[0] + 2, bh[1] + 2)) : null,
    pocketItem: t < 0.55 ? (w2 => `<rect x="189" y="125" width="8" height="8" rx="1.5" fill="${INK}"/>`) : null
  }));
  // mostrador en primer plano
  w += `<rect x="-20" y="1236" width="${W + 40}" height="${H}" fill="${C.wood}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  w += `<rect x="-20" y="1214" width="${W + 40}" height="36" rx="10" fill="#C98A4B" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  for (let x = 60; x < W; x += 150) w += `<rect x="${x}" y="1252" width="44" height="${H}" fill="${C.woodS}" opacity="0.5"/>`;
  // estrellitas de tecleo
  const [px, py] = mcPt(MC4.x, MC4.y, MC4.sc, (fh[0] + bh[0]) / 2, (fh[1] + bh[1]) / 2 - 12);
  if (typing) for (let i = 0; i < 3; i++) {
    const tt = (t * 3.2 + i / 3) % 1;
    w += sparkle(px + (i - 1) * 110, py - 130 - tt * 90, 18 + 6 * (1 - tt), 1 - tt * 0.6);
  }
  let s = cam(zoomIn(t, 0, 1.14, 0.22), 540, 900, w);
  // el logo sale del móvil y sube hasta arriba a la derecha
  const kl = pop(t, 1.5, 0.6), rise = easeOut(clamp((t - 1.5) / 0.5));
  if (t > 1.5) {
    const lx = lerp(px, 790, rise), ly = lerp(py, 560, rise), bob = 6 * Math.sin((t - 1.5) * 3);
    s += `<path d="M${f(px - 50)} ${f(py - 60)} L${f(lx - 150)} ${f(ly + 120)} L${f(lx + 150)} ${f(ly + 120)} L${f(px + 50)} ${f(py - 60)}Z" fill="#FFFFFF" opacity="${f(0.6 * kl)}"/>`;
    s += at(lx, ly + bob, kl * lerp(0.3, 1, rise), `<rect x="-200" y="-200" width="400" height="400" rx="60" transform="translate(12 12)" fill="${INK}"/><rect x="-200" y="-200" width="400" height="400" rx="60" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>`, lerp(-14, 3, kl) + 2 * Math.sin(t * 2));
    s += logoBadge(lx, ly + bob, 350, lerp(-14, 3, kl) + 2 * Math.sin(t * 2), kl * lerp(0.3, 1, rise), 'logoR');
    s += sparkle(lx - 250, ly - 160, 30, pop(t, 1.9, 0.4) * (1 + 0.2 * Math.sin(t * 15)));
    s += sparkle(lx + 230, ly + 220, 24, pop(t, 2.0, 0.4) * (1 + 0.2 * Math.sin(t * 13 + 1)));
  }
  return s;
};

/* ---------- 5) Primer plano del móvil: tarjeta, «Publicar» -> tic verde «Publicada»; Mari Carmen satisfecha ---------- */
const PH5 = { X: 170, Y: 220, PW: 740, PH: 1170 };
const BTN5 = { x: 540, y: 1250, w: 560, h: 130 }, PRESS5 = 2.05;
S[5] = (t, T, sc) => {
  const swap = (sc && sc.swap) || 3.4;
  if (t < swap) {
    let w = `<rect width="${W}" height="${H}" fill="#FBE0DC"/>` + rays(540, 820, 18, t * 6, C.cream);
    const kc = pop(t, 0.2, 0.55);
    w += portalPhone(PH5.X, PH5.Y, PH5.PW, PH5.PH, (sx, sy, sw_) => {
      let g = '';
      const cx = sx + 28, cw = sw_ - 56, cy = sy + 28;
      if (kc > 0.01) g += `<g transform="translate(540 ${f(cy + 320)}) scale(${f(kc)}) translate(-540 ${f(-(cy + 320))})">` + offerCard(cx, cy, cw, 650, { kSeal: pop(t, 0.7, 0.5), kBtn: pop(t, 0.95, 0.45) }, t) + `</g>`;
      // botón «Publicar» -> «Publicada»
      const kb = pop(t, 1.15, 0.45), done = t >= PRESS5;
      const sq = t >= PRESS5 - 0.05 && t < PRESS5 + 0.1 ? 0.92 : 1 + (done ? 0.06 * Math.max(0, damp(t - PRESS5 - 0.1, 16, 6)) : 0);
      if (kb > 0.01) {
        let b = `<rect x="${-BTN5.w / 2 + 9}" y="${-BTN5.h / 2 + 9}" width="${BTN5.w}" height="${BTN5.h}" rx="${BTN5.h / 2}" fill="${INK}"/>`;
        b += `<rect x="${-BTN5.w / 2}" y="${-BTN5.h / 2}" width="${BTN5.w}" height="${BTN5.h}" rx="${BTN5.h / 2}" fill="${done ? C.green : C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
        if (!done) b += text('Publicar', 0, 4, { size: 74, sw: SW * 1.8, sd: 5 });
        else {
          b += checkCircle(-150, 0, 50, pop(t, PRESS5 + 0.05, 0.4));
          b += text('Publicada', 50, 4, { size: 70, sw: SW * 1.8, sd: 5 });
        }
        g += at(BTN5.x, BTN5.y, kb * sq, b);
      }
      return g;
    }, { hh: 170 });
    // ondas del toque y destellos
    if (t > PRESS5 && t < PRESS5 + 0.6) {
      const v = (t - PRESS5) / 0.6;
      for (let j = 0; j < 2; j++) { const u = clamp(v - j * 0.25); if (u > 0) w += `<circle cx="${BTN5.x + 120}" cy="${BTN5.y}" r="${f(30 + u * 200)}" fill="none" stroke="${INK}" stroke-width="${f(SW * (1.2 - u))}"/>`; }
    }
    if (t > PRESS5 + 0.1) {
      [[200, 1130, 36, 0.1], [900, 1110, 30, 0.18], [130, 520, 28, 0.26], [960, 470, 32, 0.34]].forEach(([x, y, r, d], i) => {
        w += sparkle(x, y, r, pop(t, PRESS5 + d, 0.35) * (1 + 0.2 * Math.sin(t * 14 + i)));
      });
    }
    // dedo que pulsa
    const fin = easeOut(clamp((t - 1.5) / 0.5)), out = easeInOut(clamp((t - PRESS5 - 0.35) / 0.4));
    const fx = lerp(1350, BTN5.x + 120, fin) + out * 900, fy = lerp(1320, BTN5.y + 10, fin) + (t > PRESS5 - 0.05 && t < PRESS5 + 0.1 ? 8 : 0);
    if (t > 1.5 && fx < 1340) w += finger(fx, fy, -14);
    return cam(zoomIn(t, 0, 1.18, 0.24) * bump(t, [PRESS5], 0.03), 540, 820, w);
  }
  // vuelve a Mari Carmen, satisfecha, con el móvil (pantalla con el tic verde)
  const u = t - swap;
  let w = closeBack(T);
  const armF = -34 + 3 * Math.sin(u * 3);
  w += placeMC(MC4.x + 40, MC4.y, MC4.sc, Object.assign(MCB_(T), {
    expr: 'proud', look: [0.4, -0.2], head: -5, armF, armB: 4,
    handF: w2 => mcPhoneSmall(w2, 206, 133, -16, 'ok') + mHand(w2)
  }));
  w += `<rect x="-20" y="1236" width="${W + 40}" height="${H}" fill="${C.wood}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  w += `<rect x="-20" y="1214" width="${W + 40}" height="36" rx="10" fill="#C98A4B" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  for (let x = 60; x < W; x += 150) w += `<rect x="${x}" y="1252" width="44" height="${H}" fill="${C.woodS}" opacity="0.5"/>`;
  const [hx, hy] = mcPt(MC4.x + 40, MC4.y, MC4.sc, 196, 64);
  w += sparkle(hx + 230, hy - 80, 36, pop(u, 0.15, 0.4) * (1 + 0.2 * Math.sin(u * 14)));
  w += sparkle(hx - 210, hy - 130, 28, pop(u, 0.25, 0.4) * (1 + 0.2 * Math.sin(u * 12 + 1)));
  w += sparkle(hx + 300, hy + 140, 22, pop(u, 0.35, 0.4) * (1 + 0.2 * Math.sin(u * 16 + 2)));
  return cam(zoomIn(u, 0, 1.12, 0.2), 540, 900, w);
};

/* ---------- 6) Calle llena de gente: vibran todos a la vez, sacan el móvil y ven el bolso rosa ---------- */
const CROWD6 = [
  { i: 3, x: 95, foot: 1285, sc: 2.75 }, { i: 6, x: 275, foot: 1285, sc: 2.75 }, { i: 0, x: 455, foot: 1285, sc: 2.75 },
  { i: 9, x: 635, foot: 1285, sc: 2.75 }, { i: 7, x: 815, foot: 1285, sc: 2.75 }, { i: 8, x: 990, foot: 1285, sc: 2.75 },
  { i: 1, x: 170, foot: 1478, sc: 3.45 }, { i: F_ROSA, x: 415, foot: 1478, sc: 3.3 }, { i: 4, x: 665, foot: 1478, sc: 3.45 }, { i: F_CUADROS, x: 905, foot: 1478, sc: 3.4 }
];
const VIB6 = 0.55, UP6 = 1.15;
S[6] = (t, T) => {
  let w = morning(T, { sx: 940, sy: 250, sr: 52, band: 820 });
  w += street(160, { w: 420, h: 620, g: 40, base: 1180 });
  w += ground(1180, 160, { sp: 220 });
  CROWD6.forEach((c, n) => {
    const flip = c.x > 540, dir = flip ? -1 : 1;
    const walking = t < VIB6;
    const wp = walking ? walkPose(2 * PI * t / 0.8 + n * 1.3, 0.75) : { legF: 0, legB: 0, armB: 0, bob: 0 };
    const x = c.x + dir * 36 * (Math.min(t, VIB6) - VIB6);
    const lt = t - VIB6, vib = lt > 0 && lt < 0.6, up = easeOut((t - UP6) / 0.25);
    const shake = vib ? 1.4 * Math.sin(t * 90 + n) : 0;
    const armF = lerp(-22, -58, up) + (vib ? 4 * Math.sin(t * 70 + n) : 0) + (walking ? 6 * Math.sin(2 * PI * t / 0.8 + n) : 0);
    const expr = up > 0.4 ? (n % 3 === 1 ? 'smile' : 'sparkle') : (vib ? 'surprise' : 'happy');
    const o = { flip, expr, look: up > 0.4 ? [1, 1.6] : [0.4, 0], head: lerp(0, 13, up), armF, armB: wp.armB, legF: wp.legF, legB: wp.legB,
      bob: (wp.bob || 0) + (up > 0 ? -3 * Math.max(0, damp(t - UP6, 14, 5)) : 0), shake, lit: t > VIB6, rot: lerp(-12, -6, up) };
    const r = streetPerson(c.i, x, c.foot, c.sc, o);
    w += r.svg;
    if (vib) {
      w += vibeRings(r.phone[0], r.phone[1], t, 30);
      if (Math.floor(t * 14) % 2) w += `<path d="M${f(r.phone[0] - 62)} ${f(r.phone[1] - 22)} l-14 -14 M${f(r.phone[0] + 62)} ${f(r.phone[1] - 22)} l14 -14" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round"/>`;
    }
    if (up > 0.4) w += sparkle(r.head[0] + (flip ? -1 : 1) * 70, r.head[1] - 40, 20, pop(t, UP6 + 0.3, 0.35) * (1 + 0.2 * Math.sin(t * 16 + n)));
  });
  let s = cam(zoomIn(t, 0, 1.12, 0.22) * bump(t, [VIB6, UP6 + 0.4], 0.035), 540, 1000, w);
  // la tarjeta del bolso rosa, en grande, sobre la gente
  const kc = pop(t, UP6 + 0.35, 0.55);
  s += at(540, 650 + 6 * Math.sin(t * 2.4), kc * 0.95, offerMiniLocal(t), lerp(-8, -2, kc));
  const k = pop(t, 0.25, 0.5);
  s += big('Directo a su móvil', 540, 300, 140, k, lerp(-8, -3, k));
  return s;
};

/* ---------- 7) Entra una clienta (campanilla), saluda; Mari Carmen le hace señas, «¡cha-ching!» y pulgar arriba ---------- */
const MC7 = { x: 620, y: DI.counter + 64 * 5.2, sc: 5.2 };
const CL7 = { foot: 1462, sc: 4.7, x0: 150, x1: 290 }, OPEN7 = 0.25, CHING7 = 3.0;
S[7] = (t, T) => {
  const open = easeOut(clamp((t - OPEN7) / 0.35)) * (1 - easeInOut(clamp((t - 2.0) / 0.5)));
  const bell = t > OPEN7 ? 28 * damp(t - OPEN7, 18, 2.2) : 0;
  let w = detalleBack(T, { open, bell, tm: 10 * 60 + 25 });
  // Mari Carmen: sonríe, hace señas (1,0-2,4) y luego pulgar arriba (3,15-)
  let armF = -18, handF = w2 => mHand(w2), expr = 'happy';
  if (t > 0.9 && t < 2.5) { armF = -112 + 10 * Math.sin((t - 0.9) * 9); handF = beckonHand((t - 0.9) * 9); expr = 'smile'; }
  else if (t >= 2.5 && t < 3.15) { armF = lerp(-112, -18, easeInOut((t - 2.5) / 0.3)); expr = 'smile'; }
  else if (t >= 3.15) { armF = lerp(-18, -128, easeOut((t - 3.15) / 0.25)); handF = thumbUp; expr = 'proud'; }
  const lookC = t < 0.4 ? [1, 0] : [1.2, 0.3];
  w += placeMC(MC7.x, MC7.y, MC7.sc, Object.assign(MCB_(T), { flip: true, expr, look: lookC, head: -2, armF, armB: -10, handF,
    bob: breath(T) - (t >= 3.15 ? 4 * Math.max(0, damp(t - 3.15, 14, 5)) : 0) }));
  w += shopCounter();
  // caja registradora: se abre con el «cha-ching»
  const drawer = t > CHING7 ? easeOut((t - CHING7) / 0.2) * (1 - easeInOut((t - CHING7 - 1.2) / 0.4)) : 0;
  w += register(950, DI.counter, drawer, true);
  if (t > CHING7 && t < CHING7 + 1.4) for (let i = 0; i < 4; i++) {
    const u = (t - CHING7 - i * 0.08) / 0.9;
    if (u <= 0 || u >= 1) continue;
    const cx = 900 + (i - 1.5) * 70 + u * (i - 1.5) * 90, cy = DI.counter - 90 - 420 * u + 600 * u * u;
    w += coin(cx, cy, 30, t * 12 + i);
  }
  // clienta: entra por la puerta, se para y saluda
  const walkU = clamp((t - 0.45) / 1.1), walking = walkU > 0 && walkU < 1;
  const cx = lerp(CL7.x0, CL7.x1, easeInOut(walkU));
  const wp = walking ? walkPose(2 * PI * (t - 0.45) / 0.7, 0.8) : { legF: 0, legB: 0, armF: 0, armB: 0, bob: 0 };
  let cArm = wp.armF, cHand = null;
  if (t > 1.55 && t < 2.9) { cArm = -150 + 4 * Math.sin((t - 1.55) * 10); cHand = waveHand((t - 1.55) * 12); }
  if (t > 0.3) {
    const cl = placeFolk(F_CLIENTA, cx, CL7.foot, CL7.sc, { expr: t > 1.55 ? 'smile' : 'happy', look: [0.6, -0.2], armF: cArm, armB: wp.armB, legF: wp.legF, legB: wp.legB, bob: wp.bob, handF: cHand, head: -3 });
    w += shadowEll(cx + 10, CL7.foot, 26 * CL7.sc) + cl;
  }
  if (t > OPEN7 && t < OPEN7 + 0.9) { // ondas de la campanilla
    const bx = DI.door.x + DI.door.w - 30, by = DI.door.y + 40;
    for (let i = 0; i < 2; i++) w += `<path d="M${bx + 50 + i * 26} ${by - 30} q18 30 0 60" fill="none" stroke="${INK}" stroke-width="${f(SW * (1 - (t - OPEN7) / 0.9))}" stroke-linecap="round"/>`;
    w += at(bx + 120, by - 70, pop(t, OPEN7 + 0.05, 0.35) * (1 - easeOut((t - OPEN7 - 0.7) / 0.2)), text('¡din!', 0, 0, { size: 70, font: 'G', fill: C.yel, sw: SW * 1.6, sd: 5 }), 10);
  }
  const kc = pop(t, CHING7, 0.4) * (1 - easeOut((t - CHING7 - 1.6) / 0.25));
  w += chaChing(870, 545, kc * 0.8, t);
  if (t > 3.2) {
    const [tx, ty] = mcPt(MC7.x, MC7.y, MC7.sc, ...mcHand(MCF, -128), true);
    w += sparkle(tx - 70, ty - 110, 28, pop(t, 3.35, 0.35) * (1 + 0.2 * Math.sin(t * 15)));
    w += sparkle(tx + 60, ty - 160, 20, pop(t, 3.45, 0.35) * (1 + 0.2 * Math.sin(t * 13 + 1)));
  }
  return cam(zoomIn(t, 0, 1.14, 0.22) * bump(t, [CHING7, 3.2], 0.03), 540, 950, w);
};

/* ---------- 8) Móvil grande en el cielo con la web de Escaparate (carrusel) y una mano ---------- */
const PH8 = { X: 320, Y: 600, PW: 440, PH: 790 };
function hand8(X, Y, PW, PH) {
  const st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  const by = Y + PH - 150;
  const back = `<path d="M180 2000 L250 ${by + 260} Q300 ${by + 120} ${X + 60} ${by + 60} L${X + PW * 0.75} ${by + 30} Q${X + PW + 40} ${by + 120} ${X + PW * 0.9} ${by + 260} L${X + PW * 0.75} 2000 Z" fill="${C.skin}" ${st}/>
    <path d="M100 2000 L170 ${by + 330} Q260 ${by + 290} 360 ${by + 330} L400 2000Z" fill="${C.blue}" ${st}/>
    <path d="M170 ${by + 330} Q260 ${by + 290} 360 ${by + 330} L366 ${by + 380} Q260 ${by + 340} 176 ${by + 380}Z" fill="${C.blueS}" ${st}/>`;
  const front = `<path d="M${X - 30} ${by + 190} Q${X - 40} ${by + 40} ${X + 20} ${by - 30} Q${X + 50} ${by - 54} ${X + 64} ${by - 20} Q${X + 40} ${by + 60} ${X + 46} ${by + 190}Z" fill="${C.skin}" ${st}/>
    <path d="M${X + PW - 18} ${by - 120} q52 -4 52 30 q0 32 -52 32 Z M${X + PW - 18} ${by - 40} q48 -2 48 30 q0 30 -48 30 Z M${X + PW - 18} ${by + 36} q42 -2 42 28 q0 28 -42 28 Z" fill="${C.skin}" ${st}/>`;
  return { back, front };
}
S[8] = (t, T) => {
  let w = morning(T, { band: 1000, sx: 930, sy: 640, sr: 50, clouds: [
    { x0: 40, y: 720, s: 0.7, v: 14 }, { x0: 760, y: 1050, s: 0.8, v: 22 }, { x0: 1250, y: 860, s: 0.85, v: 17 }, { x0: 1650, y: 1250, s: 0.6, v: 10 }, { x0: 480, y: 1300, s: 0.55, v: 8 }] });
  const hd = hand8(PH8.X, PH8.Y, PH8.PW, PH8.PH);
  const kp = pop(t, 0.05, 0.5), rise = lerp(160, 0, easeOut(t / 0.45));
  let ph = hd.back;
  ph += portalPhone(PH8.X, PH8.Y, PH8.PW, PH8.PH, (sx, sy, sw_, sh_) => {
    let g = '';
    // pestañas «Ofertas» y «Novedades»
    const sel = Math.floor(clamp((t - 0.7) / 0.8) * 4) % 2;
    g += pill(sx + 110, sy + 52, 170, 58, sel ? '#FFFFFF' : C.red, 'Ofertas', { size: 32, col: sel ? INK : '#FFFFFF', swk: 0.7 });
    g += pill(sx + 296, sy + 52, 186, 58, sel ? C.red : '#FFFFFF', 'Novedades', { size: 32, col: sel ? '#FFFFFF' : INK, swk: 0.7 });
    // carrusel: pasa una tarjeta cada 0,8 s con un pequeño rebote
    const step = 314, cx0 = sx + sw_ / 2;
    let pos = 0;
    for (let i = 0; i < 4; i++) { const t0 = 0.7 + i * 0.8; if (t > t0) pos += Math.min(1, easeOut((t - t0) / 0.35)) + (t - t0 < 0.6 ? 0.04 * damp(t - t0 - 0.35, 12, 6) * (t - t0 > 0.35 ? 1 : 0) : 0); }
    for (let j = -1; j < 7; j++) {
      const x = cx0 + (j - pos) * step;
      if (x < sx - 200 || x > sx + sw_ + 200) continue;
      g += webCard(x, sy + 110, WEBC[((j % 4) + 4) % 4], t);
    }
    // indicador de puntos
    for (let i = 0; i < 4; i++) {
      const on = (Math.round(pos) % 4) === i;
      g += `<circle cx="${f(cx0 + (i - 1.5) * 34)}" cy="${f(sy + 560)}" r="${on ? 11 : 8}" fill="${on ? C.red : '#FFFFFF'}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
    }
    return g;
  }, { hh: 150 });
  ph += hd.front;
  w += `<g transform="translate(0 ${f(rise)})">` + at(540, PH8.Y + PH8.PH / 2, kp, `<g transform="translate(-540 ${-(PH8.Y + PH8.PH / 2)})">${ph}</g>`, lerp(-6, 0, kp) + 0.8 * Math.sin(t * 1.8)) + `</g>`;
  w += sparkle(170, 900, 32, pop(t, 0.6, 0.4) * (1 + 0.2 * Math.sin(t * 15)));
  w += sparkle(920, 1120, 26, pop(t, 0.7, 0.4) * (1 + 0.2 * Math.sin(t * 13 + 1)));
  let s = cam(zoomIn(t, 0, 1.12, 0.22), 540, 900, w);
  const k1 = pop(t, 0.15, 0.5), k2 = pop(t, 0.32, 0.5), k3 = pop(t, 0.5, 0.5);
  s += big('Ofertas y novedades', 540, 255, 110, k1, lerp(-7, -2, k1));
  s += big('en la mano de tus', 540, 375, 110, k2, lerp(6, 2, k2));
  s += big('futuros clientes', 540, 500, 122, k3, lerp(-6, -2, k3), { fill: C.yel });
  return s;
};

/* ---------- 9) ¿Tienes un negocio? Escríbenos + sobre con el correo; tarjeta final ---------- */
const BIRDS9 = [{ t0: 0.2, d: 4.0, dir: 1, y: 470, a: 36 }, { t0: 1.4, d: 4.4, dir: -1, y: 1360, a: 30 }, { t0: 2.6, d: 3.6, dir: 1, y: 690, a: 32 }];
S[9] = (t, T, sc) => {
  const cut = (sc && sc.cut) || 6;
  if (t < cut) {
    let s = morning(T, { band: 1180, sx: 150, sy: 770, sr: 52, clouds: [
      { x0: 60, y: 260, s: 0.75, v: 16 }, { x0: 700, y: 1060, s: 0.85, v: 24 }, { x0: 300, y: 1370, s: 0.6, v: 11 },
      { x0: 1250, y: 560, s: 0.9, v: 19 }, { x0: 1650, y: 1240, s: 0.7, v: 14 }, { x0: 1100, y: 820, s: 0.55, v: 9 }] });
    BIRDS9.forEach((b, i) => {
      const u = (t - b.t0) / b.d;
      if (u < 0 || u > 1) return;
      const x = b.dir > 0 ? lerp(-90, W + 90, u) : lerp(W + 90, -90, u);
      s += bird(x, Math.min(1380, b.y + Math.sin(u * 7 + i) * 14), b.a, 0.35 + 0.65 * Math.sin(t * 2 * PI / 0.34 + i * 2));
    });
    const k1 = pop(t, 0.15, 0.5);
    s += big('¿Tienes un negocio?', 540, 330, 135, k1, lerp(-8, -3, k1));
    // franja roja
    const ks = pop(t, 0.6, 0.6);
    let st = `<rect x="-640" y="-90" width="1280" height="180" transform="translate(0 14)" fill="${INK}"/><rect x="-640" y="-90" width="1280" height="180" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
    st += text('Escríbenos y te informamos', 0, 2, { size: fit('Escríbenos y te informamos', 96, 960), sw: SW * 2, sd: 6 });
    s += `<g transform="translate(${f(540 + (1 - ks) * -1500)} 560) rotate(-3)">${st}</g>`;
    // sobre con el correo
    const ke = pop(t, 1.1, 0.55), open = easeOut((t - 1.8) / 0.4);
    s += envelope(540, 850 + 8 * Math.sin(t * 3), 440, ke, open, lerp(-14, -4, ke) + 2 * Math.sin(t * 2.4));
    if (t > 1.9) { s += sparkle(300, 760, 30, pop(t, 1.9, 0.4) * (1 + 0.2 * Math.sin(t * 15))); s += sparkle(790, 720, 24, pop(t, 2.0, 0.4)); }
    const k4 = pop(t, 1.5, 0.5), mail = 'info@escaparatetudela.es', ms = fit(mail, 74, 880);
    const pulse = t > 2.4 ? 1 + 0.025 * Math.sin((t - 2.4) * 2 * PI / 1.1) : 1;
    s += at(540, 1130, k4 * pulse, `<rect x="-480" y="-70" width="960" height="140" rx="70" transform="translate(12 12)" fill="${INK}"/><rect x="-480" y="-70" width="960" height="140" rx="70" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>` +
      text(mail, 0, 2, { size: ms, fill: C.red, sw: SW * 1.6, sd: 4 }));
    const k5 = pop(t, 1.9, 0.5);
    s += at(540, 1290, k5, text('escaparatetudela.es', 0, 0, { size: 62, fill: INK, stroke: null }));
    return cam(zoomIn(t, 0, 1.1, 0.2), 540, 850, s);
  }
  // tarjeta final: fondo rojo, logo blanco (con «Escaparate de Tudela») y la web
  const u = t - cut;
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 700, 16, t * 8, C.dred);
  const kl = pop(u, 0, 0.45), bob = 6 * Math.sin(u * 3);
  s += logoBadge(540, 700 + bob, 820, lerp(-10, 0, kl), kl, 'logoW');
  const url = 'escaparatetudela.es', us = fit(url, 78, 720);
  s += at(540, 1230, pop(u, 0.25, 0.45), `<rect x="-400" y="-58" width="800" height="116" rx="58" transform="translate(10 10)" fill="${INK}"/><rect x="-400" y="-58" width="800" height="116" rx="58" fill="${C.dred}" stroke="${INK}" stroke-width="${f(SW)}"/>` + text(url, 0, 2, { size: us, sw: SW * 1.8, sd: 5 }));
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
