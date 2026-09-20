#!/bin/bash
# HTML-Figur -> 2x PNG + Vektor-SVG (@page in pt) + Markdown-Embed.
# Nutzung: render-fig.sh <html-file> <ziel-artikel-ordner> [breite-px] [hoehe-px]
F="$1"; DEST="$2"; W="${3:-1200}"; H="${4:-900}"
[ -f "$F" ] || { echo "FEHLT: $F"; exit 1; }
bash "$(dirname "$0")/lint-fig.sh" "$F" || exit 1
BASE=$(basename "$F" .html)
D=$(cd "$(dirname "$F")" && pwd)
U="file://$D/$(basename "$F")"
mkdir -p "$DEST/png"
# 1) PNG (2x)
chromium --headless=new --disable-gpu --no-sandbox --screenshot="$DEST/png/$BASE.png" --window-size=$W,$H --force-device-scale-factor=2 --hide-scrollbars "$U" >/dev/null 2>&1
# 2) Vektor-SVG: @page in pt (px * 0.75), Print-HTML im Workspace (snap kann /tmp nicht)
WPT=$(awk "BEGIN{printf \"%.2f\", $W*0.75}")
HPT=$(awk "BEGIN{printf \"%.2f\", $H*0.75}")
PRINT="$D/.$BASE.print.html"
python3 - "$F" "$WPT" "$HPT" "$PRINT" <<'PYEOF'
import sys
t = open(sys.argv[1]).read()
inject = '<style>@page { size: ' + sys.argv[2] + 'pt ' + sys.argv[3] + 'pt; margin: 0 }</style>'
t = t.replace('</head>', inject + '</head>')
open(sys.argv[3], 'w').write(t)
PYEOF
UP="file://$PRINT"
PDF="$DEST/png/.$BASE.pdf"
chromium --headless=new --disable-gpu --no-sandbox --print-to-pdf="$PDF" --no-pdf-header-footer "$UP" >/dev/null 2>&1
if [ -f "$PDF" ]; then
  pdftocairo -svg "$PDF" "$DEST/$BASE.svg" 2>/dev/null && echo "SVG: $(stat -c%s "$DEST/$BASE.svg") bytes"
  rm -f "$PDF"
fi
rm -f "$PRINT"
# 3) Markdown-Embed
echo "--- Markdown-Embed ---"
echo "![Bildbeschreibung kurz]($BASE.png)"
echo ""
echo "*Caption: was die Figur zeigt.*"
