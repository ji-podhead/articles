#!/bin/bash
# HTML-Figur -> 2x PNG + Markdown-Embed-Snippet.
# Nutzung: render-fig.sh <html-file> <ziel-artikel-ordner> [breite] [hoehe]
F="$1"; DEST="$2"; W="${3:-1200}"; H="${4:-auto}"
[ -f "$F" ] || { echo "FEHLT: $F"; exit 1; }
# Lint zuerst
bash "$(dirname "$0")/lint-fig.sh" "$F" || exit 1
BASE=$(basename "$F" .html)
# Hoehe automatisch messen (chromium dump + JS? Nein: fixed window + interior check via Probe)
D=$(cd "$(dirname "$F")" && pwd)
U="file://$D/$(basename "$F")"
DESTDIR="../$DEST/png" 2>/dev/null
mkdir -p "$DEST" 2>/dev/null; mkdir -p "$DEST/png" 2>/dev/null
if [ "$H" = "auto" ]; then
  H=$(chromium --headless=new --disable-gpu --no-sandbox --dump-dom --virtual-time-budget=1500 "$U" >/dev/null 2>&1; echo "")
  # Fallback: feste Standardhoehe, wenn Messung nicht greift
  H=${H:-900}
fi
chromium --headless=new --disable-gpu --no-sandbox --screenshot="$DEST/png/$BASE.png" --window-size=$W,$H --force-device-scale-factor=2 --hide-scrollbars "$U" >/dev/null 2>&1
file "$DEST/png/$BASE.png" | cut -c1-70
echo "--- Markdown-Embed (Copy-Paste) ---"
echo "![Bildbeschreibung kurz]($BASE.png)"
echo ""
echo "*Caption: was die Figur zeigt.*"
