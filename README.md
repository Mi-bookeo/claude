# ¿Qué es Escaparate de Tudela? (vídeo 04 · Escaparate de Tudela)

Vídeo vertical 1080x1920, 30 fps, H.264 (crf 18). Duraciones de escena: `config.json`.

- `que_es_escaparate_de_tudela_con_audio.mp4` — vídeo final con efectos y música (voces pendientes)
- `que_es_escaparate_de_tudela.mp4` — vídeo completo sin audio · `scenes/` una escena por archivo · `timeline.txt` · `stills/`
- Código: `src/lib.js`, `src/series.js`, `src/rosa.js` (piezas de los vídeos 01-03), `src/v04.js` (piezas nuevas), `src/scenes.js`

```
node render.js stills 2,3,6   # fotogramas de prueba
node render.js all            # escenas + stills + concatenado + timeline
python3 audio/make_audio.py   # sonido (imagen con -c:v copy)
```

## Sonido
- Voces: `audio/voces/narradora_1…5` (wav/mp3/m4a/ogg/flac) → escenas 1, 2, 3, 4 y 6.
- Efectos: `audio/sfx/<nombre>.wav` si existe; si no, sintetizados (básicos) → `audio/efectos.wav`.
- Música: `audio/musica.mp3` si existe; si no, música suave sintetizada → `audio/musica_sintetizada.wav` (~17 dB bajo la voz).
