/* Story teaser (vertical 9:16, ~7 s): «Mañana: lo que le pasa a Rosa con los pasteles que le sobran 🥐👀».
   Mismo interior que la escena 2 (Rosa, vitrina llena), desplazado hacia abajo para dejar sitio al texto arriba. */
'use strict';

function emoji(ch, x, y, size, k, rot = 0) {
  return at(x, y, k, `<text x="0" y="0" font-family="Noto Color Emoji" font-size="${f(size)}" text-anchor="middle" dominant-baseline="central">${ch}</text>`, rot);
}
const STORY_LINES = [['lo', 'que', 'le', 'pasa', 'a', 'Rosa'], ['con', 'los', 'pasteles'], ['que', 'le', 'sobran']];

S[11] = (t, T, sc) => {
  const DY = 150;
  // pared de puntos en todo el fondo (cubre el hueco de arriba al bajar el interior)
  const id = 'sd' + (uid++), cell = 10 * W / 380;
  let s = `<defs><pattern id="${id}" width="${f(cell)}" height="${f(cell)}" patternUnits="userSpaceOnUse"><circle cx="${f(cell / 2)}" cy="${f(cell / 2)}" r="${f(1.4 * W / 380)}" fill="${DOT}"/></pattern></defs>`;
  s += `<rect width="${W}" height="${H}" fill="${C.cream}"/><rect width="${W}" height="${H}" fill="url(#${id})"/>`;
  // Rosa: tranquila, mira la vitrina llena, se preocupa (gota de sudor) y mira a cámara
  const lookV = easeInOut((t - 2.3) / 0.3), back = easeInOut((t - 4.6) / 0.25);
  const expr = t < 2.5 ? 'happy' : (t < 4.6 ? 'worried' : 'surprise');
  const look = [lerp(lerp(0, 0.9, lookV), 0, back), lerp(lerp(0, 1.6, lookV), 0, back)];
  let w = interiorBack(T, { noShelf: true });
  w += rosaInt(T, { expr, look, head: lerp(lerp(0, 10, lookV), -3, back), armF: -28, armB: -22 });
  w += vitrina() + counterTop();
  if (t > 4.6) w += mark('!', 870, 780, pop(t, 4.62, 0.35), 12, 150);
  const z = zoomIn(t, 0, 1.15, 0.25) * lerp(1, 1.07, clamp(t / 7));
  s += `<g transform="translate(0 ${DY})">${cam(z, 690, 1000, w)}</g>`;

  // «Mañana:» en franja roja que entra desde la izquierda con rebote
  const kb = pop(t, 0.2, 0.55), bx = 540 + (1 - easeOut((t - 0.2) / 0.3)) * -1200;
  const lab = 'Mañana:', ls = 128, lw = measure(lab, ls) + 110;
  let ban = `<rect x="${f(-lw / 2 + 12)}" y="-78" width="${f(lw)}" height="156" rx="30" fill="${INK}"/>`;
  ban += `<rect x="${f(-lw / 2)}" y="-90" width="${f(lw)}" height="156" rx="30" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
  ban += text(lab, 0, -10, { size: ls, sw: SW * 2.2, sd: 8 });
  if (t > 0.2) s += at(bx, 300, 0.85 + 0.15 * kb, ban, -5 + 2 * Math.sin(t * 3));
  // frase palabra a palabra (rebote cómic)
  const size = 92, y0 = 470, lh = 108, gap = 22;
  let k = 0;
  STORY_LINES.forEach((ln, li) => {
    const ws = ln.map(x => measure(x, size));
    const extra = li === 2 ? 2 * (size * 1.05) + gap : 0; // hueco para 🥐👀
    let x = 540 - (ws.reduce((a, b) => a + b, 0) + gap * (ln.length - 1) + extra) / 2;
    ln.forEach((wd, i) => {
      const tw = 0.75 + k * 0.11, kk = pop(t, tw, 0.45);
      const hl = wd === 'Rosa' || wd === 'sobran';
      if (kk > 0) s += at(x + ws[i] / 2, y0 + li * lh, kk, text(wd, 0, 0, { size, fill: hl ? C.yel : '#FFFFFF', sw: SW * 2.2, sd: 8 }), (k % 2 ? 6 : -6) * (1 - kk));
      x += ws[i] + gap; k++;
    });
    if (li === 2) {
      const te = 0.75 + k * 0.11 + 0.15;
      const es = size * 1.05;
      s += emoji('🥐', x + es / 2, y0 + li * lh, size * 0.95, pop(t, te, 0.5) * (1 + 0.06 * Math.sin(t * 5)), 10 * Math.sin(t * 4));
      s += emoji('👀', x + es * 1.5 + 6, y0 + li * lh, size * 0.95, pop(t, te + 0.2, 0.5), 0);
    }
  });
  // destellos alrededor de los emojis
  const te2 = 0.75 + 12 * 0.11 + 0.35;
  s += sparkle(960, 250, 30, pop(t, te2, 0.4) * (1 + 0.2 * Math.sin(t * 14)));
  s += sparkle(120, 330, 24, pop(t, te2 + 0.1, 0.4) * (1 + 0.2 * Math.sin(t * 12 + 1)));
  // latido final del texto
  return s;
};
