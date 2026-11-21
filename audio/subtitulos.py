#!/usr/bin/env python3
"""Subtítulos de la narración: que_es_escaparate_de_tudela.srt (+ .ass con estilo de la serie) y versión con los
subtítulos incrustados en la franja inferior (y 1500-1920): que_es_escaparate_de_tudela_con_subtitulos.mp4.
Tiempos: inicio/fin de cada frase en audio/voz.wav (make_audio.py) y cortes internos en pausas de la voz."""
import os, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (inicio, fin, texto con \n para el salto de línea)
CUES = [
    (0.05, 3.25, 'Tudela está llena de comercios\ncon mucho que contar.'),
    (4.12, 6.49, 'Escaparate de Tudela\nes el portal'),
    (6.49, 8.16, 'donde los comercios y negocios\nde la ciudad'),
    (8.16, 11.35, 'publican sus novedades,\nsus ofertas y sus eventos.'),
    (12.12, 15.35, 'Y hacemos llegar cada publicación\ndirectamente a la gente.'),
    (18.12, 19.13, 'Con solo tres toques,'),
    (19.13, 22.55, 'llevamos los escaparates a la mano\nde sus futuros clientes.'),
    (27.12, 29.40, 'Entra a conocernos\nen escaparatetudela.es'),
    (31.11, 34.10, 'Y si eres un comercio,\nescríbenos y te informamos.'),
]
def ts(t, sep=','):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f'{h:02d}:{m:02d}:{int(s):02d}{sep}{int(round((s - int(s)) * 1000)):03d}'
def ats(t): return f'{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}'
base = os.path.join(ROOT, 'que_es_escaparate_de_tudela')
with open(base + '.srt', 'w', encoding='utf-8') as f:
    for i, (a, b, txt) in enumerate(CUES, 1): f.write(f'{i}\n{ts(a)} --> {ts(b)}\n{txt}\n\n')
ass = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Narr,Baloo 2 ExtraBold,88,&H00FFFFFF,&H00FFFFFF,&H001A1A1E,&H001A1A1E,0,0,0,0,100,100,0,0,1,8,5,2,50,50,200,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
for a, b, txt in CUES: ass += f'Dialogue: 0,{ats(a)},{ats(b)},Narr,,0,0,0,,{txt.replace(chr(10), chr(92) + "N")}\n'
open(base + '.ass', 'w', encoding='utf-8').write(ass)
print('->', os.path.basename(base) + '.srt / .ass')
src, out = base + '_con_audio.mp4', base + '_con_subtitulos.mp4'
tmp = out.replace('.mp4', '.partial.mp4')
fonts = os.path.join(ROOT, 'fonts')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-vf', f"ass={base}.ass:fontsdir={fonts}",
                '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, out)
print('->', os.path.basename(out))
