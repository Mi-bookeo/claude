#!/usr/bin/env python3
"""Pista de sonido del vídeo 20 «Se encienden las luces de Navidad» (y de su story) y vídeo con audio (la imagen NO se
   vuelve a codificar: -c:v copy; los subtítulos karaoke se queman después con audio/v20_subtitulos.py --burn).
   0) Voces de la narradora según config20.voz.json ('voices', las escribe v20_colocar_voces.py), a -20 dBFS RMS.
   1) Efectos: audio/sfx/<nombre>.wav|.mp3 si existe; si no, se sintetizan con código. Nombres: whoosh, pop, pop_s,
      zumbido, murmullo, viento, palmas, clic, foco, campanilla, coro (colchón sintetizado, sin voces), golpe, arpegio,
      chispas, petardo, ovacion, campanillas, ding_b.
   2) Música: audio/musica20.mp3 (v20_music.py), 16 dB por debajo de las voces y 6 dB más baja mientras se habla;
      fundido de entrada 0,5 s y de salida 1,5 s. Escena 5: un segundo de silencio (ni música ni efectos) antes de «luz».
   Uso: python3 audio/v20_audio.py   (story: CONFIG=config20.story.json python3 audio/v20_audio.py)
   Salida: audio/<mixWav> y el vídeo con audio (cfg.audioOut), volumen normalizado a -15 LUFS."""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
cfg = json.load(open(os.path.join(ROOT, os.environ.get('CONFIG', 'config20.voz.json'))))
FPS = cfg['fps']
SC, fr = {}, 0
for s in cfg['scenes']:
    n = round(s['duration'] * FPS); SC[s['id']] = dict(s, start=fr / FPS, end=(fr + n) / FPS); fr += n
TOTAL = fr / FPS
N = int(round(TOTAL * SR))
rng = np.random.default_rng(20)
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
def lp(x, n): return sm(sm(x, n), n)
def syn(name):
    if name in SYN: return SYN[name]
    for ext in ('.wav', '.mp3'):
        p = A('sfx', name + ext)
        if os.path.exists(p): SYN[name] = load(p); SYN_FILE.add(name); return SYN[name]
    if name == 'pop':
        t = t_(0.12); s = sweep(300 + 900 * np.exp(-t * 40), t) * np.exp(-t * 35)
    elif name == 'pop_s':  # pop brillante
        t = t_(0.14); s = 0.6 * sweep(700 + 1500 * np.exp(-t * 45), t) * np.exp(-t * 40) + 0.3 * np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 30)
    elif name == 'whoosh':
        d = 0.55; t = t_(d); x = noise(d + 0.1); s = np.zeros(len(t)); step = int(0.02 * SR)
        for k in range(0, len(t), step):
            u = np.sin(np.pi * k / len(t)); m = max(2, int(30 - 26 * u)); s[k:k + step] = sm(x[k:k + step + m], m)[: len(s[k:k + step])]
        s *= np.sin(np.pi * t / d) ** 2 * 3
    elif name == 'zumbido':  # zumbido grave de expectación
        d = 2.6; t = t_(d); s = (np.sin(2 * np.pi * 55 * t) + 0.4 * np.sin(2 * np.pi * 82.5 * t) + 0.2 * np.sin(2 * np.pi * 110.3 * t)) * (1 + 0.15 * np.sin(2 * np.pi * 0.8 * t))
        s *= np.minimum(1, t / 0.8) * np.clip((d - t) / 0.5, 0, 1)
    elif name == 'murmullo':  # gente hablando bajito: ruido en la banda de la voz con modulación silábica
        d = 4.2; t = t_(d); s = np.zeros(len(t))
        for k in range(8):
            b = hp(lp(noise(d), 6), 40); env = np.clip(sm(np.abs(noise(d)) * (rng.uniform(0, 1, len(t)) > 0.5), int(0.12 * SR)), 0, None)
            s += b * (0.4 + env * 1.2) * (1 + 0.5 * np.sin(2 * np.pi * rng.uniform(3, 5) * t + rng.uniform(0, 6)))
        s *= np.minimum(1, t / 0.6) * np.clip((d - t) / 0.6, 0, 1)
    elif name == 'viento':
        d = 4.2; t = t_(d); s = lp(noise(d), 40) * 6 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * t) ** 2) * np.minimum(1, t / 1.0) * np.clip((d - t) / 1.0, 0, 1)
    elif name == 'palmas':  # palmada suave
        t = t_(0.12); s = sum(hp(noise(0.12), 3) * np.exp(-np.maximum(t - o, 0) * 70) * (t >= o) for o in (0, 0.008, 0.017)) * 0.6
    elif name == 'clic':  # interruptor del foco
        t = t_(0.06); s = (hp(noise(0.06), 2) + np.sin(2 * np.pi * 1800 * t)) * np.exp(-t * 120)
    elif name == 'foco':  # zumbido eléctrico del foco
        d = 5.0; t = t_(d); s = (np.sign(np.sin(2 * np.pi * 100 * t)) * 0.3 + np.sin(2 * np.pi * 100 * t) + 0.3 * np.sin(2 * np.pi * 300 * t)) * np.minimum(1, t / 0.15) * np.clip((d - t) / 0.4, 0, 1)
        s = lp(s, 4)
    elif name == 'campanilla':
        s = bell((2637, 3951, 5274, 7040), 1.8, (2.6, 3.5, 5, 7))
    elif name == 'campanillas':  # varias campanillas sueltas
        d = 3.0; t = t_(d); s = np.zeros(len(t))
        for k, fq in enumerate((2093, 2637, 3136, 2349, 3520, 2794)):
            o = k * 0.42 + rng.uniform(0, 0.1); tt_ = np.maximum(t - o, 0); s += (t >= o) * np.sin(2 * np.pi * fq * tt_) * np.exp(-tt_ * 3.5) * 0.5
    elif name == 'coro':  # colchón de «coro» sintetizado: dientes de sierra filtrados con formantes de «aa», SIN voces
        d = 4.6; t = t_(d); s = np.zeros(len(t)); prog = [(60, 64, 67), (60, 65, 69), (59, 62, 67), (60, 64, 67)]
        for j, ch in enumerate(prog):
            o = j * d / 4
            for m in ch:
                f = 440 * 2 ** ((m - 69) / 12); ph = 2 * np.pi * np.cumsum(f * (1 + 0.005 * np.sin(2 * np.pi * 5 * t))) / SR
                saw = sum(np.sin(k * ph) / k * (1 + 1.5 * np.exp(-((k * f - 800) / 250) ** 2) + 0.8 * np.exp(-((k * f - 1200) / 300) ** 2)) for k in range(1, 14))
                seg_ = np.clip(np.minimum((t - o) / 0.35, (o + d / 4 + 0.35 - t) / 0.35), 0, 1)
                s += saw * seg_
        s = lp(s, 3) * np.clip((d - t) / 0.5, 0, 1)
    elif name == 'golpe':  # golpe grave del encendido
        t = t_(1.4); s = sweep(38 + 110 * np.exp(-t * 18), t) * np.exp(-t * 3.5) * 1.6 + lp(noise(1.4), 15) * np.exp(-t * 12) * 2
    elif name == 'arpegio':  # campanillas ascendentes
        d = 2.6; t = t_(d); s = np.zeros(len(t))
        for k, m in enumerate((72, 76, 79, 84, 88, 91, 96)):
            o = k * 0.09; tt_ = np.maximum(t - o, 0); fq = 440 * 2 ** ((m - 69) / 12)
            s += (t >= o) * (np.sin(2 * np.pi * fq * tt_) + 0.3 * np.sin(2 * np.pi * fq * 2.76 * tt_) * np.exp(-tt_ * 6)) * np.exp(-tt_ * 2.4)
    elif name == 'chispas':  # chisporroteo de fuegos fríos
        d = 3.2; t = t_(d); s = np.zeros(len(t))
        for o in np.sort(rng.uniform(0, d - 0.05, 260)):
            i0 = int(o * SR); n = int(0.004 * SR); s[i0:i0 + n] += hp(noise(0.004), 2)[:n] * rng.uniform(0.3, 1)
        s = s * 1.4 + hp(noise(d), 3) * 0.06; s *= np.minimum(1, t / 0.05) * np.clip((d - t) / 0.8, 0, 1)
    elif name == 'petardo':  # «pop» de fuego artificial con cola
        t = t_(0.7); s = lp(noise(0.7), 3) * np.exp(-t * 30) * 1.6 + sweep(200 + 300 * np.exp(-t * 20), t) * np.exp(-t * 18) * 0.5
        for o in rng.uniform(0.08, 0.5, 10):
            tt_ = np.maximum(t - o, 0); s += (t >= o) * hp(noise(0.7), 2) * np.exp(-tt_ * 200) * 0.4
    elif name == 'ovacion':  # aplausos + «¡bieen!» de gente (ruido modulado)
        d = 5.8; t = t_(d); s = np.zeros(len(t))
        for o in np.sort(rng.uniform(0, d - 0.15, 900)):
            i0 = int(o * SR); n = int(0.03 * SR); tt_ = np.arange(n) / SR; s[i0:i0 + n] += hp(noise(0.03), 3)[:n] * np.exp(-tt_ * 90) * rng.uniform(0.3, 1)
        s += hp(lp(noise(d), 8), 60) * 0.5 * (1 + 0.3 * np.sin(2 * np.pi * 0.7 * t))
        s *= np.minimum(1, t / 0.4) * np.clip((d - t) / 1.4, 0, 1)
    elif name == 'ding_b':  # ding cálido de cierre
        s = bell((1047, 1568, 2093, 3136), 2.4, (1.6, 2.4, 3.3, 5))
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

def video_events():
    if 0 in SC:  # 0) hook: zumbido grave muy suave; whoosh al entrar el texto y pops de cada línea
        ev('zumbido', st(0), -16); ev('whoosh', at(0, 'box') - 0.15, -6); ev('pop', at(0, 'l1'), -11); ev('pop', at(0, 'l2'), -11); ev('campanilla', at(0, 'spark'), -16)
    if 1 in SC:  # 1) murmullo suave y viento ligero
        ev('murmullo', st(1), -14); ev('viento', st(1), -18)
    if 2 in SC:  # 2) palmadas a tempo (tiempos 2 y 4 de cada compás de 0,5 s) y pops brillantes en cada giro de la coreografía
        d2 = SC[2]['end'] - st(2); ev('pop', at(2, 'in'), -10)
        for k in range(int(d2 / 0.5)):
            if k % 2 == 1: ev('palmas', st(2) + k * 0.5, -13)
        for c0 in np.arange(0, d2 - 0.3, 4.0):
            for off in (1.0, 2.0, 3.0): ev('pop_s', st(2) + c0 + off, -14)
        ev('murmullo', st(2), -24)
    if 3 in SC:  # 3) clic y zumbido del foco; campanilla suave al aparecer los cantantes
        ev('whoosh', st(3) - 0.05, -14); ev('clic', at(3, 'spot'), -6); ev('foco', at(3, 'spot') + 0.02, -27); ev('campanilla', at(3, 'singers'), -12)
    if 4 in SC:  # 4) colchón de coro sintetizado (sin voces)
        ev('coro', st(4) + 0.1, -16); ev('pop_s', at(4, 'ladies'), -16); ev('pop_s', at(4, 'kids'), -16)
    if 5 in SC:  # 5) silencio de un segundo antes de «luz»; golpe grave, arpegio de campanillas, chisporroteo y fuegos
        on = at(5, 'on'); ev('golpe', on, 0); ev('arpegio', on + 0.05, -6); ev('chispas', on + 0.1, -12)
        for j, o in enumerate((0.25, 0.6, 0.95, 1.5, 2.1)): ev('petardo', on + o, -12 - 2 * (j % 2))
    if 6 in SC:  # 6) ovación suave y campanillas
        ev('ovacion', st(6), -12); ev('campanillas', st(6) + 0.4, -14)
    if 7 in SC:  # 7) ding cálido de cierre
        ev('whoosh', st(7) - 0.12, -12); ev('ding_b', at(7, 'logo') + 0.05, -6); ev('pop_s', at(7, 't1'), -14); ev('pop_s', at(7, 't2'), -15)
def story_events():
    video_events()

video_events() if not cfg.get('story') else story_events()
fx = np.zeros(N)
for name, t, g in EV:
    if t >= SC[max(SC)]['end'] or t < -0.5: continue
    s = syn(name); s = s / max(np.abs(s).max(), 1e-9) * 10 ** ((g - 7) / 20)
    a = int(max(t, 0) * SR); fx[a:a + len(s)] += s[: max(0, N - a)]
synth = sorted(n for n in SYN if n not in SYN_FILE)
print('efectos desde audio/sfx/:', ', '.join(sorted(SYN_FILE)) or 'ninguno')
if synth: print('efectos sintetizados con código:', ', '.join(synth))

# ---------------- música ----------------
MUS = os.path.join(ROOT, cfg.get('musicMp3', 'audio/musica20.mp3'))
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
# segundo de silencio antes de «luz» (también sin efectos)
if 5 in SC and 'on' in SC[5].get('cues', {}):
    a_, b_ = int((at(5, 'on') - 1.0) * SR), int(at(5, 'on') * SR); mus[a_:b_] = 0; fx[a_:b_] = 0
vr = voice[np.abs(voice) > 0];
print(f'música: {os.path.relpath(MUS, ROOT)}  RMS {db(np.sqrt((mus ** 2).mean())):.1f} dBFS' + (f' (voces {db(np.sqrt((vr ** 2).mean())):.1f} dBFS)' if len(vr) else ''))
mix = (voice + fx)[:, None] * np.array([1.0, 1.0]) + mus
pk = np.abs(mix).max()
if pk > 0.95: mix *= 0.95 / pk
MEZ = A(cfg.get('mixWav', 'mezcla20.wav'))
with wave.open(MEZ, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
vid = os.path.join(ROOT, cfg['output']); out = os.path.join(ROOT, cfg['audioOut']); tmp = out.replace('.mp4', '.partial.mp4')
os.makedirs(os.path.dirname(out) or ROOT, exist_ok=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', vid, '-i', MEZ, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
                '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, out)
print('->', os.path.relpath(out, ROOT), f'({TOTAL:.2f} s, {os.path.getsize(out) / 1e6:.1f} MB)')
