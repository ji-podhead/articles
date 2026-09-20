#!/usr/bin/env python3
import sys
from PIL import Image
CANVAS = (13, 17, 23)
def preview(path, cols=110, rows=60):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    # crop to content bottom first for aspect
    small = im.resize((cols, rows), Image.BILINEAR)
    px = small.load()
    out = []
    for y in range(rows):
        line = []
        for x in range(cols):
            r, g, b = px[x, y]
            if r > 120 and g > 90 and b < 100 and r - g > 40 and g > b:
                line.append("G")  # green
            elif r > 150 and g < 100 and b < 100:
                line.append("R")  # red
            elif b > 130 and r < 100 and g < 140:
                line.append("B")  # blue
            else:
                br = (r + g + b) / 3
                if br < 20: line.append(" ")
                elif br < 27: line.append(".")
                elif br < 45: line.append("-")
                elif br < 90: line.append("+")
                else: line.append("#")
        out.append("".join(line))
    return "\n".join(out)
for p in sys.argv[1:]:
    print("==== " + p + " ====")
    print(preview(p))
