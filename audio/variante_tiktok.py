#!/usr/bin/env python3
"""Versión TikTok: el mismo vídeo SIN la parte de «comenta» (en voz, subtítulos y textos en pantalla).
   Parte de config.json (la versión Instagram, completa) y escribe config.tiktok.json:
   - maria_6 se corta al final de su primer tramo («En la descripción tienes el enlace al canal de WhatsApp»)
     -> audio/voces/maria_6_tiktok.wav; el plano 6A se acorta y los planos siguientes se adelantan.
   - sin la franja «Comenta CANAL» y «Formulario en la descripción» sin «· Comenta ALTA» (config.variant = 'tiktok').
   Después (ver README de la rama / CLAUDE.md):
     CONFIG=config.tiktok.json node render.js scenes 6   (las escenas 1-5 son las mismas: se enlazan desde scenes/)
     CONFIG=config.tiktok.json node render.js concat
     CONFIG=config.tiktok.json python3 audio/make_music.py && CONFIG=config.tiktok.json python3 audio/make_audio.py
     CONFIG=config.tiktok.json python3 audio/subtitulos.py --burn   -> escaparate_lanzamiento_tiktok.mp4 (ligero)"""
import copy, json, os, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(ROOT, 'config.json'))); FPS = cfg['fps']
snap = lambda x: round(round(x * FPS) / FPS, 3)
dur = lambda p: float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True).stdout)
tk = copy.deepcopy(cfg)
tk.update({'variant': 'tiktok', 'title': cfg['title'] + ' (TikTok)', 'output': 'tmp/tiktok_mudo.mp4', 'scenesDir': 'scenes_tiktok',
           'timeline': 'timeline_tiktok.txt', 'musicWav': 'audio/musica_tiktok.wav', 'mixWav': 'mezcla_tiktok.wav', 'srt': 'subtitles_tiktok.srt',
           'subtitledOut': 'escaparate_lanzamiento_tiktok.mp4', 'burnCrf': 23, 'burnPreset': 'slow'})
sc = next(s for s in tk['scenes'] if s['id'] == 6)
v = next(x for x in sc['voices'] if x['file'].endswith('maria_6.wav'))
seg0 = v['segments'][0]
cut = seg0[1] - v['start'] + 0.08                     # fin del primer tramo (en el archivo)
src = os.path.join(ROOT, v['file']); out = os.path.join(ROOT, 'audio', 'voces', 'maria_6_tiktok.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-t', f'{cut:.3f}', '-af', f'afade=t=out:st={cut - 0.06:.3f}:d=0.06', '-ar', '48000', '-ac', '1', out], check=True)
d = dur(out)
v.update({'file': os.path.relpath(out, ROOT), 'duration': round(d, 3), 'text': 'En la descripción tienes el enlace al canal de WhatsApp.', 'segments': [seg0]})
oldA = sc['shots']['A'][1]; newA = snap(max(v['start'] + d + 0.45, 2.6)); delta = round(oldA - newA, 3)
sc['shots']['A'][1] = newA
for k in ('B', 'C', 'FIN'): sc['shots'][k] = [snap(sc['shots'][k][0] - delta), snap(sc['shots'][k][1] - delta)]
sc['duration'] = snap(sc['duration'] - delta)
for x in sc['voices']:
    if x['start'] >= oldA - 1e-6:
        x['start'] = round(x['start'] - delta, 3); x['segments'] = [[round(a - delta, 2), round(b - delta, 2)] for a, b in x['segments']]
talk = {}
for x in sc['voices']:
    for a, b in x['segments']:
        r = talk.setdefault(x['who'], [])
        if r and a - r[-1][1] < 0.2: r[-1][1] = round(b + 0.05, 2)
        else: r.append([round(max(0, a - 0.03), 2), round(b + 0.05, 2)])
sc['talk'] = talk
c = sc['cues']; c['A_strip'] = 99.0; c['A_thumb'] = round(seg0[1] - 0.5, 2); c['A_who'] = round(c['A_link'] + 1.3, 2)
sc['name'] = sc['name'].replace('A) María «Comenta CANAL» (clientes)', 'A) María «Enlace al canal de WhatsApp en la descripción» (clientes)') + ' [TikTok: sin «comenta»]'
json.dump(tk, open(os.path.join(ROOT, 'config.tiktok.json'), 'w'), ensure_ascii=False, indent=2)
# las escenas 1-5 son idénticas: se enlazan desde scenes/
os.makedirs(os.path.join(ROOT, 'scenes_tiktok'), exist_ok=True)
for s in tk['scenes']:
    if s['id'] == 6: continue
    a, b = os.path.join(ROOT, 'scenes', f"scene_{s['id']:02d}.mp4"), os.path.join(ROOT, 'scenes_tiktok', f"scene_{s['id']:02d}.mp4")
    if os.path.exists(b): os.remove(b)
    os.link(a, b)
print(f'maria_6_tiktok.wav {d:.2f} s · plano 6A {oldA:.3f} -> {newA:.3f} s · escena 6 {sc["duration"]:.3f} s · total {sum(round(s["duration"] * FPS) for s in tk["scenes"]) / FPS:.2f} s')
