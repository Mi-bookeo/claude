// Escena de las historias de bienvenida (se ejecuta en Chromium). historias.js inyecta window.H (la historia) y window.A (recursos).
// pintar(t) deja la escena en el instante t (segundos). Determinista: el mismo t da el mismo fotograma.
(() => {
  const W = 1080;
  const H = window.H, A = window.A;
  const VIDRIO = { x: 440, y: 860, w: 600, h: 470 };
  const S = 1.75, ZX = 15, ZY = 205;                    // cámara final (la de historias)
  const SUELO = 1700;
  const RECT_CALLE = [0, 0, 1080, 1920];
  const RECT_ZOOM = [VIDRIO.x - ZX / S, VIDRIO.y - ZY / S, W / S, 1920 / S];
  const TAR = H.TAR;

  const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lin = (t, a, b) => cl((t - a) / (b - a));
  const io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const eout = (x) => 1 - Math.pow(1 - x, 3);
  const ein = (x) => x * x * x;
  const back = (x) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const mix = (a, b, k) => a + (b - a) * k;
  const $ = (id) => document.getElementById(id);

  // ---------- plan
  const P = {};
  (function plan() {
    let t;
    if (H.modo === 'A') {
      P.tirones = [[0.45, 0.95], [1.05, 1.55]];
      P.telon = [1.7, 2.5];
      P.zoom = [2.6, 3.7];                                     // la chica se queda quieta y el zoom la deja fuera
      P.pop = [3.75, 4.2]; t = 4.2;
    } else if (H.modo === 'B') {
      P.agarra = [0.3, 0.65];
      P.n = 4; P.dt = 0.62; P.t0 = 0.7; P.tira = 0.38;          // 4 tirones de 0,62 s (0,38 tirando, 0,24 subiendo la mano)
      P.suelta = [P.t0 + P.n * P.dt, P.t0 + P.n * P.dt + 0.3];
      P.zoom = [P.suelta[1] + 0.35, P.suelta[1] + 1.45];      // Pedro se queda quieto y el zoom lo deja fuera
      P.enrolla = [P.zoom[1] + 0.1, P.zoom[1] + 0.45];
      P.pop = [P.enrolla[1] - 0.05, P.enrolla[1] + 0.4]; t = P.pop[1];
    } else {                                                   // siguientes: cámara ya en el escaparate
      P.pon = [0, 0.85]; t = 0.85;
    }
    const aparece = P.pop ? P.pop[0] : P.pon[0] + 0.45;      // confeti rojo y blanco cuando aparece el comercio
    P.confeti = [aparece, aparece + 2.4];
    P.quieta = [t, t + (H.ultima ? 5 : 4.5)]; t = P.quieta[1];
    if (H.retirar) { P.quita = [t, t + 0.75]; t += 0.75 + 0.2; }   // 0,2 s de escaparate vacío
    P.fin = t;
  })();
  window.DURACION = P.fin;
  window.PLAN = P;

  // ---------- efectos de sonido (los mezcla bienvenidas/herramientas/sonido.py con la música)
  const SON = [];
  const son = (t, tipo, dur) => { if (t != null && t < P.fin) SON.push({ t: Math.max(0, t), tipo, dur }); };
  if (P.tirones) P.tirones.forEach(([a, b]) => son(a, 'cuerda', (b - a) * 0.45));
  if (P.telon) son(P.telon[0], 'tela', P.telon[1] - P.telon[0]);
  if (P.n) for (let i = 0; i < P.n; i++) son(P.t0 + i * P.dt, 'cuerda', P.tira);
  if (P.zoom) son(P.zoom[0], 'zoom', P.zoom[1] - P.zoom[0]);
  if (P.enrolla) son(P.enrolla[0], 'tela', P.enrolla[1] - P.enrolla[0]);
  if (P.pon) son(P.pon[0], 'mano', 0.45);
  son(P.confeti[0], 'confeti');
  if (P.quita) son(P.quita[0] + 0.25, 'mano', 0.5);
  window.SONIDOS = SON;

  // ---------- cámara
  function camara(z) {
    const k = io(z);
    const r = RECT_CALLE.map((v, i) => i < 2 ? mix(v, RECT_ZOOM[i], k) : Math.exp(mix(Math.log(v), Math.log(RECT_ZOOM[i]), k)));
    const s = W / r[2];
    return { s, tx: -r[0] * s, ty: -r[1] * s };
  }

  // ---------- Pedro por piezas (las de historias)
  const PZ = A.pedro.piezas;
  const MANO = { brazo_der: [947, 1060], brazo_izq: [553, 1060] };
  function pedro(el, q) {
    const a = { brazo_izq: q.bi || 0, brazo_der: q.bd || 0 };
    for (const img of el.children) img.style.transform = `rotate(${a[img.dataset.p] || 0}deg)`;
    el.style.transform = `translate(${q.cx - 750 * q.s}px, ${q.pies - 1806 * q.s}px) scale(${q.s})`;
  }
  function manoDe(q, brazo, ang) {
    const [px, py] = PZ[brazo].pivote, [hx, hy] = MANO[brazo], r = ang * Math.PI / 180, vx = hx - px, vy = hy - py;
    const lx = px + vx * Math.cos(r) - vy * Math.sin(r), ly = py + vx * Math.sin(r) + vy * Math.cos(r);
    return { x: q.cx - 750 * q.s + lx * q.s, y: q.pies - 1806 * q.s + ly * q.s };
  }

  // ---------- confeti rojo y blanco (pantalla) cuando aparece el comercio, pseudoaleatorio con semilla fija
  let sem = 7;
  const rnd = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
  const CONF = Array.from({ length: 110 }, (_, i) => ({
    x: TAR.x + rnd() * TAR.w, y: TAR.y + 40 + rnd() * 120, vx: (rnd() - 0.5) * 900, vy: -700 - rnd() * 900, w: 16 + rnd() * 14, h: 24 + rnd() * 18,
    r0: rnd() * 360, vr: (rnd() - 0.5) * 1000, c: i % 2 ? '#C81E1E' : '#FFFFFF', d: rnd() * 0.15,
  }));
  if ($('confeti')) $('confeti').innerHTML = CONF.map((p) => `<rect x="${-p.w / 2}" y="${-p.h / 2}" width="${p.w}" height="${p.h}" rx="3" fill="${p.c}" stroke="#1E1A1A" stroke-width="2.5"/>`).join('');
  function confeti(t) {
    const el = $('confeti'); if (!el) return;
    const [a, b] = P.confeti;
    if (t < a || t > b) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    [...el.children].forEach((r, i) => {
      const p = CONF[i], u = Math.max(0, t - a - p.d);
      const x = p.x + p.vx * u * 0.7, y = p.y + p.vy * u + 1100 * u * u;
      r.setAttribute('transform', `translate(${x} ${y}) rotate(${p.r0 + p.vr * u}) scale(1 ${Math.cos(u * 9 + i)})`);
      r.style.opacity = u <= 0 ? 0 : 1 - lin(t, b - 0.5, b);
    });
  }

  // ---------- telón (A): dos mitades que se recogen hacia los lados
  function telon(t) {
    const f = H.modo === 'A' ? io(lin(t, P.telon[0], P.telon[1])) : 1;
    const k = mix(1, 0.2, f);
    $('telI').style.transform = `scaleX(${k})`;
    $('telD').style.transform = `scaleX(${k})`;
  }
  // cordón dorado del telón: de la cenefa a la mano de la chica
  function cordon(x2, y2, vis) {
    const el = $('cordon');
    if (!vis) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    const x1 = 432, y1 = 902, mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + 14;
    const d = `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
    el.querySelectorAll('path.c').forEach((p) => p.setAttribute('d', d));
    $('borla').setAttribute('transform', `translate(${x2} ${y2})`);
  }

  // ---------- rótulo (B): se desenrolla al tirar de la cuerda
  const ROT = { top: 896, largo: 418 };
  function rotulo(largo) {
    $('rotTela').style.height = largo + 'px';
    $('rotBarra').style.transform = `translateY(${largo}px)`;
  }
  function cuerda(pts) {
    const el = $('cuerda');
    if (!pts) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    let d = `M${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i], q = pts[i - 1];
      d += i === pts.length - 1 ? ` Q${(p.x + q.x) / 2 - 18} ${(p.y + q.y) / 2} ${p.x} ${p.y}` : ` L${p.x} ${p.y}`;
    }
    el.querySelectorAll('path').forEach((p) => p.setAttribute('d', d));
    $('cuerdaMarcas').style.strokeDashoffset = -(window._tirado || 0);
  }

  // ---------- tarjeta y mano (pantalla)
  function mover(el, t, pon, quita) {
    let dx = 0, rot = 0, vis = true;
    if (pon) {
      if (t < pon[0]) vis = false;
      else { const f = eout(lin(t, pon[0], pon[0] + 0.45)); dx = (1 - f) * 1250; rot = (1 - f) * 9; }
    }
    if (quita && t >= quita[0]) { const f = ein(lin(t, quita[0] + 0.32, quita[1])); dx = f * 1250; rot = f * 9; if (f >= 1) vis = false; }
    el.style.display = vis ? 'block' : 'none';
    el.style.transform = `translate(${dx}px, ${dx * -0.08}px) rotate(${rot}deg)`;
  }
  const AGARRE = { x: TAR.x + TAR.w - 26, y: TAR.y + TAR.h * 0.5 };
  function manoQuita(t, [a, b]) {
    const f1 = eout(lin(t, a, a + 0.25)), f2 = ein(lin(t, a + 0.32, b));
    const dx = (1 - f1) * 700 + f2 * 1250;
    return { x: AGARRE.x + dx, y: AGARRE.y - dx * 0.08, rot: f2 * 9, cierra: t >= a + 0.25 };
  }
  function manoPon(t, [a, b]) {
    const f1 = eout(lin(t, a, a + 0.45)), f2 = ein(lin(t, a + 0.55, b));
    const dx = (1 - f1) * 1250 + f2 * 700;
    return { x: AGARRE.x + dx, y: AGARRE.y - (1 - f1) * 100, rot: (1 - f1) * 9, cierra: t < a + 0.5 };
  }
  function ponMano(m) {
    const el = $('mano');
    if (!m) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    el.style.transform = `translate(${m.x}px, ${m.y}px) rotate(${m.rot}deg) scale(1.55)`;
    $('dedos').style.transform = m.cierra ? 'translateX(6px)' : 'translateX(-10px)';
  }

  // ---------- pintar
  window.pintar = (t) => {
    const z = P.zoom ? lin(t, P.zoom[0], P.zoom[1]) : 1;
    const c = camara(z);
    $('mundo').style.transform = `translate(${c.tx}px, ${c.ty}px) scale(${c.s})`;
    if (z === 1 && window._zPrev !== 1) { const m = $('mundo'); m.style.display = 'none'; void m.offsetHeight; m.style.display = 'block'; }
    window._zPrev = z;

    if ($('telI')) telon(t);
    confeti(t);

    if (H.modo === 'A') {
      // la chica tira dos veces del cordón: baja el brazo desde el hombro (pieza) y el cuerpo acompaña un poco
      let dip = 0;
      for (const [a, b] of P.tirones) { const m = a + (b - a) * 0.4; if (t >= a && t <= b) dip = t < m ? eout(lin(t, a, m)) : 1 - io(lin(t, m, b)); }
      const s = 0.45, cx = 200, el = $('maria');               // a la izquierda del escaparate: el zoom la deja fuera
      const o = { k: 1, dy: 0 };
      const bb = A.bb.maria_senalando, cb = (bb[0] + bb[2]) / 2;
      const pies = SUELO + dip * 10 + o.dy, ss = s * o.k;
      const ang = 34 * dip, MJ = A.maria, [px, py] = MJ.piezas.brazo.pivote, [hx, hy] = MJ.mano;
      for (const img of el.children) img.style.transform = img.dataset.p === 'brazo' ? `rotate(${ang}deg)` : 'none';
      el.style.transform = `translate(${cx - cb * ss}px, ${pies - bb[3] * ss}px) scale(${ss})`;
      const r = ang * Math.PI / 180, lx = px + (hx - px) * Math.cos(r) - (hy - py) * Math.sin(r), ly = py + (hx - px) * Math.sin(r) + (hy - py) * Math.cos(r);
      const mano = { x: cx - cb * ss + lx * ss, y: pies - bb[3] * ss + ly * ss };
      cordon(mano.x, mano.y, true);
    }

    if (H.modo === 'B') {
      const s = 0.5, cx = 235, el = $('pedro');
      let bi = 0, bd = 0, dip = 0, tirado = 0;
      const RA = -150, RB = -58, LA = -42, LB = -22;            // brazo derecho arriba/abajo, izquierdo arriba/abajo
      if (t >= P.agarra[0]) { const f = io(lin(t, P.agarra[0], P.agarra[1])); bd = RA * f; bi = LA * f; }
      for (let i = 0; i < P.n; i++) {
        const a = P.t0 + i * P.dt, m = a + P.tira, b = a + P.dt;
        if (t >= a && t < m) { const f = io(lin(t, a, m)); bd = mix(RA, RB, f); bi = mix(LA, LB, f); dip = Math.sin(Math.PI * f) * 14; tirado = i + f; }
        else if (t >= m && t < b) { const f = io(lin(t, m, b)); bd = mix(RB, RA, f); bi = mix(LB, LA, f); tirado = i + 1; }
        else if (t >= b) tirado = i + 1;
      }
      if (t >= P.suelta[0]) { const f = io(lin(t, P.suelta[0], P.suelta[1])); bd = mix(RA, 0, f); bi = mix(LA, 0, f); }
      const q = { cx, pies: SUELO + dip, s, bi, bd };
      pedro(el, q);
      // rótulo: cada tirón lo baja un cuarto; al final rebota un poco. Tras el zoom se vuelve a enrollar.
      let largo = ROT.largo * Math.min(1, tirado / P.n);
      const fin = P.t0 + P.n * P.dt - P.dt + P.tira;
      if (t > fin) largo = ROT.largo * (1 + 0.03 * Math.sin(Math.PI * lin(t, fin, fin + 0.3)));
      if (t >= P.enrolla[0]) largo = ROT.largo * (1 - ein(lin(t, P.enrolla[0], P.enrolla[1])));
      rotulo(largo);
      window._tirado = tirado * 105;
      // cuerda: de la polea a las manos y el sobrante colgando hasta el suelo
      const polea = { x: 404, y: 896 };
      if (t < P.agarra[0] + 0.2 || t >= P.suelta[0] + 0.12) {
        cuerda([polea, { x: 398, y: 1300 }, { x: 392, y: 1690 }]);
      } else {
        const md = manoDe(q, 'brazo_der', bd), mi = manoDe(q, 'brazo_izq', bi);
        const [h1, h2] = md.y < mi.y ? [md, mi] : [mi, md];
        cuerda([polea, h1, h2, { x: h2.x - 20, y: 1690 }]);
      }
    } else if ($('cuerda')) { rotulo(0); cuerda([{ x: 404, y: 896 }, { x: 398, y: 1300 }, { x: 392, y: 1690 }]); }

    // tarjeta del comercio
    const tar = $('tarjeta');
    if (P.pop && !(P.quita && t >= P.quita[0])) {          // primera historia: la tarjeta aparece de golpe (pop)
      const k = t < P.pop[0] ? 0 : back(lin(t, P.pop[0], P.pop[1]));
      tar.style.display = t < P.pop[0] ? 'none' : 'block';
      tar.style.opacity = cl(k * 3);
      tar.style.transform = `scale(${mix(0.4, 1, k)})`;
    } else { tar.style.opacity = 1; mover(tar, t, P.pop ? null : P.pon, P.quita); }   // la mano la trae o se la lleva
    const con = $('conocelo');
    if (con) { const a = P.pop ? P.pop[0] : P.pon[0] + 0.45, kt = lin(t, a, a + 0.35); con.style.opacity = kt; con.style.transform = `translateY(${(1 - eout(kt)) * 30}px)`; }

    let m = null;
    if (P.pon && t >= P.pon[0] && t <= P.pon[1]) m = manoPon(t, P.pon);
    else if (P.quita && t >= P.quita[0]) m = manoQuita(t, P.quita);
    ponMano(m);
  };
})();
