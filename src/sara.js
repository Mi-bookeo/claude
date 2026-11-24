/* Vídeo 16 — personajes nuevos: SARA (peluquera) y la CLIENTA. Mismo esqueleto que Ana (v14.js): de frente, con cuello,
   sistema local con el suelo en y=208 y el centro en x=190 (cabeza en 190,76; hombros en 174/206,104).
   SARA: unos 35 años; pelo castaño oscuro rapado a un lado (izquierda de la imagen) y melena con mechón morado al otro,
   pendientes de aro grandes, mejillas rosadas, camiseta blanca, delantal negro con bolsillos (tijeras y peine),
   vaqueros azules y zapatillas blancas.
   CLIENTA: unos 30 años, melena larga ondulada castaña, chaqueta verde, top crema, vaqueros, bolso cruzado.
   o: expr, blink, look [dx,dy], talk (0..1), bob, head (giro), walk (fase), armF / armB {h, side, hand, hs, hrot, L, item, over},
      armBFront (brazo de atrás por delante de la cabeza), arms: 'phone' | 'tablet' (Sara), sit (clienta sentada), front(w). */
'use strict';

const SA = {
  hair: '#3B2418', hairS: '#24140C', hairL: '#6A4430', shaved: '#6A544B', purple: '#7E57C2', purpleL: '#A88BE6',
  tee: '#FFFFFF', teeS: '#E6DEDC', apron: '#35302F', apronL: '#4E4746', jean: '#3F7CC4', jeanS: '#2B5A99',
  shoe: '#FFFFFF', shoeS: '#D9D2D0', gold: '#F2C12E', cheek: '#F29C9C', skin: '#F6C9A0', skinS: '#E9B88F', steel: '#D9DEE2'
};
const CL = {
  hair: '#8A5532', hairS: '#653A1F', hairL: '#B07A4E', jac: '#3C9D5D', jacS: '#2C7A47', top: '#FFF5F3',
  jean: '#3F7CC4', jeanS: '#2B5A99', shoe: '#5A3A2A', bag: '#A9743F', bagS: '#7E5328', cheek: '#F29C9C', lip: '#C2185B'
};
const SA_SF = [206, 104], SA_SB = [174, 104];

/* ---------- cara (compartida; brows = color de cejas) ---------- */
function face16(o, w, brows) {
  const e = o.expr || 'happy', lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const L = (d, sw = 1.6, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const dotEye = (cx, cy, r = 2) => `<circle cx="${f(cx + lx)}" cy="${f(cy + ly)}" r="${r}" fill="${INK}"/><circle cx="${f(cx + lx + 0.7)}" cy="${f(cy + ly - 0.7)}" r="0.65" fill="#FFFFFF"/>`;
  const big = (cx, cy, r = 3.6) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.4)}"/><circle cx="${f(cx + lx * 0.6)}" cy="${f(cy + ly * 0.6)}" r="${f(r * 0.5)}" fill="${INK}"/><circle cx="${f(cx + lx * 0.6 + 0.7)}" cy="${f(cy + ly * 0.6 - 0.7)}" r="0.6" fill="#FFFFFF"/>`;
  const shine = (cx, cy) => `<circle cx="${f(cx + lx)}" cy="${f(cy + ly)}" r="2.7" fill="${INK}"/><circle cx="${f(cx + lx + 0.9)}" cy="${f(cy + ly - 1)}" r="1.05" fill="#FFFFFF"/><circle cx="${f(cx + lx - 0.9)}" cy="${f(cy + ly + 1)}" r="0.5" fill="#FFFFFF"/>`;
  const lash = (cx, cy, dir) => L(`M${f(cx + dir * 2.2)} ${f(cy - 1.4)} l${f(dir * 1.6)} -1.2`, 1.2);
  const happyArc = 'M181.8 78.6 Q184.5 75.2 187.2 78.6 M192.8 78.6 Q195.5 75.2 198.2 78.6';
  let s = '';
  const ck = e === 'worried' ? 0.55 : 0.85;
  s += `<ellipse cx="180.2" cy="84.6" rx="3.7" ry="2.6" fill="${SA.cheek}" opacity="${ck}"/><ellipse cx="199.8" cy="84.6" rx="3.7" ry="2.6" fill="${SA.cheek}" opacity="${ck}"/>`;
  // ojos
  if (o.blink && !['joy', 'proud', 'cheeky'].includes(e)) s += L('M182 78 Q184.5 79.2 187 78 M193 78 Q195.5 79.2 198 78', 1.6);
  else if (e === 'surprise' || e === 'worried') s += big(184.5, 77.6, e === 'worried' ? 3.3 : 3.8) + big(195.5, 77.6, e === 'worried' ? 3.3 : 3.8) + lash(184.5, 76.4, -1.3) + lash(195.5, 76.4, 1.3);
  else if (e === 'determined') s += shine(184.5, 77.8) + shine(195.5, 77.8) + lash(184.5, 77.2, -1.1) + lash(195.5, 77.2, 1.1);
  else if (e === 'joy' || e === 'proud') s += L(happyArc, 1.8) + lash(184.5, 77.6, -1) + lash(195.5, 77.6, 1);
  else if (e === 'cheeky') s += L('M181.8 78.4 Q184.5 76 187.2 78.4', 1.8) + shine(195.5, 77.6) + lash(195.5, 77.4, 1.1);
  else s += dotEye(184.5, 77.8) + dotEye(195.5, 77.8) + lash(184.5, 77.6, -1) + lash(195.5, 77.6, 1);
  // cejas
  const brow = d => L(d, 1.9, brows);
  if (e === 'worried') s += brow('M180.8 71.6 Q184 70.4 187.4 68.6 M192.6 68.6 Q196 70.4 199.2 71.6');
  else if (e === 'think') s += brow('M181 71.8 Q184 71 187.4 71.6 M192.6 69.6 Q196 67.4 199.2 69');
  else if (e === 'surprise') s += brow('M180.8 69.6 Q184 66.6 187.6 68.8 M192.4 68.8 Q196 66.6 199.2 69.6');
  else if (e === 'determined') s += brow('M181 70.2 Q184 70.4 187.6 72.2 M192.4 72.2 Q196 70.4 199 70.2');
  else if (e === 'cheeky') s += brow('M181 72.4 Q184 71.6 187.4 72.2 M192.6 69.4 Q196 66.8 199.2 68.8');
  else s += brow('M181 71.6 Q184 69.8 187.4 71 M192.6 71 Q196 69.8 199 71.6');
  // nariz
  s += L('M189.4 80.8 Q190.6 84.4 192 82.8', 1.4);
  // boca
  const m = clamp(o.talk || 0);
  const open = (h, wd = 5.4) => {
    let g = `<path d="M${f(190 - wd)} 87.8 Q190 ${f(87.8 + h * 1.3)} ${f(190 + wd)} 87.8Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
    if (h > 4.4) g += `<path d="M${f(190 - wd * 0.62)} ${f(87.8 + h * 0.55)} Q190 ${f(87.8 + h * 0.95)} ${f(190 + wd * 0.62)} ${f(87.8 + h * 0.55)}Z" fill="${C.pink}"/>`;
    return g + `<path d="M${f(190 - wd + 0.8)} 88.2 H${f(190 + wd - 0.8)}" stroke="#FFFFFF" stroke-width="${w(1.3)}" stroke-linecap="round"/>`;
  };
  if (e === 'surprise' && m < 0.05) s += `<ellipse cx="190" cy="90" rx="2.7" ry="3.4" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
  else if (m > 0.05) s += open(lerp(3, 6.6, m), e === 'cheeky' ? 5 : 5.4);
  else if (e === 'worried') s += L('M185.8 90.2 Q187.9 88.4 190 90 Q192.1 91.6 194.2 89.8', 1.8);
  else if (e === 'think') s += L('M187.2 89.8 Q190 90.8 193.4 88.6', 1.8);
  else if (e === 'cheeky') s += L('M185.6 88.2 Q189.6 92.2 194.8 87', 2);
  else if (e === 'joy') s += open(7.4);
  else if (e === 'proud' || e === 'determined' || e === 'smile') s += open(e === 'smile' ? 5.2 : 5.6, 5.2);
  else s += L('M185.6 88.4 Q190 92.4 194.4 88.4', 1.9);
  return s;
}

/* ---------- piezas pequeñas (locales) ---------- */
// tijeras (local): (x,y) eje; rot grados; open 0..1 (abre las hojas); s escala (1 = 18 de largo)
function scissorsL(x, y, rot, open, s, w) {
  const a = 4 + 18 * clamp(open);
  const blade = `<path d="M0 -1.3 L13 -0.4 Q14.4 0 13 0.4 L0 1.3Z" fill="${SA.steel}" stroke="${INK}" stroke-width="${f(+w(1.3) / s)}" stroke-linejoin="round"/>`;
  const ring = cx => `<circle cx="${cx}" cy="0" r="2.6" fill="none" stroke="${INK}" stroke-width="${f(+w(3) / s)}"/><circle cx="${cx}" cy="0" r="2.6" fill="none" stroke="${C.red}" stroke-width="${f(+w(1.4) / s)}"/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})">
    <g transform="rotate(${f(-a / 2)})">${blade}<path d="M0 0 L-3 0" stroke="${INK}" stroke-width="${f(+w(1.4) / s)}"/>${ring(-5.4)}</g>
    <g transform="rotate(${f(a / 2)})">${blade}${ring(-5.4)}</g>
    <circle r="0.9" fill="${INK}"/></g>`;
}
// peine (local): centro (x,y), largo 16 * s
function combL(x, y, rot, s, w, col = SA.purple) {
  let teeth = '';
  for (let i = 0; i < 9; i++) teeth += `M${f(-6.4 + i * 1.6)} 1.4 V4.6 `;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})">
    <path d="${teeth}" stroke="${INK}" stroke-width="${f(+w(1.1) / s)}" stroke-linecap="round"/>
    <rect x="-8" y="-1.6" width="16" height="3.4" rx="1.4" fill="${col}" stroke="${INK}" stroke-width="${f(+w(1.4) / s)}"/></g>`;
}
// aro dorado (pendiente) en (x,y)
function hoopL(x, y, r, w) {
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="none" stroke="${INK}" stroke-width="${f(+w(1.6) + 1.8)}"/><circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="none" stroke="${SA.gold}" stroke-width="${f(1.8 - +w(1.2) * 0.4)}"/>`;
}

/* ---------- SARA ---------- */
function armS(S, A, w) {
  const { E, H } = ik2(S, A.h, A.side || 1, A.L || 18);
  let g = capsule([S, E, H], 7.4, SA.skin, w);
  g += capsule([S, lerp2(S, E, 0.5)], 10.6, SA.tee, w);
  if (A.item) g += A.item(H, w);
  if (A.hand !== 'none') g += hand11(A.hand || 'fist', H, w, Object.assign({ fill: SA.skin, hs: 1.25 }, A));
  if (A.over) g += A.over(H, w);
  return g;
}
function sneaker16(d, w) {
  return `<path d="${d}" fill="${SA.shoe}" ${stA(w)}/>`;
}
function sara(o) {
  const k = o.k || 1, w = v => f(v * k);
  let g = '';
  // piernas: vaqueros y zapatillas blancas (al andar de frente, una se levanta)
  const wl = o.walk === undefined ? 0 : Math.sin(o.walk), upL = 4 * Math.max(0, wl), upR = 4 * Math.max(0, -wl);
  const leg = (x, up, shoeD, sole) => `<g transform="translate(0 ${f(-up)})"><rect x="${x}" y="144" width="11.5" height="58" rx="4" fill="${SA.jean}" ${stA(w)}/>` +
    `<path d="M${x + 3} 168 V196" stroke="${SA.jeanS}" stroke-width="${w(1.4)}" stroke-linecap="round"/>` +
    sneaker16(shoeD, w) + `<path d="${sole}" stroke="${INK}" stroke-width="${w(1.1)}" stroke-linecap="round"/></g>`;
  g += leg(177.5, upL, 'M174 200.6 h15 a3 3 0 0 1 3 3 v4.4 h-20 a3 3 0 0 1 2 -7.4z', 'M173 205.2 H191.6');
  g += leg(191, upR, 'M191 200.6 h15 a3 3 0 0 1 2 7.4 h-20 v-4.4 a3 3 0 0 1 3 -3z', 'M188.6 205.2 H207');
  let b = '';
  // melena trasera (solo en el lado largo, derecha de la imagen)
  const hr = o.head || 0;
  b += `<g transform="rotate(${f(hr)} 190 96)"><path d="M191 52.4 Q209.6 52 210 71 Q211.6 84 209 94.6 Q207.6 99.6 202.4 98 Q204.4 88 203 79 L190 60Z" fill="${SA.hair}" ${stA(w)}/></g>`;
  // torso: camiseta blanca
  const torso = 'M174.6 99 Q190 94.4 205.4 99 Q211.6 103.6 211.4 120 Q212 137 206.4 150 H173.6 Q168 137 168.6 120 Q168.4 103.6 174.6 99Z';
  b += `<path d="${torso}" fill="${SA.tee}"/><path d="M174.6 99 Q179 97.4 181 97 L179 150 H173.6 Q168 137 168.6 120 Q168.4 103.6 174.6 99Z" fill="${SA.teeS}"/><path d="${torso}" fill="none" ${stA(w)}/>`;
  // cuello y cuello redondo de la camiseta
  b += `<rect x="185.4" y="87" width="9.2" height="11" rx="2" fill="${SA.skinS}" ${stA(w, 2.4)}/>`;
  b += `<path d="M182.4 96.6 Q190 103.4 197.6 96.6" fill="none" stroke="${INK}" stroke-width="${w(4.2)}" stroke-linecap="round"/><path d="M182.4 96.6 Q190 103.4 197.6 96.6" fill="none" stroke="${SA.teeS}" stroke-width="${w(1.6)}" stroke-linecap="round"/>`;
  // delantal negro: tirantes, peto, cintura, falda con dos bolsillos (peine y tijeras asomando)
  b += `<path d="M181.4 105 L184.8 98.6 M198.6 105 L195.2 98.6" stroke="${INK}" stroke-width="${w(4.6)}" stroke-linecap="round"/><path d="M181.4 105 L184.8 98.6 M198.6 105 L195.2 98.6" stroke="${SA.apronL}" stroke-width="${w(1.8)}" stroke-linecap="round"/>`;
  const apron = 'M180 104.4 H200 L201.2 121 L208.6 167 Q190 170.4 171.4 167 L178.8 121Z';
  b += `<path d="${apron}" fill="${SA.apron}" ${stA(w)}/>`;
  b += `<path d="M180.6 106.4 L180 119" stroke="${SA.apronL}" stroke-width="${w(1.2)}" stroke-linecap="round"/>`;
  b += `<path d="M172.4 119.2 H207.6 L207.8 124 H172.2Z" fill="${SA.apronL}" ${stA(w, 2.2)}/>`;
  b += combL(183, 134.6, -6, 0.62, w) + scissorsL(198.2, 133.6, -78, 0.15, 0.55, w);
  b += `<rect x="176" y="136" width="12.4" height="12" rx="2" fill="${SA.apronL}" ${stA(w, 2.2)}/><rect x="191.6" y="136" width="12.4" height="12" rx="2" fill="${SA.apronL}" ${stA(w, 2.2)}/>`;
  b += `<path d="M178 139 H186.4 M193.6 139 H202" stroke="${INK}" stroke-width="${w(0.9)}" stroke-dasharray="1.4 1.2" opacity="0.6"/>`;
  if (o.under) b += o.under(w);
  // brazos de atrás / modos especiales
  if (o.arms === 'phone') {
    const ph = o.typePh || 0;
    b += capsule([SA_SB, [175, 127]], 7.4, SA.skin, w) + capsule([SA_SF, [205, 127]], 7.4, SA.skin, w);
    b += capsule([[176, 127], [184.4, 120.6]], 7.2, SA.skin, w) + capsule([[204, 127], [195.6, 120.6]], 7.2, SA.skin, w);
    b += capsule([SA_SB, [174.4, 114]], 10.6, SA.tee, w) + capsule([SA_SF, [205.6, 114]], 10.6, SA.tee, w);
    b += `<g transform="rotate(-4 190 112)"><rect x="181" y="96.6" width="18" height="30" rx="3.2" fill="${INK}" ${stA(w, 2)}/>` + (o.phoneScreen ? o.phoneScreen(183, 99.2, 14, 25, w) : `<rect x="183" y="99.2" width="14" height="25" rx="1.8" fill="${C.glass}"/>`) + `</g>`;
    const a = Math.max(0, Math.sin(ph * PI)), c = Math.max(0, -Math.sin(ph * PI));
    b += `<circle cx="184" cy="121" r="4.3" fill="${SA.skin}" ${stA(w, 2.2)}/><circle cx="196" cy="121" r="4.3" fill="${SA.skin}" ${stA(w, 2.2)}/>`;
    b += `<rect x="${f(184.6 + a * 1.2)}" y="${f(113 - a * 2.4)}" width="4.6" height="7" rx="2.3" fill="${SA.skin}" ${stA(w, 1.6)}/>`;
    b += `<rect x="${f(190.8 - c * 1.2)}" y="${f(113 - c * 2.4)}" width="4.6" height="7" rx="2.3" fill="${SA.skin}" ${stA(w, 1.6)}/>`;
  } else if (o.arms === 'tablet') {
    const tr = o.tabRot || -6;
    b += capsule([SA_SB, [172.4, 126], [176.4, 124]], 7.4, SA.skin, w) + capsule([SA_SF, [207.6, 126], [203.6, 124]], 7.4, SA.skin, w);
    b += capsule([SA_SB, [173, 114]], 10.6, SA.tee, w) + capsule([SA_SF, [207, 114]], 10.6, SA.tee, w);
    b += `<g transform="rotate(${f(tr)} 190 120)"><rect x="176.4" y="105" width="27.2" height="34" rx="3.4" fill="${INK}" ${stA(w, 2)}/>` +
      (o.tabScreen ? o.tabScreen(178.6, 107.2, 22.8, 29.6, w) : `<rect x="178.6" y="107.2" width="22.8" height="29.6" rx="1.8" fill="${C.glass}"/>`) + `</g>`;
    b += `<circle cx="177" cy="123" r="4.2" fill="${SA.skin}" ${stA(w, 2.2)}/><circle cx="203" cy="123" r="4.2" fill="${SA.skin}" ${stA(w, 2.2)}/>`;
  } else if (o.armB && !o.armBFront) b += armS(SA_SB, o.armB, w);
  // cabeza
  let hd = '';
  // oreja del lado rapado y aro
  hd += `<ellipse cx="175.6" cy="80" rx="3.2" ry="3.8" fill="${SA.skinS}" ${stA(w, 2.4)}/>`;
  hd += `<path d="M175.4 74 Q175.6 91 190 94 Q204.4 91 204.6 74 Q204.6 58.4 190 58.4 Q175.4 58.4 175.4 74Z" fill="${SA.skin}" ${stA(w)}/>`;
  // lado rapado (sombreado corto con puntitos)
  hd += `<path d="M175.5 77 Q174.4 62.6 183.6 58.8 L186 64.6 Q180.4 67.4 179.4 77Z" fill="${SA.shaved}" ${stA(w, 2)}/>`;
  for (let i = 0; i < 26; i++) { const x = 176.6 + hash(i * 3.7) * 7.4, y = 61 + hash(i * 5.3) * 15; if (x < 186 - (y - 61) * 0.45 && x > 175.8 + (y < 66 ? (66 - y) * 0.9 : 0)) hd += `<circle cx="${f(x)}" cy="${f(y)}" r="0.32" fill="${SA.hairS}"/>`; }
  hd += `<path d="M179.4 77 Q180.4 68 186 64.6" stroke="${SA.hairS}" stroke-width="${w(1)}" fill="none" stroke-linecap="round" opacity="0.6"/>`;
  // tupé que cae hacia el lado largo, con mechón morado
  const top = 'M181.4 61.2 Q186 51 196.4 52.2 Q208.6 54.4 207.6 68 Q209 80 205.6 89 Q203.4 83 202.6 77 Q200.4 70.8 194.8 69.4 Q188.4 68.6 184.6 66 Q182.2 64.4 181.4 61.2Z';
  hd += `<path d="${top}" fill="${SA.hair}" ${stA(w)}/>`;
  hd += `<path d="M198.8 54.4 Q206.4 57.6 206.2 69.6 Q206.8 80 204.8 87.4 Q203.4 80.4 202.8 74.4 Q201.8 63.4 196.8 57.4Z" fill="${SA.purple}" ${stA(w, 1.8)}/>`;
  hd += `<path d="M200.6 58.6 Q204.2 63 204 72" stroke="${SA.purpleL}" stroke-width="${w(1.2)}" fill="none" stroke-linecap="round"/>`;
  hd += `<path d="M185.4 58 Q190 55 195 55.6 M187.6 63.2 Q192.6 62.6 197.2 65.4" stroke="${SA.hairL}" stroke-width="${w(1.3)}" fill="none" stroke-linecap="round"/>`;
  hd += hoopL(175.4, 87.2, 3.4, w) + hoopL(206.4, 92, 3.4, w);
  hd += face16(o, w, SA.hairS);
  b += `<g transform="rotate(${f(hr)} 190 96)">${hd}</g>`;
  if (o.armB && o.armBFront && !o.arms) b += armS(SA_SB, o.armB, w);
  if (!o.arms && o.armF) b += armS(SA_SF, o.armF, w);
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  if (o.lean) g = `<g transform="rotate(${f(o.lean)} 190 208)">${g}</g>`;
  return g;
}
function placeSara(px, py, sc, o) {
  o.k = SW / (3 * sc);
  return `<g transform="translate(${f(px - 190 * sc)} ${f(py - 208 * sc)}) scale(${f(sc)})">${sara(o)}</g>`;
}
const sPt = (px, py, sc, lx, ly) => [px + (lx - 190) * sc, py + (ly - 208) * sc];
const sLoc = (px, py, sc, X, Y) => [190 + (X - px) / sc, 208 + (Y - py) / sc];
const SP = {
  restF: { h: [212, 140], side: -1, hand: 'fist', hs: 1.2 },
  restB: { h: [168, 140], side: 1, hand: 'fist', hs: 1.2 },
  hipF: { h: [214, 128], side: -1, hand: 'fist', hs: 1.2 },
  thumbF: { h: [221, 98], side: 1, hand: 'thumb', hs: 1.5 },
  punchF: { h: [216, 64], side: 1, hand: 'fist', hs: 1.5, L: 19 },
  waveF: { h: [224, 82], side: 1, hand: 'open', hs: 1.45 }
};

/* ---------- CLIENTA ---------- */
function armC(S, A, w) {
  const { E, H } = ik2(S, A.h, A.side || 1, A.L || 18);
  const cuff = lerp2(E, H, 0.82);
  let g = capsule([S, E, cuff], 9.8, CL.jac, w);
  g += capsule([lerp2(E, H, 0.72), cuff], 10.4, CL.jacS, w);
  if (A.item) g += A.item(H, w);
  if (A.hand !== 'none') g += hand11(A.hand || 'fist', H, w, Object.assign({ fill: SA.skin, hs: 1.2 }, A));
  return g;
}
function clienta(o) {
  const k = o.k || 1, w = v => f(v * k);
  let g = '';
  if (o.sit) {
    // sentada de frente: muslos acortados, rodillas y espinillas hasta el reposapiés
    g += `<rect x="176.6" y="141" width="12.4" height="17" rx="5" fill="${CL.jean}" ${stA(w)}/><rect x="191" y="141" width="12.4" height="17" rx="5" fill="${CL.jean}" ${stA(w)}/>`;
    g += `<rect x="177.4" y="155" width="10.6" height="33" rx="4" fill="${CL.jeanS}" ${stA(w)}/><rect x="192" y="155" width="10.6" height="33" rx="4" fill="${CL.jeanS}" ${stA(w)}/>`;
    g += `<path d="M175 185 h13.6 a3 3 0 0 1 3 3 v3.6 h-18.6 a2.6 2.6 0 0 1 2 -6.6z" fill="${CL.shoe}" ${stA(w)}/><path d="M191.4 185 h13.6 a2.6 2.6 0 0 1 2 6.6 h-18.6 v-3.6 a3 3 0 0 1 3 -3z" fill="${CL.shoe}" ${stA(w)}/>`;
  } else {
    const wl = o.walk === undefined ? 0 : Math.sin(o.walk), upL = 4.5 * Math.max(0, wl), upR = 4.5 * Math.max(0, -wl);
    const leg = (x, up, shoeD) => `<g transform="translate(0 ${f(-up)})"><rect x="${x}" y="144" width="11.5" height="58" rx="4" fill="${CL.jean}" ${stA(w)}/>` +
      `<path d="M${x + 3} 154 V196" stroke="${CL.jeanS}" stroke-width="${w(1.4)}" stroke-linecap="round"/><path d="${shoeD}" fill="${CL.shoe}" ${stA(w)}/></g>`;
    g += leg(177.5, upL, 'M174 201 h15 a3 3 0 0 1 3 3 v4 h-20 a3 3 0 0 1 2 -7z');
    g += leg(191, upR, 'M191 201 h15 a3 3 0 0 1 2 7 h-20 v-4 a3 3 0 0 1 3 -3z');
  }
  let b = '';
  const hr = o.head || 0, sway = o.sway || 0;
  // melena larga ondulada (detrás)
  if (!o.noBackHair) b += `<g transform="rotate(${f(hr)} 190 96)"><g transform="rotate(${f(sway)} 190 70)"><path d="M190 53 Q169 53 171 72 Q165.6 80 170 88 Q164.8 96 169.4 104 Q165 112 170.6 119.4 Q176 124.4 181.6 118.6 L183 96 L197 96 L198.4 118.6 Q204 124.4 209.4 119.4 Q215 112 210.6 104 Q215.2 96 210 88 Q214.4 80 209 72 Q211 53 190 53Z" fill="${o.wet ? CL.hairS : CL.hair}" ${stA(w)}/>` +
    `<path d="M172.6 92 Q170.6 98 173 103 M207.4 92 Q209.4 98 207 103 M173.4 110 Q172 115 175.4 118 M206.6 110 Q208 115 204.6 118" stroke="${CL.hairL}" stroke-width="${w(1.3)}" fill="none" stroke-linecap="round"/></g></g>`;
  // chaqueta verde abierta sobre top crema
  const torso = 'M174.6 99 Q190 94.4 205.4 99 Q211.6 103.6 211.4 120 Q212 137 206.4 150 H173.6 Q168 137 168.6 120 Q168.4 103.6 174.6 99Z';
  b += `<path d="${torso}" fill="${CL.jac}"/><path d="M174.6 99 Q179 97.4 181 97 L179 150 H173.6 Q168 137 168.6 120 Q168.4 103.6 174.6 99Z" fill="${CL.jacS}"/><path d="${torso}" fill="none" ${stA(w)}/>`;
  b += `<path d="M183.4 97.4 L196.6 97.4 L194.6 150 H185.4Z" fill="${CL.top}" ${stA(w, 2.4)}/>`;
  b += `<path d="M183.4 97.6 L180.4 108 L185.6 112 M196.6 97.6 L199.6 108 L194.4 112" fill="none" stroke="${INK}" stroke-width="${w(2)}" stroke-linejoin="round" stroke-linecap="round"/>`;
  b += `<rect x="185.4" y="87" width="9.2" height="11" rx="2" fill="${SA.skinS}" ${stA(w, 2.4)}/>`;
  b += `<path d="M184.6 97.4 Q190 101.6 195.4 97.4" fill="none" stroke="${INK}" stroke-width="${w(2)}" stroke-linecap="round"/>`;
  if (o.towel) b += `<path d="M175.4 99.4 Q190 108 204.6 99.4 L203 94 Q190 101 177 94Z" fill="#FFFFFF" ${stA(w, 2.4)}/><path d="M178 98.4 Q190 104.8 202 98.4" stroke="${C.purple}" stroke-width="${w(1.3)}" fill="none" stroke-linecap="round"/>`;
  // bolso cruzado
  if (o.bag !== false && !o.sit) {
    b += `<path d="M201.4 99.6 L176.6 137" stroke="${INK}" stroke-width="${w(3.6)}" stroke-linecap="round"/><path d="M201.4 99.6 L176.6 137" stroke="${CL.bagS}" stroke-width="${w(1.4)}" stroke-linecap="round"/>`;
    b += `<rect x="165.6" y="134" width="17" height="14" rx="3" fill="${CL.bag}" ${stA(w, 2.4)}/><path d="M165.6 138.4 Q174 141.6 182.6 138.4" fill="none" stroke="${INK}" stroke-width="${w(1.8)}"/><circle cx="174.1" cy="140.2" r="1.3" fill="${SA.gold}" ${stA(w, 1)}/>`;
  }
  if (o.under) b += o.under(w);
  if (o.armB) b += armC(SA_SB, o.armB, w);
  // cabeza
  let hd = `<path d="M175.4 74 Q175.6 91 190 94 Q204.4 91 204.6 74 Q204.6 58.4 190 58.4 Q175.4 58.4 175.4 74Z" fill="${SA.skin}" ${stA(w)}/>`;
  if (!o.capHair) {
    hd += `<path d="M174.4 82 Q171.4 56.6 190 55.4 Q208.6 56.6 205.6 82 Q203.6 69 197 64.4 Q193 63 190 60.6 Q187 63 183 64.4 Q176.4 69 174.4 82Z" fill="${o.wet ? CL.hairS : CL.hair}" ${stA(w)}/>`;
    hd += `<path d="M183.6 58.6 Q187.4 57.4 189.4 59.6 M196.4 58.6 Q200.6 60.4 202.4 65" stroke="${CL.hairL}" stroke-width="${w(1.3)}" fill="none" stroke-linecap="round"/>`;
  }
  hd += hoopL(175.6, 86.4, 1.8, w).replace(new RegExp(SA.gold, 'g'), '#FFFFFF') + hoopL(204.4, 86.4, 1.8, w).replace(new RegExp(SA.gold, 'g'), '#FFFFFF');
  hd += face16(o, w, CL.hairS);
  hd += `<path d="M187.6 89 Q190 90 192.4 89" stroke="${CL.lip}" stroke-width="${w(0.8)}" fill="none" opacity="0.5"/>`;
  if (o.foam) hd += o.foam(w);
  b += `<g transform="rotate(${f(hr)} 190 96)">${hd}</g>`;
  if (o.armF) b += armC(SA_SF, o.armF, w);
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  return g;
}
function placeClienta(px, py, sc, o) {
  o.k = o.kAbs || SW / (3 * sc);
  return `<g transform="translate(${f(px - 190 * sc)} ${f(py - 208 * sc)}) scale(${f(sc)})">${clienta(o)}</g>`;
}
// espuma de champú sobre la cabeza (local de la clienta); t anima las burbujas
function foamL(t, amt = 1) {
  return w => {
    if (amt <= 0.01) return '';
    const B = [[178, 60, 7], [186, 54.6, 8.4], [195, 54, 8.6], [203, 59.6, 7.4], [190.6, 49, 6.8], [181.4, 51, 5.4], [199.4, 49.4, 5.8], [174.6, 67, 5], [206, 67.6, 4.8]];
    let a = '';
    B.forEach(([x, y, r], i) => { const rr = r * amt * (1 + 0.05 * Math.sin(t * 7 + i)); a += `<circle cx="${x}" cy="${f(y + 3)}" r="${f(rr)}"/>`; });
    let g = `<g fill="${INK}" stroke="${INK}" stroke-width="${w(4.6)}">${a}</g><g fill="#FFFFFF">${a}</g>`;
    B.slice(0, 5).forEach(([x, y, r], i) => { g += `<path d="M${f(x - r * 0.45)} ${f(y + 1.6)} Q${f(x - r * 0.3)} ${f(y - r * 0.2)} ${f(x + r * 0.05)} ${f(y - r * 0.35)}" stroke="${C.glass}" stroke-width="${w(1.3)}" fill="none" stroke-linecap="round"/>`; });
    // burbujas sueltas que suben
    for (let i = 0; i < 5; i++) {
      const u = ((t * 0.55 + i * 0.21) % 1), x = 176 + i * 7 + 3 * Math.sin(t * 3 + i), y = 46 - u * 22, r = (1.4 + (i % 2)) * amt * (1 - u * 0.5);
      g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.1)}"/>`;
    }
    return g;
  };
}
// sillón de peluquería (local, frente), para dibujar con la clienta sentada (suelo 208) o vacío
function chairBackL(w) {
  return `<rect x="170" y="88" width="40" height="64" rx="12" fill="${C.dred}" ${stA(w)}/><rect x="174" y="92" width="32" height="56" rx="9" fill="${C.red}" ${stA(w, 1.6)}/>
    <path d="M178 98 Q178 94 182 94" stroke="#FFFFFF" stroke-width="${w(1.4)}" fill="none" stroke-linecap="round" opacity="0.6"/>`;
}
function chairSeatL(w) {
  return `<rect x="186.6" y="156" width="6.8" height="40" fill="${SA.steel}" ${stA(w, 2.2)}/>
    <ellipse cx="190" cy="203" rx="24" ry="5.4" fill="${SA.steel}" ${stA(w, 2.4)}/>
    <path d="M176 186 H204" stroke="${INK}" stroke-width="${w(4.4)}" stroke-linecap="round"/><path d="M176 186 H204" stroke="${SA.steel}" stroke-width="${w(1.8)}" stroke-linecap="round"/>
    <rect x="168" y="144" width="44" height="14" rx="6" fill="${C.red}" ${stA(w)}/>`;
}
function chairArmsL(w) {
  return `<rect x="162.6" y="128" width="11" height="8" rx="4" fill="${C.dred}" ${stA(w, 2.4)}/><rect x="206.4" y="128" width="11" height="8" rx="4" fill="${C.dred}" ${stA(w, 2.4)}/>
    <path d="M166 136 V146 M214 136 V146" stroke="${INK}" stroke-width="${w(3)}" stroke-linecap="round"/><path d="M166 136 V146 M214 136 V146" stroke="${SA.steel}" stroke-width="${w(1)}" stroke-linecap="round"/>`;
}
function emptyChair(x, floor, sc) {
  const k = SW / (3 * sc), w = v => f(v * k);
  return `<g transform="translate(${f(x - 190 * sc)} ${f(floor - 208 * sc)}) scale(${f(sc)})">${chairBackL(w)}${chairSeatL(w)}${chairArmsL(w)}</g>`;
}
// clienta sentada en el sillón (world): (x, floor) = base del sillón
function seatedClient(x, floor, sc, o) {
  return placeClienta(x, floor, sc, Object.assign({}, o, {
    sit: true, bag: false,
    under: w => chairArmsL(w),
    armB: { h: [168, 129], side: 1, hand: 'fist', hs: 1.15 }, armF: { h: [212, 129], side: -1, hand: 'fist', hs: 1.15 }
  })).replace(/^(<g [^>]*>)/, `$1${(() => { const k = SW / (3 * sc), w = v => f(v * k); return chairBackL(w) + chairSeatL(w); })()}`);
}
