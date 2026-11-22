#!/usr/bin/env python3
"""Corta los audios de ElevenLabs (audio/voces/original_*.mp3) en una frase por archivo y guarda los tiempos de los
subtítulos de cada frase (audio/voces/cues.json, relativos al inicio de cada archivo cortado).

  python3 audio/cortar_voces.py

Narración (un archivo con las 8 frases): cortes en las pausas medidas con silencedetect (-35 dB, 0,12 s).
Las frases largas se parten en dos subtítulos por el punto de menos energía cerca del corte previsto."""
import json, os, subprocess
import numpy as np

A = os.path.dirname(os.path.abspath(__file__))
V = os.path.join(A, 'voces')
SR = 48000
SRC = {
    'narracion': os.path.join(V, 'original_narracion.mp3'),   # Javier Rojas (narración)
    'carmen': os.path.join(V, 'original_carmen.mp3'),         # Lydia: «¿Pero adónde va todo el mundo?»
    'maria': os.path.join(V, 'original_maria.mp3'),           # Lydia (susurro): «Y me han dicho que es gratis…»
}

def decode(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)

def dip(x, t_est, win=0.45):
    """instante de menos energía (ventanas de 20 ms) alrededor de t_est."""
    hop = int(0.02 * SR); best, bt = 1e9, t_est
    for c in np.arange(t_est - win, t_est + win, 0.01):
        i = int(c * SR); e = float(np.mean(x[i:i + hop] ** 2))
        if e < best: best, bt = e, c
    return round(bt, 2)

def speech_bounds(x, thr=0.01):
    a = np.abs(x); idx = np.where(a > thr)[0]
    return idx[0] / SR, idx[-1] / SR

def save(name, x, a, b):
    i, j = max(0, int(a * SR)), min(len(x), int(b * SR))
    y = x[i:j].copy(); f = int(0.01 * SR)
    y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    p = os.path.join(V, f'{name}.wav')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f64le', '-ar', str(SR), '-ac', '1', '-i', '-', '-c:a', 'pcm_s16le', p], input=y.tobytes(), check=True)
    return p

nar = decode(SRC['narracion'])
# (inicio de voz, fin de voz) de cada frase y subtítulos [inicio, fin, texto] en tiempo del original
PH = [
    ('narradora_1', 0.00, 3.80, [(0.00, 1.62, 'Dos tiendas de moda en Tudela.'), (2.02, 3.80, 'Dos calles muy distintas.')]),
    ('narradora_2', 4.31, 10.50, [(4.31, 6.59, 'Carmen tiene su tienda en la avenida principal.'), (7.01, 8.51, 'Pasa muchísima gente…'), (9.20, 10.50, '…pero casi nadie entra.')]),
    ('narradora_3', 11.08, 14.72, [(11.08, 13.40, 'María tiene la suya en una callejuela'), (13.55, 14.72, 'donde casi no pasa nadie.')]),
    ('narradora_4', 15.11, 17.68, [(15.11, 17.68, 'Y, sin embargo, siempre la tiene llena.')]),
    ('narradora_5', 17.96, 21.74, [(17.96, 19.66, 'Porque ya no basta con que te vean.'), (19.96, 21.74, 'Tienen que saber que existes.')]),
    ('narradora_6', 22.11, 25.82, None),
    ('narradora_7', 26.10, 28.69, [(26.10, 28.69, 'Y llegan directamente a la mano de sus clientes.')]),
    ('narradora_8', 29.13, 36.06, [(29.13, 32.02, 'Escaparate de Tudela hace que tu comercio exista.'), (32.36, 33.45, 'Si tienes un comercio,'), (33.62, 36.06, 'comenta ALTA y te enviamos la solicitud.')]),
]
# narradora_6: se parte en «…novedades y ofertas» / «en Escaparate de Tudela.» por el valle de energía
d6 = dip(nar, 22.11 + 3.71 * 0.62)
PH[5] = ('narradora_6', 22.11, 25.82, [(22.11, d6, 'María publica sus novedades y ofertas'), (d6, 25.82, 'en Escaparate de Tudela.')])

cues = {}
PRE, POST = 0.06, 0.14
for name, a, b, subs in PH:
    c0 = max(0, a - PRE)
    save(name, nar, c0, b + POST)
    cues[name] = [[round(s - c0, 3), round(e - c0, 3), txt] for s, e, txt in subs]

car = decode(SRC['carmen']); a, b = speech_bounds(car)
c0 = max(0, a - PRE); save('carmen_1', car, c0, b + POST)
cues['carmen_1'] = [[round(a - c0, 3), round(b - c0, 3), '¿Pero adónde va todo el mundo?']]

mar = decode(SRC['maria']); a, b = speech_bounds(mar, 0.006)
c0 = max(0, a - PRE); save('maria_1', mar, c0, b + POST)
dm = dip(mar, a + (b - a) * 0.47)
cues['maria_1'] = [[round(a - c0, 3), round(dm - c0, 3), 'Y me han dicho que es gratis'], [round(dm - c0, 3), round(b - c0, 3), 'hasta el 31 de enero.']]

json.dump(cues, open(os.path.join(V, 'cues.json'), 'w'), ensure_ascii=False, indent=1)
for k, v in cues.items():
    print(k, ' | '.join(f'{s:.2f}-{e:.2f} {t}' for s, e, t in v))
