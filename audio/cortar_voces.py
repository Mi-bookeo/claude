#!/usr/bin/env python3
"""Corta audio/voces/original_todas_las_voces.mp3 (ElevenLabs, todas las frases seguidas) en un WAV por frase.
Cortes en las pausas detectadas (silencedetect -38 dB, 0,25 s):
  narradora_1  0,00-6,44  «Viernes por la tarde. Pedro acaba la semana y quiere desconectar, pero no tiene ningún plan.»
  pedro_1      6,70-11,04 «¿Pintxo de tortilla y bebida por tres euros con cincuenta? ¡Eso sí que es un plan!»
  pedro_2     11,31-fin   «¡Salud!»"""
import os, subprocess
A = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(A, 'voces', 'original_todas_las_voces.mp3')
CUTS = {'narradora_1': (0.00, 6.50), 'pedro_1': (6.62, 11.10), 'pedro_2': (11.24, 11.97)}
for name, (a, b) in CUTS.items():
    out = os.path.join(A, 'voces', name + '.wav')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', SRC, '-af',
                    f'atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,areverse,afade=t=in:d=0.03,areverse',
                    '-ar', '48000', '-ac', '1', out], check=True)
    print(f'{name:12s} {a:6.2f}-{b:6.2f}')
