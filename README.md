# Pedro y el amigo invisible (vídeo 07 · Escaparate de Tudela)

Vídeo vertical 1080x1920, 30 fps, H.264 (crf 18), sin audio ni subtítulos, 44 s. Duraciones de escena: `config.json`.

- `pedro_amigo_invisible.mp4` — vídeo completo · `scenes/` una escena por archivo · `timeline.txt` · `stills/`
- Código: `src/lib.js`, `src/series.js`, `src/rosa.js`, `src/v04.js`, `src/v05.js`, `src/v06.js` (piezas de los vídeos 01-06), `src/v07.js` (Pedro con camisa a cuadros, Navidad, tienda REGALOS, bar), `src/scenes.js`
- Logos: los de la raíz (`logo_blanco.png`, `logo_rojo.png`, con fondo opaco) se recortan a `assets/*_t.png` con `python3 tools/key_logos.py`

```
node render.js stills 2,5,8   # fotogramas de prueba
node render.js all            # escenas + stills + concatenado + timeline
```

## Sonido
```
python3 audio/cortar_voces.py # corta los mp3 de ElevenLabs (audio/voces/original_*.mp3) en una frase por archivo
python3 audio/make_audio.py   # efectos + voces + música -> pedro_amigo_invisible_con_audio.mp4 (imagen con -c:v copy)
```
- Voces: `audio/voces/<voz>_<n>.(wav|mp3|…)` → narradora_1 (1), amiga_1 (2), pedro_1 (3), pedro_2 (4), pedro_3 (5, a los 2,75 s), pedro_4 (9), narradora_2 + narradora_3 (10).
- Efectos: `audio/sfx/<nombre>.wav` si existe; si no, sintetizados (básicos) → `audio/efectos.wav`.
- Música: `audio/musica.mp3` si existe (automatización por escena, ~17 dB bajo la voz); si no, sin música.
