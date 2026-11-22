#!/usr/bin/env python3
"""Música de fondo original y suave, sintetizada con código (vídeo 11 «4 motivos para estar en el canal»).
   Pop alegre a 112 BPM en Do mayor (I-V-vi-IV), con pad, bajo, arpegio tipo marimba, percusión suave
   y «stingers» (campanita + acorde) al entrar cada número. Estructura leída de config.json:
     escena 1  alegre y animada · escenas 2-4 ritmo constante + stinger en cada número
     escena 5  sube con más energía (momento más alto) · escenas 6-7 mantiene y cierra con acorde final.
   Salida: audio/musica.wav (48 kHz, estéreo). Si existe audio/musica.mp3, make_audio.py usa esa en su lugar."""
import json, os, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
cfg = json.load(open(os.path.join(ROOT, 'config.json')))
FPS = cfg['fps']
starts, fr = [], 0
for s in cfg['scenes']:
    starts.append(fr / FPS); fr += round(s['duration'] * FPS)
TOTAL = fr / FPS
N = int(TOTAL * SR) + SR
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(11)

BPM = 112.0
BEAT = 60 / BPM
BAR = 4 * BEAT
mid = lambda m: 440.0 * 2 ** ((m - 69) / 12)
# acordes (raíz MIDI, notas)
PROG = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]  # C G Am F

def env_adsr(n, a, d, s, r, sr=SR):
    t = np.arange(n) / sr
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    rel = int(r * sr)
    if rel and n > rel: e[-rel:] *= np.linspace(1, 0, rel)
    return e

def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[: N - i]
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * gain * gl * 1.414
    R[i:i + len(sig)] += sig * gain * gr * 1.414

def tone(freq, dur, kind='sine', a=0.01, d=0.3, s=0.6, r=0.1):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * freq * t
    if kind == 'sine': w = np.sin(ph)
    elif kind == 'tri': w = 2 / np.pi * np.arcsin(np.sin(ph))
    elif kind == 'pad': w = 0.6 * np.sin(ph) + 0.25 * np.sin(2 * ph * 1.003) + 0.15 * (2 / np.pi * np.arcsin(np.sin(ph * 0.998)))
    elif kind == 'marimba': w = np.sin(ph) + 0.35 * np.sin(4 * ph) * np.exp(-t * 30)
    elif kind == 'bell': w = np.sin(ph) + 0.5 * np.sin(2.76 * ph) * np.exp(-t * 4) + 0.25 * np.sin(5.4 * ph) * np.exp(-t * 8)
    else: w = np.sin(ph)
    return w * env_adsr(n, a, d, s, r)

def kick(g=1.0):
    n = int(0.25 * SR); t = np.arange(n) / SR
    f = 50 + 70 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14) * g

def shaker(g=1.0):
    n = int(0.07 * SR); t = np.arange(n) / SR
    w = rng.standard_normal(n); w = np.diff(np.concatenate([[0], w]))  # agudo
    return w * np.exp(-t * 60) * 0.25 * g

def clap(g=1.0):
    n = int(0.18 * SR); t = np.arange(n) / SR
    w = rng.standard_normal(n)
    e = np.exp(-t * 28) + 0.5 * np.exp(-np.maximum(t - 0.012, 0) * 40) * (t > 0.012)
    return np.diff(np.concatenate([[0], w])) * e * 0.18 * g

# intensidad por tramo (0..1) según la escena
def section(t):
    for i in range(len(starts) - 1, -1, -1):
        if t >= starts[i]: return i + 1
    return 1
ENERGY = {1: 0.8, 2: 0.7, 3: 0.7, 4: 0.72, 5: 1.0, 6: 0.85, 7: 0.85}

end_music = TOTAL - 2.0  # tarjeta final: acorde que se sostiene
nb = int(end_music / BEAT) + 1
for b in range(nb):
    t = b * BEAT
    if t >= end_music: break
    sec = section(t); en = ENERGY[sec]
    bar = int(t / BAR); beat = b % 4
    root, chord = PROG[bar % 4]
    up = 12 if sec == 5 else 0
    if beat == 0:
        for k, m in enumerate(chord):  # pad
            add(tone(mid(m + up * 0.0), BAR + 0.3, 'pad', a=0.25, d=1.0, s=0.7, r=0.4), t, 0.05 * en, pan=(k - 1) * 0.5)
        add(tone(mid(root), BEAT * 1.8, 'tri', a=0.01, d=0.4, s=0.5, r=0.1), t, 0.16 * en)
    if beat == 2:
        add(tone(mid(root + 7 if root < 45 else root), BEAT * 1.6, 'tri', a=0.01, d=0.4, s=0.5, r=0.1), t, 0.12 * en)
    # arpegio en corcheas
    for h in range(2):
        tt = t + h * BEAT / 2
        if sec == 1 or sec >= 5 or (sec in (2, 3, 4)):
            seq = chord + [chord[1] + 12]
            m = seq[(beat * 2 + h) % 4] + 12 + (12 if sec == 5 and h == 1 else 0)
            add(tone(mid(m), 0.35, 'marimba', a=0.004, d=0.12, s=0.0, r=0.05), tt, (0.07 if sec != 5 else 0.085) * en, pan=0.35 if h else -0.35)
        add(shaker(en), tt + 0.002, 0.8 if sec != 1 else 1.0, pan=0.4)
    # percusión
    if beat in (0, 2) or sec == 5: add(kick(), t, 0.22 * en)
    if beat in (1, 3): add(clap(), t, 0.9 * en, pan=-0.1)
    # melodía en la escena 5 (el momento más alto) y en la 1
    if sec in (1, 5) and beat in (0, 1, 3):
        mel = [72, 74, 76, 79, 76, 74, 72, 67][(b // 1) % 8] + (0 if sec == 1 else 5 - 5)
        add(tone(mid(mel + (12 if sec == 5 else 0)), BEAT * 0.9, 'sine', a=0.02, d=0.25, s=0.4, r=0.1), t, 0.045 * en, pan=0.1)

# stingers al entrar cada número (escenas 2-5): campanita + acorde brillante
for i in (1, 2, 3, 4):
    t0 = starts[i] + 0.06
    for k, m in enumerate([84, 88, 91]):
        add(tone(mid(m), 1.2, 'bell', a=0.002, d=0.4, s=0.0, r=0.2), t0 + k * 0.05, 0.05 * (1.3 if i == 4 else 1), pan=(k - 1) * 0.4)
    add(tone(mid(36 + 12), 0.5, 'tri', a=0.005, d=0.2, s=0.2, r=0.1), t0, 0.12)
# subida antes del motivo 4: redoble suave de shaker y barrido
for k in range(8):
    add(shaker(1.4), starts[4] - 0.5 + k * 0.06, 0.6 + k * 0.08)
# cierre: acorde final sostenido en la tarjeta
for k, m in enumerate([60, 64, 67, 72, 76]):
    add(tone(mid(m), 2.4, 'pad', a=0.03, d=1.2, s=0.6, r=1.0), end_music, 0.06, pan=(k - 2) * 0.3)
    add(tone(mid(m + 12), 2.0, 'bell', a=0.002, d=0.6, s=0.0, r=0.4), end_music + k * 0.04, 0.03, pan=(k - 2) * 0.3)
add(tone(mid(36), 2.0, 'tri', a=0.01, d=0.8, s=0.3, r=0.8), end_music, 0.18)
add(kick(), end_music, 0.3)

# eco corto (espacio) y normalización
def delay(x, ms, g):
    d = int(ms * SR / 1000); y = x.copy(); y[d:] += x[:-d] * g; return y
L2, R2 = delay(L, 180, 0.18), delay(R, 230, 0.18)
out = np.stack([L2, R2], 1)[: int(TOTAL * SR)]
fade = int(0.6 * SR); out[-fade:] *= np.linspace(1, 0, fade)[:, None]
out *= 0.5 / max(1e-6, np.abs(out).max())
p = os.path.join(ROOT, 'audio', 'musica.wav')
with wave.open(p, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())
print('música ->', os.path.relpath(p, ROOT), f'{TOTAL:.2f} s')
