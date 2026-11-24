#!/usr/bin/env python3
"""Música de fondo original y suave, sintetizada con código (vídeo 16 «El hueco de las cinco»; no hay audio/musica.mp3).
   Estructura leída de config.json (inicio de cada escena y planos), 100 bpm:
     escenas 1-2  tensión ligera y ritmo medio (La menor: pad, cuerda punteada, bombo suave y tictac de charles)
     escena 3     curiosa (pizzicato saltarín y campanitas, sin bombo)
     escena 4     sube con energía (Do mayor, bombo, palmas y redoble que crece hasta «Publicada»)
     escenas 5-7  alegre y animada (marimba, bombo, palmas, shaker y melodía)
     escena 8     baja un poco (pad y marimba suave) para la frase de Sara
     escena 9     cierra con energía (bajo las voces lo atenúa make_audio.py) y acorde final en la tarjeta.
   Salida: audio/musica.wav (48 kHz, estéreo). Si existe audio/musica.mp3, make_audio.py usa esa en su lugar."""
import os, json, wave
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
cfg = json.load(open(os.path.join(ROOT, os.environ.get('CONFIG', 'config.json'))))
FPS = cfg['fps']
starts, fr = [], 0
for s in cfg['scenes']:
    starts.append(fr / FPS); fr += round(s['duration'] * FPS)
TOTAL = fr / FPS
N = int(TOTAL * SR) + SR
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(16)

BPM = 100.0
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

# ---------- estructura ----------
def section(t):
    for i in range(len(starts) - 1, -1, -1):
        if t >= starts[i]: return i + 1
    return 1
sc_ = cfg['scenes']
shot = lambda i, k: starts[i - 1] + sc_[i - 1]['shots'][k][0]
TENSE = [(45, [57, 60, 64]), (41, [57, 60, 65]), (45, [57, 60, 64]), (40, [56, 59, 64])]    # Am F Am E
CURIO = [(50, [62, 65, 69]), (45, [61, 64, 69]), (50, [62, 65, 69]), (43, [62, 67, 71])]    # Dm A Dm G
LIVELY = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [57, 60, 64]), (41, [57, 60, 65])]   # C G Am F
fin = shot(9, 'FIN')
def pluck(freq, dur):  # cuerda punteada (Karplus-Strong sencillo)
    n = int(dur * SR); p = max(2, int(SR / freq)); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out * np.minimum(1, np.arange(n) / (0.004 * SR))
PL = {}
def pl(m, d=1.0):
    if m not in PL: PL[m] = pluck(mid(m), d)
    return PL[m]
def hat(g=1.0):
    n = int(0.04 * SR); t = np.arange(n) / SR; w = np.diff(np.concatenate([[0], rng.standard_normal(n)]))
    return w * np.exp(-t * 120) * 0.2 * g
EN = {1: 0.7, 2: 0.75, 3: 0.7, 4: 0.9, 5: 1.0, 6: 1.0, 7: 1.0, 8: 0.55, 9: 0.95}
nb = int(fin / BEAT) + 1
for b in range(nb):
    t = b * BEAT
    if t >= fin: break
    sec = section(t); bar = int(t / BAR); beat = b % 4; en = EN[sec]
    if sec <= 2:  # tensión ligera, ritmo medio
        root, chord = TENSE[bar % 4]
        if beat == 0:
            for k, m in enumerate(chord): add(tone(mid(m), BAR + 0.4, 'pad', a=0.4, d=1.2, s=0.7, r=0.5), t, 0.04 * en, pan=(k - 1) * 0.5)
            add(tone(mid(root - 12), BAR, 'tri', a=0.02, d=0.6, s=0.6, r=0.3), t, 0.14 * en)
        for h in range(2): add(pl(chord[(beat * 2 + h) % 3] + 12), t + h * BEAT / 2, 0.07 * en, pan=0.3 if h else -0.3)
        if beat in (0, 2): add(kick(), t, 0.15)
        for h in range(2): add(hat(1.0 if h else 0.6), t + h * BEAT / 2, 0.8, pan=0.35)
        continue
    if sec == 3:  # curiosa: pizzicato saltarín y campanitas
        root, chord = CURIO[bar % 4]
        if beat == 0: add(tone(mid(root - 12), BEAT * 1.2, 'tri', a=0.01, d=0.2, s=0.2, r=0.1), t, 0.14)
        pat = [0, 2, 1, 2]
        add(pl(chord[pat[beat]] + 12, 0.5), t, 0.09, pan=-0.3); add(pl(chord[(pat[beat] + 1) % 3] + 24, 0.4), t + BEAT * 0.5, 0.06, pan=0.3)
        if beat == 3: add(tone(mid(chord[2] + 24), 0.8, 'bell', a=0.002, d=0.3, s=0.0, r=0.2), t + BEAT * 0.75, 0.03, pan=0.4)
        continue
    root, chord = LIVELY[bar % 4]
    if beat == 0:
        for k, m in enumerate(chord): add(tone(mid(m), BAR + 0.3, 'pad', a=0.2, d=1.0, s=0.7, r=0.4), t, 0.045 * en, pan=(k - 1) * 0.5)
        add(tone(mid(root), BEAT * 1.8, 'tri', a=0.01, d=0.4, s=0.5, r=0.1), t, 0.16 * en)
    if beat == 2: add(tone(mid(root + 7 if root < 45 else root), BEAT * 1.6, 'tri', a=0.01, d=0.4, s=0.5, r=0.1), t, 0.12 * en)
    for h in range(2):
        tt = t + h * BEAT / 2; seq = chord + [chord[1] + 12]
        m = seq[(beat * 2 + h) % 4] + 12
        add(tone(mid(m), 0.35, 'marimba', a=0.004, d=0.12, s=0.0, r=0.05), tt, 0.07 * en, pan=0.35 if h else -0.35)
        if sec != 8: add(shaker(en), tt + 0.002, 0.8, pan=0.4)
    if sec == 8:
        if beat == 0: add(kick(), t, 0.08)
        continue
    if beat in (0, 2): add(kick(), t, 0.2 * en)
    if beat in (1, 3): add(clap(), t, 0.75 * en, pan=-0.1)
    if sec in (5, 6, 7, 9) and beat in (0, 1, 3):
        mel = [76, 79, 81, 79, 76, 74, 72, 74][b % 8]
        add(tone(mid(mel), BEAT * 0.9, 'sine', a=0.02, d=0.25, s=0.4, r=0.1), t, 0.05 * en, pan=0.1)
# escena 4: redoble de shaker que crece y acorde al publicar
pub = starts[3] + sc_[3]['cues'].get('done', 2.45)
for k in range(12): add(shaker(1.2), pub - 0.6 + k * 0.05, 0.3 + k * 0.06)
for k, m in enumerate([72, 76, 79, 84]): add(tone(mid(m), 1.2, 'bell', a=0.002, d=0.5, s=0.0, r=0.3), pub + k * 0.04, 0.05, pan=(k - 1.5) * 0.3)
add(kick(), pub, 0.3)
# cierre: acorde final sostenido en la tarjeta
for k, m in enumerate([60, 64, 67, 72, 76]):
    add(tone(mid(m), 2.4, 'pad', a=0.03, d=1.2, s=0.6, r=1.0), fin, 0.06, pan=(k - 2) * 0.3)
    add(tone(mid(m + 12), 2.0, 'bell', a=0.002, d=0.6, s=0.0, r=0.4), fin + k * 0.04, 0.03, pan=(k - 2) * 0.3)
add(tone(mid(36), 2.0, 'tri', a=0.01, d=0.8, s=0.3, r=0.8), fin, 0.18)
add(kick(), fin, 0.3)

# eco corto (espacio) y normalización
def delay(x, ms, g):
    d = int(ms * SR / 1000); y = x.copy(); y[d:] += x[:-d] * g; return y
L2, R2 = delay(L, 180, 0.18), delay(R, 230, 0.18)
out = np.stack([L2, R2], 1)[: int(TOTAL * SR)]
fade = int(0.6 * SR); out[-fade:] *= np.linspace(1, 0, fade)[:, None]
out *= 0.5 / max(1e-6, np.abs(out).max())
p = os.path.join(ROOT, cfg.get('musicWav', 'audio/musica.wav'))
with wave.open(p, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())
print('música ->', os.path.relpath(p, ROOT), f'{TOTAL:.2f} s')
