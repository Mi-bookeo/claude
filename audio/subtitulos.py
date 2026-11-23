#!/usr/bin/env python3
"""Subtítulos del vídeo 13 «José y las tortillas», sincronizados con las voces colocadas en config.json ('voices':
   inicio, duración real medida con ffprobe y tramos con voz). Cada frase se parte en bloques cortos (4-7 palabras,
   máx. 2 líneas de 28 caracteres); el tiempo con voz de la frase se reparte entre sus bloques en proporción a las letras.
   Salida: subtitles.srt y tmp/subtitles.ass (página 1080x1920, Baloo 2 ExtraBold (Fontsize 112 en libass ≈ letra de 72 px), blanca con contorno negro de
   4 px y sombra, centrada, dentro de la franja y=1450..1750). Con --burn graba jose_la_tortilla_subtitulado.mp4."""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(ROOT, 'config.json')))
BLOCKS = {
    'narradora_1': ['Las cuatro de la tarde', 'en el bar La Tortilla.'],
    'narradora_2': ['Ha tenido poca gente por la mañana', 'y le han sobrado muchas tortillas.'],
    'narradora_3': ['Publica una oferta flash:', 'pincho de tortilla y bebida', 'por tres euros con cincuenta,', 'de seis a ocho.'],
    'narradora_4': ['Y la oferta le llega', 'directamente a la gente.'],
    'narradora_5': ['A las seis, el bar empieza a llenarse.'],
    'narradora_6': ['Y a las ocho, la barra', 'de tortillas está vacía.'],
    'jose_1': ['Voy a tener que tirarlas...'],
    'jose_2': ['¡Espera! ¡Escaparate de Tudela!'],
    'jose_3': ['Así, con suerte, se quedan', 'después de las ocho.'],
    'jose_4': ['¡Día terminado con éxito!', '¡Todas las tortillas vendidas!'],
    'jose_5': ['Si tú también tienes un negocio,', 'comenta alta y te enviamos el formulario.'],
    'jose_6': ['Y si no, busca en la descripción', 'el canal de WhatsApp,', 'para que te lleguen', 'todas las publicaciones a tu móvil', 'y no te pierdas ninguna.'],
}
MAXC = 28
def wrap(s):
    """una o dos líneas de máx. 28 caracteres, lo más equilibradas posible"""
    if len(s) <= MAXC: return [s]
    w = s.split(' '); best = None
    for i in range(1, len(w)):
        a, b = ' '.join(w[:i]), ' '.join(w[i:])
        if len(a) <= MAXC and len(b) <= MAXC:
            sc = abs(len(a) - len(b)) - (12 if a[-1] in ',.:;!?' else 0)  # mejor partir tras un signo de puntuación
            if best is None or sc < best[2]: best = (a, b, sc)
    if not best: raise SystemExit(f'No cabe en 2 líneas de {MAXC}: {s}')
    return [best[0], best[1]]
def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True, check=True).stdout)

FPS = cfg['fps']; starts, fr = {}, 0
for s in cfg['scenes']:
    starts[s['id']] = fr / FPS; fr += round(s['duration'] * FPS)
TOTAL = fr / FPS
subs = []
for s in cfg['scenes']:
    for vo in s.get('voices', []):
        name = os.path.splitext(os.path.basename(vo['file']))[0]; bl = BLOCKS[name]
        assert ' '.join(bl) == vo['text'], f'los bloques de {name} no reproducen la frase'
        d = dur(os.path.join(ROOT, vo['file']))  # duración real del archivo
        segs = [[a, min(b, vo['start'] + d)] for a, b in vo['segments']] or [[vo['start'], vo['start'] + d]]
        tot = sum(b - a for a, b in segs)
        def tl(x):  # tiempo «con voz» -> tiempo de la escena
            for a, b in segs:
                if x <= b - a: return a + x
                x -= b - a
            return segs[-1][1]
        L = sum(len(x) for x in bl); acc = 0
        for x in bl:
            a = tl(tot * acc / L); acc += len(x); b = tl(tot * acc / L)
            subs.append({'start': starts[s['id']] + a - 0.06, 'end': starts[s['id']] + b + 0.25, 'text': x, 'who': name.split('_')[0]})
subs.sort(key=lambda q: q['start'])
for i in range(len(subs) - 1):  # sin solapes
    if subs[i]['end'] > subs[i + 1]['start'] - 0.04: subs[i]['end'] = subs[i + 1]['start'] - 0.04
for q in subs: q['start'] = max(0, round(q['start'], 2)); q['end'] = round(min(q['end'], TOTAL), 2)

def ts(x, sep=','):
    ms = int(round(x * 1000)); return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d}{sep}{ms % 1000:03d}'
with open(os.path.join(ROOT, 'subtitles.srt'), 'w') as fh:
    for i, q in enumerate(subs, 1): fh.write(f"{i}\n{ts(q['start'])} --> {ts(q['end'])}\n" + '\n'.join(wrap(q['text'])) + '\n\n')
def tass(x):
    cs = int(round(x * 100)); return f'{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}'
os.makedirs(os.path.join(ROOT, 'tmp'), exist_ok=True)
ass = os.path.join(ROOT, 'tmp', 'subtitles.ass')
with open(ass, 'w') as fh:
    fh.write('[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\nScaledBorderAndShadow: yes\n\n')
    fh.write('[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n')
    # alineación 2 = abajo al centro; MarginV 175 -> la base del bloque en y≈1745 (franja 1450..1750)
    fh.write('Style: Sub,Baloo 2 ExtraBold,112,&H00FFFFFF,&H00FFFFFF,&H001A1A1E,&H801A1A1E,0,0,0,0,100,100,0,0,1,4,3,2,30,30,175,1\n\n')
    fh.write('[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n')
    for q in subs: fh.write(f"Dialogue: 0,{tass(q['start'])},{tass(q['end'])},Sub,,0,0,0,,{'\\N'.join(wrap(q['text']))}\n")
for q in subs: print(f"{q['start']:6.2f}-{q['end']:6.2f}  [{q['who']}] {' / '.join(wrap(q['text']))}")
if '--burn' in sys.argv:
    src = os.path.join(ROOT, 'jose_la_tortilla_con_audio.mp4'); out = os.path.join(ROOT, 'jose_la_tortilla_subtitulado.mp4'); tmp = out.replace('.mp4', '.partial.mp4')
    vf = f"subtitles=filename={ass}:fontsdir={os.path.join(ROOT, 'fonts')}:original_size=1080x1920"
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-vf', vf, '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p',
                    '-r', str(FPS), '-c:a', 'copy', '-movflags', '+faststart', tmp], check=True)
    os.replace(tmp, out); print('->', os.path.relpath(out, ROOT))
