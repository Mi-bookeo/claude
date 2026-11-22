# De puerta en puerta (vídeo 09 · Escaparate de Tudela)

Vídeo vertical 1080x1920, 30 fps, H.264 (crf 18), 42,3 s. Dirigido a comercios: en 1945 un vendedor iba de puerta en puerta con su cestilla de tornillos; en 2026 llevamos las novedades, ofertas y eventos de tu comercio a la mano de tus futuros clientes. Duraciones de escena: `config.json`.

- `de_puerta_en_puerta.mp4` — vídeo sin audio · `de_puerta_en_puerta_con_audio.mp4` — misma imagen (-c:v copy) + pista de sonido
- `scenes/` una escena por archivo · `timeline.txt` · `stills/`
- Código: `src/v09.js` (parte de 1945: paleta sepia, trama, marco, arañazos, vendedor, vecinos, calle, puertas; tarjetas Novedad/Oferta/Evento), `src/scenes.js`; piezas de la serie en `src/lib.js`, `src/series.js`, `src/rosa.js`, `src/v04.js`…`src/v08.js` (Mari Carmen en `v06.js`)
- Fuentes: Baloo 2, Bangers (moderno); Rye y Abril Fatface (1945), en `fonts/`
- Logos: `logo_blanco.png` (fondos rojos, tarjeta final), `logo_rojo.png` (fondos claros), `logo.png` (solo icono); recortes en `assets/`

```
node render.js stills 3,6,7   # fotogramas de prueba
node render.js all            # escenas + stills + concatenado + timeline
python3 audio/make_audio.py   # efectos + voces + música -> de_puerta_en_puerta_con_audio.mp4 (imagen con -c:v copy)
```

## Sonido
```
python3 audio/cortar_voces.py # corta los mp3 de ElevenLabs (audio/voces/original_*.mp3) en una frase por archivo
python3 audio/make_audio.py
```
- Voces: `audio/voces/<voz>_<n>.(wav|mp3|…)` → narradora_1 (1), narradora_2 (2), vendedor_1 + narradora_3 (3), narradora_4 (4) … narradora_8 (8).
- Efectos: `audio/sfx/<nombre>.wav` si existe; si no, sintetizados (básicos) → `audio/efectos.wav`.
- Música: `audio/musica_1945.mp3` (escenas 1-4 hasta el destello) y `audio/musica_2026.mp3` (desde el destello), corte seco, ~17 dB bajo la voz; si falta un archivo, esa parte va sin música.
