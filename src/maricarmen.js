/* MARI CARMEN DE FRENTE — personaje fijo de la serie desde el vídeo 15 (sustituye a la de perfil 3/4 del vídeo 06).
   Mismos rasgos y colores que en el vídeo 06: rizos castaños (#6B4A3A), gafas redondas rojas (#8E1B1B), blusa crema,
   delantal rojo con bolsillo, pantalón azul marino y zapatos marrones. Ahora mirando a cámara y con cuello.
   Misma interfaz que maricarmen() / placeMC() del vídeo 06 (suelo y=208, centro x=190):
   o: expr ('happy'|'smile'|'proud'|'expect'|'focus'), look [dx,dy], blink, talk (0..1 boca), armF / armB (giro del
   brazo en grados), handF(w) / handB(w), bob, head (giro de cabeza), front0(w), front(w), pocketItem(w), noPocket, noLegs. */
'use strict';

const MCF_ = { hy: 79, neck: '#E9B88F' };

function mcFace(o, w) {
  const e = o.expr || 'happy', lx = o.look ? o.look[0] : 0, ly = o.look ? o.look[1] : 0;
  const L = (d, sw = 1.6, col = INK) => `<path d="${d}" stroke="${col}" stroke-width="${w(sw)}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  const EY = 77, EX = [184.6, 195.4], MY = 86.4;
  let s = `<g transform="translate(0 ${MCF_.hy - 76})">`;
  // mejillas
  const ch = e === 'proud' ? 0.85 : 0.6;
  s += `<circle cx="180.6" cy="84" r="2.6" fill="${C.pink}" opacity="${ch}"/><circle cx="199.4" cy="84" r="2.6" fill="${C.pink}" opacity="${ch}"/>`;
  // cristales (brillo) y ojos
  EX.forEach(x => { s += `<circle cx="${x}" cy="${EY}" r="4.2" fill="#FFFFFF" fill-opacity="0.5"/>`; });
  if (o.blink) s += L(`M${EX[0] - 2.4} ${EY + 0.4} H${EX[0] + 2.4} M${EX[1] - 2.4} ${EY + 0.4} H${EX[1] + 2.4}`, 1.4);
  else {
    const r = e === 'proud' ? 2.2 : (e === 'expect' ? 1.8 : 1.6);
    EX.forEach(x => {
      s += `<circle cx="${f(x + lx)}" cy="${f(EY + ly)}" r="${r}" fill="${INK}"/>`;
      if (e === 'proud') s += `<circle cx="${f(x + lx + 0.8)}" cy="${f(EY + ly - 0.8)}" r="0.8" fill="#FFFFFF"/>`;
    });
  }
  // montura roja: dos aros, puente y patillas hasta las orejas
  EX.forEach(x => { s += `<circle cx="${x}" cy="${EY}" r="4.2" fill="none" stroke="${MC.frame}" stroke-width="${w(2)}"/>`; });
  s += `<path d="M188.6 76.4 Q190 75.4 191.4 76.4" fill="none" stroke="${MC.frame}" stroke-width="${w(1.8)}" stroke-linecap="round"/>`;
  s += `<path d="M180.4 76.6 L176.4 76 M199.6 76.6 L203.6 76" stroke="${MC.frame}" stroke-width="${w(1.8)}" stroke-linecap="round"/>`;
  // cejas
  if (e === 'expect') s += L('M181.2 69.4 Q184.4 67.2 187.6 69 M192.4 69 Q195.6 67.2 198.8 69.4', 1.5);
  else if (e === 'focus') s += L('M181.4 71 L187.2 71.8 M192.8 71.8 L198.6 71', 1.5);
  else s += L('M181.4 70.6 Q184.4 69 187.4 70.2 M192.6 70.2 Q195.6 69 198.6 70.6', 1.4);
  // nariz
  s += L('M190.4 79.6 Q189 81.6 190.8 82.4', 1.1, '#C98E66');
  // boca (centrada)
  const m = clamp(o.talk || 0);
  if (m > 0.05) {
    const op = 1.6 + 4.2 * m;
    s += `<path d="M185.6 ${MY - 0.4} Q190 ${f(MY + 0.6)} 194.4 ${MY - 0.4} Q190 ${f(MY + op)} 185.6 ${MY - 0.4}Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}" stroke-linejoin="round"/>`;
    if (m > 0.45) s += `<ellipse cx="190" cy="${f(MY + op * 0.6)}" rx="1.9" ry="${f(op * 0.17)}" fill="${C.pink}"/>`;
  } else if (e === 'expect') s += L(`M187.4 ${MY + 0.4} Q190 ${MY + 1.8} 192.6 ${MY + 0.4}`, 1.8);
  else if (e === 'focus') s += L(`M186.6 ${MY} Q190 ${MY + 0.8} 193.4 ${MY}`, 1.8) +
    `<path d="M190.6 ${MY + 0.4} Q191 ${MY + 3.8} 193 ${MY + 3.2} Q194.4 ${MY + 2.4} 193.4 ${MY}Z" fill="${C.pink}" stroke="${INK}" stroke-width="${w(1.2)}" stroke-linejoin="round"/>`;
  else if (e === 'proud') s += `<path d="M184.8 ${MY - 1} Q190 ${MY + 8} 195.2 ${MY - 1}Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.6)}" stroke-linejoin="round"/><path d="M186 ${MY - 0.5} H194 L193.2 ${MY + 0.9} H186.8Z" fill="#FFFFFF"/>`;
  else if (e === 'smile') s += `<path d="M185.4 ${MY - 0.6} Q190 ${MY + 6} 194.6 ${MY - 0.6}Z" fill="${C.dred}" stroke="${INK}" stroke-width="${w(1.5)}" stroke-linejoin="round"/>`;
  else s += L(`M185.8 ${MY - 0.4} Q190 ${MY + 3.6} 194.2 ${MY - 0.4}`, 1.9);
  return s + '</g>';
}

function maricarmen(o) {
  const k = o.k || 1, w = v => f(v * k);
  const st = (v = 3) => `stroke="${INK}" stroke-width="${w(v)}"`, lj = 'stroke-linejoin="round"';
  let g = '';
  // piernas y zapatos (de frente, simétricos)
  if (!o.noLegs) g += `<rect x="180.5" y="150" width="9" height="52" rx="4" fill="${C.navy}" ${st()}/>
    <rect x="190.5" y="150" width="9" height="52" rx="4" fill="${C.navy}" ${st()}/>
    <path d="M177.6 208 V204.6 Q177.6 201.4 181 201.4 H187.6 Q190 201.4 190 204 V208Z" fill="${MC.shoe}" ${st()} ${lj}/>
    <path d="M190 208 V204 Q190 201.4 192.4 201.4 H199 Q202.4 201.4 202.4 204.6 V208Z" fill="${MC.shoe}" ${st()} ${lj}/>`;
  const armB = o.armB || 0, armF = o.armF || 0;
  let b = '';
  // pelo de atrás (rizos a los lados de la cabeza, con el mismo vaivén que la cabeza)
  const hy = MCF_.hy, hr = o.head || 0;
  let back = '';
  [[175.4, hy - 4, 6.2], [204.6, hy - 4, 6.2], [175.8, hy + 7, 5.6], [204.2, hy + 7, 5.6]].forEach(([x, y, r]) => { back += `<circle cx="${x}" cy="${y}" r="${r}" fill="${MC.hair}" ${st()}/>`; });
  b += `<g transform="rotate(${f(hr)} 190 96)">${back}</g>`;
  // brazo de atrás
  b += `<g transform="rotate(${f(armB)} 176 110)"><rect x="172" y="108" width="7" height="36" rx="3.5" fill="${C.skinS}" ${st()}/><rect x="170" y="104" width="11" height="18" rx="4" fill="${C.cream}" ${st()}/>` +
    (o.handB ? `<g transform="rotate(${f(-armB)} 175.5 143)">${o.handB(w)}</g>` : '') + `</g>`;
  // cuello
  b += `<rect x="186" y="${hy + 10}" width="8" height="${f(104 - hy - 10)}" rx="2.4" fill="${MCF_.neck}" ${st()}/>`;
  // blusa y delantal
  b += `<rect x="172" y="100" width="36" height="54" rx="12" fill="${C.cream}" ${st()}/>
    <path d="M178 104 L202 104 L207 154 L173 154Z" fill="${C.red}"/>
    <path d="M178 104 L184 104 L184 154 L173 154Z" fill="${C.redS}"/>
    <path d="M178 104 L202 104 L207 154 L173 154Z" fill="none" ${st()} ${lj}/>`;
  if (!o.noPocket) b += `<rect x="183" y="130" width="14" height="12" rx="3" fill="${C.red}" ${st(2.5)}/>`;
  if (o.pocketItem) b += o.pocketItem(w);
  // escote en «V» de la blusa sobre el cuello
  b += `<path d="M184.6 101 L190 106.4 L195.4 101" fill="${MCF_.neck}" stroke="${INK}" stroke-width="${w(2.5)}" stroke-linejoin="round" stroke-linecap="round"/>`;
  b += `<path d="M180 104 Q182 101 184.6 101 M195.4 101 Q198 101 200 104" stroke="${INK}" stroke-width="${w(2.5)}" fill="none" stroke-linecap="round"/>`;
  if (o.front0) b += o.front0(w);
  // brazo de delante
  b += `<g transform="rotate(${f(armF)} 204 110)"><rect x="201" y="108" width="7" height="36" rx="3.5" fill="${C.skin}" ${st()}/><rect x="199" y="104" width="11" height="18" rx="4" fill="${C.cream}" ${st()}/>` +
    (o.handF ? `<g transform="rotate(${f(-armF)} 204.5 143)">${o.handF(w)}</g>` : '') + `</g>`;
  // cabeza de frente: orejas, cara, rizos de arriba (flequillo rizado), cara
  let hd = `<circle cx="175.2" cy="${hy + 1}" r="3.4" fill="${C.skinS}" ${st(2.4)}/><circle cx="204.8" cy="${hy + 1}" r="3.4" fill="${C.skinS}" ${st(2.4)}/>`;
  hd += `<circle cx="190" cy="${hy}" r="15" fill="${C.skin}" ${st()}/>`;
  [[177.6, hy - 9, 5.8], [183.4, hy - 13.6, 6], [190, hy - 15.2, 6.2], [196.6, hy - 13.6, 6], [202.4, hy - 9, 5.8]].forEach(([x, y, r]) => {
    hd += `<circle cx="${x}" cy="${f(y)}" r="${r}" fill="${MC.hair}" ${st()}/>`;
  });
  // brillo de los rizos
  hd += `<path d="M186 ${f(hy - 17)} Q188.6 ${f(hy - 19)} 191.4 ${f(hy - 18)}" stroke="#9A6A52" stroke-width="${w(1.2)}" fill="none" stroke-linecap="round"/>`;
  hd += mcFace(o, w);
  b += `<g transform="rotate(${f(hr)} 190 96)">${hd}</g>`;
  if (o.front) b += o.front(w);
  g += `<g transform="translate(0 ${f(o.bob || 0)})">${b}</g>`;
  return g;
}
