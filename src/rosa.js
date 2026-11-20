/* Vídeo 03 — personajes y decorados nuevos: Rosa (referencia SVG exacta, suelo en y=208), gente de la cola,
   pasteles, vitrina, mostrador, caja registradora, interior de la panadería, monedas y confeti. */
'use strict';

/* ================= ROSA ================= */
const ROSA_SHOE = '#5A4137';
function rosaFace(o, w) {
  const e = o.expr || 'happy', lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const P = (cx, cy, r = 2) => `<circle cx="${f(cx + lx)}" cy="${f(cy + ly)}" r="${r}" fill="${INK}"/>`;
  const L = (d, sw = 1.6) => `<path d="${d}" stroke="${INK}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const blush = `<circle cx="200" cy="89" r="3" fill="${C.pink}" opacity="0.6"/>`;
  const drop = `<path d="M210.5 63 Q215 70 210.5 72.4 Q206 70 210.5 63Z" fill="${C.glass}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/><circle cx="209.4" cy="69.6" r="0.9" fill="#FFFFFF"/>`;
  const openSmile = (d = 'M195.6 87 Q200.4 94.6 205.2 87 Z') => `<path d="${d}" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
  const eyes = (cy = 81) => o.blink ? L(`M194 ${cy + 0.2} H198 M202 ${cy + 0.2} H206`, 1.8) : P(196, cy) + P(204, cy);
  switch (e) {
    case 'worried':
      return eyes(82) + L('M193.8 75.8 L198 73.4 M202 73.4 L206.2 75.8') + blush + L('M195.4 90.4 q1.6 -1.9 3.2 0 t3.2 0 t3.2 0', 1.8) + drop;
    case 'idea': {
      const big = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="3.3" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.5)}"/><circle cx="${f(cx + 0.6 + lx * 0.5)}" cy="${f(cy + 0.2 + ly * 0.5)}" r="1.5" fill="${INK}"/>`;
      return big(196, 80.6) + big(204, 80.6) + L('M193.4 73.2 Q195.8 70.8 198.4 72.6 M201.6 72.6 Q204.2 70.8 206.6 73.2', 1.7) + blush + openSmile('M196 87.4 Q200.6 93.6 205 87.4 Z');
    }
    case 'sparkle':
      return `<circle cx="196" cy="80.8" r="3.3" fill="${INK}"/><circle cx="204" cy="80.8" r="3.3" fill="${INK}"/>
        <circle cx="197.1" cy="79.6" r="1.2" fill="#FFFFFF"/><circle cx="205.1" cy="79.6" r="1.2" fill="#FFFFFF"/>` +
        L('M193.6 74.4 Q195.9 72.4 198.2 74 M201.8 74 Q204.1 72.4 206.4 74.4') + blush + openSmile();
    case 'focus': // concentrada, con la lengua un poco fuera
      return (o.blink ? eyes(82.4) : P(196.6, 82.4, 1.8) + P(204.6, 82.4, 1.8)) + L('M194 77.6 L198 77.2 M202 77.2 L206 77.8', 1.7) + blush +
        L('M196.8 89.4 Q200 90.6 203.2 89.4', 1.8) +
        `<path d="M201.6 89.9 Q202.2 93.4 204.2 92.8 Q205.6 92 204.4 89.4Z" fill="${C.pink}" stroke="${INK}" stroke-width="${w(1.3)}" stroke-linejoin="round"/>`;
    case 'tired': // agotada y feliz: ojos cerrados con arrugas, sonrisa grande, gota de sudor
      return L('M193.6 82 Q196 79 198.4 82 M201.6 82 Q204 79 206.4 82', 1.8) + L('M207.6 78.6 l2 -1.2 M207.8 82.2 l2.1 0.7', 1.3) +
        L('M194 76 L198 75.4 M202 75.4 L206 76') + blush + openSmile('M195 86.4 Q200.6 96 206 86.4 Z') + drop;
    case 'surprise': {
      const big = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="3.2" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.5)}"/><circle cx="${f(cx + 0.5)}" cy="${f(cy + 0.3)}" r="1.15" fill="${INK}"/>`;
      return big(196, 80.6) + big(204, 80.6) + L('M193.4 73.8 Q195.8 71.6 198.4 73.4 M201.6 73.4 Q204.2 71.6 206.6 73.8', 1.7) +
        `<ellipse cx="200.6" cy="89.6" rx="2.2" ry="2.9" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
    }
    case 'smile':
      return eyes() + L('M194 76 L198 75 M202 75 L206 76') + blush + openSmile();
    case 'wink':
      return L('M193.6 81.6 Q196 78.8 198.4 81.6', 1.9) + P(204, 81) + L('M194 76 L198 75 M202 75 L206 76') + blush + openSmile();
    default: // contenta (referencia)
      return eyes() + L('M194 76 L198 75 M202 75 L206 76', 1.6) + blush + L('M196 89 Q200 93 205 89', 2);
  }
}
// Rosa en coordenadas locales (suelo y=208, mira a la derecha). o: expr, look, blink, armF, armB, bob, head, lean, handF, handB, front0, front, noLegs
function rosa(o) {
  const k = o.k || 1, w = v => f(v * k);
  const st = (v = 3) => `stroke="${INK}" stroke-width="${w(v)}"`;
  const lj = 'stroke-linejoin="round"';
  let g = '';
  if (!o.noLegs) {
    g += `<rect x="181" y="150" width="9" height="52" rx="4" fill="${C.navy}" ${st()}/>
      <path d="M178 202 h17 a5 5 0 0 1 0 6 h-17z" fill="${ROSA_SHOE}" ${st()} ${lj}/>
      <rect x="192" y="150" width="9" height="52" rx="4" fill="${C.navy}" ${st()}/>
      <path d="M189 202 h17 a5 5 0 0 1 0 6 h-17z" fill="${ROSA_SHOE}" ${st()} ${lj}/>`;
  }
  const armB = o.armB || 0, armF = o.armF || 0, lean = o.lean || 0;
  let b = '';
  if (o.behind) b += o.behind(w);
  b += `<g transform="rotate(${f(armB)} 176 110)"><rect x="172" y="108" width="7" height="36" rx="3.5" fill="${C.skinS}" ${st()}/><rect x="170" y="104" width="11" height="16" rx="4" fill="${C.red}" ${st()}/>` +
    (o.handB ? `<g transform="rotate(${f(-armB - lean)} 175.5 142)">${o.handB(w)}</g>` : '') + `</g>`;
  b += `<rect x="172" y="100" width="36" height="54" rx="12" fill="${C.red}" ${st()}/>
    <path d="M178 104 L202 104 L207 154 L173 154Z" fill="#FFFFFF"/>
    <path d="M178 104 L184 104 L184 154 L173 154Z" fill="#E2D6D3"/>
    <path d="M178 104 L202 104 L207 154 L173 154Z" fill="none" ${st()} ${lj}/>
    <rect x="186" y="130" width="14" height="12" rx="3" fill="${C.cream}" ${st(2.5)}/>
    <path d="M180 104 Q190 94 200 104" stroke="${INK}" stroke-width="${w(2.5)}" fill="none" stroke-linecap="round"/>`;
  if (o.front0) b += o.front0(w);
  b += `<g transform="rotate(${f(armF)} 204 110)"><rect x="201" y="108" width="7" height="36" rx="3.5" fill="${C.skin}" ${st()}/><rect x="199" y="104" width="11" height="16" rx="4" fill="${C.red}" ${st()}/>` +
    (o.handF ? `<g transform="rotate(${f(-armF - lean)} 204.5 142)">${o.handF(w)}</g>` : '') + `</g>`;
  let hd = `<circle cx="177" cy="62" r="7" fill="${C.hair}" ${st()}/>
    <circle cx="190" cy="80" r="15" fill="${C.skin}" ${st()}/>
    <path d="M175 78 Q175 62 191 62 Q206 62 205 76 Q198 68 175 78Z" fill="${C.hair}" ${st()} ${lj}/>
    <path d="M175 70 Q190 60 206 70 L205 75 Q190 66 176 76Z" fill="${C.red}" ${st()} ${lj}/>
    <circle cx="186" cy="68" r="1.4" fill="#FFFFFF"/><circle cx="194" cy="67" r="1.4" fill="#FFFFFF"/><circle cx="201" cy="70" r="1.4" fill="#FFFFFF"/>`;
  hd += rosaFace(o, w);
  b += `<g transform="rotate(${f(o.head || 0)} 190 96)">${hd}</g>`;
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  if (lean) g = `<g transform="rotate(${f(lean)} 190 208)">${g}</g>`;
  return g;
}
function placeRosa(px, py, ax, ay, sc, o) {
  o.k = (o.sw || SW) / (3 * sc);
  const sx = o.flip ? -sc : sc;
  return `<g transform="translate(${f(px - ax * sx)} ${f(py - ay * sc)}) scale(${f(sx)} ${f(sc)})">${rosa(o)}</g>`;
}
// animaciones base de Rosa
const breath = T => -2 * (0.5 - 0.5 * Math.cos(2 * PI * T / 1.6));      // sube y baja 2 px cada 1,6 s
const blinkAt = T => ((T + 0.7) % 3) < 0.13;                             // parpadeo cada 3 s
// objetos en la mano de Rosa (mano en 204.5,143 en local; el grupo ya está enderezado)
const rHand = (w, x = 204.5, y = 143, fill = C.skin) => `<circle cx="${x}" cy="${y}" r="4.2" fill="${fill}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
function rosaPhone(rot = -10, lit = true) {
  return w => `<g transform="rotate(${f(rot)} 205 136)"><rect x="198" y="121" width="15" height="25" rx="3" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/><rect x="200" y="123.6" width="11" height="19" rx="1.5" fill="${lit ? '#FFFFFF' : C.glass}"/>` +
    (lit ? `<rect x="200" y="123.6" width="11" height="5" fill="${C.red}"/><rect x="201.4" y="130.5" width="8" height="5" rx="1" fill="${C.pink}"/><rect x="201.4" y="137.4" width="6" height="2" rx="1" fill="${INK}" opacity="0.5"/>` : '') + `</g>` + rHand(w);
}
function thumbUp(w) {
  return `<rect x="201.6" y="128.5" width="5.4" height="13" rx="2.7" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2)}"/>
    <rect x="198.5" y="138" width="13" height="11" rx="4" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>
    <path d="M201 141.6 H208 M201 145 H208" stroke="${INK}" stroke-width="${w(1.2)}" stroke-linecap="round"/>`;
}
function bulb(x, y, r, k, t) {
  if (k <= 0.01) return '';
  let s = '';
  for (let i = 0; i < 8; i++) {
    const a = (-90 + (i - 3.5) * 26) * PI / 180, r1 = r * 1.35, r2 = r * (1.75 + 0.12 * Math.sin(t * 16 + i));
    if (i === 0 || i === 7) continue;
    s += `<line x1="${f(Math.cos(a) * r1)}" y1="${f(Math.sin(a) * r1)}" x2="${f(Math.cos(a) * r2)}" y2="${f(Math.sin(a) * r2)}" stroke="${INK}" stroke-width="${f(SW * 1.1)}" stroke-linecap="round"/>`;
  }
  s += `<circle cx="7" cy="7" r="${r}" fill="${INK}"/>`;
  s += `<path d="M${f(-r * 0.42)} ${f(r * 0.82)} H${f(r * 0.42)} V${f(r * 1.32)} H${f(-r * 0.42)}Z" fill="${C.navy}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
  s += `<path d="M${f(-r * 0.42)} ${f(r * 1.07)} H${f(r * 0.42)}" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
  s += `<circle r="${r}" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<path d="M${f(-r * 0.25)} ${f(r * 0.4)} L${f(-r * 0.12)} ${f(-r * 0.05)} L0 ${f(r * 0.25)} L${f(r * 0.12)} ${f(-r * 0.05)} L${f(r * 0.25)} ${f(r * 0.4)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.7)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="M${f(-r * 0.6)} ${f(-r * 0.2)} A${f(r * 0.62)} ${f(r * 0.62)} 0 0 1 ${f(-r * 0.2)} ${f(-r * 0.6)}" stroke="#FFFFFF" stroke-width="${f(SW * 1.1)}" fill="none" stroke-linecap="round"/>`;
  return at(x, y, k, s, 6 * Math.sin(t * 9));
}

/* ================= GENTE DE LA COLA =================
   Sistema local igual que Marta (suelo y=204, cabeza en 190,78, mira a la derecha). */
const GRAYH = '#E6DEDA';
const FOLK = [
  { id: 'abuelo', skin: '#F6C9A0', skinS: '#E9B88F', hair: 'gray', hairC: GRAYH, top: 'coat', topC: '#A9743F', topS: '#7E5328', pants: '#5A4137', shoe: '#1E1A1A', cane: true, glasses: true, beard: GRAYH, scale: 0.95, bend: 5 },
  { id: 'joven', skin: '#D9A27A', skinS: '#C08A63', hair: 'short', hairC: '#1E1A1A', top: 'hoodie', topC: '#3C9D5D', topS: '#2C7A47', pants: '#2D4A6B', shoe: '#FFFFFF', phones: true },
  { id: 'carrito', skin: '#F6C9A0', skinS: '#E9B88F', hair: 'bun', hairC: '#A0522D', top: 'tee', topC: '#F48FB1', topS: '#D9739A', skirt: '#2D4A6B', shoe: '#8E1B1B', cart: true },
  { id: 'traje', skin: '#E9B88F', skinS: '#D39F76', hair: 'short', hairC: '#3A2A20', top: 'suit', topC: '#4A5563', topS: '#363F4A', pants: '#363F4A', shoe: '#1E1A1A', scale: 1.05 },
  { id: 'rizos', skin: '#B97F5A', skinS: '#9E6A48', hair: 'curly', hairC: '#1E1A1A', top: 'tee', topC: '#F2C12E', topS: '#C99A1E', pants: '#2D4A6B', shoe: '#D32F2F' },
  { id: 'gorra', skin: '#F6C9A0', skinS: '#E9B88F', hair: 'cap', hairC: '#C58B3B', capC: '#D32F2F', top: 'tee', topC: '#2D4A6B', topS: '#22394F', pants: '#A9743F', shoe: '#FFFFFF', scale: 0.8 },
  { id: 'melena', skin: '#E9B88F', skinS: '#D39F76', hair: 'long', hairC: '#C58B3B', top: 'dress', topC: '#3C9D5D', topS: '#2C7A47', shoe: '#1E1A1A' },
  { id: 'gafas', skin: '#F6C9A0', skinS: '#E9B88F', hair: 'short', hairC: '#8A8580', top: 'tee', topC: '#BFE3F2', topS: '#93C3D8', pants: '#5A4137', shoe: '#5A4137', glasses: true, beard: '#8A8580' },
  { id: 'abuela', skin: '#F6C9A0', skinS: '#E9B88F', hair: 'bun', hairC: GRAYH, top: 'coat', topC: '#8E1B1B', topS: '#6E1414', skirt: '#5A4137', shoe: '#1E1A1A', glasses: true, scale: 0.92 },
  { id: 'coleta', skin: '#D9A27A', skinS: '#C08A63', hair: 'pony', hairC: '#1E1A1A', top: 'hoodie', topC: '#F48FB1', topS: '#D9739A', pants: '#2D4A6B', shoe: '#FFFFFF', scale: 0.9 },
  { id: 'barba', skin: '#E9B88F', skinS: '#D39F76', hair: 'short', hairC: '#5A3A2A', top: 'tee', topC: '#D32F2F', topS: '#A32323', pants: '#2D4A6B', shoe: '#5A4137', beard: '#5A3A2A', scale: 1.04 },
  { id: 'pelirroja', skin: '#F6C9A0', skinS: '#E9B88F', hair: 'long', hairC: '#C8552B', top: 'tee', topC: '#FFF5F3', topS: '#E2D6D3', skirt: '#F2C12E', shoe: '#2D4A6B' }
];
function folk(o) {
  const p = o.p, k = o.k || 1, w = v => f(v * k);
  const st = (v = 3) => `stroke="${INK}" stroke-width="${w(v)}" stroke-linejoin="round"`;
  const skirt = !!p.skirt || p.top === 'dress';
  const leg = (ang, back) => {
    let g = skirt ? `<rect x="186" y="146" width="7" height="52" rx="3.5" fill="${back ? p.skinS : p.skin}" ${st()}/>`
      : `<rect x="185" y="140" width="9" height="57" rx="4" fill="${p.pants}" ${st()}/>` + (back ? `<rect x="185" y="140" width="9" height="57" rx="4" fill="${INK}" opacity="0.18"/>` : '');
    g += `<path d="M182.5 195.5 h16 a4.5 4.5 0 0 1 0 8.5 h-16z" fill="${p.shoe}" ${st()}/>`;
    return `<g transform="rotate(${f(ang)} 190 146)">${g}</g>`;
  };
  const long = p.top !== 'tee' && p.top !== 'dress';
  const arm = (pv, ang, back, extra) => {
    const x = back ? 174 : 199;
    let g = long ? `<rect x="${x - 0.5}" y="105" width="8" height="33" rx="4" fill="${back ? p.topS : p.topC}" ${st()}/>`
      : `<rect x="${x}" y="110" width="7" height="28" rx="3.5" fill="${back ? p.skinS : p.skin}" ${st()}/><rect x="${x - 1}" y="104" width="9" height="13" rx="4" fill="${back ? p.topS : p.topC}" ${st()}/>`;
    g += hand(x + 3.5, 139.5, w, back ? p.skinS : p.skin);
    if (extra) g += `<g transform="rotate(${f(-ang - (o.lean || 0))} ${x + 3.5} 140)">${extra}</g>`;
    return `<g transform="rotate(${f(ang)} ${pv[0]} ${pv[1]})">${g}</g>`;
  };
  let g = '';
  if (p.cart) { // carrito de la compra detrás
    g += `<path d="M150 200 L163 150" stroke="${INK}" stroke-width="${w(2.6)}" stroke-linecap="round"/>
      <rect x="138" y="158" width="26" height="36" rx="5" fill="${C.red}" ${st()}/><path d="M138 168 H164" stroke="${INK}" stroke-width="${w(1.6)}"/>
      <circle cx="146" cy="198" r="6" fill="${C.navy}" ${st()}/><circle cx="146" cy="198" r="2" fill="${C.cream}"/>`;
  }
  g += leg(o.legB || 0, true) + leg(o.legF || 0, false);
  let b = '';
  // brazo trasero (carrito o bastón)
  let extraB = o.handB ? o.handB(w) : '';
  if (p.cane && !o.handB) extraB = `<path d="M177.5 140 L177 203 M177.5 140 Q178 133 184 134" stroke="${C.woodS}" stroke-width="${w(3.6)}" fill="none" stroke-linecap="round"/><path d="M177.5 140 L177 203 M177.5 140 Q178 133 184 134" stroke="${C.wood}" stroke-width="${w(1.6)}" fill="none" stroke-linecap="round"/>`;
  const armBang = p.cart ? 26 : (p.cane ? -14 : (o.armB || 0));
  if (p.cart) b += `<line x1="163" y1="150" x2="${f(handAt([178, 108], 26)[0])}" y2="${f(handAt([178, 108], 26)[1])}" stroke="${INK}" stroke-width="${w(2.6)}" stroke-linecap="round"/>`;
  // pelo trasero
  if (p.hair === 'long') b += `<path d="M191 61 Q171 61 171 82 Q170 99 173 107 Q181 110 189 105 L191 88Z" fill="${p.hairC}" ${st()}/>`;
  if (p.hair === 'pony') b += `<g transform="rotate(${f(o.pony || 0)} 178 70)"><path d="M180 66 Q154 66 158 94 Q160 104 166 108 Q170 90 182 78Z" fill="${p.hairC}" ${st()}/></g>`;
  if (p.hair === 'bun') b += `<circle cx="176" cy="65" r="7" fill="${p.hairC}" ${st()}/>`;
  b += arm([178, 108], armBang, true, extraB);
  // torso
  let tor = `<rect x="186.5" y="86" width="7" height="14" rx="2" fill="${p.skinS}" ${st()}/>`;
  const bodyLen = p.top === 'coat' ? 158 : (p.top === 'dress' ? 160 : 142);
  if (p.skirt) tor += `<path d="M177 136 H203 L208 166 Q190 170 172 166Z" fill="${p.skirt}" ${st()}/>`;
  const torso = `M178 98 Q190 94 202 98 L${p.top === 'dress' || p.top === 'coat' ? 210 : 205} ${bodyLen} Q190 ${bodyLen + 4} ${p.top === 'dress' || p.top === 'coat' ? 170 : 175} ${bodyLen}Z`;
  tor += `<path d="${torso}" fill="${p.topC}"/><path d="M178 98 L186 97 L186 ${bodyLen + 2} Q178 ${bodyLen + 1} ${p.top === 'dress' || p.top === 'coat' ? 170 : 175} ${bodyLen}Z" fill="${p.topS}"/><path d="${torso}" fill="none" ${st()}/>`;
  if (p.top === 'suit') tor += `<path d="M184 97.5 L190 113 L196 97.5Z" fill="#FFFFFF" ${st(2)}/><path d="M189 100 H191 L192.6 113 L190 117 L187.4 113Z" fill="${C.red}" ${st(1.6)}/>
    <path d="M183 98 L188 118 M197 98 L192 118" stroke="${INK}" stroke-width="${w(1.6)}" fill="none"/><circle cx="196" cy="126" r="1.3" fill="${INK}"/><circle cx="196" cy="134" r="1.3" fill="${INK}"/>`;
  if (p.top === 'hoodie') tor += `<path d="M180 98 Q176 90 184 88 L196 88 Q203 90 200 98" fill="${p.topS}" ${st(2.2)}/><path d="M182 124 H200 L198 136 H184Z" fill="${p.topS}" ${st(1.8)}/><path d="M188 99 V110 M192 99 V109" stroke="#FFFFFF" stroke-width="${w(1.6)}" stroke-linecap="round"/>`;
  if (p.top === 'coat') tor += `<path d="M190 99 V156" stroke="${INK}" stroke-width="${w(1.6)}"/><circle cx="193.5" cy="112" r="1.4" fill="${INK}"/><circle cx="193.5" cy="126" r="1.4" fill="${INK}"/><circle cx="193.5" cy="140" r="1.4" fill="${INK}"/><path d="M184 97 Q190 104 196 97" fill="${C.cream}" ${st(1.8)}/>`;
  if (p.top === 'tee' || p.top === 'dress') tor += `<path d="M184 97.5 Q190 102 196 97.5" stroke="${INK}" stroke-width="${w(1.8)}" fill="none" stroke-linecap="round"/>`;
  if (p.top === 'dress') tor += `<path d="M176 120 Q190 124 204 120" stroke="${INK}" stroke-width="${w(2)}" fill="none" stroke-linecap="round"/>`;
  b += tor;
  if (o.front0) b += o.front0(w);
  b += arm([202, 108], o.armF || 0, false, o.handF ? o.handF(w) : '');
  // cabeza
  let hd = `<circle cx="190" cy="78" r="14" fill="${p.skin}" ${st()}/>`;
  if (p.beard) hd += `<path d="M180 82 Q181 95 192 94.5 Q202 94 204.5 84 Q200 90.5 193 89.5 Q186 89 180 82Z" fill="${p.beard}" ${st(2.2)}/>`;
  const shortHair = `<path d="M176 79 Q173 61 191 61 Q205 62 204.5 72 Q197 66 187 68 Q181 71 176 79Z" fill="${p.hairC}" ${st()}/>`;
  if (p.hair === 'short' || p.hair === 'cap' || p.hair === 'pony') hd += shortHair;
  if (p.hair === 'gray') hd += `<path d="M176 80 Q173 66 184 63 Q178 70 180 78Z" fill="${p.hairC}" ${st(2.4)}/><path d="M184 63.6 Q194 62 200 66" stroke="${INK}" stroke-width="${w(1.6)}" fill="none" stroke-linecap="round"/>`;
  if (p.hair === 'long') hd += `<path d="M175 82 Q173 59 192 60 Q207 61 206 76 Q199 67 189 68 Q181 72 175 82Z" fill="${p.hairC}" ${st()}/>`;
  if (p.hair === 'bun') hd += `<path d="M176 80 Q174 62 191 62 Q204 62 204.5 72 Q196 67 187 68.5 Q181 71 176 80Z" fill="${p.hairC}" ${st()}/>`;
  if (p.hair === 'curly') { let a = ''; [[178, 70, 6], [183, 63, 6.5], [191, 61, 6.5], [199, 63.5, 6], [176, 79, 5.5], [204, 69, 4.5]].forEach(([x, y, r]) => { a += `<circle cx="${x}" cy="${y}" r="${r}"/>`; }); hd += `<g fill="${p.hairC}" stroke="${INK}" stroke-width="${w(2.4)}">${a}</g><g fill="${p.hairC}">${a}</g>`; }
  if (p.hair === 'cap') hd += `<path d="M176 72 Q177 58 191 58 Q204 58.5 205 69 Z" fill="${p.capC}" ${st()}/><path d="M203 68 H215 Q217 68 216 70.5 H202Z" fill="${p.capC}" ${st(2.4)}/>`;
  hd += face(o, w);
  if (p.glasses) hd += `<circle cx="196" cy="81" r="3.6" fill="none" stroke="${INK}" stroke-width="${w(1.5)}"/><circle cx="203.6" cy="81" r="3.6" fill="none" stroke="${INK}" stroke-width="${w(1.5)}"/><path d="M199.6 80.6 H200 M192.4 80 L186 78.5" stroke="${INK}" stroke-width="${w(1.4)}" stroke-linecap="round"/>`;
  if (p.phones) hd += `<path d="M184 79 Q181 57 196 58.5 Q205 59.8 205 68" fill="none" stroke="${INK}" stroke-width="${w(5)}" stroke-linecap="round"/><path d="M184 79 Q181 57 196 58.5 Q205 59.8 205 68" fill="none" stroke="${C.red}" stroke-width="${w(2)}" stroke-linecap="round"/><rect x="179.5" y="73" width="9" height="13" rx="4" fill="${C.red}" ${st(2.4)}/>`;
  b += `<g transform="rotate(${f((o.head || 0) + (p.bend || 0))} 190 94)">${hd}</g>`;
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)}) rotate(${f(p.bend || 0)} 190 146)">${b}</g>`;
  if (o.lean) g = `<g transform="rotate(${f(o.lean)} 190 204)">${g}</g>`;
  return g;
}
function placeFolk(i, px, py, sc, o = {}) {
  const p = FOLK[i % FOLK.length], s = sc * (p.scale || 1);
  o.p = p; o.k = SW / (3 * s);
  const sx = o.flip ? -s : s;
  return `<g transform="translate(${f(px - 190 * sx)} ${f(py - 204 * s)}) scale(${f(sx)} ${f(s)})">${folk(o)}</g>`;
}
// ondas concéntricas de vibración
function vibeRings(x, y, t, r0 = 40, n = 3) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const u = ((t * 2.2 + i / n) % 1);
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r0 + u * 120)}" fill="none" stroke="${INK}" stroke-width="${f(SW * (1 - u) * 0.9 + 0.5)}"/>`;
  }
  return s;
}

/* ================= PASTELES, VITRINA, MOSTRADOR ================= */
// pastel suelto en mundo: (x, y) = centro inferior, s = escala (unos 36 x 28 unidades)
function pastry(type, x, y, s) {
  const sw = SW / s, st = `stroke="${INK}" stroke-width="${f(sw)}" stroke-linejoin="round"`;
  let g = '';
  switch (type) {
    case 'tarta': // tartaleta de frutas
      g = `<path d="M-18 -11 H18 L14 0 H-14Z" fill="${C.brown}" ${st}/><path d="M-12 -10 V-1 M-6 -10 V-1 M0 -10 V-1 M6 -10 V-1 M12 -10 V-1" stroke="${INK}" stroke-width="${f(sw * 0.5)}"/>
        <ellipse cx="0" cy="-12" rx="17.5" ry="4.5" fill="${C.cream}" ${st}/>
        <circle cx="-8" cy="-15" r="4.6" fill="${C.red}" ${st}/><circle cx="1" cy="-17" r="4.6" fill="${C.red}" ${st}/><circle cx="9" cy="-14.5" r="4.2" fill="${C.green}" ${st}/>
        <circle cx="0" cy="-18.4" r="1.1" fill="#FFFFFF"/>`; break;
    case 'palmera':
      g = `<path d="M0 0 C-22 -1 -23 -24 -9 -24 C-3 -24 0 -18 0 -13 C0 -18 3 -24 9 -24 C23 -24 22 -1 0 0Z" fill="${C.brown}" ${st}/>
        <path d="M-2 -6 C-12 -7 -15 -19 -8 -19 C-4 -19 -4 -14 -7 -13 M2 -6 C12 -7 15 -19 8 -19 C4 -19 4 -14 7 -13" fill="none" stroke="${INK}" stroke-width="${f(sw * 0.6)}" stroke-linecap="round"/>
        <path d="M-14 -21 L-11 -22 M12 -21 L15 -19 M-3 -21 l2 1" stroke="#FFFFFF" stroke-width="${f(sw * 0.7)}" stroke-linecap="round"/>`; break;
    case 'bollo':
      g = `<path d="M-18 0 Q-19 -22 0 -23 Q19 -22 18 0Z" fill="${C.skinS}" ${st}/><path d="M-18 0 Q-19 -22 0 -23 Q-12 -15 -10 0Z" fill="${C.brown}" opacity="0.55"/>
        <path d="M-18 0 Q-19 -22 0 -23 Q19 -22 18 0Z" fill="none" ${st}/>
        <circle cx="-5" cy="-16" r="1.5" fill="#FFFFFF"/><circle cx="4" cy="-18" r="1.5" fill="#FFFFFF"/><circle cx="9" cy="-12" r="1.5" fill="#FFFFFF"/><circle cx="-1" cy="-10" r="1.5" fill="#FFFFFF"/>`; break;
    case 'magdalena':
      g = `<path d="M-12 -13 H12 L9 0 H-9Z" fill="${C.cream}" ${st}/><path d="M-6 -12 L-5 -1 M0 -12 V-1 M6 -12 L5 -1" stroke="${C.red}" stroke-width="${f(sw * 0.8)}"/>
        <path d="M-12 -13 H12 L9 0 H-9Z" fill="none" ${st}/>
        <path d="M-15 -12 Q-16 -28 0 -28 Q16 -28 15 -12Z" fill="${C.yel}" ${st}/><path d="M-15 -12 Q-16 -28 0 -28 Q-9 -22 -8 -12Z" fill="${C.brown}" opacity="0.45"/>
        <path d="M-15 -12 Q-16 -28 0 -28 Q16 -28 15 -12Z" fill="none" ${st}/>`; break;
    case 'cupcake':
      g = `<path d="M-11 -12 H11 L8 0 H-8Z" fill="${C.red}" ${st}/><path d="M-4 -11 V-1 M4 -11 V-1" stroke="${C.cream}" stroke-width="${f(sw * 0.7)}"/>
        <path d="M-13 -12 Q-14 -24 0 -25 Q14 -24 13 -12 Z" fill="${C.pink}" ${st}/><circle cx="0" cy="-27" r="3.6" fill="${C.red}" ${st}/>`; break;
    case 'caja':
      return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">${cakeBoxL(0, 0, 0.95, v => f(v * sw / 3))}</g>`;
  }
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">${g}</g>`;
}
const VIT = { x0: 318, x1: 1062, top: 1052, glassTop: 1078, bot: 1342, base: 1478 };
// 15 huecos (3 filas x 5): 14 pasteles y una caja (índice 7, en el centro)
const VIT_TYPES = ['tarta', 'palmera', 'magdalena', 'bollo', 'cupcake', 'palmera', 'bollo', 'caja', 'tarta', 'magdalena', 'cupcake', 'tarta', 'magdalena', 'palmera', 'bollo'];
function vitSlot(i) {
  const r = Math.floor(i / 5), c = i % 5, cw = (VIT.x1 - VIT.x0 - 60) / 5;
  return [VIT.x0 + 30 + cw * (c + 0.5), VIT.glassTop + 80 + r * 88];
}
// o.gone(i) -> progreso de desaparición (0 = está, 1 = ya no está)
function vitrina(o = {}) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}"`;
  let s = '';
  const { x0, x1, top, glassTop, bot, base } = VIT;
  // base de madera
  s += `<rect x="${x0}" y="${bot}" width="${x1 - x0}" height="${base - bot + 40}" fill="${C.wood}" ${st()}/>`;
  s += `<rect x="${x0}" y="${bot}" width="60" height="${base - bot + 40}" fill="${C.woodS}"/>`;
  for (let x = x0 + 150; x < x1; x += 186) s += `<rect x="${x}" y="${bot + 30}" width="140" height="${base - bot - 60}" rx="10" fill="none" ${st(0.7)}/>`;
  s += `<rect x="${x0}" y="${bot}" width="${x1 - x0}" height="${base - bot + 40}" fill="none" ${st()}/>`;
  // cristal
  s += `<rect x="${x0}" y="${glassTop}" width="${x1 - x0}" height="${bot - glassTop}" fill="${C.glass}"/>`;
  s += `<path d="M${x0 + 420} ${glassTop} h70 l-120 ${bot - glassTop} h-70Z M${x0 + 540} ${glassTop} h24 l-120 ${bot - glassTop} h-24Z" fill="#FFFFFF" opacity="0.5"/>`;
  for (let r = 0; r < 3; r++) { const y = glassTop + 82 + r * 88; s += `<line x1="${x0 + 8}" y1="${y}" x2="${x1 - 8}" y2="${y}" ${st(0.7)}/>`; }
  for (let i = 0; i < 15; i++) {
    const [x, y] = vitSlot(i), g = o.gone ? o.gone(i) : 0;
    if (g >= 1) continue;
    const ty = VIT_TYPES[i];
    if (g <= 0) s += pastry(ty, x, y, ty === 'caja' ? 2.3 : 2.05);
    else { // «pop»: crece un poco y desaparece con una estrella
      const u = clamp(g / 0.5);
      if (g < 0.35) s += pastry(ty, x, y, 2.05 * (1 + 0.35 * Math.sin(u * PI)) * (1 - g / 0.35 * 0.9));
      s += burst(x, y - 26, 34 * Math.sin(clamp(g) * PI), g * 90, C.yel);
    }
  }
  s += `<rect x="${x0}" y="${glassTop}" width="${x1 - x0}" height="${bot - glassTop}" fill="none" ${st()}/>`;
  // encimera de madera
  s += `<rect x="${x0 - 14 + 8}" y="${top + 8}" width="${x1 - x0 + 28}" height="${glassTop - top}" rx="8" fill="${INK}"/>`;
  s += `<rect x="${x0 - 14}" y="${top}" width="${x1 - x0 + 28}" height="${glassTop - top}" rx="8" fill="${C.wood}" ${st()}/>`;
  return s;
}
// caja registradora genérica (base apoyada en y)
function register(x, y, drawer = 0, coins = false) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let s = '';
  const dx = -60 * clamp(drawer);
  s += `<rect x="${x - 88 + dx}" y="${y - 40}" width="176" height="40" rx="6" fill="${C.cream}" ${st()}/>`;
  if (drawer > 0.05) {
    s += `<rect x="${x - 80 + dx}" y="${y - 52}" width="${f(Math.min(60, -dx) + 20)}" height="14" rx="3" fill="${C.navy}" ${st(0.7)}/>`;
    if (coins) for (let i = 0; i < 4; i++) s += `<circle cx="${x - 70 + dx + i * 14}" cy="${y - 54}" r="8" fill="${C.yel}" ${st(0.6)}/>`;
  }
  s += `<circle cx="${x - 60 + dx}" cy="${y - 20}" r="6" fill="${C.yel}" ${st(0.6)}/>`;
  s += `<path d="M${x - 80} ${y - 40} L${x - 66} ${y - 128} H${x + 80} L${x + 86} ${y - 40}Z" fill="${INK}" transform="translate(8 8)"/>`;
  s += `<path d="M${x - 80} ${y - 40} L${x - 66} ${y - 128} H${x + 80} L${x + 86} ${y - 40}Z" fill="${C.red}" ${st()}/>`;
  s += `<path d="M${x - 80} ${y - 40} L${x - 66} ${y - 128} H${x - 40} L${x - 52} ${y - 40}Z" fill="${C.redS}"/>`;
  s += `<path d="M${x - 80} ${y - 40} L${x - 66} ${y - 128} H${x + 80} L${x + 86} ${y - 40}Z" fill="none" ${st()}/>`;
  for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) s += `<rect x="${x - 44 + i * 30}" y="${y - 112 + j * 30}" width="22" height="20" rx="5" fill="${C.cream}" ${st(0.6)}/>`;
  s += `<rect x="${x - 10}" y="${y - 182}" width="20" height="56" fill="${C.navy}" ${st(0.8)}/>`;
  s += `<rect x="${x - 70}" y="${y - 210}" width="140" height="58" rx="10" fill="${C.navy}" ${st()}/>`;
  s += `<rect x="${x - 56}" y="${y - 198}" width="112" height="34" rx="6" fill="${C.glass}" ${st(0.6)}/>`;
  s += `<path d="M${x - 40} ${y - 181} H${x + 20}" stroke="${C.navy}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round"/>`;
  return s;
}
function paperBag(x, y, s) {
  const st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  return `<path d="M${x - 40 * s + 7} ${y - 110 * s + 7} H${x + 40 * s + 7} L${x + 44 * s + 7} ${y + 7} H${x - 44 * s + 7}Z" fill="${INK}"/>
    <path d="M${x - 40 * s} ${y - 110 * s} H${x + 40 * s} L${x + 44 * s} ${y} H${x - 44 * s}Z" fill="${C.brown}" ${st}/>
    <path d="M${x - 40 * s} ${y - 110 * s} l8 16 l8 -16 l8 16 l8 -16 l8 16 l8 -16 l8 16 l8 -16 l8 16 l8 -16" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>
    <rect x="${x - 18 * s}" y="${y - 70 * s}" width="${36 * s}" height="${30 * s}" rx="6" fill="${C.cream}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
}
function tray(x, y, s, rot = 0, items = ['bollo', 'palmera', 'magdalena']) {
  let g = `<rect x="-90" y="-10" width="180" height="16" rx="8" fill="${INK}" transform="translate(6 6)"/><rect x="-90" y="-10" width="180" height="16" rx="8" fill="${C.navy}" stroke="${INK}" stroke-width="${f(SW / s)}"/>`;
  items.forEach((ty, i) => { g += pastry(ty, -55 + i * 55, -10, 1.45 / s); });
  return at(x, y, s, g, rot);
}
function worldBox(x, y, s, rot = 0) { // caja de pasteles en mundo (centro inferior x,y)
  return at(x, y, 1, cakeBoxL(0, 0, s, v => f(v * SW / 3)), rot);
}

/* ================= INTERIOR DE LA PANADERÍA ================= */
const INT = { rosaX: 690, rosaY: 1052, rosaSc: 5.05, clockX: 300, clockY: 545, clockR: 94 };
function interiorBack(T, o = {}) {
  const id = 'dots' + (uid++), cell = 10 * W / 380, st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}"`;
  let s = `<defs><pattern id="${id}" width="${f(cell)}" height="${f(cell)}" patternUnits="userSpaceOnUse"><circle cx="${f(cell / 2)}" cy="${f(cell / 2)}" r="${f(1.4 * W / 380)}" fill="${DOT}"/></pattern></defs>`;
  s += `<rect width="${W}" height="${H}" fill="${C.cream}"/><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
  // zócalo y suelo
  s += `<rect x="-20" y="1470" width="${W + 40}" height="${H - 1450}" fill="${C.skinS}"/>`;
  for (let i = 0; i < 7; i++) s += `<line x1="${-40 + i * 200}" y1="1470" x2="${-180 + i * 200}" y2="${H}" ${st(0.5)}/>`;
  s += `<line x1="-20" y1="1470" x2="${W + 20}" y2="1470" ${st()}/>`;
  // puerta de entrada (izquierda) con campanilla y cristal que deja ver la calle
  const dx = 46, dy = 840, dw = 238, dh = 640;
  s += `<rect x="${dx - 16}" y="${dy - 16}" width="${dw + 32}" height="${dh + 16}" rx="12" fill="${C.wood}" ${st()}/>`;
  s += `<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" rx="8" fill="${C.navy}" ${st()}/>`;
  s += `<rect x="${dx + 30}" y="${dy + 30}" width="${dw - 60}" height="270" rx="10" fill="${C.sky}" ${st(0.8)}/>`;
  s += `<rect x="${dx + 30}" y="${dy + 220}" width="${dw - 60}" height="80" fill="${C.ground}"/><line x1="${dx + 30}" y1="${dy + 220}" x2="${dx + dw - 30}" y2="${dy + 220}" ${st(0.6)}/>`;
  s += `<rect x="${dx + 30}" y="${dy + 30}" width="${dw - 60}" height="270" rx="10" fill="none" ${st(0.8)}/>`;
  s += `<circle cx="${dx + dw - 36}" cy="${dy + 360}" r="11" fill="${C.yel}" ${st(0.7)}/>`;
  const bx = dx + dw - 30, by = dy - 16;
  s += `<g transform="translate(${bx} ${by}) rotate(${f(o.bell || 0)})"><circle cx="0" cy="48" r="9" fill="${C.dred}" ${st(0.6)}/><path d="M-30 42 Q-30 0 0 0 Q30 0 30 42 Z" fill="${C.yel}" ${st(0.8)} stroke-linejoin="round"/></g>`;
  // reloj de pared
  if (o.tm !== undefined) s += wallClock(INT.clockX, INT.clockY, INT.clockR, o.tm, o.clockK || 1, o.clockWob || 0);
  // estante con panes (derecha)
  s += `<rect x="790" y="520" width="290" height="26" rx="6" fill="${C.wood}" ${st()}/>`;
  s += `<path d="M830 546 L850 590 M1040 546 L1020 590" ${st(1.1)} stroke-linecap="round"/>`;
  if (!o.emptyShelf) s += unitBox(800, 400, 130, 125, ITEMS.bread, 0.95) + unitBox(930, 400, 130, 125, PITEMS.croissant, 0.95);
  return s;
}
// mostrador encima de la vitrina: caja registradora, cajas apiladas y bolsas
function counterTop(o = {}) {
  let s = '';
  const y = VIT.top;
  const n = o.boxes === undefined ? 2 : o.boxes;
  for (let i = 0; i < n; i++) s += worldBox(410 + (i % 2) * 6, y - i * 70, 3.0);
  if (o.bags !== false) s += paperBag(540, y, 0.9);
  s += register(935, y, o.drawer || 0, o.coins);
  return s;
}
function rosaInt(T, o) {
  return placeRosa(INT.rosaX, INT.rosaY, 190, 140, INT.rosaSc, Object.assign({ flip: true, bob: breath(T), blink: blinkAt(T) }, o));
}
const rosaToWorld = (lx, ly) => toWorld(INT.rosaX, INT.rosaY, 190, 140, INT.rosaSc, lx, ly, true);

/* ================= MONEDAS Y CONFETI ================= */
function coin(x, y, r, spin) {
  const c = Math.cos(spin), rx = Math.max(r * 0.16, Math.abs(c) * r);
  return `<ellipse cx="${f(x + 4)}" cy="${f(y + 4)}" rx="${f(rx)}" ry="${f(r)}" fill="${INK}"/><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(r)}" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>` +
    (Math.abs(c) > 0.4 ? `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx * 0.62)}" ry="${f(r * 0.62)}" fill="none" stroke="${C.woodS}" stroke-width="${f(SW * 0.5)}"/>` : '');
}
const CONF_COLS = [C.red, C.pink, C.yel, C.green, C.navy, C.glass];
function confetti(x, y, i, t) {
  const rot = t * (200 + 160 * hash(i * 3.7)) + i * 40, sy = Math.cos(t * 8 + i);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(1 ${f(Math.max(0.15, Math.abs(sy)))})"><rect x="-10" y="-16" width="20" height="32" rx="4" fill="${CONF_COLS[i % CONF_COLS.length]}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/></g>`;
}
