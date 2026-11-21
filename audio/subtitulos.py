#!/usr/bin/env python3
"""Subtítulos de «Pedro y el plan de viernes»: pedro_y_el_plan_de_viernes.srt (+ .ass con el estilo de la serie) y
versión con los subtítulos incrustados en la franja inferior libre (y 1400-1920):
pedro_y_el_plan_de_viernes_con_subtitulos.mp4 (la imagen se recodifica con los mismos ajustes; el audio se copia).
Tiempos: inicio/fin de cada frase en audio/voz.wav (make_audio.py) y cortes en las pausas de la voz
(silencedetect -35 dB, 0,07 s). Narradora en blanco, Pedro en amarillo."""
import os, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (inicio, fin, estilo, texto con \n para el salto de línea; máximo dos líneas)
CUES = [
    (0.05, 1.55, 'Narr', 'Viernes por la tarde.'),
    (1.62, 4.45, 'Narr', 'Pedro acaba la semana\ny quiere desconectar,'),
    (4.45, 6.75, 'Narr', 'pero no tiene\nningún plan.'),
    (9.05, 11.95, 'Pedro', '¿Pintxo de tortilla y bebida\npor 3,50 €?'),
    (11.95, 13.85, 'Pedro', '¡Eso sí que es un plan!'),
    (16.05, 18.50, 'Narr', 'Ahora Pedro\nya tiene plan.'),
    (21.45, 22.80, 'Pedro', '¡Salud!'),
    (24.00, 26.15, 'Narr', 'No te pierdas el mejor\nplan del día.'),
    (26.15, 28.66, 'Narr', 'Entra en\nescaparatetudela.es'),
    (28.66, 30.12, 'Narr', 'y que no te lo cuenten.'),
    (30.12, 32.00, 'Narr', 'Enlace en la descripción.'),
]
def ts(t, sep=','):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    ms = int(round((s - int(s)) * 1000))
    return f'{h:02d}:{m:02d}:{int(s):02d}{sep}{min(ms, 999):03d}'
def ats(t): return f'{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}'
base = os.path.join(ROOT, 'pedro_y_el_plan_de_viernes')
with open(base + '.srt', 'w', encoding='utf-8') as f:
    for i, (a, b, _, txt) in enumerate(CUES, 1): f.write(f'{i}\n{ts(a)} --> {ts(b)}\n{txt}\n\n')
# Estilo: Baloo 2 ExtraBold grande, contorno negro grueso + sombra dura; base de la 2.ª línea en y≈1740
ass = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Narr,Baloo 2 ExtraBold,112,&H00FFFFFF,&H00FFFFFF,&H001A1A1E,&H001A1A1E,0,0,0,0,100,100,0,0,1,11,7,2,30,30,150,1
Style: Pedro,Baloo 2 ExtraBold,112,&H002EC1F2,&H002EC1F2,&H001A1A1E,&H001A1A1E,0,0,0,0,100,100,0,0,1,11,7,2,30,30,150,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
for a, b, st, txt in CUES:
    ass += f'Dialogue: 0,{ats(a)},{ats(b)},{st},,0,0,0,,{{\\fad(60,60)}}{txt.replace(chr(10), chr(92) + "N")}\n'
open(base + '.ass', 'w', encoding='utf-8').write(ass)
print('->', os.path.basename(base) + '.srt / .ass')
src, out = base + '_con_audio.mp4', base + '_con_subtitulos.mp4'
tmp = out.replace('.mp4', '.partial.mp4')
fonts = os.path.join(ROOT, 'fonts')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-vf', f"ass={base}.ass:fontsdir={fonts}",
                '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', '30',
                '-c:a', 'copy', '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, out)
print('->', os.path.basename(out))
