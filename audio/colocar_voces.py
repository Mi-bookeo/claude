#!/usr/bin/env python3
"""Vídeo 15 «Se lanza Escaparate de Tudela»: coloca las voces (un archivo por frase en audio/voces/) en config.json.
   Correspondencia (dentro de una escena o plano, en este orden, al inicio y una tras otra):
     maria_1→1 · maria_2→2 · maria_3→3 · mari_1→4 (plano A; el móvil de los 3 toques va sin voz) ·
     maria_4 (planos A-B) y maria_5 (plano C)→5 · maria_6→6A · mari_2→6B · maria_7 y mari_3→6C
   - Duración real de cada archivo con ffprobe; tramos con voz por energía (boca que habla y subtítulos).
   - Si una frase no cabe en su plano/escena, alarga ese plano (y desplaza los siguientes) y lo avisa.
   - 'talk' (boca) de cada personaje = tramos con voz; los momentos de los textos se sincronizan con la voz.
   Uso: python3 audio/colocar_voces.py   (escribe config.json e imprime qué escenas hay que volver a renderizar)"""
import json, os, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = os.path.join(ROOT, 'config.json')
cfg = json.load(open(CFG))
FPS = cfg['fps']
# escena -> grupos (plano donde empieza, plano donde debe terminar, frases)
MAP = {1: [('A', 'A', ['maria_1'])], 2: [('A', 'A', ['maria_2'])], 3: [('A', 'A', ['maria_3'])], 4: [('A', 'A', ['mari_1'])],
       5: [('A', 'B', ['maria_4']), ('C', 'C', ['maria_5'])],
       6: [('A', 'A', ['maria_6']), ('B', 'B', ['mari_2']), ('C', 'C', ['maria_7', 'mari_3'])]}
TEXT = {
    'maria_1': '¿Te estás perdiendo las ofertas y novedades de Tudela? Pues se acabó: hoy empieza algo nuevo.',
    'maria_2': 'Se acaba de lanzar Escaparate de Tudela: los comercios de la ciudad publican sus ofertas, novedades y eventos, y te llegan directamente al móvil.',
    'maria_3': 'Y ahora, lo mejor para los comercios.',
    'mari_1': 'Para los comercios y servicios es muy fácil publicar: solo con tres toques.',
    'maria_4': 'Y los vecinos vemos todo lo que tienen los comercios en un solo lugar, y además nos llega al WhatsApp para no perdernos nada.',
    'maria_5': 'Y así apoyamos al comercio de nuestra ciudad.',
    'maria_6': 'En la descripción tienes el enlace al canal de WhatsApp, o comenta canal y te lo enviamos.',
    'mari_2': 'Y si tienes un comercio, escríbenos y te informamos.',
    'maria_7': 'Entra en escaparatetudela.es...',
    'mari_3': '...y empieza a beneficiarte.',
}
WHO = {'maria': 'maria', 'mari': 'maricarmen'}
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
    if sid == 1 and 'maria_1' in V:  # cartel durante la pregunta; dolly out al «Pues se acabó»; baja el cartel en «hoy empieza…»
        sg = V['maria_1']['segments']
        c['dollyStart'] = round(max(0.7, sg[0][1] - 0.85), 2); c['dollyEnd'] = round(sg[0][1] + 0.3, 2)
        c['title'] = round(sg[1][0] + 0.18, 2)                     # «Pues se acabó» (2.º tramo)
        c['lower'] = round(sg[2][0], 2) if len(sg) > 2 else round(c['title'] + 1.0, 2); c['smile'] = round(c['lower'] + 0.45, 2)
        sc['still'] = round(c['title'] + 0.6, 2)
    if sid == 2 and 'maria_2' in V:  # cada tarjeta sale cuando dice «ofertas», «novedades», «eventos»
        v = V['maria_2']; pre = 'Se acaba de lanzar Escaparate de Tudela: los comercios de la ciudad publican sus '
        c['launch'] = [round(word_t(v, pre) - 0.35, 2), round(word_t(v, pre + 'ofertas, ') - 0.35, 2), round(word_t(v, pre + 'ofertas, novedades y ') - 0.35, 2)]
        c['point'] = round(word_t(v, pre + 'ofertas, novedades y eventos, y '), 2)
        c['thumb'] = round(max(c['point'] + 1.2, word_t(v, pre + 'ofertas, novedades y eventos, y te llegan directamente ')), 2)
    if sid == 5 and 'maria_4' in V:  # el chat (plano B) entra con «y además nos llega al WhatsApp»
        v = V['maria_4']; tb = v['segments'][1][0] if len(v['segments']) > 1 else word_t(v, 'Y los vecinos vemos todo lo que tienen los comercios en un solo lugar, ')
        shots['A'][1] = shots['B'][0] = snap(tb - 0.12)
    if sid == 6:
        a0 = shots['A'][0]; b0 = shots['B'][0]; c0 = shots['C'][0]
        if 'maria_6' in V:  # «En la descripción tienes el enlace…» y después «o comenta canal…» (orden de CLAUDE.md)
            v = V['maria_6']; c['A_link'] = round(v['start'] - a0, 2)
            c['A_strip'] = round((v['segments'][1][0] if len(v['segments']) > 1 else word_t(v, 'En la descripción tienes el enlace al canal de WhatsApp, ')) - a0, 2); c['A_who'] = round(c['A_strip'] + 0.8, 2)
        if 'mari_2' in V:
            v = V['mari_2']; c['B_strip'] = round(v['start'] - b0, 2)
            c['B_sub'] = round(word_t(v, 'Y si tienes un comercio, ') - b0, 2); c['B_form'] = round(v['start'] + v['duration'] - b0 - 0.2, 2); c['B_who'] = round(c['B_form'] + 0.5, 2)
        if 'maria_7' in V and 'mari_3' in V:
            c['C_t1'] = round(V['maria_7']['start'] - c0, 2); c['C_t2'] = round(word_t(V['maria_7'], 'Entra en ') - c0, 2)
            c['C_sub'] = round(V['mari_3']['start'] - c0, 2)
# instantes de los PNG de stills/ (la parte más cargada de cada escena)
for sc in cfg['scenes']:
    if sc['id'] == 4: sc['still'] = round(sc['shots']['B'][0] + sc['cues']['card'] + 0.75, 2)
    if sc['id'] == 5: sc['still'] = round(sc['shots']['B'][0] + 2.3, 2)
    if sc['id'] == 6: sc['still'] = round(sc['shots']['C'][0] + 1.7, 2)
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
