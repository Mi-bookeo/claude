#!/usr/bin/env python3
"""Pista de sonido de «Rosa y la cola de pasteles» (sin recodificar la imagen).

  python3 audio/make_audio.py

1) Voces: audio/voces/<voz>_<n>.(mp3|wav|m4a|ogg|flac), colocadas al inicio de su escena (timeline.txt).
2) Efectos: audio/sfx/<nombre>.wav si existe; si no, se sintetizan (básicos) -> audio/efectos.wav
3) Música: audio/musica.mp3 si existe (con automatización por escena, 15-20 dB por debajo de las voces);
   si no existe, no hay música.
4) Mezcla -> audio/mezcla.wav y vídeo final con -c:v copy -> rosa_y_la_cola_de_pasteles_con_audio.mp4
   Si faltan voces, se avisa y solo se genera una vista previa con efectos (rosa_y_la_cola_de_pasteles_solo_efectos.mp4).
"""
import glob, json, math, os, subprocess, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, 'audio')
SR = 48000
cfg = json.load(open(os.path.join(ROOT, 'config.json')))
FPS = cfg['fps']

# ---------- tiempos de escena (mismo cálculo que render.js) ----------
starts, ends, fr = {}, {}, 0
for s in cfg['scenes']:
    n = round(s['duration'] * FPS)
    starts[s['id']] = fr / FPS
    ends[s['id']] = (fr + n) / FPS
    fr += n
TOTAL = fr / FPS
N = int(round(TOTAL * SR))
rng = np.random.default_rng(7)

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

# ---------- efectos por escena ----------
def build_sfx():
    fx = np.zeros(N)
    s = starts
    def T(sc, t): return s[sc] + t
    # 1) ambiente de calle tranquila y campanas lejanas
    add(fx, street(ends[1] - s[1]) * adsr(ends[1] - s[1], 0.3, 0.05), s[1], 0.10)
    for k, t0 in enumerate([0.25, 1.15, 2.05]): add(fx, bell_church(330 if k % 2 == 0 else 294), T(1, t0), 0.22)
    for t0 in [0.6, 0.75, 2.4]: add(fx, chirp(), T(1, t0), 0.05)
    # 2) tic-tac del reloj y suspiro
    for i in range(6): add(fx, tick(i % 2 == 0), T(2, 0.05 + i * 0.5), 0.28)
    add(fx, sigh(), T(2, 1.0), 0.35)
    # 3) «ding» de bombilla
    add(fx, ding(1568), T(3, 0.3), 0.45)
    # 4) tecleo rápido, «pop» al pulsar y «ding» del tic verde
    add(fx, typing(1.05, 15), T(4, 0.02), 0.32)
    add(fx, typing(0.5, 16), T(4, 1.1 + 0.55), 0.3)
    add(fx, pop(450, 1200), T(4, 1.1 + 1.32), 0.6)
    add(fx, ding(1046, 0.5), T(4, 1.1 + 1.45), 0.4); add(fx, ding(1568, 1.0), T(4, 1.1 + 1.55), 0.45)
    # 5) muchas notificaciones a la vez
    for i, f in enumerate([880, 988, 1175, 1319, 784, 1047, 1397]):
        add(fx, notif(f), T(5, 0.3 + i * 0.045 + rng.uniform(0, 0.03)), 0.18)
    for i in range(4): add(fx, buzz(0.6), T(5, 0.32 + i * 0.03), 0.12)
    for i, f in enumerate([1047, 1319, 880]): add(fx, notif(f), T(5, 0.62 + i * 0.07), 0.12)
    # 6) pasos y carreras, murmullo creciente, tic-tac que se acelera
    d6 = ends[6] - s[6]
    for j in range(1, 12):
        tj = 0.12 + (j - 1) * 0.27
        for k in range(4): add(fx, step(), T(6, tj + k * 0.15), 0.22 * rng.uniform(.7, 1))
    tm = murmur(d6); add(fx, tm * np.linspace(0.15, 1, len(tm)) ** 1.3, s[6], 0.22)
    t, i, iv = 0.05, 0, 0.5
    while t < d6 - 0.05:
        add(fx, tick(i % 2 == 0), T(6, t), 0.25); t += iv; iv = max(0.14, iv * 0.86); i += 1
    # 7) campanilla repetida, «cha-ching», papel de bolsas, «pop» por cada pastel
    d7 = ends[7] - s[7]
    add(fx, murmur(d7), s[7], 0.12)
    P7, T07 = 0.92, 0.25
    n = 0
    while T07 + n * P7 < d7:
        cs = T07 + n * P7
        add(fx, paper(0.26), T(7, cs + 0.02), 0.22)
        add(fx, cha_ching(), T(7, cs + 0.14), 0.32)
        add(fx, shop_bell(), T(7, cs + 0.3), 0.22)
        n += 1
    for k in range(14): add(fx, pop(rng.uniform(500, 800), rng.uniform(1300, 1900), 0.08), T(7, 0.35 + k * 0.31), 0.35)
    # 8) carrera, derrape, campanilla y «clac» del cartel
    for k in range(4): add(fx, step(), T(8, 0.05 + k * 0.13), 0.22)
    add(fx, skid(0.42), T(8, 0.53), 0.42)
    add(fx, shop_bell(), T(8, 0.9), 0.2); add(fx, shop_bell(), T(8, 2.3), 0.18)
    for k in range(6): add(fx, step(0.8), T(8, 2.08 + k * 0.17), 0.16)
    add(fx, clac(), T(8, 2.93), 0.5)
    # 9) lluvia de monedas, confeti y «tachán» corto
    add(fx, popper(), T(9, 0.1), 0.35)
    add(fx, tachan(), T(9, 0.3), 0.42)
    for k in range(34): add(fx, coin_clink(), T(9, 0.2 + rng.uniform(0, 2.4)), 0.16 * rng.uniform(.5, 1))
    add(fx, paper(1.8) * adsr(1.8, 0.2, 0.6), T(9, 0.3), 0.08)
    # 10) «whoosh» al entrar el logo
    cut = next(x for x in cfg['scenes'] if x['id'] == 10).get('cut', 6.0)
    add(fx, whoosh(0.6), T(10, cut - 0.42), 0.5)
    return fx

def read_any(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)
def write_wav(path, x):
    y = np.clip(x, -1, 1)
    st = np.repeat((y * 32767).astype(np.int16)[:, None], 2, axis=1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
def rms_db(x): return 20 * math.log10(max(1e-9, float(np.sqrt(np.mean(x ** 2)))))

# voz -> (escena, orden dentro de la escena)
VOICES = [('narradora_1', 1), ('narradora_2', 2), ('narradora_3', 3), ('rosa_1', 4), ('narradora_4', 4), ('narradora_5', 5),
          ('narradora_6', 6), ('rosa_2', 7), ('marta_1', 8), ('narradora_7', 8), ('rosa_3', 9), ('narradora_8', 10)]
LEAD, GAP = 0.12, 0.25  # margen al inicio de la escena y pausa entre dos frases de la misma escena

def find_voice(stem):
    for ext in ('wav', 'mp3', 'm4a', 'ogg', 'flac', 'aac'):
        for p in glob.glob(os.path.join(A, 'voces', f'{stem}.{ext}')) + glob.glob(os.path.join(A, 'voces', f'{stem}_*.{ext}')):
            return p
    return None

def main():
    os.makedirs(A, exist_ok=True)
    sfx_dir = os.path.join(A, 'sfx')
    if os.path.isdir(sfx_dir) and glob.glob(os.path.join(sfx_dir, '*')):
        print('AVISO: hay audio/sfx/, pero este script aún no asigna esos archivos a escenas; se usan los efectos sintetizados.')
    fx = build_sfx()
    write_wav(os.path.join(A, 'efectos.wav'), fx)
    print('efectos sintetizados (básicos) -> audio/efectos.wav')

    vo = np.zeros(N); missing = []; cursor = {}; report = []
    for stem, sc in VOICES:
        p = find_voice(stem)
        if not p: missing.append(stem); continue
        x = read_any(p)
        nz = np.where(np.abs(x) > 0.01)[0]
        if len(nz): x = x[max(0, nz[0] - 240): nz[-1] + 2400]   # recorta silencios
        t0 = cursor.get(sc, starts[sc] + LEAD)
        add(vo, x, t0)
        t1 = t0 + len(x) / SR; cursor[sc] = t1 + GAP
        report.append((stem, sc, t0, t1, t1 > ends[sc] + 1e-3))
    for stem, sc, t0, t1, over in report:
        print(f'  {stem:12s} escena {sc:2d}: {t0:6.2f} -> {t1:6.2f} s' + ('   ¡se pasa del final de la escena (%.2f s)!' % ends[sc] if over else ''))

    mus_path = os.path.join(A, 'musica.mp3')
    music = None
    if os.path.exists(mus_path):
        m = read_any(mus_path)
        m = np.tile(m, int(np.ceil(N / len(m))))[:N] if len(m) < N else m[:N]
        # automatización por escena (dB relativos): baja/tensa -> sube -> ritmo -> máxima -> tensión/remate -> celebración -> cierre
        lv = {1: -6, 2: -6, 3: -3, 4: -2, 5: -1, 6: 1, 7: 2, 8: 0, 9: 1, 10: 1}
        g = np.zeros(N)
        for sc, db in lv.items(): g[int(starts[sc] * SR):int(ends[sc] * SR)] = 10 ** (db / 20)
        g = np.convolve(g, np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same')
        g[int(starts[3] * SR):int(ends[3] * SR)] *= np.linspace(10 ** (-3 / 20), 1, int(ends[3] * SR) - int(starts[3] * SR))
        music = m * g
        print('música: audio/musica.mp3 con automatización por escena')
    else:
        print('música: no existe audio/musica.mp3 -> sin música')

    have_voice = np.any(vo != 0)
    if have_voice:
        vact = vo[np.abs(vo) > 0.02]; v_db = rms_db(vact)
        fx_g = 10 ** ((v_db - 12 - rms_db(fx[np.abs(fx) > 1e-4])) / 20)   # efectos ~12 dB bajo la voz (media)
        mix = vo + fx * fx_g
        if music is not None:
            mus_db = rms_db(music[np.abs(music) > 1e-4])
            mg = 10 ** ((v_db - 17 - mus_db) / 20)                           # música ~17 dB bajo la voz
            env = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(int(0.3 * SR)) / int(0.3 * SR), 'same')
            duck = 1 - 0.3 * np.clip(env * 3, 0, 1)                          # ducking suave bajo las frases
            mix += music * mg * duck
            print(f'música colocada {v_db - (rms_db((music * mg)[np.abs(music) > 1e-4])):.1f} dB por debajo de la voz (RMS)')
    else:
        mix = fx * 0.9
    mix_path = os.path.join(A, 'mezcla.wav'); write_wav(mix_path, norm(mix, 0.89))
    # normalización de sonoridad (-14 LUFS, pico -1 dBTP) y unión con el vídeo sin recodificar la imagen
    video = os.path.join(ROOT, cfg['output'])
    out = os.path.join(ROOT, cfg['output'].replace('.mp4', '_con_audio.mp4' if have_voice and not missing else '_solo_efectos.mp4'))
    tmp = out.replace('.mp4', '.partial.mp4')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', video, '-i', mix_path, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
                    '-af', 'loudnorm=I=-14:TP=-1:LRA=11,aresample=48000', '-c:a', 'aac', '-b:a', '192k', '-t', f'{TOTAL:.3f}',
                    '-movflags', '+faststart', tmp], check=True)
    os.replace(tmp, out)
    print('->', os.path.relpath(out, ROOT))
    if missing:
        print('FALTAN VOCES en audio/voces/:', ', '.join(missing))
        print('Cuando estén, vuelve a ejecutar el script para generar', cfg['output'].replace('.mp4', '_con_audio.mp4'))
        sys.exit(2)

if __name__ == '__main__':
    main()
