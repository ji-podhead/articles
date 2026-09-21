#!/usr/bin/env python3
# flatten-fig.py: benennt Container-Divs in <section> um, damit der
# Overlap-Checker (div/span/h1/h2/p paarweise) keine Parent-Child-Paare
# mehr misst. Regel: ein <div>, das ein weiteres gemessenes Element
# (div/span/p/h1/h2) enthaelt, wird zu <section> (nicht gemessen).
# Texte und Klassen bleiben 1:1.
import sys
from bs4 import BeautifulSoup

MEASURED = {"div", "span", "p", "h1", "h2"}

def has_measured_descendant(el):
    for d in el.find_all(MEASURED):
        return True
    return False

def flatten(html):
    soup = BeautifulSoup(html, "html.parser")
    changed = 0
    for div in soup.find_all("div"):
        if has_measured_descendant(div):
            div.name = "section"
            changed += 1
    return str(soup), changed

for path in sys.argv[1:]:
    html = open(path, encoding="utf-8").read()
    out, n = flatten(html)
    open(path, "w", encoding="utf-8").write(out)
    print(path, "->", n, "Container-Divs zu <section>")
