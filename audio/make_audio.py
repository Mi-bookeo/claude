#!/usr/bin/env python3
"""Pista de sonido del vídeo 12 «Marta y la cesta de bebé» y vídeo con audio (la imagen NO se vuelve a codificar: -c:v copy).
   1) Voces: una frase por escena según config.json ('voice', lo escribe cortar_voces.py), igualadas a -20 dBFS RMS:
      narradora_1→1, narradora_2→2, marta_1→3, narradora_3→4, (5 sin voz), narradora_4→6, (7 sin voz), marta_2→8, marta_3→9.
   2) Efectos: audio/sfx/<nombre>.wav si existe; si no, se sintetizan con código (básicos) -> audio/efectos.wav.
   3) Música: audio/musica.mp3 si existe; si no, audio/musica.wav (make_music.py, sintetizada, suave).
      Queda ~17 dB por debajo de las voces, baja 3 dB más mientras hay voz y otros 3 dB bajo la voz de Marta en la escena 9.
   Salida: audio/mezcla.wav y marta_cesta_bebe_con_audio.mp4 (AAC 192 kb/s)."""
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
# una frase por escena según config.json ('voice': archivo e inicio dentro de la escena; lo escribe cortar_voces.py)
voice = np.zeros(N); vmask = np.zeros(N); missing = []; info = []
for i, sc in enumerate(SC, 1):
    vo = sc.get('voice')
    if not vo: info.append(f'escena {i}: sin voz (solo efectos)'); continue
    f = os.path.join(ROOT, vo['file'])
    if not os.path.exists(f): missing.append(vo['file']); continue
    v = load(f); v *= 10 ** (-20 / 20) / max(rms_active(v), 1e-6)
    d = len(v) / SR
    info.append(f'escena {i}: {os.path.basename(f)} {d:.2f} s desde {st(i) + vo["start"]:.2f} s' + ('  <-- MÁS LARGA QUE LA ESCENA' if vo['start'] + d > sc['duration'] else ''))
    a_ = int((st(i) + vo['start']) * SR); voice[a_:a_ + len(v)] += v[: N - a_]
    if 'marta' in vo['file']: vmask[a_:a_ + len(v)] = 1
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
    elif name == 'room':  # ambiente tranquilo de casa: rumor grave muy suave
        d = 5.0; t = t_(d); s = lp(noise(d), 0.01) * 6 + lp(noise(d), 0.08) * 0.25
        s *= np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4)
    elif name == 'clock':  # tic-tac lejano
        d = 5.0; t = t_(d); s = np.zeros(len(t))
        for k in range(10):
            o = 0.3 + k * 0.5; tt = np.maximum(t - o, 0)
            s += (t >= o) * np.sin(2 * np.pi * (2600 if k % 2 else 2200) * tt) * np.exp(-tt * 300) * (0.8 if k % 2 else 1)
        s = lp(s, 0.5)
    elif name == 'keys':  # tecleo suave de portátil
        d = 1.6; t = t_(d); s = np.zeros(len(t)); o = 0.0
        while o < d - 0.06:
            a_ = int(o * SR); n_ = int(0.03 * SR); s[a_:a_ + n_] += hp(rng.standard_normal(n_), 0.3) * np.exp(-np.arange(n_) / SR * 180) * rng.uniform(0.5, 1)
            o += rng.uniform(0.07, 0.16)
        s = lp(s, 0.4)
    elif name == 'scroll':  # rueda del ratón: trinquete
        d = 0.9; t = t_(d); s = np.zeros(len(t))
        for k in range(16):
            o = k * 0.05; a_ = int(o * SR); n_ = int(0.008 * SR); s[a_:a_ + n_] += hp(rng.standard_normal(n_), 0.5) * np.exp(-np.arange(n_) / SR * 600)
    elif name == 'buzz':  # vibración del móvil: dos zumbidos
        d = 1.0; t = t_(d); g = ((t % 0.5) < 0.34) * 1.0
        s = (np.sin(2 * np.pi * 150 * t) + 0.5 * np.sign(np.sin(2 * np.pi * 150 * t)) * 0.3) * g * (0.7 + 0.3 * np.sin(2 * np.pi * 26 * t))
        s = lp(s, 0.2)
    elif name == 'sting':  # «sting» cómico de sorpresa: silbido que sube + golpe brillante
        d = 0.9; t = t_(d); f = 500 + 1500 * np.minimum(t / 0.25, 1)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t < 0.28) * 0.6
        tt = np.maximum(t - 0.25, 0); s += (t >= 0.25) * sum(np.sin(2 * np.pi * fq * tt) for fq in (1047, 1319, 1568, 2093)) * np.exp(-tt * 4) * 0.3
        s += (t >= 0.25) * hp(noise(d), 0.5) * np.exp(-tt * 18) * 0.6
    elif name == 'swish':
        d = 0.32; t = t_(d); x = noise(d); s = np.zeros(len(t)); acc = 0.0
        for k in range(len(t)):
            a_ = 0.35 - 0.3 * (k / len(t)); acc += a_ * (x[k] - acc); s[k] = acc
        s *= np.sin(np.pi * t / d) ** 2 * 2
    elif name == 'tap':  # toque en la pantalla del móvil
        t = t_(0.04); s = (hp(noise(0.04), 0.4) * 0.6 + np.sin(2 * np.pi * 900 * t)) * np.exp(-t * 160)
    elif name == 'tic':  # tic de los puntos «escribiendo»
        t = t_(0.05); s = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 120)
    elif name == 'flip':  # hoja de papel que pasa
        d = 0.35; t = t_(d); s = hp(noise(d), 0.25) * np.exp(-((t - 0.1) / 0.07) ** 2) + hp(noise(d), 0.4) * np.exp(-np.maximum(t - 0.2, 0) * 50) * (t >= 0.2) * 0.7
    elif name == 'step':  # paso suave en la acera
        t = t_(0.12); s = (lp(noise(0.12), 0.15) * 2 + np.sin(2 * np.pi * 90 * t) * 0.6) * np.exp(-t * 45)
    elif name == 'bell':  # campanilla de la puerta: varios golpecitos metálicos
        d = 1.6; t = t_(d); s = np.zeros(len(t))
        for o, g in ((0, 1), (0.13, 0.8), (0.27, 0.6), (0.42, 0.4)):
            tt = np.maximum(t - o, 0); s += (t >= o) * g * sum(np.sin(2 * np.pi * fq * tt) * np.exp(-tt * dc) for fq, dc in ((2350, 5), (3420, 7), (5100, 11)))
        s *= 0.3
    elif name == 'toc':  # cesta de mimbre que se apoya en el mostrador
        t = t_(0.18); s = (lp(noise(0.18), 0.2) * 1.5 + np.sin(2 * np.pi * 220 * t)) * np.exp(-t * 40)
    elif name == 'murmullo_s':  # murmullo suave de farmacia
        d = 6.0; t = t_(d); s = lp(noise(d), 0.05) * (0.7 + 0.3 * np.sin(2 * np.pi * 1.7 * t) * np.sin(2 * np.pi * 0.4 * t)) * 2
        s *= np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4)
    elif name == 'dingj':  # «ding» alegre (dos notas que suben)
        t = t_(1.2); s = sum((t >= o) * np.sin(2 * np.pi * fq * np.maximum(t - o, 0)) * np.exp(-np.maximum(t - o, 0) * 4) for fq, o in ((1568, 0), (2093, 0.12), (2637, 0.24)))
    else: raise KeyError(name)
    SYN[name] = s.astype(np.float64); return SYN[name]

fx = np.zeros(N)
EV = []
def ev(name, t, g_db=0.0): EV.append((name, t, g_db))
cue = lambda i, k, d=0: SC[i - 1].get('cues', {}).get(k, d)
at = lambda i, k, d=0: st(i) + cue(i, k, d)
# 1) ambiente tranquilo de casa con reloj lejano; pop del título
ev('room', st(1), -16); ev('clock', st(1), -26); ev('pop', at(1, 'title'), -8); ev('pop_s', at(1, 'title2'), -10); ev('pop_s', at(1, 'think'), -11)
# 2) tecleo suave y scroll del ratón
ev('room', st(2), -18); ev('keys', st(2) + 0.1, -14); ev('scroll', st(2) + 1.7, -12); ev('scroll', st(2) + 3.0, -13); ev('pop', at(2, 'title'), -9)
for k in range(3): ev('pop_s', at(2, 'q') + 0.25 * k, -11)
# 3) vibración, ding de notificación y «sting» de sorpresa en el WOW
ev('buzz', at(3, 'buzz'), -10); ev('ding', at(3, 'notif'), -8); ev('sting', at(3, 'wow') - 0.25, -6)
# 4) pop al pulsar «WhatsApp» y swish del cambio de pantalla; pop del mensaje
ev('pop', at(4, 'seal'), -12); ev('tap', at(4, 'press'), -6); ev('pop', at(4, 'press') + 0.02, -4); ev('swish', at(4, 'cut') - 0.12, -6)
ev('pop', at(4, 'bubble'), -6)
# 5) tecleo en el móvil, pop enviado, tic de los puntos, ding recibido, pulgar
t0, t1 = at(5, 'type0'), at(5, 'type1'); k = 0
while t0 + k * 0.11 < t1: ev('tap', t0 + k * 0.11 + 0.02 * np.sin(k * 7), -14 - 3 * (k % 2)); k += 1
ev('pop', at(5, 'send'), -5)
k = 0
while at(5, 'typing') + k * 0.28 < at(5, 'reply') - 0.05: ev('tic', at(5, 'typing') + k * 0.28, -17); k += 1
ev('ding', at(5, 'reply'), -7); ev('pop', at(5, 'thumb'), -6); ev('swish', at(5, 'cut') - 0.1, -9); ev('pop', at(5, 'text'), -8); ev('tachan', at(5, 'text') + 0.05, -12)
# 6) flip del calendario, pasos de Marta y campanilla de la puerta
ev('flip', at(6, 'cal'), -4); ev('flip', at(6, 'calOut'), -7)
k = 0
while at(6, 'walk0') + 0.1 + k * 0.35 < at(6, 'enter') + 0.3: ev('step', at(6, 'walk0') + 0.1 + k * 0.35, -12); k += 1
ev('bell', at(6, 'door'), -6)
# 7) murmullo suave de farmacia, toc de la cesta en el mostrador y ta-chán con corazones
ev('murmullo_s', st(7), -16); ev('toc', st(7) + 0.12, -5); ev('pop', at(7, 'title'), -9); ev('tachan', at(7, 'hold'), -5); ev('pop_s', at(7, 'hold') + 0.3, -10); ev('pop_s', at(7, 'hold') + 0.6, -11)
# 8) campanilla al salir y ding alegre
ev('bell', at(8, 'open'), -6); ev('bell', at(8, 'close'), -12); ev('dingj', at(8, 'bien'), -7)
k = 0
while at(8, 'out') + k * 0.35 < at(8, 'front'): ev('step', at(8, 'out') + 0.05 + k * 0.35, -13); k += 1
# 9) whoosh al entrar los textos y pop de la franja roja; whoosh y ding en la tarjeta final
ev('whoosh', st(9) - 0.05, -9)
ev('whoosh', at(9, 'title') - 0.15, -7); ev('pop', at(9, 'strip'), -3); ev('whoosh', at(9, 'sub') - 0.15, -9); ev('whoosh', at(9, 'web') - 0.15, -11)
ev('whoosh', shot(9, 'FIN') - 0.15, -4); ev('ding', shot(9, 'FIN') + 0.1, -9)
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
# nivel: -37 dBFS RMS (≈ 17 dB bajo las voces, a -20 dBFS RMS); baja 3 dB más mientras hay voz y, en la escena 9,
# otros 3 dB bajo la voz de Marta (la música «cierra con energía y baja bajo la voz»)
mus *= 10 ** (-37 / 20) / max(np.sqrt((mus ** 2).mean()), 1e-9)
env = np.abs(voice); win = int(0.3 * SR); env = np.convolve(env, np.ones(win) / win, 'same')
duck_db = -3 * np.clip(env / 0.02, 0, 1)
tt = np.arange(N) / SR; s9, f9 = st(9), shot(9, 'FIN')
in9 = np.clip(np.minimum((tt - s9 - 0.8) / 0.6, (f9 - tt) / 0.3), 0, 1)
duck_db += -3 * in9
mus *= (10 ** (duck_db / 20))[:, None]
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
vid = os.path.join(ROOT, cfg['output']); out = os.path.join(ROOT, 'marta_cesta_bebe_con_audio.mp4'); tmp = out.replace('.mp4', '.partial.mp4')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', vid, '-i', A('mezcla.wav'), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
                '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, out)
print('->', os.path.relpath(out, ROOT), f'({TOTAL:.2f} s)')
