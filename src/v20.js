/* Vídeo 20 — «Se encienden las luces de Navidad». Escena nocturna en la plaza, delante de la casa del reloj
   (dibujo reutilizado de portada_instagram_tudela.svg, en src/casa_reloj20.js, SIN Pedro ni María).
   Piezas nuevas: cielo nocturno con estrellas, versiones de color de la casa (apagada / encendida / bajo el foco),
   escenario de madera con barandillas blancas y cuerdas de bombillas, farolas, siluetas de público de espaldas
   (mirando, con móviles, con los brazos en alto), figuras de cómic genéricas (cascanueces, bailarín de lentejuelas,
   cantantes, coro de mujeres mayores y niños con sudadera, sin rasgos reconocibles), notas musicales, estrella de
   la torre, reloj iluminado, mariposas moradas, cortinas de luces, letrero «Feliz Navidad», fuegos fríos,
   guirnaldas y nieve. Todo se calcula a partir de (t local de la escena, T global). Duraciones, cues, planos y
   textos se leen de config20.json. Franja de subtítulos (y ≥ 1400) libre; margen superior hasta y=192 (10 %).
   Cortes secos entre escenas y planos; textos con rebote. */
'use strict';

const S = {};
const cues = (sc, def) => Object.assign({}, def, sc.cues || {});
const seg = (t, a, b) => clamp((t - a) / (b - a));
const TX = (key, def) => (CFG && CFG.textos && CFG.textos[key] !== undefined) ? CFG.textos[key] : def;
const bumpZ = (t, t0, a = 0.04) => t >= t0 ? 1 + a * Math.max(0, damp(t - t0, 14, 6)) : 1;
function shotOf(sc, t) {
  const e = Object.entries(sc.shots || {});
  for (let i = e.length - 1; i >= 0; i--) if (t >= e[i][1][0]) return [e[i][0], t - e[i][1][0]];
  return [e.length ? e[0][0] : '', t];
}

const K20 = {
  sky0: '#0F1B3D', sky1: '#1B2B5E', gold: '#F2C12E', goldD: '#B8860B', warm: '#FFD98A', warmL: '#FFF1C9',
  purple: '#A54CF0', purpleL: '#E6C2FF', sil: '#070B1E', silL: '#151B3A', rim: '#34427E', metal: '#2A2F45'
};

/* ===================== COLOR: mezcla y versiones de la casa ===================== */
const h2r = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const r2h = c => '#' + c.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mix = (a, b, u) => { const A = h2r(a), B = h2r(b); return r2h(A.map((v, i) => lerp(v, B[i], clamp(u)))); };
// cristales y huecos que se iluminan al encender
const GLASS20 = { '#3d5f74': '#ffd27a', '#3a63a8': '#ffc55c', '#2c3e4c': '#ffca72', '#2a211d': '#e0913c' };
const CASA_V = {
  off: c => [c[0] * 0.24 + 14, c[1] * 0.26 + 19, c[2] * 0.33 + 44],
  on: c => [c[0] * 0.74 + 16, c[1] * 0.64 + 12, c[2] * 0.56 + 30],
  spot: c => [c[0] * 1.0 + 6, c[1] * 0.95 + 3, c[2] * 0.84]
};
function casaVariant(v) {
  const fn = CASA_V[v];
  const rc = str => str.replace(/#[0-9a-fA-F]{6}\b/g, h => {
    const l = h.toLowerCase();
    if (v !== 'off' && GLASS20[l]) return v === 'on' ? GLASS20[l] : h;
    return r2h(fn(h2r(l)));
  });
  const ids = str => str.replace(/id="(towerG|rail)"/g, `id="$1_${v}"`).replace(/url\(#(towerG|rail)\)/g, `url(#$1_${v})`);
  return ids(rc(CASA20_DEFS)) + `<g id="casa_${v}" stroke-linejoin="round">${ids(rc(CASA20))}</g>`;
}
// escala de la casa en el «mundo» (zoom 1): local (331, 410) -> pantalla (540, 1150)
const BS = 1.9, BX = 540 - 331 * BS, BY = 1150 - 410 * BS;
const LX = x => BX + x * BS, LY = y => BY + y * BS;
const casa = v => `<use href="#casa_${v}" transform="translate(${f(BX)} ${f(BY)}) scale(${BS})"/>`;
const glow = (x, y, r, g, op = 1) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${g})" opacity="${f(op)}"/>`;
const st20 = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round" stroke-linecap="round"`;

/* ===================== CIELO NOCTURNO ===================== */
const STARS20 = Array.from({ length: 110 }, (_, i) => ({ x: hash(i * 3.1) * W, y: 20 + Math.pow(hash(i * 7.7), 1.3) * 1050, r: 1.6 + hash(i * 1.9) * 2.6, p: hash(i * 5.3) * 6, v: 1.2 + hash(i * 2.2) * 2 }));
function sky20(T, o = {}) {
  let s = `<rect width="${W}" height="${H}" fill="url(#sky20)"/>`;
  const dy = o.dy || 0;
  STARS20.forEach((st, i) => {
    const tw = 0.55 + 0.45 * Math.sin(T * st.v + st.p);
    s += `<circle cx="${f(st.x)}" cy="${f(st.y + dy)}" r="${f(st.r * (0.8 + 0.2 * tw))}" fill="#FFFFFF" opacity="${f(0.35 + 0.6 * tw)}"/>`;
    if (i % 11 === 0) s += sparkle(st.x, st.y + dy, 9 + st.r * 2, 0.5 + 0.5 * tw, '#FFF6D6');
  });
  return s;
}

/* ===================== SUELO DE LA PLAZA ===================== */
function plaza20(lit) {
  const fill = lit ? '#3A3452' : '#161C38', line = lit ? '#4C4566' : '#222A4A';
  let s = `<rect x="-700" y="1146" width="${W + 1400}" height="1400" fill="${fill}"/>`;
  [1172, 1205, 1250, 1310, 1390, 1490].forEach(y => { s += `<line x1="-700" y1="${y}" x2="${W + 700}" y2="${y}" stroke="${line}" stroke-width="3"/>`; });
  for (let i = -12; i <= 12; i++) s += `<line x1="${540 + i * 70}" y1="1146" x2="${540 + i * 260}" y2="2400" stroke="${line}" stroke-width="3"/>`;
  s += `<line x1="-700" y1="1148" x2="${W + 700}" y2="1148" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/>`;
  return s;
}

/* ===================== FAROLAS ===================== */
function farola20(x, base, on) {
  const top = base - 360;
  const m = on ? '#3B3756' : K20.metal;
  let s = '';
  if (on) s += glow(x, top - 30, 190, 'g20warm', 0.75);
  s += `<rect x="${x - 9}" y="${top}" width="18" height="${base - top}" fill="${m}" ${st20(0.5)}/>`;
  s += `<rect x="${x - 24}" y="${base - 34}" width="48" height="34" rx="6" fill="${m}" ${st20(0.5)}/>`;
  s += `<path d="M${x - 30} ${top - 6} L${x + 30} ${top - 6} L${x + 20} ${top + 10} L${x - 20} ${top + 10}Z" fill="${m}" ${st20(0.5)}/>`;
  s += `<path d="M${x - 26} ${top - 72} L${x + 26} ${top - 72} L${x + 20} ${top - 6} L${x - 20} ${top - 6}Z" fill="${on ? K20.warm : '#343B57'}" ${st20(0.5)}/>`;
  if (on) s += `<path d="M${x - 14} ${top - 64} L${x + 14} ${top - 64} L${x + 10} ${top - 14} L${x - 10} ${top - 14}Z" fill="${K20.warmL}"/>`;
  s += `<line x1="${x}" y1="${top - 72}" x2="${x}" y2="${top - 8}" stroke="${m}" stroke-width="5"/>`;
  s += `<path d="M${x - 36} ${top - 70} L${x} ${top - 100} L${x + 36} ${top - 70}Z" fill="${m}" ${st20(0.5)}/>`;
  s += `<circle cx="${x}" cy="${top - 108}" r="9" fill="${m}" ${st20(0.4)}/>`;
  return s;
}
const FAROLAS20 = [[70, 1240], [1010, 1240]];

/* ===================== ESCENARIO ===================== */
const ST = { back: 1182, front: 1250, bx0: 200, bx1: 880, fx0: 140, fx1: 940, face: 66 };
function stage20(u) {
  const deck = mix('#2B2537', '#C08E57', u), deckL = mix('#231E2E', '#9C6C3E', u), face = mix('#1F1A28', '#80562F', u);
  const rail = mix('#5A6180', '#F5F5F5', u);
  let s = '';
  // barandilla del fondo (detrás de las figuras)
  const rt = ST.back - 80, rm = ST.back - 42;
  let posts = '';
  for (let i = 0; i <= 10; i++) { const x = lerp(ST.bx0, ST.bx1, i / 10); posts += `M${f(x)} ${ST.back} V${rt}`; }
  const railD = `${posts} M${ST.bx0} ${rt} H${ST.bx1} M${ST.bx0} ${rm} H${ST.bx1}`;
  s += `<path d="${railD}" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="${railD}" fill="none" stroke="${rail}" stroke-width="5.5" stroke-linecap="round"/>`;
  // tarima
  s += `<path d="M${ST.bx0} ${ST.back} L${ST.bx1} ${ST.back} L${ST.fx1} ${ST.front} L${ST.fx0} ${ST.front}Z" fill="${deck}" ${st20(0.6)}/>`;
  for (let i = 1; i < 12; i++) s += `<line x1="${f(lerp(ST.bx0, ST.bx1, i / 12))}" y1="${ST.back}" x2="${f(lerp(ST.fx0, ST.fx1, i / 12))}" y2="${ST.front}" stroke="${deckL}" stroke-width="3"/>`;
  s += `<rect x="${ST.fx0}" y="${ST.front}" width="${ST.fx1 - ST.fx0}" height="${ST.face}" fill="${face}" ${st20(0.6)}/>`;
  for (let x = ST.fx0 + 60; x < ST.fx1; x += 60) s += `<line x1="${x}" y1="${ST.front + 4}" x2="${x}" y2="${ST.front + ST.face - 4}" stroke="${deckL}" stroke-width="3"/>`;
  // barandillas laterales
  [[ST.bx0, ST.fx0], [ST.bx1, ST.fx1]].forEach(([xb, xf]) => {
    let d = '';
    for (let i = 0; i <= 3; i++) { const x = lerp(xb, xf, i / 3), y = lerp(ST.back, ST.front, i / 3); d += `M${f(x)} ${f(y)} V${f(y - 80)}`; }
    d += `M${xb} ${rt} L${xf} ${ST.front - 80} M${xb} ${rm} L${xf} ${ST.front - 42}`;
    s += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${rail}" stroke-width="5.5" stroke-linecap="round"/>`;
  });
  if (u > 0.05) s += `<ellipse cx="540" cy="${ST.front - 20}" rx="380" ry="40" fill="url(#g20white)" opacity="${f(0.35 * u)}"/>`;
  return s;
}
// postes y cuerdas de bombillas encima del escenario
function bulbs20(T, on) {
  let s = '';
  [ST.bx0 - 6, ST.bx1 + 6].forEach(x => { s += `<rect x="${x - 6}" y="952" width="12" height="${ST.back - 952}" fill="${on ? '#4A4560' : K20.metal}" ${st20(0.4)}/>`; });
  const strings = [[962, 16], [976, 30]];
  strings.forEach(([y, sag], j) => {
    let d = '', pts = [];
    for (let i = 0; i <= 40; i++) { const u = i / 40; const x = lerp(ST.bx0 - 6, ST.bx1 + 6, u), yy = y + sag * 4 * u * (1 - u); d += (i ? 'L' : 'M') + f(x) + ' ' + f(yy); }
    for (let i = 1; i < 16; i++) { const u = i / 16; pts.push([lerp(ST.bx0 - 6, ST.bx1 + 6, u), y + sag * 4 * u * (1 - u)]); }
    s += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="3"/>`;
    pts.forEach(([x, yy], i) => {
      if (on) {
        const tw = 0.75 + 0.25 * Math.sin(T * 5 + i * 1.7 + j);
        s += glow(x, yy + 9, 30, 'g20warm', 0.8 * tw);
        s += `<circle cx="${f(x)}" cy="${f(yy + 9)}" r="7.5" fill="${K20.warm}" stroke="${INK}" stroke-width="2"/><circle cx="${f(x - 2)}" cy="${f(yy + 7)}" r="2.6" fill="#FFFFFF"/>`;
      } else s += `<circle cx="${f(x)}" cy="${f(yy + 9)}" r="7" fill="#3A4058" stroke="${INK}" stroke-width="2"/>`;
    });
  });
  return s;
}

/* ===================== PÚBLICO DE ESPALDAS (pantalla) ===================== */
const CROWD20 = [];
for (let i = 0; i < 15; i++) CROWD20.push({ x: -20 + i * 80 + (hash(i * 4.1) - 0.5) * 24, y: 1372 + (hash(i * 2.9) - 0.5) * 18, r: 28 + hash(i * 6.3) * 6, row: 0, i });
for (let i = 0; i < 11; i++) CROWD20.push({ x: 0 + i * 110 + (hash(i * 8.1) - 0.5) * 30, y: 1470 + (hash(i * 3.7) - 0.5) * 20, r: 38 + hash(i * 1.3) * 7, row: 1, i: i + 20 });
function person20(p, T, mode, k, lit) {
  const { x, r } = p, h = hash(p.i * 9.7);
  const sway = Math.sin(T * 1.6 + p.i) * 4;
  const y = p.y + (mode === 'cheer' ? -Math.abs(Math.sin(T * 5 + p.i)) * 10 * k : 0);
  const body = lit ? K20.silL : K20.sil, rim = lit ? '#6A4E5E' : K20.rim;
  let s = '', arms = '';
  const armW = r * 0.42;
  const armPath = (x0, y0, x1, y1) => `<path d="M${f(x0)} ${f(y0)} L${f(x1)} ${f(y1)}" stroke="${rim}" stroke-width="${f(armW + 6)}" stroke-linecap="round"/><path d="M${f(x0)} ${f(y0)} L${f(x1)} ${f(y1)}" stroke="${body}" stroke-width="${f(armW)}" stroke-linecap="round"/>`;
  if (mode === 'phones' && h > 0.45 && k > 0) {
    const side = h > 0.72 ? -1 : 1, ky = lerp(0, 1, k);
    const hx = x + side * r * 0.9 + sway, hy = lerp(y + r * 2.4, y - r * 1.25, ky);
    arms += armPath(x + side * r * 1.1, y + r * 1.1, hx, hy);
    arms += at(hx, hy - r * 0.35, 1, `<rect x="${f(-r * 0.32)}" y="${f(-r * 0.55)}" width="${f(r * 0.64)}" height="${f(r * 1.1)}" rx="${f(r * 0.1)}" fill="#111522" stroke="${rim}" stroke-width="3"/><rect x="${f(-r * 0.25)}" y="${f(-r * 0.46)}" width="${f(r * 0.5)}" height="${f(r * 0.92)}" rx="${f(r * 0.06)}" fill="#BFE3F2"/><rect x="${f(-r * 0.25)}" y="${f(-r * 0.05)}" width="${f(r * 0.5)}" height="${f(r * 0.51)}" fill="#F7D28A" opacity="0.85"/>`, side * 6);
    arms += glow(hx, hy - r * 0.35, r * 1.1, 'g20cyan', 0.35);
  }
  if (mode === 'cheer' && k > 0 && h > 0.5) {
    [-1, 1].forEach(side => {
      const wv = Math.sin(T * 6 + p.i + side) * r * 0.35;
      const hx = x + side * r * 1.45 + wv, hy = lerp(y + r * 2.2, y - r * 1.5, k);
      arms += armPath(x + side * r * 1.05, y + r * 1.15, hx, hy);
      arms += `<circle cx="${f(hx)}" cy="${f(hy)}" r="${f(armW * 0.62)}" fill="${body}" stroke="${rim}" stroke-width="3"/>`;
    });
  }
  // cuerpo: hombros + tronco
  const bodyD = `M${f(x - r * 1.9)} ${H + 40} L${f(x - r * 1.85)} ${f(y + r * 1.75)} Q${f(x - r * 1.8)} ${f(y + r * 0.95)} ${f(x - r * 0.9)} ${f(y + r * 0.85)} L${f(x + r * 0.9)} ${f(y + r * 0.85)} Q${f(x + r * 1.8)} ${f(y + r * 0.95)} ${f(x + r * 1.85)} ${f(y + r * 1.75)} L${f(x + r * 1.9)} ${H + 40}Z`;
  s += `<path d="${bodyD}" fill="${body}" stroke="${rim}" stroke-width="3"/>`;
  s += `<rect x="${f(x - r * 0.38)}" y="${f(y + r * 0.5)}" width="${f(r * 0.76)}" height="${f(r * 0.5)}" fill="${body}"/>`;
  // cabeza (de espaldas: solo pelo / gorro)
  const hx = x + sway * 0.3;
  s += `<circle cx="${f(hx)}" cy="${f(y)}" r="${f(r)}" fill="${body}" stroke="${rim}" stroke-width="3"/>`;
  if (h < 0.3) s += `<path d="M${f(hx - r * 1.02)} ${f(y - r * 0.05)} Q${f(hx)} ${f(y - r * 1.5)} ${f(hx + r * 1.02)} ${f(y - r * 0.05)}Z" fill="${body}" stroke="${rim}" stroke-width="3"/><circle cx="${f(hx)}" cy="${f(y - r * 1.12)}" r="${f(r * 0.3)}" fill="${body}" stroke="${rim}" stroke-width="3"/>`;
  else if (h < 0.5) s += `<ellipse cx="${f(hx + r * 0.1)}" cy="${f(y + r * 0.95)}" rx="${f(r * 0.32)}" ry="${f(r * 0.55)}" fill="${body}" stroke="${rim}" stroke-width="3"/>`;
  return s + arms;
}
function crowd20(T, mode = 'watch', k = 1, lit = false) {
  let s = '';
  CROWD20.forEach(p => { s += person20(p, T, mode, p.row ? k : clamp(k * 1.2 - 0.1), lit); });
  return s;
}

/* ===================== FIGURAS DE CÓMIC GENÉRICAS ===================== */
// local: pies en (0,0), cabeza en (0,-196) r 25; o.kind: nut | star | singerA | singerB | lady | kid
const FIG20 = {
  nut: { jacket: '#D32F2F', pants: '#1E1A1A', shoe: '#FFFFFF', sole: '#9A9A9A', sleeve: '#D32F2F', hair: '#3A2A20' },
  star: { jacket: '#1C1B24', pants: '#1E1A1A', shoe: '#1E1A1A', sole: '#1E1A1A', sleeve: '#1C1B24', hair: '#3A2A20' },
  singerA: { jacket: '#FFFFFF', pants: '#2D3550', shoe: '#2A2230', sole: '#2A2230', sleeve: '#FFFFFF', hair: '#6B3E26' },
  singerB: { jacket: '#2E6B5A', pants: '#262233', shoe: '#2A2230', sole: '#2A2230', sleeve: '#2E6B5A', hair: '#2E211C' },
  lady: { jacket: '#23212B', pants: '#23212B', shoe: '#1E1A1A', sole: '#1E1A1A', sleeve: '#23212B', hair: '#D2D2D8' },
  kid: { jacket: '#F6F6F6', pants: '#F1EFEA', shoe: '#FFFFFF', sole: '#A0A0A0', sleeve: '#F6F6F6', hair: '#5A3A2A' }
};
function limb(pts, w, col, lw) {
  const d = pts.map((p, i) => (i ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1])).join(' ');
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${f(w + 2 * lw)}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
const dirA = (a, side) => [side * Math.sin(a * PI / 180), Math.cos(a * PI / 180)];
function hair20(style, col, lw, back) {
  const L = `stroke="${INK}" stroke-width="${f(lw)}" stroke-linejoin="round"`;
  const cap = `<path d="M-26 -192 Q-28 -226 0 -225 Q28 -226 26 -192 Q18 -207 2 -208 Q-14 -206 -26 -192Z" fill="${col}" ${L}/>`;
  if (back) return `<circle cx="0" cy="-196" r="25.5" fill="${col}" ${L}/>`;
  if (style === 'curly') {
    let g = '';
    [[-22, -214, 11], [-8, -224, 12], [9, -224, 12], [23, -213, 11], [29, -197, 10], [-29, -197, 10], [-30, -181, 9], [30, -181, 9]].forEach(([x, y, r]) => { g += `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" ${L}/>`; });
    return g + `<path d="M-20 -206 Q0 -219 20 -206 Q8 -212 -20 -206Z" fill="${col}"/>`;
  }
  if (style === 'pigtails') return `<circle cx="-31" cy="-188" r="10" fill="${col}" ${L}/><circle cx="31" cy="-188" r="10" fill="${col}" ${L}/>` + cap + `<path d="M14 -222 l10 -8 l2 12 z M14 -222 l-2 -12 l12 4 z" fill="${C.red}" ${L}/>`;
  if (style === 'bun') return cap + `<circle cx="0" cy="-228" r="11" fill="${col}" ${L}/>`;
  if (style === 'bob') return `<path d="M-28 -176 Q-32 -228 0 -226 Q32 -228 28 -176 L20 -176 Q22 -200 8 -207 Q-12 -204 -20 -190 L-20 -176Z" fill="${col}" ${L}/>`;
  if (style === 'spiky') return `<path d="M-26 -194 L-26 -214 L-16 -222 L-10 -232 L-2 -224 L6 -234 L12 -224 L22 -226 L26 -212 L26 -194 Q16 -208 0 -208 Q-14 -208 -26 -194Z" fill="${col}" ${L}/>`;
  return cap;
}
function face20(lw, mood) {
  let g = '';
  if (mood === 'serene') g += `<path d="M-13 -198 Q-9 -194 -5 -198 M5 -198 Q9 -194 13 -198" fill="none" stroke="${INK}" stroke-width="${f(lw * 0.9)}" stroke-linecap="round"/>`;
  else g += `<circle cx="-9" cy="-198" r="3.2" fill="${INK}"/><circle cx="9" cy="-198" r="3.2" fill="${INK}"/>`;
  if (mood === 'sing') g += `<ellipse cx="0" cy="-184" rx="4.5" ry="5.5" fill="${INK}"/>`;
  else g += `<path d="M-6 -186 Q0 -181 6 -186" fill="none" stroke="${INK}" stroke-width="${f(lw * 0.9)}" stroke-linecap="round"/>`;
  g += `<circle cx="-16" cy="-189" r="4.5" fill="${C.pink}" opacity="0.55"/><circle cx="16" cy="-189" r="4.5" fill="${C.pink}" opacity="0.55"/>`;
  return g;
}
function fig20(x, y, sc, o, T = 0) {
  const P = FIG20[o.kind], lw = 2.4 / Math.max(0.5, Math.min(1.2, sc)) * 1.2;
  const L = `stroke="${INK}" stroke-width="${f(lw)}" stroke-linejoin="round"`;
  const spin = o.sx === undefined ? 1 : o.sx, back = spin < 0;
  const sx = (spin < 0 ? -1 : 1) * Math.max(0.2, Math.abs(spin));
  const legs = o.legs || 4, lean = o.lean || 0, dip = o.dip || 0, hop = o.hop || 0;
  const arms = o.arms || [[14, 6], [14, 6]];
  let g = '';
  // piernas y zapatos
  const skirt = o.kind === 'lady';
  [-1, 1].forEach(sd => {
    const fx = sd * (11 + legs);
    if (skirt) g += limb([[sd * 9, -40], [fx, -8]], 11, P.pants, lw);
    else g += limb([[sd * 11, -92], [fx, -8]], 20, P.pants, lw);
    g += `<ellipse cx="${f(fx + sd * 4)}" cy="-5" rx="15" ry="7.5" fill="${P.shoe}" ${L}/>`;
    if (P.sole !== P.shoe) g += `<path d="M${f(fx + sd * 4 - 14)} -3 Q${f(fx + sd * 4)} 3 ${f(fx + sd * 4 + 14)} -3" fill="none" stroke="${P.sole}" stroke-width="3"/>`;
  });
  // parte de arriba (inclinación, giro de reverencia)
  let u = '';
  if (skirt) u += `<path d="M-27 -100 L27 -100 L36 -30 Q0 -22 -36 -30Z" fill="${P.jacket}" ${L}/>`;
  // capucha de la sudadera (detrás)
  if (o.kind === 'kid') u += `<ellipse cx="0" cy="-166" rx="30" ry="10" fill="${P.jacket}" ${L}/>`;
  u += `<rect x="-8" y="-186" width="16" height="22" fill="${C.skin}" ${L}/>`;
  u += `<rect x="-30" y="-168" width="60" height="${skirt ? 74 : 82}" rx="15" fill="${P.jacket}" ${L}/>`;
  if (!back) {
    if (o.kind === 'nut') {
      [-150, -136, -122].forEach(yy => { u += `<line x1="-21" y1="${yy}" x2="21" y2="${yy}" stroke="${K20.gold}" stroke-width="4.5" stroke-linecap="round"/><circle cx="-22" cy="${yy}" r="3.6" fill="${K20.gold}" ${L}/><circle cx="22" cy="${yy}" r="3.6" fill="${K20.gold}" ${L}/>`; });
      u += `<rect x="-30" y="-100" width="60" height="9" fill="${INK}"/><rect x="-6" y="-101" width="12" height="11" fill="${K20.gold}" ${L}/>`;
      u += `<path d="M-10 -168 L0 -158 L10 -168" fill="none" stroke="${K20.gold}" stroke-width="4"/>`;
    }
    if (o.kind === 'star') {
      u += `<path d="M-11 -168 L0 -136 L11 -168Z" fill="#FFFFFF" ${L}/>`;
      for (let yy = -160; yy < -90; yy += 9) for (let xx = -25; xx <= 25; xx += 9) {
        if (Math.abs(xx) < 12 && yy < -138) continue;
        const k = hash(xx * 13.1 + yy * 7.3), tw = 0.5 + 0.5 * Math.sin(T * 9 + k * 30);
        u += `<circle cx="${xx + ((yy / 9) % 2 ? 4 : 0)}" cy="${yy}" r="3" fill="${k > 0.6 ? '#FFFFFF' : (k > 0.3 ? '#C9C9E0' : '#6E6E86')}" opacity="${f(0.45 + 0.55 * tw)}"/>`;
      }
    }
    if (o.kind === 'singerA') u += `<path d="M-12 -168 Q0 -156 12 -168" fill="none" stroke="#D9D9D9" stroke-width="3"/><circle cx="0" cy="-150" r="2.4" fill="#D9D9D9"/><circle cx="0" cy="-134" r="2.4" fill="#D9D9D9"/>`;
    if (o.kind === 'singerB') u += `<path d="M-14 -168 Q0 -150 14 -168" fill="#E9E2D0" ${L}/>`;
    if (o.kind === 'lady') u += `<path d="M-12 -168 Q0 -156 12 -168" fill="none" stroke="#4A4656" stroke-width="3"/>`;
    if (o.kind === 'kid') u += `<path d="M-16 -118 H16 L20 -100 H-20Z" fill="none" stroke="#C8C8C8" stroke-width="3"/><line x1="-6" y1="-166" x2="-7" y2="-146" stroke="#C8C8C8" stroke-width="2.6"/><line x1="6" y1="-166" x2="7" y2="-146" stroke="#C8C8C8" stroke-width="2.6"/>`;
  }
  // brazos
  let armsS = '';
  const hands = [];
  [-1, 1].forEach((sd, j) => {
    const [a1, a2] = arms[j];
    const sh = [sd * 27, -160], d1 = dirA(a1, sd), el = [sh[0] + d1[0] * 38, sh[1] + d1[1] * 38];
    const d2 = dirA(a1 + a2, sd), hd = [el[0] + d2[0] * 34, el[1] + d2[1] * 34];
    armsS += limb([sh, el, hd], 15, P.sleeve, lw);
    if (o.kind === 'nut' && !back) armsS += `<rect x="${sd * 27 - 11}" y="-170" width="22" height="10" rx="4" fill="${K20.gold}" ${L}/>`;
    armsS += `<circle cx="${f(hd[0])}" cy="${f(hd[1])}" r="8" fill="${C.skin}" ${L}/>`;
    hands.push([hd, d2]);
  });
  // cabeza
  let hd = `<circle cx="0" cy="-196" r="25" fill="${C.skin}" ${L}/>`;
  if (o.kind === 'nut') {
    hd += hair20('cap', P.hair, lw, back);
    hd += `<rect x="-20" y="-252" width="40" height="38" fill="${C.red}" ${L}/><rect x="-20" y="-252" width="40" height="7" fill="${K20.gold}" ${L}/>`;
    if (!back) hd += `<circle cx="0" cy="-230" r="6" fill="${K20.gold}" ${L}/><path d="M-23 -214 Q0 -206 23 -214 L22 -209 Q0 -198 -22 -209Z" fill="${INK}"/>`;
    else hd += `<rect x="-22" y="-216" width="44" height="5" fill="${INK}"/>`;
  } else if (o.kind === 'star') {
    hd += hair20('cap', P.hair, lw, back);
    hd += `<ellipse cx="0" cy="-213" rx="38" ry="8" fill="#8E8E96" ${L}/><path d="M-22 -214 L-19 -241 Q0 -250 19 -241 L22 -214Z" fill="#9A9AA2" ${L}/><rect x="-21" y="-224" width="42" height="7" fill="#45454F"/>`;
  } else hd += hair20(o.hair || 'cap', o.hairCol || P.hair, lw, back);
  if (!back) hd += face20(lw, o.mood);
  const tilt = (o.tilt || 0) + dip * 16;
  u += `<g transform="rotate(${f(tilt)} 0 -180) translate(0 -9)">${hd}</g>`;
  if (o.mic) {
    const [[hx, hy]] = [hands[o.mic === 'L' ? 0 : 1]];
    const tx = 6 * (o.mic === 'L' ? -1 : 1), ty = -195;
    const ang = Math.atan2(ty - hy, tx - hx), mx = hx + Math.cos(ang) * 22, my = hy + Math.sin(ang) * 22;
    armsS += `<line x1="${f(hx)}" y1="${f(hy)}" x2="${f(mx)}" y2="${f(my)}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><circle cx="${f(mx)}" cy="${f(my)}" r="7.5" fill="#55555F" ${L}/>`;
  }
  u += armsS;
  const ut = `translate(0 ${f(hop + dip * 12)}) rotate(${f(lean)} 0 -92) translate(0 -92) scale(1 ${f(1 - 0.1 * dip)}) translate(0 92)`;
  g += `<g transform="${ut}">${u}</g>`;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(sc * sx)} ${f(sc)})">${g}</g>`;
}
// micrófono de pie (mundo)
function micStand20(x, base, top) {
  const L = `stroke="${INK}" stroke-width="3" stroke-linejoin="round"`;
  return `<path d="M${x - 22} ${base} L${x} ${base - 24} L${x + 22} ${base} M${x} ${base - 24} L${x} ${base + 4}" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M${x - 22} ${base} L${x} ${base - 24} L${x + 22} ${base}" fill="none" stroke="#8E92A6" stroke-width="2.5"/>` +
    `<line x1="${x}" y1="${base - 20}" x2="${x}" y2="${top}" stroke="${INK}" stroke-width="7"/><line x1="${x}" y1="${base - 20}" x2="${x}" y2="${top}" stroke="#8E92A6" stroke-width="3"/>` +
    `<rect x="${x - 6}" y="${top - 22}" width="12" height="24" rx="6" fill="#4A4A55" ${L} transform="rotate(-18 ${x} ${top})"/>`;
}

/* ===================== COREOGRAFÍA (8 tiempos de 0,5 s, en bucle) ===================== */
const DANCE20 = [
  { lean: 0, a: [[16, 8], [16, 8]], spin: 0, legs: 4, hop: 0, dip: 0 },
  { lean: -15, a: [[95, 0], [150, 12]], spin: 0, legs: 16, hop: 0, dip: 0 },
  { lean: 0, a: [[92, 0], [92, 0]], spin: 0, legs: 10, hop: 0, dip: 0 },
  { lean: 15, a: [[150, 12], [95, 0]], spin: 0, legs: 16, hop: 0, dip: 0 },
  { lean: 0, a: [[165, 6], [165, 6]], spin: 0, legs: 6, hop: -18, dip: 0 },
  { lean: -8, a: [[48, -105], [48, -105]], spin: 0, legs: 4, hop: 0, dip: 0 },
  { lean: 8, a: [[120, -40], [60, 100]], spin: 0, legs: 14, hop: -8, dip: 0 },
  { lean: 0, a: [[30, 25], [30, 25]], spin: 0, legs: 6, hop: 0, dip: 1 }
];
function dancePose(t) {
  const c = Math.max(0, t) / 0.5, i = Math.floor(c) % 8, u = easeInOut(c - Math.floor(c));
  const A = DANCE20[i], B = DANCE20[(i + 1) % 8];
  const sp = lerp(A.spin, B.spin, u);
  return {
    lean: lerp(A.lean, B.lean, u), legs: lerp(A.legs, B.legs, u), hop: lerp(A.hop, B.hop, u), dip: lerp(A.dip, B.dip, u),
    arms: [0, 1].map(j => [lerp(A.a[j][0], B.a[j][0], u), lerp(A.a[j][1], B.a[j][1], u)]),
    sx: 1
  };
}
function dancers20(t, T, k = 1) {
  const p = dancePose(t);
  let s = '';
  [[350, 'nut'], [540, 'star'], [730, 'nut']].forEach(([x, kind], i) => {
    if (k <= 0.01) return;
    s += `<ellipse cx="${x}" cy="${ST.back + 42}" rx="54" ry="10" fill="${INK}" opacity="0.3"/>`;
    s += at(x, ST.back + 42, k, fig20(0, 0, 0.88, Object.assign({ kind, mood: 'smile' }, p), T));
  });
  return s;
}

/* ===================== NOTAS MUSICALES ===================== */
function note20(x, y, s, col, rot, dbl) {
  const L = `stroke="${INK}" stroke-width="${f(3 / s)}" stroke-linejoin="round"`;
  let g = dbl
    ? `<path d="M10 -44 L42 -52 L42 -8 M10 -44 L10 0 M10 -36 L42 -44" fill="none" stroke="${INK}" stroke-width="${f(6 / s + 4)}" stroke-linecap="round"/><path d="M10 -44 L42 -52 L42 -8 M10 -44 L10 0" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="12" ry="8.5" transform="rotate(-20)" fill="${col}" ${L}/><ellipse cx="32" cy="-8" rx="12" ry="8.5" transform="rotate(-20 32 -8)" fill="${col}" ${L}/>`
    : `<path d="M10 -2 L10 -46 Q26 -38 24 -20" fill="none" stroke="${INK}" stroke-width="${f(6 / s + 4)}" stroke-linecap="round"/><path d="M10 -2 L10 -46 Q26 -38 24 -20" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="12" ry="8.5" transform="rotate(-20)" fill="${col}" ${L}/>`;
  return at(x, y, s, g, rot);
}
function notes20(t, x0, y0, n, spread, s = 1, cols = ['#FFFFFF', K20.gold, '#BFE3F2']) {
  let out = '';
  const P = 2.4;
  for (let i = 0; i < n; i++) {
    const tt = t - i * P / n;
    if (tt < 0) continue;
    const u = (tt % P) / P, cyc = Math.floor(tt / P);
    const hx = hash(i * 3.3 + cyc * 1.7);
    const x = x0 + (hx - 0.5) * spread + 22 * Math.sin(u * 6 + i), y = y0 - u * 190 * s;
    const k = Math.min(pop(u * P, 0, 0.35), 1 - seg(u, 0.75, 1));
    if (k <= 0.02) continue;
    out += `<g opacity="${f(clamp(k))}">${note20(x, y, s * Math.max(0.3, k), cols[i % cols.length], -12 + 24 * Math.sin(u * 4 + i), i % 3 === 1)}</g>`;
  }
  return out;
}

/* ===================== LUCES DE NAVIDAD ===================== */
function butterfly20(x, y, s, T, i) {
  const fl = 0.82 + 0.18 * Math.sin(T * 3 + i * 1.3);
  const L = `stroke="${INK}" stroke-width="${f(2.6 / s)}" stroke-linejoin="round"`;
  let g = glow(0, 0, 70, 'g20purple', 0.75);
  [-1, 1].forEach(sd => {
    g += `<g transform="scale(${f(sd * fl)} 1)"><path d="M2 -4 C14 -40 52 -42 48 -14 C46 2 20 4 2 0Z" fill="${K20.purple}" ${L}/><path d="M2 2 C20 6 40 14 30 32 C22 44 6 28 2 8Z" fill="${K20.purple}" ${L}/>` +
      `<path d="M8 -6 C18 -30 40 -32 38 -16 C36 -6 20 -4 8 -4Z" fill="#FFE27A" opacity="0.9"/><path d="M8 6 C20 10 30 16 24 26 C18 32 10 22 8 10Z" fill="#FFE27A" opacity="0.9"/></g>`;
  });
  g += `<ellipse cx="0" cy="2" rx="4.5" ry="18" fill="#F4E4FF" ${L}/><path d="M-2 -14 Q-10 -28 -14 -30 M2 -14 Q10 -28 14 -30" fill="none" stroke="#F4E4FF" stroke-width="2.4" stroke-linecap="round"/>`;
  return at(x, y, s, g);
}
function curtain20(x0, x1, y0, y1, n, T, seed) {
  let s = '';
  for (let j = 0; j < n; j++) {
    const x = lerp(x0, x1, n === 1 ? 0.5 : j / (n - 1));
    s += `<line x1="${f(x)}" y1="${f(y0)}" x2="${f(x)}" y2="${f(y1)}" stroke="#6B5A3A" stroke-width="1.6"/>`;
    for (let y = y0 + 6, q = 0; y <= y1; y += 11, q++) {
      const tw = 0.55 + 0.45 * Math.sin(T * 4.5 + seed + j * 1.3 + q * 0.9);
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(2.4 + 1.6 * tw)}" fill="${tw > 0.85 ? '#FFFFFF' : '#FFE2A0'}" opacity="${f(0.55 + 0.45 * tw)}"/>`;
    }
  }
  return s;
}
function garland20(x0, x1, y, swags, sag, T, seed) {
  let s = '', d = '';
  const cols = ['#FFD86B', '#FF7A6B', '#FFFFFF', '#FFC14D', '#8FE3FF'];
  for (let w = 0; w < swags; w++) {
    const a = lerp(x0, x1, w / swags), b = lerp(x0, x1, (w + 1) / swags);
    d += `M${f(a)} ${f(y)} Q${f((a + b) / 2)} ${f(y + sag * 2)} ${f(b)} ${f(y)}`;
    for (let i = 1; i < 6; i++) {
      const u = i / 6, x = lerp(a, b, u), yy = y + sag * 4 * u * (1 - u);
      const tw = 0.6 + 0.4 * Math.sin(T * 5 + seed + w * 2 + i * 1.1);
      s += `<circle cx="${f(x)}" cy="${f(yy + 4)}" r="${f(5 + tw * 1.5)}" fill="${cols[(i + w) % cols.length]}" opacity="${f(0.6 + 0.4 * tw)}"/>`;
    }
  }
  return `<path d="${d}" fill="none" stroke="#3A3020" stroke-width="2.4"/>` + s;
}
function towerStar20(T, k) {
  if (k <= 0.01) return '';
  const x = LX(332), y = LY(-44), r = 62;
  let g = glow(0, 0, 200, 'g20gold', 0.85);
  g += `<path d="${starPath(r, r * 0.45, 5)}" transform="translate(7 7)" fill="${INK}"/><path d="${starPath(r, r * 0.45, 5)}" fill="#FFD23F" stroke="${INK}" stroke-width="${f(SW * 0.7)}" stroke-linejoin="round"/>`;
  g += `<path d="${starPath(r * 0.55, r * 0.25, 5)}" fill="#FFF3B0"/>`;
  let s = `<line x1="${f(x)}" y1="${f(y + r * 0.6)}" x2="${f(x)}" y2="${f(LY(-4))}" stroke="${INK}" stroke-width="6"/>`;
  s += at(x, y, k * (1 + 0.04 * Math.sin(T * 4)), g, 4 * Math.sin(T * 1.3));
  [[-95, -40, 20], [100, -30, 16], [-70, 70, 13], [82, 74, 15]].forEach(([dx, dy, rr], i) => { s += sparkle(x + dx, y + dy, rr, k * (0.5 + 0.5 * Math.sin(T * 5 + i * 2)), '#FFF6D6'); });
  return s;
}
function clockLit20(T, k) {
  if (k <= 0.01) return '';
  const x = LX(332), y = LY(92.75), r = 15 * BS;
  let s = glow(x, y, 120 * k, 'g20warm', 0.95);
  s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#FFF6D6" stroke="#5A4630" stroke-width="3"/>`;
  for (let i = 0; i < 12; i++) { const a = i * PI / 6; s += `<line x1="${f(x + Math.sin(a) * r * 0.78)}" y1="${f(y - Math.cos(a) * r * 0.78)}" x2="${f(x + Math.sin(a) * r * 0.9)}" y2="${f(y - Math.cos(a) * r * 0.9)}" stroke="${INK}" stroke-width="2"/>`; }
  // las 20:00
  const ah = 8 * PI / 6, am = 0;
  s += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x + Math.sin(ah) * r * 0.5)}" y2="${f(y - Math.cos(ah) * r * 0.5)}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  s += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x + Math.sin(am) * r * 0.75)}" y2="${f(y - Math.cos(am) * r * 0.75)}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="${f(x)}" cy="${f(y)}" r="3" fill="${INK}"/>`;
  return s;
}
function sign20(T, k) {
  if (k <= 0.01) return '';
  const str = TX('letrero', 'Feliz Navidad'), size = 56, x = 540, y = LY(300.5);
  const fl = 0.85 + 0.15 * Math.sin(T * 7) * Math.sin(T * 3.1);
  let g = `<path d="M-215 0 Q-235 -30 -205 -34 M215 0 Q235 -30 205 -34" fill="none" stroke="#9FEFFF" stroke-width="4" stroke-linecap="round"/>`;
  g += `<text x="0" y="3" font-family="Baloo2" font-weight="800" font-size="${size}" text-anchor="middle" dominant-baseline="central" fill="#5FE0FF" filter="url(#blur20)" opacity="${f(fl)}">${esc(str)}</text>`;
  g += `<text x="0" y="3" font-family="Baloo2" font-weight="800" font-size="${size}" text-anchor="middle" dominant-baseline="central" fill="none" stroke="#9FEFFF" stroke-width="6" opacity="${f(0.6 * fl)}">${esc(str)}</text>`;
  g += `<text x="0" y="3" font-family="Baloo2" font-weight="800" font-size="${size}" text-anchor="middle" dominant-baseline="central" fill="#F2FDFF">${esc(str)}</text>`;
  return glow(x, y, 260, 'g20cyan', 0.45 * k) + at(x, y, k, g);
}
// fuego frío (fuente de chispas)
function fountain20(x, y, t, k, seed) {
  if (k <= 0.01) return '';
  let s = glow(x, y - 140, 190, 'g20white', 0.7 * k) + glow(x, y - 60, 110, 'g20gold', 0.5 * k);
  const N = 70, Lf = 1.05;
  for (let i = 0; i < N; i++) {
    const a = ((t + i * Lf / N) % Lf), h1 = hash(i * 2.3 + seed), h2 = hash(i * 5.1 + seed);
    const vx = (h1 - 0.5) * 170, vy = -(520 + h2 * 280), g = 760;
    const px = x + vx * a, py = y + vy * a + 0.5 * g * a * a;
    const tx = vx, ty = vy + g * a, n = Math.hypot(tx, ty) || 1;
    const op = (1 - a / Lf) * k, len = 16;
    s += `<line x1="${f(px)}" y1="${f(py)}" x2="${f(px - tx / n * len)}" y2="${f(py - ty / n * len)}" stroke="${i % 3 ? '#FFF3C4' : '#FFFFFF'}" stroke-width="${f(3.2 * (1 - a / Lf) + 1)}" stroke-linecap="round" opacity="${f(op)}"/>`;
  }
  s += `<rect x="${x - 16}" y="${y - 12}" width="32" height="16" rx="3" fill="#3A3A48" stroke="${INK}" stroke-width="3"/>`;
  return s;
}
const BALC_C = [262, 330, 398];                   // ventanas del balcón central (local)
const BALC_L = [18, 70, 122, 174];                // ala izquierda
const BALC_R = [462, 512, 562, 612, 662];         // ala derecha
function lights20(T, t, k) {
  if (k <= 0.01) return '';
  let s = '';
  // soportales y huecos de la planta baja
  [[330, 372, 70], [262, 382, 50], [423, 382, 50], [678, 360, 80]].forEach(([lx, ly, r]) => { s += glow(LX(lx), LY(ly), r * BS * 0.9, 'g20warm', 0.7 * k); });
  [...BALC_L, ...BALC_R].forEach(lx => { s += glow(LX(lx), LY(360), 40 * BS * 0.6, 'g20warm', 0.45 * k); });
  // cortinas de luces
  BALC_C.forEach((lx, i) => { s += curtain20(LX(lx - 17), LX(lx + 17), LY(253), LY(292), 5, T, i * 3); });
  [...BALC_L, ...BALC_R].forEach((lx, i) => { s += curtain20(LX(lx - 15), LX(lx + 15), LY(218), LY(255), 4, T, 10 + i * 2); });
  // guirnaldas bajo las cornisas
  s += garland20(LX(-10), LX(221), LY(162), 4, 14, T, 1) + garland20(LX(440), LX(710), LY(162), 5, 14, T, 5) + garland20(LX(222), LX(440), LY(149), 3, 16, T, 9);
  // mariposas moradas en los balcones
  const bf = [[LX(331), LY(188), 1.25, -8], [LX(250), LY(232), 1.0, -14], [LX(412), LY(232), 1.0, 14],
    [LX(70), LY(248), 0.8, -10], [LX(170), LY(248), 0.8, 8], [LX(512), LY(248), 0.8, -8], [LX(612), LY(248), 0.8, 10]];
  bf.forEach(([x, y, sc, rot], i) => { s += at(x, y, 1, butterfly20(0, 0, sc * pop(t, 0.05 + 0.03 * i, 0.4), T, i), rot); });
  s += fountain20(LX(232), LY(309), t + 0.2, k * 0.6, 3) + fountain20(LX(430), LY(309), t + 0.6, k * 0.6, 4);
  s += clockLit20(T, k) + sign20(T, pop(t, 0.12, 0.45));
  return s;
}

/* ===================== EL MUNDO (plaza + casa + escenario) ===================== */
// L: { on, stage (0..1), bulbs, performers (svg), flashes (0..1), spot (0..1), t (tiempo desde el encendido) }
function world20(t, T, L = {}) {
  let s = plaza20(L.on);
  s += casa(L.on ? 'on' : 'off');
  if (!L.on && L.dim) { // resplandor tenue
    s += glow(LX(330), LY(372), 120, 'g20warm', 0.22 * L.dim) + glow(LX(678), LY(360), 120, 'g20warm', 0.16 * L.dim) + glow(LX(332), LY(92), 70, 'g20warm', 0.12 * L.dim);
  }
  if (L.flashes) {
    const cols = ['g20pink', 'g20cyan', 'g20purple', 'g20gold'];
    for (let i = 0; i < 5; i++) {
      const ph = T * 1.3 + i * 1.7, op = (0.5 + 0.5 * Math.sin(ph)) * 0.55 * L.flashes;
      s += `<circle cx="${f(200 + i * 170 + 40 * Math.sin(T * 0.7 + i))}" cy="${f(860 + 60 * Math.cos(T * 0.9 + i * 2))}" r="260" fill="url(#${cols[i % 4]})" opacity="${f(op)}" style="mix-blend-mode:screen"/>`;
    }
  }
  if (L.spot) {
    const id = 'sp' + (uid++), r = 140 * L.spot, cx = 540, cy = LY(270);
    s += `<clipPath id="${id}"><ellipse cx="${cx}" cy="${f(cy)}" rx="${f(r * 1.15)}" ry="${f(r)}"/></clipPath>`;
    s += `<g clip-path="url(#${id})">${casa('spot')}</g>`;
    s += `<ellipse cx="${cx}" cy="${f(cy)}" rx="${f(r * 1.15)}" ry="${f(r)}" fill="url(#g20white)" opacity="${f(0.35 * L.spot)}"/>`;
    s += glow(cx, cy, r * 2.2, 'g20white', 0.25 * L.spot);
  }
  if (L.singers) s += L.singers;
  if (L.spot && L.singers) { // la balaustrada vuelve a ir delante de los cantantes
    const id = 'bl' + (uid++);
    s += `<clipPath id="${id}"><rect x="${f(LX(218))}" y="${f(LY(292))}" width="${f(226 * BS)}" height="${f(23 * BS)}"/></clipPath><g clip-path="url(#${id})">${casa('spot')}</g>`;
  }
  if (L.on) s += lights20(T, L.t || 0, L.lk === undefined ? 1 : L.lk) + towerStar20(T, pop(L.t || 0, 0, 0.5));
  FAROLAS20.forEach(([x, b]) => { s += farola20(x, b, L.on); });
  if (!L.noStage) s += stage20(L.stage || 0);
  if (!L.noStage && !L.noBulbs) s += bulbs20(T, L.on);
  if (L.performers) s += L.performers;
  if (L.on) s += fountain20(ST.fx0 + 34, ST.front + 4, t, L.fk === undefined ? 1 : L.fk, 1) + fountain20(ST.fx1 - 34, ST.front + 4, t + 0.37, L.fk === undefined ? 1 : L.fk, 7);
  return s;
}
// coro: tres mujeres mayores detrás, tres niños delante con micrófono de pie
function choir20(t, T, c, lit = 1) {
  let s = '';
  const beat = T * 2 * PI / 1.1;
  [[400, 'bun', '#D9D9DE'], [540, 'cap', '#BDBDC6'], [680, 'bob', '#E6E6EA']].forEach(([x, hair, col], i) => {
    const k = pop(t, c.ladies + i * 0.12, 0.5);
    if (k <= 0.01) return;
    s += at(x, ST.back + 22, k, fig20(0, 0, 0.9, { kind: 'lady', hair, hairCol: col, mood: 'serene', tilt: 5 * Math.sin(beat + i * 0.4), arms: [[12, -62], [12, -62]] }, T));
  });
  [[420, 'spiky', '#5A3A2A'], [540, 'pigtails', '#C58B3B'], [660, 'cap', '#2E211C']].forEach(([x, hair, col], i) => {
    const k = pop(t, c.kids + i * 0.12, 0.5);
    if (k <= 0.01) return;
    const base = ST.front - 14;
    s += at(x, base, k, fig20(0, 0, 0.64, { kind: 'kid', hair, hairCol: col, mood: 'sing', tilt: 7 * Math.sin(beat + 1 + i * 0.5), arms: [[10, 4], [10, 4]] }, T));
    s += at(x + 26, base + 4, k, micStand20(0, 0, -112));
  });
  return s;
}

/* ===================== ESCENAS ===================== */

/* ---------- 0) HOOK: la casa del reloj de cerca, apagada; caja roja «AYER, TUDELA / SE ILUMINÓ ✨» ---------- */
S[0] = (t, T, sc) => {
  const c = cues(sc, { box: 0.15, l1: 0.3, l2: 0.55, spark: 0.8 });
  let s = sky20(T);
  const w = world20(t, T, { dim: 1, noStage: true });
  s += cam(lerp(1.62, 1.7, t / sc.duration), 540, 560, w, 0, 330);
  s += `<rect width="${W}" height="${H}" fill="${K20.sky0}" opacity="0.18"/>`;
  // caja roja
  const kb = pop(t, c.box, 0.5);
  let g = redSign17(970, 290, []);
  const l1 = TX('h1', 'AYER, TUDELA');
  let l2 = TX('h2', 'SE ILUMINÓ ✨');
  const spk = /✨\s*$/.test(l2);
  l2 = l2.replace(/\s*✨\s*$/, '');
  const s1 = fit(l1, 116, 860), s2 = fit(l2, 116, spk ? 720 : 860);
  g += at(0, -60, pop(t, c.l1, 0.45), text(l1, 0, 0, { size: s1, sw: SW * 2, sd: 6 }));
  const w2 = measure(l2, s2), off = spk ? -48 : 0;
  g += at(off, 62, pop(t, c.l2, 0.45), text(l2, 0, 0, { size: s2, sw: SW * 2, sd: 6 }));
  if (spk) {
    const sx = off + w2 / 2 + 62;
    g += sparkle(sx, 46, 34, pop(t, c.spark, 0.4) * (1 + 0.12 * Math.sin(t * 9)), K20.gold);
    g += sparkle(sx + 40, 96, 18, pop(t, c.spark + 0.1, 0.4) * (1 + 0.15 * Math.sin(t * 9 + 2)), '#FFFFFF');
    g += sparkle(sx + 34, 10, 14, pop(t, c.spark + 0.18, 0.4) * (1 + 0.15 * Math.sin(t * 11)), K20.gold);
  }
  s += at(540, 352, kb, g, lerp(-6, -2, clamp(kb)));
  return s;
};

/* ---------- 1) LA PLAZA A OSCURAS: plano medio, escenario apagado, público de espaldas; dolly-in lento ---------- */
S[1] = (t, T, sc) => {
  let s = sky20(T);
  const z = lerp(0.94, 1.1, easeInOut(t / sc.duration));
  s += cam(z, 540, 1000, world20(t, T, { dim: 0.6 }), 0, -10);
  s += crowd20(T, 'watch');
  return s;
};

/* ---------- 2) LOS BAILARINES: dos cascanueces y, en el centro, el de lentejuelas; coreografía sincronizada ---------- */
S[2] = (t, T, sc) => {
  const c = cues(sc, { in: 0.1, phones: 0.8 });
  const [shot] = shotOf(sc, t);
  let s = sky20(T);
  const L = { dim: 0.4, stage: 1, flashes: 1, performers: dancers20(t, T, pop(t, c.in, 0.45)) };
  const w = world20(t, T, L);
  if (shot === 'a') s += cam(lerp(1.3, 1.36, seg(t, 0, 4.5)), 540, 1090, w, 0, -70);
  else s += cam(lerp(1.62, 1.68, seg(t, 4.5, 9)), 540, 1100, w, 0, -110);
  // destellos suaves por delante
  [[180, 520, 'g20pink'], [900, 600, 'g20cyan'], [540, 380, 'g20purple']].forEach(([x, y, g], i) => {
    s += glow(x, y, 300, g, (0.5 + 0.5 * Math.sin(T * 2.2 + i * 2.1)) * 0.35);
  });
  [[150, 760], [930, 700], [260, 420], [820, 380]].forEach(([x, y], i) => { s += sparkle(x, y, 22, Math.max(0, Math.sin(T * 3 + i * 1.6)), i % 2 ? '#BFE3F2' : '#FFD6F0'); });
  s += crowd20(T, 'phones', easeOut(seg(t, c.phones, c.phones + 0.6)));
  return s;
};

/* ---------- 3) LOS CANTANTES EN EL BALCÓN: zoom rápido, foco circular, dos cantantes, notas; vuelve el plano amplio ---------- */
S[3] = (t, T, sc) => {
  const c = cues(sc, { zoom: 0, zoomDur: 0.4, spot: 0.8, singers: 1.2, notes: 1.7 });
  const [shot] = shotOf(sc, t);
  const spot = pop(t, c.spot, 0.35);
  const ks = pop(t, c.singers, 0.5);
  const sing = T * 2 * PI / 1.3;
  let singers = '';
  if (ks > 0.01) {
    const yb = LY(309);
    singers += at(505, yb, ks, fig20(0, 0, 0.5, { kind: 'singerA', hair: 'curly', mood: 'sing', mic: 'R', tilt: 4 * Math.sin(sing), arms: [[14, 8], [18, 172]] }, T));
    singers += at(578, yb, ks, fig20(0, 0, 0.5, { kind: 'singerB', hair: 'cap', mood: 'sing', mic: 'L', tilt: -4 * Math.sin(sing + 0.6), arms: [[18, 172], [14, 8]] }, T));
  }
  const w = world20(t, T, { dim: 0.25, spot, singers, stage: 0.25, noBulbs: shot === 'zoom' });
  let s = sky20(T);
  if (shot === 'zoom') {
    const u = easeOut(seg(t, c.zoom, c.zoom + c.zoomDur));
    const z = lerp(1.0, 2.75, u) * (1 + 0.02 * seg(t, 1, 6.6));
    const cy = lerp(1000, LY(278), u), dy = lerp(0, 820 - LY(278), u);
    s += cam(z, 540, cy, w, 0, dy);
    if (t >= c.notes) s += notes20(t - c.notes, 540, 640, 6, 420, 1.3);
    [[260, 560], [820, 600], [300, 1080], [800, 1060]].forEach(([x, y], i) => { s += sparkle(x, y, 18, spot * Math.max(0, Math.sin(T * 2.5 + i * 1.7)), '#FFF6D6'); });
  } else {
    s += cam(1.0, 540, 1000, w);
    s += notes20(t, 540, LY(250), 4, 200, 0.6);
    s += crowd20(T, 'watch');
  }
  return s;
};

/* ---------- 4) EL CORO: plano amplio, tres mujeres de negro detrás y tres niños con micrófono de pie delante ---------- */
S[4] = (t, T, sc) => {
  const c = cues(sc, { ladies: 0.2, kids: 0.5, notes: 1.0 });
  let s = sky20(T);
  const w = world20(t, T, { dim: 0.3, stage: 1, flashes: 0.35, performers: choir20(t, T, c) });
  const z = lerp(1.02, 1.12, easeInOut(t / sc.duration));
  s += cam(z, 540, 1060, w, 0, -40);
  if (t >= c.notes) s += notes20(t - c.notes, 540, 920, 7, 520, 0.95);
  s += crowd20(T, 'watch');
  return s;
};

/* ---------- 5) SE HIZO LA LUZ: un segundo a oscuras y, de golpe, todo encendido; destello blanco ---------- */
S[5] = (t, T, sc) => {
  const c = cues(sc, { on: 1.2 });
  const on = t >= c.on, u = t - c.on;
  let s = sky20(T);
  const cc = { ladies: -9, kids: -9 };
  const w = world20(t, T, { on, t: u, stage: on ? 1 : 0.12, dim: on ? 0 : 0.15, performers: choir20(5, T, cc) });
  const z = on ? lerp(1.0, 1.06, seg(u, 0, 5.8)) * bumpZ(t, c.on, 0.05) : 1.0;
  s += cam(z, 540, 880, w, 0, 0);
  if (!on) s += `<rect width="${W}" height="${H}" fill="#050817" opacity="0.35"/>`;
  else {
    [[130, 330, 30], [950, 300, 26], [90, 720, 20], [990, 760, 24], [200, 1060, 18], [880, 1040, 20]].forEach(([x, y, r], i) => {
      s += sparkle(x, y, r, pop(t, c.on + 0.1 + 0.05 * i, 0.4) * (0.7 + 0.3 * Math.sin(u * 6 + i * 1.7)), i % 2 ? K20.gold : '#FFFFFF');
    });
    if (u < 0.45) s += `<rect width="${W}" height="${H}" fill="#FFFFFF" opacity="${f(0.9 * (1 - u / 0.45))}"/>`;
  }
  s += crowd20(T, on ? 'cheer' : 'watch', on ? easeOut(seg(u, 0.3, 0.9)) : 0, on);
  return s;
};

/* ---------- 6) VISTA AMPLIA: plaza iluminada, farolas, soportales, guirnaldas, brazos en alto, nieve ---------- */
const SNOW20 = Array.from({ length: 70 }, (_, i) => ({ x: hash(i * 4.7) * W, y0: hash(i * 8.3) * H, v: 50 + hash(i * 2.1) * 60, r: 3 + hash(i * 6.6) * 5, p: hash(i) * 6 }));
function snow20(T, op = 0.85) {
  let s = '';
  SNOW20.forEach(fk => {
    const y = ((fk.y0 + fk.v * T) % (H + 40)) - 20, x = fk.x + 26 * Math.sin(T * 0.8 + fk.p);
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(fk.r)}" fill="#FFFFFF" opacity="${f(op * (0.5 + 0.5 * hash(fk.p * 9)))}"/>`;
  });
  return s;
}
S[6] = (t, T, sc) => {
  let s = sky20(T);
  const w = world20(t, T, { on: true, t: 3 + t, stage: 1, performers: choir20(5, T, { ladies: -9, kids: -9 }) });
  s += cam(lerp(0.93, 0.87, easeInOut(t / sc.duration)), 540, 980, w, 0, 0);
  s += snow20(T);
  s += crowd20(T, 'cheer', 1, true);
  return s;
};

/* ---------- 7) CIERRE: pantalla roja, logo blanco con rebote, «Feliz Navidad», «Escaparate de Tudela» ---------- */
S[7] = (t, T, sc) => {
  const c = cues(sc, { logo: 0.1, t1: 0.5, t2: 0.8 });
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 640, 16, t * 8, C.dred);
  s += snow20(T, 0.45);
  const pulse = 1 + 0.03 * Math.sin(t * 2 * PI * 1.1);
  const kl = pop(t, c.logo, 0.5);
  s += logoBadge(540, 630 + 6 * Math.sin(t * 3), 640, lerp(-10, 0, clamp(kl)), kl * pulse, 'logoW');
  const t1 = TX('cierre1', 'Feliz Navidad'), t2 = TX('cierre2', 'Escaparate de Tudela');
  s += at(540, 1085, pop(t, c.t1, 0.5) * pulse, text(t1, 0, 0, { size: fit(t1, 160, 980), sw: SW * 2.2, sd: 9 }), -2);
  s += at(540, 1245, pop(t, c.t2, 0.5), text(t2, 0, 0, { size: fit(t2, 84, 940), sw: SW * 1.6, sd: 6 }));
  [[150, 1010, 30], [930, 1000, 26], [190, 1290, 18], [900, 1300, 20]].forEach(([x, y, r], i) => { s += sparkle(x, y, r, pop(t, c.t1 + 0.1 * i, 0.4) * (0.75 + 0.25 * Math.sin(t * 8 + i)), i % 2 ? K20.gold : '#FFFFFF'); });
  return s;
};

/* ---------- API para el renderizador ---------- */
window.init = async function (cfg, fonts, logos) {
  CFG = cfg;
  const b64ToBuf = b => Uint8Array.from(atob(b), c => c.charCodeAt(0)).buffer;
  for (const [fam, wt, b64] of fonts) {
    const ff = new FontFace(fam, b64ToBuf(b64), { weight: String(wt) });
    await ff.load(); document.fonts.add(ff);
  }
  await document.fonts.ready;
  const defs = document.getElementById('defs');
  const ns = 'http://www.w3.org/2000/svg';
  for (const [id, url, iw, ih] of logos) {
    const img = new Image(); img.src = url; await img.decode();
    const el = document.createElementNS(ns, 'image');
    el.setAttribute('id', id); el.setAttribute('width', String(iw || 500)); el.setAttribute('height', String(ih || 500));
    el.setAttribute('href', url);
    defs.appendChild(el);
  }
  const rg = (id, col, a = 1) => `<radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity="${a}"/><stop offset="0.45" stop-color="${col}" stop-opacity="${a * 0.45}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>`;
  let extra = `<linearGradient id="sky20" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K20.sky0}"/><stop offset="0.62" stop-color="${K20.sky1}"/><stop offset="1" stop-color="${K20.sky1}"/></linearGradient>`;
  extra += rg('g20warm', '#FFC15A') + rg('g20gold', '#FFD23F') + rg('g20white', '#FFF6E0') + rg('g20purple', '#B45CFF') + rg('g20pink', '#FF5FA2') + rg('g20cyan', '#4FD8FF');
  extra += `<filter id="blur20" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>`;
  extra += casaVariant('off') + casaVariant('on') + casaVariant('spot');
  const tmp = document.createElementNS(ns, 'svg');
  tmp.innerHTML = extra;
  while (tmp.firstChild) defs.appendChild(tmp.firstChild);
  return true;
};
window.renderFrame = function (sceneId, t, T) {
  uid = 0;
  const sc = CFG.scenes.find(s => s.id === sceneId);
  document.getElementById('dyn').innerHTML = S[sceneId](t, T, sc);
};
