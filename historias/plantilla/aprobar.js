// Se ejecuta cuando el usuario aprueba los vídeos: guarda en historias/estado.json la entrada usada (A/B)
// para que la siguiente tanda normal use la otra.
// Uso: node historias/plantilla/aprobar.js historias/salida/<carpeta>
const fs = require('fs');
const path = require('path');
const carpeta = path.resolve(process.argv[2] || '.');
const f = path.join(carpeta, 'entrada.json');
if (!fs.existsSync(f)) { console.error(`No hay ${f}: esa salida no tenía tanda normal, no cambia la rotación.`); process.exit(1); }
const { entrada, fecha } = JSON.parse(fs.readFileSync(f, 'utf8'));
const destino = path.resolve(__dirname, '..', 'estado.json');
fs.writeFileSync(destino, JSON.stringify({ ultima_entrada: entrada, fecha }, null, 2) + '\n');
console.log(`estado.json: última entrada ${entrada} (${fecha}). La próxima tanda normal usará la ${entrada === 'A' ? 'B' : 'A'}.`);
