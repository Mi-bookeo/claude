#!/usr/bin/env node
/* Carrusel de Instagram «Próxima apertura» (vídeo 17). Dibuja las 5 diapositivas (1080x1350, 4:5) con las piezas
   del vídeo (src/*.js: María, el local con la persiana, carteles, móvil, iconos) y las guarda como
   carrusel/carrusel_01.png … carrusel_05.png. Extra: carrusel_04.mp4 (bucle animado de la diapositiva 4).
   Uso: node carrusel/generar.js [png|mp4|all]   (por defecto all) */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config17.json'), 'utf8'));
const B64 = p => fs.readFileSync(path.join(ROOT, p)).toString('base64');
(async () => {
  const mode = process.argv[2] || 'all';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('ERROR en la página:', e.message));
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  const fonts = [['Baloo2', 800, B64('fonts/Baloo2-ExtraBold.ttf')], ['Bangers', 400, B64('fonts/Bangers-Regular.ttf')]];
  const logos = [['logoW', 'data:image/png;base64,' + B64('assets/logo_blanco_t.png')], ['logoR', 'data:image/png;base64,' + B64('assets/logo_rojo_t.png')],
    ['logoI', 'data:image/png;base64,' + B64('logo.png')]];
  await page.evaluate(([c, f, l]) => window.init(c, f, l), [cfg, fonts, logos]);
  const shot = async (n, t) => { await page.evaluate(([a, b]) => window.renderSlide(a, b), [n, t]); return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1350 } }); };
  if (mode !== 'mp4') for (let n = 1; n <= 5; n++) {
    const out = path.join(__dirname, `carrusel_0${n}.png`), tmp = out + '.partial';
    fs.writeFileSync(tmp, await shot(n, window_t(n))); fs.renameSync(tmp, out); console.log('->', path.relative(ROOT, out));
  }
  if (mode !== 'png') {   // bucle de 4 s (se repite sin salto) de la diapositiva 4
    const out = path.join(__dirname, 'carrusel_04.mp4'), tmp = path.join(__dirname, 'carrusel_04.partial.mp4');
    const p = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-crf', '20', '-preset', 'slow',
      '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', tmp], { stdio: ['pipe', 'ignore', 'inherit'] });
    const done = new Promise((res, rej) => p.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()));
    for (let i = 0; i < 120; i++) { const b = await shot(4, 10 + i / 30); if (!p.stdin.write(b)) await new Promise(r => p.stdin.once('drain', r)); }
    p.stdin.end(); await done; fs.renameSync(tmp, out); console.log('->', path.relative(ROOT, out));
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
// instante «congelado» de cada diapositiva para el PNG (todo ya ha entrado)
function window_t(n) { return 10; }
