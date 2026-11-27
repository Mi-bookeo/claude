#!/usr/bin/env python3
"""Subtítulos del vídeo 19 «El precio de antes» en modo KARAOKE (copia de audio/v18_subtitulos.py con las frases del vídeo 19; solo texto, sin nombres), sincronizados con las voces colocadas en config.json ('voices':
   inicio, duración real medida con ffprobe y tramos con voz). Cada frase se parte en bloques cortos (4-7 palabras,
   máx. 2 líneas de 28 caracteres); el tiempo con voz de la frase se reparte entre sus bloques en proporción a las letras.
   Salida: subtitles.srt y tmp/subtitles.ass (página 1080x1920, Baloo 2 ExtraBold (Fontsize 112 en libass ≈ letra de 72 px), blanca con contorno negro de
   4 px y sombra, centrada, dentro de la franja y=1450..1750). Con --burn graba video19_instagram.mp4; con --burn --tiktok, video19_tiktok.mp4 (franja y=1350..1650)."""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(ROOT, os.environ.get('CONFIG', 'config19.voz.json'))))
BLOCKS = {
    'narradora19_1': ['Dos carteles.', 'El mismo producto.', '¿Cuál vende más?', 'A la izquierda,', 'un precio suelto:', 'siete euros con veinte.', 'A la derecha, el mismo precio,', 'pero con el de antes:', 'doce euros.'],
    'narradora19_2': ['Tu cerebro no calcula.'], 'narradora19_3': ['Compara.'],
    'narradora19_4': ['Sin una referencia,', 'no sabe si siete euros', 'con veinte es mucho o es poco.', 'Con el precio de antes,', 'lo ve claro: es un ahorro.'],
    'narradora19_5': ['Eso se llama efecto ancla.'],
    'narradora19_6': ['El primer número que ves', 'se te queda enganchado,', 'como un ancla,', 'y todo lo demás', 'lo comparas con él.'],
    'narradora19_7': ['Pero ojo: el precio de antes', 'tiene que ser real.', 'Uno inflado puede', 'jugar en tu contra.'],
    'narradora19_8': ['En Escaparate de Tudela', 'pones el precio de antes', 'y el de ahora,', 'y le llega directo', 'al móvil de tus clientes.'],
    'narradora19_9': ['Si tienes un comercio,', 'en la descripción tienes', 'el enlace al formulario.'],
    'narradora19_10': ['O comenta ALTA', 'y te lo enviamos.'],
    'narradora19_11': ['Escaparate de Tudela.', 'Tus ofertas,', 'en la mano de tus clientes.'],
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
        assert ' '.join(bl).lower() == vo['text'].lower(), f'los bloques de {name} no reproducen la frase'
        d = dur(os.path.join(ROOT, vo['file']))  # duración real del archivo
        segs = [[a, min(b, vo['start'] + d)] for a, b in vo['segments']] or [[vo['start'], vo['start'] + d]]
        tot = sum(b - a for a, b in segs)
        def tl(x):  # tiempo «con voz» -> tiempo de la escena
            for a, b in segs:
                if x <= b - a: return a + x
                x -= b - a
            return segs[-1][1]
        L = sum(len(x) for x in bl); acc = 0; bnd = [tl(0)]
        for x in bl: acc += len(x); bnd.append(tl(tot * acc / L))
        # cada corte entre bloques se lleva a la pausa real más cercana (si hay una a menos de 0,5 s)
        gaps = [(segs[k][1], segs[k + 1][0]) for k in range(len(segs) - 1)]; ab = [[bnd[0], None]]
        for x in bnd[1:-1]:
            g = min(gaps, key=lambda q: abs((q[0] + q[1]) / 2 - x), default=None)
            if g and abs((g[0] + g[1]) / 2 - x) < 0.5: ab[-1][1] = g[0]; ab.append([g[1], None])
            else: ab[-1][1] = x; ab.append([x, None])
        ab[-1][1] = bnd[-1]
        for x, (a, b) in zip(bl, ab):
            subs.append({'start': starts[s['id']] + a - 0.06, 'end': starts[s['id']] + b + 0.25, 'speak': b - a, 'text': x, 'who': name.split('19')[0]})
subs.sort(key=lambda q: q['start'])
for i in range(len(subs) - 1):  # sin solapes
    if subs[i]['end'] > subs[i + 1]['start'] - 0.04: subs[i]['end'] = subs[i + 1]['start'] - 0.04
for q in subs: q['start'] = max(0, round(q['start'], 2)); q['end'] = round(min(q['end'], TOTAL), 2)

def ts(x, sep=','):
    ms = int(round(x * 1000)); return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d}{sep}{ms % 1000:03d}'
with open(os.path.join(ROOT, cfg.get('srt', 'subtitles19.srt')), 'w') as fh:
    for i, q in enumerate(subs, 1): fh.write(f"{i}\n{ts(q['start'])} --> {ts(q['end'])}\n" + '\n'.join(wrap(q['text'])) + '\n\n')
def karaoke(q):
    """cada palabra se rellena de blanco a amarillo (\\kf) mientras se dice; el tiempo con voz del bloque se reparte por letras"""
    lines = wrap(q['text']); words = [w for ln in lines for w in ln.split(' ')]
    tot = max(1, round(q['speak'] * 100)); L = sum(len(w) + 1 for w in words); out, acc, done = [], 0, 0
    for li, ln in enumerate(lines):
        parts = []
        for w in ln.split(' '):
            acc += len(w) + 1; cs = round(tot * acc / L) - done; done += cs
            parts.append(f'{{\\kf{cs}}}{w}')
        out.append(' '.join(parts))
    return '{\\k6}' + '\\N'.join(out)
def tass(x):
    cs = int(round(x * 100)); return f'{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}'
os.makedirs(os.path.join(ROOT, 'tmp'), exist_ok=True)
TIKTOK = '--tiktok' in sys.argv
MV = 275 if TIKTOK else 175   # base del bloque en y≈1645 (TikTok, franja 1350..1650) o y≈1745 (Instagram, 1450..1750)
ass = os.path.join(ROOT, 'tmp', os.path.splitext(cfg.get('srt', 'subtitles19.srt'))[0] + ('_tiktok' if TIKTOK else '') + '.ass')
with open(ass, 'w') as fh:
    fh.write('[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\nScaledBorderAndShadow: yes\n\n')
    fh.write('[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n')
    # alineación 2 = abajo al centro; MarginV 175 -> la base del bloque en y≈1745 (franja 1450..1750)
    # karaoke: SecondaryColour = blanco (aún no dicho), PrimaryColour = amarillo de la marca #F2C12E (ya dicho)
    fh.write(f'Style: Sub,Baloo 2 ExtraBold,112,&H002EC1F2,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,3,2,30,30,{MV},1\n\n')
    fh.write('[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n')
    for q in subs: fh.write(f"Dialogue: 0,{tass(q['start'])},{tass(q['end'])},Sub,,0,0,0,,{karaoke(q)}\n")
for q in subs: print(f"{q['start']:6.2f}-{q['end']:6.2f}  [{q['who']}] {' / '.join(wrap(q['text']))}")
if '--burn' in sys.argv:
    src = os.path.join(ROOT, cfg['audioOut']); out = os.path.join(ROOT, cfg['tiktokOut'] if TIKTOK else cfg['subtitledOut']); tmp = out.replace('.mp4', '.partial.mp4')
    vf = f"subtitles=filename={ass}:fontsdir={os.path.join(ROOT, 'fonts')}:original_size=1080x1920"
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-vf', vf, '-c:v', 'libx264', '-crf', str(cfg.get('burnCrf', 20)), '-preset', cfg.get('burnPreset', 'medium'), '-pix_fmt', 'yuv420p',
                    '-r', str(FPS), '-c:a', 'copy', '-movflags', '+faststart', tmp], check=True)
    os.replace(tmp, out); print('->', os.path.relpath(out, ROOT))
