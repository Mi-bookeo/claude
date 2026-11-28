#!/usr/bin/env python3
"""Vídeo 20 «Se encienden las luces de Navidad»: corta la grabación completa de la narradora (ElevenLabs,
   audio/voces/original_narradora20.mp3) en 8 archivos, uno por frase, en mitad de las pausas (detección de energía +
   recuento de sílabas para elegir la pausa de cada final de frase):
   1 «Ayer, Tudela se preparaba para encender la Navidad.» (escena 1)
   2 «Todo empezó con el baile: los bailarines llenaron la plaza de ritmo.» (escena 2)
   3 «Y, de pronto, desde el balcón…»  4 «…unas voces que cantaron para toda la plaza.» (escena 3)
   5 «Acompañados del coro de Tudela.» (4) · 6 «Y después de este gran espectáculo… se hizo la luz.» (5)
   7 «Así empieza un diciembre lleno de ilusión. Y nos espera una feliz Navidad.» (6) · 8 «Desde Escaparate de Tudela, feliz Navidad.» (7)
   Salida: audio/voces/narradora_1…8.mp3 (48 kHz, mono, sin acelerar). Después: python3 audio/v20_colocar_voces.py"""
import os, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = lambda *p: os.path.join(ROOT, 'audio', 'voces', *p)
SRC, STEM = V('original_narradora20.mp3'), 'narradora'
CUTS = [3.22, 7.91, 10.17, 13.12, 15.28, 18.85, 24.09]
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
    print(f'{os.path.basename(out):18s} {dur(out):5.2f} s  ({a:.2f}–{b:.2f} s)')
