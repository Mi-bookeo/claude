# Mari Carmen y los bolsos (vídeo 06 · Escaparate de Tudela)

Vídeo vertical 1080x1920, 30 fps, H.264 (crf 18), 41 s. Duraciones de escena: `config.json`.

- `mari_carmen_y_los_bolsos.mp4` — vídeo completo sin audio · `scenes/` una escena por archivo · `timeline.txt` · `stills/`
- `mari_carmen_y_los_bolsos_con_audio.mp4` — misma imagen (`-c:v copy`) con la pista de sonido
- Código: `src/lib.js`, `src/series.js`, `src/rosa.js`, `src/v04.js`, `src/v05.js` (piezas de los vídeos 01-05), `src/v06.js` (Mari Carmen y piezas nuevas), `src/scenes.js`

```
node render.js stills 2,5,6   # fotogramas de prueba
node render.js all            # escenas + stills + concatenado + timeline
python3 audio/make_audio.py   # sonido (imagen con -c:v copy)
```

## Sonido
- Voces: `audio/voces/<voz>_<n>.(wav|mp3|…)` → narradora_1..4 (escenas 1-4), mari_1 + narradora_5 (5), narradora_6 (6), clienta_1 + mari_2 (7), narradora_7 (8), narradora_8 (9).
- Efectos: `audio/sfx/<nombre>.wav` si existe; si no, sintetizados (básicos) → `audio/efectos.wav`.
- Música: `audio/musica.mp3` si existe (automatización por escena, ~17 dB bajo la voz); si no, sin música.
