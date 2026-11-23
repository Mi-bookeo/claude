/* Poses sueltas de María y Pedro para carruseles de Instagram.
   Se dibujan con el MISMO código de la serie de vídeos (rama video-11-marta-cuatro-motivos):
   María = src/maria.js (placeMaria), Pedro = src/v05.js (placePedro, el del cartel),
   manos = hand11 (src/v11.js). Nada redibujado a mano.
   Misma escala para los dos personajes -> mismo grosor de contorno (SW ≈ 8,5 px a escala 1). */
'use strict';

const CW = 1000, CH = 1250;         // lienzo en px CSS (se exporta x1,5 -> 1500x1875)
const SC = 7.5;                     // escala de los personajes (vídeo 11: 7-8,3)
const PX = 500, FOOT = 1200;        // centro y suelo en el lienzo

// ---------- móvil grande de frente, pantalla blanca lisa (estilo de la serie) ----------
const PH = { w: 44, h: 72, r: 6, bez: 3.2 };
function bigPhone(cx, top, w) {
  const x = cx - PH.w / 2, b = PH.bez;
  let g = `<rect x="${f(x)}" y="${f(top)}" width="${PH.w}" height="${PH.h}" rx="${PH.r}" fill="${INK}" stroke="${INK}" stroke-width="${w(3)}" stroke-linejoin="round"/>`;
  g += `<rect x="${f(x + b)}" y="${f(top + b + 2.2)}" width="${f(PH.w - 2 * b)}" height="${f(PH.h - 2 * b - 4.4)}" rx="2.6" fill="#FFFFFF"/>`;
  return g;
}
const PH_TOP_M = 113, PH_TOP_P = 104, PH_CX_P = 194;
// ---------- cartel blanco grande (apaisado, liso, mismo contorno) ----------
const BD = { x0: 149, x1: 231, h: 50, r: 3, topM: 116, topP: 110, hyM: 140 };
const board = (top, w) => `<rect x="${BD.x0}" y="${top}" width="${BD.x1 - BD.x0}" height="${BD.h}" rx="${BD.r}" fill="#FFFFFF" stroke="${INK}" stroke-width="${w(3)}" stroke-linejoin="round"/>`;

// ---------- utilidades ----------
const mW = (lx, ly) => [PX + (lx - 190) * SC, FOOT + (ly - 204) * SC];   // local María -> lienzo
const pW = (lx, ly) => [PX + (lx - 190) * SC, FOOT + (ly - 214) * SC];   // local Pedro -> lienzo
// ángulo de brazo recto de Pedro para llevar la mano hacia (tx,ty)
const pAng = (pv, tx, ty) => -Math.atan2(tx - pv[0], ty - pv[1]) * 180 / PI;
// dirección (grados, 0 = derecha, -90 = arriba) hacia la que apunta un brazo recto de Pedro girado 'a'
const armDir = a => Math.atan2(Math.cos(a * PI / 180), -Math.sin(a * PI / 180)) * 180 / PI;
const restF ={ h: [208.4, 154.6], side: -1, hand: 'fist', hs: 1.1 };
const restB = { h: [171.6, 154.6], side: 1, hand: 'fist', hs: 1.1 };

// ---------- MARÍA ----------
const POSE_MARIA = {
  senalando: () => placeMaria(PX, FOOT, SC, {
    expr: 'sparkle', head: -4,
    armF: { h: [235.2, 110], side: -1, hand: 'point', dir: -28, hs: 1.35 }, armB: restB
  }),
  sonriendo: () => placeMaria(PX, FOOT, SC, { expr: 'joy', head: 3, armF: restF, armB: restB }),
  sorprendida: () => placeMaria(PX, FOOT, SC, {
    expr: 'surprise',
    armF: { h: [221, 101], side: -1, hand: 'open', hs: 1.2, hrot: 22 },
    armB: { h: [159, 101], side: 1, hand: 'open', hs: 1.2, hrot: -22 }
  }),
  cartel: () => {
    const HF = [BD.x1 - 0.5, BD.hyM], HB = [BD.x0 + 0.5, BD.hyM];
    return placeMaria(PX, FOOT, SC, {
      expr: 'sparkle',
      armF: { h: HF, side: -1, hand: 'fist', hs: 1.2 }, armB: { h: HB, side: 1, hand: 'fist', hs: 1.2 },
      front: w => board(BD.topM, w) +
        hand11('fist', HF, w, { fill: MG.skin, hs: 1.2 }) + hand11('fist', HB, w, { fill: MG.skin, hs: 1.2 })
    });
  },
  movil: () => {
    const HF = [210.5, 150], HB = [169.5, 150];
    return placeMaria(PX, FOOT, SC, {
      expr: 'sparkle',
      armF: { h: HF, side: -1, hand: 'fist', hs: 1.2 }, armB: { h: HB, side: 1, hand: 'fist', hs: 1.2 },
      front: w => bigPhone(190, PH_TOP_M, w) +
        hand11('fist', HF, w, { fill: MG.skin, hs: 1.2 }) + hand11('fist', HB, w, { fill: MG.skin, hs: 1.2 })
    });
  }
};

// ---------- POSE_PEDRO (el del cartel: v05, camiseta verde y gafas) ----------
const POSE_PEDRO = {
  senalando: () => {
    const a = -130;
    return placePedro(PX, FOOT, SC, {
      expr: 'grin', head: -4, armF: a, armB: 4,
      itemF: (w, x, y) => hand11('point', [x, y], w, { fill: P5.skin, hs: 1.3, dir: armDir(a) })
    });
  },
  sonriendo: () => placePedro(PX, FOOT, SC, { expr: 'laugh', armF: -4, armB: 4 }),
  sorprendido: () => placePedro(PX, FOOT, SC, {
    expr: 'surprise', head: -3, armF: -150, armB: 150,
    itemF: (w, x, y) => hand11('open', [x, y], w, { fill: P5.skin, hs: 1.2, hrot: armDir(-150) + 90 }),
    itemB: (w, x, y) => hand11('open', [x, y], w, { fill: P5.skinS, hs: 1.2, hrot: armDir(150) + 90 })
  }),
  cartel: () => {
    const hy = 137, aF = pAng(PF, BD.x1 - 0.5, hy), aB = pAng(PB, BD.x0 + 0.5, hy);
    return placePedro(PX, FOOT, SC, {
      expr: 'grin', armF: aF, armB: aB,
      itemF: w => {
        const hF = handLocal(PF, aF), hB = handLocal(PB, aB);
        return board(BD.topP, w) + handC(w, hB[0], hB[1], P5.skin, 4.4) + handC(w, hF[0], hF[1], P5.skin, 4.4);
      }
    });
  },
  movil: () => {
    const x0 = PH_CX_P - PH.w / 2, x1 = PH_CX_P + PH.w / 2, hy = 144;
    const aF = pAng(PF, x1 - 0.5, hy), aB = pAng(PB, x0 + 0.5, hy);
    return placePedro(PX, FOOT, SC, {
      expr: 'grin', armF: aF, armB: aB,
      itemF: w => {
        const hF = handLocal(PF, aF), hB = handLocal(PB, aB);
        return bigPhone(PH_CX_P, PH_TOP_P, w) + handC(w, hB[0], hB[1], P5.skin, 4.4) + handC(w, hF[0], hF[1], P5.skin, 4.4);
      }
    });
  }
};

window.POSES = { maria: POSE_MARIA, pedro: POSE_PEDRO };
window.drawPose = (who, pose) => {
  uid = 0;
  document.getElementById('dyn').innerHTML = window.POSES[who][pose]();
};
window.loadFonts = async fonts => {
  const b64ToBuf = b => Uint8Array.from(atob(b), c => c.charCodeAt(0)).buffer;
  for (const [fam, wt, b64] of fonts) { const ff = new FontFace(fam, b64ToBuf(b64), { weight: String(wt) }); await ff.load(); document.fonts.add(ff); }
  await document.fonts.ready;
};
