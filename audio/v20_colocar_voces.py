#!/usr/bin/env python3
"""Vídeo 20 «Se encienden las luces de Navidad»: coloca las voces de la narradora (audio/voces/narradora_<n>.mp3) al inicio
   de cada escena y escribe config20.voz.json (config20.json y video20_sin_audio.mp4 no se tocan).
   - Duración real con ffprobe; tramos con voz por energía (para el karaoke). No se acelera ninguna voz.
   - Cada escena se ajusta a su frase (voz + un margen): se recorta si sobra y se alarga si falta.
   - Momentos que siguen a la voz: escena 3, el foco se enciende con «desde el balcón» y los cantantes aparecen con
     «unas voces»; escena 5, todo se enciende con la palabra «luz».
   Uso: python3 audio/v20_colocar_voces.py"""
import os, json, copy, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
base = json.load(open(os.path.join(ROOT, 'config20.json'))); FPS = base['fps']
cfg = copy.deepcopy(base)
cfg.update({'output': 'tmp/video20_mudo.mp4', 'scenesDir': 'scenes20_voz', 'stillsDir': 'tmp/stills20_voz', 'timeline': 'timeline20_voz.txt',
            'musicMp3': 'audio/musica20.mp3', 'mixWav': 'mezcla20.wav', 'audioOut': 'tmp/video20_con_audio.mp4', 'srt': 'subtitles20.srt',
            'subtitledOut': 'video20_instagram.mp4', 'tiktokOut': 'video20_tiktok.mp4', 'burnCrf': 23, 'burnPreset': 'slow', 'burnTune': 'animation'})
TEXT = {
    1: 'Ayer, Tudela se preparaba para encender la Navidad.',
    2: 'Todo empezó con el baile: los bailarines llenaron la plaza de ritmo.',
    3: 'Y, de pronto, desde el balcón…',
    4: '…unas voces que cantaron para toda la plaza.',
    5: 'Acompañados del coro de Tudela.',
    6: 'Y después de este gran espectáculo… se hizo la luz.',
    7: 'Así empieza un diciembre lleno de ilusión. Y nos espera una feliz Navidad.',
    8: 'Desde Escaparate de Tudela, feliz Navidad.',
}
snap = lambda x: round(round(x * FPS) / FPS, 3)
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True).stdout)
def segments(p, gap=0.12):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, '<f4'); n = 320
    r = 20 * np.log10(np.sqrt((x[: len(x) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9); on = r > r.max() - 34
    segs, a, last = [], None, None
    for i, v in enumerate(on):
        t = i * 0.02
        if v:
            if a is None: a = t
            elif t - last > gap: segs.append([a, last + 0.02]); a = t
            last = t
    if a is not None: segs.append([a, last + 0.02])
    return [[round(a_, 2), round(b_, 2)] for a_, b_ in segs if b_ - a_ > 0.04]
def voice(n, start):
    p = os.path.join(ROOT, 'audio', 'voces', f'narradora_{n}.mp3'); d = dur(p)
    return {'file': os.path.relpath(p, ROOT), 'who': 'narradora', 'start': round(start, 2), 'duration': round(d, 3), 'text': TEXT[n],
            'segments': [[round(start + a, 2), round(start + b, 2)] for a, b in segments(p)]}
end = lambda v: v['start'] + v['duration']
def word_t(v, prefix):
    """momento (aprox.) en que empieza lo que sigue a 'prefix' (el tiempo con voz se reparte por letras)"""
    segs = v['segments']; tot = sum(b - a for a, b in segs); x = tot * len(prefix) / len(v['text'])
    for a, b in segs:
        if x <= b - a: return round(a + x, 2)
        x -= b - a
    return segs[-1][1]
S = {s['id']: s for s in cfg['scenes']}
old = {s['id']: s['duration'] for s in base['scenes']}
def setv(i, vs, tail, minimo=0):
    S[i]['voices'] = vs; S[i]['duration'] = snap(max(minimo, max(end(v) for v in vs) + tail))
# 0) hook sin voz (2,5 s)
# 1) la plaza a oscuras
setv(1, [voice(1, 0.25)], 0.45)
S[1]['still'] = round(S[1]['duration'] * 0.7, 2)
# 2) los bailarines: dos planos iguales
setv(2, [voice(2, 0.2)], 0.6, 6.0)
d2 = S[2]['duration']; S[2]['shots'] = {'a': [0, round(d2 / 2, 2)], 'b': [round(d2 / 2, 2), d2]}; S[2]['still'] = round(d2 / 2 + 1.4, 2)
# 3) el balcón: zoom rápido, foco con «desde el balcón», cantantes con «unas voces»; plano amplio al final
v3 = voice(3, 0.15); v4 = voice(4, end(v3) + 0.2)
setv(3, [v3, v4], 1.1)
d3 = S[3]['duration']; amp = round(end(v4) + 0.1, 2)
S[3]['shots'] = {'zoom': [0, amp], 'amplio': [amp, d3]}
S[3]['cues'].update({'spot': round(word_t(v3, 'Y, de pronto, ') - 0.05, 2), 'singers': round(v4['start'] + 0.05, 2), 'notes': round(v4['start'] + 0.5, 2)})
S[3]['still'] = round(v4['start'] + 1.6, 2)
# 4) el coro
setv(4, [voice(5, 0.2)], 1.6, 4.5)
S[4]['still'] = 3.2
# 5) se hizo la luz: todo se enciende con «luz»
v6 = voice(6, 0.2); setv(5, [v6], 3.0)
on = word_t(v6, 'Y después de este gran espectáculo… se hizo la ')
S[5]['cues']['on'] = on; S[5]['duration'] = snap(on + 3.0); S[5]['still'] = round(on + 1.8, 2)
# 6) vista amplia
setv(6, [voice(7, 0.15)], 0.45)
S[6]['still'] = round(S[6]['duration'] * 0.5, 2)
# 7) cierre
setv(7, [voice(8, 0.2)], 0.7, 4.0)
render = [i for i in S if abs(S[i]['duration'] - old[i]) > 1e-6 or i in (3, 5)]
cfg['_render'] = render
cfg['_ayuda_voz'] = 'Generado por audio/v20_colocar_voces.py a partir de config20.json (no editar a mano). _render = escenas que cambian respecto a scenes20/.'
json.dump(cfg, open(os.path.join(ROOT, 'config20.voz.json'), 'w'), ensure_ascii=False, indent=2)
fr = 0
for sc in cfg['scenes']:
    t0 = fr / FPS
    for v in sc.get('voices', []): print(f"escena {sc['id']}  {os.path.basename(v['file']):16s} {v['duration']:5.2f} s  {t0 + v['start']:6.2f} → {t0 + end(v):6.2f}  {v['segments']}")
    fr += round(sc['duration'] * FPS)
print(f'TOTAL {fr / FPS:.2f} s · escenas ' + ' '.join(f"{s['id']}:{s['duration']}" for s in cfg['scenes']) + f' · renderizar: {render}')
print('cues 3:', S[3]['cues'], ' cue 5 on:', S[5]['cues']['on'])
