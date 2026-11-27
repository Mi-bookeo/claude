#!/usr/bin/env python3
"""Música original del vídeo 18 «Pedro y la ITV», sintetizada con código (numpy). Tres partes:
   1) TENSIÓN (escena 1 → «bingo» de la escena 3): Re menor, 96 bpm. Ostinato grave de corcheas, cuerdas en trémolo
      (Dm · B♭ · Gm · A), timbal en cada compás, tictac agudo. Sube con un «riser» hasta el golpe del sello
      DESFAVORABLE, más fuerte en el coche y más contenida mientras busca en el móvil.
   2) ESPERANZA (del «bingo» al «¡Claro!» del mecánico): arpegio suave de Re mayor, sin percusión.
   3) ALEGRE (desde «¡Claro!» hasta el final): Re mayor, 116 bpm (D · G · Bm · A), bajo, marimba con melodía,
      bombo, palmas y charles; acorde final en el cierre.
   El hook (escena 0) va sin música (solo efectos). Los momentos salen de config18.json.
   Uso: CONFIG=config18.json python3 audio/v18_music.py  -> audio/musica18.mp3 (TikTok: audio/musica18_tiktok.mp3)"""
import os, json, wave, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
cfg = json.load(open(os.path.join(ROOT, os.environ.get('CONFIG', 'config18.json'))))
FPS = cfg['fps']
SC, fr = {}, 0
for s in cfg['scenes']:
    n = round(s['duration'] * FPS); SC[s['id']] = dict(s, start=fr / FPS); fr += n
TOTAL = fr / FPS
N = int(TOTAL * SR) + SR
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(18)
cue = lambda i, k: SC[i]['start'] + SC[i]['cues'][k]
T_TENS0 = SC[1]['start']                 # empieza la tensión
T_HIT = cue(1, 'hit')                    # golpe DESFAVORABLE
T_SEARCH = SC[3]['start']                # busca en el móvil (tensión contenida)
T_BINGO = cue(3, 'bingo')                # aparece la oferta
T_HAPPY = cue(4, 'claro')                # «¡Claro!»
T_END = SC[8]['start']                   # tarjeta final
mid = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0: return
    if i < 0: sig = sig[-i:]; i = 0
    sig = sig[: N - i]
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * gain * gl * 1.414; R[i:i + len(sig)] += sig * gain * gr * 1.414
def tt(d): return np.arange(int(d * SR)) / SR
def smooth(x, n):  # paso bajo sencillo (media móvil)
    return np.convolve(x, np.ones(n) / n, 'same') if n > 1 else x
def env(d, a=0.005, r=0.05):
    t = tt(d); return np.minimum(1, t / max(a, 1e-4)) * np.minimum(1, (d - t) / max(r, 1e-4))

# ---------------- instrumentos ----------------
def pluck(f, d=0.5, dec=6.0, bright=1.0):
    t = tt(d); s = sum((bright ** (h - 1)) / h * np.sin(2 * np.pi * f * h * t) * np.exp(-t * dec * (1 + 0.6 * h)) for h in range(1, 6))
    return s * np.minimum(1, t / 0.003)
def marimba(f, d=0.45):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30)) * np.exp(-t * 9) * np.minimum(1, t / 0.002)
def bass(f, d=0.3, dec=5):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + 0.45 * np.sin(4 * np.pi * f * t) + 0.2 * np.sin(6 * np.pi * f * t)) * np.exp(-t * dec) * env(d, 0.004, 0.04)
def string_pad(freqs, d, trem=0.0, a=0.4, r=0.6):
    t = tt(d); s = np.zeros(len(t))
    for fq in freqs:
        for det in (-0.12, 0.0, 0.13):
            ff = fq * 2 ** (det / 12)
            s += sum(np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6.28)) / h ** 1.3 for h in range(1, 6))
    s *= env(d, a, r) / (len(freqs) * 3)
    if trem: s *= 0.6 + 0.4 * (0.5 + 0.5 * np.sin(2 * np.pi * trem * t))
    return s
def timpani(f=73.4, d=1.2):
    t = tt(d); ff = f * (1 + 0.25 * np.exp(-t * 20))
    s = np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t * 3.2) + 0.3 * np.sin(2 * np.pi * np.cumsum(ff * 1.5) / SR) * np.exp(-t * 6)
    s += smooth(rng.standard_normal(len(t)), 30) * np.exp(-t * 40) * 1.2
    return s * np.minimum(1, t / 0.002)
def tick(d=0.04, f=3200):
    t = tt(d); return np.sin(2 * np.pi * f * t) * np.exp(-t * 220)
def kick(d=0.35):
    t = tt(d); ff = 50 + 110 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t * 9)
def clap(d=0.2):
    t = tt(d); n = rng.standard_normal(len(t)); n = n - smooth(n, 8)
    g = sum(np.exp(-np.maximum(t - o, 0) * 60) * (t >= o) for o in (0, 0.011, 0.022))
    return n * g * 0.8
def hat(d=0.06):
    t = tt(d); n = rng.standard_normal(len(t)); n = np.diff(np.diff(n, prepend=0), prepend=0); return n * np.exp(-t * 80) * 0.25
def riser(d):
    t = tt(d); n = rng.standard_normal(len(t)); out = np.zeros(len(t)); step = int(0.05 * SR)
    for k in range(0, len(t), step):          # ruido cada vez más brillante
        u = k / len(t); seg_ = n[k:k + step]; m = max(1, int(40 * (1 - u)) + 1)
        out[k:k + step] = smooth(seg_, m)[: len(seg_)] if len(seg_) > m else seg_
    sw = np.sin(2 * np.pi * np.cumsum(200 + 900 * (t / d) ** 2) / SR) * 0.25
    return (out * 0.6 + sw) * (t / d) ** 2

# ---------------- 1) TENSIÓN ----------------
BPM = 96.0; B = 60 / BPM; BAR = 4 * B
TPROG = [(38, [62, 65, 69]), (34, [62, 65, 70]), (31, [62, 67, 70]), (33, [61, 64, 69])]  # Dm Bb Gm A
def tens_level(t):
    if t < T_HIT: return 0.45 + 0.35 * (t - T_TENS0) / max(T_HIT - T_TENS0, 0.1)
    if t < T_SEARCH: return 1.0
    return 0.7
t0 = T_TENS0; k = 0
while t0 < T_BINGO - 0.05:
    root, ch = TPROG[(k // 1) % 4]
    lv = tens_level(t0); bar_end = min(t0 + BAR, T_BINGO)
    d = bar_end - t0
    add(string_pad([mid(m) for m in ch], d + 0.3, trem=9.5 if t0 >= T_HIT else 0, a=0.25, r=0.3), t0, 0.16 * lv, -0.2)
    add(string_pad([mid(m - 12) for m in ch[:1]], d + 0.3, a=0.3, r=0.3), t0, 0.12 * lv, 0.2)
    # ostinato de corcheas en la raíz (y la quinta en los tiempos 3 y 7)
    for e in range(8):
        te = t0 + e * B / 2
        if te >= T_BINGO - 0.02: break
        f_ = mid(root + (7 if e in (3, 7) else 0))
        add(bass(f_, 0.22, 9), te, 0.34 * lv * (1.15 if e % 2 == 0 else 0.85), 0)
        add(tick(0.03, 2600 if e % 2 else 3300), te, 0.05 * lv, 0.5 if e % 2 else -0.5)
    if t0 >= T_HIT - 0.01: add(timpani(mid(root)), t0, 0.32 * lv, 0)
    # notas agudas de suspense (semitono) en la segunda mitad de cada compás
    if t0 >= T_HIT and t0 < T_SEARCH:
        for j, m in enumerate((81, 82)): add(pluck(mid(m), 0.6, 5, 0.6), t0 + BAR / 2 + j * B, 0.06, 0.4)
    t0 += BAR; k += 1
# subida antes del golpe del sello y golpe grave en el sello
add(riser(T_HIT - T_TENS0 - 0.05), T_TENS0, 0.12, 0)
add(timpani(55, 2.0), T_HIT, 0.6, 0); add(string_pad([mid(50), mid(53), mid(57)], 1.6, a=0.01, r=1.2), T_HIT, 0.35, 0)
# cola de la tensión hasta el «bingo»: subida corta
add(riser(1.2), T_BINGO - 1.2, 0.08, 0)

# ---------------- 2) ESPERANZA ----------------
HPROG = [[62, 66, 69, 74], [59, 62, 66, 71], [67, 71, 74, 79], [57, 61, 64, 69]]  # D Bm G A
B2 = 60 / 104
t0 = T_BINGO; k = 0
while t0 < T_HAPPY - 0.05:
    ch = HPROG[(k // 8) % 4]
    add(pluck(mid(ch[k % 4] + 12), 0.9, 4.2, 0.5), t0, 0.22, -0.3 + 0.2 * (k % 4))
    if k % 8 == 0: add(string_pad([mid(m) for m in ch[:3]], min(8 * B2, T_HAPPY - t0) + 0.4, a=0.5, r=0.5), t0, 0.22, 0)
    if k % 2 == 0: add(tick(0.03, 2400), t0, 0.04, 0.3)
    t0 += B2 / 2; k += 1

# ---------------- 3) ALEGRE ----------------
BPM3 = 116.0; B3 = 60 / BPM3; BAR3 = 4 * B3
PROG3 = [(38, [62, 66, 69]), (43, [62, 67, 71]), (47, [62, 66, 71]), (45, [61, 64, 69])]  # D G Bm A
MEL = [74, 76, 78, 76, 74, 71, 69, None, 71, 74, 76, 78, 81, 78, 76, None,
       78, 76, 74, 76, 78, 81, 83, None, 81, 78, 76, 74, 73, 74, 76, None]
t0 = T_HAPPY; k = 0
add(string_pad([mid(74), mid(78), mid(81)], 0.9, a=0.01, r=0.7), T_HAPPY, 0.1, 0)
while t0 < T_END - 0.02:
    root, ch = PROG3[(k // 8) % 4]
    beat = k % 8                      # corcheas dentro del compás
    if beat % 2 == 0:
        add(bass(mid(root), 0.3, 6), t0, 0.36, 0)
        if beat in (0, 4): add(kick(), t0, 0.5, 0)
        if beat in (2, 6): add(clap(), t0, 0.32, 0.1)
    else:
        add(bass(mid(root + 12), 0.18, 9), t0, 0.18, 0)
    add(hat(), t0, 0.5, 0.35)
    # acorde de marimba a contratiempo
    if beat % 2 == 1:
        for m in ch: add(marimba(mid(m), 0.25), t0, 0.07, -0.2)
    m = MEL[k % len(MEL)]
    if m and k >= 8: add(marimba(mid(m), 0.5), t0, 0.16, 0.25)
    t0 += B3 / 2; k += 1
# final: redoble corto y acorde en la tarjeta del cierre
for j in range(8): add(clap(0.08), T_END - 0.5 + j * 0.06, 0.12 + 0.03 * j, 0)
for m in (50, 62, 66, 69, 74, 78): add(pluck(mid(m), 3.0, 0.8, 0.7), T_END, 0.25, 0)
add(string_pad([mid(62), mid(66), mid(69), mid(74)], 3.0, a=0.02, r=1.6), T_END, 0.32, 0)
add(kick(), T_END, 0.55, 0); add(timpani(73.4, 2.0), T_END, 0.3, 0)

# ---------------- salida ----------------
mix = np.stack([L, R], 1)[: int(TOTAL * SR)]
fo = int(0.6 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix *= 0.89 / max(np.abs(mix).max(), 1e-9)
tmpw = os.path.join(ROOT, 'audio', 'musica18_tmp.wav')
with wave.open(tmpw, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
out = os.path.join(ROOT, cfg.get('musicMp3', 'audio/musica18.mp3'))
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmpw, '-c:a', 'libmp3lame', '-b:a', '192k', out], check=True)
os.remove(tmpw)
print(f'-> {os.path.relpath(out, ROOT)} ({TOTAL:.2f} s) · tensión {T_TENS0:.2f}-{T_BINGO:.2f} s · esperanza hasta {T_HAPPY:.2f} s · alegre hasta el final')
