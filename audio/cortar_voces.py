#!/usr/bin/env python3
"""Vídeo 13 «José y las tortillas». Corta las dos grabaciones de ElevenLabs en una frase por archivo:
     audio/voces/original_narradora.mp3 (voz «Carolina Ruiz») -> narradora_1..6.wav
     audio/voces/original_jose.mp3      (voz «Javi Rojas»)    -> jose_1..6.wav
   Cortes (s) en las pausas entre frases (energía < -30 dB). Cada frase va a su escena (VOICES) empezando 'start' s
   después del inicio de la escena (o del plano); escribe en config.json la lista 'voices' de cada escena
   (archivo, inicio, duración real, texto y tramos con voz) y avisa si alguna frase no cabe en su escena."""
import json, os, re, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = lambda n: os.path.join(ROOT, 'audio', 'voces', n)
CUTS = {
    'narradora': ('original_narradora.mp3', [(0.00, 2.55), (2.66, 6.50), (6.62, 13.08), (13.40, 16.04), (16.30, 18.92), (18.95, 22.05)]),
    'jose': ('original_jose.mp3', [(0.00, 2.18), (2.56, 4.76), (5.02, 7.52), (7.77, 11.52), (11.94, 16.20), (16.47, 24.19)]),
}
# escena -> [(frase, inicio dentro de la escena)]
VOICES = {1: [('narradora_1', 0.15)], 2: [('narradora_2', 0.15)], 3: [('jose_1', 0.3)], 4: [('jose_2', 0.35)],
          5: [('narradora_3', 0.15), ('jose_3', 6.75)], 6: [('narradora_4', 0.15)], 7: [('narradora_5', 0.15)],
          8: [('narradora_6', 0.15)], 9: [('jose_4', 0.25)], 10: [('jose_5', 0.15), ('jose_6', 4.6)]}
TEXT = {
    'narradora_1': 'Las cuatro de la tarde en el bar La Tortilla.',
    'narradora_2': 'Ha tenido poca gente por la mañana y le han sobrado muchas tortillas.',
    'narradora_3': 'Publica una oferta flash: pincho de tortilla y bebida por tres euros con cincuenta, de seis a ocho.',
    'narradora_4': 'Y la oferta le llega directamente a la gente.',
    'narradora_5': 'A las seis, el bar empieza a llenarse.',
    'narradora_6': 'Y a las ocho, la barra de tortillas está vacía.',
    'jose_1': 'Voy a tener que tirarlas...',
    'jose_2': '¡Espera! ¡Escaparate de Tudela!',
    'jose_3': 'Así, con suerte, se quedan después de las ocho.',
    'jose_4': '¡Día terminado con éxito! ¡Todas las tortillas vendidas!',
    'jose_5': 'Si tú también tienes un negocio, comenta alta y te enviamos el formulario.',
    'jose_6': 'Y si no, busca en la descripción el canal de WhatsApp, para que te lleguen todas las publicaciones a tu móvil y no te pierdas ninguna.',
}
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', '48000', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<f4')
def talk_ranges(x, gap=0.25, th=-32):
    """tramos con voz (se unen huecos < gap s)"""
    hop = 480; r = np.sqrt((x[: len(x) // hop * hop].reshape(-1, hop) ** 2).mean(1))
    on = 20 * np.log10(r / max(r.max(), 1e-9) + 1e-9) > th
    out = []
    for i in np.flatnonzero(on):
        if out and i * 0.01 - out[-1][1] <= gap: out[-1][1] = (i + 1) * 0.01
        else: out.append([i * 0.01, (i + 1) * 0.01])
    return [r_ for r_ in out if r_[1] - r_[0] > 0.12]
def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True).stdout)
cfg = json.load(open(os.path.join(ROOT, 'config.json')))
byid = {s['id']: s for s in cfg['scenes']}
for who, (src, cuts) in CUTS.items():
    for i, (a, b) in enumerate(cuts, 1):
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(a), '-to', str(b), '-i', V(src), '-af', f'afade=t=in:d=0.02,afade=t=out:st={b - a - 0.04:.3f}:d=0.04',
                        '-ac', '1', '-ar', '48000', V(f'{who}_{i}.wav')], check=True)
for sid, lst in VOICES.items():
    sc = byid[sid]; sc['voices'] = []
    for name, st in lst:
        d = dur(V(name + '.wav'))
        tr = [[round(p + st, 2), round(q + st - 0.03, 2)] for p, q in talk_ranges(load(V(name + '.wav')))]
        sc['voices'].append({'file': f'audio/voces/{name}.wav', 'start': st, 'duration': round(d, 3), 'text': TEXT[name], 'segments': tr})
        print(f'escena {sid}: {name} {d:.2f} s desde {st} s (escena {sc["duration"]} s)' + ('  <-- NO CABE' if st + d > sc['duration'] - 0.1 else ''))
txt = json.dumps(cfg, ensure_ascii=False, indent=2)
txt = re.sub(r'\[\s+([\d.]+),\s+([\d.]+)\s+\]', r'[\1, \2]', txt)
open(os.path.join(ROOT, 'config.json'), 'w').write(txt + '\n')
