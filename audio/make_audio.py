#!/usr/bin/env python3
"""Pista de sonido de «De puerta en puerta» (sin recodificar la imagen).

  python3 audio/make_audio.py

1) Voces: audio/voces/<voz>_<n>.(wav|mp3|m4a|ogg|flac), al inicio de su escena según timeline.txt:
   narradora_1 -> 1; narradora_2 -> 2; vendedor_1 y después narradora_3 -> 3; narradora_4 -> 4;
   narradora_5 -> 5; narradora_6 -> 6; narradora_7 -> 7; narradora_8 -> 8.
2) Efectos: audio/sfx/<nombre>.wav si existe (mismos nombres que los sintetizados); si no, se sintetizan
   (básicos) -> audio/efectos.wav
3) Música: audio/musica_1945.mp3 en las escenas 1-4 hasta el destello de la 4 y audio/musica_2026.mp3 desde el
   destello hasta el final (corte seco), ~17 dB por debajo de la voz. Si falta un archivo, esa parte va sin música.
4) Mezcla -> audio/mezcla.wav, voz colocada -> audio/voz.wav y vídeo final con -c:v copy -> de_puerta_en_puerta_con_audio.mp4
   Sin voces, la mezcla usa un nivel de voz de referencia (-18 dBFS RMS) para colocar efectos y música.
"""

import glob, json, math, os, subprocess, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, 'audio')
SR = 48000
cfg = json.load(open(os.path.join(ROOT, 'config.json')))
FPS = cfg['fps']
SC = {s['id']: s for s in cfg['scenes']}

# ---------- tiempos de escena (mismo cálculo que render.js / timeline.txt) ----------
starts, ends, fr = {}, {}, 0
for s in cfg['scenes']:
    n = round(s['duration'] * FPS)
    starts[s['id']] = fr / FPS
    ends[s['id']] = (fr + n) / FPS
    fr += n
TOTAL = fr / FPS
N = int(round(TOTAL * SR))
rng = np.random.default_rng(11)

# ---------- utilidades de síntesis ----------
def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def band(x, lo, hi):
    X = np.fft.rfft(x); fq = np.fft.rfftfreq(len(x), 1 / SR)
    X[(fq < lo) | (fq > hi)] = 0
    return np.fft.irfft(X, len(x))
def norm(x, peak=1.0):
    m = np.max(np.abs(x)) if len(x) else 0
    return x * (peak / m) if m > 0 else x
def edec(d, tau): t = tt(d); return np.exp(-t / tau)
def adsr(d, a=0.005, r=None):
    t = tt(d); e = np.minimum(1, t / max(a, 1e-4))
    if r: e *= np.clip((d - t) / r, 0, 1)
    return e
def sine(f, d, ph=0): return np.sin(2 * np.pi * f * tt(d) + ph)

def add(buf, x, t0, gain=1.0):
    i = int(round(t0 * SR))
    if i >= len(buf) or len(x) == 0: return
    if i < 0: x = x[-i:]; i = 0
    j = min(len(buf), i + len(x)); buf[i:j] += gain * x[:j - i]

def bell_church(f0=330, d=3.0):
    t = tt(d); x = 0
    for p, a, tau in [(0.5, .5, 2.5), (1, 1, 1.8), (1.19, .5, 1.2), (1.5, .4, 1.0), (2.0, .35, .8), (2.74, .2, .5)]:
        x = x + a * np.sin(2 * np.pi * f0 * p * t) * np.exp(-t / tau)
    return band(norm(x), 80, 2500)
def tick(hi=True):
    x = band(noise(0.03), 2500, 5500) if hi else band(noise(0.035), 900, 2200)
    return norm(x * edec(0.03 if hi else 0.035, 0.006))
def sigh():
    d = 1.1; t = tt(d); e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.6
    x = band(noise(d), 300, 1700) * e
    x += 0.35 * band(noise(d), 1800, 3200) * e * np.exp(-t / 0.4)
    return norm(x)
def ding(f=1318, d=1.1):
    t = tt(d); x = np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t / 0.2) + .2 * np.sin(2 * np.pi * f * 3.0 * t) * np.exp(-t / 0.1)
    return norm(x * np.exp(-t / 0.35) * adsr(d, 0.002))
def key_click():
    d = 0.018; x = band(noise(d), 1800, 7000) * edec(d, 0.004)
    x += 0.5 * sine(rng.uniform(600, 900), d) * edec(d, 0.003)
    return norm(x)
def typing(d, rate=14):
    out = np.zeros(int(d * SR)); t = 0.0
    while t < d - 0.03:
        add(out, key_click(), t, rng.uniform(0.6, 1.0)); t += rng.uniform(0.6, 1.4) / rate
    return out
def pop(f0=500, f1=1300, d=0.09):
    t = tt(d); ph = 2 * np.pi * np.cumsum(np.linspace(f0, f1, len(t))) / SR
    x = np.sin(ph) * np.exp(-t / 0.025) + 0.4 * band(noise(d), 1000, 4000) * np.exp(-t / 0.005)
    return norm(x)
def notif(f):
    a = sine(f, 0.12) * edec(0.12, 0.06); b = sine(f * 1.5, 0.22) * edec(0.22, 0.09)
    return norm(np.concatenate([a, b]) * 1.0)
def buzz(d=0.5):
    t = tt(d); x = np.sign(np.sin(2 * np.pi * 150 * t)) * (np.sin(2 * np.pi * 12 * t) > 0)
    return norm(band(x, 80, 600) * adsr(d, 0.01, 0.05))
def step(soft=1.0):
    d = 0.09; t = tt(d)
    x = np.sin(2 * np.pi * rng.uniform(80, 110) * t) * np.exp(-t / 0.025) + 0.5 * band(noise(d), 200, 1800) * np.exp(-t / 0.012)
    return norm(x) * soft
def murmur(d):
    t = tt(d); x = np.zeros(len(t))
    for k in range(7):
        am = 0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(3, 5.5) * t + rng.uniform(0, 6)) * (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(.3, .8) * t + k))
        c = rng.uniform(350, 900); x += band(noise(d), c * 0.7, c * 1.6) * am
    return norm(x)
def shop_bell():
    d = 0.9; out = np.zeros(int(d * SR))
    for i, t0 in enumerate([0, 0.09, 0.2]):
        t = tt(d - t0); x = 0
        for f, a in [(2093, 1), (2637, .6), (3520, .4), (5274, .2)]:
            x = x + a * np.sin(2 * np.pi * f * rng.uniform(.995, 1.005) * t)
        add(out, x * np.exp(-t / 0.25), t0, 1 - 0.25 * i)
    return norm(out)
def cha_ching():
    out = np.zeros(int(0.9 * SR))
    add(out, band(noise(0.06), 400, 3000) * edec(0.06, 0.02), 0, 0.7)
    add(out, band(noise(0.05), 600, 4000) * edec(0.05, 0.015), 0.07, 0.6)
    t = tt(0.7); x = 0
    for f, a in [(2489, 1), (3136, .8), (3951, .6), (5920, .3)]:
        x = x + a * np.sin(2 * np.pi * f * t)
    add(out, x * np.exp(-t / 0.18), 0.14, 0.9)
    return norm(out)
def paper(d=0.28):
    t = tt(d); am = (rng.random(len(t)) > 0.996).astype(float)
    am = np.convolve(am, np.exp(-np.arange(400) / 80), 'same')
    return norm(band(noise(d), 1500, 7000) * (0.25 + am) * adsr(d, 0.01, 0.05))
def skid(d=0.45):
    t = tt(d); f = np.linspace(1900, 1250, len(t)) * (1 + 0.02 * np.sin(2 * np.pi * 28 * t))
    x = 0.6 * np.sin(2 * np.pi * np.cumsum(f) / SR) + band(noise(d), 1000, 4000)
    return norm(x * adsr(d, 0.02, 0.12))
def clac():
    out = np.zeros(int(0.2 * SR))
    for t0, f in [(0, 750), (0.05, 520)]:
        t = tt(0.07); add(out, np.sin(2 * np.pi * f * t) * np.exp(-t / 0.012) + 0.6 * band(noise(0.07), 1500, 5000) * np.exp(-t / 0.004), t0)
    return norm(out)
def coin_clink():
    d = 0.25; t = tt(d); x = 0
    for k in range(3): x = x + np.sin(2 * np.pi * rng.uniform(3000, 7500) * t) * rng.uniform(.4, 1)
    return norm(x * np.exp(-t / rng.uniform(0.04, 0.09)))
def popper():
    out = np.zeros(int(0.6 * SR))
    add(out, band(noise(0.05), 100, 2500) * edec(0.05, 0.012), 0)
    add(out, paper(0.5), 0.03, 0.35)
    return norm(out)
def brass(freqs, d, vib=0.0):
    t = tt(d); x = 0
    for f in freqs:
        fv = f * (1 + vib * np.sin(2 * np.pi * 5.5 * t) * np.clip(t / 0.25, 0, 1))
        ph = 2 * np.pi * np.cumsum(fv) / SR
        for h in range(1, 9): x = x + np.sin(h * ph) / h ** 1.3
    return x
def tachan():
    out = np.zeros(int(1.3 * SR))
    ta = brass([392, 523, 659], 0.13) * adsr(0.13, 0.01, 0.04)
    chan = brass([523, 659, 784, 1047], 1.0, 0.006) * adsr(1.0, 0.02, 0.5)
    add(out, norm(ta), 0, 0.8); add(out, norm(chan), 0.17, 1.0)
    return norm(band(out, 100, 6000))
def whoosh(d=0.6):
    t = tt(d); x = noise(d); out = np.zeros(len(t))
    seg = int(0.03 * SR)
    for i in range(0, len(t), seg):   # banda que sube
        u = i / len(t); c = 300 * (10 ** (u * 1.1))
        out[i:i + seg] = band(x[i:i + seg * 2], c * .6, c * 1.8)[:len(out[i:i + seg])]
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return norm(out * e)
def chirp():
    d = 0.12; t = tt(d); f = np.linspace(3400, 4600, len(t))
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d))
def street(d):
    b = np.cumsum(noise(d)); b -= np.convolve(b, np.ones(4800) / 4800, 'same')
    x = norm(band(b, 40, 600)) * 0.5 + 0.08 * norm(band(noise(d), 800, 3000))
    return norm(x)

def rustle(d=0.35):
    t = tt(d); x = band(noise(d), 400, 3500) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * rng.uniform(9, 14) * t)))
    return norm(x * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5)
def tap(f):
    d = 0.09; t = tt(d)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.03) + 0.35 * band(noise(d), 2000, 6000) * np.exp(-t / 0.004)
    return norm(x)
def ting():
    d = 1.6; t = tt(d); x = 0
    for f, a, tau in [(2093, 1, .6), (3136, .6, .45), (4186, .45, .35), (6272, .2, .2)]:
        x = x + a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau)
    return norm(x * adsr(d, 0.002))
def birdsong(d):
    out = np.zeros(int(d * SR)); t = 0.2
    while t < d - 0.3:
        for k in range(rng.integers(2, 5)): add(out, chirp() * 0.8, t + k * 0.13, rng.uniform(.5, 1))
        t += rng.uniform(0.7, 1.4)
    return out

def door_close():
    out = np.zeros(int(0.8 * SR))
    add(out, rustle(0.25) * 0.3, 0)                                   # roce de la hoja
    t = tt(0.5); thud = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-t / 0.02)) / SR) * np.exp(-t / 0.08)
    add(out, norm(thud) + 0.5 * band(noise(0.5), 300, 2500) * np.exp(-t / 0.02), 0.2)
    add(out, clac() * 0.4, 0.24)                                       # pestillo
    return norm(out)
def car_pass(d=2.5):
    t = tt(d); e = np.exp(-((t - d / 2) / (d / 4)) ** 2)
    return norm(band(noise(d), 80, 900) * e)
def vibes(d=1.25):
    out = np.zeros(int(d * SR)); t0 = 0
    while t0 < d - 0.3: add(out, buzz(0.28), t0); t0 += 0.42
    return out
def twinkle():
    out = np.zeros(int(0.5 * SR))
    for k, f in enumerate([2637, 3136, 3951]):
        t = tt(0.3); add(out, np.sin(2 * np.pi * f * t) * np.exp(-t / 0.07), k * 0.05, 1 - 0.2 * k)
    return norm(out)
def ha(f0, d=0.14):
    t = tt(d); ph = 2 * np.pi * np.cumsum(f0 * (1 + 0.08 * np.sin(np.pi * t / d))) / SR
    saw = 2 * ((ph / (2 * np.pi)) % 1) - 1
    v = band(saw, 500, 1400) + 0.5 * band(saw, 1800, 2800) + 0.3 * band(noise(d), 600, 3000)
    return v * np.sin(np.pi * t / d) ** 1.5
def laugh(f0=200, n=5):
    out = np.zeros(int((n * 0.19 + 0.3) * SR))
    for k in range(n): add(out, ha(f0 * (1 - 0.03 * k)), k * 0.19, 1 - 0.1 * k)
    return norm(out)
def glass_clink():
    d = 1.0; t = tt(d); x = 0
    for f, a, tau in [(3520, 1, .35), (4410, .7, .25), (5280, .5, .18), (2960, .5, .4), (6900, .25, .1)]:
        x = x + a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau)
    x += 0.5 * band(noise(d), 3000, 9000) * np.exp(-t / 0.004)
    return norm(x)
def bar_ambience(d):
    x = murmur(d) * 0.8
    out = np.zeros(int(d * SR)); t0 = 0.3
    while t0 < d - 0.3:                                                # vajilla de fondo
        add(out, coin_clink(), t0, rng.uniform(0.05, 0.12)); t0 += rng.uniform(0.5, 1.2)
    return norm(x + out)

# ---------- efectos por escena (nombre -> se puede sustituir con audio/sfx/<nombre>.wav) ----------
SFX_DIR = os.path.join(A, 'sfx')
def S(name, synth):
    p = os.path.join(SFX_DIR, name + '.wav')
    if os.path.exists(p): return norm(read_any(p))
    return synth()

def tictac(d):
    out = np.zeros(int(d * SR)); k = 0; t = 0.1
    while t < d - 0.05:
        add(out, tick(k % 2 == 0), t, 0.9 if k % 2 == 0 else 0.7); t += 0.5; k += 1
    return out
def finger_taps(d, rate=6.7):
    out = np.zeros(int(d * SR)); t = 0.05; k = 0
    while t < d - 0.08:
        add(out, tap([260, 230, 205][k % 3]), t, 0.7 + 0.3 * (k % 3 == 2)); t += 1 / rate; k += 1
    return out
def many_dings(n=10):
    out = np.zeros(int(1.6 * SR))
    for k in range(n):
        f = [1319, 1175, 1568, 1397, 1047, 1760][k % 6] * rng.uniform(0.98, 1.02)
        add(out, notif(f), rng.uniform(0, 0.35), rng.uniform(0.5, 1.0))
    return norm(out)

def room_tone(d):
    b = np.cumsum(noise(d)); b -= np.convolve(b, np.ones(4800) / 4800, 'same')
    return norm(norm(band(b, 40, 400)) * 0.6 + 0.05 * norm(band(noise(d), 600, 2000)))
def sting():
    """golpe cómico de sorpresa: acorde disonante de metales + caída"""
    out = np.zeros(int(1.4 * SR))
    hit = brass([233, 277, 330, 466], 0.9, 0.012) * adsr(0.9, 0.005, 0.5)
    add(out, norm(hit), 0, 1.0)
    t = tt(0.9); f = 900 * np.exp(-t / 0.35) + 180
    add(out, norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5)), 0.15, 0.5)
    add(out, norm(band(noise(0.08), 60, 400) * edec(0.08, 0.02)), 0, 0.8)
    return norm(band(out, 60, 7000))
def snap():
    d = 0.06; x = band(noise(d), 1200, 6500) * edec(d, 0.006)
    x += 0.4 * sine(2400, d) * edec(d, 0.004)
    return norm(x)
def slide(f0, f1, d):
    t = tt(d); f = f0 * (f1 / f0) ** (t / d)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * adsr(d, 0.02, 0.08))
def fiuuu(d=2.4):
    """scroll rapidísimo que frena: soplido que baja + silbido descendente"""
    t = tt(d); out = whoosh(d) * 0.8
    out = out + 0.35 * slide(1800, 300, d) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.5
    return norm(out)
def boom():
    d = 0.9; t = tt(d); f = 40 + 110 * np.exp(-t / 0.06)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.25) + 0.6 * band(noise(d), 100, 3000) * np.exp(-t / 0.03)
    return norm(x)
def run_steps(d, period=0.4):
    out = np.zeros(int(d * SR)); t = 0.02
    while t < d - 0.1: add(out, step(1.0), t, rng.uniform(0.75, 1.0)); t += period / 2
    return out
def trip():
    out = np.zeros(int(1.0 * SR))
    add(out, step(1.0), 0, 1.0); add(out, step(1.0), 0.07, 0.8)
    add(out, slide(700, 1500, 0.18), 0.05, 0.4)      # «uy» de silbato
    add(out, slide(1500, 500, 0.3), 0.23, 0.35)
    add(out, clac(), 0.02, 0.4)
    return norm(out)
def gift_paper(d=0.45):
    out = paper(d)
    for k in range(5): add(out, band(noise(0.02), 2000, 8000) * edec(0.02, 0.004), rng.uniform(0, d - 0.05), rng.uniform(0.6, 1.2))
    return norm(out)
def hey():
    """«¡hey!» de la cuadrilla: varias voces sintéticas (formantes de «e»)"""
    out = np.zeros(int(0.7 * SR))
    for k in range(6):
        f0 = rng.uniform(140, 300); d = 0.32; t = tt(d)
        ph = 2 * np.pi * np.cumsum(f0 * (1 + 0.12 * (t / d))) / SR
        saw = 2 * ((ph / (2 * np.pi)) % 1) - 1
        v = band(saw, 400, 650) + 0.8 * band(saw, 1800, 2400) + 0.25 * band(noise(d), 2500, 5000) * np.exp(-t / 0.04)
        add(out, norm(v * adsr(d, 0.02, 0.15)), rng.uniform(0, 0.06), rng.uniform(0.6, 1.0))
    return norm(out)
def bright_ding():
    out = np.zeros(int(1.4 * SR))
    add(out, ding(1760, 1.3), 0, 1.0); add(out, twinkle(), 0.06, 0.5)
    return norm(out)

def snore(d):
    """ronquido suave: inspiración ronca (ruido grave modulado) + espiración silbada, ciclo de 1,6 s"""
    out = np.zeros(int(d * SR)); t0 = 0.05
    while t0 < d - 0.4:
        di = min(0.75, d - t0); t = tt(di); e = np.sin(np.pi * np.clip(t / di, 0, 1)) ** 1.5
        rasp = band(noise(di), 70, 500) * (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 32 * t)))
        add(out, norm(rasp * e), t0, 1.0)
        de = min(0.6, d - t0 - 0.8)
        if de > 0.1:
            t = tt(de); add(out, norm(band(noise(de), 900, 2600) * np.sin(np.pi * t / de) ** 2), t0 + 0.8, 0.35)
        t0 += 1.6
    return norm(out)
def fast_tictac(d, rate=8.0):
    out = np.zeros(int(d * SR)); k = 0; t = 0.0
    while t < d - 0.05:
        add(out, tick(k % 2 == 0), t, 1.0 if k % 2 == 0 else 0.75); t += 1 / rate; k += 1
    return out
def calendar_frrr(n=16, dt=0.11):
    """«frrr» de las hojas: un tirón de papel por hoja"""
    out = np.zeros(int((n * dt + 0.5) * SR))
    for k in range(n): add(out, paper(0.16), k * dt, rng.uniform(0.6, 1.0))
    return norm(out)
def calm_steps(d, period=0.8):
    out = np.zeros(int(d * SR)); t = 0.05
    while t < d - 0.1: add(out, step(1.0), t, rng.uniform(0.55, 0.75)); t += period / 2
    return out
def comic_sigh():
    """suspiro cómico: soplido + «mmm» que baja"""
    out = np.zeros(int(1.3 * SR))
    add(out, sigh(), 0, 1.0)
    add(out, slide(420, 260, 0.7) * 0.35, 0.25)
    return norm(out)
def queue_murmur(d):
    t = tt(d); return norm(murmur(d) * np.clip(t / 1.2, 0, 1))
def buzz_x():
    return norm(buzz(0.45))


# ---------- efectos nuevos (1945 y moderno) ----------
def crackle(d):
    """crepitar de disco antiguo: siseo suave + chasquidos dispersos"""
    n = int(d * SR); x = 0.12 * band(noise(d), 1500, 7000)
    clicks = (rng.random(n) > 0.9993).astype(float) * rng.uniform(0.3, 1.0, n)
    clicks = np.convolve(clicks, np.exp(-np.arange(120) / 18), 'same')
    pops_ = (rng.random(n) > 0.99996).astype(float)
    pops_ = np.convolve(pops_, np.exp(-np.arange(900) / 200), 'same')
    x += band(clicks * rng.choice([-1, 1], n), 800, 9000) + 0.6 * band(pops_, 60, 900)
    return norm(x)
def projector(d):
    """proyector: traqueteo del obturador (~18 Hz) + zumbido del motor"""
    t = tt(d); clat = (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 18 * t))) * (0.6 + 0.4 * np.sin(2 * np.pi * 36 * t) ** 2)
    x = band(noise(d), 400, 3000) * clat * 0.7 + 0.35 * np.sin(2 * np.pi * 60 * t) + 0.15 * np.sin(2 * np.pi * 120 * t)
    return norm(band(x, 50, 5000))
def cobble_step():
    d = 0.11; t = tt(d)
    x = np.sin(2 * np.pi * rng.uniform(70, 95) * t) * np.exp(-t / 0.02) + 0.9 * band(noise(d), 600, 3500) * np.exp(-t / 0.008)
    x += 0.3 * band(noise(d), 2500, 6000) * np.exp(-t / 0.003)
    return norm(x)
def screw_jingle():
    out = np.zeros(int(0.3 * SR))
    for k in range(4):
        d = 0.12; t = tt(d); f = rng.uniform(2600, 5200)
        add(out, np.sin(2 * np.pi * f * t) * np.exp(-t / 0.03), rng.uniform(0, 0.08), rng.uniform(0.4, 1))
    return norm(out)
def walk_cobbles(d, period=0.8):
    out = np.zeros(int(d * SR)); t = 0.05
    while t < d - 0.1:
        add(out, cobble_step(), t, rng.uniform(0.8, 1.0)); add(out, screw_jingle(), t + 0.02, 0.35); t += period / 2
    return out
def knock():
    d = 0.16; t = tt(d); f = 160 + 120 * np.exp(-t / 0.01)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.035) + 0.6 * band(noise(d), 300, 1800) * np.exp(-t / 0.012)
    return norm(x)
def old_bell():
    """campanilla antigua de la puerta: más grave y con algo de óxido"""
    d = 1.0; out = np.zeros(int(d * SR))
    for i, t0 in enumerate([0, 0.11, 0.24]):
        t = tt(d - t0); x = 0
        for fq, a in [(1397, 1), (1760, .55), (2489, .35), (3729, .15)]:
            x = x + a * np.sin(2 * np.pi * fq * rng.uniform(.99, 1.01) * t)
        add(out, x * np.exp(-t / 0.3), t0, 1 - 0.25 * i)
    return norm(band(out, 300, 4500))
def accel_tictac(d, r0=3.0, r1=16.0):
    out = np.zeros(int(d * SR)); k = 0; t = 0.0
    while t < d - 0.03:
        add(out, tick(k % 2 == 0), t, 1.0 if k % 2 == 0 else 0.75)
        t += 1 / lerp_(r0, r1, (t / d) ** 1.5); k += 1
    return out
def lerp_(a, b, u): return a + (b - a) * u
def flash_shine():
    """destello brillante: barrido agudo ascendente + campanitas"""
    out = np.zeros(int(1.6 * SR))
    add(out, slide(1200, 5200, 0.35) * 0.6, 0)
    add(out, ding(2093, 1.4), 0.25, 0.8); add(out, twinkle(), 0.3, 0.6); add(out, twinkle(), 0.45, 0.4)
    add(out, band(noise(0.5), 4000, 12000) * np.exp(-tt(0.5) / 0.15), 0.25, 0.25)
    return norm(out)
def plop():
    d = 0.12; t = tt(d); f = 260 + 520 * np.exp(-t / 0.02)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.04))

def build_sfx():
    fx = np.zeros(N)
    def T(sc, t): return starts[sc] + t
    def D(sc): return ends[sc] - starts[sc]
    FL = SC[4].get('flash', 1.8)
    old_end = T(4, FL)
    # 1-4) crepitar de disco y proyector durante toda la parte antigua (corte seco en el destello)
    od = old_end - starts[1]
    add(fx, S('crepitar_disco', lambda: crackle(od)), starts[1], 0.35)
    add(fx, S('proyector', lambda: projector(od)) * adsr(od, 0.2, 0.01), starts[1], 0.18)
    # 1) golpe sordo al entrar «1945»
    add(fx, S('golpe', boom), T(1, 0.3), 0.35)
    # 2) pasos sobre adoquín con tintineo de tornillos (ciclo 0,8 s, anda hasta 3,3 s) y brillo del tornillo
    add(fx, S('pasos_adoquin', lambda: walk_cobbles(3.3)), T(2, 0.0), 0.5)
    add(fx, S('tintineo_tornillos', screw_jingle), T(2, 3.35), 0.5)
    add(fx, S('brillo', twinkle), T(2, 3.7), 0.3)
    # 3) tres puertas: toc, toc; campanilla antigua al abrir; monedas; (cada puerta dura 1/3 de la escena)
    d3 = D(3) / 3
    for k in range(3):
        u0 = T(3, k * d3)
        for tk in (0.05, 0.25): add(fx, S('toc', knock), u0 + tk, 0.8)
        add(fx, S('campanilla_antigua', old_bell), u0 + 0.4, 0.4)
        add(fx, S('tintineo_tornillos', screw_jingle), u0 + 0.6, 0.35)
        for c in range(3): add(fx, S('moneda', coin_clink), u0 + 1.2 + c * 0.05, 0.4)
    # 4) tictac que se acelera, «whoosh» hacia el destello, destello brillante y golpe en «2026»
    add(fx, S('tictac_acelerado', lambda: accel_tictac(FL)), T(4, 0.0), 0.5)
    add(fx, S('whoosh', lambda: whoosh(0.7)), T(4, FL - 0.6), 0.6)
    add(fx, S('destello', flash_shine), T(4, FL - 0.02), 0.7)
    add(fx, S('pop', pop), T(4, 2.1), 0.6)
    # 5) «pop» del 2026 y del móvil, «ding» cuando aparecen las píldoras
    amb5 = S('ambiente_calle', lambda: street(D(5)))
    add(fx, amb5 * adsr(D(5), 0.01, 0.05), starts[5], 0.15)
    add(fx, S('pop', pop), T(5, 0.1), 0.5); add(fx, S('pop', pop), T(5, 0.7), 0.5)
    add(fx, S('ding', ding), T(5, 1.1), 0.45)
    # 6) tecleo, un «plop» por tarjeta, «pop» al pulsar «Publicar» y «ding» del tic
    add(fx, S('ambiente_tienda', lambda: room_tone(D(6))), starts[6], 0.08)
    add(fx, S('tecleo', lambda: typing(0.45)), T(6, 1.0), 0.3)
    for t0 in (1.45, 1.95, 2.45): add(fx, S('plop', plop), T(6, t0), 0.6)
    add(fx, S('pop', pop), T(6, 3.75), 0.6)
    add(fx, S('ding', ding), T(6, 3.82), 0.55)
    # 7) murmullo de calle y muchas notificaciones a la vez (0,7 s)
    add(fx, S('murmullo_calle', lambda: murmur(D(7))) * adsr(D(7), 0.02, 0.1), starts[7], 0.25)
    add(fx, S('ambiente_calle', lambda: street(D(7))) * adsr(D(7), 0.02, 0.05), starts[7], 0.12)
    add(fx, S('vibracion', lambda: vibes(0.6)), T(7, 0.7), 0.3)
    add(fx, S('notificaciones', lambda: many_dings(12)), T(7, 0.7), 0.6)
    # 8) «whoosh» al entrar el texto, «pop» de la franja roja, «whoosh» de la tarjeta final
    c8 = SC[8].get('cut', 6.0)
    add(fx, S('pajaros', lambda: birdsong(c8)), starts[8], 0.05)
    add(fx, S('whoosh', lambda: whoosh(0.5)), T(8, 0.0), 0.45)
    add(fx, S('pop', pop), T(8, 0.75), 0.55)
    add(fx, S('whoosh', lambda: whoosh(0.6)), T(8, c8 - 0.45), 0.5)
    return fx

def read_any(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
def write_wav(path, x):
    y = np.clip(x, -1, 1)
    st = np.repeat((y * 32767).astype(np.int16)[:, None], 2, axis=1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
def rms_db_lin(x): return float(np.sqrt(np.mean(x ** 2))) * 3
def rms_db(x): return 20 * math.log10(max(1e-9, float(np.sqrt(np.mean(x ** 2))))) if len(x) else -180


VOICES = [('narradora_1', 1), ('narradora_2', 2), ('vendedor_1', 3), ('narradora_3', 3), ('narradora_4', 4),
          ('narradora_5', 5), ('narradora_6', 6), ('narradora_7', 7), ('narradora_8', 8)]
LEAD, GAP = 0.12, 0.08
def find_voice(stem):
    for ext in ('wav', 'mp3', 'm4a', 'ogg', 'flac', 'aac'):
        for p in glob.glob(os.path.join(A, 'voces', f'{stem}.{ext}')) + glob.glob(os.path.join(A, 'voces', f'{stem}_*.{ext}')):
            return p
    return None
def music_part(path, t0, t1):
    """música de un archivo entre t0 y t1 (se repite si es corta); fundido de entrada corto, salida en seco"""
    m = read_any(path); n0, n1 = int(round(t0 * SR)), int(round(t1 * SR)); n = n1 - n0
    m = np.tile(m, int(np.ceil(n / len(m))))[:n]
    m[:int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))
    out = np.zeros(N); out[n0:n1] = m
    return out

def main():
    fx = build_sfx()
    write_wav(os.path.join(A, 'efectos.wav'), norm(fx, 0.9))
    print('efectos ' + ('de audio/sfx/ + ' if os.path.isdir(SFX_DIR) else '') + 'sintetizados (básicos) -> audio/efectos.wav')

    vo = np.zeros(N); missing = []; last_end = -1.0
    for stem, sc in VOICES:
        p = find_voice(stem)
        if not p: missing.append(stem); continue
        x = read_any(p)
        nz = np.where(np.abs(x) > 0.01)[0]
        if len(nz): x = x[max(0, nz[0] - 240): nz[-1] + 2400]
        t0 = max(starts[sc] + LEAD, last_end + GAP)
        add(vo, x, t0); t1 = t0 + len(x) / SR; last_end = t1
        print(f'  {stem:12s} escena {sc}: {t0:6.2f} -> {t1:6.2f} s' + ('   ¡se pasa del final de la escena (%.2f s)!' % ends[sc] if t1 > ends[sc] else ''))
    write_wav(os.path.join(A, 'voz.wav'), vo)

    flash = starts[4] + SC[4].get('flash', 1.8)
    parts = []
    for name, a, b in [('musica_1945.mp3', 0.0, flash), ('musica_2026.mp3', flash, TOTAL)]:
        p = os.path.join(A, name)
        if os.path.exists(p):
            parts.append(music_part(p, a, b)); print(f'música: audio/{name} de {a:.2f} a {b:.2f} s')
        else: print(f'música: falta audio/{name} -> sin música de {a:.2f} a {b:.2f} s')
    music = None
    if parts:
        # nivela cada parte por separado para que las dos queden al mismo nivel
        music = np.zeros(N)
        for m in parts:
            r = rms_db(m[np.abs(m) > 1e-4]); music += m * 10 ** ((-20 - r) / 20)
        fade = np.ones(N); nf = int(1.0 * SR); fade[-nf:] = np.linspace(1, 0, nf); music *= fade

    have_voice = np.any(vo != 0)
    v_db = rms_db(vo[np.abs(vo) > 0.02]) if have_voice else -18.0
    mix = vo.copy()
    mix += fx * 10 ** ((v_db - 12 - rms_db(fx[np.abs(fx) > 1e-4])) / 20)          # efectos ~12 dB bajo la voz
    if music is not None:
        mg = 10 ** ((v_db - 17 - rms_db(music[np.abs(music) > 1e-4])) / 20)       # música ~17 dB bajo la voz
        env = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(int(0.3 * SR)) / int(0.3 * SR), 'same')
        mix += music * mg * (1 - 0.3 * np.clip(env * 3, 0, 1))
        print(f'música {v_db - rms_db((music * mg)[np.abs(music) > 1e-4]):.1f} dB por debajo de la voz' + ('' if have_voice else ' de referencia (-18 dBFS)'))
    peak = np.max(np.abs(mix))
    if peak > 0.89: mix *= 0.89 / peak
    mix_path = os.path.join(A, 'mezcla.wav'); write_wav(mix_path, mix)
    video = os.path.join(ROOT, cfg['output'])
    out = os.path.join(ROOT, cfg['output'].replace('.mp4', '_con_audio.mp4'))
    tmp = out.replace('.mp4', '.partial.mp4')
    af = ['-af', 'loudnorm=I=-14:TP=-1:LRA=11,aresample=48000'] if have_voice else []
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', video, '-i', mix_path, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy'] + af +
                   ['-c:a', 'aac', '-b:a', '192k', '-t', f'{TOTAL:.3f}', '-movflags', '+faststart', tmp], check=True)
    os.replace(tmp, out)
    print('->', os.path.relpath(out, ROOT))
    if missing:
        print('FALTAN VOCES en audio/voces/:', ', '.join(missing), '(cuando estén, vuelve a ejecutar el script)')

if __name__ == '__main__':
    main()
