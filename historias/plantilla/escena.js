// Escena de las historias (se ejecuta en Chromium). generar.js inyecta window.H (la historia) y window.A (recursos).
// pintar(t) deja la escena en el instante t (segundos). Todo es determinista: el mismo t da el mismo fotograma.
(() => {
  const W = 1080, Hh = 1920;
  const RED = '#C81E1E', DARK = '#2B1010', TINTA = '#1E1A1A', PLAZA = '#A81414', CREMA = '#FFF4E0', PINK = '#FDE3E3';
  const H = window.H, A = window.A;

  // ---------- geometría del mundo (calle) y de la cámara
  const VIDRIO = { x: 440, y: 860, w: 600, h: 470 };           // cristal del escaparate en el mundo
  const S = 1.75;                                              // zoom final
  const ZX = 15, ZY = 205;                                     // dónde queda la esquina del cristal en pantalla
  const SUELO = 1700;                                          // pies de los personajes en la calle
  const RECT_CALLE = [0, 0, W, Hh];
  const RECT_ZOOM = [VIDRIO.x - ZX / S, VIDRIO.y - ZY / S, W / S, Hh / S];
  // tarjeta en pantalla (con la cámara en el escaparate)
  const TAR = { x: 60, y: 250, w: 960, h: 740 };

  // ---------- utilidades de tiempo
  const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lin = (t, a, b) => cl((t - a) / (b - a));
  const io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const eout = (x) => 1 - Math.pow(1 - x, 3);
  const ein = (x) => x * x * x;
  const back = (x) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const mix = (a, b, k) => a + (b - a) * k;
  const $ = (id) => document.getElementById(id);

  // ---------- plan de la historia: tiempos de cada fase
  const P = {};
  (function plan() {
    let t = 0;
    const tiene = (k) => H[k];
    if (H.modo === 'encuesta1') { P.preg = [0, 0.35]; P.pjPeq = [0.15, 0.55]; P.aterriza = 0.6; P.pop = [0.6, 0.95]; P.fin = 6; return; }
    if (H.modo === 'encuesta2') {
      let r = 0.2;
      if (H.tipoEnc === 'mas_vista') { P.quitaB = [0.2, 0.95]; P.crece = [1.0, 1.5]; r = 1.5; }
      else { P.tapas = (H.tapas || []).map((_, i) => [0.2 + i * 0.72, 0.2 + i * 0.72 + 0.72]); r = 0.2 + P.tapas.length * 0.72; }
      P.resp = [r, r + 0.35]; P.aterriza = r + 0.1; P.pop = [r + 0.1, r + 0.45]; P.fin = 6; return;
    }
    if (H.entrada === 'A') { P.maria = [0.15, 0.5]; P.senala = 0.9; P.zoom = [2.4, 3.6]; t = 4.0; }
    else if (H.entrada === 'B') { P.anda = [0.15, 1.95, 2]; P.zoom = [2.5, 3.65]; t = 4.0; }
    else if (H.entrada === 'hoy') {
      P.anda = [0.05, 1.25, 3]; P.brazo = [1.2, 1.55]; P.coge = 1.55; P.empuja = [1.95, 2.35]; P.sube = [2.35, 2.7];
      P.baja = [2.45, 2.85]; P.zoom = [2.85, 3.95]; t = 4.0;
    }
    if (H.entrada) { P.pjPeq = [P.zoom[1] - 0.15, P.zoom[1] + 0.25]; P.cartel = [t, t + 1.5]; t += 1.5; P.quita0 = [t, t + 0.75]; t += 0.8; }
    P.pon = [t, t + 0.85]; P.aterriza = t + 0.45; t += 0.85;
    P.pop = [P.aterriza, P.aterriza + 0.35];
    t = Math.max(t, P.pop[1]);
    P.quieta = [t, t + (H.ultima ? 5 : 4.4)]; t = P.quieta[1];
    if (tiene('retirar')) { P.quita = [t, t + 0.75]; t += 0.75 + 0.2; } // 0,2 s de escaparate vacío al final
    P.fin = t;
  })();
  window.DURACION = P.fin;

  // ---------- efectos de sonido: en qué instante suena cada uno (lo usa herramientas/audio.py)
  const SON = [];
  const son = (t, tipo, dur) => { if (t != null && t < P.fin) SON.push({ t: Math.max(0, t), tipo, dur }); };
  if (P.maria) { son(P.maria[0], 'pop'); son(P.senala, 'campanita'); }
  if (P.anda) { const [a, b, n] = P.anda; for (let k = 0; k < n; k++) son(a + (k + 0.85) * (b - a) / n, 'paso'); }
  if (H.entrada === 'hoy') { son(0, 'persiana_baja', P.coge); son(P.empuja[0], 'persiana_sube', P.sube[1] - P.empuja[0]); }
  if (P.zoom) son(P.zoom[0], 'zoom', P.zoom[1] - P.zoom[0]);
  if (P.pjPeq) son(P.pjPeq[0], 'mano', 0.35);
  if (P.cartel) son(P.cartel[0] - 0.1, 'campanita');
  if (P.quita0) son(P.quita0[0] + 0.25, 'mano', 0.5);
  if (P.pon) { son(P.pon[0], 'mano', 0.45); son(P.aterriza, 'tarjeta_cae'); }
  if (P.pop && H.frase !== H.frasePrev) son(P.pop[0] + 0.05, 'pop');
  if (H.ultima && P.pop) son(P.pop[0] + 0.25, 'campanita');
  if (P.quita) son(P.quita[0] + 0.25, 'mano', 0.5);
  if (P.preg) { son(P.preg[0], 'pop'); son(P.preg[1] + 0.15, 'tictac', P.fin - P.preg[1] - 0.25); }   // tic-tac mientras se piensa
  if (P.tapas) P.tapas.forEach(([a]) => son(a + 0.25, 'tela', 0.45));
  if (P.quitaB) son(P.quitaB[0] + 0.25, 'mano', 0.5);
  if (P.crece) son(P.crece[0], 'zoom', 0.5);
  if (P.resp) son(P.resp[0], 'respuesta');
  window.SONIDOS = SON;
  window.PLAN = P;

  // ---------- cámara
  function camara(z) {
    const k = io(z);
    const r = RECT_CALLE.map((v, i) => i < 2 ? mix(v, RECT_ZOOM[i], k) : Math.exp(mix(Math.log(v), Math.log(RECT_ZOOM[i]), k)));
    const s = W / r[2];
    return { s, tx: -r[0] * s, ty: -r[1] * s };
  }

  // ---------- Pedro por piezas
  const PZ = A.pedro.piezas;
  const L_PIERNA = 1806 - 1215;
  // pose: cx (centro), pies (y del suelo), s (escala), pi/pd (piernas), bi/bd (brazos) en grados
  function pedro(el, q) {
    const a = { pierna_izq: q.pi || 0, pierna_der: q.pd || 0, brazo_izq: q.bi || 0, brazo_der: q.bd || 0 };
    const caida = L_PIERNA * (1 - Math.cos(Math.max(Math.abs(a.pierna_izq), Math.abs(a.pierna_der)) * Math.PI / 180));
    for (const img of el.children) img.style.transform = `rotate(${a[img.dataset.p] || 0}deg)`;
    el.style.transform = `translate(${q.cx - 750 * q.s}px, ${q.pies - (1806 - caida) * q.s}px) scale(${q.s})`;
    el.style.opacity = q.op ?? 1;
  }
  // mano derecha (vista) en el mundo para un ángulo de brazo
  function manoPedro(q, ang) {
    const [px, py] = PZ.brazo_der.pivote, r = ang * Math.PI / 180, vx = 947 - px, vy = 1060 - py;
    const lx = px + vx * Math.cos(r) - vy * Math.sin(r), ly = py + vx * Math.sin(r) + vy * Math.cos(r);
    return { x: q.cx - 750 * q.s + lx * q.s, y: q.pies - 1806 * q.s + ly * q.s, r: 56 * q.s };
  }
  // andar de frente: cada paso abre la pierna del lado de la marcha y cierra la otra
  function andar(t, t0, t1, n, x0, x1) {
    const p = cl((t - t0) / (t1 - t0)) * n, k = Math.min(Math.floor(p), n - 1), f = p - k;
    const sp = Math.sin(Math.PI * f), sg = k % 2 ? -1 : 1;
    return { cx: mix(x0, x1, p / n), pd: -30 * sp, pi: 17 * sp, bi: 13 * sp * sg, bd: 13 * sp * sg };
  }

  // ---------- personaje (PNG del carrusel) colocado por su caja
  const BB = A.bb;
  function pjImg(el, n, cx, pies, s, espejo = false) {
    const [x0, , x1, y1] = BB[n];
    const c = espejo ? 1500 - (x0 + x1) / 2 : (x0 + x1) / 2;
    el.style.width = '1500px'; el.style.height = '1875px';
    el.style.transformOrigin = '0 0';
    el.style.transform = `translate(${cx - c * s}px, ${pies - y1 * s}px) scale(${s})${espejo ? ' translateX(1500px) scaleX(-1)' : ''}`;
  }

  // ---------- pintar
  window.pintar = (t) => {
    const enc = H.modo.startsWith('encuesta');
    // cámara
    const z = P.zoom ? lin(t, P.zoom[0], P.zoom[1]) : 1;
    const c = camara(z);
    $('mundo').style.transform = `translate(${c.tx}px, ${c.ty}px) scale(${c.s})`;
    // al terminar el zoom se vuelve a pintar la capa a escala final (si no, Chromium reutiliza la de la animación)
    if (z === 1 && window._zPrev !== 1) { const m = $('mundo'); m.style.display = 'none'; void m.offsetHeight; m.style.display = 'block'; }
    window._zPrev = z;
    $('cielo').style.opacity = 1;

    // personaje grande en la calle
    const zFade = 1 - lin(z, 0.45, 0.85);
    if (H.entrada === 'A') {
      const k = back(lin(t, P.maria[0], P.maria[1]));
      const sen = t >= P.senala;
      const bote = sen ? Math.sin(Math.PI * lin(t, P.senala, P.senala + 0.3)) * 18 : 0;
      $('mariaG1').style.display = sen ? 'none' : 'block';
      $('mariaG2').style.display = sen ? 'block' : 'none';
      const el = sen ? $('mariaG2') : $('mariaG1');
      pjImg(el, sen ? 'maria_senalando' : 'maria_sonriendo', sen ? 255 + 140 : 255, SUELO - bote, 0.47 * mix(0.85, 1, k));
      el.style.opacity = cl(k * 3) * zFade;
    }
    if (H.entrada === 'B' || H.entrada === 'hoy') {
      const el = $('pedroG');
      const s = 0.5, hoy = H.entrada === 'hoy';
      const xa = hoy ? -170 : 80, xb = hoy ? 690 : 740;
      let q = { cx: xb, pies: SUELO, s };
      if (t < P.anda[1]) q = { ...q, ...andar(t, P.anda[0], P.anda[1], P.anda[2], xa, xb) };
      else if (!hoy) { // asentarse
        const f = lin(t, P.anda[1], P.anda[1] + 0.3); q.bi = 6 * Math.sin(Math.PI * f); q.bd = -6 * Math.sin(Math.PI * f);
      }
      if (hoy) {
        const AC = -92, AU = -160;
        let ang = 0;
        if (t >= P.brazo[0]) ang = AC * eout(lin(t, P.brazo[0], P.brazo[1]));
        if (t >= P.coge && t < P.empuja[0]) ang = AC + 3 * Math.sin((t - P.coge) * 30) * (1 - lin(t, P.coge, P.empuja[0]));
        if (t >= P.empuja[0]) ang = mix(AC, AU, io(lin(t, P.empuja[0], P.empuja[1])));
        if (t >= P.baja[0]) ang = mix(AU, 0, io(lin(t, P.baja[0], P.baja[1])));
        q.bd = ang + (q.bd || 0) * (ang ? 0 : 1);
        if (t >= P.brazo[0]) q.bi = 10 * lin(t, P.brazo[0], P.brazo[1]) * (1 - lin(t, P.baja[0], P.baja[1]));
        // persiana
        const yTope = VIDRIO.y - 14;
        const qC = { cx: xb, pies: SUELO, s };
        const yC = manoPedro(qC, AC).y - 56 * s;
        let yb;
        if (t < P.coge) yb = mix(yTope + 40, yC, Math.pow(lin(t, 0, P.coge), 1.3));
        else if (t < P.sube[0]) yb = manoPedro(q, q.bd).y - 56 * s;
        else yb = mix(manoPedro(qC, AU).y - 56 * s, yTope, ein(lin(t, P.sube[0], P.sube[1])));
        persiana(yb);
      }
      q.op = zFade;
      pedro(el, q);
    }
    if (H.entrada !== 'hoy') persiana(null);

    // personaje pequeño + bocadillo (pantalla)
    const peq = $('pjPeq');
    if (peq) {
      let k = 1;
      if (P.pjPeq) k = back(lin(t, P.pjPeq[0], P.pjPeq[1]));
      peq.style.opacity = 1;
      peq.style.transform = `translateY(${(1 - k) * 950}px)`;   // sube desde abajo
      // bocadillo: antes de aterrizar la tarjeta, el de la anterior (o nada en la primera)
      const nuevo = t >= P.aterriza;
      const b = $('boca'), txt = nuevo ? H.frase : H.frasePrev;
      if (!txt) b.style.opacity = 0;
      else {
        b.style.opacity = 1;
        $('bocaTxt').innerHTML = txt;
        const kb = nuevo && H.frase !== H.frasePrev ? back(lin(t, P.pop[0], P.pop[1])) : 1;
        b.style.transform = `translate(400px, 1205px) scale(${mix(0.3, 1, kb)}) translate(-400px, -1205px)`;
      }
      const todas = $('todas');
      if (todas) { const kt = lin(t, P.pop[0], P.pop[1]); todas.style.opacity = kt; todas.style.transform = `translateY(${(1 - eout(kt)) * 30}px)`; }
    }

    // cartel de entrada y tarjeta (vitrina, en coordenadas de pantalla)
    if (!enc) {
      const cart = $('cartel');
      if (cart) mover(cart, t, null, P.quita0);
      mover($('tarjeta'), t, P.pon, P.quita);
      // mano
      let m = null;
      if (P.quita0 && t >= P.quita0[0] && t <= P.quita0[1]) m = manoQuita(t, P.quita0);
      else if (t >= P.pon[0] && t <= P.pon[1]) m = manoPon(t, P.pon);
      else if (P.quita && t >= P.quita[0]) m = manoQuita(t, P.quita);
      ponMano(m);
    } else {
      const kq = H.modo === 'encuesta1' ? back(lin(t, P.preg[0], P.preg[1])) : 1;
      $('preg').style.opacity = cl(kq * 3);
      $('preg').style.transform = `translate(540px, 340px) scale(${mix(0.5, 1, kq)}) translate(-540px, -340px)`;
      const dos = H.modo === 'encuesta2';
      if (dos) {
        const resp = t >= P.resp[0];
        $('pregTxt').style.display = resp ? 'none' : 'flex';
        $('respTxt').style.display = resp ? 'flex' : 'none';
        if (resp) { const kr = back(lin(t, P.resp[0], P.resp[1])); $('preg').style.transform = `translate(540px, 340px) scale(${mix(0.6, 1, kr)}) translate(-540px, -340px)`; }
      }
      let m = null;
      if (H.tipoEnc !== 'mas_vista') {
        // la mano arranca las etiquetas "?" una a una
        (H.tapas || []).forEach((g, i) => {
          const el = $('tapa' + i);
          if (!dos) { el.style.transform = 'none'; return; }
          const [a, b] = P.tapas[i], f1 = eout(lin(t, a, a + 0.25)), f2 = ein(lin(t, a + 0.3, b));
          const dx = 950 * f2, dy = -650 * f2;
          el.style.transform = `translate(${dx / H.k}px, ${dy / H.k}px) rotate(${30 * f2}deg)`;
          el.style.display = f2 >= 1 ? 'none' : 'block';
          if (t >= a && t <= b) m = { x: g.x + (1 - f1) * 700 + dx, y: g.y + dy, rot: -12 + 25 * f2, cierra: t >= a + 0.25 };
        });
      } else {
        const [ca, cb] = H.cartas, G = H.grande, win = H.ganadora, lose = 1 - win;
        const pon = (el, c) => { el.style.transform = `translate(${c.x}px, ${c.y}px) scale(${c.k})`; };
        const els = [$('encA'), $('encB')];
        pon(els[0], ca); pon(els[1], cb);
        els[lose].style.display = 'block';
        $('sello').style.opacity = 0;
        if (dos) {
          // la mano se lleva la que no ganó
          const c = H.cartas[lose], [a, b] = P.quitaB, f1 = eout(lin(t, a, a + 0.25)), f2 = ein(lin(t, a + 0.32, b));
          const dx = f2 * 1300;
          els[lose].style.transform = `translate(${c.x + dx}px, ${c.y - dx * 0.08}px) scale(${c.k}) rotate(${9 * f2}deg)`;
          if (f2 >= 1) els[lose].style.display = 'none';
          const gx = c.x + 960 * c.k - 24, gy = c.y + 370 * c.k;
          if (t >= a && t <= b) m = { x: gx + (1 - f1) * 900 + dx, y: gy - dx * 0.08, rot: 9 * f2, cierra: t >= a + 0.25 };
          // la ganadora crece hasta el centro y sale el sello
          const w = H.cartas[win], fc = io(lin(t, P.crece[0], P.crece[1]));
          pon(els[win], { x: mix(w.x, G.x, fc), y: mix(w.y, G.y, fc), k: mix(w.k, G.k, fc) });
          const ks = back(lin(t, P.crece[1] - 0.1, P.crece[1] + 0.25));
          $('sello').style.opacity = cl(ks * 3);
          $('sello').style.transform = `scale(${mix(0.3, 1, ks)})`;
        }
      }
      ponMano(m);
    }
  };

  // ---------- tarjetas: entran y salen con la mano por la derecha
  function mover(el, t, pon, quita) {
    if (!el) return;
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
    return { x: AGARRE.x + dx, y: AGARRE.y - dx * 0.08 + f2 * 0, rot: f2 * 9, cierra: t >= a + 0.25 };
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

  // ---------- persiana (mundo). yb = borde inferior; null = recogida
  function persiana(yb) {
    const el = $('persiana');
    if (yb == null || yb <= VIDRIO.y - 12) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    const top = VIDRIO.y - 16, h = yb - top;
    el.style.height = h + 'px';
    $('lamas').style.backgroundPosition = `0 ${h}px`;
  }
})();
