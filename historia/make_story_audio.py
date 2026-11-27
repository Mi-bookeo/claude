#!/usr/bin/env python3
"""Audio de la historia (8 s): reutiliza los instrumentos y efectos de audio/make_audio.py."""
import json, os, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
src = open('audio/make_audio.py', encoding='utf-8').read()
instr = src.split('\ndef cue(', 1)[0]
fxdefs = src.split('# =================== EFECTOS ===================', 1)[1].split('# lluvia: escenas', 1)[0]
ns = {'__file__': os.path.abspath('audio/make_audio.py')}
exec(instr, ns)
cfg = json.load(open('config.json', encoding='utf-8'))
D = cfg['story']['duration']; SR = ns['SR']
ns['TOTAL'] = D; ns['N'] = int(round(D * SR))
exec(fxdefs, ns)
g = ns; add, buf = g['add'], g['buf']
N = g['N']; BEAT = g['BEAT']

# ---- música: groove de carrera (ukelele + pizzicato + palmas + glockenspiel)
music = buf(); bar = 4 * BEAT
PATTERN = [(0, False, 1.0), (2, False, 0.85), (3, True, 0.6), (5, True, 0.6), (6, False, 0.8), (7, True, 0.55)]
for b in range(int(np.ceil(D / bar)) + 1):
    t0 = b * bar; ch = g['PROG'][b % 4]
    for e8, up, v in PATTERN: add(music, g['strum'](ch, up, v), t0 + e8 * BEAT / 2, 0.22)
    for bt in (0, 2): add(music, g['pizz'](g['ROOTS'][ch] + (0 if bt == 0 else 7)), t0 + bt * BEAT, 0.42)
    for bt in (1, 3): add(music, g['clap'](), t0 + bt * BEAT, 0.30)
    if t0 >= 3.4:
        for k, m in enumerate(g['MEL'][ch]):
            if m: add(music, g['glock'](m), t0 + k * BEAT, 0.16)
add(music, g['cymbal'](1.6), 3.5, 0.07)
fade = int(0.3 * SR); music[-fade:] *= np.linspace(1, 0, fade)

# ---- efectos
fx = buf()
add(fx, g['rain_noise'](D), 0, 0.06)
k = 0
while k * 0.2 < D:
    add(fx, g['step'](1.0), 0.05 + k * 0.2, 0.32); add(fx, g['splash'](), 0.05 + k * 0.2, 0.07); k += 1
k = 0
while k * 0.25 < D:
    add(fx, g['tick'](2800 if k % 2 == 0 else 2100), k * 0.25, 0.26); k += 1
add(fx, g['whoosh'](0.35), 0.15, 0.4)                 # cae el cartel
add(fx, g['pop'](700, 300, 0.12), 0.42, 0.45)
for i in range(7):                                    # una palabra = un pop, cada vez más agudo
    f0 = 900 * 2 ** (i / 9)
    add(fx, g['pop'](f0, f0 * 0.45, 0.08), 0.6 + i * 0.17 + 0.03, 0.45)
for d in range(3):                                    # puntos suspensivos
    add(fx, g['plop'](500 + d * 220, 1200 + d * 300, 0.08), 1.95 + d * 0.15, 0.35)
add(fx, g['boing'](0.45), 2.45, 0.45)                 # ojos
add(fx, g['slide_whistle'](0.4), 2.95, 0.12)
add(fx, g['whoosh'](0.3), 3.25, 0.45)                 # sello «Mañana lo ves.»
tt = g['tt']; t = tt(0.5)
boom = np.sin(2 * np.pi * (110 * np.exp(-t * 6) + 45) * t) * np.exp(-t * 7)
add(fx, boom, 3.5, 0.9); add(fx, g['step'](1.6), 3.5, 0.6)
add(fx, g['bell'](1760, 1.4, 3.0), 3.53, 0.25); add(fx, g['bell'](2640, 1.0, 3.6), 3.58, 0.14)
for tb in (3.62, 3.7, 3.78): add(fx, g['bell'](3520, 0.5, 6), tb, 0.06)
for tb in (5.3, 7.2): add(fx, g['pop'](1500, 900, 0.05), tb, 0.2)   # parpadeos

music = music * (10 ** (-14 / 20) / np.abs(music).max())
fx = fx * (10 ** (-6 / 20) / np.abs(fx).max())
mix = music + fx; mix /= max(1, np.abs(mix).max() / 0.95)
pcm = (np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype('<i2')
import wave
with wave.open('historia/historia_premaster.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
p = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'historia/historia_premaster.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
m = json.loads(p.stderr[p.stderr.rindex('{'):p.stderr.rindex('}') + 1])
lf = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
      f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'historia/historia_premaster.wav', '-af', lf + ',aresample=48000', '-c:a', 'pcm_s16le', 'historia/historia_audio.wav'], check=True)
os.remove('historia/historia_premaster.wav')
tmp = 'historia/historia_marta.partial.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'historia/historia_marta_mudo.mp4', '-i', 'historia/historia_audio.wav', '-map', '0:v', '-map', '1:a',
                '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, 'historia/historia_marta.mp4')
print(f"historia: {D} s · {m['input_i']} LUFS -> -14 LUFS")
