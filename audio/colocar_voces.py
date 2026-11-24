#!/usr/bin/env python3
"""Vídeo 14 «Ana y el cuentacuentos»: coloca las voces (un archivo por frase en audio/voces/) en config.json.
   Correspondencia (dentro de una escena, en este orden, empezando al inicio de la escena y una tras otra):
     narradora_1→1 · ana_1→2 · ana_2→3 · narradora_2→4 · ana_3→5 · madre_1, narradora_3→6 ·
     vecino_1, madre_2, vecino_2→7 · narradora_4→8 · ana_4→9 · ana_5, ana_6→10
   - Duración real de cada archivo con ffprobe; tramos con voz (para los subtítulos) por energía.
   - Si una frase no cabe en su escena, alarga la escena ('duration') y lo avisa (hay que volver a renderizar esa escena).
   - Sincroniza con las voces los momentos (cues) de las escenas 7 y 10 y el plano final (FIN) de la escena 10.
   Acepta .wav o .mp3 (audio/voces/<voz>_<n>.wav|.mp3)."""
import json, os, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = os.path.join(ROOT, 'config.json')
cfg = json.load(open(CFG))
FPS = cfg['fps']
MAP = {1: ['narradora_1'], 2: ['ana_1'], 3: ['ana_2'], 4: ['narradora_2'], 5: ['ana_3'], 6: ['madre_1', 'narradora_3'],
       7: ['vecino_1', 'madre_2', 'vecino_2'], 8: ['narradora_4'], 9: ['ana_4'], 10: ['ana_5', 'ana_6']}
TEXT = {
    'narradora_1': 'Ana tiene una librería en Tudela y quiere organizar un cuentacuentos para niños.',
    'ana_1': 'Me encantaría organizar un cuentacuentos... pero...',
    'ana_2': 'El año pasado no vino nadie.',
    'narradora_2': 'Pero dicen los expertos que la gente atrae a la gente. Se llama prueba social.',
    'ana_3': 'Pues esta vez lo voy a anunciar en Escaparate de Tudela.',
    'madre_1': '¡Mira, cariño! ¡Cuentacuentos en la librería!',
    'narradora_3': 'Y el evento les llega al móvil.',
    'vecino_1': '¿Qué pasa en la librería? ¡Cuántos niños!',
    'madre_2': 'Hay un cuentacuentos para niños. ¡Ven!',
    'vecino_2': 'Venga, hijo, vamos a entrar.',
    'narradora_4': 'Los primeros atraen a los siguientes, y la librería se llena.',
    'ana_4': '¡Este año, la librería llena!',
    'ana_5': 'Los primeros atraen a los demás.',
    'ana_6': 'Si tienes un negocio, comenta alta y te enviamos el formulario.',
}
START, GAP, TAIL = 0.15, 0.3, 0.35   # inicio de la 1.ª frase, hueco entre frases, margen al final de la escena
SR = 16000

def find(name):
    for ext in ('.wav', '.mp3', '.m4a', '.ogg'):
        p = os.path.join(ROOT, 'audio', 'voces', name + ext)
        if os.path.exists(p): return p
    return None
def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True).stdout)
def segments(p):
    """tramos con voz (s, relativos al archivo): energía en ventanas de 20 ms, pausas > 0,25 s separan tramos"""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, '<f4'); n = int(0.02 * SR)
    r = np.sqrt((x[: len(x) // n * n].reshape(-1, n) ** 2).mean(1)) if len(x) >= n else np.zeros(1)
    on = r > max(r.max() * 0.08, 1e-4)
    segs, a, last = [], None, None
    for i, v in enumerate(on):
        t = i * 0.02
        if v:
            if a is None: a = t
            elif t - last > 0.25: segs.append([a, last + 0.02]); a = t
            last = t
    if a is not None: segs.append([a, last + 0.02])
    return [[round(a_, 2), round(b_, 2)] for a_, b_ in segs]
snap = lambda x: round(round(x * FPS) / FPS, 3)

missing, changed = [], []
for sc in cfg['scenes']:
    names = MAP[sc['id']]; t = START; vs = []
    for nm in names:
        p = find(nm)
        if not p: missing.append(nm); continue
        d = dur(p); sg = segments(p)
        vs.append({'file': os.path.relpath(p, ROOT), 'start': round(t, 3), 'duration': round(d, 3), 'text': TEXT[nm],
                   'segments': [[round(t + a, 2), round(t + b, 2)] for a, b in sg]})
        t += d + GAP
    sc['voices'] = vs
    if not vs: continue
    end = vs[-1]['start'] + vs[-1]['duration']
    sid = sc['id']
    if sid == 10:
        # «¿Tienes un negocio?» / «Comenta ALTA» / «y te enviamos el formulario» siguen a ana_6; el plano final llega después
        v6 = vs[-1]; a6, d6 = v6['start'], v6['duration']; txt = TEXT['ana_6']
        sp = (v6['segments'][0][0] - a6) if v6['segments'] else 0
        frac = lambda s: sp + (d6 - sp) * len(s) / len(txt)
        c = sc['cues']
        c['a1'] = round(a6, 2); c['near'] = round(max(2.4, a6 - 0.2), 2); c['walk'] = 0.8
        c['strip'] = round(a6 + frac('Si tienes un negocio, '), 2)
        c['sub'] = round(a6 + frac('Si tienes un negocio, comenta alta '), 2)
        c['thumb'] = round(c['strip'] + 1.0, 2)
        c['wa'] = round(a6 + d6 + 0.2, 2); c['url'] = round(c['wa'] + 0.7, 2)
        fin = snap(max(10.0, c['url'] + 2.2))
        sc['shots'] = {'A': [0, fin], 'FIN': [fin, snap(fin + 2.0)]}
        nd = snap(fin + 2.0)
        if abs(nd - sc['duration']) > 1e-6: changed.append((sid, sc['duration'], nd)); sc['duration'] = nd
        continue
    if sid == 7 and len(vs) == 3:
        c = sc['cues']
        c['stop'] = round(vs[0]['start'] + vs[0]['duration'], 2)     # el padre se para al terminar su pregunta
        c['wave'] = round(vs[1]['start'] - 0.1, 2)                    # la madre le hace señas mientras habla
        c['go'] = round(vs[2]['start'] + 0.2, 2)                      # «Venga, hijo, vamos a entrar»
    if end + TAIL > sc['duration']:
        nd = snap(end + TAIL)
        changed.append((sid, sc['duration'], nd)); sc['duration'] = nd
json.dump(cfg, open(CFG, 'w'), ensure_ascii=False, indent=2)

fr = 0
for sc in cfg['scenes']:
    st = fr / FPS
    for v in sc.get('voices', []):
        print(f"escena {sc['id']:2d}  {os.path.basename(v['file']):16s} {v['duration']:5.2f} s   {st + v['start']:6.2f} → {st + v['start'] + v['duration']:6.2f} s   «{v['text']}»")
    fr += round(sc['duration'] * FPS)
print(f'TOTAL {fr / FPS:.2f} s')
if missing: print('FALTAN VOCES:', ', '.join(missing))
for sid, a, b in changed: print(f'escena {sid}: duración {a:.3f} → {b:.3f} s  (volver a renderizar)')
if changed: print('RENDER:', ','.join(str(s[0]) for s in changed))
sys.exit(2 if missing else 0)
