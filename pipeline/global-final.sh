#!/bin/bash
cd /home/ji/projects/articles
echo "=== 1) GLOBAL LINT (alle html/ Ordner) ==="
PASS=0; FAIL=0
for f in */html/*.html; do
  case "$f" in *print*|.*) continue ;; esac
  if bash pipeline/lint-fig.sh "$f" >/dev/null 2>&1; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); echo "FAIL: $f"; fi
done
echo "LINT: $PASS OK / $FAIL FAIL"
echo
echo "=== 2) GLOBAL PIXEL (alle png/) ==="
python3 pipeline/pixel-sweep.py
echo
echo "=== 3) BLOGPOST-REFS (alle Artikel) ==="
MISS=0; TOT=0
for bp in */2026-*.md; do
  art=$(dirname "$bp")
  for ref in $(grep -ohE '\]\([^)]+\.(svg|png)\)' "$bp" 2>/dev/null | sed 's/](//; s/)//' | sort -u); do
    TOT=$((TOT+1))
    case "$ref" in
      /*|http*) continue ;;
      titel*|png/titel*) [ -f "$art/$ref" ] || { echo "FEHLT: $bp -> $ref"; MISS=$((MISS+1)); } ;;
      svg/*|png/*) [ -f "$art/$ref" ] || { echo "FEHLT: $bp -> $ref"; MISS=$((MISS+1)); } ;;
      *) [ -f "$art/$ref" ] || { echo "FEHLT: $bp -> $ref"; MISS=$((MISS+1)); } ;;
    esac
  done
done
echo "Refs: $TOT total, $MISS fehlen"
echo
echo "=== 4) Struktur-Bilanz ==="
echo "html-Figuren: $(ls */html/*.html 2>/dev/null | grep -v styles | grep -v print | wc -l)"
echo "SVG-Figuren:  $(ls */svg/*.svg 2>/dev/null | wc -l)"
echo "PNG-Figuren:  $(ls */png/*.png 2>/dev/null | wc -l)"
echo "Specs:        $(ls pipeline/specs/*.json 2>/dev/null | wc -l)"
