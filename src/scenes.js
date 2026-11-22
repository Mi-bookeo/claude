/* Vídeo 12 — «Marta y la cesta de bebé». Escenas sobre lib.js + series.js + rosa.js + v04…v12.js.
   Todo se calcula a partir de (t local de la escena, T global). Duraciones, planos (shots) y momentos de aparición
   (cues) se leen de config.json. Franja inferior (y > 1400) libre de textos y elementos importantes; margen superior
   hasta y=192. Cortes secos entre escenas y entre planos; textos con rebote; zoom rápido tipo cómic al empezar. */
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
const MSG1 = 'He visto tu oferta en Escaparate de Tudela, quiero más información';
const MSG2 = '¿Me podrías hacer para el viernes una cesta para una niña?';
const MSG3 = 'No hay problema, para el viernes la tienes.';
const SITM = 4.6, SITX = 380; // Marta sentada en el sofá: escala y posición del punto (190,149)
const sitState = (T, extra = {}) => Object.assign({ sit: true, blink: blink11(T), bob: marta12Breath(T, SITM), pony: 5 * Math.sin(2 * PI * T / 1.9) }, extra);
const lerp2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
// gira un punto local alrededor de la cadera (para objetivos de mano con el tronco inclinado)
function unrot(p, deg) { const a = -deg * PI / 180, dx = p[0] - 186, dy = p[1] - 146; return [186 + dx * Math.cos(a) - dy * Math.sin(a), 146 + dx * Math.sin(a) + dy * Math.cos(a)]; }

/* ---------- 1) Regalo para el bebé de Lucía ---------- */
S[1] = (t, T, sc) => {
  const c = cues(sc, { title: 0.2, title2: 0.45, think: 0.7 });
  let s = homeBack(T);
  const tap = 0.8 * Math.max(0, Math.sin(2 * PI * 1.3 * t));
  s += marta12(SITX, HOME.seat, 190, 149, SITM, sitState(T, {
    expr: 'pensive', head: -3 + 1.5 * Math.sin(2 * PI * T / 2.4), lap: lapLaptop,
    armF: { h: [199.5, 95.6 - tap], side: 1, hand: 'fist', hs: 1.15 },
    armB: { h: [206, 136], side: 1, hand: 'fist', hs: 1.1 }
  }));
  const head = m12W(SITX, HOME.seat, 190, 149, SITM, 199, 62);
  s += thoughtLucia(735, 650, 640, 420, pop(t, c.think, 0.6), T, head);
  s = cam(comicZoom(t), 540, 900, s);
  s += bigT('Regalo para', 540, 262, 104, pop(t, c.title, 0.5), -3, { fill: '#FFFFFF' });
  s += bigT('el bebé de Lucía', 540, 372, 104, pop(t, c.title2, 0.5), 2, { fill: C.yel });
  return s;
};

/* ---------- 2) ¿Qué le regalo? (primer plano del portátil) ---------- */
function martaCircle12(cx, cy, r, t, T, o) {
  const sc = r / 22, id = 'mc' + (uid++);
  const px = cx - 3 * sc, foot = cy + (204 - 88) * sc;
  let g = `<circle cx="${f(cx + 12)}" cy="${f(cy + 12)}" r="${r}" fill="${INK}"/>`;
  g += `<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><g clip-path="url(#${id})">`;
  g += `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="${C.cream}"/>`;
  for (let y = cy - r + 10; y < cy + r; y += 28) for (let x = cx - r + 10; x < cx + r; x += 28) g += `<circle cx="${x}" cy="${y}" r="4" fill="${DOT}"/>`;
  g += `<rect x="${cx - r}" y="${f(cy + r * 0.35)}" width="${2 * r}" height="${r}" rx="30" fill="${C.blue}" ${st12()}/>`;
  g += marta12(px, foot, 190, 204, sc, Object.assign({ blink: blink11(T), bob: marta12Breath(T, sc), pony: 5 * Math.sin(2 * PI * T / 1.9) }, o));
  g += `</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.3)}"/>`;
  return g;
}
S[2] = (t, T, sc) => {
  const c = cues(sc, { title: 0.25, title2: 0.45, doubt: 1.6, q: 1.8 });
  let s = dotWall();
  s += bigLaptop(100, 690, 880, 520, t, 34 + 95 * t);
  const doubt = t >= c.doubt;
  const sx = doubt ? 1.3 * Math.sin(2 * PI * 5 * t) : 0;
  s += martaCircle12(262, 452, 170, t, T, {
    expr: doubt ? 'doubt' : 'pensive', head: doubt ? 4 : -3,
    armF: { h: [199.5 + sx, 95.6 + (doubt ? 0.6 * Math.cos(2 * PI * 5 * t) : 0)], side: 1, hand: doubt ? 'point' : 'fist', dir: -95, hs: 1.2 }
  });
  // signos de interrogación sobre la cabeza
  [[150, 250, 96, -14], [262, 222, 120, 6], [376, 262, 88, 16]].forEach(([x, y, sz, rot], i) => {
    const k = pop(t, c.q + i * 0.25, 0.45), b = 8 * Math.sin(T * 5 + i * 2);
    s += qMark(x, y + b, sz, k, rot + 6 * Math.sin(T * 3 + i));
  });
  s = cam(comicZoom(t), 540, 900, s);
  s += bigT('¿Qué le', 770, 390, 124, pop(t, c.title, 0.5), -4, { fill: '#FFFFFF', maxW: 480 });
  s += bigT('regalo?', 770, 512, 136, pop(t, c.title2, 0.5), 3, { fill: C.yel, maxW: 480 });
  return s;
};

/* ---------- 3) Notificación: ¡WOW! 30 % ---------- */
function phoneLying(x, y, shake, lit) {
  let g = `<g transform="translate(${f(x + shake)} ${f(y)}) rotate(-6)">`;
  g += `<rect x="-78" y="-26" width="156" height="52" rx="14" transform="translate(6 6)" fill="${INK}"/>`;
  g += `<rect x="-78" y="-26" width="156" height="52" rx="14" fill="${INK}" ${st12(0.8)}/>`;
  g += `<rect x="-66" y="-17" width="132" height="34" rx="8" fill="${lit ? C.cream : C.glass}"/>`;
  if (lit) g += `<rect x="-66" y="-17" width="30" height="34" rx="6" fill="${C.red}"/><rect x="-28" y="-8" width="80" height="7" rx="3.5" fill="${INK}" opacity="0.5"/><rect x="-28" y="4" width="52" height="7" rx="3.5" fill="${C.red}"/>`;
  return g + '</g>';
}
function notifBanner(x, y, k) {
  if (k <= 0.01) return '';
  const Wd = 960, Hd = 176, x0 = -Wd / 2, y0 = -Hd / 2;
  let g = panel(x0, y0, Wd, Hd, 40, '#FFFFFF', 12);
  g += `<rect x="${x0 + 24}" y="${y0 + 24}" width="128" height="128" rx="28" fill="${C.red}" ${st12(0.8)}/>`;
  g += `<rect x="${x0 + 36}" y="${y0 + 36}" width="104" height="104" rx="22" fill="#FFFFFF" ${st12(0.6)}/>` + logoIcon(x0 + 88, y0 + 90, 100);
  g += text('Escaparate de Tudela', x0 + 180, y0 + 54, { size: 36, anchor: 'start', fill: C.red, stroke: null, shadow: false });
  g += text('Oferta · Cestas de bebé · 30 %', x0 + 180, y0 + 118, { size: fit('Oferta · Cestas de bebé · 30 %', 58, Wd - 210), anchor: 'start', fill: INK, stroke: null, shadow: false });
  return at(x, y, k, g);
}
S[3] = (t, T, sc) => {
  const c = cues(sc, { buzz: 0.1, notif: 0.35, reach: 1.15, grab: 1.45, lift: 1.75, wow: 1.85 });
  let s = homeBack(T);
  // portátil cerrado apoyado en el sofá
  s += `<rect x="190" y="${HOME.seat - 52}" width="150" height="22" rx="8" fill="${C.navy}" ${st12(0.8)}/><rect x="182" y="${HOME.seat - 32}" width="166" height="16" rx="6" fill="${K12.greyL}" ${st12(0.8)}/>`;
  const PH = [590, HOME.seat - 26];
  const grabbed = t >= c.grab, wow = t >= c.wow;
  let lean = 0, armF;
  if (!grabbed) {
    const ur = t < c.reach ? 0 : easeOut((t - c.reach) / 0.25) * 16;
    lean = ur;
    const tgt = unrot(m12L(SITX, HOME.seat, 190, 149, SITM, PH[0] - 8, PH[1] - 6), ur);
    const rest = [207, 134];
    armF = { h: t < c.reach ? rest : lerp2(rest, tgt, easeOut((t - c.reach) / 0.25)), side: -1, hand: 'fist', hs: 1.15 };
  } else {
    const u = easeOut((t - c.grab) / 0.3);
    lean = 16 * (1 - u);
    const tgt0 = unrot(m12L(SITX, HOME.seat, 190, 149, SITM, PH[0] - 8, PH[1] - 6), 16), tgt1 = [215, 92];
    armF = { h: lerp2(tgt0, tgt1, u), side: 1, hand: 'phone', hs: 1.5, rot: lerp(-80, 8, u) };
  }
  const shake = t >= c.buzz && !grabbed ? 7 * Math.sin(2 * PI * 26 * t) : 0;
  if (!grabbed) {
    if (t >= c.buzz) s += vibeRings(PH[0], PH[1], t, 70, 3);
    s += phoneLying(PH[0], PH[1], shake, t >= c.notif);
  }
  // líneas de impacto detrás de Marta
  const headW = m12W(SITX, HOME.seat, 190, 149, SITM, 194, 80);
  if (wow) s += `<g opacity="0.9">${impactLines(headW[0], headW[1], t, 26, 330)}</g>`;
  s += marta12(SITX, HOME.seat, 190, 149, SITM, sitState(T, {
    expr: wow ? (t < c.wow + 0.7 ? 'shock' : 'sparkle') : grabbed ? 'surprise' : t >= c.buzz ? 'surprise' : 'pensive', upperRot: lean,
    talk: t >= c.wow + 0.7 ? talkAmt(t, sc.talk) : 0,
    head: wow ? -4 : 0, squash: wow ? [1 + 0.05 * damp(t - c.wow, 20, 6), 1 - 0.05 * damp(t - c.wow, 20, 6)] : null,
    armF, armB: { h: [178, 141], side: 1, hand: 'fist', hs: 1.1 }
  }));
  if (wow) {
    const k = pop(t, c.wow, 0.4);
    [[-150, -140, -35], [150, -150, 35], [-190, -20, -70], [190, -10, 70]].forEach(([dx, dy, rot]) => {
      s += at(headW[0] + dx * k, headW[1] + dy * k, k, `<path d="M0 -36 L10 0 L0 36 L-10 0Z" fill="${C.yel}" ${st12(0.8)}/>`, rot);
    });
  }
  s = cam(comicZoom(t, 1.12) * (wow ? lerp(1.12, 1.05, easeOut((t - c.wow) / 0.25)) : 1), 520, 1000, s);
  s += notifBanner(540, 300, pop(t, c.notif, 0.5));
  if (wow) {
    const k = pop(t, c.wow, 0.5);
    s += at(540, 545, k, burst(0, 0, 220, T * 20, C.red), 0);
    s += bigT('¡WOW! 30 %', 540, 545, 150, k, -5, { fill: C.yel, font: 'G', maxW: 860 });
  }
  return s;
};

/* ---------- 4) Tarjeta de oferta -> pulsa «WhatsApp» -> chat ---------- */
const WA_TIP = [701, 1146];
S[4] = (t, T, sc) => {
  const c = cues(sc, { seal: 0.3, finger: 1.25, press: 1.85, cut: 2.6, prefill: 2.9, send: 3.35, bubble: 3.5, ticks: 4.0 });
  const { X, Y, PW, PH } = PHN;
  let s = dotWall();
  if (t < c.cut) {
    const kWa = t < c.press ? 1 : t < c.press + 0.1 ? 0.86 : 0.86 + 0.14 * pop(t, c.press + 0.1, 0.45);
    const ring = t >= c.press && t < c.press + 0.5 ? (t - c.press) / 0.5 : 0;
    let p = phoneFrame(X, Y, PW, PH, offerScreen({ kSeal: pop(t, c.seal, 0.5), kWa, ring }, t));
    s += cam(comicZoom(t), 540, 800, p);
    // dedo que entra desde la derecha y pulsa
    if (t >= c.finger) {
      const u = easeOut((t - c.finger) / 0.4), back = t > c.press + 0.35 ? easeInOut((t - c.press - 0.35) / 0.35) : 0;
      const push = t >= c.press && t < c.press + 0.18 ? 12 : 0;
      const tx = lerp(1300, WA_TIP[0] + 30, u) + back * 650 - push, ty = WA_TIP[1] + 14 + back * 60 + push * 0.4;
      s += finger(tx + 34, ty, -10);
    }
    if (t >= c.press && t < c.press + 0.5) s += ringLines(WA_TIP[0], WA_TIP[1] - 10, pop(t, c.press, 0.3));
    return s;
  }
  const u = t - c.cut;
  const input = t >= c.prefill && t < c.bubble ? MSG1 : '';
  const send = t >= c.send && t < c.bubble + 0.1 ? Math.sin(PI * clamp((t - c.send) / 0.25)) : 0;
  const msgs = [{ who: 'm', text: MSG1, k: pop(t, c.bubble, 0.45), ticks: pop(t, c.ticks, 0.4) }];
  s += cam(comicZoom(u, 1.1), 540, 800, phoneFrame(X, Y, PW, PH, chatScreen(msgs, { input, send, caret: !input }, t)));
  if (t >= c.prefill && t < c.bubble) s += sparkle(250, 1300, 26, pop(t, c.prefill, 0.3));
  return s;
};

/* ---------- 5) Marta escribe; la farmacia responde; Marta en el sofá ---------- */
S[5] = (t, T, sc) => {
  const c = cues(sc, { type0: 0.25, type1: 2.0, send: 2.2, ticks: 2.7, typing: 2.95, reply: 4.2, thumb: 4.6, cut: 5.3, text: 5.4, text2: 5.6 });
  if (t < c.cut) {
    const { X, Y, PW, PH } = PHN;
    let s = dotWall();
    const n = Math.floor(MSG2.length * clamp((t - c.type0) / (c.type1 - c.type0)));
    const input = t >= c.type0 && t < c.send ? MSG2.slice(0, n) : '';
    const send = t >= c.type1 && t < c.send + 0.1 ? Math.sin(PI * clamp((t - c.type1) / 0.25)) : 0;
    const msgs = [
      { who: 'm', text: MSG1, k: 1, ticks: 1 },
      { who: 'm', text: MSG2, k: pop(t, c.send, 0.45), ticks: pop(t, c.ticks, 0.4) },
      { who: 'typing', k: t < c.reply ? pop(t, c.typing, 0.4) : 0 },
      { who: 'f', text: MSG3, k: pop(t, c.reply, 0.45) }
    ];
    s += cam(comicZoom(t, 1.06), 540, 800, phoneFrame(X, Y, PW, PH, chatScreen(msgs, { input, send, caret: t < c.send, typingHdr: t >= c.typing && t < c.reply }, t)));
    // teclado: pulgares que teclean
    if (t >= c.type0 && t < c.type1) {
      const ph = t * 2 * PI * 4;
      [[330, 0], [750, PI]].forEach(([x, o]) => { const d = Math.max(0, Math.sin(ph + o)); s += hand11('fist', [x, 1350 - d * 18], wW, { hs: 6 }); });
    }
    s += thumbSticker(915, 1190, 108, pop(t, c.thumb, 0.5), -10 + 6 * Math.sin(T * 4));
    if (t >= c.thumb) s += sparkle(760, 1130, 26, pop(t, c.thumb + 0.15, 0.4)) + sparkle(1010, 1080, 22, pop(t, c.thumb + 0.25, 0.4));
    return s;
  }
  // corte rápido: Marta en el sofá, contentísima, con los brazos en alto
  const u = t - c.cut;
  let s = homeBack(T);
  const hop = Math.abs(Math.sin(2 * PI * 1.6 * u)) * 4;
  const wv = 3 * Math.sin(2 * PI * 3 * u);
  s += marta12(SITX, HOME.seat - hop * SITM, 190, 149, SITM, sitState(T, {
    expr: 'joy', lap: lapLaptop, head: 2,
    armF: { h: [216 + wv, 66], side: -1, hand: 'open', hs: 1.3, hrot: 10 },
    armB: { h: [168 - wv, 66], side: 1, hand: 'open', hs: 1.3, hrot: -10 }
  }));
  for (let i = 0; i < 14; i++) {
    const p = (u * 0.9 + hash(i * 3.3)) % 1;
    s += confetti(80 + hash(i * 7.7) * 920, 560 + p * 820, i, u + i);
  }
  const hd = m12W(SITX, HOME.seat, 190, 149, SITM, 192, 60);
  s += sparkle(hd[0] - 170, hd[1] - 30, 30, 0.6 + 0.4 * Math.sin(T * 9)) + sparkle(hd[0] + 200, hd[1] + 10, 26, 0.6 + 0.4 * Math.sin(T * 8 + 2));
  s = cam(comicZoom(u, 1.18), 480, 1000, s);
  s += bigT('Directo', 540, 280, 140, pop(t, c.text, 0.5), -4, { fill: C.yel });
  s += bigT('con el comercio', 540, 400, 110, pop(t, c.text2, 0.5), 2, { fill: '#FFFFFF' });
  return s;
};

/* ---------- 6) VIERNES: Marta va a la farmacia ---------- */
const DOOR_X = (FAC.door[0] + FAC.door[1]) / 2;
const STM = 3.6;
function walkArms(ph, item) {
  const sn = Math.sin(ph);
  return {
    armF: Object.assign({ h: [205 + 9 * sn, 139 - 2 * Math.abs(sn)], side: -1, hand: 'fist', hs: 1.15 }, item || {}),
    armB: { h: [175 - 9 * sn, 139 - 2 * Math.abs(sn)], side: 1, hand: 'fist', hs: 1.15 }
  };
}
function martaWalk(x, foot, sc, t, T, extra = {}) {
  const ph = 2 * PI * t / STEP, wp = walkPose(ph, 1);
  return marta12(x, foot, 190, 204, sc, Object.assign({ legF: wp.legF, legB: wp.legB, bob: wp.bob, pony: wp.pony, blink: blink11(T), expr: 'joy' }, walkArms(ph), extra));
}
function insideDoor(svg) {
  const id = 'dr' + (uid++), [d0, d1] = FAC.door;
  return `<clipPath id="${id}"><rect x="${d0}" y="${FAC.doorTop}" width="${d1 - d0}" height="${FAC.base - FAC.doorTop}"/></clipPath><g clip-path="url(#${id})">${svg}</g>`;
}
S[6] = (t, T, sc) => {
  const c = cues(sc, { cal: 0.05, calOut: 1.1, walk0: 0.9, door: 2.95, enter: 3.2, close: 3.6 });
  const openU = t < c.door ? 0 : t < c.close ? easeOut((t - c.door) / 0.25) : 1 - easeOut((t - c.close) / 0.3);
  const bellAng = t >= c.door ? 26 * damp(t - c.door, 16, 2.6) : 0;
  let inside = '', front = '';
  if (t >= c.walk0) {
    if (t < c.enter) {
      const x = lerp(-170, DOOR_X, clamp((t - c.walk0) / (c.enter - c.walk0)));
      front = shadowEll(x, FAC.base + 4, 80) + martaWalk(x, FAC.base, STM, t - c.walk0, T);
    } else {
      const u = clamp((t - c.enter) / 0.45);
      const sc2 = STM * (1 - 0.12 * u), x = DOOR_X + 20 * u, foot = FAC.base - 40 * u;
      inside = insideDoor(martaWalk(x, foot, sc2, t - c.walk0, T, { head: -4 * u }));
    }
  }
  let s = streetScene(T, { open: openU, bellAng, inside });
  s += front;
  if (t >= c.door && t < c.door + 0.8) s += ringLines(FAC.door[0] + 40, FAC.doorTop + 60, pop(t, c.door, 0.3)) + onoma(FAC.door[0] - 40, FAC.doorTop - 40, pop(t, c.door, 0.4), '¡Tilín!', -10, C.yel, 56);
  s = cam(comicZoom(t, 1.1), 540, 900, s);
  // hoja de calendario
  if (t < c.calOut + 0.4) {
    let k = pop(t, c.cal, 0.55), y = 700, rot = -4 + 3 * Math.sin(T * 3);
    if (t > c.calOut) { const u = easeInOut((t - c.calOut) / 0.35); y -= 1100 * u; rot -= 30 * u; k *= 1 - 0.4 * u; }
    s += viernesSheet(540, y, k, rot);
  }
  return s;
};

/* ---------- 7) Interior de la farmacia: la cesta ---------- */
const FM = { mx: 400, msc: 4.8, fx: 760, fsc: 4.8, bs: 0.85 };
S[7] = (t, T, sc) => {
  const c = cues(sc, { title: 0.3, lift: 0.75, give: 1.45, take: 1.9, hold: 2.5 });
  const B0 = [650, FI.counter - 6], B1 = [565, 1000], B2 = [455, 1128];
  let B, phase;
  if (t < c.lift) { B = B0; phase = 0; }
  else if (t < c.give) { B = lerp2(B0, B1, easeInOut((t - c.lift) / (c.give - c.lift))); phase = 1; }
  else if (t < c.take) { B = B1; phase = 2; }
  else if (t < c.hold) { B = lerp2(B1, B2, easeInOut((t - c.take) / (c.hold - c.take))); phase = 3; }
  else { B = [B2[0], B2[1] - 4 * Math.abs(Math.sin(2 * PI * 0.9 * (t - c.hold)))]; phase = 4; }
  const bs = FM.bs, handleTop = [B[0], B[1] - BASKET_HANDLE * bs];
  let s = pharmacyInterior(T);
  // farmacéutica (detrás del mostrador, mirando a la izquierda)
  const fF = fLoc(FM.fx, FI.floor, FM.fsc, handleTop[0] + 6, handleTop[1] + 4, true);
  const holding = t < c.take + 0.25;
  const armFf = holding ? { ik: fF, side: -1 } : { ang: 8, bend: -14 };
  s += placeFarma(FM.fx, FI.floor, FM.fsc, { flip: true, expr: t > c.take ? 'proud' : 'happy', blink: tBlink(T, 0.6), bob: tBreath(T), pony: 4 * Math.sin(T * 2), armF: armFf, armB: { ang: 6, bend: -8 }, head: 3 * Math.sin(T * 1.7) });
  s += pharmacyCounter();
  // Marta
  const M = FM.msc, toL = (X, Y) => m12L(FM.mx, FI.floor, 190, 204, M, X, Y);
  let hF, hB;
  const sideL = [B[0] - 95 * bs, B[1] - 72 * bs], sideR = [B[0] + 95 * bs, B[1] - 72 * bs], bot = [B[0] + 10, B[1] - 6];
  if (phase <= 1) { hF = [207, 140]; hB = [173, 140]; }
  else if (phase === 2) { const u = easeOut((t - c.give) / 0.3); hF = lerp2([207, 140], toL(...bot), u); hB = lerp2([173, 140], toL(...sideL), u); }
  else if (phase === 3) { const u = easeInOut((t - c.take) / (c.hold - c.take)); hF = lerp2(toL(...[B1[0] + 10, B1[1] - 6]), toL(...sideR), u); hB = toL(...sideL); }
  else { hF = toL(...sideR); hB = toL(...sideL); }
  if (phase === 3) hB = toL(...sideL);
  const emo = t >= c.hold;
  s += shadowEll(FM.mx, FI.floor + 4, 90);
  s += marta12(FM.mx, FI.floor, 190, 204, M, {
    expr: emo ? 'sparkle' : t >= c.give ? 'joy' : 'happy', blink: emo ? false : blink11(T), bob: breath11(T, M), pony: 5 * Math.sin(2 * PI * T / 1.9),
    armF: { h: hF, side: 1, hand: 'fist', hs: 1.15 }, armB: { h: hB, side: 1, hand: 'fist', hs: 1.15 }, head: emo ? 3 : 0
  });
  // cesta y manos encima
  s += basket(B[0], B[1], bs, phase >= 4 ? 2 * Math.sin(T * 3) : 0, T);
  if (holding) s += `<circle cx="${f(handleTop[0] + 6)}" cy="${f(handleTop[1] + 4)}" r="${f(4.3 * FM.fsc)}" fill="${C.skin}" ${st12(0.75)}/>`;
  if (phase >= 2) {
    const wF = m12W(FM.mx, FI.floor, 190, 204, M, hF[0], hF[1]), wB = m12W(FM.mx, FI.floor, 190, 204, M, hB[0], hB[1]);
    s += hand11('fist', wB, wW, { hs: 1.15 * M, fill: C.skinS }) + hand11('fist', wF, wW, { hs: 1.15 * M });
  }
  // corazones
  if (emo) {
    for (let i = 0; i < 5; i++) {
      const p = ((t - c.hold) * 0.55 + i / 5) % 1;
      s += heartPop(B[0] - 140 + i * 70 + 26 * Math.sin((t + i) * 3), B[1] - 300 - p * 420, 26 + (i % 2) * 8, Math.min(1, p / 0.12) * (1 - p * 0.3), 12 * Math.sin(t * 4 + i));
    }
  }
  s = cam(comicZoom(t, 1.12), 540, 950, s);
  s += bigT('¡Para el viernes!', 540, 262, 112, pop(t, c.title, 0.5), -3, { fill: C.yel });
  return s;
};

/* ---------- 8) Sale con la cesta: ¡Bien! ---------- */
S[8] = (t, T, sc) => {
  const c = cues(sc, { open: 0.05, out: 0.25, front: 1.0, bien: 1.15, close: 1.3 });
  const openU = t < c.close ? easeOut((t - c.open) / 0.25) : 1 - easeOut((t - c.close) / 0.3);
  const bellAng = 24 * (damp(t - c.open, 16, 2.6) * (t >= c.open ? 1 : 0)) + (t >= c.close ? 18 * damp(t - c.close, 16, 3) : 0);
  const X2 = 590;
  const basketArm = { h: [207, 141], side: -1, hand: 'fist', hs: 1.15 };
  const hangItem = (x, foot, sc2, rot) => { const [hx, hy] = m12W(x, foot, 190, 204, sc2, 207, 141); return basketHang(hx, hy - 4 * sc2 / STM, 0.56 * sc2 / STM, rot, T) + hand11('fist', [hx, hy], wW, { hs: 1.15 * sc2 }); };
  let inside = '', front = '';
  if (t < c.out) {
    inside = insideDoor(marta12(DOOR_X + 10, FAC.base - 40, 190, 204, STM * 0.88, { expr: 'joy', blink: false, armF: basketArm }) + hangItem(DOOR_X + 10, FAC.base - 40, STM * 0.88, 0));
  } else if (t < c.front) {
    const u = (t - c.out) / (c.front - c.out), e = easeInOut(u);
    const x = lerp(DOOR_X + 10, X2, e), foot = lerp(FAC.base - 40, FAC.base, e), sc2 = STM * lerp(0.88, 1, e);
    const ph = 2 * PI * (t - c.out) / STEP, wp = walkPose(ph, 1);
    const m = marta12(x, foot, 190, 204, sc2, Object.assign({ legF: wp.legF, legB: wp.legB, bob: wp.bob, pony: wp.pony, expr: 'joy', blink: blink11(T), armF: basketArm, armB: walkArms(ph).armB })) + hangItem(x, foot, sc2, 8 * Math.sin(ph));
    if (u < 0.35) inside = insideDoor(m); else front = shadowEll(x, FAC.base + 4, 80) + m;
  } else {
    const hop = t >= c.bien ? Math.max(0, Math.sin(PI * clamp((t - c.bien) / 0.4))) * 20 : 0;
    const wave = POSE.wave(2 * PI * (t - c.front) * 2.2);
    front = shadowEll(X2, FAC.base + 4, 80 - hop) + marta12(X2, FAC.base - hop * STM / 3, 190, 204, STM, {
      expr: 'joy', talk: talkAmt(t, sc.talk), blink: blink11(T), bob: breath11(T, STM), pony: 6 * Math.sin(2 * PI * T / 1.9), armF: basketArm,
      armB: { h: [166, 80], side: 1, hand: 'open', hs: 1.3, hrot: -14 + 14 * Math.sin(2 * PI * (t - c.front) * 2.2) }, head: -3
    }) + hangItem(X2, FAC.base - hop * STM / 3, STM, 3 * Math.sin(T * 3));
    void wave;
  }
  let s = streetScene(T, { open: openU, bellAng, inside, sunX: 160, sunY: 300 });
  s += front;
  if (t >= c.open && t < c.open + 0.7) s += ringLines(FAC.door[0] + 40, FAC.doorTop + 60, pop(t, c.open, 0.3));
  s = cam(1.3 * comicZoom(t, 1.12), 650, 1060, s);
  const k = pop(t, c.bien, 0.5);
  s += at(540, 330, k, burst(0, 0, 200, T * 18, C.red));
  s += bigT('¡Bien!', 540, 330, 190, k, -6, { fill: C.yel, font: 'G' });
  return s;
};

/* ---------- 9) Apúntate al canal (medio cuerpo) + tarjeta final ---------- */
S[9] = (t, T, sc) => {
  const [k, a] = shotAt(t, sc), u = t - a;
  if (k === 'FIN') {
    let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + `<g opacity="0.35">${rays(540, 740, 16, u * 12, C.redS)}</g>`;
    const kl = pop(u, 0.02, 0.6);
    s += at(540, 735, kl, `<circle cx="14" cy="14" r="300" fill="${INK}"/><circle r="300" fill="${C.cream}" ${st11(1.2)}/>`, 0);
    s += logoPng11(540, 730, 470, -4 * (1 - kl), kl);
    s += bigT('Escaparate de Tudela', 540, 1130, 100, pop(u, 0.25, 0.5), -2, { fill: '#FFFFFF' });
    const kw = pop(u, 0.45, 0.5);
    s += at(540, 1260, kw, `<rect x="-300" y="-46" width="600" height="92" rx="46" transform="translate(8 8)" fill="${INK}"/><rect x="-300" y="-46" width="600" height="92" rx="46" fill="${C.cream}" ${st11()}/>` +
      text('escaparatetudela.es', 0, 3, { size: 52, fill: INK, stroke: null, shadow: false }));
    s += sparkle(170, 480, 30, 0.6 + 0.4 * Math.sin(T * 8)) + sparkle(920, 1000, 26, 0.6 + 0.4 * Math.sin(T * 7 + 2));
    return s;
  }
  const c = cues(sc, { title: 0.3, pulse: 4.95, strip: 6.15, sub: 7.2, web: 8.3 });
  const M = 8.3, px = 540, py = 1402, AX = 190, AY = 150;
  // cielo, sol, nubes y pájaros
  let s = `<rect width="${W}" height="${H}" fill="${C.sky}"/><rect y="1120" width="${W}" height="${H}" fill="${C.skyL}"/>`;
  s += sun(905, 760, 70, T * 12);
  s += clouds(T, 0);
  s += vBirds(T, { time: u, t0: 0.6, d: 4.6, y: 700 }) + vBirds(T, { time: u, t0: 5.6, d: 4.2, y: 820 });
  // Marta de medio cuerpo con la cesta colgada del brazo
  const talk = sc.talk || [];
  const armF = { h: [212, 119], side: 1, hand: 'fist', hs: 1.2 };
  const waveOn = u < 2.2 || (u > 6 && u < 7.6);
  const armB = waveOn ? { h: [166, 82], side: 1, hand: 'open', hs: 1.35, hrot: -12 + 16 * Math.sin(2 * PI * 2.2 * u) } : { h: [176, 140], side: 1, hand: 'fist', hs: 1.15 };
  const st = mState(u, T, M, talk, { expr: 'happy', armF, armB, noLegs: true, sit: false });
  s += marta12(px, py, AX, AY, M, st);
  // cesta colgada del antebrazo, y el antebrazo por encima del asa
  const { E, H: Hh } = ik2(SH_F, armF.h, armF.side, 17);
  const bob = st.bob || 0;
  const Ew = m12W(px, py, AX, AY, M, E[0], E[1] + bob), Hw = m12W(px, py, AX, AY, M, Hh[0], Hh[1] + bob);
  const mid = lerp2(Ew, Hw, 0.4);
  s += basketHang(mid[0], mid[1] - 10, 0.8, 2 * Math.sin(T * 2.3), T);
  s += capsule([Ew, Hw], 7 * M, C.skin, wW) + hand11('fist', Hw, wW, { hs: 1.2 * M });
  // seto en primer plano (tapa la cintura) y acera
  s += hedge(T);
  s = cam(comicZoom(u, 1.45), 540, 1000, s);
  // textos
  const kt = pop(u, c.title, 0.5) * (u > c.pulse ? 1 + 0.12 * Math.sin(PI * clamp((u - c.pulse) / 0.35)) : 1);
  s += bigT('Apúntate al canal', 540, 262, 116, kt, -3, { fill: C.yel });
  const ks = pop(u, c.strip, 0.5);
  s += at(540, 400, ks, `<rect x="-470" y="-62" width="940" height="124" rx="26" transform="translate(10 10)" fill="${INK}"/><rect x="-470" y="-62" width="940" height="124" rx="26" fill="${C.red}" ${st12()}/>` +
    text('Comenta CANAL', 0, 4, { size: 96, sw: SW * 2, sd: 6 }), -2);
  s += bigT('y te enviamos el enlace directo', 540, 528, 62, pop(u, c.sub, 0.5), 1, { fill: '#FFFFFF', maxW: 960 });
  s += at(540, 604, pop(u, c.web, 0.5), `<rect x="-230" y="-32" width="460" height="64" rx="32" transform="translate(6 6)" fill="${INK}"/><rect x="-230" y="-32" width="460" height="64" rx="32" fill="#FFFFFF" ${st12(0.8)}/>` +
    text('escaparatetudela.es', 0, 2, { size: 42, fill: INK, stroke: null, shadow: false }));
  return s;
};

/* ---------- subtítulos (solo en la versión subtitulada: node render.js subs) ---------- */
// franja inferior (y > 1400), hasta dos líneas, letra grande
function subtitle(T) {
  const c = SUBS.find(q => T >= q.start - 1e-6 && T < q.end);
  if (!c) return '';
  let size = 74, lines = wrapText(c.text, size, 960);
  while (lines.length > 2 && size > 48) { size -= 4; lines = wrapText(c.text, size, 960); }
  const lh = size * 1.2, wMax = Math.max(...lines.map(l => measure(l, size)));
  const bw = Math.min(1050, wMax + 80), bh = lines.length * lh + 44, cy = 1630;
  let s = `<rect x="${f(540 - bw / 2)}" y="${f(cy - bh / 2)}" width="${f(bw)}" height="${f(bh)}" rx="30" fill="${INK}" fill-opacity="0.86"/>`;
  const col = c.who === 'marta' ? C.yel : '#FFFFFF';
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
  let s = S[sceneId](t, T, sc);
  if (SUBS) s += subtitle(T);
  document.getElementById('dyn').innerHTML = s;
};
