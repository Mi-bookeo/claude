#!/usr/bin/env python3
"""Subtítulos del vídeo 12 «Marta y la cesta de bebé» a partir del guion y de las voces colocadas en config.json
   ('voice': inicio, duración y tramos con voz de cada frase). Cada frase se parte en bloques cortos (máx. 2 líneas);
   dentro de un tramo, el tiempo se reparte en proporción al número de letras.
   Salida: subtitles.json (para `node render.js subs`) y marta_cesta_bebe.srt."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(ROOT, 'config.json')))
# escena -> lista de tramos; cada tramo = lista de bloques de texto (los tramos son los de la voz, en orden)
BLOCKS = {
    1: [['Marta busca un regalo para la hija', 'recién nacida de su amiga Lucía.']],
    2: [['Lleva un buen rato buscando por internet,', 'pero nada le convence.']],
    3: [['¡Wow! ¡Treinta por ciento de descuento!']],
    4: [['Marta entra en la oferta', 'y habla con la farmacia directamente.']],
    6: [['Y el viernes, a recogerla.']],
    8: [['¡Bien! Ya tengo lo que quería.']],
    9: [['Si tú también quieres empezar a beneficiarte', 'de las ofertas y descuentos de los comercios de Tudela,'],
        ['apúntate al canal.'],
        ['Escribe canal y te enviamos el enlace directo.']],
}
FPS = cfg['fps']; starts, fr = {}, 0
for s in cfg['scenes']:
    starts[s['id']] = fr / FPS; fr += round(s['duration'] * FPS)
subs = []
for s in cfg['scenes']:
    if s['id'] not in BLOCKS: continue
    vo = s['voice']; who = 'marta' if 'marta' in vo['file'] else 'narradora'
    segs = vo['segments'] if len(vo['segments']) == len(BLOCKS[s['id']]) else [[vo['start'], vo['start'] + vo['duration']]]
    groups = BLOCKS[s['id']] if len(segs) == len(BLOCKS[s['id']]) else [sum(BLOCKS[s['id']], [])]
    for (a, b), texts in zip(segs, groups):
        tot = sum(len(x) for x in texts); t = a
        for x in texts:
            d = (b - a) * len(x) / tot
            subs.append({'start': round(starts[s['id']] + t - 0.05, 2), 'end': round(starts[s['id']] + t + d + 0.3, 2), 'text': x, 'who': who})
            t += d
for i in range(len(subs) - 1):  # sin solapes
    nx = subs[i + 1]['start']
    if subs[i]['end'] > nx - 0.02: subs[i]['end'] = round(nx - 0.02, 2)
json.dump(subs, open(os.path.join(ROOT, 'subtitles.json'), 'w'), ensure_ascii=False, indent=1)
def ts(x):
    ms = int(round(x * 1000)); return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'
with open(os.path.join(ROOT, 'marta_cesta_bebe.srt'), 'w') as fh:
    for i, s in enumerate(subs, 1): fh.write(f"{i}\n{ts(s['start'])} --> {ts(s['end'])}\n{s['text']}\n\n")
for s in subs: print(f"{s['start']:6.2f}-{s['end']:6.2f}  [{s['who']}] {s['text']}")
