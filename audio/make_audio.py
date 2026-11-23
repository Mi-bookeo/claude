#!/usr/bin/env python3
"""Pista de sonido del vídeo 13 «José y las tortillas» y vídeo con audio (la imagen NO se vuelve a codificar: -c:v copy).
   1) Voces: según config.json ('voices' de cada escena, lo escribe cortar_voces.py), igualadas a -20 dBFS RMS:
      narradora_1→1, narradora_2→2, jose_1→3, jose_2→4, narradora_3 y jose_3→5, narradora_4→6, narradora_5→7,
      narradora_6→8, jose_4→9, jose_5 y jose_6→10.
   2) Efectos: audio/sfx/<nombre>.wav si existe; si no, se sintetizan con código (básicos) -> audio/efectos.wav.
   3) Música: audio/musica.mp3 si existe (unos 17 dB por debajo de las voces y 3 dB menos bajo la voz); si no, sin música.
   Salida: audio/mezcla.wav y jose_la_tortilla_con_audio.mp4 (AAC 192 kb/s)."""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
cfg = json.load(open(os.path.join(ROOT, 'config.json')))
FPS = cfg['fps']
SC, fr = [], 0
for s in cfg['scenes']:
    n = round(s['duration'] * FPS); SC.append(dict(s, start=fr / FPS, end=(fr + n) / FPS)); fr += n
TOTAL = fr / FPS
N = int(round(TOTAL * SR))
rng = np.random.default_rng(13)
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
def syn(name):
    if name in SYN: return SYN[name]
    p = A('sfx', name + '.wav')
    if os.path.exists(p): SYN[name] = load(p); return SYN[name]
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
    else: raise KeyError(name)
    SYN[name] = s.astype(np.float64); return SYN[name]
def syn_raw_clink():
    t = t_(0.5); f0 = rng.uniform(2400, 3800)
    return sum(np.sin(2 * np.pi * f0 * h * t) * np.exp(-t * dc) for h, dc in ((1, 9), (1.51, 12), (2.3, 16))) * 0.4 + hp(noise(0.5), 0.6) * np.exp(-t * 150) * 0.4

EV = []
def ev(name, t, g_db=0.0, env=None): EV.append((name, t, g_db, env))
D = lambda i: SC[i - 1]['end'] - SC[i - 1]['start']
# 1) ambiente de calle de día
ev('calle', st(1), -16); ev('pop', at(1, 'title'), -9); ev('pop_s', at(1, 'hour'), -10)
# 2) murmullo bajo de bar casi vacío y tictac del reloj
ev(f'murmullo_{D(2) + D(3) + D(4):.2f}_1.2_2', st(2), -26); ev('clock', st(2), -21); ev('pop', at(2, 'title'), -10)
# 3) suspiro cómico y «plop» de cada tortilla al caer en el cubo
ev('clock', st(3), -24); ev('suspiro', at(3, 'hand') + 0.05, -9); ev('pop', at(3, 'title'), -11)
k = 0
while cue(3, 'cloud') + 0.83 + 0.9 * k < D(3) - 0.1: ev('plop', at(3, 'cloud') + 0.83 + 0.9 * k, -8); k += 1
# 4) chasquido de dedos y «ting» de idea
ev('snap', at(4, 'snap'), -4); ev('ting', at(4, 'bulb'), -8); ev('pop_s', at(4, 'cloud'), -11); ev('ting', at(4, 'flash'), -15)
# 5) tecleo en el móvil, «pop» al pulsar «Publicar» y «ding» del tic
ev(f'murmullo_{D(5):.2f}_1.2_2', st(5), -28)
t0 = st(5) + 0.1; k = 0
while t0 + k * 0.12 < shot(5, 'B') - 0.05: ev('tap', t0 + k * 0.12 + 0.02 * np.sin(k * 7), -15 - 3 * (k % 2)); k += 1
b = shot(5, 'B')
ev('pop_s', b + cue(5, 'seal'), -12); ev('tap', b + cue(5, 'press'), -7); ev('pop', b + cue(5, 'press') + 0.02, -3); ev('ding', b + cue(5, 'release'), -6)
ev('pop_s', shot(5, 'C') + cue(5, 'cloud'), -12)
# 6) muchas notificaciones a la vez y pasos de Pedro
ev('calle_t', st(6), -18)
for j, o in enumerate((0.0, 0.05, 0.11, 0.16, 0.22, 0.3)): ev('ding2' if j % 2 else 'ding', at(6, 'buzz') + o, -11 - j * 0.6)
for o in (0.0, 0.1, 0.2): ev('buzz', at(6, 'buzz') + o, -16)
ev('pop', at(6, 'card'), -10)
k = 0
while cue(6, 'go') + 0.1 + 0.3 * k < D(6) - 0.1: ev('step', at(6, 'go') + 0.1 + 0.3 * k, -13); k += 1
# 7) campanilla de la puerta, murmullo creciente, platos y vasos, «¡hey!»
ev('bell', st(7) + 0.05, -8)
for k_, g in (('A', -24), ('B', -19), ('C', -14)):
    a_, b_ = SC[6]['shots'][k_]; ev(f'murmullo_{b_ - a_ + 0.3:.2f}_2.3_{4 if k_ == "A" else 8 if k_ == "B" else 12}', shot(7, k_), g)
ev('bell', shot(7, 'B') + 0.05, -14); ev('plates', shot(7, 'B') + 0.3, -15); ev('hey', shot(7, 'C') + 0.15, -9); ev('plates', shot(7, 'C') + 0.6, -12)
for o in (0.6, 2.6, 4.9): ev('clink', st(7) + o, -16)
# 8) murmullo animado y «cling» de platos
ev(f'murmullo_{D(8):.2f}_2.6_12', st(8), -15); ev('cling', st(8) + 0.5, -12); ev('cling', st(8) + 2.4, -13); ev('pop', at(8, 'title'), -11)
ev('pop', at(8, 'thumb'), -9); ev('clink', at(8, 'chin'), -6); ev('clink', at(8, 'chin') + 0.04, -8); ev('plates', st(8) + 4.8, -14)
# 9) «ta-chán» de éxito al pulgar arriba
ev(f'murmullo_{D(9):.2f}_1.8_4', st(9), -28); ev('pop', at(9, 't1'), -11); ev('pop', at(9, 't2'), -11); ev('pop', at(9, 'banner'), -8); ev('tachan', at(9, 'thumb'), -5)
# 10) «whoosh» suave al acercarse José a cámara, «pop» de las franjas y «whoosh» del logo final
ev('calle', st(10), -22); ev('whoosh', st(10) - 0.05, -11); ev('pop', at(10, 'a1'), -12); ev('pop', at(10, 'strip'), -6); ev('pop_s', at(10, 'sub'), -10); ev('pop', at(10, 'b2'), -7); ev('pop_s', at(10, 'b3'), -10)
ev('whoosh', shot(10, 'FIN') - 0.2, -4); ev('ding', shot(10, 'FIN') + 0.1, -11)

fx = np.zeros(N)
for name, t, g, _ in EV:
    s = syn(name); s = s / max(np.abs(s).max(), 1e-9) * 10 ** ((g - 6) / 20)
    a = int(t * SR); fx[a:a + len(s)] += s[: max(0, N - a)]
synth = sorted({n.split('_')[0] if n.startswith('murmullo') else n for n in SYN if not os.path.exists(A('sfx', n + '.wav'))})
if synth: print('AVISO: efectos sintetizados con código (básicos):', ', '.join(synth))

# ---------------- música ----------------
mix = (voice + fx)[:, None] * np.array([1.0, 1.0])
if os.path.exists(A('musica.mp3')):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', A('musica.mp3'), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    mus = np.frombuffer(raw, '<f4').astype(np.float64).reshape(-1, 2)
    mus = np.vstack([mus, np.zeros((max(0, N - len(mus)), 2))])[:N]
    mus *= 10 ** (-37 / 20) / max(np.sqrt((mus ** 2).mean()), 1e-9)
    env = np.convolve(np.abs(voice), np.ones(int(0.3 * SR)) / int(0.3 * SR), 'same')
    mus *= (10 ** (-3 * np.clip(env / 0.02, 0, 1) / 20))[:, None]
    mix += mus; print(f'música: audio/musica.mp3  RMS {db(np.sqrt((mus ** 2).mean())):.1f} dBFS')
else:
    print('música: no hay audio/musica.mp3 -> sin música')
pk = np.abs(mix).max()
if pk > 0.95: mix *= 0.95 / pk
with wave.open(A('mezcla.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
with wave.open(A('efectos.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(fx, -1, 1) * 32767).astype('<i2').tobytes())
vid = os.path.join(ROOT, cfg['output']); out = os.path.join(ROOT, 'jose_la_tortilla_con_audio.mp4'); tmp = out.replace('.mp4', '.partial.mp4')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', vid, '-i', A('mezcla.wav'), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
                '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, out)
print('->', os.path.relpath(out, ROOT), f'({TOTAL:.2f} s)')
