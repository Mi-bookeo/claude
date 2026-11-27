/* Story de anuncio del vídeo 18 (vertical 9:16, ~7,5 s), para publicar ANTES del vídeo:
   «MAÑANA:» / «¿Qué le pasa a Pedro en la ITV?» sobre el mostrador de la ITV (el de las escenas 0-1, bajado para dejar
   sitio al texto); el sello baja con golpe, «DESFAVORABLE» y Pedro asustado; al final «Nuevo vídeo en Escaparate de
   Tudela». Zonas seguras de las stories: nada importante por encima de y=250 ni por debajo de y=1560. Textos en
   config18.story.json (textos.story1…story3). */
'use strict';

S[20] = (t, T, sc) => {
  const c = cues(sc, { ban: 0.15, q: 0.45, hit: 2.4, tag: 4.6 });
  const hit = c.hit, after = t >= hit, sp = stampPose18(t, hit);
  const pmark = after ? { col: C.red, str: TX('desf', 'DESFAVORABLE'), k: 1 } : null;
  const po = pedroITV(T, after && t < hit + 0.7 ? { expr: 'panic', jit: 0.8 * Math.sin(t * 60), bob: -6 * Math.max(0, damp(t - hit, 16, 6)) }
    : (after ? { expr: 'worried', look: [0, 0] } : { expr: 'normal', look: [1, 1.2] }));
  const w = itvWorld18(T, po, pmark, sp);
  let z = comicZoom(t, 1.1) * lerp(1, 1.04, seg(t, 0, hit));
  if (after) { const u = t - hit; z = u < 0.1 ? lerp(1.04, 1.3, u / 0.1) : lerp(1.3, 1.06, easeInOut(seg(u, 0.5, 1.5))); }
  const shk = shakeAt(t, hit, 22), jx = shk * Math.sin(t * 90), jy = shk * 0.6 * Math.cos(t * 77);
  // el mostrador, 340 px más abajo que en la escena 1 (arriba va el texto)
  let s = `<g transform="translate(${f(jx)} ${f(340 + jy)})">` + camAt(z, ITV.paperX, ITV.paperY, ITV.paperX, ITV.paperY, w);
  if (after && t < hit + 0.3) s += `<g opacity="${f(1 - seg(t, hit, hit + 0.3))}">${impactLines(ITV.paperX, ITV.paperY, t, 30, 380)}</g>`;
  s += `</g>`;
  // franja superior para que el texto se lea
  s += `<rect x="0" y="0" width="${W}" height="${f(lerp(0, 735, easeOut(seg(t, 0, 0.3))))}" fill="${C.cream}" opacity="0.92"/>`;
  // «MAÑANA:» entra desde la izquierda con rebote
  const kb = pop(t, c.ban, 0.55), bx = 540 + (1 - easeOut(seg(t, c.ban, c.ban + 0.3))) * -1200;
  s += at(bx, 350, kb, redSign17(560, 170, [[TX('story1', 'MAÑANA:'), 118, 6]]), -4);
  s += bigT(TX('story2', '¿Qué le pasa a Pedro'), 540, 535, 104, pop(t, c.q, 0.5), -2, { maxW: 980 });
  s += bigT(TX('story3', 'en la ITV?'), 540, 660, 128, pop(t, c.q + 0.18, 0.5), 2, { fill: C.yel, maxW: 980 });
  if (after) s += mark('!', 930, 820, pop(t, hit + 0.1, 0.35), 12, 150) + mark('?', 150, 840, pop(t, hit + 0.25, 0.35), -10, 130, C.yel);
  // aviso del vídeo nuevo (por encima de la barra de respuesta de la story)
  const kt = pop(t, c.tag, 0.5);
  if (kt > 0.01) {
    const str = TX('story4', 'Nuevo vídeo en Escaparate de Tudela'), sz = 50, wd = measure(str, sz) + 190, ht = 120;
    let g = `<rect x="${f(-wd / 2 + 10)}" y="${-ht / 2 + 10}" width="${f(wd)}" height="${ht}" rx="${ht / 2}" fill="${INK}"/><rect x="${f(-wd / 2)}" y="${-ht / 2}" width="${f(wd)}" height="${ht}" rx="${ht / 2}" fill="#FFFFFF" ${st18(1)}/>`;
    g += `<circle cx="${f(-wd / 2 + 64)}" cy="0" r="44" fill="${C.red}" ${st18(0.7)}/>` + logoI13(-wd / 2 + 64, 2, 76);
    g += text(str, 50, 3, { size: sz, fill: INK, stroke: null, shadow: false });
    s += at(540, 1450, kt * (1 + 0.025 * Math.sin(t * 6)), g, -1);
  }
  return s;
};
