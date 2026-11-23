#!/usr/bin/env node
/* Genera los PNG de las poses (fondo transparente, 1500x1875).
   Uso: node carrusel/generar.js <carpeta con src/ y fonts/ de la rama video-11-marta-cuatro-motivos> [salida]
   p. ej.: mkdir /tmp/v11 && git archive origin/video-11-marta-cuatro-motivos src fonts | tar -x -C /tmp/v11
           node carrusel/generar.js /tmp/v11 carrusel/png */
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const SRC = path.resolve(process.argv[2] || '.');
const OUT = path.resolve(process.argv[3] || path.join(__dirname, 'png'));
const DPR = 1.5;
const LIBS = ['lib.js', 'series.js', 'rosa.js', 'v04.js', 'v05.js', 'v06.js', 'v07.js', 'v08.js', 'v09.js', 'v10.js', 'maria.js', 'v11.js'];
const FILES = {
  maria: { senalando: 'maria_senalando', sonriendo: 'maria_sonriendo', sorprendida: 'maria_sorprendida', cartel: 'maria_cartel', movil: 'maria_movil' },
  pedro: { senalando: 'pedro_senalando', sonriendo: 'pedro_sonriendo', sorprendido: 'pedro_sorprendido', cartel: 'pedro_cartel', movil: 'pedro_movil' }
};
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:transparent;overflow:hidden}svg{display:block}</style></head><body>
<svg id="stage" xmlns="http://www.w3.org/2000/svg" width="1000" height="1250" viewBox="0 0 1000 1250"><defs id="defs"></defs><g id="dyn"></g></svg>
${LIBS.map(l => `<script src="file://${path.join(SRC, 'src', l)}"></script>`).join('\n')}
<script src="file://${path.join(__dirname, '..', 'personajes', 'pedro', 'pedro.js')}"></script>
<script src="file://${path.join(__dirname, 'poses.js')}"></script></body></html>`;
  const tmp = path.join(OUT, '_poses.html'); fs.writeFileSync(tmp, html);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1250 }, deviceScaleFactor: DPR });
  page.on('pageerror', e => console.error('ERROR:', e.message));
  await page.goto('file://' + tmp);
  const fonts = [['Baloo2', 800, 'Baloo2-ExtraBold.ttf'], ['Bangers', 400, 'Bangers-Regular.ttf']]
    .map(([a, b, c]) => [a, b, fs.readFileSync(path.join(SRC, 'fonts', c)).toString('base64')]);
  await page.evaluate(f => window.loadFonts(f), fonts);
  for (const who of Object.keys(FILES)) for (const [pose, name] of Object.entries(FILES[who])) {
    await page.evaluate(([a, b]) => window.drawPose(a, b), [who, pose]);
    await page.screenshot({ path: path.join(OUT, name + '.png'), omitBackground: true, clip: { x: 0, y: 0, width: 1000, height: 1250 } });
    console.log(name + '.png');
  }
  // ficha de referencia de Pedro de frente (personajes/pedro/pedro.png)
  await page.evaluate(() => window.drawPose('ref', 'pedro'));
  await page.screenshot({ path: path.join(__dirname, '..', 'personajes', 'pedro', 'pedro.png'), omitBackground: true, clip: { x: 0, y: 0, width: 1000, height: 1250 } });
  await browser.close(); fs.unlinkSync(tmp);
})();
