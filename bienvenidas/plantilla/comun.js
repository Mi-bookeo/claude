// Piezas comunes de las bienvenidas (imágenes y historias).
// La fachada, el toldo, el rótulo y la mano son los de historias/plantilla/generar.js (rama historias-instagram), copiados sin cambios de aspecto.
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');
const BIEN = path.join(RAIZ, 'bienvenidas');
const RED = '#C81E1E', DARK = '#2B1010', TINTA = '#1E1A1A', PLAZA = '#A81414', CREMA = '#FFF4E0', PINK = '#FDE3E3';
const PIEL = '#F6C9A0';
const MAX_TANDA = 9;

const datauri = (f, mime) => `data:${mime};base64,` + fs.readFileSync(f).toString('base64');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const caja = (x, y, w, h, html, css = '') =>
  `<div class="fit" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${css}">${html}</div>`;

const PJ_DIR = path.join(RAIZ, 'carrusel', 'personajes');
const BB = {
  maria_senalando: [438, 132, 1411, 1806], maria_sonriendo: [438, 131, 1062, 1806],
  pedro_senalando: [494, 173, 1347, 1806], pedro_sonriendo: [494, 173, 1006, 1806],
};
const LOGO_BB = [107, 81, 395, 424];
let _rec;
function recursos() {
  if (_rec) return _rec;
  const img = {};
  for (const n of Object.keys(BB)) img[n] = datauri(path.join(PJ_DIR, n + '.png'), 'image/png');
  img.logo = datauri(path.join(RAIZ, 'logo_rojo.png'), 'image/png');
  const PEDRO_DIR = path.join(RAIZ, 'historias', 'personajes', 'pedro');
  const pedro = JSON.parse(fs.readFileSync(path.join(PEDRO_DIR, 'piezas.json'), 'utf8'));
  for (const n of pedro.orden) img['pedro_' + n] = datauri(path.join(PEDRO_DIR, n + '.png'), 'image/png');
  const MARIA_DIR = path.join(BIEN, 'personajes', 'maria');   // maria_senalando por piezas (herramientas/piezas_maria.py)
  const maria = JSON.parse(fs.readFileSync(path.join(MARIA_DIR, 'piezas.json'), 'utf8'));
  for (const n of maria.orden) img['maria_' + n] = datauri(path.join(MARIA_DIR, n + '.png'), 'image/png');
  const fuentes = {
    bold: datauri(path.join(RAIZ, 'carrusel', 'fuentes', 'Poppins-Bold.ttf'), 'font/ttf'),
    light: datauri(path.join(RAIZ, 'carrusel', 'fuentes', 'Poppins-Light.ttf'), 'font/ttf'),
  };
  return (_rec = { img, pedro, maria, bb: BB, fuentes });
}

function logo(x, y, h) {
  const [x0, y0, x1, y1] = LOGO_BB, k = h / (y1 - y0);
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${(x1 - x0) * k}px;height:${h}px;overflow:hidden">
    <img src="${recursos().img.logo}" style="position:absolute;left:${-x0 * k}px;top:${-y0 * k}px;width:${500 * k}px;height:${500 * k}px"></div>`;
}

// ---------- fachada (mundo 1080x1920), igual que en historias
function nube(x, y, k) {
  const c = [[0, 0, 60], [55, -25, 70], [120, 0, 55], [60, 15, 60]];
  return `<g transform="translate(${x} ${y}) scale(${k})">` +
    c.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${TINTA}" stroke-width="10"/>`).join('') +
    c.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r - 5}" fill="#fff"/>`).join('') + '</g>';
}
function fachada(W = 1080, H = 1920) {
  const T = TINTA, sw = 10;
  let s = `<svg id="cielo" class="cap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#9ED8F2"/>
  <circle cx="900" cy="200" r="88" fill="#FFC93C" stroke="${T}" stroke-width="${sw}"/>
  ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r = a * Math.PI / 180; return `<line x1="${900 + Math.cos(r) * 112}" y1="${200 + Math.sin(r) * 112}" x2="${900 + Math.cos(r) * 150}" y2="${200 + Math.sin(r) * 150}" stroke="${T}" stroke-width="12" stroke-linecap="round"/>`; }).join('')}
  ${nube(130, 190, 1)}${nube(470, 110, 0.8)}${nube(600, 330, 0.65)}
  </svg>`;
  s += `<svg class="cap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect x="-20" y="1600" width="${W + 40}" height="400" fill="#D9D3CA" stroke="${T}" stroke-width="${sw}"/>
  ${[180, 420, 660, 900].map((x) => `<line x1="${x}" y1="1600" x2="${x - 40}" y2="1860" stroke="#B9B2A7" stroke-width="6"/>`).join('')}
  <rect x="-20" y="1860" width="${W + 40}" height="80" fill="#B9B2A7" stroke="${T}" stroke-width="${sw}"/>
  <rect x="20" y="440" width="1040" height="1165" fill="#F3E2C0" stroke="${T}" stroke-width="${sw}"/>
  <rect x="5" y="420" width="1070" height="44" rx="8" fill="#E3C99A" stroke="${T}" stroke-width="${sw}"/>
  <rect x="110" y="490" width="860" height="200" rx="30" fill="#fff" stroke="${T}" stroke-width="${sw}"/>
  <rect x="80" y="870" width="310" height="735" fill="#E3C99A" stroke="${T}" stroke-width="${sw}"/>
  <rect x="105" y="895" width="260" height="710" rx="10" fill="${PLAZA}" stroke="${T}" stroke-width="${sw}"/>
  <rect x="135" y="930" width="200" height="330" rx="14" fill="#BFE6F7" stroke="${T}" stroke-width="8"/>
  <line x1="165" y1="1000" x2="230" y2="950" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
  <line x1="165" y1="1060" x2="290" y2="965" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>
  <rect x="135" y="1300" width="200" height="260" rx="14" fill="${RED}" stroke="${T}" stroke-width="8"/>
  <rect x="318" y="1240" width="24" height="90" rx="12" fill="#FFC93C" stroke="${T}" stroke-width="7"/>
  <rect x="416" y="836" width="648" height="518" rx="14" fill="#fff" stroke="${T}" stroke-width="${sw}"/>
  <rect x="440" y="860" width="600" height="470" fill="${RED}" stroke="${T}" stroke-width="8"/>
  ${vitrinaFondo()}
  <rect x="440" y="860" width="600" height="470" fill="none" stroke="${T}" stroke-width="8"/>
  <rect x="400" y="1340" width="680" height="30" rx="8" fill="#fff" stroke="${T}" stroke-width="${sw}"/>
  <rect x="416" y="1370" width="648" height="235" fill="${PLAZA}" stroke="${T}" stroke-width="${sw}"/>
  <rect x="450" y="1400" width="270" height="170" rx="12" fill="none" stroke="#8E1010" stroke-width="8"/>
  <rect x="760" y="1400" width="270" height="170" rx="12" fill="none" stroke="#8E1010" stroke-width="8"/>
  </svg>`;
  return s;
}
// siluetas del interior del escaparate (las de la fachada de historias)
function vitrinaFondo(dx = 0, dy = 0) {
  return [[440, 1170, 90, 160], [530, 1110, 80, 220], [610, 1190, 70, 140], [840, 1150, 80, 180], [920, 1100, 70, 230], [990, 1180, 50, 150]]
    .map(([x, y, w, h]) => `<rect x="${x + dx}" y="${y + dy}" width="${w}" height="${h}" fill="${PLAZA}"/>` + [0, 1].map((i) => [0, 1, 2].map((j) => `<rect x="${x + dx + 14 + i * (w - 40)}" y="${y + dy + 20 + j * 46}" width="12" height="24" rx="6" fill="${RED}"/>`).join('')).join('')).join('');
}

function toldo(W = 1080, H = 1920, y0 = 712) {
  const T = TINTA;
  const x0 = 30, x1 = 1050, y1 = y0 + 100, n = 12, w = (x1 - x0) / n;
  let franjas = '';
  for (let i = 0; i < n; i++) franjas += `<rect x="${x0 + i * w}" y="${y0}" width="${w}" height="${y1 - y0}" fill="${i % 2 ? CREMA : RED}"/>`;
  let gotas = '';
  for (let i = 0; i < n; i++) gotas += `<path d="M${x0 + i * w} ${y1} Q${x0 + i * w + w / 2} ${y1 + 70} ${x0 + (i + 1) * w} ${y1} Z" fill="${i % 2 ? CREMA : RED}" stroke="${T}" stroke-width="8" stroke-linejoin="round"/>`;
  return `<svg class="cap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <rect x="${x0 - 10}" y="${y0 - 16}" width="${x1 - x0 + 20}" height="26" rx="10" fill="#8E1010" stroke="${T}" stroke-width="9"/>
    ${franjas}<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="none" stroke="${T}" stroke-width="9"/>${gotas}</svg>`;
}

function rotulo(dy = 0) {
  return logo(150, 508 + dy, 164)
    + caja(318, 506 + dy, 620, 92, `<b style="font-size:84px;color:${RED};white-space:nowrap">Escaparate</b>`, 'align-items:flex-start;text-align:left')
    + caja(318, 592 + dy, 620, 80, `<b style="font-size:66px;color:${DARK};white-space:nowrap">de Tudela</b>`, 'align-items:flex-start;text-align:left');
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

// ---------- foto de prueba (la de historias)
function fotoPrueba(x, y, w, h) {
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:22px;border:3px solid ${DARK};
    background:repeating-linear-gradient(-60deg,#D88AA6 0 40px,#E7A3BC 40px 80px)"></div>`;   // el sello PRUEBA va encima
}

const mayus = (t) => String(t).charAt(0).toUpperCase() + String(t).slice(1);
const PIN = (sz, color) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" style="flex:none"><path d="M12 2C8 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3-7-7-7z" fill="${color}"/><circle cx="12" cy="9" r="2.8" fill="#fff"/></svg>`;

// ---------- tarjeta de bienvenida (w x h): cabecera, foto grande, nombre y, si la hay, una descripción corta.
//   c: { nombre, descripcion, foto, prueba }   carpeta: donde buscar la foto. Si falta un dato, no sale y el resto se recoloca.
function tarjeta(c, w, h, carpeta) {
  const k = w / 960, P = Math.round(32 * k);
  let s = `<div style="position:absolute;inset:0;border-radius:${36 * k}px;background:#fff;border:${7 * k}px solid ${DARK}"></div>`;
  const hh = Math.round(100 * k);
  s += `<div style="position:absolute;left:${P}px;top:${P}px;width:${w - 2 * P}px;height:${hh}px;border-radius:${hh / 2}px;background:${RED}"></div>`;
  s += caja(P + 30 * k, P, w - 2 * P - 60 * k, hh, `<b style="font-size:${58 * k}px;color:#fff;white-space:nowrap;letter-spacing:${1 * k}px">¡NUEVO EN EL ESCAPARATE!</b>`);
  const foto = c.foto && path.resolve(carpeta, c.foto);
  if (foto && !fs.existsSync(foto)) throw new Error(`No encuentro la foto ${c.foto}`);
  const hayFoto = !!foto || !!c.prueba;
  const g = Math.round(14 * k), bw = w - 2 * P;
  const bloques = [];
  if (c.nombre) bloques.push({ t: 'nombre', h: Math.round((hayFoto ? 124 : 300) * k) });
  if (c.descripcion) bloques.push({ t: 'desc', h: Math.round((hayFoto ? 56 : 90) * k) });
  const top0 = P + hh + g, libre = h - top0 - P;
  const alto = bloques.reduce((a, b) => a + b.h, 0) + g * Math.max(0, bloques.length - 1);
  let y = top0, fy = 0, fh = 0;
  if (hayFoto) {
    fh = Math.max(Math.round(300 * k), libre - alto - (bloques.length ? g : 0)); fy = y;
    if (foto) {
      const mime = /\.png$/i.test(foto) ? 'image/png' : 'image/jpeg';
      s += `<img src="${datauri(foto, mime)}" style="position:absolute;left:${P}px;top:${y}px;width:${bw}px;height:${fh}px;border-radius:${22 * k}px;object-fit:cover;object-position:${c.encuadre || '50% 50%'};background:#fff;border:${3 * k}px solid ${DARK}">`;
    } else s += fotoPrueba(P, y, bw, fh);
    y += fh + g;
  } else y += Math.max(0, (libre - alto) / 2);
  for (const b of bloques) {
    if (b.t === 'nombre') s += caja(P, y, bw, b.h, `<b style="font-size:${(hayFoto ? 76 : 110) * k}px;color:${DARK};line-height:1.05">${esc(c.nombre)}</b>`);
    if (b.t === 'desc') s += caja(P, y, bw, b.h, `<b style="font-size:${(hayFoto ? 42 : 56) * k}px;color:${RED};white-space:nowrap">${esc(mayus(c.descripcion))}</b>`);
    y += b.h + g;
  }
  // PRUEBA: sello grande sobre la foto de rayas; con foto real, una etiqueta en la esquina para no taparla
  if (c.prueba && !foto) s += `<div style="position:absolute;left:0;top:${fy + fh / 2 - 100 * k}px;width:${w}px;text-align:center;transform:rotate(-10deg);font-weight:700;font-size:${190 * k}px;line-height:1;color:rgba(200,30,30,.88);-webkit-text-stroke:${8 * k}px #fff;paint-order:stroke fill;letter-spacing:${6 * k}px">PRUEBA</div>`;
  if (c.prueba && foto) s += `<div style="position:absolute;right:${P + 18 * k}px;top:${fy + 18 * k}px;padding:${6 * k}px ${22 * k}px;border-radius:${14 * k}px;background:${RED};border:${5 * k}px solid #fff;box-shadow:0 0 0 ${4 * k}px ${DARK};color:#fff;font-weight:700;font-size:${44 * k}px;line-height:1.2;transform:rotate(6deg)">PRUEBA</div>`;
  return `<div style="position:absolute;left:0;top:0;width:${w}px;height:${h}px">${s}</div>`;
}

// ---------- página HTML con Poppins y ajuste de texto (.fit encoge la letra hasta que cabe)
function pagina(W, H, cuerpo, scripts = '') {
  const F = recursos().fuentes;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Poppins;font-weight:700;src:url(${F.bold})}
@font-face{font-family:Poppins;font-weight:300;src:url(${F.light})}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{background:#9ED8F2;font-family:Poppins;position:relative}
.cap{position:absolute;left:0;top:0;overflow:visible}
.pj{position:absolute;left:0;top:0}
.fit{position:absolute;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden;line-height:1.1}
b,i{display:block;max-width:100%} b{font-weight:700} i{font-style:normal;font-weight:300}
</style></head><body>${cuerpo}
<script>
window.fit = () => {
  for (const el of document.querySelectorAll('.fit')) {
    const kids = [...el.children];
    for (const c of kids) { if (!c.dataset.fs) c.dataset.fs = getComputedStyle(c).fontSize; c.style.fontSize = c.dataset.fs; }
    const cabe = () => kids.every((c) => c.scrollWidth <= c.clientWidth + 1) &&
      kids.reduce((t, c) => t + c.offsetHeight, 0) <= el.clientHeight + 1;
    for (let k = 0; k < 90 && !cabe(); k++)
      for (const c of kids) c.style.fontSize = (parseFloat(getComputedStyle(c).fontSize) * 0.96) + 'px';
  }
};
</script>${scripts}</body></html>`;
}

// ---------- datos
function leerDatos(f) {
  const datos = JSON.parse(fs.readFileSync(f, 'utf8'));
  const todos = (datos.comercios || []).filter((c) => c && c.nombre);
  const sinNombre = (datos.comercios || []).length - todos.length;
  const avisos = [];
  if (sinNombre) avisos.push(`${sinNombre} comercio(s) sin nombre: no se incluyen.`);
  const tanda = todos.slice(0, MAX_TANDA), pendientes = todos.slice(MAX_TANDA);
  if (pendientes.length) avisos.push(`Máximo ${MAX_TANDA} por tanda. Quedan pendientes: ${pendientes.map((c) => c.nombre).join(', ')}`);
  return { datos, tanda, pendientes, avisos, carpeta: path.dirname(path.resolve(f)) };
}

function estado() {
  const f = path.join(BIEN, 'estado.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
}
function animacionDe(datos, forzada) {
  let a = (forzada || datos.animacion || 'auto').toUpperCase();
  if (a === 'AUTO') a = estado().ultima_animacion === 'A' ? 'B' : 'A';
  if (!['A', 'B'].includes(a)) throw new Error(`Animación desconocida: ${a} (A o B)`);
  return a;
}
function hoyMadrid() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date()); }

module.exports = {
  RAIZ, BIEN, RED, DARK, TINTA, PLAZA, CREMA, PINK, PIEL, MAX_TANDA,
  datauri, esc, caja, recursos, logo, fachada, vitrinaFondo, toldo, rotulo, mano, tarjeta, pagina, leerDatos, animacionDe, hoyMadrid, PIN,
};
