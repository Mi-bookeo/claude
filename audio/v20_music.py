#!/usr/bin/env python3
"""Música original del vídeo 20 «Se encienden las luces de Navidad», sintetizada con código (numpy): instrumental,
   sin el audio del espectáculo. Melodías tradicionales de dominio público («Jingle Bells», J. Pierpont, 1857, y
   «Noche de paz», F. X. Gruber, 1818), arreglo e interpretación propios. Do mayor. Arco narrativo:
   1) EXPECTANTE (escenas 0 y 1): colchón de cuerdas muy suave (C · Am · F · G), celesta suelta y un brillo de cascabeles.
   2) CON RITMO (escena 2, los bailarines): «Jingle Bells» a 120 bpm (negra = 0,5 s, a tempo con la coreografía):
      piano, bajo, cascabeles en corcheas y bombo suave.
   3) TIERNO (escenas 3 y 4, cantantes y coro): «Noche de paz» lenta (corchea = 0,4 s), piano y celesta con cuerdas.
   4) CRESCENDO (escena 5): cuerdas que suben sobre G7 y redoble de timbal; UN SEGUNDO DE SILENCIO antes de «luz»;
      al encenderse, acorde grande con campanas.
   5) CÁLIDO (escenas 6 y 7): final de «Noche de paz» con cuerdas, piano y campanas; acorde final en el cierre.
   Los momentos salen de config20.voz.json. Uso: python3 audio/v20_music.py -> audio/musica20.mp3"""
import os, json, wave, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
cfg = json.load(open(os.path.join(ROOT, os.environ.get('CONFIG', 'config20.voz.json'))))
FPS = cfg['fps']
SC, fr = {}, 0
for s in cfg['scenes']:
    n = round(s['duration'] * FPS); SC[s['id']] = dict(s, start=fr / FPS); fr += n
TOTAL = fr / FPS
N = int(TOTAL * SR) + SR
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(20)
st = lambda i: SC[i]['start']
if cfg.get('story'):   # story: se montan los trozos de audio/musica20.mp3 de cada escena (fundidos de 0,15 s)
    main = os.path.join(ROOT, 'audio', 'musica20.mp3'); parts = []
    for s_ in cfg['scenes']:
        d = round(s_['duration'] * FPS) / FPS
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(cfg['musicFrom'][str(s_['id'])]), '-t', f'{d:.3f}', '-i', main, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
        x = np.frombuffer(raw, '<f4').astype(np.float64).reshape(-1, 2)[: int(d * SR)]
        x = np.vstack([x, np.zeros((int(d * SR) - len(x), 2))]); f_ = int(0.15 * SR)
        x[:f_] *= np.linspace(0, 1, f_)[:, None]; x[-f_:] *= np.linspace(1, 0, f_)[:, None]; parts.append(x)
    mix = np.vstack(parts); out = os.path.join(ROOT, cfg['musicMp3']); wav = out.replace('.mp3', '.wav')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '192k', out], check=True); os.remove(wav)
    print('->', os.path.relpath(out, ROOT), f'({len(mix) / SR:.2f} s)'); raise SystemExit
T_JB, T_SN = st(2), st(3)                  # Jingle Bells / Noche de paz
T_CRES, T_ON = st(5), st(5) + SC[5]['cues']['on']
T_SIL = T_ON - 1.0                         # segundo de silencio
T_WARM = st(6)
mid = lambda m: 440.0 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def sm(x, n): return np.convolve(x, np.ones(n) / n, 'same') if n > 1 else x
def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0: return
    if i < 0: sig = sig[-i:]; i = 0
    sig = sig[: N - i]
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * gain * gl * 1.414; R[i:i + len(sig)] += sig * gain * gr * 1.414

# ---------------- instrumentos ----------------
def piano(m, d, vel=1.0):
    f = mid(m); t = tt(d + 1.2); s = np.zeros(len(t))
    for k, g in enumerate([1, 0.45, 0.25, 0.12, 0.06], 1): s += g * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k)) * np.exp(-t * (1.6 + 0.9 * k))
    s *= np.minimum(1, t / 0.004); rel = np.clip(1 - (t - d) / 0.35, 0, 1); return s * rel * vel
def celesta(m, d=1.2):
    f = mid(m); t = tt(d)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4.01 * t) * np.exp(-t * 6)) * np.exp(-t * 3.2) * np.minimum(1, t / 0.002)
def bellc(m, d=2.5):
    f = mid(m); t = tt(d)
    return sum(g * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dc) for r, g, dc in ((1, 1, 1.4), (2.76, 0.45, 2.6), (5.4, 0.25, 4), (8.9, 0.12, 6)))
def strings(ms, d, att=0.6, rel=0.8, bright=1.0):
    t = tt(d + rel); s = np.zeros(len(t))
    for m in ms:
        for det in (-0.12, 0.0, 0.11):
            f = mid(m) * 2 ** (det / 12); vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t + rng.uniform(0, 6))
            ph = 2 * np.pi * np.cumsum(f * vib) / SR
            s += sum((0.55 if k == 1 else 0.5 * bright / k) * np.sin(k * ph) for k in (1, 2, 3, 4))
    env = np.minimum(1, t / att) * np.clip(1 - (t - d) / rel, 0, 1)
    return sm(s, 3) * env / (3 * len(ms))
def bass(m, d):
    f = mid(m); t = tt(d + 0.2)
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 2.5) * np.clip(1 - (t - d) / 0.15, 0, 1) * np.minimum(1, t / 0.005)
def sleigh(d=0.12):
    t = tt(d); x = rng.standard_normal(len(t)); x = x - sm(x, 3)
    s = x * 0.5 + sum(np.sin(2 * np.pi * fq * t) * 0.25 for fq in rng.uniform(5000, 8500, 4))
    return s * np.exp(-t * 38)
def kick():
    t = tt(0.3); return np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-t * 30)) / SR) * np.exp(-t * 9)
def timp_roll(d, f=mid(43)):
    t = tt(d); s = np.zeros(len(t))
    for o in np.arange(0, d, 0.055):
        tt_ = np.maximum(t - o, 0); s += (t >= o) * np.sin(2 * np.pi * f * tt_) * np.exp(-tt_ * 9) * rng.uniform(0.6, 1)
    return s * np.linspace(0.2, 1, len(t)) ** 2
CH = {'C': [48, 55, 60, 64], 'Am': [45, 52, 57, 60], 'F': [41, 53, 57, 60], 'G': [43, 55, 59, 62], 'G7': [43, 53, 59, 62], 'Dm': [50, 57, 62, 65]}

# ---------------- 1) EXPECTANTE ----------------
prog = ['C', 'Am', 'F', 'G']; bar = 2.0; t = 0.0; k = 0
while t < T_JB - 0.1:
    d = min(bar, T_JB - t)
    add(strings(CH[prog[k % 4]][1:], d + 0.2, att=0.8, rel=0.6, bright=0.5), t, 0.5)
    k += 1; t += bar
for j, (o, m) in enumerate([(0.6, 79), (1.7, 76), (3.1, 84), (4.4, 79), (5.3, 83), (6.0, 86)]):
    if o < T_JB: add(celesta(m), o, 0.18, (-0.4, 0.4)[j % 2])
for j in range(10): add(sleigh(0.2), T_JB - 1.0 + j * 0.1, 0.05 * j / 10)   # brillo que anuncia el baile

# ---------------- 2) CON RITMO: Jingle Bells (negra = 0,5 s) ----------------
q = 0.5
E, G, C5, D, F = 76, 79, 84, 74, 77   # en Do: mi, sol, do agudo, re, fa (octava alta)
JB = [(E, 1), (E, 1), (E, 2), (E, 1), (E, 1), (E, 2), (E, 1), (G, 1), (C5 - 12 + 12, 1.5), (D, 0.5), (E, 4)]
JB = [(E, 1), (E, 1), (E, 2), (E, 1), (E, 1), (E, 2), (E, 1), (G, 1), (72, 1.5), (74, 0.5), (E, 4)]
t = T_JB
for m, b in JB:
    if t >= T_SN + 1.5: break
    add(piano(m, b * q * 0.9, 1.0), t, 0.32, 0.1); add(piano(m - 12, b * q * 0.9, 0.6), t, 0.16, 0.1)
    t += b * q
nb = int((T_SN - T_JB) / q)
for b in range(nb):
    tb = T_JB + b * q; barc = ['C', 'C', 'C', 'G7'][(b // 4) % 4]
    add(bass(CH[barc][0], q * 0.9), tb, 0.35 if b % 2 == 0 else 0.25)
    if b % 2 == 1: [add(piano(m, q * 0.6, 0.7), tb, 0.08, -0.25) for m in CH[barc][1:]]
    add(kick(), tb, 0.22 if b % 2 == 0 else 0.12)
    add(sleigh(), tb, 0.12, 0.5); add(sleigh(0.08), tb + q / 2, 0.08, 0.5)
add(bellc(84), T_SN - 0.02, 0.12)

# ---------------- 3) TIERNO: Noche de paz (corchea = 0,4 s) ----------------
e = 0.4
SN = [[(67, 1.5), (69, .5), (67, 1), (64, 3)], [(67, 1.5), (69, .5), (67, 1), (64, 3)], [(74, 2), (74, 1), (71, 3)], [(72, 2), (72, 1), (67, 3)],
      [(69, 2), (69, 1), (72, 1.5), (71, .5), (69, 1)], [(67, 1.5), (69, .5), (67, 1), (64, 3)], [(69, 2), (69, 1), (72, 1.5), (71, .5), (69, 1)], [(67, 1.5), (69, .5), (67, 1), (64, 3)],
      [(74, 2), (74, 1), (77, 1.5), (74, .5), (71, 1)], [(72, 3), (76, 3)], [(72, 1.5), (67, .5), (64, 1), (67, 1.5), (65, .5), (62, 1)], [(60, 6)]]
SNCH = ['C', 'C', 'G7', 'C', 'F', 'C', 'F', 'C', 'G7', 'C', 'G7', 'C']
def silent_night(t0, bars, until, warm=False):
    t = t0
    for bi in bars:
        if t >= until - 0.05: break
        bd = 6 * e; ch = CH[SNCH[bi]]
        add(strings(ch[1:], min(bd, until - t), att=0.5, rel=0.7, bright=0.6), t, 0.42 if warm else 0.3)
        add(bass(ch[0], bd * 0.9), t, 0.22)
        for j, m in enumerate(ch[1:] + [ch[2] + 12]):   # arpegio suave de piano en corcheas
            for rep in range(0, 6, 4):
                o = t + (j + rep) * e
                if o < until and j + rep < 6: add(piano(m, e * 1.5, 0.5), o, 0.07, -0.3)
        tn = t
        for m, b in SN[bi]:
            if tn < until - 0.05:
                add(piano(m + 12 if not warm else m, b * e * 0.95, 0.9), tn, 0.22, 0.15)
                add(celesta(m + 12), tn, 0.08 if not warm else 0.12, -0.2)
            tn += b * e
        if warm: add(bellc(ch[2] + 24, 3.0), t, 0.06, 0.4)
        t += bd
    return t
silent_night(T_SN + 0.1, list(range(12)), T_CRES)

# ---------------- 4) CRESCENDO + silencio + encendido ----------------
dc = T_SIL - T_CRES
s = strings([55, 59, 62, 65, 67], dc, att=dc * 0.9, rel=0.05, bright=1.0) * np.linspace(0.3, 1.6, int((dc + 0.05) * SR)) ** 1.5
add(s, T_CRES, 0.55)
add(timp_roll(dc), T_CRES, 0.35)
for j, m in enumerate([67, 71, 74, 77, 79, 83]): add(celesta(m + 12, 0.6), T_CRES + dc * (0.4 + 0.1 * j), 0.1)
# silencio total de T_SIL a T_ON (corte limpio al final del crescendo)
L[int(T_SIL * SR):int(T_ON * SR)] = 0; R[int(T_SIL * SR):int(T_ON * SR)] = 0
# acorde grande con campanas al encenderse
add(strings([48, 60, 64, 67, 72, 76], T_WARM - T_ON + 0.8, att=0.03, rel=0.9, bright=1.1), T_ON, 0.75)
for m in (36, 48): add(piano(m, 2.5, 1.0), T_ON, 0.3)
for m in (60, 64, 67, 72, 76): add(piano(m, 2.5, 0.9), T_ON, 0.12)
for j, m in enumerate([72, 76, 79, 84, 88, 91]): add(bellc(m), T_ON + 0.08 * j, 0.1, (-0.5, 0.5)[j % 2])
for b in range(int((T_WARM - T_ON) / 0.25)): add(sleigh(0.1), T_ON + 0.3 + b * 0.25, 0.05 * (1 - b * 0.25 / (T_WARM - T_ON)), 0.5)

# ---------------- 5) CÁLIDO: final de Noche de paz ----------------
tend = silent_night(T_WARM, [8, 9, 10, 11], TOTAL, warm=True)
add(bellc(84, 4.0), TOTAL - 2.6, 0.08); add(bellc(79, 4.0), TOTAL - 2.5, 0.06)

mix = np.stack([L, R], 1)[: int(TOTAL * SR)]
mix *= 0.8 / max(np.abs(mix).max(), 1e-9)
out = os.path.join(ROOT, cfg.get('musicMp3', 'audio/musica20.mp3')); wav = out.replace('.mp3', '.wav')
with wave.open(wav, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '192k', out], check=True); os.remove(wav)
print(f'-> {os.path.relpath(out, ROOT)} ({TOTAL:.2f} s) · Jingle Bells {T_JB:.2f} s · Noche de paz {T_SN:.2f} s · crescendo {T_CRES:.2f} s · silencio {T_SIL:.2f}–{T_ON:.2f} s · cálido {T_WARM:.2f} s')
