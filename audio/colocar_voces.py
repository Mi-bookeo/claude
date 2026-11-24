#!/usr/bin/env python3
"""Vídeo 16 «El hueco de las cinco»: coloca las voces (un archivo por frase en audio/voces/) en config.json.
   Correspondencia (dentro de una escena, en este orden, al inicio y una tras otra):
     narradora_1→1 · narradora_2, sara_1→2 · sara_2→3 · narradora_3→4 · narradora_4→5 (planos A-B) ·
     clienta_1, sara_3→6 · narradora_5→7 · sara_4→8 · sara_5, sara_6→9 (plano A; la tarjeta final va sin voz)
   - Duración real de cada archivo con ffprobe; tramos con voz por energía (boca que habla y subtítulos).
   - Si una frase no cabe en su plano/escena, alarga ese plano (y desplaza los siguientes) y lo avisa.
   - 'talk' (boca) de cada personaje = tramos con voz; algunos momentos de textos y gestos se sincronizan con la voz.
   Uso: python3 audio/colocar_voces.py   (escribe config.json e imprime qué escenas hay que volver a renderizar)"""
import os, sys, json, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = os.path.join(ROOT, 'config.json')
cfg = json.load(open(CFG))
FPS = cfg['fps']
# escena -> grupos (plano donde empieza, plano donde debe terminar, frases)
MAP = {1: [('A', 'A', ['narradora_1'])], 2: [('A', 'A', ['narradora_2', 'sara_1'])], 3: [('A', 'A', ['sara_2'])],
       4: [('A', 'A', ['narradora_3'])], 5: [('A', 'B', ['narradora_4'])], 6: [('A', 'A', ['clienta_1', 'sara_3'])],
       7: [('A', 'A', ['narradora_5'])], 8: [('A', 'A', ['sara_4'])], 9: [('A', 'A', ['sara_5', 'sara_6'])]}
TEXT = {
    'narradora_1': 'Una hora vacía en la agenda no se recupera nunca.',
    'narradora_2': 'Sara tiene una peluquería en Tudela y hoy se le ha quedado un hueco a las cinco.',
    'narradora_3': 'Y lo publica en Escaparate de Tudela.',
    'narradora_4': 'En pocos minutos, alguien se lo reserva.',
    'narradora_5': 'Un hueco que se iba a perder, convertido en una clienta nueva.',
    'sara_1': 'Si nadie lo ocupa, esa hora se pierde.',
    'sara_2': '¿Descuento o regalo? Mejor un regalo: cuesta poco y se nota mucho.',
    'sara_3': '¡Pasa, te estaba esperando!',
    'sara_4': 'Con Escaparate de Tudela, esas horas vacías ya les saco partido.',
    'sara_5': 'En la descripción tienes el enlace al formulario.',
    'sara_6': 'Y si tienes un comercio o un servicio, comenta alta y te lo enviamos.',
    'clienta_1': 'Hola, vengo por la oferta de las cinco.',
}
WHO = {'narradora': 'narradora', 'sara': 'sara', 'clienta': 'clienta'}
START, GAP, TAIL = 0.15, 0.25, 0.35
SR = 16000
snap = lambda x: round(round(x * FPS) / FPS, 3)

def find(name):
    for ext in ('.wav', '.mp3'):
        p = os.path.join(ROOT, 'audio', 'voces', name + ext)
        if os.path.exists(p): return p
    return None
def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True).stdout)
def segments(p):
    """tramos con voz (s, relativos al archivo): energía en ventanas de 20 ms; pausas > 0,25 s separan tramos"""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, '<f4'); n = int(0.02 * SR)
    r = 20 * np.log10(np.sqrt((x[: len(x) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9)
    on = r > -40
    segs, a, last = [], None, None
    for i, v in enumerate(on):
        t = i * 0.02
        if v:
            if a is None: a = t
            elif t - last > 0.25: segs.append([a, last + 0.02]); a = t
            last = t
    if a is not None: segs.append([a, last + 0.02])
    return [[round(a_, 2), round(b_, 2)] for a_, b_ in segs]
def word_t(v, prefix):
    """momento (aprox.) en que se dice el texto que sigue a 'prefix', repartiendo el tiempo con voz por letras"""
    segs = v['segments']; tot = sum(b - a for a, b in segs); x = tot * len(prefix) / len(v['text'])
    for a, b in segs:
        if x <= b - a: return round(a + x, 2)
        x -= b - a
    return segs[-1][1]

missing, changed = [], []
for sc in cfg['scenes']:
    sid = sc['id']; shots = sc['shots']; keys = list(shots.keys())
    vs, t_prev = [], -1
    for k0, k1, names in MAP[sid]:
        t = max(shots[k0][0] + START, t_prev + GAP)
        for nm in names:
            p = find(nm)
            if not p: missing.append(nm); continue
            d = dur(p); sg = segments(p)
            vs.append({'file': os.path.relpath(p, ROOT), 'who': WHO[nm.split('_')[0]], 'start': round(t, 3), 'duration': round(d, 3), 'text': TEXT[nm],
                       'segments': [[round(t + a, 2), round(t + b, 2)] for a, b in sg]})
            t += d + GAP
        end = t - GAP; t_prev = end
        if snap(end + TAIL - shots[k1][1]) > 0:  # no cabe: alarga el plano k1 y desplaza los siguientes
            delta = snap(end + TAIL - shots[k1][1])
            i1 = keys.index(k1)
            shots[k1][1] = snap(shots[k1][1] + delta)
            for k in keys[i1 + 1:]: shots[k] = [snap(shots[k][0] + delta), snap(shots[k][1] + delta)]
            nd = snap(sc['duration'] + delta); changed.append((sid, k1, sc['duration'], nd)); sc['duration'] = nd
    sc['voices'] = vs
    # boca: tramos con voz de cada personaje (con un pequeño margen)
    talk = {}
    for v in vs:
        for a, b in v['segments']:
            r = talk.setdefault(v['who'], [])
            if r and a - r[-1][1] < 0.2: r[-1][1] = round(b + 0.05, 2)
            else: r.append([round(max(0, a - 0.03), 2), round(b + 0.05, 2)])
    sc['talk'] = talk
    V = {os.path.splitext(os.path.basename(v['file']))[0]: v for v in vs}
    c = sc['cues']
    if sid == 2 and 'sara_1' in V:  # mira los sillones vacíos cuando Sara dice «Si nadie lo ocupa…»
        c['lookChairs'] = round(V['sara_1']['start'] - 0.1, 2); c['back'] = round(V['sara_1']['start'] + V['sara_1']['duration'] - 0.6, 2)
        c['sigh'] = round(V['sara_1']['start'] + V['sara_1']['duration'] + 0.05, 2)
    if sid == 3 and 'sara_2' in V:  # «¿Descuento o regalo?» duda; «Mejor un regalo» se inclina; «cuesta poco y se nota mucho»
        v = V['sara_2']; tb = v['segments'][1][0] if len(v['segments']) > 1 else word_t(v, '¿Descuento o regalo? ')
        c['q'] = round(v['start'], 2); c['tilt'] = round(tb - 0.15, 2); c['decide'] = round(tb + 0.2, 2)
        c['a1'] = round(word_t(v, '¿Descuento o regalo? Mejor un regalo: ') - 0.1, 2); c['a2'] = round(word_t(v, '¿Descuento o regalo? Mejor un regalo: cuesta poco y ') - 0.1, 2)
    if sid == 6 and 'sara_3' in V:  # la puerta se abre justo antes de «¡Pasa…!»
        c['open'] = round(V['sara_3']['start'] - 0.45, 2); c['ring'] = round(c['open'] - 0.25, 2); c['wave'] = round(V['sara_3']['start'] + 0.1, 2)
        c['arrive'] = round(min(c['arrive'], c['ring'] - 0.05), 2)
    if sid == 9 and 'sara_5' in V:  # franja «Formulario…» con sara_5; «Comenta ALTA» cuando lo dice
        c['strip'] = round(max(1.0, V['sara_5']['start']), 2)
        if 'sara_6' in V: c['com'] = round(word_t(V['sara_6'], 'Y si tienes un comercio o un servicio, '), 2); c['url'] = round(c['com'] + 0.7, 2)
        c['point'] = round(V['sara_5']['start'] + 0.3, 2); c['thumb'] = round(V[list(V)[-1]]['segments'][-1][1] + 0.1, 2)
# instantes de los PNG de stills/ (la parte más cargada de cada escena)
for sc in cfg['scenes']:
    if sc['id'] == 5: sc['still'] = round(sc['shots']['B'][0] + 2.5, 2)
json.dump(cfg, open(CFG, 'w'), ensure_ascii=False, indent=2)

fr = 0
for sc in cfg['scenes']:
    st = fr / FPS
    for v in sc.get('voices', []):
        print(f"escena {sc['id']}  {os.path.basename(v['file']):12s} {v['duration']:5.2f} s   {st + v['start']:6.2f} → {st + v['start'] + v['duration']:6.2f} s   «{v['text']}»")
    fr += round(sc['duration'] * FPS)
print(f'TOTAL {fr / FPS:.2f} s')
if missing: print('FALTAN VOCES:', ', '.join(missing))
for sid, k, a, b in changed: print(f'escena {sid}: plano {k} alargado, duración {a:.3f} → {b:.3f} s')
sys.exit(2 if missing else 0)
