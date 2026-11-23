#!/usr/bin/env python3
"""Subtítulos del vídeo 11 a partir del guion y de los tramos «talk» de config.json (los que salen de la voz).
   Cada bloque = (escena, primer tramo, último tramo, texto). Salida: subtitles.json (para render.js subs) y
   marta_cuatro_motivos.srt."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(ROOT, 'config.json')))
BLOCKS = [
    (1, 0, 0, '¿Sabes por qué tienes que estar en el canal de Escaparate Tudela?'),
    (1, 1, 2, 'Te doy cuatro motivos'),
    (1, 3, 4, 'y el último de todos es el mejor.'),
    (2, 0, 2, 'Uno: te enteras de todas las novedades,'),
    (2, 3, 3, 'incluso antes de que estén colocadas en la tienda.'),
    (3, 0, 1, 'Dos: empiezas a beneficiarte'),
    (3, 2, 2, 'de todos los descuentos y promociones de nuestros comercios.'),
    (4, 0, 1, 'Tres: te enteras de eventos que ni sabías que existían.'),
    (5, 0, 1, 'Y cuatro, el mejor de todos:'),
    (5, 2, 2, 'apoyas al comercio local,'),
    (5, 3, 3, 'para que nuestras calles sigan llenas de alegría.'),
    (6, 0, 0, 'Si quieres estar dentro del canal de WhatsApp de Escaparate Tudela,'),
    (6, 1, 2, 'comenta CANAL y te enviamos el enlace.'),
    (7, 0, 0, 'Y comparte este vídeo en los grupos de WhatsApp de tus amigos,'),
    (7, 1, 1, 'para que ellos también empiecen a beneficiarse del canal.'),
]
FPS = cfg['fps']; starts, fr = {}, 0
for s in cfg['scenes']:
    starts[s['id']] = fr / FPS; fr += round(s['duration'] * FPS)
subs = []
for sc, a, b, txt in BLOCKS:
    tk = cfg['scenes'][sc - 1]['talk']
    subs.append({'start': round(starts[sc] + tk[a][0] - 0.05, 2), 'end': round(starts[sc] + tk[b][1] + 0.25, 2), 'text': txt, 'who': 'marta'})
for i in range(len(subs) - 1):  # sin solapes; huecos cortos rellenados
    nx = subs[i + 1]['start']
    if subs[i]['end'] > nx or nx - subs[i]['end'] < 0.35: subs[i]['end'] = round(nx - 0.02, 2)
json.dump(subs, open(os.path.join(ROOT, 'subtitles.json'), 'w'), ensure_ascii=False, indent=1)
def ts(x):
    ms = int(round(x * 1000)); return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'
with open(os.path.join(ROOT, cfg['output'][:-4] + '.srt'), 'w') as fh:
    for i, s in enumerate(subs, 1): fh.write(f"{i}\n{ts(s['start'])} --> {ts(s['end'])}\n{s['text']}\n\n")
for s in subs: print(f"{s['start']:6.2f}-{s['end']:6.2f}  {s['text']}")
