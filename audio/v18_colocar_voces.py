#!/usr/bin/env python3
"""Vídeo 18 «Pedro y la ITV»: coloca las voces (audio/voces/pedro18_<n>.mp3, mecanico18_1.mp3) en config18.json y crea
   config18.tiktok.json (sin «O comenta canal y te lo enviamos»).
   - Duración real con ffprobe; tramos con voz por energía (boca de Pedro y subtítulos). No se acelera ninguna voz:
     si las frases no caben, se alarga la escena.
   - Momentos sincronizados con la voz: «RUEDAS EN MAL ESTADO» con «¿Por las ruedas?», nube de las ruedas, «bingo»,
     la llamada (descuelga → Pedro habla → «Claro, tráigalo cuando quiera»), enlace y «comenta CANAL» del CTA.
   Uso: python3 audio/v18_colocar_voces.py   (después: render de las escenas, audio y subtítulos)"""
import os, json, copy, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = os.path.join(ROOT, 'config18.json')
cfg = json.load(open(CFG)); FPS = cfg['fps']
TEXT = {
    'pedro18_1': '¿Desfavorable?', 'pedro18_2': '¿Por las ruedas?', 'pedro18_3': 'Vaya por Dios.',
    'pedro18_4': '¿Y ahora dónde busco yo unas ruedas?', 'pedro18_5': 'Y a ver cómo me cuestan lo menos posible.',
    'pedro18_6': 'A ver si en Escaparate de Tudela hay suerte.', 'pedro18_7': '¡Bingo! Dos por uno en ruedas.',
    'pedro18_8': 'Buenas, he visto su oferta de ruedas en Escaparate de Tudela. ¿Puedo pasar ahora?',
    'mecanico18_1': 'Claro, tráigalo cuando quiera.',
    'pedro18_9': '¡Dos por uno! Ruedas nuevas y a otra cosa.', 'pedro18_10': '¡Favorable! A la segunda ha ido a la vencida.',
    'pedro18_11': 'Si tú también quieres aprovechar ofertas como esta, o las que publiquen los comercios de nuestra ciudad, en la descripción tienes el enlace al canal de WhatsApp.',
    'pedro18_12': 'O comenta canal y te lo enviamos.', 'pedro18_13': 'Escaparate de Tudela. No te pierdas ninguna.',
}
snap = lambda x: round(round(x * FPS) / FPS, 3)
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True).stdout)
def energy(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, '<f4'); n = 320
    return 20 * np.log10(np.sqrt((x[: len(x) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9)
def segments(p, gap=0.12):
    r = energy(p); on = r > r.max() - 34
    segs, a, last = [], None, None
    for i, v in enumerate(on):
        t = i * 0.02
        if v:
            if a is None: a = t
            elif t - last > gap: segs.append([a, last + 0.02]); a = t
            last = t
    if a is not None: segs.append([a, last + 0.02])
    return [[round(a_, 2), round(b_, 2)] for a_, b_ in segs if b_ - a_ > 0.04]
def voice(name, start):
    p = os.path.join(ROOT, 'audio', 'voces', name + '.mp3'); d = dur(p)
    return {'file': os.path.relpath(p, ROOT), 'who': name.split('18')[0], 'start': round(start, 2), 'duration': round(d, 3), 'text': TEXT[name],
            'segments': [[round(start + a, 2), round(start + b, 2)] for a, b in segments(p)]}
end = lambda v: v['start'] + v['duration']
def word_t(v, prefix):
    """momento (aprox.) en que empieza lo que sigue a 'prefix' (el tiempo con voz se reparte por letras)"""
    segs = v['segments']; tot = sum(b - a for a, b in segs); x = tot * len(prefix) / len(v['text'])
    for a, b in segs:
        if x <= b - a: return round(a + x, 2)
        x -= b - a
    return segs[-1][1]
def talk_of(vs):
    talk = []
    for v in vs:
        if v['who'] != 'pedro': continue
        for a, b in v['segments']:
            if talk and a - talk[-1][1] < 0.15: talk[-1][1] = round(b + 0.04, 2)
            else: talk.append([round(max(0, a - 0.03), 2), round(b + 0.04, 2)])
    return {'pedro': talk}
S = {s['id']: s for s in cfg['scenes']}
def setv(i, vs, dmin, tail=0.6):
    sc = S[i]; sc['voices'] = vs; sc['talk'] = talk_of(vs); sc['duration'] = snap(max(dmin, max(end(v) for v in vs) + tail))

S[0].pop('voices', None)
# 1) el sello: tras el golpe, «¿Desfavorable?» «¿Por las ruedas?» «Vaya por Dios.»
c = S[1]['cues']; v1 = voice('pedro18_1', c['hit'] + 0.55); v2 = voice('pedro18_2', end(v1) + 0.25); v3 = voice('pedro18_3', end(v2) + 0.3)
c['sub'] = round(v2['start'] + 0.05, 2); setv(1, [v1, v2, v3], 6.0); S[1]['still'] = round(v2['start'] + 0.6, 2)
# 2) en el coche: piensa en voz alta; la nube aparece al decir «unas ruedas»
v4 = voice('pedro18_4', 0.45); v5 = voice('pedro18_5', end(v4) + 0.3)
S[2]['cues']['think'] = round(word_t(v4, '¿Y ahora dónde busco yo ') - 0.1, 2); setv(2, [v4, v5], 7.5); S[2]['still'] = round(end(v4) + 0.4, 2)
# 3) la búsqueda: «A ver si en Escaparate de Tudela hay suerte» … «¡Bingo! Dos por uno en ruedas.»
c = S[3]['cues']; v6 = voice('pedro18_6', 0.5); c['phoneIn'] = 0.25
c['flicks'] = [[round(end(v6) + 0.1, 2), round(end(v6) + 1.2, 2), 430], [round(end(v6) + 1.45, 2), round(end(v6) + 2.6, 2), 440], [round(end(v6) + 2.85, 2), round(end(v6) + 4.2, 2), 341]]
c['bingo'] = round(c['flicks'][2][1], 2); v7 = voice('pedro18_7', c['bingo'] + 0.05)
setv(3, [v6, v7], 0); S[3]['duration'] = snap(end(v7) + 1.0); S[3]['still'] = round(c['bingo'] + 0.9, 2)
# 4) la llamada: suena, descuelgan, Pedro pregunta y el mecánico contesta («¡Claro!» en el globo)
c = S[4]['cues']; c['phone'] = 0.2; c['ans'] = 1.9; c.pop('talk', None)
v8 = voice('pedro18_8', c['ans'] + 0.15); vm = voice('mecanico18_1', end(v8) + 0.25)
c['claro'] = round(vm['start'] + 0.05, 2); setv(4, [v8, vm], 0); S[4]['duration'] = snap(end(vm) + 0.9); S[4]['still'] = round(end(vm) - 0.3, 2)
# 5) el taller: en el plano B Pedro sale feliz: «¡Dos por uno! Ruedas nuevas y a otra cosa.»
c = S[5]['cues']; cut = c.get('cut', 5.0); v9 = voice('pedro18_9', cut + 0.35)
setv(5, [v9], 8.0); S[5]['shots'] = {'A': [0, cut], 'B': [cut, S[5]['duration']]}
# 6) el sello verde: «¡Favorable!» justo con el golpe del sello; desde aquí, todo seguido hasta el final
c = S[6]['cues']; v10 = voice('pedro18_10', c['hit'] + 0.12); setv(6, [v10], 3.6, 0.3)
# 7) CTA: enlace en la descripción → «O comenta canal y te lo enviamos» (la palabra en grande al decir «comenta»)
c = S[7]['cues']; v11 = voice('pedro18_11', 0.2); v12 = voice('pedro18_12', end(v11) + 0.25)
pre = 'Si tú también quieres aprovechar ofertas como esta, o las que publiquen los comercios de nuestra ciudad, '
c['card'] = 0.3; c['link'] = round(word_t(v11, pre) - 0.1, 2)
c['strip'] = round(min(end(v11) - 0.2, c['link'] + 1.6), 2); c['com'] = round(word_t(v12, 'O ') - 0.05, 2)
setv(7, [v11, v12], 0); S[7]['duration'] = snap(end(v12) + 0.6); S[7]['still'] = round(c['com'] + 0.6, 2)
# 8) cierre: «Escaparate de Tudela. No te pierdas ninguna.»
v13 = voice('pedro18_13', 0.15); setv(8, [v13], 3.0, 0.5)
json.dump(cfg, open(CFG, 'w'), ensure_ascii=False, indent=2)

# ---------- TikTok: la escena 7 sin «O comenta canal y te lo enviamos» ----------
tk = json.load(open(os.path.join(ROOT, 'config18.tiktok.json')))
keep = {k: tk[k] for k in ('variant', 'output', 'scenesDir', 'stillsDir', 'timeline', 'musicMp3', 'mixWav', 'audioOut', '_ayuda_tiktok') if k in tk}
tk = copy.deepcopy(cfg); tk.update(keep)
tk.update({'srt': 'subtitles18_tiktok.srt', 'subtitledOut': 'video18_tiktok.mp4'})
s7 = [s for s in tk['scenes'] if s['id'] == 7][0]
s7['voices'] = [copy.deepcopy(v11)]; s7['talk'] = talk_of(s7['voices'])
s7['cues'] = {'card': 0.3, 'link': c['link']}; s7['duration'] = snap(end(v11) + 0.45); s7['still'] = round(c['link'] + 1.0, 2)
s7['name'] = "CTA (TikTok, sin «comenta»): Pedro a medio cuerpo; «CANAL DE WHATSAPP» y «Enlace en la descripción»"
json.dump(tk, open(os.path.join(ROOT, 'config18.tiktok.json'), 'w'), ensure_ascii=False, indent=2)

for name, cc in (('Instagram', cfg), ('TikTok', tk)):
    fr = 0
    for sc in cc['scenes']:
        t0 = fr / FPS
        if name == 'Instagram':
            for v in sc.get('voices', []): print(f"escena {sc['id']}  {os.path.basename(v['file']):18s} {v['duration']:5.2f} s  {t0 + v['start']:6.2f} → {t0 + end(v):6.2f}")
        fr += round(sc['duration'] * FPS)
    print(f'TOTAL {name}: {fr / FPS:.2f} s · escenas ' + ' '.join(f"{s['id']}:{s['duration']}" for s in cc['scenes']))
