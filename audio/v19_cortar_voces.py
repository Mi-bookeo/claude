#!/usr/bin/env python3
"""Vídeo 19 «El precio de antes»: corta la grabación completa de la narradora (ElevenLabs, audio/voces/original_narradora19.mp3)
   en 11 archivos, uno por bloque de escena, en mitad de las pausas (silencedetect + recuento de sílabas):
   1 «Dos carteles… ¿Cuál vende más? A la izquierda… A la derecha… doce euros.» (escena 1)
   2 «Tu cerebro no calcula.»  3 «Compara.» (escena 2)
   4 «Sin una referencia… es poco. Con el precio de antes, lo ve claro: es un ahorro.» (escena 3)
   5 «Eso se llama efecto ancla.»  6 «El primer número que ves…» (escena 4)
   7 «Pero ojo…» (5) · 8 «En Escaparate de Tudela…» (6) · 9 «Si tienes un comercio…» 10 «O comenta alta…» (7) · 11 «Escaparate de Tudela. Tus ofertas…» (8)
   Salida: audio/voces/narradora19_1…11.mp3 (48 kHz, mono). Después: python3 audio/v19_colocar_voces.py"""
import os, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = lambda *p: os.path.join(ROOT, 'audio', 'voces', *p)
SRC, STEM = V('original_narradora19.mp3'), 'narradora19'
CUTS = [11.45, 13.17, 14.0, 22.2, 24.38, 30.29, 35.93, 41.83, 45.56, 47.75]
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True).stdout)
def trim(src, a, b):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, '<f4'); n = 320
    r = 20 * np.log10(np.sqrt((x[: len(x) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9)
    on = np.where(r > r.max() - 38)[0]
    return a + max(0, on[0] * 0.02 - 0.05), a + min(b - a, (on[-1] + 1) * 0.02 + 0.12)
pts = [0.0] + CUTS + [dur(SRC)]
for i in range(len(pts) - 1):
    out = V(f'{STEM}_{i + 1}.mp3'); a, b = trim(SRC, pts[i], pts[i + 1])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-af', 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse', '-ar', '48000', '-ac', '1', '-c:a', 'libmp3lame', '-q:a', '2', out], check=True)
    print(f'{os.path.basename(out):20s} {dur(out):5.2f} s  ({a:.2f}–{b:.2f} s)')
