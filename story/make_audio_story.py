#!/usr/bin/env python3
"""Pista de efectos (sintetizados, básicos) para la story de intriga -> story/story_intriga_con_audio.mp4 (imagen con -c:v copy).
   Zumbido grave de intriga + tic-tac, pops al entrar los textos, golpe del sello «¿SEGURO?», whoosh entre planos,
   dings de las dos opciones y «ting» final. Sin voz ni música (en la story se puede añadir música desde la app)."""
import json, os, subprocess, wave
import numpy as np
D = os.path.dirname(os.path.abspath(__file__)); SR = 48000; rng = np.random.default_rng(7)
cfg = json.load(open(os.path.join(D, 'config.json')))
st = {}; t0 = 0.0
for s in cfg['scenes']:
    st[s['id']] = t0; t0 += round(s['duration'] * 30) / 30
TOT = t0; N = int(TOT * SR); mix = np.zeros(N)
db = lambda x: 10 ** (x / 20); tt = lambda d: np.arange(int(d * SR)) / SR
norm = lambda x: x / (np.max(np.abs(x)) or 1)
def filt(x, lo, hi):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / (1 + (lo / np.maximum(fr, 1)) ** 4)) * (1 / (1 + (fr / hi) ** 4)); return np.fft.irfft(X, len(x))
def put(x, t, g):
    i = int(t * SR); n = min(len(x), N - i)
    if n > 0: mix[i:i + n] += x[:n] * g
def pop(f0=520):
    t = tt(0.14); return norm(np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.6 * np.exp(-t * 40))) / SR) * np.exp(-t * 32))
def ding(f=1320, d=0.9):
    t = tt(d); return norm((np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 8)) * np.exp(-t * 5))
def whoosh(d=0.4):
    t = tt(d); return norm(filt(rng.standard_normal(len(t)), 400, 4000) * np.sin(np.pi * t / d) ** 1.5)
def thud():
    t = tt(0.5); x = np.sin(2 * np.pi * np.cumsum(90 + 120 * np.exp(-t * 18)) / SR) * np.exp(-t * 9)
    return norm(x + 0.4 * filt(rng.standard_normal(len(t)), 100, 1500) * np.exp(-t * 30))
def tick(f=2600):
    t = tt(0.03); return norm(filt(rng.standard_normal(len(t)), f * 0.6, f * 1.6) * np.exp(-t * 250))
# zumbido grave de intriga (planos A-C) que se corta en seco al llegar «MAÑANA»
dd = st[104]; t = tt(dd)
drone = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 82.4 * t) + 0.3 * np.sin(2 * np.pi * 110.3 * t)) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.5 * t))
drone *= np.minimum(1, t / 0.6) * np.minimum(1, (dd - t) / 0.05)
put(norm(drone), 0, db(-24))
# tic-tac de reloj (A-C)
k = 0
while k * 0.5 < dd - 0.1:
    put(tick(2600 if k % 2 else 1900), k * 0.5, db(-26)); k += 1
A, B, Cc, Dd = st[101], st[102], st[103], st[104]
put(pop(), A + 0.2, db(-14)); put(pop(600), A + 0.9, db(-14)); put(thud(), A + 2.3, db(-8))
put(whoosh(), B - 0.15, db(-18)); put(pop(), B + 0.2, db(-14)); put(pop(600), B + 1.0, db(-15)); put(pop(440), B + 2.0, db(-12))
put(whoosh(), Cc - 0.15, db(-18)); put(pop(), Cc + 0.15, db(-14)); put(ding(1320), Cc + 0.7, db(-16)); put(ding(1760), Cc + 1.3, db(-16))
put(whoosh(0.5), Dd - 0.2, db(-14)); put(thud(), Dd + 0.05, db(-10)); put(ding(2350, 1.2), Dd + 0.8, db(-13)); put(ding(3520, 1.0), Dd + 0.85, db(-20))
mix *= db(-1) / (np.max(np.abs(mix)) or 1) if np.max(np.abs(mix)) > db(-1) else 1
mix[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))
wav = os.path.join(D, 'efectos_story.wav')
with wave.open(wav, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    y = (np.clip(mix, -1, 1) * 32767).astype('<i2'); w.writeframes(np.stack([y, y], 1).tobytes())
out = os.path.join(D, cfg['output'].replace('.mp4', '_con_audio.mp4')); tmp = out.replace('.mp4', '.partial.mp4')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(D, cfg['output']), '-i', wav, '-map', '0:v:0', '-map', '1:a:0',
                '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', f'{TOT:.3f}', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, out); print('->', os.path.relpath(out, os.path.dirname(D)), f'({TOT:.2f} s, efectos sintetizados básicos)')
