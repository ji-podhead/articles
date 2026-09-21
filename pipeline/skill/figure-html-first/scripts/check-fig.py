#!/usr/bin/env python3
# Pixel-Check fuer eine Figur-PNG: dark/white-Fraktion + Groesse.
# Nutzung: check-fig.py <png-pfad>
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB")
px = list(im.resize((150, 75)).getdata())
dark = sum(1 for r, g, b in px if r < 60 and g < 60 and b < 60) / len(px)
white = sum(1 for r, g, b in px if r > 200 and g > 200 and b > 200) / len(px)
print(sys.argv[1], "| dark =", round(dark, 2), "| white =", round(white, 2), "|", im.size)
