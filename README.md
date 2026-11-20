# Marta y el último 2x1 (vídeo 02 · Escaparate de Tudela)

Vídeo vertical 1080x1920, 30 fps, H.264 (crf 18). Duraciones de escena: `config.json`.

- `marta_y_el_ultimo_2x1.mp4` — vídeo completo sin audio · `scenes/` una escena por archivo · `timeline.txt` · `stills/`
- `marta_y_el_ultimo_2x1_con_musica_fx.mp4` — con música y efectos sintetizados (`audio/make_audio.py`)
- Voces + subtítulos: `audio/voces.json` + `audio/add_voices.py`

```
node render.js all          # escenas + stills + concatenado + timeline
python3 audio/make_audio.py # música y efectos
python3 audio/add_voices.py # voces, mezcla -14 LUFS, subtítulos y vídeo final
```
