#!/usr/bin/env python3
"""Música original del vídeo 17 «Próxima apertura», sintetizada con código: alegre y expectante, tipo «cuenta atrás»
   (tictac de reloj en cada pulso, 100 bpm). Escenas 1-3 expectante (pizzicato, bajo y pad en La menor, va creciendo);
   escenas 4-6 alegre (marimba, bombo, palmas, melodía en Do mayor); redoble y tictac acelerado antes del cierre y
   acorde final en la escena 7. Fundido de entrada 0,5 s y de salida 1,5 s. Duración = la del vídeo (config).
   Uso: CONFIG=config17.json python3 audio/v17_music.py  -> audio/musica.mp3 (TikTok: audio/musica_tiktok.mp3)"""
import os, json, wave, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
cfg = json.load(open(os.path.join(ROOT, os.environ.get('CONFIG', 'config17.json'))))
FPS = cfg['fps']
starts, fr = [], 0
for s in cfg['scenes']:
    starts.append(fr / FPS); fr += round(s['duration'] * FPS)
TOTAL = fr / FPS
N = int(TOTAL * SR) + SR
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(17)

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
# ---------- estructura (vídeo 17) ----------
st = lambda i: starts[i - 1]
fin = st(7)
EXPECT = [(45, [57, 60, 64]), (41, [57, 60, 65]), (43, [55, 59, 62]), (40, [56, 59, 64])]   # Am F G E (expectante)
HAPPY = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [57, 60, 64]), (41, [57, 60, 65])]    # C G Am F (alegre)
def tick(g=1.0, hi=True):  # tictac de reloj (cuenta atrás)
    n = int(0.03 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (2600 if hi else 2000) * t) * np.exp(-t * 260) * 0.5 * g
nb = int(fin / BEAT) + 1
for b in range(nb):
    t = b * BEAT
    if t >= fin - 0.02: break
    bar = int(t / BAR); beat = b % 4
    add(tick(1.0 if beat % 2 == 0 else 0.7, beat % 2 == 0), t, 0.5, pan=0.4)          # tic-tac en cada pulso
    if t < st(4):   # escenas 1-3: expectante (pizzicato en corcheas, bajo y pad), crece poco a poco
        en = 0.7 + 0.3 * t / st(4)
        root, chord = EXPECT[bar % 4]
        if beat == 0:
            for k, m in enumerate(chord): add(tone(mid(m), BAR + 0.4, 'pad', a=0.3, d=1.2, s=0.7, r=0.5), t, 0.035 * en, pan=(k - 1) * 0.5)
        add(tone(mid(root - 12), BEAT * 0.9, 'tri', a=0.01, d=0.3, s=0.4, r=0.1), t, 0.13 * en)
        for h in range(2): add(pl(chord[(beat * 2 + h) % 3] + 12, 0.5), t + h * BEAT / 2, 0.075 * en, pan=0.3 if h else -0.3)
        if beat in (0, 2) and t > st(2): add(kick(), t, 0.14 * en)
        if t > st(3): add(shaker(0.8), t + BEAT / 2, 0.6, pan=0.4)
        continue
    # escenas 4-6: alegre (marimba, bombo, palmas, shaker y melodía)
    root, chord = HAPPY[bar % 4]
    if beat == 0:
        for k, m in enumerate(chord): add(tone(mid(m), BAR + 0.3, 'pad', a=0.2, d=1.0, s=0.7, r=0.4), t, 0.04, pan=(k - 1) * 0.5)
        add(tone(mid(root), BEAT * 1.8, 'tri', a=0.01, d=0.4, s=0.5, r=0.1), t, 0.15)
    if beat == 2: add(tone(mid(root + 7 if root < 45 else root), BEAT * 1.6, 'tri', a=0.01, d=0.4, s=0.5, r=0.1), t, 0.12)
    for h in range(2):
        tt = t + h * BEAT / 2; seq = chord + [chord[1] + 12]
        add(tone(mid(seq[(beat * 2 + h) % 4] + 12), 0.35, 'marimba', a=0.004, d=0.12, s=0.0, r=0.05), tt, 0.065, pan=0.35 if h else -0.35)
        add(shaker(1.0), tt + 0.002, 0.8, pan=0.4)
    if beat in (0, 2): add(kick(), t, 0.2)
    if beat in (1, 3): add(clap(), t, 0.7, pan=-0.1)
    if beat in (0, 1, 3):
        mel = [76, 79, 81, 79, 76, 74, 72, 74][b % 8]
        add(tone(mid(mel), BEAT * 0.9, 'sine', a=0.02, d=0.25, s=0.4, r=0.1), t, 0.045, pan=0.1)
# cuenta atrás antes del cierre: redoble que crece y «tic» acelerado
for k in range(16): add(shaker(1.2), fin - 0.8 + k * 0.05, 0.3 + k * 0.05)
for k in range(8): add(tick(1.2, k % 2 == 0), fin - 0.8 + k * 0.1, 0.6)
# cierre: acorde final sostenido
for k, m in enumerate([60, 64, 67, 72, 76]):
    add(tone(mid(m), 2.6, 'pad', a=0.03, d=1.2, s=0.6, r=1.0), fin, 0.06, pan=(k - 2) * 0.3)
    add(tone(mid(m + 12), 2.0, 'bell', a=0.002, d=0.6, s=0.0, r=0.4), fin + k * 0.04, 0.03, pan=(k - 2) * 0.3)
add(tone(mid(36), 2.2, 'tri', a=0.01, d=0.8, s=0.3, r=0.8), fin, 0.18); add(kick(), fin, 0.3)

def delay(x, ms, g):
    d = int(ms * SR / 1000); y = x.copy(); y[d:] += x[:-d] * g; return y
out = np.stack([delay(L, 180, 0.18), delay(R, 230, 0.18)], 1)[: int(TOTAL * SR)]
fi, fo = int(0.5 * SR), int(1.5 * SR)
out[:fi] *= np.linspace(0, 1, fi)[:, None]; out[-fo:] *= np.linspace(1, 0, fo)[:, None]   # fundidos 0,5 s / 1,5 s
out *= 0.5 / max(1e-6, np.abs(out).max())
p = os.path.join(ROOT, cfg.get('musicMp3', 'audio/musica.mp3')); tmpw = p.replace('.mp3', '.wav')
with wave.open(tmpw, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmpw, '-c:a', 'libmp3lame', '-b:a', '192k', p], check=True); os.remove(tmpw)
print('música ->', os.path.relpath(p, ROOT), f'{TOTAL:.2f} s')
