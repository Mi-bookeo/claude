#!/usr/bin/env python3
"""Corta audio/voces/original_todas_las_voces.mp3 (todas las frases seguidas, ElevenLabs) en un WAV por frase.
Cortes en el centro de los silencios detectados (silencedetect -35 dB); revisar escuchando y ajustar aquí si hace falta."""
import os, subprocess
A = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(A, 'voces', 'original_todas_las_voces.mp3')
# nombre: (inicio, fin, [silencios internos a acortar (ini, fin)], texto)
CUTS = {
    'narradora_1': (0.10, 4.30, [(0.87, 1.35)], 'Mediodía. A la panadería de Rosa le quedan muchos pasteles.'),
    'narradora_2': (4.30, 5.72, [], 'Y cierra a las dos.'),
    'narradora_3': (5.72, 9.00, [(7.26, 7.66)], 'Pero Rosa tiene una idea: una oferta flash.'),
    'narradora_4': (9.00, 11.05, [], 'La publica en Escaparate de Tudela.'),
    'narradora_5': (11.05, 13.33, [], 'Y la gente se entera al momento.'),
    'narradora_6': (13.33, 14.51, [], 'Y empiezan a llegar.'),
    'narradora_7': (14.51, 16.97, [], 'Antes de cerrar, no queda ni uno.'),
    'narradora_8': (16.97, 24.36, [], 'Con Escaparate de Tudela, tus ofertas flash llenan la tienda cuando más lo necesitas. Date de alta en escaparate Tudela punto es.'),
    'rosa_1': (24.36, 25.33, [], '¡Publicado!'),
    'rosa_2': (25.33, 27.11, [], '¡Siguiente! ¡Siguiente!'),
    'rosa_3': (27.11, 28.22, [], '¡Todo vendido!'),
    'marta_1': (28.22, 29.16, [], '¡Llego!'),
}
KEEP = 0.25  # duración a la que se acortan los silencios internos largos
for name, (a, b, pauses, txt) in CUTS.items():
    parts, cur = [], a
    for pa, pb in pauses:
        parts.append((cur, pa + KEEP / 2)); cur = pb - KEEP / 2
    parts.append((cur, b))
    flt = ''.join(f'[0:a]atrim={x:.3f}:{y:.3f},asetpts=PTS-STARTPTS[p{i}];' for i, (x, y) in enumerate(parts))
    flt += ''.join(f'[p{i}]' for i in range(len(parts))) + f'concat=n={len(parts)}:v=0:a=1,afade=t=in:d=0.01,areverse,afade=t=in:d=0.03,areverse[o]'
    out = os.path.join(A, 'voces', name + '.wav')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', SRC, '-filter_complex', flt, '-map', '[o]', '-ar', '48000', '-ac', '1', out], check=True)
    print(f'{name:12s} {a:6.2f}-{b:6.2f}  {txt}')
