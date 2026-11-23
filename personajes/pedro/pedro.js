/* PEDRO DE FRENTE — personaje fijo de la serie (versión mejorada del Pedro del vídeo 05 / cartel).
   Chico de frente con pelo corto castaño oscuro con flequillo de lado, gafas redondas, cuello visible,
   camiseta verde de manga corta, pantalón negro y zapatillas blancas. Mismo estilo que María (src/maria.js):
   contorno negro de grosor constante, colores planos, sombra dura en el lado izquierdo de la imagen.
   Sistema local IGUAL que María: suelo en y=204, centro x=190 (cabeza en (190, 79.5), altura ≈ 144).
   pedroF(o) / placePedroF(px, py, sc, o). o: expr ('happy'|'normal'|'grin'|'laugh'|'sparkle'|'wink'|'surprise'|'tired'),
   talk (0..1 boca), blink, look [dx,dy] (pupilas), head (giro de cabeza, grados), bob,
   armF / armB = { h:[x,y] mano, side:±1 codo, hand:'fist'|'open'|'count'|'point'|'thumb'|'heart'|'phone', … }
   (armF = brazo a la derecha de la imagen). Manos con hand11 (src/v11.js) si existe, si no, puño.
   front0(w) se dibuja tras los brazos y antes de la cabeza; front(w) encima de todo. Requiere lib.js. */
'use strict';

const PD = {
  green: '#3C9D5D', greenS: '#2A7344', pants: '#222222', pantsS: '#151515', hair: '#3B2A24', hairL: '#5E453A',
  brow: '#3B2A24', skin: '#F6C9A0', skinS: '#E9B88F', nose: '#D9A27A', shoe: '#FFFFFF', shoeS: '#E8E8E8',
  shF: [202.5, 104.5], shB: [177.5, 104.5], head: [190, 73], L: 17.5
};
const PD_REST_F = { h: [207.6, 138.5], side: -1, hand: 'fist', hs: 1.15 };
const PD_REST_B = { h: [172.4, 138.5], side: 1, hand: 'fist', hs: 1.15 };

function pdFace(o, w) {
  const e = o.expr || 'happy', m = clamp(o.talk || 0);
  const L = (d, sw = 1.5, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const E = [183.6, 196.4], EY = 74, MX = 190, MY = 85;
  const lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  let s = '';
  // mejillas (por debajo de las gafas)
  const ch = e === 'normal' || e === 'tired' ? 0.35 : 0.7;
  s += `<ellipse cx="179.4" cy="81.6" rx="2.8" ry="1.7" fill="${C.pink}" opacity="${ch}"/><ellipse cx="200.6" cy="81.6" rx="2.8" ry="1.7" fill="${C.pink}" opacity="${ch}"/>`;
  // cristales
  E.forEach(x => { s += `<circle cx="${x}" cy="${EY}" r="5" fill="#FFFFFF" fill-opacity="0.55"/>`; });
  // ojos
  const pup = (x, r, hl) => `<circle cx="${f(x + lx)}" cy="${f(EY + ly)}" r="${r}" fill="${INK}"/>` +
    (hl ? `<circle cx="${f(x + lx + 0.8)}" cy="${f(EY + ly - 0.9)}" r="${f(r * 0.4)}" fill="#FFFFFF"/>` : '');
  const arc = x => L(`M${f(x - 2.6)} ${f(EY + 0.9)} Q${x} ${f(EY - 2.1)} ${f(x + 2.6)} ${f(EY + 0.9)}`, 1.6);
  if (o.blink && e !== 'laugh' && e !== 'wink') s += L(`M${E[0] - 2.4} ${EY + 0.3} H${E[0] + 2.4} M${E[1] - 2.4} ${EY + 0.3} H${E[1] + 2.4}`, 1.6);
  else if (e === 'laugh') s += arc(E[0]) + arc(E[1]);
  else if (e === 'wink') s += arc(E[0]) + pup(E[1], 2.2, true);
  else if (e === 'surprise') s += pup(E[0], 1.3) + pup(E[1], 1.3);
  else if (e === 'tired') {
    s += pup(E[0], 1.6) + pup(E[1], 1.6);
    E.forEach(x => { s += `<path d="M${f(x - 4)} ${f(EY - 0.2)} A4 4 0 0 1 ${f(x + 4)} ${f(EY - 0.2)} Z" fill="${PD.skin}"/>` + L(`M${f(x - 3.8)} ${f(EY - 0.2)} H${f(x + 3.8)}`, 1.3); });
  } else if (e === 'normal') s += pup(E[0], 1.7) + pup(E[1], 1.7);
  else s += pup(E[0], 2.2, true) + pup(E[1], 2.2, true);
  // montura (encima): dos aros, puente y patillas hacia las orejas
  E.forEach(x => { s += `<circle cx="${x}" cy="${EY}" r="5" fill="none" stroke="${INK}" stroke-width="${w(1.8)}"/>`; });
  s += L(`M188.6 ${f(EY - 0.6)} Q190 ${f(EY - 1.8)} 191.4 ${f(EY - 0.6)}`, 1.6);
  s += L(`M178.6 ${f(EY - 0.8)} L175.6 ${f(EY - 1.6)} M201.4 ${f(EY - 0.8)} L204.4 ${f(EY - 1.6)}`, 1.6);
  if (e !== 'laugh' && e !== 'tired') s += L(`M180.6 ${f(EY - 2.2)} Q181.4 ${f(EY - 3.4)} 182.8 ${f(EY - 3.6)} M193.4 ${f(EY - 2.2)} Q194.2 ${f(EY - 3.4)} 195.6 ${f(EY - 3.6)}`, 0.9, '#FFFFFF');
  if (e === 'sparkle') s += `<path d="M${f(E[1] + 6.4)} ${f(EY - 5.6)} l0.7 -1.6 0.7 1.6 1.6 0.7 -1.6 0.7 -0.7 1.6 -0.7 -1.6 -1.6 -0.7z" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(0.6)}"/>`;
  // cejas (por encima de la montura)
  if (e === 'surprise') s += L('M179.6 65.3 Q183.6 62.9 187.4 64.9 M192.6 64.9 Q196.4 62.9 200.4 65.3');
  else if (e === 'tired') s += L('M179.8 67.9 L187.2 67.1 M192.8 67.1 L200.2 67.9');
  else if (e === 'wink') s += L('M179.8 68.1 Q183.6 67.1 187.2 67 M192.8 66.5 Q196.4 64 200.2 66.3');
  else if (e === 'normal') s += L('M179.8 67.5 Q183.6 66.3 187.2 67.1 M192.8 67.1 Q196.4 66.3 200.2 67.5');
  else s += L('M179.8 66.9 Q183.6 65.1 187.2 66.5 M192.8 66.5 Q196.4 65.1 200.2 66.9');
  // nariz
  s += L('M190.5 78 Q188.9 80.2 190.7 81.2', 1.1, PD.nose);
  // boca
  if (m > 0.05) {
    const hw = 4, op = 1.2 + 5 * m;
    s += `<path d="M${f(MX - hw)} ${MY} Q${MX} ${f(MY + 0.8)} ${f(MX + hw)} ${MY} Q${MX} ${f(MY + op)} ${f(MX - hw)} ${MY}Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}" stroke-linejoin="round"/>`;
    s += `<path d="M${f(MX - hw * 0.7)} ${f(MY + 0.35)} Q${MX} ${f(MY + 1.1)} ${f(MX + hw * 0.7)} ${f(MY + 0.35)}" stroke="#FFFFFF" stroke-width="${w(1)}" fill="none" stroke-linecap="round"/>`;
  } else if (e === 'surprise') s += `<ellipse cx="${MX}" cy="${f(MY + 1.4)}" rx="2" ry="2.7" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
  else if (e === 'normal') s += L(`M${MX - 3} ${MY + 0.6} L${MX + 3} ${MY + 0.6}`, 1.8);
  else if (e === 'tired') s += L(`M${MX - 3} ${MY + 1.4} Q${MX} ${MY - 0.2} ${MX + 3} ${MY + 1.4}`, 1.8);
  else if (e === 'happy') s += L(`M${MX - 4} ${MY - 0.4} Q${MX} ${MY + 3.4} ${MX + 4} ${MY - 0.4}`, 1.8);
  else if (e === 'laugh') {
    s += `<path d="M${MX - 5} ${MY - 0.8} Q${MX} ${MY - 0.2} ${MX + 5} ${MY - 0.8} Q${MX + 4.4} ${MY + 7.4} ${MX} ${MY + 7.4} Q${MX - 4.4} ${MY + 7.4} ${MX - 5} ${MY - 0.8}Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}" stroke-linejoin="round"/>`;
    s += `<path d="M${MX - 2.8} ${MY + 5.6} Q${MX} ${MY + 3.6} ${MX + 2.8} ${MY + 5.6} Q${MX} ${MY + 7} ${MX - 2.8} ${MY + 5.6}Z" fill="${C.pink}"/>`;
    s += `<path d="M${MX - 3.8} ${MY - 0.2} H${MX + 3.8}" stroke="#FFFFFF" stroke-width="${w(1.1)}" stroke-linecap="round"/>`;
  } else {
    // grin / sparkle / wink: sonrisa abierta ancha con dientes (forma de D, como María)
    const hw = 5, dp = 5.8;
    s += `<path d="M${f(MX - hw)} ${f(MY - 0.6)} Q${MX} ${f(MY + dp)} ${f(MX + hw)} ${f(MY - 0.6)} Q${MX} ${f(MY + 0.7)} ${f(MX - hw)} ${f(MY - 0.6)}Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.4)}" stroke-linejoin="round"/>`;
    s += `<path d="M${f(MX - hw * 0.72)} ${f(MY + 0.05)} Q${MX} ${f(MY + 1.3)} ${f(MX + hw * 0.72)} ${f(MY + 0.05)}" stroke="#FFFFFF" stroke-width="${w(1)}" fill="none" stroke-linecap="round"/>`;
  }
  return s;
}
// brazo con codo (dos segmentos), manga corta verde que sigue al brazo y mano
function pdArm(S, A, w, back) {
  const L_ = PD.L;
  let H = A.h || (back ? PD_REST_B.h : PD_REST_F.h);
  let dx = H[0] - S[0], dy = H[1] - S[1], d = Math.hypot(dx, dy) || 0.01;
  const max = 2 * L_ - 0.01;
  if (d > max) { H = [S[0] + dx / d * max, S[1] + dy / d * max]; dx = H[0] - S[0]; dy = H[1] - S[1]; d = max; }
  const hg = Math.sqrt(Math.max(0, L_ * L_ - d * d / 4)), sd = A.side || (back ? 1 : -1);
  const E = [(S[0] + H[0]) / 2 - dy / d * hg * sd, (S[1] + H[1]) / 2 + dx / d * hg * sd];
  const pd = `M${f(S[0])} ${f(S[1])} L${f(E[0])} ${f(E[1])} L${f(H[0])} ${f(H[1])}`;
  const fill = back ? PD.skinS : PD.skin, AW = 6.2;
  let s = `<path d="${pd}" fill="none" stroke="${INK}" stroke-width="${f(AW + +w(3))}" stroke-linecap="round" stroke-linejoin="round"/><path d="${pd}" fill="none" stroke="${fill}" stroke-width="${f(AW - +w(3))}" stroke-linecap="round" stroke-linejoin="round"/>`;
  // manga: cápsula corta en la dirección del brazo
  const ux = (E[0] - S[0]) / L_, uy = (E[1] - S[1]) / L_, M = [S[0] + ux * 5.6, S[1] + uy * 5.6], SW_ = 9.2;
  const sp = `M${f(S[0])} ${f(S[1])} L${f(M[0])} ${f(M[1])}`;
  s += `<path d="${sp}" fill="none" stroke="${INK}" stroke-width="${f(SW_ + +w(3))}" stroke-linecap="round"/><path d="${sp}" fill="none" stroke="${back ? PD.greenS : PD.green}" stroke-width="${f(SW_ - +w(3))}" stroke-linecap="round"/>`;
  s += typeof hand11 === 'function' ? hand11(A.hand || 'fist', H, w, Object.assign({ fill: PD.skin, hs: 1.2 }, A)) : `<circle cx="${f(H[0])}" cy="${f(H[1])}" r="3.6" fill="${PD.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
  return s;
}
function pedroF(o) {
  const k = o.k || 1, w = v => f(v * k), st = (v = 3) => `stroke="${INK}" stroke-width="${w(v)}" stroke-linejoin="round"`;
  const F = o.armF || PD_REST_F, B = o.armB || PD_REST_B;
  let g = '';
  // piernas (pantalón) y zapatillas
  g += `<rect x="180" y="146" width="8.4" height="54" rx="3" fill="${PD.pantsS}" ${st()}/><rect x="191.6" y="146" width="8.4" height="54" rx="3" fill="${PD.pants}" ${st()}/>`;
  g += `<path d="M177.4 204 V201.4 Q177.4 198.6 180.2 198.6 H187.6 Q189.8 198.6 189.8 201.4 V204Z" fill="${PD.shoeS}" ${st(2.6)}/><path d="M190.2 204 V201.4 Q190.2 198.6 192.4 198.6 H199.8 Q202.6 198.6 202.6 201.4 V204Z" fill="${PD.shoe}" ${st(2.6)}/>`;
  g += `<path d="M178.4 202.2 H188.8 M191.2 202.2 H201.6" stroke="${INK}" stroke-width="${w(1.2)}" stroke-linecap="round"/>`;
  let b = '';
  // cadera
  b += `<rect x="178.6" y="138" width="22.8" height="16" rx="3.4" fill="${PD.pants}" ${st()}/>`;
  // cuello
  b += `<rect x="185.4" y="90" width="9.2" height="14" rx="2.4" fill="${PD.skinS}" ${st()}/>`;
  // camiseta
  const tee = 'M181.4 99.6 Q190 104.6 198.6 99.6 L203 101.6 Q206.2 103 206 108 L205.4 146.2 Q190 149.6 174.6 146.2 L174 108 Q173.8 103 177 101.6Z';
  b += `<path d="${tee}" fill="${PD.green}"/><path d="M181.4 99.6 L184.6 101.6 L183.4 147.6 Q178.4 147.2 174.6 146.2 L174 108 Q173.8 103 177 101.6Z" fill="${PD.greenS}"/>`;
  b += `<path d="M186 128 Q190 129.4 194 128" stroke="${PD.greenS}" stroke-width="${w(1.2)}" fill="none" stroke-linecap="round" opacity="0.8"/>`;
  b += `<path d="${tee}" fill="none" ${st()}/>`;
  b += `<path d="M181.4 99.6 Q190 106.4 198.6 99.6" fill="none" ${st(2.4)} stroke-linecap="round"/>`;
  // brazos (con manga corta)
  b += pdArm(PD.shB, B, w, true) + pdArm(PD.shF, F, w, false);
  if (o.front0) b += o.front0(w);
  // cabeza
  let hd = '';
  hd += `<circle cx="174.8" cy="75.4" r="3.3" fill="${PD.skinS}" ${st(2.4)}/><circle cx="205.2" cy="75.4" r="3.3" fill="${PD.skinS}" ${st(2.4)}/>`;
  hd += `<ellipse cx="190" cy="73" rx="15.2" ry="15.6" fill="${PD.skin}" ${st()}/>`;
  // pelo corto con flequillo de lado
  hd += `<path d="M175 77.4 Q170.8 54.6 190 53.4 Q209.2 54.4 205 77.4 Q204.2 67.4 199.8 62.8 Q193.6 66 184.2 62.2 Q180.2 64.4 178.4 67.6 Q176.2 70.6 175 77.4Z" fill="${PD.hair}" ${st()}/>`;
  hd += `<path d="M182.6 57.8 Q190 55.4 197.8 58" stroke="${PD.hairL}" stroke-width="${w(1.3)}" fill="none" stroke-linecap="round"/>`;
  hd += pdFace(o, w);
  b += `<g transform="translate(0 6.5) rotate(${f(o.head || 0)} 190 92)">${hd}</g>`;
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  return g;
}
function placePedroF(px, py, sc, o) {
  o.k = SW / (3 * sc);
  return `<g transform="translate(${f(px - 190 * sc)} ${f(py - 204 * sc)}) scale(${f(sc)})">${pedroF(o)}</g>`;
}
