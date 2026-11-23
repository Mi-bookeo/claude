# 4 motivos para estar en el canal (vídeo 11 · Escaparate Tudela)

Dos versiones: con **María** (actual, `"character": "maria"` en config.json → `maria_cuatro_motivos*.mp4`) y con
**Marta** (`marta_cuatro_motivos*.mp4`; quita `"character"` y pon `"output": "marta_cuatro_motivos.mp4"` para volver a generarla).
María: `src/maria.js`, referencia en `assets/personajes/maria_referencia.png`.

Vídeo vertical 1080x1920, 30 fps, H.264 (crf 18, yuv420p), 48,8 s (escenas ajustadas a la voz de Marta). Marta habla a cámara y enumera cuatro motivos
para estar en el canal (el cuarto, «El mejor»: apoyas al comercio local). Dirigido al público.

- `marta_cuatro_motivos.mp4` — vídeo sin audio · `marta_cuatro_motivos_con_audio.mp4` — misma imagen (-c:v copy) + sonido
- `marta_cuatro_motivos_subtitulado.mp4` — con subtítulos dibujados en la franja inferior + la misma pista de sonido · `marta_cuatro_motivos.srt` y `subtitles.json` — tiempos (`python3 audio/subtitulos.py`, luego `node render.js subs`)
- `scenes/` una escena por archivo · `stills/` un fotograma por escena · `timeline.txt` inicio/fin de cada escena
- `config.json` — duración de cada escena, tramos de los planos (`shots`: A/B/C, P1/P2/FIN) y tramos en que Marta
  mueve la boca (`talk`), en segundos locales de la escena
- Código: `src/v11.js` (Marta a cámara, manos y poses, cabecera, números, imágenes insertadas), `src/scenes.js`;
  piezas de la serie en `src/lib.js`, `src/series.js`, `src/rosa.js`, `src/v04.js`…`src/v10.js`
- Logos: `logo_rojo.png` (fondos claros: cabecera), `logo_blanco.png` (fondos rojos: tarjeta final); recortes en `assets/`

```
node render.js stills 2,5,7     # fotogramas de prueba
node render.js scenes 3         # volver a renderizar solo una escena
node render.js all              # escenas + stills + concatenado + timeline
python3 audio/cortar_voces.py   # corta audio/voces/original_marta.mp3 en marta_1…7 y escribe los tramos «talk» en config.json
python3 audio/make_audio.py     # voces + efectos + música -> marta_cuatro_motivos_con_audio.mp4 (imagen con -c:v copy)
```

## Sonido
- Voz original: `audio/voces/original_marta.mp3` (ElevenLabs, «Sofia»), cortada en las 7 frases del guion.
- Voces: `audio/voces/marta_<n>.(wav|mp3|m4a|ogg|flac)` al inicio de la escena n (1…7), igualadas a -20 dBFS RMS; cada una empieza 0,15 s después del inicio de su escena.
  Las que falten quedan en silencio (el script avisa). Si una frase dura más que su escena, el script lo indica:
  ajusta `duration`, `shots` y `talk` de esa escena en `config.json` y ejecuta `node render.js scenes <n>` y
  `node render.js concat` antes de volver a mezclar.
- Efectos: `audio/sfx/<nombre>.wav` si existe (pop, pop_s, ding, ting, carton, clac, chaching, guitarra, murmullo,
  cling, latido, aplausos, risas, confeti, tachan, whoosh); si no, se sintetizan con código (básicos).
- Música: `audio/musica.mp3` si existe; si no, música original suave sintetizada por `audio/make_music.py`
  (pop a 112 BPM, stingers en cada número, sube en la escena 5, acorde final en la tarjeta). Queda ~18 dB bajo
  la voz y baja 2 dB más mientras habla Marta.
