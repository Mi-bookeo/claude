/* Vídeo 11 — «4 motivos para estar en el canal». Escenas sobre lib.js + series.js + rosa.js + v04…v11.js.
   Todo se calcula a partir de (t local de la escena, T global). Duraciones, planos (shots) y tramos en que Marta
   habla (talk) se leen de config.json. Franja inferior (y > 1400) y margen superior (y < 192) libres; cabecera fija
   en 200-290. Cortes secos entre planos; zoom rápido tipo cómic al empezar cada plano. */
'use strict';

const S = {};
let SUBS = null;
// plano activo: [nombre, inicio, fin]
function shotAt(t, sc) {
  const e = Object.entries(sc.shots || { A: [0, sc.duration] });
  for (const [k, [a, b]] of e) if (t >= a && t < b) return [k, a, b];
  const [k, [a, b]] = e[e.length - 1];
  return [k, a, b];
}
const comicZoom = (u, from = 1.14) => lerp(from, 1, easeOut(u / 0.22));
const FOOT = V11.foot;

/* ---------- plano A de un motivo: Marta + número gigante + rótulo ---------- */
function shotA(t, T, u, sc, n, word) {
  const ranges = sc.talk, [M, px, FOOT] = FR().A, [NX, NY, NR, LY] = FR().num;
  let arm, expr = 'happy';
  if (n <= 3) {
    arm = Object.assign({}, POSE.count(n));
    const kk = pop(u, 0.05, 0.45);
    arm.hs = 1.45 * (0.6 + 0.4 * kk);
    arm.h = [arm.h[0], arm.h[1] + (1 - kk) * 30];
  } else { arm = POSE.heart; expr = 'sparkle'; }
  let s = bg11(T, n === 4 ? { birds: { time: t, t0: 0.1, d: 4.2, y: 640 } } : {});
  if (n === 4) s += at(780, 640, pop(u, 0.08, 0.55), `<g opacity="${f(0.55 * pop(u, 0.3, 0.6))}">${rays(0, 0, 14, T * 30, C.yel, 350)}</g>`);
  s += hero11(px, FOOT, M, mState(t, T, M, ranges, { expr, armF: arm, nod: n === 4 ? -4 * Math.sin(PI * clamp(u / 0.8)) : 0 }));
  if (n === 4) {
    const [hx, hy] = heroPt(px, FOOT, M, 193, 108);
    for (let i = 0; i < 3; i++) { const p = ((u * 0.9 + i / 3) % 1); s += riseHeart(hx + 110 + i * 40, hy + 60 - p * 300, 26, (p < 0.15 ? p / 0.15 : 1) * (1 - p * 0.4), 10 * Math.sin(u * 4 + i)); }
  }
  s = cam(comicZoom(u), 540, 800, s);
  const k = pop(u, 0.08, 0.55);
  if (n <= 3) {
    s += bigNumber(NX, NY, NR, n, k, -12 * (1 - k), T);
    s += label11(word, NX, LY, pop(u, 0.35, 0.5), -3);
  } else {
    s += bigNumber(780, 640, 200, 4, k, -12 * (1 - k), T, 0);
    s += sealMejor(960, 470, 92, pop(u, 0.6, 0.5), 12, T);
    s += label11(word, 780, 940, pop(u, 0.4, 0.5), -3, { fill: C.yel });
    s += sparkle(600, 440, 30, 0.5 + 0.5 * Math.sin(T * 9)) + sparkle(990, 760, 26, 0.5 + 0.5 * Math.sin(T * 8 + 2)) + sparkle(640, 820, 22, 0.5 + 0.5 * Math.sin(T * 7 + 1));
  }
  return s;
}
/* ---------- plano C de un motivo: Marta a pantalla completa con el gesto de cierre ---------- */
function shotC(t, T, u, sc, n) {
  const ranges = sc.talk, [M, px, FOOT] = FR().C;
  const g = [null,
    { expr: 'happy', armF: POSE.thumb },
    { expr: 'wink', armF: POSE.thumb },
    { expr: 'joy', armF: POSE.wave(2 * PI * u * 2.2) },
    { expr: 'joy', armF: POSE.heart }][n];
  let s = bg11(T, n === 4 ? { birds: { time: t, t0: 8.4, d: 3.6, y: 520 } } : {});
  const kb = pop(u, 0.02, 0.4);
  if (g.armF.hand === 'thumb') g.armF = Object.assign({}, g.armF, { hs: 1.45 * (0.5 + 0.5 * kb) });
  s += hero11(px, FOOT, M, mState(t, T, M, ranges, Object.assign({ nod: 3 * Math.sin(PI * clamp(u / 0.5)) }, g)));
  if (n === 4) {
    for (let i = 0; i < 6; i++) {
      const p = ((u * 0.8 + i / 6) % 1), x = 540 + (i - 2.5) * 120 + 30 * Math.sin(u * 3 + i);
      s += riseHeart(x, 1080 - p * 640, 24 + 10 * hash(i), Math.min(1, p / 0.12), 14 * Math.sin(u * 4 + i));
    }
  } else {
    const [hx, hy] = heroPt(px, FOOT, M, 222, 92);
    s += sparkle(hx + 60, hy - 40, 28, pop(u, 0.15, 0.4)) + sparkle(hx - 10, hy - 110, 20, pop(u, 0.3, 0.4));
  }
  return cam(comicZoom(u, 1.12), 540, 760, s);
}
/* ---------- plano B: imagen insertada + Marta en el círculo ---------- */
function shotB(t, T, u, d, sc, n) {
  const z = 1 + 0.06 * clamp(u / d);
  let s = dotBg();
  let img;
  if (n === 4) {
    const inner = `<g transform="scale(${f(1020 / 1080)}) translate(0 -400)">${festStreet(u, T)}${confettiRain(T, 0, 400, 1080, 1000, 30)}</g>`;
    img = insetFrame(30, 330, 1020, 960, z, inner);
    img += bigHeart(560, 790, 125, pop(u, 0.15, 0.6), T);
    img += bigT('Apoyas al', 540, 430, 108, pop(u, 0.35, 0.5), -3, { fill: C.yel });
    img += bigT('comercio local', 540, 540, 108, pop(u, 0.55, 0.5), -3, { fill: '#FFFFFF' });
    img += sealMejor(220, 700, 100, pop(u, 1.0, 0.55), -10, T);
    img += sparkle(860, 690, 30, 0.5 + 0.5 * Math.sin(T * 8)) + sparkle(340, 870, 24, 0.5 + 0.5 * Math.sin(T * 9 + 1));
    img += martaCircle(925, 1195, 118, t, T, sc.talk, { expr: 'sparkle' });
  } else {
    const inner = n === 1 ? insetNovedades(u, T) : n === 2 ? insetDescuentos(u, T) : `<g transform="scale(${f(880 / 1080)})">${insetEventos(u, T)}</g>`;
    img = insetFrame(100, 330, 880, 880, z, inner);
    const txt = ['', 'Antes de estar en la tienda', 'Descuentos y promociones', 'Eventos que no sabías que existían'][n];
    img += banner11(txt, 430, 1300, pop(u, 0.4, 0.5), -2, { size: 64, maxW: 640 });
    img += martaCircle(930, 1180, 112, t, T, sc.talk);
  }
  return s + cam(comicZoom(u, 1.08), 540, 800, img);
}
function benefit(n, word) {
  return (t, T, sc) => {
    const [k, a, b] = shotAt(t, sc), u = t - a;
    if (k === 'A') return shotA(t, T, u, sc, n, word);
    if (k === 'B') return shotB(t, T, u, b - a, sc, n);
    return shotC(t, T, u, sc, n);
  };
}

/* ---------- 1) Saludo y título ---------- */
S[1] = (t, T, sc) => {
  const [M, px, FOOT] = FR().s1;
  let s = bg11(T, { sunX: 930, sunY: 1000 });
  const c = Object.assign({ title1: 0.2, title2: 0.5, waveEnd: 3.0, circles: 1.1, four: 1.85 }, sc.cues);
  const arm = t < c.waveEnd ? POSE.wave(2 * PI * t * 2) : t < c.circles - 0.1 ? POSE.restF : POSE.pointUp;
  const extra = { expr: t < c.four ? 'happy' : 'sparkle', armF: arm };
  s += hero11(px, FOOT, M, mState(t, T, M, sc.talk, extra));
  s = cam(comicZoom(t, 1.1), 540, 900, s);
  // título
  s += bigT('4 motivos', 540, 378, 150, pop(t, c.title1, 0.55), -3, { fill: C.yel });
  s += bigT('para estar en el canal', 540, 488, 84, pop(t, c.title2, 0.55), 2, { fill: '#FFFFFF' });
  // círculos 1-4 (el 4 más grande y brillando)
  [[270, 48], [410, 48], [550, 48]].forEach(([x, r], i) => { s += bigNumber(x, 600, r, i + 1, pop(t, c.circles + 0.22 * i, 0.45), 0, T); });
  const k4 = pop(t, c.four, 0.6), pulse = t > c.four + 0.6 ? 1 + 0.07 * Math.max(0, Math.sin((t - c.four - 0.6) * 2 * PI * 1.2)) : 1;
  s += bigNumber(740, 600, 74, 4, k4 * pulse, 6 * Math.sin(T * 2), T, k4);
  s += sparkle(830, 530, 22, k4 * (0.6 + 0.4 * Math.sin(T * 9))) + sparkle(660, 670, 16, k4 * (0.6 + 0.4 * Math.sin(T * 8 + 2)));
  return s;
};
S[2] = benefit(1, 'Novedades');
S[3] = benefit(2, 'Descuentos');
S[4] = benefit(3, 'Eventos');
S[5] = benefit(4, 'El mejor');

/* ---------- 6) Comenta CANAL ---------- */
S[6] = (t, T, sc) => {
  const c = Object.assign({ pill: 2.1, comenta: 0.2, bubble: 0.75, enviamos: 1.4, enlace: 1.6, arrow: 2.5 }, sc.cues);
  const [M, px, FOOT] = FR().s6;
  let s = bg11(T, { sunX: 110, sunY: 1190 });
  const pd = Object.assign({}, POSE.pointDown, { h: [POSE.pointDown.h[0], POSE.pointDown.h[1] - 3 * Math.max(0, Math.sin(t * 2 * PI * 1.4))] });
  s += hero11(px, FOOT, M, mState(t, T, M, sc.talk, { expr: 'happy', armF: pd, armB: POSE.phoneB }));
  s = cam(comicZoom(t, 1.1), 540, 900, s);
  s += bigT('Comenta CANAL', 540, 368, 124, pop(t, c.comenta, 0.55), -3, { fill: '#FFFFFF' });
  s += commentBubble(770, 565, pop(t, c.bubble, 0.55), -3, t);
  s += bigT('y te enviamos', 770, 770, 80, pop(t, c.enviamos, 0.5), 2, { fill: C.yel, maxW: 520 });
  s += bigT('el enlace', 770, 862, 80, pop(t, c.enlace, 0.5), 2, { fill: C.yel, maxW: 520 });
  s += channelPill(770, 990, pop(t, c.pill, 0.5));
  s += arrowDown(965, 1110, 170, pop(t, c.arrow, 0.5), t);
  return s;
};

/* ---------- 7) Compártelo + tarjeta final ---------- */
S[7] = (t, T, sc) => {
  const [k, a] = shotAt(t, sc), u = t - a;
  if (k === 'FIN') {
    let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + `<g opacity="0.35">${rays(540, 760, 16, u * 12, C.redS)}</g>`;
    const kl = pop(u, 0.02, 0.6);
    s += at(540, 740, kl, `<circle cx="14" cy="14" r="300" fill="${INK}"/><circle r="300" fill="${C.cream}" ${st11(1.2)}/>`, 0);
    s += logoPng11(540, 735, 470, -4 * (1 - kl), kl);
    s += bigT('Escaparate Tudela', 540, 1120, 104, pop(u, 0.3, 0.5), -2, { fill: '#FFFFFF' });
    const kw = pop(u, 0.5, 0.5);
    s += at(540, 1250, kw, `<rect x="-300" y="-46" width="600" height="92" rx="46" transform="translate(8 8)" fill="${INK}"/><rect x="-300" y="-46" width="600" height="92" rx="46" fill="${C.cream}" ${st11()}/>` +
      text('escaparatetudela.es', 0, 3, { size: 52, fill: INK, stroke: null, shadow: false }));
    s += sparkle(170, 480, 30, 0.6 + 0.4 * Math.sin(T * 8)) + sparkle(920, 1000, 26, 0.6 + 0.4 * Math.sin(T * 7 + 2));
    return s;
  }
  let [M, , FOOT] = FR().s7;
  if (k === 'P1') {
    const px = FR().s7[1], q = (sc.shots.P1[1] - sc.shots.P1[0]) / 4, uu = u / q;
    let s = bg11(T, { sunX: 950, sunY: 1250 });
    s += hero11(px, FOOT, M, mState(t, T, M, sc.talk, { expr: uu > 2.4 ? 'sparkle' : 'happy', armF: Object.assign({}, POSE.phoneF, { screen: 'chat' }) }));
    s = cam(comicZoom(u, 1.1), 540, 900, s);
    const [phx, phy] = heroPt(px, FOOT, M, 216, 116 - 16);
    s += shareIcon(phx - 5, phy - 165, 62, pop(uu, 0.45, 0.45));
    // el avioncito vuela del móvil a cada burbuja
    const BY = [585, 745, 905, 1065];
    BY.forEach((by, i) => {
      const t0 = 0.85 + i * 0.32, p = clamp((uu - t0) / 0.35);
      if (p > 0 && p < 1) {
        const x = lerp(phx - 5, 640, p), y = lerp(phy - 165, by, p) - 90 * Math.sin(PI * p);
        s += paperPlane(x, y, 0.75, 20 - 40 * p);
      }
      s += chatBubble(815, by, pop(uu, t0 + 0.3, 0.45), i, u, pop(uu, 2.2 + i * 0.28, 0.45));
    });
    s += bigT('Compártelo en los grupos', 540, 365, 84, pop(u, 0.15, 0.5), -2, { fill: '#FFFFFF' });
    s += bigT('de tus amigos', 540, 460, 84, pop(u, 0.35, 0.5), -2, { fill: C.yel });
    return s;
  }
  // P2: pulgar arriba y guiño
  const px = FR().p2[1]; [M, , FOOT] = FR().p2;
  let s = bg11(T, { sunX: 140, sunY: 650 });
  const kb = pop(u, 0.05, 0.4);
  s += hero11(px, FOOT, M, mState(t, T, M, sc.talk, { expr: 'wink', armF: Object.assign({}, POSE.thumb, { hs: 1.45 * (0.5 + 0.5 * kb) }), nod: 3 * Math.sin(PI * clamp(u / 0.5)) }));
  for (let i = 0; i < 4; i++) { const p = ((u * 0.7 + i / 4) % 1); s += riseHeart(160 + i * 250 + 20 * Math.sin(u * 3 + i), 1250 - p * 560, 22, Math.min(1, p / 0.12), 12 * Math.sin(u * 4 + i)); }
  s = cam(comicZoom(u, 1.12), 540, 860, s);
  s += bigT('Para que ellos también', 540, 365, 88, pop(u, 0.15, 0.5), -2, { fill: '#FFFFFF' });
  s += bigT('se beneficien', 540, 465, 96, pop(u, 0.35, 0.5), -2, { fill: C.yel });
  return s;
};

/* ---------- subtítulos (solo en la versión subtitulada: node render.js subs) ---------- */
function wrapLines(str, size, maxW) {
  const words = str.split(' '); const lines = [];
  let cur = '';
  words.forEach(wd => { const tr = cur ? cur + ' ' + wd : wd; if (measure(tr, size) <= maxW || !cur) cur = tr; else { lines.push(cur); cur = wd; } });
  if (cur) lines.push(cur);
  return lines;
}
function subtitle(T) {
  const c = SUBS.find(q => T >= q.start - 1e-6 && T < q.end);
  if (!c) return '';
  let size = 76, lines = wrapLines(c.text, size, 940);
  while (lines.length > 2 && size > 50) { size -= 4; lines = wrapLines(c.text, size, 940); }
  const lh = size * 1.18, wMax = Math.max(...lines.map(l => measure(l, size)));
  const bw = Math.min(1040, wMax + 90), bh = lines.length * lh + 50, cy = 1640;
  let s = `<rect x="${f(540 - bw / 2)}" y="${f(cy - bh / 2)}" width="${f(bw)}" height="${f(bh)}" rx="30" fill="${INK}" fill-opacity="0.86"/>`;
  lines.forEach((l, i) => { s += text(l, 540, cy - (lines.length - 1) * lh / 2 + i * lh + size * 0.04, { size, fill: '#FFFFFF', sw: size * 0.14, shadow: false }); });
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
  // cabecera fija encima de todo (pulso al empezar la escena), salvo en la tarjeta final
  const fin = sc.shots && sc.shots.FIN && t >= sc.shots.FIN[0];
  if (!fin) s += header11(t);
  if (SUBS) s += subtitle(T);
  document.getElementById('dyn').innerHTML = s;
};
