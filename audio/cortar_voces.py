#!/usr/bin/env python3
"""Corta los mp3 de ElevenLabs de audio/voces/ en un WAV por frase (cortes en las pausas medidas con
   silencedetect a -38 dB, d >= 0,25 s; frases asignadas cuadrando sílabas y duración de cada tramo).
  original_narradora.mp3 (Javier Rojas):
    narradora_1   0,00-1,81 + 2,43-3,42 + 3,67-5,58  «Mil novecientos cuarenta y cinco. Después de la guerra, un hombre empieza a vender tornillos.»
                  (pausas internas acortadas a 0,25 s)
    narradora_2   6,17-10,71   «Cuenta la historia que iba con una cestilla al cuello, de puerta en puerta.»
    narradora_3  11,09-12,12   «Así, cliente a cliente.»
    narradora_4  12,72-17,24   «Pasan los años, pero la idea sigue siendo la misma: llegar al cliente.»
    narradora_5  17,95-21,88   «Dos mil veintiséis. Hoy ya no hace falta ir puerta a puerta.»
    narradora_6  22,31-25,59   «Tu comercio publica sus novedades, ofertas y eventos.»
    narradora_7  25,93-29,73   «Y Escaparate de Tudela los lleva a la mano de tus futuros clientes.»
    narradora_8  30,20-fin     «Si tienes un comercio y quieres apuntarte, comenta alta y te enviamos la solicitud.»
  original_vendedor.mp3 (DANI):
    vendedor_1    todo         «¡Tornillos! ¡Buenos tornillos!»"""
import os, subprocess
V = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voces')
P = 0.05  # margen alrededor de cada tramo
CUTS = {
    'original_narradora.mp3': {
        'narradora_1': [(0.0, 1.81), (2.43, 3.42), (3.67, 5.58)], 'narradora_2': [(6.17, 10.71)],
        'narradora_3': [(11.09, 12.12)], 'narradora_4': [(12.72, 17.24)], 'narradora_5': [(17.95, 21.88)],
        'narradora_6': [(22.31, 25.59)], 'narradora_7': [(25.93, 29.73)], 'narradora_8': [(30.20, 99)]},
    'original_vendedor.mp3': {'vendedor_1': [(0.0, 99)]},
}
GAPIN = 0.25
for src, cuts in CUTS.items():
    for name, segs in cuts.items():
        fc, labels = [], []
        for i, (a, b) in enumerate(segs):
            fc.append(f'[0:a]atrim={max(0, a - P):.3f}:{b + P:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,areverse,afade=t=in:d=0.03,areverse[s{i}]')
            labels.append(f'[s{i}]')
            if i < len(segs) - 1:
                fc.append(f'anullsrc=r=44100:cl=mono,atrim=0:{GAPIN},asetpts=PTS-STARTPTS[g{i}]'); labels.append(f'[g{i}]')
        fc.append(''.join(labels) + f'concat=n={len(labels)}:v=0:a=1[o]')
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(V, src), '-filter_complex', ';'.join(fc),
                        '-map', '[o]', '-ar', '48000', '-ac', '1', os.path.join(V, name + '.wav')], check=True)
        d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(V, name + '.wav')], capture_output=True, text=True).stdout)
        print(f'{name:12s} {d:5.2f} s  ({src})')
