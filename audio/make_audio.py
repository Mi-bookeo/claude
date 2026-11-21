#!/usr/bin/env python3
"""Pista de sonido de «¿Qué es Escaparate de Tudela?» (sin recodificar la imagen).

  python3 audio/make_audio.py

1) Voces: audio/voces/narradora_<n>.(wav|mp3|m4a|ogg|flac), al inicio de su escena según timeline.txt:
   narradora_1 -> escena 1, _2 -> 2, _3 -> 3, _4 -> 4, _5 -> 6.
2) Efectos: audio/sfx/<nombre>.wav si existe (mismos nombres que los sintetizados); si no, se sintetizan
   (básicos) -> audio/efectos.wav
3) Música: audio/musica.mp3 si existe; si no, música de fondo suave sintetizada -> audio/musica_sintetizada.wav.
   Automatización por escena y colocada ~17 dB por debajo de la voz (RMS).
4) Mezcla -> audio/mezcla.wav y vídeo final con -c:v copy -> que_es_escaparate_de_tudela_con_audio.mp4
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

# ---------- efectos por escena (nombre -> se puede sustituir con audio/sfx/<nombre>.wav) ----------
SFX_DIR = os.path.join(A, 'sfx')
def S(name, synth):
    p = os.path.join(SFX_DIR, name + '.wav')
    if os.path.exists(p): return norm(read_any(p))
    return synth()

def build_sfx():
    fx = np.zeros(N)
    def T(sc, t): return starts[sc] + t
    d1 = ends[1] - starts[1]
    # 1) ciudad soleada: ambiente, pájaros, campanas lejanas; «pop» suave del logo
    add(fx, S('ambiente_ciudad', lambda: street(d1)) * adsr(d1, 0.3, 0.05), starts[1], 0.10)
    add(fx, S('pajaros', lambda: birdsong(d1)), starts[1], 0.06)
    for k, t0 in enumerate([0.15, 1.6]): add(fx, S('campana', lambda: bell_church(330 if k == 0 else 294)) , T(1, t0), 0.10)
    add(fx, S('pop', lambda: pop(420, 1100, 0.1)), T(1, 0.3), 0.35)
    # 2) «pop» + «whoosh» por cada tarjeta (lanzamientos de escenes.js: L2) y «pop» suave al encajar
    for L in [0.45, 2.15, 3.05, 4.75]:
        add(fx, S('pop', lambda: pop(500, 1300)), T(2, L), 0.45)
        add(fx, S('whoosh', lambda: whoosh(0.55)), T(2, L + 0.02), 0.4)
        add(fx, S('pop_suave', lambda: pop(700, 1000, 0.07)), T(2, L + 0.55), 0.22)
    # 3) notificaciones a la vez, vibraciones, roce de móviles y murmullo
    d3 = ends[3] - starts[3]
    add(fx, S('murmullo', lambda: murmur(d3)) * adsr(d3, 0.4, 0.3), starts[3], 0.16)
    for i in range(10):
        arr = 1.1 + i * 0.07
        add(fx, S('ding', lambda: notif(rng.choice([880, 988, 1175, 1319, 1047, 1397]))), T(3, arr), 0.16)
        add(fx, S('vibracion', lambda: buzz(0.6)), T(3, arr + 0.01), 0.09)
        add(fx, S('roce_movil', lambda: rustle(0.32)), T(3, arr + 0.66), 0.13)
    for k in range(5): add(fx, S('whoosh', lambda: whoosh(0.4)), T(3, 0.55 + k * 0.12), 0.1)
    # 4) tres «tap» ascendentes y «whoosh» suave con cada fachada
    for k, tp in enumerate([1.0, 2.1, 3.2]):
        add(fx, S('tap_%d' % (k + 1), lambda: tap([700, 880, 1100][k])), T(4, tp), 0.5)
        add(fx, S('whoosh', lambda: whoosh(0.45)), T(4, tp + 0.03), 0.22)
        add(fx, S('pop_suave', lambda: pop(600, 900, 0.07)), T(4, tp + 0.45), 0.2)
    # 5) «ting» brillante de remate
    add(fx, S('ting', ting), T(5, 0.35), 0.35)
    # 6) «whoosh» de la franja y del logo, clic del cursor, «pop» del sobre
    sw, cut = SC[6].get('swap', 4.0), SC[6].get('cut', 8.0)
    add(fx, S('whoosh', lambda: whoosh(0.5)), T(6, 0.75), 0.3)
    add(fx, S('tap_1', lambda: tap(900)), T(6, 2.3), 0.35)
    add(fx, S('pop', lambda: pop(450, 1200)), T(6, sw + 0.3), 0.5)
    add(fx, S('whoosh', lambda: whoosh(0.6)), T(6, cut - 0.42), 0.5)
    add(fx, S('pop', lambda: pop(380, 1000, 0.1)), T(6, cut + 0.02), 0.3)
    return fx

# ---------- música de fondo suave sintetizada (114 bpm, C-G-Am-F) ----------
def synth_music():
    bpm = 114; beat = 60 / bpm; bar = 4 * beat
    out = np.zeros(N)
    chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    # intensidad por escena: (pad, arpegio, bajo, bombo, palmas/charles)
    L = {1: (1, .5, 0, 0, 0), 2: (1, .8, .5, .4, 0), 3: (1, 1, .9, .9, .6), 4: (1, 1, 1, 1, .8), 5: (1, 1, 1, 1, .9), 6: (1, 1, 1, 1, 1)}
    def lvl(t):
        for sc in SC:
            if starts[sc] <= t < ends[sc]: return L[sc]
        return L[6]
    nb = int(TOTAL / bar) + 2
    for b in range(nb):
        t0 = b * bar
        if t0 >= TOTAL: break
        ch = chords[b % 4]
        pad, arp, bas, kik, hat = lvl(t0)
        if starts[2] <= t0 < ends[2]:  # escena 2 va creciendo
            u = (t0 - starts[2]) / (ends[2] - starts[2]); arp *= 0.6 + 0.4 * u; bas *= u * 1.4; kik *= u * 1.8
        # pad suave
        d = bar + 0.3; t = tt(d); x = 0
        for m in ch:
            for det in (-0.12, 0.12): x = x + np.sin(2 * np.pi * hz(m) * (1 + det / 100) * t) + 0.25 * np.sin(2 * np.pi * hz(m + 12) * t)
        add(out, x * adsr(d, 0.25, 0.4) * 0.05 * pad, t0)
        # arpegio luminoso (corcheas)
        notes = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12, ch[0] + 24, ch[2] + 12, ch[1] + 12, ch[2] + 12]
        for i, m in enumerate(notes):
            dd = 0.45; tq = tt(dd)
            y = (np.sin(2 * np.pi * hz(m) * tq) + 0.3 * np.sin(4 * np.pi * hz(m) * tq)) * np.exp(-tq / 0.18) * adsr(dd, 0.003)
            add(out, y * 0.06 * arp, t0 + i * beat / 2)
        for i in range(4):
            tb = t0 + i * beat
            if bas > 0:
                dd = beat * 0.9; tq = tt(dd)
                add(out, np.sin(2 * np.pi * hz(ch[0] - 24) * tq) * adsr(dd, 0.01, 0.1) * 0.16 * bas, tb)
            if kik > 0:
                dd = 0.25; tq = tt(dd); f = 50 + 90 * np.exp(-tq / 0.03)
                add(out, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tq / 0.09) * 0.22 * kik, tb)
            if hat > 0:
                add(out, band(noise(0.04), 6000, 12000) * edec(0.04, 0.012) * 0.05 * hat, tb + beat / 2)
                if i % 2 == 1: add(out, band(noise(0.12), 900, 4000) * edec(0.12, 0.04) * 0.10 * hat, tb)
    # remate de la escena 5 y acorde final que se apaga
    add(out, ting() * 0.08, starts[5] + 0.3)
    fin = ends[6]; dd = 2.5; tq = tt(dd); x = 0
    for m in [48, 60, 64, 67, 72]: x = x + np.sin(2 * np.pi * hz(m) * tq)
    add(out, x * np.exp(-tq / 0.9) * 0.05, fin - 2.0)
    fade = np.ones(N); nf = int(0.6 * SR); fade[-nf:] = np.linspace(1, 0, nf)
    return out * fade

def read_any(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
def write_wav(path, x):
    y = np.clip(x, -1, 1)
    st = np.repeat((y * 32767).astype(np.int16)[:, None], 2, axis=1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
def rms_db(x): return 20 * math.log10(max(1e-9, float(np.sqrt(np.mean(x ** 2))))) if len(x) else -180

VOICES = [('narradora_1', 1), ('narradora_2', 2), ('narradora_3', 3), ('narradora_4', 4), ('narradora_5', 6)]
LEAD = 0.12
def find_voice(stem):
    for ext in ('wav', 'mp3', 'm4a', 'ogg', 'flac', 'aac'):
        for p in glob.glob(os.path.join(A, 'voces', f'{stem}.{ext}')) + glob.glob(os.path.join(A, 'voces', f'{stem}_*.{ext}')):
            return p
    return None

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
        t0 = max(starts[sc] + (0.05 if sc == 1 else LEAD), last_end + 0.2)
        add(vo, x, t0); t1 = t0 + len(x) / SR; last_end = t1
        print(f'  {stem:12s} escena {sc}: {t0:6.2f} -> {t1:6.2f} s' + ('   ¡se pasa del final de la escena (%.2f s)!' % ends[sc] if t1 > ends[sc] else ''))

    mus_path = os.path.join(A, 'musica.mp3')
    if os.path.exists(mus_path):
        m = read_any(mus_path); m = np.tile(m, int(np.ceil(N / len(m))))[:N]
        lv = {1: -7, 2: -4, 3: -1, 4: 0, 5: 1, 6: 1}
        g = np.zeros(N)
        for sc, db in lv.items(): g[int(starts[sc] * SR):int(ends[sc] * SR)] = 10 ** (db / 20)
        g = np.convolve(g, np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same')
        music = m * g; print('música: audio/musica.mp3 con automatización por escena')
    else:
        music = synth_music(); write_wav(os.path.join(A, 'musica_sintetizada.wav'), norm(music, 0.9))
        print('música: no hay audio/musica.mp3 -> música de fondo suave sintetizada (básica) -> audio/musica_sintetizada.wav')

    have_voice = np.any(vo != 0)
    v_db = rms_db(vo[np.abs(vo) > 0.02]) if have_voice else -18.0     # referencia sin voces
    mix = vo.copy()
    mix += fx * 10 ** ((v_db - 12 - rms_db(fx[np.abs(fx) > 1e-4])) / 20)          # efectos ~12 dB bajo la voz
    mus_db = rms_db(music[np.abs(music) > 1e-4])
    mg = 10 ** ((v_db - 17 - mus_db) / 20)                                         # música ~17 dB bajo la voz
    env = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(int(0.3 * SR)) / int(0.3 * SR), 'same')
    duck = 1 - 0.3 * np.clip(env * 3, 0, 1)
    mix += music * mg * duck
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
