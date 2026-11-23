# Carrusel de Instagram · Escaparate de Tudela

Genera el carrusel semanal (1080×1350, 4:5) sin IA, con una plantilla fija. Se ejecuta a mano en una sesión de Claude Code (no usa Cloudflare).

## Carpetas

| Carpeta | Contenido |
|---|---|
| `personajes/` | Los 8 PNG 1500×1875 con transparencia (maria/pedro × cartel, movil, senalando, sonriendo). |
| `fuentes/` | Poppins Bold y Light (licencia OFL en `OFL.txt`). |
| `plantilla/generar.js` | El generador (Node + Playwright/Chromium). `make_carrusel_referencia.py` es la versión antigua, solo de referencia. |
| `estado.json` | Último personaje usado en portada, cierre y contenido, para que el siguiente carrusel no repita. |
| `salida/AAAA-MM-DD/` | Cada carrusel: `publicaciones.json`, las fotos, `01.jpg`, `02.jpg`… y `pie.txt`. |
| `ejemplo/` | Prueba con publicaciones inventadas. |

Los logos son `../logo_blanco.png` (sobre rojo) y `../logo_rojo.png` (pantalla del móvil).

## Cómo hacer un carrusel

1. Crea `salida/AAAA-MM-DD/` con las fotos (JPG) y un `publicaciones.json`:

```json
{
  "hoy": "2026-11-23",
  "publicaciones": [
    { "tipo": "oferta", "titulo": "Botas de piel", "comercio": "Calzados X", "descuento": "-20 %", "fin": "2026-11-30", "foto": "foto1.jpg" },
    { "tipo": "novedad", "titulo": "Nueva colección", "comercio": "Tienda Y", "fin": "2026-12-15", "foto": "foto2.jpg" },
    { "tipo": "evento", "titulo": "Concierto", "comercio": "Bar Z", "fin": "2026-11-28", "foto": "foto3.jpg" }
  ]
}
```

   - `tipo`: `oferta`, `novedad` o `evento`. `descuento` es opcional (-20 %, 2x1…).
   - `fin` (AAAA-MM-DD) da la píldora: "Hasta el DD/MM", "¡Termina hoy!" si es `hoy`. `texto_fecha` la sustituye por un texto libre.
   - Rango del asunto y la portada: de `hoy` −3 a +3 días (se puede forzar con `desde` / `hasta`).
   - Máximo 8: se usan las que terminan antes.

2. Ejecuta desde la raíz del repo:

```
node carrusel/plantilla/generar.js carrusel/salida/AAAA-MM-DD
```

   Añade `--sin-estado` para probar sin avanzar la rotación de personajes.

## Rotación de personajes

- Portada: alterna `maria_cartel` / `pedro_cartel`. Cierre: el contrario de la portada (`*_movil`).
- Contenido: ciclo `maria_senalando → pedro_sonriendo → maria_sonriendo → pedro_senalando`, que sigue donde lo dejó el carrusel anterior. Así alterna María y Pedro y nunca repite el mismo personaje y pose seguidos.
- Lado: el personaje alterna izquierda/derecha en cada diapositiva y el lado inicial cambia en cada carrusel. Solo se espejan las poses de señalar (para que apunten al bocadillo).

## Zonas blancas medidas (x, y, w, h en el PNG)

maria_cartel (296, 817, 908, 549) · maria_movil (539, 837, 422, 688) · pedro_cartel (296, 637, 908, 549) · pedro_movil (539, 657, 422, 688)
