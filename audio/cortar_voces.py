#!/usr/bin/env python3
"""Corta audio/voces/original_todas_las_voces.mp3 (todas las frases seguidas, una narradora, ElevenLabs) en un WAV por frase.
Cortes en las pausas detectadas (silencedetect -40 dB, 0,18 s). narradora_5 tiene dos partes: la segunda se retrasa
para que empiece justo cuando la escena 6 cambia a «¿Eres comercio?» (config.json: swap)."""
import json, os, subprocess
A = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(A)
SRC = os.path.join(A, 'voces', 'original_todas_las_voces.mp3')
cfg = json.load(open(os.path.join(ROOT, 'config.json')))
sc6 = next(s for s in cfg['scenes'] if s['id'] == 6)
LEAD = 0.12  # igual que make_audio.py
# nombre: [(inicio, fin, retraso_de_inicio_en_la_escena o None)]
CUTS = {
    'narradora_1': [(0.00, 3.30, None)],
    'narradora_2': [(3.85, 11.10, None)],
    'narradora_3': [(11.33, 14.58, None)],
    'narradora_4': [(14.74, 19.17, None)],
    'narradora_5': [(19.40, 22.26, None), (22.40, 25.39, sc6.get('swap', 4.0) + 0.1)],
}
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
for name, parts in CUTS.items():
    flt, labels, pos = '', '', 0.0
    for i, (a, b, at) in enumerate(parts):
        pad = 0.0
        if at is not None: pad = max(0.25, (at - LEAD) - pos)
        flt += f'[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,areverse,afade=t=in:d=0.03,areverse,adelay={int(pad * 1000)}:all=1[p{i}];'
        labels += f'[p{i}]'; pos += pad + (b - a)
    flt += labels + f'concat=n={len(parts)}:v=0:a=1[o]'
    out = os.path.join(A, 'voces', name + '.wav')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', SRC, '-filter_complex', flt, '-map', '[o]', '-ar', '48000', '-ac', '1', out], check=True)
    print(f'{name:12s} {parts[0][0]:6.2f}-{parts[-1][1]:6.2f}  -> {dur(out):.2f} s')
