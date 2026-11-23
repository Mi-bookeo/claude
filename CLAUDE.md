# Instrucciones para Claude

## Carrusel de Instagram

Si el usuario pide un **carrusel** (de Instagram, de la semana, de publicaciones u ofertas), aunque no diga nada más:

1. Lee primero `carrusel/README.md` y sigue sus pasos.
2. Usa la plantilla `carrusel/plantilla/generar.js` con los personajes, fuentes y logos del repo. No inventes otro diseño.
3. Fechas: por defecto de hoy −3 a +3 días. Si dice otras ("son solo de hoy", "del 1 al 5"…), úsalas con `desde` / `hasta`.
4. Saca los datos de las capturas o fotos que adjunte (foto, título, comercio, tipo, descuento, precio y precio tachado, fecha de fin). Si falta algo imprescindible, pregúntalo.
5. Envíale los JPG y el pie de foto por el chat para descargar. **No subas las imágenes al repo.**
6. Sube solo `carrusel/estado.json` para que la rotación de personajes continúe.
