#!/usr/bin/env python3
"""Música de fondo original y suave, sintetizada con código (vídeo 14 «Ana y el cuentacuentos»).
   Estructura leída de config.json (inicio de cada escena y cues):
     escenas 1-3  suave y un poco melancólica: piano/guitarra punteada en La menor, pad y bajo suave, sin batería
     escena 4     pequeño redoble curioso (pizzicato y caja suave; redoble en las viñetas y en el sello)
     escena 5     sube: golpe de energía en el chasquido de la decisión; ritmo ligero
     escenas 6-8  ritmo animado y cálido, creciendo hasta la sala llena (marimba, palmas, bombo, melodía)
     escena 9     remate (golpe en el destello)
     escena 10    baja bajo la voz de Ana y cierra optimista con un acorde final en la tarjeta.
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
rng = np.random.default_rng(14)

BPM = 96.0
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
cue = lambda i, k, d: sc_[i - 1].get('cues', {}).get(k, d)
shot = lambda i, k: starts[i - 1] + sc_[i - 1]['shots'][k][0]
SAD = [(45, [57, 60, 64]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 62])]       # Am F C G
LIVELY = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [57, 60, 64]), (41, [57, 60, 65])]    # C G Am F
fin = shot(10, 'FIN')
hit = starts[4] + cue(5, 'snap', 0.4)          # decisión de Ana (chasquido)
flash = starts[8] + cue(9, 'flash', 2.9)       # destello de la pantalla partida
def pluck(freq, dur):  # cuerda punteada (Karplus-Strong sencillo)
    n = int(dur * SR); p = max(2, int(SR / freq)); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out * np.minimum(1, np.arange(n) / (0.004 * SR))
def snare(g=1.0):
    n = int(0.12 * SR); t = np.arange(n) / SR
    return (rng.standard_normal(n) * 0.5 + np.sin(2 * np.pi * 190 * t) * 0.4) * np.exp(-t * 30) * 0.2 * g
PL = {}
def pl(m, d=1.6):
    if m not in PL: PL[m] = pluck(mid(m), d)
    return PL[m]
nb = int(fin / BEAT) + 1
for b in range(nb):
    t = b * BEAT
    if t >= fin: break
    sec = section(t); bar = int(t / BAR); beat = b % 4
    if sec <= 3 or (sec == 5 and t < hit):  # suave y melancólica
        root, chord = SAD[bar % 4]
        if beat == 0:
            for k, m in enumerate(chord): add(tone(mid(m), BAR + 0.4, 'pad', a=0.6, d=1.2, s=0.7, r=0.6), t, 0.04, pan=(k - 1) * 0.5)
            add(tone(mid(root - 12), BAR, 'sine', a=0.05, d=0.8, s=0.5, r=0.3), t, 0.12)
        arp = [chord[0], chord[1], chord[2], chord[1] + 12]
        for h in range(2):
            add(pl(arp[(beat * 2 + h) % 4] + (12 if h else 0)), t + h * BEAT / 2, 0.11, pan=0.35 * (1 if h else -1))
        continue
    if sec == 4:  # curioso: pizzicato a contratiempo y caja suave
        root, chord = LIVELY[bar % 4]
        if beat == 0: add(tone(mid(root - 12), BEAT * 1.5, 'tri', a=0.01, d=0.3, s=0.4, r=0.1), t, 0.14)
        for h in range(2):
            m = [chord[0], chord[2], chord[1], chord[2] + 12][(beat * 2 + h) % 4] + 12
            add(pl(m, 0.6), t + h * BEAT / 2, 0.09 if h else 0.06, pan=0.3 if h else -0.3)
        if beat in (1, 3): add(snare(0.6), t, 1.0, pan=0.1)
        continue
    root, chord = LIVELY[bar % 4]
    en = {5: 0.8, 6: 0.85, 7: 0.95, 8: 1.05, 9: 0.9, 10: 0.5}[sec]
    party = sec in (7, 8, 9)
    if beat == 0:
        for k, m in enumerate(chord): add(tone(mid(m), BAR + 0.3, 'pad', a=0.2, d=1.0, s=0.7, r=0.4), t, 0.045 * en, pan=(k - 1) * 0.5)
        add(tone(mid(root), BEAT * 1.8, 'tri', a=0.01, d=0.4, s=0.5, r=0.1), t, 0.16 * en)
    if beat == 2: add(tone(mid(root + 7 if root < 45 else root), BEAT * 1.6, 'tri', a=0.01, d=0.4, s=0.5, r=0.1), t, 0.12 * en)
    for h in range(2):
        tt = t + h * BEAT / 2
        seq = chord + [chord[1] + 12]
        m = seq[(beat * 2 + h) % 4] + 12 + (12 if party and h == 1 else 0)
        add(tone(mid(m), 0.35, 'marimba', a=0.004, d=0.12, s=0.0, r=0.05), tt, 0.07 * en, pan=0.35 if h else -0.35)
        if sec != 10: add(shaker(en), tt + 0.002, 0.8, pan=0.4)
    if sec == 10:
        if beat == 0: add(kick(), t, 0.1)
        continue
    if beat in (0, 2) or party: add(kick(), t, 0.2 * en)
    if beat in (1, 3) and sec >= 6: add(clap(), t, (1.0 if party else 0.7) * en, pan=-0.1)
    if sec >= 7 and beat in (0, 1, 3):
        mel = [76, 79, 81, 79, 76, 74, 72, 74][b % 8]
        add(tone(mid(mel), BEAT * 0.9, 'sine', a=0.02, d=0.25, s=0.4, r=0.1), t, 0.05 * en, pan=0.1)
# redobles curiosos en la escena 4 (viñetas y sello)
for t0 in (starts[3] + cue(4, 'pl', 0.1), starts[3] + cue(4, 'seal', 3.6) - 0.5):
    for k in range(10): add(snare(0.35 + 0.07 * k), t0 + k * 0.05, 1.0, pan=0.1)
# golpe de energía en la decisión (escena 5)
for k, m in enumerate([72, 76, 79, 84]):
    add(tone(mid(m), 1.4, 'bell', a=0.002, d=0.5, s=0.0, r=0.3), hit + k * 0.045, 0.06, pan=(k - 1.5) * 0.3)
    add(tone(mid(m - 12), 1.2, 'pad', a=0.01, d=0.6, s=0.4, r=0.4), hit, 0.05, pan=(k - 1.5) * 0.3)
add(kick(), hit, 0.35); add(tone(mid(36), 0.8, 'tri', a=0.005, d=0.3, s=0.2, r=0.2), hit, 0.2)
for k in range(6): add(shaker(1.4), hit - 0.36 + k * 0.06, 0.5 + k * 0.1)
# remate en el destello (escena 9)
for k, m in enumerate([60, 64, 67, 72]):
    add(tone(mid(m), 1.6, 'bell', a=0.002, d=0.6, s=0.0, r=0.3), flash + k * 0.03, 0.05, pan=(k - 1.5) * 0.3)
add(kick(), flash, 0.35); add(clap(), flash, 1.2)
# cierre optimista: acorde final sostenido en la tarjeta
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
p = os.path.join(ROOT, 'audio', 'musica.wav')
with wave.open(p, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())
print('música ->', os.path.relpath(p, ROOT), f'{TOTAL:.2f} s')
