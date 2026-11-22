#!/usr/bin/env python3
"""Vídeo 12 «Marta y la cesta de bebé». Corta las dos grabaciones de ElevenLabs en una frase por archivo:
     audio/voces/original_narradora.mp3 (voz «Carolina Ruiz») -> narradora_1..4.wav
     audio/voces/original_marta.mp3     (voz «Sofia»)        -> marta_1..3.wav
   Cortes (s) en las pausas entre frases (energía < -30 dB). Cada frase va a su escena (VOICES) empezando
   'start' s después del inicio de la escena; escribe en config.json 'voice' y, para Marta, los tramos «talk» (boca)."""
import json, os, re, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = lambda n: os.path.join(ROOT, 'audio', 'voces', n)
CUTS = {
    'narradora': ('original_narradora.mp3', [(0.00, 3.88), (3.96, 8.04), (8.12, 11.95), (12.02, 13.87)]),
    'marta': ('original_marta.mp3', [(0.00, 2.72), (2.78, 4.92), (5.32, 14.36)]),
}
# escena -> (frase, inicio dentro de la escena). Escenas 5 y 7 sin voz (solo efectos).
# Escenas 3 y 8: la frase de Marta empieza a 1,0 s para que «¡Wow!» y «¡Bien!» coincidan con su rótulo.
VOICES = {1: ('narradora_1', 0.15), 2: ('narradora_2', 0.15), 3: ('marta_1', 1.0), 4: ('narradora_3', 0.15),
          6: ('narradora_4', 0.15), 8: ('marta_2', 1.0), 9: ('marta_3', 0.15)}
TEXT = {
    'narradora_1': 'Marta busca un regalo para la hija recién nacida de su amiga Lucía.',
    'narradora_2': 'Lleva un buen rato buscando por internet, pero nada le convence.',
    'narradora_3': 'Marta entra en la oferta y habla con la farmacia directamente.',
    'narradora_4': 'Y el viernes, a recogerla.',
    'marta_1': '¡Wow! ¡Treinta por ciento de descuento!',
    'marta_2': '¡Bien! Ya tengo lo que quería.',
    'marta_3': 'Si tú también quieres empezar a beneficiarte de las ofertas y descuentos de los comercios de Tudela, apúntate al canal. Escribe canal y te enviamos el enlace directo.',
}
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', '48000', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<f4')
def talk_ranges(x, gap=0.16, th=-32):
    """tramos con voz (se unen huecos < gap s)"""
    hop = 480; r = np.sqrt((x[: len(x) // hop * hop].reshape(-1, hop) ** 2).mean(1))
    on = 20 * np.log10(r / max(r.max(), 1e-9) + 1e-9) > th
    idx = np.flatnonzero(on); out = []
    for i in idx:
        if out and i * 0.01 - out[-1][1] <= gap: out[-1][1] = (i + 1) * 0.01
        else: out.append([i * 0.01, (i + 1) * 0.01])
    return [r_ for r_ in out if r_[1] - r_[0] > 0.12]
cfg = json.load(open(os.path.join(ROOT, 'config.json')))
byid = {s['id']: s for s in cfg['scenes']}
for who, (src, cuts) in CUTS.items():
    for i, (a, b) in enumerate(cuts, 1):
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(a), '-to', str(b), '-i', V(src), '-af', f'afade=t=in:d=0.02,afade=t=out:st={b - a - 0.04:.3f}:d=0.04',
                        '-ac', '1', '-ar', '48000', V(f'{who}_{i}.wav')], check=True)
for sid, (name, st) in VOICES.items():
    x = load(V(name + '.wav')); d = len(x) / 48000; sc = byid[sid]
    tr = [[round(p + st, 2), round(q + st - 0.03, 2)] for p, q in talk_ranges(x)]
    sc['voice'] = {'file': f'audio/voces/{name}.wav', 'start': st, 'duration': round(d, 2), 'text': TEXT[name], 'segments': tr}
    if name.startswith('marta'): sc['talk'] = tr
    print(f'escena {sid}: {name} {d:.2f} s desde {st} s (escena {sc["duration"]} s) tramos={tr}' + ('  <-- NO CABE' if st + d > sc['duration'] - 0.1 else ''))
txt = json.dumps(cfg, ensure_ascii=False, indent=2)
txt = re.sub(r'\[\s+([\d.]+),\s+([\d.]+)\s+\]', r'[\1, \2]', txt)
open(os.path.join(ROOT, 'config.json'), 'w').write(txt + '\n')
