/* Vídeo 02 — «Marta y el último 2x1».
   Escenas nuevas sobre la biblioteca común (src/lib.js). Todo se calcula a partir de (t local, T global). */
'use strict';

const SKY_RAIN = '#C9D6DF', CLOUD_G = '#AEBBC6', DOT = '#F2B5AD', RAIN = '#7FA9C9';
const SC = 5.2, FOOT = 1446; // escala y línea de pies de los personajes en la calle
SHOP_TYPES[1] = SHOE_SHOP;    // la zapatería «TUS PIES» del vídeo 01 aparece en la calle

/* ---------- utilidades de cámara y marcas ---------- */
function cam(z, cx, cy, inner, dx = 0, dy = 0) {
  if (Math.abs(z - 1) < 1e-4 && !dx && !dy) return inner;
  return `<g transform="translate(${f(cx + dx)} ${f(cy + dy)}) scale(${f(z)}) translate(${f(-cx)} ${f(-cy)})">${inner}</g>`;
}
const zoomIn = (t, t0 = 0, from = 1.12, d = 0.22) => lerp(from, 1, easeOut((t - t0) / d));
function mark(ch, x, y, k, rot, size = 190, fill = C.red) {
  return at(x, y, k, text(ch, 0, 0, { size, font: 'G', fill, sw: SW * 2.2, sd: 9 }), rot);
}
function shadowEll(x, y, rx) { return `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(rx * 0.13)}" fill="${INK}" opacity="0.18"/>`; }
function puff(x, y, r, k) {
  if (k <= 0.01) return '';
  return at(x, y, k, `<circle r="${f(r)}" fill="${C.cream}" stroke="${INK}" stroke-width="${f(SW)}"/><circle cx="${f(-r * 0.25)}" cy="${f(-r * 0.25)}" r="${f(r * 0.28)}" fill="#FFFFFF"/>`);
}
function logoIcon(cx, cy, size, which = 'logoR') {
  const h = size / 2; // recorte del icono (móvil + toldo + etiqueta %) del PNG del logo
  return `<svg x="${f(cx - h)}" y="${f(cy - h)}" width="${f(size)}" height="${f(size)}" viewBox="150 72 200 200"><use href="#${which}"/></svg>`;
}

/* ---------- cielo con lluvia ---------- */
const GRAY_CLOUDS = [
  { x0: 120, y: 250, s: 1.25, v: 22 }, { x0: 700, y: 330, s: 1.55, v: 30 },
  { x0: 420, y: 470, s: 1.05, v: 16 }, { x0: 1050, y: 200, s: 1.1, v: 26 }, { x0: 1500, y: 430, s: 1.3, v: 19 }
];
function grayClouds(T, yOff = 0, spread = 0) {
  let s = '';
  const span = W + 900;
  GRAY_CLOUDS.forEach(c => {
    let x = (((c.x0 - c.v * T) % span) + span) % span - 420;
    const cxp = x + 64 * c.s;
    x += (cxp < W / 2 ? -1 : 1) * spread;
    s += cloud(x, c.y + yOff, c.s, CLOUD_G);
  });
  return s;
}
function rain(T, x, y, w, h, n, o = {}) {
  const len = o.len || 54, v = o.v || 1700, sl = 0.22, amt = o.amount === undefined ? 1 : o.amount;
  let s = '';
  for (let i = 0; i < n; i++) {
    if (hash(i * 9.13 + 1) > amt) continue;
    const sp = v * (0.85 + 0.3 * hash(i * 5.3)), L = h + len * 2;
    const yy = y - len + ((((hash(i * 2.9) * L + sp * T) % L) + L) % L);
    const xx = x + hash(i * 1.7) * (w + 120) - (yy - y) * sl;
    s += `<line x1="${f(xx)}" y1="${f(yy)}" x2="${f(xx - len * sl)}" y2="${f(yy + len)}"/>`;
  }
  return `<g stroke="${o.col || RAIN}" stroke-width="${f(o.sw || SW * 0.55)}" stroke-linecap="round">${s}</g>`;
}
function skyRain(T, o = {}) {
  return `<rect width="${W}" height="${H}" fill="${SKY_RAIN}"/>` + grayClouds(T, o.yOff || 0);
}
/* ---------- cielo despejado ---------- */
function sun(x, y, r, rot, k = 1) {
  let rays_ = '';
  for (let i = 0; i < 12; i++) {
    const a = (rot + i * 30) * PI / 180, a1 = a - 0.11, a2 = a + 0.11;
    const r1 = r * 1.18, r2 = r * (i % 2 ? 1.55 : 1.75);
    rays_ += `<path d="M${f(Math.cos(a1) * r1)} ${f(Math.sin(a1) * r1)} L${f(Math.cos(a) * r2)} ${f(Math.sin(a) * r2)} L${f(Math.cos(a2) * r1)} ${f(Math.sin(a2) * r1)}Z"/>`;
  }
  return at(x, y, k, `<g fill="${C.yel || '#F2C12E'}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round">${rays_}</g>
    <circle cx="8" cy="8" r="${r}" fill="${INK}"/><circle r="${r}" fill="#F2C12E" stroke="${INK}" stroke-width="${f(SW)}"/>
    <path d="M${f(-r * 0.55)} ${f(-r * 0.2)} A${f(r * 0.6)} ${f(r * 0.6)} 0 0 1 ${f(-r * 0.15)} ${f(-r * 0.58)}" stroke="#FFFFFF" stroke-width="${f(SW * 1.1)}" fill="none" stroke-linecap="round"/>`);
}
const WHITE_CLOUDS = [
  { x0: 80, y: 250, s: 0.8, v: 14 }, { x0: 560, y: 400, s: 1.0, v: 24 }, { x0: 980, y: 300, s: 0.65, v: 9 },
  { x0: 1350, y: 460, s: 0.9, v: 18 }, { x0: 1700, y: 220, s: 0.7, v: 12 }
];
function whiteClouds(T, list = WHITE_CLOUDS) {
  let s = '';
  const span = W + 900;
  list.forEach(c => { const x = (((c.x0 - c.v * T) % span) + span) % span - 420; s += cloud(x, c.y, c.s); });
  return s;
}
function skyClear(T, o = {}) {
  let s = `<rect width="${W}" height="${H}" fill="${C.sky}"/><rect y="${o.band || 400}" width="${W}" height="${H}" fill="${C.skyL}"/>`;
  if (o.sun !== false) s += sun(o.sx || 905, o.sy || 300, o.sr || 72, T * 12);
  s += whiteClouds(T, o.clouds);
  return s;
}

/* ---------- suelo mojado ---------- */
function groundWet(y0, off, o = {}) {
  let s = ground(y0, off, { sp: 220, curb: 1600 });
  const sp = 760, start = -(((off % sp) + sp) % sp);
  for (let x = start - sp; x < W + sp; x += sp) {
    // charcos planos con reflejo
    s += `<ellipse cx="${f(x + 240)}" cy="1528" rx="150" ry="26" fill="${C.glass}" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
    s += `<path d="M${f(x + 160)} 1524 H${f(x + 230)} M${f(x + 260)} 1532 H${f(x + 300)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" stroke-linecap="round"/>`;
    s += `<ellipse cx="${f(x + 600)}" cy="1380" rx="95" ry="16" fill="${C.glass}" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
    s += `<path d="M${f(x + 555)} 1378 H${f(x + 610)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.7)}" stroke-linecap="round"/>`;
  }
  // reflejos planos (rayas claras)
  const sp2 = 300, st2 = -(((off * 1.0 % sp2) + sp2) % sp2);
  for (let x = st2 - sp2; x < W + sp2; x += sp2) {
    s += `<path d="M${f(x)} ${y0 + 34} H${f(x + 120)} M${f(x + 60)} ${y0 + 70} H${f(x + 150)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.9)}" stroke-linecap="round" opacity="${o.dry ? 0.35 : 0.7}"/>`;
  }
  return s;
}

/* ---------- salón (escenas 1-3) ---------- */
const WIN = { x: 170, y: 330, w: 740, h: 640 };
function room(T, o = {}) {
  const id = 'dots' + (uid++), cid = 'win' + (uid++);
  let s = `<defs><pattern id="${id}" width="${f(10 * W / 380)}" height="${f(10 * W / 380)}" patternUnits="userSpaceOnUse"><circle cx="${f(5 * W / 380)}" cy="${f(5 * W / 380)}" r="${f(1.4 * W / 380)}" fill="${DOT}"/></pattern></defs>`;
  s += `<rect width="${W}" height="${H}" fill="${C.cream}"/><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
  const { x, y, w, h } = WIN;
  // ventana: marco, cielo gris, nubes y lluvia
  s += `<rect x="${x - 26 + 12}" y="${y - 26 + 12}" width="${w + 52}" height="${h + 52}" rx="18" fill="${INK}"/>`;
  s += `<rect x="${x - 26}" y="${y - 26}" width="${w + 52}" height="${h + 52}" rx="18" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<clipPath id="${cid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/></clipPath>`;
  s += `<g clip-path="url(#${cid})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${SKY_RAIN}"/>`;
  s += `<g transform="translate(${x} ${y + 40}) scale(0.72)">${grayClouds(T)}</g>`;
  // tejados lejanos
  s += `<path d="M${x} ${y + h - 120} h140 v-60 h120 v80 h150 v-110 h130 v90 h200 V${y + h} H${x}Z" fill="${CLOUD_G}" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linejoin="round"/>`;
  s += rain(T, x - 60, y - 20, w + 60, h + 40, 46, { len: 46 });
  s += `</g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<rect x="${x + w / 2 - 12}" y="${y}" width="24" height="${h}" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  s += `<rect x="${x}" y="${y + h * 0.42 - 12}" width="${w}" height="24" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  s += `<rect x="${x - 50}" y="${y + h + 18}" width="${w + 100}" height="38" rx="10" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  // cortinas y barra
  const curtain = (x0, dir) => {
    const x1 = x0 + 150 * dir;
    let c = `<path d="M${x0} 300 L${x1} 300 Q${x1 - 30 * dir} 700 ${x1 - 10 * dir} 1040 Q${x0 + 110 * dir} 1060 ${x0 + 75 * dir} 1040 Q${x0 + 40 * dir} 1062 ${x0} 1040 Z" fill="${C.red}"/>`;
    c += `<path d="M${x0 + 45 * dir} 300 L${x0 + 72 * dir} 300 L${x0 + 66 * dir} 1048 L${x0 + 40 * dir} 1046Z" fill="#A32323"/>`;
    c += `<path d="M${x0} 300 L${x1} 300 Q${x1 - 30 * dir} 700 ${x1 - 10 * dir} 1040 Q${x0 + 110 * dir} 1060 ${x0 + 75 * dir} 1040 Q${x0 + 40 * dir} 1062 ${x0} 1040 Z" fill="none" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
    return c;
  };
  s += curtain(95, 1) + curtain(985, -1);
  s += `<rect x="70" y="280" width="940" height="22" rx="11" fill="${C.navy}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<circle cx="70" cy="291" r="20" fill="${C.navy}" stroke="${INK}" stroke-width="${f(SW)}"/><circle cx="1010" cy="291" r="20" fill="${C.navy}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  // suelo
  s += `<rect x="-20" y="1480" width="${W + 40}" height="${H - 1460}" fill="${C.skinS}"/>`;
  for (let i = 0; i < 6; i++) s += `<line x1="${-40 + i * 230}" y1="1480" x2="${-160 + i * 230}" y2="${H}" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/>`;
  s += `<line x1="-20" y1="1480" x2="${W + 20}" y2="1480" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += sofa();
  return s;
}
function sofa() {
  const st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  let s = '';
  s += `<rect x="190" y="1430" width="26" height="54" rx="6" fill="${INK}"/><rect x="866" y="1430" width="26" height="54" rx="6" fill="${INK}"/>`;
  s += `<rect x="122" y="972" width="860" height="300" rx="70" fill="${INK}"/>`;
  s += `<rect x="110" y="960" width="860" height="300" rx="70" fill="${C.red}" ${st}/>`;
  [[150, 1000], [550, 1000]].forEach(([x, y]) => {
    s += `<rect x="${x}" y="${y}" width="380" height="230" rx="46" fill="${C.red}" ${st}/>`;
    s += `<path d="M${x + 10} ${y + 40} Q${x + 8} ${y + 120} ${x + 14} ${y + 200} L${x + 40} ${y + 210} Q${x + 30} ${y + 120} ${x + 36} ${y + 30}Z" fill="#A32323"/>`;
  });
  s += `<rect x="130" y="1280" width="820" height="160" rx="26" fill="#A32323" ${st}/>`;
  s += `<rect x="150" y="1200" width="780" height="96" rx="32" fill="${C.red}" ${st}/>`;
  s += `<line x1="540" y1="1206" x2="540" y2="1290" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  [[52, 1], [888, -1]].forEach(([x]) => {
    s += `<rect x="${x + 10}" y="1112" width="140" height="340" rx="60" fill="${INK}"/>`;
    s += `<rect x="${x}" y="1100" width="140" height="340" rx="60" fill="${C.red}" ${st}/>`;
    s += `<rect x="${x + 14}" y="1180" width="26" height="240" rx="13" fill="#A32323"/>`;
  });
  return s;
}
// Marta sentada (sc 4.6, suelo del salón y=1480)
const SIT = { x: 470, y: 1480, sc: 4.6 };
function phoneInHand(rot = -18, shake = 0) {
  return w => `<g transform="translate(${f(shake)} 0) rotate(${f(rot)} 206 133)"><rect x="199" y="119" width="14" height="24" rx="3" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/><rect x="201" y="121.6" width="10" height="18.4" rx="1.5" fill="${C.glass}"/></g>` + hand(202.5, 140, w);
}

/* ---------- reloj (analógico + digital) ---------- */
function clockFace(r, min, red) {
  let s = `<circle cx="${-r * 0.62}" cy="${-r * 0.86}" r="${f(r * 0.3)}" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW)}"/>
    <circle cx="${r * 0.62}" cy="${-r * 0.86}" r="${f(r * 0.3)}" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW)}"/>
    <path d="M${f(-r * 0.6)} ${f(r * 0.8)} L${f(-r * 0.8)} ${f(r * 1.08)} M${f(r * 0.6)} ${f(r * 0.8)} L${f(r * 0.8)} ${f(r * 1.08)}" stroke="${INK}" stroke-width="${f(SW * 1.4)}" stroke-linecap="round"/>
    <circle cx="9" cy="9" r="${r}" fill="${INK}"/>
    <circle r="${r}" fill="${red ? C.red : C.cream}" stroke="${INK}" stroke-width="${f(SW)}"/>
    <circle r="${f(r * 0.8)}" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
  for (let i = 0; i < 12; i++) {
    const a = i * PI / 6, r1 = r * (i % 3 ? 0.68 : 0.6), r2 = r * 0.74;
    s += `<line x1="${f(Math.sin(a) * r1)}" y1="${f(-Math.cos(a) * r1)}" x2="${f(Math.sin(a) * r2)}" y2="${f(-Math.cos(a) * r2)}" stroke="${INK}" stroke-width="${f(SW * (i % 3 ? 0.6 : 1))}" stroke-linecap="round"/>`;
  }
  const am = min / 60 * 2 * PI, ah = (1 + min / 60) / 12 * 2 * PI;
  s += `<line x1="0" y1="0" x2="${f(Math.sin(ah) * r * 0.4)}" y2="${f(-Math.cos(ah) * r * 0.4)}" stroke="${INK}" stroke-width="${f(SW * 1.5)}" stroke-linecap="round"/>`;
  s += `<line x1="0" y1="0" x2="${f(Math.sin(am) * r * 0.62)}" y2="${f(-Math.cos(am) * r * 0.62)}" stroke="${C.red}" stroke-width="${f(SW * 1.1)}" stroke-linecap="round"/>`;
  s += `<circle r="${f(r * 0.08)}" fill="${INK}"/>`;
  return s;
}
function timeStr(min) { const m = Math.min(60, Math.floor(min + 1e-6)); return m >= 60 ? '14:00' : '13:' + String(m).padStart(2, '0'); }
function digital(w, h, min, red) {
  return panel(-w / 2, -h / 2, w, h, h * 0.3, INK, 9) +
    text(timeStr(min), 0, h * 0.04, { size: h * 0.8, font: 'G', fill: red ? C.red : '#FFFFFF', stroke: red ? '#FFFFFF' : null, sw: SW * 0.8, shadow: false, ls: 2 });
}
C.yel = '#F2C12E';

/* ---------- tarjeta de notificación ---------- */
function notifCard(w, h) {
  let s = panel(-w / 2, -h / 2, w, h, 44, '#FFFFFF', 12);
  const ix = -w / 2 + 30, isz = h - 60;
  s += `<rect x="${f(ix)}" y="${f(-isz / 2)}" width="${f(isz)}" height="${f(isz)}" rx="34" fill="${C.cream}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  s += logoIcon(ix + isz / 2, 0, isz * 0.92);
  const tx = ix + isz + 30, tw = w / 2 - tx - 30;
  s += text('Escaparate de Tudela', tx, -h * 0.27, { size: fit('Escaparate de Tudela', 50, tw), anchor: 'start', fill: INK, stroke: null });
  s += text('¡Termina hoy!', tx, h * 0.03, { size: fit('¡Termina hoy!', 60, tw), anchor: 'start', fill: C.red, stroke: null });
  s += text('2x1 en pasteles', tx, h * 0.29, { size: fit('2x1 en pasteles', 58, tw), anchor: 'start', fill: INK, stroke: null });
  return s;
}

/* ---------- panadería ---------- */
const PITEMS = {
  cake: sw => `<rect x="18" y="56" width="64" height="36" rx="5" fill="${C.pink}" stroke="${INK}" stroke-width="${sw}"/>
    <rect x="18" y="70" width="64" height="7" fill="${C.cream}" stroke="${INK}" stroke-width="${sw * 0.6}"/>
    <path d="M14 58 Q14 44 30 44 H70 Q86 44 86 58 Q78 64 70 58 Q62 66 54 58 Q46 66 38 58 Q30 66 22 58 Q18 62 14 58Z" fill="${C.cream}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>
    <circle cx="50" cy="36" r="8" fill="${C.red}" stroke="${INK}" stroke-width="${sw}"/><path d="M50 28 Q54 20 60 18" stroke="${INK}" stroke-width="${sw * 0.7}" fill="none" stroke-linecap="round"/>
    <path d="M6 94 H94" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>`,
  cupcake: sw => ICONS.cupcake(sw) + `<path d="M10 92 H90" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>`,
  croissant: sw => `<path d="M8 74 Q20 44 50 42 Q80 44 92 74 Q80 70 74 78 Q62 64 50 66 Q38 64 26 78 Q20 70 8 74Z" fill="${C.skinS}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M30 52 Q36 62 34 72 M50 44 V64 M70 52 Q64 62 66 72" stroke="${INK}" stroke-width="${sw * 0.7}" fill="none" stroke-linecap="round"/>
    <path d="M6 92 H94" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>`
};
function bakeryGeo(x, base, w, h) {
  const top = base - h, ay = top + 0.2 * h, ah = 0.15 * h;
  const wy = ay + ah + (w * 1.06 / 8) / 2 + 0.035 * h;
  const door = { x: x + 0.56 * w, w: 0.34 * w, y: wy - 0.01 * h };
  const sw = 0.47 * w, sh = sw * 0.6;
  const sign = { cx: door.x + door.w / 2, cy: wy + 0.33 * (base - wy), w: sw, h: sh };
  return { x, w, h, base, top, ay, ah, wy, door, sign };
}
function doorSign(sw, sh, flip, shake = 0) {
  const sx = Math.max(0.02, Math.abs(Math.cos(PI * clamp(flip))));
  const closed = flip >= 0.5;
  let c = `<rect x="${f(-sw / 2 + 8)}" y="${f(-sh / 2 + 8)}" width="${f(sw)}" height="${f(sh)}" rx="18" fill="${INK}"/>`;
  c += `<rect x="${f(-sw / 2)}" y="${f(-sh / 2)}" width="${f(sw)}" height="${f(sh)}" rx="18" fill="${closed ? C.red : C.cream}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  c += `<circle cx="0" cy="${f(-sh / 2 + 16)}" r="7" fill="${INK}"/>`;
  if (!closed) {
    c += text('ABIERTO', 0, -sh * 0.15, { size: fit('ABIERTO', sh * 0.42, sw * 0.86), fill: C.green, sw: SW * 1.5, sd: 4 });
    c += `<line x1="${f(-sw * 0.38)}" y1="${f(sh * 0.1)}" x2="${f(sw * 0.38)}" y2="${f(sh * 0.1)}" stroke="${INK}" stroke-width="${f(SW * 0.5)}" stroke-dasharray="10 9" stroke-linecap="round"/>`;
    c += text('2x1 en pasteles', 0, sh * 0.29, { size: fit('2x1 en pasteles', sh * 0.27, sw * 0.88), fill: C.red, stroke: null });
  } else {
    c += text('CERRADO', 0, -sh * 0.15, { size: fit('CERRADO', sh * 0.42, sw * 0.86), fill: '#FFFFFF', sw: SW * 1.5, sd: 4 });
    c += `<rect x="${f(-sw * 0.4)}" y="${f(sh * 0.1)}" width="${f(sw * 0.8)}" height="${f(sh * 0.32)}" rx="10" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW * 0.8)}" transform="rotate(-3)"/>`;
    c += text('AGOTADO', 0, sh * 0.265, { size: fit('AGOTADO', sh * 0.26, sw * 0.7), fill: INK, stroke: null, font: 'G', ls: 2 });
  }
  return `<g transform="rotate(${f(shake)} 0 ${f(-sh / 2 - 46)}) scale(${f(sx)} 1)">${c}</g>`;
}
function bakery(g, o = {}) {
  const { x, w, h, base, top, ay, ah, wy, door } = g;
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}"`;
  let s = '';
  s += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="${C.cream}"/>`;
  s += `<rect x="${f(x + w * 0.9)}" y="${f(top + w * 0.02)}" width="${f(w * 0.1)}" height="${f(h + 30)}" fill="${INK}" opacity="0.16"/>`;
  s += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="none" ${st()}/>`;
  // rótulo PANADERÍA (letras crema sobre rojo oscuro)
  const py = top + h * 0.04, ph = h * 0.125, pw = w * 0.84;
  s += `<rect x="${f(x + (w - pw) / 2 + 9)}" y="${f(py + 9)}" width="${f(pw)}" height="${f(ph)}" rx="${f(ph * 0.25)}" fill="${INK}"/>`;
  s += `<rect x="${f(x + (w - pw) / 2)}" y="${f(py)}" width="${f(pw)}" height="${f(ph)}" rx="${f(ph * 0.25)}" fill="${C.dred}" ${st()}/>`;
  s += text('PANADERÍA', x + w / 2, py + ph * 0.56, { size: fit('PANADERÍA', ph * 0.72, pw * 0.86), fill: C.cream, sw: SW * 1.4, sd: 4, ls: 3 });
  s += awning(x + w * 0.04, x + w * 0.96, x - w * 0.03, x + w * 1.03, ay, ah, 8);
  // escaparate con pasteles
  const wx = x + w * 0.05, ww = w * 0.44, wh = base - h * 0.09 - wy;
  s += glassWindow(wx, wy, ww, wh, (X, Y, Wd, Hd) => {
    let it = `<line x1="${f(X)}" y1="${f(Y + Hd * 0.5)}" x2="${f(X + Wd)}" y2="${f(Y + Hd * 0.5)}" ${st(0.8)}/>`;
    it += unitBox(X + Wd * 0.02, Y + Hd * 0.06, Wd * 0.5, Hd * 0.44, PITEMS.cake, 0.95);
    it += unitBox(X + Wd * 0.5, Y + Hd * 0.1, Wd * 0.46, Hd * 0.4, PITEMS.cupcake, 0.95);
    it += unitBox(X + Wd * 0.02, Y + Hd * 0.56, Wd * 0.34, Hd * 0.42, PITEMS.croissant, 0.95);
    it += unitBox(X + Wd * 0.34, Y + Hd * 0.56, Wd * 0.32, Hd * 0.42, PITEMS.cupcake, 0.9);
    it += unitBox(X + Wd * 0.64, Y + Hd * 0.56, Wd * 0.34, Hd * 0.42, PITEMS.croissant, 0.95);
    return it;
  });
  s += `<rect x="${f(wx - w * 0.02)}" y="${f(wy + wh)}" width="${f(ww + w * 0.04)}" height="${f(h * 0.03)}" rx="4" fill="#FFFFFF" ${st()}/>`;
  // puerta (con apertura opcional)
  const open = clamp(o.open || 0);
  const dh = base - door.y + 10;
  if (open > 0) {
    s += `<rect x="${f(door.x)}" y="${f(door.y)}" width="${f(door.w)}" height="${f(dh)}" rx="${f(door.w * 0.06)}" fill="${C.dred}" ${st()}/>`;
    s += `<rect x="${f(door.x + door.w * 0.1)}" y="${f(door.y + dh * 0.62)}" width="${f(door.w * 0.8)}" height="${f(dh * 0.12)}" fill="#A32323"/>`;
  }
  const lw = door.w * (1 - 0.82 * open);
  s += `<path d="M${f(door.x)} ${f(door.y)} L${f(door.x + lw)} ${f(door.y + 18 * open)} L${f(door.x + lw)} ${f(door.y + dh - 18 * open)} L${f(door.x)} ${f(door.y + dh)}Z" fill="${C.navy}" ${st()} stroke-linejoin="round"/>`;
  s += `<rect x="${f(door.x + lw * 0.14)}" y="${f(door.y + door.w * 0.14)}" width="${f(lw * 0.72)}" height="${f(dh * 0.5)}" rx="${f(door.w * 0.05)}" fill="${C.glass}" ${st(0.8)}/>`;
  s += `<circle cx="${f(door.x + lw * 0.86)}" cy="${f(door.y + dh * 0.62)}" r="${f(door.w * 0.045)}" fill="${C.yel}" ${st(0.7)}/>`;
  // campanilla
  const bx = door.x + door.w * 0.86, by = door.y - 4, br = w * 0.034;
  s += `<path d="M${f(bx - 30)} ${f(by - 14)} H${f(bx)} V${f(by)}" fill="none" ${st(0.9)} stroke-linecap="round"/>`;
  s += `<g transform="translate(${f(bx)} ${f(by)}) rotate(${f(o.bell || 0)})"><circle cx="0" cy="${f(br * 1.55)}" r="${f(br * 0.32)}" fill="${C.dred}" ${st(0.6)}/><path d="M${f(-br)} ${f(br * 1.35)} Q${f(-br)} 0 0 0 Q${f(br)} 0 ${f(br)} ${f(br * 1.35)} Z" fill="${C.yel}" ${st(0.8)} stroke-linejoin="round"/></g>`;
  // cartel de dos caras colgado en el cristal
  if (open < 0.3) {
    const sg = g.sign;
    const nailY = sg.cy - sg.h / 2 - 46;
    s += `<circle cx="${f(sg.cx)}" cy="${f(nailY)}" r="7" fill="${INK}"/>`;
    const sxs = Math.max(0.02, Math.abs(Math.cos(PI * clamp(o.flip || 0))));
    s += `<path d="M${f(sg.cx - sg.w * 0.3 * sxs)} ${f(sg.cy - sg.h / 2 + 4)} L${f(sg.cx)} ${f(nailY)} L${f(sg.cx + sg.w * 0.3 * sxs)} ${f(sg.cy - sg.h / 2 + 4)}" fill="none" ${st(0.6)}/>`;
    s += `<g transform="translate(${f(sg.cx)} ${f(sg.cy)})">${doorSign(sg.w, sg.h, o.flip || 0, o.signShake || 0)}</g>`;
  }
  return s;
}
// calle con panadería: tiendas genéricas a los lados (mundo desplazado dx)
function bakeryStreet(g, dx, o = {}) {
  let s = '';
  const sw = 440, gap = 50, sh = 780;
  for (let i = 1; i <= 4; i++) s += shop(g.x - i * (sw + gap) + dx, g.base, sw, sh, SHOP_TYPES[(i + 1) % 4]);
  s += shop(g.x + g.w + gap + dx, g.base, sw, sh, SHOP_TYPES[0]);
  const gg = Object.assign({}, g, { x: g.x + dx, door: Object.assign({}, g.door, { x: g.door.x + dx }), sign: Object.assign({}, g.sign, { cx: g.sign.cx + dx }) });
  s += bakery(gg, o);
  return s;
}

/* ---------- nubecita gris, nube de pensamiento ---------- */
function sadCloud(x, y, k, t) {
  if (k <= 0.01) return '';
  let s = cloud(-64, 0, 0.62, CLOUD_G);
  for (let i = 0; i < 4; i++) {
    const u = ((t * 1.6 + i * 0.25) % 1);
    const xx = -20 + i * 40, yy = 40 + u * 110;
    s += `<path d="M${xx} ${f(yy)} q7 12 0 18 q-7 -6 0 -18z" fill="${C.glass}" stroke="${INK}" stroke-width="${f(SW * 0.6)}" opacity="${f(1 - u * 0.6)}"/>`;
  }
  return at(x, y, k, s);
}
function thoughtCloud(cx, cy, rw, rh, k) {
  if (k <= 0.01) return '';
  const N = 11;
  let a = '', b = '';
  for (let i = 0; i < N; i++) {
    const ang = i / N * 2 * PI, r = 0.3 * Math.min(rw, rh) + 10 * (i % 2);
    const x = Math.cos(ang) * rw * 0.82, y = Math.sin(ang) * rh * 0.8;
    a += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;
  }
  b = `<ellipse rx="${f(rw * 0.86)}" ry="${f(rh * 0.84)}"/>`;
  const shape = a + b;
  return at(cx, cy, k, `<g transform="translate(10 10)" fill="${INK}" stroke="${INK}" stroke-width="${f(SW * 2)}">${shape}</g><g fill="${INK}" stroke="${INK}" stroke-width="${f(SW * 2)}">${shape}</g><g fill="#FFFFFF">${shape}</g>`);
}

/* ---------- pantalla del canal (móvil grande) ---------- */
function channelPhone(X, Y, PW, PH, t) {
  const R = 64, b = 22, sx = X + b, sy = Y + b, sw_ = PW - 2 * b, sh = PH - 2 * b;
  const id = 'ch' + (uid++);
  let g = `<rect x="${X + 18}" y="${Y + 18}" width="${PW}" height="${PH}" rx="${R}" fill="${C.blueS}"/>`;
  g += `<rect x="${X}" y="${Y}" width="${PW}" height="${PH}" rx="${R}" fill="${INK}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  g += `<clipPath id="${id}"><rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="${R - b}"/></clipPath>`;
  let sc = `<rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" fill="${C.cream}"/>`;
  const hh = 170;
  sc += `<rect x="${sx}" y="${sy}" width="${sw_}" height="${hh}" fill="${C.red}"/><line x1="${sx}" y1="${sy + hh}" x2="${sx + sw_}" y2="${sy + hh}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  sc += `<circle cx="${sx + 82}" cy="${sy + hh / 2 + 4}" r="58" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>` + logoIcon(sx + 82, sy + hh / 2 + 6, 104);
  const tw = sw_ - 170;
  sc += text('Escaparate', sx + 158, sy + hh / 2 - 22, { size: fit('Escaparate', 52, tw), anchor: 'start', sw: SW * 1.4, sd: 4 });
  sc += text('de Tudela', sx + 158, sy + hh / 2 + 34, { size: fit('Escaparate', 52, tw), anchor: 'start', sw: SW * 1.4, sd: 4 });
  const msgs = [['¡Termina hoy!', '2x1 en pasteles'], ['Ofertas flash', 'de tus tiendas'], ['Novedades', 'y eventos']];
  const mh = 168, gap = 26, my0 = sy + hh + 34;
  msgs.forEach((m, i) => {
    const k = pop(t, 0.55 + i * 0.4, 0.5);
    if (k <= 0) return;
    const yy = my0 + i * (mh + gap) + (1 - k) * 500;
    let cd = panel(sx + 18, yy, sw_ - 36, mh, 30, '#FFFFFF', 9);
    cd += sealPct(sx + 82, yy + mh / 2, 44, pop(t, 0.75 + i * 0.4, 0.45));
    const tx = sx + 146, mw = sw_ - 36 - 146;
    cd += text(m[0], tx, yy + mh * 0.32, { size: fit(m[0], 46, mw), anchor: 'start', fill: INK, stroke: null });
    cd += text(m[1], tx, yy + mh * 0.7, { size: fit(m[1], 42, mw), anchor: 'start', fill: C.red, stroke: null });
    sc += cd;
  });
  g += `<g clip-path="url(#${id})">${sc}</g>`;
  g += `<rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="${R - b}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  g += `<rect x="${X + PW / 2 - 50}" y="${Y + 8}" width="100" height="10" rx="5" fill="#3A3434"/>`;
  return g;
}

/* =================== ESCENAS =================== */
const S = {};

// 1) Salón: Marta aburrida en el sofá, lluvia en la ventana. «Sábado»
S[1] = (t, T) => {
  let w = room(T);
  const breathe = Math.sin(t * 2.2);
  w += placeMarta(SIT.x, SIT.y, 190, 200, SIT.sc, {
    sit: true, expr: 'bored', look: [0.8, 1.3], head: 6 + 2 * breathe, armF: -70, armB: -30, pony: 4 * breathe,
    bob: 0.6 * breathe, handF: phoneInHand(-18)
  });
  let s = cam(zoomIn(t, 0, 1.1, 0.25), 540, 1000, w);
  s += at(540, 300, pop(t, 0.25, 0.55), text('Sábado', 0, 0, { size: 175, sw: SW * 2.4, sd: 10 }), lerp(-8, -3, pop(t, 0.25, 0.55)));
  return s;
};

// 2) Vibra el móvil y salta la notificación; Marta levanta la vista
S[2] = (t, T) => {
  const z = lerp(1, 1.32, easeOut(t / 0.22)), cx = 600, cy = 1150;
  let w = room(T);
  const vib = t > 0.2 && t < 1.25 ? 1 : 0;
  const shake = vib * 1.4 * Math.sin(t * 95);
  const up = easeOut((t - 1.0) / 0.18);
  w += placeMarta(SIT.x, SIT.y, 190, 200, SIT.sc, {
    sit: true, expr: t < 1.0 ? 'bored' : 'surprise', look: t < 1.0 ? [0.8, 1.3] : [0.9, -1.6], head: lerp(6, -12, up),
    armF: -70, armB: -30, handF: phoneInHand(-18 + vib * 7 * Math.sin(t * 70), shake)
  });
  // vibración del móvil
  const [hx, hy] = toWorld(SIT.x, SIT.y, 190, 200, SIT.sc, 232, 112);
  if (vib) for (let i = 0; i < 2; i++) {
    const r = 70 + i * 34, on = (Math.floor(t * 12) + i) % 2;
    if (on) w += `<path d="M${f(hx + r * 0.8)} ${f(hy - r * 0.55)} A${r} ${r} 0 0 1 ${f(hx + r * 0.8)} ${f(hy + r * 0.55)} M${f(hx - r * 0.8)} ${f(hy - r * 0.55)} A${r} ${r} 0 0 0 ${f(hx - r * 0.8)} ${f(hy + r * 0.55)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.8)}" stroke-linecap="round"/>`;
  }
  let s = cam(z, cx, cy, w);
  // tarjeta de notificación sobre el móvil, con rebote
  const k = pop(t, 0.5, 0.55);
  const px = cx + (hx - cx) * z, py = cy + (hy - 30 - cy) * z;
  const ccx = 540, ccy = 560, cw = 900, ch = 330;
  if (k > 0) {
    let tail = `<path d="M${f(40)} ${f(ch / 2 - 10)} L${f(px - ccx)} ${f(py - 70 - ccy)} L${f(150)} ${f(ch / 2 - 10)}Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
    let inner = tail + notifCard(cw, ch) + `<path d="M${f(46)} ${f(ch / 2 - 14)} L${f(px - ccx - 2)} ${f(py - 76 - ccy)} L${f(144)} ${f(ch / 2 - 14)}Z" fill="#FFFFFF"/>`;
    s += at(ccx, ccy, k, inner, lerp(-5, 0, k) + 1.2 * Math.sin(t * 6));
  }
  s += mark('!', 905, 330, pop(t, 1.05, 0.4), 14, 170);
  return s;
};

// 3) Primer plano con ojos brillantes, reloj 13:45 y salto del sofá
S[3] = (t, T, sc) => {
  const cut = (sc && sc.cut) || 1.5;
  let s = '';
  if (t < cut) {
    s += `<rect width="${W}" height="${H}" fill="${C.cream}"/>` + rays(540, 960, 18, t * 14, '#F7D3CC');
    let g = placeMarta(470, 930, 190, 78, 9.5, {
      sw: SW * 1.3, expr: 'sparkle', noLegs: true, armF: -150 + 8 * Math.sin(t * 18), armB: 150 - 8 * Math.sin(t * 18),
      pony: -14 + 8 * Math.sin(t * 12), handF: phoneInHand(-160)
    });
    g += sparkle(250, 760, 50, pop(t, 0.2, 0.4) * (1 + 0.15 * Math.sin(t * 14)));
    g += sparkle(720, 720, 34, pop(t, 0.35, 0.4) * (1 + 0.15 * Math.sin(t * 16 + 1)));
    g += sparkle(200, 1060, 28, pop(t, 0.5, 0.4));
    s += cam(zoomIn(t, 0, 1.25, 0.2), 470, 930, g);
  } else {
    const u = t - cut;
    let w = room(T);
    const tL = 0.25, tA = 0.6; // despegue y duración del salto
    if (u < tL) {
      const q = Math.sin(clamp(u / tL) * PI / 2);
      w += placeMarta(SIT.x, SIT.y, 190, 200, SIT.sc, { sit: true, expr: 'sparkle', armF: -40, armB: -20, squash: [1 + 0.1 * q, 1 - 0.12 * q], handF: phoneInHand(-18) });
    } else {
      const a = clamp((u - tL) / tA), air = u - tL < tA;
      const fx = lerp(560, 650, a), fy = lerp(1330, SIT.y, a) - 420 * 4 * a * (1 - a);
      let sq;
      if (air) { const st = 1 - a; sq = [1 - 0.12 * st, 1 + 0.18 * st]; } else {
        const d = damp(u - tL - tA, 16, 6); sq = [1 + 0.16 * d, 1 - 0.16 * d];
      }
      const o = air
        ? { expr: 'sparkle', legF: -24, legB: 28, armF: -155, armB: 150, pony: -40 + 60 * a, handF: phoneInHand(-160) }
        : { expr: 'smile', legF: -20, legB: 22, armF: -40, armB: 40, pony: 30, lean: 8, handF: phoneInHand(-40) };
      o.squash = sq;
      if (!air) {
        const lu = u - tL - tA;
        for (let i = 0; i < 3; i++) w += puff(fx - 110 + i * 110, SIT.y - 20, 34 - i * 4, pop(lu, i * 0.05, 0.3) * clamp(1 - (lu - 0.3) / 0.3));
      }
      w += shadowEll(fx, SIT.y, 110 * (air ? 0.6 + 0.4 * (1 - Math.sin(a * PI)) : 1));
      w += placeMarta(fx, fy, 190, 204, SIT.sc, o);
      if (air && a < 0.6) for (let i = 0; i < 3; i++) w += `<line x1="${f(fx - 90 + i * 90)}" y1="${f(fy + 60)}" x2="${f(fx - 90 + i * 90)}" y2="${f(fy + 60 + 160 * (1 - a))}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linecap="round"/>`;
    }
    s += cam(zoomIn(u, 0, 1.08, 0.15), 540, 1100, w);
  }
  // reloj grande y texto (fijos en pantalla)
  const kc = pop(t, 0.1, 0.5);
  const wob = 4 * Math.sin(t * 22) * (t > 0.6 ? 1 : 0);
  s += at(290, 420, kc, clockFace(140, 45, false), wob);
  s += at(745, 420, pop(t, 0.25, 0.5), digital(380, 170, 45, false), -3);
  const l = 'Quedan 15 minutos';
  s += at(540, 1355, pop(t, 0.5, 0.5), text(l, 0, 0, { size: fit(l, 125, 990), sw: SW * 2.3, sd: 9 }), -2);
  return s;
};

// 4) Carrera de cómic bajo la lluvia, reloj 13:45 -> 14:00
S[4] = (t, T, sc) => {
  const v = 1500, off = 400 + v * t;
  const amp = 5 * Math.sin(t * 47), amp2 = 4 * Math.cos(t * 39);
  let w = skyRain(T);
  w += street(off, { w: 440, h: 780, g: 50, base: 1300 });
  w += groundWet(1300, off);
  // líneas de velocidad
  for (let i = 0; i < 14; i++) {
    const y = 560 + hash(i * 3.3) * 880, len = 220 + hash(i * 7.7) * 260;
    const sp = 2600 + hash(i * 1.9) * 1200, L = W + len + 200;
    const x = W + 100 - ((hash(i * 4.1) * L + sp * t) % L);
    w += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x + len)}" y2="${f(y)}" stroke="#FFFFFF" stroke-width="${f(SW * 1.1)}" stroke-linecap="round"/>`;
  }
  const mx = 470, p = runPose(t);
  // nubecitas de polvo/agua detrás
  for (let i = 0; i < 5; i++) {
    const ph = ((t / 0.2) + i / 5) % 1, base0 = Math.floor(t / 0.2 + i / 5);
    const x = mx - 90 - ph * 420, y = FOOT - 24 - ph * 40 - hash(base0 + i) * 20;
    w += puff(x, y, 34 * (1 - ph * 0.6), clamp(Math.sin(ph * PI) * 1.4));
  }
  w += shadowEll(mx, FOOT, 120);
  w += placeMarta(mx, FOOT, 190, 204, SC, Object.assign({ expr: 'smile' }, p));
  // líneas de movimiento junto a Marta
  for (let i = 0; i < 3; i++) w += `<line x1="${f(mx - 260 - 40 * i)}" y1="${880 + i * 120}" x2="${f(mx - 130 - 20 * i)}" y2="${880 + i * 120}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linecap="round"/>`;
  w += rain(T, -100, 0, W + 100, 1500, 70);
  let s = cam(zoomIn(t, 0, 1.14, 0.22), 540, 1000, w, amp, amp2);
  // reloj en la esquina: avanza de 13:45 a 14:00 y pulsa en rojo
  const dur = (sc && sc.duration) || 4;
  const min = 45 + 15 * clamp(t / (dur - 0.45));
  const beat = 0.5 + 0.5 * Math.sin(t * 2 * PI / (t > dur * 0.6 ? 0.3 : 0.5));
  const red = beat > 0.5;
  const kc = pop(t, 0.05, 0.45) * (1 + 0.09 * beat);
  s += at(865, 300, kc, clockFace(96, min, red), 6 * Math.sin(t * 30));
  s += at(865, 462, kc, digital(250, 104, min, red), -3);
  return s;
};

// 5) Llega a la panadería y derrapa. Cartel ABIERTO · 2x1 en pasteles; la panadera se prepara
const BK5 = bakeryGeo(260, 1300, 660, 780);
S[5] = (t, T) => {
  const v0 = 1500, tb = 0.42, d = 0.42, ts = tb + d;
  const pos = tt => tt < tb ? v0 * tt : (tt < ts ? v0 * tb + v0 * ((tt - tb) - (tt - tb) * (tt - tb) / (2 * d)) : v0 * tb + v0 * d / 2);
  const total = pos(10), R = total - pos(t);
  let w = skyRain(T);
  w += bakeryStreet(BK5, R, { flip: 0 });
  w += groundWet(1300, -R);
  const mx = 330;
  let o;
  if (t < tb) o = Object.assign({ expr: 'smile' }, runPose(t));
  else {
    const u = clamp((t - tb) / d), rp = runPose(tb);
    if (t < ts) o = { legF: lerp(rp.legF, -34, u), legB: lerp(rp.legB, 22, u), armF: lerp(rp.armF, -50, u), armB: lerp(rp.armB, -40, u), pony: lerp(70, -10, u), lean: lerp(10, -14, u) };
    else { const dm = damp(t - ts, 10, 4.5); o = { legF: -34 * dm, legB: 22 * dm, armF: -50 * dm, armB: -40 * dm, pony: -10 + 20 * damp(t - ts, 8, 3), lean: -14 * dm }; }
    o.expr = t < 1.15 ? 'surprise' : 'sparkle';
    o.look = t > 1.15 ? [1.2, -0.6] : [0, 0];
  }
  if (t > tb) {
    const len = clamp((t - tb) / d) * 260, fade = clamp(1 - (t - ts - 0.5) / 0.3);
    if (fade > 0) for (let i = 0; i < 2; i++) w += `<line x1="${f(mx + 40 - len * fade)}" y1="${FOOT - 6 + i * 16}" x2="${mx + 40}" y2="${FOOT - 6 + i * 16}" stroke="${INK}" stroke-width="${f(SW * 0.7)}" stroke-linecap="round"/>`;
    for (let i = 0; i < 4; i++) {
      const st = tb + 0.05 + i * 0.08, k = pop(t, st, 0.35) * clamp(1 - (t - st - 0.6) / 0.35);
      w += puff(mx - 60 - i * 85, FOOT - 26 - i * 14, 44 - i * 5, k);
    }
  }
  w += shadowEll(mx, FOOT, 120);
  w += placeMarta(mx, FOOT, 190, 204, SC, o);
  // panadera en la puerta, preparándose para girar el cartel
  const bx = 1010 + R, reach = easeOut((t - 1.55) / 0.3);
  w += shadowEll(bx, FOOT - 60, 110);
  w += place(bx, FOOT - 60, 190, 204, SC * 1.03, { who: 'baker', flip: true, expr: t < 1.7 ? 'happy' : 'cheeky', armF: lerp(-8, -78, reach), armB: 6, head: -4 * reach });
  w += rain(T, -100, 0, W + 100, 1500, 60);
  let s = w;
  // zoom rápido tipo cómic al cartel
  const zt = easeOut((t - 1.85) / 0.16);
  if (t > 1.85) s = cam(lerp(1, 1.3, zt), BK5.sign.cx, BK5.sign.cy + 80, w);
  return s;
};

// 6) Marta sale con la caja; para la lluvia y sale el sol. «Últimos 2x1». La panadera gira el cartel
const BK6 = BK5;
S[6] = (t, T) => {
  const e = easeInOut((t - 0.55) / 1.0); // apertura de las nubes
  let s = skyClear(T, { band: 420, sx: 905, sy: 300, sr: 70, sun: false });
  s += sun(905, 300, 70, T * 12, pop(t, 1.05, 0.5));
  // capa gris que se abre desde el centro
  if (e < 1) {
    const rx = lerp(0, 1500, e), ry = rx * 0.55;
    s += `<path d="M-10 -10 H${W + 10} V${H} H-10Z M${f(540 - rx)} 330 A${f(rx)} ${f(ry)} 0 1 0 ${f(540 + rx)} 330 A${f(rx)} ${f(ry)} 0 1 0 ${f(540 - rx)} 330Z" fill="${SKY_RAIN}" fill-rule="evenodd"/>`;
    s += grayClouds(T, 0, 900 * e);
  }
  const open = t < 0.75 ? 1 : clamp(1 - (t - 0.75) / 0.12);
  const flipU = clamp((t - 2.0) / 0.4);
  s += bakeryStreet(BK6, 0, { open, flip: easeInOut(flipU), bell: 18 * damp(t, 14, 3) + (t > 0.75 ? 14 * damp(t - 0.75, 14, 4) : 0), signShake: t > 2.4 ? 6 * damp(t - 2.4, 14, 5) : 0 });
  s += groundWet(1300, 0, { dry: true });
  // Marta sale con la caja
  const a = clamp(t / 0.95);
  const mx = lerp(BK6.door.x + BK6.door.w / 2, 300, easeInOut(a)), my = lerp(1350, FOOT, a), msc = lerp(4.6, SC, a);
  const wp = walkPose(2 * PI * t / STEP, a < 1 ? 1 : 0);
  const hop = t > 1.3 ? Math.abs(Math.sin((t - 1.3) * PI / 0.45)) * 40 * clamp(1 - (t - 2.6)) : 0;
  s += shadowEll(mx, my, 110);
  s += place(mx, my - hop, 190, 204, msc, Object.assign({}, wp, {
    who: 'marta', flip: t < 1.0, expr: t < 1.0 ? 'happy' : 'smile', armF: -32, armB: -26, pony: wp.pony + (hop ? 10 * Math.sin(t * 14) : 0),
    front: w => cakeBoxL(226, 146, 1.05, w)
  }));
  if (t > 1.0) {
    const [bx, by] = toWorld(mx, my - hop, 190, 204, msc, 226, 118, false);
    s += sparkle(bx - 90, by - 40, 30, pop(t, 1.1, 0.4) * (1 + 0.2 * Math.sin(t * 16)));
    s += sparkle(bx + 100, by - 10, 22, pop(t, 1.2, 0.4));
  }
  // panadera gira el cartel
  const reach = t < 1.9 ? 0.6 : 1;
  s += shadowEll(1010, FOOT - 60, 110);
  s += place(1010, FOOT - 60, 190, 204, SC * 1.03, { who: 'baker', flip: true, expr: t < 2.2 ? 'happy' : 'wink', armF: lerp(-8, -80, reach) + (flipU > 0 && flipU < 1 ? 10 * Math.sin(flipU * PI) : 0), armB: 6 });
  if (flipU > 0 && flipU < 1) {
    const sg = BK6.sign;
    s += `<path d="M${f(sg.cx - sg.w * 0.62)} ${f(sg.cy - 40)} A${f(sg.w * 0.62)} ${f(sg.w * 0.3)} 0 0 0 ${f(sg.cx + sg.w * 0.62)} ${f(sg.cy - 40)}" fill="none" stroke="${INK}" stroke-width="${f(SW)}" stroke-linecap="round" stroke-dasharray="26 20"/>`;
  }
  s += rain(T, -100, 0, W + 100, 1500, 60, { amount: clamp(1 - (t - 0.4) / 0.4) });
  // texto
  const l = 'Últimos 2x1';
  s += at(410, 300, pop(t, 1.3, 0.55), text(l, 0, 0, { size: fit(l, 150, 690), sw: SW * 2.4, sd: 10, fill: '#FFFFFF' }), -4);
  return cam(zoomIn(t, 0, 1.1, 0.2), 540, 1000, s);
};

// 7) Lucía llega andando y se para en seco ante el cartel CERRADO · AGOTADO; Marta aparece con la caja
const BK7 = bakeryGeo(380, 1300, 660, 900);
S[7] = (t, T) => {
  let s = skyClear(T, { band: 420, sx: 170, sy: 300, sr: 66 });
  s += bakeryStreet(BK7, 0, { flip: 1 });
  s += groundWet(1300, 0, { dry: true });
  // Lucía
  const tStop = 1.45, lx0 = -180, lx1 = 600;
  const lx = t < tStop ? lerp(lx0, lx1, t / tStop) : lx1;
  let lo;
  if (t < tStop) lo = Object.assign(walkPose(2 * PI * t / 0.8, 0.85), { head: 9, expr: 'happy', look: [0, 1] });
  else {
    const dm = damp(t - tStop, 14, 5);
    lo = { legF: -10 * dm, legB: 10 * dm, armF: 20 * dm, armB: -20 * dm, lean: 7 * dm, head: lerp(9, 18, easeOut((t - 1.7) / 0.25)), expr: t < 1.7 ? 'surprise' : 'sad', look: [0.8, 1] };
  }
  lo.who = 'lucia'; delete lo.pony;
  s += shadowEll(lx, FOOT, 115);
  s += place(lx, FOOT, 190, 204, SC, lo);
  if (t > tStop && t < tStop + 0.5) s += mark('!', lx + 60, 610, pop(t, tStop, 0.3) * clamp(1 - (t - tStop - 0.3) / 0.2), 10, 150);
  s += sadCloud(lx - 30, 628, 0.75 * pop(t, 1.85, 0.5), t);
  // Marta entra por un lado con la caja
  const km = pop(t, 2.05, 0.5);
  if (km > 0) {
    const mx = lerp(-260, 165, km);
    s += shadowEll(mx, FOOT, 110);
    s += placeMarta(mx, FOOT, 190, 204, SC, { expr: 'happy', armF: -32, armB: -26, pony: 10 * Math.sin(t * 9), front: w => cakeBoxL(226, 146, 1.05, w) });
  }
  return cam(zoomIn(t, 0, 1.1, 0.2), 540, 1000, s);
};

// fondo de plano medio (escenas 8-10): panadería cerrada y cielo
function midBg(T, sunOn = true, z = 1.3) {
  let s = skyClear(T, { band: 380, sx: 150, sy: 280, sr: 60, clouds: WHITE_CLOUDS, sun: sunOn });
  let w = bakeryStreet(BK7, 0, { flip: 1 }) + groundWet(1300, 0, { dry: true });
  return s + cam(z, 760, 1300, w);
}
const M8 = { mx: 290, lx: 800, y: 1565, sc: 6.3 };

// 8) Marta le ofrece un pastel; Lucía levanta la vista con «?»
S[8] = (t, T) => {
  let s = midBg(T);
  const ext = easeOut((t - 0.15) / 0.3);
  s += shadowEll(M8.mx, M8.y, 130);
  s += placeMarta(M8.mx, M8.y, 190, 204, M8.sc, {
    expr: 'smile', armF: lerp(-10, -86, ext), armB: 12, pony: 5 * Math.sin(t * 4),
    behind: w => cakeBoxL(166, 156, 1.0, w), handF: w => cupcakeL(203, 138, 1.2, w) + hand(202.5, 140, w)
  });
  const [cx, cy] = toWorld(M8.mx, M8.y, 190, 204, M8.sc, 206, 120, false);
  s += sparkle(cx + 20 + (ext * 0), cy - 100, 30, pop(t, 0.55, 0.4) * (1 + 0.2 * Math.sin(t * 15)));
  const lift = easeOut((t - 1.0) / 0.25);
  s += shadowEll(M8.lx, M8.y, 125);
  s += place(M8.lx, M8.y, 190, 204, M8.sc, {
    who: 'lucia', flip: true, expr: t < 1.0 ? 'sad' : 'doubt', head: lerp(16, -2, lift), look: t < 1.0 ? [0.6, 1] : [0.8, 0.4],
    armF: lerp(4, -20, lift), armB: -6
  });
  s += sadCloud(M8.lx - 10, 470, (1 - easeOut((t - 0.95) / 0.25)) * (t < 1.2 ? 1 : 0) * pop(t, -1, 0.3), t);
  s += mark('?', M8.lx + 165, 620, pop(t, 3.15, 0.5), 12 + 5 * Math.sin(t * 5), 210, '#FFFFFF');
  return cam(zoomIn(t, 0, 1.1, 0.2), 540, 1000, s);
};

// 9) Marta pillina con un dedo levantado y nube de pensamiento con el icono del canal; Lucía «!»
S[9] = (t, T) => {
  let s = midBg(T);
  const up = easeOut((t - 0.1) / 0.25);
  s += shadowEll(M8.mx, M8.y, 130);
  s += placeMarta(M8.mx, M8.y, 190, 204, M8.sc, {
    expr: 'cheeky', armF: lerp(-10, -168, up) + 4 * Math.sin(t * 6), armB: 12, point: true, head: -3, pony: 4 * Math.sin(t * 4),
    behind: w => cakeBoxL(166, 156, 1.0, w)
  });
  // nube de pensamiento con el icono del canal
  const kc = pop(t, 0.55, 0.55);
  s += at(210, 640, pop(t, 0.35, 0.35), `<circle r="20" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>`);
  s += at(250, 560, pop(t, 0.45, 0.35), `<circle r="30" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>`);
  s += thoughtCloud(370, 395, 250, 165, kc);
  s += at(370, 395, kc * (1 + 0.05 * Math.sin(t * 7)), logoIcon(0, 0, 270));
  // Lucía con el pastel: abre mucho los ojos
  const wow = t > 2.95;
  const jump = wow ? Math.max(0, Math.sin(clamp((t - 2.95) / 0.35) * PI)) * 45 : 0;
  s += shadowEll(M8.lx, M8.y, 125);
  s += place(M8.lx, M8.y - jump, 190, 204, M8.sc, {
    who: 'lucia', flip: true, expr: wow ? 'wow' : 'doubt', look: wow ? [0.4, -0.3] : [0.8, 0.4], head: wow ? -6 : -2,
    armF: -42, armB: wow ? -30 : -6, legF: wow ? -10 : 0, legB: wow ? 12 : 0,
    handF: w => cupcakeL(203, 138, 1.2, w) + hand(202.5, 140, w)
  });
  s += mark('!', M8.lx + 170, 600, pop(t, 3.0, 0.45), -8 + 4 * Math.sin(t * 6), 230);
  return cam(zoomIn(t, 0, 1.1, 0.2), 540, 1000, s);
};

// 10) Marta enseña su móvil con el canal; Lucía sonríe y saca su móvil. «Tu canal de promociones»
S[10] = (t, T) => {
  let s = midBg(T, false, 1.0);
  const mx = 175, lx = 945, y = 1565, sc = 5.7;
  s += shadowEll(mx, y, 120);
  s += placeMarta(mx, y, 190, 204, sc, { expr: t < 2.3 ? 'smile' : 'wink', armF: -36, armB: 12, pony: 4 * Math.sin(t * 4), behind: w => cakeBoxL(166, 156, 1.0, w) });
  // Lucía: sonríe y saca su propio móvil
  const out = easeOut((t - 1.5) / 0.3);
  s += shadowEll(lx, y, 115);
  s += place(lx, y, 190, 204, sc, {
    who: 'lucia', flip: true, expr: t < 1.5 ? 'happy' : 'smile', armF: lerp(4, -16, out), armB: -6, head: 4,
    handF: out > 0 ? (w => `<g transform="translate(202.5 140) scale(1.2) translate(-202.5 -140)">${phoneInHand(-24)(w)}</g>`) : null, look: [0.6, 1.4]
  });
  if (out > 0.5) {
    const [px, py] = toWorld(lx, y, 190, 204, sc, 212, 125, true);
    s += sparkle(px - 40, py - 80, 26, pop(t, 1.75, 0.4) * (1 + 0.2 * Math.sin(t * 15)));
  }
  // móvil grande hacia cámara
  const kp = pop(t, 0.1, 0.5);
  const PX = 250, PY = 430, PW = 470, PH = 820;
  s += at(300, 1180, kp, `<g transform="translate(-300 -1180) rotate(-3 485 840)">${channelPhone(PX, PY, PW, PH, t)}</g>`);
  // mano de Marta sujetando el móvil
  if (kp > 0.5) s += `<g transform="rotate(-3 485 840)"><ellipse cx="${PX + 16}" cy="1150" rx="34" ry="46" fill="${C.skin}" stroke="${INK}" stroke-width="${f(SW)}"/><path d="M${PX + 10} 1128 q24 -6 36 8" stroke="${INK}" stroke-width="${f(SW * 0.7)}" fill="none" stroke-linecap="round"/></g>`;
  const l = 'Tu canal de promociones';
  s += at(540, 285, pop(t, 0.3, 0.5), text(l, 0, 0, { size: fit(l, 115, 990), sw: SW * 2.2, sd: 9 }), -2);
  return cam(zoomIn(t, 0, 1.1, 0.2), 540, 1000, s);
};

// 11) Llamada a la acción con pájaros + corte a tarjeta final
const BIRDS11 = [{ t0: 0.2, d: 3.4, dir: 1, y: 232, a: 34 }, { t0: 1.2, d: 3.8, dir: -1, y: 1462, a: 30 }, { t0: 2.4, d: 3.0, dir: 1, y: 238, a: 26 }];
S[11] = (t, T, sc) => {
  const cut = (sc && sc.cut) || 5;
  if (t < cut) {
    let s = skyClear(T, { band: 1300, sx: 930, sy: 250, sr: 62, clouds: [
      { x0: 60, y: 230, s: 0.75, v: 16 }, { x0: 700, y: 900, s: 0.85, v: 26 }, { x0: 300, y: 1180, s: 0.6, v: 11 },
      { x0: 1250, y: 420, s: 0.9, v: 20 }, { x0: 1650, y: 1320, s: 0.7, v: 14 }] });
    BIRDS11.forEach((b, i) => {
      const u = (t - b.t0) / b.d;
      if (u < 0 || u > 1) return;
      const x = b.dir > 0 ? lerp(-90, W + 90, u) : lerp(W + 90, -90, u);
      const fl = 0.35 + 0.65 * Math.sin(t * 2 * PI / 0.34 + i * 2);
      s += bird(x, b.y + Math.sin(u * 7 + i) * 10, b.a, fl);
    });
    // globo de comentario
    const kb = pop(t, 0.15, 0.55);
    let b = `<path d="M-290 270 L-370 400 L-170 280Z" transform="translate(14 14)" fill="${INK}"/>`;
    b += `<path d="M-290 270 L-370 400 L-170 280Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
    b += panel(-440, -290, 880, 580, 90);
    b += `<path d="M-286 278 L-356 385 L-180 284Z" fill="#FFFFFF"/>`;
    b += at(0, -135, pop(t, 0.4, 0.5), text('Comenta', 0, 0, { size: 135, fill: INK, stroke: null }));
    const word = 'INSTANTE', size = fit(word, 195, 780);
    let xx = -measure(word, size) / 2;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i], cw = measure(ch, size), k = pop(t, 0.7 + i * 0.07, 0.45);
      b += at(xx + cw / 2, 90, k, text(ch, 0, 0, { size, fill: C.red, sw: SW * 2.2, sd: 9 }), (i % 2 ? 4 : -4) * (1 - k));
      xx += cw;
    }
    s += at(540, 590, kb, b, lerp(-6, 0, kb));
    // franja roja con la web
    const ks = pop(t, 1.6, 0.6), url = 'escaparatetudela.es';
    let st = `<rect x="-640" y="-80" width="1280" height="160" transform="translate(0 12)" fill="${INK}"/><rect x="-640" y="-80" width="1280" height="160" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
    st += text(url, 0, 2, { size: fit(url, 98, 930), sw: SW * 2, sd: 6 });
    s += `<g transform="translate(${f(540 + (1 - ks) * -1500)} 1065) rotate(-3)">${st}</g>`;
    // botón verde
    const kbtn = pop(t, 2.5, 0.55), pulse = t > 3.1 ? 1 + 0.03 * Math.sin((t - 3.1) * 2 * PI / 1.2) : 1;
    let bt = '';
    if (t > 3.1) {
      const ph = ((t - 3.1) % 1.2) / 1.2, rs = 1 + 0.16 * ph;
      bt += `<rect x="${f(-390 * rs)}" y="${f(-78 * rs - 8 * ph)}" width="${f(780 * rs)}" height="${f(156 * rs + 16 * ph)}" rx="${f(78 * rs + 8 * ph)}" fill="none" stroke="${C.green}" stroke-width="${f(SW * 1.2 * (1 - ph))}"/>`;
    }
    bt += `<rect x="-378" y="-66" width="780" height="156" rx="78" fill="${INK}"/>`;
    bt += `<rect x="-390" y="-78" width="780" height="156" rx="78" fill="${C.green}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
    const lab = 'Canal de WhatsApp';
    bt += text(lab, 0, 2, { size: fit(lab, 86, 640), sw: SW * 2, sd: 5 });
    s += at(540, 1250, kbtn * pulse, bt);
    const tag = 'Etiqueta a quien siempre llega tarde';
    s += at(540, 1385, pop(t, 3.2, 0.5), text(tag, 0, 0, { size: fit(tag, 60, 960), sw: SW * 1.5, sd: 5 }));
    return cam(zoomIn(t, 0, 1.1, 0.2), 540, 900, s);
  }
  const u = t - cut;
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 640, 16, t * 8, C.dred);
  s += logoBadge(540, 620, 660, 0, pop(u, 0, 0.45));
  s += at(540, 1065, pop(u, 0.1, 0.45), text('Escaparate', 0, 0, { size: 150, sw: SW * 2.4, sd: 9 }));
  s += at(540, 1215, pop(u, 0.18, 0.45), text('de Tudela', 0, 0, { size: 150, sw: SW * 2.4, sd: 9 }));
  const url = 'escaparatetudela.es', us = fit(url, 76, 700);
  s += at(540, 1385, pop(u, 0.28, 0.45), `<rect x="-380" y="-62" width="780" height="124" rx="62" transform="translate(10 10)" fill="${INK}"/><rect x="-390" y="-62" width="780" height="124" rx="62" fill="${C.dred}" stroke="${INK}" stroke-width="${f(SW)}"/>` + text(url, 0, 2, { size: us, sw: SW * 1.8, sd: 5 }));
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
