#!/usr/bin/env python3
"""Story «Ayer, un gran espectáculo para iluminar Tudela» (vídeo 20, plaza con kiosco): música navideña original +
   efectos y vídeo con audio. Sin voz. Los instrumentos son los de audio/v20_music.py (se cargan de ese archivo).
   Música: espera suave (cuerdas C · Am · F y celesta) hasta un segundo antes del encendido; UN SEGUNDO DE SILENCIO;
   al encenderse, acorde grande con campanas y «Jingle Bells» alegre (dominio público, arreglo propio) a 120 bpm con
   cascabeles, bajo y bombo suave; acorde final con campanas. Fundido de entrada 0,5 s y de salida 1,5 s.
   Efectos (sintetizados): zumbido grave en la espera, whoosh y pops de la caja, golpe grave + arpegio de campanillas
   + chispas al encenderse, ovación suave de la gente y campanillas.
   Uso: CONFIG=config20.espectaculo.json node render.js scenes && CONFIG=config20.espectaculo.json node render.js concat
        python3 audio/v20_espectaculo_audio.py   -> video20_story_espectaculo.mp4 (versión ligera: crf 23, slow, animation)"""
import os, json, wave, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(ROOT, os.environ.get('CONFIG', 'config20.espectaculo.json'))))
SR, FPS = 48000, cfg['fps']
sc = cfg['scenes'][0]; TOTAL = round(sc['duration'] * FPS) / FPS; ON = sc['cues']['on']
N = int(TOTAL * SR) + SR
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(32)
# instrumentos de v20_music.py (piano, celesta, bellc, strings, bass, sleigh, kick, add…)
src = open(os.path.join(ROOT, 'audio', 'v20_music.py')).read()
exec(src[src.index('mid = lambda m'):src.index('# ---------------- 1) EXPECTANTE')])
CH = {'C': [48, 55, 60, 64], 'Am': [45, 52, 57, 60], 'F': [41, 53, 57, 60], 'G7': [43, 53, 59, 62]}
# 1) espera
t = 0.0
for ch in ('C', 'Am', 'F'):
    d = min(0.9, ON - 1.0 - t)
    if d <= 0: break
    add(strings(CH[ch][1:], d, att=0.4, rel=0.25, bright=0.5), t, 0.45); t += 0.75
for o, m in ((0.4, 79), (1.1, 84), (1.7, 83)): add(celesta(m), o, 0.16)
L[int((ON - 1.0) * SR):int(ON * SR)] = 0; R[int((ON - 1.0) * SR):int(ON * SR)] = 0
# 2) encendido
add(strings([48, 60, 64, 67, 72, 76], 1.6, att=0.03, rel=0.8, bright=1.1), ON, 0.7)
for m in (36, 48): add(piano(m, 2.0), ON, 0.3)
for j, m in enumerate([72, 76, 79, 84, 88, 91]): add(bellc(m), ON + 0.08 * j, 0.1, (-0.5, 0.5)[j % 2])
# 3) Jingle Bells alegre
q = 0.5; t0 = ON + 0.6
JB = [(76, 1), (76, 1), (76, 2), (76, 1), (76, 1), (76, 2), (76, 1), (79, 1), (72, 1.5), (74, 0.5), (76, 4)]
t = t0
for m, b in JB:
    if t >= TOTAL - 0.3: break
    add(piano(m, b * q * 0.9), t, 0.32, 0.1); add(piano(m - 12, b * q * 0.9, 0.6), t, 0.16, 0.1); add(celesta(m + 12, 0.6), t, 0.05, -0.3)
    t += b * q
for b in range(int((TOTAL - t0) / q)):
    tb = t0 + b * q; ch = ['C', 'C', 'C', 'G7'][(b // 4) % 4]
    add(bass(CH[ch][0], q * 0.9), tb, 0.33 if b % 2 == 0 else 0.24); add(kick(), tb, 0.2 if b % 2 == 0 else 0.1)
    if b % 2: [add(piano(m, q * 0.6, 0.7), tb, 0.08, -0.25) for m in CH[ch][1:]]
    add(sleigh(), tb, 0.12, 0.5); add(sleigh(0.08), tb + q / 2, 0.08, 0.5)
add(bellc(84, 3.0), TOTAL - 1.8, 0.1); add(bellc(79, 3.0), TOTAL - 1.7, 0.08)
mus = np.stack([L, R], 1)[: int(TOTAL * SR)]
mus *= 10 ** (-20 / 20) / max(np.sqrt((mus ** 2).mean()), 1e-9)
fi, fo = int(0.5 * SR), int(1.5 * SR); mus[:fi] *= np.linspace(0, 1, fi)[:, None]; mus[-fo:] *= np.linspace(1, 0, fo)[:, None]
os.makedirs(os.path.join(ROOT, 'audio'), exist_ok=True)
MUS = os.path.join(ROOT, cfg['musicMp3']); wv = MUS.replace('.mp3', '.wav')
with wave.open(wv, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mus * 0.9, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wv, '-c:a', 'libmp3lame', '-b:a', '192k', MUS], check=True); os.remove(wv)
# efectos (los sintetizadores de v20_audio.py)
asrc = open(os.path.join(ROOT, 'audio', 'v20_audio.py')).read()
g = {'np': np, 'os': os, 'SR': SR, 'rng': rng, 'A': lambda *p: os.path.join(ROOT, 'audio', *p), 'subprocess': subprocess}
exec(asrc[asrc.index('def load('):asrc.index('SYN, SYN_FILE')], g)
exec(asrc[asrc.index('SYN, SYN_FILE'):asrc.index('EV = []')], g)
fx = np.zeros(int(TOTAL * SR))
def ev(name, t, gdb):
    s = g['syn'](name); s = s / max(np.abs(s).max(), 1e-9) * 10 ** ((gdb - 7) / 20); a = int(t * SR); fx[a:a + len(s)] += s[: max(0, len(fx) - a)]
c = sc['cues']
ev('zumbido', 0, -14); ev('whoosh', c['box'] - 0.15, -6); ev('pop', c['l1'], -10); ev('pop', c['l2'], -9)
ev('golpe', ON, 0); ev('arpegio', ON + 0.05, -6); ev('chispas', ON + 0.1, -14); ev('ovacion', ON + 0.2, -13); ev('campanillas', ON + 1.2, -16)
fx[int((ON - 1.0) * SR):int(ON * SR)] = 0
mix = mus + fx[:, None]
pk = np.abs(mix).max(); mix *= 0.95 / pk if pk > 0.95 else 1
MEZ = os.path.join(ROOT, 'audio', cfg['mixWav'])
with wave.open(MEZ, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
vid = os.path.join(ROOT, cfg['output']); out = os.path.join(ROOT, cfg['audioOut']); tmp = out.replace('.mp4', '.partial.mp4')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', vid, '-i', MEZ, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'libx264', '-crf', '23', '-preset', 'slow', '-tune', 'animation',
                '-pix_fmt', 'yuv420p', '-af', 'loudnorm=I=-15:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, out); print('->', os.path.relpath(out, ROOT), f'({TOTAL:.2f} s, {os.path.getsize(out) / 1e6:.1f} MB) · música', os.path.relpath(MUS, ROOT))
