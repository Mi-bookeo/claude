/* Vídeo 10 — «Carmen y María». Piezas nuevas sobre lib.js + series.js + rosa.js + v04…v09.js:
   CARMEN (tienda de moda rosa) y MARÍA (tienda de moda azul), sistema local de la serie (suelo y=208, cabeza en 190,80,
   miran a la derecha), brazos con codo (limb/armJoints del vídeo 07); tiendas de moda con maniquíes; tiendas de
   categoría de la avenida (FLORES, ZAPATOS, CAFÉ, LIBROS, PAN); AVENIDA luminosa (cielo de dos bandas, sol, nubes,
   farolas, banderines, árboles, bancos, gente); CALLEJUELA oscura (tira de cielo apagado, casas altas, balcones sin
   macetas, sábana, farola, contenedor, charco, persianas con grafiti, «SE ALQUILA», buzón, hojas, gato, sombra plana
   #2D4A6B al 35 %); interior de la tienda de María (percheros, espejo, probador); tarjetas «Novedad» y «Oferta» con
   franja roja y logo; María en primer plano (cara detallada, susurro y guiño). */
'use strict';

const K10 = {
  pinkS: '#D96C93', blueS: '#2F5F9E', skinS: '#E9B88F', grey: '#9AA0A6', greyD: '#7D838A', greyL: '#C9CDD2', greyLS: '#AEB3B9',
  cHair: '#7A4A30', mHair: '#3E2A20', mFrame: '#2D4A6B', shade: '#2D4A6B', cob: '#C9A58E', cobS: '#B08D76',
  aSky: '#9FB4C0', aBand: '#B9C8D0', aCloud: '#AEBDC7', warm: '#F2C12E', warmL: '#FFE9A8', walk: '#F2B5AD'
};
const st10 = (w, v = 3) => `stroke="${INK}" stroke-width="${w(v)}" stroke-linejoin="round"`;

/* ===================== CARMEN Y MARÍA (local: suelo y=208, mira a la derecha) ===================== */
const CARMEN = {
  id: 'carmen', round: true, hair: 'pony', hairC: K10.cHair, vest: C.pink, vestS: K10.pinkS, bottom: 'skirt', bottomC: C.navy,
  shoe: C.dred, sh: [[209, 106], [171, 106]], blush: 0.75
};
const MARIA = {
  id: 'maria', round: false, hair: 'bob', hairC: K10.mHair, vest: C.blue, vestS: K10.blueS, bottom: 'pants', bottomC: K10.greyL,
  bottomS: K10.greyLS, shoe: C.navy, sh: [[205, 106], [175, 106]], glasses: true, blush: 0.55
};
// brazo con codo: a = {ang, bend} | {ik:[x,y], side}; devuelve svg y la mano
function tArm(S, a, back, w, item) {
  const { E, H } = armJoints(S, a || { ang: 4, bend: -6 });
  const sl = back ? '#E8E2E0' : '#FFFFFF', sk = back ? C.skinS : C.skin;
  let s = limb(S, E, 8.6, sl, w) + limb(E, H, 7.8, sl, w);
  s += `<circle cx="${f(H[0])}" cy="${f(H[1])}" r="4.3" fill="${sk}" ${st10(w, 2.2)}/>`;
  if (item) s += item(w, H[0], H[1]);
  return s;
}
function tFace(P, o, w) {
  const e = o.expr || 'happy', lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const L = (d, sw = 1.6, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const pup = (r = 1.8, hl = true) => [196, 204].map(x => `<circle cx="${f(x + lx)}" cy="${f(81 + ly)}" r="${r}" fill="${INK}"/>` +
    (hl ? `<circle cx="${f(x + lx + 0.7)}" cy="${f(80.2 + ly)}" r="${f(r * 0.38)}" fill="#FFFFFF"/>` : '')).join('');
  let s = '';
  // ojos
  if (o.blink || e === 'sigh') s += L('M193.4 81.2 Q196 83 198.6 81.2 M201.4 81.2 Q204 83 206.6 81.2', 1.4);
  else if (e === 'surprise') s += [196, 204].map(x => `<circle cx="${x}" cy="80.6" r="3.3" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.4)}"/><circle cx="${f(x + lx * 0.6)}" cy="${f(80.8 + ly * 0.6)}" r="1.4" fill="${INK}"/>`).join('');
  else if (e === 'wink') s += `<circle cx="${f(204 + lx)}" cy="${f(81 + ly)}" r="1.9" fill="${INK}"/>` + L('M193.2 81.6 Q196 78.8 198.8 81.6', 1.7);
  else if (e === 'sad') s += pup(1.6, false) + L('M193.6 79.6 H198.4 M201.6 79.6 H206.4', 1.1);
  else if (e === 'calm' || e === 'focus') s += pup(e === 'focus' ? 1.5 : 1.7, e !== 'focus');
  else s += pup(1.9, true); // happy, hope, proud
  // gafas rectangulares (María)
  if (P.glasses) s += `<rect x="192.2" y="77.6" width="7.6" height="6.6" rx="1.6" fill="#FFFFFF" fill-opacity="0.25" stroke="${K10.mFrame}" stroke-width="${w(1.5)}"/>
    <rect x="200.6" y="77.6" width="7.6" height="6.6" rx="1.6" fill="#FFFFFF" fill-opacity="0.25" stroke="${K10.mFrame}" stroke-width="${w(1.5)}"/>
    <path d="M199.8 80 H200.6 M192.2 79.6 L181 78.6" stroke="${K10.mFrame}" stroke-width="${w(1.5)}" stroke-linecap="round"/>`;
  // cejas
  const by = P.glasses ? -1.6 : 0;
  const B = d => L(d.replace(/(-?\d+(\.\d+)?) (-?\d+(\.\d+)?)/g, (m, a, _, b) => `${a} ${f(Number(b) + by)}`), 1.5, P.id === 'maria' ? K10.mHair : INK);
  if (e === 'sad' || e === 'sigh') s += B('M193.4 75.6 L198.2 74 M201.8 74 L206.6 75.6');
  else if (e === 'surprise' || e === 'hope') s += B('M192.8 74.2 Q195.6 71.4 198.6 73.4 M201.4 73.4 Q204.4 71.4 207.2 74.2');
  else if (e === 'focus') s += B('M193 75.8 L198.4 76.4 M201.6 76.4 L207 75.8');
  else if (e === 'wink') s += B('M193 76.6 L198.4 75.8 M201.4 73.6 Q204.2 71.6 207 73.8');
  else s += B('M193 75 Q195.8 73.4 198.6 74.6 M201.4 74.6 Q204.2 73.4 207 75');
  // mejillas
  s += `<circle cx="194" cy="88" r="3" fill="${C.pink}" opacity="${P.blush}"/><circle cx="206.4" cy="87.4" r="2.3" fill="${C.pink}" opacity="${P.blush}"/>`;
  // boca
  if (e === 'sad') s += L('M197.6 91.2 Q200.6 88.6 203.6 91.2', 1.9);
  else if (e === 'sigh') s += `<ellipse cx="201" cy="90.4" rx="1.6" ry="1.9" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.3)}"/>`;
  else if (e === 'surprise') s += `<ellipse cx="200.6" cy="90.6" rx="2.4" ry="3.1" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.4)}"/>`;
  else if (e === 'hope' || e === 'proud') s += `<path d="M195.8 87.6 Q200.4 95 205.2 87.4 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/><path d="M196.8 88.1 H204.2 L203.4 89.3 H197.6Z" fill="#FFFFFF"/>`;
  else if (e === 'wink') s += `<path d="M196 87.6 Q201 94 205.6 86.2 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
  else if (e === 'focus') s += L('M197.4 89.6 Q200.4 90.6 203.4 89.4', 1.8);
  else if (e === 'calm') s += L('M196.6 88.6 Q200.4 91.6 204.4 88.4', 1.9);
  else s += L('M196 88.4 Q200.4 92.8 205 88.2', 2); // happy
  return s;
}
// o: expr, look, blink, armF, armB ({ang,bend}|{ik}), bob, head, itemF(w,x,y), itemB, front(w), slump
function tendera(P, o) {
  const k = o.k || 1, w = v => f(v * k), st = (v = 3) => st10(w, v), R = P.round;
  let g = '';
  // piernas
  if (P.bottom === 'skirt') {
    g += `<rect x="181.5" y="166" width="7.5" height="37" rx="3.6" fill="${C.skinS}" ${st()}/><rect x="192" y="166" width="7.5" height="37" rx="3.6" fill="${C.skin}" ${st()}/>`;
    g += `<path d="M178.5 202.4 h12.5 a4 4 0 0 1 0 5.6 h-12.5z" fill="${P.shoe}" ${st(2.6)}/><path d="M189.5 202.4 h12.5 a4 4 0 0 1 0 5.6 h-12.5z" fill="${P.shoe}" ${st(2.6)}/>`;
  } else {
    g += `<rect x="181" y="148" width="9" height="55" rx="4" fill="${P.bottomS}" ${st()}/><rect x="192" y="148" width="9" height="55" rx="4" fill="${P.bottomC}" ${st()}/>`;
    g += `<path d="M178 202 h16 a4.5 4.5 0 0 1 0 6 h-16z" fill="${P.shoe}" ${st(2.6)}/><path d="M189 202 h16 a4.5 4.5 0 0 1 0 6 h-16z" fill="${P.shoe}" ${st(2.6)}/>`;
  }
  let b = '';
  const [SF, SB] = P.sh, sl = o.slump || 0;
  const SBb = [SB[0], SB[1] + sl], SFf = [SF[0], SF[1] + sl];
  // pelo trasero
  if (P.hair === 'pony') {
    const sw_ = o.pony || 0;
    b += `<g transform="rotate(${f(sw_)} 179 64)"><path d="M181 63 Q168 50 160 60 Q153 72 158 96 Q162 90 165 80 Q168 70 180 69Z" fill="${P.hairC}" ${st()}/><path d="M163 66 Q160 76 161 86" stroke="${INK}" stroke-width="${w(1.2)}" fill="none" stroke-linecap="round"/></g>`;
  }
  if (P.hair === 'bob') b += `<path d="M191 63 Q172 62 172 82 Q172 93 175 97 H186 L186 80Z" fill="${P.hairC}" ${st()}/>`;
  b += tArm(SBb, o.armB, true, w, o.itemB);
  // cuello y torso
  b += `<rect x="186.5" y="88" width="7" height="14" rx="2" fill="${C.skinS}" ${st()}/>`;
  const torso = R ? 'M176 100 Q190 95 204 100 Q215 105 215 130 Q215 158 203 159 H177 Q165 158 165 130 Q165 105 176 100Z'
    : 'M178 100 Q190 96 202 100 Q208 102 208 112 V155 H172 V112 Q172 102 178 100Z';
  const bot = R ? 159 : 155;
  if (P.bottom === 'skirt') b += `<path d="M168 150 H212 L216 175 Q190 180 164 175Z" fill="${P.bottomC}" ${st()}/><path d="M178 160 L176 176 M202 160 L204 176" stroke="${INK}" stroke-width="${w(1.1)}" opacity="0.5"/>`;
  const id = 'tv' + (uid++);
  b += `<clipPath id="${id}"><path d="${torso}"/></clipPath><g clip-path="url(#${id})">
    <rect x="160" y="94" width="60" height="70" fill="${P.vest}"/><rect x="160" y="94" width="${R ? 22 : 20}" height="70" fill="${P.vestS}"/>
    <path d="M186 98 H198 L196.5 ${bot + 2} H188Z" fill="#FFFFFF" ${st(1.8)}/>
    <path d="M${R ? 168 : 172} ${bot - 18} H${R ? 186 : 187} M197.5 ${bot - 18} H${R ? 212 : 208}" stroke="${INK}" stroke-width="${w(1.3)}" opacity="0.45"/></g>`;
  b += `<path d="${torso}" fill="none" ${st()}/>`;
  [110, 121, 132].forEach(y => { b += `<circle cx="192.2" cy="${y}" r="1.2" fill="${C.cream}" stroke="${INK}" stroke-width="${w(0.8)}"/>`; });
  // cuello de la blusa
  b += `<path d="M185 97.5 L191.6 104.6 L187 108 L182.6 100.6Z M199.4 97.5 L193 104.6 L197.6 108 L202 100.6Z" fill="#FFFFFF" ${st(1.7)}/>`;
  // bolsillo del chaleco
  b += `<path d="M199 128 H206.5" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linecap="round"/>`;
  if (o.pocketItem) b += o.pocketItem(w);
  if (o.front0) b += o.front0(w);
  b += tArm(SFf, o.armF, false, w, o.itemF);
  // cabeza
  let hd = `<circle cx="190" cy="80" r="15" fill="${C.skin}" ${st()}/>`;
  if (P.hair === 'pony') hd += `<path d="M175 82 Q172 63 190 63 Q207 63 206 77 Q199 68 190 70 Q181 71 178 80Z" fill="${P.hairC}" ${st()}/>
    <path d="M184 66 Q190 64.4 196 65.6" stroke="#FFFFFF" stroke-width="${w(0.9)}" fill="none" stroke-linecap="round" opacity="0.5"/>
    <g transform="rotate(-14 178 63)"><path d="M178 63 L169 57 L170 69Z M178 63 L187 57 L186 69Z" fill="${C.pink}" ${st(2)}/><circle cx="178" cy="63" r="2.8" fill="${K10.pinkS}" ${st(1.8)}/></g>`;
  if (P.hair === 'bob') hd += `<path d="M175 90 Q170 63 190 63 Q207 63 207 76 Q204 71 199 70.4 Q192 75 183 73.6 Q180 78 180.4 90Z" fill="${P.hairC}" ${st()}/>
    <path d="M186 67 Q193 66 199 69" stroke="#FFFFFF" stroke-width="${w(0.9)}" fill="none" stroke-linecap="round" opacity="0.4"/>`;
  hd += tFace(P, o, w);
  if (o.headItem) hd += o.headItem(w);
  b += `<g transform="rotate(${f(o.head || 0)} 190 96)">${hd}</g>`;
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f((o.bob || 0) + sl * 0.5)})">${b}</g>`;
  if (o.squash) g = `<g transform="translate(190 208) scale(${f(o.squash[0])} ${f(o.squash[1])}) translate(-190 -208)">${g}</g>`;
  return g;
}
function placeT(P, px, py, sc, o) {
  o.k = SW / (3 * sc);
  const sx = o.flip ? -sc : sc;
  return `<g transform="translate(${f(px - 190 * sx)} ${f(py - 208 * sc)}) scale(${f(sx)} ${f(sc)})">${tendera(P, o)}</g>`;
}
const tPt = (px, py, sc, lx, ly, flip) => [px + (lx - 190) * sc * (flip ? -1 : 1), py + (ly - 208) * sc];
const tBreath = T => -2 * (0.5 - 0.5 * Math.cos(2 * PI * T / 1.6)); // 2 px cada 1,6 s
const tBlink = (T, off = 0) => ((T + off) % 3.1) < 0.12;
// móvil en las dos manos, delante del pecho (local). ph = fase del tecleo; screen: 'app' | 'ok' | 'off'
function holdPhone10(ph, typing, screen = 'app') {
  return w => {
    const cx = 203, cy = 121, rot = -12;
    let g = `<g transform="rotate(${rot} ${cx} ${cy})"><rect x="${cx - 9}" y="${cy - 15}" width="18" height="30" rx="3.4" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/>`;
    if (screen === 'off') g += `<rect x="${cx - 7}" y="${cy - 12.6}" width="14" height="25" rx="1.8" fill="${C.glass}"/>`;
    else {
      g += `<rect x="${cx - 7}" y="${cy - 12.6}" width="14" height="25" rx="1.8" fill="#FFFFFF"/><rect x="${cx - 7}" y="${cy - 12.6}" width="14" height="5" fill="${C.red}"/>`;
      if (screen === 'ok') g += `<circle cx="${cx}" cy="${cy + 2}" r="4.4" fill="${C.green}" stroke="${INK}" stroke-width="${w(0.9)}"/><path d="M${cx - 2} ${cy + 2} l1.4 1.5 l2.8 -3.1" stroke="#FFFFFF" stroke-width="${w(1.1)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      else g += `<rect x="${cx - 5.4}" y="${cy - 6}" width="10.8" height="7" rx="1" fill="${C.glass}" stroke="${INK}" stroke-width="${w(0.6)}"/><path d="M${cx - 1.6} ${cy - 5} h3.2 l1.4 5 h-6z" fill="${C.blue}" stroke="${INK}" stroke-width="${w(0.5)}"/><rect x="${cx - 5.4}" y="${cy + 3}" width="10.8" height="3.6" rx="1.8" fill="${C.red}" stroke="${INK}" stroke-width="${w(0.5)}"/>`;
    }
    g += `</g>`;
    if (typing) {
      const a = Math.max(0, Math.sin(ph * PI)), b2 = Math.max(0, -Math.sin(ph * PI));
      g += `<rect x="${f(196.6 + a)}" y="${f(121 - a * 2)}" width="5" height="3" rx="1.5" fill="${C.skinS}" stroke="${INK}" stroke-width="${w(1.3)}"/>`;
      g += `<rect x="${f(204 - b2)}" y="${f(124 - b2 * 2)}" width="5" height="3" rx="1.5" fill="${C.skin}" stroke="${INK}" stroke-width="${w(1.3)}"/>`;
    }
    return g;
  };
}
const PHONE_IK = { F: { ik: [209, 128], side: 1 }, B: { ik: [196, 127], side: 1 } };
// mano que saluda (en la mano del brazo con codo)
const waveItem = ph => (w, x, y) => `<g transform="rotate(${f(20 * Math.sin(ph))} ${f(x)} ${f(y + 3)})"><rect x="${f(x - 2.8)}" y="${f(y - 11)}" width="5.6" height="10" rx="2.8" fill="${C.skin}" stroke="${INK}" stroke-width="${w(1.7)}"/><circle cx="${f(x)}" cy="${f(y)}" r="4.6" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/></g>`;
// mano en la mejilla (palma)
const cheekItem = (w, x, y) => `<ellipse cx="${f(x)}" cy="${f(y - 1)}" rx="4.4" ry="5.4" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2)}"/>`;
// bolsa de compra colgando de la mano (marco del mundo local)
const bagHang = (col, s = 1) => (w, x, y) => `<path d="M${f(x - 4 * s)} ${f(y + 9 * s)} Q${f(x)} ${f(y - 3 * s)} ${f(x + 4 * s)} ${f(y + 9 * s)}" fill="none" stroke="${INK}" stroke-width="${w(1.6)}"/>
  <rect x="${f(x - 9 * s)}" y="${f(y + 8 * s)}" width="${f(18 * s)}" height="${f(20 * s)}" rx="${f(2 * s)}" fill="${col}" stroke="${INK}" stroke-width="${w(2)}"/>
  <rect x="${f(x - 4.5 * s)}" y="${f(y + 14 * s)}" width="${f(9 * s)}" height="${f(5 * s)}" rx="1" fill="#FFFFFF" opacity="0.8"/>`;
// suspiro (nubecilla que sale de la boca)
function sighPuff(x, y, u) {
  if (u <= 0 || u >= 1) return '';
  const k = Math.sin(u * PI);
  return puff(x + u * 80, y - u * 30, 26 + 16 * u, k) + puff(x + u * 130, y - u * 60, 16 + 10 * u, k * 0.8);
}

/* ===================== MANIQUÍES Y TIENDAS DE MODA ===================== */
function mannequin(x, base, s, col, colS) {
  const g = `<path d="M0 0 V-20" stroke="${INK}" stroke-width="3.2"/><path d="M-14 0 H14" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <path d="M-15 -22 Q-16 -40 -9 -52 L-7 -64 Q-15 -70 -15 -80 Q-15 -88 -6 -90 H6 Q15 -88 15 -80 Q15 -70 7 -64 L9 -52 Q16 -40 15 -22 Q0 -18 -15 -22Z" fill="${col}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M-15 -22 Q-16 -40 -9 -52 L-7 -64 Q-15 -70 -15 -80 Q-15 -88 -6 -90 L-4 -60 L-6 -21Z" fill="${colS}"/>
    <path d="M-9 -60 Q0 -56 9 -60" stroke="${INK}" stroke-width="1.8" fill="none"/>
    <rect x="-3" y="-98" width="6" height="9" rx="2" fill="${C.cream}" stroke="${INK}" stroke-width="2.2"/><circle cx="0" cy="-100" r="4" fill="${C.cream}" stroke="${INK}" stroke-width="2.2"/>`;
  return `<g transform="translate(${f(x)} ${f(base)}) scale(${f(s)})">${g}</g>`;
}
function awningC(tl, tr, bl, br, y, h, N, col) {
  return awning(tl, tr, bl, br, y, h, N).replace(new RegExp(C.red, 'g'), col);
}
// tienda de moda: P = paleta {stripe, sign, dress:[[c,s]x3]}; o.glow (luz cálida), o.inside(door)
const PINK_SHOP = { stripe: C.pink, sign: K10.pinkS, facade: C.cream, dress: [[C.pink, K10.pinkS], ['#F7B7CD', '#E79AB4'], [C.red, '#A32323']] };
const BLUE_SHOP = { stripe: C.blue, sign: C.navy, facade: C.cream, dress: [[C.blue, K10.blueS], [C.glass, '#93C3D8'], [C.navy, '#22394F']] };
function fashionGeo(x, base, w, h) {
  const top = base - h, sy = top + 0.04 * h, sh = 0.13 * h, ay = top + 0.2 * h, ah = 0.12 * h;
  const wy = ay + ah + (w * 1.06 / 7) / 2 + 0.03 * h;
  const win = { x: x + 0.06 * w, y: wy, w: 0.56 * w, h: base - 0.07 * h - wy };
  const door = { x: x + 0.68 * w, y: wy - 0.01 * h, w: 0.26 * w };
  door.h = base - door.y;
  return { x, base, w, h, top, sy, sh, ay, ah, win, door };
}
function fashionShop(x, base, w, h, P, o = {}) {
  const g = fashionGeo(x, base, w, h), { top, sy, sh, ay, ah, win, door } = g;
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="${P.facade}"/>`;
  s += `<rect x="${f(x + w * 0.9)}" y="${f(top + w * 0.02)}" width="${f(w * 0.1)}" height="${f(h + 30)}" fill="${INK}" opacity="0.16"/>`;
  s += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="none" ${sk()}/>`;
  const pw = w * 0.78, sd = Math.max(5, w * 0.014);
  s += `<rect x="${f(x + (w - pw) / 2 + sd)}" y="${f(sy + sd)}" width="${f(pw)}" height="${f(sh)}" rx="${f(sh * 0.25)}" fill="${INK}"/>`;
  s += `<rect x="${f(x + (w - pw) / 2)}" y="${f(sy)}" width="${f(pw)}" height="${f(sh)}" rx="${f(sh * 0.25)}" fill="${P.sign}" ${sk()}/>`;
  s += text('MODA', x + w / 2, sy + sh * 0.56, { size: fit('MODA', sh * 0.78, pw * 0.8), fill: C.cream, sw: SW * 1.5, sd: 4, ls: Math.round(w * 0.02) });
  s += awningC(x + w * 0.04, x + w * 0.96, x - w * 0.03, x + w * 1.03, ay, ah, 7, P.stripe);
  // escaparate con 3 maniquíes (luz cálida opcional)
  s += glassWindow(win.x, win.y, win.w, win.h, () => {
    let gi = '';
    if (o.glow) {
      gi += `<path d="M${f(win.x + win.w * 0.18)} ${f(win.y)} H${f(win.x + win.w * 0.82)} L${f(win.x + win.w)} ${f(win.y + win.h * 0.7)} V${f(win.y + win.h)} H${f(win.x)} V${f(win.y + win.h * 0.7)}Z" fill="${K10.warmL}" opacity="0.85"/>`;
      gi += `<path d="M${f(win.x + win.w * 0.5)} ${f(win.y)} V${f(win.y + win.h * 0.08)}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/><circle cx="${f(win.x + win.w * 0.5)}" cy="${f(win.y + win.h * 0.11)}" r="${f(win.w * 0.04)}" fill="${K10.warm}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
    }
    const ms = win.h / 120;
    gi += `<line x1="${f(win.x + 6)}" y1="${f(win.y + win.h - 8)}" x2="${f(win.x + win.w - 6)}" y2="${f(win.y + win.h - 8)}" ${sk(0.7)}/>`;
    [0.2, 0.5, 0.8].forEach((u, i) => { gi += mannequin(win.x + win.w * u, win.y + win.h - 8, ms * (i === 1 ? 0.98 : 0.9), P.dress[i][0], P.dress[i][1]); });
    return gi;
  });
  s += `<rect x="${f(win.x - w * 0.02)}" y="${f(win.y + win.h)}" width="${f(win.w + w * 0.04)}" height="${f(h * 0.03)}" rx="4" fill="#FFFFFF" ${sk()}/>`;
  // puerta
  const open = clamp(o.open || 0);
  s += `<rect x="${f(door.x)}" y="${f(door.y)}" width="${f(door.w)}" height="${f(door.h + 10)}" rx="${f(door.w * 0.07)}" fill="${o.glow ? K10.warmL : '#3A2E2A'}" ${sk()}/>`;
  if (o.inside) s += o.inside(door);
  const lw = door.w * (1 - 0.8 * open);
  s += `<path d="M${f(door.x)} ${f(door.y)} L${f(door.x + lw)} ${f(door.y - 14 * open)} L${f(door.x + lw)} ${f(door.y + door.h + 10 + 14 * open)} L${f(door.x)} ${f(door.y + door.h + 10)}Z" fill="${P.sign}" ${sk()}/>`;
  if (open < 0.5) {
    s += `<rect x="${f(door.x + lw * 0.16)}" y="${f(door.y + door.w * 0.16)}" width="${f(lw * 0.68)}" height="${f(door.h * 0.46)}" rx="${f(door.w * 0.05)}" fill="${o.glow ? K10.warmL : C.glass}" ${sk(0.8)}/>`;
    s += `<path d="M${f(door.x + lw * 0.5)} ${f(door.y + door.w * 0.16 + SW)} l${f(lw * 0.18)} 0 l${f(-lw * 0.3)} ${f(door.h * 0.46 - 2 * SW)} l${f(-lw * 0.18)} 0Z" fill="#FFFFFF" opacity="0.5"/>`;
    s += `<circle cx="${f(door.x + lw * 0.82)}" cy="${f(door.y + door.h * 0.6)}" r="${f(door.w * 0.06)}" fill="${C.yel}" ${sk(0.7)}/>`;
  }
  return s;
}

/* ===================== TIENDAS DE CATEGORÍA (avenida) ===================== */
const ITEM10 = {
  cups: sw => `<path d="M14 92 H86" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>
    <path d="M18 56 H48 V80 Q48 90 38 90 H28 Q18 90 18 80Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/><path d="M48 62 Q58 62 58 70 Q58 78 48 78" fill="none" stroke="${INK}" stroke-width="${sw}"/>
    <path d="M26 46 Q22 40 27 34 M36 46 Q32 38 37 30" stroke="${INK}" stroke-width="${sw * 0.7}" fill="none" stroke-linecap="round"/>
    <path d="M58 64 H84 V82 Q84 90 76 90 H66 Q58 90 58 82Z" fill="${C.red}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/><path d="M58 70 H84" stroke="${C.cream}" stroke-width="${sw * 0.8}"/>`,
  books: sw => `<path d="M8 92 H92" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>
    <rect x="14" y="40" width="14" height="52" rx="2" fill="${C.red}" stroke="${INK}" stroke-width="${sw}"/><rect x="28" y="30" width="12" height="62" rx="2" fill="${C.yel}" stroke="${INK}" stroke-width="${sw}"/>
    <rect x="40" y="44" width="16" height="48" rx="2" fill="${C.green}" stroke="${INK}" stroke-width="${sw}"/><rect x="56" y="36" width="12" height="56" rx="2" fill="${C.navy}" stroke="${INK}" stroke-width="${sw}"/>
    <rect x="70" y="40" width="14" height="52" rx="2" transform="rotate(14 77 92)" fill="${C.pink}" stroke="${INK}" stroke-width="${sw}"/>
    <path d="M14 50 H28 M40 54 H56 M56 46 H68" stroke="${C.cream}" stroke-width="${sw * 0.7}"/>`
};
const CAT10 = {
  FLORES: { facade: '#DDF0E3', stripe: C.green, sign: '#2A7344', item: 'flowers' },
  ZAPATOS: { facade: '#FFF1C9', stripe: C.red, sign: C.dred, item: 'shoes' },
  CAFE: { facade: '#F7DCC0', stripe: C.wood, sign: '#7E5328', item: 'cups', label: 'CAFÉ' },
  LIBROS: { facade: C.navy, stripe: C.yel, sign: '#C99A1E', item: 'books' },
  PAN: { facade: C.cream, stripe: C.red, sign: C.red, item: 'bread' }
};
function catShop(x, base, w, h, key) {
  const P = CAT10[key], label = P.label || key, g = fashionGeo(x, base, w, h), { top, sy, sh, ay, ah, win, door } = g;
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="${P.facade}"/>`;
  s += `<rect x="${f(x + w * 0.9)}" y="${f(top + w * 0.02)}" width="${f(w * 0.1)}" height="${f(h + 30)}" fill="${INK}" opacity="0.16"/>`;
  s += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="none" ${sk()}/>`;
  const pw = w * 0.78, sd = Math.max(5, w * 0.014);
  s += `<rect x="${f(x + (w - pw) / 2 + sd)}" y="${f(sy + sd)}" width="${f(pw)}" height="${f(sh)}" rx="${f(sh * 0.25)}" fill="${INK}"/>`;
  s += `<rect x="${f(x + (w - pw) / 2)}" y="${f(sy)}" width="${f(pw)}" height="${f(sh)}" rx="${f(sh * 0.25)}" fill="${P.sign}" ${sk()}/>`;
  s += text(label, x + w / 2, sy + sh * 0.56, { size: fit(label, sh * 0.76, pw * 0.8, 'G'), font: 'G', fill: C.cream, sw: SW * 1.5, sd: 4, ls: 2 });
  s += awningC(x + w * 0.04, x + w * 0.96, x - w * 0.03, x + w * 1.03, ay, ah, 7, P.stripe);
  const item = ITEM10[P.item] ? ((X, Y, Wd, Hd) => unitBox(X, Y, Wd, Hd, ITEM10[P.item])) : itemFn(P.item);
  s += glassWindow(win.x, win.y, win.w, win.h, item);
  s += `<rect x="${f(win.x - w * 0.02)}" y="${f(win.y + win.h)}" width="${f(win.w + w * 0.04)}" height="${f(h * 0.03)}" rx="4" fill="#FFFFFF" ${sk()}/>`;
  s += `<rect x="${f(door.x)}" y="${f(door.y)}" width="${f(door.w)}" height="${f(door.h + 10)}" rx="${f(door.w * 0.07)}" fill="${P.sign}" ${sk()}/>`;
  s += `<rect x="${f(door.x + door.w * 0.16)}" y="${f(door.y + door.w * 0.16)}" width="${f(door.w * 0.68)}" height="${f(door.h * 0.46)}" rx="${f(door.w * 0.05)}" fill="${C.glass}" ${sk(0.8)}/>`;
  s += `<circle cx="${f(door.x + door.w * 0.82)}" cy="${f(door.y + door.h * 0.6)}" r="${f(door.w * 0.06)}" fill="${C.yel}" ${sk(0.7)}/>`;
  return s;
}
// planta superior con ventanas y jardineras (avenida)
function upperFloor(x, top, w, hh, col, flowers = true) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(hh + 20)}" fill="${col}" ${sk()}/>`;
  s += `<rect x="${f(x - 8)}" y="${f(top - 16)}" width="${f(w + 16)}" height="22" rx="6" fill="${C.cream}" ${sk()}/>`;
  [0.2, 0.6].forEach(u => {
    const wx = x + w * u, ww = w * 0.22, wy = top + hh * 0.2, wh = hh * 0.52;
    s += `<rect x="${f(wx)}" y="${f(wy)}" width="${f(ww)}" height="${f(wh)}" rx="6" fill="${C.glass}" ${sk(0.8)}/><path d="M${f(wx + ww / 2)} ${f(wy)} V${f(wy + wh)}" ${sk(0.6)}/>`;
    if (flowers) {
      s += `<rect x="${f(wx - 6)}" y="${f(wy + wh - 4)}" width="${f(ww + 12)}" height="16" rx="4" fill="${C.wood}" ${sk(0.7)}/>`;
      for (let i = 0; i < 3; i++) s += `<circle cx="${f(wx + ww * (0.15 + i * 0.35))}" cy="${f(wy + wh - 8)}" r="9" fill="${[C.red, C.yel, C.pink][i]}" ${sk(0.6)}/>`;
    }
  });
  return s;
}

/* ===================== AVENIDA DE CARMEN ===================== */
const AV = { base: 1150, h: 500, up: 150, carmen: { x: 375, w: 330 } };
const AV_SHOPS = [
  { x: -905, w: 300, k: 'CAFE', up: '#F2C12E' }, { x: -585, w: 300, k: 'PAN', up: '#FDE3EC' }, { x: -265, w: 300, k: 'FLORES', up: '#BFE3F2' },
  { x: 55, w: 300, k: 'ZAPATOS', up: C.pink }, { x: 375, w: 330, k: 'MODA', up: '#FDE3EC' }, { x: 725, w: 300, k: 'CAFE', up: '#DDF0E3' },
  { x: 1045, w: 300, k: 'LIBROS', up: '#FFF1C9' }, { x: 1365, w: 300, k: 'FLORES', up: '#F2B5AD' }, { x: 1685, w: 300, k: 'PAN', up: '#BFE3F2' }
];
const AV_CLOUDS = [{ x0: 60, y: 120, s: 0.85, v: 16 }, { x0: 520, y: 300, s: 0.7, v: 11 }, { x0: 980, y: 160, s: 0.95, v: 20 }, { x0: 1420, y: 380, s: 0.6, v: 9 }, { x0: 1850, y: 230, s: 0.75, v: 14 }];
function avClouds(T) {
  let s = '';
  const span = 3000;
  AV_CLOUDS.forEach(c => { const x = (((c.x0 - c.v * T) % span) + span) % span - 900; s += cloud(x, c.y, c.s); });
  return s;
}
function lampPost10(x, base, top) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  return `<rect x="${f(x - 8 + 6)}" y="${f(top)}" width="16" height="${f(base - top)}" fill="${INK}"/><rect x="${f(x - 8)}" y="${f(top)}" width="16" height="${f(base - top)}" rx="6" fill="${C.navy}" ${sk()}/>
    <rect x="${f(x - 22)}" y="${f(base - 30)}" width="44" height="34" rx="8" fill="${C.navy}" ${sk()}/>
    <path d="M${f(x - 26)} ${f(top)} H${f(x + 26)} L${f(x + 16)} ${f(top - 46)} H${f(x - 16)}Z" fill="${C.cream}" ${sk()}/><path d="M${f(x - 32)} ${f(top - 46)} H${f(x + 32)} L${f(x)} ${f(top - 70)}Z" fill="${C.navy}" ${sk()}/>`;
}
function pennants(x1, y1, x2, y2, sag, T, n = 9) {
  const sk = `stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linejoin="round"`;
  const P = u => [lerp(x1, x2, u), lerp(y1, y2, u) + sag * 4 * u * (1 - u)];
  let d = '';
  for (let i = 0; i <= 20; i++) { const p = P(i / 20); d += (i ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1]); }
  let s = `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
  const cols = [C.red, C.yel, C.blue, C.green, C.pink];
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n, a = P(u - 0.4 / n), b = P(u + 0.4 / n), m = P(u), sw_ = 4 * Math.sin(T * 3 + i);
    s += `<path d="M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])} L${f(m[0] + sw_)} ${f(m[1] + 46)}Z" fill="${cols[i % 5]}" ${sk}/>`;
  }
  return s;
}
function tree10(x, base, r) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  const top = base - r * 2.6;
  let a = '';
  [[0, -r * 0.2, r], [-r * 0.62, r * 0.25, r * 0.68], [r * 0.62, r * 0.25, r * 0.68]].forEach(([dx, dy, rr]) => { a += `<circle cx="${f(x + dx)}" cy="${f(top + dy)}" r="${f(rr)}"/>`; });
  return `<rect x="${f(x - 12)}" y="${f(top)}" width="24" height="${f(base - top)}" rx="8" fill="${C.wood}" ${sk()}/>
    <g fill="${INK}" stroke="${INK}" stroke-width="${f(SW * 2)}" transform="translate(9 9)">${a}</g><g fill="${INK}" stroke="${INK}" stroke-width="${f(SW * 2)}">${a}</g><g fill="${C.green}">${a}</g>
    <circle cx="${f(x - r * 0.3)}" cy="${f(top - r * 0.5)}" r="${f(r * 0.16)}" fill="#FFFFFF" opacity="0.45"/>
    <ellipse cx="${f(x)}" cy="${f(base + 4)}" rx="46" ry="12" fill="${C.wood}" ${sk(0.8)}/>`;
}
function bench10(x, y, w) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  return `<rect x="${f(x - w / 2 + 20)}" y="${f(y - 20)}" width="14" height="80" fill="${INK}"/><rect x="${f(x + w / 2 - 34)}" y="${f(y - 20)}" width="14" height="80" fill="${INK}"/>
    <rect x="${f(x - w / 2)}" y="${f(y - 110)}" width="${f(w)}" height="30" rx="8" fill="${C.wood}" ${sk()}/><rect x="${f(x - w / 2)}" y="${f(y - 60)}" width="${f(w)}" height="32" rx="8" fill="#C98A4B" ${sk()}/>`;
}
// fondo completo de la avenida en coordenadas de mundo (sin gente). o.carmenDoor(door) dibuja en la puerta
function avenueBack(T, o = {}) {
  const b = AV.base, top = b - AV.h;
  let s = `<rect x="-1400" y="-1200" width="4000" height="4000" fill="${C.sky}"/><rect x="-1400" y="300" width="4000" height="1000" fill="${C.skyL}"/>`;
  s += sun(o.sunX || 930, o.sunY || 250, 62, T * 12);
  s += avClouds(T);
  AV_SHOPS.forEach(sh => {
    s += upperFloor(sh.x + 10, top - AV.up, sh.w - 20, AV.up, sh.up, true);
    if (sh.k === 'MODA') s += fashionShop(sh.x, b, sh.w, AV.h, PINK_SHOP, { inside: o.carmenDoor });
    else s += catShop(sh.x, b, sh.w, AV.h, sh.k);
  });
  // acera
  s += `<rect x="-1400" y="${b}" width="4000" height="2000" fill="${C.ground}"/>`;
  for (let x = -1400; x < 2600; x += 180) s += `<line x1="${x}" y1="${b}" x2="${x - 140}" y2="${b + 1400}" stroke="${INK}" stroke-width="${f(SW * 0.5)}" opacity="0.5"/>`;
  [1330, 1560].forEach(y => { s += `<line x1="-1400" y1="${y}" x2="2600" y2="${y}" stroke="${INK}" stroke-width="${f(SW * 0.5)}" opacity="0.5"/>`; });
  s += `<line x1="-1400" y1="${b}" x2="2600" y2="${b}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  // farolas con banderines
  const lamps = [-595, -275, 45, 715, 1035, 1355, 1675];
  const lt = top - AV.up - 60;
  lamps.forEach((x, i) => { if (i < lamps.length - 1) s += pennants(x, lt + 6, lamps[i + 1], lt + 6, 70, T, 8); });
  lamps.forEach(x => { s += lampPost10(x, b + 30, lt); });
  // árboles
  [-420, 210, 880, 1520].forEach(x => { s += tree10(x, b + 40, 78); });
  return s;
}
const AV_FG = (T) => bench10(300, 1640, 280) + bench10(880, 1660, 280);

/* ---------- gente de la avenida ---------- */
// spec: {i, foot, sc, v (px/s, signo = dirección), x0, bag: color|null, phone: bool}
const WALKERS = [
  { i: 3, foot: 1285, sc: 1.95, v: 150, x0: -200, bag: C.red }, { i: 6, foot: 1290, sc: 1.95, v: -135, x0: 1100, bag: null, phone: true },
  { i: 4, foot: 1345, sc: 2.05, v: 175, x0: 300 }, { i: 9, foot: 1340, sc: 2.05, v: -165, x0: 660, bag: C.yel },
  { i: 1, foot: 1400, sc: 2.15, v: 200, x0: -40, phone: true }, { i: 12, foot: 1405, sc: 2.15, v: -190, x0: 880, bag: C.green },
  { i: 10, foot: 1280, sc: 1.95, v: 140, x0: 820, bag: C.blue }, { i: 11, foot: 1350, sc: 2.05, v: -150, x0: 1350 },
  { i: 7, foot: 1398, sc: 2.15, v: 180, x0: 1250, bag: C.pink }, { i: 13, foot: 1282, sc: 1.95, v: -145, x0: 240, phone: true },
  { i: 0, foot: 1342, sc: 2.0, v: 95, x0: 1000 }, { i: 15, foot: 1408, sc: 2.15, v: -175, x0: 150, bag: C.red },
  { i: 5, foot: 1284, sc: 1.85, v: 160, x0: 520 }, { i: 8, foot: 1348, sc: 2.0, v: -110, x0: -150, bag: C.yel }
];
const WRAP = [-560, 1640];
const wrapX = x => { const span = WRAP[1] - WRAP[0]; return ((((x - WRAP[0]) % span) + span) % span) + WRAP[0]; };
const walkerX = (wk_, t) => wrapX(wk_.x0 + wk_.v * t);
// mano con móvil (pantalla con la tarjeta de la tienda azul: vestido azul o «%»)
function phoneHand10(hx, hy, o = {}) {
  return w => {
    const rot = o.rot === undefined ? -12 : o.rot, sh = o.shake || 0, ps = o.ps || 1;
    let g = `<g transform="translate(${f(hx + 3 + sh)} ${f(hy - 13 * ps)}) rotate(${f(rot)}) scale(${f(ps)})">`;
    g += `<rect x="-10.5" y="-18" width="21" height="36" rx="3.6" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/>`;
    if (o.lit) {
      g += `<rect x="-8.3" y="-15.4" width="16.6" height="31" rx="2" fill="${C.cream}"/><rect x="-8.3" y="-15.4" width="16.6" height="6" fill="${C.red}"/><circle cx="-4.6" cy="-12.4" r="1.9" fill="#FFFFFF"/>`;
      g += `<rect x="-6.8" y="-6.6" width="13.6" height="19" rx="1.6" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(0.9)}"/>`;
      g += `<path d="M-6.8 -6.6 h13.6 v2.6 h-13.6z" fill="${C.blue}"/>`;
      if ((o.card || 0) % 2 === 0) g += `<rect x="-5.4" y="-3" width="10.8" height="9" rx="1" fill="${C.glass}" stroke="${INK}" stroke-width="${w(0.6)}"/><path d="M-1.8 -2 h3.6 l2 7 h-7.6z" fill="${C.blue}" stroke="${INK}" stroke-width="${w(0.6)}" stroke-linejoin="round"/>`;
      else g += `<rect x="-5.4" y="-3" width="10.8" height="9" rx="1" fill="#FDE3EC" stroke="${INK}" stroke-width="${w(0.6)}"/><circle cx="0" cy="1.5" r="3.4" fill="${C.red}" stroke="${INK}" stroke-width="${w(0.6)}"/><path d="M-1.3 3 L1.3 0" stroke="#FFFFFF" stroke-width="${w(0.7)}" stroke-linecap="round"/>`;
      g += `<rect x="-5.6" y="7.6" width="11.2" height="3.6" rx="1.8" fill="${C.red}" stroke="${INK}" stroke-width="${w(0.5)}"/>`;
    } else g += `<rect x="-8.3" y="-15.4" width="16.6" height="31" rx="2" fill="${C.glass}"/>`;
    g += `</g><circle cx="${hx}" cy="${hy}" r="4.3" fill="${o.skin || C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
    return g;
  };
}
// persona de la calle: o = {flip, expr, look, head, armF, armB, legF, legB, bob, phone:{lit,card,shake,rot}|null, bag}
function walkerSvg(wk_, x, o) {
  const p = FOLK[wk_.i], s = wk_.sc * (p.scale || 1);
  const oo = Object.assign({}, o);
  if (o.phone) oo.handF = phoneHand10(202.5, 139.5, Object.assign({ skin: p.skin }, o.phone));
  if (o.bag) oo.handB = w => bagHang(o.bag, 1)(w, 177.5, 139.5);
  const svg = placeFolk(wk_.i, x, wk_.foot, wk_.sc, oo);
  const armF = o.armF || 0, a = armF * PI / 180, hx = 202 - 31.5 * Math.sin(a), hy = 108 + 31.5 * Math.cos(a);
  return { svg: shadowEll(x, wk_.foot, 26 * s) + svg, phone: toWorld(x, wk_.foot, 190, 204, s, hx + 3, hy - 13, o.flip), head: toWorld(x, wk_.foot, 190, 204, s, 192, 60, o.flip) };
}
// paso normal: pose de caminar con mirada de reojo a la tienda de Carmen
function walkerPose(wk_, x, t, n, glanceC = 540) {
  const wp = walkPose(2 * PI * t / 0.78 + n * 1.3, 0.8);
  const near = Math.abs(x - glanceC) < 190;
  const g = near ? Math.sin(PI * clamp((190 - Math.abs(x - glanceC)) / 190)) : 0;
  const o = { flip: wk_.v < 0, expr: g > 0.3 ? 'meh' : 'happy', look: [0.4 * (1 - g), -1.4 * g], head: -5 * g, armF: wp.armF * 0.8, armB: wp.armB, legF: wp.legF, legB: wp.legB, bob: wp.bob };
  if (wk_.phone) { o.phone = { lit: false }; o.armF = -40; }
  if (wk_.bag) { o.bag = wk_.bag; o.armB = wp.armB * 0.4; }
  return o;
}

/* ===================== CALLEJUELA DE MARÍA ===================== */
const AL = { base: 1300, shopH: 420, maria: { x: 400, w: 350 } };
const AL_BLD = [
  { x: -620, w: 470, roof: 330, col: '#B7A89A', shop: 'closed', sc: '#A49A8E' },
  { x: -140, w: 420, roof: 300, col: '#C9B8A6', shop: 'closed', sc: '#9FA7A3' },
  { x: 390, w: 370, roof: 270, col: '#D2C1AC', shop: 'maria' },
  { x: 770, w: 380, roof: 320, col: '#A9B2B0', shop: 'closed', sc: '#B9A99A' },
  { x: 1160, w: 470, roof: 290, col: '#BDAE9C', shop: 'closed', sc: '#A0A8A6' }
];
function alleySky(T) {
  let s = `<rect x="-1400" y="-1200" width="4000" height="4000" fill="${K10.aSky}"/><rect x="-1400" y="160" width="4000" height="400" fill="${K10.aBand}"/>`;
  // 1 o 2 nubes gris azuladas
  [{ x0: 200, y: 120, s: 0.6, v: 8 }, { x0: 900, y: 70, s: 0.5, v: 6 }].forEach(c => {
    const x = (((c.x0 - c.v * T) % 2400) + 2400) % 2400 - 700;
    s += cloud(x, c.y, c.s, K10.aCloud);
  });
  return s;
}
function balcony(x, y, w) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = `<rect x="${f(x - 10)}" y="${f(y)}" width="${f(w + 20)}" height="16" rx="4" fill="#8F8579" ${sk(0.8)}/>`;
  s += `<path d="M${f(x - 6)} ${f(y - 62)} H${f(x + w + 6)}" ${sk(0.8)} stroke-linecap="round"/>`;
  for (let xx = x; xx <= x + w + 0.1; xx += w / 6) s += `<path d="M${f(xx)} ${f(y - 62)} V${f(y)}" stroke="${INK}" stroke-width="${f(SW * 0.55)}"/>`;
  return s;
}
function alleyHouse(b) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  const top = b.roof, bot = AL.base - AL.shopH;
  let s = `<rect x="${b.x}" y="${top}" width="${b.w}" height="${AL.base - top + 40}" fill="${b.col}" ${sk()}/>`;
  // alero y tejado
  s += `<path d="M${b.x - 24} ${top} H${b.x + b.w + 24} L${b.x + b.w + 6} ${top - 34} H${b.x - 6}Z" fill="#7A5A4A" ${sk()}/>`;
  for (let xx = b.x + 10; xx < b.x + b.w; xx += 36) s += `<path d="M${xx} ${top} V${top - 26}" stroke="${INK}" stroke-width="${f(SW * 0.4)}" opacity="0.6"/>`;
  // dos plantas de ventanas con contraventanas cerradas y balcones sin macetas
  const floors = 2, fh = (bot - top - 30) / floors;
  for (let j = 0; j < floors; j++) {
    const n = b.w > 400 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const ww = b.w * (n === 3 ? 0.18 : 0.24), wx = b.x + b.w * ((i + 0.5) / n) - ww / 2, wy = top + 40 + j * fh, wh = fh * 0.62;
      s += `<rect x="${f(wx)}" y="${f(wy)}" width="${f(ww)}" height="${f(wh)}" rx="4" fill="#6F7F8A" ${sk(0.8)}/>`;
      s += `<rect x="${f(wx + 4)}" y="${f(wy + 4)}" width="${f(ww / 2 - 6)}" height="${f(wh - 8)}" fill="#6E7F6B" ${sk(0.5)}/><rect x="${f(wx + ww / 2 + 2)}" y="${f(wy + 4)}" width="${f(ww / 2 - 6)}" height="${f(wh - 8)}" fill="#6E7F6B" ${sk(0.5)}/>`;
      for (let yy = wy + 18; yy < wy + wh - 8; yy += 16) s += `<path d="M${f(wx + 8)} ${f(yy)} H${f(wx + ww - 8)}" stroke="${INK}" stroke-width="${f(SW * 0.3)}" opacity="0.6"/>`;
      if (j === floors - 1 || i % 2 === 0) s += balcony(wx - 6, wy + wh + 6, ww + 12);
    }
  }
  s += `<rect x="${b.x}" y="${bot - 26}" width="${b.w}" height="22" fill="#8F8579" ${sk(0.8)}/>`;
  return s;
}
// persiana metálica bajada con grafiti sencillo
function shutter(x, y, w, h, seed = 0) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${K10.grey}" ${sk()}/>`;
  s += `<rect x="${f(x - 8)}" y="${f(y - 26)}" width="${f(w + 16)}" height="30" rx="6" fill="${K10.greyD}" ${sk()}/>`;
  for (let yy = y + 22; yy < y + h; yy += 22) s += `<path d="M${f(x + 3)} ${f(yy)} H${f(x + w - 3)}" stroke="${K10.greyD}" stroke-width="${f(SW * 0.6)}"/>`;
  s += `<rect x="${f(x + w / 2 - 22)}" y="${f(y + h - 22)}" width="44" height="12" rx="4" fill="${K10.greyD}" ${sk(0.6)}/>`;
  // grafiti: trazos curvos sin letras
  const gx = x + w * (0.2 + 0.2 * hash(seed)), gy = y + h * 0.42;
  s += `<path d="M${f(gx)} ${f(gy + 30)} q30 -70 60 -10 t60 -10 q20 40 60 -20" fill="none" stroke="${C.pink}" stroke-width="${f(SW * 1.8)}" stroke-linecap="round" opacity="0.8"/>`;
  s += `<path d="M${f(gx + 20)} ${f(gy + 70)} q40 30 90 -6 q30 -20 50 12" fill="none" stroke="${C.green}" stroke-width="${f(SW * 1.4)}" stroke-linecap="round" opacity="0.8"/>`;
  s += `<circle cx="${f(gx + 170)}" cy="${f(gy + 64)}" r="14" fill="none" stroke="${C.yel}" stroke-width="${f(SW * 1.2)}" opacity="0.8"/>`;
  return s;
}
function seAlquila(cx, cy, wd) {
  const ht = wd * 0.5;
  return `<rect x="${f(cx - wd / 2)}" y="${f(cy - ht / 2)}" width="${f(wd)}" height="${f(ht)}" rx="6" fill="#FFFFFF" stroke="${C.red}" stroke-width="${f(SW * 0.9)}"/>` +
    `<rect x="${f(cx - wd / 2)}" y="${f(cy - ht / 2)}" width="${f(wd)}" height="${f(ht)}" rx="6" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/>` +
    text('SE', cx, cy - ht * 0.2, { size: fit('SE', ht * 0.34, wd * 0.8, 'G'), font: 'G', fill: C.red, stroke: null, shadow: false, ls: 2 }) +
    text('ALQUILA', cx, cy + ht * 0.2, { size: fit('ALQUILA', ht * 0.36, wd * 0.84, 'G'), font: 'G', fill: C.red, stroke: null, shadow: false, ls: 1 });
}
function mailbox(x, y) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  return `<rect x="${f(x - 6)}" y="${f(y - 46)}" width="22" height="26" fill="${INK}" opacity="0"/>
    <path d="M${f(x - 8)} ${f(y - 26)} l10 -26 l12 4 l-8 24Z" fill="#FFFFFF" ${sk(0.6)}/><path d="M${f(x + 10)} ${f(y - 24)} l14 -22 l10 6 l-12 18Z" fill="${C.yel}" ${sk(0.6)}/>
    <path d="M${f(x + 26)} ${f(y - 24)} l4 -24 l12 2 l-4 22Z" fill="#F2B5AD" ${sk(0.6)}/>
    <rect x="${f(x - 20)}" y="${f(y - 28)}" width="74" height="60" rx="6" fill="#7A6B5E" ${sk()}/><rect x="${f(x - 10)}" y="${f(y - 20)}" width="54" height="8" rx="3" fill="${INK}"/>
    <path d="M${f(x - 14)} ${f(y + 32)} l-6 30 l14 -2Z" fill="#FFFFFF" ${sk(0.6)}/>`;
}
function leaf(x, y, r, rot) {
  return `<path d="M${f(x - r)} ${f(y)} Q${f(x)} ${f(y - r * 0.7)} ${f(x + r)} ${f(y)} Q${f(x)} ${f(y + r * 0.7)} ${f(x - r)} ${f(y)}Z" transform="rotate(${rot} ${f(x)} ${f(y)})" fill="#A9743F" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/>`;
}
function closedShop(x, base, w, h, col, seed = 0) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  const top = base - h;
  let s = `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" fill="${col}" ${sk()}/>`;
  // rótulo vacío y desvaído
  s += `<rect x="${f(x + w * 0.1)}" y="${f(top + 18)}" width="${f(w * 0.8)}" height="${f(h * 0.13)}" rx="10" fill="#8F8579" ${sk()}/>`;
  // persiana bajada (escaparate) y puerta con cristal y cartel SE ALQUILA
  const sx = x + w * 0.06, sw_ = w * 0.56, sy = top + h * 0.26;
  s += shutter(sx, sy, sw_, base - sy, seed);
  const dx = x + w * 0.68, dw = w * 0.26, dy = top + h * 0.24;
  s += `<rect x="${f(dx)}" y="${f(dy)}" width="${f(dw)}" height="${f(base - dy + 10)}" rx="8" fill="#5E5A57" ${sk()}/>`;
  s += `<rect x="${f(dx + dw * 0.14)}" y="${f(dy + dw * 0.14)}" width="${f(dw * 0.72)}" height="${f((base - dy) * 0.5)}" rx="6" fill="#8FA6B2" ${sk(0.8)}/>`;
  s += seAlquila(dx + dw / 2, dy + dw * 0.14 + (base - dy) * 0.25, dw * 0.66);
  s += mailbox(x + w * 0.06 + sw_ * 0.08 + 0, top + h * 0.17 + 30 > sy ? sy - 50 : top + h * 0.17 + 30);
  // hojas secas en la puerta
  for (let i = 0; i < 6; i++) s += leaf(dx + dw * (0.1 + hash(seed * 9 + i) * 0.9), base + 6 + hash(i * 3 + seed) * 14, 10 + hash(i + seed * 2) * 5, hash(i * 7 + seed) * 180);
  return s;
}
function wallLamp(x, y, dir = 1) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  return `<path d="M${f(x)} ${f(y)} H${f(x + dir * 70)} V${f(y + 20)}" fill="none" ${sk(1.1)}/>
    <path d="M${f(x + dir * 70 - 24)} ${f(y + 20)} H${f(x + dir * 70 + 24)} L${f(x + dir * 70 + 14)} ${f(y + 60)} H${f(x + dir * 70 - 14)}Z" fill="${K10.warm}" ${sk()}/>
    <path d="M${f(x + dir * 70 - 30)} ${f(y + 20)} H${f(x + dir * 70 + 30)} L${f(x + dir * 70)} ${f(y)}Z" fill="${C.navy}" ${sk()}/>`;
}
function lampLight(x, y, dir = 1) {
  const cx = x + dir * 70;
  return `<path d="M${f(cx - 14)} ${f(y + 60)} H${f(cx + 14)} L${f(cx + 140)} ${f(AL.base + 60)} H${f(cx - 140)}Z" fill="${K10.warm}" opacity="0.22"/>`;
}
function dumpster(x, base) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  return `<rect x="${x + 10}" y="${base - 190}" width="200" height="190" fill="${INK}"/>
    <path d="M${x} ${base - 180} H${x + 200} L${x + 190} ${base - 10} H${x + 10}Z" fill="#3C7A5A" ${sk()}/>
    <path d="M${x - 8} ${base - 180} H${x + 208} L${x + 196} ${base - 214} H${x + 4}Z" fill="#2E5F46" ${sk()}/>
    <path d="M${x + 30} ${base - 140} V${base - 40} M${x + 100} ${base - 140} V${base - 40} M${x + 170} ${base - 140} V${base - 40}" stroke="${INK}" stroke-width="${f(SW * 0.5)}" opacity="0.6"/>
    <circle cx="${x + 30}" cy="${base}" r="14" fill="${INK}"/><circle cx="${x + 170}" cy="${base}" r="14" fill="${INK}"/>`;
}
function cobbles(y0, x0 = -1400, x1 = 2600) {
  let s = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="2000" fill="${K10.cob}"/>`;
  for (let j = 0; j < 14; j++) {
    const y = y0 + 16 + j * 44 + j * j * 1.2, rh = 30 + j * 1.4, rw = 70 + j * 3;
    for (let x = x0 + (j % 2 ? rw / 2 : 0); x < x1; x += rw + 10) s += `<rect x="${f(x)}" y="${f(y)}" width="${f(rw)}" height="${f(rh)}" rx="${f(rh * 0.45)}" fill="none" stroke="${K10.cobS}" stroke-width="${f(SW * 0.7)}"/>`;
  }
  return s + `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
}
function puddle(x, y, rx) {
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(rx * 0.22)}" fill="#7E95A3" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>
    <path d="M${f(x - rx * 0.5)} ${f(y - rx * 0.05)} H${f(x - rx * 0.1)} M${f(x + rx * 0.1)} ${f(y + rx * 0.06)} H${f(x + rx * 0.45)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.6)}" opacity="0.6" stroke-linecap="round"/>`;
}
// gato sentado (x = centro de la base), mira a la izquierda/derecha
function cat(x, base, s, T, flip = false) {
  const sk = `stroke="${INK}" stroke-width="${f(2.6)}" stroke-linejoin="round"`;
  const tail = 10 * Math.sin(T * 1.8), bl = ((T + 0.4) % 3.4) < 0.14;
  const g = `<path d="M10 0 Q40 ${f(-4 + tail * 0.3)} 44 ${f(-26 + tail)} Q46 ${f(-36 + tail)} 40 ${f(-38 + tail)}" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M10 0 Q40 ${f(-4 + tail * 0.3)} 44 ${f(-26 + tail)} Q46 ${f(-36 + tail)} 40 ${f(-38 + tail)}" fill="none" stroke="#6E6A6A" stroke-width="5.6" stroke-linecap="round"/>
    <path d="M-22 0 Q-26 -40 -12 -58 Q0 -66 12 -58 Q26 -40 22 0Z" fill="#6E6A6A" ${sk}/>
    <path d="M-16 -64 L-20 -92 L-4 -76Z M16 -64 L20 -92 L4 -76Z" fill="#6E6A6A" ${sk}/>
    <circle cx="0" cy="-70" r="18" fill="#6E6A6A" ${sk}/>
    <path d="M-14 -66 L-18 -88 L-5 -78Z M14 -66 L18 -88 L5 -78Z" fill="#6E6A6A" ${sk}/>
    ${bl ? `<path d="M-11 -72 H-3 M3 -72 H11" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>` : `<ellipse cx="-7" cy="-72" rx="3.6" ry="4.2" fill="${K10.warm}" stroke="${INK}" stroke-width="1.6"/><ellipse cx="7" cy="-72" rx="3.6" ry="4.2" fill="${K10.warm}" stroke="${INK}" stroke-width="1.6"/><path d="M-7 -75 V-69 M7 -75 V-69" stroke="${INK}" stroke-width="1.8"/>`}
    <path d="M-2 -64 h4 l-2 2.6z" fill="${C.pink}"/><path d="M-6 -60 Q0 -56 6 -60 M-12 -63 H-24 M12 -63 H24" stroke="${INK}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M-10 0 V-14 M10 0 V-14" stroke="${INK}" stroke-width="1.8"/>`;
  return `<g transform="translate(${f(x)} ${f(base)}) scale(${f(flip ? -s : s)} ${f(s)})">${g}</g>`;
}
// fondo de la callejuela (mundo). o.mariaDoor(door) dibuja en la puerta; o.passage(x, y, w, h) dibuja en el pasaje
function alleyBack(T, o = {}) {
  const b = AL.base;
  let s = alleySky(T);
  // pasaje estrecho entre casas (al fondo se ve otra calle algo más clara)
  const pg = { x: 280, y: 640, w: 110, h: b - 640 };
  s += `<rect x="${pg.x}" y="${pg.y}" width="${pg.w}" height="${pg.h}" fill="#8C9AA3"/><rect x="${pg.x}" y="${b - 120}" width="${pg.w}" height="120" fill="${K10.cobS}"/>`;
  if (o.passage) { const id = 'pg' + (uid++); s += `<clipPath id="${id}"><rect x="${pg.x}" y="${pg.y}" width="${pg.w}" height="${pg.h}"/></clipPath><g clip-path="url(#${id})">${o.passage(pg)}</g>`; }
  s += `<rect x="${pg.x}" y="${pg.y}" width="${pg.w}" height="${pg.h}" fill="${K10.shade}" opacity="0.35"/>`;
  AL_BLD.forEach(bd => { s += alleyHouse(bd); });
  // cuerda con una sola sábana entre las casas
  const y1 = 520, y2 = 500;
  s += `<path d="M150 ${y1} Q560 ${y1 + 70} 980 ${y2}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
  const sh = 4 * Math.sin(T * 1.4);
  s += `<path d="M470 ${y1 + 52} L640 ${y1 + 58} L${f(636 + sh)} ${y1 + 230} Q600 ${f(y1 + 240 + sh)} 560 ${y1 + 228} Q520 ${f(y1 + 238 - sh)} ${f(478 + sh)} ${y1 + 226}Z" fill="#F4EFE8" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
  s += `<rect x="478" y="${y1 + 46}" width="10" height="20" rx="3" fill="${C.wood}" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/><rect x="620" y="${y1 + 50}" width="10" height="20" rx="3" fill="${C.wood}" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/>`;
  // planta baja: tiendas cerradas y la de María
  AL_BLD.forEach((bd, i) => {
    if (bd.shop === 'closed') s += closedShop(bd.x + 10, b, bd.w - 20, AL.shopH, bd.sc, i + 1);
  });
  s += wallLamp(770, 820, -1);
  // suelo de adoquines, charco y contenedor
  s += cobbles(b);
  s += puddle(200, b + 110, 120);
  s += dumpster(880, b + 40);
  // sombra dura plana (#2D4A6B al 35 %) en fachadas y suelo
  s += `<path d="M-1400 -100 H2600 V${b + 2000} H-1400Z" fill="${K10.shade}" opacity="0.35"/>`;
  s += `<path d="M-1400 ${b + 2000} L-1400 300 L120 300 L760 ${b + 2000}Z" fill="${K10.shade}" opacity="0.35"/>`;
  s += `<path d="M2600 600 L1150 600 L980 ${b} L1400 ${b + 2000} H2600Z" fill="${K10.shade}" opacity="0.35"/>`;
  // luz plana de la farola
  s += lampLight(770, 820, -1);
  // tienda de María: único punto de color (por encima de la sombra) y su charco de luz cálida en el suelo
  const m = AL.maria;
  s += fashionShop(m.x, b, m.w, AL.shopH, BLUE_SHOP, { glow: true, inside: o.mariaDoor });
  const g = fashionGeo(m.x, b, m.w, AL.shopH);
  s += `<path d="M${f(g.win.x)} ${b + 4} H${f(g.door.x + g.door.w)} L${f(g.door.x + g.door.w + 170)} ${b + 330} H${f(g.win.x - 170)}Z" fill="${K10.warm}" opacity="0.42"/>`;
  s += `<path d="M${f(g.win.x + 20)} ${b + 4} H${f(g.win.x + g.win.w - 20)} L${f(g.win.x + g.win.w + 30)} ${b + 160} H${f(g.win.x - 30)}Z" fill="${K10.warmL}" opacity="0.5"/>`;
  return s;
}

/* ===================== INTERIOR DE LA TIENDA DE MARÍA ===================== */
function hanger(x, y, col, colS, s = 1, kind = 0) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let g = `<path d="M${f(x)} ${f(y)} q8 -2 6 -10 q-2 -8 -10 -6" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.7)}" stroke-linecap="round"/>`;
  if (kind === 0) g += `<path d="M${f(x - 34 * s)} ${f(y + 16 * s)} L${f(x)} ${f(y + 4 * s)} L${f(x + 34 * s)} ${f(y + 16 * s)} L${f(x + 30 * s)} ${f(y + 120 * s)} H${f(x - 30 * s)}Z" fill="${col}" ${sk(0.9)}/><path d="M${f(x - 34 * s)} ${f(y + 16 * s)} L${f(x - 12 * s)} ${f(y + 8 * s)} L${f(x - 14 * s)} ${f(y + 120 * s)} H${f(x - 30 * s)}Z" fill="${colS}"/><path d="M${f(x - 10 * s)} ${f(y + 6 * s)} L${f(x)} ${f(y + 22 * s)} L${f(x + 10 * s)} ${f(y + 6 * s)}" fill="none" ${sk(0.7)}/>`;
  else g += `<path d="M${f(x - 22 * s)} ${f(y + 10 * s)} L${f(x)} ${f(y + 4 * s)} L${f(x + 22 * s)} ${f(y + 10 * s)} L${f(x + 18 * s)} ${f(y + 50 * s)} L${f(x + 42 * s)} ${f(y + 150 * s)} H${f(x - 42 * s)} L${f(x - 18 * s)} ${f(y + 50 * s)}Z" fill="${col}" ${sk(0.9)}/><path d="M${f(x - 18 * s)} ${f(y + 50 * s)} H${f(x + 18 * s)}" ${sk(0.6)}/>`;
  return g;
}
function rack(x0, x1, y, base, clothes) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = `<path d="M${x0} ${base} V${y} H${x1} V${base}" fill="none" stroke="${INK}" stroke-width="${f(SW * 2.4)}" stroke-linecap="round"/><path d="M${x0} ${base} V${y} H${x1} V${base}" fill="none" stroke="#C9CDD2" stroke-width="${f(SW * 1)}" stroke-linecap="round"/>`;
  s += `<path d="M${x0 - 40} ${base} H${x0 + 40} M${x1 - 40} ${base} H${x1 + 40}" stroke="${INK}" stroke-width="${f(SW * 1.6)}" stroke-linecap="round"/>`;
  const n = clothes.length;
  clothes.forEach((c, i) => { s += hanger(lerp(x0 + 50, x1 - 50, n > 1 ? i / (n - 1) : 0.5), y + 4, c[0], c[1], 1, c[2] || 0); });
  return s;
}
function mirror10(x, y, wd, ht) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  return `<rect x="${x + 10}" y="${y + 10}" width="${wd}" height="${ht}" rx="${wd / 2}" fill="${INK}"/><rect x="${x}" y="${y}" width="${wd}" height="${ht}" rx="${wd / 2}" fill="${C.wood}" ${sk()}/>
    <rect x="${x + 18}" y="${y + 18}" width="${wd - 36}" height="${ht - 36}" rx="${wd / 2 - 18}" fill="${C.glass}" ${sk(0.8)}/>
    <path d="M${x + wd * 0.3} ${y + ht * 0.25} l${wd * 0.3} -${wd * 0.3} M${x + wd * 0.3} ${y + ht * 0.4} l${wd * 0.45} -${wd * 0.45}" stroke="#FFFFFF" stroke-width="${f(SW * 1.4)}" stroke-linecap="round" opacity="0.7"/>`;
}
function fittingRoom(x, y, wd, ht, T, feet = true) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = `<rect x="${x}" y="${y}" width="${wd}" height="${ht}" fill="#E7D9D3" ${sk()}/>`;
  s += `<rect x="${x - 20}" y="${y - 20}" width="${wd + 40}" height="26" rx="10" fill="${C.wood}" ${sk()}/>`;
  const sw_ = 6 * Math.sin(T * 1.3), cb = y + ht - 70;
  let d = `M${x + 6} ${y + 6}`;
  for (let i = 0; i <= 6; i++) d += ` Q${f(x + 6 + (i + 0.5) * (wd - 12) / 7)} ${y + 22} ${f(x + 6 + (i + 1) * (wd - 12) / 7)} ${y + 6}`;
  s += `<path d="M${x + 6} ${y + 6} H${x + wd - 6} L${f(x + wd - 6 + sw_)} ${cb} Q${x + wd / 2} ${f(cb + 14)} ${f(x + 6 + sw_ * 0.5)} ${cb}Z" fill="${C.blue}" ${sk()}/>`;
  for (let i = 1; i < 5; i++) s += `<path d="M${f(x + wd * i / 5)} ${y + 12} Q${f(x + wd * i / 5 + 8 + sw_ * 0.5)} ${f((y + cb) / 2)} ${f(x + wd * i / 5 + sw_)} ${cb - 4}" fill="none" stroke="${K10.blueS}" stroke-width="${f(SW * 0.9)}"/>`;
  for (let i = 0; i < 8; i++) s += `<circle cx="${f(x + 12 + i * (wd - 24) / 7)}" cy="${y - 7}" r="7" fill="${C.cream}" ${sk(0.5)}/>`;
  if (feet) s += `<path d="M${x + wd * 0.36} ${y + ht - 6} h34 a8 8 0 0 0 -8 -14 h-26z M${x + wd * 0.56} ${y + ht - 6} h34 a8 8 0 0 0 -8 -14 h-26z" fill="${C.red}" ${sk(0.8)}/><rect x="${x + wd * 0.38}" y="${cb + 8}" width="14" height="${ht - 92}" fill="${C.skin}" ${sk(0.6)}/><rect x="${x + wd * 0.58}" y="${cb + 8}" width="14" height="${ht - 92}" fill="${C.skin}" ${sk(0.6)}/>`;
  return s;
}
// puerta del interior: se ve la callejuela oscura y vacía
function alleyDoor(x, y, w, h, T) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  const id = 'ad' + (uid++);
  let s = `<rect x="${x - 16}" y="${y - 16}" width="${w + 32}" height="${h + 16}" rx="12" fill="${C.navy}" ${sk()}/>`;
  s += `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${K10.aSky}"/>`;
  s += `<rect x="${x - 20}" y="${y + 60}" width="${w * 0.6}" height="${h}" fill="#B7A89A" ${sk()}/><rect x="${x + w * 0.45}" y="${y + 30}" width="${w * 0.8}" height="${h}" fill="#A9B2B0" ${sk()}/>`;
  s += shutter(x + w * 0.52, y + h * 0.42, w * 0.5, h * 0.5, 3);
  s += `<rect x="${x}" y="${y + h * 0.86}" width="${w}" height="${h}" fill="${K10.cob}"/><line x1="${x}" y1="${y + h * 0.86}" x2="${x + w}" y2="${y + h * 0.86}" ${sk()}/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${K10.shade}" opacity="0.5"/>`;
  s += `</g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" ${sk()}/>`;
  return s;
}
const MI = { floor: 1400, door: { x: 50, y: 700, w: 220, h: 700 } };
function mariaInterior(T, o = {}) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = dotWall();
  s += `<rect x="-20" y="${MI.floor}" width="${W + 40}" height="${H}" fill="${C.wood}"/>`;
  for (let i = 0; i < 8; i++) s += `<line x1="${-40 + i * 180}" y1="${MI.floor}" x2="${-200 + i * 180}" y2="${H}" ${sk(0.5)}/>`;
  s += `<line x1="-20" y1="${MI.floor}" x2="${W + 20}" y2="${MI.floor}" ${sk()}/>`;
  if (o.door !== false) s += alleyDoor(MI.door.x, MI.door.y, MI.door.w, MI.door.h, T);
  if (o.sign !== false) s += shopSignMODA(o.signX || 640, o.signY || 330, 400, 120);
  s += lamp(o.lampX || 540, 210, 1.2 * Math.sin(T * 1.6));
  return s;
}
function shopSignMODA(x, y, wd, ht) {
  let g = `<path d="M${f(x - wd * 0.3)} ${f(y - ht / 2 - 70)} L${f(x - wd * 0.3)} ${f(y - ht / 2)} M${f(x + wd * 0.3)} ${f(y - ht / 2 - 70)} L${f(x + wd * 0.3)} ${f(y - ht / 2)}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  g += `<rect x="${f(x - wd / 2 + 10)}" y="${f(y - ht / 2 + 10)}" width="${wd}" height="${ht}" rx="22" fill="${INK}"/>`;
  g += `<rect x="${f(x - wd / 2)}" y="${f(y - ht / 2)}" width="${wd}" height="${ht}" rx="22" fill="${C.navy}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  g += text('MODA', x, y + 4, { size: fit('MODA', ht * 0.66, wd - 80), fill: C.cream, sw: SW * 1.6, sd: 4, ls: 8 });
  return g;
}

/* ===================== TARJETAS «NOVEDAD» Y «OFERTA» ===================== */
// tarjeta vertical (centrada en 0,0; 420 x 330): franja roja con el logo, toldillo azul de la tienda,
// ilustración, sello rojo y etiqueta. i = 0 Novedad (vestido azul nuevo), 1 Oferta (cartel rojo con «%»)
function dressIcon(x, y, s, t = 0) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v / s)}" stroke-linejoin="round"`;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)}) rotate(${f(3 * Math.sin(t * 2.4))} 0 -60)">
    <path d="M0 -66 q8 0 7 -7 q-1 -6 -7 -4" fill="none" ${sk(0.8)} stroke-linecap="round"/>
    <path d="M-26 -50 L0 -62 L26 -50" fill="none" ${sk(0.9)} stroke-linecap="round"/>
    <path d="M-14 -52 Q0 -44 14 -52 L22 -34 L14 -28 L34 46 Q0 56 -34 46 L-14 -28 L-22 -34Z" fill="${C.blue}" ${sk()}/>
    <path d="M-14 -52 Q-6 -48 -2 -47 L-4 -28 L-20 50 Q-28 48 -34 46 L-14 -28 L-22 -34Z" fill="${K10.blueS}"/>
    <path d="M-14 -52 Q0 -44 14 -52 L22 -34 L14 -28 L34 46 Q0 56 -34 46 L-14 -28 L-22 -34Z" fill="none" ${sk()}/>
    <path d="M-15 -24 Q0 -18 15 -24" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 1.1 / s)}" stroke-linecap="round"/>
    <circle cx="-8" cy="10" r="3" fill="#FFFFFF"/><circle cx="10" cy="22" r="3" fill="#FFFFFF"/><circle cx="-14" cy="34" r="3" fill="#FFFFFF"/><circle cx="16" cy="40" r="3" fill="#FFFFFF"/></g>`;
}
function offerSign(x, y, s, t = 0) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v / s)}" stroke-linejoin="round"`;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)}) rotate(${f(-6 + 3 * Math.sin(t * 2.2))})">
    <path d="M-30 -60 L0 -88 L30 -60" fill="none" ${sk(0.8)}/><circle cx="0" cy="-88" r="5" fill="${INK}"/>
    <rect x="-52" y="-60" width="104" height="110" rx="12" transform="translate(6 6)" fill="${INK}"/>
    <rect x="-52" y="-60" width="104" height="110" rx="12" fill="${C.red}" ${sk()}/>` +
    text('%', 0, -2, { size: 96, font: 'G', sw: SW * 1.6 / s * 1.2, sd: 4 }) + `</g>`;
}
const CARD10 = [{ label: 'NOVEDAD', bg: C.glass }, { label: 'OFERTA', bg: '#FDE3EC' }];
function card10Local(i, t = 0, o = {}) {
  const c = CARD10[i], Wd = 420, Hd = 330, x0 = -Wd / 2, y0 = -Hd / 2;
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  const id = 'cd' + (uid++);
  let g = `<rect x="${x0 + 12}" y="${y0 + 12}" width="${Wd}" height="${Hd}" rx="30" fill="${INK}"/>`;
  g += `<clipPath id="${id}"><rect x="${x0}" y="${y0}" width="${Wd}" height="${Hd}" rx="30"/></clipPath><g clip-path="url(#${id})">`;
  g += `<rect x="${x0}" y="${y0}" width="${Wd}" height="${Hd}" fill="#FFFFFF"/>`;
  // franja roja con el logo
  g += `<rect x="${x0}" y="${y0}" width="${Wd}" height="78" fill="${C.red}"/><line x1="${x0}" y1="${y0 + 78}" x2="${x0 + Wd}" y2="${y0 + 78}" ${sk()}/>`;
  g += `<circle cx="${x0 + 46}" cy="${y0 + 40}" r="28" fill="#FFFFFF" ${sk(0.8)}/>` + logoIcon(x0 + 46, y0 + 42, 50);
  g += text('Escaparate de Tudela', x0 + 86, y0 + 40, { size: fit('Escaparate de Tudela', 34, Wd - 110), anchor: 'start', sw: SW * 1.2, sd: 3 });
  // toldillo azul de la tienda de María
  for (let k = 0; k < 10; k++) g += `<rect x="${x0 + k * Wd / 10}" y="${y0 + 78}" width="${Wd / 10}" height="20" fill="${k % 2 ? C.cream : C.blue}"/>`;
  g += `<line x1="${x0}" y1="${y0 + 98}" x2="${x0 + Wd}" y2="${y0 + 98}" ${sk(0.7)}/>`;
  // ilustración
  const bx = x0 + 22, by = y0 + 116, bs = 192;
  g += `<rect x="${bx}" y="${by}" width="${bs}" height="${bs}" rx="24" fill="${c.bg}" ${sk(0.8)}/>`;
  if (i === 0) g += dressIcon(bx + bs / 2, by + bs / 2 + 8, 1.45, t);
  else g += offerSign(bx + bs / 2, by + bs / 2 + 20, 1.05, t);
  // etiqueta
  const tx = bx + bs + 98;
  g += `<rect x="${tx - 86 + 6}" y="${y0 + 196}" width="172" height="62" rx="31" fill="${INK}"/><rect x="${tx - 86}" y="${y0 + 190}" width="172" height="62" rx="31" fill="${C.navy}" ${sk()}/>`;
  g += text(c.label, tx, y0 + 222, { size: fit(c.label, 44, 150, 'G'), font: 'G', fill: '#FFFFFF', sw: SW * 1.2, sd: 3, ls: 2 });
  g += text('MODA', tx, y0 + 290, { size: 40, fill: C.blue, sw: SW * 1.1, sd: 3, ls: 3 });
  g += `</g><rect x="${x0}" y="${y0}" width="${Wd}" height="${Hd}" rx="30" fill="none" ${sk()}/>`;
  // sello rojo
  g += i === 0 ? sealStar(x0 + Wd - 52, y0 + 140, 46, 'NUEVO') : sealPct(x0 + Wd - 52, y0 + 140, 44, 1);
  if (o.done) g += checkCircle(bx + bs - 10, by + bs - 10, 32, o.done);
  return g;
}
function sealStar(x, y, r, label) {
  const d = starPath(r, r * 0.84, 16);
  return at(x, y, 1, `<path d="${d}" transform="translate(5 5)" fill="${INK}"/><path d="${d}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>` +
    text(label, 0, 3, { size: fit(label, r * 0.6, r * 1.5, 'G'), font: 'G', sw: SW * 1.1, sd: 2 }), -12);
}
const card10 = (i, x, y, k, rot, t, o) => at(x, y, k, card10Local(i, t, o), rot);

/* ===================== MARÍA EN PRIMER PLANO (escena 9) =====================
   Coordenadas propias: centro de la cara en (0,0), cabeza ~ 190 de ancho, cintura en y≈560.
   o: look [-1..1, -1..1], blink, wink (0..1), hand (0..1: mano junto a la boca), smile ('calm' | 'sly' | 'grin'), head (giro) */
function mariaBust(o = {}) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(v * 6)}" stroke-linejoin="round" stroke-linecap="round"`;
  const lx = (o.look ? o.look[0] : 0), ly = (o.look ? o.look[1] : 0), hr = o.head || 0;
  let s = '';
  // cuerpo: blusa y chaleco azul (subido para acortar el cuello)
  s += '<g transform="translate(0 -28)">';
  s += `<path d="M-250 600 Q-262 300 -200 220 Q-150 170 -60 158 H60 Q150 170 200 220 Q262 300 250 600Z" fill="#FFFFFF" ${sk()}/>`;
  const vest = 'M-250 600 Q-262 300 -200 220 Q-150 170 -78 160 L-40 280 L-30 600Z M250 600 Q262 300 200 220 Q150 170 78 160 L40 280 L30 600Z';
  s += `<path d="${vest}" fill="${C.blue}" ${sk()}/>`;
  s += `<path d="M-250 600 Q-262 300 -200 220 Q-170 194 -140 182 Q-180 300 -170 600Z" fill="${K10.blueS}"/>`;
  s += `<path d="${vest}" fill="none" ${sk()}/>`;
  s += `<path d="M-30 330 V600" ${sk(0.6)} opacity="0.5"/>`;
  [330, 410, 490].forEach(y => { s += `<circle cx="0" cy="${y}" r="9" fill="${C.cream}" ${sk(0.5)}/>`; });
  // cuello
  s += `<path d="M-46 90 V170 Q0 196 46 170 V90Z" fill="${C.skinS}" ${sk()}/>`;
  s += `<path d="M-66 152 L0 220 L-34 252 L-84 176Z M66 152 L0 220 L34 252 L84 176Z" fill="#FFFFFF" ${sk()}/>`;
  s += '</g>';
  // cabeza (con giro)
  let hd = '';
  hd += `<path d="M-118 -10 Q-128 -128 0 -132 Q128 -128 118 -10 L122 84 Q120 96 104 96 H-104 Q-120 96 -122 84Z" fill="${K10.mHair}" ${sk()}/>`;
  hd += `<ellipse cx="0" cy="0" rx="96" ry="108" fill="${C.skin}" ${sk()}/>`;
  // orejas asomando bajo la melena lisa (no) — flequillo ladeado
  hd += `<path d="M-106 74 Q-120 -122 6 -126 Q122 -122 108 52 Q104 -18 88 -48 Q72 -78 40 -80 Q-6 -46 -66 -30 Q-88 -10 -92 74Z" fill="${K10.mHair}" ${sk()}/>`;
  hd += `<path d="M26 -96 Q-14 -70 -62 -56" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" opacity="0.55"/>`;
  hd += `<path d="M-70 -98 Q-30 -116 20 -112" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" opacity="0.3"/>`;
  // ojos
  const eye = (cx, closed, wink) => {
    if (wink) return `<path d="M${cx - 20} 8 Q${cx} -10 ${cx + 20} 8" fill="none" ${sk(1)}/>`;
    if (closed) return `<path d="M${cx - 18} 6 Q${cx} 16 ${cx + 18} 6" fill="none" ${sk(0.9)}/>`;
    return `<ellipse cx="${cx}" cy="4" rx="16" ry="19" fill="#FFFFFF" ${sk(0.7)}/><circle cx="${f(cx + lx * 7)}" cy="${f(6 + ly * 6)}" r="10.5" fill="${INK}"/><circle cx="${f(cx + lx * 7 + 4)}" cy="${f(1 + ly * 6)}" r="4" fill="#FFFFFF"/>`;
  };
  const wk_ = (o.wink || 0) > 0.5;
  hd += eye(-38, o.blink, wk_) + eye(38, o.blink, false);
  // gafas rectangulares azul marino
  hd += `<rect x="-74" y="-22" width="70" height="52" rx="12" fill="#FFFFFF" fill-opacity="0.2" stroke="${K10.mFrame}" stroke-width="8"/>
    <rect x="4" y="-22" width="70" height="52" rx="12" fill="#FFFFFF" fill-opacity="0.2" stroke="${K10.mFrame}" stroke-width="8"/>
    <path d="M-4 0 Q0 -6 4 0 M-74 -8 L-94 -14 M74 -8 L94 -14" fill="none" stroke="${K10.mFrame}" stroke-width="8" stroke-linecap="round"/>
    <path d="M-62 -14 l14 -0 M16 -14 l14 0" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`;
  // cejas
  const bUp = o.brow || 0;
  hd += `<path d="M-68 ${-38 - bUp} Q-40 ${-50 - bUp} -12 ${-40 - bUp}" fill="none" stroke="${K10.mHair}" stroke-width="10" stroke-linecap="round"/>`;
  hd += wk_ ? `<path d="M12 -44 Q40 -58 68 -42" fill="none" stroke="${K10.mHair}" stroke-width="10" stroke-linecap="round"/>` : `<path d="M12 ${-40 - bUp} Q40 ${-50 - bUp} 68 ${-38 - bUp}" fill="none" stroke="${K10.mHair}" stroke-width="10" stroke-linecap="round"/>`;
  // nariz, mejillas, boca
  hd += `<path d="M2 26 Q-8 46 4 50" fill="none" ${sk(0.6)}/>`;
  hd += `<circle cx="-62" cy="50" r="17" fill="${C.pink}" opacity="0.6"/><circle cx="62" cy="50" r="17" fill="${C.pink}" opacity="0.6"/>`;
  const sm = o.smile || 'calm';
  if (sm === 'grin') hd += `<path d="M-34 66 Q0 104 36 66 Z" fill="${C.dred}" ${sk(0.8)}/><path d="M-28 68 H30 L26 76 H-24Z" fill="#FFFFFF"/>`;
  else if (sm === 'sly') hd += `<path d="M-28 72 Q4 88 34 62" fill="none" ${sk(0.9)}/><path d="M30 60 q8 -2 10 6" fill="none" ${sk(0.6)}/>`;
  else if (sm === 'shh') hd += `<ellipse cx="6" cy="74" rx="12" ry="10" fill="${C.dred}" ${sk(0.7)}/>`;
  else hd += `<path d="M-28 68 Q2 90 32 68" fill="none" ${sk(0.9)}/>`;
  s += `<g transform="rotate(${f(hr)} 0 120)">${hd}</g>`;
  // brazo y mano junto a la boca (susurro), lado derecho de la imagen
  const u = clamp(o.hand || 0);
  if (u > 0.01) {
    const H0 = [210, 640], H1 = [104, 74], hp = [lerp(H0[0], H1[0], u), lerp(H0[1], H1[1], u)];
    const E = [lerp(230, 236, u), lerp(560, 330, u)];
    s += `<path d="M190 600 L${f(E[0])} ${f(E[1])} L${f(hp[0] + 18)} ${f(hp[1] + 40)}" fill="none" stroke="${INK}" stroke-width="70" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="M190 600 L${f(E[0])} ${f(E[1])} L${f(hp[0] + 18)} ${f(hp[1] + 40)}" fill="none" stroke="#FFFFFF" stroke-width="58" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="M${f(E[0] - 8)} ${f(E[1] + 50)} L${f(E[0])} ${f(E[1])}" stroke="#E8E2E0" stroke-width="20" stroke-linecap="round" opacity="0.8"/>`;
    // mano: palma vertical con los dedos juntos
    s += `<g transform="translate(${f(hp[0])} ${f(hp[1])}) rotate(${f(lerp(30, 8, u))})">
      <path d="M-14 60 Q-26 20 -22 -30 Q-20 -46 -6 -46 Q6 -46 8 -30 L10 -44 Q12 -58 24 -56 Q36 -54 34 -38 L32 0 Q46 14 40 40 Q34 64 10 70 Q-8 72 -14 60Z" fill="${C.skin}" ${sk()}/>
      <path d="M8 -30 L6 8 M-6 10 Q-2 -6 -8 -24" fill="none" ${sk(0.5)}/></g>`;
  }
  return s;
}
