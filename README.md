# Ana y el cuentacuentos (vídeo 14 · Escaparate de Tudela)

Vídeo vertical 1080x1920, 30 fps, H.264 (libx264, crf 18, yuv420p). Dirigido a COMERCIOS: la gente atrae a la gente
(prueba social). Ana, librera, duda si organizar un cuentacuentos porque el año pasado no vino nadie; esta vez lo
anuncia en Escaparate de Tudela, llegan los primeros y los primeros atraen a los que pasan.

- `ana_cuentacuentos.mp4` — vídeo sin audio ni subtítulos (franja inferior y > 1400 libre)
- `ana_cuentacuentos_con_audio.mp4` — misma imagen (-c:v copy) + voces, efectos y música
- `ana_cuentacuentos_subtitulado.mp4` — con subtítulos quemados (franja y=1450..1750) + la misma pista de sonido; `subtitles.srt`
- `scenes/` una escena por archivo · `stills/` un fotograma por escena · `timeline.txt` inicio/fin de cada escena
- `config.json` — duración de cada escena (único sitio), planos (`shots`), momentos (`cues`), voces (`voices`) y datos
  de ejemplo de la tarjeta de evento (`evento`: «Cuentacuentos infantil», «Sábado · 12:00»)
- Código: `src/v14.js` (Ana, la cuentacuentos, niños, adultos nuevos, librería por fuera y por dentro, cartulina,
  sala vacía, tarjeta de evento, dragón), `src/scenes.js`; piezas de la serie en `src/lib.js`, `src/series.js`,
  `src/rosa.js`, `src/v04.js`…`src/v13.js`
- Logos: `logo.png` (solo icono) junto al nombre escrito; `logo_rojo.png` / `logo_blanco.png` (recortes en `assets/`)

```
node render.js stills 3,7,9          # fotogramas de prueba
node render.js all                   # escenas + stills + concatenado + timeline
python3 audio/colocar_voces.py       # mide las voces (audio/voces/<voz>_<n>.wav|.mp3), las coloca y alarga escenas si hace falta
node render.js scenes 1,4 && node render.js concat   # volver a renderizar solo las escenas alargadas
python3 audio/make_music.py          # música original sintetizada (si no hay audio/musica.mp3)
python3 audio/make_audio.py          # voces + efectos + música -> ana_cuentacuentos_con_audio.mp4 (imagen con -c:v copy)
python3 audio/subtitulos.py --burn   # subtitles.srt + ana_cuentacuentos_subtitulado.mp4
```

## Sonido
- Voces: un archivo por frase en `audio/voces/` (narradora_1…4, ana_1…6, madre_1…2, vecino_1…2). La niña no habla.
- Efectos: `audio/sfx/<nombre>.wav|.mp3` si existe; si no, sintetizados con código (básicos).
- Música: `audio/musica.mp3` si existe; si no, música original sintetizada por `audio/make_music.py`.
