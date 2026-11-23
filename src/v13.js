/* Vídeo 13 — «José y las tortillas». Piezas nuevas sobre lib.js + series.js + rosa.js + v04…v12.js:
   José (dueño del bar La Tortilla, personaje nuevo; suelo local en y=208), tortillas enteras con cuña cortada,
   pinchos en platitos, platos vacíos con migas, cubo de basura, recuadro de la hora, interior del bar (pared de
   puntos, estantes, reloj, carteles de tapas, luces), fachada del vídeo 05 con rótulo granate, cielos de 16:00,
   17:00 y atardecer, farolas encendidas y tarjeta de oferta flash con botón «Publicar». */
'use strict';

const J = {
  shirt: '#FFFFFF', shirtS: '#E6DCD8', apron: '#7B1E2B', apronS: '#5E1520', pants: '#1E1A1A', shoe: '#1E1A1A',
  hair: '#D9D4D0', hairS: '#B8B1AC', mous: '#7A4E2D', cheek: '#F29C9C', skin: '#F6C9A0', skinS: '#E9B88F',
  tort: '#F2C12E', tortB: '#D9A21E', tortIn: '#FBE08A', potato: '#FFF3CF', egg: '#F7D35A', gray: '#9AA3AA', grayS: '#7A838A',
  wine: '#7B1E2B'
};
const stJ = (w, v = 3) => `stroke="${INK}" stroke-width="${w(v)}" stroke-linejoin="round"`;
const breathJ = (T, sc) => -6 / sc * (0.5 - 0.5 * Math.cos(2 * PI * T / 1.6)); // 2 px (base 380) cada 1,6 s
const blinkJ = (T, off = 0) => ((T + off) % 3.2) < 0.12;

/* ===================== JOSÉ ===================== */
// cara (local; cabeza centrada en 190,76, r=16, de frente)
function joseFace(o, w) {
  const e = o.expr || 'happy', lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const L = (d, sw = 1.7, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const P = (cx, cy, r = 1.7) => `<circle cx="${f(cx + lx)}" cy="${f(cy + ly)}" r="${r}" fill="${INK}"/>`;
  const big = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="3.6" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.5)}"/><circle cx="${f(cx + lx * 0.6)}" cy="${f(cy + ly * 0.6)}" r="1.5" fill="${INK}"/><circle cx="${f(cx + lx * 0.6 + 0.6)}" cy="${f(cy + ly * 0.6 - 0.6)}" r="0.5" fill="#FFFFFF"/>`;
  let s = '';
  // mejillas sonrosadas
  const ck = e === 'sad' || e === 'tired' ? 0.45 : 0.75;
  s += `<circle cx="180.5" cy="84" r="3.4" fill="${J.cheek}" opacity="${ck}"/><circle cx="199.5" cy="84" r="3.4" fill="${J.cheek}" opacity="${ck}"/>`;
  // ojos
  if (o.blink && e !== 'proud' && e !== 'laugh') s += L('M182 78 H187 M193 78 H198', 1.6);
  else if (e === 'tired') {
    s += P(184.5, 78.6, 1.6) + P(195.5, 78.6, 1.6);
    s += `<path d="M181.6 78.2 A2.9 2.9 0 0 1 187.4 78.2Z M192.6 78.2 A2.9 2.9 0 0 1 198.4 78.2Z" fill="${J.skin}"/>` + L('M181.8 78.2 H187.2 M192.8 78.2 H198.2', 1.4);
  } else if (e === 'idea' || e === 'surprise') s += big(184.5, 77.6) + big(195.5, 77.6);
  else if (e === 'proud' || e === 'laugh') s += L('M181.8 79 Q184.5 75.6 187.2 79 M192.8 79 Q195.5 75.6 198.2 79', 1.8);
  else if (e === 'wink') s += L('M181.8 79 Q184.5 75.8 187.2 79', 1.8) + P(195.5, 78, 1.8);
  else s += P(184.5, 78, 1.8) + P(195.5, 78, 1.8) + `<circle cx="${f(185.1 + lx)}" cy="${f(77.4 + ly)}" r="0.55" fill="#FFFFFF"/><circle cx="${f(196.1 + lx)}" cy="${f(77.4 + ly)}" r="0.55" fill="#FFFFFF"/>`;
  // cejas (canosas, gruesas)
  const brow = d => `<path d="${d}" stroke="${INK}" stroke-width="${w(3.4)}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${J.hair}" stroke-width="${w(1.5)}" stroke-linecap="round" fill="none"/>`;
  if (e === 'tired') s += brow('M181 72.6 L187 71.2 M193 71.2 L199 72.6');
  else if (e === 'sad') s += brow('M181 73 L187 70.6 M193 70.6 L199 73');
  else if (e === 'idea' || e === 'surprise') s += brow('M181 70.4 Q184 67.6 187.4 69.6 M192.6 69.6 Q196 67.6 199 70.4');
  else if (e === 'wink') s += brow('M181 72.8 Q184 71.4 187.4 72.4 M192.6 70.6 Q196 68.4 199 70.8');
  else s += brow('M181 72.2 Q184 70.4 187.4 71.6 M192.6 71.6 Q196 70.4 199 72.2');
  // nariz
  s += `<path d="M188 80.4 Q190 85.6 192.6 81.4" fill="${J.skinS}" stroke="${INK}" stroke-width="${w(1.5)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // boca (bajo el bigote)
  if (e === 'tired') s += L('M186.6 90.6 Q190 89.4 193.4 90.6', 1.8);
  else if (e === 'sad') s += L('M186.4 91.4 Q190 88.4 193.6 91.4', 1.9);
  else if (e === 'idea' || e === 'surprise') s += `<ellipse cx="190" cy="91" rx="2.6" ry="3.2" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
  else if (e === 'proud' || e === 'laugh' || e === 'grin') s += `<path d="M184.6 88.6 Q190 97.2 195.4 88.6Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/><path d="M186.4 89.8 Q190 93.4 193.6 89.8Z" fill="${C.pink}"/>`;
  else s += L('M185.4 89.4 Q190 93.2 194.6 89.4', 1.9);
  // bigote castaño
  s += `<path d="M190 85.4 Q186 84 182.6 86.2 Q181 88.6 183.4 89.4 Q186.6 88.2 190 88.6 Q193.4 88.2 196.6 89.4 Q199 88.6 197.4 86.2 Q194 84 190 85.4Z" fill="${J.mous}" ${stJ(w, 1.6)}/>`;
  s += L('M186 86.4 Q188 86.2 189.4 87', 0.8, '#A9744D');
  return s;
}
// mano que chasca los dedos (local, centro 0,0)
function snapHand(w, H, k, hs = 1.4) {
  const sw = v => f(+w(v) / hs);
  let g = `<rect x="-5" y="-4.4" width="10" height="9.6" rx="3.6" fill="${J.skin}" stroke="${INK}" stroke-width="${sw(2.2)}"/>`;
  g += `<path d="M-1 -4 Q1.6 -10.4 5.2 -8.4" stroke="${INK}" stroke-width="${f(2.8 + +sw(2))}" fill="none" stroke-linecap="round"/><path d="M-1 -4 Q1.6 -10.4 5.2 -8.4" stroke="${J.skin}" stroke-width="${f(2.8 - +sw(2))}" fill="none" stroke-linecap="round"/>`;
  if (k > 0) for (let i = 0; i < 3; i++) { const a = (-70 + i * 32) * PI / 180, r1 = 9, r2 = 9 + 6 * k; g += `<line x1="${f(4 + Math.cos(a) * r1)}" y1="${f(-8 + Math.sin(a) * r1)}" x2="${f(4 + Math.cos(a) * r2)}" y2="${f(-8 + Math.sin(a) * r2)}" stroke="${INK}" stroke-width="${sw(1.6)}" stroke-linecap="round"/>`; }
  return `<g transform="translate(${f(H[0])} ${f(H[1])}) scale(${hs})">${g}</g>`;
}
// brazo con camisa remangada: hombro→codo blanco, codo→mano piel, puño de la manga en el codo
function armJ(S, A, w) {
  const { E, H } = ik2(S, A.h, A.side || 1, A.L || 18);
  const cuff = [lerp(E[0], H[0], 0.12), lerp(E[1], H[1], 0.12)];
  let g = capsule([S, E], 10.5, J.shirt, w) + capsule([cuff, H], 7.6, J.skin, w) + capsule([E, cuff], 11.5, J.shirtS, w);
  g += jHand(A, H, w);
  return g;
}
function jHand(A, H, w) {
  const kind = A.hand || 'fist';
  if (kind === 'snap') return snapHand(w, H, A.snapK || 0, A.hs || 1.4);
  if (kind === 'glass') return glassItem(w, H[0], H[1], { tilt: A.tilt || 0, skin: J.skin });
  if (kind === 'none') return '';
  return hand11(kind, H, w, Object.assign({ fill: J.skin, hs: 1.35 }, A));
}
// José en coordenadas locales (suelo y=208, de frente).
// o: expr, blink, look, bob, head, lean, armF/armB {h:[x,y], side, hand, hs, ...} | arms:'crossed' | 'phone' (dos manos, tecleo)
function jose(o) {
  const k = o.k || 1, w = v => f(v * k);
  const SF = [209, 104], SB = [171, 104];
  let g = '';
  // piernas y zapatos
  g += `<rect x="176.5" y="146" width="12" height="56" rx="4" fill="${J.pants}" ${stJ(w)}/><rect x="191.5" y="146" width="12" height="56" rx="4" fill="${J.pants}" ${stJ(w)}/>`;
  g += `<path d="M172.5 201 h16 a3 3 0 0 1 3 3 v4 h-21 a3 3 0 0 1 2 -7z" fill="${J.shoe}" ${stJ(w)}/><path d="M191.5 201 h16 a3 3 0 0 1 2 7 h-21 v-4 a3 3 0 0 1 3 -3z" fill="${J.shoe}" ${stJ(w)}/>`;
  let b = '';
  const armBack = () => {
    if (o.arms === 'crossed' || o.arms === 'phone' || !o.armB) return '';
    return armJ(SB, o.armB, w);
  };
  // brazo trasero (izquierda de la pantalla) detrás del cuerpo solo si va hacia dentro; casi siempre delante
  // torso robusto
  const torso = 'M172 99 Q190 93 208 99 Q215 104 215 120 Q216 138 209 151 H171 Q164 138 165 120 Q165 104 172 99Z';
  b += `<path d="${torso}" fill="${J.shirt}"/><path d="M172 99 Q178 97 180 96.6 L178 151 H171 Q164 138 165 120 Q165 104 172 99Z" fill="${J.shirtS}"/><path d="${torso}" fill="none" ${stJ(w)}/>`;
  // botones y tapeta
  b += `<path d="M190 100 V128" stroke="${INK}" stroke-width="${w(1.2)}"/><circle cx="192.4" cy="108" r="1.1" fill="${INK}"/><circle cx="192.4" cy="118" r="1.1" fill="${INK}"/>`;
  // cuello y cuello de la camisa
  b += `<rect x="185" y="88" width="10" height="10" rx="2" fill="${J.skinS}" ${stJ(w, 2.4)}/>`;
  b += `<path d="M184 95 L190 101.6 L182.6 104 Z M196 95 L190 101.6 L197.4 104 Z" fill="${J.shirt}" ${stJ(w, 2)}/>`;
  // delantal granate atado a la cintura
  b += `<path d="M168.6 128 H211.4 L213 186 Q190 190 167 186 Z" fill="${J.apron}" ${stJ(w)}/>`;
  b += `<path d="M168.6 128 H173 L172 187 Q169 186.6 167 186Z" fill="${J.apronS}"/>`;
  b += `<path d="M167.6 127 H212.4 V132.6 H167.6Z" fill="${J.apronS}" ${stJ(w, 2.2)}/>`;
  b += `<path d="M211 130 q7 -1 7 5 q-5 0 -7 -3 M211 130 q5 4 3 10" fill="${J.apron}" ${stJ(w, 1.8)}/>`;
  b += `<rect x="181" y="146" width="18" height="12" rx="2" fill="none" stroke="${J.apronS}" stroke-width="${w(1.6)}"/><path d="M181 146 H199" stroke="${INK}" stroke-width="${w(1.2)}"/>`;
  b += `<path d="M168.6 128 H211.4 L213 186 Q190 190 167 186 Z" fill="none" ${stJ(w)}/>`;
  // paño blanco al hombro (hombro izquierdo de la pantalla)
  b += `<path d="M168 96 Q173 93 179 96.4 L180.6 124 Q176 126.4 171.4 124.4 Z" fill="#FFFFFF" ${stJ(w, 2.2)}/><path d="M171 113.6 H180 M171.2 118 H180.4" stroke="${C.red}" stroke-width="${w(1.5)}"/>`;
  b += armBack();
  // brazos especiales
  if (o.arms === 'crossed') {
    // brazos cruzados sobre la barriga
    b += capsule([SB, [168, 124]], 10.5, J.shirt, w) + capsule([SF, [212, 124]], 10.5, J.shirt, w);
    b += capsule([[171, 124], [206, 118]], 8, J.skin, w);
    b += capsule([[209, 124], [174, 118]], 8, J.skin, w);
    b += `<circle cx="174" cy="117" r="4.2" fill="${J.skin}" ${stJ(w, 2.2)}/><circle cx="206" cy="117" r="4.2" fill="${J.skin}" ${stJ(w, 2.2)}/>`;
  } else if (o.arms === 'phone') {
    // móvil con las dos manos delante del pecho; pulgares que teclean
    const ph = o.typePh || 0, lit = o.lit !== false;
    b += capsule([SB, [174, 126]], 10.5, J.shirt, w) + capsule([SF, [206, 126]], 10.5, J.shirt, w);
    b += capsule([[175, 126], [184, 120]], 7.6, J.skin, w) + capsule([[205, 126], [196, 120]], 7.6, J.skin, w);
    b += `<g transform="rotate(-4 190 112)"><rect x="181" y="97" width="18" height="30" rx="3.2" fill="${INK}" ${stJ(w, 2)}/>` +
      `<rect x="183" y="99.6" width="14" height="25" rx="1.8" fill="${lit ? '#FFFFFF' : C.glass}"/>` +
      (lit ? `<rect x="183" y="99.6" width="14" height="4.6" fill="${C.red}"/><rect x="184.4" y="106" width="11.2" height="7" rx="1" fill="${J.tort}" stroke="${INK}" stroke-width="${w(0.6)}"/><rect x="184.4" y="115.4" width="11.2" height="3.6" rx="1.8" fill="${o.done ? C.green : C.red}" stroke="${INK}" stroke-width="${w(0.5)}"/>` : '') + `</g>`;
    const a = Math.max(0, Math.sin(ph * PI)), c = Math.max(0, -Math.sin(ph * PI));
    b += `<circle cx="184" cy="121" r="4.4" fill="${J.skin}" ${stJ(w, 2.2)}/><circle cx="196" cy="121" r="4.4" fill="${J.skin}" ${stJ(w, 2.2)}/>`;
    b += `<rect x="${f(184.6 + a * 1.2)}" y="${f(113 - a * 2.4)}" width="4.6" height="7" rx="2.3" fill="${J.skin}" ${stJ(w, 1.6)}/>`;
    b += `<rect x="${f(190.8 - c * 1.2)}" y="${f(113 - c * 2.4)}" width="4.6" height="7" rx="2.3" fill="${J.skin}" ${stJ(w, 1.6)}/>`;
  }
  // cabeza
  let hd = '';
  hd += `<ellipse cx="173.4" cy="79" rx="3.2" ry="4.4" fill="${J.skin}" ${stJ(w, 2.4)}/><ellipse cx="206.6" cy="79" rx="3.2" ry="4.4" fill="${J.skin}" ${stJ(w, 2.4)}/>`;
  hd += `<path d="M174 74 Q173.6 92 190 94.6 Q206.4 92 206 74 Q206 58 190 58 Q174 58 174 74Z" fill="${J.skin}" ${stJ(w)}/>`;
  // pelo corto canoso
  hd += `<path d="M173.4 78 Q171 60 190 57.4 Q209 60 206.6 78 L204.6 77 Q205 66 199 64 Q192 66.6 183 64.6 Q176 66 175.4 77Z" fill="${J.hair}" ${stJ(w, 2.6)}/>`;
  hd += `<path d="M180 61.6 Q184 60.6 187 62 M193 61 Q197 60.8 200 62.6" stroke="${J.hairS}" stroke-width="${w(1.3)}" stroke-linecap="round" fill="none"/>`;
  hd += joseFace(o, w);
  b += `<g transform="rotate(${f(o.head || 0)} 190 96)">${hd}</g>`;
  if (!o.arms && o.armF) b += armJ(SF, o.armF, w);
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  if (o.lean) g = `<g transform="rotate(${f(o.lean)} 190 208)">${g}</g>`;
  return g;
}
// (px,py) = punto del suelo bajo José (local 190,208)
function placeJose(px, py, sc, o) {
  o.k = SW / (3 * sc);
  return `<g transform="translate(${f(px - 190 * sc)} ${f(py - 208 * sc)}) scale(${f(sc)})">${jose(o)}</g>`;
}
const jPt = (px, py, sc, lx, ly) => [px + (lx - 190) * sc, py + (ly - 208) * sc];
// posturas de brazos
const JP = {
  restF: { h: [214, 140], side: -1, hand: 'fist', hs: 1.2 },
  restB: { h: [166, 140], side: 1, hand: 'fist', hs: 1.2 },
  hipF: { h: [212, 132], side: -1, hand: 'fist', hs: 1.15, L: 17 },
  hipB: { h: [168, 132], side: 1, hand: 'fist', hs: 1.15, L: 17 },
  headF: { h: [205, 64], side: -1, hand: 'open', hs: 1.45, hrot: -40 },   // mano a la cabeza
  snapF: { h: [222, 92], side: 1, hand: 'snap', hs: 1.45 },
  thumbF: { h: [221, 98], side: 1, hand: 'thumb', hs: 1.5 },
  pointF: { h: [225, 102], side: 1, hand: 'point', dir: -14, hs: 1.5 },
  counterF: { h: [214, 136], side: -1, hand: 'fist', hs: 1.2 },
  counterB: { h: [166, 136], side: 1, hand: 'fist', hs: 1.2 }
};

/* ===================== TORTILLAS Y PLATOS ===================== */
// plato (x,y centro, rx radio horizontal)
function plateJ(x, y, rx, fill = '#FFFFFF') {
  const ry = rx * 0.36;
  return `<ellipse cx="${f(x + rx * 0.06)}" cy="${f(y + ry * 0.3)}" rx="${f(rx)}" ry="${f(ry)}" fill="${INK}"/>
    <ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" stroke="${INK}" stroke-width="${f(SW)}"/>
    <ellipse cx="${f(x)}" cy="${f(y - ry * 0.06)}" rx="${f(rx * 0.7)}" ry="${f(ry * 0.66)}" fill="none" stroke="#E2D6D3" stroke-width="${f(SW * 0.8)}"/>`;
}
// tortilla entera en un plato con una cuña cortada hacia la cámara. (x,y) = centro de la cara superior; r = radio
function tortillaWhole(x, y, r, o = {}) {
  const ry = r * 0.4, h = r * 0.42, a1 = (o.a1 || 58) * PI / 180, a2 = (o.a2 || 112) * PI / 180;
  const P = (a, dy = 0) => [x + r * Math.cos(a), y + ry * Math.sin(a) + dy];
  const pt = p => `${f(p[0])} ${f(p[1])}`;
  const sw = f(SW * (o.swk || 1));
  let s = plateJ(x, y + h + ry * 0.15, r * 1.32);
  // lado (dos tramos visibles a cada lado del hueco)
  const side = (aa, bb) => `<path d="M${pt(P(aa))} A${f(r)} ${f(ry)} 0 0 1 ${pt(P(bb))} L${pt(P(bb, h))} A${f(r)} ${f(ry)} 0 0 0 ${pt(P(aa, h))}Z" fill="${J.tortB}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  if (o.cut === false) s += side(0, PI);
  else { s += side(0, a1) + side(a2, PI); }
  if (o.cut !== false) {
    // caras del corte con patata y huevo
    const c = [x, y], ch = [x, y + h];
    const face = (a) => {
      const p = P(a), ph = P(a, h);
      let g = `<path d="M${pt(c)} L${pt(p)} L${pt(ph)} L${pt(ch)}Z" fill="${J.tortIn}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      [[0.3, 0.5, 0.11], [0.62, 0.35, 0.1], [0.8, 0.7, 0.08], [0.48, 0.78, 0.07]].forEach(([u, v, s2], i) => {
        const qx = lerp(lerp(c[0], p[0], u), lerp(ch[0], ph[0], u), v), qy = lerp(lerp(c[1], p[1], u), lerp(ch[1], ph[1], u), v);
        const sz = r * s2;
        g += i % 2 ? `<circle cx="${f(qx)}" cy="${f(qy)}" r="${f(sz * 0.5)}" fill="${J.egg}"/>` :
          `<rect x="${f(qx - sz / 2)}" y="${f(qy - sz * 0.4)}" width="${f(sz)}" height="${f(sz * 0.8)}" rx="${f(sz * 0.25)}" fill="${J.potato}" stroke="${INK}" stroke-width="${f(SW * 0.35)}"/>`;
      });
      return g;
    };
    s += face(a2) + face(a1);
  }
  // cara superior
  const top = o.cut === false ? `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(ry)}"/>` : `<path d="M${f(x)} ${f(y)} L${pt(P(a1))} A${f(r)} ${f(ry)} 0 1 0 ${pt(P(a2))}Z"/>`;
  s += `<g fill="${J.tort}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round">${top}</g>`;
  // borde dorado y tostados
  s += `<path d="M${f(x - r * 0.82)} ${f(y - ry * 0.08)} A${f(r * 0.84)} ${f(ry * 0.8)} 0 0 1 ${f(x + r * 0.82)} ${f(y - ry * 0.08)}" fill="none" stroke="${J.tortB}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round"/>`;
  [[-0.42, -0.2, 0.09], [0.36, -0.36, 0.07], [0.1, -0.5, 0.06], [-0.6, 0.25, 0.06], [0.62, 0.15, 0.07]].forEach(([u, v, s2]) => {
    s += `<ellipse cx="${f(x + u * r)}" cy="${f(y + v * ry)}" rx="${f(r * s2)}" ry="${f(r * s2 * 0.5)}" fill="${J.tortB}"/>`;
  });
  s += `<path d="M${f(x - r * 0.5)} ${f(y - ry * 0.55)} Q${f(x - r * 0.2)} ${f(y - ry * 0.82)} ${f(x + r * 0.1)} ${f(y - ry * 0.8)}" stroke="#FFF5F3" stroke-width="${f(SW * 0.8)}" fill="none" stroke-linecap="round"/>`;
  return s;
}
// porción de tortilla (cubo con palillo) sobre pan, en platito. (x,y) = centro del platito
function pinchoPlate(x, y, s = 1) {
  const r = 46 * s;
  let g = plateJ(x, y, r);
  const bw = 52 * s, bh = 12 * s, tw = 46 * s, th = 30 * s, by = y - 4 * s;
  g += `<rect x="${f(x - bw / 2)}" y="${f(by - bh)}" width="${f(bw)}" height="${f(bh)}" rx="${f(5 * s)}" fill="#F5D7A8" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  const ty = by - bh;
  g += `<path d="M${f(x - tw / 2)} ${f(ty)} V${f(ty - th + 6 * s)} L${f(x - tw / 2 + 8 * s)} ${f(ty - th)} H${f(x + tw / 2 + 8 * s)} L${f(x + tw / 2)} ${f(ty - th + 6 * s)} V${f(ty)}Z" fill="${J.tortIn}" stroke="${INK}" stroke-width="${f(SW * 0.8)}" stroke-linejoin="round"/>`;
  g += `<path d="M${f(x + tw / 2)} ${f(ty)} V${f(ty - th + 6 * s)} L${f(x + tw / 2 + 8 * s)} ${f(ty - th)} V${f(ty - 6 * s)}Z" fill="${J.tortB}" stroke="${INK}" stroke-width="${f(SW * 0.8)}" stroke-linejoin="round"/>`;
  g += `<path d="M${f(x - tw / 2)} ${f(ty - th + 6 * s)} L${f(x - tw / 2 + 8 * s)} ${f(ty - th)} H${f(x + tw / 2 + 8 * s)} L${f(x + tw / 2)} ${f(ty - th + 6 * s)}Z" fill="${J.tort}" stroke="${INK}" stroke-width="${f(SW * 0.8)}" stroke-linejoin="round"/>`;
  g += `<rect x="${f(x - 14 * s)}" y="${f(ty - 17 * s)}" width="${f(8 * s)}" height="${f(6 * s)}" rx="${f(2 * s)}" fill="${J.potato}" stroke="${INK}" stroke-width="${f(SW * 0.3)}"/><circle cx="${f(x + 8 * s)}" cy="${f(ty - 10 * s)}" r="${f(3 * s)}" fill="${J.egg}"/>`;
  g += `<path d="M${f(x + 2 * s)} ${f(ty - th - 2 * s)} V${f(ty - th - 20 * s)}" stroke="${INK}" stroke-width="${f(SW * 1.2)}" stroke-linecap="round"/><path d="M${f(x + 2 * s)} ${f(ty - th - 2 * s)} V${f(ty - th - 20 * s)}" stroke="${C.wood}" stroke-width="${f(SW * 0.4)}" stroke-linecap="round"/>`;
  return g;
}
// plato vacío con migas
function crumbPlate(x, y, r, seed = 0) {
  let g = plateJ(x, y, r);
  for (let i = 0; i < 7; i++) {
    const u = hash(seed * 13 + i) - 0.5, v = hash(seed * 7 + i * 3.3) - 0.5;
    const cx = x + u * r * 1.1, cy = y + v * r * 0.4, cr = r * (0.035 + hash(i + seed) * 0.03);
    g += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(cr)}" fill="${i % 3 ? J.tort : J.tortB}" stroke="${INK}" stroke-width="${f(SW * 0.3)}"/>`;
  }
  g += `<path d="M${f(x + r * 0.2)} ${f(y - r * 0.1)} L${f(x + r * 0.85)} ${f(y - r * 0.02)}" stroke="${INK}" stroke-width="${f(SW * 1.3)}" stroke-linecap="round"/><path d="M${f(x + r * 0.2)} ${f(y - r * 0.1)} L${f(x + r * 0.85)} ${f(y - r * 0.02)}" stroke="#C9CED2" stroke-width="${f(SW * 0.5)}" stroke-linecap="round"/>`;
  return g;
}
// caña en la barra (x = centro, base = apoyo)
function canaJ(x, base, h = 70) {
  const tw = h * 0.5;
  return `<path d="M${f(x - tw / 2 + 6)} ${f(base - h + 6)} H${f(x + tw / 2 + 6)} L${f(x + tw * 0.4 + 6)} ${f(base + 6)} H${f(x - tw * 0.4 + 6)}Z" fill="${INK}"/>
    <path d="M${f(x - tw / 2)} ${f(base - h)} H${f(x + tw / 2)} L${f(x + tw * 0.4)} ${f(base)} H${f(x - tw * 0.4)}Z" fill="${J.tort}" stroke="${INK}" stroke-width="${f(SW * 0.8)}" stroke-linejoin="round"/>
    <path d="M${f(x - tw / 2 - 2)} ${f(base - h + 2)} Q${f(x - tw / 4)} ${f(base - h - 12)} ${f(x)} ${f(base - h - 4)} Q${f(x + tw / 4)} ${f(base - h - 13)} ${f(x + tw / 2 + 2)} ${f(base - h + 2)} V${f(base - h + 14)} H${f(x - tw / 2 - 2)}Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.7)}" stroke-linejoin="round"/>
    <path d="M${f(x - tw * 0.26)} ${f(base - h * 0.62)} L${f(x - tw * 0.22)} ${f(base - h * 0.14)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.7)}" stroke-linecap="round"/>`;
}
// taza de café en platito
function coffeeCup(x, base, s = 1) {
  const st = `stroke="${INK}" stroke-width="${f(SW * 0.8)}" stroke-linejoin="round"`;
  return `<ellipse cx="${f(x)}" cy="${f(base)}" rx="${f(34 * s)}" ry="${f(8 * s)}" fill="#FFFFFF" ${st}/>
    <path d="M${f(x + 18 * s)} ${f(base - 26 * s)} q${f(16 * s)} 0 ${f(12 * s)} ${f(12 * s)} q-${f(3 * s)} ${f(7 * s)} -${f(14 * s)} ${f(6 * s)}" fill="none" ${st}/>
    <path d="M${f(x - 22 * s)} ${f(base - 34 * s)} H${f(x + 22 * s)} L${f(x + 17 * s)} ${f(base - 4 * s)} Q${f(x)} ${f(base + 1 * s)} ${f(x - 17 * s)} ${f(base - 4 * s)}Z" fill="#FFFFFF" ${st}/>
    <ellipse cx="${f(x)}" cy="${f(base - 34 * s)}" rx="${f(22 * s)}" ry="${f(5 * s)}" fill="#6B4226" ${st}/>`;
}
// cubo de basura gris con tapa. (x, base) = centro inferior; open 0..1 = tapa abierta
function trashBin(x, base, s = 1, open = 0) {
  const wd = 150 * s, ht = 170 * s, st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  let g = `<path d="M${f(x - wd / 2 + 10)} ${f(base - ht + 10)} H${f(x + wd / 2 + 10)} L${f(x + wd * 0.4 + 10)} ${f(base + 10)} H${f(x - wd * 0.4 + 10)}Z" fill="${INK}"/>`;
  g += `<path d="M${f(x - wd / 2)} ${f(base - ht)} H${f(x + wd / 2)} L${f(x + wd * 0.4)} ${f(base)} H${f(x - wd * 0.4)}Z" fill="${J.gray}" ${st}/>`;
  for (let i = -1; i <= 1; i++) g += `<path d="M${f(x + i * wd * 0.22)} ${f(base - ht + 22 * s)} L${f(x + i * wd * 0.18)} ${f(base - 14 * s)}" stroke="${J.grayS}" stroke-width="${f(SW * 1.3)}" stroke-linecap="round"/>`;
  // tapa
  const lid = `<rect x="${f(-wd / 2 - 10 * s)}" y="${f(-20 * s)}" width="${f(wd + 20 * s)}" height="${f(22 * s)}" rx="${f(10 * s)}" fill="${J.gray}" ${st}/><rect x="${f(-22 * s)}" y="${f(-36 * s)}" width="${f(44 * s)}" height="${f(18 * s)}" rx="${f(8 * s)}" fill="${J.grayS}" ${st}/>`;
  g += `<g transform="translate(${f(x + wd / 2 + 10 * s)} ${f(base - ht)}) rotate(${f(-62 * open)}) translate(${f(-wd / 2 - 10 * s)} 0)">${lid}</g>`;
  return g;
}

/* ===================== RECUADRO DE LA HORA ===================== */
function hourBox(x, y, tm, k, rot = 0, sz = 1) {
  if (k <= 0.01) return '';
  const wd = 330 * sz, ht = 140 * sz;
  let g = panel(-wd / 2, -ht / 2, wd, ht, 28 * sz, C.red, 12);
  g += at(-wd / 2 + 62 * sz, 0, 1, clockFace(40 * sz, tm, { rim: C.yel }));
  g += text(timeStr(tm), 42 * sz, 4 * sz, { size: 112 * sz, font: 'G', sw: SW * 2, sd: 5, ls: 2 });
  return at(x, y, k, g, rot);
}

/* ===================== INTERIOR DEL BAR ===================== */
// cartel enmarcado de tapas
function tapaPoster(x, y, wd, ht, kind = 0) {
  let s = panel(x, y, wd, ht, 16, P5.wood, 10);
  s += `<rect x="${f(x + 14)}" y="${f(y + 14)}" width="${f(wd - 28)}" height="${f(ht - 28)}" rx="8" fill="${C.cream}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  const title = kind === 0 ? 'TAPAS' : 'PINCHOS';
  s += text(title, x + wd / 2, y + 48, { size: fit(title, 50, wd - 50, 'G'), font: 'G', fill: C.red, sw: SW * 1.2, sd: 3, ls: 1 });
  if (kind === 0) s += tortillaWhole(x + wd / 2, y + ht * 0.58, wd * 0.26, { swk: 0.7 });
  else s += pinchoPlate(x + wd / 2, y + ht * 0.8, wd / 150);
  return s;
}
// luz cálida colgada (pantalla roja y bombilla)
function warmLamp(x, yb, sway = 0, r = 1) {
  const g = `<line x1="0" y1="${f(-yb - 20)}" x2="0" y2="${f(-40 * r)}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>
    <path d="M${f(-60 * r)} 0 Q${f(-60 * r)} ${f(-48 * r)} 0 ${f(-48 * r)} Q${f(60 * r)} ${f(-48 * r)} ${f(60 * r)} 0Z" transform="translate(7 7)" fill="${INK}"/>
    <path d="M${f(-60 * r)} 0 Q${f(-60 * r)} ${f(-48 * r)} 0 ${f(-48 * r)} Q${f(60 * r)} ${f(-48 * r)} ${f(60 * r)} 0Z" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>
    <path d="M${f(-40 * r)} ${f(-26 * r)} Q${f(-30 * r)} ${f(-38 * r)} ${f(-14 * r)} ${f(-41 * r)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.9)}" fill="none" stroke-linecap="round" opacity="0.7"/>
    <circle cy="${f(6 * r)}" r="${f(17 * r)}" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  return `<g transform="translate(${f(x)} ${f(yb)}) rotate(${f(sway)} 0 ${f(-yb)})">${g}</g>`;
}
// fondo del bar. o: clock [x,y,r], tm, posters [[x,y,w,h,kind]], shelf [x0,x1,y1,y2], lamps [[x,y]]
function barRoom(T, o = {}) {
  let s = dotWall();
  // zócalo de madera bajo la pared
  s += `<rect x="0" y="0" width="${W}" height="70" fill="${P5.woodS}"/><line x1="0" y1="70" x2="${W}" y2="70" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  const sh = o.shelf || [640, 1060, 560, 740];
  s += shelf(sh[0], sh[1], sh[2]) + shelf(sh[0], sh[1], sh[3]);
  const n = Math.floor((sh[1] - sh[0] - 40) / 66);
  for (let i = 0; i < n; i++) s += bottle(sh[0] + 46 + i * 66, sh[2], 96 + 26 * hash(i + 3), BOTTLE_C[i % BOTTLE_C.length]);
  for (let i = 0; i < n; i++) s += tumbler(sh[0] + 44 + i * 66, sh[3], 60 + (i % 2) * 10);
  (o.posters || []).forEach(([x, y, wd, ht, kind]) => { s += tapaPoster(x, y, wd, ht, kind); });
  if (o.clock) { const [cx, cy, cr] = o.clock; s += at(cx, cy, o.clockK || 1, clockFace(cr, o.tm || 960, { rim: C.navy }), o.clockWob || 0); }
  (o.lamps || [[200, 205], [880, 205]]).forEach(([x, y], i) => { s += warmLamp(x, y, 1.2 * Math.sin(T * 1.6 + i), o.lampR || 1); });
  return s;
}
// barra de madera (top = canto superior); x1 = final derecho (con remate redondeado) o hasta el borde
function barFront(top, x1 = W + 40) {
  const full = x1 >= W;
  let s = `<rect x="-20" y="${top + 30}" width="${f(x1 + 20)}" height="${H - top}" ${full ? '' : 'rx="18"'} fill="${P5.wood}"/>`;
  for (let x = 40; x < x1 - 30; x += 130) s += `<rect x="${x}" y="${top + 30}" width="44" height="${H - top}" fill="${P5.woodS}" opacity="0.55"/>`;
  s += `<rect x="-20" y="${top + 30}" width="${f(x1 + 20)}" height="${H - top}" ${full ? '' : 'rx="18"'} fill="none" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<rect x="-20" y="${top + 8}" width="${f(x1 + 20)}" height="22" fill="${INK}"/>`;
  s += `<rect x="-20" y="${top - 12}" width="${f(x1 + 30)}" height="40" rx="12" fill="#C98A4B" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<path d="M30 ${top - 2} H${f(Math.min(420, x1 - 40))}" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" opacity="0.45" stroke-linecap="round"/>`;
  // reposapiés metálico
  s += `<rect x="-20" y="${top + 380}" width="${f(x1 + 10)}" height="18" rx="9" fill="#C9CED2" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  return s;
}
// grifo de cerveza sobre la barra
function beerTap(x, top) {
  const st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  return `<rect x="${f(x - 22 + 8)}" y="${f(top - 190 + 8)}" width="44" height="190" rx="12" fill="${INK}"/><rect x="${f(x - 22)}" y="${f(top - 190)}" width="44" height="190" rx="12" fill="#C9CED2" ${st}/>
    <rect x="${f(x - 6)}" y="${f(top - 160)}" width="54" height="22" rx="8" fill="#C9CED2" ${st}/><rect x="${f(x + 36)}" y="${f(top - 150)}" width="14" height="36" rx="5" fill="#9AA3AA" ${st}/>
    <rect x="${f(x - 12)}" y="${f(top - 240)}" width="24" height="64" rx="10" fill="${C.red}" ${st}/><path d="M${f(x - 4)} ${f(top - 226)} V${f(top - 192)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" stroke-linecap="round" opacity="0.7"/>`;
}
// fila de tortillas sobre la barra: n = cuántas quedan (las demás son platos con migas)
const TORT_SLOTS = (x0, x1, y, n) => Array.from({ length: n }, (_, i) => [lerp(x0, x1, n === 1 ? 0.5 : i / (n - 1)), y + (i % 2 ? 6 : 0)]);
function counterFood(slots, left, r, o = {}) {
  let s = '';
  slots.forEach(([x, y], i) => {
    s += i < left ? tortillaWhole(x, y, r, { a1: 52 + (i % 3) * 8, a2: 110 + (i % 2) * 10 }) : crumbPlate(x, y + r * 0.42, r * 1.2, i + 1);
  });
  return s;
}

/* ===================== FACHADA Y CALLE ===================== */
// fachada del vídeo 05 con rótulo «LA TORTILLA» crema sobre granate, ventana con luz cálida
function barFacade13(x, base, w, h, o = {}) {
  let s = shop(x, base, w, h, BAR_TORTILLA);
  const top = base - h, py = top + h * 0.045, ph = h * 0.115, sx = x + w * 0.12, sw_ = w * 0.76;
  s += `<rect x="${f(sx + SW)}" y="${f(py + SW)}" width="${f(sw_)}" height="${f(ph)}" rx="${f(ph * 0.25)}" fill="${INK}"/>`;
  s += `<rect x="${f(sx)}" y="${f(py)}" width="${f(sw_)}" height="${f(ph)}" rx="${f(ph * 0.25)}" fill="${C.dred}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  const tr = ph * 0.62;
  s += tortilla(sx + tr * 0.6, py + ph * 0.5, tr, -10);
  const tx = sx + tr * 1.5 + 6, tw = sx + sw_ - tx - 10;
  s += text('LA TORTILLA', tx + tw / 2, py + ph * 0.55, { size: fit('LA TORTILLA', ph * 0.74, tw, 'G'), font: 'G', fill: C.cream, sw: SW * 1.5, sd: 3, ls: 1 });
  // ventana con luz cálida
  const ay = top + h * 0.2, ah = h * 0.15, wy = ay + ah + w * 1.06 / 14 + h * 0.05, wx = x + w * 0.08, ww = w * 0.52, wh = base - h * 0.1 - wy;
  s += `<rect x="${f(wx)}" y="${f(wy)}" width="${f(ww)}" height="${f(wh)}" rx="${f(Math.min(ww, wh) * 0.04)}" fill="${o.night ? '#FFD36B' : '#FFE6A8'}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<path d="M${f(wx + ww * 0.6)} ${f(wy + SW)} L${f(wx + ww * 0.74)} ${f(wy + SW)} L${f(wx + ww * 0.34)} ${f(wy + wh - SW)} L${f(wx + ww * 0.2)} ${f(wy + wh - SW)}Z" fill="#FFFFFF" opacity="0.45"/>`;
  // dentro: lámpara, una tortilla y vasos en el alféizar
  const k = ww / 260;
  s += `<line x1="${f(wx + ww * 0.5)}" y1="${f(wy)}" x2="${f(wx + ww * 0.5)}" y2="${f(wy + wh * 0.18)}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
  s += `<path d="M${f(wx + ww * 0.5 - 30 * k)} ${f(wy + wh * 0.18 + 20 * k)} Q${f(wx + ww * 0.5)} ${f(wy + wh * 0.18 - 14 * k)} ${f(wx + ww * 0.5 + 30 * k)} ${f(wy + wh * 0.18 + 20 * k)}Z" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
  s += tortillaWhole(wx + ww * 0.34, wy + wh * 0.68, 46 * k, { swk: 0.6 });
  s += canaJ(wx + ww * 0.74, wy + wh * 0.92, 56 * k) + canaJ(wx + ww * 0.88, wy + wh * 0.92, 50 * k);
  s += `<rect x="${f(wx)}" y="${f(wy)}" width="${f(ww)}" height="${f(wh)}" rx="${f(Math.min(ww, wh) * 0.04)}" fill="none" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  return s;
}
// pizarra de caballete en la acera con «Tortilla»
function sandwichBoard(x, base, s = 1, label = 'Tortilla') {
  const wd = 170 * s, ht = 230 * s, st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  let g = `<path d="M${f(x - wd / 2 + 10 * s)} ${f(base)} L${f(x - wd * 0.36)} ${f(base - ht)} M${f(x + wd / 2 - 10 * s)} ${f(base)} L${f(x + wd * 0.36)} ${f(base - ht)}" stroke="${INK}" stroke-width="${f(SW * 2.4)}" stroke-linecap="round"/>`;
  g += `<path d="M${f(x - wd / 2 + 10 * s)} ${f(base)} L${f(x - wd * 0.36)} ${f(base - ht)} M${f(x + wd / 2 - 10 * s)} ${f(base)} L${f(x + wd * 0.36)} ${f(base - ht)}" stroke="${P5.wood}" stroke-width="${f(SW)}" stroke-linecap="round"/>`;
  g += `<rect x="${f(x - wd / 2 + 8)}" y="${f(base - ht - 10 + 8)}" width="${f(wd)}" height="${f(ht * 0.78)}" rx="${f(12 * s)}" fill="${INK}"/>`;
  g += `<rect x="${f(x - wd / 2)}" y="${f(base - ht - 10)}" width="${f(wd)}" height="${f(ht * 0.78)}" rx="${f(12 * s)}" fill="${P5.wood}" ${st}/>`;
  g += `<rect x="${f(x - wd / 2 + 12 * s)}" y="${f(base - ht + 2 * s)}" width="${f(wd - 24 * s)}" height="${f(ht * 0.78 - 24 * s)}" rx="${f(6 * s)}" fill="#26302C" ${st}/>`;
  g += text(label, x, base - ht + 36 * s, { size: fit(label, 40 * s, wd - 40 * s), fill: '#FFFFFF', stroke: null });
  g += tortillaWhole(x, base - ht + 100 * s, 38 * s, { swk: 0.6 });
  return g;
}
// farola; lit = encendida (luz amarilla plana)
function lampPost13(x, base, top, lit = false) {
  let s = '';
  if (lit) s += `<path d="M${f(x - 30)} ${f(top - 10)} L${f(x + 30)} ${f(top - 10)} L${f(x + 120)} ${f(base)} L${f(x - 120)} ${f(base)}Z" fill="#FFE7A3" opacity="0.55"/>`;
  s += lampPost10(x, base, top);
  if (lit) s += `<path d="M${f(x - 26)} ${f(top)} H${f(x + 26)} L${f(x + 16)} ${f(top - 46)} H${f(x - 16)}Z" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>
    <path d="M${f(x - 32)} ${f(top - 46)} H${f(x + 32)} L${f(x)} ${f(top - 70)}Z" fill="${C.navy}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>
    <circle cx="${f(x)}" cy="${f(top - 23)}" r="9" fill="#FFFFFF"/>`;
  return s;
}
// cielos de la serie según la hora
const SKY13 = {
  day: { top: '#BFE3F2', band: '#E4F4FA', cloud: '#FFFFFF' },
  eve: { top: '#F7C9A3', band: '#FBE3C8', cloud: C.cream },
  dusk: { top: '#F4A58A', band: '#F9D0B4', cloud: '#FAD3CC' }
};
const CL13 = [{ x0: 80, y: 250, s: 0.8, v: 12 }, { x0: 560, y: 420, s: 1.0, v: 20 }, { x0: 980, y: 300, s: 0.65, v: 8 }, { x0: 1350, y: 520, s: 0.9, v: 15 }, { x0: 1700, y: 220, s: 0.7, v: 10 }];
function sky13(T, kind, o = {}) {
  const k = SKY13[kind], band = o.band || 900;
  let s = `<rect width="${W}" height="${H}" fill="${k.top}"/><rect y="${band}" width="${W}" height="${H}" fill="${k.band}"/>`;
  if (kind === 'dusk') s += sunsetSun(o.sx || 820, o.sy || 1180, o.sr || 80, T * 6);
  else s += sun(o.sx || 880, o.sy || 300, o.sr || 62, T * 10);
  const span = W + 900;
  (o.clouds || CL13).forEach(c => { const x = (((c.x0 - c.v * T) % span) + span) % span - 420; s += cloud(x, c.y, c.s, k.cloud); });
  return s;
}

/* ===================== TARJETA DE OFERTA FLASH ===================== */
// logo.png (solo icono, sin letras) para poner junto al nombre escrito
function logoI13(cx, cy, size) { return `<svg x="${f(cx - size / 2)}" y="${f(cy - size / 2)}" width="${f(size)}" height="${f(size)}" viewBox="0 0 500 500"><use href="#logoI"/></svg>`; }
function flashStamp(x, y, r, k, rot) {
  if (k <= 0.01) return '';
  const d = starPath(r, r * 0.8, 16);
  let g = `<path d="${d}" transform="translate(${f(r * 0.07)} ${f(r * 0.07)})" fill="${INK}"/><path d="${d}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
  g += `<path d="${boltPath(r * 0.5)}" transform="translate(${f(r * 0.03)} ${f(-r * 0.16)})" fill="${INK}"/><path d="${boltPath(r * 0.5)}" transform="translate(0 ${f(-r * 0.2)})" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linejoin="round"/>`;
  g += text('FLASH', 0, r * 0.42, { size: fit('FLASH', r * 0.42, r * 1.3, 'G'), font: 'G', sw: SW * 1.4, sd: 3, ls: 1 });
  return at(x, y, k, g, rot);
}
// dibujo grande de pincho + caña (centrado en x, apoyado en base)
function pinchoCana(x, base, s = 1) {
  return pinchoPlate(x - 70 * s, base - 12 * s, 1.9 * s) + canaJ(x + 110 * s, base, 150 * s);
}
// pantalla de publicación. o: kSeal, press (0..1 hundido), done (bool), kDone
function flashScreen(o = {}, t = 0) {
  return (sx, sy, sw, sh) => {
    const hh = 160;
    let g = `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" fill="${C.cream}"/>`;
    for (let yy = sy + hh + 30; yy < sy + sh; yy += 44) for (let xx = sx + 22; xx < sx + sw; xx += 44) g += `<circle cx="${xx}" cy="${yy}" r="3.5" fill="${DOT}" opacity="0.6"/>`;
    g += `<rect x="${sx}" y="${sy}" width="${sw}" height="${hh}" fill="${C.red}"/><line x1="${sx}" y1="${sy + hh}" x2="${sx + sw}" y2="${sy + hh}" ${st12()}/>`;
    const lr = hh * 0.36;
    g += `<circle cx="${f(sx + 30 + lr)}" cy="${f(sy + hh / 2 + 4)}" r="${f(lr)}" fill="#FFFFFF" ${st12(0.8)}/>` + logoI13(sx + 30 + lr, sy + hh / 2 + 4, lr * 1.75);
    g += text('Escaparate de Tudela', sx + 30 + lr * 2 + 22, sy + hh / 2 + 4, { size: fit('Escaparate de Tudela', 54, sw - lr * 2 - 80), anchor: 'start', sw: SW * 1.4, sd: 4 });
    const x = sx + 26, y = sy + hh + 28, wd = sw - 52, ht = 730;
    g += panel(x, y, wd, ht, 34, '#FFFFFF', 12);
    const ih = 300;
    g += `<rect x="${x + 20}" y="${y + 20}" width="${wd - 40}" height="${ih}" rx="24" fill="#FFF1C9" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
    g += `<circle cx="${x + wd / 2}" cy="${y + 20 + ih * 0.56}" r="${f(ih * 0.4)}" fill="#FFFFFF" opacity="0.85"/>`;
    g += pinchoCana(x + wd / 2 - 40, y + ih - 6, 1.05);
    g += sparkle(x + 80, y + 90, 22, 0.6 + 0.4 * Math.sin(t * 7)) + sparkle(x + wd / 2 + 60, y + 70, 16, 0.6 + 0.4 * Math.sin(t * 6 + 2));
    g += flashStamp(x + wd - 100, y + 108, 80, o.kSeal === undefined ? 1 : o.kSeal, -10);
    let ty = y + ih + 74;
    g += text('La Tortilla', x + 36, ty, { size: fit('La Tortilla', 76, wd - 300), anchor: 'start', fill: INK, stroke: null });
    g += pill(x + wd - 36 - 115, ty, 230, 66, C.red, 'Oferta flash', { size: 38 });
    ty += 86;
    const l1 = 'Pincho de tortilla + bebida · 3,50 €';
    g += text(l1, x + 36, ty, { size: fit(l1, 46, wd - 72), anchor: 'start', fill: INK, stroke: null });
    ty += 70;
    g += at(x + 62, ty, 1, clockFace(24, 18 * 60, { rim: C.yel }));
    g += text('De 18:00 a 20:00', x + 102, ty + 2, { size: 46, anchor: 'start', fill: C.red, stroke: INK, sw: SW * 1.2, sd: 3 });
    // botón Publicar / Publicada
    const by = y + ht - 92, bw = wd - 80, press = o.press || 0;
    const bk = 1 - 0.07 * press;
    if (!o.done) {
      g += at(x + wd / 2, by, bk, pill(0, 0, bw, 112, C.red, 'Publicar', { size: 60 }));
    } else {
      const kd = o.kDone === undefined ? 1 : o.kDone;
      g += at(x + wd / 2, by, lerp(0.85, 1, kd), pill(0, 0, bw, 112, C.green, 'Publicada', { size: 58, dx: 34 }) + checkCircle(-bw / 2 + 210, 0, 34, 1));
    }
    return g;
  };
}
// mano grande que pulsa (mundo): punta del índice en (x,y)
function bigFinger(x, y, s = 1) {
  const w = v => f(v * SW / 3 * 2.2), hs = 10 * s;
  // antebrazo desde abajo a la derecha
  const E = [x + 330 * s, y + 520 * s], Hh = [x + 62 * s, y + 92 * s];
  let g = capsule([E, Hh], 92 * s, J.skin, w) + capsule([[E[0] + 40 * s, E[1] + 60 * s], [lerp(E[0], Hh[0], 0.3), lerp(E[1], Hh[1], 0.3)]], 120 * s, J.shirt, w);
  g += hand11('point', Hh, v => f(+w(v) * 1), { hs: hs, dir: -122, fill: J.skin });
  return g;
}
