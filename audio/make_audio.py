#!/usr/bin/env python3
"""Pista de sonido del vídeo 11 y vídeo con audio (la imagen NO se vuelve a codificar: -c:v copy).
   1) Voces: audio/voces/marta_<n>.(wav|mp3|m4a|ogg|flac) al inicio de la escena n (n = 1..7), igualadas a
      -20 dBFS RMS. Las que falten quedan en silencio (se avisa). Si una frase es más larga que su escena, se avisa
      para ajustar config.json (duración, planos y tramos «talk») y volver a renderizar esa escena.
   2) Efectos: audio/sfx/<nombre>.wav si existe; si no, se sintetizan (básicos) -> audio/efectos.wav.
   3) Música: audio/musica.mp3 si existe; si no, audio/musica.wav (make_music.py, sintetizada).
      Queda ~18 dB por debajo de la voz y baja 2 dB más mientras habla Marta.
   Salida: audio/mezcla.wav y marta_cuatro_motivos_con_audio.mp4 (AAC 192 kb/s)."""
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
rng = np.random.default_rng(7)
st = lambda i: SC[i - 1]['start']
shot = lambda i, k: SC[i - 1]['start'] + SC[i - 1]['shots'][k][0]

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<f4').astype(np.float64)
def db(x): return 20 * np.log10(max(x, 1e-9))
def rms_active(x):
    if len(x) == 0: return 0
    fr_ = x[: len(x) // 480 * 480].reshape(-1, 480); r = np.sqrt((fr_ ** 2).mean(1))
    act = r[r > r.max() * 0.1] if r.max() > 0 else r
    return np.sqrt((act ** 2).mean()) if len(act) else 0

# ---------------- voces ----------------
voice = np.zeros(N); missing = []; info = []
for i in range(1, 8):
    f = next((A('voces', f'marta_{i}.{e}') for e in ('wav', 'mp3', 'm4a', 'ogg', 'flac') if os.path.exists(A('voces', f'marta_{i}.{e}'))), None)
    if not f: missing.append(f'marta_{i}'); continue
    v = load(f); v *= 10 ** (-20 / 20) / max(rms_active(v), 1e-6)
    d, sd = len(v) / SR, SC[i - 1]['duration']
    info.append(f'marta_{i}: {d:.2f} s en escena {i} ({sd:.2f} s)' + ('  <-- MÁS LARGA QUE LA ESCENA: ajusta config.json' if d + 0.15 > sd else ''))
    a = int((st(i) + SC[i - 1].get('voice', {}).get('start', 0.15)) * SR); voice[a:a + len(v)] += v[: N - a]
if missing: print('AVISO: faltan voces (quedan en silencio):', ', '.join(missing))
for l in info: print(l)

# ---------------- efectos ----------------
def t_(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def lp(x, a):  # paso bajo de un polo
    y = np.empty_like(x); acc = 0.0
    for k in range(len(x)): acc += a * (x[k] - acc); y[k] = acc
    return y
def hp(x, a): return x - lp(x, a)
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
    elif name == 'ting':
        t = t_(0.9); s = sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * 6) * (t >= o) for fq, o in ((1760, 0), (2349, 0.11)))
    elif name == 'carton':  # cartón que se abre: roce grave + dos golpecitos de solapa
        d = 0.55; t = t_(d); s = lp(noise(d), 0.08) * np.exp(-((t - 0.18) / 0.12) ** 2) * 3
        for o in (0.08, 0.32): s += lp(noise(d), 0.3) * np.exp(-np.maximum(t - o, 0) * 60) * (t >= o) * 1.2
    elif name == 'clac':
        t = t_(0.2); s = (hp(noise(0.2), 0.3) * 0.8 + np.sin(2 * np.pi * 180 * t)) * np.exp(-t * 45)
    elif name == 'chaching':
        t = t_(1.2); s = hp(noise(1.2), 0.5) * np.exp(-t * 30) * 0.5
        for o in (0.12, 0.2):
            tt = np.maximum(t - o, 0); s += (t >= o) * sum(np.sin(2 * np.pi * fq * tt) * np.exp(-tt * 4) for fq in (2093, 2637, 3136)) * 0.4
    elif name == 'guitarra':  # Karplus-Strong: unas notas suaves
        d = 3.0; s = np.zeros(int(d * SR))
        for k, (m, o) in enumerate([(52, 0), (59, 0.35), (64, 0.7), (67, 1.05), (64, 1.4), (59, 1.75), (55, 2.1), (62, 2.45)]):
            fq = 440 * 2 ** ((m - 69) / 12); p_ = int(SR / fq); buf = rng.uniform(-1, 1, p_); out = np.zeros(int(1.2 * SR))
            for j in range(len(out)):
                out[j] = buf[j % p_]; buf[j % p_] = 0.996 * 0.5 * (buf[j % p_] + buf[(j + 1) % p_])
            a = int(o * SR); s[a:a + len(out)] += out[: len(s) - a] * 0.5
    elif name == 'murmullo':  # murmullo de bar: ruido filtrado con modulación lenta de «voces»
        d = 3.2; t = t_(d); s = lp(noise(d), 0.05) * (0.6 + 0.4 * np.sin(2 * np.pi * 2.3 * t) * np.sin(2 * np.pi * 0.7 * t)) * 2.2
        s *= np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.4)
    elif name == 'cling':
        t = t_(1.4); s = sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * 3.5) for fq in (2637, 3520, 4186)) * 0.35 + hp(noise(1.4), 0.6) * np.exp(-t * 80) * 0.4
    elif name == 'latido':  # pum-pum suave
        t = t_(0.5); s = np.zeros(len(t))
        for o, g in ((0, 1), (0.18, 0.7)):
            tt = np.maximum(t - o, 0); s += (t >= o) * np.sin(2 * np.pi * (55 + 30 * np.exp(-tt * 25)) * tt) * np.exp(-tt * 16) * g
    elif name == 'aplausos':
        d = 6.0; t = t_(d); s = np.zeros(len(t))
        for k in range(420):
            o = rng.uniform(0, d - 0.1); a = int(o * SR); n_ = int(0.03 * SR)
            s[a:a + n_] += hp(rng.standard_normal(n_), 0.4) * np.exp(-np.arange(n_) / SR * 120) * rng.uniform(0.3, 1)
        s = lp(s, 0.35) * np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 1.2)
    elif name == 'risas':  # risas lejanas: «ja-ja» con formantes simples
        d = 5.5; t = t_(d); s = np.zeros(len(t))
        for o in (0.4, 1.9, 3.3, 4.4):
            for j in range(4):
                a = o + j * 0.15; tt = np.maximum(t - a, 0); g = (t >= a) * (tt < 0.11)
                f0 = 260 + 40 * rng.uniform() - j * 10
                s += g * np.sin(2 * np.pi * f0 * tt) * np.sin(np.pi * np.minimum(tt / 0.11, 1)) * (np.sin(2 * np.pi * 800 * tt) * 0.3 + 1)
        s = lp(s, 0.2) * 0.5
    elif name == 'confeti':
        d = 1.2; t = t_(d); s = hp(noise(d), 0.5) * (0.5 + 0.5 * (rng.uniform(size=len(t)) > 0.97)) * np.exp(-t * 2.5) * 0.4
    elif name == 'tachan':  # «ta-chán»: dos acordes de metal suave
        t = t_(1.6); s = np.zeros(len(t))
        for o, notes, dd in ((0, (523, 659, 784), 0.18), (0.22, (523, 659, 784, 1047), 1.3)):
            tt = np.maximum(t - o, 0); g = (t >= o) * np.exp(-tt * (1.2 if dd > 1 else 14)) * np.minimum(1, tt / 0.01)
            for fq in notes: s += g * (np.sin(2 * np.pi * fq * tt) + 0.4 * np.sin(4 * np.pi * fq * tt) + 0.2 * np.sin(6 * np.pi * fq * tt))
        s *= 0.25
    elif name == 'whoosh':
        d = 0.5; t = t_(d); s = np.zeros(len(t)); x = noise(d); acc = 0.0
        for k in range(len(t)):  # filtro que barre de grave a agudo
            a = 0.02 + 0.25 * (k / len(t)); acc += a * (x[k] - acc); s[k] = acc
        s *= np.sin(np.pi * t / d) ** 2 * 2.2
    else: raise KeyError(name)
    SYN[name] = s.astype(np.float64); return SYN[name]

fx = np.zeros(N)
EV = []
def ev(name, t, g_db=0.0): EV.append((name, t, g_db))
# 1) pop en el título y en cada círculo
cue = lambda i, k, d: SC[i - 1].get('cues', {}).get(k, d)
ev('pop', st(1) + cue(1, 'title1', 0.2), -4); ev('pop_s', st(1) + cue(1, 'title2', 0.5), -6)
for k in range(3): ev('pop', st(1) + cue(1, 'circles', 1.1) + 0.22 * k, -3)
ev('pop', st(1) + cue(1, 'four', 1.85), 0); ev('ding', st(1) + cue(1, 'four', 1.85) + 0.05, -10)
# 2-5) ding brillante en cada número (y pop del rótulo)
for i in (2, 3, 4, 5): ev('ding', st(i) + 0.1, -4); ev('pop_s', st(i) + 0.38, -8)
# 2) cartón que se abre y «ting» de notificación
B2 = shot(2, 'B'); ev('carton', B2 + 0.05, -2); ev('pop_s', B2 + 0.5, -10); ev('ting', B2 + 1.05, -5); ev('ting', B2 + 2.9, -9); ev('pop_s', B2 + 0.4, -10)
# 3) «clac» del cartel 2x1 y «cha-ching»
B3 = shot(3, 'B'); ev('whoosh', B3 + 0.25, -10); ev('clac', B3 + 0.65, -2); ev('chaching', B3 + 0.85, -5); ev('pop_s', B3 + 0.4, -10)
# 4) guitarra suave, murmullo de bar y «cling» de copas
B4 = shot(4, 'B'); ev('murmullo', B4, -10); ev('guitarra', B4 + 0.05, -7); ev('cling', B4 + 1.3, -7); ev('pop_s', B4 + 0.4, -10)
# 5) ta-chán con el sello, latido, aplausos y risas lejanas, confeti
ev('tachan', st(5) + 0.6, -5)
B5, C5 = shot(5, 'B'), shot(5, 'C')
k = 0
while B5 + 0.15 + k / 1.3 < C5: ev('latido', B5 + 0.15 + k / 1.3, -9); k += 1
ev('aplausos', B5 + 0.3, -13); ev('risas', B5 + 0.6, -18); ev('confeti', B5 + 0.2, -10); ev('confeti', B5 + 3.2, -12)
ev('pop', B5 + 0.35, -8); ev('pop', B5 + 0.55, -8); ev('tachan', B5 + 1.0, -9)
ev('latido', C5 + 0.1, -10)
# 6) whoosh + pop del globo «CANAL»
ev('pop_s', st(6) + cue(6, 'comenta', 0.2), -8); ev('whoosh', st(6) + cue(6, 'bubble', 0.75) - 0.2, -6); ev('pop', st(6) + cue(6, 'bubble', 0.75) + 0.03, -2)
ev('pop_s', st(6) + cue(6, 'pill', 2.1), -9); ev('pop_s', st(6) + cue(6, 'enviamos', 1.4), -11)
# 7) pop por burbuja y whoosh del avioncito; whoosh del logo final
P1 = shot(7, 'P1'); q = (SC[6]['shots']['P1'][1] - SC[6]['shots']['P1'][0]) / 4; ev('pop_s', P1 + 0.45 * q, -7)
for k in range(4):
    ev('whoosh', P1 + (0.85 + 0.32 * k) * q, -11); ev('pop', P1 + (1.15 + 0.32 * k) * q, -5); ev('pop_s', P1 + (2.2 + 0.28 * k) * q, -10)
ev('pop_s', shot(7, 'P2') + 0.1, -8)
ev('whoosh', shot(7, 'FIN') - 0.15, -3); ev('ding', shot(7, 'FIN') + 0.1, -9)
for name, t, g in EV:
    s = syn(name); s = s / max(np.abs(s).max(), 1e-9) * 10 ** ((g - 6) / 20)
    a = int(t * SR); fx[a:a + len(s)] += s[: max(0, N - a)]
synth = [n for n in SYN if not os.path.exists(A('sfx', n + '.wav'))]
if synth: print('AVISO: efectos sintetizados con código (básicos):', ', '.join(sorted(synth)))

# ---------------- música ----------------
mp = A('musica.mp3') if os.path.exists(A('musica.mp3')) else A('musica.wav')
if not mp.endswith('.mp3'): subprocess.run(['python3', A('make_music.py')], check=True)  # sintetizada: siempre con los tiempos actuales
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
mus = np.frombuffer(raw, '<f4').astype(np.float64).reshape(-1, 2)
mus = np.vstack([mus, np.zeros((max(0, N - len(mus)), 2))])[:N]
# nivel: -38 dBFS RMS (≈ 18 dB bajo la voz a -20) y baja 2 dB más mientras habla Marta
mus *= 10 ** (-38 / 20) / max(np.sqrt((mus ** 2).mean()), 1e-9)
env = np.abs(voice); win = int(0.25 * SR); env = np.convolve(env, np.ones(win) / win, 'same')
duck = 10 ** (-2 * np.clip(env / 0.02, 0, 1) / 20)
mus *= duck[:, None]
# plano del bar (escena 4, plano B): música 5 dB más baja para que se oiga la guitarra y el ambiente
BAR_DB = -5.0
g = np.ones(N); b0, b1 = shot(4, 'B'), SC[3]['start'] + SC[3]['shots']['B'][1]; tt = np.arange(N) / SR
g = 10 ** (BAR_DB * np.clip(np.minimum((tt - b0 + 0.25) / 0.25, (b1 + 0.25 - tt) / 0.25), 0, 1) / 20)
mus *= g[:, None]
print(f'música: {os.path.relpath(mp, ROOT)}  RMS {db(np.sqrt((mus ** 2).mean())):.1f} dBFS')

mix = mus + (voice + fx)[:, None] * np.array([1.0, 1.0])
pk = np.abs(mix).max()
if pk > 0.95: mix *= 0.95 / pk
with wave.open(A('mezcla.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
with wave.open(A('efectos.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(fx, -1, 1) * 32767).astype('<i2').tobytes())
vid = os.path.join(ROOT, cfg['output']); BASE = vid[:-4]; out = BASE + '_con_audio.mp4'; tmp = out.replace('.mp4', '.partial.mp4')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', vid, '-i', A('mezcla.wav'), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
                '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, out)
print('->', os.path.relpath(out, ROOT), f'({TOTAL:.2f} s)')
# versión subtitulada (si se ha renderizado con: node render.js subs)
mudo = os.path.join(ROOT, 'tmp', 'subtitulado_mudo.mp4')
if os.path.exists(mudo) and os.path.getmtime(mudo) >= os.path.getmtime(vid):
    out = BASE + '_subtitulado.mp4'; tmp = out.replace('.mp4', '.partial.mp4')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', mudo, '-i', A('mezcla.wav'), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
                    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], check=True)
    os.replace(tmp, out); print('->', os.path.relpath(out, ROOT))
