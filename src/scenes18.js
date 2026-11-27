/* Vídeo 18 — «Pedro y la ITV». Escenas sobre lib.js + series.js + v04…v17.js + v18.js.
   Todo se calcula a partir de (t local de la escena, T global). Duraciones, momentos (cues) y textos se leen de
   config18.json. Franja de subtítulos (y ≥ 1400) libre de textos y de elementos importantes; margen superior hasta
   y=192 (10 %). Cortes secos entre escenas; textos con rebote. Sin audio ni subtítulos (segunda pasada). */
'use strict';

const S = {};
const comicZoom = (u, from = 1.12) => lerp(from, 1, easeOut(u / 0.22));
const cues = (sc, def) => Object.assign({}, def, sc.cues || {});
const bumpZ = (t, times, a = 0.03) => 1 + times.reduce((m, t0) => m + (t >= t0 ? a * Math.max(0, damp(t - t0, 14, 6)) : 0), 0);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const TX = (key, def) => (CFG && CFG.textos && CFG.textos[key] !== undefined) ? CFG.textos[key] : def;
const shakeAt = (t, t0, amp = 24) => t >= t0 ? amp * damp(t - t0, 50, 7) : 0;
const easeOutBack = (u, c1 = 1.25) => { u = clamp(u); const c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
// dedo índice hacia arriba en la mano de Pedro (local)
const pointUpItem = (w, x, y) => `<rect x="${f(x - 2)}" y="${f(y - 13)}" width="4.6" height="11" rx="2.3" fill="${P5.skin}" stroke="${INK}" stroke-width="${w(2)}"/>` +
  `<rect x="${f(x - 5.2)}" y="${f(y - 4.6)}" width="10.4" height="9.6" rx="3.6" fill="${P5.skin}" stroke="${INK}" stroke-width="${w(2.2)}"/>`;

// Pedro tras el mostrador: brazos apoyados (o arriba), respiración, parpadeo y gota de sudor
function pedroITV(T, o = {}) {
  const py = itvPedroPy(), sc = ITV.sc;
  const rest = toLocal18(ITV.px, py, sc, ITV.px + 120, ITV.back + 30);
  return Object.assign({
    expr: 'worried', bob: breath18(T), blink: blink18(T), drop: drop18(T), look: [1, 1.2], head: 2 * Math.sin(T * 1.6),
    armF: { ik: rest, side: -1 }, armB: { ik: [rest[0] - 22, rest[1]], side: -1 }
  }, o);
}

/* ---------- 0) HOOK: el mostrador con el sello ya puesto; caja roja «¿SUSPENDES LA ITV / POR LAS RUEDAS?» ---------- */
S[0] = (t, T, sc) => {
  const c = cues(sc, { box: 0.12 });
  const w = itvWorld18(T, pedroITV(T), { col: C.red, str: TX('desf', 'DESFAVORABLE'), k: 1 }, null);
  const z = comicZoom(t, 1.1) * lerp(1, 1.06, easeInOut(seg(t, 0, sc.duration))) * bumpZ(t, [c.box], 0.02);
  const shk = shakeAt(t, c.box + 0.14, 10);
  let s = `<g transform="translate(${f(shk)} ${f(shk * 0.5)})">` + camAt(z, ITV.paperX, ITV.paperY, 560, 850, w) + `</g>`;
  const k = pop(t, c.box, 0.5);
  s += at(540, 1212, k, redSign17(980, 290, [[TX('h1', '¿SUSPENDES LA ITV'), 96, -58], [TX('h2', 'POR LAS RUEDAS?'), 96, 60]]), lerp(-6, -2, clamp(k)));
  return s;
};

/* ---------- golpe de sello (escenas 1 y 6) ---------- */
function stampScene(t, T, sc, o) {
  const hit = o.hit;
  const sp = stampPose18(t, hit);
  const mark = t >= hit ? { col: o.col, str: o.str, k: 1 } : (o.oldMark || null);
  const after = t >= hit;
  const po = pedroITV(T, o.pedro(t, after));
  const w = itvWorld18(T, po, mark, sp);
  // cámara: corte seco, empuje lento y zoom de impacto al sello
  let z = comicZoom(t, 1.1) * lerp(1, 1.04, seg(t, 0, hit));
  if (after) {
    const u = t - hit;
    z = u < 0.1 ? lerp(1.04, o.punch, u / 0.1) : lerp(o.punch, 1.06, easeInOut(seg(u, o.hold, o.hold + 1.0)));
  }
  const shk = shakeAt(t, hit, o.shake);
  const jx = shk * Math.sin(t * 90), jy = shk * 0.6 * Math.cos(t * 77);
  let s = `<g transform="translate(${f(jx)} ${f(jy)})">` + camAt(z, ITV.paperX, ITV.paperY, ITV.paperX, ITV.paperY, w);
  if (after && t < hit + 0.3) s += `<g opacity="${f(1 - seg(t, hit, hit + 0.3))}">${impactLines(ITV.paperX, ITV.paperY, t, 30, 380)}</g>`;
  if (after && t < hit + 0.6) {
    const kp = pop(t, hit, 0.25) * (1 - seg(t, hit + 0.3, hit + 0.6));
    s += puff(ITV.paperX - 260, ITV.paperY + 40, 46, kp) + puff(ITV.paperX + 270, ITV.paperY + 30, 40, kp);
  }
  s += `</g>`;
  // rótulo grande tipo sello con sacudida
  const kb = pop(t, hit + 0.05, 0.45);
  if (o.under) s += o.under(t);
  s += bigStamp18(o.str, o.col, 540 + jx * 0.6, 292 + jy * 0.6, kb, -5, 150);
  return { s, hit, kb };
}

/* ---------- 1) EL SELLO: DESFAVORABLE ---------- */
S[1] = (t, T, sc) => {
  const c = cues(sc, { hit: 1.6, sub: 2.25 });
  const r = stampScene(t, T, sc, {
    hit: c.hit, col: C.red, str: TX('desf', 'DESFAVORABLE'), punch: 1.45, hold: 0.55, shake: 26,
    pedro: (t, after) => after && t < c.hit + 0.55
      ? { expr: 'panic', jit: 0.8 * Math.sin(t * 60), bob: -6 * Math.max(0, damp(t - c.hit, 16, 6)) }
      : { expr: 'worried', look: after ? [1, 0] : [1.2, 1.5] }
  });
  let s = r.s;
  s += strip15(TX('desf2', 'RUEDAS EN MAL ESTADO'), 540, 452, pop(t, c.sub, 0.5), 2, { size: 64, h: 100, w: 780 });
  return s;
};

/* ---------- 2) EN EL COCHE: carretera con paralaje; Pedro preocupado; nube con cuatro ruedas y «?» ---------- */
S[2] = (t, T, sc) => {
  const c = cues(sc, { think: 1.0 });
  let w = roadScene18(T);
  const rot = (T * 700 / 88) * 180 / PI, bob = 3 * Math.sin(t * 17) + 2 * Math.sin(t * 7.3);
  // líneas de velocidad por detrás del coche
  w += `<g opacity="0.5">${speedLinesH(-40, 1050, 150, 4, 60, SW * 0.7)}</g>`;
  const SC = 3.4, ppx = 60, ppy = -345 + (214 - 78) * SC;
  const steer = toLocal18(ppx, ppy, SC, 152, -312);
  const driver = () => {
    let d = `<rect x="-36" y="-420" width="62" height="150" rx="18" fill="#7D838A" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;  // reposacabezas
    d += placeP18(ppx, ppy + bob * 0.4, SC, {
      expr: 'worried', drop: drop18(T), blink: blink18(T, 0.6), look: [1.2, 0], head: 2 * Math.sin(T * 2.1),
      armF: { ik: steer, side: -1 }, armB: { ik: [steer[0] - 4, steer[1] + 3], side: -1 }
    });
    d += `<g transform="rotate(${f(-18 + 4 * Math.sin(t * 2.2))} 152 -312)"><ellipse cx="152" cy="-312" rx="13" ry="44" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.9)}"/><ellipse cx="152" cy="-312" rx="13" ry="44" fill="none" stroke="#3A3434" stroke-width="${f(SW * 0.9)}"/></g>`;
    return d;
  };
  w += car18(540, 1400, 1, { rot, bob, worn: true, driver });
  const head = [540 + 60, 1400 - 345 + bob];
  let s = cam(comicZoom(t, 1.1) * lerp(1, 1.04, easeInOut(seg(t, 0, sc.duration))), 540, 1100, w);
  s += thoughtWheels18(540, 520, pop(t, c.think, 0.55), t, [head[0], head[1] - 20]);
  return s;
};

/* ---------- 3) LA BÚSQUEDA: coche aparcado; móvil grande con el feed; la tarjeta «2x1 EN RUEDAS · TALLER» ---------- */
const PH18 = { X: 430, Y: 232, PW: 600, PH: 1150, hh: 150 };
const FEED18 = ['novedad', 'evento', 'oferta', 'novedad', 'evento', 'TYRE', 'oferta', 'novedad'];
function scroll18(t, c) {
  let y = 0;
  c.flicks.forEach(([a, b, d], i) => {
    const u = seg(t, a, b);
    y += d * (i === c.flicks.length - 1 ? easeOutBack(u, 1.1) : easeOut(u));
  });
  return y;
}
function feedBody18(t, c) {
  return (sx, sy, sw_, sh_) => {
    let g = '';
    const cs = (sw_ - 36) / 290, gap = 26, sc_ = scroll18(t, c);
    let y = sy + 26 - sc_;
    FEED18.forEach((kind, i) => {
      const hgt = (kind === 'TYRE' ? 210 : 150) * cs;
      const cy = y + hgt / 2;
      if (cy > sy - hgt && cy < sy + sh_ + hgt) {
        if (kind === 'TYRE') {
          const kb = t >= c.bingo ? 1 + 0.16 * Math.max(0, damp(t - c.bingo, 12, 5)) + 0.02 * Math.sin((t - c.bingo) * 5) : 1;
          if (t >= c.bingo) {
            g += `<g opacity="${f(0.55 * pop(t, c.bingo, 0.4))}">${rays(sx + sw_ / 2, cy, 14, (t - c.bingo) * 40, C.yel, 900)}</g>`;
          }
          let card = tyreOffer18(t);
          if (t >= c.bingo && t < c.bingo + 0.8) {
            const id = 'sh' + (uid++), bx = lerp(-260, 260, seg(t, c.bingo, c.bingo + 0.7));
            card += `<clipPath id="${id}"><rect x="-145" y="-105" width="290" height="210" rx="22"/></clipPath><g clip-path="url(#${id})"><path d="M${f(bx - 30)} -130 L${f(bx + 20)} -130 L${f(bx - 40)} 130 L${f(bx - 90)} 130Z" fill="#FFFFFF" opacity="0.75"/></g>`;
          }
          if (t >= c.bingo) card = `<rect x="-158" y="-118" width="316" height="236" rx="30" fill="none" stroke="${C.yel}" stroke-width="10" opacity="${f(0.6 + 0.4 * Math.sin((t - c.bingo) * 8))}"/>` + card;
          g += at(sx + sw_ / 2, cy, cs * kb, card);
        } else g += at(sx + sw_ / 2, cy, cs, card15Local(kind, t));
      }
      y += hgt + gap;
    });
    return g;
  };
}
// fondo exterior con el coche aparcado (escenas 3 y 4)
function parked18(T) {
  return roadScene18(T, 0) + car18(250, 1400, 0.62, { worn: true });
}
S[3] = (t, T, sc) => {
  const c = cues(sc, { phoneIn: 0.25, flicks: [[1.0, 2.2, 430], [2.5, 3.8, 440], [4.1, 5.6, 341]], bingo: 5.6 });
  const P = PH18, cardC = [P.X + P.PW / 2, P.Y + 22 + P.hh + (P.PH - 44 - P.hh) / 2];
  let w = parked18(T);
  if (t >= c.bingo) w += `<g opacity="${f(0.35 * pop(t, c.bingo, 0.4))}">${rays(cardC[0], cardC[1], 18, (t - c.bingo) * 20, '#FFFFFF')}</g>`;
  // Pedro de perfil a la izquierda, mirando el móvil; tras el «bingo», ojos grandes
  const SC = 8, px = 250, py = 1420 + (214 - 150) * SC, wow = t >= c.bingo;
  const hop = wow ? -10 * Math.max(0, damp(t - c.bingo, 14, 6)) : 0;
  w += placeP18(px, py, SC, {
    expr: wow ? 'wow' : 'focus', blink: !wow && blink18(T, 1.1), look: [1.4, 0.6],
    bob: breath18(T) + hop, head: wow ? -4 + 2 * Math.sin(T * 3) : 4 + 1.5 * Math.sin(T * 1.7),
    armF: { ik: toLocal18(px, py, SC, 440, 1240), side: -1 }, armB: { ang: 8, bend: -10 }
  });
  w += hedge18(1392, T);
  let s = cam(comicZoom(t, 1.1) * bumpZ(t, [c.bingo], 0.03), 540, 900, w);
  // móvil grande que entra por la derecha
  const kp = pop(t, c.phoneIn, 0.6), bob = 6 * Math.sin(T * 1.8);
  const ph = portalPhone(P.X, P.Y + bob, P.PW, P.PH, feedBody18(t, c), { hh: P.hh });
  const pc = [P.X + P.PW / 2, P.Y + P.PH / 2];
  s += `<g transform="translate(${f((1 - kp) * 700)} 0) rotate(${f((1 - kp) * 12)} ${pc[0]} ${pc[1]})">${ph}`;
  // pulgar que desliza el feed
  const fl = c.flicks.find(([a]) => t >= a - 0.25 && t < a + 0.45);
  const sw = fl ? Math.sin(seg(t, fl[0] - 0.25, fl[0] + 0.45) * PI) : 0;
  const tip = [470 + 40 * sw, 1250 - 200 * sw + bob];
  s += `<g transform="rotate(-24 ${f(tip[0])} ${f(tip[1] + 120)})"><rect x="${f(tip[0] - 46)}" y="${f(tip[1] - 40)}" width="92" height="230" rx="46" fill="${P5.skin}" ${st18(1)}/><rect x="${f(tip[0] - 26)}" y="${f(tip[1] - 24)}" width="52" height="48" rx="18" fill="#FFE3D2" ${st18(0.5)}/></g>`;
  s += `<circle cx="${f(tip[0] - 60)}" cy="${f(1450 + bob)}" r="96" fill="${P5.skin}" ${st18(1)}/>`;
  s += `</g>`;
  // destello rojo, chispas y confeti de estrellas
  if (t >= c.bingo) {
    const u = t - c.bingo;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy], i) => { s += sparkle(cardC[0] + dx * 300, cardC[1] + dy * 220, 46, pop(t, c.bingo + 0.05 * i, 0.4) * (0.85 + 0.15 * Math.sin(u * 9 + i))); });
    s += sparkle(px + 150, 680, 34, pop(t, c.bingo + 0.25, 0.4) * (0.8 + 0.2 * Math.sin(u * 7)), C.yel);
    s += starConfetti18(u, cardC[0], cardC[1]);
    if (u < 0.35) s += `<rect width="${W}" height="${H}" fill="${C.red}" opacity="${f(0.55 * (1 - u / 0.35))}"/>`;
  }
  return s;
};

/* ---------- 4) LA LLAMADA: móvil al oído; llamada saliente al taller; «¡Claro!» ---------- */
S[4] = (t, T, sc) => {
  const c = cues(sc, { phone: 0.2, ans: 3.0, claro: 3.25, talk: [[1.0, 2.7]] });
  let w = parked18(T);
  const SC = 8.5, px = 330, py = 1420 + (214 - 150) * SC;
  const talking = c.talk.some(([a, b]) => t >= a && t < b), happy = t >= c.claro + 0.2;
  const hop = happy ? -12 * Math.max(0, damp(t - c.claro - 0.2, 14, 6)) : 0;
  w += placeP18(px, py, SC, {
    expr: happy ? 'grin' : (talking ? 'talk' : 'normal'), talk: talkA(t, c.talk, 11), smile: 0.3, blink: blink18(T, 0.4),
    bob: breath18(T) + hop, head: 3 * Math.sin(T * 1.8) + (happy ? -3 : 0), look: [1, -0.4],
    armB: { ik: [181, 93], side: 1 }, front: earPhone18,
    armF: happy ? { ang: -20 - 10 * Math.max(0, damp(t - c.claro - 0.2, 12, 5)), bend: -95 } : { ang: 10 + (talking ? 12 * Math.sin(t * 5) : 0), bend: -40 }
  });
  w += hedge18(1392, T);
  // ondas de llamada junto a la oreja
  let s = cam(comicZoom(t, 1.1) * bumpZ(t, [c.claro], 0.025), 540, 960, w);
  if (t < c.ans) for (let i = 0; i < 3; i++) {
    const q = (t * 1.4 + i / 3) % 1, ex = px - 14 * SC, ey = 1420 - 70 * SC;
    s += `<path d="M${f(ex - 60 - q * 70)} ${f(ey - 50 - q * 40)} Q${f(ex - 100 - q * 90)} ${ey} ${f(ex - 60 - q * 70)} ${f(ey + 50 + q * 40)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.1)}" stroke-linecap="round" opacity="${f(1 - q)}"/>`;
  }
  // pantalla de llamada saliente
  const kp = pop(t, c.phone, 0.55), X = 590, Y = 440 + 6 * Math.sin(T * 1.9);
  s += `<g transform="translate(${f((1 - kp) * 600)} 0) rotate(${f((1 - kp) * 10)} 800 840)">${callPhone18(X, Y, 420, 800, t, c.ans)}</g>`;
  s += sayBubble18(790, 300, pop(t, c.claro, 0.5), TX('claro', '¡Claro!'), { size: 112, tail: 'down-left', rot: 3 });
  if (happy) s += sparkle(px + 180, 700, 32, pop(t, c.claro + 0.3, 0.4) * (0.85 + 0.15 * Math.sin(t * 8)), C.yel) + sparkle(1010, 220, 26, pop(t, c.claro + 0.1, 0.4));
  return s;
};

/* ---------- 5) EL TALLER: el mecánico cambia las ruedas (plano A); Pedro sale feliz con el pulgar arriba (plano B) ---------- */
const CARL = { cx: 540, gy: 1060, k: 0.95 };
const HUB = [CARL.cx + CAR18.front[0] * CARL.k, CARL.gy + CAR18.front[1] * CARL.k], WR = CAR18.r * CARL.k;
S[5] = (t, T, sc) => {
  const c = cues(sc, { cut: 5.0, loosen: [0.2, 0.9], pull: [0.9, 1.4], drop: [1.4, 2.1], bring: [2.0, 2.6], mount: [2.6, 3.1], tight: [3.1, 4.2] });
  if (t >= c.cut) return shot5B(t - c.cut, T, sc);
  let w = tallerRoom18(T);
  w += tallerSign18(540, 290, 560);
  w += poster2x1(180, 560, 280, 1, -5);
  w += pegboard18(760, 400, 260, 190);
  // pila de ruedas nuevas
  [1330, 1248, 1166].forEach((b, i) => { w += stackTyre18(200 + (i === 1 ? 6 : 0), b, 200, 92); });
  w += liftPost18(70, 560, SHOP18.floor) + liftPost18(1010, 560, SHOP18.floor);
  // estado de la rueda delantera
  const MX = 925, MY = SHOP18.floor, MS = 4.4;
  const held = [MX - 105, HUB[1] + 4];
  let wheel = null, mounted = null;  // wheel: {x,y,rot,worn} en el mundo; mounted: rueda montada en el coche
  if (t < c.pull[0]) mounted = { worn: true, rot: 0 };
  else if (t < c.pull[1]) { const u = easeInOut(seg(t, c.pull[0], c.pull[1])); wheel = { x: lerp(HUB[0], held[0], u), y: HUB[1], rot: 0, worn: true }; }
  else if (t < c.drop[1]) {
    const u = seg(t, c.drop[0], c.drop[1]), fy = MY - WR;
    const x = u < 0.3 ? held[0] + 30 * u / 0.3 : lerp(held[0] + 30, 1300, easeInOut((u - 0.3) / 0.7));
    const y = u < 0.3 ? lerp(held[1], fy, (u / 0.3) ** 2) : fy - 20 * Math.abs(Math.sin((u - 0.3) * 6));
    wheel = { x, y, rot: (x - held[0]) / WR * 180 / PI, worn: true };
  }
  if (t >= c.bring[0] && t < c.mount[1]) {
    const u = seg(t, c.bring[0], c.bring[1]), v = easeInOut(seg(t, c.mount[0], c.mount[1]));
    const bx = t < c.bring[1] ? lerp(1250, held[0], easeOut(u)) : lerp(held[0], HUB[0], v);
    wheel = { x: bx, y: held[1] - (t < c.bring[1] ? 0 : 4 * (1 - v)), rot: 0, worn: false };
  }
  if (t >= c.mount[1]) mounted = { worn: false, rot: 0 };
  const frontSvg = mounted ? wheel18(CAR18.front[0], CAR18.front[1], CAR18.r, mounted.rot, mounted.worn) : '';
  w += liftArm18(70, 250, 966) + liftArm18(1010, 830, 966);
  w += car18(CARL.cx, CARL.gy, CARL.k, { rot: 0, worn: false, noFront: true, frontSvg });
  // mecánico (mira a la izquierda)
  const loosen = t >= c.loosen[0] && t < c.loosen[1], tight = t >= c.tight[0] && t < c.tight[1];
  const holding = wheel && (t < c.drop[0] + 0.1 || t >= c.bring[0]);
  const L = (wx, wy) => toLocal18(MX, MY, MS, wx, wy, true);
  let armF, armB, itemF = null;
  if (loosen || tight) {
    const a = (t - (loosen ? c.loosen[0] : c.tight[0])) * (loosen ? -520 : 520);
    const hp = [HUB[0] + 26 * Math.cos(a * PI / 180), HUB[1] + 26 * Math.sin(a * PI / 180)];
    armF = { ik: L(hp[0], hp[1]), side: 1 }; itemF = wrenchItem18(a * 0.15 - 60);
    armB = { ik: L(HUB[0] + 80, HUB[1] - 70), side: 1 };
  } else if (holding) {
    armF = { ik: L(wheel.x + 20, wheel.y - WR * 0.75), side: 1 }; armB = { ik: L(wheel.x + 30, wheel.y + WR * 0.7), side: -1 };
  } else if (t >= c.tight[1]) {
    armF = { ik: [222, 90], side: -1 }; itemF = thumbItem; armB = { ang: 6, bend: -20 };
  } else { armF = { ang: 20, bend: -30 }; armB = { ang: 10, bend: -20 }; }
  const busy = loosen || tight || holding;
  w += shadowEll(MX, MY + 4, 120);
  w += placeMech18(MX, MY, MS, {
    flip: true, expr: busy ? 'focus' : 'smile', blink: blink18(T, 0.9), bob: breath18(T) + (holding ? 1.5 : 0),
    head: busy ? 6 : -2 + 2 * Math.sin(T * 2), armF, armB, itemF
  });
  // rueda suelta (en las manos o rodando)
  if (wheel) w += wheel18(wheel.x, wheel.y, WR, wheel.rot, wheel.worn);
  if (wheel && holding) {
    const fa = toWorldM(MX, MY, MS, armF, [207, 108]), ba = toWorldM(MX, MY, MS, armB, [173, 108]);
    w += `<circle cx="${f(fa[0])}" cy="${f(fa[1])}" r="${f(4.5 * MS)}" fill="${P5.skin}" ${st18(0.75)}/><circle cx="${f(ba[0])}" cy="${f(ba[1])}" r="${f(4.5 * MS)}" fill="${P5.skin}" ${st18(0.75)}/>`;
  }
  // chispas al apretar / aflojar
  if (loosen || tight) for (let i = 0; i < 3; i++) {
    const q = ((t * 3 + i / 3) % 1);
    w += sparkle(HUB[0] - 60 + 120 * hash(i + Math.floor(t * 3)), HUB[1] - 70 - 60 * q, 22 * (1 - q) + 6, 1, i % 2 ? C.yel : '#FFFFFF');
  }
  if (t >= c.tight[1]) w += sparkle(HUB[0] - 40, HUB[1] - 50, 40, pop(t, c.tight[1], 0.4) * (0.8 + 0.2 * Math.sin(t * 9)));
  return cam(comicZoom(t, 1.1) * bumpZ(t, [c.mount[1], c.tight[1]], 0.02), 540, 960, w);
};
// mano del mecánico en el mundo (flip = true)
function toWorldM(px, py, sc, a, S0) {
  const H0 = a && a.ik ? armJoints(S0, a).H : S0;
  return [px - (H0[0] - 190) * sc, py + (H0[1] - 214) * sc];
}
function shot5B(u, T, sc) {
  let w = tallerRoom18(T);
  w += poster2x1(540, 400, 480, 1, -4);
  w += pegboard18(-60, 560, 220, 200);
  [1330, 1248].forEach(b => { w += stackTyre18(960, b, 200, 92); });
  const SC = 5.2, foot = 1380, walkEnd = 0.8;
  const px = lerp(160, 520, easeOut(seg(u, 0, walkEnd)));
  const walking = u < walkEnd;
  const pw = walking ? pedroWalk(u, 0.55, 1) : { legF: 0, legB: 0, bob: 0 };
  const thumb = u >= walkEnd + 0.1;
  w += shadowEll(px, foot + 4, 120);
  w += placeP18(px, foot, SC, {
    legF: pw.legF, legB: pw.legB, bob: pw.bob + breath18(T) - (thumb ? 8 * Math.max(0, damp(u - walkEnd - 0.1, 14, 6)) : 0),
    expr: 'grin', blink: blink18(T, 0.2), head: thumb ? -3 + 2 * Math.sin(T * 2.4) : 0, lean: walking ? 3 : 0, look: [0.4, 0],
    armF: thumb ? { ik: [234, 98], side: 1 } : { ang: pw.legF ? -pw.legF * 0.7 : 0, bend: -14 },
    armB: { ang: walking ? pw.legF * 0.7 : 4, bend: -14 },
    itemF: thumb ? thumbItem : null
  });
  let s = cam(comicZoom(u, 1.12) * lerp(1, 1.05, easeInOut(seg(u, 0, 3))), 540, 960, w);
  if (thumb) {
    const k = pop(u, walkEnd + 0.15, 0.4) * (0.85 + 0.15 * Math.sin(u * 9));
    s += sparkle(px + 160, 760, 40, k, C.yel) + sparkle(px - 140, 620, 30, k) + sparkle(px + 250, 940, 24, k);
  }
  return s;
}

/* ---------- 6) EL SELLO VERDE: FAVORABLE ---------- */
S[6] = (t, T, sc) => {
  const c = cues(sc, { hit: 0.8 });
  const r = stampScene(t, T, sc, {
    hit: c.hit, col: K18.okGreen, str: TX('fav', 'FAVORABLE'), punch: 1.3, hold: 0.35, shake: 14,
    under: t => t >= c.hit ? starConfetti18(t - c.hit - 0.05, 540, 330, 18) : '',
    pedro: (t, after) => {
      if (!after) return { expr: 'worried', look: [1.2, 1.5] };
      const u = t - c.hit - 0.15, up = u > 0;
      return {
        expr: up ? 'relief' : 'surprise', bob: breath18(T) - (up ? 10 * Math.abs(Math.sin(u * 5)) * Math.exp(-0.5 * u) : 0),
        armF: up ? { ik: [226, 74 + 2 * Math.sin(u * 10)], side: 1 } : undefined,
        armB: up ? { ik: [154, 74 + 2 * Math.sin(u * 10 + 1)], side: -1 } : undefined,
        head: up ? -4 : 0
      };
    }
  });
  let s = r.s;
  // destellos alrededor del rótulo verde
  if (t >= c.hit) {
    const u = t - c.hit;
    [[90, 200, 44], [990, 210, 38], [140, 420, 30], [960, 400, 34], [540, 120 + 80, 0]].forEach(([x, y, rr], i) => {
      if (!rr) return;
      s += sparkle(x, y, rr, pop(t, c.hit + 0.1 + i * 0.07, 0.4) * (0.7 + 0.3 * Math.sin(u * 8 + i * 1.7)), i % 2 ? C.yel : '#FFFFFF');
    });
  }
  return s;
};

/* ---------- 7) CTA: Pedro a medio cuerpo con espacio arriba; canal de WhatsApp; «COMENTA: CANAL»; enlace ---------- */
S[7] = (t, T, sc) => {
  const c = cues(sc, { card: 0.3, strip: 0.9, link: 1.5 });
  let w = `<rect x="-400" y="-400" width="${W + 800}" height="${H + 800}" fill="#BFE3F2"/>`;
  w += rays(540, 420, 18, t * 6, '#FFFFFF').replace(/<path /g, '<path opacity="0.4" ');
  w += `<rect x="-400" y="1300" width="${W + 800}" height="900" fill="#E4F4FA"/>`;
  const SC = 9, px = 540, py = 1500 + (214 - 150) * SC;
  const up = 3 * Math.sin(t * 4.5);
  w += placeP18(px, py, SC, {
    expr: 'grin', blink: blink18(T, 0.7), bob: breath18(T), head: 2 * Math.sin(T * 1.6), look: [-0.6, 0],
    armF: { ik: [222, 76 + up], side: 1 }, itemF: pointUpItem,
    armB: { ang: 14 + 8 * Math.sin(t * 3), bend: -50 }
  });
  w += `<rect x="-400" y="1530" width="${W + 800}" height="900" fill="#FFFFFF" stroke="${INK}" stroke-width="${f(SW)}"/><rect x="-400" y="1530" width="${W + 800}" height="22" fill="${C.red}"/>`;
  let s = cam(comicZoom(t, 1.12) * bumpZ(t, [c.card, c.strip, c.link], 0.02), 540, 1000, w);
  s += waCard17(540, 282, pop(t, c.card, 0.5), -2);
  s += strip15(TX('comenta', 'COMENTA: CANAL'), 540, 450, pop(t, c.strip, 0.5), 2, { size: 82, h: 118, w: 760 });
  const kl = pop(t, c.link, 0.5);
  if (kl > 0.01) {
    s += at(500, 585, kl, text(TX('enlace', 'Enlace en la descripción'), 0, 0, { size: 50, sw: SW * 1.5, sd: 4 }));
    s += arrowDown17(860, 556, 56, pop(t, c.link + 0.15, 0.45), t);
  }
  return s;
};

/* ---------- 8) CIERRE: pantalla roja, logo blanco con rebote, «Escaparate de Tudela», web ---------- */
S[8] = (t, T, sc) => {
  const c = cues(sc, { logo: 0, sub: 0.4, url: 0.65 });
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 680, 16, t * 8, C.dred);
  const pulse = 1 + 0.03 * Math.sin(t * 2 * PI * 1.1);
  const kl = pop(t, c.logo, 0.5);
  s += at(540, 660, pulse, logoBadge(0, 6 * Math.sin(t * 3), 780, lerp(-10, 0, clamp(kl)), kl, 'logoW'));
  s += bigT(TX('marca', 'Escaparate de Tudela'), 540, 1150, 96, pop(t, c.sub, 0.5) * pulse, -2, { maxW: 960 });
  s += whoPill(TX('web', 'escaparatetudela.es'), 540, 1290, pop(t, c.url, 0.5), { size: 56, col: INK });
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
  for (const [id, url, iw, ih] of logos) {
    const img = new Image(); img.src = url; await img.decode();
    const el = document.createElementNS(ns, 'image');
    el.setAttribute('id', id); el.setAttribute('width', String(iw || 500)); el.setAttribute('height', String(ih || 500));
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
