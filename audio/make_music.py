#!/usr/bin/env python3
"""Música original sintetizada con código (suave), para «De puerta en puerta».
  python3 audio/make_music.py  ->  audio/musica_1945.mp3 y audio/musica_2026.mp3
  1945: vals lento (3/4, 84 ppm) de piano «oom-pah-pah» con melodía sencilla, filtrado y con vaivén de gramófono.
  2026: pop suave y optimista (4/4, 100 ppm): colchón cálido, arpegio punteado, bajo y shaker muy discreto."""
import os, subprocess, wave
import numpy as np
A = os.path.dirname(os.path.abspath(__file__)); SR = 48000
rng = np.random.default_rng(7)
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def hz(n):  # 'C4', 'Bb3', 'F#5'
    b = NOTE[n[0]] + (1 if '#' in n else -1 if 'b' in n[1:-1] else 0)
    return 440 * 2 ** ((b + 12 * (int(n[-1]) + 1) - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def add(buf, x, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(x))
    if i < len(buf): buf[i:j] += g * x[:j - i]
def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))
def norm(x, p=0.9): return x * p / np.max(np.abs(x))
def piano(f, d, bright=1.0):
    t = tt(d); x = 0
    for h in range(1, 7): x = x + np.sin(2 * np.pi * f * h * t * (1 + 0.0004 * h)) / h ** (1.6 / bright) * np.exp(-t * (1.2 + 0.9 * h))
    return x * np.minimum(1, t / 0.004) * np.clip((d - t) / 0.08, 0, 1)
def pluck(f, d):
    t = tt(d); x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t) * np.exp(-t * 8)
    return x * np.exp(-t * 4.5) * np.minimum(1, t / 0.003)
def pad(fs, d):
    t = tt(d); x = 0
    for f in fs:
        for dt in (-0.004, 0, 0.004):
            ph = 2 * np.pi * f * (1 + dt) * t; x = x + (np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph))
    env = np.minimum(1, t / 0.6) * np.clip((d - t) / 0.6, 0, 1)
    return x * env
def write(path, x):
    y = np.clip(norm(x, 0.85), -1, 1); w = path[:-4] + '.wav'
    st = np.repeat((y * 32767).astype(np.int16)[:, None], 2, axis=1)
    with wave.open(w, 'wb') as f: f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(st.tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', w, '-c:a', 'libmp3lame', '-b:a', '192k', path], check=True); os.remove(w)

# ---------------- 1945: vals de gramófono ----------------
def vals():
    bpm = 84; beat = 60 / bpm; bar = 3 * beat
    prog = [('C3', ['E4', 'G4', 'C5']), ('A2', ['E4', 'A4', 'C5']), ('F2', ['F4', 'A4', 'C5']), ('G2', ['D4', 'G4', 'B4']),
            ('C3', ['E4', 'G4', 'C5']), ('E2', ['E4', 'G#4', 'B4']), ('A2', ['E4', 'A4', 'C5']), ('D3', ['F#4', 'A4', 'D5']),
            ('F2', ['F4', 'A4', 'C5']), ('G2', ['F4', 'G4', 'B4']), ('C3', ['E4', 'G4', 'C5']), ('G2', ['D4', 'G4', 'B4'])]
    mel = [['G5', 'E5', 'C5'], ['C5', None, 'E5'], ['F5', 'E5', 'D5'], ['D5', None, None],
           ['G5', 'E5', 'C5'], ['B4', 'D5', 'E5'], ['E5', 'D5', 'C5'], ['A4', None, 'B4'],
           ['C5', 'A4', 'F5'], ['F5', 'E5', 'D5'], ['C5', None, None], ['D5', None, None]]
    n = len(prog); d = n * bar * 2 + 1; out = np.zeros(int(d * SR))
    for rep in range(2):
        for i, (bs, ch) in enumerate(prog):
            t0 = (rep * n + i) * bar
            add(out, piano(hz(bs), bar * 0.9), t0, 0.55)
            for b in (1, 2):
                for c in ch: add(out, piano(hz(c), beat * 0.8), t0 + b * beat, 0.16)
            for k, m in enumerate(mel[i]):
                if m: add(out, piano(hz(m), beat * 1.6, 1.3), t0 + k * beat + 0.01, 0.32)
    # gramófono: vaivén de tono (wow), banda estrecha, crepitar suave
    t = tt(d); warp = t + 0.0025 * np.sin(2 * np.pi * 0.55 * t) / (2 * np.pi * 0.55)
    out = np.interp(warp * SR, np.arange(len(out)), out)
    out = band(out, 280, 3400) + 0.004 * band(rng.standard_normal(len(out)), 2000, 7000)
    return out
# ---------------- 2026: pop suave ----------------
def pop_suave():
    bpm = 100; beat = 60 / bpm; bar = 4 * beat
    prog = [('F2', ['F3', 'A3', 'C4'], ['F4', 'A4', 'C5', 'A4']), ('C3', ['E3', 'G3', 'C4'], ['E4', 'G4', 'C5', 'G4']),
            ('D3', ['D3', 'F3', 'A3'], ['D4', 'F4', 'A4', 'F4']), ('Bb2', ['D3', 'F3', 'Bb3'], ['D4', 'F4', 'Bb4', 'F4'])]
    mel = [['C5', None, 'A4', 'C5'], ['G5', None, 'E5', None], ['F5', None, 'D5', 'E5'], ['F5', None, None, None]]
    reps = 4; d = reps * 4 * bar + 1.5; out = np.zeros(int(d * SR))
    for r in range(reps):
        for i, (bs, chd, arp) in enumerate(prog):
            t0 = (r * 4 + i) * bar
            add(out, pad([hz(c) for c in chd], bar + 0.6), t0, 0.05)
            for b in (0, 2, 2.5): add(out, pluck(hz(bs), beat * 1.4), t0 + b * beat, 0.5)
            for k in range(8): add(out, pluck(hz(arp[k % 4]), beat), t0 + k * beat / 2, 0.22 if k % 2 == 0 else 0.15)
            if r >= 1:
                for k, m in enumerate(mel[i]):
                    if m: add(out, piano(hz(m), beat * 1.8, 1.4), t0 + k * beat, 0.22)
                for k in range(8):  # shaker muy suave
                    s = band(rng.standard_normal(int(0.05 * SR)), 5000, 11000) * np.exp(-tt(0.05) / 0.012)
                    add(out, s, t0 + k * beat / 2 + beat / 4, 0.05 if k % 2 else 0.03)
    return band(out, 40, 12000)

if __name__ == '__main__':
    write(os.path.join(A, 'musica_1945.mp3'), vals()); print('-> audio/musica_1945.mp3')
    write(os.path.join(A, 'musica_2026.mp3'), pop_suave()); print('-> audio/musica_2026.mp3')
