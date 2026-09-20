#!/bin/bash
# Figure-HTML-Linter v2: Overlap-Verbot + Einheits-Style + Asset-Pruefung.
# Nutzung: lint-fig.sh <file.html> [artikel-override.css] — Exit 1 bei Verstoss.
F="$1"; OV="$2"
DIR=$(cd "$(dirname "$F")" && pwd)
if [ ! -f "$F" ]; then echo "FEHLT: $F"; exit 1; fi
ERR=0
grep -qiE 'position\s*:\s*(absolute|fixed|sticky)' "$F" && { echo "VERBOTEN: position absolute/fixed/sticky"; ERR=1; }
grep -qiE 'z-index' "$F" && { echo "VERBOTEN: z-index"; ERR=1; }
grep -qE 'margin(-[a-z]+)?\s*:\s*-' "$F" && { echo "VERBOTEN: negative margin"; ERR=1; }
grep -qE 'transform\s*:\s*translate' "$F" && { echo "VERBOTEN: translate-Positionierung"; ERR=1; }
if ! grep -q 'styles/_house.css' "$F" && [ -z "$OV" ]; then
  echo "VERBOTEN: weder styles/_house.css noch Artikel-Override verlinkt"; ERR=1
fi
CLEAN=$(sed 's/&#x3B;//g; s/&#0*8594;//g' "$F")
ALLOWED="#0d1117|#161b22|#1c2128|#e6edf3|#8b949e|#6e7681|#30363d|#3fb950|#4493f8|#d29922|#f85149|#ffffff|#79c0ff|#c9d1d9|#0d0e15|#12131a|#34343c"
BADHEX=$(echo "$CLEAN" | grep -oiE '#[0-9a-f]{3,6}' | tr 'A-Z' 'a-z' | sort -u | grep -viE "^($ALLOWED)$" | tr '\n' ' ')
if [ -n "$BADHEX" ] && [ -z "$OV" ]; then
  echo "FARB-VERSTOSS (nicht in House-Palette): $BADHEX"; ERR=1
fi
if [ -n "$OV" ] && [ -f "$DIR/styles/$OV" ]; then
  grep -qiE 'position\s*:\s*(absolute|fixed|sticky)|z-index' "$DIR/styles/$OV" && { echo "VERBOTEN im Override: absolute/fixed/sticky/z-index"; ERR=1; }
fi
for src in $(grep -oE 'src="\.[^"]*\.(svg|png|jpg)"' "$F" | sed 's/src="//; s/"//'); do
  [ -f "$DIR/$src" ] || { echo "ASSET FEHLT: $src"; ERR=1; }
done
for href in $(grep -oE 'href="\.[^"]*\.(svg|png|jpg)"' "$F" | sed 's/href="//; s/"//'); do
  [ -f "$DIR/$href" ] || { echo "ASSET FEHLT: $href"; ERR=1; }
done
if [ "$ERR" = "0" ]; then echo "LINT OK: $F"; else echo "LINT FAIL: $F"; exit 1; fi
