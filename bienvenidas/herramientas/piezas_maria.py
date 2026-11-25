# Corta carrusel/personajes/maria_senalando.png en piezas (cuerpo, brazo que señala y manga)
# para que la chica tire del cordón moviendo el brazo, sin cambiar su aspecto: en reposo es igual al PNG.
# Uso: python3 bienvenidas/herramientas/piezas_maria.py
# Escribe bienvenidas/personajes/maria/*.png y piezas.json (posición de cada pieza y el pivote del hombro).
import json, os
import numpy as np
from PIL import Image, ImageFilter

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(RAIZ, 'carrusel', 'personajes', 'maria_senalando.png')
OUT = os.path.join(RAIZ, 'bienvenidas', 'personajes', 'maria')
A = np.array(Image.open(SRC).convert('RGBA'))
RGB = A[:, :, :3].astype(int)
OPACO = A[:, :, 3] > 0

def color(c, tol=12):
    return (np.abs(RGB - np.array(c)).sum(2) < tol) & (A[:, :, 3] > 200)

def componente(m, semilla):
    x, y = semilla
    r = np.zeros_like(m); r[y, x] = True
    while True:
        d = r.copy()
        d[1:] |= r[:-1]; d[:-1] |= r[1:]; d[:, 1:] |= r[:, :-1]; d[:, :-1] |= r[:, 1:]
        d &= m
        if (d == r).all(): return r
        r = d

def dilata(m, rad):
    im = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(2 * rad + 1))
    return np.array(im) > 127

oscuro = (RGB.max(2) < 75) & OPACO
piel = color((246, 201, 160))
azul = color((63, 124, 196))
# brazo: la piel conectada con el antebrazo, la mano y el dedo + su contorno (propio: el que compartía con el pelo se rehace)
rell = dilata(componente(piel, (1150, 740)) | componente(piel, (1258, 742)) | componente(piel, (1350, 685)), 1)
borde = dilata(rell, 11) & ~rell
pelo_cerca = dilata(color((107, 62, 34), 20), 7)
brazo = rell | (borde & ~(pelo_cerca & ~dilata(rell, 11))) | (dilata(rell, 14) & oscuro & ~pelo_cerca)
# manga: el relleno azul del hombro y su contorno (va encima del brazo)
mrell = dilata(componente(azul, (900, 830)), 1)
manga = mrell | (dilata(mrell, 14) & oscuro)
brazo &= ~manga
pelo_rell = color((107, 62, 34), 20)
def pieza(m):
    np_ = np.zeros_like(A); np_[m] = A[m]
    im = Image.fromarray(np_); bb = im.getbbox()
    return im.crop(bb), bb

os.makedirs(OUT, exist_ok=True)
TINTA = np.array([30, 26, 26, 255], dtype=np.uint8)
B = A.copy(); B[~brazo] = 0
B[borde & ~oscuro & ~rell & (A[:, :, 3] > 200)] = TINTA            # contorno del brazo donde antes tocaba el pelo
cuerpo = A.copy(); cuerpo[brazo | manga] = 0
# contorno del pelo donde lo tapaba el brazo
hueco = brazo & ~dilata(rell, 0) | (brazo & ~rell)
linea = dilata(pelo_rell, 11) & ~pelo_rell & (cuerpo[:, :, 3] == 0) & dilata(brazo, 2)
cuerpo[linea] = TINTA
info = {'fuente': 'carrusel/personajes/maria_senalando.png', 'lienzo': [A.shape[1], A.shape[0]], 'orden': ['cuerpo', 'brazo', 'manga'], 'piezas': {}}
for n, m in [('brazo', brazo), ('manga', manga)]:
    im, bb = pieza(m) if n == 'manga' else (lambda im: (im.crop(im.getbbox()), im.getbbox()))(Image.fromarray(B)); im.save(os.path.join(OUT, n + '.png'))
    info['piezas'][n] = {'x': bb[0], 'y': bb[1], 'w': bb[2] - bb[0], 'h': bb[3] - bb[1], 'pivote': [905, 832] if n == 'brazo' else None}
im = Image.fromarray(cuerpo); bb = im.getbbox(); im.crop(bb).save(os.path.join(OUT, 'cuerpo.png'))
info['piezas']['cuerpo'] = {'x': bb[0], 'y': bb[1], 'w': bb[2] - bb[0], 'h': bb[3] - bb[1], 'pivote': None}
info['mano'] = [1258, 742]
json.dump(info, open(os.path.join(OUT, 'piezas.json'), 'w'), indent=1)

# comprobación: en reposo, las piezas juntas dan el PNG original
lienzo = Image.new('RGBA', (A.shape[1], A.shape[0]), (0, 0, 0, 0))
for n in info['orden']:
    p = info['piezas'][n]; lienzo.alpha_composite(Image.open(os.path.join(OUT, n + '.png')), (p['x'], p['y']))
D = np.abs(np.array(lienzo).astype(int) - A.astype(int)).max(2); dif = D.max(); ys, xs = np.nonzero(D > 8)
if len(xs): print('píxeles distintos:', len(xs), 'en x', xs.min(), xs.max(), 'y', ys.min(), ys.max())
print('piezas en', OUT, '· diferencia máxima con el original:', dif)
