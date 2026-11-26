#!/usr/bin/env python3
"""Vídeo 17 «Próxima apertura»: corta la grabación completa de María (ElevenLabs, audio/voces/original_maria.mp3)
   en un archivo por frase, en las pausas entre frases (medidas por energía en ventanas de 20 ms).
   Salida: audio/voces/maria_1…7.mp3 (48 kHz, mono). Después: python3 audio/v17_colocar_voces.py"""
import os, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = lambda *p: os.path.join(ROOT, 'audio', 'voces', *p)
CUTS = [3.41, 7.51, 13.25, 18.43, 25.51, 30.51]   # segundos (dentro de las pausas entre frases)
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True).stdout)
def trim(src, a, b):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, '<f4'); n = 320
    r = 20 * np.log10(np.sqrt((x[: len(x) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9)
    on = np.where(r > r.max() - 38)[0]
    return a + max(0, on[0] * 0.02 - 0.05), a + min(b - a, (on[-1] + 1) * 0.02 + 0.12)
src = V('original_maria.mp3'); pts = [0.0] + CUTS + [dur(src)]
for i in range(len(pts) - 1):
    out = V(f'maria_{i + 1}.mp3')
    a, b = trim(src, pts[i], pts[i + 1])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-af', 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse', '-ar', '48000', '-ac', '1', '-c:a', 'libmp3lame', '-q:a', '2', out], check=True)
    print(f'{os.path.basename(out):12s} {dur(out):5.2f} s  ({a:.2f}–{b:.2f} s)')
