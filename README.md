# Dos carteles (vídeo 08 · Escaparate de Tudela)

Vídeo vertical 1080x1920, 30 fps, H.264 (crf 18), 44 s. Dirigido a comercios: una oferta sin fecha se pospone; con fecha y a la vista, se aprovecha. Duraciones de escena: `config.json`.

- `dos_carteles.mp4` — vídeo sin audio · `dos_carteles_con_audio.mp4` — misma imagen (-c:v copy) + pista de sonido
- `scenes/` una escena por archivo · `timeline.txt` · `stills/`
- Código: `src/lib.js` (Lucía, con las expresiones nuevas `curious` y `meh`), `src/series.js`, `src/rosa.js`, `src/v04.js`…`src/v07.js` (piezas de la serie), `src/v08.js` (tienda «TIENDA», cinta «Hasta el sábado», calendario, cerebro, reloj, telaraña, tarjeta con fecha), `src/scenes.js`
- Logos: `logo_blanco.png` (fondos rojos, tarjeta final), `logo_rojo.png` (fondos claros), `logo.png` (solo icono); recortes en `assets/` con `python3 tools/key_logos.py`

```
node render.js stills 2,5,7   # fotogramas de prueba
node render.js all            # escenas + stills + concatenado + timeline
python3 audio/make_audio.py   # efectos + voces + música -> dos_carteles_con_audio.mp4 (imagen con -c:v copy)
```

## Sonido
- Voces: `audio/voces/<voz>_<n>.(wav|mp3|…)` → narradora_1 (1), narradora_2 (2), clienta_1 + narradora_3 (3), narradora_4 (4), clienta_2 + narradora_5 (5), narradora_6 (6), narradora_7 (7), narradora_8 (8).
- Efectos: `audio/sfx/<nombre>.wav` si existe; si no, sintetizados (básicos) → `audio/efectos.wav`.
- Música: `audio/musica.mp3` si existe (automatización por escena y redoble en la 4, ~17 dB bajo la voz); si no, sin música.
