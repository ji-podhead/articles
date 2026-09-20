#!/usr/bin/env python3
# Globaler PNG-Check: Fehlerseiten (weiss) + Dark-Expectation fuer das House-Theme.
import glob, os, sys
os.chdir("/home/ji/projects/articles")
from PIL import Image
bad = []
dark_ok = 0; light_ok = 0; total = 0
for p in sorted(glob.glob("*/png/*.png")):
    try:
        im = Image.open(p).convert("RGB")
        px = list(im.resize((150, 75)).getdata())
        dark = sum(1 for r, g, b in px if r < 60 and g < 60 and b < 60) / len(px)
        white = sum(1 for r, g, b in px if r > 200 and g > 200 and b > 200) / len(px)
        colored = sum(1 for r, g, b in px if max(r, g, b) - min(r, g, b) > 45 and not (r > 235 and g > 235 and b > 235)) / len(px)
        total += 1
        if white > 0.9 and colored < 0.01:
            bad.append(p + " ERRORPAGE-VERDACHT (white=" + str(round(white, 2)) + ")")
        elif dark > 0.15:
            dark_ok += 1
        elif colored > 0.01 or white < 0.85:
            light_ok += 1
        else:
            bad.append(p + " UNKLASSIFIZIERT dark=" + str(round(dark, 2)) + " white=" + str(round(white, 2)))
    except Exception as e:
        bad.append(p + " ERR " + str(e))
print("total:", total, "| dark-theme:", dark_ok, "| light-theme:", light_ok, "| probleme:", len(bad))
for x in bad:
    print("PROBLEM:", x)
