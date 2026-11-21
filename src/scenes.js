/* Vídeo 05 — «Pedro y el plan de viernes». Escenas sobre lib.js + series.js + rosa.js + v04.js + v05.js.
   Todo se calcula a partir de (t local de la escena, T global). Franja de subtítulos (y > 1400) libre de textos. */
'use strict';

const S = {};
const big = (str, x, y, size, k, rot = 0, o = {}) => at(x, y, k, text(str, 0, 0, Object.assign({ size: fit(str, size, o.maxW || 980, o.font || 'B'), sw: SW * 2.3, sd: 9 }, o)), rot);
const bump = (t, times, a = 0.03) => 1 + times.reduce((m, t0) => m + (t >= t0 ? a * Math.max(0, damp(t - t0, 14, 6)) : 0), 0);
const GROUND = 1330, FEET = 1392, PSC = 4.25;      // calle: línea del suelo, pies de Pedro, escala de Pedro
const STREET = { w: 440, g: 46, base: GROUND, h: 560 };
// signo «?» gris que aparece con rebote y flota
function qmark(x, y, k, rot, size = 150) {
  return at(x, y, k, text('?', 0, 0, { size, font: 'G', fill: P5.gray, sw: SW * 2, sd: 7 }), rot);
}

/* ---------- 1) Sale de la oficina, viernes 17:55 ---------- */
S[1] = (t, T) => {
  let w = sunsetSky(T, { band: 860, sx: 600, sy: 610, sr: 60 });
  w += shop(600, GROUND, 470, 560, SHOP_TYPES[0]);
  const open = easeOut((t - 0.05) / 0.35);
  const of = office(-30, GROUND, 600, 900, open);
  w += of.svg;
  w += ground(GROUND, 0, { sp: 230 });
  w += poleClock(935, FEET + 6, 930, 74, 17 * 60 + 55, pop(t, 0.5, 0.5), 6 * damp(t - 0.5, 10, 3));
  // Pedro sale por la puerta: da un paso hacia la cámara y camina cansado hacia la derecha
  const u = easeInOut(clamp((t - 0.15) / 2.85));
  const px = lerp(of.door.x + of.door.w * 0.5, 620, u);
  const step = easeOut(clamp((t - 0.1) / 0.7));
  const sc = lerp(3.85, PSC, step), py = lerp(GROUND + 10, FEET, step);
  w += shadowEll(px + 10, py + 4, 100 * sc / PSC);
  w += placePedro(px, py, sc, tiredWalk(t));
  let s = cam(zoomIn(t, 0, 1.14, 0.25), 540, 900, w);
  const k1 = pop(t, 0.3, 0.55), k2 = pop(t, 0.5, 0.55);
  s += big('Viernes,', 540, 285, 160, k1, lerp(-9, -3, k1));
  s += big('17:55', 540, 440, 175, k2, lerp(8, 2, k2), { fill: C.yel, font: 'G' });
  return s;
};

/* ---------- 2) Camina cansado, sin plan ---------- */
S[2] = (t, T) => {
  let w = sunsetSky(T, { band: 860, sx: 880, sy: 640 });
  const off = 400 + t * 95;
  w += street(off, STREET);
  w += ground(GROUND, off, { sp: 230 });
  const px = 470;
  w += shadowEll(px + 10, FEET + 4, 100);
  w += placePedro(px, FEET, PSC, Object.assign(tiredWalk(t), { look: [0, 0.6] }));
  // signos «?» grises y nube vacía sobre la cabeza
  const [hx, hy] = pedroPt(px, FEET, PSC, 190, 62);
  [[0.55, -150, -120, -14], [0.9, 30, -210, 10], [1.25, 165, -110, -6]].forEach(([t0, dx, dy, rot], i) => {
    const k = pop(t, t0, 0.5), fl = t > t0 ? -14 * (t - t0) + 6 * Math.sin((t - t0) * 4 + i) : 0;
    w += qmark(hx + dx, hy + dy + fl, k, rot + 6 * Math.sin(t * 3 + i), i === 1 ? 170 : 135);
  });
  const kc = pop(t, 1.6, 0.55);
  w += thinkDot(hx + 120, hy - 40, 14, pop(t, 1.45, 0.4)) + thinkDot(hx + 165, hy - 95, 20, pop(t, 1.52, 0.4));
  w += thinkCloud(hx + 285, hy - 210 + 6 * Math.sin(t * 2.5), 240, 170, kc);
  let s = cam(zoomIn(t, 0, 1.12, 0.22), 540, 900, w);
  const k1 = pop(t, 0.25, 0.55);
  s += big('Sin ningún plan', 540, 330, 150, k1, lerp(-8, -3, k1));
  return s;
};

/* ---------- 3) El móvil vibra y llega la notificación ---------- */
S[3] = (t, T) => {
  let w = sunsetSky(T, { band: 1000, sx: 170, sy: 720, sr: 80 });
  w += shop(-260, 1540, 700, 900, SHOP_TYPES[1]) + shop(560, 1540, 700, 900, SHOP_TYPES[2]);
  w += ground(1540, 0, { sp: 300 });
  const px = 360, py = 1960, sc = 6.6;
  const vib = t > 0.25 && t < 1.5 ? 1 : 0;
  const shake = vib * 2.2 * Math.sin(t * 70);
  const lookDown = easeOut((t - 0.3) / 0.25) * (1 - easeOut((t - 1.45) / 0.3));
  const armF = lerp(-35, -62, easeOut((t - 0.15) / 0.3));
  const expr = t < 0.3 ? 'tired' : (t < 1.4 ? 'surprise' : 'normal');
  w += placePedro(px, py, sc, {
    armF, armB: 4, bob: -1.5 * (0.5 - 0.5 * Math.cos(2 * PI * t / 1.6)), head: 9 * lookDown - 2, expr, look: [0.6, 0.6 * lookDown],
    blink: ((t + 0.4) % 2.6) < 0.12 && t > 1.6,
    itemF: phoneItem({ lit: t > 0.25, card: 3, shake, rot: -8 + vib * 6 * Math.sin(t * 55), ps: 1.15 })
  });
  const hp = handLocal(PF, armF), [phx, phy] = pedroPt(px, py, sc, hp[0] + 3, hp[1] - 15);
  if (vib) {
    w += vibeRings(phx, phy, t, 90, 3);
    for (let i = 0; i < 2; i++) { // marcas de vibración ((( )))
      const sgn = i ? 1 : -1, a = 0.6 + 0.4 * Math.sin(t * 30);
      w += `<path d="M${f(phx + sgn * 150)} ${f(phy - 70)} Q${f(phx + sgn * 190)} ${f(phy)} ${f(phx + sgn * 150)} ${f(phy + 70)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.4 * a)}" stroke-linecap="round"/>`;
      w += `<path d="M${f(phx + sgn * 195)} ${f(phy - 100)} Q${f(phx + sgn * 245)} ${f(phy)} ${f(phx + sgn * 195)} ${f(phy + 100)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.2 * a)}" stroke-linecap="round"/>`;
    }
  }
  let s = cam(zoomIn(t, 0, 1.14, 0.22) * bump(t, [0.3], 0.04), 540, 1100, w);
  // la tarjeta sale del móvil y sube con rebote
  const kc = pop(t, 1.25, 0.6), rise = easeOut((t - 1.25) / 0.45);
  if (t > 1.2) {
    const cy = lerp(phy, 660, rise), cx = lerp(phx, 540, rise);
    s += `<path d="M${f(phx - 40)} ${f(phy - 120)} L${f(cx - 90)} ${f(cy + 150)} L${f(cx + 40)} ${f(cy + 150)}Z" fill="#FFFFFF" opacity="${f(0.55 * kc)}"/>`;
    s += notif(cx, cy + 5 * Math.sin(t * 3), lerp(0.2, 1.1, kc), lerp(-12, -3, kc), false);
    s += sparkle(cx - 420, cy - 170, 34, pop(t, 1.55, 0.4) * (1 + 0.2 * Math.sin(t * 15)));
    s += sparkle(cx + 410, cy + 160, 28, pop(t, 1.65, 0.4) * (1 + 0.2 * Math.sin(t * 13)));
    if (t < 2.2) s += mark('!', cx + 400, cy - 210, pop(t, 1.35, 0.4) * (1 - easeOut((t - 2.0) / 0.2)), 12, 170, C.yel);
  }
  return s;
};

/* ---------- 4) Primer plano: la oferta flash; sonrisa lenta ---------- */
S[4] = (t, T) => {
  let s = `<rect width="${W}" height="${H}" fill="${P5.peach}"/>` + rays(540, 640, 18, t * 6, P5.warmCream);
  s += pinkClouds(T, [{ x0: 100, y: 1200, s: 0.8, v: 14 }, { x0: 820, y: 1080, s: 0.65, v: 22 }, { x0: 1500, y: 1250, s: 0.7, v: 10 }]);
  // Pedro de cerca, abajo a la izquierda, leyendo
  const sm = easeInOut((t - 1.1) / 1.9);
  const bob = -1.5 * (0.5 - 0.5 * Math.cos(2 * PI * t / 1.6));
  s += placePedro(250, 2400, 8.4, { armF: -18, armB: 6, bob, head: -6 - 3 * sm, expr: t > 3.3 ? 'grin' : 'normal', smile: sm, look: [0.35, -0.5], blink: (t > 0.8 && t < 0.92) });
  // la notificación grande
  const kc = pop(t, 0, 0.5);
  const z = bump(t, [0.7], 0.04);
  s += notif(540, 600 + 6 * Math.sin(t * 2.2), lerp(0.7, 1.08, kc) * z, lerp(-6, -2, kc) + Math.sin(t * 1.8) * 0.8, true);
  // sello de rayo
  const ks = pop(t, 0.7, 0.55), glow = Math.sin(t * 14) > 0.4 ? 1 : 0;
  s += flashSeal(905, 955, 132, ks * (1 + 0.04 * Math.sin(t * 9)), lerp(40, 12, ks) + 3 * Math.sin(t * 3), glow);
  if (t > 0.9) {
    s += sparkle(130, 300, 30, pop(t, 0.9, 0.4) * (1 + 0.2 * Math.sin(t * 15)));
    s += sparkle(980, 1100, 26, pop(t, 1.0, 0.4) * (1 + 0.2 * Math.sin(t * 13 + 1)));
  }
  // destellos de sonrisa junto a la cara
  if (t > 3.3) { s += sparkle(660, 1080, 30, pop(t, 3.3, 0.4)); s += sparkle(720, 1200, 20, pop(t, 3.4, 0.4)); }
  return cam(zoomIn(t, 0, 1.15, 0.2), 540, 700, s);
};

/* ---------- 5) Nube de pensamiento con el bar «LA TORTILLA» ---------- */
S[5] = (t, T) => {
  let w = sunsetSky(T, { band: 1150, sx: 930, sy: 1180, sr: 70 });
  w += shop(-300, 1700, 700, 900, SHOP_TYPES[3]) + shop(720, 1700, 700, 900, SHOP_TYPES[0]);
  w += ground(1700, 0, { sp: 300 });
  const px = 320, py = 2040, sc = 6.2;
  const bob = -2 * (0.5 - 0.5 * Math.cos(2 * PI * t / 1.2));
  w += placePedro(px, py, sc, { armF: -10 + 4 * Math.sin(t * 3), armB: 6, bob, head: -8, expr: 'grin', look: [0.6, -0.9] });
  const [hx, hy] = pedroPt(px, py, sc, 196, 62);
  let s = cam(zoomIn(t, 0, 1.12, 0.22), 540, 1000, w);
  // burbujas hacia la nube
  s += thinkDot(hx + 70, hy - 50, 22, pop(t, 0.1, 0.4)) + thinkDot(hx + 140, hy - 140, 32, pop(t, 0.2, 0.4)) + thinkDot(hx + 205, hy - 250, 44, pop(t, 0.3, 0.4));
  const kc = pop(t, 0.4, 0.6), fl = 8 * Math.sin(t * 2.2);
  s += thinkCloud(560, 610 + fl, 900, 720, kc);
  const kb = pop(t, 0.6, 0.6);
  s += at(560, 640 + fl, kb, barFacade(-230, 270, 460, 560), lerp(-8, 0, kb) + 1.5 * Math.sin(t * 2));
  // destellos alrededor
  [[220, 380, 34, 0.9], [905, 330, 40, 1.0], [880, 860, 28, 1.1], [240, 850, 26, 1.2], [560, 230, 30, 1.3]].forEach(([x, y, r, t0], i) => {
    s += sparkle(x, y + fl, r, pop(t, t0, 0.4) * (0.85 + 0.25 * Math.sin(t * 12 + i * 2)), i % 2 ? P5.tort : '#FFFFFF');
  });
  return s;
};

/* ---------- 6) «Ahora Pedro ya tiene plan»: pulgar arriba y anda decidido ---------- */
S[6] = (t, T) => {
  const warm = easeInOut(t / 3);
  let w = sunsetSky(T, { band: 860, sx: 880, sy: 660, warm });
  const go = 1.15; // empieza a andar
  const v = t < go ? 0 : 620 * easeOut((t - go) / 0.5);
  const off = 1200 + (t < go ? 0 : 620 * (Math.sqrt((t - go) * (t - go) + 0.04) - 0.2)); // arranque suave hasta 620 px/s
  w += street(off, STREET);
  w += ground(GROUND, off, { sp: 230 });
  const px = 480;
  let pose;
  if (t < go) {
    const kt = easeOut((t - 0.1) / 0.25);
    pose = { armF: lerp(-10, -142, kt), armB: 6, bob: -4 * Math.max(0, damp(t - 0.2, 12, 5)), head: -4, expr: 'grin', itemF: t > 0.1 ? thumbItem : null };
  } else {
    pose = decidedWalk(t - go);
  }
  w += shadowEll(px + 10, FEET + 4, 100);
  if (t > go + 0.1) w += speedLinesH(px - 150, 900, 260 * Math.min(1, v / 620), 5, 70, SW * 1.1);
  w += placePedro(px, FEET, PSC, pose);
  if (t < go + 0.3) {
    const [tx, ty] = pedroPt(px, FEET, PSC, 236, 64);
    w += sparkle(tx + 70, ty - 60, 34, pop(t, 0.35, 0.4) * (1 - easeOut((t - go - 0.1) / 0.2)));
    w += sparkle(tx + 110, ty + 40, 22, pop(t, 0.45, 0.4) * (1 - easeOut((t - go - 0.1) / 0.2)));
  }
  let s = cam(zoomIn(t, 0, 1.12, 0.22) * bump(t, [go], 0.03), 540, 900, w);
  const k1 = pop(t, 0.15, 0.55), k2 = pop(t, 0.35, 0.55);
  s += big('Ahora Pedro', 540, 290, 165, k1, lerp(-9, -3, k1));
  s += big('ya tiene plan', 540, 455, 165, k2, lerp(8, 2, k2), { fill: C.yel });
  return s;
};

/* ---------- 7) Interior del bar: charla, risas y brindis ---------- */
const BAR = { top: 1000, feet: 1575, man: [130, 4.25], ped: [400, 4.55], wom: [835, 4.45], wai: [985, 1262, 3.55], clink: 3.0 };
S[7] = (t, T) => {
  let w = barBack(T);
  // camarero tras la barra secando un vaso
  const [wx, wy, ws] = BAR.wai;
  const dry = Math.sin(t * 7);
  w += placeFolk(F_CAMARERO, wx, wy, ws, { flip: true, expr: 'happy', armF: -52, armB: -42 + 8 * dry, bob: 0, head: 4,
    handF: wk => emptyGlassItem(wk, 202.5, 139.5), handB: wk => towelItem(wk, 177.5, 139.5 + 2 * dry) });
  w += barCounter(BAR.top);
  w += stool(275, 1245, 1620) + stool(640, 1245, 1620);
  // brindis: los brazos suben hacia el centro
  const up = easeInOut((t - (BAR.clink - 0.45)) / 0.4) * (1 - easeInOut((t - (BAR.clink + 0.6)) / 0.4));
  const hit = t > BAR.clink ? Math.max(0, damp(t - BAR.clink, 18, 7)) : 0;
  const talk = (t0, t1, sp = 11) => (t > t0 && t < t1) ? 0.5 + 0.5 * Math.sin(t * sp) : 0;
  const laughP = t > 1.6 && t < 2.6;
  const laugh = laughP ? Math.abs(Math.sin(t * 16)) : 0;
  // hombre de la camisa a cuadros (izquierda)
  const [mx, ms] = BAR.man;
  const mArm = lerp(-40, -150, up) - 6 * hit;
  w += placeFolk(F_CUADROS, mx, BAR.feet, ms, { expr: talk(0.4, 1.5) > 0.5 ? 'smile' : (t > 1.6 ? 'wink' : 'happy'), armF: mArm, armB: 8, bob: -2 * laugh, head: -2,
    handF: wk => glassItem(wk, 202.5, 139.5, { skin: '#E9B88F', tilt: lerp(0, 10, up) }) });
  // Pedro (centro) con vaso y pintxo
  const [ppx, psc] = BAR.ped;
  const pArm = lerp(-52, -84, up) - 5 * hit;
  const pExpr = laughP ? 'laugh' : (t > 0.9 && t < 1.6 ? 'talk' : 'grin');
  w += placePedro(ppx, BAR.feet, psc, { armF: pArm, armB: -62 + 3 * Math.sin(t * 3), bob: -2.5 * laugh - 1.5 * (0.5 - 0.5 * Math.cos(t * 4)), head: laughP ? -7 : -1,
    expr: pExpr, talk: talk(0.9, 1.6, 13), itemF: (wk, x, y) => glassItem(wk, x, y, { tilt: lerp(0, 16, up) }), itemB: (wk, x, y) => pintxoItem(wk, x, y) });
  // mujer del jersey rosa (derecha, mira a la izquierda)
  const [ox, os] = BAR.wom;
  const oArm = lerp(-50, -96, up) - 6 * hit;
  w += placeFolk(F_ROSA, ox, BAR.feet, os, { flip: true, expr: laughP ? 'sparkle' : (talk(2.6, 3.0) > 0.5 || talk(3.6, 4.6) > 0.5 ? 'smile' : 'happy'), armF: oArm, armB: 10, bob: -2 * laugh, head: laughP ? -6 : 0,
    handF: wk => glassItem(wk, 202.5, 139.5, { tilt: lerp(0, 18, up) }) });
  // destello «¡CHIN!» entre los vasos
  const ph = handLocal(PF, pArm), [pgx, pgy] = pedroPt(ppx, BAR.feet, psc, ph[0], ph[1] - 18);
  const [ogx, ogy] = folkHand(F_ROSA, ox, BAR.feet, os, oArm, true);
  const kChin = pop(t, BAR.clink, 0.4) * (1 - easeOut((t - BAR.clink - 1.1) / 0.25));
  w += chin((pgx + ogx) / 2, Math.min(pgy, ogy - 18 * os) - 150, kChin, t);
  if (t > BAR.clink && t < BAR.clink + 1.2) {
    w += sparkle((pgx + ogx) / 2 - 150, pgy - 40, 28, pop(t, BAR.clink + 0.05, 0.35));
    w += sparkle((pgx + ogx) / 2 + 150, pgy - 10, 24, pop(t, BAR.clink + 0.1, 0.35));
  }
  // globos de diálogo
  const life = (t0, t1) => pop(t, t0, 0.45) * (1 - easeOut((t - t1) / 0.18));
  w += speech(210, 745, life(0.4, 1.5), 'dots', 'left', t);
  w += speech(470, 735, life(1.0, 2.6), 'star', 'left', t);
  w += speech(780, 745, life(1.7, 2.65), 'heart', 'right', t);
  w += speech(760, 745, life(3.7, 5.2), 'dots', 'right', t);
  w += speech(260, 740, life(3.9, 5.2), 'heart', 'left', t);
  // «ja, ja» de las risas
  if (laughP) {
    const kj = pop(t, 1.65, 0.35);
    const [jx, jy] = pedroPt(ppx, BAR.feet, psc, 214, 56);
    w += at(jx + 40, jy - 30, kj, text('¡JA, JA!', 0, 0, { size: 64, font: 'G', fill: C.yel, sw: SW * 1.6, sd: 5 }), -10 + 3 * Math.sin(t * 18));
  }
  let s = cam(zoomIn(t, 0, 1.14, 0.22) * bump(t, [BAR.clink], 0.035), 540, 1000, w);
  const k1 = pop(t, 0.3, 0.55);
  s += big('Viernes resuelto', 540, 285, 150, k1, lerp(-8, -3, k1));
  return s;
};

/* ---------- 8) Cierre: atardecer, mensaje, web y tarjeta final ---------- */
const BIRDS8 = [{ t0: 0.2, d: 4.2, dir: 1, y: 1150, a: 38 }, { t0: 1.4, d: 4.8, dir: -1, y: 760, a: 30 }, { t0: 2.6, d: 3.8, dir: 1, y: 1230, a: 34 }];
S[8] = (t, T, sc) => {
  const cut = (sc && sc.cut) || 6;
  if (t < cut) {
    let s = sunsetSky(T, { band: 1100, sx: 830, sy: 1190, sr: 82, warm: 1, clouds: [
      { x0: 40, y: 260, s: 0.7, v: 14 }, { x0: 760, y: 1080, s: 0.75, v: 22 }, { x0: 1250, y: 560, s: 0.85, v: 17 },
      { x0: 1650, y: 300, s: 0.6, v: 10 }, { x0: 500, y: 1330, s: 0.55, v: 8 }] });
    BIRDS8.forEach((b, i) => {
      const u = (t - b.t0) / b.d;
      if (u < 0 || u > 1) return;
      const x = b.dir > 0 ? lerp(-90, W + 90, u) : lerp(W + 90, -90, u);
      s += bird(x, Math.min(1360, b.y + Math.sin(u * 7 + i) * 14), b.a, 0.35 + 0.65 * Math.sin(t * 2 * PI / 0.34 + i * 2));
    });
    // calle al atardecer con el bar en el centro
    s += shop(-210, 1400, 300, 330, SHOP_TYPES[1]) + shop(790, 1400, 300, 330, SHOP_TYPES[2]);
    s += barFacade(330, 1400, 420, 360);
    s += ground(1400, 0, { sp: 230 });
    const k1 = pop(t, 0.15, 0.5), k2 = pop(t, 0.3, 0.5), k3 = pop(t, 0.45, 0.5);
    s += big('No te pierdas', 540, 330, 140, k1, lerp(-8, -3, k1));
    s += big('el mejor plan', 540, 480, 150, k2, lerp(8, 2, k2), { fill: C.yel });
    s += big('del día', 540, 630, 150, k3, lerp(-6, -2, k3), { fill: C.yel });
    const ks = pop(t, 0.8, 0.6), url = 'escaparatetudela.es';
    const pulse = t > 1.8 ? 1 + 0.03 * Math.sin((t - 1.8) * 2 * PI / 1.1) : 1;
    let st = `<rect x="-640" y="-88" width="1280" height="176" transform="translate(0 14)" fill="${INK}"/><rect x="-640" y="-88" width="1280" height="176" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
    st += at(0, 0, pulse, text(url, 0, 2, { size: fit(url, 112, 940), sw: SW * 2, sd: 6 }));
    s += `<g transform="translate(${f(540 + (1 - ks) * -1500)} 820) rotate(-3)">${st}</g>`;
    const k4 = pop(t, 1.3, 0.5);
    s += at(540, 975, k4, `<rect x="-330" y="-48" width="660" height="96" rx="48" transform="translate(9 9)" fill="${INK}"/><rect x="-330" y="-48" width="660" height="96" rx="48" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>` +
      text('Enlace en la descripción', 0, 2, { size: fit('Enlace en la descripción', 60, 600), fill: INK, stroke: null }));
    s += sparkle(120, 760, 32, pop(t, 0.9, 0.4) * (1 + 0.2 * Math.sin(t * 15)));
    s += sparkle(965, 640, 26, pop(t, 1.0, 0.4) * (1 + 0.2 * Math.sin(t * 13 + 1)));
    return cam(zoomIn(t, 0, 1.1, 0.2), 540, 800, s);
  }
  // tarjeta final: fondo rojo, logo blanco y web
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
