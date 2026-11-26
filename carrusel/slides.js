/* Carrusel «Próxima apertura» (1080x1350). Piezas del vídeo 17 (src/v17.js, src/maria.js…) sin cambios.
   Margen de seguridad 80 px: todo lo importante entre x 80..1000 e y 80..1270.
   T = tiempo (los PNG usan T = 10; la diapositiva 4 tiene además un bucle de 4 s: todo lo que se mueve es periódico). */
'use strict';
const CAR_H = 1350, M = 80;
const per = (T, p = 4, k = 1) => Math.sin(2 * PI * k * T / p);   // oscilación que se repite cada p s

// barra pequeña de arriba: icono del logo (sin letras, el nombre va escrito al lado) + «Escaparate de Tudela»
function topBar() {
  const str = 'Escaparate de Tudela', size = 44, tw = measure(str, size), wd = tw + 130, ht = 78, x0 = 540 - wd / 2, y0 = M;
  let s = `<rect x="${x0 + 7}" y="${y0 + 7}" width="${wd}" height="${ht}" rx="${ht / 2}" fill="${INK}"/>`;
  s += `<rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="${ht / 2}" fill="${C.red}" ${st17(0.9)}/>`;
  s += `<circle cx="${x0 + 44}" cy="${y0 + ht / 2}" r="30" fill="#FFFFFF" ${st17(0.6)}/>` + logoI13(x0 + 44, y0 + ht / 2, 54);
  s += text(str, x0 + 88, y0 + ht / 2 + 3, { size, anchor: 'start', sw: SW * 1.3, sd: 4 });
  return s;
}
// indicador discreto de página
function pager(n) {
  let s = '';
  for (let i = 1; i <= 5; i++) s += `<circle cx="${470 + (i - 1) * 24}" cy="${CAR_H - M - 8}" r="${i === n ? 8 : 6}" fill="${i === n ? C.red : '#FFFFFF'}" stroke="${INK}" stroke-width="2.5"/>`;
  s += `<rect x="608" y="${CAR_H - M - 30}" width="74" height="44" rx="22" fill="#FFFFFF" opacity="0.92" stroke="${INK}" stroke-width="2.5"/>`;
  s += text(`${n}/5`, 645, CAR_H - M - 7, { size: 28, fill: INK, stroke: null, shadow: false });
  return s;
}
// párrafo centrado (líneas ya partidas), negro sobre fondo claro o blanco con contorno
function para(lines, y, size, o = {}) {
  let s = '';
  lines.forEach((ln, i) => {
    const sz = fit(ln, size, 920);
    s += o.light ? text(ln, 540, y + i * size * 1.22, { size: sz, sw: SW * 1.6, sd: 5 }) : text(ln, 540, y + i * size * 1.22, { size: sz, fill: INK, stroke: null, shadow: false });
  });
  return s;
}
function band(y0, y1, col = '#FFFFFF', op = 0.85) { return `<rect x="${M - 20}" y="${y0}" width="${W - 2 * M + 40}" height="${y1 - y0}" rx="34" fill="${col}" opacity="${op}" ${st17(0.8)}/>`; }

const SL = {};
/* 1) PORTADA: como el arranque del vídeo: texto gancho sobre el cielo, el local con la persiana y el cartel, María grande */
SL[1] = T => {
  const z = 0.6, wx = 520, sx = 395, wy = 210, sy = 452;   // el mundo del vídeo (1080x1920) a escala 0,6
  const Y = v => sy + (v - wy) * z;
  let s = `<rect width="${W}" height="${CAR_H}" fill="#BFE3F2"/><rect y="${f(Y(160))}" width="${W}" height="${f(Y(1400) - Y(160))}" fill="${WALL17}"/><rect y="${f(Y(1400))}" width="${W}" height="400" fill="${C.ground}"/>`;
  s += camAt(z, wx, wy, sx, sy, storefront17(T) + aperturaSign(1, 0, -3));
  const xr = sx + (W + 400 - wx) * z;   // el mundo del vídeo acaba ahí: se completa la pared y la acera a la derecha
  s += `<rect x="${f(xr - 2)}" y="${f(Y(150))}" width="${W}" height="${f(Y(1400) - Y(150))}" fill="${WALL17}"/><rect x="${f(xr - 2)}" y="${f(Y(150))}" width="${W}" height="${f(24 * z)}" fill="${WALL17S}"/>`;
  const xg = sx + (-20 - wx) * z;   // acera a la izquierda
  s += `<rect x="0" y="${f(Y(1400))}" width="${f(xg + 1)}" height="400" fill="${C.ground}"/><line x1="0" y1="${f(Y(1400))}" x2="${f(xg)}" y2="${f(Y(1400))}" ${st17(0.6)}/>`;
  const xg2 = sx + (W + 20 - wx) * z;
  s += `<rect x="${f(xg2 - 1)}" y="${f(Y(1400))}" width="${W}" height="400" fill="${C.ground}"/><line x1="${f(xr - 2)}" y1="${f(Y(1400))}" x2="${W}" y2="${f(Y(1400))}" ${st17(0.6)}/>`;
  const SC = 6.3;
  s += mariaBrow(mariaW(800, 1305, SC, Object.assign(mBase(T, SC), {
    expr: 'happy', head: 5, blink: false,
    armF: mArm(true, [223, 97], 'count', { n: 1, hs: 1.45, hrot: 6 }), armB: M_REST_B()
  })));
  s += topBar();
  s += bigT('¿ERES DE TUDELA?', 540, 248, 118, 1, -3, { fill: C.yel, maxW: 920 });
  s += strip15('ESTO TE INTERESA', 540, 365, 1, 2, { size: 62, h: 98, w: 640 });
  s += mark('!', 1000 - 30, 760, 1, 12, 120, C.yel);
  return s + pager(1);
};

/* 2) ¿QUÉ ES?: cartel rojo, explicación y la web dentro de un móvil */
const WEB2 = { X: 346, Y: 634, PW: 388, PH: 592 };
// marco de móvil con la captura de la web (carrusel/captura_web.png, recortada antes de la primera oferta)
function shotPhone(X, Y, PW, PH) {
  const b = 16, R = 54, sx = X + b, sy = Y + b, sw_ = PW - 2 * b, sh = PH - 2 * b, id = 'wp' + (uid++);
  let g = `<rect x="${X + 16}" y="${Y + 16}" width="${PW}" height="${PH}" rx="${R}" fill="${INK}"/><rect x="${X}" y="${Y}" width="${PW}" height="${PH}" rx="${R}" fill="${INK}" ${st17()}/>`;
  g += `<clipPath id="${id}"><rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="${R - b}"/></clipPath>`;
  g += `<g clip-path="url(#${id})"><rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" fill="#FFFFFF"/><svg x="${sx}" y="${sy}" width="${sw_}" height="${sh}" viewBox="0 0 1080 1725" preserveAspectRatio="xMidYMin slice"><use href="#web"/></svg></g>`;
  g += `<rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="${R - b}" fill="none" ${st17(0.7)}/><rect x="${X + PW / 2 - 50}" y="${Y + 5}" width="100" height="8" rx="4" fill="#3A3434"/>`;
  return g;
}
SL[2] = T => {
  let s = dotWide(0, W, 0, CAR_H);
  s += rays(540, 880, 18, 4, '#FFFFFF').replace(/<path /g, '<path opacity="0.55" ');
  s += topBar();
  s += at(540, 278, 1, redSign17(620, 190, [['¿QUÉ ES?', 140, 6]], { tape: true }), -3);
  s += band(400, 620);
  s += para(['Una web donde los comercios de Tudela', 'publican sus ofertas, novedades y eventos,', 'y tú lo ves todo en un solo sitio.'], 452, 46);
  // la web en el móvil (feed con las tarjetas del vídeo)
  s += shotPhone(WEB2.X, WEB2.Y, WEB2.PW, WEB2.PH);
  s += sparkle(WEB2.X - 40, WEB2.Y + 120, 34) + sparkle(WEB2.X + WEB2.PW + 40, WEB2.Y + 300, 26);
  // María pequeña a la izquierda, señalando el móvil
  const SC = 3.4;
  s += placeMaria(180, CAR_H - M - 30, SC, Object.assign(mBase(T, SC), { expr: 'sparkle', head: 4, blink: false,
    armF: mArm(true, [222, 110], 'point', { dir: -15, hs: 1.4 }), armB: M_REST_B() }));
  return s + pager(2);
};

/* 3) PARA LOS COMERCIOS: el móvil en el centro con las tres tarjetas y flechas que explican cada una */
const PH3 = { X: 360, Y: 520, PW: 360, PH: 690 };
function callout(x, y, wd, title, col, lines) {
  let g = `<rect x="${x + 8}" y="${y + 8}" width="${wd}" height="${86 + lines.length * 40}" rx="24" fill="${INK}"/>`;
  g += `<rect x="${x}" y="${y}" width="${wd}" height="${86 + lines.length * 40}" rx="24" fill="#FFFFFF" ${st17(0.9)}/>`;
  g += text(title, x + wd / 2, y + 44, { size: fit(title, 54, wd - 30, 'G'), font: 'G', fill: col, sw: SW * 1.2, sd: 4, ls: 1 });
  lines.forEach((ln, i) => { g += text(ln, x + wd / 2, y + 100 + i * 40, { size: fit(ln, 32, wd - 26), fill: INK, stroke: null, shadow: false }); });
  return g;
}
function arrow3(x1, y1, x2, y2) {
  const a = Math.atan2(y2 - y1, x2 - x1), hx = x2 - Math.cos(a) * 26, hy = y2 - Math.sin(a) * 26;
  const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 30;
  const d = `M${x1} ${y1} Q${mx} ${my} ${f(hx)} ${f(hy)}`;
  const head = `M${x2} ${y2} L${f(hx - Math.sin(a) * 22 - Math.cos(a) * 6)} ${f(hy + Math.cos(a) * 22 - Math.sin(a) * 6)} L${f(hx + Math.sin(a) * 22 - Math.cos(a) * 6)} ${f(hy - Math.cos(a) * 22 - Math.sin(a) * 6)}Z`;
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${f(SW * 2.4)}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${C.yel}" stroke-width="${f(SW * 1.1)}" stroke-linecap="round"/>` +
    `<path d="${head}" fill="${C.yel}" ${st17(0.8)}/>`;
}
SL[3] = T => {
  let s = `<rect width="${W}" height="${CAR_H}" fill="#BFE3F2"/>` + rays(540, 860, 18, 2, '#FFFFFF').replace(/<path /g, '<path opacity="0.45" ');
  s += topBar();
  s += strip15('PARA LOS COMERCIOS', 540, 262, 1, -2, { size: 74, h: 116, w: 900 });
  s += para(['Publica tus novedades,', 'tus eventos y tus ofertas.'], 376, 54, { light: true });
  // móvil centrado con las tres tarjetas (oferta, novedad, evento)
  const sx = PH3.X + 22, sw_ = PH3.PW - 44, top = PH3.Y + 22 + 130, cs = (sw_ - 40) / 290, ch = 150 * cs, gap = 22;
  const ys = [0, 1, 2].map(i => top + 20 + ch / 2 + i * (ch + gap));
  s += portalPhone(PH3.X, PH3.Y, PH3.PW, PH3.PH, () => ['oferta', 'novedad', 'evento'].map((k, i) => at(sx + sw_ / 2, ys[i], cs, card15Local(k, T))).join(''), { hh: 130 });
  // explicaciones a los lados con flechas
  const CW = 262, CHT = 166;
  s += callout(M, ys[0] - CHT / 2 - 30, CW, 'OFERTA', C.red, ['descuentos', 'y promociones']) + arrow3(M + CW, ys[0] - 30, sx + 24, ys[0]);
  s += callout(W - M - CW, ys[1] - CHT / 2, CW, 'NOVEDAD', C.navy, ['lo nuevo que', 'llega a la tienda']) + arrow3(W - M - CW, ys[1], sx + sw_ - 20, ys[1]);
  s += callout(M, ys[2] - CHT / 2 + 20, CW, 'EVENTO', '#C99A1E', ['talleres, catas,', 'presentaciones']) + arrow3(M + CW, ys[2] + 20, sx + 24, ys[2]);
  return s + pager(3);
};

/* 4) PARA LOS CLIENTES: corazón rojo grande que late, iconos, confeti, María feliz (bucle de 4 s en carrusel_04.mp4) */
SL[4] = T => {
  let s = `<rect width="${W}" height="${CAR_H}" fill="${C.cream}"/>` + rays(540, 820, 16, T * 90 / 4, '#FDE3EC');
  s += topBar();
  s += strip15('PARA LOS CLIENTES', 540, 262, 1, 2 * per(T, 4), { size: 74, h: 116, w: 860 });
  s += band(345, 545);
  s += para(['Entérate de todo, benefíciate', 'de las promociones y apoya', 'al comercio local.'], 390, 50);
  // confeti que cae (periódico)
  for (let i = 0; i < 22; i++) {
    const x = 60 + (i * 47) % 960, y = 560 + ((T / 4 + i * 0.137) % 1) * 760, r = (T * 90 + i * 40);
    s += `<rect x="-9" y="-5" width="18" height="10" rx="3" fill="${[C.red, C.yel, C.green, C.blue, C.pink][i % 5]}" stroke="${INK}" stroke-width="2" transform="translate(${f(x)} ${f(y)}) rotate(${f(r)})"/>`;
  }
  // María feliz, abrazando el corazón
  const SC = 5.2;
  s += mariaW(310, 1250, SC, Object.assign(mBase(T, SC), { expr: 'joy', head: 4 * per(T, 2), blink: false, curl: 3 * per(T, 2),
    armF: mArm(true, [226, 96 + 3 * per(T, 1)], 'open', { hs: 1.45, hrot: 15 * per(T, 1) }), armB: mArm(false, [176, 126], 'heart', { hs: 1.4 }) }));
  // corazón grande que late (dos golpes por segundo)
  const beatK = 1 + 0.09 * Math.max(0, Math.sin(2 * PI * T / 0.8)) ** 3;
  s += heart17(735, 790, 175, beatK, C.red, -6);
  s += sparkle(560, 640, 30, 1 + 0.25 * per(T, 1)) + sparkle(930, 960, 26, 1 + 0.25 * per(T, 1, 1.5));
  // iconos alrededor (descuentos, compra), flotando
  s += iconDisc17(900, 1110 + 10 * per(T, 2), 88, 1) + pctTag17(900, 1116 + 10 * per(T, 2), 54, 1);
  s += iconDisc17(620, 1140 + 10 * per(T, 2, 1.5), 80, 1) + shopBag17(620, 1150 + 10 * per(T, 2, 1.5), 50, 1);
  return s + pager(4);
};

/* 5) CIERRE: «ENTÉRATE DE CUÁNDO ABRIMOS»; clientes (Comenta CANAL) y comercios (correo); María despidiéndose */
SL[5] = T => {
  let s = `<rect width="${W}" height="${CAR_H}" fill="#BFE3F2"/>` + rays(540, 1250, 16, 3, '#FFFFFF').replace(/<path /g, '<path opacity="0.5" ');
  s += cloud(-60, 1000, 0.6) + cloud(860, 1060, 0.5);
  s += topBar();
  s += bigT('ENTÉRATE DE', 540, 238, 96, 1, -2, { maxW: 920 });
  s += bigT('CUÁNDO ABRIMOS', 540, 338, 104, 1, 2, { fill: C.yel, maxW: 920 });
  // bloque clientes
  s += text('CLIENTES', 120, 432, { size: 40, font: 'G', anchor: 'start', fill: C.red, sw: SW * 1.2, sd: 3, ls: 2 });
  s += waCard17(540, 520, 1, -1);
  s += whoPill('Comenta CANAL y te enviamos el canal de WhatsApp', 540, 640, 1, { size: 33 });
  // bloque comercios
  s += text('COMERCIOS', 120, 732, { size: 40, font: 'G', anchor: 'start', fill: C.red, sw: SW * 1.2, sd: 3, ls: 2 });
  const wd = 920, ht = 290, x0 = 80, y0 = 760;
  let g = `<rect x="${x0 + 12}" y="${y0 + 12}" width="${wd}" height="${ht}" rx="32" fill="${INK}"/><rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="32" fill="#FFFFFF"/>`;
  g += `<path d="M${x0} ${y0 + 100} V${y0 + 32} Q${x0} ${y0} ${x0 + 32} ${y0} H${x0 + wd - 32} Q${x0 + wd} ${y0} ${x0 + wd} ${y0 + 32} V${y0 + 100}Z" fill="${C.red}"/><line x1="${x0}" y1="${y0 + 100}" x2="${x0 + wd}" y2="${y0 + 100}" ${st17()}/>`;
  g += text('¿Tienes un comercio?', 540, y0 + 52, { size: 66, sw: SW * 1.8, sd: 5 });
  g += text('Escríbenos y te informamos', 540, y0 + 140, { size: 44, fill: INK, stroke: null, shadow: false });
  g += envIcon17(150, y0 + 205, 32) + text('info@escaparatetudela.es', 560, y0 + 205, { size: fit('info@escaparatetudela.es', 62, 740), fill: C.red, stroke: null, shadow: false });
  g += text('Enlace en la descripción', 540, y0 + 258, { size: 34, fill: '#6B6262', stroke: null, shadow: false });
  g += `<rect x="${x0}" y="${y0}" width="${wd}" height="${ht}" rx="32" fill="none" ${st17(1.1)}/>`;
  s += g;
  // María despidiéndose (asoma por abajo a la derecha, mano abierta saludando)
  const SC = 3.9;
  s += mariaW(880, 1388, SC, Object.assign(mBase(T, SC), { expr: 'wink', head: -4, blink: false,
    armF: mArm(true, [226, 84], 'open', { hs: 1.45, hrot: 18 }), armB: M_REST_B() }));
  s += text('¡Hasta muy pronto!', 100, 1150, { size: 50, anchor: 'start', fill: C.yel, sw: SW * 1.6, sd: 5 });
  return s + pager(5);
};

window.renderSlide = function (n, T) {
  uid = 0;
  document.getElementById('dyn').innerHTML = SL[n](T);
};
