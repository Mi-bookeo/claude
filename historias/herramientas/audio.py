# Sintetiza el audio de una historia: música alegre original + efectos de sonido.
# Uso: python3 historias/herramientas/audio.py <entrada.json> <salida.wav>
#   entrada.json: {"dur": s, "offset": s, "eventos": [{"t": s, "tipo": "...", "dur": s}], "ajustes": {...sonido.json}}
# Todo se genera con números (sin samples ni música de terceros) y es determinista.
import json, sys, wave
import numpy as np

SR = 44100
NOTAS = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
GRADOS = {'I': (0, 'M'), 'ii': (2, 'm'), 'iii': (4, 'm'), 'IV': (5, 'M'), 'V': (7, 'M'), 'vi': (9, 'm')}

def db(x): return 10 ** (x / 20)
def hz(midi): return 440 * 2 ** ((midi - 69) / 12)
def t_(n): return np.arange(n) / SR
def ruido(n, rng): return rng.uniform(-1, 1, n)
def paso_bajo(x, k):
    k = max(1, int(k)); return np.convolve(x, np.ones(k) / k, mode='same')
def paso_alto(x, k): return x - paso_bajo(x, k)

# ---------------- efectos
def persiana(d, rng, final=True):
    n = int(d * SR); s = np.zeros(n)
    tt = 0.0
    while tt < d:                                   # traqueteo de lamas
        i = int(tt * SR); m = min(n - i, int(0.03 * SR))
        clic = paso_alto(ruido(m, rng), 6) * np.exp(-t_(m) / 0.006) * rng.uniform(0.5, 1.0)
        s[i:i + m] += clic
        tt += rng.uniform(0.028, 0.045)
    s += paso_bajo(ruido(n, rng), 60) * 1.6        # rumor metálico
    s *= np.minimum(1, t_(n) / 0.05) * np.minimum(1, (d - t_(n)) / 0.06)
    if final:                                       # golpe seco al pararse
        m = int(0.18 * SR); g = np.sin(2 * np.pi * 70 * t_(m)) * np.exp(-t_(m) / 0.05) + paso_alto(ruido(m, rng), 4) * np.exp(-t_(m) / 0.015) * 0.8
        s = np.concatenate([s, g])
    return s * 0.8

def paso(rng):
    m = int(0.14 * SR); tt = t_(m)
    f = 110 * np.exp(-tt / 0.05) + 55
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.035) + paso_bajo(ruido(m, rng), 8) * np.exp(-tt / 0.01) * 0.5

def whoosh(d, rng, brillo=1.0):
    n = int(d * SR); tt = t_(n)
    x = ruido(n, rng); a, b = paso_bajo(x, 40), paso_bajo(x, 8)
    env = np.sin(np.pi * np.clip(tt / d, 0, 1)) ** 2
    sube = np.clip(tt / d, 0, 1)
    return (a * (1 - sube) + b * sube * brillo) * env * 2.2

def golpe_tarjeta(rng):
    m = int(0.2 * SR); tt = t_(m)
    return np.sin(2 * np.pi * 140 * tt) * np.exp(-tt / 0.03) * 0.8 + paso_bajo(ruido(m, rng), 5) * np.exp(-tt / 0.012) * 1.2

def pop():
    m = int(0.12 * SR); tt = t_(m)
    f = 380 + 900 * (tt / 0.12)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.04)

def campanita(notas=(88, 95)):
    out = []
    for k, nt in enumerate(notas):
        m = int(0.9 * SR); tt = t_(m); f = hz(nt)
        s = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt / dcy) for r, a, dcy in [(1, 1, 0.5), (2.76, 0.35, 0.15), (5.4, 0.15, 0.07)])
        out.append((k * 0.09, s * 0.5))
    n = int((0.09 * (len(notas) - 1) + 0.9) * SR); s = np.zeros(n)
    for o, x in out: i = int(o * SR); s[i:i + len(x)] += x
    return s

def tictac(d):
    # reloj suave: tic agudo y tac algo más grave cada medio segundo, con fundido de entrada
    n = int(d * SR); s = np.zeros(n); k = 0
    while k * 0.5 < d - 0.05:
        f = 2400 if k % 2 == 0 else 1800
        m = int(0.04 * SR); tt = t_(m)
        x = np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.006) + 0.5 * np.sin(2 * np.pi * f * 0.5 * tt) * np.exp(-tt / 0.01)
        i = int(k * 0.5 * SR); x = x[:n - i]; s[i:i + len(x)] += x * min(1, 0.4 + k * 0.15)
        k += 1
    return s * 0.6

def efecto(e, rng):
    tp, d = e['tipo'], e.get('dur', 0.5)
    if tp == 'persiana_baja': return persiana(d, rng, final=e.get('golpe', True))
    if tp == 'persiana_sube': return persiana(d, rng, final=True)
    if tp == 'paso': return paso(rng)
    if tp == 'zoom': return whoosh(d, rng, 1.2)
    if tp == 'mano': return whoosh(d, rng, 0.8)
    if tp == 'tela': return whoosh(d, rng, 1.6)
    if tp == 'tarjeta_cae': return golpe_tarjeta(rng)
    if tp == 'pop': return pop()
    if tp == 'campanita': return campanita()
    if tp == 'respuesta': return campanita((84, 88, 91, 96))
    if tp == 'tictac': return tictac(d)
    raise ValueError(tp)

GRUPO = {'persiana_baja': 'persiana', 'persiana_sube': 'persiana', 'paso': 'pasos', 'zoom': 'zoom', 'mano': 'mano', 'tela': 'tela',
         'tarjeta_cae': 'tarjeta_cae', 'pop': 'pop', 'tictac': 'tictac', 'campanita': 'campanita', 'respuesta': 'campanita'}

# ---------------- música: pop alegre (bajo, acordes en contratiempo, melodía de marimba y batería)
def musica(dur, offset, aj):
    bpm = aj.get('bpm', 118); beat = 60 / bpm; ton = NOTAS[aj.get('tonalidad', 'C')]
    acordes = aj.get('acordes', ['I', 'V', 'vi', 'IV'])
    rng = np.random.default_rng(aj.get('semilla', 7))
    n = int(dur * SR) + SR; L = np.zeros(n); R = np.zeros(n)
    def nota(t0, x, pan=0.0):
        i = int((t0 - offset) * SR)
        if i + len(x) <= 0 or i >= n: return
        a, b = max(0, -i), min(len(x), n - i)
        L[i + a:i + b] += x[a:b] * (1 - pan) ; R[i + a:i + b] += x[a:b] * (1 + pan)
    def pluck(f, d, brillo):
        m = int(d * SR); tt = t_(m)
        return sum(np.sin(2 * np.pi * f * k * tt) * np.exp(-tt * (3 + k * brillo)) / k for k in range(1, 6))
    def marimba(f, d=0.35):
        m = int(d * SR); tt = t_(m)
        return (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * f * 4 * tt) * np.exp(-tt * 30)) * np.exp(-tt * 9)
    kick = (lambda m: np.sin(2 * np.pi * np.cumsum(50 + 120 * np.exp(-t_(m) / 0.03)) / SR) * np.exp(-t_(m) / 0.12))(int(0.3 * SR))
    clap = paso_alto(np.random.default_rng(1).uniform(-1, 1, int(0.15 * SR)), 5) * np.exp(-t_(int(0.15 * SR)) / 0.04)
    hat = paso_alto(np.random.default_rng(2).uniform(-1, 1, int(0.05 * SR)), 2) * np.exp(-t_(int(0.05 * SR)) / 0.012)
    # melodía: frase de 4 compases que se repite (gancho reconocible)
    escala = [0, 2, 4, 7, 9, 12, 14, 16]
    frase = []
    for c in range(4):
        raiz = GRADOS[acordes[c % len(acordes)]][0]
        for k in range(8):
            if rng.random() < 0.3 and k % 2: frase.append(None); continue
            cand = [e for e in escala if (e - raiz) % 12 in (0, 3, 4, 7)] or escala
            frase.append(int(rng.choice(cand)))
    compas0 = int(offset // (4 * beat)); compas1 = int((offset + dur) // (4 * beat)) + 1
    for b in range(compas0, compas1):
        t0 = b * 4 * beat
        g, modo = GRADOS[acordes[b % len(acordes)]]
        raiz = 48 + ton + g; triada = [0, 3 if modo == 'm' else 4, 7]
        # bajo
        for k, (o, d) in enumerate([(0, 0.9), (1.5, 0.4), (2, 0.9), (3.5, 0.4)]):
            f = hz(raiz - 12 + (7 if k == 3 else 0))
            nota(t0 + o * beat, pluck(f, d * beat * 1.2, 0.6) * 0.55)
        # acordes en contratiempo (estilo ukelele)
        for o in (0.5, 1.5, 2.5, 3.5):
            nota(t0 + o * beat, sum(pluck(hz(raiz + 12 + iv), 0.25, 3) for iv in triada) * 0.12, -0.3)
        # batería
        for o in (0, 2): nota(t0 + o * beat, kick * 0.7)
        for o in (2.75,): nota(t0 + o * beat, kick * 0.35)
        for o in (1, 3): nota(t0 + o * beat, clap * 0.35, 0.1)
        for o in np.arange(0, 4, 0.5): nota(t0 + o * beat + 0.01, hat * (0.12 if o % 1 else 0.07), 0.4)
        # melodía
        for k in range(8):
            e = frase[(b % 4) * 8 + k]
            if e is not None: nota(t0 + k * 0.5 * beat, marimba(hz(72 + ton + e)) * 0.22, -0.15)
    return L[:int(dur * SR)], R[:int(dur * SR)]

def main():
    cfg = json.load(open(sys.argv[1])); out = sys.argv[2]
    dur, off, aj = cfg['dur'], cfg.get('offset', 0), cfg['ajustes']
    n = int(dur * SR); L = np.zeros(n); R = np.zeros(n)
    if aj.get('activado', True):
        mu = aj.get('musica', {})
        if mu.get('activada', True):
            ml, mr = musica(dur, off if mu.get('continua_en_la_tanda', True) else 0, mu)
            v = db(mu.get('volumen_db', -15))
            L += ml * v; R += mr * v
        ef = aj.get('efectos', {})
        if ef.get('activados', True):
            rng = np.random.default_rng(3)
            for e in cfg['eventos']:
                x = efecto(e, rng) * db(ef.get('volumen_db', 0) + ef.get(GRUPO[e['tipo']], 0)) * 0.5
                i = int(e['t'] * SR)
                if i >= n: continue
                x = x[:n - i]; L[i:i + len(x)] += x; R[i:i + len(x)] += x
    # fundidos cortos para que no haya chasquidos y limitador suave
    f = int(0.04 * SR); env = np.ones(n); env[:f] = np.linspace(0, 1, f); env[-f:] = np.linspace(1, 0, f)
    st = np.stack([L, R], 1) * env[:, None]
    st = np.tanh(st * db(aj.get('volumen_general_db', 0))) * 0.89   # ganancia general + limitador suave
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())

if __name__ == '__main__':
    main()
