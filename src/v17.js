/* Vídeo 17 — «Próxima apertura». Piezas nuevas sobre lib.js + series.js + v04…v16.js + maria.js:
   cielo con nubes a la izquierda, el local «Escaparate de Tudela» con la persiana metálica bajada, carteles rojos
   («PRÓXIMA APERTURA · DICIEMBRE», «¿QUÉ ES?»), interior con ventana, feed del móvil con las tarjetas del vídeo 15,
   iconos de cliente (%, corazón, bolsa), cartel del canal de WhatsApp (icono genérico de chat, sin logos) y la
   tarjeta «¿Tienes un comercio?» con el correo. María (src/maria.js) se usa tal cual; la ceja levantada de la
   escena 1 es solo una expresión (se cambia el trazo de una ceja en el SVG que devuelve placeMaria). */
'use strict';

const st17 = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
const GREY = { s: '#B9BFC6', d: '#8D949C', l: '#DCE0E4', box: '#7C838B' };
const WALL17 = '#F3DFC6', WALL17S = '#E2C7A6';
const WA_GREEN = '#25A35A';

/* ===================== MARÍA: ceja levantada (sin tocar maria.js) ===================== */
const BROW_HAPPY = 'M180.6 84.6 Q183.4 83 186.4 84.2 M193.6 84.2 Q196.6 83 199.4 84.6';
const BROW_RAISED = 'M180.6 85 Q183.4 84 186.4 84.8 M193.2 81.6 Q196.4 78.2 199.8 80.6';
function mariaBrow(svg) { return svg.replace(BROW_HAPPY, BROW_RAISED); }

/* ===================== CIELO (escena 1 y exterior) ===================== */
const CL17 = [{ x: 40, y: 300, s: 0.95, v: 9 }, { x: -60, y: 640, s: 0.7, v: 6 }, { x: 120, y: 980, s: 0.55, v: 5 }, { x: 760, y: 220, s: 0.5, v: 7 }];
function sky17(T, o = {}) {
  const band = o.band === undefined ? 1150 : o.band;
  let s = `<rect x="-400" y="-400" width="${W + 800}" height="${H + 800}" fill="#BFE3F2"/><rect x="-400" y="${band}" width="${W + 800}" height="${H + 800}" fill="#E4F4FA"/>`;
  (o.clouds || CL17).forEach(c => { s += cloud(c.x + 14 * Math.sin(T * 0.4 + c.y) + c.v * T * 0.6, c.y, c.s); });
  return s;
}

/* ===================== EL LOCAL CON LA PERSIANA ===================== */
const SHOP17 = { x0: 140, x1: 940, top: 480, base: 1400, signY: 210, signH: 190 };
// rótulo del local: icono del logo (sin letras, porque el nombre va escrito al lado) + «Escaparate de Tudela»
function shopSign17(y, h) {
  let s = `<rect x="88" y="${y + 12}" width="920" height="${h}" rx="26" fill="${INK}"/>`;
  s += `<rect x="76" y="${y}" width="920" height="${h}" rx="26" fill="${C.red}" ${st17(1.1)}/>`;
  s += `<rect x="96" y="${y + 18}" width="880" height="${h - 36}" rx="16" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 0.5)}" opacity="0.5"/>`;
  const cx = 190, cy = y + h / 2;
  s += `<circle cx="${cx + 6}" cy="${cy + 6}" r="70" fill="${INK}"/><circle cx="${cx}" cy="${cy}" r="70" fill="#FFFFFF" ${st17(0.9)}/>` + logoI13(cx, cy, 128);
  const str = 'Escaparate de Tudela', size = fit(str, 92, 700);
  s += text(str, 610, cy + 4, { size, sw: SW * 1.9, sd: 6 });
  return s;
}
// persiana metálica de lamas horizontales, bajada hasta el suelo
function shutter17(x0, x1, top, base) {
  const id = 'sh' + (uid++);
  let s = `<rect x="${x0 - 36}" y="${top - 46}" width="${x1 - x0 + 72}" height="56" rx="10" fill="${GREY.box}" ${st17()}/>`;
  s += `<rect x="${x0 - 30}" y="${top}" width="30" height="${base - top}" fill="${GREY.d}" ${st17(0.8)}/><rect x="${x1}" y="${top}" width="30" height="${base - top}" fill="${GREY.d}" ${st17(0.8)}/>`;
  s += `<defs><pattern id="${id}" width="40" height="38" patternUnits="userSpaceOnUse" y="${top}"><rect width="40" height="38" fill="${GREY.s}"/><rect y="30" width="40" height="8" fill="${GREY.d}"/><rect y="2" width="40" height="5" fill="${GREY.l}"/></pattern></defs>`;
  s += `<rect x="${x0}" y="${top + 10}" width="${x1 - x0}" height="${base - top - 10}" fill="url(#${id})"/>`;
  // brillo diagonal
  s += `<path d="M${x0 + 80} ${top + 10} L${x0 + 200} ${top + 10} L${x0 + 20} ${base} L${x0} ${base} L${x0} ${top + 300}Z" fill="#FFFFFF" opacity="0.18"/>`;
  s += `<rect x="${x0}" y="${base - 40}" width="${x1 - x0}" height="40" fill="${GREY.box}"/>`;
  s += `<rect x="${(x0 + x1) / 2 - 60}" y="${base - 30}" width="120" height="18" rx="9" fill="${GREY.l}" ${st17(0.6)}/>`;
  s += `<rect x="${x0}" y="${top + 10}" width="${x1 - x0}" height="${base - top - 10}" fill="none" ${st17()}/>`;
  return s;
}
// fachada completa (coordenadas del mundo 1080x1920); el suelo empieza en SHOP17.base
function storefront17(T) {
  const S_ = SHOP17;
  let s = sky17(T, { band: 900, clouds: [{ x: -40, y: 130, s: 0.6, v: 6 }, { x: 700, y: 90, s: 0.45, v: 5 }] });
  s += `<rect x="-400" y="160" width="${W + 800}" height="${S_.base - 160}" fill="${WALL17}" ${st17()}/>`;
  // ladrillos suaves en los laterales
  for (let y = 470; y < S_.base - 20; y += 64) {
    for (const x of [-10, 1000]) s += `<rect x="${x + ((y / 64) % 2 ? 20 : -10)}" y="${y}" width="80" height="26" rx="8" fill="${WALL17S}"/>`;
  }
  s += `<rect x="-400" y="150" width="${W + 800}" height="24" fill="${WALL17S}" ${st17(0.8)}/>`;
  s += shopSign17(S_.signY, S_.signH);
  s += `<rect x="70" y="${S_.top - 76}" width="940" height="20" rx="8" fill="${GREY.box}" ${st17(0.7)}/>`;
  s += shutter17(S_.x0, S_.x1, S_.top, S_.base);
  s += ground(S_.base, 0, { sp: 230 });
  return s;
}
// cartel rojo de letras blancas (centrado en 0,0). lines = [[texto, tamaño], …]
function redSign17(wd, ht, lines, o = {}) {
  let g = `<rect x="${-wd / 2 + 14}" y="${-ht / 2 + 14}" width="${wd}" height="${ht}" rx="28" fill="${INK}"/>`;
  g += `<rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="28" fill="${C.red}" ${st17(1.2)}/>`;
  g += `<rect x="${-wd / 2 + 18}" y="${-ht / 2 + 18}" width="${wd - 36}" height="${ht - 36}" rx="16" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 0.6)}" stroke-dasharray="22 14" opacity="0.75"/>`;
  lines.forEach(([str, size, y, col]) => { g += text(str, 0, y, { size: fit(str, size, wd - 90), sw: SW * 2, sd: 6, fill: col || '#FFFFFF' }); });
  if (o.tape) [-1, 1].forEach(sd => { g += `<rect x="-55" y="-18" width="110" height="36" fill="#FFF3B8" opacity="0.85" ${st17(0.5)} transform="translate(${sd * (wd / 2 - 40)} ${-ht / 2 + 4}) rotate(${sd * 28})"/>`; });
  return g;
}
const APERTURA = { x: 520, y: 820, w: 620, h: 300 };
// cartel «PRÓXIMA APERTURA / DICIEMBRE» sobre la persiana; k = escala (golpe), sh = vibración
function aperturaSign(k, sh = 0, rot = -3) {
  const A = APERTURA, L1 = TX('apertura1', 'PRÓXIMA APERTURA'), L2 = TX('apertura2', 'DICIEMBRE');
  return at(A.x + sh, A.y + sh * 0.4, k, redSign17(A.w, A.h, [[L1, 92, -40], [L2, 76, 70]], { tape: true }), rot + sh * 0.25);
}

/* ===================== INTERIOR CON VENTANA ===================== */
function window17(x, y, wd, ht, T) {
  const id = 'wn' + (uid++);
  let s = `<rect x="${x + 14}" y="${y + 14}" width="${wd}" height="${ht}" rx="18" fill="${INK}"/>`;
  s += `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${wd}" height="${ht}" rx="18"/></clipPath>`;
  let g = `<rect x="${x}" y="${y}" width="${wd}" height="${ht}" fill="#BFE3F2"/><rect x="${x}" y="${y + ht * 0.72}" width="${wd}" height="${ht}" fill="#E4F4FA"/>`;
  g += cloud(x + 60 + ((T * 18) % (wd + 300)) - 150, y + ht * 0.3, 0.5) + cloud(x + wd - 120 - ((T * 10) % (wd + 300)) + 150, y + ht * 0.62, 0.36);
  s += `<g clip-path="url(#${id})">${g}</g>`;
  s += `<rect x="${x}" y="${y}" width="${wd}" height="${ht}" rx="18" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 2.2)}"/>`;
  s += `<rect x="${x}" y="${y}" width="${wd}" height="${ht}" rx="18" fill="none" ${st17()}/>`;
  s += `<path d="M${x + wd / 2} ${y} V${y + ht} M${x} ${y + ht / 2} H${x + wd}" stroke="#FFFFFF" stroke-width="${f(SW * 1.6)}"/><path d="M${x + wd / 2} ${y} V${y + ht} M${x} ${y + ht / 2} H${x + wd}" fill="none" ${st17(0.4)} opacity="0.5"/>`;
  s += `<rect x="${x - 26}" y="${y + ht}" width="${wd + 52}" height="30" rx="8" fill="${C.wood}" ${st17(0.8)}/>`;
  return s;
}
function room17(T) {
  let s = dotWide();
  s += window17(70, 360, 420, 520, T);
  // plantita en la repisa
  s += `<path d="M230 ${880 - 4} q-40 -90 -10 -150 q20 50 10 150 M280 876 q10 -110 60 -140 q-10 70 -60 140 M250 876 q-80 -60 -90 -120 q60 20 90 120" fill="${C.green}" ${st17(0.7)}/>`;
  s += `<path d="M205 878 H305 L292 950 H218Z" fill="${C.red}" ${st17(0.8)}/>`;
  s += `<rect x="-400" y="1380" width="${W + 800}" height="800" fill="#FFFFFF"/><line x1="-400" y1="1380" x2="${W + 400}" y2="1380" ${st17(0.7)}/>`;
  return s;
}

/* ===================== FEED DEL MÓVIL (tarjetas del vídeo 15) ===================== */
const FEED17 = ['oferta', 'novedad', 'evento', 'oferta', 'novedad'];
// ks[i] = aparición (rebote) de la tarjeta i; el feed sube una tarjeta cada vez que entra otra
function feedBody17(ks, t) {
  return (sx, sy, sw_, sh_) => {
    let g = '';
    const cs = (sw_ - 36) / 290, ch = 150 * cs, gap = 24;
    // desplazamiento: suma de las tarjetas que ya han entrado (con suavizado)
    let n = 0;
    ks.forEach(k => { n += easeOut(clamp(k * 1.4)); });
    const slot = i => sy + 26 + ch / 2 + (i - Math.max(0, n - 3)) * (ch + gap);
    ks.forEach((k, i) => {
      if (k <= 0.001) return;
      const y = slot(i);
      if (y < sy - ch || y > sy + sh_ + ch) return;
      g += at(sx + sw_ / 2, y, cs * Math.min(1.12, k), card15Local(FEED17[i % FEED17.length], t));
    });
    return g;
  };
}

/* ===================== ICONOS PARA CLIENTES ===================== */
function heart17(x, y, r, k, fill = C.red, rot = 0) {
  if (k <= 0.01) return '';
  return at(x, y, k, `<path d="${heartPath(r)}" transform="translate(${f(r * 0.1)} ${f(r * 0.1)})" fill="${INK}"/><path d="${heartPath(r)}" fill="${fill}" ${st17(1.1)}/>
    <path d="M${f(-r * 0.75)} ${f(-r * 0.45)} q${f(r * 0.15)} ${f(-r * 0.35)} ${f(r * 0.45)} ${f(-r * 0.3)}" stroke="#FFFFFF" stroke-width="${f(SW * 1.1)}" fill="none" stroke-linecap="round" opacity="0.8"/>`, rot);
}
// etiqueta de precio con «%»
function pctTag17(x, y, r, k, rot = -14) {
  if (k <= 0.01) return '';
  const d = `M${-r * 0.55} ${-r} H${r * 0.55} L${r * 0.9} ${-r * 0.55} V${r} H${-r * 0.9} V${-r * 0.55}Z`;
  let g = `<path d="${d}" transform="translate(9 9)" fill="${INK}"/><path d="${d}" fill="${C.yel}" ${st17(1.1)}/>`;
  g += `<circle cx="0" cy="${f(-r * 0.6)}" r="${f(r * 0.14)}" fill="#FFFFFF" ${st17(0.7)}/>`;
  g += text('%', 0, r * 0.22, { size: r * 1.15, font: 'G', fill: C.red, sw: SW * 1.5, sd: 4 });
  return at(x, y, k, g, rot);
}
// bolsa de la compra de papel con asas
function shopBag17(x, y, r, k, rot = 8) {
  if (k <= 0.01) return '';
  const d = `M${-r * 0.8} ${-r * 0.5} H${r * 0.8} L${r * 0.92} ${r} H${-r * 0.92}Z`;
  let g = `<path d="M${-r * 0.4} ${-r * 0.45} Q${-r * 0.4} ${-r * 1.15} 0 ${-r * 1.15} Q${r * 0.4} ${-r * 1.15} ${r * 0.4} ${-r * 0.45}" fill="none" stroke="${INK}" stroke-width="${f(SW * 2.6)}" stroke-linecap="round"/>`;
  g += `<path d="M${-r * 0.4} ${-r * 0.45} Q${-r * 0.4} ${-r * 1.15} 0 ${-r * 1.15} Q${r * 0.4} ${-r * 1.15} ${r * 0.4} ${-r * 0.45}" fill="none" stroke="${C.dred}" stroke-width="${f(SW * 1)}" stroke-linecap="round"/>`;
  g += `<path d="${d}" transform="translate(9 9)" fill="${INK}"/><path d="${d}" fill="${C.red}" ${st17(1.1)}/>`;
  g += `<path d="M${-r * 0.8} ${-r * 0.5} L${-r * 0.55} ${-r * 0.18} H${r * 0.55} L${r * 0.8} ${-r * 0.5}" fill="${C.dred}" opacity="0.5"/>`;
  g += `<circle cx="${f(-r * 0.4)}" cy="${f(-r * 0.3)}" r="${f(r * 0.08)}" fill="${INK}"/><circle cx="${f(r * 0.4)}" cy="${f(-r * 0.3)}" r="${f(r * 0.08)}" fill="${INK}"/>`;
  g += `<path d="${heartPath(r * 0.3)}" transform="translate(0 ${f(r * 0.35)})" fill="#FFFFFF" ${st17(0.6)}/>`;
  return at(x, y, k, g, rot);
}
// círculo blanco de fondo para los iconos
function iconDisc17(x, y, r, k) {
  if (k <= 0.01) return '';
  return at(x, y, k, `<circle cx="10" cy="10" r="${r}" fill="${INK}"/><circle r="${r}" fill="#FFFFFF" ${st17(1.1)}/>`);
}

/* ===================== CANAL DE WHATSAPP (icono genérico de chat, sin logos) ===================== */
function chatIcon17(x, y, r) {
  const d = `M${-r} ${-r * 0.55} Q${-r} ${-r} ${-r * 0.55} ${-r} H${r * 0.55} Q${r} ${-r} ${r} ${-r * 0.55} V${r * 0.3} Q${r} ${r * 0.75} ${r * 0.55} ${r * 0.75} H${-r * 0.1} L${-r * 0.6} ${r * 1.15} L${-r * 0.5} ${r * 0.75} H${-r * 0.55} Q${-r} ${r * 0.75} ${-r} ${r * 0.3}Z`;
  let g = `<path d="${d}" fill="#FFFFFF" ${st17(0.9)}/>`;
  [-0.45, 0, 0.45].forEach(u => { g += `<circle cx="${f(r * u)}" cy="${f(-r * 0.12)}" r="${f(r * 0.13)}" fill="${INK}"/>`; });
  return `<g transform="translate(${f(x)} ${f(y)})">${g}</g>`;
}
function waCard17(x, y, k, rot = -2) {
  if (k <= 0.01) return '';
  const wd = 880, ht = 150, str = TX('s5a', 'CANAL DE WHATSAPP');
  let g = `<rect x="${-wd / 2 + 12}" y="${-ht / 2 + 12}" width="${wd}" height="${ht}" rx="${ht / 2}" fill="${INK}"/>`;
  g += `<rect x="${-wd / 2}" y="${-ht / 2}" width="${wd}" height="${ht}" rx="${ht / 2}" fill="${WA_GREEN}" ${st17(1.2)}/>`;
  g += `<circle cx="${-wd / 2 + 82}" cy="0" r="56" fill="#1C7E45" ${st17(0.8)}/>` + chatIcon17(-wd / 2 + 82, -4, 34);
  g += text(str, 60, 4, { size: fit(str, 82, wd - 210), sw: SW * 2, sd: 6 });
  return at(x, y, k, g, rot);
}
// flechita que señala hacia abajo (a la descripción)
function arrowDown17(x, y, len, k, t) {
  if (k <= 0.01) return '';
  const dy = 10 * Math.sin(t * 8);
  const d = `M-16 0 H16 V${len - 34} H40 L0 ${len + 10} L-40 ${len - 34} H-16Z`;
  return at(x, y + dy, k, `<path d="${d}" transform="translate(7 7)" fill="${INK}"/><path d="${d}" fill="${C.yel}" ${st17(1)}/>`);
}

/* ===================== TARJETA «¿TIENES UN COMERCIO?» (solo escena 6) ===================== */
function envIcon17(x, y, r) {
  const wd = r * 2, ht = r * 1.36;
  return `<g transform="translate(${f(x)} ${f(y)})"><rect x="${-r}" y="${f(-ht / 2)}" width="${wd}" height="${f(ht)}" rx="${f(r * 0.18)}" fill="#FFFFFF" ${st17(0.8)}/>
    <path d="M${f(-r + 4)} ${f(-ht / 2 + 4)} L0 ${f(ht * 0.12)} L${f(r - 4)} ${f(-ht / 2 + 4)}" fill="none" ${st17(0.8)} stroke-linecap="round"/></g>`;
}
// centrada en (0,0): 880 x 470 (y de 800 a 1300 con el centro en 1050)
function infoCard17(t, kBtn = 1, kMail = 1, kSmall = 1, press = 0) {
  const wd = 880, ht = 480, x0 = -wd / 2, y0 = -ht / 2, hh = 130;
  let g = `<rect x="${x0 + 16}" y="${y0 + 16}" width="${wd}" height="${ht}" rx="36" fill="${INK}"/>`;
  g += `<rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="36" fill="#FFFFFF"/>`;
  g += `<path d="M${x0} ${y0 + hh} V${y0 + 36} Q${x0} ${y0} ${x0 + 36} ${y0} H${x0 + wd - 36} Q${x0 + wd} ${y0} ${x0 + wd} ${y0 + 36} V${y0 + hh}Z" fill="${C.red}"/>`;
  g += `<line x1="${x0}" y1="${y0 + hh}" x2="${x0 + wd}" y2="${y0 + hh}" ${st17()}/>`;
  const q = TX('s6a', '¿TIENES UN COMERCIO?');
  g += text(q, 0, y0 + hh / 2 + 4, { size: fit(q, 80, wd - 80), sw: SW * 2, sd: 6 });
  // botón
  const by = y0 + hh + 92, bw = 700, bh = 112, sq = 1 - 0.06 * press;
  const btn = `<rect x="${-bw / 2 + 9}" y="${-bh / 2 + 9}" width="${bw}" height="${bh}" rx="${bh / 2}" fill="${INK}"/><rect x="${-bw / 2}" y="${-bh / 2}" width="${bw}" height="${bh}" rx="${bh / 2}" fill="${C.red}" ${st17(1.1)}/>` +
    envIcon17(-bw / 2 + 80, 0, 36) + text(TX('s6b', 'QUIERO INFORMACIÓN'), 46, 4, { size: fit(TX('s6b', 'QUIERO INFORMACIÓN'), 62, bw - 200), sw: SW * 1.7, sd: 5 });
  g += at(0, by, kBtn * sq, btn);
  // correo, en negrita y bien legible
  const mail = TX('s6c', 'info@escaparatetudela.es');
  g += at(0, by + 128, kMail, text(mail, 0, 0, { size: fit(mail, 70, wd - 70), fill: INK, stroke: null, shadow: false }));
  g += `<rect x="${f(-measure(mail, fit(mail, 70, wd - 70)) / 2)}" y="${by + 128 + 38}" width="${f(measure(mail, fit(mail, 70, wd - 70)) * clamp(kMail))}" height="8" rx="4" fill="${C.red}" opacity="${clamp(kMail)}"/>`;
  const sm = TX('s6d', 'o enlace en la descripción');
  if (kSmall > 0.01) g += at(0, y0 + ht - 38, kSmall, text(sm, 0, 0, { size: 40, fill: '#6B6262', stroke: null, shadow: false }));
  g += `<rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="36" fill="none" ${st17(1.2)}/>`;
  return g;
}

/* ===================== «¿QUÉ ES?» GRANDE, PUESTO POR UNA MANO DESDE LA DERECHA ===================== */
// mano grande (piel de María) que sujeta el borde derecho del cartel; (x,y) = punto de agarre
function bigHand17(x, y, grip = 1) {
  const sk = MG.skin, ss = MG.skinS;
  let g = `<path d="M${x + 60} ${y - 10} L${W + 400} ${y + 60}" stroke="${INK}" stroke-width="${f(150 + SW * 2)}" stroke-linecap="round"/>`;
  g += `<path d="M${x + 60} ${y - 10} L${W + 400} ${y + 60}" stroke="${sk}" stroke-width="150" stroke-linecap="round"/>`;
  g += `<path d="M${x + 150} ${y + 50} L${W + 400} ${y + 108}" stroke="${ss}" stroke-width="34" stroke-linecap="round" opacity="0.8"/>`;
  // manga azul del vestido de María
  g += `<path d="M${x + 330} ${y - 100} L${x + 420} ${y + 140} L${W + 400} ${y + 230} L${W + 400} ${y - 60}Z" fill="${MG.dress}" ${st17(1.1)}/>`;
  // palma y dedos por delante del borde del cartel (los dedos se abren al soltar)
  g += `<ellipse cx="${x + 70}" cy="${y}" rx="78" ry="92" fill="${sk}" ${st17(1.1)}/>`;
  [-62, -22, 18, 58].forEach((dy, i) => {
    const len = 96 - Math.abs(i - 1.5) * 10, op = (1 - grip) * 40;
    g += `<rect x="${f(x - len + 10 + op)}" y="${f(y + dy - 19)}" width="${f(len)}" height="38" rx="19" fill="${sk}" ${st17(0.9)}/>`;
  });
  g += `<path d="M${x + 20} ${y - 70} Q${x - 20} ${y - 120} ${x - 50} ${y - 104}" stroke="${INK}" stroke-width="${f(44 + SW * 2)}" stroke-linecap="round" fill="none"/><path d="M${x + 20} ${y - 70} Q${x - 20} ${y - 120} ${x - 50} ${y - 104}" stroke="${sk}" stroke-width="44" stroke-linecap="round" fill="none"/>`;
  return g;
}
// u = tiempo desde que entra; hold = momento (desde la entrada) en que la mano suelta y se va
function queSign17(u, hold = 0.5) {
  const wd = 840, ht = 420, cx = 520, cy = 880;
  const pin = pop(u, 0, 0.55);                       // entra desde la derecha con rebote
  const out = easeInOut(seg(u, hold, hold + 0.35));  // la mano se va
  const sx = cx + (1 - pin) * 1200;
  const rot = lerp(9, -3, pin) + (u > hold ? 2.5 * damp(u - hold, 10, 4) : 0);
  let s = `<rect width="${W}" height="${H}" fill="${INK}" opacity="${f(0.28 * clamp(u / 0.3))}"/>`;
  s += at(sx, cy, 1, redSign17(wd, ht, [[TX('s2b', '¿QUÉ ES?'), 230, 10]], { tape: false }), rot);
  if (out < 1) {
    const gx = sx + wd / 2 + 65 + out * 900, gy = cy + 20 + out * 120;
    s += `<g transform="rotate(${f(rot)} ${f(sx)} ${f(cy)})">${bigHand17(gx, gy, 1 - out * 2)}</g>`;
  }
  if (u > 0.5 && u < 1.3) s += sparkle(cx - wd / 2 + 20, cy - ht / 2 - 10, 34, pop(u, 0.5, 0.4)) + sparkle(cx + wd / 2 - 60, cy + ht / 2 + 20, 26, pop(u, 0.6, 0.4));
  return s;
}
