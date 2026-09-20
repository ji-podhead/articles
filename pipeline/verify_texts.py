#!/usr/bin/env python3
import json, sys, html, os

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

def collect_flex(spec):
    strings = []
    if spec.get("title"): strings.append(spec["title"])
    if spec.get("subtitle"): strings.append(spec["subtitle"])
    for c in spec.get("connect", []):
        if c.get("label"): strings.append(c["label"])
    def walk(n):
        if isinstance(n, dict):
            if n.get("title"): strings.append(n["title"])
            if n.get("text"): strings.append(n["text"])
            for l in n.get("lines", []):
                if l: strings.append(l)
            for k in n.get("children", []): walk(k)
    walk(spec.get("tree", {}))
    for ch in spec.get("chips", []):
        strings.append(ch if isinstance(ch, str) else ch.get("text", ""))
    return strings

PIPE = "/home/ji/projects/articles/pipeline"
pairs = [
    ("specs/agent-identity-firewalls-identity_chain.flex.json", "html/agent-identity-firewalls-identity_chain.html"),
    ("specs/agent-identity-firewalls-big_tech_approaches.flex.json", "html/agent-identity-firewalls-big_tech_approaches.html"),
    ("specs/agent-identity-firewalls-frameworks_landscape.flex.json", "html/agent-identity-firewalls-frameworks_landscape.html"),
    ("specs/agent-identity-firewalls-openai_incident.flex.json", "html/agent-identity-firewalls-openai_incident.html"),
    ("specs/agent-identity-firewalls-browser_security.flex.json", "html/agent-identity-firewalls-browser_security.html"),
    ("specs/agent-identity-firewalls-honest_gap.flex.json", "html/agent-identity-firewalls-honest_gap.html"),
    ("specs/agent-identity-firewalls-agent_firewall_stack.flex.json", "html/agent-identity-firewalls-agent_firewall_stack.html"),
    ("specs/ebpf-ebpf.flex.json", "html/ebpf-ebpf.html"),
    ("specs/ebpf-freeze_latter.flex.json", "html/ebpf-freeze_latter.html"),
    ("specs/ebpf-gap2.flex.json", "html/ebpf-gap2.html"),
    ("specs/ebpf-pipeline.flex.json", "html/ebpf-pipeline.html"),
    ("specs/ebpf-semantic_gap.flex.json", "html/ebpf-semantic_gap.html"),
    ("specs/ebpf-table_images.json", "html/ebpf-table_images.html"),
    ("specs/ebpf-table_landscape.json", "html/ebpf-table_landscape.html"),
]
fail = 0
for spec_path, html_path in pairs:
    spec = json.load(open(os.path.join(PIPE, spec_path)))
    content = open(os.path.join(PIPE, html_path), encoding="utf-8").read()
    if spec.get("mode") == "table":
        strings = list(spec["cols"])
        for row in spec["rows"]:
            for cell in row:
                if "; " in cell:
                    strings.extend([p.strip() for p in cell.split("; ")])
                else:
                    strings.append(cell)
    else:
        strings = collect_flex(spec)
    missing = [s for s in strings if esc(s) not in content and s not in content]
    if missing:
        fail = 1
        print("MISSING in", html_path)
        for m in missing: print("   -", m[:90])
    else:
        print("OK", html_path, "(" + str(len(strings)) + " strings)")
sys.exit(fail)
