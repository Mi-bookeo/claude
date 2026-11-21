#!/usr/bin/env python3
"""Corta los mp3 de ElevenLabs de audio/voces/ en un WAV por frase (cortes en las pausas medidas con la envolvente
   de energía, -30 dB). Los silencios internos largos se acortan a ~0,15 s.
  original_narradora.mp3 (Carolina Ruiz):
    narradora_1  0,00-3,97  «Cena de cuadrilla de Navidad. Pedro lo tiene todo controlado.»
    narradora_2  4,26-7,05  «Las mejores ofertas de Tudela, en tu móvil.»                       (atempo 1.13)
    narradora_3  7,05-fin   «Entra en escaparate Tudela punto es. Enlace en la descripción.»   (atempo 1.13)
      -> narradora_2 + narradora_3 duran 6,6 s y la escena 10 dura 6 s: se aceleran un 13 % (sin cambiar el tono).
  original_pedro.mp3 (Dani):
    pedro_1  0,00-1,27 + 1,52-2,26 + 2,36-3,58  «¡El amigo invisible! ¡No he comprado nada!»
    pedro_2  3,78-6,26                          «¡Espera! Esto lo vi en Escaparate de Tudela.»
    pedro_3  6,48-7,32                          «¡Ahí está!»
    pedro_4  7,48-fin                           «Gracias, Escaparate de Tudela. ¡Noche salvada!»
  original_amiga.mp3 (Lydia):
    amiga_1  completo                           «¡Pedro! ¡Qué nerviosa estoy por lo del amigo invisible!»"""
import os, subprocess
V = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voces')
CUTS = {
    'original_narradora.mp3': {'narradora_1': ([(0.0, 3.97)], 1), 'narradora_2': ([(4.26, 7.05)], 1.13),
                               'narradora_3': ([(7.05, 9.50), (9.62, 99)], 1.13)},
    'original_pedro.mp3': {'pedro_1': ([(0.0, 1.27), (1.52, 2.26), (2.36, 3.58)], 1), 'pedro_2': ([(3.78, 6.26)], 1),
                           'pedro_3': ([(6.48, 7.32)], 1), 'pedro_4': ([(7.48, 99)], 1)},
    'original_amiga.mp3': {'amiga_1': ([(0.0, 99)], 1)},
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
