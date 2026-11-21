/* Vídeo 07 — «Pedro y el amigo invisible». Piezas nuevas sobre lib.js + series.js + rosa.js + v04.js + v05.js + v06.js:
   Pedro con camisa a cuadros elegante, brazos con codo (cinemática inversa), chaqueta oscura abierta, ciclo de correr,
   expresiones nuevas (pánico, idea, concentrado, guiño), casa de Pedro (espejo, percha, arbolito), adornos de Navidad
   (farolas con guirnaldas de bombillas, abeto con estrella), móvil con audio de chat, tarjeta de oferta navideña,
   tienda «REGALOS» (fachada e interior), cajas con cartelico «10 €», bolsa de regalo y bar navideño. */
'use strict';

const P7 = {
  shirt: '#3C9D5D', shirtS: '#2A7344', check: '#1F5A35', line: '#FFF5F3', collar: '#2A7344',
  jacket: '#2F3B4C', jacketS: '#232C39', xgreen: '#2E7D4F', xgreenS: '#215C3A', yel: '#F2C12E', blue: '#3F7CC4'
};
const BULBS = [C.red, P7.yel, '#3C9D5D', P7.blue, C.pink];

/* ===================== PEDRO 07 ===================== */
// segmento redondeado de a a b (anchura wd) en coordenadas locales
function limb(a, b, wd, fill, w, sw = 3) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / PI - 90;
  return `<g transform="translate(${f(a[0])} ${f(a[1])}) rotate(${f(ang)})"><rect x="${f(-wd / 2)}" y="${f(-wd / 2)}" width="${f(wd)}" height="${f(L + wd)}" rx="${f(wd / 2)}" fill="${fill}" stroke="${INK}" stroke-width="${w(sw)}"/></g>`;
}
const UA = 19.5, FA = 19;   // brazo y antebrazo (total ≈ 38, como el brazo recto de Pedro)
// codo y mano: por ángulos (ang, bend) o por objetivo (ik = [x,y], side = ±1)
function armJoints(S, o) {
  if (o.ik) {
    const dx = o.ik[0] - S[0], dy = o.ik[1] - S[1];
    const d = clamp(Math.hypot(dx, dy), 4, UA + FA - 0.6), phi = Math.atan2(dy, dx);
    const c = Math.acos(clamp((UA * UA + d * d - FA * FA) / (2 * UA * d), -1, 1)) * (o.side || 1);
    const E = [S[0] + UA * Math.cos(phi + c), S[1] + UA * Math.sin(phi + c)];
    return { E, H: [S[0] + d * Math.cos(phi), S[1] + d * Math.sin(phi)] };
  }
  const a = o.ang || 0, b = o.bend || 0;
  const e = rotV([0, UA], a), h = rotV([0, FA], a + b);
  const E = [S[0] + e[0], S[1] + e[1]];
  return { E, H: [E[0] + h[0], E[1] + h[1]] };
}
function pedro7Face(o, w) {
  const e = o.expr || 'normal';
  if (!['panic', 'idea', 'focus', 'wink', 'calm'].includes(e)) return pedroFace(o, w);
  const L = (d, sw = 1.7, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const glasses = `<circle cx="196" cy="80" r="4" fill="none" stroke="${INK}" stroke-width="${w(1.8)}"/><circle cx="204" cy="80" r="4" fill="none" stroke="${INK}" stroke-width="${w(1.8)}"/><line x1="192" y1="80" x2="178" y2="79" stroke="${INK}" stroke-width="${w(1.8)}"/>`;
  const cheek = op => `<circle cx="193.4" cy="87.2" r="2.6" fill="${C.pink}" opacity="${op}"/>`;
  let s = `<circle cx="196" cy="80" r="4" fill="#FFFFFF" fill-opacity="${e === 'panic' ? 1 : 0.5}"/><circle cx="204" cy="80" r="4" fill="#FFFFFF" fill-opacity="${e === 'panic' ? 1 : 0.5}"/>`;
  const shine = `<circle cx="${f(196.8 + lx)}" cy="${f(79.1 + ly)}" r="0.85" fill="#FFFFFF"/><circle cx="${f(204.8 + lx)}" cy="${f(79.1 + ly)}" r="0.85" fill="#FFFFFF"/>`;
  if (e === 'panic') {
    const jx = o.jit || 0;
    s += `<circle cx="${f(196 + jx)}" cy="80.2" r="1.05" fill="${INK}"/><circle cx="${f(204 + jx)}" cy="80.2" r="1.05" fill="${INK}"/>`;
    s += glasses + L('M192.6 70.4 Q195.6 67.6 198.6 69.8 M201.4 69.8 Q204.4 67.6 207.4 70.4', 1.6);
    s += `<ellipse cx="200.4" cy="90.2" rx="2.5" ry="3.5" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}"/>`;
    // líneas de susto en la frente y gota de sudor
    s += L('M186 64.6 V68.4 M189.6 63.6 V67.6 M193.2 63.8 V67.2', 1.1, C.navy);
    const dy = o.drop || 0;
    s += `<path d="M${f(209.5)} ${f(66 + dy)} Q${f(214.5)} ${f(73.5 + dy)} ${f(209.5)} ${f(76.3 + dy)} Q${f(204.5)} ${f(73.5 + dy)} ${f(209.5)} ${f(66 + dy)}Z" fill="${C.glass}" stroke="${INK}" stroke-width="${w(1.5)}" stroke-linejoin="round"/><circle cx="208.3" cy="${f(73.2 + dy)}" r="0.9" fill="#FFFFFF"/>`;
  } else if (e === 'idea') {
    s += `<circle cx="${f(196 + lx)}" cy="${f(80 + ly)}" r="2.4" fill="${INK}"/><circle cx="${f(204 + lx)}" cy="${f(80 + ly)}" r="2.4" fill="${INK}"/>` + shine;
    s += glasses + L('M193.4 77.9 Q194.3 76.7 195.7 76.4 M201.4 77.9 Q202.3 76.7 203.7 76.4', 1, '#FFFFFF');
    s += L('M193 70.8 Q195.8 68.6 198.6 70.6 M201.4 70.6 Q204.2 68.6 207 70.8', 1.6) + cheek(0.6);
    s += `<path d="M195.4 86.2 Q200.2 96.4 205.2 86 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.7)}" stroke-linejoin="round"/><path d="M196.5 86.9 H204.2 L203.5 88.4 H197.2Z" fill="#FFFFFF"/>`;
  } else if (e === 'focus') {
    if (o.blink) s += L('M193.2 80.6 H198.8 M201.2 80.6 H206.8', 1.6);
    else s += `<circle cx="${f(196.3 + lx)}" cy="${f(81 + ly)}" r="1.5" fill="${INK}"/><circle cx="${f(204.3 + lx)}" cy="${f(81 + ly)}" r="1.5" fill="${INK}"/>` +
      `<path d="M192.1 79.4 A3.9 3.9 0 0 1 199.9 79.4 Z M200.1 79.4 A3.9 3.9 0 0 1 207.9 79.4 Z" fill="${P5.skin}"/>` + L('M192.4 79.4 H199.6 M200.4 79.4 H207.6', 1.3);
    s += glasses + L('M193 73.6 L198.6 75 M201.4 75 L207 73.4', 1.7);
    s += L('M197.4 89.6 Q200.2 90.4 203 89.4', 1.8) + `<path d="M201.4 89.9 Q202 93.2 203.9 92.6 Q205.2 91.8 204.1 89.4Z" fill="${C.pink}" stroke="${INK}" stroke-width="${w(1.3)}" stroke-linejoin="round"/>`;
  } else if (e === 'wink') {
    s += L('M193.4 80.8 Q196 77.6 198.6 80.8', 1.8) + `<circle cx="${f(204 + lx)}" cy="${f(80 + ly)}" r="2.2" fill="${INK}"/><circle cx="${f(204.8 + lx)}" cy="${f(79.1 + ly)}" r="0.85" fill="#FFFFFF"/>`;
    s += glasses + L('M193 73.6 L198.4 74.6 M201.4 71.8 Q204.2 69.8 207 71.8', 1.6) + cheek(0.65);
    s += `<path d="M195.4 86.2 Q200.6 95.6 205.4 85.6 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.7)}" stroke-linejoin="round"/><path d="M196.5 86.9 H204.4 L203.6 88.3 H197.2Z" fill="#FFFFFF"/>`;
  } else { // calm: tranquilo, media sonrisa
    s += o.blink ? L('M193.2 80.3 H198.8 M201.2 80.3 H206.8', 1.6) : `<circle cx="${f(196 + lx)}" cy="${f(80 + ly)}" r="1.5" fill="${INK}"/><circle cx="${f(204 + lx)}" cy="${f(80 + ly)}" r="1.5" fill="${INK}"/>`;
    s += glasses + L('M193.2 73.2 Q195.8 71.8 198.4 73 M201.6 73 Q204.2 71.8 206.8 73.2', 1.5) + cheek(0.4);
    s += L('M196.6 88 Q200.2 92 204 87.4', 2);
  }
  return s;
}
// camisa a cuadros (tartán verde con líneas crema) recortada a la forma dada
function plaid(id, shape, x0, y0, wd, ht, w, shade = true) {
  let g = `<clipPath id="${id}">${shape}</clipPath><g clip-path="url(#${id})"><rect x="${x0 - 2}" y="${y0 - 2}" width="${wd + 4}" height="${ht + 4}" fill="${P7.shirt}"/>`;
  for (let x = x0 + 1; x < x0 + wd; x += 9) g += `<rect x="${f(x)}" y="${y0 - 2}" width="3.6" height="${ht + 4}" fill="${P7.check}" opacity="0.5"/><rect x="${f(x + 6)}" y="${y0 - 2}" width="0.9" height="${ht + 4}" fill="${P7.line}" opacity="0.85"/>`;
  for (let y = y0 + 3; y < y0 + ht; y += 9) g += `<rect x="${x0 - 2}" y="${f(y)}" width="${wd + 4}" height="3.6" fill="${P7.check}" opacity="0.5"/><rect x="${x0 - 2}" y="${f(y + 6)}" width="${wd + 4}" height="0.9" fill="${P7.line}" opacity="0.85"/>`;
  if (shade) g += `<rect x="${x0}" y="${y0 - 2}" width="9" height="${ht + 4}" fill="${INK}" opacity="0.2"/>`;
  return g + `</g>`;
}
// Pedro en coordenadas locales (suelo y=214, mira a la derecha).
// o: legF, legB, bob, head, lean, expr, smile, look, blink, jacket, armF/armB ({ang,bend} | {ik,side}), itemF/itemB(w,x,y), front(w)
function pedro7(o) {
  const k = o.k || 1, w = v => f(v * k);
  const st = (v = 3) => `stroke="${INK}" stroke-width="${w(v)}"`, lj = 'stroke-linejoin="round"';
  const leg = (ang, shoe) => `<g transform="rotate(${f(ang)} 190 150)"><rect x="185" y="148" width="8" height="58" rx="4" fill="${P5.pants}" ${st()}/><path d="M182 206 h17 a5 5 0 0 1 0 8 h-17z" fill="${shoe}" ${st()} ${lj}/></g>`;
  let g = leg(o.legB || 0, '#E8E8E8') + leg(o.legF || 0, '#FFFFFF');
  const jk = !!o.jacket;
  const sleeve = back => jk ? (back ? P7.jacketS : P7.jacket) : (back ? P7.shirtS : P7.shirt);
  const arm = (S, a, back, item) => {
    const { E, H } = armJoints(S, a || {});
    let s = limb(S, E, 10, sleeve(back), w) + limb(E, H, 9, sleeve(back), w);
    if (!jk) s += `<path d="M${f(S[0] - 3)} ${f(S[1] + 2)} L${f(E[0])} ${f(E[1])}" stroke="${P7.line}" stroke-width="${w(0.9)}" opacity="0.8"/>`;
    const cu = [lerp(E[0], H[0], 0.8), lerp(E[1], H[1], 0.8)];
    s += limb(cu, [lerp(E[0], H[0], 0.9), lerp(E[1], H[1], 0.9)], 9.4, jk ? P7.line : P7.line, w, 2.2);
    s += `<circle cx="${f(H[0])}" cy="${f(H[1])}" r="4.3" fill="${back ? P5.skinS : P5.skin}" ${st(2.2)}/>`;
    if (item) s += item(w, H[0], H[1]);
    return s;
  };
  let b = `<rect x="186" y="86" width="8" height="14" rx="2" fill="${P5.skinS}" ${st()}/>`;
  b += arm([174, 108], o.armB, true, o.itemB);
  // camisa
  const id = 'p7' + (uid++);
  b += plaid(id, `<rect x="174" y="98" width="32" height="56" rx="10"/>`, 174, 98, 32, 56, w);
  b += `<rect x="174" y="98" width="32" height="56" rx="10" fill="none" ${st()}/>`;
  b += `<path d="M193.4 101 V153" stroke="${INK}" stroke-width="${w(1.2)}"/>`;
  [109, 119, 129, 139].forEach(y => { b += `<circle cx="195.6" cy="${y}" r="1.1" fill="${C.cream}" stroke="${INK}" stroke-width="${w(0.7)}"/>`; });
  // cuello de la camisa (dos puntas)
  b += `<path d="M184.4 96.6 L192.6 103.6 L187.2 107.4 L183 99.4Z" fill="${P7.collar}" ${st(1.8)} ${lj}/><path d="M201.4 96.6 L193.8 103.6 L199.4 107.4 L203 99.4Z" fill="${P7.collar}" ${st(1.8)} ${lj}/>`;
  if (jk) {
    b += `<path d="M180 98.6 Q174 98.6 174 106 V152 Q174 158 180 158 H189 L188.4 118 L184.4 100Z" fill="${P7.jacketS}" ${st()} ${lj}/>`;
    b += `<path d="M201 98.6 Q206 98.6 206 106 V152 Q206 158 201 158 H198.6 L198.2 116 L202.4 100Z" fill="${P7.jacket}" ${st()} ${lj}/>`;
    b += `<path d="M184.4 100 L188.4 118 L182.6 108Z M202.4 100 L198.2 116 L203.6 106.6Z" fill="${P7.jacket}" ${st(1.6)} ${lj}/>`;
    b += `<rect x="199.6" y="136" width="5" height="1.6" rx="0.8" fill="${INK}"/>`;
  }
  if (o.front0) b += o.front0(w);
  b += arm([206, 108], o.armF, false, o.itemF);
  let hd = `<circle cx="190" cy="78" r="14" fill="${P5.skin}" ${st()}/>`;
  hd += `<path d="M176 74 Q178 60 192 61 Q205 62 205 74 Q198 68 188 70 Q181 70 176 74Z" fill="${P5.hair}" ${st()} ${lj}/>`;
  if (o.comb) hd += `<path d="M180 66.4 Q186 64.4 192 64.6 M182 69 Q188 66.6 194 67" stroke="#FFFFFF" stroke-width="${w(0.9)}" fill="none" stroke-linecap="round" opacity="0.6"/>`;
  hd += pedro7Face(o, w);
  b += `<g transform="rotate(${f(o.head || 0)} 190 94)">${hd}</g>`;
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  if (o.lean) g = `<g transform="rotate(${f(o.lean)} 190 214)">${g}</g>`;
  return g;
}
function placeP7(px, py, sc, o) {
  o.k = SW / (3 * sc);
  const sx = o.flip ? -sc : sc;
  return `<g transform="translate(${f(px - 190 * sx)} ${f(py - 214 * sc)}) scale(${f(sx)} ${f(sc)})">${pedro7(o)}</g>`;
}
const p7Pt = (px, py, sc, lx, ly, flip) => [px + (lx - 190) * sc * (flip ? -1 : 1), py + (ly - 214) * sc];
// andar (0,75 s) y correr (0,4 s: piernas ±50°, brazos ±45°, inclinación 10°)
function p7Walk(t, period = 0.75, amp = 1) {
  const ph = 2 * PI * t / period, s = Math.sin(ph);
  return { legF: 28 * s * amp, legB: -28 * s * amp, armF: { ang: -22 * s * amp, bend: -8 }, armB: { ang: 22 * s * amp, bend: -8 }, bob: -3 * (0.5 + 0.5 * Math.cos(2 * ph)) };
}
function p7Run(t) {
  const ph = 2 * PI * t / 0.4, s = Math.sin(ph);
  return { legF: 50 * s, legB: -50 * s, armF: { ang: -45 * s, bend: -55 }, armB: { ang: 45 * s, bend: -55 }, bob: -6 * (0.5 + 0.5 * Math.cos(2 * ph)), lean: 10 };
}
// gota de sudor suelta (mundo)
function sweat(x, y, r, k = 1, rot = 0) {
  if (k <= 0.01) return '';
  return at(x, y, k, `<path d="M0 ${-r} Q${f(r * 0.8)} ${f(r * 0.3)} 0 ${f(r * 0.75)} Q${f(-r * 0.8)} ${f(r * 0.3)} 0 ${-r}Z" fill="${C.glass}" stroke="${INK}" stroke-width="${f(SW * 0.8)}" stroke-linejoin="round"/><circle cx="${f(-r * 0.2)}" cy="${f(r * 0.25)}" r="${f(r * 0.14)}" fill="#FFFFFF"/>`, rot);
}

/* ===================== CASA DE PEDRO ===================== */
// chaqueta oscura colgada (centro del gancho en x,y; s = escala local)
function hangingJacket(x, y, s, sway = 0) {
  const sw = SW / s, st = `stroke="${INK}" stroke-width="${f(sw)}" stroke-linejoin="round"`;
  let g = `<path d="M0 -10 Q0 -18 6 -18 Q12 -18 12 -12" fill="none" stroke="${INK}" stroke-width="${f(sw * 0.9)}" stroke-linecap="round"/>`;
  g += `<path d="M-30 6 L0 -8 L30 6" fill="none" stroke="${P5.woodS}" stroke-width="${f(sw * 1.6)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  g += `<path d="M-26 4 Q-34 6 -36 16 L-40 74 Q-34 78 -28 76 L-24 30 L-22 92 Q0 96 22 92 L24 30 L28 76 Q34 78 40 74 L36 16 Q34 6 26 4 L8 0 L0 26 L-8 0Z" fill="${P7.jacket}" ${st}/>`;
  g += `<path d="M-8 0 L0 26 L8 0 Z" fill="${C.cream}" ${st}/><path d="M-8 0 L-3 30 L-14 12Z M8 0 L3 30 L14 12Z" fill="${P7.jacketS}" ${st}/>`;
  g += `<path d="M0 26 V92" stroke="${INK}" stroke-width="${f(sw * 0.8)}"/><rect x="10" y="54" width="9" height="2.6" rx="1.3" fill="${INK}"/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(sway)}) scale(${f(s)})">${g}</g>`;
}
// perchero de pie de madera (base en y)
function coatRack(x, base, h) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = `<rect x="${f(x - 12 + 8)}" y="${f(base - h + 8)}" width="24" height="${f(h)}" fill="${INK}"/>`;
  s += `<rect x="${f(x - 12)}" y="${f(base - h)}" width="24" height="${f(h)}" rx="10" fill="${C.wood}" ${st()}/>`;
  s += `<path d="M${f(x - 90)} ${f(base)} L${f(x)} ${f(base - 60)} L${f(x + 90)} ${f(base)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 3)}" stroke-linecap="round"/><path d="M${f(x - 90)} ${f(base)} L${f(x)} ${f(base - 60)} L${f(x + 90)} ${f(base)}" fill="none" stroke="${C.woodS}" stroke-width="${f(SW * 1.4)}" stroke-linecap="round"/>`;
  s += `<path d="M${f(x)} ${f(base - h + 30)} q-60 -10 -70 -50 M${f(x)} ${f(base - h + 30)} q60 -10 70 -50" fill="none" stroke="${INK}" stroke-width="${f(SW * 2.6)}" stroke-linecap="round"/><path d="M${f(x)} ${f(base - h + 30)} q-60 -10 -70 -50 M${f(x)} ${f(base - h + 30)} q60 -10 70 -50" fill="none" stroke="${C.wood}" stroke-width="${f(SW * 1.2)}" stroke-linecap="round"/>`;
  s += `<circle cx="${f(x)}" cy="${f(base - h - 6)}" r="20" fill="${C.wood}" ${st()}/>`;
  return s;
}
// espejo de pared con marco de madera; inner(x,y,w,h) dibuja el reflejo
function mirror(x, y, wd, ht, inner) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}"`, id = 'mi' + (uid++), r = wd / 2;
  const shape = (pad) => `<rect x="${f(x - pad)}" y="${f(y - pad)}" width="${f(wd + 2 * pad)}" height="${f(ht + 2 * pad)}" rx="${f(r + pad)}"/>`;
  let s = `<g transform="translate(12 12)" fill="${INK}">${shape(30)}</g><g fill="${C.wood}" ${st()}>${shape(30)}</g>`;
  s += `<clipPath id="${id}">${shape(0)}</clipPath><g clip-path="url(#${id})"><rect x="${x}" y="${y}" width="${wd}" height="${ht}" fill="${C.glass}"/>`;
  if (inner) s += inner(x, y, wd, ht);
  s += `<path d="M${f(x + wd * 0.62)} ${f(y)} l${f(wd * 0.2)} 0 l${f(-wd * 0.9)} ${f(ht * 0.8)} l${f(-wd * 0.2)} 0Z M${f(x + wd * 0.92)} ${f(y + ht * 0.1)} l${f(wd * 0.08)} 0 l${f(-wd * 0.7)} ${f(ht * 0.62)} l${f(-wd * 0.08)} 0Z" fill="#FFFFFF" opacity="0.45"/></g>`;
  s += `<g fill="none" ${st()}>${shape(0)}</g>`;
  return s;
}
// abeto con estrella, bolas y bombillas (base del tronco en x, base; h = altura total)
function xmasTree(x, base, h, t = 0, o = {}) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  const k = h / 600, tw = 70 * k, th = 70 * k;
  let s = '';
  if (o.pot) s += `<path d="M${f(x - 70 * k)} ${f(base - 90 * k)} H${f(x + 70 * k)} L${f(x + 54 * k)} ${f(base)} H${f(x - 54 * k)}Z" fill="${C.red}" ${st()}/><rect x="${f(x - 80 * k)}" y="${f(base - 104 * k)}" width="${f(160 * k)}" height="${f(26 * k)}" rx="${f(10 * k)}" fill="${C.dred}" ${st()}/>`;
  const tb = o.pot ? base - 96 * k : base;
  s += `<rect x="${f(x - tw / 2)}" y="${f(tb - th)}" width="${f(tw)}" height="${f(th + 4)}" fill="${P5.woodS}" ${st()}/>`;
  const tiers = [[tb - th + 10 * k, 230, 190], [tb - th - 140 * k, 185, 170], [tb - th - 270 * k, 135, 160]];
  tiers.forEach(([yb, hw, ht]) => {
    const d = `M${f(x - hw * k)} ${f(yb)} Q${f(x)} ${f(yb + 26 * k)} ${f(x + hw * k)} ${f(yb)} L${f(x)} ${f(yb - ht * k * 1.25)}Z`;
    s += `<path d="${d}" transform="translate(${f(9 * k + 3)} ${f(9 * k + 3)})" fill="${INK}"/><path d="${d}" fill="${P7.xgreen}" ${st()}/>`;
    s += `<path d="M${f(x - hw * k * 0.62)} ${f(yb - 6 * k)} L${f(x - hw * k * 0.2)} ${f(yb - ht * k * 0.9)}" stroke="${P7.xgreenS}" stroke-width="${f(SW * 1.2)}" stroke-linecap="round"/>`;
  });
  // guirnalda de bombillas y bolas
  const balls = [[-120, 30, 0], [60, 40, 1], [150, 18, 2], [-60, -120, 3], [80, -110, 4], [-20, -240, 0], [40, -250, 2], [-160, 60, 4], [-90, -40, 1], [110, -20, 3]];
  balls.forEach(([dx, dy, c], i) => {
    const bx = x + dx * k, by = tb - th + dy * k, on = Math.sin(t * 5 + i * 1.9) > -0.3;
    s += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(15 * k + 2)}" fill="${on ? BULBS[c] : hexMix(BULBS[c], '#1E1A1A', 0.25)}" ${st(0.8)}/><circle cx="${f(bx - 4 * k)}" cy="${f(by - 4 * k)}" r="${f(4 * k + 0.6)}" fill="#FFFFFF"/>`;
  });
  // estrella
  const sy = tb - th - 270 * k - 160 * k * 1.25, sr = 58 * k, sp = 1 + 0.08 * Math.sin(t * 6);
  s += at(x, sy, sp, `<path d="${starPath(sr, sr * 0.46, 5)}" transform="translate(${f(5 * k + 2)} ${f(5 * k + 2)})" fill="${INK}"/><path d="${starPath(sr, sr * 0.46, 5)}" fill="${P7.yel}" ${st()}/><circle cx="${f(-sr * 0.18)}" cy="${f(-sr * 0.16)}" r="${f(sr * 0.1)}" fill="#FFFFFF"/>`, 4 * Math.sin(t * 2));
  return s;
}
// casa de Pedro: pared crema con puntos, zócalo, suelo de madera, espejo, perchero y arbolito
const HOUSE = { floor: 1360, mirror: [640, 430, 330, 560], rack: [140, 1360, 820], tree: [930, 1360, 470] };
function houseBack(T, o = {}) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}"`;
  let s = dotWall();
  // guirnalda de luces en la parte de arriba de la pared
  s += garland(-40, 210, W + 40, 230, 70, T, 12);
  s += `<rect x="-20" y="${HOUSE.floor - 34}" width="${W + 40}" height="34" fill="#FFFFFF" ${st()}/>`;
  s += `<rect x="-20" y="${HOUSE.floor}" width="${W + 40}" height="${H - HOUSE.floor + 20}" fill="${C.wood}"/>`;
  for (let i = 0; i < 8; i++) s += `<line x1="${-60 + i * 190}" y1="${HOUSE.floor}" x2="${-220 + i * 190}" y2="${H}" ${st(0.5)}/>`;
  s += `<line x1="-20" y1="${HOUSE.floor}" x2="${W + 20}" y2="${HOUSE.floor}" ${st()}/>`;
  if (o.mirror !== false) { const [mx, my, mw, mh] = HOUSE.mirror; s += mirror(mx, my, mw, mh, o.reflect); }
  if (o.rack !== false) {
    const [rx, rb, rh] = HOUSE.rack;
    s += coatRack(rx, rb, rh);
    if (o.jacketOnRack !== false) s += hangingJacket(rx + 62, rb - rh + 2, 3.1, 2 * Math.sin(T * 1.3));
  }
  if (o.tree !== false) { const [tx, tb, th] = HOUSE.tree; s += xmasTree(tx, tb, th, T, { pot: true }); }
  return s;
}

/* ===================== EXTERIOR NAVIDEÑO ===================== */
// cielo de atardecer en tres bandas cálidas, sol bajo amarillo y nubes blancas con contorno
const XSKY = ['#FFC3B2', '#FFD2A8', '#FFE8C8'];
function xmasSky(T, o = {}) {
  const b1 = o.b1 || 520, b2 = o.b2 || 900;
  let s = `<rect width="${W}" height="${H}" fill="${XSKY[0]}"/><rect y="${b1}" width="${W}" height="${H}" fill="${XSKY[1]}"/><rect y="${b2}" width="${W}" height="${H}" fill="${XSKY[2]}"/>`;
  if (o.sun !== false) s += sun(o.sx || 860, o.sy || 760, o.sr || 66, T * 8);
  s += pinkClouds(T + (o.cloudOff || 0), o.clouds);
  return s;
}
// guirnalda de bombillas entre (x1,y1) y (x2,y2) con flecha «sag»; n bombillas que parpadean
function garland(x1, y1, x2, y2, sag, T, n = 9, r = 15) {
  const q = u => [lerp(x1, x2, u), lerp(y1, y2, u) + sag * 4 * u * (1 - u)];
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2 + sag * 2;
  let s = `<path d="M${f(x1)} ${f(y1)} Q${f(cx)} ${f(cy)} ${f(x2)} ${f(y2)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n, [x, y] = q(u), col = BULBS[(((i + Math.round(x1 / 97)) % 5) + 5) % 5];
    const on = Math.sin(T * 4.2 + i * 2.1 + x1 * 0.01) > -0.35;
    s += `<rect x="${f(x - r * 0.35)}" y="${f(y - 2)}" width="${f(r * 0.7)}" height="${f(r * 0.6)}" rx="2" fill="${INK}"/>`;
    s += `<ellipse cx="${f(x + 3)}" cy="${f(y + r * 1.1 + 3)}" rx="${f(r * 0.62)}" ry="${f(r * 0.85)}" fill="${INK}"/>`;
    s += `<ellipse cx="${f(x)}" cy="${f(y + r * 1.1)}" rx="${f(r * 0.62)}" ry="${f(r * 0.85)}" fill="${on ? col : hexMix(col, '#1E1A1A', 0.3)}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
    if (on) s += `<circle cx="${f(x - r * 0.18)}" cy="${f(y + r * 0.85)}" r="${f(r * 0.16)}" fill="#FFFFFF"/>`;
  }
  return s;
}
// farola (base en y=base; la cabeza queda en base - h)
function lampPost(x, base, h) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`, top = base - h;
  let s = `<rect x="${f(x - 9 + 7)}" y="${f(top + 7)}" width="18" height="${f(h)}" fill="${INK}"/><rect x="${f(x - 9)}" y="${f(top)}" width="18" height="${f(h)}" rx="7" fill="${C.navy}" ${st()}/>`;
  s += `<rect x="${f(x - 26)}" y="${f(base - 36)}" width="52" height="40" rx="9" fill="${C.navy}" ${st()}/>`;
  s += `<path d="M${f(x - 30)} ${f(top - 10)} H${f(x + 30)} L${f(x + 20)} ${f(top - 74)} H${f(x - 20)}Z" fill="${P7.yel}" ${st()}/>`;
  s += `<path d="M${f(x - 40)} ${f(top - 74)} H${f(x + 40)} L${f(x)} ${f(top - 108)}Z" fill="${C.navy}" ${st()}/><rect x="${f(x - 34)}" y="${f(top - 14)}" width="68" height="16" rx="6" fill="${C.navy}" ${st()}/>`;
  s += `<path d="M${f(x - 8)} ${f(top - 22)} L${f(x - 4)} ${f(top - 64)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" stroke-linecap="round" opacity="0.8"/>`;
  // lazo rojo de Navidad en el poste
  s += `<path d="M${f(x)} ${f(top + 40)} q-26 -18 -26 2 q0 16 26 0 q26 16 26 0 q0 -20 -26 -2Z" fill="${C.red}" ${st(0.8)}/><circle cx="${f(x)}" cy="${f(top + 40)}" r="7" fill="${C.dred}" ${st(0.6)}/>`;
  return s;
}
// fachada de vivienda (portal de la casa de Pedro): devuelve {svg, door}
function homeFacade(x, base, w, h, open = 0) {
  const top = base - h, st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="10" fill="#F6D7B0" ${st()}/>`;
  s += `<rect x="${f(x + w * 0.86)}" y="${f(top + 8)}" width="${f(w * 0.14)}" height="${f(h + 30)}" fill="${INK}" opacity="0.14"/>`;
  s += `<rect x="${f(x - 14)}" y="${f(top - 26)}" width="${f(w + 28)}" height="40" rx="10" fill="${C.dred}" ${st()}/>`;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
    const wx = x + w * (0.12 + c * 0.46), wy = top + 50 + r * 190;
    s += glassWindow(wx, wy, w * 0.3, 140, null);
    s += `<rect x="${f(wx - 10)}" y="${f(wy + 140)}" width="${f(w * 0.3 + 20)}" height="18" rx="6" fill="#FFFFFF" ${st()}/>`;
    s += `<path d="M${f(wx)} ${f(wy + 8)} Q${f(wx + w * 0.15)} ${f(wy + 40)} ${f(wx + w * 0.3)} ${f(wy + 8)}" fill="none" stroke="${C.red}" stroke-width="${f(SW * 0.9)}"/>`;
  }
  const dw = w * 0.42, dx = x + (w - dw) / 2, dy = top + 470, dh = base - dy;
  s += `<rect x="${f(dx - 18)}" y="${f(dy - 18)}" width="${f(dw + 36)}" height="${f(dh + 18)}" rx="12" fill="#FFFFFF" ${st()}/>`;
  s += `<rect x="${f(dx)}" y="${f(dy)}" width="${f(dw)}" height="${f(dh + 6)}" fill="#3A2A20" ${st()}/>`;
  const lw = dw * (1 - 0.8 * clamp(open));
  s += `<path d="M${f(dx)} ${f(dy)} L${f(dx + lw)} ${f(dy - 16 * open)} L${f(dx + lw)} ${f(base + 16 * open)} L${f(dx)} ${f(base)}Z" fill="${C.green}" ${st()}/>`;
  if (open < 0.5) s += `<circle cx="${f(dx + lw * 0.82)}" cy="${f(dy + dh * 0.52)}" r="9" fill="${P7.yel}" ${st(0.7)}/>`;
  // corona de Navidad en la puerta
  if (open < 0.3) {
    const cx = dx + lw * 0.5, cy = dy + 90;
    s += `<circle cx="${f(cx)}" cy="${f(cy)}" r="44" fill="none" stroke="${INK}" stroke-width="${f(SW * 3.6)}"/><circle cx="${f(cx)}" cy="${f(cy)}" r="44" fill="none" stroke="${P7.xgreen}" stroke-width="${f(SW * 2)}"/>`;
    [[0, -44], [38, 22], [-38, 22]].forEach(([a, b]) => { s += `<circle cx="${f(cx + a)}" cy="${f(cy + b)}" r="9" fill="${C.red}" ${st(0.6)}/>`; });
    s += `<path d="M${f(cx)} ${f(cy + 44)} q-24 -14 -24 4 q0 14 24 0 q24 14 24 0 q0 -18 -24 -4Z" fill="${C.red}" ${st(0.7)}/>`;
  }
  return { svg: s, door: { x: dx, y: dy, w: dw, h: dh } };
}

/* ===================== MÓVIL: AUDIO DE CHAT ===================== */
// avatar circular genérico (amiga: pelo largo castaño, jersey rosa)
function avatar(cx, cy, r) {
  const id = 'av' + (uid++), k = r / 50, st = v => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let g = `<clipPath id="${id}"><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/></clipPath><g clip-path="url(#${id})">`;
  g += `<rect x="${f(cx - r)}" y="${f(cy - r)}" width="${f(2 * r)}" height="${f(2 * r)}" fill="#FFF1C9"/>`;
  g += `<path d="M${f(cx - 34 * k)} ${f(cy + 16 * k)} Q${f(cx - 40 * k)} ${f(cy - 40 * k)} ${f(cx)} ${f(cy - 40 * k)} Q${f(cx + 40 * k)} ${f(cy - 40 * k)} ${f(cx + 34 * k)} ${f(cy + 16 * k)}Z" fill="#8A4B2E" ${st(0.6)}/>`;
  g += `<path d="M${f(cx - 46 * k)} ${f(cy + 60 * k)} Q${f(cx - 44 * k)} ${f(cy + 26 * k)} ${f(cx)} ${f(cy + 24 * k)} Q${f(cx + 44 * k)} ${f(cy + 26 * k)} ${f(cx + 46 * k)} ${f(cy + 60 * k)}Z" fill="${C.pink}" ${st(0.6)}/>`;
  g += `<circle cx="${f(cx)}" cy="${f(cy - 6 * k)}" r="${f(22 * k)}" fill="${C.skin}" ${st(0.6)}/>`;
  g += `<path d="M${f(cx - 23 * k)} ${f(cy - 8 * k)} Q${f(cx - 20 * k)} ${f(cy - 32 * k)} ${f(cx + 4 * k)} ${f(cy - 30 * k)} Q${f(cx + 22 * k)} ${f(cy - 28 * k)} ${f(cx + 23 * k)} ${f(cy - 10 * k)} Q${f(cx + 6 * k)} ${f(cy - 22 * k)} ${f(cx - 23 * k)} ${f(cy - 8 * k)}Z" fill="#8A4B2E" ${st(0.6)}/>`;
  g += `<circle cx="${f(cx - 8 * k)}" cy="${f(cy - 4 * k)}" r="${f(2.6 * k + 0.5)}" fill="${INK}"/><circle cx="${f(cx + 8 * k)}" cy="${f(cy - 4 * k)}" r="${f(2.6 * k + 0.5)}" fill="${INK}"/>`;
  g += `<path d="M${f(cx - 7 * k)} ${f(cy + 5 * k)} Q${f(cx)} ${f(cy + 11 * k)} ${f(cx + 7 * k)} ${f(cy + 5 * k)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linecap="round"/>`;
  g += `</g><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" ${st(0.9)}/>`;
  return g;
}
// burbuja de mensaje de audio: avatar, botón de play/pausa, ondas y «Audio · 0:04». prog 0..1 = reproducido
function audioBubble(x, y, wd, prog, playing, t) {
  const ht = wd * 0.36, st = v => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let g = `<path d="M${f(x + 14)} ${f(y + 14)} h${f(wd)} v${f(ht)} h${f(-wd + 40)} l-40 30 Z" fill="${INK}" transform="translate(0 0)"/>`;
  g += `<path d="M${f(x + 40)} ${f(y)} H${f(x + wd - 30)} Q${f(x + wd)} ${f(y)} ${f(x + wd)} ${f(y + 30)} V${f(y + ht - 30)} Q${f(x + wd)} ${f(y + ht)} ${f(x + wd - 30)} ${f(y + ht)} H${f(x + 30)} Q${f(x)} ${f(y + ht)} ${f(x)} ${f(y + ht - 30)} V${f(y - 10)} Z" transform="translate(12 12)" fill="${INK}"/>`;
  g = `<path d="M${f(x + 40)} ${f(y)} H${f(x + wd - 30)} Q${f(x + wd)} ${f(y)} ${f(x + wd)} ${f(y + 30)} V${f(y + ht - 30)} Q${f(x + wd)} ${f(y + ht)} ${f(x + wd - 30)} ${f(y + ht)} H${f(x + 30)} Q${f(x)} ${f(y + ht)} ${f(x)} ${f(y + ht - 30)} V${f(y - 12)} Z" transform="translate(12 12)" fill="${INK}"/>`;
  g += `<path d="M${f(x + 40)} ${f(y)} H${f(x + wd - 30)} Q${f(x + wd)} ${f(y)} ${f(x + wd)} ${f(y + 30)} V${f(y + ht - 30)} Q${f(x + wd)} ${f(y + ht)} ${f(x + wd - 30)} ${f(y + ht)} H${f(x + 30)} Q${f(x)} ${f(y + ht)} ${f(x)} ${f(y + ht - 30)} V${f(y - 12)} Z" fill="#DDF5D6" ${st(1)}/>`;
  const ar = ht * 0.3, ax = x + 26 + ar, ay = y + ht * 0.42;
  g += avatar(ax, ay, ar);
  // micrófono pequeño junto al avatar
  g += `<circle cx="${f(ax + ar * 0.75)}" cy="${f(ay + ar * 0.75)}" r="${f(ar * 0.32)}" fill="${C.green}" ${st(0.6)}/><rect x="${f(ax + ar * 0.75 - 3.5)}" y="${f(ay + ar * 0.75 - 9)}" width="7" height="13" rx="3.5" fill="#FFFFFF"/>`;
  const px = ax + ar + 26 + ar * 0.7, py = ay, pr = ar * 0.7;
  g += `<circle cx="${f(px + 4)}" cy="${f(py + 4)}" r="${f(pr)}" fill="${INK}"/><circle cx="${f(px)}" cy="${f(py)}" r="${f(pr)}" fill="${C.green}" ${st(0.9)}/>`;
  g += playing ? `<rect x="${f(px - pr * 0.36)}" y="${f(py - pr * 0.42)}" width="${f(pr * 0.24)}" height="${f(pr * 0.84)}" rx="3" fill="#FFFFFF"/><rect x="${f(px + pr * 0.12)}" y="${f(py - pr * 0.42)}" width="${f(pr * 0.24)}" height="${f(pr * 0.84)}" rx="3" fill="#FFFFFF"/>`
    : `<path d="M${f(px - pr * 0.3)} ${f(py - pr * 0.45)} L${f(px + pr * 0.5)} ${f(py)} L${f(px - pr * 0.3)} ${f(py + pr * 0.45)}Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.5)}" stroke-linejoin="round"/>`;
  // ondas
  const wx0 = px + pr + 24, wx1 = x + wd - 34, N = 22, bw = (wx1 - wx0) / N;
  for (let i = 0; i < N; i++) {
    const u = (i + 0.5) / N, base = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6 + 0.5));
    const live = playing && u <= prog + 0.04 ? 0.7 + 0.3 * Math.abs(Math.sin(t * 14 + i)) : 1;
    const hh = ht * 0.34 * base * live, bx = wx0 + i * bw + bw * 0.2;
    g += `<rect x="${f(bx)}" y="${f(py - hh)}" width="${f(bw * 0.6)}" height="${f(hh * 2)}" rx="${f(bw * 0.3)}" fill="${u <= prog ? C.green : '#9DB8A0'}"/>`;
  }
  const dotx = lerp(wx0, wx1, clamp(prog));
  g += `<circle cx="${f(dotx)}" cy="${f(py)}" r="${f(ar * 0.2)}" fill="${C.green}" ${st(0.6)}/>`;
  g += text('Audio · 0:04', px - pr, y + ht * 0.84, { size: ht * 0.2, anchor: 'start', fill: INK, stroke: null });
  return g;
}
// móvil sobre la mesa (centro cx,cy; ancho PW); body(sx,sy,sw,sh) dibuja la pantalla
function tablePhone(cx, cy, PW, PH, rot, body) {
  const X = -PW / 2, Y = -PH / 2, R = PW * 0.13, b = PW * 0.045, id = 'tp' + (uid++);
  const st = v => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let g = `<rect x="${f(X + 22)}" y="${f(Y + 22)}" width="${f(PW)}" height="${f(PH)}" rx="${f(R)}" fill="${INK}" opacity="0.35"/>`;
  g += `<rect x="${f(X)}" y="${f(Y)}" width="${f(PW)}" height="${f(PH)}" rx="${f(R)}" fill="${INK}" ${st(1)}/>`;
  g += `<rect x="${f(X + PW - 6)}" y="${f(Y + PH * 0.22)}" width="10" height="${f(PH * 0.1)}" rx="4" fill="#3A3434" ${st(0.6)}/>`;
  const sx = X + b, sy = Y + b, sw_ = PW - 2 * b, sh = PH - 2 * b;
  g += `<clipPath id="${id}"><rect x="${f(sx)}" y="${f(sy)}" width="${f(sw_)}" height="${f(sh)}" rx="${f(R - b)}"/></clipPath><g clip-path="url(#${id})">${body(sx, sy, sw_, sh)}</g>`;
  g += `<rect x="${f(sx)}" y="${f(sy)}" width="${f(sw_)}" height="${f(sh)}" rx="${f(R - b)}" fill="none" ${st(0.7)}/>`;
  g += `<rect x="${f(-PW * 0.12)}" y="${f(Y + b * 0.35)}" width="${f(PW * 0.24)}" height="${f(b * 0.35)}" rx="4" fill="#3A3434"/>`;
  return at(cx, cy, 1, g, rot);
}

/* ===================== TARJETA DE OFERTA NAVIDEÑA ===================== */
// bolas de Navidad y lazo (local 100x100)
ICONS.xmas = sw => {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(sw * v)}" stroke-linejoin="round"`;
  let g = `<path d="M24 6 V30 M50 4 V40 M76 6 V26" stroke="${INK}" stroke-width="${f(sw * 0.7)}"/>`;
  const ball = (x, y, r, col, band) => `<rect x="${x - 5}" y="${y - r - 6}" width="10" height="8" rx="2" fill="${P7.yel}" ${st(0.7)}/>
    <circle cx="${x + 2.5}" cy="${y + 2.5}" r="${r}" fill="${INK}"/><circle cx="${x}" cy="${y}" r="${r}" fill="${col}" ${st()}/>
    <path d="M${x - r * 0.95} ${y + 2} Q${x} ${y + r * 0.5} ${x + r * 0.95} ${y + 2}" stroke="${band}" stroke-width="${f(sw * 1.3)}" fill="none"/>
    <circle cx="${f(x - r * 0.4)}" cy="${f(y - r * 0.4)}" r="${f(r * 0.18)}" fill="#FFFFFF"/>`;
  g += ball(24, 46, 15, C.red, P7.yel) + ball(76, 40, 13, P7.xgreen, C.cream) + ball(50, 64, 19, P7.yel, C.red);
  // lazo
  g += `<path d="M50 86 q-22 -14 -24 2 q-2 14 24 0 q26 14 24 0 q-2 -16 -24 -2Z" fill="${C.red}" ${st()}/><path d="M46 88 L38 100 M54 88 L62 100" stroke="${INK}" stroke-width="${f(sw * 2.6)}" stroke-linecap="round"/><path d="M46 88 L38 100 M54 88 L62 100" stroke="${C.red}" stroke-width="${f(sw * 1.2)}" stroke-linecap="round"/><circle cx="50" cy="86" r="6" fill="${C.dred}" ${st(0.8)}/>`;
  return g;
};
// sello rojo «10 €»
function seal10(x, y, r, k = 1, rot = -10) {
  if (k <= 0.01) return '';
  const d = starPath(r, r * 0.86, 16);
  return at(x, y, k, `<path d="${d}" transform="translate(${f(r * 0.07)} ${f(r * 0.07)})" fill="${INK}"/><path d="${d}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>
    <circle r="${f(r * 0.72)}" fill="none" stroke="#FFFFFF" stroke-width="${f(Math.max(3, r * 0.035))}" stroke-dasharray="${f(r * 0.12)} ${f(r * 0.09)}" stroke-linecap="round"/>` +
    text('10 €', 0, r * 0.05, { size: fit('10 €', r * 0.66, r * 1.25), sw: Math.max(SW * 1.3, r * 0.1), sd: r * 0.04 }), rot);
}
// tarjeta de la oferta (centrada en 0,0; 640 x 760): franja roja con logo, ilustración, sello, título y «Oferta»
function xmasCardLocal(t = 0, o = {}) {
  const Wd = 640, Hd = 760, x0 = -Wd / 2, y0 = -Hd / 2, hh = 130, id = 'xc' + (uid++);
  const st = v => `stroke="${INK}" stroke-width="${f(SW * v)}"`;
  let g = panel(x0, y0, Wd, Hd, 40, '#FFFFFF', 14);
  g += `<clipPath id="${id}"><rect x="${x0}" y="${y0}" width="${Wd}" height="${Hd}" rx="40"/></clipPath>`;
  g += `<g clip-path="url(#${id})"><rect x="${x0}" y="${y0}" width="${Wd}" height="${hh}" fill="${C.red}"/></g>`;
  g += `<line x1="${x0}" y1="${y0 + hh}" x2="${x0 + Wd}" y2="${y0 + hh}" ${st(1)}/>`;
  g += `<rect x="${x0}" y="${y0}" width="${Wd}" height="${Hd}" rx="40" fill="none" ${st(1)}/>`;
  const ir = hh * 0.36, icx = x0 + 30 + ir, icy = y0 + hh / 2;
  g += `<rect x="${f(icx - ir)}" y="${f(icy - ir)}" width="${f(ir * 2)}" height="${f(ir * 2)}" rx="${f(ir * 0.42)}" fill="#FFFFFF" ${st(0.8)}/>` + logoIcon(icx, icy + ir * 0.05, ir * 1.85);
  g += text('Escaparate de Tudela', icx + ir + 20, icy + 2, { size: fit('Escaparate de Tudela', 50, Wd - 2 * ir - 90), anchor: 'start', sw: SW * 1.4, sd: 4 });
  // ilustración
  const iy = y0 + hh + 24, ih = 330;
  g += `<rect x="${x0 + 24}" y="${iy}" width="${Wd - 48}" height="${ih}" rx="26" fill="#DDF0E3" ${st(0.8)}/>`;
  for (let i = 0; i < 7; i++) g += `<circle cx="${f(x0 + 70 + i * 82)}" cy="${f(iy + 40 + (i % 2) * 220)}" r="5" fill="#FFFFFF"/>`;
  g += `<g transform="translate(0 ${f(4 * Math.sin(t * 2.4))})">${unitBox(x0 + 120, iy + 10, Wd - 240, ih - 20, ICONS.xmas, 0.95)}</g>`;
  g += seal10(x0 + Wd - 110, iy + 92, 82, o.kSeal === undefined ? 1 : o.kSeal, -12 + 3 * Math.sin(t * 3));
  // textos
  const ty = iy + ih + 70;
  g += text('Decoración de Navidad', x0 + 36, ty, { size: fit('Decoración de Navidad', 62, Wd - 72), anchor: 'start', fill: INK, stroke: null });
  g += pill(x0 + 36 + 105, ty + 100, 210, 78, C.red, 'Oferta', { size: 48 });
  g += text('10 €', x0 + Wd - 40, ty + 98, { size: 100, anchor: 'end', fill: C.red, sw: SW * 1.6, sd: 5 });
  return g;
}
const xmasCard = (x, y, k, rot, t, o) => at(x, y, k, xmasCardLocal(t, o), rot);
// tarjetas del carrusel del móvil (centrada en cx; y arriba; 300 x 430). c.xmas = la de la oferta de 10 €
const CAROUSEL = [
  { label: 'NOVEDAD', l1: 'Pastel', l2: 'nuevo', icon: 'cupcake', bg: '#FFF1C9', col: C.navy },
  { label: 'OFERTA', l1: 'Zapatos', l2: 'en oferta', icon: 'shoe', bg: C.glass, col: C.red },
  { label: 'EVENTO', l1: 'Tarde de', l2: 'música', icon: 'drink', bg: '#FFF1C9', col: C.green },
  { label: 'NOVEDAD', l1: 'Flores de', l2: 'temporada', icon: 'bouquet', bg: '#DDF0E3', col: C.navy },
  { label: 'OFERTA', l1: 'Decoración', l2: 'de Navidad', icon: 'xmas', bg: '#DDF0E3', col: C.red, xmas: true },
  { label: 'OFERTA', l1: 'Bolsos con', l2: 'descuento', icon: 'bag', bg: '#FDE3EC', col: C.red },
  { label: 'EVENTO', l1: 'Tarde de', l2: 'cuentos', icon: 'tortilla', bg: '#FFE8C8', col: C.green }
];
function carCard(cx, y, c, t = 0) {
  const wd = 300, ht = 430, x = cx - wd / 2;
  let g = panel(x, y, wd, ht, 26, '#FFFFFF', 9);
  g += `<rect x="${x + 14}" y="${y + 14}" width="${wd - 28}" height="210" rx="18" fill="${c.bg}" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
  if (c.icon === 'bag') g += bag(cx, y + 206, 1.35, 0, {});
  else g += unitBox(x + 36, y + 22, wd - 72, 196, ICONS[c.icon], 0.95);
  if (c.xmas) g += seal10(x + wd - 52, y + 56, 60, 1, -12);
  else if (c.label === 'OFERTA') g += sealPct(x + wd - 40, y + 40, 32, 1);
  else g += yelStar(x + wd - 40, y + 40, 32);
  g += pill(x + 22 + 82, y + 262, 164, 56, c.col, c.label === 'OFERTA' ? 'Oferta' : (c.label === 'NOVEDAD' ? 'Novedad' : 'Evento'), { size: 34, tsw: SW, swk: 0.8 });
  g += text(c.l1, x + 22, y + 330, { size: fit(c.l1, 42, wd - 44), anchor: 'start', fill: INK, stroke: null });
  g += text(c.l2, x + 22, y + 378, { size: fit(c.l2, 42, wd - 44), anchor: 'start', fill: INK, stroke: null });
  return g;
}
// «¡PUM!» cómic
function pum(x, y, k, t, label = '¡PUM!') {
  if (k <= 0.01) return '';
  let g = '';
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * 2 * PI + 0.2, r1 = 150, r2 = 205 + 18 * (i % 2);
    g += `<line x1="${f(Math.cos(a) * r1)}" y1="${f(Math.sin(a) * r1 * 0.8)}" x2="${f(Math.cos(a) * r2)}" y2="${f(Math.sin(a) * r2 * 0.8)}" stroke="${INK}" stroke-width="${f(SW * 1.3)}" stroke-linecap="round"/>`;
  }
  const d = starPath(150, 104, 13);
  g += `<g transform="scale(1 0.78)"><path d="${d}" transform="translate(9 11)" fill="${INK}"/><path d="${d}" fill="${P7.yel}" stroke="${INK}" stroke-width="${f(SW * 1.3)}" stroke-linejoin="round"/></g>`;
  g += text(label, 0, 4, { size: fit(label, 96, 230, 'G'), font: 'G', fill: C.red, sw: SW * 1.8, sd: 5, ls: 1 });
  return at(x, y, k, g, -8 + 3 * Math.sin(t * 18));
}
// onomatopeya pequeña en una pegatina (¡CHAS!, ¡DING!, ¡TAC!)
function onoma(x, y, k, label, rot, fill = P7.yel, size = 70) {
  if (k <= 0.01) return '';
  return at(x, y, k, text(label, 0, 0, { size, font: 'G', fill, sw: SW * 1.7, sd: 5, ls: 1 }), rot);
}

/* ===================== REGALOS: CAJAS, CARTELICOS Y BOLSA ===================== */
const BOXC = [[C.red, P7.yel], [P7.xgreen, C.red], [P7.blue, C.cream], [P7.yel, C.red], [C.pink, P7.xgreen], [C.navy, P7.yel]];
// cartelico rojo «10 €» con contorno (centro x,y; ancho wd)
function tag10(x, y, wd, rot = 0, k = 1) {
  if (k <= 0.01) return '';
  const ht = wd * 0.58, st = `stroke="${INK}" stroke-width="${f(Math.max(SW * 0.7, wd * 0.045))}" stroke-linejoin="round"`;
  const d = `M${f(-wd / 2 + ht * 0.36)} ${f(-ht / 2)} H${f(wd / 2)} V${f(ht / 2)} H${f(-wd / 2 + ht * 0.36)} L${f(-wd / 2)} 0Z`;
  return at(x, y, k, `<path d="${d}" transform="translate(${f(wd * 0.05)} ${f(wd * 0.05)})" fill="${INK}"/><path d="${d}" fill="${C.red}" ${st}/>
    <circle cx="${f(-wd / 2 + ht * 0.36)}" cy="0" r="${f(ht * 0.11)}" fill="#FFFFFF" ${st}/>` +
    text('10 €', wd * 0.1, ht * 0.04, { size: fit('10 €', ht * 0.66, wd * 0.66), sw: Math.max(SW * 0.9, wd * 0.07), sd: wd * 0.03 }), rot);
}
// caja envuelta con lazo (centro inferior x, base; wd x ht); tag = con cartelico
function giftBox(x, base, wd, ht, ci, o = {}) {
  const [col, rib] = BOXC[ci % BOXC.length], sw = Math.max(SW * 0.7, Math.min(SW, wd * 0.05));
  const st = `stroke="${INK}" stroke-width="${f(sw)}" stroke-linejoin="round"`;
  const x0 = x - wd / 2, top = base - ht, lid = ht * 0.2;
  let g = `<rect x="${f(x0 + wd * 0.06)}" y="${f(top + wd * 0.06)}" width="${f(wd)}" height="${f(ht)}" fill="${INK}"/>`;
  g += `<rect x="${f(x0)}" y="${f(top + lid * 0.6)}" width="${f(wd)}" height="${f(ht - lid * 0.6)}" fill="${col}" ${st}/>`;
  g += `<rect x="${f(x0)}" y="${f(top + lid * 0.6)}" width="${f(wd * 0.18)}" height="${f(ht - lid * 0.6)}" fill="${INK}" opacity="0.15"/>`;
  g += `<rect x="${f(x - wd * 0.08)}" y="${f(top + lid * 0.6)}" width="${f(wd * 0.16)}" height="${f(ht - lid * 0.6)}" fill="${rib}" ${st}/>`;
  g += `<rect x="${f(x0 - wd * 0.05)}" y="${f(top)}" width="${f(wd * 1.1)}" height="${f(lid)}" rx="${f(lid * 0.2)}" fill="${col}" ${st}/>`;
  g += `<rect x="${f(x - wd * 0.08)}" y="${f(top)}" width="${f(wd * 0.16)}" height="${f(lid)}" fill="${rib}" ${st}/>`;
  const bw = wd * 0.26;
  g += `<path d="M${f(x)} ${f(top)} q${f(-bw)} ${f(-bw * 0.9)} ${f(-bw)} ${f(-bw * 0.15)} q${f(bw * 0.1)} ${f(bw * 0.5)} ${f(bw)} ${f(bw * 0.15)} q${f(bw)} ${f(bw * 0.35)} ${f(bw)} ${f(-bw * 0.15)} q0 ${f(-bw * 0.75)} ${f(-bw)} ${f(bw * 0.15)}Z" fill="${rib}" ${st}/>`;
  g += `<circle cx="${f(x)}" cy="${f(top)}" r="${f(bw * 0.24)}" fill="${rib}" ${st}/>`;
  if (o.tag) g += `<path d="M${f(x + wd * 0.22)} ${f(top + lid)} L${f(x + wd * 0.4)} ${f(top + ht * 0.46)}" stroke="${INK}" stroke-width="${f(sw * 0.7)}"/>` + tag10(x + wd * 0.46, top + ht * 0.56, Math.max(60, wd * 0.62), o.tagRot === undefined ? 14 : o.tagRot);
  return g;
}
// bolsa de regalo de papel crema con el logo rojo (centro inferior x, base; s = escala, unos 200 x 240)
function giftBag(x, base, s, rot = 0) {
  const sw = SW / s, st = `stroke="${INK}" stroke-width="${f(sw)}" stroke-linejoin="round"`;
  let g = `<path d="M-60 -170 Q-60 -240 0 -240 Q60 -240 60 -170" fill="none" stroke="${INK}" stroke-width="${f(sw * 3)}" stroke-linecap="round"/><path d="M-60 -170 Q-60 -240 0 -240 Q60 -240 60 -170" fill="none" stroke="${C.red}" stroke-width="${f(sw * 1.4)}" stroke-linecap="round"/>`;
  g += `<path d="M-92 -176 H92 L100 0 H-100Z" transform="translate(10 10)" fill="${INK}"/>`;
  g += `<path d="M-92 -176 H92 L100 0 H-100Z" fill="${C.cream}" ${st}/><path d="M50 -176 H92 L100 0 H62Z" fill="#E9D9D3"/><path d="M-92 -176 H92 L100 0 H-100Z" fill="none" ${st}/>`;
  g += `<path d="M-92 -150 H92" stroke="${C.red}" stroke-width="${f(sw * 1.4)}"/>`;
  g += `<g transform="translate(0 -70)">${logoBadge(0, 0, 150, 0, 1, 'logoR')}</g>`;
  // papel de seda asomando
  g += `<path d="M-50 -176 L-34 -206 L-14 -184 L6 -212 L26 -184 L44 -204 L56 -176Z" fill="${C.pink}" ${st}/>`;
  return `<g transform="translate(${f(x)} ${f(base)}) rotate(${f(rot)}) scale(${f(s)})">${g}</g>`;
}
// posición en el mundo de la mano de Pedro (which = 'F' | 'B'), con bob, inclinación y espejo
function p7Hand(px, py, sc, o, which = 'F') {
  const S = which === 'F' ? [206, 108] : [174, 108];
  let [hx, hy] = armJoints(S, (which === 'F' ? o.armF : o.armB) || {}).H;
  hy += o.bob || 0;
  if (o.lean) { const r = rotV([hx - 190, hy - 214], o.lean); hx = 190 + r[0]; hy = 214 + r[1]; }
  return p7Pt(px, py, sc, hx, hy, o.flip);
}
const handDot = (x, y, sc, fill = P5.skin) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(4.3 * sc)}" fill="${fill}" stroke="${INK}" stroke-width="${f(SW * 2.2 / 3)}"/>`;
// bolsa colgando de una mano (mundo); s = escala de la bolsa
function bagInHand(hx, hy, s, sc, rot = 0) {
  return `<g transform="rotate(${f(rot)} ${f(hx)} ${f(hy)})">${giftBag(hx, hy + 236 * s, s)}</g>` + handDot(hx, hy, sc);
}

/* ===================== TIENDA «REGALOS» ===================== */
function giftShopGeo(x, base, w, h) {
  const top = base - h, ay = top + h * 0.21, ah = h * 0.14;
  const wy = ay + ah + w * 0.06 + h * 0.03;
  const door = { x: x + w * 0.64, w: w * 0.28, y: wy };
  return { x, base, w, h, top, ay, ah, wy, door, dh: base - wy };
}
function giftShop(g, o = {}) {
  const { x, base, w, h, top, ay, ah, wy, door, dh } = g, t = o.t || 0;
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="${C.cream}"/>`;
  s += `<rect x="${f(x + w * 0.9)}" y="${f(top + w * 0.02)}" width="${f(w * 0.1)}" height="${f(h + 30)}" fill="${INK}" opacity="0.15"/>`;
  s += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="none" ${st()}/>`;
  // rótulo REGALOS: letras crema sobre rojo oscuro
  const py = top + h * 0.035, ph = h * 0.135, pw = w * 0.86;
  s += `<rect x="${f(x + (w - pw) / 2 + 10)}" y="${f(py + 10)}" width="${f(pw)}" height="${f(ph)}" rx="${f(ph * 0.25)}" fill="${INK}"/>`;
  s += `<rect x="${f(x + (w - pw) / 2)}" y="${f(py)}" width="${f(pw)}" height="${f(ph)}" rx="${f(ph * 0.25)}" fill="${C.dred}" ${st()}/>`;
  s += text('REGALOS', x + w / 2, py + ph * 0.56, { size: fit('REGALOS', ph * 0.8, pw * 0.84, 'G'), font: 'G', fill: C.cream, sw: SW * 1.5, sd: 5, ls: 6 });
  // guirnalda verde bajo el rótulo
  s += garland(x + w * 0.06, py + ph + 10, x + w * 0.94, py + ph + 10, 22, t, 8, 12);
  s += awning(x + w * 0.04, x + w * 0.96, x - w * 0.03, x + w * 1.03, ay, ah, 8);
  // escaparate con cajas, adornos y cartel «10 €»
  const wx = x + w * 0.05, ww = w * 0.54, wh = base - h * 0.08 - wy;
  s += glassWindow(wx, wy, ww, wh, (X, Y, Wd, Hd) => {
    let it = garland(X, Y + 18, X + Wd, Y + 18, 30, t, 6, 11);
    it += `<line x1="${f(X)}" y1="${f(Y + Hd * 0.86)}" x2="${f(X + Wd)}" y2="${f(Y + Hd * 0.86)}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
    it += giftBox(X + Wd * 0.24, Y + Hd * 0.86, Wd * 0.3, Hd * 0.28, 0) + giftBox(X + Wd * 0.24, Y + Hd * 0.86 - Hd * 0.28, Wd * 0.2, Hd * 0.18, 2);
    it += giftBox(X + Wd * 0.6, Y + Hd * 0.86, Wd * 0.24, Hd * 0.36, 1) + giftBox(X + Wd * 0.85, Y + Hd * 0.86, Wd * 0.18, Hd * 0.2, 3);
    it += unitBox(X + Wd * 0.62, Y + Hd * 0.1, Wd * 0.34, Hd * 0.34, ICONS.xmas, 0.95);
    it += tag10(X + Wd * 0.3, Y + Hd * 0.3, Wd * 0.34, -8 + 3 * Math.sin(t * 2.6), o.kTag === undefined ? 1 : o.kTag);
    return it;
  });
  s += `<rect x="${f(wx - w * 0.02)}" y="${f(wy + wh)}" width="${f(ww + w * 0.04)}" height="${f(h * 0.03)}" rx="4" fill="#FFFFFF" ${st()}/>`;
  // puerta con cristal y campanilla
  s += `<rect x="${f(door.x)}" y="${f(door.y)}" width="${f(door.w)}" height="${f(dh + 10)}" rx="${f(door.w * 0.06)}" fill="${C.dred}" ${st()}/>`;
  s += `<rect x="${f(door.x + door.w * 0.16)}" y="${f(door.y + door.w * 0.14)}" width="${f(door.w * 0.68)}" height="${f(dh * 0.44)}" rx="${f(door.w * 0.05)}" fill="${C.glass}" ${st(0.8)}/>`;
  s += `<path d="M${f(door.x + door.w * 0.5)} ${f(door.y + door.w * 0.2)} l${f(door.w * 0.18)} 0 l${f(-door.w * 0.4)} ${f(dh * 0.36)} l${f(-door.w * 0.18)} 0Z" fill="#FFFFFF" opacity="0.5"/>`;
  s += `<circle cx="${f(door.x + door.w * 0.84)}" cy="${f(door.y + dh * 0.58)}" r="${f(door.w * 0.05)}" fill="${P7.yel}" ${st(0.7)}/>`;
  const bx = door.x + door.w * 0.86, by = door.y - 4, br = w * 0.036;
  s += `<path d="M${f(bx - 30)} ${f(by - 14)} H${f(bx)} V${f(by)}" fill="none" ${st(0.9)} stroke-linecap="round"/>`;
  s += `<g transform="translate(${f(bx)} ${f(by)}) rotate(${f(o.bell || 0)})"><circle cx="0" cy="${f(br * 1.55)}" r="${f(br * 0.32)}" fill="${C.dred}" ${st(0.6)}/><path d="M${f(-br)} ${f(br * 1.35)} Q${f(-br)} 0 0 0 Q${f(br)} 0 ${f(br)} ${f(br * 1.35)} Z" fill="${P7.yel}" ${st(0.8)}/></g>`;
  return s;
}
// adornos sueltos para las estanterías (centro inferior x, base; s escala de unos 100 px)
function ornament(type, x, base, s, t = 0, i = 0) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  switch (type) {
    case 'ball': { const r = 34 * s, col = BULBS[i % 5]; return `<rect x="${f(x - 8 * s)}" y="${f(base - 2 * r - 12 * s)}" width="${f(16 * s)}" height="${f(14 * s)}" rx="3" fill="${P7.yel}" ${st(0.7)}/><circle cx="${f(x + 5)}" cy="${f(base - r + 5)}" r="${f(r)}" fill="${INK}"/><circle cx="${f(x)}" cy="${f(base - r)}" r="${f(r)}" fill="${col}" ${st()}/><path d="M${f(x - r)} ${f(base - r)} Q${f(x)} ${f(base - r * 0.5)} ${f(x + r)} ${f(base - r)}" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}"/><circle cx="${f(x - r * 0.4)}" cy="${f(base - r * 1.4)}" r="${f(r * 0.18)}" fill="#FFFFFF"/>`; }
    case 'tree': return xmasTree(x, base, 150 * s, t + i, {});
    case 'candle': return `<rect x="${f(x - 18 * s)}" y="${f(base - 80 * s)}" width="${f(36 * s)}" height="${f(80 * s)}" rx="6" fill="${C.cream}" ${st()}/><path d="M${f(x - 18 * s)} ${f(base - 40 * s)} H${f(x + 18 * s)}" stroke="${C.red}" stroke-width="${f(SW * 1.4)}"/><path d="M${f(x)} ${f(base - 80 * s)} V${f(base - 92 * s)}" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/><path d="M${f(x)} ${f(base - 124 * s - 3 * Math.sin(t * 9 + i))} Q${f(x + 14 * s)} ${f(base - 100 * s)} ${f(x)} ${f(base - 92 * s)} Q${f(x - 14 * s)} ${f(base - 100 * s)} ${f(x)} ${f(base - 124 * s - 3 * Math.sin(t * 9 + i))}Z" fill="${P7.yel}" ${st(0.8)}/>`;
    case 'wreath': { const r = 44 * s, cy = base - r - 6 * s; let g = `<circle cx="${f(x)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 3.4)}"/><circle cx="${f(x)}" cy="${f(cy)}" r="${f(r)}" fill="none" stroke="${P7.xgreen}" stroke-width="${f(SW * 1.8)}"/>`; [[0, -1], [0.87, 0.5], [-0.87, 0.5]].forEach(([a, b]) => { g += `<circle cx="${f(x + a * r)}" cy="${f(cy + b * r)}" r="${f(8 * s + 2)}" fill="${C.red}" ${st(0.6)}/>`; }); return g; }
    case 'star': return at(x, base - 40 * s, 1, `<path d="${starPath(40 * s, 18 * s, 5)}" transform="translate(4 4)" fill="${INK}"/><path d="${starPath(40 * s, 18 * s, 5)}" fill="${P7.yel}" ${st()}/>`, 8 * Math.sin(t * 2 + i));
    case 'globe': return `<rect x="${f(x - 34 * s)}" y="${f(base - 22 * s)}" width="${f(68 * s)}" height="${f(22 * s)}" rx="5" fill="${C.wood}" ${st()}/><circle cx="${f(x)}" cy="${f(base - 58 * s)}" r="${f(38 * s)}" fill="${C.glass}" ${st()}/>${xmasTree(x, base - 26 * s, 60 * s, t, {})}<path d="M${f(x - 22 * s)} ${f(base - 74 * s)} A${f(26 * s)} ${f(26 * s)} 0 0 1 ${f(x - 4 * s)} ${f(base - 88 * s)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" fill="none" stroke-linecap="round"/>`;
  }
  return '';
}
// interior de la tienda: pared crema con puntos, estanterías llenas, mostrador con caja registradora
const GI = { floor: 1440, shelves: [520, 780, 1040], counter: 1120, door: { x: 46, y: 760, w: 220, h: 680 } };
function giftInterior(T, o = {}) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = dotWall();
  s += garland(-30, 200, W + 30, 210, 60, T, 11);
  s += `<rect x="-20" y="${GI.floor}" width="${W + 40}" height="${H - GI.floor + 20}" fill="${C.wood}"/>`;
  for (let i = 0; i < 7; i++) s += `<line x1="${-40 + i * 200}" y1="${GI.floor}" x2="${-180 + i * 200}" y2="${H}" ${st(0.5)}/>`;
  s += `<line x1="-20" y1="${GI.floor}" x2="${W + 20}" y2="${GI.floor}" ${st()}/>`;
  // estanterías a la derecha, llenas de regalos y adornos
  const sx0 = 400, sx1 = 1060;
  GI.shelves.forEach((y, r) => {
    const taken = o.taken && r === 1;
    if (r === 0) {
      [['ball', 450, 0.9], ['tree', 560, 0.8], ['ball', 668, 1.1], ['candle', 760, 0.9], ['wreath', 870, 1.0], ['star', 990, 1.0]].forEach(([ty, x, sc], i) => { s += ornament(ty, x, y - 4, sc, T, i); });
    } else if (r === 1) {
      s += giftBox(470, y - 2, 120, 110, 0, { tag: true });
      if (!taken) s += giftBox(640, y - 2, 140, 130, 1, { tag: true });
      s += giftBox(820, y - 2, 110, 150, 2, { tag: true }) + giftBox(980, y - 2, 120, 100, 3, { tag: true });
    } else {
      s += ornament('globe', 460, y - 4, 1.0, T, 1) + giftBox(600, y - 2, 130, 120, 4, { tag: true }) + ornament('ball', 730, y - 4, 1.0, T, 2);
      s += giftBox(860, y - 2, 120, 140, 5, { tag: true }) + ornament('candle', 1000, y - 4, 1.0, T, 3);
    }
    s += `<rect x="${sx0 + 8}" y="${y + 8}" width="${sx1 - sx0}" height="26" rx="6" fill="${INK}"/><rect x="${sx0}" y="${y}" width="${sx1 - sx0}" height="26" rx="6" fill="${C.wood}" ${st()}/>`;
    s += `<path d="M${sx0 + 40} ${y + 26} l20 34 M${sx1 - 40} ${y + 26} l-20 34" ${st(1.2)} stroke-linecap="round"/>`;
  });
  // puerta (izquierda) con campanilla
  const { x, y, w, h } = GI.door;
  s += `<rect x="${x - 16}" y="${y - 16}" width="${w + 32}" height="${h + 16}" rx="12" fill="${C.wood}" ${st()}/>`;
  const open = clamp(o.open || 0), lw = w * (1 - 0.84 * open);
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${XSKY[1]}"/><rect x="${x}" y="${y + h - 140}" width="${w}" height="140" fill="${C.ground}"/><line x1="${x}" y1="${y + h - 140}" x2="${x + w}" y2="${y + h - 140}" ${st(0.8)}/>`;
  s += `<path d="M${x} ${y} L${f(x + lw)} ${f(y - 20 * open)} L${f(x + lw)} ${f(y + h + 20 * open)} L${x} ${y + h}Z" fill="${C.dred}" ${st()}/>`;
  if (open < 0.5) s += `<rect x="${f(x + lw * 0.16)}" y="${y + 30}" width="${f(lw * 0.68)}" height="280" rx="10" fill="${C.glass}" ${st(0.8)}/>`;
  const bx = x + w - 30, by = y - 16;
  s += `<path d="M${bx} ${by - 30} V${by}" ${st(0.8)}/><g transform="translate(${bx} ${by}) rotate(${f(o.bell || 0)})"><circle cx="0" cy="48" r="9" fill="${C.dred}" ${st(0.6)}/><path d="M-30 42 Q-30 0 0 0 Q30 0 30 42 Z" fill="${P7.yel}" ${st(0.8)}/></g>`;
  return s;
}
function giftCounter(o = {}) {
  const top = GI.counter, x0 = 520, st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = register(900, top, o.drawer || 0, false);
  s += `<rect x="${x0 + 10}" y="${top + 28}" width="${W - x0 + 40}" height="${H - top}" fill="${INK}"/>`;
  s += `<rect x="${x0}" y="${top + 20}" width="${W - x0 + 40}" height="${H - top}" fill="${C.wood}" ${st()}/>`;
  for (let x = x0 + 80; x < W; x += 150) s += `<rect x="${x}" y="${top + 22}" width="44" height="${H - top}" fill="${C.woodS}" opacity="0.5"/>`;
  s += `<rect x="${x0 - 20}" y="${top - 6}" width="${W - x0 + 60}" height="34" rx="10" fill="#C98A4B" ${st()}/>`;
  s += garland(x0, top + 40, W + 20, top + 40, 40, o.t || 0, 6, 13);
  return s;
}

/* ===================== BAR NAVIDEÑO ===================== */
function beerTap(x, top) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = `<rect x="${x - 70}" y="${top - 30}" width="140" height="30" rx="8" fill="#B9B0AD" ${st()}/>`;
  s += `<rect x="${x - 18}" y="${top - 200}" width="36" height="172" rx="10" fill="#D9D2CF" ${st()}/>`;
  s += `<rect x="${x - 10}" y="${top - 188}" width="8" height="140" rx="4" fill="#FFFFFF" opacity="0.6"/>`;
  s += `<path d="M${x + 18} ${top - 170} H${x + 70} V${top - 140} H${x + 58} V${top - 152} H${x + 18}Z" fill="#D9D2CF" ${st()}/>`;
  s += `<rect x="${x - 22}" y="${top - 300}" width="44" height="110" rx="14" fill="${C.red}" ${st()}/><rect x="${x - 22}" y="${top - 262}" width="44" height="16" fill="${P7.yel}" ${st(0.6)}/>`;
  return s;
}
function xmasBarBack(T) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}"`;
  let s = `<rect width="${W}" height="${H}" fill="${P5.warmCream}"/>`;
  for (let x = 60; x < W; x += 150) s += `<rect x="${x}" y="0" width="56" height="${H}" fill="${P5.peach}" opacity="0.7"/>`;
  s += `<rect x="0" y="0" width="${W}" height="80" fill="${P5.woodS}"/><line x1="0" y1="80" x2="${W}" y2="80" ${st()}/>`;
  s += garland(-30, 150, 560, 170, 80, T, 8) + garland(520, 170, W + 30, 150, 80, T, 8);
  // puerta de entrada a la izquierda
  s += `<rect x="30" y="560" width="270" height="560" rx="12" fill="${P5.wood}" ${st()}/><rect x="52" y="582" width="226" height="540" fill="${XSKY[1]}" ${st(0.8)}/>`;
  s += `<rect x="52" y="980" width="226" height="142" fill="${C.ground}"/><line x1="52" y1="980" x2="278" y2="980" ${st(0.8)}/>`;
  // estantes con botellas y vasos (genéricos, sin etiquetas)
  s += shelf(560, 1060, 520) + shelf(560, 1060, 700);
  [[610, 104, 0], [680, 124, 1], [748, 96, 2], [812, 128, 3], [880, 110, 4], [948, 120, 1], [1012, 98, 5]].forEach(([x, h, c]) => { s += bottle(x, 520, h, BOTTLE_C[c]); });
  for (let i = 0; i < 7; i++) s += tumbler(600 + i * 68, 700, 62 + (i % 2) * 8);
  // corona en la pared y lámparas
  s += ornament('wreath', 430, 470, 1.5, T, 0);
  s += lamp(200, 340, 1.2 * Math.sin(T * 1.7)) + lamp(860, 330, 1.2 * Math.sin(T * 1.5 + 1));
  return s;
}
// gorro de Navidad (local de folk: sobre la cabeza 190,78)
function santaHat(w) {
  return `<path d="M175 70 Q178 52 194 52 Q206 54 214 66 L208 70 Q202 62 196 62 Q186 62 205 70Z" fill="${C.red}" stroke="${INK}" stroke-width="${w(2.4)}" stroke-linejoin="round"/>
    <path d="M174.5 72 Q190 64 206 71 L205 76 Q190 69 175 77Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(2.2)}" stroke-linejoin="round"/>
    <circle cx="215" cy="68" r="4" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(2)}"/>`;
}
