# Corta carrusel/personajes/pedro_sonriendo.png en piezas (cuerpo, brazos, piernas)
# para animar a Pedro sin cambiar su aspecto. Uso: python3 historias/herramientas/piezas_pedro.py
# Escribe historias/personajes/pedro/*.png y piezas.json (posición de cada pieza y su pivote).
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(RAIZ, 'carrusel', 'personajes', 'pedro_sonriendo.png')
OUT = os.path.join(RAIZ, 'historias', 'personajes', 'pedro')
A = np.array(Image.open(SRC).convert('RGBA'))
H, W = A.shape[:2]
RGB = A[:, :, :3].astype(int)
OPACO = A[:, :, 3] > 0
TINTA = (30, 26, 26)

def color(c, tol=10):
    return (np.abs(RGB - np.array(c)).sum(2) < tol) & (A[:, :, 3] > 200)

def componente(m, semilla):
    """Píxeles de m conectados con la semilla (reconstrucción por dilatación)."""
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

oscuro = (RGB.max(2) < 75) & OPACO          # contorno (tinta) y su antialias
verde_o, verde_c = color((42, 115, 68)), color((60, 157, 93))
piel_o, piel_c = color((233, 184, 143)), color((246, 201, 160))

def brazo(manga_m, manga_s, piel_m, piel_s, mano_s):
    rell = componente(manga_m, manga_s) | componente(piel_m, piel_s) | componente(piel_c, mano_s)
    rell = dilata(rell, 1)  # incluye el antialias entre relleno y tinta
    return rell | (dilata(rell, 14) & oscuro)

brazo_i = brazo(verde_o, (600, 705), piel_o, (550, 900), (551, 1062))
brazo_d = brazo(verde_c, (895, 705), piel_c, (950, 900), (947, 1060))

# Torso repintado debajo de mangas y manos (relleno a dos tonos y contorno), solo se ve donde se quitó el brazo.
torso = Image.new('RGBA', (W, H), (0, 0, 0, 0))
dr = ImageDraw.Draw(torso)
izq = [(652, 628), (604, 800), (580, 870), (584, 1000), (577, 1150)]
der = [(923, 1150), (916, 1000), (920, 870), (896, 800), (848, 628)]
abajo = [(577 + (923 - 577) * t, 1150 + 18 * np.sin(np.pi * t)) for t in np.linspace(0, 1, 30)]
poli = izq + abajo[1:-1] + der + [(750, 662)]
dr.polygon(poli, fill=(60, 157, 93, 255))
mascara_osc = Image.new('L', (W, H), 0)
ImageDraw.Draw(mascara_osc).polygon([(0, 0), (688, 0), (688, 700), (676, 1150), (676, H), (0, H)], fill=255)
osc = Image.new('RGBA', (W, H), (42, 115, 68, 255))
tor_np = np.array(torso)
osc_np = np.array(osc)
sel = (np.array(mascara_osc) > 0) & (tor_np[:, :, 3] > 0)
tor_np[sel] = osc_np[sel]
torso = Image.fromarray(tor_np)
dr = ImageDraw.Draw(torso)
dr.line(izq, fill=TINTA + (255,), width=12, joint='curve')
dr.line(der, fill=TINTA + (255,), width=12, joint='curve')
for p in izq + der: dr.ellipse([p[0] - 6, p[1] - 6, p[0] + 6, p[1] + 6], fill=TINTA + (255,))

# Cuerpo: original sin brazos ni piernas (por debajo del pantalón corto)
CORTE = 1245
cuerpo = A.copy()
cuerpo[brazo_i | brazo_d] = 0
cuerpo[CORTE:] = 0
cuerpo_im = Image.alpha_composite(torso, Image.fromarray(cuerpo))
cuerpo_np = np.array(cuerpo_im); cuerpo_np[CORTE:] = 0
cuerpo_im = Image.fromarray(cuerpo_np)

def pieza(np_rgba):
    im = Image.fromarray(np_rgba)
    bb = im.getbbox()
    return im.crop(bb), bb

def pierna(x0, x1):
    p = np.zeros_like(A)
    p[CORTE:, x0:x1] = A[CORTE:, x0:x1]
    for y in range(1170, CORTE): p[y, x0:x1] = A[1300, x0:x1]   # se alarga hacia arriba, oculto bajo el pantalón
    return p

piezas = {}
for nombre, arr, piv in [
    ('pierna_izq', pierna(590, 747), (684, 1215)),
    ('pierna_der', pierna(747, 905), (815, 1215)),
    ('cuerpo', np.array(cuerpo_im), None),
    ('brazo_izq', np.where(brazo_i[:, :, None], A, 0).astype(np.uint8), (612, 690)),
    ('brazo_der', np.where(brazo_d[:, :, None], A, 0).astype(np.uint8), (888, 690)),
]:
    im, bb = pieza(arr)
    im.save(os.path.join(OUT, nombre + '.png'), optimize=True)
    piezas[nombre] = {'x': bb[0], 'y': bb[1], 'w': im.width, 'h': im.height, 'pivote': piv}

json.dump({'fuente': 'carrusel/personajes/pedro_sonriendo.png', 'lienzo': [W, H],
           'orden': ['pierna_izq', 'pierna_der', 'cuerpo', 'brazo_izq', 'brazo_der'], 'piezas': piezas},
          open(os.path.join(OUT, 'piezas.json'), 'w'), indent=1)

# Comprobación: recomponer en reposo y comparar con el original
lienzo = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for n in ['pierna_izq', 'pierna_der', 'cuerpo', 'brazo_izq', 'brazo_der']:
    p = piezas[n]; lienzo.alpha_composite(Image.open(os.path.join(OUT, n + '.png')), (p['x'], p['y']))
fondo = lambda im: Image.alpha_composite(Image.new('RGBA', (W, H), (255, 255, 255, 255)), im).convert('RGB')
d = np.abs(np.array(fondo(lienzo)).astype(int) - np.array(fondo(Image.fromarray(A))).astype(int)).max(2)
print('píxeles distintos (>40):', int((d > 40).sum()), 'de', W * H)
print(json.dumps(piezas))
