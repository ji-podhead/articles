#!/bin/bash
# HTML-Figur (in <artikel>/html/) -> png/<name>.png (2x) + svg/<name>.svg (Vektor) + Embed-Snippet.
# Nutzung: render-fig.sh <artikel-ordner> <name> [breite] [hoehe]
#   Figur-Quelle: <artikel>/html/<name>.html
#   Outputs:      <artikel>/png/<name>.png, <artikel>/svg/<name>.svg
ART="$1"; NAME="$2"; W="${3:-1200}"; H="${4:-900}"
F="$ART/html/$NAME.html"
[ -f "$F" ] || { echo "FEHLT: $F"; exit 1; }
bash "$(dirname "$0")/lint-fig.sh" "$F" || exit 1
D=$(cd "$ART/html" && pwd)
U="file://$D/$NAME.html"
mkdir -p "$ART/png" "$ART/svg"
# 1) PNG (2x)
chromium --headless=new --disable-gpu --no-sandbox --screenshot="$ART/png/$NAME.png" --window-size=$W,$H --force-device-scale-factor=2 --hide-scrollbars "$U" >/dev/null 2>&1
# 2) Vektor-SVG: Print-CSS mit exakter Seitengroesse (pt = px * 0.75)
WPT=$(awk "BEGIN{printf \"%.2f\", $W*0.75}")
HPT=$(awk "BEGIN{printf \"%.2f\", $H*0.75}")
PRINT="$ART/html/.$NAME.print.html"
python3 - "$F" "$WPT" "$HPT" "$PRINT" <<'PYEOF'
import sys
t = open(sys.argv[1]).read()
inject = '<style>@page { size: ' + sys.argv[2] + 'pt ' + sys.argv[3] + 'pt; margin: 0 }</style>'
t = t.replace('</head>', inject + '</head>')
open(sys.argv[3], 'w').write(t)
PYEOF
UP="file://$PRINT"
PDF="$ART/.$NAME.pdf"
chromium --headless=new --disable-gpu --no-sandbox --print-to-pdf="$PDF" --no-pdf-header-footer "$UP" >/dev/null 2>&1
if [ -f "$PDF" ]; then
  pdftocairo -svg "$PDF" "$ART/svg/$NAME.svg" 2>/dev/null && echo "SVG: $(stat -c%s "$ART/svg/$NAME.svg") bytes"
  rm -f "$PDF"
fi
rm -f "$PRINT"
# 3) Embed-Snippet
echo "--- Embed ---"
echo "![Bildbeschreibung](svg/$NAME.svg)"
echo ""
echo "*Caption: was die Figur zeigt.*"
