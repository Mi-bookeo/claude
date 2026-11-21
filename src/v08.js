/* Vídeo 08 — «Dos carteles». Piezas nuevas sobre las de la serie:
   tienda genérica «TIENDA» (fachada de DETALLE ajustada), cinta «Hasta el sábado», etiquetas SIN/CON FECHA,
   calendario de hojas que se arrancan, telaraña y polvo, EL CEREBRO, reloj de cuenta atrás,
   tarjeta de oferta con fecha (móvil) y móviles de la calle con esa tarjeta. */
'use strict';

const HASTA = 'Hasta el sábado';
const stk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;

/* ===================== CINTA «Hasta el sábado» ===================== */
// cinta amarilla con colas en «V» (centrada en x,y; ancho wd)
function ribbon(x, y, wd, k = 1, rot = -3) {
  if (k <= 0.01) return '';
  const hw = wd / 2, ht = wd * 0.2, hh = ht / 2, tail = ht * 0.62, nt = ht * 0.34;
  const body = `M${f(-hw)} ${f(-hh)} H${f(hw)} V${f(hh)} H${f(-hw)}Z`;
  const tl = `M${f(-hw + 6)} ${f(-hh + ht * 0.22)} H${f(-hw - tail)} L${f(-hw - tail + nt)} ${f(ht * 0.22 + ht * 0.2)} L${f(-hw - tail)} ${f(hh + ht * 0.36)} H${f(-hw + 6)}Z`;
  const tr = `M${f(hw - 6)} ${f(-hh + ht * 0.22)} H${f(hw + tail)} L${f(hw + tail - nt)} ${f(ht * 0.22 + ht * 0.2)} L${f(hw + tail)} ${f(hh + ht * 0.36)} H${f(hw - 6)}Z`;
  let g = `<g transform="translate(${f(ht * 0.09)} ${f(ht * 0.09)})" fill="${INK}"><path d="${tl}"/><path d="${tr}"/><path d="${body}"/></g>`;
  g += `<path d="${tl}" fill="#C99A1E" ${stk()}/><path d="${tr}" fill="#C99A1E" ${stk()}/>`;
  g += `<path d="${body}" fill="${C.yel}" ${stk()}/>`;
  g += `<path d="M${f(-hw + 14)} ${f(-hh + 9)} H${f(hw * 0.2)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" stroke-linecap="round" opacity="0.7"/>`;
  g += text(HASTA, 0, ht * 0.04, { size: fit(HASTA, ht * 0.66, wd * 0.86), fill: INK, stroke: null, shadow: false });
  return at(x, y, k, g, rot);
}

/* ===================== ETIQUETAS SIN FECHA / CON FECHA ===================== */
function xCircle(x, y, r, k = 1) {
  return at(x, y, k, `<circle cx="${f(r * 0.08)}" cy="${f(r * 0.08)}" r="${f(r)}" fill="${INK}"/><circle r="${f(r)}" fill="${C.dred}" stroke="${INK}" stroke-width="${f(SW)}"/>
    <path d="M${f(-r * 0.4)} ${f(-r * 0.4)} L${f(r * 0.4)} ${f(r * 0.4)} M${f(r * 0.4)} ${f(-r * 0.4)} L${f(-r * 0.4)} ${f(r * 0.4)}" stroke="${INK}" stroke-width="${f(r * 0.36)}" stroke-linecap="round"/>
    <path d="M${f(-r * 0.4)} ${f(-r * 0.4)} L${f(r * 0.4)} ${f(r * 0.4)} M${f(r * 0.4)} ${f(-r * 0.4)} L${f(-r * 0.4)} ${f(r * 0.4)}" stroke="#FFFFFF" stroke-width="${f(r * 0.18)}" stroke-linecap="round"/>`);
}
function fechaLabel(x, y, k, ok, rot = 0) {
  if (k <= 0.01) return '';
  const wd = 470, ht = 120, label = ok ? 'CON FECHA' : 'SIN FECHA';
  let g = pill(0, 0, wd, ht, ok ? C.green : C.red, '', {});
  g += text(label, 38, 3, { size: fit(label, 74, wd - 150, 'G'), font: 'G', sw: SW * 1.8, sd: 5, ls: 2 });
  g += ok ? checkCircle(-wd / 2 + 66, 0, 46, 1) : xCircle(-wd / 2 + 66, 0, 46, 1);
  return at(x, y, k, g, rot);
}

/* ===================== CALENDARIO DE HOJAS ===================== */
const DIAS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
function calSheet(cw, n, top = false) {
  const ch = cw * 0.8;
  let g = `<rect x="${f(-cw / 2)}" y="0" width="${f(cw)}" height="${f(ch)}" rx="${f(cw * 0.06)}" fill="#FFFFFF" ${stk(0.8)}/>`;
  g += text(String(((n - 1) % 31) + 1), 0, ch * 0.42, { size: ch * 0.56, font: 'G', fill: INK, stroke: null, shadow: false });
  g += text(DIAS[(n + 3) % 7], 0, ch * 0.82, { size: ch * 0.2, fill: C.red, stroke: null, shadow: false });
  return g;
}
// bloc (centro superior x,y; ancho cw); n = número de la hoja de arriba; curl 0..1 = hoja levantándose
function calendarPad(x, y, cw, n, curl = 0) {
  const hh = cw * 0.3, ch = cw * 0.8;
  let g = `<rect x="${f(-cw / 2 + 8)}" y="8" width="${f(cw)}" height="${f(hh + ch + 6)}" rx="${f(cw * 0.08)}" fill="${INK}"/>`;
  // hojas de debajo (cantos)
  g += `<rect x="${f(-cw / 2)}" y="${f(hh)}" width="${f(cw)}" height="${f(ch + 8)}" rx="${f(cw * 0.06)}" fill="#E8DCD8" ${stk(0.8)}/>`;
  g += `<g transform="translate(0 ${f(hh)})">${calSheet(cw, n + 1)}</g>`;
  if (curl < 1) {
    const sk = curl * 0.6;
    g += `<g transform="translate(0 ${f(hh)}) scale(1 ${f(1 - sk)})">${calSheet(cw, n)}</g>`;
  }
  // cabecera roja oscura con anillas
  g += `<rect x="${f(-cw / 2)}" y="0" width="${f(cw)}" height="${f(hh)}" rx="${f(cw * 0.08)}" fill="${C.dred}" ${stk()}/>`;
  [-0.25, 0.25].forEach(u => { g += `<rect x="${f(cw * u - 6)}" y="${f(-hh * 0.35)}" width="12" height="${f(hh * 0.7)}" rx="6" fill="${C.cream}" ${stk(0.7)}/>`; });
  return at(x, y, 1, g);
}
// hoja arrancada volando (u 0..1)
function flyingSheet(x, y, cw, n, u, side = -1) {
  if (u <= 0 || u >= 1) return '';
  const px = x + side * (160 + cw) * u + side * 40 * Math.sin(u * 6), py = y - 260 * u + 420 * u * u;
  return at(px, py, 1 - 0.35 * u, `<g transform="translate(0 ${f(-cw * 0.4)})">${calSheet(cw, n)}</g>`, side * 260 * u);
}

/* ===================== TELARAÑA, POLVO ===================== */
// telaraña en una esquina superior izquierda (x,y), radio r
function cobweb(x, y, r, k = 1) {
  if (k <= 0.01) return '';
  const n = 5, ang = i => (i / (n - 1)) * PI / 2;
  let g = '';
  for (let i = 0; i < n; i++) g += `<line x1="0" y1="0" x2="${f(Math.cos(ang(i)) * r)}" y2="${f(Math.sin(ang(i)) * r)}"/>`;
  for (let j = 1; j <= 4; j++) {
    const rr = r * j / 4.3;
    let d = '';
    for (let i = 0; i < n; i++) {
      const p = [Math.cos(ang(i)) * rr, Math.sin(ang(i)) * rr];
      if (!i) d += `M${f(p[0])} ${f(p[1])}`;
      else { const a = (ang(i) + ang(i - 1)) / 2, m = rr * 0.84; d += ` Q${f(Math.cos(a) * m)} ${f(Math.sin(a) * m)} ${f(p[0])} ${f(p[1])}`; }
    }
    g += `<path d="${d}" fill="none"/>`;
  }
  return at(x, y, k, `<g stroke="${INK}" stroke-width="${f(SW * 0.55)}" stroke-linecap="round">${g}</g>`);
}
function spider(x, y, r, k = 1) {
  if (k <= 0.01) return '';
  let legs = '';
  for (let i = 0; i < 4; i++) {
    const dy = -r * 0.5 + i * r * 0.36;
    legs += `<path d="M0 ${f(dy * 0.5)} Q${f(-r * 1.2)} ${f(dy - r * 0.5)} ${f(-r * 1.6)} ${f(dy + r * 0.4)} M0 ${f(dy * 0.5)} Q${f(r * 1.2)} ${f(dy - r * 0.5)} ${f(r * 1.6)} ${f(dy + r * 0.4)}"/>`;
  }
  return at(x, y, k, `<g fill="none" stroke="${INK}" stroke-width="${f(SW * 0.7)}" stroke-linecap="round">${legs}</g><circle r="${f(r)}" fill="${INK}"/>
    <circle cx="${f(-r * 0.35)}" cy="${f(-r * 0.2)}" r="${f(r * 0.28)}" fill="#FFFFFF"/><circle cx="${f(r * 0.35)}" cy="${f(-r * 0.2)}" r="${f(r * 0.28)}" fill="#FFFFFF"/>`);
}
function dust(x, y, r, t, t0, dur = 1.6, n = 7) {
  if (t < t0) return '';
  let s = '';
  for (let i = 0; i < n; i++) {
    const ti = t0 + i * 0.18, u = (t - ti) / 0.9;
    if (u <= 0 || u >= 1 || t > t0 + dur + 0.9) continue;
    const a = i * 2.4 + 0.6, d = r * (0.85 + 0.6 * u);
    s += `<g opacity="${f(1 - u)}">${puff(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.8 + 60 * u, r * 0.2 * (0.6 + u), 1)}</g>`;
  }
  return s;
}

/* ===================== TIENDA «TIENDA» (fachada de DETALLE ajustada) ===================== */
function tiendaGeo(x, base, w, h) {
  const top = base - h, sy = top + 0.03 * h, sh = 0.1 * h, ay = top + 0.15 * h, ah = 0.1 * h, fest = (w * 1.06 / 8) / 2;
  const wy = ay + ah + fest + 0.03 * h;
  const win = { x: x + 0.05 * w, y: wy, w: 0.6 * w, h: base - 0.07 * h - wy };
  const door = { x: x + 0.71 * w, y: wy - 0.01 * h, w: 0.24 * w };
  door.h = base - door.y;
  const pr = win.w * 0.25;
  const pct = { x: win.x + win.w * 0.5, y: win.y + win.h * 0.05 + pr * 1.08, r: pr };
  const rib = { x: pct.x, y: pct.y + pr * 1.05, w: win.w * 0.84 };
  const cal = { x: win.x + win.w * 0.24, y: win.y + win.h * 0.64, w: win.w * 0.3 };
  const reg = { x: win.x + win.w * 0.73, y: win.y + win.h - 6, s: win.w / 560 };
  return { x, base, w, h, top, sy, sh, ay, ah, win, door, pct, rib, cal, reg };
}
// o: pct (escala del cartel), pctA (opacidad), pctK (tamaño extra), rib (escala de la cinta), ribK, page, curl,
//    web (telaraña), bell, open (puerta), inside(fn), drawer, t, signK
function tiendaShop(x, base, w, h, o = {}) {
  const g = tiendaGeo(x, base, w, h), { top, sy, sh, ay, ah, win, door } = g;
  let s = `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="${C.cream}"/>`;
  s += `<rect x="${f(x + w * 0.9)}" y="${f(top + w * 0.02)}" width="${f(w * 0.1)}" height="${f(h + 30)}" fill="${INK}" opacity="0.16"/>`;
  s += `<rect x="${f(x)}" y="${f(top)}" width="${f(w)}" height="${f(h + 30)}" rx="${f(w * 0.02)}" fill="none" ${stk()}/>`;
  // rótulo genérico «TIENDA»: letras crema sobre rojo oscuro
  const pw = w * 0.8, sd = Math.max(5, w * 0.011);
  s += `<rect x="${f(x + (w - pw) / 2 + sd)}" y="${f(sy + sd)}" width="${f(pw)}" height="${f(sh)}" rx="${f(sh * 0.25)}" fill="${INK}"/>`;
  s += `<rect x="${f(x + (w - pw) / 2)}" y="${f(sy)}" width="${f(pw)}" height="${f(sh)}" rx="${f(sh * 0.25)}" fill="${C.dred}" ${stk()}/>`;
  s += text('TIENDA', x + w / 2, sy + sh * 0.56, { size: fit('TIENDA', sh * 0.8, pw * 0.8), fill: C.cream, sw: SW * 1.5, sd: 4, ls: Math.round(w * 0.012) });
  s += awning(x + w * 0.04, x + w * 0.96, x - w * 0.03, x + w * 1.03, ay, ah, 8);
  // escaparate: cartel «%» (+ cinta), calendario de hojas y caja registradora
  s += glassWindow(win.x, win.y, win.w, win.h, () => {
    let gi = `<line x1="${f(win.x + 6)}" y1="${f(win.y + win.h - 6)}" x2="${f(win.x + win.w - 6)}" y2="${f(win.y + win.h - 6)}" ${stk(0.8)}/>`;
    gi += `<g transform="translate(${f(g.reg.x)} ${f(g.reg.y)}) scale(${f(g.reg.s)}) translate(${f(-g.reg.x)} ${f(-g.reg.y)})">${register(g.reg.x, g.reg.y, o.drawer || 0, true)}</g>`;
    gi += calendarPad(g.cal.x, g.cal.y, g.cal.w, o.page || 12, o.curl || 0);
    return gi;
  });
  const pk = (o.pctK || 1), pa = o.pctA === undefined ? 1 : o.pctA;
  const py = win.y + win.h * 0.05 + g.pct.r * pk * 1.08;
  if (o.pct) s += `<g opacity="${f(pa)}">` + pctSign(g.pct.x, py, g.pct.r * pk, o.pct, -6) + `</g>`;
  if (o.rib) s += ribbon(g.rib.x, py + g.pct.r * pk * 1.02, g.rib.w * pk, o.rib * (o.ribK || 1), -4);
  if (o.web) s += cobweb(win.x + SW * 0.6, win.y + SW * 0.6, win.w * 0.34, o.web) + spider(win.x + win.w * 0.2, win.y + win.w * 0.2 + 8 * Math.sin((o.t || 0) * 2), win.w * 0.025, o.web);
  s += `<rect x="${f(win.x - w * 0.02)}" y="${f(win.y + win.h)}" width="${f(win.w + w * 0.04)}" height="${f(h * 0.03)}" rx="4" fill="#FFFFFF" ${stk()}/>`;
  // puerta: hueco interior + hoja (bisagra a la izquierda)
  const open = clamp(o.open || 0);
  s += `<rect x="${f(door.x)}" y="${f(door.y)}" width="${f(door.w)}" height="${f(door.h + 10)}" rx="${f(door.w * 0.07)}" fill="#3A2E2A" ${stk()}/>`;
  if (open > 0) s += `<rect x="${f(door.x + 6)}" y="${f(door.y + door.h * 0.8)}" width="${f(door.w - 12)}" height="${f(door.h * 0.2)}" fill="${C.wood}"/>`;
  if (o.inside) s += o.inside(door);
  const lw = door.w * (1 - 0.8 * open);
  s += `<path d="M${f(door.x)} ${f(door.y)} L${f(door.x + lw)} ${f(door.y - 16 * open)} L${f(door.x + lw)} ${f(door.y + door.h + 10 + 16 * open)} L${f(door.x)} ${f(door.y + door.h + 10)}Z" fill="${C.navy}" ${stk()}/>`;
  if (open < 0.5) {
    s += `<rect x="${f(door.x + lw * 0.16)}" y="${f(door.y + door.w * 0.16)}" width="${f(lw * 0.68)}" height="${f(door.h * 0.44)}" rx="${f(door.w * 0.05)}" fill="${C.glass}" ${stk(0.8)}/>`;
    s += `<path d="M${f(door.x + lw * 0.5)} ${f(door.y + door.w * 0.16 + SW)} l${f(lw * 0.18)} 0 l${f(-lw * 0.3)} ${f(door.h * 0.44 - 2 * SW)} l${f(-lw * 0.18)} 0Z" fill="#FFFFFF" opacity="0.5"/>`;
    s += `<circle cx="${f(door.x + lw * 0.82)}" cy="${f(door.y + door.h * 0.6)}" r="${f(door.w * 0.06)}" fill="${C.yel}" ${stk(0.7)}/>`;
  }
  // campanilla
  const bx = door.x + door.w * 0.84, by = door.y - 4, br = w * 0.032;
  s += `<path d="M${f(bx - 30)} ${f(by - 14)} H${f(bx)} V${f(by)}" fill="none" ${stk(0.9)} stroke-linecap="round"/>`;
  s += `<g transform="translate(${f(bx)} ${f(by)}) rotate(${f(o.bell || 0)})"><circle cx="0" cy="${f(br * 1.55)}" r="${f(br * 0.32)}" fill="${C.dred}" ${stk(0.6)}/><path d="M${f(-br)} ${f(br * 1.35)} Q${f(-br)} 0 0 0 Q${f(br)} 0 ${f(br)} ${f(br * 1.35)} Z" fill="${C.yel}" ${stk(0.8)}/></g>`;
  return s;
}

/* ===================== EL CEREBRO ===================== */
const BR_LOBES = [[-118, -8, 82], [-74, -78, 84], [0, -104, 88], [76, -80, 84], [122, -8, 80], [84, 52, 78], [0, 64, 84], [-84, 52, 78], [0, -10, 120]];
// o: mode 'sleepy' | 'alert', t, arms (0 abajo .. 1 arriba), legs (separación), blink
function brainChar(x, y, sc, o = {}) {
  const k = SW / sc, alert = o.mode === 'alert', t = o.t || 0;
  const pinkS = '#D9739A';
  const limb = (x1, y1, x2, y2, col) => `<path d="M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)}" stroke="${INK}" stroke-width="${f(30 + 2 * k)}" stroke-linecap="round"/><path d="M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)}" stroke="${col}" stroke-width="30" stroke-linecap="round"/>`;
  let g = '';
  // piernas y zapatillas
  const ls = o.legs || 0;
  [[-1, 1], [1, 0]].forEach(([sd]) => {
    const x1 = sd * 52, x2 = sd * (58 + ls * 40), y2 = 232 - ls * 14;
    g += limb(x1, 140, x2, y2, pinkS);
    g += `<path d="M${f(x2 - 30 + sd * 8)} ${f(y2 + 4)} Q${f(x2 - 30 + sd * 8)} ${f(y2 - 24)} ${f(x2 + sd * 6)} ${f(y2 - 22)} Q${f(x2 + 38 + sd * 8)} ${f(y2 - 18)} ${f(x2 + 38 + sd * 8)} ${f(y2 + 4)}Z" fill="${C.red}" stroke="${INK}" stroke-width="${f(k)}" stroke-linejoin="round"/>`;
  });
  // brazos (detrás del cuerpo)
  const ar = o.arms || 0;
  [-1, 1].forEach(sd => {
    const x1 = sd * 178, y1 = 24, a = lerp(30, -60, ar) * PI / 180, L = 92;
    const x2 = x1 + sd * Math.cos(a) * L, y2 = y1 + Math.sin(a) * L * (ar > 0.5 ? 1 : 1) + lerp(70, 0, ar);
    g += limb(x1, y1, x2, y2, pinkS);
    g += `<circle cx="${f(x2)}" cy="${f(y2)}" r="24" fill="${C.pink}" stroke="${INK}" stroke-width="${f(k)}"/>`;
    if (ar > 0.5) g += `<path d="M${f(x2 - 8)} ${f(y2 - 22)} V${f(y2 - 42)} M${f(x2 + 8)} ${f(y2 - 22)} V${f(y2 - 44)}" stroke="${INK}" stroke-width="${f(k)}" stroke-linecap="round"/>`;
  });
  // silueta: sombra dura, contorno y relleno
  let c = '';
  BR_LOBES.forEach(([cx, cy, r]) => { c += `<circle cx="${cx}" cy="${cy}" r="${r}"/>`; });
  g += `<g transform="translate(${f(12)} ${f(12)})" fill="${INK}" stroke="${INK}" stroke-width="${f(2 * k)}">${c}</g>`;
  g += `<g fill="${INK}" stroke="${INK}" stroke-width="${f(2 * k)}">${c}</g><g fill="${C.pink}">${c}</g>`;
  // sombra plana en un lado (derecha-abajo)
  g += `<path d="M150 -60 Q205 0 175 50 Q140 130 40 140 Q120 90 150 -60Z" fill="${pinkS}" opacity="0.7"/>`;
  // pliegues
  const folds = ['M0 -186 Q-16 -150 4 -122 Q20 -96 -2 -66', 'M-160 -40 Q-126 -54 -112 -22 Q-100 8 -132 26', 'M-108 -130 Q-80 -118 -86 -84 Q-90 -60 -62 -50',
    'M62 -150 Q44 -120 70 -104 Q98 -88 86 -58', 'M170 -50 Q136 -34 150 -4 Q164 26 132 40', 'M-64 108 Q-40 88 -16 108', 'M30 116 Q54 94 80 112',
    'M-40 -150 Q-30 -130 -46 -112', 'M128 -110 Q110 -100 116 -80'];
  folds.forEach(d => { g += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${f(k * 0.85)}" stroke-linecap="round"/>`; });
  g += `<path d="M-150 -70 A110 110 0 0 1 -60 -158" fill="none" stroke="#FFFFFF" stroke-width="${f(k * 1.1)}" stroke-linecap="round" opacity="0.75"/>`;
  // cara
  const L_ = (d, wd = 1) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${f(k * wd)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  g += `<ellipse cx="-86" cy="40" rx="20" ry="11" fill="${C.red}" opacity="0.35"/><ellipse cx="86" cy="40" rx="20" ry="11" fill="${C.red}" opacity="0.35"/>`;
  if (!alert) {
    // adormilado: párpados caídos, boca pequeña de bostezo
    [-52, 52].forEach(ex => {
      g += `<path d="M${ex - 26} 4 A26 26 0 0 0 ${ex + 26} 4Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(k)}"/>`;
      g += `<circle cx="${ex + 2}" cy="${f(12)}" r="8" fill="${INK}"/>`;
      g += `<path d="M${ex - 28} 4 H${ex + 28}" stroke="${INK}" stroke-width="${f(k * 1.3)}" stroke-linecap="round"/>`;
      g += `<path d="M${ex - 26} 4 A26 22 0 0 1 ${ex + 26} 4" fill="${C.pink}" stroke="${INK}" stroke-width="${f(k)}"/>`;
    });
    const yawn = 0.5 + 0.5 * Math.sin(t * 2.2);
    g += `<ellipse cx="6" cy="66" rx="${f(12 + 4 * yawn)}" ry="${f(9 + 8 * yawn)}" fill="${C.dred}" stroke="${INK}" stroke-width="${f(k)}"/>`;
    g += L_('M-80 -26 Q-56 -20 -30 -24 M30 -24 Q56 -20 80 -26', 0.9);
  } else {
    // alerta / exaltado: ojos muy abiertos, cejas arriba, bocaza abierta
    [-54, 54].forEach(ex => {
      g += `<circle cx="${ex}" cy="2" r="34" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(k)}"/>`;
      g += `<circle cx="${ex + 3}" cy="4" r="13" fill="${INK}"/><circle cx="${ex - 2}" cy="-2" r="4.5" fill="#FFFFFF"/>`;
    });
    g += L_('M-92 -54 Q-60 -78 -26 -58 M26 -58 Q60 -78 92 -54', 1.1);
    g += `<path d="M-40 52 Q0 50 40 52 Q38 104 0 106 Q-38 104 -40 52Z" fill="${C.dred}" stroke="${INK}" stroke-width="${f(k)}" stroke-linejoin="round"/>`;
    g += `<path d="M-30 54 H30 V64 Q0 68 -30 64Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(k * 0.6)}"/>`;
    g += `<ellipse cx="0" cy="92" rx="18" ry="8" fill="${C.pink}"/>`;
  }
  return at(x, y, sc, g, o.rot || 0);
}
// «z» de sueño
function zzz(x, y, t) {
  let s = '';
  for (let i = 0; i < 3; i++) {
    const u = ((t * 0.7 + i / 3) % 1);
    s += at(x + 60 * u + 20 * Math.sin(u * 6), y - 160 * u, 0.5 + 0.7 * u, text('z', 0, 0, { size: 90, font: 'G', fill: '#FFFFFF', sw: SW * 1.5, sd: 4 }), -12);
  }
  return s;
}
// líneas de impacto cortas alrededor de un punto (elipse rx, ry)
function impactRing(cx, cy, rx, ry, t, n = 16) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = i / n * 2 * PI + 0.2, j = 1 + 0.08 * Math.sin(t * 40 + i * 2);
    const x1 = cx + Math.cos(a) * rx * j, y1 = cy + Math.sin(a) * ry * j, x2 = cx + Math.cos(a) * (rx * j + 70 + 30 * (i % 2)), y2 = cy + Math.sin(a) * (ry * j + 70 + 30 * (i % 2));
    s += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${INK}" stroke-width="${f(SW * 1.5)}" stroke-linecap="round"/>`;
  }
  return s;
}
// reloj de cuenta atrás: esfera con campanas, manecilla que gira rápido y líneas de vibración
function countdownClock(x, y, r, k, t, on) {
  if (k <= 0.01) return '';
  let g = '';
  if (on) g += flashBurst(0, 0, r * 1.7, 1, t * 40);
  g += clockFace(r, 600 - t * 140, { bells: true });
  // patas
  g += `<path d="M${f(-r * 0.6)} ${f(r * 0.8)} l${f(-r * 0.22)} ${f(r * 0.3)} M${f(r * 0.6)} ${f(r * 0.8)} l${f(r * 0.22)} ${f(r * 0.3)}" stroke="${INK}" stroke-width="${f(SW * 1.6)}" stroke-linecap="round"/>`;
  if (on) [-1, 1].forEach(sd => {
    g += `<path d="M${f(sd * r * 1.3)} ${f(-r * 0.6)} q${f(sd * 26)} ${f(r * 0.6)} 0 ${f(r * 1.2)} M${f(sd * r * 1.55)} ${f(-r * 0.8)} q${f(sd * 34)} ${f(r * 0.8)} 0 ${f(r * 1.6)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.2)}" stroke-linecap="round"/>`;
  });
  return at(x, y, k, g, on ? 9 * Math.sin(t * 46) : 0);
}
// estallido con texto («¡AHORA!»)
function shoutBurst(x, y, k, label, t, fill = C.yel, r = 200) {
  if (k <= 0.01) return '';
  const d = starPath(r, r * 0.7, 13);
  let g = `<g transform="scale(1 0.62)"><path d="${d}" transform="translate(10 14)" fill="${INK}"/><path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${f(SW * 1.4)}" stroke-linejoin="round"/></g>`;
  g += text(label, 0, 6, { size: fit(label, r * 0.6, r * 1.45, 'G'), font: 'G', fill: '#FFFFFF', sw: SW * 2, sd: 6, ls: 2 });
  return at(x, y, k, g, -6 + 3 * Math.sin(t * 18));
}
// nube de pensamiento con texto y burbujitas hacia (hx, hy)
function thought(cx, cy, wd, ht, k, label, hx, hy, size = 74) {
  if (k <= 0.01) return '';
  let s = '';
  [[0.25, 16], [0.5, 24]].forEach(([u, r]) => { s += thinkDot(lerp(hx, cx, u), lerp(hy, cy + ht * 0.4, u), r, k); });
  s += thinkCloud(cx, cy, wd, ht, k);
  s += at(cx, cy, k, text(label, 0, 4, { size: fit(label, size, wd * 0.78), fill: INK, stroke: null, shadow: false }));
  return s;
}

/* ===================== TARJETA DE OFERTA CON FECHA (móvil grande) ===================== */
function offerCard8(x, y, wd, ht, o = {}, t = 0) {
  let g = panel(x, y, wd, ht, 34, '#FFFFFF', 12);
  const ih = ht * 0.44;
  g += `<rect x="${f(x + 20)}" y="${f(y + 20)}" width="${f(wd - 40)}" height="${f(ih)}" rx="24" fill="${C.glass}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  g += `<circle cx="${f(x + wd / 2)}" cy="${f(y + 20 + ih / 2)}" r="${f(ih * 0.42)}" fill="#FFFFFF" opacity="0.7"/>`;
  g += pctSign(x + wd / 2, y + 20 + ih / 2, ih * 0.34, o.kPct === undefined ? 1 : o.kPct, -8 + 3 * Math.sin(t * 2.2));
  g += sparkle(x + wd * 0.2, y + 20 + ih * 0.28, 22, o.kPct === undefined ? 1 : o.kPct);
  g += sparkle(x + wd * 0.8, y + 20 + ih * 0.72, 18, o.kPct === undefined ? 1 : o.kPct);
  const ty = y + 20 + ih + 70;
  g += text('Oferta', x + 36, ty, { size: 104, font: 'G', anchor: 'start', fill: C.red, sw: SW * 1.6, sd: 5, ls: 2 });
  const kt = o.kTag === undefined ? 1 : o.kTag;
  if (kt > 0.01) g += at(x + 36 + 190, ty + 112, kt, pill(0, 0, 380, 96, C.yel, HASTA, { size: 50, col: INK, pad: 40 }), -3);
  return g;
}
// tarjeta compacta (centrada en 0,0; 860 x 330) para la calle
function offerMini8(t = 0) {
  const Wd = 860, Hd = 330, x0 = -Wd / 2, y0 = -Hd / 2, hh = 104, id = 'om' + (uid++);
  let g = panel(x0, y0, Wd, Hd, 40, '#FFFFFF', 14);
  g += `<clipPath id="${id}"><rect x="${x0}" y="${y0}" width="${Wd}" height="${Hd}" rx="40"/></clipPath>`;
  g += `<g clip-path="url(#${id})"><rect x="${x0}" y="${y0}" width="${Wd}" height="${hh}" fill="${C.red}"/></g>`;
  g += `<line x1="${x0}" y1="${y0 + hh}" x2="${x0 + Wd}" y2="${y0 + hh}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  g += `<rect x="${x0}" y="${y0}" width="${Wd}" height="${Hd}" rx="40" fill="none" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  const ir = hh * 0.36, icx = x0 + 28 + ir, icy = y0 + hh / 2;
  g += `<rect x="${f(icx - ir)}" y="${f(icy - ir)}" width="${f(ir * 2)}" height="${f(ir * 2)}" rx="${f(ir * 0.42)}" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>` + logoIcon(icx, icy + ir * 0.05, ir * 1.85);
  g += text('Escaparate de Tudela', icx + ir + 22, icy + 2, { size: 46, anchor: 'start', sw: SW * 1.4, sd: 4 });
  const bx = x0 + 28, by = y0 + hh + 22, bh = Hd - hh - 44;
  g += `<rect x="${bx}" y="${by}" width="210" height="${bh}" rx="22" fill="${C.glass}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  g += pctSign(bx + 105, by + bh / 2, 70, 1, -8 + 3 * Math.sin(t * 2.6));
  const tx = bx + 250;
  g += text('Oferta', tx, by + 50, { size: 86, font: 'G', anchor: 'start', fill: C.red, sw: SW * 1.5, sd: 4, ls: 2 });
  g += at(tx + 180, by + 140, 1, pill(0, 0, 360, 80, C.yel, HASTA, { size: 44, col: INK, pad: 40 }), -2);
  return g;
}

/* ===================== MÓVILES DE LA CALLE (pantalla con la oferta «%» + fecha) ===================== */
function pctPhoneHand(hx, hy, o = {}) {
  return w => {
    const rot = o.rot === undefined ? -12 : o.rot, sh = o.shake || 0, ps = o.ps || 1;
    let g = `<g transform="translate(${f(hx + 3 + sh)} ${f(hy - 13 * ps)}) rotate(${f(rot)}) scale(${f(ps)})">`;
    g += `<rect x="-10.5" y="-18" width="21" height="36" rx="3.6" fill="${INK}" stroke="${INK}" stroke-width="${w(2)}"/>`;
    if (o.lit) {
      g += `<rect x="-8.3" y="-15.4" width="16.6" height="31" rx="2" fill="${C.cream}"/>`;
      g += `<rect x="-8.3" y="-15.4" width="16.6" height="6" fill="${C.red}"/><circle cx="-4.6" cy="-12.4" r="1.9" fill="#FFFFFF"/>`;
      g += `<rect x="-6.8" y="-6.4" width="13.6" height="18" rx="1.6" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(0.9)}"/>`;
      g += `<circle cx="0" cy="-0.6" r="4.2" fill="${C.red}" stroke="${INK}" stroke-width="${w(0.7)}"/>`;
      g += `<path d="M-1.6 1.2 L1.6 -2.4" stroke="#FFFFFF" stroke-width="${w(0.8)}" stroke-linecap="round"/><circle cx="-1.4" cy="-1.8" r="0.7" fill="#FFFFFF"/><circle cx="1.4" cy="0.8" r="0.7" fill="#FFFFFF"/>`;
      g += `<rect x="-5.6" y="5.6" width="11.2" height="3.6" rx="0.8" fill="${C.yel}" stroke="${INK}" stroke-width="${w(0.6)}"/>`;
    } else g += `<rect x="-8.3" y="-15.4" width="16.6" height="31" rx="2" fill="${C.glass}"/>`;
    g += `</g>`;
    g += `<circle cx="${hx}" cy="${hy}" r="4.3" fill="${o.skin || C.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;
    return g;
  };
}
function streetPerson8(i, x, foot, sc, o) {
  const p = FOLK[i], s = sc * (p.scale || 1), armF = o.armF || 0;
  const svg = placeFolk(i, x, foot, sc, Object.assign({}, o, { handF: pctPhoneHand(202.5, 139.5, Object.assign({}, o, { skin: p.skin })) }));
  const a = armF * PI / 180, hx = 202 - 31.5 * Math.sin(a), hy = 108 + 31.5 * Math.cos(a);
  return { svg: shadowEll(x, foot, 26 * s) + svg, phone: toWorld(x, foot, 190, 204, s, hx + 3, hy - 13, o.flip), head: toWorld(x, foot, 190, 204, s, 192, 60, o.flip) };
}

/* ===================== MANO QUE SUJETA EL MÓVIL (del vídeo 06) ===================== */
function holdHand(X, Y, PW, PH) {
  const st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  const by = Y + PH - 150;
  const back = `<path d="M180 2100 L250 ${by + 260} Q300 ${by + 120} ${X + 60} ${by + 60} L${X + PW * 0.75} ${by + 30} Q${X + PW + 40} ${by + 120} ${X + PW * 0.9} ${by + 260} L${X + PW * 0.75} 2100 Z" fill="${C.skin}" ${st}/>
    <path d="M100 2100 L170 ${by + 330} Q260 ${by + 290} 360 ${by + 330} L400 2100Z" fill="${C.yel}" ${st}/>
    <path d="M170 ${by + 330} Q260 ${by + 290} 360 ${by + 330} L366 ${by + 380} Q260 ${by + 340} 176 ${by + 380}Z" fill="#C99A1E" ${st}/>`;
  const front = `<path d="M${X - 30} ${by + 190} Q${X - 40} ${by + 40} ${X + 20} ${by - 30} Q${X + 50} ${by - 54} ${X + 64} ${by - 20} Q${X + 40} ${by + 60} ${X + 46} ${by + 190}Z" fill="${C.skin}" ${st}/>
    <path d="M${X + PW - 18} ${by - 120} q52 -4 52 30 q0 32 -52 32 Z M${X + PW - 18} ${by - 40} q48 -2 48 30 q0 30 -48 30 Z M${X + PW - 18} ${by + 36} q42 -2 42 28 q0 28 -42 28 Z" fill="${C.skin}" ${st}/>`;
  return { back, front };
}
