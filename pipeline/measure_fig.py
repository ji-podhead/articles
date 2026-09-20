#!/usr/bin/env python3
import sys, os
from PIL import Image
CANVAS = (13, 17, 23)
def content_extent(path):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()
    bottom = 0
    right = 0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            c = px[x, y]
            if abs(c[0]-CANVAS[0]) > 12 or abs(c[1]-CANVAS[1]) > 12 or abs(c[2]-CANVAS[2]) > 12:
                if y > bottom: bottom = y
                if x > right: right = x
    return (w, h), bottom, right
def darkcheck(path):
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()
    dark = 0
    n = 0
    for i in range(5):
        for j in range(5):
            x = int(w * (0.1 + 0.2 * i))
            y = int(h * (0.1 + 0.2 * j))
            c = px[x, y]
            n += 1
            if sum(c) / 3 < 128: dark += 1
    return dark, n
if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "extent":
        for p in sys.argv[2:]:
            size, bottom, right = content_extent(p)
            print(os.path.basename(p), size, "bottom_css:", bottom // 2, "right_css:", right // 2)
    elif mode == "verify":
        for p in sys.argv[2:]:
            size, bottom, right = content_extent(p)
            dark, n = darkcheck(p)
            print(os.path.basename(p), size, "dark:", dark, "/", n, "bottom_css:", bottom // 2, "right_css:", right // 2)
