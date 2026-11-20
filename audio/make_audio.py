#!/usr/bin/env python3
"""Vídeo 02 «Marta y el último 2x1». Música y efectos sintetizados (100 % originales, sin muestras de terceros).
Reutiliza los instrumentos y efectos del vídeo 01.
Los tiempos salen de config.json (inicio de cada escena + desfase del evento visual),
así que si cambias duraciones, el audio se recoloca solo.

Salida:
  audio/musica.wav    pista musical (ukelele, pizzicato, palmas, glockenspiel) ~116 BPM
  audio/efectos.wav   efectos (lluvia, vibración, plop, tic-tac, pasos, derrape, campanilla, trombón triste, pops...)
  audio/mezcla.wav    música + efectos, con hueco para la voz
"""
import json, os, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(ROOT, 'config.json'), encoding='utf-8'))
SR = 48000
FPS = cfg['fps']
rng = np.random.default_rng(7)

# ---- tiempos de escena (mismo redondeo a fotogramas que render.js) ----
start, fr = {}, 0
for s in cfg['scenes']:
    start[s['id']] = fr / FPS
    fr += round(s['duration'] * FPS)
TOTAL = fr / FPS
N = int(round(TOTAL * SR))
sc = {s['id']: s for s in cfg['scenes']}
def T(scene, off):
    return start[scene] + off

def buf():
    return np.zeros(N)
def add(dst, sig, t, gain=1.0):
    i = int(round(t * SR))
    if i >= N: return
    j = min(N, i + len(sig))
    if i < 0:
        sig = sig[-i:]; i = 0; j = min(N, len(sig))
    dst[i:j] += sig[:j - i] * gain
def tt(dur):
    return np.arange(int(dur * SR)) / SR
def ma(x, w):  # media móvil (paso bajo) vectorizada
    w = max(1, int(w))
    c = np.cumsum(np.concatenate([np.zeros(w), x]))
    return (c[w:] - c[:-w]) / w
def env_exp(dur, dec, att=0.003):
    t = tt(dur)
    return np.minimum(1, t / att) * np.exp(-t * dec)

# =================== MÚSICA ===================
BPM = 116
BEAT = 60 / BPM
_ks_cache = {}
def ks(freq, dur=1.4, bright=0.5):
    """Cuerda pulsada Karplus-Strong vectorizada por periodos (ukelele)."""
    key = (round(freq, 2), dur, bright)
    if key in _ks_cache: return _ks_cache[key]
    p = max(2, int(round(SR / freq)))
    n = int(dur * SR)
    y = np.zeros(n + p + 1)
    y[:p] = rng.uniform(-1, 1, p)
    y[:p] = bright * y[:p] + (1 - bright) * ma(y[:p], 3)
    dec = 0.996
    k = p
    while k < n:
        e = min(n, k + p)
        y[k:e] = dec * 0.5 * (y[k - p:e - p] + y[k - p - 1:e - p - 1] if k - p - 1 >= 0 else y[k - p:e - p] + np.concatenate([[0], y[k - p:e - p - 1]]))
        k = e
    out = y[:n] * np.exp(-tt(dur) * 2.2)
    out -= ma(out, 40) * 0.6  # quita algo de grave
    _ks_cache[key] = out
    return out

NOTE = lambda m: 440.0 * 2 ** ((m - 69) / 12)
# acordes de ukelele (cuerdas G C E A)
CH = {
    'C': [67, 60, 64, 72],
    'G': [67, 62, 67, 71],
    'Am': [69, 60, 64, 69],
    'F': [69, 60, 65, 69],
}
ROOTS = {'C': 48, 'G': 43, 'Am': 45, 'F': 41}
PROG = ['C', 'G', 'Am', 'F']
MEL = {  # glockenspiel: una nota por tiempo (None = silencio)
    'C': [76, 79, 81, 79], 'G': [74, 79, 83, None], 'Am': [76, 81, 84, 81], 'F': [77, 81, 79, None]
}

def strum(chord, up=False, vel=1.0):
    notes = CH[chord][::-1] if up else CH[chord]
    out = np.zeros(int(1.6 * SR))
    for i, m in enumerate(notes):
        s = ks(NOTE(m), 1.4, 0.55 if not up else 0.4)
        o = int((i * 0.011) * SR)
        out[o:o + len(s)] += s * vel * (0.8 if up else 1.0)
    return out

def pizz(m, vel=1.0):
    t = tt(0.5); f = NOTE(m)
    s = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t))
    return s * env_exp(0.5, 9, 0.004) * vel

def clap(vel=1.0):
    n = rng.uniform(-1, 1, int(0.18 * SR))
    hp = np.diff(n, prepend=0)
    band = ma(hp, 3)
    e = np.zeros(len(n))
    for k, d in enumerate([0, 0.009, 0.018]):
        i = int(d * SR); seg = env_exp(0.18 - d, 45 if k < 2 else 28, 0.001)
        e[i:i + len(seg)] += seg * (0.7 if k < 2 else 1.0)
    return band * e * vel

def glock(m, vel=1.0):
    t = tt(0.9); f = NOTE(m)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 12)
    return s * env_exp(0.9, 5, 0.002) * vel

def cymbal(dur=1.6):
    n = rng.uniform(-1, 1, int(dur * SR))
    hp = np.diff(n, prepend=0)
    return hp * env_exp(dur, 3.2, 0.002)


def cue(scene, off): return T(scene, off)
music = buf()
bar = 4 * BEAT
nbars = int(np.ceil(TOTAL / bar)) + 1
PATTERN = [(0, False, 1.0), (2, False, 0.85), (3, True, 0.6), (5, True, 0.6), (6, False, 0.8), (7, True, 0.55)]
end_t = T(11, sc[11].get('cut', 5.0))          # corte a la tarjeta final: acorde final
calm_end = start[2] + 1.0                      # salón aburrido: solo pizzicato suave
for b in range(nbars):
    t0 = b * bar
    if t0 >= end_t - 0.01: break
    ch = PROG[b % 4]
    for beat in (0, 2):
        if t0 + beat * BEAT < end_t: add(music, pizz(ROOTS[ch] + (0 if beat == 0 else 7)), t0 + beat * BEAT, 0.42)
    if t0 + bar <= calm_end: continue
    for eighth, up, v in PATTERN:
        t = t0 + eighth * BEAT / 2
        if calm_end <= t < end_t: add(music, strum(ch, up, v), t, 0.22)
    for beat in (1, 3):
        tb = t0 + beat * BEAT
        if calm_end <= tb < end_t: add(music, clap(), tb, 0.30)
    if t0 >= start[8] or start[3] <= t0 < start[6]:
        for k, m in enumerate(MEL[ch]):
            tk = t0 + k * BEAT
            if m and tk < end_t: add(music, glock(m), tk, 0.16)
add(music, strum('C', False, 1.0), end_t, 0.30)
add(music, pizz(36, 1.2), end_t, 0.5)
add(music, glock(84, 1.2), end_t, 0.22)
add(music, glock(88, 1.0), end_t + BEAT / 2, 0.18)
add(music, cymbal(1.4), end_t, 0.05)
add(music, cymbal(1.8), cue(3, 0.0), 0.06)       # arranque al ver la oferta
add(music, cymbal(1.8), cue(6, 1.05), 0.06)      # sale el sol

# envolvente de volumen por tramos
def seg_gain(points):
    g = np.ones(N); pts = sorted(points)
    for (ta, va), (tb, vb) in zip(pts, pts[1:]):
        i, j = int(ta * SR), min(N, int(tb * SR))
        if j > i: g[i:j] = np.linspace(va, vb, j - i)
    g[int(pts[-1][0] * SR):] = pts[-1][1]
    return g
g = seg_gain([(0, 0.5), (start[2], 0.5), (start[3], 1.0), (start[4], 1.15), (start[5], 1.0),
              (start[7] - 0.01, 1.0), (start[7], 0.35), (start[8] - 0.2, 0.35), (start[8], 1.0), (TOTAL, 1.0)])
fade = int(0.35 * SR)
g[-fade:] *= np.linspace(1, 0, fade)
music *= g

# =================== EFECTOS ===================
fx = buf()

def step(vel=1.0):
    t = tt(0.12)
    thump = np.sin(2 * np.pi * (140 * np.exp(-t * 25) + 60) * t) * env_exp(0.12, 38, 0.001)
    click = ma(np.diff(rng.uniform(-1, 1, len(t)), prepend=0), 4) * env_exp(0.12, 90, 0.0005)
    return (thump * 0.8 + click * 0.9) * vel

def plop(f0=380, f1=1100, dur=0.12):
    t = tt(dur)
    f = f0 + (f1 - f0) * (1 - np.exp(-t * 40))
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env_exp(dur, 30, 0.002)

def pop(f0=950, f1=420, dur=0.09):
    t = tt(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 45)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env_exp(dur, 35, 0.001) + 0.25 * ma(np.diff(rng.uniform(-1, 1, len(t)), prepend=0), 2) * env_exp(dur, 200, 0.0005)

def squeak(dur=0.32):
    t = tt(dur)
    f = 2100 - 900 * (t / dur) + 60 * np.sin(2 * np.pi * 38 * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sign(np.sin(ph)) * 0.3 + np.sin(ph) * 0.7
    e = np.minimum(1, t / 0.01) * np.minimum(1, (dur - t) / 0.06)
    return ma(s, 3) * e

def bell(f0=1320, dur=1.8, dec=2.6):
    t = tt(dur)
    parts = [(1, 1.0, 1), (2.0, 0.5, 1.6), (2.76, 0.4, 2.2), (5.4, 0.25, 3.5), (8.93, 0.12, 5)]
    s = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * dec * d) for r, a, d in parts)
    return s * np.minimum(1, t / 0.001)

def slide_whistle(dur=0.65):
    t = tt(dur)
    f = 420 * (2 ** (1.6 * (t / dur) ** 1.4)) * (1 + 0.025 * np.sin(2 * np.pi * 9 * t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    e = np.minimum(1, t / 0.03) * np.minimum(1, (dur - t) / 0.08)
    return (np.sin(ph) + 0.15 * np.sin(2 * ph)) * e

def boing(dur=0.4):
    t = tt(dur)
    f = 180 + 140 * np.sin(2 * np.pi * 7 * t) * np.exp(-t * 6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env_exp(dur, 7, 0.003)

def whoosh(dur=0.55):
    t = tt(dur)
    n = rng.uniform(-1, 1, len(t))
    low = ma(n, 40); mid = ma(n, 8) - ma(n, 40)
    x = t / dur
    shape = np.sin(np.pi * np.clip(x, 0, 1)) ** 2
    return (low * 3.0 * (1 - x) + mid * 1.6 * x) * shape

def ambience(dur):
    n = rng.uniform(-1, 1, int(dur * SR))
    b = np.cumsum(n); b -= ma(b, 3000)[:len(b)]
    b = ma(b, 30)[:len(b)]
    b /= (np.abs(b).max() + 1e-9)
    e = np.minimum(1, tt(dur) / 0.3) * np.minimum(1, (dur - tt(dur)) / 0.05)
    return b * e

def chirp_bird(dur=0.16):
    t = tt(dur)
    f = 3200 + 1400 * np.sin(np.pi * t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.sin(np.pi * t / dur) ** 2


def rain_noise(dur, amt=1.0):
    n = rng.uniform(-1, 1, int(dur * SR))
    hiss = n - ma(n, 6)
    drops = np.zeros(len(n))
    idx = rng.integers(0, len(n), int(dur * 90))
    drops[idx] = rng.uniform(0.3, 1.0, len(idx))
    drops = ma(drops, 30)
    e = np.minimum(1, tt(dur) / 0.4) * np.minimum(1, (dur - tt(dur)) / 0.3)
    return (hiss * 0.35 + drops * 2.5) * e * amt
def buzz(dur=0.22):
    t = tt(dur)
    s = np.sign(np.sin(2 * np.pi * 150 * t)) * 0.5 + np.sin(2 * np.pi * 300 * t) * 0.3
    return ma(s, 6) * np.minimum(1, t / 0.01) * np.minimum(1, (dur - t) / 0.02)
def tick(f=2600, dur=0.03):
    t = tt(dur)
    return np.sin(2 * np.pi * f * t) * env_exp(dur, 160, 0.0005)
def splash(vel=1.0):
    n = rng.uniform(-1, 1, int(0.16 * SR))
    return (n - ma(n, 10)) * env_exp(0.16, 26, 0.002) * vel
def sad_trombone(dur=1.5):
    out = np.zeros(int(dur * SR))
    notes = [(0.0, 0.32, 58), (0.34, 0.32, 57), (0.68, 0.32, 56), (1.02, 0.48, 55)]
    for t0, d, m in notes:
        t = tt(d); f = np.ones(len(t)) * NOTE(m) * (1 + (0.03 * np.sin(2 * np.pi * 6 * t) if d > 0.4 else 0) - (0.06 * t / d if d > 0.4 else 0))
        ph = 2 * np.pi * np.cumsum(f) / SR
        s = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph) + 0.15 * np.sin(4 * ph)
        e = np.minimum(1, t / 0.03) * np.minimum(1, (d - t) / 0.06)
        i = int(t0 * SR); out[i:i + len(s)] += ma(s, 4) * e
    return out
def tada():
    out = np.zeros(int(1.4 * SR))
    for k, m in enumerate([72, 76, 79, 84]):
        g_ = glock(m, 1.0); i = int(k * 0.07 * SR); out[i:i + len(g_)] += g_[:len(out) - i]
    return out

# lluvia: escenas 1-5 (apagada en el salón) y se para en la 6
add(fx, rain_noise(start[3]) , 0, 0.035)                          # tras la ventana
add(fx, rain_noise(T(6, 0.8) - start[3]), start[3], 0.03)          # cerca del cristal en el primer plano
add(fx, rain_noise(T(6, 0.8) - start[4]), start[4], 0.07)          # en la calle
# 1) «Sábado»
add(fx, pop(900, 420, 0.1), T(1, 0.3), 0.35)
# 2) vibración + plop de notificación + «!»
for k in range(4): add(fx, buzz(0.2), T(2, 0.2 + k * 0.27), 0.22)
add(fx, plop(), T(2, 0.5), 0.55)
add(fx, pop(1100, 500, 0.08), T(2, 1.05), 0.35)
# 3) brillos, reloj, texto, salto y aterrizaje
add(fx, whoosh(0.3), T(3, 0.0), 0.35)
add(fx, bell(2640, 1.0, 3.5), T(3, 0.2), 0.16)
add(fx, bell(3520, 0.8, 4.0), T(3, 0.36), 0.10)
add(fx, pop(), T(3, 0.12), 0.35); add(fx, pop(1200, 600, 0.07), T(3, 0.28), 0.3); add(fx, pop(800, 380, 0.1), T(3, 0.52), 0.35)
for k in range(6): add(fx, tick(2600 if k % 2 == 0 else 2000), T(3, 0.25 + k * 0.25), 0.25)
cut3 = sc[3].get('cut', 1.5)
add(fx, whoosh(0.25), T(3, cut3 - 0.05), 0.3)
add(fx, boing(), T(3, cut3 + 0.25), 0.45)
add(fx, step(1.4), T(3, cut3 + 0.85), 0.6)
# 4) carrera: pasos rápidos con salpicones, tic-tac urgente, whoosh
add(fx, whoosh(0.35), T(4, 0.0), 0.4)
k = 0
while k * 0.2 < sc[4]['duration']:
    add(fx, step(1.0), T(4, 0.05 + k * 0.2), 0.45); add(fx, splash(), T(4, 0.05 + k * 0.2), 0.10); k += 1
k = 0
while k * 0.25 < sc[4]['duration']:
    add(fx, tick(2800 if k % 2 == 0 else 2100), T(4, k * 0.25), 0.32); k += 1
add(fx, bell(1760, 1.2, 3.0), T(4, sc[4]['duration'] - 0.45), 0.22)   # 14:00
# 5) derrape con chirrido, frenazo, zoom al cartel
for k in range(2): add(fx, step(1.0), T(5, 0.05 + k * 0.2), 0.45)
add(fx, squeak(0.42), T(5, 0.42), 0.32)
add(fx, step(1.2), T(5, 0.84), 0.55)
add(fx, whoosh(0.25), T(5, 1.82), 0.35)
# 6) campanilla de la puerta, se cierra, sale el sol, giro del cartel
add(fx, bell(2093, 1.0, 4.0), T(6, 0.0), 0.2); add(fx, bell(2637, 0.9, 4.5), T(6, 0.08), 0.14)
add(fx, bell(2093, 0.8, 5.0), T(6, 0.78), 0.14)
add(fx, step(0.8), T(6, 0.86), 0.35)
for k in range(3): add(fx, step(0.7), T(6, 0.1 + k * 0.35), 0.3)
add(fx, tada(), T(6, 1.05), 0.35)
add(fx, pop(900, 420, 0.1), T(6, 1.3), 0.35)
add(fx, whoosh(0.35), T(6, 2.02), 0.35)
add(fx, pop(500, 200, 0.12), T(6, 2.42), 0.45)
# 7) pasos tranquilos de Lucía, parada en seco, trombón triste, entra Marta
k = 0
while k * 0.4 < 1.45:
    add(fx, step(0.7), T(7, 0.1 + k * 0.4), 0.38); k += 1
add(fx, step(1.1), T(7, 1.45), 0.5)
add(fx, pop(1100, 500, 0.08), T(7, 1.47), 0.3)
add(fx, sad_trombone(), T(7, 1.6), 0.18)
add(fx, whoosh(0.3), T(7, 2.0), 0.35)
# 8) brillo del pastel y «?»
add(fx, bell(2640, 1.0, 3.5), T(8, 0.55), 0.16)
add(fx, boing(), T(8, 3.15), 0.35)
# 9) dedo, nube de pensamiento, «!»
add(fx, bell(3136, 0.8, 4.0), T(9, 0.2), 0.15)
add(fx, plop(300, 900, 0.14), T(9, 0.55), 0.5)
add(fx, pop(1200, 500, 0.08), T(9, 3.0), 0.4)
add(fx, boing(0.3), T(9, 2.95), 0.25)
# 10) móvil, mensajes, Lucía saca su móvil
add(fx, whoosh(0.3), T(10, 0.08), 0.35)
add(fx, pop(900, 420, 0.1), T(10, 0.3), 0.3)
for i in range(3):
    add(fx, pop(), T(10, 0.6 + i * 0.4), 0.42); add(fx, pop(1300, 700, 0.06), T(10, 0.8 + i * 0.4), 0.25)
add(fx, bell(2640, 1.0, 3.5), T(10, 1.75), 0.15)
add(fx, bell(3520, 0.8, 4.0), T(10, 2.32), 0.10)
# 11) globo, letras, franja, botón, pájaros, tarjeta final
add(fx, plop(300, 900, 0.14), T(11, 0.15), 0.55)
for i in range(8): add(fx, pop(1400 + i * 60, 800, 0.05), T(11, 0.72 + i * 0.07), 0.18)
add(fx, whoosh(0.45), T(11, 1.58), 0.4)
add(fx, pop(800, 380, 0.1), T(11, 2.55), 0.4)
add(fx, pop(1000, 500, 0.08), T(11, 3.25), 0.3)
for tb in (0.6, 0.78, 1.9, 2.05, 3.0, 3.16):
    add(fx, chirp_bird(), T(11, tb), 0.05)
add(fx, whoosh(0.35), T(11, sc[11].get('cut', 5.0) - 0.15), 0.35)

# =================== NIVELES Y ESCRITURA ===================
def db(x): return 20 * np.log10(max(x, 1e-12))
def norm_peak(x, peak_db):
    p = np.abs(x).max()
    return x * (10 ** (peak_db / 20) / p) if p > 0 else x
# La música queda baja a propósito: es cama para la voz (≈ 15-20 dB por debajo).
music = norm_peak(music, -14.0)
fx = norm_peak(fx, -6.0)
mix = music + fx
pk = np.abs(mix).max()
if pk > 10 ** (-1 / 20): mix *= 10 ** (-1 / 20) / pk

def write(path, x):
    st = np.stack([x, x], axis=1)
    pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

out = os.path.join(ROOT, 'audio')
os.makedirs(out, exist_ok=True)
write(os.path.join(out, 'musica.wav'), music)
write(os.path.join(out, 'efectos.wav'), fx)
write(os.path.join(out, 'mezcla.wav'), mix)
print(f'duración {TOTAL:.3f} s · pico música {db(np.abs(music).max()):.1f} dBFS · pico efectos {db(np.abs(fx).max()):.1f} dBFS')
