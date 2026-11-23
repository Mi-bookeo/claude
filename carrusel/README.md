# Personajes sueltos para carruseles de Instagram

PNG con fondo transparente, 1500×1875 px (los personajes miden unos 1680–1740 px de alto).
Todos usan el mismo lienzo, la misma escala y el mismo suelo, así que si los pones en la misma
posición quedan alineados entre una diapositiva y otra.

| Pose | María | Pedro |
|---|---|---|
| Señalando | `png/maria_senalando.png` | `png/pedro_senalando.png` |
| Sonriendo | `png/maria_sonriendo.png` | `png/pedro_sonriendo.png` |
| Sorprendido/a | `png/maria_sorprendida.png` | `png/pedro_sorprendido.png` |
| Sosteniendo una etiqueta | `png/maria_etiqueta.png` | `png/pedro_etiqueta.png` |
| Móvil grande, pantalla en blanco | `png/maria_movil.png` | `png/pedro_movil.png` |

## De dónde salen

Nada está redibujado a mano: las poses se generan con el código de los vídeos
(rama `video-11-marta-cuatro-motivos`):

- **María**: `src/maria.js` (`placeMaria`), el personaje fijo del vídeo 11, con contorno negro.
- **Pedro**: `src/v05.js` (`placePedro`), el mismo Pedro del cartel (camiseta verde y gafas).
- Manos (señalar, abiertas, puño): `hand11` de `src/v11.js`.
- Etiqueta roja con «%»: `hangTag` de `src/v04.js`.
- El móvil grande es una pieza nueva en el estilo de la serie: carcasa negra con el mismo
  contorno y pantalla blanca lisa (#FFFFFF). La pantalla mide lo mismo en los dos personajes.

Los dos personajes se dibujan a la misma escala (7,5), así que el contorno tiene el mismo
grosor en todos los archivos, y los colores salen de las mismas paletas del código (`MG`, `P5`, `C`).

## Volver a generarlos

```bash
mkdir -p /tmp/v11 && git archive origin/video-11-marta-cuatro-motivos src fonts | tar -x -C /tmp/v11
node carrusel/generar.js /tmp/v11 carrusel/png
```

Las poses se definen en `poses.js` (expresión, posición de las manos, etc.).
