# Carmen y María (vídeo 10 · Escaparate de Tudela)

Vídeo vertical 1080x1920, 30 fps, H.264 (crf 18, yuv420p), 47,0 s. Dirigido a comercios: no basta con que te vean,
tienen que saber que existes. Duraciones de escena: `config.json`; tiempos: `timeline.txt`.

- `carmen_y_maria.mp4` — vídeo sin audio · `carmen_y_maria_con_audio.mp4` — misma imagen (-c:v copy) + pista de sonido
- `scenes/` una escena por archivo · `stills/` un fotograma por escena
- Código: `src/v10.js` (Carmen, María, tiendas de moda, avenida, callejuela, interior, tarjetas Novedad/Oferta, María en primer plano),
  `src/scenes.js`; piezas de la serie en `src/lib.js`, `src/series.js`, `src/rosa.js`, `src/v04.js`…`src/v09.js`
- Fuentes: Baloo 2 y Bangers en `fonts/` · Logos: `logo_blanco.png` (fondos rojos), `logo_rojo.png` (fondos claros); recortes en `assets/`

```
node render.js stills 1,2,3,9   # fotogramas de prueba
node render.js all              # escenas + stills + concatenado + timeline
python3 audio/make_audio.py     # voces + efectos + música -> carmen_y_maria_con_audio.mp4 (imagen con -c:v copy)
```

## Sonido
- Voces: `audio/voces/<voz>_<n>.(wav|mp3|m4a|ogg|flac)` al inicio de su escena: narradora_1…6 → escenas 1…6;
  narradora_7 y luego carmen_1 → 7; narradora_8 → 8; maria_1 → 9. Las que falten quedan en silencio (el script avisa).
- Efectos: `audio/sfx/<nombre>.wav` si existe (nombres: pop, plop, ding, ting, campanilla, whoosh, whoosh_suave, tic_farola,
  suspiro, maullido, pajaro, persiana, percha, tecla, susurro_aire, ambiente_avenida, murmullo_calle, murmullo_tienda,
  trafico_lejano, viento); si no, se sintetizan (básicos) → `audio/efectos.wav`.
- Música: `audio/musica.mp3` si existe (envolvente por escenas, ~17 dB bajo la voz, baja más en el susurro de María); si no, sin música.
