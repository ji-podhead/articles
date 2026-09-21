import subprocess, difflib
from bs4 import BeautifulSoup
def textof(html):
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style"]):
        tag.decompose()
    parts = []
    for t in soup.find_all(string=True):
        s = " ".join(t.split())
        if s: parts.append(s)
    return parts
import os
os.chdir("/home/ji/projects/articles")
for fig in ["big_tech_approaches", "frameworks_landscape", "agent_firewall_stack", "browser_security", "openai_incident", "honest_gap"]:
    old = subprocess.run(["git", "show", "HEAD:agent-identity-firewalls/html/%s.html" % fig], capture_output=True, text=True).stdout
    new = open("agent-identity-firewalls/html/%s.html" % fig, encoding="utf-8").read()
    o, n = textof(old), textof(new)
    diff = list(difflib.unified_diff(o, n, lineterm=""))
    print(fig, ":", "TEXTS IDENTICAL" if not diff else "DIFF %d lines" % len(diff))
    if diff:
        for d in diff[:12]: print("   ", d)
