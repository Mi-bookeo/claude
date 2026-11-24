/* Vídeo 16 — «El hueco de las cinco». Piezas nuevas sobre lib.js + series.js + v04…v15.js + sara.js:
   agenda de la tableta (rejilla 9:00–20:00, hueco rojo que parpadea / ocupado con tic), interior de la peluquería
   (pared de puntos, ventana con cielo de tarde, estantes con botes genéricos, reloj grande, espejos, sillones,
   lavacabezas, secador de casco, suelo de baldosas), balanza cómic (etiqueta «%» frente a regalo con espuma),
   tarjeta de oferta flash de peluquería (sin precios), chat genérico con la clienta, fachada morada de la peluquería
   (toldo de rayas moradas y crema con festón, campanilla, escaparate con maniquí peinado, rótulo «PELUQUERÍA»). */
'use strict';

const st16 = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
const P16 = { purple: '#7E57C2', purpleS: '#5E3FA0', purpleL: '#B39DDB', tile: '#F2B5AD', blueBar: '#3F7CC4', redL: '#FBD3D3' };
// datos editables (config.json -> ejemplo)
const EJ = () => Object.assign({
  hueco: 17, reloj: 15, inicio: 9, fin: 20,
  citas: { 9: 'Eva', 10: 'Ana', 11: 'Lola', 12: 'Inés', 13: 'Pili', 14: 'Sofía', 15: 'Noa', 16: 'Mar', 18: 'Bea', 19: 'Luz', 20: 'Alba' },
  nombreHueco: 'Clienta'
}, (CFG && CFG.ejemplo) || {});
const hh = h => `${h}:00`;
// cámara: el punto del mundo (wx,wy) queda en la pantalla en (sx,sy) con zoom z
function camAt(z, wx, wy, sx, sy, inner) {
  return `<g transform="translate(${f(sx)} ${f(sy)}) scale(${f(z)}) translate(${f(-wx)} ${f(-wy)})">${inner}</g>`;
}
// latido (dos golpes por segundo y pico)
function beat(t, per = 0.9) { const u = ((t % per) + per) % per; return Math.max(0, damp(u, 18, 9)) + 0.55 * Math.max(0, damp(u - 0.2, 18, 9)) * (u > 0.2 ? 1 : 0); }

/* ===================== AGENDA ===================== */
// rejilla horaria en (x,y,wd,ht). o: on (parpadeo del hueco), kBeat (escala del hueco), filled (0..1 ocupado + tic), rows (lista de horas)
function agendaGrid(x, y, wd, ht, o = {}, t = 0) {
  const E = EJ(), rows = o.rows || Array.from({ length: E.fin - E.inicio + 1 }, (_, i) => E.inicio + i);
  const hd = o.hdr || 120, rh = (ht - hd) / rows.length, sz = o.size || Math.min(48, rh * 0.56);
  let g = `<rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="${f(ht)}" fill="#FFFFFF"/>`;
  // cabecera
  g += `<rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="${f(hd)}" fill="${C.navy}"/><line x1="${f(x)}" y1="${f(y + hd)}" x2="${f(x + wd)}" y2="${f(y + hd)}" ${st16(0.8)}/>`;
  g += calendarBadge(x + hd * 0.55, y + hd / 2 + 2, hd * 0.3, 1);
  g += text('Agenda · Hoy', x + hd * 1.05, y + hd / 2 + 2, { size: fit('Agenda · Hoy', hd * 0.46, wd - hd * 1.3), anchor: 'start', sw: SW * 1.3, sd: 4 });
  const tx = x + (o.tcol || Math.max(110, wd * 0.2));
  rows.forEach((h, i) => {
    const ry = y + hd + i * rh;
    if (i % 2) g += `<rect x="${f(x)}" y="${f(ry)}" width="${f(wd)}" height="${f(rh)}" fill="#F6F1F0"/>`;
    g += `<line x1="${f(x)}" y1="${f(ry + rh)}" x2="${f(x + wd)}" y2="${f(ry + rh)}" stroke="#D9CFCC" stroke-width="${f(SW * 0.35)}"/>`;
    g += text(hh(h), tx - 18, ry + rh / 2 + 2, { size: sz * 0.9, anchor: 'end', fill: h === E.hueco ? C.red : '#6B6262', stroke: null, shadow: false });
    const bx = tx, bw = x + wd - 22 - bx, by = ry + rh * 0.13, bh = rh * 0.74;
    if (h !== E.hueco) {
      g += `<rect x="${f(bx)}" y="${f(by)}" width="${f(bw)}" height="${f(bh)}" rx="${f(bh * 0.28)}" fill="${P16.blueBar}" stroke="${INK}" stroke-width="${f(SW * 0.55)}"/>`;
      g += `<rect x="${f(bx + 10)}" y="${f(by + 8)}" width="8" height="${f(bh - 16)}" rx="4" fill="#FFFFFF" opacity="0.8"/>`;
      g += text(E.citas[h] || 'Cita', bx + 34, by + bh / 2 + 2, { size: sz, anchor: 'start', fill: '#FFFFFF', stroke: null, shadow: false });
    } else {
      const fl = clamp(o.filled || 0);
      const cx = bx + bw / 2, cy = by + bh / 2, kb = o.kBeat || 1;
      let r = '';
      if (fl < 0.5) {
        r += `<rect x="${f(-bw / 2 + 7)}" y="${f(-bh / 2 + 7)}" width="${f(bw)}" height="${f(bh)}" rx="${f(bh * 0.28)}" fill="${INK}"/>`;
        r += `<rect x="${f(-bw / 2)}" y="${f(-bh / 2)}" width="${f(bw)}" height="${f(bh)}" rx="${f(bh * 0.28)}" fill="${o.on === false ? P16.redL : C.red}" ${st16(0.9)}/>`;
        r += text('LIBRE', 0, 3, { size: sz * 1.05, font: 'G', fill: o.on === false ? C.red : '#FFFFFF', sw: SW * 1.2, sd: 3, ls: 3, stroke: o.on === false ? null : INK, shadow: o.on !== false });
      } else {
        r += `<rect x="${f(-bw / 2)}" y="${f(-bh / 2)}" width="${f(bw)}" height="${f(bh)}" rx="${f(bh * 0.28)}" fill="${P16.blueBar}" stroke="${INK}" stroke-width="${f(SW * 0.55)}"/>`;
        r += `<rect x="${f(-bw / 2 + 10)}" y="${f(-bh / 2 + 8)}" width="8" height="${f(bh - 16)}" rx="4" fill="#FFFFFF" opacity="0.8"/>`;
        r += text(E.nombreHueco, -bw / 2 + 34, 2, { size: fit(E.nombreHueco, sz, bw - 50 - bh * 0.85), anchor: 'start', fill: '#FFFFFF', stroke: null, shadow: false });
        r += checkCircle(bw / 2 - bh * 0.42, 0, bh * 0.38, pop(o.tickT || 1, 0, 0.45));
      }
      g += at(cx, cy, kb, r);
    }
  });
  g += `<rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="${f(ht)}" fill="none" ${st16(0.8)}/>`;
  return g;
}
// tableta (marco oscuro) con la agenda dentro
function tabletAgenda(X, Y, PW, PH, o = {}, t = 0) {
  const b = o.bezel || 26, R = o.r || 46, id = 'tb' + (uid++);
  let g = `<rect x="${f(X + 16)}" y="${f(Y + 16)}" width="${f(PW)}" height="${f(PH)}" rx="${R}" fill="${INK}"/>`;
  g += `<rect x="${f(X)}" y="${f(Y)}" width="${f(PW)}" height="${f(PH)}" rx="${R}" fill="#2E2A2A" ${st16()}/>`;
  g += `<clipPath id="${id}"><rect x="${f(X + b)}" y="${f(Y + b)}" width="${f(PW - 2 * b)}" height="${f(PH - 2 * b)}" rx="${f(R * 0.45)}"/></clipPath>`;
  g += `<g clip-path="url(#${id})">${agendaGrid(X + b, Y + b, PW - 2 * b, PH - 2 * b, o, t)}</g>`;
  g += `<rect x="${f(X + b)}" y="${f(Y + b)}" width="${f(PW - 2 * b)}" height="${f(PH - 2 * b)}" rx="${f(R * 0.45)}" fill="none" ${st16(0.7)}/>`;
  g += `<circle cx="${f(X + PW / 2)}" cy="${f(Y + b / 2)}" r="${f(b * 0.18)}" fill="#5A5252"/>`;
  return g;
}
// posición del hueco en una agenda (centro) para colocar la cartela
function huecoPos(x, y, wd, ht, o = {}) {
  const E = EJ(), rows = o.rows || Array.from({ length: E.fin - E.inicio + 1 }, (_, i) => E.inicio + i);
  const hd = o.hdr || 120, rh = (ht - hd) / rows.length, i = rows.indexOf(E.hueco);
  const tx = x + (o.tcol || Math.max(110, wd * 0.2)), bw = x + wd - 22 - tx;
  return [tx + bw / 2, y + hd + (i + 0.5) * rh, bw, rh * 0.74];
}
// agenda en miniatura (pantalla de la tableta en las manos de Sara; local)
function miniAgenda(on, filled) {
  return (x, y, wd, ht, w) => {
    const E = EJ();
    let g = `<rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="${f(ht)}" rx="1.6" fill="#FFFFFF"/><rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="4.2" fill="${C.navy}"/>`;
    const n = E.fin - E.inicio + 1, rh = (ht - 5.6) / n;
    for (let i = 0; i < n; i++) {
      const h = E.inicio + i, ry = y + 5 + i * rh, isH = h === E.hueco;
      const col = isH && filled < 0.5 ? (on ? C.red : P16.redL) : P16.blueBar;
      g += `<rect x="${f(x + 5)}" y="${f(ry + 0.3)}" width="${f(wd - 6.4)}" height="${f(rh - 0.7)}" rx="0.7" fill="${col}"/>`;
      g += `<rect x="${f(x + 1.2)}" y="${f(ry + rh * 0.35)}" width="2.6" height="${f(rh * 0.3)}" fill="#9A8F8C"/>`;
    }
    return g;
  };
}
// cartela «17:00» (amarilla, en cómic) que señala el hueco
function huecoTag(x, y, k, rot, label, size = 120) {
  if (k <= 0.01) return '';
  const wd = measure(label, size, 'G') + 90, ht = size * 1.2;
  let g = `<rect x="${f(-wd / 2 + 12)}" y="${f(-ht / 2 + 12)}" width="${f(wd)}" height="${f(ht)}" rx="26" fill="${INK}"/>`;
  g += `<rect x="${f(-wd / 2)}" y="${f(-ht / 2)}" width="${f(wd)}" height="${f(ht)}" rx="26" fill="${C.yel}" ${st16(1.1)}/>`;
  g += text(label, 0, 6, { size, font: 'G', fill: C.red, sw: SW * 1.8, sd: 6, ls: 3 });
  return at(x, y, k, g, rot);
}

/* ===================== INTERIOR DE LA PELUQUERÍA ===================== */
const ROOM = { floor: 1300, win: [60, 300, 270, 300], shelf: [388, 662, 470, 612], clock: [875, 440, 100], mirA: [80, 690, 250, 380], mirB: [400, 690, 250, 380], chairA: 205, chairB: 525, chairSc: 4.6 };
function eveWindow(x, y, wd, ht, T, o = {}) {
  const id = 'ew' + (uid++), fr = o.fr || 22;
  let s = `<rect x="${f(x - fr + 12)}" y="${f(y - fr + 12)}" width="${f(wd + 2 * fr)}" height="${f(ht + 2 * fr)}" rx="16" fill="${INK}"/>`;
  s += `<rect x="${f(x - fr)}" y="${f(y - fr)}" width="${f(wd + 2 * fr)}" height="${f(ht + 2 * fr)}" rx="16" fill="#FFFFFF" ${st16()}/>`;
  s += `<clipPath id="${id}"><rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="${f(ht)}"/></clipPath><g clip-path="url(#${id})">`;
  s += `<rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="${f(ht)}" fill="#F7C9A3"/><rect x="${f(x)}" y="${f(y + ht * 0.62)}" width="${f(wd)}" height="${f(ht)}" fill="#FBE3C8"/>`;
  s += sun(x + wd * 0.72, y + ht * 0.3, o.sr || Math.min(wd, ht) * 0.13, T * 10);
  const cs = o.cs || wd / 700;
  [[0.0, 0.3, 0.9, 13], [0.42, 0.56, 0.7, 8], [0.78, 0.18, 0.6, 16]].forEach(([u0, v, sc, sp]) => {
    const span = wd + 420 * cs, xx = x + ((((u0 * span - sp * cs * T * 1.4) % span) + span) % span) - 210 * cs;
    s += cloud(xx, y + ht * v, sc * cs, C.cream);
  });
  s += `<path d="M${f(x)} ${f(y + ht)} V${f(y + ht * 0.86)} H${f(x + wd * 0.2)} V${f(y + ht * 0.78)} H${f(x + wd * 0.44)} V${f(y + ht * 0.88)} H${f(x + wd * 0.68)} V${f(y + ht * 0.8)} H${f(x + wd)} V${f(y + ht)}Z" fill="#F2B5AD" ${st16(0.7)}/>`;
  s += `</g>`;
  s += `<path d="M${f(x + wd / 2)} ${f(y)} V${f(y + ht)} M${f(x)} ${f(y + ht * 0.5)} H${f(x + wd)}" stroke="#FFFFFF" stroke-width="${f(fr * 0.7)}"/>`;
  s += `<path d="M${f(x + wd / 2)} ${f(y)} V${f(y + ht)} M${f(x)} ${f(y + ht * 0.5)} H${f(x + wd)}" stroke="${INK}" stroke-width="${f(SW * 0.6)}" fill="none"/>`;
  s += `<rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="${f(ht)}" fill="none" ${st16(0.8)}/>`;
  s += `<rect x="${f(x - fr - 10)}" y="${f(y + ht + fr - 6)}" width="${f(wd + 2 * fr + 20)}" height="22" rx="8" fill="#FFFFFF" ${st16(0.9)}/>`;
  return s;
}
// bote genérico (sin marcas) apoyado en (x, base); kind 0..4
function bottle16(x, base, kind, s = 1) {
  const cols = [[C.pink, '#D96C93'], [P16.purple, P16.purpleS], [C.glass, '#8FC3D9'], ['#FFFFFF', '#E6DEDC'], [C.yel, '#C99A1E'], [C.green, '#2C7A47']];
  const [c, cs] = cols[kind % cols.length], st = st16(0.7);
  let g = '';
  if (kind % 5 === 0) { // bote con dosificador
    g += `<rect x="${f(x - 22 * s)}" y="${f(base - 84 * s)}" width="${f(44 * s)}" height="${f(84 * s)}" rx="${f(10 * s)}" fill="${c}" ${st}/><rect x="${f(x - 22 * s)}" y="${f(base - 84 * s)}" width="${f(12 * s)}" height="${f(84 * s)}" rx="${f(6 * s)}" fill="${cs}" opacity="0.6"/>`;
    g += `<rect x="${f(x - 6 * s)}" y="${f(base - 104 * s)}" width="${f(12 * s)}" height="${f(20 * s)}" fill="#FFFFFF" ${st}/><path d="M${f(x - 6 * s)} ${f(base - 104 * s)} H${f(x + 18 * s)} V${f(base - 96 * s)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round"/>`;
    g += `<rect x="${f(x - 14 * s)}" y="${f(base - 58 * s)}" width="${f(28 * s)}" height="${f(24 * s)}" rx="${f(4 * s)}" fill="#FFFFFF" ${st16(0.5)}/>`;
  } else if (kind % 5 === 1) { // tarro bajo
    g += `<rect x="${f(x - 28 * s)}" y="${f(base - 40 * s)}" width="${f(56 * s)}" height="${f(40 * s)}" rx="${f(9 * s)}" fill="${c}" ${st}/><rect x="${f(x - 30 * s)}" y="${f(base - 52 * s)}" width="${f(60 * s)}" height="${f(16 * s)}" rx="${f(6 * s)}" fill="#FFFFFF" ${st}/>`;
  } else if (kind % 5 === 2) { // espray
    g += `<rect x="${f(x - 16 * s)}" y="${f(base - 96 * s)}" width="${f(32 * s)}" height="${f(96 * s)}" rx="${f(12 * s)}" fill="${c}" ${st}/><rect x="${f(x - 9 * s)}" y="${f(base - 114 * s)}" width="${f(18 * s)}" height="${f(20 * s)}" rx="${f(4 * s)}" fill="${INK}"/>`;
    g += `<path d="M${f(x - 10 * s)} ${f(base - 70 * s)} V${f(base - 26 * s)}" stroke="#FFFFFF" stroke-width="${f(SW * 0.8)}" stroke-linecap="round" opacity="0.7"/>`;
  } else if (kind % 5 === 3) { // botella alta
    g += `<path d="M${f(x - 18 * s)} ${f(base)} V${f(base - 70 * s)} Q${f(x - 18 * s)} ${f(base - 86 * s)} ${f(x - 6 * s)} ${f(base - 92 * s)} V${f(base - 108 * s)} H${f(x + 6 * s)} V${f(base - 92 * s)} Q${f(x + 18 * s)} ${f(base - 86 * s)} ${f(x + 18 * s)} ${f(base - 70 * s)} V${f(base)}Z" fill="${c}" ${st}/>`;
    g += `<rect x="${f(x - 8 * s)}" y="${f(base - 120 * s)}" width="${f(16 * s)}" height="${f(14 * s)}" rx="${f(3 * s)}" fill="${C.red}" ${st}/>`;
  } else { // tubo
    g += `<path d="M${f(x - 20 * s)} ${f(base - 70 * s)} H${f(x + 20 * s)} L${f(x + 12 * s)} ${f(base - 10 * s)} H${f(x - 12 * s)}Z" fill="${c}" ${st}/><rect x="${f(x - 12 * s)}" y="${f(base - 12 * s)}" width="${f(24 * s)}" height="${f(12 * s)}" rx="${f(3 * s)}" fill="#FFFFFF" ${st}/>`;
  }
  return g;
}
function shelf16(x0, x1, y, seed, s = 1) {
  let g = `<rect x="${f(x0 + 8)}" y="${f(y + 8)}" width="${f(x1 - x0)}" height="20" rx="6" fill="${INK}"/><rect x="${f(x0)}" y="${f(y)}" width="${f(x1 - x0)}" height="20" rx="6" fill="${C.wood}" ${st16(0.9)}/>`;
  g += `<path d="M${f(x0 + 30)} ${f(y + 20)} l0 26 l24 -26 M${f(x1 - 30)} ${f(y + 20)} l0 26 l-24 -26" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.8)}" stroke-linejoin="round"/>`;
  let x = x0 + 38 * s, i = 0, items = '';
  while (x < x1 - 30 * s) { const kd = Math.floor(hash(seed * 13 + i) * 6); items += bottle16(x, y, kd + i, s); x += (kd % 5 === 1 ? 70 : 52) * s; i++; }
  return items + g;
}
function mirror16(x, y, wd, ht) {
  const fr = 22;
  let g = `<rect x="${f(x - fr + 12)}" y="${f(y - fr + 12)}" width="${f(wd + 2 * fr)}" height="${f(ht + 2 * fr)}" rx="${f(wd * 0.22)}" fill="${INK}"/>`;
  g += `<rect x="${f(x - fr)}" y="${f(y - fr)}" width="${f(wd + 2 * fr)}" height="${f(ht + 2 * fr)}" rx="${f(wd * 0.22)}" fill="${P16.purple}" ${st16()}/>`;
  g += `<rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="${f(ht)}" rx="${f(wd * 0.16)}" fill="${C.glass}" ${st16(0.8)}/>`;
  g += `<path d="M${f(x + wd * 0.58)} ${f(y + 14)} L${f(x + wd * 0.76)} ${f(y + 14)} L${f(x + wd * 0.28)} ${f(y + ht - 14)} L${f(x + wd * 0.1)} ${f(y + ht - 14)}Z" fill="#FFFFFF" opacity="0.5"/>`;
  g += `<path d="M${f(x + wd * 0.84)} ${f(y + 30)} L${f(x + wd * 0.9)} ${f(y + 30)} L${f(x + wd * 0.46)} ${f(y + ht - 20)} L${f(x + wd * 0.4)} ${f(y + ht - 20)}Z" fill="#FFFFFF" opacity="0.5"/>`;
  // bombillas en el marco superior
  for (let i = 0; i < 3; i++) g += `<circle cx="${f(x + wd * (0.25 + i * 0.25))}" cy="${f(y - fr / 2)}" r="8" fill="${C.yel}" ${st16(0.5)}/>`;
  // repisa
  g += `<rect x="${f(x - 30 + 8)}" y="${f(y + ht + fr + 8)}" width="${f(wd + 60)}" height="20" rx="6" fill="${INK}"/><rect x="${f(x - 30)}" y="${f(y + ht + fr)}" width="${f(wd + 60)}" height="20" rx="6" fill="#FFFFFF" ${st16(0.8)}/>`;
  return g;
}
function washBasin(x, floor, s = 1) {
  let g = '';
  // mueble y pila
  g += `<rect x="${f(x - 110 * s + 10)}" y="${f(floor - 250 * s + 10)}" width="${f(220 * s)}" height="${f(250 * s)}" rx="14" fill="${INK}"/>`;
  g += `<rect x="${f(x - 110 * s)}" y="${f(floor - 250 * s)}" width="${f(220 * s)}" height="${f(250 * s)}" rx="14" fill="#FFFFFF" ${st16()}/>`;
  g += `<path d="M${f(x - 110 * s)} ${f(floor - 170 * s)} H${f(x + 110 * s)} M${f(x)} ${f(floor - 170 * s)} V${f(floor)}" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
  g += `<circle cx="${f(x - 18 * s)}" cy="${f(floor - 90 * s)}" r="6" fill="${INK}"/><circle cx="${f(x + 18 * s)}" cy="${f(floor - 90 * s)}" r="6" fill="${INK}"/>`;
  g += `<path d="M${f(x - 100 * s)} ${f(floor - 250 * s)} Q${f(x)} ${f(floor - 300 * s)} ${f(x + 100 * s)} ${f(floor - 250 * s)} Q${f(x)} ${f(floor - 214 * s)} ${f(x - 100 * s)} ${f(floor - 250 * s)}Z" fill="${INK}" ${st16()}/>`;
  g += `<path d="M${f(x - 70 * s)} ${f(floor - 262 * s)} Q${f(x)} ${f(floor - 290 * s)} ${f(x + 70 * s)} ${f(floor - 262 * s)}" stroke="#5A5252" stroke-width="${f(SW * 0.8)}" fill="none" stroke-linecap="round"/>`;
  // grifo con ducha de mano
  g += `<path d="M${f(x + 60 * s)} ${f(floor - 276 * s)} V${f(floor - 330 * s)} Q${f(x + 60 * s)} ${f(floor - 350 * s)} ${f(x + 34 * s)} ${f(floor - 350 * s)} H${f(x + 14 * s)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 2.4)}" stroke-linecap="round"/>`;
  g += `<path d="M${f(x + 60 * s)} ${f(floor - 276 * s)} V${f(floor - 330 * s)} Q${f(x + 60 * s)} ${f(floor - 350 * s)} ${f(x + 34 * s)} ${f(floor - 350 * s)} H${f(x + 14 * s)}" fill="none" stroke="${SA.steel}" stroke-width="${f(SW * 1)}" stroke-linecap="round"/>`;
  // sillón reclinado delante
  g += `<path d="M${f(x - 96 * s)} ${f(floor - 160 * s)} Q${f(x - 104 * s)} ${f(floor - 220 * s)} ${f(x - 60 * s)} ${f(floor - 226 * s)} H${f(x + 60 * s)} Q${f(x + 104 * s)} ${f(floor - 220 * s)} ${f(x + 96 * s)} ${f(floor - 160 * s)}Z" fill="${C.dred}" ${st16()}/>`;
  g += `<rect x="${f(x - 104 * s)}" y="${f(floor - 168 * s)}" width="${f(208 * s)}" height="${f(54 * s)}" rx="${f(20 * s)}" fill="${C.red}" ${st16()}/>`;
  g += `<rect x="${f(x - 12 * s)}" y="${f(floor - 114 * s)}" width="${f(24 * s)}" height="${f(100 * s)}" fill="${SA.steel}" ${st16(0.8)}/><ellipse cx="${f(x)}" cy="${f(floor - 8)}" rx="${f(90 * s)}" ry="${f(16 * s)}" fill="${SA.steel}" ${st16(0.8)}/>`;
  return g;
}
function hoodDryer(x, floor, s = 1) {
  let g = '';
  g += `<rect x="${f(x - 8 * s)}" y="${f(floor - 430 * s)}" width="${f(16 * s)}" height="${f(420 * s)}" fill="${SA.steel}" ${st16(0.8)}/>`;
  g += `<ellipse cx="${f(x)}" cy="${f(floor - 8)}" rx="${f(80 * s)}" ry="${f(15 * s)}" fill="${SA.steel}" ${st16(0.8)}/>`;
  g += `<path d="M${f(x)} ${f(floor - 430 * s)} Q${f(x)} ${f(floor - 470 * s)} ${f(x - 40 * s)} ${f(floor - 480 * s)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 2.2)}" stroke-linecap="round"/>`;
  const cx = x - 70 * s, cy = floor - 520 * s;
  g += `<path d="M${f(cx - 100 * s + 10)} ${f(cy + 40 * s + 10)} Q${f(cx - 104 * s)} ${f(cy - 110 * s)} ${f(cx)} ${f(cy - 112 * s)} Q${f(cx + 104 * s)} ${f(cy - 110 * s)} ${f(cx + 100 * s)} ${f(cy + 40 * s)}Z" fill="${INK}"/>`;
  g += `<path d="M${f(cx - 100 * s)} ${f(cy + 40 * s)} Q${f(cx - 104 * s)} ${f(cy - 110 * s)} ${f(cx)} ${f(cy - 112 * s)} Q${f(cx + 104 * s)} ${f(cy - 110 * s)} ${f(cx + 100 * s)} ${f(cy + 40 * s)}Z" fill="${P16.purpleL}" ${st16()}/>`;
  g += `<path d="M${f(cx - 100 * s)} ${f(cy + 40 * s)} Q${f(cx)} ${f(cy + 70 * s)} ${f(cx + 100 * s)} ${f(cy + 40 * s)} Q${f(cx)} ${f(cy + 20 * s)} ${f(cx - 100 * s)} ${f(cy + 40 * s)}Z" fill="${P16.purpleS}" ${st16()}/>`;
  g += `<path d="M${f(cx - 60 * s)} ${f(cy - 60 * s)} Q${f(cx - 40 * s)} ${f(cy - 92 * s)} ${f(cx)} ${f(cy - 96 * s)}" stroke="#FFFFFF" stroke-width="${f(SW * 1.2)}" fill="none" stroke-linecap="round" opacity="0.7"/>`;
  return g;
}
function tileFloor(y0, x0 = -400, x1 = W + 400, cell = 96) {
  let g = `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${H + 400}" fill="${C.cream}"/>`;
  for (let j = 0; j < 8; j++) for (let i = Math.floor(x0 / cell); i * cell < x1; i++) if ((i + j) % 2 === 0) g += `<rect x="${i * cell}" y="${y0 + j * cell}" width="${cell}" height="${cell}" fill="${P16.tile}"/>`;
  g += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  return g;
}
// sala completa en coordenadas de mundo (1080 de ancho). o: tm (minutos del reloj), chairs [A,B], noClock
function salonRoom(T, o = {}) {
  const R = ROOM;
  let s = dotWide();
  s += `<rect x="-400" y="${R.floor - 70}" width="${W + 800}" height="70" fill="#FFFFFF"/><line x1="-400" y1="${R.floor - 70}" x2="${W + 400}" y2="${R.floor - 70}" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
  s += tileFloor(R.floor);
  const [wx, wy, ww, wh] = R.win;
  s += eveWindow(wx, wy, ww, wh, T);
  s += shelf16(R.shelf[0], R.shelf[1], R.shelf[2], 1, 0.9) + shelf16(R.shelf[0], R.shelf[1], R.shelf[3], 2, 0.9);
  if (!o.noClock) s += at(R.clock[0], R.clock[1], 1, clockFace(R.clock[2], o.tm === undefined ? EJ().reloj * 60 : o.tm, { rim: P16.purple }));
  s += mirror16(...R.mirA) + mirror16(...R.mirB);
  // utensilios en las repisas
  const ry = R.mirA[1] + R.mirA[3] + 22;
  s += bottle16(R.mirA[0] + 30, ry, 2, 0.6) + bottle16(R.mirB[0] + R.mirB[2] - 20, ry, 0, 0.6) + bottle16(R.mirB[0] + 20, ry, 4, 0.55);
  s += hoodDryer(1060, R.floor, 1);
  s += washBasin(840, R.floor, 0.95);
  const chairs = o.chairs || [true, true];
  if (chairs[0]) s += emptyChair(R.chairA, R.floor, R.chairSc);
  if (chairs[1]) s += emptyChair(R.chairB, R.floor, R.chairSc);
  return s;
}

/* ===================== BALANZA (dentro de la nube de pensamiento) ===================== */
function pctTag(x, y, s, rot = 0) {
  const d = 'M-46 -30 H26 L52 0 L26 30 H-46Z';
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})"><path d="${d}" transform="translate(6 6)" fill="${INK}"/><path d="${d}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW / s)}" stroke-linejoin="round"/>
    <circle cx="28" cy="0" r="6" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.7 / s)}"/>` + text('%', -12, 3, { size: 58, font: 'G', sw: SW * 1.4 / s, sd: 3 }) + `</g>`;
}
function giftFoam(x, base, s, t) {
  let g = `<g transform="translate(${f(x)} ${f(base)}) scale(${f(s)})">`;
  const sw = SW / s;
  g += `<rect x="-40" y="-62" width="80" height="62" rx="6" fill="${C.pink}" stroke="${INK}" stroke-width="${f(sw)}"/>`;
  g += `<rect x="-8" y="-62" width="16" height="62" fill="${P16.purple}" stroke="${INK}" stroke-width="${f(sw * 0.7)}"/>`;
  g += `<rect x="-46" y="-78" width="92" height="20" rx="5" fill="${C.pink}" stroke="${INK}" stroke-width="${f(sw)}"/><rect x="-8" y="-78" width="16" height="20" fill="${P16.purple}" stroke="${INK}" stroke-width="${f(sw * 0.7)}"/>`;
  g += `<ellipse cx="-17" cy="-88" rx="17" ry="10" fill="${P16.purple}" stroke="${INK}" stroke-width="${f(sw)}"/><ellipse cx="17" cy="-88" rx="17" ry="10" fill="${P16.purple}" stroke="${INK}" stroke-width="${f(sw)}"/><circle cx="0" cy="-84" r="7" fill="${P16.purpleS}" stroke="${INK}" stroke-width="${f(sw * 0.8)}"/>`;
  // espuma a un lado
  let a = '';
  [[44, -40, 16], [58, -56, 13], [62, -30, 12], [50, -70, 9], [70, -46, 9]].forEach(([cx, cy, r], i) => { a += `<circle cx="${cx}" cy="${cy}" r="${f(r * (1 + 0.06 * Math.sin(t * 6 + i)))}"/>`; });
  g += `<g fill="${INK}" stroke="${INK}" stroke-width="${f(sw * 1.8)}">${a}</g><g fill="#FFFFFF">${a}</g>`;
  g += `<circle cx="52" cy="-92" r="5" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(sw * 0.6)}"/><circle cx="70" cy="-80" r="3.5" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(sw * 0.6)}"/>`;
  return g + `</g>`;
}
// balanza: (x, base) pie; ang = inclinación del brazo (+ = baja el lado derecho, el regalo)
function balance16(x, base, s, ang, t) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  const top = base - 270 * s, L = 190 * s, a = ang * PI / 180;
  let g = `<path d="M${f(x - 90 * s)} ${f(base)} Q${f(x)} ${f(base - 50 * s)} ${f(x + 90 * s)} ${f(base)}Z" fill="${C.wood}" ${st()}/>`;
  g += `<rect x="${f(x - 12 * s)}" y="${f(top)}" width="${f(24 * s)}" height="${f(base - top - 26 * s)}" fill="${C.yel}" ${st()}/>`;
  const ends = [-1, 1].map(sd => [x + sd * L * Math.cos(a), top - sd * L * Math.sin(-a)]);
  // platillos colgando
  [0, 1].forEach(i => {
    const [ex, ey] = ends[i], py = ey + 120 * s;
    g += `<path d="M${f(ex)} ${f(ey)} L${f(ex - 62 * s)} ${f(py)} M${f(ex)} ${f(ey)} L${f(ex + 62 * s)} ${f(py)}" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
    if (i === 0) g += pctTag(ex, py - 34 * s, 0.95 * s, -8 + 3 * Math.sin(t * 3));
    else g += giftFoam(ex - 10 * s, py - 2 * s, 0.88 * s, t);
    g += `<path d="M${f(ex - 80 * s)} ${f(py)} Q${f(ex)} ${f(py + 46 * s)} ${f(ex + 80 * s)} ${f(py)}Z" fill="${C.yel}" ${st()}/>`;
  });
  g += `<rect x="${f(-L - 8 * s)}" y="${f(-9 * s)}" width="${f(2 * L + 16 * s)}" height="${f(18 * s)}" rx="${f(9 * s)}" fill="${C.yel}" ${st()} transform="translate(${f(x)} ${f(top)}) rotate(${f(ang)})"/>`;
  g += `<circle cx="${f(x)}" cy="${f(top)}" r="${f(20 * s)}" fill="${C.red}" ${st()}/>`;
  return g;
}

/* ===================== TARJETA DE OFERTA FLASH (peluquería) ===================== */
function salonIllu(x, y, wd, ht) {
  // dibujo de la tarjeta: sillón de peluquería con espejo y lavacabezas
  let g = `<rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="${f(ht)}" rx="24" fill="#EDE3FA" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
  const id = 'si' + (uid++);
  g += `<clipPath id="${id}"><rect x="${f(x)}" y="${f(y)}" width="${f(wd)}" height="${f(ht)}" rx="24"/></clipPath><g clip-path="url(#${id})">`;
  g += `<rect x="${f(x)}" y="${f(y + ht * 0.8)}" width="${f(wd)}" height="${f(ht)}" fill="${P16.tile}"/><line x1="${f(x)}" y1="${f(y + ht * 0.8)}" x2="${f(x + wd)}" y2="${f(y + ht * 0.8)}" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>`;
  const mx = x + wd * 0.1, mw = wd * 0.34;
  g += `<rect x="${f(mx)}" y="${f(y + 26)}" width="${f(mw)}" height="${f(ht * 0.48)}" rx="30" fill="${C.glass}" stroke="${P16.purple}" stroke-width="${f(SW * 1.6)}"/><rect x="${f(mx)}" y="${f(y + 26)}" width="${f(mw)}" height="${f(ht * 0.48)}" rx="30" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>`;
  g += emptyChair(mx + mw / 2, y + ht * 0.86, ht * 0.0128);
  g += `<g transform="translate(${f(x + wd * 0.74)} ${f(y + ht * 0.86)}) scale(${f(ht / 560)}) translate(${f(-840)} ${f(-1300)})">${washBasin(840, 1300, 0.95)}</g>`;
  g += `</g>`;
  return g;
}
function giftIcon(x, y, r) {
  return `<g transform="translate(${f(x)} ${f(y)})"><rect x="${f(-r)}" y="${f(-r * 0.5)}" width="${f(2 * r)}" height="${f(r * 1.4)}" rx="4" fill="${C.pink}" ${st16(0.6)}/><rect x="${f(-r * 0.2)}" y="${f(-r * 0.5)}" width="${f(r * 0.4)}" height="${f(r * 1.4)}" fill="${P16.purple}"/>
    <ellipse cx="${f(-r * 0.4)}" cy="${f(-r * 0.72)}" rx="${f(r * 0.42)}" ry="${f(r * 0.26)}" fill="${P16.purple}" ${st16(0.5)}/><ellipse cx="${f(r * 0.4)}" cy="${f(-r * 0.72)}" rx="${f(r * 0.42)}" ry="${f(r * 0.26)}" fill="${P16.purple}" ${st16(0.5)}/></g>`;
}
// pantalla de la publicación. o: kSeal, press (0..1), done, kDone
function flashScreen16(o = {}, t = 0) {
  return (sx, sy, sw, sh) => {
    const E = EJ(), hdr = 150;
    let g = `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" fill="${C.cream}"/>`;
    for (let yy = sy + hdr + 30; yy < sy + sh; yy += 44) for (let xx = sx + 22; xx < sx + sw; xx += 44) g += `<circle cx="${xx}" cy="${yy}" r="3.5" fill="${DOT}" opacity="0.6"/>`;
    // franja roja con el logo (icono sin letras) y el nombre
    g += `<rect x="${sx}" y="${sy}" width="${sw}" height="${hdr}" fill="${C.red}"/><line x1="${sx}" y1="${sy + hdr}" x2="${sx + sw}" y2="${sy + hdr}" ${st16()}/>`;
    const lr = hdr * 0.36;
    g += `<circle cx="${f(sx + 30 + lr)}" cy="${f(sy + hdr / 2 + 4)}" r="${f(lr)}" fill="#FFFFFF" ${st16(0.8)}/>` + logoI13(sx + 30 + lr, sy + hdr / 2 + 4, lr * 1.75);
    g += text('Escaparate de Tudela', sx + 30 + lr * 2 + 22, sy + hdr / 2 + 4, { size: fit('Escaparate de Tudela', 52, sw - lr * 2 - 80), anchor: 'start', sw: SW * 1.4, sd: 4 });
    const x = sx + 24, y = sy + hdr + 26, wd = sw - 48, ht = sh - hdr - 50;
    g += panel(x, y, wd, ht, 34, '#FFFFFF', 12);
    const ih = 300;
    g += salonIllu(x + 20, y + 20, wd - 40, ih);
    g += sparkle(x + wd * 0.5, y + 70, 18, 0.6 + 0.4 * Math.sin(t * 7));
    g += flashStamp(x + wd - 96, y + 100, 78, o.kSeal === undefined ? 1 : o.kSeal, -10);
    let ty = y + ih + 74;
    g += text('Peluquería', x + 34, ty, { size: fit('Peluquería', 70, wd - 300), anchor: 'start', fill: INK, stroke: null });
    g += pill(x + wd - 34 - 112, ty, 224, 64, C.red, 'Oferta flash', { size: 36 });
    ty += 92;
    g += at(x + 58, ty, 1, clockFace(26, E.hueco * 60, { rim: C.yel }));
    const l1 = `Hueco hoy ${hh(E.hueco)}`;
    g += text(l1, x + 102, ty + 2, { size: fit(l1, 54, wd - 130), anchor: 'start', fill: C.red, stroke: INK, sw: SW * 1.3, sd: 3 });
    ty += 78;
    g += giftIcon(x + 58, ty + 4, 22);
    const l2 = 'Corte con lavado de regalo';
    g += text(l2, x + 102, ty + 2, { size: fit(l2, 46, wd - 130), anchor: 'start', fill: INK, stroke: null });
    // botón
    const by = y + ht - 84, bw = wd - 80, press = o.press || 0;
    if (!o.done) g += at(x + wd / 2, by, 1 - 0.08 * press, pill(0, 0, bw, 112, C.red, 'Publicar', { size: 60 }));
    else {
      const kd = o.kDone === undefined ? 1 : o.kDone;
      g += at(x + wd / 2, by, lerp(0.82, 1, kd) * (1 + 0.06 * Math.max(0, damp(o.doneT || 1, 16, 6))), pill(0, 0, bw, 112, C.green, 'Publicada', { size: 58, dx: 34 }) + checkCircle(-bw / 2 + 120, 0, 40, pop(o.doneT || 1, 0, 0.4)));
    }
    return g;
  };
}
// mano grande de Sara que pulsa (mundo): punta del índice en (x,y)
function saraFinger(x, y, s = 1) {
  const w = v => f(v * SW / 3 * 2.2);
  const E = [x + 330 * s, y + 520 * s], Hh = [x + 62 * s, y + 92 * s];
  let g = capsule([E, Hh], 92 * s, SA.skin, w) + capsule([[E[0] + 40 * s, E[1] + 70 * s], [lerp(E[0], Hh[0], 0.12), lerp(E[1], Hh[1], 0.12)]], 128 * s, SA.tee, w);
  g += hand11('point', Hh, v => f(+w(v)), { hs: 10 * s, dir: -122, fill: SA.skin });
  return g;
}

/* ===================== CHAT ===================== */
// avatar de la clienta (círculo) en (cx,cy) radio r
function clientAvatar(cx, cy, r) {
  const id = 'av' + (uid++), sc = r / 22;
  let g = `<clipPath id="${id}"><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/></clipPath><g clip-path="url(#${id})"><rect x="${f(cx - r)}" y="${f(cy - r)}" width="${f(2 * r)}" height="${f(2 * r)}" fill="#DDF0E3"/>`;
  g += placeClienta(cx, cy + (208 - 84) * sc * 1.25, sc * 1.25, { expr: 'smile', bag: false, kAbs: 0.55, look: [0, 0] });
  g += `</g><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="none" ${st16(0.8)}/>`;
  return g;
}
// pantalla de chat genérica. msgs: [{who:'c'|'m', text, k, ticks}], o: input, caret, send, typing
function chatScreen16(msgs, o = {}, t = 0) {
  return (sx, sy, sw, sh) => {
    let g = `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" fill="${K12.chatBg}"/>`;
    for (let yy = sy + 20; yy < sy + sh; yy += 56) for (let xx = sx + 28 + (Math.round(yy / 56) % 2) * 28; xx < sx + sw; xx += 56) g += `<circle cx="${xx}" cy="${yy}" r="3" fill="#E6D9CF"/>`;
    const hd = 160;
    g += `<rect x="${sx}" y="${sy}" width="${sw}" height="${hd}" fill="${C.navy}"/><line x1="${sx}" y1="${sy + hd}" x2="${sx + sw}" y2="${sy + hd}" ${st16()}/>`;
    g += `<path d="M${sx + 50} ${sy + 56} L${sx + 28} ${sy + hd / 2 + 4} L${sx + 50} ${sy + hd - 48}" stroke="#FFFFFF" stroke-width="${f(SW * 1.2)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    g += clientAvatar(sx + 124, sy + hd / 2 + 4, 52);
    g += text('Clienta', sx + 200, sy + hd / 2 - (o.typing ? 18 : 0) + 2, { size: 60, anchor: 'start', sw: SW * 1.4, sd: 4 });
    if (o.typing) g += text('escribiendo…', sx + 202, sy + hd / 2 + 38, { size: 34, anchor: 'start', fill: '#CFEFD9', stroke: null, shadow: false });
    // campo de escritura
    const inp = o.input || '', size = 40, fw = sw - 170;
    const lines = inp ? wrapText(inp, size, fw - 60) : [];
    const show = lines.slice(-2), ih = show.length > 1 ? 150 : 104, iy = sy + sh - 26 - ih;
    g += `<rect x="${sx + 24}" y="${iy}" width="${fw}" height="${ih}" rx="52" fill="#FFFFFF" ${st16(0.8)}/>`;
    if (!inp) g += text('Mensaje', sx + 64, iy + ih / 2 + 2, { size, anchor: 'start', fill: K12.grey, stroke: null, shadow: false });
    show.forEach((l, i) => { g += text(l, sx + 56, iy + ih / 2 + (i - (show.length - 1) / 2) * 52 + 2, { size, anchor: 'start', fill: INK, stroke: null, shadow: false }); });
    if (o.caret && Math.floor(t * 3) % 2 === 0) {
      const lx = sx + 56 + (show.length ? measure(show[show.length - 1], size) : 0) + 4, ly = iy + ih / 2 + (show.length > 1 ? 26 : 0);
      g += `<rect x="${f(lx)}" y="${f(ly - 25)}" width="5" height="50" rx="2" fill="${C.blue}"/>`;
    }
    g += at(sx + sw - 78, iy + ih / 2, 1 + 0.25 * (o.send || 0), `<circle r="52" fill="${C.green}" ${st16(0.8)}/>` + paperPlane(0, 0, 0.64, 0));
    // mensajes (de arriba abajo)
    const maxW = sw * 0.7;
    let y = sy + hd + 40, mg = '';
    msgs.forEach(m => {
      if (!m.k || m.k <= 0.001) return;
      const sz = msgSize(m, maxW), grow = easeOut(clamp(m.k * 1.6));
      const x = m.who === 'm' ? sx + sw - 40 - sz.w : sx + 40;
      const ox = m.who === 'm' ? x + sz.w : x;
      const mm = Object.assign({}, m, { who: m.who === 'm' ? 'm' : 'f' });
      mg += `<g transform="translate(${f(ox)} ${f(y)}) scale(${f(Math.min(1.2, m.k))}) translate(${f(-ox)} ${f(-y)})">${msgBubble(mm, x, y, sz, t)}</g>`;
      if (m.hhmm) mg += text(m.hhmm, m.who === 'm' ? x + sz.w - (m.ticks > 0.01 ? 84 : 20) : x + sz.w - 20, y + sz.h - 24, { size: 26, anchor: 'end', fill: '#8A8180', stroke: null, shadow: false });
      y += (sz.h + CH.gap + 10) * grow;
    });
    g += mg;
    return g;
  };
}

/* ===================== FACHADA DE LA PELUQUERÍA ===================== */
function styledHead(x, base, s) {
  const st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v / s)}" stroke-linejoin="round"`;
  return `<g transform="translate(${f(x)} ${f(base)}) scale(${f(s)})">
    <path d="M-30 0 Q-30 -16 -14 -20 V-34 H14 V-20 Q30 -16 30 0Z" fill="${C.cream}" ${st()}/>
    <rect x="-9" y="-48" width="18" height="18" fill="#F4E9E4" ${st()}/>
    <circle cx="0" cy="-74" r="30" fill="#F4E9E4" ${st()}/>
    <path d="M-32 -70 Q-36 -110 0 -110 Q36 -110 32 -70 Q24 -94 0 -92 Q-22 -92 -32 -70Z" fill="${P16.purple}" ${st()}/>
    <circle cx="0" cy="-118" r="18" fill="${P16.purple}" ${st()}/><path d="M-8 -124 Q-2 -130 6 -126" stroke="${P16.purpleL}" stroke-width="${f(SW * 0.8 / s)}" fill="none" stroke-linecap="round"/>
    <path d="M-14 -96 Q-4 -104 10 -100" stroke="${P16.purpleL}" stroke-width="${f(SW * 0.8 / s)}" fill="none" stroke-linecap="round"/>
    <path d="M-10 -72 Q-6 -69 -2 -72 M2 -72 Q6 -69 10 -72" stroke="${INK}" stroke-width="${f(SW * 0.6 / s)}" fill="none" stroke-linecap="round"/></g>`;
}
// fachada: (x0..x1) ancho, top = arriba del rótulo, base = acera. o: doorOpen 0..1, bellAng, inside(dx,dy,dw,dh)
const FAC16 = { x0: -20, x1: 1100, door: [640, 300] };
function salonFacade(top, base, T, o = {}) {
  const x0 = FAC16.x0, x1 = FAC16.x1;
  let s = '';
  // piso de arriba (crema con ventanas) solo si o.upper; si no, cornisa y cielo
  if (!o.upper) s += `<rect x="${x0}" y="${f(top - 34)}" width="${x1 - x0}" height="44" fill="${C.cream}" ${st16()}/><rect x="${x0}" y="${f(top - 50)}" width="${x1 - x0}" height="20" rx="6" fill="${P16.purpleS}" ${st16(0.8)}/>`;
  if (o.upper) s += `<rect x="${x0}" y="${f(top - 420)}" width="${x1 - x0}" height="430" fill="${C.cream}" ${st16()}/>`;
  if (o.upper) [[110, 0], [450, 1], [790, 0]].forEach(([wx, i]) => {
    s += `<rect x="${wx + 10}" y="${f(top - 330 + 10)}" width="180" height="240" rx="14" fill="${INK}"/><rect x="${wx}" y="${f(top - 330)}" width="180" height="240" rx="14" fill="${C.glass}" ${st16()}/>`;
    s += `<path d="M${wx + 90} ${f(top - 330)} V${f(top - 90)} M${wx} ${f(top - 210)} H${wx + 180}" stroke="#FFFFFF" stroke-width="${f(SW * 1.6)}"/><path d="M${wx + 90} ${f(top - 330)} V${f(top - 90)} M${wx} ${f(top - 210)} H${wx + 180}" stroke="${INK}" stroke-width="${f(SW * 0.5)}"/>`;
    s += `<rect x="${wx - 16}" y="${f(top - 96)}" width="212" height="22" rx="8" fill="#FFFFFF" ${st16(0.8)}/>`;
    if (i) s += `<path d="M${wx + 20} ${f(top - 100)} q12 -40 24 0 q12 -36 24 0 q12 -40 24 0" fill="${C.green}" ${st16(0.6)}/><circle cx="${wx + 44}" cy="${f(top - 112)}" r="9" fill="${C.pink}" ${st16(0.5)}/><circle cx="${wx + 92}" cy="${f(top - 112)}" r="9" fill="${C.red}" ${st16(0.5)}/>`;
  });
  // planta baja morada
  s += `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="${f(base - top + 10)}" fill="${P16.purple}" ${st16()}/>`;
  s += `<rect x="${x0}" y="${top}" width="70" height="${f(base - top + 10)}" fill="${P16.purpleS}"/>`;
  // rótulo
  const sy = top + 30, sh = 112, sx0 = 120, sx1 = 960;
  s += `<rect x="${sx0 + 10}" y="${sy + 10}" width="${sx1 - sx0}" height="${sh}" rx="22" fill="${INK}"/><rect x="${sx0}" y="${sy}" width="${sx1 - sx0}" height="${sh}" rx="22" fill="${C.navy}" ${st16()}/>`;
  s += text('PELUQUERÍA', (sx0 + sx1) / 2, sy + sh / 2 + 6, { size: fit('PELUQUERÍA', 92, sx1 - sx0 - 70, 'G'), font: 'G', fill: C.cream, sw: SW * 1.6, sd: 5, ls: 6 });
  // toldo de rayas moradas y crema con festón
  const ay = sy + sh + 30, ah = 110;
  s += awningC(40, 1040, 0, 1080, ay, ah, 9, P16.purple);
  // escaparate con maniquí peinado
  const wy = ay + ah + 90, wx = 70, ww = 500, wh = base - 60 - wy;
  s += glassWindow(wx, wy, ww, wh, (x, y, w2, h2) => styledHead(x + w2 * 0.36, y + h2 - 20, h2 / 260) + bottle16(x + w2 * 0.72, y + h2 - 20, 0, h2 / 300) + bottle16(x + w2 * 0.86, y + h2 - 20, 3, h2 / 320) + sparkle(x + w2 * 0.6, y + h2 * 0.3, 18, 0.7 + 0.3 * Math.sin(T * 5)));
  s += `<rect x="${wx - 14}" y="${f(wy + wh)}" width="${ww + 28}" height="26" rx="8" fill="${C.cream}" ${st16()}/>`;
  // puerta (se abre hacia dentro: se ve el interior)
  const [dx, dw] = FAC16.door, dy = wy - 30, dh = base - dy;
  s += `<rect x="${dx - 18}" y="${dy - 18}" width="${dw + 36}" height="${dh + 18}" rx="14" fill="${C.cream}" ${st16()}/>`;
  s += `<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" fill="#6B4A44" ${st16()}/>`;
  s += `<rect x="${dx}" y="${dy}" width="${dw}" height="${f(dh * 0.6)}" fill="#F3E3DD"/><rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" fill="none" ${st16(0.8)}/>`;
  s += `<rect x="${dx + 30}" y="${dy + 40}" width="${dw - 60}" height="40" rx="8" fill="${C.wood}" opacity="0.7"/>`;
  if (o.inside) s += o.inside(dx, dy, dw, dh);
  const op = clamp(o.doorOpen || 0), pw = dw * (1 - 0.82 * op);
  const dp = `M${dx} ${dy} L${f(dx + pw)} ${f(dy + 26 * op)} L${f(dx + pw)} ${f(dy + dh - 10 * op)} L${dx} ${f(dy + dh)}Z`;
  s += `<path d="${dp}" fill="${C.navy}" ${st16()}/>`;
  if (op < 0.85) {
    const gx = dx + pw * 0.18, gw = pw * 0.64;
    s += `<rect x="${f(gx)}" y="${f(dy + 40 + 20 * op)}" width="${f(gw)}" height="${f(dh * 0.48)}" rx="10" fill="${C.glass}" ${st16(0.7)}/>`;
    s += `<path d="M${f(gx + gw * 0.6)} ${f(dy + 50)} L${f(gx + gw * 0.8)} ${f(dy + 50)} L${f(gx + gw * 0.3)} ${f(dy + dh * 0.5)} L${f(gx + gw * 0.1)} ${f(dy + dh * 0.5)}Z" fill="#FFFFFF" opacity="0.55"/>`;
    s += `<circle cx="${f(dx + pw * 0.86)}" cy="${f(dy + dh * 0.6)}" r="12" fill="${C.yel}" ${st16(0.7)}/>`;
  }
  // campanilla sobre la puerta
  s += bell(dx + dw / 2, dy - 18, o.bellAng || 0, 1.3);
  if (o.ring) s += ringLines(dx + dw / 2, dy + 58, o.ring);
  return s;
}
// pájaros en «V» por encima de y=1400 (reutiliza vFlock de v15)
const FLOCK16 = [{ t0: 0.4, d: 4.2, dir: 1, y: 760, a: 30 }, { t0: 3.6, d: 4.4, dir: -1, y: 980, a: 26 }, { t0: 6.8, d: 3.8, dir: 1, y: 700, a: 28 }];
