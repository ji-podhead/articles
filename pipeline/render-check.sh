#!/bin/bash
# render-check.sh <figure> <hoehe> - lint + render 2x + pixel check
FIG="$1"; HGT="$2"
ART=/home/ji/projects/articles/agent-identity-firewalls
F="$ART/html/$FIG.html"
echo "=== $FIG (1200x$HGT) ==="
grep -qiE "position[[:space:]]*:[[:space:]]*(absolute|fixed|sticky)" "$F" && echo "LINT FAIL: absolute/fixed/sticky"
grep -qiE "z-index" "$F" && echo "LINT FAIL: z-index"
grep -qE "margin(-[a-z]+)?[[:space:]]*:[[:space:]]*-" "$F" && echo "LINT FAIL: negative margin"
grep -qE "transform[[:space:]]*:[[:space:]]*translate" "$F" && echo "LINT FAIL: translate"
cd "$ART/html" || exit 1
PATH=/snap/bin:$PATH chromium --headless=new --no-sandbox --disable-gpu --screenshot="$ART/png/$FIG.png" --window-size=1200,$HGT --force-device-scale-factor=2 --hide-scrollbars "file://$F" >/dev/null 2>&1
python3 /home/ji/projects/articles/pipeline/check-fig.py "$ART/png/$FIG.png"
