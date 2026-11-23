// Generador del carrusel de Instagram de Escaparate de Tudela.
// Uso:  node carrusel/plantilla/generar.js <carpeta> [--sin-estado]
//   <carpeta> contiene publicaciones.json y las fotos (JPG) que nombra.
//   Escribe en esa carpeta 01.jpg, 02.jpg… y pie.txt (asunto, pie de foto y hashtags).
//   Actualiza carrusel/estado.json para que el siguiente carrusel rote personajes
//   (salvo con --sin-estado, para pruebas).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = path.resolve(__dirname, '..');
const W = 1080, H = 1350;
const RED = '#C81E1E', DARK = '#2B1010', PLAZA = '#A81414', PINK = '#FDE3E3';
const MAX_PUB = 8;

// ---------- personajes: bbox del contenido (x0,y0,x1,y1) y zona blanca (x,y,w,h) en el PNG 1500x1875
const PJ = {
  maria_cartel:    { bb: [234, 131, 1266, 1806], zona: [296, 817, 908, 549] },
  maria_movil:     { bb: [415, 131, 1085, 1806], zona: [539, 837, 422, 688] },
  maria_senalando: { bb: [438, 132, 1411, 1806] },
  maria_sonriendo: { bb: [438, 131, 1062, 1806] },
  pedro_cartel:    { bb: [234, 172, 1266, 1806], zona: [296, 637, 908, 549] },
  pedro_movil:     { bb: [390, 172, 1110, 1806], zona: [539, 657, 422, 688] },
  pedro_senalando: { bb: [494, 173, 1347, 1806] },
  pedro_sonriendo: { bb: [494, 173, 1006, 1806] },
};
// Orden de rotación de las diapositivas de contenido: alterna María/Pedro y la pose.
const CICLO = ['maria_senalando', 'pedro_sonriendo', 'maria_sonriendo', 'pedro_senalando'];

// Logos (PNG 500x500) y caja de su contenido, para recortarlos con CSS.
const LOGO_BLANCO = { file: 'logo_blanco.png', bb: [106, 81, 395, 424] };
const LOGO_ROJO = { file: 'logo_rojo.png', bb: [107, 81, 395, 424] };

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const TIPOS = { oferta: 'OFERTA', novedad: 'NOVEDAD', evento: 'EVENTO' };
const FRASES = {
  oferta: [['¡Mira esta', 'oferta!'], ['¡No te la', 'pierdas!'], ['¡Corre, que', 'vuela!']],
  novedad: [['¡Mira qué', 'novedad!'], ['¡Esto es', 'nuevo!'], ['¡Recién', 'llegado!']],
  evento: [['¡Apúntalo', 'en la agenda!'], ['¡No faltes!'], ['¡Te', 'esperamos!']],
};

// ---------- utilidades
const datauri = (file, mime) => `data:${mime};base64,` + fs.readFileSync(file).toString('base64');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cache = {};
const pjUri = (n) => (cache[n] ??= datauri(path.join(BASE, 'personajes', n + '.png'), 'image/png'));
const logoUri = (l) => (cache[l.file] ??= datauri(path.join(BASE, '..', l.file), 'image/png'));

function fecha(s) { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); }
function iso(d) { return d.toISOString().slice(0, 10); }
function sumaDias(s, n) { const d = fecha(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); }
function ddmm(s) { const d = fecha(s); return String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0'); }
function hoyMadrid() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date()); }

function rango(desde, hasta, hoy) {
  const a = fecha(desde), b = fecha(hasta);
  const da = a.getUTCDate(), db = b.getUTCDate(), ma = a.getUTCMonth(), mb = b.getUTCMonth();
  if (desde === hasta) {
    const deHoy = desde === hoy;
    return { asunto: `del ${da} de ${MESES[ma]}`, l1: `${da}`, l2: MESES[ma].toUpperCase(),
      paren: `${da} de ${MESES[ma]}`, portada: deHoy ? 'DE HOY' : 'DEL DÍA', pie: deHoy ? 'de hoy' : `del ${da} de ${MESES[ma]}` };
  }
  const extra = { portada: 'DE ESTA SEMANA', pie: 'de esta semana' };
  if (ma === mb) return { ...extra, asunto: `del ${da} al ${db} de ${MESES[mb]}`, l1: `${da} – ${db}`, l2: MESES[mb].toUpperCase() };
  return {
    ...extra,
    asunto: `del ${da} de ${MESES[ma]} al ${db} de ${MESES[mb]}`,
    l1: `${da} – ${db}`,
    l2: `${MESES[ma].slice(0, 3).toUpperCase()} – ${MESES[mb].slice(0, 3).toUpperCase()}`,
  };
}

// Coloca un personaje con el centro de su contenido en xc y los pies en yb. Devuelve html y zona blanca.
function personaje(n, s, xc, yb, espejo = false) {
  const [x0, y0, x1, y1] = PJ[n].bb;
  const cx = espejo ? 1500 - (x0 + x1) / 2 : (x0 + x1) / 2;
  const tx = xc - cx * s, ty = yb - y1 * s;
  const img = `<img class="pj" src="${pjUri(n)}" style="left:${tx.toFixed(1)}px;top:${ty.toFixed(1)}px;width:${1500 * s}px;height:${1875 * s}px;${espejo ? 'transform:scaleX(-1);' : ''}">`;
  const z = PJ[n].zona;
  return { html: img, zona: z && { x: tx + z[0] * s, y: ty + z[1] * s, w: z[2] * s, h: z[3] * s } };
}

function logo(l, x, y, h) {
  const [x0, y0, x1, y1] = l.bb, k = h / (y1 - y0);
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${(x1 - x0) * k}px;height:${h}px;overflow:hidden">
    <img src="${logoUri(l)}" style="position:absolute;left:${-x0 * k}px;top:${-y0 * k}px;width:${500 * k}px;height:${500 * k}px"></div>`;
}

// Caja de texto que se encoge hasta caber (ver script fit() en la página).
const caja = (x, y, w, h, html, css = '') =>
  `<div class="fit" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${css}">${html}</div>`;

function plaza() {
  let g = `<g fill="${PLAZA}">`;
  for (const [x, y, w, h] of [[0, 980, 150, 370], [150, 900, 130, 450], [280, 1010, 120, 340], [690, 1000, 130, 350], [820, 930, 120, 420], [940, 990, 140, 360]]) {
    g += `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++)
      g += `<rect x="${(x + 22 + i * (w - 60)).toFixed(0)}" y="${y + 30 + j * 70}" width="22" height="38" rx="11" fill="${RED}"/>`;
  }
  g += `<rect x="440" y="800" width="110" height="550"/><path d="M432 800 L495 640 L558 800 Z"/><rect x="486" y="600" width="18" height="50"/>`;
  g += `<rect x="478" y="850" width="34" height="60" rx="17" fill="${RED}"/><rect x="400" y="1180" width="190" height="170"/></g>`;
  return `<svg class="bg" viewBox="0 0 ${W} ${H}">${g}</svg>`;
}

function etiquetaFecha(cx, cy, rot, l1, l2) {
  return `<div style="position:absolute;left:${cx - 166}px;top:${cy - 78}px;width:332px;height:156px;transform:rotate(${rot}deg)">
    <svg width="332" height="156" viewBox="-166 -78 332 156" style="overflow:visible;position:absolute;inset:0">
      <path d="M-150 -78 H150 Q166 -78 166 -62 V62 Q166 78 150 78 H-150 Q-166 78 -166 62 V-62 Q-166 -78 -150 -78 Z" fill="#fff" stroke="${DARK}" stroke-width="7"/>
      <circle cx="-128" cy="0" r="14" fill="${RED}" stroke="${DARK}" stroke-width="5"/></svg>
    ${caja(-90 + 166, 14, 240, 78, `<b style="font-size:68px;color:${RED};white-space:nowrap">${esc(l1)}</b>`)}
    ${caja(-90 + 166, 92, 240, 44, `<b style="font-size:30px;color:${DARK};white-space:nowrap">${esc(l2)}</b>`)}
  </div>`;
}

// Bocadillo con la cola hacia abajo a la izquierda (o a la derecha si cola='der').
function bocadillo(x, y, w, h, lineas, cola) {
  const p = `M${x + 30} ${y} H${x + w - 30} Q${x + w} ${y} ${x + w} ${y + 30} V${y + h - 30} Q${x + w} ${y + h} ${x + w - 30} ${y + h} H${x + 110} L${x - 10} ${y + h + 50} L${x + 50} ${y + h} H${x + 30} Q${x} ${y + h} ${x} ${y + h - 30} V${y + 30} Q${x} ${y} ${x + 30} ${y} Z`;
  const t = cola === 'der' ? `transform="translate(${2 * x + w} 0) scale(-1 1)"` : '';
  return `<svg class="bg" viewBox="0 0 ${W} ${H}"><path ${t} d="${p}" fill="#fff" stroke="${DARK}" stroke-width="7" stroke-linejoin="round"/></svg>`
    + caja(x + 24, y + 16, w - 48, h - 32, `<b style="font-size:50px;line-height:1.15;color:${DARK}">${lineas.map(esc).join('<br>')}</b>`);
}

function pagina(cuerpo) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Poppins;font-weight:700;src:url(${cache.bold})}
@font-face{font-family:Poppins;font-weight:300;src:url(${cache.light})}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{background:${RED};font-family:Poppins;position:relative}
.bg{position:absolute;inset:0;width:${W}px;height:${H}px;overflow:visible}
.pj{position:absolute;transform-origin:center}
.fit{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden;line-height:1.1}
.fit.izq{align-items:flex-start;text-align:left}
b,i{display:block;max-width:100%} b{font-weight:700} i{font-style:normal;font-weight:300}
</style></head><body>${cuerpo}
<script>
// Encoge el texto de cada .fit hasta que quepa en su caja (se llama cuando ya está cargada la fuente).
window.fit = () => {
  for (const el of document.querySelectorAll('.fit')) {
    const kids = [...el.children];
    const cabe = () => kids.every((c) => c.scrollWidth <= c.clientWidth + 1) &&
      kids.reduce((t, c) => t + c.offsetHeight + parseFloat(getComputedStyle(c).marginTop), 0) <= el.clientHeight + 1;
    for (let k = 0; k < 80 && !cabe(); k++)
      for (const c of kids) c.style.fontSize = (parseFloat(getComputedStyle(c).fontSize) * 0.96) + 'px';
  }
};
</script></body></html>`;
}

// ---------- diapositivas
function portada(quien, r) {
  const { html, zona: z } = personaje(quien + '_cartel', 0.66, 520, 1318);
  let s = plaza() + logo(LOGO_BLANCO, 40, 34, 200) + html;
  s += caja(z.x + z.w * 0.07, z.y + z.h * 0.12, z.w * 0.86, z.h * 0.76,
    `<b style="font-size:84px;color:${RED};line-height:1.05">PUBLICACIONES</b><b style="font-size:52px;color:${DARK};margin-top:8px">${esc(r.portada)}</b>`);
  s += etiquetaFecha(895, 330, 7, r.l1, r.l2);
  s += caja(700, 1268, 350, 50, `<b style="font-size:32px;color:#fff">Desliza →</b>`, 'align-items:flex-end;text-align:right');
  return pagina(s);
}

function contenido(p, i, n, pj, lado, carpeta, hoy) {
  const izq = lado === 'izq'; // personaje a la izquierda, bocadillo a la derecha
  let s = logo(LOGO_BLANCO, 40, 14, 122);
  s += caja(700, 50, 340, 50, `<b style="font-size:30px;color:#fff">${i} DE ${n}</b>`, 'align-items:flex-end;text-align:right');
  s += `<div style="position:absolute;left:60px;top:150px;width:960px;height:660px;border-radius:36px;background:#fff;border:7px solid ${DARK}"></div>`;
  const foto = p.foto && path.join(carpeta, p.foto);
  if (foto && fs.existsSync(foto)) {
    s += `<img src="${datauri(foto, 'image/jpeg')}" style="position:absolute;left:92px;top:182px;width:896px;height:330px;border-radius:22px;object-fit:cover;border:3px solid ${DARK}">`;
  } else {
    s += `<div style="position:absolute;left:92px;top:182px;width:896px;height:330px;border-radius:22px;background:#EFEFEF;border:3px dashed #BDBDBD"></div>`;
    s += caja(92, 182, 896, 330, `<b style="font-size:38px;color:#9A9A9A">FOTO NO ENCONTRADA</b><i style="font-size:28px;color:#9A9A9A">${esc(p.foto || '')}</i>`);
  }
  // etiqueta de tipo
  const tipo = TIPOS[p.tipo] ? p.tipo : 'oferta';
  s += `<div style="position:absolute;left:112px;top:202px;height:58px;padding:0 26px;border-radius:29px;background:${tipo === 'oferta' ? RED : DARK};border:4px solid #fff;color:#fff;font-weight:700;font-size:28px;line-height:50px;letter-spacing:1px">${TIPOS[tipo]}</div>`;
  if (p.descuento) {
    s += `<div style="position:absolute;left:812px;top:427px;width:176px;height:176px;border-radius:50%;background:${RED};border:9px solid #fff;transform:rotate(-9deg)"></div>`;
    s += caja(830, 445, 140, 140, `<b style="font-size:56px;color:#fff;white-space:nowrap">${esc(p.descuento)}</b>`, 'transform:rotate(-9deg)');
  }
  // precio: abajo a la derecha, debajo del círculo de descuento. El tachado (precio_antes) más pequeño encima.
  if (p.precio || p.precio_antes) {
    s += caja(748, 616, 240, 174,
      (p.precio_antes ? `<i style="font-size:36px;font-weight:700;color:#8A6F6F;text-decoration:line-through;text-decoration-thickness:4px;white-space:nowrap">${esc(p.precio_antes)}</i>` : '') +
      (p.precio ? `<b style="font-size:72px;color:${RED};line-height:1;white-space:nowrap">${esc(p.precio)}</b>` : ''),
      'align-items:flex-end;text-align:right;justify-content:flex-end');
  }
  const ancho = p.precio || p.precio_antes ? 640 : p.descuento ? 690 : 880;
  s += caja(92, 530, ancho, 128, `<b style="font-size:54px;color:${DARK}">${esc(p.titulo)}</b>`, 'justify-content:flex-end;align-items:flex-start;text-align:left');
  s += caja(92, 660, ancho, 44, `<b style="font-size:34px;color:${RED};white-space:nowrap">${esc(p.comercio)}</b>`, 'align-items:flex-start;text-align:left');
  let pill = p.texto_fecha;
  if (!pill && p.fin) pill = p.fin === hoy ? '¡Termina hoy!' : `Hasta el ${ddmm(p.fin)}`;
  if (pill) s += `<div style="position:absolute;left:92px;top:716px;height:64px;padding:0 34px;border-radius:32px;background:${PINK};color:${RED};font-weight:700;font-size:30px;line-height:64px">${esc(pill)}</div>`;
  // personaje + bocadillo: solo se espejan las poses de señalar
  const espejo = !izq && pj.endsWith('senalando');
  s += personaje(pj, 0.29, izq ? 215 : 865, 1325, espejo).html;
  const frases = FRASES[tipo];
  s += bocadillo(izq ? 400 : 60, 900, 620, 200, frases[(i - 1) % frases.length], izq ? 'izq' : 'der');
  const fx = izq ? 410 : 50;
  s += caja(fx, 1214, 620, 64, `<b style="font-size:46px;color:#fff;white-space:nowrap">escaparatetudela.es</b>`);
  s += caja(fx, 1276, 620, 44, `<i style="font-size:28px;color:#fff;white-space:nowrap">Todas las publicaciones de la ciudad</i>`);
  return pagina(s);
}

function cierre(quien) {
  const { html, zona: z } = personaje(quien + '_movil', 0.64, 540, 1322);
  let s = caja(40, 40, 1000, 96, `<b style="font-size:70px;color:#fff;white-space:nowrap">TODAS LAS PUBLICACIONES</b>`);
  s += caja(40, 136, 1000, 80, `<b style="font-size:56px;color:#fff;white-space:nowrap">DE TUDELA, EN TU MÓVIL</b>`);
  s += html;
  const lw = z.w * 0.8, lh = lw * (424 - 81) / (395 - 107);
  s += logo(LOGO_ROJO, z.x + (z.w - lw) / 2, z.y + 14, lh);
  for (const f of [0.70, 0.84]) s += `<div style="position:absolute;left:${z.x + z.w * 0.1}px;top:${z.y + z.h * f}px;width:${z.w * 0.8}px;height:${z.h * 0.11}px;border-radius:12px;background:${PINK}"></div>`;
  s += `<div style="position:absolute;left:40px;top:520px;width:270px;height:170px;border-radius:26px;background:#fff;border:7px solid ${DARK}"></div>`;
  s += caja(54, 534, 242, 142, `<b style="font-size:38px;color:${RED}">escaparate</b><b style="font-size:38px;color:${RED}">tudela.es</b><i style="font-size:24px;color:${DARK};margin-top:4px">enlace en la bio</i>`);
  s += `<div style="position:absolute;left:770px;top:760px;width:270px;height:190px;border-radius:26px;background:#25D366;border:7px solid ${DARK}"></div>`;
  s += caja(784, 774, 242, 162, `<b style="font-size:36px;color:#0B3D1E">Canal de</b><b style="font-size:40px;color:#0B3D1E">WhatsApp</b><i style="font-size:24px;color:#0B3D1E;margin-top:4px">también en la bio</i>`);
  return pagina(s);
}

function pieDeFoto(pubs, r, hoy) {
  const linea = (p) => {
    const icono = { oferta: '🏷️', novedad: '✨', evento: '📅' }[p.tipo] || '🏷️';
    let f = '';
    if (p.texto_fecha) f = ` (${p.texto_fecha})`;
    else if (p.fin) f = p.fin === hoy ? ' (¡termina hoy!)' : ` (hasta el ${ddmm(p.fin)})`;
    const pr = p.precio ? ` · ${p.precio_antes ? `antes ${p.precio_antes}, ahora ` : ''}${p.precio}` : '';
    return `${icono} ${p.descuento ? p.descuento + ' · ' : ''}${p.titulo}${pr} — ${p.comercio}${f}`;
  };
  return `ASUNTO: Carrusel Instagram · publicaciones ${r.asunto}

PIE DE FOTO:
📣 Las publicaciones ${r.pie} en Escaparate de Tudela (${r.paren || r.asunto}) 👇

${pubs.map(linea).join('\n')}

👉 Todas las ofertas, novedades y eventos de la ciudad en escaparatetudela.es (enlace en la bio).
📲 Únete también a nuestro canal de WhatsApp: el enlace está en la bio.

¡Compra en Tudela! ❤️

#Tudela #EscaparateDeTudela #ComercioLocal #ComercioDeProximidad #ComprarEnTudela #OfertasTudela #TudelaNavarra #Navarra #RiberaNavarra #CompraLocal
`;
}

// ---------- principal
async function main() {
  const carpeta = path.resolve(process.argv[2] || '.');
  const sinEstado = process.argv.includes('--sin-estado');
  const datos = JSON.parse(fs.readFileSync(path.join(carpeta, 'publicaciones.json'), 'utf8'));
  const hoy = datos.hoy || hoyMadrid();
  const r = rango(datos.desde || sumaDias(hoy, -3), datos.hasta || sumaDias(hoy, 3), hoy);
  // las que terminan antes primero; sin fecha de fin, al final
  const pubs = [...datos.publicaciones].sort((a, b) => (a.fin || '9999') .localeCompare(b.fin || '9999')).slice(0, MAX_PUB);
  if (datos.publicaciones.length > MAX_PUB) console.log(`Hay ${datos.publicaciones.length} publicaciones: uso las ${MAX_PUB} que terminan antes.`);

  const fEstado = path.join(BASE, 'estado.json');
  const estado = fs.existsSync(fEstado) ? JSON.parse(fs.readFileSync(fEstado, 'utf8')) : { portada: 'pedro', contenido: -1, lado: 'der' };
  const quienPortada = estado.portada === 'maria' ? 'pedro' : 'maria';
  const quienCierre = quienPortada === 'maria' ? 'pedro' : 'maria';
  const lado0 = estado.lado === 'izq' ? 'der' : 'izq';

  cache.bold = datauri(path.join(BASE, 'fuentes', 'Poppins-Bold.ttf'), 'font/ttf');
  cache.light = datauri(path.join(BASE, 'fuentes', 'Poppins-Light.ttf'), 'font/ttf');

  const htmls = [portada(quienPortada, r)];
  let idx = estado.contenido;
  const usados = [];
  pubs.forEach((p, k) => {
    idx = (idx + 1) % CICLO.length;
    const lado = k % 2 === 0 ? lado0 : (lado0 === 'izq' ? 'der' : 'izq');
    usados.push(`${CICLO[idx]} (${lado})`);
    htmls.push(contenido(p, k + 1, pubs.length, CICLO[idx], lado, carpeta, hoy));
  });
  htmls.push(cierre(quienCierre));

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const salidas = [];
  for (let k = 0; k < htmls.length; k++) {
    await page.setContent(htmls[k], { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; window.fit(); });
    const f = path.join(carpeta, String(k + 1).padStart(2, '0') + '.jpg');
    await page.screenshot({ path: f, type: 'jpeg', quality: 92 });
    salidas.push(path.basename(f));
  }
  await browser.close();

  fs.writeFileSync(path.join(carpeta, 'pie.txt'), pieDeFoto(pubs, r, hoy));
  if (!sinEstado) {
    fs.writeFileSync(fEstado, JSON.stringify({ portada: quienPortada, cierre: quienCierre, contenido: idx, ultimo_contenido: CICLO[idx], lado: lado0, fecha: hoy }, null, 2) + '\n');
  }
  console.log(`Portada: ${quienPortada}_cartel · Contenido: ${usados.join(', ')} · Cierre: ${quienCierre}_movil`);
  console.log('Generadas:', salidas.join(' '), '+ pie.txt');
}

main().catch((e) => { console.error(e); process.exit(1); });
