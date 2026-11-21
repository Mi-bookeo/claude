#!/usr/bin/env python3
"""Quita el fondo opaco de los logos de la raíz (1000x1000) y guarda copias transparentes en assets/.
   logo_blanco.png (letras blancas, para fondos rojos): fondo azul marino -> transparente (unmix por «azulidad»).
   logo_rojo.png (letras rojas, para fondos claros): mismo alfa que el blanco (geometría idéntica).
   Los originales no se tocan."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def unmix(px, a, bg):
    a3 = np.clip(a, 1e-3, 1)[..., None]
    return np.clip((px - (1 - a3) * bg) / a3, 0, 255)

# --- blanco: fondo azul (con viñeta) ---
im = np.asarray(Image.open(os.path.join(ROOT, 'logo_blanco.png')).convert('RGB')).astype(float)
r, g, b = im[..., 0], im[..., 1], im[..., 2]
blue = np.clip((b - np.maximum(r, g)) / 60.0, 0, 1)
a = 1 - blue
bg = np.array([17, 49, 121], float)
# color de fondo local (viñeta): usa el propio píxel si es fondo puro
out = np.dstack([unmix(im, a, bg), a * 255]).astype(np.uint8)
Image.fromarray(out, 'RGBA').save(os.path.join(ROOT, 'assets', 'logo_blanco_t.png'))

# --- rojo: misma geometría que el blanco -> se reutiliza su alfa (limpio también en el toldo) y se
#     recupera el color rojo des-mezclando con el fondo blanco ---
im = np.asarray(Image.open(os.path.join(ROOT, 'logo_rojo.png')).convert('RGB')).astype(float)
out = np.dstack([unmix(im, a, np.array([255, 255, 255], float)), a * 255]).astype(np.uint8)
Image.fromarray(out, 'RGBA').save(os.path.join(ROOT, 'assets', 'logo_rojo_t.png'))
print('ok')
