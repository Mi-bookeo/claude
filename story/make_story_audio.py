#!/usr/bin/env python3
"""Sonido de la story: música sintetizada (pizzicato juguetón, 112 bpm) + efectos sincronizados con la entrada de los textos.
  python3 story/make_story_audio.py   -> story/story_manana_rosa_con_audio.mp4 (imagen con -c:v copy)"""
import os, sys, subprocess
import numpy as np
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'audio'))
import make_audio as M   # reutiliza los sintetizadores del vídeo 03
SR, D = M.SR, 7.0
N = int(D * SR)
add, tt, norm = M.add, M.tt, M.norm

def pluck(f, d=0.45, bright=1.0):
    t = tt(d); x = 0
    for h in range(1, 7): x = x + np.sin(2 * np.pi * f * h * t) * np.exp(-t * (6 + 5 * h)) * bright ** (h - 1) / h
    return x * M.adsr(d, 0.003)
def bass(f, d=0.5):
    t = tt(d); return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t / 0.22) * M.adsr(d, 0.005)
def kick():
    t = tt(0.2); f = 50 + 90 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.08)
def hat():
    return M.band(M.noise(0.05), 6000, 12000) * M.edec(0.05, 0.012)
nt = lambda m: 440 * 2 ** ((m - 69) / 12)

def music():
    out = np.zeros(N); beat = 60 / 112; bar = 4 * beat
    chords = [(60, [60, 64, 67, 72]), (57, [57, 60, 64, 69]), (53, [53, 57, 60, 65]), (55, [55, 59, 62, 67])]
    pat = [0, 2, 1, 3, 2, 1, 3, 2]
    b = 0
    while b * bar < D:
        root, ch = chords[b % 4]
        t0 = b * bar
        for i in range(8):                                   # arpegio en corcheas
            add(out, pluck(nt(ch[pat[i]] + 12), 0.4), t0 + i * beat / 2, 0.22 if i % 2 else 0.3)
        for i in (0, 2): add(out, bass(nt(root - 24)), t0 + i * beat, 0.55)
        add(out, bass(nt(root - 17), 0.3), t0 + 3.5 * beat, 0.3)
        for i in range(4): add(out, kick(), t0 + i * beat, 0.5 if i % 2 == 0 else 0.25)
        for i in range(8): add(out, hat(), t0 + i * beat / 2 + (beat / 4 if i % 2 else 0), 0.12)
        b += 1
    out[:int(0.15 * SR)] *= np.linspace(0, 1, int(0.15 * SR))
    fo = int(0.8 * SR); out[-fo:] *= np.linspace(1, 0, fo)
    return norm(out, 0.5)

def sfx():
    fx = np.zeros(N)
    add(fx, M.whoosh(0.4), 0.0, 0.5)                          # entra la franja «Mañana:»
    add(fx, M.pop(380, 900, 0.1), 0.38, 0.6)
    for k in range(12):                                       # una palabra = un pop, cada vez más agudo
        add(fx, M.pop(500 + 40 * k, 1100 + 60 * k, 0.07), 0.75 + k * 0.11 + 0.05, 0.28)
    add(fx, M.ding(1568, 0.8), 2.24, 0.35)                    # 🥐
    t = tt(0.35); f = np.linspace(700, 1700, len(t))          # 👀 silbido de «mirada»
    add(fx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.35), 2.45, 0.22)
    for i, t0 in enumerate([2.45, 2.56]): add(fx, M.coin_clink(), t0, 0.12)   # destellos
    for i in range(10): add(fx, M.tick(i % 2 == 0), 2.6 + i * 0.4, 0.12)     # tic-tac de fondo: se le acaba el tiempo
    add(fx, M.ding(988, 0.5), 2.55, 0.2)                      # Rosa se preocupa
    add(fx, M.pop(300, 1500, 0.12), 4.62, 0.5)                # «!»
    add(fx, M.ding(1319, 0.9), 4.66, 0.3)
    return fx

mix = music() * 0.55 + sfx()
wav = os.path.join(ROOT, 'story', 'story_mezcla.wav'); M.write_wav(wav, norm(mix, 0.89))
video = os.path.join(ROOT, 'story', 'story_manana_rosa.mp4'); out = os.path.join(ROOT, 'story', 'story_manana_rosa_con_audio.mp4')
tmp = out.replace('.mp4', '.partial.mp4')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', video, '-i', wav, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
                '-af', 'loudnorm=I=-14:TP=-1:LRA=11,aresample=48000', '-c:a', 'aac', '-b:a', '192k', '-t', str(D), '-movflags', '+faststart', tmp], check=True)
os.replace(tmp, out); print('->', os.path.relpath(out, ROOT))
