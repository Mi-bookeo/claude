/* PEDRO DE FRENTE y MECÁNICO (vídeo 18) — personajes de frente, mirando a cámara, con cuello visible.
   Mismo esqueleto que Ana / Sara (v14.js, sara.js): sistema local con el suelo en y=208 y el centro en x=190,
   cabeza en (190,76), cuello de 185.4 a 194.6, hombros en 174/206,104; brazos de dos tramos (ik2 de v11.js) y
   manos de hand11 (fist | open | point | thumb | phone…).
   PEDRO: el de la serie (v05) de frente: alto (se coloca un 8 % más grande), pelo corto castaño oscuro con raya,
   gafas redondas negras, camiseta verde lisa de manga corta, pantalón oscuro, zapatillas blancas.
   MECÁNICO (genérico, sin nombre): mono azul con peto y bolsillo, gorra azul marino con visera, bigote castaño,
   botas negras.
   o: expr, blink, look [dx,dy], talk (0..1), drop (gota de sudor, sólo 'worried'/'panic'), bob, head (giro, grados),
      walk (fase: levanta un pie u otro), armF / armB = { h:[x,y] mano, side:±1 codo, hand, hs, hrot, dir, L, item(w,x,y) },
      armBFront (brazo de atrás por delante de la cabeza), front(w) (encima de todo). */
'use strict';

const PFR = { tall: 1.08, hair: '#3B2A24', hairL: '#5C4438', pants: '#2A2A2E', pantsS: '#1E1A1A', cheek: '#F29C9C' };
const PF_SF = [206, 104], PF_SB = [174, 104];

/* ---------- cara de Pedro (cabeza 175.4..204.6, ojos en 184.5 / 195.5, y≈78) ---------- */
function pedroFrontFace(o, w) {
  const e = o.expr || 'normal', lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const L = (d, sw = 1.6, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const dot = (cx, cy, r = 1.9) => `<circle cx="${f(cx + lx)}" cy="${f(cy + ly)}" r="${r}" fill="${INK}"/><circle cx="${f(cx + lx + 0.6)}" cy="${f(cy + ly - 0.6)}" r="0.55" fill="#FFFFFF"/>`;
  const big = (cx, cy, r = 3.3) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.2)}"/><circle cx="${f(cx + lx * 0.6)}" cy="${f(cy + ly * 0.6)}" r="${f(r * 0.52)}" fill="${INK}"/><circle cx="${f(cx + lx * 0.6 + 0.8)}" cy="${f(cy + ly * 0.6 - 0.8)}" r="0.7" fill="#FFFFFF"/>`;
  const shine = (cx, cy) => `<circle cx="${f(cx + lx)}" cy="${f(cy + ly)}" r="2.5" fill="${INK}"/><circle cx="${f(cx + lx + 0.9)}" cy="${f(cy + ly - 0.9)}" r="0.95" fill="#FFFFFF"/>`;
  let s = '';
  const ck = ['worried', 'panic', 'focus'].includes(e) ? 0.35 : 0.8;
  s += `<ellipse cx="180" cy="85.2" rx="3.4" ry="2.3" fill="${PFR.cheek}" opacity="${ck}"/><ellipse cx="200" cy="85.2" rx="3.4" ry="2.3" fill="${PFR.cheek}" opacity="${ck}"/>`;
  // cristales (detrás de los ojos)
  s += `<circle cx="184.5" cy="78" r="5.3" fill="#FFFFFF" fill-opacity="0.55"/><circle cx="195.5" cy="78" r="5.3" fill="#FFFFFF" fill-opacity="0.55"/>`;
  // ojos
  if (o.blink && !['relief', 'laugh'].includes(e)) s += L('M181.8 78.4 Q184.5 79.6 187.2 78.4 M192.8 78.4 Q195.5 79.6 198.2 78.4', 1.6);
  else if (e === 'wow' || e === 'surprise') s += big(184.5, 78, e === 'wow' ? 3.9 : 3.4) + big(195.5, 78, e === 'wow' ? 3.9 : 3.4);
  else if (e === 'panic') s += `<circle cx="${f(184.5 + (o.jit || 0))}" cy="78" r="3.4" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.2)}"/><circle cx="${f(195.5 + (o.jit || 0))}" cy="78" r="3.4" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.2)}"/><circle cx="${f(184.5 + (o.jit || 0))}" cy="78.2" r="0.95" fill="${INK}"/><circle cx="${f(195.5 + (o.jit || 0))}" cy="78.2" r="0.95" fill="${INK}"/>`;
  else if (e === 'relief' || e === 'laugh') s += L('M181.8 79 Q184.5 75.6 187.2 79 M192.8 79 Q195.5 75.6 198.2 79', 1.8);
  else if (e === 'grin' || e === 'sparkle') s += shine(184.5, 78) + shine(195.5, 78);
  else if (e === 'focus') s += dot(184.5, 78.6, 1.7) + dot(195.5, 78.6, 1.7) + `<path d="M180.6 77.2 Q184.5 74.6 188.4 77.2 Z M191.6 77.2 Q195.5 74.6 199.4 77.2 Z" fill="${C.skin}"/>` + L('M180.8 77.2 H188.2 M191.8 77.2 H199.2', 1.3);
  else s += dot(184.5, 78) + dot(195.5, 78);
  // gafas redondas negras (montura por encima), puente y patillas hasta las orejas
  s += `<circle cx="184.5" cy="78" r="5.3" fill="none" stroke="${INK}" stroke-width="${w(1.9)}"/><circle cx="195.5" cy="78" r="5.3" fill="none" stroke="${INK}" stroke-width="${w(1.9)}"/>`;
  s += L('M189.8 77.4 Q190 76.4 190.2 77.4', 1.7) + L('M179.2 77.4 L176 76.6 M200.8 77.4 L204 76.6', 1.6);
  s += L('M181.8 75.6 Q182.6 74.6 183.8 74.4 M192.8 75.6 Q193.6 74.6 194.8 74.4', 0.9, '#FFFFFF');
  // cejas (gruesas, color pelo)
  const brow = d => L(d, 2, PFR.hair);
  if (e === 'worried') s += brow('M180.4 71.4 Q183.8 70.2 187.4 67.4') + brow('M192.6 70 Q196 70.4 199.6 72.2'); // ceja torcida
  else if (e === 'panic' || e === 'surprise' || e === 'wow') s += brow('M180.4 69.4 Q184 66.2 187.6 68.4 M192.4 68.4 Q196 66.2 199.6 69.4');
  else if (e === 'focus') s += brow('M180.6 70.4 Q184 70.6 187.6 72 M192.4 72 Q196 70.6 199.4 70.4');
  else if (e === 'relief') s += brow('M180.6 69.8 Q184 68 187.6 69.6 M192.4 69.6 Q196 68 199.4 69.8');
  else s += brow('M180.6 71.2 Q184 69.6 187.6 70.6 M192.4 70.6 Q196 69.6 199.4 71.2');
  // nariz
  s += L('M189.2 81.6 Q190.4 85 192 83.4', 1.4);
  // boca
  const m = clamp(o.talk || 0);
  const open = (h, wd = 5.4) => {
    let g = `<path d="M${f(190 - wd)} 88.4 Q190 ${f(88.4 + h * 1.3)} ${f(190 + wd)} 88.4Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
    if (h > 4.4) g += `<path d="M${f(190 - wd * 0.6)} ${f(88.4 + h * 0.6)} Q190 ${f(88.4 + h * 0.98)} ${f(190 + wd * 0.6)} ${f(88.4 + h * 0.6)}Z" fill="${C.pink}"/>`;
    return g + `<path d="M${f(190 - wd + 0.8)} 88.8 H${f(190 + wd - 0.8)}" stroke="#FFFFFF" stroke-width="${w(1.3)}" stroke-linecap="round"/>`;
  };
  if (m > 0.05) s += open(lerp(3, 6.6, m));
  else if (e === 'worried') s += L('M185.4 90.6 Q187.6 88.8 189.8 90.4 Q192 92 194.4 90.2', 1.8);
  else if (e === 'panic' || e === 'surprise') s += `<ellipse cx="190" cy="${e === 'panic' ? 91 : 90.4}" rx="${e === 'panic' ? 3.2 : 2.6}" ry="${e === 'panic' ? 4 : 3.2}" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
  else if (e === 'focus') s += L('M187 90 Q190 90.6 193 89.6', 1.7);
  else if (e === 'wow' || e === 'relief' || e === 'laugh') s += open(7.2, 5.8);
  else if (e === 'grin' || e === 'sparkle') s += open(5.6, 5.4);
  else s += L('M185.6 89 Q190 92.8 194.4 89', 1.9);
  // gota de sudor (sien derecha) y líneas de susto
  if (e === 'worried' || e === 'panic') {
    const dy = o.drop || 0;
    s += `<path d="M205.6 ${f(63 + dy)} Q210.6 ${f(70.4 + dy)} 205.6 ${f(73.2 + dy)} Q200.6 ${f(70.4 + dy)} 205.6 ${f(63 + dy)}Z" fill="${C.glass}" stroke="${INK}" stroke-width="${w(1.4)}" stroke-linejoin="round"/><circle cx="204.4" cy="${f(70 + dy)}" r="0.85" fill="#FFFFFF"/>`;
  }
  if (e === 'panic') s += L('M183 61.6 V65 M187 60.8 V64.4 M191 60.8 V64.4', 1.1, C.navy);
  return s;
}

/* ---------- brazo de Pedro: piel + manga corta verde; mano de hand11 ---------- */
function pfArm(S, A, w, back) {
  const { E, H } = ik2(S, A.h, A.side || 1, A.L || 18);
  const sk = back ? C.skinS : C.skin;
  let g = capsule([S, E, H], 7.2, sk, w);
  g += capsule([S, lerp2(S, E, 0.52)], 10.6, back ? P5.greenS : P5.green, w);
  if (A.item) g += A.item(w, H[0], H[1]);
  if (A.hand !== 'none') g += hand11(A.hand || 'fist', H, w, Object.assign({ fill: sk, hs: 1.25 }, A));
  return g;
}
const PFP = {
  restF: { h: [211, 141], side: -1, hand: 'fist', hs: 1.2 },
  restB: { h: [169, 141], side: 1, hand: 'fist', hs: 1.2 }
};
function pedroFront(o) {
  const k = o.k || 1, w = v => f(v * k);
  let g = '';
  // piernas: pantalón oscuro y zapatillas blancas
  const wl = o.walk === undefined ? 0 : Math.sin(o.walk), upL = 4.5 * Math.max(0, wl), upR = 4.5 * Math.max(0, -wl);
  const leg = (x, up, shoeD, sole) => `<g transform="translate(0 ${f(-up)})"><rect x="${x}" y="144" width="11.5" height="58" rx="4" fill="${PFR.pants}" ${stA(w)}/>` +
    `<path d="M${x + 3} 160 V196" stroke="${PFR.pantsS}" stroke-width="${w(1.3)}" stroke-linecap="round"/>` +
    `<path d="${shoeD}" fill="#FFFFFF" ${stA(w)}/><path d="${sole}" stroke="${INK}" stroke-width="${w(1.1)}" stroke-linecap="round"/></g>`;
  g += leg(177.5, upL, 'M174 200.6 h15 a3 3 0 0 1 3 3 v4.4 h-20 a3 3 0 0 1 2 -7.4z', 'M173 205.2 H191.6');
  g += leg(191, upR, 'M191 200.6 h15 a3 3 0 0 1 2 7.4 h-20 v-4.4 a3 3 0 0 1 3 -3z', 'M188.6 205.2 H207');
  let b = '';
  const hr = o.head || 0;
  // camiseta verde lisa (sombra dura a la izquierda) y cuello redondo
  const torso = 'M174.6 99 Q190 94.4 205.4 99 Q211.6 103.6 211.4 120 Q212 137 206.4 150 H173.6 Q168 137 168.6 120 Q168.4 103.6 174.6 99Z';
  b += `<path d="${torso}" fill="${P5.green}"/><path d="M174.6 99 Q179 97.4 181 97 L179 150 H173.6 Q168 137 168.6 120 Q168.4 103.6 174.6 99Z" fill="${P5.greenS}"/><path d="${torso}" fill="none" ${stA(w)}/>`;
  b += `<rect x="185.4" y="87" width="9.2" height="11" rx="2" fill="${C.skinS}" ${stA(w, 2.4)}/>`;
  b += `<path d="M182.4 96.6 Q190 103.4 197.6 96.6" fill="none" stroke="${INK}" stroke-width="${w(4.2)}" stroke-linecap="round"/><path d="M182.4 96.6 Q190 103.4 197.6 96.6" fill="none" stroke="${P5.greenS}" stroke-width="${w(1.6)}" stroke-linecap="round"/>`;
  b += `<path d="M173.6 144 H206.4" stroke="${P5.greenS}" stroke-width="${w(1.2)}" opacity="0.8"/>`;
  if (o.under) b += o.under(w);
  if (o.armB && !o.armBFront) b += pfArm(PF_SB, o.armB, w, true);
  // cabeza: orejas, cara, pelo corto con raya
  let hd = `<ellipse cx="175.4" cy="79.4" rx="3.2" ry="3.9" fill="${C.skinS}" ${stA(w, 2.4)}/><ellipse cx="204.6" cy="79.4" rx="3.2" ry="3.9" fill="${C.skinS}" ${stA(w, 2.4)}/>`;
  hd += `<path d="M175.4 74 Q175.6 91.6 190 94.4 Q204.4 91.6 204.6 74 Q204.6 58.4 190 58.4 Q175.4 58.4 175.4 74Z" fill="${C.skin}" ${stA(w)}/>`;
  hd += `<path d="M174.6 76.4 Q172.4 54.4 190 53.6 Q208.2 54.2 205.4 76.4 Q204 67.4 199.6 64.2 Q193.4 66.6 186.2 64.8 Q183.4 64 181.6 62.8 Q176.8 67 174.6 76.4Z" fill="${PFR.hair}" ${stA(w)}/>`;
  hd += `<path d="M181.6 62.8 Q186 58.6 192.6 58.4" stroke="${PFR.hairL}" stroke-width="${w(1.3)}" fill="none" stroke-linecap="round"/><path d="M196.4 57.2 Q201.6 58.4 203.2 62.6" stroke="${PFR.hairL}" stroke-width="${w(1.2)}" fill="none" stroke-linecap="round"/>`;
  hd += pedroFrontFace(o, w);
  b += `<g transform="rotate(${f(hr)} 190 96)">${hd}</g>`;
  if (o.armB && o.armBFront) b += pfArm(PF_SB, o.armB, w, true);
  if (o.armF) b += pfArm(PF_SF, o.armF, w, false);
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  if (o.lean) g = `<g transform="rotate(${f(o.lean)} 190 208)">${g}</g>`;
  return g;
}
// (px,py) = punto del suelo bajo Pedro; sc = escala de la serie (Pedro se dibuja un 8 % más alto)
function placePF(px, py, sc, o) {
  const s = sc * PFR.tall;
  o.k = SW / (3 * s);
  o.armF = o.armF || PFP.restF; o.armB = o.armB || PFP.restB;
  return `<g transform="translate(${f(px - 190 * s)} ${f(py - 208 * s)}) scale(${f(s)})">${pedroFront(o)}</g>`;
}
// punto del mundo -> coordenadas locales de Pedro (para apuntar las manos) y al revés
const pfLoc = (px, py, sc, X, Y) => { const s = sc * PFR.tall; return [190 + (X - px) / s, 208 + (Y - py) / s]; };
const pfPt = (px, py, sc, lx, ly) => { const s = sc * PFR.tall; return [px + (lx - 190) * s, py + (ly - 208) * s]; };
// y del suelo para que la cintura (local 144) quede en waistY
const pfFootAtWaist = (waistY, sc) => waistY + (208 - 144) * sc * PFR.tall;

/* ===================== MECÁNICO ===================== */
const MFR = { mono: '#2F6DB5', monoS: '#22528A', monoL: '#5C8FD0', cap: '#2D4A6B', capS: '#1F3550', mous: '#5A3A2A', boot: '#1E1A1A' };
function mfArm(S, A, w, back) {
  const { E, H } = ik2(S, A.h, A.side || 1, A.L || 18);
  const cuff = lerp2(E, H, 0.84);
  let g = capsule([S, E, cuff], 9.8, back ? MFR.monoS : MFR.mono, w);
  if (A.item) g += A.item(w, H[0], H[1]);
  if (A.hand !== 'none') g += hand11(A.hand || 'fist', H, w, Object.assign({ fill: back ? C.skinS : C.skin, hs: 1.25 }, A));
  return g;
}
function mechFront(o) {
  const k = o.k || 1, w = v => f(v * k);
  let g = '';
  const leg = (x, shoeD) => `<rect x="${x}" y="144" width="12.4" height="58" rx="4" fill="${MFR.mono}" ${stA(w)}/>` +
    `<path d="M${x + 3} 152 V196" stroke="${MFR.monoS}" stroke-width="${w(1.4)}" stroke-linecap="round"/><path d="${shoeD}" fill="${MFR.boot}" ${stA(w)}/>`;
  g += leg(177, 'M173.4 199.6 h15.6 a3 3 0 0 1 3 3 v5.4 h-20.6 a3 3 0 0 1 2 -8.4z');
  g += leg(190.6, 'M191 199.6 h15.6 a3 3 0 0 1 2 8.4 h-20.6 v-5.4 a3 3 0 0 1 3 -3z');
  let b = '';
  const hr = o.head || 0;
  // mono azul: cuerpo, peto con bolsillo, tirantes, cinturón y parche blanco (sin nombre)
  const torso = 'M174.2 99 Q190 94.4 205.8 99 Q212.4 103.6 212.2 120 Q212.8 137 207 150 H173 Q167.2 137 167.8 120 Q167.6 103.6 174.2 99Z';
  b += `<path d="${torso}" fill="${MFR.mono}"/><path d="M174.2 99 Q178.6 97.4 180.6 97 L178.6 150 H173 Q167.2 137 167.8 120 Q167.6 103.6 174.2 99Z" fill="${MFR.monoS}"/><path d="${torso}" fill="none" ${stA(w)}/>`;
  b += `<rect x="185.4" y="87" width="9.2" height="11" rx="2" fill="${C.skinS}" ${stA(w, 2.4)}/>`;
  b += `<path d="M183 96.8 L190 104 L197 96.8" fill="#FFFFFF" ${stA(w, 2)}/>`;
  b += `<path d="M180.8 100 L182 116 M199.2 100 L198 116" stroke="${INK}" stroke-width="${w(4.2)}" stroke-linecap="round"/><path d="M180.8 100 L182 116 M199.2 100 L198 116" stroke="${MFR.monoL}" stroke-width="${w(1.6)}" stroke-linecap="round"/>`;
  b += `<rect x="181" y="113" width="18" height="16" rx="2.4" fill="${MFR.monoL}" ${stA(w, 2.2)}/><rect x="184.4" y="116.6" width="11.2" height="4" rx="1.4" fill="#FFFFFF" ${stA(w, 1)}/>`;
  b += `<path d="M168.6 131 H211.4" stroke="${INK}" stroke-width="${w(4)}"/><path d="M168.6 131 H211.4" stroke="${MFR.capS}" stroke-width="${w(1.8)}"/><rect x="187" y="128.6" width="6" height="4.8" rx="1" fill="${C.yel}" ${stA(w, 1.2)}/>`;
  b += `<path d="M171 138 Q172 146 178 147 M209 138 Q208 146 202 147" stroke="${MFR.monoS}" stroke-width="${w(1.4)}" fill="none"/>`;
  if (o.armB && !o.armBFront) b += mfArm(PF_SB, o.armB, w, true);
  // cabeza
  let hd = `<ellipse cx="175.4" cy="80" rx="3.2" ry="3.9" fill="${C.skinS}" ${stA(w, 2.4)}/><ellipse cx="204.6" cy="80" rx="3.2" ry="3.9" fill="${C.skinS}" ${stA(w, 2.4)}/>`;
  hd += `<path d="M175.4 74 Q175.6 91.6 190 94.4 Q204.4 91.6 204.6 74 Q204.6 58.4 190 58.4 Q175.4 58.4 175.4 74Z" fill="${C.skin}" ${stA(w)}/>`;
  hd += `<path d="M175.6 76 Q174.6 80 176.2 84 M204.4 76 Q205.4 80 203.8 84" stroke="#8A8580" stroke-width="${w(2.4)}" fill="none" stroke-linecap="round"/>`;
  // gorra: copa y visera de frente
  hd += `<path d="M174.6 72.4 Q173.4 54 190 53.4 Q206.6 54 205.4 72.4Z" fill="${MFR.cap}" ${stA(w)}/>`;
  hd += `<path d="M178.4 70 Q178 58.8 186 56" stroke="#FFFFFF" stroke-width="${w(1.2)}" fill="none" stroke-linecap="round" opacity="0.45"/>`;
  hd += `<circle cx="190" cy="62.6" r="3.3" fill="${C.red}" ${stA(w, 1.4)}/>`;
  hd += `<path d="M172.4 72.6 Q190 66.6 207.6 72.6 Q208.6 76.4 204 76.6 Q190 73.6 176 76.6 Q171.4 76.4 172.4 72.6Z" fill="${MFR.capS}" ${stA(w, 2.2)}/>`;
  // cara
  const L = (d, sw = 1.6, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const e = o.expr || 'smile';
  if (o.blink) hd += L('M182 80.6 Q184.5 81.8 187 80.6 M193 80.6 Q195.5 81.8 198 80.6', 1.6);
  else hd += `<circle cx="184.5" cy="80.4" r="1.9" fill="${INK}"/><circle cx="195.5" cy="80.4" r="1.9" fill="${INK}"/><circle cx="185.1" cy="79.8" r="0.55" fill="#FFFFFF"/><circle cx="196.1" cy="79.8" r="0.55" fill="#FFFFFF"/>`;
  hd += e === 'focus' ? L('M181 77.4 L187.6 78.6 M192.4 78.6 L199 77.4', 1.8, MFR.mous) : L('M181 77.8 Q184 76.6 187.6 77.6 M192.4 77.6 Q196 76.6 199 77.8', 1.7, MFR.mous);
  hd += `<ellipse cx="180" cy="86" rx="3.3" ry="2.2" fill="${PFR.cheek}" opacity="0.6"/><ellipse cx="200" cy="86" rx="3.3" ry="2.2" fill="${PFR.cheek}" opacity="0.6"/>`;
  hd += L('M189.2 82.6 Q190.4 85.8 192 84.4', 1.4);
  const m = clamp(o.talk || 0);
  if (m > 0.05 || e === 'talk') hd += `<path d="M186 89.8 Q190 ${f(90.6 + lerp(3, 6, m) * 1.2)} 194 89.8Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}" stroke-linejoin="round"/>`;
  else if (e === 'focus') hd += L('M187.4 90.8 H192.6', 1.7);
  else hd += L('M185.8 90 Q190 93.6 194.2 90', 1.8);
  hd += `<path d="M183.4 88.4 Q186.6 85.6 190 87.4 Q193.4 85.6 196.6 88.4 Q194 90.4 190 89 Q186 90.4 183.4 88.4Z" fill="${MFR.mous}" ${stA(w, 1.4)}/>`;
  b += `<g transform="rotate(${f(hr)} 190 96)">${hd}</g>`;
  if (o.armB && o.armBFront) b += mfArm(PF_SB, o.armB, w, true);
  if (o.armF) b += mfArm(PF_SF, o.armF, w, false);
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  return g;
}
function placeMF(px, py, sc, o) {
  o.k = SW / (3 * sc);
  o.armF = o.armF || PFP.restF; o.armB = o.armB || PFP.restB;
  return `<g transform="translate(${f(px - 190 * sc)} ${f(py - 208 * sc)}) scale(${f(sc)})">${mechFront(o)}</g>`;
}
const mfLoc = (px, py, sc, X, Y) => [190 + (X - px) / sc, 208 + (Y - py) / sc];
const mfPt = (px, py, sc, lx, ly) => [px + (lx - 190) * sc, py + (ly - 208) * sc];
