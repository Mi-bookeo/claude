#!/usr/bin/env python3
"""Vídeo 14: corta las cuatro grabaciones (una por personaje, ElevenLabs) en un archivo por frase, en los silencios
   entre frases (dentro de las pausas medidas con silencedetect). Salida: audio/voces/<voz>_<n>.wav (48 kHz, mono).
     original_narradora.mp3 (Javier Rojas) -> narradora_1…4
     original_ana.mp3       (Eva Dorado)    -> ana_1…6
     original_madre.mp3     (Lydia)         -> madre_1…2
     original_vecino.mp3    (Javi Rojas)    -> vecino_1…2   (el padre con su hijo)
   Después: python3 audio/colocar_voces.py"""
import os, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = lambda *p: os.path.join(ROOT, 'audio', 'voces', *p)
CUTS = {  # segundos donde se corta (dentro de las pausas entre frases)
    'narradora': [4.70, 10.10, 12.05],
    'ana': [4.05, 6.05, 9.20, 11.70, 13.70],
    'madre': [2.78],
    'vecino': [2.97],
}
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True).stdout)
# quita el silencio del principio y del final de cada frase
AF = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.04,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse'
for who, cuts in CUTS.items():
    src = V(f'original_{who}.mp3'); pts = [0.0] + cuts + [dur(src)]
    for i in range(len(pts) - 1):
        out = V(f'{who}_{i + 1}.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ss', f'{pts[i]:.3f}', '-to', f'{pts[i + 1]:.3f}', '-af', AF, '-ar', '48000', '-ac', '1', out], check=True)
        print(f'{os.path.basename(out):16s} {dur(out):5.2f} s  ({pts[i]:.2f}–{pts[i + 1]:.2f} s de {os.path.basename(src)})')
