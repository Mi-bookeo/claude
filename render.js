#!/usr/bin/env node
/* Renderizador determinista: Playwright (Chromium) dibuja cada fotograma a partir de su tiempo
   y se envía por tubería a ffmpeg (sin fotogramas en disco).
   Vídeo 16 «El hueco de las cinco» (sin audio ni subtítulos).
   Uso:
     node render.js stills 4,7,8      -> PNG a tamaño real en stills/
     node render.js stills all
     node render.js scenes [1,2,...]  -> scenes/scene_XX.mp4
     node render.js concat            -> vídeo final (config.output) + timeline.txt
     node render.js all               -> scenes + stills + concat
     node render.js subs              -> versión con subtítulos (subtitles.json) en scenes_sub/ -> tmp/subtitulado_mudo.mp4
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const ROOT = __dirname;
// CONFIG=config.tiktok.json -> versión TikTok (sus escenas van a cfg.scenesDir y su timeline a cfg.timeline)
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, process.env.CONFIG || 'config.json'), 'utf8'));
const FPS = cfg.fps;
const pad = n => String(n).padStart(2, '0');
const SUBS = (process.argv[2] === 'subs' || process.env.SUBS) ? JSON.parse(fs.readFileSync(path.join(ROOT, 'subtitles.json'), 'utf8')) : null;
const SCN = process.argv[2] === 'subs' ? 'scenes_sub' : (cfg.scenesDir || 'scenes');

function sceneTiming() {
  let frame = 0;
  return cfg.scenes.map(s => {
    const frames = Math.round(s.duration * FPS);
    const r = { ...s, frames, startFrame: frame, start: frame / FPS, end: (frame + frames) / FPS };
    frame += frames;
    return r;
  });
}

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: cfg.width, height: cfg.height }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('ERROR en la página:', e.message));
  await page.goto('file://' + path.join(ROOT, 'src', 'index.html'));
  const fonts = [
    ['Baloo2', 800, fs.readFileSync(path.join(ROOT, 'fonts', 'Baloo2-ExtraBold.ttf')).toString('base64')],
    ['Bangers', 400, fs.readFileSync(path.join(ROOT, 'fonts', 'Bangers-Regular.ttf')).toString('base64')],
    ['Rye', 400, fs.readFileSync(path.join(ROOT, 'fonts', 'Rye-Regular.ttf')).toString('base64')],
    ['Abril', 400, fs.readFileSync(path.join(ROOT, 'fonts', 'AbrilFatface-Regular.ttf')).toString('base64')]
  ];
  const logos = [
    // logos de la raíz (1000x1000, fondo opaco) con el fondo quitado por tools/key_logos.py
    ['logoW', 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'assets', 'logo_blanco_t.png')).toString('base64')],
    ['logoR', 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'assets', 'logo_rojo_t.png')).toString('base64')],
    // logo.png: solo el icono, sin letras (500x500, transparente)
    ['logoI', 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'logo.png')).toString('base64')],
    // cartel.png del repositorio (1414x2000), se usa tal cual
    ['cartel', 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'cartel.png')).toString('base64'), 1414, 2000]
  ];
  await page.evaluate(([c, f, l, sb]) => window.init(c, f, l, sb), [cfg, fonts, logos, SUBS]);
  return page;
}

async function frame(page, id, t, T) {
  await page.evaluate(([i, a, b]) => window.renderFrame(i, a, b), [id, t, T]);
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: cfg.width, height: cfg.height } });
}

function run(cmd, args, opts = {}) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { stdio: opts.stdin ? ['pipe', 'ignore', 'pipe'] : ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', d => { err += d; if (err.length > 20000) err = err.slice(-20000); });
    p.on('close', code => code === 0 ? res() : rej(new Error(`${cmd} salió con código ${code}\n${err.slice(-2000)}`)));
    if (opts.onProc) opts.onProc(p);
  });
}

async function renderScene(browser, sc) {
  const page = await openPage(browser);
  const out = path.join(ROOT, SCN, `scene_${pad(sc.id)}.mp4`);
  const tmp = path.join(ROOT, SCN, `scene_${pad(sc.id)}.partial.mp4`);
  const e = cfg.encoder;
  let proc;
  const done = run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-an', '-c:v', e.codec, '-preset', e.preset, '-crf', String(e.crf), '-pix_fmt', e.pix_fmt,
    '-r', String(FPS), '-video_track_timescale', '15360', '-movflags', '+faststart', '-f', 'mp4', tmp],
    { stdin: true, onProc: p => { proc = p; } });
  const t0 = Date.now();
  for (let i = 0; i < sc.frames; i++) {
    const t = i / FPS;
    const buf = await frame(page, sc.id, t, sc.start + t);
    if (!proc.stdin.write(buf)) await new Promise(r => proc.stdin.once('drain', r));
  }
  proc.stdin.end();
  await done;
  fs.renameSync(tmp, out);
  await page.close();
  console.log(`escena ${sc.id}: ${sc.frames} fotogramas en ${((Date.now() - t0) / 1000).toFixed(1)} s -> ${path.relative(ROOT, out)}`);
}

async function stills(browser, ids, dir) {
  const page = await openPage(browser);
  fs.mkdirSync(dir, { recursive: true });
  for (const sc of sceneTiming().filter(s => ids.includes(s.id))) {
    const fr = Math.min(sc.frames - 1, Math.round((process.env.STILL_AT ? Number(process.env.STILL_AT) : sc.still) * FPS));
    const t = fr / FPS;
    const buf = await frame(page, sc.id, t, sc.start + t);
    const out = path.join(dir, `still_scene_${pad(sc.id)}.png`);
    fs.writeFileSync(out, buf);
    console.log(`still escena ${sc.id} (t=${t.toFixed(2)} s) -> ${path.relative(ROOT, out) || out}`);
  }
  await page.close();
}

async function concat() {
  const sc = sceneTiming();
  const list = path.join(ROOT, 'concat_list.txt');
  fs.writeFileSync(list, sc.map(s => `file '${SCN}/scene_${pad(s.id)}.mp4'`).join('\n') + '\n');
  const final = process.argv[2] === 'subs' ? path.join(ROOT, 'tmp', 'subtitulado_mudo.mp4') : path.join(ROOT, cfg.output);
  fs.mkdirSync(path.dirname(final), { recursive: true });
  const tmp = final.replace(/\.mp4$/, '.partial.mp4');
  await run('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-an', '-movflags', '+faststart', tmp]);
  fs.renameSync(tmp, final);
  fs.unlinkSync(list);
  if (process.argv[2] === 'subs') { console.log('-> ' + path.relative(ROOT, final)); return; }
  let tl = `${cfg.title} — timeline (${cfg.width}x${cfg.height}, ${FPS} fps)\n`;
  tl += `escena/plano\tinicio_s\tfin_s\tduracion_s\tfotogramas\tnombre\n`;
  sc.forEach(s => {
    tl += `${pad(s.id)}\t${s.start.toFixed(3)}\t${s.end.toFixed(3)}\t${(s.end - s.start).toFixed(3)}\t${s.frames}\t${s.name}\n`;
    Object.entries(s.shots || {}).forEach(([k, [a, b]]) => {
      const fa = Math.round(a * FPS), fb = Math.min(s.frames, Math.round(b * FPS));
      tl += `  ${pad(s.id)}-${k}\t${((s.startFrame + fa) / FPS).toFixed(3)}\t${((s.startFrame + fb) / FPS).toFixed(3)}\t${((fb - fa) / FPS).toFixed(3)}\t${fb - fa}\tplano ${k}\n`;
    });
  });
  tl += `TOTAL\t0.000\t${sc[sc.length - 1].end.toFixed(3)}\n`;
  fs.writeFileSync(path.join(ROOT, cfg.timeline || 'timeline.txt'), tl);
  console.log(tl);
}

async function pool(items, n, fn) {
  const q = items.slice();
  await Promise.all(Array.from({ length: n }, async () => { while (q.length) await fn(q.shift()); }));
}

(async () => {
  const [cmd = 'all', arg] = process.argv.slice(2);
  const all = cfg.scenes.map(s => s.id);
  const ids = !arg || arg === 'all' ? all : arg.split(',').map(Number);
  const browser = await chromium.launch();
  try {
    if (cmd === 'stills') await stills(browser, ids, process.argv[4] || path.join(ROOT, 'stills'));
    if (cmd === 'scenes' || cmd === 'all' || cmd === 'subs') {
      fs.mkdirSync(path.join(ROOT, SCN), { recursive: true });
      const timing = sceneTiming().filter(s => ids.includes(s.id)).sort((a, b) => b.frames - a.frames);
      await pool(timing, Number(process.env.JOBS || 3), s => renderScene(browser, s));
    }
    if (cmd === 'all') await stills(browser, all, path.join(ROOT, 'stills'));
    if (cmd === 'concat' || cmd === 'all' || cmd === 'subs') await concat();
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
