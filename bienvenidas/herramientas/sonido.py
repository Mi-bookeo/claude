# Audio de las historias de bienvenida: la música y los efectos de historias/herramientas/audio.py (sin cambiarlo)
# más dos efectos nuevos: «cuerda» (tirón: roce de la cuerda y chirrido de la polea) y «confeti» (petardo de fiesta y destellos).
# Uso: python3 bienvenidas/herramientas/sonido.py <entrada.json> <salida.wav>   (mismo formato que audio.py)
import importlib.util, os, sys
import numpy as np

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
spec = importlib.util.spec_from_file_location('audio_historias', os.path.join(RAIZ, 'historias', 'herramientas', 'audio.py'))
au = importlib.util.module_from_spec(spec); spec.loader.exec_module(au)
SR = au.SR

def cuerda(d, rng):
    n = int(max(d, 0.15) * SR); t = au.t_(n)
    roce = au.paso_alto(au.paso_bajo(au.ruido(n, rng), 6), 40)          # roce áspero de la cuerda
    gr = 1 + 0.6 * np.sign(np.sin(2 * np.pi * 38 * t))                   # granulado de las fibras
    env = np.sin(np.pi * np.clip(t / (n / SR), 0, 1)) ** 0.7
    f = 820 + 380 * (t / (n / SR)) + 25 * np.sin(2 * np.pi * 9 * t)      # chirrido corto de la polea
    chirrido = 0.18 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    return (roce * gr * 0.55 + chirrido) * env

def confeti(rng):
    n = int(0.12 * SR); t = au.t_(n)
    petardo = au.paso_alto(au.ruido(n, rng), 3) * np.exp(-t * 40) * 0.9
    brillo = au.campanita((91, 96, 100))
    x = np.zeros(max(len(brillo) + int(0.05 * SR), n)); x[:n] += petardo; x[int(0.05 * SR):int(0.05 * SR) + len(brillo)] += brillo * 0.8
    return x

_orig = au.efecto
def efecto(e, rng):
    if e['tipo'] == 'cuerda': return cuerda(e.get('dur', 0.35), rng)
    if e['tipo'] == 'confeti': return confeti(rng)
    return _orig(e, rng)
au.efecto = efecto
au.GRUPO.update({'cuerda': 'cuerda', 'confeti': 'confeti'})

if __name__ == '__main__':
    au.main()
