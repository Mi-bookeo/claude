# Bienvenidas de comercios nuevos · Escaparate de Tudela

Post o carrusel (1080×1350 JPG) e historias animadas (1080×1920, 30 fps, MP4 H.264 yuv420p, sin audio) para dar la bienvenida a los comercios nuevos. Plantillas fijas con Node + Chromium (Playwright) + ffmpeg. Sin IA y sin servicios externos.

Reutiliza la fachada, el toldo, el rótulo y la mano de `historias/` (rama `historias-instagram`), los personajes de `carrusel/personajes/` y las piezas de Pedro de `historias/personajes/pedro/`, sin cambiar su aspecto. Fuente Poppins de `carrusel/fuentes/`.

**Las imágenes y los MP4 no se suben al repo**: `bienvenidas/salida/` está en `.gitignore`. Se envían por el chat.

## Qué se genera

- **1 comercio**: `01.jpg` (post) + 1 historia.
- **2 a 9**: carrusel (`01.jpg` portada "NUEVOS EN EL ESCAPARATE" + una imagen por comercio) + 1 historia por comercio. Si hay más de 9, se usan los 9 primeros y el resto queda pendiente (aviso).
- `pie.txt`: texto para copiar y cuentas de Instagram para etiquetar e invitar como colaboradoras.

## Datos (`datos.json`)

```json
{
  "hoy": "2026-11-30",
  "animacion": "auto",
  "comercios": [
    { "nombre": "…", "calle": "…", "ofrece": "…", "foto": "fotos/x.jpg", "instagram": "cuenta" }
  ]
}
```

- Solo `nombre` es obligatorio. Si falta `calle`, `ofrece` o `foto`, ese elemento no sale y la tarjeta se recoloca.
- `foto` es relativa a la carpeta del JSON. `prueba: true` pone el sello "PRUEBA" (y una foto de rayas si no hay foto).
- `animacion`: `auto` (alterna según `estado.json`), `A` o `B`.
- Pruebas: `prueba/tres.json` (nombre largo y comercio sin calle) y `prueba/uno.json`.

## Comandos (desde la raíz del repo)

```
node bienvenidas/plantilla/imagenes.js  <datos.json> [--salida carpeta] [--animacion A|B]
node bienvenidas/plantilla/historias.js <datos.json> [--png] [--animacion A|B] [--salida carpeta]
node bienvenidas/plantilla/aprobar.js   <carpeta de las historias>
```

- `--png` saca capturas de los momentos clave en lugar de los MP4.
- `aprobar.js` se ejecuta cuando el usuario aprueba los vídeos: guarda en `estado.json` la animación usada. Después se hace commit y push solo de `bienvenidas/estado.json`.

## Historias

- **A · Gran inauguración**: el escaparate tiene un telón rojo; la chica, al lado, tira dos veces del cordón; desaparece (salida rápida con nubecilla); se abre el telón con confeti; zoom al escaparate y sale la tarjeta del comercio.
- **B · El nuevo rótulo**: Pedro ya está quieto junto a la tienda (no entra andando). Tira de la cuerda en 4 tirones moviendo los brazos (piezas articuladas) y en cada tirón baja un tramo del rótulo con el nombre. Pedro desaparece, zoom, el rótulo se enrolla y sale la tarjeta con la foto.
- Tras aparecer el comercio no vuelve ningún personaje. La tarjeta queda grande y quieta 4,5 s (5 s en la última).
- **Varios comercios**: la animación completa solo en la primera historia. Al final de cada una, la mano quita el cartel y quedan 0,2 s de escaparate vacío. La siguiente empieza con ese mismo fotograma (copiado tal cual) y la mano trae el cartel nuevo. El último cartel no se quita.
- Última historia: "Conócelo en Escaparate de Tudela" ("Conócelos" si hay varios) en y≈1262–1368, con el hueco del sticker de enlace libre (y=1380–1560). Los textos importantes van entre y=250 e y=1580.
