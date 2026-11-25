// Imágenes de bienvenida para el post (1 comercio) o el carrusel (2 o más), 1080x1350 JPG.
// Uso (desde la raíz del repo):
//   node bienvenidas/plantilla/imagenes.js <datos.json> [--salida carpeta] [--animacion A|B]
//   Escribe 01.jpg, 02.jpg… y pie.txt (texto para copiar y cuentas para etiquetar).
//   --animacion solo decide qué personaje sale en la portada del carrusel (A: la chica, B: Pedro).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const C = require('./comun');

const W = 1080, H = 1350;
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };

// ---------- marco: la fachada de la tienda (rótulo, toldo, escaparate)
const VID = { x: 58, y: 362, w: 964, h: 906 };     // cristal
const TAR = { x: 82, y: 392, w: 916, h: 856 };     // tarjeta dentro del cristal
function marco(dentro, delante = '') {
  const T = C.TINTA;
  const k = 0.75, dy = 460;   // rótulo de la fachada de historias al 75 %; toldo a tamaño real
  const arriba = `<div style="position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:0 0;transform:translate(${540 * (1 - k)}px,0) scale(${k}) translate(0,${-dy}px)">
    <svg class="cap" viewBox="0 0 1080 1920" width="1080" height="1920">
      <rect x="110" y="490" width="860" height="200" rx="30" fill="#fff" stroke="${T}" stroke-width="10"/>
    </svg>${C.rotulo()}</div>
    <div style="position:absolute;left:0;top:0;width:1080px;height:1920px;transform:translateY(-516px)">${C.toldo()}</div>`;
  const fondo = `<svg class="cap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
 <rect x="-10" y="-10" width="${W + 20}" height="${H + 20}" fill="#F3E2C0"/>
    <rect x="-10" y="-20" width="${W + 20}" height="38" fill="#E3C99A" stroke="${T}" stroke-width="10"/>
    <rect x="36" y="340" width="1008" height="950" rx="14" fill="#fff" stroke="${T}" stroke-width="10"/>
    <rect x="${VID.x}" y="${VID.y}" width="${VID.w}" height="${VID.h}" fill="${C.RED}" stroke="${T}" stroke-width="8"/>
    <g transform="translate(${VID.x} ${VID.y + VID.h - 330}) scale(1.6 1) translate(-440 -1100)">${C.vitrinaFondo()}</g>
    <rect x="${VID.x}" y="${VID.y}" width="${VID.w}" height="${VID.h}" fill="none" stroke="${T}" stroke-width="8"/>
    <rect x="-20" y="1306" width="${W + 40}" height="80" fill="#D9D3CA" stroke="${T}" stroke-width="10"/>
    <rect x="16" y="1280" width="1048" height="28" rx="8" fill="#fff" stroke="${T}" stroke-width="10"/>
  </svg>`;
  const web = C.caja(0, 1310, W, 40, `<b style="font-size:24px;color:${C.DARK};letter-spacing:1px">escaparatetudela.es</b>`);
  return fondo + `<div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px">${dentro}</div>` + arriba + web + delante;
}

function slideComercio(c, carpeta) {
  return marco(`<div style="position:absolute;left:${TAR.x}px;top:${TAR.y}px">${C.tarjeta(c, TAR.w, TAR.h, carpeta)}</div>`);
}

function slidePortada(n, pj) {
  const R = C.recursos();
  const nombre = pj === 'pedro' ? 'pedro_senalando' : 'maria_senalando';
  const [x0, , x1, y1] = R.bb[nombre], s = 0.5;
  const pjHtml = `<img src="${R.img[nombre]}" class="pj" style="width:1500px;height:1875px;transform-origin:0 0;transform:translate(${10 - x0 * s}px,${1346 - y1 * s}px) scale(${s})">`;
  const cx = 500, cw = 500, cy = 410, ch = 810;
  const cartel = `<div style="position:absolute;left:${cx}px;top:${cy}px;width:${cw}px;height:${ch}px;border-radius:36px;background:#fff;border:7px solid ${C.DARK}"></div>`
    + C.logo(cx + cw / 2 - 100, cy + 60, 236)
    + C.caja(cx + 30, cy + 330, cw - 60, 130, `<b style="font-size:96px;color:${C.RED};white-space:nowrap">NUEVOS</b>`)
    + C.caja(cx + 30, cy + 450, cw - 60, 90, `<b style="font-size:64px;color:${C.DARK};white-space:nowrap">EN EL</b>`)
    + C.caja(cx + 30, cy + 535, cw - 60, 120, `<b style="font-size:90px;color:${C.RED};white-space:nowrap">ESCAPARATE</b>`)
    + `<div style="position:absolute;left:${cx + 70}px;top:${cy + 690}px;width:${cw - 140}px;height:80px;border-radius:40px;background:${C.PINK}"></div>`
    + C.caja(cx + 80, cy + 690, cw - 160, 80, `<b style="font-size:38px;color:${C.DARK};white-space:nowrap">${n} comercios</b>`);
  return marco(cartel, pjHtml);
}

// ---------- pie de foto
function pie(tanda) {
  const sufijoCalle = (c) => (c.calle ? `, en ${c.calle}` : '');
  let txt;
  if (tanda.length === 1) {
    const c = tanda[0];
    txt = `🛍️ ¡Nuevo en el escaparate! Damos la bienvenida a ${c.nombre}${sufijoCalle(c)}.` + (c.ofrece ? ` Aquí encontrarás ${c.ofrece}.` : '')
      + ' Pásate a conocerlo y sigue sus publicaciones en escaparatetudela.es 👋';
  } else {
    txt = '🛍️ ¡Nuevos en el escaparate! Damos la bienvenida a estos comercios:\n\n'
      + tanda.map((c) => `• ${c.nombre}${sufijoCalle(c)}` + (c.ofrece ? `. Aquí encontrarás ${c.ofrece}.` : '.')).join('\n')
      + '\n\nPásate a conocerlos y sigue sus publicaciones en escaparatetudela.es 👋';
  }
  const cuentas = tanda.map((c) => c.instagram).filter(Boolean).map((u) => '@' + String(u).replace(/^@/, ''));
  return `${txt}\n\n--- Cuentas para etiquetar e invitar como colaboradoras ---\n${cuentas.length ? cuentas.join('\n') : '(ninguna)'}\n`;
}

async function main() {
  const f = args.find((a) => !a.startsWith('--') && a !== opt('--salida') && a !== opt('--animacion'));
  if (!f) throw new Error('Uso: node bienvenidas/plantilla/imagenes.js <datos.json> [--salida carpeta] [--animacion A|B]');
  const { datos, tanda, avisos, carpeta } = C.leerDatos(f);
  avisos.forEach((a) => console.log('AVISO:', a));
  if (!tanda.length) { console.log('No hay comercios: no se genera nada.'); return; }
  const anim = C.animacionDe(datos, opt('--animacion'));
  const salida = path.resolve(opt('--salida') || path.join(C.BIEN, 'salida', datos.hoy || C.hoyMadrid(), 'imagenes'));
  fs.mkdirSync(salida, { recursive: true });

  const slides = tanda.length === 1 ? [slideComercio(tanda[0], carpeta)]
    : [slidePortada(tanda.length, anim === 'A' ? 'maria' : 'pedro'), ...tanda.map((c) => slideComercio(c, carpeta))];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (let i = 0; i < slides.length; i++) {
    await page.setContent(C.pagina(W, H, slides[i]), { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; window.fit(); });
    const out = path.join(salida, String(i + 1).padStart(2, '0') + '.jpg');
    await page.screenshot({ path: out, type: 'jpeg', quality: 92 });
    console.log('Hecho', path.relative(process.cwd(), out));
  }
  await browser.close();
  fs.writeFileSync(path.join(salida, 'pie.txt'), pie(tanda));
  console.log('Salida:', salida);
}

if (require.main === module) main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
module.exports = { pie };
