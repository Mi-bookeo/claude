#!/usr/bin/env python3
"""Pista de sonido del vídeo 17 «Próxima apertura» y vídeo con audio (la imagen NO se vuelve a codificar: -c:v copy).
   1) Voces de María según config17.json ('voices', las escribe v17_colocar_voces.py), igualadas a -20 dBFS RMS.
   2) Efectos: audio/sfx/<nombre>.wav|.mp3 si existe; si no, se sintetizan con código (básicos).
   3) Música: audio/musica.mp3 (v17_music.py), unos 17 dB por debajo de las voces y 5 dB menos mientras hay voz.
   Uso: python3 audio/v17_audio.py   (TikTok: CONFIG=config17.tiktok.json python3 audio/v17_audio.py)
   Salida: audio/mezcla17.wav y video17_con_audio.mp4 (AAC 192 kb/s)."""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
cfg = json.load(open(os.path.join(ROOT, os.environ.get('CONFIG', 'config17.json'))))
FPS = cfg['fps']
SC, fr = [], 0
for s in cfg['scenes']:
    n = round(s['duration'] * FPS); SC.append(dict(s, start=fr / FPS, end=(fr + n) / FPS)); fr += n
TOTAL = fr / FPS
N = int(round(TOTAL * SR))
rng = np.random.default_rng(17)
st = lambda i: SC[i - 1]['start']
shot = lambda i, k: SC[i - 1]['start'] + SC[i - 1]['shots'][k][0]
cue = lambda i, k, d=0: SC[i - 1].get('cues', {}).get(k, d)
at = lambda i, k, d=0: st(i) + cue(i, k, d)

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<f4').astype(np.float64)
def db(x): return 20 * np.log10(max(x, 1e-9))
def rms_active(x):
    fr_ = x[: len(x) // 480 * 480].reshape(-1, 480); r = np.sqrt((fr_ ** 2).mean(1))
    act = r[r > r.max() * 0.1] if r.max() > 0 else r
    return np.sqrt((act ** 2).mean()) if len(act) else 0

# ---------------- voces ----------------
voice = np.zeros(N); missing = []
for i, sc in enumerate(SC, 1):
    for vo in sc.get('voices', []):
        f = os.path.join(ROOT, vo['file'])
        if not os.path.exists(f): missing.append(vo['file']); continue
        v = load(f); v *= 10 ** (-20 / 20) / max(rms_active(v), 1e-6)
        d = len(v) / SR; t0 = st(i) + vo['start']
        print(f'escena {i:2d}: {os.path.basename(f):15s} {d:5.2f} s  {t0:6.2f} → {t0 + d:6.2f} s' + ('  <-- MÁS LARGA QUE LA ESCENA' if vo['start'] + d > sc['duration'] else ''))
        a_ = int(t0 * SR); voice[a_:a_ + len(v)] += v[: N - a_]
if missing: print('AVISO: faltan voces (quedan en silencio):', ', '.join(missing))

# ---------------- efectos ----------------
def t_(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def lp(x, a):  # paso bajo de un polo
    y = np.empty_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y
def hp(x, a): return x - lp(x, a)
def fade(s, a=0.3, b=0.4):
    t = np.arange(len(s)) / SR; d = len(s) / SR
    return s * np.minimum(1, t / a) * np.minimum(1, (d - t) / b)
def murmur(d, speed=2.3, voices=6):
    """murmullo de bar: varias «voces» (ruido filtrado en la banda de la voz con sílabas lentas)"""
    t = t_(d); base = lp(noise(d), 0.06) * 1.6; s = np.zeros(len(t))
    band = hp(lp(noise(d), 0.12), 0.02)
    for k in range(voices):
        ph = rng.uniform(0, 6.28); f1 = speed * rng.uniform(0.7, 1.4)
        env = np.clip(np.sin(2 * np.pi * f1 * t + ph), 0, 1) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * t + ph))
        s += np.roll(band, int(rng.uniform(0, len(t)))) * env
    return fade(base + s * 1.3)

SYN = {}
SYN_FILE = set()
def syn(name):
    if name in SYN: return SYN[name]
    for ext in ('.wav', '.mp3'):
        p = A('sfx', name + ext)
        if os.path.exists(p): SYN[name] = load(p); SYN_FILE.add(name); return SYN[name]
    if name == 'pop':
        t = t_(0.12); f = 300 + 900 * np.exp(-t * 40); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35)
    elif name == 'pop_s':
        t = t_(0.09); f = 500 + 900 * np.exp(-t * 50); s = 0.6 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45)
    elif name == 'ding':
        t = t_(1.3); s = sum(g * np.sin(2 * np.pi * 1568 * h * t) * np.exp(-t * dcy) for h, g, dcy in ((1, 1, 3.5), (2.76, 0.4, 7), (5.4, 0.2, 12)))
    elif name == 'ding2':  # notificación (otra altura)
        t = t_(0.9); s = sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * 6) * (t >= o) for fq, o in ((1318, 0), (1976, 0.09)))
    elif name == 'ting':  # «ting» de idea
        t = t_(1.4); s = sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * 3) for fq in (2093, 3136, 4186)) * 0.5 + np.sin(2 * np.pi * 1047 * t) * np.exp(-t * 5) * 0.4
    elif name == 'calle':  # calle tranquila de día: rumor lejano + pajaritos
        d = 4.2; t = t_(d); s = lp(noise(d), 0.01) * 5 + lp(noise(d), 0.1) * 0.15
        for o in (0.4, 1.3, 1.5, 2.6, 3.3, 3.45):
            tt = np.maximum(t - o, 0); g = (t >= o) * (tt < 0.12)
            s += g * np.sin(2 * np.pi * np.cumsum(3200 + 900 * np.sin(2 * np.pi * 30 * tt)) / SR) * np.sin(np.pi * np.minimum(tt / 0.12, 1)) * 0.18
        s = fade(s)
    elif name == 'calle_t':  # calle de tarde (más gente lejana)
        d = 5.2; s = fade(lp(noise(d), 0.01) * 5 + murmur(d, 1.6, 3) * 0.25)
    elif name == 'clock':  # tictac de reloj de pared
        d = 5.0; t = t_(d); s = np.zeros(len(t))
        for k in range(10):
            o = 0.1 + k * 0.5; tt = np.maximum(t - o, 0)
            s += (t >= o) * np.sin(2 * np.pi * (2600 if k % 2 else 2100) * tt) * np.exp(-tt * 300) * (0.8 if k % 2 else 1)
        s = lp(s, 0.5)
    elif name == 'suspiro':  # suspiro cómico: aire que baja de tono
        d = 1.1; t = t_(d); x = noise(d); s = np.zeros(len(t)); acc = 0.0
        for k in range(len(t)):
            a_ = 0.22 - 0.17 * (k / len(t)); acc += a_ * (x[k] - acc); s[k] = acc
        f = 320 - 150 * t / d
        s = s * np.sin(np.pi * t / d) ** 1.5 * 2.5 + np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2 * 0.15
    elif name == 'plop':  # tortilla que cae al cubo: golpe blando + rebote metálico corto
        t = t_(0.35); f = 160 + 260 * np.exp(-t * 30)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18) + lp(noise(0.35), 0.15) * np.exp(-t * 30) * 0.8
        s += np.sin(2 * np.pi * 740 * t) * np.exp(-t * 25) * 0.15
    elif name == 'snap':  # chasquido de dedos
        t = t_(0.15); s = hp(noise(0.15), 0.5) * np.exp(-t * 110) * 1.5 + np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 90) * 0.5
    elif name == 'tap':  # toque en la pantalla del móvil
        t = t_(0.04); s = (hp(noise(0.04), 0.4) * 0.6 + np.sin(2 * np.pi * 900 * t)) * np.exp(-t * 160)
    elif name == 'buzz':  # vibración del móvil
        d = 0.6; t = t_(d); g = ((t % 0.3) < 0.2) * 1.0
        s = lp(np.sin(2 * np.pi * 150 * t) * g * (0.7 + 0.3 * np.sin(2 * np.pi * 26 * t)), 0.2)
    elif name == 'step':  # paso en la acera
        t = t_(0.12); s = (lp(noise(0.12), 0.15) * 2 + np.sin(2 * np.pi * 90 * t) * 0.6) * np.exp(-t * 45)
    elif name == 'bell':  # campanilla de la puerta
        d = 1.6; t = t_(d); s = np.zeros(len(t))
        for o, g in ((0, 1), (0.13, 0.8), (0.27, 0.6), (0.42, 0.4)):
            tt = np.maximum(t - o, 0); s += (t >= o) * g * sum(np.sin(2 * np.pi * fq * tt) * np.exp(-tt * dc) for fq, dc in ((2350, 5), (3420, 7), (5100, 11)))
        s *= 0.3
    elif name == 'clink':  # vaso contra vaso / plato
        t = t_(0.8); f0 = rng.uniform(2600, 3600)
        s = sum(np.sin(2 * np.pi * f0 * h * t) * np.exp(-t * dc) for h, dc in ((1, 7), (1.51, 10), (2.3, 14))) * 0.4 + hp(noise(0.8), 0.6) * np.exp(-t * 120) * 0.5
    elif name == 'plates':  # platos y vasos: varios golpecitos
        d = 1.2; s = np.zeros(int(d * SR))
        for k in range(5):
            o = rng.uniform(0, 0.8); c = syn_raw_clink(); a_ = int(o * SR); s[a_:a_ + len(c)] += c[: len(s) - a_] * rng.uniform(0.4, 1)
    elif name == 'cling':  # «cling» de platos al recoger
        t = t_(1.2); s = sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * 4) for fq in (2637, 3520, 4186)) * 0.35 + hp(noise(1.2), 0.6) * np.exp(-t * 80) * 0.4
    elif name == 'hey':  # «¡hey!» de varias personas (vocal «e» con formantes y pitch que sube)
        d = 0.7; t = t_(d); s = np.zeros(len(t))
        for k in range(7):
            o = rng.uniform(0, 0.12); tt = np.maximum(t - o, 0); f0 = rng.uniform(140, 300) * (1 + 0.25 * np.minimum(tt / 0.15, 1))
            src = np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)) * (t >= o)
            env = np.minimum(1, tt / 0.03) * np.exp(-np.maximum(tt - 0.18, 0) * 12)
            s += (hp(lp(src, 0.2), 0.05) * 0.7 + hp(noise(d), 0.3) * np.exp(-tt * 60) * 0.4 * (t >= o)) * env
    elif name == 'tachan':  # «ta-chán» de éxito
        t = t_(1.6); s = np.zeros(len(t))
        for o, notes, dd in ((0, (523, 659, 784), 0.18), (0.22, (523, 659, 784, 1047), 1.3)):
            tt = np.maximum(t - o, 0); g = (t >= o) * np.exp(-tt * (1.2 if dd > 1 else 14)) * np.minimum(1, tt / 0.01)
            for fq in notes: s += g * (np.sin(2 * np.pi * fq * tt) + 0.4 * np.sin(4 * np.pi * fq * tt) + 0.2 * np.sin(6 * np.pi * fq * tt))
        s *= 0.25
    elif name == 'whoosh':
        d = 0.5; t = t_(d); s = np.zeros(len(t)); x = noise(d); acc = 0.0
        for k in range(len(t)):
            a = 0.02 + 0.25 * (k / len(t)); acc += a * (x[k] - acc); s[k] = acc
        s *= np.sin(np.pi * t / d) ** 2 * 2.2
    elif name.startswith('murmullo'):  # murmullo_<duración>_<velocidad>_<voces>
        _, d, sp, nv = name.split('_'); s = murmur(float(d), float(sp), int(nv))
    elif name.startswith('calle_'):  # calle tranquila de día con pájaros: calle_<duración>
        d = float(name.split('_')[1]); t = t_(d); s = lp(noise(d), 0.01) * 5 + lp(noise(d), 0.1) * 0.12
        o = 0.3
        while o < d - 0.3:
            for k in range(rng.integers(2, 4)):
                oo = o + k * 0.16; tt = np.maximum(t - oo, 0); g = (t >= oo) * (tt < 0.11)
                s += g * np.sin(2 * np.pi * np.cumsum(3000 + 1100 * np.sin(2 * np.pi * 28 * tt)) / SR) * np.sin(np.pi * np.minimum(tt / 0.11, 1)) * 0.16
            o += rng.uniform(0.7, 1.6)
        s = fade(s)
    elif name.startswith('clock_'):  # tictac: clock_<duración>
        d = float(name.split('_')[1]); t = t_(d); s = np.zeros(len(t))
        for k in range(int(d / 0.5)):
            o = 0.1 + k * 0.5; tt = np.maximum(t - o, 0)
            s += (t >= o) * np.sin(2 * np.pi * (2600 if k % 2 else 2100) * tt) * np.exp(-tt * 300) * (0.8 if k % 2 else 1)
        s = lp(s, 0.5)
    elif name.startswith('mosca_'):  # mosca zumbando: mosca_<duración>
        d = float(name.split('_')[1]); t = t_(d)
        f = 210 + 25 * np.sin(2 * np.pi * 1.7 * t) + 12 * np.sin(2 * np.pi * 5.3 * t)
        ph = 2 * np.pi * np.cumsum(f) / SR
        s = (np.sign(np.sin(ph)) * 0.5 + np.sin(2 * ph) * 0.3) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.9 * t) ** 2)
        s = fade(lp(s, 0.25), 0.4, 0.4)
    elif name == 'tecleo':  # pulgares en la pantalla
        d = 1.2; s = np.zeros(int(d * SR))
        for k in range(10):
            c = syn('tap'); a_ = int((0.01 + k * 0.115 + rng.uniform(-0.01, 0.01)) * SR); s[a_:a_ + len(c)] += c[: len(s) - a_] * rng.uniform(0.6, 1)
    elif name == 'yupi':  # «¡yupi!» de niña, sintetizado muy básico (dos sílabas agudas que suben)
        d = 0.9; t = t_(d); s = np.zeros(len(t))
        for o, f0, f1, ln in ((0.0, 420, 520, 0.22), (0.26, 560, 760, 0.5)):
            tt = np.maximum(t - o, 0); g = (t >= o) * (tt < ln) * np.sin(np.pi * np.minimum(tt / ln, 1)) ** 0.6
            f = f0 + (f1 - f0) * np.minimum(tt / ln, 1)
            src = np.sin(2 * np.pi * np.cumsum(f) / SR); src = src + 0.5 * np.sin(2 * 2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(3 * 2 * np.pi * np.cumsum(f) / SR)
            s += src * g
        s = s * 0.5 + hp(noise(d), 0.5) * 0.04 * (np.sin(np.pi * t / d))
    elif name == 'risitas':  # risitas infantiles: «ji-ji-ji» agudas
        d = 1.0; t = t_(d); s = np.zeros(len(t))
        for k in range(5):
            o = k * 0.13 + rng.uniform(0, 0.03); tt = np.maximum(t - o, 0); g = (t >= o) * np.exp(-tt * 22) * np.minimum(1, tt / 0.01)
            f = rng.uniform(600, 820) * (1 - 0.1 * tt)
            s += g * (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(4 * np.pi * f * tt)) + g * hp(noise(d), 0.4) * 0.15
        s *= 0.5
    elif name.startswith('ninos_'):  # murmullo de niños: más agudo y saltarín
        d = float(name.split('_')[1]); t = t_(d); s = np.zeros(len(t))
        band = hp(lp(noise(d), 0.25), 0.06)
        for k in range(7):
            ph = rng.uniform(0, 6.28); f1 = 3.2 * rng.uniform(0.7, 1.4)
            env = np.clip(np.sin(2 * np.pi * f1 * t + ph), 0, 1) ** 2 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.4 * t + ph))
            s += np.roll(band, int(rng.uniform(0, len(t)))) * env
        s = fade(s * 1.2)
    elif name.startswith('cuento_'):  # música suave de cuento: cajita de música con campanitas
        d = float(name.split('_')[1]); t = t_(d); s = np.zeros(len(t))
        mel = [76, 79, 84, 83, 79, 76, 74, 76, 79, 81, 79, 76]
        k = 0; o = 0.0
        while o < d - 0.2:
            m = mel[k % len(mel)]; fq = 440 * 2 ** ((m - 69) / 12); tt = np.maximum(t - o, 0)
            s += (t >= o) * (np.sin(2 * np.pi * fq * tt) + 0.3 * np.sin(2 * np.pi * fq * 3.01 * tt) * np.exp(-tt * 8)) * np.exp(-tt * 3.2)
            if k % 4 == 0:
                for fq2 in (2637, 3520): s += (t >= o) * np.sin(2 * np.pi * fq2 * tt) * np.exp(-tt * 5) * 0.25
            o += 0.32; k += 1
        s = fade(s * 0.4, 0.4, 0.6)
    elif name.startswith('fila_'):  # murmullo creciente: fila_<duración>
        d = float(name.split('_')[1]); s = murmur(d, 2.0, 8) * np.linspace(0.15, 1, int(d * SR)) ** 1.2
    elif name == 'click':  # «clic» de publicar
        t = t_(0.06); s = (hp(noise(0.06), 0.5) * 0.8 + np.sin(2 * np.pi * 1400 * t)) * np.exp(-t * 120)
    elif name == 'ding_b':  # «ding» brillante final
        t = t_(1.8); s = sum(g * np.sin(2 * np.pi * fq * t) * np.exp(-t * dc) for fq, g, dc in ((2093, 1, 2.5), (3136, 0.6, 3.5), (4186, 0.4, 5), (6272, 0.2, 8)))
    elif name == 'whoosh_s':  # «whoosh» suave
        d = 0.7; t = t_(d); s = np.zeros(len(t)); x = noise(d); acc = 0.0
        for k in range(len(t)):
            a = 0.01 + 0.12 * np.sin(np.pi * k / len(t)); acc += a * (x[k] - acc); s[k] = acc
        s *= np.sin(np.pi * t / d) ** 2 * 2.0
    elif name.startswith('latido_'):  # latido suave «pum-pum»: latido_<duración>
        d = float(name.split('_')[1]); t = t_(d); s = np.zeros(len(t)); o = 0.05
        while o < d - 0.3:
            for oo, g in ((o, 1.0), (o + 0.2, 0.7)):
                tt = np.maximum(t - oo, 0); f = 48 + 40 * np.exp(-tt * 25)
                s += (t >= oo) * g * np.sin(2 * np.pi * np.cumsum(np.where(t >= oo, f, 0)) / SR) * np.exp(-tt * 16) * np.minimum(1, tt / 0.004)
            o += 1 / 1.3
        s = lp(s, 0.3)
    elif name.startswith('tienda_'):  # ambiente de tienda: rumor de sala suave
        d = float(name.split('_')[1]); s = fade(lp(noise(d), 0.008) * 6 + murmur(d, 1.4, 2) * 0.12)
    elif name == 'tick':  # «tic» de reloj suelto
        t = t_(0.05); s = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 260) + hp(noise(0.05), 0.5) * np.exp(-t * 400) * 0.3
    elif name == 'pip':  # «pip» de alarma suave
        t = t_(0.09); s = np.sin(2 * np.pi * 1760 * t) * np.minimum(1, t / 0.004) * np.exp(-np.maximum(t - 0.06, 0) * 120)
    elif name.startswith('secador_'):  # secador de pelo lejano: zumbido de motor y aire
        d = float(name.split('_')[1]); t = t_(d)
        s = lp(noise(d), 0.05) * 2.2 + 0.25 * np.sin(2 * np.pi * 118 * t) + 0.12 * np.sin(2 * np.pi * 236 * t)
        s = fade(lp(s, 0.2) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.7 * t)), 0.6, 0.6)
    elif name.startswith('agua_'):  # agua del lavacabezas: chorro (ruido) con borboteo
        d = float(name.split('_')[1]); t = t_(d); s = hp(lp(noise(d), 0.35), 0.05) * 1.2
        for k in range(int(d * 9)):
            o = rng.uniform(0, d - 0.1); tt = np.maximum(t - o, 0); f = rng.uniform(500, 1200) * (1 + 2 * tt)
            s += (t >= o) * np.sin(2 * np.pi * f * tt) * np.exp(-tt * 60) * 0.35
        s = fade(s, 0.15, 0.3)
    elif name == 'chas':  # tijeras: chasquido metálico corto
        t = t_(0.12); s = hp(noise(0.12), 0.6) * np.exp(-t * 70) + sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * 50) for fq in (3800, 5300)) * 0.4
    elif name == 'yes':  # «¡yes!» cómico muy básico: vocal que sube y «s» final
        d = 0.6; t = t_(d); f0 = 180 + 160 * np.minimum(t / 0.25, 1)
        src = np.sign(np.sin(2 * np.pi * np.cumsum(f0) / SR)); g = (t < 0.36) * np.minimum(1, t / 0.02) * np.minimum(1, (0.36 - t) / 0.06 + 0.01)
        s = hp(lp(src, 0.18), 0.04) * g * 0.8 + hp(noise(d), 0.7) * ((t > 0.33) & (t < 0.58)) * np.sin(np.pi * np.clip((t - 0.33) / 0.25, 0, 1)) * 0.35
    elif name == 'persiana':  # golpe seco contra la persiana metálica: golpe grave + vibración de las lamas
        d = 0.9; t = t_(d); f = 70 + 90 * np.exp(-t * 25)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 1.2 + lp(noise(d), 0.2) * np.exp(-t * 30) * 0.9
        s += hp(noise(d), 0.3) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 38 * t))) * np.exp(-t * 7) * 0.35
        s += sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * dc) for fq, dc in ((410, 6), (690, 8), (1130, 11))) * 0.18
    elif name == 'latido':  # latido de corazón (pum-pum)
        d = 0.5; t = t_(d); s = np.zeros(len(t))
        for o, g in ((0, 1), (0.17, 0.7)):
            tt = np.maximum(t - o, 0); s += (t >= o) * g * np.sin(2 * np.pi * (55 + 40 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 22)
    else: raise KeyError(name)
    SYN[name] = s.astype(np.float64); return SYN[name]

EV = []
def ev(name, t, g_db=0.0): EV.append((name, t, g_db))
TK = cfg.get('variant') == 'tiktok'
c = lambda i: SC[i - 1]['cues']
# 1) «whoosh» corto con el zoom de entrada; «pop» de los textos
ev('whoosh_s', st(1), -8); ev('pop_s', at(1, 't1'), -13); ev('pop_s', at(1, 't2'), -14)
# 2) golpe seco del cartel contra la persiana; «whoosh» de la mano y «pop» al dejar el cartel «¿QUÉ ES?»
ev('persiana', at(2, 'slam') + 0.14, -4)
ev('whoosh_s', at(2, 'que') - 0.05, -10); ev('pop', at(2, 'que') + 0.3, -6)
# 3) móvil que entra; «pops» suaves con cada tarjeta
ev('whoosh_s', at(3, 'phoneIn'), -12)
for x in c(3)['cards']: ev('pop_s', st(3) + x, -12)
# 4) «pops» cortos con cada icono; latido en el corazón
for x in c(4)['icons']: ev('pop', st(4) + x, -10)
o = c(4)['heart']
while o < SC[3]['end'] - SC[3]['start'] - 0.3: ev('latido', st(4) + o + 0.05, -6); o += 0.75
# 5) «pop» del cartel de WhatsApp + notificación de móvil; enlace; «comenta CANAL» (solo Instagram)
ev('pop', at(5, 'card'), -8); ev('ding2', at(5, 'card') + 0.2, -10); ev('pop_s', at(5, 'link'), -14)
if not TK: ev('pop_s', at(5, 'strip'), -12); ev('pop', at(5, 'com'), -7); ev('pop', at(5, 'com') + 0.18, -8)
# 6) tarjeta del comercio y toque en el botón
ev('pop', at(6, 'card'), -8); ev('pop_s', at(6, 'btn'), -14); ev('tap', at(6, 'press'), -10)
# 7) «whoosh» y «ding» suave de cierre
ev('whoosh', st(7) - 0.15, -8); ev('ding_b', st(7) + 0.05, -9)

fx = np.zeros(N)
for name, t, g in EV:
    s = syn(name); s = s / max(np.abs(s).max(), 1e-9) * 10 ** ((g - 6) / 20)
    a = int(t * SR); fx[a:a + len(s)] += s[: max(0, N - a)]
synth = sorted(n for n in SYN if n not in SYN_FILE)
if synth: print('efectos sintetizados con código (no hay archivo en audio/sfx/):', ', '.join(synth))

# ---------------- música: 17 dB por debajo de las voces, y 5 dB menos mientras hay voz ----------------
mix = (voice + fx)[:, None] * np.array([1.0, 1.0])
MUS = os.path.join(ROOT, cfg.get('musicMp3', 'audio/musica.mp3'))
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', MUS, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
mus = np.frombuffer(raw, '<f4').astype(np.float64).reshape(-1, 2)
mus = np.vstack([mus, np.zeros((max(0, N - len(mus)), 2))])[:N]
mus *= 10 ** (-37 / 20) / max(np.sqrt((mus[: int(SR * (TOTAL - 2))] ** 2).mean()), 1e-9)
env = np.convolve(np.abs(voice), np.ones(int(0.3 * SR)) / int(0.3 * SR), 'same')
mus *= (10 ** (-5 * np.clip(env / 0.02, 0, 1) / 20))[:, None]
mix += mus; print(f'música: {os.path.relpath(MUS, ROOT)}  RMS {db(np.sqrt((mus ** 2).mean())):.1f} dBFS (voces -20 dBFS)')
pk = np.abs(mix).max()
if pk > 0.95: mix *= 0.95 / pk
MEZ = A(cfg.get('mixWav', 'mezcla17.wav'))
with wave.open(MEZ, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
vid = os.path.join(ROOT, cfg['output']); out = os.path.join(ROOT, cfg.get('audioOut', 'video17_con_audio.mp4')); tmp = out.replace('.mp4', '.partial.mp4')
os.makedirs(os.path.dirname(out), exist_ok=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', vid, '-i', MEZ, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
                '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, out)
print('->', os.path.relpath(out, ROOT), f'({TOTAL:.2f} s)')
