# Pedro y el amigo invisible (vídeo 07 · Escaparate de Tudela)

Vídeo vertical 1080x1920, 30 fps, H.264 (crf 18), sin audio ni subtítulos, 44 s. Duraciones de escena: `config.json`.

- `pedro_amigo_invisible.mp4` — vídeo completo · `scenes/` una escena por archivo · `timeline.txt` · `stills/`
- Código: `src/lib.js`, `src/series.js`, `src/rosa.js`, `src/v04.js`, `src/v05.js`, `src/v06.js` (piezas de los vídeos 01-06), `src/v07.js` (Pedro con camisa a cuadros, Navidad, tienda REGALOS, bar), `src/scenes.js`
- Logos: los de la raíz (`logo_blanco.png`, `logo_rojo.png`, con fondo opaco) se recortan a `assets/*_t.png` con `python3 tools/key_logos.py`

```
node render.js stills 2,5,8   # fotogramas de prueba
node render.js all            # escenas + stills + concatenado + timeline
```
