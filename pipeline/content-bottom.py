#!/usr/bin/env python3
# content-bottom.py <fig> <w>,<h>: misst via dump-boxes.js, wie tief der Inhalt reicht
import subprocess, sys, re
fig, size = sys.argv[1], sys.argv[2]
out = subprocess.run(["node", "dump-boxes.js", fig, size], capture_output=True, text=True, cwd="/home/ji/projects/articles/pipeline").stdout
mx = 0
for line in out.splitlines():
    m = re.search(r"y=(-?\d+) w=(\d+) h=(-?\d+)", line)
    if m:
        bottom = int(m.group(1)) + int(m.group(3))
        if bottom > mx: mx = bottom
print("content-bottom:", mx, "| fenster-h:", size.split(",")[1])
print("PASST" if mx <= int(size.split(",")[1]) - 30 else "ZU HOCH - Fenstergroesse erhoehen!")
