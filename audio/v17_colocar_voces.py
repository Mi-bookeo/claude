#!/usr/bin/env python3
"""Vídeo 17 «Próxima apertura»: coloca las voces de María (audio/voces/maria_<n>.mp3, una por escena, al inicio)
   en config17.json y crea config17.tiktok.json (sin «o comenta canal y te lo enviamos»).
   - Duración real con ffprobe; tramos con voz por energía (boca y subtítulos). No se acelera ninguna voz:
     si una frase no cabe, se alarga la escena (y se avisa: hay que volver a renderizar esa escena y la siguiente).
   - Momentos sincronizados con la voz: tarjetas y etiquetas (escena 3), «beneficiarnos» y «comercio local» (4),
     enlace / «comenta CANAL» (5), cartel «¿QUÉ ES?» justo al terminar la frase de la escena 2.
   Uso: python3 audio/v17_colocar_voces.py"""
import os, sys, json, copy, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = os.path.join(ROOT, 'config17.json')
cfg = json.load(open(CFG)); FPS = cfg['fps']
TEXT = {
    1: 'Si eres de Tudela, espera, que esto te puede interesar.',
    2: 'Ya casi está: estamos a punto de abrir Escaparate de Tudela.',
    3: 'Es una web donde los comercios de la ciudad pueden publicar sus ofertas, sus novedades y los eventos que hagan.',
    4: 'Y los clientes podemos beneficiarnos de esas promociones y, además, apoyar al comercio local.',
    5: 'Si quieres enterarte cuando salgan las primeras, en la descripción tienes el enlace al canal de WhatsApp, o comenta canal y te lo enviamos.',
    6: 'Y si eres un comercio y quieres entrar, escríbenos al correo que ves en pantalla y te informamos.',
    7: 'Escaparate de Tudela. Muy pronto.',
}
TK5 = 'Si quieres enterarte cuando salgan las primeras, en la descripción tienes el enlace al canal de WhatsApp.'
START, TAIL = 0.15, 0.35
MIN = {1: 3.5, 2: 0, 3: 0, 4: 5.5, 5: 0, 6: 4.5, 7: 3.2}   # duración mínima de cada escena
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
def word_t(v, prefix):
    """momento (aprox.) en que empieza lo que sigue a 'prefix' (el tiempo con voz se reparte por letras)"""
    segs = v['segments']; tot = sum(b - a for a, b in segs); x = tot * len(prefix) / len(v['text'])
    for a, b in segs:
        if x <= b - a: return round(a + x, 2)
        x -= b - a
    return segs[-1][1]
def place(sc, n, fname, text):
    p = os.path.join(ROOT, 'audio', 'voces', fname); d = dur(p)
    v = {'file': os.path.relpath(p, ROOT), 'who': 'maria', 'start': START, 'duration': round(d, 3), 'text': text,
         'segments': [[round(START + a, 2), round(START + b, 2)] for a, b in segments(p)]}
    sc['voices'] = [v]
    talk = []
    for a, b in v['segments']:
        if talk and a - talk[-1][1] < 0.15: talk[-1][1] = round(b + 0.04, 2)
        else: talk.append([round(max(0, a - 0.03), 2), round(b + 0.04, 2)])
    sc['talk'] = {'maria': talk}
    return v

changed = []
for sc in cfg['scenes']:
    i = sc['id']; v = place(sc, i, f'maria_{i}.mp3', TEXT[i]); end = v['start'] + v['duration']; c = sc['cues']
    need = snap(max(MIN[i], end + TAIL))
    if i == 2:   # el cartel «¿QUÉ ES?» entra al terminar la frase y se queda para leerlo
        c['slam'] = round(max(0.45, word_t(v, 'Ya casi está: ') - 0.25), 2)
        c['look'] = round(word_t(v, 'Ya casi está: estamos a punto de ') - 0.1, 2)
        c['que'] = round(end + 0.05, 2); c['hold'] = 0.75
        need = snap(c['que'] + 1.9)
    if i == 3:
        cards = [word_t(v, 'Es una web donde los comercios de la ciudad pueden publicar sus '),
                 word_t(v, 'Es una web donde los comercios de la ciudad pueden publicar sus ofertas, sus '),
                 word_t(v, 'Es una web donde los comercios de la ciudad pueden publicar sus ofertas, sus novedades y los ')]
        c['phoneIn'] = 0.45; c['slide'] = 0.45
        c['cards'] = [round(x - 0.1, 2) for x in cards] + [round(cards[2] + 1.0, 2)]
        c['labels'] = [round(x - 0.05, 2) for x in cards]
        need = snap(max(need, c['cards'][3] + 0.9))
    if i == 4:
        b = word_t(v, 'Y los clientes podemos '); c['benef'] = round(b - 0.05, 2); c['icons'] = [round(b - 0.05 + k * 0.22, 2) for k in range(3)]
        l = word_t(v, 'Y los clientes podemos beneficiarnos de esas promociones y, además, apoyar al '); c['heart'] = round(l - 0.1, 2); c['local'] = round(l, 2)
    if i == 5:
        c['card'] = 0.3
        c['link'] = round(word_t(v, 'Si quieres enterarte cuando salgan las primeras, ') - 0.05, 2)
        c['strip'] = round(word_t(v, 'Si quieres enterarte cuando salgan las primeras, en la descripción tienes el enlace al ') - 0.1, 2)
        c['com'] = round(word_t(v, 'Si quieres enterarte cuando salgan las primeras, en la descripción tienes el enlace al canal de WhatsApp, o '), 2)
    if i == 6:
        c['mail'] = round(min(0.9, word_t(v, 'Y si eres un comercio y quieres entrar, escríbenos al ') - 0.1), 2)
        c['press'] = round(word_t(v, 'Y si eres un comercio y quieres entrar, escríbenos al correo que ves en pantalla y te '), 2)
    if need != sc['duration']: changed.append((i, sc['duration'], need)); sc['duration'] = need
    sc['still'] = {1: 1.6, 2: round(c.get('que', 4) + 1.2, 2), 3: round(c['cards'][2] + 0.6, 2) if i == 3 else 0, 4: round(c.get('local', 4) + 0.5, 2),
                   5: round(c.get('com', 4) - 0.3, 2), 6: 3.0, 7: 1.6}[i]
json.dump(cfg, open(CFG, 'w'), ensure_ascii=False, indent=2)

# ---------- versión TikTok: maria_5 cortada al final de «…canal de WhatsApp» ----------
p5 = os.path.join(ROOT, 'audio', 'voces', 'maria_5.mp3'); v5 = cfg['scenes'][4]['voices'][0]
# pausa más silenciosa (ventana de 0,2 s) entre el 60 % y el 85 % de la frase: «…canal de WhatsApp, | o comenta canal…»
r = energy(p5); w = np.convolve(r, np.ones(10) / 10, 'valid'); lo, hi = int(len(r) * 0.6), int(len(r) * 0.85)
k = lo + int(np.argmin(w[lo:hi])); cut = (k * 0.02, k * 0.02 + 0.2)
e = k + 10
while e < len(r) and r[e] < r.max() - 25: e += 1
cut = (cut[0], e * 0.02)                       # fin de la pausa = empieza «o comenta canal…»
cfg['scenes'][4]['cues']['com'] = round(START + cut[1] + 0.12, 2)   # «comenta»
json.dump(cfg, open(CFG, 'w'), ensure_ascii=False, indent=2)
tkf = os.path.join(ROOT, 'audio', 'voces', 'maria_5_tiktok.mp3')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p5, '-to', f'{cut[0] + 0.08:.3f}', '-af', 'areverse,afade=t=in:d=0.05,areverse', '-c:a', 'libmp3lame', '-q:a', '2', tkf], check=True)
tk = copy.deepcopy(cfg)
tk.update({'variant': 'tiktok', 'title': cfg['title'] + ' (TikTok)', 'output': 'tmp/video17_tiktok_mudo.mp4', 'scenesDir': 'scenes17_tiktok',
           'stillsDir': 'tmp/stills17_tiktok', 'timeline': 'tmp/timeline17_tiktok.txt', 'srt': 'subtitles_tiktok.srt',
           'audioOut': 'tmp/video17_tiktok_con_audio.mp4', 'subtitledOut': 'video17_tiktok.mp4', 'mixWav': 'mezcla17_tiktok.wav', 'musicMp3': 'audio/musica_tiktok.mp3'})
s5 = tk['scenes'][4]; place(s5, 5, 'maria_5_tiktok.mp3', TK5)
e5 = s5['voices'][0]['start'] + s5['voices'][0]['duration']; s5['duration'] = snap(max(e5 + 0.5, s5['cues']['strip'] + 1.0)); s5['cues']['com'] = 999
s5['name'] += ' [TikTok: sin «comenta»]'
json.dump(tk, open(os.path.join(ROOT, 'config17.tiktok.json'), 'w'), ensure_ascii=False, indent=2)

fr = 0
for sc in cfg['scenes']:
    v = sc['voices'][0]; t0 = fr / FPS
    print(f"escena {sc['id']}  {os.path.basename(v['file']):12s} {v['duration']:5.2f} s  {t0 + v['start']:6.2f} → {t0 + v['start'] + v['duration']:6.2f}   escena {sc['duration']:.3f} s")
    fr += round(sc['duration'] * FPS)
print(f'TOTAL Instagram {fr / FPS:.2f} s · TikTok {sum(round(s["duration"] * FPS) for s in tk["scenes"]) / FPS:.2f} s (corte de maria_5 en {cut[0]:.2f} s)')
for i, a, b in changed: print(f'escena {i}: {a:.3f} → {b:.3f} s')
