/* Historia (Instagram/WhatsApp) para el vídeo 02: «Marta está a punto de perderse algo... 👀» / «Mañana lo ves.»
   Fondo: la carrera de la escena 4 (reloj que se queda en 13:5x, sin llegar a las 14:00). */
'use strict';

// ojos 👀 de cómic (centro x,y; s = escala; look = -1..1 izquierda/derecha; blink 0..1)
function comicEyes(x, y, s, look, blink) {
  let g = '';
  [-1, 1].forEach(side => {
    const cx = side * 38, ry = 46 * (1 - 0.9 * blink);
    g += `<ellipse cx="${cx + 5}" cy="5" rx="34" ry="${f(ry)}" fill="${INK}"/>`;
    g += `<ellipse cx="${cx}" cy="0" rx="34" ry="${f(ry)}" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.9)}"/>`;
    if (blink < 0.6) {
      g += `<circle cx="${f(cx + look * 14)}" cy="${f(6 * (1 - blink))}" r="${f(16 * (1 - blink * 0.8))}" fill="${INK}"/>`;
      g += `<circle cx="${f(cx + look * 14 + 6)}" cy="${f(-2)}" r="5" fill="#FFFFFF"/>`;
    }
  });
  return at(x, y, s, g);
}

const STORY_LINES = [
  { y: 0, words: ['Marta', 'está', 'a', 'punto'] },
  { y: 1, words: ['de', 'perderse', 'algo'] }
];
const STORY = { boxT: 0.25, w0: 0.6, dw: 0.17, dots: 1.95, eyes: 2.45, stamp: 3.5 };

S.H = (t, T) => {
  // fondo: la carrera (la duración ficticia hace que el reloj no llegue a las 14:00)
  let s = S[4](t, T, { duration: 9.6, clockX: 905, clockY: 760 });
  // --- cartel amarillo de narración (arriba, debajo de la barra de la app) ---
  const kb = pop(t, STORY.boxT, 0.55);
  const lineW = (z) => measure('de perderse algo...', z) + measure(' ', z) * 2 + 150 * z / 100;
  const size = Math.min(100, 100 * 890 / lineW(100)), lh = size * 1.3, bx = 540, by = 365;
  let box = `<rect x="-485" y="-140" width="970" height="280" rx="34" transform="translate(14 14)" fill="${INK}"/>`;
  box += `<rect x="-485" y="-140" width="970" height="280" rx="34" fill="${C.yel}" stroke="${INK}" stroke-width="${f(SW * 1.1)}"/>`;
  let wi = 0;
  STORY_LINES.forEach((ln, li) => {
    const sp = measure(' ', size);
    let words = ln.words.map(w => ({ w, wd: measure(w, size) }));
    let total = words.reduce((a, b) => a + b.wd, 0) + sp * (words.length - 1);
    if (li === 1) total += measure('...', size) + 150 * size / 100; // sitio para los puntos y los ojos
    let x = -total / 2;
    const yy = -lh / 2 + li * lh;
    words.forEach(o => {
      const st = STORY.w0 + wi * STORY.dw, k = pop(t, st, 0.42);
      const wob = t > 4 ? 2.5 * Math.sin(t * 3 + wi) : 0;
      box += at(x + o.wd / 2, yy + wob, k, text(o.w, 0, 0, { size, fill: INK, stroke: null }), (wi % 2 ? 6 : -6) * (1 - k));
      x += o.wd + sp; wi++;
    });
    if (li === 1) {
      const dw = measure('.', size);
      for (let d = 0; d < 3; d++) {
        const k = pop(t, STORY.dots + d * 0.15, 0.3);
        box += at(x + dw * (d + 0.5) - sp * 0.6, yy - 12 * Math.max(0, Math.sin((t - STORY.dots - d * 0.15) * 9)) * (t < STORY.dots + 0.6 ? 1 : 0), k, text('.', 0, 0, { size, fill: INK, stroke: null }));
      }
      x += dw * 3 - sp * 0.4;
      const ke = pop(t, STORY.eyes, 0.5);
      // miran a un lado y a otro, y parpadean
      const lt = t - STORY.eyes - 0.4;
      const look = lt < 0 ? 0 : Math.max(-1, Math.min(1, 1.6 * Math.sin(lt * 2.6)));
      const bl = [5.3, 7.2].reduce((a, b0) => Math.max(a, clamp(1 - Math.abs(t - b0) / 0.09)), 0);
      box += comicEyes(x + 75 * size / 100, yy - 4, 0.78 * size / 100 * ke * (1 + 0.04 * Math.sin(t * 7)), look, bl);
    }
  });
  s += at(bx, by + (1 - kb) * -500, Math.max(kb, 0.001), box, -2 + 3 * (1 - kb));
  // --- sello rojo «Mañana lo ves.» que cae de golpe (abajo) ---
  const u = t - STORY.stamp;
  if (u > 0) {
    const sc0 = u < 0.16 ? lerp(3.2, 1, easeOut(u / 0.16)) : 1 + 0.08 * damp(u - 0.16, 18, 6);
    const pulse = t > 5 ? 1 + 0.035 * Math.sin((t - 5) * 2 * PI / 1.1) : 1;
    let st;
    const lab = 'Mañana lo ves.', ls = fit(lab, 128, 820);
    st = `<rect x="-460" y="-105" width="920" height="210" rx="40" transform="translate(16 16)" fill="${INK}"/>`;
    st += `<rect x="-460" y="-105" width="920" height="210" rx="40" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW * 1.2)}"/>`;
    st += `<rect x="-430" y="-77" width="860" height="154" rx="26" fill="none" stroke="#FFFFFF" stroke-width="${f(SW * 0.6)}" stroke-dasharray="22 16"/>`;
    st += text(lab, 0, 4, { size: ls, sw: SW * 2.2, sd: 8 });
    // estrellitas de impacto
    let stars = '';
    [[-500, -110, 34, 0.08], [505, -95, 28, 0.14], [-470, 120, 24, 0.2], [480, 125, 30, 0.1]].forEach(([x, y, r, d]) => {
      stars += sparkle(x, y, r, pop(u, d, 0.35) * (1 + 0.15 * Math.sin(t * 12 + x)), C.yel);
    });
    // líneas de impacto al caer
    let imp = '';
    if (u < 0.5) {
      const a = clamp(1 - u / 0.5);
      for (let i = 0; i < 10; i++) {
        const ang = i / 10 * 2 * PI + 0.3, r1 = 520 + 60 * (1 - a), r2 = r1 + 160 * a;
        imp += `<line x1="${f(Math.cos(ang) * r1)}" y1="${f(Math.sin(ang) * r1 * 0.45)}" x2="${f(Math.cos(ang) * r2)}" y2="${f(Math.sin(ang) * r2 * 0.45)}" stroke="#FFFFFF" stroke-width="${f(SW * 1.4)}" stroke-linecap="round"/>`;
      }
    }
    s += `<g transform="translate(540 1560)">${imp}</g>`;
    s += at(540, 1560, sc0 * pulse, st, -4 + 2 * damp(u, 14, 4));
    s += at(540, 1560, 1, stars);
  }
  // sacudida de cámara al caer el sello
  const shake = u > 0 && u < 0.4 ? 14 * Math.exp(-u * 9) : 0;
  if (shake) s = `<g transform="translate(${f(shake * Math.sin(u * 90))} ${f(shake * Math.cos(u * 70))})">${s}</g>`;
  return s;
};
