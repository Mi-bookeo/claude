#!/usr/bin/env python3
"""Pista de sonido del vídeo 19 «El precio de antes» (y de su story) y vídeo con audio (la imagen NO se vuelve a
   codificar: -c:v copy; los subtítulos karaoke se queman después con audio/v19_subtitulos.py --burn).
   0) Voces de la narradora según config19.voz.json ('voices', las escribe v19_colocar_voces.py), a -20 dBFS RMS.
   1) Efectos: audio/sfx/<nombre>.wav|.mp3 si existe; si no, se sintetizan con código. Nombres: whoosh, whoosh_s, pop,
      pop_s, boing, tic, cruje (balanza), plin, ding, ding_b, splash, golpe, cadena, crujido (cartel), sello, tecla,
      notif, chispas.
   2) Música: audio/musica.mp3 (se repite con fundido cruzado si es más corta que el vídeo), 16 dB por debajo de las
      voces y 6 dB más baja mientras se habla; fundido de entrada 0,5 s y de salida 1,5 s.
   Uso: python3 audio/v19_audio.py   (story: CONFIG=config19.story.json python3 audio/v19_audio.py)
   Salida: audio/<mixWav> y el vídeo con audio (cfg.audioOut), volumen normalizado a -15 LUFS."""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
cfg = json.load(open(os.path.join(ROOT, os.environ.get('CONFIG', 'config19.voz.json'))))
FPS = cfg['fps']
SC, fr = {}, 0
for s in cfg['scenes']:
    n = round(s['duration'] * FPS); SC[s['id']] = dict(s, start=fr / FPS, end=(fr + n) / FPS); fr += n
TOTAL = fr / FPS
N = int(round(TOTAL * SR))
rng = np.random.default_rng(19)
st = lambda i: SC[i]['start']
at = lambda i, k, d=0: st(i) + (SC[i]['cues'].get(k, d) if not isinstance(SC[i]['cues'].get(k, d), list) else SC[i]['cues'][k][0])

def load(path, ch=1, ss=0):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(ss), '-i', path, '-f', 'f32le', '-ac', str(ch), '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, '<f4').astype(np.float64)
    return x.reshape(-1, ch) if ch > 1 else x
def db(x): return 20 * np.log10(max(x, 1e-9))
def t_(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def sm(x, n): return np.convolve(x, np.ones(n) / n, 'same') if n > 1 else x
def hp(x, n=6): return x - sm(x, n)
def sweep(f, t): return np.sin(2 * np.pi * np.cumsum(f) / SR)
def bell(fqs, d, dec): t = t_(d); return sum(g * np.sin(2 * np.pi * fq * t) * np.exp(-t * dc) for fq, g, dc in zip(fqs, [1, .6, .4, .25], dec))

SYN, SYN_FILE = {}, set()
def syn(name):
    if name in SYN: return SYN[name]
    for ext in ('.wav', '.mp3'):
        p = A('sfx', name + ext)
        if os.path.exists(p): SYN[name] = load(p); SYN_FILE.add(name); return SYN[name]
    if name == 'pop':
        t = t_(0.12); s = sweep(300 + 900 * np.exp(-t * 40), t) * np.exp(-t * 35)
    elif name == 'pop_s':
        t = t_(0.09); s = 0.6 * sweep(500 + 900 * np.exp(-t * 50), t) * np.exp(-t * 45)
    elif name in ('whoosh', 'whoosh_s'):
        d = 0.5 if name == 'whoosh' else 0.7; t = t_(d); x = noise(d + 0.1); s = np.zeros(len(t)); step = int(0.02 * SR)
        for k in range(0, len(t), step):
            u = np.sin(np.pi * k / len(t)); m = max(2, int(30 - 26 * u)); s[k:k + step] = sm(x[k:k + step + m], m)[: len(s[k:k + step])]
        s *= np.sin(np.pi * t / d) ** 2 * 3
    elif name == 'boing':  # muelle cómico: tono que oscila y baja
        t = t_(0.7); f = 180 + 120 * np.exp(-t * 3) * (1 + 0.5 * np.sin(2 * np.pi * 14 * t)); s = (sweep(f, t) + 0.3 * sweep(2 * f, t)) * np.exp(-t * 4.5)
    elif name == 'tic':  # tic de cálculo (tecla de calculadora)
        t = t_(0.05); s = (np.sin(2 * np.pi * 2600 * t) + hp(noise(0.05), 3) * 0.5) * np.exp(-t * 140)
    elif name == 'cruje':  # balanza que cruje: madera/metal que roza, tono que vibra
        t = t_(0.9); f = 140 + 40 * np.sin(2 * np.pi * 3 * t); s = np.zeros(len(t))
        for k in range(int(0.9 / 0.018)):
            o = k * 0.018 + rng.uniform(0, 0.006); tt = np.maximum(t - o, 0); s += (t >= o) * np.sin(2 * np.pi * f * tt) * np.exp(-tt * 260) * rng.uniform(0.4, 1)
        s = s * np.sin(np.pi * t / 0.9) + hp(noise(0.9), 4) * 0.05
    elif name == 'plin':  # «plin» de duda: pulsación aguda que sube un poco y se queda en el aire
        t = t_(0.8); s = (np.sin(2 * np.pi * 1568 * t) + 0.4 * np.sin(2 * np.pi * 2349 * t)) * np.exp(-t * 6) * (1 + 0.3 * np.sin(2 * np.pi * 7 * t))
    elif name == 'ding':  # check brillante
        s = bell((2093, 3136, 4186, 5274), 1.4, (3, 4, 6, 8))
    elif name == 'ding_c':  # ding corto
        s = bell((1760, 2637, 3520), 0.5, (9, 12, 16))
    elif name == 'ding_b':  # ding suave del cierre
        s = bell((1047, 1568, 2093, 3136), 2.2, (1.8, 2.6, 3.5, 5))
    elif name == 'splash':  # ancla que entra al agua: chapoteo + burbujas
        t = t_(1.4); s = sm(noise(1.4), 6) * np.exp(-t * 6) * 2.2 + sm(noise(1.4), 30) * np.exp(-t * 3) * 3
        for k in range(10):
            o = 0.15 + k * 0.08 + rng.uniform(0, 0.04); tt = np.maximum(t - o, 0); fq = rng.uniform(500, 1100)
            s += (t >= o) * sweep(fq * (1 + 2 * tt), tt) * np.exp(-tt * 40) * 0.35
    elif name == 'golpe':  # golpe sordo del ancla en el fondo
        t = t_(0.6); s = sweep(50 + 90 * np.exp(-t * 25), t) * np.exp(-t * 7) * 1.4 + sm(noise(0.6), 20) * np.exp(-t * 20)
    elif name == 'cadena':  # cadena metálica: eslabones que tintinean
        t = t_(1.0); s = np.zeros(len(t))
        for k in range(16):
            o = k * 0.055 + rng.uniform(0, 0.02); tt = np.maximum(t - o, 0)
            for fq in rng.uniform(2500, 5200, 2): s += (t >= o) * np.sin(2 * np.pi * fq * tt) * np.exp(-tt * 55) * 0.5
            s += (t >= o) * hp(noise(1.0), 2) * np.exp(-tt * 200) * 0.4
    elif name == 'crujido':  # cartel que se agrieta: chasquidos secos que se aceleran
        t = t_(1.1); s = np.zeros(len(t)); o = 0.0; k = 0
        while o < 1.0:
            tt = np.maximum(t - o, 0); s += (t >= o) * (hp(noise(1.1), 2) * 1.2 + np.sin(2 * np.pi * rng.uniform(300, 900) * tt) * 0.4) * np.exp(-tt * 120) * rng.uniform(0.5, 1)
            k += 1; o += max(0.025, 0.14 * 0.85 ** k)
        s += sm(noise(1.1), 4) * np.exp(-((t - 0.95) / 0.08) ** 2) * 1.5
    elif name == 'sello':  # sello de goma: golpe grave + papel
        t = t_(0.6); s = sweep(55 + 140 * np.exp(-t * 35), t) * np.exp(-t * 10) * 1.4
        s += sm(noise(0.6), 6) * np.exp(-t * 55) * 1.6 + hp(noise(0.6), 3) * np.exp(-t * 90) * 0.5
    elif name == 'tecla':  # pulsación en la pantalla
        t = t_(0.04); s = (hp(noise(0.04), 3) * 0.6 + np.sin(2 * np.pi * 1100 * t)) * np.exp(-t * 160)
    elif name == 'notif':  # notificación de móvil: dos notas
        t = t_(0.6); s = sum((t >= o) * np.sin(2 * np.pi * fq * np.maximum(t - o, 0)) * np.exp(-np.maximum(t - o, 0) * 9) for fq, o in ((1319, 0), (1976, 0.11)))
    elif name == 'chispas':
        t = t_(1.0); s = np.zeros(len(t))
        for k in range(6):
            o = k * 0.09 + rng.uniform(0, 0.03); tt = np.maximum(t - o, 0); s += (t >= o) * np.sin(2 * np.pi * rng.uniform(2600, 4800) * tt) * np.exp(-tt * 9)
        s *= 0.35
    else: raise KeyError(name)
    SYN[name] = s.astype(np.float64); return SYN[name]

EV = []
def ev(name, t, g_db=0.0): EV.append((name, t, g_db))
# ---------------- voces ----------------
voice = np.zeros(N); missing = []
for i, sc in SC.items():
    for vo in sc.get('voices', []):
        f = os.path.join(ROOT, vo['file'])
        if not os.path.exists(f): missing.append(vo['file']); continue
        v = load(f)
        fr_ = v[: len(v) // 480 * 480].reshape(-1, 480); r = np.sqrt((fr_ ** 2).mean(1)); ac = r[r > r.max() * 0.1]
        v *= 10 ** (-20 / 20) / max(np.sqrt((ac ** 2).mean()), 1e-6)
        t0 = st(i) + vo['start']; a_ = int(t0 * SR); voice[a_:a_ + len(v)] += v[: max(0, N - a_)]
        print(f"escena {i}: {os.path.basename(f):20s} {len(v) / SR:5.2f} s  {t0:6.2f} → {t0 + len(v) / SR:6.2f}")
if missing: print('AVISO: faltan voces:', ', '.join(missing))

def story_events():
    i = 20
    ev('whoosh', at(i, 'box') - 0.1, -8); ev('pop', at(i, 'box') + 0.1, -8)
    ev('whoosh_s', at(i, 'fall'), -10); ev('splash', at(i, 'hit') - 0.12, -4); ev('golpe', at(i, 'hit'), -6)
    ev('pop_s', at(i, 'tags'), -11); ev('pop_s', at(i, 'tags') + 0.15, -11); ev('cadena', at(i, 'tags') + 0.1, -16)
    ev('pop', at(i, 'vote'), -7); ev('ding_c', at(i, 'vote') + 0.1, -9); ev('plin', at(i, 'vote') + 1.2, -14)
def video_events():
    # 0) HOOK: carteles con pop; whoosh al entrar el texto
    ev('pop_s', st(0), -12); ev('pop_s', st(0) + 0.12, -12); ev('whoosh', at(0, 'box') - 0.12, -6); ev('pop', at(0, 'box') + 0.12, -9)
    # 1) pop en cada corte de cartel; tachado; flecha que pulsa
    for k, (a, b) in SC[1]['shots'].items(): ev('pop', st(1) + a, -6 if k != 'A' else -8)
    ev('whoosh_s', st(1) + SC[1]['shots']['B'][0] + 0.2, -16)
    d0 = st(1) + SC[1]['shots']['D'][0]; ev('whoosh_s', d0 + 0.3, -12); ev('chispas', d0 + 0.7, -14)
    # 2) boing del cerebro, tic-tic de cálculo, balanza que cruje
    ev('boing', at(2, 'brain'), -6); ev('pop', at(2, 'txt'), -9)
    for j in range(5): ev('tic', at(2, 'sym') + j * 0.22, -10); ev('tic', at(2, 'sym') + j * 0.22 + 0.09, -14)
    ev('pop_s', at(2, 'bal'), -11); ev('cruje', at(2, 'tilt'), -6); ev('golpe', at(2, 'tilt') + 0.12, -16)
    # 3) plin de duda en el «?» (y otro más), ding brillante en el check
    ev('plin', at(3, 'q'), -8); ev('plin', at(3, 'q') + 2.2, -13); ev('pop_s', at(3, 'brain'), -12)
    ev('whoosh_s', at(3, 'strike'), -15); ev('pop_s', at(3, 'arrow'), -12); ev('pop', at(3, 'newp'), -9)
    ev('ding', at(3, 'check'), -5); ev('chispas', at(3, 'glint'), -12); ev('pop', at(3, 'save'), -9)
    # 4) el ancla cae al agua (splash) y toca fondo; cadena metálica
    ev('whoosh', at(4, 'fall'), -10); ev('splash', at(4, 'hit') - 0.1, -3); ev('golpe', at(4, 'hit'), -4)
    ev('cadena', at(4, 'chain'), -6); ev('pop', at(4, 'txt'), -8); ev('pop_s', at(4, 'sub'), -12); ev('pop_s', at(4, 'first'), -10)
    ev('splash', at(4, 'float') - 0.1, -18)
    # 5) crujido del cartel y golpe de sello; el cartel REAL cae
    ev('crujido', at(5, 'crack'), -4); ev('whoosh_s', at(5, 'stamp') - 0.3, -12); ev('sello', at(5, 'stamp'), 0)
    ev('whoosh_s', at(5, 'real'), -12); ev('golpe', at(5, 'real') + 0.38, -10); ev('ding_c', at(5, 'real') + 0.45, -10); ev('pop', at(5, 'txt'), -8)
    # 6) formulario: teclas, pops de los halos y del botón; corte; notificaciones en los móviles de clientes
    c6 = SC[6]['cues']
    for a, b, n in ((c6['type1'][0], c6['type1'][1], 6), (c6['type2'][0], c6['type2'][1], 4)):
        for j in range(n): ev('tecla', st(6) + a + (b - a) * j / n, -12)
    ev('pop', at(6, 'halo1'), -9); ev('pop', at(6, 'halo2'), -9); ev('pop', at(6, 'press'), -6)
    b0 = st(6) + SC[6]['shots']['B'][0]; ev('pop', b0, -8); ev('ding_c', b0 + c6['toast'], -10)
    for j in range(6): ev('whoosh_s', b0 + c6['fly'] + j * 0.28, -18); ev('notif', b0 + c6['fly'] + j * 0.28 + 0.6, -9)
    # 7) pop del botón y ding corto
    ev('pop', at(7, 'board'), -8); ev('ding_c', at(7, 'flash'), -9); ev('pop_s', at(7, 'link'), -12)
    if cfg.get('variant') != 'tiktok':  # el botón y «Comenta / ALTA» en grande solo existen en Instagram
        ev('pop', at(7, 'btn'), -5); ev('ding_c', at(7, 'btn') + 0.12, -8); ev('whoosh_s', at(7, 'com') - 0.15, -12); ev('pop', at(7, 'com'), -6); ev('pop', at(7, 'com') + 0.18, -7)
    # 8) ding suave de cierre
    ev('whoosh', st(8) - 0.15, -10); ev('ding_b', st(8) + 0.05, -6); ev('pop_s', at(8, 'sub'), -14); ev('pop_s', at(8, 'url'), -14)

story_events() if cfg.get('story') else video_events()
fx = np.zeros(N)
for name, t, g in EV:
    s = syn(name); s = s / max(np.abs(s).max(), 1e-9) * 10 ** ((g - 7) / 20)
    a = int(t * SR); fx[a:a + len(s)] += s[: max(0, N - a)]
synth = sorted(n for n in SYN if n not in SYN_FILE)
print('efectos desde audio/sfx/:', ', '.join(sorted(SYN_FILE)) or 'ninguno')
if synth: print('efectos sintetizados con código:', ', '.join(synth))

# ---------------- música ----------------
MUS = os.path.join(ROOT, cfg.get('musicMp3', 'audio/musica.mp3'))
m0 = load(MUS, 2, cfg.get('musicOffset', 0)); xf = int(2.0 * SR); mus = m0.copy()
while len(mus) < N:  # se repite con fundido cruzado de 2 s
    r = np.linspace(0, 1, xf)[:, None]
    mus = np.vstack([mus[:-xf], mus[-xf:] * (1 - r) + m0[:xf] * r, m0[xf:]])
mus = mus[:N]
mus *= 10 ** (-36 / 20) / max(np.sqrt((mus ** 2).mean()), 1e-9)          # voces a -20 dBFS -> música 16 dB por debajo
env = np.convolve(np.abs(voice), np.ones(int(0.3 * SR)) / int(0.3 * SR), 'same')
mus *= (10 ** (-6 * np.clip(env / 0.02, 0, 1) / 20))[:, None]            # y 6 dB más baja mientras se habla
fi, fo = int(0.5 * SR), int(1.5 * SR)
mus[:fi] *= np.linspace(0, 1, fi)[:, None]; mus[-fo:] *= np.linspace(1, 0, fo)[:, None]
vr = voice[np.abs(voice) > 0];
print(f'música: {os.path.relpath(MUS, ROOT)}  RMS {db(np.sqrt((mus ** 2).mean())):.1f} dBFS' + (f' (voces {db(np.sqrt((vr ** 2).mean())):.1f} dBFS)' if len(vr) else ''))
mix = (voice + fx)[:, None] * np.array([1.0, 1.0]) + mus
pk = np.abs(mix).max()
if pk > 0.95: mix *= 0.95 / pk
MEZ = A(cfg.get('mixWav', 'mezcla19.wav'))
with wave.open(MEZ, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
vid = os.path.join(ROOT, cfg['output']); out = os.path.join(ROOT, cfg['audioOut']); tmp = out.replace('.mp4', '.partial.mp4')
os.makedirs(os.path.dirname(out) or ROOT, exist_ok=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', vid, '-i', MEZ, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
                '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, out)
print('->', os.path.relpath(out, ROOT), f'({TOTAL:.2f} s, {os.path.getsize(out) / 1e6:.1f} MB)')
