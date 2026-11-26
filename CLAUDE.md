# Instrucciones para Claude

## Carrusel de Instagram

Si el usuario pide un **carrusel** (de Instagram, de la semana, de publicaciones u ofertas), aunque no diga nada más:

1. Lee primero `carrusel/README.md` y sigue sus pasos.
2. Usa la plantilla `carrusel/plantilla/generar.js` con los personajes, fuentes y logos del repo. No inventes otro diseño.
3. Fechas: por defecto de hoy −3 a +3 días. Si dice otras ("son solo de hoy", "del 1 al 5"…), úsalas con `desde` / `hasta`.
4. Saca los datos de las capturas o fotos que adjunte (foto, título, comercio, tipo, descuento, precio y precio tachado, fecha de fin). Si falta algo imprescindible, pregúntalo.
5. Envíale los JPG por el chat para descargar y, en el mismo mensaje, el asunto y el pie de foto completo (texto + hashtags de `pie.txt`) en un bloque listo para copiar y pegar en el post. **No subas las imágenes al repo.**
6. Sube solo `carrusel/estado.json` para que la rotación de personajes continúe.

## Bienvenida de comercios nuevos

Si el usuario escribe **Bienvenida** y adjunta imágenes con el nombre y el sector de cada comercio (Imagen 1: nombre — sector…), aunque no diga nada más:

1. La plantilla está en la rama `bienvenidas`: `git fetch origin bienvenidas && git checkout bienvenidas`. Trabaja en esa rama.
2. Lee `bienvenidas/README.md` y sigue sus pasos.
3. No inventes datos ni cambies el diseño: usa las plantillas A (la chica) y B (Pedro), que alternan solas.
4. Envía los JPG, el pie de foto y los MP4 por el chat. **No subas imágenes ni vídeos al repo.**
5. Cuando lo apruebe, sube solo `bienvenidas/estado.json`.
