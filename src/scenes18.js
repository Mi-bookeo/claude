/* Vídeo 18 — «Pedro y la ITV». Escenas sobre lib.js + series.js + v04…v17.js + v18.js.
   Todo se calcula a partir de (t local de la escena, T global). Duraciones, momentos (cues) y textos se leen de
   config18.json. Franja de subtítulos (y ≥ 1400) libre de textos y de elementos importantes; margen superior hasta
   y=192 (10 %). Cortes secos entre escenas; textos con rebote. Personajes de frente y con cuello (pedro_frente.js). Variante TikTok (CFG.variant): sin «comenta». */
'use strict';

const S = {};
const comicZoom = (u, from = 1.12) => lerp(from, 1, easeOut(u / 0.22));
const cues = (sc, def) => Object.assign({}, def, sc.cues || {});
const bumpZ = (t, times, a = 0.03) => 1 + times.reduce((m, t0) => m + (t >= t0 ? a * Math.max(0, damp(t - t0, 14, 6)) : 0), 0);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const TX = (key, def) => (CFG && CFG.textos && CFG.textos[key] !== undefined) ? CFG.textos[key] : def;
const shakeAt = (t, t0, amp = 24) => t >= t0 ? amp * damp(t - t0, 50, 7) : 0;
const easeOutBack = (u, c1 = 1.25) => { u = clamp(u); const c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
const TIKTOK = () => CFG && CFG.variant === 'tiktok';
// boca de Pedro: tramos con voz (config18.json -> talk.pedro, los escribe audio/v18_colocar_voces.py)
const talkOf = sc => (sc && sc.talk && sc.talk.pedro) || [];
const PT = (t, sc) => talkA(t, talkOf(sc), 11);

// Pedro tras el mostrador: brazos apoyados (o arriba), respiración, parpadeo y gota de sudor
function pedroITV(T, o = {}) {
  return Object.assign({
    expr: 'worried', bob: breath18(T), blink: blink18(T), drop: drop18(T), look: [0.8, 1], head: 2 * Math.sin(T * 1.6),
    armF: { h: [212, 140], side: -1, hand: 'fist', hs: 1.2 }, armB: { h: [168, 140], side: 1, hand: 'fist', hs: 1.2 }
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
  const po = pedroITV(T, Object.assign({ talk: PT(t, sc) }, o.pedro(t, after)));
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
      : { expr: 'worried', look: after ? [0, 0] : [1, 1.4] }
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
  const SC = 3.3, ppx = 60, ppy = -345 + (208 - 76) * SC * PFR.tall;
  const sw0 = pfLoc(ppx, ppy, SC, 150, -300);
  const driver = () => {
    let d = `<rect x="-6" y="-420" width="132" height="150" rx="26" fill="#7D838A" stroke="${INK}" stroke-width="${f(SW * 0.8)}"/>`;  // reposacabezas
    d += placePF(ppx, ppy + bob * 0.4, SC, {
      expr: 'worried', talk: PT(t, sc), drop: drop18(T), blink: blink18(T, 0.6), look: [0.6, 0], head: 2 * Math.sin(T * 2.1),
      armF: { h: [sw0[0] - 2, sw0[1] - 6], side: -1, hand: 'fist', hs: 1.2 }, armB: { h: [sw0[0] - 8, sw0[1] + 8], side: -1, hand: 'fist', hs: 1.2 }
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
  // Pedro de frente a la izquierda, mirando el móvil; tras el «bingo», ojos grandes
  const SC = 7.6, px = 250, py = pfFootAtWaist(1420, SC), wow = t >= c.bingo;
  const hop = wow ? -10 * Math.max(0, damp(t - c.bingo, 14, 6)) : 0;
  w += placePF(px, py, SC, {
    expr: wow ? 'wow' : 'focus', talk: PT(t, sc), blink: !wow && blink18(T, 1.1), look: wow ? [0.4, 0] : [1.6, 0.8],
    bob: breath18(T) + hop, head: wow ? -3 + 2 * Math.sin(T * 3) : 4 + 1.5 * Math.sin(T * 1.7),
    armF: { h: pfLoc(px, py, SC, 450, 1250), side: -1, hand: 'fist', hs: 1.2 }
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
  s += `<g transform="rotate(-24 ${f(tip[0])} ${f(tip[1] + 120)})"><rect x="${f(tip[0] - 46)}" y="${f(tip[1] - 40)}" width="92" height="230" rx="46" fill="${C.skin}" ${st18(1)}/><rect x="${f(tip[0] - 26)}" y="${f(tip[1] - 24)}" width="52" height="48" rx="18" fill="#FFE3D2" ${st18(0.5)}/></g>`;
  s += `<circle cx="${f(tip[0] - 60)}" cy="${f(1450 + bob)}" r="96" fill="${C.skin}" ${st18(1)}/>`;
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
  const c = cues(sc, { phone: 0.2, ans: 3.0, claro: 3.25 });
  let w = parked18(T);
  const SC = 8.2, px = 320, py = pfFootAtWaist(1420, SC);
  const talking = talkOf(sc).some(([a, b]) => t >= a && t < b), happy = t >= c.claro + 0.2;
  const hop = happy ? -12 * Math.max(0, damp(t - c.claro - 0.2, 14, 6)) : 0;
  // móvil al oído (mano derecha de la imagen, junto a la oreja); la otra mano gesticula y, tras «¡Claro!», pulgar arriba
  w += placePF(px, py, SC, {
    expr: happy ? 'grin' : (talking ? 'talk' : 'normal'), talk: PT(t, sc), blink: blink18(T, 0.4),
    bob: breath18(T) + hop, head: -3 + 2 * Math.sin(T * 1.8), look: happy ? [0, 0] : [0.8, -0.3],
    armF: { h: [209, 92], side: 1, hand: 'phone', hs: 1.45, hrot: 10 },
    armB: happy ? { h: [160, 96 - 4 * Math.max(0, damp(t - c.claro - 0.2, 12, 5))], side: -1, hand: 'thumb', hs: 1.5 }
      : (talking ? { h: [164 + 3 * Math.sin(t * 6), 126], side: 1, hand: 'open', hs: 1.4, hrot: -20 + 10 * Math.sin(t * 5) } : { h: [168, 140], side: 1, hand: 'fist', hs: 1.2 })
  });
  w += hedge18(1392, T);
  // ondas de llamada junto a la oreja
  let s = cam(comicZoom(t, 1.1) * bumpZ(t, [c.claro], 0.025), 540, 960, w);
  if (t < c.ans) for (let i = 0; i < 3; i++) {
    const q = (t * 1.4 + i / 3) % 1, [ex, ey] = pfPt(px, py, SC, 214, 80);
    s += `<path d="M${f(ex + 30 + q * 50)} ${f(ey - 50 - q * 40)} Q${f(ex + 70 + q * 70)} ${f(ey)} ${f(ex + 30 + q * 50)} ${f(ey + 50 + q * 40)}" fill="none" stroke="${INK}" stroke-width="${f(SW * 1.1)}" stroke-linecap="round" opacity="${f(1 - q)}"/>`;
  }
  // pantalla de llamada saliente
  const kp = pop(t, c.phone, 0.55), X = 590, Y = 440 + 6 * Math.sin(T * 1.9);
  s += `<g transform="translate(${f((1 - kp) * 600)} 0) rotate(${f((1 - kp) * 10)} 800 840)">${callPhone18(X, Y, 420, 800, t, c.ans)}</g>`;
  s += sayBubble18(790, 300, pop(t, c.claro, 0.5), TX('claro', '¡Claro!'), { size: 112, tail: 'down-left', rot: 3 });
  if (happy) s += sparkle(px - 200, 640, 32, pop(t, c.claro + 0.3, 0.4) * (0.85 + 0.15 * Math.sin(t * 8)), C.yel) + sparkle(1010, 220, 26, pop(t, c.claro + 0.1, 0.4));
  return s;
};

/* ---------- 5) EL TALLER: el mecánico cambia las ruedas (plano A); Pedro sale feliz con el pulgar arriba (plano B) ---------- */
const CARL = { cx: 540, gy: 1060, k: 0.95 };
const HUB = [CARL.cx + CAR18.front[0] * CARL.k, CARL.gy + CAR18.front[1] * CARL.k], WR = CAR18.r * CARL.k;
S[5] = (t, T, sc) => {
  const c = cues(sc, { cut: 5.0, loosen: [0.2, 0.9], pull: [0.9, 1.4], drop: [1.4, 2.1], bring: [2.0, 2.6], mount: [2.6, 3.1], tight: [3.1, 4.2] });
  if (t >= c.cut) return shot5B(t - c.cut, T, sc, PT(t, sc));
  let w = tallerRoom18(T);
  w += tallerSign18(540, 290, 560);
  w += poster2x1(180, 560, 280, 1, -5);
  w += pegboard18(760, 400, 260, 190);
  // pila de ruedas nuevas
  [1330, 1248, 1166].forEach((b, i) => { w += stackTyre18(200 + (i === 1 ? 6 : 0), b, 200, 92); });
  w += liftPost18(70, 560, SHOP18.floor) + liftPost18(1010, 560, SHOP18.floor);
  // estado de la rueda delantera
  const MX = 930, MY = SHOP18.floor, MS = 4.3;
  const held = [MX - 115, HUB[1] + 10];
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
  // mecánico de frente, a la derecha del coche; trabaja con las manos hacia su izquierda (la de la imagen)
  const loosen = t >= c.loosen[0] && t < c.loosen[1], tight = t >= c.tight[0] && t < c.tight[1];
  const holding = wheel && (t < c.drop[0] + 0.1 || t >= c.bring[0]);
  const L = (wx, wy) => mfLoc(MX, MY, MS, wx, wy);
  let armF, armB;
  if (loosen || tight) {
    const a = (t - (loosen ? c.loosen[0] : c.tight[0])) * (loosen ? -520 : 520);
    const hp = [HUB[0] + 22 * Math.cos(a * PI / 180), HUB[1] + 22 * Math.sin(a * PI / 180)];
    armB = { h: L(hp[0], hp[1]), side: 1, hand: 'fist', hs: 1.25, item: wrenchItem18(a * 0.15 - 60) };
    armF = { h: [212, 128], side: -1, hand: 'fist', hs: 1.2 };
  } else if (holding) {
    armB = { h: L(wheel.x - 10, wheel.y - WR * 0.8), side: 1, hand: 'none' }; armF = { h: L(wheel.x + WR * 0.6, wheel.y + WR * 0.5), side: -1, hand: 'none' };
  } else if (t >= c.tight[1]) {
    armF = { h: [221, 96], side: 1, hand: 'thumb', hs: 1.5 }; armB = { h: [168, 140], side: 1, hand: 'fist', hs: 1.2 };
  } else { armF = { h: [212, 140], side: -1, hand: 'fist', hs: 1.2 }; armB = { h: [168, 140], side: 1, hand: 'fist', hs: 1.2 }; }
  const busy = loosen || tight || holding;
  w += shadowEll(MX, MY + 4, 120);
  w += placeMF(MX, MY, MS, {
    expr: busy ? 'focus' : 'smile', blink: blink18(T, 0.9), bob: breath18(T) + (holding ? 1.5 : 0),
    head: busy ? -5 : 2 * Math.sin(T * 2), armF, armB, armBFront: loosen || tight
  });
  // rueda suelta (en las manos o rodando) y, encima, las manos que la sujetan
  if (wheel) w += wheel18(wheel.x, wheel.y, WR, wheel.rot, wheel.worn);
  if (wheel && holding) [[PF_SB, armB], [PF_SF, armF]].forEach(([S0, a]) => {
    const H0 = ik2(S0, a.h, a.side, 18).H, [hx, hy] = mfPt(MX, MY, MS, H0[0], H0[1] + breath18(T) + 1.5);
    w += `<circle cx="${f(hx)}" cy="${f(hy)}" r="${f(4.4 * MS)}" fill="${C.skin}" ${st18(0.75)}/>`;
  });
  // chispas al apretar / aflojar
  if (loosen || tight) for (let i = 0; i < 3; i++) {
    const q = ((t * 3 + i / 3) % 1);
    w += sparkle(HUB[0] - 60 + 120 * hash(i + Math.floor(t * 3)), HUB[1] - 70 - 60 * q, 22 * (1 - q) + 6, 1, i % 2 ? C.yel : '#FFFFFF');
  }
  if (t >= c.tight[1]) w += sparkle(HUB[0] - 40, HUB[1] - 50, 40, pop(t, c.tight[1], 0.4) * (0.8 + 0.2 * Math.sin(t * 9)));
  return cam(comicZoom(t, 1.1) * bumpZ(t, [c.mount[1], c.tight[1]], 0.02), 540, 960, w);
};
function shot5B(u, T, sc, talk = 0) {
  let w = tallerRoom18(T);
  w += poster2x1(540, 400, 480, 1, -4);
  w += pegboard18(-60, 560, 220, 200);
  [1330, 1248].forEach(b => { w += stackTyre18(960, b, 200, 92); });
  const SC = 4.9, foot = 1380, walkEnd = 0.8;
  const px = lerp(160, 520, easeOut(seg(u, 0, walkEnd)));
  const walking = u < walkEnd;
  const ph = 2 * PI * u / 0.5, sw = walking ? Math.sin(ph) : 0;
  const thumb = u >= walkEnd + 0.1;
  w += shadowEll(px, foot + 4, 120);
  w += placePF(px, foot, SC, {
    walk: walking ? ph : undefined, bob: (walking ? -2.4 * Math.abs(Math.sin(ph)) : 0) + breath18(T) - (thumb ? 8 * Math.max(0, damp(u - walkEnd - 0.1, 14, 6)) : 0),
    expr: 'grin', talk, blink: blink18(T, 0.2), head: thumb ? -3 + 2 * Math.sin(T * 2.4) : 2 * sw, lean: walking ? 2 : 0,
    armF: thumb ? { h: [222, 96], side: 1, hand: 'thumb', hs: 1.5 } : { h: [211 + 3 * sw, 140], side: -1, hand: 'fist', hs: 1.2 },
    armB: { h: [169 - 3 * sw, 140], side: 1, hand: 'fist', hs: 1.2 }
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
      if (!after) return { expr: 'worried', look: [1, 1.4] };
      const u = t - c.hit - 0.15, up = u > 0;
      return {
        expr: up ? 'relief' : 'surprise', bob: breath18(T) - (up ? 10 * Math.abs(Math.sin(u * 5)) * Math.exp(-0.5 * u) : 0),
        armF: up ? { h: [217, 62 + 2 * Math.sin(u * 10)], side: 1, hand: 'open', hs: 1.45, hrot: 15 } : undefined,
        armB: up ? { h: [163, 62 + 2 * Math.sin(u * 10 + 1)], side: -1, hand: 'open', hs: 1.45, hrot: -15 } : undefined,
        armBFront: up, head: up ? -2 : 0
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

/* ---------- 7) CTA: Pedro a medio cuerpo con espacio arriba; canal de WhatsApp; enlace; «COMENTA: CANAL»;
   al final (solo Instagram) desaparece todo y queda «Comenta / CANAL» en grande (regla del vídeo 16) ---------- */
S[7] = (t, T, sc) => {
  const c = cues(sc, { card: 0.3, link: 0.9, strip: 1.8, com: 4.0 });
  const com = !TIKTOK() && t >= c.com;
  let w = `<rect x="-400" y="-400" width="${W + 800}" height="${H + 800}" fill="#BFE3F2"/>`;
  w += rays(540, 420, 18, t * 6, '#FFFFFF').replace(/<path /g, '<path opacity="0.4" ');
  w += `<rect x="-400" y="1300" width="${W + 800}" height="900" fill="#E4F4FA"/>`;
  const SC = 8.6, px = 540, py = pfFootAtWaist(1530, SC);
  const up = 3 * Math.sin(t * 4.5);
  w += placePF(px, py, SC, {
    expr: com ? 'wow' : 'grin', talk: PT(t, sc), blink: blink18(T, 0.7), bob: breath18(T), head: 2 * Math.sin(T * 1.6),
    armF: { h: [216, 66 + up], side: 1, hand: 'point', dir: -90, hs: 1.45 },
    armB: com ? { h: [162, 70 + up], side: -1, hand: 'open', hs: 1.45, hrot: -15 + 8 * Math.sin(t * 7) } : { h: [166, 126], side: 1, hand: 'open', hs: 1.4, hrot: -20 + 8 * Math.sin(t * 3) }
  });
  w += `<rect x="-400" y="1530" width="${W + 800}" height="900" fill="${C.navy}" stroke="${INK}" stroke-width="${f(SW)}"/><rect x="-400" y="1530" width="${W + 800}" height="22" fill="${C.red}"/>`;
  let s = cam(comicZoom(t, 1.12) * bumpZ(t, [c.card, c.link, c.strip, c.com], 0.02), 540, 1000, w);
  if (com) {
    s += bigT(TX('s5d', 'Comenta'), 540, 290, 160, pop(t, c.com, 0.5), -4);
    s += strip15(TX('s5e', 'CANAL'), 540, 500, pop(t, c.com + 0.18, 0.5), 3, { size: 200, h: 230, w: 720, fill: C.yel });
    return s;
  }
  s += waCard17(540, 270, pop(t, c.card, 0.5), -2);
  const kl = pop(t, c.link, 0.5);
  if (kl > 0.01) {
    s += at(500, 410, kl, text(TX('enlace', 'Enlace en la descripción'), 0, 0, { size: 56, sw: SW * 1.6, sd: 5 }));
    s += arrowDown17(890, 378, 60, pop(t, c.link + 0.15, 0.45), t);
  }
  if (!TIKTOK()) s += strip15(TX('comenta', 'COMENTA: CANAL'), 540, 548, pop(t, c.strip, 0.5), 2, { size: 82, h: 118, w: 760 });
  return s;
};

/* ---------- 8) CIERRE: pantalla roja, logo blanco con rebote, «Escaparate de Tudela», web ---------- */
S[8] = (t, T, sc) => {
  const c = cues(sc, { logo: 0, sub: 0.4, url: 0.65 });
  let s = `<rect width="${W}" height="${H}" fill="${C.red}"/>` + rays(540, 680, 16, t * 8, C.dred);
  const pulse = 1 + 0.03 * Math.sin(t * 2 * PI * 1.1);
  const kl = pop(t, c.logo, 0.5);
  // el nombre va escrito debajo: logo SIN letras (logo.png, icono), sobre disco blanco
  s += at(540, 640 + 6 * Math.sin(t * 3), pulse * kl, `<circle cx="16" cy="16" r="330" fill="${INK}"/><circle r="330" fill="#FFFFFF" ${st18(1.3)}/>` + logoI13(0, 10, 560), lerp(-10, 0, clamp(kl)));
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
