/* Vídeo 12 — «Marta y la cesta de bebé». Piezas nuevas sobre lib.js + series.js + rosa.js + v04…v11.js:
   Marta SENTADA (sofá, portátil en las rodillas) y de MEDIO CUERPO, nuevas caras (pensativa, dudosa, asombrada);
   Lucía con el bebé (nube de pensamiento); salón con ventana, sofá, lámpara y planta; portátil con buscador;
   productos de bebé genéricos; cesta rosa de mimbre; móvil grande con tarjeta de oferta y chat genérico;
   fachada e interior de la farmacia; farmacéutica (a partir de la dependienta del vídeo 10). */
'use strict';

const K12 = {
  blueS: '#2B5A99', wick: '#E7C7A3', wickS: '#C9A27A', wickD: '#A9743F', pinkS: '#D96C93', pinkL: '#FDE3EC',
  blond: '#F2D16B', blondS: '#D9B54A', tee: '#3C9D5D', teeS: '#2E7D49', crossL: '#8FD9A6', tileB: '#E4ECF0',
  bubM: '#D4F5C9', chatBg: '#F4EEE8', grey: '#9AA0A6', greyL: '#C9CDD2', bear: '#C98A4B', bearS: '#A9743F'
};
const st12 = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
const wW = v => f(v * SW / 3); // trazo «local» para piezas dibujadas en mundo con hand11

/* ===================== CARAS NUEVAS DE MARTA ===================== */
// mismas coordenadas que martaFace11 (rasgos girados hacia cámara)
function martaFace12(o, w) {
  const e = o.expr || 'happy', m = clamp(o.talk || 0);
  const E1 = 193, E2 = 200, EY = 80.8, MX = 196.6, MY = 87.4;
  const L = (d, sw = 1.6) => `<path d="${d}" stroke="${INK}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const blush = (op = 0.65) => `<circle cx="202.2" cy="86.2" r="2.7" fill="${C.pink}" opacity="${op}"/><circle cx="189.4" cy="86.2" r="2.3" fill="${C.pink}" opacity="${op * 0.8}"/>`;
  const dot = (x, y, r = 2.15) => `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${INK}"/><circle cx="${f(x + 0.75)}" cy="${f(y - 0.8)}" r="0.62" fill="#FFFFFF"/>`;
  const blinkL = L(`M${E1 - 2.4} ${EY} Q${E1} ${EY + 1.3} ${E1 + 2.4} ${EY} M${E2 - 2.4} ${EY} Q${E2} ${EY + 1.3} ${E2 + 2.4} ${EY}`, 1.6);
  if (e === 'pensive') { // mira hacia arriba, boca pequeña de lado
    let s = blush(0.45) + L('M190.8 75 L195 74.6 M198.2 73.8 Q200.4 72.6 202.6 73.8', 1.6);
    s += o.blink ? blinkL : dot(E1 + 0.8, EY - 1.1, 2) + dot(E2 + 0.8, EY - 1.1, 2);
    s += L(`M${f(MX - 1.6)} ${f(MY + 0.8)} Q${f(MX + 0.6)} ${f(MY + 0.2)} ${f(MX + 2.6)} ${f(MY - 0.4)}`, 1.9);
    if (m > 0.05) s += `<ellipse cx="${f(MX + 0.6)}" cy="${f(MY + 0.6)}" rx="1.6" ry="${f(0.8 + 1.6 * m)}" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.3)}"/>`;
    return s;
  }
  if (e === 'doubt') { // una ceja muy alta, otra baja; boca ondulada
    let s = blush(0.45) + L('M190.6 76.2 L195 75.6') + L('M197.8 73 Q200.2 70.6 202.8 72.8', 1.7);
    s += o.blink ? blinkL : dot(E1, EY + 0.2, 2) + dot(E2, EY - 0.3, 2.2);
    s += L(`M${f(MX - 3.4)} ${f(MY + 0.6)} Q${f(MX - 1.7)} ${f(MY - 0.8)} ${MX} ${f(MY + 0.6)} Q${f(MX + 1.7)} ${f(MY + 2)} ${f(MX + 3.4)} ${f(MY + 0.6)}`, 1.8);
    return s;
  }
  if (e === 'shock') { // ojos y boca MUY abiertos
    let s = blush(0.5) + L('M189.8 72.4 Q192.8 69.4 195.8 71.8 M197.6 71.8 Q200.6 69.4 203.4 72.4', 1.7);
    [E1, E2].forEach(x => { s += `<circle cx="${x}" cy="${EY}" r="3.7" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.5)}"/><circle cx="${f(x + 0.3)}" cy="${f(EY + 0.2)}" r="1.35" fill="${INK}"/>`; });
    s += `<ellipse cx="${MX}" cy="${f(MY + 2.2)}" rx="2.9" ry="3.9" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}"/>`;
    s += `<ellipse cx="${MX}" cy="${f(MY + 4.2)}" rx="1.6" ry="1.1" fill="${C.pink}"/>`;
    return s;
  }
  return martaFace11(o, w);
}
/* ===================== MARTA 12 (brazos con codo, cosas en el regazo) ===================== */
function armX(S, A, w, fill) {
  const { E, H } = ik2(S, A.h, A.side || 1, A.L || 17);
  return capsule([S, E, H], 7, fill, w) + hand11(A.hand || 'fist', H, w, Object.assign({ fill: C.skin }, A, { fill: C.skin }));
}
// (px,py) = punto del mundo donde va el punto local (ax,ay). o: sit, expr, talk, blink, armF, armB, lap(w), after(w)
function marta12(px, py, ax, ay, sc, o = {}) {
  const F = o.armF || POSE.restF, B = o.armB || POSE.restB;
  const opts = Object.assign({ pony: 0 }, o, {
    who: 'marta', noArmF: true, noArmB: true, faceFn: martaFace12, sw: SW,
    behind: w => armX(SH_B, B, w, C.skinS),
    front0: w => (o.lap ? o.lap(w) : '') + armX(SH_F, F, w, C.skin),
    front: o.after
  });
  delete opts.armF; delete opts.armB;
  return placeMarta(px, py, ax, ay, sc, opts);
}
// punto local de Marta -> mundo (y viceversa) con el anclaje (ax,ay)->(px,py)
const m12W = (px, py, ax, ay, sc, lx, ly) => [px + (lx - ax) * sc, py + (ly - ay) * sc];
const m12L = (px, py, ax, ay, sc, X, Y) => [ax + (X - px) / sc, ay + (Y - py) / sc];
// Marta sentada: el punto local (190,149) (bajo de los muslos) se apoya en el asiento
const SIT_A = [190, 149];
// portátil en las rodillas (local): base sobre los muslos y tapa abierta vista por detrás
function lapLaptop(w) {
  return `<path d="M188 139.4 H227 L229.4 142.6 H186Z" fill="${K12.greyL}" stroke="${INK}" stroke-width="${w(2)}" stroke-linejoin="round"/>
    <path d="M219.6 140.6 L227.4 140.6 L237 111.6 L229.4 111Z" fill="${C.navy}" stroke="${INK}" stroke-width="${w(2.4)}" stroke-linejoin="round"/>
    <circle cx="229.6" cy="125" r="1.7" fill="#FFFFFF" opacity="0.7"/>`;
}
const marta12Breath = (T, sc) => -5 / sc * (0.5 - 0.5 * Math.cos(2 * PI * T / 1.6));

/* ===================== SALÓN DE MARTA ===================== */
const HOME = { floor: 1390, seat: 1150, sofa: [175, 905], win: [70, 300, 390, 520], lampX: 995, plantX: 95 };
function skyWindow(x, y, wd, ht, T) {
  const id = 'sw' + (uid++), fr = 24;
  let s = `<rect x="${x - fr + 12}" y="${y - fr + 12}" width="${wd + 2 * fr}" height="${ht + 2 * fr}" rx="16" fill="${INK}"/>`;
  s += `<rect x="${x - fr}" y="${y - fr}" width="${wd + 2 * fr}" height="${ht + 2 * fr}" rx="16" fill="#FFFFFF" ${st12()}/>`;
  s += `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${wd}" height="${ht}"/></clipPath><g clip-path="url(#${id})">`;
  s += `<rect x="${x}" y="${y}" width="${wd}" height="${ht}" fill="${C.sky}"/><rect x="${x}" y="${f(y + ht * 0.7)}" width="${wd}" height="${ht}" fill="${C.skyL}"/>`;
  s += sun(x + wd * 0.74, y + ht * 0.24, 44, T * 12);
  [[0.0, 0.42, 0.42, 11], [0.45, 0.7, 0.34, 7], [0.8, 0.16, 0.3, 14]].forEach(([u0, v, sc, sp]) => {
    const span = wd + 300, xx = x + ((((u0 * span - sp * T) % span) + span) % span) - 150;
    s += cloud(xx, y + ht * v, sc);
  });
  // tejados lejanos (planos) en la parte baja
  s += `<path d="M${x} ${f(y + ht)} V${f(y + ht * 0.86)} H${f(x + wd * 0.22)} V${f(y + ht * 0.8)} H${f(x + wd * 0.46)} V${f(y + ht * 0.9)} H${f(x + wd * 0.7)} V${f(y + ht * 0.83)} H${f(x + wd)} V${f(y + ht)}Z" fill="#F2B5AD" ${st12(0.7)}/>`;
  s += `<path d="M${f(x + wd * 0.06)} ${f(y + ht * 0.08)} L${f(x + wd * 0.2)} ${f(y + ht * 0.08)} L${f(x + wd * 0.02)} ${f(y + ht * 0.4)} L${x} ${f(y + ht * 0.4)}Z" fill="#FFFFFF" opacity="0.45"/>`;
  s += `</g><rect x="${x}" y="${y}" width="${wd}" height="${ht}" fill="none" ${st12()}/>`;
  s += `<rect x="${f(x + wd / 2 - 8)}" y="${y}" width="16" height="${ht}" fill="#FFFFFF" ${st12(0.7)}/>`;
  s += `<rect x="${x}" y="${f(y + ht * 0.46 - 8)}" width="${wd}" height="16" fill="#FFFFFF" ${st12(0.7)}/>`;
  s += `<rect x="${x - fr - 22}" y="${y + ht + fr - 8}" width="${wd + 2 * fr + 44}" height="30" rx="10" fill="#FFFFFF" ${st12()}/>`;
  return s;
}
function floorLamp(x, floor, h) {
  const top = floor - h;
  let s = shadowEll(x, floor + 2, 70);
  s += `<ellipse cx="${x}" cy="${floor - 10}" rx="60" ry="15" fill="${C.navy}" ${st12()}/>`;
  s += `<rect x="${x - 7}" y="${top + 70}" width="14" height="${h - 80}" rx="7" fill="${C.navy}" ${st12(0.8)}/>`;
  const sh = `M${x - 84} ${top + 96} L${x - 54} ${top} H${x + 54} L${x + 84} ${top + 96}Z`;
  s += `<path d="${sh}" transform="translate(9 9)" fill="${INK}"/><path d="${sh}" fill="${C.yel}" ${st12()}/>`;
  s += `<path d="M${x - 62} ${top + 74} L${x - 42} ${top + 16}" stroke="#FFFFFF" stroke-width="${f(SW)}" stroke-linecap="round" opacity="0.75"/>`;
  return s;
}
function plant(x, floor, s = 1) {
  const top = floor - 150 * s;
  let g = shadowEll(x, floor + 2, 80 * s);
  [[-58, 170], [-30, 220], [-6, 250], [18, 230], [42, 200], [64, 160]].forEach(([a, L], i) => {
    const r = a * PI / 180, Ls = L * s, cx = x + Math.sin(r) * Ls * 0.5, cy = top - Math.cos(r) * Ls * 0.5;
    g += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(26 * s)}" ry="${f(Ls / 2)}" transform="rotate(${a} ${f(cx)} ${f(cy)})" fill="${i % 2 ? C.green : '#2E7D49'}" ${st12()}/>`;
    g += `<path d="M${f(x + Math.sin(r) * Ls * 0.12)} ${f(top - Math.cos(r) * Ls * 0.12)} L${f(x + Math.sin(r) * Ls * 0.86)} ${f(top - Math.cos(r) * Ls * 0.86)}" stroke="${INK}" stroke-width="${f(SW * 0.5)}" stroke-linecap="round"/>`;
  });
  const pot = `M${f(x - 72 * s)} ${f(top)} H${f(x + 72 * s)} L${f(x + 54 * s)} ${floor} H${f(x - 54 * s)}Z`;
  g += `<path d="${pot}" transform="translate(8 8)" fill="${INK}"/><path d="${pot}" fill="${C.red}" ${st12()}/>`;
  g += `<rect x="${f(x - 82 * s)}" y="${f(top - 8)}" width="${f(164 * s)}" height="${f(36 * s)}" rx="10" fill="${C.redS}" ${st12()}/>`;
  return g;
}
function sofa(x0, x1, seat, floor) {
  const bk = seat - 270, aw = 96, legH = 46, base = floor - legH;
  let s = '';
  // patas
  [x0 + 40, x1 - 40, (x0 + x1) / 2].forEach(x => { s += `<path d="M${x - 16} ${base - 4} H${x + 16} L${x + 10} ${floor} H${x - 10}Z" fill="${C.wood}" ${st12(0.8)}/>`; });
  // respaldo
  s += `<rect x="${x0 + aw - 30 + 12}" y="${bk + 12}" width="${x1 - x0 - 2 * aw + 60}" height="${base - bk}" rx="44" fill="${INK}"/>`;
  s += `<rect x="${x0 + aw - 30}" y="${bk}" width="${x1 - x0 - 2 * aw + 60}" height="${base - bk}" rx="44" fill="${C.blue}" ${st12()}/>`;
  const cw = (x1 - x0 - 2 * aw) / 2;
  for (let i = 0; i < 2; i++) {
    const cx = x0 + aw + i * cw;
    s += `<rect x="${f(cx + 8)}" y="${bk + 26}" width="${f(cw - 16)}" height="${seat - bk - 40}" rx="34" fill="${C.blue}" ${st12()}/>`;
    s += `<path d="M${f(cx + 40)} ${bk + 60} Q${f(cx + 60)} ${bk + 44} ${f(cx + 100)} ${bk + 44}" stroke="#FFFFFF" stroke-width="${f(SW)}" fill="none" stroke-linecap="round" opacity="0.5"/>`;
    s += `<rect x="${f(cx + 4)}" y="${seat - 34}" width="${f(cw - 8)}" height="62" rx="26" fill="${C.blue}" ${st12()}/>`;
  }
  // frente del asiento
  s += `<rect x="${x0 + aw - 20}" y="${seat + 26}" width="${x1 - x0 - 2 * aw + 40}" height="${base - seat - 26}" rx="18" fill="${K12.blueS}" ${st12()}/>`;
  // brazos
  [x0, x1 - aw].forEach(ax => {
    s += `<rect x="${ax + 10}" y="${seat - 150 + 10}" width="${aw}" height="${base - seat + 150}" rx="40" fill="${INK}"/>`;
    s += `<rect x="${ax}" y="${seat - 150}" width="${aw}" height="${base - seat + 150}" rx="40" fill="${C.blue}" ${st12()}/>`;
    s += `<rect x="${ax - 8}" y="${seat - 170}" width="${aw + 16}" height="62" rx="31" fill="${C.blue}" ${st12()}/>`;
  });
  return s;
}
// fondo del salón; o.sofa=false para no dibujar el sofá
function homeBack(T, o = {}) {
  let s = dotWall();
  const [wx, wy, ww, wh] = HOME.win;
  s += skyWindow(wx, wy, ww, wh, T);
  // zócalo y suelo de madera
  s += `<rect x="-20" y="${HOME.floor - 30}" width="${W + 40}" height="30" fill="#FFFFFF" ${st12()}/>`;
  s += `<rect x="-20" y="${HOME.floor}" width="${W + 40}" height="${H - HOME.floor + 20}" fill="${C.wood}"/>`;
  for (let i = 0; i < 8; i++) s += `<line x1="${-40 + i * 190}" y1="${HOME.floor}" x2="${-200 + i * 190}" y2="${H}" ${st12(0.5)}/>`;
  s += `<line x1="-20" y1="${HOME.floor}" x2="${W + 20}" y2="${HOME.floor}" ${st12()}/>`;
  // cuadro con corazón (genérico)
  s += `<rect x="${648 + 10}" y="${380 + 10}" width="200" height="160" rx="12" fill="${INK}"/><rect x="648" y="380" width="200" height="160" rx="12" fill="${C.yel}" ${st12()}/>`;
  s += `<rect x="668" y="400" width="160" height="120" rx="6" fill="#FFFFFF" ${st12(0.7)}/>` + `<path d="${heartPath(34)}" transform="translate(748 466)" fill="${C.pink}" ${st12(0.7)}/>`;
  s += floorLamp(HOME.lampX, HOME.floor, 760);
  s += plant(HOME.plantX, HOME.floor, 0.95);
  if (o.sofa !== false) s += sofa(HOME.sofa[0], HOME.sofa[1], HOME.seat, HOME.floor);
  return s;
}

/* ===================== LUCÍA CON EL BEBÉ ===================== */
function babyBundle(w, T) { // local de Lucía (mira a la derecha), bebé en brazos delante del pecho
  const by = 0.6 * Math.sin(2 * PI * T / 1.4);
  return `<g transform="translate(0 ${f(by)})">
    <path d="M186 124 Q186 110 200 108 Q214 106 220 113 Q224 120 214 127 Q200 133 190 131 Q186 129 186 124Z" fill="${C.pink}" stroke="${INK}" stroke-width="${w(2.4)}" stroke-linejoin="round"/>
    <path d="M192 126 Q202 124 212 118 M195 130 Q204 128 213 123" stroke="${K12.pinkS}" stroke-width="${w(1.4)}" fill="none" stroke-linecap="round"/>
    <circle cx="214.5" cy="112.5" r="6.4" fill="${C.skin}" stroke="${INK}" stroke-width="${w(2)}"/>
    <path d="M208.4 111 Q209 103.6 215.4 104 Q221.4 104.6 221 111 Q215 108.4 208.4 111Z" fill="${C.pink}" stroke="${INK}" stroke-width="${w(1.8)}" stroke-linejoin="round"/>
    <path d="M208.6 111 Q215 109 220.8 111.2" stroke="#FFFFFF" stroke-width="${w(1.6)}" fill="none" stroke-linecap="round"/>
    <circle cx="216.2" cy="102.6" r="2" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(1.3)}"/>
    <path d="M211.6 113.4 Q212.8 112.2 214 113.4 M216 113.2 Q217.2 112 218.4 113.2" stroke="${INK}" stroke-width="${w(1.1)}" fill="none" stroke-linecap="round"/>
    <circle cx="219.2" cy="115.4" r="1.4" fill="${C.pink}" opacity="0.8"/>
    <path d="M213.4 116.2 Q214.8 117.4 216.2 116.2" stroke="${INK}" stroke-width="${w(1)}" fill="none" stroke-linecap="round"/></g>`;
}
function luciaBaby(px, py, sc, T) {
  const o = {
    who: 'lucia', expr: 'smile', noArmF: true, noArmB: true, noLegs: true, look: [0.6, 0.8], head: 5 + 2 * Math.sin(2 * PI * T / 2.2),
    bob: -1.2 * (0.5 - 0.5 * Math.cos(2 * PI * T / 1.6)),
    front0: w => capsule([[178, 108], [181, 126], [197, 127]], 8, YEL_S, w) + hand(197, 127, w, C.skinS) + babyBundle(w, T) +
      capsule([[202.5, 108], [199, 126], [215, 124]], 8, YEL, w) + hand(215, 124, w)
  };
  return place(px, py, 190, 204, sc, o);
}
// nube de pensamiento con Lucía dentro (centro cx,cy)
function thoughtLucia(cx, cy, wd, ht, k, T, from) {
  if (k <= 0.01) return '';
  let s = '';
  // bolitas desde la cabeza de Marta
  if (from) {
    const [hx, hy] = from;
    [[0.18, 14], [0.4, 21], [0.63, 28]].forEach(([u, r], i) => {
      const x = lerp(hx, cx - wd * 0.28, u), y = lerp(hy, cy + ht * 0.36, u);
      s += thinkDot(x, y, r, pop(k * 1.6 - i * 0.15, 0, 0.5) * (k > 0.99 ? 1 : 1));
    });
  }
  const id = 'tl' + (uid++);
  let inner = `<clipPath id="${id}"><ellipse cx="0" cy="0" rx="${f(wd * 0.43)}" ry="${f(ht * 0.4)}"/></clipPath>`;
  inner += `<g clip-path="url(#${id})"><rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" fill="#FFF1F5"/>`;
  inner += `<g opacity="0.6">${rays(0, ht * 0.1, 12, T * 14, '#FFFFFF', wd)}</g>`;
  const ls = ht / 100; // cabeza arriba, hasta la cintura con el bebé
  inner += luciaBaby(-wd * 0.06, -ht * 0.36 + (204 - 58) * ls, ls, T);
  inner += `</g>`;
  const hs = [[wd * 0.3, -ht * 0.18, 20], [wd * 0.34, ht * 0.12, 14], [-wd * 0.33, -ht * 0.12, 16]];
  hs.forEach(([x, y, r], i) => { const p = 0.5 + 0.5 * Math.sin(T * 4 + i * 2); inner += at(x, y - p * 10, 0.8 + 0.25 * p, `<path d="${heartPath(r)}" fill="${C.pink}" ${st12(0.6)}/>`); });
  s += thinkCloud(cx, cy, wd, ht, k) + at(cx, cy, k, inner);
  return s;
}

/* ===================== PRODUCTOS DE BEBÉ GENÉRICOS (caja local 100x100) ===================== */
const BABY = {
  bottle: sw => `<rect x="36" y="38" width="28" height="54" rx="10" fill="#FFFFFF" stroke="${INK}" stroke-width="${sw}"/>
    <path d="M40 54 H48 M40 64 H48 M40 74 H48" stroke="${INK}" stroke-width="${sw * 0.6}" stroke-linecap="round"/>
    <rect x="38" y="62" width="24" height="28" rx="8" fill="${C.glass}" opacity="0.9"/>
    <rect x="33" y="30" width="34" height="12" rx="5" fill="${C.pink}" stroke="${INK}" stroke-width="${sw}"/>
    <path d="M42 30 Q42 14 50 10 Q58 14 58 30Z" fill="${C.yel}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`,
  rattle: sw => `<rect x="46" y="54" width="9" height="38" rx="4.5" fill="${C.yel}" stroke="${INK}" stroke-width="${sw}" transform="rotate(-18 50 70)"/>
    <circle cx="58" cy="86" r="8" fill="${C.pink}" stroke="${INK}" stroke-width="${sw}"/>
    <circle cx="44" cy="36" r="24" fill="${C.blue}" stroke="${INK}" stroke-width="${sw}"/>
    <path d="M24 30 Q44 22 64 30 M22 42 Q44 50 66 42" stroke="#FFFFFF" stroke-width="${sw * 1.1}" fill="none" stroke-linecap="round"/>
    <circle cx="36" cy="28" r="4" fill="#FFFFFF" opacity="0.8"/>`,
  pacifier: sw => `<circle cx="50" cy="32" r="14" fill="none" stroke="${INK}" stroke-width="${sw * 2.3}"/><circle cx="50" cy="32" r="14" fill="none" stroke="${C.yel}" stroke-width="${sw}"/>
    <ellipse cx="50" cy="60" rx="34" ry="20" fill="${C.pink}" stroke="${INK}" stroke-width="${sw}"/>
    <circle cx="36" cy="58" r="3.5" fill="#FFFFFF" stroke="${INK}" stroke-width="${sw * 0.6}"/><circle cx="64" cy="58" r="3.5" fill="#FFFFFF" stroke="${INK}" stroke-width="${sw * 0.6}"/>
    <path d="M42 78 Q42 94 50 94 Q58 94 58 78Z" fill="#F7E3A8" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`,
  teddy: sw => teddyL(50, 94, 1, sw),
  body: sw => bodyL(50, 92, 1, sw, '#FFFFFF'),
  booties: sw => `<path d="M14 90 V58 Q14 50 22 50 H38 Q44 50 44 58 V72 Q58 74 60 84 Q60 92 52 92 H18 Q14 92 14 90Z" fill="${C.pink}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M14 60 H44" stroke="#FFFFFF" stroke-width="${sw * 1.2}"/>
    <path d="M44 84 V50 Q44 42 52 42 H68 Q74 42 74 50 V64 Q88 66 90 76 Q90 84 82 84 H48 Q44 84 44 82Z" fill="${C.glass}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M44 52 H74" stroke="#FFFFFF" stroke-width="${sw * 1.2}"/>`
};
// osito sentado (centro inferior x,y; ~70 de alto x s)
function teddyL(x, y, s, sw) {
  const P = (dx, dy) => `${f(x + dx * s)} ${f(y + dy * s)}`, R = r => f(r * s);
  return `<circle cx="${f(x - 20 * s)}" cy="${f(y - 54 * s)}" r="${R(10)}" fill="${K12.bear}" stroke="${INK}" stroke-width="${sw}"/>
    <circle cx="${f(x + 20 * s)}" cy="${f(y - 54 * s)}" r="${R(10)}" fill="${K12.bear}" stroke="${INK}" stroke-width="${sw}"/>
    <ellipse cx="${f(x)}" cy="${f(y - 16 * s)}" rx="${R(26)}" ry="${R(20)}" fill="${K12.bear}" stroke="${INK}" stroke-width="${sw}"/>
    <ellipse cx="${f(x)}" cy="${f(y - 14 * s)}" rx="${R(14)}" ry="${R(11)}" fill="${C.skin}" stroke="${INK}" stroke-width="${sw * 0.7}"/>
    <circle cx="${f(x - 24 * s)}" cy="${f(y - 4 * s)}" r="${R(9)}" fill="${K12.bear}" stroke="${INK}" stroke-width="${sw}"/>
    <circle cx="${f(x + 24 * s)}" cy="${f(y - 4 * s)}" r="${R(9)}" fill="${K12.bear}" stroke="${INK}" stroke-width="${sw}"/>
    <circle cx="${f(x)}" cy="${f(y - 44 * s)}" r="${R(22)}" fill="${K12.bear}" stroke="${INK}" stroke-width="${sw}"/>
    <ellipse cx="${f(x)}" cy="${f(y - 38 * s)}" rx="${R(10)}" ry="${R(8)}" fill="${C.skin}" stroke="${INK}" stroke-width="${sw * 0.7}"/>
    <ellipse cx="${f(x)}" cy="${f(y - 41 * s)}" rx="${R(3.4)}" ry="${R(2.6)}" fill="${INK}"/>
    <circle cx="${f(x - 8 * s)}" cy="${f(y - 49 * s)}" r="${R(2.6)}" fill="${INK}"/><circle cx="${f(x + 8 * s)}" cy="${f(y - 49 * s)}" r="${R(2.6)}" fill="${INK}"/>
    <path d="M${P(-4, -35)} Q${P(0, -32)} ${P(4, -35)}" stroke="${INK}" stroke-width="${sw * 0.6}" fill="none" stroke-linecap="round"/>
    <path d="M${P(-12, -24)} L${P(0, -20)} L${P(12, -24)} L${P(12, -16)} L${P(0, -20)} L${P(-12, -16)}Z" fill="${C.red}" stroke="${INK}" stroke-width="${sw * 0.6}" stroke-linejoin="round"/>`;
}
// body de bebé (centro inferior x,y; ~76 de alto x s)
function bodyL(x, y, s, sw, fill) {
  const p = [[-14, -76], [-6, -70], [6, -70], [14, -76], [36, -62], [28, -46], [18, -52], [18, -22], [8, -4], [8, 0], [-8, 0], [-8, -4], [-18, -22], [-18, -52], [-28, -46], [-36, -62]];
  const d = p.map(([a, b], i) => (i ? 'L' : 'M') + f(x + a * s) + ' ' + f(y + b * s)).join(' ') + 'Z';
  return `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>
    <path d="M${f(x - 6 * s)} ${f(y - 70 * s)} Q${f(x)} ${f(y - 62 * s)} ${f(x + 6 * s)} ${f(y - 70 * s)}" stroke="${C.pink}" stroke-width="${sw * 1.3}" fill="none" stroke-linecap="round"/>
    <path d="${heartPath(7 * s)}" transform="translate(${f(x)} ${f(y - 40 * s)})" fill="${C.pink}" stroke="${INK}" stroke-width="${sw * 0.6}"/>
    <circle cx="${f(x - 3 * s)}" cy="${f(y - 9 * s)}" r="${f(1.6 * s)}" fill="${INK}"/><circle cx="${f(x + 3 * s)}" cy="${f(y - 9 * s)}" r="${f(1.6 * s)}" fill="${INK}"/>`;
}
const BABY_KEYS = ['bottle', 'teddy', 'rattle', 'body', 'pacifier', 'booties'];
const BABY_BG = ['#DDF0FA', '#FFF1C9', '#FDE3EC', '#E3F4E6', '#FFF1C9', '#DDF0FA'];

/* ===================== CESTA ROSA DE MIMBRE ===================== */
// (x, y) = centro inferior; s = escala (unos 210 de ancho y 300 de alto con el asa a s=1)
const BASKET_HANDLE = 286;
function basketLocal(t = 0) {
  const sk = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let g = '';
  // asa (detrás del contenido)
  const hp = `M-84 -128 Q-92 -${BASKET_HANDLE} 0 -${BASKET_HANDLE} Q92 -${BASKET_HANDLE} 84 -128`;
  g += `<path d="${hp}" fill="none" stroke="${INK}" stroke-width="${f(28 + SW * 2)}" stroke-linecap="round"/><path d="${hp}" fill="none" stroke="${K12.wick}" stroke-width="28" stroke-linecap="round"/>`;
  g += `<path d="${hp}" fill="none" stroke="${K12.wickS}" stroke-width="5" stroke-dasharray="10 14"/>`;
  // contenido: manta rosa, body blanco y osito
  g += `<path d="M-92 -120 Q-96 -176 -46 -182 Q-10 -186 -4 -150 L-4 -120Z" fill="${C.pink}" ${sk()}/>`;
  g += `<path d="M-80 -150 Q-56 -164 -26 -160 M-84 -134 Q-56 -146 -18 -142" stroke="${K12.pinkS}" stroke-width="${f(SW * 0.7)}" fill="none" stroke-linecap="round"/>`;
  g += bodyL(-10, -112, 1.15, f(SW), '#FFFFFF');
  g += teddyL(52, -112, 1.25, f(SW));
  // cuerpo de la cesta
  const body = 'M-108 -128 H108 L88 -10 Q86 0 74 0 H-74 Q-86 0 -88 -10Z';
  g += `<path d="${body}" transform="translate(10 10)" fill="${INK}"/><path d="${body}" fill="${K12.wick}" ${sk()}/>`;
  const id = 'bk' + (uid++);
  g += `<clipPath id="${id}"><path d="${body}"/></clipPath><g clip-path="url(#${id})">`;
  for (let y = -104; y < 0; y += 24) g += `<path d="M-120 ${y} H120" stroke="${K12.wickS}" stroke-width="${f(SW * 0.8)}"/>`;
  for (let i = 0; i < 11; i++) for (let j = 0; j < 5; j++) { const x = -100 + i * 20 + (j % 2) * 10, y = -116 + j * 24; g += `<path d="M${x} ${y} l6 12" stroke="${K12.wickD}" stroke-width="${f(SW * 0.6)}" stroke-linecap="round"/>`; }
  g += `<path d="M-108 -128 L-88 0 H-60 L-76 -128Z" fill="${INK}" opacity="0.1"/></g>`;
  g += `<path d="${body}" fill="none" ${sk()}/>`;
  g += `<rect x="-116" y="-140" width="232" height="28" rx="14" fill="${K12.wick}" ${sk()}/>`;
  g += `<path d="M-100 -126 H100" stroke="${K12.wickS}" stroke-width="${f(SW * 0.7)}" stroke-dasharray="12 10"/>`;
  // lazo rosa en el asa
  const sw = 4 * Math.sin(t * 3);
  g += `<g transform="translate(-72 -178) rotate(${f(-20 + sw)})">
    <path d="M0 0 Q-44 -34 -48 -4 Q-46 26 0 0Z" fill="${C.pink}" ${sk(0.9)}/><path d="M0 0 Q44 -34 48 -4 Q46 26 0 0Z" fill="${C.pink}" ${sk(0.9)}/>
    <path d="M-4 4 L-22 46 L-10 42 L-4 52 L4 8Z" fill="${K12.pinkS}" ${sk(0.8)}/><path d="M4 4 L20 44 L8 42 L2 50 Z" fill="${C.pink}" ${sk(0.8)}/>
    <circle r="11" fill="${K12.pinkS}" ${sk(0.9)}/></g>`;
  return g;
}
const basket = (x, y, s, rot = 0, t = 0) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s)})">${basketLocal(t).replace(/stroke-width="([\d.]+)"/g, (m, v) => `stroke-width="${f(Number(v) / s)}"`)}</g>`;
// cesta colgando de un punto (hx,hy) = parte alta del asa
const basketHang = (hx, hy, s, rot = 0, t = 0) => `<g transform="translate(${f(hx)} ${f(hy)}) rotate(${f(rot)})">${basket(0, BASKET_HANDLE * s, s, 0, t)}</g>`;
// icono pequeño de cesta (para la cajetilla y la notificación): caja de 100 de ancho centrada
const basketIcon = (x, y, size) => basket(x, y + size * 0.47, size / 320);

/* ===================== MÓVIL GRANDE ===================== */
function phoneFrame(X, Y, PW, PH, screen) {
  const R = 70, b = 22, sx = X + b, sy = Y + b, sw_ = PW - 2 * b, sh = PH - 2 * b, id = 'pf' + (uid++);
  let g = `<rect x="${X + 18}" y="${Y + 18}" width="${PW}" height="${PH}" rx="${R}" fill="${INK}"/>`;
  g += `<rect x="${X}" y="${Y}" width="${PW}" height="${PH}" rx="${R}" fill="${INK}" ${st12()}/>`;
  g += `<clipPath id="${id}"><rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="${R - b}"/></clipPath>`;
  g += `<g clip-path="url(#${id})">${screen(sx, sy, sw_, sh)}</g>`;
  g += `<rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="${R - b}" fill="none" ${st12(0.8)}/>`;
  g += `<rect x="${X + PW / 2 - 60}" y="${Y + 7}" width="120" height="10" rx="5" fill="#3A3434"/>`;
  return g;
}
const PHN = { X: 150, Y: 214, PW: 780, PH: 1172 };
// cruz verde de farmacia (centro, tamaño = lado total)
function greenCross(x, y, size, glow = 0, rot = 0) {
  const a = size / 2, b = size / 6.4;
  const d = r => `M${f(-b - r)} ${f(-a - r)} H${f(b + r)} V${f(-b - r)} H${f(a + r)} V${f(b + r)} H${f(b + r)} V${f(a + r)} H${f(-b - r)} V${f(b + r)} H${f(-a - r)} V${f(-b - r)} H${f(-b - r)}Z`;
  let g = '';
  if (glow > 0) { // halo plano (sin transparencias): un contorno claro que late y cuatro destellos
    g += `<path d="${d(size * (0.08 + 0.07 * glow))}" fill="none" stroke="${K12.crossL}" stroke-width="${f(SW * 1.2)}" stroke-linejoin="round"/>`;
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
      const r1 = a * 0.62, r2 = a * (0.8 + 0.12 * glow);
      g += `<path d="M${f(sx * r1)} ${f(sy * r1)} L${f(sx * r2)} ${f(sy * r2)}" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round"/>`;
    });
  }
  g += `<path d="${d(0)}" transform="translate(${f(size * 0.05)} ${f(size * 0.05)})" fill="${INK}"/>`;
  g += `<path d="${d(0)}" fill="${C.green}" stroke="${INK}" stroke-width="${f(Math.max(3, SW * Math.min(1, size / 120)))}" stroke-linejoin="round"/>`;
  g += `<path d="${d(-size * 0.07)}" fill="none" stroke="${K12.crossL}" stroke-width="${f(Math.max(2, size * 0.035))}" stroke-linejoin="round"/>`;
  return at(x, y, 1, g, rot);
}
function iconTicks(x, y, s, col = C.blue) {
  return `<path d="M${f(x - 18 * s)} ${f(y)} l${f(6 * s)} ${f(7 * s)} l${f(12 * s)} ${f(-14 * s)} M${f(x - 4 * s)} ${f(y)} l${f(6 * s)} ${f(7 * s)} l${f(12 * s)} ${f(-14 * s)}" stroke="${col}" stroke-width="${f(5 * s)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
}
// pantalla del portal: tarjeta de oferta de la farmacia. o: kSeal, kBtn (rebote del botón), press (0..1)
function offerScreen(o = {}, t = 0) {
  return (sx, sy, sw, sh) => {
    const hh = 170;
    let g = `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" fill="${C.cream}"/>`;
    for (let yy = sy + hh + 30; yy < sy + sh; yy += 44) for (let xx = sx + 22; xx < sx + sw; xx += 44) g += `<circle cx="${xx}" cy="${yy}" r="3.5" fill="${DOT}" opacity="0.6"/>`;
    g += `<rect x="${sx}" y="${sy}" width="${sw}" height="${hh}" fill="${C.red}"/><line x1="${sx}" y1="${sy + hh}" x2="${sx + sw}" y2="${sy + hh}" ${st12()}/>`;
    const lr = hh * 0.36;
    g += `<circle cx="${f(sx + 30 + lr)}" cy="${f(sy + hh / 2 + 4)}" r="${f(lr)}" fill="#FFFFFF" ${st12(0.8)}/>` + logoIcon(sx + 30 + lr, sy + hh / 2 + 6, lr * 1.8);
    g += text('Escaparate de Tudela', sx + 30 + lr * 2 + 22, sy + hh / 2 + 4, { size: fit('Escaparate de Tudela', 54, sw - lr * 2 - 80), anchor: 'start', sw: SW * 1.4, sd: 4 });
    // tarjeta
    const x = sx + 30, y = sy + hh + 32, wd = sw - 60, ht = 800;
    g += panel(x, y, wd, ht, 34, '#FFFFFF', 12);
    const ih = 380;
    g += `<rect x="${x + 20}" y="${y + 20}" width="${wd - 40}" height="${ih}" rx="24" fill="${K12.pinkL}" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
    g += `<circle cx="${x + wd / 2}" cy="${y + 20 + ih * 0.56}" r="${f(ih * 0.4)}" fill="#FFFFFF" opacity="0.85"/>`;
    g += basket(x + wd / 2 - 20, y + 20 + ih - 24, 1.12, 2 * Math.sin(t * 2.2), t);
    g += sparkle(x + 90, y + 110, 22, 0.6 + 0.4 * Math.sin(t * 7)) + sparkle(x + wd - 170, y + ih - 30, 18, 0.6 + 0.4 * Math.sin(t * 6 + 2));
    g += pctSeal(x + wd - 108, y + 112, 82, o.kSeal === undefined ? 1 : o.kSeal, -10);
    const ty = y + ih + 82;
    g += text('Cestas de bebé', x + 36, ty, { size: fit('Cestas de bebé', 76, wd - 72), anchor: 'start', fill: INK, stroke: null });
    const ry = ty + 96;
    g += pill(x + 36 + 95, ry, 190, 72, C.red, 'Oferta', { size: 44 });
    g += greenCross(x + 280, ry, 54);
    g += text('Farmacia', x + 322, ry + 2, { size: 54, anchor: 'start', fill: C.green, stroke: INK, sw: SW * 1.3, sd: 3 });
    const by = ry + 150, bw = (wd - 90) / 2, kb = o.kBtn === undefined ? 1 : o.kBtn;
    g += at(x + 30 + bw / 2, by, kb, pill(0, 0, bw, 100, C.navy, 'Llamar', { size: 46, dx: 26 }) + iconPhone(-bw / 2 + 52, 0, 26));
    const kw = (o.kWa === undefined ? 1 : o.kWa) * kb;
    g += at(x + wd - 30 - bw / 2, by, kw, pill(0, 0, bw, 100, C.green, 'WhatsApp', { size: 44, dx: 28, pad: 100 }) + iconChat(-bw / 2 + 50, 0, 26));
    if (o.ring) g += at(x + wd - 30 - bw / 2, by, 1, `<rect x="${f(-bw / 2 - 14 - o.ring * 30)}" y="${f(-64 - o.ring * 30)}" width="${f(bw + 28 + o.ring * 60)}" height="${f(128 + o.ring * 60)}" rx="${f(64 + o.ring * 30)}" fill="none" stroke="${C.yel}" stroke-width="${f(SW * 1.4 * (1 - o.ring))}"/>`);
    // siguiente tarjeta asomando
    g += panel(x, y + ht + 34, wd, 300, 34, '#FFFFFF', 12) + `<rect x="${x + 20}" y="${y + ht + 54}" width="${wd - 40}" height="200" rx="24" fill="#DDF0FA" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;
    return g;
  };
}
function pctSeal(x, y, r, k, rot = -10) {
  if (k <= 0.01) return '';
  const d = starPath(r, r * 0.84, 16);
  let g = `<path d="${d}" transform="translate(6 6)" fill="${INK}"/><path d="${d}" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"/>`;
  g += `<circle r="${f(r * 0.7)}" fill="none" stroke="#FFFFFF" stroke-width="${f(Math.max(3, r * 0.04))}" stroke-dasharray="${f(r * 0.13)} ${f(r * 0.09)}" stroke-linecap="round"/>`;
  g += text('30 %', 0, r * 0.06, { size: fit('30 %', r * 0.62, r * 1.3, 'G'), font: 'G', sw: SW * 1.5, sd: 4 });
  return at(x, y, k, g, rot);
}

/* ---------- chat genérico ---------- */
function wrapText(str, size, maxW) {
  const words = str.split(' '), lines = [];
  let cur = '';
  words.forEach(wd => { const tr = cur ? cur + ' ' + wd : wd; if (measure(tr, size) <= maxW || !cur) cur = tr; else { lines.push(cur); cur = wd; } });
  if (cur) lines.push(cur);
  return lines;
}
const CH = { size: 46, lh: 58, pad: 28, gap: 28 };
// medidas de un mensaje (who: 'm' Marta, 'f' Farmacia, 'typing')
function msgSize(m, maxW) {
  if (m.who === 'typing') return { w: measure('Farmacia está escribiendo', 34) + 150, h: 84, lines: [] };
  const lines = wrapText(m.text, CH.size, maxW);
  const tw = Math.max(...lines.map(l => measure(l, CH.size)));
  return { w: tw + CH.pad * 2 + (m.who === 'm' ? 0 : 0), h: lines.length * CH.lh + CH.pad * 2 + (m.who === 'm' ? 30 : 4), lines };
}
function msgBubble(m, x, y, sz, t) { // x,y = esquina sup. izq.
  const isM = m.who === 'm', fill = isM ? K12.bubM : '#FFFFFF';
  let g = `<rect x="${f(x + 8)}" y="${f(y + 8)}" width="${f(sz.w)}" height="${f(sz.h)}" rx="28" fill="${INK}"/>`;
  const tail = isM ? `M${f(x + sz.w - 30)} ${f(y)} L${f(x + sz.w + 22)} ${f(y)} L${f(x + sz.w - 4)} ${f(y + 34)}Z` : `M${f(x + 30)} ${f(y)} L${f(x - 22)} ${f(y)} L${f(x + 4)} ${f(y + 34)}Z`;
  g += `<path d="${tail}" fill="${fill}" ${st12(0.8)}/>`;
  g += `<rect x="${f(x)}" y="${f(y)}" width="${f(sz.w)}" height="${f(sz.h)}" rx="28" fill="${fill}" ${st12(0.8)}/>`;
  g += `<path d="${tail.replace(/Z$/, '')}" fill="${fill}" stroke="none"/>`;
  if (m.who === 'typing') {
    g += text('Farmacia está escribiendo', x + 30, y + sz.h / 2 + 2, { size: 34, anchor: 'start', fill: '#5F6368', stroke: null, shadow: false });
    for (let i = 0; i < 3; i++) {
      const b = Math.max(0, Math.sin(2 * PI * (t * 1.8 - i * 0.18)));
      g += `<circle cx="${f(x + sz.w - 100 + i * 30)}" cy="${f(y + sz.h / 2 + 4 - b * 12)}" r="9" fill="${K12.grey}" stroke="${INK}" stroke-width="${f(SW * 0.4)}"/>`;
    }
    return g;
  }
  sz.lines.forEach((l, i) => { g += text(l, x + CH.pad, y + CH.pad + CH.lh * (i + 0.5) + 2, { size: CH.size, anchor: 'start', fill: INK, stroke: null, shadow: false }); });
  if (isM && m.ticks > 0.01) g += at(x + sz.w - 40, y + sz.h - 26, m.ticks, iconTicks(0, 0, 1.25));
  return g;
}
// pantalla del chat. msgs: [{who, text, k (0..1 aparición), ticks}], o: input (texto que se escribe), send (0..1 pulso), caret
function chatScreen(msgs, o = {}, t = 0) {
  return (sx, sy, sw, sh) => {
    let g = `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" fill="${K12.chatBg}"/>`;
    for (let yy = sy + 20; yy < sy + sh; yy += 56) for (let xx = sx + 28 + (Math.round(yy / 56) % 2) * 28; xx < sx + sw; xx += 56) g += `<circle cx="${xx}" cy="${yy}" r="3" fill="#E6D9CF"/>`;
    // cabecera
    const hh = 150;
    g += `<rect x="${sx}" y="${sy}" width="${sw}" height="${hh}" fill="${C.navy}"/><line x1="${sx}" y1="${sy + hh}" x2="${sx + sw}" y2="${sy + hh}" ${st12()}/>`;
    g += `<path d="M${sx + 52} ${sy + 52} L${sx + 30} ${sy + hh / 2 + 4} L${sx + 52} ${sy + hh - 44}" stroke="#FFFFFF" stroke-width="${f(SW * 1.2)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    g += `<circle cx="${sx + 120}" cy="${sy + hh / 2 + 4}" r="48" fill="#FFFFFF" ${st12(0.8)}/>` + greenCross(sx + 120, sy + hh / 2 + 4, 58);
    g += text('Farmacia', sx + 190, sy + hh / 2 - (o.typingHdr ? 16 : 0), { size: 56, anchor: 'start', sw: SW * 1.4, sd: 4 });
    if (o.typingHdr) g += text('escribiendo…', sx + 192, sy + hh / 2 + 36, { size: 32, anchor: 'start', fill: '#CFEFD9', stroke: null, shadow: false });
    // cajetilla fija de la oferta
    const px = sx + 24, py = sy + hh + 18, pw = sw - 48, ph = 132;
    g += `<rect x="${px + 7}" y="${py + 7}" width="${pw}" height="${ph}" rx="24" fill="${INK}"/>`;
    g += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="24" fill="#FFFFFF" ${st12(0.8)}/>`;
    g += `<rect x="${px + 16}" y="${py + 16}" width="100" height="100" rx="18" fill="${K12.pinkL}" ${st12(0.6)}/>` + basketIcon(px + 66, py + 66, 92);
    g += `<rect x="${px + 132}" y="${py + 18}" width="8" height="96" rx="4" fill="${C.red}"/>`;
    g += text('Oferta · Cestas de bebé · 30 %', px + 158, py + ph / 2 + 2, { size: fit('Oferta · Cestas de bebé · 30 %', 38, pw - 180), anchor: 'start', fill: INK, stroke: null, shadow: false });
    // campo de escritura
    const inp = o.input || '', size = 38, fw = sw - 160;
    const lines = inp ? wrapText(inp, size, fw - 50) : [];
    const show = lines.slice(-2), ih = show.length > 1 ? 150 : 100, iy = sy + sh - 24 - ih;
    g += `<rect x="${sx + 22}" y="${iy}" width="${fw}" height="${ih}" rx="50" fill="#FFFFFF" ${st12(0.8)}/>`;
    if (!inp) g += text('Mensaje', sx + 60, iy + ih / 2 + 2, { size, anchor: 'start', fill: K12.grey, stroke: null, shadow: false });
    show.forEach((l, i) => { g += text(l, sx + 52, iy + ih / 2 + (i - (show.length - 1) / 2) * 50 + 2, { size, anchor: 'start', fill: INK, stroke: null, shadow: false }); });
    if (o.caret && (Math.floor(t * 3) % 2 === 0)) {
      const lx = sx + 52 + (show.length ? measure(show[show.length - 1], size) : 0) + 4, ly = iy + ih / 2 + (show.length > 1 ? 25 : 0);
      g += `<rect x="${f(lx)}" y="${f(ly - 24)}" width="5" height="48" rx="2" fill="${C.blue}"/>`;
    }
    const kS = 1 + 0.25 * (o.send || 0);
    g += at(sx + sw - 76, iy + ih / 2, kS, `<circle r="50" fill="${C.green}" ${st12(0.8)}/>` + paperPlane(0, 0, 0.62, 0));
    // mensajes (de abajo arriba)
    const top = py + ph + 22, bot = iy - 26, maxW = sw * 0.66;
    // los mensajes empiezan arriba; cuando no caben, se desplazan hacia arriba (el último queda abajo)
    let total = CH.gap;
    msgs.forEach(m => { if (m.k > 0.001) total += (msgSize(m, maxW).h + CH.gap) * easeOut(clamp(m.k * 1.6)); });
    let y = Math.min(bot, top + total);
    let mg = '';
    for (let i = msgs.length - 1; i >= 0; i--) {
      const m = msgs[i];
      if (!m.k || m.k <= 0.001) continue;
      const sz = msgSize(m, maxW), grow = clamp(m.k * 1.6);
      y -= (sz.h + CH.gap) * easeOut(grow);
      if (y + sz.h < top - 200) break;
      const x = m.who === 'm' ? sx + sw - 34 - sz.w : sx + 34;
      const ox = m.who === 'm' ? x + sz.w : x, oy = y + sz.h;
      mg += `<g transform="translate(${f(ox)} ${f(oy)}) scale(${f(Math.min(1.2, m.k))}) translate(${f(-ox)} ${f(-oy)})">${msgBubble(m, x, y, sz, t)}</g>`;
    }
    const cid = 'cm' + (uid++);
    g += `<clipPath id="${cid}"><rect x="${sx}" y="${top}" width="${sw}" height="${bot - top + 30}"/></clipPath><g clip-path="url(#${cid})">${mg}</g>`;
    return g;
  };
}
// pulgar arriba grande (pegatina)
function thumbSticker(x, y, r, k, rot = 0) {
  if (k <= 0.01) return '';
  let g = `<path d="${starPath(r, r * 0.8, 14)}" transform="translate(8 8)" fill="${INK}"/><path d="${starPath(r, r * 0.8, 14)}" fill="${C.yel}" ${st12()}/>`;
  g += hand11('thumb', [0, r * 0.12], wW, { hs: r / 8.6 });
  return at(x, y, k, g, rot);
}

/* ===================== PORTÁTIL GRANDE (escena 2) ===================== */
function bigLaptop(x, y, wd, ht, t, scroll) {
  const id = 'lp' + (uid++), b = 28;
  let s = `<rect x="${x - b + 14}" y="${y - b + 14}" width="${wd + 2 * b}" height="${ht + 2 * b}" rx="34" fill="${INK}"/>`;
  s += `<rect x="${x - b}" y="${y - b}" width="${wd + 2 * b}" height="${ht + 2 * b}" rx="34" fill="${C.navy}" ${st12()}/>`;
  s += `<circle cx="${x + wd / 2}" cy="${y - b / 2}" r="5" fill="#1B2E45"/>`;
  s += `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${wd}" height="${ht}" rx="10"/></clipPath><g clip-path="url(#${id})">`;
  s += `<rect x="${x}" y="${y}" width="${wd}" height="${ht}" fill="#FFFFFF"/>`;
  // cuadrícula de productos que sube
  const gx = 30, cols = 3, cw = (wd - gx * (cols + 1)) / cols, chh = 270, gy = 30, top = y + 150;
  const rowH = chh + gy, off = scroll % (rowH * 2);
  for (let r = -1; r < 5; r++) {
    for (let c = 0; c < cols; c++) {
      const yy = top + gy + r * rowH - off, xx = x + gx + c * (cw + gx);
      if (yy > y + ht || yy + chh < top) continue;
      const idx = (((r % 2) + 2) % 2) * 3 + c;
      s += `<rect x="${f(xx + 7)}" y="${f(yy + 7)}" width="${f(cw)}" height="${chh}" rx="20" fill="${INK}"/>`;
      s += `<rect x="${f(xx)}" y="${f(yy)}" width="${f(cw)}" height="${chh}" rx="20" fill="#FFFFFF" ${st12(0.8)}/>`;
      s += `<rect x="${f(xx + 14)}" y="${f(yy + 14)}" width="${f(cw - 28)}" height="170" rx="14" fill="${BABY_BG[idx]}" ${st12(0.5)}/>`;
      s += unitBox(xx + 14, yy + 14, cw - 28, 170, BABY[BABY_KEYS[idx]], 0.92);
      s += `<rect x="${f(xx + 18)}" y="${f(yy + 202)}" width="${f(cw * 0.7)}" height="16" rx="8" fill="${INK}" opacity="0.55"/>`;
      s += `<rect x="${f(xx + 18)}" y="${f(yy + 232)}" width="${f(cw * 0.36)}" height="16" rx="8" fill="${C.red}" opacity="0.85"/>`;
      s += `<circle cx="${f(xx + cw - 30)}" cy="${f(yy + 238)}" r="14" fill="#FFFFFF" ${st12(0.5)}/><path d="${heartPath(8)}" transform="translate(${f(xx + cw - 30)} ${f(yy + 240)})" fill="${C.pink}"/>`;
    }
  }
  // barra del buscador (fija)
  s += `<rect x="${x}" y="${y}" width="${wd}" height="150" fill="${C.cream}"/><line x1="${x}" y1="${y + 150}" x2="${x + wd}" y2="${y + 150}" ${st12(0.7)}/>`;
  s += `<rect x="${x + 30}" y="${y + 30}" width="${wd - 60}" height="90" rx="45" fill="#FFFFFF" ${st12(0.8)}/>`;
  s += `<circle cx="${x + 84}" cy="${y + 72}" r="18" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.9)}"/><path d="M${x + 97} ${y + 85} l16 16" stroke="${INK}" stroke-width="${f(SW * 1.1)}" stroke-linecap="round"/>`;
  s += text('regalo bebé', x + 134, y + 76, { size: 48, anchor: 'start', fill: INK, stroke: null, shadow: false });
  if (Math.floor(t * 3) % 2 === 0) s += `<rect x="${f(x + 140 + measure('regalo bebé', 48))}" y="${y + 50}" width="5" height="50" rx="2" fill="${C.blue}"/>`;
  s += `</g><rect x="${x}" y="${y}" width="${wd}" height="${ht}" rx="10" fill="none" ${st12(0.8)}/>`;
  // base y teclado
  const by = y + ht + b;
  s += `<path d="M${x - b - 70} ${by + 110} L${x - b} ${by} H${x + wd + b} L${x + wd + b + 70} ${by + 110}Z" transform="translate(12 12)" fill="${INK}"/>`;
  s += `<path d="M${x - b - 70} ${by + 110} L${x - b} ${by} H${x + wd + b} L${x + wd + b + 70} ${by + 110}Z" fill="${K12.greyL}" ${st12()}/>`;
  for (let i = 0; i < 3; i++) {
    const yy = by + 18 + i * 26, sh = 70 * (i + 0.5) / 3.6;
    for (let j = 0; j < 14; j++) {
      const x0 = x - b + 20 - sh + j * ((wd + 2 * b - 40 + 2 * sh) / 14);
      s += `<rect x="${f(x0)}" y="${yy}" width="${f((wd + 2 * b - 40 + 2 * sh) / 14 - 8)}" height="18" rx="4" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.4)}"/>`;
    }
  }
  s += `<rect x="${x - b - 80}" y="${by + 108}" width="${wd + 2 * b + 160}" height="22" rx="11" fill="${K12.grey}" ${st12()}/>`;
  return s;
}

/* ===================== CALLE Y FACHADA DE LA FARMACIA ===================== */
const FAC = { x: 470, top: 330, base: 1380, door: [700, 900], doorTop: 760 };
function streetSky(T, o = {}) {
  let s = `<rect width="${W}" height="${H}" fill="${C.sky}"/><rect y="${o.band || 1060}" width="${W}" height="${H}" fill="${C.skyL}"/>`;
  s += sun(o.sunX || 170, o.sunY || 330, 62, T * 12);
  s += clouds(T);
  return s;
}
function bell(x, y, ang, k = 1) { // campanilla colgada en (x,y)
  return at(x, y, k, `<path d="M0 0 V14" stroke="${INK}" stroke-width="${f(SW * 0.7)}"/>
    <g transform="translate(0 14) rotate(${f(ang)})"><path d="M-22 40 Q-22 6 0 4 Q22 6 22 40 L28 48 H-28Z" fill="${C.yel}" ${st12(0.8)}/>
    <circle cy="52" r="7" fill="${C.wood}" ${st12(0.6)}/><path d="M-12 20 Q-10 12 -4 10" stroke="#FFFFFF" stroke-width="${f(SW * 0.6)}" fill="none" stroke-linecap="round"/></g>`);
}
function ringLines(x, y, k) {
  if (k <= 0.01) return '';
  let g = '';
  [[-1, -30], [-1, 10], [1, -30], [1, 10]].forEach(([sd, a]) => {
    const r = a * PI / 180;
    g += `<path d="M${f(sd * 40 * Math.cos(r))} ${f(40 * Math.sin(r))} L${f(sd * 70 * Math.cos(r))} ${f(70 * Math.sin(r))}" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round"/>`;
  });
  return at(x, y, k, g);
}
function shelfBoxes(x0, x1, y, seed, h = 70) { // fila de cajas genéricas sobre una balda
  const cols = ['#FFFFFF', '#DDF0FA', C.pink, '#E3F4E6', C.yel, C.glass, '#FDE3EC'];
  let s = '', x = x0 + 6, i = 0;
  while (x < x1 - 30) {
    const wd = 34 + hash(seed * 13 + i * 7.1) * 40, ht = h * (0.62 + hash(seed * 3 + i * 5.3) * 0.38);
    if (x + wd > x1 - 6) break;
    const col = cols[Math.floor(hash(seed + i * 2.7) * cols.length)];
    s += `<rect x="${f(x)}" y="${f(y - ht)}" width="${f(wd)}" height="${f(ht)}" rx="5" fill="${col}" ${st12(0.6)}/>`;
    s += `<rect x="${f(x + 5)}" y="${f(y - ht * 0.62)}" width="${f(wd - 10)}" height="${f(ht * 0.2)}" rx="3" fill="${i % 2 ? C.green : C.blue}" opacity="0.75"/>`;
    x += wd + 8; i++;
  }
  return s;
}
// fachada de la farmacia (o: open 0..1 = puerta abierta, bellAng, inside(svg) = lo que se ve por la puerta)
function pharmacyFacade(T, o = {}) {
  const { x, top, base } = FAC, w = W - x + 40, [d0, d1] = FAC.door, dt = FAC.doorTop;
  let s = `<rect x="${x + 14}" y="${top + 14}" width="${w}" height="${base - top}" fill="${INK}"/>`;
  s += `<rect x="${x}" y="${top}" width="${w}" height="${base - top + 20}" fill="#FFFFFF" ${st12()}/>`;
  // cornisa
  s += `<rect x="${x - 16}" y="${top - 10}" width="${w + 30}" height="40" rx="10" fill="${C.cream}" ${st12()}/>`;
  // ventanas del piso de arriba
  [[x + 50, 0], [x + 400, 1]].forEach(([wx]) => {
    s += glassWindow(wx, top + 70, 150, 170);
    s += `<rect x="${wx - 12}" y="${top + 240}" width="174" height="22" rx="8" fill="${C.cream}" ${st12(0.8)}/>`;
  });
  // cruz verde luminosa
  const pulse = 0.5 + 0.5 * Math.sin(T * 2 * PI * 0.9);
  s += greenCross(x + 300, top + 160, 170, 0.6 + 0.4 * pulse);
  // rótulo FARMACIA
  const sx = x + 30, sy = top + 300, sw_ = w - 100, sh = 108;
  s += `<rect x="${sx + 10}" y="${sy + 10}" width="${sw_}" height="${sh}" rx="22" fill="${INK}"/>`;
  s += `<rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="22" fill="${C.green}" ${st12()}/>`;
  s += text('FARMACIA', sx + (W - 60 - sx) / 2, sy + sh / 2 + 4, { size: 84, font: 'G', ls: 6, sw: SW * 1.6, sd: 5 });
  // escaparate izquierdo con baldas
  const ex = x + 34, ew = d0 - ex - 34, ey = dt + 20, eh = base - 110 - ey;
  s += glassWindow(ex, ey, ew, eh, (gx, gy, gw, gh) => {
    let g = '';
    [0.36, 0.7].forEach((u, i) => { const yy = gy + gh * u; g += shelfBoxes(gx + 8, gx + gw - 8, yy, i + 3, 76) + `<rect x="${gx}" y="${yy}" width="${gw}" height="12" fill="#FFFFFF" ${st12(0.6)}/>`; });
    g += greenCross(gx + gw * 0.5, gy + gh * 0.86, 56);
    return g;
  });
  s += `<rect x="${ex - 10}" y="${ey + eh}" width="${ew + 20}" height="26" rx="6" fill="${C.cream}" ${st12()}/>`;
  // escaparate derecho
  const rx = d1 + 34;
  s += glassWindow(rx, ey, W + 40 - rx, eh, (gx, gy, gw, gh) => shelfBoxes(gx + 8, gx + gw, gy + gh * 0.5, 9, 80) + `<rect x="${gx}" y="${gy + gh * 0.5}" width="${gw}" height="12" fill="#FFFFFF" ${st12(0.6)}/>`);
  // puerta: hueco interior + hoja de cristal que gira (se estrecha hacia la bisagra derecha)
  s += `<rect x="${d0 - 16}" y="${dt - 16}" width="${d1 - d0 + 32}" height="${base - dt + 16}" rx="10" fill="${C.navy}" ${st12()}/>`;
  s += `<rect x="${d0}" y="${dt}" width="${d1 - d0}" height="${base - dt}" fill="#E7F1F4"/>`;
  s += `<rect x="${d0}" y="${dt}" width="${d1 - d0}" height="${base - dt}" fill="${DOT}" opacity="0.25"/>`;
  s += `<rect x="${d0}" y="${base - 130}" width="${d1 - d0}" height="130" fill="${K12.tileB}"/><line x1="${d0}" y1="${base - 130}" x2="${d1}" y2="${base - 130}" ${st12(0.6)}/>`;
  if (o.inside) s += o.inside;
  const op = clamp(o.open || 0), lw = (d1 - d0) * (1 - 0.86 * op);
  const lx = d1 - lw;
  s += `<rect x="${f(lx)}" y="${dt}" width="${f(lw)}" height="${base - dt}" fill="${C.glass}" ${st12()}/>`;
  if (lw > 60) {
    s += `<path d="M${f(lx + lw * 0.2)} ${dt + 20} L${f(lx + lw * 0.42)} ${dt + 20} L${f(lx + lw * 0.12)} ${base - 40} L${f(lx + 4)} ${base - 40}Z" fill="#FFFFFF" opacity="0.5"/>`;
    s += greenCross(lx + lw * 0.5, dt + 120, Math.min(70, lw * 0.4));
    s += `<rect x="${f(lx + 18)}" y="${dt + (base - dt) * 0.52}" width="14" height="70" rx="7" fill="${C.cream}" ${st12(0.7)}/>`;
  }
  s += bell(d0 + 40, dt + 4, o.bellAng || 0);
  // escalón
  s += `<rect x="${d0 - 40}" y="${base - 14}" width="${d1 - d0 + 80}" height="28" rx="8" fill="#E8DCD8" ${st12()}/>`;
  return s;
}
// edificio vecino (bajo, crema, con balcón y macetas)
function neighbor(T) {
  const x = -40, top = 640, base = FAC.base, w = FAC.x + 30;
  let s = `<rect x="${x}" y="${top}" width="${w}" height="${base - top + 20}" fill="${C.cream}" ${st12()}/>`;
  s += `<rect x="${x - 10}" y="${top - 16}" width="${w + 20}" height="34" rx="10" fill="#F2B5AD" ${st12()}/>`;
  s += glassWindow(70, top + 70, 160, 220) + glassWindow(290, top + 70, 140, 220);
  s += `<rect x="50" y="${top + 290}" width="400" height="20" rx="6" fill="${C.navy}" ${st12(0.8)}/>`;
  for (let i = 0; i < 9; i++) s += `<rect x="${60 + i * 44}" y="${top + 310}" width="10" height="70" fill="${C.navy}"/>`;
  s += `<rect x="50" y="${top + 380}" width="400" height="16" rx="6" fill="${C.navy}" ${st12(0.8)}/>`;
  [[110, C.red], [250, C.pink], [380, C.red]].forEach(([fx, col]) => { s += `<circle cx="${fx - 18}" cy="${top + 276}" r="14" fill="${col}" ${st12(0.6)}/><circle cx="${fx + 6}" cy="${top + 268}" r="16" fill="${col}" ${st12(0.6)}/><rect x="${fx - 36}" y="${top + 276}" width="64" height="18" rx="5" fill="${C.wood}" ${st12(0.6)}/>`; });
  s += `<rect x="90" y="${top + 470}" width="300" height="${base - top - 470}" rx="12" fill="#F2B5AD" ${st12()}/>`;
  s += `<rect x="120" y="${top + 500}" width="240" height="${base - top - 540}" rx="8" fill="${C.cream}" ${st12(0.6)}/>`;
  return s;
}
function streetScene(T, o = {}) {
  let s = streetSky(T, o);
  s += neighbor(T);
  s += pharmacyFacade(T, o);
  s += ground(FAC.base, 0, {});
  return s;
}

/* ===================== INTERIOR DE LA FARMACIA ===================== */
const FI = { floor: 1380, counter: 1030, cx0: 470 };
function pharmacyInterior(T) {
  const id = 'fd' + (uid++), cell = 10 * W / 380;
  let s = `<defs><pattern id="${id}" width="${f(cell)}" height="${f(cell)}" patternUnits="userSpaceOnUse"><circle cx="${f(cell / 2)}" cy="${f(cell / 2)}" r="${f(1.4 * W / 380)}" fill="#E4ECF0"/></pattern></defs>`;
  s += `<rect width="${W}" height="${H}" fill="#FFFFFF"/><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
  // estanterías a los lados
  const shelf = (x0, x1, y0, y1, seed) => {
    let g = `<rect x="${x0 + 12}" y="${y0 + 12}" width="${x1 - x0}" height="${y1 - y0}" rx="12" fill="${INK}"/>`;
    g += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="12" fill="${C.wood}" ${st12()}/>`;
    g += `<rect x="${x0 + 18}" y="${y0 + 18}" width="${x1 - x0 - 36}" height="${y1 - y0 - 36}" rx="6" fill="#F5F0EC" ${st12(0.6)}/>`;
    const n = 4, hh = (y1 - y0 - 36) / n;
    for (let i = 1; i <= n; i++) {
      const yy = y0 + 18 + i * hh;
      g += shelfBoxes(x0 + 22, x1 - 22, yy - 8, seed + i, hh * 0.8);
      if (i < n) g += `<rect x="${x0 + 18}" y="${f(yy - 10)}" width="${x1 - x0 - 36}" height="20" fill="${C.wood}" ${st12(0.6)}/>`;
    }
    return g;
  };
  s += shelf(-30, 300, 280, 1180, 1) + shelf(800, 1110, 280, 1000, 7);
  // cruz verde en la pared
  s += `<rect x="${370 + 10}" y="${350 + 10}" width="360" height="320" rx="34" fill="${INK}"/><rect x="370" y="350" width="360" height="320" rx="34" fill="#FFFFFF" ${st12()}/>`;
  s += greenCross(550, 510, 220, 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(T * 2 * PI * 0.9)));
  // suelo de baldosas
  const fy = FI.floor;
  s += `<rect x="-20" y="${fy}" width="${W + 40}" height="${H - fy + 20}" fill="#FFFFFF"/>`;
  for (let j = 0; j < 7; j++) {
    const y0 = fy + j * 90;
    for (let i = -1; i < 9; i++) if ((i + j) % 2 === 0) s += `<rect x="${i * 140 + (j % 2) * 0}" y="${y0}" width="140" height="90" fill="${K12.tileB}"/>`;
  }
  for (let j = 1; j < 7; j++) s += `<line x1="-20" y1="${fy + j * 90}" x2="${W + 20}" y2="${fy + j * 90}" ${st12(0.4)}/>`;
  for (let i = 0; i < 9; i++) s += `<line x1="${i * 140}" y1="${fy}" x2="${i * 140}" y2="${H}" ${st12(0.4)}/>`;
  s += `<line x1="-20" y1="${fy}" x2="${W + 20}" y2="${fy}" ${st12()}/>`;
  return s;
}
function pharmacyCounter() {
  const x0 = FI.cx0, top = FI.counter, fy = FI.floor;
  let s = `<rect x="${x0 + 14}" y="${top + 14}" width="${W - x0 + 40}" height="${fy - top}" fill="${INK}"/>`;
  s += `<rect x="${x0}" y="${top}" width="${W - x0 + 40}" height="${fy - top + 10}" fill="#FFFFFF" ${st12()}/>`;
  s += `<rect x="${x0 + 30}" y="${top + 70}" width="${W - x0 - 10}" height="${fy - top - 120}" rx="16" fill="#F3F7F8" ${st12(0.7)}/>`;
  s += `<rect x="${x0}" y="${top + 40}" width="${W - x0 + 40}" height="14" fill="${C.green}"/>`;
  s += `<rect x="${x0 - 22}" y="${top - 26}" width="${W - x0 + 60}" height="40" rx="12" fill="#FFFFFF" ${st12()}/>`;
  return s;
}

/* ===================== FARMACÉUTICA (a partir de la dependienta del vídeo 10) ===================== */
const FARMA = { id: 'farma', blush: 0.6, sh: [[208, 106], [172, 106]] };
// local: suelo y=208, mira a la derecha. o: expr, look, blink, armF/armB ({ik,side}|{ang,bend}), bob, head, pony
function farma(o) {
  const k = o.k || 1, w = v => f(v * k), st = (v = 3) => st10(w, v);
  let b = '';
  const [SF, SB] = FARMA.sh;
  // coleta baja (detrás)
  b += `<g transform="rotate(${f(o.pony || 0)} 177 86)"><path d="M180 82 Q168 86 168 100 Q169 112 175 118 Q182 110 182 98 Q183 89 181 83Z" fill="${K12.blond}" ${st()}/>
    <path d="M173 96 Q172 104 174 111" stroke="${K12.blondS}" stroke-width="${w(1.3)}" fill="none" stroke-linecap="round"/></g>`;
  b += tArm(SB, o.armB, true, w, o.itemB);
  b += `<rect x="186.5" y="88" width="7" height="14" rx="2" fill="${C.skinS}" ${st()}/>`;
  // bata blanca abierta sobre camiseta verde
  const coat = 'M176 99 Q190 95 204 99 Q212 102 212 116 L214 196 H166 L168 116 Q168 102 176 99Z';
  const id = 'fc' + (uid++);
  b += `<clipPath id="${id}"><path d="${coat}"/></clipPath><g clip-path="url(#${id})">
    <rect x="160" y="94" width="60" height="110" fill="#FFFFFF"/><rect x="160" y="94" width="18" height="110" fill="#E8E2E0"/>
    <path d="M184 97 Q190 101 198 97 L199 200 H183Z" fill="${K12.tee}"/><path d="M184 97 L183 200" stroke="${INK}" stroke-width="${w(1.8)}"/><path d="M198 97 L199 200" stroke="${INK}" stroke-width="${w(1.8)}"/>
    <path d="M185.6 98.6 Q191 103.6 196.6 98.6" stroke="${K12.teeS}" stroke-width="${w(1.6)}" fill="none"/></g>`;
  b += `<path d="${coat}" fill="none" ${st()}/>`;
  // solapas
  b += `<path d="M184 98 L188 112 L182 116 L179 101Z M198 98 L194 112 L200 116 L203 101Z" fill="#FFFFFF" ${st(1.7)}/>`;
  // bolsillo con bolígrafo
  b += `<rect x="201" y="131" width="9" height="11" rx="2" fill="#FFFFFF" ${st(1.5)}/><rect x="203.4" y="126.6" width="2.2" height="7" rx="1" fill="${C.blue}" ${st(1)}/>`;
  if (o.front0) b += o.front0(w);
  b += tArm(SF, o.armF, false, w, o.itemF);
  // cabeza
  let hd = `<circle cx="190" cy="80" r="15" fill="${C.skin}" ${st()}/>`;
  hd += `<path d="M175 84 Q171 63 190 63 Q207 63 206 77 Q200 69 191 69.6 Q186 74 179 75 Q177 79 178 86Z" fill="${K12.blond}" ${st()}/>`;
  hd += `<path d="M184 66.5 Q191 64.6 198 66.4" stroke="#FFFFFF" stroke-width="${w(1)}" fill="none" stroke-linecap="round" opacity="0.6"/>`;
  hd += `<rect x="175.2" y="80.4" width="5" height="4.4" rx="1.6" fill="${C.green}" ${st(1.4)}/>`;
  hd += tFace(FARMA, o, w);
  // arruguitas de sonrisa (unos 40 años)
  hd += `<path d="M208.6 79.4 l1.6 -0.8 M208.8 82 l1.8 0.2" stroke="${INK}" stroke-width="${w(0.9)}" stroke-linecap="round" opacity="0.6"/>`;
  b += `<g transform="rotate(${f(o.head || 0)} 190 96)">${hd}</g>`;
  if (o.front) b += o.front(w);
  return `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
}
function placeFarma(px, py, sc, o) {
  o.k = SW / (3 * sc);
  const sx = o.flip ? -sc : sc;
  return `<g transform="translate(${f(px - 190 * sx)} ${f(py - 208 * sc)}) scale(${f(sx)} ${f(sc)})">${farma(o)}</g>`;
}
const fPt = (px, py, sc, lx, ly, flip) => [px + (lx - 190) * sc * (flip ? -1 : 1), py + (ly - 208) * sc];
const fLoc = (px, py, sc, X, Y, flip) => [190 + (X - px) / sc * (flip ? -1 : 1), 208 + (Y - py) / sc];

/* ===================== TEXTOS Y EXTRAS ===================== */
function qMark(x, y, size, k, rot) { return at(x, y, k, text('?', 0, 0, { size, font: 'G', fill: C.yel, sw: SW * 2, sd: 6 }), rot); }
function heartPop(x, y, r, k, rot = 0) { return k > 0.01 ? at(x, y, k, `<path d="${heartPath(r)}" transform="translate(5 5)" fill="${INK}"/><path d="${heartPath(r)}" fill="${C.pink}" ${st12(0.9)}/><circle cx="${f(-r * 0.4)}" cy="${f(-r * 0.25)}" r="${f(r * 0.16)}" fill="#FFFFFF"/>`, rot) : ''; }
// hoja de calendario «VIERNES»
function viernesSheet(x, y, k, rot = 0) {
  if (k <= 0.01) return '';
  const wd = 640, ht = 520, x0 = -wd / 2, y0 = -ht / 2, hb = 120;
  let g = `<rect x="${x0 + 16}" y="${y0 + 16}" width="${wd}" height="${ht}" rx="40" fill="${INK}"/>`;
  g += `<rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="40" fill="#FFFFFF" ${st12(1.2)}/>`;
  g += `<path d="M${x0} ${y0 + hb} V${y0 + 40} Q${x0} ${y0} ${x0 + 40} ${y0} H${-x0 - 40} Q${-x0} ${y0} ${-x0} ${y0 + 40} V${y0 + hb}Z" fill="${C.red}" ${st12(1.2)}/>`;
  [-0.28, 0.28].forEach(u => { g += `<rect x="${f(wd * u - 14)}" y="${y0 - 46}" width="28" height="92" rx="14" fill="${C.cream}" ${st12()}/>`; });
  g += text('VIERNES', 0, 40, { size: fit('VIERNES', 190, wd - 80, 'G'), font: 'G', fill: C.red, sw: SW * 2.2, sd: 8, ls: 4 });
  g += `<ellipse cx="0" cy="44" rx="${wd * 0.46}" ry="140" fill="none" stroke="${C.red}" stroke-width="${f(SW * 1.4)}" stroke-dasharray="30 14" opacity="0.0"/>`;
  g += `<path d="M${x0 + 70} ${y0 + ht - 80} H${-x0 - 70}" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-dasharray="4 22" stroke-linecap="round"/>`;
  return at(x, y, k, g, rot);
}
// seto redondeado en primer plano (escena 9): copa a la altura y=1395 y acera debajo
function hedge(T) {
  let s = `<rect x="-20" y="1560" width="${W + 40}" height="${H - 1560 + 20}" fill="${C.ground}"/><line x1="-20" y1="1560" x2="${W + 20}" y2="1560" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  let a = '';
  for (let i = 0; i < 9; i++) { const x = -40 + i * 145, r = 92 + 14 * hash(i * 4.1); a += `<circle cx="${x}" cy="${f(1400 + r * 0.55)}" r="${f(r)}"/>`; }
  a += `<rect x="-40" y="1450" width="${W + 80}" height="120"/>`;
  s += `<g transform="translate(0 10)" fill="${INK}">${a}</g><g fill="${INK}" stroke="${INK}" stroke-width="${f(SW * 2)}">${a}</g><g fill="${C.green}">${a}</g>`;
  for (let i = 0; i < 16; i++) { const x = 20 + i * 68 + 20 * hash(i), y = 1440 + 70 * hash(i * 2.3); s += `<path d="M${f(x - 12)} ${f(y)} Q${f(x)} ${f(y - 14)} ${f(x + 12)} ${f(y)}" stroke="#2E7D49" stroke-width="${f(SW * 0.8)}" fill="none" stroke-linecap="round"/>`; }
  s += `<rect x="-20" y="1556" width="${W + 40}" height="12" fill="${INK}"/>`;
  return s;
}
