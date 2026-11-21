# Pedro y el plan de viernes (vídeo 05 · Escaparate de Tudela)

Vídeo vertical 1080x1920, 30 fps, H.264 (crf 18), sin audio ni subtítulos. Duraciones de escena: `config.json`.

- `pedro_y_el_plan_de_viernes.mp4` — vídeo completo sin audio · `scenes/` una escena por archivo · `timeline.txt` · `stills/`
- `pedro_y_el_plan_de_viernes_con_audio.mp4` — con efectos (sintetizados, básicos); voces y música pendientes
- Código: `src/lib.js`, `src/series.js`, `src/rosa.js`, `src/v04.js` (piezas de los vídeos 01-04), `src/v05.js` (Pedro y piezas nuevas), `src/scenes.js`

```
node render.js stills 4,5,7   # fotogramas de prueba
node render.js all            # escenas + stills + concatenado + timeline
python3 audio/make_audio.py   # sonido (imagen con -c:v copy)
```

## Sonido
- Voces: `audio/voces/` → narradora_1 (escenas 1-2), narradora_2 (3), pedro_1 (4), narradora_3 (6), pedro_2 (7), narradora_4 (8).
- Efectos: `audio/sfx/<nombre>.wav` si existe; si no, sintetizados (básicos) → `audio/efectos.wav`.
- Música: `audio/musica.mp3` si existe (automatización por escena, ~17 dB bajo la voz); si no, sin música.
