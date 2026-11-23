/* Marta y Pedro: dibujo extraído de la serie de vídeos (lib.js del vídeo 01 y v05.js de Pedro). */
'use strict';

const W = 1080, H = 1920;
const C = {
  red: '#D32F2F', dred: '#8E1B1B', cream: '#FFF5F3', blue: '#3F7CC4', blueS: '#2B5A99',
  navy: '#2D4A6B', glass: '#BFE3F2', skin: '#F6C9A0', skinS: '#E9B88F', hair: '#5A3A2A',
  ink: '#1E1A1A', pink: '#F48FB1', green: '#2E9E5B', sky: '#BFE3F2', skyL: '#E4F4FA',
  ground: '#F2B5AD', white: '#FFFFFF'
};
const INK = C.ink;
// Contorno: 3 px en una escena base de 380 px de ancho -> 3 * 1080/380
const SW = 3 * W / 380; // ≈ 8.5 px
const PI = Math.PI;

let CFG = null;
let uid = 0;

/* ---------- utilidades ---------- */
const f = n => (Math.round(n * 100) / 100);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const easeOut = u => 1 - Math.pow(1 - clamp(u), 3);
const easeInOut = u => { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
// rebote tipo cómic: 0 -> 1 con sobreimpulso (~13 %) y asentamiento
function pop(t, start, dur = 0.5) {
  const u = (t - start) / dur;
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  return 1 - Math.exp(-6.5 * u) * Math.cos(3.2 * PI * u);
}
function damp(t, freq = 9, dec = 4) { if (t < 0) return 1; return Math.exp(-dec * t) * Math.cos(freq * t); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
/* ---------- Personajes (Marta del vídeo 01 ampliada + Lucía + panadera) ----------
   Sistema local de Marta: suelo en y=204, mira a la derecha. Todos comparten cuerpo y proporciones. */
const YEL = '#F2C12E', YEL_S = '#C99A1E', LHAIR = '#C58B3B', NAVY_S = '#22394F', SHOE_BR = '#5A3A2A';
function face(o, w) {
  const e = o.expr || 'happy';
  const lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const P = (cx, cy, r = 2) => `<circle cx="${f(cx + lx)}" cy="${f(cy + ly)}" r="${r}" fill="${INK}"/>`;
  const L = (d, sw = 1.6) => `<path d="${d}" stroke="${INK}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const blush = (op = 0.6) => `<circle cx="199" cy="87" r="3" fill="${C.pink}" opacity="${op}"/>`;
  const bigEye = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="3.2" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.5)}"/><circle cx="${f(cx + 0.5 + lx * 0.5)}" cy="${f(cy + 0.3 + ly * 0.5)}" r="1.15" fill="${INK}"/>`;
  switch (e) {
    case 'bored': // boca recta, cejas caídas, párpados a media asta
      return `<path d="M194 81 A2 2 0 0 0 198 81Z M201 81 A2 2 0 0 0 205 81Z" fill="${INK}" transform="translate(${f(lx)} ${f(ly * 0.5)})"/>` +
        L('M193.8 80.8 H198.2 M200.8 80.8 H205.2', 1.5) + L('M194 77.4 L197.8 76.2 M201.2 76.2 L205 77.4') +
        blush(0.35) + L('M197 88.4 H203.2', 2);
    case 'sparkle': // ojos grandes con brillo
      return `<circle cx="196" cy="80.6" r="3.5" fill="${INK}"/><circle cx="203" cy="80.6" r="3.5" fill="${INK}"/>
        <circle cx="197.2" cy="79.3" r="1.3" fill="#FFFFFF"/><circle cx="204.2" cy="79.3" r="1.3" fill="#FFFFFF"/>
        <circle cx="195.1" cy="81.9" r="0.6" fill="#FFFFFF"/><circle cx="202.1" cy="81.9" r="0.6" fill="#FFFFFF"/>` +
        L('M193.4 74.6 Q195.7 72.6 198 74.2 M200.6 74 Q202.9 72.4 205.2 74.4') + blush() +
        `<path d="M195.8 86.4 Q200.2 93.6 204.8 86.4 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
    case 'cheeky': // una ceja alta, media sonrisa
      return P(196, 81.3) + P(203, 80.6) + L('M194 76.4 L198 76') + L('M200.6 73.4 Q203 70.8 205.6 73.6', 1.7) + blush() +
        L('M197 88.4 Q201.4 89.8 204.8 85.6', 2);
    case 'surprise':
      return bigEye(195, 80) + bigEye(202, 80) + L('M191.8 74.6 Q194.6 71.8 197.4 74 M199.6 73.8 Q202.2 71.6 204.8 74.2', 1.7) +
        `<circle cx="196" cy="86.6" r="2.6" fill="${C.pink}" opacity="0.6"/><ellipse cx="197.8" cy="88.6" rx="2.1" ry="2.9" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}"/>`;
    case 'wow': // ojos muy abiertos y sonrisa
      return bigEye(195, 80) + bigEye(202, 80) + L('M191.8 74.2 Q194.6 71.4 197.4 73.6 M199.6 73.4 Q202.2 71.2 204.8 73.8', 1.7) + blush() +
        `<path d="M196 86.6 Q200 92 204 86.6 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}" stroke-linejoin="round"/>`;
    case 'wink':
      return L('M193.3 81.6 Q196 78.6 198.7 81.6', 1.9) + P(203, 81) + L('M193.6 76 L198 74.6 M201 75 L205 76') +
        `<circle cx="198.5" cy="86.6" r="3" fill="${C.pink}" opacity="0.6"/><path d="M194.6 85.4 Q200 94 205.4 85.4 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
    case 'sad': // cejas en pena, boca hacia abajo
      return P(196, 81.6) + P(203, 81.6) + L('M194 76.4 L197.8 74.4 M201.2 74.4 L205 76.4') + blush(0.4) +
        L('M197.2 89.4 Q200.2 86.4 203.2 89.4', 2);
    case 'doubt':
      return P(196, 81) + P(203, 80.6) + L('M194 76 L198 75.6') + L('M200.8 73.6 Q203 71.6 205.4 73.8', 1.7) + blush(0.45) +
        L('M197.2 88.4 Q198.8 87 200.4 88.4 Q202 89.8 203.6 88.4', 1.9);
    case 'curious': // (vídeo 08) cejas muy arriba, ojos atentos, boquita en «o»
      return P(196, 81, 2.3) + P(203, 81, 2.3) + L('M193.4 74.2 Q195.8 71.8 198.2 73.6 M200.6 73.4 Q203 71.6 205.4 73.8', 1.7) + blush(0.5) +
        `<ellipse cx="200.6" cy="88.2" rx="1.7" ry="2.1" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.4)}"/>`;
    case 'meh': // (vídeo 08) indiferente, «ya vendré»: párpados a media asta, media sonrisa ladeada
      return `<path d="M194 81 A2 2 0 0 0 198 81Z M201 81 A2 2 0 0 0 205 81Z" fill="${INK}"/>` +
        L('M193.8 80.8 H198.2 M200.8 80.8 H205.2', 1.5) + L('M194 76.6 L198 76.4 M201 75.2 Q203 74.2 205.2 75.4') +
        blush(0.4) + L('M196.6 88.6 Q200.6 89.4 204.4 86.8', 2);
    case 'smile':
      return P(196, 81) + P(203, 81) + L('M194 76 L198 75 M201 75 L205 76') + blush() +
        `<path d="M195.6 86 Q200 93 204.4 86 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/>`;
    default: // feliz (referencia)
      return P(196, 81) + P(203, 81) + L('M194 76 L198 75 M201 75 L205 76') + blush() + L('M196 87 Q200 91 204 87', 2);
  }
}
// móvil pequeño en coordenadas locales (centro cx,cy)
function miniPhone(cx, cy, w, rot = -14) {
  return `<g transform="rotate(${rot} ${cx} ${cy})"><rect x="${cx - 6}" y="${cy - 10.5}" width="12" height="21" rx="2.6" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/><rect x="${cx - 4.2}" y="${cy - 8}" width="8.4" height="15.5" rx="1.3" fill="${C.glass}"/></g>`;
}
function hand(cx, cy, w, fill = C.skin) { return `<circle cx="${cx}" cy="${cy}" r="3.8" fill="${fill}" stroke="${INK}" stroke-width="${w(2.2)}"/>`; }
// caja de pasteles (local; centro inferior cx, cy; s = escala de la caja de 40x24)
function cakeBoxL(cx, cy, s, w, o = {}) {
  const k = s, W2 = 20 * k, Hh = 24 * k, top = cy - Hh;
  const sw = v => w(v);
  let g = '';
  // pasteles asomando
  const cakes = [[-12, C.pink], [-4, C.cream], [4, C.red], [12, C.pink]];
  cakes.forEach(([dx, col], i) => {
    const x = cx + dx * k, y = top - (i % 2 ? 3.2 : 2.4) * k;
    g += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(4.4 * k)}" fill="${col}" stroke="${INK}" stroke-width="${sw(2)}"/>`;
    g += `<circle cx="${f(x)}" cy="${f(y - 3.8 * k)}" r="${f(1.5 * k)}" fill="${i % 2 ? C.red : C.cream}" stroke="${INK}" stroke-width="${sw(1.3)}"/>`;
  });
  g += `<rect x="${f(cx - W2 + 2 * k)}" y="${f(top + 2 * k)}" width="${f(W2 * 2)}" height="${f(Hh)}" rx="${f(2.5 * k)}" fill="${INK}"/>`;
  g += `<rect x="${f(cx - W2)}" y="${f(top)}" width="${f(W2 * 2)}" height="${f(Hh)}" rx="${f(2.5 * k)}" fill="${C.cream}" stroke="${INK}" stroke-width="${sw(2.6)}"/>`;
  g += `<rect x="${f(cx - W2)}" y="${f(top + Hh * 0.62)}" width="${f(W2 * 2)}" height="${f(Hh * 0.38)}" rx="${f(2 * k)}" fill="#F2B5AD" stroke="${INK}" stroke-width="${sw(1.6)}"/>`;
  g += `<rect x="${f(cx - 2.4 * k)}" y="${f(top)}" width="${f(4.8 * k)}" height="${f(Hh)}" fill="${C.red}" stroke="${INK}" stroke-width="${sw(1.6)}"/>`;
  g += `<path d="M${f(cx)} ${f(top + 1)} q${f(-9 * k)} ${f(-7 * k)} ${f(-9 * k)} ${f(-1 * k)} q${f(1 * k)} ${f(5 * k)} ${f(9 * k)} ${f(1 * k)} z M${f(cx)} ${f(top + 1)} q${f(9 * k)} ${f(-7 * k)} ${f(9 * k)} ${f(-1 * k)} q${f(-1 * k)} ${f(5 * k)} ${f(-9 * k)} ${f(1 * k)} z" fill="${C.red}" stroke="${INK}" stroke-width="${sw(1.8)}" stroke-linejoin="round"/>`;
  g += `<circle cx="${f(cx)}" cy="${f(top + 0.5)}" r="${f(2.2 * k)}" fill="${C.dred}" stroke="${INK}" stroke-width="${sw(1.5)}"/>`;
  return g;
}
// pastelito suelto (local)
function cupcakeL(cx, cy, s, w) {
  const k = s;
  return `<path d="M${f(cx - 6 * k)} ${f(cy - 7 * k)} H${f(cx + 6 * k)} L${f(cx + 4.4 * k)} ${f(cy)} H${f(cx - 4.4 * k)}Z" fill="${C.red}" stroke="${INK}" stroke-width="${w(1.8)}" stroke-linejoin="round"/>
    <path d="M${f(cx - 2 * k)} ${f(cy - 6.5 * k)} V${f(cy - 0.5)} M${f(cx + 2 * k)} ${f(cy - 6.5 * k)} V${f(cy - 0.5)}" stroke="${C.cream}" stroke-width="${w(1.2)}"/>
    <path d="M${f(cx - 7 * k)} ${f(cy - 7 * k)} Q${f(cx - 7.5 * k)} ${f(cy - 13 * k)} ${f(cx)} ${f(cy - 14 * k)} Q${f(cx + 7.5 * k)} ${f(cy - 13 * k)} ${f(cx + 7 * k)} ${f(cy - 7 * k)} Z" fill="${C.pink}" stroke="${INK}" stroke-width="${w(1.8)}" stroke-linejoin="round"/>
    <circle cx="${f(cx)}" cy="${f(cy - 15 * k)}" r="${f(2 * k)}" fill="${C.red}" stroke="${INK}" stroke-width="${w(1.4)}"/>`;
}
const ARM_F = [202, 108], ARM_B = [178, 108];
// posición local de la mano para un ángulo de brazo
function handAt(pivot, ang) {
  const a = ang * PI / 180, vx = 0.5, vy = 32;
  return [pivot[0] + vx * Math.cos(a) - vy * Math.sin(a), pivot[1] + vx * Math.sin(a) + vy * Math.cos(a)];
}
function person(o) {
  const who = o.who || 'marta', k = o.k || 1, w = v => f(v * k);
  const st = (v = 3) => `stroke="${INK}" stroke-width="${w(v)}" stroke-linejoin="round"`;
  const isM = who === 'marta', isL = who === 'lucia', isB = who === 'baker';
  // --- piernas ---
  const leg = (ang, back) => {
    let g;
    if (isM) {
      g = `<rect x="186" y="144" width="7" height="52" rx="3.5" fill="${back ? C.skinS : C.skin}" ${st()}/><path d="M183 196 h15 a5 5 0 0 1 0 8 h-15z" fill="${back ? C.dred : C.red}" ${st()}/>`;
    } else {
      const shoe = isL ? (back ? '#E8DCD8' : '#FFFFFF') : (back ? '#3E281D' : SHOE_BR);
      g = isB ? `<rect x="183" y="142" width="13" height="55" rx="5" fill="${back ? NAVY_S : C.navy}" ${st()}/>` : `<rect x="185" y="142" width="9" height="55" rx="4" fill="${back ? NAVY_S : C.navy}" ${st()}/>`;
      g += `<path d="M182.5 195.5 h16 a4.5 4.5 0 0 1 0 8.5 h-16z" fill="${shoe}" ${st()}/>` +
        (isL ? `<path d="M183 201 H202" stroke="${INK}" stroke-width="${w(1.4)}"/>` : '');
    }
    return `<g transform="rotate(${f(ang)} 190 146)">${g}</g>`;
  };
  const sitLeg = back => {
    const dx = back ? -5 : 0;
    return `<g transform="translate(${dx} ${back ? -1 : 0})"><rect x="184" y="141" width="38" height="8" rx="4" fill="${back ? C.skinS : C.skin}" ${st()}/>
      <rect x="214" y="144" width="8" height="49" rx="4" fill="${back ? C.skinS : C.skin}" ${st()}/>
      <path d="M212 192 h15 a5 5 0 0 1 0 8 h-15z" fill="${back ? C.dred : C.red}" ${st()}/></g>`;
  };
  // --- brazos ---
  const arm = (pv, ang, back, extra = '') => {
    let g;
    const x = back ? 174 : 199;
    if (isM) g = `<rect x="${x}" y="106" width="7" height="34" rx="3.5" fill="${back ? C.skinS : C.skin}" ${st()}/>`;
    else if (isL) g = `<rect x="${x - 0.5}" y="105" width="8" height="32" rx="4" fill="${back ? YEL_S : YEL}" ${st()}/>` + hand(x + 3.5, 139, w, back ? C.skinS : C.skin);
    else g = `<rect x="${x - 1}" y="110" width="9" height="30" rx="4.5" fill="${back ? C.skinS : C.skin}" ${st()}/><rect x="${x - 2.5}" y="105" width="12" height="14" rx="5" fill="${back ? '#A32323' : C.red}" ${st()}/>`;
    if (!back && o.point) g += `<rect x="201.3" y="140" width="2.8" height="10" rx="1.4" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2)}"/>
      <circle cx="202.5" cy="140.5" r="4.3" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>
      <path d="M200 138 Q202.5 141 205 138" stroke="${INK}" stroke-width="${w(1.3)}" fill="none" stroke-linecap="round"/>`;
    if (extra) g += `<g transform="rotate(${f(-ang - (o.lean || 0))} ${back ? 177.5 : 202.5} 140)">${extra}</g>`;
    const g2 = `<g transform="rotate(${f(ang)} ${pv[0]} ${pv[1]})">${g}</g>`;
    return isB ? `<g transform="translate(${back ? -6 : 6} 0)">${g2}</g>` : g2;
  };
  let g = '';
  if (o.sit) g += sitLeg(true) + sitLeg(false);
  else if (!o.noLegs) g += leg(o.legB || 0, true) + leg(o.legF || 0, false);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">`;
  if (o.behind) g += o.behind(w); // objetos detrás del cuerpo (caja bajo el brazo)
  g += arm(ARM_B, o.armB || 0, true, o.handB ? o.handB(w) : '');
  // pelo trasero
  const head = [];
  if (isM) head.push(`<g transform="rotate(${f(o.pony || 0)} 178 70)"><path d="M180 66 Q154 66 158 94 Q160 104 166 108 Q170 90 182 78Z" fill="${C.hair}" ${st()}/></g>`);
  if (isL) head.push(`<path d="M191 61 Q171 61 171 82 Q170 99 173 107 Q181 110 189 105 L191 88Z" fill="${LHAIR}" ${st()}/>`);
  if (isB) head.push(`<circle cx="174" cy="66" r="8" fill="${C.red}" ${st()}/><circle cx="172" cy="63" r="1.4" fill="#FFFFFF"/><circle cx="176" cy="69" r="1.2" fill="#FFFFFF"/>`);
  // cuello y torso
  let torso = `<rect x="186.5" y="86" width="7" height="14" rx="2" fill="${C.skinS}" ${st()}/>`;
  if (isM) {
    torso += `<path d="M178 98 Q190 94 202 98 L211 156 Q190 161 169 156Z" fill="${C.blue}"/>
    <path d="M178 98 L186 97 L186 158 Q176 158 169 156Z" fill="${C.blueS}"/>
    <path d="M178 98 Q190 94 202 98 L211 156 Q190 161 169 156Z" fill="none" ${st()}/>
    <path d="M176 118 Q190 122 204 118" stroke="${INK}" stroke-width="${w(2.5)}" fill="none" stroke-linecap="round"/>`;
    if (o.sit) torso += `<path d="M185 136 L213 137 Q219 138 219 143 L218 151 Q200 155 184 154Z" fill="${C.blue}" ${st()}/>`;
  } else if (isL) {
    torso += `<rect x="176" y="126" width="28" height="24" rx="5" fill="${C.navy}" ${st()}/>
    <path d="M178 98 Q190 94 202 98 L206 133 Q190 137 174 133Z" fill="${YEL}"/>
    <path d="M178 98 L186 97 L186 136 Q179 135 174 133Z" fill="${YEL_S}"/>
    <path d="M178 98 Q190 94 202 98 L206 133 Q190 137 174 133Z" fill="none" ${st()}/>
    <path d="M175.5 127 Q190 131 205 127" stroke="${INK}" stroke-width="${w(2)}" fill="none" stroke-linecap="round"/>
    <path d="M183 97 Q190 101 197 97" stroke="${INK}" stroke-width="${w(2)}" fill="none" stroke-linecap="round"/>`;
  } else {
    torso += `<rect x="168" y="128" width="44" height="24" rx="8" fill="${C.navy}" ${st()}/>
    <path d="M173 98 Q190 91 207 98 Q216 118 214 140 Q190 147 166 140 Q164 118 173 98Z" fill="${C.red}"/>
    <path d="M173 98 L182 96 L182 145 Q172 143 166 140 Q164 118 173 98Z" fill="#A32323"/>
    <path d="M173 98 Q190 91 207 98 Q216 118 214 140 Q190 147 166 140 Q164 118 173 98Z" fill="none" ${st()}/>
    <path d="M179 104 H201 Q208 128 210 160 Q190 165 170 160 Q172 128 179 104Z" fill="#FFFFFF" ${st()}/>
    <path d="M180 104 L183 96 M200 104 L197 96" stroke="${INK}" stroke-width="${w(2.2)}" stroke-linecap="round"/>
    <rect x="183" y="132" width="14" height="10" rx="2.5" fill="#FFFFFF" ${st(2)}/>
    <path d="M177 118 Q168 121 165 127" stroke="${INK}" stroke-width="${w(1.8)}" fill="none" stroke-linecap="round"/>`;
  }
  // cabeza
  let hd = `<circle cx="190" cy="78" r="14" fill="${C.skin}" ${st()}/>`;
  if (isM) hd += `<path d="M175 76 Q175 58 192 60 Q206 61 205 74 Q197 66 175 76Z" fill="${C.hair}" ${st()}/>
    <circle cx="178" cy="69" r="3.2" fill="${C.red}" stroke="${INK}" stroke-width="${w(2)}"/>`;
  if (isL) hd += `<path d="M175 82 Q173 59 192 60 Q207 61 206 76 Q199 67 189 68 Q181 72 175 82Z" fill="${LHAIR}" ${st()}/>`;
  if (isB) hd += `<path d="M176.5 80 Q174 86 178 90 L181 80Z" fill="${C.hair}" ${st(2.4)}/>
    <path d="M175 77 Q174 57 191 58.5 Q207 59.5 205.5 73 Q191 66 175 77Z" fill="${C.red}" ${st()}/>
    <circle cx="183" cy="64" r="1.6" fill="#FFFFFF"/><circle cx="191.5" cy="62" r="1.6" fill="#FFFFFF"/><circle cx="199.5" cy="64.5" r="1.5" fill="#FFFFFF"/><circle cx="179" cy="71" r="1.4" fill="#FFFFFF"/><circle cx="188" cy="68.5" r="1.3" fill="#FFFFFF"/>`;
  hd += face(o, w);
  if (o.phone) hd += miniPhone(229, 88.5, w) + hand(227.4, 93, w);
  g += head[0] ? `<g transform="rotate(${f(o.head || 0)} 190 94)">${head[0]}</g>` : '';
  g += torso;
  if (o.front0) g += o.front0(w);
  g += arm(ARM_F, o.armF || 0, false, o.handF ? o.handF(w) : '');
  g += `<g transform="rotate(${f(o.head || 0)} 190 94)">${hd}</g>`;
  if (o.front) g += o.front(w);
  g += `</g>`;
  if (o.lean) g = `<g transform="rotate(${f(o.lean)} 190 204)">${g}</g>`;
  if (o.squash) g = `<g transform="translate(190 204) scale(${f(o.squash[0])} ${f(o.squash[1])}) translate(-190 -204)">${g}</g>`;
  return g;
}
// coloca el punto local (ax,ay) en (px,py) con escala sc; flip = mirando a la izquierda
function place(px, py, ax, ay, sc, o) {
  o.k = (o.sw || SW) / (3 * sc);
  const sx = o.flip ? -sc : sc;
  return `<g transform="translate(${f(px - ax * sx)} ${f(py - ay * sc)}) scale(${f(sx)} ${f(sc)})">${person(o)}</g>`;
}
const placeMarta = (px, py, ax, ay, sc, o) => place(px, py, ax, ay, sc, Object.assign({ who: 'marta' }, o));
// punto local -> mundo
const P5 = {
  green: '#3C9D5D', greenS: '#2A7344', pants: '#222222', hair: '#3B2A24', skin: '#F6C9A0', skinS: '#E9B88F',
  wood: '#A9743F', woodS: '#7E5328', tort: '#F2C12E', tortS: '#C99A1E', orange: '#F29B4B', peach: '#FFD2A8',
  warmCream: '#FFE8C8', cloudSh: '#F7B5A8', gray: '#B9B0AD'
};
const rotV = (v, deg) => { const a = deg * PI / 180; return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)]; };

/* ===================== PEDRO ===================== */
const PF = [206, 108], PB = [174, 108];               // pivotes de los hombros
const handLocal = (pv, ang, dy = 0) => { const r = rotV([0.5, 38], ang); return [pv[0] + r[0], pv[1] + r[1] + dy]; };

function pedroFace(o, w) {
  const e = o.expr || 'normal', sm = clamp(o.smile || 0);
  const L = (d, sw = 1.7, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  let s = '';
  // cristales (relleno) y patilla
  s += `<circle cx="196" cy="80" r="4" fill="#FFFFFF" fill-opacity="0.5"/><circle cx="204" cy="80" r="4" fill="#FFFFFF" fill-opacity="0.5"/>`;
  // ojos
  const pup = (r = 1.5, dy = 0) => `<circle cx="${f(196 + lx)}" cy="${f(80 + ly + dy)}" r="${r}" fill="${INK}"/><circle cx="${f(204 + lx)}" cy="${f(80 + ly + dy)}" r="${r}" fill="${INK}"/>`;
  if (o.blink && e !== 'laugh') s += L('M193.2 80.3 H198.8 M201.2 80.3 H206.8', 1.6);
  else if (e === 'tired') {
    s += pup(1.4, 1);
    s += `<path d="M192.1 80.6 A3.9 3.9 0 0 1 199.9 80.6 Z M200.1 80.6 A3.9 3.9 0 0 1 207.9 80.6 Z" fill="${P5.skin}"/>` + L('M192.4 80.6 H199.6 M200.4 80.6 H207.6', 1.4);
  } else if (e === 'grin' || e === 'talk' || e === 'sparkle') {
    s += `<circle cx="${f(196 + lx)}" cy="${f(80 + ly)}" r="2.2" fill="${INK}"/><circle cx="${f(204 + lx)}" cy="${f(80 + ly)}" r="2.2" fill="${INK}"/>
      <circle cx="${f(196.8 + lx)}" cy="${f(79.1 + ly)}" r="0.85" fill="#FFFFFF"/><circle cx="${f(204.8 + lx)}" cy="${f(79.1 + ly)}" r="0.85" fill="#FFFFFF"/>`;
  } else if (e === 'laugh') {
    s += L('M193.6 81.2 Q196 78 198.4 81.2 M201.6 81.2 Q204 78 206.4 81.2', 1.6);
  } else s += pup(1.5);
  // montura (encima)
  s += `<circle cx="196" cy="80" r="4" fill="none" stroke="${INK}" stroke-width="${w(1.8)}"/><circle cx="204" cy="80" r="4" fill="none" stroke="${INK}" stroke-width="${w(1.8)}"/>`;
  s += `<line x1="192" y1="80" x2="178" y2="79" stroke="${INK}" stroke-width="${w(1.8)}"/>`;
  if (e === 'grin' || e === 'sparkle' || e === 'laugh' || e === 'talk') s += L('M193.4 77.9 Q194.3 76.7 195.7 76.4 M201.4 77.9 Q202.3 76.7 203.7 76.4', 1, '#FFFFFF');
  // cejas
  if (e === 'tired') s += L('M193 74.6 L198.4 73.4 M201.6 73.4 L206.8 74.6', 1.6);
  else if (e === 'surprise') s += L('M193 71.6 Q195.8 69.4 198.6 71.2 M201.4 71.2 Q204.2 69.4 207 71.6', 1.6);
  else if (e === 'grin' || e === 'laugh' || e === 'talk' || e === 'sparkle') s += L('M193 72.2 Q195.8 70.2 198.6 72 M201.4 72 Q204.2 70.2 207 72.2', 1.6);
  else if (sm > 0.05) { const up = sm * 1.4; s += L(`M193.2 ${f(74 - up)} Q195.8 ${f(72.6 - up)} 198.4 ${f(73.8 - up)} M201.6 ${f(73.8 - up)} Q204.2 ${f(72.6 - up)} 206.8 ${f(74 - up)}`, 1.5); }
  // mejillas
  if (e !== 'normal' && e !== 'tired' && e !== 'surprise' || sm > 0.4) s += `<circle cx="193.4" cy="87.2" r="2.6" fill="${C.pink}" opacity="${f(e === 'normal' ? 0.5 * sm : 0.55)}"/>`;
  // boca
  if (e === 'tired') s += L('M197 90.2 Q200 88.4 203 90.2', 2);
  else if (e === 'grin') s += `<path d="M195.8 86.6 Q200.2 95.4 204.8 86.4 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.7)}" stroke-linejoin="round"/><path d="M196.8 87.2 H203.9 L203.3 88.5 H197.4Z" fill="#FFFFFF"/>`;
  else if (e === 'laugh') s += `<path d="M195.2 85.8 Q200.2 97.6 205.4 85.6 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.7)}" stroke-linejoin="round"/><path d="M197.6 92.4 Q200.4 90.4 203 92.2 Q200.6 94.6 197.6 92.4Z" fill="${C.pink}"/>`;
  else if (e === 'talk') { const op = clamp(o.talk || 0); s += `<path d="M196 87 Q200.2 ${f(88.4 + op * 5)} 204.6 86.8 Q200.2 ${f(88.8 - op * 0.4)} 196 87Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.7)}" stroke-linejoin="round"/>`; }
  else if (e === 'surprise') s += `<ellipse cx="200.4" cy="89.4" rx="2" ry="2.6" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}"/>`;
  else if (sm > 0.02) s += L(`M${f(196.8 - sm * 0.8)} ${f(89 - sm * 1.4)} Q200.2 ${f(89 + sm * 3.6)} ${f(203.4 + sm * 0.8)} ${f(89 - sm * 1.8)}`, 2);
  else s += L('M197 89 L203 89', 2); // referencia
  return s;
}
// Pedro en coordenadas locales (suelo y=214, mira a la derecha).
// o: legF, legB, armF, armB, bob, head, slump(0..1), lean, expr, smile, talk, blink, look, itemF(w,x,y), itemB(w,x,y)
function pedro(o) {
  const k = o.k || 1, w = v => f(v * k);
  const st = (v = 3) => `stroke="${INK}" stroke-width="${w(v)}"`, lj = 'stroke-linejoin="round"';
  const leg = (ang, shoe) => `<g transform="rotate(${f(ang)} 190 150)"><rect x="185" y="148" width="8" height="58" rx="4" fill="${P5.pants}" ${st()}/><path d="M182 206 h17 a5 5 0 0 1 0 8 h-17z" fill="${shoe}" ${st()} ${lj}/></g>`;
  let g = leg(o.legB || 0, '#E8E8E8') + leg(o.legF || 0, '#FFFFFF');
  const sl = o.slump || 0, dy = sl * 2.6, armB = (o.armB || 0) - sl * 3, armF = (o.armF || 0) + sl * 3;
  let b = '';
  b += `<g transform="translate(0 ${f(dy)}) rotate(${f(armB)} 174 108)"><rect x="170" y="106" width="7" height="40" rx="3.5" fill="${P5.skinS}" ${st()}/><rect x="168" y="102" width="11" height="14" rx="4" fill="${P5.greenS}" ${st()}/></g>`;
  b += `<rect x="174" y="98" width="32" height="56" rx="10" fill="${P5.green}"/><rect x="174" y="98" width="9" height="56" rx="5" fill="${P5.greenS}"/><rect x="174" y="98" width="32" height="56" rx="10" fill="none" ${st()}/>`;
  b += `<path d="M184.5 98.6 Q190 103.4 195.5 98.6" stroke="${INK}" stroke-width="${w(1.6)}" fill="none" stroke-linecap="round"/>`;
  if (o.itemB) { const [hx, hy] = handLocal(PB, armB, dy); b += o.itemB(w, hx, hy); }
  b += `<g transform="translate(0 ${f(dy)}) rotate(${f(armF)} 206 108)"><rect x="203" y="106" width="7" height="40" rx="3.5" fill="${P5.skin}" ${st()}/><rect x="201" y="102" width="11" height="14" rx="4" fill="${P5.green}" ${st()}/></g>`;
  if (o.itemF) { const [hx, hy] = handLocal(PF, armF, dy); b += o.itemF(w, hx, hy); }
  let hd = `<circle cx="190" cy="78" r="14" fill="${P5.skin}" ${st()}/>`;
  hd += `<path d="M176 74 Q178 60 192 61 Q205 62 205 74 Q198 68 188 70 Q181 70 176 74Z" fill="${P5.hair}" ${st()} ${lj}/>`;
  hd += pedroFace(o, w);
  b += `<g transform="translate(0 ${f(dy * 0.7)}) rotate(${f((o.head || 0) + sl * 9)} 190 94)">${hd}</g>`;
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  if (o.lean) g = `<g transform="rotate(${f(o.lean)} 190 214)">${g}</g>`;
  return g;
}
// (px,py) = punto del suelo bajo Pedro (local 190,214); sc = escala
function placePedro(px, py, sc, o) {
  o.k = SW / (3 * sc);
  const sx = o.flip ? -sc : sc;
  return `<g transform="translate(${f(px - 190 * sx)} ${f(py - 214 * sc)}) scale(${f(sx)} ${f(sc)})">${pedro(o)}</g>`;
}
const pedroPt = (px, py, sc, lx, ly, flip) => [px + (lx - 190) * sc * (flip ? -1 : 1), py + (ly - 214) * sc];
