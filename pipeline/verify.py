#!/usr/bin/env python3
import sys
import os
import glob
import re
import zlib
import struct
import json

def verify_svg_and_png(svg_path, png_path):
    if not os.path.exists(svg_path):
        return False, f"SVG missing: {svg_path}"
    if not os.path.exists(png_path):
        return False, f"PNG missing: {png_path}"

    with open(svg_path, "r", encoding="utf-8") as f:
        svg_content = f.read()

    # Get width & height from SVG header
    w_match = re.search(r'width="([0-9]+)"', svg_content)
    h_match = re.search(r'height="([0-9]+)"', svg_content)
    if not w_match or not h_match:
        return False, f"Could not parse SVG header dimensions in {svg_path}"

    svg_w = int(w_match.group(1))
    svg_h = int(h_match.group(1))

    # Read PNG dimensions & pixels
    with open(png_path, "rb") as f:
        png_bytes = f.read()

    if png_bytes[:8] != b"\x89PNG\r\n\x1a\n":
        return False, f"Invalid PNG header: {png_path}"

    png_w, png_h = struct.unpack(">II", png_bytes[16:24])
    if png_w != svg_w * 2 or png_h != svg_h * 2:
        return False, f"Dimension mismatch in {png_path}: expected ({svg_w*2}x{svg_h*2}), got ({png_w}x{png_h})"

    # Decompress IDAT for 5x5 pixel grid check
    pos = 8
    idat = b""
    while pos < len(png_bytes):
        length, chunk_type = struct.unpack(">I4s", png_bytes[pos:pos+8])
        if chunk_type == b"IDAT":
            idat += png_bytes[pos+8:pos+8+length]
        pos += 12 + length

    try:
        decompressed = zlib.decompress(idat)
    except Exception as e:
        return False, f"Failed to decompress PNG IDAT in {png_path}: {e}"

    bpp = 4 if len(decompressed) >= png_h * (1 + png_w * 4) else 3
    stride = 1 + png_w * bpp

    samples = []
    for gy in range(1, 6):
        py = int(png_h * gy / 6)
        line_start = py * stride
        for gx in range(1, 6):
            px = int(png_w * gx / 6)
            idx = line_start + 1 + px * bpp
            r, g, b = decompressed[idx:idx+3]
            samples.append((r, g, b))

    white_count = sum(1 for r, g, b in samples if r > 200 and g > 200 and b > 200)
    dark_count = sum(1 for r, g, b in samples if r < 60 and g < 60 and b < 60)

    if white_count > 20:
        return False, f"5x5 grid check failed in {png_path}: near 100% white ({white_count}/25 white pixels)"

    return True, f"OK ({png_w}x{png_h}, dark={dark_count}/25)"

if __name__ == "__main__":
    if len(sys.argv) > 2:
        ok, msg = verify_svg_and_png(sys.argv[1], sys.argv[2])
        print(f"{sys.argv[1]}: {msg}")
        sys.exit(0 if ok else 1)
    else:
        print("Usage: python3 verify.py <svg_path> <png_path>")
