#!/usr/bin/env python3
"""Pista de sonido del vídeo 18 «Pedro y la ITV» (sin voces todavía) y vídeo con audio.
   1) Efectos: audio/sfx/<nombre>.wav|.mp3 si existe (los que pase el usuario, con ese nombre); si no, se sintetizan
      con código. Nombres: whoosh, whoosh_s, pop, pop_s, golpe, sello, impacto, malo (estribillo de «suspenso»),
      gota, trago, motor_<s>, freno, swipe, tap, bingo, ting, tono_<s>, descolgar, ok, carraca_<s>, clonk, rodar_<s>,
      clunk, pasos_<s>, tachan, chispas, ding2, ding_b.
   2) Música: audio/musica18.mp3 (v18_music.py): tensión en el sello y el coche, alegre tras la llamada.
   Uso: python3 audio/v18_audio.py   (TikTok: CONFIG=config18.tiktok.json python3 audio/v18_audio.py)
   Salida: audio/mezcla18.wav y el vídeo con audio (cfg.audioOut), imagen ligera para redes (crf 23, tune animation)
   y volumen normalizado a -15 LUFS."""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda *p: os.path.join(ROOT, 'audio', *p)
SR = 48000
cfg = json.load(open(os.path.join(ROOT, os.environ.get('CONFIG', 'config18.json'))))
FPS = cfg['fps']
SC, fr = {}, 0
for s in cfg['scenes']:
    n = round(s['duration'] * FPS); SC[s['id']] = dict(s, start=fr / FPS, end=(fr + n) / FPS); fr += n
TOTAL = fr / FPS
N = int(round(TOTAL * SR))
rng = np.random.default_rng(18)
st = lambda i: SC[i]['start']
cu = lambda i, k: SC[i]['cues'][k]
at = lambda i, k, d=0: st(i) + SC[i]['cues'].get(k, d)
TK = cfg.get('variant') == 'tiktok'

def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<f4').astype(np.float64)
def db(x): return 20 * np.log10(max(x, 1e-9))
def t_(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))
def sm(x, n): return np.convolve(x, np.ones(n) / n, 'same') if n > 1 else x
def hp(x, n=6): return x - sm(x, n)
def fade(s, a=0.2, b=0.3):
    t = np.arange(len(s)) / SR; d = len(s) / SR
    return s * np.minimum(1, t / a) * np.minimum(1, (d - t) / b)
def sweep(f, t): return np.sin(2 * np.pi * np.cumsum(f) / SR)

SYN, SYN_FILE = {}, set()
def syn(name):
    if name in SYN: return SYN[name]
    for ext in ('.wav', '.mp3'):
        p = A('sfx', name + ext)
        if not os.path.exists(p) and '_' in name: p = A('sfx', name.split('_')[0] + ext)   # «motor.wav» vale para «motor_7.5»
        if os.path.exists(p): SYN[name] = load(p); SYN_FILE.add(name); return SYN[name]
    base, *arg = name.split('_'); d = float(arg[0]) if arg and arg[0].replace('.', '').isdigit() else None
    if name == 'pop':
        t = t_(0.12); s = sweep(300 + 900 * np.exp(-t * 40), t) * np.exp(-t * 35)
    elif name == 'pop_s':
        t = t_(0.09); s = 0.6 * sweep(500 + 900 * np.exp(-t * 50), t) * np.exp(-t * 45)
    elif name in ('whoosh', 'whoosh_s'):
        d = 0.5 if name == 'whoosh' else 0.7; t = t_(d); x = noise(d); s = np.zeros(len(t)); step = int(0.02 * SR)
        for k in range(0, len(t), step):
            u = np.sin(np.pi * k / len(t)); m = max(2, int(30 - 26 * u)); s[k:k + step] = sm(x[k:k + step + m], m)[: len(s[k:k + step])]
        s *= np.sin(np.pi * t / d) ** 2 * 3
    elif name == 'golpe':  # golpe seco cómico (caja del hook)
        t = t_(0.35); s = sweep(60 + 120 * np.exp(-t * 30), t) * np.exp(-t * 12) + sm(noise(0.35), 12) * np.exp(-t * 40) * 1.5
    elif name == 'sello':  # sello de goma contra el mostrador: golpe grave + papel + madera
        t = t_(0.6); s = sweep(55 + 140 * np.exp(-t * 35), t) * np.exp(-t * 10) * 1.4
        s += sm(noise(0.6), 6) * np.exp(-t * 55) * 1.6 + hp(noise(0.6), 3) * np.exp(-t * 90) * 0.5
        s += sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * 28) for fq in (420, 690)) * 0.25
    elif name == 'impacto':  # «boom» de impacto con cola
        t = t_(1.8); s = sweep(38 + 60 * np.exp(-t * 8), t) * np.exp(-t * 2.2) * 1.3 + sm(noise(1.8), 40) * np.exp(-t * 4) * 2.5
    elif name == 'malo':  # «chan-chan-chaaan» de suspenso, descendente
        t = t_(2.4); s = np.zeros(len(t))
        for o, base_ in ((0, 62), (0.28, 61), (0.56, 56)):
            tt = np.maximum(t - o, 0); g = (t >= o) * np.minimum(1, tt / 0.01) * (np.exp(-tt * 9) if o < 0.5 else np.exp(-tt * 1.3))
            for m in (base_, base_ + 3, base_ + 6, base_ - 12):
                fq = 440 * 2 ** ((m - 69) / 12) * (1 - (0.03 * np.minimum(tt, 1.5) if o >= 0.5 else 0))
                s += g * sum(np.sin(2 * np.pi * fq * h * tt) / h for h in (1, 2, 3, 4))
        s *= 0.2
    elif name == 'gota':  # «plic» de la gota de sudor
        t = t_(0.25); s = sweep(900 + 1600 * np.exp(-t * 40), t) * np.exp(-t * 30)
    elif name == 'trago':  # «glup»: tragar saliva
        t = t_(0.35); s = sweep(260 - 160 * np.minimum(t / 0.2, 1), t) * np.exp(-((t - 0.1) / 0.08) ** 2) * 1.2 + sm(noise(0.35), 20) * np.exp(-((t - 0.1) / 0.06) ** 2) * 0.8
    elif base == 'motor':  # coche en marcha por la carretera: rumor del motor + rodadura + viento
        t = t_(d); rpm = 34 + 2 * np.sin(2 * np.pi * 0.3 * t)
        s = sum(np.sin(2 * np.pi * np.cumsum(rpm * h) / SR) / h for h in (1, 2, 3, 4)) * (0.8 + 0.2 * np.sin(2 * np.pi * 17 * t))
        s = s * 0.5 + sm(noise(d), 60) * 3.5 + sm(noise(d), 8) * 0.25
        s = fade(s, 0.15, 0.4)
    elif name == 'freno':  # freno de mano: carraca corta
        t = t_(0.5); s = np.zeros(len(t))
        for k in range(7): o = k * 0.05; tt = np.maximum(t - o, 0); s += (t >= o) * hp(noise(0.5), 3) * np.exp(-tt * 200)
    elif name == 'swipe':  # dedo que desliza en la pantalla
        t = t_(0.3); s = hp(noise(0.3), 4) * np.sin(np.pi * t / 0.3) ** 2 * 0.6
    elif name == 'tap':
        t = t_(0.04); s = (hp(noise(0.04), 3) * 0.6 + np.sin(2 * np.pi * 900 * t)) * np.exp(-t * 160)
    elif name == 'bingo':  # «¡bingo!»: arpegio brillante hacia arriba + campanita
        t = t_(1.6); s = np.zeros(len(t))
        for j, m in enumerate((74, 78, 81, 86, 90)):
            o = j * 0.06; tt = np.maximum(t - o, 0); fq = 440 * 2 ** ((m - 69) / 12)
            s += (t >= o) * (np.sin(2 * np.pi * fq * tt) + 0.3 * np.sin(4 * np.pi * fq * tt)) * np.exp(-tt * 3.5)
        s *= 0.4
    elif name == 'ting':
        t = t_(1.4); s = sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * 3) for fq in (2093, 3136, 4186)) * 0.5 + np.sin(2 * np.pi * 1047 * t) * np.exp(-t * 5) * 0.4
    elif name == 'chispas':  # destellos: «tilín» de varias campanitas
        t = t_(1.0); s = np.zeros(len(t))
        for k in range(6):
            o = k * 0.09 + rng.uniform(0, 0.03); tt = np.maximum(t - o, 0); fq = rng.uniform(2600, 4800)
            s += (t >= o) * np.sin(2 * np.pi * fq * tt) * np.exp(-tt * 9)
        s *= 0.35
    elif base == 'tono':  # tono de llamada (425 Hz, como en España): 1 s sonando, 0,6 s de pausa
        t = t_(d); s = np.sin(2 * np.pi * 425 * t) * ((t % 1.6) < 1.0) * 0.5
        s = sm(s, 40)
    elif name == 'descolgar':
        t = t_(0.12); s = (hp(noise(0.12), 3) * 0.5 + np.sin(2 * np.pi * 1200 * t)) * np.exp(-t * 60)
    elif name == 'ok':  # «¡claro!» del globo: dos notas alegres
        t = t_(0.7); s = sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * 6) * (t >= o) for fq, o in ((880, 0), (1319, 0.1)))
    elif base == 'carraca':  # llave de carraca: clics metálicos rápidos
        t = t_(d); s = np.zeros(len(t))
        for k in range(int(d / 0.07)):
            o = k * 0.07; tt = np.maximum(t - o, 0); s += (t >= o) * (hp(noise(d), 3) * 0.6 + np.sin(2 * np.pi * 3400 * tt)) * np.exp(-tt * 180)
    elif name == 'clonk':  # rueda que cae al suelo: golpe de goma con rebotes
        t = t_(0.9); s = np.zeros(len(t))
        for o, g in ((0, 1), (0.22, 0.45), (0.38, 0.22)):
            tt = np.maximum(t - o, 0); s += (t >= o) * g * (sweep(70 + 90 * np.exp(-tt * 25), tt) * np.exp(-tt * 14) + sm(noise(0.9), 10) * np.exp(-tt * 40) * 0.7)
    elif base == 'rodar':  # rueda rodando por el suelo de hormigón
        t = t_(d); s = fade(sm(noise(d), 25) * 3 * (0.7 + 0.3 * np.sin(2 * np.pi * 6 * t)), 0.05, 0.25)
    elif name == 'clunk':  # rueda que encaja en el buje
        t = t_(0.4); s = sweep(90 + 120 * np.exp(-t * 30), t) * np.exp(-t * 16) + sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * 20) for fq in (610, 1030)) * 0.3
    elif base == 'pasos':  # pasos alegres
        t = t_(d); s = np.zeros(len(t))
        for k in range(int(d / 0.25)):
            o = 0.03 + k * 0.25; tt = np.maximum(t - o, 0); s += (t >= o) * (sm(noise(d), 10) * 2 + np.sin(2 * np.pi * 90 * tt) * 0.6) * np.exp(-tt * 45)
    elif name == 'tachan':  # «ta-chán» de éxito
        t = t_(1.6); s = np.zeros(len(t))
        for o, notes, dd in ((0, (523, 659, 784), 0.18), (0.22, (523, 659, 784, 1047), 1.3)):
            tt = np.maximum(t - o, 0); g = (t >= o) * np.exp(-tt * (1.2 if dd > 1 else 14)) * np.minimum(1, tt / 0.01)
            for fq in notes: s += g * (np.sin(2 * np.pi * fq * tt) + 0.4 * np.sin(4 * np.pi * fq * tt) + 0.2 * np.sin(6 * np.pi * fq * tt))
        s *= 0.25
    elif name == 'ding2':
        t = t_(0.9); s = sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * 6) * (t >= o) for fq, o in ((1318, 0), (1976, 0.09)))
    elif name == 'ding_b':
        t = t_(1.8); s = sum(g * np.sin(2 * np.pi * fq * t) * np.exp(-t * dc) for fq, g, dc in ((2093, 1, 2.5), (3136, 0.6, 3.5), (4186, 0.4, 5), (6272, 0.2, 8)))
    else: raise KeyError(name)
    SYN[name] = s.astype(np.float64); return SYN[name]

EV = []
def ev(name, t, g_db=0.0): EV.append((name, t, g_db))
# 0) HOOK (solo efectos): golpe de cámara, caja roja que cae con golpe, gota
ev('whoosh_s', st(0), -10); ev('golpe', at(0, 'box') + 0.12, -4); ev('pop', at(0, 'box'), -8); ev('gota', st(0) + 1.4, -14)
# 1) EL SELLO: la mano entra, coge impulso, ¡golpe!; impacto y estribillo de suspenso; franja; trago
h = at(1, 'hit')
ev('whoosh', h - 1.0, -10); ev('whoosh_s', h - 0.16, -6)
ev('sello', h, 0); ev('impacto', h, -5); ev('malo', h + 0.08, -6)
ev('whoosh_s', h + 0.4, -14); ev('pop', at(1, 'sub'), -9)
ev('trago', h + 1.4, -9); ev('gota', h + 2.4, -14); ev('gota', h + 3.9, -15)
# 2) EN EL COCHE: motor todo el plano; nube de pensamiento con «pops»
ev(f"motor_{SC[2]['duration']:.2f}", st(2), -8)
th = at(2, 'think'); [ev('pop_s', th + 0.06 * j, -14) for j in range(3)]; ev('pop', th + 0.15, -9)
# 3) LA BÚSQUEDA: freno de mano; móvil que entra; deslizamientos; ¡bingo! con destellos
ev('freno', st(3) + 0.02, -12); ev('whoosh_s', at(3, 'phoneIn'), -11)
for a, b, dd in cu(3, 'flicks'): ev('tap', st(3) + a - 0.1, -12); ev('swipe', st(3) + a - 0.05, -9)
bg = at(3, 'bingo'); ev('bingo', bg, -4); ev('ting', bg + 0.05, -9); ev('chispas', bg + 0.15, -10); ev('pop', bg, -8)
# 4) LA LLAMADA: móvil, tonos de llamada, descuelga, «¡Claro!»
ev('whoosh_s', at(4, 'phone'), -12); [ev('tap', at(4, 'phone') + 0.3 + 0.12 * j, -14) for j in range(4)]
ev(f"tono_{cu(4, 'ans') - 0.7:.2f}", at(4, 'phone') + 0.6, -14); ev('descolgar', at(4, 'ans'), -10)
ev('pop', at(4, 'claro'), -7); ev('ok', at(4, 'claro') + 0.05, -9); ev('chispas', at(4, 'claro') + 0.3, -14)
# 5) EL TALLER: carraca, la rueda cae y rueda, trae la nueva, encaja, carraca, destello; corte: pasos y pulgar
lo, pu, dr, br, mo, ti = (cu(5, k) for k in ('loosen', 'pull', 'drop', 'bring', 'mount', 'tight')) if 'loosen' in SC[5]['cues'] else ([0.2, 0.9], [0.9, 1.4], [1.4, 2.1], [2.0, 2.6], [2.6, 3.1], [3.1, 4.2])
s5 = st(5)
ev(f'carraca_{lo[1] - lo[0]:.2f}', s5 + lo[0], -10); ev('whoosh_s', s5 + pu[0], -15)
ev('clonk', s5 + dr[0] + 0.21, -6); ev(f'rodar_{(dr[1] - dr[0]) * 0.7:.2f}', s5 + dr[0] + 0.21, -10)
ev(f'rodar_{br[1] - br[0]:.2f}', s5 + br[0], -14); ev('clunk', s5 + mo[1], -6)
ev(f'carraca_{ti[1] - ti[0]:.2f}', s5 + ti[0], -10); ev('chispas', s5 + ti[1], -11); ev('pop', s5 + ti[1] + 0.1, -12)
cut = s5 + SC[5]['cues'].get('cut', 5.0)
ev('pasos_0.80', cut, -12); ev('ting', cut + 0.95, -10); ev('chispas', cut + 1.0, -13)
# 6) EL SELLO VERDE: golpe, «ta-chán» y destellos
h6 = at(6, 'hit')
ev('whoosh', h6 - 1.0, -12); ev('whoosh_s', h6 - 0.16, -7); ev('sello', h6, -2)
ev('tachan', h6 + 0.05, -3); ev('chispas', h6 + 0.2, -8); ev('ting', h6 + 0.4, -11)
# 7) CTA: canal, enlace, «comenta» (solo Instagram) y la palabra en grande
ev('pop', at(7, 'card'), -8); ev('ding2', at(7, 'card') + 0.2, -10); ev('pop_s', at(7, 'link'), -12)
if not TK: ev('pop_s', at(7, 'strip'), -12); ev('pop', at(7, 'com'), -7); ev('pop', at(7, 'com') + 0.18, -8)
# 8) CIERRE
ev('whoosh', st(8) - 0.15, -9); ev('ding_b', st(8) + 0.05, -8); ev('pop_s', at(8, 'sub'), -14); ev('pop_s', at(8, 'url'), -14)

fx = np.zeros(N)
for name, t, g in EV:
    s = syn(name); s = s / max(np.abs(s).max(), 1e-9) * 10 ** ((g - 4) / 20)
    a = int(t * SR); fx[a:a + len(s)] += s[: max(0, N - a)]
synth = sorted(n for n in SYN if n not in SYN_FILE)
print('efectos desde audio/sfx/:', ', '.join(sorted(SYN_FILE)) or 'ninguno')
if synth: print('efectos sintetizados con código:', ', '.join(synth))

# ---------------- música (sin voces: a -21 dBFS RMS; baja 4 dB bajo los golpes fuertes) ----------------
MUS = os.path.join(ROOT, cfg.get('musicMp3', 'audio/musica18.mp3'))
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', MUS, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
mus = np.frombuffer(raw, '<f4').astype(np.float64).reshape(-1, 2)
mus = np.vstack([mus, np.zeros((max(0, N - len(mus)), 2))])[:N]
act = mus[int(SC[1]['start'] * SR): int((TOTAL - 2) * SR)]
mus *= 10 ** (-21 / 20) / max(np.sqrt((act ** 2).mean()), 1e-9)
envx = np.convolve(np.abs(fx), np.ones(int(0.25 * SR)) / int(0.25 * SR), 'same')
mus *= (10 ** (-4 * np.clip(envx / 0.08, 0, 1) / 20))[:, None]
mix = fx[:, None] * np.array([1.0, 1.0]) + mus
print(f'música: {os.path.relpath(MUS, ROOT)}  RMS {db(np.sqrt((mus ** 2).mean())):.1f} dBFS')
pk = np.abs(mix).max()
if pk > 0.95: mix *= 0.95 / pk
MEZ = A(cfg.get('mixWav', 'mezcla18.wav'))
with wave.open(MEZ, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
vid = os.path.join(ROOT, cfg['output']); out = os.path.join(ROOT, cfg.get('audioOut', 'video18_con_audio.mp4')); tmp = out.replace('.mp4', '.partial.mp4')
# versión ligera para redes (TikTok e Instagram vuelven a comprimir): crf 23, preset slow, tune animation
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', vid, '-i', MEZ, '-map', '0:v:0', '-map', '1:a:0',
                '-c:v', 'libx264', '-crf', '23', '-preset', 'slow', '-tune', 'animation', '-pix_fmt', 'yuv420p',
                '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, out)
print('->', os.path.relpath(out, ROOT), f'({TOTAL:.2f} s, {os.path.getsize(out) / 1e6:.1f} MB)')
