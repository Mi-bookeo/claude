/* Vídeo 08 — «Dos carteles». Escenas sobre lib.js + series.js + rosa.js + v04.js + v05.js + v06.js + v07.js + v08.js.
   Todo se calcula a partir de (t local de la escena, T global). Franja de subtítulos (y > 1400) y margen
   superior (y < 192) libres de textos y elementos importantes. Cortes secos entre escenas. */
'use strict';

const S = {};
const big = (str, x, y, size, k, rot = 0, o = {}) => at(x, y, k, text(str, 0, 0, Object.assign({ size: fit(str, size, o.maxW || 980, o.font || 'B'), sw: SW * 2.3, sd: 9 }, o)), rot);
const breathe = T => -1.6 * (0.5 - 0.5 * Math.cos(2 * PI * T / 1.6));
const bump = (t, times, a = 0.03) => 1 + times.reduce((m, t0) => m + (t >= t0 ? a * Math.max(0, damp(t - t0, 14, 6)) : 0), 0);
// exterior de día: cielo #BFE3F2 + banda #E4F4FA, sol con rayos y 5 nubes hacia la izquierda
const day = (T, o = {}) => skyClear(T, Object.assign({ band: 1000, tm: 720, sx: 930, sy: 300, sr: 54 }, o));
const LUC = { feet: 1395, sc: 4.0, stop: 110 };
const lucia = (x, o) => shadowEll(x, LUC.feet, 26 * LUC.sc) + place(x, LUC.feet, 190, 204, LUC.sc, Object.assign({ who: 'lucia' }, o));
const walkL = (t, amp = 1) => { const p = walkPose(2 * PI * t / 0.8, amp); delete p.pony; return p; };       // ciclo de andar 0,8 s
const runL = t => { const p = runPose(t); delete p.pony; return p; };                                            // ciclo de correr 0,4 s
const sideWalls = () => `<rect x="-40" y="600" width="150" height="900" fill="${C.pink}" ${stk()}/><rect x="-40" y="600" width="150" height="40" fill="${C.dred}" ${stk()}/>` +
  `<rect x="970" y="540" width="160" height="960" fill="${C.navy}" ${stk()}/><rect x="970" y="540" width="160" height="40" fill="${C.dred}" ${stk()}/>`;
const SHOP = { x: 120, base: 1330, w: 840, h: 950 };
const GS = tiendaGeo(SHOP.x, SHOP.base, SHOP.w, SHOP.h);

/* ---------- 1) Gancho: dos tiendas iguales con el «%»; «¿Por qué tu oferta no vende?» ---------- */
S[1] = (t, T) => {
  let w = day(T, { band: 1040, sx: 930, sy: 300 });
  [40, 560].forEach((x, i) => { w += tiendaShop(x, 1400, 480, 590, { pct: pop(t, 0.2 + i * 0.15, 0.5), page: 12, t: T }); });
  w += ground(1400, 0, { sp: 230 });
  let s = cam(zoomIn(t, 0, 1.16, 0.24) * lerp(1, 1.04, easeInOut(t / 4)), 540, 1000, w);
  const k1 = pop(t, 0.45, 0.55), k2 = pop(t, 0.7, 0.55);
  s += big('¿Por qué tu oferta', 540, 540, 132, k1, lerp(-9, -3, k1));
  s += big('no vende?', 540, 700, 190, k2, lerp(8, 2, k2), { fill: C.yel });
  return s;
};

/* ---------- 2) Pantalla partida: SIN FECHA (izquierda) / CON FECHA (derecha) ---------- */
const HALF_CLOUDS = [{ x0: 60, y: 330, s: 0.5, v: 12 }, { x0: 330, y: 470, s: 0.42, v: 18 }, { x0: 600, y: 560, s: 0.36, v: 9 }, { x0: 820, y: 390, s: 0.46, v: 14 }];
S[2] = (t, T) => {
  let s = '';
  [0, 1].forEach(side => {
    const X0 = side * 540, id = 'half' + side;
    let h = `<rect x="${X0}" y="0" width="540" height="${H}" fill="${C.sky}"/><rect x="${X0}" y="1000" width="540" height="${H}" fill="${C.skyL}"/>`;
    h += sun(X0 + (side ? 450 : 90), 500, 38, T * 12);
    HALF_CLOUDS.forEach(c => { const span = 540 + 500, x = (((c.x0 - c.v * T) % span) + span) % span - 250; h += cloud(X0 + x, c.y, c.s); });
    h += tiendaShop(X0 + 25, 1290, 490, 880, { pct: pop(t, 0.35 + side * 0.15, 0.5), pctK: 1.3, rib: side ? pop(t, 1.0, 0.55) : 0, page: 12, t: T });
    h += `<rect x="${X0}" y="1290" width="540" height="${H}" fill="${C.ground}"/><line x1="${X0}" y1="1290" x2="${X0 + 540}" y2="1290" ${stk()}/>`;
    for (let x = X0 + 60; x < X0 + 640; x += 200) h += `<line x1="${x}" y1="1290" x2="${x - 120}" y2="${H}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
    if (side && t > 1.0 && t < 1.8) { h += sparkle(X0 + 90, 930, 26, pop(t, 1.1, 0.35)); h += sparkle(X0 + 455, 870, 22, pop(t, 1.2, 0.35)); }
    const ks = pop(t, 0.6 + side * 0.55, 0.55);
    h += fechaLabel(X0 + 270, 290, ks * 0.98, side === 1, side ? 3 : -3);
    s += `<clipPath id="${id}"><rect x="${X0}" y="0" width="540" height="${H}"/></clipPath><g clip-path="url(#${id})">` + cam(zoomIn(t, side * 0.12, 1.14, 0.24), X0 + 270, 800, h) + `</g>`;
  });
  s += `<rect x="532" y="-10" width="16" height="${H + 20}" fill="${INK}"/>`;
  return s;
};

/* ---------- 3) Mitad izquierda a pantalla completa: Lucía pasa, sonríe, «Otro día…»; el calendario vuela y el cartel se apaga ---------- */
const TEAR3 = { t0: 3.3, dt: 0.11, n: 16 };
S[3] = (t, T) => {
  let w = day(T, { band: 1000, sx: 950, sy: 250, sr: 50 });
  w += sideWalls();
  const nT = t < TEAR3.t0 ? 0 : Math.min(TEAR3.n, Math.floor((t - TEAR3.t0) / TEAR3.dt) + 1);
  const curl = nT > 0 && nT < TEAR3.n ? 0 : 0;
  const pctA = 1 - 0.82 * easeInOut((t - 3.4) / 1.6);
  w += tiendaShop(SHOP.x, SHOP.base, SHOP.w, SHOP.h, { pct: 1, pctA, page: 12 + nT, curl, web: pop(t, 5.0, 0.5), t: T });
  // hojas del calendario que salen volando
  for (let n = 0; n < nT; n++) w += flyingSheet(GS.cal.x, GS.cal.y + GS.cal.w * 0.3, GS.cal.w, 12 + n, (t - TEAR3.t0 - n * TEAR3.dt) / 0.75, n % 2 ? 1 : -1);
  // polvo alrededor del cartel que se apaga
  w += dust(GS.pct.x, GS.pct.y, GS.pct.r, t, 3.6, 1.6);
  if (t > 5.0) for (let i = 0; i < 5; i++) { const u = ((t - 5.0) * 0.8 + i / 5) % 1; w += `<circle cx="${f(GS.pct.x - 120 + i * 60)}" cy="${f(GS.pct.y + 40 + u * 300)}" r="5" fill="#B8AAA6" opacity="${f(1 - u)}"/>`; }
  w += ground(SHOP.base, 0, { sp: 230 });
  // Lucía
  let lx, o;
  if (t < 1.3) { lx = lerp(-160, LUC.stop, t / 1.3); o = Object.assign(walkL(t), { expr: 'happy', look: [0.4, 0] }); }
  else if (t < 3.2) {
    lx = LUC.stop;
    const dm = damp(t - 1.3, 14, 5);
    o = { legF: -10 * dm, legB: 10 * dm, armF: 12 * dm, armB: -12 * dm, bob: breathe(T) };
    if (t < 1.75) Object.assign(o, { expr: 'curious', look: [1, -1.1], head: -8 });
    else if (t < 2.25) Object.assign(o, { expr: 'smile', look: [1, -0.9], head: -6 });
    else {
      const sh = easeOut((t - 2.25) / 0.22) * (1 - easeInOut((t - 2.95) / 0.25));
      Object.assign(o, { expr: 'meh', look: [0.6, 0], head: lerp(-4, 10, sh), armF: -38 * sh, armB: 38 * sh, bob: -6 * sh + breathe(T) });
      if (sh > 0.5) o.front = w2 => `<path d="M172 92 q-4 -6 0 -12 M208 92 q4 -6 0 -12" fill="none" stroke="${INK}" stroke-width="${w2(1.6)}" stroke-linecap="round"/>`;
    }
  } else { lx = lerp(LUC.stop, 1300, (t - 3.2) / 1.8); o = Object.assign(walkL(t), { expr: 'meh', look: [0.4, 0], head: 2 }); }
  if (lx < 1250) w += lucia(lx, o);
  if (t > 1.35 && t < 1.8) w += mark('?', lx + 150, 760, pop(t, 1.35, 0.3), 12, 130, '#FFFFFF');
  // nube «Otro día…»
  const kc = pop(t, 2.35, 0.45) * (1 - easeOut((t - 3.75) / 0.2));
  w += thought(300, 640, 450, 200, kc, 'Otro día…', lx + 40, 830, 78);
  let s = cam(zoomIn(t, 0, 1.28, 0.3) * bump(t, [TEAR3.t0], 0.025), 540, 900, w);
  if (t < 0.3) s += speedLinesRadial(540, 900, 1 - t / 0.3);
  return s;
};

/* ---------- 4) El cerebro: «Ya veré…» -> reloj de cuenta atrás -> «¡AHORA!» ---------- */
const BR4 = { x: 540, y: 1090, sc: 1.22, on: 2.0, alert: 2.35 };
S[4] = (t, T) => {
  let w = dotWall();
  const alert = t >= BR4.alert;
  let by = BR4.y, rot = 0, arms = 0, legs = 0;
  if (!alert) { by += 6 * Math.sin(t * 2.4); rot = -4 + 3 * Math.sin(t * 1.6); }
  else {
    const u = (t - BR4.alert) / 0.45;
    if (u < 1) { by -= 180 * Math.sin(PI * u); legs = 0.7 * Math.sin(PI * u); }
    arms = easeOut(u / 0.4); rot = 3 * Math.sin(t * 22) * Math.max(0, 1 - (t - BR4.alert) / 1.2);
  }
  w += `<ellipse cx="${BR4.x}" cy="${f(BR4.y + 236 * BR4.sc)}" rx="${f(220 * (alert ? lerp(0.7, 1, 1 - Math.max(0, BR4.y - by) / 180) : 1))}" ry="26" fill="${INK}" opacity="0.15"/>`;
  if (alert && t < BR4.alert + 1.3) w += impactRing(BR4.x, by - 10, 330, 300, t, 18);
  w += brainChar(BR4.x, by, BR4.sc, { mode: alert ? 'alert' : 'sleepy', t, arms, legs, rot });
  if (!alert) w += zzz(760, 760, t);
  w += thought(300, 620, 470, 230, pop(t, 0.45, 0.45) * (alert ? 0 : 1), 'Ya veré…', 420, 830, 80);
  w += countdownClock(820, 610, 100, pop(t, BR4.on, 0.4), t, t > BR4.on);
  w += shoutBurst(300, 630, pop(t, BR4.alert + 0.05, 0.4), '¡AHORA!', t, C.red, 230);
  let s = cam(zoomIn(t, 0, 1.14, 0.22) * bump(t, [BR4.on, BR4.alert], 0.05), 540, 900, w);
  const k1 = pop(t, 2.9, 0.5), k2 = pop(t, 3.1, 0.5);
  s += big('El cerebro odia', 540, 265, 128, k1, lerp(-8, -3, k1));
  s += big('perder una oportunidad', 540, 400, 112, k2, lerp(7, 2, k2), { fill: C.yel });
  return s;
};

/* ---------- 5) Mitad derecha a pantalla completa: Lucía ve «Hasta el sábado», corre, campanilla, cola y «¡cha-ching!» ---------- */
const S5 = { see: 1.0, wow: 1.25, run: 1.6, door: 2.45, inEnd: 2.95, ching: 5.0 };
const DOORX5 = GS.door.x + GS.door.w * 0.45;
const QUEUE5 = [{ i: 4, x: 700 }, { i: 1, x: 600 }, { i: 7, x: 500 }, { i: 11, x: 400 }, { i: 9, x: 300 }];
S[5] = (t, T) => {
  let w = day(T, { band: 1000, sx: 950, sy: 250, sr: 50 });
  w += sideWalls();
  const open = easeOut((t - S5.door) / 0.22) * (1 - easeInOut((t - 3.05) / 0.3));
  const bell = t > S5.door ? 30 * damp(t - S5.door, 18, 2.2) : 0;
  const drawer = t > S5.ching ? easeOut((t - S5.ching) / 0.2) : 0;
  const ribK = 1 + 0.14 * (t > S5.wow ? Math.max(0, damp(t - S5.wow, 12, 4)) : 0);
  // Lucía entrando por la puerta (recortada al hueco)
  const inside = d => {
    if (t < S5.door || t > S5.inEnd) return '';
    const u = clamp((t - S5.door) / (S5.inEnd - S5.door));
    const id = 'dr' + (uid++), sc = lerp(LUC.sc, 3.1, u);
    const o = Object.assign(walkL(t), { who: 'lucia', expr: 'wow', look: [0.6, 0], head: -3 });
    return `<clipPath id="${id}"><rect x="${f(d.x + 4)}" y="${f(d.y + 4)}" width="${f(d.w - 8)}" height="${f(d.h)}"/></clipPath><g clip-path="url(#${id})">` +
      place(lerp(DOORX5, DOORX5 + 50, u), lerp(LUC.feet, 1300, u), 190, 204, sc, o) + `</g>`;
  };
  w += tiendaShop(SHOP.x, SHOP.base, SHOP.w, SHOP.h, { pct: 1, rib: 1, ribK, page: 12, bell, open, inside, drawer, t: T });
  w += ground(SHOP.base, 0, { sp: 230 });
  if (t > S5.wow && t < S5.wow + 0.9) {
    w += sparkle(GS.rib.x - 260, GS.pct.y + 140, 30, pop(t, S5.wow, 0.3) * (1 + 0.2 * Math.sin(t * 15)));
    w += sparkle(GS.rib.x + 250, GS.pct.y + 80, 24, pop(t, S5.wow + 0.08, 0.3) * (1 + 0.2 * Math.sin(t * 13)));
  }
  // cola de gente que llega a la puerta
  QUEUE5.forEach((q, j) => {
    const t0 = 2.75 + j * 0.3, u = clamp((t - t0) / 1.25);
    if (t < t0) return;
    const x = lerp(-170, q.x, u), walking = u < 1;
    const p = walking ? walkPose(2 * PI * (t - t0) / 0.8 + j, 0.85) : { legF: 0, legB: 0, armF: 0, armB: 0, bob: breathe(T + j) };
    delete p.pony;
    const look = t > S5.ching ? [1, -0.6] : [0.8, -0.2];
    w += shadowEll(x, 1418, 26 * 2.75) + placeFolk(q.i, x, 1418, 2.75, Object.assign(p, { expr: t > S5.ching ? 'sparkle' : (j % 2 ? 'smile' : 'happy'), look, head: -3 }));
  });
  // Lucía fuera
  if (t < S5.door) {
    let lx, o;
    if (t < S5.see) { lx = lerp(-160, LUC.stop, t / S5.see); o = Object.assign(walkL(t), { expr: 'happy', look: [0.4, 0] }); }
    else if (t < S5.run) {
      lx = LUC.stop;
      const dm = damp(t - S5.see, 14, 5), wow = t >= S5.wow, hop = wow ? Math.max(0, Math.sin(clamp((t - S5.wow) / 0.3) * PI)) * 7 : 0;
      o = { legF: -10 * dm, legB: 10 * dm, armF: wow ? -30 : 12 * dm, armB: wow ? 30 : -12 * dm, bob: -hop, expr: wow ? 'wow' : 'curious', look: [1, -1.1], head: -8 };
    } else {
      lx = lerp(LUC.stop, DOORX5, clamp((t - S5.run) / (S5.door - S5.run)));
      o = Object.assign(runL(t - S5.run), { expr: 'wow', look: [0.8, 0], head: -4 });
    }
    w += lucia(lx, o);
    if (t > S5.run) w += speedLinesH(lx - 150, LUC.feet - 420, 160, 4, 90);
    if (t > S5.wow && t < S5.run + 0.2) w += mark('!', LUC.stop + 140, 760, pop(t, S5.wow, 0.3), -8 + 4 * Math.sin(t * 9), 170);
  }
  // campanilla
  if (t > S5.door && t < S5.door + 0.9) {
    const bx = GS.door.x + GS.door.w * 0.84, by = GS.door.y + 20;
    for (let i = 0; i < 2; i++) w += `<path d="M${f(bx + 40 + i * 26)} ${f(by - 40)} q18 30 0 60" fill="none" stroke="${INK}" stroke-width="${f(SW * (1 - (t - S5.door) / 0.9))}" stroke-linecap="round"/>`;
    w += at(bx - 20, by - 120, pop(t, S5.door + 0.05, 0.35) * (1 - easeOut((t - S5.door - 0.7) / 0.2)), text('¡din!', 0, 0, { size: 80, font: 'G', fill: C.yel, sw: SW * 1.6, sd: 5 }), 10);
  }
  // «¡cha-ching!» sobre la caja y monedas
  if (t > S5.ching && t < S5.ching + 1.2) for (let i = 0; i < 4; i++) {
    const u = (t - S5.ching - i * 0.08) / 0.9;
    if (u <= 0 || u >= 1) continue;
    w += coin(800 + (i - 1.5) * 50 + u * (i - 1.5) * 90, 640 - 300 * u + 420 * u * u, 24, t * 12 + i);
  }
  w += chaChing(800, 690, pop(t, S5.ching, 0.4) * 0.62, t);
  let s = cam(zoomIn(t, 0, 1.28, 0.3) * bump(t, [S5.wow, S5.ching], 0.035), 540, 900, w);
  if (t < 0.3) s += speedLinesRadial(540, 900, 1 - t / 0.3);
  const k = pop(t, 1.4, 0.5);
  s += big('¡Voy ahora mismo!', 540, 270, 132, k, lerp(-8, -3, k));
  return s;
};

/* ---------- 6) Primer plano del móvil: tarjeta con «Hasta el sábado»; «Publicar» -> tic verde «Publicada» ---------- */
const PH6 = { X: 190, Y: 410, PW: 700, PH: 990 };
const BTN6 = { x: 540, y: 1268, w: 540, h: 124 }, PRESS6 = 2.6;
S[6] = (t, T) => {
  let w = day(T, { band: 1150, sx: 975, sy: 470, sr: 48 });
  w += ground(1500, 0, { sp: 230 });
  const hd = holdHand(PH6.X, PH6.Y, PH6.PW, PH6.PH);
  let ph = hd.back;
  const kc = pop(t, 0.2, 0.55), tagK = pop(t, 1.0, 0.5) * (1 + 0.08 * (t > 1.4 ? Math.max(0, damp(t - 1.4, 10, 3)) : 0));
  ph += portalPhone(PH6.X, PH6.Y, PH6.PW, PH6.PH, (sx, sy, sw_) => {
    let g = '';
    const cx = sx + 28, cy = sy + 28, cw = sw_ - 56;
    if (kc > 0.01) g += `<g transform="translate(540 ${f(cy + 280)}) scale(${f(kc)}) translate(-540 ${f(-(cy + 280))})">` + offerCard8(cx, cy, cw, 560, { kPct: pop(t, 0.55, 0.5), kTag: tagK }, t) + `</g>`;
    const kb = pop(t, 1.35, 0.45), done = t >= PRESS6;
    const sq = t >= PRESS6 - 0.05 && t < PRESS6 + 0.1 ? 0.92 : 1 + (done ? 0.06 * Math.max(0, damp(t - PRESS6 - 0.1, 16, 6)) : 0);
    if (kb > 0.01) {
      let b = `<rect x="${-BTN6.w / 2 + 9}" y="${-BTN6.h / 2 + 9}" width="${BTN6.w}" height="${BTN6.h}" rx="${BTN6.h / 2}" fill="${INK}"/>`;
      b += `<rect x="${-BTN6.w / 2}" y="${-BTN6.h / 2}" width="${BTN6.w}" height="${BTN6.h}" rx="${BTN6.h / 2}" fill="${done ? C.green : C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
      if (!done) b += text('Publicar', 0, 4, { size: 74, sw: SW * 1.8, sd: 5 });
      else { b += checkCircle(-150, 0, 48, pop(t, PRESS6 + 0.05, 0.4)); b += text('Publicada', 50, 4, { size: 70, sw: SW * 1.8, sd: 5 }); }
      g += at(BTN6.x, BTN6.y, kb * sq, b);
    }
    return g;
  }, { hh: 150 });
  ph += hd.front;
  const rise = lerp(140, 0, easeOut(t / 0.4));
  w += `<g transform="translate(0 ${f(rise)})">${ph}</g>`;
  if (t > 1.05 && t < 1.9) { w += sparkle(780, 1080, 28, pop(t, 1.05, 0.3) * (1 + 0.2 * Math.sin(t * 15))); w += sparkle(250, 1150, 22, pop(t, 1.15, 0.3)); }
  if (t > PRESS6 && t < PRESS6 + 0.6) {
    const v = (t - PRESS6) / 0.6;
    for (let j = 0; j < 2; j++) { const u = clamp(v - j * 0.25); if (u > 0) w += `<circle cx="${BTN6.x + 120}" cy="${BTN6.y}" r="${f(30 + u * 200)}" fill="none" stroke="${INK}" stroke-width="${f(SW * (1.2 - u))}"/>`; }
  }
  if (t > PRESS6 + 0.1) [[150, 1130, 34, 0.1], [930, 1150, 30, 0.18], [120, 640, 28, 0.26], [960, 700, 30, 0.34]].forEach(([x, y, r, d], i) => { w += sparkle(x, y, r, pop(t, PRESS6 + d, 0.35) * (1 + 0.2 * Math.sin(t * 14 + i))); });
  // dedo que pulsa
  const fin = easeOut(clamp((t - 1.95) / 0.5)), out = easeInOut(clamp((t - PRESS6 - 0.35) / 0.4));
  const fx = lerp(1350, BTN6.x + 120, fin) + out * 900, fy = lerp(1340, BTN6.y + 10, fin) + (t > PRESS6 - 0.05 && t < PRESS6 + 0.1 ? 8 : 0);
  if (t > 1.95 && fx < 1340) w += finger(fx, fy, -14);
  let s = cam(zoomIn(t, 0, 1.18, 0.24) * bump(t, [PRESS6], 0.03), 540, 860, w);
  const k = pop(t, 0.3, 0.5);
  s += big('Tú pones la fecha', 540, 268, 128, k, lerp(-8, -3, k));
  return s;
};

/* ---------- 7) Calle llena de gente: vibran los móviles, los sacan y ven la oferta con fecha ---------- */
const CROWD7 = [
  { i: 3, x: 95, foot: 1250, sc: 2.6 }, { i: 6, x: 275, foot: 1250, sc: 2.6 }, { i: 0, x: 455, foot: 1250, sc: 2.6 },
  { i: 9, x: 635, foot: 1250, sc: 2.6 }, { i: 7, x: 815, foot: 1250, sc: 2.6 }, { i: 8, x: 990, foot: 1250, sc: 2.6 },
  { i: 1, x: 170, foot: 1420, sc: 3.2 }, { i: F_ROSA, x: 415, foot: 1420, sc: 3.1 }, { i: 4, x: 665, foot: 1420, sc: 3.2 }, { i: F_CUADROS, x: 905, foot: 1420, sc: 3.15 }
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
      bob: (wp.bob || 0) + (up > 0 ? -3 * Math.max(0, damp(t - UP7, 14, 5)) : 0), shake, lit: t > VIB7, rot: lerp(-12, -6, up) };
    const r = streetPerson8(c.i, x, c.foot, c.sc, o);
    w += r.svg;
    if (vib) {
      w += vibeRings(r.phone[0], r.phone[1], t, 30);
      if (Math.floor(t * 14) % 2) w += `<path d="M${f(r.phone[0] - 62)} ${f(r.phone[1] - 22)} l-14 -14 M${f(r.phone[0] + 62)} ${f(r.phone[1] - 22)} l14 -14" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round"/>`;
    }
    if (up > 0.4) w += sparkle(r.head[0] + (flip ? -1 : 1) * 70, r.head[1] - 40, 20, pop(t, UP7 + 0.3, 0.35) * (1 + 0.2 * Math.sin(t * 16 + n)));
  });
  let s = cam(zoomIn(t, 0, 1.12, 0.22) * bump(t, [VIB7, UP7 + 0.4], 0.035), 540, 1000, w);
  const kc = pop(t, UP7 + 0.35, 0.55);
  s += at(540, 690 + 6 * Math.sin(t * 2.4), kc * 0.95, offerMini8(t), lerp(-8, -2, kc));
  const k1 = pop(t, 0.2, 0.5), k2 = pop(t, 0.4, 0.5);
  s += big('Nosotros la llevamos', 540, 270, 122, k1, lerp(-8, -3, k1));
  s += big('a la mano de tus clientes', 540, 400, 104, k2, lerp(7, 2, k2), { fill: C.yel });
  return s;
};

/* ---------- 8) ¿Tienes un negocio? Escríbenos + sobre con el correo; tarjeta final roja ---------- */
const BIRDS8 = [{ t0: 0.2, d: 4.0, dir: 1, y: 470, a: 36 }, { t0: 1.4, d: 4.4, dir: -1, y: 1350, a: 30 }, { t0: 2.6, d: 3.6, dir: 1, y: 700, a: 32 }];
S[8] = (t, T, sc) => {
  const cut = (sc && sc.cut) || 6;
  if (t < cut) {
    let s = day(T, { band: 1180, sx: 150, sy: 770, sr: 52, clouds: [
      { x0: 60, y: 240, s: 0.75, v: 16 }, { x0: 700, y: 1390, s: 0.85, v: 24 }, { x0: 300, y: 1470, s: 0.6, v: 11 },
      { x0: 1250, y: 720, s: 0.9, v: 19 }, { x0: 1650, y: 430, s: 0.7, v: 14 }] });
    BIRDS8.forEach((b, i) => {
      const u = (t - b.t0) / b.d;
      if (u < 0 || u > 1) return;
      const x = b.dir > 0 ? lerp(-90, W + 90, u) : lerp(W + 90, -90, u);
      s += bird(x, Math.min(1370, b.y + Math.sin(u * 7 + i) * 14), b.a, 0.35 + 0.65 * Math.sin(t * 2 * PI / 0.34 + i * 2));
    });
    const k1 = pop(t, 0.15, 0.5);
    s += big('¿Tienes un negocio?', 540, 330, 135, k1, lerp(-8, -3, k1));
    const ks = pop(t, 0.6, 0.6);
    let st = `<rect x="-640" y="-90" width="1280" height="180" transform="translate(0 14)" fill="${INK}"/><rect x="-640" y="-90" width="1280" height="180" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
    st += text('Escríbenos y te informamos', 0, 2, { size: fit('Escríbenos y te informamos', 96, 960), sw: SW * 2, sd: 6 });
    const ke = pop(t, 1.1, 0.55), open = easeOut((t - 1.8) / 0.4);
    s += envelope(540, 880 + 8 * Math.sin(t * 3), 440, ke, open, lerp(-14, -4, ke) + 2 * Math.sin(t * 2.4));
    s += `<g transform="translate(${f(540 + (1 - ks) * -1500)} 545) rotate(-3)">${st}</g>`;
    if (t > 1.9) { s += sparkle(300, 760, 30, pop(t, 1.9, 0.4) * (1 + 0.2 * Math.sin(t * 15))); s += sparkle(790, 720, 24, pop(t, 2.0, 0.4)); }
    const k4 = pop(t, 1.5, 0.5), mail = 'info@escaparatetudela.es', ms = fit(mail, 74, 880);
    const pulse = t > 2.4 ? 1 + 0.025 * Math.sin((t - 2.4) * 2 * PI / 1.1) : 1;
    s += at(540, 1130, k4 * pulse, `<rect x="-480" y="-70" width="960" height="140" rx="70" transform="translate(12 12)" fill="${INK}"/><rect x="-480" y="-70" width="960" height="140" rx="70" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>` +
      text(mail, 0, 2, { size: ms, fill: C.red, sw: SW * 1.6, sd: 4 }));
    const k5 = pop(t, 1.9, 0.5);
    s += at(540, 1290, k5, text('escaparatetudela.es', 0, 0, { size: 62, fill: INK, stroke: null }));
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
  document.getElementById('dyn').innerHTML = S[sceneId](t, T, sc);
};
