/* Vídeo 17 — «Próxima apertura» (teaser). Escenas sobre lib.js + series.js + v04…v16.js + maria.js + v17.js.
   Todo se calcula a partir de (t local de la escena, T global). Duraciones, momentos (cues), tramos de boca (talk)
   y textos se leen de config17.json. Franja inferior (y > 1400) libre de textos y elementos importantes;
   margen superior hasta y=192. Cortes secos entre escenas; textos con rebote; cada escena con movimiento.
   Sin audio ni subtítulos (segunda pasada). */
'use strict';

const S = {};
const comicZoom = (u, from = 1.12) => lerp(from, 1, easeOut(u / 0.22));
const cues = (sc, def) => Object.assign({}, def, sc.cues || {});
const bumpZ = (t, times, a = 0.03) => 1 + times.reduce((m, t0) => m + (t >= t0 ? a * Math.max(0, damp(t - t0, 14, 6)) : 0), 0);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const talkOf = (sc, who = 'maria') => (sc.talk && sc.talk[who]) || [];
const TX = (key, def) => (CFG && CFG.textos && CFG.textos[key] !== undefined) ? CFG.textos[key] : def;
const inR = (t, rs) => rs.some(([a, b]) => t >= a && t < b);
// María colocada por la cintura (local 142) en waistY
const mariaW = (x, waistY, sc, o) => placeMaria(x, mWaist(waistY, sc), sc, o);

/* ---------- 1) HOOK: María muy grande, ceja levantada, gesto de «espera» ---------- */
S[1] = (t, T, sc) => {
  const c = cues(sc, { zoom: 0.28, t1: 0.2, t2: 0.55, wag: 0.5 });
  let s = sky17(T);
  const SC = 13, tr = talkOf(sc);
  const wag = t > c.wag ? 9 * Math.sin((t - c.wag) * 11) * Math.exp(-0.4 * (t - c.wag)) : 0;
  let w = mariaBrow(mariaW(540, 1545, SC, Object.assign(mBase(T, SC, 0.7), {
    expr: 'happy', talk: talkA(t, tr, 10), head: 5 + 1.5 * Math.sin(T * 1.8),
    armF: mArm(true, [223, 97], 'count', { n: 1, hs: 1.45, hrot: wag }),
    armB: M_REST_B()
  })));
  const z = lerp(0.9, 1, easeOut(seg(t, 0, c.zoom))) * bumpZ(t, [c.t1, c.t2], 0.015);
  s += cam(z, 540, 1150, w);
  if (t < c.zoom + 0.15) s += speedLinesRadial(540, 900, 1 - seg(t, 0, c.zoom + 0.15));
  s += bigT(TX('s1a', '¿ERES DE TUDELA?'), 540, 262, 150, pop(t, c.t1, 0.5), -3, { fill: C.yel, maxW: 980 });
  s += strip15(TX('s1b', 'ESPERA, ESTO TE INTERESA'), 540, 410, pop(t, c.t2, 0.5), 2, { size: 64, h: 104, w: 860 });
  return s;
};

/* ---------- 2) EL ESCAPARATE: persiana bajada; golpe del cartel; María mira el cartel y a cámara; «¿QUÉ ES?» ---------- */
S[2] = (t, T, sc) => {
  const c = cues(sc, { slam: 0.55, look: 2.3, que: 4.25 });
  let w = storefront17(T);
  // cartel: entra grande y golpea (escala 1,9 -> 1 en 0,14 s), luego vibra
  const sEnd = c.slam + 0.14;
  let kS = 0, sh = 0;
  if (t >= c.slam) {
    const u = seg(t, c.slam, sEnd);
    kS = t < sEnd ? lerp(1.9, 1, u * u) : 1 + 0.05 * damp(t - sEnd, 30, 8);
    if (t >= sEnd) sh = 12 * damp(t - sEnd, 44, 7);
  }
  if (kS > 0) w += aperturaSign(kS, sh);
  if (t > sEnd && t < sEnd + 0.6) {
    const kp = pop(t, sEnd, 0.3) * (1 - seg(t, sEnd + 0.3, sEnd + 0.6));
    w += puff(APERTURA.x - 330, APERTURA.y + 150, 44, kp) + puff(APERTURA.x + 330, APERTURA.y + 150, 44, kp) + puff(APERTURA.x + 320, APERTURA.y - 150, 34, kp);
  }
  // María pequeña, a la derecha, delante de la persiana: mira el cartel (lo señala) y luego a cámara
  const SC = 3.7, mx = 900, foot = 1404, looking = t < c.look;
  const lk = easeInOut(seg(t, c.look, c.look + 0.3));
  w += shadowEll(mx, foot + 2, 120);
  w += placeMaria(mx, foot, SC, Object.assign(mBase(T, SC, 1.2), {
    expr: t > c.slam && t < c.slam + 0.9 ? 'surprise' : (looking ? 'happy' : 'sparkle'), talk: talkA(t, talkOf(sc), 10),
    head: lerp(-12, 3 * Math.sin(T * 2), lk),
    armB: t > c.slam + 0.25 && looking ? mArm(false, [158, 108], 'point', { dir: -165, hs: 1.4 }) : M_REST_B(),
    armF: looking ? M_REST_F() : mArm(true, [222, 100], 'thumb', { hs: 1.45 })
  }));
  if (t > c.slam + 0.1 && t < c.look) w += mark('!', mx + 10, 760, pop(t, c.slam + 0.1, 0.4), 10, 130, C.yel);
  // cámara: corte seco con zoom de impacto y dolly-in lento; sacudida al golpe
  const dz = lerp(1, 1.12, easeInOut(seg(t, 0, sc.duration)));
  const shk = t >= sEnd ? 10 * damp(t - sEnd, 50, 9) : 0;
  let s = cam(comicZoom(t, 1.1) * dz, 560, 900, w, shk, shk * 0.6);
  // segundo cartel «¿QUÉ ES?» que cae delante con rebote
  if (t >= c.que) {
    const p = pop(t, c.que, 0.6), y = lerp(-320, 1150, p), rot = 5 + 7 * damp(t - c.que - 0.25, 11, 4);
    s += at(560, y, 1, redSign17(640, 270, [[TX('s2b', '¿QUÉ ES?'), 160, 6]], { tape: false }), rot);
  }
  return s;
};

/* ---------- 3) QUÉ ES: interior; María habla; móvil grande con el feed de ofertas, novedades y eventos ---------- */
const PH17 = { X: 560, Y: 400, PW: 480, PH: 960 };
S[3] = (t, T, sc) => {
  const c = cues(sc, { phoneIn: 0.6, slide: 0.6, cards: [1.6, 3.8, 6.0, 8.2], labels: [1.7, 3.9, 6.1] });
  let w = room17(T);
  const SC = 9.5, tr = talkOf(sc), talking = inR(t, tr);
  const mx = lerp(540, 300, easeInOut(seg(t, c.slide, c.slide + 0.5)));
  // señala al móvil un momento cada vez que entra una tarjeta
  const pointing = c.cards.slice(0, 3).some(t0 => t >= t0 && t < t0 + 0.9);
  w += mariaW(mx, 1420, SC, Object.assign(mBase(T, SC, 0.3), {
    expr: pointing ? 'sparkle' : 'happy', talk: talkA(t, tr, 10), head: 3 * Math.sin(T * 1.7) + (pointing ? 4 : 0),
    armB: mGestB(t, talking ? 1 : 0),
    armF: pointing ? mArm(true, [224, 112], 'point', { dir: -8, hs: 1.4 }) : mGestF(t, talking ? 1 : 0)
  }));
  let s = cam(comicZoom(t, 1.1), 540, 960, w);
  // móvil grande que entra por la derecha
  const kp = pop(t, c.phoneIn, 0.6), bob = 8 * Math.sin(T * 1.8);
  if (t >= c.phoneIn) {
    const ks = c.cards.map(t0 => pop(t, t0, 0.5));
    const ph = portalPhone(PH17.X, PH17.Y + bob, PH17.PW, PH17.PH, feedBody17(ks, t), { hh: 150 });
    const pc = [PH17.X + PH17.PW / 2, PH17.Y + PH17.PH / 2];
    const dx = (1 - kp) * 640;
    s += `<g transform="translate(${f(dx)} 0) rotate(${f((1 - kp) * 14)} ${pc[0]} ${pc[1]})">` + cam(bumpZ(t, c.cards, 0.035), pc[0], pc[1], ph) + `</g>`;
    c.cards.forEach((t0, i) => { if (t > t0 && t < t0 + 0.8) s += sparkle(PH17.X + (i % 2 ? 20 : PH17.PW - 20), PH17.Y + 420 + bob, 30, pop(t, t0 + 0.05, 0.4) * (1 - seg(t, t0 + 0.5, t0 + 0.8))); });
  }
  // etiquetas sincronizadas con lo que dice
  const LB = [[TX('s3a', 'OFERTAS'), C.red, '#FFFFFF'], [TX('s3b', 'NOVEDADES'), C.navy, '#FFFFFF'], [TX('s3c', 'EVENTOS'), C.yel, INK]];
  LB.forEach(([str, fill, col], i) => {
    const k = pop(t, c.labels[i], 0.5);
    if (k > 0.01) s += at(285, 300 + i * 108, 1, pill(0, 0, measure(str, 50) + 90, 86, fill, str, { size: 50, col, pad: 60 }), [-4, 3, -2][i] * k);
  });
  return s;
};

/* ---------- 4) CLIENTES: plano más cerrado de la persiana; iconos al decir «beneficiarnos»; corazón en el cartel ---------- */
S[4] = (t, T, sc) => {
  const c = cues(sc, { benef: 1.4, icons: [1.4, 1.62, 1.84], local: 3.6, heart: 3.5 });
  let w = storefront17(T) + aperturaSign(1, 0);
  const SC = 4.6, mx = 920, foot = 1404, tr = talkOf(sc), talking = inR(t, tr);
  const open = t >= c.benef && t < c.local - 0.2, hrt = t >= c.local;
  w += shadowEll(mx, foot + 2, 140);
  w += placeMaria(mx, foot, SC, Object.assign(mBase(T, SC, 2.1), {
    expr: hrt ? 'joy' : (open ? 'sparkle' : 'happy'), talk: talkA(t, tr, 10), head: 3 * Math.sin(T * 1.9),
    armB: open ? mArm(false, [154, 104], 'open', { hs: 1.45, hrot: -25 + 6 * Math.sin(t * 6) }) : mGestB(t, talking ? 1 : 0),
    armF: hrt ? mArm(true, [197, 128], 'heart', { hs: 1.45 }) : (open ? mArm(true, [226, 104], 'open', { hs: 1.45, hrot: 25 - 6 * Math.sin(t * 6) }) : mGestF(t, talking ? 1 : 0))
  }));
  const z = 1.2 * comicZoom(t, 1.1) * bumpZ(t, [c.benef, c.local], 0.02);
  let s = camAt(z, 640, 900, 540, 900, w);
  // tres iconos sobre la persiana (descuentos, corazón, bolsa)
  const IC = [[175, 1170], [395, 1250], [615, 1170]];
  c.icons.forEach((t0, i) => {
    const k = pop(t, t0, 0.5), [x, y0] = IC[i], y = y0 + 8 * Math.sin(T * 2.4 + i);
    if (k <= 0.01) return;
    s += iconDisc17(x, y, 96, k);
    if (i === 0) s += pctTag17(x, y + 6, 58 * k, 1);
    if (i === 1) s += heart17(x, y + 6, 54 * k, 1, C.pink);
    if (i === 2) s += shopBag17(x, y + 14, 58 * k, 1);
  });
  // corazón rojo grande que late sobre el cartel de «Próxima apertura»
  if (t >= c.heart) {
    const u = t - c.heart, kb = pop(t, c.heart, 0.5) * (1 + 0.1 * Math.max(0, Math.sin(u * 2 * PI / 0.75)) ** 3);
    const hx = 540 + (APERTURA.x - 640) * 1.2, hy = 900 + (APERTURA.y - 225 - 900) * 1.2;
    s += heart17(hx, hy, 115, kb, C.red, -6);
    if (u > 0.2) s += sparkle(hx - 150, hy - 70, 28, pop(t, c.heart + 0.2, 0.4)) + sparkle(hx + 130, hy + 110, 22, pop(t, c.heart + 0.3, 0.4));
  }
  return s;
};

/* ---------- 5) CTA CLIENTES: María a medio cuerpo con espacio arriba; canal de WhatsApp; enlace; «comenta CANAL» ---------- */
S[5] = (t, T, sc) => {
  const c = cues(sc, { card: 0.3, link: 1.2, strip: 2.4, com: 4.5 });
  let w = `<rect x="-400" y="-400" width="${W + 800}" height="${H + 800}" fill="#BFE3F2"/>`;
  w += rays(540, 420, 18, t * 6, '#FFFFFF').replace(/<path /g, '<path opacity="0.4" ');
  w += `<rect x="-400" y="1300" width="${W + 800}" height="900" fill="#E4F4FA"/>`;
  const SC = 10, tr = talkOf(sc), talking = inR(t, tr);
  const up = 6 * Math.sin(t * 4.5);
  w += mariaW(540, 1480, SC, Object.assign(mBase(T, SC, 1.4), {
    expr: t >= c.com ? 'sparkle' : 'happy', talk: talkA(t, tr, 10), head: 3 * Math.sin(T * 1.6),
    armF: mArm(true, [225, 88 + up * 0.3], 'point', { dir: -78 + up, hs: 1.45 }),
    armB: t >= c.com ? mArm(false, [155, 90], 'open', { hs: 1.45, hrot: -20 + 8 * Math.sin(t * 7) }) : mGestB(t, talking ? 1 : 0)
  }));
  let s = cam(comicZoom(t, 1.12) * bumpZ(t, [c.card, c.strip, c.com], 0.02), 540, 1000, w);
  // al decir «comenta CANAL» (solo Instagram) desaparece lo de arriba y queda «Comenta CANAL» en grande (regla del vídeo 16)
  if (t >= c.com) {
    s += bigT(TX('s5d', 'Comenta'), 540, 320, 170, pop(t, c.com, 0.5), -4);
    s += strip15(TX('s5e', 'CANAL'), 540, 540, pop(t, c.com + 0.18, 0.5), 3, { size: 210, h: 240, w: 720, fill: C.yel });
    return s;
  }
  s += waCard17(540, 282, pop(t, c.card, 0.5), -2);
  const kl = pop(t, c.link, 0.5);
  if (kl > 0.01) {
    s += at(500, 430, kl, text(TX('s5b', 'Enlace en la descripción'), 0, 0, { size: 62, sw: SW * 1.7, sd: 5 }));
    s += arrowDown17(880, 395, 70, pop(t, c.link + 0.15, 0.45), t);
  }
  s += strip15(TX('s5c', 'COMENTA: CANAL'), 540, 560, pop(t, c.strip, 0.5), -2, { size: 82, h: 118, w: 760 });
  return s;
};

/* ---------- 6) CTA COMERCIOS: María delante del local; tarjeta «¿Tienes un comercio?» con el correo ---------- */
S[6] = (t, T, sc) => {
  const c = cues(sc, { card: 0.3, btn: 0.6, mail: 0.9, small: 1.3, press: 2.6 });
  // (sin el cartel de «Próxima apertura»: en este plano manda la tarjeta)
  let w = storefront17(T);
  let s = cam(comicZoom(t, 1.1) * lerp(1, 1.06, easeInOut(seg(t, 0, sc.duration))), 540, 900, w);
  const SC = 6.5, mx = 800, foot = 1372, tr = talkOf(sc);
  const kc = pop(t, c.card, 0.55);
  s += placeMaria(mx, foot, SC, Object.assign(mBase(T, SC, 0.9), {
    expr: kc > 0.5 ? 'sparkle' : 'happy', talk: talkA(t, tr, 10), head: -4 + 2 * Math.sin(T * 1.8),
    armB: kc > 0.05 ? mArm(false, [154, 95 + 2 * Math.sin(t * 6)], 'point', { dir: 100, hs: 1.45 }) : M_REST_B(),
    armF: M_REST_F()
  }));
  // tarjeta grande centrada (y de 810 a 1290), con rebote
  const press = t >= c.press && t < c.press + 0.25 ? Math.sin(seg(t, c.press, c.press + 0.25) * PI) : 0;
  if (kc > 0.01) s += at(540, 1050, kc, infoCard17(t, pop(t, c.btn, 0.5), pop(t, c.mail, 0.5), pop(t, c.small, 0.5), press), lerp(-4, 0, clamp(kc)));
  return s;
};

/* ---------- 7) CIERRE: pantalla roja, logo blanco con rebote, «Próxima apertura · diciembre», web; pulso suave ---------- */
S[7] = (t, T, sc) => {
  const c = cues(sc, { logo: 0, sub: 0.45, url: 0.7 });
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 700, 16, t * 8, C.dred);
  const pulse = 1 + 0.03 * Math.sin(t * 2 * PI * 1.1);
  const kl = pop(t, c.logo, 0.5);
  // logo_blanco.png (icono + «ESCAPARATE DE TUDELA» en letras blancas)
  s += at(540, 700, pulse, logoBadge(0, 6 * Math.sin(t * 3), 840, lerp(-10, 0, clamp(kl)), kl, 'logoW'));
  s += bigT(TX('s7a', 'Próxima apertura · diciembre'), 540, 1170, 84, pop(t, c.sub, 0.5) * pulse, -2, { fill: C.yel, maxW: 960 });
  const url = TX('s7b', 'escaparatetudela.es');
  s += whoPill(url, 540, 1300, pop(t, c.url, 0.5), { size: 56, col: INK });
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
  for (const [id, url, iw, ih] of logos) {
    const img = new Image(); img.src = url; await img.decode();
    const el = document.createElementNS(ns, 'image');
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
