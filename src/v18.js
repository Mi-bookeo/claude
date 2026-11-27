/* Vídeo 18 — «Pedro y la ITV». Piezas nuevas sobre lib.js + series.js + v04…v17.js:
   PEDRO tal cual (v05: alto, gafas redondas negras, camiseta verde) con los brazos con codo del vídeo 07 y tres caras
   nuevas (preocupado con ceja torcida y gota de sudor, ojos grandes, aliviado); mostrador de la ITV (pared crema #FFF5F3
   con puntos de semitono, rótulo «ITV», papel), sello de goma con la mano del inspector y su marca (DESFAVORABLE /
   FAVORABLE), coche genérico visto de lado (ruedas gastadas o nuevas), carretera con paralaje, nube de pensamiento con
   cuatro ruedas y «?», tarjeta de oferta «2x1 EN RUEDAS · TALLER», confeti de estrellas, pantalla de llamada saliente
   con el icono de taller, globo de respuesta, interior de taller genérico (elevador, cartel «2x1», ruedas apiladas,
   panel de herramientas) y el MECÁNICO (personaje nuevo genérico: mono azul y gorra). Sin marcas ni nombres reales. */
'use strict';

const st18 = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
const K18 = {
  okGreen: '#2E9E4F', okGreenS: '#22783B', tyre: '#2B2626', tyreOld: '#6B6262', tyreOldS: '#554D4D', rim: '#C9CDD2', rimS: '#9AA0A6',
  car: '#3F7CC4', carS: '#2B5A99', road: '#8D949C', roadS: '#7C838B', wall: '#DCE0E4', wallS: '#C4CAD0', floor: '#A9AFB6',
  lift: '#F2C12E', liftS: '#C99A1E', mono: '#2F6DB5', monoS: '#22528A', cap: '#2D4A6B', capS: '#1F3550', mous: '#5A3A2A',
  screen: '#22394F', counter: '#B9BFC6', counterTop: '#E4E7EA', counterS: '#8D949C', sleeve: '#2D4A6B', wood: '#A9743F', woodS: '#7E5328'
};

/* ===================== PEDRO (v05) con codos (v07) y caras nuevas ===================== */
function pedro18Face(o, w) {
  const e = o.expr || 'normal';
  if (!['worried', 'wow', 'relief'].includes(e)) return pedro7Face(o, w);
  const L = (d, sw = 1.7, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const glasses = `<circle cx="196" cy="80" r="4" fill="none" stroke="${INK}" stroke-width="${w(1.8)}"/><circle cx="204" cy="80" r="4" fill="none" stroke="${INK}" stroke-width="${w(1.8)}"/><line x1="192" y1="80" x2="178" y2="79" stroke="${INK}" stroke-width="${w(1.8)}"/>`;
  const cheek = op => `<circle cx="193.4" cy="87.2" r="2.6" fill="${C.pink}" opacity="${op}"/>`;
  let s = `<circle cx="196" cy="80" r="4" fill="#FFFFFF" fill-opacity="${e === 'wow' ? 1 : 0.5}"/><circle cx="204" cy="80" r="4" fill="#FFFFFF" fill-opacity="${e === 'wow' ? 1 : 0.5}"/>`;
  if (e === 'worried') {
    s += o.blink ? L('M193.2 81 H198.8 M201.2 81 H206.8', 1.6)
      : `<circle cx="${f(196 + lx)}" cy="${f(81 + ly)}" r="1.5" fill="${INK}"/><circle cx="${f(204 + lx)}" cy="${f(81 + ly)}" r="1.5" fill="${INK}"/>`;
    // ceja torcida: la de atrás sube hacia el centro, la de delante baja
    s += glasses + L('M192.8 74.6 Q195.6 74.2 198.6 71.4', 1.7) + L('M201.4 72.2 Q204.4 72.8 207.2 74.8', 1.7);
    // boca ondulada
    s += L('M196.2 90 Q197.7 88.4 199.2 90 Q200.7 91.6 202.2 90 Q203.4 88.8 204.4 89.6', 1.8);
    // gota de sudor que resbala
    const dy = o.drop || 0;
    s += `<path d="M209.5 ${f(65 + dy)} Q214.6 ${f(72.6 + dy)} 209.5 ${f(75.4 + dy)} Q204.4 ${f(72.6 + dy)} 209.5 ${f(65 + dy)}Z" fill="${C.glass}" stroke="${INK}" stroke-width="${w(1.5)}" stroke-linejoin="round"/><circle cx="208.3" cy="${f(72.3 + dy)}" r="0.9" fill="#FFFFFF"/>`;
  } else if (e === 'wow') {
    // ojos grandes que llenan los cristales, con brillo
    s += `<circle cx="${f(196 + lx * 0.6)}" cy="${f(80 + ly * 0.6)}" r="2.9" fill="${INK}"/><circle cx="${f(204 + lx * 0.6)}" cy="${f(80 + ly * 0.6)}" r="2.9" fill="${INK}"/>`;
    s += `<circle cx="${f(197.1 + lx * 0.6)}" cy="${f(78.8 + ly * 0.6)}" r="1.1" fill="#FFFFFF"/><circle cx="${f(205.1 + lx * 0.6)}" cy="${f(78.8 + ly * 0.6)}" r="1.1" fill="#FFFFFF"/>`;
    s += `<circle cx="${f(195 + lx * 0.6)}" cy="${f(81.4 + ly * 0.6)}" r="0.55" fill="#FFFFFF"/><circle cx="${f(203 + lx * 0.6)}" cy="${f(81.4 + ly * 0.6)}" r="0.55" fill="#FFFFFF"/>`;
    s += glasses + L('M192.8 70.2 Q195.6 67.4 198.6 69.4 M201.4 69.4 Q204.4 67.4 207.2 70.2', 1.6) + cheek(0.65);
    s += `<path d="M195.2 86 Q200.3 97.4 205.4 85.8 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.7)}" stroke-linejoin="round"/><path d="M196.3 86.7 H204.3 L203.6 88.3 H197Z" fill="#FFFFFF"/>`;
  } else { // relief: ojos cerrados de alivio, sonrisa grande
    s += glasses + L('M193.6 81 Q196 78.2 198.4 81 M201.6 81 Q204 78.2 206.4 81', 1.7);
    s += L('M193 71.6 Q195.8 69.8 198.6 71.4 M201.4 71.4 Q204.2 69.8 207 71.6', 1.6) + cheek(0.7);
    s += `<path d="M195.4 86 Q200.4 96 205.2 85.8 Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.7)}" stroke-linejoin="round"/><path d="M196.5 86.6 H204.1 L203.4 88 H197.2Z" fill="#FFFFFF"/>`;
  }
  return s;
}
// Pedro en coordenadas locales (suelo y=214, mira a la derecha): cuerpo de pedro() del vídeo 05 (camiseta verde lisa)
// y brazos de dos segmentos (armJoints del vídeo 07). o: legF, legB, bob, head, lean, expr, smile, look, blink, drop,
// talk, armF/armB ({ang,bend} | {ik,side}), itemF/itemB(w,x,y), front(w) (encima de todo)
function pedro18(o) {
  const k = o.k || 1, w = v => f(v * k);
  const st = (v = 3) => `stroke="${INK}" stroke-width="${w(v)}"`, lj = 'stroke-linejoin="round"';
  const leg = (ang, shoe) => `<g transform="rotate(${f(ang)} 190 150)"><rect x="185" y="148" width="8" height="58" rx="4" fill="${P5.pants}" ${st()}/><path d="M182 206 h17 a5 5 0 0 1 0 8 h-17z" fill="${shoe}" ${st()} ${lj}/></g>`;
  let g = leg(o.legB || 0, '#E8E8E8') + leg(o.legF || 0, '#FFFFFF');
  const arm = (S, a, back, item) => {
    const { E, H } = armJoints(S, a || {});
    const sk = back ? P5.skinS : P5.skin;
    let s = limb(S, E, 7.4, sk, w) + limb(E, H, 7, sk, w);
    // manga corta verde
    s += limb(S, [lerp(S[0], E[0], 0.5), lerp(S[1], E[1], 0.5)], 11, back ? P5.greenS : P5.green, w);
    s += `<circle cx="${f(H[0])}" cy="${f(H[1])}" r="4.2" fill="${sk}" ${st(2.2)}/>`;
    if (item) s += item(w, H[0], H[1]);
    return s;
  };
  let b = arm([174, 108], o.armB, true, o.itemB);
  b += `<rect x="174" y="98" width="32" height="56" rx="10" fill="${P5.green}"/><rect x="174" y="98" width="9" height="56" rx="5" fill="${P5.greenS}"/><rect x="174" y="98" width="32" height="56" rx="10" fill="none" ${st()}/>`;
  b += `<path d="M184.5 98.6 Q190 103.4 195.5 98.6" stroke="${INK}" stroke-width="${w(1.6)}" fill="none" stroke-linecap="round"/>`;
  b += arm([206, 108], o.armF, false, o.itemF);
  let hd = `<circle cx="190" cy="78" r="14" fill="${P5.skin}" ${st()}/>`;
  hd += `<path d="M176 74 Q178 60 192 61 Q205 62 205 74 Q198 68 188 70 Q181 70 176 74Z" fill="${P5.hair}" ${st()} ${lj}/>`;
  hd += pedro18Face(o, w);
  b += `<g transform="rotate(${f(o.head || 0)} 190 94)">${hd}</g>`;
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  if (o.lean) g = `<g transform="rotate(${f(o.lean)} 190 214)">${g}</g>`;
  return g;
}
function placeP18(px, py, sc, o) {
  o.k = SW / (3 * sc);
  const sx = o.flip ? -sc : sc;
  return `<g transform="translate(${f(px - 190 * sx)} ${f(py - 214 * sc)}) scale(${f(sx)} ${f(sc)})">${pedro18(o)}</g>`;
}
// punto del mundo -> coordenadas locales del personaje (para apuntar las manos)
const toLocal18 = (px, py, sc, wx, wy, flip) => [190 + (wx - px) / sc * (flip ? -1 : 1), 214 + (wy - py) / sc];
// respiración y parpadeo
const breath18 = T => -0.9 * (0.5 - 0.5 * Math.cos(2 * PI * T / 1.7));
const blink18 = (T, off = 0) => ((T + off) % 3.1) < 0.11;
// gota de sudor: baja y vuelve a empezar
const drop18 = T => ((T * 0.7) % 1) * 7;

/* ===================== MOSTRADOR DE LA ITV ===================== */
const ITV = { back: 1000, front: 1190, paperX: 650, paperY: 1100, px: 320, sc: 5.2 };
function itvSign18(x, y, k = 1) {
  const str = TX('itv', 'ITV');
  let g = `<rect x="-160" y="-86" width="320" height="172" rx="26" transform="translate(12 12)" fill="${INK}"/>`;
  g += `<rect x="-160" y="-86" width="320" height="172" rx="26" fill="${C.red}" ${st18(1.1)}/>`;
  g += `<rect x="-142" y="-68" width="284" height="136" rx="16" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 0.5)}" opacity="0.6"/>`;
  g += text(str, 0, 6, { size: 120, sw: SW * 2, sd: 6 });
  // tornillos
  [[-138, -64], [138, -64], [-138, 64], [138, 64]].forEach(([a, b]) => { g += `<circle cx="${a}" cy="${b}" r="6" fill="#FFFFFF" opacity="0.8"/>`; });
  return at(x, y, k, g);
}
// cartel de la pared con una lista de comprobación genérica (sin textos)
function checkPoster18(x, y, rot = 3) {
  let g = `<rect x="-110" y="-150" width="220" height="300" rx="14" transform="translate(10 10)" fill="${INK}"/><rect x="-110" y="-150" width="220" height="300" rx="14" fill="#FFFFFF" ${st18(0.9)}/>`;
  g += `<rect x="-110" y="-150" width="220" height="62" rx="14" fill="${C.navy}"/><rect x="-110" y="-100" width="220" height="12" fill="${C.navy}"/><line x1="-110" y1="-88" x2="110" y2="-88" ${st18(0.7)}/>`;
  g += `<circle cx="-62" cy="-119" r="20" fill="#FFFFFF" ${st18(0.5)}/>` + wheelIcon18(-62, -119, 15);
  g += `<rect x="-26" y="-126" width="110" height="14" rx="7" fill="#FFFFFF" opacity="0.8"/>`;
  for (let i = 0; i < 4; i++) {
    const yy = -50 + i * 52;
    g += `<rect x="-84" y="${yy - 16}" width="32" height="32" rx="6" fill="#FFFFFF" ${st18(0.6)}/>`;
    g += `<path d="M-77 ${yy} L-70 ${yy + 8} L-57 ${yy - 9}" fill="none" stroke="${K18.okGreen}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    g += `<rect x="-36" y="${yy - 7}" width="${110 - i * 14}" height="14" rx="7" fill="${INK}" opacity="0.2"/>`;
  }
  return at(x, y, 1, g, rot);
}
// pared y elementos de detrás (todo por encima del mostrador)
function itvBack18(T) {
  let s = dotWide();
  // zócalo
  s += `<rect x="-400" y="${ITV.back - 120}" width="${W + 800}" height="140" fill="#F7DCD6"/><line x1="-400" y1="${ITV.back - 120}" x2="${W + 400}" y2="${ITV.back - 120}" ${st18(0.6)}/>`;
  s += itvSign18(860, 690, 1);
  s += checkPoster18(105, 760, -4);
  return s;
}
// papel sobre el mostrador; mark = null | { col, str, k }
function paper18(mark) {
  const { paperX: x, paperY: y } = ITV;
  let g = `<path d="M-160 -70 L170 -76 L196 72 L-182 78Z" transform="translate(9 9)" fill="${INK}" opacity="0.9"/>`;
  g += `<path d="M-160 -70 L170 -76 L196 72 L-182 78Z" fill="#FFFFFF" ${st18(0.8)}/>`;
  g += `<rect x="-130" y="-56" width="120" height="14" rx="7" fill="${C.navy}" opacity="0.8"/>`;
  for (let i = 0; i < 4; i++) g += `<rect x="${-138 - i * 4}" y="${-28 + i * 24}" width="${250 - (i % 2) * 70}" height="9" rx="4.5" fill="${INK}" opacity="0.18"/>`;
  g += `<circle cx="140" cy="-48" r="14" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.45)}" opacity="0.35"/>`;
  if (mark && mark.k > 0.01) g += stampMark18(mark.col, mark.str, mark.k);
  return at(x, y, 1, g, -3);
}
// marca del sello sobre el papel (local del papel)
function stampMark18(col, str, k = 1) {
  const wd = str.length > 10 ? 300 : 260, ht = 86;
  let g = `<rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="12" fill="none" stroke="${col}" stroke-width="9"/>`;
  g += `<rect x="${-wd / 2 + 10}" y="${-ht / 2 + 10}" width="${wd - 20}" height="${ht - 20}" rx="6" fill="none" stroke="${col}" stroke-width="3"/>`;
  g += text(str, 0, 3, { size: fit(str, 46, wd - 44), fill: col, stroke: null, shadow: false });
  return `<g opacity="0.92">` + at(6, 18, k, `<g transform="scale(1 0.88)">${g}</g>`, -9) + `</g>`;
}
function counter18() {
  const { back, front } = ITV;
  let s = `<path d="M-400 ${back} H${W + 400} V${front} H-400Z" fill="${K18.counterTop}" ${st18()}/>`;
  // vetas / brillo del tablero
  s += `<path d="M-400 ${back + 26} H${W + 400}" stroke="#FFFFFF" stroke-width="${f(SW * 1.2)}" opacity="0.7"/>`;
  s += `<rect x="-400" y="${front}" width="${W + 800}" height="34" fill="${K18.counter}" ${st18()}/>`;
  s += `<rect x="-400" y="${front + 34}" width="${W + 800}" height="${H + 400}" fill="${K18.counterS}" ${st18()}/>`;
  s += `<rect x="-400" y="${front + 34}" width="${W + 800}" height="26" fill="${INK}" opacity="0.25"/>`;
  for (let x = 40; x < W; x += 260) s += `<rect x="${x}" y="${front + 90}" width="200" height="420" rx="16" fill="${K18.counter}" opacity="0.55" ${st18(0.6)}/>`;
  return s;
}
// sello de goma con la mano del inspector; (x,y) = centro de la base de goma; sq = aplastado al golpear
function stamp18(x, y, sq = 0, rot = 0) {
  let g = '';
  // brazo (manga azul marino) que viene de arriba a la derecha
  g += `<path d="M30 -250 L700 -1500 L1100 -1300 L180 -170Z" fill="${K18.sleeve}" ${st18(1.1)}/>`;
  g += `<path d="M70 -250 L160 -200" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" opacity="0.35"/>`;
  g += `<path d="M30 -250 Q100 -300 180 -170" fill="none" ${st18(0.9)}/>`;
  const h = 1 - 0.12 * sq;
  let body = '';
  body += `<rect x="-120" y="-30" width="240" height="30" rx="6" fill="${C.dred}" ${st18(1)}/>`;          // goma
  body += `<rect x="-106" y="-92" width="212" height="64" rx="12" fill="${K18.wood}" ${st18(1)}/>`;      // bloque
  body += `<rect x="-106" y="-92" width="44" height="64" rx="10" fill="${K18.woodS}"/>`;
  body += `<rect x="-106" y="-92" width="212" height="64" rx="12" fill="none" ${st18(1)}/>`;
  body += `<rect x="-30" y="-170" width="60" height="82" rx="10" fill="${K18.wood}" ${st18(1)}/>`;      // mango
  body += `<ellipse cx="0" cy="-205" rx="70" ry="50" fill="${C.red}" ${st18(1)}/>`;                      // pomo
  body += `<path d="M-40 -222 Q-18 -246 14 -244" stroke="#FFFFFF" stroke-width="${f(SW * 1.1)}" fill="none" stroke-linecap="round" opacity="0.8"/>`;
  g += `<g transform="scale(1 ${f(h)})">${body}</g>`;
  // puño sobre el pomo
  const fy = -205 * h - 20;
  g += `<ellipse cx="38" cy="${f(fy - 30)}" rx="96" ry="74" fill="${C.skin}" ${st18(1.1)}/>`;
  [-44, -6, 32].forEach(dx => { g += `<path d="M${dx} ${f(fy + 10)} Q${dx + 18} ${f(fy + 34)} ${dx + 36} ${f(fy + 12)}" fill="${C.skin}" ${st18(0.8)}/>`; });
  g += `<path d="M92 ${f(fy - 66)} Q120 ${f(fy - 30)} 104 ${f(fy + 6)}" fill="none" ${st18(0.7)}/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">${g}</g>`;
}
// posición del sello: entra por arriba a la derecha, coge impulso, golpea en «hit», se queda y se va
function stampPose18(t, hit) {
  const inA = hit - 1.0, wind = hit - 0.16;
  if (t < inA) return null;
  let dy, dx;
  if (t < hit - 0.55) { const u = easeOut(seg18(t, inA, hit - 0.55)); dy = lerp(-1500, -380, u); dx = lerp(420, 0, u); }
  else if (t < wind) { const u = easeInOut(seg18(t, hit - 0.55, wind)); dy = lerp(-380, -520, u); dx = 0; }
  else if (t < hit) { const u = seg18(t, wind, hit); dy = lerp(-520, 0, u * u); dx = 0; }
  else if (t < hit + 0.4) { dy = 0; dx = 0; }
  else { const u = easeInOut(seg18(t, hit + 0.4, hit + 0.9)); dy = lerp(0, -1500, u); dx = lerp(0, 380, u); }
  const sq = t >= hit && t < hit + 0.4 ? Math.max(0, damp(t - hit, 30, 9)) : 0;
  return { x: ITV.paperX + 10 + dx, y: ITV.paperY + 12 + dy, sq, rot: -9 + dx * 0.02 };
}
const seg18 = (t, a, b) => clamp((t - a) / (b - a));
// rótulo grande tipo sello (pantalla): texto de color con contorno, marco doble y fondo blanco
function bigStamp18(str, col, x, y, k, rot = -5, size = 150) {
  if (k <= 0.01) return '';
  const sz = fit(str, size, 880), wd = measure(str, sz) + 110, ht = sz * 1.38;
  let g = `<rect x="${f(-wd / 2)}" y="${f(-ht / 2)}" width="${f(wd)}" height="${f(ht)}" rx="22" transform="translate(14 14)" fill="${INK}"/>`;
  g += `<rect x="${f(-wd / 2)}" y="${f(-ht / 2)}" width="${f(wd)}" height="${f(ht)}" rx="22" fill="#FFFFFF" ${st18(1.1)}/>`;
  g += `<rect x="${f(-wd / 2 + 16)}" y="${f(-ht / 2 + 16)}" width="${f(wd - 32)}" height="${f(ht - 32)}" rx="12" fill="none" stroke="${col}" stroke-width="${f(SW * 1.3)}"/>`;
  g += text(str, 0, sz * 0.05, { size: sz, fill: col, sw: SW * 2, sd: 6 });
  return at(x, y, k, g, rot);
}
// mostrador completo (pared + Pedro + mostrador + papel + sello); po = opciones de Pedro; mark = marca del papel
function itvWorld18(T, po, mark, stampP) {
  let s = itvBack18(T);
  const { px, sc } = ITV, py = ITV.back + (214 - 150) * sc;
  s += placeP18(px, py, sc, po);
  s += counter18();
  s += paper18(mark);
  if (stampP) s += stamp18(stampP.x, stampP.y, stampP.sq, stampP.rot);
  return s;
}
const itvPedroPy = () => ITV.back + (214 - 150) * ITV.sc;

/* ===================== RUEDAS ===================== */
// rueda vista de lado (centro x,y; r = radio del neumático); worn = gastada (gris, sin dibujo, grietas); rot en grados
function wheel18(x, y, r, rot = 0, worn = false) {
  const tc = worn ? K18.tyreOld : K18.tyre;
  let g = `<circle cx="${f(r * 0.06)}" cy="${f(r * 0.06)}" r="${f(r)}" fill="${INK}"/><circle r="${f(r)}" fill="${tc}" ${st18(1)}/>`;
  // dibujo de la banda (solo en la nueva) o grietas (gastada)
  if (!worn) for (let i = 0; i < 16; i++) {
    const a = (i * 22.5) * PI / 180;
    g += `<path d="M${f(Math.cos(a) * r * 0.86)} ${f(Math.sin(a) * r * 0.86)} L${f(Math.cos(a) * r * 0.98)} ${f(Math.sin(a) * r * 0.98)}" stroke="#4A4444" stroke-width="${f(r * 0.07)}" stroke-linecap="round"/>`;
  } else {
    g += `<path d="M${f(-r * 0.2)} ${f(-r * 0.93)} l${f(r * 0.06)} ${f(r * 0.12)} l${f(-r * 0.05)} ${f(r * 0.06)} M${f(r * 0.72)} ${f(r * 0.5)} l${f(-r * 0.1)} ${f(r * 0.06)} l${f(-r * 0.02)} ${f(r * 0.1)} M${f(-r * 0.84)} ${f(r * 0.3)} l${f(r * 0.12)} ${f(-r * 0.02)}" stroke="${INK}" stroke-width="${f(SW * 0.45)}" fill="none" stroke-linecap="round"/>`;
  }
  const rr = r * 0.56;
  g += `<circle r="${f(rr)}" fill="${worn ? K18.rimS : K18.rim}" ${st18(0.8)}/>`;
  let sp = '';
  for (let i = 0; i < 5; i++) {
    const a = (rot + i * 72) * PI / 180, a1 = a - 0.25, a2 = a + 0.25;
    sp += `<path d="M${f(Math.cos(a1) * rr * 0.32)} ${f(Math.sin(a1) * rr * 0.32)} L${f(Math.cos(a1 + 0.08) * rr * 0.86)} ${f(Math.sin(a1 + 0.08) * rr * 0.86)} L${f(Math.cos(a2 - 0.08) * rr * 0.86)} ${f(Math.sin(a2 - 0.08) * rr * 0.86)} L${f(Math.cos(a2) * rr * 0.32)} ${f(Math.sin(a2) * rr * 0.32)}Z"/>`;
  }
  g += `<g fill="${worn ? '#7D838A' : K18.rimS}" stroke="${INK}" stroke-width="${f(SW * 0.45)}" stroke-linejoin="round">${sp}</g>`;
  g += `<circle r="${f(rr * 0.3)}" fill="${worn ? K18.rimS : '#FFFFFF'}" ${st18(0.6)}/>`;
  if (!worn) g += `<path d="M${f(-r * 0.62)} ${f(-r * 0.5)} A${f(r * 0.8)} ${f(r * 0.8)} 0 0 1 ${f(-r * 0.2)} ${f(-r * 0.78)}" stroke="#FFFFFF" stroke-width="${f(r * 0.06)}" fill="none" stroke-linecap="round" opacity="0.6"/>`;
  return `<g transform="translate(${f(x)} ${f(y)})">${g}</g>`;
}
// icono plano de rueda (para carteles, avatar y pensamiento)
function wheelIcon18(x, y, r) {
  return `<g transform="translate(${f(x)} ${f(y)})"><circle r="${f(r)}" fill="${K18.tyre}"/><circle r="${f(r * 0.55)}" fill="${K18.rim}"/><circle r="${f(r * 0.2)}" fill="${K18.tyre}"/></g>`;
}
// neumático tumbado (para la pila), visto de frente un poco desde arriba; (x, base) = centro inferior
function stackTyre18(x, base, wd, ht) {
  const ry = ht * 0.32;
  let g = `<path d="M${f(x - wd / 2)} ${f(base - ht + ry)} V${f(base - ry)} A${f(wd / 2)} ${f(ry)} 0 0 0 ${f(x + wd / 2)} ${f(base - ry)} V${f(base - ht + ry)}Z" fill="${K18.tyre}" ${st18(1)}/>`;
  for (let i = 1; i < 7; i++) { const xx = x - wd / 2 + i * wd / 7; g += `<path d="M${f(xx)} ${f(base - ht + ry + 6)} V${f(base - ry * 0.4 - 6)}" stroke="#4A4444" stroke-width="${f(wd * 0.03)}" stroke-linecap="round"/>`; }
  g += `<ellipse cx="${f(x)}" cy="${f(base - ht + ry)}" rx="${f(wd / 2)}" ry="${f(ry)}" fill="#3A3434" ${st18(1)}/>`;
  g += `<ellipse cx="${f(x)}" cy="${f(base - ht + ry)}" rx="${f(wd * 0.27)}" ry="${f(ry * 0.52)}" fill="${INK}"/>`;
  g += `<path d="M${f(x - wd * 0.4)} ${f(base - ht + ry - ry * 0.3)} Q${f(x - wd * 0.1)} ${f(base - ht + 4)} ${f(x + wd * 0.2)} ${f(base - ht + ry * 0.18)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.6)}" fill="none" opacity="0.45" stroke-linecap="round"/>`;
  return g;
}

/* ===================== COCHE GENÉRICO (de lado, mira a la derecha) ===================== */
const CAR18 = { rear: [-220, -90], front: [230, -90], r: 88 };
// (cx, gy) = centro y suelo; k = escala; o: rot (grados de las ruedas), bob, worn, driver(fn -> svg en coords del coche),
// noFront (sin rueda delantera: se ve el buje), body (color)
function car18(cx, gy, k, o = {}) {
  const col = o.body || K18.car, colS = o.bodyS || K18.carS;
  const bob = o.bob || 0;
  const id = 'cw' + (uid++);
  let g = `<ellipse cx="0" cy="4" rx="430" ry="22" fill="${INK}" opacity="0.2"/>`;
  // ruedas (detrás de la carrocería)
  const wheels = () => {
    let s = wheel18(CAR18.rear[0], CAR18.rear[1], CAR18.r, o.rot || 0, o.worn);
    if (o.noFront) {
      s += `<g transform="translate(${CAR18.front[0]} ${CAR18.front[1]})"><circle r="58" fill="#7D838A" ${st18(0.9)}/><circle r="40" fill="${K18.rim}" ${st18(0.6)}/>`;
      for (let i = 0; i < 5; i++) { const a = (i * 72 - 90) * PI / 180; s += `<circle cx="${f(Math.cos(a) * 22)}" cy="${f(Math.sin(a) * 22)}" r="6" fill="${INK}"/>`; }
      s += `<circle r="10" fill="#FFFFFF" ${st18(0.5)}/></g>`;
    } else s += wheel18(CAR18.front[0], CAR18.front[1], CAR18.r, o.rot || 0, o.worn);
    if (o.frontSvg) s += o.frontSvg;
    return s;
  };
  g += wheels();
  let b = '';
  const body = 'M-385 -105 L-385 -235 Q-385 -262 -355 -265 L-290 -268 L-215 -425 Q-205 -440 -185 -440 L115 -440 Q140 -440 155 -425 L265 -280 L370 -262 Q405 -254 405 -215 L405 -105 L345 -105 A115 115 0 0 0 115 -105 L-105 -105 A115 115 0 0 0 -335 -105 Z';
  b += `<path d="${body}" transform="translate(12 12)" fill="${INK}"/>`;
  b += `<path d="${body}" fill="${col}"/>`;
  // sombra dura inferior y faldón
  b += `<clipPath id="${id}"><path d="${body}"/></clipPath><g clip-path="url(#${id})"><rect x="-400" y="-160" width="820" height="60" fill="${colS}"/><rect x="-400" y="-450" width="40" height="400" fill="${colS}"/></g>`;
  // ventanas
  const winR = 'M-262 -282 L-200 -412 L-62 -412 L-62 -282Z', winF = 'M-40 -282 L-40 -412 L108 -412 Q122 -412 130 -402 L222 -282Z';
  b += `<path d="${winR}" fill="${C.glass}" ${st18(0.9)}/>`;
  b += `<path d="${winF}" fill="${C.glass}"/>`;
  if (o.driver) { const cid = 'cd' + (uid++); b += `<clipPath id="${cid}"><path d="${winF}"/></clipPath><g clip-path="url(#${cid})">${o.driver()}</g>`; }
  b += `<path d="${winF}" fill="none" ${st18(0.9)}/>`;
  b += `<path d="M-180 -400 L-230 -300 M-20 -400 L-20 -300" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" opacity="${o.driver ? 0.35 : 0.6}"/>`;
  b += `<path d="${body}" fill="none" ${st18(1.1)}/>`;
  // puertas, tiradores, luces, parachoques
  b += `<path d="M-50 -282 V-110 M210 -268 Q236 -190 220 -112 M-262 -282 Q-272 -200 -262 -120" fill="none" ${st18(0.7)}/>`;
  b += `<rect x="-20" y="-238" width="46" height="13" rx="6.5" fill="${colS}" ${st18(0.5)}/><rect x="-240" y="-238" width="46" height="13" rx="6.5" fill="${colS}" ${st18(0.5)}/>`;
  b += `<path d="M372 -250 Q402 -244 402 -216 L374 -212 Q362 -230 372 -250Z" fill="${C.yel}" ${st18(0.7)}/>`;
  b += `<rect x="-388" y="-240" width="22" height="46" rx="6" fill="${C.red}" ${st18(0.7)}/>`;
  b += `<rect x="350" y="-140" width="68" height="34" rx="12" fill="${K18.rim}" ${st18(0.8)}/><rect x="-398" y="-140" width="60" height="34" rx="12" fill="${K18.rim}" ${st18(0.8)}/>`;
  // retrovisor
  b += `<path d="M150 -300 L190 -300 Q200 -300 198 -288 L192 -268 H156Z" fill="${col}" ${st18(0.7)}/>`;
  // brillo del capó/techo
  b += `<path d="M-170 -428 H90" stroke="#FFFFFF" stroke-width="${f(SW * 0.9)}" stroke-linecap="round" opacity="0.55"/>`;
  g += `<g transform="translate(0 ${f(bob)})">${b}</g>`;
  return `<g transform="translate(${f(cx)} ${f(gy)}) scale(${f(k)})">${g}</g>`;
}

/* ===================== CARRETERA CON PARALAJE ===================== */
function roadScene18(T, speed = 1) {
  let s = sky17(T, { band: 1000, clouds: [{ x: -80, y: 300, s: 0.95, v: -4 }, { x: 60, y: 620, s: 0.62, v: -6 }, { x: -120, y: 860, s: 0.5, v: -5 }] });
  s += sun(860, 300, 92, T * 14, 1);
  const off = (v, span) => (((-T * v * speed) % span) + span) % span;
  // colinas lejanas (lentas)
  const hs = off(40, 1400);
  for (let i = -1; i < 3; i++) {
    const x = hs + i * 1400 - 300;
    s += `<path d="M${x} 1190 Q${x + 260} 1010 ${x + 520} 1190 Q${x + 760} 1060 ${x + 1000} 1190 Q${x + 1200} 1100 ${x + 1400} 1190Z" fill="#B7DCC2" ${st18(0.8)}/>`;
  }
  // árboles y farolas (velocidad media)
  const ts = off(260, 1300);
  for (let i = -1; i < 3; i++) {
    const x = ts + i * 1300 - 200;
    [[0, 1], [420, 0.82], [820, 1.1]].forEach(([dx, k]) => {
      const tx = x + dx;
      s += `<rect x="${tx - 14 * k}" y="${1250 - 150 * k}" width="${28 * k}" height="${150 * k}" fill="${K18.wood}" ${st18(0.8)}/>`;
      s += `<circle cx="${tx + 10 * k}" cy="${1250 - 200 * k}" r="${90 * k}" fill="${INK}"/><circle cx="${tx}" cy="${1250 - 210 * k}" r="${90 * k}" fill="${C.green}" ${st18(0.9)}/>`;
      s += `<circle cx="${tx - 34 * k}" cy="${1250 - 246 * k}" r="${22 * k}" fill="#FFFFFF" opacity="0.35"/>`;
    });
    const lx = x + 620;
    s += `<rect x="${lx - 9}" y="900" width="18" height="350" fill="${C.navy}" ${st18(0.7)}/><path d="M${lx} 905 Q${lx} 870 ${lx + 60} 870 H${lx + 90}" fill="none" stroke="${INK}" stroke-width="${f(SW * 2.6)}" stroke-linecap="round"/><path d="M${lx} 905 Q${lx} 870 ${lx + 60} 870 H${lx + 90}" fill="none" stroke="${C.navy}" stroke-width="${f(SW * 1.2)}" stroke-linecap="round"/><rect x="${lx + 70}" y="866" width="50" height="22" rx="8" fill="${C.yel}" ${st18(0.7)}/>`;
  }
  // acera
  s += `<rect x="-400" y="1250" width="${W + 800}" height="70" fill="${C.ground}" ${st18(0.9)}/>`;
  const cs = off(700, 160);
  for (let x = cs - 160; x < W + 160; x += 160) s += `<line x1="${x}" y1="1250" x2="${x - 30}" y2="1320" ${st18(0.5)}/>`;
  // calzada con líneas rápidas
  s += `<rect x="-400" y="1320" width="${W + 800}" height="700" fill="${K18.road}" ${st18(0.9)}/>`;
  s += `<rect x="-400" y="1320" width="${W + 800}" height="24" fill="${K18.roadS}"/>`;
  const ds = off(700, 300);
  for (let x = ds - 300; x < W + 300; x += 300) s += `<rect x="${x}" y="1560" width="160" height="22" rx="11" fill="#FFFFFF" ${st18(0.5)}/>`;
  return s;
}

// seto en primer término (tapa las piernas en los planos medios); top = altura de la copa
function hedge18(top, T = 0) {
  let a = '';
  for (let i = -1; i < 13; i++) { const x = i * 100 + 20, r = 70 + 14 * hash(i * 2.3); a += `<circle cx="${x}" cy="${f(top + r * 0.9)}" r="${f(r)}"/>`; }
  a += `<rect x="-200" y="${top + 60}" width="${W + 400}" height="${H}"/>`;
  let s = `<g fill="${INK}" stroke="${INK}" stroke-width="${f(SW * 2)}">${a}</g><g fill="${C.green}">${a}</g>`;
  for (let i = 0; i < 12; i++) { const x = i * 100 + 50 + 20 * hash(i), y = top + 120 + 60 * hash(i * 4.1); s += `<path d="M${f(x - 18)} ${f(y)} q18 -26 36 0" stroke="#1F7A44" stroke-width="${f(SW * 0.9)}" fill="none" stroke-linecap="round"/>`; }
  for (let i = 0; i < 6; i++) { const x = 90 + i * 180, y = top + 70 + 40 * hash(i * 7.7); s += `<circle cx="${x}" cy="${f(y)}" r="12" fill="${C.pink}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/><circle cx="${x}" cy="${f(y)}" r="4" fill="${C.yel}"/>`; }
  return s;
}

/* ===================== NUBE DE PENSAMIENTO: CUATRO RUEDAS Y «?» ===================== */
function thoughtWheels18(cx, cy, k, t, head) {
  if (k <= 0.01) return '';
  let s = '';
  // bolitas desde la cabeza
  const pts = [[head[0] + 40, head[1] - 110, 20], [head[0] + 10, head[1] - 200, 28], [head[0] - 20, head[1] - 300, 36]];
  pts.forEach(([x, y, r], i) => { s += thinkDot(x, y, r, pop(t, 0.06 * i, 0.4) * clamp(k * 1.5)); });
  s += thinkCloud(cx, cy, 800, 470, k);
  let g = '';
  const WP = [[-275, -70], [-175, 80], [175, 80], [275, -70]];
  WP.forEach(([x, y], i) => { g += at(x, y + 6 * Math.sin(t * 3 + i), 1, wheel18(0, 0, 62, t * 40 * (i % 2 ? 1 : -1), true)); });
  const qp = 1 + 0.12 * Math.max(0, Math.sin(t * 2 * PI * 1.4));
  g += at(0, -10, qp, text('?', 0, 0, { size: 300, font: 'G', fill: C.red, sw: SW * 2.4, sd: 10 }), 6 * Math.sin(t * 2.2));
  s += at(cx, cy, k, g);
  return s;
}

/* ===================== TARJETA DE OFERTA «2x1 EN RUEDAS · TALLER» ===================== */
// centrada en (0,0): 290 x 210 (mismo estilo que card15Local)
function tyreOffer18(t = 0) {
  const x0 = -145, y0 = -105, wd = 290, ht = 210, sh = 40;
  let g = `<rect x="${x0 + 8}" y="${y0 + 8}" width="${wd}" height="${ht}" rx="22" fill="${INK}"/>`;
  g += `<rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="22" fill="#FFFFFF"/>`;
  g += `<path d="M${x0} ${y0 + sh} V${y0 + 22} Q${x0} ${y0} ${x0 + 22} ${y0} H${x0 + wd - 22} Q${x0 + wd} ${y0} ${x0 + wd} ${y0 + 22} V${y0 + sh}Z" fill="${C.red}"/>`;
  g += `<line x1="${x0}" y1="${y0 + sh}" x2="${x0 + wd}" y2="${y0 + sh}" ${st15(0.7)}/>`;
  g += `<circle cx="${x0 + 26}" cy="${y0 + 20}" r="15" fill="#FFFFFF" ${st15(0.5)}/>` + logoI13(x0 + 26, y0 + 20, 30);
  g += text(TX('oferta', 'Oferta'), x0 + 52, y0 + 21, { size: 26, font: 'G', anchor: 'start', sw: SW * 0.7, sd: 2, ls: 1 });
  for (let i = 0; i < 3; i++) g += `<circle cx="${x0 + wd - 26 - i * 18}" cy="${y0 + 20}" r="4.5" fill="#FFFFFF" opacity="0.85"/>`;
  // imagen: dos ruedas sobre fondo amarillo claro
  const ix = x0 + 12, iy = y0 + sh + 10, iw = 112, ih = 108, cid = 'to' + (uid++);
  g += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="14" fill="#FFF1C9" ${st15(0.6)}/>`;
  g += `<clipPath id="${cid}"><rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="14"/></clipPath><g clip-path="url(#${cid})">`;
  g += `<g transform="translate(${ix + 38} ${iy + 62}) scale(0.38)">${wheel18(0, 0, 80, t * 30)}</g><g transform="translate(${ix + 76} ${iy + 50}) scale(0.38)">${wheel18(0, 0, 80, -t * 30)}</g></g>`;
  // «2x1» enorme
  g += text(TX('t2x1', '2x1'), x0 + 206, y0 + sh + 62, { size: 92, font: 'G', fill: C.red, sw: SW * 1.5, sd: 4, ls: 2 });
  // título y comercio
  const tl = TX('ofertaTitulo', 'EN RUEDAS · TALLER');
  g += text(tl, 0, y0 + ht - 30, { size: fit(tl, 34, wd - 30), fill: INK, stroke: null, shadow: false });
  g += `<rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="22" fill="none" ${st15()}/>`;
  return g;
}
// confeti de estrellas (determinista); u = tiempo desde el «bingo»
function starConfetti18(u, cx, cy, n = 26) {
  if (u < 0 || u > 3.2) return '';
  const cols = [C.yel, C.red, '#FFFFFF', K18.okGreen, C.pink];
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = hash(i * 3.7) * 2 * PI, v = 650 + hash(i * 5.1) * 650;
    const x = cx + Math.cos(a) * v * Math.min(u, 0.9) * (1 - 0.3 * Math.min(u, 0.9));
    const y = cy + Math.sin(a) * v * Math.min(u, 0.9) * 0.8 + 260 * u * u;
    if (y > 1400) continue;
    const r = 20 + hash(i * 9.3) * 22, op = 1 - seg18(u, 2.2, 3.2);
    s += `<g opacity="${f(op)}">` + at(x, y, 1, `<path d="${starPath(r, r * 0.45, 5)}" fill="${cols[i % cols.length]}" ${st18(0.6)}/>`, u * 260 * (i % 2 ? 1 : -1) + i * 30) + `</g>`;
  }
  return s;
}

/* ===================== LLAMADA SALIENTE ===================== */
function wrenchPath18(r) {
  return `M${f(-r * 0.16)} ${f(r * 0.9)} L${f(-r * 0.16)} ${f(-r * 0.35)} Q${f(-r * 0.5)} ${f(-r * 0.5)} ${f(-r * 0.5)} ${f(-r * 0.78)} L${f(-r * 0.3)} ${f(-r * 0.98)} L${f(-r * 0.12)} ${f(-r * 0.7)} H${f(r * 0.12)} L${f(r * 0.3)} ${f(-r * 0.98)} L${f(r * 0.5)} ${f(-r * 0.78)} Q${f(r * 0.5)} ${f(-r * 0.5)} ${f(r * 0.16)} ${f(-r * 0.35)} L${f(r * 0.16)} ${f(r * 0.9)} Q0 ${f(r * 1.02)} ${f(-r * 0.16)} ${f(r * 0.9)}Z`;
}
// icono de taller: rueda con llave inglesa cruzada
function tallerIcon18(x, y, r) {
  let g = wheel18(0, 0, r * 0.78, 0);
  g += `<g transform="rotate(-38)"><path d="${wrenchPath18(r * 1.05)}" transform="translate(5 5)" fill="${INK}"/><path d="${wrenchPath18(r * 1.05)}" fill="${C.yel}" ${st18(0.8)}/></g>`;
  return `<g transform="translate(${f(x)} ${f(y)})">${g}</g>`;
}
// pantalla de llamada (X,Y,PW,PH); u = tiempo; ans = momento en que contesta
function callPhone18(X, Y, PW, PH, u, ans) {
  const R = 64, b = 20, sx = X + b, sy = Y + b, sw_ = PW - 2 * b, sh = PH - 2 * b, id = 'cp' + (uid++);
  let g = `<rect x="${X + 18}" y="${Y + 18}" width="${PW}" height="${PH}" rx="${R}" fill="${INK}"/>`;
  g += `<rect x="${X}" y="${Y}" width="${PW}" height="${PH}" rx="${R}" fill="${INK}" ${st18()}/>`;
  g += `<clipPath id="${id}"><rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="${R - b}"/></clipPath>`;
  let sc = `<rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" fill="${K18.screen}"/>`;
  sc += `<rect x="${sx}" y="${sy + sh * 0.62}" width="${sw_}" height="${sh}" fill="#1B2E40"/>`;
  const cx = sx + sw_ / 2, ay = sy + 230;
  const on = u >= ans;
  // ondas de llamada
  if (!on) for (let i = 0; i < 3; i++) {
    const q = ((u * 0.9 + i / 3) % 1);
    sc += `<circle cx="${cx}" cy="${ay}" r="${f(110 + q * 120)}" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" opacity="${f(0.5 * (1 - q))}"/>`;
  }
  sc += `<circle cx="${cx + 8}" cy="${ay + 8}" r="112" fill="${INK}"/><circle cx="${cx}" cy="${ay}" r="112" fill="#FFFFFF" ${st18(1)}/>` + tallerIcon18(cx, ay, 82);
  sc += text(TX('taller', 'TALLER'), cx, ay + 180, { size: 82, sw: SW * 1.6, sd: 5 });
  const dots = '.'.repeat(1 + Math.floor((u * 3) % 3));
  const sub = on ? `${TX('enLlamada', 'En llamada')} 00:${String(Math.floor(Math.max(0, u - ans))).padStart(2, '0')}` : TX('llamando', 'Llamando') + dots;
  sc += text(sub, on ? cx : cx - measure(TX('llamando', 'Llamando') + '...', 46) / 2, ay + 262, { size: 46, fill: '#BFE3F2', stroke: null, shadow: false, anchor: on ? 'middle' : 'start' });
  // botones
  const by = sy + sh - 270;
  [[-1, '#3A5068'], [0, '#3A5068'], [1, '#3A5068']].forEach(([d, c]) => { sc += `<circle cx="${cx + d * 120}" cy="${by}" r="48" fill="${c}" ${st18(0.6)}/>`; });
  sc += `<path d="M${cx - 132} ${by - 14} h14 l14 -12 v52 l-14 -12 h-14Z" fill="#FFFFFF"/>`;                       // altavoz
  sc += `<rect x="${cx - 12}" y="${by - 26}" width="24" height="38" rx="12" fill="#FFFFFF"/><path d="M${cx - 22} ${by + 2} q22 26 44 0" stroke="#FFFFFF" stroke-width="6" fill="none"/>`; // micro
  for (let i = 0; i < 9; i++) sc += `<circle cx="${cx + 120 + ((i % 3) - 1) * 18}" cy="${by + (Math.floor(i / 3) - 1) * 18}" r="5" fill="#FFFFFF"/>`; // teclado
  // colgar
  const hy = sy + sh - 120;
  sc += `<circle cx="${cx + 6}" cy="${hy + 6}" r="62" fill="${INK}"/><circle cx="${cx}" cy="${hy}" r="62" fill="${C.red}" ${st18(0.9)}/>`;
  sc += `<path d="M${cx - 36} ${hy + 6} Q${cx} ${hy - 26} ${cx + 36} ${hy + 6} L${cx + 26} ${hy + 18} L${cx + 12} ${hy + 4} Q${cx} ${hy} ${cx - 12} ${hy + 4} L${cx - 26} ${hy + 18}Z" fill="#FFFFFF"/>`;
  g += `<g clip-path="url(#${id})">${sc}</g>`;
  g += `<rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="${R - b}" fill="none" ${st18(0.8)}/>`;
  g += `<rect x="${X + PW / 2 - 56}" y="${Y + 6}" width="112" height="10" rx="5" fill="#3A3434"/>`;
  return g;
}
// globo de diálogo con texto (x,y centro); tail = 'down-left' | 'down-right'
function sayBubble18(x, y, k, str, o = {}) {
  if (k <= 0.01) return '';
  const size = o.size || 110, wd = measure(str, size) + 120, ht = size * 1.45;
  const tx = o.tail === 'down-right' ? wd * 0.22 : -wd * 0.22, tdx = o.tail === 'down-right' ? 60 : -60;
  const tl = `M${f(tx - 34)} ${f(ht / 2 - 6)} L${f(tx + tdx)} ${f(ht / 2 + 80)} L${f(tx + 30)} ${f(ht / 2 - 6)}Z`;
  let g = `<g transform="translate(12 12)" fill="${INK}"><rect x="${f(-wd / 2)}" y="${f(-ht / 2)}" width="${f(wd)}" height="${f(ht)}" rx="${f(ht / 2)}"/><path d="${tl}"/></g>`;
  g += `<path d="${tl}" fill="#FFFFFF" ${st18(1)}/>`;
  g += `<rect x="${f(-wd / 2)}" y="${f(-ht / 2)}" width="${f(wd)}" height="${f(ht)}" rx="${f(ht / 2)}" fill="#FFFFFF" ${st18(1)}/>`;
  g += `<path d="M${f(tx - 28)} ${f(ht / 2 - 4)} H${f(tx + 24)}" stroke="#FFFFFF" stroke-width="${f(SW * 1.8)}"/>`;
  g += text(str, 0, size * 0.04, { size, fill: o.col || INK, stroke: null, shadow: false });
  return at(x, y, k, g, o.rot || 0);
}
// móvil en la oreja (local de Pedro): mano + teléfono por delante de la cabeza
function earPhone18(w) {
  return `<g transform="rotate(-14 182 82)"><rect x="174" y="64" width="13" height="30" rx="3" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/><rect x="175.6" y="66.4" width="9.8" height="25" rx="1.6" fill="${C.glass}"/></g>` +
    `<circle cx="181" cy="90" r="4.4" fill="${P5.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/><path d="M178.4 87.6 Q181 85.6 183.6 87.4" stroke="${INK}" stroke-width="${w(1)}" fill="none"/>`;
}

/* ===================== TALLER ===================== */
const SHOP18 = { floor: 1330 };
function poster2x1(x, y, wd, k = 1, rot = -4) {
  const ht = wd * 0.62;
  let g = `<rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="22" transform="translate(14 14)" fill="${INK}"/>`;
  g += `<rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="22" fill="${C.red}" ${st18(1.1)}/>`;
  g += `<rect x="${-wd / 2 + 16}" y="${-ht / 2 + 16}" width="${wd - 32}" height="${ht - 32}" rx="12" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 0.6)}" stroke-dasharray="20 12" opacity="0.8"/>`;
  g += text(TX('t2x1', '2x1'), 0, ht * 0.02, { size: ht * 0.66, font: 'G', fill: C.yel, sw: SW * 2.2, sd: 8, ls: 3 });
  // cinta adhesiva
  [-1, 1].forEach(sd => { g += `<rect x="-50" y="-16" width="100" height="32" fill="#FFF3B8" opacity="0.85" ${st18(0.5)} transform="translate(${sd * (wd / 2 - 34)} ${-ht / 2 + 2}) rotate(${sd * 28})"/>`; });
  return at(x, y, k, g, rot);
}
function tallerSign18(x, y, wd) {
  const str = TX('taller', 'TALLER'), ht = 150;
  let g = `<rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="24" transform="translate(12 12)" fill="${INK}"/>`;
  g += `<rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="24" fill="${C.navy}" ${st18(1.1)}/>`;
  g += `<circle cx="${-wd / 2 + 86}" cy="0" r="54" fill="#FFFFFF" ${st18(0.7)}/>` + tallerIcon18(-wd / 2 + 86, 0, 40);
  g += text(str, 50, 6, { size: fit(str, 100, wd - 220), sw: SW * 2, sd: 6 });
  return at(x, y, 1, g);
}
// panel perforado con siluetas de herramientas
function pegboard18(x, y, wd, ht) {
  let s = `<rect x="${x + 10}" y="${y + 10}" width="${wd}" height="${ht}" rx="12" fill="${INK}"/><rect x="${x}" y="${y}" width="${wd}" height="${ht}" rx="12" fill="#E7C7A3" ${st18(0.9)}/>`;
  for (let yy = y + 24; yy < y + ht - 10; yy += 34) for (let xx = x + 24; xx < x + wd - 10; xx += 34) s += `<circle cx="${xx}" cy="${yy}" r="3.5" fill="#A9743F" opacity="0.6"/>`;
  s += `<g transform="translate(${x + wd * 0.25} ${y + ht * 0.5}) rotate(10)"><path d="${wrenchPath18(80)}" fill="#9AA0A6" ${st18(0.7)}/></g>`;
  s += `<g transform="translate(${x + wd * 0.5} ${y + ht * 0.48}) rotate(-6)"><path d="${wrenchPath18(64)}" fill="#C9CDD2" ${st18(0.7)}/></g>`;
  // martillo
  s += `<g transform="translate(${x + wd * 0.76} ${y + ht * 0.5}) rotate(14)"><rect x="-8" y="-40" width="16" height="110" rx="6" fill="${K18.wood}" ${st18(0.6)}/><rect x="-36" y="-62" width="72" height="30" rx="8" fill="#7D838A" ${st18(0.6)}/></g>`;
  return s;
}
// elevador de dos columnas
function liftPost18(x, top, floor) {
  let s = `<rect x="${x - 34 + 10}" y="${top + 10}" width="68" height="${floor - top}" fill="${INK}"/><rect x="${x - 34}" y="${top}" width="68" height="${floor - top}" rx="8" fill="${K18.lift}" ${st18(1)}/>`;
  s += `<rect x="${x - 34}" y="${top}" width="18" height="${floor - top}" fill="${K18.liftS}"/><rect x="${x - 34}" y="${top}" width="68" height="${floor - top}" rx="8" fill="none" ${st18(1)}/>`;
  for (let y = top + 60; y < floor - 40; y += 110) s += `<rect x="${x - 14}" y="${y}" width="28" height="14" rx="4" fill="${INK}" opacity="0.6"/>`;
  s += `<rect x="${x - 60}" y="${floor - 26}" width="120" height="26" rx="6" fill="#7D838A" ${st18(0.8)}/>`;
  return s;
}
function liftArm18(x0, x1, y) {
  const a = Math.min(x0, x1), b = Math.max(x0, x1);
  return `<rect x="${a}" y="${y - 14}" width="${b - a}" height="28" rx="8" fill="#7D838A" ${st18(0.8)}/><rect x="${x1 - 30}" y="${y - 30}" width="60" height="20" rx="6" fill="${INK}"/>`;
}
function tallerRoom18(T) {
  let s = `<rect x="-400" y="-400" width="${W + 800}" height="${H + 800}" fill="${K18.wall}"/>`;
  const id = 'tw' + (uid++), cell = 10 * W / 380;
  s += `<defs><pattern id="${id}" width="${f(cell)}" height="${f(cell)}" patternUnits="userSpaceOnUse"><circle cx="${f(cell / 2)}" cy="${f(cell / 2)}" r="${f(1.3 * W / 380)}" fill="${K18.wallS}"/></pattern></defs><rect x="-400" y="-400" width="${W + 800}" height="${SHOP18.floor + 400}" fill="url(#${id})"/>`;
  // franja inferior de la pared
  s += `<rect x="-400" y="${SHOP18.floor - 200}" width="${W + 800}" height="200" fill="${K18.wallS}"/><line x1="-400" y1="${SHOP18.floor - 200}" x2="${W + 400}" y2="${SHOP18.floor - 200}" ${st18(0.6)}/>`;
  // ventanal alto con cielo
  s += `<rect x="350" y="250" width="380" height="150" rx="10" fill="#BFE3F2" ${st18(0.8)}/><path d="M476 250 V400 M603 250 V400" ${st18(0.6)}/>`;
  s += cloud(390 + ((T * 12) % 300), 320, 0.25);
  // suelo de hormigón
  s += `<rect x="-400" y="${SHOP18.floor}" width="${W + 800}" height="${H + 400}" fill="${K18.floor}" ${st18()}/>`;
  for (let x = -200; x < W + 400; x += 280) s += `<line x1="${x}" y1="${SHOP18.floor}" x2="${x - 200}" y2="${H + 200}" ${st18(0.45)} opacity="0.6"/>`;
  s += `<ellipse cx="780" cy="${SHOP18.floor + 120}" rx="120" ry="18" fill="${INK}" opacity="0.12"/>`;
  return s;
}

/* ===================== MECÁNICO (personaje nuevo genérico) ===================== */
// local: suelo y=214, centro x=190, cabeza en (190,78), mira a la derecha. Mono azul con bolsillo de peto, gorra azul
// marino con visera, bigote castaño. o: legF, legB, bob, head, expr ('smile'|'talk'|'focus'), talk, blink,
// armF/armB ({ang,bend}|{ik,side}), itemF/itemB(w,x,y), front(w)
function mechanic18(o) {
  const k = o.k || 1, w = v => f(v * k);
  const st = (v = 3) => `stroke="${INK}" stroke-width="${w(v)}"`, lj = 'stroke-linejoin="round"';
  const leg = (ang, sh) => `<g transform="rotate(${f(ang)} 190 150)"><rect x="184.5" y="148" width="9.5" height="58" rx="4.5" fill="${sh ? K18.monoS : K18.mono}" ${st()}/><path d="M181 205 h19 a5 5 0 0 1 0 9 h-19z" fill="${INK}" ${st()} ${lj}/></g>`;
  let g = leg(o.legB || 0, true) + leg(o.legF || 0, false);
  const arm = (S, a, back, item) => {
    const { E, H } = armJoints(S, a || {});
    let s = limb(S, E, 10, back ? K18.monoS : K18.mono, w) + limb(E, H, 9, back ? K18.monoS : K18.mono, w);
    s += `<circle cx="${f(H[0])}" cy="${f(H[1])}" r="4.5" fill="${back ? P5.skinS : P5.skin}" ${st(2.2)}/>`;
    if (item) s += item(w, H[0], H[1]);
    return s;
  };
  let b = arm([173, 108], o.armB, true, o.itemB);
  b += `<rect x="171" y="97" width="38" height="60" rx="11" fill="${K18.mono}"/><rect x="171" y="97" width="10" height="60" rx="6" fill="${K18.monoS}"/>`;
  // peto con bolsillo, tirantes y parche blanco sin nombre
  b += `<rect x="186" y="112" width="18" height="18" rx="3" fill="${K18.monoS}" ${st(1.6)}/><rect x="189" y="116" width="9" height="4" rx="1.5" fill="#FFFFFF"/>`;
  b += `<path d="M184 98 L187 113 M206 99 L203 113" stroke="${INK}" stroke-width="${w(1.4)}"/>`;
  b += `<rect x="171" y="138" width="38" height="5" fill="${K18.monoS}"/>`;
  b += `<rect x="171" y="97" width="38" height="60" rx="11" fill="none" ${st()}/>`;
  b += `<path d="M183 98 Q190 104 198 98" stroke="${INK}" stroke-width="${w(1.6)}" fill="#FFFFFF" stroke-linecap="round"/>`;
  b += arm([207, 108], o.armF, false, o.itemF);
  // cabeza
  let hd = `<circle cx="190" cy="79" r="14" fill="${P5.skin}" ${st()}/>`;
  hd += `<circle cx="179" cy="81" r="3.2" fill="${P5.skinS}" ${st(1.6)}/>`;
  // gorra: copa y visera hacia delante
  hd += `<path d="M175.6 75 Q175 61 190 60.6 Q204.6 60.6 204.6 74 Z" fill="${K18.cap}" ${st()} ${lj}/>`;
  hd += `<path d="M175.6 75 Q176 68 181 64" stroke="${K18.capS}" stroke-width="${w(3)}" fill="none"/>`;
  hd += `<path d="M200 73.4 Q209 72 216 75.6 Q211 78.4 200.6 77.4Z" fill="${K18.capS}" ${st(2)} ${lj}/>`;
  hd += `<circle cx="189" cy="66" r="2.6" fill="${C.red}" ${st(1)}/>`;
  // cara
  const L = (d, sw = 1.7, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" fill="none"/>`;
  if (o.blink) hd += L('M195.2 82 H198.6 M201.6 82 H205', 1.6);
  else hd += `<circle cx="197" cy="82" r="1.7" fill="${INK}"/><circle cx="203.4" cy="82" r="1.7" fill="${INK}"/>`;
  hd += o.expr === 'focus' ? L('M194.4 78.6 L199.4 79.6 M201 79.6 L205.8 78.4', 1.5) : L('M194.6 78.2 Q197 77 199.4 78 M201 78 Q203.4 77 205.8 78.2', 1.4);
  hd += `<circle cx="196" cy="88" r="2.4" fill="${C.pink}" opacity="0.5"/>`;
  hd += `<path d="M196.8 87.2 Q200.6 84.8 204.6 87.4 Q203 89.4 200.6 88.4 Q198.6 89.4 196.8 87.2Z" fill="${K18.mous}" ${st(1.3)} ${lj}/>`;
  if (o.expr === 'talk') { const op = clamp(o.talk || 0); hd += `<path d="M198 90.4 Q200.6 ${f(91.4 + op * 4)} 203.4 90.2 Z" fill="${C.dred}" ${st(1.4)} ${lj}/>`; }
  else if (o.expr === 'focus') hd += L('M198.6 91 H202.8', 1.6);
  else hd += L('M197.8 90.4 Q200.6 93 203.6 90.2', 1.6);
  b += `<g transform="rotate(${f(o.head || 0)} 190 95)">${hd}</g>`;
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  return g;
}
function placeMech18(px, py, sc, o) {
  o.k = SW / (3 * sc);
  const sx = o.flip ? -sc : sc;
  return `<g transform="translate(${f(px - 190 * sx)} ${f(py - 214 * sc)}) scale(${f(sx)} ${f(sc)})">${mechanic18(o)}</g>`;
}
// llave inglesa en la mano (local); ang = giro
const wrenchItem18 = ang => (w, x, y) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"><path d="${wrenchPath18(18)}" transform="translate(0 -14)" fill="${K18.rim}" stroke="${INK}" stroke-width="${w(1.8)}" stroke-linejoin="round"/></g><circle cx="${f(x)}" cy="${f(y)}" r="4.5" fill="${P5.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
