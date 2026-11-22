#!/usr/bin/env python3
"""Corta audio/voces/original_marta.mp3 (ElevenLabs, voz «Sofia») en las 7 frases del guion -> audio/voces/marta_<n>.wav
   y escribe en config.json los tramos «talk» (boca) de cada escena a partir de los silencios de la propia voz.
   Cortes (s) elegidos en las pausas largas entre frases (silencedetect -38 dB):
     1 «¿Sabes por qué…? Te doy cuatro motivos…»   2 «Uno: …novedades…»   3 «Dos: …descuentos…»
     4 «Tres: …eventos…»   5 «Y cuatro, el mejor de todos: …comercio local…»   6 «…comenta canal…»   7 «Y comparte este vídeo…»
   La voz empieza VOFF s después del inicio de su escena (make_audio.py usa el mismo valor)."""
import json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'audio', 'voces', 'original_marta.mp3')
CUTS = [(0.00, 7.05), (7.55, 12.62), (13.02, 18.00), (18.42, 21.81), (22.24, 28.65), (29.13, 34.50), (34.79, 40.32)]
VOFF = 0.15

def silences(path, a, b):
    r = subprocess.run(['ffmpeg', '-v', 'info', '-ss', str(a), '-to', str(b), '-i', path, '-af', 'silencedetect=noise=-38dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', r)]
    en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', r)]
    return list(zip(st, en + [b - a] * (len(st) - len(en))))

cfg = json.load(open(os.path.join(ROOT, 'config.json')))
for i, (a, b) in enumerate(CUTS, 1):
    out = os.path.join(ROOT, 'audio', 'voces', f'marta_{i}.wav')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(a), '-to', str(b), '-i', SRC, '-af', f'afade=t=in:d=0.02,afade=t=out:st={b - a - 0.03:.3f}:d=0.03',
                    '-ac', '1', '-ar', '48000', out], check=True)
    d = b - a
    # tramos con voz = complemento de los silencios
    talk, cur = [], 0.0
    for s0, s1 in silences(SRC, a, b):
        if s0 - cur > 0.08: talk.append([cur, s0])
        cur = s1
    if d - cur > 0.08: talk.append([cur, d])
    talk = [[round(x + VOFF, 2), round(y + VOFF - 0.04, 2)] for x, y in talk]
    sc = cfg['scenes'][i - 1]
    sc['talk'] = talk
    sc['voice'] = {'file': f'audio/voces/marta_{i}.wav', 'start': VOFF, 'duration': round(d, 2)}
    print(f'marta_{i}: {d:.2f} s  talk={talk}  escena={sc["duration"]} s')
    if VOFF + d > sc['duration']: print(f'  AVISO: la frase {i} no cabe en su escena ({VOFF + d:.2f} > {sc["duration"]})')
txt = json.dumps(cfg, ensure_ascii=False, indent=2)
txt = re.sub(r'\[\s+([\d.]+),\s+([\d.]+)\s+\]', r'[\1, \2]', txt)
open(os.path.join(ROOT, 'config.json'), 'w').write(txt + '\n')
