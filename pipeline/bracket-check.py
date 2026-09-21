#!/usr/bin/env python3
import sys
from bs4 import BeautifulSoup
path = sys.argv[1]
soup = BeautifulSoup(open(path, encoding="utf-8").read(), "html.parser")
for tag in soup(["script", "style"]):
    tag.decompose()
out = []
for el in soup.find_all(["div", "span", "h1", "h2", "p"]):
    txt = el.get_text(" ", strip=True)
    if "]" in txt:
        out.append((el.name, txt[:80]))
print(path)
for name, txt in out:
    print("  ", name, "|", txt)
