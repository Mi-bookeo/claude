# Marta y la cesta de bebé (vídeo 12 · Escaparate de Tudela)

Vídeo vertical 1080x1920, 30 fps, H.264 (libx264, crf 18, yuv420p), 53,0 s. Dirigido al público: Marta busca un regalo
para la hija recién nacida de su amiga Lucía, le llega una oferta de una farmacia, escribe desde la propia oferta,
recoge la cesta el viernes e invita a apuntarse al canal.

- `marta_cesta_bebe.mp4` — vídeo sin audio ni subtítulos (franja inferior y > 1400 libre)
- `marta_cesta_bebe_con_audio.mp4` — misma imagen (-c:v copy) + voces, efectos y música
- `marta_cesta_bebe_subtitulado.mp4` — con subtítulos dibujados en la franja inferior + la misma pista de sonido;
  `marta_cesta_bebe.srt` y `subtitles.json` — tiempos de los subtítulos
- `scenes/` una escena por archivo · `stills/` un fotograma por escena · `timeline.txt` inicio/fin de cada escena
- `config.json` — duración de cada escena (único sitio), momentos de aparición (`cues`), planos (`shots`),
  tramos de boca de Marta (`talk`) y frase de cada escena (`voice`)
- Código: `src/v12.js` (piezas nuevas: Marta sentada y de medio cuerpo, Lucía con el bebé, salón, portátil,
  cesta, móvil con oferta y chat, farmacia y farmacéutica), `src/scenes.js`; piezas de la serie en `src/lib.js`,
  `src/series.js`, `src/rosa.js`, `src/v04.js`…`src/v11.js`
- Logos: `logo.png` (solo icono) junto al nombre escrito; `logo_rojo.png` / `logo_blanco.png` (recortes en `assets/`)

```
node render.js stills 2,5,7     # fotogramas de prueba
node render.js all              # escenas + stills + concatenado + timeline
python3 audio/cortar_voces.py   # corta las dos grabaciones en narradora_1…4 y marta_1…3 y las coloca en config.json
python3 audio/make_audio.py     # voces + efectos + música -> marta_cesta_bebe_con_audio.mp4 (imagen con -c:v copy)
python3 audio/subtitulos.py && node render.js subs   # subtítulos -> tmp/subtitulado_mudo.mp4 (luego se le añade la mezcla)
```

## Sonido
- Voces (ElevenLabs): `audio/voces/original_narradora.mp3` («Carolina Ruiz») y `audio/voces/original_marta.mp3`
  («Sofia»), cortadas en una frase por archivo. Escenas 5 y 7 sin voz. En las escenas 3 y 8 la frase de Marta empieza
  a 1,0 s para que «¡Wow!» y «¡Bien!» coincidan con su rótulo; el resto, a 0,15 s del inicio de la escena.
- Efectos: `audio/sfx/<nombre>.wav` si existe; si no, sintetizados con código (básicos).
- Música: `audio/musica.mp3` si existe; si no, música original suave sintetizada por `audio/make_music.py`
  (tierna en 1-2, golpe de energía en la notificación, animada en 4-5, celebración en 6-8, cierre en 9).
