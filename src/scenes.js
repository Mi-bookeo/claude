/* Vídeo 03 — «Rosa y la cola de pasteles». Escenas sobre lib.js + series.js + rosa.js.
   Todo se calcula a partir de (t local de la escena, T global). Zona de subtítulos (y > 1500) libre. */
'use strict';

const S = {};
const big = (str, x, y, size, k, rot = 0, o = {}) => at(x, y, k, text(str, 0, 0, Object.assign({ size: fit(str, size, o.maxW || 980, o.font || 'B'), sw: SW * 2.3, sd: 9 }, o)), rot);
const TM = { s1: 720, s2: 720, s3: 720, s4: 720, s8: 830, s9: 830 }; // horas (minutos del día)

/* ---------- 1) Fachada a mediodía, calle casi vacía. Reloj por la puerta: 12:00 ---------- */
const BK1 = bakeryGeo(140, 1330, 800, 960);
S[1] = (t, T) => {
  let w = skyClear(T, { band: 860, tm: TM.s1, sx: 935, sy: 250, sr: 56 });
  w += bakeryStreet(BK1, { doorClock: TM.s1, window: 'full', bell: 0 });
  w += ground(1330, 0, { sp: 230 });
  // un único peatón a lo lejos (calle casi vacía)
  const px = lerp(1180, 860, t / 3);
  w += shadowEll(px, 1420, 70) + placeFolk(7, px, 1420, 2.6, Object.assign(walkPose(2 * PI * t / 0.8, 0.8), { flip: true, expr: 'happy', handF: phoneInHand(-14) }));
  const zz = easeOut((t - 1.55) / 0.18), g = BK1.glass;
  let s = cam(zoomIn(t, 0, 1.12, 0.22) * lerp(1, 1.5, zz), lerp(540, g.x + g.w / 2, zz), lerp(1000, g.y + g.h / 2, zz), w);
  s += big('12:00', 540, 270, 200, pop(t, 0.25, 0.55), lerp(-8, -3, pop(t, 0.25, 0.55)), { font: 'G', sw: SW * 2.6, sd: 11 });
  return s;
};

/* ---------- 2) Interior: Rosa mira el reloj, preocupada. «Cierra a las 14:00» ---------- */
S[2] = (t, T) => {
  const lk = easeOut((t - 0.35) / 0.25);
  const wob = t > 0.6 ? 7 * damp(t - 0.6, 20, 2.5) : 0;
  let w = interiorBack(T, { tm: TM.s2, clockWob: wob, clockK: 1 + 0.08 * Math.max(0, damp(t - 0.6, 16, 5)) });
  w += rosaInt(T, { expr: t < 0.55 ? 'happy' : 'worried', look: [lerp(0, 0.9, lk), lerp(0, -1.6, lk)], head: lerp(0, -12, lk), armF: -28, armB: -22 });
  w += vitrina() + counterTop();
  if (t > 0.65) w += mark('!', 470, 560, pop(t, 0.65, 0.35), -12, 150);
  const zz = easeOut((t - 1.3) / 0.16);
  let s = cam(zoomIn(t, 0, 1.12, 0.2) * lerp(1, 1.18, zz), 480, 760, w);
  const l = 'Cierra a las 14:00';
  s += big(l, 540, 280, 125, pop(t, 0.9, 0.55), lerp(-6, -2, pop(t, 0.9, 0.55)));
  return s;
};

/* ---------- 3) Bombilla de idea; mira el móvil; «2x1» con destello ---------- */
S[3] = (t, T) => {
  const up = easeOut((t - 0.8) / 0.25);
  let w = interiorBack(T, { tm: TM.s3 });
  const expr = t < 0.3 ? 'worried' : (t < 1.35 ? 'idea' : 'sparkle');
  w += rosaInt(T, {
    expr, look: up > 0.5 ? [0.9, 1.4] : [0.3, -0.8], head: lerp(-4, 8, up),
    armF: lerp(-28, -42, up), armB: lerp(-22, -85, up) + (up > 0.9 ? 4 * Math.sin(t * 30) : 0), handF: up > 0.25 ? rosaPhone(-6, true) : null
  });
  w += vitrina() + counterTop();
  const [hx, hy] = rosaToWorld(192, 40);
  w += bulb(hx + 10, hy - 85, 50, pop(t, 0.3, 0.45), t);
  let s = cam(1.28 * zoomIn(t, 0, 1.12, 0.2), 690, 860, w);
  // «2x1» enorme con destello
  const k = pop(t, 1.35, 0.5);
  if (k > 0) {
    const fl = clamp(1 - (t - 1.35) / 0.12);
    if (fl > 0) s += `<rect width="${W}" height="${H}" fill="#FFFFFF" opacity="${f(0.85 * fl)}"/>`;
    let g = burst(0, 0, 250, t * 25, C.yel);
    g += text('2x1', 0, 4, { size: 250, font: 'B', fill: C.red, sw: SW * 2.8, sd: 12 });
    s += at(330, 560, k, g, lerp(-20, -8, k));
    s += sparkle(115, 360, 44, pop(t, 1.5, 0.4) * (1 + 0.2 * Math.sin(t * 18)));
    s += sparkle(560, 360, 32, pop(t, 1.6, 0.4) * (1 + 0.2 * Math.sin(t * 15 + 1)));
    s += sparkle(130, 800, 30, pop(t, 1.7, 0.4));
  }
  return s;
};

/* ---------- 4) Rosa teclea concentrada; pantalla con la oferta; «Publicar» -> tic verde «Publicada» ---------- */
function offerPhone(X, Y, PW, PH, u) {
  const R = 70, b = 24, sx = X + b, sy = Y + b, sw_ = PW - 2 * b, sh = PH - 2 * b;
  const id = 'op' + (uid++), st = (v = 1) => `stroke="${INK}" stroke-width="${f(SW * v)}" stroke-linejoin="round"`;
  let g = `<rect x="${X + 18}" y="${Y + 18}" width="${PW}" height="${PH}" rx="${R}" fill="${INK}"/>`;
  g += `<rect x="${X}" y="${Y}" width="${PW}" height="${PH}" rx="${R}" fill="${INK}" ${st()}/>`;
  g += `<clipPath id="${id}"><rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="${R - b}"/></clipPath>`;
  let sc = `<rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" fill="${C.cream}"/>`;
  // franja roja con el logo
  const hh = 190;
  sc += `<rect x="${sx}" y="${sy}" width="${sw_}" height="${hh}" fill="${C.red}"/><line x1="${sx}" y1="${sy + hh}" x2="${sx + sw_}" y2="${sy + hh}" ${st()}/>`;
  sc += `<circle cx="${sx + 96}" cy="${sy + hh / 2 + 6}" r="66" fill="#FFFFFF" ${st(0.8)}/>` + logoIcon(sx + 96, sy + hh / 2 + 8, 118);
  const tw = sw_ - 200;
  sc += text('Escaparate', sx + 182, sy + hh / 2 - 22, { size: fit('Escaparate', 58, tw), anchor: 'start', sw: SW * 1.4, sd: 4 });
  sc += text('de Tudela', sx + 182, sy + hh / 2 + 38, { size: fit('Escaparate', 58, tw), anchor: 'start', sw: SW * 1.4, sd: 4 });
  // tarjeta de la oferta
  const cx0 = sx + 28, cy0 = sy + hh + 32, cw = sw_ - 56, ch = 690, kc = pop(u, 0.05, 0.45);
  let cd = panel(cx0, cy0, cw, ch, 36, '#FFFFFF', 10);
  const ix = cx0 + 22, iy = cy0 + 22, iw = cw - 44, ih = 300;
  cd += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" rx="26" fill="${C.glass}" ${st(0.8)}/>`;
  for (let yy = iy + 22; yy < iy + ih - 10; yy += 30) for (let xx = ix + 22; xx < ix + iw - 10; xx += 30) cd += `<circle cx="${xx}" cy="${yy}" r="3.5" fill="#FFFFFF"/>`;
  cd += `<rect x="${ix + 40}" y="${iy + ih - 62}" width="${iw - 80}" height="22" rx="11" fill="${C.navy}" ${st(0.8)}/>`;
  const kp = pop(u, 0.15, 0.4);
  cd += at(ix + iw * 0.24, iy + ih - 62, kp, pastry('tarta', 0, 0, 3.6));
  cd += at(ix + iw * 0.47, iy + ih - 62, pop(u, 0.22, 0.4), pastry('cupcake', 0, 0, 3.6));
  cd += at(ix + iw * 0.7, iy + ih - 62, pop(u, 0.29, 0.4), pastry('palmera', 0, 0, 3.4));
  // sello rojo 2x1
  cd += at(cx0 + cw - 92, cy0 + 90, pop(u, 0.35, 0.45), burst(0, 0, 86, 0, C.red) + text('2x1', 0, 2, { size: 76, font: 'B', sw: SW * 1.8, sd: 5 }), -12);
  // etiqueta «Oferta flash · termina hoy»
  const ly = cy0 + 352, kl = pop(u, 0.45, 0.4);
  const lab = 'Oferta flash · termina hoy';
  cd += at(cx0 + cw / 2, ly + 38, kl, `<rect x="${f(-iw / 2)}" y="-38" width="${iw}" height="76" rx="22" fill="${C.yel}" ${st(0.9)}/>` +
    `<path d="M${f(-iw / 2 + 30)} -22 l-14 26 h14 l-8 22 l24 -32 h-14 l10 -16z" fill="${C.red}" ${st(0.6)}/>` +
    text(lab, 18, 2, { size: fit(lab, 46, iw - 90), fill: INK, stroke: null }));
  // «Hasta las 14:00» tecleado
  const full = 'Hasta las 14:00', n = Math.floor(clamp((u - 0.55) / 0.5) * full.length + 1e-6);
  const typed = full.slice(0, n), ts = 76;
  if (n > 0) cd += text(typed, cx0 + 44, cy0 + 480, { size: ts, fill: INK, stroke: null, anchor: 'start' });
  if (u < 1.2 && Math.floor(u * 4) % 2 === 0) cd += `<rect x="${f(cx0 + 50 + measure(typed, ts))}" y="${cy0 + 445}" width="7" height="70" fill="${C.red}"/>`;
  // botones genéricos «Llamar» y «WhatsApp»
  const by = cy0 + 560, bw = (cw - 66) / 2, bh = 96, kbt = pop(u, 0.8, 0.4);
  const btn = (x, label, fill, fg, icon) => at(x + bw / 2, by + bh / 2, kbt, `<rect x="${f(-bw / 2 + 6)}" y="${f(-bh / 2 + 6)}" width="${f(bw)}" height="${bh}" rx="${bh / 2}" fill="${INK}"/><rect x="${f(-bw / 2)}" y="${f(-bh / 2)}" width="${f(bw)}" height="${bh}" rx="${bh / 2}" fill="${fill}" ${st(0.9)}/>` + icon(-bw / 2 + 52) +
    text(label, 26, 2, { size: fit(label, 46, bw - 110), fill: fg, stroke: fg === '#FFFFFF' ? INK : null, sw: SW, sd: fg === '#FFFFFF' ? 3 : 0, shadow: fg === '#FFFFFF' }));
  const handset = x => `<path d="M${x - 16} -16 q-6 18 10 32 q14 12 24 6 l4 -10 l-12 -8 l-6 6 q-10 -6 -14 -16 l6 -6 l-6 -12z" fill="${INK}"/>`;
  const chatB = x => `<path d="M${x - 20} -16 h40 q8 0 8 8 v18 q0 8 -8 8 h-24 l-14 12 v-12 q-10 0 -10 -8 v-18 q0 -8 8 -8z" fill="#FFFFFF" ${st(0.7)}/><circle cx="${x - 10}" cy="-2" r="3" fill="${INK}"/><circle cx="${x}" cy="-2" r="3" fill="${INK}"/><circle cx="${x + 10}" cy="-2" r="3" fill="${INK}"/>`;
  cd += btn(cx0 + 22, 'Llamar', '#FFFFFF', INK, handset);
  cd += btn(cx0 + 44 + bw, 'WhatsApp', C.green, '#FFFFFF', chatB);
  sc += at(cx0 + cw / 2, cy0 + ch / 2, kc, `<g transform="translate(${f(-(cx0 + cw / 2))} ${f(-(cy0 + ch / 2))})">${cd}</g>`);
  // botón Publicar -> Publicada
  const px0 = sx + 28, py0 = cy0 + ch + 34, pw = sw_ - 56, ph = 150;
  const press = u > 1.32 && u < 1.48 ? 0.93 : 1, done = u >= 1.45, kpb = pop(u, 0.95, 0.45) * press * (done ? 1 + 0.08 * Math.max(0, damp(u - 1.45, 14, 5)) : 1);
  let pb = `<rect x="${f(-pw / 2 + 10)}" y="${f(-ph / 2 + 10)}" width="${pw}" height="${ph}" rx="${ph / 2}" fill="${INK}"/>`;
  pb += `<rect x="${f(-pw / 2)}" y="${f(-ph / 2)}" width="${pw}" height="${ph}" rx="${ph / 2}" fill="${done ? C.green : C.red}" ${st()}/>`;
  if (!done) pb += text('Publicar', 0, 2, { size: 82, sw: SW * 1.9, sd: 5 });
  else pb += checkCircle(-pw / 2 + 92, 0, 50, pop(u, 1.45, 0.4)) + text('Publicada', 44, 2, { size: 82, sw: SW * 1.9, sd: 5 });
  sc += at(px0 + pw / 2, py0 + ph / 2, kpb, pb);
  g += `<g clip-path="url(#${id})">${sc}</g>`;
  g += `<rect x="${sx}" y="${sy}" width="${sw_}" height="${sh}" rx="${R - b}" fill="none" ${st(0.8)}/>`;
  g += `<rect x="${X + PW / 2 - 60}" y="${Y + 8}" width="120" height="11" rx="5" fill="#3A3434"/>`;
  return { svg: g, btn: [px0 + pw / 2, py0 + ph / 2, pw, ph], done };
}
function finger(x, y, rot = -8) { // dedo índice que llega desde la derecha y pulsa
  const st = `stroke="${INK}" stroke-width="${f(SW)}" stroke-linejoin="round"`;
  return at(x, y, 1, `<path d="M0 -26 Q-34 -26 -34 0 Q-34 26 0 26 H120 Q150 26 170 50 L420 60 V-90 L170 -60 Q150 -26 120 -26Z" fill="${C.skin}" ${st}/>
    <path d="M-20 -14 Q-28 0 -20 14 L-4 14 Q2 0 -4 -14Z" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW * 0.6)}"/>
    <path d="M70 -26 Q76 0 70 26 M150 -40 Q140 0 156 40" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.6)}" stroke-linecap="round"/>
    <path d="M170 50 L420 60 V-90 L170 -60" fill="${C.red}" ${st}/>`, rot);
}
S[4] = (t, T, sc) => {
  const cut = (sc && sc.cut) || 1.1;
  if (t < cut) {
    const ty = 5 * Math.sin(t * 38), ty2 = 5 * Math.sin(t * 38 + PI);
    let w = interiorBack(T, { tm: TM.s4 });
    w += rosaInt(T, { expr: 'focus', look: [1, 1.5], head: 9, armF: -40 + ty, armB: -88 + ty2, handF: rosaPhone(-4, true) });
    w += vitrina() + counterTop();
    // marcas de tecleo
    const [px, py] = rosaToWorld(222, 120);
    for (let i = 0; i < 3; i++) if ((Math.floor(t * 10) + i) % 2) w += `<line x1="${f(px - 40 - i * 34)}" y1="${f(py - 90 - (i % 2) * 20)}" x2="${f(px - 62 - i * 40)}" y2="${f(py - 125 - (i % 2) * 20)}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linecap="round"/>`;
    return cam(1.4 * zoomIn(t, 0, 1.1, 0.2), 600, 900, w);
  }
  const u = t - cut;
  let s = `<rect width="${W}" height="${H}" fill="${C.cream}"/>` + rays(540, 880, 18, t * 10, '#F7D3CC');
  const kph = pop(u, 0, 0.35);
  const op = offerPhone(150, 245, 720, 1230, u);
  s += at(510, 860, kph, `<g transform="translate(-510 -860) rotate(-2 510 860)">${op.svg}</g>`);
  // destellos al publicar
  if (op.done) {
    const k = pop(u, 1.45, 0.4);
    const [bx, by] = op.btn;
    [[-410, -30], [410, -40], [-330, 120], [330, 125], [-60, 135], [150, 140]].forEach(([dx, dy], i) => {
      s += sparkle(bx + dx, by + dy, 26 + 8 * (i % 2), k * (1 + 0.2 * Math.sin(t * 15 + i)));
    });
  }
  // dedo que pulsa «Publicar»
  const fin = easeOut((u - 1.05) / 0.25), fout = easeInOut((u - 1.6) / 0.25);
  if (fin > 0 && fout < 1) {
    const [bx, by] = op.btn, tx = bx + 120, ty = by + 6;
    const push = u > 1.3 && u < 1.48 ? 14 : 0;
    s += finger(lerp(1250, tx, fin) + lerp(0, 700, fout) - push, ty + push * 0.5);
  }
  // viñeta redonda con Rosa: concentrada y luego satisfecha
  const ki = pop(u, 0.15, 0.45);
  if (ki > 0) {
    const cid = 'in' + (uid++), cx = 880, cy = 330, r = 150;
    let inner = `<circle cx="${cx + 10}" cy="${cy + 10}" r="${r}" fill="${INK}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFFFFF"/>`;
    inner += `<clipPath id="${cid}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><g clip-path="url(#${cid})">${rays(cx, cy, 12, t * 20, C.glass)}`;
    const done = u > 1.5;
    inner += placeRosa(cx + 5, cy + 40, 190, 100, 4.5, {
      flip: true, expr: done ? (u > 2.3 && u < 2.45 ? 'wink' : 'smile') : 'focus', look: done ? [0.6, -0.4] : [1, 1.5], head: done ? -4 : 8, blink: blinkAt(T), noLegs: true,
      bob: breath(T), armF: done ? -150 : -40, handF: done ? thumbUp : rosaPhone(-4, true), armB: -80
    });
    inner += `</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.1)}"/>`;
    s += at(cx, cy, ki, `<g transform="translate(${-cx} ${-cy})">${inner}</g>`, lerp(8, 0, ki));
  }
  return cam(zoomIn(u, 0, 1.15, 0.2), 540, 860, s);
};

/* ---------- 5) Calle: los móviles vibran a la vez; todos los miran con ojos brillantes ---------- */
const S5 = { foot: 1440, sc: 4.15, xs: [150, 405, 660, 920], who: [0, 1, 2, 3] };
S[5] = (t, T) => {
  let s = skyClear(T, { band: 860, tm: 724, sx: 950, sy: 225, sr: 50 });
  s += street(260, { w: 440, h: 760, g: 50, base: 1300 });
  s += ground(1300, 260, { sp: 220 });
  let w = '';
  S5.xs.forEach((x, i) => {
    const dt = i * 0.03, vib = t > 0.3 + dt && t < 0.95 + dt, up = easeOut((t - 0.95 - dt) / 0.22);
    const shake = vib ? 1.6 * Math.sin(t * 90 + i) : 0;
    const p = FOLK[S5.who[i]];
    const flip = i >= 2;
    const o = {
      flip, expr: up > 0.4 ? 'sparkle' : (vib ? 'surprise' : 'happy'), look: up > 0.4 ? [1, 1.4] : [0.4, 0], head: lerp(0, 10, up),
      armF: lerp(-22, -95, up) + (vib ? 4 * Math.sin(t * 70 + i) : 0), handF: phoneInHand(lerp(-14, -8, up), shake, up > 0.3),
      bob: up > 0 ? -3 * Math.max(0, damp(t - 0.95 - dt, 14, 5)) : 0
    };
    if (p.cart) o.armB = 26;
    w += shadowEll(x, S5.foot, 90) + placeFolk(S5.who[i], x, S5.foot, S5.sc, o);
    // posición del móvil en el mundo
    const sc = S5.sc * (p.scale || 1);
    const [hx, hy] = handAt([202, 108], o.armF);
    const [mx, my] = toWorld(x, S5.foot, 190, 204, sc, hx + 2, hy - 8, flip);
    if (vib) {
      w += vibeRings(mx, my, t, 34);
      for (let j = 0; j < 2; j++) if ((Math.floor(t * 14) + j) % 2) w += `<path d="M${f(mx - 70 - j * 14)} ${f(my - 26)} l-14 -14 M${f(mx + 70 + j * 14)} ${f(my - 26)} l14 -14" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round"/>`;
    }
    if (up > 0.4) {
      const [ex, ey] = toWorld(x, S5.foot, 190, 204, sc, 212, 60, flip);
      w += sparkle(ex, ey - 30, 24, pop(t, 1.15 + dt, 0.35) * (1 + 0.2 * Math.sin(t * 16 + i)));
    }
  });
  s += w;
  s = cam(zoomIn(t, 0, 1.12, 0.2), 540, 1100, s);
  const k1 = pop(t, 0.5, 0.5), k2 = pop(t, 0.7, 0.5);
  s += big('Y la gente se entera', 540, 330, 120, k1, lerp(-6, -2, k1));
  s += big('al momento', 540, 470, 140, k2, lerp(6, 2, k2));
  return s;
};

/* ---------- 6) Todos corren a la panadería; la cola crece y dobla la esquina; reloj 12:05 -> 12:30 ---------- */
const BK6 = bakeryGeo(470, 1240, 580, 760);
const SLOTS6 = [];
[745, 660, 575, 490, 405, 320, 235, 150].forEach(x => SLOTS6.push({ x, y: 1262, sc: 3.2, flip: false }));
SLOTS6.push({ x: 82, y: 1340, sc: 3.45, flip: false }, { x: 198, y: 1414, sc: 3.7, flip: true }, { x: 345, y: 1470, sc: 3.95, flip: true }, { x: 500, y: 1498, sc: 4.1, flip: true });
const WHO6 = [3, 1, 2, 0, 4, 6, 5, 8, 9, 7, 10, 11];
S[6] = (t, T, sc) => {
  const dur = (sc && sc.duration) || 4;
  const tm = t < dur * 0.33 ? 725 : (t < dur * 0.66 ? 735 : 750);
  const tChange = t < dur * 0.33 ? 0 : (t < dur * 0.66 ? dur * 0.33 : dur * 0.66);
  let s = skyClear(T, { band: 820, tm, sx: 940, sy: 230, sr: 52 });
  // edificios lejanos en la calle lateral (la esquina)
  s += `<path d="M-20 1240 V900 H120 V840 H260 V960 H380 V880 H470 V1240Z" fill="#D7E9F1" stroke="${INK}" stroke-width="${f(SW * 0.7)}" stroke-linejoin="round"/>`;
  s += bakeryStreet(BK6, { left: false, doorClock: undefined, bell: 18 * Math.sin(t * 14) });
  s += ground(1240, 0, { sp: 240 });
  s += poleClock(400, 1250, 600, 78, tm, 1 + 0.25 * Math.max(0, damp(t - tChange, 16, 6)) * (tChange > 0 ? 1 : 0), tChange > 0 ? 8 * damp(t - tChange, 18, 4) : 0);
  // personas: llegadas corriendo y colocadas en su hueco
  const ppl = [];
  SLOTS6.forEach((sl, j) => {
    const tj = j === 0 ? -1 : 0.12 + (j - 1) * 0.27, d = 0.62;
    if (t < tj) return;
    const fromLeft = j % 2 === 1, x0 = fromLeft ? -170 : 1250;
    const u = clamp((t - tj) / d);
    const x = lerp(x0, sl.x, easeOut(u)), y = sl.y + (j < 8 ? 0 : 0);
    let o;
    if (u < 1) {
      o = Object.assign(runPose(t + j * 0.13), { flip: !fromLeft, expr: 'sparkle', handF: phoneInHand(-10, 0, true) });
      if (!fromLeft) o.lean = 10;
    } else {
      const dm = damp(t - tj - d, 14, 5);
      o = { flip: sl.flip, expr: (Math.floor(T * 0.7 + j) % 3) ? 'happy' : 'smile', armF: -24 + 10 * dm, handF: phoneInHand(-14, 0, true), bob: -4 * Math.max(0, dm), head: 2 * Math.sin(T * 2 + j) };
    }
    if (FOLK[WHO6[j]].cart) o.armB = 26;
    ppl.push({ y, x, sc: sl.sc, o, j, run: u < 1, fromLeft });
  });
  ppl.sort((a, b) => a.y - b.y || a.j - b.j);
  ppl.forEach(p => {
    if (p.run) for (let i = 0; i < 3; i++) {
      const yy = p.y - 300 * p.sc / 3.2 + i * 70, len = 150 - 40 * (i % 2), dir = p.fromLeft ? -1 : 1, x0 = p.x + dir * 80;
      s += `<line x1="${f(x0)}" y1="${f(yy)}" x2="${f(x0 + dir * len)}" y2="${f(yy)}" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round"/>`;
    }
    s += shadowEll(p.x, p.y, 70 * p.sc / 3.2) + placeFolk(WHO6[p.j], p.x, p.y, p.sc, p.o);
    if (p.run) s += puff(p.fromLeft ? p.x - 90 : p.x + 90, p.y - 20, 26, clamp(Math.sin(((t * 5 + p.j) % 1) * PI) * 1.3));
  });
  s = cam(zoomIn(t, 0, 1.12, 0.2), 540, 1100, s);
  const k = pop(t, 0.45, 0.55);
  s += big('¡Cola en la puerta!', 540, 390, 135, k * (1 + 0.04 * Math.sin(t * 6)), lerp(-8, -3, k));
  return s;
};

/* ---------- 7) Rosa despacha a toda velocidad; la vitrina se vacía; «¡Siguiente!» ---------- */
const P7 = 0.92, T07 = 0.25;
const Q7 = [{ x: 255, y: 1470 }, { x: 115, y: 1470 }, { x: -25, y: 1470 }];
const cust7 = n => (n + 4) % FOLK.length;
const GONE7 = (() => { const a = {}; let k = 0; for (let i = 0; i < 15; i++) if (i !== 7) a[i] = 0.35 + (k++) * 0.31; return a; })();
S[7] = (t, T, sc) => {
  const n = Math.floor((t - T07) / P7), u = (t - T07 - n * P7) / P7, cs = T07 + n * P7;
  const tm = 750 + 30 * clamp(t / 4.6);
  let w = interiorBack(T, { tm, bell: t > T07 ? 16 * damp(t - cs - 0.3, 18, 4) : 0 });
  // bandejas que vuelan desde el estante
  const sw = Math.sin(2 * PI * t / 0.5);
  const armF = -100 + 48 * sw, armB = -100 - 48 * sw, lean = 4 * Math.sin(2 * PI * t / 0.5 + 0.8);
  w += rosaInt(T, { expr: (Math.floor(t * 2) % 3) ? 'smile' : 'focus', look: [0.8, 0.6], lean, armF, armB, head: 3 * sw, handF: sw > 0.3 ? (ww => cakeBoxL(208, 150, 0.55, ww)) : null });
  // líneas de velocidad alrededor de los brazos
  const [ax, ay] = rosaToWorld(215, 110);
  for (let i = 0; i < 3; i++) w += `<path d="M${f(ax - 40 - i * 30)} ${f(ay - 120 + i * 26)} q-60 60 0 140" fill="none" stroke="${INK}" stroke-width="${f(SW * 0.9)}" stroke-linecap="round"/>`;
  w += vitrina({ gone: i => i === 7 ? 0 : clamp((t - GONE7[i]) / 0.45) });
  w += counterTop({ drawer: n >= 0 ? Math.sin(clamp((u - 0.12) / 0.4) * PI) : 0, boxes: 2, coins: true });
  [[0.55, 0], [2.35, 1], [3.95, 2]].forEach(([t0, i]) => {
    const v = (t - t0) / 0.42;
    if (v < 0 || v > 1) return;
    const x = lerp(1010, 720, v), y = lerp(560, 1040, v) - 260 * 4 * v * (1 - v);
    w += speedLinesH(x + 210, y - 40, 120, 3, 28, SW * 0.8) + tray(x, y, 1.15, lerp(-20, 0, v), i % 2 ? ['magdalena', 'tarta', 'bollo'] : ['bollo', 'palmera', 'cupcake']);
  });
  // clientes: el primero recibe su caja volando, se va; la cola avanza
  const ppl = [];
  if (n < 0) { for (let k = 0; k < 3; k++) ppl.push({ i: cust7(k), x: Q7[k].x, y: Q7[k].y, o: { expr: 'happy', armF: -20, handF: phoneInHand(-14) } }); }
  else {
    const shift = easeInOut((u - 0.3) / 0.35);
    // el que se va, con su caja
    if (u >= 0.3) {
      const v = (u - 0.3) / 0.7;
      ppl.push({ i: cust7(n), x: lerp(Q7[0].x, -320, easeInOut(v)), y: 1494, sc: 4.5, o: Object.assign(walkPose(2 * PI * t / 0.45, 1), { flip: true, expr: 'smile', armF: -32, armB: -26, front: ww => cakeBoxL(226, 146, 1.05, ww) }) });
    } else ppl.push({ i: cust7(n), x: Q7[0].x, y: Q7[0].y, o: { expr: u > 0.22 ? 'wow' : 'sparkle', armF: lerp(-60, -95, clamp(u / 0.2)), armB: -40 } });
    for (let k = 1; k <= 3; k++) {
      const from = Q7[k] || { x: -170, y: 1470 }, to = Q7[k - 1];
      const moving = shift > 0 && shift < 1;
      const o = Object.assign(moving ? walkPose(2 * PI * t / 0.5, 0.9) : {}, { expr: 'happy', armF: -20, handF: phoneInHand(-14, 0, true) });
      if (k === 3 && shift <= 0) continue;
      ppl.push({ i: cust7(n + k), x: lerp(from.x, to.x, shift), y: 1470, o });
    }
  }
  ppl.sort((a, b) => a.y - b.y).forEach(p => {
    const pp = FOLK[p.i]; if (pp.cart) p.o.armB = 26;
    w += shadowEll(p.x, p.y, 92) + placeFolk(p.i, p.x, p.y, p.sc || 4.3, p.o);
  });
  // caja que vuela de Rosa al cliente
  if (n >= 0 && u < 0.3) {
    const v = u / 0.3, x = lerp(560, 445, v), y = lerp(930, 1010, v) - 200 * 4 * v * (1 - v);
    w += speedLinesH(x + 150, y - 70, 110, 3, 30, SW * 0.8) + worldBox(x, y, 3.0, lerp(-25, 0, v));
  }
  let s = cam(zoomIn(t, 0, 1.1, 0.2), 540, 900, w, 3 * Math.sin(t * 41), 2 * Math.cos(t * 37));
  const kk = pop(t, 0.15, 0.5) * (1 + 0.12 * (n >= 0 ? Math.max(0, damp(t - cs, 18, 7)) : 0));
  s += big('¡Siguiente!', 540, 290, 165, kk, -4 + 3 * Math.sin(t * 5), { fill: '#FFFFFF' });
  return s;
};

/* ---------- 8) 13:50. Queda una caja; Marta llega corriendo, derrapa, se la lleva. Rosa gira el cartel: AGOTADO ---------- */
const BK8 = bakeryGeo(240, 1300, 700, 860);
const FOOT8 = 1440;
S[8] = (t, T) => {
  const D = BK8.door, dcx = D.x + D.w / 2;
  const doorOpen = t < 0.9 ? 0 : (t < 2.3 ? clamp((t - 0.9) / 0.12) : clamp(1 - (t - 2.3) / 0.15));
  const boxGone = t > 1.35;
  const flipU = easeInOut((t - 2.55) / 0.4);
  let s = skyClear(T, { band: 860, tm: TM.s8, sx: 945, sy: 235, sr: 52 });
  s += bakeryStreet(BK8, {
    window: boxGone ? 'none' : 'one', open: doorOpen, doorClock: TM.s8, flip: flipU,
    bell: (t > 0.9 ? 16 * damp(t - 0.9, 16, 3) : 0) + (t > 2.3 ? 14 * damp(t - 2.3, 16, 4) : 0), signShake: t > 2.95 ? 7 * damp(t - 2.95, 14, 4) : 0,
    inDoor: (d, dh) => (t > 1.15 && t < 1.62) ? speedLinesH(d.x + d.w * 0.8, d.y + dh * 0.4, d.w * 0.6, 3, 40, SW * 0.8) : ''
  });
  s += ground(1300, 0, { sp: 230 });
  // la última caja desaparece del escaparate con un «pop»
  if (t > 1.35 && t < 1.8) s += burst(BK8.x + BK8.w * 0.27, BK8.wy + 250, 70 * Math.sin(clamp((t - 1.35) / 0.45) * PI), t * 90, C.yel);
  s += poleClock(120, 1300, 560, 92, TM.s8, pop(t, 0.05, 0.45) * (1 + 0.06 * Math.sin(t * 12)), 5 * Math.sin(t * 20));
  // Rosa sale y gira el cartel
  if (t > 1.95) {
    const a = easeOut((t - 1.95) / 0.35);
    const rx = lerp(dcx, 985, a), rsc = lerp(4.0, 4.4, a);
    const reach = easeOut((t - 2.35) / 0.2);
    s += shadowEll(rx, FOOT8, 100);
    s += placeRosa(rx, FOOT8, 190, 208, rsc, {
      flip: true, bob: breath(T), blink: blinkAt(T), expr: t < 3.0 ? 'happy' : 'smile', look: [0.4, 0.6],
      armF: lerp(-10, -38, reach) + (flipU > 0 && flipU < 1 ? -12 * Math.sin(flipU * PI) : 0) + (t > 3.1 ? -112 * easeOut((t - 3.1) / 0.2) : 0),
      handF: t > 3.1 ? thumbUp : null, armB: 6
    });
    if (flipU > 0 && flipU < 1) {
      const sg = BK8.sign;
      s += `<path d="M${f(sg.cx - sg.w * 0.62)} ${f(sg.cy - 30)} A${f(sg.w * 0.62)} ${f(sg.w * 0.3)} 0 0 0 ${f(sg.cx + sg.w * 0.62)} ${f(sg.cy - 30)}" fill="none" stroke="${INK}" stroke-width="${f(SW)}" stroke-linecap="round" stroke-dasharray="26 20"/>`;
    }
    if (t > 2.95) { const sg = BK8.sign; s += sparkle(sg.cx - sg.w * 0.62, sg.cy - 60, 26, pop(t, 2.95, 0.35)); s += sparkle(sg.cx + sg.w * 0.6, sg.cy + 50, 20, pop(t, 3.05, 0.35)); }
  }
  // Marta: carrera, derrape, entra; sale con la caja y se va corriendo
  const MSC = 4.6;
  let mo = null, mx = 0, msc = MSC;
  if (t < 0.55) { mx = lerp(-220, 470, t / 0.55); mo = Object.assign(runPose(t), { expr: 'sparkle' }); }
  else if (t < 0.92) {
    const u = (t - 0.55) / 0.37; mx = lerp(470, 590, easeOut(u)); const rp = runPose(0.55);
    mo = { legF: lerp(rp.legF, -34, u), legB: lerp(rp.legB, 22, u), armF: lerp(rp.armF, -50, u), armB: lerp(rp.armB, -40, u), pony: lerp(70, -10, u), lean: lerp(10, -14, u), expr: 'surprise' };
    const len = u * 240;
    for (let i = 0; i < 2; i++) s += `<line x1="${f(mx + 40 - len)}" y1="${FOOT8 - 6 + i * 16}" x2="${f(mx + 40)}" y2="${FOOT8 - 6 + i * 16}" stroke="${INK}" stroke-width="${f(SW * 0.7)}" stroke-linecap="round"/>`;
    for (let i = 0; i < 4; i++) s += puff(mx - 60 - i * 80, FOOT8 - 26 - i * 14, 42 - i * 5, pop(t, 0.6 + i * 0.06, 0.3));
  } else if (t < 1.15) {
    const u = easeIn((t - 0.92) / 0.23); mx = lerp(590, dcx, u); msc = lerp(MSC, 3.9, u);
    mo = Object.assign(runPose(t), { expr: 'sparkle' });
  } else if (t < 1.62) { mo = null; }
  else if (t < 2.05) {
    const u = easeOut((t - 1.62) / 0.2); mx = lerp(dcx, 600, u); msc = lerp(3.9, MSC, u);
    const hop = Math.abs(Math.sin((t - 1.62) * PI / 0.22)) * 30;
    mo = { expr: 'smile', armF: -32, armB: -26, front: ww => cakeBoxL(226, 146, 1.05, ww), pony: 10 * Math.sin(t * 14), bob: -hop };
  } else {
    const u = (t - 2.05) / 1.35; mx = lerp(600, -260, u);
    mo = Object.assign(runPose(t), { flip: true, expr: 'smile', armF: -32, armB: -26, front: ww => cakeBoxL(226, 146, 1.05, ww) });
  }
  if (mo && mx > -300) {
    if (mo.flip || t > 2.05) for (let i = 0; i < 3; i++) s += `<line x1="${f(mx + 140 + 30 * i)}" y1="${980 + i * 110}" x2="${f(mx + 270 + 40 * i)}" y2="${980 + i * 110}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linecap="round"/>`;
    else if (t < 0.55) for (let i = 0; i < 3; i++) s += `<line x1="${f(mx - 260 - 40 * i)}" y1="${980 + i * 110}" x2="${f(mx - 130 - 20 * i)}" y2="${980 + i * 110}" stroke="${INK}" stroke-width="${f(SW)}" stroke-linecap="round"/>`;
    s += shadowEll(mx, FOOT8, 110 * msc / MSC);
    s += placeMarta(mx, FOOT8, 190, 204, msc, mo);
    if (t > 1.62 && t < 2.6) {
      const [bx, by] = toWorld(mx, FOOT8, 190, 204, msc, 226, 118, !!mo.flip);
      s += sparkle(bx - 80, by - 50, 28, pop(t, 1.7, 0.35) * (1 + 0.2 * Math.sin(t * 16)));
      s += sparkle(bx + 90, by - 20, 20, pop(t, 1.78, 0.35));
    }
  }
  return cam(zoomIn(t, 0, 1.1, 0.2), 540, 1050, s);
};
function easeIn(u) { u = clamp(u); return u * u * u; }

/* ---------- 9) Vitrina vacía, Rosa agotada y feliz, pulgar arriba; lluvia de monedas y confeti ---------- */
S[9] = (t, T) => {
  let w = interiorBack(T, { emptyShelf: true });
  const up = easeOut((t - 0.2) / 0.25);
  w += rosaInt(T, { expr: 'tired', look: [0, 0], lean: 7, armB: -42, armF: lerp(-30, -128, up), handF: up > 0.5 ? thumbUp : null, head: -4, bob: breath(T) * 1.5 });
  w += vitrina({ gone: () => 1 });
  w += counterTop({ boxes: 0, bags: false, drawer: 1, coins: true });
  // lluvia de monedas y confeti (por encima de y=1500)
  const cid = 'rain' + (uid++);
  let r = '';
  for (let i = 0; i < 30; i++) {
    const t0 = 0.15 + hash(i * 3.1) * 1.6, v = 900 + hash(i * 7.7) * 500;
    const y = -60 + (t - t0) * v;
    if (y < -60 || y > 1560) continue;
    const x = 40 + hash(i * 1.9) * 1000 + 30 * Math.sin(t * 3 + i);
    r += i % 3 === 0 ? confetti(x, y, i, t) : coin(x, y, 30 + 8 * hash(i * 5.1), t * 9 + i);
  }
  for (let i = 0; i < 24; i++) {
    const t0 = 0.1 + hash(i * 9.3 + 2) * 1.9, v = 380 + hash(i * 4.4) * 260;
    const y = -40 + (t - t0) * v;
    if (y < -40 || y > 1560) continue;
    r += confetti(30 + hash(i * 2.3 + 1) * 1020 + 60 * Math.sin(t * 2.4 + i), y, i + 1, t);
  }
  w += `<clipPath id="${cid}"><rect x="-200" y="-200" width="${W + 400}" height="1700"/></clipPath><g clip-path="url(#${cid})">${r}</g>`;
  let s = cam(zoomIn(t, 0, 1.12, 0.2), 600, 900, w);
  const k1 = pop(t, 0.35, 0.5), k2 = pop(t, 0.75, 0.5);
  s += big('Vitrina vacía.', 540, 280, 150, k1, lerp(-7, -3, k1));
  s += big('Caja llena.', 540, 430, 165, k2, lerp(7, 2, k2), { fill: C.yel });
  return s;
};

/* ---------- 10) Llamada a la acción con cielo y pájaros + tarjeta final ---------- */
const BIRDS10 = [{ t0: 0.2, d: 3.6, dir: 1, y: 250, a: 34 }, { t0: 1.0, d: 4.0, dir: -1, y: 1440, a: 30 }, { t0: 2.6, d: 3.2, dir: 1, y: 860, a: 26 }];
S[10] = (t, T, sc) => {
  const cut = (sc && sc.cut) || 6;
  if (t < cut) {
    let s = skyClear(T, { band: 1150, tm: 830, sx: 930, sy: 240, sr: 56, clouds: [
      { x0: 60, y: 230, s: 0.75, v: 16 }, { x0: 700, y: 820, s: 0.85, v: 24 }, { x0: 300, y: 1230, s: 0.6, v: 11 },
      { x0: 1250, y: 420, s: 0.9, v: 19 }, { x0: 1650, y: 1350, s: 0.7, v: 14 }] });
    BIRDS10.forEach((b, i) => {
      const u = (t - b.t0) / b.d;
      if (u < 0 || u > 1) return;
      const x = b.dir > 0 ? lerp(-90, W + 90, u) : lerp(W + 90, -90, u);
      const fl = 0.35 + 0.65 * Math.sin(t * 2 * PI / 0.34 + i * 2);
      s += bird(x, Math.min(1450, b.y + Math.sin(u * 7 + i) * 12), b.a, fl);
    });
    const lines = ['¿Te sobra', 'producto a', 'última hora?'];
    lines.forEach((l, i) => { const k = pop(t, 0.15 + i * 0.18, 0.5); s += big(l, 540, 400 + i * 150, 165, k, (i % 2 ? 3 : -3) * (1 - k) - 2); });
    // franja roja
    const ks = pop(t, 1.2, 0.6), l2 = 'Publica una oferta flash';
    let st = `<rect x="-640" y="-82" width="1280" height="164" transform="translate(0 12)" fill="${INK}"/><rect x="-640" y="-82" width="1280" height="164" fill="${C.red}" stroke="${INK}" stroke-width="${f(SW)}"/>`;
    st += text(l2, 0, 2, { size: fit(l2, 100, 940), sw: SW * 2, sd: 6 });
    s += `<g transform="translate(${f(540 + (1 - ks) * -1500)} 930) rotate(-3)">${st}</g>`;
    // «Date de alta en escaparatetudela.es»
    const k3 = pop(t, 2.1, 0.5), k4 = pop(t, 2.35, 0.5), url = 'escaparatetudela.es';
    s += big('Date de alta en', 540, 1135, 112, k3, -2);
    const pulse = t > 3 ? 1 + 0.03 * Math.sin((t - 3) * 2 * PI / 1.2) : 1, us = fit(url, 96, 860);
    s += at(540, 1290, k4 * pulse, `<rect x="-470" y="-74" width="940" height="148" rx="74" transform="translate(12 12)" fill="${INK}"/><rect x="-470" y="-74" width="940" height="148" rx="74" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/>` +
      text(url, 0, 2, { size: us, fill: C.red, stroke: null }));
    return cam(zoomIn(t, 0, 1.1, 0.2), 540, 850, s);
  }
  const u = t - cut;
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 680, 16, t * 8, C.dred);
  // logo solo icono (logo.png) grande y blanco sobre rojo
  const kl = pop(u, 0, 0.45), bob = 6 * Math.sin(u * 3);
  s += at(540, 680 + bob, kl, `<svg x="-380" y="-380" width="760" height="760" viewBox="20 20 460 460"><use href="#logoI"/></svg>`);
  s += at(540, 1140, pop(u, 0.12, 0.45), text('Escaparate', 0, 0, { size: 145, sw: SW * 2.4, sd: 9 }));
  s += at(540, 1280, pop(u, 0.2, 0.45), text('de Tudela', 0, 0, { size: 145, sw: SW * 2.4, sd: 9 }));
  const url = 'escaparatetudela.es', us = fit(url, 70, 680);
  s += at(540, 1418, pop(u, 0.3, 0.45), `<rect x="-370" y="-52" width="760" height="104" rx="52" transform="translate(10 10)" fill="${INK}"/><rect x="-380" y="-52" width="760" height="104" rx="52" fill="${C.dred}" stroke="${INK}" stroke-width="${f(SW)}"/>` + text(url, 0, 2, { size: us, sw: SW * 1.8, sd: 5 }));
  return s;
};

/* ---------- API para el renderizador ---------- */
window.init = async function (cfg, fonts, logos) {
  CFG = cfg;
  const b64ToBuf = b => Uint8Array.from(atob(b), c => c.charCodeAt(0)).buffer;
  for (const [fam, wt, b64] of fonts) {
    const ff = new FontFace(fam, b64ToBuf(b64), { weight: String(wt) });
    await ff.load(); document.fonts.add(ff);
  }
  await document.fonts.ready;
  const defs = document.getElementById('defs');
  const ns = 'http://www.w3.org/2000/svg';
  for (const [id, url] of logos) {
    const img = new Image(); img.src = url; await img.decode();
    const el = document.createElementNS(ns, 'image');
    el.setAttribute('id', id); el.setAttribute('width', '500'); el.setAttribute('height', '500');
    el.setAttribute('href', url);
    defs.appendChild(el);
  }
  return true;
};
window.renderFrame = function (sceneId, t, T) {
  uid = 0;
  const sc = CFG.scenes.find(s => s.id === sceneId);
  document.getElementById('dyn').innerHTML = S[sceneId](t, T, sc);
};
