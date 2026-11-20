# Rosa y la cola de pasteles (vídeo 03 · Escaparate de Tudela)

Vídeo vertical 1080x1920, 30 fps, H.264 (crf 18), sin audio. Duraciones de escena: `config.json`.

- `rosa_y_la_cola_de_pasteles_con_audio.mp4` — vídeo final con voces y efectos (sin música)
- `rosa_y_la_cola_de_pasteles.mp4` — vídeo completo sin audio · `scenes/` una escena por archivo · `timeline.txt` · `stills/`
- Código: `src/lib.js` (común de la serie), `src/series.js` (piezas del vídeo 02), `src/rosa.js` (Rosa, cola, vitrina), `src/scenes.js`

```
node render.js stills 4,6,7   # fotogramas de prueba
node render.js all            # escenas + stills + concatenado + timeline
```

## Sonido
```
python3 audio/make_audio.py   # voces de audio/voces/ + efectos + (música si existe audio/musica.mp3) -> *_con_audio.mp4 (imagen con -c:v copy)
```
Voces: `audio/voces/original_todas_las_voces.mp3` (todas seguidas) se corta con `python3 audio/cortar_voces.py`.
Nombres de voz: narradora_1…8, rosa_1…3, marta_1 (mp3/wav/m4a/ogg/flac). Sin voces se genera `*_solo_efectos.mp4` (vista previa).
