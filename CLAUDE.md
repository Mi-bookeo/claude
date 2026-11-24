# Notas del proyecto (vídeos de Escaparate Tudela)

## Logos
- Si en pantalla ya aparece escrito «Escaparate Tudela» (cabecera, tarjeta final, etc.), el logo que va al lado
  NO debe llevar letras: usar solo `logo.png` (el icono del móvil con toldo y etiqueta %, sin texto).
- `logo_blanco.png` (letras blancas, fondos rojos) y `logo_rojo.png` (letras rojas, fondos claros) solo cuando el
  logo va solo, sin el nombre escrito al lado.

## Final de TODOS los vídeos (regla fija desde el vídeo 15)
En la parte final de cada vídeo, siempre dos cosas, en este orden (en voz, en subtítulos y en textos en pantalla):
1. **Enlace en la descripción**, según a quién va dirigido el vídeo:
   - Para clientes / público: «Tienes el enlace al canal de WhatsApp en la descripción».
   - Para negocios: «Tienes el enlace al formulario en la descripción».
2. **Después, la alternativa por comentario**: «O, si lo prefieres, comenta CANAL para el canal de WhatsApp»
   (clientes) o «O, si lo prefieres, comenta ALTA para el formulario de alta» (negocios).

## Dos archivos por vídeo: Instagram y TikTok (regla fija desde el vídeo 15)
El usuario da el audio COMPLETO (el de Instagram, con las frases de «comenta»). Se entregan SIEMPRE dos archivos
con el mismo vídeo; el usuario ya no recorta nada:
- **Vídeo Instagram**: completo (enlace en la descripción + «o comenta CANAL / ALTA»).
- **Vídeo TikTok**: el mismo vídeo SIN la parte de «comenta», quitada en la voz, en los subtítulos y en los textos en
  pantalla (sin franja «Comenta CANAL», «Formulario en la descripción» sin «· Comenta ALTA»). Se genera aparte (no se
  recorta el de Instagram): se corta la frase al final de su tramo, se acorta el plano y se adelantan los siguientes;
  la tarjeta final con el logo sigue al final. Se vuelve a renderizar solo la escena que cambia.
  Herramienta: `audio/variante_tiktok.py` (crea `config.tiktok.json`; los pasos están en su cabecera).
- **Peso**: entregar versiones ligeras para redes (libx264 crf 23, preset slow, tune animation; ≈13 MB por minuto),
  porque TikTok e Instagram vuelven a comprimir. La de máxima calidad (crf 18) solo si la pide.

## Personajes
- **Todos los personajes se dibujan DE FRENTE**, mirando a cámara (nada de perfil ni 3/4), con cuello visible.
- María: `src/maria.js` (diadema negra y rizos; referencia en la rama `video-11-marta-cuatro-motivos`).
- Mari Carmen: `src/maricarmen.js` (de frente y con cuello desde el vídeo 15; mismos rizos castaños, gafas rojas,
  delantal rojo, pantalón azul marino). Sustituye a la versión de perfil del vídeo 06; misma interfaz `placeMC()`.
- Sara (peluquera, vídeo 16): `src/sara.js` (`placeSara()`, suelo y=208, de frente; pelo rapado a un lado con mechón
  morado, aros dorados, camiseta blanca, delantal negro con tijeras y peine). En el mismo archivo, la clienta
  (`placeClienta()`, melena ondulada, chaqueta verde, bolso) y el sillón de peluquería.
