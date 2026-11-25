// Historias animadas de Instagram · Escaparate de Tudela
// Uso (desde la raíz del repo):
//   node historias/plantilla/generar.js [opciones]
//     --datos <fichero>      datos de entrada (por defecto historias/datos.json)
//     --salida <carpeta>     dónde dejar MP4 y PNG (por defecto historias/salida/<hoy>)
//     --entrada A|B          fuerza la entrada de la tanda normal (si no, alterna según historias/estado.json)
//     --solo hoy,normal,encuesta   genera solo esas tandas
//     --png                  solo capturas PNG de los momentos clave (para revisar antes de los vídeos)
//     --sin-sonido           MP4 sin audio (el sonido se configura en historias/sonido.json)
// No toca historias/estado.json: eso lo hace aprobar.js cuando se aprueban los vídeos.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..', '..');
const HIST = path.join(RAIZ, 'historias');
const W = 1080, H = 1920, FPS = 30;
const RED = '#C81E1E', DARK = '#2B1010', TINTA = '#1E1A1A', PLAZA = '#A81414', CREMA = '#FFF4E0', PINK = '#FDE3E3';
const PIEL = '#F6C9A0';
const MAX_TANDA = 4;
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const TIPOS = { oferta: 'OFERTA', novedad: 'NOVEDAD', evento: 'EVENTO' };
const FRASES_ENC = { uno: '¡A ver si aciertas!', precio: '¡Ese es el precio!', descuento: '¡Menudo descuento!', mas_vista: '¡Esta es la más vista!' };
const FRASES = { oferta: '¡Mira esta oferta!', novedad: '¡Mira esta novedad!', evento: '¡No te pierdas este evento!', hoy: '¡Solo hasta hoy!' };

// ---------- argumentos
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const soloPng = args.includes('--png');
const sinSonido = args.includes('--sin-sonido');
const { execFileSync } = require('child_process');

// ---------- recursos
const datauri = (f, mime) => `data:${mime};base64,` + fs.readFileSync(f).toString('base64');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PJ_DIR = path.join(RAIZ, 'carrusel', 'personajes');
const PEDRO_DIR = path.join(HIST, 'personajes', 'pedro');
const BB = {
  maria_senalando: [438, 132, 1411, 1806], maria_sonriendo: [438, 131, 1062, 1806],
  pedro_senalando: [494, 173, 1347, 1806], pedro_sonriendo: [494, 173, 1006, 1806],
};
const LOGO_ROJO = { file: path.join(RAIZ, 'logo_rojo.png'), bb: [107, 81, 395, 424] };

function recursos() {
  const pedro = JSON.parse(fs.readFileSync(path.join(PEDRO_DIR, 'piezas.json'), 'utf8'));
  const img = {};
  for (const n of Object.keys(BB)) img[n] = datauri(path.join(PJ_DIR, n + '.png'), 'image/png');
  for (const n of pedro.orden) img['pedro_' + n] = datauri(path.join(PEDRO_DIR, n + '.png'), 'image/png');
  img.logo = datauri(LOGO_ROJO.file, 'image/png');
  return { pedro, img, bb: BB };
}

// ---------- fechas (Europe/Madrid)
function hoyMadrid() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date()); }
function fecha(s) { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); }
function fechaLarga(s) { const d = fecha(s); return { dia: DIAS[d.getUTCDay()], resto: `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]}` }; }
function ddmm(s) { const d = fecha(s); return String(d.getUTCDate()).padStart(2, '0') + '/' + String(d.getUTCMonth() + 1).padStart(2, '0'); }

// ---------- piezas HTML
const caja = (x, y, w, h, html, css = '') =>
  `<div class="fit" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${css}">${html}</div>`;

function logo(x, y, h) {
  const [x0, y0, x1, y1] = LOGO_ROJO.bb, k = h / (y1 - y0);
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${(x1 - x0) * k}px;height:${h}px;overflow:hidden">
    <img src="${A.img.logo}" style="position:absolute;left:${-x0 * k}px;top:${-y0 * k}px;width:${500 * k}px;height:${500 * k}px"></div>`;
}

function fotoPrueba(w, h) {
  return `<div style="position:absolute;left:32px;top:32px;width:${w}px;height:${h}px;border-radius:22px;border:3px solid ${DARK};
    background:repeating-linear-gradient(-60deg,#D88AA6 0 40px,#E7A3BC 40px 80px)"></div>`
    + caja(32, 32, w, h, `<b style="font-size:64px;color:${DARK}">FOTO DE PRUEBA</b>`);
}

// Tarjeta de publicación (960x740), estilo de la del carrusel.
function tarjeta(p, hoy, carpetaDatos) {
  const Wt = 960, Ht = 740, FW = 896, FH = 420;
  let s = `<div style="position:absolute;inset:0;border-radius:36px;background:#fff;border:7px solid ${DARK}"></div>`;
  const foto = p.foto && path.resolve(carpetaDatos, p.foto);
  if (foto && fs.existsSync(foto)) {
    const mime = /\.png$/i.test(foto) ? 'image/png' : 'image/jpeg';
    s += `<img src="${datauri(foto, mime)}" style="position:absolute;left:32px;top:32px;width:${FW}px;height:${FH}px;border-radius:22px;object-fit:${p.encaje || 'cover'};background:#fff;border:3px solid ${DARK}">`;
  } else if (p.prueba) s += fotoPrueba(FW, FH);
  else if (p.foto) throw new Error(`No encuentro la foto ${p.foto}`);
  const tipo = TIPOS[p.tipo] ? p.tipo : null;
  if (tipo) s += `<div style="position:absolute;left:52px;top:52px;height:58px;padding:0 26px;border-radius:29px;background:${tipo === 'oferta' ? RED : DARK};border:4px solid #fff;color:#fff;font-weight:700;font-size:28px;line-height:50px;letter-spacing:1px">${TIPOS[tipo]}</div>`;
  if (p.descuento) {
    s += `<div style="position:absolute;left:758px;top:282px;width:150px;height:150px;border-radius:50%;background:${RED};border:7px solid #fff;transform:rotate(-9deg)"></div>`;
    s += caja(771, 295, 124, 124, `<b style="font-size:48px;color:#fff;white-space:nowrap">${esc(p.descuento)}</b>`, 'transform:rotate(-9deg)');
  }
  const conPrecio = p.precio || p.precio_antes;
  if (conPrecio) {
    s += caja(688, 572, 240, 136,
      (p.precio_antes ? `<i style="font-size:36px;font-weight:700;color:#8A6F6F;text-decoration:line-through;text-decoration-thickness:4px;white-space:nowrap">${esc(p.precio_antes)}</i>` : '') +
      (p.precio ? `<b style="font-size:72px;color:${RED};line-height:1;white-space:nowrap">${esc(p.precio)}</b>` : ''),
      'align-items:flex-end;text-align:right;justify-content:flex-end');
  }
  const ancho = conPrecio ? 640 : 880;
  if (p.titulo) s += caja(32, 460, conPrecio ? 880 : 880, 104, `<b style="font-size:54px;color:${DARK}">${esc(p.titulo)}</b>`, 'justify-content:flex-end;align-items:flex-start;text-align:left');
  if (p.comercio) s += caja(32, 566, ancho, 46, `<b style="font-size:34px;color:${RED};white-space:nowrap">${esc(p.comercio)}</b>`, 'align-items:flex-start;text-align:left');
  let pill = p.texto_fecha;
  if (!pill && p.fin) pill = p.fin === hoy ? '¡Termina hoy!' : `Hasta el ${ddmm(p.fin)}`;
  if (!pill && p.termina_hoy) pill = '¡Termina hoy!';
  if (pill) s += `<div style="position:absolute;left:32px;top:628px;height:64px;padding:0 34px;border-radius:32px;background:${PINK};color:${RED};font-weight:700;font-size:30px;line-height:64px;white-space:nowrap">${esc(pill)}</div>`;
  if (p._hoy) s += `<div style="position:absolute;left:540px;top:-34px;width:420px;height:84px;border-radius:18px;background:${RED};border:6px solid #fff;box-shadow:0 0 0 6px ${DARK};transform:rotate(6deg)"></div>`
    + caja(552, -26, 396, 68, `<b style="font-size:42px;color:#fff;white-space:nowrap;letter-spacing:1px">SOLO HASTA HOY</b>`, 'transform:rotate(6deg)');
  if (p.prueba) s += `<div style="position:absolute;left:0;top:240px;width:${Wt}px;text-align:center;transform:rotate(-14deg);font-weight:700;font-size:230px;line-height:1;color:rgba(200,30,30,.88);-webkit-text-stroke:8px #fff;paint-order:stroke fill;letter-spacing:6px">PRUEBA</div>`;
  return `<div style="position:absolute;left:0;top:0;width:${Wt}px;height:${Ht}px">${s}</div>`;
}

function cartel(l1, l2, f) {
  return `<div style="position:absolute;inset:0;border-radius:36px;background:#fff;border:7px solid ${DARK}"></div>`
    + logo(480 - 85, 70, 200)
    + caja(40, 300, 880, 130, `<b style="font-size:110px;color:${RED};white-space:nowrap">${esc(l1)}</b>`)
    + caja(40, 420, 880, 130, `<b style="font-size:110px;color:${RED};white-space:nowrap">${esc(l2)}</b>`)
    + `<div style="position:absolute;left:180px;top:590px;width:600px;height:84px;border-radius:42px;background:${PINK}"></div>`
    + caja(190, 590, 580, 84, `<b style="font-size:40px;color:${DARK};white-space:nowrap">${esc(f.dia[0].toUpperCase() + f.dia.slice(1))}, ${esc(f.resto)}</b>`);
}

// ---------- fachada (mundo, 1080x1920)
function nube(x, y, k) {
  const c = [[0, 0, 60], [55, -25, 70], [120, 0, 55], [60, 15, 60]];
  return `<g transform="translate(${x} ${y}) scale(${k})">` +
    c.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${TINTA}" stroke-width="10"/>`).join('') +
    c.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r - 5}" fill="#fff"/>`).join('') + '</g>';
}

function fachada() {
  const T = TINTA, sw = 10;
  let s = `<svg id="cielo" class="cap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#9ED8F2"/>
  <circle cx="900" cy="200" r="88" fill="#FFC93C" stroke="${T}" stroke-width="${sw}"/>
  ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r = a * Math.PI / 180; return `<line x1="${900 + Math.cos(r) * 112}" y1="${200 + Math.sin(r) * 112}" x2="${900 + Math.cos(r) * 150}" y2="${200 + Math.sin(r) * 150}" stroke="${T}" stroke-width="12" stroke-linecap="round"/>`; }).join('')}
  ${nube(130, 190, 1)}${nube(470, 110, 0.8)}${nube(600, 330, 0.65)}
  </svg>`;
  // edificio
  s += `<svg class="cap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect x="-20" y="1600" width="${W + 40}" height="400" fill="#D9D3CA" stroke="${T}" stroke-width="${sw}"/>
  ${[180, 420, 660, 900].map((x) => `<line x1="${x}" y1="1600" x2="${x - 40}" y2="1860" stroke="#B9B2A7" stroke-width="6"/>`).join('')}
  <rect x="-20" y="1860" width="${W + 40}" height="80" fill="#B9B2A7" stroke="${T}" stroke-width="${sw}"/>
  <rect x="20" y="440" width="1040" height="1165" fill="#F3E2C0" stroke="${T}" stroke-width="${sw}"/>
  <rect x="5" y="420" width="1070" height="44" rx="8" fill="#E3C99A" stroke="${T}" stroke-width="${sw}"/>
  <!-- rótulo -->
  <rect x="110" y="490" width="860" height="200" rx="30" fill="#fff" stroke="${T}" stroke-width="${sw}"/>
  <!-- puerta -->
  <rect x="80" y="870" width="310" height="735" fill="#E3C99A" stroke="${T}" stroke-width="${sw}"/>
  <rect x="105" y="895" width="260" height="710" rx="10" fill="${PLAZA}" stroke="${T}" stroke-width="${sw}"/>
  <rect x="135" y="930" width="200" height="330" rx="14" fill="#BFE6F7" stroke="${T}" stroke-width="8"/>
  <line x1="165" y1="1000" x2="230" y2="950" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
  <line x1="165" y1="1060" x2="290" y2="965" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>
  <rect x="135" y="1300" width="200" height="260" rx="14" fill="${RED}" stroke="${T}" stroke-width="8"/>
  <rect x="318" y="1240" width="24" height="90" rx="12" fill="#FFC93C" stroke="${T}" stroke-width="7"/>
  <!-- escaparate -->
  <rect x="416" y="836" width="648" height="518" rx="14" fill="#fff" stroke="${T}" stroke-width="${sw}"/>
  <rect x="440" y="860" width="600" height="470" fill="${RED}" stroke="${T}" stroke-width="8"/>
  ${[[440, 1170, 90, 160], [530, 1110, 80, 220], [610, 1190, 70, 140], [840, 1150, 80, 180], [920, 1100, 70, 230], [990, 1180, 50, 150]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${PLAZA}"/>` + [0, 1].map((i) => [0, 1, 2].map((j) => `<rect x="${x + 14 + i * (w - 40)}" y="${y + 20 + j * 46}" width="12" height="24" rx="6" fill="${RED}"/>`).join('')).join('')).join('')}
  <rect x="440" y="860" width="600" height="470" fill="none" stroke="${T}" stroke-width="8"/>
  <rect x="400" y="1340" width="680" height="30" rx="8" fill="#fff" stroke="${T}" stroke-width="${sw}"/>
  <rect x="416" y="1370" width="648" height="235" fill="${PLAZA}" stroke="${T}" stroke-width="${sw}"/>
  <rect x="450" y="1400" width="270" height="170" rx="12" fill="none" stroke="#8E1010" stroke-width="8"/>
  <rect x="760" y="1400" width="270" height="170" rx="12" fill="none" stroke="#8E1010" stroke-width="8"/>
  </svg>`;
  return s;
}

function toldo() {
  const T = TINTA;
  const x0 = 30, x1 = 1050, y0 = 712, y1 = 812, n = 12, w = (x1 - x0) / n;
  let franjas = '', ondas = `M${x0} ${y1}`;
  for (let i = 0; i < n; i++) {
    franjas += `<rect x="${x0 + i * w}" y="${y0}" width="${w}" height="${y1 - y0}" fill="${i % 2 ? CREMA : RED}"/>`;
    ondas += ` Q${x0 + i * w + w / 2} ${y1 + 70} ${x0 + (i + 1) * w} ${y1}`;
  }
  let gotas = '';
  for (let i = 0; i < n; i++) gotas += `<path d="M${x0 + i * w} ${y1} Q${x0 + i * w + w / 2} ${y1 + 70} ${x0 + (i + 1) * w} ${y1} Z" fill="${i % 2 ? CREMA : RED}" stroke="${T}" stroke-width="8" stroke-linejoin="round"/>`;
  return `<svg class="cap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <rect x="${x0 - 10}" y="${y0 - 16}" width="${x1 - x0 + 20}" height="26" rx="10" fill="#8E1010" stroke="${T}" stroke-width="9"/>
    ${franjas}<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="none" stroke="${T}" stroke-width="9"/>${gotas}</svg>`;
}

function rotulo() {
  return logo(150, 508, 164)
    + caja(318, 506, 620, 92, `<b style="font-size:84px;color:${RED};white-space:nowrap">Escaparate</b>`, 'align-items:flex-start;text-align:left')
    + caja(318, 592, 620, 80, `<b style="font-size:66px;color:${DARK};white-space:nowrap">de Tudela</b>`, 'align-items:flex-start;text-align:left');
}

function persiana() {
  return `<div id="persiana" style="position:absolute;left:420px;top:844px;width:640px;height:10px;display:none;overflow:hidden;border:8px solid ${TINTA};border-top:none;border-radius:0 0 10px 10px">
    <div id="lamas" style="position:absolute;inset:0;background:repeating-linear-gradient(180deg,#C5CAD0 0 22px,#9AA0A7 22px 27px,#C5CAD0 27px 30px)"></div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:34px;background:#7E848B;border-top:7px solid ${TINTA}"></div>
    <div style="position:absolute;left:270px;bottom:6px;width:100px;height:18px;border-radius:9px;background:#4E5358;border:5px solid ${TINTA}"></div>
  </div>`;
}

function mano() {
  const T = TINTA;
  const dedo = (y) => `<rect x="-58" y="${y - 15}" width="110" height="30" rx="15" fill="${PIEL}" stroke="${T}" stroke-width="7"/>`;
  return `<svg id="mano" style="position:absolute;left:0;top:0;width:10px;height:10px;overflow:visible;display:none;transform-origin:0 0">
    <rect x="150" y="-66" width="1500" height="132" fill="${RED}" stroke="${T}" stroke-width="8"/>
    <rect x="128" y="-76" width="48" height="152" rx="16" fill="${CREMA}" stroke="${T}" stroke-width="8"/>
    <path d="M140 -62 C90 -78 40 -70 18 -50 L18 50 C40 70 90 78 140 62 Z" fill="${PIEL}" stroke="${T}" stroke-width="8" stroke-linejoin="round"/>
    <path d="M70 -56 C52 -96 22 -112 4 -100 C-10 -90 0 -66 30 -46" fill="${PIEL}" stroke="${T}" stroke-width="8" stroke-linejoin="round"/>
    <g id="dedos">${[-45, -15, 15, 45].map(dedo).join('')}</g>
  </svg>`;
}

function bocadillo() {
  // al lado de la cara del personaje, con la cola hacia la izquierda
  const x = 470, y = 1105, w = 570, h = 150;
  const p = `M${x + 30} ${y} H${x + w - 30} Q${x + w} ${y} ${x + w} ${y + 30} V${y + h - 30} Q${x + w} ${y + h} ${x + w - 30} ${y + h} H${x + 30} Q${x} ${y + h} ${x} ${y + h - 30} V${y + 112} L${x - 75} ${y + 100} L${x} ${y + 52} V${y + 30} Q${x} ${y} ${x + 30} ${y} Z`;
  return `<div id="boca" style="position:absolute;inset:0;opacity:0"><svg class="cap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><path d="${p}" fill="#fff" stroke="${DARK}" stroke-width="7" stroke-linejoin="round"/></svg>
    <div class="fit" style="left:${x + 24}px;top:${y + 14}px;width:${w - 48}px;height:${h - 28}px"><b id="bocaTxt" style="font-size:52px;line-height:1.1;color:${DARK}"></b></div></div>`;
}

function pjSuelto(n, id, cx, pies, s, extra = '') {
  const [x0, , x1, y1] = BB[n], c = (x0 + x1) / 2;
  return `<img id="${id}" src="${A.img[n]}" class="pj" style="width:1500px;height:1875px;transform-origin:0 0;transform:translate(${cx - c * s}px,${pies - y1 * s}px) scale(${s});${extra}">`;
}

// Personaje grande a medio cuerpo abajo a la izquierda (tras el zoom): la cabeza casi toca el escaparate.
const MEDIO = { s: 0.62, cabeza: 1048, cuerpoX: 225 };
function pjMedio(pj, sinBrazo = false) {   // sinBrazo: en la encuesta el brazo invadiría el hueco del sticker
  const n = pj === 'pedro' || sinBrazo ? pj + '_sonriendo' : 'maria_senalando', [x0, y0, x1] = BB[n], k = MEDIO.s; // el brazo de Pedro señalando taparía el bocadillo
  const cx = MEDIO.cuerpoX + ((x0 + x1) / 2 - 750) * k;      // 750 = centro del cuerpo en el PNG
  return pjSuelto(n, 'pjPeqImg', cx, MEDIO.cabeza + (BB[n][3] - y0) * k, k);
}

function pagina(cuerpo, h) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Poppins;font-weight:700;src:url(${FUENTES.bold})}
@font-face{font-family:Poppins;font-weight:300;src:url(${FUENTES.light})}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{background:#9ED8F2;font-family:Poppins;position:relative}
.cap{position:absolute;left:0;top:0;overflow:visible}
.pj{position:absolute;left:0;top:0}
#mundo,#vitrina{position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0}
.fit{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden;line-height:1.1}
b,i{display:block;max-width:100%} b{font-weight:700} i{font-style:normal;font-weight:300}
</style></head><body>${cuerpo}
<script>window.H=${JSON.stringify(h)};window.A=${JSON.stringify({ pedro: A.pedro, img: A.img, bb: A.bb })};</script>
<script>${ESCENA}</script>
<script>
window.fit = () => {
  for (const el of document.querySelectorAll('.fit')) {
    const kids = [...el.children];
    for (const c of kids) { if (!c.dataset.fs) c.dataset.fs = getComputedStyle(c).fontSize; c.style.fontSize = c.dataset.fs; }
    const cabe = () => kids.every((c) => c.scrollWidth <= c.clientWidth + 1) &&
      kids.reduce((t, c) => t + c.offsetHeight, 0) <= el.clientHeight + 1;
    for (let k = 0; k < 80 && !cabe(); k++)
      for (const c of kids) c.style.fontSize = (parseFloat(getComputedStyle(c).fontSize) * 0.96) + 'px';
  }
};
</script></body></html>`;
}

// Vitrina: capa en coordenadas de pantalla con la cámara en el escaparate, metida en el mundo.
const S = 1.75, ZX = 15, ZY = 205, VX = 440, VY = 860;
const VITRINA = `transform:translate(${VX - ZX / S}px,${VY - ZY / S}px) scale(${1 / S})`;

// ---------- encuesta: tres modelos
// precio: se ve el producto, se tapan precio y descuento. descuento: se ve el precio de antes, se tapan descuento y precio.
// mas_vista: dos tarjetas A y B; en la 2 se va la que no ganó y la ganadora crece con el sello "LA MÁS VISTA".
const ENC = { k: 0.8, x: 156, y: 445 };
function tapa(id, x, y, w, h, redonda) {
  return `<div id="${id}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform-origin:50% 50%">
    <div style="position:absolute;inset:0;border-radius:${redonda ? '50%' : '26px'};background:#FFC93C;border:7px solid ${DARK};transform:rotate(-6deg)"></div>
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.min(w, h) * 0.75}px;line-height:1;color:${RED};-webkit-text-stroke:5px #fff;paint-order:stroke fill;transform:rotate(-6deg)">?</div></div>`;
}
function encuestaVitrina(h, d) {
  const p = h.pub;
  if (h.tipoEnc !== 'mas_vista') {
    const tapas = [];
    if (p.descuento) tapas.push([744, 268, 178, 178, true]);
    if (h.tipoEnc === 'precio' && (p.precio || p.precio_antes)) tapas.push([672, 560, 270, 156, false]);
    if (h.tipoEnc === 'descuento' && p.precio) tapas.push([684, 646, 258, 76, false]);
    h.tapas = tapas.map(([x, y, w]) => ({ x: ENC.x + (x + w - 24) * ENC.k, y: ENC.y + (y + 26) * ENC.k }));
    h.k = ENC.k;
    return `<div id="encC" style="position:absolute;left:0;top:0;width:960px;height:740px;transform-origin:0 0;transform:translate(${ENC.x}px,${ENC.y}px) scale(${ENC.k})">${tarjeta(p, d.hoy, d.carpeta)}${tapas.map((t, i) => tapa('tapa' + i, ...t)).join('')}</div>`;
  }
  // más vista
  const k = 0.5, pos = [[48, 490], [552, 490]];
  h.cartas = pos.map(([x, y]) => ({ x, y, k }));
  h.grande = ENC;
  return h.pubs.map((q, i) => `<div id="enc${'AB'[i]}" style="position:absolute;left:0;top:0;width:960px;height:740px;transform-origin:0 0;transform:translate(${pos[i][0]}px,${pos[i][1]}px) scale(${k})">
      ${tarjeta(q, d.hoy, d.carpeta)}
      <div style="position:absolute;left:-30px;top:-60px;width:150px;height:150px;border-radius:50%;background:${RED};border:9px solid #fff;box-shadow:0 0 0 8px ${DARK};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:96px;line-height:1">${'AB'[i]}</div>
      ${i === h.ganadora ? `<div id="sello" style="position:absolute;left:470px;top:-40px;width:470px;height:96px;opacity:0;transform-origin:50% 50%">
        <div style="position:absolute;inset:0;border-radius:20px;background:${RED};border:7px solid #fff;box-shadow:0 0 0 7px ${DARK};transform:rotate(6deg)"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:50px;white-space:nowrap;transform:rotate(6deg)">LA MÁS VISTA</div></div>` : ''}
    </div>`).join('');
}

function escena(h, d) {
  const enc = h.modo.startsWith('encuesta');
  let mundo = fachada() + rotulo();
  let vit = '';
  if (!enc) {
    if (h.cartel) vit += `<div id="cartel" style="position:absolute;left:60px;top:250px;width:960px;height:740px;transform-origin:50% 50%">${cartel(h.cartel[0], h.cartel[1], d.fechaHoy)}</div>`;
    vit += `<div id="tarjeta" style="position:absolute;left:60px;top:250px;width:960px;height:740px;transform-origin:50% 50%">${tarjeta(h.pub, d.hoy, d.carpeta)}</div>`;
  } else vit += encuestaVitrina(h, d);
  mundo += `<div id="vitrina" style="${VITRINA}">${vit}</div>`;
  mundo += persiana() + toldo();
  if (h.entrada === 'A') mundo += pjSuelto('maria_sonriendo', 'mariaG1', 0, 0, 1) + pjSuelto('maria_senalando', 'mariaG2', 0, 0, 1, 'display:none');
  if (h.entrada === 'B' || h.entrada === 'hoy') mundo += PEDRO_HTML('pedroG');
  let s = `<div id="mundo">${mundo}</div>`;
  if (!enc) {
    s += `<div id="pjPeq" style="position:absolute;inset:0;transform-origin:0 0">${pjMedio(h.pj)}</div>`;
    s += bocadillo();
    if (h.ultima) s += `<div id="todas" style="position:absolute;inset:0;opacity:0">${caja(610, 1282, 440, 84, `<b style="font-size:56px;color:#fff;white-space:nowrap">Todas en tu móvil</b>`)}</div>`;
  } else {
    s += `<div id="pjPeq" style="position:absolute;inset:0;transform-origin:0 0">${pjMedio('maria', true)}</div>`;
    s += bocadillo();
    s += `<div id="preg" style="position:absolute;inset:0;transform-origin:0 0">
      <div style="position:absolute;left:40px;top:250px;width:1000px;height:170px;border-radius:32px;background:#fff;border:7px solid ${DARK}"></div>
      <div id="pregTxt" class="fit" style="left:70px;top:260px;width:940px;height:150px"><b style="font-size:60px;color:${DARK}">${esc(h.pregunta)}</b></div>
      <div id="respTxt" class="fit" style="left:70px;top:260px;width:940px;height:150px;display:none"><i style="font-size:40px;font-weight:700;color:${DARK}">Respuesta</i><b style="font-size:84px;color:${RED};white-space:nowrap">${esc(h.respuesta || '')}</b></div>
    </div>`;
  }
  s += mano();
  return pagina(s, h);
}

// ---------- datos → historias
function construir(datos, carpeta, entradaForzada, solo) {
  const hoy = datos.hoy || hoyMadrid();
  const avisos = [];
  const todas = (datos.publicaciones || []).filter((p) => {
    if (p.fin && p.fin < hoy) { avisos.push(`CADUCADA (fin ${p.fin}), no se incluye: ${p.titulo} — ${p.comercio}`); return false; }
    return true;
  });
  const terminaHoy = (p) => p.termina_hoy === true || p.fin === hoy;
  const tHoy = todas.filter(terminaHoy).map((p) => ({ ...p, _hoy: true }));
  const tNormal = todas.filter((p) => !terminaHoy(p));
  for (const [n, t] of [['Terminan hoy', tHoy], ['normal', tNormal]])
    if (t.length > MAX_TANDA) throw new Error(`La tanda ${n} tiene ${t.length} publicaciones (máximo ${MAX_TANDA}). Hay que elegir cuáles.`);

  const estadoF = path.join(HIST, 'estado.json');
  const estado = fs.existsSync(estadoF) ? JSON.parse(fs.readFileSync(estadoF, 'utf8')) : {};
  let entrada = entradaForzada || datos.entrada;
  if (!entrada || entrada === 'auto') entrada = estado.ultima_entrada === 'A' ? 'B' : 'A';

  const fl = fechaLarga(hoy);
  const hist = [];
  const tanda = (pubs, modo, pj, ent, cartelTxt) => pubs.forEach((p, i) => {
    const frase = (p2) => (p2._hoy ? FRASES.hoy : FRASES[p2.tipo] || FRASES.oferta);
    hist.push({
      modo, pj, pub: p, entrada: i === 0 ? ent : null, cartel: i === 0 ? cartelTxt : null,
      frase: frase(p), frasePrev: i > 0 ? frase(pubs[i - 1]) : null,
      retirar: i < pubs.length - 1, ultima: i === pubs.length - 1, tanda: modo === 'hoy' ? 'Terminan hoy' : 'normal', n: i + 1, de: pubs.length,
    });
  });
  const quiere = (k) => !solo || solo.includes(k);
  if (quiere('hoy') && tHoy.length) tanda(tHoy, 'hoy', 'pedro', 'hoy', ['TERMINAN', 'HOY']);
  if (quiere('normal') && tNormal.length) tanda(tNormal, 'normal', entrada === 'A' ? 'maria' : 'pedro', entrada, ['HOY EN EL', 'ESCAPARATE']);
  if (quiere('encuesta') && datos.encuesta) {
    const e = datos.encuesta, tipo = e.tipo || 'precio';
    if (!['precio', 'descuento', 'mas_vista'].includes(tipo)) throw new Error(`Tipo de encuesta desconocido: ${tipo}`);
    for (const k of ['pregunta', 'respuesta']) if (!e[k]) throw new Error(`Falta "${k}" en la encuesta`);
    const base = { tipoEnc: tipo, pregunta: e.pregunta, tanda: 'encuesta', de: 2 };
    if (tipo === 'mas_vista') {
      if (!e.publicaciones || e.publicaciones.length !== 2) throw new Error('La encuesta "mas_vista" necesita 2 publicaciones (A y B)');
      base.pubs = e.publicaciones; base.ganadora = 'AB'.indexOf(String(e.ganadora || '').toUpperCase());
      if (base.ganadora < 0) throw new Error('Falta "ganadora": "A" o "B"');
    } else {
      if (!e.publicacion) throw new Error('Falta "publicacion" en la encuesta');
      base.pub = e.publicacion;
      if (tipo === 'precio' && !e.publicacion.precio) throw new Error('La encuesta de precio necesita "precio"');
      if (tipo === 'descuento' && !e.publicacion.descuento) throw new Error('La encuesta de descuento necesita "descuento"');
      const num = String(e.respuesta).replace(/[^0-9]/g, '');
      if (num && String(e.publicacion.titulo || '').includes(num)) avisos.push(`El título "${e.publicacion.titulo}" deja ver la respuesta (${e.respuesta}).`);
    }
    const b1 = e.bocadillo1 || FRASES_ENC.uno, b2 = e.bocadillo2 || FRASES_ENC[tipo];
    hist.push({ ...base, modo: 'encuesta1', n: 1, frase: b1, frasePrev: null });
    hist.push({ ...base, modo: 'encuesta2', n: 2, respuesta: e.respuesta, frase: b2, frasePrev: b1 });
  }
  return { hist, avisos, entrada, usaNormal: quiere('normal') && tNormal.length > 0, d: { hoy, fechaHoy: fl, carpeta } };
}

// ---------- render
let A, FUENTES, ESCENA, PEDRO_HTML;

function ffmpeg(salida) {
  const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', salida], { stdio: ['pipe', 'inherit', 'inherit'] });
  const fin = new Promise((ok, ko) => p.on('close', (c) => (c === 0 ? ok() : ko(new Error('ffmpeg ' + c)))));
  return { p, fin };
}

// momentos clave para las capturas de revisión
function momentos(h, P) {
  const m = [];
  const media = (r) => (r[0] + r[1]) / 2;
  if (h.entrada === 'A') { m.push(['fachada', 0]); m.push(['entradaA_senala', P.senala + 0.8]); m.push(['entradaA_zoom', media(P.zoom)]); }
  if (h.entrada === 'B') { m.push(['entradaB_mitad_de_paso', P.anda[0] + (P.anda[1] - P.anda[0]) / 4]); m.push(['entradaB_parado', P.anda[1] + 0.35]); m.push(['entradaB_zoom', media(P.zoom)]); }
  if (h.entrada === 'hoy') { m.push(['hoy_persiana_bajando', 0.7]); m.push(['hoy_pedro_frena_persiana', P.coge + 0.2]); m.push(['hoy_levanta_persiana', P.empuja[1]]); }
  if (h.cartel) { m.push(['cartel', P.cartel[0] + 0.7]); m.push(['mano_quita_cartel', P.quita0[0] + 0.45]); }
  if (P.pon) { m.push(['mano_pone_tarjeta', P.pon[0] + 0.3]); m.push(['tarjeta', P.quieta[0] + 1]); }
  if (P.quita) m.push(['mano_quita_tarjeta', P.quita[0] + 0.5]);
  if (h.modo === 'encuesta1') m.push(['encuesta_1', 5.9]);
  if (h.modo === 'encuesta2') { m.push(['encuesta_2_mano', 0.55]); m.push(['encuesta_2', 5.9]); }
  return m;
}

async function main() {
  const datosF = path.resolve(opt('--datos') || path.join(HIST, 'datos.json'));
  const datos = JSON.parse(fs.readFileSync(datosF, 'utf8'));
  const solo = opt('--solo') ? opt('--solo').split(',') : null;
  const { hist, avisos, entrada, usaNormal, d } = construir(datos, path.dirname(datosF), opt('--entrada'), solo);
  avisos.forEach((a) => console.log('AVISO:', a));
  if (!hist.length) throw new Error('No hay historias que generar.');
  const salida = path.resolve(opt('--salida') || path.join(HIST, 'salida', d.hoy));
  fs.mkdirSync(salida, { recursive: true });

  A = recursos();
  FUENTES = { bold: datauri(path.join(RAIZ, 'carrusel', 'fuentes', 'Poppins-Bold.ttf'), 'font/ttf'), light: datauri(path.join(RAIZ, 'carrusel', 'fuentes', 'Poppins-Light.ttf'), 'font/ttf') };
  ESCENA = fs.readFileSync(path.join(__dirname, 'escena.js'), 'utf8');
  PEDRO_HTML = (id) => {
    let s = `<div id="${id}" class="pj" style="width:1500px;height:1875px;transform-origin:0 0">`;
    for (const n of A.pedro.orden) {
      const p = A.pedro.piezas[n], o = p.pivote ? `${p.pivote[0] - p.x}px ${p.pivote[1] - p.y}px` : '0 0';
      s += `<img data-p="${n}" src="${A.img['pedro_' + n]}" style="position:absolute;left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px;transform-origin:${o}">`;
    }
    return s + '</div>';
  };

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const resumen = [];
  let ultimoBuf = null, offsetMusica = 0;
  const SONIDO = JSON.parse(fs.readFileSync(path.join(HIST, 'sonido.json'), 'utf8'));
  for (let k = 0; k < hist.length; k++) {
    const h = hist[k];
    const num = String(k + 1).padStart(2, '0');
    const nombre = `${num}_${h.tanda === 'Terminan hoy' ? 'terminan_hoy' : h.tanda}_${h.n}`;
    await page.setContent(escena(h, d), { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; window.fit(); });
    const dur = await page.evaluate(() => window.DURACION);
    const P = await page.evaluate(() => window.PLAN);
    const frames = Math.round(dur * FPS);
    resumen.push(`${nombre}.mp4  ${dur.toFixed(2)} s  ${h.tanda} ${h.n}/${h.de}${h.entrada ? ' · entrada ' + h.entrada : ''}${h.tipoEnc ? ' · ' + h.tipoEnc : ''}${h.pub ? ' · ' + (h.pub.titulo || '') : ''}`);
    if (soloPng) {
      for (const [m, t] of momentos(h, P)) {
        await page.evaluate((tt) => window.pintar(tt), Math.min(t, dur - 1 / FPS));
        await page.screenshot({ path: path.join(salida, `${num}_${m}.png`) });
      }
      continue;
    }
    const sigue = (h.modo === 'encuesta2') || (!h.entrada && !h.modo.startsWith('encuesta'));
    if (!sigue) offsetMusica = 0;       // la música sigue sonando de una historia a la siguiente dentro de la tanda
    const final = path.join(salida, nombre + '.mp4'), soloVideo = path.join(salida, '.' + nombre + '_video.mp4');
    const { p, fin } = ffmpeg(sinSonido ? final : soloVideo);
    for (let f = 0; f < frames; f++) {
      await page.evaluate((tt) => window.pintar(tt), f / FPS);
      let buf = await page.screenshot({ type: 'png' });
      // empalme exacto: la historia que sigue a otra arranca con el último fotograma de la anterior
      if (f === 0 && sigue && ultimoBuf) buf = ultimoBuf;
      if (f === 0) fs.writeFileSync(path.join(salida, `.${nombre}_primero.png`), buf);
      if (f === frames - 1) ultimoBuf = buf;
      if (f === frames - 1) fs.writeFileSync(path.join(salida, `.${nombre}_ultimo.png`), buf);
      if (!p.stdin.write(buf)) await new Promise((r) => p.stdin.once('drain', r));
    }
    p.stdin.end();
    await fin;
    if (!sinSonido) {
      const eventos = await page.evaluate(() => window.SONIDOS);
      const cfgF = path.join(salida, '.' + nombre + '_audio.json'), wav = path.join(salida, '.' + nombre + '.wav');
      fs.writeFileSync(cfgF, JSON.stringify({ dur: frames / FPS, offset: offsetMusica, eventos, ajustes: SONIDO }));
      execFileSync('python3', [path.join(HIST, 'herramientas', 'audio.py'), cfgF, wav], { stdio: 'inherit' });
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', soloVideo, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
        '-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-shortest', '-movflags', '+faststart', final]);
      for (const x of [cfgF, wav, soloVideo]) fs.unlinkSync(x);
    }
    offsetMusica += frames / FPS;
    console.log('Hecho', nombre);
  }
  await browser.close();
  fs.writeFileSync(path.join(salida, 'resumen.txt'), resumen.join('\n') + '\n');
  if (usaNormal) fs.writeFileSync(path.join(salida, 'entrada.json'), JSON.stringify({ entrada, fecha: d.hoy }) + '\n');
  console.log(resumen.join('\n'));
  console.log('Salida:', salida);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
