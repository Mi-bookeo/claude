#!/usr/bin/env python3
"""Coloca las voces de ElevenLabs, mezcla con música y efectos, genera subtítulos
(SRT + ASS) y crea el vídeo final con subtítulos quemados en la franja inferior.

Lee: config.json (tiempos de escena), audio/voces.json (trozos de voz y textos),
     audio/musica.wav, audio/efectos.wav (de make_audio.py).
Escribe: audio/voz.wav, audio/mezcla_final.wav, subtitulos.srt, subtitulos.ass,
         marta_y_el_ultimo_2x1_voz.mp4 (voz+música+efectos, sin subtítulos),
         marta_y_el_ultimo_2x1_final.mp4 (todo + subtítulos).
"""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
cfg = json.load(open('config.json', encoding='utf-8'))
vc = json.load(open('audio/voces.json', encoding='utf-8'))
pend = [l['id'] for l in vc['lines'] if any('PENDIENTE' in (x if isinstance(x, str) else x['t']) for x in l['subs'])]
if pend: raise SystemExit('Faltan los textos de: ' + ', '.join(pend))
BASE = cfg['output'][:-4]
SR, FPS = 48000, cfg['fps']
start, fr = {}, 0
for s in cfg['scenes']:
    start[s['id']] = fr / FPS
    fr += round(s['duration'] * FPS)
TOTAL = fr / FPS
N = int(round(TOTAL * SR))

def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, '<f4').astype(np.float64)
def read_wav(path):
    with wave.open(path) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, w.getnchannels())[:, 0] / 32768
    out = np.zeros(N); out[:min(N, len(x))] = x[:N]
    return out
def write_wav(path, x):
    pcm = (np.clip(np.stack([x, x], 1), -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

src = {k: decode(v) for k, v in vc['sources'].items()}
voz = np.zeros(N)
cues = []
for ln in vc['lines']:
    a = src[ln.get('src', ln['voice'])]
    seg = a[int(ln['in'] * SR):int(ln['out'] * SR)].copy()
    fd = int(0.012 * SR)
    seg[:fd] *= np.linspace(0, 1, fd); seg[-fd:] *= np.linspace(1, 0, fd)
    t0 = start[ln['scene']] + ln['at']
    i = int(round(t0 * SR)); j = min(N, i + len(seg))
    voz[i:j] += seg[:j - i]
    dur = len(seg) / SR
    scene_end = start[ln['scene']] + next(s['duration'] for s in cfg['scenes'] if s['id'] == ln['scene'])
    print(f"{ln['id']:3} {ln['voice']:9} {t0:6.2f}–{t0 + dur:6.2f} s (escena {ln['scene']} acaba en {scene_end:.2f})")
    subs = [x if isinstance(x, dict) else {'t': x} for x in ln['subs']]
    if all('from' in x for x in subs):
        starts = [x['from'] for x in subs]
    else:
        L = [len(x['t']) for x in subs]; tot = sum(L); acc, starts = 0, []
        for l in L: starts.append(dur * acc / tot); acc += l
    for k, x in enumerate(subs):
        b = t0 + starts[k]; e = t0 + (starts[k + 1] if k + 1 < len(subs) else dur)
        cues.append({'a': b, 'b': e, 't': x['t'], 'voice': ln['voice']})

# extiende un poco cada subtítulo sin pisar el siguiente (mínimo 1 s en pantalla)
cues.sort(key=lambda c: c['a'])
for k, c in enumerate(cues):
    nxt = cues[k + 1]['a'] - 0.05 if k + 1 < len(cues) else TOTAL - 0.05
    c['b'] = min(max(c['b'] + 0.25, c['a'] + 1.0), nxt)

# ---- mezcla ----
active = np.abs(voz) > 0.01
vr = np.sqrt(np.mean(voz[active] ** 2))
voz *= 10 ** (-18 / 20) / vr                       # voz ≈ -18 dBFS RMS al hablar
music = read_wav('audio/musica.wav')               # ≈ -36 dBFS RMS -> ~18 dB por debajo
fx = read_wav('audio/efectos.wav') * 10 ** (-3 / 20)
mix = voz + music + fx
write_wav('audio/voz.wav', voz)
write_wav('audio/mezcla_premaster.wav', mix / max(1, np.abs(mix).max() / 0.98))

# normalización de sonoridad a -14 LUFS (redes sociales), lineal, en dos pasadas
p = subprocess.run(['ffmpeg', '-hide_banner', '-i', 'audio/mezcla_premaster.wav', '-af',
                    'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
js = p.stderr[p.stderr.rindex('{'):p.stderr.rindex('}') + 1]
m = json.loads(js)
lf = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'audio/mezcla_premaster.wav', '-af', lf + ',aresample=48000',
                '-c:a', 'pcm_s16le', 'audio/mezcla_final.wav'], check=True)
os.remove('audio/mezcla_premaster.wav')

# ---- subtítulos ----
def ts_srt(t):
    ms = int(round(t * 1000)); return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"
def ts_ass(t):
    cs = int(round(t * 100)); return f"{cs // 360000}:{cs // 6000 % 60:02}:{cs // 100 % 60:02}.{cs % 100:02}"
with open('subtitulos.srt', 'w', encoding='utf-8') as f:
    for k, c in enumerate(cues, 1):
        f.write(f"{k}\n{ts_srt(c['a'])} --> {ts_srt(c['b'])}\n{c['t']}\n\n")
ass = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Narradora,Baloo 2 ExtraBold,84,&H00FFFFFF,&H00FFFFFF,&H001A1A1E,&H001A1A1E,-1,0,0,0,100,100,0,0,1,8,5,2,70,70,215,1
Style: Marta,Baloo 2 ExtraBold,88,&H00B18FF4,&H00B18FF4,&H001A1A1E,&H001A1A1E,-1,0,0,0,100,100,0,0,1,8,5,2,70,70,215,1
Style: Lucia,Baloo 2 ExtraBold,88,&H002EC1F2,&H002EC1F2,&H001A1A1E,&H001A1A1E,-1,0,0,0,100,100,0,0,1,8,5,2,70,70,215,1
Style: Panadera,Baloo 2 ExtraBold,88,&H00F2E3BF,&H00F2E3BF,&H001A1A1E,&H001A1A1E,-1,0,0,0,100,100,0,0,1,8,5,2,70,70,215,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
for c in cues:
    st = {'marta': 'Marta', 'lucia': 'Lucia', 'panadera': 'Panadera'}.get(c['voice'], 'Narradora')
    ass += f"Dialogue: 0,{ts_ass(c['a'])},{ts_ass(c['b'])},{st},,0,0,0,,{{\\fad(60,60)}}{c['t']}\n"
open('subtitulos.ass', 'w', encoding='utf-8').write(ass)

# ---- vídeos ----
e = cfg['encoder']
tmp = BASE + '_voz.partial.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', cfg['output'], '-i', 'audio/mezcla_final.wav',
                '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest',
                '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, BASE + '_voz.mp4')
tmp = BASE + '_final.partial.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', cfg['output'], '-i', 'audio/mezcla_final.wav',
                '-map', '0:v', '-map', '1:a', '-vf', 'subtitles=subtitulos.ass:fontsdir=fonts',
                '-c:v', e['codec'], '-preset', e['preset'], '-crf', str(e['crf']), '-pix_fmt', e['pix_fmt'], '-r', str(FPS),
                '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, BASE + '_final.mp4')
print(f"{len(cues)} subtítulos · sonoridad de entrada {m['input_i']} LUFS -> -14 LUFS")
