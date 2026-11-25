// Guarda la animación usada (A o B) cuando el usuario aprueba los vídeos, para que la siguiente tanda use la otra.
// Uso: node bienvenidas/plantilla/aprobar.js <carpeta de las historias>
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
if (!dir) { console.error('Uso: node bienvenidas/plantilla/aprobar.js <carpeta de las historias>'); process.exit(1); }
const a = JSON.parse(fs.readFileSync(path.join(dir, 'animacion.json'), 'utf8'));
const f = path.join(__dirname, '..', 'estado.json');
fs.writeFileSync(f, JSON.stringify({ ultima_animacion: a.animacion, fecha: a.fecha, comercios: a.comercios }, null, 1) + '\n');
console.log(`Guardado: última animación ${a.animacion} (${a.fecha}). La siguiente tanda usará la ${a.animacion === 'A' ? 'B' : 'A'}.`);
