#!/usr/bin/env python3
"""Variante CANAL: sustituye «instante» por «canal» dentro de la frase N5 de la narradora.
Escribe audio/voces/n5_canal.wav (solo la frase N5 ya montada)."""
import os, subprocess, wave
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
SR = 48000
def dec(p):
    return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                                        check=True, capture_output=True).stdout, '<f4').astype(np.float64)
nar, can = dec('audio/voces/narradora_carolina.mp3'), dec('audio/voces/narradora_canal.mp3')
S = lambda t: int(round(t * SR))
N5_IN, N5_OUT = 14.72, 20.95          # frase N5 en el archivo de la narradora
CUT_A, CUT_B = 14.72 + 3.06, 14.72 + 3.80   # «instante»
CAN_A, CAN_B = 0.03, 0.72             # «canal» en el archivo nuevo
xf = S(0.015)
a, w, b = nar[S(N5_IN):S(CUT_A)].copy(), can[S(CAN_A):S(CAN_B)].copy(), nar[S(CUT_B):S(N5_OUT)].copy()
# el archivo nuevo puede venir a otro volumen: iguala su RMS al de la frase original
rms = lambda x: np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2))
w *= rms(nar[S(N5_IN):S(N5_OUT)]) / rms(w)
for x in (a, w, b):
    x[:xf] *= np.linspace(0, 1, xf); x[-xf:] *= np.linspace(1, 0, xf)
out = np.concatenate([a, w, b])
pcm = (np.clip(out, -1, 1) * 32767).astype('<i2')
with wave.open('audio/voces/n5_canal.wav', 'wb') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
print(f'N5 con «canal»: {len(out) / SR:.2f} s (antes {N5_OUT - N5_IN:.2f} s); «canal» en {len(a) / SR:.2f} s')
