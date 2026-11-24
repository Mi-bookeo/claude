/* Vídeo 14 — «Ana y el cuentacuentos». Piezas nuevas sobre lib.js + series.js + rosa.js + v04…v13.js:
   Ana (librera, personaje nuevo; suelo local en y=208, de frente), la cuentacuentos sentada en el puf, niños y niñas
   de cuerpo entero (de pie, sentados, saltando), adultos nuevos de la serie (madre de chaqueta amarilla, padre de
   chaqueta gris con mochila, abuelo con boina), fachada de la librería (toldo verde y crema, campanilla, rótulo
   «LIBRERÍA»), caballete con pizarra, interior de la librería (estanterías, escalera, lámpara, ventana, rincón
   infantil), cartulina en blanco, sala vacía del año pasado (sillas, telaraña, mosca), tarjeta de evento y dragón. */
'use strict';

const AN = {
  jer: '#3C9D5D', jerS: '#2C7A47', jean: '#3F7CC4', jeanS: '#2B5A99', shoe: '#7A4A2A', hair: '#4A2E1F', hairS: '#36200F',
  hairL: '#6B4630', clip: '#F2C12E', cheek: '#F29C9C', skin: '#F6C9A0', skinS: '#E9B88F', lip: '#C2185B',
  wood: '#A9743F', woodS: '#7E5328', woodL: '#C98A4B', purple: '#7E57C2', purpleS: '#5E3FA0', orange: '#F28C3A',
  dull: '#B9B2AE'
};
const st14 = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
const stA = (w, v = 3) => `stroke="${INK}" stroke-width="${w(v)}" stroke-linejoin="round"`;
const breathA = (T, sc) => -6 / sc * (0.5 - 0.5 * Math.cos(2 * PI * T / 1.6)); // 2 px (base 380) cada 1,6 s
const blinkA = (T, off = 0) => ((T + off) % 3.4) < 0.12;
const talkA = (t, ranges, rate = 9) => ranges.some(([a, b]) => t >= a && t < b) ? 0.5 + 0.5 * Math.sin(t * rate) * Math.sin(t * rate * 0.37 + 1) : 0;

/* ===================== ANA ===================== */
// cara (local; cabeza centrada en 190,76, de frente)
function anaFace(o, w) {
  const e = o.expr || 'happy', lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const L = (d, sw = 1.6, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const dotEye = (cx, cy, r = 1.9) => `<circle cx="${f(cx + lx)}" cy="${f(cy + ly)}" r="${r}" fill="${INK}"/><circle cx="${f(cx + lx + 0.6)}" cy="${f(cy + ly - 0.6)}" r="0.6" fill="#FFFFFF"/>`;
  const big = (cx, cy, r = 3.7) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.5)}"/><circle cx="${f(cx + lx * 0.6)}" cy="${f(cy + ly * 0.6)}" r="${f(r * 0.48)}" fill="${INK}"/><circle cx="${f(cx + lx * 0.6 + 0.7)}" cy="${f(cy + ly * 0.6 - 0.7)}" r="0.6" fill="#FFFFFF"/>`;
  const shine = (cx, cy) => `<circle cx="${f(cx + lx)}" cy="${f(cy + ly)}" r="2.8" fill="${INK}"/><circle cx="${f(cx + lx + 0.9)}" cy="${f(cy + ly - 1)}" r="1.05" fill="#FFFFFF"/><circle cx="${f(cx + lx - 0.9)}" cy="${f(cy + ly + 1)}" r="0.5" fill="#FFFFFF"/>`;
  const lash = (cx, cy, dir) => L(`M${f(cx + dir * 2.2)} ${f(cy - 1.4)} l${f(dir * 1.6)} -1.2`, 1.2);
  let s = '';
  const ck = e === 'sad' || e === 'sigh' ? 0.5 : 0.85;
  s += `<circle cx="180.4" cy="84.4" r="3.5" fill="${AN.cheek}" opacity="${ck}"/><circle cx="199.6" cy="84.4" r="3.5" fill="${AN.cheek}" opacity="${ck}"/>`;
  // ojos
  const closedHappy = 'M181.8 78.6 Q184.5 75.2 187.2 78.6 M192.8 78.6 Q195.5 75.2 198.2 78.6';
  if (o.blink && !['joy', 'proud', 'sigh'].includes(e)) s += L('M182 78 Q184.5 79.2 187 78 M193 78 Q195.5 79.2 198 78', 1.6);
  else if (e === 'sad') {
    s += dotEye(184.5, 78.8, 1.7) + dotEye(195.5, 78.8, 1.7);
    s += `<path d="M181.6 78.4 A2.9 2.9 0 0 1 187.4 78.4Z M192.6 78.4 A2.9 2.9 0 0 1 198.4 78.4Z" fill="${AN.skin}"/>` + L('M181.8 78.4 H187.2 M192.8 78.4 H198.2', 1.4);
  } else if (e === 'sigh') s += L('M181.8 77.6 Q184.5 80 187.2 77.6 M192.8 77.6 Q195.5 80 198.2 77.6', 1.7) + lash(184.5, 78.6, -1) + lash(195.5, 78.6, 1);
  else if (e === 'surprise' || e === 'amazed' || e === 'idea') s += big(184.5, 77.4) + big(195.5, 77.4) + lash(184.5, 76.6, -1.3) + lash(195.5, 76.6, 1.3);
  else if (e === 'determined') s += shine(184.5, 77.8) + shine(195.5, 77.8) + lash(184.5, 77.4, -1.1) + lash(195.5, 77.4, 1.1);
  else if (e === 'joy' || e === 'proud') s += L(closedHappy, 1.8) + lash(184.5, 77.6, -1) + lash(195.5, 77.6, 1);
  else if (e === 'wink') s += L('M181.8 78.6 Q184.5 75.2 187.2 78.6', 1.8) + dotEye(195.5, 77.8) + lash(195.5, 77.8, 1);
  else s += dotEye(184.5, 77.8) + dotEye(195.5, 77.8) + lash(184.5, 77.6, -1) + lash(195.5, 77.6, 1);
  // cejas castañas
  const brow = d => L(d, 1.9, AN.hairS);
  if (e === 'sad' || e === 'sigh') s += brow('M181 72.2 Q184 71.6 187.2 70.4 M192.8 70.4 Q196 71.6 199 72.2');
  else if (e === 'doubt' || e === 'think') s += brow('M181 71.4 Q184 69.8 187.4 71 M192.8 72.2 Q196 71.6 199 72.6');
  else if (e === 'surprise' || e === 'amazed' || e === 'idea') s += brow('M180.8 69.8 Q184 66.8 187.6 69 M192.4 69 Q196 66.8 199.2 69.8');
  else if (e === 'determined') s += brow('M181 71 Q184 70.4 187.6 72 M192.4 72 Q196 70.4 199 71');
  else s += brow('M181 71.6 Q184 69.8 187.4 71 M192.6 71 Q196 69.8 199 71.6');
  // nariz
  s += L('M189.4 80.6 Q190.6 84.4 192 82.6', 1.4);
  // boca
  const m = clamp(o.talk || 0);
  if (e === 'sad') s += L('M186.4 90.4 Q190 87.6 193.6 90.4', 1.8);
  else if (e === 'sigh') s += `<ellipse cx="190.6" cy="89.4" rx="1.9" ry="2.2" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.4)}"/>`;
  else if (e === 'doubt') s += L('M186.2 89.4 Q187.8 88 189.6 89.4 Q191.4 90.8 193.6 89', 1.8);
  else if (e === 'think') s += L('M187.6 89.6 Q190.2 90.6 193 88.8', 1.8);
  else if (e === 'surprise') s += `<ellipse cx="190" cy="90" rx="2.7" ry="3.3" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
  else if (e === 'amazed' || e === 'joy' || e === 'idea' || e === 'determined' || e === 'proud' || m > 0.05) {
    const h = e === 'amazed' || e === 'joy' ? 7.4 : e === 'proud' || e === 'determined' ? 5.6 : lerp(3.4, 7, m);
    const wd = e === 'proud' || e === 'determined' ? 5.2 : 5.4;
    s += `<path d="M${f(190 - wd)} 87.8 Q190 ${f(87.8 + h * 1.3)} ${f(190 + wd)} 87.8Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
    if (h > 4.4) s += `<path d="M${f(190 - wd * 0.62)} ${f(87.8 + h * 0.55)} Q190 ${f(87.8 + h * 0.95)} ${f(190 + wd * 0.62)} ${f(87.8 + h * 0.55)}Z" fill="${C.pink}"/>`;
    s += `<path d="M${f(190 - wd + 0.8)} 88.2 H${f(190 + wd - 0.8)}" stroke="#FFFFFF" stroke-width="${w(1.3)}" stroke-linecap="round"/>`;
  } else s += L('M185.6 88.4 Q190 92.4 194.4 88.4', 1.9);
  return s;
}
// brazo con jersey verde de manga larga: hombro→codo→puño, mano de piel
function armA(S, A, w) {
  const { E, H } = ik2(S, A.h, A.side || 1, A.L || 18);
  const cuff = [lerp(E[0], H[0], 0.8), lerp(E[1], H[1], 0.8)];
  let g = capsule([S, E, cuff], 9.8, AN.jer, w);
  g += capsule([lerp2(E, H, 0.7), cuff], 10.6, AN.jerS, w);
  if (A.item) g += A.item(H, w);
  g += aHand(A, H, w);
  return g;
}
const lerp2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
function aHand(A, H, w) {
  const kind = A.hand || 'fist';
  if (kind === 'snap') return snapHand(w, H, A.snapK || 0, A.hs || 1.4);
  if (kind === 'none') return '';
  return hand11(kind, H, w, Object.assign({ fill: AN.skin, hs: 1.3 }, A));
}
// libro pequeño en la mano (local); col = tapa
function heldBook(col, rot = -8, s = 1) {
  return (H, w) => `<g transform="translate(${f(H[0])} ${f(H[1] - 5 * s)}) rotate(${rot}) scale(${s})">
    <rect x="-9" y="-12" width="18" height="24" rx="1.6" fill="${col}" ${stA(w, 2)}/><rect x="-9" y="-12" width="4" height="24" rx="1.2" fill="${INK}" opacity="0.25"/>
    <rect x="-3" y="-7" width="9" height="5" rx="1" fill="#FFFFFF" ${stA(w, 1)}/></g>`;
}
// Ana en coordenadas locales (suelo y=208, de frente).
// o: expr, blink, look, talk, bob, head, lean, walk (fase), armF/armB {h:[x,y], side, hand, hs, item} | arms:'phone'|'cheeks', under(w), front(w)
function ana(o) {
  const k = o.k || 1, w = v => f(v * k);
  const SF = [206, 104], SB = [174, 104];
  let g = '';
  // piernas (vaqueros) y zapatos marrones; al andar de frente, una pierna se levanta y la otra apoya
  const wl = o.walk === undefined ? 0 : Math.sin(o.walk), upL = 4 * Math.max(0, wl), upR = 4 * Math.max(0, -wl);
  const leg = (x, up, shoeD) => `<g transform="translate(0 ${f(-up)})"><rect x="${x}" y="144" width="11.5" height="${f(58 - 0)}" rx="4" fill="${AN.jean}" ${stA(w)}/>` +
    `<path d="M${x + 3} 150 V196" stroke="${AN.jeanS}" stroke-width="${w(1.4)}" stroke-linecap="round"/>` +
    `<path d="${shoeD}" fill="${AN.shoe}" ${stA(w)}/></g>`;
  g += leg(177.5, upL, 'M174 201 h15 a3 3 0 0 1 3 3 v4 h-20 a3 3 0 0 1 2 -7z');
  g += leg(191, upR, 'M191 201 h15 a3 3 0 0 1 2 7 h-20 v-4 a3 3 0 0 1 3 -3z');
  let b = '';
  // pelo trasero (melena ondulada hasta los hombros)
  b += `<path d="M190 53 Q168.6 53 171.4 74 Q167.6 86 171 95 Q167 101 172.4 106.4 Q179.4 109.6 184 103.4 L185 88 L195 88 L196 103.4 Q200.6 109.6 207.6 106.4 Q213 101 209 95 Q212.4 86 208.6 74 Q211.4 53 190 53Z" fill="${AN.hair}" ${stA(w)}/>`;
  // torso con jersey verde
  const torso = 'M174.6 99 Q190 94.4 205.4 99 Q211.6 103.6 211.4 120 Q212 137 206.4 150 H173.6 Q168 137 168.6 120 Q168.4 103.6 174.6 99Z';
  b += `<path d="${torso}" fill="${AN.jer}"/><path d="M174.6 99 Q179 97.4 181 97 L179 150 H173.6 Q168 137 168.6 120 Q168.4 103.6 174.6 99Z" fill="${AN.jerS}"/><path d="${torso}" fill="none" ${stA(w)}/>`;
  b += `<path d="M171.6 144.6 H208.4" stroke="${INK}" stroke-width="${w(1.3)}"/><path d="M176 145 V150 M182 145 V150 M188 145 V150 M194 145 V150 M200 145 V150" stroke="${AN.jerS}" stroke-width="${w(1)}"/>`;
  // cuello y cuello redondo del jersey
  b += `<rect x="185.4" y="88" width="9.2" height="10" rx="2" fill="${AN.skinS}" ${stA(w, 2.4)}/>`;
  b += `<path d="M182.4 96.6 Q190 103.4 197.6 96.6" fill="none" stroke="${INK}" stroke-width="${w(4.6)}" stroke-linecap="round"/><path d="M182.4 96.6 Q190 103.4 197.6 96.6" fill="none" stroke="${AN.jerS}" stroke-width="${w(2)}" stroke-linecap="round"/>`;
  if (o.under) b += o.under(w);
  // brazos
  if (o.arms === 'phone') {
    const ph = o.typePh || 0;
    b += capsule([SB, [175, 127]], 9.8, AN.jer, w) + capsule([SF, [205, 127]], 9.8, AN.jer, w);
    b += capsule([[176, 127], [184.4, 120.6]], 9.4, AN.jer, w) + capsule([[204, 127], [195.6, 120.6]], 9.4, AN.jer, w);
    b += `<g transform="rotate(-4 190 112)"><rect x="181" y="96.6" width="18" height="30" rx="3.2" fill="${INK}" ${stA(w, 2)}/>` + miniEventScreen(183, 99.2, 14, 25, o.done, w) + `</g>`;
    const a = Math.max(0, Math.sin(ph * PI)), c = Math.max(0, -Math.sin(ph * PI));
    b += `<circle cx="184" cy="121" r="4.3" fill="${AN.skin}" ${stA(w, 2.2)}/><circle cx="196" cy="121" r="4.3" fill="${AN.skin}" ${stA(w, 2.2)}/>`;
    b += `<rect x="${f(184.6 + a * 1.2)}" y="${f(113 - a * 2.4)}" width="4.6" height="7" rx="2.3" fill="${AN.skin}" ${stA(w, 1.6)}/>`;
    b += `<rect x="${f(190.8 - c * 1.2)}" y="${f(113 - c * 2.4)}" width="4.6" height="7" rx="2.3" fill="${AN.skin}" ${stA(w, 1.6)}/>`;
  } else if (o.arms === 'cheeks') {
    b += capsule([SB, [170.6, 120]], 9.8, AN.jer, w) + capsule([SF, [209.4, 120]], 9.8, AN.jer, w);
  } else if (o.armB) b += armA(SB, o.armB, w);
  // cabeza
  let hd = '';
  hd += `<path d="M175.4 74 Q175.6 91 190 94 Q204.4 91 204.6 74 Q204.6 58.4 190 58.4 Q175.4 58.4 175.4 74Z" fill="${AN.skin}" ${stA(w)}/>`;
  // flequillo ondulado con raya al lado y pinza amarilla
  hd += `<path d="M174.4 79 Q171.4 57 190 55.8 Q208.6 57 205.6 79 Q204.6 70.4 200.4 65.2 Q194.6 70.6 186.4 68 Q180 68.6 177.4 73.4 Q175.6 75.6 174.4 79Z" fill="${AN.hair}" ${stA(w)}/>`;
  hd += `<path d="M181 61.6 Q186 59.4 191.4 61 M194 62.6 Q198.6 62 202 65.6 M177.6 70 Q179 65 182.6 63.4" stroke="${AN.hairL}" stroke-width="${w(1.3)}" stroke-linecap="round" fill="none"/>`;
  hd += `<g transform="rotate(-28 203.6 62.6)"><rect x="198.4" y="60.2" width="10.4" height="4.8" rx="2.2" fill="${AN.clip}" ${stA(w, 1.8)}/><path d="M201 60.6 V64.6 M203.6 60.6 V64.6 M206.2 60.6 V64.6" stroke="${INK}" stroke-width="${w(0.9)}"/></g>`;
  hd += anaFace(o, w);
  b += `<g transform="rotate(${f(o.head || 0)} 190 96)">${hd}</g>`;
  if (o.arms === 'cheeks') {
    // antebrazos hasta las mejillas, manos abiertas
    const jig = o.jig || 0;
    b += capsule([[170.6, 120], [174.6, 96 + jig]], 9.4, AN.jer, w) + capsule([[209.4, 120], [205.4, 96 + jig]], 9.4, AN.jer, w);
    b += hand11('open', [175.4, 91 + jig], w, { fill: AN.skin, hs: 1.15, hrot: -34 });
    b += hand11('open', [204.6, 91 + jig], w, { fill: AN.skin, hs: 1.15, hrot: 34 });
  }
  if (!o.arms && o.armF) b += armA(SF, o.armF, w);
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  if (o.lean) g = `<g transform="rotate(${f(o.lean)} 190 208)">${g}</g>`;
  return g;
}
// (px,py) = punto del suelo bajo Ana (local 190,208)
function placeAna(px, py, sc, o) {
  o.k = SW / (3 * sc);
  return `<g transform="translate(${f(px - 190 * sc)} ${f(py - 208 * sc)}) scale(${f(sc)})">${ana(o)}</g>`;
}
const aPt = (px, py, sc, lx, ly) => [px + (lx - 190) * sc, py + (ly - 208) * sc];
const AP = {
  restF: { h: [212, 140], side: -1, hand: 'fist', hs: 1.2 },
  restB: { h: [168, 140], side: 1, hand: 'fist', hs: 1.2 },
  counterF: { h: [213, 134], side: -1, hand: 'fist', hs: 1.2 },
  counterB: { h: [167, 134], side: 1, hand: 'fist', hs: 1.2 },
  thumbF: { h: [221, 98], side: 1, hand: 'thumb', hs: 1.5 },
  snapF: { h: [222, 92], side: 1, hand: 'snap', hs: 1.45 },
  waveF: { h: [224, 82], side: 1, hand: 'open', hs: 1.45 }
};
// pantalla mini de la tarjeta de evento (local, en los móviles pequeños)
function miniEventScreen(x, y, wd, ht, done, w) {
  const u = wd / 14;
  let g = `<rect x="${x}" y="${y}" width="${wd}" height="${ht}" rx="${f(1.8 * u)}" fill="#FFFFFF"/>`;
  g += `<rect x="${x}" y="${y}" width="${wd}" height="${f(4.6 * u)}" fill="${C.red}"/><circle cx="${f(x + 2.6 * u)}" cy="${f(y + 2.3 * u)}" r="${f(1.4 * u)}" fill="#FFFFFF"/>`;
  g += `<rect x="${f(x + 1.4 * u)}" y="${f(y + 6.2 * u)}" width="${f(11.2 * u)}" height="${f(7.4 * u)}" rx="${f(u)}" fill="#FFF1C9" stroke="${INK}" stroke-width="${w(0.6)}"/>`;
  g += `<path d="M${f(x + 3.4 * u)} ${f(y + 11.4 * u)} L${f(x + 7 * u)} ${f(y + 12.4 * u)} L${f(x + 10.6 * u)} ${f(y + 11.4 * u)} V${f(y + 9 * u)} L${f(x + 7 * u)} ${f(y + 10 * u)} L${f(x + 3.4 * u)} ${f(y + 9 * u)}Z" fill="${C.red}" stroke="${INK}" stroke-width="${w(0.5)}" stroke-linejoin="round"/>`;
  g += `<circle cx="${f(x + 7 * u)}" cy="${f(y + 7.8 * u)}" r="${f(0.9 * u)}" fill="${C.yel}" stroke="${INK}" stroke-width="${w(0.4)}"/>`;
  g += `<rect x="${f(x + 1.4 * u)}" y="${f(y + 15 * u)}" width="${f(9 * u)}" height="${f(1.6 * u)}" rx="${f(0.8 * u)}" fill="${INK}" opacity="0.6"/><rect x="${f(x + 1.4 * u)}" y="${f(y + 17.6 * u)}" width="${f(6 * u)}" height="${f(1.6 * u)}" rx="${f(0.8 * u)}" fill="${C.red}" opacity="0.8"/>`;
  g += `<rect x="${f(x + 1.4 * u)}" y="${f(y + 20.4 * u)}" width="${f(11.2 * u)}" height="${f(3.4 * u)}" rx="${f(1.7 * u)}" fill="${done ? C.green : C.red}" stroke="${INK}" stroke-width="${w(0.5)}"/>`;
  return g;
}

/* ===================== LA CUENTACUENTOS (sentada en el puf) ===================== */
const CC = { hair: '#D9824B', hairS: '#B5652F', cape: '#2D4A6B', capeS: '#22394F', dress: '#D32F2F', dressS: '#A32323', tights: '#7E57C2',
  shoe: '#F2C12E', hatB: '#7E57C2', hatC: '#F48FB1', band: '#F2C12E', feather: '#3C9D5D', skin: '#F6C9A0', skinS: '#E9B88F' };
// puf (local, suelo 208): cojín grande morado con costuras
function pufL(w, cx = 190, base = 208, wd = 70, ht = 42, col = AN.purple, colS = AN.purpleS) {
  const x0 = cx - wd / 2, top = base - ht;
  let g = `<path d="M${x0} ${base - 6} Q${x0 - 3} ${top + 10} ${x0 + 8} ${top + 4} Q${cx} ${top - 6} ${x0 + wd - 8} ${top + 4} Q${x0 + wd + 3} ${top + 10} ${x0 + wd} ${base - 6} Q${cx} ${base + 4} ${x0} ${base - 6}Z" fill="${col}" ${stA(w)}/>`;
  g += `<path d="M${x0 + 4} ${base - 4} Q${cx - wd * 0.3} ${base + 1} ${cx - wd * 0.12} ${base} L${cx - wd * 0.2} ${top + 2} Q${x0 + 4} ${top + 6} ${x0 + 4} ${base - 4}Z" fill="${colS}" opacity="0.7"/>`;
  g += `<path d="M${cx - wd * 0.16} ${top + 1} Q${cx - wd * 0.2} ${top + ht * 0.5} ${cx - wd * 0.14} ${base + 1} M${cx + wd * 0.18} ${top + 1} Q${cx + wd * 0.22} ${top + ht * 0.5} ${cx + wd * 0.16} ${base + 1}" stroke="${INK}" stroke-width="${w(1.3)}" fill="none" stroke-linecap="round"/>`;
  g += `<path d="M${x0} ${base - 6} Q${x0 - 3} ${top + 10} ${x0 + 8} ${top + 4} Q${cx} ${top - 6} ${x0 + wd - 8} ${top + 4} Q${x0 + wd + 3} ${top + 10} ${x0 + wd} ${base - 6} Q${cx} ${base + 4} ${x0} ${base - 6}Z" fill="none" ${stA(w)}/>`;
  return g;
}
// libro grande abierto (local, centro cx,cy; s escala). pages: dibujo del dragón en la página derecha
function bigBookL(w, cx, cy, s = 1, rot = -6, flip = 0) {
  const st = v => stA(w, v);
  let g = `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(rot)}) scale(${f(s)})">`;
  g += `<path d="M-26 -14 Q-13 -19 0 -14 Q13 -19 26 -14 V12 Q13 7 0 12 Q-13 7 -26 12Z" transform="translate(2 2)" fill="${INK}"/>`;
  g += `<path d="M-27 -13 V14 Q-13 9.6 0 14 Q13 9.6 27 14 V-13" fill="${C.red}" ${st(2.2)}/>`;
  g += `<path d="M-25 -14 Q-12.5 -19 0 -14 V12 Q-12.5 7.4 -25 12Z" fill="#FFFFFF" ${st(2)}/>`;
  g += `<path d="M25 -14 Q12.5 -19 0 -14 V12 Q12.5 7.4 25 12Z" fill="#FFFFFF" ${st(2)}/>`;
  // páginas: líneas a la izquierda, estrella y montaña a la derecha
  g += `<path d="M-21 -9 Q-12 -12 -4 -9 M-21 -4 Q-12 -7 -4 -4 M-21 1 Q-12 -2 -4 1 M-21 6 Q-14 3.6 -8 5" stroke="${INK}" stroke-width="${w(1)}" stroke-linecap="round" fill="none" opacity="0.55"/>`;
  g += `<path d="M4 7 L10 -2 L14 3 L17 -1 L22 7Z" fill="${C.green}" ${st(1)}/><path d="${starPath(3.6, 1.6, 5)}" transform="translate(15 -8)" fill="${C.yel}" ${st(0.9)}/>`;
  g += `</g>`;
  return g;
}
// o: gest (0..1 gesto del brazo), talk, blink, look, bob, page (pasa página)
function storyteller(o) {
  const k = o.k || 1, w = v => f(v * k);
  const st = v => stA(w, v);
  let g = '';
  g += pufL(w, 190, 208, 74, 44);
  const lift = o.bob || 0;
  let b = '';
  // capa por detrás (azul marino con estrellas)
  const cape = 'M178 116 Q160 140 158 182 Q174 190 190 186 Q206 190 222 182 Q220 140 202 116Z';
  b += `<path d="${cape}" fill="${CC.cape}" ${st(3)}/>`;
  [[166, 160, 3.4], [172, 176, 2.6], [212, 164, 3.2], [207, 178, 2.4], [164, 142, 2.2], [216, 145, 2.4]].forEach(([x, y, r]) => { b += `<path d="${starPath(r, r * 0.45, 5)}" transform="translate(${x} ${y})" fill="${C.yel}" ${st(0.8)}/>`; });
  // piernas: rodillas hacia delante, espinillas hasta el suelo
  b += `<rect x="176" y="160" width="12" height="16" rx="5" fill="${CC.tights}" ${st(2.6)}/><rect x="192" y="160" width="12" height="16" rx="5" fill="${CC.tights}" ${st(2.6)}/>`;
  b += `<rect x="177" y="172" width="10" height="30" rx="4" fill="${CC.tights}" ${st(2.6)}/><rect x="193" y="172" width="10" height="30" rx="4" fill="${CC.tights}" ${st(2.6)}/>`;
  b += `<path d="M174 200 h13 a3 3 0 0 1 3 3 v4 h-18 a3 3 0 0 1 2 -7z" fill="${CC.shoe}" ${st(2.6)}/><path d="M193 200 h13 a3 3 0 0 1 2 7 h-18 v-4 a3 3 0 0 1 3 -3z" fill="${CC.shoe}" ${st(2.6)}/>`;
  // vestido rojo (falda sobre los muslos)
  b += `<path d="M178 122 Q190 118 202 122 L207 164 Q190 170 173 164Z" fill="${CC.dress}" ${st(3)}/><path d="M178 122 L184 121 L181 167 Q176 166 173 164Z" fill="${CC.dressS}"/><path d="M178 122 Q190 118 202 122 L207 164 Q190 170 173 164Z" fill="none" ${st(3)}/>`;
  // solapas de la capa por delante de los hombros y broche de estrella
  b += `<path d="M178 116 Q171 124 168 140 L176 142 Q178 128 186 120Z" fill="${CC.cape}" ${st(2.6)}/><path d="M202 116 Q209 124 212 140 L204 142 Q202 128 194 120Z" fill="${CC.cape}" ${st(2.6)}/>`;
  b += `<rect x="186.4" y="106" width="7.2" height="10" rx="2" fill="${CC.skinS}" ${st(2.2)}/>`;
  b += `<path d="${starPath(4.4, 2, 5)}" transform="translate(190 119)" fill="${C.yel}" ${st(1.2)}/>`;
  // brazo izquierdo (pantalla) sujeta el libro grande abierto sobre el regazo
  b += capsule([[176, 122], [170, 140], [176, 150]], 8.6, CC.dress, w);
  // pelo rizado detrás de la cabeza
  let hair = '';
  [[174, 92, 6.4], [172, 102, 6], [175, 111, 5.4], [206, 92, 6.4], [208, 102, 6], [205, 111, 5.4], [180, 84, 6], [200, 84, 6]].forEach(([x, y, r]) => { hair += `<circle cx="${x}" cy="${y}" r="${r}"/>`; });
  b += `<g fill="${CC.hair}" stroke="${INK}" stroke-width="${w(2.4)}">${hair}</g><g fill="${CC.hair}">${hair}</g>`;
  // cabeza
  let hd = `<path d="M176 94 Q176 109 190 111.4 Q204 109 204 94 Q204 80 190 80 Q176 80 176 94Z" fill="${CC.skin}" ${st(3)}/>`;
  // flequillo de rizos
  let fr = '';
  [[180, 86, 4.2], [186, 84, 4.4], [193, 84, 4.4], [199.4, 86, 4.2]].forEach(([x, y, r]) => { fr += `<circle cx="${x}" cy="${y}" r="${r}"/>`; });
  hd += `<g fill="${CC.hair}" stroke="${INK}" stroke-width="${w(2)}">${fr}</g><g fill="${CC.hair}">${fr}</g>`;
  // cara joven, mirando al público
  const lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const L = (d, sw = 1.6, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  hd += `<circle cx="181.4" cy="100.4" r="3.1" fill="${AN.cheek}" opacity="0.8"/><circle cx="198.6" cy="100.4" r="3.1" fill="${AN.cheek}" opacity="0.8"/>`;
  [[181.6, 99], [185.2, 101.4], [196, 101.6], [198.8, 98.8]].forEach(([x, y]) => { hd += `<circle cx="${x}" cy="${y}" r="0.55" fill="${CC.hairS}"/>`; });
  if (o.blink) hd += L('M182.4 95 Q185 96.2 187.4 95 M192.6 95 Q195 96.2 197.6 95');
  else hd += `<circle cx="${f(185 + lx)}" cy="${f(94.6 + ly)}" r="2.1" fill="${INK}"/><circle cx="${f(195 + lx)}" cy="${f(94.6 + ly)}" r="2.1" fill="${INK}"/><circle cx="${f(185.7 + lx)}" cy="${f(93.9 + ly)}" r="0.65" fill="#FFFFFF"/><circle cx="${f(195.7 + lx)}" cy="${f(93.9 + ly)}" r="0.65" fill="#FFFFFF"/>` +
    L('M181.8 93.4 l-1.6 -1.1 M198.2 93.4 l1.6 -1.1', 1.1);
  hd += L('M181.6 89.6 Q184.6 87.4 188 89 M192 89 Q195.4 87.4 198.4 89.6', 1.7, CC.hairS);
  hd += L('M189.4 97.4 Q190.4 100 191.6 98.6', 1.3);
  const m = clamp(o.talk || 0), mh = lerp(3, 7.4, m);
  hd += `<path d="M184.8 103.2 Q190 ${f(103.2 + mh * 1.3)} 195.2 103.2Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}" stroke-linejoin="round"/>`;
  if (mh > 4.4) hd += `<path d="M186.8 ${f(103.2 + mh * 0.6)} Q190 ${f(103.2 + mh)} 193.2 ${f(103.2 + mh * 0.6)}Z" fill="${C.pink}"/>`;
  // sombrero de colores con pluma
  hd += `<g transform="rotate(-8 190 80)">`;
  hd += `<path d="M196 72 Q214 58 222 44 Q214 54 200 64Z" fill="${C.red}" ${st(1.8)}/><path d="M199 68 Q212 58 220 47" stroke="${C.yel}" stroke-width="${w(1.1)}" fill="none" stroke-linecap="round"/>`;
  hd += `<path d="M178 80 Q177 62 190 60 Q203 62 202 80Z" fill="${CC.hatC}" ${st(2.6)}/>`;
  hd += `<path d="M178.4 74 Q190 71.4 201.6 74 L201.8 79 Q190 76.6 178.2 79Z" fill="${CC.band}" ${st(1.8)}/>`;
  hd += `<circle cx="184" cy="67" r="1.6" fill="#FFFFFF"/><circle cx="194" cy="65" r="1.6" fill="${C.yel}"/><circle cx="190" cy="70" r="1.3" fill="${C.blue}"/>`;
  hd += `<path d="M166 82 Q172 76 190 76.6 Q208 76 214 82 Q208 86.4 190 84.4 Q172 86.4 166 82Z" fill="${CC.hatB}" ${st(2.6)}/>`;
  hd += `</g>`;
  b += `<g transform="rotate(${f(o.head || 0)} 190 108)">${hd}</g>`;
  // libro y mano que lo sujeta
  b += bigBookL(w, 176, 146, 1.08, -8);
  b += `<circle cx="160" cy="148" r="4" fill="${CC.skin}" ${st(2.2)}/>`;
  // brazo derecho que gesticula (abierto, sube y baja)
  const gst = o.gest || 0, ang = o.gAng || 0;
  const Hh = [lerp(208, 226, gst) + 3 * Math.sin(ang), lerp(146, 104, gst) + 4 * Math.cos(ang)];
  const { E } = ik2([202, 122], Hh, 1, 15);
  b += capsule([[202, 122], E, Hh], 8.6, CC.dress, w);
  b += hand11('open', Hh, w, { fill: CC.skin, hs: 1.15, hrot: lerp(40, -10, gst) });
  g += `<g transform="translate(0 ${f(lift)})">${b}</g>`;
  return g;
}
function placeStory(px, py, sc, o) {
  o.k = SW / (3 * sc);
  return `<g transform="translate(${f(px - 190 * sc)} ${f(py - 208 * sc)}) scale(${f(sc)})">${storyteller(o)}</g>`;
}

/* ===================== NIÑOS Y NIÑAS (de frente; suelo local y=208) ===================== */
const KIDS = {
  nina: { skin: '#F6C9A0', skinS: '#E9B88F', hair: 'pig', hairC: '#6B4630', ribbon: C.yel, top: 'dress', topC: C.pink, topS: '#D9739A', shoe: '#D32F2F', sock: '#FFFFFF' },
  nieto: { skin: '#E9B88F', skinS: '#D39F76', hair: 'short', hairC: '#C58B3B', top: 'tee', topC: C.yel, topS: '#C99A1E', bottom: 'shorts', botC: C.navy, shoe: '#FFFFFF', sock: '#FFFFFF' },
  hijo: { skin: '#F6C9A0', skinS: '#E9B88F', hair: 'cap', hairC: '#4A3426', capC: C.blue, capS: '#2B5A99', top: 'sweater', topC: C.red, topS: '#A32323', bottom: 'pants', botC: C.navy, shoe: '#1E1A1A' },
  rizos: { skin: '#B97F5A', skinS: '#9E6A48', hair: 'curly', hairC: '#1E1A1A', top: 'tee', topC: C.green, topS: '#2C7A47', bottom: 'shorts', botC: '#A9743F', shoe: C.yel, sock: '#FFFFFF' },
  melena: { skin: '#F6C9A0', skinS: '#E9B88F', hair: 'bob', hairC: '#C8552B', top: 'dress', topC: AN.purple, topS: AN.purpleS, shoe: C.navy, sock: '#FFFFFF' },
  coleta: { skin: '#D9A27A', skinS: '#C08A63', hair: 'pony', hairC: '#1E1A1A', ribbon: C.red, top: 'tee', topC: C.glass, topS: '#93C3D8', bottom: 'skirt', botC: C.red, shoe: '#FFFFFF', sock: C.pink },
  gafitas: { skin: '#F6C9A0', skinS: '#E9B88F', hair: 'short', hairC: '#3A2A20', glasses: true, top: 'sweater', topC: '#F28C3A', topS: '#C96E25', bottom: 'pants', botC: C.blue, shoe: C.red },
  monos: { skin: '#E9B88F', skinS: '#D39F76', hair: 'buns', hairC: '#3A2A20', ribbon: C.green, top: 'dress', topC: C.yel, topS: '#C99A1E', shoe: C.green, sock: '#FFFFFF' }
};
function kidFace(o, p, w, cy) {
  const e = o.expr || 'happy', lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const L = (d, sw = 1.6) => `<path d="${d}" stroke="${INK}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const y = cy;
  let s = `<circle cx="181.6" cy="${f(y + 6)}" r="3" fill="${C.pink}" opacity="0.75"/><circle cx="198.4" cy="${f(y + 6)}" r="3" fill="${C.pink}" opacity="0.75"/>`;
  if (o.blink && e !== 'laugh') s += L(`M182.6 ${f(y + 1)} Q185 ${f(y + 2.2)} 187.4 ${f(y + 1)} M192.6 ${f(y + 1)} Q195 ${f(y + 2.2)} 197.4 ${f(y + 1)}`);
  else if (e === 'wow' || e === 'surprise') {
    // ojos como platos
    [185, 195].forEach(x => { s += `<circle cx="${x}" cy="${f(y + 0.6)}" r="4.3" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.5)}"/><circle cx="${f(x + lx * 0.7)}" cy="${f(y + 0.8 + ly * 0.7)}" r="2.1" fill="${INK}"/><circle cx="${f(x + lx * 0.7 + 0.8)}" cy="${f(y + ly * 0.7)}" r="0.75" fill="#FFFFFF"/>`; });
    s += L(`M180.8 ${f(y - 6)} Q184.6 ${f(y - 9)} 188.4 ${f(y - 6.4)} M191.6 ${f(y - 6.4)} Q195.4 ${f(y - 9)} 199.2 ${f(y - 6)}`, 1.5);
  } else if (e === 'laugh') s += L(`M182.4 ${f(y + 1.4)} Q185 ${f(y - 2)} 187.6 ${f(y + 1.4)} M192.4 ${f(y + 1.4)} Q195 ${f(y - 2)} 197.6 ${f(y + 1.4)}`, 1.8);
  else {
    [185, 195].forEach(x => { s += `<circle cx="${f(x + lx)}" cy="${f(y + 0.6 + ly)}" r="2.2" fill="${INK}"/><circle cx="${f(x + lx + 0.7)}" cy="${f(y + ly - 0.1)}" r="0.7" fill="#FFFFFF"/>`; });
    s += L(`M181.6 ${f(y - 5)} Q184.6 ${f(y - 6.8)} 187.6 ${f(y - 5.4)} M192.4 ${f(y - 5.4)} Q195.4 ${f(y - 6.8)} 198.4 ${f(y - 5)}`, 1.4);
  }
  if (p.glasses) s += `<circle cx="185" cy="${f(y + 0.6)}" r="4.6" fill="none" stroke="${INK}" stroke-width="${w(1.4)}"/><circle cx="195" cy="${f(y + 0.6)}" r="4.6" fill="none" stroke="${INK}" stroke-width="${w(1.4)}"/><path d="M189.6 ${f(y)} H190.4" stroke="${INK}" stroke-width="${w(1.4)}"/>`;
  s += L(`M189.4 ${f(y + 3.6)} Q190.4 ${f(y + 5.6)} 191.4 ${f(y + 4.4)}`, 1.2);
  if (e === 'surprise') s += `<ellipse cx="190" cy="${f(y + 9.4)}" rx="2.2" ry="2.8" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.4)}"/>`;
  else if (e === 'smile') s += L(`M185.6 ${f(y + 7.6)} Q190 ${f(y + 11)} 194.4 ${f(y + 7.6)}`, 1.8);
  else {
    const hh = e === 'wow' ? 6 : e === 'laugh' ? 7 : 5;
    s += `<path d="M184.8 ${f(y + 7.2)} Q190 ${f(y + 7.2 + hh * 1.3)} 195.2 ${f(y + 7.2)}Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}" stroke-linejoin="round"/><path d="M186.8 ${f(y + 7.2 + hh * 0.6)} Q190 ${f(y + 7.2 + hh)} 193.2 ${f(y + 7.2 + hh * 0.6)}Z" fill="${C.pink}"/>`;
  }
  return s;
}
// o: who, pose 'stand'|'sit'|'jump', armF/armB {h:[x,y], hand} (locales), legPh (andar), jump (px locales), bob, head, lean, expr, look, blink
function kid(o) {
  const p = KIDS[o.who] || KIDS.nina, k = o.k || 1, w = v => f(v * k);
  const st = (v = 3) => stA(w, v);
  const sit = o.pose === 'sit';
  const dy = sit ? 20 : 0;                      // sentado: el cuerpo baja
  const jmp = sit ? 0 : (o.jump || 0);          // salto: todo sube
  const HC = 124 + dy;                          // centro de la cabeza
  let g = '';
  // piernas
  if (sit) {
    // piernas cruzadas sobre la alfombra
    const lc = p.bottom === 'pants' ? p.botC : (p.top === 'dress' || p.bottom === 'skirt' ? p.skin : p.skin);
    g += `<path d="M170 198 Q172 190 186 194 L196 203 Q182 210 172 206Z" fill="${lc}" ${st()}/><path d="M210 198 Q208 190 194 194 L184 203 Q198 210 208 206Z" fill="${lc}" ${st()}/>`;
    g += `<path d="M170.4 199 q-5 2 -4 6.4 q4 2.6 8 0.6 z" fill="${p.shoe}" ${st(2.4)}/><path d="M209.6 199 q5 2 4 6.4 q-4 2.6 -8 0.6 z" fill="${p.shoe}" ${st(2.4)}/>`;
  } else {
    const ph = o.legPh;
    const tuck = o.jump ? Math.min(1, o.jump / 14) : 0;
    const legs = [[180.5, -1], [191.5, 1]];
    legs.forEach(([x, sd], i) => {
      const up = ph === undefined ? 0 : 4 * Math.max(0, sd * Math.sin(ph));
      const rot = tuck * 22 * sd;
      const skin = p.bottom === 'pants' ? p.botC : p.skin;
      let lg = `<rect x="${x}" y="176" width="8" height="26" rx="3.5" fill="${skin}" ${st()}/>`;
      if (p.bottom === 'shorts') lg += `<rect x="${x - 0.6}" y="176" width="9.2" height="10" rx="3" fill="${p.botC}" ${st(2.4)}/>`;
      if (p.sock) lg += `<rect x="${x}" y="195" width="8" height="5" fill="${p.sock}" ${st(1.8)}/>`;
      lg += i === 0 ? `<path d="M${x - 3} 199.6 h10 a2.6 2.6 0 0 1 2.6 2.6 v4.8 h-14 a2.6 2.6 0 0 1 1.4 -7.4z" fill="${p.shoe}" ${st(2.6)}/>` : `<path d="M${x} 199.6 h10 a2.6 2.6 0 0 1 1.4 7.4 h-14 v-4.8 a2.6 2.6 0 0 1 2.6 -2.6z" fill="${p.shoe}" ${st(2.6)}/>`;
      g += `<g transform="translate(0 ${f(-up - jmp)}) rotate(${f(rot)} ${x + 4} 178)">${lg}</g>`;
    });
  }
  let b = '';
  // pelo trasero
  if (p.hair === 'bob') b += `<path d="M190 ${HC - 18} Q171 ${HC - 18} 172 ${HC} Q171 ${HC + 13} 176 ${HC + 15} H204 Q209 ${HC + 13} 208 ${HC} Q209 ${HC - 18} 190 ${HC - 18}Z" fill="${p.hairC}" ${st()}/>`;
  if (p.hair === 'pig') {
    const sw_ = o.pigSw || 0;
    [[-1, 169], [1, 211]].forEach(([sd, x]) => {
      b += `<g transform="rotate(${f(sw_ * sd)} ${x - sd * 4} ${HC - 6})"><path d="M${x - sd * 4} ${HC - 8} Q${x + sd * 7} ${HC - 6} ${x + sd * 5} ${HC + 8} Q${x + sd * 3} ${HC + 16} ${x - sd * 2} ${HC + 14} Q${x + sd * 1} ${HC + 4} ${x - sd * 4} ${HC - 2}Z" fill="${p.hairC}" ${st()}/>`;
      b += `<circle cx="${x - sd * 3}" cy="${HC - 6}" r="3.2" fill="${p.ribbon}" ${st(2)}/></g>`;
    });
  }
  if (p.hair === 'pony') b += `<g transform="rotate(${f(o.pigSw || 0)} 206 ${HC - 10})"><path d="M204 ${HC - 12} Q218 ${HC - 12} 216 ${HC + 6} Q214 ${HC + 14} 209 ${HC + 12} Q212 ${HC} 202 ${HC - 6}Z" fill="${p.hairC}" ${st()}/><circle cx="205" cy="${HC - 11}" r="3" fill="${p.ribbon}" ${st(2)}/></g>`;
  // torso
  const ty = 146 + dy;
  b += `<rect x="186.4" y="${ty - 6}" width="7.2" height="8" rx="2" fill="${p.skinS}" ${st(2.2)}/>`;
  if (p.top === 'dress') {
    const d = `M179 ${ty} Q190 ${ty - 3} 201 ${ty} L${sit ? 208 : 206} ${ty + (sit ? 38 : 38)} Q190 ${ty + 42} ${sit ? 172 : 174} ${ty + 38}Z`;
    b += `<path d="${d}" fill="${p.topC}" ${st()}/><path d="M179 ${ty} L185 ${ty - 1} L182 ${ty + 41} Q177 ${ty + 40} 174 ${ty + 38}Z" fill="${p.topS}" opacity="0.8"/><path d="${d}" fill="none" ${st()}/>`;
    b += `<path d="M180 ${ty + 14} Q190 ${ty + 17} 200 ${ty + 14}" stroke="${INK}" stroke-width="${w(1.6)}" fill="none" stroke-linecap="round"/>`;
    b += `<circle cx="186" cy="${ty + 26}" r="1.4" fill="#FFFFFF"/><circle cx="194" cy="${ty + 30}" r="1.4" fill="#FFFFFF"/><circle cx="190" cy="${ty + 22}" r="1.4" fill="#FFFFFF"/>`;
  } else {
    if (p.bottom === 'skirt') b += `<path d="M178 ${ty + 24} H202 L206 ${ty + 38} Q190 ${ty + 41} 174 ${ty + 38}Z" fill="${p.botC}" ${st()}/>`;
    if (p.bottom === 'pants' || p.bottom === 'shorts') b += `<rect x="178.6" y="${ty + 24}" width="22.8" height="10" rx="3" fill="${p.botC}" ${st()}/>`;
    const d = `M179 ${ty} Q190 ${ty - 3} 201 ${ty} Q204 ${ty + 6} 203 ${ty + 28} H177 Q176 ${ty + 6} 179 ${ty}Z`;
    b += `<path d="${d}" fill="${p.topC}" ${st()}/><path d="M179 ${ty} L185 ${ty - 1} L184 ${ty + 28} H177 Q176 ${ty + 6} 179 ${ty}Z" fill="${p.topS}" opacity="0.8"/><path d="${d}" fill="none" ${st()}/>`;
    if (p.top === 'sweater') b += `<path d="M177.6 ${ty + 24} H202.4" stroke="${INK}" stroke-width="${w(1.3)}"/><path d="M184 ${ty - 0.6} Q190 ${ty + 4} 196 ${ty - 0.6}" stroke="${INK}" stroke-width="${w(1.8)}" fill="none"/>`;
    else b += `<path d="M185 ${ty - 0.4} Q190 ${ty + 3} 195 ${ty - 0.4}" stroke="${INK}" stroke-width="${w(1.6)}" fill="none" stroke-linecap="round"/><path d="${starPath(3.4, 1.5, 5)}" transform="translate(194 ${ty + 13})" fill="#FFFFFF" ${st(1)}/>`;
  }
  // brazos (hombro→mano con IK; manga corta o larga)
  const sleeveLong = p.top === 'sweater';
  const arm = (S, A, sd) => {
    if (!A) A = { h: [S[0] + sd * 4, S[1] + 22] };
    const { E, H } = ik2(S, A.h, A.side || -sd, A.L || 12);
    let a = '';
    if (sleeveLong) a += capsule([S, E, lerp2(E, H, 0.8)], 6.6, p.topC, w);
    else a += capsule([S, E, H], 5.6, p.skin, w) + capsule([S, lerp2(S, E, 0.55)], 7.2, p.topC, w);
    if (A.item) a += A.item(H, w);
    a += A.hand && A.hand !== 'ball' ? hand11(A.hand, H, w, Object.assign({ fill: p.skin, hs: 0.95 }, A)) : `<circle cx="${f(H[0])}" cy="${f(H[1])}" r="3.3" fill="${p.skin}" ${st(2.2)}/>`;
    return a;
  };
  b += arm([179, ty + 3], o.armB, -1);
  b += arm([201, ty + 3], o.armF, 1);
  // cabeza
  let hd = `<circle cx="190" cy="${HC}" r="15.4" fill="${p.skin}" ${st()}/>`;
  hd += `<ellipse cx="174.4" cy="${HC + 2}" rx="2.6" ry="3.6" fill="${p.skin}" ${st(2.2)}/><ellipse cx="205.6" cy="${HC + 2}" rx="2.6" ry="3.6" fill="${p.skin}" ${st(2.2)}/>`;
  if (p.hair === 'short' || p.hair === 'cap') hd += `<path d="M175 ${HC + 1} Q172 ${HC - 17} 190 ${HC - 17.6} Q208 ${HC - 17} 205 ${HC + 1} Q203 ${HC - 8} 196 ${HC - 9} Q188 ${HC - 6} 182 ${HC - 9.4} Q177 ${HC - 7} 175 ${HC + 1}Z" fill="${p.hairC}" ${st()}/>`;
  if (p.hair === 'pig' || p.hair === 'pony' || p.hair === 'buns') hd += `<path d="M175 ${HC + 1} Q172 ${HC - 17.6} 190 ${HC - 17.6} Q208 ${HC - 17.6} 205 ${HC + 1} Q202 ${HC - 9} 191 ${HC - 10} L189 ${HC - 6} Q181 ${HC - 9} 175 ${HC + 1}Z" fill="${p.hairC}" ${st()}/>`;
  if (p.hair === 'bob') hd += `<path d="M174.6 ${HC + 3} Q171 ${HC - 18} 190 ${HC - 18} Q209 ${HC - 18} 205.4 ${HC + 3} Q204 ${HC - 6} 199 ${HC - 8} H181 Q176 ${HC - 6} 174.6 ${HC + 3}Z" fill="${p.hairC}" ${st()}/>`;
  if (p.hair === 'buns') [[176, 1], [204, 1]].forEach(([x]) => { hd += `<circle cx="${x}" cy="${HC - 14}" r="6" fill="${p.hairC}" ${st()}/><path d="M${x - 3} ${HC - 9} l6 0" stroke="${p.ribbon}" stroke-width="${w(2.4)}" stroke-linecap="round"/>`; });
  if (p.hair === 'curly') { let a = ''; [[177, HC - 8, 6], [183, HC - 14, 6.6], [191, HC - 16, 6.8], [199, HC - 13.6, 6.4], [204.6, HC - 6, 5.4], [175, HC - 1, 4.6]].forEach(([x, y, r]) => { a += `<circle cx="${x}" cy="${f(y)}" r="${r}"/>`; }); hd += `<g fill="${p.hairC}" stroke="${INK}" stroke-width="${w(2.4)}">${a}</g><g fill="${p.hairC}">${a}</g>`; }
  if (p.hair === 'cap') {
    hd += `<path d="M175 ${HC - 4} Q174 ${HC - 20} 190 ${HC - 20} Q206 ${HC - 20} 205 ${HC - 4}Z" fill="${p.capC}" ${st()}/>`;
    hd += `<path d="M176 ${HC - 4.6} Q190 ${HC - 9} 204 ${HC - 4.6} Q206 ${HC - 1} 204 ${HC} Q190 ${HC - 4.6} 176 ${HC} Q174 ${HC - 1} 176 ${HC - 4.6}Z" fill="${p.capS}" ${st(2.4)}/>`;
    hd += `<circle cx="190" cy="${HC - 20}" r="1.8" fill="${p.capS}" ${st(1.4)}/>`;
  }
  hd += kidFace(o, p, w, HC + 1);
  b += `<g transform="rotate(${f(o.head || 0)} 190 ${HC + 14})">${hd}</g>`;
  if (o.front) b += o.front(w, dy);
  g += `<g transform="translate(0 ${f((o.bob || 0) - jmp)})">${b}</g>`;
  if (o.lean) g = `<g transform="rotate(${f(o.lean)} 190 208)">${g}</g>`;
  return g;
}
// (px,py) = suelo bajo el niño; flip = espejo
function placeKid(px, py, sc, o) {
  o.k = SW / (3 * sc);
  const sx = o.flip ? -sc : sc;
  return `<g transform="translate(${f(px - 190 * sx)} ${f(py - 208 * sc)}) scale(${f(sx)} ${f(sc)})">${kid(o)}</g>`;
}
// pasa un punto del mundo a coordenadas locales del niño
const kidLocal = (px, py, sc, wx, wy, flip) => [190 + (wx - px) / sc * (flip ? -1 : 1), 208 + (wy - py) / sc];
// posición en el mundo de la mano delantera de un adulto de la serie (placeFolk) con ángulo de brazo ang
function folkHand(i, px, py, sc, ang, flip, front = true) {
  const p = FOLK[i % FOLK.length], s = sc * (p.scale || 1);
  const [hx, hy] = handAt(front ? [202, 108] : [178, 108], ang);
  return toWorld(px, py, 190, 204, s, hx + (front ? 0.5 : 0), hy, flip);
}

/* ===================== ADULTOS NUEVOS DE LA SERIE ===================== */
const F_MADRE = FOLK.length;
FOLK.push({ id: 'madre', skin: '#F6C9A0', skinS: '#E9B88F', hair: 'long', hairC: '#6B4630', top: 'coat', topC: '#F2C12E', topS: '#C99A1E', pants: '#2D4A6B', shoe: '#8E1B1B' });
const F_PADRE = FOLK.length;
FOLK.push({ id: 'padre', skin: '#E9B88F', skinS: '#D39F76', hair: 'short', hairC: '#4A3426', top: 'coat', topC: '#8C939B', topS: '#6E757D', pants: '#2D4A6B', shoe: '#1E1A1A', pack: '#3F7CC4', beard: '#4A3426', scale: 1.03 });
const F_ABUELO = FOLK.length;
FOLK.push({ id: 'abueloBoina', skin: '#F6C9A0', skinS: '#E9B88F', hair: 'gray', hairC: '#D9D4D0', beret: '#2D4A6B', top: 'coat', topC: '#A9743F', topS: '#7E5328', pants: '#5A4137', shoe: '#1E1A1A', glasses: true, scale: 0.96, bend: 3 });
const F_JOVEN = 1; // joven con auriculares (FOLK[1])

/* ===================== OBJETOS ===================== */
// libro suelto (mundo): (x, base) centro inferior, de canto o tumbado
function bookStand(x, base, wd, ht, col, rot = 0) {
  return at(x, base, 1, `<rect x="${f(-wd / 2 + 5)}" y="${f(-ht + 5)}" width="${f(wd)}" height="${f(ht)}" rx="4" fill="${INK}"/>
    <rect x="${f(-wd / 2)}" y="${f(-ht)}" width="${f(wd)}" height="${f(ht)}" rx="4" fill="${col}" ${st14(0.8)}/>
    <rect x="${f(-wd / 2)}" y="${f(-ht)}" width="${f(wd * 0.16)}" height="${f(ht)}" rx="3" fill="${INK}" opacity="0.22"/>
    <rect x="${f(-wd * 0.2)}" y="${f(-ht * 0.78)}" width="${f(wd * 0.56)}" height="${f(ht * 0.2)}" rx="3" fill="#FFFFFF" ${st14(0.5)}/>`, rot);
}
// pila de libros tumbados (mundo)
const BOOKC = [C.red, C.blue, C.yel, AN.jer, AN.purple, C.pink, C.navy, AN.orange, C.cream, C.dred];
function bookPile(x, base, n, s = 1, seed = 0) {
  let g = '', y = base;
  for (let i = 0; i < n; i++) {
    const wd = (110 + 40 * hash(seed + i * 3.7)) * s, ht = (22 + 10 * hash(seed * 2 + i)) * s, dx = (hash(seed + i) - 0.5) * 24 * s;
    const col = BOOKC[(seed * 3 + i * 4) % BOOKC.length];
    g += `<rect x="${f(x - wd / 2 + dx + 5)}" y="${f(y - ht + 5)}" width="${f(wd)}" height="${f(ht)}" rx="${f(4 * s)}" fill="${INK}"/>`;
    g += `<rect x="${f(x - wd / 2 + dx)}" y="${f(y - ht)}" width="${f(wd)}" height="${f(ht)}" rx="${f(4 * s)}" fill="${col}" ${st14(0.8)}/>`;
    g += `<path d="M${f(x - wd / 2 + dx + 10 * s)} ${f(y - ht / 2)} H${f(x + wd / 2 + dx - 10 * s)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.6)}" opacity="0.7" stroke-linecap="round"/>`;
    y -= ht;
  }
  return g;
}
// fila de lomos de libro sobre una balda (mundo). y = balda; h = altura máx.
function bookRow(x0, x1, y, h, seed, o = {}) {
  let s = '', x = x0 + 4, i = 0;
  const cols = o.cols || BOOKC;
  while (x < x1 - 14) {
    const r = hash(seed * 17 + i * 3.3);
    const wd = 22 + 20 * hash(seed + i * 7.7), ht = h * (0.66 + 0.34 * r);
    if (x + wd > x1 - 4) break;
    const col = cols[Math.floor(hash(seed * 5 + i * 1.9) * cols.length)];
    if (r > 0.86 && x + ht < x1 - 10) { // libro inclinado
      s += `<g transform="rotate(14 ${f(x)} ${f(y)})"><rect x="${f(x)}" y="${f(y - ht)}" width="${f(wd)}" height="${f(ht)}" rx="3" fill="${col}" ${st14(0.75)}/></g>`;
      x += wd + ht * 0.26 + 6;
    } else {
      s += `<rect x="${f(x)}" y="${f(y - ht)}" width="${f(wd)}" height="${f(ht)}" rx="3" fill="${col}" ${st14(0.75)}/>`;
      s += `<path d="M${f(x + 4)} ${f(y - ht * 0.8)} H${f(x + wd - 4)} M${f(x + 4)} ${f(y - ht * 0.2)} H${f(x + wd - 4)}" stroke="${col === C.cream || col === C.yel ? INK : '#FFFFFF'}" stroke-width="${f(SW * 0.45)}" opacity="0.6"/>`;
      x += wd + 1;
    }
    i++;
  }
  return s;
}
// estantería de madera llena de libros
function bookcase(x, top, wd, ht, n, seed, o = {}) {
  let s = `<rect x="${x + 12}" y="${top + 12}" width="${wd}" height="${ht}" rx="10" fill="${INK}"/>`;
  s += `<rect x="${x}" y="${top}" width="${wd}" height="${ht}" rx="10" fill="${o.col || AN.wood}" ${st14()}/>`;
  const inX = x + 22, inW = wd - 44, gap = (ht - 40) / n;
  s += `<rect x="${inX}" y="${top + 20}" width="${inW}" height="${ht - 40}" fill="${o.back || AN.woodS}" ${st14(0.8)}/>`;
  for (let i = 0; i < n; i++) {
    const yb = top + 20 + gap * (i + 1);
    s += bookRow(inX, inX + inW, yb - 6, gap - 22, seed + i * 11, o);
    s += `<rect x="${inX - 6}" y="${f(yb - 8)}" width="${inW + 12}" height="16" rx="4" fill="${o.col || AN.woodL}" ${st14(0.8)}/>`;
  }
  return s;
}
// escalera de mano apoyada (mundo): pie (x0,y0) a cabeza (x1,y1)
function ladder(x0, y0, x1, y1, wd = 90) {
  const st = st14(), n = 7;
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const A = [x0 - nx * wd / 2, y0 - ny * wd / 2], B = [x0 + nx * wd / 2, y0 + ny * wd / 2];
  const A1 = [x1 - nx * wd * 0.38, y1 - ny * wd * 0.38], B1 = [x1 + nx * wd * 0.38, y1 + ny * wd * 0.38];
  let s = '';
  for (let i = 1; i < n; i++) {
    const u = i / n, p = lerp2(A, A1, u), q = lerp2(B, B1, u);
    s += `<path d="M${f(p[0])} ${f(p[1])} L${f(q[0])} ${f(q[1])}" stroke="${INK}" stroke-width="${f(SW * 2.8)}" stroke-linecap="round"/><path d="M${f(p[0])} ${f(p[1])} L${f(q[0])} ${f(q[1])}" stroke="${AN.woodL}" stroke-width="${f(SW * 1.2)}" stroke-linecap="round"/>`;
  }
  [[A, A1], [B, B1]].forEach(([p, q]) => {
    s += `<path d="M${f(p[0])} ${f(p[1])} L${f(q[0])} ${f(q[1])}" stroke="${INK}" stroke-width="${f(SW * 3.4)}" stroke-linecap="round"/><path d="M${f(p[0])} ${f(p[1])} L${f(q[0])} ${f(q[1])}" stroke="${AN.wood}" stroke-width="${f(SW * 1.8)}" stroke-linecap="round"/>`;
  });
  return s;
}
// alfombra ovalada del rincón infantil
function rug(cx, cy, rx, ry) {
  let s = `<ellipse cx="${cx + 8}" cy="${cy + 8}" rx="${rx}" ry="${ry}" fill="${INK}" opacity="0.25"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${C.red}" ${st14()}/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.86}" ry="${ry * 0.8}" fill="none" stroke="${C.yel}" stroke-width="${f(SW * 1.4)}" stroke-dasharray="22 14"/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.66}" ry="${ry * 0.6}" fill="${C.cream}" ${st14(0.7)}/>`;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.42}" ry="${ry * 0.38}" fill="${C.glass}" ${st14(0.6)}/>`;
  return s;
}
function cushion(x, y, s, col, rot = 0) {
  return at(x, y, s, `<path d="M-46 -26 Q0 -38 46 -26 Q56 0 46 26 Q0 36 -46 26 Q-56 0 -46 -26Z" transform="translate(6 6)" fill="${INK}"/>
    <path d="M-46 -26 Q0 -38 46 -26 Q56 0 46 26 Q0 36 -46 26 Q-56 0 -46 -26Z" fill="${col}" ${st14()}/>
    <circle r="5" fill="#FFFFFF" ${st14(0.6)}/><path d="M-30 -14 Q-20 -20 -8 -18" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" fill="none" stroke-linecap="round" opacity="0.7"/>`, rot);
}
// puf en el mundo
function pufW(x, base, sc = 4.6) {
  const k = SW / (3 * sc), w = v => f(v * k);
  return `<g transform="translate(${f(x - 190 * sc)} ${f(base - 208 * sc)}) scale(${sc})">${pufL(w, 190, 208, 74, 44)}</g>`;
}
// mostrador de madera (frente) con canto; x0..x1, top
function libCounter(x0, x1, top, bottom = H + 20) {
  let s = `<rect x="${x0 + 12}" y="${top + 26}" width="${x1 - x0}" height="${bottom - top}" fill="${INK}"/>`;
  s += `<rect x="${x0}" y="${top + 20}" width="${x1 - x0}" height="${bottom - top}" fill="${AN.wood}"/>`;
  for (let x = x0 + 40; x < x1 - 40; x += 120) s += `<rect x="${x}" y="${top + 60}" width="80" height="${Math.min(260, bottom - top - 90)}" rx="10" fill="${AN.woodS}" opacity="0.5" ${st14(0.6)}/>`;
  s += `<rect x="${x0}" y="${top + 20}" width="${x1 - x0}" height="${bottom - top}" fill="none" ${st14()}/>`;
  s += `<rect x="${x0 - 14}" y="${top - 6}" width="${x1 - x0 + 28}" height="34" rx="10" fill="${AN.woodL}" ${st14()}/>`;
  s += `<path d="M${x0 + 20} ${top + 4} H${Math.min(x1 - 30, x0 + 320)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" opacity="0.45" stroke-linecap="round"/>`;
  return s;
}
// lámpara de lectura de pie, con brazo curvado (mundo)
function readingLamp(x, floor, h, dir = -1) {
  const top = floor - h;
  let s = shadowEll(x, floor + 2, 60);
  s += `<ellipse cx="${x}" cy="${floor - 8}" rx="52" ry="13" fill="${AN.jer}" ${st14()}/>`;
  s += `<path d="M${x} ${floor - 12} V${top + 60} Q${x} ${top} ${x + dir * 70} ${top + 10}" fill="none" stroke="${INK}" stroke-width="${f(SW * 2.6)}" stroke-linecap="round"/><path d="M${x} ${floor - 12} V${top + 60} Q${x} ${top} ${x + dir * 70} ${top + 10}" fill="none" stroke="${AN.jer}" stroke-width="${f(SW * 1.2)}" stroke-linecap="round"/>`;
  const hx = x + dir * 86, hy = top + 32;
  const sh = `M${hx - 52} ${hy + 40} L${hx - 30} ${hy - 20} H${hx + 30} L${hx + 52} ${hy + 40}Z`;
  s += `<path d="${sh}" transform="translate(8 8)" fill="${INK}"/><path d="${sh}" fill="${C.yel}" ${st14()}/>`;
  s += `<circle cx="${hx}" cy="${hy + 44}" r="12" fill="#FFFFFF" ${st14(0.8)}/>`;
  return s;
}

/* ===================== FACHADA DE LA LIBRERÍA ===================== */
// geometría: rótulo, toldo, escaparate y puerta (a la derecha)
function libGeo(x, base, w, h) {
  const top = base - h;
  const sign = { x: x + w * 0.1, y: top + h * 0.06, w: w * 0.8, h: h * 0.13 };
  const aw = { y: top + h * 0.24, h: h * 0.13 };
  const dy = aw.y + aw.h + h * 0.08;
  const door = { x: x + w * 0.64, y: dy, w: w * 0.27, h: base - dy };
  const win = { x: x + w * 0.07, y: dy + h * 0.02, w: w * 0.51, h: base - dy - h * 0.12 };
  return { top, sign, aw, door, win, bell: [door.x + door.w / 2, door.y - 6] };
}
// o: open (0..1 puerta abierta), bell (ángulo de la campanilla), ring (0..1 líneas), inside(door) dibuja lo que se ve dentro
function libreria(x, base, w, h, o = {}) {
  const g = libGeo(x, base, w, h);
  let s = `<rect x="${f(x)}" y="${f(g.top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="#F7E6D4"/>`;
  // ladrillos claros
  for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
    const bx = x + 30 + c * w / 6 + (r % 2) * w / 12, by = g.top + h * 0.2 + r * 18 + (c % 2) * 4;
    if (by < g.aw.y - 8 && by > g.sign.y + g.sign.h + 10) s += `<rect x="${f(bx)}" y="${f(by)}" width="${f(w / 9)}" height="9" rx="4" fill="#EBCDB4"/>`;
  }
  s += `<rect x="${f(x + w * 0.9)}" y="${f(g.top + w * 0.02)}" width="${f(w * 0.1)}" height="${f(h + 30)}" fill="${INK}" opacity="0.14"/>`;
  s += `<rect x="${f(x)}" y="${f(g.top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="none" ${st14()}/>`;
  // rótulo azul marino con «LIBRERÍA» en crema
  const sg = g.sign;
  s += `<rect x="${f(sg.x + 10)}" y="${f(sg.y + 10)}" width="${f(sg.w)}" height="${f(sg.h)}" rx="${f(sg.h * 0.22)}" fill="${INK}"/>`;
  s += `<rect x="${f(sg.x)}" y="${f(sg.y)}" width="${f(sg.w)}" height="${f(sg.h)}" rx="${f(sg.h * 0.22)}" fill="${C.navy}" ${st14()}/>`;
  s += `<rect x="${f(sg.x + 12)}" y="${f(sg.y + 12)}" width="${f(sg.w - 24)}" height="${f(sg.h - 24)}" rx="${f(sg.h * 0.16)}" fill="none" stroke="${C.cream}" stroke-width="${f(SW * 0.5)}" opacity="0.6"/>`;
  s += text('LIBRERÍA', sg.x + sg.w / 2, sg.y + sg.h * 0.56, { size: fit('LIBRERÍA', sg.h * 0.74, sg.w * 0.78, 'G'), font: 'G', fill: C.cream, sw: SW * 1.5, sd: 4, ls: 3 });
  // farolillos del rótulo
  // toldo de rayas verdes y crema con festón
  s += awningC(x + w * 0.03, x + w * 0.97, x - w * 0.03, x + w * 1.03, g.aw.y, g.aw.h, 9, AN.jer);
  // escaparate con libros apilados
  const wn = g.win;
  s += glassWindow(wn.x, wn.y, wn.w, wn.h, (X, Y, Wd, Hd) => {
    let q = `<rect x="${f(X + 12)}" y="${f(Y + Hd - 40)}" width="${f(Wd - 24)}" height="26" rx="6" fill="${AN.woodL}" ${st14(0.8)}/>`;
    const k = Wd / 400;
    q += bookPile(X + Wd * 0.2, Y + Hd - 40, 5, k * 0.9, 2);
    q += bookStand(X + Wd * 0.47, Y + Hd - 40, 92 * k, 130 * k, C.red, -4);
    q += bookStand(X + Wd * 0.62, Y + Hd - 40, 84 * k, 116 * k, C.yel, 6);
    q += bookPile(X + Wd * 0.82, Y + Hd - 40, 3, k * 0.8, 5);
    // banderines de colores
    let pn = `<path d="M${f(X)} ${f(Y + 20)} Q${f(X + Wd / 2)} ${f(Y + 60)} ${f(X + Wd)} ${f(Y + 20)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/>`;
    for (let i = 1; i < 8; i++) { const u = i / 8, px = X + Wd * u, py = Y + 20 + 40 * 4 * u * (1 - u); pn += `<path d="M${f(px - 14)} ${f(py)} L${f(px + 14)} ${f(py)} L${f(px)} ${f(py + 30)}Z" fill="${BOOKC[i % 6]}" ${st14(0.5)}/>`; }
    return q + pn;
  });
  s += `<rect x="${f(wn.x - 10)}" y="${f(wn.y + wn.h)}" width="${f(wn.w + 20)}" height="${f(h * 0.03)}" rx="4" fill="${C.cream}" ${st14()}/>`;
  // puerta (con hueco abierto que deja ver el interior cálido)
  const d = g.door, open = clamp(o.open || 0);
  s += `<rect x="${f(d.x - 12)}" y="${f(d.y - 12)}" width="${f(d.w + 24)}" height="${f(d.h + 12)}" rx="10" fill="${AN.woodS}" ${st14()}/>`;
  s += `<rect x="${f(d.x)}" y="${f(d.y)}" width="${f(d.w)}" height="${f(d.h + 6)}" rx="6" fill="#FFE4A8" ${st14()}/>`;
  s += bookRowInside(d);
  if (o.inside) s += o.inside(d);
  // hoja de la puerta: gira hacia dentro (se estrecha hacia la izquierda)
  const lw = d.w * (1 - 0.82 * open);
  const leaf = `<rect x="${f(d.x)}" y="${f(d.y)}" width="${f(lw)}" height="${f(d.h + 6)}" rx="6" fill="${C.navy}" ${st14()}/>` +
    (lw > d.w * 0.4 ? `<rect x="${f(d.x + lw * 0.18)}" y="${f(d.y + d.h * 0.1)}" width="${f(lw * 0.64)}" height="${f(d.h * 0.42)}" rx="6" fill="${C.glass}" ${st14(0.8)}/>
      <rect x="${f(d.x + lw * 0.3)}" y="${f(d.y + d.h * 0.18)}" width="${f(lw * 0.4)}" height="${f(d.h * 0.12)}" rx="4" fill="#FFFFFF" ${st14(0.5)}/>` : '') +
    `<circle cx="${f(d.x + lw * 0.84)}" cy="${f(d.y + d.h * 0.58)}" r="${f(Math.max(4, d.w * 0.04))}" fill="${C.yel}" ${st14(0.7)}/>`;
  s += leaf;
  // campanilla
  s += bell(g.bell[0], d.y - 12, o.bell || 0, d.w / 200) + ringLines(g.bell[0], d.y + 40 * d.w / 200, o.ring || 0);
  return s;
}
// estanterías que se ven al fondo por la puerta
function bookRowInside(d) {
  let s = `<rect x="${f(d.x + 6)}" y="${f(d.y + d.h * 0.22)}" width="${f(d.w - 12)}" height="12" fill="${AN.woodL}"/>`;
  s += bookRow(d.x + 6, d.x + d.w - 6, d.y + d.h * 0.22, d.h * 0.12, 9);
  s += `<rect x="${f(d.x + 6)}" y="${f(d.y + d.h * 0.42)}" width="${f(d.w - 12)}" height="12" fill="${AN.woodL}"/>`;
  s += bookRow(d.x + 6, d.x + d.w - 6, d.y + d.h * 0.42, d.h * 0.12, 4);
  return s;
}
// caballete con pizarra y repisa para un libro (mundo). book: color del libro colocado (o null)
function easel(x, base, s = 1, o = {}) {
  const wd = 200 * s, ht = 300 * s;
  let g = '';
  g += `<path d="M${f(x - wd * 0.42)} ${f(base)} L${f(x - wd * 0.18)} ${f(base - ht)} M${f(x + wd * 0.42)} ${f(base)} L${f(x + wd * 0.18)} ${f(base - ht)} M${f(x)} ${f(base - ht * 0.9)} L${f(x + wd * 0.12)} ${f(base)}" stroke="${INK}" stroke-width="${f(SW * 2.6)}" stroke-linecap="round"/>`;
  g += `<path d="M${f(x - wd * 0.42)} ${f(base)} L${f(x - wd * 0.18)} ${f(base - ht)} M${f(x + wd * 0.42)} ${f(base)} L${f(x + wd * 0.18)} ${f(base - ht)} M${f(x)} ${f(base - ht * 0.9)} L${f(x + wd * 0.12)} ${f(base)}" stroke="${AN.wood}" stroke-width="${f(SW * 1.1)}" stroke-linecap="round"/>`;
  const bx = x - wd / 2, by = base - ht - 10 * s, bw = wd, bh = ht * 0.62;
  g += `<rect x="${f(bx + 8)}" y="${f(by + 8)}" width="${f(bw)}" height="${f(bh)}" rx="${f(12 * s)}" fill="${INK}"/>`;
  g += `<rect x="${f(bx)}" y="${f(by)}" width="${f(bw)}" height="${f(bh)}" rx="${f(12 * s)}" fill="${AN.wood}" ${st14()}/>`;
  g += `<rect x="${f(bx + 12 * s)}" y="${f(by + 12 * s)}" width="${f(bw - 24 * s)}" height="${f(bh - 24 * s)}" rx="${f(6 * s)}" fill="#26302C" ${st14(0.8)}/>`;
  const lab = o.label || 'Cuentos';
  g += text(lab, x, by + 46 * s, { size: fit(lab, 40 * s, bw - 44 * s), fill: '#FFFFFF', stroke: null });
  // estrellitas de tiza y un libro abierto dibujado
  g += `<path d="M${f(x - 36 * s)} ${f(by + 110 * s)} Q${f(x - 18 * s)} ${f(by + 98 * s)} ${f(x)} ${f(by + 110 * s)} Q${f(x + 18 * s)} ${f(by + 98 * s)} ${f(x + 36 * s)} ${f(by + 110 * s)} V${f(by + 136 * s)} Q${f(x + 18 * s)} ${f(by + 124 * s)} ${f(x)} ${f(by + 136 * s)} Q${f(x - 18 * s)} ${f(by + 124 * s)} ${f(x - 36 * s)} ${f(by + 136 * s)}Z M${f(x)} ${f(by + 110 * s)} V${f(by + 136 * s)}" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 0.6)}" stroke-linejoin="round"/>`;
  g += `<path d="${starPath(9 * s, 4 * s, 5)}" transform="translate(${f(x - 58 * s)} ${f(by + 86 * s)})" fill="none" stroke="${C.yel}" stroke-width="${f(SW * 0.5)}"/><path d="${starPath(7 * s, 3 * s, 5)}" transform="translate(${f(x + 60 * s)} ${f(by + 94 * s)})" fill="none" stroke="${C.yel}" stroke-width="${f(SW * 0.5)}"/>`;
  // repisa
  const ly = by + bh + 4 * s;
  g += `<rect x="${f(bx - 6 * s)}" y="${f(ly - 6 * s)}" width="${f(bw + 12 * s)}" height="${f(16 * s)}" rx="${f(5 * s)}" fill="${AN.woodL}" ${st14(0.8)}/>`;
  if (o.book) g += bookStand(x + 10 * s, ly - 6 * s, 76 * s, 104 * s, o.book, -6 + (o.bookWob || 0));
  return g;
}

/* ===================== INTERIOR DE LA LIBRERÍA ===================== */
// pared crema con puntos, de x0 a x1 (para planos que se escalan)
function dotWide(x0 = -400, x1 = W + 400, y0 = -200, y1 = H + 200) {
  const id = 'dw' + (uid++), cell = 10 * W / 380;
  return `<defs><pattern id="${id}" width="${f(cell)}" height="${f(cell)}" patternUnits="userSpaceOnUse"><circle cx="${f(cell / 2)}" cy="${f(cell / 2)}" r="${f(1.4 * W / 380)}" fill="${DOT}"/></pattern></defs>
    <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${C.cream}"/><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#${id})"/>`;
}
// suelo de tarima desde y0
function woodFloor(y0, x0 = -400, x1 = W + 400) {
  let s = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${H + 400 - y0}" fill="#E9C9A6"/>`;
  for (let x = x0 + 40; x < x1 + 200; x += 130) s += `<line x1="${x}" y1="${y0}" x2="${x - 180}" y2="${H + 400}" stroke="${INK}" stroke-width="${f(SW * 0.5)}" opacity="0.45"/>`;
  s += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  return s;
}
// guirnalda de banderines de colores
function bunting(x1, y1, x2, y2, sag, T, n = 10) {
  let s = `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${y1 + sag * 2} ${x2} ${y2}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
  for (let i = 1; i < n; i++) {
    const u = i / n, x = lerp(x1, x2, u), y = lerp(y1, y2, u) + sag * 4 * u * (1 - u), sw = 3 * Math.sin(T * 2 + i);
    s += `<path d="M${f(x - 20)} ${f(y)} L${f(x + 20)} ${f(y)} L${f(x + sw)} ${f(y + 42)}Z" fill="${BOOKC[i % 7]}" ${st14(0.6)}/>`;
  }
  return s;
}
// sala completa. o.layout 'med' (Ana tras el mostrador, rincón a la derecha) | 'wide' (rincón al centro, sala llena)
function libRoom(T, o = {}) {
  let s = dotWide();
  s += `<rect x="-400" y="-200" width="${W + 800}" height="270" fill="${AN.woodS}"/><line x1="-400" y1="70" x2="${W + 400}" y2="70" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  if (o.layout === 'wide') {
    s += skyWindow(380, 300, 330, 400, T);
    s += bookcase(-60, 250, 400, 900, 5, 3);
    s += bookcase(760, 250, 400, 900, 5, 21);
    s += bunting(330, 200, 760, 200, 40, T, 9);
    s += woodFloor(1140);
    s += readingLamp(810, 1150, 420, -1);
  } else {
    s += skyWindow(90, 300, 380, 470, T);
    s += bookcase(600, 230, 470, 960, 5, 7);
    s += ladder(820, 1190, 960, 300, 100);
    s += bunting(40, 170, 560, 170, 40, T, 9);
    s += woodFloor(1180);
    if (o.clock) s += at(o.clock[0], o.clock[1], 1, clockFace(o.clock[2], o.tm || 11 * 60, { rim: C.navy }));
  }
  return s;
}
// rincón infantil del plano medio (a la derecha del mostrador)
function kidsCorner(T) {
  let s = rug(900, 1330, 260, 66);
  s += readingLamp(1020, 1240, 440, -1);
  s += cushion(760, 1318, 1.1, C.yel, -6) + cushion(1010, 1334, 1.2, C.blue, 8);
  s += pufW(890, 1330, 3.4);
  return s;
}

/* ===================== CARTULINA EN BLANCO (local, en la mano de Ana) ===================== */
function blankSign(w, x, y, wd = 46, ht = 34, rot = 0) {
  const st = v => stA(w, v);
  let g = `<g transform="rotate(${rot} ${x} ${y})">`;
  g += `<rect x="${x - wd / 2 + 1.6}" y="${y - ht / 2 + 1.6}" width="${wd}" height="${ht}" rx="2" fill="${INK}"/>`;
  g += `<rect x="${x - wd / 2}" y="${y - ht / 2}" width="${wd}" height="${ht}" rx="2" fill="#FFFFFF" ${st(2.4)}/>`;
  // dibujo de un libro arriba a la izquierda
  const bx = x - wd / 2 + 12, by = y - ht / 2 + 10;
  g += `<path d="M${bx - 8} ${by - 4} Q${bx - 4} ${by - 6} ${bx} ${by - 4} Q${bx + 4} ${by - 6} ${bx + 8} ${by - 4} V${by + 5} Q${bx + 4} ${by + 3} ${bx} ${by + 5} Q${bx - 4} ${by + 3} ${bx - 8} ${by + 5}Z M${bx} ${by - 4} V${by + 5}" fill="${C.glass}" ${st(1.4)}/>`;
  // espacio en blanco (rectángulo de puntos)
  g += `<rect x="${x - wd / 2 + 5}" y="${y - ht / 2 + 18}" width="${wd - 10}" height="${ht - 23}" rx="2" fill="none" stroke="${INK}" stroke-width="${w(1)}" stroke-dasharray="${w(2.2)} ${w(2)}" opacity="0.6"/>`;
  g += `<path d="M${x - wd / 2 + 24} ${y - ht / 2 + 7} H${x + wd / 2 - 5} M${x - wd / 2 + 24} ${y - ht / 2 + 12} H${x + wd / 2 - 12}" stroke="${INK}" stroke-width="${w(1)}" stroke-dasharray="${w(1.6)} ${w(1.8)}" opacity="0.5"/>`;
  g += `</g>`;
  return g;
}

/* ===================== SALA VACÍA DEL AÑO PASADO ===================== */
// silla plegable vista de frente / 3/4 (mundo): (x, base) centro inferior
function chair(x, base, s = 1, col = AN.wood, colS = AN.woodS) {
  const st = st14(0.9 / s);
  return at(x, base, s, `<path d="M-30 0 L-26 -70 M30 0 L26 -70 M-24 0 L-20 -60 M24 0 L20 -60" stroke="${INK}" stroke-width="${f(SW * 2 / s)}" stroke-linecap="round"/>
    <path d="M-30 0 L-26 -70 M30 0 L26 -70" stroke="${colS}" stroke-width="${f(SW * 0.7 / s)}" stroke-linecap="round"/>
    <rect x="-36" y="-150" width="72" height="56" rx="10" fill="${col}" ${st}/>
    <path d="M-30 -96 L-28 -76 M30 -96 L28 -76" stroke="${INK}" stroke-width="${f(SW * 1.6 / s)}" stroke-linecap="round"/>
    <path d="M-40 -78 H40 L34 -62 H-34Z" fill="${col}" ${st}/><path d="M-30 -138 H30" stroke="#FFFFFF" stroke-width="${f(SW * 0.7 / s)}" opacity="0.4" stroke-linecap="round"/>`);
}
// mosca con alas que zumban y estela de puntos
function fly(x, y, r, t) {
  const wv = Math.sin(t * 60) * 0.5 + 0.5;
  let s = '';
  for (let i = 1; i <= 5; i++) {
    const u = t - i * 0.09;
    const px = x - Math.cos(u * 3.1) * 60 + Math.cos(t * 3.1) * 60, py = y - Math.sin(u * 4.3) * 30 + Math.sin(t * 4.3) * 30;
    s += `<circle cx="${f(px)}" cy="${f(py)}" r="${f(r * 0.12)}" fill="${INK}" opacity="${f(0.7 - i * 0.12)}"/>`;
  }
  s += at(x, y, 1, `<ellipse cx="${f(-r * 0.3)}" cy="${f(-r * 0.6)}" rx="${f(r * 0.5)}" ry="${f(r * (0.25 + 0.3 * wv))}" fill="#FFFFFF" ${st14(0.5)}/><ellipse cx="${f(r * 0.3)}" cy="${f(-r * 0.6)}" rx="${f(r * 0.5)}" ry="${f(r * (0.25 + 0.3 * wv))}" fill="#FFFFFF" ${st14(0.5)}/>
    <ellipse rx="${f(r * 0.55)}" ry="${f(r * 0.42)}" fill="${INK}"/><circle cx="${f(r * 0.5)}" cy="${f(-r * 0.1)}" r="${f(r * 0.28)}" fill="${INK}"/>`);
  return s;
}
// viñeta de la sala vacía (mundo, en un cuadro 0..wd x 0..ht trasladado a x,y). o: muted
function emptyRoom(x, y, wd, ht, t, o = {}) {
  const id = 'er' + (uid++), sc = wd / 1080;
  let g = `<clipPath id="${id}"><rect x="0" y="0" width="${wd}" height="${ht}" rx="${o.r || 0}"/></clipPath><g clip-path="url(#${id})"><g transform="scale(${f(sc)})">`;
  const H2 = ht / sc;
  g += dotWide(0, 1080, 0, H2);
  g += `<rect x="0" y="0" width="1080" height="70" fill="${AN.woodS}"/><line x1="0" y1="70" x2="1080" y2="70" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  g += bookcase(700, 150, 360, H2 * 0.62, 4, 13);
  g += at(250, 270, 1, clockFace(92, 12 * 60 + 40, { rim: C.navy }));
  g += woodFloor(H2 * 0.7, 0, 1080);
  g += rug(470, H2 * 0.84, 330, 72);
  // sillas vacías en círculo (las de atrás más pequeñas)
  [[250, 0.78, 0.84], [370, 0.74, 0.8], [570, 0.74, 0.8], [690, 0.78, 0.84], [200, 0.92, 1.0], [740, 0.92, 1.0], [470, 0.97, 1.08]].forEach(([cx, v, s]) => { g += chair(cx, H2 * v, s * 1.5); });
  g += pufW(470, H2 * 0.8, 3.0);
  g += cobweb(0, 70, 220, 1) + cobweb(1080, 70, 170, 1).replace(/rotate\(0\)/, 'rotate(90)');
  g += `<path d="M150 ${f(70)} V${f(180 + 10 * Math.sin(t * 2))}" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/>` + spider(150, 190 + 10 * Math.sin(t * 2), 18, 1);
  g += fly(560 + 120 * Math.sin(t * 1.7), H2 * 0.42 + 60 * Math.sin(t * 2.6), 26, t);
  g += `</g></g>`;
  if (o.muted) g = `<g filter="url(#muted)">${g}</g>`;
  return `<g transform="translate(${f(x)} ${f(y)})">${g}</g>`;
}

/* ===================== TARJETA DE EVENTO ===================== */
// libro abierto con estrellas saliendo (mundo, centro x,y; s escala ~ ancho 300)
function openBookStars(x, y, s, t) {
  let g = '';
  for (let i = 0; i < 5; i++) {
    const u = ((t * 0.5 + i / 5) % 1), sx = x + (i - 2) * 46 * s + 18 * s * Math.sin(u * 6 + i), sy = y - 40 * s - u * 150 * s;
    const r = (14 + 6 * (i % 2)) * s * (1 - 0.4 * u);
    g += `<path d="${starPath(r, r * 0.45, 5)}" transform="translate(${f(sx + 3)} ${f(sy + 3)}) rotate(${f(u * 120)})" fill="${INK}"/>`;
    g += `<path d="${starPath(r, r * 0.45, 5)}" transform="translate(${f(sx)} ${f(sy)}) rotate(${f(u * 120)})" fill="${C.yel}" ${st14(0.6)}/>`;
  }
  const S = s * 5.4, w = v => f(v * SW / (3 * S));
  g += `<g transform="translate(${f(x)} ${f(y + 10 * s)}) scale(${f(S)})">${bigBookL(w, 0, 0, 1, 0)}</g>`;
  return g;
}
// sello rojo con estrella
function starSeal(x, y, r, k, rot = -10) {
  if (k <= 0.01) return '';
  const d = starPath(r, r * 0.82, 16);
  let g = `<path d="${d}" transform="translate(${f(r * 0.07)} ${f(r * 0.07)})" fill="${INK}"/><path d="${d}" fill="${C.red}" ${st14()}/>`;
  g += `<circle r="${f(r * 0.66)}" fill="none" stroke="#FFFFFF" stroke-width="${f(Math.max(3, r * 0.035))}" stroke-dasharray="${f(r * 0.12)} ${f(r * 0.09)}" stroke-linecap="round"/>`;
  g += `<path d="${starPath(r * 0.46, r * 0.2, 5)}" transform="translate(${f(r * 0.04)} ${f(r * 0.04)})" fill="${INK}"/><path d="${starPath(r * 0.46, r * 0.2, 5)}" fill="${C.yel}" ${st14(0.8)}/>`;
  return at(x, y, k, g, rot);
}
const EVT = () => (CFG && CFG.evento) || { titulo: 'Cuentacuentos infantil', cuando: 'Sábado · 12:00', comercio: 'Librería', etiqueta: 'Evento' };
// pantalla del móvil con la tarjeta de evento. o: kSeal, press, done, kDone
function eventScreen(o = {}, t = 0) {
  return (sx, sy, sw, sh) => {
    const E = EVT(), hh = 150;
    let g = `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" fill="${C.cream}"/>`;
    for (let yy = sy + hh + 30; yy < sy + sh; yy += 44) for (let xx = sx + 22; xx < sx + sw; xx += 44) g += `<circle cx="${xx}" cy="${yy}" r="3.5" fill="${DOT}" opacity="0.6"/>`;
    g += `<rect x="${sx}" y="${sy}" width="${sw}" height="${hh}" fill="${C.red}"/><line x1="${sx}" y1="${sy + hh}" x2="${sx + sw}" y2="${sy + hh}" ${st14()}/>`;
    const lr = hh * 0.36;
    g += `<circle cx="${f(sx + 28 + lr)}" cy="${f(sy + hh / 2 + 4)}" r="${f(lr)}" fill="#FFFFFF" ${st14(0.8)}/>` + logoI13(sx + 28 + lr, sy + hh / 2 + 4, lr * 1.75);
    g += text('Escaparate de Tudela', sx + 28 + lr * 2 + 20, sy + hh / 2 + 4, { size: fit('Escaparate de Tudela', 52, sw - lr * 2 - 76), anchor: 'start', sw: SW * 1.4, sd: 4 });
    const x = sx + 24, y = sy + hh + 26, wd = sw - 48, ht = sh - hh - 52;
    g += panel(x, y, wd, ht, 34, '#FFFFFF', 12);
    const ih = ht * 0.34;
    g += `<rect x="${x + 18}" y="${y + 18}" width="${wd - 36}" height="${f(ih)}" rx="24" fill="#FFF1C9" ${st14(0.8)}/>`;
    g += `<circle cx="${f(x + wd / 2 - 30)}" cy="${f(y + 18 + ih * 0.6)}" r="${f(ih * 0.4)}" fill="#FFFFFF" opacity="0.85"/>`;
    g += openBookStars(x + wd / 2 - 30, y + 18 + ih * 0.66, wd / 560, t);
    g += starSeal(x + wd - 96, y + 100, 70, o.kSeal === undefined ? 1 : o.kSeal, -10);
    let ty = y + 18 + ih + 58;
    g += text(E.comercio, x + 34, ty, { size: fit(E.comercio, 72, wd - 290), anchor: 'start', fill: INK, stroke: null });
    g += pill(x + wd - 34 - 100, ty, 200, 64, AN.purple, E.etiqueta, { size: 38 });
    ty += 74;
    g += text(E.titulo, x + 34, ty, { size: fit(E.titulo, 54, wd - 68), anchor: 'start', fill: INK, stroke: null });
    ty += 68;
    g += at(x + 58, ty, 1, clockFace(24, 12 * 60, { rim: C.yel }));
    g += text(E.cuando, x + 104, ty + 2, { size: fit(E.cuando, 50, wd - 140), anchor: 'start', fill: C.red, stroke: INK, sw: SW * 1.2, sd: 3 });
    // botón Publicar / Publicada
    const by = y + ht - 74, bw = wd - 70, press = o.press || 0;
    if (!o.done) g += at(x + wd / 2, by, 1 - 0.07 * press, pill(0, 0, bw, 100, C.red, 'Publicar', { size: 58 }));
    else {
      const kd = o.kDone === undefined ? 1 : o.kDone;
      g += at(x + wd / 2, by, lerp(0.85, 1, kd), pill(0, 0, bw, 100, C.green, 'Publicada', { size: 56, dx: 30 }) + checkCircle(-bw / 2 + 70, 0, 33, 1));
    }
    return g;
  };
}
// tarjeta flotante (escena 6): cabecera roja y evento. (x,y) centro
function eventCardFloat(x, y, k, rot, t) {
  if (k <= 0.01) return '';
  const E = EVT(), Wd = 900, Hd = 360, x0 = -Wd / 2, y0 = -Hd / 2, hh = 110, id = 'ec' + (uid++);
  let g = panel(x0, y0, Wd, Hd, 40, '#FFFFFF', 14);
  g += `<clipPath id="${id}"><rect x="${x0}" y="${y0}" width="${Wd}" height="${Hd}" rx="40"/></clipPath><g clip-path="url(#${id})"><rect x="${x0}" y="${y0}" width="${Wd}" height="${hh}" fill="${C.red}"/></g>`;
  g += `<line x1="${x0}" y1="${y0 + hh}" x2="${x0 + Wd}" y2="${y0 + hh}" ${st14()}/><rect x="${x0}" y="${y0}" width="${Wd}" height="${Hd}" rx="40" fill="none" ${st14()}/>`;
  const ir = hh * 0.36, icx = x0 + 28 + ir, icy = y0 + hh / 2;
  g += `<circle cx="${f(icx)}" cy="${f(icy)}" r="${f(ir)}" fill="#FFFFFF" ${st14(0.8)}/>` + logoI13(icx, icy, ir * 1.75);
  g += text('Escaparate de Tudela', icx + ir + 22, icy + 2, { size: 52, anchor: 'start', sw: SW * 1.4, sd: 4 });
  g += pill(x0 + Wd - 130, icy, 190, 62, AN.purple, E.etiqueta, { size: 36 });
  // ilustración
  g += `<rect x="${x0 + 26}" y="${y0 + hh + 22}" width="230" height="${Hd - hh - 48}" rx="22" fill="#FFF1C9" ${st14(0.8)}/>`;
  g += openBookStars(x0 + 141, y0 + hh + 150, 0.42, t);
  const tx = x0 + 290, tw = Wd - 330;
  g += text(E.comercio, tx, y0 + hh + 54, { size: fit(E.comercio, 56, tw), anchor: 'start', fill: C.red, stroke: INK, sw: SW * 1.2, sd: 3 });
  g += text(E.titulo, tx, y0 + hh + 126, { size: fit(E.titulo, 58, tw), anchor: 'start', fill: INK, stroke: null });
  g += text(E.cuando, tx, y0 + hh + 196, { size: fit(E.cuando, 54, tw), anchor: 'start', fill: INK, stroke: null });
  return at(x, y, k, g, rot);
}
// móvil pequeño en la mano de los vecinos, con la tarjeta del evento (para placeFolk handF)
function evtPhoneHand(hx, hy, o = {}) {
  return w => {
    const rot = o.rot === undefined ? -12 : o.rot, sh = o.shake || 0;
    let g = `<g transform="translate(${f(hx + 3 + sh)} ${f(hy - 13)}) rotate(${f(rot)})">`;
    g += `<rect x="-10.5" y="-18" width="21" height="36" rx="3.6" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/>`;
    g += o.lit ? miniEventScreen(-8.3, -15.4, 16.6, 31, false, w) : `<rect x="-8.3" y="-15.4" width="16.6" height="31" rx="2" fill="${C.glass}"/>`;
    g += `</g><circle cx="${hx}" cy="${hy}" r="4.3" fill="${o.skin || C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
    return g;
  };
}

/* ===================== DRAGÓN SIMPÁTICO (burbuja del cuento) ===================== */
function dragon(x, y, s, t) {
  const st = st14(0.9 / s), flap = Math.sin(t * 7);
  let g = '';
  // cola
  g += `<path d="M-40 30 Q-110 40 -120 -10 Q-122 -30 -104 -36" fill="none" stroke="${INK}" stroke-width="${f(SW * 4.6 / s)}" stroke-linecap="round"/><path d="M-40 30 Q-110 40 -120 -10 Q-122 -30 -104 -36" fill="none" stroke="${C.green}" stroke-width="${f(SW * 2.8 / s)}" stroke-linecap="round"/>`;
  g += `<path d="M-104 -36 L-92 -58 L-84 -32Z" fill="${C.red}" ${st}/>`;
  // ala trasera
  g += `<g transform="rotate(${f(-10 + 14 * flap)} -6 -30)"><path d="M-6 -30 Q-40 -110 -84 -88 Q-60 -70 -64 -50 Q-40 -60 -36 -38Z" fill="${AN.purple}" ${st}/></g>`;
  // cuerpo y barriga
  g += `<ellipse cx="0" cy="10" rx="58" ry="52" fill="${C.green}" ${st}/>`;
  g += `<ellipse cx="10" cy="22" rx="34" ry="36" fill="${C.yel}" ${st}/>`;
  g += `<path d="M-14 8 Q10 2 34 8 M-16 24 Q10 18 36 24 M-12 40 Q10 34 32 40" stroke="${INK}" stroke-width="${f(SW * 0.5 / s)}" fill="none" stroke-linecap="round" opacity="0.6"/>`;
  // patas
  g += `<ellipse cx="-24" cy="60" rx="18" ry="11" fill="${C.green}" ${st}/><ellipse cx="34" cy="60" rx="18" ry="11" fill="${C.green}" ${st}/>`;
  // ala delantera
  g += `<g transform="rotate(${f(8 - 16 * flap)} 20 -30)"><path d="M20 -30 Q40 -120 92 -96 Q68 -78 74 -58 Q48 -66 46 -38Z" fill="${AN.purple}" ${st}/><path d="M28 -40 Q50 -80 70 -86" stroke="${INK}" stroke-width="${f(SW * 0.5 / s)}" fill="none"/></g>`;
  // cabeza
  g += `<g transform="rotate(${f(4 * Math.sin(t * 3))} 30 -50)">`;
  g += `<path d="M4 -96 L12 -118 L22 -96Z M34 -98 L46 -118 L52 -94Z" fill="${C.yel}" ${st}/>`;
  g += `<ellipse cx="28" cy="-70" rx="44" ry="36" fill="${C.green}" ${st}/>`;
  g += `<ellipse cx="62" cy="-58" rx="28" ry="20" fill="${C.green}" ${st}/>`;
  g += `<circle cx="74" cy="-62" r="3.4" fill="${INK}"/><circle cx="62" cy="-63" r="3.4" fill="${INK}"/>`;
  g += `<circle cx="16" cy="-80" r="13" fill="#FFFFFF" ${st}/><circle cx="40" cy="-82" r="13" fill="#FFFFFF" ${st}/>`;
  g += `<circle cx="20" cy="-79" r="6.4" fill="${INK}"/><circle cx="44" cy="-81" r="6.4" fill="${INK}"/><circle cx="22" cy="-82" r="2.2" fill="#FFFFFF"/><circle cx="46" cy="-84" r="2.2" fill="#FFFFFF"/>`;
  g += `<circle cx="8" cy="-58" r="7" fill="${C.pink}" opacity="0.8"/>`;
  g += `<path d="M40 -50 Q58 -36 78 -50" stroke="${INK}" stroke-width="${f(SW * 0.9 / s)}" fill="none" stroke-linecap="round"/>`;
  g += `</g>`;
  // humito en forma de corazones
  const u = (t * 0.8) % 1;
  g += `<g transform="translate(${f(104 + 40 * u)} ${f(-64 - 30 * u)}) scale(${f(0.6 + 0.6 * u)})"><path d="${heartPath(14)}" fill="${C.pink}" ${st}/></g>`;
  return at(x, y, s, g);
}
// burbuja del cuento sobre la cuentacuentos, con el dragón y estrellas. cola hacia (tx,ty)
function storyBubble(cx, cy, wd, ht, k, t, tx, ty) {
  if (k <= 0.01) return '';
  let s = '';
  // cola de bolitas hacia la cuentacuentos
  [[0.72, 16], [0.5, 24], [0.28, 32]].forEach(([u, r]) => { s += thinkDot(lerp(tx, cx, u), lerp(ty, cy + ht * 0.4, u), r, k); });
  let g = '';
  g += `<ellipse cx="14" cy="16" rx="${wd / 2}" ry="${ht / 2}" fill="${INK}"/><ellipse cx="0" cy="0" rx="${wd / 2}" ry="${ht / 2}" fill="#E8F4FF" ${st14(1.2)}/>`;
  g += `<g opacity="0.55">${rays(0, 20, 14, t * 14, '#FFFFFF', wd * 0.5)}</g>`;
  g += `<ellipse cx="0" cy="0" rx="${wd / 2}" ry="${ht / 2}" fill="none" ${st14(1.2)}/>`;
  g += dragon(-10, 30, ht / 290, t);
  [[-wd * 0.36, -ht * 0.18, 24], [wd * 0.34, -ht * 0.26, 20], [wd * 0.38, ht * 0.18, 16], [-wd * 0.3, ht * 0.24, 18]].forEach(([x, y, r], i) => {
    g += `<path d="${starPath(r * (0.9 + 0.15 * Math.sin(t * 6 + i)), r * 0.45, 5)}" transform="translate(${f(x)} ${f(y)})" fill="${C.yel}" ${st14(0.8)}/>`;
  });
  s += at(cx, cy, k, g);
  return s;
}

/* ===================== CARTELAS ===================== */
// cartela amarilla («El año pasado») o verde («Este año»)
function cartela(str, x, y, k, rot = -3, fill = C.yel, col = INK, size = 64) {
  if (k <= 0.01) return '';
  const tw = measure(str, size), pw = tw + 64, ph = size * 1.4;
  let g = `<rect x="${f(-pw / 2 + 9)}" y="${f(-ph / 2 + 9)}" width="${f(pw)}" height="${f(ph)}" rx="14" fill="${INK}"/>`;
  g += `<rect x="${f(-pw / 2)}" y="${f(-ph / 2)}" width="${f(pw)}" height="${f(ph)}" rx="14" fill="${fill}" ${st14()}/>`;
  g += text(str, 0, size * 0.05, col === INK ? { size, fill: INK, stroke: null, shadow: false } : { size, fill: col, sw: SW * 1.6, sd: 4 });
  return at(x, y, k, g, rot);
}
// sello de goma «Prueba social»
function rubberStamp(str, x, y, k, rot = -8, col = C.red) {
  if (k <= 0.01) return '';
  const size = 80, tw = measure(str, size, 'G'), pw = tw + 90, ph = size * 1.55;
  let g = `<rect x="${f(-pw / 2 + 8)}" y="${f(-ph / 2 + 8)}" width="${f(pw)}" height="${f(ph)}" rx="18" fill="${INK}"/>`;
  g += `<rect x="${f(-pw / 2)}" y="${f(-ph / 2)}" width="${f(pw)}" height="${f(ph)}" rx="18" fill="${C.cream}" stroke="${col}" stroke-width="${f(SW * 2.2)}"/>`;
  g += `<rect x="${f(-pw / 2 + 14)}" y="${f(-ph / 2 + 14)}" width="${f(pw - 28)}" height="${f(ph - 28)}" rx="10" fill="none" stroke="${col}" stroke-width="${f(SW * 0.8)}"/>`;
  g += text(str, 0, 4, { size, font: 'G', fill: col, stroke: null, shadow: false, ls: 3 });
  return at(x, y, k, g, rot);
}
