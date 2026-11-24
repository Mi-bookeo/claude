#!/usr/bin/env python3
"""Vídeo 15 «Se lanza Escaparate de Tudela»: corta las dos grabaciones (ElevenLabs) en un archivo por frase, en las
   pausas entre frases (medidas por energía en ventanas de 20 ms). Salida: audio/voces/<voz>_<n>.wav (48 kHz, mono).
     original_maria.mp3 (Sofia) -> maria_1…7
     original_mari.mp3  (Lydia) -> mari_1…3   (Mari Carmen)
   Después: python3 audio/colocar_voces.py"""
import os, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = lambda *p: os.path.join(ROOT, 'audio', 'voces', *p)
CUTS = {  # segundos donde se corta (dentro de las pausas entre frases)
    'maria': [5.74, 14.38, 16.98, 24.04, 26.90, 31.83],
    'mari': [4.90, 8.22],
}
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True).stdout)
def trim(src, a, b):
    """quita el silencio del principio y del final del tramo [a, b] (energía < -40 dBFS en ventanas de 20 ms)"""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, '<f4'); n = 320
    r = 20 * np.log10(np.sqrt((x[: len(x) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9)
    on = np.where(r > -40)[0]
    return a + max(0, on[0] * 0.02 - 0.05), a + min(b - a, (on[-1] + 1) * 0.02 + 0.12)
for who, cuts in CUTS.items():
    src = V(f'original_{who}.mp3'); pts = [0.0] + cuts + [dur(src)]
    for i in range(len(pts) - 1):
        out = V(f'{who}_{i + 1}.wav')
        a, b = trim(src, pts[i], pts[i + 1])
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-af', 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse', '-ar', '48000', '-ac', '1', out], check=True)
        print(f'{os.path.basename(out):14s} {dur(out):5.2f} s  ({a:.2f}–{b:.2f} s de {os.path.basename(src)})')
