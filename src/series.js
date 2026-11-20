/* Piezas de la serie reutilizadas del vídeo 02 («Marta y el último 2x1») y generalizadas:
   cámara, marcas, sol y nubes, reloj (analógico + digital), panadería con toldo, puerta y cartel de dos caras. */
'use strict';

C.yel = '#F2C12E'; C.brown = '#C98A4B'; C.wood = '#A9743F'; C.woodS = '#7E5328'; C.redS = '#A32323';
C.green = '#3C9D5D'; C.skyHz = '#E4F4FA'; C.warm = '#FBE6CF';
const DOT = '#F2B5AD';
const wk = sc => (v => f(v * SW / 3 / (sc || 1))); // grosor de trazo para dibujos «locales» de base 380

/* ---------- cámara y marcas ---------- */
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
// recorte del icono (móvil + toldo + etiqueta %) de los PNG con letras
function logoIcon(cx, cy, size, which = 'logoR') {
  const h = size / 2;
  return `<svg x="${f(cx - h)}" y="${f(cy - h)}" width="${f(size)}" height="${f(size)}" viewBox="150 72 200 200"><use href="#${which}"/></svg>`;
}
function speedLinesH(x, y, len, n, gap, sw = SW) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<line x1="${f(x - len * (1 - 0.25 * (i % 2)))}" y1="${f(y + i * gap)}" x2="${f(x)}" y2="${f(y + i * gap)}" stroke="${INK}" stroke-width="${f(sw)}" stroke-linecap="round"/>`;
  return s;
}

/* ---------- cielo despejado ---------- */
function sun(x, y, r, rot, k = 1) {
  let rays_ = '';
  for (let i = 0; i < 12; i++) {
    const a = (rot + i * 30) * PI / 180, a1 = a - 0.11, a2 = a + 0.11;
    const r1 = r * 1.18, r2 = r * (i % 2 ? 1.55 : 1.75);
    rays_ += `<path d="M${f(Math.cos(a1) * r1)} ${f(Math.sin(a1) * r1)} L${f(Math.cos(a) * r2)} ${f(Math.sin(a) * r2)} L${f(Math.cos(a2) * r1)} ${f(Math.sin(a2) * r1)}Z"/>`;
  }
  return at(x, y, k, `<g fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round">${rays_}</g>
    <circle cx="8" cy="8" r="${r}" fill="${INK}"/><circle r="${r}" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW)}"/>
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
// color de la banda del horizonte según la hora (minutos del día): azul claro a mediodía, crema-anaranjado suave después
function hexMix(a, b, u) {
  const p = h => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(u))).toString(16).padStart(2, '0')).join('');
}
const bandColor = tm => hexMix(C.skyHz, C.warm, (tm - 720) / 110);
function skyClear(T, o = {}) {
  const band = o.band || 900;
  let s = `<rect width="${W}" height="${H}" fill="${C.sky}"/><rect y="${band}" width="${W}" height="${H}" fill="${bandColor(o.tm || 720)}"/>`;
  if (o.sun !== false) s += sun(o.sx || 905, o.sy || 260, o.sr || 62, T * 12);
  s += whiteClouds(T, o.clouds);
  return s;
}

/* ---------- reloj (analógico + digital) ---------- */
const hm = tm => [Math.floor(tm / 60), Math.floor(tm % 60 + 1e-6)];
function timeStr(tm) { const [h, m] = hm(Math.floor(tm + 1e-6)); return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }
function clockFace(r, tm, o = {}) {
  let s = '';
  if (o.bells) s += `<circle cx="${-r * 0.62}" cy="${-r * 0.86}" r="${f(r * 0.3)}" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW)}"/>
    <circle cx="${r * 0.62}" cy="${-r * 0.86}" r="${f(r * 0.3)}" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<circle cx="9" cy="9" r="${r}" fill="${INK}"/>
    <circle r="${r}" fill="${o.red ? C.red : (o.rim || C.red)}" stroke="${INK}" stroke-width="${f(SW)}"/>
    <circle r="${f(r * 0.8)}" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
  for (let i = 0; i < 12; i++) {
    const a = i * PI / 6, r1 = r * (i % 3 ? 0.68 : 0.6), r2 = r * 0.74;
    s += `<line x1="${f(Math.sin(a) * r1)}" y1="${f(-Math.cos(a) * r1)}" x2="${f(Math.sin(a) * r2)}" y2="${f(-Math.cos(a) * r2)}" stroke="${INK}" stroke-width="${f(SW * (i % 3 ? 0.6 : 1))}" stroke-linecap="round"/>`;
  }
  const m = tm % 60, h = (tm / 60) % 12;
  const am = m / 60 * 2 * PI, ah = h / 12 * 2 * PI;
  s += `<line x1="0" y1="0" x2="${f(Math.sin(ah) * r * 0.4)}" y2="${f(-Math.cos(ah) * r * 0.4)}" stroke="${INK}" stroke-width="${f(SW * 1.5)}" stroke-linecap="round"/>`;
  s += `<line x1="0" y1="0" x2="${f(Math.sin(am) * r * 0.62)}" y2="${f(-Math.cos(am) * r * 0.62)}" stroke="${C.red}" stroke-width="${f(SW * 1.1)}" stroke-linecap="round"/>`;
  s += `<circle r="${f(r * 0.08)}" fill="${INK}"/>`;
  return s;
}
function digital(w, h, tm, red) {
  return panel(-w / 2, -h / 2, w, h, h * 0.3, INK, 9) +
    text(timeStr(tm), 0, h * 0.04, { size: h * 0.8, font: 'G', fill: red ? C.red : '#FFFFFF', stroke: red ? '#FFFFFF' : null, sw: SW * 0.8, shadow: false, ls: 2 });
}
// reloj de pared: esfera + pantalla digital debajo (k = escala de rebote, wob = giro)
function wallClock(x, y, r, tm, k = 1, wob = 0) {
  return at(x, y, k, clockFace(r, tm), wob) + at(x, y + r + r * 0.62, k, digital(r * 2.1, r * 0.78, tm), 0);
}
// reloj de calle en farola (esquina)
function poleClock(x, base, y, r, tm, k = 1, wob = 0) {
  let s = `<rect x="${f(x - 14 + 8)}" y="${f(y)}" width="28" height="${f(base - y)}" fill="${INK}"/>`;
  s += `<rect x="${f(x - 14)}" y="${f(y)}" width="28" height="${f(base - y)}" rx="8" fill="${C.navy}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += `<rect x="${f(x - 34)}" y="${f(base - 40)}" width="68" height="44" rx="10" fill="${C.navy}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  s += at(x, y, k, clockFace(r, tm, { rim: C.navy }), wob);
  s += at(x, y + r + r * 0.6, k, digital(r * 2.0, r * 0.74, tm));
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
    <path d="M6 92 H94" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>`,
  box: sw => cakeBoxL(50, 92, 1.9, v => f(v * sw / 3)) + `<path d="M4 94 H96" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>`
};
function bakeryGeo(x, base, w, h) {
  const top = base - h, ay = top + 0.2 * h, ah = 0.15 * h;
  const wy = ay + ah + (w * 1.06 / 8) / 2 + 0.035 * h;
  const door = { x: x + 0.56 * w, w: 0.34 * w, y: wy - 0.01 * h };
  const dh = base - door.y + 10;
  const glass = { x: door.x + door.w * 0.14, y: door.y + door.w * 0.12, w: door.w * 0.72, h: dh * 0.42 };
  const sw = door.w * 0.86, sh = sw * 0.58;
  const sign = { cx: door.x + door.w / 2, cy: door.y + dh * 0.7, w: sw, h: sh };
  return { x, w, h, base, top, ay, ah, wy, door, dh, glass, sign };
}
// cartel de dos caras: flip 0 = ABIERTO, 1 = AGOTADO (vuelta animada con escala horizontal)
function doorSign(sw, sh, flip, shake = 0) {
  const sx = Math.max(0.02, Math.abs(Math.cos(PI * clamp(flip))));
  const back = flip >= 0.5;
  let c = `<rect x="${f(-sw / 2 + 7)}" y="${f(-sh / 2 + 7)}" width="${f(sw)}" height="${f(sh)}" rx="14" fill="${INK}"/>`;
  c += `<rect x="${f(-sw / 2)}" y="${f(-sh / 2)}" width="${f(sw)}" height="${f(sh)}" rx="14" fill="${back ? C.red : C.cream}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  c += `<circle cx="0" cy="${f(-sh / 2 + 13)}" r="6" fill="${INK}"/>`;
  const lab = back ? 'AGOTADO' : 'ABIERTO';
  c += text(lab, 0, sh * 0.1, { size: fit(lab, sh * 0.5, sw * 0.84), fill: back ? '#FFFFFF' : C.green, sw: SW * 1.4, sd: 4 });
  return `<g transform="rotate(${f(shake)} 0 ${f(-sh / 2 - 40)}) scale(${f(sx)} 1)">${c}</g>`;
}
function pastryWindow(mode) {
  return (X, Y, Wd, Hd) => {
    const st = `stroke="${INK}" stroke-width="${f(SW * 0.8)}"`;
    let it = `<line x1="${f(X)}" y1="${f(Y + Hd * 0.5)}" x2="${f(X + Wd)}" y2="${f(Y + Hd * 0.5)}" ${st}/>`;
    if (mode === 'one') return it + unitBox(X + Wd * 0.28, Y + Hd * 0.52, Wd * 0.44, Hd * 0.46, PITEMS.box, 0.95);
    if (mode === 'none') return it;
    it += unitBox(X + Wd * 0.02, Y + Hd * 0.06, Wd * 0.5, Hd * 0.44, PITEMS.cake, 0.95);
    it += unitBox(X + Wd * 0.5, Y + Hd * 0.1, Wd * 0.46, Hd * 0.4, PITEMS.cupcake, 0.95);
    it += unitBox(X + Wd * 0.02, Y + Hd * 0.56, Wd * 0.34, Hd * 0.42, PITEMS.croissant, 0.95);
    it += unitBox(X + Wd * 0.34, Y + Hd * 0.56, Wd * 0.32, Hd * 0.42, PITEMS.cupcake, 0.9);
    it += unitBox(X + Wd * 0.64, Y + Hd * 0.56, Wd * 0.34, Hd * 0.42, PITEMS.croissant, 0.95);
    return it;
  };
}
function bakery(g, o = {}) {
  const { x, w, h, base, top, ay, ah, wy, door, dh, glass } = g;
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}"`;
  let s = '';
  s += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="${C.cream}"/>`;
  s += `<rect x="${f(x + w * 0.9)}" y="${f(top + w * 0.02)}" width="${f(w * 0.1)}" height="${f(h + 30)}" fill="${INK}" opacity="0.16"/>`;
  s += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="none" ${st()}/>`;
  // rótulo PANADERÍA (letras crema sobre rojo oscuro, como en el vídeo 02)
  const py = top + h * 0.04, ph = h * 0.125, pw = w * 0.84;
  s += `<rect x="${f(x + (w - pw) / 2 + 9)}" y="${f(py + 9)}" width="${f(pw)}" height="${f(ph)}" rx="${f(ph * 0.25)}" fill="${INK}"/>`;
  s += `<rect x="${f(x + (w - pw) / 2)}" y="${f(py)}" width="${f(pw)}" height="${f(ph)}" rx="${f(ph * 0.25)}" fill="${C.dred}" ${st()}/>`;
  s += text('PANADERÍA', x + w / 2, py + ph * 0.56, { size: fit('PANADERÍA', ph * 0.72, pw * 0.86), fill: C.cream, sw: SW * 1.4, sd: 4, ls: 3 });
  s += awning(x + w * 0.04, x + w * 0.96, x - w * 0.03, x + w * 1.03, ay, ah, 8);
  // escaparate con pasteles
  const wx = x + w * 0.05, ww = w * 0.44, wh = base - h * 0.09 - wy;
  s += glassWindow(wx, wy, ww, wh, typeof o.window === 'function' ? o.window : pastryWindow(o.window || 'full'));
  s += `<rect x="${f(wx - w * 0.02)}" y="${f(wy + wh)}" width="${f(ww + w * 0.04)}" height="${f(h * 0.03)}" rx="4" fill="#FFFFFF" ${st()}/>`;
  // puerta (con apertura opcional)
  const open = clamp(o.open || 0);
  if (open > 0) {
    s += `<rect x="${f(door.x)}" y="${f(door.y)}" width="${f(door.w)}" height="${f(dh)}" rx="${f(door.w * 0.06)}" fill="${C.dred}" ${st()}/>`;
    s += `<rect x="${f(door.x + door.w * 0.1)}" y="${f(door.y + dh * 0.62)}" width="${f(door.w * 0.8)}" height="${f(dh * 0.12)}" fill="${C.redS}"/>`;
    if (o.inDoor) s += o.inDoor(door, dh);
  }
  const lw = door.w * (1 - 0.82 * open);
  s += `<path d="M${f(door.x)} ${f(door.y)} L${f(door.x + lw)} ${f(door.y + 18 * open)} L${f(door.x + lw)} ${f(door.y + dh - 18 * open)} L${f(door.x)} ${f(door.y + dh)}Z" fill="${C.navy}" ${st()} stroke-linejoin="round"/>`;
  if (open < 0.05) {
    // cristal de la puerta: se ve el interior (pared con puntos y el reloj de pared)
    const id = 'dg' + (uid++);
    s += `<clipPath id="${id}"><rect x="${f(glass.x)}" y="${f(glass.y)}" width="${f(glass.w)}" height="${f(glass.h)}" rx="${f(door.w * 0.05)}"/></clipPath>`;
    s += `<g clip-path="url(#${id})"><rect x="${f(glass.x)}" y="${f(glass.y)}" width="${f(glass.w)}" height="${f(glass.h)}" fill="${C.cream}"/>`;
    for (let yy = glass.y + 10; yy < glass.y + glass.h; yy += 22) for (let xx = glass.x + 10; xx < glass.x + glass.w; xx += 22) s += `<circle cx="${f(xx)}" cy="${f(yy)}" r="3" fill="${DOT}"/>`;
    if (o.doorClock !== undefined) {
      const r = glass.w * 0.3;
      s += at(glass.x + glass.w / 2, glass.y + glass.h * 0.36, 1, clockFace(r, o.doorClock));
      s += at(glass.x + glass.w / 2, glass.y + glass.h * 0.82, 1, digital(glass.w * 0.78, glass.h * 0.2, o.doorClock));
    }
    s += `<path d="M${f(glass.x + glass.w * 0.65)} ${f(glass.y)} l${f(glass.w * 0.2)} 0 l${f(-glass.w * 0.6)} ${f(glass.h)} l${f(-glass.w * 0.2)} 0Z" fill="#FFFFFF" opacity="0.45"/>`;
    s += `</g><rect x="${f(glass.x)}" y="${f(glass.y)}" width="${f(glass.w)}" height="${f(glass.h)}" rx="${f(door.w * 0.05)}" fill="none" ${st(0.8)}/>`;
  }
  s += `<circle cx="${f(door.x + lw * 0.86)}" cy="${f(door.y + dh * 0.5)}" r="${f(door.w * 0.045)}" fill="${C.yel}" ${st(0.7)}/>`;
  // campanilla
  const bx = door.x + door.w * 0.86, by = door.y - 4, br = w * 0.034;
  s += `<path d="M${f(bx - 30)} ${f(by - 14)} H${f(bx)} V${f(by)}" fill="none" ${st(0.9)} stroke-linecap="round"/>`;
  s += `<g transform="translate(${f(bx)} ${f(by)}) rotate(${f(o.bell || 0)})"><circle cx="0" cy="${f(br * 1.55)}" r="${f(br * 0.32)}" fill="${C.dred}" ${st(0.6)}/><path d="M${f(-br)} ${f(br * 1.35)} Q${f(-br)} 0 0 0 Q${f(br)} 0 ${f(br)} ${f(br * 1.35)} Z" fill="${C.yel}" ${st(0.8)} stroke-linejoin="round"/></g>`;
  // cartel de dos caras colgado en la puerta
  if (open < 0.3) {
    const sg = g.sign, nailY = sg.cy - sg.h / 2 - 40;
    const sxs = Math.max(0.02, Math.abs(Math.cos(PI * clamp(o.flip || 0))));
    s += `<circle cx="${f(sg.cx)}" cy="${f(nailY)}" r="6" fill="${INK}"/>`;
    s += `<path d="M${f(sg.cx - sg.w * 0.3 * sxs)} ${f(sg.cy - sg.h / 2 + 4)} L${f(sg.cx)} ${f(nailY)} L${f(sg.cx + sg.w * 0.3 * sxs)} ${f(sg.cy - sg.h / 2 + 4)}" fill="none" ${st(0.6)}/>`;
    s += `<g transform="translate(${f(sg.cx)} ${f(sg.cy)})">${doorSign(sg.w, sg.h, o.flip || 0, o.signShake || 0)}</g>`;
  }
  return s;
}
// calle con la panadería y tiendas genéricas a los lados
SHOP_TYPES[1] = SHOE_SHOP; // la zapatería «TUS PIES» del vídeo 01 sigue en la calle
function bakeryStreet(g, o = {}) {
  let s = '';
  const sw = o.sw || 440, gap = 50, sh = o.sh || g.h * 0.82;
  if (o.left !== false) for (let i = 1; i <= 3; i++) s += shop(g.x - i * (sw + gap), g.base, sw, sh, SHOP_TYPES[(i + 1) % 4]);
  if (o.right !== false) s += shop(g.x + g.w + gap, g.base, sw, sh, SHOP_TYPES[0]);
  return s + bakery(g, o);
}
function phoneInHand(rot = -18, shake = 0, lit = false) {
  return w => `<g transform="translate(${f(shake)} 0) rotate(${f(rot)} 206 133)"><rect x="199" y="119" width="14" height="24" rx="3" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/><rect x="201" y="121.6" width="10" height="18.4" rx="1.5" fill="${lit ? '#FFFFFF' : C.glass}"/>${lit ? `<rect x="202.2" y="123" width="7.6" height="4.5" rx="1" fill="${C.red}"/><rect x="202.2" y="129" width="7.6" height="2" rx="1" fill="${INK}" opacity="0.5"/><rect x="202.2" y="132.5" width="5" height="2" rx="1" fill="${INK}" opacity="0.5"/>` : ''}</g>` + hand(202.5, 140, w);
}
