# Historias de Instagram · Escaparate de Tudela

Historias animadas (1080×1920, 30 fps, MP4 H.264 yuv420p, con música y efectos AAC) generadas con Node + Chromium (Playwright) + ffmpeg + Python/numpy. No usa IA ni servicios externos.

## Regla: nada de imágenes ni vídeos en el repo

**Ni las capturas, ni las fotos recortadas, ni los PNG de revisión, ni los MP4 se suben al repositorio.** Todo se entrega por el chat para descargar. `historias/salida/` y `historias/entrada/` están en `.gitignore`. Esta regla vale hasta que el usuario diga lo contrario.

En el repo solo van el código (`plantilla/`, `herramientas/`), las piezas de Pedro (`personajes/pedro/`), `datos.json`, `sonido.json` y `estado.json`.

## Cómo lo pide el usuario

> **Historias** + capturas adjuntas

Variantes que puede añadir en la misma frase:
- `con entrada A` / `con entrada B` → fuerza la entrada de la tanda normal (si no, alterna).
- `con encuesta de precio` / `de descuento` / `de la más vista`: `pregunta …; opciones … / …; respuesta …` + la captura (en la de la más vista, las 2 capturas y cuál ganó).
- `sin música` / `sin sonido` → cambia `sonido.json` solo para esa vez (o `--sin-sonido`).
- `hoy es …` o fechas → se usa como `hoy` en lugar de la fecha de Madrid.

## Pasos (para Claude)

1. **Leer las capturas**: de cada una, tipo (oferta, novedad o evento), título, comercio, precio, precio anterior, descuento, fecha de fin y foto.
   - La foto se recorta de la captura sin etiquetas, estrellas ni botones y **sin deformarla**: el recorte ya con la proporción de la foto de la tarjeta, 896:420 (unos 2,13:1). Se guarda en `historias/entrada/AAAA-MM-DD/`. Si el usuario pasa la foto original, se usa esa.
   - No inventar ni completar datos. Si algo no se lee bien, preguntar. Si falta, se omite (la tarjeta oculta ese elemento).
   - Sin fecha visible no hay píldora de fecha y **no** se supone que termina hoy.
   - Caducadas (fin < hoy en Europe/Madrid): avisar y no incluirlas.
   - "Termina hoy": la que lo diga o cuya fecha de fin sea hoy (`"termina_hoy": true` si lo dice sin fecha).
   - Máximo 4 por tanda; si hay más, preguntar cuáles.
2. **Enseñar la lista** de lo leído y en qué tanda va cada una (Terminan hoy / normal / encuesta) y esperar el OK.
3. **Escribir `historias/datos.json`** (ver formato abajo). La plantilla no tiene datos fijos.
4. **Generar**: `node historias/plantilla/generar.js --png` para revisar si hace falta, y luego sin `--png` para los MP4. Salen en `historias/salida/AAAA-MM-DD/` numerados en orden de publicación (primero Terminan hoy, luego la normal, luego la encuesta).
5. **Enviar los MP4 por el chat** (SendUserFile). No subirlos.
6. **Cuando el usuario apruebe**: `node historias/plantilla/aprobar.js historias/salida/AAAA-MM-DD` (guarda la entrada A/B usada en `estado.json`) y commit + push solo de `historias/estado.json` (y `datos.json`).

## Formato de `datos.json`

```json
{
  "hoy": "2026-11-25",
  "entrada": "auto",
  "publicaciones": [
    { "tipo": "oferta", "titulo": "30% en gafas de sol", "comercio": "Óptica García", "descuento": "-30 %", "fin": "2026-12-11", "foto": "entrada/2026-11-25/gafas_sol.jpg" },
    { "tipo": "novedad", "titulo": "Las gafas de moda", "comercio": "Óptica García", "precio": "65 €", "foto": "entrada/2026-11-25/gafas_moda.jpg" }
  ],
  "encuesta": {
    "tipo": "precio",
    "pregunta": "¿Cuánto crees que cuestan estas gafas?",
    "opciones": ["35 €", "50 €"],
    "respuesta": "35 €",
    "publicacion": { "tipo": "oferta", "titulo": "…", "comercio": "…", "precio": "35 €", "precio_antes": "50 €", "descuento": "-30 %", "fin": "…", "foto": "…" }
  }
}
```

Encuesta: `tipo` = `precio` (se tapan precio y descuento), `descuento` (se tapan descuento y precio final; el de antes se ve) o `mas_vista` (en vez de `publicacion`, `"publicaciones": [A, B]` y `"ganadora": "A"|"B"`; la más vista la dice el usuario, no se saca de la base de datos). Opcionales: `bocadillo1`, `bocadillo2`. Las opciones no se dibujan: las pone el usuario con el sticker. Avisa si el título deja ver la respuesta.

Campos opcionales de cada publicación: `precio`, `precio_antes`, `descuento`, `fin`, `texto_fecha` (sustituye la píldora de fecha), `termina_hoy`, `prueba` (marca grande "PRUEBA" y foto de prueba). `encuesta` solo cuando el usuario la pida.

## Opciones de `generar.js`

```
node historias/plantilla/generar.js [--png] [--entrada A|B] [--solo hoy,normal,encuesta] [--salida carpeta] [--datos fichero] [--sin-sonido]
```

## Qué hace cada historia

- **Tanda normal**: historia 1 = entrada (A: la chica junto a la tienda señala el escaparate; B: Pedro entra andando, da 2 pasos y se para) + zoom + cartel "HOY EN EL ESCAPARATE" con la fecha (1,5 s) + la mano lo cambia por la primera tarjeta. Cada publicación es una historia y su tarjeta se queda quieta al menos 4 s. Si hay otra después, la mano se lleva la tarjeta y el último fotograma es el escaparate vacío; la siguiente empieza con ese mismo fotograma (se copia tal cual) y la mano trae la nueva. La última no se retira y lleva "Todas en tu móvil".
- **Terminan hoy** (siempre Pedro, va primero): la persiana baja, Pedro llega deprisa, la frena con la mano y la levanta; zoom y cartel "TERMINAN HOY" (1,5 s); tarjetas con "SOLO HASTA HOY" y bocadillo "¡Solo hasta hoy!".
- **Encuesta** (siempre la chica, sonriendo para no invadir el hueco del sticker): historia 1 (6 s) con el producto a la vista, la respuesta tapada con etiquetas "?" (o las tarjetas A y B en la más vista), la pregunta arriba, tic-tac y hueco a la derecha de y=1250 a y=1500 para el sticker; historia 2 (6 s) la mano arranca las etiquetas (o se lleva la que no ganó y la ganadora crece con "LA MÁS VISTA") y arriba sale "Respuesta …".
- Tras el zoom, el personaje de la tanda sale **a medio cuerpo** abajo a la izquierda (la cabeza casi toca el escaparate, cortado por abajo) con el bocadillo junto a la cara. Pedro sale sonriendo (su brazo señalando taparía el bocadillo); la chica, señalando. El sticker de enlace va a la derecha, debajo de "Todas en tu móvil" (y=1380–1560).

## Sonido (`sonido.json`)

Música pop alegre original (bajo, acordes tipo ukelele, marimba y batería) y efectos (persiana, pasos, zoom, mano, tarjeta, pop del bocadillo, campanita, tela), todo sintetizado en `herramientas/audio.py`: sin audio de terceros. La música continúa de una historia a la siguiente dentro de la misma tanda. Volúmenes en dB por grupo; `volumen_general_db` ajusta el total (unos −15 LUFS). Para cambiar la canción: `semilla` (otra melodía), `bpm`, `tonalidad`, `acordes`.

## Personajes

- La chica: `carrusel/personajes/maria_*.png` tal cual (no se modifican).
- Pedro: piezas de `carrusel/personajes/pedro_sonriendo.png` en `personajes/pedro/` (cuerpo, brazos y piernas con su pivote en `piezas.json`), creadas con `herramientas/piezas_pedro.py`. En reposo es igual al PNG; anda moviendo piernas y brazos.
