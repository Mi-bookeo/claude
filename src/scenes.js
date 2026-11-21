/* Vídeo 07 — «Pedro y el amigo invisible». Escenas sobre lib.js + series.js + rosa.js + v04.js + v05.js + v06.js + v07.js.
   Todo se calcula a partir de (t local de la escena, T global). Franja de subtítulos (y > 1400) y margen
   superior (y < 192) libres de textos y elementos importantes. Cortes secos entre escenas. */
'use strict';

const S = {};
const big = (str, x, y, size, k, rot = 0, o = {}) => at(x, y, k, text(str, 0, 0, Object.assign({ size: fit(str, size, o.maxW || 980, o.font || 'B'), sw: SW * 2.3, sd: 9 }, o)), rot);
const bump = (t, times, a = 0.03) => 1 + times.reduce((m, t0) => m + (t >= t0 ? a * Math.max(0, damp(t - t0, 14, 6)) : 0), 0);
const win = (t, a, b) => t >= a && t < b;
const blinkP = T => ((T + 0.4) % 3.1) < 0.12;
const breathe = T => -1.6 * (0.5 - 0.5 * Math.cos(2 * PI * T / 1.6));
const GROUND = 1330, FEET = 1392, PSC = 4.3;

/* ---------- 1) Casa de Pedro: se arregla frente al espejo; «Cena de cuadrilla · 21:00» ---------- */
const P1 = { x: 420, feet: 1386, sc: 4.6, rx: 790 };
function pose1(t, T) {
  const o = { expr: 'calm', bob: breathe(T), blink: blinkP(T), armB: { ang: 6, bend: -10 }, look: [0.4, 0] };
  if (t < 1.75) {            // se coloca el cuello
    const u = clamp((t - 0.15) / 0.3), wig = Math.sin(t * 9) * 1.8;
    o.armF = u < 1 ? { ang: lerp(4, -40, u), bend: lerp(-8, -150, u) } : { ik: [198 + wig, 101.5 - Math.abs(wig) * 0.4], side: 1 };
    o.armB = { ik: [181 + wig * 0.6, 102], side: -1 };
    o.head = -4; o.look = [0.6, 0.6];
  } else if (t < 3.3) {      // se peina
    const u = clamp((t - 1.75) / 0.25);
    const cx = 188 + 7 * Math.sin((t - 2) * 7.5);
    o.armF = u < 1 ? { ik: [lerp(198, cx, u), lerp(101.5, 60, u)], side: 1 } : { ik: [cx, 60.5], side: 1 };
    o.comb = true; o.head = 3; o.look = [0.5, -0.3];
  } else {                   // listo: sonrisa
    const u = easeOut((t - 3.3) / 0.25);
    o.armF = { ang: lerp(-60, 4, u), bend: lerp(-120, -8, u) };
    o.expr = 'grin'; o.head = -2;
  }
  return o;
}
function comb(x, y, sc, rot) {
  const s = sc / 4.6;
  return at(x, y, 1, `<rect x="${f(-46 * s)}" y="${f(-12 * s)}" width="${f(92 * s)}" height="${f(24 * s)}" rx="${f(8 * s)}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>` +
    Array.from({ length: 7 }, (_, i) => `<line x1="${f((-36 + i * 12) * s)}" y1="${f(12 * s)}" x2="${f((-36 + i * 12) * s)}" y2="${f(30 * s)}" stroke="${INK}" stroke-width="${f(SW * 0.8)}" stroke-linecap="round"/>`).join(''), rot);
}
S[1] = (t, T) => {
  const o = pose1(t, T);
  const reflect = () => {
    const r = Object.assign({}, o, { flip: true });
    let g = placeP7(P1.rx, P1.feet, P1.sc * 0.96, r);
    if (o.comb) { const [hx, hy] = p7Hand(P1.rx, P1.feet, P1.sc * 0.96, r); g += comb(hx - 10, hy - 6, P1.sc, 20); }
    return g + `<rect width="${W}" height="${H}" fill="${C.glass}" opacity="0.22"/>`;
  };
  let w = houseBack(T, { reflect });
  w += shadowEll(P1.x, P1.feet, 120);
  w += placeP7(P1.x, P1.feet, P1.sc, o);
  if (o.comb) { const [hx, hy] = p7Hand(P1.x, P1.feet, P1.sc, o); w += comb(hx + 10, hy - 6, P1.sc, -20); }
  if (t > 3.35) {
    const [hx, hy] = p7Pt(P1.x, P1.feet, P1.sc, 212, 66);
    w += sparkle(hx + 40, hy - 30, 30, pop(t, 3.35, 0.35) * (1 + 0.2 * Math.sin(t * 15)));
    w += sparkle(hx + 100, hy + 40, 20, pop(t, 3.45, 0.35));
  }
  let s = cam(zoomIn(t, 0, 1.12, 0.22) * lerp(1, 1.03, easeInOut(t / 4)), 540, 900, w);
  const k1 = pop(t, 0.3, 0.55), k2 = pop(t, 0.55, 0.55);
  s += big('Cena de cuadrilla ·', 540, 290, 120, k1, lerp(-8, -3, k1));
  s += big('21:00', 540, 430, 150, k2, lerp(8, 2, k2), { fill: P7.yel, font: 'G', ls: 4 });
  return s;
};

/* ---------- 2) El móvil vibra sobre la mesa: audio de la cuadrilla; «Nuevo audio» ---------- */
function tableTop() {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}"`;
  let s = `<rect width="${W}" height="${H}" fill="${C.wood}"/>`;
  for (let i = 0; i < 8; i++) s += `<rect x="${i * 150 - 20}" y="0" width="12" height="${H}" fill="${C.woodS}" opacity="0.45"/>`;
  [[200, 260, 120], [760, 520, 160], [330, 1180, 140], [880, 1500, 110]].forEach(([x, y, l]) => { s += `<path d="M${x} ${y} q30 ${l / 2} 0 ${l}" fill="none" stroke="${C.woodS}" stroke-width="${f(SW * 0.8)}" stroke-linecap="round"/>`; });
  // mantel individual de cuadros rojos bajo el móvil
  const id = 'mt' + (uid++);
  s += `<rect x="150" y="380" width="790" height="1090" rx="30" fill="${INK}" transform="translate(12 12)"/>`;
  s += `<clipPath id="${id}"><rect x="150" y="380" width="790" height="1090" rx="30"/></clipPath><g clip-path="url(#${id})"><rect x="150" y="380" width="790" height="1090" fill="${C.cream}"/>`;
  for (let x = 150; x < 940; x += 66) s += `<rect x="${x}" y="380" width="33" height="1090" fill="${C.red}" opacity="0.28"/>`;
  for (let y = 380; y < 1470; y += 66) s += `<rect x="150" y="${y}" width="790" height="33" fill="${C.red}" opacity="0.28"/>`;
  s += `</g><rect x="150" y="380" width="790" height="1090" rx="30" fill="none" ${st()}/>`;
  return s;
}
function mug(x, y, r, t) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}"`;
  let s = `<circle cx="${x + 10}" cy="${y + 10}" r="${r}" fill="${INK}"/><circle cx="${x + r + 10}" cy="${y}" r="${f(r * 0.38)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 3.2)}"/><circle cx="${x + r + 10}" cy="${y}" r="${f(r * 0.38)}" fill="none" stroke="${C.red}" stroke-width="${f(SW * 1.4)}"/>`;
  s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.red}" ${st()}/><circle cx="${x}" cy="${y}" r="${f(r * 0.78)}" fill="#7E5328" ${st(0.8)}/>`;
  s += `<path d="M${f(x - r * 0.4)} ${f(y - r * 0.1)} q${f(r * 0.4)} ${f(-r * 0.3)} ${f(r * 0.8)} 0" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" opacity="0.6" stroke-linecap="round"/>`;
  for (let i = 0; i < 2; i++) { const yy = y - r - 40 - ((t * 60 + i * 50) % 100); s += `<path d="M${x - 20 + i * 40} ${f(yy + 60)} q-16 -25 0 -50 q16 -25 0 -50" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 1.1)}" stroke-linecap="round" opacity="${f(0.7 - ((t * 60 + i * 50) % 100) / 160)}"/>`; }
  return s;
}
function chatScreen(t) {
  return (sx, sy, sw, sh) => {
    let g = `<rect x="${f(sx)}" y="${f(sy)}" width="${f(sw)}" height="${f(sh)}" fill="#EFE7DF"/>`;
    for (let yy = sy + 190; yy < sy + sh; yy += 70) for (let xx = sx + 30 + ((yy / 70) % 2) * 35; xx < sx + sw; xx += 70) g += `<circle cx="${f(xx)}" cy="${f(yy)}" r="4" fill="${DOT}" opacity="0.7"/>`;
    // cabecera del chat de la cuadrilla
    const hh = 170;
    g += `<rect x="${f(sx)}" y="${f(sy)}" width="${f(sw)}" height="${hh}" fill="${C.navy}"/><line x1="${f(sx)}" y1="${f(sy + hh)}" x2="${f(sx + sw)}" y2="${f(sy + hh)}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
    g += `<path d="M${f(sx + 52)} ${f(sy + 70)} l-22 22 l22 22" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 1.2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const gx = sx + 120, gy = sy + 92;
    g += `<circle cx="${f(gx)}" cy="${f(gy)}" r="44" fill="${P7.yel}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
    [[-18, 4, C.red], [18, 4, C.green], [0, -8, C.pink]].forEach(([dx, dy, col]) => { g += `<circle cx="${f(gx + dx)}" cy="${f(gy + dy - 6)}" r="11" fill="${C.skin}" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/><path d="M${f(gx + dx - 15)} ${f(gy + dy + 26)} q15 -24 30 0Z" fill="${col}" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/>`; });
    g += text('Cuadrilla', gx + 64, gy - 14, { size: 54, anchor: 'start', sw: SW * 1.2, sd: 3 });
    g += text('Cena · 21:00', gx + 64, gy + 34, { size: 34, anchor: 'start', fill: '#FFFFFF', stroke: null });
    // mensaje anterior
    const b1 = sy + hh + 60;
    g += panel(sx + 30, b1, sw * 0.62, 96, 30, '#FFFFFF', 6) + text('¡Esta noche cena!', sx + 60, b1 + 50, { size: fit('¡Esta noche cena!', 38, sw * 0.62 - 50), anchor: 'start', fill: INK, stroke: null });
    // respuesta de Pedro
    const b2 = b1 + 140, rw = sw * 0.56;
    g += panel(sx + sw - 30 - rw, b2, rw, 96, 30, '#DDF5D6', 6) + text('¡Allí estaré!', sx + sw - 30 - rw / 2, b2 + 50, { size: fit('¡Allí estaré!', 38, rw - 50), fill: INK, stroke: null });
    // nuevo audio
    const ka = pop(t, 0.45, 0.5), prog = clamp((t - 1.05) / 2.5), playing = t > 1.05 && t < 3.55;
    g += at(sx + 24 + sw * 0.47, b2 + 190 + 130, ka, audioBubble(-sw * 0.47, -130, sw * 0.94, prog, playing, t), 0);
    g += text('Ahora', sx + sw - 40, b2 + 190 + 130 + sw * 0.94 * 0.36 + 10, { size: 30, anchor: 'end', fill: '#8A7D78', stroke: null });
    // contador «1» de mensajes nuevos
    if (t > 0.45) g += at(sx + sw - 44, sy + 40, pop(t, 0.5, 0.4), `<circle r="34" fill="${C.green}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>` + text('1', 0, 2, { size: 44, sw: SW, sd: 2 }));
    return g;
  };
}
S[2] = (t, T) => {
  let w = tableTop();
  w += mug(1000, 1580, 110, t) + mug(80, 1230, 80, t + 0.4);
  // vibración
  const vib = win(t, 0.15, 1.3) || win(t, 1.55, 2.45);
  const jx = vib ? 7 * Math.sin(t * 95) : 0, jr = vib ? 1.4 * Math.sin(t * 77) : 0;
  const cx = 545 + jx, cy = 905;
  if (vib) {
    w += vibeRings(cx - 300, cy - 420, t, 30, 3) + vibeRings(cx + 300, cy + 420, t + 0.2, 30, 3);
    [[-1, 1], [1, -1]].forEach(([sx, sy], i) => { w += `<path d="M${f(cx + sx * 330)} ${f(cy + sy * 160 - 40)} l${sx * 30} 20 l${-sx * 30} 20 l${sx * 30} 20" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.1)}" stroke-linecap="round" stroke-linejoin="round"/>`; });
  }
  w += tablePhone(cx, cy, 560, 980, -4 + jr, chatScreen(t));
  // ondas de sonido saliendo del móvil mientras suena
  if (t > 1.05 && t < 3.7) for (let i = 0; i < 3; i++) {
    const u = ((t - 1.05) * 1.6 + i / 3) % 1, r = 120 + u * 170;
    w += `<path d="M${f(cx + 300 + r * 0.25)} ${f(cy - r * 0.5 - 40)} Q${f(cx + 300 + r * 0.6)} ${f(cy - 40)} ${f(cx + 300 + r * 0.25)} ${f(cy + r * 0.5 - 40)}" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 1.6 * (1 - u) + 1)}" stroke-linecap="round"/>`;
  }
  let s = cam(zoomIn(t, 0, 1.14, 0.22) * bump(t, [0.45], 0.03), 540, 900, w);
  const k = pop(t, 0.5, 0.55);
  s += big('Nuevo audio', 540, 290, 150, k, lerp(-8, -3, k) + (vib ? 1.5 * Math.sin(t * 40) : 0));
  return s;
};

/* ---------- 3) Corte seco y zoom rápido a la cara: «¡EL AMIGO INVISIBLE!» ---------- */
S[3] = (t, T) => {
  let w = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 880, 20, t * 14, '#E85A4F');
  w += impactLines(540, 880, t, 40, 520);
  const sc = 15, px = 540, headY = 880, py = headY + 136 * sc;
  const jit = 0.5 * Math.sin(t * 60);
  const o = { expr: 'panic', jit, drop: clamp(t / 2.4) * 5, armF: { ik: [213, 91], side: 1 }, armB: { ik: [171, 90], side: -1 }, head: 2 * Math.sin(t * 30) };
  w += placeP7(px, py, sc, o);
  // gotas que salen disparadas
  [[-1, 0.15], [1, 0.35], [-1, 0.9], [1, 1.2]].forEach(([d, t0], i) => {
    const u = (t - t0) / 0.6;
    if (u > 0 && u < 1) w += sweat(px + d * (260 + u * 220), headY - 240 + u * 140 - 160 * Math.sin(u * PI), 34, 1 - u * 0.4, d * 30);
  });
  const shake = t < 0.5 ? 14 * damp(t, 50, 7) : 3 * Math.sin(t * 47);
  let s = cam(lerp(1.55, 1, easeOut(t / 0.18)) * bump(t, [0.3], 0.03), 540, 880, w, shake, -shake * 0.6);
  const k1 = pop(t, 0.15, 0.45), k2 = pop(t, 0.32, 0.45);
  const sh = 3 * Math.sin(t * 35);
  s += big('¡EL AMIGO', 540, 300 + sh, 190, k1, lerp(-10, -4, k1), { fill: P7.yel, font: 'G', ls: 3 });
  s += big('INVISIBLE!', 540, 480 - sh, 200, k2, lerp(10, 3, k2), { fill: P7.yel, font: 'G', ls: 3 });
  return s;
};

/* ---------- 4) Chasquido y cara iluminada: nube con la oferta y el logo; «¡Lo vi en Escaparate de Tudela!» ---------- */
const P4 = { x: 800, sc: 5.1, head: 1250, snap: 0.95 };
S[4] = (t, T) => {
  let w = houseBack(T, { mirror: false });
  const py = P4.head + 136 * P4.sc, lit = t > P4.snap;
  // halo de la idea detrás de la cabeza
  const [hx, hy] = p7Pt(P4.x, py, P4.sc, 198, 78, true);
  if (lit) {
    const kh = pop(t, P4.snap, 0.4);
    w += at(hx, hy, kh, `<circle r="190" fill="${P7.yel}" opacity="0.55"/>` + rays(0, 0, 14, t * 30, '#FFF1C9', 260).replace(/<path/g, '<path opacity="0.9"'));
  }
  // pose: quieto y pensativo -> chasquea -> brazo en alto
  const raise = easeOut((t - 0.35) / 0.35), down = easeInOut((t - 2.2) / 0.4);
  const o = { flip: true, bob: breathe(T), blink: !lit && blinkP(T), head: lit ? -6 : 2, look: lit ? [0.6, -0.8] : [0.4, -0.6],
    expr: lit ? 'idea' : 'normal', armB: { ang: 8, bend: -8 } };
  const snapWig = lit && t < P4.snap + 0.25 ? 3 * damp(t - P4.snap, 30, 8) : 0;
  o.armF = t < 2.2 ? { ik: [lerp(208, 226, raise), lerp(146, 70 + snapWig, raise)], side: 1 } : { ik: [lerp(226, 210, down), lerp(70, 146, down)], side: 1 };
  if (t < 0.35) o.armF = { ang: 4, bend: -6 };
  w += placeP7(P4.x, py, P4.sc, o);
  if (t >= 0.35 && t < 2.6) {
    const [sx, sy] = p7Hand(P4.x, py, P4.sc, o);
    // dedos del chasquido
    w += at(sx, sy, 1, `<rect x="-6" y="-46" width="20" height="44" rx="10" fill="${P5.skin}" stroke="${INK}" stroke-width="${f(SW * 0.8)}" transform="rotate(${lit ? -30 : 10})"/>`) + handDot(sx, sy, P4.sc);
    if (lit && t < P4.snap + 0.7) {
      const kk = pop(t, P4.snap, 0.3) * (1 - easeOut((t - P4.snap - 0.5) / 0.2));
      w += burst(sx, sy - 40, 70 * kk, t * 50, P7.yel) + onoma(sx - 150, sy - 120, kk, '¡CHAS!', -12, '#FFFFFF', 84);
    }
  }
  // nube de pensamiento, tarjeta y logo
  const kc = pop(t, P4.snap + 0.15, 0.55), fl = 8 * Math.sin(t * 2.2);
  w += thinkDot(hx - 120, hy - 190, 26, pop(t, P4.snap + 0.05, 0.35)) + thinkDot(hx - 190, hy - 290, 38, pop(t, P4.snap + 0.1, 0.35));
  w += thinkCloud(470, 905 + fl, 860, 600, kc);
  w += xmasCard(470, 935 + fl, 0.56 * kc, lerp(-12, -3, kc) + Math.sin(t * 1.8), t, { kSeal: pop(t, P4.snap + 0.6, 0.5) });
  const kl = pop(t, P4.snap + 0.45, 0.55);
  w += at(470, 600 + fl * 0.6, kl, `<circle cx="10" cy="10" r="112" fill="${INK}"/><circle r="112" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>` + logoBadge(0, 4, 182, 0, 1, 'logoR'), lerp(14, 4, kl));
  if (t > P4.snap + 0.6) {
    const ks = pop(t, P4.snap + 0.6, 0.35) * (1 + 0.25 * Math.sin(t * 16));
    w += sparkle(600, 520, 34, ks) + sparkle(345, 540, 22, pop(t, P4.snap + 0.7, 0.35) * (1 + 0.2 * Math.sin(t * 13)));
  }
  let s = cam(zoomIn(t, 0, 1.12, 0.22) * bump(t, [P4.snap], 0.04), 540, 1000, w);
  const k1 = pop(t, 1.35, 0.5), k2 = pop(t, 1.55, 0.5);
  s += big('¡Lo vi en', 540, 250, 120, k1, lerp(-8, -3, k1));
  s += big('Escaparate de Tudela!', 540, 365, 120, k2, lerp(7, 2, k2), { fill: P7.yel });
  return s;
};

/* ---------- 5) Teclea rápido: logo y carrusel a toda velocidad; se para con «¡PUM!» en la oferta ---------- */
const PH5 = { X: 170, Y: 480, PW: 740, PH: 910, land: 2.75 };
function thumb(x, y, rot, press) {
  const st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  return at(x, y + press * 16, 1, `<path d="M-46 0 Q-50 -120 0 -126 Q50 -120 46 0 L56 260 H-56Z" fill="${P5.skin}" ${st}/>
    <path d="M-26 -80 Q-28 -112 0 -114 Q28 -112 26 -80 Q0 -70 -26 -80Z" fill="#FFF1E6" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>
    <path d="M-34 10 Q0 22 34 10" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.7)}" stroke-linecap="round"/>
    <path d="M-56 120 H56 L60 260 H-60Z" fill="${P7.shirt}" ${st}/>`, rot);
}
S[5] = (t, T) => {
  let w = `<rect width="${W}" height="${H}" fill="${P5.peach}"/>` + rays(600, 900, 18, t * 10, P5.warmCream);
  const { X, Y, PW, PH, land } = PH5;
  // desplazamiento del carrusel: rapidísimo y frenando hasta la tarjeta de 10 €
  const pitch = 330, target = (2 * CAROUSEL.length + 4) * pitch;
  const u = clamp((t - 0.25) / (land - 0.25));
  let off = target * (1 - Math.pow(1 - u, 2.2));
  if (t > land) off = target + 26 * damp(t - land, 20, 7) * (t - land < 0.6 ? 1 : 0);
  const vel = t > 0.25 && t < land ? 2.2 * target * Math.pow(1 - u, 1.2) / (land - 0.25) : 0;
  const body = (sx, sy, sw, sh) => {
    let g = '';
    const cy = sy + 60, cx0 = sx + sw / 2;
    const i0 = Math.floor((off - sw) / pitch) - 1, i1 = Math.ceil((off + sw) / pitch) + 1;
    for (let i = i0; i <= i1; i++) {
      if (i < 0) continue;
      const cx = cx0 + i * pitch - off, c = CAROUSEL[i % CAROUSEL.length];
      if (cx < sx - 200 || cx > sx + sw + 200) continue;
      const isT = i * pitch === target, kz = isT && t > land ? 1 + 0.1 * Math.max(0, damp(t - land, 14, 5)) + 0.04 : 1;
      g += at(cx, cy + 215, kz, carCard(0, -215, c, t), 0);
      if (isT && t > land) g += `<rect x="${f(cx - 175 * kz)}" y="${f(cy + 215 - 240 * kz)}" width="${f(350 * kz)}" height="${f(480 * kz)}" rx="34" fill="none" stroke="${P7.yel}" stroke-width="${f(SW * 1.6)}"/>`;
    }
    // rayas de velocidad sobre el carrusel
    if (vel > 600) {
      const n = Math.min(7, Math.floor(vel / 700));
      for (let i = 0; i < n; i++) {
        const yy = cy + 40 + i * 62, len = 160 + hash(i * 3 + Math.floor(t * 20)) * 260, xx = sx + 40 + hash(i * 7 + Math.floor(t * 20)) * (sw - 80);
        g += `<line x1="${f(xx)}" y1="${f(yy)}" x2="${f(xx + len)}" y2="${f(yy)}" stroke="#FFFFFF" stroke-width="${f(SW * 1.3)}" stroke-linecap="round"/><line x1="${f(xx + 20)}" y1="${f(yy + 14)}" x2="${f(xx + len * 0.7)}" y2="${f(yy + 14)}" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linecap="round"/>`;
      }
    }
    // puntos del carrusel y barra de búsqueda
    const by = cy + 500;
    for (let i = 0; i < 7; i++) { const on = i === Math.round(off / pitch) % 7; g += `<circle cx="${f(cx0 - 120 + i * 40)}" cy="${f(by)}" r="${on ? 12 : 8}" fill="${on ? C.red : '#D9C7C2'}" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/>`; }
    g += pill(cx0, by + 100, sw - 80, 84, '#FFFFFF', '', { swk: 0.8 });
    g += `<circle cx="${f(sx + 90)}" cy="${f(by + 98)}" r="18" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/><line x1="${f(sx + 103)}" y1="${f(by + 111)}" x2="${f(sx + 118)}" y2="${f(by + 126)}" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round"/>`;
    g += text('Navidad', sx + 140, by + 100, { size: 40, anchor: 'start', fill: INK, stroke: null });
    return g;
  };
  const kp = pop(t, 0, 0.35);
  w += at(X + PW / 2, Y + PH / 2, lerp(0.85, 1, kp), `<g transform="translate(${-X - PW / 2} ${-Y - PH / 2})">${portalPhone(X, Y, PW, PH, body, { hh: 170 })}</g>`, -2);
  // pulgares tecleando rápido
  const typing = t < land + 0.1;
  const pA = typing ? Math.max(0, Math.sin(t * 34)) : 0, pB = typing ? Math.max(0, Math.sin(t * 34 + PI)) : 0;
  w += at(0, 0, 1, thumb(X + 210, Y + PH + 40, 18, pA) + thumb(X + PW - 180, Y + PH + 50, -20, pB));
  if (typing && t > 0.2) {
    const s1 = Math.floor(t * 5.4) % 2;
    w += onoma(s1 ? 150 : 930, s1 ? 1180 : 1080, 1, '¡TAC!', s1 ? -14 : 12, '#FFFFFF', 72);
  }
  // viñeta circular con la cara concentrada de Pedro
  const id = 'vn' + (uid++), vx = 860, vy = 330, vr = 128;
  let face = `<rect x="${vx - vr}" y="${vy - vr}" width="${vr * 2}" height="${vr * 2}" fill="${C.glass}"/>`;
  face += placeP7(vx - 42, vy + 8 + 136 * 6.6, 6.6, { expr: t > land ? 'idea' : 'focus', look: [0.6, 1.2], head: 6, blink: false, armF: { ang: 0 }, armB: { ang: 0 } });
  w += at(vx, vy, pop(t, 0.1, 0.45), `<g transform="translate(${-vx} ${-vy})"><circle cx="${vx + 12}" cy="${vy + 12}" r="${vr + 14}" fill="${INK}"/><circle cx="${vx}" cy="${vy}" r="${vr + 14}" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>
    <clipPath id="${id}"><circle cx="${vx}" cy="${vy}" r="${vr}"/></clipPath><g clip-path="url(#${id})">${face}</g><circle cx="${vx}" cy="${vy}" r="${vr}" fill="none" stroke="${INK}" stroke-width="${f(SW)}"/></g>`);
  if (t < land) w += sweat(vx - 150, vy - 60, 26, 1, -20);
  // ¡PUM!
  const kP = pop(t, land, 0.35);
  w += pum(330, 330, kP, t);
  if (t > land) { w += sparkle(300, 640, 30, pop(t, land + 0.1, 0.35) * (1 + 0.2 * Math.sin(t * 15))); w += sparkle(940, 1100, 26, pop(t, land + 0.2, 0.35)); }
  return cam(zoomIn(t, 0, 1.12, 0.2) * bump(t, [land], 0.05), 540, 800, w);
};

/* ---------- 6) Sale corriendo de casa al atardecer; tropieza y sigue; «¡Que cierra!» ---------- */
const ST6 = { home: [40, 500, 780], shops: [600, 1090, 1580, 2070, 2560, 3050], lamps: [560, 1050, 1540, 2030, 2520, 3010, 3500], trees: [1000, 2950], trip: 2.35 };
function pedroX6(t) {
  // sale por la puerta (t≈0,3), corre; frena un poco al tropezar
  const v = 640, t0 = 0.3, tr = ST6.trip;
  if (t < t0) return 290;
  let x = 290 + v * (Math.min(t, tr) - t0);
  if (t > tr) x += v * 0.35 * Math.min(t - tr, 0.45) + v * Math.max(0, t - tr - 0.45);
  return x;
}
function xmasStreet(off, T, o = {}) {
  let w = '';
  const [hx, hw, hh] = ST6.home;
  const hf = homeFacade(hx - off, GROUND, hw, hh, o.open || 0);
  w += hf.svg;
  ST6.shops.forEach((x, i) => { w += shop(x - off, GROUND, 440, 560, SHOP_TYPES[(i + 1) % 4]); });
  // farolas con guirnaldas
  for (let i = 0; i < ST6.lamps.length - 1; i++) w += garland(ST6.lamps[i] - off, 640, ST6.lamps[i + 1] - off, 640, 90, T, 9);
  ST6.trees.forEach(x => { w += xmasTree(x - off, 1372, 560, T, {}); });
  ST6.lamps.forEach(x => { w += lampPost(x - off, 1372, 730); });
  return { svg: w, door: hf.door };
}
S[6] = (t, T) => {
  const px = pedroX6(t), off = Math.max(0, px - 400);
  let w = xmasSky(T, { sx: 850, sy: 720, sr: 64 });
  const st = xmasStreet(off, T, { open: t < 0.9 ? Math.sin(clamp(t / 0.9) * PI) : 0 });
  w += st.svg;
  w += ground(GROUND, off, { sp: 230 });
  const sx = px - off, tr = ST6.trip;
  // pose: corriendo; tropiezo breve
  let o = Object.assign(p7Run(t), { jacket: true, expr: 'surprise', head: -4, look: [0.8, 0] });
  if (t < 0.3) o = { jacket: true, expr: 'surprise', legF: 10, legB: -10, armF: { ang: -30, bend: -50 }, armB: { ang: 30, bend: -50 }, lean: 6 };
  const tu = (t - tr) / 0.45;
  if (tu > 0 && tu < 1) {
    const e = Math.sin(tu * PI);
    o.lean = lerp(10, 34, e); o.legB = lerp(o.legB, -70, e); o.legF = lerp(o.legF, 30, e);
    o.armF = { ang: lerp(-45, -150, e), bend: -30 }; o.armB = { ang: lerp(45, -120, e), bend: -30 }; o.expr = 'panic'; o.bob = 6 * e;
  }
  if (t > tr + 0.45) o.expr = 'grin';
  // piedrecilla del tropiezo
  const stoneX = pedroX6(tr) + 70 - off;
  w += `<ellipse cx="${f(stoneX)}" cy="${FEET + 2}" rx="22" ry="14" fill="#B9B0AD" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  w += shadowEll(sx, FEET, 110);
  // rayas de velocidad detrás de Pedro
  if (t > 0.35) w += speedLinesH(sx - 140, 840, 260, 6, 70, SW * 1.1);
  w += placeP7(sx, FEET, PSC, o);
  if (tu > 0 && tu < 1.4) {
    const [hx, hy] = p7Pt(sx, FEET, PSC, 205, 62);
    w += sweat(hx + 30, hy - 40 - tu * 30, 26, pop(t, tr, 0.25), 20);
    w += burst(stoneX, FEET - 30, 50 * Math.sin(clamp(tu) * PI), t * 60, '#FFFFFF');
  }
  // polvo a los pies
  for (let i = 0; i < 3; i++) { const u = ((t * 2.5 + i / 3) % 1); if (t > 0.4) w += puff(sx - 80 - u * 160, FEET - 20 - u * 40, 26 + u * 20, 1 - u); }
  let s = cam(zoomIn(t, 0, 1.12, 0.22), 540, 900, w);
  const k = pop(t, 0.55, 0.5);
  s += big('¡Que cierra!', 540, 300 + 4 * Math.sin(t * 9), 120, k, lerp(-10, -4, k), { fill: P7.yel });
  return s;
};

/* ---------- 7) Tienda REGALOS: llega y frena (campanilla); dentro coge una caja, paga y sale con la bolsa ---------- */
const G7 = giftShopGeo(130, GROUND, 820, 940);
S[7] = (t, T, sc) => {
  const cut = (sc && sc.cut) || 1.2;
  if (t < cut) {
    let w = xmasSky(T, { sx: 940, sy: 300, sr: 56 });
    w += lampPost(60, 1372, 980) + lampPost(1020, 1372, 980) + garland(60, 392, 1020, 392, 70, T, 10);
    const ring = 0.72, bell = t > ring ? 22 * damp(t - ring, 18, 4) : 0;
    w += giftShop(G7, { t: T, bell, kTag: 1 });
    w += ground(GROUND, 0, { sp: 230 });
    // Pedro llega corriendo y frena en la puerta
    const stopX = G7.door.x - 40, u = clamp(t / ring);
    const px = lerp(-200, stopX, 1 - Math.pow(1 - u, 2));
    let o = Object.assign(p7Run(t), { jacket: true, expr: 'grin', head: -4 });
    if (t > ring - 0.15) {
      const b = easeOut((t - ring + 0.15) / 0.2);
      o = { jacket: true, expr: 'surprise', lean: lerp(10, -14, b) + 6 * damp(t - ring, 14, 5) * (t > ring ? 1 : 0), legF: lerp(o.legF, 34, b), legB: lerp(o.legB, -24, b),
        armF: { ang: lerp(-45, -80, b), bend: -40 }, armB: { ang: lerp(45, -40, b), bend: -40 }, head: 2 };
      if (t > ring + 0.25) o.expr = 'grin';
    }
    w += shadowEll(px, FEET, 110);
    if (t > ring - 0.15) for (let i = 0; i < 4; i++) { const v = clamp((t - ring + 0.15) / 0.5); w += puff(px - 60 - i * 45 * v, FEET - 18 - i * 6, 22 + i * 6, (1 - v) * (i < 3 ? 1 : 0.6)); }
    if (t > ring - 0.15) w += `<path d="M${f(px - 30)} ${FEET + 6} H${f(px - 250)} M${f(px - 40)} ${FEET + 22} H${f(px - 200)}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linecap="round"/>`;
    w += placeP7(px, FEET, PSC, o);
    const bx = G7.door.x + G7.door.w * 0.86, by = G7.door.y - 4;
    w += onoma(bx + 30, by - 120, pop(t, ring, 0.3), '¡DING!', 12, P7.yel, 76);
    return cam(zoomIn(t, 0, 1.1, 0.2) * bump(t, [ring], 0.03), 540, 900, w);
  }
  // interior
  const u = t - cut;
  const grab = 0.75, pay = 1.45, out = 1.85;
  const taken = u > grab;
  let w = giftInterior(T, { taken, open: u < 0.35 ? 1 - u / 0.35 : (u > out + 0.3 ? easeOut((u - out - 0.3) / 0.3) : 0), bell: u < 0.5 ? 16 * damp(u, 16, 4) : (u > out + 0.3 ? 16 * damp(u - out - 0.3, 16, 4) : 0) });
  // dependiente tras el mostrador
  const pa = u > pay ? easeOut((u - pay) / 0.2) : 0;
  w += placeFolk(7, 790, 1262, 3.7, { flip: true, expr: u > pay ? 'smile' : 'happy', armF: lerp(-20, -60, pa), armB: 6, bob: breathe(T), head: 2 });
  w += giftCounter({ t: T, drawer: u > pay && u < pay + 0.6 ? Math.sin(clamp((u - pay) / 0.6) * PI) : 0 });
  // caja sobre el mostrador mientras paga
  if (u > pay - 0.15 && u < out) w += giftBox(640, GI.counter, 130, 120, 4, { tag: true });
  // Pedro: entra, coge la caja de la balda baja, paga y sale con la bolsa
  const feet = 1430, psc = 4.3;
  let px, o;
  if (u < grab) {
    px = lerp(170, 440, easeOut(u / 0.55));
    o = Object.assign(p7Walk(u, 0.5, u < 0.55 ? 1 : 0), { jacket: true, expr: 'grin', head: -3 });
    const r = easeOut((u - 0.45) / 0.3);
    if (u > 0.45) o.armF = { ik: [lerp(210, 226, r), lerp(146, 118, r)], side: 1 };
  } else if (u < out) {
    px = 440;
    o = { jacket: true, expr: u > pay ? 'grin' : 'calm', head: -3, bob: breathe(T), legF: 4, legB: -4, armB: { ang: 6, bend: -8 } };
    const v = clamp((u - grab) / 0.5);
    o.armF = u < pay - 0.15 ? { ik: [lerp(226, 236, v), lerp(118, 112, v)], side: 1 } : { ang: -20, bend: -10 };
  } else {
    const v = u - out;
    px = lerp(440, 120, easeInOut(v / 1.0));
    o = Object.assign(p7Walk(v, 0.5, 1), { jacket: true, flip: true, expr: 'grin', head: -4 });
    o.armF = { ang: -14, bend: -30 };
  }
  w += shadowEll(px, feet, 110);
  w += placeP7(px, feet, psc, o);
  const [hx, hy] = p7Hand(px, feet, psc, o);
  if (u >= grab && u < pay - 0.15) w += giftBox(hx + 10, hy + 60, 130, 120, 4, { tag: true }) + handDot(hx, hy, psc);
  if (u >= out - 0.25) w += bagInHand(hx, hy, 0.62, psc, 4 * Math.sin(t * 5));
  if (u > pay && u < pay + 0.8) w += onoma(950, 840, pop(u, pay, 0.3) * (1 - easeOut((u - pay - 0.6) / 0.2)), '¡CLIN!', -10, P7.yel, 80);
  if (u > out - 0.25 && u < out + 0.6) w += sparkle(hx + 60, hy + 40, 28, pop(u, out - 0.2, 0.3));
  return cam(zoomIn(u, 0, 1.1, 0.2), 540, 900, w);
};

/* ---------- 8) El bar con la cuadrilla: entra Pedro con la bolsita, todos se giran y alzan los brazos ---------- */
const CREW = [
  { i: 1, x: 500, feet: 1300, sc: 3.0, face: 1, hat: true },
  { i: 6, x: 720, feet: 1300, sc: 3.0, face: -1 },
  { i: 11, x: 940, feet: 1300, sc: 3.0, face: -1, hat: true },
  { i: 4, x: 400, feet: 1395, sc: 3.45, face: 1 },
  { i: 7, x: 610, feet: 1395, sc: 3.45, face: -1 },
  { i: F_ROSA, x: 820, feet: 1395, sc: 3.45, face: 1 },
  { i: 10, x: 1020, feet: 1395, sc: 3.45, face: -1 }
];
const B8 = { enter: 0.9, turn: 1.55, joy: 2.45 };
S[8] = (t, T) => {
  let w = xmasBarBack(T);
  w += barCounter(1000) + beerTap(305, 990);
  w += stool(-20, 1245, 1620) + stool(1060, 1245, 1620);
  // Pedro en la puerta
  const pu = clamp((t - B8.enter) / 0.6), ppx = lerp(110, 175, easeOut(pu)), pfeet = 1395, psc = 3.8;
  const turned = t > B8.turn, joy = t > B8.joy;
  CREW.forEach((c, n) => {
    const tt = t + n * 0.37, talk = !turned && Math.sin(tt * 9) > 0.2;
    const jw = joy ? easeOut((t - B8.joy - n * 0.03) / 0.25) : 0;
    const flip = turned ? true : c.face < 0;
    const raise = lerp(-48 + 4 * Math.sin(tt * 2), -168, jw);
    const o = { flip, expr: joy ? (n % 2 ? 'sparkle' : 'wow') : (turned ? 'surprise' : (talk ? 'smile' : 'happy')),
      armF: raise + (joy ? 8 * Math.sin(t * 12 + n) : 0), armB: joy ? lerp(10, -160, jw) + 8 * Math.sin(t * 12 + n + 1) : 8, head: turned ? -2 : 2 * Math.sin(tt * 3),
      bob: joy ? -5 * Math.abs(Math.sin(t * 9 + n)) : breathe(T + n), handF: wk => glassItem(wk, 202.5, 139.5, { skin: FOLK[c.i].skin, tilt: joy ? 14 : 0 }),
      front: c.hat ? santaHat : undefined };
    w += shadowEll(c.x, c.feet, 24 * c.sc) + placeFolk(c.i, c.x, c.feet, c.sc, o);
    // «!» de sorpresa al girarse
    if (turned && !joy) w += onoma(c.x + (n % 2 ? 30 : -30), c.feet - 172 * c.sc * (FOLK[c.i].scale || 1), pop(t, B8.turn + n * 0.03, 0.3), '!', 6 * (n % 2 ? 1 : -1), P7.yel, 90);
  });
  // globos de diálogo antes de que entre
  const life = (t0, t1) => pop(t, t0, 0.4) * (1 - easeOut((t - t1) / 0.15));
  w += speech(430, 650, life(0.2, B8.turn), 'dots', 'right', t) + speech(870, 650, life(0.5, B8.turn), 'heart', 'left', t);
  // Pedro con la bolsa (la levanta al llegar)
  if (t > B8.enter - 0.05) {
    const lift = easeOut((t - B8.joy + 0.2) / 0.3);
    const o = Object.assign(t < B8.enter + 0.6 ? p7Walk(t, 0.6, 1) : { bob: breathe(T) }, { jacket: true, expr: joy ? 'grin' : 'calm', head: -3 });
    o.armF = lift > 0 ? { ik: [lerp(212, 224, lift), lerp(146, 74, lift)], side: 1 } : { ang: -10, bend: -20 };
    w += shadowEll(ppx, pfeet, 100) + placeP7(ppx, pfeet, psc, o);
    const [hx, hy] = p7Hand(ppx, pfeet, psc, o);
    w += bagInHand(hx, hy, 0.55, psc, 3 * Math.sin(t * 6));
  }
  // confeti y destellos de alegría
  if (joy) for (let i = 0; i < 16; i++) {
    const u = (t - B8.joy) * (0.8 + hash(i) * 0.5), x = 260 + hash(i * 3.3) * 760 + Math.sin(u * 4 + i) * 30, y = 260 + ((u * 520 + hash(i * 5.1) * 500) % 900);
    w += confetti(x, y, i, t);
  }
  return cam(zoomIn(t, 0, 1.12, 0.22) * bump(t, [B8.turn, B8.joy], 0.03), 540, 1000, w);
};

/* ---------- 9) Se acerca a la cámara, guiña un ojo y levanta la bolsa; «¡Noche salvada!» ---------- */
S[9] = (t, T) => {
  let w = cam(1.35, 540, 900, xmasBarBack(T));
  w += `<rect width="${W}" height="${H}" fill="${P5.warmCream}" opacity="0.35"/>`;
  const a = easeInOut(t / 1.4), sc = lerp(4.6, 10, a), headY = lerp(950, 830, a), px = lerp(560, 420, a);
  const py = headY + 136 * sc;
  const lift = easeOut((t - 1.45) / 0.3);
  const o = Object.assign(t < 1.4 ? p7Walk(t, 0.55, 0.6) : { bob: breathe(T) }, { jacket: true, expr: t > 1.6 ? 'wink' : 'grin', head: t > 1.6 ? -6 : -2 });
  o.armF = lift > 0 ? { ik: [lerp(212, 226, lift), lerp(146, 70, lift)], side: 1 } : { ang: -10, bend: -20 };
  o.armB = { ang: 10, bend: -10 };
  w += placeP7(px, py, sc, o);
  const [hx, hy] = p7Hand(px, py, sc, o);
  w += bagInHand(hx, hy, lerp(0.6, 1.25, a), sc, 3 * Math.sin(t * 5));
  if (t > 1.6) {
    w += sparkle(hx + 190, hy + 40, 40, pop(t, 1.6, 0.35) * (1 + 0.2 * Math.sin(t * 15)));
    w += sparkle(hx - 170, hy + 180, 28, pop(t, 1.7, 0.35) * (1 + 0.2 * Math.sin(t * 13)));
    const [ex, ey] = p7Pt(px, py, sc, 196, 76);
    w += sparkle(ex - 60, ey - 60, 30, pop(t, 1.62, 0.3) * (1 - easeOut((t - 2.2) / 0.2)));
  }
  let s = cam(bump(t, [1.6], 0.04), 540, 900, w);
  const k = pop(t, 1.75, 0.5);
  s += big('¡Noche salvada!', 540, 300, 160, k, lerp(-9, -3, k), { fill: P7.yel });
  return s;
};

/* ---------- 10) Cierre: atardecer, mensaje y web; tarjeta final roja ---------- */
const BIRDS10 = [{ t0: 0.1, d: 3.6, dir: 1, y: 1150, a: 40 }, { t0: 0.9, d: 3.2, dir: -1, y: 1250, a: 32 }, { t0: 1.8, d: 3.0, dir: 1, y: 1330, a: 36 }];
S[10] = (t, T, sc) => {
  const cut = (sc && sc.cut) || 4;
  if (t < cut) {
    let s = xmasSky(T, { b1: 560, b2: 1000, sx: 830, sy: 1190, sr: 82, clouds: [
      { x0: 40, y: 240, s: 0.62, v: 14 }, { x0: 760, y: 1060, s: 0.7, v: 22 }, { x0: 1250, y: 560, s: 0.8, v: 17 },
      { x0: 1650, y: 300, s: 0.55, v: 10 }, { x0: 480, y: 1290, s: 0.5, v: 8 }] });
    s += lampPost(70, 1400, 420) + lampPost(1010, 1400, 420) + garland(70, 980, 1010, 980, 80, T, 11);
    s += xmasTree(560, 1400, 330, T, {});
    s += ground(1400, 0, { sp: 230 });
    BIRDS10.forEach((b, i) => {
      const u = (t - b.t0) / b.d;
      if (u < 0 || u > 1) return;
      const x = b.dir > 0 ? lerp(-90, W + 90, u) : lerp(W + 90, -90, u);
      s += bird(x, Math.min(1360, b.y + Math.sin(u * 7 + i) * 14), b.a, 0.35 + 0.65 * Math.sin(t * 2 * PI / 0.34 + i * 2));
    });
    const k1 = pop(t, 0.15, 0.5), k2 = pop(t, 0.3, 0.5), k3 = pop(t, 0.45, 0.5);
    s += big('Las mejores', 540, 300, 150, k1, lerp(-8, -3, k1));
    s += big('ofertas', 540, 450, 160, k2, lerp(8, 2, k2), { fill: P7.yel });
    s += big('de Tudela', 540, 600, 150, k3, lerp(-6, -2, k3));
    const ks = pop(t, 0.8, 0.6), url = 'escaparatetudela.es';
    const pulse = t > 1.8 ? 1 + 0.03 * Math.sin((t - 1.8) * 2 * PI / 1.1) : 1;
    let st = `<rect x="-640" y="-88" width="1280" height="176" transform="translate(0 14)" fill="${INK}"/><rect x="-640" y="-88" width="1280" height="176" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
    st += at(0, 0, pulse, text(url, 0, 2, { size: fit(url, 112, 940), sw: SW * 2, sd: 6 }));
    s += `<g transform="translate(${f(540 + (1 - ks) * -1500)} 790) rotate(-3)">${st}</g>`;
    const k4 = pop(t, 1.3, 0.5);
    s += at(540, 945, k4, `<rect x="-330" y="-48" width="660" height="96" rx="48" transform="translate(9 9)" fill="${INK}"/><rect x="-330" y="-48" width="660" height="96" rx="48" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>` +
      text('Enlace en la descripción', 0, 2, { size: fit('Enlace en la descripción', 60, 600), fill: INK, stroke: null }));
    s += sparkle(110, 700, 32, pop(t, 0.9, 0.4) * (1 + 0.2 * Math.sin(t * 15)));
    s += sparkle(975, 620, 26, pop(t, 1.0, 0.4) * (1 + 0.2 * Math.sin(t * 13 + 1)));
    return cam(zoomIn(t, 0, 1.1, 0.2), 540, 800, s);
  }
  // tarjeta final: fondo rojo, logo blanco, «Escaparate de Tudela» y la web
  const u = t - cut;
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 640, 16, t * 8, '#C62828');
  const kl = pop(u, 0, 0.45), bob = 6 * Math.sin(u * 3);
  s += logoBadge(540, 620 + bob, 700, lerp(-10, 0, kl), kl, 'logoW');
  s += big('Escaparate de Tudela', 540, 1090, 104, pop(u, 0.15, 0.45), 0);
  const url = 'escaparatetudela.es', us = fit(url, 78, 720);
  s += at(540, 1250, pop(u, 0.3, 0.45), `<rect x="-400" y="-58" width="800" height="116" rx="58" transform="translate(10 10)" fill="${INK}"/><rect x="-400" y="-58" width="800" height="116" rx="58" fill="${C.dred}" stroke="${INK}" stroke-width="${f(SW)}"/>` + text(url, 0, 2, { size: us, sw: SW * 1.8, sd: 5 }));
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
  for (const [id, url] of logos) {
    const img = new Image(); img.src = url; await img.decode();
    const el = document.createElementNS(ns, 'image');
    // los PNG (1000x1000) se dibujan en un cuadro de 500 para mantener las coordenadas de recorte de la serie
    el.setAttribute('id', id); el.setAttribute('width', '500'); el.setAttribute('height', '500');
    el.setAttribute('href', url);
    defs.appendChild(el);
  }
  return true;
};
window.renderFrame = function (sceneId, t, T) {
  uid = 0;
  const sc = CFG.scenes.find(s => s.id === sceneId);
  document.getElementById('dyn').innerHTML = S[sceneId](t, T, sc);
};
