/* MARÍA — personaje fijo de la serie (referencia: assets/personajes/maria_referencia.png).
   Chica de frente, melena rizada castaña con diadema negra, ojos grandes con brillo, vestido azul con mangas
   abullonadas, cinturón azul marino y falda con pliegues, zapatos azul marino. Estilo de la serie: contorno negro
   de grosor constante, colores planos, sombra dura en el lado izquierdo.
   Sistema local: suelo en y=204, centro x=190, cabeza en (190, 91.5), altura ≈ 146 (como Marta).
   mariaGirl(o) / placeMaria(px, py, sc, o). o: expr ('happy'|'sparkle'|'joy'|'wink'|'surprise'), talk (0..1 boca),
   blink, head (giro de cabeza, grados), bob (respiración), curl (vaivén de rizos, grados),
   armF / armB = { h:[x,y] mano, side:±1 codo, hand:'fist'|'open'|'count'|'point'|'thumb'|'heart'|'phone', … }
   (armF = brazo a la derecha de la imagen; las manos se dibujan con hand11 de v11.js si existe, si no, puño). */
'use strict';

const MG = {
  hair: '#6B3E22', hairL: '#9A5B32', brow: '#5A3A2A', dress: '#3F7CC4', dressS: '#2B5A99', dressD: '#2A5C9E',
  belt: '#22408A', shoe: '#22394F', band: '#1E1A1A', skin: '#F6C9A0', skinS: '#E9B88F', nose: '#D9A27A',
  shF: [204.5, 121], shB: [175.5, 121], head: [190, 91.5]
};
const MG_CURLS = [[190, 66, 9.2], [177.2, 70.4, 8.4], [202.8, 70.4, 8.4], [171.3, 84.2, 7.9], [208.7, 84.2, 7.9],
  [170.3, 94, 6.9], [209.7, 94, 6.9], [171.3, 103.9, 6.9], [208.7, 103.9, 6.9], [174.7, 112.8, 6.4], [205.3, 112.8, 6.4]];
const MG_MARKS = [[177, 79], [184, 75.5], [196, 75.5], [203, 79], [170.5, 96], [209.5, 96], [171, 106.5], [209, 106.5], [175, 114], [205, 114]];

function mgFace(o, w) {
  const e = o.expr || 'happy', m = clamp(o.talk || 0);
  const L = (d, sw = 1.4, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const E = [183.6, 196.4], EY = 90.3, MX = 190, MY = 100.4;
  let s = '';
  // mejillas
  s += `<ellipse cx="181.6" cy="97.6" rx="3" ry="1.8" fill="${C.pink}" opacity="0.7"/><ellipse cx="198.4" cy="97.6" rx="3" ry="1.8" fill="${C.pink}" opacity="0.7"/>`;
  // cejas
  if (e === 'surprise' || e === 'sparkle') s += L('M180.6 83.4 Q183.4 81.6 186.4 83 M193.6 83 Q196.6 81.6 199.4 83.4', 1.4, MG.brow);
  else if (e === 'wink') s += L('M180.6 85 Q183.4 84.2 186.4 84.8 M193.6 83 Q196.6 81.6 199.4 83.4', 1.4, MG.brow);
  else s += L('M180.6 84.6 Q183.4 83 186.4 84.2 M193.6 84.2 Q196.6 83 199.4 84.6', 1.4, MG.brow);
  // ojos
  const eye = (x, big) => `<ellipse cx="${x}" cy="${EY}" rx="${big ? 2.9 : 2.6}" ry="${big ? 3.4 : 3.1}" fill="${INK}"/>` +
    `<circle cx="${f(x + 0.9)}" cy="${f(EY - 1.1)}" r="${big ? 1.25 : 1.05}" fill="#FFFFFF"/><circle cx="${f(x - 0.8)}" cy="${f(EY + 1.3)}" r="0.5" fill="#FFFFFF"/>`;
  const lash = x => L(x < 190 ? `M${f(x - 2.3)} ${f(EY - 2.6)} L${f(x - 3.6)} ${f(EY - 3.6)}` : `M${f(x + 2.3)} ${f(EY - 2.6)} L${f(x + 3.6)} ${f(EY - 3.6)}`, 1.2);
  const arc = x => L(`M${f(x - 2.7)} ${f(EY + 0.8)} Q${x} ${f(EY - 2.2)} ${f(x + 2.7)} ${f(EY + 0.8)}`, 1.6);
  if (o.blink && e !== 'wink' && e !== 'joy') s += L(`M${E[0] - 2.6} ${EY + 0.4} Q${E[0]} ${EY + 1.8} ${E[0] + 2.6} ${EY + 0.4} M${E[1] - 2.6} ${EY + 0.4} Q${E[1]} ${EY + 1.8} ${E[1] + 2.6} ${EY + 0.4}`, 1.4);
  else if (e === 'joy') s += arc(E[0]) + arc(E[1]);
  else if (e === 'wink') s += arc(E[0]) + eye(E[1]) + lash(E[1]);
  else if (e === 'surprise') E.forEach(x => { s += `<ellipse cx="${x}" cy="${EY}" rx="3" ry="3.4" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.3)}"/><circle cx="${x}" cy="${f(EY + 0.3)}" r="1.5" fill="${INK}"/>`; });
  else E.forEach(x => { s += eye(x, e === 'sparkle') + lash(x); });
  if (e === 'sparkle') s += `<path d="M${f(E[1] + 4.6)} ${f(EY - 4.6)} l0.7 -1.6 0.7 1.6 1.6 0.7 -1.6 0.7 -0.7 1.6 -0.7 -1.6 -1.6 -0.7z" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(0.6)}"/>`;
  // nariz
  s += L('M190.4 93.2 Q188.9 95 190.6 96.1', 1, MG.nose);
  // boca
  const grin = e === 'sparkle' || e === 'joy' || e === 'wink';
  if (m > 0.05) {
    const hw = grin ? 4.4 : 3.8, op = (grin ? 1.8 : 0.9) + 5.2 * m;
    s += `<path d="M${f(MX - hw)} ${MY} Q${MX} ${f(MY + 0.8)} ${f(MX + hw)} ${MY} Q${MX} ${f(MY + op)} ${f(MX - hw)} ${MY}Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.4)}" stroke-linejoin="round"/>`;
    s += `<path d="M${f(MX - hw * 0.7)} ${f(MY + 0.35)} Q${MX} ${f(MY + 1.1)} ${f(MX + hw * 0.7)} ${f(MY + 0.35)}" stroke="#FFFFFF" stroke-width="${w(1)}" fill="none" stroke-linecap="round"/>`;
    if (m > 0.4) s += `<ellipse cx="${MX}" cy="${f(MY + op * 0.64)}" rx="${f(hw * 0.4)}" ry="${f(op * 0.16)}" fill="${C.pink}"/>`;
  } else if (e === 'surprise') s += `<ellipse cx="${MX}" cy="${f(MY + 1.2)}" rx="1.8" ry="2.4" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.3)}"/>`;
  else {
    const hw = grin ? 4.6 : 4.2, dp = grin ? 5.4 : 3.6;
    s += `<path d="M${f(MX - hw)} ${f(MY - 0.3)} Q${MX} ${f(MY + dp)} ${f(MX + hw)} ${f(MY - 0.3)} Q${MX} ${f(MY + 0.9)} ${f(MX - hw)} ${f(MY - 0.3)}Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.3)}" stroke-linejoin="round"/>`;
    s += `<path d="M${f(MX - hw * 0.72)} ${f(MY + 0.25)} Q${MX} ${f(MY + 1.5)} ${f(MX + hw * 0.72)} ${f(MY + 0.25)}" stroke="#FFFFFF" stroke-width="${w(0.9)}" fill="none" stroke-linecap="round"/>`;
  }
  return s;
}
// brazo con codo (dos segmentos) y mano
function mgArm(S, A, w, back) {
  const L_ = 17.3;
  let H = A.h || [S[0] + (back ? -5.5 : 5.5), 154.5];
  let dx = H[0] - S[0], dy = H[1] - S[1], d = Math.hypot(dx, dy) || 0.01;
  const max = 2 * L_ - 0.01;
  if (d > max) { H = [S[0] + dx / d * max, S[1] + dy / d * max]; dx = H[0] - S[0]; dy = H[1] - S[1]; d = max; }
  const hg = Math.sqrt(Math.max(0, L_ * L_ - d * d / 4)), sd = A.side || (back ? 1 : -1);
  const E = [(S[0] + H[0]) / 2 - dy / d * hg * sd, (S[1] + H[1]) / 2 + dx / d * hg * sd];
  const pd = `M${f(S[0])} ${f(S[1])} L${f(E[0])} ${f(E[1])} L${f(H[0])} ${f(H[1])}`;
  const fill = back ? MG.skinS : MG.skin;
  let s = `<path d="${pd}" fill="none" stroke="${INK}" stroke-width="${f(5.8 + +w(3))}" stroke-linecap="round" stroke-linejoin="round"/><path d="${pd}" fill="none" stroke="${fill}" stroke-width="${f(5.8 - +w(3))}" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += typeof hand11 === 'function' ? hand11(A.hand || 'fist', H, w, Object.assign({ fill: MG.skin, hs: 1.2 }, A)) : `<circle cx="${f(H[0])}" cy="${f(H[1])}" r="3.6" fill="${MG.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
  return s;
}
function mariaGirl(o) {
  const k = o.k || 1, w = v => f(v * k), st = (v = 3) => `stroke="${INK}" stroke-width="${w(v)}" stroke-linejoin="round"`;
  const F = o.armF || {}, B = o.armB || {};
  let g = '';
  // piernas y zapatos
  g += `<rect x="181.3" y="178" width="6" height="22.5" rx="2.4" fill="${MG.skinS}" ${st()}/><rect x="192.7" y="178" width="6" height="22.5" rx="2.4" fill="${MG.skin}" ${st()}/>`;
  g += `<path d="M179 204 V201.6 Q179 199.3 181.4 199.3 H186.8 Q189 199.3 189 201.6 V204Z" fill="${MG.shoe}" ${st(2.6)}/><path d="M191.2 204 V201.6 Q191.2 199.3 193.4 199.3 H198.8 Q201 199.3 201 201.6 V204Z" fill="${MG.shoe}" ${st(2.6)}/>`;
  let b = '';
  // rizos traseros (con vaivén)
  let ca = '';
  MG_CURLS.forEach(([x, y, r], i) => { if (y > 80) ca += `<circle cx="${x}" cy="${y}" r="${r}"/>`; });
  const sway = o.curl || 0;
  b += `<g transform="rotate(${f(sway)} 190 80)"><g fill="${INK}" stroke="${INK}" stroke-width="${w(6)}">${ca}</g><g fill="${MG.hair}">${ca}</g></g>`;
  // cuello
  b += `<rect x="186.3" y="103" width="7.4" height="12" rx="2" fill="${MG.skinS}" ${st()}/>`;
  // falda
  const skirt = 'M175.5 142 Q190 144 204.5 142 L215.9 179.6 Q190 184.2 164.1 179.6Z';
  b += `<path d="${skirt}" fill="${MG.dress}"/><path d="M175.5 142 L181 143 L177.5 182.6 Q170 181.6 164.1 179.6Z" fill="${MG.dressS}"/>`;
  b += `<path d="M183.6 143.6 L179 181.4 M190 144.1 V182.6 M196.4 143.6 L201 181.4" stroke="${MG.dressD}" stroke-width="${w(1.3)}" stroke-linecap="round"/>`;
  b += `<path d="${skirt}" fill="none" ${st()}/>`;
  // cuerpo del vestido
  const bod = 'M180.4 113 Q190 119 199.6 113 L205 116 Q205.6 128 204.7 139.5 H175.3 Q174.4 128 175 116Z';
  b += `<path d="${bod}" fill="${MG.dress}"/><path d="M180.4 113 L184 115.4 L182.4 139.5 H175.3 Q174.4 128 175 116Z" fill="${MG.dressS}"/>`;
  b += `<path d="M181.3 121 L180.6 135" stroke="#FFFFFF" stroke-width="${w(1.3)}" stroke-linecap="round" opacity="0.45"/>`;
  b += `<path d="${bod}" fill="none" ${st()}/>`;
  b += `<path d="M180.4 113 Q190 119.6 199.6 113" fill="none" stroke="${MG.belt}" stroke-width="${w(1.6)}" stroke-linecap="round"/>`;
  // cinturón
  b += `<path d="M175.2 138.3 Q190 140.4 204.8 138.3 L204.6 142.4 Q190 144.5 175.4 142.4Z" fill="${MG.belt}" ${st(2.4)}/>`;
  // brazos (después del cuerpo: pueden cruzar por delante, p. ej. mano en el corazón) y mangas abullonadas encima
  b += mgArm(MG.shB, B, w, true) + mgArm(MG.shF, F, w, false);
  b += `<circle cx="176.6" cy="117.4" r="5.8" fill="${MG.dressS}" ${st()}/><circle cx="203.4" cy="117.4" r="5.8" fill="${MG.dress}" ${st()}/>`;
  b += `<path d="M200.8 114.6 Q202.6 113.2 204.6 113.6" stroke="#FFFFFF" stroke-width="${w(1)}" fill="none" stroke-linecap="round" opacity="0.5"/>`;
  if (o.front0) b += o.front0(w);
  // cabeza
  let hd = '';
  let cb = '';
  MG_CURLS.forEach(([x, y, r]) => { if (y <= 80) cb += `<circle cx="${x}" cy="${y}" r="${r}"/>`; });
  hd += `<g fill="${INK}" stroke="${INK}" stroke-width="${w(6)}">${cb}</g><g fill="${MG.hair}">${cb}</g>`;
  hd += `<circle cx="174.6" cy="91.5" r="3.4" fill="${MG.skinS}" ${st(2.4)}/><circle cx="205.4" cy="91.5" r="3.4" fill="${MG.skinS}" ${st(2.4)}/>`;
  hd += `<ellipse cx="190" cy="91.6" rx="16" ry="16.4" fill="${MG.skin}" ${st()}/>`;
  // flequillo rizado
  hd += `<path d="M173.6 88 Q172 70 190 68.6 Q208 70 206.4 88 Q205 81.6 201.6 81.4 Q200 78.2 196 79.4 Q193.4 76.8 190 78.6 Q186.6 76.8 184 79.4 Q180 78.2 178.4 81.4 Q175 81.6 173.6 88Z" fill="${MG.hair}" ${st()}/>`;
  MG_MARKS.forEach(([x, y]) => { hd += `<path d="M${f(x - 1.6)} ${f(y + 0.8)} Q${x} ${f(y - 0.8)} ${f(x + 1.6)} ${f(y + 0.8)}" stroke="${MG.hairL}" stroke-width="${w(1.3)}" fill="none" stroke-linecap="round"/>`; });
  // diadema
  const band = 'M171.4 79.6 Q190 58.4 208.6 79.6';
  hd += `<path d="${band}" fill="none" stroke="${INK}" stroke-width="${f(3.2 + +w(2.4))}" stroke-linecap="round"/><path d="${band}" fill="none" stroke="#2E2A2A" stroke-width="${f(3.2 - +w(2.4) * 0.3)}" stroke-linecap="round"/>`;
  hd += `<path d="M178 70.6 Q190 64 202 70.6" fill="none" stroke="#FFFFFF" stroke-width="${w(0.9)}" stroke-linecap="round" opacity="0.4"/>`;
  hd += mgFace(o, w);
  b += `<g transform="rotate(${f(o.head || 0)} 190 106)">${hd}</g>`;
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  return g;
}
function placeMaria(px, py, sc, o) {
  o.k = SW / (3 * sc);
  return `<g transform="translate(${f(px - 190 * sc)} ${f(py - 204 * sc)}) scale(${f(sc)})">${mariaGirl(o)}</g>`;
}
