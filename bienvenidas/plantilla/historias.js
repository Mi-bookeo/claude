// Historias animadas de bienvenida · Escaparate de Tudela
// 1080x1920, 30 fps, MP4 H.264 yuv420p con música y efectos (AAC). Un MP4 por comercio.
// Uso (desde la raíz del repo):
//   node bienvenidas/plantilla/historias.js <datos.json> [--png] [--animacion A|B] [--salida carpeta]
//     --sin-sonido MP4 sin audio
//     --png        solo capturas PNG de los momentos clave (para revisar antes de los vídeos)
//     --animacion  fuerza A (gran inauguración) o B (el nuevo rótulo); si no, alterna según bienvenidas/estado.json
// No toca estado.json: eso lo hace aprobar.js cuando se aprueban los vídeos.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');
const C = require('./comun');

const W = 1080, H = 1920, FPS = 30;
const TAR = { x: 60, y: 250, w: 960, h: 1040 };   // tarjeta en pantalla (cámara en el escaparate)
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
const soloPng = args.includes('--png');
const sinSonido = args.includes('--sin-sonido');
const { execFileSync } = require('child_process');
const T = C.TINTA;

// ---------- piezas de la escena (coordenadas del mundo, 1080x1920)
function telon() {
  const tela = (id, x, origen) => `<div id="${id}" style="position:absolute;left:${x}px;top:884px;width:300px;height:444px;transform-origin:${origen} 0;
      border:7px solid ${T};border-top:none;border-radius:0 0 ${origen === 'left' ? '0 60px' : '60px 0'};
      background:repeating-linear-gradient(90deg,#9E1212 0 8px,#C81E1E 8px 30px,#E04040 30px 40px,#C81E1E 40px 62px)"></div>`;
  let cen = '';
  for (let i = 0; i < 12; i++) cen += `<path d="M${428 + i * 52} 900 Q${454 + i * 52} 944 ${480 + i * 52} 900 Z" fill="#8E1010" stroke="${T}" stroke-width="7" stroke-linejoin="round"/>`;
  return tela('telI', 440, 'left') + tela('telD', 740, 'right')
    + `<svg class="cap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${cen}
      <rect x="424" y="852" width="632" height="52" rx="10" fill="#8E1010" stroke="${T}" stroke-width="8"/>
      <line x1="436" y1="892" x2="1044" y2="892" stroke="#FFC93C" stroke-width="8" stroke-linecap="round"/></svg>`;
}
function cordon() {
  return `<svg id="cordon" class="cap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:none">
    <path class="c" fill="none" stroke="${T}" stroke-width="15" stroke-linecap="round"/>
    <path class="c" fill="none" stroke="#FFC93C" stroke-width="8" stroke-linecap="round"/>
    <g id="borla"><path d="M-9 4 L9 4 L17 52 L-17 52 Z" fill="#FFC93C" stroke="${T}" stroke-width="6" stroke-linejoin="round"/>
      <circle r="13" fill="#FFC93C" stroke="${T}" stroke-width="6"/></g></svg>`;
}
function rotuloNuevo(nombre) {
  return `<div id="rotulo" style="position:absolute;left:452px;top:896px;width:576px;height:460px">
    <div id="rotTela" style="position:absolute;left:0;top:0;width:576px;height:0;overflow:hidden;background:#fff;border:7px solid ${T};border-top:none">
      <div style="position:absolute;left:10px;top:0;width:542px;height:404px;border:8px solid ${C.RED};border-top:none;border-radius:0 0 18px 18px"></div>
      ${C.caja(34, 24, 494, 360, `<b style="font-size:100px;color:${C.RED};line-height:1.05">${C.esc(nombre)}</b>`)}
    </div>
    <div id="rotBarra" style="position:absolute;left:-16px;top:-6px;width:608px;height:24px;border-radius:12px;background:#8E1010;border:6px solid ${T}"></div>
  </div>`;
}
function rollo() {
  return `<svg class="cap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <line x1="404" y1="896" x2="440" y2="888" stroke="${T}" stroke-width="10"/>
    <rect x="436" y="870" width="608" height="34" rx="17" fill="#C9A06A" stroke="${T}" stroke-width="8"/>
    <line x1="450" y1="887" x2="1030" y2="887" stroke="#A9814C" stroke-width="5"/>
    <circle cx="404" cy="896" r="24" fill="#9AA0A7" stroke="${T}" stroke-width="7"/><circle cx="404" cy="896" r="7" fill="${T}"/></svg>`;
}
function cuerda() {
  return `<svg id="cuerda" class="cap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
    <path fill="none" stroke="${T}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    <path fill="none" stroke="#D9B77A" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="cuerdaMarcas" fill="none" stroke="#A07C45" stroke-width="9" stroke-dasharray="5 16" stroke-linejoin="round"/></svg>`;
}
const confeti = () => `<svg id="confeti" class="cap" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:none"></svg>`;
function piezasHtml(R, quien) {
  const J = R[quien];
  let s = `<div id="${quien}" class="pj" style="width:1500px;height:1875px;transform-origin:0 0">`;
  for (const n of J.orden) {
    const p = J.piezas[n], o = p.pivote ? `${p.pivote[0] - p.x}px ${p.pivote[1] - p.y}px` : '0 0';
    s += `<img data-p="${n}" src="${R.img[quien + '_' + n]}" style="position:absolute;left:${p.x}px;top:${p.y}px;width:${p.w}px;height:${p.h}px;transform-origin:${o}">`;
  }
  return s + '</div>';
}

// Vitrina: la tarjeta va en coordenadas de pantalla con la cámara ya en el escaparate.
function escena(h, carpeta, ESCENA) {
  const R = C.recursos();
  const anim = h.anim;
  let mundo = C.fachada() + C.rotulo();
  if (anim === 'A') mundo += telon();
  if (anim === 'B') mundo += rotuloNuevo(h.primero.nombre);
  mundo += C.toldo();
  if (anim === 'B') mundo += rollo();
  if (h.modo === 'A') mundo += piezasHtml(R, 'maria') + cordon();
  if (h.modo === 'B') mundo += piezasHtml(R, 'pedro');
  if (anim === 'B') mundo += cuerda();
  let s = `<div id="mundo" style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0">${mundo}</div>`;
  s += `<div id="tarjeta" style="position:absolute;left:${TAR.x}px;top:${TAR.y}px;width:${TAR.w}px;height:${TAR.h}px;transform-origin:50% 50%">${C.tarjeta(h.c, TAR.w, TAR.h, carpeta)}</div>`;
  s += confeti();
  if (h.ultima) s += `<div id="conocelo" style="position:absolute;inset:0;opacity:0">${C.caja(40, 1291, 1000, 86,
    `<b style="font-size:58px;color:#fff;white-space:nowrap;text-shadow:0 5px 0 ${C.DARK},0 -2px 0 ${C.DARK},3px 0 0 ${C.DARK},-3px 0 0 ${C.DARK}">${h.plural ? 'Conócelos' : 'Conócelo'} en Escaparate de Tudela</b>`)}</div>`;
  s += C.mano();
  const datosJs = `<script>window.H=${JSON.stringify({ ...h, TAR })};window.A=${JSON.stringify({ pedro: R.pedro, maria: R.maria, bb: R.bb })};</script><script>${ESCENA}</script>`;
  return C.pagina(W, H, s, datosJs);
}

function ffmpeg(salida) {
  const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', salida], { stdio: ['pipe', 'inherit', 'inherit'] });
  const fin = new Promise((ok, ko) => p.on('close', (c) => (c === 0 ? ok() : ko(new Error('ffmpeg ' + c)))));
  return { p, fin };
}

function momentos(h, P, dur) {
  const m = [], fin = dur - 1 / FPS;
  if (h.modo === 'A') {
    m.push(['A1_inicio', 0], ['A2_tira_del_cordon', P.tirones[1][0] + 0.2], ['A4_se_abre_el_telon', (P.telon[0] + P.telon[1]) / 2], ['A6_zoom', (P.zoom[0] + P.zoom[1]) / 2],
      ['A7_sale_el_comercio_con_confeti', P.pop[0] + 0.35]);
  }
  if (h.modo === 'B') {
    const a = P.t0 + P.dt;   // segundo tirón
    m.push(['B1_inicio', 0], ['B2_agarra_la_cuerda', P.agarra[1] + 0.02], ['B3_tiron_brazo_arriba', a + 0.02], ['B4_tiron_brazo_abajo', a + P.tira],
      ['B5_rotulo_bajado', P.suelta[1] + 0.1], ['B7_zoom', (P.zoom[0] + P.zoom[1]) / 2],
      ['B8_sale_el_comercio_con_confeti', P.pop[0] + 0.35]);
  }
  if (h.modo === 'siguiente') m.push(['primer_fotograma', 0], ['mano_pone_cartel', P.pon[0] + 0.3], ['confeti', P.confeti[0] + 0.35]);
  m.push(['presentacion_quieta', P.quieta[0] + 1]);
  if (P.quita) m.push(['mano_quita_cartel', P.quita[0] + 0.5]);
  m.push(['ultimo_fotograma', fin]);
  return m;
}

async function main() {
  const f = args.find((a, i) => !a.startsWith('--') && !['--salida', '--animacion'].includes(args[i - 1]));
  if (!f) throw new Error('Uso: node bienvenidas/plantilla/historias.js <datos.json> [--png] [--animacion A|B] [--salida carpeta]');
  const { datos, tanda, avisos, carpeta } = C.leerDatos(f);
  avisos.forEach((a) => console.log('AVISO:', a));
  if (!tanda.length) { console.log('No hay comercios: no se genera nada.'); return; }
  const anim = C.animacionDe(datos, opt('--animacion'));
  const hoy = datos.hoy || C.hoyMadrid();
  const salida = path.resolve(opt('--salida') || path.join(C.BIEN, 'salida', hoy, 'historias'));
  fs.mkdirSync(salida, { recursive: true });
  const ESCENA = fs.readFileSync(path.join(__dirname, 'escena.js'), 'utf8');

  const hist = tanda.map((c, i) => ({
    modo: i === 0 ? anim : 'siguiente', anim, c, primero: tanda[0], n: i + 1, de: tanda.length,
    retirar: i < tanda.length - 1, ultima: i === tanda.length - 1, plural: tanda.length > 1,
  }));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const resumen = [];
  let ultimoBuf = null, offsetMusica = 0;
  const SONIDO = JSON.parse(fs.readFileSync(path.join(C.BIEN, 'sonido.json'), 'utf8'));
  for (let k = 0; k < hist.length; k++) {
    const h = hist[k], num = String(k + 1).padStart(2, '0');
    const slug = h.c.nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
    const nombre = `${num}_${slug}`;
    await page.setContent(escena(h, carpeta, ESCENA), { waitUntil: 'load' });
    await page.evaluate(async () => { await document.fonts.ready; window.fit(); });
    const dur = await page.evaluate(() => window.DURACION), P = await page.evaluate(() => window.PLAN);
    const frames = Math.round(dur * FPS);
    resumen.push(`${nombre}.mp4  ${dur.toFixed(2)} s  ${h.n}/${h.de}  ${h.modo === 'siguiente' ? 'cambio de cartel' : 'animación ' + anim}  · ${h.c.nombre}`);
    if (soloPng) {
      for (const [m, t] of momentos(h, P, dur)) {
        await page.evaluate((tt) => window.pintar(tt), Math.min(t, dur - 1 / FPS));
        await page.screenshot({ path: path.join(salida, `${num}_${m}.png`) });
      }
      continue;
    }
    const out = path.join(salida, nombre + '.mp4'), soloVideo = path.join(salida, '.' + nombre + '_video.mp4');
    const { p, fin } = ffmpeg(sinSonido ? out : soloVideo);
    for (let fr = 0; fr < frames; fr++) {
      await page.evaluate((tt) => window.pintar(tt), fr / FPS);
      let buf = await page.screenshot({ type: 'png' });
      if (fr === 0 && h.modo === 'siguiente' && ultimoBuf) buf = ultimoBuf;   // empalme exacto con la historia anterior
      if (fr === frames - 1) ultimoBuf = buf;
      if (!p.stdin.write(buf)) await new Promise((r) => p.stdin.once('drain', r));
    }
    p.stdin.end();
    await fin;
    if (!sinSonido) {   // música (sigue de una historia a la siguiente) + efectos: cuerda, telón, zoom, mano, confeti
      const cfg = path.join(salida, '.' + nombre + '_audio.json'), wav = path.join(salida, '.' + nombre + '.wav');
      fs.writeFileSync(cfg, JSON.stringify({ dur: frames / FPS, offset: offsetMusica, eventos: await page.evaluate(() => window.SONIDOS), ajustes: SONIDO }));
      execFileSync('python3', [path.join(C.BIEN, 'herramientas', 'sonido.py'), cfg, wav], { stdio: 'inherit' });
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', soloVideo, '-i', wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
        '-c:a', 'aac', '-b:a', '160k', '-ar', '44100', '-shortest', '-movflags', '+faststart', out]);
      for (const x of [cfg, wav, soloVideo]) fs.unlinkSync(x);
    }
    offsetMusica += frames / FPS;
    console.log('Hecho', nombre);
  }
  await browser.close();
  fs.writeFileSync(path.join(salida, 'resumen.txt'), resumen.join('\n') + '\n');
  fs.writeFileSync(path.join(salida, 'animacion.json'), JSON.stringify({ animacion: anim, fecha: hoy, comercios: tanda.map((c) => c.nombre) }, null, 1) + '\n');
  console.log(resumen.join('\n'));
  console.log('Salida:', salida);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
