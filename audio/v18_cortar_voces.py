#!/usr/bin/env python3
"""Vídeo 18 «Pedro y la ITV»: corta las grabaciones completas (ElevenLabs) en un archivo por frase, en las pausas
   entre frases (medidas por energía en ventanas de 20 ms; ver CUTS). Pedro: audio/voces/original_pedro18.mp3
   (voz «Dani»), 13 frases. Mecánico: audio/voces/original_mecanico18.mp3 (voz «Martin»), 1 frase.
   Salida: audio/voces/pedro18_1…13.mp3 y mecanico18_1.mp3 (48 kHz, mono). Después: python3 audio/v18_colocar_voces.py"""
import os, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = lambda *p: os.path.join(ROOT, 'audio', 'voces', *p)
# cortes (s) en mitad de las pausas: ¿Desfavorable? | ¿Por las ruedas? | Vaya por Dios. | ¿Y ahora…? | Y a ver… |
# A ver si en Escaparate… | ¡Bingo!… | Buenas… ¿Puedo pasar ahora? | ¡Dos por uno!… | ¡Favorable!… | Si tú también… |
# O comenta canal… | Escaparate de Tudela. No te pierdas ninguna.
CUTS = {'original_pedro18.mp3': ('pedro18', [1.07, 2.28, 3.67, 6.15, 8.42, 10.85, 13.26, 20.68, 23.58, 26.17, 33.56, 35.14]),
        'original_mecanico18.mp3': ('mecanico18', [])}
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True).stdout)
def trim(src, a, b):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, '<f4'); n = 320
    r = 20 * np.log10(np.sqrt((x[: len(x) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9)
    on = np.where(r > r.max() - 38)[0]
    return a + max(0, on[0] * 0.02 - 0.05), a + min(b - a, (on[-1] + 1) * 0.02 + 0.12)
for fn, (stem, cuts) in CUTS.items():
    src = V(fn); pts = [0.0] + cuts + [dur(src)]
    for i in range(len(pts) - 1):
        out = V(f'{stem}_{i + 1}.mp3')
        a, b = trim(src, pts[i], pts[i + 1])
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-af', 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse', '-ar', '48000', '-ac', '1', '-c:a', 'libmp3lame', '-q:a', '2', out], check=True)
        print(f'{os.path.basename(out):18s} {dur(out):5.2f} s  ({a:.2f}–{b:.2f} s)')
