#!/usr/bin/env python3
"""Vídeo 10 «Carmen y María» — pista de sonido y vídeo con audio (la imagen NO se recodifica: -c:v copy).

  python3 audio/make_audio.py

1) Voces: audio/voces/<voz>_<n>.(wav|mp3|m4a|ogg|flac|aac) colocadas al inicio de su escena según timeline.txt:
   narradora_1..6 -> escenas 1..6; narradora_7 y después carmen_1 -> escena 7; narradora_8 -> 8; maria_1 -> 9.
   Si falta un archivo, se avisa y esa frase queda en silencio.
2) Efectos: audio/sfx/<nombre>.wav si existe; si no, se sintetizan (básicos) con este script.
3) Música: audio/musica.mp3 si existe (si no, sin música), con envolvente por escenas y ~17 dB por debajo de la voz;
   baja más bajo el susurro de María (escena 9).
4) Mezcla -> audio/mezcla.wav, audio/efectos.wav y carmen_y_maria_con_audio.mp4 (vídeo con -c:v copy + AAC).
"""
import json, os, subprocess, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, 'audio')
SR = 48000
rng = np.random.default_rng(10)
cfg = json.load(open(os.path.join(ROOT, 'config.json')))
VIDEO = os.path.join(ROOT, cfg['output'])
OUT = os.path.join(ROOT, cfg['output'].replace('.mp4', '_con_audio.mp4'))

# ---------- tiempos de escena (timeline.txt) ----------
START, END = {}, {}
for line in open(os.path.join(ROOT, 'timeline.txt'), encoding='utf-8'):
    p = line.split('\t')
    if p[0].isdigit():
        START[int(p[0])], END[int(p[0])] = float(p[1]), float(p[2])
TOTAL = max(END.values())
N = int(round(TOTAL * SR))
db = lambda x: 10 ** (x / 20)

# ---------- utilidades ----------
def decode(path):
    """Cualquier formato -> float32 estéreo a 48 kHz (vía ffmpeg)."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)

def find(folder, name):
    for ext in ('wav', 'mp3', 'm4a', 'ogg', 'flac', 'aac'):
        p = os.path.join(folder, f'{name}.{ext}')
        if os.path.exists(p):
            return p
    return None

def place(buf, snd, t, gain=1.0):
    i = int(round(t * SR))
    if i >= len(buf):
        return
    if snd.ndim == 1:
        snd = np.stack([snd, snd], 1)
    n = min(len(snd), len(buf) - i)
    buf[i:i + n] += snd[:n] * gain

def rms(x):
    return float(np.sqrt(np.mean(x ** 2))) if len(x) else 0.0

def env(n, a=0.005, r=0.05):
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e

def lp(x, k):  # paso bajo de un polo (k 0..1)
    y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x):
        s += k * (v - s); y[i] = s
    return y

def lp_fast(x, cutoff):
    """paso bajo por FFT (rápido para ruidos largos)."""
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (fr / cutoff) ** 4)
    return np.fft.irfft(X, len(x))

def bp_fast(x, lo, hi):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / (1 + (lo / np.maximum(fr, 1)) ** 4)) * (1 / (1 + (fr / hi) ** 4))
    return np.fft.irfft(X, len(x))

def noise(sec):
    return rng.standard_normal(int(sec * SR))

def tt(sec):
    return np.arange(int(sec * SR)) / SR

def norm(x, peak=1.0):
    m = np.max(np.abs(x)) or 1
    return x / m * peak

# ---------- efectos sintetizados (básicos) ----------
def s_pop(f0=520):
    t = tt(0.14); f = f0 * (1 + 1.6 * np.exp(-t * 40))
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 32))

def s_plop():
    t = tt(0.2); f = 300 + 500 * np.exp(-t * 25)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 20))

def s_ding(f=1320, d=0.9):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 8) + 0.2 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 14)
    return norm(x * np.exp(-t * 5) * env(len(t), 0.002, 0.1))

def s_ting():
    return s_ding(2350, 0.8) * 0.8 + np.pad(s_ding(3520, 0.6), (0, int(0.2 * SR)))[:int(0.8 * SR)] * 0.3

def s_bell():  # campanilla de la puerta: dos golpecitos
    b = s_ding(2100, 1.0) * 0.7 + s_ding(2830, 1.0) * 0.4
    out = np.zeros(int(1.3 * SR)); out[:len(b)] += b; out[int(0.14 * SR):int(0.14 * SR) + len(b)] += b * 0.6
    return norm(out)

def s_whoosh(d=0.45, soft=False):
    n = noise(d); t = tt(d)
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** (2 if soft else 1.4)
    x = bp_fast(n, 300 if soft else 500, 2500 if soft else 5000) * e
    return norm(x)

def s_click(f=3000, d=0.025):
    t = tt(d)
    return norm(bp_fast(noise(d), f * 0.6, f * 1.6) * np.exp(-t * 260))

def s_tick():  # tic de farola: chasquido seco + leve zumbido
    t = tt(0.3)
    x = np.zeros(len(t)); c = s_click(1800, 0.03); x[:len(c)] += c
    x += 0.12 * np.sin(2 * np.pi * 100 * t) * np.exp(-t * 10)
    return norm(x)

def s_step():
    t = tt(0.08)
    return norm(lp_fast(noise(0.08), 900) * np.exp(-t * 60))

def s_sigh():  # suspiro cómico: aire con formante que baja
    d = 0.75; t = tt(d); n = noise(d)
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.2 * np.exp(-t * 1.2)
    lo = 1600 - 1100 * t / d
    out = np.zeros(len(t)); seg = int(0.05 * SR)
    for i in range(0, len(t), seg):
        out[i:i + seg] = bp_fast(n[i:i + seg * 2], lo[i] * 0.6, lo[i] * 1.6)[:len(out[i:i + seg])]
    voice = 0.25 * np.sin(2 * np.pi * np.cumsum(260 - 110 * t / d) / SR) * e
    return norm(out * e + voice)

def s_meow():
    d = 0.6; t = tt(d)
    f = 650 + 350 * np.sin(np.pi * t / d) - 200 * (t / d) ** 2
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)
    return norm(x * np.sin(np.pi * t / d) ** 0.8 * (1 + 0.15 * np.sin(2 * np.pi * 7 * t)))

def s_bird():
    out = np.zeros(int(0.5 * SR))
    for k, (o, f0) in enumerate([(0, 3800), (0.12, 4300), (0.26, 3600)]):
        d = 0.08; t = tt(d); f = f0 + 900 * np.sin(np.pi * t / d)
        c = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d)
        i = int(o * SR); out[i:i + len(c)] += c
    return norm(out)

def s_shutter(d=1.6):  # persiana metálica bajando a lo lejos: traqueteo filtrado
    t = tt(d); x = np.zeros(len(t))
    for k in range(int(d * 22)):
        tk = k / 22 + rng.uniform(-0.01, 0.01)
        c = s_click(rng.uniform(900, 1500), 0.04)
        i = max(0, int(tk * SR)); n = min(len(c), len(x) - i)
        if n > 0: x[i:i + n] += c[:n] * rng.uniform(0.5, 1)
    x += 0.3 * lp_fast(noise(d), 400)
    x = lp_fast(x, 1800) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.5
    c = s_click(600, 0.08); x[-len(c) - 100:-100] += c * 1.5  # golpe final
    return norm(x)

def s_hanger():
    t = tt(0.12)
    x = np.sin(2 * np.pi * 2600 * t) * 0.5 + np.sin(2 * np.pi * 3900 * t) * 0.3 + bp_fast(noise(0.12), 2000, 6000) * 0.4
    return norm(x * np.exp(-t * 40))

def s_key():
    return s_click(rng.uniform(2500, 4000), 0.02)

def s_whisper(d=0.9):
    t = tt(d)
    x = bp_fast(noise(d), 1500, 7000) * (np.sin(np.pi * t / d) ** 1.5) * (0.7 + 0.3 * np.sin(2 * np.pi * 3 * t))
    return norm(x)

# ambientes largos
def amb_murmur(d, lo=250, hi=1200, mod=3.0):
    n = noise(d); t = tt(d)
    m = 0.6 + 0.4 * lp_fast(np.abs(rng.standard_normal(len(t))), mod) * 3
    x = bp_fast(n, lo, hi) * np.clip(m, 0.2, 1.5)
    return norm(x)

def amb_wind(d):
    t = tt(d)
    x = lp_fast(noise(d), 300) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * t + 1))
    return norm(x)

def amb_traffic(d):
    t = tt(d)
    x = lp_fast(noise(d), 160) + 0.3 * np.sin(2 * np.pi * 55 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * t))
    return norm(x)

def steps(d, period, jitter=0.03, n_people=1):
    x = np.zeros(int(d * SR))
    for p in range(n_people):
        tk = rng.uniform(0, period)
        while tk < d:
            c = s_step() * rng.uniform(0.5, 1)
            i = int(tk * SR); n = min(len(c), len(x) - i)
            if n > 0: x[i:i + n] += c[:n]
            tk += period + rng.uniform(-jitter, jitter)
    return norm(x)

SFX_DIR = os.path.join(A, 'sfx')
SYN = {
    'pop': s_pop, 'plop': s_plop, 'ding': s_ding, 'ting': s_ting, 'campanilla': s_bell, 'whoosh': s_whoosh,
    'whoosh_suave': lambda: s_whoosh(1.0, True), 'tic_farola': s_tick, 'suspiro': s_sigh, 'maullido': s_meow,
    'pajaro': s_bird, 'persiana': s_shutter, 'percha': s_hanger, 'tecla': s_key, 'susurro_aire': s_whisper,
}
used_files, synth = set(), set()
def sfx(name, *args):
    p = os.path.join(SFX_DIR, f'{name}.wav')
    if os.path.exists(p):
        used_files.add(name); x = decode(p).mean(1)
        return norm(x)
    synth.add(name)
    return SYN[name](*args)

# ---------- 1) EFECTOS ----------
fx = np.zeros((N, 2))
def put(name, t, g, pan=0.0, snd=None):
    x = snd if snd is not None else sfx(name)
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    place(fx, np.stack([x * l * 1.41, x * r * 1.41], 1), t, g)

def amb(name, gen, t0, d, g, pan=0.0):
    p = os.path.join(SFX_DIR, f'{name}.wav')
    if os.path.exists(p):
        used_files.add(name); x = decode(p).mean(1)
        x = np.tile(x, int(np.ceil(d * SR / len(x))))[:int(d * SR)]; x = norm(x)
    else:
        synth.add(name); x = gen(d)
    x = x * env(len(x), 0.15, 0.15)
    put(None, t0, g, pan, snd=x)

s = START
# (1) pantalla partida: pop al entrar cada mitad; ambiente alegre arriba (pan izq.) / viento suave abajo
put('pop', s[1] + 0.02, db(-12), -0.3); put('pop', s[1] + 0.17, db(-12), 0.3)
amb('ambiente_avenida', lambda d: amb_murmur(d, 300, 1500), s[1], 4.0, db(-30), -0.2)
for k in (0.5, 1.7, 2.9): put('pajaro', s[1] + k, db(-28), -0.4)
amb('viento', amb_wind, s[1], 4.0, db(-30), 0.2)
# (2) avenida: tráfico lejano, pasos y murmullo; suspiro cómico de Carmen
amb('trafico_lejano', amb_traffic, s[2], 5.0, db(-32))
amb('murmullo_calle', lambda d: amb_murmur(d, 280, 1400), s[2], 5.0, db(-28))
put(None, s[2], db(-28), 0, snd=steps(5.0, 0.42, 0.05, 4) * env(int(5 * SR), 0.1, 0.2))
put('suspiro', s[2] + 3.35 + (END[2] - START[2] - 4.7), db(-12))
# (3) callejuela silenciosa: pájaro, maullido, persiana lejana, tic de farola
amb('viento', amb_wind, s[3], 5.0, db(-34))
put('pajaro', s[3] + 0.7, db(-26), -0.3)
put('persiana', s[3] + 1.3, db(-26), -0.5)
put('maullido', s[3] + 2.4, db(-14), 0.4)
put('tic_farola', s[3] + 3.6, db(-20), 0.3)
# (4) tienda: murmullo, perchas y campanilla de la puerta
amb('murmullo_tienda', lambda d: amb_murmur(d, 250, 1100, 4), s[4], 4.0, db(-26))
put('campanilla', s[4] + 0.15, db(-14), -0.5)
for k, pn in ((0.7, 0.1), (1.3, -0.2), (1.9, 0.3), (2.6, -0.1), (3.2, 0.2)): put('percha', s[4] + k, db(-22), pn)
# (5) viñetas: pop por viñeta y ding de interrogante
put('pop', s[5] + 0.05, db(-12), -0.3); put('pop', s[5] + 0.2, db(-12), 0.3)
put('ding', s[5] + 0.45, db(-17)); put(None, s[5] + 0.6, db(-19), 0, snd=s_ding(1760, 0.7) if 'ding' not in used_files else sfx('ding'))
# (6) María publica: tecleo, plop por tarjeta, pop al pulsar «Publicar», ding del tic
tk = 0.9
while tk < 3.4:
    put('tecla', s[6] + tk, db(-24), 0.1); tk += rng.uniform(0.07, 0.16)
put('plop', s[6] + 1.4, db(-12), 0.3); put('plop', s[6] + 1.9, db(-12), 0.3)
put('pop', s[6] + 3.5, db(-11), 0.3)
put('ding', s[6] + 3.58, db(-13), 0.3)
# (7) muchas notificaciones a la vez y pasos de riada
for k in range(14):
    f0 = [1320, 1480, 1760, 1175, 1568, 1980][k % 6] if 'ding' not in used_files else None
    snd = s_ding(f0, 0.8) if f0 else sfx('ding')
    put(None, s[7] + 0.6 + rng.uniform(0, 0.35), db(-20), rng.uniform(-0.8, 0.8), snd=snd)
amb('murmullo_calle', lambda d: amb_murmur(d, 280, 1400), s[7], 5.0, db(-30))
put(None, s[7] + 2.2, db(-20), 0.2, snd=steps(2.4, 0.16, 0.04, 6) * env(int(2.4 * SR), 0.15, 0.6))
# (8) whoosh al entrar el texto y pop al aparecer la franja
put('whoosh', s[8] + 0.1, db(-16)); put('whoosh', s[8] + 1.2, db(-18))
put('pop', s[8] + 3.35, db(-11))
# (9) whoosh suave al acercarse María, susurro de aire y ting al guiño
put('whoosh_suave', s[9] + 0.3, db(-17))
put('susurro_aire', s[9] + 1.05, db(-26))
put('ting', s[9] + 2.65, db(-13))

# ---------- 2) VOCES ----------
VOZ = os.path.join(A, 'voces')
vo = np.zeros((N, 2)); maria_span = None; missing = []; placed = []
plan = [('narradora_1', 1), ('narradora_2', 2), ('narradora_3', 3), ('narradora_4', 4), ('narradora_5', 5),
        ('narradora_6', 6), ('narradora_7', 7), ('carmen_1', 7), ('narradora_8', 8), ('maria_1', 9)]
cursor = {}
TARGET_VOICE_RMS = db(-20)
VOICE_GAIN = {'maria_1': 1.0}  # el susurro, un pelín por encima
CUES = json.load(open(os.path.join(VOZ, 'cues.json'), encoding='utf-8')) if os.path.exists(os.path.join(VOZ, 'cues.json')) else {}
SPEAKER = lambda n: 'carmen' if n.startswith('carmen') else ('maria' if n.startswith('maria') else 'narradora')
subs = []
for name, sc in plan:
    p = find(VOZ, name)
    if not p:
        missing.append(name); continue
    x = decode(p)
    # nivel: RMS de la parte con voz -> -20 dBFS (iguala la narración, Carmen y el susurro de María, que estaba más bajo)
    act = x[np.abs(x).max(1) > 0.02]
    x = x * (TARGET_VOICE_RMS / (rms(act) or 1)) * db(VOICE_GAIN.get(name, 0))
    t0 = cursor.get(sc, START[sc] + 0.1)
    place(vo, x, t0)
    t1 = t0 + len(x) / SR
    cursor[sc] = t1 + 0.15
    placed.append((name, sc, t0, t1))
    for a_, b_, txt in CUES.get(name, [[0.06, len(x) / SR - 0.1, '']]):
        if txt: subs.append({'start': round(t0 + a_, 3), 'end': round(t0 + b_, 3), 'text': txt, 'who': SPEAKER(name)})
    if t1 > END[sc] + 0.01:
        print(f'AVISO: {name} termina en {t1:.2f} s, después del final de la escena {sc} ({END[sc]:.2f} s)')
    if name == 'maria_1': maria_span = (t0, t1)

# subtítulos: cada uno hasta el siguiente (máx. +0,6 s tras la voz), mínimo 1 s en pantalla
subs.sort(key=lambda c: c['start'])
for i, c in enumerate(subs):
    nxt = subs[i + 1]['start'] if i + 1 < len(subs) else TOTAL
    c['end'] = round(min(nxt - 0.04, max(c['end'] + 0.6, c['start'] + 1.0), TOTAL), 3)
SUBJ = os.path.join(ROOT, 'subtitles.json'); sj = json.dumps(subs, ensure_ascii=False, indent=1)
if not os.path.exists(SUBJ) or open(SUBJ, encoding='utf-8').read() != sj:  # solo se reescribe si cambia
    open(SUBJ, 'w', encoding='utf-8').write(sj)
def srt_t(x):
    ms = int(round(x * 1000)); return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'
with open(os.path.join(ROOT, cfg['output'].replace('.mp4', '.srt')), 'w', encoding='utf-8') as fh:
    for i, c in enumerate(subs, 1): fh.write(f"{i}\n{srt_t(c['start'])} --> {srt_t(c['end'])}\n{c['text']}\n\n")

# ---------- 3) MÚSICA ----------
mu = np.zeros((N, 2)); music = find(A, 'musica')
music = os.path.join(A, 'musica.mp3') if os.path.exists(os.path.join(A, 'musica.mp3')) else None
if music:
    x = decode(music)
    if len(x) < N: x = np.tile(x, (int(np.ceil(N / len(x))), 1))
    x = x[:N]
    # nivel base: ~17 dB por debajo de la voz (RMS)
    x = x * (db(-20 - 17) / (rms(x) or 1))
    # envolvente por escenas (dB relativos): 1-2 ligera, 3-4 curiosa, 5 pausa, 6-7 sube, 8-9 cierra y baja en el susurro
    lv = {1: -2, 2: -2, 3: -1, 4: -1, 5: -6, 6: 1.5, 7: 2.5, 8: 0, 9: -1}
    pts_t, pts_v = [], []
    for sc in sorted(START):
        pts_t += [START[sc] + 0.001, END[sc] - 0.25]; pts_v += [lv[sc], lv[sc]]
    g = np.interp(np.arange(N) / SR, pts_t, pts_v)
    if maria_span:
        a0, a1 = maria_span; tt_ = np.arange(N) / SR
        duck = np.clip(np.minimum((tt_ - (a0 - 0.3)) / 0.3, ((a1 + 0.4) - tt_) / 0.4), 0, 1)
        g = g - 7 * duck
    x = x * db(g)[:, None]
    x[-int(1.5 * SR):] *= np.linspace(1, 0, int(1.5 * SR))[:, None]
    mu = x

# ---------- 4) MEZCLA ----------
mix = vo + fx + mu
peak = np.abs(mix).max()
if peak > db(-1): mix *= db(-1) / peak; fx_scale = db(-1) / peak
mix[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))[:, None]

def write(path, x):
    y = (np.clip(x, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
write(os.path.join(A, 'efectos.wav'), fx)
write(os.path.join(A, 'mezcla.wav'), mix)
tmp = OUT.replace('.mp4', '.partial.mp4')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', VIDEO, '-i', os.path.join(A, 'mezcla.wav'), '-map', '0:v:0', '-map', '1:a:0',
                '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', f'{TOTAL:.3f}', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, OUT)
# versión con subtítulos (imagen de tmp/subtitulado_mudo.mp4, render.js subs) + la misma mezcla, también con -c:v copy
SUBV = os.path.join(ROOT, 'tmp', 'subtitulado_mudo.mp4')
OUT_S = os.path.join(ROOT, cfg['output'].replace('.mp4', '_subtitulado.mp4'))
if os.path.exists(SUBV):  # (render.js subs debe ejecutarse después de generar subtitles.json)
    tmp = OUT_S.replace('.mp4', '.partial.mp4')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', SUBV, '-i', os.path.join(A, 'mezcla.wav'), '-map', '0:v:0', '-map', '1:a:0',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', f'{TOTAL:.3f}', '-movflags', '+faststart', tmp], check=True)
    os.replace(tmp, OUT_S); print('->', os.path.relpath(OUT_S, ROOT))
else:
    print('(sin versión subtitulada: falta tmp/subtitulado_mudo.mp4 o es anterior a subtitles.json -> node render.js subs)')

print('voces colocadas:', ', '.join(f'{n} (esc. {s}) {a:.2f}-{b:.2f} s' for n, s, a, b in placed) or 'ninguna')
if missing: print('FALTAN voces (silencio):', ', '.join(missing))
print('música:', os.path.relpath(music, ROOT) if music else 'no hay audio/musica.mp3 -> sin música')
if used_files: print('efectos de audio/sfx/:', ', '.join(sorted(used_files)))
if synth: print('efectos SINTETIZADOS (básicos):', ', '.join(sorted(synth)))
print('->', os.path.relpath(OUT, ROOT))
