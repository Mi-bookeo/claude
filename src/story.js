/* Story de intriga (el día antes del vídeo 10 «Carmen y María»). Reutiliza las piezas del vídeo 10.
   Zona segura de story: textos entre y≈270 y y≈1500 (arriba va la barra del perfil y abajo la de respuesta). */
'use strict';

// sello de goma rojo (palabra) que cae girando
function stamp(x, y, k, label, rot = -12) {
  if (k <= 0.01) return '';
  const wd = measure(label, 120, 'G') + 90, ht = 170;
  return at(x, y, k, `<rect x="${-wd / 2 + 10}" y="${-ht / 2 + 10}" width="${wd}" height="${ht}" rx="24" fill="${INK}"/>
    <rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="24" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>
    <rect x="${-wd / 2 + 16}" y="${-ht / 2 + 16}" width="${wd - 32}" height="${ht - 32}" rx="16" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" stroke-dasharray="18 12"/>` +
    text(label, 0, 6, { size: 120, font: 'G', sw: SW * 2, sd: 6, ls: 4 }), rot);
}
// opción de encuesta (píldora)
function pollPill(x, y, wd, k, label, fill, rot = 0) {
  if (k <= 0.01) return '';
  const ht = 132;
  return at(x, y, k, `<rect x="${-wd / 2 + 10}" y="${-ht / 2 + 10}" width="${wd}" height="${ht}" rx="${ht / 2}" fill="${INK}"/>
    <rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="${ht / 2}" fill="${fill}" stroke="${INK}" stroke-width="${f(SW)}"/>` +
    text(label, 0, 4, { size: fit(label, 66, wd - 80), sw: SW * 1.8, sd: 5 }), rot);
}

/* ---------- A) Carmen en la avenida llena: «Dicen que si no te ven… no te conoce nadie» -> ¿SEGURO? ---------- */
S[101] = (t, T) => {
  const e = easeOut((t - 0.9) / 0.3);
  let w = avenueBack(T) + carmenAt(T, { expr: 'sad', look: [0.4, 0.8], head: 9 * e,
    armF: { ik: [lerp(199, 206, e), lerp(134, 92, e)], side: -1 }, itemF: e > 0.9 ? cheekItem : null, armB: { ang: 4, bend: -8 } });
  w += avenueWalkers(t + 2) + AV_FG(T);
  let s = view(1.45 * zoomIn(t, 0, 1.12, 0.22) * bump(t, [2.3], 0.04), 640, 1060, w);
  const k1 = pop(t, 0.2, 0.5), k2 = pop(t, 0.9, 0.5);
  s += big('Dicen que si no te ven…', 540, 330, 104, k1, lerp(-8, -3, k1));
  s += big('no te conoce nadie', 540, 460, 120, k2, lerp(7, 2, k2), { fill: C.yel });
  if (t > 2.3 && t < 2.6) s += impactLines(540, 1250, t, 30, 360);
  s += stamp(540, 1260, pop(t, 2.3, 0.35) * lerp(1.6, 1, easeOut((t - 2.3) / 0.2)), '¿SEGURO?', -10);
  return s;
};

/* ---------- B) María en la callejuela vacía: «Ella está donde no pasa nadie… y siempre la tiene llena. ¿Cómo lo hace?» ---------- */
S[102] = (t, T) => {
  let w = alleyBack(T) + mariaAt(T, { look: t > 2.2 ? [-0.4, -0.6] : [0.6, 0], expr: t > 2.2 ? 'wink' : 'calm', head: t > 2.2 ? -3 : 0 }) + catAt(T);
  let s = view(zoomIn(t, 0, 1.12, 0.22) * lerp(1.42, 1.55, easeInOut(t / 3.6)), 640, 1110, w, 540, 1020);
  const k1 = pop(t, 0.2, 0.5), k2 = pop(t, 1.0, 0.5), k3 = pop(t, 2.0, 0.5);
  s += big('Ella está donde', 540, 300, 112, k1, lerp(-8, -3, k1));
  s += big('no pasa nadie…', 540, 425, 118, k1, lerp(6, 2, k1));
  s += big('…y siempre la tiene llena', 540, 560, 84, k2, lerp(-5, -2, k2), { fill: C.glass });
  s += at(330, 1330, k3, `<g transform="rotate(${f(3 * Math.sin(t * 4))})">${burst(0, 0, 250, t * 20, C.yel)}</g>` + text('¿Cómo', 0, -52, { size: 104, sw: SW * 2.2, sd: 7 }) + text('lo hace?', 0, 58, { size: 104, sw: SW * 2.2, sd: 7 }), lerp(-12, -6, k3));
  return s;
};

/* ---------- C) La pregunta al aire: ¿Qué es mejor? que te vean / que sepan que existes ---------- */
const QMARKS = [[150, 330, 230, -14, 0.0], [930, 300, 260, 12, 0.5], [140, 1320, 250, 10, 1.0], [940, 1340, 220, -10, 1.5], [540, 1480, 170, 6, 0.8]];
S[103] = (t, T) => {
  let s = `<rect width="${W}" height="${H}" fill="${C.navy}"/>` + rays(540, 900, 16, t * 6, '#22394F');
  QMARKS.forEach(([x, y, sz, r, o], i) => { s += mark('?', x, y + 12 * Math.sin(t * 2 + o * 3), pop(t, 0.1 + o * 0.2, 0.4) * 0.9, r + 6 * Math.sin(t * 1.6 + i), sz, i % 2 ? C.yel : C.red); });
  const k1 = pop(t, 0.15, 0.5);
  s += big('¿Qué es mejor?', 540, 470, 140, k1, lerp(-8, -3, k1));
  const ka = pop(t, 0.7, 0.45), kb = pop(t, 1.3, 0.45), ko = pop(t, 1.0, 0.4);
  s += pollPill(540, 720, 760, ka, 'Que te vean…', C.red, -2);
  s += at(540, 860, ko, text('o', 0, 0, { size: 96, fill: C.yel, sw: SW * 2, sd: 6 }));
  s += pollPill(530, 1000, 860, kb, '…que sepan que existes', C.green, 2);
  // dedo que duda entre las dos opciones
  if (t > 1.7) {
    const u = (t - 1.7), m = 0.5 + 0.5 * Math.sin(u * 3.0 - PI / 2), fx = lerp(935, 975, m), fy = lerp(720, 1000, m);
    s += finger(fx + 900 * (1 - easeOut(u / 0.35)), fy, -8);
  }
  return cam(zoomIn(t, 0, 1.1, 0.2) * bump(t, [0.7, 1.3], 0.025), 540, 860, s);
};

/* ---------- D) Cierre: MAÑANA · Carmen y María · logo ---------- */
S[104] = (t, T) => {
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 760, 16, t * 8, '#C62828');
  const k1 = pop(t, 0.05, 0.5), k2 = pop(t, 0.45, 0.5), k3 = pop(t, 0.8, 0.5);
  s += big('MAÑANA', 540, 430, 220, k1, lerp(-10, -4, k1), { font: 'G', fill: C.yel, sd: 12, sw: SW * 2.6, ls: 6 });
  s += big('Carmen y María', 540, 640, 130, k2, lerp(6, 2, k2));
  s += at(540, 770, k2, text('Dos tiendas. Dos calles. Un secreto.', 0, 0, { size: fit('Dos tiendas. Dos calles. Un secreto.', 58, 900), sw: SW * 1.6, sd: 4 }));
  s += logoBadge(540, 1130 + 6 * Math.sin(t * 3), 560, lerp(-10, 0, k3), k3, 'logoW');
  if (t > 1.0) [[170, 980, 34, 1.0], [910, 1000, 30, 1.1], [200, 1330, 26, 1.2], [880, 1320, 32, 1.3]].forEach(([x, y, r, d], i) => { s += sparkle(x, y, r, pop(t, d, 0.35) * (1 + 0.2 * Math.sin(t * 13 + i))); });
  return cam(zoomIn(t, 0, 1.12, 0.2), 540, 800, s);
};
