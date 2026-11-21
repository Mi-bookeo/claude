#!/usr/bin/env python3
"""Corta los mp3 de ElevenLabs de audio/voces/ en un WAV por frase (cortes en las pausas, silencedetect -30 dB, 0,12 s).
  original_narradora.mp3 (Carolina Ruiz):
    narradora_1  0,05-3,00  «Mari Carmen tiene una tienda de complementos en Tudela.»
    narradora_2  3,00-6,37  «Ha decidido poner un buen descuento en sus bolsos.»
    narradora_3  6,37-9,00  «Y ahora solo falta que entre gente.»
    narradora_4  9,00-12,84 «Pero Mari Carmen está en Escaparate de Tudela: publica su oferta.»
    narradora_5 12,84-15,45 «Un par de toques y ya está en la web.»
    narradora_6 15,45-17,75 «Y le llega directamente a la gente.»
    narradora_7 17,75-22,69 «Escaparate de Tudela lleva tus ofertas y novedades a la mano de tus futuros clientes.»
    narradora_8 22,69-fin   «Si tienes un negocio en Tudela, escríbenos y te informamos.»
  original_mari_carmen.mp3 (Estela): mari_1 0-0,89 «¡Publicado!» · mari_2 0,89-fin «¡Pasa, pasa, que quedan los más bonitos!»
  original_clienta.mp3 (Graciela):   clienta_1 completo «Hola, vengo por la oferta de los bolsos.»"""
import os, subprocess
V = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voces')
CUTS = {
    'original_narradora.mp3': {'narradora_1': (0.05, 3.00), 'narradora_2': (3.00, 6.37), 'narradora_3': (6.37, 9.00), 'narradora_4': (9.00, 12.84),
                               'narradora_5': (12.84, 15.45), 'narradora_6': (15.45, 17.75), 'narradora_7': (17.75, 22.69), 'narradora_8': (22.69, 99)},
    'original_mari_carmen.mp3': {'mari_1': (0.0, 0.89), 'mari_2': (0.89, 99)},
    'original_clienta.mp3': {'clienta_1': (0.0, 99)},
}
for src, cuts in CUTS.items():
    for name, (a, b) in cuts.items():
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(V, src), '-af',
                        f'atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,areverse,afade=t=in:d=0.03,areverse',
                        '-ar', '48000', '-ac', '1', os.path.join(V, name + '.wav')], check=True)
        print(f'{name:12s} {a:6.2f}-{b:6.2f}  ({src})')
