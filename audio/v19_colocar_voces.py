#!/usr/bin/env python3
"""Vídeo 19 «El precio de antes»: coloca las voces de la narradora (audio/voces/narradora19_<n>.mp3) al inicio de cada escena
   y escribe config19.voz.json (Instagram) y config19.tiktok.json (TikTok, sin «comenta») (config19.json y video19_sin_audio.mp4 no se tocan).
   - Duración real con ffprobe; tramos con voz por energía (para el karaoke). No se acelera ninguna voz: si las frases
     no caben, se alarga la escena (y se renderizan solo esa escena y la siguiente).
   - Escena 1: los planos (cortes secos) siguen a la voz: A izq. «Dos carteles», B der. «el mismo producto»,
     C izq. «A la izquierda, un precio suelto…», D los dos con flecha en «A la derecha… doce euros».
   Uso: python3 audio/v19_colocar_voces.py"""
import os, json, copy, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
base = json.load(open(os.path.join(ROOT, 'config19.json'))); FPS = base['fps']
cfg = copy.deepcopy(base)
cfg.update({'output': 'tmp/video19_mudo.mp4', 'scenesDir': 'scenes19_voz', 'stillsDir': 'tmp/stills19_voz', 'timeline': 'timeline19_voz.txt',
            'musicMp3': 'audio/musica.mp3', 'mixWav': 'mezcla19.wav', 'audioOut': 'tmp/video19_con_audio.mp4', 'srt': 'subtitles19.srt',
            'subtitledOut': 'video19_instagram.mp4', 'tiktokOut': 'video19_tiktok.mp4'})
TEXT = {
    1: 'Dos carteles. El mismo producto. ¿Cuál vende más? A la izquierda, un precio suelto: siete euros con veinte. A la derecha, el mismo precio, pero con el de antes: doce euros.',
    2: 'Tu cerebro no calcula.', 3: 'Compara.',
    4: 'Sin una referencia, no sabe si siete euros con veinte es mucho o es poco. Con el precio de antes, lo ve claro: es un ahorro.',
    5: 'Eso se llama efecto ancla.',
    6: 'El primer número que ves se te queda enganchado, como un ancla, y todo lo demás lo comparas con él.',
    7: 'Pero ojo: el precio de antes tiene que ser real. Uno inflado puede jugar en tu contra.',
    8: 'En Escaparate de Tudela pones el precio de antes y el de ahora, y le llega directo al móvil de tus clientes.',
    9: 'Si tienes un comercio, en la descripción tienes el enlace al formulario.',
    10: 'O comenta alta y te lo enviamos.',
    11: 'Escaparate de Tudela. Tus ofertas, en la mano de tus clientes.',
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
    p = os.path.join(ROOT, 'audio', 'voces', f'narradora19_{n}.mp3'); d = dur(p)
    return {'file': os.path.relpath(p, ROOT), 'who': 'narradora', 'start': round(start, 2), 'duration': round(d, 3), 'text': TEXT[n],
            'segments': [[round(start + a, 2), round(start + b, 2)] for a, b in segments(p)]}
end = lambda v: v['start'] + v['duration']
S = {s['id']: s for s in cfg['scenes']}
changed = []
def setv(i, vs, tail=0.4):
    sc = S[i]; sc['voices'] = vs; need = max(end(v) for v in vs) + tail
    if need > sc['duration'] + 1e-6: sc['duration'] = snap(need); changed.append(i)

# 0) hook sin voz
# 1) los dos carteles; los planos siguen a la voz (pausas medidas en la grabación: «¿Cuál vende más?» acaba a 3,28 s,
#    «A la izquierda» empieza a 3,54 s y «A la derecha» a 6,93 s del original)
v = voice(1, 0.2); setv(1, [v])
o = v['start']; d1 = S[1]['duration']
S[1]['shots'] = {'A': [0, round(o + 1.25, 2)], 'B': [round(o + 1.25, 2), round(o + 3.4, 2)], 'C': [round(o + 3.4, 2), round(o + 6.8, 2)], 'D': [round(o + 6.8, 2), d1]}
S[1]['still'] = round(o + 8.5, 2)
# 2) el cerebro: «Tu cerebro no calcula.» «Compara.» (la franja con «Compara»)
v2 = voice(2, 0.15); v3 = voice(3, end(v2) + 0.2); setv(2, [v2, v3])
# 3) sin referencia
setv(3, [voice(4, 0.15)])
# 4) el efecto ancla: «Eso se llama efecto ancla» acaba justo cuando entra el rótulo
v5 = voice(5, 0.3); v6 = voice(6, end(v5) + 0.2); setv(4, [v5, v6])
# 5) tiene que ser real
setv(5, [voice(7, 0.15)])
# 6) en Escaparate
setv(6, [voice(8, 0.05)], tail=0.12)
# 7) CTA
v9 = voice(9, 0.1); v10 = voice(10, end(v9) + 0.2); setv(7, [v9, v10])
def word_t(v, prefix):
    """momento (aprox.) en que empieza lo que sigue a 'prefix' (el tiempo con voz se reparte por letras)"""
    segs = v['segments']; tot = sum(b - a for a, b in segs); x = tot * len(prefix) / len(v['text'])
    for a, b in segs:
        if x <= b - a: return round(a + x, 2)
        x -= b - a
    return segs[-1][1]
# orden del cierre (CLAUDE.md): primero el enlace al formulario, luego «comenta ALTA»; al decirlo, solo «Comenta / ALTA» en grande
c7 = S[7]['cues']; c7.update({'board': 0.1, 'flash': 0.1, 'link': round(word_t(v9, 'Si tienes un comercio, ') - 0.1, 2),
                              'btn': round(end(v9) - 0.5, 2), 'com': round(word_t(v10, 'O ') - 0.05, 2)})
S[7]['still'] = round(c7['com'] + 0.8, 2)
S[7]['name'] = 'CTA: fondo rojo; «¿TIENES UN COMERCIO?», «Enlace al formulario en la descripción», botón «COMENTA: ALTA»; al decir «comenta ALTA» queda solo «Comenta / ALTA» en grande'
# 8) cierre
setv(8, [voice(11, 0.1)], tail=0.6)
render = sorted(set(changed + [i + 1 for i in changed if i + 1 in S]))
cfg['textos'].update({'s7f': 'Comenta', 's7g': 'ALTA'})
cfg['burnCrf'] = 23; cfg['burnPreset'] = 'slow'; cfg['burnTune'] = 'animation'   # versiones ligeras para redes
# ---------- TikTok: sin «O comenta alta y te lo enviamos» (ni voz, ni subtítulo, ni botón, ni palabra en grande) ----------
tk = copy.deepcopy(cfg)
tk.update({'variant': 'tiktok', 'output': 'tmp/video19_tiktok_mudo.mp4', 'scenesDir': 'scenes19_tiktok', 'stillsDir': 'tmp/stills19_tiktok',
           'timeline': 'timeline19_tiktok.txt', 'mixWav': 'mezcla19_tiktok.wav', 'audioOut': 'tmp/video19_tiktok_con_audio.mp4',
           'srt': 'subtitles19_tiktok.srt', 'subtitledOut': 'video19_tiktok.mp4', 'tiktokOut': 'video19_tiktok.mp4'})
t7 = [x for x in tk['scenes'] if x['id'] == 7][0]
t7['voices'] = [copy.deepcopy(v9)]; t7['cues'] = {'board': 0.1, 'flash': 0.1, 'link': c7['link']}
t7['duration'] = snap(end(v9) + 0.45); t7['still'] = round(c7['link'] + 1.2, 2)
t7['name'] = 'CTA (TikTok, sin «comenta»): fondo rojo; «¿TIENES UN COMERCIO?» y «Enlace al formulario en la descripción»'
tk['_render'] = [7]
json.dump(tk, open(os.path.join(ROOT, 'config19.tiktok.json'), 'w'), ensure_ascii=False, indent=2)
cfg['_render'] = render
cfg['_ayuda_voz'] = 'Generado por audio/v19_colocar_voces.py a partir de config19.json (no editar a mano). _render = escenas que cambian respecto a scenes19/.'
json.dump(cfg, open(os.path.join(ROOT, 'config19.voz.json'), 'w'), ensure_ascii=False, indent=2)
fr = 0
for sc in cfg['scenes']:
    t0 = fr / FPS
    for v in sc.get('voices', []): print(f"escena {sc['id']}  {os.path.basename(v['file']):20s} {v['duration']:5.2f} s  {t0 + v['start']:6.2f} → {t0 + end(v):6.2f}")
    fr += round(sc['duration'] * FPS)
print(f'TOTAL {fr / FPS:.2f} s · escenas ' + ' '.join(f"{s['id']}:{s['duration']}" for s in cfg['scenes']) + f' · renderizar: {render}')
