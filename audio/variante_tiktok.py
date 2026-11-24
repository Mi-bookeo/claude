#!/usr/bin/env python3
"""Versión TikTok del vídeo 16: el mismo vídeo SIN la parte de «comenta» (en voz, subtítulos y textos en pantalla).
   Parte de config.json (la versión Instagram, completa) y escribe config.tiktok.json:
   - se quita sara_6 («Y si tienes un comercio o un servicio, comenta alta y te lo enviamos»);
     el plano 9A se acorta (la tarjeta final se adelanta y sigue al final).
   - sin el texto «Comenta ALTA y te lo enviamos» (config.variant = 'tiktok').
   Después:
     CONFIG=config.tiktok.json node render.js scenes 9   (las escenas 1-8 son las mismas: se enlazan desde scenes/)
     CONFIG=config.tiktok.json node render.js concat
     CONFIG=config.tiktok.json python3 audio/make_music.py && CONFIG=config.tiktok.json python3 audio/make_audio.py
     CONFIG=config.tiktok.json python3 audio/subtitulos.py --burn   -> hueco_de_las_cinco_tiktok.mp4 (ligero)"""
import copy, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(ROOT, 'config.json'))); FPS = cfg['fps']
snap = lambda x: round(round(x * FPS) / FPS, 3)
tk = copy.deepcopy(cfg)
tk.update({'variant': 'tiktok', 'title': cfg['title'] + ' (TikTok)', 'output': 'tmp/tiktok_mudo.mp4', 'scenesDir': 'scenes_tiktok',
           'timeline': 'timeline_tiktok.txt', 'musicWav': 'audio/musica_tiktok.wav', 'mixWav': 'mezcla_tiktok.wav', 'srt': 'subtitles_tiktok.srt',
           'subtitledOut': 'hueco_de_las_cinco_tiktok.mp4', 'burnCrf': 23, 'burnPreset': 'slow'})
sc = next(s for s in tk['scenes'] if s['id'] == 9)
sc['voices'] = [v for v in sc['voices'] if not v['file'].endswith('sara_6.wav')]
v5 = sc['voices'][-1]; end5 = v5['start'] + v5['duration']
oldA = sc['shots']['A'][1]; newA = snap(max(end5 + 1.4, 4.6)); delta = round(oldA - newA, 3)
sc['shots']['A'][1] = newA; sc['shots']['FIN'] = [newA, snap(newA + 2.0)]; sc['duration'] = snap(newA + 2.0)
sc['talk'] = {'sara': [r for r in sc['talk']['sara'] if r[0] < end5]}
c = sc['cues']; c['url'] = round(c['strip'] + 0.9, 2); c['thumb'] = round(end5 + 0.1, 2); c['wink'] = round(end5 + 0.7, 2)
sc['name'] += ' [TikTok: sin «comenta»]'
json.dump(tk, open(os.path.join(ROOT, 'config.tiktok.json'), 'w'), ensure_ascii=False, indent=2)
os.makedirs(os.path.join(ROOT, 'scenes_tiktok'), exist_ok=True)
for s in tk['scenes']:
    if s['id'] == 9: continue
    a, b = os.path.join(ROOT, 'scenes', f"scene_{s['id']:02d}.mp4"), os.path.join(ROOT, 'scenes_tiktok', f"scene_{s['id']:02d}.mp4")
    if os.path.exists(b): os.remove(b)
    os.link(a, b)
print(f'plano 9A {oldA:.3f} -> {newA:.3f} s · escena 9 {sc["duration"]:.3f} s · total {sum(round(s["duration"] * FPS) for s in tk["scenes"]) / FPS:.2f} s')
