/* Vídeo 16 — «El hueco de las cinco». Escenas sobre lib.js + series.js + v04…v15.js + sara.js + v16.js.
   Todo se calcula a partir de (t local de la escena, T global). Duraciones, planos (shots), tramos de boca (talk),
   momentos (cues), textos y datos del ejemplo (hora del hueco, reloj, citas) se leen de config.json.
   Franja inferior (y > 1400) libre de textos y elementos importantes; margen superior hasta y=192.
   Cortes secos entre escenas y entre planos; textos con rebote; zoom rápido tipo cómic al empezar cada plano.
   Sin audio ni subtítulos. */
'use strict';

const S = {};
const TIKTOK = () => CFG && CFG.variant === 'tiktok';
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
const TX = (key, def) => (CFG && CFG.textos && CFG.textos[key] !== undefined) ? CFG.textos[key] : def;
const sBase = (T, sc, off = 0) => ({ bob: breathA(T, sc), blink: blinkA(T, off) });
const twinkle = (x, y, r, k, u, sp = 14) => sparkle(x, y, r, k * (1 + 0.2 * Math.sin(u * sp)));
// pulsera de «tic» cómic: dos pasos de cabeza (sí)
const nod = (u, t0, d = 0.6) => (u > t0 && u < t0 + d) ? 3 * Math.sin((u - t0) / d * 2 * PI * 2) : 0;

/* ---------- 1) GANCHO: agenda a pantalla completa, hueco que late; Sara entra con las manos en la cabeza ---------- */
const AG1 = { X: 40, Y: 470, PW: 1000, PH: 920 };
S[1] = (t, T, sc) => {
  const c = cues(sc, { t1: 0.2, t2: 0.45, tag: 0.85, saraIn: 1.5 });
  const on = Math.floor(t * 3.2) % 2 === 0, kb = 1 + 0.07 * beat(t);
  let w = dotWide();
  w += tabletAgenda(AG1.X, AG1.Y, AG1.PW, AG1.PH, { on, kBeat: kb }, t);
  const [hx, hy] = huecoPos(AG1.X + 26, AG1.Y + 26, AG1.PW - 52, AG1.PH - 52);
  // ondas de «latido» alrededor del hueco
  const ph = ((t % 0.9) + 0.9) % 0.9;
  if (ph < 0.5) w += `<rect x="${f(hx - 380 - ph * 60)}" y="${f(hy - 32 - ph * 40)}" width="${f(760 + ph * 120)}" height="${f(64 + ph * 80)}" rx="${f(26 + ph * 30)}" fill="none" stroke="${C.red}" stroke-width="${f(SW * 1.2 * (1 - ph / 0.5))}"/>`;
  w += huecoTag(300, hy - 92, pop(t, c.tag, 0.5) * kb, -8, hh(EJ().hueco), 104);
  // Sara entra desde la derecha, preocupada, con las manos en la cabeza
  const u = seg(t, c.saraIn, c.saraIn + 0.45), sx = lerp(1380, 860, easeOut(u));
  if (t > c.saraIn - 0.05) {
    const sq = t > c.saraIn + 0.45 ? 1 + 0.05 * Math.max(0, damp(t - c.saraIn - 0.45, 16, 6)) : 1;
    const jig = 1.4 * Math.sin(t * 9);
    w += `<g transform="translate(${f(sx)} 1660) scale(${f(2 - sq)} ${f(sq)}) translate(${f(-sx)} -1660)">` + placeSara(sx, 1660, 5.2, Object.assign(sBase(T, 5.2, 1.6), {
      expr: 'worried', look: [-1.3, 0.5], head: -4 + 2 * Math.sin(T * 2.2),
      armBFront: true,
      armB: { h: [175.6, 70 + jig], side: 1, hand: 'open', hs: 1.2, hrot: 25, L: 19 },
      armF: { h: [204.4, 70 - jig], side: -1, hand: 'open', hs: 1.2, hrot: -25, L: 19 }
    })) + `</g>`;
    if (t > c.saraIn + 0.5) w += sweat(sx - 120, 900, 20, pop(t, c.saraIn + 0.5, 0.4), -20);
  }
  const z = lerp(1.32, 1, easeOut(t / 0.5));
  let s = camAt(z, lerp(hx, 540, easeOut(t / 0.5)), lerp(hy, 960, easeOut(t / 0.5)), 540, 960, w);
  const L = TX('s1', ['Una hora vacía', 'no se recupera']);
  s += bigT(L[0], 540, 270, 132, pop(t, c.t1, 0.5), -3);
  s += bigT(L[1], 540, 395, 132, pop(t, c.t2, 0.5), 2, { fill: C.yel });
  return s;
};

/* ---------- 2) Peluquería casi vacía; reloj 15:00; Sara mira la agenda y los sillones vacíos ---------- */
S[2] = (t, T, sc) => {
  const c = cues(sc, { clock: 0.35, t1: 0.9, t2: 1.15, lookChairs: 2.6, back: 4.9, sigh: 5.4 });
  const on = Math.floor(t * 3.2) % 2 === 0;
  let w = salonRoom(T, { tm: EJ().reloj * 60 });
  // Sara con la tableta en la mano
  const lc = easeInOut(seg(t, c.lookChairs, c.lookChairs + 0.35)), lb = easeInOut(seg(t, c.back, c.back + 0.3));
  const look = t < c.back ? lerp2([0.2, 1.4], [-1.8, 0.1], lc) : lerp2([-1.8, 0.1], [0, 0.3], lb);
  const head = t < c.back ? lerp(0, -7, lc) : lerp(-7, 0, lb);
  w += shadowEll(820, 1504, 120);
  w += placeSara(820, 1500, 5.0, Object.assign(sBase(T, 5.0, 1.1), {
    expr: t > c.sigh ? 'worried' : (t > c.lookChairs ? 'worried' : 'think'), look, head, talk: talkA(t, talkOf(sc, 'sara'), 10),
    arms: 'tablet', tabRot: -8 + 2 * Math.sin(T * 1.7), tabScreen: miniAgenda(on, 0)
  }));
  // flechita de mirada hacia los sillones
  if (t > c.lookChairs + 0.2 && t < c.back) w += `<g opacity="1">` + at(380, 1010, pop(t, c.lookChairs + 0.2, 0.4), text('?', 0, 0, { size: 120, font: 'G', fill: C.yel, sw: SW * 2, sd: 6 }), -10) + at(700, 1000, pop(t, c.lookChairs + 0.35, 0.4), text('?', 0, 0, { size: 90, font: 'G', fill: C.yel, sw: SW * 1.8, sd: 5 }), 12) + `</g>`;
  if (t > c.sigh) w += puff(690, 900, 34, pop(t, c.sigh, 0.5) * (1 - seg(t, c.sigh + 0.8, c.sigh + 1.2)));
  let s = cam(comicZoom(t, 1.12), 540, 900, w);
  s += hourBox(860, 640, EJ().reloj * 60, pop(t, c.clock, 0.5), -6, 0.85);
  const L = TX('s2', ['Hoy tiene un hueco', 'a las 5']);
  s += bigT(L[0], 540, 262, 112, pop(t, c.t1, 0.5), -3);
  s += bigT(L[1], 540, 385, 140, pop(t, c.t2, 0.5), 2, { fill: C.yel });
  return s;
};

/* ---------- 3) Nube de pensamiento con la balanza: % frente a regalo; se inclina al regalo; Sara decide ---------- */
S[3] = (t, T, sc) => {
  const c = cues(sc, { cloud: 0.25, q: 0.45, tilt: 3.0, decide: 3.45, a1: 3.55, a2: 3.8 });
  let w = camAt(1.7, 560, 980, 540, 1060, salonRoom(T, { tm: EJ().reloj * 60 + t * 2 }));
  const SX = 540, HY = 1235, SC = 9, py = HY + (208 - 76) * SC;
  const dec = t >= c.decide;
  const sc_ = (t2) => Math.sin(t2 * 11) * 6;
  const armF = !dec ? { h: [196, 100], side: -1, hand: 'point', dir: -100 + sc_(t), hs: 1.3 }
    : (t < c.decide + 0.3 ? { h: lerp2([196, 100], [221, 98], easeOut(seg(t, c.decide, c.decide + 0.3))), side: 1, hand: 'fist', hs: 1.4 }
      : { h: [221, 98 - 3 * Math.max(0, damp(t - c.decide - 0.3, 12, 5))], side: 1, hand: 'thumb', hs: 1.5 });
  w += placeSara(SX, py, SC, Object.assign(sBase(T, SC, 0.6), {
    expr: dec ? (t < c.decide + 0.5 ? 'joy' : 'determined') : 'think', talk: talkA(t, talkOf(sc, 'sara'), 10), look: dec ? [0, 0] : [0.9, -1.2],
    head: dec ? 2 * Math.sin(T * 2) + nod(t, c.decide + 0.4) : 5 + 2 * Math.sin(t * 1.3),
    armB: SP.restB, armF
  }));
  // nube de pensamiento y puntitos
  const kc = pop(t, c.cloud, 0.55);
  w += thinkDot(690, 1030, 16, pop(t, c.cloud - 0.2, 0.35)) + thinkDot(760, 975, 24, pop(t, c.cloud - 0.1, 0.35));
  w += thinkCloud(540, 700, 980, 500, kc);
  if (kc > 0.05) {
    // duda: el brazo oscila; al decidir se inclina hacia el regalo (derecha) con rebote
    const wob = tt => 11 * Math.sin((tt - c.cloud) * 4.4) * clamp((tt - c.cloud) / 0.4);
    const ang = t < c.tilt ? wob(t) : 15 + (wob(c.tilt) - 15) * damp(t - c.tilt, 9, 4);
    w += at(540, 705, kc, balance16(0, 190, 1.18, ang, t), 0);
    if (dec) w += twinkle(760, 520, 30, pop(t, c.decide, 0.4), t) + twinkle(860, 640, 22, pop(t, c.decide + 0.1, 0.4), t, 12);
  }
  let s = cam(comicZoom(t, 1.12), 540, 960, w);
  if (!dec) s += bigT(TX('s3a', '¿Descuento o regalo?'), 540, 300, 118, pop(t, c.q, 0.5), -3);
  else {
    const L = TX('s3b', ['Regalo: cuesta poco,', 'se nota mucho']);
    s += bigT(L[0], 540, 262, 100, pop(t, c.a1, 0.5), -3, { maxW: 920 });
    s += bigT(L[1], 540, 375, 122, pop(t, c.a2, 0.5), 2, { fill: C.yel });
  }
  return s;
};

/* ---------- 4) Primer plano del móvil: tarjeta de oferta flash; pulsa Publicar -> Publicada ---------- */
const PH4 = { X: 150, Y: 440, PW: 780, PH: 950 };
S[4] = (t, T, sc) => {
  const c = cues(sc, { phone: 0, t1: 0.3, t2: 0.55, seal: 0.75, fIn: 1.5, press: 2.25, done: 2.45, fOut: 3.1 });
  let w = camAt(2.1, 330, 880, 540, 960, salonRoom(T, { tm: EJ().reloj * 60 + 5 }));
  w += `<rect width="${W}" height="${H}" fill="${C.cream}" opacity="0.35"/>`;
  w += rays(540, 900, 18, t * 6, '#FFFFFF').replace(/<path /g, '<path opacity="0.35" ');
  const done = t >= c.done;
  const press = t >= c.press && t < c.done ? easeOut(seg(t, c.press, c.press + 0.1)) : 0;
  const kp = pop(t, c.phone, 0.45);
  const pc = [PH4.X + PH4.PW / 2, PH4.Y + PH4.PH / 2];
  let ph = portalPhone(PH4.X, PH4.Y, PH4.PW, PH4.PH, flashScreen16({ kSeal: pop(t, c.seal, 0.45), press, done, kDone: 1, doneT: t - c.done }, t), { hh: 1 });
  w += at(pc[0], pc[1], kp * bumpZ(t, [c.done], 0.035), `<g transform="translate(${f(-pc[0])} ${f(-pc[1])})">${ph}</g>`, lerp(-6, 0, kp));
  if (done) w += waves15(pc[0], pc[1], t, c.done, 420, 620, 0.8, 3);
  // dedo de Sara que entra, pulsa y se va
  const bx = 540 + 60, by = PH4.Y + 22 + 150 + 26 + (PH4.PH - 44 - 150 - 50) - 84 + 6;
  if (t > c.fIn && t < c.fOut + 0.5) {
    const ui = easeOut(seg(t, c.fIn, c.press)), uo = easeInOut(seg(t, c.fOut, c.fOut + 0.45));
    const dx = lerp(520, 0, ui) + lerp(0, 600, uo), dy = lerp(560, 0, ui) + lerp(0, 600, uo) + (press ? 8 : 0);
    w += saraFinger(bx + dx, by + dy, 1);
  }
  if (done) {
    w += twinkle(PH4.X + 40, PH4.Y + 260, 34, pop(t, c.done + 0.05, 0.4), t);
    w += twinkle(PH4.X + PH4.PW - 20, PH4.Y + 520, 26, pop(t, c.done + 0.15, 0.4), t, 12);
  }
  let s = cam(comicZoom(t, 1.16), 540, 900, w);
  const L = TX('s4', ['Oferta flash', 'en Escaparate']);
  s += bigT(L[0], 540, 258, 128, pop(t, c.t1, 0.5), -3, { fill: C.yel });
  s += bigT(L[1], 540, 378, 112, pop(t, c.t2, 0.5), 2);
  return s;
};

/* ---------- 5) Vibra el móvil; chat con la clienta; «¡Reservado!»; puñetazo al aire ---------- */
const PH5c = { X: 110, Y: 236, PW: 860, PH: 1150 };
S[5] = (t, T, sc) => {
  const c = cues(sc, { buzz: 0.15, grab: 0.7, lift: 1.0, typing: 0.0, msg1: 0.35, typeA: 1.05, typeB: 2.15, send: 2.3, ticks: 2.65, title: 0.1 });
  const [shot, a] = shotAt(t, sc);
  const u = t - a, E = EJ();
  const SX = 420, HY = 1150, SC = 9, py = HY + (208 - 76) * SC;
  const bg = () => camAt(1.7, 600, 1000, 540, 1000, salonRoom(T, { tm: E.reloj * 60 + 12 }));
  if (shot === 'A') {
    let w = bg();
    const P = [770, 1180];
    const grabbed = u >= c.grab + 0.22;
    // móvil en su soporte, vibrando
    if (!grabbed) {
      const sh = u > c.buzz ? 6 * Math.sin(u * 70) : 0;
      w += `<rect x="690" y="1290" width="380" height="26" rx="8" fill="#FFFFFF" ${st16(0.9)}/>`;
      w += `<path d="M${P[0] - 60} 1290 L${P[0] - 40} 1250 H${P[0] + 40} L${P[0] + 60} 1290Z" fill="${C.wood}" ${st16(0.8)}/>`;
      w += `<g transform="translate(${f(sh)} 0) rotate(${f(sh * 0.6)} ${P[0]} 1180)"><rect x="${P[0] - 62}" y="1040" width="124" height="218" rx="22" fill="${INK}" ${st16()}/><rect x="${P[0] - 50}" y="1056" width="100" height="186" rx="12" fill="${C.cream}"/><rect x="${P[0] - 50}" y="1056" width="100" height="38" fill="${C.navy}"/><rect x="${P[0] - 40}" y="1110" width="74" height="40" rx="12" fill="#FFFFFF" ${st16(0.4)}/></g>`;
      w += waves15(P[0], 1150, u, c.buzz, 90, 300, 0.7, 3) + waves15(P[0], 1150, u, c.buzz + 0.6, 90, 300, 0.7, 3);
      w += buzz15(P[0] - 62, P[0] + 62, 1150, u > c.buzz ? 1 : 0);
    } else w += `<rect x="690" y="1290" width="380" height="26" rx="8" fill="#FFFFFF" ${st16(0.9)}/>`;
    let armF;
    if (u < c.grab) armF = SP.restF;
    else if (!grabbed) armF = { h: lerp2([212, 140], sLoc(SX, py, SC, P[0], P[1]), easeOut(seg(u, c.grab, c.grab + 0.22))), side: -1, hand: 'open', hs: 1.3 };
    else armF = { h: lerp2(sLoc(SX, py, SC, P[0], P[1]), [212, 108], easeInOut(seg(u, c.grab + 0.22, c.lift + 0.3))), side: 1, hand: 'phone', hs: 1.55, screen: 'chat', rot: -8 };
    w += placeSara(SX, py, SC, Object.assign(sBase(T, SC, 2), {
      expr: u > c.buzz + 0.1 ? 'surprise' : 'happy', look: grabbed ? [1, -0.2] : [1.6, 1.1], head: u > c.buzz ? 4 : 0, armB: SP.restB, armF
    }));
    w += mark('!', 260, 860, pop(u, c.buzz + 0.15, 0.4), -12, 170, C.yel);
    return cam(comicZoom(u, 1.12), 540, 960, w);
  }
  if (shot === 'B') {
    let w = camAt(2.3, 600, 1000, 540, 1000, salonRoom(T, { tm: E.reloj * 60 + 12 }));
    w += `<rect width="${W}" height="${H}" fill="${P16.purple}" opacity="0.25"/>`;
    const reply = TX('chatSara', `¡Reservado! Te espero a las ${hh(E.hueco)}.`);
    const n = Math.round(clamp((u - c.typeA) / (c.typeB - c.typeA)) * reply.length);
    const msgs = [
      { who: 'c', text: TX('chatClienta', 'Hola, he visto tu oferta en Escaparate de Tudela. ¿Me reservas esa hora?'), k: pop(u, c.msg1, 0.45), hhmm: `${E.reloj}:12` },
      { who: 'm', text: reply, k: pop(u, c.send + 0.02, 0.45), ticks: pop(u, c.ticks, 0.35), hhmm: `${E.reloj}:13` }
    ];
    const typing = u >= c.typeA && u < c.send ? reply.slice(0, n) : '';
    const ph = portalPhone(PH5c.X, PH5c.Y, PH5c.PW, PH5c.PH, chatScreen16(msgs, { input: typing, caret: u >= c.typeA - 0.3 && u < c.send, send: u >= c.send ? Math.max(0, damp(u - c.send, 14, 6)) : 0, typing: u < c.msg1 }, u), { hh: 1 });
    const pc = [PH5c.X + PH5c.PW / 2, PH5c.Y + PH5c.PH / 2];
    w += cam(bumpZ(u, [c.msg1, c.send], 0.03), pc[0], pc[1], ph);
    w += waves15(pc[0], 520, u, c.msg1, 440, 640, 0.8, 3);
    w += buzz15(PH5c.X, PH5c.X + PH5c.PW, 600, (u >= c.msg1 && u < c.msg1 + 0.45) ? 1 - (u - c.msg1) / 0.45 : 0);
    if (u > c.ticks) w += twinkle(PH5c.X + PH5c.PW - 10, 900, 32, pop(u, c.ticks, 0.4), u);
    return cam(comicZoom(u, 1.1), 540, 900, w);
  }
  // C: Sara contenta, puñetazo al aire, con el móvil en la otra mano
  let w = bg();
  const pump = Math.max(0, Math.sin(u * 2 * PI / 0.5));
  w += placeSara(SX + 120, py, SC, Object.assign(sBase(T, SC, 0.4), {
    expr: 'joy', head: 3 * Math.sin(u * 6),
    armF: { h: [215, lerp(70, 62, pump)], side: 1, hand: 'fist', hs: 1.55, L: 19 },
    armB: { h: [164, 116], side: 1, hand: 'phone', hs: 1.5, screen: 'chat', rot: 8 }
  }));
  const [fx, fy] = sPt(SX + 120, py, SC, 215, 62);
  w += twinkle(fx + 90, fy - 30, 34, pop(u, 0.1, 0.4), u) + twinkle(fx - 120, fy + 20, 24, pop(u, 0.2, 0.4), u, 12);
  w += mark('!', fx - 170, fy - 30, pop(u, 0.15, 0.4), -14, 150, C.yel);
  let s = cam(comicZoom(u, 1.14), 540, 960, w);
  s += rubberStamp(TX('s5', 'Reservado'), 540, 330, pop(u, c.title, 0.45), -6, C.green);
  return s;
};

/* ---------- 6) Exterior, 17:00: llega la clienta; Sara abre la puerta; la clienta enseña la tarjeta ---------- */
const FAC6 = { top: 430, base: 1330 };
S[6] = (t, T, sc) => {
  const c = cues(sc, { clock: 0.2, title: 0.55, arrive: 2.0, ring: 2.05, open: 2.3, wave: 2.75, show: 3.4, look: 3.9, thumb: 4.6 });
  let w = sky13(T, 'eve', { band: 330, sx: 900, sy: 300, sr: 56 });
  const ring = t > c.ring && t < c.ring + 0.9 ? 1 : 0, bellAng = t > c.ring ? 22 * damp(t - c.ring, 14, 3) : 0;
  const op = easeOut(seg(t, c.open, c.open + 0.45));
  w += salonFacade(FAC6.top, FAC6.base, T, {
    doorOpen: op, bellAng, ring: ring * (0.7 + 0.3 * Math.sin(t * 30)),
    inside: (dx, dy, dw, dh) => {
      if (op <= 0.02) return '';
      const sx = dx + dw * 0.56, s1 = 3.55;
      let o = { expr: t > c.thumb ? 'proud' : 'smile', talk: talkA(t, talkOf(sc, 'sara'), 10), look: t > c.look ? [-1.4, 0.5] : [0, 0], head: t > c.look ? -4 : 0 };
      if (t > c.thumb) o.armF = { h: [221, 98 - 3 * Math.max(0, damp(t - c.thumb, 12, 5))], side: 1, hand: 'thumb', hs: 1.5 };
      else if (t > c.wave) o.armF = { h: [224, 80], side: 1, hand: 'open', hs: 1.45, hrot: 18 * Math.sin((t - c.wave) * 9) };
      else o.armF = SP.restF;
      o.armB = { h: [164, 124], side: 1, hand: 'open', hs: 1.3, hrot: -30 };
      return placeSara(sx, dy + dh - 4, s1, Object.assign(sBase(T, s1, 0.8), o));
    }
  });
  w += ground(FAC6.base, 0, { sp: 230 });
  // la clienta llega andando y se para delante del escaparate
  const ua = seg(t, 0, c.arrive), cx = lerp(-180, 430, easeOut(ua * 0.9 + ua * 0.1 * ua));
  const walking = t < c.arrive;
  const cs = 4.1, cf = 1470;
  let armF = walking ? { h: [212 + 4 * Math.sin(t * 9.4), 140], side: -1, hand: 'fist', hs: 1.2 } : { h: [212, 140], side: -1, hand: 'fist', hs: 1.2 };
  if (t > c.show) armF = { h: lerp2([212, 140], [226, 102], easeOut(seg(t, c.show, c.show + 0.3))), side: 1, hand: 'phone', hs: 1.7, rot: 14 };
  w += shadowEll(cx, cf + 4, 100);
  w += placeClienta(cx, cf, cs, Object.assign(sBase(T, cs, 1.7), {
    expr: t > c.show ? 'joy' : 'smile', talk: talkA(t, talkOf(sc, 'clienta'), 10), walk: walking ? t * 9.4 : undefined, bob: (walking ? -1.5 * Math.abs(Math.sin(t * 9.4)) : 0) + breathA(T, cs),
    look: t > c.open ? [1.2, 0] : [0.6, 0], head: walking ? 2 * Math.sin(t * 9.4) : (t > c.open ? 4 : 0), sway: walking ? 4 * Math.sin(t * 9.4) : 2 * Math.sin(T * 2),
    armB: { h: [168 - 4 * Math.sin(t * 9.4) * (walking ? 1 : 0), 140], side: 1, hand: 'fist', hs: 1.2 }, armF
  }));
  if (t > c.show) { const [px, py] = sPt(cx, cf, cs, 226, 88); w += twinkle(px + 70, py - 40, 26, pop(t, c.show + 0.2, 0.4), t); }
  let s = cam(comicZoom(t, 1.12), 540, 900, w);
  s += hourBox(270, 420, EJ().hueco * 60, pop(t, c.clock, 0.5), -6, 0.95);
  s += bigT(TX('s6', 'A las 5, puntual'), 540, 262, 124, pop(t, c.title, 0.5), -3, { fill: C.yel });
  return s;
};

/* ---------- 7) Interior: lavado con espuma y corte con tijeras; agenda en la esquina, hueco ocupado ---------- */
S[7] = (t, T, sc) => {
  const c = cues(sc, { title: 0.35, tick: 0.7, rinse: 2.3, cut: 2.7 });
  let w = salonRoom(T, { tm: EJ().hueco * 60 + 10 + t * 2, chairs: [false, true] });
  const CX = 205, CS = 4.6, foam = t < c.rinse ? pop(t, 0, 0.35) : 1 - easeOut(seg(t, c.rinse, c.rinse + 0.3));
  w += seatedClient(CX, ROOM.floor, CS, Object.assign(sBase(T, CS, 1.3), {
    expr: t < c.rinse ? 'joy' : 'smile', look: t > c.cut ? [0.6, -0.4] : [0, 0], towel: true, wet: t > c.rinse, head: t < c.rinse ? 2 * Math.sin(t * 6) : 0,
    foam: foamL(t, foam)
  }));
  if (t > c.rinse && t < c.rinse + 0.6) w += puff(CX, 640, 70, pop(t, c.rinse, 0.3) * (1 - seg(t, c.rinse + 0.3, c.rinse + 0.6)));
  // Sara de pie a su lado: frota la espuma y luego peina y corta
  const SX = 400, SC = 4.6, washing = t < c.rinse;
  const head = sLoc(SX, ROOM.floor, SC, CX, 690);
  let armB, armF;
  if (washing) {
    const ph = t * 10;
    armB = { h: [head[0] + 6 * Math.sin(ph), head[1] - 8 + 3 * Math.cos(ph)], side: 1, hand: 'open', hs: 1.25, hrot: -60 + 10 * Math.sin(ph), L: 21 };
    armF = { h: [214, 120], side: -1, hand: 'fist', hs: 1.2, item: (H, w2) => bottle16(H[0], H[1] + 6, 0, 0.12) };
  } else {
    const cu = t - c.cut, cutOpen = 0.5 + 0.5 * Math.sin(cu * 18);
    const comb = sLoc(SX, ROOM.floor, SC, CX + 96 + 4 * Math.sin(t * 5), 770 + 30 * Math.sin(t * 5));
    armB = { h: comb, side: 1, hand: 'fist', hs: 1.2, L: 21, over: (H, w2) => combL(H[0] + 2, H[1] - 4, -70, 0.9, w2) };
    const sc_ = sLoc(SX, ROOM.floor, SC, CX + 112, 850);
    armF = { h: t > c.cut ? sc_ : lerp2([214, 120], sc_, easeOut(seg(t, c.rinse, c.cut))), side: -1, hand: 'fist', hs: 1.2, L: 21, over: (H, w2) => scissorsL(H[0] - 3, H[1] - 2, -150, t > c.cut ? cutOpen : 0.2, 0.9, w2) };
  }
  w += placeSara(SX, ROOM.floor + 6, SC, Object.assign(sBase(T, SC, 0.2), { expr: washing ? 'smile' : 'proud', look: [-1.4, 0.4], head: -4, armB, armF }));
  // pelitos que caen al cortar
  if (t > c.cut) for (let i = 0; i < 6; i++) {
    const v = ((t - c.cut) * 1.3 + i / 6) % 1, x = CX + 100 + 10 * Math.sin(i * 2.1 + v * 5), y = 850 + v * 300;
    w += `<path d="M${f(x)} ${f(y)} q6 -4 12 0" stroke="${CL.hairS}" stroke-width="${f(SW * 0.6)}" fill="none" stroke-linecap="round"/>`;
  }
  let s = camAt(lerp(1.62, 1.45, easeOut(t / 0.25)), 320, 880, 430, 960, w);
  // agenda en la esquina: el hueco ya ocupado con tic verde
  const E = EJ(), ka = pop(t, 0.15, 0.45);
  s += at(860, 650, ka, `<g transform="translate(-170 -205)">` + tabletAgenda(-20, 0, 380, 410, { rows: [E.hueco - 1, E.hueco, E.hueco + 1], hdr: 72, tcol: 116, filled: 1, tickT: t - c.tick, size: 40, bezel: 20, r: 34 }, t) + `</g>`, 4);
  s += bigT(TX('s7', 'Hueco ocupado'), 540, 290, 132, pop(t, c.title, 0.5), -3, { fill: C.yel });
  return s;
};

/* ---------- 8) Primer plano de Sara: se acerca a cámara; cómplice ---------- */
function closeRoom8(T) {
  let s = dotWide();
  s += eveWindow(190, 360, 700, 620, T, { fr: 26, sr: 60, cs: 1 });
  s += shelf16(-40, 150, 760, 3, 0.9) + shelf16(930, 1120, 700, 4, 0.9);
  s += mirror16(960, 900, 260, 420);
  s += `<rect x="-400" y="1370" width="${W + 800}" height="700" fill="#FFFFFF"/><line x1="-400" y1="1370" x2="${W + 400}" y2="1370" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
  return s;
}
S[8] = (t, T, sc) => {
  const c = cues(sc, { dolly: [0.0, 1.35], t1: 1.45, t2: 1.75, wink: 3.2 });
  const e = easeInOut(seg(t, c.dolly[0], c.dolly[1]));
  const SC = Math.exp(lerp(Math.log(5.4), Math.log(15.5), e)), HY = lerp(930, 1010, e);
  let w = cam(lerp(1, 1.14, e), 540, 700, closeRoom8(T));
  const tr = talkOf(sc, 'sara');
  const wink = t > c.wink && t < c.wink + 0.55;
  w += placeSara(540, HY + (208 - 76) * SC, SC, Object.assign(sBase(T, SC, 0.5), {
    expr: wink ? 'cheeky' : (t > c.dolly[1] ? 'smile' : 'happy'), talk: wink ? 0 : talkA(t, tr, 10), head: 3 * Math.sin(T * 1.6) + (wink ? 5 : 0),
    armB: SP.restB, armF: SP.restF, blink: wink ? false : blinkA(T, 0.5)
  }));
  if (e > 0.05 && e < 0.95) w += speedLinesRadial(540, 900, Math.sin(PI * e));
  if (wink) w += twinkle(780, 760, 36, pop(t, c.wink, 0.35), t);
  let s = w;
  const L = TX('s8', ['Las horas vacías,', 'con partido']);
  s += bigT(L[0], 540, 262, 116, pop(t, c.t1, 0.5), -3);
  s += bigT(L[1], 540, 385, 140, pop(t, c.t2, 0.5), 2, { fill: C.yel });
  return s;
};

/* ---------- 9) CIERRE: Sara delante de la puerta; textos para comercios; tarjeta final ---------- */
function planter(y0) {
  let s = `<rect x="-30" y="${y0 + 40}" width="${W + 60}" height="${H - y0}" fill="${C.ground}"/>`;
  // seto con flores y jardinera de madera
  let a = '';
  for (let x = -40; x < W + 60; x += 58) a += `<circle cx="${x}" cy="${f(y0 + 18 + 8 * Math.sin(x))}" r="40"/>`;
  s += `<g fill="${INK}" stroke="${INK}" stroke-width="${f(SW * 2)}">${a}</g><g fill="${C.green}">${a}</g>`;
  for (let x = -10; x < W + 40; x += 92) s += `<circle cx="${x + 20}" cy="${f(y0 + 4 + 6 * Math.sin(x * 1.3))}" r="12" fill="${(x / 92) % 2 ? C.pink : C.yel}" ${st16(0.6)}/>`;
  s += `<rect x="-30" y="${y0 + 36}" width="${W + 60}" height="150" fill="${C.wood}" ${st16()}/>`;
  s += `<path d="M-30 ${y0 + 86} H${W + 30} M-30 ${y0 + 136} H${W + 30}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
  return s;
}
S[9] = (t, T, sc) => {
  const c = cues(sc, { q1: 0.3, q2: 0.55, strip: 1.4, com: 2.3, url: 3.0, wave: 0.2, point: 1.4, thumb: 5.2, wink: 7.4 });
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
  let w = sky13(T, 'eve', { band: 560, sx: 930, sy: 300, sr: 54 });
  w += flocks(u, FLOCK16);
  w += salonFacade(740, 1395, T, {});
  const SC = 5.0, waist = 1392, py = waist + (208 - 150) * SC;
  const tr = talkOf(sc, 'sara'), talking = talkA(u, tr, 10);
  let armF, armB = SP.restB, expr = 'smile';
  if (u < c.point - 0.2) armF = { h: [224, 80], side: 1, hand: 'open', hs: 1.45, hrot: 16 * Math.sin(u * 9) };
  else if (u < c.thumb) armF = { h: [226, 76 + 2 * Math.sin(u * 5)], side: 1, hand: 'point', dir: -70, hs: 1.5 };
  else armF = { h: [221, 98 - 3 * Math.max(0, damp(u - c.thumb, 12, 5))], side: 1, hand: 'thumb', hs: 1.5 };
  if (u > c.thumb) expr = 'joy';
  const wink = u > c.wink && u < c.wink + 0.6;
  if (wink) expr = 'cheeky';
  if (u > c.com && u < c.thumb) armB = { h: [164, 118], side: 1, hand: 'open', hs: 1.3, hrot: -20 + 10 * Math.sin(u * 3) };
  w += placeSara(540, py, SC, Object.assign(sBase(T, SC, 0.9), { expr, talk: wink ? 0 : talking, head: 3 * Math.sin(T * 1.7), armF, armB }));
  w += planter(1392);
  let s = cam(comicZoom(u, 1.12), 540, 900, w);
  // al decir «comenta alta» (solo Instagram), desaparecen los textos de arriba y queda «Comenta ALTA» en grande
  if (!TIKTOK() && u >= c.com) {
    const k = pop(u, c.com, 0.5);
    s += bigT(TX('s9f', 'Comenta'), 540, 330, 170, k, -4);
    s += strip15(TX('s9g', 'ALTA'), 540, 560, pop(u, c.com + 0.18, 0.5), 3, { size: 230, h: 260, w: 700, fill: C.yel });
    return s;
  }
  s += bigT(TX('s9a', '¿Tienes un comercio'), 540, 250, 104, pop(u, c.q1, 0.5), -3);
  s += bigT(TX('s9b', 'o un servicio?'), 540, 362, 118, pop(u, c.q2, 0.5), 2, { fill: C.yel });
  s += strip15(TX('s9c', 'Formulario en la descripción'), 540, 492, pop(u, c.strip, 0.5), -2, { size: 72, h: 118 });
  s += whoPill(TX('s9e', 'escaparatetudela.es'), 540, 612, pop(u, c.url, 0.5), { size: 44 });
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
    // los logos se dibujan en un cuadro de 500 (coordenadas de recorte de la serie)
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
