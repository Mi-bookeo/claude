/* Vídeo 09 — «De puerta en puerta». Piezas nuevas sobre lib.js + series.js + rosa.js + v04…v08.js:
   PARTE ANTIGUA (1945): paleta sepia, papel con trama de imprenta, marco con esquinas recortadas, arañazos y motas
   deterministas, temblor de 1 px; el vendedor de tornillos (suelo local y=210), vecinos de época, calle de piedra,
   farola de gas, adoquines, puertas, monedas. PARTE MODERNA: tarjetas «Novedad / Oferta / Evento» y móviles. */
'use strict';

/* ===================== PALETA 1945 ===================== */
const O = {
  paper: '#E8D9B5', dbeige: '#D2BC8E', cream: '#F1E6C8', brown: '#8B5E3C', rust: '#B5542E', olive: '#7A7A4A',
  grey: '#7F8C8D', skin: '#E0B890', skinS: '#CFA277', ink: '#2B2119', dot: '#CDB88A',
  // sombras derivadas (mismos tonos, más oscuros)
  brownS: '#6E4A2F', oliveS: '#5F5F3A', greyS: '#66716F', rustS: '#8F4225', dark: '#4A3A2C', creamS: '#DDD0AE'
};
FONTS.R = { fam: 'Rye', wt: 400 };
FONTS.A = { fam: 'Abril', wt: 400 };
const ost = (v = 1) => `stroke="${O.ink}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;

// texto de cartel antiguo: marrón muy oscuro sobre beige, con sombra de imprenta (beige oscuro)
function textOld(str, x, y, o = {}) {
  const size = o.size || 100, font = o.font || 'R', F = FONTS[font];
  const base = `x="${f(x)}" y="${f(y)}" font-family="${F.fam}" font-weight="${F.wt}" font-size="${f(size)}" text-anchor="${o.anchor || 'middle'}" dominant-baseline="central"${o.ls ? ` letter-spacing="${o.ls}"` : ''}`;
  const d = o.sd === undefined ? Math.max(4, size * 0.045) : o.sd;
  let s = '';
  if (d) s += `<text ${base} transform="translate(${f(d)} ${f(d)})" fill="${o.shadow || O.dbeige}">${esc(str)}</text>`;
  s += `<text ${base} fill="${o.fill || O.ink}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${f(o.sw || SW)}" stroke-linejoin="round" paint-order="stroke"` : ''}>${esc(str)}</text>`;
  return s;
}
const bigOld = (str, x, y, size, k, rot = 0, o = {}) => at(x, y, k, textOld(str, 0, 0, Object.assign({ size: fit(str, size, o.maxW || 940, o.font || 'R') }, o)), rot);

/* ===================== TRATAMIENTO DE PELÍCULA ANTIGUA ===================== */
// 15 fps efectivos: cada fotograma se repite 2 veces
const q15 = t => Math.floor(t * 15 + 1e-6) / 15;
// trama de puntos de imprenta antigua (círculos #CDB88A, r 1,4, cuadrícula de 10 px en la base de 380 px)
function oldDots(x = 0, y = 0, w = W, h = H, op = 1) {
  const id = 'od' + (uid++), cell = 10 * W / 380;
  return `<defs><pattern id="${id}" width="${f(cell)}" height="${f(cell)}" patternUnits="userSpaceOnUse"><circle cx="${f(cell / 2)}" cy="${f(cell / 2)}" r="${f(1.4 * W / 380)}" fill="${O.dot}"/></pattern></defs>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})" opacity="${op}"/>`;
}
function paperBg() { return `<rect width="${W}" height="${H}" fill="${O.paper}"/>` + oldDots(); }
// marco fino beige oscuro con pequeños recortes en las esquinas
function oldFrame() {
  const m = 22, n = 26, b = 16;
  const inner = `M${m + n} ${m} H${W - m - n} V${m + n} H${W - m} V${H - m - n} H${W - m - n} V${H - m} H${m + n} V${H - m - n} H${m} V${m + n} H${m + n}Z`;
  return `<path d="M-10 -10 H${W + 10} V${H + 10} H-10Z ${inner}" fill="${O.dbeige}" fill-rule="evenodd"/>
    <path d="${inner}" fill="none" stroke="${O.brown}" stroke-width="3"/>
    <path d="M${m + b} ${m + b + 30} V${m + b} H${m + b + 30} M${W - m - b - 30} ${m + b} H${W - m - b} V${m + b + 30} M${W - m - b} ${H - m - b - 30} V${H - m - b} H${W - m - b - 30} M${m + b + 30} ${H - m - b} H${m + b} V${H - m - b - 30}" fill="none" stroke="${O.brown}" stroke-width="2" opacity="0.7"/>`;
}
// arañazos verticales y motas que aparecen y desaparecen (calculados por fotograma efectivo n)
function filmDamage(n, amt = 1) {
  if (amt <= 0) return '';
  let s = '';
  for (let i = 0; i < 3; i++) {
    const life = Math.floor(n / 3) * 3 + i * 17;              // cada arañazo dura unos fotogramas y luego salta
    if (hash(life * 1.7 + i) < 0.3) continue;
    const x = 70 + hash(life * 3.3 + i * 9.1) * 940 + (hash(n * 5.1 + i) - 0.5) * 6;
    const y0 = hash(life * 2.1 + i) * 500, y1 = H - hash(life * 4.7 + i) * 600;
    const light = hash(life + i * 3) > 0.6;
    s += `<line x1="${f(x)}" y1="${f(y0)}" x2="${f(x + (hash(life * 8.3) - 0.5) * 10)}" y2="${f(y1)}" stroke="${light ? O.cream : O.ink}" stroke-width="${f(1.4 + hash(life * 6.1 + i) * 1.6)}" opacity="${f((light ? 0.7 : 0.38) * amt)}"/>`;
  }
  for (let j = 0; j < 9; j++) {
    if (hash(n * 11.3 + j * 7.7) < 0.55) continue;
    const x = 50 + hash(n * 13.1 + j) * 980, y = 50 + hash(n * 17.9 + j * 3) * 1820, r = 2 + hash(n * 19.3 + j) * 4.5;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${hash(n + j * 5) > 0.75 ? O.cream : O.ink}" opacity="${f(0.55 * amt)}"/>`;
  }
  if (hash(n * 23.7) > 0.8) {          // pelo/fibra ocasional
    const x = 120 + hash(n * 29.1) * 840, y = 200 + hash(n * 31.3) * 1100;
    s += `<path d="M${f(x)} ${f(y)} q18 -26 6 -52 q-10 -20 10 -40" fill="none" stroke="${O.ink}" stroke-width="1.6" opacity="${f(0.45 * amt)}"/>`;
  }
  return s;
}
// viñeta suave y parpadeo de brillo
function vignetteOld(n) {
  const id = 'vg' + (uid++), fl = 0.03 + 0.04 * hash(n * 3.7);
  return `<defs><radialGradient id="${id}" cx="50%" cy="50%" r="75%"><stop offset="55%" stop-color="${O.brown}" stop-opacity="0"/><stop offset="100%" stop-color="${O.brown}" stop-opacity="0.32"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#${id})"/><rect width="${W}" height="${H}" fill="${O.cream}" opacity="${f(fl)}"/>`;
}
// envuelve una imagen antigua: temblor de 1 px + viñeta + arañazos + marco
function oldFilm(inner, T, o = {}) {
  const n = Math.floor(T * 15 + 1e-6);
  const dx = hash(n * 1.31) > 0.5 ? 1 : -1, dy = hash(n * 2.71) > 0.5 ? 1 : 0;
  return `<g transform="translate(${dx} ${dy})">${inner}</g>` + vignetteOld(n) + filmDamage(n, o.dmg === undefined ? 1 : o.dmg) + oldFrame();
}

/* ===================== PERSONAJES DE 1945 (local, suelo y=210, miran a la derecha) ===================== */
// estilo: { shirt, vest, pants, shoe, hat: 'cap'|'scarf'|'beret'|'none', hair, overalls, skirt, mous, basket, susp }
const VENDOR = { shirt: O.cream, shirtS: O.creamS, vest: O.olive, vestS: O.oliveS, pants: O.brown, shoe: O.dark, hat: 'cap', hatC: O.brown, hatS: O.brownS, hair: O.dark, mous: O.dark, basket: true, susp: true, rolled: true };
const OLDFOLK = [
  // mujer con pañuelo
  { shirt: O.grey, shirtS: O.greyS, pants: O.dark, shoe: O.dark, hat: 'scarf', hatC: O.rust, hatS: O.rustS, hair: O.brownS, skirt: O.greyS, apron: O.cream, female: true },
  // hombre con mono de taller
  { shirt: O.cream, shirtS: O.creamS, pants: O.grey, shoe: O.dark, hat: 'none', hair: O.ink, overalls: O.grey, overallsS: O.greyS, mous: O.ink, rolled: true },
  // anciano con boina
  { shirt: O.cream, shirtS: O.creamS, vest: O.brown, vestS: O.brownS, pants: O.oliveS, shoe: O.dark, hat: 'beret', hatC: O.ink, hatS: O.ink, hair: O.creamS, mous: '#EDE3CC', old: true }
];
const OL = { hipF: [105, 132], hipB: [95, 132], shF: [112, 84], shB: [90, 84], up: 26, fore: 26 };
// punto local de la mano (ang: grados hacia delante desde la vertical; bend: codo hacia delante)
function oldHandPt(sh, ang, bend = 0) {
  const a = ang * PI / 180, b = (ang + bend) * PI / 180;
  return [sh[0] + OL.up * Math.sin(a) + (OL.fore + 2) * Math.sin(b), sh[1] + OL.up * Math.cos(a) + (OL.fore + 2) * Math.cos(b)];
}
function oldArm(w, st, sh, ang, bend, back, hold) {
  const skin = back ? O.skinS : O.skin, sl = back ? st.shirtS : st.shirt;
  const sleeve = st.rolled ? 20 : 40;
  let fore = `<rect x="-5" y="0" width="10" height="${OL.fore}" rx="5" fill="${st.rolled ? skin : sl}" stroke="${O.ink}" stroke-width="${w(2.6)}"/>`;
  fore += `<circle cx="0" cy="${OL.fore + 2}" r="5.6" fill="${skin}" stroke="${O.ink}" stroke-width="${w(2.4)}"/>`;
  let g = `<g transform="translate(${sh[0]} ${sh[1]}) rotate(${f(-ang)})">`;
  g += `<g transform="translate(0 ${OL.up}) rotate(${f(-bend)})">${fore}</g>`;
  g += `<rect x="-6" y="-4" width="12" height="${OL.up + 6}" rx="6" fill="${sl}" stroke="${O.ink}" stroke-width="${w(2.6)}"/>`;
  if (st.rolled) g += `<rect x="-6.6" y="${sleeve - 2}" width="13.2" height="7" rx="3" fill="${st.shirtS}" stroke="${O.ink}" stroke-width="${w(2.2)}"/>`;
  g += `</g>`;
  if (hold) { const [hx, hy] = oldHandPt(sh, ang, bend); g += hold(w, hx, hy); }
  return g;
}
function oldLeg(w, st, hip, ang, back) {
  const pc = back ? O.brownS : st.pants;
  return `<g transform="rotate(${f(-ang)} ${hip[0]} ${hip[1]})"><rect x="${hip[0] - 6.5}" y="${hip[1] - 4}" width="13" height="${196 - hip[1] + 4}" rx="5" fill="${st.overalls && !back ? st.overalls : pc}" stroke="${O.ink}" stroke-width="${w(2.6)}"/>
    <path d="M${hip[0] - 8} 194 H${hip[0] + 8} Q${hip[0] + 18} 194 ${hip[0] + 18} 202 V208 H${hip[0] - 8}Z" fill="${st.shoe}" stroke="${O.ink}" stroke-width="${w(2.6)}"/></g>`;
}
// tornillo (local; centro de la cabeza x,y; escala s ≈ 1 -> 7 de largo)
function screwL(w, x, y, s = 1, rot = 0) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})"><rect x="-1.4" y="0" width="2.8" height="8" fill="${O.grey}" stroke="${O.ink}" stroke-width="${w(0.9) / s}"/>
    <path d="M-1.4 2.4 L1.4 1.4 M-1.4 4.6 L1.4 3.6 M-1.4 6.8 L1.4 5.8" stroke="${O.ink}" stroke-width="${w(0.6) / s}"/>
    <ellipse cx="0" cy="0" rx="3.6" ry="1.9" fill="#A3AEAF" stroke="${O.ink}" stroke-width="${w(0.9) / s}"/><path d="M-2 0 H2" stroke="${O.ink}" stroke-width="${w(0.6) / s}"/></g>`;
}
const SCREWS = [[-15, -2, -12], [-10, -4, 8], [-5, -3, -4], [0, -5, 10], [5, -3, -8], [10, -4, 6], [15, -2, -10], [-12, 1, 14], [-6, 0, -14], [2, 0, 4], [8, 1, -6], [13, 0, 12]];
function basketL(w, cx, cy) {
  let g = '';
  SCREWS.forEach(([dx, dy, r]) => { g += screwL(w, cx + dx, cy - 4 + dy, 1, r); });
  g += `<path d="M${cx - 22} ${cy - 2} L${cx + 22} ${cy - 2} L${cx + 18} ${cy + 20} Q${cx} ${cy + 25} ${cx - 18} ${cy + 20}Z" fill="${O.dbeige}" stroke="${O.ink}" stroke-width="${w(2.6)}" stroke-linejoin="round"/>`;
  for (let i = 0; i < 3; i++) g += `<path d="M${cx - 21 + i * 1.2} ${cy + 4 + i * 5.5} H${cx + 21 - i * 1.2}" stroke="${O.brown}" stroke-width="${w(1.6)}"/>`;
  for (let i = -3; i <= 3; i++) g += `<path d="M${cx + i * 6} ${cy - 1} L${cx + i * 5.2} ${cy + 21}" stroke="${O.brown}" stroke-width="${w(1.2)}"/>`;
  g += `<rect x="${cx - 24}" y="${cy - 5}" width="48" height="6" rx="3" fill="${O.brown}" stroke="${O.ink}" stroke-width="${w(2.2)}"/>`;
  return g;
}
function capL(w, st, x = 0, y = 0, rot = 0) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})"><path d="M-18 4 Q-17 -14 1 -15 Q18 -15 21 -4 L28 -2 Q34 1 29 4 L19 4 Z" fill="${st.hatC}" stroke="${O.ink}" stroke-width="${w(2.6)}" stroke-linejoin="round"/>
    <path d="M-10 -8 Q2 -13 14 -8" fill="none" stroke="${st.hatS}" stroke-width="${w(1.6)}"/><circle cx="1" cy="-14.6" r="2" fill="${st.hatS}" stroke="${O.ink}" stroke-width="${w(1.2)}"/></g>`;
}
function oldFace(w, st, o) {
  const e = o.expr || 'smile', L = (d, v = 1.8, c = O.ink) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w(v)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  let s = '';
  if (o.blink || e === 'happy') s += L('M105 46 Q108 43.6 111 46', 1.6);
  else s += `<circle cx="108" cy="46" r="1.9" fill="${O.ink}"/>`;
  s += L(e === 'surprise' ? 'M104 38.6 Q108 36 112 38.4' : 'M104.4 40.2 Q108 38.6 111.6 40', 1.5);
  s += `<circle cx="118.4" cy="51.4" r="3.6" fill="${O.skin}" stroke="${O.ink}" stroke-width="${w(2)}"/>`;
  s += `<circle cx="111" cy="54.4" r="2.6" fill="${O.rust}" opacity="0.35"/>`;
  if (st.mous) s += `<path d="M108 57.6 Q113 55 119 57.4 Q114 58.8 108 57.6Z" fill="${st.mous}" stroke="${O.ink}" stroke-width="${w(1.3)}" stroke-linejoin="round"/>`;
  if (e === 'talk' || e === 'surprise') s += `<ellipse cx="113" cy="61.4" rx="${e === 'surprise' ? 2.2 : 2.6}" ry="${e === 'surprise' ? 2.6 : 1.9}" fill="${O.ink}"/>`;
  else s += L('M109.4 61 Q113 63.6 116.4 60.6', 1.7);
  if (st.old) s += L('M100 54 Q102 56 104 55.4', 1.1);
  return s;
}
function oldPerson(st, o) {
  const k = o.k || 1, w = v => f(v * k);
  const ink = `stroke="${O.ink}" stroke-width="${w(2.6)}" stroke-linejoin="round"`;
  let g = '';
  g += oldArm(w, st, OL.shB, o.armB || 0, o.bendB || 0, true, o.holdB);
  g += oldLeg(w, st, OL.hipB, o.legB || 0, true);
  g += oldLeg(w, st, OL.hipF, o.legF || 0, false);
  let b = '';
  if (st.skirt) b += `<path d="M84 124 L118 124 L126 176 Q101 182 76 176Z" fill="${st.skirt}" ${ink}/>`;
  b += `<rect x="82" y="72" width="38" height="${st.skirt ? 56 : 62}" rx="10" fill="${st.shirt}" ${ink}/>`;
  if (st.apron) b += `<path d="M90 100 H114 L118 168 Q102 172 86 168Z" fill="${st.apron}" ${ink}/><path d="M92 108 H112" stroke="${O.dbeige}" stroke-width="${w(1.6)}"/>`;
  if (st.overalls) b += `<path d="M89 94 H113 V126 H120 V138 H82 V126 H89Z" fill="${st.overalls}" ${ink}/><path d="M89 94 L86 76 M113 94 L116 76" stroke="${st.overallsS}" stroke-width="${w(3.4)}" stroke-linecap="round"/><rect x="96" y="100" width="10" height="8" rx="1.5" fill="${st.overallsS}" stroke="${O.ink}" stroke-width="${w(1.4)}"/>`;
  else if (!st.skirt) {
    b += `<rect x="82" y="124" width="38" height="16" rx="4" fill="${st.pants}" ${ink}/>`;
    if (st.susp) b += `<path d="M96 76 V126 M106 76 V126" stroke="${O.brownS}" stroke-width="${w(2.6)}"/>`;
    if (st.vest) b += `<path d="M83 80 Q83 76 88 75 L94 75 L98 128 L82 128Z" fill="${st.vest}" ${ink}/><path d="M114 75 Q120 76 120 80 L121 128 L104 128 L108 75Z" fill="${st.vest}" ${ink}/>` +
      `<circle cx="101.2" cy="104" r="1.4" fill="${O.ink}"/><circle cx="105.5" cy="114" r="1.4" fill="${O.ink}"/>`;
  }
  b += `<rect x="96" y="60" width="10" height="16" rx="3" fill="${O.skinS}" ${ink}/>`;
  // cabeza
  let hd = '';
  if (st.hat === 'scarf') hd += `<path d="M82 52 Q80 26 101 25 Q122 26 120 46 L117 58 Q104 66 92 64 Z" fill="${st.hatC}" ${ink}/>`;
  hd += `<circle cx="101" cy="47" r="17" fill="${O.skin}" ${ink}/>`;
  hd += `<circle cx="91" cy="50" r="3.4" fill="${O.skinS}" stroke="${O.ink}" stroke-width="${w(2)}"/>`;
  if (st.hat === 'cap' && o.capOff) hd += `<path d="M85 46 Q84 30 101 30 Q115 30 118 38 Q108 34 96 38 Q90 40 89 48Z" fill="${st.hair}" stroke="${O.ink}" stroke-width="${w(2.2)}" stroke-linejoin="round"/>`;
  if (st.hat === 'none') hd += `<path d="M84 48 Q82 29 102 29 Q117 29 118 40 Q108 35 96 39 Q90 42 89 50Z" fill="${st.hair}" stroke="${O.ink}" stroke-width="${w(2.2)}" stroke-linejoin="round"/>`;
  if (st.hat === 'beret') hd += `<path d="M84 38 Q84 26 101 26 Q120 27 121 36 Q104 41 84 38Z" fill="${st.hatC}" ${ink}/><path d="M100 26 l2 -4" stroke="${O.ink}" stroke-width="${w(2.4)}" stroke-linecap="round"/>` +
    `<path d="M85 40 Q85 50 88 54" fill="none" stroke="${st.hair}" stroke-width="${w(3)}" stroke-linecap="round"/>`;
  if (st.hat === 'scarf') hd += `<path d="M84 44 Q86 26 102 26 Q117 27 119 40 Q106 33 92 38Z" fill="${st.hatC}" ${ink}/><path d="M92 62 L86 72 L96 70Z" fill="${st.hatS}" ${ink}/><circle cx="99" cy="33" r="1.6" fill="${O.cream}"/><circle cx="109" cy="32" r="1.6" fill="${O.cream}"/><circle cx="90" cy="38" r="1.6" fill="${O.cream}"/>`;
  hd += oldFace(w, st, o);
  if (st.hat === 'cap' && !o.capOff) hd += capL(w, st, 101, 38);
  b += `<g transform="rotate(${f(o.head || 0)} 101 64)">${hd}</g>`;
  if (st.basket) {
    const bb = o.bb || 0;
    b += `<path d="M90 78 Q92 100 92 ${f(112 + bb)} M113 78 Q113 100 116 ${f(112 + bb)}" fill="none" stroke="${O.brownS}" stroke-width="${w(3)}" stroke-linecap="round"/>`;
    b += basketL(w, 105, 114 + bb);
  }
  if (o.front0) b += o.front0(w);
  b += oldArm(w, st, OL.shF, o.armF || 0, o.bendF || 0, false, o.holdF);
  if (o.front) b += o.front(w);
  g = `<g transform="translate(0 ${f(o.bob || 0)})">${g}${b}</g>`;
  return g;
}
// (px,py) = punto del suelo bajo el personaje (local 100,210); flip = mira a la izquierda
function placeOld(st, px, py, sc, o) {
  o.k = SW / (3 * sc);
  const sx = o.flip ? -sc : sc;
  return `<g transform="translate(${f(px - 100 * sx)} ${f(py - 210 * sc)}) scale(${f(sx)} ${f(sc)})">${oldPerson(st, o)}</g>`;
}
const oldPt = (px, py, sc, lx, ly, flip) => [px + (lx - 100) * sc * (flip ? -1 : 1), py + (ly - 210) * sc];
function shadowOld(x, y, rx) { return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(rx * 0.13)}" fill="${O.ink}" opacity="0.2"/>`; }
// ciclo de andar de 0,8 s; la cestilla rebota con cada paso
function oldWalk(t, amp = 1) {
  const ph = 2 * PI * t / 0.8, s = Math.sin(ph);
  return { legF: 24 * s * amp, legB: -24 * s * amp, armF: -18 * s * amp, armB: 18 * s * amp, bendF: 14, bendB: 14,
    bob: -4.5 * Math.abs(Math.sin(ph)) * amp, bb: 3 * Math.abs(Math.sin(ph + 0.9)) * amp };
}
// objetos en la mano (coordenadas locales de la mano)
const holdScrew = (s = 2.2) => (w, x, y) => screwL(w, x + 2, y - 6, s, -20);
const holdCoins = n => (w, x, y) => { let g = ''; for (let i = 0; i < n; i++) g += oldCoinL(w, x + (i - (n - 1) / 2) * 5, y - 4 - i * 1.5, 3.6); return g; };
const holdCap = st => (w, x, y) => capL(w, st, x + 2, y - 8, -14);
function oldCoinL(w, x, y, r) {
  return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * 0.94)}" fill="${O.dbeige}" stroke="${O.ink}" stroke-width="${w(1.4)}"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r * 0.32)}" fill="${O.brown}" stroke="${O.ink}" stroke-width="${w(0.8)}"/>`;
}
function oldCoin(x, y, r, spin) {
  const sx = Math.abs(Math.cos(spin));
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(Math.max(0.15, sx))} 1)"><circle r="${f(r)}" fill="${O.dbeige}" ${ost(0.8)}/><circle r="${f(r * 0.68)}" fill="none" stroke="${O.brown}" stroke-width="${f(SW * 0.5)}"/><circle r="${f(r * 0.24)}" fill="${O.brown}" ${ost(0.5)}/></g>`;
}

/* ===================== DECORADOS DE 1945 ===================== */
function oldCloud(x, y, s) {
  const circ = [[-60, 10, 45], [0, -15, 62], [70, -30, 70], [140, -5, 55], [188, 15, 38]];
  const sw = 2 * SW / s;
  let a = '';
  circ.forEach(([cx, cy, r]) => { a += `<circle cx="${cx}" cy="${cy}" r="${r}"/>`; });
  a += `<rect x="-100" y="0" width="320" height="56" rx="28"/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><g fill="${O.ink}" stroke="${O.ink}" stroke-width="${f(sw)}">${a}</g><g fill="${O.cream}">${a}</g></g>`;
}
const OLD_CLOUDS = [{ x0: 60, y: 520, s: 0.7, v: 12 }, { x0: 520, y: 640, s: 0.9, v: 18 }, { x0: 930, y: 470, s: 0.6, v: 8 }, { x0: 1350, y: 700, s: 0.8, v: 14 }];
function oldSky(T, o = {}) {
  const band = o.band || 900;
  let s = `<rect width="${W}" height="${H}" fill="${O.cream}"/><rect y="${band}" width="${W}" height="${H}" fill="${O.paper}"/>` + oldDots(0, 0, W, H, 0.7);
  // sol pálido
  const sx = o.sx || 820, sy = o.sy || 560, r = o.sr || 70;
  s += `<circle cx="${sx}" cy="${sy}" r="${r + 26}" fill="${O.paper}" opacity="0.8"/><circle cx="${sx}" cy="${sy}" r="${r}" fill="#F6EED7" ${ost()}/>`;
  const span = W + 800;
  (o.clouds || OLD_CLOUDS).forEach(c => { const x = (((c.x0 - c.v * T) % span) + span) % span - 400; s += oldCloud(x, c.y, c.s); });
  return s;
}
// adoquines (suelo) a partir de y0
function cobbles(y0, o = {}) {
  let s = `<rect x="-20" y="${y0}" width="${W + 40}" height="${H - y0 + 20}" fill="${O.dbeige}"/>`;
  let row = 0;
  for (let y = y0 + 16; y < H + 40; y += 46 + row * 6, row++) {
    const h = 34 + row * 5, wd = 86 + row * 14, off = (row % 2) * wd / 2;
    for (let x = -wd + off; x < W + wd; x += wd + 10) s += `<rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="${f(h)}" rx="${f(h * 0.45)}" fill="${hash(x * 0.37 + row) > 0.5 ? O.paper : O.creamS}" stroke="${O.brown}" stroke-width="${f(SW * 0.5)}"/>`;
  }
  s += `<rect x="-20" y="${y0 - 6}" width="${W + 40}" height="24" fill="${O.creamS}" ${ost()}/>`;
  return s;
}
// casa de piedra con ventanas de madera; door: {col, x?} ; win: nº de ventanas por planta
function stoneHouse(x, base, w, h, o = {}) {
  const top = base - h, id = 'sh' + (uid++);
  let s = `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 10)}" fill="${o.wall || O.dbeige}" ${ost()}/>`;
  // sillares
  s += `<clipPath id="${id}"><rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h)}"/></clipPath><g clip-path="url(#${id})">`;
  for (let y = top + 50, r = 0; y < base; y += 50, r++) {
    s += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x + w)}" y2="${f(y)}" stroke="${O.brown}" stroke-width="${f(SW * 0.35)}" opacity="0.6"/>`;
    for (let xx = x + (r % 2) * 45; xx < x + w; xx += 90) s += `<line x1="${f(xx)}" y1="${f(y - 50)}" x2="${f(xx)}" y2="${f(y)}" stroke="${O.brown}" stroke-width="${f(SW * 0.35)}" opacity="0.6"/>`;
  }
  s += `</g>`;
  // tejado / cornisa
  s += `<rect x="${f(x - 14)}" y="${f(top - 34)}" width="${f(w + 28)}" height="40" fill="${o.roof || O.rust}" ${ost()}/>`;
  for (let xx = x - 14; xx < x + w + 14; xx += 36) s += `<path d="M${f(xx)} ${f(top + 6)} q18 16 36 0" fill="none" ${ost(0.5)}/>`;
  // ventanas con contraventanas de madera
  const n = o.win || 2, ww = 88, wh = 120;
  [0.3, 0.62].forEach(fy => {
    for (let i = 0; i < n; i++) {
      const cx = x + w * (i + 0.5) / n, cy = top + h * fy - (o.door && fy > 0.5 ? 9999 : 0);
      if (cy < 0) continue;
      s += `<rect x="${f(cx - ww / 2 - 30)}" y="${f(cy - wh / 2)}" width="28" height="${wh}" fill="${o.shut || O.brown}" ${ost(0.8)}/><rect x="${f(cx + ww / 2 + 2)}" y="${f(cy - wh / 2)}" width="28" height="${wh}" fill="${o.shut || O.brown}" ${ost(0.8)}/>`;
      s += `<rect x="${f(cx - ww / 2)}" y="${f(cy - wh / 2)}" width="${ww}" height="${wh}" fill="${O.grey}" ${ost(0.8)}/><path d="M${f(cx)} ${f(cy - wh / 2)} V${f(cy + wh / 2)} M${f(cx - ww / 2)} ${f(cy)} H${f(cx + ww / 2)}" ${ost(0.6)}/>`;
      s += `<rect x="${f(cx - ww / 2 - 34)}" y="${f(cy + wh / 2)}" width="${ww + 68}" height="14" fill="${O.creamS}" ${ost(0.8)}/>`;
    }
  });
  if (o.door) {
    const dw = 150, dh = 250, dx = x + w * (o.door.at || 0.5) - dw / 2;
    s += `<path d="M${f(dx - 16)} ${base} V${f(base - dh)} Q${f(dx + dw / 2)} ${f(base - dh - 70)} ${f(dx + dw + 16)} ${f(base - dh)} V${base}Z" fill="${O.creamS}" ${ost()}/>`;
    s += `<path d="M${f(dx)} ${base} V${f(base - dh)} Q${f(dx + dw / 2)} ${f(base - dh - 54)} ${f(dx + dw)} ${f(base - dh)} V${base}Z" fill="${o.door.col}" ${ost()}/>`;
    s += `<path d="M${f(dx + dw / 2)} ${f(base - dh - 26)} V${base}" ${ost(0.6)}/><circle cx="${f(dx + dw / 2 - 16)}" cy="${f(base - dh * 0.45)}" r="6" fill="${O.dbeige}" ${ost(0.6)}/>`;
  }
  return s;
}
// farola de gas
function gasLamp(x, base, h) {
  const top = base - h;
  let s = `<rect x="${x - 34}" y="${base - 40}" width="68" height="40" rx="6" fill="${O.dark}" ${ost()}/>`;
  s += `<rect x="${x - 11}" y="${top + 60}" width="22" height="${h - 90}" fill="${O.dark}" ${ost()}/>`;
  s += `<rect x="${x - 20}" y="${top + 90}" width="40" height="16" rx="4" fill="${O.dark}" ${ost(0.8)}/>`;
  s += `<path d="M${x - 40} ${top + 60} H${x + 40} L${x + 52} ${top - 40} H${x - 52}Z" fill="#F6EED7" ${ost()}/>`;
  s += `<path d="M${x} ${top + 60} V${top - 40}" ${ost(0.6)}/><ellipse cx="${x}" cy="${top + 18}" rx="12" ry="18" fill="${O.cream}" stroke="${O.rust}" stroke-width="${f(SW * 0.6)}"/>`;
  s += `<path d="M${x - 66} ${top - 40} H${x + 66} L${x} ${top - 96}Z" fill="${O.dark}" ${ost()}/><circle cx="${x}" cy="${top - 104}" r="10" fill="${O.dark}" ${ost(0.8)}/>`;
  return s;
}
// pared de piedra a pantalla completa con portal (escena 3). door: {col}, open 0..1, inside(x,y,w,h)
const DOOR3 = { x: 600, y: 520, w: 300, h: 860, base: 1380 };
function doorWall(o = {}) {
  const { x, y, w, h, base } = DOOR3;
  let s = `<rect width="${W}" height="${H}" fill="${o.wall || O.dbeige}"/>`;
  for (let yy = 40, r = 0; yy < base; yy += 64, r++) {
    s += `<line x1="0" y1="${yy}" x2="${W}" y2="${yy}" stroke="${O.brown}" stroke-width="${f(SW * 0.4)}" opacity="0.55"/>`;
    for (let xx = (r % 2) * 70 - 40; xx < W; xx += 140) s += `<line x1="${xx}" y1="${yy}" x2="${xx}" y2="${yy + 64}" stroke="${O.brown}" stroke-width="${f(SW * 0.4)}" opacity="0.55"/>`;
  }
  s += oldDots(0, 0, W, base, 0.5);
  // jamba de piedra
  s += `<path d="M${x - 46} ${base} V${y + 40} Q${x + w / 2} ${y - 110} ${x + w + 46} ${y + 40} V${base}Z" fill="${O.creamS}" ${ost()}/>`;
  s += `<path d="M${x} ${base} V${y + 50} Q${x + w / 2} ${y - 60} ${x + w} ${y + 50} V${base}Z" fill="${O.dark}" ${ost()}/>`;
  const id = 'dw' + (uid++);
  s += `<clipPath id="${id}"><path d="M${x} ${base} V${y + 50} Q${x + w / 2} ${y - 60} ${x + w} ${y + 50} V${base}Z"/></clipPath><g clip-path="url(#${id})">`;
  s += `<rect x="${x}" y="${y - 80}" width="${w}" height="${h + 80}" fill="${O.dark}"/><rect x="${x}" y="${base - 120}" width="${w}" height="120" fill="${O.brownS}"/>`;
  if (o.inside) s += o.inside();
  // hoja que se abre hacia dentro (bisagra a la derecha)
  const op = clamp(o.open || 0), lw = w * (1 - 0.82 * op), lx = x + w - lw;
  s += `<path d="M${f(lx)} ${f(y - 60 + 30 * op)} L${x + w} ${y - 60} L${x + w} ${base} L${f(lx)} ${f(base - 26 * op)}Z" fill="${o.col}" ${ost()}/>`;
  for (let i = 1; i < 4; i++) s += `<line x1="${f(lx + lw * i / 4)}" y1="${f(y - 40)}" x2="${f(lx + lw * i / 4)}" y2="${f(base - 10)}" stroke="${O.ink}" stroke-width="${f(SW * 0.5)}" opacity="0.6"/>`;
  if (op < 0.5) s += `<circle cx="${f(lx + 40)}" cy="${y + 470}" r="13" fill="${O.dbeige}" ${ost(0.7)}/><rect x="${f(lx + 30)}" y="${y + 300}" width="22" height="60" rx="6" fill="${O.dbeige}" ${ost(0.7)}/>`;
  s += `</g>`;
  // número sobre la puerta
  s += `<rect x="${x + w / 2 - 44}" y="${y - 30}" width="88" height="64" rx="8" fill="${O.cream}" ${ost(0.8)}/>` + textOld(String(o.num || 1), x + w / 2, y + 4, { size: 48, font: 'A', sd: 0 });
  // maceta/escalón
  s += `<rect x="${x - 70}" y="${base - 18}" width="${w + 140}" height="24" fill="${O.creamS}" ${ost()}/>`;
  return s;
}
// onomatopeya cómic en paleta sepia
function onoOld(str, x, y, k, rot = 0, size = 110) {
  const base = { size, font: 'G', stroke: O.ink, sw: SW * 1.8, shadow: false };
  return at(x, y, k, `<g transform="translate(7 7)">${text(str, 0, 0, Object.assign({}, base, { fill: O.ink }))}</g>` + text(str, 0, 0, Object.assign({}, base, { fill: O.cream })), rot);
}
// bocadillo antiguo
function bubbleOld(x, y, k, label, tailX, tailY, size = 92) {
  if (k <= 0.01) return '';
  const tw = measure(label, size, 'R') + 110, th = size * 1.7;
  let g = `<path d="M${f(-tw * 0.12)} ${f(th / 2 - 4)} L${f(tailX)} ${f(tailY)} L${f(tw * 0.08)} ${f(th / 2 - 4)}Z" fill="${O.cream}" ${ost()}/>`;
  g += `<rect x="${f(-tw / 2)}" y="${f(-th / 2)}" width="${f(tw)}" height="${f(th)}" rx="${f(th / 2)}" fill="${O.cream}" ${ost()}/>`;
  g += `<path d="M${f(-tw * 0.12 + 6)} ${f(th / 2 - 8)} L${f(tw * 0.08 - 6)} ${f(th / 2 - 8)}" stroke="${O.cream}" stroke-width="${f(SW * 1.4)}"/>`;
  g += textOld(label, 0, 4, { size, sd: 3 });
  return at(x, y, k, g, -3);
}
// destello pequeño sepia (brillo del tornillo)
function glintOld(x, y, r, k) {
  if (k <= 0.01) return '';
  const d = `M0 ${-r} Q${r * 0.18} ${-r * 0.18} ${r} 0 Q${r * 0.18} ${r * 0.18} 0 ${r} Q${-r * 0.18} ${r * 0.18} ${-r} 0 Q${-r * 0.18} ${-r * 0.18} 0 ${-r}Z`;
  return at(x, y, k, `<path d="${d}" fill="${O.cream}" ${ost(0.7)}/>`);
}
// adornos del cartón de título
function ornRule(x, y, wd, k = 1) {
  const hw = wd / 2 * k;
  return `<path d="M${f(x - hw)} ${y} H${f(x - 40)} M${f(x + 40)} ${y} H${f(x + hw)}" stroke="${O.ink}" stroke-width="5" stroke-linecap="round"/>
    <path d="M${f(x - hw + 20)} ${y + 14} H${f(x - 60)} M${f(x + 60)} ${y + 14} H${f(x + hw - 20)}" stroke="${O.brown}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M${x} ${y - 18} L${x + 18} ${y} L${x} ${y + 18} L${x - 18} ${y}Z" fill="${O.rust}" stroke="${O.ink}" stroke-width="3"/>`;
}
// círculo de cuenta atrás de película (escena 4, parte antigua)
function filmLeader(cx, cy, r, ang) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${O.cream}" ${ost()}/>`;
  const a = ang * PI / 180;
  s += `<path d="M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${ang % 360 > 180 ? 1 : 0} 1 ${f(cx + r * Math.sin(a))} ${f(cy - r * Math.cos(a))}Z" fill="${O.dbeige}"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.82}" fill="none" stroke="${O.ink}" stroke-width="4"/><circle cx="${cx}" cy="${cy}" r="${r * 0.72}" fill="none" stroke="${O.ink}" stroke-width="2.5"/>`;
  s += `<path d="M${cx - r - 60} ${cy} H${cx + r + 60} M${cx} ${cy - r - 60} V${cy + r + 60}" stroke="${O.ink}" stroke-width="3"/>`;
  return s;
}

/* ===================== PARTE MODERNA: TARJETAS «NOVEDAD / OFERTA / EVENTO» ===================== */
const CARD9 = [
  { label: 'Novedad', col: C.navy, bg: '#FDE3EC', icon: 'bag', line: 'Bolso nuevo' },
  { label: 'Oferta', col: C.red, bg: C.glass, icon: 'pct', line: 'Descuento' },
  { label: 'Evento', col: C.green, bg: '#FFF1C9', icon: 'ticket', line: 'Este sábado' }
];
// entrada con estrella (centro x,y; ancho wd)
function ticket(x, y, wd, rot = 0) {
  const hw = wd / 2, hh = wd * 0.3, nr = hh * 0.32;
  const d = `M${-hw} ${-hh} H${hw} V${-nr} A${nr} ${nr} 0 0 0 ${hw} ${nr} V${hh} H${-hw} V${nr} A${nr} ${nr} 0 0 0 ${-hw} ${-nr}Z`;
  let g = `<path d="${d}" transform="translate(6 6)" fill="${INK}"/><path d="${d}" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
  g += `<path d="M${f(hw * 0.42)} ${f(-hh + 10)} V${f(hh - 10)}" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-dasharray="10 9"/>`;
  const sd = starPath(hh * 0.62, hh * 0.3, 5);
  g += `<path d="${sd}" transform="translate(${f(-hw * 0.2)} 0)" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW * 0.8)}" stroke-linejoin="round"/>`;
  g += `<circle cx="${f(hw * 0.7)}" cy="0" r="${f(hh * 0.12)}" fill="${INK}"/>`;
  return at(x, y, 1, g, rot);
}
// tarjeta horizontal (centrada en 0,0; 500 x 200). o.done: tic verde
function card9Local(i, t = 0, o = {}) {
  const c = CARD9[i], Wd = 500, Hd = 200, x0 = -Wd / 2, y0 = -Hd / 2;
  let g = panel(x0, y0, Wd, Hd, 32, '#FFFFFF', 12);
  const bs = 156, bx = x0 + 22, by = y0 + 22;
  g += `<rect x="${bx}" y="${by}" width="${bs}" height="${bs}" rx="24" fill="${c.bg}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  if (c.icon === 'bag') g += bag(bx + bs / 2, by + bs - 18, 1.12, 0, { rot: 3 * Math.sin(t * 2.4) });
  else if (c.icon === 'pct') g += pctSign(bx + bs / 2, by + bs / 2, 52, 1, -8 + 3 * Math.sin(t * 2.2));
  else g += ticket(bx + bs / 2, by + bs / 2, 128, -10 + 3 * Math.sin(t * 2.2));
  const tx = bx + bs + 26;
  g += text(c.label, tx, y0 + 70, { size: fit(c.label, 78, 270, 'G'), font: 'G', anchor: 'start', fill: c.col === C.navy ? C.red : c.col, sw: SW * 1.5, sd: 4, ls: 2 });
  g += text(c.line, tx, y0 + 138, { size: fit(c.line, 44, 270), anchor: 'start', fill: INK, stroke: null });
  if (i === 0) g += yelStar(x0 + Wd - 34, y0 + 26, 34, 1);
  if (i === 1) g += sealPct(x0 + Wd - 30, y0 + 24, 36, 1);
  if (i === 2) g += starBadge(x0 + Wd - 32, y0 + 26, 34, 1);
  if (o.done) g += checkCircle(bx + bs - 8, by + bs - 8, 30, o.done);
  return g;
}
const card9 = (i, x, y, k, rot, t, o) => at(x, y, k, card9Local(i, t, o), rot);

// móvil en la mano de la gente con una de las tres tarjetas (card = 0..2)
function cardPhoneHand(hx, hy, o = {}) {
  return w => {
    const rot = o.rot === undefined ? -12 : o.rot, sh = o.shake || 0, ps = o.ps || 1, c = CARD9[(o.card || 0) % 3];
    let g = `<g transform="translate(${f(hx + 3 + sh)} ${f(hy - 13 * ps)}) rotate(${f(rot)}) scale(${f(ps)})">`;
    g += `<rect x="-10.5" y="-18" width="21" height="36" rx="3.6" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/>`;
    if (o.lit) {
      g += `<rect x="-8.3" y="-15.4" width="16.6" height="31" rx="2" fill="${C.cream}"/>`;
      g += `<rect x="-8.3" y="-15.4" width="16.6" height="6" fill="${C.red}"/><circle cx="-4.6" cy="-12.4" r="1.9" fill="#FFFFFF"/>`;
      g += `<rect x="-6.8" y="-6.4" width="13.6" height="18" rx="1.6" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(0.9)}"/>`;
      g += `<rect x="-5.4" y="-5" width="10.8" height="8.4" rx="1" fill="${c.bg}" stroke="${INK}" stroke-width="${w(0.6)}"/>`;
      if (c.icon === 'bag') g += `<path d="M-3.2 2.4 L-2.4 -2 H2.4 L3.2 2.4Z" fill="${C.pink}" stroke="${INK}" stroke-width="${w(0.6)}" stroke-linejoin="round"/><path d="M-1.4 -2 Q0 -4.2 1.4 -2" fill="none" stroke="${INK}" stroke-width="${w(0.7)}"/>`;
      else if (c.icon === 'pct') g += `<circle cx="0" cy="-0.8" r="3.4" fill="${C.red}" stroke="${INK}" stroke-width="${w(0.6)}"/><path d="M-1.3 0.7 L1.3 -2.3" stroke="#FFFFFF" stroke-width="${w(0.7)}" stroke-linecap="round"/>`;
      else g += `<rect x="-4" y="-3.2" width="8" height="4.8" rx="0.8" fill="${C.yel}" stroke="${INK}" stroke-width="${w(0.6)}"/><circle cx="-0.6" cy="-0.8" r="1.2" fill="${C.red}"/>`;
      g += `<rect x="-5.6" y="5.4" width="11.2" height="4" rx="2" fill="${c.col}" stroke="${INK}" stroke-width="${w(0.5)}"/>`;
    } else g += `<rect x="-8.3" y="-15.4" width="16.6" height="31" rx="2" fill="${C.glass}"/>`;
    g += `</g>`;
    g += `<circle cx="${hx}" cy="${hy}" r="4.3" fill="${o.skin || C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
    return g;
  };
}
function streetPerson9(i, x, foot, sc, o) {
  const p = FOLK[i], s = sc * (p.scale || 1), armF = o.armF || 0;
  const svg = placeFolk(i, x, foot, sc, Object.assign({}, o, { handF: cardPhoneHand(202.5, 139.5, Object.assign({}, o, { skin: p.skin })) }));
  const a = armF * PI / 180, hx = 202 - 31.5 * Math.sin(a), hy = 108 + 31.5 * Math.cos(a);
  return { svg: shadowEll(x, foot, 26 * s) + svg, phone: toWorld(x, foot, 190, 204, s, hx + 3, hy - 13, o.flip), head: toWorld(x, foot, 190, 204, s, 192, 60, o.flip) };
}

/* ---------- Mari Carmen: móvil con las dos manos (del vídeo 06) ---------- */
function phone9(w, ph, typing, fx, fy, bx, by, screen = 'app') {
  const cx = (fx + bx) / 2, cy = (fy + by) / 2 - 7, rot = -14;
  let g = `<g transform="rotate(${rot} ${f(cx)} ${f(cy)})">`;
  g += `<rect x="${f(cx - 9)}" y="${f(cy - 15)}" width="18" height="30" rx="3.4" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/>`;
  g += `<rect x="${f(cx - 7)}" y="${f(cy - 12.6)}" width="14" height="25" rx="1.8" fill="#FFFFFF"/><rect x="${f(cx - 7)}" y="${f(cy - 12.6)}" width="14" height="5" fill="${C.red}"/>`;
  if (screen === 'ok') g += `<circle cx="${f(cx)}" cy="${f(cy + 2)}" r="4.4" fill="${C.green}" stroke="${INK}" stroke-width="${w(0.9)}"/><path d="M${f(cx - 2)} ${f(cy + 2)} l1.4 1.5 l2.8 -3.1" stroke="#FFFFFF" stroke-width="${w(1.1)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  else {
    [C.navy, C.red, C.green].forEach((c, i) => { g += `<rect x="${f(cx - 5.4)}" y="${f(cy - 6 + i * 5.6)}" width="10.8" height="4.4" rx="1" fill="${c}" stroke="${INK}" stroke-width="${w(0.6)}"/>`; });
  }
  g += `</g>`;
  const tf = typing ? Math.max(0, Math.sin(ph * PI)) : 0, tb = typing ? Math.max(0, -Math.sin(ph * PI)) : 0;
  g += `<circle cx="${f(bx)}" cy="${f(by)}" r="4.2" fill="${C.skinS}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
  g += `<rect x="${f(bx + 1)}" y="${f(by - 6 + tb * 1.6)}" width="6" height="3.4" rx="1.7" transform="rotate(-20 ${f(bx)} ${f(by)})" fill="${C.skinS}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
  g += `<circle cx="${f(fx)}" cy="${f(fy)}" r="4.2" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
  g += `<rect x="${f(fx - 7)}" y="${f(fy - 6.6 + tf * 1.6)}" width="6" height="3.4" rx="1.7" transform="rotate(20 ${f(fx)} ${f(fy)})" fill="${C.skin}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
  return g;
}
// rótulo genérico de la tienda en la pared
function shopSign9(x, y, wd, ht, label = 'TIENDA') {
  let g = `<path d="M${f(x - wd * 0.3)} ${f(y - ht / 2 - 70)} L${f(x - wd * 0.3)} ${f(y - ht / 2)} M${f(x + wd * 0.3)} ${f(y - ht / 2 - 70)} L${f(x + wd * 0.3)} ${f(y - ht / 2)}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  g += `<rect x="${f(x - wd / 2 + 10)}" y="${f(y - ht / 2 + 10)}" width="${wd}" height="${ht}" rx="22" fill="${INK}"/>`;
  g += `<rect x="${f(x - wd / 2)}" y="${f(y - ht / 2)}" width="${wd}" height="${ht}" rx="22" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  g += text(label, x, y + 4, { size: fit(label, ht * 0.66, wd - 60, 'G'), font: 'G', sw: SW * 1.6, sd: 4, ls: 3 });
  return g;
}
