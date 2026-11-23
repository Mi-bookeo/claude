import base64, sys, os
from PIL import Image
import numpy as np, cv2

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
CH = "/home/claude/char/"
RED = "#C81E1E"
DARK = "#2B1010"
CREAM = "#FFF6EE"
W, H = 1080, 1350

def b64(path, mime="image/png"):
    return f"data:{mime};base64," + base64.b64encode(open(path, "rb").read()).decode()

LOGO_HEAD = b64("/home/claude/outM/escaparate-logo-cabecera.svg", "image/svg+xml")
LOGO_VERT = b64("/home/claude/outM/escaparate-logo-vertical-blanco.svg", "image/svg+xml")

# --- personajes: bbox del contenido y zona blanca (cartel/pantalla)
info = {}
for n in ["maria_cartel", "maria_movil", "maria_senalando", "maria_sonriendo", "maria_sorprendida",
          "pedro_cartel", "pedro_senalando", "pedro_movil", "pedro_sonriendo", "pedro_sorprendido"]:
    a = np.array(Image.open(CH + n + ".png"))
    bb = cv2.boundingRect((a[..., 3] > 10).astype(np.uint8))
    white = ((a[..., 3] == 255) & (a[..., :3].min(axis=2) >= 250)).astype(np.uint8)
    num, lab, st, _ = cv2.connectedComponentsWithStats(white, connectivity=4)
    zone = None
    for i in range(1, num):
        x, y, w, h, ar = st[i]
        if ar > 60000 and (zone is None or ar > zone[4]):
            zone = (int(x), int(y), int(w), int(h), int(ar))
    info[n] = dict(bb=bb, zone=zone, uri=b64(CH + n + ".png"))

def place(n, s, xc, yb):
    """Devuelve (svg, mapa) colocando el personaje con el centro de su contenido en xc y los pies en yb."""
    bx, by, bw, bh = info[n]["bb"]
    tx = xc - (bx + bw / 2) * s
    ty = yb - (by + bh) * s
    svg = f'<image href="{info[n]["uri"]}" x="0" y="0" width="1500" height="1875" transform="translate({tx:.1f} {ty:.1f}) scale({s})"/>'
    z = info[n]["zone"]
    zone = None
    if z:
        zone = (tx + z[0] * s, ty + z[1] * s, z[2] * s, z[3] * s)
    return svg, zone

def text(x, y, s, size, fill, weight=700, anchor="middle", extra=""):
    s = s.replace("&", "&amp;")
    return (f'<text x="{x}" y="{y}" font-family="Poppins" font-weight="{weight}" font-size="{size}" '
            f'fill="{fill}" text-anchor="{anchor}" {extra}>{s}</text>')

def wrap(doc):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'viewBox="0 0 {W} {H}" width="{W}" height="{H}"><rect width="{W}" height="{H}" fill="{RED}"/>{doc}</svg>')

def date_tag(cx, cy, rot, l1, l2):
    return f"""<g transform="translate({cx} {cy}) rotate({rot})">
<path d="M-150 -78 H150 Q166 -78 166 -62 V62 Q166 78 150 78 H-150 Q-166 78 -166 62 V-62 Q-166 -78 -150 -78 Z" fill="#FFFFFF" stroke="{DARK}" stroke-width="7"/>
<circle cx="-128" cy="0" r="14" fill="{RED}" stroke="{DARK}" stroke-width="5"/>
{text(18, 14, l1, 68, RED)}{text(18, 56, l2, 30, DARK, 700)}
</g>"""

def bubble(x, y, w, h, tail_x, tail_y, lines, size=46):
    t = ""
    ty0 = y + h / 2 - (len(lines) - 1) * size * 0.55 + size * 0.34
    for i, l in enumerate(lines):
        t += text(x + w / 2, round(ty0 + i * size * 1.15), l, size, DARK)
    return f"""<path d="M{x+30} {y} H{x+w-30} Q{x+w} {y} {x+w} {y+30} V{y+h-30} Q{x+w} {y+h} {x+w-30} {y+h} H{x+110} L{x-10} {y+h+50} L{x+50} {y+h} H{x+30} Q{x} {y+h} {x} {y+h-30} V{y+30} Q{x} {y} {x+30} {y} Z" fill="#FFFFFF" stroke="{DARK}" stroke-width="7" stroke-linejoin="round"/>{t}"""


def plaza():
    d = "#A81414"
    g = f'<g fill="{d}">'
    # edificios
    bl = [(0,980,150,370),(150,900,130,450),(280,1010,120,340),(690,1000,130,350),(820,930,120,420),(940,990,140,360)]
    for x,y,w,h in bl:
        g += f'<rect x="{x}" y="{y}" width="{w}" height="{h}"/>'
        for i in range(2):
            for j in range(4):
                wx = x+22+i*(w-60)/1; wy = y+30+j*70
                g += f'<rect x="{wx:.0f}" y="{wy}" width="22" height="38" rx="11" fill="#C81E1E"/>'
    # torre con aguja (centro-derecha)
    g += f'<rect x="440" y="800" width="110" height="550"/><path d="M432 800 L495 640 L558 800 Z"/>'
    g += '<rect x="486" y="600" width="18" height="50"/>'
    g += f'<rect x="478" y="850" width="34" height="60" rx="17" fill="#C81E1E"/>'
    g += f'<rect x="400" y="1180" width="190" height="170"/>'
    g += '</g>'
    return g

slides = {}

# ---------- 1. PORTADA ----------
ch, zone = place("maria_cartel", 0.66, 520, 1318)
zx, zy, zw, zh = zone
cover = plaza() + f'<image href="{LOGO_HEAD}" x="{(W-470)/2}" y="36" width="470" height="154"/>'
cover += ch
cover += text(zx + zw / 2, zy + zh * 0.47, "OFERTAS", 108, RED)
cover += text(zx + zw / 2, zy + zh * 0.47 + 62, "DE ESTA SEMANA", 50, DARK)
cover += date_tag(820, 330, 7, "23 – 29", "NOVIEMBRE")
cover += text(1040, 1300, "Desliza  →", 32, "#FFFFFF", 700, "end")
slides["1_portada"] = cover

# ---------- 2 y 3. OFERTAS ----------
def offer_slide(char, bub, bub_lines, shop, title, disc, until, idx):
    s = f'<image href="{LOGO_HEAD}" x="30" y="22" width="330" height="108"/>'
    s += text(1040, 92, f"OFERTA {idx} DE 2", 30, "#FFFFFF", 700, "end")
    s += f'<rect x="60" y="150" width="960" height="660" rx="36" fill="#FFFFFF" stroke="{DARK}" stroke-width="7"/>'
    s += f'<rect x="92" y="182" width="896" height="330" rx="22" fill="#EFEFEF" stroke="#BDBDBD" stroke-width="3" stroke-dasharray="14 10"/>'
    s += text(540, 360, "FOTO DEL PRODUCTO", 38, "#9A9A9A")
    s += text(540, 405, "(la de la web)", 28, "#9A9A9A", 400)
    s += f'<g transform="translate(900 515) rotate(-9)"><circle r="88" fill="{RED}" stroke="#FFFFFF" stroke-width="9"/>{text(0, 20, disc, 56, "#FFFFFF")}</g>'
    s += text(92, 612, title, 54, DARK, 700, "start")
    s += text(92, 666, shop, 34, RED, 700, "start")
    s += f'<rect x="92" y="700" width="270" height="64" rx="32" fill="#FDE3E3"/>' + text(227, 743, until, 30, RED)
    c, _ = place(char, 0.29 if char.startswith("pedro") else 0.29, 215, 1325)
    s += c
    s += bubble(400, 900, 620, 200, 0, 0, bub_lines)
    s += text(710, 1250, "escaparatetudela.es", 48, "#FFFFFF")
    s += text(710, 1296, "Todas las ofertas de la ciudad", 28, "#FFFFFF", 400)
    return s

slides["2_oferta"] = offer_slide("pedro_senalando", None, ["¡Mira esta", "oferta!"], "NOMBRE DEL COMERCIO",
                                "TÍTULO DE LA OFERTA", "-20 %", "Hasta el 30/11", 1)
slides["3_oferta"] = offer_slide("maria_senalando", None, ["¡Y esta", "también!"], "NOMBRE DEL COMERCIO",
                                "TÍTULO DE LA OFERTA", "2x1", "¡Termina hoy!", 2)

# ---------- 4. CIERRE ----------
ch, zone = place("maria_movil", 0.64, 540, 1322)
zx, zy, zw, zh = zone
end = text(540, 130, "TODAS LAS OFERTAS", 74, "#FFFFFF") + text(540, 214, "DE TUDELA, EN TU MÓVIL", 58, "#FFFFFF")
end += ch
# pantalla del movil = maqueta de la web
lw = zw * 0.88
end += f'<image href="{LOGO_VERT}" x="{zx + (zw - lw)/2}" y="{zy + 8}" width="{lw}" height="{lw*1.08}"/>'
end += f'<rect x="{zx+zw*0.1}" y="{zy+zh*0.70}" width="{zw*0.8}" height="{zh*0.11}" rx="12" fill="#FDE3E3"/>'
end += f'<rect x="{zx+zw*0.1}" y="{zy+zh*0.84}" width="{zw*0.8}" height="{zh*0.11}" rx="12" fill="#FDE3E3"/>'
# CTA a los lados
end += f'<rect x="40" y="520" width="270" height="170" rx="26" fill="#FFFFFF" stroke="{DARK}" stroke-width="7"/>'
end += text(175, 590, "escaparate", 38, RED) + text(175, 636, "tudela.es", 38, RED) + text(175, 672, "enlace en la bio", 24, DARK, 400)
end += f'<rect x="770" y="760" width="270" height="190" rx="26" fill="#25D366" stroke="{DARK}" stroke-width="7"/>'
end += text(905, 828, "Canal de", 36, "#0B3D1E") + text(905, 872, "WhatsApp", 40, "#0B3D1E") + text(905, 920, "también en la bio", 24, "#0B3D1E", 400)
slides["4_cierre"] = end

for n, doc in slides.items():
    open(f"{OUT}/{n}.svg", "w").write(wrap(doc))
print("ok", list(slides))
