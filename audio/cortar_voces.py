#!/usr/bin/env python3
"""Corta los mp3 de ElevenLabs de audio/voces/ en un WAV por frase (cortes en las pausas medidas con la envolvente
   de energía, -38 dB respecto al pico). Los silencios internos largos se acortan a ~0,15 s.
  original_narradora.mp3 (Javier Rojas):
    narradora_1   0,00-1,78   «¿Por qué tu oferta no vende?»
    narradora_2   2,16-4,24 + 4,51-6,74  «Misma tienda, misma oferta. Pero una tiene fecha y la otra no.»   (atempo 1.13)
      -> dura 4,45 s y la escena 2 dura 4 s: pausa interna acortada y un 13 % más rápida (sin cambiar el tono).
    narradora_3   7,07-11,62  «Una oferta sin fecha se pospone para otro día... y ese día nunca llega.»
    narradora_4  11,97-15,06  «Es que el cerebro humano odia perder una oportunidad.»
    narradora_5  15,30-19,68  «Con fecha y a la vista, el "ya veré" se convierte en "voy ahora mismo".»
    narradora_6  19,92-21,76  «Tú pones la fecha a tu oferta.»
    narradora_7  21,89-25,77  «Nosotros la llevamos a la mano de tus clientes, para que no se la pierdan.»
    narradora_8  25,95-fin    «Si tienes un negocio en Tudela, escríbenos y te informamos.»
  original_clienta.mp3 (Lydia):
    clienta_1     0,00-1,22   «Ya vendré otro día.»
    clienta_2     1,36-2,32 + 2,51-fin  «¡Hasta el sábado! ¡Entro ya!»"""
import os, subprocess
V = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voces')
CUTS = {
    'original_narradora.mp3': {
        'narradora_1': ([(0.0, 1.78)], 1), 'narradora_2': ([(2.16, 4.24), (4.51, 6.74)], 1.13),
        'narradora_3': ([(7.07, 11.62)], 1), 'narradora_4': ([(11.97, 15.06)], 1), 'narradora_5': ([(15.30, 19.68)], 1),
        'narradora_6': ([(19.92, 21.76)], 1), 'narradora_7': ([(21.89, 25.77)], 1), 'narradora_8': ([(25.95, 99)], 1)},
    'original_clienta.mp3': {'clienta_1': ([(0.0, 1.22)], 1), 'clienta_2': ([(1.36, 2.32), (2.51, 99)], 1)},
}
GAPIN = 0.15
for src, cuts in CUTS.items():
    for name, (segs, tempo) in cuts.items():
        fc, labels = [], []
        for i, (a, b) in enumerate(segs):
            fc.append(f'[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,areverse,afade=t=in:d=0.03,areverse[s{i}]')
            labels.append(f'[s{i}]')
            if i < len(segs) - 1:
                fc.append(f'anullsrc=r=44100:cl=mono,atrim=0:{GAPIN},asetpts=PTS-STARTPTS[g{i}]'); labels.append(f'[g{i}]')
        fc.append(''.join(labels) + f'concat=n={len(labels)}:v=0:a=1' + (f',atempo={tempo}' if tempo != 1 else '') + '[o]')
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(V, src), '-filter_complex', ';'.join(fc),
                        '-map', '[o]', '-ar', '48000', '-ac', '1', os.path.join(V, name + '.wav')], check=True)
        d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(V, name + '.wav')], capture_output=True, text=True).stdout)
        print(f'{name:12s} {d:5.2f} s  ({src})')
